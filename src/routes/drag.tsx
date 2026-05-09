import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DragMatch } from "@/components/learn/DragMatch";
import { DragOrder } from "@/components/learn/DragOrder";
import { DragFill } from "@/components/learn/DragFill";
import { CrowsFoot } from "@/components/learn/CrowsFoot";
import { DRAG_EXERCISES } from "@/lib/learn/dragExercises";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

const KIND_LABEL: Record<"match" | "order" | "fill" | "crowsfoot", string> = {
  match: "Koble",
  order: "Sortér",
  fill: "Fyll inn",
  crowsfoot: "Kråkefot",
};

type KindFilter = "all" | "match" | "order" | "fill" | "crowsfoot";

function DragPage() {
  const [activeId, setActiveId] = useState(DRAG_EXERCISES[0]?.id ?? "");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");

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
          <h1 className="text-2xl font-bold tracking-tight">Drag-oppgaver</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tre typer: koble par, sortér rekkefølge, og fyll inn manglende nøkkelord. Hold
            musen over et element og dra til riktig plass.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {(["all", "match", "order", "fill", "crowsfoot"] as const).map((k) => (
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
                  <span className="font-medium truncate">{e.title}</span>
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
