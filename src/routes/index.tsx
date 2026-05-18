import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { LibraryGrid } from "@/components/library/LibraryGrid";
import { ArrowRight, Sparkles, BookOpen, Target } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Læringsplattform — lek, lær og test deg selv" },
      {
        name: "description",
        content:
          "Interaktive simulatorer, mini-kurs og øvinger som kjører lokalt i nettleseren. Statistikk, ML, databaser, nettverk og mer.",
      },
      {
        property: "og:title",
        content: "Læringsplattform — lek, lær og test deg selv",
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
        <section className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Lek, lær og test deg selv.
          </h1>
          <p className="mt-2 text-base text-muted-foreground max-w-2xl">
            Interaktive simulatorer, mini-kurs og øvinger som kjører rett i
            nettleseren. Velg en modus eller bla i biblioteket under.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
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
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight mb-3">
            Bla i biblioteket
          </h2>
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
