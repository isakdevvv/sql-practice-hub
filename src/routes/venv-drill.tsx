import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { VenvTerminal } from "@/components/venv/VenvTerminal";

export const Route = createFileRoute("/venv-drill")({
  head: () => ({
    meta: [
      { title: "Venv-drill — simulert terminal for Python venv og pip" },
      {
        name: "description",
        content:
          "15 scenarier for Python virtuelle miljø: lag venv, aktiver, pip install, requirements.txt, ModuleNotFoundError. Skriv kommandoer i en simulert terminal — ingen ekte python, alt kjører lokalt.",
      },
    ],
  }),
  component: VenvDrillPage,
});

function VenvDrillPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Hjem</Link>
          <span>/</span>
          <Link to="/ov" className="hover:text-foreground">Øv</Link>
          <span>/</span>
          <span className="text-foreground">Venv-drill</span>
        </div>
      </div>
      <VenvTerminal />
    </div>
  );
}
