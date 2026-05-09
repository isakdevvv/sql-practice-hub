import type { PyExercise } from "./types";
import { DEMO_APP_PYTHON } from "../api-konsoll/demoApp";

// All exercises target DAT1000-pensum: Flask, Jinja, MySQL via prepared
// statements, sessions, login, CSRF, JSON-API, HTTP-statuskoder.
//
// The runner has a built-in `mysql.connector` shim that uses sqlite3
// underneath — students write identical code (`%s` placeholders, cursor.execute,
// fetchall, commit) to what they'd run against a real MySQL server.
//
// Flask exercises use `app.test_client()` so users see HTTP-resultatet uten å
// måtte starte en server.

const DB_SETUP_PROSESS = `
import mysql.connector
db = mysql.connector.connect(database="prosess")
cur = db.cursor()
cur.execute("DROP TABLE IF EXISTS produkt")
cur.execute("DROP TABLE IF EXISTS ordrelinje")
cur.execute("DROP TABLE IF EXISTS kunde_p")
cur.execute("DROP TABLE IF EXISTS betaling")
cur.execute("""
CREATE TABLE produkt (
    prodnr INTEGER PRIMARY KEY,
    navn TEXT NOT NULL,
    kategori TEXT
)
""")
cur.execute("""
CREATE TABLE ordrelinje (
    id INTEGER PRIMARY KEY,
    prodnr INTEGER,
    antall INTEGER,
    pris REAL,
    FOREIGN KEY (prodnr) REFERENCES produkt(prodnr)
)
""")
cur.execute("""
CREATE TABLE kunde_p (
    kundenr INTEGER PRIMARY KEY,
    navn TEXT NOT NULL,
    epost TEXT,
    registrert TEXT
)
""")
cur.execute("""
CREATE TABLE betaling (
    betalingsnr INTEGER PRIMARY KEY,
    ordrenr INTEGER,
    belop REAL,
    metode TEXT
)
""")
cur.executemany(
    "INSERT INTO produkt VALUES (%s, %s, %s)",
    [
        (1, "Laptop", "Elektronikk"),
        (2, "Telefon", "Elektronikk"),
        (3, "Sko", "Klær"),
        (4, "T-skjorte", "Klær"),
        (5, "Bok", "Bøker"),
    ],
)
cur.executemany(
    "INSERT INTO ordrelinje VALUES (%s, %s, %s, %s)",
    [
        (1, 1, 1, 12000),
        (2, 1, 2, 300),
        (3, 2, 1, 8000),
        (4, 3, 3, 1000),
        (5, 4, 2, 250),
        (6, 5, 5, 150),
        (7, 1, 1, 12000),
        (8, 3, 2, 1000),
    ],
)
cur.executemany(
    "INSERT INTO kunde_p VALUES (%s, %s, %s, %s)",
    [
        (1, "Ola Nordmann", "ola@test.no", "2025-01-15"),
        (2, "Kari Hansen", None, "2025-02-03"),
        (3, "Per Olsen", "per@test.no", "2025-03-20"),
        (4, "Lise Berg", None, "2025-04-08"),
    ],
)
cur.executemany(
    "INSERT INTO betaling VALUES (%s, %s, %s, %s)",
    [
        (501, 1, 12300.0, "Kort"),
        (502, 2, 8000.0, "Vipps"),
        (503, 3, 1000.0, "Kort"),
        # ordre 4 har ingen betaling — for å vise merge-edge case
        (504, 5, 150.0, "Kontant"),
    ],
)
db.commit()
`;

const DB_SETUP = `
import mysql.connector
db = mysql.connector.connect(database="exam")
cur = db.cursor()
cur.execute("DROP TABLE IF EXISTS kunde")
cur.execute("""
CREATE TABLE kunde (
    kundenr INTEGER PRIMARY KEY,
    navn TEXT NOT NULL,
    epost TEXT,
    passord TEXT
)
""")
cur.execute("DROP TABLE IF EXISTS bestilling")
cur.execute("""
CREATE TABLE bestilling (
    bestnr INTEGER PRIMARY KEY,
    kundenr INTEGER,
    sum REAL,
    FOREIGN KEY (kundenr) REFERENCES kunde(kundenr)
)
""")
cur.executemany(
    "INSERT INTO kunde VALUES (%s, %s, %s, %s)",
    [
        (1, "Ola Nordmann", "ola@test.no", "hash_av_hemmelig"),
        (2, "Kari Hansen", "kari@test.no", "hash_av_passord"),
        (3, "Per Olsen", "per@test.no", "hash_av_p"),
    ],
)
cur.executemany(
    "INSERT INTO bestilling VALUES (%s, %s, %s)",
    [(101, 1, 1250.0), (102, 1, 320.0), (103, 2, 899.0)],
)
db.commit()
`;

