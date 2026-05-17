import { useMemo, useState } from "react";
import { Play } from "lucide-react";

/**
 * IndexTypeComparison — kjør samme query mot 4 indeks-typer side-om-side.
 *
 * 4 typer:
 *  - Ingen indeks (seq scan / table scan)
 *  - B-tree
 *  - Hash
 *  - Bitmap
 *
 * 3 queries:
 *  - Likhet:    WHERE x = 42
 *  - Range:     WHERE x BETWEEN 30 AND 60
 *  - Prefix:    WHERE name LIKE 'abc%' (for name-kolonne)
 *
 * For hver kjøring: animér disk-tilgang-mønster, tell antall disk-leser,
 * og vis hvor pekerne går. Vi bruker en fast tabell på 100 rader, x ∈ [1..100],
 * name = bokstavkombinasjoner. Bitmap demonstreres med en lav-kardinalitet
 * kolonne (status ∈ {A, B, C}) i en egen panel.
 */

type IndexType = "none" | "btree" | "hash" | "bitmap";
type QueryKind = "equal" | "range" | "prefix";

const ROWS = 100;

type Row = { id: number; x: number; name: string; status: "A" | "B" | "C" };

// Bygg tabellen med en blanding av verdier
const DATA: Row[] = (() => {
  const arr: Row[] = [];
  // pseudo-tilfeldig men deterministisk
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
  for (let i = 1; i <= ROWS; i++) {
    const x = Math.floor(rand() * 100) + 1;
    // 3-bokstavs prefiks fra a..z
    const a = String.fromCharCode(97 + Math.floor(rand() * 26));
    const b = String.fromCharCode(97 + Math.floor(rand() * 26));
    const c = String.fromCharCode(97 + Math.floor(rand() * 26));
    const d = String.fromCharCode(97 + Math.floor(rand() * 26));
    const e = String.fromCharCode(97 + Math.floor(rand() * 26));
    const name = `${a}${b}${c}${d}${e}`;
    const stat = (["A", "B", "C"] as const)[Math.floor(rand() * 3)];
    arr.push({ id: i, x, name, status: stat });
  }
  // Forsikre at minst én rad har x=42 så likhets-demo finner noe
  arr[10].x = 42;
  // Forsikre noen rader matcher 'abc%'
  arr[3].name = "abcde";
  arr[27].name = "abcxy";
  return arr;
})();

// "Pages": vi simulerer at 10 rader = 1 disk-page. Total = 10 pages.
const PAGE_SIZE = 10;
const TOTAL_PAGES = Math.ceil(ROWS / PAGE_SIZE);

type Plan = {
  label: string;
  pagesRead: number[]; // hvilke pages som faktisk hentes
  comparisons: number;
  resultRows: number[];
  notes: string[];
  applicable: boolean;
  reason?: string;
};

function planSeqScan(query: {
  kind: QueryKind;
  eq?: number;
  lo?: number;
  hi?: number;
  prefix?: string;
}): Plan {
  const result: number[] = [];
  for (const r of DATA) {
    if (query.kind === "equal" && r.x === query.eq) result.push(r.id);
    if (query.kind === "range" && r.x >= query.lo! && r.x <= query.hi!) result.push(r.id);
    if (query.kind === "prefix" && r.name.startsWith(query.prefix!)) result.push(r.id);
  }
  return {
    label: "Seq Scan (ingen indeks)",
    pagesRead: Array.from({ length: TOTAL_PAGES }, (_, i) => i),
    comparisons: ROWS,
    resultRows: result,
    notes: [`Leser alle ${TOTAL_PAGES} pages = ${ROWS} rader.`, "Cost = O(n)."],
    applicable: true,
  };
}

