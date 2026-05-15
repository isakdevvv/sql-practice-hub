import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { MacDrill } from "@/components/mac/MacDrill";

export const Route = createFileRoute("/mac-drill")({
  head: () => ({
    meta: [
      { title: "Mac-automatisering — AppleScript, Shortcuts, terminal" },
      {
        name: "description",
        content:
          "Lær Mac-automatisering: AppleScript, Shortcuts, Automator og terminal-automatisering (osascript, defaults, launchd). Tutorial + øvelser med pattern-sjekk.",
      },
    ],
  }),
  component: MacDrillPage,
});

function MacDrillPage() {
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
          <span className="text-foreground">Mac-automatisering</span>
        </div>
      </div>
      <MacDrill />
    </div>
  );
}
