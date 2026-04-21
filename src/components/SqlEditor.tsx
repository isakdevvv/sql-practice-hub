import Editor, { type OnMount } from "@monaco-editor/react";
import { useRef } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onRun?: () => void;
  height?: string;
}

export function SqlEditor({ value, onChange, onRun, height = "100%" }: Props) {
  const onRunRef = useRef(onRun);
  onRunRef.current = onRun;

  const handleMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRunRef.current?.();
    });
  };

  return (
    <div className="h-full w-full overflow-hidden rounded-md border border-border bg-[#1e1e1e]">
      <Editor
        height={height}
        defaultLanguage="sql"
        theme="vs-dark"
        value={value}
        onChange={(v) => onChange(v ?? "")}
        onMount={handleMount}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          padding: { top: 12, bottom: 12 },
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
        }}
      />
    </div>
  );
}
