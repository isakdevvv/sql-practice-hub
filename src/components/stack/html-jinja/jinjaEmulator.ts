// Mini Jinja-emulator i pure TS — dekker det studenten ser i kurset:
//   {{ var }}, {{ obj.prop }}, {{ arr[0] }}, {{ x | filter }}
//   {% if cond %}{% elif %}{% else %}{% endif %}
//   {% for x in xs %}{% else %}{% endfor %}  ({% else %} kjøres når listen er tom)
//   {# kommentar #}
//
// Dette er IKKE en full Jinja-implementasjon. Det er nok til å vise studenten
// hvordan template-rendering "ser ut" mens de skriver. Ukjente filtre/tags gir
// en tydelig feilmelding i output i stedet for å krasje.
//
// Sikkerhet: autoescape ER på som default (matcher Jinja sin .html-default).
// `|safe` slår av escape for det enkelte uttrykket.

export interface RenderResult {
  output: string;
  error?: string;
}

export function renderJinja(template: string, context: Record<string, unknown>): RenderResult {
  try {
    const tokens = tokenize(template);
    const ast = parse(tokens);
    const output = render(ast, context);
    return { output };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { output: "", error: msg };
  }
}

// ---------- Tokenizer ----------

type Token =
  | { kind: "text"; value: string }
  | { kind: "var"; expr: string }
  | { kind: "tag"; expr: string };

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let buf = "";
  while (i < src.length) {
    if (src[i] === "{" && src[i + 1] === "{") {
      if (buf) { tokens.push({ kind: "text", value: buf }); buf = ""; }
      const end = src.indexOf("}}", i + 2);
      if (end === -1) throw new Error("manglende }} (uavsluttet {{ ... }})");
      tokens.push({ kind: "var", expr: src.slice(i + 2, end).trim() });
      i = end + 2;
    } else if (src[i] === "{" && src[i + 1] === "%") {
      if (buf) { tokens.push({ kind: "text", value: buf }); buf = ""; }
      const end = src.indexOf("%}", i + 2);
      if (end === -1) throw new Error("manglende %} (uavsluttet {% ... %})");
      tokens.push({ kind: "tag", expr: src.slice(i + 2, end).trim() });
      i = end + 2;
    } else if (src[i] === "{" && src[i + 1] === "#") {
      if (buf) { tokens.push({ kind: "text", value: buf }); buf = ""; }
      const end = src.indexOf("#}", i + 2);
      if (end === -1) throw new Error("manglende #} (uavsluttet kommentar)");
      i = end + 2;
    } else {
      buf += src[i++];
    }
  }
  if (buf) tokens.push({ kind: "text", value: buf });
  return tokens;
}

// ---------- AST ----------

type Node =
  | { type: "text"; value: string }
  | { type: "var"; expr: string }
  | { type: "if"; branches: { cond: string | null; body: Node[] }[] }
  | { type: "for"; loopVar: string; src: string; body: Node[]; emptyBody: Node[] };

