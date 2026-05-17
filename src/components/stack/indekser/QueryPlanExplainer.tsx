import { useMemo, useState } from "react";

/**
 * QueryPlanExplainer — vis hvordan optimisten velger mellom plan-noder.
 *
 * 5 forhåndsdefinerte queries. For hver: brukeren kan toggle indekser ON/OFF
 * og se hvilken plan optimisten ville valgt. Vi viser kostnad-estimat (forenklet),
 * og forklarer hvorfor planen ble valgt (seq scan vs index scan vs index-only
 * vs bitmap scan).
 *
 * Kost-modell (svært forenklet, pedagogisk):
 *   seq_scan        = rows * 1
 *   index_scan      = log2(rows) + matching * 2  (2 for indeks-fetch + heap-fetch)
 *   index_only_scan = log2(rows) + matching * 1  (ingen heap-fetch)
 *   bitmap_scan     = rows / 8 + matching * 1.2  (bitmap-bygg + ordnet heap-fetch)
 */

type IndexId = "pk_id" | "idx_status" | "idx_status_amount" | "idx_email_hash";

type ScenarioId = "eq_status" | "range_amount" | "covered" | "low_card" | "join_eq";

type Scenario = {
  id: ScenarioId;
  title: string;
  sql: string;
  rows: number;
  matching: number;
  // Hvilke indekser er kandidater for denne queryen (resten er ubrukelige)
  candidates: Partial<
    Record<IndexId, { kind: "btree" | "hash" | "bitmap" | "covered"; matchingOverride?: number }>
  >;
  notes: string;
};

const INDEX_INFO: Record<IndexId, { name: string; cols: string; type: "btree" | "hash" }> = {
  pk_id: { name: "pk_id", cols: "(id) PRIMARY KEY", type: "btree" },
  idx_status: { name: "idx_status", cols: "(status)", type: "btree" },
  idx_status_amount: {
    name: "idx_status_amount",
    cols: "(status, amount) INCLUDE (id, created_at)",
    type: "btree",
  },
  idx_email_hash: { name: "idx_email_hash", cols: "(email) USING hash", type: "hash" },
};

const SCENARIOS: Scenario[] = [
  {
    id: "eq_status",
    title: "Likhet på status (medium kardinalitet)",
    sql: "SELECT * FROM orders WHERE status = 'paid';",
    rows: 100000,
    matching: 12000,
    candidates: {
      idx_status: { kind: "btree" },
      idx_status_amount: { kind: "btree" },
    },
    notes:
      "12 % av radene matcher → optimisten vurderer bitmap-scan (samler først alle rad-pekere, så ordnet heap-fetch) som ofte slår plain index scan ved mange treff.",
  },
  {
    id: "range_amount",
    title: "Range etter status + amount",
    sql: "SELECT * FROM orders WHERE status = 'paid' AND amount > 5000;",
    rows: 100000,
    matching: 800,
    candidates: {
      idx_status: { kind: "btree" },
      idx_status_amount: { kind: "btree" },
    },
    notes:
      "idx_status_amount kan filtrere på begge kolonnene i indeksen før heap-fetch. idx_status filtrerer bare status, så amount-sjekk skjer som Filter etter index scan.",
  },
  {
    id: "covered",
    title: "Covered query (alle kolonner i indeksen)",
    sql: "SELECT id, created_at FROM orders WHERE status = 'paid';",
    rows: 100000,
    matching: 12000,
    candidates: {
      idx_status_amount: { kind: "covered" },
      idx_status: { kind: "btree" },
    },
    notes:
      "Alle SELECT-kolonner ligger som INCLUDE i idx_status_amount → Index Only Scan, ingen heap-fetch. Stort hopp ned i I/O.",
  },
  {
    id: "low_card",
    title: "Lav-kardinalitet — leser nesten alt",
    sql: "SELECT * FROM orders WHERE status IN ('paid','shipped','refunded');",
    rows: 100000,
    matching: 80000,
    candidates: {
      idx_status: { kind: "btree" },
    },
    notes:
      "80 % av radene matcher → seq scan slår alle indekser. Optimisten vil bevisst velge Seq Scan; å bruke en indeks ville bety random I/O for 80 000 rader.",
  },
  {
    id: "join_eq",
    title: "Likhet på email (hash kandidat)",
    sql: "SELECT * FROM orders WHERE email = 'kari@example.no';",
    rows: 100000,
    matching: 1,
    candidates: {
      idx_email_hash: { kind: "hash" },
    },
    notes:
      "Hash-indeks gjør O(1) bucket-lookup → 1 sammenligning. B-tree ville krevd log₂(100k) ≈ 17 sammenligninger. Begge er kjapp; hash vinner marginalt på pure equality.",
  },
];

