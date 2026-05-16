import { createFileRoute } from "@tanstack/react-router";
import {
  Component as ReactComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ComponentType, ErrorInfo, ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import * as Figures from "@/components/learn/python-figures/PythonFigures";

/**
 * Intern utvikler-side: `/python/_figures`
 *
 * Rendrer hver eksporterte figur fra `PythonFigures.tsx` i et grid med
 * navn over. Brukes for å:
 *  - se hvilke figurer som finnes (unngå duplisering)
 *  - visuelt regresjonsteste etter endringer i filen
 *  - finne overflow/overlap-problemer i én skjerm
 *
 * Underscore-prefiks i URL signaliserer "dev-tool, ikke for sluttbrukere".
 * TanStack-router behandler ikke `_figures` som pathless layout fordi det
 * er et helt segment-navn (ikke bare `_`).
 */
export const Route = createFileRoute("/python_/_figures")({
  head: () => ({
    meta: [
      { title: "Python-figurer (intern indeks) — SQL Sandbox" },
      {
        name: "description",
        content:
          "Intern utvikler-side som rendrer alle eksporterte SVG-figurer fra PythonFigures.tsx i et grid for visuell oversikt og regresjon.",
      },
    ],
  }),
  component: PythonFiguresIndexPage,
});

/** En oppdaget figur — komponentnavn + komponent. */
type DiscoveredFigure = {
  name: string;
  Component: ComponentType<Record<string, never>>;
};

/**
 * Plukker ut alle React-komponenter (funksjon med PascalCase-navn) fra wildcard-
 * imported modul. Auto-inkluderer nye figurer ettersom de legges til.
 */
function discoverFigures(): DiscoveredFigure[] {
  return Object.entries(Figures)
    .filter(
      ([name, value]) =>
        typeof value === "function" && /^[A-Z]/.test(name),
    )
    .map(([name, value]) => ({
      name,
      Component: value as ComponentType<Record<string, never>>,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function PythonFiguresIndexPage() {
  const figures = useMemo(() => discoverFigures(), []);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return figures;
    return figures.filter((f) => f.name.toLowerCase().includes(q));
  }, [figures, query]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <span className="rounded-sm border border-warning/40 bg-warning/10 px-1.5 py-0.5 text-warning">
              dev-tool
            </span>
            <span>intern indeks</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Python-figurer
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Alle {figures.length} eksporterte figurer fra{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
              src/components/learn/python-figures/PythonFigures.tsx
            </code>
            . Auto-oppdaget via wildcard-import — nye figurer dukker opp her uten
            kodeendring.
          </p>
        </header>

        <div className="sticky top-0 z-10 -mx-4 mb-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex flex-1 min-w-[240px] items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Filter
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Søk etter figurnavn (f.eks. Scope, Hash, BST)"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-xs text-muted-foreground hover:text-foreground"
                  aria-label="Tøm filter"
                >
                  ✕
                </button>
              )}
            </label>
            <div className="text-xs text-muted-foreground tabular-nums">
              {filtered.length} / {figures.length} viste
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            Ingen figurer matcher{" "}
            <code className="rounded bg-muted px-1 py-0.5">{query}</code>.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((fig) => (
              <FigureCard key={fig.name} name={fig.name} Component={fig.Component} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * Ett kort som rendrer én figur. Måler den indre SVG-en etter mount for å
 * advare om text-overflow av viewBox (heuristisk, "nice-to-have").
 */
function FigureCard({
  name,
  Component,
}: {
  name: string;
  Component: ComponentType<Record<string, never>>;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [overflow, setOverflow] = useState<null | { axis: string; over: number }>(null);

  useEffect(() => {
    if (!ref.current) return;
    // Vent litt slik at SVG-tekstene er målbare (getBBox krever at elementene
    // er i DOM og rendrert med faktiske glyph-metrikker).
    const t = window.setTimeout(() => {
      try {
        const svgs = ref.current?.querySelectorAll<SVGSVGElement>("svg[viewBox]");
        if (!svgs || svgs.length === 0) return;
        const flagged: Array<{ axis: string; over: number }> = [];
        for (const svg of Array.from(svgs)) {
          const vb = svg.viewBox.baseVal;
          if (!vb || vb.width === 0 || vb.height === 0) continue;
          const texts = svg.querySelectorAll<SVGTextElement>("text");
          for (const txt of Array.from(texts)) {
            try {
              const bb = txt.getBBox();
              const overX = bb.x + bb.width - (vb.x + vb.width);
              const overY = bb.y + bb.height - (vb.y + vb.height);
              if (overX > 1) flagged.push({ axis: "x", over: overX });
              if (overY > 1) flagged.push({ axis: "y", over: overY });
              if (bb.x < vb.x - 1) flagged.push({ axis: "x", over: vb.x - bb.x });
              if (bb.y < vb.y - 1) flagged.push({ axis: "y", over: vb.y - bb.y });
            } catch {
              // getBBox kaster om elementet ikke er synlig — ignorer.
            }
          }
        }
        if (flagged.length > 0) {
          const worst = flagged.reduce((a, b) => (a.over > b.over ? a : b));
          setOverflow({ axis: worst.axis, over: Math.round(worst.over) });
        }
      } catch {
        // Stille feil — overflow-detektering er nice-to-have, ikke kritisk.
      }
    }, 80);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section className="flex flex-col rounded-lg border border-border bg-card p-3 shadow-sm">
      <header className="mb-2 flex items-center justify-between gap-2 border-b border-border/60 pb-2">
        <code className="text-xs font-semibold tracking-tight">{name}</code>
        {overflow && (
          <span
            className="rounded-sm border border-warning/50 bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-warning"
            title={`Tekst stikker ut ${overflow.over}px på ${overflow.axis}-aksen utenfor SVG-viewBox`}
          >
            overflow {overflow.axis}+{overflow.over}px
          </span>
        )}
      </header>
      <div ref={ref} className="flex-1 overflow-hidden">
        <FigureErrorBoundary name={name}>
          <Component />
        </FigureErrorBoundary>
      </div>
    </section>
  );
}

/**
 * Lokal mini-errorboundary slik at én sprengt figur ikke tar ned hele indeksen.
 */
class FigureErrorBoundary extends ReactComponent<
  { name: string; children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error(`[PythonFigures] ${this.props.name} kastet:`, error);
  }

  render() {
    if (this.state.error) {
      return (
        <pre className="rounded-sm border border-destructive/40 bg-destructive/5 p-2 text-[10px] text-destructive whitespace-pre-wrap">
          Render-feil: {this.state.error.message}
        </pre>
      );
    }
    return this.props.children;
  }
}
