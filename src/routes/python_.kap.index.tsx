import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { PYTHON_CHAPTERS } from "@/lib/learn/pythonChapters";
import { BookOpen, Code2 } from "lucide-react";

export const Route = createFileRoute("/python_/kap/")({
  head: () => ({
    meta: [
      { title: "Python-kapitler — SQL Sandbox" },
      {
        name: "description",
        content:
          "Originale, korte kapittel-sider for Python: variabler, løkker, funksjoner, klasser, rekursjon og mer — med egne SVG-figurer.",
      },
    ],
  }),
  component: ChapterIndex,
});

function ChapterIndex() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            Lærestoff
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            Python-kapitler
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Korte, originale kapittel-sider med egne figurer. Bygd som
            supplement til drag-oppgavene og Python-sandkassa.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {PYTHON_CHAPTERS.map((ch) => (
            <Link
              key={ch.nr}
              to="/python/kap/$nr"
              params={{ nr: String(ch.nr) }}
              className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-brand/60 hover:bg-accent/30"
            >
              <div className="flex items-center justify-between mb-1.5">
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                  Kap. {ch.nr}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  ~{ch.readMinutes} min
                </span>
              </div>
              <div className="font-semibold tracking-tight group-hover:text-brand">
                {ch.title}
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {ch.summary}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-border bg-muted/30 p-4 text-sm">
          <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Code2 className="h-3.5 w-3.5" />
            Slik henger ting sammen
          </div>
          <ul className="space-y-1.5 text-foreground/90 text-sm">
            <li>
              <strong>Kapittel-sidene</strong> (her) — kort forklaring + figurer
              for hver hovedidé.
            </li>
            <li>
              <Link to="/drag" className="text-brand underline">
                Drag-oppgaver
              </Link>{" "}
              — match, ordne og fyll inn for å feste begrepene.
            </li>
            <li>
              <Link to="/python" className="text-brand underline">
                Python-sandkassen
              </Link>{" "}
              — skriv kode rett i nettleseren (kjører via Pyodide).
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
