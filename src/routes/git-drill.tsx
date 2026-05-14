import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { GitTerminal } from "@/components/git/GitTerminal";

export const Route = createFileRoute("/git-drill")({
  head: () => ({
    meta: [
      { title: "Git-drill — simulert terminal for git-øving" },
      {
        name: "description",
        content:
          "18+ scenarier for git: init, add, commit, branch, merge, reset. Skriv kommandoer i en simulert terminal — alt kjører lokalt, ingen ekte git.",
      },
    ],
  }),
  component: GitDrillPage,
});

function GitDrillPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Hjem</Link>
          <span>/</span>
          <Link to="/ov" className="hover:text-foreground">Øv</Link>
          <span>/</span>
          <span className="text-foreground">Git-drill</span>
        </div>
      </div>
      <GitTerminal />
    </div>
  );
}
