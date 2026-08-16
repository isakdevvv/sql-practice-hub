import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { LibraryGrid } from "@/components/library/LibraryGrid";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Code2,
  Database,
  Network,
  PlayCircle,
  Sparkles,
  Target,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kodeverkstedet - lek, lær og test deg selv" },
      {
        name: "description",
        content:
          "Interaktive simulatorer, mini-kurs og øvinger som kjører lokalt i nettleseren. SQL, Python, statistikk, ML, nettverk og mer.",
      },
      {
        property: "og:title",
        content: "Kodeverkstedet - lek, lær og test deg selv",
      },
      {
        property: "og:description",
        content:
          "Lek med interaktive simulatorer, gå gjennom mini-kurs, eller test deg selv med oppgaver og drills.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10 max-w-6xl">
        <section className="mb-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
              <Code2 className="h-3.5 w-3.5" />
              IT-fag med interaktiv øving
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold">Kodeverkstedet</h1>
            <p className="mt-3 text-base text-muted-foreground max-w-2xl">
              En praktisk læringsapp for SQL, Python, web, nettverk, statistikk og maskinlæring.
              Bygg forståelse med simulatorer, mini-kurs og oppgaver som kjører rett i nettleseren.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <ModeCard
                to="/lek"
                icon={<Sparkles className="h-5 w-5" />}
                title="Lek"
                body="Simulatorer og sandkasser. Dra, klikk, observer."
              />
              <ModeCard
                to="/laer"
                icon={<BookOpen className="h-5 w-5" />}
                title="Lær"
                body="Mini-kurs i lineære løp gjennom et tema."
              />
              <ModeCard
                to="/test"
                icon={<Target className="h-5 w-5" />}
                title="Test"
                body="Oppgaver, flashcards, drill, kode-puslespill."
              />
            </div>
          </div>

          <HeroPreview />
        </section>

        <section className="mb-12">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Applikasjonseksempler</h2>
              <p className="text-sm text-muted-foreground">
                Tre typiske arbeidsflater fra appen, tilpasset ulike måter å lære på.
              </p>
            </div>
            <Link
              to="/lek"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
            >
              Utforsk eksempler
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <ExampleCard
              link={{ to: "/practice" }}
              icon={<Database className="h-4 w-4" />}
              title="SQL-lab"
              body="Skriv spørringer, se tabeller og sammenlign resultatet mot fasit."
              cta="Åpne SQL-oppgavene"
              visual="sql"
            />
            <ExampleCard
              link={{ to: "/stack/$slug", params: { slug: "dte2507-ospf-dijkstra" } }}
              icon={<Network className="h-4 w-4" />}
              title="Nettverkssimulator"
              body="Sett kostnader i ruternettet og se korteste vei bygge seg steg for steg."
              cta="Åpne OSPF-simulatoren"
              visual="network"
            />
            <ExampleCard
              link={{ to: "/stack/$slug", params: { slug: "dte2602-logistisk-regresjon" } }}
              icon={<BrainCircuit className="h-4 w-4" />}
              title="ML-visualisering"
              body="Dra i data og modell, og se hvordan beslutningsgrensa flytter seg."
              cta="Åpne beslutningsgrense-labben"
              visual="ml"
            />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Bla i biblioteket</h2>
          <LibraryGrid kind="lek" />
        </section>
      </main>
    </div>
  );
}

function ModeCard({
  to,
  icon,
  title,
  body,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col gap-1.5 rounded-xl border border-border bg-card p-4 transition-all hover:border-brand/60 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
          {icon}
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
      <div className="font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground">{body}</div>
    </Link>
  );
}

function HeroPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-success" />
        <span className="ml-3 text-xs font-medium text-muted-foreground">Kodeverkstedet</span>
      </div>
      <div className="grid gap-3 p-4">
        <div className="rounded-lg bg-background p-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="h-2.5 w-24 rounded-full bg-foreground/80" />
              <div className="mt-2 h-2 w-36 rounded-full bg-muted-foreground/30" />
            </div>
            <PlayCircle className="h-8 w-8 text-brand" />
          </div>
          <div className="grid grid-cols-[1fr_92px] gap-3">
            <div className="space-y-2 rounded-md bg-slate-950 p-3 font-mono text-[10px] text-slate-100">
              <div>
                <span className="text-cyan-300">SELECT</span> navn, sum
              </div>
              <div>
                <span className="text-cyan-300">FROM</span> ordre
              </div>
              <div>
                <span className="text-cyan-300">WHERE</span> status ={" "}
                <span className="text-amber-200">'sendt'</span>;
              </div>
            </div>
            <div className="grid grid-rows-3 gap-1.5">
              <span className="rounded bg-brand/15" />
              <span className="rounded bg-success/20" />
              <span className="rounded bg-warning/25" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <PreviewTile label="SQL" value="312" />
          <PreviewTile label="Python" value="88" />
          <PreviewTile label="Stack" value="64" />
        </div>
      </div>
    </div>
  );
}

function PreviewTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

// Kortene ser ut som knapper, så de skal også være det: hele kortet er én
// lenke inn i den simulatoren/øvingen bildet viser.
type ExampleLink = { to: "/practice" } | { to: "/stack/$slug"; params: { slug: string } };

function ExampleCard({
  link,
  icon,
  title,
  body,
  cta,
  visual,
}: {
  link: ExampleLink;
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
  visual: "sql" | "network" | "ml";
}) {
  return (
    <Link
      {...link}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/60 hover:shadow-md"
    >
      <ExampleVisual kind={visual} />
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand/10 text-brand">
            {icon}
          </span>
          {title}
        </div>
        <p className="text-sm text-muted-foreground">{body}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand">
          {cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function ExampleVisual({ kind }: { kind: "sql" | "network" | "ml" }) {
  if (kind === "network") {
    return (
      <div className="relative h-44 bg-[linear-gradient(135deg,oklch(0.96_0.03_205),oklch(0.92_0.04_150))] p-5 dark:bg-[linear-gradient(135deg,oklch(0.28_0.04_235),oklch(0.24_0.04_160))]">
        <div className="absolute left-8 top-8 h-10 w-10 rounded-lg bg-card shadow-sm" />
        <div className="absolute right-8 top-8 h-10 w-10 rounded-lg bg-card shadow-sm" />
        <div className="absolute bottom-8 left-1/2 h-10 w-10 -translate-x-1/2 rounded-lg bg-brand shadow-sm" />
        <div className="absolute left-[64px] right-[64px] top-[48px] h-1 rounded-full bg-brand/35" />
        <div className="absolute bottom-[48px] left-[88px] h-1 w-24 rotate-[28deg] rounded-full bg-success/50" />
        <div className="absolute bottom-[48px] right-[88px] h-1 w-24 -rotate-[28deg] rounded-full bg-success/50" />
        <Network className="absolute bottom-10 left-1/2 h-6 w-6 -translate-x-1/2 text-brand-foreground" />
      </div>
    );
  }

  if (kind === "ml") {
    return (
      <div className="relative h-44 overflow-hidden bg-[linear-gradient(135deg,oklch(0.97_0.03_45),oklch(0.94_0.04_300))] p-5 dark:bg-[linear-gradient(135deg,oklch(0.28_0.04_45),oklch(0.25_0.04_300))]">
        <div className="absolute inset-x-6 bottom-8 top-7 rounded-lg border border-border/70 bg-card/75" />
        <div className="absolute left-10 top-12 h-3 w-3 rounded-full bg-brand" />
        <div className="absolute left-20 top-24 h-3 w-3 rounded-full bg-brand" />
        <div className="absolute left-28 top-16 h-3 w-3 rounded-full bg-brand" />
        <div className="absolute right-12 top-20 h-3 w-3 rounded-full bg-warning" />
        <div className="absolute right-20 top-12 h-3 w-3 rounded-full bg-warning" />
        <div className="absolute right-24 bottom-14 h-3 w-3 rounded-full bg-warning" />
        <div className="absolute left-1/2 top-8 h-32 w-1 -rotate-[24deg] rounded-full bg-foreground/70" />
      </div>
    );
  }

  return (
    <div className="h-44 bg-[linear-gradient(135deg,oklch(0.96_0.03_250),oklch(0.97_0.02_180))] p-5 dark:bg-[linear-gradient(135deg,oklch(0.28_0.04_250),oklch(0.24_0.04_180))]">
      <div className="h-full rounded-lg bg-slate-950 p-4 font-mono text-[11px] text-slate-100 shadow-sm">
        <div>
          <span className="text-cyan-300">SELECT</span> kunde, SUM(total)
        </div>
        <div>
          <span className="text-cyan-300">FROM</span> ordre
        </div>
        <div>
          <span className="text-cyan-300">GROUP BY</span> kunde
        </div>
        <div className="mt-4 grid grid-cols-3 gap-1 text-[9px]">
          <span className="rounded bg-slate-800 px-1.5 py-1">kunde</span>
          <span className="rounded bg-slate-800 px-1.5 py-1">sum</span>
          <span className="rounded bg-success/40 px-1.5 py-1">ok</span>
        </div>
      </div>
    </div>
  );
}
