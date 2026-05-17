import { useState } from "react";
import { Check, X } from "lucide-react";

type EncodingId = "binary" | "real" | "order" | "tree";

const PROBLEMS: { id: string; text: string; correct: EncodingId; hint: string }[] = [
  {
    id: "p1",
    text: "Plasser 12 sensorer i et bygg slik at de dekker mest mulig areal. Hver sensor kan stå på (1) eller av (0).",
    correct: "binary",
    hint: "Hvert valg er ja/nei → bit-streng er den naturlige representasjonen.",
  },
  {
    id: "p2",
    text: "Tun et PID-regulator: finn Kp, Ki, Kd (alle flyttall) som gir minst overshoot på en motor-modell.",
    correct: "real",
    hint: "Tre kontinuerlige parametere → real-value med aritmetisk crossover + gaussisk mutation.",
  },
  {
    id: "p3",
    text: "Optimaliser leveranseruten for en bil som skal innom 15 kunder og tilbake til lageret. Hvilken rekkefølge gir kortest reise?",
    correct: "order",
    hint: "Permutasjon av byer → order encoding med OX/PMX. Binary crossover ville laget duplikater.",
  },
  {
    id: "p4",
    text: "Finn en formel som forklarer sammenhengen mellom temperatur, fuktighet og energiforbruk basert på 200 målepunkter.",
    correct: "tree",
    hint: "Strukturen (formelen) er ukjent og kan ha vilkårlig størrelse → tre-encoding (genetic programming).",
  },
];

const LABELS: Record<EncodingId, string> = {
  binary: "Binary encoding",
  real: "Real-value encoding",
  order: "Order encoding",
  tree: "Tree encoding",
};

const COLORS: Record<EncodingId, string> = {
  binary: "bg-blue-500/20 border-blue-400 text-blue-300",
  real: "bg-emerald-500/20 border-emerald-400 text-emerald-300",
  order: "bg-purple-500/20 border-purple-400 text-purple-300",
  tree: "bg-amber-500/20 border-amber-400 text-amber-300",
};

export function EncodingMatchQuiz() {
  const [answers, setAnswers] = useState<Record<string, EncodingId | null>>({});
  const [checked, setChecked] = useState(false);

  const setAns = (p: string, v: EncodingId) => {
    setAnswers((a) => ({ ...a, [p]: v }));
    setChecked(false);
  };
  const correctCount = PROBLEMS.filter((p) => answers[p.id] === p.correct).length;
  const allAnswered = PROBLEMS.every((p) => answers[p.id]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Test deg selv — match problem med encoding</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Velg riktig encoding-strategi for hvert problem. Trykk "Sjekk svar" når du er ferdig.
        </p>
      </div>

      <div className="space-y-3">
        {PROBLEMS.map((p, i) => {
          const ans = answers[p.id];
          const isCorrect = checked && ans === p.correct;
          const isWrong = checked && ans !== null && ans !== p.correct;
          return (
            <div
              key={p.id}
              className={`rounded-lg border p-3 ${
                isCorrect ? "border-emerald-500/60 bg-emerald-500/5" : isWrong ? "border-rose-500/60 bg-rose-500/5" : "border-border"
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="text-xs font-mono text-muted-foreground mt-0.5">#{i + 1}</span>
                <p className="text-sm flex-1">{p.text}</p>
                {checked && isCorrect && <Check className="h-4 w-4 text-emerald-500 shrink-0" />}
                {checked && isWrong && <X className="h-4 w-4 text-rose-500 shrink-0" />}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(Object.keys(LABELS) as EncodingId[]).map((k) => {
                  const sel = ans === k;
                  const correctChoice = checked && k === p.correct;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setAns(p.id, k)}
                      disabled={checked}
                      className={`px-2 py-1.5 text-xs rounded border transition ${
                        sel ? COLORS[k] : "bg-background border-border text-muted-foreground hover:text-foreground"
                      } ${correctChoice && !sel ? "ring-2 ring-emerald-500/40" : ""}`}
                    >
                      {LABELS[k]}
                    </button>
                  );
                })}
              </div>
              {checked && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <strong className={isCorrect ? "text-emerald-400" : "text-rose-400"}>
                    {isCorrect ? "Riktig" : `Riktig svar: ${LABELS[p.correct]}`}.
                  </strong>{" "}
                  {p.hint}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => setChecked(true)}
          disabled={!allAnswered}
          className="px-4 py-2 text-sm rounded bg-brand text-brand-foreground disabled:opacity-40"
        >
          Sjekk svar
        </button>
        <button
          type="button"
          onClick={() => {
            setAnswers({});
            setChecked(false);
          }}
          className="px-3 py-2 text-sm rounded border border-border text-muted-foreground"
        >
          Nullstill
        </button>
        {checked && (
          <span className="text-sm ml-2">
            Score: <strong className={correctCount === PROBLEMS.length ? "text-emerald-400" : "text-amber-400"}>{correctCount}/{PROBLEMS.length}</strong>
          </span>
        )}
      </div>
    </div>
  );
}
