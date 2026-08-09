import { useState } from "react";
import { Bug, Wrench, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Oppgavetype 4 — FEILSØKING, delt mellom DTE-2505 modul 1b og modul 6.
//
// Sist i modulen, fordi den forutsetter alt det andre: feilen kan bo i hvilket
// som helst lag. Studenten ser hva som faktisk skjedde i terminalen, stiller
// diagnosen, og får deretter rettelsen med begrunnelse.
//
// Panelet er rent presentasjon — oppgavene defineres i `src/lib/dte2505/`, slik
// at innholdet kan etterprøves uten å rendre noe.
// ---------------------------------------------------------------------------

export interface TroubleTask {
  id: string;
  title: string;
  /** Det som faktisk skjedde: kommando og utdata, i rekkefølge. */
  transcript: { cmd: string; output: string[] }[];
  question: string;
  /** Diagnosealternativer. Nøyaktig én har `correct`. */
  options: { id: string; label: string; why: string; correct?: boolean }[];
  fix: { cmd: string; text: string };
  lesson: string;
}

/** Farger utdata slik at feil og advarsler skiller seg ut i terminalen. */
function linjeStil(l: string): string | undefined {
  if (l.trimStart().startsWith("(")) return "text-zinc-400";
  if (/^(E:|Err:|error:|dpkg: error|ssh:|Permission denied|Error:)/.test(l)) return "text-rose-400";
  if (/^(W:|Warning:|WARNING)/.test(l)) return "text-amber-400";
  return undefined;
}

export function FeilsokingPanel({
  tasks,
  prompt = "student@linux:~$ ",
}: {
  tasks: TroubleTask[];
  /** Ledeteksten i terminalen — modul 6 bruker en annen for fjernmaskinen. */
  prompt?: string;
}) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<Record<string, string>>({});

  const task = tasks[idx];
  const choice = picked[task.id];
  const chosen = task.options.find((o) => o.id === choice);
  const correct = Boolean(chosen?.correct);

  return (
    <div className="rounded-xl border-2 border-rose-500/30 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Bug className="h-4 w-4 text-rose-500" /> Feilsøking
          <span className="text-xs font-normal text-muted-foreground">
            {idx + 1} / {tasks.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {tasks.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setIdx(i)}
              title={t.title}
              className={cn(
                "h-6 w-6 rounded-md border text-xs",
                i === idx && "border-rose-500 bg-rose-500/15 font-semibold",
                picked[t.id] && i !== idx && "border-emerald-500/60 bg-emerald-500/10",
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="text-[11px] uppercase tracking-wider text-rose-500">{task.title}</div>

        <div className="mt-2 overflow-hidden rounded-lg border">
          <div className="border-b bg-muted/50 px-2.5 py-1 text-[11px] text-muted-foreground">
            Det som skjedde i terminalen
          </div>
          <div className="max-h-72 overflow-y-auto bg-zinc-950 px-3 py-2 font-mono text-xs leading-relaxed text-zinc-100">
            {task.transcript.map((t, i) => (
              <div key={i} className={cn(i > 0 && "mt-2")}>
                <div className="break-all text-emerald-400">
                  <span className="text-zinc-500">{prompt}</span>
                  {t.cmd}
                </div>
                {t.output.map((l, j) => (
                  <div key={j} className={cn("whitespace-pre-wrap break-all", linjeStil(l))}>
                    {l || " "}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <p className="mt-3 font-medium leading-relaxed">{task.question}</p>

        <div className="mt-2 grid gap-2">
          {task.options.map((o) => {
            const isPicked = choice === o.id;
            const show = Boolean(choice);
            return (
              <button
                key={o.id}
                onClick={() => !choice && setPicked((p) => ({ ...p, [task.id]: o.id }))}
                disabled={Boolean(choice)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  !show && "hover:bg-accent",
                  show && o.correct && "border-emerald-500/70 bg-emerald-500/10",
                  show && isPicked && !o.correct && "border-rose-500/70 bg-rose-500/10",
                  show && !o.correct && !isPicked && "opacity-55",
                )}
              >
                <div className="flex items-start gap-2">
                  {show && o.correct && (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  )}
                  {show && isPicked && !o.correct && (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  )}
                  <div>
                    <div>{o.label}</div>
                    {show && (isPicked || o.correct) && (
                      <div className="mt-1 text-xs text-muted-foreground">{o.why}</div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {choice && (
          <>
            <div
              className={cn(
                "mt-3 rounded-lg border p-3",
                correct ? "border-emerald-500/50 bg-emerald-500/5" : "border-amber-500/50 bg-amber-500/5",
              )}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <Wrench className="h-3.5 w-3.5" /> Rettelsen
              </div>
              <code className="mt-2 block break-all rounded-md border bg-muted/50 px-2 py-1 font-mono text-sm">
                {task.fix.cmd}
              </code>
              <p className="mt-2 text-sm leading-relaxed">{task.fix.text}</p>
            </div>

            <div className="mt-3 rounded-lg border border-brand/40 bg-brand/5 p-3 text-sm leading-relaxed">
              <span className="font-semibold">Lærdommen:</span> {task.lesson}
            </div>
          </>
        )}

        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <button
            onClick={() => setIdx((i) => (i - 1 + tasks.length) % tasks.length)}
            className="inline-flex items-center gap-1 rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" /> Forrige
          </button>
          <button
            onClick={() => setIdx((i) => (i + 1) % tasks.length)}
            className="inline-flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-sm text-brand-foreground hover:bg-brand/90"
          >
            Neste <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
