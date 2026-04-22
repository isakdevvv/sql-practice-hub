import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SqlEditor } from "@/components/SqlEditor";
import { ResultTable } from "@/components/ResultTable";
import { SchemaPanel } from "@/components/SchemaPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PROBLEMS } from "@/lib/problems/data";
import type { Problem, Level } from "@/lib/problems/types";
import { LEVEL_NAMES } from "@/lib/problems/types";
import { DATASET_LIST, type DatasetId } from "@/lib/db/datasets";
import { runQuery, validateQuery, explainQuery, type QueryResult, type ValidationResult, type ExplainReport } from "@/lib/engine/sqlEngine";
import { ResultDiff, ExplainPanel } from "@/components/DiffPanel";
import {
  recordAttempt,
  recordHintUsed,
  loadProgress,
  type Progress,
} from "@/lib/progress/storage";
import {
  Check,
  X,
  Lightbulb,
  BookOpen,
  Eye,
  EyeOff,
  Filter,
} from "lucide-react";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Practice — SQL Sandbox" },
      {
        name: "description",
        content:
          "Practice SQL on a realistic e-commerce dataset. 50 problems with instant feedback, in your browser.",
      },
      { property: "og:title", content: "Practice — SQL Sandbox" },
      {
        property: "og:description",
        content:
          "50 SQL problems across 6 difficulty levels — pick a problem and start writing queries.",
      },
    ],
  }),
  component: PracticeWorkbench,
});

const STORAGE_LAST_ID = "sql-practice-last-id";
const STORAGE_DRAFTS = "sql-practice-drafts-v1";

function loadDrafts(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_DRAFTS) ?? "{}");
  } catch {
    return {};
  }
}
function saveDraft(id: string, sql: string) {
  if (typeof window === "undefined") return;
  const all = loadDrafts();
  all[id] = sql;
  window.localStorage.setItem(STORAGE_DRAFTS, JSON.stringify(all));
}

function difficultyLabel(d: number): { text: string; cls: string } {
  if (d <= 2) return { text: "Easy", cls: "bg-success/15 text-success border-success/30" };
  if (d <= 3) return { text: "Medium", cls: "bg-warning/15 text-warning border-warning/30" };
  return { text: "Hard", cls: "bg-destructive/15 text-destructive border-destructive/30" };
}

