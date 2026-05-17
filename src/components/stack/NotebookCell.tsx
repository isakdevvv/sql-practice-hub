// Jupyter-stil "notebook cell" som kan embedes inn i stack-sider.
//
// Bruk:
//   <NotebookCell code={`print("hei")`} />
//   <NotebookCell
//     code={`X_train_scaled = scaler.fit_transform(X_train)`}
//     setup={`from sklearn.preprocessing import StandardScaler\nX_train = [[1],[2],[3]]\nscaler = StandardScaler()`}
//     requires={["scikit-learn"]}
//   />
//
// Pyodide lastes lazy via getPyodide() (delt instans på tvers av alle celler
// på sida), så første kjøring tar ~5–10 sek og påfølgende er instant.

import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Copy, RotateCcw, Loader2, Check } from "lucide-react";
import { getPyodide, isPyodideReady, onPyodideProgress } from "@/lib/python/pyodideLoader";

interface NotebookCellProps {
  /** Kode som vises og kan redigeres. */
  code: string;
  /** Kode som kjøres FØR `code`, men ikke vises. Bruk til å sette opp
   *  datasett, imports osv. så cellen er kjørbar uten støy. */
  setup?: string;
  /** Ekstra pyodide-pakker som må loades før kjøring (f.eks. "scikit-learn").
   *  numpy/pandas/scikit-learn er bygget inn og loades on-demand. */
  requires?: string[];
  /** Valgfri overskrift over cellen. */
  title?: string;
  /** Maks høyde på editor-area i piksler (default 220). Vokser litt for korte snutter. */
  maxHeight?: number;
}

type RunState =
  | { kind: "idle" }
  | { kind: "loading"; stage: string }
  | { kind: "running" }
  | { kind: "done"; stdout: string; stderr: string; durationMs: number }
  | { kind: "error"; stdout: string; traceback: string };

export function NotebookCell({
  code: initialCode,
  setup,
  requires,
  title,
  maxHeight = 320,
}: NotebookCellProps) {
  const [code, setCode] = useState(initialCode);
  const [state, setState] = useState<RunState>({ kind: "idle" });
  const [copied, setCopied] = useState(false);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-grow textarea opp til maxHeight
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const next = Math.min(maxHeight, Math.max(80, ta.scrollHeight));
    ta.style.height = `${next}px`;
  }, [code, maxHeight]);

  const isBusy = state.kind === "loading" || state.kind === "running";

  async function handleRun() {
    setState({ kind: "loading", stage: isPyodideReady() ? "Laster pakker…" : "Laster Pyodide…" });
    const unsubscribe = onPyodideProgress((stage) => {
      setState((s) => (s.kind === "loading" ? { kind: "loading", stage } : s));
    });

    const t0 = performance.now();
    try {
      const py = await getPyodide();
      if (requires && requires.length > 0) {
        setState({ kind: "loading", stage: `Loader pakker: ${requires.join(", ")}…` });
        await py.loadPackage(requires);
      }

      const stdoutChunks: string[] = [];
      const stderrChunks: string[] = [];
      py.setStdout({ batched: (s: string) => stdoutChunks.push(s) });
      py.setStderr({ batched: (s: string) => stderrChunks.push(s) });

      setState({ kind: "running" });
      const fullCode = setup ? `${setup}\n${code}` : code;
      await py.runPythonAsync(fullCode);

      const durationMs = Math.round(performance.now() - t0);
      setState({
        kind: "done",
        stdout: stdoutChunks.join("\n"),
        stderr: stderrChunks.join("\n"),
        durationMs,
      });
    } catch (err) {
      const traceback = err instanceof Error ? err.message : String(err);
      // Pyodide pakker hele tracebacken inn i error.message
      setState({
        kind: "error",
        stdout: "",
        traceback,
      });
    } finally {
      unsubscribe();
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function handleReset() {
    setCode(initialCode);
    setState({ kind: "idle" });
  }

  // Cmd/Ctrl+Enter for kjør
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (!isBusy) handleRun();
    }
  }

  const hasChanges = code !== initialCode;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden my-3">
      {title && (
        <div className="px-4 py-2 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </div>
      )}

      {/* Editor */}
      <div className="relative">
        <textarea
          ref={taRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="w-full font-mono text-xs leading-relaxed bg-card text-foreground px-4 py-3 pr-2 resize-none focus:outline-none focus:ring-1 focus:ring-brand/30"
          style={{ minHeight: 80 }}
        />
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-border bg-muted/20">
        <div className="flex items-center gap-1">
          <button
            onClick={handleRun}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-brand text-brand-foreground hover:bg-brand/90 disabled:opacity-60 disabled:cursor-not-allowed transition"
            title="Kjør (⌘/Ctrl + Enter)"
          >
            {isBusy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            {state.kind === "loading" ? "Laster…" : state.kind === "running" ? "Kjører…" : "Kjør"}
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition"
            title="Kopier kode"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Kopiert" : "Kopier"}
          </button>
          {hasChanges && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition"
              title="Tilbakestill til original kode"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Tilbakestill
            </button>
          )}
        </div>
        <div className="text-[10px] text-muted-foreground/70 pr-1 hidden sm:block">
          ⌘/Ctrl + Enter
        </div>
      </div>

      {/* Output */}
      <OutputArea state={state} />
    </div>
  );
}

