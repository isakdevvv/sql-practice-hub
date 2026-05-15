import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Layers } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { MINI_COURSES } from "@/lib/mini-kurs/courses";
import type { MiniCourse } from "@/lib/mini-kurs/types";

export const Route = createFileRoute("/mini-kurs/")({
  head: () => ({
    meta: [
      { title: "Mini-kurs — guidet sandkasse" },
      {
        name: "description",
        content:
          "Bygg ekte prosjekter trinn for trinn. Filer, mapper, editor, kjør-knapp — alt i nettleseren.",
      },
    ],
  }),
  component: MiniKursIndex,
});

const COLOR_BORDER: Record<MiniCourse["color"], string> = {
  brand: "border-brand/40 bg-brand/5",
  success: "border-success/40 bg-success/5",
  warning: "border-warning/40 bg-warning/5",
  purple: "border-purple-500/40 bg-purple-500/5",
};

function MiniKursIndex() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Mini-kurs · guidet sandkasse
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bygg ekte prosjekter — trinn for trinn
          </h1>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            Hvert kurs har en virtuell prosjekt-mappe med faktiske filer du redigerer i editoren.
            "Kjør"-knappen eksekverer prosjektet i Pyodide og viser om du har truffet målene. Ingen
            installasjon, ingen terminal — alt i nettleseren.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {MINI_COURSES.map((course) => (
            <Link
              key={course.id}
              to="/mini-kurs/$slug"
              params={{ slug: course.slug }}
              className={`group rounded-xl border ${
                COLOR_BORDER[course.color]
              } p-5 hover:bg-accent transition-colors`}
            >
              <div className="text-[10px] uppercase tracking-wider font-semibold text-brand mb-1">
                {course.lessons.length} leksjoner
              </div>
              <h2 className="text-lg font-semibold mb-2 group-hover:underline">
                {course.title}
              </h2>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                {course.blurb}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {course.estimertTid}
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  {course.fag.join(" · ")}
                </span>
              </div>
              <div className="mt-3 flex items-center text-sm font-medium text-brand">
                Start kurset{" "}
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">Hvordan det fungerer:</strong> Filer du endrer
          lagres lokalt i nettleseren — du kan komme tilbake senere og fortsette der du var.
          Klikk "Tilbakestill"-knappen ved editoren for å starte leksjonen på nytt.
        </div>
      </main>
    </div>
  );
}
