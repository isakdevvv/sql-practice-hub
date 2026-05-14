import { useEffect, useMemo, useRef, useState } from "react";
import { Play, FileText, FileCode, Loader2, Trash2, BookOpen, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { PythonEditor } from "@/components/python/PythonEditor";
import { runScript } from "@/lib/python/runner";
import {
  getPyodide,
  isPyodideReady,
  onPyodideProgress,
} from "@/lib/python/pyodideLoader";
import type { ChapterWorkspace, WorkspaceFile } from "@/lib/python/chapterWorkspaces";
import type { PythonChapter } from "@/lib/learn/pythonChapters";
import { cn } from "@/lib/utils";

type TerminalLine = {
  kind: "info" | "stdout" | "stderr" | "system";
  text: string;
};

interface Props {
  workspace: ChapterWorkspace;
  chapter: PythonChapter | undefined;
}

/**
 * VSCode-aktig mini-IDE for et kapittel. Tre paneler:
 *   venstre: filtre med kapittelets WorkspaceFile-er
 *   midten:  Monaco-editor (tab pr. fil) over en terminal/output-pane
 *   høyre:   kapittelets prosa (lesestoff) fra PYTHON_CHAPTERS
 */
export function IdeView({ workspace, chapter }: Props) {
  // Innholds-buffere pr. fil. Initialiseres fra workspace.files og endres når
  // brukeren skriver. Persisteres ikke i runde 1.
  const [buffers, setBuffers] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    for (const f of workspace.files) m[f.path] = f.initial;
    return m;
  });
  const [activePath, setActivePath] = useState<string>(workspace.entrypoint);
  const [terminal, setTerminal] = useState<TerminalLine[]>([
    { kind: "system", text: `Kap. ${workspace.chapter} — ${workspace.title}` },
    { kind: "info", text: workspace.intro },
    { kind: "info", text: "Trykk Run (Ctrl/⌘+Enter) for å kjøre " + workspace.entrypoint + "." },
  ]);
  const [busy, setBusy] = useState(false);
  const [pyReady, setPyReady] = useState(isPyodideReady());
  const [loadStage, setLoadStage] = useState<string | null>(null);
  const [lastOk, setLastOk] = useState<boolean | null>(null);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Reset hele workspaceen dersom kapittelet skifter (route-bytte).
  useEffect(() => {
    const m: Record<string, string> = {};
    for (const f of workspace.files) m[f.path] = f.initial;
    setBuffers(m);
    setActivePath(workspace.entrypoint);
    setTerminal([
      { kind: "system", text: `Kap. ${workspace.chapter} — ${workspace.title}` },
      { kind: "info", text: workspace.intro },
    ]);
    setLastOk(null);
  }, [workspace]);

  // Pyodide-loading progress.
  useEffect(() => {
    return onPyodideProgress((stage) => {
      setLoadStage(stage);
      if (stage === "Klar.") setPyReady(true);
    });
  }, []);

  // Autoscroll terminalen ned ved nye linjer.
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [terminal]);

  const activeFile: WorkspaceFile | undefined = useMemo(
    () => workspace.files.find((f) => f.path === activePath),
    [workspace, activePath],
  );

  function appendLine(line: TerminalLine) {
    setTerminal((prev) => [...prev, line]);
  }

  function clearTerminal() {
    setTerminal([{ kind: "system", text: "Terminal tømt." }]);
    setLastOk(null);
  }

  function resetActiveFile() {
    if (!activeFile) return;
    setBuffers((prev) => ({ ...prev, [activeFile.path]: activeFile.initial }));
    appendLine({ kind: "info", text: `${activeFile.path} tilbakestilt til opprinnelig innhold.` });
  }

  async function ensureLoaded() {
    if (isPyodideReady()) {
      setPyReady(true);
      return;
    }
    appendLine({ kind: "info", text: "Laster Python-runtime (Pyodide)…" });
    await getPyodide();
    setPyReady(true);
  }

  async function handleRun() {
    if (busy) return;
    const entry = buffers[workspace.entrypoint] ?? "";
    appendLine({ kind: "info", text: `▶ python ${workspace.entrypoint}` });
    setBusy(true);
    setLastOk(null);
    try {
      await ensureLoaded();
      const result = await runScript(entry);
      if (result.stdout) {
        for (const line of result.stdout.split("\n")) {
          appendLine({ kind: result.ok ? "stdout" : "stderr", text: line });
        }
      }
      if (!result.ok) {
        appendLine({ kind: "stderr", text: result.error ?? "Ukjent feil" });
        setLastOk(false);
      } else {
        setLastOk(true);
        if (workspace.expectedStdout) {
          const got = (result.stdout ?? "").trim();
          const want = workspace.expectedStdout.trim();
          if (got === want) {
            appendLine({
              kind: "info",
              text: "✓ Utskrift matcher forventet svar — riktig!",
            });
          } else {
            appendLine({
              kind: "info",
              text: "Kjørte uten feil, men utskrift matcher ikke fasit ennå.",
            });
          }
        }
      }
    } catch (err) {
      appendLine({
        kind: "stderr",
        text: err instanceof Error ? err.message : String(err),
      });
      setLastOk(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Topplinje */}
      <div className="flex items-center justify-between border-b border-border bg-card px-3 py-1.5 text-xs">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
            Kap. {workspace.chapter}
          </Badge>
          <span className="font-medium text-foreground">{workspace.title}</span>
          {!pyReady && loadStage && (
            <span className="ml-2 flex items-center gap-1 text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              {loadStage}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {lastOk === true && (
            <span className="flex items-center gap-1 text-success">
              <CheckCircle2 className="h-3.5 w-3.5" /> Kjørte rent
            </span>
          )}
          {lastOk === false && (
            <span className="flex items-center gap-1 text-red-500">
              <XCircle className="h-3.5 w-3.5" /> Feil
            </span>
          )}
          <Button size="sm" onClick={handleRun} disabled={busy} className="h-7 px-2.5">
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 mr-1" />
            )}
            Run
          </Button>
        </div>
      </div>

      {/* Paneler */}
      <ResizablePanelGroup orientation="horizontal" className="flex-1">
        {/* Venstre: filtre */}
        <ResizablePanel defaultSize={15} minSize={10} maxSize={25}>
          <FileTree
            files={workspace.files}
            activePath={activePath}
            onSelect={setActivePath}
          />
        </ResizablePanel>
        <ResizableHandle />

        {/* Midten: editor + terminal */}
        <ResizablePanel defaultSize={55} minSize={30}>
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize={65} minSize={30}>
              <EditorPane
                file={activeFile}
                value={activeFile ? buffers[activeFile.path] ?? "" : ""}
                onChange={(v) => {
                  if (!activeFile) return;
                  setBuffers((prev) => ({ ...prev, [activeFile.path]: v }));
                }}
                onRun={handleRun}
                onReset={resetActiveFile}
              />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={35} minSize={15}>
              <TerminalPane
                lines={terminal}
                busy={busy}
                onClear={clearTerminal}
                endRef={terminalEndRef}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle />

        {/* Høyre: lesestoff fra kapitlet */}
        <ResizablePanel defaultSize={30} minSize={15}>
          <ReadingPane chapter={chapter} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

