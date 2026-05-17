import { OPTIONS } from "./options";
import type { AppOption } from "./types";

/**
 * Resolverer transitive `requires`-avhengigheter. Hvis bruker velger
 * `ep-kunder-list` aktiveres `model-kunde-ut` automatisk.
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
  models: string[];
  dbSetup: string[];
  dependencies: string[];
  helpers: string[];
  routes: string[];
  tests: string[];
}

function emptySections(): Sections {
  return {
    imports: new Set(),
    config: [],
    models: [],
    dbSetup: [],
    dependencies: [],
    helpers: [],
    routes: [],
    tests: [],
  };
}

function ingest(sec: Sections, opt: AppOption): void {
  const c = opt.contributes;
  if (c.imports) for (const i of c.imports) sec.imports.add(i);
  if (c.config) sec.config.push(...c.config);
  if (c.models) sec.models.push(...c.models);
  if (c.dbSetup) sec.dbSetup.push(...c.dbSetup);
  if (c.dependencies) sec.dependencies.push(...c.dependencies);
  if (c.helpers) sec.helpers.push(...c.helpers);
  if (c.routes) sec.routes.push(...c.routes);
  if (c.tests) sec.tests.push(...c.tests);
}

/**
 * Sortér imports topologisk: stdlib først (`import x`, `from datetime ...`),
 * deretter pydantic, sqlalchemy, passlib, jwt, til slutt fastapi.
 */
function sortImports(imports: string[]): string[] {
  const order = (s: string): number => {
    if (s.startsWith("import ") && !s.includes("uvicorn") && !s.includes("jwt")) return 0;
    if (s.startsWith("from typing") || s.startsWith("from datetime")) return 1;
    if (s.includes("import jwt") || s.startsWith("import uvicorn")) return 2;
    if (s.includes("pydantic")) return 3;
    if (s.includes("sqlalchemy")) return 4;
    if (s.includes("passlib")) return 5;
    if (s.includes("fastapi")) return 6;
    return 7;
  };
  return [...imports].sort((a, b) => order(a) - order(b) || a.localeCompare(b));
}

/**
 * Hovedfunksjon: ta sett av valgte option-id-er, returner ferdig FastAPI-kode.
 * `selected` skal allerede være kjørt gjennom resolveRequires.
 *
 * Topologisk rekkefølge på output:
 *   1. Kommentar-blokk med kjøre-instruks
 *   2. Imports (sortert)
 *   3. App-konfig (FastAPI(...))
 *   4. Pydantic-modeller
 *   5. DB-oppsett (engine, Base, create_all)
 *   6. Hjelpere (constants, auth-utils, in-memory store)
 *   7. Dependencies (get_db, get_current_user, pagination)
 *   8. Routes
 *   9. Test-stub under __main__
 */
export function assemble(selected: Set<string>): string {
  const sec = emptySections();

  // Behold OPTIONS-rekkefølgen for konsistent output.
  for (const opt of OPTIONS) {
    if (selected.has(opt.id)) ingest(sec, opt);
  }

  const out: string[] = [];

  // 1. Kommentar-header med kjøre-instruks
  out.push(
    "# =====================================================================",
    "# FastAPI-app — generert av FastAPI App Builder",
    "#",
    "# Kjør lokalt:",
    "#   pip install fastapi uvicorn[standard] pydantic sqlalchemy passlib[bcrypt] pyjwt",
    "#   uvicorn app:app --reload",
    "#",
    "# Åpne deretter:",
    "#   http://127.0.0.1:8000/docs   (Swagger UI)",
    "#   http://127.0.0.1:8000/redoc  (ReDoc)",
    "# =====================================================================",
    "",
  );

  // 2. Imports
  const imports = sortImports(Array.from(sec.imports));
  out.push(...imports);
  out.push("");

  // 3. App-konfig (FastAPI())
  if (sec.config.length > 0) {
    out.push("# === App-konfig =====================================================");
    out.push(sec.config.join("\n\n"));
    out.push("");
  }

  // 4. Pydantic-modeller
  if (sec.models.length > 0) {
    out.push("# === Pydantic-modeller =============================================");
    out.push(sec.models.join("\n\n\n"));
    out.push("");
  }

  // 5. DB-oppsett (SQLAlchemy engine + Base + create_all)
  if (sec.dbSetup.length > 0) {
    out.push("# === Database-oppsett (SQLAlchemy) =================================");
    out.push(sec.dbSetup.join("\n\n\n"));
    out.push("");
  }

  // 6. Helpers (kommer FØR dependencies fordi deps gjerne refererer dem)
  if (sec.helpers.length > 0) {
    out.push("# === Hjelpere ======================================================");
    out.push(sec.helpers.join("\n\n\n"));
    out.push("");
  }

  // 7. Dependencies (Depends-mål)
  if (sec.dependencies.length > 0) {
    out.push("# === Dependencies (Depends-mål) ====================================");
    out.push(sec.dependencies.join("\n\n\n"));
    out.push("");
  }

  // 8. Routes
  if (sec.routes.length > 0) {
    out.push("# === Endepunkter ===================================================");
    out.push(sec.routes.join("\n\n\n"));
    out.push("");
  }

  // 9. Test-stub + uvicorn-run
  const hasUvicorn = selected.has("core-uvicorn-run");
  const hasTests = sec.tests.length > 0;
  if (hasUvicorn || hasTests) {
    out.push("# === Kjør / test ===================================================");
    out.push('if __name__ == "__main__":');
    if (hasTests) {
      for (const t of sec.tests) {
        for (const line of t.split("\n")) {
          out.push("    " + line);
        }
        out.push("");
      }
    }
    if (hasUvicorn) {
      out.push('    uvicorn.run(app, host="127.0.0.1", port=8000)');
    }
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}
