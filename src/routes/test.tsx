import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { LibraryGrid } from "@/components/library/LibraryGrid";

export const Route = createFileRoute("/test")({
  head: () => ({
    meta: [
      { title: "Test — oppgaver, drill og flashcards" },
      {
        name: "description",
        content:
          "Test deg selv: SQL-oppgaver, kode-puslespill, flashcards, Git-drill og mer.",
      },
    ],
  }),
  component: TestPage,
});

function TestPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Test</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aktiv øving — oppgaver, drag-and-drop, flashcards og drills.
            Velg formatet som passer humøret.
          </p>
        </header>
        <LibraryGrid kind="test" />
      </div>
    </div>
  );
}