function parse(tokens: Token[]): Node[] {
  let i = 0;

  function parseUntil(stoppers: string[]): { nodes: Node[]; stopper: string } {
    const nodes: Node[] = [];
    while (i < tokens.length) {
      const tok = tokens[i];
      if (tok.kind === "text") {
        nodes.push({ type: "text", value: tok.value });
        i++;
      } else if (tok.kind === "var") {
        nodes.push({ type: "var", expr: tok.expr });
        i++;
      } else {
        const head = tok.expr.split(/\s+/)[0];
        if (stoppers.includes(head)) return { nodes, stopper: tok.expr };
        if (head === "if") {
          nodes.push(parseIf());
        } else if (head === "for") {
          nodes.push(parseFor());
        } else {
          throw new Error(`ukjent tag: {% ${tok.expr} %}`);
        }
      }
    }
    if (stoppers.length) throw new Error(`forventet {% ${stoppers.join(" / ")} %} men nådde slutten`);
    return { nodes, stopper: "" };
  }

  function parseIf(): Node {
    const tok = tokens[i++];
    if (tok.kind !== "tag") throw new Error("intern feil: forventet tag");
    const head = tok.expr; // "if ..."
    const cond = head.slice(2).trim();
    const branches: { cond: string | null; body: Node[] }[] = [];
    let currentCond: string | null = cond;
    let { nodes, stopper } = parseUntil(["elif", "else", "endif"]);
    branches.push({ cond: currentCond, body: nodes });
    while (stopper.startsWith("elif")) {
      i++;
      currentCond = stopper.slice(4).trim();
      ({ nodes, stopper } = parseUntil(["elif", "else", "endif"]));
      branches.push({ cond: currentCond, body: nodes });
    }
    if (stopper === "else") {
      i++;
      ({ nodes, stopper } = parseUntil(["endif"]));
      branches.push({ cond: null, body: nodes });
    }
    if (stopper !== "endif") throw new Error("forventet {% endif %}");
    i++;
    return { type: "if", branches };
  }

  function parseFor(): Node {
    const tok = tokens[i++];
    if (tok.kind !== "tag") throw new Error("intern feil: forventet tag");
    const head = tok.expr; // "for x in xs"
    const m = /^for\s+([a-zA-Z_][\w]*)\s+in\s+(.+)$/.exec(head);
    if (!m) throw new Error(`ugyldig for-syntaks: {% ${head} %}`);
    const loopVar = m[1];
    const src = m[2].trim();
    let { nodes, stopper } = parseUntil(["else", "endfor"]);
    const body = nodes;
    let emptyBody: Node[] = [];
    if (stopper === "else") {
      i++;
      ({ nodes, stopper } = parseUntil(["endfor"]));
      emptyBody = nodes;
    }
    if (stopper !== "endfor") throw new Error("forventet {% endfor %}");
    i++;
    return { type: "for", loopVar, src, body, emptyBody };
  }

  const { nodes } = parseUntil([]);
  return nodes;
}

// ---------- Renderer ----------

function render(nodes: Node[], ctx: Record<string, unknown>): string {
  let out = "";
  for (const node of nodes) {
    if (node.type === "text") {
      out += node.value;
    } else if (node.type === "var") {
      out += renderVar(node.expr, ctx);
    } else if (node.type === "if") {
      for (const b of node.branches) {
        if (b.cond === null || truthy(evalExpr(b.cond, ctx))) {
          out += render(b.body, ctx);
          break;
        }
      }
    } else if (node.type === "for") {
      const iter = evalExpr(node.src, ctx);
      const list = toIterable(iter);
      if (list.length === 0) {
        out += render(node.emptyBody, ctx);
      } else {
        for (let idx = 0; idx < list.length; idx++) {
          const inner = { ...ctx, [node.loopVar]: list[idx], loop: { index: idx + 1, index0: idx, first: idx === 0, last: idx === list.length - 1 } };
          out += render(node.body, inner);
        }
      }
    }
  }
  return out;
}

function renderVar(expr: string, ctx: Record<string, unknown>): string {
  // `| safe` ved enden slår av autoescape. Alle andre filtre håndteres av
  // expression-parseren.
  let escape = true;
  let work = expr;
  const safeMatch = /\|\s*safe\s*$/.exec(work);
  if (safeMatch) {
    escape = false;
    work = work.slice(0, safeMatch.index).trim();
  }
  const val = evalExpr(work, ctx);
  const s = val == null ? "" : String(val);
  return escape ? htmlEscape(s) : s;
}

function applyFilter(name: string, val: unknown, args: unknown[]): unknown {
  switch (name) {
    case "upper": return String(val ?? "").toUpperCase();
    case "lower": return String(val ?? "").toLowerCase();
    case "capitalize": {
      const s = String(val ?? "");
      return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    }
    case "title": return String(val ?? "").replace(/\b\w/g, (c) => c.toUpperCase());
    case "trim": return String(val ?? "").trim();
    case "length": {
      if (Array.isArray(val)) return val.length;
      if (typeof val === "string") return val.length;
      if (val && typeof val === "object") return Object.keys(val as object).length;
      return 0;
    }
    case "default": return val == null || val === "" ? args[0] : val;
    case "join": return Array.isArray(val) ? val.join(String(args[0] ?? "")) : String(val ?? "");
    case "reverse": {
      if (Array.isArray(val)) return [...val].reverse();
      if (typeof val === "string") return val.split("").reverse().join("");
      return val;
    }
    case "abs": return typeof val === "number" ? Math.abs(val) : val;
    case "round": return typeof val === "number" ? Math.round(val) : val;
    default: throw new Error(`ukjent filter: ${name}`);
  }
}

