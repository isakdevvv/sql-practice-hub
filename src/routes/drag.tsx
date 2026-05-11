import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DragMatch } from "@/components/learn/DragMatch";
import { DragOrder } from "@/components/learn/DragOrder";
import { DragFill } from "@/components/learn/DragFill";
import { DragQuiz } from "@/components/learn/DragQuiz";
import { CrowsFoot } from "@/components/learn/CrowsFoot";
import { DRAG_EXERCISES } from "@/lib/learn/dragExercises";
import {
  loadDragProgress,
  resetDragProgress,
  type DragProgress,
} from "@/lib/learn/dragProgress";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Check, Trophy } from "lucide-react";

export const Route = createFileRoute("/drag")({
  head: () => ({
    meta: [
      { title: "Drag-oppgaver — SQL Sandbox" },
      {
        name: "description",
        content:
          "Dra og slipp: koble nøkkelord, sett klausuler i riktig rekkefølge, fyll inn manglende SQL.",
      },
    ],
  }),
  component: DragPage,
});

const KIND_LABEL: Record<"match" | "order" | "fill" | "crowsfoot" | "quiz", string> = {
  match: "Koble",
  order: "Sortér",
  fill: "Fyll inn",
  crowsfoot: "Kråkefot",
  quiz: "Quiz",
};

type KindFilter = "all" | "match" | "order" | "fill" | "crowsfoot" | "quiz";

function DragPage() {
  const [activeId, setActiveId] = useState(DRAG_EXERCISES[0]?.id ?? "");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [progress, setProgress] = useState<DragProgress>(() => loadDragProgress());

  // Re-read progress from localStorage when the user switches exercise — the
  // child components write to localStorage when solved, but don't notify us.
  // Refreshing on exercise change is good enough for the badge to stay in sync.
  useEffect(() => {
    setProgress(loadDragProgress());
  }, [activeId]);

  function resetAll() {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Nullstille all drag-progresjon?")
    )
      return;
    setProgress(resetDragProgress());
  }

  const solvedCount = Object.keys(progress.solved).length;
  const total = DRAG_EXERCISES.length;

  const filtered = useMemo(
    () =>
      kindFilter === "all"
        ? DRAG_EXERCISES
        : DRAG_EXERCISES.filter((e) => e.kind === kindFilter),
    [kindFilter],
  );

  // If active exercise no longer matches filter, snap to first
  const exercise = useMemo(() => {
    return filtered.find((e) => e.id === activeId) ?? filtered[0];
  }, [filtered, activeId]);

  const idx = exercise ? filtered.findIndex((e) => e.id === exercise.id) : 0;

  function go(delta: number) {
    if (!filtered.length) return;
    const next = (idx + delta + filtered.length) % filtered.length;
    setActiveId(filtered[next].id);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Drag-oppgaver</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Fem typer: koble par, sortér rekkefølge, fyll inn manglende nøkkelord, plasser
                kråkefot-symboler, og svar flervalgs-quiz.
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1.5 text-warning text-sm font-mono tabular-nums">
                <Trophy className="h-4 w-4" />
                {progress.xp} XP
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {solvedCount} / {total} løst
              </div>
              {progress.xp > 0 && (
                <button
                  onClick={resetAll}
                  className="text-[10px] text-muted-foreground hover:text-foreground mt-1"
                >
                  Nullstill
                </button>
              )}
            </div>
          </div>
          <div className="mt-3 h-1 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-success transition-all"
              style={{ width: `${(solvedCount / total) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {(["all", "match", "order", "fill", "crowsfoot", "quiz"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKindFilter(k)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                kindFilter === k
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              {k === "all" ? "Alle" : KIND_LABEL[k]} (
              {k === "all" ? DRAG_EXERCISES.length : DRAG_EXERCISES.filter((e) => e.kind === k).length}
              )
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-[240px_1fr] gap-6">
          <aside className="space-y-1">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Oppgaver ({filtered.length})
            </div>
            {filtered.map((e) => (
              <button
                key={e.id}
                onClick={() => setActiveId(e.id)}
                className={cn(
                  "w-full text-left rounded-md px-3 py-2 text-sm transition-colors",
                  e.id === exercise?.id
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {KIND_LABEL[e.kind]}
                  </Badge>
                  <span className="font-medium truncate flex-1">{e.title}</span>
                  {progress.solved[e.id] && (
                    <span
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-success bg-success text-success-foreground"
                      title="Løst"
                    >
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground truncate">
                  {e.topic}
                </div>
              </button>
            ))}
          </aside>

          <div className="space-y-3">
            {exercise ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                      {exercise.topic}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {KIND_LABEL[exercise.kind]}
                    </Badge>
                  </div>
                  <h2 className="font-semibold tracking-tight">{exercise.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{exercise.prompt}</p>
                </div>
                {exercise.kind === "match" && <DragMatch key={exercise.id} exercise={exercise} />}
                {exercise.kind === "order" && <DragOrder key={exercise.id} exercise={exercise} />}
                {exercise.kind === "fill" && <DragFill key={exercise.id} exercise={exercise} />}
                {exercise.kind === "crowsfoot" && (
                  <CrowsFoot key={exercise.id} exercise={exercise} />
                )}
                {exercise.kind === "quiz" && <DragQuiz key={exercise.id} exercise={exercise} />}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                Ingen oppgaver i denne kategorien.
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <Button size="sm" variant="ghost" onClick={() => go(-1)}>
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Forrige
              </Button>
              <span>
                {filtered.length ? idx + 1 : 0} av {filtered.length}
              </span>
              <Button size="sm" variant="ghost" onClick={() => go(1)}>
                Neste <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