function planBTree(query: {
  kind: QueryKind;
  eq?: number;
  lo?: number;
  hi?: number;
  prefix?: string;
}): Plan {
  if (query.kind === "equal") {
    const matching = DATA.filter((r) => r.x === query.eq).map((r) => r.id);
    const pages = uniq(matching.map((id) => Math.floor((id - 1) / PAGE_SIZE)));
    return {
      label: "B-tree Index Scan",
      pagesRead: pages,
      comparisons: Math.ceil(Math.log2(ROWS)) + matching.length,
      resultRows: matching,
      notes: [
        `Navigér tre nivåer ned i B-tree (≈ log₂(${ROWS}) = ${Math.ceil(Math.log2(ROWS))} sammenligninger).`,
        `Hopp deretter til ${pages.length} page(s) i heap.`,
      ],
      applicable: true,
    };
  }
  if (query.kind === "range") {
    const matching = DATA.filter((r) => r.x >= query.lo! && r.x <= query.hi!).map((r) => r.id);
    const pages = uniq(matching.map((id) => Math.floor((id - 1) / PAGE_SIZE)));
    return {
      label: "B-tree Range Scan",
      pagesRead: pages,
      comparisons: Math.ceil(Math.log2(ROWS)) + matching.length,
      resultRows: matching,
      notes: [
        `Naviger til første nøkkel ≥ ${query.lo} (log n).`,
        `Følg lenken mellom blad-noder til nøkkel > ${query.hi}.`,
        `Trenger ${pages.length} heap-page(s).`,
      ],
      applicable: true,
    };
  }
  // prefix
  const matching = DATA.filter((r) => r.name.startsWith(query.prefix!)).map((r) => r.id);
  const pages = uniq(matching.map((id) => Math.floor((id - 1) / PAGE_SIZE)));
  return {
    label: "B-tree Prefix Scan",
    pagesRead: pages,
    comparisons: Math.ceil(Math.log2(ROWS)) + matching.length,
    resultRows: matching,
    notes: [
      `Navigér til første navn ≥ '${query.prefix}'.`,
      `Følg blad-lenken så lenge prefiks matcher.`,
    ],
    applicable: true,
  };
}

function planHash(query: {
  kind: QueryKind;
  eq?: number;
  lo?: number;
  hi?: number;
  prefix?: string;
}): Plan {
  if (query.kind === "equal") {
    const matching = DATA.filter((r) => r.x === query.eq).map((r) => r.id);
    const pages = uniq(matching.map((id) => Math.floor((id - 1) / PAGE_SIZE)));
    return {
      label: "Hash Index Lookup",
      pagesRead: pages,
      comparisons: 1, // hash O(1) (snitt)
      resultRows: matching,
      notes: [
        `hash(${query.eq}) → bucket → peker. O(1) i snitt.`,
        `Bare ${pages.length} heap-page å hente.`,
      ],
      applicable: true,
    };
  }
  return {
    label: "Hash (ubrukelig her)",
    pagesRead: [],
    comparisons: 0,
    resultRows: [],
    notes: [],
    applicable: false,
    reason:
      query.kind === "range"
        ? "Hash sprer ut tilstøtende verdier — kan ikke gjøre range. Faller tilbake til seq scan."
        : "Hash matcher kun hele nøkler, ikke prefiks. Faller tilbake til seq scan.",
  };
}

