import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { usePinnedSubjects, useLastVisitedSubject, toggleSubject } from "@/lib/userSubjects";
import { SEKTORER, EXAM_META, SUBJECT_BY_SLUG, type Subject } from "@/lib/subjects/catalog";
import {
  ArrowRight,
  Clock,
  Pin,
  PinOff,
  GraduationCap,
  Compass,
  CalendarClock,
  Flame,
} from "lucide-react";
import { examUrgency, formatDaysUntil, type ExamUrgency } from "@/lib/subjects/examDate";

export const Route = createFileRoute("/mine-fag")({
  head: () => ({
    meta: [
      { title: "Mine fag — pin fagene du tar og fortsett der du slapp" },
      {
        name: "description",
        content:
          "Pin fagene du tar nå, fortsett der du slapp sist, og se alle ti UiT-fag samlet på én side. Fremgang lagres lokalt.",
      },
    ],
  }),
  component: MineFagPage,
});

// Samme localStorage-nøkkel som CourseOutline.tsx skriver til. Vi leser
// kun her — ingen skriv — så vi kan trygt duplisere konstanten uten å
// koble oss inn på Agent C sitt eierskap av progress-libben.
const VISITED_PREFIX = "sql-practice-course-visited-v1:";

// Lavere tall = høyere prioritet i pinned-listen.
//   urgent (< 30 dager) → 0
//   soon   (< 90)       → 1
//   later  (≥ 90)       → 2
//   no-date (hjemmeeks.) → 3
//   past               → 4
function urgencyRank(u: ExamUrgency, days: number | null): number {
  if (u === "urgent") return 0;
  if (u === "soon") return 1;
  if (u === "later") return 2;
  if (u === "no-date") return 3;
  // past: sortér eldste sist
  return 4;
}

// Tailwind-klasser for countdown-pillen, basert på urgens.
function urgencyClasses(u: ExamUrgency): {
  pill: string;
  iconColor: string;
} {
  switch (u) {
    case "urgent":
      return {
        pill: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/40",
        iconColor: "text-rose-600 dark:text-rose-400",
      };
    case "soon":
      return {
        pill: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/40",
        iconColor: "text-amber-600 dark:text-amber-400",
      };
    case "later":
      return {
        pill: "bg-brand/10 text-brand border-brand/30",
        iconColor: "text-brand",
      };
    case "no-date":
      return {
        pill: "bg-muted text-muted-foreground border-border",
        iconColor: "text-muted-foreground",
      };
    case "past":
      return {
        pill: "bg-muted text-muted-foreground border-border line-through",
        iconColor: "text-muted-foreground",
      };
  }
}

/** Antall unike seksjoner brukeren har scrollet til på fagets hub-side
 *  (eller hovedside i stack-routet). Det er det vi har av "fremgang" som
 *  fungerer uniformt på tvers av alle fag i dag — uten å bygge et nytt
 *  progress-system. */
