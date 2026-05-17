/**
 * Skriver et virtuelt prosjekt til Pyodides in-memory FS og kjører det.
 * Støtter Python-scripts, Flask-apper og HTML-preview.
 */

import { getPyodide } from "@/lib/python/pyodideLoader";
import { ensureFlask } from "@/components/stack/flask-livssyklus/flaskRunner";
import { MYSQL_SHIM_SOURCE } from "@/lib/python/mysqlShim";
import type { RunMode, Lesson, VerifyCheck } from "./types";

let mysqlShimRegistered = false;
let flaskExtrasInstalled = false;
let flaskExtrasInstalling: Promise<void> | null = null;

/** Make the `mysql.connector` shim available so utleieapp-style kode kjører. */
async function ensureMysqlShim(): Promise<void> {
  if (mysqlShimRegistered) return;
  const py = await getPyodide();
  py.globals.set("__mini_mysql_shim__", MYSQL_SHIM_SOURCE);
  await py.runPythonAsync(`
import sys, types
if "mysql.connector" not in sys.modules:
    _mysql_pkg = types.ModuleType("mysql")
    _connector = types.ModuleType("mysql.connector")
    exec(__mini_mysql_shim__, _connector.__dict__)
    _mysql_pkg.connector = _connector
    sys.modules["mysql"] = _mysql_pkg
    sys.modules["mysql.connector"] = _connector
`);
  mysqlShimRegistered = true;
}

/** Installer Flask-Login og Flask-WTF via micropip (begge er pure-Python). */
async function ensureFlaskExtras(): Promise<void> {
  if (flaskExtrasInstalled) return;
  if (flaskExtrasInstalling) return flaskExtrasInstalling;
  flaskExtrasInstalling = (async () => {
    const py = await getPyodide();
    await py.runPythonAsync(`
import micropip
# Begge er pure-Python wheels, så micropip klarer dem fint.
# WTForms blir trukket inn automatisk som Flask-WTF-avhengighet.
await micropip.install(["flask-login", "flask-wtf", "email_validator"])
`);
    flaskExtrasInstalled = true;
  })();
  try {
    await flaskExtrasInstalling;
  } finally {
    flaskExtrasInstalling = null;
  }
}

export interface RunResult {
  ok: boolean;
  /** Kombinert stdout + stderr, eller HTML-output (preview-mode). */
  output: string;
  /** For Flask: én entry per request. */
  responses?: { status: number; body: string }[];
  error?: string;
}

const PROJECT_ROOT = "/mini-kurs-project";

async function writeFiles(files: Record<string, string>): Promise<void> {
  const py = await getPyodide();
  // Wipe any old state first
  try {
    py.FS.unmount?.(PROJECT_ROOT);
  } catch {
    // ignore — first run
  }
  // Recreate root + write all files (creating subdirs as we go)
  ensureDir(py, PROJECT_ROOT);
  for (const [relPath, content] of Object.entries(files)) {
    const full = `${PROJECT_ROOT}/${relPath}`;
    const lastSlash = full.lastIndexOf("/");
    if (lastSlash > 0) ensureDir(py, full.slice(0, lastSlash));
    py.FS.writeFile(full, content);
  }
}

function ensureDir(py: any, path: string): void {
  const parts = path.split("/").filter(Boolean);
  let cur = "";
  for (const part of parts) {
    cur += "/" + part;
    try {
      py.FS.mkdir(cur);
    } catch {
      // exists
    }
  }
}

export async function runProject(
  files: Record<string, string>,
  mode: RunMode,
): Promise<RunResult> {
  await writeFiles(files);
  const py = await getPyodide();

  if (mode.kind === "python-script") {
    await ensureMysqlShim();
    return runPythonScript(py, mode.entry);
  }
  if (mode.kind === "flask-test-client") {
    await ensureFlask();
    await ensureFlaskExtras();
    await ensureMysqlShim();
    return runFlaskTestClient(py, mode.entry, mode.requests);
  }
  if (mode.kind === "html-preview") {
    return runHtmlPreview(files, mode.entry);
  }
  return { ok: false, output: "", error: "Ukjent kjøremodus" };
}

async function runPythonScript(py: any, entry: string): Promise<RunResult> {
  try {
    py.globals.set("__entry_path__", `${PROJECT_ROOT}/${entry}`);
    await py.runPythonAsync(`
import sys, io, os
sys.path.insert(0, "${PROJECT_ROOT}")
__buf__ = io.StringIO()
__old_stdout__ = sys.stdout
sys.stdout = __buf__
try:
    with open(__entry_path__) as f:
        exec(compile(f.read(), __entry_path__, "exec"), {"__name__": "__main__", "__file__": __entry_path__})
finally:
    sys.stdout = __old_stdout__
__output__ = __buf__.getvalue()
`);
    const output = py.globals.get("__output__") as string;
    return { ok: true, output };
  } catch (err) {
    return {
      ok: false,
      output: "",
      error: cleanError(err instanceof Error ? err.message : String(err)),
    };
  }
}

