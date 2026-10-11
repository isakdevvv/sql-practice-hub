// Editbar HTML-sandbox med live srcdoc-iframe-preview. Studenten skriver HTML,
// ser nettsiden renderes med 200ms debounce — uten å forlate kurssiden.
//
// Speiler buildSrcdoc-mønsteret fra CssLivePreview, men gjør HTML-en redigerbar
// så studenten kan eksperimentere med tags, attributter og struktur.

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  /** Start-HTML. */
  initial: string;
  /** Iframe-høyde i px. */
  height?: number;
  /** Overskrift over preview. */
  title?: string;
  /** Hint vist under editor (én linje). */
  hint?: string;
}

export function HtmlSandbox({ initial, height = 200, title, hint }: Props) {
  const [code, setCode] = useState(initial.trimEnd());
  const [debounced, setDebounced] = useState(code);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(code), 200);
    return () => clearTimeout(t);
  }, [code]);

  const srcdoc = useMemo(() => buildSrcdoc(debounced), [debounced]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden my-4">
      {title && (
        <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            {title}
          </span>
          <button
            type="button"
            onClick={() => setCode(initial.trimEnd())}
            className="text-[11px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
          >
            tilbakestill
          </button>
        </div>
      )}
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        <div className="bg-background">
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border bg-muted/20">
            HTML
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className={cn(
              "w-full font-mono text-xs p-3 bg-background text-foreground",
              "outline-none resize-none border-0",
            )}
            style={{ height: `${height}px` }}
          />
        </div>
        <div className="bg-white">
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border bg-muted/20">
            Rendret
          </div>
          <iframe
            title={title ?? "HTML preview"}
            srcDoc={srcdoc}
            sandbox=""
            className="w-full block bg-white"
            style={{ height: `${height}px`, border: 0 }}
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

function buildSrcdoc(html: string): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; font: 14px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; color: #0f172a; }
  body { padding: 12px; background: #ffffff; }
</style>
</head>
<body>
${html}
</body>
</html>`;
}