function loadVisitedCount(slug: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(VISITED_PREFIX + slug);
    if (!raw) return 0;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

/** Hook som sub'er til localStorage-endringer så fremgang-tallene oppdaterer
 *  seg når brukeren kommer tilbake til denne fanen etter å ha lest et fag. */
function useVisitedCounts(slugs: string[]): Record<string, number> {
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const slug of slugs) initial[slug] = loadVisitedCount(slug);
    return initial;
  });

  useEffect(() => {
    function refresh() {
      const next: Record<string, number> = {};
      for (const slug of slugs) next[slug] = loadVisitedCount(slug);
      setCounts(next);
    }
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
    // slugs-arrayet er stabilt mellom rendre (en flatt liste av alle fag),
    // så vi joiner for cheap equality.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugs.join("|")]);

  return counts;
}

function MineFagPage() {
  const pinnedSlugs = usePinnedSubjects();
  const lastVisited = useLastVisitedSubject();

  const allSlugs = useMemo(() => SEKTORER.flatMap((s) => s.subjects.map((sub) => sub.slug)), []);
  const visited = useVisitedCounts(allSlugs);

  // Pinned fag sortert etter nærmeste eksamen. Fag uten dato (hjemmeeks./mappe)
  // og fag med passert eksamen havner sist, men i samme rekkefølge som de ble
  // pinnet (stabil sort).
  const pinnedSubjects = useMemo(() => {
    const subjects = pinnedSlugs.map((slug) => SUBJECT_BY_SLUG[slug]).filter(Boolean);
    return subjects.slice().sort((a, b) => {
      const ua = examUrgency(EXAM_META[a.slug]?.eksamen);
      const ub = examUrgency(EXAM_META[b.slug]?.eksamen);
      const rankA = urgencyRank(ua.urgency, ua.days);
      const rankB = urgencyRank(ub.urgency, ub.days);
      if (rankA !== rankB) return rankA - rankB;
      // Innen samme tier: sortér på antall dager (færre først)
      if (ua.days != null && ub.days != null) return ua.days - ub.days;
      return 0;
    });
  }, [pinnedSlugs]);

  // Den nærmeste fremtidige eksamen blant pinnede fag (eller blant alle fag
  // hvis ingen pinnede har eksamen) — brukes til top-banneret.
  const nextExam = useMemo(() => {
    const pool = pinnedSubjects.length > 0 ? pinnedSubjects : null;
    const candidates = (pool ?? Object.values(SUBJECT_BY_SLUG))
      .map((s) => ({ subject: s, u: examUrgency(EXAM_META[s.slug]?.eksamen) }))
      .filter((x) => x.u.days != null && x.u.days >= 0)
      .sort((a, b) => (a.u.days ?? 0) - (b.u.days ?? 0));
    return candidates[0] ?? null;
  }, [pinnedSubjects]);

  const lastVisitedSubject = useMemo(
    () => (lastVisited ? (SUBJECT_BY_SLUG[lastVisited.slug] ?? null) : null),
    [lastVisited],
  );

  const totalSubjects = allSlugs.length;
  const startedSubjects = allSlugs.filter((s) => (visited[s] ?? 0) > 0).length;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="border-b border-border bg-gradient-to-br from-brand/5 via-background to-success/5">
          <div className="container mx-auto px-4 py-10 md:py-14 max-w-5xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-4">
              <GraduationCap className="h-3.5 w-3.5" />
              Mine fag
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Fagene dine — samlet på{" "}
              <span className="bg-gradient-to-r from-brand to-success bg-clip-text text-transparent">
                én side
              </span>
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Pin fagene du tar i semesteret, så ligger de øverst. Hvert kort lenker rett til
              kurs-hubben med modul-oversikt og eksamens-trinn. Alt lagres lokalt i nettleseren.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Pin className="h-3.5 w-3.5 text-brand" />
                <span className="font-semibold text-foreground">{pinnedSubjects.length}</span>{" "}
                pinnet
              </div>
              <div className="text-muted-foreground">
                <span className="font-semibold text-foreground">{startedSubjects}</span> av{" "}
                {totalSubjects} fag startet
              </div>
              <Link
                to="/lar"
                className="ml-auto inline-flex items-center gap-1 text-xs text-brand hover:underline"
              >
                <Compass className="h-3.5 w-3.5" />
                Se læringsmoduser
              </Link>
            </div>
          </div>
        </section>

        {/* Neste eksamen-banner */}
        {nextExam && nextExam.u.days != null && (
          <section className="container mx-auto px-4 pt-6 max-w-5xl">
            <Link
              to="/stack/$slug"
              params={{ slug: nextExam.subject.slug }}
              className={`group flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 transition-colors hover:border-foreground/40 ${urgencyClasses(nextExam.u.urgency).pill}`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background/60 ${urgencyClasses(nextExam.u.urgency).iconColor}`}
              >
                {nextExam.u.urgency === "urgent" ? (
                  <Flame className="h-4.5 w-4.5" />
                ) : (
                  <CalendarClock className="h-4.5 w-4.5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-0.5">
                  Neste eksamen
                </div>
                <div className="text-sm font-semibold truncate">
                  {nextExam.subject.code} — {nextExam.subject.navn}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-base font-bold tabular-nums leading-none">
                  {formatDaysUntil(nextExam.u.days)}
                </div>
                <div className="text-[10px] opacity-80 mt-1">
                  {EXAM_META[nextExam.subject.slug]?.eksamen}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 opacity-70 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </section>
        )}

        {/* Fortsett der du slapp */}
        {lastVisitedSubject && (
          <section className="container mx-auto px-4 pt-8 max-w-5xl">
            <Link
              to="/stack/$slug"
              params={{ slug: lastVisitedSubject.slug }}
              className="flex items-center gap-3 rounded-xl border-2 border-success/40 bg-success/5 hover:border-success hover:bg-success/10 px-4 py-4 transition-colors"
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
                {visited[lastVisitedSubject.slug] > 0 && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {visited[lastVisitedSubject.slug]} seksjoner sett
                  </div>
                )}
              </div>
              <ArrowRight className="h-5 w-5 text-success shrink-0" />
            </Link>
          </section>
        )}

        {/* Pinned subjects — store kort */}
        <section className="container mx-auto px-4 pt-10 max-w-5xl">
          <div className="mb-4 flex items-baseline justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Pinnede fag</h2>
              <p className="text-sm text-muted-foreground">
                {pinnedSubjects.length > 0
                  ? `${pinnedSubjects.length} ${pinnedSubjects.length === 1 ? "fag" : "fag"} pinnet — fjern med pin-knappen.`
                  : "Du har ikke pinnet noen fag enda. Bla nedover og pin fagene du tar."}
              </p>
            </div>
            {pinnedSubjects.length > 0 && (
              <a href="#alle-fag" className="text-xs text-brand hover:underline">
                Pin flere ↓
              </a>
            )}
          </div>

          {pinnedSubjects.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border bg-card/40 p-8 text-center">
              <Pin className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                Ingen fag pinnet enda. Finn fagene du tar i listen under og trykk pin-ikonet — så
                ligger de her store og lett tilgjengelige neste gang.
              </p>
              <Button asChild size="sm">
                <a href="#alle-fag">
                  Se alle fag <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </a>
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pinnedSubjects.map((s) => (
                <PinnedSubjectCard key={s.slug} subject={s} visitedCount={visited[s.slug] ?? 0} />
              ))}
            </div>
          )}
        </section>

        {/* Alle fag i sektorer */}
        <section id="alle-fag" className="container mx-auto px-4 py-14 max-w-6xl scroll-mt-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Alle fag</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Trykk pin-ikonet på fag du tar i semesteret — de ligger øverst neste gang.
            </p>
          </div>

          <div className="space-y-10">
            {SEKTORER.map((sektor) => (
              <div key={sektor.navn}>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{sektor.navn}</h3>
                  <p className="text-sm text-muted-foreground">{sektor.beskrivelse}</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sektor.subjects.map((s) => {
                    const pinned = pinnedSlugs.includes(s.slug);
                    return (
                      <SubjectCard
                        key={s.slug}
                        subject={s}
                        pinned={pinned}
                        accent={sektor.accent}
                        visitedCount={visited[s.slug] ?? 0}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-6 text-xs text-muted-foreground text-center">
          Læringsplattform · Pin-data og fremgang lagres lokalt i nettleseren.
        </div>
      </footer>
    </div>
  );
}

/** Stort kort for pinnede fag — øverst på siden. Viser eksamen + STP hvis
 *  faget har EXAM_META, og fremgang-tall. */
function PinnedSubjectCard({ subject, visitedCount }: { subject: Subject; visitedCount: number }) {
  const Icon = subject.Icon;
  const meta = EXAM_META[subject.slug];
  const started = visitedCount > 0;
  const u = examUrgency(meta?.eksamen);
  const urgencyStyle = urgencyClasses(u.urgency);
  return (
    <div
      id={`fag-${subject.slug}`}
      className="group relative rounded-xl border-2 border-brand/40 bg-gradient-to-br from-brand/5 via-card to-success/5 hover:border-brand p-5 transition-colors shadow-sm hover:shadow-md hover:shadow-brand/10 scroll-mt-24 target:border-brand target:ring-2 target:ring-brand/40"
    >
      <PinToggleButton slug={subject.slug} pinned={true} />
      <Link to="/stack/$slug" params={{ slug: subject.slug }} className="block">
        <div className="flex items-center gap-2 mb-3 pr-8">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/15">
            <Icon className="h-4.5 w-4.5 text-brand" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                {subject.code}
              </span>
              {meta && <span className="text-[10px] text-muted-foreground">{meta.stp} stp</span>}
            </div>
          </div>
          {/* Countdown-pille i hjørnet — bare hvis vi har en faktisk dato */}
          {u.days != null && u.days >= 0 && (
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tabular-nums shrink-0 ${urgencyStyle.pill}`}
              title={meta?.eksamen}
            >
              {u.urgency === "urgent" ? (
                <Flame className="h-3 w-3" />
              ) : (
                <CalendarClock className="h-3 w-3" />
              )}
              {formatDaysUntil(u.days)}
            </span>
          )}
        </div>
        <h4 className="font-semibold text-foreground leading-tight mb-1.5">{subject.navn}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-3">
          {subject.blurb}
        </p>
        <div className="flex items-center justify-between text-[11px] gap-2">
          <span className="text-muted-foreground truncate min-w-0">
            {meta ? `📅 ${meta.eksamen}` : started ? `${visitedCount} sett` : "Ikke startet"}
          </span>
          <span className="text-brand font-semibold whitespace-nowrap group-hover:translate-x-0.5 transition-transform">
            Åpne →
          </span>
        </div>
        {/* Status-bånd under eksamen-tekst hvis vi har data å vise */}
        {(started || meta) && (
          <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                started ? "bg-success" : "bg-muted-foreground/40"
              }`}
            />
            <span>{started ? `${visitedCount} seksjoner sett` : "Ikke startet"}</span>
          </div>
        )}
      </Link>
    </div>
  );
}

/** Vanlig kort for "Alle fag"-listen — kompakt, samme look som forsiden. */
function SubjectCard({
  subject,
  pinned,
  accent,
  visitedCount,
}: {
  subject: Subject;
  pinned: boolean;
  accent: string;
  visitedCount: number;
}) {
  const Icon = subject.Icon;
  const started = visitedCount > 0;
  return (
    <div
      id={`fag-${subject.slug}`}
      className="group relative rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors overflow-hidden scroll-mt-24 target:border-brand target:ring-2 target:ring-brand/40"
    >
      <div
        className={`absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${accent}`}
      />
      <PinToggleButton slug={subject.slug} pinned={pinned} />
      <Link to="/stack/$slug" params={{ slug: subject.slug }} className="block">
        <div className="flex items-center gap-2 mb-2 pr-8">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10">
            <Icon className="h-4 w-4 text-brand" />
          </div>
          <span className="text-[10px] font-semibold text-brand uppercase tracking-wider">
            {subject.code}
          </span>
          {started && (
            <span
              title={`${visitedCount} seksjoner sett`}
              className="ml-auto h-1.5 w-1.5 rounded-full bg-success"
            />
          )}
        </div>
        <h4 className="font-semibold text-foreground leading-tight mb-2">{subject.navn}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {subject.blurb}
        </p>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {started ? `${visitedCount} seksjoner sett` : "Ikke startet"}
          </span>
          <span className="flex items-center text-muted-foreground group-hover:text-foreground transition-colors">
            Åpne
            <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </Link>
    </div>
  );
}

function PinToggleButton({ slug, pinned }: { slug: string; pinned: boolean }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSubject(slug);
      }}
      aria-pressed={pinned}
      title={pinned ? "Fjern fra Mine fag" : "Lagre i Mine fag"}
      className={`absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-md border transition-colors ${
        pinned
          ? "border-brand bg-brand/15 text-brand hover:bg-brand/25"
          : "border-border bg-background/60 text-muted-foreground hover:border-brand/60 hover:text-brand"
      }`}
    >
      {pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
    </button>
  );
}