function splitPipes(expr: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let buf = "";
  let inStr: string | null = null;
  for (let i = 0; i < expr.length; i++) {
    const c = expr[i];
    if (inStr) {
      buf += c;
      if (c === inStr && expr[i - 1] !== "\\") inStr = null;
      continue;
    }
    if (c === "'" || c === '"') { inStr = c; buf += c; continue; }
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    if (c === "|" && depth === 0) { parts.push(buf); buf = ""; continue; }
    buf += c;
  }
  parts.push(buf);
  return parts;
}

// ---------- Expression evaluator ----------
// Liten rekursiv-nedstigning. Støtter:
//   literaler: tall, 'streng', "streng", true, false, none/null
//   id med .prop og [idx] (også streng-keys)
//   binær: ==, !=, <, <=, >, >=, +, -, *, /, %
//   boolean: and, or, not
//   parentes

function evalExpr(src: string, ctx: Record<string, unknown>): unknown {
  const p = new ExprParser(src, ctx);
  const v = p.parseOr();
  p.expectEnd();
  return v;
}

class ExprParser {
  src: string;
  pos: number;
  ctx: Record<string, unknown>;
  constructor(src: string, ctx: Record<string, unknown>) {
    this.src = src;
    this.pos = 0;
    this.ctx = ctx;
  }
  skip() { while (this.pos < this.src.length && /\s/.test(this.src[this.pos])) this.pos++; }
  peek(s: string): boolean {
    this.skip();
    return this.src.startsWith(s, this.pos);
  }
  consume(s: string): boolean {
    if (this.peek(s)) { this.pos += s.length; return true; }
    return false;
  }
  consumeWord(w: string): boolean {
    this.skip();
    if (this.src.startsWith(w, this.pos)) {
      const after = this.src[this.pos + w.length];
      if (after === undefined || !/[\w]/.test(after)) {
        this.pos += w.length;
        return true;
      }
    }
    return false;
  }
  expectEnd() {
    this.skip();
    if (this.pos < this.src.length) throw new Error(`uventet tegn: ${this.src.slice(this.pos)}`);
  }
  parseOr(): unknown {
    let v = this.parseAnd();
    while (this.consumeWord("or")) {
      const r = this.parseAnd();
      v = truthy(v) ? v : r;
    }
    return v;
  }
  parseAnd(): unknown {
    let v = this.parseNot();
    while (this.consumeWord("and")) {
      const r = this.parseNot();
      v = truthy(v) ? r : v;
    }
    return v;
  }
  parseNot(): unknown {
    if (this.consumeWord("not")) {
      return !truthy(this.parseNot());
    }
    return this.parseCmp();
  }
  parseCmp(): unknown {
    let v = this.parseAdd();
    const ops = ["==", "!=", "<=", ">=", "<", ">"];
    while (true) {
      this.skip();
      let matched: string | null = null;
      for (const o of ops) { if (this.src.startsWith(o, this.pos)) { matched = o; break; } }
      if (!matched) break;
      this.pos += matched.length;
      const r = this.parseAdd();
      v = compare(v, matched, r);
    }
    return v;
  }
  parseAdd(): unknown {
    let v = this.parseMul();
    while (true) {
      this.skip();
      const c = this.src[this.pos];
      if (c === "+" || c === "-") {
        this.pos++;
        const r = this.parseMul();
        v = c === "+" ? num(v) + num(r) : num(v) - num(r);
      } else break;
    }
    return v;
  }
  parseMul(): unknown {
    let v = this.parseUnary();
    while (true) {
      this.skip();
      const c = this.src[this.pos];
      if (c === "*" || c === "/" || c === "%") {
        this.pos++;
        const r = this.parseUnary();
        if (c === "*") v = num(v) * num(r);
        else if (c === "/") v = num(v) / num(r);
        else v = num(v) % num(r);
      } else break;
    }
    return v;
  }
  parseUnary(): unknown {
    this.skip();
    if (this.consume("-")) return -num(this.parseUnary());
    return this.parseFilter();
  }
  parseFilter(): unknown {
    let v = this.parsePostfix();
    while (true) {
      this.skip();
      // Pass på: vi har ikke "||" som operator, så enslig "|" er filter-pipe.
      if (this.src[this.pos] !== "|") break;
      this.pos++;
      this.skip();
      const m = /^[a-zA-Z_]\w*/.exec(this.src.slice(this.pos));
      if (!m) throw new Error("forventet filter-navn etter |");
      const name = m[0];
      this.pos += name.length;
      this.skip();
      let args: unknown[] = [];
      if (this.consume("(")) {
        if (!this.consume(")")) {
          args.push(this.parseOr());
          this.skip();
          while (this.consume(",")) { args.push(this.parseOr()); this.skip(); }
          if (!this.consume(")")) throw new Error("forventet ) i filter-args");
        }
      }
      if (name === "safe") { /* håndteres i renderVar; her er det no-op */ }
      else v = applyFilter(name, v, args);
    }
    return v;
  }
  parsePostfix(): unknown {
    let v = this.parsePrimary();
    while (true) {
      this.skip();
      if (this.consume(".")) {
        this.skip();
        const m = /^[a-zA-Z_]\w*/.exec(this.src.slice(this.pos));
        if (!m) throw new Error("forventet propertynavn etter .");
        const name = m[0];
        this.pos += name.length;
        v = lookup(v, name);
      } else if (this.consume("[")) {
        const key = this.parseOr();
        this.skip();
        if (!this.consume("]")) throw new Error("forventet ]");
        v = lookup(v, key);
      } else break;
    }
    return v;
  }
  parsePrimary(): unknown {
    this.skip();
    if (this.consume("(")) {
      const v = this.parseOr();
      this.skip();
      if (!this.consume(")")) throw new Error("forventet )");
      return v;
    }
    const c = this.src[this.pos];
    if (c === "'" || c === '"') {
      this.pos++;
      let s = "";
      while (this.pos < this.src.length && this.src[this.pos] !== c) {
        if (this.src[this.pos] === "\\") { s += this.src[this.pos + 1] ?? ""; this.pos += 2; }
        else s += this.src[this.pos++];
      }
      if (!this.consume(c)) throw new Error("uavsluttet streng");
      return s;
    }
    if (/[0-9]/.test(c)) {
      const m = /^[0-9]+(\.[0-9]+)?/.exec(this.src.slice(this.pos));
      if (!m) throw new Error("tall forventet");
      this.pos += m[0].length;
      return parseFloat(m[0]);
    }
    if (this.consumeWord("true")) return true;
    if (this.consumeWord("false")) return false;
    if (this.consumeWord("none") || this.consumeWord("null")) return null;
    const m = /^[a-zA-Z_]\w*/.exec(this.src.slice(this.pos));
    if (!m) throw new Error(`uventet tegn: ${c}`);
    const name = m[0];
    this.pos += name.length;
    return this.ctx[name];
  }
}

