import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { LinuxDrill } from "@/components/linux/LinuxDrill";

export const Route = createFileRoute("/linux-drill")({
  head: () => ({
    meta: [
      { title: "Linux-drill — kommandolinje i stigende vanskelighet" },
      {
        name: "description",
        content:
          "Øv på Linux-kommandolinjen i ti topics: navigasjon, filer, lesing/søk, permissions, pipes, tekstprosessering, prosesser, systemd, nettverk/SSH og bash-scripting. Lær-først eller test-deg-selv med pattern-validering.",
      },
    ],
  }),
  component: LinuxDrillPage,
});

function LinuxDrillPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Hjem
          </Link>
          <span>/</span>
          <Link to="/ov" className="hover:text-foreground">
            Øv
          </Link>
          <span>/</span>
          <span className="text-foreground">Linux-drill</span>
        </div>
      </div>
      <LinuxDrill />
    </div>
  );
}
