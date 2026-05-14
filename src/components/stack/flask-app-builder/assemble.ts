import { OPTIONS } from "./options";
import type { AppOption } from "./types";

/**
 * Resolverer transitive `requires`-avhengigheter. Hvis bruker velger
 * `db-list` aktiveres `db-init` automatisk.
 */
export function resolveRequires(selected: Set<string>): Set<string> {
  const byId = new Map(OPTIONS.map((o) => [o.id, o]));
  const result = new Set(selected);
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of Array.from(result)) {
      const opt = byId.get(id);
      if (!opt?.requires) continue;
      for (const req of opt.requires) {
        if (!result.has(req)) {
          result.add(req);
          changed = true;
        }
      }
    }
  }
  return result;
}

/** Finn options som er i konflikt med valgte (UI viser dette som warning). */
export function findConflicts(selected: Set<string>): { a: string; b: string }[] {
  const conflicts: { a: string; b: string }[] = [];
  const byId = new Map(OPTIONS.map((o) => [o.id, o]));
  for (const id of selected) {
    const opt = byId.get(id);
    if (!opt?.conflicts) continue;
    for (const c of opt.conflicts) {
      if (selected.has(c)) conflicts.push({ a: id, b: c });
    }
  }
  return conflicts;
}

interface Sections {
  imports: Set<string>;
  config: string[];
  helpers: string[];
  routes: string[];
  /** Templates som passer i DictLoader (base, navbar, footer, flash). */
  dictTemplates: Record<string, string>;
  /** Templates som brukes direkte via render_template_string (TEMPLATE_-prefiks). */
  inlineTemplates: Record<string, string>;
}

function emptySections(): Sections {
  return {
    imports: new Set(),
    config: [],
    helpers: [],
    routes: [],
    dictTemplates: {},
    inlineTemplates: {},
  };
}

function ingest(sec: Sections, opt: AppOption): void {
  const c = opt.contributes;
  if (c.imports) for (const i of c.imports) sec.imports.add(i);
  if (c.config) sec.config.push(...c.config);
  if (c.helpers) sec.helpers.push(...c.helpers);
  if (c.routes) sec.routes.push(...c.routes);
  if (c.templates) {
    for (const [name, body] of Object.entries(c.templates)) {
      if (name.startsWith("TEMPLATE_")) {
        sec.inlineTemplates[name] = body;
      } else {
        sec.dictTemplates[name] = body;
      }
    }
  }
}

/**
 * Indenter en streng med to mellomrom. Brukes ikke i den finale outputten —
 * vi rendrer rett som top-level statements.
 */
function pythonStringLiteral(s: string): string {
  // Use triple-quoted raw string. Escape backslashes and triple-quotes.
  const escaped = s.replace(/\\/g, "\\\\").replace(/"""/g, '\\"\\"\\"');
  return `"""${escaped}"""`;
}

/**
 * Hovedfunksjon: ta sett av valgte option-id-er, returner ferdig Flask-kode.
 * `selected` skal allerede være kjørt gjennom resolveRequires.
 */
export function assemble(selected: Set<string>): string {
  const byId = new Map(OPTIONS.map((o) => [o.id, o]));
  const sec = emptySections();

  // Behold bokens rekkefølge (kjerne → sider → ...). Iterer OPTIONS i den
  // rekkefølgen de er definert i — gir konsistent output uansett klikk-orden.
  for (const opt of OPTIONS) {
    if (selected.has(opt.id)) ingest(sec, opt);
  }

  // Hvis brukeren har valgt en kunde-route, sett has_kunder=True så navbaren
  // viser lenken til /kunder (small hack i base-templaten).
  if (selected.has("db-list")) {
    sec.helpers.push(`app.jinja_env.globals["has_kunder"] = True`);
  }

  const out: string[] = [];

  out.push(
    "# =====================================================================",
    "# Flask + Bootstrap-app — generert av Flask App Builder",
    "# =====================================================================",
    "",
  );

  // 1. Imports — sortert: stdlib først, så werkzeug/flask, så jinja
  const imports = Array.from(sec.imports);
  imports.sort((a, b) => {
    const ord = (s: string) => {
      if (s.startsWith("import ")) return 0;
      if (s.includes("flask") || s.includes("werkzeug")) return 2;
      if (s.includes("jinja2")) return 3;
      return 1;
    };
    return ord(a) - ord(b) || a.localeCompare(b);
  });
  out.push(...imports);
  // Vi trenger alltid DictLoader hvis vi har named templates
  if (Object.keys(sec.dictTemplates).length > 0 && !imports.some((i) => i.includes("DictLoader"))) {
    out.push("from jinja2 import DictLoader");
  }
  out.push("");

  // 2. App-konfig
  if (sec.config.length > 0) {
    out.push(...sec.config);
    out.push("");
  }

  // 3. Named templates → DictLoader
  if (Object.keys(sec.dictTemplates).length > 0) {
    out.push("# === Felles templates (base, navbar, flash, footer) ===");
    out.push("app.jinja_loader = DictLoader({");
    for (const [name, body] of Object.entries(sec.dictTemplates)) {
      out.push(`    "${name}": ${pythonStringLiteral(body)},`);
    }
    out.push("})");
    out.push("");
  }

  // 4. Inline templates (TEMPLATE_-prefix) som Python-konstanter
  for (const [name, body] of Object.entries(sec.inlineTemplates)) {
    out.push(`${name} = ${pythonStringLiteral(body)}`);
  }
  if (Object.keys(sec.inlineTemplates).length > 0) out.push("");

  // 5. Helpers
  if (sec.helpers.length > 0) {
    out.push("# === Hjelpere og init ===");
    out.push(...sec.helpers);
    out.push("");
  }

  // 6. Routes
  if (sec.routes.length > 0) {
    out.push("# === Routes ===");
    out.push(sec.routes.join("\n\n\n"));
    out.push("");
  }

  // 7. Test-stub
  out.push("# === Kjør i Pyodide via test_client ===");
  out.push("if __name__ == \"__main__\":");
  out.push("    client = app.test_client()");
  out.push("    print(client.get(\"/\").data.decode())");

  return out.join("\n");
}
