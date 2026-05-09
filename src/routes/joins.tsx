import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JoinExplorer } from "@/components/learn/JoinExplorer";
import { JOIN_EXERCISES } from "@/lib/learn/joinExercises";
import { loadJoinProgress, resetJoinProgress } from "@/lib/learn/joinProgress";
import { Check, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/joins")({
  head: () => ({
    meta: [
      { title: "Visuelle JOIN-oppgaver — SQL Sandbox" },
      {
        name: "description",
        content:
          "Lær INNER, LEFT, RIGHT og FULL JOIN ved å se to tabeller side om side og bytte mellom JOIN-typer.",
      },
    ],
  }),
  component: JoinsPage,
});

function JoinsPage() {
  const [activeId, setActiveId] = useState(JOIN_EXERCISES[0]?.id ?? "");
  const [solved, setSolved] = useState<Record<string, true>>({});
  const exercise = useMemo(
    () => JOIN_EXERCISES.find((e) => e.id === activeId) ?? JOIN_EXERCISES[0],
    [activeId],
  );
  const idx = Math.max(0, JOIN_EXERCISES.findIndex((e) => e.id === activeId));
  const solvedCount = Object.keys(solved).length;
  const hasNext = JOIN_EXERCISES.length > 1;

  useEffect(() => {
    setSolved(loadJoinProgress().solved);
  }, []);

  // Refresh solved state when the active exercise changes — JoinExplorer writes
  // to localStorage on a correct answer, so re-read so the sidebar checkmark
  // and counter stay in sync.
  useEffect(() => {
    setSolved(loadJoinProgress().solved);
  }, [activeId]);

  function go(delta: number) {
    setSolved(loadJoinProgress().solved);
    const next = (idx + delta + JOIN_EXERCISES.length) % JOIN_EXERCISES.length;
    setActiveId(JOIN_EXERCISES[next].id);
  }

  function goNextUnsolved() {
    const fresh = loadJoinProgress().solved;
    setSolved(fresh);
    const len = JOIN_EXERCISES.length;
    for (let i = 1; i <= len; i++) {
      const cand = JOIN_EXERCISES[(idx + i) % len];
      if (!fresh[cand.id]) {
        setActiveId(cand.id);
        return;
      }
    }
    // All solved — just go to the next one in order.
    setActiveId(JOIN_EXERCISES[(idx + 1) % len].id);
  }

  function reset() {
    resetJoinProgress();
    setSolved({});
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
          Ingen JOIN-oppgaver ennå.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Visuelle JOIN-oppgaver</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bytt mellom INNER, LEFT, RIGHT og FULL JOIN på samme tabeller. Matchende rader
            lyser opp grønt; rader uten match dempes. NULL vises som rød pille.
          </p>
        </div>

        <div className="grid md:grid-cols-[220px_1fr] gap-6">
          <aside className="space-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Oppgaver ({solvedCount}/{JOIN_EXERCISES.length})
              </div>
              {solvedCount > 0 && (
                <button
                  onClick={reset}
                  title="Nullstill progresjon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              )}
            </div>
            <div
              className="h-1 w-full rounded-full bg-muted overflow-hidden mb-3"
              aria-label="Progresjon"
            >
              <div
                className="h-full bg-success transition-all"
                style={{
                  width: `${(solvedCount / JOIN_EXERCISES.length) * 100}%`,
                }}
              />
            </div>
            {JOIN_EXERCISES.map((e) => {
              const isSolved = !!solved[e.id];
              return (
                <button
                  key={e.id}
                  onClick={() => setActiveId(e.id)}
                  className={cn(
                    "w-full text-left rounded-md px-3 py-2 text-sm transition-colors",
                    e.id === activeId
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {e.id}
                    </span>
                    <span className="font-medium truncate flex-1">{e.title}</span>
                    {isSolved && <Check className="h-3.5 w-3.5 text-success shrink-0" />}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {"●".repeat(e.difficulty)}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {e.topic}
                    </span>
                  </div>
                </button>
              );
            })}
          </aside>

          <div className="space-y-3">
            <JoinExplorer
              key={exercise.id}
              exercise={exercise}
              onAdvance={goNextUnsolved}
              hasNext={hasNext}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <Button size="sm" variant="ghost" onClick={() => go(-1)}>
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Forrige
              </Button>
              <span>
                {idx + 1} av {JOIN_EXERCISES.length}
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
