import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

type CvType =
  | "KFold"
  | "StratifiedKFold"
  | "GroupKFold"
  | "TimeSeriesSplit"
  | "LeaveOneOut"
  | "LeavePOut"
  | "StratifiedGroupKFold"
  | "Holdout";

const TYPE_LABEL: Record<CvType, string> = {
  KFold: "vanlig k-fold",
  StratifiedKFold: "stratified k-fold",
  GroupKFold: "GroupKFold",
  TimeSeriesSplit: "TimeSeriesSplit",
  LeaveOneOut: "Leave-One-Out",
  LeavePOut: "Leave-P-Out",
  StratifiedGroupKFold: "Stratified Group k-fold",
  Holdout: "single hold-out",
};

const SCENARIOS: {
  id: string;
  title: string;
  blurb: string;
  correct: CvType;
  why: string;
  alsoOk?: CvType[];
}[] = [
  {
    id: "med-rare",
    title: "Medisinsk forskning — sjelden diagnose",
    blurb:
      "320 pasienter, hver pasient har én rad. Klassebalanse: 96 % friske, 4 % syke. Du skal evaluere en klassifikator som varsler om diagnose.",
    correct: "StratifiedKFold",
    alsoOk: [],
    why: "Klassifikasjon med STERK ubalanse — vanlig k-fold kan gi folder uten syke. Stratified bevarer ratio i hver fold.",
  },
  {
    id: "fin-ts",
    title: "Finansiell tidsserie — aksjekurs",
    blurb:
      "Daglige sluttkurser de siste 5 årene. Du skal predikere returnen i morgen ut fra historikk og makro-variabler.",
    correct: "TimeSeriesSplit",
    why: "Tidsavhengig — vanlig CV ville latt modellen se framtiden, gi urealistisk høy score. TimeSeriesSplit garanterer at train alltid kommer FØR test i tid.",
  },
  {
    id: "spam-small",
    title: "Spam-klassifikator — lite datasett",
    blurb:
      "1500 e-poster merket spam/ham (45 % spam). Du har middels mye regnetid og vil ha et stabilt estimat.",
    correct: "StratifiedKFold",
    why: "Klassifikasjon, ikke ekstrem ubalanse, men stratifiserer for å garantere lik klassefordeling per fold. k=5 eller k=10 er standard.",
  },
  {
    id: "tiny-reg",
    title: "Lite regresjonsdatasett (n=18)",
    blurb:
      "18 målinger av reaksjonstid mot stimuli-intensitet. Du tester lineær mot kvadratisk regresjon og vil ha minst mulig bias i CV-estimatet.",
    correct: "LeaveOneOut",
    alsoOk: ["KFold"],
    why: "Med svært lite data har LOO lav bias (hver trening ser n-1=17 punkter). Trade-off mellom kompute og bias — her kompute ikke et problem.",
  },
  {
    id: "longitudinal",
    title: "Multi-pasient longitudinal",
    blurb:
      "Søvnstudie: 40 pasienter, hver med 200 EEG-segmenter. Klassifiser segmenter til søvnstadier (5 klasser, omtrent jevnt fordelt).",
    correct: "StratifiedGroupKFold",
    alsoOk: ["GroupKFold"],
    why: "ALLE segmenter fra én pasient må havne i samme fold (ellers lekker pasient-spesifikke mønstre fra train til test). Med 5 klasser ønsker vi også stratifisering ⇒ StratifiedGroupKFold.",
  },
  {
    id: "image-large",
    title: "Stort bildedatasett",
    blurb:
      "ImageNet-subset: 200 000 bilder, balanserte klasser. Du trener et CNN i flere dager per kjøring.",
    correct: "Holdout",
    alsoOk: ["KFold"],
    why: "Med 200k samples er ett enkelt hold-out (f.eks. 80/10/10) statistisk stabilt nok, og k-fold ville koste dager ekstra trening. K-fold er teoretisk bedre, men sjelden verdt det her.",
  },
  {
    id: "drug-bio",
    title: "Biomarkør-screening — mange features, lite data",
    blurb:
      "70 pasienter, 8000 gen-uttrykk-features. Du tester ulike Lasso-α-verdier og vil ha et ærlig estimat av generaliseringsfeil etter tuning.",
    correct: "LeavePOut",
    alsoOk: ["LeaveOneOut", "KFold"],
    why: "Veldig lite n, mange features — bruk nestedCV med stort k (eller LeavePOut/LOO) for outer-loop. Single CV-for-tuning er katastrofalt biased her.",
  },
  {
    id: "rare-event-ts",
    title: "Tidsserie + sjelden hendelse",
    blurb:
      "Sensor-logg fra et fly: 10 millioner punkter, 1200 'unormale hendelser' (0.012 %). Predikter hendelse 5 min fram i tid.",
    correct: "TimeSeriesSplit",
    why: "Tidsavhengig er den HARDE skranken — du kan IKKE bruke stratifisert k-fold som ignorerer tid. Bruk TimeSeriesSplit og evt. legg vekt/over-sampling i tap-funksjonen for ubalansen.",
  },
];

