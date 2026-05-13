import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROBLEMS } from "@/lib/problems/data";
import { useAppMode, setAppMode, type AppMode } from "@/lib/appMode";
import {
  Search,
  GraduationCap,
  Dumbbell,
  ArrowRight,
  Sparkles,
  Database,
  Network,
  Brain,
  TerminalSquare,
  Smartphone,
  Workflow,
  Code2,
  Cpu,
  Globe,
  Layers,
  BookOpen,
  Boxes,
  KeyboardMusic,
  Sigma,
  CalendarDays,
} from "lucide-react";

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

type Subject = {
  slug: string;
  code: string;
  navn: string;
  blurb: string;
  Icon: typeof Database;
};

type Sektor = {
  navn: string;
  beskrivelse: string;
  accent: string;
  subjects: Subject[];
};

const SEKTORER: Sektor[] = [
  {
    navn: "Mitt høstsemester 2026",
    beskrivelse:
      "De fem fagene du tar i høst — øverst og prioritert. Hvert fag har et læringsspor som bygger opp gradvis fra grunnleggende til eksamensnivå.",
    accent: "from-yellow-500/40 to-amber-500/30",
    subjects: [
      {
        slug: "tek-1501",
        code: "TEK-1501",
        navn: "Sannsynlighet og statistikk for ingeniører",
        blurb:
          "Statistikk-fundament: deskriptiv → sannsynlighet → fordelinger → CLT → estimering → hypotesetest → regresjon. Live PMF/PDF-visuals og scipy.stats i nettleseren. Eksamen 14.12.2026.",
        Icon: Sigma,
      },
      {
        slug: "dte-2505",
        code: "DTE-2505",
        navn: "Operativsystemer",
        blurb:
          "Linux fra bunn: filsystem → kommandoer → rettigheter → prosesser → bash-skripting. Interaktiv rwx-kalkulator, prosess-monitor og bash-pad med mock-FS. Eksamen 02.12.2026.",
        Icon: TerminalSquare,
      },
      {
        slug: "dte-2501",
        code: "DTE-2501",
        navn: "AI Methods and Applications",
        blurb:
          "Moderne ML-spor (pensum): k-NN, k-Means, GMM/EM, PCA, ensembler, GA/PSO/ACO, MDP/VI/PI, DP/TSP. Klassisk AI-spor (supplerende). Eksamen 19.10 + 07.12 + mappe 14.12.2026.",
        Icon: Brain,
      },
      {
        slug: "dte-2507",
        code: "DTE-2507",
        navn: "Datakommunikasjon og sikkerhet",
        blurb:
          "Top-down nettverk + sikkerhet: OSI/TCP-IP → HTTP/TCP/UDP → IP/subnet → krypto/PKI/TLS. Interaktiv subnett-kalkulator, TLS-handshake, hex-dump-dekoding, RSA-mini. To 2t-eksamener 30.11.2026.",
        Icon: Network,
      },
      {
        slug: "dte-2602",
        code: "DTE-2602",
        navn: "Introduksjon maskinlæring og AI",
        blurb:
          "ML-workflow: EDA → preprocessing/pipelines → trær/RF → bias-varians/regularisering → ROC/evaluering. To porteføljespor som speiler mappevurderingen. Eksamen 09.12 + mappe 16.12.2026.",
        Icon: Layers,
      },
    ],
  },
  {
    navn: "Databaser og web",
    beskrivelse: "SQL, Flask, MySQL, autentisering, web-sikkerhet, og full-stack Web 2.",
    accent: "from-blue-500/30 to-cyan-500/20",
    subjects: [
      {
        slug: "dte-2509",
        code: "DTE-2509",
        navn: "Databaser og webapplikasjoner 1",
        blurb:
          "Seks moduler som dekker hele pensumet: HTML/CSS+Git, Flask Basics, Database, User Management, API/HTTP, og Web-sikkerhet.",
        Icon: Database,
      },
      {
        slug: "dte-2802",
        code: "DTE-2802",
        navn: "Web Applikasjoner 2",
        blurb:
          "Fem mini-kurs: C#, ASP.NET MVC, Web API, EF Core og Blazor.",
        Icon: Globe,
      },
    ],
  },
  {
    navn: "AI og maskinlæring",
    beskrivelse: "Klassisk AI, supervised/unsupervised ML, og dyplæring.",
    accent: "from-violet-500/30 to-fuchsia-500/20",
    subjects: [
      {
        slug: "dte-2501",
        code: "DTE-2501",
        navn: "AI Methods and Applications",
        blurb:
          "To spor: moderne ML (k-NN, k-Means, GMM, PCA, ensembler, GA, MDP) og klassisk AI (søk, CSP, logikk, planlegging, Bayes).",
        Icon: Brain,
      },
      {
        slug: "dte-2602",
        code: "DTE-2602",
        navn: "Introduksjon maskinlæring og AI",
        blurb:
          "ML-grunnlag + workflow: EDA, preprocessing-pipelines, trær/RF, bias-varians, ROC-evaluering, og porteføljespor med kjørbare sklearn-øvelser.",
        Icon: Layers,
      },
      {
        slug: "dte-2502",
        code: "DTE-2502",
        navn: "Neural Networks",
        blurb:
          "Dyplæring som bygger på DTE-2602: backpropagation dypt, CNN, regularisering, optimerere, PyTorch/TF.",
        Icon: Workflow,
      },
    ],
  },
  {
    navn: "Systemnær og infrastruktur",
    beskrivelse: "Operativsystemer, Linux, nettverk og sikkerhet på lavt nivå.",
    accent: "from-emerald-500/30 to-teal-500/20",
    subjects: [
      {
        slug: "dte-2505",
        code: "DTE-2505",
        navn: "Operativsystemer",
        blurb:
          "Fem mini-kurs: OS-grunnlag, Linux-bruk, shell scripting, brukere og rettigheter, virtualisering.",
        Icon: TerminalSquare,
      },
      {
        slug: "dte-2507",
        code: "DTE-2507",
        navn: "Datakommunikasjon og sikkerhet",
        blurb:
          "Fem mini-kurs: OSI/TCP-IP, transport, kryptografi, TLS og nettverkssikkerhet.",
        Icon: Network,
      },
    ],
  },
  {
    navn: "Matematikk og statistikk",
    beskrivelse: "Matematiske grunnpilarer for ingeniør- og data-fag.",
    accent: "from-rose-500/30 to-pink-500/20",
    subjects: [
      {
        slug: "tek-1501",
        code: "TEK-1501",
        navn: "Sannsynlighet og statistikk for ingeniører",
        blurb:
          "Åtte mini-kurs: deskriptiv statistikk, sannsynlighet, kombinatorikk, diskrete + kontinuerlige fordelinger, CLT, konfidensintervall, hypotesetest og regresjon — med live-visualiseringer og scipy.stats i nettleseren.",
        Icon: Sigma,
      },
    ],
  },
  {
    navn: "Mobil og prosessverktøy",
    beskrivelse: "Android-utvikling og hvordan team faktisk leverer programvare.",
    accent: "from-amber-500/30 to-orange-500/20",
    subjects: [
      {
        slug: "dte-2603",
        code: "DTE-2603",
        navn: "Programmering for mobil",
        blurb:
          "Seks mini-kurs: Kotlin, Android-livssyklus, MVVM, korutiner, Room/RecyclerView og Retrofit.",
        Icon: Smartphone,
      },
      {
        slug: "dte-2604",
        code: "DTE-2604",
        navn: "Systemutvikling",
        blurb:
          "Fire mini-kurs: smidige metodikker, brukerhistorier, UML, og prosjekt-praksis.",
        Icon: Boxes,
      },
    ],
  },
];

