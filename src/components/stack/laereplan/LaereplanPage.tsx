import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Check,
  Circle,
  GraduationCap,
  TrendingUp,
  ArrowRight,
  Trophy,
  Sigma,
  Cpu,
  Layers,
  Database,
  Brain,
  Wrench,
  Boxes,
  ArrowDown,
  GitBranch,
  Pin,
  MapPin,
  CalendarClock,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import {
  PHASES,
  phaseOfSlug,
  phasesDependedOnBy,
  phasesUnlockedBy,
  type CurriculumPhase,
} from "@/lib/stack/curriculum";
import { TRINN } from "@/lib/stack/content";
import {
  computeProgress,
  recommendNextPhase,
  recommendNextSlug,
  type PhaseProgress,
} from "@/lib/stack/phaseProgress";
import { loadDragProgress } from "@/lib/learn/dragProgress";
import { Mermaid } from "@/components/Mermaid";
import { usePinnedSubjects } from "@/lib/userSubjects";
import { EXAM_META, SUBJECT_BY_SLUG } from "@/lib/subjects/catalog";
import { examUrgency, formatDaysUntil } from "@/lib/subjects/examDate";

// First-principles læreplan med visualisert rød tråd:
// 1. Stack-diagram (layer-cake) øverst — alle lagene fra matematikk til
//    spesialisering på én side, klikkbar.
// 2. Vertikal linje som binder fasekortene sammen — den fysiske røde tråden.
// 3. "Bygger på" og "Åpner opp"-callouts på hver fase, basert på dependsOn
//    fra curriculum.ts.
// 4. Mermaid-DAG nederst som viser hele avhengighet-grafen.

type LayerKey = NonNullable<CurriculumPhase["layer"]>;

const LAYER_META: Record<
  LayerKey,
  { label: string; intro: string; Icon: typeof Sigma; pill: string; band: string }
> = {
  matematikk: {
    label: "Matematikk",
    intro: "Språket alt bygger på — diskret, sannsynlighet, lineær algebra.",
    Icon: Sigma,
    pill: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
    band: "from-rose-500/15 to-rose-500/5",
  },
  hardware: {
    label: "Hardware",
    intro: "Hvordan datamaskinen faktisk fungerer — transistor, CPU, bytes.",
    Icon: Cpu,
    pill: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    band: "from-amber-500/15 to-amber-500/5",
  },
  system: {
    label: "System",
    intro: "Lag over hardware: algoritmer, OS, nettverk.",
    Icon: Layers,
    pill: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
    band: "from-blue-500/15 to-blue-500/5",
  },
  data: {
    label: "Data & persistens",
    intro: "Hvor applikasjoner faktisk lever — relasjonsmodell og SQL.",
    Icon: Database,
    pill: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
    band: "from-cyan-500/15 to-cyan-500/5",
  },
  ai: {
    label: "AI & maskinlæring",
    intro: "Klassisk søk + statistisk læring + dyplæring.",
    Icon: Brain,
    pill: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30",
    band: "from-violet-500/15 to-violet-500/5",
  },
  produkt: {
    label: "Produkt & deploy",
    intro: "Hvor stoffet blir til ekte produkter — web, API, DevOps.",
    Icon: Wrench,
    pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    band: "from-emerald-500/15 to-emerald-500/5",
  },
  spesialisering: {
    label: "Spesialisering",
    intro: "Spor som velger én plattform: mobil eller enterprise web.",
    Icon: Boxes,
    pill: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30",
    band: "from-orange-500/15 to-orange-500/5",
  },
};

// Stack-diagrammet vises bunn → topp (matematikk nederst, spesialisering øverst).
const LAYER_ORDER_BOTTOM_UP: LayerKey[] = [
  "matematikk",
  "hardware",
  "system",
  "data",
  "ai",
  "produkt",
  "spesialisering",
];

