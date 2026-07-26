import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { LibraryGrid } from "@/components/library/LibraryGrid";

// Hele biblioteket på én side. Lek/Lær/Test er filter-chips her — ikke
// separate topp-nivåer. De gamle /lek-, /laer- og /test-rutene lever videre
// som direkte innganger til hver sin del.

export const Route = createFileRoute("/bibliotek")({
  head: () => ({
    meta: [
      { title: "Bibliotek — alt innhold på ett sted" },
      {
        name: "description",
        content:
          "Alt innhold i Kodeverkstedet samlet: kurs, simulatorer, oppgaver og drills. Filtrer på type, tema eller søk.",
      },
    ],
  }),
  component: BibliotekPage,
});

function BibliotekPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Bibliotek</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Alt innholdet på ett sted — kurs, simulatorer, oppgaver og drills. Filtrer på type eller
            tema, eller søk.
          </p>
        </header>
        <LibraryGrid />
      </div>
    </div>
  );
}
