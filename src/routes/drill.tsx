import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  Dumbbell,
  Sparkles,
  Brain,
  Database,
  Network,
  TerminalSquare,
  Code2,
  Cpu,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { DRILLS, type DrillEntry, type DrillSubject } from "@/lib/learn/drills";
import {
  getDrillProgress,
  statusFromProgress,
  type DrillProgressStatus,
} from "@/lib/learn/drillProgress";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// /drill — global hub som lister alle drill-stil øvinger på plattformen.
//
// Designvalg:
// - Datakilde: `DRILLS`-registeret i `src/lib/learn/drills.ts` — den siden
//   som autoritetskilde for hvilke drills som finnes. Hub-en kjenner ikke
//   til drillenes innhold; bare metadata (title/subject/route/description).
// - Progress-badge: leses fra localStorage via `getDrillProgress`. Vi
//   re-leser hver gang søk/filter endrer seg, men også på fokus (typisk
//   user-flow: åpne drill, fullfør, kom tilbake) — bruker `visibilitychange`
//   for å fange opp at brukeren har vendt tilbake til hub-fanen.
// - Filter: chip-row + søk. Multi-select på subjects (klikk toggler).
//   "Alle"-chip nullstiller subject-filteret.
// - Layout: grid 1/2/3 kolonner per breakpoint, gruppert under
//   subject-overskrift slik at filteret er visuelt sammenfallende med
//   det brukeren ser.
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/drill")({
  head: () => ({
    meta: [
      { title: "Drill-hub — Læringsplattform" },
      {
        name: "description",
        content:
          "Alle interaktive drill-øvinger på plattformen, samlet på ett sted. To moduser: «Lær først» viser fasit, «Test deg selv» krever svar uten hint. Søk, filter på fag, og lokal progress-tracking.",
      },
    ],
  }),
  component: DrillHubPage,
});

// Pen ikon per fag — hjelper visuell scanning av subject-grupper.
const SUBJECT_ICON: Record<DrillSubject, typeof Dumbbell> = {
  SQL: Database,
  Python: Code2,
  Algoritmer: Cpu,
  Databaser: Database,
  Nettverk: Network,
  OS: TerminalSquare,
  ML: Brain,
  Verktoy: BookOpen,
};

// Stabil rekkefølge på subject-grupper — vi vil ikke at filteret skal
// "hoppe rundt" når brukeren toggler en chip.
const SUBJECT_ORDER: DrillSubject[] = [
  "SQL",
  "Databaser",
  "Algoritmer",
  "Python",
  "ML",
  "Nettverk",
  "OS",
  "Verktoy",
];

