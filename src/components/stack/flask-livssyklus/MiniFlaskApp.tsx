import { useState } from "react";

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

type Scenario = {
  id: string;
  title: string;
  request: string;
  trace: string[];
  response: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "get-login",
    title: "GET /login (uten session)",
    request: `GET /login HTTP/1.1
Host: localhost:5000
(ingen Cookie)`,
    trace: [
      "Werkzeug parser HTTP → environ",
      "Flask bygger Request-objekt",
      "url_map matcher /login → endpoint='login'",
      "request.method == 'GET' → hopper over if-grenen",
      "render_template_string returnerer HTML-strengen",
      "Flask wrapper i Response, koder UTF-8, setter Content-Type: text/html",
    ],
    response: `HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 137

<form method="post">
  <input name="email" type="email" required>
  <input name="password" type="password" required>
  <button>Logg inn</button>
</form>`,
  },
  {
    id: "post-login",
    title: "POST /login (riktig passord)",
    request: `POST /login HTTP/1.1
Host: localhost:5000
Content-Type: application/x-www-form-urlencoded
Content-Length: 34

email=ola%40ex.no&password=hunter2`,
    trace: [
      "request.form['email'] → 'ola@ex.no'",
      "USERS.get('ola@ex.no') → user-dict",
      "check_password_hash(...) → True",
      "session['user_id'] = 1 → markert som modified",
      "redirect(url_for('konto')) → Response m/ Location-header",
      "Flask serialiserer session, signerer med secret_key, setter Set-Cookie",
    ],
    response: `HTTP/1.1 302 FOUND
Location: /konto
Set-Cookie: session=eyJ1c2VyX2lkIjoxfQ.ZxYz123; HttpOnly; Path=/
Content-Type: text/html; charset=utf-8`,
  },
  {
    id: "get-konto",
    title: "GET /konto (med session-cookie)",
    request: `GET /konto HTTP/1.1
Host: localhost:5000
Cookie: session=eyJ1c2VyX2lkIjoxfQ.ZxYz123`,
    trace: [
      "Werkzeug parser Cookie-headeren",
      "Flask verifiserer session-signaturen mot secret_key",
      "Decoder JSON → session['user_id'] = 1",
      "url_map matcher /konto → endpoint='konto'",
      "'user_id' in session → True, hopper over redirect",
      "f-string bygger HTML-respons",
    ],
    response: `HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 51

Hei bruker 1! <a href='/logout'>Logg ut</a>`,
  },
  {
    id: "get-konto-no-session",
    title: "GET /konto (uten cookie)",
    request: `GET /konto HTTP/1.1
Host: localhost:5000
(ingen Cookie)`,
    trace: [
      "Ingen Cookie-header → session er tom dict",
      "url_map matcher /konto → endpoint='konto'",
      "'user_id' not in session → True",
      "redirect(url_for('login')) bygger 302-respons",
    ],
    response: `HTTP/1.1 302 FOUND
Location: /login
Content-Type: text/html; charset=utf-8`,
  },
];

export function MiniFlaskApp() {
  const [active, setActive] = useState<string>(SCENARIOS[0].id);
  const scenario = SCENARIOS.find((s) => s.id === active)!;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground font-semibold flex items-center justify-between">
          <span>app.py — komplett mini-app</span>
          <span className="font-mono normal-case tracking-normal text-[10px]">
            Flask + Flask-Login-prinsipp + session
          </span>
        </div>
        <pre className="overflow-x-auto px-4 py-4 text-[12px] leading-relaxed font-mono bg-background">
          <code className="text-foreground">{APP_CODE}</code>
        </pre>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-4 py-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
            Velg en request og se hva som skjer
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                  active === s.id
                    ? "border-brand bg-brand/10 text-foreground font-semibold"
                    : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="p-4">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-2">
              Request inn
            </div>
            <pre className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap break-words text-foreground">
              <code>{scenario.request}</code>
            </pre>
          </div>

          <div className="p-4 bg-muted/10">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-2">
              Hva Flask gjør
            </div>
            <ol className="space-y-1.5">
              {scenario.trace.map((line, i) => (
                <li key={i} className="flex gap-2 text-[11px] text-foreground/85 leading-relaxed">
                  <span className="text-brand font-mono shrink-0">{i + 1}.</span>
                  <span>{line}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="p-4">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-2">
              Response ut
            </div>
            <pre className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap break-words text-foreground">
              <code>{scenario.response}</code>
            </pre>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Denne appen kjører ikke i browseren — det ville krevd Werkzeug, Flask og en hel
        Pyodide-bundling. I stedet viser tabellen over hva som faktisk hadde skjedd hvis du startet
        appen med <code className="font-mono">python app.py</code> og sendte requesten med curl
        eller browser. Test gjerne selv lokalt.
      </p>
    </div>
  );
}
