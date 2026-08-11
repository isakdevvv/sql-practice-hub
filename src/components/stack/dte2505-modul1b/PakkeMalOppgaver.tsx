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
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PAKKE_GOAL_TASKS,
  runApt,
  type AptState,
  type CheckOutcome,
  type KjoreResultat,
} from "@/lib/dte2505/pakkekilderEngine";
import { SystemPanel } from "./SystemPanel";

// ---------------------------------------------------------------------------
// Oppgavetype 3 — MÅLOPPGAVE MED TILSTANDSSJEKK (PLAN-HOST26-MODULER.md §3.1).
//
// Ingen fasitstreng. Kommandoene dine endrer et faktisk system, og sjekken
// spør om SYSTEMET havnet der oppgaven ba om. Derfor er oppgavene flerstegs —
// slik ekte pakkearbeid er — og derfor kan «nesten» si nøyaktig hvilket steg
// som mangler.
//
// To moduser: lær først (se løsningen kjøre), test deg selv etterpå.
// ---------------------------------------------------------------------------

type Mode = "learn" | "drill";

export function PakkeMalOppgaver() {
  const [mode, setMode] = useState<Mode>("learn");
  const [idx, setIdx] = useState(0);
  const [state, setState] = useState<AptState>(() => PAKKE_GOAL_TASKS[0].start());
  const [logg, setLogg] = useState<KjoreResultat[]>([]);
  const [input, setInput] = useState("");
  const [outcome, setOutcome] = useState<CheckOutcome | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [solved, setSolved] = useState<Record<string, boolean>>({});

  const task = PAKKE_GOAL_TASKS[idx];

  function nullstill(i = idx) {
    setState(PAKKE_GOAL_TASKS[i].start());
    setLogg([]);
    setInput("");
    setOutcome(null);
    setShowHint(false);
    setRevealed(false);
  }

  function velg(i: number) {
    setIdx(i);
    nullstill(i);
  }

  /** Kjører én linje og sjekker måltilstanden på nytt etterpå. */
  function kjor(cmd?: string) {
    const linje = (cmd ?? input).trim();
    if (!linje) return;
    const r = runApt(state, linje);
    const nyLogg = [...logg, r];
    setState(r.state);
    setLogg(nyLogg);
    setInput("");
    const o = task.check(r.state, nyLogg);
    setOutcome(o);
    if (o.verdict === "riktig") setSolved((s) => ({ ...s, [task.id]: true }));
  }

  /** Lær-modus: spill hele fasiten, steg for steg, mot en fersk tilstand. */
  function spillFasit() {
    let s = task.start();
    const ny: KjoreResultat[] = [];
    for (const c of task.fasit) {
      const r = runApt(s, c);
      s = r.state;
      ny.push(r);
    }
    setState(s);
    setLogg(ny);
    setOutcome(task.check(s, ny));
  }

  const solvedCount = useMemo(() => Object.values(solved).filter(Boolean).length, [solved]);

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Target className="h-4 w-4 text-brand" /> Måloppgaver
          <span className="text-xs font-normal text-muted-foreground">
            {idx + 1} / {PAKKE_GOAL_TASKS.length}
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
                nullstill();
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
                nullstill();
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

      <div className="flex flex-wrap gap-1 border-b px-4 py-2">
        {PAKKE_GOAL_TASKS.map((t, i) => (
          <button
            key={t.id}
            onClick={() => velg(i)}
            title={t.title}
            className={cn(
              "h-6 w-6 rounded-md border text-xs",
              i === idx && "border-brand bg-brand/15 font-semibold",
              solved[t.id] && i !== idx && "border-emerald-500/60 bg-emerald-500/10",
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="p-4">
        <div className="text-[11px] uppercase tracking-wider text-brand">{task.title}</div>
        <p className="mt-1 leading-relaxed">{task.prompt}</p>

        <div className="mt-3 rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-2.5 text-xs">
          <span className="font-semibold">Måltilstanden:</span> {task.goal}
        </div>

        {mode === "learn" ? (
          <div className="mt-3">
            <div className="text-xs text-muted-foreground">Én løsningsvei, steg for steg:</div>
            <ol className="mt-1.5 space-y-1">
              {task.fasit.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <span className="mt-0.5 shrink-0 rounded bg-brand/15 px-1.5 font-mono text-[10px] text-brand">
                    {i + 1}
                  </span>
                  <code className="break-all font-mono">{c}</code>
                </li>
              ))}
            </ol>
            <button
              onClick={spillFasit}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-sm text-brand-foreground hover:bg-brand/90"
            >
              <Play className="h-3.5 w-3.5" /> Kjør hele kjeden og se tilstanden endre seg
            </button>
            <div className="mt-3 rounded-lg border border-brand/40 bg-brand/5 p-2.5 text-sm leading-relaxed">
              <span className="font-semibold">Hvorfor:</span> {task.takeaway}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Sjekken godtar mer enn denne ene veien — den ser på hvor systemet havner, ikke på hva
              du skrev. Bytt til drill-modus og finn din egen rekkefølge.
            </p>
          </div>
        ) : (
          <div className="mt-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex min-w-[14rem] flex-1 items-center gap-2 rounded-md border bg-muted/40 px-2.5 py-2 font-mono text-sm">
                <span className="text-brand">$</span>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && kjor()}
                  spellCheck={false}
                  placeholder="ett steg om gangen"
                  aria-label="Kommando"
                  className="w-full bg-transparent outline-none"
                />
              </div>
              <button
                onClick={() => kjor()}
                className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-sm text-brand-foreground hover:bg-brand/90"
              >
                <Play className="h-3.5 w-3.5" /> Kjør
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
              <button
                onClick={() => nullstill()}
                className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Start forfra
              </button>
            </div>

            {showHint && (
              <div className="mt-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-2.5 text-sm">
                {task.hint}
              </div>
            )}
            {revealed && (
              <div className="mt-2 rounded-lg border bg-muted/40 p-2.5 text-sm">
                <span className="font-semibold">Én løsningsvei:</span>
                <ol className="mt-1 space-y-0.5">
                  {task.fasit.map((c, i) => (
                    <li key={i}>
                      <code className="break-all font-mono text-xs">{c}</code>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {logg.length > 0 && (
          <div className="mt-3 overflow-hidden rounded-lg border">
            <div className="flex items-center gap-1.5 border-b bg-muted/50 px-2.5 py-1 text-[11px] text-muted-foreground">
              <Terminal className="h-3 w-3" /> terminal
            </div>
            <div className="max-h-64 overflow-y-auto bg-zinc-950 px-3 py-2 font-mono text-xs leading-relaxed text-zinc-100">
              {logg.map((r, i) => (
                <div key={i} className={cn(i > 0 && "mt-2")}>
                  <div className="break-all text-emerald-400">
                    <span className="text-zinc-500">student@linux:~$ </span>
                    {r.cmd}
                  </div>
                  {r.lines.map((l, j) => (
                    <div
                      key={j}
                      className={cn(
                        "whitespace-pre-wrap break-all",
                        l.trimStart().startsWith("(") && "text-zinc-400",
                        /^(E:|Err:|dpkg: error|error:)/.test(l) && "text-rose-400",
                        /^W:|^Warning:/.test(l) && "text-amber-400",
                      )}
                    >
                      {l || " "}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3">
          <SystemPanel state={state} />
        </div>

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
                {outcome.verdict === "riktig"
                  ? "måltilstanden er nådd"
                  : outcome.verdict === "nesten"
                    ? "nesten framme"
                    : "ikke dette"}
              </div>
              <p className="mt-0.5">{outcome.message}</p>
              {outcome.verdict === "riktig" && <p className="mt-2 border-t pt-2 text-xs">{task.takeaway}</p>}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <button
            onClick={() => velg((idx - 1 + PAKKE_GOAL_TASKS.length) % PAKKE_GOAL_TASKS.length)}
            className="inline-flex items-center gap-1 rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" /> Forrige
          </button>
          <button
            onClick={() => velg((idx + 1) % PAKKE_GOAL_TASKS.length)}
            className="inline-flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-sm text-brand-foreground hover:bg-brand/90"
          >
            Neste <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
