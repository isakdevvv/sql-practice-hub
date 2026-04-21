import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SqlEditor } from "@/components/SqlEditor";
import { ResultTable } from "@/components/ResultTable";
import { SchemaPanel } from "@/components/SchemaPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProblem, PROBLEMS } from "@/lib/problems/data";
import { runQuery, validateQuery, type QueryResult } from "@/lib/engine/sqlEngine";
import { recordAttempt, recordHintUsed } from "@/lib/progress/storage";
import { Check, X, Lightbulb, ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { LEVEL_NAMES } from "@/lib/problems/types";

export const Route = createFileRoute("/problem/$problemId")({
  head: ({ params }) => {
    const p = getProblem(params.problemId);
    return {
      meta: [
        { title: p ? `${p.title} — SQL Sandbox` : "Problem — SQL Sandbox" },
        {
          name: "description",
          content: p?.problem ?? "Practice SQL with real queries on an e-commerce dataset.",
        },
      ],
    };
  },
  loader: ({ params }) => {
    const p = getProblem(params.problemId);
    if (!p) throw notFound();
    return p;
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Problem not found</h1>
        <Link to="/practice" className="mt-4 inline-block text-brand hover:underline">
          ← Back to practice
        </Link>
      </div>
    </div>
  ),
  component: ProblemPage,
});

function ProblemPage() {
  const problem = Route.useLoaderData() as import("@/lib/problems/types").Problem;
  const navigate = useNavigate();

  const [sql, setSql] = useState(problem.starter_sql);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<"correct" | "wrong" | null>(null);
  const [verdictReason, setVerdictReason] = useState<string | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [running, setRunning] = useState(false);
  const [xpToast, setXpToast] = useState<{ xp: number; achievements: string[] } | null>(null);
  const startRef = useRef<number>(Date.now());

  // Reset state on problem change
  useEffect(() => {
    setSql(problem.starter_sql);
    setResult(null);
    setError(null);
    setVerdict(null);
    setVerdictReason(null);
    setHintsShown(0);
    setShowSolution(false);
    setXpToast(null);
    startRef.current = Date.now();
  }, [problem.id, problem.starter_sql]);

  const { prevId, nextId } = useMemo(() => {
    const idx = PROBLEMS.findIndex((p) => p.id === problem.id);
    return {
      prevId: idx > 0 ? PROBLEMS[idx - 1].id : null,
      nextId: idx < PROBLEMS.length - 1 ? PROBLEMS[idx + 1].id : null,
    };
  }, [problem.id]);

  async function handleRun() {
    setRunning(true);
    setError(null);
    setVerdict(null);
    setVerdictReason(null);
    const out = await runQuery(sql);
    setRunning(false);
    if (!out.success) {
      setError(out.error ?? "Query failed");
      setResult(null);
      return;
    }
    setResult(out.result ?? null);
  }

  async function handleSubmit() {
    setRunning(true);
    setError(null);
    const out = await runQuery(sql);
    if (!out.success) {
      setError(out.error ?? "Query failed");
      setResult(null);
      setRunning(false);
      return;
    }
    setResult(out.result ?? null);
    const v = await validateQuery(sql, problem.solution, problem.validation);
    setRunning(false);
    if (v.correct) {
      setVerdict("correct");
      setVerdictReason(null);
      const timeMs = Date.now() - startRef.current;
      const { xpEarned, newAchievements } = recordAttempt(problem, {
        correct: true,
        hintsUsed: hintsShown,
        timeMs,
      });
      if (xpEarned > 0) {
        setXpToast({ xp: xpEarned, achievements: newAchievements });
        setTimeout(() => setXpToast(null), 4000);
      }
    } else {
      setVerdict("wrong");
      setVerdictReason(v.reason ?? null);
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      {/* Toast */}
      {xpToast && (
        <div className="fixed top-20 right-4 z-50 rounded-lg border border-success bg-card shadow-lg p-4 max-w-xs animate-in slide-in-from-top">
          <div className="font-semibold text-success">+{xpToast.xp} XP earned!</div>
          {xpToast.achievements.length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              🏆 New: {xpToast.achievements.join(", ")}
            </div>
          )}
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-6 grid lg:grid-cols-[280px_1fr] gap-6 max-w-7xl w-full">
        {/* Sidebar */}
        <aside className="space-y-4 order-2 lg:order-1">
          <Link
            to="/practice"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All problems
          </Link>
          <SchemaPanel />
        </aside>

        {/* Main */}
        <div className="space-y-4 order-1 lg:order-2 min-w-0">
          {/* Problem header */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Badge variant="outline">L{problem.level} · {LEVEL_NAMES[problem.level]}</Badge>
              {problem.topics.map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
              ))}
              <span className="ml-auto">~{problem.estimated_time_min} min</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">{problem.title}</h1>
            <p className="mt-2 text-sm text-foreground/90 leading-relaxed">{problem.problem}</p>
          </div>

          {/* Editor */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
              <div className="text-xs font-mono text-muted-foreground">SQL editor</div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleRun} disabled={running}>
                  Run
                </Button>
                <Button size="sm" onClick={handleSubmit} disabled={running}>
                  Submit
                </Button>
              </div>
            </div>
            <div className="h-[260px]">
              <SqlEditor value={sql} onChange={setSql} onRun={handleSubmit} />
            </div>
            <div className="px-4 py-1.5 border-t border-border text-[10px] text-muted-foreground font-mono">
              ⌘/Ctrl + Enter to submit
            </div>
          </div>

          {/* Verdict */}
          {verdict === "correct" && (
            <div className="flex items-start gap-3 rounded-xl border border-success/40 bg-success/10 p-4">
              <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-success">Correct!</div>
                <p className="text-sm text-foreground/80 mt-1">{problem.explanation}</p>
              </div>
            </div>
          )}
          {verdict === "wrong" && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4">
              <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-destructive">Not quite</div>
                {verdictReason && (
                  <p className="text-sm text-foreground/80 mt-1">{verdictReason}</p>
                )}
              </div>
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 font-mono text-xs text-destructive whitespace-pre-wrap">
              {error}
            </div>
          )}

          {/* Result */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-2 border-b border-border bg-muted/30 text-xs font-mono text-muted-foreground">
              Result {result ? `· ${result.rows.length} rows` : ""}
            </div>
            <div className="max-h-[280px] overflow-auto">
              <ResultTable result={result} />
            </div>
          </div>

          {/* Hints */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Lightbulb className="h-4 w-4 text-warning" /> Hints
              </div>
              {hintsShown < problem.hints.length && (
                <Button size="sm" variant="ghost" onClick={revealHint}>
                  Reveal hint {hintsShown + 1}/{problem.hints.length}
                </Button>
              )}
            </div>
            {hintsShown === 0 ? (
              <p className="text-xs text-muted-foreground">Reveal hints one at a time when stuck.</p>
            ) : (
              <ul className="space-y-1.5 text-sm text-foreground/90 list-disc list-inside">
                {problem.hints.slice(0, hintsShown).map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Solution */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <BookOpen className="h-4 w-4" /> Solution
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSolution((s) => !s)}
              >
                {showSolution ? "Hide" : "Show"}
              </Button>
            </div>
            {showSolution && (
              <div className="space-y-3">
                <pre className="rounded-md bg-[#1e1e1e] p-3 text-xs font-mono text-foreground/90 overflow-auto">
                  {problem.solution}
                </pre>
                <p className="text-xs text-muted-foreground leading-relaxed">{problem.explanation}</p>
              </div>
            )}
          </div>

          {/* Nav */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!prevId}
              onClick={() => prevId && navigate({ to: "/problem/$problemId", params: { problemId: prevId } })}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!nextId}
              onClick={() => nextId && navigate({ to: "/problem/$problemId", params: { problemId: nextId } })}
            >
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
