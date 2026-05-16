import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Lightbulb,
} from "lucide-react";

// ---------------------------------------------------------------------------
// HTTP-request-livssyklus — bytes → struct → environ → routing → view →
// Response → bytes. Step gjennom en GET-request og se hva som finnes på
// hvert lag.
// ---------------------------------------------------------------------------

type Layer =
  | "tcp-in"
  | "http"
  | "wsgi"
  | "flask"
  | "view"
  | "response"
  | "wsgi-out"
  | "tcp-out";

type Field = {
  key: string;
  value: string;
  highlight?: boolean;
};

type Step = {
  layer: Layer;
  layerLabel: string;
  code: string;
  fields: Field[];
  note: string;
};

const LAYER_ORDER: Layer[] = [
  "tcp-in",
  "http",
  "wsgi",
  "flask",
  "view",
  "response",
  "wsgi-out",
  "tcp-out",
];

const LAYER_META: Record<Layer, { short: string; full: string; tier: "transport" | "protokoll" | "rammeverk" | "app" }> = {
  "tcp-in": { short: "TCP inn", full: "Socket-mottak", tier: "transport" },
  http: { short: "HTTP", full: "HTTP-parser", tier: "protokoll" },
  wsgi: { short: "WSGI", full: "environ-dict", tier: "rammeverk" },
  flask: { short: "Flask", full: "URL-routing", tier: "rammeverk" },
  view: { short: "View", full: "Din funksjon", tier: "app" },
  response: { short: "Response", full: "Flask pakker svar", tier: "rammeverk" },
  "wsgi-out": { short: "WSGI ut", full: "start_response", tier: "rammeverk" },
  "tcp-out": { short: "TCP ut", full: "Socket-send", tier: "transport" },
};

