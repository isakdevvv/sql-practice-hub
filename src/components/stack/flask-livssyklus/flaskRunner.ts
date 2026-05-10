// Real Pyodide-Flask runner for the mini-app on /stack/flask-livssyklus.
//
// Mounts a user-supplied Flask app inside Pyodide and lets the UI send WSGI
// requests through werkzeug.test.Client. Cookies persist across requests on
// the same client instance, mirroring how a browser would carry sessions.
//
// We deliberately don't reuse src/lib/python/runner.ts here — it returns a
// JSON snapshot of locals after exec, which makes the Flask `app` object
// disappear (it's not JSON-serialisable). Instead we exec the user's code
// into a dedicated namespace and stash references on Pyodide's globals.

import { getPyodide } from "@/lib/python/pyodideLoader";

export type FlaskResponse = {
  status: number;
  statusText: string;
  headers: Array<[string, string]>;
  body: string;
  setCookies: Record<string, string>;
};

export type MountResult = { ok: true } | { ok: false; error: string };

let flaskInstalled = false;
let flaskInstalling: Promise<void> | null = null;

/** Install Flask via micropip the first time this is called. Idempotent. */
export async function ensureFlask(): Promise<void> {
  if (flaskInstalled) return;
  if (flaskInstalling) return flaskInstalling;
  flaskInstalling = (async () => {
    const py = await getPyodide();
    await py.runPythonAsync(`
# Pyodide is missing _multiprocessing (a C extension). werkzeug.test only
# touches it via threading.RLock in Client._cookies. Stub it before any Flask
# import lands so subsequent imports don't blow up.
import sys, types
if "_multiprocessing" not in sys.modules:
    sys.modules["_multiprocessing"] = types.ModuleType("_multiprocessing")
import micropip
await micropip.install("flask")
`);
    flaskInstalled = true;
  })();
  try {
    await flaskInstalling;
  } finally {
    flaskInstalling = null;
  }
}

/** Exec the user's app code into a fresh namespace; expect `app` to be defined. */
export async function mountApp(code: string): Promise<MountResult> {
  try {
    const py = await getPyodide();
    py.globals.set("__flask_user_code__", code);
    await py.runPythonAsync(`
# Fresh namespace each mount so old routes don't linger. We DELIBERATELY
# don't set __name__ = "__main__" — the demo app ends in
#     if __name__ == "__main__": app.run(debug=True)
# which would block forever in Pyodide. Using "__embedded__" lets
# Flask(__name__) still resolve a root path, but skips the run-block.
__flask_ns__ = {"__name__": "__embedded__"}
exec(__flask_user_code__, __flask_ns__)
if "app" not in __flask_ns__:
    raise RuntimeError("Fant ingen 'app' i koden. Sørg for at du oppretter app = Flask(__name__).")
__flask_app__ = __flask_ns__["app"]

# app.test_client() wraps werkzeug.test.Client and persists cookies across
# calls on the same instance — exactly what we want for session demos.
__flask_client__ = __flask_app__.test_client()
`);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: cleanPythonError(message) };
  }
}

/** Drop the cookie jar by recreating the test Client. */
export async function resetClient(): Promise<void> {
  const py = await getPyodide();
  await py.runPythonAsync(`
if "__flask_app__" in globals():
    __flask_client__ = __flask_app__.test_client()
`);
}

export type SendOpts = {
  method: string;
  path: string;
  headers?: Record<string, string>;
  body?: string;
};

/** Send a request to the mounted app; cookies persist across calls on the client. */
export async function sendRequest(opts: SendOpts): Promise<FlaskResponse> {
  const py = await getPyodide();
  const headers = opts.headers ?? {};
  // For form bodies, ensure Content-Type so Flask parses request.form.
  const finalHeaders = { ...headers };
  const isFormish =
    opts.body &&
    !Object.keys(finalHeaders).some((k) => k.toLowerCase() === "content-type") &&
    /^[A-Za-z0-9_%.~+-]+=.*/.test(opts.body) &&
    (opts.method === "POST" || opts.method === "PUT");
  if (isFormish) {
    finalHeaders["Content-Type"] = "application/x-www-form-urlencoded";
  }
  py.globals.set("__flask_req_method__", opts.method);
  py.globals.set("__flask_req_path__", opts.path);
  py.globals.set("__flask_req_headers__", JSON.stringify(finalHeaders));
  py.globals.set("__flask_req_body__", opts.body ?? "");
  await py.runPythonAsync(`
import json as _json
if "__flask_client__" not in globals():
    raise RuntimeError("App er ikke montert. Klikk 'Mount app' først.")

_headers = list(_json.loads(__flask_req_headers__).items())
_body = __flask_req_body__ if __flask_req_body__ else None

_resp = __flask_client__.open(
    method=__flask_req_method__,
    path=__flask_req_path__,
    headers=_headers,
    data=_body,
    follow_redirects=False,
)

# resp.status looks like "200 OK" or "404 NOT FOUND"
_status_parts = _resp.status.split(" ", 1)
_status_text = _status_parts[1] if len(_status_parts) > 1 else _resp.status

# Collect Set-Cookie names → values for the UI to highlight. We use the
# raw header items so we see all cookies, not just the latest of each name.
_set_cookies = {}
for _k, _v in _resp.headers.items():
    if _k.lower() == "set-cookie":
        _name_val = _v.split(";", 1)[0]
        if "=" in _name_val:
            _n, _vv = _name_val.split("=", 1)
            _set_cookies[_n.strip()] = _vv.strip()

try:
    _body_text = _resp.get_data(as_text=True)
except Exception:
    _body_text = repr(_resp.get_data())

__flask_last_response__ = _json.dumps({
    "status": _resp.status_code,
    "statusText": _status_text,
    "headers": list(_resp.headers.items()),
    "body": _body_text,
    "setCookies": _set_cookies,
})
`);
  const json = py.globals.get("__flask_last_response__") as string;
  return JSON.parse(json) as FlaskResponse;
}

function cleanPythonError(msg: string): string {
  // Pyodide wraps errors with a long traceback; keep the last meaningful line.
  const lines = msg.split("\n").filter((l) => l.trim().length > 0);
  // Find the last line that looks like "ErrorType: message"
  for (let i = lines.length - 1; i >= 0; i--) {
    if (/^[A-Za-z_][A-Za-z0-9_.]*Error.*:/.test(lines[i]) || /^[A-Za-z_][A-Za-z0-9_]*:/.test(lines[i])) {
      // Show context: last ~6 lines
      return lines.slice(Math.max(0, i - 5), i + 1).join("\n");
    }
  }
  return lines.slice(-8).join("\n");
}
