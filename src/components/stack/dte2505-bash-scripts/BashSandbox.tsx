import { useMemo, useState } from "react";

// Very small bash subset interpreter for teaching purposes. It supports:
// - assignments: VAR=value (no spaces, double quotes optional)
// - echo "string" with $VAR / ${VAR} expansion
// - if [ -f path ] / [ -d path ] / [ "$a" = "$b" ] / [ "$a" != "$b" ] / [ -z "$a" ]
//   single-condition, else / fi
// - for VAR in word1 word2; do ... done
// - basic commands: ls, ls -1, cat, cat FILE, wc -l FILE, pwd, echo
// Anything else: pass-through "[unsupported] line N: ..." log entry.
//
// File-system is a flat in-memory tree, fixed layout.

const MOCK_FS: Record<string, string> = {
  "/etc/passwd":
    "root:x:0:0:root:/root:/bin/bash\nisak:x:1000:1000:Isak:/home/isak:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\n",
  "/etc/hostname": "lab-server\n",
  "/home/isak/todo.txt": "[ ] kjøp brød\n[x] lever oblig\n[ ] vask kjøkken\n",
  "/home/isak/notes.md": "# Notater\n- bash er rart\n- chmod 755 == rwxr-xr-x\n",
  "/var/log/sys.log": "boot ok\nservice nginx start\nservice nginx ok\nuser isak login\n",
};

const DIRS = new Set<string>([
  "/",
  "/etc",
  "/home",
  "/home/isak",
  "/var",
  "/var/log",
]);

function listDir(path: string): string[] {
  const prefix = path === "/" ? "/" : path + "/";
  const direct = new Set<string>();
  for (const f of Object.keys(MOCK_FS)) {
    if (f.startsWith(prefix)) {
      const rest = f.slice(prefix.length);
      const seg = rest.split("/")[0];
      if (seg) direct.add(seg);
    }
  }
  for (const d of DIRS) {
    if (d === path || !d.startsWith(prefix)) continue;
    const rest = d.slice(prefix.length);
    const seg = rest.split("/")[0];
    if (seg) direct.add(seg);
  }
  return Array.from(direct).sort();
}

function expand(s: string, env: Record<string, string>): string {
  return s.replace(/\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?/g, (_, name) => env[name] ?? "");
}

function unquote(s: string): string {
  const t = s.trim();
  if (t.length >= 2 && ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))) {
    return t.slice(1, -1);
  }
  return t;
}

interface ExecResult {
  stdout: string;
  exit: number;
}

function evalCondition(expr: string, env: Record<string, string>): boolean {
  // Strip outer [ ] and whitespace
  const inner = expr.trim().replace(/^\[\s*/, "").replace(/\s*\]$/, "").trim();
  // -f FILE / -d DIR / -z STR
  if (inner.startsWith("-f ")) {
    const path = expand(unquote(inner.slice(3).trim()), env);
    return MOCK_FS[path] !== undefined;
  }
  if (inner.startsWith("-d ")) {
    const path = expand(unquote(inner.slice(3).trim()), env);
    return DIRS.has(path);
  }
  if (inner.startsWith("-z ")) {
    const v = expand(unquote(inner.slice(3).trim()), env);
    return v === "";
  }
  if (inner.startsWith("-n ")) {
    const v = expand(unquote(inner.slice(3).trim()), env);
    return v !== "";
  }
  // STR = STR / STR != STR
  const eq = inner.match(/^(.+?)\s+(=|==|!=)\s+(.+)$/);
  if (eq) {
    const a = expand(unquote(eq[1]), env);
    const b = expand(unquote(eq[3]), env);
    return eq[2] === "!=" ? a !== b : a === b;
  }
  // NUM -eq NUM / -lt / -gt
  const numCmp = inner.match(/^(.+?)\s+(-eq|-ne|-lt|-gt|-le|-ge)\s+(.+)$/);
  if (numCmp) {
    const a = Number(expand(unquote(numCmp[1]), env));
    const b = Number(expand(unquote(numCmp[3]), env));
    if (Number.isNaN(a) || Number.isNaN(b)) return false;
    switch (numCmp[2]) {
      case "-eq": return a === b;
      case "-ne": return a !== b;
      case "-lt": return a < b;
      case "-gt": return a > b;
      case "-le": return a <= b;
      case "-ge": return a >= b;
    }
  }
  return false;
}

