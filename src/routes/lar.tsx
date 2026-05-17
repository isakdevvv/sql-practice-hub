import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Beaker,
  Code2,
  Dumbbell,
  Target,
  Network,
  PencilRuler,
  ListChecks,
  Hand,
  GitBranch,
  Package,
  BookOpen,
  StickyNote,
  FileCode,
  GraduationCap,
  Hammer,
  Brain,
  TreeDeciduous,
  Sparkles,
  Notebook,
  ArrowRight,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { PROBLEMS } from "@/lib/problems/data";
import { PY_EXERCISES } from "@/lib/python/exercises";
import { GIT_SCENARIOS } from "@/lib/git/scenarios";
import { VENV_SCENARIOS } from "@/lib/venv/scenarios";
import { DRILLS } from "@/lib/learn/drills";

export const Route = createFileRoute("/lar")({
  head: () => ({
    meta: [
      { title: "Verktøy — alt utenom fagene" },
      {
        name: "description",
        content:
          "Sandbox, drills, predict-trener, konsept-oppslag, huskelapper, AI-tutor og skill-tre. Alle generiske læringsverktøy på én side. Fagene dine ligger under Mine fag.",
      },
    ],
  }),
  component: VerktoyHub,
});

type Tool = {
  href: string;
  title: string;
  body: string;
  Icon: typeof Beaker;
  badge?: string;
  prominent?: boolean;
};

type ToolGroup = {
  navn: string;
  intro: string;
  Icon: typeof Beaker;
  tools: Tool[];
};