async function runFlaskTestClient(
  py: any,
  entry: string,
  requests: {
    method: "GET" | "POST";
    path: string;
    body?: string;
    followRedirects?: boolean;
  }[],
): Promise<RunResult> {
  try {
    py.globals.set("__entry_path__", `${PROJECT_ROOT}/${entry}`);
    py.globals.set("__requests_json__", JSON.stringify(requests));
    await py.runPythonAsync(`
import sys, json, os
import types as _types
# Pyodide mangler _multiprocessing — flaskRunner.ts allerede stubbed det
if "_multiprocessing" not in sys.modules:
    sys.modules["_multiprocessing"] = _types.ModuleType("_multiprocessing")
# Tøm caching av alle våre prosjekt-moduler så filendringer faktisk slår inn
# mellom kjøringer. Vi beholder stdlib + flask/wtforms/mysql.connector osv.
_PROJECT_PREFIXES = ("app", "auth", "kunder", "utstyr", "utleie", "statistikk", "models", "forms", "db", "config", "routes")
for _modname in list(sys.modules.keys()):
    _top = _modname.split(".", 1)[0]
    if _top in _PROJECT_PREFIXES:
        del sys.modules[_modname]
# Sørg for at prosjekt-stien er først i sys.path
sys.path = [p for p in sys.path if p != "${PROJECT_ROOT}"]
sys.path.insert(0, "${PROJECT_ROOT}")

# Tøm in-memory SQLite-DB-er som mysql.connector-shim holder oppe — gjør
# at hver "kjør"-runde starter med blanke tabeller.
try:
    import mysql.connector as _mc
    if hasattr(_mc, "reset_database"):
        for _name in list(getattr(_mc, "_dbs", {}).keys()):
            _mc.reset_database(_name)
except Exception:
    pass

# Jinja2 må finne templates/-mappa relativ til appen.
# Flask bruker app.template_folder = "templates" som default; vi setter
# CWD til prosjekt-rot så relative stier funker.
os.chdir("${PROJECT_ROOT}")

__ns__ = {"__name__": "__embedded__", "__file__": __entry_path__}
with open(__entry_path__) as f:
    exec(compile(f.read(), __entry_path__, "exec"), __ns__)

if "app" not in __ns__:
    raise RuntimeError("Fant ingen 'app' i " + __entry_path__)
__app__ = __ns__["app"]
__client__ = __app__.test_client()

__results__ = []
for req in json.loads(__requests_json__):
    body = req.get("body")
    headers = []
    if body and req["method"].upper() in ("POST", "PUT"):
        headers.append(("Content-Type", "application/x-www-form-urlencoded"))
    resp = __client__.open(
        method=req["method"],
        path=req["path"],
        data=body or None,
        headers=headers,
        follow_redirects=bool(req.get("followRedirects", False)),
    )
    try:
        body_text = resp.get_data(as_text=True)
    except Exception:
        body_text = repr(resp.get_data())
    __results__.append({"status": resp.status_code, "body": body_text})

__results_json__ = json.dumps(__results__)
`);
    const json = py.globals.get("__results_json__") as string;
    const responses = JSON.parse(json) as { status: number; body: string }[];
    const output = responses
      .map((r, i) => `--- request ${i + 1} (${r.status}) ---\n${r.body}`)
      .join("\n\n");
    return { ok: true, output, responses };
  } catch (err) {
    return {
      ok: false,
      output: "",
      error: cleanError(err instanceof Error ? err.message : String(err)),
    };
  }
}

function runHtmlPreview(
  files: Record<string, string>,
  entry: string,
): RunResult {
  // Inline alle CSS/JS-filer i HTML-entry (enkelt og fungerer for små prosjekter).
  let html = files[entry] ?? "";
  // Replace <link rel="stylesheet" href="X.css"> med <style>...</style>
  html = html.replace(
    /<link\s+[^>]*href="([^"]+\.css)"[^>]*>/g,
    (_, href) => {
      const css = files[href];
      return css ? `<style>\n${css}\n</style>` : "";
    },
  );
  // Replace <script src="X.js"></script> med inline-script
  html = html.replace(
    /<script\s+[^>]*src="([^"]+\.js)"[^>]*>\s*<\/script>/g,
    (_, src) => {
      const js = files[src];
      return js ? `<script>\n${js}\n</script>` : "";
    },
  );
  return { ok: true, output: html };
}

function cleanError(msg: string): string {
  const lines = msg.split("\n").filter((l) => l.trim().length > 0);
  for (let i = lines.length - 1; i >= 0; i--) {
    if (
      /^[A-Za-z_][A-Za-z0-9_.]*Error.*:/.test(lines[i]) ||
      /^[A-Za-z_][A-Za-z0-9_]*:/.test(lines[i])
    ) {
      return lines.slice(Math.max(0, i - 5), i + 1).join("\n");
    }
  }
  return lines.slice(-8).join("\n");
}

/** Sjekk om et VerifyCheck er bestått, gitt et RunResult. */
export function evaluateCheck(check: VerifyCheck, result: RunResult): boolean {
  if (!result.ok) return false;
  if (check.kind === "output-contains") {
    return result.output.includes(check.needle);
  }
  if (check.kind === "response-contains") {
    const r = result.responses?.[check.requestIdx];
    return r ? r.body.includes(check.needle) : false;
  }
  if (check.kind === "response-status") {
    const r = result.responses?.[check.requestIdx];
    return r ? r.status === check.status : false;
  }
  return false;
}

export function evaluateLesson(
  lesson: Lesson,
  result: RunResult,
): { passed: number; total: number; details: { label: string; ok: boolean }[] } {
  const details = lesson.verifications.map((v) => ({
    label: v.label,
    ok: evaluateCheck(v.check, result),
  }));
  return {
    passed: details.filter((d) => d.ok).length,
    total: details.length,
    details,
  };
}
