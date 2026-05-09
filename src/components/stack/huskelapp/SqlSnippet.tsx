import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const KEYWORDS = new Set([
  "SELECT", "FROM", "WHERE", "GROUP", "BY", "HAVING", "ORDER", "LIMIT",
  "OFFSET", "DISTINCT", "AS", "ON", "AND", "OR", "NOT", "IN", "BETWEEN",
  "LIKE", "IS", "NULL", "EXISTS", "JOIN", "INNER", "LEFT", "RIGHT", "FULL",
  "OUTER", "CROSS", "SELF", "UNION", "ALL", "INTERSECT", "EXCEPT",
  "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE", "CREATE", "TABLE",
  "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "CHECK", "DEFAULT", "UNIQUE",
  "INTEGER", "TEXT", "REAL", "DATE", "DATETIME", "CASE", "WHEN", "THEN",
  "ELSE", "END", "ASC", "DESC", "COUNT", "SUM", "AVG", "MIN", "MAX",
  "COALESCE", "UPPER", "LOWER", "SUBSTR", "LENGTH", "ROUND", "CONCAT",
  "STRFTIME", "TRUE", "FALSE",
]);

function highlight(line: string): React.ReactNode {
  // Tokenize while preserving whitespace, strings, comments
  const tokens: Array<{ kind: "ws" | "str" | "comment" | "kw" | "num" | "ident" | "op"; text: string }> = [];
  let i = 0;
  while (i < line.length) {
    const c = line[i];
    if (c === " " || c === "\t") {
      let j = i;
      while (j < line.length && (line[j] === " " || line[j] === "\t")) j++;
      tokens.push({ kind: "ws", text: line.slice(i, j) });
      i = j;
      continue;
    }
    if (c === "-" && line[i + 1] === "-") {
      tokens.push({ kind: "comment", text: line.slice(i) });
      i = line.length;
      continue;
    }
    if (c === "'") {
      let j = i + 1;
      while (j < line.length && line[j] !== "'") j++;
      j = Math.min(j + 1, line.length);
      tokens.push({ kind: "str", text: line.slice(i, j) });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < line.length && /[A-Za-z0-9_]/.test(line[j])) j++;
      const word = line.slice(i, j);
      tokens.push({
        kind: KEYWORDS.has(word.toUpperCase()) ? "kw" : "ident",
        text: word,
      });
      i = j;
      continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < line.length && /[0-9.]/.test(line[j])) j++;
      tokens.push({ kind: "num", text: line.slice(i, j) });
      i = j;
      continue;
    }
    tokens.push({ kind: "op", text: c });
    i++;
  }
  return tokens.map((t, idx) => {
    if (t.kind === "kw")
      return (
        <span key={idx} className="text-pink-600 dark:text-pink-400 font-semibold">
          {t.text}
        </span>
      );
    if (t.kind === "str")
      return (
        <span key={idx} className="text-emerald-700 dark:text-emerald-400">
          {t.text}
        </span>
      );
    if (t.kind === "num")
      return (
        <span key={idx} className="text-amber-700 dark:text-amber-400">
          {t.text}
        </span>
      );
    if (t.kind === "comment")
      return (
        <span key={idx} className="text-muted-foreground italic">
          {t.text}
        </span>
      );
    if (t.kind === "op")
      return (
        <span key={idx} className="text-sky-700 dark:text-sky-400">
          {t.text}
        </span>
      );
    return <span key={idx}>{t.text}</span>;
  });
}

export function SqlSnippet({
  code,
  className,
  caption,
}: {
  code: string;
  className?: string;
  caption?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  const lines = code.split("\n");

  return (
    <div className={cn("group relative", className)}>
      <pre className="rounded-lg border border-border bg-muted/40 p-3 text-[13px] font-mono leading-relaxed overflow-x-auto pr-12">
        <code>
          {lines.map((ln, i) => (
            <div key={i}>{ln.length === 0 ? " " : highlight(ln)}</div>
          ))}
        </code>
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Kopiert" : "Kopier kode"}
        className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md border border-border bg-background/80 backdrop-blur px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3" />
            Kopiert
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            Kopier
          </>
        )}
      </button>
      {caption && (
        <div className="mt-1.5 text-xs text-muted-foreground">{caption}</div>
      )}
    </div>
  );
}
