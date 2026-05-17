import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FileText } from "lucide-react";

// ---------------------------------------------------------------------------
// HTTP Response Builder — bygg en respons stein for stein
// ---------------------------------------------------------------------------
// Pedagogisk poeng: en HTTP-respons er IKKE bare en statuskode. Visse
// statuskoder krever spesifikke headers (Location for 3xx, WWW-Authenticate
// for 401, Retry-After for 429/503), og andre forbyr body (204, 304). Denne
// komponenten lar brukeren velge alle delene fritt og viser deretter en
// "lint"-modus som markerer ulovlige kombinasjoner.
// ---------------------------------------------------------------------------

type Code = "200" | "201" | "204" | "301" | "304" | "400" | "401" | "403" | "404" | "409" | "422" | "429" | "500" | "503";

type CodeMeta = {
  code: Code;
  name: string;
  klasse: "2xx" | "3xx" | "4xx" | "5xx";
  defaultContentType?: string;
  forbidsBody?: boolean;
  requiredHeaders: string[];
  recommendedHeaders: string[];
  hint: string;
};

const CODES: CodeMeta[] = [
  { code: "200", name: "OK", klasse: "2xx",
    defaultContentType: "application/json",
    requiredHeaders: [],
    recommendedHeaders: ["Content-Type", "Cache-Control", "ETag"],
    hint: "Standard suksess. Body MÅ være satt og ha riktig Content-Type." },
  { code: "201", name: "Created", klasse: "2xx",
    defaultContentType: "application/json",
    requiredHeaders: ["Location"],
    recommendedHeaders: ["Content-Type"],
    hint: "Location-header peker på den nylig opprettede ressursen. Standard praksis (RFC 7231)." },
  { code: "204", name: "No Content", klasse: "2xx",
    forbidsBody: true,
    requiredHeaders: [],
    recommendedHeaders: [],
    hint: "Body MÅ være tom. Ingen Content-Type skal sendes — det finnes ingen body å beskrive." },
  { code: "301", name: "Moved Permanently", klasse: "3xx",
    requiredHeaders: ["Location"],
    recommendedHeaders: ["Cache-Control"],
    hint: "Location-header er obligatorisk — uten den vet ikke klienten hvor de skal." },
  { code: "304", name: "Not Modified", klasse: "3xx",
    forbidsBody: true,
    requiredHeaders: ["ETag"],
    recommendedHeaders: ["Cache-Control"],
    hint: "Conditional GET — ETag MÅ være med, body MÅ være tom. Klienten bruker cachet versjon." },
  { code: "400", name: "Bad Request", klasse: "4xx",
    defaultContentType: "application/json",
    requiredHeaders: [],
    recommendedHeaders: ["Content-Type"],
    hint: "Inkluder gjerne en JSON-body som forteller hva som var feil." },
  { code: "401", name: "Unauthorized", klasse: "4xx",
    requiredHeaders: ["WWW-Authenticate"],
    recommendedHeaders: [],
    hint: "WWW-Authenticate forteller klienten HVORDAN de skal autentisere (Bearer, Basic, …). RFC 7235." },
  { code: "403", name: "Forbidden", klasse: "4xx",
    defaultContentType: "application/json",
    requiredHeaders: [],
    recommendedHeaders: [],
    hint: "Ingen WWW-Authenticate — det hjelper ikke å logge inn på nytt. Brukeren har bare ikke tilgang." },
  { code: "404", name: "Not Found", klasse: "4xx",
    defaultContentType: "application/json",
    requiredHeaders: [],
    recommendedHeaders: [],
    hint: "Body er valgfri men hyggelig — fortell klienten hva som ikke ble funnet (ressurstype, evt. ID)." },
  { code: "409", name: "Conflict", klasse: "4xx",
    defaultContentType: "application/json",
    requiredHeaders: [],
    recommendedHeaders: [],
    hint: "Forklar konflikten i bodyen — duplikat-felt, ETag-mismatch, osv." },
  { code: "422", name: "Unprocessable Entity", klasse: "4xx",
    defaultContentType: "application/json",
    requiredHeaders: [],
    recommendedHeaders: [],
    hint: "Returner felt-for-felt valideringsfeil i body. Vanlig praksis fra REST-APIer (f.eks. Rails, FastAPI)." },
  { code: "429", name: "Too Many Requests", klasse: "4xx",
    requiredHeaders: ["Retry-After"],
    recommendedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining"],
    hint: "Retry-After (sekunder eller HTTP-dato) gir klienten et eksplisitt signal om når den kan prøve igjen." },
  { code: "500", name: "Internal Server Error", klasse: "5xx",
    defaultContentType: "application/json",
    requiredHeaders: [],
    recommendedHeaders: [],
    hint: "Vis ALDRI stack trace i prod-body. Bare et generisk «feil oppstod, prøv igjen»." },
  { code: "503", name: "Service Unavailable", klasse: "5xx",
    requiredHeaders: ["Retry-After"],
    recommendedHeaders: [],
    hint: "Retry-After signaliserer planlagt vedlikehold eller backoff. Uten den er den mer som en 500." },
];

