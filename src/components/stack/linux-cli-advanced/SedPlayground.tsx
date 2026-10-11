import { useMemo, useState } from "react";

// SedPlayground — pure-JS emulator av de vanligste sed-mønstrene:
//   s/SØK/ERSTATT/FLAGG  (med flagg g, i, N=tall)
//   alternative separatorer (s|...|...|, s#...#...#)
//   adressering: /regex/ s/.../.../, 5,10 s/.../.../, $ s/.../.../
//   -n + p (print bare adresserte linjer)
//
// Studenten skriver et sed-uttrykk og ser INPUT → OUTPUT live.
// Hver linje vises som "match" eller "ikke match" mot adressen,
// og de byttede delene utheves i diff-grønt så regelen visualiseres.

interface SedRule {
  kind: "substitute";
  address: SedAddress | null;
  separator: string;
  pattern: string;
  replacement: string;
  flagG: boolean;
  flagI: boolean;
  flagN: number; // 0 = ingen Nth-flag
}

interface SedPrint {
  kind: "print";
  address: SedAddress | null;
}

type SedCommand = SedRule | SedPrint;

type SedAddress =
  | { type: "regex"; re: string }
  | { type: "lineRange"; from: number; to: number | "$" }
  | { type: "lastLine" };

interface ParseResult {
  command: SedCommand | null;
  error: string | null;
}

function parseAddress(src: string): { addr: SedAddress | null; rest: string } {
  const trimmed = src.replace(/^\s+/, "");
  // $ alone
  if (trimmed.startsWith("$") && !/^\$[a-z]/i.test(trimmed)) {
    return { addr: { type: "lastLine" }, rest: trimmed.slice(1) };
  }
  // /regex/
  if (trimmed.startsWith("/")) {
    let i = 1;
    while (i < trimmed.length && trimmed[i] !== "/") {
      if (trimmed[i] === "\\" && i + 1 < trimmed.length) i += 2;
      else i++;
    }
    if (i >= trimmed.length) {
      return { addr: null, rest: trimmed };
    }
    const re = trimmed.slice(1, i);
    return { addr: { type: "regex", re }, rest: trimmed.slice(i + 1) };
  }
  // N,M or N,$ or N
  const m = trimmed.match(/^(\d+)(?:,(\d+|\$))?\s*/);
  if (m) {
    const from = Number(m[1]);
    const toStr = m[2];
    const to: number | "$" | undefined = toStr === undefined ? undefined : toStr === "$" ? "$" : Number(toStr);
    if (to === undefined) {
      return { addr: { type: "lineRange", from, to: from }, rest: trimmed.slice(m[0].length) };
    }
    return { addr: { type: "lineRange", from, to }, rest: trimmed.slice(m[0].length) };
  }
  return { addr: null, rest: trimmed };
}

