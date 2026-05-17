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
import { Flame, Trophy, Target, Zap, Download, Upload, Sparkles, ArrowRight, Clock, CalendarClock } from "lucide-react";
import { getRecommendations, type Recommendation } from "@/lib/skill-tree/recommender";
import {
  usePinnedSubjects,
  useLastVisitedSubject,
} from "@/lib/userSubjects";
import {
  EXAM_META,
  SUBJECT_BY_SLUG,
  type Subject,
} from "@/lib/subjects/catalog";
import {
  examUrgency,
  formatDaysUntil,
  type ExamUrgency,
} from "@/lib/subjects/examDate";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Du — din fremgang og eksamen-oversikt" },
      {
        name: "description",
        content:
          "Personlig oversikt: dager til hver eksamen, fremgang per pinned fag, anbefalt neste oppgave, XP og topic-mastery.",
      },
    ],
  }),
  component: DashboardPage,
});

// "Visited count" per fag-slug — leser samme localStorage som CourseOutline
// skriver til. Brukes til å vise progresjon på pinned fag.
const VISITED_PREFIX = "sql-practice-course-visited-v1:";

function loadVisitedCount(slug: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(VISITED_PREFIX + slug);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

function urgencyClasses(u: ExamUrgency): string {
  switch (u) {
    case "urgent":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/40";
    case "soon":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/40";
    case "later":
      return "bg-brand/10 text-brand border-brand/30";
    case "no-date":
    case "past":
      return "bg-muted text-muted-foreground border-border";
  }
}

function urgencyRankForSort(u: ExamUrgency, _days: number | null): number {
  switch (u) {
    case "urgent": return 0;
    case "soon": return 1;
    case "later": return 2;
    case "no-date": return 3;
    case "past": return 4;
  }
}

function DashboardPage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [importMsg, setImportMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [visitedCounts, setVisitedCounts] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const pinnedSlugs = usePinnedSubjects();
  const lastVisited = useLastVisitedSubject();

  useEffect(() => {
    setProgress(loadProgress());
    setRecommendations(getRecommendations(3));
  }, []);

  // Last visited-counts for pinned fag. Re-leser når pinned-listen endrer seg
  // (toggleSubject sender custom event som usePinnedSubjects abonnerer på).
  useEffect(() => {
    const counts: Record<string, number> = {};
    for (const slug of pinnedSlugs) {
      counts[slug] = loadVisitedCount(slug);
    }
    setVisitedCounts(counts);
  }, [pinnedSlugs]);

  // Pinned fag sortert etter eksamen-urgens (samme logikk som /mine-fag og /).
  const pinnedSubjects = (() => {
    const subjects = pinnedSlugs
      .map((slug) => SUBJECT_BY_SLUG[slug])
      .filter(Boolean);
    return subjects.slice().sort((a, b) => {
      const ua = examUrgency(EXAM_META[a.slug]?.eksamen);
      const ub = examUrgency(EXAM_META[b.slug]?.eksamen);
      const rankA = urgencyRankForSort(ua.urgency, ua.days);
      const rankB = urgencyRankForSort(ub.urgency, ub.days);
      if (rankA !== rankB) return rankA - rankB;
      if (ua.days != null && ub.days != null) return ua.days - ub.days;
      return 0;
    });
  })();

  const lastVisitedSubject = lastVisited
    ? SUBJECT_BY_SLUG[lastVisited.slug] ?? null
    : null;

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
            <h1 className="text-3xl font-bold tracking-tight">Din fremgang</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Personlig oversikt over fagene dine, nedtelling til eksamen, og total
              øvings-aktivitet. Alt lagres lokalt — eksportér til JSON for å sikkerhetskopiere.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => downloadProgressJson()}>
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Eksportér JSON
            </Button>
            <Button size="sm" variant="outline" onClick={handleImportClick}>
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Importér JSON
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

        {/* Fortsett der du slapp */}
        {lastVisitedSubject && (
          <Link
            to="/stack/$slug"
            params={{ slug: lastVisitedSubject.slug }}
            className="mt-6 flex items-center gap-3 rounded-xl border-2 border-success/40 bg-success/5 hover:border-success hover:bg-success/10 px-4 py-3.5 transition-colors"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/15">
              <Clock className="h-5 w-5 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-success mb-0.5">
                Fortsett der du slapp
              </div>
              <div className="text-sm font-semibold text-foreground truncate">
                {lastVisitedSubject.code} — {lastVisitedSubject.navn}
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-success shrink-0" />
          </Link>
        )}

        {/* Pinned fag — eksamen-tabell sortert etter nærmeste eksamen */}
        {pinnedSubjects.length > 0 && (
          <section className="mt-8">
            <div className="flex items-baseline gap-2 mb-3">
              <CalendarClock className="h-4 w-4 text-brand" />
              <h2 className="font-semibold text-sm">Dine eksamener</h2>
              <span className="text-xs text-muted-foreground">
                · {pinnedSubjects.length} pinnet, sortert etter nærmeste
              </span>
              <Link
                to="/mine-fag"
                className="ml-auto text-xs text-brand hover:underline"
              >
                Endre pinnede fag →
              </Link>
            </div>
            <div className="space-y-2">
              {pinnedSubjects.map((s) => (
                <PinnedExamRow
                  key={s.slug}
                  subject={s}
                  visitedCount={visitedCounts[s.slug] ?? 0}
                />
              ))}
            </div>
          </section>
        )}
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

        {/* Anbefalt neste — topp 3 fra ferdighets-tre-recommender. */}
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

/** Én rad i "Dine eksamener"-tabellen. Viser fag-kode, navn, countdown-pille,
 *  progress-bar over besøkte seksjoner, og lenke til fag-huben. */
function PinnedExamRow({
  subject,
  visitedCount,
}: {
  subject: Subject;
  visitedCount: number;
}) {
  const Icon = subject.Icon;
  const meta = EXAM_META[subject.slug];
  const u = examUrgency(meta?.eksamen);
  const urgencyStyle = urgencyClasses(u.urgency);
  // Bruk visitedCount som en ENKEL approximasjon på progress — vi har ikke en
  // total-teller per fag bygd inn enda. Mer presis progress finnes på selve
  // fag-huben.
  const progressPct = Math.min(100, visitedCount * 5); // grovt: 20 seksjoner = 100%
  return (
    <Link
      to="/stack/$slug"
      params={{ slug: subject.slug }}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card hover:border-brand/40 p-3 transition-colors"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/15">
        <Icon className="h-4 w-4 text-brand" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
            {subject.code}
          </span>
          {meta && (
            <span className="text-[10px] text-muted-foreground">
              {meta.stp} stp
            </span>
          )}
          {meta?.eksamen && (
            <span className="text-[10px] text-muted-foreground">
              · {meta.eksamen}
            </span>
          )}
        </div>
        <div className="text-sm font-semibold text-foreground truncate mt-0.5">
          {subject.navn}
        </div>
        <div className="mt-1.5 h-1 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-success transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
          {visitedCount > 0 ? `${visitedCount} seksjoner sett` : "Ikke startet"}
        </div>
      </div>
      <div className="shrink-0 text-right flex flex-col items-end gap-1">
        {u.days != null && u.days >= 0 ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums ${urgencyStyle}`}
          >
            <CalendarClock className="h-3 w-3" />
            {formatDaysUntil(u.days)}
          </span>
        ) : (
          <span className="text-[10px] text-muted-foreground italic">
            {u.urgency === "no-date" ? "Mappe/hjemmeeks." : "—"}
          </span>
        )}
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
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
