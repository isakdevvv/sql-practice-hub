import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, Sparkles, RotateCcw } from "lucide-react";

// 6 scenarier → match riktig algoritme + kort begrunnelse.

type AlgoId =
  | "thompson"
  | "ucb"
  | "epsilon-decay"
  | "epsilon-fixed"
  | "contextual"
  | "ab-test";

const ALGOS: { id: AlgoId; label: string; tag: string }[] = [
  { id: "thompson", label: "Thompson sampling (Beta-Bernoulli)", tag: "Bayesian" },
  { id: "ucb", label: "UCB1", tag: "Frequentist, log T regret" },
  { id: "epsilon-decay", label: "ε-greedy med ε-decay", tag: "Enkel, decay over tid" },
  { id: "epsilon-fixed", label: "ε-greedy med fast ε", tag: "Lineær regret — kun naive baseline" },
  { id: "contextual", label: "Contextual bandit (LinUCB / TS)", tag: "Per-context Q" },
  { id: "ab-test", label: "Klassisk A/B-test (fixed sample, ingen bandit)", tag: "Ingen adaptive allocation" },
];

type Scenario = {
  id: string;
  title: string;
  desc: string;
  correct: AlgoId;
  reason: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "clinical",
    title: "Klinisk forsøk: 3 behandlinger, etisk press",
    desc:
      "Sykehus tester 3 behandlinger for en alvorlig diagnose. Hver pasient er kostbar (etisk å minimere antall som får dårligst behandling). Pasienter ankommer sekvensielt. Reward: overlevelse (binær).",
    correct: "thompson",
    reason:
      "Bernoulli + Bayesian gir naturlige uncertainty-bounds og kan adaptivt redusere allokering til underlegne behandlinger. Etisk overlegen klassisk A/B (likelik allokering).",
  },
  {
    id: "ad-bidding",
    title: "Real-time bidding på annonsemarked",
    desc:
      "Du byr på 100 000 ad impressions/sek. Hver impression har bruker-features (alder, lokasjon, device). Vinn-rate avhenger sterkt av features. Du må lære hvilke annonser som funker for hvilke segmenter — fort.",
    correct: "contextual",
    reason:
      "Per-impression features = context. LinUCB / contextual TS lærer en policy som mappes til features (lineær modell). Context-agnostic bandit kaster bort informasjon.",
  },
  {
    id: "news-rec",
    title: "Nyhetsanbefaling for forsida til et nettsted",
    desc:
      "10–20 nyhetsartikler å vise på forsida. Klikk-frekvens varierer mye, men artiklene roterer hyppig (livssyklus < 1 dag). Stort trafikkvolum, stasjonært i kort horisont.",
    correct: "ucb",
    reason:
      "Stort N på kort tid + behov for raskt å konvergere. UCB1 er parameter-fri, gir log T regret, og har sterke garantier for stationær setting. Yahoo brukte LinUCB for nettopp dette.",
  },
  {
    id: "drug-discovery",
    title: "Layout-test av landing-side: 4 varianter",
    desc:
      "Du har 4 designvarianter av et betalingsskjerm. Du vil rigourøst svare 'er variant B bedre enn A?' med p-verdier til styret. Trafikk er fast: 10 000 besøk per uke.",
    correct: "ab-test",
    reason:
      "Når målet er hypotese-test og rapportering med p-verdier, bryter bandits forutsetningene om uavhengig allokering. Klassisk A/B (fast sample size, frequentist test) er riktig verktøy. Bandits = optimere; A/B = inferere.",
  },
  {
    id: "robot",
    title: "Robotkontroll: ny eksperimentell oppgave",
    desc:
      "Roboten skal lære én av 5 grep-strategier. Du har ingen prior om hvilken som er best, og horisonten er lang (vil kjøre dette i måneder). Eksperimentert utforskning tidlig er OK.",
    correct: "epsilon-decay",
    reason:
      "ε-decay (f.eks. ε_t = 1/t) gir kraftig utforskning tidlig og konvergens mot grådig sent. Enkelt å implementere, asymptotisk optimalt, ingen behov for Bayesian-maskineri. UCB ville også fungert, men er mer kjent som baseline her.",
  },
  {
    id: "naive-baseline",
    title: "Førsteklass-prosjekt: enkleste bandit som ikke er pur grådig",
    desc:
      "Du skal demonstrere bandit-prinsippet i en presentasjon. Trenger den enkleste algoritmen som gjør noe meningsfullt utover å kjøre alltid-greedy. Ikke fokus på teori-optimalitet.",
    correct: "epsilon-fixed",
    reason:
      "ε-greedy med fast ε er den klassiske pedagogiske baselinen — én linje kode, lett å forklare. Ikke optimal asymptotisk (lineær regret), men det er pedagogisk poeng nummer to.",
  },
];

