import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sendRequest, listRoutes, snapshotDb } from "@/lib/api-konsoll/runner";
import { PRESETS, EMPTY_REQUEST } from "@/lib/api-konsoll/presets";
import type { ApiHeader, ApiRequest, ApiResponse, HttpMethod } from "@/lib/api-konsoll/types";
import { getPyodide, isPyodideReady, onPyodideProgress } from "@/lib/python/pyodideLoader";
import { cn } from "@/lib/utils";
import { Send, Loader2, Plus, X, Database } from "lucide-react";

export const Route = createFileRoute("/konsoll")({
  head: () => ({
    meta: [
      { title: "API-konsoll — SQL Sandbox" },
      {
        name: "description",
        content:
          "Postman-aktig konsoll for å sende HTTP-requester mot en innebygd Flask-app som kjører i nettleseren via Pyodide.",
      },
    ],
  }),
  component: ApiKonsollPage,
});

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

function ApiKonsollPage() {
  const [request, setRequest] = useState<ApiRequest>(() => ({
    ...EMPTY_REQUEST,
    headers: EMPTY_REQUEST.headers.map((h) => ({ ...h })),
  }));
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"body" | "headers" | "cookies">("body");
  const [routes, setRoutes] = useState<{ path: string; methods: string[] }[]>([]);
  const [dbSql, setDbSql] = useState("SELECT id, navn, kategori, pris, lager FROM produkter;");
  const [dbSnap, setDbSnap] = useState<{
    columns: string[];
    rows: unknown[][];
    error?: string;
  } | null>(null);

  const [pyReady, setPyReady] = useState(isPyodideReady());
  const [loadStage, setLoadStage] = useState<string | null>(null);

  useEffect(
    () =>
      onPyodideProgress((stage) => {
        setLoadStage(stage);
        if (stage === "Klar.") setPyReady(true);
      }),
    [],
  );

  async function ensureLoaded() {
    if (isPyodideReady()) {
      setPyReady(true);
      return;
    }
    await getPyodide();
    setPyReady(true);
  }

  async function loadRoutes() {
    try {
      await ensureLoaded();
      setRoutes(await listRoutes());
    } catch (e) {
      // Non-fatal — autocomplete just won't show.
      // eslint-disable-next-line no-console
      console.warn("listRoutes failed", e);
    }
  }

  useEffect(() => {
    if (pyReady && routes.length === 0) loadRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pyReady]);

  function applyPreset(presetId: string) {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setRequest({
      ...preset.request,
      headers: preset.request.headers.map((h) => ({ ...h })),
    });
    setResponse(null);
    setError(null);
  }

  async function send() {
    setBusy(true);
    setError(null);
    try {
      await ensureLoaded();
      const resp = await sendRequest(request);
      setResponse(resp);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function runDbSnap() {
    try {
      await ensureLoaded();
      setDbSnap(await snapshotDb(dbSql));
    } catch (e) {
      setDbSnap({
        columns: [],
        rows: [],
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  function patchHeader(idx: number, patch: Partial<ApiHeader>) {
    setRequest((r) => {
      const next = { ...r, headers: r.headers.map((h, i) => (i === idx ? { ...h, ...patch } : h)) };
      return next;
    });
  }

  function addHeader() {
    setRequest((r) => ({ ...r, headers: [...r.headers, { key: "", value: "", enabled: true }] }));
  }

  function removeHeader(idx: number) {
    setRequest((r) => ({ ...r, headers: r.headers.filter((_, i) => i !== idx) }));
  }

  const statusColor = useMemo(() => {
    if (!response) return "text-muted-foreground";
    if (response.status >= 500) return "text-destructive";
    if (response.status >= 400) return "text-warning";
    if (response.status >= 300) return "text-brand";
    return "text-success";
  }, [response]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight">API-konsoll</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Send HTTP-requester mot en demo Flask-app som kjører i nettleseren via Pyodide.
            Hele kjeden er synlig: request → routing → DB → respons. Velg en ferdiglagd
            request fra menyen, eller bygg din egen.
          </p>
        </div>

        {!pyReady && loadStage && (
          <div className="mb-4 rounded-lg border border-warning/40 bg-warning/5 p-3 text-sm flex items-center gap-3">
            <Loader2 className="h-4 w-4 animate-spin text-warning" />
            <span className="text-foreground">{loadStage}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_1fr] gap-4">
          {/* Request panel */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold tracking-tight">Request</h2>
              <select
                onChange={(e) => {
                  if (e.target.value) applyPreset(e.target.value);
                  e.target.value = "";
                }}
                className="text-xs rounded-md border border-border bg-background px-2 py-1"
                defaultValue=""
              >
                <option value="" disabled>
                  Last et eksempel…
                </option>
                {PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Method + URL */}
            <div className="flex gap-2">
              <select
                value={request.method}
                onChange={(e) => setRequest((r) => ({ ...r, method: e.target.value as HttpMethod }))}
                className="rounded-md border border-border bg-background px-2 py-1.5 text-sm font-mono font-semibold"
              >
                {METHODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <input
                value={request.path}
                onChange={(e) => setRequest((r) => ({ ...r, path: e.target.value }))}
                placeholder="/api/produkter"
                list="routes-list"
                className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-mono"
              />
              <datalist id="routes-list">
                {routes.map((r) => (
                  <option key={r.path} value={r.path} />
                ))}
              </datalist>
              <Button size="sm" onClick={send} disabled={busy}>
                {busy ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                )}
                Send
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border">
              {(["body", "headers", "cookies"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "px-3 py-1.5 text-xs uppercase tracking-wider border-b-2 -mb-px transition-colors",
                    tab === t
                      ? "border-brand text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === "body" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={request.bodyJson}
                      onChange={(e) => setRequest((r) => ({ ...r, bodyJson: e.target.checked }))}
                    />
                    JSON-body (setter Content-Type automatisk)
                  </label>
                  {request.bodyJson && request.body.trim() && (
                    <button
                      onClick={() => {
                        try {
                          setRequest((r) => ({
                            ...r,
                            body: JSON.stringify(JSON.parse(r.body), null, 2),
                          }));
                        } catch {
                          /* ignore */
                        }
                      }}
                      className="text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      Format JSON
                    </button>
                  )}
                </div>
                <textarea
                  value={request.body}
                  onChange={(e) => setRequest((r) => ({ ...r, body: e.target.value }))}
                  placeholder={
                    request.bodyJson
                      ? '{\n  "navn": "Ola"\n}'
                      : "form-data eller tekst"
                  }
                  rows={10}
                  className="w-full rounded-md border border-border bg-background p-2 text-xs font-mono"
                />
              </div>
            )}

            {tab === "headers" && (
              <div className="space-y-2">
                {request.headers.map((h, i) => (
                  <div key={i} className="grid grid-cols-[auto_1fr_2fr_auto] gap-2 items-center">
                    <input
                      type="checkbox"
                      checked={h.enabled}
                      onChange={(e) => patchHeader(i, { enabled: e.target.checked })}
                    />
                    <input
                      value={h.key}
                      onChange={(e) => patchHeader(i, { key: e.target.value })}
                      placeholder="Header-name"
                      className="rounded-md border border-border bg-background px-2 py-1 text-xs font-mono"
                    />
                    <input
                      value={h.value}
                      onChange={(e) => patchHeader(i, { value: e.target.value })}
                      placeholder="value"
                      className="rounded-md border border-border bg-background px-2 py-1 text-xs font-mono"
                    />
                    <button
                      onClick={() => removeHeader(i)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={addHeader}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Legg til header
                </Button>
              </div>
            )}

            {tab === "cookies" && (
              <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
                <p>
                  Demo-appen bruker Flask-session med signed cookie. Test_client beholder
                  cookies mellom requester automatisk — så hvis du POSTer til{" "}
                  <code className="font-mono text-foreground">/api/login</code>, vil etterfølgende
                  GET til <code className="font-mono text-foreground">/api/min-side</code> finne
                  session-cookien og slippe deg gjennom.
                </p>
                <p className="mt-2">
                  Cookie-headere du selv setter, sendes også med — bruk «Headers»-fanen.
                </p>
              </div>
            )}
          </div>

          {/* Response panel */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold tracking-tight">Respons</h2>
              {response && (
                <div className="flex items-center gap-3 text-xs">
                  <span className={cn("font-mono font-semibold", statusColor)}>
                    {response.status} {response.statusText}
                  </span>
                  <span className="text-muted-foreground">{response.durationMs} ms</span>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
                {error}
              </div>
            )}

            {!response && !error && (
              <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                Ingen respons ennå. Trykk «Send» for å starte.
              </div>
            )}

            {response && (
              <>
                <div className="rounded-md border border-border">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 py-1.5 border-b border-border flex items-center justify-between">
                    <span>Body</span>
                    <Badge variant="outline" className="text-[10px]">
                      {response.contentType || "(ingen)"}
                    </Badge>
                  </div>
                  <pre className="p-3 text-xs font-mono whitespace-pre-wrap max-h-[280px] overflow-auto">
                    {response.body || <span className="text-muted-foreground italic">(tom body)</span>}
                  </pre>
                </div>

                <details className="rounded-md border border-border">
                  <summary className="cursor-pointer text-[10px] uppercase tracking-wider text-muted-foreground px-3 py-1.5">
                    Headers ({response.headers.length})
                  </summary>
                  <div className="divide-y divide-border">
                    {response.headers.map((h, i) => (
                      <div key={i} className="grid grid-cols-[140px_1fr] gap-2 px-3 py-1.5 text-xs font-mono">
                        <span className="text-brand truncate">{h.key}</span>
                        <span className="text-foreground/80 break-all">{h.value}</span>
                      </div>
                    ))}
                  </div>
                </details>
              </>
            )}
          </div>
        </div>

        {/* DB snapshot */}
        <div className="mt-4 rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold tracking-tight flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              DB-snapshot
            </h2>
            <Button size="sm" variant="outline" onClick={runDbSnap}>
              Kjør spørring
            </Button>
          </div>
          <textarea
            value={dbSql}
            onChange={(e) => setDbSql(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-border bg-background p-2 text-xs font-mono"
          />
          {dbSnap?.error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
              {dbSnap.error}
            </div>
          )}
          {dbSnap && !dbSnap.error && (
            <div className="rounded-md border border-border overflow-x-auto">
              <table className="text-xs font-mono w-full">
                <thead className="bg-muted/30">
                  <tr>
                    {dbSnap.columns.map((c, i) => (
                      <th key={i} className="text-left px-3 py-1.5 text-brand font-semibold">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {dbSnap.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 py-1.5">
                          {cell === null ? (
                            <span className="italic text-muted-foreground">NULL</span>
                          ) : (
                            String(cell)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {dbSnap.rows.length === 0 && (
                    <tr>
                      <td colSpan={dbSnap.columns.length || 1} className="px-3 py-3 text-center text-muted-foreground italic">
                        (ingen rader)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
