import { useMemo, useRef, useState } from "react";
import { PythonEditor } from "@/components/python/PythonEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ensureFlask,
  mountApp,
  resetClient,
  sendRequest,
  type FlaskResponse,
} from "./flaskRunner";

const APP_CODE = `from flask import Flask, request, render_template_string, redirect, url_for, session
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = "bytt-meg-i-produksjon"

USERS = {
    "ola@ex.no": {"id": 1, "pw": generate_password_hash("hunter2")},
}

LOGIN_HTML = """
<form method="post">
  <input name="email" type="email" required>
  <input name="password" type="password" required>
  <button>Logg inn</button>
</form>
"""

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]
        user = USERS.get(email)
        if user and check_password_hash(user["pw"], password):
            session["user_id"] = user["id"]
            return redirect(url_for("konto"))
        return "Feil e-post eller passord", 401
    return render_template_string(LOGIN_HTML)

@app.route("/konto")
def konto():
    if "user_id" not in session:
        return redirect(url_for("login"))
    return f"Hei bruker {session['user_id']}! <a href='/logout'>Logg ut</a>"

@app.route("/logout")
def logout():
    session.pop("user_id", None)
    return redirect(url_for("login"))

if __name__ == "__main__":
    app.run(debug=True)`;

type Method = "GET" | "POST" | "PUT" | "DELETE";

type Preset = {
  id: string;
  label: string;
  method: Method;
  path: string;
  body?: string;
  headers?: Record<string, string>;
};

const PRESETS: Preset[] = [
  {
    id: "get-login",
    label: "GET /login",
    method: "GET",
    path: "/login",
  },
  {
    id: "post-login-ok",
    label: "POST /login (riktig)",
    method: "POST",
    path: "/login",
    body: "email=ola%40ex.no&password=hunter2",
  },
  {
    id: "post-login-bad",
    label: "POST /login (feil passord)",
    method: "POST",
    path: "/login",
    body: "email=ola%40ex.no&password=wrong",
  },
  {
    id: "get-konto",
    label: "GET /konto",
    method: "GET",
    path: "/konto",
  },
];

type MountStatus =
  | { state: "idle" }
  | { state: "installing"; message: string }
  | { state: "mounting" }
  | { state: "ready" }
  | { state: "error"; error: string };

type HeaderRow = { key: string; value: string };