export function BanditsScenarioQuiz() {
  const [picks, setPicks] = useState<Record<string, AlgoId | null>>(
    Object.fromEntries(SCENARIOS.map((s) => [s.id, null])),
  );
  const [checked, setChecked] = useState(false);

  const score = useMemo(() => {
    let n = 0;
    for (const s of SCENARIOS) if (picks[s.id] === s.correct) n++;
    return n;
  }, [picks]);

  const reset = () => {
    setPicks(Object.fromEntries(SCENARIOS.map((s) => [s.id, null])));
    setChecked(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold mb-1">
            Match scenario → algoritme
          </div>
          <div className="text-xs text-muted-foreground">
            6 realistiske use-cases. Velg algoritmen du ville foreslått, og
            sjekk svaret. Det handler om å lese problemstillingen, ikke å
            huske formler.
          </div>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1 rounded border border-border px-2 py-1 text-xs hover:bg-muted"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Nullstill
        </button>
      </div>

      <div className="space-y-3">
        {SCENARIOS.map((s, idx) => {
          const pick = picks[s.id];
          const correct = checked && pick === s.correct;
          const wrong = checked && pick && pick !== s.correct;
          return (
            <div
              key={s.id}
              className={`rounded-lg border p-3 ${
                correct
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : wrong
                    ? "border-red-500/40 bg-red-500/5"
                    : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Scenario {idx + 1}
                  </div>
                  <div className="text-sm font-medium">{s.title}</div>
                </div>
                {checked && correct && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                )}
                {checked && wrong && (
                  <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                )}
              </div>
              <div className="text-xs text-muted-foreground mb-3">{s.desc}</div>
              <div className="grid sm:grid-cols-2 gap-1.5">
                {ALGOS.map((a) => {
                  const isPicked = pick === a.id;
                  const isCorrect = checked && a.id === s.correct;
                  return (
                    <button
                      key={a.id}
                      onClick={() => {
                        if (checked) return;
                        setPicks((p) => ({ ...p, [s.id]: a.id }));
                      }}
                      disabled={checked}
                      className={`text-left rounded border px-2 py-1.5 text-xs transition-colors ${
                        isCorrect
                          ? "border-emerald-500/60 bg-emerald-500/10"
                          : isPicked
                            ? "border-brand bg-brand/10"
                            : "border-border hover:bg-muted"
                      } ${checked ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <div className="font-medium">{a.label}</div>
                      <div className="text-muted-foreground text-[10px]">
                        {a.tag}
                      </div>
                    </button>
                  );
                })}
              </div>
              {checked && (
                <div className="mt-2 text-xs border-t border-border/50 pt-2">
                  <span className="font-semibold text-foreground">Hvorfor:</span>{" "}
                  <span className="text-muted-foreground">{s.reason}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
        {!checked ? (
          <button
            onClick={() => setChecked(true)}
            disabled={Object.values(picks).some((p) => p === null)}
            className="flex items-center gap-1.5 rounded bg-brand text-brand-foreground px-3 py-1.5 text-sm font-medium hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="h-3.5 w-3.5" /> Sjekk svar
          </button>
        ) : (
          <div className="text-sm">
            Du fikk{" "}
            <strong className="font-mono text-brand">
              {score} / {SCENARIOS.length}
            </strong>{" "}
            riktig.
            {score === SCENARIOS.length && (
              <span className="ml-2 text-emerald-600">Perfekt!</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