function VerktoyHub() {
  const totalProblems = PROBLEMS.length;
  const totalPy = PY_EXERCISES.length;
  const totalGit = GIT_SCENARIOS.length;
  const totalVenv = VENV_SCENARIOS.length;
  const totalDrills = DRILLS.length;

  const GROUPS: ToolGroup[] = [
    {
      navn: "Sandkasse & playgrounds",
      intro:
        "Skriv kode mot et levende skjema. Best når du vet hva du vil prøve.",
      Icon: Beaker,
      tools: [
        {
          href: "/",
          title: "SQL Sandbox",
          body: "Et reelt skjema, full SQL, ingen begrensninger. Test idéer, lim inn eksamensoppgaver.",
          Icon: Beaker,
          prominent: true,
        },
        {
          href: "/python-notebook",
          title: "Python-notebook",
          body: "Pyodide-notebook for kjapp eksperimentering — numpy, pandas, scipy, sklearn — alt lokalt.",
          Icon: Notebook,
        },
      ],
    },
    {
      navn: "Drill & øve",
      intro:
        "Gjør, ikke bare les. Velg formatet som hjelper deg lære best akkurat nå.",
      Icon: Dumbbell,
      tools: [
        {
          href: "/drill",
          title: "Drill-hub",
          body: "Alle interaktive drill-øvinger samlet — søk, fag-filter og lokal progress.",
          Icon: Dumbbell,
          badge: `${totalDrills} drills`,
          prominent: true,
        },
        {
          href: "/practice",
          title: "SQL-oppgaver",
          body: "Skriv ekte spørringer mot et realistisk skjema. Resultatbasert vurdering, hint underveis.",
          Icon: Code2,
          badge: `${totalProblems} oppgaver`,
          prominent: true,
        },
        {
          href: "/python",
          title: "Python-oppgaver",
          body: "Ekte Python kjørt i nettleseren — inkludert Flask. Akkurat eksamenstypen.",
          Icon: Code2,
          badge: `${totalPy} oppgaver`,
          prominent: true,
        },
        {
          href: "/predict",
          title: "Predict & trace",
          body: "Forutsi output før kjøring — trener Bloom-nivå Analyze/Evaluate på SQL og Python.",
          Icon: Target,
        },
        {
          href: "/joins",
          title: "JOIN-trening",
          body: "Visuell trening på INNER, LEFT, RIGHT, FULL — se hva som skjer med radene.",
          Icon: Network,
        },
        {
          href: "/er-tegner",
          title: "ER-tegner",
          body: "Tegn krakefot-diagram fra scratch. Kobler rett opp mot ER → DDL-drillen.",
          Icon: PencilRuler,
        },
        {
          href: "/drag",
          title: "Drag-and-drop",
          body: "Sett sammen spørringer ved å dra klausuler på plass. Bra for å låse rekkefølgen.",
          Icon: Hand,
        },
        {
          href: "/cards",
          title: "Flashcards & quiz",
          body: "Multiple-choice og spaced-repetisjon — rask repetisjon før eksamen.",
          Icon: ListChecks,
        },
        {
          href: "/git-drill",
          title: "Git-drill",
          body: "Skriv git-kommandoer i en simulert terminal — init, add, commit, branch, merge, reset.",
          Icon: GitBranch,
          badge: `${totalGit} scenarier`,
        },
        {
          href: "/venv-drill",
          title: "Venv-drill",
          body: "Øv på Python-venv: lag, aktiver, pip install, requirements.txt, ModuleNotFoundError.",
          Icon: Package,
          badge: `${totalVenv} scenarier`,
        },
      ],
    },
    {
      navn: "Oppslag & referanse",
      intro:
        "Når du står fast og bare trenger et raskt oppslag, ikke et helt kurs.",
      Icon: BookOpen,
      tools: [
        {
          href: "/learn",
          title: "Lær — konsepter",
          body: "Frittstående forklaringer av JOIN, GROUP BY, NULL og resten. Slå opp ett konsept om gangen.",
          Icon: BookOpen,
        },
        {
          href: "/stack/huskelapp",
          title: "SQL-huskelapp",
          body: "SELECT, JOIN, NULL, DDL — alt på én søkbar side. Den raskeste oppslagsboka.",
          Icon: StickyNote,
        },
        {
          href: "/python/kap",
          title: "Python kapittel-sider",
          body: "Korte, originale forklaringer av Python-pensum (valg, løkker, klasser, rekursjon …) med egne figurer.",
          Icon: FileCode,
          badge: "15 kapitler",
        },
      ],
    },
    {
      navn: "Stegvise kurs",
      intro:
        "Større, sammenhengende kurs som bygger seg opp lag for lag.",
      Icon: GraduationCap,
      tools: [
        {
          href: "/kurs",
          title: "Stegvis SQL-kurs",
          body: "6 nivåer fra SELECT til vinduer og CTE. Lås opp ett nivå om gangen.",
          Icon: GraduationCap,
          badge: `${totalProblems} oppgaver`,
        },
        {
          href: "/mini-kurs",
          title: "Mini-kurs — bygg prosjekter",
          body: "Virtuell prosjekt-mappe med filer du redigerer i editor. Bygg nettbutikk, blogg-API og mer.",
          Icon: Hammer,
        },
      ],
    },
    {
      navn: "Navigasjon & AI",
      intro:
        "Hjelp til å finne hva du bør gjøre neste, eller spør AI om noe du står fast på.",
      Icon: Brain,
      tools: [
        {
          href: "/skill-tre",
          title: "Skill-tre",
          body: "Interaktiv graf over hva du kan, hva du lærer, og hva som er anbefalt neste. Filter på fagområde.",
          Icon: TreeDeciduous,
        },
        {
          href: "/tutor",
          title: "AI-tutor",
          body: "Spør AI om hva som helst i pensum. Tutoren ser hva du har gjort og kan tilpasse forklaringen.",
          Icon: Sparkles,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-4">
            Verktøy
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Verktøy —{" "}
            <span className="bg-gradient-to-r from-brand to-success bg-clip-text text-transparent">
              alt utenom fagene
            </span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            Sandkasser, drills, oppslag, AI-tutor og skill-tre — verktøyene du
            griper etter på tvers av emner. Hvis du leter etter et bestemt fag,
            se{" "}
            <Link to="/mine-fag" className="text-brand hover:underline">
              Mine fag
            </Link>
            . Læringsstien fra transistor til Flask ligger under{" "}
            <Link
              to="/stack/$slug"
              params={{ slug: "laereplan" }}
              className="text-brand hover:underline"
            >
              Læreplan
            </Link>
            .
          </p>
        </div>

        <div className="space-y-10">
          {GROUPS.map((g) => {
            const GIcon = g.Icon;
            return (
              <section key={g.navn}>
                <div className="flex items-center gap-2 mb-1">
                  <GIcon className="h-5 w-5 text-brand" />
                  <h2 className="text-xl font-semibold">{g.navn}</h2>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {g.tools.length}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{g.intro}</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {g.tools.map((t) => (
                    <ToolCard key={t.href} {...t} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function ToolCard({
  href,
  title,
  body,
  Icon,
  badge,
  prominent = false,
}: Tool) {
  const accent = prominent
    ? "border-brand/40 bg-brand/5 hover:border-brand"
    : "border-border bg-card hover:border-brand/40";
  return (
    <a
      href={href}
      className={`group rounded-xl border p-5 transition-colors block ${accent}`}
    >
      <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-brand" />
          <h3 className="font-semibold text-foreground leading-tight">
            {title}
          </h3>
        </div>
        {badge && (
          <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
      <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
        Åpne
        <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </a>
  );
}
