import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PYTHON_CHAPTERS, findChapter } from "@/lib/learn/pythonChapters";
import { ChevronLeft, ChevronRight, BookOpen, ListChecks, Terminal } from "lucide-react";
import { findWorkspace } from "@/lib/python/chapterWorkspaces";

export const Route = createFileRoute("/python_/kap/$nr")({
  head: ({ params }) => {
    const ch = findChapter(parseInt(params.nr, 10));
    return {
      meta: [
        { title: ch ? `Kap. ${ch.nr}: ${ch.title} — Python` : "Python-kapittel" },
        { name: "description", content: ch?.summary ?? "Python-kapittel" },
      ],
    };
  },
  component: ChapterPage,
});

function ChapterPage() {
  const { nr } = useParams({ from: "/python_/kap/$nr" });
  const nrNum = parseInt(nr, 10);
  const chapter = findChapter(nrNum);

  if (!chapter) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container mx-auto px-4 py-10 max-w-3xl">
          <h1 className="text-xl font-semibold">Kapittel ikke funnet</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Kapittel {nr} finnes ikke ennå. Gå tilbake til{" "}
            <Link to="/python/kap" className="text-brand underline">
              kapitteloversikten
            </Link>
            .
          </p>
        </main>
      </div>
    );
  }

  // Neighbor chapters for prev/next
  const idx = PYTHON_CHAPTERS.findIndex((c) => c.nr === chapter.nr);
  const prev = idx > 0 ? PYTHON_CHAPTERS[idx - 1] : null;
  const next = idx < PYTHON_CHAPTERS.length - 1 ? PYTHON_CHAPTERS[idx + 1] : null;
  const dragHref = `/drag?fag=python&kap=${chapter.nr}`;
  const hasIdeWorkspace = !!findWorkspace(chapter.nr);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Link to="/python/kap" className="hover:text-foreground">
            Python-kapitler
          </Link>
          <span>/</span>
          <span className="text-foreground">Kap. {chapter.nr}</span>
        </nav>

        <header className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              Kap. {chapter.nr}
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              ~{chapter.readMinutes} min lesing
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{chapter.title}</h1>
          <p className="text-sm text-muted-foreground mt-1.5">{chapter.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/python_/ide/$nr" params={{ nr: String(chapter.nr) }}>
              <Button size="sm">
                <Terminal className="h-3.5 w-3.5 mr-1.5" />
                Åpne mini-IDE{hasIdeWorkspace ? "" : " (fri-modus)"}
              </Button>
            </Link>
            <Link to="/python">
              <Button variant="outline" size="sm">
                <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                Kjør Python-oppgaver
              </Button>
            </Link>
            <a href={dragHref}>
              <Button variant="outline" size="sm">
                <ListChecks className="h-3.5 w-3.5 mr-1.5" />
                Drag-oppgaver for kap. {chapter.nr}
              </Button>
            </a>
          </div>
        </header>

        <article className="prose-tight text-[15px]">{chapter.body}</article>

        <footer className="mt-10 pt-6 border-t border-border flex items-center justify-between gap-2">
          {prev ? (
            <Link to="/python/kap/$nr" params={{ nr: String(prev.nr) }}>
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Kap. {prev.nr}: {prev.title}
              </Button>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to="/python/kap/$nr" params={{ nr: String(next.nr) }}>
              <Button variant="ghost" size="sm">
                Kap. {next.nr}: {next.title}
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          ) : (
            <span />
          )}
        </footer>
      </main>
    </div>
  );
}