const TIER_COLOR: Record<string, string> = {
  transport: "border-slate-500/60 bg-slate-500/10 text-slate-700 dark:text-slate-300",
  protokoll: "border-sky-500/60 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  rammeverk: "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  app: "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

const STEPS: Step[] = [
  {
    layer: "tcp-in",
    layerLabel: "Socket-mottak (TCP)",
    code: `conn, addr = server_sock.accept()
data = conn.recv(8192)
# data = b"GET /hei?navn=Ola HTTP/1.1\\r\\n..."`,
    fields: [
      {
        key: "rå bytes",
        value:
          'b"GET /hei?navn=Ola HTTP/1.1\\r\\nHost: localhost:5000\\r\\nUser-Agent: curl/8.4\\r\\nAccept: */*\\r\\n\\r\\n"',
        highlight: true,
      },
      { key: "kilde", value: "klient på 127.0.0.1:51234" },
      { key: "lengde", value: "104 bytes" },
    ],
    note: "Operativsystemet har akkurat akseptert TCP-tilkoblingen. Vi har en sammenhengende strøm av bytes som ENNÅ ikke er strukturert — det er bare 0-er og 1-ere som tilfeldigvis er ASCII.",
  },
  {
    layer: "http",
    layerLabel: "HTTP-parser",
    code: `request_line, headers, body = http.parse(data)
method, target, version = request_line.split(" ")
path, query = target.split("?", 1) if "?" in target else (target, "")`,
    fields: [
      { key: "method", value: "GET", highlight: true },
      { key: "path", value: "/hei", highlight: true },
      { key: "query", value: "navn=Ola" },
      { key: "version", value: "HTTP/1.1" },
      { key: "headers", value: '{"Host": "localhost:5000", "User-Agent": "curl/8.4", "Accept": "*/*"}' },
      { key: "body", value: '""  (GET har ingen body)' },
    ],
    note: "HTTP-parseren leser tekstprotokollen linje for linje og bygger en struktur. Bytes er fortsatt de samme — vi har bare lagt en tolkning over dem. method, path, headers er nå tilgjengelige som vanlige verdier.",
  },
  {
    layer: "wsgi",
    layerLabel: "WSGI environ-dict",
    code: `environ = {
    "REQUEST_METHOD":  "GET",
    "PATH_INFO":       "/hei",
    "QUERY_STRING":    "navn=Ola",
    "SERVER_PROTOCOL": "HTTP/1.1",
    "HTTP_HOST":       "localhost:5000",
    ...
}
app(environ, start_response)`,
    fields: [
      { key: "REQUEST_METHOD", value: "GET" },
      { key: "PATH_INFO", value: "/hei", highlight: true },
      { key: "QUERY_STRING", value: "navn=Ola" },
      { key: "HTTP_HOST", value: "localhost:5000" },
      { key: "HTTP_USER_AGENT", value: "curl/8.4" },
      { key: "SERVER_PROTOCOL", value: "HTTP/1.1" },
      { key: "wsgi.input", value: "<file-like for body>" },
    ],
    note: "WSGI er kontrakten mellom HTTP-server og Python-app. HTTP-feltene legges inn i én stor dict (environ). Hver verdi er str (eller bytes for body) — ingen Flask-spesifikke typer ennå. Det er bare en Python-dict.",
  },
  {
    layer: "flask",
    layerLabel: "Flask URL-routing",
    code: `# app.url_map har alle @app.route-registreringer
rule, args = app.url_map.bind(environ).match("/hei")
# rule.endpoint = "hei"
# args = {}  (ingen path-variabler i denne route-en)
view = app.view_functions[rule.endpoint]`,
    fields: [
      { key: "matched endpoint", value: '"hei"', highlight: true },
      { key: "view function", value: "<function hei_view at 0x7f...>" },
      { key: "path args", value: "{}" },
      { key: "registered routes", value: '["/", "/hei", "/api/<id>", ...]' },
    ],
    note: "Flask har en URL-map med alle dekorerte funksjoner. Den finner hvilken view som matcher /hei. Path-variabler (som <id>) hentes ut her og leveres som kwargs til view-funksjonen.",
  },
  {
    layer: "view",
    layerLabel: "View-funksjonen (din kode)",
    code: `@app.route("/hei")
def hei_view():
    navn = request.args.get("navn", "verden")
    return f"Hei, {navn}!"`,
    fields: [
      { key: "request.method", value: '"GET"' },
      { key: "request.path", value: '"/hei"' },
      { key: "request.args", value: 'MultiDict([("navn", "Ola")])' },
      { key: "navn (local)", value: '"Ola"', highlight: true },
      { key: "return value", value: '"Hei, Ola!"', highlight: true },
    ],
    note: 'Dette er KODEN DU SKREV. request er et thread-local proxy som peker tilbake på environ. Returverdien er en string — Flask wrapper den automatisk i en Response med mimetype text/html.',
  },
  {
    layer: "response",
    layerLabel: "Response-objekt",
    code: `response = make_response("Hei, Ola!")
response.status_code = 200
response.headers["Content-Type"]   = "text/html; charset=utf-8"
response.headers["Content-Length"] = "9"`,
    fields: [
      { key: "status", value: "200 OK", highlight: true },
      { key: "Content-Type", value: "text/html; charset=utf-8" },
      { key: "Content-Length", value: "9" },
      { key: "body", value: 'b"Hei, Ola!"', highlight: true },
    ],
    note: "Flask pakker view-svaret i en Response. Header-felt settes automatisk (Content-Type fra typen, Content-Length fra body). Hvis view-en hadde returnert en dict, ville Flask satt mimetype = application/json og kjørt json.dumps.",
  },
  {
    layer: "wsgi-out",
    layerLabel: "WSGI ut — start_response",
    code: `start_response("200 OK", [
    ("Content-Type", "text/html; charset=utf-8"),
    ("Content-Length", "9"),
])
return [b"Hei, Ola!"]   # iterator av bytes`,
    fields: [
      { key: "status_line", value: '"200 OK"' },
      { key: "headers", value: '[("Content-Type", "..."), ("Content-Length", "9")]' },
      { key: "body chunks", value: '[b"Hei, Ola!"]', highlight: true },
    ],
    note: "Flask leverer (status, headers, body-iterator) tilbake til WSGI-serveren. Body er en iterator av bytes — det er fordi store responser kan streames uten å laste alt i minnet samtidig.",
  },
  {
    layer: "tcp-out",
    layerLabel: "Socket-send (TCP)",
    code: `response_bytes = (
    b"HTTP/1.1 200 OK\\r\\n"
    b"Content-Type: text/html; charset=utf-8\\r\\n"
    b"Content-Length: 9\\r\\n"
    b"\\r\\n"
    b"Hei, Ola!"
)
conn.sendall(response_bytes)
conn.close()`,
    fields: [
      {
        key: "rå bytes ut",
        value:
          'b"HTTP/1.1 200 OK\\r\\nContent-Type: text/html; charset=utf-8\\r\\nContent-Length: 9\\r\\n\\r\\nHei, Ola!"',
        highlight: true,
      },
      { key: "lengde", value: "95 bytes" },
      { key: "mål", value: "klient 127.0.0.1:51234" },
    ],
    note: "Serveren serialiserer status + headers + body tilbake til HTTP-formatet — samme tekstprotokoll som kom inn, bare med rolle byttet. Bytes går over socket-en, klienten parser dem motsatt vei og får en string-respons. Sirkelen er sluttet.",
  },
];

// --- main component --------------------------------------------------------

export function RequestLifecycle() {
  const [stepIdx, setStepIdx] = useState(0);
  const step = STEPS[stepIdx];
  const layerIdx = LAYER_ORDER.indexOf(step.layer);

  const goPrev = () => setStepIdx((i) => Math.max(0, i - 1));
  const goNext = () => setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
  const reset = () => setStepIdx(0);
  const goLayer = (i: number) => setStepIdx(i);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
      <div className="text-xs text-muted-foreground">
        Ett enkelt <code>curl http://localhost:5000/hei?navn=Ola</code> går
        gjennom åtte lag før klienten får svaret. Klikk på et lag eller bruk
        Forrige/Neste for å se hva data ser ut som der.
      </div>

      {/* Lag-pipeline */}
      <div className="rounded-lg border border-border bg-background/40 p-3">
        <div className="flex items-baseline justify-between mb-2.5">
          <span className="text-[11px] font-semibold tracking-wider text-muted-foreground">
            REQUEST-PIPELINE
          </span>
          <span className="text-[10px] text-muted-foreground/70">
            inn fra venstre, ut til høyre
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {LAYER_ORDER.map((layer, i) => {
            const meta = LAYER_META[layer];
            const active = i === layerIdx;
            const passed = i < layerIdx;
            return (
              <div key={layer} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => goLayer(i)}
                  className={`text-[11px] px-2 py-1 rounded border transition ${
                    active
                      ? `${TIER_COLOR[meta.tier]} font-semibold ring-2 ring-brand`
                      : passed
                        ? `${TIER_COLOR[meta.tier]} opacity-70`
                        : "border-border bg-background/40 text-muted-foreground/70 hover:bg-muted/40"
                  }`}
                  title={meta.full}
                >
                  {meta.short}
                </button>
                {i < LAYER_ORDER.length - 1 && (
                  <span
                    className={`text-xs ${
                      i < layerIdx ? "text-foreground" : "text-muted-foreground/40"
                    }`}
                  >
                    →
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
          <LegendDot tier="transport" label="transport" />
          <LegendDot tier="protokoll" label="protokoll" />
          <LegendDot tier="rammeverk" label="rammeverk" />
          <LegendDot tier="app" label="din app" />
        </div>
      </div>

      {/* Kontroller */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={goPrev}
          disabled={stepIdx === 0}
          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Forrige
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={stepIdx >= STEPS.length - 1}
          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-brand bg-brand/15 text-foreground font-medium hover:bg-brand/25 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Neste
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted/40 text-muted-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
        <div className="ml-auto text-xs text-muted-foreground tabular-nums">
          Steg {stepIdx + 1} / {STEPS.length} · {step.layerLabel}
        </div>
      </div>

      {/* Kode-panel + state side om side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-background/60 overflow-x-auto">
          <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground border-b border-border bg-muted/30">
            KODE PÅ DETTE LAGET
          </div>
          <pre className="font-mono text-[11px] leading-relaxed m-0 p-3 whitespace-pre overflow-x-auto">
            {step.code}
          </pre>
        </div>

        <div className="rounded-lg border border-border bg-background/40 p-3">
          <div className="text-[11px] font-semibold tracking-wider text-muted-foreground mb-2">
            DATA NÅ
          </div>
          <div className="space-y-1.5">
            {step.fields.map((f, i) => (
              <div
                key={i}
                className={`rounded border px-2 py-1 ${
                  f.highlight
                    ? "border-brand/60 bg-brand/10"
                    : "border-border/60 bg-background/70"
                }`}
              >
                <div className="font-mono text-[11px] font-semibold text-foreground">
                  {f.key}
                </div>
                <div className="font-mono text-[10px] text-muted-foreground break-all">
                  {f.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Forklaring */}
      <div className="rounded-lg border border-brand/30 bg-brand/5 p-3 flex items-start gap-2.5">
        <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
        <p className="text-sm leading-relaxed">{step.note}</p>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Forenklet. I produksjon ligger gjerne en reverse-proxy (nginx) foran
        WSGI-serveren (gunicorn), og hver request kan håndteres av en av flere
        worker-prosesser. WSGI er definert i{" "}
        <a
          href="https://peps.python.org/pep-3333/"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-brand"
        >
          PEP 3333
        </a>
        .
      </p>
    </div>
  );
}

function LegendDot({
  tier,
  label,
}: {
  tier: "transport" | "protokoll" | "rammeverk" | "app";
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`w-2 h-2 rounded-sm border ${TIER_COLOR[tier]}`} />
      {label}
    </span>
  );
}