export function MiniFlaskApp() {
  const [code, setCode] = useState(APP_CODE);
  const [mountedCode, setMountedCode] = useState<string | null>(null);
  const [mountStatus, setMountStatus] = useState<MountStatus>({ state: "idle" });

  const [method, setMethod] = useState<Method>("GET");
  const [path, setPath] = useState("/login");
  const [headers, setHeaders] = useState<HeaderRow[]>([]);
  const [body, setBody] = useState("");

  const [response, setResponse] = useState<FlaskResponse | null>(null);
  const [reqError, setReqError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sessionCookies, setSessionCookies] = useState<Record<string, string>>({});

  const isMounted = mountStatus.state === "ready";
  const isStale = isMounted && mountedCode !== null && mountedCode !== code;
  const requestDisabled = !isMounted || sending;

  const mountInFlight = useRef(false);

  async function handleMount() {
    if (mountInFlight.current) return;
    mountInFlight.current = true;
    setReqError(null);
    setResponse(null);
    setSessionCookies({});
    try {
      setMountStatus({ state: "installing", message: "Installerer Flask via micropip… (5–15s)" });
      await ensureFlask();
      setMountStatus({ state: "mounting" });
      const res = await mountApp(code);
      if (res.ok) {
        setMountStatus({ state: "ready" });
        setMountedCode(code);
      } else {
        setMountStatus({ state: "error", error: res.error });
      }
    } catch (err) {
      setMountStatus({
        state: "error",
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      mountInFlight.current = false;
    }
  }

  async function handleReset() {
    await resetClient();
    setSessionCookies({});
    setResponse(null);
    setReqError(null);
  }

  async function handleSend() {
    if (!isMounted) return;
    setSending(true);
    setReqError(null);
    try {
      const headerObj: Record<string, string> = {};
      headers.forEach((h) => {
        if (h.key.trim()) headerObj[h.key.trim()] = h.value;
      });
      const sendBody = method === "POST" || method === "PUT" ? body : undefined;
      const res = await sendRequest({
        method,
        path,
        headers: headerObj,
        body: sendBody,
      });
      setResponse(res);
      if (Object.keys(res.setCookies).length > 0) {
        setSessionCookies((prev) => ({ ...prev, ...res.setCookies }));
      }
    } catch (err) {
      setReqError(err instanceof Error ? err.message : String(err));
    } finally {
      setSending(false);
    }
  }

  function applyPreset(p: Preset) {
    setMethod(p.method);
    setPath(p.path);
    setBody(p.body ?? "");
    setHeaders(
      p.headers
        ? Object.entries(p.headers).map(([key, value]) => ({ key, value }))
        : [],
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Editor panel */}
        <EditorPanel
          code={code}
          setCode={setCode}
          mountStatus={mountStatus}
          isStale={isStale}
          onMount={handleMount}
        />

        {/* Request builder + Response stacked on right */}
        <div className="space-y-4">
          <RequestPanel
            method={method}
            setMethod={setMethod}
            path={path}
            setPath={setPath}
            headers={headers}
            setHeaders={setHeaders}
            body={body}
            setBody={setBody}
            disabled={requestDisabled}
            sending={sending}
            onSend={handleSend}
            onReset={handleReset}
            onApplyPreset={applyPreset}
            sessionCookies={sessionCookies}
          />
          <ResponsePanel response={response} error={reqError} sending={sending} />
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Denne mini-appen kjører faktisk Flask i Pyodide (Python kompilert til WebAssembly). Når du
        klikker <strong>Send request</strong> bygger vi en WSGI-environ via{" "}
        <code className="font-mono">werkzeug.test.Client</code>, kaller appen din med den, og leser
        statuslinje, headere og body ut av Response-objektet — akkurat det Werkzeug ville gjort med
        bytes fra en TCP-socket.
      </p>
    </div>
  );
}

function EditorPanel({
  code,
  setCode,
  mountStatus,
  isStale,
  onMount,
}: {
  code: string;
  setCode: (v: string) => void;
  mountStatus: MountStatus;
  isStale: boolean;
  onMount: () => void;
}) {
  const statusLabel = useMemo(() => {
    switch (mountStatus.state) {
      case "idle":
        return "Ikke montert";
      case "installing":
        return mountStatus.message;
      case "mounting":
        return "Eksekverer app-koden…";
      case "ready":
        return isStale ? "Endret — re-mount?" : "Klar";
      case "error":
        return "Feil ved montering";
    }
  }, [mountStatus, isStale]);

  const statusTone =
    mountStatus.state === "ready" && !isStale
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
      : mountStatus.state === "error"
        ? "bg-destructive/10 text-destructive border-destructive/30"
        : isStale
          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
          : "bg-muted text-muted-foreground border-border";

  const busy = mountStatus.state === "installing" || mountStatus.state === "mounting";

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
          app.py
        </span>
        <span
          className={`rounded border px-2 py-0.5 text-[10px] uppercase tracking-wide font-semibold ${statusTone}`}
        >
          {statusLabel}
        </span>
      </div>
      <div className="h-[420px]">
        <PythonEditor value={code} onChange={setCode} height="100%" />
      </div>
      <div className="border-t border-border bg-muted/20 px-4 py-3 flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground">
          Trykk Mount app for å installere Flask og laste app-koden inn i Pyodide.
        </span>
        <Button onClick={onMount} disabled={busy} size="sm">
          {busy
            ? "Jobber…"
            : mountStatus.state === "ready"
              ? isStale
                ? "Re-mount app"
                : "Re-mount app"
              : "Mount app"}
        </Button>
      </div>
      {mountStatus.state === "error" && (
        <div className="border-t border-destructive/30 bg-destructive/5 px-4 py-3">
          <pre className="text-[11px] font-mono text-destructive whitespace-pre-wrap break-words">
            {mountStatus.error}
          </pre>
        </div>
      )}
    </div>
  );
}

function RequestPanel({
  method,
  setMethod,
  path,
  setPath,
  headers,
  setHeaders,
  body,
  setBody,
  disabled,
  sending,
  onSend,
  onReset,
  onApplyPreset,
  sessionCookies,
}: {
  method: Method;
  setMethod: (v: Method) => void;
  path: string;
  setPath: (v: string) => void;
  headers: HeaderRow[];
  setHeaders: (rows: HeaderRow[]) => void;
  body: string;
  setBody: (v: string) => void;
  disabled: boolean;
  sending: boolean;
  onSend: () => void;
  onReset: () => void;
  onApplyPreset: (p: Preset) => void;
  sessionCookies: Record<string, string>;
}) {
  const showBody = method === "POST" || method === "PUT";
  const cookieEntries = Object.entries(sessionCookies);

  function updateHeader(i: number, patch: Partial<HeaderRow>) {
    setHeaders(headers.map((h, idx) => (idx === i ? { ...h, ...patch } : h)));
  }
  function addHeader() {
    setHeaders([...headers, { key: "", value: "" }]);
  }
  function removeHeader(i: number) {
    setHeaders(headers.filter((_, idx) => idx !== i));
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
          Request
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={disabled && !sending}
          className="h-7 text-[11px]"
        >
          Reset session
        </Button>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1.5">
            Hurtigvalg
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => onApplyPreset(p)}
                disabled={disabled}
                className="rounded-md border border-border bg-background px-2.5 py-1 text-[11px] text-foreground/85 hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as Method)}
            disabled={disabled}
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm font-mono disabled:opacity-50"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
          <Input
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/login"
            disabled={disabled}
            className="font-mono text-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
              Headers
            </div>
            <button
              onClick={addHeader}
              disabled={disabled}
              className="text-[11px] text-brand hover:underline disabled:opacity-50"
            >
              + legg til
            </button>
          </div>
          {headers.length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic">
              Ingen ekstra headers. Content-Type settes automatisk for form-bodies.
            </p>
          ) : (
            <div className="space-y-1.5">
              {headers.map((h, i) => (
                <div key={i} className="flex gap-1.5">
                  <Input
                    value={h.key}
                    onChange={(e) => updateHeader(i, { key: e.target.value })}
                    placeholder="Header-navn"
                    disabled={disabled}
                    className="font-mono text-xs h-8"
                  />
                  <Input
                    value={h.value}
                    onChange={(e) => updateHeader(i, { value: e.target.value })}
                    placeholder="verdi"
                    disabled={disabled}
                    className="font-mono text-xs h-8"
                  />
                  <button
                    onClick={() => removeHeader(i)}
                    disabled={disabled}
                    className="text-muted-foreground hover:text-destructive px-2 disabled:opacity-50"
                    aria-label="Fjern header"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {showBody && (
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1.5">
              Body
            </div>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="email=ola%40ex.no&password=hunter2"
              disabled={disabled}
              className="font-mono text-xs min-h-[60px]"
            />
          </div>
        )}

        {cookieEntries.length > 0 && (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-400 font-semibold mb-1">
              Cookie jar (sendes automatisk neste request)
            </div>
            <ul className="space-y-0.5">
              {cookieEntries.map(([k, v]) => (
                <li key={k} className="text-[11px] font-mono text-foreground/85 break-all">
                  <span className="text-amber-600 dark:text-amber-400">{k}</span>=
                  <span>{v.length > 60 ? v.slice(0, 60) + "…" : v}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          onClick={onSend}
          disabled={disabled}
          className="w-full"
        >
          {sending ? "Sender…" : "Send request"}
        </Button>
        {disabled && !sending && (
          <p className="text-[11px] text-muted-foreground text-center">
            Mount appen først for å aktivere requesten.
          </p>
        )}
      </div>
    </div>
  );
}

function ResponsePanel({
  response,
  error,
  sending,
}: {
  response: FlaskResponse | null;
  error: string | null;
  sending: boolean;
}) {
  if (sending) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground font-semibold">
          Response
        </div>
        <div className="p-4 text-sm text-muted-foreground">Kjører request gjennom Flask…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 overflow-hidden">
        <div className="border-b border-destructive/30 px-4 py-2 text-xs uppercase tracking-wide text-destructive font-semibold">
          Feil
        </div>
        <pre className="p-4 text-[11px] font-mono whitespace-pre-wrap break-words text-destructive">
          {error}
        </pre>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground font-semibold">
          Response
        </div>
        <div className="p-4 text-sm text-muted-foreground italic">
          Ingen request sendt ennå.
        </div>
      </div>
    );
  }

  const statusTone =
    response.status >= 200 && response.status < 300
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
      : response.status >= 300 && response.status < 400
        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
        : response.status >= 400 && response.status < 500
          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
          : "bg-destructive/10 text-destructive border-destructive/30";

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
          Response
        </span>
        <span
          className={`rounded border px-2 py-0.5 text-[11px] font-mono font-semibold ${statusTone}`}
        >
          {response.status} {response.statusText}
        </span>
      </div>

      <div className="divide-y divide-border">
        <div className="p-4">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1.5">
            Headers
          </div>
          {response.headers.length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic">Ingen headers.</p>
          ) : (
            <ul className="space-y-0.5">
              {response.headers.map(([k, v], i) => {
                const isSetCookie = k.toLowerCase() === "set-cookie";
                const isLocation = k.toLowerCase() === "location";
                return (
                  <li
                    key={i}
                    className={`text-[11px] font-mono break-all ${
                      isSetCookie
                        ? "text-amber-600 dark:text-amber-400"
                        : isLocation
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-foreground/85"
                    }`}
                  >
                    <span className="font-semibold">{k}:</span> {v}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="p-4">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1.5">
            Body
          </div>
          {response.body ? (
            <pre className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap break-words text-foreground bg-background border border-border rounded-md p-3 max-h-64 overflow-auto">
              {response.body}
            </pre>
          ) : (
            <p className="text-[11px] text-muted-foreground italic">(tom body)</p>
          )}
        </div>

        {Object.keys(response.setCookies).length > 0 && (
          <div className="p-4 bg-amber-500/5">
            <div className="text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-400 font-semibold mb-1.5">
              Set-Cookie parsed
            </div>
            <p className="text-[11px] text-foreground/80 mb-1.5">
              Disse blir lagt i cookie jar og sendt automatisk i neste request.
            </p>
            <ul className="space-y-0.5">
              {Object.entries(response.setCookies).map(([k, v]) => (
                <li key={k} className="text-[11px] font-mono break-all">
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">{k}</span>=
                  <span className="text-foreground/85">
                    {v.length > 60 ? v.slice(0, 60) + "…" : v}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