function PracticeWorkbench() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [hideDone, setHideDone] = useState(false);
  const [levelFilter, setLevelFilter] = useState<Level | "all">("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [datasetId, setDatasetId] = useState<DatasetId>("ecommerce");
  const [activeId, setActiveId] = useState<string>(
    PROBLEMS.find((p) => (p.dataset ?? "ecommerce") === "ecommerce")?.id ?? PROBLEMS[0].id,
  );

  // Load saved last problem on mount
  useEffect(() => {
    setProgress(loadProgress());
    if (typeof window !== "undefined") {
      const last = window.localStorage.getItem(STORAGE_LAST_ID);
      const found = last ? PROBLEMS.find((p) => p.id === last) : undefined;
      if (found) {
        setActiveId(found.id);
        setDatasetId((found.dataset ?? "ecommerce") as DatasetId);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined")
      window.localStorage.setItem(STORAGE_LAST_ID, activeId);
  }, [activeId]);

  const datasetProblems = useMemo(
    () => PROBLEMS.filter((p) => (p.dataset ?? "ecommerce") === datasetId),
    [datasetId],
  );

  const allTopics = useMemo(() => {
    const s = new Set<string>();
    datasetProblems.forEach((p) => p.topics.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [datasetProblems]);

  const filtered = useMemo(() => {
    return datasetProblems.filter((p) => {
      if (hideDone && progress?.attempts[p.id]?.solved) return false;
      if (levelFilter !== "all" && p.level !== levelFilter) return false;
      if (topicFilter !== "all" && !p.topics.includes(topicFilter)) return false;
      return true;
    });
  }, [hideDone, levelFilter, topicFilter, progress, datasetProblems]);

  // When switching dataset, jump to its first problem if active doesn't belong
  useEffect(() => {
    const active = PROBLEMS.find((p) => p.id === activeId);
    if (!active || (active.dataset ?? "ecommerce") !== datasetId) {
      const first = datasetProblems[0];
      if (first) setActiveId(first.id);
    }
  }, [datasetId, datasetProblems, activeId]);

  const active = useMemo(
    () => PROBLEMS.find((p) => p.id === activeId) ?? PROBLEMS[0],
    [activeId],
  );

  const solvedCount = progress
    ? datasetProblems.filter((p) => progress.attempts[p.id]?.solved).length
    : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* LEFT: problem list */}
        <aside className="w-full lg:w-[340px] lg:border-r border-b lg:border-b-0 border-border bg-card/40 flex flex-col max-h-[50vh] lg:max-h-none">
          {/* Filters */}
          <div className="p-3 border-b border-border space-y-2 sticky top-0 bg-card/60 backdrop-blur-sm z-10">
            <div>
              <label className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                Database
              </label>
              <select
                value={datasetId}
                onChange={(e) => setDatasetId(e.target.value as DatasetId)}
                className="mt-1 h-8 w-full rounded-md border border-brand/40 bg-background px-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {DATASET_LIST.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5" /> Problems
              </h2>
              <span className="text-[11px] text-muted-foreground">
                {solvedCount}/{datasetProblems.length} solved
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={levelFilter}
                onChange={(e) =>
                  setLevelFilter(
                    e.target.value === "all" ? "all" : (Number(e.target.value) as Level),
                  )
                }
                className="h-8 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">All levels</option>
                {(Object.keys(LEVEL_NAMES) as unknown as string[]).map((k) => (
                  <option key={k} value={k}>
                    L{k} · {LEVEL_NAMES[Number(k) as Level]}
                  </option>
                ))}
              </select>
              <select
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                className="h-8 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">All topics</option>
                {allTopics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hideDone}
                onChange={(e) => setHideDone(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border accent-brand"
              />
              Hide done
            </label>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 && (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No problems match your filters.
              </div>
            )}
            <ol className="divide-y divide-border">
              {filtered.map((p, i) => {
                const solved = progress?.attempts[p.id]?.solved;
                const isActive = p.id === activeId;
                const diff = difficultyLabel(p.difficulty);
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => setActiveId(p.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                        isActive
                          ? "bg-brand/10 border-l-2 border-l-brand"
                          : "border-l-2 border-l-transparent hover:bg-accent/40"
                      }`}
                    >
                      <span className="text-[11px] tabular-nums text-muted-foreground w-6 text-right">
                        {i + 1}.
                      </span>
                      <span
                        className={`flex-1 truncate ${
                          isActive ? "text-foreground font-medium" : "text-foreground/90"
                        }`}
                      >
                        {p.title}
                      </span>
                      <span
                        className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${diff.cls}`}
                      >
                        {diff.text}
                      </span>
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                          solved
                            ? "border-success bg-success text-success-foreground"
                            : "border-border bg-background"
                        }`}
                        aria-label={solved ? "Solved" : "Unsolved"}
                      >
                        {solved && <Check className="h-3 w-3" />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="p-2 border-t border-border text-center">
            <Link to="/dashboard" className="text-[11px] text-brand hover:underline">
              View dashboard →
            </Link>
          </div>
        </aside>

        {/* RIGHT: workbench */}
        <ProblemWorkspace
          key={active.id}
          problem={active}
          onSolved={() => setProgress(loadProgress())}
        />
      </div>
    </div>
  );
}

function ProblemWorkspace({
  problem,
  onSolved,
}: {
  problem: Problem;
  onSolved: () => void;
}) {
  const [sql, setSql] = useState<string>(() => {
    const drafts = loadDrafts();
    return drafts[problem.id] ?? problem.starter_sql;
  });
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<"correct" | "wrong" | null>(null);
  const [verdictReason, setVerdictReason] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [explain, setExplain] = useState<ExplainReport | null>(null);
  const [bottomTab, setBottomTab] = useState<"result" | "diff" | "explain">("result");
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [showSchema, setShowSchema] = useState(true);
  const [running, setRunning] = useState(false);
  const [tab, setTab] = useState<"problem" | "schema">("problem");
  const [xpToast, setXpToast] = useState<{ xp: number; achievements: string[] } | null>(
    null,
  );
  const startRef = useRef<number>(Date.now());

  // Persist draft
  useEffect(() => {
    saveDraft(problem.id, sql);
  }, [problem.id, sql]);

  const datasetId = (problem.dataset ?? "ecommerce") as DatasetId;

  async function handleRun() {
    setRunning(true);
    setError(null);
    setVerdict(null);
    setVerdictReason(null);
    setValidation(null);
    const out = await runQuery(sql, datasetId);
    if (!out.success) {
      setError(out.error ?? "Query failed");
      setResult(null);
      setExplain(null);
      setRunning(false);
      setBottomTab("result");
      return;
    }
    setResult(out.result ?? null);
    const ex = await explainQuery(sql, datasetId);
    setExplain(ex);
    setRunning(false);
    setBottomTab("result");
  }

  async function handleSubmit() {
    setRunning(true);
    setError(null);
    const out = await runQuery(sql, datasetId);
    if (!out.success) {
      setError(out.error ?? "Query failed");
      setResult(null);
      setValidation(null);
      setExplain(null);
      setRunning(false);
      setBottomTab("result");
      return;
    }
    setResult(out.result ?? null);
    const v = await validateQuery(sql, problem.solution, problem.validation, datasetId);
    setValidation(v);
    const ex = await explainQuery(sql, datasetId);
    setExplain(ex);
    setRunning(false);
    if (v.correct) {
      setVerdict("correct");
      setVerdictReason(null);
      setBottomTab("result");
      const timeMs = Date.now() - startRef.current;
      const { xpEarned, newAchievements } = recordAttempt(problem, {
        correct: true,
        hintsUsed: hintsShown,
        timeMs,
      });
      onSolved();
      if (xpEarned > 0) {
        setXpToast({ xp: xpEarned, achievements: newAchievements });
        setTimeout(() => setXpToast(null), 4000);
      }
    } else {
      setVerdict("wrong");
      setVerdictReason(v.reason ?? null);
      setBottomTab("diff");
      recordAttempt(problem, {
        correct: false,
        hintsUsed: hintsShown,
        timeMs: Date.now() - startRef.current,
      });
    }
  }

  function revealHint() {
    if (hintsShown < problem.hints.length) {
      setHintsShown((h) => h + 1);
      recordHintUsed(problem.id);
    }
  }

  function resetEditor() {
    setSql(problem.starter_sql);
    setResult(null);
    setError(null);
    setVerdict(null);
    setVerdictReason(null);
  }

  const diff = difficultyLabel(problem.difficulty);

  return (
    <section className="flex-1 flex flex-col min-w-0 min-h-0 relative">
      {xpToast && (
        <div className="absolute top-4 right-4 z-50 rounded-lg border border-success bg-card shadow-lg p-4 max-w-xs">
          <div className="font-semibold text-success">+{xpToast.xp} XP earned!</div>
          {xpToast.achievements.length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              🏆 New: {xpToast.achievements.join(", ")}
            </div>
          )}
        </div>
      )}

      {/* Top tabs */}
      <div className="flex items-center justify-between border-b border-border bg-card/40 px-4">
        <div className="flex">
          <TabButton active={tab === "problem"} onClick={() => setTab("problem")}>
            Problem
          </TabButton>
          <TabButton active={tab === "schema"} onClick={() => setTab("schema")}>
            Schema
          </TabButton>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-[10px]">
            L{problem.level} · {LEVEL_NAMES[problem.level]}
          </Badge>
          <span
            className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${diff.cls}`}
          >
            {diff.text}
          </span>
        </div>
      </div>

      <div className="flex-1 grid grid-rows-[auto_1fr_auto] min-h-0">
        {/* Problem / schema panel */}
        <div className="px-5 py-4 border-b border-border max-h-[36vh] overflow-y-auto">
          {tab === "problem" ? (
            <div>
              <h1 className="text-xl font-bold tracking-tight">{problem.title}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {problem.topics.map((t) => (
                  <Badge key={t} variant="secondary" className="text-[10px]">
                    {t}
                  </Badge>
                ))}
                <span className="text-[11px] text-muted-foreground ml-1">
                  ~{problem.estimated_time_min} min
                </span>
              </div>
              <p className="mt-3 text-sm text-foreground/90 leading-relaxed">
                {problem.problem}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button size="sm" variant="ghost" onClick={revealHint} disabled={hintsShown >= problem.hints.length}>
                  <Lightbulb className="h-3.5 w-3.5 mr-1 text-warning" />
                  Hint ({hintsShown}/{problem.hints.length})
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSolution((s) => !s)}
                >
                  <BookOpen className="h-3.5 w-3.5 mr-1" />
                  {showSolution ? "Hide solution" : "Show solution"}
                </Button>
                <Button size="sm" variant="ghost" onClick={resetEditor}>
                  Reset editor
                </Button>
              </div>

              {hintsShown > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-foreground/90 list-disc list-inside">
                  {problem.hints.slice(0, hintsShown).map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}

              {showSolution && (
                <div className="mt-3 space-y-2">
                  <pre className="rounded-md bg-[#1e1e1e] p-3 text-xs font-mono text-foreground/90 overflow-auto border border-border">
                    {problem.solution}
                  </pre>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {problem.explanation}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <SchemaPanel datasetId={datasetId} />
          )}
        </div>

        {/* Editor */}
        <div className="flex flex-col min-h-0 border-b border-border">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
            <div className="text-xs font-mono text-muted-foreground">
              query.sql · ⌘/Ctrl + Enter to submit
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSchema((s) => !s)}
                title="Toggle results / schema split"
              >
                {showSchema ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </Button>
              <Button size="sm" variant="outline" onClick={handleRun} disabled={running}>
                Run
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={running}>
                Submit
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-[200px]">
            <SqlEditor value={sql} onChange={setSql} onRun={handleSubmit} />
          </div>
        </div>

        {/* Results / verdict */}
        <div className="bg-card/30 max-h-[40vh] overflow-y-auto">
          {verdict === "correct" && (
            <div className="flex items-start gap-3 px-5 py-3 border-b border-success/40 bg-success/10">
              <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-success">Correct!</div>
                <p className="text-xs text-foreground/80 mt-1">{problem.explanation}</p>
              </div>
            </div>
          )}
          {verdict === "wrong" && (
            <div className="flex items-start gap-3 px-5 py-3 border-b border-destructive/40 bg-destructive/10">
              <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-destructive">Not quite</div>
                {verdictReason && (
                  <p className="text-xs text-foreground/80 mt-1">{verdictReason}</p>
                )}
              </div>
            </div>
          )}
          {error && (
            <div className="px-5 py-3 border-b border-destructive/40 bg-destructive/10 font-mono text-xs text-destructive whitespace-pre-wrap">
              {error}
            </div>
          )}

          <div className="px-4 py-2 text-xs font-mono text-muted-foreground border-b border-border">
            Result {result ? `· ${result.rows.length} rows` : ""}
          </div>
          <div className="min-h-[120px]">
            <ResultTable result={result} />
          </div>
        </div>
      </div>
    </section>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand" />
      )}
    </button>
  );
}
