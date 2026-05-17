import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROBLEMS } from "@/lib/problems/data";
import { useAppMode, setAppMode, type AppMode } from "@/lib/appMode";
import {
  usePinnedSubjects,
  useLastVisitedSubject,
  toggleSubject,
} from "@/lib/userSubjects";
import {
  SEKTORER,
  EXAM_META,
  SUBJECT_BY_SLUG,
} from "@/lib/subjects/catalog";
import {
  Search,
  GraduationCap,
  Dumbbell,
  ArrowRight,
  Sparkles,
  Database,
  Compass,
  Pin,
  PinOff,
  Clock,
  Lightbulb,
  Brain,
  CalendarClock,
  Flame,
  Wrench,
  Map as MapIcon,
} from "lucide-react";
import {
  examUrgency,
  formatDaysUntil,
} from "@/lib/subjects/examDate";
import {
  getTopRecommendation,
  type Recommendation,
} from "@/lib/skill-tree/recommender";
import { hasCompletedDiagnose } from "@/lib/skill-tree/engine";
import { MineSporPanel } from "@/components/skill-tree/MineSporPanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Læringsplattform — UiT-fag og øvingsverktøy" },
      {
        name: "description",
        content:
          "Plattform for ti UiT-fag: SQL/web, AI/ML, OS, datakomm, mobil, systemutvikling. SQL-oppgaver med ekte SQLite i nettleseren, Flask-øvelser i Pyodide, og 100+ stack-leksjoner.",
      },
      {
        property: "og:title",
        content: "Læringsplattform — UiT-fag og øvingsverktøy",
      },
      {
        property: "og:description",
        content:
          "Ni UiT-fag i én plattform — SQL, Flask, ML, OS, mobil og mer. Øvinger som kjører lokalt i nettleseren.",
      },
    ],
  }),
  component: LandingPage,
});

// VERKTOY-listen er fjernet — "Hopp rett inn i øvelse"-griden er flyttet
// til /lar (Verktøy-siden) etter meny-forenkling. Her viser vi bare
// en lenke til den siden.