function OutputArea({ state }: { state: RunState }) {
  if (state.kind === "idle") return null;

  if (state.kind === "loading") {
    return (
      <div className="px-4 py-3 border-t border-border bg-background/50 text-xs text-muted-foreground flex items-center gap-2">
        <Loader2 className="h-3 w-3 animate-spin" />
        {state.stage}
      </div>
    );
  }

  if (state.kind === "running") {
    return (
      <div className="px-4 py-3 border-t border-border bg-background/50 text-xs text-muted-foreground flex items-center gap-2">
        <Loader2 className="h-3 w-3 animate-spin" />
        Kjører Python…
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="border-t border-border bg-rose-500/5">
        <div className="px-4 py-2 text-[10px] uppercase tracking-wider text-rose-400 font-semibold">
          Feil
        </div>
        <pre className="px-4 pb-3 font-mono text-xs text-rose-300 whitespace-pre-wrap overflow-x-auto max-h-[300px]">
          {state.traceback}
        </pre>
      </div>
    );
  }

  // done
  const hasOutput = state.stdout.trim().length > 0 || state.stderr.trim().length > 0;
  return (
    <div className="border-t border-border bg-background/50">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Output {!hasOutput && "(ingen)"}
        </div>
        <div className="text-[10px] text-muted-foreground/70">{state.durationMs} ms</div>
      </div>
      {state.stdout && (
        <pre className="px-4 pb-2 font-mono text-xs text-foreground whitespace-pre-wrap overflow-x-auto max-h-[400px]">
          {state.stdout}
        </pre>
      )}
      {state.stderr && (
        <pre className="px-4 pb-3 font-mono text-xs text-amber-400 whitespace-pre-wrap overflow-x-auto max-h-[200px]">
          {state.stderr}
        </pre>
      )}
    </div>
  );
}

/**
 * Praktisk wrapper for read-only kode-visning (uten "Kjør"-knapp). Brukbar
 * når du vil vise eksempel-output eller en kommando som ikke gir mening å
 * kjøre i Pyodide (f.eks. shell-kommandoer).
 */
export function StaticCodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const display = useMemo(() => code.trimEnd(), [code]);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden my-3 relative group">
      <pre className="font-mono text-xs leading-relaxed px-4 py-3 overflow-x-auto whitespace-pre">
        {display}
      </pre>
      <button
        onClick={() => {
          navigator.clipboard.writeText(display).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
        className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded text-muted-foreground hover:bg-muted hover:text-foreground transition opacity-0 group-hover:opacity-100"
        title="Kopier"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? "Kopiert" : "Kopier"}
        {lang && <span className="ml-1 opacity-60">{lang}</span>}
      </button>
    </div>
  );
}
