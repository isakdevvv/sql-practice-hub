import { useMemo, useState } from "react";

type Token =
  | { kind: "var"; name: "p" | "q" | "r" }
  | { kind: "op"; op: "AND" | "OR" | "NOT" | "IMP" | "IFF" | "XOR" }
  | { kind: "lparen" }
  | { kind: "rparen" };

const SYMBOL: Record<string, string> = {
  AND: "∧",
  OR: "∨",
  NOT: "¬",
  IMP: "→",
  IFF: "↔",
  XOR: "⊕",
};

const PRESETS: { label: string; expr: string; note: string }[] = [
  { label: "p ∧ q", expr: "p ∧ q", note: "Konjunksjon — sant kun når begge er sanne." },
  { label: "p ∨ q", expr: "p ∨ q", note: "Disjunksjon — sant når minst én er sann." },
  { label: "¬p", expr: "¬p", note: "Negasjon — snur sannhetsverdien." },
  { label: "p → q", expr: "p → q", note: "Implikasjon — usann KUN når p=T, q=F." },
  { label: "p ↔ q", expr: "p ↔ q", note: "Bikondisjonal — sant når p og q er like." },
  { label: "¬(p ∧ q)", expr: "¬(p ∧ q)", note: "De Morgan — ekvivalent med ¬p ∨ ¬q." },
  { label: "¬p ∨ ¬q", expr: "¬p ∨ ¬q", note: "De Morgan-partner til ¬(p ∧ q)." },
  { label: "(p → q) ∧ (q → p)", expr: "(p → q) ∧ (q → p)", note: "Identisk med p ↔ q." },
];

