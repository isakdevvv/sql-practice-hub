import { useState } from "react";

type PartKind = "method" | "path" | "version" | "status" | "reason" | "header" | "blank" | "body";

interface Part {
  text: string;
  kind: PartKind;
  id: string;
  // Optional explanation override; otherwise lookup by kind
  note?: string;
}

interface Line {
  parts: Part[];
  // explanatory annotation shown to the right
  hint?: string;
}

const KIND_COLORS: Record<PartKind, string> = {
  method: "text-sky-300 hover:bg-sky-500/20 border-b border-dashed border-sky-500/40",
  path: "text-violet-300 hover:bg-violet-500/20 border-b border-dashed border-violet-500/40",
  version: "text-zinc-400 hover:bg-zinc-500/20 border-b border-dashed border-zinc-500/40",
  status: "text-emerald-300 hover:bg-emerald-500/20 border-b border-dashed border-emerald-500/40",
  reason: "text-emerald-200 hover:bg-emerald-500/20 border-b border-dashed border-emerald-500/40",
  header: "text-orange-300 hover:bg-orange-500/20 border-b border-dashed border-orange-500/40",
  blank: "",
  body: "text-green-300 hover:bg-green-500/20 border-b border-dashed border-green-500/40",
};

const KIND_LABELS: Record<PartKind, string> = {
  method: "HTTP-metode",
  path: "Path (URL etter domenet)",
  version: "HTTP-versjon",
  status: "Statuskode",
  reason: "Reason phrase",
  header: "Header",
  blank: "Tom linje",
  body: "Body",
};

const KIND_NOTES: Record<PartKind, string> = {
  method: "Hva slags handling klienten ber om. GET = hent, POST = send data, PUT/PATCH = oppdater, DELETE = slett.",
  path: "Hvilken ressurs på serveren. Dette er det Flask-routene dine matcher mot (@app.route('/login')).",
  version: "Forteller serveren hvilken versjon av HTTP-protokollen klienten bruker. HTTP/1.1 er standard.",
  status: "Tre sifre. Første siffer = klasse (2xx ok, 3xx redirect, 4xx klientfeil, 5xx serverfeil).",
  reason: "Menneskelig tekst som svarer til statuskoden. Klienten ignorerer denne — bare koden teller.",
  header: "Key-value-par med metadata. Format: 'Navn: verdi'. Én per linje, terminert med \\r\\n.",
  blank: "Bare én tom linje (\\r\\n\\r\\n). Markerer slutten på headers og starten på body.",
  body: "Selve innholdet — form-data, JSON, HTML, bilder. Lengden står i Content-Length-headeren.",
};

// Tabs for switching between examples
type ExampleId = "post-request" | "get-request" | "html-response";

const REQUEST_EXAMPLES: Record<"post-request" | "get-request", { label: string; lines: Line[] }> = {
  "post-request": {
    label: "POST /login",
    lines: [
      {
        parts: [
          { text: "POST", kind: "method", id: "m" },
          { text: " ", kind: "blank", id: "s1" },
          { text: "/login", kind: "path", id: "p" },
          { text: " ", kind: "blank", id: "s2" },
          { text: "HTTP/1.1", kind: "version", id: "v" },
        ],
        hint: "request-line: metode, path, versjon",
      },
      {
        parts: [{ text: "Host: example.com", kind: "header", id: "h-host" }],
        hint: "hvilken vert (domene) requesten gjelder",
      },
      {
        parts: [
          { text: "Content-Type: application/x-www-form-urlencoded", kind: "header", id: "h-ct" },
        ],
        hint: "body-en er en form, key=value adskilt med &",
      },
      {
        parts: [{ text: "Content-Length: 35", kind: "header", id: "h-cl" }],
        hint: "antall bytes i body-en",
      },
      { parts: [{ text: "", kind: "blank", id: "blank" }], hint: "← tom linje skiller headers fra body" },
      {
        parts: [{ text: "email=ola%40ex.no&password=hunter2", kind: "body", id: "b" }],
        hint: "selve dataene fra skjemaet",
      },
    ],
  },
  "get-request": {
    label: "GET /search (ingen body)",
    lines: [
      {
        parts: [
          { text: "GET", kind: "method", id: "m" },
          { text: " ", kind: "blank", id: "s1" },
          { text: "/search?q=norge&page=2", kind: "path", id: "p" },
          { text: " ", kind: "blank", id: "s2" },
          { text: "HTTP/1.1", kind: "version", id: "v" },
        ],
        hint: "data ligger i query-stringen, ikke i body",
      },
      {
        parts: [{ text: "Host: example.com", kind: "header", id: "h-host" }],
      },
      {
        parts: [{ text: "User-Agent: Mozilla/5.0", kind: "header", id: "h-ua" }],
        hint: "hvilken nettleser/klient",
      },
      {
        parts: [{ text: "Accept: text/html", kind: "header", id: "h-ac" }],
        hint: "hva slags respons klienten ønsker",
      },
      { parts: [{ text: "", kind: "blank", id: "blank" }], hint: "← blank linje, men ingen body følger" },
    ],
  },
};

