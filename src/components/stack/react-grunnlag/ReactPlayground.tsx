// Live React-playground: studenten skriver JSX og ser komponenten renderet
// i en sandboxet iframe. React + ReactDOM + Babel lastes fra CDN INNE i
// iframen, så app-React holdes isolert og ingen ekstra npm-deps trengs.
//
// Konvensjon: kode må definere en funksjon `App` (eller `Component`) som
// returnerer JSX. Vi rendrer den på #root.

import { useEffect, useMemo, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  /** Initiell kode som vises i editor. */
  initialCode: string;
  /** Overskrift over playground. */
  title?: string;
  /** Iframe-høyde i px. */
  height?: number;
  /** Korte forslag til endringer studenten kan prøve. */
  hints?: string[];
}

export function ReactPlayground({ initialCode, title, height = 240, hints }: Props) {
  const [code, setCode] = useState(initialCode);
  const [debouncedCode, setDebouncedCode] = useState(initialCode);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDebouncedCode(code), 300);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [code]);

  const srcdoc = useMemo(() => buildSrcdoc(debouncedCode), [debouncedCode]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden my-4">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center gap-3 flex-wrap">
        {title && (
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            {title}
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Play className="h-3 w-3" /> auto-render
        </span>
        <button
          type="button"
          onClick={() => setCode(initialCode)}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-[11px] hover:border-brand/40"
          title="Tilbakestill"
        >
          <RotateCcw className="h-3 w-3" /> reset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="border-b md:border-b-0 md:border-r border-border">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="w-full block bg-slate-950 text-slate-100 font-mono text-xs p-3 outline-none resize-none"
            style={{ height: `${height}px` }}
          />
        </div>
        <div className="bg-white">
          <iframe
            title={title ?? "React preview"}
            srcDoc={srcdoc}
            sandbox="allow-scripts"
            className="w-full block"
            style={{ height: `${height}px`, border: 0 }}
          />
        </div>
      </div>

      {hints && hints.length > 0 && (
        <div className="border-t border-border bg-muted/20 px-4 py-2 text-[11px] text-muted-foreground">
          <span className="font-semibold uppercase tracking-wider mr-2">Prøv:</span>
          {hints.map((h, i) => (
            <span key={i} className="mr-3">
              · {h}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function buildSrcdoc(userCode: string): string {
  // React + ReactDOM + Babel lastes fra CDN inne i iframen.
  // sandbox="allow-scripts" — scripts kjører, men ingen tilgang til parent eller cookies.
  // </script> i bruker-kode må escapes så vi ikke bryter ut av <script>-tagen.
  const safe = userCode.replace(/<\/script>/gi, "<\\/script>");
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; font: 14px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; color: #0f172a; background: #ffffff; }
  body { padding: 12px; }
  #__err { display: none; margin: 8px 0; padding: 10px 12px; border: 1px solid #fca5a5; background: #fef2f2; color: #991b1b; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; white-space: pre-wrap; border-radius: 6px; }
  button { font: inherit; padding: 4px 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc; cursor: pointer; }
  button:hover { background: #e2e8f0; }
  input, select, textarea { font: inherit; padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 6px; }
</style>
<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
<div id="__err"></div>
<div id="root"></div>
<script type="text/babel" data-presets="env,react">
  const { useState, useEffect, useMemo, useCallback, useRef, useContext, createContext, useReducer, Fragment } = React;
  function __show(e) {
    const el = document.getElementById('__err');
    el.style.display = 'block';
    el.textContent = (e && e.message) ? e.message : String(e);
  }
  window.addEventListener('error', (ev) => __show(ev.error || ev.message));
  try {
${safe}
    let __Root = null;
    try { __Root = App; } catch (_) {}
    if (!__Root) { try { __Root = Component; } catch (_) {} }
    if (!__Root) {
      throw new Error('Definer en funksjon App() eller Component() som returnerer JSX.');
    }
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(__Root));
  } catch (e) {
    __show(e);
  }
</script>
</body>
</html>`;
}