function runCommand(cmd: string, env: Record<string, string>): ExecResult {
  const parts = cmd.split(/\s+/);
  const name = parts[0];
  const args = parts.slice(1).map((a) => expand(unquote(a), env));
  switch (name) {
    case "echo": {
      const txt = expand(cmd.slice(4).trim(), env);
      return { stdout: unquote(txt) + "\n", exit: 0 };
    }
    case "pwd":
      return { stdout: (env.PWD || "/home/isak") + "\n", exit: 0 };
    case "ls": {
      const dir = args.find((a) => !a.startsWith("-")) || env.PWD || "/home/isak";
      const entries = listDir(dir);
      if (args.includes("-1")) return { stdout: entries.join("\n") + (entries.length ? "\n" : ""), exit: 0 };
      return { stdout: entries.join("  ") + (entries.length ? "\n" : ""), exit: 0 };
    }
    case "cat": {
      const f = args[0];
      if (!f) return { stdout: "", exit: 1 };
      if (MOCK_FS[f] === undefined) return { stdout: `cat: ${f}: No such file or directory\n`, exit: 1 };
      return { stdout: MOCK_FS[f], exit: 0 };
    }
    case "wc": {
      if (args[0] === "-l" && args[1] !== undefined) {
        const content = MOCK_FS[args[1]];
        if (content === undefined) return { stdout: `wc: ${args[1]}: No such file or directory\n`, exit: 1 };
        const lines = content.split("\n").filter((_, i, a) => i < a.length - 1 || a[i] !== "").length;
        return { stdout: `${lines} ${args[1]}\n`, exit: 0 };
      }
      return { stdout: "[unsupported wc invocation]\n", exit: 1 };
    }
    case "grep": {
      const pattern = args[0];
      const file = args[1];
      if (!pattern || !file) return { stdout: "[grep needs pattern + file]\n", exit: 1 };
      const content = MOCK_FS[file];
      if (content === undefined) return { stdout: `grep: ${file}: No such file or directory\n`, exit: 1 };
      const matches = content.split("\n").filter((l) => l.includes(pattern));
      return { stdout: matches.join("\n") + (matches.length ? "\n" : ""), exit: matches.length ? 0 : 1 };
    }
    case "true":
      return { stdout: "", exit: 0 };
    case "false":
      return { stdout: "", exit: 1 };
    case "":
      return { stdout: "", exit: 0 };
    default:
      return { stdout: `[unsupported] ${name}\n`, exit: 127 };
  }
}

function runScript(src: string): { stdout: string; trace: string[] } {
  const lines = src.split("\n").map((l) => l.replace(/#.*$/, "")); // strip comments
  const env: Record<string, string> = { PWD: "/home/isak", USER: "isak", HOME: "/home/isak" };
  const out: string[] = [];
  const trace: string[] = [];

  // Block stack for if/for: each frame is { kind, lines: string[], state }.
  type IfFrame = { kind: "if"; cond: boolean; branch: "then" | "else"; lines: string[] };
  type ForFrame = { kind: "for"; varName: string; values: string[]; body: string[] };
  const blocks: (IfFrame | ForFrame)[] = [];

  // 'collect' true = we are inside a block, collect lines into innermost block.
  function topIsIf(): IfFrame | null {
    const f = blocks[blocks.length - 1];
    return f && f.kind === "if" ? (f as IfFrame) : null;
  }
  function topIsFor(): ForFrame | null {
    const f = blocks[blocks.length - 1];
    return f && f.kind === "for" ? (f as ForFrame) : null;
  }

  function pushBlockLine(line: string) {
    const top = blocks[blocks.length - 1];
    if (!top) return;
    if (top.kind === "if") {
      top.lines.push(line);
    } else {
      top.body.push(line);
    }
  }

  function execLineList(ls: string[]) {
    for (const l of ls) execLine(l);
  }

  function execLine(line: string) {
    const t = line.trim();
    if (!t) return;

    // Block grammars handled at higher level.
    if (t.startsWith("if ")) {
      const condText = t.slice(3).replace(/;\s*then\s*$/, "").trim();
      const cond = evalCondition(condText, env);
      blocks.push({ kind: "if", cond, branch: "then", lines: [] });
      trace.push(`if: cond=${cond}`);
      return;
    }
    if (t === "then") return;
    if (t === "else") {
      const f = topIsIf();
      if (f) f.branch = "else";
      return;
    }
    if (t === "fi") {
      const f = blocks.pop();
      if (!f || f.kind !== "if") return;
      const linesToRun = f.lines.filter((l) => {
        return true;
      });
      // We split f.lines by an 'else' marker via 'branch' switching captured at recording-time.
      // Simpler: re-walk lines and decide based on a marker we recorded.
      const thenLines: string[] = [];
      const elseLines: string[] = [];
      let target = thenLines;
      for (const l of linesToRun) {
        if (l.trim() === "@@ELSE@@") {
          target = elseLines;
          continue;
        }
        target.push(l);
      }
      if (f.cond) execLineList(thenLines);
      else execLineList(elseLines);
      return;
    }
    if (t.startsWith("for ")) {
      const m = t.match(/^for\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\s+(.+?)(?:;\s*do)?$/);
      if (m) {
        const values = m[2].split(/\s+/).map((v) => expand(unquote(v), env));
        blocks.push({ kind: "for", varName: m[1], values, body: [] });
        trace.push(`for ${m[1]} in ${values.join(" ")}`);
      }
      return;
    }
    if (t === "do") return;
    if (t === "done") {
      const f = blocks.pop();
      if (!f || f.kind !== "for") return;
      for (const v of f.values) {
        env[f.varName] = v;
        execLineList(f.body);
      }
      return;
    }

    // Variable assignment
    const asgn = t.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.+)$/);
    if (asgn && !asgn[2].startsWith("(")) {
      env[asgn[1]] = unquote(expand(asgn[2], env));
      return;
    }

    // Otherwise: run as command
    const r = runCommand(t, env);
    out.push(r.stdout);
    env["?"] = String(r.exit);
  }

  // Walk lines: when inside a block, collect; else run.
  for (const raw of lines) {
    const t = raw.trim();
    if (blocks.length > 0) {
      // Nesting: detect open/close
      if (t.startsWith("if ")) {
        // Record line, but also push nested frame on flush? Simpler: don't support nesting beyond 1 deep.
        pushBlockLine(t);
        continue;
      }
      if (t === "else") {
        const f = topIsIf();
        if (f) f.lines.push("@@ELSE@@");
        continue;
      }
      if (t === "fi") {
        execLine(t);
        continue;
      }
      if (t.startsWith("for ")) {
        pushBlockLine(t);
        continue;
      }
      if (t === "done") {
        execLine(t);
        continue;
      }
      pushBlockLine(t);
    } else {
      execLine(raw);
    }
  }

  return { stdout: out.join(""), trace };
}

