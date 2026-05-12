import { useMemo, useState } from "react";
import { Check, X, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PcapScenario } from "@/lib/dte2507/pcapScenarios";

type AnswerState =
  | { kind: "unanswered" }
  | { kind: "answered"; selectedIndex: number; correct: boolean };

export function PcapQuiz({
  scenario,
  onSolved,
}: {
  scenario: PcapScenario;
  onSolved?: () => void;
}) {
  const [activeQ, setActiveQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({});

  const question = scenario.questions[activeQ];
  const state = answers[activeQ] ?? { kind: "unanswered" };

  const allDone = useMemo(
    () =>
      scenario.questions.every(
        (_q, i) => answers[i]?.kind === "answered" && answers[i]?.correct,
      ),
    [answers, scenario.questions],
  );

  const highlightRows = state.kind === "answered" ? question.highlight ?? [] : [];

  function answer(idx: number) {
    const isCorrect = !!question.options[idx]?.correct;
    setAnswers((prev) => ({
      ...prev,
      [activeQ]: { kind: "answered", selectedIndex: idx, correct: isCorrect },
    }));
    if (isCorrect && onSolved) {
      const nextAnswers = {
        ...answers,
        [activeQ]: { kind: "answered" as const, selectedIndex: idx, correct: true },
      };
      const done = scenario.questions.every(
        (_q, i) =>
          nextAnswers[i]?.kind === "answered" && nextAnswers[i]?.correct,
      );
      if (done) onSolved();
    }
  }

  function reset() {
    setAnswers({});
    setActiveQ(0);
  }

  return (
    <article className="space-y-4">
      <header>
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <div className="text-xs uppercase tracking-wider text-brand font-semibold">
              {scenario.topic} · vanskelighet {"●".repeat(scenario.difficulty)}
            </div>
            <h2 className="text-xl font-bold tracking-tight">{scenario.title}</h2>
          </div>
          {Object.keys(answers).length > 0 && (
            <button
              onClick={reset}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Nullstill
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{scenario.scenario}</p>
      </header>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-xs font-mono">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="text-left px-3 py-2 w-10">No.</th>
              <th className="text-left px-3 py-2 w-16">Time</th>
              <th className="text-left px-3 py-2 w-32">Source</th>
              <th className="text-left px-3 py-2 w-32">Destination</th>
              <th className="text-left px-3 py-2 w-20">Protocol</th>
              <th className="text-left px-3 py-2">Info</th>
            </tr>
          </thead>
          <tbody>
            {scenario.rows.map((r) => {
              const hl = highlightRows.includes(r.no);
              return (
                <tr
                  key={r.no}
                  className={cn(
                    "border-t border-border",
                    hl && "bg-brand/15 ring-1 ring-brand/40",
                  )}
                >
                  <td className="px-3 py-1.5">{r.no}</td>
                  <td className="px-3 py-1.5">{r.time}</td>
                  <td className="px-3 py-1.5">{r.src}</td>
                  <td className="px-3 py-1.5">{r.dst}</td>
                  <td className="px-3 py-1.5 text-brand">{r.proto}</td>
                  <td className="px-3 py-1.5">{r.info}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <nav className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground mr-2">Spørsmål:</span>
        {scenario.questions.map((_q, i) => {
          const a = answers[i];
          const isActive = i === activeQ;
          return (
            <button
              key={i}
              onClick={() => setActiveQ(i)}
              className={cn(
                "h-7 w-7 rounded-md text-xs font-medium border transition-colors",
                isActive
                  ? "bg-brand text-brand-foreground border-brand"
                  : "bg-card border-border text-muted-foreground hover:text-foreground",
                a?.kind === "answered" && a.correct && !isActive && "bg-success/20 text-success border-success/40",
                a?.kind === "answered" && !a.correct && !isActive && "bg-destructive/15 text-destructive border-destructive/40",
              )}
            >
              {i + 1}
            </button>
          );
        })}
        {allDone && (
          <span className="ml-auto text-xs text-success flex items-center gap-1">
            <Check className="h-3.5 w-3.5" /> Alle riktig!
          </span>
        )}
      </nav>

      <section className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-semibold mb-3 text-sm">
          Spørsmål {activeQ + 1} av {scenario.questions.length}: {question.prompt}
        </h3>
        <ul className="space-y-2">
          {question.options.map((opt, idx) => {
            const answered = state.kind === "answered";
            const isSelected = answered && state.selectedIndex === idx;
            const isCorrect = opt.correct;
            return (
              <li key={idx}>
                <button
                  disabled={answered}
                  onClick={() => answer(idx)}
                  className={cn(
                    "w-full text-left rounded-md border px-3 py-2 text-sm transition-colors",
                    !answered && "border-border bg-card hover:border-brand/40 hover:bg-brand/5",
                    answered && isCorrect && "border-success/60 bg-success/10",
                    answered && !isCorrect && isSelected && "border-destructive/60 bg-destructive/10",
                    answered && !isCorrect && !isSelected && "border-border bg-card opacity-70",
                  )}
                >
                  <div className="flex items-start gap-2">
                    {answered && isCorrect && (
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    )}
                    {answered && !isCorrect && isSelected && (
                      <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    )}
                    {!answered && (
                      <span className="font-mono text-xs text-muted-foreground shrink-0 mt-0.5">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                    )}
                    <span className="flex-1">{opt.text}</span>
                  </div>
                  {answered && opt.rationale && (isSelected || isCorrect) && (
                    <div className="mt-2 text-xs text-muted-foreground pl-6">
                      {opt.rationale}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        {state.kind === "answered" && (
          <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-3 text-sm flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div>
              <strong className="text-foreground">Forklaring:</strong>{" "}
              <span className="text-muted-foreground">{question.explanation}</span>
            </div>
          </div>
        )}
      </section>
    </article>
  );
}
