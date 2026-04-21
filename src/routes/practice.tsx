import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { LEVEL_NAMES, type Level } from "@/lib/problems/types";
import { PROBLEMS } from "@/lib/problems/data";
import { loadProgress, type Progress } from "@/lib/progress/storage";
import { Check } from "lucide-react";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Practice — SQL Sandbox" },
      {
        name: "description",
        content: "Browse 50 SQL practice problems grouped by level: basics, joins, aggregation, subqueries, and advanced.",
      },
      { property: "og:title", content: "Practice — SQL Sandbox" },
      {
        property: "og:description",
        content: "50 SQL problems across 6 difficulty levels, all on a realistic e-commerce dataset.",
      },
    ],
  }),
  component: PracticePage,
});

function PracticePage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  useEffect(() => setProgress(loadProgress()), []);

  const grouped = (Object.keys(LEVEL_NAMES) as unknown as string[])
    .map((k) => Number(k) as Level)
    .map((lvl) => ({
      level: lvl,
      name: LEVEL_NAMES[lvl],
      problems: PROBLEMS.filter((p) => p.level === lvl),
    }));

  const solvedCount = progress
    ? Object.values(progress.attempts).filter((a) => a.solved).length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Practice problems</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {PROBLEMS.length} problems · {solvedCount} solved
            </p>
          </div>
          <Link
            to="/dashboard"
            className="text-sm text-brand hover:underline"
          >
            View progress →
          </Link>
        </div>

        <div className="space-y-8">
          {grouped.map((g) => (
            <section key={g.level}>
              <div className="flex items-baseline gap-3 mb-3">
                <h2 className="text-lg font-semibold">
                  Level {g.level} · {g.name}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {g.problems.filter((p) => progress?.attempts[p.id]?.solved).length}/
                  {g.problems.length}
                </span>
              </div>
              <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
                {g.problems.map((p) => {
                  const solved = progress?.attempts[p.id]?.solved;
                  return (
                    <Link
                      key={p.id}
                      to="/problem/$problemId"
                      params={{ problemId: p.id }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors"
                    >
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                          solved
                            ? "border-success bg-success text-success-foreground"
                            : "border-border bg-background"
                        }`}
                      >
                        {solved && <Check className="h-3.5 w-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{p.title}</div>
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {p.goal}
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-1.5">
                        {p.topics.slice(0, 2).map((t) => (
                          <Badge key={t} variant="secondary" className="text-[10px]">
                            {t}
                          </Badge>
                        ))}
                      </div>
                      <DifficultyDots difficulty={p.difficulty} />
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

function DifficultyDots({ difficulty }: { difficulty: number }) {
  return (
    <div className="flex items-center gap-0.5 w-12 justify-end">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i <= difficulty ? "bg-brand" : "bg-border"
          }`}
        />
      ))}
    </div>
  );
}