type Plan = {
  kind: "Seq Scan" | "Index Scan" | "Index Only Scan" | "Bitmap Heap Scan" | "Hash Index Scan";
  cost: number;
  estRows: number;
  using?: string;
  rationale: string;
};

function computePlans(s: Scenario, enabled: Set<IndexId>): Plan[] {
  const plans: Plan[] = [];

  // Seq scan alltid en mulighet
  plans.push({
    kind: "Seq Scan",
    cost: s.rows,
    estRows: s.matching,
    rationale: `Leser alle ${s.rows.toLocaleString()} rader.`,
  });

  for (const [iid, info] of Object.entries(s.candidates) as [
    IndexId,
    { kind: string; matchingOverride?: number },
  ][]) {
    if (!enabled.has(iid)) continue;
    const match = info.matchingOverride ?? s.matching;
    if (info.kind === "hash") {
      plans.push({
        kind: "Hash Index Scan",
        cost: 1 + match * 2,
        estRows: match,
        using: iid,
        rationale: `hash(verdi) → bucket. O(1) bucket-lookup, så ${match} heap-fetch.`,
      });
    } else if (info.kind === "covered") {
      plans.push({
        kind: "Index Only Scan",
        cost: Math.log2(s.rows) + match * 1,
        estRows: match,
        using: iid,
        rationale: `Alle SELECT-kolonner finnes i indeksen → ingen heap-fetch (kun visibility-map).`,
      });
    } else {
      // btree variants — vurder bitmap vs index scan
      const indexScanCost = Math.log2(s.rows) + match * 2;
      // bitmap er god når match er medium-stor andel
      const bitmapCost = s.rows / 12 + match * 1.2;
      if (match > 5000 && match < s.rows * 0.5) {
        plans.push({
          kind: "Bitmap Heap Scan",
          cost: bitmapCost,
          estRows: match,
          using: iid,
          rationale: `Bygger bitmap av matchede rad-pekere først, så ordnet (sekvensiell) heap-fetch — bedre random-I/O for mange treff.`,
        });
      }
      plans.push({
        kind: "Index Scan",
        cost: indexScanCost,
        estRows: match,
        using: iid,
        rationale: `Naviger B-tree (≈ log₂(${s.rows.toLocaleString()}) sammenligninger), så ${match} heap-fetch.`,
      });
    }
  }
  return plans;
}

function chooseWinner(plans: Plan[]): Plan {
  return [...plans].sort((a, b) => a.cost - b.cost)[0];
}

