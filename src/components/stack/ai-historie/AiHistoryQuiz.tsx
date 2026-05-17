import { useMemo, useState } from "react";

/**
 * 8-spørsmåls quiz om AI-historie. Hver spørsmål har 4 alternativer,
 * og etter svar vises kontekst-tekst (hvorfor, hva som kom etter).
 */

type Question = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  context: string;
};

const QUESTIONS: Question[] = [
  {
    id: "q-dartmouth",
    prompt: "Hvilket år ble uttrykket «artificial intelligence» myntet, og hvem foreslo det?",
    options: [
      "1950 — Alan Turing",
      "1956 — John McCarthy",
      "1968 — Marvin Minsky",
      "1986 — Geoffrey Hinton",
    ],
    correctIndex: 1,
    context:
      "Dartmouth-konferansen sommeren 1956 ble organisert av John McCarthy. Han, sammen med Minsky, Shannon og Rochester, ville definere det nye fagfeltet. Turing publiserte sin berømte 1950-artikkel («Computing Machinery and Intelligence»), men han brukte ikke uttrykket «AI».",
  },
  {
    id: "q-perceptron",
    prompt: "Hvem viste matematisk at en enkel perceptron ikke kan lære XOR — og dermed (utilsiktet) startet første AI-vinter?",
    options: [
      "McCulloch & Pitts (1943)",
      "Frank Rosenblatt (1958)",
      "Minsky & Papert (1969)",
      "Rumelhart & Hinton (1986)",
    ],
    correctIndex: 2,
    context:
      "Marvin Minsky og Seymour Paperts bok «Perceptrons» (1969) viste at single-layer perceptron ikke kan løse lineært ikke-separable problemer. Konklusjonen ble overtolket til at alle nevrale nett var dødfødte, og connectionism døde i nesten 20 år. Backprop (1986) fra Rumelhart/Hinton/Williams løste problemet med fler-lag-nett.",
  },
  {
    id: "q-deep-blue",
    prompt: "Da Deep Blue slo Kasparov i 1997 — hvordan «tenkte» systemet?",
    options: [
      "Dyp læring med CNN",
      "Reinforcement learning som AlphaGo",
      "Brute-force søk + håndlagde sjakk-regler",
      "Transformer-arkitektur",
    ],
    correctIndex: 2,
    context:
      "Deep Blue evaluerte ~200 millioner posisjoner per sekund, basert på håndlagde evalueringsfunksjoner laget av Joel Benjamin og andre stormesterer. Symbolisk AI på sitt mest brutale. AlphaGo (2016) gjorde Go via dyp læring + RL, ikke brute force — Go har for mange posisjoner.",
  },
  {
    id: "q-alexnet",
    prompt: "Hvilket år vant AlexNet ImageNet-konkurransen og startet «moderne» deep learning-revolusjonen?",
    options: ["2006", "2010", "2012", "2017"],
    correctIndex: 2,
    context:
      "AlexNet (Krizhevsky, Sutskever, Hinton) vant ImageNet 2012 med 15.3% topp-5-feilrate vs forrige beste 26.2%. CNN + GPU + store data viste seg å være en kvalitativ revolusjon. 2006 var Hintons «deep belief nets»-paper (rebranding fra NN → DL), 2017 var Transformer-paperet («Attention is all you need»).",
  },
  {
    id: "q-attention",
    prompt: "Hva er den sentrale arkitektur-innovasjonen i Transformer (Vaswani et al. 2017)?",
    options: [
      "Konvolusjon over tekst",
      "Self-attention — hver token kan se hver annen direkte",
      "Lange korttidsminne-celler (LSTM)",
      "Bayesianske sannsynligheter mellom ord",
    ],
    correctIndex: 1,
    context:
      "Tittelen «Attention is all you need» er bokstavelig: dropp RNN/LSTM, dropp konvolusjon, bruk bare self-attention + feed-forward. Hver token beregner attention-vekter mot alle andre, parallelt. Dette skalerer effektivt på GPU/TPU og er fundamentet for GPT, BERT, Claude, Gemini.",
  },
  {
    id: "q-eliza",
    prompt: "Hva var ELIZA (1966), og hva avslørte Joseph Weizenbaum gjennom den?",
    options: [
      "Første nevrale nett — viste at perceptron kunne lære",
      "Mønster-matching-chatbot — viste at folk tilskriver intelligens til trivielle systemer",
      "Schakk-program — viste at AI kunne slå mestere",
      "Expert system — viste at regler kan matche eksperter",
    ],
    correctIndex: 1,
    context:
      "ELIZA simulerte en Rogeriansk terapeut med enkel mønster-matching («Jeg er trist» → «Hvorfor er du trist?»). Folk åpnet seg dypt for programmet selv etter at Weizenbaum forklarte at det var trivielt. «Eliza-effekten» er fortsatt aktuell — folk tilskriver forståelse til moderne LLMs som teknisk sett bare gjør next-token-prediction.",
  },
  {
    id: "q-vinter",
    prompt: "Hva var hovedårsaken til andre AI-vinter (1987-1993)?",
    options: [
      "Internett tok ressurser bort fra AI",
      "Expert systems brakk sammen + LISP-maskiner ble utdaterte",
      "GPU-er var ikke oppfunnet ennå",
      "Turing-testen ble erklært umulig",
    ],
    correctIndex: 1,
    context:
      "Expert systems-markedet kollapset rundt 1990: regler var skjøre, vedlikeholdskostnader eksploderte, og spesialdesignet LISP-hardware (Symbolics, LMI) ble utkonkurrert av billig generell-hardware. Japan sitt 5th Generation Computer Project ($850M) ga heller ikke avkastning. Resultatet: massive nedskjæringer, AI-merket ble «giftig» i 5+ år.",
  },
  {
    id: "q-gpt3",
    prompt: "Hva var det viktigste konseptuelle gjennombruddet GPT-3 (2020) demonstrerte?",
    options: [
      "Backpropagation kunne brukes på språk",
      "In-context learning — modellen lærer nye oppgaver fra eksempler i prompten",
      "Konvolusjoner kunne erstatte attention",
      "Reinforcement learning løser alle NLP-problemer",
    ],
    correctIndex: 1,
    context:
      "GPT-3 (175B parametre) viste at modellen kunne løse nye oppgaver gitt få eksempler i prompten — uten fine-tuning. Dette var en ny modus for «programmering» av AI. Sammen med «emergent abilities» (kapabiliteter som ikke fantes ved mindre skala) endret det forskeres forventninger om hva ren skalering kunne oppnå. La grunnlaget for ChatGPT (2022).",
  },
];

