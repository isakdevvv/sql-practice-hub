import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { LibraryGrid } from "@/components/library/LibraryGrid";

export const Route = createFileRoute("/laer")({
  head: () => ({
    meta: [
      { title: "Lær — mini-kurs og lineære løp" },
      {
        name: "description",
        content:
          "Mini-kurs og guidede løp gjennom emner — fra statistikk og ML til nettverk, OS og databaser.",
      },
    ],
  }),
  component: LaerPage,
});

function LaerPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Lær</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mini-kurs i lineære løp. Hver er bygget kapittel for kapittel —
            les fra start eller hopp dit du vil.
          </p>
        </header>
        <LibraryGrid kind="laer" />
      </div>
    </div>
  );
}
