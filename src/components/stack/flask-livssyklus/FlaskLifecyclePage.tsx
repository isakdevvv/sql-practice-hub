import { StackPageShell } from "@/components/stack/StackPageShell";
import { Prerequisites } from "@/components/stack/Prerequisites";
import type { Prerequisite } from "@/lib/stack/types";
import { LifecycleDiagram } from "./LifecycleDiagram";
import { WsgiEnvironExample } from "./WsgiEnvironExample";
import { RequestThreeWays } from "./RequestThreeWays";
import { MethodDataPlacement } from "./MethodDataPlacement";
import { SessionFlowDiagram } from "./SessionFlowDiagram";
import { MiniFlaskApp } from "./MiniFlaskApp";

const PREREQS: Prerequisite[] = [
  { slug: "bytes-encoding", title: "Bytes & encoding" },
  { slug: "tcp-sockets", title: "TCP & sockets (kort)" },
];

export function FlaskLifecyclePage() {
  return (
    <StackPageShell title="Flask request-livssyklus" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Trinn 5 · Eksamensforberedelse
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Flask request-livssyklus</h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Hva skjer egentlig fra browseren trykker enter til Flask returnerer en HTML-side? Vi
            følger bytes hele veien: gjennom DNS, TCP-socket, Werkzeug, WSGI-kontrakten, routing,
            view-funksjonen, Response-objektet og tilbake til socket.
          </p>
        </header>

        <Prerequisites items={PREREQS} />

        <Section
          number="1"
          title="Den store oversikten"
          summary="Hver boks under er ett steg fra browser til Flask og tilbake. Klikk for å lese hva som skjer."
        >
          <LifecycleDiagram />
        </Section>

        <Section
          number="2"
          title="Werkzeug og WSGI"
          summary="Dev-serveren er en helt vanlig Python-prosess som leser bytes fra en socket. WSGI er bare avtalen mellom server og rammeverk."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
                Det <code className="font-mono">app.run()</code> egentlig gjør (forenklet)
              </div>
              <pre className="rounded-md bg-background border border-border p-3 text-[12px] font-mono leading-relaxed overflow-x-auto">
                <code>{`import socket

srv = socket.socket(socket.AF_INET,
                    socket.SOCK_STREAM)
srv.bind(("127.0.0.1", 5000))
srv.listen()

while True:
    client, addr = srv.accept()        # blokkerer
    raw = client.recv(8192)            # rå HTTP-bytes
    environ = parse_http(raw)          # → dict
    body, status, headers = app(
        environ, start_response)
    client.sendall(http_response(
        status, headers, body))
    client.close()`}</code>
              </pre>
              <p className="mt-3 text-xs text-foreground/80 leading-relaxed">
                Werkzeug er litt mer avansert (tråder, keep-alive, parsing), men kjernen er denne.
                I produksjon bytter du dev-serveren mot gunicorn eller uWSGI — som gjør{" "}
                <em>akkurat det samme</em>, bare raskere og med flere prosesser.
              </p>
            </div>
            <WsgiEnvironExample />
          </div>
        </Section>

        <Section
          number="3"
          title="Routing — fra path til view-funksjon"
          summary="Flask bygger et url_map ved oppstart. Ved hver request slår den opp PATH_INFO i mappet og kaller riktig funksjon."
        >
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
                  Du registrerer regler
                </div>
                <pre className="rounded-md bg-background border border-border p-3 text-[12px] font-mono leading-relaxed overflow-x-auto">
                  <code>{`@app.route("/")
def index(): ...

@app.route("/users/<int:id>")
def show_user(id): ...

@app.route("/api/note", methods=["POST"])
def create_note(): ...`}</code>
                </pre>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
                  Flask bygger app.url_map
                </div>
                <pre className="rounded-md bg-background border border-border p-3 text-[12px] font-mono leading-relaxed overflow-x-auto">
                  <code>{`Map([
  Rule('/'           → endpoint='index'),
  Rule('/users/<int:id>'
                     → endpoint='show_user'),
  Rule('/api/note'   → endpoint='create_note',
                       methods={POST}),
  Rule('/static/<path:filename>'
                     → endpoint='static'),
])`}</code>
                </pre>
              </div>
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              <Step n="1" text="Werkzeug kaller app.url_map.match('/users/42', method='GET')" />
              <Step n="2" text="Match returnerer (endpoint='show_user', values={'id': 42})" />
              <Step n="3" text="Flask slår opp endpoint i view_functions-dict → finner show_user-funksjonen" />
              <Step n="4" text="Flask kaller show_user(id=42)" />
              <Step n="5" text="Andre veien: url_for('show_user', id=42) → '/users/42'" />
            </div>
          </div>
        </Section>

        <Section
          number="4"
          title="Request-objektet — fra rå bytes til Python"
          summary="Det viktigste å forstå: bytes på socket og request.form i Flask er nøyaktig samme data, bare på forskjellige abstraksjonsnivåer."
          anchor
        >
          <RequestThreeWays />
        </Section>

        <Section
          number="5"
          title="GET vs POST — hvor data ligger"
          summary="HTTP-metoden bestemmer hvor browser putter data. Flask gir deg tre forskjellige attributter, en for hver plassering."
        >
          <MethodDataPlacement />
        </Section>

        <Section
          number="6"
          title="Templates og response"
          summary="Det Flask returnerer er alltid bytes på en socket. Strenger, dict-er og Response-objekter blir alle normalisert dit."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
                render_template
              </div>
              <pre className="rounded-md bg-background border border-border p-3 text-[12px] font-mono leading-relaxed overflow-x-auto">
                <code>{`@app.route("/hei/<navn>")
def hei(navn):
    return render_template(
        "hei.html", navn=navn)

# templates/hei.html
# <h1>Hei {{ navn }}!</h1>`}</code>
              </pre>
              <ol className="mt-3 space-y-1 text-xs text-foreground/85 leading-relaxed list-decimal pl-5">
                <li>Jinja leser malfila og bytter ut <code className="font-mono">{`{{ navn }}`}</code></li>
                <li>Resultat: en Python-streng <code className="font-mono">"&lt;h1&gt;Hei Ola!&lt;/h1&gt;"</code></li>
                <li>Flask wrapper i Response, koder til UTF-8 bytes</li>
                <li>Setter Content-Type: text/html; charset=utf-8</li>
                <li>Werkzeug skriver HTTP-statuslinje + headere + body til socket</li>
              </ol>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
                redirect — bare en 302 med Location
              </div>
              <pre className="rounded-md bg-background border border-border p-3 text-[12px] font-mono leading-relaxed overflow-x-auto">
                <code>{`return redirect(url_for("konto"))

# blir til denne respons:
HTTP/1.1 302 FOUND
Location: /konto
Content-Type: text/html; charset=utf-8
Content-Length: 209

<!doctype html>
<html><body>
Redirecting to /konto…
</body></html>`}</code>
              </pre>
              <p className="mt-3 text-xs text-foreground/80 leading-relaxed">
                Browseren ser status 302 og Location-headeren, og sender automatisk en ny request
                til <code className="font-mono">/konto</code>. Det er to runder gjennom hele
                livssyklusen.
              </p>
            </div>
          </div>
        </Section>

        <Section
          number="7"
          title="Sesjoner og cookies"
          summary="Flask har ingen server-side state for sessions. Den signerer en cookie og lar browseren bære den frem og tilbake."
        >
          <SessionFlowDiagram />
        </Section>

        <Section
          number="8"
          title="Flask-Login flyt"
          summary="@login_required er bare en wrapper rundt session-sjekken vi nettopp så på."
        >
          <div className="rounded-xl border border-border bg-card p-4">
            <pre className="rounded-md bg-background border border-border p-3 text-[12px] font-mono leading-relaxed overflow-x-auto">
              <code>{`@app.route("/login", methods=["POST"])
def login():
    user = User.query.filter_by(email=request.form["email"]).first()
    if user and check_password_hash(user.pw_hash, request.form["password"]):
        login_user(user)        # → session["_user_id"] = str(user.id)
        return redirect(url_for("konto"))
    return "Feil", 401

@app.route("/konto")
@login_required               # ← dekorator, sjekker current_user
def konto():
    return f"Hei {current_user.email}"`}</code>
            </pre>
            <ol className="mt-4 space-y-1.5 text-sm text-foreground/85 leading-relaxed list-decimal pl-5">
              <li>
                <code className="font-mono">login_user(user)</code> setter{" "}
                <code className="font-mono">session["_user_id"]</code> — som blir til en signert
                cookie.
              </li>
              <li>
                Neste request: Flask-Login leser session, kaller{" "}
                <code className="font-mono">user_loader(id)</code> du har registrert, fyller{" "}
                <code className="font-mono">current_user</code>.
              </li>
              <li>
                <code className="font-mono">@login_required</code> sjekker{" "}
                <code className="font-mono">current_user.is_authenticated</code>. Hvis False:
                redirect til login-siden.
              </li>
              <li>
                <code className="font-mono">logout_user()</code> popper{" "}
                <code className="font-mono">_user_id</code> ut av session — neste cookie-request
                blir igjen anonym.
              </li>
            </ol>
          </div>
        </Section>

        <Section
          number="9"
          title="Liten Flask-app i sin helhet"
          summary="En komplett login-app. Velg en request og se sporet gjennom hele livssyklusen."
        >
          <MiniFlaskApp />
        </Section>

        <div className="mt-12 rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold">Oppsummering</h2>
          <ul className="mt-3 space-y-2 text-sm text-foreground/85 list-disc pl-5 leading-relaxed">
            <li>Browser åpner en TCP-socket og skriver HTTP-bytes inn.</li>
            <li>Werkzeug parser bytes til en environ-dict og kaller Flask-applikasjonen.</li>
            <li>Flask bygger Request, kjører before_request, ruter til en view-funksjon.</li>
            <li>View-funksjonen returnerer noe Flask normaliserer til en Response.</li>
            <li>Response kodes til bytes, skrives tilbake i samme socket, browseren parser.</li>
            <li>Sessions er signerte cookies — browseren bærer state, serveren verifiserer.</li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}

function Section({
  number,
  title,
  summary,
  children,
  anchor,
}: {
  number: string;
  title: string;
  summary: string;
  children: React.ReactNode;
  anchor?: boolean;
}) {
  return (
    <section className={`mt-10 ${anchor ? "scroll-mt-20" : ""}`}>
      <div className="mb-4">
        <div className="flex items-baseline gap-3">
          <span
            className={`text-xs font-mono ${
              anchor ? "text-brand font-bold" : "text-muted-foreground"
            }`}
          >
            §{number}
          </span>
          <h2 className={`font-semibold tracking-tight ${anchor ? "text-2xl" : "text-xl"}`}>
            {title}
          </h2>
          {anchor && (
            <span className="text-[10px] uppercase tracking-wider text-brand bg-brand/10 px-2 py-0.5 rounded">
              Anker-moment
            </span>
          )}
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{summary}</p>
      </div>
      {children}
    </section>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand/10 text-brand text-[11px] font-mono font-semibold">
        {n}
      </span>
      <span className="text-foreground/85 leading-relaxed">{text}</span>
    </div>
  );
}
