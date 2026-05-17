/**
 * TradeOffMatrix — 5 strategier × 4 dimensjoner som heatmap.
 *
 * Score: 1 (dårlig, rød) → 5 (bra, grønn). Hver celle har en kort
 * forklaring i hover-tittelen og en synlig én-linjes oppsummering.
 *
 * Dimensjoner:
 *   - Lagringsbruk (per uke)
 *   - Backup-vindu (tid hver natt)
 *   - Recovery-tid (RTO — recovery time objective)
 *   - RPO (recovery point objective — hvor mye data kan tapes)
 */

type Strategy =
  | "full-daily"
  | "weekly-inc"
  | "weekly-diff"
  | "gfs"
  | "continuous";

type Dimension = "storage" | "window" | "rto" | "rpo";

type Cell = {
  /** 1=worst, 5=best */
  score: 1 | 2 | 3 | 4 | 5;
  blurb: string;
};

const MATRIX: Record<Strategy, Record<Dimension, Cell>> = {
  "full-daily": {
    storage: {
      score: 1,
      blurb: "7 × full = 7 TB/uke (på 1 TB data). Verst.",
    },
    window: {
      score: 1,
      blurb: "Full hver natt = ~2 t. Krever stort backup-vindu.",
    },
    rto: {
      score: 5,
      blurb: "1 fil å gjenopprette — raskest mulig recovery.",
    },
    rpo: {
      score: 4,
      blurb: "Inntil 24 t tap (en dag siden siste backup).",
    },
  },
  "weekly-inc": {
    storage: {
      score: 5,
      blurb: "1 full + 6 små inc = ~1.1 TB/uke. Minst plass.",
    },
    window: {
      score: 5,
      blurb: "Inc tar minutter. Kortest backup-vindu hverdag.",
    },
    rto: {
      score: 1,
      blurb: "1 full + N inc — opptil 7 filer, sekvensielt. Tregest + sårbart.",
    },
    rpo: {
      score: 4,
      blurb: "Inntil 24 t tap.",
    },
  },
  "weekly-diff": {
    storage: {
      score: 3,
      blurb: "1 full + 6 voksende diff. Mer enn inc, mindre enn full-daily.",
    },
    window: {
      score: 3,
      blurb: "Vokser gjennom uka — lørdag-diff er nesten like stor som full.",
    },
    rto: {
      score: 4,
      blurb: "Alltid 2 filer: siste full + siste diff. Forutsigbart raskt.",
    },
    rpo: {
      score: 4,
      blurb: "Inntil 24 t tap.",
    },
  },
  gfs: {
    storage: {
      score: 4,
      blurb: "Som inc, pluss månedlig grandfather + langtidsoppbevaring.",
    },
    window: {
      score: 4,
      blurb: "Mest inc-vinduer, full hver helg + månedlig.",
    },
    rto: {
      score: 2,
      blurb: "Som inc — sekvensiell kjede, men færre dager siden siste Father.",
    },
    rpo: {
      score: 5,
      blurb:
        "Multi-tier retention (dag/uke/måned) gir mange recovery-punkter også år bakover.",
    },
  },
  continuous: {
    storage: {
      score: 3,
      blurb:
        "Log-shipping / CDP: full + kontinuerlig transaksjons-log. Logg-volum kan bli stort.",
    },
    window: {
      score: 5,
      blurb: "Ingen 'vindu' — replikering kontinuerlig. Null nedetid for backup.",
    },
    rto: {
      score: 3,
      blurb: "Full + replay av tx-log til ønsket tidspunkt. Kan ta tid.",
    },
    rpo: {
      score: 5,
      blurb: "Sub-sekund RPO — point-in-time recovery til hvilket som helst sekund.",
    },
  },
};

const STRATEGY_LABEL: Record<Strategy, string> = {
  "full-daily": "Full hver dag",
  "weekly-inc": "Full ukentlig + Inkrementell daglig",
  "weekly-diff": "Full ukentlig + Differensiell daglig",
  gfs: "GFS (Grandfather-Father-Son)",
  continuous: "Continuous / Log-shipping (CDP)",
};

