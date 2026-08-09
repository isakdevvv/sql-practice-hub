import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { MalShellDrill } from "@/components/dte2505/MalShellDrill";

export const Route = createFileRoute("/dte2505/mal-shell")({
  head: () => ({
    meta: [
      { title: "Måloppgaver med tilstandssjekk — DTE-2505 Operativsystemer" },
      {
        name: "description",
        content:
          "Skriv kommandoer som oppnår en tilstand: rettighetsbits, eierskap, umask og setgid sjekkes mot et mock-filsystem, ikke mot en tekststreng. Alle veier til målet godtas.",
      },
    ],
  }),
  component: MalShellSide,
});

function MalShellSide() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/stack" className="hover:text-foreground">
            Stack
          </Link>
          <span>/</span>
          <Link to="/stack/$slug" params={{ slug: "dte-2505" }} className="hover:text-foreground">
            DTE-2505
          </Link>
          <span>/</span>
          <span className="text-foreground">Måloppgaver</span>
        </div>
      </div>
      <MalShellDrill />
    </div>
  );
}