function parseSed(src: string): ParseResult {
  if (!src.trim()) return { command: null, error: null };
  // Strip surrounding quotes (single or double) — folk lærer å skrive sed 's/.../.../'
  let raw = src.trim();
  if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"'))) {
    raw = raw.slice(1, -1);
  }

  const { addr, rest } = parseAddress(raw);
  const body = rest.replace(/^\s+/, "");

  if (body.startsWith("p")) {
    return { command: { kind: "print", address: addr }, error: null };
  }

  if (!body.startsWith("s")) {
    return { command: null, error: `Støtter bare 's///' og 'p' — fikk: ${body[0] ?? "(tomt)"}` };
  }

  const sep = body[1];
  if (!sep) return { command: null, error: "Mangler separator etter 's'" };

  const parts: string[] = [];
  let cur = "";
  for (let i = 2; i < body.length; i++) {
    const ch = body[i];
    if (ch === "\\" && i + 1 < body.length) {
      cur += ch + body[i + 1];
      i++;
      continue;
    }
    if (ch === sep) {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  parts.push(cur);

  if (parts.length < 2) {
    return { command: null, error: `s-kommando krever minst to '${sep}' separatorer` };
  }
  const pattern = parts[0];
  const replacement = parts[1];
  const flags = parts[2] ?? "";

  let flagG = false;
  let flagI = false;
  let flagN = 0;
  for (const f of flags) {
    if (f === "g") flagG = true;
    else if (f === "i") flagI = true;
    else if (/\d/.test(f)) flagN = flagN * 10 + Number(f);
    else return { command: null, error: `Ukjent flagg: ${f}` };
  }

  return {
    command: {
      kind: "substitute",
      address: addr,
      separator: sep,
      pattern,
      replacement,
      flagG,
      flagI,
      flagN,
    },
    error: null,
  };
}

function applyBackrefs(replacement: string, match: RegExpExecArray): string {
  return replacement.replace(/\\(\d)/g, (_, d) => match[Number(d)] ?? "");
}

interface LineResult {
  lineNum: number;
  original: string;
  output: string;
  matched: boolean; // address matched
  changed: boolean; // substitution actually applied
  spans: Array<{ kind: "keep" | "removed" | "added"; text: string }>;
  printed: boolean; // for -n p commands
}

function addressMatches(addr: SedAddress | null, lineNum: number, line: string, totalLines: number): boolean {
  if (!addr) return true;
  if (addr.type === "lastLine") return lineNum === totalLines;
  if (addr.type === "lineRange") {
    const to = addr.to === "$" ? totalLines : addr.to;
    return lineNum >= addr.from && lineNum <= to;
  }
  if (addr.type === "regex") {
    try {
      return new RegExp(addr.re).test(line);
    } catch {
      return false;
    }
  }
  return false;
}

function runSed(input: string, expr: string, quietN: boolean): { results: LineResult[]; error: string | null } {
  const parsed = parseSed(expr);
  if (parsed.error) return { results: [], error: parsed.error };
  const cmd = parsed.command;

  const lines = input.split("\n");
  const totalLines = lines.length;

  const results: LineResult[] = lines.map((line, idx) => {
    const lineNum = idx + 1;
    const matched = cmd ? addressMatches(cmd.address, lineNum, line, totalLines) : true;

    let output = line;
    let changed = false;
    const spans: LineResult["spans"] = [];
    let printed = true;
    if (quietN) printed = false;

    if (cmd && cmd.kind === "print" && matched) {
      printed = true;
      spans.push({ kind: "keep", text: line });
    } else if (cmd && cmd.kind === "substitute" && matched) {
      try {
        const flagStr = "g" + (cmd.flagI ? "i" : "") + "d";
        const re = new RegExp(cmd.pattern, flagStr);
        let last = 0;
        let n = 0;
        let m: RegExpExecArray | null;
        while ((m = re.exec(line)) !== null) {
          n++;
          const keep = line.slice(last, m.index);
          if (keep) spans.push({ kind: "keep", text: keep });

          const replaceThis = cmd.flagG || (cmd.flagN === 0 && n === 1) || cmd.flagN === n;
          if (replaceThis) {
            const replaced = applyBackrefs(cmd.replacement, m);
            spans.push({ kind: "removed", text: m[0] });
            spans.push({ kind: "added", text: replaced });
            changed = true;
          } else {
            spans.push({ kind: "keep", text: m[0] });
          }

          last = m.index + m[0].length;
          if (m[0].length === 0) re.lastIndex++;
        }
        if (last < line.length) spans.push({ kind: "keep", text: line.slice(last) });

        // Build output from spans (keep + added)
        output = spans
          .filter((s) => s.kind !== "removed")
          .map((s) => s.text)
          .join("");

        if (quietN && changed) printed = false; // -n: bare 'p' printer
      } catch (e) {
        return {
          lineNum,
          original: line,
          output: line,
          matched,
          changed: false,
          spans: [{ kind: "keep", text: line }],
          printed: !quietN,
        };
      }
    } else {
      spans.push({ kind: "keep", text: line });
    }

    return { lineNum, original: line, output, matched, changed, spans, printed };
  });

  return { results, error: null };
}

const SAMPLE_INPUT = `hei verden
hei alle sammen
HEI alle
hello world
# kommentar: hei
mer hei på slutten`;

const PRESETS: Array<{ label: string; expr: string; explain: string; n?: boolean }> = [
  { label: "s/hei/hallo/", expr: "s/hei/hallo/", explain: "Første 'hei' per linje byttes" },
  { label: "s/hei/hallo/g", expr: "s/hei/hallo/g", explain: "g = global: ALLE 'hei' per linje" },
  { label: "s/hei/HALLO/gi", expr: "s/hei/HALLO/gi", explain: "gi = global + case-insensitive (treffer HEI)" },
  { label: "s/hei/hallo/2", expr: "s/hei/hallo/2", explain: "Bare 2. forekomst per linje" },
  { label: "/^#/s/hei/hallo/", expr: "/^#/s/hei/hallo/", explain: "Adressering: bare på linjer som starter med #" },
  { label: "2,4 s/hei/hallo/g", expr: "2,4 s/hei/hallo/g", explain: "Bare linje 2–4" },
  { label: "alt. separator", expr: "s|/usr|/opt|", explain: "Bruk | i stedet for / når mønsteret inneholder /" },
  { label: "$ s/hei/SLUTT/", expr: "$ s/hei/SLUTT/", explain: "$ = bare siste linje" },
  { label: "-n + p (print 2,4)", expr: "2,4 p", explain: "Med -n: print bare adresserte linjer", n: true },
];

export function SedPlayground() {
  const [input, setInput] = useState(SAMPLE_INPUT);
  const [expr, setExpr] = useState("s/hei/hallo/g");
  const [quietN, setQuietN] = useState(false);

  const { results, error } = useMemo(() => runSed(input, expr, quietN), [input, expr, quietN]);

  const changedCount = results.filter((r) => r.changed).length;
  const outputLines = results.filter((r) => r.printed);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold text-base">SedPlayground</h3>
          <p className="text-xs text-muted-foreground">
            Skriv et <code>sed</code>-uttrykk og se hvilke linjer som matcher og
            hva som byttes — pure JS, ingen ekte sed kjøres.
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground select-none">
          <input
            type="checkbox"
            checked={quietN}
            onChange={(e) => setQuietN(e.target.checked)}
            className="accent-brand"
          />
          <code>-n</code> (quiet — bare p printer)
        </label>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setExpr(p.expr);
              if (p.n !== undefined) setQuietN(p.n);
            }}
            className={`text-[11px] font-mono px-2 py-1 rounded border transition-colors ${
              expr === p.expr
                ? "border-brand bg-brand/10 text-brand"
                : "border-border bg-muted/30 hover:bg-muted/60 text-foreground"
            }`}
            title={p.explain}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-3">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Input
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={7}
            className="w-full font-mono text-xs p-3 rounded-lg border border-border bg-background resize-y"
            spellCheck={false}
          />
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block">
            Sed-uttrykk
          </label>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-muted-foreground select-none">
              {quietN ? "sed -n '" : "sed '"}
            </span>
            <input
              type="text"
              value={expr}
              onChange={(e) => setExpr(e.target.value)}
              className="flex-1 px-2 py-1.5 rounded border border-border bg-background"
              spellCheck={false}
            />
            <span className="text-muted-foreground select-none">'</span>
          </div>
          {error ? (
            <div className="text-xs text-rose-600 dark:text-rose-400 font-mono">
              Parse-feil: {error}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              {changedCount} av {results.length} linjer endret · {outputLines.length} linje(r) i output
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Linje-for-linje (diff)
          </div>
          <div className="rounded-lg border border-border bg-background overflow-hidden">
            <div className="font-mono text-xs divide-y divide-border max-h-72 overflow-auto">
              {results.map((r) => (
                <div
                  key={r.lineNum}
                  className={`flex items-start gap-2 px-2 py-1.5 ${
                    !r.printed
                      ? "opacity-40 line-through decoration-rose-500/40"
                      : r.changed
                      ? "bg-emerald-500/5"
                      : r.matched
                      ? ""
                      : "bg-muted/20"
                  }`}
                >
                  <span className="text-[10px] text-muted-foreground select-none w-6 text-right shrink-0 pt-0.5">
                    {r.lineNum}
                  </span>
                  <span className="flex-1 whitespace-pre-wrap break-all">
                    {r.spans.map((s, i) =>
                      s.kind === "removed" ? (
                        <span
                          key={i}
                          className="bg-rose-500/20 text-rose-700 dark:text-rose-300 line-through"
                        >
                          {s.text || " "}
                        </span>
                      ) : s.kind === "added" ? (
                        <span
                          key={i}
                          className="bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-semibold"
                        >
                          {s.text || " "}
                        </span>
                      ) : (
                        <span key={i}>{s.text}</span>
                      )
                    )}
                  </span>
                  <span className="text-[9px] text-muted-foreground select-none shrink-0 pt-0.5">
                    {r.changed ? "✎" : r.matched ? "·" : " "}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Output (stdout)
          </div>
          <pre className="font-mono text-xs p-3 rounded-lg border border-border bg-muted/20 max-h-40 overflow-auto whitespace-pre-wrap">
            {outputLines.map((r) => r.output).join("\n") || (
              <span className="text-muted-foreground">(tomt — alle linjer ble undertrykt)</span>
            )}
          </pre>
        </div>
      </div>

      <div className="text-[11px] text-muted-foreground">
        <strong>Støttet:</strong> <code>s/SØK/ERSTATT/[gi N]</code>, alternative
        separatorer (<code>s|...|...|</code>), adressering med{" "}
        <code>/regex/</code>, <code>N,M</code>, <code>$</code>, og <code>p</code>{" "}
        + <code>-n</code>. Backreferanser <code>\1..\9</code> i replacement.{" "}
        Ikke støttet: hold-buffer, multi-line, kommando-kjeder med <code>;</code>.
      </div>
    </div>
  );
}
