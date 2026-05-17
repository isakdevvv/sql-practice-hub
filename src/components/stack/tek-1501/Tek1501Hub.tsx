import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Calculator,
  Code2,
  Dice5,
  GitBranch,
  Lightbulb,
  LineChart,
  Sigma,
  Target,
  Calendar,
  Sparkles,
  PlayCircle,
  BookOpen,
  Eye,
  Wrench,
  Brain,
  ScrollText,
  TrendingUp,
  Activity,
  Workflow,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { LearningPath } from "@/components/stack/LearningPath";
import { ModulStatusBadge, ModulProgressBar } from "@/components/stack/HubShared";
import { EXAM_META } from "@/lib/subjects/catalog";
import { useModulProgress } from "@/lib/stack/moduleProgress";

type Lab = {
  slug: string;
  title: string;
  blurb: string;
  Icon: typeof BarChart3;
  taggar: string[];
};

const LABS: Lab[] = [
  {
    slug: "tek1-kombinatorikk",
    title: "Kombinatorikk — trekksim",
    blurb:
      "Permutasjoner og kombinasjoner, m/uten tilbakelegging. Interaktiv trekksim med live tellere.",
    Icon: Dice5,
    taggar: ["modul 2"],
  },
  {
    slug: "tek1-fordelinger",
    title: "Fordelings-velger",
    blurb:
      "Bestem riktig fordeling basert på problem-egenskaper — diskret/kontinuerlig, telling/tid/forhold.",
    Icon: Sigma,
    taggar: ["modul 3", "velger"],
  },
  {
    slug: "tek1-diskrete-fordelinger",
    title: "Diskrete fordelinger live",
    blurb:
      "Binomisk, Poisson, hypergeometrisk. Live PMF-plot — se hvordan n og p endrer formen.",
    Icon: BarChart3,
    taggar: ["modul 3"],
  },
  {
    slug: "tek1-kontinuerlige-fordelinger",
    title: "Kontinuerlige fordelinger",
    blurb:
      "Normal, eksp, t, χ². PDF med drag-bart areal — tren intuisjonen for P(a<X<b).",
    Icon: LineChart,
    taggar: ["modul 3"],
  },
  {
    slug: "tek1-forventning-clt",
    title: "Forventning, varians & CLT",
    blurb:
      "Simulator for sentralgrenseteoremet med 4 ulike grunnfordelinger — se konvergensen.",
    Icon: Activity,
    taggar: ["modul 3", "CLT"],
  },
  {
    slug: "tek1-distribusjons-plotter",
    title: "Distribusjons-plotter (universal)",
    blurb:
      "Velg fordeling, juster parametere, se PDF/PMF og CDF side-ved-side. Slå opp kritiske verdier live.",
    Icon: LineChart,
    taggar: ["referanse", "plot"],
  },
  {
    slug: "tek1-estimering-ki",
    title: "Konfidensintervall-sim",
    blurb:
      "100-utvalg-simulator viser hvorfor 95 % KI ikke garanterer 95 % i hvert tilfelle.",
    Icon: Target,
    taggar: ["modul 4", "inferens"],
  },
  {
    slug: "tek1-hypotesetest-regresjon",
    title: "Hypotesetest + regresjon",
    blurb:
      "H₀/H₁-overlapp med skyvbar kritisk grense, drag-bar scatter med live R².",
    Icon: TrendingUp,
    taggar: ["modul 4", "test"],
  },
  {
    slug: "tek1-p-verdi-kalkulator",
    title: "p-verdi-kalkulator",
    blurb:
      "Skriv inn testverdi, fordeling og side — få p-verdi + grafisk areal-illustrasjon.",
    Icon: Calculator,
    taggar: ["modul 4", "p-verdi"],
  },
];

type ConceptCourse = {
  slug: string;
  title: string;
  shortDescription: string;
  Icon: typeof BarChart3;
};