const PRESETS: { label: string; src: string; expected: string }[] = [
  {
    label: "1. Hei med variabel",
    src: `#!/bin/bash
navn="Isak"
echo "Hei, $navn"`,
    expected: "Hei, Isak\n",
  },
  {
    label: "2. If — finnes fila?",
    src: `if [ -f /etc/passwd ]
then
  echo "Ja, finnes"
else
  echo "Nei"
fi`,
    expected: "Ja, finnes\n",
  },
  {
    label: "3. For-løkke",
    src: `for f in a b c
do
  echo "fil $f"
done`,
    expected: "fil a\nfil b\nfil c\n",
  },
  {
    label: "4. grep + cat",
    src: `cat /etc/hostname
grep isak /etc/passwd`,
    expected:
      "lab-server\nisak:x:1000:1000:Isak:/home/isak:/bin/bash\n",
  },
];

export function BashSandbox() {
  const [src, setSrc] = useState(PRESETS[0].src);
  const [expected, setExpected] = useState<string>(PRESETS[0].expected);
  const [output, setOutput] = useState<string>("");

  const matches = useMemo(() => output === expected, [output, expected]);

  function loadPreset(idx: number) {
    setSrc(PRESETS[idx].src);
    setExpected(PRESETS[idx].expected);
    setOutput("");
  }

  function run() {
    const { stdout } = runScript(src);
    setOutput(stdout);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => loadPreset(i)}
            className="text-xs px-2.5 py-1 rounded-md border border-border hover:border-brand/40"
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-3 py-1.5 border-b border-border bg-muted/30 text-xs font-mono text-muted-foreground">
            script.sh
          </div>
          <textarea
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            spellCheck={false}
            className="w-full h-72 font-mono text-xs p-3 bg-background outline-none resize-none"
          />
          <div className="px-3 py-2 border-t border-border bg-muted/20 flex items-center justify-between">
            <button
              onClick={run}
              className="text-xs px-3 py-1 rounded-md bg-brand text-brand-foreground font-semibold"
            >
              ▶ Run mot mock-FS
            </button>
            <span className="text-[10px] text-muted-foreground font-mono">
              mock-FS: /etc/passwd, /etc/hostname, /home/isak/todo.txt, ...
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-3 py-1.5 border-b border-border bg-muted/30 text-xs font-mono text-muted-foreground flex items-center justify-between">
            <span>stdout</span>
            {output ? (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  matches ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                }`}
              >
                {matches ? "Match" : "Mismatch"}
              </span>
            ) : null}
          </div>
          <pre className="font-mono text-xs p-3 h-72 overflow-auto whitespace-pre-wrap">
            {output || <span className="text-muted-foreground">(klikk Run)</span>}
          </pre>
          <div className="px-3 py-2 border-t border-border bg-muted/20">
            <div className="text-[10px] text-muted-foreground mb-1">Forventet output:</div>
            <pre className="font-mono text-[11px] whitespace-pre-wrap">{expected}</pre>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">
        <strong>Merk:</strong> sandkassen tolker en liten bash-delmengde — assignments,{" "}
        <code>echo</code>, <code>cat</code>, <code>ls</code>, <code>grep</code>,{" "}
        <code>wc -l</code>, <code>if/then/else/fi</code>, <code>for ... do ... done</code> — nok
        til å øve på syntaks og kontrollflyt mot et fast mock-filsystem.
      </p>
    </div>
  );
}
