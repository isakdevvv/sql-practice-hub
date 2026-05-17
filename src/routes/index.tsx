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
  TerminalSquare,
  Code2,
  Cpu,
  BookOpen,
  Boxes,
  KeyboardMusic,
  Apple,
  Compass,
  FolderTree,
  Pin,
  PinOff,
  Clock,
  Lightbulb,
  Brain,
} from "lucide-react";
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

type Verktoy = {
  href:
    | "/practice"
    | "/python"
    | "/drag"
    | "/cards"
    | "/prosjekt"
    | "/eksamen"
    | "/git-drill"
    | "/venv-drill"
    | "/mac-drill"
    | "/spor"
    | "/mini-kurs"
    | "/drill"
    | "/stack/$slug";
  navn: string;
  blurb: string;
  Icon: typeof Database;
  slug?: string;
};

const VERKTOY: Verktoy[] = [
  {
    href: "/spor",
    navn: "Læringsspor",
    blurb: "5 curerte stier — Flask, backend, React, FastAPI, data-ingeniør. Velg framework, få rekkefølge.",
    Icon: Compass,
  },
  {
    href: "/mini-kurs",
    navn: "Mini-kurs (sandkasse)",
    blurb: "Bygg ekte prosjekter trinn for trinn. Filer, mapper, editor, kjør-knapp i nettleseren.",
    Icon: FolderTree,
  },
  {
    href: "/drill",
    navn: "Drill-hub",
    blurb: "16 interaktive drills på tvers av fag — søk, filter på fag, og lokal progress-tracking.",
    Icon: Dumbbell,
  },
  {
    href: "/practice",
    navn: "SQL Practice",
    blurb: "300+ SQL-oppgaver med ekte SQLite i nettleseren.",
    Icon: Database,
  },
  {
    href: "/python",
    navn: "Python-øvelser",
    blurb: "70+ Flask/MySQL/auth-oppgaver i Pyodide.",
    Icon: Code2,
  },
  {
    href: "/drag",
    navn: "Drag-oppgaver",
    blurb: "500+ fyll-inn, match og rekkefølge-oppgaver.",
    Icon: KeyboardMusic,
  },
  {
    href: "/cards",
    navn: "Flashcards",
    blurb: "200+ kort for drillbar repetisjon.",
    Icon: BookOpen,
  },
  {
    href: "/prosjekt",
    navn: "Flask-prosjekt",
    blurb: "Bygg en hel nettbutikk i 11 trinn.",
    Icon: Boxes,
  },
  {
    href: "/eksamen",
    navn: "Eksamen",
    blurb: "Hub: tidsbasert trening, prosjekt, og eksamens-trinn fra alle fag.",
    Icon: GraduationCap,
  },
  {
    href: "/git-drill",
    navn: "Git-drill",
    blurb: "Øv git-kommandoer i en simulert terminal.",
    Icon: TerminalSquare,
  },
  {
    href: "/venv-drill",
    navn: "Venv-drill",
    blurb: "Øv Python venv og pip i en simulert terminal.",
    Icon: TerminalSquare,
  },
  {
    href: "/mac-drill",
    navn: "Mac-automatisering",
    blurb: "AppleScript, Shortcuts, Automator og terminal-automatisering — tutorials + øvelser.",
    Icon: Apple,
  },
  {
    href: "/stack/$slug",
    slug: "laereplan",
    navn: "Læreplan",
    blurb: "Total oversikt over alt læringsstoff.",
    Icon: Cpu,
  },
];

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

  function scrollToCatalog() {
    document
      .getElementById("alle-fag")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

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

        {/* Start her — 3-veis velger for nye brukere */}
        <section className="container mx-auto px-4 pt-10 max-w-5xl">
          <div className="mb-5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
              Start her
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              Hva vil du gjøre i dag?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tre vanlige veier inn — velg den som passer deg nå.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <StartCard
              to="/mine-fag"
              icon={<Compass className="h-5 w-5" />}
              eyebrow="Jeg har et fag"
              title="Jeg skal bestå et fag"
              body="Pin fagene du tar i «Mine fag» og bruk modul-oversikten + eksamens-trinn for hvert kurs."
            />
            <StartCard
              to="/spor"
              icon={<FolderTree className="h-5 w-5" />}
              eyebrow="Jeg vil bygge"
              title="Bygge noe konkret"
              body="Curerte læringsspor: Flask, backend, React, FastAPI, data-ingeniør. Velg framework, få rekkefølge."
            />
            <StartCard
              to="/practice"
              icon={<Dumbbell className="h-5 w-5" />}
              eyebrow="Jeg vil øve"
              title="Bare øve på SQL"
              body="300+ SQL-oppgaver med ekte SQLite i nettleseren — hopp rett inn, ingen oppsett."
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
                  Du har ingen fag pinnet ennå. Bla nedover, finn fagene du tar nå, og trykk
                  på pin-ikonet — så ligger de her neste gang.
                </p>
                <Button onClick={scrollToCatalog} size="sm">
                  Se alle fag <ArrowRight className="h-3.5 w-3.5 ml-1" />
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

        {/* Sektor-grid */}
        <section id="alle-fag" className="container mx-auto px-4 py-14 max-w-6xl scroll-mt-16">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Alle fag</h2>
            <p className="mt-2 text-muted-foreground">
              Hver kursside har modul-oversikt, mini-kurs og direkte tilgang til
              øvingsmateriale. Trykk på pin-ikonet for å lagre faget i «Mine fag».
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
                    const Icon = s.Icon;
                    const pinned = pinnedSlugs.includes(s.slug);
                    return (
                      <div
                        key={s.slug}
                        className="group relative rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors overflow-hidden"
                      >
                        <div
                          className={`absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${sektor.accent}`}
                        />
                        <PinButton slug={s.slug} pinned={pinned} />
                        <Link
                          to="/stack/$slug"
                          params={{ slug: s.slug }}
                          className="block"
                        >
                          <div className="flex items-center gap-2 mb-2 pr-8">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                              <Icon className="h-4 w-4 text-brand" />
                            </div>
                            <span className="text-[10px] font-semibold text-brand uppercase tracking-wider">
                              {s.code}
                            </span>
                          </div>
                          <h4 className="font-semibold text-foreground leading-tight mb-2">
                            {s.navn}
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {s.blurb}
                          </p>
                          <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                            Åpne kursside
                            <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Verktøy-grid */}
        <section className="border-t border-border bg-card/30">
          <div className="container mx-auto px-4 py-14 max-w-6xl">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold tracking-tight">Hopp rett inn i øvelse</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Verktøy som virker uavhengig av faget du jobber med.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
              {VERKTOY.map((v) => {
                const Icon = v.Icon;
                const inner = (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-brand" />
                      <h3 className="font-semibold text-foreground leading-tight text-sm">
                        {v.navn}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {v.blurb}
                    </p>
                  </>
                );
                if (v.href === "/stack/$slug" && v.slug) {
                  return (
                    <Link
                      key={v.navn}
                      to="/stack/$slug"
                      params={{ slug: v.slug }}
                      className="group rounded-xl border border-border bg-background hover:border-brand/40 p-4 transition-colors block"
                    >
                      {inner}
                    </Link>
                  );
                }
                return (
                  <Link
                    key={v.navn}
                    to={v.href as "/practice" | "/python" | "/drag" | "/cards" | "/prosjekt" | "/eksamen" | "/git-drill" | "/venv-drill" | "/mac-drill" | "/spor" | "/mini-kurs" | "/drill"}
                    className="group rounded-xl border border-border bg-background hover:border-brand/40 p-4 transition-colors block"
                  >
                    {inner}
                  </Link>
                );
              })}
            </div>

            {/* Vanlige eksamenstemaer */}
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
