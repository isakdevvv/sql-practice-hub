import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Layers, Lock } from "lucide-react";
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

/**
 * Grupper kursene per primær-fag (første element i `fag`-arrayet) og sorter
 * innen hver gruppe slik at forutsetningene kommer først. Topologisk sort
 * basert på `forutsetninger`, med `rekkefolge` (default 100) som tiebreaker.
 */
function grupperOgSorter(courses: readonly MiniCourse[]): Array<{ fag: string; kurs: MiniCourse[] }> {
  const byFag = new Map<string, MiniCourse[]>();
  for (const c of courses) {
    const fag = c.fag[0] ?? "Andre";
    if (!byFag.has(fag)) byFag.set(fag, []);
    byFag.get(fag)!.push(c);
  }

  const grupper: Array<{ fag: string; kurs: MiniCourse[] }> = [];
  for (const [fag, kurs] of byFag) {
    // Topologisk sort: a < b hvis a er forutsetning for b (direkte eller transitivt
    // innen gruppen). For større stabilitet bruker vi en enkel komparator som
    // bare ser på direkte forutsetninger — det holder for små grupper (<10 kurs).
    const sortert = [...kurs].sort((a, b) => {
      if (b.forutsetninger?.includes(a.slug)) return -1;
      if (a.forutsetninger?.includes(b.slug)) return 1;
      const ra = a.rekkefolge ?? 100;
      const rb = b.rekkefolge ?? 100;
      if (ra !== rb) return ra - rb;
      return a.title.localeCompare(b.title);
    });
    grupper.push({ fag, kurs: sortert });
  }

  // Sorter gruppene: kjente fag-koder først (DTE-2501 før DTE-2502...), så alfabetisk
  grupper.sort((a, b) => a.fag.localeCompare(b.fag));
  return grupper;
}

function MiniKursIndex() {
  const grupper = grupperOgSorter(MINI_COURSES);
  // Bygg slug → kurs-titler for forutsetnings-rendering
  const slugTilTittel = new Map(MINI_COURSES.map((c) => [c.slug, c.title]));

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
          <p className="text-muted-foreground mt-2 text-sm">
            Kursene er sortert i anbefalt rekkefølge innen hvert fag. Et kurs med
            <Lock className="inline h-3 w-3 mx-1 align-text-bottom" />
            -markør bygger på et tidligere kurs — ta forutsetningen først for best læringsutbytte.
          </p>
        </div>

        {grupper.map(({ fag, kurs }) => (
          <section key={fag} className="mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {fag}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {kurs.map((course, idx) => (
                <Link
                  key={course.id}
                  to="/mini-kurs/$slug"
                  params={{ slug: course.slug }}
                  className={`group rounded-xl border ${
                    COLOR_BORDER[course.color]
                  } p-5 hover:bg-accent transition-colors relative`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-brand">
                      Trinn {idx + 1} · {course.lessons.length} leksjoner
                    </div>
                    {course.forutsetninger && course.forutsetninger.length > 0 && (
                      <Lock
                        className="h-3 w-3 text-muted-foreground"
                        aria-label={`Forutsetning: ${course.forutsetninger
                          .map((s) => slugTilTittel.get(s) ?? s)
                          .join(", ")}`}
                      />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:underline">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {course.blurb}
                  </p>
                  {course.forutsetninger && course.forutsetninger.length > 0 && (
                    <div className="text-xs text-muted-foreground mb-2 italic">
                      Etter:{" "}
                      {course.forutsetninger
                        .map((s) => slugTilTittel.get(s) ?? s)
                        .join(", ")}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.estimertTid}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      {course.fag.slice(1).join(" · ") || "—"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center text-sm font-medium text-brand">
                    Start kurset{" "}
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">Hvordan det fungerer:</strong> Filer du endrer
          lagres lokalt i nettleseren — du kan komme tilbake senere og fortsette der du var.
          Klikk "Tilbakestill"-knappen ved editoren for å starte leksjonen på nytt.
        </div>
      </main>
    </div>
  );
}
