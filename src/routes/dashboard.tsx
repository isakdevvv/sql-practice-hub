import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PROBLEMS } from "@/lib/problems/data";
import {
  loadProgress,
  levelFromXP,
  xpToNextLevel,
  topicMastery,
  downloadProgressJson,
  importFromJson,
  type Progress,
} from "@/lib/progress/storage";
import { Flame, Trophy, Target, Zap, Download, Upload, Brain, Sparkles, ArrowRight } from "lucide-react";
import { flashcardFsrs } from "@/lib/learn/fsrs";
import { dragFsrs } from "@/lib/learn/dragProgress";
import { joinFsrs } from "@/lib/learn/joinProgress";
import { problemFsrs } from "@/lib/progress/storage";
import { getRecommendations, type Recommendation } from "@/lib/skill-tree/recommender";

function countDue(): number {
  if (typeof window === "undefined") return 0;
  const now = Date.now();
  return (
    flashcardFsrs.getDueIds(now).length +
    dragFsrs.getDueIds(now).length +
    joinFsrs.getDueIds(now).length +
    problemFsrs.getDueIds(now).length
  );
}

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
  const [dueCount, setDueCount] = useState(0);
  const [importMsg, setImportMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    setProgress(loadProgress());
    setDueCount(countDue());
    // Anbefalinger leses fra ferdighets-tre-recommender (skill-tree/recommender).
    // Topp 3 vises på dashboard; siden /skill-tre viser inntil 5.
    setRecommendations(getRecommendations(3));
  }, []);

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const text = await file.text();
    const result = importFromJson(text);
    if (result.ok) {
      setProgress(loadProgress());
      setImportMsg({ kind: "ok", text: `Imported from ${file.name}.` });
    } else {
      setImportMsg({ kind: "err", text: result.error });
    }
    setTimeout(() => setImportMsg(null), 4000);
  }

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
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your progress</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Saved locally in your browser. Export to a JSON file to back up or move between
              devices.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => downloadProgressJson()}>
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export JSON
            </Button>
            <Button size="sm" variant="outline" onClick={handleImportClick}>
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Import JSON
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
        {importMsg && (
          <div
            className={`mt-3 rounded-md border px-3 py-2 text-xs ${
              importMsg.kind === "ok"
                ? "border-success/40 bg-success/10 text-success"
                : "border-destructive/40 bg-destructive/10 text-destructive"
            }`}
          >
            {importMsg.text}
          </div>
        )}

        {/* Due i dag — samlet repetisjonskø på tvers av flashcards/drag/JOIN/SQL. */}
        <Link
          to="/repetisjon"
          className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-brand/40 bg-brand/5 hover:bg-brand/10 px-5 py-4 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-brand shrink-0" />
            <div>
              <div className="font-semibold text-sm">Due i dag</div>
              <div className="text-xs text-muted-foreground">
                {dueCount > 0
                  ? `${dueCount} oppgaver klare for spaced repetition`
                  : "Ingen ting due akkurat nå — kom igjen senere"}
              </div>
            </div>
          </div>
          <span className="text-2xl font-bold text-brand tabular-nums">{dueCount}</span>
        </Link>

        {/* Anbefalt neste — topp 3 fra ferdighets-tre-recommender.
            Lagt til som NY seksjon mellom Due-banner og Stats for å unngå
            konflikt med andre agenter som jobber i denne filen. */}
        {recommendations.length > 0 && (
          <section className="mt-6">
            <div className="flex items-baseline gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-brand" />
              <h2 className="font-semibold text-sm">Anbefalt neste</h2>
              <span className="text-xs text-muted-foreground">
                · fra ferdighets-treet
              </span>
              <Link
                to="/skill-tre"
                className="ml-auto text-xs text-brand hover:underline"
              >
                Se hele treet →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recommendations.map((r, i) => (
                <RecommendationCard
                  key={`${r.type}-${r.skillId ?? i}`}
                  rec={r}
                />
              ))}
            </div>
          </section>
        )}

        {/* Stats */}
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const eyebrow =
    rec.type === "diagnose-first"
      ? "Start her"
      : rec.type === "next-unlock"
        ? "Klar for læring"
        : rec.type === "rusty-review"
          ? "Frisk opp"
          : "Sjekk nivå";
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col">
      <div className="text-[10px] font-bold uppercase tracking-wider text-brand mb-1">
        {eyebrow}
      </div>
      <div className="font-semibold text-sm leading-tight mb-1.5">
        {rec.title}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-3">
        {rec.reason}
      </p>
      <a
        href={rec.cta.to}
        className="inline-flex items-center justify-center rounded-md bg-brand text-brand-foreground text-xs font-medium px-3 py-1.5 hover:bg-brand/90 transition-colors"
      >
        {rec.cta.label}
        <ArrowRight className="h-3 w-3 ml-1.5" />
      </a>
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