const CONCEPT_COURSES: ConceptCourse[] = [
  {
    slug: "tek1-deskriptiv",
    title: "Deskriptiv statistikk",
    shortDescription:
      "Sentralmål (mean/median/modus/kvartiler), spredning (varians/std/IQR), histogram/boksplott/scatter.",
    Icon: BarChart3,
  },
  {
    slug: "tek1-sannsynlighet",
    title: "Sannsynlighet & mengdelære",
    shortDescription:
      "Utfallsrom, Kolmogorov, betinget P, Bayes, uavhengighet. Venn-diagram + intuisjon.",
    Icon: Dice5,
  },
  {
    slug: "tek1-statistisk-analyse",
    title: "Statistisk analyse — komplett",
    shortDescription:
      "Estimatorer, KI, hypotesetest (z/t/χ²), korrelasjon, lineær regresjon — bredt sammenfattende kurs.",
    Icon: Workflow,
  },
  {
    slug: "tek1-proporsjoner",
    title: "Inferens for proporsjoner",
    shortDescription:
      "Wald vs Wilson vs Agresti-Coull, pooled vs unpooled, eksakte vs approksimative metoder.",
    Icon: Sigma,
  },
  {
    slug: "tek1-anova",
    title: "Ettveis ANOVA & F-test",
    shortDescription:
      "SS-dekomposisjon, F-statistikk, post-hoc (Tukey HSD). Når brukes ANOVA framfor parvise t-tester?",
    Icon: Boxes,
  },
  {
    slug: "tek1-regresjon-diagnostikk",
    title: "Regresjon-diagnostikk",
    shortDescription:
      "Residualer, Q-Q-plot, Cook's D, R² vs R²-justert, VIF for multikollinearitet.",
    Icon: TrendingUp,
  },
];

type ExamTopic = {
  topic: string;
  Icon: typeof BarChart3;
  slugs: { slug: string; label: string }[];
};

const EXAM_TOPICS: ExamTopic[] = [
  {
    topic: "Modul 1 — Deskriptiv",
    Icon: BarChart3,
    slugs: [{ slug: "tek1-deskriptiv", label: "Sentralmål & spredning" }],
  },
  {
    topic: "Modul 2 — Sannsynlighet",
    Icon: Dice5,
    slugs: [
      { slug: "tek1-sannsynlighet", label: "P, Bayes, mengdelære" },
      { slug: "tek1-kombinatorikk", label: "Kombinatorikk" },
    ],
  },
  {
    topic: "Modul 3 — Fordelinger",
    Icon: Sigma,
    slugs: [
      { slug: "tek1-fordelinger", label: "Velger" },
      { slug: "tek1-diskrete-fordelinger", label: "Diskrete" },
      { slug: "tek1-kontinuerlige-fordelinger", label: "Kontinuerlige" },
      { slug: "tek1-forventning-clt", label: "E, Var, CLT" },
      { slug: "tek1-distribusjons-plotter", label: "Plotter" },
    ],
  },
  {
    topic: "Modul 4 — Inferens",
    Icon: Target,
    slugs: [
      { slug: "tek1-estimering-ki", label: "KI" },
      { slug: "tek1-hypotesetest-regresjon", label: "Hypotesetest + regresjon" },
      { slug: "tek1-p-verdi-kalkulator", label: "p-verdi" },
      { slug: "tek1-statistisk-analyse", label: "Komplett" },
    ],
  },
  {
    topic: "Modul 4 — Spesialtester",
    Icon: Activity,
    slugs: [
      { slug: "tek1-proporsjoner", label: "Proporsjoner" },
      { slug: "tek1-anova", label: "ANOVA" },
      { slug: "tek1-regresjon-diagnostikk", label: "Regresjon-diagn." },
    ],
  },
];

