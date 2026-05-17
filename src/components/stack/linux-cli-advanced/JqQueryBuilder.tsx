import { useMemo, useState } from "react";

// JqQueryBuilder — vis JSON som et klikkbart tre. Klikk på en path
// for å sette jq-filteret til den; aktiver "iterate" og "select" for
// å bygge mer kraftige queries. Mini-tolker som støtter:
//   .          (identity)
//   .a.b.c     (key chain)
//   .a[N]      (array index)
//   .[]        (iterate)
//   pipe:  X | Y
//   select(.foo == "bar")  / select(.foo > 100)  / select(.foo)
//   length, keys, type
//   {a, b}     (object construction fra eksisterende felt)
//
// Pure JS — ingen ekte jq.

type JqVal = unknown;

interface PathSeg {
  kind: "key" | "index";
  value: string | number;
}

function pathToJq(path: PathSeg[]): string {
  if (path.length === 0) return ".";
  return path
    .map((s) => (s.kind === "key" ? `.${s.value}` : `[${s.value}]`))
    .join("")
    .replace(/^\./, ".");
}

const SAMPLES: Array<{ label: string; json: string }> = [
  {
    label: "users.json",
    json: JSON.stringify(
      {
        users: [
          { id: 1, name: "Ane", email: "ane@x.no", active: true, age: 29 },
          { id: 2, name: "Bjørn", email: "b@x.no", active: false, age: 41 },
          { id: 3, name: "Cato", email: "c@x.no", active: true, age: 33 },
          { id: 4, name: "Dina", email: "d@x.no", active: true, age: 52 },
        ],
        meta: { total: 4, page: 1 },
      },
      null,
      2,
    ),
  },
  {
    label: "app.log.json",
    json: JSON.stringify(
      [
        { ts: "13:01", level: "info", path: "/api/users", status: 200 },
        { ts: "13:02", level: "error", path: "/api/items", status: 500, msg: "db timeout" },
        { ts: "13:03", level: "warn", path: "/api/login", status: 401 },
        { ts: "13:04", level: "error", path: "/api/items", status: 503, msg: "upstream down" },
        { ts: "13:05", level: "info", path: "/api/users", status: 200 },
      ],
      null,
      2,
    ),
  },
  {
    label: "config.json",
    json: JSON.stringify(
      {
        version: "1.4.2",
        server: { host: "0.0.0.0", port: 8080, tls: true },
        db: { driver: "postgres", host: "db.internal", port: 5432, pool: 10 },
        features: ["auth", "metrics", "tracing"],
      },
      null,
      2,
    ),
  },
];

// ---------- mini jq interpreter ----------

interface JqExpr {
  // run takes a single value, returns 0+ values (jq is a stream)
  run(v: JqVal): JqVal[];
  src: string;
}

function lit(src: string, fn: (v: JqVal) => JqVal[]): JqExpr {
  return { src, run: fn };
}

function compose(a: JqExpr, b: JqExpr): JqExpr {
  return {
    src: `${a.src} | ${b.src}`,
    run: (v) => a.run(v).flatMap((x) => b.run(x)),
  };
}

