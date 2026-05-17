import { useMemo, useState } from "react";

// CombinatoricsMatchQuiz
// 8 praktiske use-cases — brukeren matcher hver til riktig formeltype.
// Formler:
//   n!            — permutasjon av ALLE n elementer
//   P(n,r)        — permutasjon av r av n (uten gjentakelse, rekkefølge teller)
//   C(n,r)        — kombinasjon av r av n (uten gjentakelse, uten rekkefølge)
//   n^k           — k uavhengige valg fra n alternativer (med gjentakelse, rekkefølge teller)
//   multinomial   — n!/(n1!·n2!·…) — del n i grupper / anagram med duplikater

type FormulaKey = "fact" | "perm" | "comb" | "power" | "multinomial";

const FORMULAS: { key: FormulaKey; label: string; hint: string }[] = [
  { key: "fact", label: "n!", hint: "Rekkefølge av ALLE n" },
  { key: "perm", label: "P(n,r) = n!/(n−r)!", hint: "Rangering: r av n, rekkefølge teller" },
  { key: "comb", label: "C(n,r) = n!/(r!(n−r)!)", hint: "Utvalg: r av n, rekkefølge teller IKKE" },
  { key: "power", label: "n^k", hint: "k uavhengige valg, gjentakelse OK" },
  { key: "multinomial", label: "n!/(n₁!·n₂!·…)", hint: "Anagram / dele i grupper" },
];

type Question = {
  id: string;
  text: string;
  correct: FormulaKey;
  why: string;
};

const QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "8 personer sitter rundt et bord — hvor mange ulike plasseringer er det? (Vi bryr oss om rekkefølgen rundt bordet.)",
    correct: "fact",
    why: "Alle 8 plasseres i en sekvens — n! = 8! = 40 320.",
  },
  {
    id: "q2",
    text: "Du spiller Lotto og krysser av 7 ulike tall mellom 1 og 34. Hvor mange ulike kuponger finnes?",
    correct: "comb",
    why: "Et utvalg av 7 av 34 uten rekkefølge — C(34,7) = 5 379 616.",
  },
  {
    id: "q3",
    text: "10 bøker skal stilles i en hylle — hvor mange måter kan de stilles på?",
    correct: "fact",
    why: "Rekkefølge av alle 10 — 10! = 3 628 800.",
  },
  {
    id: "q4",
    text: "Du trekker 5 kort fra en kortstokk på 52 (en pokerhand).",
    correct: "comb",
    why: "Rekkefølgen i hånden teller ikke — C(52,5) = 2 598 960.",
  },
  {
    id: "q5",
    text: "Antall ulike anagram av ordet «MISSISSIPPI» (11 bokstaver: M, 4·I, 4·S, 2·P).",
    correct: "multinomial",
    why: "Multinomial: 11!/(1!·4!·4!·2!) = 34 650.",
  },
  {
    id: "q6",
    text: "PIN-kode på 4 sifre (0–9), hvert siffer kan gjentas — hvor mange koder finnes?",
    correct: "power",
    why: "4 uavhengige valg av 10 — 10^4 = 10 000.",
  },
  {
    id: "q7",
    text: "12 løpere stiller til start — hvor mange ulike topp-3-podier (gull/sølv/bronse) er mulig?",
    correct: "perm",
    why: "Rangering av 3 av 12 — P(12,3) = 12·11·10 = 1 320.",
  },
  {
    id: "q8",
    text: "20 elever skal deles i en gruppe på 5, en på 7 og en på 8 — hvor mange måter?",
    correct: "multinomial",
    why: "Del n=20 i grupper (5,7,8): 20!/(5!·7!·8!) = 99 768 240.",
  },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function CombinatoricsMatchQuiz() {
  const [answers, setAnswers] = useState<Record<string, FormulaKey | null>>({});
  const [submitted, setSubmitted] = useState(false);
  const [order, setOrder] = useState<Question[]>(() => shuffle(QUESTIONS));

  const score = useMemo(
    () => QUESTIONS.filter((q) => answers[q.id] === q.correct).length,
    [answers],
  );
  const answeredCount = Object.values(answers).filter((v) => v !== null && v !== undefined).length;

  function setAnswer(qid: string, f: FormulaKey) {
    setAnswers((a) => ({ ...a, [qid]: f }));
  }

  function reset() {
    setAnswers({});
    setSubmitted(false);
    setOrder(shuffle(QUESTIONS));
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          Hvilken formel? — match 8 use-cases
        </div>
        <div className="text-xs text-muted-foreground">
          Svart {answeredCount}/{QUESTIONS.length}
          {submitted && (
            <>
              {" · "}
              <span
                className={
                  score === QUESTIONS.length
                    ? "text-emerald-500 font-semibold"
                    : "text-foreground font-semibold"
                }
              >
                {score}/{QUESTIONS.length} riktig
              </span>
            </>
          )}
        </div>
      </div>

      {/* Formel-legende */}
      <div className="rounded-lg border border-border bg-background p-3 text-xs">
        <div className="text-muted-foreground mb-1.5">Formel-bibliotek:</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {FORMULAS.map((f) => (
            <div key={f.key} className="flex items-baseline gap-2">
              <span className="font-mono text-brand font-semibold">{f.label}</span>
              <span className="text-muted-foreground">— {f.hint}</span>
            </div>
          ))}
        </div>
      </div>

      <ol className="space-y-3">
        {order.map((q, idx) => {
          const chosen = answers[q.id];
          const correct = submitted && chosen === q.correct;
          const wrong = submitted && chosen && chosen !== q.correct;
          return (
            <li
              key={q.id}
              className={`rounded-lg border p-3 text-sm ${
                correct
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : wrong
                    ? "border-rose-500/40 bg-rose-500/5"
                    : "border-border bg-background"
              }`}
            >
              <div className="font-medium mb-2">
                {idx + 1}. {q.text}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {FORMULAS.map((f) => {
                  const isChosen = chosen === f.key;
                  const isCorrectKey = submitted && f.key === q.correct;
                  return (
                    <button
                      key={f.key}
                      onClick={() => !submitted && setAnswer(q.id, f.key)}
                      disabled={submitted}
                      className={`rounded-md border px-2 py-1 text-xs font-mono transition-colors ${
                        isCorrectKey
                          ? "border-emerald-500 bg-emerald-500/20 text-foreground"
                          : isChosen
                            ? wrong
                              ? "border-rose-500 bg-rose-500/20 text-foreground"
                              : "border-brand bg-brand/15 text-foreground"
                            : "border-border bg-background hover:border-brand/40"
                      } ${submitted ? "cursor-default" : "cursor-pointer"}`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <strong className="text-foreground">Svar:</strong> {q.why}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex gap-2">
        {!submitted ? (
          <button
            onClick={() => setSubmitted(true)}
            disabled={answeredCount < QUESTIONS.length}
            className="rounded-lg bg-brand text-brand-foreground px-4 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Sjekk svar
          </button>
        ) : (
          <button
            onClick={reset}
            className="rounded-lg border border-border bg-background px-4 py-1.5 text-sm hover:border-brand/40"
          >
            Prøv på nytt
          </button>
        )}
      </div>
    </div>
  );
}