export function TruthTableBuilder() {
  const [expr, setExpr] = useState("p → q");

  const { rows, error, varsUsed } = useMemo(() => evaluate(expr), [expr]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          Sannhetstabell-bygger
        </div>
        <div className="text-[10px] text-muted-foreground">
          Symboler: ¬ ∧ ∨ → ↔ ⊕ — eller bruk presets
        </div>
      </div>

      <input
        type="text"
        value={expr}
        onChange={(e) => setExpr(e.target.value)}
        className="w-full px-2 py-2 rounded border border-border bg-background font-mono text-sm mb-2"
        placeholder="f.eks. p → (q ∨ ¬r)"
      />

      <div className="flex flex-wrap gap-1.5 mb-3">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setExpr(p.expr)}
            className="px-2 py-1 rounded text-[11px] border border-border bg-background hover:bg-muted font-mono"
            title={p.note}
          >
            {p.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="text-xs text-red-500 font-mono">⚠ {error}</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="text-xs font-mono">
              <thead>
                <tr className="border-b border-border">
                  {varsUsed.map((v) => (
                    <th key={v} className="px-3 py-1.5 text-center font-semibold">
                      {v}
                    </th>
                  ))}
                  <th className="px-3 py-1.5 text-center font-semibold text-brand border-l border-border">
                    {expr}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-border/40">
                    {row.assign.map((val, j) => (
                      <td key={j} className="px-3 py-1 text-center">
                        <span className={val ? "text-emerald-500" : "text-muted-foreground"}>
                          {val ? "T" : "F"}
                        </span>
                      </td>
                    ))}
                    <td
                      className={`px-3 py-1 text-center border-l border-border font-semibold ${
                        row.value ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {row.value ? "T" : "F"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-[11px] text-muted-foreground">
            {summarize(rows)}
          </div>
        </>
      )}
    </div>
  );
}

function summarize(rows: { value: boolean }[]): string {
  if (rows.length === 0) return "";
  const trues = rows.filter((r) => r.value).length;
  if (trues === rows.length) return "Tautologi — sant for alle tildelinger.";
  if (trues === 0) return "Kontradiksjon — usant for alle tildelinger.";
  return `Kontingent — ${trues} av ${rows.length} rader er sanne.`;
}

function evaluate(raw: string): {
  rows: { assign: boolean[]; value: boolean }[];
  varsUsed: string[];
  error: string | null;
} {
  try {
    const tokens = tokenize(raw);
    const vars = uniqueVars(tokens);
    if (vars.length === 0) return { rows: [], varsUsed: [], error: "Ingen variabler funnet (bruk p, q, r)." };
    if (vars.length > 3) return { rows: [], varsUsed: [], error: "Maks 3 variabler (p, q, r)." };

    const rows: { assign: boolean[]; value: boolean }[] = [];
    const n = vars.length;
    for (let mask = 0; mask < 1 << n; mask++) {
      const assign: boolean[] = vars.map((_, i) => Boolean(mask & (1 << (n - 1 - i))));
      const env: Record<string, boolean> = {};
      vars.forEach((v, i) => (env[v] = assign[i]));
      const value = parseAndEval(tokens, env);
      rows.push({ assign, value });
    }
    return { rows, varsUsed: vars, error: null };
  } catch (e) {
    return { rows: [], varsUsed: [], error: e instanceof Error ? e.message : "Parse-feil" };
  }
}

function tokenize(s: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === "p" || ch === "q" || ch === "r") {
      out.push({ kind: "var", name: ch });
      i++;
      continue;
    }
    if (ch === "(") {
      out.push({ kind: "lparen" });
      i++;
      continue;
    }
    if (ch === ")") {
      out.push({ kind: "rparen" });
      i++;
      continue;
    }
    if (ch === "¬" || ch === "~" || ch === "!") {
      out.push({ kind: "op", op: "NOT" });
      i++;
      continue;
    }
    if (ch === "∧" || ch === "&") {
      out.push({ kind: "op", op: "AND" });
      i++;
      continue;
    }
    if (ch === "∨" || ch === "|") {
      out.push({ kind: "op", op: "OR" });
      i++;
      continue;
    }
    if (ch === "⊕" || ch === "^") {
      out.push({ kind: "op", op: "XOR" });
      i++;
      continue;
    }
    if (ch === "→") {
      out.push({ kind: "op", op: "IMP" });
      i++;
      continue;
    }
    if (ch === "↔") {
      out.push({ kind: "op", op: "IFF" });
      i++;
      continue;
    }
    if (s.slice(i, i + 2) === "->") {
      out.push({ kind: "op", op: "IMP" });
      i += 2;
      continue;
    }
    if (s.slice(i, i + 3) === "<->") {
      out.push({ kind: "op", op: "IFF" });
      i += 3;
      continue;
    }
    throw new Error(`Ukjent tegn: ${ch}`);
  }
  return out;
}

function uniqueVars(tokens: Token[]): string[] {
  const set = new Set<string>();
  for (const t of tokens) if (t.kind === "var") set.add(t.name);
  return Array.from(set).sort();
}

function parseAndEval(tokens: Token[], env: Record<string, boolean>): boolean {
  let pos = 0;

  function peek(): Token | undefined {
    return tokens[pos];
  }
  function consume(): Token {
    return tokens[pos++];
  }

  // Pratt-style precedence: NOT > AND > OR/XOR > IMP > IFF
  function parsePrimary(): boolean {
    const t = peek();
    if (!t) throw new Error("Uventet slutt på uttrykk");
    if (t.kind === "lparen") {
      consume();
      const v = parseExpr();
      const next = consume();
      if (!next || next.kind !== "rparen") throw new Error("Manglende )");
      return v;
    }
    if (t.kind === "op" && t.op === "NOT") {
      consume();
      return !parsePrimary();
    }
    if (t.kind === "var") {
      consume();
      return env[t.name];
    }
    throw new Error(`Uventet token`);
  }

  function parseAnd(): boolean {
    let left = parsePrimary();
    while (peek()?.kind === "op" && (peek() as Extract<Token, { kind: "op" }>).op === "AND") {
      consume();
      const right = parsePrimary();
      left = left && right;
    }
    return left;
  }

  function parseOr(): boolean {
    let left = parseAnd();
    while (
      peek()?.kind === "op" &&
      ((peek() as Extract<Token, { kind: "op" }>).op === "OR" ||
        (peek() as Extract<Token, { kind: "op" }>).op === "XOR")
    ) {
      const op = (consume() as Extract<Token, { kind: "op" }>).op;
      const right = parseAnd();
      left = op === "XOR" ? left !== right : left || right;
    }
    return left;
  }

  function parseImp(): boolean {
    const left = parseOr();
    if (peek()?.kind === "op" && (peek() as Extract<Token, { kind: "op" }>).op === "IMP") {
      consume();
      const right = parseImp();
      return !left || right;
    }
    return left;
  }

  function parseExpr(): boolean {
    const left = parseImp();
    if (peek()?.kind === "op" && (peek() as Extract<Token, { kind: "op" }>).op === "IFF") {
      consume();
      const right = parseExpr();
      return left === right;
    }
    return left;
  }

  const v = parseExpr();
  if (pos !== tokens.length) throw new Error("Ekstra tokens etter slutt");
  return v;
}