function planBitmapEqual(query: { kind: QueryKind; eq?: number; lo?: number; hi?: number }): Plan {
  if (query.kind !== "equal") {
    return {
      label: "Bitmap",
      pagesRead: [],
      comparisons: 0,
      resultRows: [],
      notes: [],
      applicable: false,
      reason:
        "Bitmap er bra for likhet på lav-kardinalitet (få distinkte verdier). Range eller prefix gir i praksis seq scan eller bitmap-OR av mange bitmap-er — sjelden vinnende.",
    };
  }
  // Vi bruker bitmap på `status` — ikke `x` (siden x har 100 ulike verdier)
  return {
    label: "Bitmap Index",
    pagesRead: [],
    comparisons: 0,
    resultRows: [],
    notes: [],
    applicable: false,
    reason:
      "x har 100 distinkte verdier — bitmap er upraktisk. Bytt til `status`-kolonne under for å se bitmap i aksjon.",
  };
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

const QUERIES: { id: QueryKind; sql: string; desc: string }[] = [
  { id: "equal", sql: "SELECT * FROM t WHERE x = 42", desc: "Likhet — én verdi" },
  { id: "range", sql: "SELECT * FROM t WHERE x BETWEEN 30 AND 60", desc: "Range — intervall" },
  {
    id: "prefix",
    sql: "SELECT * FROM t WHERE name LIKE 'abc%'",
    desc: "Prefiks — wildcard på slutten",
  },
];

export function IndexTypeComparison() {
  const [queryKind, setQueryKind] = useState<QueryKind>("equal");
  const [animTick, setAnimTick] = useState(0);

  const query = useMemo(() => {
    if (queryKind === "equal") return { kind: "equal" as const, eq: 42 };
    if (queryKind === "range") return { kind: "range" as const, lo: 30, hi: 60 };
    return { kind: "prefix" as const, prefix: "abc" };
  }, [queryKind]);

  const plans: Record<IndexType, Plan> = useMemo(
    () => ({
      none: planSeqScan(query),
      btree: planBTree(query),
      hash: planHash(query),
      bitmap: planBitmapEqual(query),
    }),
    [query],
  );

  // bitmap-spesifikk demo på status-kolonnen
  const bitmapStatusDemo = useMemo(() => {
    const target: "A" | "B" | "C" = "B";
    const rows = DATA.filter((r) => r.status === target).map((r) => r.id);
    return { target, rows, total: ROWS };
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
        <h3 className="font-semibold">Indeks-typer på samme query</h3>
        <div className="sm:ml-auto flex flex-wrap gap-2">
          {QUERIES.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => {
                setQueryKind(q.id);
                setAnimTick((t) => t + 1);
              }}
              className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                queryKind === q.id
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border hover:bg-muted"
              }`}
            >
              {q.desc}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAnimTick((t) => t + 1)}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-border hover:bg-muted"
            aria-label="Spill animasjon"
          >
            <Play className="h-3 w-3" /> Spill
          </button>
        </div>
      </div>

      <div className="rounded bg-background border border-border p-3 mb-4">
        <div className="text-xs text-muted-foreground mb-1">Query</div>
        <pre className="font-mono text-sm">{QUERIES.find((q) => q.id === queryKind)!.sql}</pre>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <PlanPanel name="Ingen indeks" plan={plans.none} animKey={animTick} />
        <PlanPanel name="B-tree" plan={plans.btree} animKey={animTick} highlight />
        <PlanPanel name="Hash" plan={plans.hash} animKey={animTick} />
        <PlanPanel name="Bitmap" plan={plans.bitmap} animKey={animTick} />
      </div>

      <div className="mt-5 rounded-lg border border-border bg-background p-4">
        <div className="text-sm font-semibold mb-2">
          Bitmap-demo: status-kolonne (3 distinkte verdier)
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Bitmap-indeks lagrer én bit per rad per distinkt verdi. For{" "}
          <code>status ∈ {"{A, B, C}"}</code> og 100 rader: 3 × 100 bits = 38 byte totalt.
          Spørringen <code>WHERE status = 'B'</code> finner alle rader ved å hente B-bitmappet og
          skanne det.
        </p>
        <BitmapStrip rows={DATA.map((r) => r.status)} target={bitmapStatusDemo.target} />
        <div className="text-xs text-muted-foreground mt-2">
          Resultat: {bitmapStatusDemo.rows.length} rader matcher{" "}
          <code>status = '{bitmapStatusDemo.target}'</code>. AND/OR mellom bitmaps er superraskt —
          perfekt for analytiske queries.
        </div>
      </div>

      <div className="mt-4 grid sm:grid-cols-3 gap-3 text-xs">
        <Box
          title="B-tree"
          body="O(log n) likhet OG range. Default. Bra alt-i-ett."
          color="brand"
        />
        <Box
          title="Hash"
          body="O(1) likhet, men ubrukelig for range/ORDER BY/prefiks."
          color="amber"
        />
        <Box
          title="Bitmap"
          body="Bra for lav-kardinalitet og kombinasjon med AND/OR. Tregt på OLTP (writes)."
          color="emerald"
        />
      </div>
    </div>
  );
}

function PlanPanel({
  name,
  plan,
  animKey,
  highlight,
}: {
  name: string;
  plan: Plan;
  animKey: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        highlight ? "border-brand/40 bg-brand/5" : "border-border bg-background"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="font-semibold text-sm">{name}</div>
        <div className="text-[10px] text-muted-foreground font-mono">{plan.label}</div>
      </div>
      {!plan.applicable ? (
        <div className="text-xs text-muted-foreground italic mt-2">{plan.reason}</div>
      ) : (
        <>
          <PageStrip key={animKey} totalPages={TOTAL_PAGES} pagesRead={plan.pagesRead} />
          <div className="grid grid-cols-3 gap-2 mt-2 text-[11px]">
            <Metric label="Pages lest" value={plan.pagesRead.length} of={TOTAL_PAGES} />
            <Metric label="Compares" value={plan.comparisons} />
            <Metric label="Treff" value={plan.resultRows.length} />
          </div>
          <ul className="text-[11px] text-muted-foreground list-disc pl-4 mt-2 space-y-0.5">
            {plan.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function PageStrip({ totalPages, pagesRead }: { totalPages: number; pagesRead: number[] }) {
  const set = new Set(pagesRead);
  return (
    <div className="grid grid-cols-10 gap-[3px] mt-2" aria-label="Disk pages lest">
      {Array.from({ length: totalPages }, (_, i) => {
        const read = set.has(i);
        return (
          <div
            key={i}
            className={`aspect-square rounded-sm border ${
              read ? "bg-rose-500/70 border-rose-500/60 animate-pulse" : "bg-muted/40 border-border"
            }`}
            title={`Page ${i + 1}${read ? " — lest" : ""}`}
            style={{ animationDelay: `${i * 30}ms`, animationIterationCount: 1 }}
          />
        );
      })}
    </div>
  );
}

function BitmapStrip({ rows, target }: { rows: ("A" | "B" | "C")[]; target: "A" | "B" | "C" }) {
  return (
    <div className="space-y-2">
      {(["A", "B", "C"] as const).map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div className="w-16 font-mono text-xs">status={s}</div>
          <div className="grid grid-cols-[repeat(50,1fr)] gap-[1px] flex-1">
            {rows.map((r, i) => (
              <div
                key={i}
                className={`h-3 rounded-[1px] ${
                  r === s ? (s === target ? "bg-emerald-500" : "bg-foreground/60") : "bg-muted/40"
                }`}
                title={`row ${i + 1}: ${r === s ? 1 : 0}`}
              />
            ))}
          </div>
          <div className="w-10 text-right font-mono text-xs">
            {rows.filter((r) => r === s).length}
          </div>
        </div>
      ))}
    </div>
  );
}

function Metric({ label, value, of }: { label: string; value: number; of?: number }) {
  return (
    <div className="rounded border border-border bg-card px-2 py-1">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono">
        {value}
        {of ? `/${of}` : ""}
      </div>
    </div>
  );
}

function Box({
  title,
  body,
  color,
}: {
  title: string;
  body: string;
  color: "brand" | "amber" | "emerald";
}) {
  const cls =
    color === "brand"
      ? "border-brand/30 bg-brand/5"
      : color === "amber"
        ? "border-amber-500/30 bg-amber-500/5"
        : "border-emerald-500/30 bg-emerald-500/5";
  return (
    <div className={`rounded-lg border p-3 ${cls}`}>
      <div className="font-semibold text-xs mb-1">{title}</div>
      <div className="text-[11px] text-muted-foreground">{body}</div>
    </div>
  );
}
