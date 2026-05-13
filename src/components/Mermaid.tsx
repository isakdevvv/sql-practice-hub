import { useEffect, useId, useRef, useState } from "react";

type MermaidProps = {
  /** Mermaid kildetekst — f.eks. "graph TD\n  A --> B" */
  chart: string;
  /** Valgfri className på ytre wrapper. */
  className?: string;
  /** Tekst som vises mens diagrammet lastes / under SSR. Default: rå Mermaid-kilde i <pre>. */
  fallback?: React.ReactNode;
  /** Aria-etikett for diagrammet (for skjermlesere). */
  ariaLabel?: string;
};

type MermaidModule = typeof import("mermaid").default;

let mermaidPromise: Promise<MermaidModule> | null = null;
let lastInitTheme: "light" | "dark" | null = null;

function readTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

async function getMermaid(theme: "light" | "dark"): Promise<MermaidModule> {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((mod) => mod.default);
  }
  const mermaid = await mermaidPromise;
  if (lastInitTheme !== theme) {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === "dark" ? "dark" : "default",
      securityLevel: "loose",
      fontFamily:
        "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    });
    lastInitTheme = theme;
  }
  return mermaid;
}

/**
 * Renderer Mermaid-diagrammer fra tekst.
 *
 * - SSR-trygg: rendrer kun på klient via useEffect.
 * - Dynamisk import av mermaid (~800 KB) — holder hovedbundle slank.
 * - Tema-aware: lytter på <html class="dark"> og re-rendrer.
 * - Mobile-vennlig: SVG skalerer ned via max-width: 100%.
 *
 * Usage:
 *   <Mermaid chart={`graph TD\n  A --> B`} />
 */
export function Mermaid({
  chart,
  className,
  fallback,
  ariaLabel,
}: MermaidProps) {
  const reactId = useId();
  // Mermaid krever en id som er gyldig CSS-selektor — useId() inneholder ':' i React 19.
  const chartId = `mmd-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() => readTheme());

  // Reager på theme-bytte ved å observere <html class>.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const sync = () => setTheme(readTheme());
    const observer = new MutationObserver(sync);
    observer.observe(html, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Render diagrammet.
  useEffect(() => {
    let cancelled = false;
    setError(null);

    (async () => {
      try {
        const mermaid = await getMermaid(theme);
        if (cancelled) return;
        const { svg: out } = await mermaid.render(chartId, chart);
        if (!cancelled) setSvg(out);
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : String(err);
          setError(msg);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, chartId, theme]);

  if (error) {
    return (
      <div
        className={`rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs ${className ?? ""}`}
      >
        <div className="font-semibold text-destructive mb-1">
          Kunne ikke rendre Mermaid-diagram
        </div>
        <pre className="whitespace-pre-wrap text-destructive/80">{error}</pre>
        <pre className="mt-2 whitespace-pre-wrap text-muted-foreground">
          {chart}
        </pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className={className} aria-busy="true" aria-label={ariaLabel}>
        {fallback ?? (
          <pre className="overflow-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">
            {chart}
          </pre>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel}
      className={`mermaid-diagram w-full overflow-x-auto [&>svg]:!max-w-full [&>svg]:h-auto ${className ?? ""}`}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export default Mermaid;