const META: Record<Code, CodeMeta> = Object.fromEntries(CODES.map((c) => [c.code, c])) as Record<Code, CodeMeta>;

const KNOWN_HEADERS = [
  "Content-Type",
  "Content-Length",
  "Location",
  "WWW-Authenticate",
  "Retry-After",
  "ETag",
  "Cache-Control",
  "Set-Cookie",
  "X-RateLimit-Limit",
  "X-RateLimit-Remaining",
] as const;

type BodyFormat = "none" | "json" | "text" | "html";

type LintIssue = { level: "error" | "warn"; message: string };

const CLASS_COLOR: Record<CodeMeta["klasse"], string> = {
  "2xx": "text-emerald-500 border-emerald-500/40",
  "3xx": "text-sky-500 border-sky-500/40",
  "4xx": "text-amber-500 border-amber-500/40",
  "5xx": "text-red-500 border-red-500/40",
};

export function ResponseBuilder() {
  const [code, setCode] = useState<Code>("201");
  const [headers, setHeaders] = useState<Record<string, string>>({
    "Content-Type": "application/json",
    "Location": "/users/42",
  });
  const [bodyFormat, setBodyFormat] = useState<BodyFormat>("json");
  const [body, setBody] = useState<string>(`{ "id": 42, "name": "Ola" }`);
  const [lintOn, setLintOn] = useState(true);

  const meta = META[code];

  function selectCode(next: Code) {
    setCode(next);
    const m = META[next];
    // Reset to a sensible defaults pack for the new code
    const newHeaders: Record<string, string> = {};
    if (m.defaultContentType && !m.forbidsBody) {
      newHeaders["Content-Type"] = m.defaultContentType;
    }
    for (const h of m.requiredHeaders) {
      if (!(h in newHeaders)) newHeaders[h] = suggestedValueFor(h);
    }
    setHeaders(newHeaders);
    if (m.forbidsBody) {
      setBody("");
      setBodyFormat("none");
    } else {
      setBodyFormat(m.defaultContentType?.includes("json") ? "json" : "text");
      setBody(defaultBodyFor(next));
    }
  }

  function setHeader(name: string, value: string) {
    setHeaders((h) => ({ ...h, [name]: value }));
  }
  function removeHeader(name: string) {
    setHeaders((h) => {
      const out = { ...h };
      delete out[name];
      return out;
    });
  }

  const lintIssues: LintIssue[] = useMemo(() => {
    const issues: LintIssue[] = [];
    // Body forbidden by spec
    if (meta.forbidsBody && body.trim().length > 0) {
      issues.push({
        level: "error",
        message: `${meta.code} ${meta.name} forbyr message-body. Tøm body-feltet (eller bytt format til «ingen body»).`,
      });
    }
    if (meta.forbidsBody && headers["Content-Type"]) {
      issues.push({
        level: "warn",
        message: `Content-Type ble sendt, men ${meta.code} skal ikke ha body — hodet er overflødig.`,
      });
    }
    // Required headers
    for (const h of meta.requiredHeaders) {
      if (!headers[h] || headers[h]!.trim() === "") {
        issues.push({
          level: "error",
          message: `${meta.code} krever ${h}-header. Uten den er responsen ikke spec-konform.`,
        });
      }
    }
    // Body present but no Content-Type
    if (!meta.forbidsBody && body.trim().length > 0 && !headers["Content-Type"]) {
      issues.push({
        level: "warn",
        message: "Du har body, men ingen Content-Type. Klienten må gjette format.",
      });
    }
    // Specific anti-patterns
    if (code === "401" && headers["WWW-Authenticate"] && !/(bearer|basic|digest)/i.test(headers["WWW-Authenticate"]!)) {
      issues.push({
        level: "warn",
        message: "WWW-Authenticate bør angi schema (Bearer, Basic, Digest…), ikke bare en realm-streng.",
      });
    }
    if (code === "201" && headers["Location"] && headers["Location"]!.length < 2) {
      issues.push({
        level: "warn",
        message: "Location virker tom — den bør peke på den nyopprettede ressursen.",
      });
    }
    // 5xx with detailed stack trace warning
    if ((code === "500" || code === "503") && /traceback|stack|exception|at \w/i.test(body)) {
      issues.push({
        level: "warn",
        message: "Stack trace lekker i body. Logg det, men send et generisk feilsvar til klienten.",
      });
    }
    return issues;
  }, [code, headers, body, meta]);

  const wire = useMemo(() => buildWire(code, meta.name, headers, body, meta.forbidsBody === true), [code, meta, headers, body]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Response Builder</div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Velg statuskode, redigér headers og body. Wire-format og lint-meldinger oppdateres live.
          </p>
        </div>
        <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={lintOn}
            onChange={(e) => setLintOn(e.target.checked)}
            className="rounded"
          />
          Lint-modus
        </label>
      </div>

      {/* Code picker */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Statuskode</div>
        <div className="flex flex-wrap gap-1.5">
          {CODES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => selectCode(c.code)}
              className={`text-xs font-mono px-2 py-1 rounded border transition-colors ${
                code === c.code
                  ? `bg-card font-semibold ${CLASS_COLOR[c.klasse]}`
                  : "border-border hover:bg-muted"
              }`}
            >
              {c.code}
            </button>
          ))}
        </div>
        <div className="mt-2 rounded border border-border bg-muted/30 px-3 py-2 text-xs">
          <div className="font-semibold">
            {meta.code} {meta.name}{" "}
            <span className={`inline-block ml-1 px-1.5 py-0.5 rounded border text-[10px] ${CLASS_COLOR[meta.klasse]}`}>
              {meta.klasse}
            </span>
          </div>
          <div className="text-muted-foreground mt-1">{meta.hint}</div>
        </div>
      </div>

      {/* Headers */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Headers</div>
          <HeaderAdder
            existing={Object.keys(headers)}
            onAdd={(name) => setHeader(name, suggestedValueFor(name))}
          />
        </div>
        <div className="space-y-1.5">
          {Object.entries(headers).map(([name, value]) => {
            const required = meta.requiredHeaders.includes(name);
            const recommended = meta.recommendedHeaders.includes(name);
            return (
              <div
                key={name}
                className={`flex items-center gap-2 rounded border px-2 py-1 ${
                  required
                    ? "border-brand/40 bg-brand/5"
                    : recommended
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-border"
                }`}
              >
                <span className="text-xs font-mono font-semibold w-44 shrink-0 truncate" title={name}>
                  {name}
                  {required && <span className="text-[9px] text-brand ml-1">krev</span>}
                </span>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setHeader(name, e.target.value)}
                  className="flex-1 text-xs font-mono bg-background border border-border rounded px-1.5 py-0.5"
                />
                <button
                  type="button"
                  onClick={() => removeHeader(name)}
                  disabled={required}
                  className="text-[10px] text-muted-foreground hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  fjern
                </button>
              </div>
            );
          })}
          {Object.keys(headers).length === 0 && (
            <div className="text-[11px] text-muted-foreground italic">
              Ingen headers satt — bruk «legg til» over.
            </div>
          )}
        </div>
        {meta.recommendedHeaders.length > 0 && (
          <div className="mt-2 text-[11px] text-muted-foreground">
            <span className="font-semibold">Anbefalt for {meta.code}:</span>{" "}
            {meta.recommendedHeaders.join(", ")}
          </div>
        )}
      </div>

      {/* Body */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Body</div>
          <select
            value={bodyFormat}
            onChange={(e) => setBodyFormat(e.target.value as BodyFormat)}
            className="text-xs bg-background border border-border rounded px-1.5 py-0.5"
          >
            <option value="none">ingen body</option>
            <option value="json">JSON</option>
            <option value="text">text/plain</option>
            <option value="html">HTML</option>
          </select>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={bodyFormat === "none" || meta.forbidsBody}
          rows={Math.max(3, Math.min(8, body.split("\n").length))}
          className="w-full text-xs font-mono bg-background border border-border rounded px-2 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={meta.forbidsBody ? "(body forbudt for denne koden)" : "{ ... }"}
        />
      </div>

      {/* Lint */}
      {lintOn && (
        <div className="space-y-1.5">
          {lintIssues.length === 0 ? (
            <div className="rounded border border-emerald-500/40 bg-emerald-500/5 px-3 py-2 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Spec-konform. Wire-formatet under er gyldig.
            </div>
          ) : (
            lintIssues.map((iss, i) => (
              <div
                key={i}
                className={`rounded border px-3 py-2 text-xs flex items-start gap-2 ${
                  iss.level === "error"
                    ? "border-red-500/40 bg-red-500/5"
                    : "border-amber-500/40 bg-amber-500/5"
                }`}
              >
                <AlertTriangle
                  className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${
                    iss.level === "error" ? "text-red-500" : "text-amber-500"
                  }`}
                />
                <div>
                  <span className="font-semibold uppercase text-[10px] tracking-wider mr-1">{iss.level}</span>
                  {iss.message}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Wire format */}
      <div>
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
          <FileText className="h-3 w-3" /> Ferdig wire-format
        </div>
        <pre className="rounded-lg bg-[#0f172a] text-emerald-200 p-3 text-[11px] font-mono overflow-x-auto leading-relaxed">
{wire}
        </pre>
      </div>
    </div>
  );
}

function HeaderAdder({
  existing,
  onAdd,
}: {
  existing: string[];
  onAdd: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const candidates = KNOWN_HEADERS.filter((h) => !existing.includes(h));
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs px-2 py-0.5 rounded border border-border hover:bg-muted"
      >
        + legg til
      </button>
      {open && (
        <div className="absolute right-0 mt-1 z-10 w-56 rounded-md border border-border bg-card shadow-lg p-2 space-y-1">
          {candidates.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => {
                onAdd(h);
                setOpen(false);
              }}
              className="w-full text-left text-xs font-mono px-2 py-1 rounded hover:bg-muted"
            >
              {h}
            </button>
          ))}
          {candidates.length === 0 && (
            <div className="text-[11px] text-muted-foreground italic px-2">Alle kjente lagt til</div>
          )}
          <div className="pt-1 border-t border-border flex gap-1">
            <input
              type="text"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="X-Custom-Header"
              className="flex-1 text-[11px] font-mono bg-background border border-border rounded px-1.5 py-0.5"
            />
            <button
              type="button"
              onClick={() => {
                if (custom.trim()) {
                  onAdd(custom.trim());
                  setCustom("");
                  setOpen(false);
                }
              }}
              className="text-[10px] px-2 rounded border border-border hover:bg-muted"
            >
              ok
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function suggestedValueFor(name: string): string {
  switch (name) {
    case "Content-Type": return "application/json";
    case "Location": return "/users/42";
    case "WWW-Authenticate": return "Bearer realm=\"api\"";
    case "Retry-After": return "120";
    case "ETag": return "\"abc123\"";
    case "Cache-Control": return "no-cache";
    case "Content-Length": return "0";
    case "Set-Cookie": return "session=xyz; HttpOnly; Secure";
    case "X-RateLimit-Limit": return "1000";
    case "X-RateLimit-Remaining": return "0";
    default: return "";
  }
}

function defaultBodyFor(code: Code): string {
  switch (code) {
    case "200": return `{ "id": 42, "name": "Ola" }`;
    case "201": return `{ "id": 42, "name": "Ola", "created_at": "2026-05-17T10:00:00Z" }`;
    case "204": return "";
    case "301":
    case "304": return "";
    case "400": return `{ "error": "invalid_json", "detail": "Unexpected token at line 3" }`;
    case "401": return `{ "error": "unauthorized" }`;
    case "403": return `{ "error": "forbidden", "detail": "not in admin group" }`;
    case "404": return `{ "error": "not_found", "resource": "user", "id": 42 }`;
    case "409": return `{ "error": "conflict", "detail": "email already taken" }`;
    case "422": return `{ "errors": { "password": "too short", "email": "already in use" } }`;
    case "429": return `{ "error": "rate_limited", "retry_after": 120 }`;
    case "500": return `{ "error": "internal_error" }`;
    case "503": return `{ "error": "service_unavailable", "retry_after": 30 }`;
    default: return "";
  }
}

function buildWire(
  code: string,
  name: string,
  headers: Record<string, string>,
  body: string,
  forbidsBody: boolean
): string {
  const head = `HTTP/1.1 ${code} ${name}`;
  const hdrLines = Object.entries(headers).map(([k, v]) => `${k}: ${v}`);
  const bodyOut = forbidsBody ? "" : body;
  // If body is non-empty and no Content-Length, append one (informational, not authoritative)
  if (bodyOut && !headers["Content-Length"]) {
    hdrLines.push(`Content-Length: ${new TextEncoder().encode(bodyOut).length}`);
  }
  return [head, ...hdrLines, "", bodyOut].join("\n");
}
