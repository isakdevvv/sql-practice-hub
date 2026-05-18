import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { LibraryGrid } from "@/components/library/LibraryGrid";

export const Route = createFileRoute("/lek")({
  head: () => ({
    meta: [
      { title: "Lek — interaktive simulatorer og sandkasser" },
      {
        name: "description",
        content:
          "Lek deg gjennom interaktive simulatorer: statistikk, ML, nevrale nett, kryptografi, SQL og mer. Klikk, dra og se hva som skjer.",
      },
    ],
  }),
  component: LekPage,
});

function LekPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Lek</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Interaktive simulatorer og sandkasser. Dra parametere, klikk
            elementer, se hvordan ting endrer seg.
          </p>
        </header>
        <LibraryGrid kind="lek" />
      </div>
    </div>
  );
}
