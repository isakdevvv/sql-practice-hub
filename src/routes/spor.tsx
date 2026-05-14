import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Layers } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { TRACKS, type Track } from "@/lib/learn/tracks";

export const Route = createFileRoute("/spor")({
  head: () => ({
    meta: [
      { title: "Spor — sammenkoblede læringsstier" },
      {
        name: "description",
        content:
          "Velg framework og få en curert sti gjennom stack-sider og Python-oppgaver — fra HTML til ferdig app.",
      },
    ],
  }),
  component: SporPage,
});

const COLOR_CLASSES: Record<Track["color"], { border: string; bg: string; text: string }> = {
  brand: { border: "border-brand/40", bg: "bg-brand/5", text: "text-brand" },
  success: {
    border: "border-success/40",
    bg: "bg-success/5",
    text: "text-success",
  },
  warning: {
    border: "border-warning/40",
    bg: "bg-warning/5",
    text: "text-warning",
  },
  destructive: {
    border: "border-destructive/40",
    bg: "bg-destructive/5",
    text: "text-destructive",
  },
  purple: {
    border: "border-purple-500/40",
    bg: "bg-purple-500/5",
    text: "text-purple-600 dark:text-purple-300",
  },
};

function SporPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Læringsspor
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Velg framework, få en sammenhengende sti
          </h1>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            En data-ingeniør trenger flere stacker. Stack-sidene og oppgavene under{" "}
            <Link to="/lar" className="text-brand hover:underline">/lar</Link> dekker mye, men det
            kan være vanskelig å se hvilken rekkefølge man bør ta dem i. Her er fire curerte
            spor — hvert med stack-sider for teori, oppgaver for hands-on, og et capstone-prosjekt
            til slutt.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {TRACKS.map((track) => {
            const c = COLOR_CLASSES[track.color];
            const totalSteps = track.sections.reduce((sum, s) => sum + s.steps.length, 0);
            return (
              <Link
                key={track.id}
                to="/spor/$slug"
                params={{ slug: track.id }}
                className={`group rounded-xl border ${c.border} ${c.bg} p-5 hover:bg-accent transition-colors`}
              >
                <div className={`text-[10px] uppercase tracking-wider font-semibold ${c.text} mb-1`}>
                  {track.sections.length} faser · {totalSteps} steg
                </div>
                <h2 className="text-lg font-semibold mb-2 group-hover:underline">{track.label}</h2>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{track.blurb}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {track.estimatedHours}
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    capstone: {track.capstoneStackSlug}
                  </span>
                </div>
                <div className="mt-3 flex items-center text-sm font-medium text-brand">
                  Åpne sporet <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">Tips:</strong> Spore-er er ikke sekvensielle —
          du kan starte hvilken som helst først. Men hvis du er ny, anbefales{" "}
          <strong>Flask + Bootstrap full-stack</strong> fordi det dekker mest grunnleggende
          web-stoff og hekter naturlig over til de andre.
        </div>
      </main>
    </div>
  );
}
