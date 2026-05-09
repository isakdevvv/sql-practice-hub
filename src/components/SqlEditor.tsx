import Editor, { type OnMount } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { GLOSSARY, lookupTerm } from "@/lib/sqlGlossary";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onRun?: () => void;
  height?: string;
}

let hoverProviderRegistered = false;
let completionProviderRegistered = false;

export function SqlEditor({ value, onChange, onRun, height = "100%" }: Props) {
  const onRunRef = useRef(onRun);
  onRunRef.current = onRun;

  // Monaco does not support SSR — only render the editor after client mount.
  // SSR sees a placeholder; the editor swaps in on hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRunRef.current?.();
    });

    // Click-to-select on <...> placeholders: clicking inside one selects the
    // whole token (brackets included) so the next keystroke replaces it.
    // Only matches `<word>` / `<two words>` style — not SQL operators like
    // `<=`, `<> 100`, `<` … `>` across an expression.
    const PLACEHOLDER_RE = /<[A-Za-z][A-Za-z0-9 ]*>/g;
    const selectPlaceholderAt = (lineNumber: number, column: number): boolean => {
      const model = editor.getModel();
      if (!model) return false;
      const line = model.getLineContent(lineNumber);
      PLACEHOLDER_RE.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = PLACEHOLDER_RE.exec(line))) {
        const start = m.index + 1;
        const end = start + m[0].length;
        if (column >= start && column <= end) {
          editor.setSelection(new monaco.Range(lineNumber, start, lineNumber, end));
          editor.focus();
          return true;
        }
      }
      return false;
    };
    editor.onMouseDown((e) => {
      const pos = e.target.position;
      if (!pos) return;
      if (selectPlaceholderAt(pos.lineNumber, pos.column)) {
        e.event.preventDefault();
        e.event.stopPropagation();
      }
    });

    // Decorate <...> placeholders so they look like inline tokens, not plain text.
    const refreshPlaceholderDecorations = () => {
      const model = editor.getModel();
      if (!model) return;
      const ranges: import("monaco-editor").editor.IModelDeltaDecoration[] = [];
      const lineCount = model.getLineCount();
      for (let ln = 1; ln <= lineCount; ln++) {
        const line = model.getLineContent(ln);
        const re = /<[A-Za-z][A-Za-z0-9 ]*>/g;
        let m: RegExpExecArray | null;
        while ((m = re.exec(line))) {
          ranges.push({
            range: new monaco.Range(ln, m.index + 1, ln, m.index + 1 + m[0].length),
            options: {
              inlineClassName: "sql-placeholder",
              hoverMessage: { value: "Klikk for å markere — skriv for å erstatte" },
            },
          });
        }
      }
      placeholderDecorations = editor.deltaDecorations(placeholderDecorations, ranges);
    };
    let placeholderDecorations: string[] = [];
    refreshPlaceholderDecorations();
    editor.onDidChangeModelContent(() => refreshPlaceholderDecorations());

    if (!hoverProviderRegistered) {
      monaco.languages.registerHoverProvider("sql", {
        provideHover: (
          model: import("monaco-editor").editor.ITextModel,
          position: import("monaco-editor").Position,
        ) => {
          // Try multi-word first by reading 1-2 words around the cursor.
          const lineContent = model.getLineContent(position.lineNumber);
          const wordAtCursor = model.getWordAtPosition(position);
          if (!wordAtCursor) return null;

          // Attempt to match a 2-word combination (e.g. INNER JOIN, LEFT JOIN, NOT IN).
          const wordUpper = wordAtCursor.word.toUpperCase();
          const before = lineContent
            .slice(0, wordAtCursor.startColumn - 1)
            .trim()
            .split(/\s+/)
            .pop();
          const after = lineContent
            .slice(wordAtCursor.endColumn - 1)
            .trim()
            .split(/\s+/)[0];

          const candidates: { term: string; range: { startCol: number; endCol: number } }[] = [];
          if (before) {
            candidates.push({
              term: `${before} ${wordUpper}`,
              range: {
                startCol:
                  wordAtCursor.startColumn - before.length - 1,
                endCol: wordAtCursor.endColumn,
              },
            });
          }
          if (after) {
            candidates.push({
              term: `${wordUpper} ${after}`,
              range: {
                startCol: wordAtCursor.startColumn,
                endCol: wordAtCursor.endColumn + after.length + 1,
              },
            });
          }
          candidates.push({
            term: wordUpper,
            range: {
              startCol: wordAtCursor.startColumn,
              endCol: wordAtCursor.endColumn,
            },
          });

          for (const c of candidates) {
            const entry = lookupTerm(c.term);
            if (entry) {
              const md: { value: string; isTrusted?: boolean }[] = [
                {
                  value: `**\`${entry.term}\`** _(${entry.category})_  \n${entry.short}`,
                },
                { value: entry.description },
              ];
              if (entry.example) md.push({ value: "```sql\n" + entry.example + "\n```" });
              if (entry.seeAlso?.length)
                md.push({
                  value: "Se også: " + entry.seeAlso.map((s) => `\`${s}\``).join(" · "),
                });
              return {
                range: new monaco.Range(
                  position.lineNumber,
                  c.range.startCol,
                  position.lineNumber,
                  c.range.endCol,
                ),
                contents: md,
              };
            }
          }
          return null;
        },
      });
      hoverProviderRegistered = true;
    }

    if (!completionProviderRegistered) {
      monaco.languages.registerCompletionItemProvider("sql", {
        provideCompletionItems: (
          model: import("monaco-editor").editor.ITextModel,
          position: import("monaco-editor").Position,
        ) => {
          const word = model.getWordUntilPosition(position);
          const range = new monaco.Range(
            position.lineNumber,
            word.startColumn,
            position.lineNumber,
            word.endColumn,
          );
          return {
            suggestions: GLOSSARY.map((entry) => ({
              label: entry.term,
              kind:
                entry.category === "function"
                  ? monaco.languages.CompletionItemKind.Function
                  : entry.category === "join" || entry.category === "clause"
                  ? monaco.languages.CompletionItemKind.Keyword
                  : monaco.languages.CompletionItemKind.Snippet,
              insertText: entry.term,
              detail: entry.short,
              documentation: {
                value: [
                  entry.description,
                  entry.example ? "```sql\n" + entry.example + "\n```" : "",
                ]
                  .filter(Boolean)
                  .join("\n\n"),
              },
              range,
            })),
          };
        },
      });
      completionProviderRegistered = true;
    }
  };

  return (
    <div className="h-full w-full overflow-hidden rounded-md border border-border bg-[#1e1e1e]">
      {mounted ? (
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
            hover: { enabled: true, delay: 200 },
            padding: { top: 12, bottom: 12 },
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          }}
        />
      ) : (
        <div className="h-full w-full overflow-auto font-mono text-[13px] leading-[19px] py-3 text-[#d4d4d4]">
          {value.split("\n").map((line, i) => (
            <div key={i} className="flex">
              <span className="select-none text-right pr-3 pl-2 w-10 shrink-0 text-[#858585] tabular-nums">
                {i + 1}
              </span>
              <span className="whitespace-pre flex-1 pr-3">{line || " "}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