const DIM_LABEL: Record<Dimension, { title: string; sub: string }> = {
  storage: {
    title: "Lagringsbruk",
    sub: "TB/uke for 1 TB datasett",
  },
  window: {
    title: "Backup-vindu",
    sub: "Tid per natt — hvor lenge må DB-en stå stille / under load",
  },
  rto: {
    title: "Recovery Time (RTO)",
    sub: "Hvor raskt kan vi være oppe igjen?",
  },
  rpo: {
    title: "Recovery Point (RPO)",
    sub: "Hvor mye data kan vi maks tape?",
  },
};

const DIMS: Dimension[] = ["storage", "window", "rto", "rpo"];

function scoreColor(score: number): string {
  // 1=rød, 2=oransje, 3=gul, 4=lime, 5=grønn
  return [
    "bg-rose-500/30 border-rose-500/60 text-rose-700 dark:text-rose-300",
    "bg-orange-500/25 border-orange-500/55 text-orange-700 dark:text-orange-300",
    "bg-amber-400/25 border-amber-500/50 text-amber-700 dark:text-amber-300",
    "bg-lime-500/25 border-lime-500/50 text-lime-700 dark:text-lime-300",
    "bg-emerald-500/30 border-emerald-500/60 text-emerald-700 dark:text-emerald-300",
  ][score - 1];
}

function scoreDot(score: number): string {
  return "●".repeat(score) + "○".repeat(5 - score);
}

export function TradeOffMatrix() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[700px]">
          <thead>
            <tr>
              <th className="text-left font-semibold px-2 py-2 align-bottom w-56">
                Strategi
              </th>
              {DIMS.map((d) => (
                <th
                  key={d}
                  className="text-left font-semibold px-2 py-2 align-bottom"
                >
                  <div className="text-foreground">{DIM_LABEL[d].title}</div>
                  <div className="text-[10px] font-normal text-muted-foreground leading-tight">
                    {DIM_LABEL[d].sub}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(Object.keys(STRATEGY_LABEL) as Strategy[]).map((s) => (
              <tr key={s} className="border-t border-border">
                <td className="px-2 py-2 font-semibold align-top">
                  {STRATEGY_LABEL[s]}
                </td>
                {DIMS.map((d) => {
                  const cell = MATRIX[s][d];
                  return (
                    <td key={d} className="px-1 py-1 align-top">
                      <div
                        className={`rounded-md border px-2 py-1.5 ${scoreColor(cell.score)}`}
                        title={cell.blurb}
                      >
                        <div className="font-mono text-[10px] tracking-tighter">
                          {scoreDot(cell.score)}
                        </div>
                        <div className="text-[10px] leading-snug mt-0.5">
                          {cell.blurb}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legende + nøkkel-innsikter */}
      <div className="mt-4 grid sm:grid-cols-[200px_1fr] gap-4 text-[11px]">
        <div className="rounded-md border border-border p-2">
          <div className="font-semibold text-foreground mb-1">Score-skala</div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono w-12">●●●●●</span>
              <span className="text-emerald-600 dark:text-emerald-400">utmerket</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono w-12">●●●●○</span>
              <span className="text-lime-600 dark:text-lime-400">bra</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono w-12">●●●○○</span>
              <span className="text-amber-600 dark:text-amber-400">middels</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono w-12">●●○○○</span>
              <span className="text-orange-600 dark:text-orange-400">svak</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono w-12">●○○○○</span>
              <span className="text-rose-600 dark:text-rose-400">dårlig</span>
            </div>
          </div>
        </div>
        <div className="rounded-md border border-border p-2 space-y-1.5">
          <div className="font-semibold text-foreground">Nøkkel-innsikter</div>
          <p>
            <strong className="text-foreground">Ingen strategi vinner alt.</strong>{" "}
            Storage og RTO trekker i hver sin retning. Velg basert på hva som er
            verst for deg å miste: penger (storage) eller tid (RTO).
          </p>
          <p>
            <strong className="text-foreground">
              Inkrementell minimerer skriv-kost, ikke restore-kost.
            </strong>{" "}
            En sårbar kjede betyr at sannsynligheten for vellykket recovery
            faller med antall filer.
          </p>
          <p>
            <strong className="text-foreground">
              Continuous (CDP) er kun mulig hvis DB-en støtter binary log /
              WAL-shipping
            </strong>{" "}
            (MySQL binlog, PostgreSQL WAL-archiving). Krever ekstra disk og
            replika.
          </p>
        </div>
      </div>
    </div>
  );
}
