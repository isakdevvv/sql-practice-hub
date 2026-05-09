import { getPyodide } from "./pyodideLoader";
import { MYSQL_SHIM_SOURCE } from "./mysqlShim";
import type { PyRunResult, PyStep, PyVarValue } from "./types";

const installedPackages = new Set<string>();
let mysqlShimRegistered = false;

/** Ensure required Pyodide packages are micropip-installed (idempotent). */
async function ensureRequires(requires: string[] | undefined): Promise<void> {
  if (!requires || requires.length === 0) return;
  const py = await getPyodide();
  const missing = requires.filter((p) => !installedPackages.has(p));
  if (missing.length === 0) return;
  await py.runPythonAsync(`
import micropip
import asyncio
async def _install():
    await micropip.install(${JSON.stringify(missing)})
await _install()
`);
  missing.forEach((p) => installedPackages.add(p));
}

/** Make the `mysql.connector` shim available the first time it's needed. */
async function ensureMysqlShim(): Promise<void> {
  if (mysqlShimRegistered) return;
  const py = await getPyodide();
  py.globals.set("__mysql_shim_source__", MYSQL_SHIM_SOURCE);
  await py.runPythonAsync(`
import sys, types
mysql_pkg = types.ModuleType("mysql")
connector_mod = types.ModuleType("mysql.connector")
exec(__mysql_shim_source__, connector_mod.__dict__)
mysql_pkg.connector = connector_mod
sys.modules["mysql"] = mysql_pkg
sys.modules["mysql.connector"] = connector_mod
`);
  mysqlShimRegistered = true;
}

interface RunOpts {
  requires?: string[];
  setup?: string;
}

/** Run an entire script and return stdout + final variable snapshot. */
export async function runScript(code: string, opts: RunOpts = {}): Promise<PyRunResult> {
  const py = await getPyodide();
  let stdout = "";
  py.setStdout({ batched: (s: string) => (stdout += s + "\n") });
  py.setStderr({ batched: (s: string) => (stdout += s + "\n") });

  try {
    await ensureRequires(opts.requires);
    await ensureMysqlShim();
    if (opts.setup) {
      py.globals.set("__setup_code__", opts.setup);
      await py.runPythonAsync(`exec(__setup_code__, {})`);
    }
    py.globals.set("__user_code__", code);
    await py.runPythonAsync(`
import json as _json
# __name__ defaults to 'builtins' in exec'd code which breaks Flask(__name__)
# (Flask can't resolve a root path for that). Set it to "__main__" so the
# user's code behaves like a normal Python script.
_ns = {"__name__": "__main__"}
exec(__user_code__, _ns)
def _safe(v):
    try:
        _json.dumps(v); return v
    except Exception:
        return repr(v)
_locals_out = {k: _safe(v) for k, v in _ns.items() if not k.startswith("_")}
import json as _j2
_locals_json = _j2.dumps(_locals_out, default=str)
`);
    const localsJson = py.globals.get("_locals_json") as string;
    const locals = JSON.parse(localsJson) as Record<string, PyVarValue>;
    return { ok: true, stdout: stdout.trimEnd(), locals };
  } catch (err) {
    return {
      ok: false,
      stdout: stdout.trimEnd(),
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Run a script line-by-line using sys.settrace, capturing variable state after each line. */
export async function runScriptStepwise(
  code: string,
  opts: RunOpts = {},
): Promise<PyRunResult> {
  const py = await getPyodide();
  let stdout = "";
  py.setStdout({ batched: (s: string) => (stdout += s + "\n") });
  py.setStderr({ batched: (s: string) => (stdout += s + "\n") });

  try {
    await ensureRequires(opts.requires);
    await ensureMysqlShim();
    if (opts.setup) {
      py.globals.set("__setup_code__", opts.setup);
      await py.runPythonAsync(`exec(__setup_code__, {})`);
    }
    py.globals.set("__user_code__", code);
    await py.runPythonAsync(`
import sys, json
_steps = []
_user_filename = "<user>"
_compiled = compile(__user_code__, _user_filename, "exec")

def _safe(v):
    try:
        json.dumps(v); return v
    except Exception:
        return repr(v)

def _snapshot(frame_locals):
    return {k: _safe(v) for k, v in frame_locals.items() if not k.startswith("_")}

def _tracer(frame, event, arg):
    # Only track lines in the user's compiled code.
    if frame.f_code.co_filename != _user_filename:
        return None
    if event == "line":
        _steps.append({
            "line": frame.f_lineno,
            "locals": _snapshot(frame.f_locals),
        })
    return _tracer

_ns = {"__name__": "__main__"}
sys.settrace(_tracer)
try:
    exec(_compiled, _ns)
finally:
    sys.settrace(None)

# Capture a final state after the last line.
_steps.append({
    "line": -1,
    "locals": _snapshot(_ns),
})
_steps_json = json.dumps(_steps, default=str)
`);
    const stepsJson = py.globals.get("_steps_json") as string;
    const rawSteps = JSON.parse(stepsJson) as Array<{
      line: number;
      locals: Record<string, PyVarValue>;
    }>;
    const steps: PyStep[] = rawSteps.map((s) => ({ line: s.line, locals: s.locals }));
    return { ok: true, stdout: stdout.trimEnd(), steps };
  } catch (err) {
    return {
      ok: false,
      stdout: stdout.trimEnd(),
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
