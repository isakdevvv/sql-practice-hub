// Live JavaScript REPL — kjør kode i en sandboxet iframe (srcdoc), fang
// console.log/warn/error og siste expression-verdi. Hver kjøring er et nytt
// iframe-dokument, så `let foo` / `const x` lekker IKKE mellom kjøringer.
//
// Kommunikasjon: parent sender ikke kode — koden er bakt inn i srcdoc. Iframen
// kjører den på load, samler logs/result, og poster tilbake via
// window.parent.postMessage. Parent matcher mot en unik nonce per kjøring så
// gamle iframes ikke kan forfalske resultater.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogEntry {
  type: "log" | "warn" | "error" | "info";
  text: string;
}

interface ReplResult {
  logs: LogEntry[];
  resultText: string | null;
  errored: boolean;
}

interface Props {
  /** Startkode i editor. */
  initialCode: string;
  /** Overskrift over REPL-en. */
  title?: string;
  /** Antall rader i textarea. */
  rows?: number;
  /** Kjør automatisk ved endring (debounced). Default false. */
  autoRunDefault?: boolean;
}

export function JsRepl({ initialCode, title, rows = 8, autoRunDefault = false }: Props) {
  const [code, setCode] = useState(initialCode);
  const [autoRun, setAutoRun] = useState(autoRunDefault);
  const [runId, setRunId] = useState(1);
  const [result, setResult] = useState<ReplResult>({ logs: [], resultText: null, errored: false });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nonce = `js-repl-${runId}`;
  const currentNonceRef = useRef(nonce);
  currentNonceRef.current = nonce;

  const triggerRun = useCallback(() => {
    setResult({ logs: [], resultText: null, errored: false });
    setRunId(id => id + 1);
  }, []);

  const reset = useCallback(() => {
    setCode(initialCode);
    setResult({ logs: [], resultText: null, errored: false });
  }, [initialCode]);

  // Auto-run: debounce 500ms etter siste tastetrykk.
  useEffect(() => {
    if (!autoRun) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => triggerRun(), 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [code, autoRun, triggerRun]);

  // Lytt etter postMessage fra iframen.
  useEffect(() => {
    function onMessage(ev: MessageEvent) {
      const data = ev.data;
      if (!data || data.kind !== "js-repl-result") return;
      if (data.nonce !== currentNonceRef.current) return;
      setResult({
        logs: data.logs as LogEntry[],
        resultText: data.resultText as string | null,
        errored: !!data.errored,
      });
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Bygg srcdoc med nåværende kode + nonce hver gang runId endrer seg. Code
  // fanges også opp så «Kjør» bruker SISTE versjon av textarea, ikke en gammel
  // closure.
  const srcdoc = useMemo(
    () => buildSrcdoc(code, nonce),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [runId],
  );

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden my-4">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          {title ?? "JavaScript REPL"}
        </span>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRun}
              onChange={e => setAutoRun(e.target.checked)}
              className="accent-brand"
            />
            auto-kjør
          </label>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-border bg-background hover:border-brand/40 px-2 py-1 text-[11px] font-mono flex items-center gap-1"
            title="Tilbakestill kode"
          >
            <RotateCcw className="h-3 w-3" /> reset
          </button>
          <button
            type="button"
            onClick={triggerRun}
            className="rounded-md border border-brand bg-brand text-white hover:bg-brand/90 px-3 py-1 text-[11px] font-mono font-semibold flex items-center gap-1"
          >
            <Play className="h-3 w-3" /> Kjør
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-border">
        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          rows={rows}
          spellCheck={false}
          className="font-mono text-xs p-3 bg-background outline-none resize-y min-h-[10rem] whitespace-pre overflow-auto"
          style={{ tabSize: 2 }}
        />
        <div className="bg-muted/10 p-3 min-h-[10rem] text-xs font-mono overflow-auto">
          {result.logs.length === 0 && result.resultText === null && !result.errored && (
            <div className="text-muted-foreground italic">(ingen output)</div>
          )}
          {result.logs.map((entry, i) => (
            <div
              key={i}
              className={cn(
                "whitespace-pre-wrap break-words",
                entry.type === "error" && "text-red-600 dark:text-red-400",
                entry.type === "warn" && "text-amber-700 dark:text-amber-400",
                entry.type === "info" && "text-blue-600 dark:text-blue-400",
              )}
            >
              {entry.text}
            </div>
          ))}
          {result.resultText !== null && (
            <div className="mt-2 pt-2 border-t border-border text-muted-foreground">
              <span className="text-[10px] uppercase tracking-wider">← retur:</span>{" "}
              <span className="text-foreground whitespace-pre-wrap break-words">
                {result.resultText}
              </span>
            </div>
          )}
        </div>
      </div>
      {/* Skjult iframe som kjører koden. Vi setter srcdoc via ref i en
          effect, fordi en del React/Vite-oppsett ikke starter scriptet hvis
          srcdoc bare er gitt som JSX-prop ved mount. */}
      <SandboxIframe srcdoc={srcdoc} runId={runId} />
    </div>
  );
}

function SandboxIframe({ srcdoc, runId }: { srcdoc: string; runId: number }) {
  // srcDoc som JSX-prop fungerer både SSR og klient. key={runId} tvinger
  // remount og dermed re-eval per «Kjør».
  return (
    <iframe
      key={runId}
      title="js-repl-runner"
      srcDoc={srcdoc}
      sandbox="allow-scripts"
      style={{ width: 0, height: 0, border: 0, position: "absolute", left: -9999 }}
      aria-hidden="true"
    />
  );
}

function buildSrcdoc(code: string, nonce: string): string {
  // Vi bruker indirect eval ((0, eval)(...)) for å kjøre i iframens globale
  // scope og fange returverdi av siste expression. Console-metoder overstyres
  // før eval slik at output havner i `logs`.
  const encoded = JSON.stringify(code);
  const encodedNonce = JSON.stringify(nonce);
  return `<!doctype html><html><head><meta charset="utf-8"></head><body><script>
(function(){
  var logs = [];
  function stringify(v){
    if (v === undefined) return "undefined";
    if (v === null) return "null";
    if (typeof v === "function") return v.toString();
    if (typeof v === "string") return JSON.stringify(v);
    if (typeof v === "bigint") return v.toString() + "n";
    if (typeof v === "symbol") return v.toString();
    if (typeof v === "number") return Object.is(v, NaN) ? "NaN" : String(v);
    if (v instanceof Error) return v.name + ": " + v.message;
    try {
      var seen = new WeakSet();
      return JSON.stringify(v, function(k, val){
        if (typeof val === "object" && val !== null) {
          if (seen.has(val)) return "[circular]";
          seen.add(val);
        }
        if (typeof val === "function") return "[function " + (val.name||"") + "]";
        if (typeof val === "bigint") return val.toString() + "n";
        if (typeof val === "undefined") return "undefined";
        return val;
      }, 2);
    } catch(e) {
      return String(v);
    }
  }
  function fmt(args){ return args.map(stringify).join(" "); }
  console.log = function(){ logs.push({type:"log", text: fmt([].slice.call(arguments))}); };
  console.info = function(){ logs.push({type:"info", text: fmt([].slice.call(arguments))}); };
  console.warn = function(){ logs.push({type:"warn", text: fmt([].slice.call(arguments))}); };
  console.error = function(){ logs.push({type:"error", text: fmt([].slice.call(arguments))}); };

  window.onerror = function(msg, src, line, col, err){
    logs.push({type:"error", text: (err && err.stack) ? String(err.stack) : String(msg)});
    return true;
  };
  window.onunhandledrejection = function(ev){
    var r = ev.reason;
    logs.push({type:"error", text: "Unhandled rejection: " + ((r && r.stack) ? r.stack : stringify(r))});
  };

  var code = ${encoded};
  var resultText = null;
  var errored = false;
  try {
    var ret = (0, eval)(code);
    if (ret !== undefined) resultText = stringify(ret);
  } catch (e) {
    errored = true;
    logs.push({type:"error", text: (e && e.stack) ? String(e.stack) : String(e)});
  }

  // Async kode (Promises, setTimeout) — gi 600ms for at microtasks/tasks rekker
  // å logge før vi sender. Studenten lærer at output ikke alltid er øyeblikkelig.
  setTimeout(function(){
    window.parent.postMessage({
      kind: "js-repl-result",
      nonce: ${encodedNonce},
      logs: logs,
      resultText: resultText,
      errored: errored
    }, "*");
  }, 600);
})();
</script></body></html>`;
}
