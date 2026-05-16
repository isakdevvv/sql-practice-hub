import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SqlEditor } from "@/components/SqlEditor";
import { ResultTable } from "@/components/ResultTable";
import { SchemaPanel } from "@/components/SchemaPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PROBLEMS } from "@/lib/problems/data";
import type { Problem } from "@/lib/problems/types";
import { runQuery, validateQuery, type QueryResult } from "@/lib/engine/sqlEngine";
import { SqlText } from "@/components/SqlText";
import { Check, X, Clock } from "lucide-react";

export const Route = createFileRoute("/eksamen/trening")({
  head: () => ({
    meta: [
      { title: "Eksamenstrening — tidsbasert SQL-prøve" },
      {
        name: "description",
        content: "Tidsbasert SQL-eksamen: 10 mixed-difficulty oppgaver i 20 minutter.",
      },
    ],
  }),
  component: ExamPage,
});

const EXAM_LENGTH = 10;
const EXAM_MINUTES = 20;

function pickExamProblems(): Problem[] {
  // Stratified sample across levels
  const byLevel: Record<number, Problem[]> = {};
  for (const p of PROBLEMS) {
    (byLevel[p.level] ??= []).push(p);
  }
  const distribution = [1, 2, 3, 2, 1, 1]; // L0..L5 = 10
  const picks: Problem[] = [];
  for (const lvl of [0, 1, 2, 3, 4, 5]) {
    const pool = [...(byLevel[lvl] ?? [])].sort(() => Math.random() - 0.5);
    picks.push(...pool.slice(0, distribution[lvl]));
  }
  return picks.slice(0, EXAM_LENGTH);
}

interface ExamResult {
  problem: Problem;
  correct: boolean;
  userSql: string;
  reason?: string;
}

function ExamPage() {
  const [phase, setPhase] = useState<"start" | "running" | "done">("start");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [idx, setIdx] = useState(0);
  const [sql, setSql] = useState("");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(EXAM_MINUTES * 60);
  const endRef = useRef<number>(0);

  const current = problems[idx];

  useEffect(() => {
    if (phase !== "running") return;
    const tick = setInterval(() => {
      const left = Math.max(0, Math.round((endRef.current - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) finishExam(results);
    }, 500);
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, results]);

  function startExam() {
    const picks = pickExamProblems();
    setProblems(picks);
    setIdx(0);
    setSql(picks[0]?.starter_sql ?? "");
    setResult(null);
    setError(null);
    setResults([]);
    endRef.current = Date.now() + EXAM_MINUTES * 60 * 1000;
    setSecondsLeft(EXAM_MINUTES * 60);
    setPhase("running");
  }

  function loadProblem(i: number) {
    setIdx(i);
    setSql(problems[i].starter_sql);
    setResult(null);
    setError(null);
  }

  async function handleRun() {
    setRunning(true);
    setError(null);
    const out = await runQuery(sql);
    setRunning(false);
    if (!out.success) {
      setError(out.error ?? "Query failed");
      setResult(null);
      return;
    }
    setResult(out.result ?? null);
  }

  async function submitAndNext() {
    if (!current) return;
    setRunning(true);
    const v = await validateQuery(sql, current.solution, current.validation);
    setRunning(false);
    const newResults = [
      ...results.filter((r) => r.problem.id !== current.id),
      { problem: current, correct: v.correct, userSql: sql, reason: v.reason },
    ];
    setResults(newResults);

    if (idx < problems.length - 1) {
      loadProblem(idx + 1);
    } else {
      finishExam(newResults);
    }
  }

  function skip() {
    if (!current) return;
    const newResults = [
      ...results.filter((r) => r.problem.id !== current.id),
      { problem: current, correct: false, userSql: sql, reason: "Skipped" },
    ];
    setResults(newResults);
    if (idx < problems.length - 1) loadProblem(idx + 1);
    else finishExam(newResults);
  }

  function finishExam(finalResults: ExamResult[]) {
    setResults(finalResults);
    setPhase("done");
  }

  const score = useMemo(() => results.filter((r) => r.correct).length, [results]);

  if (phase === "start") {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container mx-auto px-4 py-16 max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight">Eksamenstrening</h1>
          <p className="mt-3 text-muted-foreground">
            {EXAM_LENGTH} mixed-difficulty problems · {EXAM_MINUTES} minutes · no hints, no
            solutions.
          </p>
          <div className="mt-8 rounded-xl border border-border bg-card p-6 text-left text-sm space-y-2">
            <p>• You can run queries freely, but you only get one Submit per problem.</p>
            <p>• You can skip a problem and move on.</p>
            <p>• Timer auto-submits remaining problems as wrong.</p>
            <p>• Your score and per-problem feedback appear at the end.</p>
          </div>
          <Button size="lg" className="mt-8" onClick={startExam}>
            Start exam
          </Button>
        </main>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container mx-auto px-4 py-12 max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight">Exam complete</h1>
          <div className="mt-4 rounded-xl border border-border bg-card p-6">
            <div className="text-5xl font-bold">
              {score}
              <span className="text-2xl text-muted-foreground"> / {problems.length}</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {Math.round((score / problems.length) * 100)}% correct
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {problems.map((p, i) => {
              const r = results.find((rr) => rr.problem.id === p.id);
              const correct = r?.correct ?? false;
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      correct ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
                    }`}
                  >
                    {correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">
                      {i + 1}. {p.title}
                    </div>
                    {!correct && r?.reason && (
                      <div className="text-xs text-muted-foreground truncate">{r.reason}</div>
                    )}
                  </div>
                  <Badge variant="outline">L{p.level}</Badge>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <Button onClick={startExam}>Try another exam</Button>
          </div>
        </main>
      </div>
    );
  }

  // Running
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-6 grid lg:grid-cols-[260px_1fr] gap-6 max-w-7xl w-full">
        <aside className="space-y-4 order-2 lg:order-1">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-warning" />
              {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:
              {String(secondsLeft % 60).padStart(2, "0")}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Question {idx + 1} of {problems.length}
            </div>
          </div>
          <SchemaPanel
            onRunSql={async (s) => {
              setSql(s);
              setError(null);
              setRunning(true);
              const out = await runQuery(s);
              setRunning(false);
              if (!out.success) {
                setError(out.error ?? "Query failed");
                setResult(null);
                return;
              }
              setResult(out.result ?? null);
            }}
          />
        </aside>

        <div className="space-y-4 order-1 lg:order-2 min-w-0">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">L{current.level}</Badge>
              {current.topics.slice(0, 3).map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
              ))}
            </div>
            <h1 className="text-lg font-bold">{current.title}</h1>
            <p className="mt-2 text-sm text-foreground/90">
              <SqlText>{current.problem}</SqlText>
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
              <div className="text-xs font-mono text-muted-foreground">SQL editor</div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={skip} disabled={running}>
                  Skip
                </Button>
                <Button size="sm" variant="outline" onClick={handleRun} disabled={running}>
                  Run
                </Button>
                <Button size="sm" onClick={submitAndNext} disabled={running}>
                  Submit & next
                </Button>
              </div>
            </div>
            <div className="h-[260px]">
              <SqlEditor value={sql} onChange={setSql} onRun={handleRun} />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 font-mono text-xs text-destructive whitespace-pre-wrap">
              {error}
            </div>
          )}

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-2 border-b border-border bg-muted/30 text-xs font-mono text-muted-foreground">
              Result {result ? `· ${result.rows.length} rows` : ""}
            </div>
            <div className="max-h-[260px] overflow-auto">
              <ResultTable result={result} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
