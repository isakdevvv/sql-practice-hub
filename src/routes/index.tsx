import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Target } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kodeverkstedet — lær og øv" },
      {
        name: "description",
        content: "To innganger: lær stoffet steg for steg, eller øv på akkurat det du vil.",
      },
      { property: "og:title", content: "Kodeverkstedet — lær og øv" },
      {
        property: "og:description",
        content: "To innganger: lær stoffet steg for steg, eller øv på akkurat det du vil.",
      },
    ],
  }),
  component: LandingPage,
});

// Forsiden har bare de to inngangene. Alt annet innhold nås gjennom dem
// eller gjennom søket i headeren.
function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Kodeverkstedet</h1>
        <p className="mt-2 text-muted-foreground">Hva vil du gjøre nå?</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Inngang
            to="/laer"
            icon={<BookOpen className="h-6 w-6" />}
            tittel="Lær"
            tekst="Velg fag og emne, og ta stoffet ett steg om gangen."
          />
          <Inngang
            to="/ov"
            icon={<Target className="h-6 w-6" />}
            tittel="Øv"
            tekst="Alle oppgaver, drills og kort i én liste. Filtrer på fag og type."
          />
        </div>
      </main>
    </div>
  );
}

function Inngang({
  to,
  icon,
  tittel,
  tekst,
}: {
  to: "/laer" | "/ov";
  icon: React.ReactNode;
  tittel: string;
  tekst: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-colors hover:border-brand"
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand/10 text-brand">
        {icon}
      </div>
      <h2 className="text-xl font-semibold">{tittel}</h2>
      <p className="mt-1 flex-1 text-sm text-muted-foreground">{tekst}</p>
      <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand">
        Åpne
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
