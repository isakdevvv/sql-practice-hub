import { useMemo, useState } from "react";
import {
  Target,
  BookOpen,
  Dumbbell,
  Play,
  Lightbulb,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GOAL_TASKS,
  parseCommand,
  runHelpCommand,
  type CheckOutcome,
  type HelpResult,
} from "@/lib/dte2505/hjelpesystemerEngine";

// ---------------------------------------------------------------------------
// Oppgavetype 3 — MÅLOPPGAVE MED TILSTANDSSJEKK.
//
// Det som skiller denne fra en vanlig kommando-drill: vi sammenligner ikke
// svaret ditt med en fasitstreng. Vi KJØRER kommandoen mot mock-systemet og
// spør om resultatet løser oppgaven. Derfor godtas `apropos owner` og
// `man -k ownership` like godt, og derfor kan tilbakemeldingen si nøyaktig
// hva som manglet når du var nesten framme.
//
// To moduser, som ellers i appen: lær først, test deg selv etterpå.
// ---------------------------------------------------------------------------

type Mode = "learn" | "drill";

export function MalOppgaver() {
  const [mode, setMode] = useState<Mode>("learn");
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<HelpResult | null>(null);
  const [outcome, setOutcome] = useState<CheckOutcome | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [solved, setSolved] = useState<Record<string, boolean>>({});

  const task = GOAL_TASKS[idx];

  function reset() {
    setInput("");
    setResult(null);
    setOutcome(null);
    setShowHint(false);
    setRevealed(false);
  }

  function go(delta: number) {
    setIdx((i) => (i + delta + GOAL_TASKS.length) % GOAL_TASKS.length);
    reset();
  }

  function run(cmd?: string) {
    const line = (cmd ?? input).trim();
    if (!line) return;
    if (cmd) setInput(line);
    const r = runHelpCommand(line);
    const o = task.check(parseCommand(line), r);
    setResult(r);
    setOutcome(o);
    if (o.verdict === "riktig") setSolved((s) => ({ ...s, [task.id]: true }));
  }

  const solvedCount = useMemo(() => Object.values(solved).filter(Boolean).length, [solved]);

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Target className="h-4 w-4 text-brand" /> Måloppgaver
          <span className="text-xs font-normal text-muted-foreground">
            {idx + 1} / {GOAL_TASKS.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{solvedCount} løst</span>
          <div role="tablist" aria-label="Modus" className="inline-flex rounded-lg border bg-muted/30 p-0.5">
            <button
              role="tab"
              aria-selected={mode === "learn"}
              onClick={() => {
                setMode("learn");
                reset();
              }}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium",
                mode === "learn" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <BookOpen className="h-3.5 w-3.5" /> Læringsmodus
            </button>
            <button
              role="tab"
              aria-selected={mode === "drill"}
              onClick={() => {
                setMode("drill");
                reset();
              }}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium",
                mode === "drill" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Dumbbell className="h-3.5 w-3.5" /> Drill-modus
            </button>
          </div>
        </div>
      </div>

      {/* oppgavevelger */}
      <div className="flex flex-wrap gap-1 border-b px-4 py-2">
        {GOAL_TASKS.map((t, i) => (
          <button
            key={t.id}
            onClick={() => {
              setIdx(i);
              reset();
            }}
            className={cn(
              "h-6 w-6 rounded-md border text-xs",
              i === idx && "border-brand bg-brand/15 font-semibold",
              solved[t.id] && i !== idx && "border-emerald-500/60 bg-emerald-500/10",
            )}
            title={t.title}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="p-4">
        <div className="text-[11px] uppercase tracking-wider text-brand">{task.title}</div>
        <p className="mt-1 leading-relaxed">{task.prompt}</p>

        <div className="mt-3 rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-2.5 text-xs">
          <span className="font-semibold">Målet:</span> {task.goal}
        </div>

        {mode === "learn" ? (
          <div className="mt-3">
            <div className="text-xs text-muted-foreground">
              Løsninger som godtas (trykk for å kjøre og se hva som skjer):
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {task.accepted.map((a) => (
                <button
                  key={a}
                  onClick={() => run(a)}
                  className="inline-flex items-center gap-1 rounded-md border bg-muted/40 px-2 py-1 font-mono text-xs hover:bg-accent"
                >
                  <Play className="h-3 w-3 text-brand" /> {a}
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-lg border border-brand/40 bg-brand/5 p-2.5 text-sm leading-relaxed">
              <span className="font-semibold">Hvorfor:</span> {task.takeaway}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Sjekken godtar mer enn listen over — den ser på resultatet av kommandoen, ikke på
              teksten du skrev. Bytt til drill-modus og prøv din egen variant.
            </p>
          </div>
        ) : (
          <div className="mt-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex min-w-[16rem] flex-1 items-center gap-2 rounded-md border bg-muted/40 px-2.5 py-2 font-mono text-sm">
                <span className="text-brand">$</span>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && run()}
                  spellCheck={false}
                  placeholder="skriv kommandoen din"
                  aria-label="Kommando"
                  className="w-full bg-transparent outline-none"
                />
              </div>
              <button
                onClick={() => run()}
                className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-sm text-brand-foreground hover:bg-brand/90"
              >
                <Play className="h-3.5 w-3.5" /> Kjør og sjekk
              </button>
              <button
                onClick={() => setShowHint(true)}
                className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent"
              >
                <Lightbulb className="h-3.5 w-3.5" /> Hint
              </button>
              <button
                onClick={() => setRevealed(true)}
                className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent"
              >
                <Eye className="h-3.5 w-3.5" /> Fasit
              </button>
            </div>

            {showHint && !outcome && (
              <div className="mt-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-2.5 text-sm">
                {task.hint}
              </div>
            )}
            {revealed && (
              <div className="mt-2 rounded-lg border bg-muted/40 p-2.5 text-sm">
                <span className="font-semibold">Én løsning:</span>{" "}
                <code className="font-mono">{task.accepted[0]}</code>
                <div className="mt-1 text-xs text-muted-foreground">{task.takeaway}</div>
              </div>
            )}
          </div>
        )}

        {/* terminalen */}
        {result && (
          <div className="mt-3 overflow-hidden rounded-lg border">
            <div className="flex items-center gap-1.5 border-b bg-muted/50 px-2.5 py-1 text-[11px] text-muted-foreground">
              <Terminal className="h-3 w-3" /> utdata fra{" "}
              <code className="font-mono text-foreground">{input}</code>
            </div>
            <div className="max-h-64 overflow-y-auto bg-zinc-950 px-3 py-2 font-mono text-xs leading-relaxed text-zinc-100">
              {result.lines.map((l, i) => (
                <div key={i} className={cn("whitespace-pre-wrap", l.startsWith("(") && "text-zinc-400")}>
                  {l || " "}
                </div>
              ))}
            </div>
          </div>
        )}

        {outcome && (
          <div
            className={cn(
              "mt-3 flex items-start gap-2 rounded-lg border p-3 text-sm leading-relaxed",
              outcome.verdict === "riktig" && "border-emerald-500/60 bg-emerald-500/10",
              outcome.verdict === "nesten" && "border-amber-500/60 bg-amber-500/10",
              outcome.verdict === "feil" && "border-rose-500/60 bg-rose-500/10",
            )}
          >
            {outcome.verdict === "riktig" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : outcome.verdict === "nesten" ? (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <div>
              <div className="text-[10px] uppercase tracking-wider opacity-70">
                {outcome.verdict === "riktig" ? "målet er nådd" : outcome.verdict === "nesten" ? "nesten framme" : "ikke dette"}
              </div>
              <p className="mt-0.5">{outcome.message}</p>
              {outcome.verdict === "riktig" && (
                <p className="mt-2 border-t pt-2 text-xs">{task.takeaway}</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <button
            onClick={() => go(-1)}
            className="inline-flex items-center gap-1 rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" /> Forrige
          </button>
          <button
            onClick={() => go(1)}
            className="inline-flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-sm text-brand-foreground hover:bg-brand/90"
          >
            Neste <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
