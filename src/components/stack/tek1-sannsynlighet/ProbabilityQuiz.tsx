import { useState } from "react";

/**
 * ProbabilityQuiz — 10 scenarier. Blanding av klassiske aksiom-spørsmål
 * og counter-intuitive (Boy-Boy-paradokset, taxi-problemet, falske positive).
 *
 * Hvert scenario har 4 alternativer. Brukeren får forklaring etter svar,
 * og en sluttskår.
 */

interface Scenario {
  id: string;
  title: string;
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "q1",
    title: "Komplement på terning",
    question: "Du kaster en terning. Hva er P(IKKE 6)?",
    options: ["1/6", "5/6", "1/2", "0"],
    correctIdx: 1,
    explanation:
      "P(IKKE A) = 1 − P(A) = 1 − 1/6 = 5/6. Komplementregelen.",
  },
  {
    id: "q2",
    title: "Boy-Boy-paradokset (Gardner)",
    question:
      "En familie har 2 barn. Du får vite at MINST ett er en gutt. Hva er P(begge gutter)?",
    options: ["1/2", "1/3", "1/4", "2/3"],
    correctIdx: 1,
    explanation:
      "Utfallsrom for 2 barn er {GG, GJ, JG, JJ} med lik P. Betingelsen utelukker JJ — 3 muligheter igjen, hvorav 1 er GG. P = 1/3. Intuisjonen sier 1/2 men det er feil fordi GJ og JG begge inneholder en gutt.",
  },
  {
    id: "q3",
    title: "Taxi-problemet (Tversky & Kahneman)",
    question:
      "85 % av taxiene i byen er grønne, 15 % er blå. Et vitne sier en BLÅ taxi forårsaket ulykke. Vitnet er korrekt 80 % av tiden uavhengig av farge. Hva er P(taxien faktisk blå | vitnet sier blå)?",
    options: ["≈ 80 %", "≈ 41 %", "≈ 50 %", "≈ 15 %"],
    correctIdx: 1,
    explanation:
      "Bayes: P(B|sier B) = (0.8·0.15) / (0.8·0.15 + 0.2·0.85) = 0.12 / (0.12 + 0.17) = 0.12/0.29 ≈ 0.41. Lav prior (15 % blå) drar svaret ned tross 80 % vitne-pålitelighet.",
  },
  {
    id: "q4",
    title: "Disjunkt vs uavhengig",
    question:
      "Hendelsene A og B er DISJUNKTE (gjensidig utelukkende) og P(A) > 0, P(B) > 0. Er de uavhengige?",
    options: [
      "Ja, alltid",
      "Nei, aldri",
      "Bare hvis P(A) = P(B)",
      "Kommer an på Ω",
    ],
    correctIdx: 1,
    explanation:
      "Disjunkte med positive sannsynligheter er NØDVENDIGVIS avhengige: vet du at B skjedde, vet du at A IKKE skjedde. Formelt: P(A∩B) = 0 ≠ P(A)·P(B) > 0.",
  },
  {
    id: "q5",
    title: "Inklusjon-eksklusjon",
    question:
      "P(A) = 0.6, P(B) = 0.5, P(A ∩ B) = 0.3. Hva er P(A ∪ B)?",
    options: ["1.1", "0.8", "0.5", "0.9"],
    correctIdx: 1,
    explanation:
      "P(A ∪ B) = P(A) + P(B) − P(A∩B) = 0.6 + 0.5 − 0.3 = 0.8. Hvis du glemmer å trekke fra snittet, ender du på 1.1, som er umulig.",
  },
  {
    id: "q6",
    title: "Minst én suksess",
    question:
      "En enhet feiler med P = 0.01 per dag. Hva er P(minst én feil i 30 dager)?",
    options: ["0.30", "≈ 0.26", "≈ 0.74", "≈ 0.01"],
    correctIdx: 1,
    explanation:
      "Komplement: P(minst én) = 1 − P(ingen) = 1 − 0.99^30 ≈ 1 − 0.7397 ≈ 0.2603. Direkte sum av P(1)+P(2)+… er upraktisk; komplement er nesten alltid raskeste vei.",
  },
  {
    id: "q7",
    title: "Bursdag-paradokset (intuisjon)",
    question:
      "I et rom med 23 personer (alle bursdager uavhengige, 365 dager), hva er P(minst to deler bursdag)?",
    options: ["≈ 6 %", "≈ 25 %", "≈ 50 %", "≈ 90 %"],
    correctIdx: 2,
    explanation:
      "P(ingen deler) = 365/365 · 364/365 · ... · 343/365 ≈ 0.493. P(minst to deler) ≈ 0.507 — drøyt 50 %. Folk gjetter mye lavere fordi vi forveksler «noen deler MED MEG» med «noen deler i det hele tatt».",
  },
  {
    id: "q8",
    title: "Bayes med høyere prevalens",
    question:
      "Sykdom prevalens 10 %. Test sensitivitet 90 %, spesifisitet 90 %. P(syk | test +) ≈ ?",
    options: ["≈ 9 %", "≈ 50 %", "≈ 90 %", "≈ 10 %"],
    correctIdx: 1,
    explanation:
      "P(+) = 0.9·0.1 + 0.1·0.9 = 0.18. P(syk|+) = 0.09/0.18 = 0.50. Med prevalens 10 % gir en symmetrisk 90 %-test bare 50 % PPV — fortsatt langt under hva folk forventer.",
  },
  {
    id: "q9",
    title: "Kombinasjon eller permutasjon?",
    question:
      "Du skal velge 3 personer av 10 til en komité (alle likestilte). Antall mulige komiteer?",
    options: ["10! / 7! = 720", "C(10,3) = 120", "10^3 = 1000", "10 · 9 · 8 / 6 = 120 (samme svar som B)"],
    correctIdx: 1,
    explanation:
      "Rekkefølge spiller ingen rolle ⇒ kombinasjon. C(10,3) = 10!/(3!·7!) = 120. (D er teknisk samme tall som B — riktig formel: kombinasjon, ikke permutasjon.)",
  },
  {
    id: "q10",
    title: "Trekning uten tilbakelegging",
    question:
      "En urne har 5 røde og 5 blå baller. Du trekker 2 uten tilbakelegging. P(begge røde)?",
    options: ["1/4 = 0.25", "5/10 · 5/10 = 0.25", "5/10 · 4/9 ≈ 0.22", "1/2"],
    correctIdx: 2,
    explanation:
      "Andre trekk er avhengig av første. Etter at en rød er trukket: 4 røde av 9 igjen. P = (5/10)·(4/9) = 20/90 ≈ 0.222. Alternativ B antar tilbakelegging og er feil.",
  },
];