export function CvChoiceMatchQuiz() {
  const [answers, setAnswers] = useState<Record<string, CvType | undefined>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const correctCount = SCENARIOS.filter(
    (s) =>
      revealed[s.id] &&
      (answers[s.id] === s.correct || (s.alsoOk?.includes(answers[s.id] as CvType) ?? false)),
  ).length;
  const totalRevealed = SCENARIOS.filter((s) => revealed[s.id]).length;

  const CHOICES: CvType[] = [
    "Holdout",
    "KFold",
    "StratifiedKFold",
    "GroupKFold",
    "StratifiedGroupKFold",
    "TimeSeriesSplit",
    "LeaveOneOut",
    "LeavePOut",
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm">
          Score:{" "}
          <span className="font-mono font-semibold">
            {correctCount} / {totalRevealed}
          </span>{" "}
          <span className="text-muted-foreground">
            ({SCENARIOS.length - totalRevealed} igjen)
          </span>
        </div>
        <button
          onClick={() => {
            setAnswers({});
            setRevealed({});
          }}
          className="text-xs px-3 py-1 rounded-md border border-border hover:border-brand/40 transition-colors"
        >
          Nullstill
        </button>
      </div>

      <div className="space-y-3">
        {SCENARIOS.map((s, i) => {
          const ans = answers[s.id];
          const rev = revealed[s.id];
          const isCorrect =
            ans === s.correct || (s.alsoOk?.includes(ans as CvType) ?? false);
          return (
            <div
              key={s.id}
              className={`rounded-lg border p-4 transition-colors ${
                rev
                  ? isCorrect
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-rose-500/40 bg-rose-500/5"
                  : "border-border bg-background"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="text-xs font-mono text-muted-foreground">
                    Scenario {i + 1} / {SCENARIOS.length}
                  </div>
                  <div className="font-semibold text-sm">{s.title}</div>
                </div>
                {rev &&
                  (isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
                  ))}
              </div>
              <p className="text-xs text-muted-foreground mb-3">{s.blurb}</p>

              <div className="flex flex-wrap gap-2 mb-2">
                {CHOICES.map((c) => {
                  const sel = ans === c;
                  const isRight = rev && c === s.correct;
                  const isAlsoOk = rev && s.alsoOk?.includes(c);
                  return (
                    <button
                      key={c}
                      disabled={rev}
                      onClick={() => setAnswers((p) => ({ ...p, [s.id]: c }))}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-colors ${
                        sel && !rev
                          ? "border-brand bg-brand/10"
                          : isRight
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                            : isAlsoOk
                              ? "border-emerald-400/30 bg-emerald-500/5 text-emerald-300/70"
                              : sel && rev
                                ? "border-rose-500/50 bg-rose-500/10 text-rose-300"
                                : "border-border bg-background text-muted-foreground hover:border-brand/40"
                      } disabled:cursor-not-allowed`}
                    >
                      {TYPE_LABEL[c]}
                      {isAlsoOk && !isRight ? " (også OK)" : ""}
                    </button>
                  );
                })}
              </div>

              {!rev && ans && (
                <button
                  onClick={() => setRevealed((p) => ({ ...p, [s.id]: true }))}
                  className="text-xs px-3 py-1 rounded-md border border-brand bg-brand/10 hover:bg-brand/20 transition-colors"
                >
                  Sjekk svar
                </button>
              )}

              {rev && (
                <div className="text-xs mt-2 leading-relaxed">
                  <span className="font-semibold">
                    Riktig: {TYPE_LABEL[s.correct]}
                  </span>
                  {s.alsoOk && s.alsoOk.length > 0 && (
                    <span className="text-muted-foreground">
                      {" "}
                      (også: {s.alsoOk.map((a) => TYPE_LABEL[a]).join(", ")})
                    </span>
                  )}
                  <div className="mt-1 text-muted-foreground">{s.why}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
