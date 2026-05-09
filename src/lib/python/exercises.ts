import type { PyExercise } from "./types";

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
      "I ekte kode skal passord hashes med bcrypt — her er det allerede 'hashet' i seed-data",
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
  },
];
