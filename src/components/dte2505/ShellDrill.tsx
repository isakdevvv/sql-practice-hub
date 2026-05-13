import { useMemo, useState } from "react";
import { Check, X, Lightbulb, RotateCcw, ChevronRight, ChevronLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  SHELL_SCENARIOS,
  SHELL_TOPICS,
  checkShellAnswer,
  type ShellScenario,
  type ShellTopic,
} from "@/lib/dte2505/shellScenarios";

// Interactive shell-drill: lar studenten skrive en kommando som svar på et scenario.
// Vi sjekker mot regex-er, gir hint og forklaring. Helt klientside — ingen lagring.

type Status = "idle" | "correct" | "wrong" | "revealed";

export function ShellDrill() {
  const [activeTopic, setActiveTopic] = useState<ShellTopic | "all">("all");
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [attempts, setAttempts] = useState(0);

  const filtered = useMemo(() => {
    if (activeTopic === "all") return SHELL_SCENARIOS;
    return SHELL_SCENARIOS.filter((s) => s.topic === activeTopic);
  }, [activeTopic]);

  const total = filtered.length;
  const scenario: ShellScenario | undefined = filtered[idx % Math.max(total, 1)];

  function resetScenario() {
    setInput("");
    setStatus("idle");
    setAttempts(0);
  }

  function goto(delta: number) {
    if (total === 0) return;
    const next = (idx + delta + total) % total;
    setIdx(next);
    resetScenario();
  }

  function onCheck() {
    if (!scenario) return;
    if (checkShellAnswer(input, scenario)) {
      setStatus("correct");
    } else {
      setStatus("wrong");
      setAttempts((n) => n + 1);
    }
  }

  function onReveal() {
    setStatus("revealed");
  }

  function onTopicChange(t: ShellTopic | "all") {
    setActiveTopic(t);
    setIdx(0);
    resetScenario();
  }

  if (!scenario) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Ingen scenarier i denne kategorien.
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Shell-drill</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Skriv kommandoen som løser scenariet. Flagg-rekkefølge tolereres som regel,
          men du må bruke riktig verktøy. Brukes alene eller sammen med{" "}
          <span className="text-foreground">DTE-2505 Oblig-guide</span>.
        </p>
      </div>

      {/* Kategori-filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => onTopicChange("all")}
          className={cn(
            "rounded-full px-3 py-1 text-xs transition-colors",
            activeTopic === "all"
              ? "bg-brand text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/70",
          )}
        >
          Alle ({SHELL_SCENARIOS.length})
        </button>
        {SHELL_TOPICS.map((t) => {
          const count = SHELL_SCENARIOS.filter((s) => s.topic === t.id).length;
          return (
            <button
              key={t.id}
              onClick={() => onTopicChange(t.id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs transition-colors",
                activeTopic === t.id
                  ? "bg-brand text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/70",
              )}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-3 mb-3">
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
            {SHELL_TOPICS.find((t) => t.id === scenario.topic)?.label ?? scenario.topic}
          </Badge>
          <span className="text-xs text-muted-foreground tabular-nums">
            {idx + 1} av {total}
          </span>
        </div>

        <h2 className="text-lg font-semibold leading-tight">{scenario.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{scenario.prompt}</p>

        {scenario.context && (
          <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Kontekst
            </div>
            <pre className="font-mono text-xs whitespace-pre-wrap">{scenario.context}</pre>
          </div>
        )}

        <div className="mt-5">
          <label htmlFor="shell-input" className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
            Din kommando
          </label>
          <input
            id="shell-input"
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (status === "wrong") setStatus("idle");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") onCheck();
            }}
            placeholder="$ ..."
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className={cn(
              "w-full rounded-md border bg-background px-3 py-2 font-mono text-sm outline-none transition-colors",
              status === "correct" && "border-success text-success",
              status === "wrong" && "border-red-500/60",
              status === "idle" && "border-border focus:border-brand",
              status === "revealed" && "border-border",
            )}
          />
        </div>

        {/* Tilbakemelding */}
        {status === "correct" && (
          <div className="mt-4 rounded-lg border border-success/40 bg-success/5 p-4">
            <div className="flex items-center gap-2 text-success font-medium text-sm">
              <Check className="h-4 w-4" /> Riktig!
            </div>
            <div className="mt-2 font-mono text-xs text-muted-foreground">
              Kanonisk svar: <span className="text-foreground">{scenario.solution}</span>
            </div>
            {scenario.explanation && (
              <p className="mt-2 text-xs text-muted-foreground">{scenario.explanation}</p>
            )}
          </div>
        )}

        {status === "wrong" && (
          <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/5 p-4">
            <div className="flex items-center gap-2 text-red-500 font-medium text-sm">
              <X className="h-4 w-4" /> Ikke helt — prøv igjen.
            </div>
            {attempts >= 1 && (
              <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                <span>
                  <span className="font-medium text-foreground">Hint:</span>{" "}
                  {scenario.hint}
                </span>
              </div>
            )}
          </div>
        )}

        {status === "revealed" && (
          <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
            <div className="flex items-center gap-2 text-amber-500 font-medium text-sm">
              <Eye className="h-4 w-4" /> Foreslått løsning
            </div>
            <pre className="mt-2 font-mono text-xs text-foreground whitespace-pre-wrap">
              {scenario.solution}
            </pre>
            {scenario.explanation && (
              <p className="mt-2 text-xs text-muted-foreground">{scenario.explanation}</p>
            )}
          </div>
        )}

        {/* Knapper */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button onClick={onCheck} size="sm" disabled={status === "correct"}>
            Sjekk
          </Button>
          <Button onClick={resetScenario} size="sm" variant="ghost">
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Nullstill
          </Button>
          {status !== "correct" && (
            <Button onClick={onReveal} size="sm" variant="ghost">
              <Eye className="h-3.5 w-3.5 mr-1" /> Vis svar
            </Button>
          )}
        </div>
      </div>

      {/* Navigasjon */}
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <Button size="sm" variant="ghost" onClick={() => goto(-1)}>
          <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Forrige
        </Button>
        <span>
          {idx + 1} av {total}
        </span>
        <Button size="sm" variant="ghost" onClick={() => goto(1)}>
          Neste <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </main>
  );
}
