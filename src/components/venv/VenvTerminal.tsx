import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Lightbulb,
  RotateCcw,
  Check,
  TerminalSquare,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { freshRepo, runLine, runScript } from "@/lib/venv/commands";
import { activeEnv, pythonPath, topLevelEntries, type VenvRepo } from "@/lib/venv/engine";
import {
  VENV_SCENARIOS,
  VENV_TOPICS,
  topicLabel,
  type VenvScenario,
  type VenvTopic,
} from "@/lib/venv/scenarios";

interface HistoryLine {
  kind: "input" | "out" | "err" | "info";
  text: string;
}

const PROGRESS_KEY = "venv-drill-progress-v1";

function loadProgress(): Record<string, true> {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveProgress(p: Record<string, true>) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}

export function VenvTerminal() {
  const [activeTopic, setActiveTopic] = useState<VenvTopic | "all">("all");
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState<Record<string, true>>(() => loadProgress());

  const filtered = useMemo(() => {
    if (activeTopic === "all") return VENV_SCENARIOS;
    return VENV_SCENARIOS.filter((s) => s.topic === activeTopic);
  }, [activeTopic]);

  const scenario: VenvScenario | undefined = filtered[idx % Math.max(filtered.length, 1)];

  const [repo, setRepo] = useState<VenvRepo>(() => freshRepo());
  const [history, setHistory] = useState<HistoryLine[]>([]);
  const [input, setInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdHistoryIdx, setCmdHistoryIdx] = useState<number | null>(null);

  const termRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!scenario) return;
    const { repo: prepared } = runScript(freshRepo(), scenario.setup);
    setRepo(prepared);
    setHistory([
      { kind: "info", text: `# ${scenario.title}` },
      ...(scenario.setup.length
        ? [
            {
              kind: "info" as const,
              text: `# (setup kjørt: ${scenario.setup.length} kommando${scenario.setup.length === 1 ? "" : "er"} — bruk \`ls\`, \`which python\`, \`pip list\` for å se utgangspunktet)`,
            },
          ]
        : []),
    ]);
    setInput("");
    setRevealed(false);
    setHintShown(false);
    setAttempts(0);
    setSolved(false);
    setCmdHistory([]);
    setCmdHistoryIdx(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario?.id]);

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [history]);

  function execute(rawLine: string) {
    if (!scenario) return;
    const line = rawLine.trim();
    if (!line) return;

    if (line === "clear") {
      setHistory([]);
      return;
    }

    setCmdHistory((h) => [...h, line]);
    setCmdHistoryIdx(null);

    const before = [...history, { kind: "input" as const, text: line }];
    const result = runLine(repo, line);

    const lines: HistoryLine[] = [];
    for (const out of result.out) {
      if (out === "__CLEAR__") {
        setHistory([]);
        return;
      }
      lines.push({ kind: result.error ? "err" : "out", text: out });
    }
    setHistory([...before, ...lines]);
    setRepo(result.repo);

    const check = scenario.check(result.repo);
    if (check.ok && !solved) {
      setSolved(true);
      const nextProgress = { ...progress, [scenario.id]: true as const };
      setProgress(nextProgress);
      saveProgress(nextProgress);
    } else if (!check.ok) {
      setAttempts((n) => n + 1);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      execute(input);
      setInput("");
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!cmdHistory.length) return;
      const next = cmdHistoryIdx === null ? cmdHistory.length - 1 : Math.max(0, cmdHistoryIdx - 1);
      setCmdHistoryIdx(next);
      setInput(cmdHistory[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cmdHistoryIdx === null) return;
      const next = cmdHistoryIdx + 1;
      if (next >= cmdHistory.length) {
        setCmdHistoryIdx(null);
        setInput("");
      } else {
        setCmdHistoryIdx(next);
        setInput(cmdHistory[next]);
      }
    } else if (e.key === "l" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setHistory([]);
    }
  }

  function resetScenario() {
    if (!scenario) return;
    const { repo: prepared } = runScript(freshRepo(), scenario.setup);
    setRepo(prepared);
    setHistory([{ kind: "info", text: `# Nullstilt — ${scenario.title}` }]);
    setSolved(false);
    setAttempts(0);
  }

  function goto(delta: number) {
    if (!filtered.length) return;
    const next = (idx + delta + filtered.length) % filtered.length;
    setIdx(next);
  }

  function reveal() {
    setRevealed(true);
  }

  function onTopicChange(t: VenvTopic | "all") {
    setActiveTopic(t);
    setIdx(0);
  }

  function clearAllProgress() {
    if (!confirm("Nullstille alle løste øvelser?")) return;
    setProgress({});
    saveProgress({});
  }

  if (!scenario) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Ingen scenarier i denne kategorien.
      </div>
    );
  }

  const solvedCount = Object.keys(progress).length;
  const totalCount = VENV_SCENARIOS.length;
  const checkResult = scenario.check(repo);
  const promptPrefix = repo.activatedVenv ? `(${repo.activatedVenv}) ` : "";

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <TerminalSquare className="h-6 w-6 text-brand" />
            Venv-drill
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Skriv venv/pip-kommandoer i en simulert terminal. Alt kjører lokalt — ingen ekte
            python. Piltastene = kommandohistorikk; <kbd className="text-[10px] border rounded px-1">clear</kbd> tømmer skjermen.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="rounded-md border border-border bg-card px-3 py-1.5 text-xs">
            <Trophy className="inline h-3.5 w-3.5 mr-1 text-amber-500" />
            <span className="font-semibold tabular-nums">{solvedCount}</span>
            <span className="text-muted-foreground"> / {totalCount} løst</span>
          </div>
          <Button onClick={clearAllProgress} size="sm" variant="ghost" className="text-xs">
            Nullstill
          </Button>
        </div>
      </div>

      {/* Topic-filter */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={() => onTopicChange("all")}
          className={cn(
            "rounded-full px-3 py-1 text-xs transition-colors",
            activeTopic === "all"
              ? "bg-brand text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/70",
          )}
        >
          Alle ({VENV_SCENARIOS.length})
        </button>
        {VENV_TOPICS.map((t) => {
          const count = VENV_SCENARIOS.filter((s) => s.topic === t.id).length;
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

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        {/* Venstre kolonne: oppgave + terminal */}
        <div className="space-y-4">
          {/* Scenario-prompt */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                  {topicLabel(scenario.topic)}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  Nivå {scenario.level}
                </Badge>
                {progress[scenario.id] && (
                  <Badge className="text-[10px] bg-success/15 text-success border-success/40">
                    <Check className="h-3 w-3 mr-1" /> Løst
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {idx + 1} av {filtered.length}
              </span>
            </div>
            <h2 className="text-lg font-semibold leading-tight">{scenario.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{scenario.prompt}</p>
            {scenario.context && (
              <p className="mt-2 text-xs text-muted-foreground italic border-l-2 border-border pl-2">
                {scenario.context}
              </p>
            )}

            {hintShown && (
              <div className="mt-3 flex items-start gap-2 text-xs rounded-md border border-amber-500/40 bg-amber-500/5 p-2.5">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">Hint:</span> {scenario.hint}
                </span>
              </div>
            )}

            {revealed && (
              <div className="mt-3 rounded-md border border-amber-500/40 bg-amber-500/5 p-3">
                <div className="flex items-center gap-2 text-amber-500 text-xs font-medium">
                  <Eye className="h-3.5 w-3.5" /> Foreslått løsning
                </div>
                <pre className="mt-2 font-mono text-xs whitespace-pre-wrap text-foreground">
                  {scenario.solution.join("\n")}
                </pre>
                {scenario.explanation && (
                  <p className="mt-2 text-xs text-muted-foreground">{scenario.explanation}</p>
                )}
              </div>
            )}

            {solved && (
              <div className="mt-3 rounded-md border border-success/40 bg-success/5 p-3">
                <div className="flex items-center gap-2 text-success text-sm font-medium">
                  <Check className="h-4 w-4" /> Riktig! Miljøet ser ut som forventet.
                </div>
                {scenario.explanation && (
                  <p className="mt-1.5 text-xs text-muted-foreground">{scenario.explanation}</p>
                )}
              </div>
            )}
          </div>

          {/* Terminal */}
          <div
            className="rounded-xl border border-border bg-zinc-950 text-zinc-100 font-mono text-[13px] leading-relaxed flex flex-col"
            onClick={() => inputRef.current?.focus()}
          >
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800 text-[11px] text-zinc-400">
              <span>
                {promptPrefix}
                <span className="text-zinc-500">student@uit</span>:<span className="text-blue-400">~/proj</span>$
              </span>
              <span className="text-zinc-500">terminal · {history.length} linje{history.length === 1 ? "" : "r"}</span>
            </div>
            <div
              ref={termRef}
              className="px-3 py-2.5 h-[340px] overflow-y-auto whitespace-pre-wrap"
            >
              {history.map((h, i) => (
                <div
                  key={i}
                  className={cn(
                    h.kind === "input" && "text-zinc-100",
                    h.kind === "out" && "text-zinc-300",
                    h.kind === "err" && "text-red-400",
                    h.kind === "info" && "text-zinc-500 italic",
                  )}
                >
                  {h.kind === "input" ? (
                    <>
                      <span className="text-emerald-400">{promptPrefix}$ </span>
                      {h.text}
                    </>
                  ) : (
                    h.text || " "
                  )}
                </div>
              ))}
              <div className="flex items-center">
                <span className="text-emerald-400">{promptPrefix}$&nbsp;</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="off"
                  className="flex-1 bg-transparent outline-none text-zinc-100 caret-emerald-400"
                  placeholder=""
                />
              </div>
            </div>
            <div className="px-3 py-1.5 border-t border-zinc-800 text-[10px] text-zinc-500 flex items-center gap-3">
              <span>Enter = kjør · ↑↓ = historikk · clear = tøm</span>
              <span className="ml-auto">
                {checkResult.ok ? (
                  <span className="text-emerald-400">✓ målet er nådd</span>
                ) : attempts > 0 ? (
                  <span className="text-amber-400">✗ ikke der ennå</span>
                ) : null}
              </span>
            </div>
          </div>

          {/* Knapperad */}
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => goto(-1)} size="sm" variant="ghost">
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Forrige
            </Button>
            <Button onClick={() => goto(1)} size="sm" variant="ghost">
              Neste <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
            <Button onClick={resetScenario} size="sm" variant="ghost">
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Nullstill scenario
            </Button>
            <Button onClick={() => setHintShown(true)} size="sm" variant="ghost" disabled={hintShown}>
              <Lightbulb className="h-3.5 w-3.5 mr-1" /> Hint
            </Button>
            <Button onClick={reveal} size="sm" variant="ghost" disabled={revealed}>
              <Eye className="h-3.5 w-3.5 mr-1" /> Vis svar
            </Button>
          </div>
        </div>

        {/* Høyre kolonne: state-panel */}
        <aside className="space-y-3">
          <StatePanel repo={repo} />
          {!checkResult.ok && checkResult.missing && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300">
              <span className="font-medium">Mangler:</span> {checkResult.missing}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

function StatePanel({ repo }: { repo: VenvRepo }) {
  const env = activeEnv(repo);
  const tops = topLevelEntries(repo);
  const venvNames = Object.keys(repo.venvs).sort();
  const pkgs = Object.keys(env.packages)
    .filter((p) => p !== "pip" && p !== "setuptools" && p !== "wheel")
    .sort();

  return (
    <div className="space-y-3 text-xs">
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
          Aktivt miljø
        </div>
        <div className="font-mono">
          {repo.activatedVenv ? (
            <span className="text-brand font-semibold">({repo.activatedVenv})</span>
          ) : (
            <span className="text-muted-foreground">system-python</span>
          )}
        </div>
        <div className="mt-1 font-mono text-[10px] text-muted-foreground break-all">
          {pythonPath(repo)}
        </div>
        <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
          Python {env.python}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
          Venvs ({venvNames.length})
        </div>
        {venvNames.length === 0 ? (
          <div className="text-muted-foreground">(ingen — kjør `python -m venv ...`)</div>
        ) : (
          <ul className="space-y-0.5 font-mono">
            {venvNames.map((n) => {
              const count = Object.keys(repo.venvs[n].packages).filter(
                (p) => p !== "pip" && p !== "setuptools" && p !== "wheel",
              ).length;
              return (
                <li key={n} className={n === repo.activatedVenv ? "text-brand font-semibold" : ""}>
                  {n === repo.activatedVenv ? "* " : "  "}
                  {n}{" "}
                  <span className="text-muted-foreground">({count} pakker)</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
          Pakker i aktivt miljø ({pkgs.length})
        </div>
        {pkgs.length === 0 ? (
          <div className="text-muted-foreground">(ingen utover pip/setuptools)</div>
        ) : (
          <ul className="space-y-0.5 font-mono">
            {pkgs.slice(0, 12).map((p) => (
              <li key={p}>
                {p} <span className="text-muted-foreground">{env.packages[p]}</span>
              </li>
            ))}
            {pkgs.length > 12 && (
              <li className="text-muted-foreground">…og {pkgs.length - 12} til</li>
            )}
          </ul>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
          Filer i ~/proj
        </div>
        {tops.length === 0 ? (
          <div className="text-muted-foreground">(tom mappe)</div>
        ) : (
          <ul className="space-y-0.5 font-mono">
            {tops.map((e) => (
              <li key={e.name}>
                {e.isDir ? (
                  <span className="text-blue-500">{e.name}/</span>
                ) : (
                  <span>{e.name}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