export function AiHistoryQuiz() {
  const [answers, setAnswers] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(QUESTIONS.map((q) => [q.id, null])),
  );
  const [revealed, setRevealed] = useState(false);

  const correctCount = useMemo(
    () => QUESTIONS.filter((q) => answers[q.id] === q.correctIndex).length,
    [answers],
  );
  const allAnswered = QUESTIONS.every((q) => answers[q.id] !== null);

  function reset() {
    setAnswers(Object.fromEntries(QUESTIONS.map((q) => [q.id, null])));
    setRevealed(false);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-lg font-semibold mb-1">Quiz — 8 spørsmål om AI-historikken</h3>
      <p className="text-xs text-muted-foreground mb-5">
        Velg ett svar per spørsmål. Du får fasit + kontekst etter du har trykket
        «Sjekk svar».
      </p>

      <div className="space-y-5">
        {QUESTIONS.map((q, qi) => {
          const selected = answers[q.id];
          return (
            <div key={q.id} className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-xs font-mono text-muted-foreground">Spørsmål {qi + 1}/{QUESTIONS.length}</span>
              </div>
              <p className="text-sm font-medium text-foreground mb-3">{q.prompt}</p>
              <div className="space-y-1.5">
                {q.options.map((opt, i) => {
                  const isSel = selected === i;
                  const isCorrect = i === q.correctIndex;
                  const showColor = revealed && isSel;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={revealed}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                      className={`w-full text-left text-sm px-3 py-2 rounded-md border transition ${
                        showColor
                          ? isCorrect
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100"
                            : "border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100"
                          : revealed && isCorrect
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                            : isSel
                              ? "border-brand bg-brand/5"
                              : "border-border bg-card hover:border-brand/50"
                      } ${revealed ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <span className="inline-block w-5 font-mono text-muted-foreground">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {revealed && (
                <div className="mt-3 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs">
                  <div className="font-semibold text-brand mb-1">Kontekst</div>
                  <p className="text-foreground/90 leading-relaxed">{q.context}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-3 flex-wrap">
        {!revealed ? (
          <>
            <button
              type="button"
              disabled={!allAnswered}
              onClick={() => setRevealed(true)}
              className="px-4 py-2 rounded-md bg-brand text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand/90 transition"
            >
              Sjekk svar
            </button>
            {!allAnswered && (
              <span className="text-xs text-muted-foreground">
                Svar på alle {QUESTIONS.length} for å sjekke.
              </span>
            )}
          </>
        ) : (
          <>
            <div className="text-sm">
              Du fikk{" "}
              <strong className="text-foreground text-base">
                {correctCount} av {QUESTIONS.length}
              </strong>{" "}
              riktig.
              {correctCount === QUESTIONS.length && (
                <span className="ml-2 text-emerald-600 font-medium">Perfekt!</span>
              )}
              {correctCount >= QUESTIONS.length - 1 && correctCount < QUESTIONS.length && (
                <span className="ml-2 text-emerald-600">Veldig bra.</span>
              )}
              {correctCount >= QUESTIONS.length / 2 && correctCount < QUESTIONS.length - 1 && (
                <span className="ml-2 text-brand">Bra start — kjør tidslinjen igjen.</span>
              )}
              {correctCount < QUESTIONS.length / 2 && (
                <span className="ml-2 text-amber-600">
                  Gå tilbake til tidslinjen og nøkkel-momentene først.
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={reset}
              className="px-3 py-1.5 rounded-md text-xs text-muted-foreground border border-border hover:text-foreground"
            >
              Nullstill
            </button>
          </>
        )}
      </div>
    </div>
  );
}
