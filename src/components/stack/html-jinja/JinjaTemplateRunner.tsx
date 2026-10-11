// Live Jinja-runner: studenten skriver template + JSON-context, ser HTML-output
// rendret i en iframe. Bruker den lokale mini-emulatoren (subset av Jinja).
//
// Tre paneler: template (venstre), JSON-context (høyre), live preview (under).
// Feil i parsing eller JSON vises i et tydelig badge — preview-en holder forrige
// gyldige output så studenten ikke mister sammenhengen mens de skriver.

import { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { renderJinja } from "./jinjaEmulator";

interface Props {
  initialTemplate: string;
  initialContext: string;
  title?: string;
  height?: number;
  hint?: string;
}

export function JinjaTemplateRunner({ initialTemplate, initialContext, title, height = 220, hint }: Props) {
  const [tpl, setTpl] = useState(initialTemplate.trimEnd());
  const [ctx, setCtx] = useState(initialContext.trimEnd());
  const [dTpl, setDTpl] = useState(tpl);
  const [dCtx, setDCtx] = useState(ctx);

  useEffect(() => {
    const t = setTimeout(() => setDTpl(tpl), 200);
    return () => clearTimeout(t);
  }, [tpl]);
  useEffect(() => {
    const t = setTimeout(() => setDCtx(ctx), 200);
    return () => clearTimeout(t);
  }, [ctx]);

  const { html, error } = useMemo(() => {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(dCtx);
    } catch (e) {
      return { html: "", error: `JSON-feil: ${(e as Error).message}` };
    }
    const r = renderJinja(dTpl, parsed);
    if (r.error) return { html: "", error: `Template-feil: ${r.error}` };
    return { html: r.output, error: null as string | null };
  }, [dTpl, dCtx]);

  const srcdoc = useMemo(() => buildSrcdoc(html), [html]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden my-4">
      {title && (
        <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            {title}
          </span>
          <button
            type="button"
            onClick={() => { setTpl(initialTemplate.trimEnd()); setCtx(initialContext.trimEnd()); }}
            className="text-[11px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
          >
            tilbakestill
          </button>
        </div>
      )}
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        <div>
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border bg-muted/20">
            Template (Jinja)
          </div>
          <textarea
            value={tpl}
            onChange={(e) => setTpl(e.target.value)}
            spellCheck={false}
            className={cn("w-full font-mono text-xs p-3 bg-background text-foreground outline-none resize-none border-0")}
            style={{ height: `${height}px` }}
          />
        </div>
        <div>
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border bg-muted/20">
            Context (JSON)
          </div>
          <textarea
            value={ctx}
            onChange={(e) => setCtx(e.target.value)}
            spellCheck={false}
            className={cn("w-full font-mono text-xs p-3 bg-background text-foreground outline-none resize-none border-0")}
            style={{ height: `${height}px` }}
          />
        </div>
      </div>
      <div className="border-t border-border">
        <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border bg-muted/20 flex items-center justify-between">
          <span>Rendret output</span>
          {error && (
            <span className="flex items-center gap-1 text-red-600 dark:text-red-400 normal-case tracking-normal font-normal text-[11px]">
              <AlertCircle className="h-3 w-3" />
              {error}
            </span>
          )}
        </div>
        <div className="bg-white">
          <iframe
            title={title ?? "Jinja preview"}
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
