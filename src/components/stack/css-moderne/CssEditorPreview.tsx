// Live CSS-editor med srcdoc-iframe-sandbox. Studenten redigerer CSS i en
// textarea og ser resultatet i en isolert iframe (200ms debounce). Valgfri
// width-toggle for å demonstrere responsive breakpoints uten å endre
// nettleser-vinduet. Samme isolasjon som CssLivePreview — sandbox="" hindrer
// scripts og forhindrer at iframe-CSS lekker ut til app-en eller motsatt.

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  /** Overskrift over preview-en. */
  title?: string;
  /** HTML-fragment som rendres i body. Statisk — ikke redigerbar. */
  html: string;
  /** Initial CSS som vises i textarea og kan tilbakestilles til. */
  initialCss: string;
  /** Iframe-høyde i px. Default 220. */
  height?: number;
  /** Instruksjons-tekst under preview-en. */
  hint?: string;
  /** Hvis satt: vis bredde-knapper som styrer iframe-bredden (mobile-first demo). */
  widthOptions?: number[];
}

export function CssEditorPreview({ title, html, initialCss, height = 220, hint, widthOptions }: Props) {
  const [css, setCss] = useState(initialCss);
  const [debouncedCss, setDebouncedCss] = useState(initialCss);
  const [width, setWidth] = useState<number | undefined>(
    widthOptions ? widthOptions[widthOptions.length - 1] : undefined,
  );

  useEffect(() => {
    const id = setTimeout(() => setDebouncedCss(css), 200);
    return () => clearTimeout(id);
  }, [css]);

  const srcdoc = useMemo(() => buildSrcdoc(html, debouncedCss), [html, debouncedCss]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden my-4">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center gap-3 flex-wrap">
        {title && (
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            {title}
          </span>
        )}
        <span className="text-[11px] text-muted-foreground">
          rediger CSS — preview oppdateres live (~200ms)
        </span>
        <button
          type="button"
          onClick={() => setCss(initialCss)}
          className="ml-auto text-[11px] text-brand hover:underline"
        >
          tilbakestill
        </button>
      </div>
      <div className="grid md:grid-cols-2">
        <textarea
          spellCheck={false}
          value={css}
          onChange={(e) => setCss(e.target.value)}
          className="font-mono text-[12px] leading-relaxed p-3 bg-background border-b md:border-b-0 md:border-r border-border outline-none resize-none focus:bg-muted/20 block w-full"
          style={{ minHeight: `${height}px`, height: `${height}px` }}
        />
        <div className="bg-white relative">
          {widthOptions && (
            <div className="absolute top-2 right-2 z-10 flex gap-1 bg-white/90 backdrop-blur px-1 py-0.5 rounded border border-border shadow-sm">
              {widthOptions.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWidth(w)}
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-mono",
                    w === width
                      ? "bg-brand text-white"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {w}px
                </button>
              ))}
            </div>
          )}
          <iframe
            title={title ?? "CSS editor preview"}
            srcDoc={srcdoc}
            sandbox=""
            className="block mx-auto"
            style={{
              width: width ? `${width}px` : "100%",
              maxWidth: "100%",
              height: `${height}px`,
              border: 0,
            }}
          />
        </div>
      </div>
      {hint && (
        <div className="border-t border-border bg-muted/20 px-4 py-2 text-[11px] text-muted-foreground">
          {hint}
        </div>
      )}
    </div>
  );
}

function buildSrcdoc(html: string, css: string): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; font: 14px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; color: #0f172a; }
  body { padding: 12px; background: #ffffff; }
${css}
</style>
</head>
<body>
${html}
</body>
</html>`;
}
