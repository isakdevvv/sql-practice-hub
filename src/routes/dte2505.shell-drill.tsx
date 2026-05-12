import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { ShellDrill } from "@/components/dte2505/ShellDrill";

export const Route = createFileRoute("/dte2505/shell-drill")({
  head: () => ({
    meta: [
      { title: "Shell-drill — DTE-2505 Operativsystemer" },
      {
        name: "description",
        content:
          "30+ scenarier hvor du skriver shell-kommandoer for find, chmod, ps, systemctl, tar og bash-script. For DTE-2505 obliger.",
      },
    ],
  }),
  component: ShellDrillPage,
});

function ShellDrillPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/stack" className="hover:text-foreground">Stack</Link>
          <span>/</span>
          <Link to="/stack/$slug" params={{ slug: "dte-2505" }} className="hover:text-foreground">
            DTE-2505
          </Link>
          <span>/</span>
          <span className="text-foreground">Shell-drill</span>
        </div>
      </div>
      <ShellDrill />
    </div>
  );
}