// Stil-klasser for eksamen-pillen. Matcher det /mine-fag bruker så
// urgens-fargene er like på begge sider.
function examPillClasses(
  u: "past" | "urgent" | "soon" | "later" | "no-date",
): string {
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

function LandingPage() {
  const navigate = useNavigate();
  const appMode = useAppMode();
  const pinnedSlugs = usePinnedSubjects();
  const lastVisited = useLastVisitedSubject();
  const [query, setQuery] = useState("");
  // Ferdighets-tre-anbefaling — kun klient-side fordi engine leser localStorage.
  // Når diagnose er tatt: vis topp-anbefaling. Ellers: CTA til /diagnose.
  const [topRec, setTopRec] = useState<Recommendation | null>(null);
  const [diagnosed, setDiagnosed] = useState(false);
  useEffect(() => {
    setDiagnosed(hasCompletedDiagnose());
    setTopRec(getTopRecommendation());
  }, []);

  const pinnedSubjects = useMemo(
    () => pinnedSlugs.map((slug) => SUBJECT_BY_SLUG[slug]).filter(Boolean),
    [pinnedSlugs],
  );

  const lastVisitedSubject = useMemo(
    () => (lastVisited ? SUBJECT_BY_SLUG[lastVisited.slug] ?? null : null),
    [lastVisited],
  );

  // Nærmeste fremtidige eksamen — prioriter pinnede fag, ellers alle.
  // Brukes til top-banneret rett under hero. Speiler logikken på /mine-fag.
  const nextExam = useMemo(() => {
    const pool = pinnedSubjects.length > 0 ? pinnedSubjects : null;
    const candidates = (pool ?? Object.values(SUBJECT_BY_SLUG))
      .map((s) => ({ subject: s, u: examUrgency(EXAM_META[s.slug]?.eksamen) }))
      .filter((x) => x.u.days != null && x.u.days >= 0)
      .sort((a, b) => (a.u.days ?? 0) - (b.u.days ?? 0));
    return candidates[0] ?? null;
  }, [pinnedSubjects]);

  const totals = useMemo(
    () => ({
      problems: PROBLEMS.length,
      topics: new Set(PROBLEMS.flatMap((p) => p.topics)).size,
      subjects: SEKTORER.reduce((n, s) => n + s.subjects.length, 0),
    }),
    [],
  );

  const topTopics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of PROBLEMS) {
      for (const t of p.topics) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
  }, []);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { probs: [], topics: [], subjects: [] };
    const probs = PROBLEMS.filter((p) =>
      `${p.title} ${p.problem} ${p.topics.join(" ")}`.toLowerCase().includes(q),
    ).slice(0, 5);
    const topics = topTopics
      .map(([t]) => t)
      .filter((t) => t.toLowerCase().includes(q))
      .slice(0, 4);
    const subjects = SEKTORER.flatMap((s) => s.subjects)
      .filter((s) => `${s.code} ${s.navn} ${s.blurb}`.toLowerCase().includes(q))
      .slice(0, 4);
    return { probs, topics, subjects };
  }, [query, topTopics]);

  function submitSearch() {
    const q = query.trim();
    navigate({ to: "/practice", search: q ? { q } : {} });
  }

  function chooseMode(mode: AppMode) {
    setAppMode(mode);
  }

  // scrollToCatalog er fjernet: "Alle fag"-sektor-griden er flyttet til /mine-fag.
  // Tomme pinned-fag-states peker direkte til /mine-fag i stedet.

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div
            className="absolute inset-0 -z-10 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(60% 60% at 50% 0%, color-mix(in oklab, var(--brand) 35%, transparent), transparent)",
            }}
          />
          <div className="container mx-auto px-4 py-14 md:py-16 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Kjører lokalt i nettleseren — ingen innlogging
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Læringsplattform for{" "}
              <span className="bg-gradient-to-r from-brand to-success bg-clip-text text-transparent">
                ti UiT-fag
              </span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Velg fagene dine — vi husker dem så du slipper å lete neste gang. SQL kjører i
              SQLite-WASM, Python i Pyodide, alt i nettleseren din. {totals.problems} SQL-
              oppgaver og {totals.topics} temaer på tvers av fagene.
            </p>

            {/* Søk */}
            <div className="mt-7 mx-auto max-w-xl text-left">
              <label
                htmlFor="home-search"
                className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold"
              >
                Søk etter fag, tema eller oppgave
              </label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="home-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitSearch();
                  }}
                  placeholder="f.eks. JOIN, Kotlin, CSRF, normalisering, DTE-2509…"
                  className="h-11 pl-9 pr-24 text-sm"
                />
                <Button
                  size="sm"
                  onClick={submitSearch}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8"
                >
                  Søk <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>

              {query.trim() && (
                <div className="mt-2 rounded-lg border border-border bg-card overflow-hidden text-sm">
                  {suggestions.subjects.length > 0 && (
                    <div className="border-b border-border px-3 py-2">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                        Fag
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestions.subjects.map((s) => (
                          <Link
                            key={s.slug}
                            to="/stack/$slug"
                            params={{ slug: s.slug }}
                            className="rounded-full border border-brand/40 bg-brand/10 px-2.5 py-0.5 text-xs hover:bg-brand/20"
                          >
                            {s.code} {s.navn}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {suggestions.topics.length > 0 && (
                    <div className="border-b border-border px-3 py-2">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                        Temaer
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestions.topics.map((t) => (
                          <Link
                            key={t}
                            to="/practice"
                            search={{ topic: t }}
                            className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs hover:border-brand/60"
                          >
                            {t}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {suggestions.probs.length > 0 ? (
                    <ul className="divide-y divide-border">
                      {suggestions.probs.map((p) => (
                        <li key={p.id}>
                          <Link
                            to="/practice"
                            search={{ id: p.id }}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-accent/40"
                          >
                            <span className="text-[10px] rounded border border-border bg-muted px-1.5 py-0.5 text-muted-foreground">
                              L{p.level}
                            </span>
                            <span className="flex-1 truncate">{p.title}</span>
                            <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                              {p.topics.slice(0, 2).join(", ")}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    suggestions.topics.length === 0 &&
                    suggestions.subjects.length === 0 && (
                      <div className="px-3 py-3 text-xs text-muted-foreground">
                        Ingen treff. Prøv et annet søkeord.
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Modus-velger (kompakt) */}
            <div className="mt-6 mx-auto max-w-xl">
              <div className="grid grid-cols-2 gap-3">
                <ModeCard
                  active={appMode === "ovning"}
                  onClick={() => chooseMode("ovning")}
                  icon={<Dumbbell className="h-4 w-4" />}
                  title="Øving"
                  body="Løs selv med hint, fasit og diff."
                  accent="brand"
                />
                <ModeCard
                  active={appMode === "eksamen"}
                  onClick={() => chooseMode("eksamen")}
                  icon={<GraduationCap className="h-4 w-4" />}
                  title="Eksamen"
                  body="Fasit pre-fylles i editoren."
                  accent="warning"
                />
              </div>
              {appMode === "eksamen" && (
                <p className="mt-3 text-xs text-warning flex items-center justify-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Eksamen-modus: åpne en oppgave — fasiten ligger klar i editoren.
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="mt-9 grid grid-cols-3 gap-3 max-w-md mx-auto text-left">
              <Stat label="Fag" value={String(totals.subjects)} />
              <Stat label="SQL-oppgaver" value={String(totals.problems)} />
              <Stat label="Temaer" value={String(totals.topics)} />
            </div>
          </div>
        </section>

        {/* Eksamen-banner — viser nærmeste fremtidige eksamen blant pinnede fag.
            Speiler banneret på /mine-fag så urgensen synes fra hjemmesiden også. */}
        {nextExam && nextExam.u.days != null && (
          <section className="container mx-auto px-4 pt-8 max-w-5xl">
            <Link
              to="/stack/$slug"
              params={{ slug: nextExam.subject.slug }}
              className={`group flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 transition-colors hover:border-foreground/40 ${examPillClasses(nextExam.u.urgency)}`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background/60">
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

        {/* Start her — 3 hovedveier som speiler topp-menyen */}
        <section className="container mx-auto px-4 pt-10 max-w-5xl">
          <div className="mb-5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
              Hvor vil du?
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              Tre veier inn
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Mine fag for dine emner. Verktøy for sandbox, drills og oppslag.
              Læreplan for hele stien fra transistor til Flask.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <StartCard
              to="/mine-fag"
              icon={<Compass className="h-5 w-5" />}
              eyebrow="Mine fag"
              title="Fagene jeg tar"
              body="Pin fagene du har eksamen i, fortsett der du slapp, og se nedtelling til neste eksamen."
            />
            <StartCard
              to="/lar"
              icon={<Wrench className="h-5 w-5" />}
              eyebrow="Verktøy"
              title="Sandbox, drills & oppslag"
              body="SQL-sandbox, predict-trener, JOIN-trening, drag-oppgaver, flashcards, AI-tutor og skill-tre — alt utenom fagene."
            />
            <StartCard
              to="/spor"
              icon={<MapIcon className="h-5 w-5" />}
              eyebrow="Læreplan"
              title="Hele stien"
              body="Curerte spor (Flask, backend, React, FastAPI, data) og lineær curriculum fra transistor til deploy."
            />
          </div>
        </section>

        {/* Ferdighets-tre — anbefaling eller diagnose-CTA.
            Lagt til som NY seksjon etter "Start her" for å unngå konflikt
            med andre agenter som jobber i denne filen. */}
        <section className="container mx-auto px-4 pt-8 max-w-5xl">
          {diagnosed && topRec ? (
            <div className="rounded-xl border border-brand/40 bg-gradient-to-br from-brand/10 via-card to-card p-5 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-brand mb-1">
                  Hva bør jeg lære i dag?
                </div>
                <div className="font-semibold text-sm mb-1">{topRec.title}</div>
                <p className="text-xs text-muted-foreground mb-3">{topRec.reason}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={topRec.cta.to}
                    className="inline-flex items-center justify-center rounded-md bg-brand text-brand-foreground text-xs font-medium px-3 py-1.5 hover:bg-brand/90 transition-colors"
                  >
                    {topRec.cta.label}
                    <ArrowRight className="h-3 w-3 ml-1.5" />
                  </a>
                  <Link
                    to="/skill-tre"
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Se flere anbefalinger →
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <Link
              to="/diagnose"
              className="block rounded-xl border-2 border-dashed border-brand/40 bg-brand/5 hover:bg-brand/10 hover:border-brand/60 p-5 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand">
                  <Brain className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-brand mb-1">
                    Ny her? Start med diagnose
                  </div>
                  <div className="font-semibold text-sm mb-1">
                    Ta 20-min ferdighets-diagnose
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Vi kartlegger hva du allerede kan, så du får anbefalinger på
                    riktig nivå med en gang — istedenfor å gjette deg gjennom.
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-brand shrink-0 mt-1" />
              </div>
            </Link>
          )}
        </section>

        {/* Mine spor — progress per fag-område, basert på skill-tre-estimater */}
        <section className="container mx-auto px-4 pt-8 max-w-5xl">
          <MineSporPanel />
        </section>

        {/* Mine fag — bygges av brukerens egne valg */}
        <section className="container mx-auto px-4 pt-14 max-w-6xl">
          <div className="rounded-2xl border-2 border-brand/40 bg-gradient-to-br from-brand/10 via-card to-success/5 p-6 sm:p-8 shadow-lg shadow-brand/5">
            <div className="flex items-baseline gap-3 flex-wrap mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                Mine fag
              </span>
              <span className="text-xs text-muted-foreground">
                {pinnedSubjects.length > 0
                  ? `· ${pinnedSubjects.length} valgt · lagres lokalt i nettleseren`
                  : "· trykk pin på et fag for å lagre det her"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Dine kurs
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              Pinn fagene du tar — så ligger de her klare hver gang du åpner forsiden.
              Hvert kort lenker rett til kurs-huben med modul-oversikt og øvelser.
            </p>

            {lastVisitedSubject && (
              <Link
                to="/stack/$slug"
                params={{ slug: lastVisitedSubject.slug }}
                className="mb-5 flex items-center gap-3 rounded-lg border border-success/40 bg-success/5 px-4 py-3 hover:border-success transition-colors"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success/15">
                  <Clock className="h-4 w-4 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-success">
                    Fortsett der du slapp
                  </div>
                  <div className="text-sm font-semibold truncate">
                    {lastVisitedSubject.code} — {lastVisitedSubject.navn}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-success" />
              </Link>
            )}

            {pinnedSubjects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-background/60 p-8 text-center">
                <Pin className="mx-auto h-8 w-8 text-muted-foreground/60 mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  Du har ingen fag pinnet ennå. Gå til Mine fag, finn fagene du tar nå, og trykk
                  på pin-ikonet — så ligger de her neste gang.
                </p>
                <Button asChild size="sm">
                  <Link to="/mine-fag">
                    Se alle fag <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pinnedSubjects.map((s) => {
                  const Icon = s.Icon;
                  const meta = EXAM_META[s.slug];
                  return (
                    <div
                      key={s.slug}
                      className="group relative rounded-xl border border-border bg-background/80 hover:border-brand backdrop-blur p-4 transition-all"
                    >
                      <PinButton slug={s.slug} pinned={true} />
                      <Link
                        to="/stack/$slug"
                        params={{ slug: s.slug }}
                        className="block"
                      >
                        <div className="flex items-center gap-2 mb-2 pr-8">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/15">
                            <Icon className="h-4 w-4 text-brand" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                                {s.code}
                              </span>
                              {meta && (
                                <span className="text-[10px] text-muted-foreground">
                                  {meta.stp} stp
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <h4 className="font-semibold text-foreground leading-tight mb-1.5 text-sm">
                          {s.navn}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-3">
                          {s.blurb}
                        </p>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground truncate">
                            {meta ? `📅 ${meta.eksamen}` : "Åpne kursside"}
                          </span>
                          <span className="text-brand group-hover:translate-x-0.5 transition-transform">
                            Åpne →
                          </span>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Bunn-CTA — link til /mine-fag og /lar siden duplikatene er fjernet */}
        <section className="container mx-auto px-4 py-14 max-w-5xl">
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              to="/mine-fag"
              className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors flex items-center gap-3"
            >
              <Compass className="h-5 w-5 text-brand shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground">
                  Se alle fag og pin det du tar
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  10 UiT-emner gruppert i sektorer
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
            <Link
              to="/lar"
              className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors flex items-center gap-3"
            >
              <Wrench className="h-5 w-5 text-brand shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground">
                  19 verktøy i én oversikt
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Sandbox, drills, oppslag, AI-tutor
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          </div>

          {/* Vanlige SQL-temaer — beholdt fra forrige versjon, fortsatt nyttig */}
          <div className="mt-10">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 text-center">
              Vanligste SQL-temaer
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {topTopics.map(([t, n]) => (
                <Link
                  key={t}
                  to="/practice"
                  search={{ topic: t }}
                  className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-foreground/90 hover:border-brand/60 hover:bg-brand/10"
                  title={`${n} oppgaver`}
                >
                  {t} <span className="text-muted-foreground">({n})</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-6 text-xs text-muted-foreground text-center">
          Læringsplattform · Bygget av studenter for studenter · Progress lagres lokalt i
          nettleseren.
        </div>
      </footer>
    </div>
  );
}

function PinButton({ slug, pinned }: { slug: string; pinned: boolean }) {
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

function ModeCard({
  active,
  onClick,
  icon,
  title,
  body,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  body: string;
  accent: "brand" | "warning";
}) {
  const activeRing =
    accent === "warning"
      ? "border-warning ring-2 ring-warning/40 bg-warning/10"
      : "border-brand ring-2 ring-brand/40 bg-brand/10";
  const idleHover =
    accent === "warning" ? "hover:border-warning/60" : "hover:border-brand/60";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group rounded-lg border p-3 text-left transition-all ${
        active ? activeRing : `border-border bg-card ${idleHover}`
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-md ${
            accent === "warning"
              ? "bg-warning/20 text-warning"
              : "bg-brand/20 text-brand"
          }`}
        >
          {icon}
        </span>
        <span className="font-semibold text-sm">{title}</span>
        {active && (
          <span
            className={`ml-auto text-[10px] font-bold uppercase tracking-wider ${
              accent === "warning" ? "text-warning" : "text-brand"
            }`}
          >
            Aktiv
          </span>
        )}
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{body}</p>
    </button>
  );
}

function StartCard({
  to,
  onClick,
  icon,
  eyebrow,
  title,
  body,
}: {
  to: "/lar" | "/spor" | "/practice" | "/mine-fag";
  onClick?: () => void;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="group relative rounded-2xl border-2 border-border bg-card hover:border-brand p-5 transition-all hover:shadow-lg hover:shadow-brand/10 block"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand">
          {icon}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-brand">
          {eyebrow}
        </div>
      </div>
      <h3 className="font-bold text-foreground leading-tight mb-1.5 text-base">
        {title}
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{body}</p>
      <div className="flex items-center text-xs text-brand font-semibold">
        Gå hit
        <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-xl font-bold text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
        {label}
      </div>
    </div>
  );
}
