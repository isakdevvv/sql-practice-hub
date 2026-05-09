import { useState } from "react";

type View = "bytes" | "parsed" | "flask";

const RAW = `POST /login HTTP/1.1\r
Host: localhost:5000\r
User-Agent: Mozilla/5.0\r
Content-Type: application/x-www-form-urlencoded\r
Content-Length: 34\r
Cookie: session=eyJjc3JmIjoiYWJjIn0.ZxYz\r
\r
email=ola%40ex.no&password=hunter2`;

const PARSED = `method:  "POST"
path:    "/login"
version: "HTTP/1.1"

headers:
  Host:           "localhost:5000"
  User-Agent:     "Mozilla/5.0"
  Content-Type:   "application/x-www-form-urlencoded"
  Content-Length: "34"
  Cookie:         "session=eyJjc3JmIjoiYWJjIn0.ZxYz"

body (rå bytes):
  b"email=ola%40ex.no&password=hunter2"

body (URL-decodet):
  email    = "ola@ex.no"
  password = "hunter2"`;

const FLASK = `from flask import request

@app.route("/login", methods=["POST"])
def login():
    request.method                    # "POST"
    request.path                      # "/login"
    request.headers["Content-Type"]   # "application/x-www-form-urlencoded"
    request.cookies["session"]        # "eyJjc3JmIjoiYWJjIn0.ZxYz"

    request.form["email"]             # "ola@ex.no"
    request.form["password"]          # "hunter2"

    # Hva skjedde?
    # 1. Werkzeug leste rå bytes fra socket
    # 2. Parset HTTP-meldingen til environ
    # 3. Flask pakket environ inn i request-objektet
    # 4. request.form decodet x-www-form-urlencoded body
    #    (UTF-8 + URL-encoding fra "Bytes & encoding")`;

const TABS: Array<{ id: View; label: string; sub: string }> = [
  { id: "bytes", label: "1. Rå bytes", sub: "Det socket-en faktisk mottar" },
  { id: "parsed", label: "2. Parset", sub: "Det Werkzeug ser etter parsing" },
  { id: "flask", label: "3. Flask", sub: "Det du skriver i view-funksjonen" },
];

export function RequestThreeWays() {
  const [view, setView] = useState<View>("bytes");

  const display =
    view === "bytes"
      ? RAW.replace(/\r/g, "\\r").replace(/\n/g, "\\n\n")
      : view === "parsed"
        ? PARSED
        : FLASK;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-3">
        <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
          Samme HTTP-request — tre abstraksjonsnivåer
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={`text-left rounded-md border px-3 py-2 text-xs transition-colors ${
                view === t.id
                  ? "border-brand bg-brand/10 text-foreground"
                  : "border-border bg-background hover:bg-muted/50 text-muted-foreground"
              }`}
            >
              <div className="font-semibold">{t.label}</div>
              <div className="text-[10px] mt-0.5 opacity-80">{t.sub}</div>
            </button>
          ))}
        </div>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-[12px] leading-relaxed font-mono bg-background">
        <code className="text-foreground whitespace-pre">{display}</code>
      </pre>
      <div className="border-t border-border bg-amber-500/5 px-4 py-3 text-xs text-foreground/80 leading-relaxed">
        <span className="font-semibold">Aha-momentet:</span> Det er nøyaktig samme data hele veien.
        Forskjellen er bare hvor mye som er parset for deg. <code className="font-mono">%40</code>{" "}
        ble til <code className="font-mono">@</code> fordi URL-encoding er definert som UTF-8 +
        prosent-escaping — derfor måtte du forstå bytes & encoding først.
      </div>
    </div>
  );
}
