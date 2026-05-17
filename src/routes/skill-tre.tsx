// Stub-hub for ferdighets-treet. Den fulle visualiseringen (graf-view) bygges
// av en annen agent. Her viser vi en kort intro + topp-anbefalinger fra
// recommender, og en CTA til diagnose hvis brukeren ikke har tatt den.

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { ArrowRight, Network, Sparkles } from "lucide-react";
import { getRecommendations, type Recommendation } from "@/lib/skill-tree/recommender";
import { hasCompletedDiagnose } from "@/lib/skill-tree/engine";

export const Route = createFileRoute("/skill-tre")({
  head: () => ({
    meta: [
      { title: "Skill-tre — kartet over hva du kan lære" },
      {
        name: "description",
        content:
          "Ferdighets-tre med prereqs, mastery og anbefalinger. Start med diagnose-pretesten, så bygges treet ut for deg.",
      },
    ],
  }),
  component: SkillTreePage,
});

function SkillTreePage() {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [diagnosed, setDiagnosed] = useState(false);

  useEffect(() => {
    setRecs(getRecommendations(5));
    setDiagnosed(hasCompletedDiagnose());
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Hjem</Link>
          <span>/</span>
          <span className="text-foreground">Skill-tre</span>
        </div>
      </div>

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/15 text-brand">
            <Network className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Skill-tre</h1>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl mb-6">
          Treet kartlegger ferdigheter på tvers av fagene — med prereqs, mastery
          og spaced repetition. Den fulle graf-visualiseringen kommer snart;
          inntil da finner du anbefalingene fra treet her.
        </p>

        {!diagnosed && (
          <div className="rounded-xl border border-brand/40 bg-brand/5 p-5 mb-6 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-brand shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-sm mb-1">
                Ta diagnose først
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Uten diagnose-pretesten vet vi ikke hvor du står. Den tar
                rundt 20 minutter og låser opp riktige anbefalinger.
              </p>
              <Link to="/diagnose">
                <Button size="sm">
                  Start diagnose
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        <h2 className="text-lg font-semibold mb-3">Anbefalt for deg</h2>
        {recs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ingen anbefalinger akkurat nå — kom igjen senere.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {recs.map((r, i) => (
              <RecCard key={`${r.type}-${r.skillId ?? i}`} rec={r} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function RecCard({ rec }: { rec: Recommendation }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col">
      <div className="text-[10px] font-bold uppercase tracking-wider text-brand mb-1">
        {labelFor(rec.type)}
      </div>
      <div className="font-semibold text-sm mb-1">{rec.title}</div>
      <p className="text-xs text-muted-foreground flex-1 mb-3">{rec.reason}</p>
      <a
        href={rec.cta.to}
        className="inline-flex items-center justify-center rounded-md bg-brand text-brand-foreground text-xs font-medium px-3 py-1.5 hover:bg-brand/90 transition-colors"
      >
        {rec.cta.label}
        <ArrowRight className="h-3 w-3 ml-1.5" />
      </a>
    </div>
  );
}

function labelFor(t: Recommendation["type"]): string {
  switch (t) {
    case "diagnose-first":
      return "Start her";
    case "next-unlock":
      return "Klar for læring";
    case "rusty-review":
      return "Frisk opp";
    case "weak-spot":
      return "Sjekk nivå";
  }
}
