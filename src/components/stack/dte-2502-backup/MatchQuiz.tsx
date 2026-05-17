import { useMemo, useState } from "react";

/**
 * MatchQuiz — 5 scenarier × 5 strategier. Brukeren velger riktig strategi
 * for hver use-case og får begrunnelse + advarsel når svaret er feil.
 */

type Strategy =
  | "full-daily"
  | "weekly-inc"
  | "weekly-diff"
  | "gfs"
  | "continuous";

type Scenario = {
  id: string;
  title: string;
  desc: string;
  /** Riktig strategi(er) — flere kan være akseptable. Første er "primary". */
  correct: Strategy[];
  rationale: string;
};

const STRATEGY_LABEL: Record<Strategy, string> = {
  "full-daily": "Full hver dag",
  "weekly-inc": "Full ukentlig + Inkrementell daglig",
  "weekly-diff": "Full ukentlig + Differensiell daglig",
  gfs: "GFS (Grandfather-Father-Son)",
  continuous: "Continuous / Log-shipping (CDP)",
};

const SCENARIOS: Scenario[] = [
  {
    id: "bank",
    title: "Transaksjonell bank-DB",
    desc:
      "Sentralbank-pålagt: maks 1 minutt tap av transaksjoner. Tusenvis av writes per sekund 24/7. Stor compliance-byrde — må kunne gjenopprette til hvilket som helst sekund de siste 7 år.",
    correct: ["continuous", "gfs"],
    rationale:
      "RPO på 1 minutt umuliggjør natt-basert backup helt. Trenger continuous / WAL-shipping (point-in-time recovery). Kombiner med GFS-retention for langtid (7 år).",
  },
  {
    id: "fileshare",
    title: "Tilfeldig brukerfilstore (NAS)",
    desc:
      "10 TB brukerfiler — Word-dokumenter, PDF-er, bilder. Brukere oppdager noen ganger tap først etter uker. 95 % av filene endres aldri. Backup-vinduet om natten er 4 timer.",
    correct: ["gfs", "weekly-inc"],
    rationale:
      "Datasettet er stort men endrer seg lite — inkrementell er ideelt. GFS-retention (dag/uke/måned) håndterer 'oppdaget for sent'-scenarioet ved å beholde gamle versjoner i lang tid.",
  },
  {
    id: "blog",
    title: "Blogg-CMS (lite hobby-prosjekt)",
    desc:
      "WordPress-blogg på en VPS. ~2 GB total, ~10 MB endring per dag. Eieren tåler å miste én dag. Vil ikke betale for backup-tjeneste eller fikle med komplekse oppsett.",
    correct: ["full-daily"],
    rationale:
      "Datasettet er så lite at full-daily er trivielt billig (140 GB/mnd lagring totalt). Enklest å gjenopprette — ingen kjede-risiko, ingen fancy verktøy. 'Boring tech' vinner her.",
  },
  {
    id: "trading",
    title: "Real-time trading-logger",
    desc:
      "Append-only logger fra HFT-systemer. 500 GB/dag i nye linjer. Eksisterende data endres aldri. Tap av selv en handel kan koste millioner i etterregulering.",
    correct: ["continuous"],
    rationale:
      "Append-only + null tolerance for tap = log-shipping er perfekt. Loggen replikeres til standby i nær-sanntid. (Full natt-backup er irrelevant — datasettet er for stort og endrer seg konstant.)",
  },
  {
    id: "ml",
    title: "ML-treningsdata + modellsjekkpunkter",
    desc:
      "5 TB rådata som sjelden endres, pluss 200 GB nye modellsjekkpunkter per uke. Trening tar dager — å miste en sjekkpunkt-fil er irriterende men ikke katastrofalt.",
    correct: ["weekly-diff", "weekly-inc"],
    rationale:
      "Den store rådatamengden trenger ikke daglig full. Diff hver dag holder recovery-kjeden kort (2 filer). Inc er også OK siden tap her ikke er katastrofalt. Full-daily ville sløst diskplass på data som ikke endrer seg.",
  },
];

