import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Check,
  Circle,
  GraduationCap,
  TrendingUp,
  ArrowRight,
  Trophy,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { PHASES, type CurriculumPhase } from "@/lib/stack/curriculum";
import { TRINN } from "@/lib/stack/content";
import {
  computeProgress,
  recommendNextPhase,
  recommendNextSlug,
  type PhaseProgress,
} from "@/lib/stack/phaseProgress";
import { loadDragProgress } from "@/lib/learn/dragProgress";

// First-principles læreplan — visuell oversikt over hele kurset i 14 faser.
// Hver slug i en fase som er ready vises som klikkbar lenke; stubs vises grått.
// Viser ogsi student-progresjon: hvor mange sider åpnet + hvor mange oppgaver løst per fase.

export function LaereplanPage() {
  const [progress, setProgress] = useState<PhaseProgress[]>([]);
  const [totalXp, setTotalXp] = useState(0);

  // localStorage isn't available SSR — load client-side only.
  useEffect(() => {
    setProgress(computeProgress());
    setTotalXp(loadDragProgress().xp);
  }, []);

  const recommendedPhase = progress.length > 0 ? recommendNextPhase(progress) : null;
  const recommendedSlug = recommendedPhase
    ? recommendNextSlug(recommendedPhase)
    : null;

  // Overall percent — weighted by total exercises per phase
  const overallPercent = (() => {
    if (progress.length === 0) return 0;
    const totalEx = progress.reduce((s, p) => s + p.exercisesTotal, 0);
    const solvedEx = progress.reduce((s, p) => s + p.exercisesSolved, 0);
    const totalPages = progress.reduce((s, p) => s + p.pagesTotal, 0);
    const startedPages = progress.reduce((s, p) => s + p.pagesStarted, 0);
    if (totalEx === 0 && totalPages === 0) return 0;
    const pagesPct = totalPages === 0 ? 0 : startedPages / totalPages;
    const exPct = totalEx === 0 ? 0 : solvedEx / totalEx;
    return Math.round(100 * (0.3 * pagesPct + 0.7 * exPct));
  })();

  const statusOf = (slug: string) =>
    TRINN.find((t) => t.slug === slug)?.status ?? null;
  const titleOf = (slug: string) =>
    TRINN.find((t) => t.slug === slug)?.title ?? slug;

  return (
    <StackPageShell title="Læreplan — første prinsipper" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Komplett dataingeniør-løype
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Læreplan — fra transistor til deploy
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Hele plattformen organisert i faser, basert på hvordan MIT 6.*,
            Stanford CS, CMU 15.* og ETH bygger opp en CS-bachelor. Hver fase
            svarer på ett konkret spørsmål du trenger for neste fase. Vi tar
            aldri i bruk en abstraksjon vi ikke først har åpnet opp.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <GraduationCap className="h-5 w-5 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Slik bruker du planen:</span> gå
              gjennom hver fase i rekkefølge. Innenfor en fase: les teorien, så
              øvelsene på{" "}
              <Link to="/drag" className="text-brand hover:underline">/drag</Link>.
              Du kan også gjøre alt på et fag via fag-filteret. Spor fremgang
              med poeng — alt lagres lokalt i nettleseren.
            </div>
          </div>
        </div>

        {/* Total fremgang */}
        {progress.length > 0 && (
          <div className="mb-8 rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-brand" />
                <h2 className="text-lg font-semibold">Din fremgang</h2>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-warning font-mono tabular-nums">
                  <Trophy className="h-4 w-4" />
                  {totalXp} XP
                </div>
                <div className="font-mono tabular-nums">
                  <span className="text-brand">{overallPercent}%</span>
                  <span className="text-muted-foreground"> totalt</span>
                </div>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand to-success transition-all"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
            {recommendedPhase && (
              <div className="mt-4 flex items-start gap-3 text-sm">
                <ArrowRight className="h-4 w-4 text-brand mt-0.5 shrink-0" />
                <div>
                  <strong className="text-foreground">Anbefalt neste:</strong>{" "}
                  <span className="text-muted-foreground">
                    Fase {recommendedPhase.phase.num} —{" "}
                  </span>
                  {recommendedSlug ? (
                    <Link
                      to="/stack/$slug"
                      params={{ slug: recommendedSlug }}
                      className="text-brand hover:underline font-medium"
                    >
                      {titleOf(recommendedSlug)}
                    </Link>
                  ) : (
                    <span className="text-foreground">
                      {recommendedPhase.phase.title} (alle sider startet — drill
                      oppgavene)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Faser */}
        <div className="space-y-6">
          {PHASES.map((phase) => {
            const p = progress.find((pp) => pp.phase.id === phase.id);
            return (
              <PhaseCard
                key={phase.id}
                phase={phase}
                progress={p}
                statusOf={statusOf}
                titleOf={titleOf}
              />
            );
          })}
        </div>

        {/* Bunn-CTA */}
        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Hvor passer dette inn?</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">Stack-oversikten</strong>:{" "}
              <Link to="/stack" className="text-brand hover:underline">
                /stack
              </Link>{" "}
              viser alle trinn i samme rekkefølge.
            </li>
            <li>
              <strong className="text-foreground">Drag-oppgaver</strong>:{" "}
              <Link to="/drag" className="text-brand hover:underline">
                /drag
              </Link>{" "}
              for fyll-inn, match, sortér, quiz.
            </li>
            <li>
              <strong className="text-foreground">Python-kjøremotor</strong>:{" "}
              <Link to="/python" className="text-brand hover:underline">
                /python
              </Link>{" "}
              for kjørbare oppgaver.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}

function PhaseCard({
  phase,
  progress,
  statusOf,
  titleOf,
}: {
  phase: CurriculumPhase;
  progress: PhaseProgress | undefined;
  statusOf: (slug: string) => "ready" | "stub" | null;
  titleOf: (slug: string) => string;
}) {
  const slugs = phase.slugs;
  const readyCount = slugs.filter((s) => statusOf(s) === "ready").length;
  const total = slugs.length;
  const percent = progress?.percent ?? 0;
  const hasProgress = progress && (progress.pagesStarted > 0 || progress.exercisesSolved > 0);

  return (
    <section id={phase.id} className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between gap-3 mb-2 flex-wrap">
        <h2 className="text-xl font-semibold">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand/10 text-brand text-sm font-mono mr-2">
            {phase.num}
          </span>
          {phase.title}
        </h2>
        <div className="flex items-center gap-3 text-xs text-muted-foreground tabular-nums">
          {progress && (
            <span className={percent > 0 ? "text-success" : ""}>
              {percent}% gjort
            </span>
          )}
          <span>
            {readyCount} / {total} klar
          </span>
        </div>
      </div>

      {/* Mini progress bar */}
      <div className="h-1 w-full rounded-full bg-muted overflow-hidden mb-3">
        <div
          className="h-full bg-success transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-sm text-muted-foreground mb-2">{phase.why}</p>
      {phase.analog && (
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3 font-mono">
          {phase.analog}
        </div>
      )}

      {hasProgress && progress && (
        <div className="text-xs text-muted-foreground mb-3 font-mono">
          {progress.pagesStarted}/{progress.pagesTotal} sider startet ·{" "}
          {progress.exercisesSolved}/{progress.exercisesTotal} oppgaver løst
        </div>
      )}

      <ul className="space-y-1.5">
        {slugs.map((slug) => {
          const status = statusOf(slug);
          const title = titleOf(slug);
          if (status === "ready") {
            return (
              <li key={slug}>
                <Link
                  to="/stack/$slug"
                  params={{ slug }}
                  className="flex items-center gap-2 text-sm text-foreground hover:text-brand transition-colors py-0.5"
                >
                  <Check className="h-3.5 w-3.5 text-success shrink-0" />
                  <span>{title}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    /{slug}
                  </span>
                </Link>
              </li>
            );
          }
          return (
            <li
              key={slug}
              className="flex items-center gap-2 text-sm text-muted-foreground/60 py-0.5"
            >
              <Circle className="h-3.5 w-3.5 shrink-0" />
              <span>{title}</span>
              <span className="text-xs font-mono">/{slug}</span>
              <span className="text-[10px] uppercase tracking-wider rounded bg-muted px-1.5 py-0.5">
                {status === "stub" ? "kommer" : "ikke bygd"}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