// Tokenize + parse a small jq subset
function parseJq(src: string): JqExpr {
  // Split on top-level | (no nesting depth tracking needed since we don't allow nested pipes)
  // But select(...) may contain |, so be careful: handle parentheses depth.
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (c === "(") depth++;
    else if (c === ")") depth--;
    if (c === "|" && depth === 0) {
      parts.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  parts.push(cur);

  const exprs = parts.map((p) => parseAtom(p.trim()));
  return exprs.reduce((acc, e) => (acc ? compose(acc, e) : e));
}

function parseAtom(s: string): JqExpr {
  if (s === "" || s === ".") return lit(".", (v) => [v]);
  if (s === "length") {
    return lit("length", (v) => {
      if (Array.isArray(v)) return [v.length];
      if (typeof v === "string") return [v.length];
      if (v && typeof v === "object") return [Object.keys(v as object).length];
      return [0];
    });
  }
  if (s === "keys") {
    return lit("keys", (v) => {
      if (v && typeof v === "object" && !Array.isArray(v)) return [Object.keys(v as object).sort()];
      return [null];
    });
  }
  if (s === "type") {
    return lit("type", (v) => {
      if (v === null) return ["null"];
      if (Array.isArray(v)) return ["array"];
      return [typeof v];
    });
  }
  if (s === "add") {
    return lit("add", (v) => {
      if (!Array.isArray(v)) return [null];
      if (v.length === 0) return [null];
      if (v.every((x) => typeof x === "number")) return [(v as number[]).reduce((a, b) => a + b, 0)];
      if (v.every((x) => typeof x === "string")) return [(v as string[]).join("")];
      return [null];
    });
  }
  // select(...)
  const sel = s.match(/^select\((.*)\)$/);
  if (sel) {
    const cond = sel[1].trim();
    return lit(s, (v) => (evalCond(cond, v) ? [v] : []));
  }
  // {a, b, c}
  const obj = s.match(/^\{(.*)\}$/);
  if (obj) {
    const keys = obj[1]
      .split(",")
      .map((k) => k.trim().replace(/^\./, ""))
      .filter(Boolean);
    return lit(s, (v) => {
      if (!v || typeof v !== "object") return [null];
      const out: Record<string, unknown> = {};
      for (const k of keys) out[k] = (v as Record<string, unknown>)[k];
      return [out];
    });
  }

  // path expression: . / .a / .a.b / .a[0] / .[] / .a[].b
  return parsePath(s);
}

function parsePath(s: string): JqExpr {
  if (!s.startsWith(".")) {
    return lit(s, () => {
      throw new Error(`Ukjent uttrykk: ${s}`);
    });
  }
  // Tokenize tail
  const tokens: Array<{ kind: "key" | "index" | "iter"; value?: string | number }> = [];
  let i = 1;
  while (i < s.length) {
    if (s[i] === ".") {
      i++;
      continue;
    }
    if (s[i] === "[") {
      const close = s.indexOf("]", i);
      if (close === -1) throw new Error("Manglende ]");
      const inside = s.slice(i + 1, close).trim();
      if (inside === "") tokens.push({ kind: "iter" });
      else if (/^-?\d+$/.test(inside)) tokens.push({ kind: "index", value: Number(inside) });
      else throw new Error(`Ukjent [${inside}]`);
      i = close + 1;
      continue;
    }
    // key
    const m = s.slice(i).match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (!m) throw new Error(`Ukjent token ved '${s.slice(i)}'`);
    tokens.push({ kind: "key", value: m[0] });
    i += m[0].length;
  }

  return lit(s, (v) => {
    let cur: JqVal[] = [v];
    for (const t of tokens) {
      const next: JqVal[] = [];
      for (const x of cur) {
        if (t.kind === "key") {
          if (x && typeof x === "object" && !Array.isArray(x)) {
            next.push((x as Record<string, unknown>)[t.value as string] ?? null);
          } else next.push(null);
        } else if (t.kind === "index") {
          if (Array.isArray(x)) {
            const idx = (t.value as number) < 0 ? x.length + (t.value as number) : (t.value as number);
            next.push(x[idx] ?? null);
          } else next.push(null);
        } else if (t.kind === "iter") {
          if (Array.isArray(x)) next.push(...x);
          else if (x && typeof x === "object") next.push(...Object.values(x as Record<string, unknown>));
        }
      }
      cur = next;
    }
    return cur;
  });
}

function evalCond(cond: string, v: JqVal): boolean {
  // Pattern: .path OP literal  | .path  (truthy)
  const m = cond.match(/^(\.[A-Za-z0-9_.\[\]]*)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
  if (m) {
    const lhsExpr = parsePath(m[1]);
    const lhs = lhsExpr.run(v)[0];
    const rhsStr = m[3].trim();
    let rhs: unknown;
    if (rhsStr === "true") rhs = true;
    else if (rhsStr === "false") rhs = false;
    else if (rhsStr === "null") rhs = null;
    else if (/^-?\d+(\.\d+)?$/.test(rhsStr)) rhs = Number(rhsStr);
    else if ((rhsStr.startsWith('"') && rhsStr.endsWith('"')) || (rhsStr.startsWith("'") && rhsStr.endsWith("'"))) {
      rhs = rhsStr.slice(1, -1);
    } else rhs = rhsStr;

    switch (m[2]) {
      case "==": return lhs === rhs;
      case "!=": return lhs !== rhs;
      case ">": return Number(lhs) > Number(rhs);
      case "<": return Number(lhs) < Number(rhs);
      case ">=": return Number(lhs) >= Number(rhs);
      case "<=": return Number(lhs) <= Number(rhs);
    }
  }
  // truthy of .path
  if (cond.startsWith(".")) {
    const r = parsePath(cond).run(v)[0];
    return Boolean(r);
  }
  return false;
}

// ---------- tree component ----------

interface TreeNodeProps {
  data: JqVal;
  path: PathSeg[];
  onPick: (path: PathSeg[]) => void;
  currentPath: string;
  depth: number;
}

function TreeNode({ data, path, onPick, currentPath, depth }: TreeNodeProps) {
  const [open, setOpen] = useState(depth < 2);
  const jq = pathToJq(path);
  const isSelected = jq === currentPath;
  const indent = { paddingLeft: `${depth * 12}px` };

  if (data === null) {
    return (
      <div style={indent} className={`font-mono text-xs py-0.5 cursor-pointer hover:bg-muted/40 ${isSelected ? "bg-brand/15" : ""}`} onClick={() => onPick(path)}>
        <span className="text-muted-foreground">{lastSeg(path)}</span>
        <span className="text-amber-600 dark:text-amber-400">null</span>
      </div>
    );
  }

  if (typeof data === "object" && Array.isArray(data)) {
    return (
      <div>
        <div style={indent} className={`font-mono text-xs py-0.5 cursor-pointer hover:bg-muted/40 ${isSelected ? "bg-brand/15" : ""}`} onClick={() => onPick(path)}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
            className="text-muted-foreground w-4 inline-block text-center"
          >
            {open ? "▾" : "▸"}
          </button>
          <span className="text-muted-foreground">{lastSeg(path)}</span>
          <span className="text-sky-700 dark:text-sky-300">array</span>
          <span className="text-muted-foreground"> [{data.length}]</span>
        </div>
        {open && data.map((v, i) => (
          <TreeNode key={i} data={v} path={[...path, { kind: "index", value: i }]} onPick={onPick} currentPath={currentPath} depth={depth + 1} />
        ))}
      </div>
    );
  }

  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    return (
      <div>
        <div style={indent} className={`font-mono text-xs py-0.5 cursor-pointer hover:bg-muted/40 ${isSelected ? "bg-brand/15" : ""}`} onClick={() => onPick(path)}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
            className="text-muted-foreground w-4 inline-block text-center"
          >
            {open ? "▾" : "▸"}
          </button>
          <span className="text-muted-foreground">{lastSeg(path)}</span>
          <span className="text-fuchsia-700 dark:text-fuchsia-300">object</span>
          <span className="text-muted-foreground"> {`{${Object.keys(obj).length}}`}</span>
        </div>
        {open && Object.entries(obj).map(([k, v]) => (
          <TreeNode key={k} data={v} path={[...path, { kind: "key", value: k }]} onPick={onPick} currentPath={currentPath} depth={depth + 1} />
        ))}
      </div>
    );
  }

  // primitive
  const valClass =
    typeof data === "string"
      ? "text-emerald-700 dark:text-emerald-300"
      : typeof data === "number"
      ? "text-sky-700 dark:text-sky-300"
      : "text-amber-600 dark:text-amber-400";

  return (
    <div style={indent} className={`font-mono text-xs py-0.5 cursor-pointer hover:bg-muted/40 ${isSelected ? "bg-brand/15" : ""}`} onClick={() => onPick(path)}>
      <span className="w-4 inline-block" />
      <span className="text-muted-foreground">{lastSeg(path)}</span>
      <span className={valClass}>{typeof data === "string" ? `"${data}"` : String(data)}</span>
    </div>
  );
}

function lastSeg(path: PathSeg[]): string {
  if (path.length === 0) return "";
  const seg = path[path.length - 1];
  return seg.kind === "key" ? `${seg.value}: ` : `[${seg.value}]: `;
}

// ---------- main ----------

export function JqQueryBuilder() {
  const [sampleIdx, setSampleIdx] = useState(0);
  const [jsonText, setJsonText] = useState(SAMPLES[0].json);
  const [query, setQuery] = useState(".");

  const parsed = useMemo<{ ok: true; value: JqVal } | { ok: false; error: string }>(() => {
    try {
      return { ok: true, value: JSON.parse(jsonText) };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }, [jsonText]);

  const output = useMemo(() => {
    if (!parsed.ok) return { ok: false as const, error: "Ugyldig JSON-input" };
    try {
      const expr = parseJq(query);
      const results = expr.run(parsed.value);
      return { ok: true as const, results };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  }, [parsed, query]);

  const onPick = (path: PathSeg[]) => {
    setQuery(pathToJq(path));
  };

  const presets = [
    { label: ".", q: "." },
    { label: ".users", q: ".users" },
    { label: ".users[]", q: ".users[]" },
    { label: ".users[] | .name", q: ".users[] | .name" },
    { label: ".users | length", q: ".users | length" },
    { label: '.users[] | select(.active == true)', q: ".users[] | select(.active == true)" },
    { label: ".users[] | {id, name}", q: ".users[] | {id, name}" },
    { label: 'select(.level == "error")', q: '.[] | select(.level == "error")' },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold text-base">JqQueryBuilder</h3>
          <p className="text-xs text-muted-foreground">
            Klikk på en path i treet for å sette filteret. Støtter{" "}
            <code>.a.b</code>, <code>.[N]</code>, <code>.[]</code>,{" "}
            <code>|</code>, <code>select(...)</code>, <code>{`{a, b}`}</code>,{" "}
            <code>length/keys/type/add</code>.
          </p>
        </div>
        <div className="flex gap-1">
          {SAMPLES.map((s, i) => (
            <button
              key={s.label}
              type="button"
              onClick={() => {
                setSampleIdx(i);
                setJsonText(s.json);
                setQuery(".");
              }}
              className={`text-[11px] px-2 py-1 rounded border ${
                sampleIdx === i ? "border-brand bg-brand/10 text-brand" : "border-border bg-muted/30 hover:bg-muted/60"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">JSON-tre</div>
          <div className="rounded-lg border border-border bg-background p-2 h-72 overflow-auto">
            {parsed.ok ? (
              <TreeNode data={parsed.value} path={[]} onPick={onPick} currentPath={query} depth={0} />
            ) : (
              <div className="text-xs text-rose-600 dark:text-rose-400 font-mono">{parsed.error}</div>
            )}
          </div>
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Rediger rå JSON</summary>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={8}
              className="mt-2 w-full font-mono text-xs p-2 rounded-lg border border-border bg-background resize-y"
              spellCheck={false}
            />
          </details>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-muted-foreground select-none">jq '</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-2 py-1.5 rounded border border-border bg-background"
              spellCheck={false}
            />
            <span className="text-muted-foreground select-none">'</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setQuery(p.q)}
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                  query === p.q ? "border-brand bg-brand/10 text-brand" : "border-border bg-muted/30 hover:bg-muted/60"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Output{output.ok ? ` (${output.results.length} verdi(er))` : ""}
          </div>
          <pre className="font-mono text-xs p-3 rounded-lg border border-border bg-muted/20 h-72 overflow-auto whitespace-pre-wrap">
            {output.ok ? (
              output.results.length === 0 ? (
                <span className="text-muted-foreground">(tomt — ingen treff)</span>
              ) : (
                output.results.map((r) => JSON.stringify(r, null, 2)).join("\n")
              )
            ) : (
              <span className="text-rose-600 dark:text-rose-400">{output.error}</span>
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
