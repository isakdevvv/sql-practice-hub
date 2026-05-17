import { useState } from "react";

/**
 * IndexTradeOffMatrix — heatmap over indeks-strategier vs metrikker.
 *
 * 5 strategier × 4 metrikker. Score 1..5. Klikkbare celler viser
 * forklaring.
 *
 * Pedagogisk poeng: hver indeks gjør lesing raskere, men gir kostnad ved
 * skriving, lagring og vedlikehold. Trade-off mellom OLAP-tunge (mange
 * indekser) og OLTP-tunge (minimal indeksering) arbeidsbelastninger.
 */

type Strategy = {
  id: string;
  label: string;
  desc: string;
  scores: {
    read: number;
    write: number;
    storage: number;
    maintenance: number;
  };
  detail: {
    read: string;
    write: string;
    storage: string;
    maintenance: string;
  };
};

const STRATEGIES: Strategy[] = [
  {
    id: "none",
    label: "Ingen indeks",
    desc: "Bare heap. Alle queries blir seq scan.",
    scores: { read: 1, write: 5, storage: 5, maintenance: 5 },
    detail: {
      read: "Alle queries blir seq scan — O(n) på hver. Akseptabelt kun for små tabeller (< 1000 rader) eller logger som sjelden leses.",
      write:
        "Maks skrive-hastighet: ingen sekundære indekser å vedlikeholde. Bare append/oppdater raden.",
      storage: "Minst plass — kun heap-tabellen. Ingen ekstra disk-blokker for indekser.",
      maintenance: "Ingen indekser å rebuild/analyse. Lavest operasjonell kompleksitet.",
    },
  },
  {
    id: "pk_only",
    label: "Kun primærnøkkel",
    desc: "PK gir én B-tree-indeks automatisk. Resten er seq scan.",
    scores: { read: 2, write: 5, storage: 4, maintenance: 5 },
    detail: {
      read: "Lookup på PK er O(log n). Alt annet (filter på andre kolonner, JOIN på FK) blir seq scan.",
      write: "Skriving må kun oppdatere PK-indeks + heap. Nær maks throughput for INSERT.",
      storage: "Én ekstra B-tree (typisk 1-5 % av heap-størrelsen).",
      maintenance: "Minimal — PK-indeks vedlikeholder seg selv.",
    },
  },
  {
    id: "pk_plus_one",
    label: "PK + 1 sekundær",
    desc: "Klassisk OLTP — PK + indeks på mest-queried FK eller filter.",
    scores: { read: 3, write: 4, storage: 4, maintenance: 4 },
    detail: {
      read: "Den vanligste lookup-en er rask, og PK-lookup er rask. Resten seq scan.",
      write: "Hver INSERT/UPDATE må oppdatere 2 indekser + heap. Ca 30-50 % treg-er enn pk_only.",
      storage: "PK + én sekundær indeks. Typisk 3-10 % av heap.",
      maintenance: "Lite — to indekser å analyse/rebuild.",
    },
  },
  {
    id: "pk_plus_five",
    label: "PK + 5 sekundære",
    desc: "Read-heavy OLTP / analytics. Mange spørringer dekkes effektivt.",
    scores: { read: 5, write: 2, storage: 2, maintenance: 2 },
    detail: {
      read: "Nesten alle WHERE-prediktater dekkes av en indeks. Read-latens er konstant lav.",
      write: "INSERT/UPDATE må oppdatere 6 indekser + heap. Typisk 3-6x treg-ere enn pk_only.",
      storage: "6 indekser → ofte 30-100 % av heap-størrelsen.",
      maintenance: "Mer å analyze/rebuild, og DBA må overvåke ubrukte indekser (bortkastet plass).",
    },
  },
  {
    id: "covered_composite",
    label: "Covered + composite",
    desc: "OLAP / rapporter — store sammensatte indekser dekker hele queries.",
    scores: { read: 5, write: 1, storage: 1, maintenance: 2 },
    detail: {
      read: "Index Only Scan på de største rapport-queries. Mange queries trenger ikke heap i det hele tatt — disk-I/O kuttes drastisk.",
      write:
        "Composite-indekser med INCLUDE er store. Hver kolonne i indeksen må oppdateres ved UPDATE. INSERT-throughput er ofte 5-10x treg-ere enn pk_only.",
      storage:
        "Store covered indekser kan være 100-300 % av heap-størrelse — duplikering av kolonne-data.",
      maintenance:
        "Composite-indekser krever omtenksom kolonne-rekkefølge, og rebuild kan ta lang tid.",
    },
  },
];

