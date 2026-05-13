import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { FLASHCARDS } from "@/lib/learn/flashcards";
import { DRAG_EXERCISES } from "@/lib/learn/dragExercises";
import { JOIN_EXERCISES } from "@/lib/learn/joinExercises";
import { Layers, Move, GitMerge, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Lær — SQL Sandbox" },
      {
        name: "description",
        content:
          "Repetisjonskort, drag-oppgaver og visuelle JOIN-øvelser for eksamen i databaser.",
      },
    ],
  }),
  component: LearnHub,
});

function LearnHub() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Lær til eksamen</h1>
          <p className="text-muted-foreground mt-2">
            Tre måter å øve på som utfyller SQL-spørringene under <em>Practice</em>: repetisjonskort
            for begreper, drag-oppgaver for å koble og sortere, og en visuell JOIN-utforsker.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <ModeCard
            to="/cards"
            icon={<Layers className="h-5 w-5 text-brand" />}
            title="Repetisjonskort"
            count={`${FLASHCARDS.length} kort`}
            description="Tre moduser: quiz med svaralternativer, blaing gjennom alle kort, og spaced repetition (FSRS) som planlegger neste repetisjon for deg."
            accent="brand"
          />
          <ModeCard
            to="/drag"
            icon={<Move className="h-5 w-5 text-success" />}
            title="Drag-oppgaver"
            count={`${DRAG_EXERCISES.length} oppgaver`}
            description="Koble par, sortér klausuler i evalueringsrekkefølge, fyll inn manglende SQL-nøkkelord."
            accent="success"
          />
          <ModeCard
            to="/joins"
            icon={<GitMerge className="h-5 w-5 text-warning" />}
            title="Visuelle JOIN-oppgaver"
            count={`${JOIN_EXERCISES.length} scenarier`}
            description="Se to tabeller side om side. Bytt mellom INNER, LEFT, RIGHT og FULL JOIN og se nøyaktig hvilke rader hver type produserer."
            accent="warning"
          />
        </div>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Hvor passer dette inn?</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">Practice / Exam:</strong> skriv ekte SQL-spørringer
              mot et e-handels- eller utleiedatasett. Best når du allerede kan syntaksen.
            </li>
            <li>
              <strong className="text-foreground">Cards:</strong> hurtigrepetisjon før eksamen — det
              du «bare må kunne».
            </li>
            <li>
              <strong className="text-foreground">Drag:</strong> trener mønstergjenkjenning og
              riktig rekkefølge uten at du må huske hver bokstav.
            </li>
            <li>
              <strong className="text-foreground">Joins:</strong> forstå <em>hva</em> hver JOIN-type
              faktisk gjør — visuelt, før du skriver dem i SQL.
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

function ModeCard({
  to,
  icon,
  title,
  count,
  description,
  accent,
}: {
  to: "/cards" | "/drag" | "/joins";
  icon: React.ReactNode;
  title: string;
  count: string;
  description: string;
  accent: "brand" | "success" | "warning";
}) {
  const borderClass =
    accent === "brand"
      ? "hover:border-brand/50"
      : accent === "success"
        ? "hover:border-success/50"
        : "hover:border-warning/50";
  return (
    <Link
      to={to}
      className={`group rounded-xl border border-border bg-card p-5 transition-colors ${borderClass}`}
    >
      <div className="flex items-center justify-between mb-3">
        {icon}
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {count}
        </span>
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
      <div className="mt-4 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
        Start
        <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}