const PENSUM_REGEX = [
  { kjern: "Beregn mean og std for utvalget", svar: "Modul 1 — deskriptiv" },
  { kjern: "Median vs mean — når foretrekkes median?", svar: "Modul 1 — sentralmål" },
  { kjern: "Hva er P(A | B) gitt P(A), P(B), P(B|A)?", svar: "Modul 2 — Bayes" },
  { kjern: "Antall permutasjoner av 5 av 8?", svar: "Modul 2 — kombinatorikk-lab" },
  { kjern: "10 % defekte — P(2 av 20 defekte)?", svar: "Modul 3 — binomisk" },
  { kjern: "P(X > x) der X er normalfordelt", svar: "Modul 3 — kontinuerlig-lab" },
  { kjern: "Hvilken fordeling passer best?", svar: "Modul 3 — velgeren" },
  { kjern: "95 % KI for μ", svar: "Modul 4 — KI-lab" },
  { kjern: "Test om mean ≠ 100 (p-verdi)", svar: "Modul 4 — p-verdi-kalkulator" },
  { kjern: "Korrelasjon og regresjon mellom x og y", svar: "Modul 4 — hypotesetest+regresjon" },
  { kjern: "Sammenlign 3+ grupper", svar: "Modul 4 — ANOVA" },
];

const MODE_ANCHORS: { id: string; label: string; Icon: typeof BarChart3 }[] = [
  { id: "les", label: "Les", Icon: BookOpen },
  { id: "visualiser", label: "Visualiser", Icon: Eye },
  { id: "ov", label: "Øv", Icon: Wrench },
  { id: "eksamen", label: "Eksamen", Icon: ScrollText },
  { id: "tutor", label: "AI-tutor", Icon: Brain },
];