export function LaereplanPage() {
  const [progress, setProgress] = useState<PhaseProgress[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const pinnedSlugs = usePinnedSubjects();

  useEffect(() => {
    setProgress(computeProgress());
    setTotalXp(loadDragProgress().xp);
  }, []);

  // Mapping pinnet fag-slug → fase. Bruker phaseOfSlug fra curriculum.ts som
  // ser om slug-en finnes i noen phase.slugs-array. Et pinnet fag (DTE-2507)
  // mapper typisk til én fase (nettverk).
  const pinnedPhaseEntries = useMemo(() => {
    const seen = new Map<string, { phaseId: string; subjectSlug: string; subjectCode: string }>();
    for (const subjectSlug of pinnedSlugs) {
      const phase = phaseOfSlug(subjectSlug);
      if (!phase) continue;
      // Bare første treff per fase — om to fag hører til samme fase vises kun
      // den mest urgent eksamen-pillen, men begge får pin-badge.
      if (!seen.has(phase.id)) {
        const subject = SUBJECT_BY_SLUG[subjectSlug];
        seen.set(phase.id, {
          phaseId: phase.id,
          subjectSlug,
          subjectCode: subject?.code ?? subjectSlug.toUpperCase(),
        });
      }
    }
    return seen;
  }, [pinnedSlugs]);

  const pinnedPhaseIds = useMemo(
    () => new Set(pinnedPhaseEntries.keys()),
    [pinnedPhaseEntries],
  );

  // Liste over pinnede faser med eksamen-urgens, sortert etter nærmeste først.
  // Brukes til "Du er her"-banneret øverst.
  const pinnedPhasesWithUrgency = useMemo(() => {
    return Array.from(pinnedPhaseEntries.values())
      .map((entry) => {
        const phase = PHASES.find((p) => p.id === entry.phaseId);
        const meta = EXAM_META[entry.subjectSlug];
        const u = examUrgency(meta?.eksamen);
        return { ...entry, phase, urgency: u, examString: meta?.eksamen };
      })
      .filter((x): x is typeof x & { phase: CurriculumPhase } => !!x.phase)
      .sort((a, b) => {
        const da = a.urgency.days;
        const db = b.urgency.days;
        if (da == null && db == null) return 0;
        if (da == null) return 1;
        if (db == null) return -1;
        return da - db;
      });
  }, [pinnedPhaseEntries]);

  const recommendedPhase = progress.length > 0 ? recommendNextPhase(progress) : null;
  const recommendedSlug = recommendedPhase
    ? recommendNextSlug(recommendedPhase)
    : null;

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

  // Phases gruppert etter lag — for stack-diagrammet.
  const phasesByLayer = useMemo(() => {
    const map = new Map<LayerKey, CurriculumPhase[]>();
    for (const layer of LAYER_ORDER_BOTTOM_UP) map.set(layer, []);
    for (const phase of PHASES) {
      const layer = phase.layer ?? "produkt";
      map.get(layer)!.push(phase);
    }
    return map;
  }, []);

  const mermaidGraph = useMemo(() => buildMermaidDag(), []);

  return (
    <StackPageShell title="Læreplan — første prinsipper" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero */}
        <div className="mb-10">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Komplett dataingeniør-løype
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Læreplan — fra transistor til deploy
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Hele plattformen organisert i 17 faser, basert på hvordan MIT 6.*,
            Stanford CS, CMU 15.* og ETH bygger opp en CS-bachelor. Hver fase
            svarer på ett konkret spørsmål du trenger for neste fase. Vi tar aldri
            i bruk en abstraksjon vi ikke først har åpnet opp.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <GraduationCap className="h-5 w-5 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Slik bruker du planen:</span> bla
              gjennom stack-diagrammet for å se hvordan lagene henger sammen, så
              jobb deg gjennom hver fase i rekkefølge. Hver fase har «bygger på»
              og «åpner opp»-pekere så du ser hvorfor den kommer der den gjør.
            </div>
          </div>
        </div>

        {/* === DU ER HER === */}
        {pinnedPhasesWithUrgency.length > 0 && (
          <section className="mb-10">
            <div className="rounded-xl border-2 border-brand/40 bg-gradient-to-br from-brand/10 via-card to-success/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5 text-brand" />
                <h2 className="text-lg font-semibold">Du er her</h2>
                <span className="text-xs text-muted-foreground">
                  · basert på pinnede fag
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Disse fasene er aktive for deg akkurat nå. Klikk for å hoppe rett
                til fasen i listen under, eller åpne fag-huben fra Mine fag.
              </p>
              <div className="grid sm:grid-cols-2 gap-2">
                {pinnedPhasesWithUrgency.map(({ phase, subjectCode, urgency, examString }) => {
                  const layer = phase.layer ? LAYER_META[phase.layer] : null;
                  return (
                    <a
                      key={phase.id}
                      href={`#${phase.id}`}
                      className={`group rounded-lg border p-3 transition-colors hover:border-brand bg-background/60 ${
                        layer ? layer.pill : "border-border"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Pin className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {subjectCode}
                        </span>
                        <span className="text-[10px] opacity-70">·</span>
                        <span className="text-[10px] font-mono opacity-70">
                          fase {phase.num}
                        </span>
                        {urgency.days != null && urgency.days >= 0 && (
                          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold tabular-nums">
                            <CalendarClock className="h-3 w-3" />
                            {formatDaysUntil(urgency.days)}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-foreground leading-tight">
                        {phase.title.split("—")[0].trim()}
                      </div>
                      {examString && (
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          📅 {examString}
                        </div>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* === STACK-DIAGRAM === */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Lagene — bunn-til-topp</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Dataingeniør-stien som lagkake. Matematikk er fundamentet; mobile og
            enterprise sitter øverst. Klikk en fase-chip for å hoppe direkte til
            den i listen under.
          </p>
          <div className="rounded-xl border-2 border-brand/30 bg-card overflow-hidden">
            {[...LAYER_ORDER_BOTTOM_UP].reverse().map((layer, idx, arr) => {
              const meta = LAYER_META[layer];
              const phases = phasesByLayer.get(layer) ?? [];
              if (phases.length === 0) return null;
              const LayerIcon = meta.Icon;
              return (
                <div
                  key={layer}
                  className={`bg-gradient-to-r ${meta.band} ${
                    idx === arr.length - 1 ? "" : "border-b border-border"
                  } p-4`}
                >
                  <div className="flex items-start gap-3 flex-wrap">
                    <div className="flex items-center gap-2 min-w-[180px] shrink-0">
                      <LayerIcon className="h-4 w-4 text-foreground/70" />
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-foreground">
                          {meta.label}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {meta.intro}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {phases.map((p) => {
                        const isPinned = pinnedPhaseIds.has(p.id);
                        return (
                          <a
                            key={p.id}
                            href={`#${p.id}`}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors hover:scale-[1.03] ${
                              isPinned
                                ? "border-2 border-brand bg-brand/15 text-foreground shadow-sm shadow-brand/20 ring-2 ring-brand/20"
                                : meta.pill
                            }`}
                            title={
                              isPinned
                                ? `★ Pinnet · ${p.shortSummary ?? p.title}`
                                : p.shortSummary
                            }
                          >
                            {isPinned && <Pin className="h-2.5 w-2.5" />}
                            <span className="font-mono opacity-70">{p.num}</span>
                            {p.title.split("—")[0].trim()}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="px-4 py-2 bg-muted/50 text-[11px] text-muted-foreground text-center flex items-center justify-center gap-2">
              <ArrowDown className="h-3 w-3" />
              Mer abstrakt — hvert lag bygger på det under
            </div>
          </div>
        </section>

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

        {/* === FASER med rød tråd === */}
        <div className="relative">
          {/* Den røde tråden — vertikal linje gjennom alle fasene */}
          <div
            aria-hidden="true"
            className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-rose-500/50 via-brand/40 to-emerald-500/50"
          />
          <div className="space-y-6 relative">
            {PHASES.map((phase) => {
              const p = progress.find((pp) => pp.phase.id === phase.id);
              const pinnedEntry = pinnedPhaseEntries.get(phase.id);
              return (
                <PhaseCard
                  key={phase.id}
                  phase={phase}
                  progress={p}
                  statusOf={statusOf}
                  titleOf={titleOf}
                  pinnedSubjectCode={pinnedEntry?.subjectCode}
                  pinnedSubjectSlug={pinnedEntry?.subjectSlug}
                />
              );
            })}
          </div>
        </div>

        {/* === DAG === */}
        <section className="mt-12 mb-10">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Avhengighet-graf</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Hele læreplanen som en DAG (directed acyclic graph). Piler peker fra
            «det du må kunne» til «det som bygger på det». Fundamentene
            (Matematikk og Hardware) ligger nederst; spesialiseringer på toppen.
          </p>
          <div className="rounded-xl border border-border bg-card p-4 overflow-x-auto">
            <Mermaid
              chart={mermaidGraph}
              ariaLabel="Avhengighet-graf over de 17 fasene i læreplanen, fra fundamenter nederst til spesialiseringer på topp"
            />
          </div>
        </section>

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
  pinnedSubjectCode,
  pinnedSubjectSlug,
}: {
  phase: CurriculumPhase;
  progress: PhaseProgress | undefined;
  statusOf: (slug: string) => "ready" | "stub" | null;
  titleOf: (slug: string) => string;
  pinnedSubjectCode?: string;
  pinnedSubjectSlug?: string;
}) {
  const slugs = phase.slugs;
  const readyCount = slugs.filter((s) => statusOf(s) === "ready").length;
  const total = slugs.length;
  const percent = progress?.percent ?? 0;
  const hasProgress =
    progress && (progress.pagesStarted > 0 || progress.exercisesSolved > 0);

  const dependsOn = phasesDependedOnBy(phase.id);
  const unlocks = phasesUnlockedBy(phase.id);
  const layer = phase.layer ? LAYER_META[phase.layer] : null;
  const isPinned = !!pinnedSubjectSlug;
  const pinnedExamMeta = pinnedSubjectSlug ? EXAM_META[pinnedSubjectSlug] : undefined;
  const pinnedUrgency = examUrgency(pinnedExamMeta?.eksamen);

  return (
    <section
      id={phase.id}
      className={`relative rounded-xl border bg-card p-5 ml-8 scroll-mt-20 ${
        isPinned ? "border-2 border-brand shadow-md shadow-brand/10" : "border-border"
      }`}
    >
      {/* Node-prikk på den vertikale tråden */}
      <div
        aria-hidden="true"
        className={`absolute -left-[34px] top-6 h-4 w-4 rounded-full border-2 border-background ${
          isPinned ? "bg-brand ring-2 ring-brand/30" : percent > 0 ? "bg-success" : "bg-brand"
        } shadow-md`}
      />

      <div className="flex items-baseline justify-between gap-3 mb-2 flex-wrap">
        <h2 className="text-xl font-semibold flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand/10 text-brand text-sm font-mono">
            {phase.num}
          </span>
          {phase.title}
          {isPinned && (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-brand text-brand-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              title={`Pinnet via ${pinnedSubjectCode}`}
            >
              <Pin className="h-2.5 w-2.5" />
              Pinnet · {pinnedSubjectCode}
            </span>
          )}
        </h2>
        <div className="flex items-center gap-3 text-xs text-muted-foreground tabular-nums">
          {isPinned && pinnedUrgency.days != null && pinnedUrgency.days >= 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-brand/40 bg-brand/10 text-brand px-2 py-0.5 text-[10px] font-semibold">
              <CalendarClock className="h-3 w-3" />
              {formatDaysUntil(pinnedUrgency.days)}
            </span>
          )}
          {layer && (
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${layer.pill}`}
            >
              {layer.label}
            </span>
          )}
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

      {(dependsOn.length > 0 || unlocks.length > 0) && (
        <div className="mb-3 grid sm:grid-cols-2 gap-2">
          {dependsOn.length > 0 && (
            <div className="rounded-md border border-dashed border-border bg-muted/30 p-2.5">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                Bygger på
              </div>
              <div className="flex flex-wrap gap-1">
                {dependsOn.map((d) => (
                  <a
                    key={d.id}
                    href={`#${d.id}`}
                    className="inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[11px] hover:border-brand/60 hover:bg-brand/5"
                  >
                    <span className="font-mono opacity-70">{d.num}</span>
                    {d.title.split("—")[0].trim()}
                  </a>
                ))}
              </div>
            </div>
          )}
          {unlocks.length > 0 && (
            <div className="rounded-md border border-dashed border-brand/30 bg-brand/5 p-2.5">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-brand mb-1">
                Åpner opp
              </div>
              <div className="flex flex-wrap gap-1">
                {unlocks.map((u) => (
                  <a
                    key={u.id}
                    href={`#${u.id}`}
                    className="inline-flex items-center gap-1 rounded border border-brand/30 bg-background px-1.5 py-0.5 text-[11px] text-foreground hover:border-brand hover:bg-brand/10"
                  >
                    <span className="font-mono opacity-70">{u.num}</span>
                    {u.title.split("—")[0].trim()}
                  </a>
                ))}
              </div>
            </div>
          )}
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

// Mermaid-DAG som viser hele læreplanen. graph BT = bottom-to-top.
function buildMermaidDag(): string {
  const lines: string[] = ["graph BT"];
  for (const p of PHASES) {
    const shortName = p.title.split("—")[0].trim().replace(/"/g, "");
    lines.push(`  ${nodeId(p.id)}["${p.num}. ${shortName}"]`);
  }
  for (const p of PHASES) {
    for (const dep of p.dependsOn ?? []) {
      lines.push(`  ${nodeId(dep)} --> ${nodeId(p.id)}`);
    }
  }
  const layerClass: Record<LayerKey, string> = {
    matematikk: "matte",
    hardware: "hw",
    system: "sys",
    data: "data",
    ai: "ai",
    produkt: "prod",
    spesialisering: "spes",
  };
  lines.push(
    "  classDef matte fill:#fda4af20,stroke:#f43f5e80,color:#9f1239;",
    "  classDef hw fill:#fcd34d20,stroke:#d97706a0,color:#92400e;",
    "  classDef sys fill:#93c5fd20,stroke:#2563eba0,color:#1e40af;",
    "  classDef data fill:#67e8f920,stroke:#06b6d4a0,color:#155e75;",
    "  classDef ai fill:#c4b5fd20,stroke:#7c3aedb0,color:#5b21b6;",
    "  classDef prod fill:#86efac20,stroke:#16a34aa0,color:#14532d;",
    "  classDef spes fill:#fdba7420,stroke:#ea580ca0,color:#7c2d12;",
  );
  for (const p of PHASES) {
    const cls = layerClass[(p.layer ?? "produkt") as LayerKey];
    lines.push(`  class ${nodeId(p.id)} ${cls};`);
  }
  return lines.join("\n");
}

// Mermaid tillater ikke bindestreker eller punkt i node-IDer. Erstatt.
function nodeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9]/g, "_");
}
