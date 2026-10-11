// Steg-for-steg visualisering av event-loopen: call stack, microtask queue,
// task queue og console-output. Studenten velger en kodesnutt, trykker
// «neste», og ser hvordan jobber flytter seg mellom køer mens output bygges
// opp. Hovedpoenget: microtasks tømmes HELT før neste task — derfor kjører
// Promise.then() før setTimeout(0).

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = "sync" | "microtask" | "task" | "done";

interface Step {
  /** Hvilken fase event-loopen er i akkurat nå. */
  phase: Phase;
  /** Kortbeskrivelse av hva som skjer. */
  description: string;
  /** Linje i kodesnutten som «kjører» (1-indeksert). 0 = ingen. */
  highlightLine: number;
  stack: string[];
  microtasks: string[];
  tasks: string[];
  output: string[];
}

interface Snippet {
  id: string;
  title: string;
  code: string;
  expectedOutput: string;
  takeaway: string;
  steps: Step[];
}

const SNIPPETS: Snippet[] = [
  {
    id: "klassisk",
    title: "Klassisk: log, setTimeout, Promise, log",
    code: `console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");`,
    expectedOutput: "1, 4, 3, 2",
    takeaway:
      "1 og 4 er synkrone og logges først. 3 er en microtask — tømmes før neste task. 2 er en task (setTimeout) — kjøres til slutt.",
    steps: [
      { phase: "sync", description: "Start — main-script på stacken.", highlightLine: 0, stack: ["<main>"], microtasks: [], tasks: [], output: [] },
      { phase: "sync", description: "Linje 1: console.log(\"1\") kjører.", highlightLine: 1, stack: ["<main>", "console.log"], microtasks: [], tasks: [], output: ["1"] },
      { phase: "sync", description: "Linje 1 ferdig — pop av stacken.", highlightLine: 1, stack: ["<main>"], microtasks: [], tasks: [], output: ["1"] },
      { phase: "sync", description: "Linje 2: setTimeout planlegger en TASK.", highlightLine: 2, stack: ["<main>"], microtasks: [], tasks: ["() => log('2')"], output: ["1"] },
      { phase: "sync", description: "Linje 3: Promise.resolve().then(...) planlegger en MICROTASK.", highlightLine: 3, stack: ["<main>"], microtasks: ["() => log('3')"], tasks: ["() => log('2')"], output: ["1"] },
      { phase: "sync", description: "Linje 4: console.log(\"4\") kjører.", highlightLine: 4, stack: ["<main>", "console.log"], microtasks: ["() => log('3')"], tasks: ["() => log('2')"], output: ["1", "4"] },
      { phase: "sync", description: "Main-script ferdig — stacken er tom.", highlightLine: 0, stack: [], microtasks: ["() => log('3')"], tasks: ["() => log('2')"], output: ["1", "4"] },
      { phase: "microtask", description: "Event-loop: stack tom → tøm microtask-køen FØRST.", highlightLine: 3, stack: ["() => log('3')"], microtasks: [], tasks: ["() => log('2')"], output: ["1", "4"] },
      { phase: "microtask", description: "Microtask kjører: logger \"3\".", highlightLine: 3, stack: ["() => log('3')", "console.log"], microtasks: [], tasks: ["() => log('2')"], output: ["1", "4", "3"] },
      { phase: "microtask", description: "Microtask-køen tom.", highlightLine: 0, stack: [], microtasks: [], tasks: ["() => log('2')"], output: ["1", "4", "3"] },
      { phase: "task", description: "Event-loop: plukk neste TASK fra task-køen.", highlightLine: 2, stack: ["() => log('2')"], microtasks: [], tasks: [], output: ["1", "4", "3"] },
      { phase: "task", description: "Task kjører: logger \"2\".", highlightLine: 2, stack: ["() => log('2')", "console.log"], microtasks: [], tasks: [], output: ["1", "4", "3", "2"] },
      { phase: "done", description: "Alt ferdig. Output: 1, 4, 3, 2.", highlightLine: 0, stack: [], microtasks: [], tasks: [], output: ["1", "4", "3", "2"] },
    ],
  },
  {
    id: "async-await",
    title: "async/await — await er sukker for Promise.then",
    code: `async function f() {
  console.log("A");
  await null;
  console.log("B");
}
f();
console.log("C");`,
    expectedOutput: "A, C, B",
    takeaway:
      "Alt før første await er synkront. Etter await pauses funksjonen og fortsettelsen blir en microtask — derfor logges C før B selv om B \"står like under\" i koden.",
    steps: [
      { phase: "sync", description: "Start — main-script på stacken.", highlightLine: 0, stack: ["<main>"], microtasks: [], tasks: [], output: [] },
      { phase: "sync", description: "Linje 6: f() kalles — pusher f på stacken.", highlightLine: 6, stack: ["<main>", "f"], microtasks: [], tasks: [], output: [] },
      { phase: "sync", description: "Linje 2: logger \"A\" (synkron del av f).", highlightLine: 2, stack: ["<main>", "f", "console.log"], microtasks: [], tasks: [], output: ["A"] },
      { phase: "sync", description: "Linje 3: await null pauser f. Resten av f blir en microtask.", highlightLine: 3, stack: ["<main>"], microtasks: ["f-fortsettelse"], tasks: [], output: ["A"] },
      { phase: "sync", description: "Linje 7: logger \"C\".", highlightLine: 7, stack: ["<main>", "console.log"], microtasks: ["f-fortsettelse"], tasks: [], output: ["A", "C"] },
      { phase: "sync", description: "Main-script ferdig.", highlightLine: 0, stack: [], microtasks: ["f-fortsettelse"], tasks: [], output: ["A", "C"] },
      { phase: "microtask", description: "Tøm microtask-køen: f-fortsettelse kjører.", highlightLine: 4, stack: ["f-fortsettelse"], microtasks: [], tasks: [], output: ["A", "C"] },
      { phase: "microtask", description: "Linje 4: logger \"B\".", highlightLine: 4, stack: ["f-fortsettelse", "console.log"], microtasks: [], tasks: [], output: ["A", "C", "B"] },
      { phase: "done", description: "Output: A, C, B.", highlightLine: 0, stack: [], microtasks: [], tasks: [], output: ["A", "C", "B"] },
    ],
  },
  {
    id: "nested",
    title: "Microtasks lager flere microtasks → blokkerer tasks",
    code: `setTimeout(() => console.log("T"), 0);
Promise.resolve().then(() => {
  console.log("M1");
  Promise.resolve().then(() => console.log("M2"));
});`,
    expectedOutput: "M1, M2, T",
    takeaway:
      "Microtask-køen tømmes HELT — også de som lages MENS du tømmer. En microtask kan lage flere microtasks, og alle de kjører før neste task. Derfor kan en uendelig promise-løkke blokkere UI-en.",
    steps: [
      { phase: "sync", description: "Start.", highlightLine: 0, stack: ["<main>"], microtasks: [], tasks: [], output: [] },
      { phase: "sync", description: "Linje 1: setTimeout planlegger task T.", highlightLine: 1, stack: ["<main>"], microtasks: [], tasks: ["() => log('T')"], output: [] },
      { phase: "sync", description: "Linje 2: Promise.then planlegger microtask M.", highlightLine: 2, stack: ["<main>"], microtasks: ["() => {log('M1'); ...}"], tasks: ["() => log('T')"], output: [] },
      { phase: "sync", description: "Main-script ferdig.", highlightLine: 0, stack: [], microtasks: ["() => {log('M1'); ...}"], tasks: ["() => log('T')"], output: [] },
      { phase: "microtask", description: "Tøm microtasks: M kjører.", highlightLine: 3, stack: ["M"], microtasks: [], tasks: ["() => log('T')"], output: [] },
      { phase: "microtask", description: "M logger \"M1\".", highlightLine: 3, stack: ["M", "console.log"], microtasks: [], tasks: ["() => log('T')"], output: ["M1"] },
      { phase: "microtask", description: "M planlegger en NY microtask M2 — köen er ikke tom.", highlightLine: 4, stack: ["M"], microtasks: ["() => log('M2')"], tasks: ["() => log('T')"], output: ["M1"] },
      { phase: "microtask", description: "M ferdig. Køen er fortsatt ikke tom — fortsett å tømme.", highlightLine: 0, stack: [], microtasks: ["() => log('M2')"], tasks: ["() => log('T')"], output: ["M1"] },
      { phase: "microtask", description: "M2 kjører og logger \"M2\".", highlightLine: 4, stack: ["() => log('M2')", "console.log"], microtasks: [], tasks: ["() => log('T')"], output: ["M1", "M2"] },
      { phase: "task", description: "Microtask-køen endelig tom. Plukk task T.", highlightLine: 1, stack: ["() => log('T')"], microtasks: [], tasks: [], output: ["M1", "M2"] },
      { phase: "task", description: "T logger \"T\".", highlightLine: 1, stack: ["() => log('T')", "console.log"], microtasks: [], tasks: [], output: ["M1", "M2", "T"] },
      { phase: "done", description: "Output: M1, M2, T.", highlightLine: 0, stack: [], microtasks: [], tasks: [], output: ["M1", "M2", "T"] },
    ],
  },
];