export const PY_EXERCISES: PyExercise[] = [
  // ============ MYSQL CONNECTOR ============
  {
    id: "py-db-connect",
    topic: "MySQL connector",
    title: "Koble til databasen og hent alle kunder",
    description:
      "Bruk mysql.connector for å koble til databasen 'exam', lag en cursor, og hent alle kunder. Skriv ut hver rad.",
    requires: [],
    setup: DB_SETUP,
    starter: `import mysql.connector

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="hemmelig",
    database="exam",
)
cursor = db.cursor()

cursor.execute("SELECT * FROM kunde")
rows = cursor.fetchall()

for r in rows:
    print(r)
`,
    hints: [
      "fetchall() returnerer en liste av tupler.",
      "I oppgaven trenger du ikke ekte host/user — connectoren bruker en in-memory SQLite under panseret.",
    ],
    docs: [
      {
        title: "mysql.connector.connect()",
        url: "https://dev.mysql.com/doc/connector-python/en/connector-python-api-mysql-connector-connect.html",
        note: "Standard kobling — host, user, password, database er de fire vanligste.",
        snippet: `db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="hemmelig",
    database="exam",
)`,
      },
      {
        title: "cursor.execute() og fetchall()",
        url: "https://dev.mysql.com/doc/connector-python/en/connector-python-api-mysqlcursor-execute.html",
        note: "Kjør spørring → hent alle rader som liste av tupler.",
        snippet: `cursor = db.cursor()
cursor.execute("SELECT * FROM kunde")
rows = cursor.fetchall()`,
      },
    ],
  },
  {
    id: "py-db-prepared",
    topic: "MySQL connector",
    title: "Trygg SELECT med parameter (prepared statement)",
    description:
      "Hent én kunde basert på kundenr. Bruk %s-placeholder og send verdien som tuple — IKKE strengkonkatenering. Det beskytter mot SQL Injection.",
    setup: DB_SETUP,
    starter: `import mysql.connector

db = mysql.connector.connect(database="exam")
cursor = db.cursor()

kundenr = 2
cursor.execute(
    "SELECT navn, epost FROM kunde WHERE kundenr = %s",
    (kundenr,),
)
kunde = cursor.fetchone()
print(kunde)
`,
    hints: [
      "(kundenr,) — kommaet er viktig for at det skal være en tuple",
      "Bytt til (1) eller (3) for å se andre kunder",
    ],
    docs: [
      {
        title: "Parameter-binding (mysql.connector)",
        url: "https://dev.mysql.com/doc/connector-python/en/connector-python-api-mysqlcursor-execute.html",
        note: "Bruk %s i SQL-en, send verdiene som tuple. Connectoren escaper for deg.",
        snippet: `cursor.execute(
    "SELECT navn FROM kunde WHERE kundenr = %s",
    (kundenr,),
)`,
      },
      {
        title: "fetchone() vs fetchall()",
        url: "https://dev.mysql.com/doc/connector-python/en/connector-python-api-mysqlcursor-fetchone.html",
        note: "fetchone() returnerer én rad (tuple) eller None. fetchall() returnerer alle som liste.",
      },
      {
        title: "Hvorfor parameterbinding hindrer SQL injection (OWASP)",
        url: "https://owasp.org/www-community/attacks/SQL_Injection",
        note: "Strengkonkatenering blander kode og data. Placeholders holder dem atskilt.",
      },
    ],
  },
  {
    id: "py-db-insert",
    topic: "MySQL connector",
    title: "INSERT en ny kunde og lagre",
    description:
      "Sett inn en ny kunde med kundenr=4, og glem ikke db.commit() — uten commit lagres ikke endringen permanent.",
    setup: DB_SETUP,
    starter: `import mysql.connector

db = mysql.connector.connect(database="exam")
cursor = db.cursor()

cursor.execute(
    "INSERT INTO kunde (kundenr, navn, epost) VALUES (%s, %s, %s)",
    (4, "Lise Berg", "lise@test.no"),
)
db.commit()

cursor.execute("SELECT COUNT(*) FROM kunde")
print("Antall kunder:", cursor.fetchone()[0])
`,
    hints: ["Antall skal bli 4 etter INSERT + commit"],
    docs: [
      {
        title: "INSERT INTO (SQL syntax)",
        url: "https://dev.mysql.com/doc/refman/8.0/en/insert.html",
        snippet: `INSERT INTO kunde (kundenr, navn, epost)
VALUES (%s, %s, %s)`,
      },
      {
        title: "db.commit() og transaksjoner",
        url: "https://dev.mysql.com/doc/connector-python/en/connector-python-api-mysqlconnection-commit.html",
        note: "Endringer (INSERT/UPDATE/DELETE) kjører i en transaksjon. Uten commit ruller alt tilbake når tilkoblingen lukkes.",
      },
      {
        title: "cursor.lastrowid — id-en til den nye raden",
        url: "https://dev.mysql.com/doc/connector-python/en/connector-python-api-mysqlcursor-lastrowid.html",
        note: "Hvis kundenr var auto-inkrement kunne du hentet ID-en med cursor.lastrowid etter INSERT.",
      },
    ],
  },
  {
    id: "py-db-injection-bad",
    topic: "MySQL connector",
    title: "SQL Injection — se hvor galt det går uten prepared statement",
    description:
      "Den FARLIGE måten: brukerinput konkateneres rett inn i SQL. Kjør koden og se at en angriper kan dumpe ALLE kunder ved å sende ' OR 1=1 -- som input.",
    setup: DB_SETUP,
    starter: `import mysql.connector

db = mysql.connector.connect(database="exam")
cursor = db.cursor()

# DETTE ER DEN FARLIGE MÅTEN — IKKE GJØR SLIK I EKTE KODE
ondsinnet_input = "' OR 1=1 --"
sql = "SELECT navn FROM kunde WHERE navn = '" + ondsinnet_input + "'"
print("SQL som kjøres:", sql)
cursor.execute(sql)
print("Lekket:", cursor.fetchall())

# DEN TRYGGE MÅTEN — fyll inn:
# cursor.execute("SELECT navn FROM kunde WHERE navn = ___", (___,))
`,
    hints: [
      "OR 1=1 gjør WHERE alltid sant → alle rader returneres",
      "Fiks ved å bruke %s-placeholder og tuple",
    ],
    docs: [
      {
        title: "OWASP — SQL Injection",
        url: "https://owasp.org/www-community/attacks/SQL_Injection",
        note: "Klassisk angrep: brukerinput tolkes som SQL-kode. Forklarer både `' OR 1=1 --` og varianter som DROP TABLE.",
      },
      {
        title: "OWASP Cheat Sheet — Query Parameterization",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html",
        note: "Eneste robuste forsvaret: parameterized queries / prepared statements. Aldri konkateneer brukerinput inn i SQL.",
        snippet: `# Trygt:
cursor.execute(
    "SELECT navn FROM kunde WHERE navn = %s",
    (brukerinput,),
)`,
      },
    ],
  },

  // ============ FLASK ROUTING ============
  {
    id: "py-flask-hello",
    topic: "Flask routing",
    title: "Første Flask-route",
    description:
      "Lag en Flask-app med én route som returnerer 'Hei!'. Vi bruker app.test_client() for å sende en GET /-request og se responsen — uten å starte en ekte server.",
    requires: ["flask"],
    starter: `from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "Hei!"

# Test routen:
client = app.test_client()
resp = client.get("/")
print("Status:", resp.status_code)
print("Body:", resp.data.decode())
`,
    hints: ["Status skal bli 200", "Body skal bli 'Hei!'"],
    docs: [
      {
        title: "Flask quickstart — A Minimal Application",
        url: "https://flask.palletsprojects.com/en/stable/quickstart/#a-minimal-application",
        note: "Flask(__name__) + @app.route(\"/\") + funksjon som returnerer responsen.",
        snippet: `from flask import Flask
app = Flask(__name__)

@app.route("/")
def home():
    return "Hei!"`,
      },
      {
        title: "Flask test_client()",
        url: "https://flask.palletsprojects.com/en/stable/testing/#sending-requests-with-the-test-client",
        note: "Send forespørsler uten å starte en ekte server.",
        snippet: `client = app.test_client()
resp = client.get("/")
resp.status_code   # 200
resp.data          # bytes — bruk .decode()`,
      },
    ],
  },
  {
    id: "py-flask-url-param",
    topic: "Flask routing",
    title: "Route med URL-parameter",
    description:
      "Lag en route /kunde/<int:kundenr> som returnerer en hilsen med kundenummeret. Test med to forskjellige kundenummer.",
    requires: ["flask"],
    starter: `from flask import Flask

app = Flask(__name__)

@app.route("/kunde/<int:kundenr>")
def kunde(kundenr):
    return f"Kunde nr. {kundenr}"

client = app.test_client()
print(client.get("/kunde/1").data.decode())
print(client.get("/kunde/42").data.decode())

# Hva skjer med ikke-tall?
print("Ikke-tall:", client.get("/kunde/abc").status_code)
`,
    hints: [
      "<int:kundenr> tvinger Flask til å konvertere til int — bokstaver gir 404",
    ],
    docs: [
      {
        title: "Variable rules — URL converters",
        url: "https://flask.palletsprojects.com/en/stable/quickstart/#variable-rules",
        note: "<int:x>, <string:x>, <uuid:x>, <float:x>, <path:x> — Flask validerer og konverterer for deg.",
        snippet: `@app.route("/kunde/<int:kundenr>")
def kunde(kundenr):
    return f"Kunde nr. {kundenr}"`,
      },
    ],
  },
  {
    id: "py-flask-jinja",
    topic: "Flask + Jinja",
    title: "Render Jinja-template med data",
    description:
      "Send en liste med kunder til en Jinja-template og rendrer den. Bruk render_template_string for å teste uten templates/-mappe.",
    requires: ["flask"],
    starter: `from flask import Flask, render_template_string

app = Flask(__name__)

TEMPLATE = """
<ul>
{% for k in kunder %}
  <li>{{ k.navn }} ({{ k.epost }})</li>
{% endfor %}
</ul>
""".strip()

@app.route("/kunder")
def liste():
    kunder = [
        {"navn": "Ola", "epost": "ola@test.no"},
        {"navn": "Kari", "epost": "kari@test.no"},
    ]
    return render_template_string(TEMPLATE, kunder=kunder)

client = app.test_client()
print(client.get("/kunder").data.decode())
`,
    hints: [
      "{{ }} er for verdier, {% %} er for kontroll-strukturer",
      "Jinja autoescaper output — beskytter mot XSS",
    ],
    docs: [
      {
        title: "render_template_string()",
        url: "https://flask.palletsprojects.com/en/stable/api/#flask.render_template_string",
        note: "I ekte kode bruker du render_template('foo.html', ...) som leser fra templates/-mappa. _string er for små eksempler.",
      },
      {
        title: "Jinja2 — Template Designer Documentation",
        url: "https://jinja.palletsprojects.com/en/stable/templates/",
        note: "Full referanse: variabler, kontroll, filtre, makroer, arv ({% extends %} / {% block %}).",
      },
      {
        title: "Auto-escaping (Jinja)",
        url: "https://jinja.palletsprojects.com/en/stable/templates/#html-escaping",
        note: "Jinja escaper {{ var }} som default — `<script>` blir tekst, ikke kode. Stopper XSS.",
      },
    ],
  },
  {
    id: "py-flask-form-post",
    topic: "Flask + forms",
    title: "Håndter POST fra et skjema",
    description:
      "Lag en route /login som svarer ulikt på GET (viser skjema) og POST (mottar form-data). Test begge.",
    requires: ["flask"],
    starter: `from flask import Flask, request

app = Flask(__name__)

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        navn = request.form.get("brukernavn", "")
        return f"POST mottatt — bruker: {navn}"
    return "GET — vis login-skjema"

client = app.test_client()
print(client.get("/login").data.decode())
print(client.post("/login", data={"brukernavn": "ola"}).data.decode())
`,
    hints: [
      "request.form er dict-aktig — bruk .get for default-verdi",
      "methods=['GET','POST'] kreves for å akseptere POST",
    ],
    docs: [
      {
        title: "request.form / request.method",
        url: "https://flask.palletsprojects.com/en/stable/api/#flask.Request.form",
        note: "request.form for body-parametre fra <form>. request.args for query-string. request.json for JSON-body.",
        snippet: `@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        navn = request.form.get("brukernavn", "")
        ...`,
      },
      {
        title: "HTTP-metoder i Flask",
        url: "https://flask.palletsprojects.com/en/stable/quickstart/#http-methods",
        note: "Default er bare GET. methods=['POST'] eller flere for å akseptere andre verb.",
      },
    ],
  },

  // ============ FLASK + DB ============
  {
    id: "py-flask-db",
    topic: "Flask + MySQL",
    title: "Route som henter data fra databasen",
    description:
      "Kombinér Flask + mysql.connector. Lag en route /kunder som SELECT-er alle kunder og returnerer dem.",
    requires: ["flask"],
    setup: DB_SETUP,
    starter: `from flask import Flask
import mysql.connector

app = Flask(__name__)

def get_db():
    return mysql.connector.connect(database="exam")

@app.route("/kunder")
def liste():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT navn, epost FROM kunde")
    rows = cursor.fetchall()
    return "\\n".join(f"{n} <{e}>" for n, e in rows)

client = app.test_client()
print(client.get("/kunder").data.decode())
`,
    hints: ["fetchall() returnerer liste av tupler — pakk ut med (n, e)"],
    docs: [
      {
        title: "Application Factory og DB-kobling per request",
        url: "https://flask.palletsprojects.com/en/stable/tutorial/database/",
        note: "I produksjon vil du holde DB-tilkoblingen i flask.g per request. Her bruker vi en enkel get_db() for å vise prinsippet.",
      },
      {
        title: "Tuple-unpacking i Python",
        url: "https://docs.python.org/3/tutorial/datastructures.html#tuples-and-sequences",
        note: "fetchall() returnerer en liste av tupler. (n, e) bryter ut hver kolonne i et lokalt navn.",
        snippet: `for n, e in cursor.fetchall():
    print(f"{n} <{e}>")`,
      },
    ],
  },

  // ============ JSON API ============
  {
    id: "py-flask-json-api",
    topic: "JSON API",
    title: "Returnér JSON fra databasen",
    description:
      "Lag en API-route /api/kunder som returnerer kundene som JSON. Bruk Flask sin jsonify for riktig Content-Type.",
    requires: ["flask"],
    setup: DB_SETUP,
    starter: `from flask import Flask, jsonify
import mysql.connector

app = Flask(__name__)

@app.route("/api/kunder")
def api_kunder():
    db = mysql.connector.connect(database="exam")
    cursor = db.cursor()
    cursor.execute("SELECT kundenr, navn, epost FROM kunde")
    rows = cursor.fetchall()
    data = [{"kundenr": k, "navn": n, "epost": e} for k, n, e in rows]
    return jsonify(data)

client = app.test_client()
resp = client.get("/api/kunder")
print("Content-Type:", resp.content_type)
print("JSON:", resp.get_json())
`,
    hints: ["jsonify setter Content-Type=application/json automatisk"],
    docs: [
      {
        title: "flask.jsonify",
        url: "https://flask.palletsprojects.com/en/stable/api/#flask.json.jsonify",
        note: "Serialiserer dict/liste til JSON og setter Content-Type: application/json.",
        snippet: `data = [{"kundenr": k, "navn": n} for k, n in rows]
return jsonify(data)`,
      },
      {
        title: "REST API best practices",
        url: "https://restfulapi.net/json-rest-api-guidelines/",
        note: "Returnér alltid JSON med riktig Content-Type. /api/-prefiks skiller datalag fra HTML-sider.",
      },
    ],
  },

  // ============ HTTP STATUSKODER ============
  {
    id: "py-flask-404",
    topic: "HTTP-statuskoder",
    title: "Returnér 404 hvis kunde ikke finnes",
    description:
      "Bruk abort(404) når en kunde ikke finnes i databasen. Test både eksisterende og ikke-eksisterende kundenr.",
    requires: ["flask"],
    setup: DB_SETUP,
    starter: `from flask import Flask, abort
import mysql.connector

app = Flask(__name__)

@app.route("/kunde/<int:kundenr>")
def vis_kunde(kundenr):
    db = mysql.connector.connect(database="exam")
    cursor = db.cursor()
    cursor.execute("SELECT navn FROM kunde WHERE kundenr = %s", (kundenr,))
    rad = cursor.fetchone()
    if rad is None:
        abort(404)
    return f"Kunde: {rad[0]}"

client = app.test_client()
print("Eksisterer:", client.get("/kunde/1").status_code, client.get("/kunde/1").data.decode())
print("Finnes ikke:", client.get("/kunde/999").status_code)
`,
    hints: [
      "abort(404) heaver Werkzeug-exception som Flask konverterer til HTTP 404",
      "fetchone() returnerer None hvis ingen rad matcher",
    ],
    docs: [
      {
        title: "flask.abort",
        url: "https://flask.palletsprojects.com/en/stable/api/#flask.abort",
        note: "Stop request-en med en HTTP-feilkode. Mer idiomatisk enn `return ..., 404`.",
        snippet: `if rad is None:
    abort(404)`,
      },
      {
        title: "HTTP statuskoder (MDN)",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status",
        note: "200 OK · 201 Created · 204 No Content · 400 Bad Request · 401 Unauthorized · 404 Not Found · 500 Server Error.",
      },
    ],
  },

  // ============ SESSIONS ============
  {
    id: "py-flask-session",
    topic: "Sessions",
    title: "Session — lagre data mellom requester",
    description:
      "Sett en verdi i session, og les den i en annen route. Test at samme klient ser sin egen session via cookies.",
    requires: ["flask"],
    starter: `from flask import Flask, session

app = Flask(__name__)
app.config["SECRET_KEY"] = "ikke-bruk-dette-i-produksjon"

@app.route("/sett/<navn>")
def sett(navn):
    session["bruker"] = navn
    return f"Satt session bruker = {navn}"

@app.route("/hvem")
def hvem():
    return f"Du er innlogget som: {session.get('bruker', '(ingen)')}"

client = app.test_client()
# Før noe er satt:
print(client.get("/hvem").data.decode())
# Sett bruker — cookien lagres i klienten:
print(client.get("/sett/ola").data.decode())
# Senere request fra samme klient ser session:
print(client.get("/hvem").data.decode())
`,
    hints: [
      "SECRET_KEY trengs — Flask signerer session-cookien med den",
      "test_client() holder cookies mellom requester automatisk",
    ],
    docs: [
      {
        title: "flask.session",
        url: "https://flask.palletsprojects.com/en/stable/api/#flask.session",
        note: "Per-bruker storage som lagres i en signert cookie hos klienten. Lett, men tåler ikke store mengder data.",
        snippet: `session["bruker"] = navn
# senere:
navn = session.get("bruker", "(ingen)")`,
      },
      {
        title: "SECRET_KEY — hvorfor den må settes",
        url: "https://flask.palletsprojects.com/en/stable/config/#SECRET_KEY",
        note: "Flask signerer session-cookien med SECRET_KEY. Hemmelighold den (env-variabel i prod). Endring tilbakekaller alle sessioner.",
      },
    ],
  },

  // ============ LOGIN ============
  {
    id: "py-flask-login",
    topic: "Login & sessions",
    title: "Login-flyt med session og @login_required-stil",
    description:
      "Implementer minimal login: POST /login setter session, GET /dashboard krever innlogging — ellers redirect til /login.",
    requires: ["flask"],
    setup: DB_SETUP,
    starter: `from flask import Flask, session, request, redirect, url_for
from functools import wraps
import mysql.connector

app = Flask(__name__)
app.config["SECRET_KEY"] = "test"

def login_required(view):
    @wraps(view)
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            return redirect(url_for("login"))
        return view(*args, **kwargs)
    return wrapper

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        navn = request.form["brukernavn"]
        passord = request.form["passord"]
        db = mysql.connector.connect(database="exam")
        cur = db.cursor()
        cur.execute(
            "SELECT kundenr FROM kunde WHERE navn = %s AND passord = %s",
            (navn, passord),
        )
        rad = cur.fetchone()
        if rad:
            session["user_id"] = rad[0]
            return f"Logget inn som {navn}"
        return "Feil passord", 401
    return "<form>...login-skjema...</form>"

@app.route("/dashboard")
@login_required
def dashboard():
    return f"Velkommen, kunde {session['user_id']}"

client = app.test_client()
print("1. Uten login:", client.get("/dashboard").status_code)
print("2. Login med feil passord:", client.post("/login", data={"brukernavn":"Ola Nordmann","passord":"feil"}).status_code)
print("3. Login med riktig:", client.post("/login", data={"brukernavn":"Ola Nordmann","passord":"hash_av_hemmelig"}).data.decode())
print("4. Etter login:", client.get("/dashboard").data.decode())
`,
    hints: [
      "Status 1 skal være 302 (redirect), 2 skal være 401",
      "Step 4 fungerer fordi test_client beholder session-cookien fra step 3",
      "ADVARSEL: passordene i seed-data er KLARTEKST, og SELECT-en sammenligner direkte i SQL. Det er et anti-pattern. Se py-pwd-1 / py-pwd-2 / py-pwd-3 for hvordan dette skal gjøres riktig (werkzeug.security + check_password_hash).",
    ],
  },

  // ============ PASSORD-SIKKERHET ============
  // Fjerner et aktivt anti-pattern fra pensum: tidligere oppgaver lagrer
  // passord i klartekst i kunde-tabellen ('hash_av_hemmelig' er bare en
  // streng som ser ut som en hash, ikke en ekte hash). Disse tre øvelsene
  // viser problemet, fixen, og en sikker login-flyt.
  {
    id: "py-pwd-1-plaintext-problem",
    topic: "Passord-sikkerhet",
    title: "Hvorfor klartekst-passord er katastrofe",
    description:
      "Se på hva som faktisk ligger i kunde-tabellen fra seed-dataen. Hvis databasen lekker (SQL injection, glemt backup, intern tilgang), er ALLE passordene umiddelbart eksponert. Her dumper vi passordene fra en angripers perspektiv.",
    setup: DB_SETUP,
    starter: `import mysql.connector

db = mysql.connector.connect(database="exam")
cur = db.cursor()

cur.execute("SELECT kundenr, navn, passord FROM kunde")
print("PASSORD-DUMP fra kunde-tabellen:")
print()
for kundenr, navn, passord in cur.fetchall():
    print(f"  kundenr={kundenr:>2}  navn={navn!r:20}  passord={passord!r}")

print()
print("=" * 60)
print("Problemet:")
print("  - ALLE passord er lest av oss på et øyeblikk.")
print("  - Brukere bruker ofte samme passord på Gmail, banken, jobb.")
print("    → ett DB-tap = kompromittering av flere systemer.")
print("  - Selv DU som utvikler skal ikke kunne se passordene til brukerne.")
print()
print("Løsningen:")
print("  - Lagre BARE en kryptografisk hash av passordet.")
print("  - Hashen er enveis — ingen kan regne tilbake til passordet.")
print("  - Ved login: hash det innsendte passordet og sammenlign hashes.")
print()
print("Se neste oppgave (py-pwd-2) for hvordan i praksis.")
`,
    hints: [
      "kunde-tabellen brukes av flere oppgaver. Vi rør den ikke her — neste oppgave bygger en NY tabell med riktig hash.",
      "I produksjon: du skal heller ikke kunne SELECT passord_hash FROM ... uten god grunn. Logg slike spørringer.",
      "Tips: Even med en hash er korte/svake passord sårbare for ordbok-angrep. Salt + slow hash (bcrypt/argon2/scrypt) gjør det dyrt for angriperen.",
    ],
  },
  {
    id: "py-pwd-2-werkzeug-hash",
    topic: "Passord-sikkerhet",
    title: "werkzeug.security: generate_password_hash + check_password_hash",
    description:
      "Werkzeug (følger automatisk med Flask) har innebygd støtte for trygg hashing. Lær: hashen ser annerledes ut hver gang (tilfeldig salt), og check_password_hash er den ENESTE riktige måten å sammenligne på — aldri ==.",
    requires: ["werkzeug"],
    starter: `from werkzeug.security import generate_password_hash, check_password_hash

passord = "supersecret"

# Generer hash:
hash1 = generate_password_hash(passord)
print("Hash 1:", hash1)

# Generer ÉN GANG TIL — samme passord, ny hash:
hash2 = generate_password_hash(passord)
print("Hash 2:", hash2)
print()
print("Like?", hash1 == hash2)
print("→ NEI! Salt er tilfeldig — to kjøringer av samme passord gir to hashes.")
print("→ Dette stopper rainbow-table-angrep: en pre-beregnet tabell av hashes")
print("  hjelper ikke når salt er ukjent for hver bruker.")
print()

# Verifisering — Werkzeug pakker algoritme + iterasjoner + salt + digest
# i ÉN streng. check_password_hash henter ut salt og kjører riktig algoritme:
print("Riktig passord:    ", check_password_hash(hash1, "supersecret"))
print("Feil passord:      ", check_password_hash(hash1, "feil"))
print("Riktig mot hash2:  ", check_password_hash(hash2, "supersecret"))
print()

# Format-inspeksjon:
algoritme, _, _ = hash1.split("$", 2)
print(f"Algoritme:         {algoritme}")
print(f"Total lengde:      {len(hash1)} tegn")
print()
print("Hashen inneholder alt nødvendig for verifisering, men er praktisk")
print("umulig å reverse uten å gjette passordet.")
`,
    hints: [
      "ALDRI sammenlign passord med ==. check_password_hash bruker constant-time-sammenligning som hindrer timing-attacks.",
      "Werkzeug velger en god default-algoritme (scrypt eller pbkdf2). Du kan overstyre med method='argon2' hvis du har installert pakka.",
      "Verdien av 'slow hashing': hver gjetning fra en angriper koster CPU-tid. En rask hash som SHA256 ville la angriperen prøve milliarder per sekund.",
      "Werkzeug følger med Flask som transitive avhengighet — du har den allerede i Flask-prosjekter.",
    ],
  },
  {
    id: "py-pwd-3-secure-login",
    topic: "Passord-sikkerhet",
    title: "Sikker login-flyt: hash ved registrering, sjekk ved login",
    description:
      "Bygg en bruker-tabell der passord_hash er reell hash, og en /login-route som bruker check_password_hash. Sammenlign med py-flask-login (som bruker klartekst og direkte SQL-sammenligning) — det er DENNE versjonen som hører hjemme i produksjon.",
    requires: ["flask"],
    starter: `from flask import Flask, request
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector

# 1) Bygg en NY bruker-tabell — uavhengig av kunde-tabellen fra DB_SETUP.
#    Dette simulerer en registrerings-flyt der hashen genereres når brukeren
#    velger passord (her: ved oppstart for enkelhets skyld).
db = mysql.connector.connect(database="auth_demo")
cur = db.cursor()
cur.execute("DROP TABLE IF EXISTS bruker")
cur.execute("""
CREATE TABLE bruker (
    id INTEGER PRIMARY KEY,
    brukernavn TEXT NOT NULL UNIQUE,
    passord_hash TEXT NOT NULL
)
""")
cur.executemany(
    "INSERT INTO bruker (id, brukernavn, passord_hash) VALUES (%s, %s, %s)",
    [
        (1, "ola",  generate_password_hash("supersecret")),
        (2, "kari", generate_password_hash("passord1234")),
    ],
)
db.commit()

app = Flask(__name__)

@app.route("/login", methods=["POST"])
def login():
    navn    = request.form.get("brukernavn", "")
    passord = request.form.get("passord", "")

    db = mysql.connector.connect(database="auth_demo")
    cur = db.cursor()
    # Slå opp bruker UTEN passord-test i SQL — sammenligner hash i Python:
    cur.execute("SELECT id, passord_hash FROM bruker WHERE brukernavn = %s", (navn,))
    rad = cur.fetchone()

    # Konstant respons-tekst — ikke avslør om brukernavnet finnes
    # (forsvar mot username-enumeration):
    feilmelding = ("Feil brukernavn eller passord", 401)

    if rad is None:
        return feilmelding
    user_id, lagret_hash = rad
    if not check_password_hash(lagret_hash, passord):
        return feilmelding

    return f"Innlogget som id={user_id}", 200

client = app.test_client()
print("Riktig passord:    ", client.post("/login", data={"brukernavn": "ola",  "passord": "supersecret"}).status_code)
print("Feil passord:      ", client.post("/login", data={"brukernavn": "ola",  "passord": "feil"}).status_code)
print("Ukjent bruker:     ", client.post("/login", data={"brukernavn": "tull", "passord": "noe"}).status_code)
print("Riktig kari:       ", client.post("/login", data={"brukernavn": "kari", "passord": "passord1234"}).status_code)
`,
    hints: [
      "Sammenlign med py-flask-login: der står 'WHERE navn=%s AND passord=%s' direkte i SQL, og passordene er klartekst. Begge feil rettes her.",
      "Identisk feilmelding for 'ukjent bruker' og 'feil passord' — angripere skal ikke kunne enumerate eksisterende brukernavn ved å se på status/respons.",
      "I en ekte registrerings-route: navn = request.form['brukernavn']; hash = generate_password_hash(request.form['passord']); INSERT INTO bruker ...",
      "Sammen med Flask-Login: erstatt `return f\"Innlogget...\"` med login_user(bruker) (se py-ext-flask-login).",
    ],
    docs: [
      {
        title: "functools.wraps og decorators",
        url: "https://docs.python.org/3/library/functools.html#functools.wraps",
        note: "@wraps(view) bevarer funksjonsnavn og docstring når en decorator wrapper en annen funksjon.",
      },
      {
        title: "redirect() og url_for()",
        url: "https://flask.palletsprojects.com/en/stable/quickstart/#redirects-and-errors",
        note: "redirect() sender 302 til en annen sti. url_for('endpoint_name') beregner sti basert på funksjonsnavn — aldri hardkod URLer.",
        snippet: `if "user_id" not in session:
    return redirect(url_for("login"))`,
      },
      {
        title: "Hash passord — werkzeug.security",
        url: "https://werkzeug.palletsprojects.com/en/stable/utils/#werkzeug.security.generate_password_hash",
        note: "I produksjon: lagre `generate_password_hash(passord)`. Sjekk login med `check_password_hash(stored, input)`. ALDRI lagre klartekst-passord.",
      },
    ],
  },

  // ============ CSRF ============
  {
    id: "py-flask-csrf",
    topic: "CSRF",
    title: "CSRF-token — godta bare requester med riktig token",
    description:
      "Implementer manuell CSRF-beskyttelse med session-token. POST uten token avvises, POST med token aksepteres.",
    requires: ["flask"],
    starter: `from flask import Flask, session, request
import secrets

app = Flask(__name__)
app.config["SECRET_KEY"] = "test"

def get_csrf_token():
    if "csrf" not in session:
        session["csrf"] = secrets.token_hex(16)
    return session["csrf"]

@app.route("/skjema")
def skjema():
    token = get_csrf_token()
    return f'<form method="POST" action="/lagre"><input type="hidden" name="csrf" value="{token}">...</form>'

@app.route("/lagre", methods=["POST"])
def lagre():
    submitted = request.form.get("csrf", "")
    expected = session.get("csrf", "")
    if not expected or submitted != expected:
        return "CSRF-feil — avvist", 403
    return "Lagret", 200

client = app.test_client()
# 1. Hent skjema → cookien får csrf-token
html = client.get("/skjema").data.decode()
print("1. Skjema lastet, CSRF-token sendt med")

# 2. POST uten token:
print("2. Uten token:", client.post("/lagre", data={"navn": "Ola"}).status_code)

# 3. POST med riktig token (parser ut fra HTML):
import re
token = re.search(r'value="([a-f0-9]+)"', html).group(1)
print("3. Med token:", client.post("/lagre", data={"navn": "Ola", "csrf": token}).status_code)

# 4. POST med feil token:
print("4. Feil token:", client.post("/lagre", data={"navn": "Ola", "csrf": "fake"}).status_code)
`,
    hints: [
      "Forventet: 2 → 403, 3 → 200, 4 → 403",
      "I ekte kode bruker man Flask-WTF som genererer + verifiserer token automatisk",
    ],
    docs: [
      {
        title: "OWASP — Cross-Site Request Forgery (CSRF)",
        url: "https://owasp.org/www-community/attacks/csrf",
        note: "Angriperens nettside får brukerens nettleser til å sende en POST mot ditt domene. Token-mønsteret er forsvaret.",
      },
      {
        title: "secrets.token_hex",
        url: "https://docs.python.org/3/library/secrets.html#secrets.token_hex",
        note: "Kryptografisk trygg tilfeldig hex-streng. Bruk denne, ikke random.choice().",
        snippet: `import secrets
token = secrets.token_hex(16)`,
      },
      {
        title: "Flask-WTF (anbefalt i ekte prosjekter)",
        url: "https://flask-wtf.readthedocs.io/en/stable/csrf.html",
        note: "Genererer + verifiserer CSRF-tokens automatisk via en utvidelse — slipper å skrive `secrets`-koden selv.",
      },
    ],
  },

  // ============ TOKEN-AUTH (API) ============
  {
    id: "py-flask-token-api",
    topic: "API & tokens",
    title: "Beskytt API med Bearer-token",
    description:
      "Lag en API-route som krever Authorization-header med riktig token — ellers 401.",
    requires: ["flask"],
    setup: DB_SETUP,
    starter: `from flask import Flask, request, jsonify
import mysql.connector

app = Flask(__name__)
API_TOKEN = "hemmelig-token-123"

def auth_ok():
    header = request.headers.get("Authorization", "")
    return header == f"Bearer {API_TOKEN}"

@app.route("/api/kunder")
def api_kunder():
    if not auth_ok():
        return jsonify({"feil": "Ikke autorisert"}), 401
    db = mysql.connector.connect(database="exam")
    cur = db.cursor()
    cur.execute("SELECT kundenr, navn FROM kunde")
    return jsonify([{"kundenr": k, "navn": n} for k, n in cur.fetchall()])

client = app.test_client()
# 1. Uten token:
r = client.get("/api/kunder")
print("1.", r.status_code, r.get_json())

# 2. Med feil token:
r = client.get("/api/kunder", headers={"Authorization": "Bearer feil"})
print("2.", r.status_code, r.get_json())

# 3. Med riktig token:
r = client.get("/api/kunder", headers={"Authorization": "Bearer hemmelig-token-123"})
print("3.", r.status_code, r.get_json())
`,
    hints: [
      "Forventet: 1 og 2 → 401, 3 → 200 + liste med kunder",
      "I produksjon: bruk JWT eller OAuth, ikke en hardkodet token",
    ],
    docs: [
      {
        title: "Bearer Authentication (RFC 6750)",
        url: "https://datatracker.ietf.org/doc/html/rfc6750",
        note: "Standardiseringen: `Authorization: Bearer <token>` på hver request.",
        snippet: `headers={"Authorization": f"Bearer {API_TOKEN}"}`,
      },
      {
        title: "request.headers.get",
        url: "https://flask.palletsprojects.com/en/stable/api/#flask.Request.headers",
        note: "Les HTTP-headere fra request. Returnerer tom streng (default) hvis ikke satt.",
      },
      {
        title: "PyJWT — for ekte JWT-tokens",
        url: "https://pyjwt.readthedocs.io/en/stable/",
        note: "Når hardkodet token ikke holder lenger: signerte JWT med utløpstid og brukerinfo.",
      },
    ],
  },

  // ============ HTTP / API verbs ============
  {
    id: "py-flask-rest",
    topic: "REST / API",
    title: "REST-endepunkt: GET, POST, DELETE for kunder",
    description:
      "Lag tre routes som dekker hovedoperasjonene mot kunde-tabellen. Test alle tre.",
    requires: ["flask"],
    setup: DB_SETUP,
    starter: `from flask import Flask, request, jsonify, abort
import mysql.connector

app = Flask(__name__)

def db():
    return mysql.connector.connect(database="exam")

@app.route("/kunder", methods=["GET"])
def liste():
    cur = db().cursor()
    cur.execute("SELECT kundenr, navn FROM kunde")
    return jsonify([{"kundenr": k, "navn": n} for k, n in cur.fetchall()])

@app.route("/kunder", methods=["POST"])
def opprett():
    data = request.get_json()
    d = db()
    cur = d.cursor()
    cur.execute(
        "INSERT INTO kunde (kundenr, navn) VALUES (%s, %s)",
        (data["kundenr"], data["navn"]),
    )
    d.commit()
    return jsonify({"opprettet": data["kundenr"]}), 201

@app.route("/kunder/<int:kundenr>", methods=["DELETE"])
def slett(kundenr):
    d = db()
    cur = d.cursor()
    cur.execute("DELETE FROM kunde WHERE kundenr = %s", (kundenr,))
    if cur.rowcount == 0:
        abort(404)
    d.commit()
    return "", 204

client = app.test_client()
print("Før:", client.get("/kunder").get_json())
print("POST:", client.post("/kunder", json={"kundenr": 99, "navn": "Ny Kunde"}).status_code)
print("Etter POST:", client.get("/kunder").get_json())
print("DELETE 99:", client.delete("/kunder/99").status_code)
print("DELETE 999:", client.delete("/kunder/999").status_code)
`,
    hints: [
      "201 Created etter POST, 204 No Content etter DELETE, 404 hvis ressursen ikke finnes",
      "request.get_json() leser JSON-bodyen",
    ],
    docs: [
      {
        title: "REST resource conventions",
        url: "https://restfulapi.net/resource-naming/",
        note: "Substantiv i flertall (`/kunder`), HTTP-verb sier hva som skal skje. ID-en i path: `/kunder/<id>`.",
      },
      {
        title: "request.get_json()",
        url: "https://flask.palletsprojects.com/en/stable/api/#flask.Request.get_json",
        note: "Parser request-body som JSON. Returnerer dict/list. Bruk silent=True for å unngå exception ved ugyldig JSON.",
      },
      {
        title: "cursor.rowcount",
        url: "https://dev.mysql.com/doc/connector-python/en/connector-python-api-mysqlcursor-rowcount.html",
        note: "Antall rader påvirket av siste statement. 0 etter DELETE = ressursen fantes ikke → 404.",
      },
    ],
  },

  // ============ PYTHON DATA-PROSESSERING ============
  {
    id: "py-prosess-sum",
    topic: "Python data-prosessering",
    title: "Summer en kolonne i Python (uten SUM)",
    description:
      "Hent alle ordrelinjer med en enkel SELECT, og regn ut totalsummen i Python ved å iterere over radene. Samme oppgave som SUM(antall*pris) i SQL — men her gjør vi jobben i Python.",
    setup: DB_SETUP_PROSESS,
    starter: `import mysql.connector

db = mysql.connector.connect(database="prosess")
cursor = db.cursor()

cursor.execute("SELECT antall, pris FROM ordrelinje")
ordrelinjer = cursor.fetchall()

total = 0
for antall, pris in ordrelinjer:
    total += antall * pris

print(f"Antall ordrelinjer: {len(ordrelinjer)}")
print(f"Total omsetning: {total} kr")
`,
    hints: [
      "fetchall() gir liste av tupler — pakk ut med (antall, pris)",
      "Du kunne også brukt sum(antall*pris for antall, pris in ordrelinjer)",
      "Sjekk at totalen blir 38900 — samme som SUM(antall*pris) ville gitt",
    ],
    docs: [
      {
        title: "sum() med generator-uttrykk",
        url: "https://docs.python.org/3/library/functions.html#sum",
        note: "Slipper for-løkken for noe så enkelt som å summere.",
        snippet: `total = sum(antall * pris for antall, pris in ordrelinjer)`,
      },
      {
        title: "for-løkke + tuple-unpacking",
        url: "https://docs.python.org/3/tutorial/controlflow.html#for-statements",
        note: "for-syntaks kan pakke ut hver tuple direkte i navngitte variabler.",
      },
    ],
  },
  {
    id: "py-prosess-group",
    topic: "Python data-prosessering",
    title: "Grupper rader etter kategori i Python (uten GROUP BY)",
    description:
      "Hent alle produkter, og bygg en dict {kategori: [navn, ...]} i Python. Bruk dict.setdefault eller en if-sjekk for å lage tomme lister automatisk.",
    setup: DB_SETUP_PROSESS,
    starter: `import mysql.connector

db = mysql.connector.connect(database="prosess")
cursor = db.cursor()

cursor.execute("SELECT navn, kategori FROM produkt")
produkter = cursor.fetchall()

per_kategori = {}
for navn, kategori in produkter:
    if kategori not in per_kategori:
        per_kategori[kategori] = []
    per_kategori[kategori].append(navn)

for kategori, navnliste in per_kategori.items():
    print(f"{kategori}: {navnliste}")
`,
    hints: [
      "per_kategori.setdefault(kategori, []).append(navn) gjør samme i én linje",
      "from collections import defaultdict gir en enda renere variant",
      "I SQL ville dette vært GROUP_CONCAT(navn) GROUP BY kategori",
    ],
    docs: [
      {
        title: "dict.setdefault",
        url: "https://docs.python.org/3/library/stdtypes.html#dict.setdefault",
        note: "Returnerer eksisterende verdi eller setter default. Idiomatic for group-by:",
        snippet: `per_kategori.setdefault(kategori, []).append(navn)`,
      },
      {
        title: "collections.defaultdict",
        url: "https://docs.python.org/3/library/collections.html#collections.defaultdict",
        note: "Renere alternativ — autoinitialiserer manglende nøkler med en default factory.",
        snippet: `from collections import defaultdict
per_kategori = defaultdict(list)
for navn, kategori in produkter:
    per_kategori[kategori].append(navn)`,
      },
    ],
  },
  {
    id: "py-prosess-sort",
    topic: "Python data-prosessering",
    title: "Sorter etter beregnet felt i Python (uten ORDER BY)",
    description:
      "Hent alle ordrelinjer, og sorter dem i Python etter linjebeløp (antall * pris) i synkende rekkefølge. Skriv ut de tre største linjene.",
    setup: DB_SETUP_PROSESS,
    starter: `import mysql.connector

db = mysql.connector.connect(database="prosess")
cursor = db.cursor()

cursor.execute("SELECT id, prodnr, antall, pris FROM ordrelinje")
ordrelinjer = cursor.fetchall()

# Sorter på beregnet kolonne — nøkkelen er en lambda
sortert = sorted(
    ordrelinjer,
    key=lambda rad: rad[2] * rad[3],  # antall * pris
    reverse=True,
)

print("Topp 3 ordrelinjer etter beløp:")
for linje_id, prodnr, antall, pris in sortert[:3]:
    print(f"  Linje {linje_id}: prod {prodnr} — {antall} stk x {pris} = {antall * pris} kr")
`,
    hints: [
      "lambda rad: rad[2] * rad[3] — indeksene matcher SELECT-rekkefølgen",
      "reverse=True for synkende; reverse=False (default) for stigende",
      "sortert[:3] er Python slicing — første 3 elementer",
    ],
    docs: [
      {
        title: "sorted() med key=",
        url: "https://docs.python.org/3/library/functions.html#sorted",
        note: "Returnerer en NY sortert liste. .sort() sorterer in-place. key=lambda lar deg sortere på beregnet verdi.",
        snippet: `sortert = sorted(rader, key=lambda r: r[2] * r[3], reverse=True)`,
      },
      {
        title: "Slicing — liste[start:stopp:steg]",
        url: "https://docs.python.org/3/tutorial/introduction.html#lists",
        note: "[:3] første tre, [-3:] siste tre, [::2] annenhver.",
      },
    ],
  },
  {
    id: "py-prosess-format",
    topic: "Python data-prosessering",
    title: "Formatér rader som lesbar tekst",
    description:
      "Hent alle kunder fra kunde_p og bygg en formatert tekstlinje per kunde. Håndter NULL-epost pent med 'or'-uttrykk: f\"{epost or '(ingen)'}\".",
    setup: DB_SETUP_PROSESS,
    starter: `import mysql.connector

db = mysql.connector.connect(database="prosess")
cursor = db.cursor()

cursor.execute("SELECT navn, epost, registrert FROM kunde_p")
kunder = cursor.fetchall()

for navn, epost, registrert in kunder:
    linje = f"{navn} ({epost or '(ingen e-post)'}) — registrert {registrert}"
    print(linje)
`,
    hints: [
      "epost or '(ingen e-post)' bruker at None er falsy → fallback-strengen brukes",
      "f-strings ({...}) er mye lettere enn '+' for å bygge strenger",
      "I SQL ville du brukt COALESCE(epost, '(ingen e-post)')",
    ],
    docs: [
      {
        title: "f-strings (PEP 498)",
        url: "https://docs.python.org/3/reference/lexical_analysis.html#f-strings",
        note: "f\"{uttrykk:format}\" — innebygd interpolation. Mye lettere enn .format() eller %-syntaks.",
        snippet: `f"{navn:<20} | {pris:>8.2f} kr"  # venstrejustert navn, høyrejustert pris`,
      },
      {
        title: "Truthiness — None, '', 0, [] er alle falsy",
        url: "https://docs.python.org/3/library/stdtypes.html#truth-value-testing",
        note: "`epost or '(ingen)'` returnerer fallback-en hvis epost er None/''/0.",
      },
    ],
  },
  {
    id: "py-prosess-merge",
    topic: "Python data-prosessering",
    title: "Slå sammen to spørringer i Python (alternativ til JOIN)",
    description:
      "Kjør én SELECT mot ordrelinje og én mot betaling. Bygg så en dict {ordrenr: belop} og merge i Python — viser hvordan JOIN-logikk kan gjøres med dict-lookup.",
    setup: DB_SETUP_PROSESS,
    starter: `import mysql.connector

db = mysql.connector.connect(database="prosess")
cursor = db.cursor()

# Spørring 1: ordrelinjer
cursor.execute("SELECT id, prodnr, antall, pris FROM ordrelinje")
ordrelinjer = cursor.fetchall()

# Spørring 2: betalinger — bygg dict for raskt oppslag
cursor.execute("SELECT ordrenr, belop FROM betaling")
betaling_per_ordre = {ordrenr: belop for ordrenr, belop in cursor.fetchall()}

# Merge i Python — bruk .get for å håndtere ordrer uten betaling
print("Ordrelinje | beregnet | betalt")
for linje_id, prodnr, antall, pris in ordrelinjer:
    beregnet = antall * pris
    betalt = betaling_per_ordre.get(linje_id, "(ingen betaling)")
    print(f"  {linje_id:>2} (prod {prodnr}) | {beregnet:>5} | {betalt}")
`,
    hints: [
      "dict-comprehension {k: v for k, v in ...} gir O(1) oppslag",
      ".get(noekkel, default) returnerer default hvis nøkkelen mangler — som LEFT JOIN",
      "I SQL: SELECT ... FROM ordrelinje LEFT JOIN betaling ON ... — men noen ganger er Python-merge enklere å lese",
    ],
    docs: [
      {
        title: "Dict comprehensions",
        url: "https://docs.python.org/3/tutorial/datastructures.html#dictionaries",
        note: "{key: value for ... in ...} — bygg en dict i én linje fra en sekvens.",
        snippet: `{ordrenr: belop for ordrenr, belop in cursor.fetchall()}`,
      },
      {
        title: "dict.get(key, default)",
        url: "https://docs.python.org/3/library/stdtypes.html#dict.get",
        note: "Returnerer verdien eller default — som LEFT JOIN i SQL: ingen match → default i stedet for KeyError.",
      },
    ],
  },
  {
    id: "py-prosess-statistikk",
    topic: "Python data-prosessering",
    title: "Statistikk per produkt i Python (mean, min, max)",
    description:
      "Hent alle ordrelinjer, grupper antall solgt per produkt, og regn ut snitt, min og maks pris per produkt. Bruk statistics-modulen for snittet.",
    setup: DB_SETUP_PROSESS,
    starter: `import mysql.connector
import statistics

db = mysql.connector.connect(database="prosess")
cursor = db.cursor()

cursor.execute("SELECT prodnr, antall, pris FROM ordrelinje")
ordrelinjer = cursor.fetchall()

# Bygg dict {prodnr: [pris1, pris2, ...]}
priser_per_produkt = {}
for prodnr, antall, pris in ordrelinjer:
    priser_per_produkt.setdefault(prodnr, []).append(pris)

print("Prodnr | antall linjer | min | maks | snitt")
for prodnr, priser in sorted(priser_per_produkt.items()):
    snitt = statistics.mean(priser)
    print(f"  {prodnr:>2}   | {len(priser):>2}            | {min(priser):>5} | {max(priser):>5} | {snitt:.1f}")
`,
    hints: [
      "statistics.mean(liste) er innebygd — slipper å dele sum/len selv",
      "min(liste) og max(liste) virker direkte på en liste tall",
      "setdefault(noekkel, []).append(...) er et vanlig group-by-mønster",
    ],
    docs: [
      {
        title: "statistics-modulen",
        url: "https://docs.python.org/3/library/statistics.html",
        note: "mean, median, stdev, mode — innebygd, ingen pip-install. For tunge analyser: pandas/numpy.",
        snippet: `import statistics
statistics.mean([1, 2, 3])      # 2
statistics.median([1, 2, 3])    # 2
statistics.stdev([1, 2, 3, 4])  # 1.29...`,
      },
      {
        title: "min() og max() — built-ins",
        url: "https://docs.python.org/3/library/functions.html#min",
        note: "Tar en sekvens eller flere argumenter. Med key= sorterer du på beregnet verdi.",
      },
    ],
  },

  // ============= API-KALL OG RESPONSE-PROSESSERING (Phase C) =============
  // Disse oppgavene bruker den samme demo-appen som /konsoll. Brukeren sender
  // requester via app.test_client() og prosesserer responsen med Python-idiomer
  // — samme kjede som /konsoll, men nå skrevet i kode i stedet for klikket.
  {
    id: "py-api-get-list",
    topic: "API-kall i Python",
    title: "GET /api/produkter — parse JSON og tell rader",
    description:
      "Send en GET-request til /api/produkter, hent JSON-bodyen, og print antall produkter samt navnet på de tre første. Du skal se hvordan response-objektet henger sammen med Python-data.",
    requires: ["flask"],
    setup: DEMO_APP_PYTHON,
    starter: `client = app.test_client()
respons = client.get("/api/produkter")

print("Status:", respons.status_code)
print("Content-Type:", respons.content_type)

# .get_json() parser JSON-bodyen til en Python-liste/dict.
produkter = respons.get_json()
print("Antall produkter:", len(produkter))

print("De tre første:")
for produkt in produkter[:3]:
    print(f"  - {produkt['navn']} ({produkt['kategori']}, {produkt['pris']} kr)")
`,
    hints: [
      "respons.status_code — heltallet, f.eks. 200",
      "respons.get_json() — gir Python-liste/dict (None hvis ikke JSON)",
      "produkter[:3] henter de tre første elementene",
    ],
    docs: [
      {
        title: "Flask Response.get_json()",
        url: "https://flask.palletsprojects.com/en/stable/api/#flask.Response.get_json",
        note: "Parser body som JSON. Returnerer None hvis Content-Type ikke er JSON.",
      },
      {
        title: "test_client — sende GET",
        url: "https://flask.palletsprojects.com/en/stable/testing/#sending-requests-with-the-test-client",
        snippet: `client = app.test_client()
resp = client.get("/api/produkter")
data = resp.get_json()  # Python-liste/dict`,
      },
    ],
  },
  {
    id: "py-api-filter-response",
    topic: "API-kall i Python",
    title: "Filtrer respons i Python — bare elektronikk under 10 000",
    description:
      "Hent alle produkter, og filtrer dem ned til kun Elektronikk-kategori med pris under 10 000 — i Python, ikke via query-param. Sorter resultatet etter pris stigende.",
    requires: ["flask"],
    setup: DEMO_APP_PYTHON,
    starter: `client = app.test_client()
produkter = client.get("/api/produkter").get_json()

# Filtrer i Python — list comprehension med flere vilkår
billig_elektronikk = [
    p for p in produkter
    if p["kategori"] == "Elektronikk" and p["pris"] < 10000
]

# Sortér på pris stigende
billig_elektronikk.sort(key=lambda p: p["pris"])

print(f"Funnet {len(billig_elektronikk)} produkter:")
for produkt in billig_elektronikk:
    print(f"  {produkt['navn']:>10} — {produkt['pris']} kr")
`,
    hints: [
      "[x for x in liste if vilkår] — list comprehension med filter",
      "liste.sort(key=lambda p: p['pris']) — sorterer in-place",
      "Bruk operatoren and for å kombinere to vilkår",
    ],
    docs: [
      {
        title: "List comprehensions",
        url: "https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions",
        note: "[uttrykk for x in iterable if vilkår] — kompakt filtrering + transformasjon i én linje.",
        snippet: `[p for p in produkter if p["kategori"] == "Elektronikk" and p["pris"] < 10000]`,
      },
      {
        title: "Boolske operatorer",
        url: "https://docs.python.org/3/library/stdtypes.html#boolean-operations-and-or-not",
        note: "and (begge må være sant), or (én må være sann), not (inverter).",
      },
    ],
  },
  {
    id: "py-api-status-check",
    topic: "API-kall i Python",
    title: "POST uten autentisering — sjekk feilmeldingen",
    description:
      "Forsøk å POSTe et nytt produkt UTEN Authorization-header. Server skal returnere 401. Skriv ut statuskoden og feil-meldingen så vi ser hva endepunktet gir tilbake.",
    requires: ["flask"],
    setup: DEMO_APP_PYTHON,
    starter: `client = app.test_client()

ny_data = {
    "id": 99,
    "navn": "Pirat-T-skjorte",
    "kategori": "Klaer",
    "pris": 199,
    "lager": 5,
}

respons = client.post("/api/produkter", json=ny_data)

print("Status:", respons.status_code)
print("Body:", respons.get_json())

if respons.status_code == 401:
    print("Forventet — endepunktet krever Authorization-header.")
elif respons.status_code == 201:
    print("Uventet suksess — burde vi ha lagt på en token?")
`,
    hints: [
      "client.post(url, json=dict) — Flask serialiserer automatisk og setter Content-Type",
      "respons.status_code er heltall — sammenlign med == 401",
      "Server returnerer feilkroppen som JSON, så .get_json() virker",
    ],
    docs: [
      {
        title: "401 Unauthorized vs 403 Forbidden (MDN)",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401",
        note: "401 = vi vet ikke hvem du er (mangler/ugyldig auth). 403 = vi vet hvem du er, men du har ikke lov.",
      },
      {
        title: "test_client.post(json=...)",
        url: "https://flask.palletsprojects.com/en/stable/testing/#sending-requests-with-the-test-client",
        note: "json= setter Content-Type: application/json automatisk og serialiserer dict-en.",
      },
    ],
  },
  {
    id: "py-api-bearer-token",
    topic: "API-kall i Python",
    title: "POST med Bearer-token — opprett produkt riktig",
    description:
      "Send samme POST som i forrige oppgave, men nå med korrekt Authorization: Bearer-header. Verifiser at status blir 201, og hent deretter listen for å bekrefte at produktet faktisk ble lagret.",
    requires: ["flask"],
    setup: DEMO_APP_PYTHON,
    starter: `client = app.test_client()

ny_data = {
    "id": 100,
    "navn": "Lykt",
    "kategori": "Elektronikk",
    "pris": 450,
    "lager": 20,
}

# Authorization-header sendes via headers-dict
opprett = client.post(
    "/api/produkter",
    json=ny_data,
    headers={"Authorization": "Bearer demo-token-abc123"},
)
print("Opprettet:", opprett.status_code, opprett.get_json())

# Sjekk at produktet finnes nå
nytt_produkt = client.get("/api/produkter/100").get_json()
print("Hentet etter opprettelse:", nytt_produkt)
`,
    hints: [
      "headers={...} — dict med header-navn som nøkler",
      "Bearer demo-token-abc123 er det demo-appen forventer (se /api-konsoll)",
      "Etter opprettelse: GET /api/produkter/100 skal nå returnere 200, ikke 404",
    ],
    docs: [
      {
        title: "Authorization-header (RFC 6750 Bearer)",
        url: "https://datatracker.ietf.org/doc/html/rfc6750#section-2.1",
        snippet: `headers={"Authorization": "Bearer demo-token-abc123"}`,
      },
      {
        title: "201 Created — riktig statuskode etter POST som lager noe",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201",
        note: "Ikke 200 — 201 signaliserer at noe nytt ble lagret.",
      },
    ],
  },
  {
    id: "py-api-login-flow",
    topic: "API-kall i Python",
    title: "Login-flyt — cookie deles automatisk",
    description:
      "Logg inn med POST /api/login og kall deretter GET /api/min-side. test_client beholder session-cookien automatisk mellom requestene — som en ekte browser ville gjort.",
    requires: ["flask"],
    setup: DEMO_APP_PYTHON,
    starter: `client = app.test_client()

# 1) Først UTEN login — skal gi 401
foer_login = client.get("/api/min-side")
print("Uten login:", foer_login.status_code, foer_login.get_json())

# 2) Logg inn — server setter Set-Cookie i responsen, klienten husker den
login = client.post(
    "/api/login",
    json={"brukernavn": "ola", "passord": "hemmelig"},
)
print("Login:", login.status_code, login.get_json())

# 3) Nytt kall til /api/min-side — cookien er med, så server kjenner oss
etter_login = client.get("/api/min-side")
print("Etter login:", etter_login.status_code, etter_login.get_json())
`,
    hints: [
      "Samme test_client-instans = samme cookie-jar — som én browser-tab",
      "Set-Cookie i responsen håndteres automatisk; ingen manuell parsing",
      "Lager du en NY test_client() etter login, mister du cookien",
    ],
    docs: [
      {
        title: "Cookies og Set-Cookie (MDN)",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies",
        note: "Server setter Set-Cookie i respons. Klient sender Cookie tilbake på neste request — sånn opprettholdes session.",
      },
      {
        title: "test_client og cookie-persistens",
        url: "https://flask.palletsprojects.com/en/stable/testing/#sending-requests-with-the-test-client",
        note: "Samme test_client-instans deler cookies på tvers av kall — som én og samme nettleser-fane.",
      },
    ],
  },
  {
    id: "py-api-csrf-flow",
    topic: "API-kall i Python",
    title: "CSRF-flyt — hent token og send det med",
    description:
      "Endepunktet /api/notat krever et CSRF-token i header. Først hent tokenet via GET /api/csrf, deretter POST notat-en med X-CSRF-Token-headeren satt. Vis hva som skjer når tokenet mangler.",
    requires: ["flask"],
    setup: DEMO_APP_PYTHON,
    starter: `client = app.test_client()

# 1) Forsøk POST UTEN token — skal gi 403
uten_token = client.post(
    "/api/notat",
    json={"notat": "Husk å handle"},
)
print("Uten token:", uten_token.status_code, uten_token.get_json())

# 2) Hent token (server lagrer det også i session — koblingen skjer via cookie)
csrf_respons = client.get("/api/csrf").get_json()
token = csrf_respons["token"]
print("Token mottatt:", token)

# 3) POST med token i header — skal gi 200
med_token = client.post(
    "/api/notat",
    json={"notat": "Husk å handle"},
    headers={"X-CSRF-Token": token},
)
print("Med token:", med_token.status_code, med_token.get_json())
`,
    hints: [
      "Server-token lagres i session (cookie) — klient-token må komme i headeren",
      "X-CSRF-Token er konvensjonen — andre rammeverk bruker X-XSRF-Token",
      "Forskjellen mellom Authorization og X-CSRF-Token: auth = hvem du ER, csrf = at requesten faktisk kom fra ditt skjema",
    ],
    docs: [
      {
        title: "OWASP — CSRF Prevention Cheat Sheet",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html",
        note: "Synchronizer Token-mønsteret: server gir tokenet, klient ekkoer det tilbake i header eller skjult skjemafelt.",
      },
      {
        title: "X-CSRF-Token vs Authorization",
        url: "https://owasp.org/www-community/attacks/csrf",
        note: "Authorization svarer på 'hvem er du?'. X-CSRF-Token svarer på 'kom requesten fra ditt eget skjema?'. To forskjellige forsvar — bruk begge.",
      },
    ],
  },
  {
    id: "py-api-aggregate-response",
    topic: "API-kall i Python",
    title: "Aggregér responsen — totalverdi av lager",
    description:
      "Hent alle produkter og regn ut total lagerverdi (pris × lager) per kategori i Python. Kombinerer API-kall med data-prosesserings-mønsteret fra forrige arc.",
    requires: ["flask"],
    setup: DEMO_APP_PYTHON,
    starter: `client = app.test_client()
produkter = client.get("/api/produkter").get_json()

# Bygg {kategori: total_verdi}
verdi_per_kategori = {}
for produkt in produkter:
    kategori = produkt["kategori"]
    delsum = produkt["pris"] * produkt["lager"]
    verdi_per_kategori[kategori] = verdi_per_kategori.get(kategori, 0) + delsum

# Sortér kategorier på total verdi synkende
sortert = sorted(verdi_per_kategori.items(), key=lambda p: -p[1])

print("Total lagerverdi per kategori:")
for kategori, verdi in sortert:
    print(f"  {kategori:>12}: {verdi:>8} kr")

print(f"\\nTotalt på lager: {sum(verdi_per_kategori.values())} kr")
`,
    hints: [
      "dict.get(noekkel, 0) gir 0 som default når kategorien ikke er sett før",
      "sorted(items, key=lambda p: -p[1]) — minus foran for synkende",
      "sum(dict.values()) summerer alle verdiene i dict-en",
    ],
    docs: [
      {
        title: "dict.items() / dict.values()",
        url: "https://docs.python.org/3/library/stdtypes.html#dict.items",
        note: ".items() gir (key, value)-par, .values() bare verdiene. Kombiner med sum/sorted/comprehensions.",
      },
      {
        title: "Pandas — når datasettet vokser",
        url: "https://pandas.pydata.org/docs/user_guide/groupby.html",
        note: "For større aggregeringer: pandas DataFrame.groupby('kategori').sum() er ofte raskere og lettere å lese.",
      },
    ],
  },

  // ============ FLASK-SQLALCHEMY (ORM) ============
  // Bygget rundt Miguel Grinberg sin Flask Mega-Tutorial Part IV (Database).
  // Vi bruker SQLAlchemy 2.x direkte (samme Mapped/mapped_column/session-API som
  // Flask-SQLAlchemy bruker under panseret), mot in-memory SQLite. Migrasjoner
  // (flask db init/migrate/upgrade) kan ikke kjøres i nettleser — vi bruker
  // Base.metadata.create_all() istedenfor og forklarer migrasjons-workflowen
  // som tekst. Ellers er API-et identisk med det som står i artikkelen.
  {
    id: "py-sqla-1-model",
    topic: "Flask-SQLAlchemy (ORM)",
    title: "Definér første ORM-modell og lag tabellen",
    description:
      "I Mega-Tutorial Part IV defineres User-modellen med Mapped-typehints (SQLAlchemy 2.x). Skriv en User-modell, lag tabellen med Base.metadata.create_all(), og verifisér schemaet med sa.inspect(engine). I en ekte Flask-app ville du kjørt `flask db init` + `flask db migrate -m \"users table\"` + `flask db upgrade` — her i nettleseren bruker vi create_all() siden CLI-en ikke er tilgjengelig.",
    requires: ["sqlalchemy"],
    starter: `import sqlalchemy as sa
import sqlalchemy.orm as so
from typing import Optional

# Base-klassen alle modeller arver fra. I Flask-SQLAlchemy brukes db.Model;
# her bruker vi DeclarativeBase direkte — samme greie under panseret.
class Base(so.DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "user"
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    username: so.Mapped[str] = so.mapped_column(sa.String(64), index=True, unique=True)
    email: so.Mapped[str] = so.mapped_column(sa.String(120), index=True, unique=True)
    # Optional[...] = nullable kolonne
    password_hash: so.Mapped[Optional[str]] = so.mapped_column(sa.String(256))

    def __repr__(self):
        return f"<User {self.username}>"

# In-memory SQLite — Mega-Tutorial bruker fil (sqlite:///app.db),
# vi holder alt i RAM så hver kjøring starter blank.
engine = sa.create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

# Verifisér schemaet:
inspector = sa.inspect(engine)
print("Tabeller:", inspector.get_table_names())
print("user-kolonner:", [c["name"] for c in inspector.get_columns("user")])
print("Indekser på user:", [ix["column_names"] for ix in inspector.get_indexes("user")])
`,
    hints: [
      "primary_key=True gjør id auto-increment i SQLite",
      "unique=True + index=True er to forskjellige ting — unique er en constraint, index gjør oppslag raskere",
      "Optional[str] = kolonnen kan være NULL; uten Optional krever SQLAlchemy en verdi",
      "sa.inspect() er nyttig for å se hva CREATE TABLE faktisk genererte",
    ],
    docs: [
      {
        title: "SQLAlchemy 2.x — Declarative Mapping (Mapped/mapped_column)",
        url: "https://docs.sqlalchemy.org/en/20/orm/quickstart.html#declare-models",
        note: "Den nye type-hint-baserte måten å definere modeller. Mapped[int] erstatter Column(Integer).",
      },
      {
        title: "Flask Mega-Tutorial — Database",
        url: "https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-iv-database",
        note: "Boken denne arc-en bygger på. Forklarer User-modellen + migrasjons-workflowen i kontekst.",
      },
      {
        title: "create_engine + Base.metadata.create_all",
        url: "https://docs.sqlalchemy.org/en/20/tutorial/metadata.html#emitting-ddl-to-the-database",
        snippet: `engine = sa.create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)`,
      },
    ],
  },
  {
    id: "py-sqla-2-add-query",
    topic: "Flask-SQLAlchemy (ORM)",
    title: "Sett inn rader med session.add() og hent dem ut igjen",
    description:
      "Mønsteret fra Mega-Tutorial: instansiér modellen, kall session.add(), så session.commit(). For å hente data brukes sa.select(...) + session.scalars(...).all() — den nye SQLAlchemy 2.x-API-en (eldre kode bruker Model.query.all(), som fortsatt funker men er på vei ut).",
    requires: ["sqlalchemy"],
    starter: `import sqlalchemy as sa
import sqlalchemy.orm as so

class Base(so.DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "user"
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    username: so.Mapped[str] = so.mapped_column(sa.String(64), unique=True)
    email: so.Mapped[str] = so.mapped_column(sa.String(120), unique=True)

    def __repr__(self):
        return f"<User {self.username}>"

engine = sa.create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

with so.Session(engine) as session:
    # 1) Lag instanser i Python (ingen INSERT enda):
    u1 = User(username="ola", email="ola@test.no")
    u2 = User(username="kari", email="kari@test.no")

    # 2) Legg dem til sesjonen — fortsatt ingen INSERT, bare merket som nye:
    session.add(u1)
    session.add(u2)

    # 3) commit() er det som faktisk skriver til databasen:
    session.commit()
    print("Etter commit fikk u1 id =", u1.id)

    # 4) Hent alle — sa.select() bygger SELECT, session.scalars() returnerer instanser:
    query = sa.select(User)
    users = session.scalars(query).all()
    print("Antall brukere:", len(users))
    for u in users:
        print(" ", u)
`,
    hints: [
      "session.add() planlegger INSERT — commit() utfører den",
      "Etter commit får objektet sin id automatisk (auto-increment)",
      "session.scalars(query) returnerer instanser (User-objekter); session.execute(query) returnerer Row-objekter",
      "I Flask-SQLAlchemy er dette db.session.add() / db.session.commit() — samme API",
    ],
    docs: [
      {
        title: "Session basics — add, commit, rollback",
        url: "https://docs.sqlalchemy.org/en/20/orm/session_basics.html",
        note: "Unit-of-work-mønsteret: samle endringer i sessionen, commit i én transaksjon.",
      },
      {
        title: "session.scalars() vs execute()",
        url: "https://docs.sqlalchemy.org/en/20/orm/queryguide/select.html#selecting-orm-entities",
        note: ".scalars() pakker ut Row → entitet. Bruk denne når du vil ha modellinstanser tilbake.",
        snippet: `users = session.scalars(sa.select(User)).all()`,
      },
    ],
  },
  {
    id: "py-sqla-3-get-where",
    topic: "Flask-SQLAlchemy (ORM)",
    title: "Hent én rad: session.get() og where()-filter",
    description:
      "To måter å hente én rad: session.get(Model, pk) er det raskeste oppslaget på primærnøkkel. For andre kriterier brukes sa.select(...).where(...) med .first() eller .all(). LIKE-filter med kolonne.like('mønster%').",
    requires: ["sqlalchemy"],
    starter: `import sqlalchemy as sa
import sqlalchemy.orm as so

class Base(so.DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "user"
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    username: so.Mapped[str] = so.mapped_column(sa.String(64), unique=True)
    email: so.Mapped[str] = so.mapped_column(sa.String(120))

    def __repr__(self):
        return f"<User {self.username}>"

engine = sa.create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

with so.Session(engine) as session:
    session.add_all([
        User(username="ola", email="ola@test.no"),
        User(username="kari", email="kari@test.no"),
        User(username="ole", email="ole@test.no"),
        User(username="ola_andre", email="o2@test.no"),
    ])
    session.commit()

    # 1) get() — primærnøkkeloppslag, O(1) i indekset tabell:
    u = session.get(User, 2)
    print("Bruker 2:", u)

    # 2) where med likhet:
    q = sa.select(User).where(User.username == "kari")
    print("kari:", session.scalars(q).first())

    # 3) where + LIKE:
    q = sa.select(User).where(User.username.like("ola%"))
    print("Begynner med ola:", session.scalars(q).all())

    # 4) Ikke-eksisterende — get returnerer None:
    print("Ikke-eksisterende:", session.get(User, 999))
`,
    hints: [
      "session.get returnerer None (ikke exception) hvis raden ikke finnes — tilsvarer Flask sin db.get_or_404()-pattern",
      "User.username.like('o%') — % er wildcard, akkurat som SQL LIKE",
      ".first() returnerer første treff eller None; .one() krever nøyaktig ett treff (exception ellers)",
      "I Mega-Tutorial Part IV brukes nøyaktig dette mønsteret i shell-en",
    ],
    docs: [
      {
        title: "select() med where()",
        url: "https://docs.sqlalchemy.org/en/20/tutorial/data_select.html#the-where-clause",
        snippet: `q = sa.select(User).where(User.username == "ola")
user = session.scalars(q).first()`,
      },
      {
        title: "Column operators — like, in_, is_, ==",
        url: "https://docs.sqlalchemy.org/en/20/core/operators.html",
        note: "User.id == 1 → SQL '='. User.username.like('o%') → SQL LIKE. User.id.in_([1,2,3]) → IN.",
      },
      {
        title: "session.get() — primærnøkkel-oppslag",
        url: "https://docs.sqlalchemy.org/en/20/orm/queryguide/select.html#selecting-by-primary-key-with-session-get",
        note: "Raskere enn select+where for PK. Returnerer None ved ikke-funnet.",
      },
    ],
  },
  {
    id: "py-sqla-4-order-limit",
    topic: "Flask-SQLAlchemy (ORM)",
    title: "Sortering og paginering: order_by() + limit()",
    description:
      "Sorter med kolonne.desc() eller .asc(). Begrens med .limit(n). Sammen utgjør disse byggesteinene for paginering — Mega-Tutorial bruker dem rett før den introduserer Flask-SQLAlchemy sin paginate()-helper i senere kapitler.",
    requires: ["sqlalchemy"],
    starter: `import sqlalchemy as sa
import sqlalchemy.orm as so

class Base(so.DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "user"
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    username: so.Mapped[str] = so.mapped_column(sa.String(64), unique=True)

    def __repr__(self):
        return f"<User {self.username}>"

engine = sa.create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

with so.Session(engine) as session:
    session.add_all([
        User(username="ola"),
        User(username="kari"),
        User(username="bjørn"),
        User(username="åse"),
        User(username="lars"),
    ])
    session.commit()

    # Synkende:
    q = sa.select(User).order_by(User.username.desc())
    print("Synkende alfabetisk:")
    for u in session.scalars(q):
        print(" ", u)

    print("---")
    # Stigende, topp 2:
    q = sa.select(User).order_by(User.username.asc()).limit(2)
    print("Topp 2 stigende:")
    for u in session.scalars(q):
        print(" ", u)

    print("---")
    # Side 2 (offset 2, limit 2):
    q = sa.select(User).order_by(User.username.asc()).offset(2).limit(2)
    print("Side 2 (offset=2, limit=2):")
    for u in session.scalars(q):
        print(" ", u)
`,
    hints: [
      "order_by(...).limit(n).offset(m) er klassisk paginering — limit + offset",
      "I Flask-SQLAlchemy: db.paginate(query, page=2, per_page=2) — samme greie pakket inn",
      "Husk at uten ORDER BY er rekkefølgen udefinert — derfor ALLTID order_by før limit",
    ],
    docs: [
      {
        title: "ORDER BY, LIMIT, OFFSET",
        url: "https://docs.sqlalchemy.org/en/20/tutorial/data_select.html#the-order-by-clause",
        snippet: `sa.select(User).order_by(User.username.asc()).limit(10).offset(20)`,
      },
      {
        title: "Flask-SQLAlchemy paginate()",
        url: "https://flask-sqlalchemy.palletsprojects.com/en/stable/pagination/",
        note: "Pen wrapper over limit+offset med metadata (next/prev/total).",
      },
    ],
  },
  {
    id: "py-sqla-5-foreign-key",
    topic: "Flask-SQLAlchemy (ORM)",
    title: "En-til-mange: Post-modell med fremmednøkkel og relasjon",
    description:
      "Mega-Tutorial Part IV legger til Post-modellen med user_id-fremmednøkkel og bidirekkjonal relasjon (back_populates). Bygg samme schema her: User har posts, Post har author. Inspect viser at FK-en er på plass.",
    requires: ["sqlalchemy"],
    starter: `import sqlalchemy as sa
import sqlalchemy.orm as so
from datetime import datetime, timezone

class Base(so.DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "user"
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    username: so.Mapped[str] = so.mapped_column(sa.String(64), unique=True)

    # Forward-ref med streng — Post er ikke definert enda:
    posts: so.Mapped[list["Post"]] = so.relationship(back_populates="author")

    def __repr__(self):
        return f"<User {self.username}>"

class Post(Base):
    __tablename__ = "post"
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    body: so.Mapped[str] = so.mapped_column(sa.String(140))
    timestamp: so.Mapped[datetime] = so.mapped_column(
        index=True,
        default=lambda: datetime.now(timezone.utc),
    )
    # Fremmednøkkel + index — Mega-Tutorial sier "always index FKs":
    user_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey(User.id), index=True)

    author: so.Mapped[User] = so.relationship(back_populates="posts")

    def __repr__(self):
        return f"<Post {self.body!r}>"

engine = sa.create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

inspector = sa.inspect(engine)
print("Tabeller:", inspector.get_table_names())
print("post-kolonner:", [c["name"] for c in inspector.get_columns("post")])
print("post FK:")
for fk in inspector.get_foreign_keys("post"):
    print(" ", fk["constrained_columns"], "→", fk["referred_table"], fk["referred_columns"])
`,
    hints: [
      "back_populates på BEGGE sider — knytter author ↔ posts sammen, så endringer på en side speiles automatisk",
      "default=lambda: datetime.now(timezone.utc) — lambdaen kjører ved INSERT, så hver rad får sin egen timestamp (default=datetime.now(timezone.utc) ville frosset tiden ved import)",
      "list[\"Post\"] med streng for forward-ref — klassisk Python-typing-mønster når klassen er definert lengre ned",
      "I Mega-Tutorial brukes WriteOnlyMapped istedenfor list — mer skalerbart for store relasjoner. list er enklere for små eksempler.",
    ],
    docs: [
      {
        title: "ForeignKey + relationship()",
        url: "https://docs.sqlalchemy.org/en/20/orm/relationship_api.html#sqlalchemy.orm.relationship",
        snippet: `class Post(Base):
    user_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey("user.id"))
    author: so.Mapped["User"] = so.relationship(back_populates="posts")

class User(Base):
    posts: so.Mapped[list["Post"]] = so.relationship(back_populates="author")`,
      },
      {
        title: "back_populates — to-veis relasjon",
        url: "https://docs.sqlalchemy.org/en/20/orm/backref.html",
        note: "Gjør at endringer på en side speiles på den andre. user.posts.append(p) setter også p.author = user automatisk.",
      },
    ],
  },
  {
    id: "py-sqla-6-relationship-nav",
    topic: "Flask-SQLAlchemy (ORM)",
    title: "Naviger relasjoner: post.author og user.posts",
    description:
      "Når relasjonene er på plass slipper du å skrive JOIN — bare aksessér attributtene. Lag en bruker, gi hen to innlegg ved å sette author=ola, og naviger begge veier. Dette er ORM-ens kjerne-løfte: objekter istedenfor SQL.",
    requires: ["sqlalchemy"],
    starter: `import sqlalchemy as sa
import sqlalchemy.orm as so
from datetime import datetime, timezone

class Base(so.DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "user"
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    username: so.Mapped[str] = so.mapped_column(sa.String(64), unique=True)
    posts: so.Mapped[list["Post"]] = so.relationship(back_populates="author")

class Post(Base):
    __tablename__ = "post"
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    body: so.Mapped[str] = so.mapped_column(sa.String(140))
    timestamp: so.Mapped[datetime] = so.mapped_column(
        default=lambda: datetime.now(timezone.utc),
    )
    user_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey(User.id), index=True)
    author: so.Mapped[User] = so.relationship(back_populates="posts")

engine = sa.create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

with so.Session(engine) as session:
    ola = User(username="ola")
    kari = User(username="kari")
    session.add_all([ola, kari])

    # Vi setter author= direkte — SQLAlchemy fyller user_id automatisk:
    session.add_all([
        Post(body="Hei verden!", author=ola),
        Post(body="Andre innlegg", author=ola),
        Post(body="Karis bidrag", author=kari),
    ])
    session.commit()

    # Naviger fra Post → User (mange-til-én):
    print("Alle innlegg med forfatter:")
    for p in session.scalars(sa.select(Post)):
        print(f"  '{p.body}' — av {p.author.username}")

    # Naviger fra User → Post (én-til-mange):
    print("\\nOlas innlegg:")
    for p in ola.posts:
        print(f"  - {p.body}")
`,
    hints: [
      "author=ola fyller user_id automatisk — du trenger aldri sette FK-en manuelt når relasjonen er definert",
      "ola.posts gir Python-listen rett ut, ingen ekstra SELECT du selv må skrive",
      "I bakgrunnen kjører SQLAlchemy en SELECT mot post WHERE user_id = ola.id — du ser bare attributtet",
      "Pass på N+1-fellen: en for-løkke som aksesserer p.author kan trigge én SELECT per post. Bruk selectinload() for eager-loading hvis du har mange rader.",
    ],
    docs: [
      {
        title: "Relationship loading techniques",
        url: "https://docs.sqlalchemy.org/en/20/orm/queryguide/relationships.html",
        note: "selectinload, joinedload, lazy='select' — kontroller hvordan relasjoner hentes for å unngå N+1.",
        snippet: `q = sa.select(User).options(so.selectinload(User.posts))
# Én SELECT for users, én for ALLE posts samlet`,
      },
      {
        title: "Lazy loading vs eager loading",
        url: "https://docs.sqlalchemy.org/en/20/orm/queryguide/relationships.html#lazy-loading",
        note: "Default lazy: SELECT skjer når attributtet aksesseres. Eager: SELECT kjøres på forhånd. N+1-problemet løses med eager.",
      },
    ],
  },
  {
    id: "py-sqla-7-update-delete-rollback",
    topic: "Flask-SQLAlchemy (ORM)",
    title: "Oppdater, slett, og rull tilbake (transaksjoner i ORM)",
    description:
      "ORM-en gjør UPDATE og DELETE til vanlige Python-operasjoner: endre attributtet og commit; eller session.delete(obj) og commit. Hvis noe går galt før commit, kall session.rollback() — alle ulagrede endringer forsvinner. Dette er samme ACID-garantier som Mega-Tutorial nevner i avsnittet om sessions.",
    requires: ["sqlalchemy"],
    starter: `import sqlalchemy as sa
import sqlalchemy.orm as so

class Base(so.DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "user"
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    username: so.Mapped[str] = so.mapped_column(sa.String(64), unique=True)
    email: so.Mapped[str] = so.mapped_column(sa.String(120))

    def __repr__(self):
        return f"<User {self.username} {self.email}>"

engine = sa.create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

with so.Session(engine) as session:
    session.add_all([
        User(username="ola", email="ola@test.no"),
        User(username="kari", email="kari@test.no"),
        User(username="per", email="per@test.no"),
    ])
    session.commit()

    # 1) UPDATE — bare endre attributt og commit, ingen UPDATE-statement:
    u = session.get(User, 1)
    u.email = "ola.nordmann@firma.no"
    session.commit()
    print("Etter oppdatering:", session.get(User, 1))

    # 2) DELETE — session.delete + commit:
    kari = session.get(User, 2)
    session.delete(kari)
    session.commit()
    print("Etter slett, alle:", session.scalars(sa.select(User)).all())

    # 3) ROLLBACK — endring blir IKKE skrevet:
    per = session.get(User, 3)
    per.username = "FEIL_NAVN"
    print("Før rollback (in-memory state):", per.username)
    session.rollback()
    # Rollback laster objektet på nytt fra DB:
    session.refresh(per)
    print("Etter rollback:", per.username)
`,
    hints: [
      "Du skriver aldri UPDATE/DELETE selv — endre attributtet eller kall session.delete(), commit gjør jobben",
      "rollback() fungerer bare på endringer som IKKE er commit-et enda — committed data er borte for godt",
      "session.refresh(obj) tvinger en ny SELECT etter rollback så Python-objektet matcher DB",
      "I produksjon: pakk endringer i try/except og rollback ved feil — så atomicity holder selv ved exceptions",
    ],
    docs: [
      {
        title: "Transaksjoner og rollback",
        url: "https://docs.sqlalchemy.org/en/20/orm/session_transaction.html",
        note: "session.commit() commiter, session.rollback() ruller tilbake. Bruk try/except/rollback for atomic-mønsteret.",
        snippet: `try:
    user.username = "ny"
    session.commit()
except Exception:
    session.rollback()
    raise`,
      },
      {
        title: "session.delete() og cascade",
        url: "https://docs.sqlalchemy.org/en/20/orm/cascades.html",
        note: "session.delete(obj) markerer for sletting. cascade='all, delete-orphan' rydder også opp i relaterte rader.",
      },
    ],
  },
  {
    id: "py-sqla-8-flask-route",
    topic: "Flask-SQLAlchemy (ORM)",
    title: "Koble ORM til Flask: JSON-API-route mot User-tabellen",
    description:
      "Den endelige sammenkoblingen: en Flask-route som bruker SQLAlchemy istedenfor rå mysql.connector. Sammenlign med py-flask-json-api-oppgaven (samme funksjonalitet, men cursor.execute → session.scalars). I en ekte app ville Flask-SQLAlchemy gitt deg db.session bundet til app-konteksten; her bruker vi sessionmaker direkte for enkelhets skyld.",
    requires: ["sqlalchemy", "flask"],
    starter: `from flask import Flask, jsonify, abort, request
import sqlalchemy as sa
import sqlalchemy.orm as so

class Base(so.DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "user"
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    username: so.Mapped[str] = so.mapped_column(sa.String(64), unique=True)
    email: so.Mapped[str] = so.mapped_column(sa.String(120))

    def to_dict(self):
        return {"id": self.id, "username": self.username, "email": self.email}

engine = sa.create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)
SessionLocal = so.sessionmaker(engine)

# Seed-data:
with SessionLocal() as s:
    s.add_all([
        User(username="ola", email="ola@test.no"),
        User(username="kari", email="kari@test.no"),
    ])
    s.commit()

app = Flask(__name__)

@app.route("/api/users", methods=["GET"])
def liste():
    with SessionLocal() as s:
        users = s.scalars(sa.select(User).order_by(User.username)).all()
        return jsonify([u.to_dict() for u in users])

@app.route("/api/users/<int:user_id>", methods=["GET"])
def detalj(user_id):
    with SessionLocal() as s:
        u = s.get(User, user_id)
        if u is None:
            abort(404)
        return jsonify(u.to_dict())

@app.route("/api/users", methods=["POST"])
def opprett():
    data = request.get_json()
    with SessionLocal() as s:
        ny = User(username=data["username"], email=data["email"])
        s.add(ny)
        s.commit()
        return jsonify(ny.to_dict()), 201

client = app.test_client()
print("GET /api/users:", client.get("/api/users").get_json())
print("GET /api/users/1:", client.get("/api/users/1").get_json())
print("GET /api/users/999 status:", client.get("/api/users/999").status_code)
r = client.post("/api/users", json={"username": "per", "email": "per@test.no"})
print("POST /api/users:", r.status_code, r.get_json())
print("Etter POST:", client.get("/api/users").get_json())
`,
    hints: [
      "with SessionLocal() as s: gir auto-close — ingen lekkende DB-tilkoblinger",
      "Sammenlign med py-flask-json-api: identisk respons, men null SQL-strenger i Python-koden",
      "I Flask-SQLAlchemy bytter du sessionmaker med db.session — den er bundet til app-konteksten og ryddes opp etter hver request automatisk",
      "to_dict()-metoden er en vanlig pattern; større prosjekter bruker biblioteket marshmallow eller pydantic for serialisering",
    ],
    docs: [
      {
        title: "Flask-SQLAlchemy",
        url: "https://flask-sqlalchemy.palletsprojects.com/en/stable/quickstart/",
        note: "Wrapper rundt SQLAlchemy som binder session til app-konteksten. db.session brukes per request, lukkes automatisk.",
      },
      {
        title: "Marshmallow / Pydantic for serialisering",
        url: "https://marshmallow.readthedocs.io/en/stable/",
        note: "Når to_dict() ikke holder lenger: schemaer som validerer input + serialiserer output (samme jobb som Pydantic gjør i FastAPI).",
      },
    ],
  },

  // ============ FLASK-UTVIDELSER ============
  // Disse oppgavene dekker pakkene i en typisk Flask-prosjekt-requirements.txt:
  //
  //   Flask-Login==0.6.3        — proff login-håndtering (LoginManager, current_user, @login_required)
  //   Flask-WTF==1.2.2          — Form-klasser med automatisk CSRF — bytter ut den manuelle CSRF-koden
  //   WTForms==3.2.1            — felt-typer + validatorer (DataRequired, Length, Email, NumberRange)
  //   email_validator==2.3.0    — brukes av WTForms sin Email()-validator; også standalone
  //   python-dotenv==1.2.2      — leser .env-filer inn i os.environ (brukes for SECRET_KEY, DATABASE_URL osv.)
  //
  // Disse erstatter hjemmelagde varianter andre steder i pensum:
  //   py-flask-csrf  → py-ext-flask-wtf-csrf  (manuell token vs Flask-WTF)
  //   py-flask-login → py-ext-flask-login     (custom @login_required vs Flask-Login)
  {
    id: "py-ext-dotenv",
    topic: "Flask-utvidelser",
    title: "python-dotenv: les konfigurasjon fra .env",
    description:
      "I produksjon hardkoder du ALDRI SECRET_KEY, DATABASE_URL eller API-nøkler i koden. Standard-mønsteret er en .env-fil i prosjektroten som python-dotenv leser inn i os.environ ved oppstart. I Pyodide har vi ingen ekte fil, men load_dotenv() kan også lese fra en stream — patternene er ellers identiske.",
    requires: ["python-dotenv"],
    starter: `import os
from io import StringIO
from dotenv import load_dotenv

# I en ekte app: en .env-fil i prosjektroten:
#   DATABASE_URL=mysql://localhost/exam
#   SECRET_KEY=hemmelig-nokkel-generert-en-gang
#   DEBUG=True
#
# I Pyodide simulerer vi den med en StringIO:
env_innhold = """
DATABASE_URL=mysql://localhost/exam
SECRET_KEY=hemmelig-nokkel-generert-en-gang
DEBUG=True
"""

load_dotenv(stream=StringIO(env_innhold))

# Nå er verdiene tilgjengelig i os.environ:
print("DATABASE_URL:", os.environ.get("DATABASE_URL"))
print("SECRET_KEY:", os.environ.get("SECRET_KEY"))
print("DEBUG:", os.environ.get("DEBUG"))

# Standard Flask-config-mønster — fra Mega-Tutorial:
class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY") or "fallback-skal-aldri-brukes"
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") or "sqlite:///app.db"
    DEBUG = os.environ.get("DEBUG", "False") == "True"

print(f"\\nFlask-config:")
print(f"  SECRET_KEY: {Config.SECRET_KEY[:12]}…")
print(f"  DATABASE_URI: {Config.SQLALCHEMY_DATABASE_URI}")
print(f"  DEBUG: {Config.DEBUG} ({type(Config.DEBUG).__name__})")
`,
    hints: [
      "or-fallback-mønsteret: os.environ.get(...) or 'default' — None er falsy, så fallbacken brukes hvis variabelen mangler",
      ".env-filen LIGGER ALDRI i git — legg den i .gitignore. Sjekk inn .env.example med dummy-verdier istedenfor",
      "DEBUG=True i .env er en STRING, ikke en bool — derfor konverteres med == 'True'",
      "I produksjon settes disse via plattformen (Heroku-config, systemd EnvironmentFile, Docker secrets) — .env er for utvikling",
    ],
    docs: [
      {
        title: "python-dotenv",
        url: "https://github.com/theskumar/python-dotenv#readme",
        note: "load_dotenv() leser .env-fila og kopierer innholdet inn i os.environ. Kall den én gang i toppen av appen.",
        snippet: `from dotenv import load_dotenv
load_dotenv()
secret = os.environ.get("SECRET_KEY")`,
      },
      {
        title: "12-factor app: Config",
        url: "https://12factor.net/config",
        note: "Industristandard: hold all konfig i miljøvariabler, aldri i koden. Samme kode kjører i utvikling og produksjon.",
      },
    ],
  },
  {
    id: "py-ext-wtforms-validate",
    topic: "Flask-utvidelser",
    title: "WTForms: definér en form-klasse med validatorer",
    description:
      "WTForms gjør at du beskriver et skjema som en Python-klasse, og lar biblioteket sjekke at innsendt data oppfyller reglene (lengde, type, obligatorisk osv.). Standalone — uten Flask — kan en Form-instans valideres mot et dict.",
    requires: ["wtforms"],
    starter: `from wtforms import Form, StringField, PasswordField, IntegerField
from wtforms.validators import DataRequired, Length, NumberRange

class RegistrerForm(Form):
    brukernavn = StringField("Brukernavn", validators=[
        DataRequired(message="Brukernavn er påkrevd"),
        Length(min=3, max=20, message="Brukernavn må være 3–20 tegn"),
    ])
    passord = PasswordField("Passord", validators=[
        DataRequired(),
        Length(min=8, message="Passord må være minst 8 tegn"),
    ])
    alder = IntegerField("Alder", validators=[
        NumberRange(min=18, max=120, message="Alder må være 18–120"),
    ])

# Test 1: ugyldig — for kort passord, for ung
data = {"brukernavn": "ola", "passord": "kort", "alder": 15}
form = RegistrerForm(data=data)
print("Gyldig?", form.validate())
print("Feil:", form.errors)

print()
# Test 2: gyldig
data = {"brukernavn": "ola_nordmann", "passord": "supersecret", "alder": 25}
form = RegistrerForm(data=data)
print("Gyldig?", form.validate())
print("Brukernavn:", form.brukernavn.data)
print("Alder:", form.alder.data)

print()
# Test 3: alle feil samtidig
data = {"brukernavn": "", "passord": "", "alder": 999}
form = RegistrerForm(data=data)
form.validate()
for felt, feil in form.errors.items():
    print(f"  {felt}: {', '.join(feil)}")
`,
    hints: [
      "Validatorene er KLASSE-INSTANSER (DataRequired(), ikke DataRequired) — det er derfor du kan gi message=...",
      "form.validate() returnerer True/False og fyller form.errors",
      "DataRequired sjekker både at feltet er sendt OG at verdien ikke er falsy ('', None, 0)",
      "I Flask-WTF arver klassen FlaskForm istedenfor Form — da fanges request.form automatisk og CSRF aktiveres",
    ],
    docs: [
      {
        title: "WTForms — Fields & Validators",
        url: "https://wtforms.readthedocs.io/en/stable/fields/",
        note: "StringField, IntegerField, BooleanField osv. Validatorer: DataRequired, Length, Email, NumberRange, EqualTo.",
      },
      {
        title: "WTForms — bygge en Form-klasse",
        url: "https://wtforms.readthedocs.io/en/stable/forms/",
        snippet: `class RegistrerForm(Form):
    brukernavn = StringField("Brukernavn", validators=[DataRequired(), Length(min=3, max=20)])
    alder = IntegerField("Alder", validators=[NumberRange(min=18, max=120)])`,
      },
    ],
  },
  {
    id: "py-ext-flask-wtf-csrf",
    topic: "Flask-utvidelser",
    title: "Flask-WTF: form-klasse med automatisk CSRF",
    description:
      "Flask-WTF kombinerer WTForms med Flask + automatisk CSRF-beskyttelse. Sammenlign med py-flask-csrf: der måtte vi generere og sjekke tokenet manuelt — her er det innebygd. Vi skrur av CSRF i test-klienten via WTF_CSRF_ENABLED=False så vi slipper å hente token i hver test; i produksjon står den på.",
    requires: ["flask", "flask-wtf"],
    starter: `from flask import Flask
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField
from wtforms.validators import DataRequired, Length

app = Flask(__name__)
app.config["SECRET_KEY"] = "test-key"
# I PRODUKSJON: la denne være True (default). Her skrur vi av for at
# test_client skal slippe å hente token først.
app.config["WTF_CSRF_ENABLED"] = False

class LoginForm(FlaskForm):
    brukernavn = StringField("Brukernavn", validators=[DataRequired(), Length(min=3)])
    passord = PasswordField("Passord", validators=[DataRequired(), Length(min=8)])

@app.route("/login", methods=["POST"])
def login():
    form = LoginForm()  # Plukker request.form automatisk
    if form.validate_on_submit():
        return f"Innlogget: {form.brukernavn.data}", 200
    return f"Valideringsfeil: {form.errors}", 400

client = app.test_client()

# Ugyldig — passord for kort:
r = client.post("/login", data={"brukernavn": "ola", "passord": "kort"})
print("Ugyldig:", r.status_code, "→", r.data.decode())

# Gyldig:
r = client.post("/login", data={"brukernavn": "ola", "passord": "supersecret"})
print("Gyldig:", r.status_code, "→", r.data.decode())
`,
    hints: [
      "validate_on_submit() = is_submitted() AND validate() — den korte versjonen i hver POST-handler",
      "FlaskForm() trenger ingen argument — den henter request.form automatisk fra Flask sin context",
      "I produksjon: WTF_CSRF_ENABLED=True (default). Da må skjemaet inneholde {{ form.csrf_token }} i Jinja-template",
      "Sammenlign med py-flask-csrf — der var token-håndteringen manuell. Flask-WTF gjør det usynlig.",
    ],
    docs: [
      {
        title: "Flask-WTF — CSRF Protection",
        url: "https://flask-wtf.readthedocs.io/en/stable/csrf.html",
        note: "FlaskForm gir automatisk csrf_token-felt + sjekk. Aktiveres med CSRFProtect(app) for skjemaer som ikke arver FlaskForm.",
      },
      {
        title: "validate_on_submit()",
        url: "https://flask-wtf.readthedocs.io/en/stable/quickstart/#creating-forms",
        snippet: `if form.validate_on_submit():
    # request.method == 'POST' AND form.validate() returnerte True
    save(form.data)`,
      },
    ],
  },
  {
    id: "py-ext-email-validator",
    topic: "Flask-utvidelser",
    title: "email_validator: valider e-postadresser",
    description:
      "email_validator er pakka som WTForms sin Email()-validator bruker under panseret. Sjekker både syntaks (RFC-konform) og kan slå opp DNS for å se om domenet eksisterer. Vi skrur av DNS-sjekken her (check_deliverability=False) — det krever nettverk og er treigt.",
    requires: ["email-validator"],
    starter: `from email_validator import validate_email, EmailNotValidError

kandidater = [
    "ola@test.no",
    "kari@test",                  # mangler TLD
    "@test.no",                   # mangler local part
    "OLA.NORDMANN@example.com",   # gyldig — blir normalisert
    "ola..nordmann@test.no",      # dobbelt punktum — ugyldig
    "ola+filter@test.no",         # plus-syntaks — gyldig (vanlig hos Gmail)
]

for kandidat in kandidater:
    try:
        info = validate_email(kandidat, check_deliverability=False)
        print(f"OK     | {kandidat!r:35} → normalisert: {info.normalized}")
    except EmailNotValidError as e:
        print(f"AVVIST | {kandidat!r:35} → {e}")

print()
# Hvordan WTForms bruker det internt:
from wtforms import Form, StringField
from wtforms.validators import Email

class KontaktForm(Form):
    epost = StringField(validators=[Email(check_deliverability=False)])

form = KontaktForm(data={"epost": "ola@test"})
print("WTForms Email() — ugyldig:", form.validate(), form.errors)

form = KontaktForm(data={"epost": "ola@test.no"})
print("WTForms Email() — gyldig:", form.validate(), form.epost.data)
`,
    hints: [
      "info.normalized normaliserer store/små bokstaver, fjerner unødige tegn — bruk denne formen i DB-en",
      "check_deliverability=False slår av DNS-oppslag. I produksjon kan du la den stå på, men da blokkerer den i et par hundre ms per validering.",
      "WTForms sin Email()-validator videresender til denne pakka — å installere email_validator er en betingelse for at Email() funker",
      "Aldri stol BARE på syntaks-validering — bekreft alltid via en e-post med engangskode hvis adressen brukes til pålogging",
    ],
    docs: [
      {
        title: "email-validator (PyPI)",
        url: "https://github.com/JoshData/python-email-validator#readme",
        note: "validate_email(addr) returnerer info-objekt med normalisert form. Kaster EmailNotValidError ved ugyldig syntaks.",
        snippet: `try:
    info = validate_email(addr, check_deliverability=False)
    normalized = info.normalized
except EmailNotValidError as e:
    print(str(e))`,
      },
      {
        title: "Hvorfor regex IKKE er nok for e-post",
        url: "https://datatracker.ietf.org/doc/html/rfc5322",
        note: "Den fulle RFC 5322-grammatikken er for kompleks for trygg regex. Bruk biblioteket.",
      },
    ],
  },
  {
    id: "py-ext-flask-login",
    topic: "Flask-utvidelser",
    title: "Flask-Login: login_user, current_user, @login_required",
    description:
      "Sammenlign med py-flask-login: der hadde vi en hjemmesnekret @login_required-dekoratør og rotet med session['user_id'] selv. Flask-Login gir LoginManager + UserMixin + @login_required ut av boksen. current_user er tilgjengelig i ALLE views og templater — du slipper å plukke fra session manuelt.",
    requires: ["flask", "flask-login"],
    starter: `from flask import Flask, request
from flask_login import (
    LoginManager, UserMixin,
    login_user, logout_user, login_required, current_user,
)

app = Flask(__name__)
app.config["SECRET_KEY"] = "test-key"

login_manager = LoginManager(app)
login_manager.login_view = "login"  # Hvor uautentiserte sendes via redirect

# User-klassen må arve UserMixin — det gir is_authenticated, is_active, get_id() osv. gratis.
class Bruker(UserMixin):
    def __init__(self, id, navn, passord):
        self.id = id
        self.navn = navn
        self.passord = passord

# Stand-in for en ekte DB:
brukere = {
    1: Bruker(1, "ola", "supersecret"),
    2: Bruker(2, "kari", "passord1234"),
}

# Flask-Login spør oss: gi meg User-objektet for denne id-en
@login_manager.user_loader
def load_user(user_id):
    return brukere.get(int(user_id))

@app.route("/login", methods=["POST"])
def login():
    navn = request.form.get("brukernavn")
    passord = request.form.get("passord")
    funn = next((u for u in brukere.values() if u.navn == navn and u.passord == passord), None)
    if funn:
        login_user(funn)  # Setter session — du trenger ikke ha med session selv
        return f"Innlogget: {funn.navn}", 200
    return "Feil passord", 401

@app.route("/profil")
@login_required
def profil():
    # current_user er det innloggede User-objektet — automatisk tilgjengelig
    return f"Hei, {current_user.navn} (id={current_user.id})"

@app.route("/logout")
@login_required
def logout():
    navn = current_user.navn
    logout_user()
    return f"Logget ut {navn}"

client = app.test_client()
# 1) Uten login → redirect til login_view
r = client.get("/profil")
print("Uten login:", r.status_code, "Location:", r.headers.get("Location"))

# 2) Login
r = client.post("/login", data={"brukernavn": "ola", "passord": "supersecret"})
print("Login:", r.status_code, r.data.decode())

# 3) Med login: profil-sida virker
r = client.get("/profil")
print("Profil:", r.status_code, r.data.decode())

# 4) Logout
r = client.get("/logout")
print("Logout:", r.status_code, r.data.decode())

# 5) Etter logout: profil krever login igjen
r = client.get("/profil")
print("Etter logout:", r.status_code)
`,
    hints: [
      "UserMixin gir gratis-implementasjoner av is_authenticated, is_active, is_anonymous, get_id() — du slipper å skrive dem",
      "login_user(user) setter cookie + session. logout_user() fjerner. Du rører aldri session selv.",
      "current_user fungerer i alle views OG i Jinja-templates: {% if current_user.is_authenticated %} ...",
      "Sammenlign med py-flask-login: der hadde vi 12+ linjer kode for å bygge @login_required selv — her er det én import",
      "Passordene 'supersecret' / 'passord1234' er KLARTEKST her av pedagogiske grunner. I produksjon: generate_password_hash ved registrering, check_password_hash i login_user-flyten — se py-pwd-3-secure-login.",
    ],
    docs: [
      {
        title: "Flask-Login — Configuration",
        url: "https://flask-login.readthedocs.io/en/latest/#configuring-your-application",
        note: "LoginManager(app), @login_manager.user_loader, og UserMixin. De tre delene som må være på plass.",
        snippet: `login_manager = LoginManager(app)

@login_manager.user_loader
def load_user(user_id):
    return USERS.get(int(user_id))`,
      },
      {
        title: "@login_required, current_user, login_user/logout_user",
        url: "https://flask-login.readthedocs.io/en/latest/#login-example",
        note: "current_user er en proxy som peker på innlogget bruker (eller AnonymousUserMixin). Tilgjengelig i ALLE views og templates.",
      },
    ],
  },
];
