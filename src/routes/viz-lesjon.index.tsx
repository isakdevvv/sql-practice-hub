import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { LESSONS } from "@/lib/viz-lesjon";

export const Route = createFileRoute("/viz-lesjon/")({
  head: () => ({
    meta: [
      { title: "Stegvise lesjoner — visualisering" },
      {
        name: "description",
        content:
          "Korte interaktive lesjoner hvor hver eksempel-kode kjøres stegvis, slik at du ser minnet endre seg.",
      },
    ],
  }),
  component: VizLesjonIndex,
});

function VizLesjonIndex() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-3">
            Lesjon
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Stegvise lesjoner
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Korte, fokuserte lesjoner hvor hver kodeeksempel <i>spilles av</i> linje
            for linje — du ser variablene endre seg, iteratoren gli over iterablen,
            og logikken folde seg ut foran deg.
          </p>
        </div>

        <ul className="space-y-3">
          {LESSONS.map((l) => (
            <li key={l.slug}>
              <Link
                to="/viz-lesjon/$slug"
                params={{ slug: l.slug }}
                className="block rounded-xl border border-border bg-card hover:border-brand/50 hover:shadow-sm transition-all p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-foreground">
                      {l.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {l.blurb}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        ≈ {l.estMinutes} min
                      </span>
                      <span className="font-mono opacity-70">/{l.slug}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