/* -------------------------------- Panes -------------------------------- */

function FileTree({
  files,
  activePath,
  onSelect,
}: {
  files: WorkspaceFile[];
  activePath: string;
  onSelect: (p: string) => void;
}) {
  return (
    <div className="h-full overflow-y-auto bg-muted/20">
      <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
        Filer
      </div>
      <ul className="py-1 text-sm">
        {files.map((f) => {
          const isActive = f.path === activePath;
          const Icon = f.language === "python" ? FileCode : FileText;
          return (
            <li key={f.path}>
              <button
                onClick={() => onSelect(f.path)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-1 text-left text-[13px] transition-colors",
                  isActive
                    ? "bg-brand/10 text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate font-mono">{f.path}</span>
                {f.readOnly && (
                  <span className="ml-auto text-[10px] text-muted-foreground/70">RO</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function EditorPane({
  file,
  value,
  onChange,
  onRun,
  onReset,
}: {
  file: WorkspaceFile | undefined;
  value: string;
  onChange: (v: string) => void;
  onRun: () => void;
  onReset: () => void;
}) {
  if (!file) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Ingen fil valgt.
      </div>
    );
  }

  // Monaco's path-prop holder modell-historikk pr. fil. Bruker workspace+path
  // som key så undo/redo ikke lekker mellom filer.
  const isPython = file.language === "python";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-card px-3 py-1 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-muted-foreground">{file.path}</span>
          {file.readOnly && (
            <Badge variant="outline" className="text-[9px] px-1 py-0">
              kun lesing
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isPython && !file.readOnly && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onReset}
              className="h-6 px-1.5 text-[11px]"
              title="Tilbakestill denne filen"
            >
              <Trash2 className="h-3 w-3 mr-1" /> Reset
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {file.readOnly ? (
          <ReadOnlyFile file={file} value={value} />
        ) : (
          <PythonEditor value={value} onChange={onChange} onRun={onRun} />
        )}
      </div>
    </div>
  );
}

function ReadOnlyFile({ file, value }: { file: WorkspaceFile; value: string }) {
  // Vis markdown-/tekst-filer som scrollbar prose i stedet for Monaco —
  // hindrer at brukeren tror de skal "redigere oppgaven".
  if (file.language === "markdown") {
    return (
      <div className="h-full overflow-y-auto bg-background px-5 py-4">
        <MarkdownLite source={value} />
      </div>
    );
  }
  return (
    <pre className="h-full overflow-auto bg-background px-4 py-3 font-mono text-xs leading-relaxed text-foreground/90">
      {value}
    </pre>
  );
}

function TerminalPane({
  lines,
  busy,
  onClear,
  endRef,
}: {
  lines: TerminalLine[];
  busy: boolean;
  onClear: () => void;
  endRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-200">
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1 text-[11px] text-zinc-400">
        <span className="font-mono uppercase tracking-wider">Terminal</span>
        <div className="flex items-center gap-2">
          {busy && (
            <span className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> kjører…
            </span>
          )}
          <button
            onClick={onClear}
            className="rounded px-1.5 py-0.5 hover:bg-zinc-800"
            title="Tøm terminal"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[12px] leading-relaxed">
        {lines.map((l, i) => (
          <div
            key={i}
            className={cn(
              "whitespace-pre-wrap",
              l.kind === "stderr" && "text-red-400",
              l.kind === "info" && "text-zinc-400",
              l.kind === "system" && "text-brand",
              l.kind === "stdout" && "text-zinc-100",
            )}
          >
            {l.text || " "}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}

function ReadingPane({ chapter }: { chapter: PythonChapter | undefined }) {
  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center gap-2 border-b border-border px-3 py-1.5 text-[11px] text-muted-foreground">
        <BookOpen className="h-3.5 w-3.5" />
        <span className="uppercase tracking-wider">Lesestoff</span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 text-[13px]">
        {chapter ? (
          <>
            <h1 className="mb-2 text-base font-bold tracking-tight">
              Kap. {chapter.nr}: {chapter.title}
            </h1>
            <p className="mb-3 text-xs text-muted-foreground">{chapter.summary}</p>
            <article className="prose-tight">{chapter.body}</article>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Ingen lesestoff funnet for dette kapittelet.
          </p>
        )}
      </div>
    </div>
  );
}

/* ----------------------- Veldig liten markdown-render ------------------ */
// Vi har ikke react-markdown i avhengighetene. For oppgavebeskrivelser holder
// det å rendre overskrifter, fenced kodeblokker, inline code og lister.

function MarkdownLite({ source }: { source: string }) {
  const blocks = useMemo(() => parseMarkdownLite(source), [source]);
  return (
    <div className="space-y-3 text-[14px] leading-relaxed">
      {blocks.map((b, i) => {
        if (b.kind === "h1") return <h1 key={i} className="text-lg font-bold tracking-tight">{b.text}</h1>;
        if (b.kind === "h2") return <h2 key={i} className="mt-2 text-base font-semibold">{b.text}</h2>;
        if (b.kind === "code") return (
          <pre key={i} className="rounded-md border border-border bg-muted/40 p-3 font-mono text-[12px] overflow-x-auto">{b.text}</pre>
        );
        if (b.kind === "ul") return (
          <ul key={i} className="ml-4 list-disc space-y-1">
            {b.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}
          </ul>
        );
        if (b.kind === "p") return <p key={i}>{renderInline(b.text)}</p>;
        return null;
      })}
    </div>
  );
}

type MdBlock =
  | { kind: "h1"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "p"; text: string }
  | { kind: "code"; text: string }
  | { kind: "ul"; items: string[] };

function parseMarkdownLite(src: string): MdBlock[] {
  const lines = src.split("\n");
  const out: MdBlock[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      out.push({ kind: "code", text: buf.join("\n") });
      continue;
    }
    if (line.startsWith("# ")) { out.push({ kind: "h1", text: line.slice(2) }); i++; continue; }
    if (line.startsWith("## ")) { out.push({ kind: "h2", text: line.slice(3) }); i++; continue; }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      out.push({ kind: "ul", items });
      continue;
    }
    if (line.trim() === "") { i++; continue; }
    // Slå sammen sammenhengende ikke-tomme linjer til ett avsnitt.
    const buf: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("# ") &&
      !lines[i].startsWith("## ") &&
      !lines[i].startsWith("- ") &&
      !lines[i].startsWith("```")
    ) {
      buf.push(lines[i]);
      i++;
    }
    out.push({ kind: "p", text: buf.join(" ") });
  }
  return out;
}

function renderInline(text: string): React.ReactNode {
  // Bare backtick-inline-code for nå. Andre Markdown-features dropper vi.
  const parts: React.ReactNode[] = [];
  const re = /`([^`]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <code key={key++} className="rounded bg-muted px-1 py-0.5 font-mono text-[12px]">
        {m[1]}
      </code>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
