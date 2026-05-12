import { getPyodide } from "./pyodideLoader";
import { MYSQL_SHIM_SOURCE } from "./mysqlShim";
import { SOCKET_SHIM_SOURCE } from "./socketShim";
import type {
  PyRunResult,
  PyStep,
  PyVarValue,
  PyVisualResult,
  VisualStep,
} from "./types";

const installedPackages = new Set<string>();
let mysqlShimRegistered = false;
let socketShimRegistered = false;

// Pakker som Pyodide har innebygd som binær-wheel (lastes raskt via loadPackage).
// Alt annet faller tilbake til micropip (pure-Python eller PyPI-wheels).
// Liste hentet fra https://pyodide.org/en/stable/usage/packages-in-pyodide.html
const PYODIDE_BUILTIN_PACKAGES = new Set([
  "numpy",
  "scipy",
  "scikit-learn",
  "matplotlib",
  "pandas",
  "sympy",
  "networkx",
  "statsmodels",
  "seaborn",
  "pillow",
  "lxml",
  "regex",
  "beautifulsoup4",
  "sqlite3",
  "micropip",
]);

/** Ensure required Pyodide packages are loaded (idempotent). */
async function ensureRequires(requires: string[] | undefined): Promise<void> {
  if (!requires || requires.length === 0) return;
  const py = await getPyodide();
  const missing = requires.filter((p) => !installedPackages.has(p));
  if (missing.length === 0) return;

  // Skill mellom built-in (loadPackage = raskt) og andre (micropip).
  const builtin = missing.filter((p) => PYODIDE_BUILTIN_PACKAGES.has(p));
  const viaPip = missing.filter((p) => !PYODIDE_BUILTIN_PACKAGES.has(p));

  if (builtin.length > 0) {
    await py.loadPackage(builtin);
  }
  if (viaPip.length > 0) {
    await py.runPythonAsync(`
import micropip
import asyncio
async def _install():
    await micropip.install(${JSON.stringify(viaPip)})
await _install()
`);
  }
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

/** Make the `socket` shim available (replaces stdlib socket inside Pyodide).
 *  Pyodide har ingen ekte sockets — vi installerer en in-process emulator slik
 *  at studenter kan skrive ekte-utseende kode (bind/listen/accept/send/recv). */
async function ensureSocketShim(): Promise<void> {
  if (socketShimRegistered) return;
  const py = await getPyodide();
  py.globals.set("__socket_shim_source__", SOCKET_SHIM_SOURCE);
  await py.runPythonAsync(`
import sys, types
socket_mod = types.ModuleType("socket")
exec(__socket_shim_source__, socket_mod.__dict__)
# Force replacement — stdlib socket exists in Pyodide but throws on connect.
sys.modules["socket"] = socket_mod
`);
  socketShimRegistered = true;
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
    await ensureSocketShim();
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
    await ensureSocketShim();
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

/**
 * Run a script and produce a Python Tutor–style trace:
 *   - per call/line/return/exception event,
 *   - full call stack of user frames,
 *   - heap of all referenced objects (lists, dicts, instances, …) with stable ids.
 *
 * The visualizer in /python and /python/visualizer consumes this.
 */
export async function runScriptVisual(
  code: string,
  opts: RunOpts = {},
): Promise<PyVisualResult> {
  const py = await getPyodide();
  // Note: we intentionally do NOT call py.setStdout here — the tracer
  // redirects sys.stdout to an in-memory buffer so it can compute per-step deltas.
  // Pyodide's stdout callback would interfere with that.
  try {
    await ensureRequires(opts.requires);
    await ensureMysqlShim();
    await ensureSocketShim();
    if (opts.setup) {
      py.globals.set("__setup_code__", opts.setup);
      await py.runPythonAsync(`exec(__setup_code__, {})`);
    }
    py.globals.set("__user_code__", code);
    await py.runPythonAsync(VISUAL_TRACER_PY);
    const resultJson = py.globals.get("_visual_result_json") as string;
    const parsed = JSON.parse(resultJson) as {
      steps: VisualStep[];
      stdoutFull: string;
      truncated: boolean;
      error: string | null;
    };
    return {
      ok: parsed.error == null,
      steps: parsed.steps,
      stdoutFull: parsed.stdoutFull,
      truncated: parsed.truncated,
      error: parsed.error ?? undefined,
    };
  } catch (err) {
    return {
      ok: false,
      steps: [],
      stdoutFull: "",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// Python tracer source for runScriptVisual. Kept as a single template literal
// so we can edit it like a normal Python file. Reads __user_code__ from globals,
// writes the JSON result to _visual_result_json. The tracer captures the full
// frame chain (filtered to <user>), walks the heap with object identity, and
// records per-step stdout deltas via a StringIO redirect.
const VISUAL_TRACER_PY = `
import sys, io, json, inspect

_USER = "<user>"
_MAX_STEPS = 2000
_MAX_HEAP_PER_STEP = 200
_MAX_ITEMS = 50
_MAX_STR = 80

_steps = []
_stdout_buf = io.StringIO()
_prev_stdout_pos = 0
_truncated = False
_compile_error = None

def _opaque_label(v):
    cls = type(v).__name__
    mod = (type(v).__module__ or "")
    try:
        if cls == "Flask":
            return "Flask(" + repr(getattr(v, "name", "?")) + ")"
    except Exception:
        pass
    try:
        if cls in ("Response", "TestResponse") or "werkzeug.wrappers" in mod or "flask.wrappers" in mod:
            status = getattr(v, "status_code", "?")
            mt = getattr(v, "mimetype", None) or getattr(v, "content_type", "?")
            return "Response(" + str(status) + ", " + str(mt) + ")"
    except Exception:
        pass
    try:
        if cls == "Cursor":
            return "Cursor()"
        if cls == "Connection":
            return "Connection()"
        if "mysql" in mod.lower():
            return mod + "." + cls
    except Exception:
        pass
    try:
        if mod == "sqlite3":
            return "sqlite3." + cls
    except Exception:
        pass
    return None

def _classify(v, heap, seen):
    if v is None or isinstance(v, bool):
        return {"kind": "primitive", "value": v}
    if isinstance(v, int):
        return {"kind": "primitive", "value": v}
    if isinstance(v, float):
        if v != v:
            return {"kind": "primitive", "value": "NaN"}
        if v == float("inf"):
            return {"kind": "primitive", "value": "Infinity"}
        if v == float("-inf"):
            return {"kind": "primitive", "value": "-Infinity"}
        return {"kind": "primitive", "value": v}
    if isinstance(v, str):
        s = v
        if len(s) > _MAX_STR:
            s = s[:_MAX_STR] + "…"
        return {"kind": "primitive", "value": s}
    if isinstance(v, (bytes, bytearray)):
        try:
            preview = bytes(v[:32]).decode("utf-8", errors="replace")
        except Exception:
            preview = "<bytes>"
        return {"kind": "primitive", "value": "b'" + preview + ("…" if len(v) > 32 else "") + "'"}
    oid = id(v)
    if oid not in heap:
        if len(heap) >= _MAX_HEAP_PER_STEP:
            heap[oid] = {
                "id": oid,
                "type": "opaque",
                "label": "<heap cap>",
                "preview": "<heap cap>",
            }
        else:
            _walk_heap(v, oid, heap, seen)
    return {"kind": "ref", "id": oid}

def _walk_heap(v, oid, heap, seen):
    if oid in seen:
        return
    seen.add(oid)
    # First check whitelisted opaque types (Flask/Response/etc.) — these
    # often have __dict__ but rendering them as "instance" produces garbage.
    label = _opaque_label(v)
    if label is not None:
        heap[oid] = {
            "id": oid,
            "type": "opaque",
            "label": label,
            "preview": label,
        }
        return
    if isinstance(v, list):
        items = list(v[:_MAX_ITEMS])
        obj = {
            "id": oid,
            "type": "list",
            "items": [_classify(x, heap, seen) for x in items],
            "preview": "list[" + str(len(v)) + "]",
        }
        if len(v) > _MAX_ITEMS:
            obj["truncated"] = len(v) - _MAX_ITEMS
        heap[oid] = obj
        return
    if isinstance(v, tuple):
        items = list(v[:_MAX_ITEMS])
        obj = {
            "id": oid,
            "type": "tuple",
            "items": [_classify(x, heap, seen) for x in items],
            "preview": "tuple[" + str(len(v)) + "]",
        }
        if len(v) > _MAX_ITEMS:
            obj["truncated"] = len(v) - _MAX_ITEMS
        heap[oid] = obj
        return
    if isinstance(v, (set, frozenset)):
        try:
            items_raw = list(v)[:_MAX_ITEMS]
        except Exception:
            items_raw = []
        obj = {
            "id": oid,
            "type": "set",
            "items": [_classify(x, heap, seen) for x in items_raw],
            "preview": ("frozenset[" if isinstance(v, frozenset) else "set[") + str(len(v)) + "]",
        }
        if len(v) > len(items_raw):
            obj["truncated"] = len(v) - len(items_raw)
        heap[oid] = obj
        return
    if isinstance(v, dict):
        try:
            entries_raw = list(v.items())[:_MAX_ITEMS]
        except Exception:
            entries_raw = []
        obj = {
            "id": oid,
            "type": "dict",
            "entries": [
                {"key": _classify(k, heap, seen), "value": _classify(val, heap, seen)}
                for k, val in entries_raw
            ],
            "preview": "dict[" + str(len(v)) + "]",
        }
        if len(v) > len(entries_raw):
            obj["truncated"] = len(v) - len(entries_raw)
        heap[oid] = obj
        return
    if inspect.isfunction(v) or inspect.ismethod(v) or inspect.isbuiltin(v):
        try:
            sig = str(inspect.signature(v))
        except Exception:
            sig = ""
        name = getattr(v, "__qualname__", None) or getattr(v, "__name__", "<function>")
        heap[oid] = {
            "id": oid,
            "type": "function",
            "name": name,
            "signature": sig,
            "preview": "fn " + name + sig,
        }
        return
    if inspect.isclass(v):
        heap[oid] = {
            "id": oid,
            "type": "opaque",
            "label": "class " + v.__name__,
            "preview": "class " + v.__name__,
        }
        return
    if inspect.ismodule(v):
        name = getattr(v, "__name__", "<module>")
        heap[oid] = {
            "id": oid,
            "type": "module",
            "label": "module " + name,
            "preview": "module " + name,
        }
        return
    if hasattr(v, "__dict__"):
        class_name = type(v).__name__
        try:
            attrs_raw = dict(vars(v))
        except Exception:
            attrs_raw = {}
        # Filter dunder attrs; cap count.
        kept = [(k, val) for k, val in attrs_raw.items() if not (k.startswith("__") and k.endswith("__"))]
        capped = kept[:_MAX_ITEMS]
        heap[oid] = {
            "id": oid,
            "type": "instance",
            "className": class_name,
            "attrs": {k: _classify(val, heap, seen) for k, val in capped},
            "preview": class_name,
        }
        return
    # Last resort — opaque.
    heap[oid] = {
        "id": oid,
        "type": "opaque",
        "label": type(v).__name__,
        "preview": type(v).__name__,
    }

def _build_step(event, frame, exc_message=None):
    global _prev_stdout_pos
    heap = {}
    seen = set()
    # Walk frame chain bottom-up, reverse to get caller→callee order.
    chain = []
    f = frame
    while f is not None:
        chain.append(f)
        f = f.f_back
    chain.reverse()
    user_frames = [fr for fr in chain if fr.f_code.co_filename == _USER]
    if not user_frames:
        return None
    frames_out = []
    for fr in user_frames:
        co = fr.f_code
        vars_out = {}
        try:
            items = list(fr.f_locals.items())
        except Exception:
            items = []
        for k, val in items:
            if k.startswith("__") and k.endswith("__"):
                continue
            try:
                vars_out[k] = _classify(val, heap, seen)
            except Exception:
                vars_out[k] = {"kind": "primitive", "value": "<" + type(val).__name__ + ">"}
        frames_out.append({
            "name": co.co_name,
            "line": fr.f_lineno,
            "filename": co.co_filename,
            "isUser": True,
            "variables": vars_out,
        })
    full = _stdout_buf.getvalue()
    delta = full[_prev_stdout_pos:]
    _prev_stdout_pos = len(full)
    step = {
        "event": event,
        "frames": frames_out,
        "heap": heap,
        "stdout": delta,
    }
    if exc_message:
        step["error"] = exc_message
    return step

def _tracer(frame, event, arg):
    global _truncated
    co = frame.f_code
    # Skip non-user frames entirely. The global trace still fires on the next
    # 'call' event, so we'll re-enter tracing when user code is reached again
    # (e.g. test_client → user route handler).
    if co.co_filename != _USER:
        return None
    if len(_steps) >= _MAX_STEPS:
        _truncated = True
        return None
    if event == "call":
        s = _build_step("call", frame)
        if s: _steps.append(s)
    elif event == "line":
        s = _build_step("line", frame)
        if s: _steps.append(s)
    elif event == "return":
        s = _build_step("return", frame)
        if s: _steps.append(s)
    elif event == "exception":
        try:
            exc_type, exc_value, _tb = arg
            msg = exc_type.__name__ + ": " + str(exc_value)
        except Exception:
            msg = "Exception"
        s = _build_step("exception", frame, exc_message=msg)
        if s: _steps.append(s)
    return _tracer

try:
    _compiled = compile(__user_code__, _USER, "exec")
except SyntaxError as _se:
    _compile_error = "SyntaxError: " + (_se.msg or "") + " (linje " + str(_se.lineno or "?") + ")"
    _compiled = None
except Exception as _ce:
    _compile_error = type(_ce).__name__ + ": " + str(_ce)
    _compiled = None

_real_stdout = sys.stdout
_exec_error = None
if _compiled is not None:
    sys.stdout = _stdout_buf
    sys.settrace(_tracer)
    try:
        _ns = {"__name__": "__main__"}
        exec(_compiled, _ns)
    except Exception as _e:
        _exec_error = type(_e).__name__ + ": " + str(_e)
    finally:
        sys.settrace(None)
        sys.stdout = _real_stdout

_visual_result_json = json.dumps({
    "steps": _steps,
    "stdoutFull": _stdout_buf.getvalue(),
    "truncated": _truncated,
    "error": _compile_error or _exec_error,
}, default=str)
`;
