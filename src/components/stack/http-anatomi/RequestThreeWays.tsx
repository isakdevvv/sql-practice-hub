import { useState } from "react";

type View = "raw" | "parsed" | "flask";

const VIEW_INFO: Record<View, { label: string; sub: string }> = {
  raw: {
    label: "Raw bytes",
    sub: "Det som faktisk kommer inn over TCP-socketen",
  },
  parsed: {
    label: "Parsed dict",
    sub: "Etter at HTTP-parseren har splittet det opp",
  },
  flask: {
    label: "Flask",
    sub: "Hvordan du leser det samme i koden din",
  },
};

export function RequestThreeWays() {
  const [view, setView] = useState<View>("raw");

  return (
    <div>
      <p className="text-foreground/80 leading-relaxed mb-5">
        Her er <strong>én og samme</strong> POST-request — vist på tre forskjellige
        abstraksjonsnivåer. Bytes-en kommer først. Parseren strukturerer dem. Flask gir deg
        oppslagsbøker. Innholdet er identisk.
      </p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {(["raw", "parsed", "flask"] as const).map((v, i) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`relative rounded-lg border p-3 text-left transition-colors ${
              view === v
                ? "border-brand bg-brand/10"
                : "border-border bg-card hover:border-foreground/20"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold ${
                  view === v
                    ? "bg-brand text-brand-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </span>
              <div>
                <div className="text-sm font-semibold">{VIEW_INFO[v].label}</div>
              </div>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground leading-snug">
              {VIEW_INFO[v].sub}
            </p>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-zinc-950 p-5 min-h-[360px]">
        {view === "raw" && <RawView />}
        {view === "parsed" && <ParsedView />}
        {view === "flask" && <FlaskView />}
      </div>

      <div className="mt-5 rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm">
        <strong className="text-foreground">Punchline:</strong>{" "}
        <span className="text-foreground/80">
          <code>request.form["email"]</code> i Flask er bare en konvenient måte å si "splitt body-en
          på <code>&amp;</code>, deretter på <code>=</code>, URL-decode delen, og slå opp{" "}
          <code>email</code>." Ingen magi. Bare bytes hele veien ned.
        </span>
      </div>
    </div>
  );
}

function RawView() {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-zinc-400 mb-2">
        Det Python ser hvis du leser fra en raw socket: bytes-objekt
      </div>
      <pre className="text-zinc-100 font-mono text-xs leading-6 overflow-x-auto whitespace-pre">
{`b"POST /login HTTP/1.1\\r\\n"
b"Host: example.com\\r\\n"
b"Content-Type: application/x-www-form-urlencoded\\r\\n"
b"Content-Length: 35\\r\\n"
b"\\r\\n"
b"email=ola%40ex.no&password=hunter2"`}
      </pre>
      <div className="mt-4 grid gap-2 text-[11px] text-zinc-400">
        <div>
          <span className="text-zinc-500">·</span> <code className="text-zinc-300">b&quot;...&quot;</code>{" "}
          er en Python <code>bytes</code>-literal — rå byte-verdier, ikke en str.
        </div>
        <div>
          <span className="text-zinc-500">·</span>{" "}
          <code className="text-zinc-300">\r\n</code> er to bytes:{" "}
          <code className="text-zinc-300">0x0D 0x0A</code> (carriage return + line feed).
        </div>
        <div>
          <span className="text-zinc-500">·</span> Den blanke linjen er bare ekstra{" "}
          <code className="text-zinc-300">\r\n</code> — så headers og body skilles av to{" "}
          <code className="text-zinc-300">\r\n</code> etter hverandre.
        </div>
      </div>
    </div>
  );
}

function ParsedView() {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-zinc-400 mb-2">
        Etter HTTP-parsing: en strukturert dict (Python-aktig pseudokode)
      </div>
      <pre className="text-zinc-100 font-mono text-xs leading-6 overflow-x-auto whitespace-pre">
{`{
  "method":  `}<span className="text-sky-300">{`"POST"`}</span>{`,
  "path":    `}<span className="text-violet-300">{`"/login"`}</span>{`,
  "version": `}<span className="text-zinc-400">{`"HTTP/1.1"`}</span>{`,
  "headers": {
    `}<span className="text-orange-300">{`"Host"`}</span>{`:           "example.com",
    `}<span className="text-orange-300">{`"Content-Type"`}</span>{`:   "application/x-www-form-urlencoded",
    `}<span className="text-orange-300">{`"Content-Length"`}</span>{`: "35",
  },
  "body":    `}<span className="text-green-300">{`b"email=ola%40ex.no&password=hunter2"`}</span>{`,
  "form":    {
    `}<span className="text-green-300">{`"email"`}</span>{`:    "ola@ex.no",
    `}<span className="text-green-300">{`"password"`}</span>{`: "hunter2",
  }
}`}
      </pre>
      <div className="mt-4 text-[11px] text-zinc-400 leading-relaxed">
        Parseren har splittet request-linjen på mellomrom, lest headers til den traff blank linje,
        deretter lest <code className="text-zinc-300">Content-Length</code> bytes som body. Den har
        URL-decoded form-bodyen (<code className="text-zinc-300">%40 → @</code>) og laget en dict
        for enkel tilgang.
      </div>
    </div>
  );
}

function FlaskView() {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-zinc-400 mb-2">
        Slik ser det ut i Flask-koden din
      </div>
      <pre className="text-zinc-100 font-mono text-xs leading-6 overflow-x-auto whitespace-pre">
{`from flask import Flask, request

app = Flask(__name__)

@app.route(`}<span className="text-violet-300">{`"/login"`}</span>{`, methods=[`}<span className="text-sky-300">{`"POST"`}</span>{`])
def login():
    request.method        `}<span className="text-zinc-500">{`# → "POST"`}</span>{`
    request.path          `}<span className="text-zinc-500">{`# → "/login"`}</span>{`
    request.headers[`}<span className="text-orange-300">{`"Host"`}</span>{`]
                          `}<span className="text-zinc-500">{`# → "example.com"`}</span>{`
    request.form[`}<span className="text-green-300">{`"email"`}</span>{`]
                          `}<span className="text-zinc-500">{`# → "ola@ex.no"`}</span>{`
    request.form[`}<span className="text-green-300">{`"password"`}</span>{`]
                          `}<span className="text-zinc-500">{`# → "hunter2"`}</span>{`
    return "OK"`}
      </pre>
      <div className="mt-4 grid gap-2 text-[11px] text-zinc-400">
        <div>
          <span className="text-sky-300">request.method</span> ← request-line, første ord
        </div>
        <div>
          <span className="text-violet-300">request.path</span> ← request-line, andre ord
        </div>
        <div>
          <span className="text-orange-300">request.headers</span> ← case-insensitive dict over
          header-linjene
        </div>
        <div>
          <span className="text-green-300">request.form</span> ← URL-decoded body, parsed som
          form-data
        </div>
      </div>
    </div>
  );
}
