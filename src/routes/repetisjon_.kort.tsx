import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SamletKortKo } from "@/components/learn/SamletKortKo";

export const Route = createFileRoute("/repetisjon_/kort")({
  head: () => ({
    meta: [
      { title: "Modulkort — én repetisjonskø for alle fag" },
      {
        name: "description",
        content:
          "Recall-kortene fra alle modulene i én felles FSRS-kø på tvers av fag, slik at moduler du var ferdig med i august fortsatt dukker opp i desember.",
      },
    ],
  }),
  component: KortKoSide,
});

function KortKoSide() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto flex items-center gap-2 px-4 py-4 text-sm text-muted-foreground">
          <Link to="/repetisjon" className="hover:text-foreground">
            Due i dag
          </Link>
          <span>/</span>
          <span className="text-foreground">Modulkort</span>
        </div>
      </div>
      <SamletKortKo />
    </div>
  );
}