export function ProbabilityQuiz() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  function selectAnswer(qid: string, idx: number) {
    if (revealed[qid]) return;
    setAnswers((a) => ({ ...a, [qid]: idx }));
  }
  function reveal(qid: string) {
    setRevealed((r) => ({ ...r, [qid]: true }));
  }
  function resetAll() {
    setAnswers({});
    setRevealed({});
  }

  const total = SCENARIOS.length;
  const answered = Object.keys(answers).length;
  const correct = SCENARIOS.filter((s) => answers[s.id] === s.correctIdx && revealed[s.id]).length;
  const revealedCount = Object.values(revealed).filter(Boolean).length;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="text-muted-foreground">
          Besvart: <span className="font-mono font-semibold">{answered}/{total}</span>
          {revealedCount > 0 && (
            <>
              {" · "}Rett: <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{correct}/{revealedCount}</span>
            </>
          )}
        </div>
        <button
          onClick={resetAll}
          className="px-2.5 py-1 rounded-md border border-border bg-background hover:bg-muted/50 transition-colors"
        >
          Nullstill
        </button>
      </div>

      <div className="space-y-4">
        {SCENARIOS.map((s, i) => {
          const userIdx = answers[s.id];
          const isRevealed = !!revealed[s.id];
          const isRight = isRevealed && userIdx === s.correctIdx;
          return (
            <div
              key={s.id}
              className={`rounded-lg border p-4 transition-colors ${
                isRevealed
                  ? isRight
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-rose-500/40 bg-rose-500/5"
                  : "border-border bg-background"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <h3 className="text-sm font-semibold">
                  {i + 1}. {s.title}
                </h3>
                {isRevealed && (
                  <span className={`text-xs font-mono ${isRight ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {isRight ? "RIKTIG" : "FEIL"}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">{s.question}</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {s.options.map((opt, idx) => {
                  const selected = userIdx === idx;
                  const showCorrect = isRevealed && idx === s.correctIdx;
                  const showWrong = isRevealed && selected && idx !== s.correctIdx;
                  return (
                    <button
                      key={idx}
                      onClick={() => selectAnswer(s.id, idx)}
                      disabled={isRevealed}
                      className={`text-left px-3 py-2 rounded-md text-xs border transition-colors ${
                        showCorrect
                          ? "border-emerald-500/60 bg-emerald-500/10 text-foreground"
                          : showWrong
                          ? "border-rose-500/60 bg-rose-500/10 text-foreground"
                          : selected
                          ? "border-brand bg-brand/10 text-foreground"
                          : "border-border bg-background hover:bg-muted/50 text-muted-foreground"
                      } disabled:cursor-not-allowed`}
                    >
                      <span className="font-mono mr-2">{String.fromCharCode(65 + idx)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {!isRevealed && userIdx !== undefined && (
                <button
                  onClick={() => reveal(s.id)}
                  className="mt-3 px-3 py-1.5 rounded-md text-xs border border-brand/40 bg-brand/10 hover:bg-brand/20 transition-colors"
                >
                  Sjekk svar
                </button>
              )}
              {isRevealed && (
                <div className="mt-3 text-[11px] text-foreground leading-relaxed border-t border-border pt-2">
                  <strong>Forklaring:</strong> {s.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {revealedCount === total && (
        <div className="rounded-md border border-brand/40 bg-brand/10 p-3 text-sm text-center">
          <strong>Ferdig!</strong> {correct} av {total} riktig (
          {((correct / total) * 100).toFixed(0)} %).
          {correct >= 8
            ? " Sterk forståelse — Bayes-intuisjonen sitter."
            : correct >= 5
            ? " Solid grunnlag. Repetér Bayes og Boy-Boy-paradokset."
            : " Repetér grunnaksiomene og Bayes-eksemplene over."}
        </div>
      )}
    </div>
  );
}
