import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Den fulle stakken — TCP til Python", anchor: "stakk" },
  { title: "Socket-aksept og raw bytes", anchor: "socket" },
  { title: "HTTP-parsing — bytes til request", anchor: "http" },
  { title: "WSGI — kontrakten mellom server og app", anchor: "wsgi" },
  { title: "Hvordan Flask svarer en route", anchor: "flask" },
  { title: "Produksjon — gunicorn, workere, nginx", anchor: "produksjon" },
];

export function Trinn10FlaskDypPage() {
  return (
    <StackPageShell title="10. Flask under panseret" group="stack">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Hardware-stakken · Trinn 10
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Flask under panseret — TCP, HTTP, WSGI, view
          </h1>
          <p className="mt-3 text-muted-foreground">
            Nå er alle byggesteinene på plass. Vi følger en HTTP-request
            fra rå bytes på en TCP-socket, gjennom HTTP-parsing,
            WSGI-aksept, Flask sin URL-router, og helt fram til{" "}
            <code>return jsonify(...)</code>. Hver linje av abstraksjon vi
            har bygget i de forrige trinnene utnyttes her.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «WSGI» — order av WSGI-flyt, application-callable
              signaturer.
            </div>
          </div>
        </div>

        <CourseOutline courseId="trinn-10-flask-dyp" steps={STEPS} />

        <section id="stakk" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Den fulle stakken — TCP til Python</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Når brukeren skriver  curl http://localhost:5000/hello :

  1. curl gjør gethostbyname → resolver IP
  2. curl gjør socket(AF_INET, SOCK_STREAM, 0) → fd
  3. connect(fd, "127.0.0.1:5000")  ← syscall, går til kjernen
       Kjernen gjør TCP 3-way handshake (SYN, SYN-ACK, ACK)
  4. curl write(fd, "GET /hello HTTP/1.1\\r\\nHost: ...\\r\\n\\r\\n")
       Bytes sendes som TCP-segmenter, kanskje fragmentert.
  5. På serveren (lokalt her): kernel mottar bytene, legger dem
     i socket-buffer for fd-en. Når Python-prosessen kaller
     read() eller recv(), kopieres bytene over.

På Python-siden — det er flere lag:

  HTTP-bytes
       │
       ▼
  TCP socket (kernel)
       │
       ▼
  WSGI-server (gunicorn, uwsgi, Werkzeug dev server)
       │  parsa HTTP til environ-dict
       ▼
  WSGI application (= Flask-objektet ditt)
       │  URL-router velger view-funksjonen
       ▼
  Din view-funksjon
       │  returnerer Response
       ▼
  WSGI-server serialiserer til HTTP-bytes
       │
       ▼
  TCP socket → kernel → curl

  Hvert lag er noen tusen linjer C eller Python. La oss zoome.`}</pre>
          </div>
        </section>

        <section id="socket" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Socket-aksept og raw bytes</h2>
          <p className="text-sm text-muted-foreground mb-4">
            WSGI-server-en (i utvikling: Werkzeug) har en hoved-loop som
            ligner mye på en C-server. Forenklet:
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`import socket

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
s.bind(("127.0.0.1", 5000))            # syscall: bind
s.listen(128)                            # syscall: listen — kø-størrelse 128

while True:
    conn, addr = s.accept()              # syscall: accept (blokkerer til ny connection)
    handle(conn)
    conn.close()

def handle(conn):
    # Les request-bytes til vi har hele headers
    data = b""
    while b"\\r\\n\\r\\n" not in data:
        chunk = conn.recv(4096)           # syscall: recv
        if not chunk: return
        data += chunk
    # data ser nå sånn ut:
    #   b"GET /hello HTTP/1.1\\r\\nHost: localhost:5000\\r\\nUser-Agent: curl\\r\\n\\r\\n"

    parsed = parse_http(data)            # ren Python-parsing
    response = handle_request(parsed)
    conn.sendall(response)               # syscall: send

  ALLE de fete linjene er syscalls — bytes krysser ring 3/0-grensen.
  Hver er ~hundrevis av nanosekunder, så dette dominerer kostnaden
  for små requests. Det er hvorfor keep-alive er en speedup.`}</pre>
          </div>
        </section>

        <section id="http" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. HTTP-parsing — bytes til request</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`HTTP/1.1-formatet er tekstbasert (mens HTTP/2 er binær). En request:

   GET /hello?name=Ola HTTP/1.1
   Host: localhost:5000
   User-Agent: curl/7.81.0
   Accept: */*

   <body — kan være tom for GET>

Parser-en deler dette opp i:
   method:   "GET"
   path:     "/hello"
   query:    "name=Ola"
   version:  "HTTP/1.1"
   headers:  {"Host": "localhost:5000", "User-Agent": ..., "Accept": ...}
   body:     b""

Den slår opp på \\r\\n for linje-skift, og \\r\\n\\r\\n for slutt på headers.
Body-lengden bestemmes av Content-Length header eller Transfer-Encoding.

Werkzeug har en parser i C (httptools) for fart. Den lager til slutt et
"environ"-dict — det er WSGI sin standardiserte form.


environ-dict (forenklet, ekte har flere felter):

   {
     'REQUEST_METHOD':   'GET',
     'PATH_INFO':        '/hello',
     'QUERY_STRING':     'name=Ola',
     'HTTP_HOST':        'localhost:5000',
     'HTTP_USER_AGENT':  'curl/7.81.0',
     'SERVER_NAME':      'localhost',
     'SERVER_PORT':      '5000',
     'wsgi.input':       <file-like, body-stream>,
     'wsgi.url_scheme':  'http',
     ...
   }`}</pre>
          </div>
        </section>

        <section id="wsgi" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. WSGI — kontrakten</h2>
          <p className="text-sm text-muted-foreground mb-4">
            WSGI (PEP 3333) er en avtale: serveren leverer to ting (environ
            + start_response), applikasjonen returnerer en iterable av
            bytes. Det er det. Hele Flask, Django, FastAPI (eller WSGI-modusen
            deres) implementerer denne kontrakten.
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`WSGI application callable — den ENKLESTE WSGI-appen:

   def application(environ, start_response):
       status = '200 OK'
       headers = [('Content-Type', 'text/plain; charset=utf-8')]
       start_response(status, headers)
       return [b'Hello, world!\\n']

  Det er ALT som trengs. Lagre i hello.py, kjør:
     $ gunicorn hello:application
  …og du har en webserver.

Hvordan serveren kaller appen:

   def serve_one(conn, addr, app):
       environ = parse_request(conn.recv(...))
       response_chunks = []
       def start_response(status, headers):
           response_chunks.append(b"HTTP/1.1 " + status.encode() + b"\\r\\n")
           for k, v in headers:
               response_chunks.append(k.encode() + b": " + v.encode() + b"\\r\\n")
           response_chunks.append(b"\\r\\n")
       body = app(environ, start_response)        # ← kaller appen
       for chunk in body:
           response_chunks.append(chunk)
       conn.sendall(b"".join(response_chunks))

  Det er hele "WSGI middleware ware ware" — bare wrappere rundt det.

Flask er en WSGI-app:

   from flask import Flask
   app = Flask(__name__)                          # 'app' ER en WSGI-callable

   @app.route("/hello")
   def hello():
       return "Hello, world!"

   if __name__ == "__main__":
       app.run()                                  # bruker Werkzeug dev-server

  app.__call__(environ, start_response) finnes — implementert i flask/app.py.
  Det er den serveren kaller.`}</pre>
          </div>
        </section>

        <section id="flask" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Hvordan Flask svarer en route</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Flask sin wsgi_app-metode (forenklet):

   def wsgi_app(self, environ, start_response):
       ctx = self.request_context(environ)          # bygger RequestContext
       try:
           ctx.push()                                # legger på flask.g, request
           try:
               response = self.full_dispatch_request()
           except Exception as e:
               response = self.handle_exception(e)
           return response(environ, start_response)  # Response er ogsÅ WSGI
       finally:
           ctx.pop()

   def full_dispatch_request(self):
       self.try_trigger_before_first_request_functions()
       try:
           self.preprocess_request()                  # before_request hooks
           rv = self.dispatch_request()              # ← din view-funksjon kalles
       except Exception as e:
           rv = self.handle_user_exception(e)
       return self.finalize_request(rv)

   def dispatch_request(self):
       req = _request_ctx_stack.top.request
       rule = req.url_rule                            # matchet av Werkzeug Router
       view_args = req.view_args
       return self.view_functions[rule.endpoint](**view_args)
       #      ↑                                 ↑
       #     "hello"-funksjonen du registrerte    /hello/ola → name="ola"

URL-routing:
   @app.route("/hello/<name>") registrerer en regel i Werkzeug-routeren.
   Når en request kommer inn med path "/hello/ola":
     1. Werkzeug-routeren matcher "/hello/<name>" mot path
     2. view_args = {"name": "ola"}
     3. dispatch_request kaller hello(name="ola")
     4. return-verdien blir til Response

Konvertering av return → Response:
   "Hello"                  → Response(b"Hello", 200, [("Content-Type", "text/html")])
   dict (Flask 2+)         → Response(json.dumps(d), 200, [...JSON...])
   Response(...)            → identisk
   (body, status, headers)  → Response(body, status, headers)
   (body, status)            → Response(body, status, [])
   tuple av andre former     → MIK feilmelding fra Flask`}</pre>
          </div>
        </section>

        <section id="produksjon" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Produksjon — gunicorn, workere, nginx</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Werkzeug-dev-serveren bruker én tråd. Den er for utvikling.
            I produksjon kjører du en ekte WSGI-server som gunicorn
            (eller uwsgi) bak en HTTP-reverse-proxy som nginx.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Typisk produksjons-arkitektur:

  Internett
     │
     ▼
  ┌──────────┐
  │  nginx   │  ← TLS-terminering, static files, rate-limiting, gzip
  │  :443    │
  └────┬─────┘
       │ proxy_pass http://127.0.0.1:8000
       ▼
  ┌──────────────────────────────┐
  │  gunicorn (master-prosess)   │
  │  :8000                       │
  └─┬────┬────┬────┬─────────────┘
    │    │    │    │
    ▼    ▼    ▼    ▼
   W1   W2   W3   W4         ← worker-prosesser (fork()-et fra master)
   |     |    |    |
   ▼    ▼    ▼    ▼
  Flask-app-instanser (en per worker)

  Hvorfor flere workers?
    - Hver worker har sin egen Python-interpreter med sin egen GIL
    - 4 workers = 4 forespørsler kan kjøre Python-bytecode samtidig
    - For I/O-bundet kan også gevent/eventlet (async workers) gi mange
      flere "samtidige" requests per worker

Kommando:
   gunicorn --workers 4 --bind 127.0.0.1:8000 myapp:app

  --workers N        : antall prosesser
  --threads N        : antall tråder per prosess (sync-worker)
  --worker-class     : sync / gthread / gevent / eventlet
  --timeout 30       : drep worker som tar mer enn 30s

nginx-konfig (forkortet):

   server {
       listen 443 ssl;
       server_name myapp.no;
       ssl_certificate /etc/letsencrypt/live/myapp.no/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/myapp.no/privkey.pem;

       location /static/ { alias /var/www/static/; }    # nginx serverer direkte

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Forwarded-For $remote_addr;
           proxy_set_header X-Forwarded-Proto https;
       }
   }

  Nå har du:
    - TLS terminert i nginx (gunicorn vet ikke om HTTPS — ser bare HTTP)
    - Statiske filer serveres uten å vekke Python
    - 4 prosesser deler last
    - 1 master overlever om en worker krasjer (gunicorn restarter den)`}</pre>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Du har gått hele stakken</h2>
          <p className="text-muted-foreground mb-2">
            Fra én transistor som leder eller blokkerer, til 4 NAND-er som
            blir en XOR, til en adder som blir en ALU, til en CPU som
            kjører assembly, til C som malloc-er bytes, til Python som er
            et C-program, til Flask som svarer på TCP-bytes via WSGI.
          </p>
          <p className="text-muted-foreground">
            Når noe går galt — segfault i C, MemoryError i Python, 502 fra
            nginx — har du nå mental modell til å spore det helt ned.
          </p>
          <p className="mt-3">
            <Link to="/drag" className="text-brand hover:underline">Gå til drag-oppgavene</Link>{" "}
            for å konsolidere — eller{" "}
            <Link to="/stack" className="text-brand hover:underline">tilbake til stack-oversikten</Link>.
          </p>
        </div>
      </div>
    </StackPageShell>
  );
}