export function QueryPlanExplainer() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("eq_status");
  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
  const [enabled, setEnabled] = useState<Set<IndexId>>(
    () => new Set(Object.keys(scenario.candidates) as IndexId[]),
  );

  const plans = useMemo(() => computePlans(scenario, enabled), [scenario, enabled]);
  const winner = useMemo(() => chooseWinner(plans), [plans]);

  const setScen = (id: ScenarioId) => {
    setScenarioId(id);
    const s = SCENARIOS.find((x) => x.id === id)!;
    setEnabled(new Set(Object.keys(s.candidates) as IndexId[]));
  };

  const toggleIndex = (iid: IndexId) => {
    setEnabled((e) => {
      const ne = new Set(e);
      if (ne.has(iid)) ne.delete(iid);
      else ne.add(iid);
      return ne;
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <h3 className="font-semibold mb-3">Query Plan Explainer (EXPLAIN)</h3>
      <p className="text-xs text-muted-foreground mb-3">
        Optimisten estimerer kost for hver mulig plan og velger den billigste. Toggle indeksene
        under av/på og se hvordan valget skifter.
      </p>

      <div className="flex flex-wrap gap-2 mb-3">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setScen(s.id)}
            className={`text-xs px-2.5 py-1.5 rounded border ${
              scenarioId === s.id
                ? "border-brand bg-brand/10 text-brand"
                : "border-border hover:bg-muted"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="rounded bg-background border border-border p-3 mb-3">
        <div className="text-xs text-muted-foreground mb-1">Query</div>
        <pre className="font-mono text-sm">{scenario.sql}</pre>
        <div className="text-xs text-muted-foreground mt-2">
          Tabellstørrelse: {scenario.rows.toLocaleString()} rader · estimerte treff:{" "}
          {scenario.matching.toLocaleString()} (
          {((scenario.matching / scenario.rows) * 100).toFixed(1)}%)
        </div>
      </div>

      <div className="mb-3">
        <div className="text-xs font-semibold mb-2">Tilgjengelige indekser (toggle ON/OFF)</div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(scenario.candidates) as IndexId[]).map((iid) => {
            const info = INDEX_INFO[iid];
            const on = enabled.has(iid);
            return (
              <button
                key={iid}
                type="button"
                onClick={() => toggleIndex(iid)}
                className={`text-xs px-2.5 py-1.5 rounded border font-mono transition-colors ${
                  on
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border bg-muted/30 text-muted-foreground line-through"
                }`}
              >
                {info.name} {info.cols}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold">Vurderte planer (sortert etter kost)</div>
        {[...plans]
          .sort((a, b) => a.cost - b.cost)
          .map((p, i) => {
            const isWinner = p === winner;
            return (
              <div
                key={i}
                className={`rounded-lg border p-3 ${
                  isWinner ? "border-brand/40 bg-brand/5" : "border-border bg-background"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm">{p.kind}</span>
                  {p.using && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      using {p.using}
                    </span>
                  )}
                  {isWinner && (
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand text-white">
                      valgt av optimisten
                    </span>
                  )}
                  <span className="ml-auto text-xs font-mono text-muted-foreground">
                    cost ≈ {Math.round(p.cost).toLocaleString()} · rows ≈{" "}
                    {p.estRows.toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">{p.rationale}</p>
              </div>
            );
          })}
      </div>

      <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
        <strong>Hvorfor denne planen?</strong>
        <p className="mt-1 text-muted-foreground">{scenario.notes}</p>
      </div>

      <div className="mt-3 rounded bg-background border border-border p-3">
        <div className="text-xs text-muted-foreground mb-1">EXPLAIN-output (forenklet)</div>
        <pre className="font-mono text-xs whitespace-pre-wrap">
          {`${winner.kind}${winner.using ? ` using ${winner.using}` : ""}\n` +
            `  (cost=0.00..${winner.cost.toFixed(2)} rows=${winner.estRows} width=64)\n` +
            (winner.using
              ? `  Index Cond: ${condFor(scenario)}\n`
              : `  Filter: ${condFor(scenario)}\n`) +
            `Planning Time: 0.123 ms\nExecution Time: ${(winner.cost / 1000).toFixed(3)} ms`}
        </pre>
      </div>
    </div>
  );
}

function condFor(s: Scenario): string {
  // Bare et illustrativ uttrekk fra SQL
  const m = s.sql.match(/WHERE\s+(.*?);/i);
  return m ? m[1] : "";
}
