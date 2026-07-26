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
import {
  runQuery,
  validateQuery,
  explainQuery,
  type QueryResult,
  type ValidationResult,
  type ExplainReport,
} from "@/lib/engine/sqlEngine";
import { ResultDiff, ExplainPanel } from "@/components/DiffPanel";
import { SqlText } from "@/components/SqlText";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  recordAttempt,
  recordHintUsed,
  loadProgress,
  type Progress,
} from "@/lib/progress/storage";
import { useAppMode, setAppMode } from "@/lib/appMode";
import {
  Check,
  X,
  Lightbulb,
  BookOpen,
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
  Copy,
  ChevronDown,
  ChevronUp,
  GitCompare,
} from "lucide-react";
import { format as formatSql } from "sql-formatter";

interface PracticeSearch {
  level?: Level;
  dataset?: DatasetId;
  id?: string;
  q?: string;
  topic?: string;
}

export const Route = createFileRoute("/practice")({
  validateSearch: (search: Record<string, unknown>): PracticeSearch => {
    const out: PracticeSearch = {};
    if (search.level != null) {
      const n = Number(search.level);
      if (Number.isInteger(n) && n >= 0 && n <= 5) out.level = n as Level;
    }
    if (typeof search.dataset === "string") out.dataset = search.dataset as DatasetId;
    if (typeof search.id === "string") out.id = search.id;
    if (typeof search.q === "string") out.q = search.q;
    if (typeof search.topic === "string") out.topic = search.topic;
    return out;
  },
  head: () => ({
    meta: [
      { title: "Practice — Kodeverkstedet" },
      {
        name: "description",
        content:
          "Practice SQL on a realistic e-commerce dataset. 50 problems with instant feedback, in your browser.",
      },
      { property: "og:title", content: "Practice — Kodeverkstedet" },
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
const STORAGE_DRAFTS = "sql-practice-drafts-v2";

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

// Format starter SQL so users see canonical line-broken layout. Placeholders
// like `<condition>` are swapped for safe tokens during formatting (sql-formatter
// chokes on `<...>`), then restored.
function prettifyStarter(raw: string): string {
  if (!raw.trim()) return raw;
  const placeholders: string[] = [];
  const masked = raw.replace(/<[A-Za-z][A-Za-z0-9 ]*>/g, (m) => {
    const id = `__PH_${placeholders.length}__`;
    placeholders.push(m);
    return id;
  });
  try {
    const pretty = formatSql(masked, {
      language: "sqlite",
      keywordCase: "upper",
      tabWidth: 2,
    });
    return pretty.replace(/__PH_(\d+)__/g, (_, i) => placeholders[Number(i)] ?? "");
  } catch {
    return raw;
  }
}

function difficultyLabel(d: number): { text: string; cls: string } {
  if (d <= 2) return { text: "Easy", cls: "bg-success/25 text-success border-success/50" };
  if (d <= 3) return { text: "Medium", cls: "bg-warning/25 text-warning border-warning/50" };
  return { text: "Hard", cls: "bg-destructive/25 text-destructive border-destructive/50" };
}

function PracticeWorkbench() {
  const urlSearch = Route.useSearch();
  const appMode = useAppMode();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [hideDone, setHideDone] = useState(false);
  const [levelFilter, setLevelFilter] = useState<Level | "all">(
    urlSearch.level !== undefined ? urlSearch.level : "all",
  );
  const [topicFilter, setTopicFilter] = useState<string>(urlSearch.topic ?? "all");
  const [search, setSearch] = useState(urlSearch.q ?? "");
  const [datasetId, setDatasetId] = useState<DatasetId>(urlSearch.dataset ?? "ecommerce");
  const [activeId, setActiveId] = useState<string>(() => {
    if (urlSearch.id) {
      const fromUrl = PROBLEMS.find((p) => p.id === urlSearch.id);
      if (fromUrl) return fromUrl.id;
    }
    const ds = urlSearch.dataset ?? "ecommerce";
    const lvl = urlSearch.level;
    const matching = PROBLEMS.find(
      (p) =>
        (p.dataset ?? "ecommerce") === ds && (lvl === undefined || p.level === lvl),
    );
    return matching?.id ?? PROBLEMS[0].id;
  });
  const listRef = useRef<HTMLOListElement | null>(null);

  // Load saved last problem on mount — only when no URL params direct us to a specific spot.
  useEffect(() => {
    setProgress(loadProgress());
    if (urlSearch.id || urlSearch.level !== undefined || urlSearch.dataset) return;
    if (typeof window !== "undefined") {
      const last = window.localStorage.getItem(STORAGE_LAST_ID);
      const found = last ? PROBLEMS.find((p) => p.id === last) : undefined;
      if (found) {
        setActiveId(found.id);
        setDatasetId((found.dataset ?? "ecommerce") as DatasetId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_LAST_ID, activeId);
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
    const q = search.trim().toLowerCase();
    return datasetProblems.filter((p) => {
      if (hideDone && progress?.attempts[p.id]?.solved) return false;
      if (levelFilter !== "all" && p.level !== levelFilter) return false;
      if (topicFilter !== "all" && !p.topics.includes(topicFilter)) return false;
      if (q && !`${p.title} ${p.problem} ${p.topics.join(" ")}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [hideDone, levelFilter, topicFilter, search, progress, datasetProblems]);

  const activeIdx = useMemo(
    () => filtered.findIndex((p) => p.id === activeId),
    [filtered, activeId],
  );

  function gotoIdx(idx: number) {
    if (filtered.length === 0) return;
    const wrapped = ((idx % filtered.length) + filtered.length) % filtered.length;
    setActiveId(filtered[wrapped].id);
  }
  function gotoPrev() {
    if (activeIdx === -1) gotoIdx(0);
    else gotoIdx(activeIdx - 1);
  }
  function gotoNext() {
    if (activeIdx === -1) gotoIdx(0);
    else gotoIdx(activeIdx + 1);
  }

  // Global keyboard shortcuts: Alt+Up/Down (or Alt+J/K) to switch problem,
  // ignore when focus is in editor or text input.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? "").toUpperCase();
      const inField = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      const inMonaco = !!document.activeElement?.closest(".monaco-editor");
      if (inField || inMonaco) return;
      if (!e.altKey) return;
      if (e.key === "ArrowDown" || e.key.toLowerCase() === "j") {
        e.preventDefault();
        gotoNext();
      } else if (e.key === "ArrowUp" || e.key.toLowerCase() === "k") {
        e.preventDefault();
        gotoPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx, filtered]);

  // Scroll active item into view in the sidebar
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-pid="${activeId}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  // When switching dataset, jump to its first problem if active doesn't belong
  useEffect(() => {
    const active = PROBLEMS.find((p) => p.id === activeId);
    if (!active || (active.dataset ?? "ecommerce") !== datasetId) {
      const first = datasetProblems[0];
      if (first) setActiveId(first.id);
    }
  }, [datasetId, datasetProblems, activeId]);

  const active = useMemo(() => PROBLEMS.find((p) => p.id === activeId) ?? PROBLEMS[0], [activeId]);

  const solvedCount = progress
    ? datasetProblems.filter((p) => progress.attempts[p.id]?.solved).length
    : 0;

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      <SiteHeader />
      {appMode === "eksamen" && (
        <div className="shrink-0 border-b border-warning/40 bg-warning/15 px-4 py-1.5 text-[12px] font-medium text-warning-foreground/90 flex items-center gap-2 justify-center">
          <span className="inline-block h-2 w-2 rounded-full bg-warning" />
          Eksamen-modus aktiv — fasit er pre-fylt i editoren for hver oppgave.
          <button
            onClick={() => setAppMode("ovning")}
            className="underline underline-offset-2 hover:text-foreground"
          >
            Bytt til Øving
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* LEFT: problem list */}
        <aside className="w-full lg:w-[300px] lg:shrink-0 lg:border-r border-b lg:border-b-0 border-border bg-card/40 flex flex-col max-h-[220px] lg:max-h-none lg:h-full overflow-hidden">
          {/* Filters */}
          <div className="p-3 border-b border-border space-y-2 bg-card/60 backdrop-blur-sm shrink-0">
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
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Søk i oppgaver…"
                className="h-8 pl-7 text-xs"
              />
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1 min-h-0">
            {filtered.length === 0 && (
              <div className="text-sm text-muted-foreground p-4 text-center">
                Ingen oppgaver matcher filtrene. Prøv å fjerne et filter eller endre søket.
              </div>
            )}
            <ol ref={listRef} className="divide-y divide-border">
              {filtered.map((p, i) => {
                const solved = progress?.attempts[p.id]?.solved;
                const isActive = p.id === activeId;
                const diff = difficultyLabel(p.difficulty);
                return (
                  <li
                    key={p.id}
                    data-pid={p.id}
                    className={solved && !hideDone && !isActive ? "opacity-60" : ""}
                  >
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

          <div className="p-2 border-t border-border text-center shrink-0">
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
          onPrev={gotoPrev}
          onNext={gotoNext}
          position={
            activeIdx >= 0 ? { current: activeIdx + 1, total: filtered.length } : undefined
          }
        />
      </div>
    </div>
  );
}

function ProblemWorkspace({
  problem,
  onSolved,
  onPrev,
  onNext,
  position,
}: {
  problem: Problem;
  onSolved: () => void;
  onPrev: () => void;
  onNext: () => void;
  position?: { current: number; total: number };
}) {
  const appMode = useAppMode();
  const [sql, setSql] = useState<string>(problem.starter_sql);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<"correct" | "wrong" | null>(null);
  const [verdictReason, setVerdictReason] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [explain, setExplain] = useState<ExplainReport | null>(null);
  const [bottomTab, setBottomTab] = useState<"result" | "diff" | "explain">("result");
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [running, setRunning] = useState(false);
  const [xpToast, setXpToast] = useState<{ xp: number; achievements: string[] } | null>(null);
  const [solutionCopied, setSolutionCopied] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState<string>(problem.starter_sql);
  const [draftHydrated, setDraftHydrated] = useState(false);

  useEffect(() => {
    if (appMode === "eksamen") {
      // I eksamen-modus pre-fyller vi editor med fasit, slik at studenten
      // kan slå opp svaret direkte uten å løse selv.
      const pretty = prettifyStarter(problem.solution);
      setSql(pretty);
      setSavedSnapshot(pretty);
      setDraftHydrated(true);
      return;
    }
    const drafts = loadDrafts();
    const draft = drafts[problem.id];
    if (draft != null && draft !== problem.starter_sql) {
      setSql(draft);
      setSavedSnapshot(draft);
    } else {
      const pretty = prettifyStarter(problem.starter_sql);
      setSql(pretty);
      setSavedSnapshot(pretty);
    }
    setDraftHydrated(true);
  }, [problem.id, problem.starter_sql, problem.solution, appMode]);
  const startRef = useRef<number>(Date.now());
  const isDirty = sql !== savedSnapshot;

  function copySolution() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(problem.solution).then(() => {
      setSolutionCopied(true);
      setTimeout(() => setSolutionCopied(false), 1500);
    });
  }

  // Persist draft (skip until we've hydrated from localStorage to avoid clobbering;
  // in eksamen-modus skipper vi helt for ikke å overskrive øvings-utkast med fasit).
  useEffect(() => {
    if (!draftHydrated) return;
    if (appMode === "eksamen") return;
    saveDraft(problem.id, sql);
  }, [problem.id, sql, draftHydrated, appMode]);

  const datasetId = (problem.dataset ?? "ecommerce") as DatasetId;
  const runOpts = {
    mode: problem.mode,
    preSql: problem.pre_sql,
    verifySql: problem.verify_sql,
  };
  const isDdl = problem.mode === "ddl";

  async function handleRun() {
    setRunning(true);
    setError(null);
    setVerdict(null);
    setVerdictReason(null);
    setValidation(null);
    setSavedSnapshot(sql);
    const out = await runQuery(sql, datasetId, runOpts);
    if (!out.success) {
      setError(out.error ?? "Query failed");
      setResult(null);
      setExplain(null);
      setRunning(false);
      setBottomTab("result");
      return;
    }
    setResult(out.result ?? null);
    const ex = isDdl ? null : await explainQuery(sql, datasetId);
    setExplain(ex);
    setRunning(false);
    setBottomTab("result");
  }

  async function handlePreviewSql(previewSql: string) {
    setSql(previewSql);
    setSavedSnapshot(previewSql);
    setRunning(true);
    setError(null);
    setVerdict(null);
    setVerdictReason(null);
    setValidation(null);
    const out = await runQuery(previewSql, datasetId, { mode: "select" });
    if (!out.success) {
      setError(out.error ?? "Query failed");
      setResult(null);
      setExplain(null);
      setRunning(false);
      setBottomTab("result");
      return;
    }
    setResult(out.result ?? null);
    setExplain(null);
    setRunning(false);
    setBottomTab("result");
  }

  async function handleSubmit() {
    setRunning(true);
    setError(null);
    setSavedSnapshot(sql);
    const out = await runQuery(sql, datasetId, runOpts);
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
    const v = await validateQuery(sql, problem.solution, problem.validation, datasetId, runOpts);
    setValidation(v);
    const ex = isDdl ? null : await explainQuery(sql, datasetId);
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
    const base = appMode === "eksamen" ? problem.solution : problem.starter_sql;
    setSql(prettifyStarter(base));
    setResult(null);
    setError(null);
    setVerdict(null);
    setVerdictReason(null);
    setValidation(null);
    setExplain(null);
    setBottomTab("result");
  }

  const diff = difficultyLabel(problem.difficulty);

  return (
    <TooltipProvider>
    <section className="flex-1 flex flex-col min-w-0 min-h-0 h-full overflow-hidden relative">
      {xpToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg border border-success bg-card shadow-lg p-4 max-w-xs">
          <div className="font-semibold text-success">+{xpToast.xp} XP earned!</div>
          {xpToast.achievements.length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              🏆 New: {xpToast.achievements.join(", ")}
            </div>
          )}
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border bg-card/40 px-4 py-1.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Problem</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Button
            size="sm"
            variant="ghost"
            onClick={onPrev}
            title="Forrige oppgave (Alt+↑ / Alt+K)"
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {position && (
            <span className="tabular-nums text-[11px]">
              {position.current} / {position.total}
            </span>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={onNext}
            title="Neste oppgave (Alt+↓ / Alt+J)"
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Badge variant="outline" className="text-[10px] ml-2">
            L{problem.level} · {LEVEL_NAMES[problem.level]}
          </Badge>
          <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${diff.cls}`}>
            {diff.text}
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row lg:overflow-hidden overflow-y-auto">
        {/* MAIN COLUMN: problem text, editor, results stacked vertically */}
        <div className="flex-1 min-w-0 lg:min-h-0 flex flex-col lg:overflow-hidden">
          <div className="flex-1 lg:min-h-0 flex flex-col">
            {/* Problem text */}
            <div className="shrink-0 overflow-y-auto lg:max-h-[45%]">
              <div className="px-5 py-4">
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
                  <SqlText>{problem.problem}</SqlText>
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={revealHint}
                          disabled={hintsShown >= problem.hints.length}
                          className="disabled:bg-muted disabled:text-muted-foreground"
                        >
                          <Lightbulb className="h-3.5 w-3.5 mr-1 text-warning" />
                          Hint ({hintsShown}/{problem.hints.length})
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {hintsShown >= problem.hints.length
                        ? "Alle hint er vist"
                        : "Vis neste hint"}
                    </TooltipContent>
                  </Tooltip>
                  <Button size="sm" variant="ghost" onClick={() => setShowSolution((s) => !s)}>
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
                      <li key={i}>
                        <SqlText>{h}</SqlText>
                      </li>
                    ))}
                  </ul>
                )}

                {showSolution && (
                  <div className="mt-3 space-y-2">
                    <div className="relative">
                      <pre className="rounded-md bg-[#1e1e1e] p-3 pr-10 text-xs font-mono text-zinc-100 overflow-auto border border-border">
                        {problem.solution}
                      </pre>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={copySolution}
                        className="absolute top-1 right-1 h-7 w-7"
                        aria-label={solutionCopied ? "Kopiert!" : "Kopier løsning"}
                      >
                        {solutionCopied ? (
                          <Check className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {problem.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-border" />

            {/* Editor */}
            <div className="flex-1 min-h-[320px] lg:min-h-[240px]">
              <div className="flex h-full flex-col min-h-0">
                <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
                  <div className="text-xs font-mono text-muted-foreground flex items-center">
                    {isDirty && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5" />
                    )}
                    query.sql · ⌘/Ctrl + Enter to submit
                  </div>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleRun}
                          disabled={running}
                        >
                          {running ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Run"
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Kjør spørringen lokalt (Ctrl/Cmd+Enter)</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {verdict === "correct" ? (
                          <Button
                            size="sm"
                            onClick={onNext}
                            className="bg-success hover:bg-success/90 text-success-foreground"
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-0.5" />
                          </Button>
                        ) : (
                          <Button size="sm" onClick={handleSubmit} disabled={running}>
                            {running ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Submit"
                            )}
                          </Button>
                        )}
                      </TooltipTrigger>
                      <TooltipContent>
                        {verdict === "correct" ? "Gå til neste oppgave" : "Lever og få vurdering"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  <SqlEditor value={sql} onChange={setSql} onRun={handleSubmit} />
                </div>
              </div>
            </div>
            <div className="border-t border-border" />

            {/* Results / verdict */}
            <div className="shrink-0 overflow-y-auto min-h-[200px] lg:max-h-[40%]">
              <div className="bg-card/30 h-full">
                {verdict === "correct" && (
                  <>
                    <div className="flex items-start gap-3 px-5 py-3 border-b border-success/40 bg-success/10">
                      <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-semibold text-success">Correct!</div>
                        <p className="text-xs text-foreground/80 mt-1">{problem.explanation}</p>
                      </div>
                      {position && position.current < position.total && (
                        <Button size="sm" onClick={onNext} className="shrink-0">
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                    {problem.altSolutions && problem.altSolutions.length > 0 && (
                      <SolutionComparison
                        userSql={sql}
                        canonical={problem.solution}
                        alternatives={problem.altSolutions}
                      />
                    )}
                  </>
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

                <div
                  role="tablist"
                  aria-label="Result panels"
                  className="flex items-center gap-1 px-3 py-1.5 border-b border-border bg-muted/20"
                >
                  <BottomTab
                    active={bottomTab === "result"}
                    onClick={() => setBottomTab("result")}
                    controls="practice-tabpanel-result"
                    label={`Result${result ? ` · ${result.rows.length}` : ""}`}
                  />
                  <BottomTab
                    active={bottomTab === "diff"}
                    onClick={() => setBottomTab("diff")}
                    controls="practice-tabpanel-diff"
                    disabled={!validation || !validation.expected || !validation.actual}
                    label={
                      validation && !validation.correct
                        ? `Diff · ${
                            (validation.expected
                              ? validation.expected.rows.filter(
                                  (r) =>
                                    !validation.actual!.rows.some(
                                      (a) => JSON.stringify(a) === JSON.stringify(r),
                                    ),
                                ).length
                              : 0) +
                            (validation.actual
                              ? validation.actual.rows.filter(
                                  (r) =>
                                    !validation.expected!.rows.some(
                                      (e) => JSON.stringify(e) === JSON.stringify(r),
                                    ),
                                ).length
                              : 0)
                          } off`
                        : "Diff"
                    }
                  />
                  <BottomTab
                    active={bottomTab === "explain"}
                    onClick={() => setBottomTab("explain")}
                    controls="practice-tabpanel-explain"
                    disabled={!explain}
                    label={
                      explain && explain.hints.some((h) => h.level === "warn")
                        ? `Explain · ${explain.hints.filter((h) => h.level === "warn").length} ⚠`
                        : "Explain"
                    }
                  />
                </div>
                <div className="min-h-[160px]">
                  {bottomTab === "result" && (
                    <div role="tabpanel" id="practice-tabpanel-result">
                      <ResultTable result={result} />
                    </div>
                  )}
                  {bottomTab === "diff" && (
                    <div role="tabpanel" id="practice-tabpanel-diff">
                      {validation && validation.expected && validation.actual ? (
                        <ResultDiff
                          expected={validation.expected}
                          actual={validation.actual}
                          ignoreOrder={problem.validation.ignore_order ?? true}
                        />
                      ) : (
                        <div className="px-5 py-6 text-xs text-muted-foreground">
                          Submit your query to see a row-by-row diff against the expected result.
                        </div>
                      )}
                    </div>
                  )}
                  {bottomTab === "explain" && (
                    <div role="tabpanel" id="practice-tabpanel-explain">
                      {explain ? (
                        <ExplainPanel report={explain} />
                      ) : (
                        <div className="px-5 py-6 text-xs text-muted-foreground">
                          Run a query to see its execution plan and performance hints.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="px-5 py-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Tips: Alt+↑/↓ for å bytte oppgave · Ctrl/Cmd+Enter for å kjøre
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SCHEMA SIDEBAR — always visible so the user can refer to tables while solving */}
        <aside className="lg:w-[320px] lg:shrink-0 lg:border-l border-t lg:border-t-0 border-border bg-card/20 lg:overflow-y-auto">
          <div className="px-5 py-4">
            <SchemaPanel
              datasetId={datasetId}
              currentSql={sql}
              onRunSql={handlePreviewSql}
            />
          </div>
        </aside>
      </div>
    </section>
    </TooltipProvider>
  );
}

/**
 * Vises etter at en SQL-løsning er bekreftet riktig. Sammenligner brukerens
 * løsning med 1-2 kuraterte alternative referanse-løsninger, hver med en
 * pedagogisk kommentar om når man bør foretrekke den formen.
 */
function SolutionComparison({
  userSql,
  canonical,
  alternatives,
}: {
  userSql: string;
  canonical: string;
  alternatives: NonNullable<Problem["altSolutions"]>;
}) {
  const [open, setOpen] = useState(true);
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  function copyAlt(code: string, idx: number) {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    });
  }

  return (
    <div className="border-b border-border bg-card/30">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-5 py-2 text-left hover:bg-accent/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-brand" />
          <span className="font-semibold text-sm">
            Sammenlign med andre løsninger
          </span>
          <Badge variant="secondary" className="text-[10px]">
            {alternatives.length} alternativ
            {alternatives.length === 1 ? "" : "er"}
          </Badge>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-4 space-y-3">
          {/* Brukerens løsning vs. den kanoniske — kort sammenligning hvis de er ulike. */}
          {normalizeSql(userSql) !== normalizeSql(canonical) && (
            <div className="rounded-md border border-border bg-background/50 p-3">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                Din løsning vs. fasit
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-muted-foreground mb-1">DU SKREV</div>
                  <pre className="bg-[#1e1e1e] text-zinc-100 rounded p-2 overflow-auto border border-border whitespace-pre-wrap">
                    {userSql.trim()}
                  </pre>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground mb-1">FASIT</div>
                  <pre className="bg-[#1e1e1e] text-zinc-100 rounded p-2 overflow-auto border border-border whitespace-pre-wrap">
                    {canonical.trim()}
                  </pre>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Begge produserer riktig resultat — bare litt ulik formulering.
              </p>
            </div>
          )}

          {/* Listen av alternative løsninger, hver collapsible. */}
          {alternatives.map((alt, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className="rounded-md border border-border bg-background/50 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="flex items-center justify-between w-full px-3 py-2 text-left hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] tabular-nums text-muted-foreground font-mono">
                      #{i + 1}
                    </span>
                    <span className="font-medium text-sm">{alt.navn}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 space-y-2">
                    <div className="relative">
                      <pre className="rounded bg-[#1e1e1e] p-3 pr-10 text-xs font-mono text-zinc-100 overflow-auto border border-border whitespace-pre">
                        {alt.kode}
                      </pre>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyAlt(alt.kode, i)}
                        className="absolute top-1 right-1 h-7 w-7"
                        aria-label={copiedIdx === i ? "Kopiert!" : "Kopier"}
                      >
                        {copiedIdx === i ? (
                          <Check className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      <span className="font-semibold text-brand">Hvorfor: </span>
                      {alt.kommentar}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Veldig grov normalisering for å sjekke om to SQL-strenger er "samme":
 *  fjern alle whitespace + lowercase. Brukt KUN for å avgjøre om vi skal vise
 *  "din løsning vs. fasit"-blokken (sparer rotete UI når brukeren skrev fasiten). */
function normalizeSql(sql: string): string {
  return sql.replace(/\s+/g, "").replace(/;$/g, "").toLowerCase();
}

function BottomTab({
  active,
  onClick,
  label,
  disabled,
  controls,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  disabled?: boolean;
  controls?: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1 rounded-md text-[11px] font-mono transition-colors ${
        active
          ? "bg-background text-foreground border border-border shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {label}
    </button>
  );
}
