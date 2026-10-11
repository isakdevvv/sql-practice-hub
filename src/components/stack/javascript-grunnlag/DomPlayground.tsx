// HTML + CSS + JS live-playground. Tre paneler (HTML, CSS, JS) editeres,
// resultatet rendres i en sandboxet iframe. JS-en har full DOM-tilgang
// innenfor iframen — querySelector, addEventListener, alt. Console-output
// fanges og vises under preview.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "html" | "css" | "js";

interface LogEntry {
  type: "log" | "warn" | "error" | "info";
  text: string;
}

interface Props {
  initialHtml: string;
  initialCss: string;
  initialJs: string;
  title?: string;
  /** Preview-høyde i px. */
  height?: number;
  /** Vis console-log-panel under preview. Default true. */
  showConsole?: boolean;
}

export function DomPlayground({
  initialHtml,
  initialCss,
  initialJs,
  title,
  height = 220,
  showConsole = true,
}: Props) {
  const [html, setHtml] = useState(initialHtml);
  const [css, setCss] = useState(initialCss);
  const [js, setJs] = useState(initialJs);
  const [tab, setTab] = useState<Tab>("html");
  const [runId, setRunId] = useState(1);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const nonce = `dom-pg-${runId}`;
  const currentNonceRef = useRef(nonce);
  currentNonceRef.current = nonce;

  const run = useCallback(() => {
    setLogs([]);
    setRunId(id => id + 1);
  }, []);

  const reset = useCallback(() => {
    setHtml(initialHtml);
    setCss(initialCss);
    setJs(initialJs);
  }, [initialHtml, initialCss, initialJs]);

  useEffect(() => {
    function onMessage(ev: MessageEvent) {
      const data = ev.data;
      if (!data || data.kind !== "dom-playground-log") return;
      if (data.nonce !== currentNonceRef.current) return;
      setLogs(prev => [...prev, { type: data.type, text: data.text }]);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const srcdoc = useMemo(
    () => buildSrcdoc(html, css, js, nonce),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [runId],
  );

  const editor = tab === "html" ? html : tab === "css" ? css : js;
  const setEditor = (v: string) => {
    if (tab === "html") setHtml(v);
    else if (tab === "css") setCss(v);
    else setJs(v);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden my-4">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          {title ?? "DOM-playground"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-border bg-background hover:border-brand/40 px-2 py-1 text-[11px] font-mono flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" /> reset
          </button>
          <button
            type="button"
            onClick={run}
            className="rounded-md border border-brand bg-brand text-white hover:bg-brand/90 px-3 py-1 text-[11px] font-mono font-semibold flex items-center gap-1"
          >
            <Play className="h-3 w-3" /> Kjør
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col border-r border-border">
          <div className="flex border-b border-border bg-muted/10">
            {(["html", "css", "js"] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider border-r border-border",
                  tab === t
                    ? "bg-card text-foreground font-semibold"
                    : "bg-muted/20 text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <textarea
            value={editor}
            onChange={e => setEditor(e.target.value)}
            spellCheck={false}
            className="font-mono text-xs p-3 bg-background outline-none resize-y flex-1 whitespace-pre overflow-auto"
            style={{ tabSize: 2, minHeight: `${height}px` }}
          />
        </div>
        <div className="flex flex-col">
          <div className="bg-white" style={{ height: `${height}px` }}>
            <PreviewIframe srcdoc={srcdoc} runId={runId} />
          </div>
          {showConsole && (
            <div className="border-t border-border bg-muted/10 p-2 text-xs font-mono overflow-auto max-h-40 min-h-[3rem]">
              {logs.length === 0 ? (
                <div className="text-muted-foreground italic">(console er tom)</div>
              ) : (
                logs.map((l, i) => (
                  <div
                    key={i}
                    className={cn(
                      "whitespace-pre-wrap break-words",
                      l.type === "error" && "text-red-600 dark:text-red-400",
                      l.type === "warn" && "text-amber-700 dark:text-amber-400",
                      l.type === "info" && "text-blue-600 dark:text-blue-400",
                    )}
                  >
                    <span className="text-muted-foreground">› </span>
                    {l.text}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewIframe({ srcdoc, runId }: { srcdoc: string; runId: number }) {
  return (
    <iframe
      key={runId}
      title="dom-playground-preview"
      srcDoc={srcdoc}
      sandbox="allow-scripts"
      className="w-full h-full"
      style={{ border: 0 }}
    />
  );
}

function buildSrcdoc(html: string, css: string, js: string, nonce: string): string {
  const encNonce = JSON.stringify(nonce);
  return `<!doctype html><html><head><meta charset="utf-8">
<style>
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; font: 14px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; color: #0f172a; background: #fff; }
body { padding: 10px; }
${css}
</style>
</head><body>
${html}
<script>
(function(){
  var NONCE = ${encNonce};
  function stringify(v){
    if (v === undefined) return "undefined";
    if (v === null) return "null";
    if (typeof v === "function") return "[function " + (v.name||"") + "]";
    if (typeof v === "string") return v;
    if (v instanceof Error) return v.name + ": " + v.message;
    if (v && v.nodeType) return "<" + v.nodeName.toLowerCase() + ">";
    try {
      var seen = new WeakSet();
      return JSON.stringify(v, function(k, val){
        if (typeof val === "object" && val !== null) {
          if (seen.has(val)) return "[circular]";
          seen.add(val);
        }
        if (typeof val === "function") return "[function " + (val.name||"") + "]";
        if (typeof val === "bigint") return val.toString() + "n";
        return val;
      });
    } catch(e) { return String(v); }
  }
  function send(type, args){
    var text = [].slice.call(args).map(stringify).join(" ");
    window.parent.postMessage({kind:"dom-playground-log", nonce: NONCE, type: type, text: text}, "*");
  }
  console.log   = function(){ send("log",   arguments); };
  console.info  = function(){ send("info",  arguments); };
  console.warn  = function(){ send("warn",  arguments); };
  console.error = function(){ send("error", arguments); };
  window.onerror = function(msg, src, line, col, err){
    send("error", [(err && err.stack) ? String(err.stack) : String(msg)]);
    return true;
  };
  window.onunhandledrejection = function(ev){
    send("error", ["Unhandled rejection: " + (ev.reason && ev.reason.stack ? ev.reason.stack : String(ev.reason))]);
  };
})();
</script>
<script>
try {
${js}
} catch (e) {
  window.parent.postMessage({kind:"dom-playground-log", nonce: ${encNonce}, type:"error", text: (e && e.stack) ? String(e.stack) : String(e)}, "*");
}
</script>
</body></html>`;
}
