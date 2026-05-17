// Placeholder-rute for ferdighets-diagnose. Den ekte diagnose-flyten
// leveres av en annen agent; denne stubben sørger for at recommender-CTA
// ("Start diagnose") ikke gir 404, og at en bruker kan markere diagnose
// som tatt for å låse opp anbefalings-systemet på "ekte" modus.

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, CheckCircle2 } from "lucide-react";
import { hasCompletedDiagnose, markDiagnoseCompleted } from "@/lib/skill-tree/engine";

export const Route = createFileRoute("/diagnose")({
  head: () => ({
    meta: [
      { title: "Ferdighets-diagnose — kartlegg hva du kan" },
      {
        name: "description",
        content:
          "20-minutters ferdighets-diagnose som kartlegger hva du kan, så anbefalings-systemet kan foreslå riktig nivå.",
      },
    ],
  }),
  component: DiagnosePage,
});

function DiagnosePage() {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDone(hasCompletedDiagnose());
  }, []);

  function startStub() {
    // Placeholder — sett ferdig-flagg så anbefalingene kan slå inn.
    markDiagnoseCompleted();
    setDone(true);
  }

  function goDashboard() {
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Hjem</Link>
          <span>/</span>
          <span className="text-foreground">Diagnose</span>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="rounded-2xl border-2 border-brand/40 bg-gradient-to-br from-brand/10 via-card to-card p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/20 text-brand">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-brand">
                Ferdighets-diagnose
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                Kartlegg hva du kan
              </h1>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Diagnose-flyten er under utvikling — den fullstendige 20-minutters
            testen kommer snart. I mellomtiden kan du markere diagnose som tatt,
            så slår anbefalings-systemet inn med default-estimater og du får
            forslag basert på prereqs og fag-områder.
          </p>

          {done ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Diagnose markert som ferdig. Anbefalingene er aktivert.
              </div>
              <Button onClick={goDashboard} className="w-full">
                Se anbefalingene på dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          ) : (
            <Button onClick={startStub} className="w-full">
              Marker diagnose som tatt (placeholder)
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