function DrillHubPage() {
  const [query, setQuery] = useState("");
  const [activeSubjects, setActiveSubjects] = useState<Set<DrillSubject>>(new Set());

  // Progress-state per drill-id. Re-leses ved mount, ved visibility-change
  // (brukeren kommer tilbake til hub-fanen), og ved fokus-event.
  const [progressMap, setProgressMap] = useState<Record<string, DrillProgressStatus>>(() =>
    buildProgressMap(),
  );

  function refreshProgress() {
    setProgressMap(buildProgressMap());
  }

  useEffect(() => {
    // Initial re-read i tilfelle SSR hydratiserer med ingen progress
    // og localStorage nå er klar.
    refreshProgress();

    function onVisibility() {
      if (document.visibilityState === "visible") refreshProgress();
    }
    function onFocus() {
      refreshProgress();
    }
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // Unike subjects i registeret, sortert etter SUBJECT_ORDER, fallback til
  // alfabetisk for ukjente. Vi støtter dynamiske nye subjects uten å måtte
  // oppdatere SUBJECT_ORDER.
  const availableSubjects = useMemo<DrillSubject[]>(() => {
    const present = new Set<DrillSubject>(DRILLS.map((d) => d.subject));
    const ordered: DrillSubject[] = [];
    for (const s of SUBJECT_ORDER) {
      if (present.has(s)) ordered.push(s);
    }
    // Inkluder evt. subjects som mangler i SUBJECT_ORDER (defensiv mot
    // fremtidige utvidelser av DrillSubject-union).
    for (const s of present) {
      if (!ordered.includes(s)) ordered.push(s);
    }
    return ordered;
  }, []);

  // Filtrert + søkt liste av drills.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DRILLS.filter((d) => {
      if (activeSubjects.size > 0 && !activeSubjects.has(d.subject)) return false;
      if (!q) return true;
      const hay = `${d.title} ${d.description} ${d.subject}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, activeSubjects]);

  // Gruppér resultatene per subject for rendering.
  const grouped = useMemo(() => {
    const map = new Map<DrillSubject, DrillEntry[]>();
    for (const d of filtered) {
      const list = map.get(d.subject);
      if (list) list.push(d);
      else map.set(d.subject, [d]);
    }
    // Returnér i SUBJECT_ORDER-rekkefølge.
    return availableSubjects
      .filter((s) => map.has(s))
      .map((s) => ({ subject: s, drills: map.get(s)! }));
  }, [filtered, availableSubjects]);

  function toggleSubject(s: DrillSubject) {
    setActiveSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }
  function clearSubjects() {
    setActiveSubjects(new Set());
  }

  const totalCount = DRILLS.length;
  const visibleCount = filtered.length;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero */}
        <section className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs text-brand mb-3">
            <Dumbbell className="h-3.5 w-3.5" />
            Drill-hub
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {totalCount} interaktive drills
          </h1>
          <p className="mt-3 text-base text-muted-foreground max-w-2xl">
            Gjør stegene selv, ikke bare les. To moduser: <strong>«Lær først»</strong> (fasit
            synlig) og <strong>«Test deg selv»</strong> (svar uten hint). Framdrift lagres lokalt i
            nettleseren din.
          </p>
        </section>

        {/* Søk */}
        <section className="mb-4">
          <label htmlFor="drill-search" className="sr-only">
            Søk i drills
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              id="drill-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Søk på tittel, fag eller beskrivelse — f.eks. JOIN, ARP, normalisering…"
              className="h-11 w-full rounded-md border border-border bg-card pl-9 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/60"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Tøm søk"
                className="absolute right-20 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums text-muted-foreground"
              aria-live="polite"
            >
              {visibleCount} / {totalCount} viste
            </span>
          </div>
        </section>

        {/* Subject-chip-filter */}
        <section className="mb-8" aria-label="Filtrer på fag">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={clearSubjects}
              aria-pressed={activeSubjects.size === 0}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                activeSubjects.size === 0
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              Alle
            </button>
            {availableSubjects.map((s) => {
              const active = activeSubjects.has(s);
              const Icon = SUBJECT_ICON[s] ?? Dumbbell;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSubject(s)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    active
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {s}
                </button>
              );
            })}
          </div>
        </section>

        {/* Resultatgrupper */}
        {grouped.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <Search className="mx-auto h-8 w-8 text-muted-foreground/60 mb-3" />
            <p className="text-sm text-muted-foreground">
              Ingen drills matcher «{query}»{activeSubjects.size > 0 && " med valgte fag"}.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                clearSubjects();
              }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-brand bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/20"
            >
              <X className="h-3.5 w-3.5" /> Tøm filter
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {grouped.map(({ subject, drills }) => {
              const Icon = SUBJECT_ICON[subject] ?? Dumbbell;
              return (
                <section key={subject} aria-label={`${subject}-drills`}>
                  <div className="mb-3 flex items-center gap-2">
                    <Icon className="h-5 w-5 text-brand" />
                    <h2 className="text-xl font-semibold tracking-tight">{subject}</h2>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {drills.length}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {drills.map((d) => (
                      <DrillCard key={d.id} drill={d} status={progressMap[d.id] ?? "not-started"} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Hjelp-fotnote */}
        <section className="mt-12 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 mt-0.5 text-brand shrink-0" />
            <p>
              Tips: åpne drillet i «Lær først» for å se fasiten først, og bytt til «Test deg selv»
              når du vil drille uten hint. Progress lagres kun lokalt — det følger deg ikke til
              andre nettlesere eller enheter.
            </p>
          </div>
        </section>
      </main>
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-6 text-xs text-muted-foreground text-center">
          Læringsplattform · Progress lagres lokalt i nettleseren.
        </div>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Komponenter
// ---------------------------------------------------------------------------

function DrillCard({ drill, status }: { drill: DrillEntry; status: DrillProgressStatus }) {
  return (
    <article
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors",
        status === "completed"
          ? "border-success/40 hover:border-success/60"
          : status === "in-progress"
            ? "border-amber-500/40 hover:border-amber-500/60"
            : "border-border hover:border-brand/40",
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground leading-snug">{drill.title}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold text-brand">
              {drill.subject}
            </span>
            <ProgressBadge status={status} />
          </div>
        </div>
      </header>

      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
        {drill.description}
      </p>

      <div className="mt-auto flex items-center justify-between gap-2">
        {/* Plain anchor — drill.route inneholder ofte #drill-anker som
            ikke spiller med TanStack Link's typed `to`-prop. */}
        <a
          href={drill.route}
          className="inline-flex items-center gap-1.5 rounded-md border border-brand bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/20 transition-colors"
        >
          Åpne drill
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </a>
        <span
          className="text-[10px] tabular-nums text-muted-foreground"
          title={
            drill.uses_shell
              ? "Drillet bruker den delte DrillShell-komponenten"
              : "Drillet har en bespoke implementasjon"
          }
        >
          {drill.uses_shell ? "Delt shell" : "Bespoke"}
        </span>
      </div>
    </article>
  );
}

function ProgressBadge({ status }: { status: DrillProgressStatus }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
        <CheckCircle2 className="h-3 w-3" /> Fullført
      </span>
    );
  }
  if (status === "in-progress") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
        <Clock className="h-3 w-3" /> Påbegynt
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/30 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
      <Circle className="h-3 w-3" /> Ikke startet
    </span>
  );
}

// ---------------------------------------------------------------------------
// Hjelpere
// ---------------------------------------------------------------------------

function buildProgressMap(): Record<string, DrillProgressStatus> {
  const out: Record<string, DrillProgressStatus> = {};
  for (const d of DRILLS) {
    out[d.id] = statusFromProgress(getDrillProgress(d.id));
  }
  return out;
}