const ALL_STRATEGIES = Object.keys(STRATEGY_LABEL) as Strategy[];

export function MatchQuiz() {
  const [picks, setPicks] = useState<Record<string, Strategy | null>>(() =>
    Object.fromEntries(SCENARIOS.map((s) => [s.id, null])),
  );
  const [revealed, setRevealed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SCENARIOS.map((s) => [s.id, false])),
  );

  function pick(scenarioId: string, strat: Strategy) {
    setPicks((p) => ({ ...p, [scenarioId]: strat }));
  }
  function reveal(id: string) {
    setRevealed((r) => ({ ...r, [id]: true }));
  }
  function resetAll() {
    setPicks(Object.fromEntries(SCENARIOS.map((s) => [s.id, null])));
    setRevealed(Object.fromEntries(SCENARIOS.map((s) => [s.id, false])));
  }

  const score = useMemo(() => {
    let correct = 0;
    let answered = 0;
    for (const s of SCENARIOS) {
      const p = picks[s.id];
      if (p !== null && revealed[s.id]) {
        answered += 1;
        if (s.correct.includes(p)) correct += 1;
      }
    }
    return { correct, answered };
  }, [picks, revealed]);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <div className="text-xs text-muted-foreground">
          Velg strategi for hvert scenario. Trykk <strong>Sjekk</strong> for begrunnelse.
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs">
            Score:{" "}
            <strong className="text-foreground tabular-nums">
              {score.correct} / {score.answered}
            </strong>{" "}
            <span className="text-muted-foreground">av {SCENARIOS.length}</span>
          </div>
          <button
            type="button"
            onClick={resetAll}
            className="text-xs rounded-md border border-border bg-background px-2 py-1 hover:bg-muted"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {SCENARIOS.map((sc) => {
          const pickVal = picks[sc.id];
          const rev = revealed[sc.id];
          const isCorrect = pickVal !== null && sc.correct.includes(pickVal);
          return (
            <div
              key={sc.id}
              className="rounded-lg border border-border bg-background p-3"
            >
              <div className="mb-2">
                <div className="font-semibold text-sm">{sc.title}</div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {sc.desc}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5 mb-2">
                {ALL_STRATEGIES.map((s) => {
                  const selected = pickVal === s;
                  const isRight = rev && sc.correct.includes(s);
                  const isWrong = rev && selected && !sc.correct.includes(s);
                  const cls = isWrong
                    ? "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                    : isRight
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : selected
                        ? "border-brand bg-brand/10"
                        : "border-border bg-card hover:bg-muted";
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={rev}
                      onClick={() => pick(sc.id, s)}
                      className={`text-[10px] rounded-md border px-2 py-2 text-left leading-tight ${cls} disabled:cursor-default`}
                    >
                      {STRATEGY_LABEL[s]}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => reveal(sc.id)}
                  disabled={pickVal === null || rev}
                  className="text-xs rounded-md border border-brand bg-brand/10 px-2.5 py-1 hover:bg-brand/20 disabled:opacity-40"
                >
                  Sjekk svaret
                </button>
                {rev && (
                  <span
                    className={`text-xs font-semibold ${
                      isCorrect
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isCorrect ? "✓ Riktig" : "✗ Ikke optimal"}
                  </span>
                )}
              </div>
              {rev && (
                <div className="mt-2 rounded-md border border-border bg-muted/30 p-2 text-xs">
                  <div className="font-semibold text-foreground mb-1">
                    Begrunnelse
                  </div>
                  <p className="text-muted-foreground">{sc.rationale}</p>
                  {sc.correct.length > 1 && (
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      Akseptable svar:{" "}
                      <span className="font-mono">
                        {sc.correct.map((c) => STRATEGY_LABEL[c]).join(" eller ")}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
