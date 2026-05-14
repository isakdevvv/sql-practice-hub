import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { IdeView } from "@/components/python/IdeView";
import { findChapter } from "@/lib/learn/pythonChapters";
import { findWorkspace, fallbackWorkspace } from "@/lib/python/chapterWorkspaces";

export const Route = createFileRoute("/python_/ide/$nr")({
  head: ({ params }) => {
    const ch = findChapter(parseInt(params.nr, 10));
    return {
      meta: [
        { title: ch ? `Kap. ${ch.nr}: ${ch.title} — Mini-IDE` : "Mini-IDE" },
        {
          name: "description",
          content: "Skriv og kjør Python rett i nettleseren — editor, terminal og lesestoff i ett vindu.",
        },
      ],
    };
  },
  component: IdePage,
});

function IdePage() {
  const { nr } = useParams({ from: "/python_/ide/$nr" });
  const nrNum = parseInt(nr, 10);
  const chapter = findChapter(nrNum);
  const workspace = findWorkspace(nrNum) ?? fallbackWorkspace(nrNum);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      {!chapter && (
        <div className="container mx-auto px-4 py-2 text-xs text-muted-foreground">
          Fant ikke kapittel {nr}. Du kan fortsatt eksperimentere fritt nedenfor.{" "}
          <Link to="/python/kap" className="text-brand underline">
            Tilbake til kapittel-oversikten
          </Link>
          .
        </div>
      )}
      <IdeView workspace={workspace} chapter={chapter} />
    </div>
  );
}