const RESPONSE_EXAMPLE: Line[] = [
  {
    parts: [
      { text: "HTTP/1.1", kind: "version", id: "v" },
      { text: " ", kind: "blank", id: "s1" },
      { text: "200", kind: "status", id: "st" },
      { text: " ", kind: "blank", id: "s2" },
      { text: "OK", kind: "reason", id: "r" },
    ],
    hint: "status-line: versjon, kode, reason phrase",
  },
  {
    parts: [{ text: "Content-Type: text/html; charset=utf-8", kind: "header", id: "h-ct" }],
    hint: "body-en er HTML kodet som UTF-8",
  },
  {
    parts: [{ text: "Content-Length: 137", kind: "header", id: "h-cl" }],
  },
  {
    parts: [{ text: "Set-Cookie: session=abc123; HttpOnly", kind: "header", id: "h-sc" }],
    hint: "ber nettleseren lagre denne cookien",
  },
  { parts: [{ text: "", kind: "blank", id: "blank" }] },
  {
    parts: [{ text: "<!DOCTYPE html><html>...</html>", kind: "body", id: "b" }],
    hint: "HTML-dokumentet",
  },
];

export function HttpMessageBreakdown({ kind }: { kind: "request" | "response" }) {
  const [exampleId, setExampleId] = useState<ExampleId>(
    kind === "request" ? "post-request" : "html-response"
  );
  const [selected, setSelected] = useState<Part | null>(null);

  const lines: Line[] =
    kind === "response"
      ? RESPONSE_EXAMPLE
      : REQUEST_EXAMPLES[exampleId as "post-request" | "get-request"].lines;

  return (
    <div>
      {kind === "request" && (
        <div className="flex gap-2 mb-3">
          {(["post-request", "get-request"] as const).map((id) => (
            <button
              key={id}
              onClick={() => {
                setExampleId(id);
                setSelected(null);
              }}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                exampleId === id
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {REQUEST_EXAMPLES[id].label}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        {/* Message */}
        <div className="rounded-lg border border-border bg-zinc-950 text-zinc-100 p-4 font-mono text-sm overflow-x-auto">
          {lines.map((line, idx) => (
            <div key={idx} className="flex items-start gap-3 leading-7 group">
              <span className="text-zinc-600 select-none w-5 text-right text-xs pt-1">
                {idx + 1}
              </span>
              <span className="flex-1 min-w-0 whitespace-pre">
                {line.parts.length === 1 && line.parts[0].kind === "blank" ? (
                  <span className="text-zinc-600 italic text-xs">(blank linje · \r\n)</span>
                ) : (
                  line.parts.map((p) =>
                    p.kind === "blank" ? (
                      <span key={p.id}>{p.text}</span>
                    ) : (
                      <span
                        key={p.id}
                        onClick={() => setSelected(p)}
                        className={`cursor-pointer rounded px-0.5 transition-colors ${
                          KIND_COLORS[p.kind]
                        } ${
                          selected?.id === p.id && selected?.text === p.text
                            ? "bg-white/10"
                            : ""
                        }`}
                      >
                        {p.text}
                      </span>
                    )
                  )
                )}
              </span>
              {line.hint && (
                <span className="text-zinc-500 text-xs italic pt-1 hidden lg:block">
                  ← {line.hint}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Side panel */}
        <aside className="rounded-lg border border-border bg-card p-4 text-sm self-start">
          {selected ? (
            <>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                {KIND_LABELS[selected.kind]}
              </div>
              <div className="font-mono text-xs bg-muted/40 px-2 py-1 rounded mb-3 break-all">
                {selected.text}
              </div>
              <p className="text-foreground/80 leading-relaxed">
                {selected.note ?? KIND_NOTES[selected.kind]}
              </p>
            </>
          ) : (
            <div className="text-muted-foreground text-xs leading-relaxed">
              <p className="mb-2 font-semibold text-foreground">Klikk på en del</p>
              <p>
                Hver fargekode-del i meldingen kan klikkes. Forklaring vises her.
              </p>
              <ul className="mt-3 space-y-1 text-[11px]">
                {kind === "request" ? (
                  <>
                    <li><span className="inline-block w-3 h-3 rounded-sm bg-sky-500/40 align-middle mr-1.5" /> metode</li>
                    <li><span className="inline-block w-3 h-3 rounded-sm bg-violet-500/40 align-middle mr-1.5" /> path</li>
                  </>
                ) : (
                  <li><span className="inline-block w-3 h-3 rounded-sm bg-emerald-500/40 align-middle mr-1.5" /> statuskode</li>
                )}
                <li><span className="inline-block w-3 h-3 rounded-sm bg-zinc-500/40 align-middle mr-1.5" /> versjon</li>
                <li><span className="inline-block w-3 h-3 rounded-sm bg-orange-500/40 align-middle mr-1.5" /> header</li>
                <li><span className="inline-block w-3 h-3 rounded-sm bg-green-500/40 align-middle mr-1.5" /> body</li>
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