export function EventLoopVisualizer() {
  const [snippetId, setSnippetId] = useState(SNIPPETS[0].id);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const snippet = useMemo(
    () => SNIPPETS.find(s => s.id === snippetId) ?? SNIPPETS[0],
    [snippetId],
  );
  const step = snippet.steps[stepIdx];

  // Auto-play.
  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= snippet.steps.length - 1) {
      setPlaying(false);
      return;
    }
    timerRef.current = setTimeout(() => setStepIdx(i => i + 1), 900);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, stepIdx, snippet.steps.length]);

  // Reset stegtelleren når studenten bytter snippet.
  useEffect(() => {
    setStepIdx(0);
    setPlaying(false);
  }, [snippetId]);

  const codeLines = snippet.code.split("\n");

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden my-4">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Event loop — steg-for-steg
        </span>
        <select
          value={snippetId}
          onChange={e => setSnippetId(e.target.value)}
          className="text-xs font-mono rounded-md border border-border bg-background px-2 py-1"
        >
          {SNIPPETS.map(s => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-border">
        {/* Venstre: kode med highlight */}
        <div className="p-4 bg-muted/5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Kode
          </div>
          <pre className="font-mono text-xs leading-relaxed">
            {codeLines.map((line, i) => {
              const lineNum = i + 1;
              const isActive = lineNum === step.highlightLine;
              return (
                <div
                  key={i}
                  className={cn(
                    "px-2 -mx-2 rounded transition-colors",
                    isActive && "bg-brand/20 border-l-2 border-brand",
                  )}
                >
                  <span className="inline-block w-6 text-muted-foreground text-right pr-2 select-none">
                    {lineNum}
                  </span>
                  <span>{line || " "}</span>
                </div>
              );
            })}
          </pre>
          <div className="mt-4 text-[11px] text-muted-foreground italic border-t border-border pt-3">
            {step.description}
          </div>
        </div>

        {/* Høyre: køer + output */}
        <div className="p-4 space-y-3">
          <Queue
            label="Call stack"
            items={step.stack}
            color="bg-brand/15 text-brand border-brand/40"
            highlight={step.phase === "sync"}
            empty="(tom)"
          />
          <Queue
            label="Microtask queue"
            items={step.microtasks}
            color="bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/40"
            highlight={step.phase === "microtask"}
            empty="(tom)"
          />
          <Queue
            label="Task queue (macro)"
            items={step.tasks}
            color="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40"
            highlight={step.phase === "task"}
            empty="(tom)"
          />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Console-output
            </div>
            <div className="rounded-md border border-border bg-background p-2 font-mono text-xs min-h-[2.5rem]">
              {step.output.length === 0 ? (
                <span className="text-muted-foreground italic">(ingenting enda)</span>
              ) : (
                step.output.map((o, i) => (
                  <div key={i}>
                    <span className="text-muted-foreground">› </span>
                    {o}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Kontroller + progress */}
      <div className="border-t border-border bg-muted/20 px-4 py-2 flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setStepIdx(i => Math.max(0, i - 1))}
          disabled={stepIdx === 0}
          className="rounded-md border border-border bg-background hover:border-brand/40 disabled:opacity-30 px-2 py-1 text-[11px] font-mono flex items-center gap-1"
        >
          <ChevronLeft className="h-3 w-3" /> forrige
        </button>
        <button
          type="button"
          onClick={() => setPlaying(p => !p)}
          disabled={stepIdx >= snippet.steps.length - 1}
          className="rounded-md border border-brand bg-brand text-white hover:bg-brand/90 disabled:opacity-30 px-3 py-1 text-[11px] font-mono font-semibold flex items-center gap-1"
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? "pause" : "spill av"}
        </button>
        <button
          type="button"
          onClick={() => setStepIdx(i => Math.min(snippet.steps.length - 1, i + 1))}
          disabled={stepIdx >= snippet.steps.length - 1}
          className="rounded-md border border-border bg-background hover:border-brand/40 disabled:opacity-30 px-2 py-1 text-[11px] font-mono flex items-center gap-1"
        >
          neste <ChevronRight className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={() => { setStepIdx(0); setPlaying(false); }}
          className="rounded-md border border-border bg-background hover:border-brand/40 px-2 py-1 text-[11px] font-mono flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" /> reset
        </button>
        <span className="text-[11px] font-mono text-muted-foreground ml-auto">
          steg {stepIdx + 1}/{snippet.steps.length}
        </span>
      </div>

      <div className="border-t border-border bg-brand/5 px-4 py-3 text-[12px]">
        <div className="font-semibold mb-1">Forventet output: <span className="font-mono">{snippet.expectedOutput}</span></div>
        <div className="text-muted-foreground">{snippet.takeaway}</div>
      </div>
    </div>
  );
}

function Queue({
  label,
  items,
  color,
  highlight,
  empty,
}: {
  label: string;
  items: string[];
  color: string;
  highlight: boolean;
  empty: string;
}) {
  return (
    <div>
      <div className={cn(
        "text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5",
        highlight ? "text-foreground font-semibold" : "text-muted-foreground",
      )}>
        {label}
        {highlight && <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />}
      </div>
      <div className={cn(
        "rounded-md border bg-background p-1.5 min-h-[2.25rem] flex flex-wrap gap-1.5 transition-colors",
        highlight ? "border-foreground/30" : "border-border",
      )}>
        {items.length === 0 ? (
          <span className="text-muted-foreground italic text-xs px-1.5">{empty}</span>
        ) : (
          items.map((item, i) => (
            <span
              key={i}
              className={cn(
                "rounded border px-2 py-0.5 font-mono text-[11px] whitespace-nowrap",
                color,
              )}
            >
              {item}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