type Verktoy = {
  href: "/practice" | "/python" | "/drag" | "/cards" | "/prosjekt" | "/exam" | "/eksamen" | "/stack/$slug";
  navn: string;
  blurb: string;
  Icon: typeof Database;
  slug?: string;
};

const VERKTOY: Verktoy[] = [
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
    href: "/exam",
    navn: "Eksamenstrening",
    blurb: "10 oppgaver, 20 minutter, nedteller.",
    Icon: GraduationCap,
  },
  {
    href: "/eksamen",
    navn: "Eksamen-hub",
    blurb: "Samler eksamens-trinn fra alle fag.",
    Icon: Sparkles,
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
  const [query, setQuery] = useState("");

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
              Velg faget ditt nedenfor — eller hopp rett i et øvingsverktøy. SQL kjører i
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

        {/* Sektor-grid */}
        <section className="container mx-auto px-4 py-14 max-w-6xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Velg fag</h2>
            <p className="mt-2 text-muted-foreground">
              Hver kursside har modul-oversikt, mini-kurs og direkte tilgang til
              øvingsmateriale.
            </p>
          </div>

          <div className="space-y-10">
            {SEKTORER.map((sektor) => {
              const isPriority = sektor.navn.startsWith("Mitt høstsemester");
              return (
              <div key={sektor.navn} className={isPriority ? "rounded-2xl border border-warning/40 bg-warning/5 p-5 md:p-6" : ""}>
                <div className="mb-4 flex items-start gap-3">
                  {isPriority && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/15">
                      <CalendarDays className="h-5 w-5 text-warning" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={isPriority ? "text-xl font-bold text-foreground" : "text-lg font-semibold text-foreground"}>{sektor.navn}</h3>
                      {isPriority && (
                        <span className="rounded-full border border-warning/50 bg-warning/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning">
                          Aktuelt nå
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{sektor.beskrivelse}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sektor.subjects.map((s) => {
                    const Icon = s.Icon;
                    return (
                      <Link
                        key={s.slug}
                        to="/stack/$slug"
                        params={{ slug: s.slug }}
                        className={
                          isPriority
                            ? "group rounded-xl border border-warning/30 bg-card hover:border-warning/60 p-5 transition-colors block relative overflow-hidden"
                            : "group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block relative overflow-hidden"
                        }
                      >
                        <div
                          className={`absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${sektor.accent}`}
                        />
                        <div className="flex items-center gap-2 mb-2">
                          <div className={isPriority ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning/15" : "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10"}>
                            <Icon className={isPriority ? "h-4 w-4 text-warning" : "h-4 w-4 text-brand"} />
                          </div>
                          <span className={isPriority ? "text-[10px] font-semibold text-warning uppercase tracking-wider" : "text-[10px] font-semibold text-brand uppercase tracking-wider"}>
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
                    );
                  })}
                </div>
              </div>
              );
            })}
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
                    to={v.href as "/practice" | "/python" | "/drag" | "/cards" | "/prosjekt" | "/exam" | "/eksamen"}
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
