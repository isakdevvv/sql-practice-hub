import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { PROBLEMS } from "@/lib/problems/data";
import {
  loadProgress,
  levelFromXP,
  xpToNextLevel,
  topicMastery,
  type Progress,
} from "@/lib/progress/storage";
import { Flame, Trophy, Target, Zap } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SQL Sandbox" },
      { name: "description", content: "Track your SQL practice progress: XP, level, streak, and topic mastery." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  useEffect(() => setProgress(loadProgress()), []);

  if (!progress) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
          Loading…
        </div>
      </div>
    );
  }

  const solved = Object.values(progress.attempts).filter((a) => a.solved).length;
  const lvl = levelFromXP(progress.xp);
  const xpProgress = xpToNextLevel(progress.xp);
  const mastery = topicMastery(progress, PROBLEMS);
  const sortedTopics = Object.entries(mastery)
    .map(([topic, c]) => ({
      topic,
      ...c,
      pct: c.total > 0 ? c.solved / c.total : 0,
    }))
    .sort((a, b) => a.pct - b.pct);

  const weakAreas = sortedTopics.filter((t) => t.pct < 1).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <h1 className="text-3xl font-bold tracking-tight">Your progress</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Saved locally in your browser.
        </p>

        {/* Stats */}
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Zap className="h-5 w-5 text-brand" />}
            label="XP"
            value={progress.xp.toString()}
            sub={`Level ${lvl}`}
          />
          <StatCard
            icon={<Target className="h-5 w-5 text-success" />}
            label="Solved"
            value={`${solved}`}
            sub={`of ${PROBLEMS.length}`}
          />
          <StatCard
            icon={<Flame className="h-5 w-5 text-warning" />}
            label="Streak"
            value={`${progress.streak}`}
            sub={progress.streak === 1 ? "day" : "days"}
          />
          <StatCard
            icon={<Trophy className="h-5 w-5 text-warning" />}
            label="Achievements"
            value={`${progress.achievements.length}`}
            sub="unlocked"
          />
        </div>

        {/* Level progress */}
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-semibold">Level {lvl}</span>
            <span className="text-muted-foreground">
              {xpProgress.current} / {xpProgress.needed} XP to level {lvl + 1}
            </span>
          </div>
          <ProgressBar value={(xpProgress.current / xpProgress.needed) * 100} />
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-6">
          {/* Topic mastery */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold mb-4">Topic mastery</h2>
            <div className="space-y-3">
              {sortedTopics.map((t) => (
                <div key={t.topic}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-mono text-foreground/90">{t.topic}</span>
                    <span className="text-muted-foreground">
                      {t.solved}/{t.total}
                    </span>
                  </div>
                  <ProgressBar value={t.pct * 100} />
                </div>
              ))}
            </div>
          </div>

          {/* Weak areas + Achievements */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-semibold mb-3">Weak areas</h2>
              {weakAreas.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Great job — every topic mastered!
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {weakAreas.map((t) => (
                    <li key={t.topic} className="flex justify-between">
                      <span className="font-mono">{t.topic}</span>
                      <span className="text-muted-foreground">
                        {Math.round(t.pct * 100)}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-semibold mb-3">Achievements</h2>
              {progress.achievements.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Solve your first problem to unlock achievements.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {progress.achievements.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs text-warning"
                    >
                      🏆 {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/practice"
            className="inline-flex items-center text-sm text-brand hover:underline"
          >
            Continue practicing →
          </Link>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}
