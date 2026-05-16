import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TypeOverview,
  AssignmentSteps,
  OperatorPrecedence,
  IndentationBlocks,
  ConditionalAnatomy,
  TruthinessLadder,
  LoopAnatomy,
  ForLoopDesugar,
  ComprehensionDesugar,
  FunctionAnatomy,
  CallFrameDetail,
  MethodVsFunction,
  SlicingAnatomy,
} from "@/components/learn/python-figures/PythonFigures";
import { BookOpen, Compass, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/python_/kjerne")({
  head: () => ({
    meta: [
      { title: "Python kjerne — mental kart før eksamen" },
      {
        name: "description",
        content:
          "Pre-eksamen cheat sheet for Python: alle de fundamentale mental-model-figurene samlet på én side, gruppert etter tema.",
      },
    ],
  }),
  component: PythonKjernePage,
});

/* ----------------------------- Building blocks ----------------------------- */

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-10 mb-2 text-xl font-semibold tracking-tight">
      {children}
    </h2>
  );
}

function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-6 mb-2 text-base font-semibold tracking-tight text-foreground/90">
      {children}
    </h3>
  );
}

function P({ children }: { children: ReactNode }) {
  return (
    <p className="my-2 text-sm leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

function FigureCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="my-4 rounded-lg border border-border bg-card p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

function Section({
  badge,
  title,
  intro,
  children,
}: {
  badge: string;
  title: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mb-6">
      <div className="flex items-baseline gap-2">
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
          {badge}
        </Badge>
      </div>
      <H2>{title}</H2>
      <P>{intro}</P>
      <div>{children}</div>
    </section>
  );
}

/* ----------------------------------- Page ---------------------------------- */

function PythonKjernePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Link to="/python" className="hover:text-foreground inline-flex items-center gap-1">
            <ChevronLeft className="h-3 w-3" />
            Python
          </Link>
          <span>/</span>
          <span className="text-foreground">Kjerne</span>
        </nav>

        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Compass className="h-3.5 w-3.5" />
            Pre-eksamen
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Python kjerne</h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Hele Python på én side — de fundamentale figurene som forklarer hvordan
            språket faktisk fungerer. Tenk på dette som et mental-kart: når en idé
            føles vag rett før eksamen, finn figuren her og se modellen igjen.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/python_/kap">
              <Button variant="outline" size="sm">
                <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                Kapittel-sider med tekst
              </Button>
            </Link>
            <Link to="/python">
              <Button variant="outline" size="sm">
                <Compass className="h-3.5 w-3.5 mr-1.5" />
                Tilbake til Python-sandkassen
              </Button>
            </Link>
          </div>
        </header>

        {/* 1. Verdier og hukommelse */}
        <Section
          badge="1"
          title="Verdier og hukommelse"
          intro={
            <>
              Hver verdi er en boks i hukommelsen med en adresse. Et navn er bare en
              etikett som peker på en adresse. Når du leser et uttrykk, evaluerer
              Python høyresiden først, så binder navnet til det resultatet.
            </>
          }
        >
          <FigureCard title="TypeOverview — én rad per type">
            <TypeOverview />
          </FigureCard>
          <FigureCard title="AssignmentSteps — = evaluerer høyre, binder navn til adresse">
            <AssignmentSteps />
          </FigureCard>
          <FigureCard title="OperatorPrecedence — hva binder strammest">
            <OperatorPrecedence />
          </FigureCard>
        </Section>

        {/* 2. Kontrollflyt */}
        <Section
          badge="2"
          title="Kontrollflyt"
          intro={
            <>
              Python har ingen krøllparenteser — innrykk er språket. En if-kjede
              evalueres topp-til-bunn, og bare den første sanne grenen kjøres.
              Husk truthiness-leddet for å vite hva som regnes som «sant».
            </>
          }
        >
          <FigureCard title="IndentationBlocks — innrykk er språket">
            <IndentationBlocks />
          </FigureCard>
          <FigureCard title="ConditionalAnatomy — if/elif/else evalueres topp-til-bunn">
            <ConditionalAnatomy />
          </FigureCard>
          <FigureCard title="TruthinessLadder — falsy vs truthy">
            <TruthinessLadder />
          </FigureCard>
        </Section>

        {/* 3. Løkker */}
        <Section
          badge="3"
          title="Løkker"
          intro={
            <>
              En while-løkke er fire steg som gjentas. En for-løkke er sukker for
              <code className="mx-1 rounded bg-muted px-1 font-mono text-[12px]">iter()</code>
              +
              <code className="mx-1 rounded bg-muted px-1 font-mono text-[12px]">next()</code>
              i en sløyfe. En list-comprehension er sukker for for-løkke + append.
            </>
          }
        >
          <FigureCard title="LoopAnatomy — 4 steg i en while-løkke">
            <LoopAnatomy />
          </FigureCard>
          <FigureCard title="ForLoopDesugar — for som iter() + next()">
            <ForLoopDesugar />
          </FigureCard>
          <FigureCard title="ComprehensionDesugar — list-comp som for + append">
            <ComprehensionDesugar />
          </FigureCard>
        </Section>

        {/* 4. Funksjoner og metoder */}
        <Section
          badge="4"
          title="Funksjoner og metoder"
          intro={
            <>
              En def-linje binder et navn til en funksjon. Et kall lager en ny ramme
              på kallstacken med argumentene som lokale variabler, og en retur-adresse
              tilbake til kallstedet. En metode er bare en funksjon der det første
              argumentet (self) er det objektet du kalte på.
            </>
          }
        >
          <FigureCard title="FunctionAnatomy — def-linjen og kallet ord for ord">
            <FunctionAnatomy />
          </FigureCard>
          <FigureCard title="CallFrameDetail — kallstacken med ramme + retur-adresse">
            <CallFrameDetail />
          </FigureCard>
          <FigureCard title="MethodVsFunction — obj.m(x) → Klasse.m(obj, x)">
            <MethodVsFunction />
          </FigureCard>
        </Section>

        {/* 5. Strenger */}
        <Section
          badge="5"
          title="Strenger"
          intro={
            <>
              En streng er en uforanderlig sekvens av tegn. Slicing bruker
              kant-indekser (mellomrommene mellom tegn) — derfor er
              <code className="mx-1 rounded bg-muted px-1 font-mono text-[12px]">s[a:b]</code>
              alle tegn fra plass a opp til (men ikke med) plass b.
            </>
          }
        >
          <FigureCard title="SlicingAnatomy — kant-indekser og s[a:b:c]">
            <SlicingAnatomy />
          </FigureCard>
        </Section>

        <footer className="mt-12 pt-6 border-t border-border text-sm text-muted-foreground">
          <H3>Hvordan bruke denne siden</H3>
          <P>
            Skroll gjennom én gang i ro og mak for å se «hele Python» på én
            skjerm. Når noe føles uklart under øvelser, kom hit, finn figuren,
            og gå deretter til kapitlet med tekst om du trenger mer kontekst.
          </P>
        </footer>
      </main>
    </div>
  );
}