export function Tek1501Hub() {
  const meta = EXAM_META["tek-1501"];

  const allConceptSlugs = useMemo(() => CONCEPT_COURSES.map((c) => c.slug), []);
  const { seen, total } = useModulProgress(allConceptSlugs);
  const nextSlug = useNextUnseenSlug(allConceptSlugs);
  const nextCourse = useMemo(
    () => CONCEPT_COURSES.find((c) => c.slug === nextSlug) ?? CONCEPT_COURSES[0],
    [nextSlug],
  );
  const allDone = total > 0 && seen === total;

  return (
    <StackPageShell
      title="TEK-1501 Sannsynlighet og statistikk for ingeniører"
      group="eksamen"
    >
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Hero */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 text-brand border border-brand/30 px-2.5 py-1 font-semibold">
              TEK-1501
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted text-muted-foreground border border-border px-2.5 py-1">
              {meta?.stp ?? 5} stp
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2.5 py-1">
              <Calendar className="h-3 w-3" />
              Eksamen {meta?.eksamen ?? "14.12.2026 (3t skriftlig)"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted text-muted-foreground border border-border px-2.5 py-1">
              Live PMF/PDF
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Sannsynlighet og statistikk
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Data → sannsynlighet → fordelinger → inferens. Eksamen er 3-timers
            skriftlig — tyngdepunktet er Modul 2 (sannsynlighet) og Modul 3
            (fordelinger). Velg modus under.
          </p>
        </div>

        {/* Modus-rad */}
        <nav
          aria-label="Velg modus"
          className="mb-6 sticky top-14 z-20 -mx-4 px-4 py-2 bg-background/85 backdrop-blur border-b border-border"
        >
          <div className="flex flex-wrap gap-1.5 text-xs">
            {MODE_ANCHORS.map((m) => {
              const Icon = m.Icon;
              return (
                <a
                  key={m.id}
                  href={`#${m.id}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card hover:border-brand/50 hover:bg-brand/5 px-2.5 py-1.5 text-foreground transition-colors"
                >
                  <Icon className="h-3.5 w-3.5 text-brand" />
                  {m.label}
                </a>
              );
            })}
          </div>
        </nav>

        {/* Anbefalt neste + framdrift */}
        <div className="mb-10 grid sm:grid-cols-[2fr_1fr] gap-3">
          <Link
            to="/stack/$slug"
            params={{ slug: nextCourse.slug }}
            className="group rounded-xl border-2 border-brand/40 bg-gradient-to-br from-brand/10 to-success/5 hover:border-brand transition-colors p-5 block"
          >
            <div className="flex items-center gap-2 mb-1">
              <PlayCircle className="h-5 w-5 text-brand" />
              <div className="text-[10px] uppercase tracking-wider font-semibold text-brand">
                {allDone ? "Repeter" : seen === 0 ? "Start her" : "Anbefalt neste"}
              </div>
            </div>
            <h3 className="font-semibold text-foreground leading-tight text-lg mt-1">
              {nextCourse.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-snug mt-1">
              {nextCourse.shortDescription}
            </p>
            <div className="mt-3 flex items-center text-xs font-medium text-brand">
              {seen === 0 ? "Start" : "Fortsett"}
              <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
              Din framdrift
            </div>
            <div className="text-2xl font-semibold tabular-nums">
              {seen}{" "}
              <span className="text-muted-foreground text-base font-normal">
                / {total}
              </span>
            </div>
            <ModulProgressBar trinnSlugs={allConceptSlugs} />
            <div className="mt-3 text-[11px] text-muted-foreground">
              Konsept-leksjoner sett. {LABS.length} labs telles ikke her.
            </div>
          </div>
        </div>

        {/* Læringssti */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-3">Læringssti — anbefalt rekkefølge</h2>
          <LearningPath
            fag="TEK-1501"
            forbinder={[
              "DTE-2501 (RL/ML bruker sannsynlighet)",
              "DTE-2602 (evaluering, hypotesetest av modeller)",
              "Matematikk R1/R2",
            ]}
            layers={[
              {
                navn: "Basis — beskriv dataene",
                intro:
                  "Lær å sammenfatte målinger med tall og bilder. Før vi modellerer noe, må vi se hva vi faktisk har.",
                steps: [
                  { slug: "tek1-deskriptiv", title: "Sentralmål, spredning og visualisering", blurb: "Mean, median, varians, IQR + histogram med live bin-slider." },
                  { slug: "tek1-sannsynlighet", title: "Sannsynlighet, mengdelære, Bayes", blurb: "Venn-diagram, betinget P, og Bayes — bygg intuisjon før formler." },
                  { slug: "tek1-kombinatorikk", title: "Kombinatorikk", blurb: "Permutasjon, kombinasjon, m/uten tilbakelegging — interaktiv trekksim." },
                ],
              },
              {
                navn: "Dypere — modeller for tilfeldighet",
                intro:
                  "Når dataene er forstått, putter vi dem inn i sannsynlighetsfordelinger. Slik kan vi regne ut hva som er sannsynlig før vi har sett det.",
                steps: [
                  { slug: "tek1-diskrete-fordelinger", title: "Binomisk, Poisson, hypergeometrisk", blurb: "Live PMF-plot — se hvordan n og p endrer formen." },
                  { slug: "tek1-kontinuerlige-fordelinger", title: "Normal, eksp, t, χ²", blurb: "PDF med drag-bart areal — tren intuisjonen for P(a<X<b)." },
                  { slug: "tek1-forventning-clt", title: "Forventning, varians, CLT", blurb: "Simulator for sentralgrenseteoremet." },
                ],
              },
              {
                navn: "Eksamen — trekke konklusjoner",
                intro:
                  "Når modellen sitter, bruker vi den til å si noe vi ikke visste: hvor sikre er vi, og er forskjellen reell?",
                steps: [
                  { slug: "tek1-estimering-ki", title: "Konfidensintervaller", blurb: "100-utvalg-simulator viser hvorfor 95 % KI ikke garanterer 95 % i hvert tilfelle." },
                  { slug: "tek1-hypotesetest-regresjon", title: "Hypotesetest + regresjon", blurb: "H₀/H₁-overlapp med skyvbar kritisk grense, drag-bar scatter med live R²." },
                  { slug: "tek1-statistisk-analyse", title: "Komplett analyse", blurb: "Bredt sammenfattende kurs — koble alle teknikkene." },
                ],
              },
            ]}
          />
        </section>

        {/* === LES === */}
        <section id="les" className="mb-12 scroll-mt-28">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Les — konsept-leksjoner</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Tekst-tunge introduksjoner. For interaktive plottere — se Visualiser-seksjonen
            under.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {CONCEPT_COURSES.map((c) => {
              const Icon = c.Icon;
              return (
                <Link
                  key={c.slug}
                  to="/stack/$slug"
                  params={{ slug: c.slug }}
                  className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-brand" />
                    <h3 className="font-semibold text-foreground leading-tight">
                      {c.title}
                    </h3>
                    <ModulStatusBadge trinnSlugs={[c.slug]} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {c.shortDescription}
                  </p>
                  <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Åpne
                    <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* === VISUALISER === */}
        <section id="visualiser" className="mb-12 scroll-mt-28">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Visualiser & labs</h2>
            <span className="rounded-full bg-success/10 text-success border border-success/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              {LABS.length} interaktive
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Statistikk lærer man best ved å manipulere fordelingene selv. Drag i
            arealer, skyv parametere, simulér eksperimentet 100 ganger.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {LABS.map((lab) => {
              const Icon = lab.Icon;
              return (
                <Link
                  key={lab.slug}
                  to="/stack/$slug"
                  params={{ slug: lab.slug }}
                  className="group rounded-xl border border-success/30 bg-success/5 hover:border-success p-5 transition-colors block"
                >
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Icon className="h-4 w-4 text-success" />
                    <h3 className="font-semibold text-foreground leading-tight">
                      {lab.title}
                    </h3>
                    <ModulStatusBadge trinnSlugs={[lab.slug]} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {lab.blurb}
                  </p>
                  <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex flex-wrap gap-1">
                      {lab.taggar.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] rounded bg-muted text-muted-foreground px-1.5 py-0.5"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <span className="inline-flex items-center text-xs text-success font-medium">
                      Åpne lab
                      <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* === ØV === */}
        <section id="ov" className="mb-12 scroll-mt-28">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Øv — gjør, ikke bare les</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Pyodide kjører numpy + scipy.stats i nettleseren — verifiser
            håndregningen din mot Python.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              to="/python"
              className="group rounded-xl border border-brand/40 bg-brand/5 hover:border-brand p-5 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <Code2 className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-foreground leading-tight">
                  Python-øvelser — scipy.stats
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Snitt/std, t-tester, lineær regresjon, χ² — alt uten lokal
                installasjon.
              </p>
              <div className="mt-3 flex items-center text-xs text-brand font-medium">
                Åpne
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
            <Link
              to="/drag"
              className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-foreground leading-tight">
                  Drag-oppgaver
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                55+ kortere oppgaver: fyll-inn formler, match fordelinger til
                scenarier, sortér hypotesetest-stegene.
              </p>
              <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Åpne
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
            <Link
              to="/cards"
              className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-foreground leading-tight">
                  Flashcards
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                40+ kort over begreper, formler, og fordelings-parametere.
              </p>
              <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Åpne
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
            <Link
              to="/eksamen/trening"
              className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <Boxes className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-foreground leading-tight">
                  Tidsbasert trening
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Press-test deg selv. Velg statistikk-kategorier, kjør under
                tidspress.
              </p>
              <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Åpne
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        {/* === EKSAMEN === */}
        <section id="eksamen" className="mb-12 scroll-mt-28">
          <div className="flex items-center gap-2 mb-2">
            <ScrollText className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Eksamen-temaer</h2>
            <span className="text-[11px] text-muted-foreground">
              {meta?.eksamen ?? "14.12.2026 (3t skriftlig)"} · {meta?.stp ?? 5} stp
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Strukturen følger UiT-emnebeskrivelsen for TEK-1501. Modul 2 og 3 er
            tyngdepunktet på skriftlig.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {EXAM_TOPICS.map((t) => {
              const Icon = t.Icon;
              return (
                <div
                  key={t.topic}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-brand" />
                    <h3 className="font-semibold text-foreground text-sm">
                      {t.topic}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {t.slugs.map((s) => (
                      <Link
                        key={s.slug}
                        to="/stack/$slug"
                        params={{ slug: s.slug }}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-background hover:border-brand/50 hover:bg-brand/5 px-2 py-1 text-[11px] text-foreground transition-colors"
                      >
                        {s.label}
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Eksamen-spørsmål → riktig sted */}
          <h3 className="text-sm font-semibold text-foreground mb-2 mt-6">
            Hvis eksamen sier «...» — slå opp her
          </h3>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-1/2">
                    Hvis oppgaven sier ...
                  </th>
                  <th className="text-left font-semibold px-4 py-2">Slå opp her</th>
                </tr>
              </thead>
              <tbody>
                {PENSUM_REGEX.map((r) => (
                  <tr key={r.kjern} className="border-t border-border">
                    <td className="px-4 py-3 italic">{r.kjern}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.svar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* === AI-TUTOR === */}
        <section id="tutor" className="mb-12 scroll-mt-28">
          <a
            href="/tutor"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl border border-brand/30 bg-gradient-to-br from-brand/10 to-violet-500/5 hover:border-brand p-5 transition-colors flex items-start gap-4"
          >
            <div className="shrink-0 rounded-lg bg-brand/15 p-2.5">
              <Sparkles className="h-5 w-5 text-brand" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold">Spør AI om TEK-1501</h2>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-success/15 text-success border border-success/30">
                  Sjekk forståelse
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-snug">
                Få forklart hvorfor p &gt; 0.05 IKKE betyr at H₀ er sann, eller
                hvordan CLT gjør at vi kan bruke normalfordelingen selv når
                grunnfordelingen er skjev. Tutoren ser hva du har gjort.
              </p>
              <div className="mt-2 flex items-center text-xs font-medium text-brand">
                Åpne tutor
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </a>
        </section>

        {/* Eksamen-strategi */}
        <div className="rounded-xl border border-border bg-card p-5 text-sm space-y-3 mb-6">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <Target className="h-4 w-4 text-brand" />
            Eksamen-strategi
          </h2>
          <ul className="space-y-2 text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">Først:</strong> identifiser
              hvilken fordeling som passer. Diskret eller kontinuerlig? Bruk{" "}
              <Link
                to="/stack/$slug"
                params={{ slug: "tek1-fordelinger" }}
                className="text-brand hover:underline"
              >
                fordelings-velgeren
              </Link>
              .
            </li>
            <li>
              <strong className="text-foreground">Deretter:</strong> sett opp
              formelen. Skriv ut hva n, p, μ, σ er FØR du tar fram kalkulator.
            </li>
            <li>
              <strong className="text-foreground">Til slutt:</strong> sjekk om
              svaret er rimelig. Sannsynlighet ∈ [0,1]. KI inneholder
              punktestimatet. p-verdi &gt; 0.05 betyr IKKE at H₀ er sann.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}

function useNextUnseenSlug(slugs: string[]): string {
  const { seen, total } = useModulProgress(slugs);
  if (typeof window === "undefined" || seen === 0 || seen >= total) {
    return slugs[0];
  }
  try {
    const raw = window.localStorage.getItem("stack.visited.v1");
    if (!raw) return slugs[0];
    const visited = JSON.parse(raw) as Record<string, true>;
    const next = slugs.find((s) => !visited[s]);
    return next ?? slugs[0];
  } catch {
    return slugs[0];
  }
}
