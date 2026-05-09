import Editor, { type OnMount } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import type { editor as MonacoEditor } from "monaco-editor";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onRun?: () => void;
  /** 1-indexed line to highlight (e.g. the line just executed during stepping). */
  highlightLine?: number | null;
  height?: string;
}

export function PythonEditor({
  value,
  onChange,
  onRun,
  highlightLine = null,
  height = "100%",
}: Props) {
  const onRunRef = useRef(onRun);
  onRunRef.current = onRun;

  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const monacoRef = useRef<typeof import("monaco-editor") | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRunRef.current?.();
    });
  };

  // Update line decoration when highlight changes.
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    if (highlightLine && highlightLine > 0) {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
        {
          range: new monaco.Range(highlightLine, 1, highlightLine, 1),
          options: {
            isWholeLine: true,
            className: "py-step-line",
            linesDecorationsClassName: "py-step-gutter",
          },
        },
      ]);
    } else {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
    }
  }, [highlightLine]);

  if (!mounted) {
    return (
      <div
        className="rounded-md border border-border bg-card font-mono text-xs text-muted-foreground p-3"
        style={{ height }}
      >
        Laster editor…
      </div>
    );
  }

  return (
    <Editor
      height={height}
      defaultLanguage="python"
      theme="vs-dark"
      value={value}
      onChange={(v) => onChange(v ?? "")}
      onMount={handleMount}
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 4,
        wordWrap: "on",
      }}
    />
  );
}