// ---------- helpers ----------

function lookup(obj: unknown, key: unknown): unknown {
  if (obj == null) return undefined;
  if (Array.isArray(obj)) {
    if (typeof key === "number") return obj[key];
    if (typeof key === "string" && key === "length") return obj.length;
    return undefined;
  }
  if (typeof obj === "object") {
    return (obj as Record<string, unknown>)[String(key)];
  }
  return undefined;
}

function truthy(v: unknown): boolean {
  if (v == null || v === false || v === 0 || v === "") return false;
  if (Array.isArray(v) && v.length === 0) return false;
  return true;
}

function num(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))) return Number(v);
  if (typeof v === "boolean") return v ? 1 : 0;
  return NaN;
}

function compare(a: unknown, op: string, b: unknown): boolean {
  if (op === "==") return a === b || (typeof a === "number" && typeof b === "number" && a === b) || String(a) === String(b);
  if (op === "!=") return !compare(a, "==", b);
  const na = num(a), nb = num(b);
  const both = !isNaN(na) && !isNaN(nb);
  if (op === "<") return both ? na < nb : String(a) < String(b);
  if (op === "<=") return both ? na <= nb : String(a) <= String(b);
  if (op === ">") return both ? na > nb : String(a) > String(b);
  if (op === ">=") return both ? na >= nb : String(a) >= String(b);
  return false;
}

function toIterable(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  if (v && typeof v === "object") return Object.values(v as object);
  if (typeof v === "string") return v.split("");
  if (v == null) return [];
  return [v];
}

function htmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
