import { useState } from "react";

type StatusClass = "2xx" | "3xx" | "4xx" | "5xx";

interface StatusCode {
  code: number;
  reason: string;
  klass: StatusClass;
  meaning: string;
  whenToUse: string;
  exampleBody?: string;
}

const CODES: StatusCode[] = [
  // 2xx — Success
  {
    code: 200,
    reason: "OK",
    klass: "2xx",
    meaning: "Standard success. Forespørselen lyktes og responsen inneholder resultatet.",
    whenToUse: "Du leverte data brukeren ba om — en HTML-side, et JSON-objekt, et bilde.",
    exampleBody: "<!DOCTYPE html><html>...</html>",
  },
  {
    code: 201,
    reason: "Created",
    klass: "2xx",
    meaning: "Ressursen ble opprettet. Sendes typisk etter en POST som lagde noe nytt.",
    whenToUse: "Bruker registrerte konto, opprettet en post, lastet opp en fil.",
    exampleBody: '{"id": 42, "email": "ola@ex.no"}',
  },
  {
    code: 204,
    reason: "No Content",
    klass: "2xx",
    meaning: "Vellykket — men ingenting å returnere. Ingen body.",
    whenToUse: "DELETE som lyktes, eller en PUT der klienten ikke trenger noe tilbake.",
  },
  // 3xx — Redirect
  {
    code: 301,
    reason: "Moved Permanently",
    klass: "3xx",
    meaning: "Ressursen har flyttet permanent. Klienten skal oppdatere bookmarks.",
    whenToUse: "Du har endret URL-struktur og vil at gamle lenker fortsatt skal fungere.",
    exampleBody: "(tom · Location-header peker til ny URL)",
  },
  {
    code: 302,
    reason: "Found",
    klass: "3xx",
    meaning: "Midlertidig redirect. Bruk samme URL neste gang.",
    whenToUse:
      "Etter en POST /login — redirect til /dashboard. Flask gjør dette med return redirect(...).",
  },
  {
    code: 304,
    reason: "Not Modified",
    klass: "3xx",
    meaning: "Klienten har en cachet versjon som fortsatt er gyldig. Bruk den.",
    whenToUse:
      "Klienten sendte If-None-Match eller If-Modified-Since, og innholdet har ikke endret seg.",
  },
  // 4xx — Client error
  {
    code: 400,
    reason: "Bad Request",
    klass: "4xx",
    meaning: "Klienten sendte noe ugyldig — feil format, manglende felt, parsing-feil.",
    whenToUse: "JSON-bodyen var ikke valid JSON. Skjemaet manglet et obligatorisk felt.",
    exampleBody: '{"error": "Missing field: email"}',
  },
  {
    code: 401,
    reason: "Unauthorized",
    klass: "4xx",
    meaning:
      'Du må logge inn (forvirrende navn — handler om "ikke autentisert", ikke om "ikke autorisert").',
    whenToUse: "Brukeren har ikke gyldig session-cookie eller token.",
  },
  {
    code: 403,
    reason: "Forbidden",
    klass: "4xx",
    meaning: "Du er logget inn, men har ikke lov til denne ressursen.",
    whenToUse: "Vanlig bruker prøver å åpne en admin-side.",
  },
  {
    code: 404,
    reason: "Not Found",
    klass: "4xx",
    meaning: "Ressursen finnes ikke.",
    whenToUse: "URL-en matcher ingen route. Eller produkt-IDen finnes ikke i databasen.",
    exampleBody: "<h1>404 — Siden finnes ikke</h1>",
  },
  // 5xx — Server error
  {
    code: 500,
    reason: "Internal Server Error",
    klass: "5xx",
    meaning: "Noe krasjet på serveren. Generell feilmelding når ingenting bedre passer.",
    whenToUse: "Unhandled exception i Flask-koden. Database-feil. Programmeringsfeil.",
    exampleBody: "<h1>500 — Internal Server Error</h1>",
  },
  {
    code: 502,
    reason: "Bad Gateway",
    klass: "5xx",
    meaning: "Serveren fungerer som proxy og fikk et ugyldig svar fra serveren bak.",
    whenToUse: "Nginx foran Flask, og Flask svarer ikke eller crasher.",
  },
  {
    code: 503,
    reason: "Service Unavailable",
    klass: "5xx",
    meaning: "Serveren er midlertidig nede — under vedlikehold eller overbelastet.",
    whenToUse: "Du tar ned tjenesten for vedlikehold, eller den ikke takler trafikken.",
  },
];

const CLASS_INFO: Record<StatusClass, { label: string; color: string; tag: string }> = {
  "2xx": { label: "Success", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", tag: "OK" },
  "3xx": { label: "Redirect", color: "bg-sky-500/20 text-sky-300 border-sky-500/40", tag: "Redir" },
  "4xx": { label: "Client error", color: "bg-amber-500/20 text-amber-300 border-amber-500/40", tag: "Klient" },
  "5xx": { label: "Server error", color: "bg-rose-500/20 text-rose-300 border-rose-500/40", tag: "Server" },
};

export function StatusCodeExplorer() {
  const [filter, setFilter] = useState<StatusClass | "all">("all");
  const [selected, setSelected] = useState<StatusCode>(CODES[0]);

  const filtered = filter === "all" ? CODES : CODES.filter((c) => c.klass === filter);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
            filter === "all"
              ? "bg-foreground text-background border-foreground"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          Alle ({CODES.length})
        </button>
        {(["2xx", "3xx", "4xx", "5xx"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
              filter === k
                ? CLASS_INFO[k].color
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {k} · {CLASS_INFO[k].label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-[80px_1fr_90px] gap-2 px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
            <div>Kode</div>
            <div>Reason</div>
            <div className="text-right">Klasse</div>
          </div>
          <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
            {filtered.map((c) => {
              const isSel = selected.code === c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => setSelected(c)}
                  className={`w-full grid grid-cols-[80px_1fr_90px] gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                    isSel ? "bg-brand/10" : "hover:bg-muted/30"
                  }`}
                >
                  <div className="font-mono font-semibold tabular-nums">{c.code}</div>
                  <div className="text-foreground/80 truncate">{c.reason}</div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded border text-[10px] font-mono ${CLASS_INFO[c.klass].color}`}
                    >
                      {c.klass}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="rounded-lg border border-border bg-card p-4 self-start">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold">{selected.code}</span>
            <span className="text-sm text-muted-foreground">{selected.reason}</span>
          </div>
          <span
            className={`inline-block mt-1 px-1.5 py-0.5 rounded border text-[10px] font-mono ${CLASS_INFO[selected.klass].color}`}
          >
            {selected.klass} · {CLASS_INFO[selected.klass].label}
          </span>
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Betydning
              </div>
              <p className="text-foreground/80 leading-relaxed mt-0.5">{selected.meaning}</p>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Når brukes den
              </div>
              <p className="text-foreground/80 leading-relaxed mt-0.5">{selected.whenToUse}</p>
            </div>
            {selected.exampleBody && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Eksempel-body
                </div>
                <pre className="mt-1 text-[11px] font-mono bg-zinc-950 text-zinc-100 p-2 rounded overflow-x-auto">
                  {selected.exampleBody}
                </pre>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