const METRICS = [
  { id: "read", label: "Read speed", invert: false },
  { id: "write", label: "Write speed", invert: false },
  { id: "storage", label: "Storage (kompakt)", invert: false },
  { id: "maintenance", label: "Maintenance (enkelt)", invert: false },
] as const;

type MetricId = (typeof METRICS)[number]["id"];

function scoreColor(score: number): string {
  // 1 (dårlig, rødt) → 5 (bra, grønt)
  const palette = [
    "bg-rose-500/70 text-white",
    "bg-rose-400/60 text-white",
    "bg-amber-400/60 text-foreground",
    "bg-emerald-400/60 text-foreground",
    "bg-emerald-500/80 text-white",
  ];
  return palette[Math.max(0, Math.min(4, score - 1))];
}

export function IndexTradeOffMatrix() {
  const [sel, setSel] = useState<{ strat: string; metric: MetricId } | null>({
    strat: "pk_plus_one",
    metric: "read",
  });

  const selStrat = sel ? STRATEGIES.find((s) => s.id === sel.strat) : null;
  const selDetail = selStrat && sel ? selStrat.detail[sel.metric] : null;
  const selMetric = sel ? METRICS.find((m) => m.id === sel.metric) : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <h3 className="font-semibold mb-2">Trade-off-matrise: indeks-strategi vs metrikk</h3>
      <p className="text-xs text-muted-foreground mb-3">
        5 vanlige strategier × 4 metrikker. Score 1 (dårlig) → 5 (bra). Hver ekstra indeks løfter
        lese-ytelse, men koster skriving, plass og vedlikehold. Klikk en celle for detalj.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="text-left p-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Strategi ↓ / Metrikk →
              </th>
              {METRICS.map((m) => (
                <th key={m.id} className="text-center p-2 text-xs font-semibold">
                  {m.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STRATEGIES.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-2 align-top">
                  <div className="font-semibold text-sm">{s.label}</div>
                  <div className="text-[11px] text-muted-foreground">{s.desc}</div>
                </td>
                {METRICS.map((m) => {
                  const score = s.scores[m.id];
                  const isSel = sel?.strat === s.id && sel?.metric === m.id;
                  return (
                    <td key={m.id} className="p-1 text-center">
                      <button
                        type="button"
                        onClick={() => setSel({ strat: s.id, metric: m.id })}
                        className={`w-full h-10 rounded text-xs font-mono font-semibold border transition-all ${
                          isSel ? "ring-2 ring-brand" : "border-transparent"
                        } ${scoreColor(score)}`}
                        aria-label={`${s.label}, ${m.label}: ${score}/5`}
                      >
                        {score}/5
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>Skala:</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`px-2 py-0.5 rounded ${scoreColor(n)}`}>
            {n}
          </span>
        ))}
      </div>

      {selDetail && selMetric && selStrat && (
        <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
            {selStrat.label} → {selMetric.label}
          </div>
          <p className="text-sm">{selDetail}</p>
        </div>
      )}

      <div className="mt-4 grid sm:grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
          <div className="font-semibold mb-1">OLAP / rapport-tungt</div>
          <p className="text-muted-foreground">
            Få writes, mange komplekse reads. Gå mot <em>covered composite</em> — store indekser
            betaler tilbake i redusert disk-I/O.
          </p>
        </div>
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <div className="font-semibold mb-1">OLTP / INSERT-tungt</div>
          <p className="text-muted-foreground">
            Hver indeks senker INSERT-throughput. Hold deg til PK + få spesifikke sekundære
            indekser. Slett ubrukte indekser ofte.
          </p>
        </div>
      </div>
    </div>
  );
}
