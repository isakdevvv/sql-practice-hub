import { getPyodide } from "@/lib/python/pyodideLoader";
import { DEMO_APP_PYTHON } from "./demoApp";
import type { ApiRequest, ApiResponse } from "./types";

let demoAppBooted = false;
let flaskInstalled = false;

async function ensureFlask(): Promise<void> {
  if (flaskInstalled) return;
  const py = await getPyodide();
  await py.runPythonAsync(`
import micropip
await micropip.install("flask")
`);
  flaskInstalled = true;
}

/** Boot the demo Flask app inside Pyodide once per page-session. */
async function ensureDemoApp(): Promise<void> {
  if (demoAppBooted) return;
  await ensureFlask();
  const py = await getPyodide();
  py.globals.set("__demo_app_src__", DEMO_APP_PYTHON);
  await py.runPythonAsync("exec(__demo_app_src__, globals())");
  demoAppBooted = true;
}

export async function listRoutes(): Promise<{ path: string; methods: string[] }[]> {
  await ensureDemoApp();
  const py = await getPyodide();
  await py.runPythonAsync("__routes_json__ = __import__('json').dumps(hent_routes())");
  const json = py.globals.get("__routes_json__") as string;
  return JSON.parse(json);
}

/** Send a request through Flask's test_client and return the parsed response. */
export async function sendRequest(req: ApiRequest): Promise<ApiResponse> {
  await ensureDemoApp();
  const py = await getPyodide();

  const headersDict = req.headers.reduce<Record<string, string>>((acc, h) => {
    if (h.enabled && h.key.trim()) acc[h.key.trim()] = h.value;
    return acc;
  }, {});
  if (req.bodyJson && req.body.trim()) {
    headersDict["Content-Type"] = headersDict["Content-Type"] ?? "application/json";
  }

  py.globals.set("__req_method__", req.method);
  py.globals.set("__req_path__", req.path);
  py.globals.set("__req_headers__", JSON.stringify(headersDict));
  py.globals.set("__req_body__", req.body);
  py.globals.set("__req_body_json__", req.bodyJson);

  const start = performance.now();
  await py.runPythonAsync(`
import json as _j, time as _t
_client = app.test_client()
_kw = {"headers": _j.loads(__req_headers__)}
if __req_body__.strip():
    if __req_body_json__:
        try:
            _kw["json"] = _j.loads(__req_body__)
        except Exception:
            _kw["data"] = __req_body__
    else:
        _kw["data"] = __req_body__
_method = __req_method__.lower()
_resp = getattr(_client, _method)(__req_path__, **_kw)
__api_status__ = _resp.status_code
__api_status_text__ = _resp.status
__api_content_type__ = _resp.content_type or ""
__api_headers__ = _j.dumps([(k, v) for k, v in _resp.headers.items()])
__api_body_bytes__ = _resp.data
try:
    __api_body__ = _resp.data.decode("utf-8")
except Exception:
    __api_body__ = repr(_resp.data)
try:
    _parsed = _j.loads(__api_body__)
    __api_is_json__ = True
    __api_body_pretty__ = _j.dumps(_parsed, ensure_ascii=False, indent=2)
except Exception:
    __api_is_json__ = False
    __api_body_pretty__ = __api_body__
`);
  const durationMs = performance.now() - start;

  const status = py.globals.get("__api_status__") as number;
  const statusTextRaw = py.globals.get("__api_status_text__") as string;
  const contentType = py.globals.get("__api_content_type__") as string;
  const headersJson = py.globals.get("__api_headers__") as string;
  const headerPairs = JSON.parse(headersJson) as [string, string][];
  const isJson = py.globals.get("__api_is_json__") as boolean;
  const body = py.globals.get("__api_body_pretty__") as string;

  // statusTextRaw looks like "200 OK" — split off the leading code.
  const m = statusTextRaw.match(/^\d+\s+(.*)$/);
  const statusText = m ? m[1] : statusTextRaw;

  return {
    status,
    statusText,
    contentType,
    headers: headerPairs.map(([key, value]) => ({ key, value })),
    body,
    isJson,
    durationMs: Math.round(durationMs),
  };
}

/** Run an arbitrary read-only SQL against the demo DB so users can inspect
 *  how their request changed state. Used by the "DB-snapshot" panel. */
export async function snapshotDb(sql: string): Promise<{
  columns: string[];
  rows: unknown[][];
  error?: string;
}> {
  await ensureDemoApp();
  const py = await getPyodide();
  py.globals.set("__snap_sql__", sql);
  try {
    await py.runPythonAsync(`
_c = db.cursor()
_c.execute(__snap_sql__)
__snap_cols__ = [d[0] for d in (_c.description or [])]
__snap_rows__ = [list(r) for r in _c.fetchall()]
import json as _j
__snap_cols_json__ = _j.dumps(__snap_cols__)
__snap_rows_json__ = _j.dumps(__snap_rows__, default=str)
`);
    return {
      columns: JSON.parse(py.globals.get("__snap_cols_json__") as string),
      rows: JSON.parse(py.globals.get("__snap_rows_json__") as string),
    };
  } catch (err) {
    return {
      columns: [],
      rows: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
