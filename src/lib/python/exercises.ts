import type { PyExercise } from "./types";
import { DEMO_APP_PYTHON } from "../api-konsoll/demoApp";
import { DTE2507_EXERCISES } from "./exercises-dte2507";
import { PY_DTE2602_EXERCISES } from "./exercises-dte2602";
import { DTE2505_EXERCISES } from "./exercises-dte2505";
import { PY_EXERCISES_DTE2501 } from "./exercises-dte2501";
import { PY_TEK1_GAPS_EXERCISES } from "./exercises-tek1-gaps";
import { PY_DTE2602_LOGISTISK_EXERCISES } from "./exercises-dte2602-logistisk";
import { PY_DTE2602_GAPS2_EXERCISES } from "./exercises-dte2602-gaps2";
import { PY_TEK1_REGDIAG_EXERCISES } from "./exercises-tek1-regdiag";
import { PY_FLASK_BOOTSTRAP_EXERCISES } from "./exercises-flask-bootstrap";
import { PY_KUROSE_EXERCISES } from "./exercises-kurose";
import { PY_FASTAPI_EXERCISES } from "./exercises-fastapi";
import { PY_DTE2505_UTVIDELSE_EXERCISES } from "./exercises-dte2505-utvidelse";
import { PY_TEK1_UTVIDELSE_EXERCISES } from "./exercises-tek1-utvidelse";

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
        (3, "Per Solberg", "per@test.no", "2025-03-20"),
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
        (3, "Per Solberg", "per@test.no", "hash_av_p"),
    ],
)
cur.executemany(
    "INSERT INTO bestilling VALUES (%s, %s, %s)",
    [(101, 1, 1250.0), (102, 1, 320.0), (103, 2, 899.0)],
)
db.commit()
`;

const PY_EXERCISES_BASE: PyExercise[] = [
  // ============ MYSQL CONNECTOR ============
  {
    id: "py-db-connect-init",
    topic: "MySQL connector",
    title: "Primer: Koble til databasen (bare koblingen)",
    description:
      "Før du kan kjøre SQL fra Python må du etablere en kobling. Mønsteret er én linje: " +
      "`db = mysql.connector.connect(host, user, password, database)`. Funksjonen returnerer et " +
      "Connection-objekt som du senere henter cursor fra og kaller `.commit()` / `.close()` på.",
    requires: [],
    setup: DB_SETUP,
    starter: `# === PRIMER: Koble til databasen ===
#
# Før du kan kjøre noen SQL fra Python må du etablere en kobling.
# mysql.connector.connect(...) returnerer et Connection-objekt — kall
# det \`db\`. Det er det objektet du senere henter cursor fra og kaller
# .commit() / .close() på.
#
# Argumentene er vanligvis fire keyword-argumenter:
#   host="localhost"
#   user="root"
#   password="hemmelig"
#   database="exam"
#
# OPPGAVE: Lag koblingen og skriv ut \`db.database\` for å bekrefte at
# det funket. Forventet utskrift: "Koblet til: exam".

import mysql.connector

# TODO: Skriv koden din her
`,
    solution: `import mysql.connector

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="hemmelig",
    database="exam",
)
print("Koblet til:", db.database)
`,
    hints: [
      "mysql.connector.connect(...) tar host, user, password, database — alle som keyword-argumenter.",
      "Lagre resultatet i en variabel `db`. Det er Connection-objektet.",
      "`db.database` returnerer navnet på databasen du er koblet til. Skriv det ut.",
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
    ],
  },
  {
    id: "py-db-cursor-init",
    topic: "MySQL connector",
    title: "Primer: Cursor og fetch — kjør en spørring",
    description:
      "Connection-objektet kan ikke kjøre SQL direkte. Du må lage en cursor med `db.cursor()`. " +
      "Cursor-en er det du sender spørringer til (`execute`) og henter resultater fra " +
      "(`fetchone` / `fetchall`). Vi prøver mønsteret med `SELECT 1` før vi går videre med ekte tabeller.",
    requires: [],
    setup: DB_SETUP,
    starter: `# === PRIMER: Cursor og fetch ===
#
# Connection-objektet (\`db\`) kan ikke kjøre SQL direkte. Du må først
# lage en cursor med db.cursor(). Cursor-en er det du:
#   - sender spørringer til:   cursor.execute("SELECT ...")
#   - henter resultatene fra:  cursor.fetchone()  -> én tuple
#                              cursor.fetchall() -> liste av tupler
#
# OPPGAVE: Lag en cursor, kjør "SELECT 1", hent én rad med fetchone(),
# og skriv ut resultatet. Forventet: (1,) — en tuple med ett tall.

import mysql.connector
db = mysql.connector.connect(database="exam")

# TODO: Skriv koden din her
`,
    solution: `import mysql.connector
db = mysql.connector.connect(database="exam")

cursor = db.cursor()
cursor.execute("SELECT 1")
rad = cursor.fetchone()
print(rad)
`,
    hints: [
      "db.cursor() returnerer en ny cursor — lagre den i en variabel.",
      "cursor.execute(\"SELECT 1\") kjører spørringen, men returnerer ingenting du kan bruke direkte.",
      "cursor.fetchone() returnerer én rad som tuple. SELECT 1 gir tuple-en (1,) — med komma fordi det er en tuple, ikke et tall.",
    ],
    docs: [
      {
        title: "cursor.execute() og fetchone()",
        url: "https://dev.mysql.com/doc/connector-python/en/connector-python-api-mysqlcursor-execute.html",
        note: "Kjør spørring → hent én rad eller alle rader.",
        snippet: `cursor = db.cursor()
cursor.execute("SELECT 1")
rad = cursor.fetchone()    # (1,)`,
      },
    ],
  },
  {
    id: "py-db-connect",
    topic: "MySQL connector",
    title: "Koble til databasen og hent alle kunder",
    description:
      "Skriv koden selv, linje for linje:\n" +
      "1. Koble til database 'exam' med mysql.connector.connect(...) — host/user/password er gitt.\n" +
      "2. Lag en cursor med db.cursor().\n" +
      "3. Kjør SELECT * FROM kunde med cursor.execute(...).\n" +
      "4. Hent alle rader med cursor.fetchall() og lagre i en variabel.\n" +
      "5. Skriv ut hver rad med en for-løkke.",
    requires: [],
    setup: DB_SETUP,
    starter: `import mysql.connector

# 1. Koble til databasen 'exam' (host, user, password, database):
db = ...

# 2. Lag en cursor:
cursor = ...

# 3. Kjør spørringen "SELECT * FROM kunde":


# 4. Hent alle rader med fetchall():
rows = ...

# 5. Skriv ut hver rad i en for-løkke:
`,
    solution: `import mysql.connector

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
      "Hent én kunde basert på kundenr — uten å konkatenere brukerinput inn i SQL.\n" +
      "1. Koble til 'exam' og lag en cursor.\n" +
      "2. Skriv en SELECT som henter navn og epost WHERE kundenr = %s — merk %s, ikke f-string!\n" +
      "3. Send kundenr-verdien som en tuple (kundenr,) — kommaet er viktig.\n" +
      "4. Bruk fetchone() (én rad) i stedet for fetchall().\n" +
      "5. Skriv ut resultatet.",
    setup: DB_SETUP,
    starter: `import mysql.connector

db = mysql.connector.connect(database="exam")
cursor = ...

kundenr = 2

# Skriv en SELECT med %s-placeholder og send kundenr som tuple:
cursor.execute(
    ...,
    ...,
)

# Hent én rad:
kunde = ...
print(kunde)
`,
    solution: `import mysql.connector

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
      "Sett inn ny kunde og lagre permanent.\n" +
      "1. Koble til 'exam' og lag cursor.\n" +
      "2. Bygg INSERT-statement med 3 parametre (%s, %s, %s).\n" +
      "3. Send tuple (4, 'Lise Berg', 'lise@test.no') som verdier.\n" +
      "4. ⚠️ Kall db.commit() — ellers ruller transaksjonen tilbake.\n" +
      "5. Bekreft ved å SELECT COUNT(*) og skrive ut.",
    setup: DB_SETUP,
    starter: `import mysql.connector

db = mysql.connector.connect(database="exam")
cursor = db.cursor()

# 2-3. INSERT INTO kunde (kundenr, navn, epost) VALUES (%s, %s, %s):
cursor.execute(
    ...,
    ...,
)

# 4. Husk db.commit() — uten dette blir endringen rullet tilbake:


# 5. Verifiser med SELECT COUNT(*):
cursor.execute("SELECT COUNT(*) FROM kunde")
print("Antall kunder:", ...)
`,
    solution: `import mysql.connector

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
      "To deler:\n" +
      "DEL A (gitt): Kjør den FARLIGE koden som konkatenerer brukerinput inn i SQL-en med +. Se at ' OR 1=1 -- gjør WHERE alltid sant og dumper ALLE kunder.\n" +
      "DEL B (skriv selv): Skriv samme spørring TRYGT med %s-placeholder og tuple. Da returneres ingen rader, fordi 'feil' input blir matchet som en tekst-streng.",
    setup: DB_SETUP,
    starter: `import mysql.connector

db = mysql.connector.connect(database="exam")
cursor = db.cursor()

# === DEL A: DEN FARLIGE MÅTEN (gitt — bare kjør og se resultatet) ===
ondsinnet_input = "' OR 1=1 --"
sql = "SELECT navn FROM kunde WHERE navn = '" + ondsinnet_input + "'"
print("SQL som kjøres:", sql)
cursor.execute(sql)
print("Lekket:", cursor.fetchall())

# === DEL B: DEN TRYGGE MÅTEN (skriv selv) ===
# Bruk %s-placeholder og send ondsinnet_input som tuple. Resultatet skal være en
# tom liste — fordi inputen blir behandlet som en streng, ikke som SQL-kode.
print("Trygg variant:")
cursor.execute(
    ...,
    ...,
)
print("Resultat:", cursor.fetchall())
`,
    solution: `import mysql.connector

db = mysql.connector.connect(database="exam")
cursor = db.cursor()

# DEL A — farlig
ondsinnet_input = "' OR 1=1 --"
sql = "SELECT navn FROM kunde WHERE navn = '" + ondsinnet_input + "'"
print("SQL som kjøres:", sql)
cursor.execute(sql)
print("Lekket:", cursor.fetchall())

# DEL B — trygt
print("Trygg variant:")
cursor.execute(
    "SELECT navn FROM kunde WHERE navn = %s",
    (ondsinnet_input,),
)
print("Resultat:", cursor.fetchall())
`,
    hints: [
      "OR 1=1 gjør WHERE alltid sant → alle rader returneres",
      "Fiks ved å bruke %s-placeholder og tuple — connectoren escaper inputen for deg",
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
  {
    id: "py-db-context-manager",
    topic: "MySQL connector",
    title: "Egen DataBase-klasse med `with`-mønster (__enter__/__exit__)",
    description:
      "Kurset DTE-2509 bruker `with DataBase() as db:` overalt — i Movies/database.py, MovieApp_WTForms, og hele User-Management-modulen. Bygg din egen DataBase-klasse med `__enter__` og `__exit__` slik at tilkoblingen åpnes automatisk og lukkes/committes garantert — selv om koden i blokken krasjer.\n\n1. Definér klassen DataBase med __init__ som lager mysql.connector.connect(...).\n2. __enter__ skal lage en cursor og returnere self.\n3. __exit__ skal kalle db.commit(), så cursor.close(), så db.close().\n4. Bruk klassen med `with DataBase() as db:` og kjør en SELECT.",
    requires: [],
    setup: DB_SETUP,
    starter: `# === \`with DataBase() as db:\`-mønsteret ===
#
# Kurset DTE-2509 bruker dette mønsteret i ALLE DB-eksempler. Hvorfor?
#   1. Lukkingen er garantert — selv om koden krasjer halvveis.
#   2. Commit skjer automatisk på vei ut.
#   3. Mindre kode i routes/views.
#
# OPPGAVE: Bygg din egen DataBase-klasse med __init__/__enter__/__exit__,
# og bruk den med 'with' til å hente kunder.

import mysql.connector

class DataBase:
    def __init__(self):
        # TODO: Lag self.connection = mysql.connector.connect(database="exam")
        ...

    def __enter__(self):
        # TODO: Lag self.cursor = self.connection.cursor() og return self
        ...

    def __exit__(self, exc_type, exc_val, exc_tb):
        # TODO: commit, cursor.close, connection.close
        ...

# Bruk klassen:
with DataBase() as db:
    db.cursor.execute("SELECT navn FROM kunde ORDER BY kundenr")
    for (navn,) in db.cursor.fetchall():
        print(navn)
`,
    solution: `import mysql.connector

class DataBase:
    def __init__(self):
        self.connection = mysql.connector.connect(database="exam")

    def __enter__(self):
        self.cursor = self.connection.cursor()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.connection.commit()
        self.cursor.close()
        self.connection.close()

with DataBase() as db:
    db.cursor.execute("SELECT navn FROM kunde ORDER BY kundenr")
    for (navn,) in db.cursor.fetchall():
        print(navn)
`,
    hints: [
      "__enter__ er metoden som kjører når Python ser `with ... as x:`. Det den returnerer blir x.",
      "__exit__ kjører ALLTID når blokken slutter — også på exception. Argumentene exc_type/exc_val/exc_tb er None hvis ingen feil.",
      "Kall db.commit() i __exit__ slik kurset gjør. Hvis du heller vil rulle tilbake ved exception kan du sjekke `if exc_type:`.",
    ],
    docs: [
      {
        title: "Python `with` og context managers",
        url: "https://docs.python.org/3/reference/datamodel.html#context-managers",
        note: "__enter__ og __exit__ er protokollen som lar deg skrive `with klassen() as x:`.",
        snippet: `class DataBase:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.cleanup()`,
      },
      {
        title: "Kurset bruker dette mønsteret",
        url: "https://github.com/reo303halo/DTE-2509-26V/blob/main/Flask_DB/Movies/database.py",
        note: "Repoets Movies/database.py viser eksakt det samme mønsteret med __enter__/__exit__ for MySQL-tilkoblingen.",
      },
    ],
  },

  // ============ FLASK ROUTING ============
  {
    id: "py-flask-app-init",
    topic: "Flask routing",
    title: "Primer: Lag en Flask-app",
    description:
      "En Flask-app er objektet som holder alle routes, konfig og kjørestatus. Du må alltid lage én " +
      "før du kan koble routes til den. Mønsteret er to linjer: importer `Flask`-klassen, og lag en " +
      "instans med `Flask(__name__)`. Argumentet `__name__` er en innebygd variabel som inneholder " +
      "navnet på modulen som kjører.",
    requires: ["flask"],
    starter: `# === PRIMER: Lag en Flask-app ===
#
# En Flask-app er objektet som holder alle routes, konfig og
# kjørestatus. Du må alltid lage én før du kan koble routes til den.
#
# Mønsteret er to linjer:
#   1) Importer Flask-klassen fra flask-modulen.
#   2) Lag en app med Flask(...). Argumentet er navnet på modulen
#      som kjører — Python har en innebygd variabel som inneholder
#      det (dunder-navn, to underscores på hver side).
#
# OPPGAVE: Importer Flask, lag en \`app\`, og skriv ut \`app.name\`.
# Forventet utskrift: "__main__" (det Python kaller hovedmodulen).

# TODO: Skriv koden din her
`,
    solution: `from flask import Flask

app = Flask(__name__)
print(app.name)
`,
    hints: [
      "`from flask import Flask` henter inn klassen.",
      "Den innebygde variabelen som inneholder modulnavnet heter `__name__` — to underscores på hver side.",
      "`app = Flask(__name__)` lager app-objektet. Deretter `print(app.name)`.",
    ],
    docs: [
      {
        title: "Flask quickstart — A Minimal Application",
        url: "https://flask.palletsprojects.com/en/stable/quickstart/#a-minimal-application",
        note: "Flask(__name__) er steget før du legger til routes.",
        snippet: `from flask import Flask
app = Flask(__name__)`,
      },
    ],
  },
  {
    id: "py-flask-route-init",
    topic: "Flask routing",
    title: "Primer: Knytt en route til app-en",
    description:
      "En route kobler en URL-sti til en Python-funksjon. Det gjøres med decoratoren " +
      "`@app.route(\"/sti\")` over en vanlig funksjon som returnerer det HTTP-responsen skal være — " +
      "vanligvis en streng. Vi tester den ikke ennå, vi bare definerer den og bekrefter at Flask " +
      "registrerte routen.",
    requires: ["flask"],
    starter: `# === PRIMER: Knytt en route ===
#
# En route forteller Flask: "når noen sender en HTTP-request til denne
# stien, kjør denne funksjonen og send det den returnerer som response".
#
# Mønsteret:
#   @app.route("/sti")
#   def navn_på_funksjonen():
#       return "Det som skal sendes tilbake"
#
# Decoratoren går RIGHT OVER funksjonen — ingen tom linje mellom dem.
# Funksjonsnavnet kan være hva som helst; Flask bryr seg om stien.
#
# OPPGAVE: Lag en route på "/" som returnerer "Hei fra Flask!".
# Vi tester den ikke ennå (det kommer i neste primer) — bare definer
# den. Skriv ut \`app.url_map\` til slutt for å se at Flask registrerte
# routen.

from flask import Flask

app = Flask(__name__)

# TODO: Skriv koden din her


print(app.url_map)
`,
    solution: `from flask import Flask

app = Flask(__name__)

@app.route("/")
def hjem():
    return "Hei fra Flask!"

print(app.url_map)
`,
    hints: [
      "Sett decoratoren `@app.route(\"/\")` på linja rett over def-en.",
      "Funksjonen skal returnere en streng. Flask gjør den om til HTTP-response automatisk.",
      "`app.url_map` viser alle registrerte routes — du skal se din egen sti i utskriften.",
    ],
    docs: [
      {
        title: "Flask quickstart — Routing",
        url: "https://flask.palletsprojects.com/en/stable/quickstart/#routing",
        note: "@app.route binder en sti til en funksjon.",
        snippet: `@app.route("/")
def home():
    return "Hello"`,
      },
    ],
  },
  {
    id: "py-flask-test-client-init",
    topic: "Flask routing",
    title: "Primer: app.test_client() — test uten server",
    description:
      "I produksjon starter Flask en webserver. I sandkasse-miljøet vårt (og i tester) bruker vi " +
      "`app.test_client()` som sender HTTP-requests internt uten nettverk. Mønsteret er: " +
      "`client = app.test_client()` → `resp = client.get(\"/\")` → `resp.status_code` og `resp.data.decode()`.",
    requires: ["flask"],
    starter: `# === PRIMER: app.test_client() ===
#
# I ekte drift kjører du \`app.run()\` og Flask starter en webserver.
# Det funker ikke i en sandkasse — så vi bruker testklienten i stedet:
#
#   client = app.test_client()
#   resp = client.get("/")          # sender GET /
#   resp.status_code                 # 200, 404, ...
#   resp.data.decode()               # responsen som streng
#
# OPPGAVE: Send en GET til "/" på app-en under, og skriv ut både status
# og body. Forventet: Status 200, Body "Test!".

from flask import Flask

app = Flask(__name__)

@app.route("/")
def hjem():
    return "Test!"

# TODO: Skriv koden din her
`,
    solution: `from flask import Flask

app = Flask(__name__)

@app.route("/")
def hjem():
    return "Test!"

client = app.test_client()
resp = client.get("/")
print("Status:", resp.status_code)
print("Body:", resp.data.decode())
`,
    hints: [
      "`client = app.test_client()` — lagre klienten i en variabel.",
      "`client.get(\"/\")` returnerer et response-objekt med `.status_code` og `.data`.",
      "`.data` er bytes — kall `.decode()` for å få en lesbar streng.",
    ],
    docs: [
      {
        title: "Flask test_client()",
        url: "https://flask.palletsprojects.com/en/stable/testing/#sending-requests-with-the-test-client",
        note: "Send forespørsler uten å starte en ekte server.",
        snippet: `client = app.test_client()
resp = client.get("/")
resp.status_code   # 200
resp.data.decode() # "Test!"`,
      },
    ],
  },
  {
    id: "py-flask-hello",
    topic: "Flask routing",
    title: "Første Flask-route",
    description:
      "Lag en Flask-app med én route som returnerer 'Hei!'. Vi bruker app.test_client() for å sende en GET /-request og se responsen — uten å starte en ekte server.",
    requires: ["flask"],
    starter: `from flask import Flask

# === OPPGAVE ===
# • Status skal bli 200
# • Body skal bli 'Hei!'

app = Flask(__name__)

@app.route("/")
def home():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

# Test routen:

# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask

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

# === OPPGAVE ===
# • <int:kundenr> tvinger Flask til å konvertere til int — bokstaver gir 404

app = Flask(__name__)

@app.route("/kunde/<int:kundenr>")
def kunde(kundenr):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass


# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask

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
    id: "py-flask-multi-param",
    topic: "Flask routing",
    title: "Route med flere URL-parametre og typer",
    description:
      "Repoets Basics_Lecture/app.py viser mønsteret /greet/<name>/<int:id>. Bygg en route som tar BÅDE en streng-parameter og en int-parameter, og returnerer en hilsen som inneholder begge. Test med både gyldig input (\"/greet/Ola/42\") og input som matcher feil type (\"/greet/Ola/abc\" → 404).",
    requires: ["flask"],
    starter: `from flask import Flask

# === OPPGAVE ===
# Lag /greet/<name>/<int:id> som returnerer f.eks. "Hei Ola, id=42".
# • <name> er en string (default-konverteren — alt mellom skråstreker).
# • <int:id> tvinger int — så /greet/Ola/abc gir 404.
#
# Test med client.get("/greet/Ola/42") og client.get("/greet/Ola/abc").

app = Flask(__name__)

@app.route("/greet/<name>/<int:id>")
def greet(name, id):
    # TODO: Returner f"Hei {name}, id={id}"
    pass

client = app.test_client()
# TODO: kjør to test-kall og print resultatene
`,
    solution: `from flask import Flask

app = Flask(__name__)

@app.route("/greet/<name>/<int:id>")
def greet(name, id):
    return f"Hei {name}, id={id}"

client = app.test_client()
print(client.get("/greet/Ola/42").data.decode())
print("Feil type:", client.get("/greet/Ola/abc").status_code)
`,
    hints: [
      "<name> uten prefiks er en string-konverter (default).",
      "<int:id> validerer at det er et heltall. Bokstaver gir 404 før funksjonen din kjøres.",
      "Funksjonen tar argumentene i samme rekkefølge som de står i URLen.",
    ],
    docs: [
      {
        title: "Variable rules — URL converters",
        url: "https://flask.palletsprojects.com/en/stable/quickstart/#variable-rules",
        note:
          "Tilgjengelige convertere: <string:>, <int:>, <float:>, <path:>, <uuid:>. <path:> matcher skråstreker også — nyttig for filer.",
        snippet: `@app.route("/files/<path:filename>")
def file(filename):
    return filename  # kan inneholde /`,
      },
      {
        title: "Kurset bruker dette mønsteret",
        url: "https://github.com/reo303halo/DTE-2509-26V/blob/main/Flask_Basics/Basics_Lecture/app.py",
        note: "Basics_Lecture viser /greet/<name>/<int:id> som demonstrasjon av to parametre med ulik type.",
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

# === OPPGAVE ===
# • {{ }} er for verdier, {% %} er for kontroll-strukturer
# • Jinja autoescaper output — beskytter mot XSS

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
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass


# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask, render_template_string

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

# === OPPGAVE ===
# • request.form er dict-aktig — bruk .get for default-verdi

app = Flask(__name__)

@app.route("/login", methods=["GET", "POST"])
def login():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass


# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask, request

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
  {
    id: "py-flask-file-storage",
    topic: "Flask + forms",
    title: "Fil-basert persistens — \"fattigmanns-DB\"",
    description:
      "Repoets averageCalculator i Flask_Basics viser hvordan man kan lagre data MELLOM request-er uten database — bare ved å skrive til en .txt-fil. Det er pedagogisk steg-mellom: god nok for ett-bruker apps, dårlig for alt annet. Bygg POST-routen som tar imot et tall, legger det til numbers.txt, og viser snittet av alle lagrede tall.\n\n1. Skriv writeToFile(num, filename) som åpner filen i \"a\" (append) og skriver tallet + nylinje.\n2. Skriv fromFileToLst(filename) som leser filen og returnerer liste av ints. Håndter at filen ikke finnes.\n3. Skriv findAverage(lst) som returnerer snittet (eller 0 hvis lista er tom).\n4. POST-routen \"/\" legger til tallet og rendrer en respons som viser snittet.",
    requires: ["flask"],
    starter: `# === OPPGAVE: Fattigmanns-persistens med fil ===
#
# Mønsteret repoets averageCalculator bruker:
#   POST /  → writeToFile(num) → recompute average → render
#
# Pyodide gir deg en in-memory filsystem — open()/read()/write() bare virker.

from flask import Flask, request

app = Flask(__name__)
SAVEFILE = "numbers.txt"


def writeToFile(num, filename):
    # TODO: åpne i append-modus, skriv str(num) + "\\n"
    pass


def fromFileToLst(filename):
    # TODO: returner liste av ints. Bruk try/except for FileNotFoundError.
    pass


def findAverage(lst):
    # TODO: returner sum(lst)/len(lst) eller 0 hvis tom liste
    pass


@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == "POST":
        num = int(request.form["tall"])
        writeToFile(num, SAVEFILE)

    tall = fromFileToLst(SAVEFILE)
    return f"Snitt av {len(tall)} tall: {findAverage(tall):.2f}"


# Test (kjør tre POSTs og verifiser snittet):
client = app.test_client()
print(client.post("/", data={"tall": "10"}).data.decode())
print(client.post("/", data={"tall": "20"}).data.decode())
print(client.post("/", data={"tall": "30"}).data.decode())
`,
    solution: `from flask import Flask, request

app = Flask(__name__)
SAVEFILE = "numbers.txt"


def writeToFile(num, filename):
    with open(filename, "a") as f:
        f.write(f"{num}\\n")


def fromFileToLst(filename):
    try:
        with open(filename, "r") as f:
            return [int(line.strip()) for line in f if line.strip()]
    except FileNotFoundError:
        return []


def findAverage(lst):
    if not lst:
        return 0
    return sum(lst) / len(lst)


@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == "POST":
        num = int(request.form["tall"])
        writeToFile(num, SAVEFILE)

    tall = fromFileToLst(SAVEFILE)
    return f"Snitt av {len(tall)} tall: {findAverage(tall):.2f}"


client = app.test_client()
print(client.post("/", data={"tall": "10"}).data.decode())
print(client.post("/", data={"tall": "20"}).data.decode())
print(client.post("/", data={"tall": "30"}).data.decode())
`,
    hints: [
      "open(filename, \"a\") åpner i append-modus — skriver til slutten uten å overskrive.",
      "Bruk \\n etter hvert tall så lesingen kan splitte på linjer senere.",
      "try/except FileNotFoundError — første gang før noe er skrevet finnes ikke filen.",
      "int(line.strip()) — strip fjerner \\n og whitespace; int() konverterer.",
    ],
    docs: [
      {
        title: "Hvorfor lære fil-persistens før databaser?",
        url: "https://github.com/reo303halo/DTE-2509-26V/blob/main/Flask_Basics/averageCalculator/app.py",
        note: "Kurset bruker dette i Modul 2 (averageCalculator) som bro mellom \"variabler glemmer alt\" og \"databasen krever oppsett\". Det viser hvorfor en ekte DB er bedre: flere brukere kan ikke skrive til samme fil uten korrupsjon, det finnes ingen spørringer, ingen typer, ingen transaksjoner.",
      },
      {
        title: "Python open() i append-modus",
        url: "https://docs.python.org/3/library/functions.html#open",
        note: "\"a\" = append (lager filen hvis den ikke finnes). \"r\" = read (krever at filen finnes). \"w\" = write (overskriver helt).",
      },
      {
        title: "Når går du over til ekte DB?",
        url: "https://flask.palletsprojects.com/en/stable/tutorial/database/",
        note: "Med én bruker og <1MB data fungerer .txt. Idet du har samtidig skriving, struktur (rader/kolonner), søk, eller behov for transaksjoner — bytt til SQLite eller MySQL.",
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

# === OPPGAVE ===
# • fetchall() returnerer liste av tupler — pakk ut med (n, e)

app = Flask(__name__)

def get_db():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

@app.route("/kunder")
def liste():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass


# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask
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

# === OPPGAVE ===
# • jsonify setter Content-Type=application/json automatisk

app = Flask(__name__)

@app.route("/api/kunder")
def api_kunder():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass


# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask, jsonify
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

# === OPPGAVE ===
# • abort(404) heaver Werkzeug-exception som Flask konverterer til HTTP 404
# • fetchone() returnerer None hvis ingen rad matcher

app = Flask(__name__)

@app.route("/kunde/<int:kundenr>")
def vis_kunde(kundenr):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass


# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask, abort
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
    id: "py-flask-secret-key-init",
    topic: "Flask + Session",
    title: "Primer: Sett SECRET_KEY",
    description:
      "Flask lagrer session-data hos brukeren (i en cookie), men signerer cookie-en med en hemmelig " +
      "nøkkel på server-en. Uten nøkkelen kaster Flask en `RuntimeError` så fort du leser eller " +
      "skriver session. Sett `app.secret_key` til en streng — i produksjon skal den være lang og " +
      "tilfeldig, i oppgaver/test holder en hardkodet streng.",
    requires: ["flask"],
    starter: `# === PRIMER: SECRET_KEY ===
#
# Flask lagrer session-data hos brukeren (i en cookie), men signerer
# cookie-en med en hemmelig nøkkel på server-siden. Uten den nøkkelen
# kaster Flask en RuntimeError så fort du leser eller skriver session.
#
# Den settes som et vanlig attribute på app-objektet:
#   app.secret_key = "..."
#
# I ekte produksjon: bruk \`secrets.token_hex(32)\` og lagre i en
# miljøvariabel — aldri commit den. I oppgaver/test kan en hardkodet
# streng være OK.
#
# OPPGAVE: Sett app.secret_key til en streng. Skriv ut
# \`app.config["SECRET_KEY"]\` for å bekrefte at den ble lagret —
# det er to navn på samme felt.

from flask import Flask

app = Flask(__name__)

# TODO: Skriv koden din her


print("Secret key er satt:", app.config["SECRET_KEY"] is not None)
`,
    solution: `from flask import Flask

app = Flask(__name__)
app.secret_key = "ikke-bruk-denne-i-produksjon"

print("Secret key er satt:", app.config["SECRET_KEY"] is not None)
`,
    hints: [
      "Det er bare ett attribute: `app.secret_key = \"...\"`.",
      "`app.config[\"SECRET_KEY\"]` returnerer samme verdi — det er to navn på samme felt.",
      "I produksjon skal nøkkelen være tilfeldig: `secrets.token_hex(32)`.",
    ],
    docs: [
      {
        title: "SECRET_KEY — hvorfor den må settes",
        url: "https://flask.palletsprojects.com/en/stable/config/#SECRET_KEY",
        note: "Uten SECRET_KEY får du RuntimeError første gang du leser session.",
        snippet: `app.secret_key = "tilfeldig-streng"`,
      },
    ],
  },
  {
    id: "py-flask-session-init",
    topic: "Flask + Session",
    title: "Primer: Skriv og les session",
    description:
      "`flask.session` ser ut som en dict, men er knyttet til brukeren via en signert cookie. Det du " +
      "skriver i én request er tilgjengelig i neste request fra samme bruker. Test-klienten beholder " +
      "cookies mellom kallene, så du kan demonstrere session-flow i én oppgave.",
    requires: ["flask"],
    starter: `# === PRIMER: Bruk session ===
#
# \`flask.session\` ser ut som en vanlig dict, men er knyttet til
# brukeren via en signert cookie. Det du skriver til session i én
# request er tilgjengelig i neste request fra samme bruker.
#
# Mønsteret:
#   from flask import session
#   session["nokkel"] = "verdi"        # vanligvis i POST /login
#   session.get("nokkel")               # i en GET som leser
#
# OPPGAVE: Lag to routes:
#   POST /set-navn   — setter session["navn"] = "Ola", returnerer "OK"
#   GET  /hent-navn  — returnerer "Hei, " + session.get("navn", "ukjent")
#
# Test-klienten beholder cookies mellom kallene under, så GET-en skal
# kunne lese det POST-en skrev.

from flask import Flask, session

app = Flask(__name__)
app.secret_key = "test-key"

# TODO: Lag de to routene her


client = app.test_client()
client.post("/set-navn")
resp = client.get("/hent-navn")
print(resp.data.decode())
`,
    solution: `from flask import Flask, session

app = Flask(__name__)
app.secret_key = "test-key"

@app.route("/set-navn", methods=["POST"])
def set_navn():
    session["navn"] = "Ola"
    return "OK"

@app.route("/hent-navn")
def hent_navn():
    return "Hei, " + session.get("navn", "ukjent")

client = app.test_client()
client.post("/set-navn")
resp = client.get("/hent-navn")
print(resp.data.decode())
`,
    hints: [
      "Importer `session` fra flask i tillegg til Flask.",
      "POST-route: `@app.route(\"/set-navn\", methods=[\"POST\"])`. GET er standard.",
      "Skriv med `session[\"navn\"] = \"Ola\"`. Les med `session.get(\"navn\", \"ukjent\")` — andre argument er default hvis nøkkelen mangler.",
    ],
    docs: [
      {
        title: "flask.session",
        url: "https://flask.palletsprojects.com/en/stable/api/#flask.session",
        note: "Dict-aktig objekt som persisterer mellom requests via signert cookie.",
        snippet: `from flask import session
session["bruker"] = "Ola"
session.get("bruker")`,
      },
    ],
  },
  {
    id: "py-flask-session",
    topic: "Sessions",
    title: "Session — lagre data mellom requester",
    description:
      "Sett en verdi i session, og les den i en annen route. Test at samme klient ser sin egen session via cookies.",
    requires: ["flask"],
    starter: `from flask import Flask, session

# === OPPGAVE ===
# • SECRET_KEY trengs — Flask signerer session-cookien med den
# • test_client() holder cookies mellom requester automatisk

app = Flask(__name__)
app.config["SECRET_KEY"] = "ikke-bruk-dette-i-produksjon"

@app.route("/sett/<navn>")
def sett(navn):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

@app.route("/hvem")
def hvem():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass


# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask, session

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
  // ---- Login-kjeden er splittet i 4 progressive steg slik at studenten
  // bygger én bit av gangen (decorator → POST/login → beskyttet rute → full test).
  {
    id: "py-functools-wraps-init",
    topic: "Decorators",
    title: "Primer: @wraps — bevar funksjonsnavnet",
    description:
      "Når du skriver en decorator (som `@login_required`), pakker den den indre funksjonen inn i en " +
      "wrapper. Uten `@wraps` mister den opprinnelige funksjonens `__name__` og du får Flask-feilen " +
      "\"View function mapping is overwriting an existing endpoint function\" hvis to routes ender " +
      "opp med samme navn. `@wraps(f)` fra `functools` kopierer over `__name__` og dokumentasjon.",
    requires: [],
    starter: `# === PRIMER: @wraps ===
#
# En decorator er en funksjon som returnerer en NY funksjon (wrapperen).
# Problemet er at wrapperen får sitt eget navn — den opprinnelige
# funksjonens __name__ forsvinner. Flask bruker __name__ til å
# registrere routes, og krasjer med:
#   "View function mapping is overwriting an existing endpoint function"
# hvis to routes ender opp med samme __name__.
#
# \`@wraps(f)\` fra functools fikser dette — den kopierer __name__, doc
# og andre attributter fra original-funksjonen til wrapperen.
#
# Mønsteret:
#   def min_decorator(f):
#       @wraps(f)
#       def wrapper(*args, **kwargs):
#           # før-logikk
#           return f(*args, **kwargs)
#       return wrapper
#
# OPPGAVE: Lag en decorator \`loud\` som printer "Kjører!" før funksjonen
# kalles. Bruk @wraps slik at original-navnet bevares. Skriv ut
# \`hilse.__name__\` etter at hilse er decorated — den skal fortsatt
# være "hilse", ikke "wrapper".

from functools import wraps

def loud(f):
    # TODO: Bygg wrapperen her, og bruk @wraps
    pass

@loud
def hilse():
    print("Hei!")

hilse()
print("Navn:", hilse.__name__)
`,
    solution: `from functools import wraps

def loud(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        print("Kjører!")
        return f(*args, **kwargs)
    return wrapper

@loud
def hilse():
    print("Hei!")

hilse()
print("Navn:", hilse.__name__)
`,
    hints: [
      "Wrapperen er en indre funksjon som tar `*args, **kwargs` og kaller `f(*args, **kwargs)`.",
      "Sett `@wraps(f)` på linja rett over `def wrapper(...)`.",
      "Husk å returnere wrapperen fra `loud(f)` — ellers blir hilse None.",
    ],
    docs: [
      {
        title: "functools.wraps",
        url: "https://docs.python.org/3/library/functools.html#functools.wraps",
        note: "Kopierer __name__, __doc__, __module__ osv. fra original-funksjonen til wrapperen.",
        snippet: `@wraps(f)
def wrapper(*args, **kwargs):
    return f(*args, **kwargs)`,
      },
    ],
  },
  {
    id: "py-flask-login-1-decorator",
    topic: "Login & sessions",
    title: "Login 1/4: Bygg login_required-decoratoren",
    description:
      "Aller første bit: lag en decorator som returnerer 401 hvis 'user_id' ikke ligger i session. Vi tester den mot en falsk view — ingen DB ennå.",
    requires: ["flask"],
    starter: `from flask import Flask, session
from functools import wraps

# === OPPGAVE ===
# • @wraps(view) bevarer navnet på view-funksjonen — viktig så Flask ikke kræsjer ved doble route-navn

app = Flask(__name__)
app.config["SECRET_KEY"] = "test"

# Bygg decoratoren her. Hint: bruk @wraps, sjekk session["user_id"],
# returnér ("Ikke innlogget", 401) hvis den mangler.
def login_required(view):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

@app.route("/skjult")
@login_required
def skjult():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

# Test:

# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask, session
from functools import wraps

app = Flask(__name__)
app.config["SECRET_KEY"] = "test"

# Bygg decoratoren her. Hint: bruk @wraps, sjekk session["user_id"],
# returnér ("Ikke innlogget", 401) hvis den mangler.
def login_required(view):
    @wraps(view)
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            return "Ikke innlogget", 401
        return view(*args, **kwargs)
    return wrapper

@app.route("/skjult")
@login_required
def skjult():
    return "Hemmelig innhold!"

# Test:
client = app.test_client()
print("Uten login:", client.get("/skjult").status_code)  # forventet 401

# Snikinnstilling av session for å bekrefte at decoratoren slipper deg gjennom:
with client.session_transaction() as s:
    s["user_id"] = 42
print("Med session:", client.get("/skjult").data.decode())  # "Hemmelig innhold!"
`,
    hints: [
      "@wraps(view) bevarer navnet på view-funksjonen — viktig så Flask ikke kræsjer ved doble route-navn",
      "session er en dict-aktig — sjekk med 'in', sett med session['nøkkel'] = verdi",
    ],
    docs: [
      {
        title: "functools.wraps",
        url: "https://docs.python.org/3/library/functools.html#functools.wraps",
        note: "Bevar __name__ og docstring når en decorator wrapper en annen funksjon.",
      },
    ],
  },

  {
    id: "py-flask-login-2-post-login",
    topic: "Login & sessions",
    title: "Login 2/4: POST /login som setter session",
    description:
      "Bygg login-routen alene. Den skal slå opp brukeren i kunde-tabellen og lagre kundenr i session ved riktig passord. Du trenger ikke decoratoren ennå.",
    requires: ["flask"],
    setup: DB_SETUP,
    starter: `from flask import Flask, session, request
import mysql.connector

# === OPPGAVE ===
# • Etter en post-login: hent ut session med client.session_transaction() — den skal inneholde 'user_id'
# • ADVARSEL: passordene her er KLARTEKST (anti-pattern). Se py-pwd-1/2/3 for riktig variant med werkzeug-hash.

app = Flask(__name__)
app.config["SECRET_KEY"] = "test"

@app.route("/login", methods=["POST"])
def login():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

# Test:

# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask, session, request
import mysql.connector

app = Flask(__name__)
app.config["SECRET_KEY"] = "test"

@app.route("/login", methods=["POST"])
def login():
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

# Test:
client = app.test_client()
print("Feil passord:", client.post("/login", data={"brukernavn":"Ola Nordmann","passord":"tull"}).status_code)
print("Riktig:      ", client.post("/login", data={"brukernavn":"Ola Nordmann","passord":"hash_av_hemmelig"}).data.decode())

# Bekreft at session ble satt:
with client.session_transaction() as s:
    print("Session etter login:", dict(s))
`,
    hints: [
      "Etter en post-login: hent ut session med client.session_transaction() — den skal inneholde 'user_id'",
      "ADVARSEL: passordene her er KLARTEKST (anti-pattern). Se py-pwd-1/2/3 for riktig variant med werkzeug-hash.",
    ],
  },

  {
    id: "py-flask-login-3-combine",
    topic: "Login & sessions",
    title: "Login 3/4: Beskytt /dashboard med decoratoren",
    description:
      "Sett sammen steg 1 (decoratoren) og steg 2 (login). Legg til en /dashboard som bruker @login_required og leser session['user_id'].",
    requires: ["flask"],
    setup: DB_SETUP,
    starter: `from flask import Flask, session, request, redirect, url_for
from functools import wraps
import mysql.connector

# === OPPGAVE ===
# • Fordi vi bruker redirect i decoratoren får /dashboard 302 i stedet for 401 når man ikke er innlogget
# • url_for('login') beregner '/login' fra navnet på funksjonen — aldri hardkod URLer i redirect

app = Flask(__name__)
app.config["SECRET_KEY"] = "test"

# Fra steg 1 — decoratoren. Vi har byttet 401 til redirect så uautoriserte
# blir sendt til login-skjemaet i stedet for å se en feilmelding.
def login_required(view):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

# Fra steg 2 — login-routen.
@app.route("/login", methods=["GET", "POST"])
def login():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

# Nytt i dette steget — legg til /dashboard som krever innlogging:
@app.route("/dashboard")
@login_required
def dashboard():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass


# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask, session, request, redirect, url_for
from functools import wraps
import mysql.connector

app = Flask(__name__)
app.config["SECRET_KEY"] = "test"

# Fra steg 1 — decoratoren. Vi har byttet 401 til redirect så uautoriserte
# blir sendt til login-skjemaet i stedet for å se en feilmelding.
def login_required(view):
    @wraps(view)
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            return redirect(url_for("login"))
        return view(*args, **kwargs)
    return wrapper

# Fra steg 2 — login-routen.
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

# Nytt i dette steget — legg til /dashboard som krever innlogging:
@app.route("/dashboard")
@login_required
def dashboard():
    return f"Velkommen, kunde {session['user_id']}"

client = app.test_client()
print("Dashboard uten login →", client.get("/dashboard").status_code)  # 302 redirect
`,
    hints: [
      "Fordi vi bruker redirect i decoratoren får /dashboard 302 i stedet for 401 når man ikke er innlogget",
      "url_for('login') beregner '/login' fra navnet på funksjonen — aldri hardkod URLer i redirect",
    ],
  },

  {
    id: "py-flask-login-4-full-test",
    topic: "Login & sessions",
    title: "Login 4/4: Test hele login-flyten ende-til-ende",
    description:
      "Samme app som steg 3, men nå med en full test-rekke som viser at uten-login → redirect, feil passord → 401, riktig passord → session beholdes og /dashboard svarer.",
    requires: ["flask"],
    setup: DB_SETUP,
    starter: `from flask import Flask, session, request, redirect, url_for
from functools import wraps
import mysql.connector

# === OPPGAVE ===
# • Status 1 skal være 302 (redirect), 2 skal være 401
# • Step 4 fungerer fordi test_client beholder session-cookien fra step 3
# • ADVARSEL: passordene i seed-data er KLARTEKST. Se py-pwd-3a/b/c for hvordan dette skal gjøres riktig (werkzeug.security + check_password_hash).

app = Flask(__name__)
app.config["SECRET_KEY"] = "test"

def login_required(view):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

@app.route("/login", methods=["GET", "POST"])
def login():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

@app.route("/dashboard")
@login_required
def dashboard():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass


# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask, session, request, redirect, url_for
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
      "ADVARSEL: passordene i seed-data er KLARTEKST. Se py-pwd-3a/b/c for hvordan dette skal gjøres riktig (werkzeug.security + check_password_hash).",
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
    solution: `import mysql.connector

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
    id: "py-pwd-hash-init",
    topic: "Passordhashing",
    title: "Primer: Hash et passord med werkzeug",
    description:
      "Aldri lagre passord i klartekst i databasen. Hvis databasen lekker er alle brukerkontoer " +
      "kompromittert. `werkzeug.security.generate_password_hash(passord)` lager en hash med " +
      "innebygd salt — så samme passord gir ULIK hash hver gang. Det er saltet i action.",
    requires: ["werkzeug"],
    starter: `# === PRIMER: Hash et passord ===
#
# Du skal ALDRI lagre passord som ren tekst i databasen. Hvis databasen
# lekker, er alle brukerkontoer kompromittert.
#
# werkzeug.security gir oss to funksjoner:
#   generate_password_hash("hemmelig")    -> lager hash + salt
#   check_password_hash(hash, "hemmelig") -> verifiserer (True/False)
#
# generate_password_hash returnerer en streng med algoritme + salt +
# selve hashen. Den ser anderledes ut hver gang — det er saltet som
# gjør den unik per kall. Du kan ikke "reversere" hashen.
#
# OPPGAVE: Hash strengen "passord123" to ganger og skriv ut begge.
# Skriv også ut om de er like — det skal være False, fordi saltet er
# forskjellig hver gang.

from werkzeug.security import generate_password_hash

# TODO: Skriv koden din her
`,
    solution: `from werkzeug.security import generate_password_hash

hash1 = generate_password_hash("passord123")
hash2 = generate_password_hash("passord123")
print(hash1)
print(hash2)
print("Like?", hash1 == hash2)
`,
    hints: [
      "`generate_password_hash(strengen)` returnerer hashen som streng — kall den to ganger med samme passord.",
      "Lagre begge i variabler, og skriv ut begge.",
      "Sammenlign med `==`. Resultatet skal være False — det er saltet som gjør hashene unike.",
    ],
    docs: [
      {
        title: "werkzeug.security — generate_password_hash",
        url: "https://werkzeug.palletsprojects.com/en/stable/utils/#werkzeug.security.generate_password_hash",
        note: "Lager hash med tilfeldig salt. Bruk `check_password_hash` for å verifisere senere.",
        snippet: `from werkzeug.security import generate_password_hash
hash = generate_password_hash("passord123")`,
      },
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
    solution: `from werkzeug.security import generate_password_hash, check_password_hash

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
    // ---- Sikker login-flyt splittet i 3 steg: tabell+hash → verify → full flyt
    id: "py-pwd-3a-build-table",
    topic: "Passord-sikkerhet",
    title: "Sikker login 1/3: Bygg bruker-tabell med hash-passord",
    description:
      "Lag en bruker-tabell og sett inn to brukere der passordene er hashet med generate_password_hash. Ingen Flask ennå — bare se at hash funker.",
    requires: ["flask"],
    starter: `from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector

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

# Sjekk at hashen er ekte — den skal IKKE være lik klartekst-passordet
cur.execute("SELECT brukernavn, passord_hash FROM bruker")
for navn, hash_ in cur.fetchall():
    print(f"{navn:5}  hash={hash_[:30]}...  passord-lik-hash? {hash_ == 'supersecret'}")

# Bekreft at check_password_hash kjenner igjen riktig passord:
cur.execute("SELECT passord_hash FROM bruker WHERE brukernavn = 'ola'")
ola_hash = cur.fetchone()[0]
print("ola riktig:", check_password_hash(ola_hash, "supersecret"))
print("ola feil:  ", check_password_hash(ola_hash, "tull"))
`,
    solution: `from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector

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

# Sjekk at hashen er ekte — den skal IKKE være lik klartekst-passordet
cur.execute("SELECT brukernavn, passord_hash FROM bruker")
for navn, hash_ in cur.fetchall():
    print(f"{navn:5}  hash={hash_[:30]}...  passord-lik-hash? {hash_ == 'supersecret'}")

# Bekreft at check_password_hash kjenner igjen riktig passord:
cur.execute("SELECT passord_hash FROM bruker WHERE brukernavn = 'ola'")
ola_hash = cur.fetchone()[0]
print("ola riktig:", check_password_hash(ola_hash, "supersecret"))
print("ola feil:  ", check_password_hash(ola_hash, "tull"))
`,
    hints: [
      "generate_password_hash legger til en tilfeldig salt — to like passord får forskjellig hash",
      "I en ekte registrerings-route ville hash genereres ved oppstart av brukerens valgte passord, ikke i seed-data",
    ],
    docs: [
      {
        title: "werkzeug.security",
        url: "https://werkzeug.palletsprojects.com/en/stable/utils/#werkzeug.security.generate_password_hash",
        note: "generate_password_hash + check_password_hash er Werkzeugs standardverktøy for sikker passord-hashing (med salt).",
      },
    ],
  },

  {
    id: "py-pwd-3b-verify-login",
    topic: "Passord-sikkerhet",
    title: "Sikker login 2/3: Login-route som bruker check_password_hash",
    description:
      "Bygg en /login som slår opp brukernavn UTEN å sammenligne passordet i SQL — hashen sjekkes i Python med check_password_hash. Tabellen er allerede satt opp for deg.",
    requires: ["flask"],
    starter: `from flask import Flask, request
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector

# Tabellen er bygget for deg (samme som steg 1):
# === OPPGAVE ===
# • Sammenlign med py-flask-login-2: der står 'WHERE navn=%s AND passord=%s' direkte i SQL — det krever klartekst
# • Her er passordet aldri i SQL-en. Hashen ligger i DB, sammenligning skjer i Python

db = mysql.connector.connect(database="auth_demo")
cur = db.cursor()
cur.execute("DROP TABLE IF EXISTS bruker")
cur.execute("CREATE TABLE bruker (id INTEGER PRIMARY KEY, brukernavn TEXT UNIQUE, passord_hash TEXT)")
cur.executemany(
    "INSERT INTO bruker (id, brukernavn, passord_hash) VALUES (%s, %s, %s)",
    [(1, "ola", generate_password_hash("supersecret"))],
)
db.commit()

app = Flask(__name__)

@app.route("/login", methods=["POST"])
def login():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

    db = mysql.connector.connect(database="auth_demo")
    cur = db.cursor()
    # MERK: SELECT-en henter ut HASHEN — den sammenligner ikke passord i SQL.
    cur.execute("SELECT id, passord_hash FROM bruker WHERE brukernavn = %s", (navn,))
    rad = cur.fetchone()
    if rad is None:
        return "Feil brukernavn eller passord", 401
    user_id, lagret_hash = rad
    if not check_password_hash(lagret_hash, passord):
        return "Feil brukernavn eller passord", 401
    return f"Innlogget som id={user_id}", 200


# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask, request
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector

# Tabellen er bygget for deg (samme som steg 1):
db = mysql.connector.connect(database="auth_demo")
cur = db.cursor()
cur.execute("DROP TABLE IF EXISTS bruker")
cur.execute("CREATE TABLE bruker (id INTEGER PRIMARY KEY, brukernavn TEXT UNIQUE, passord_hash TEXT)")
cur.executemany(
    "INSERT INTO bruker (id, brukernavn, passord_hash) VALUES (%s, %s, %s)",
    [(1, "ola", generate_password_hash("supersecret"))],
)
db.commit()

app = Flask(__name__)

@app.route("/login", methods=["POST"])
def login():
    navn    = request.form.get("brukernavn", "")
    passord = request.form.get("passord", "")

    db = mysql.connector.connect(database="auth_demo")
    cur = db.cursor()
    # MERK: SELECT-en henter ut HASHEN — den sammenligner ikke passord i SQL.
    cur.execute("SELECT id, passord_hash FROM bruker WHERE brukernavn = %s", (navn,))
    rad = cur.fetchone()
    if rad is None:
        return "Feil brukernavn eller passord", 401
    user_id, lagret_hash = rad
    if not check_password_hash(lagret_hash, passord):
        return "Feil brukernavn eller passord", 401
    return f"Innlogget som id={user_id}", 200

client = app.test_client()
print("Riktig:", client.post("/login", data={"brukernavn":"ola","passord":"supersecret"}).status_code)
print("Feil:  ", client.post("/login", data={"brukernavn":"ola","passord":"tull"}).status_code)
`,
    hints: [
      "Sammenlign med py-flask-login-2: der står 'WHERE navn=%s AND passord=%s' direkte i SQL — det krever klartekst",
      "Her er passordet aldri i SQL-en. Hashen ligger i DB, sammenligning skjer i Python",
    ],
  },

  {
    id: "py-pwd-3c-secure-flow",
    topic: "Passord-sikkerhet",
    title: "Sikker login 3/3: Full flyt med username-enumeration-forsvar",
    description:
      "Steg 2 ga forskjellig timing for 'ukjent bruker' og 'feil passord'. Nå returneres en identisk feilmelding for begge — så en angriper ikke kan finne ut om en konto eksisterer ved å prøve random brukernavn.",
    requires: ["flask"],
    starter: `from flask import Flask, request
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector

# === OPPGAVE ===
# • Sammenlign med py-flask-login (klartekst + direkte SQL): begge anti-mønstrene rettes her
# • Identisk feilmelding for 'ukjent bruker' og 'feil passord' — angripere skal ikke kunne enumerate eksisterende brukernavn

db = mysql.connector.connect(database="auth_demo")
cur = db.cursor()
cur.execute("DROP TABLE IF EXISTS bruker")
cur.execute("CREATE TABLE bruker (id INTEGER PRIMARY KEY, brukernavn TEXT UNIQUE, passord_hash TEXT)")
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
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

    db = mysql.connector.connect(database="auth_demo")
    cur = db.cursor()
    cur.execute("SELECT id, passord_hash FROM bruker WHERE brukernavn = %s", (navn,))
    rad = cur.fetchone()

    # Konstant feilmelding — angriperen kan ikke skille på status/respons
    # om brukernavnet finnes (forsvar mot username-enumeration):
    feilmelding = ("Feil brukernavn eller passord", 401)

    if rad is None:
        return feilmelding
    user_id, lagret_hash = rad
    if not check_password_hash(lagret_hash, passord):
        return feilmelding

    return f"Innlogget som id={user_id}", 200


# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask, request
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector

db = mysql.connector.connect(database="auth_demo")
cur = db.cursor()
cur.execute("DROP TABLE IF EXISTS bruker")
cur.execute("CREATE TABLE bruker (id INTEGER PRIMARY KEY, brukernavn TEXT UNIQUE, passord_hash TEXT)")
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
    cur.execute("SELECT id, passord_hash FROM bruker WHERE brukernavn = %s", (navn,))
    rad = cur.fetchone()

    # Konstant feilmelding — angriperen kan ikke skille på status/respons
    # om brukernavnet finnes (forsvar mot username-enumeration):
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
      "Sammenlign med py-flask-login (klartekst + direkte SQL): begge anti-mønstrene rettes her",
      "Identisk feilmelding for 'ukjent bruker' og 'feil passord' — angripere skal ikke kunne enumerate eksisterende brukernavn",
      "I en ekte registrerings-route: hash = generate_password_hash(request.form['passord']); INSERT INTO bruker ...",
      "Sammen med Flask-Login: erstatt `return f\"Innlogget...\"` med login_user(bruker) (se py-ext-flask-login)",
    ],
    docs: [
      {
        title: "Hash passord — werkzeug.security",
        url: "https://werkzeug.palletsprojects.com/en/stable/utils/#werkzeug.security.generate_password_hash",
        note: "I produksjon: lagre `generate_password_hash(passord)`. Sjekk login med `check_password_hash(stored, input)`. ALDRI lagre klartekst-passord.",
      },
      {
        title: "OWASP — Authentication Cheat Sheet",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html",
        note: "Beskriver bl.a. username-enumeration-forsvar — identisk respons og responstid for alle login-feil.",
      },
    ],
  },

  // ============ CSRF ============
  // Splittet i 3 steg: token-generering → verifisering → full angreps-test
  {
    id: "py-csrf-token-init",
    topic: "CSRF",
    title: "Primer: Generer en CSRF-token",
    description:
      "CSRF-tokens er kryptografisk tilfeldige strenger som server-en genererer for hvert skjema. " +
      "Token-en må være tilfeldig — IKKE `random.choice` eller `uuid` — bruk `secrets`-modulen. " +
      "`secrets.token_hex(16)` lager en streng med 32 hex-tegn (én byte = to hex-tegn).",
    requires: [],
    starter: `# === PRIMER: Generer en CSRF-token ===
#
# CSRF-angrep skjer når et ondsinnet nettsted lokker brukeren din til å
# sende en POST til ditt API mens de er logget inn. Forsvaret er en
# token som:
#   1) genereres på server, lagres i session,
#   2) embeddes i hvert skjema som <input type="hidden">,
#   3) sjekkes mot session-token-en ved POST.
#
# Token-en må være kryptografisk tilfeldig — IKKE \`random.choice\`,
# IKKE \`uuid\` — bruk \`secrets\`-modulen.
#
# Vanlige funksjoner:
#   secrets.token_hex(16)      -> 32 hex-tegn  (16 bytes * 2)
#   secrets.token_urlsafe(16)  -> base64url, kortere men ikke hex
#
# OPPGAVE: Importer secrets, generer en token med 16 bytes, og skriv
# ut tokenen + lengden. Lengden skal bli 32 (én byte = to hex-tegn).

# TODO: Skriv koden din her
`,
    solution: `import secrets

token = secrets.token_hex(16)
print("Token:", token)
print("Lengde:", len(token))
`,
    hints: [
      "`import secrets` — det er en standard-modul som følger med Python, ingen pip nødvendig.",
      "`secrets.token_hex(16)` — argumentet er antall BYTES, ikke antall tegn.",
      "Hver byte blir 2 hex-tegn, så 16 bytes blir 32 tegn. Bruk `len(token)` for å sjekke.",
    ],
    docs: [
      {
        title: "secrets.token_hex",
        url: "https://docs.python.org/3/library/secrets.html#secrets.token_hex",
        note: "Kryptografisk sikker tilfeldig hex-streng — riktig valg for tokens, ikke `random`.",
        snippet: `import secrets
token = secrets.token_hex(16)   # 32 hex-tegn`,
      },
    ],
  },
  {
    id: "py-flask-csrf-1-token",
    topic: "CSRF",
    title: "CSRF 1/3: Generer og embed token i skjema",
    description:
      "Lag en hjelper get_csrf_token() som lagrer en tilfeldig token i session, og en /skjema-route som plasserer den i et <input hidden>. Vi lagrer ingenting og verifiserer ingenting ennå.",
    requires: ["flask"],
    starter: `from flask import Flask, session
import secrets

# === OPPGAVE ===
# • secrets.token_hex(16) gir 32 hex-tegn — kryptografisk tilfeldig
# • session er signert med SECRET_KEY så klienten ikke kan endre tokenen utenfra

app = Flask(__name__)
app.config["SECRET_KEY"] = "test"

def get_csrf_token():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

@app.route("/skjema")
def skjema():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

# Test:

# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask, session
import secrets

app = Flask(__name__)
app.config["SECRET_KEY"] = "test"

def get_csrf_token():
    # Hvis session ikke har en token, lag en ny og lagre den
    if "csrf" not in session:
        session["csrf"] = secrets.token_hex(16)
    return session["csrf"]

@app.route("/skjema")
def skjema():
    token = get_csrf_token()
    return f'<form method="POST" action="/lagre"><input type="hidden" name="csrf" value="{token}">...</form>'

# Test:
client = app.test_client()
html = client.get("/skjema").data.decode()
print("HTML inneholder hidden input:", 'name="csrf"' in html)

# Hent ut tokenen — vi bruker den i steg 2
import re
token = re.search(r'value="([a-f0-9]+)"', html).group(1)
print("Generert token:", token, "(lengde:", len(token), ")")
`,
    hints: [
      "secrets.token_hex(16) gir 32 hex-tegn — kryptografisk tilfeldig",
      "session er signert med SECRET_KEY så klienten ikke kan endre tokenen utenfra",
    ],
    docs: [
      {
        title: "secrets.token_hex",
        url: "https://docs.python.org/3/library/secrets.html#secrets.token_hex",
        note: "Kryptografisk trygg tilfeldig hex-streng. Bruk denne, ikke random.choice().",
      },
    ],
  },

  {
    id: "py-flask-csrf-2-verify",
    topic: "CSRF",
    title: "CSRF 2/3: Verifiser token på POST",
    description:
      "Bygg /lagre-routen som sammenligner submitted token mot session['csrf']. Hvis de ikke matcher → 403. Skjema-routen fra steg 1 er gjenbrukt.",
    requires: ["flask"],
    starter: `from flask import Flask, session, request
import secrets

# === OPPGAVE ===
# • session.get('csrf', '') gir tom streng hvis det ikke finnes — så 'submitted == expected' alltid feiler når brukeren ikke har vært via /skjema
# • I ekte kode bruker man hmac.compare_digest for å unngå timing-angrep ved sammenligning

app = Flask(__name__)
app.config["SECRET_KEY"] = "test"

# Fra steg 1:
def get_csrf_token():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

@app.route("/skjema")
def skjema():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

# Nytt i dette steget — verifisering:
@app.route("/lagre", methods=["POST"])
def lagre():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

# Test riktig token-flyt:

# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask, session, request
import secrets

app = Flask(__name__)
app.config["SECRET_KEY"] = "test"

# Fra steg 1:
def get_csrf_token():
    if "csrf" not in session:
        session["csrf"] = secrets.token_hex(16)
    return session["csrf"]

@app.route("/skjema")
def skjema():
    token = get_csrf_token()
    return f'<form method="POST" action="/lagre"><input type="hidden" name="csrf" value="{token}">...</form>'

# Nytt i dette steget — verifisering:
@app.route("/lagre", methods=["POST"])
def lagre():
    submitted = request.form.get("csrf", "")
    expected = session.get("csrf", "")
    if not expected or submitted != expected:
        return "CSRF-feil — avvist", 403
    return "Lagret", 200

# Test riktig token-flyt:
client = app.test_client()
html = client.get("/skjema").data.decode()
import re
token = re.search(r'value="([a-f0-9]+)"', html).group(1)
print("Med riktig token:", client.post("/lagre", data={"navn":"Ola","csrf":token}).status_code)
`,
    hints: [
      "session.get('csrf', '') gir tom streng hvis det ikke finnes — så 'submitted == expected' alltid feiler når brukeren ikke har vært via /skjema",
      "I ekte kode bruker man hmac.compare_digest for å unngå timing-angrep ved sammenligning",
    ],
  },

  {
    id: "py-flask-csrf-3-attack-test",
    topic: "CSRF",
    title: "CSRF 3/3: Test alle angreps-scenarier",
    description:
      "Samme app som steg 2, men med en full test-rekke som dekker (1) skjema-lasting, (2) POST uten token, (3) POST med riktig token, (4) POST med fake token. Bekreft at avvisningen er konsekvent.",
    requires: ["flask"],
    starter: `from flask import Flask, session, request
import secrets

# === OPPGAVE ===
# • Forventet: 2 → 403, 3 → 200, 4 → 403
# • I ekte kode bruker man Flask-WTF som genererer + verifiserer token automatisk

app = Flask(__name__)
app.config["SECRET_KEY"] = "test"

def get_csrf_token():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

@app.route("/skjema")
def skjema():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

@app.route("/lagre", methods=["POST"])
def lagre():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass


# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask, session, request
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

# === OPPGAVE ===
# • Forventet: 1 og 2 → 401, 3 → 200 + liste med kunder
# • I produksjon: bruk JWT eller OAuth, ikke en hardkodet token

app = Flask(__name__)
API_TOKEN = "hemmelig-token-123"

def auth_ok():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

@app.route("/api/kunder")
def api_kunder():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass


# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask, request, jsonify
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
  // Splittet i 3 steg: GET → POST (Created) → DELETE med 404
  {
    id: "py-flask-rest-1-get",
    topic: "REST / API",
    title: "REST 1/3: GET /kunder — list ressurser",
    description:
      "Bygg det enkleste REST-endepunktet: GET /kunder som returnerer alle kunder som JSON-array. Vi legger til POST og DELETE i de neste stegene.",
    requires: ["flask"],
    setup: DB_SETUP,
    starter: `from flask import Flask, jsonify
import mysql.connector

# === OPPGAVE ===
# • jsonify() setter Content-Type til application/json automatisk og serialiserer dict/list
# • List comprehension over fetchall() konverterer rader til dict — godt mønster for små JSON-svar

app = Flask(__name__)

def db():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

@app.route("/kunder", methods=["GET"])
def liste():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass


# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask, jsonify
import mysql.connector

app = Flask(__name__)

def db():
    return mysql.connector.connect(database="exam")

@app.route("/kunder", methods=["GET"])
def liste():
    cur = db().cursor()
    cur.execute("SELECT kundenr, navn FROM kunde")
    return jsonify([{"kundenr": k, "navn": n} for k, n in cur.fetchall()])

client = app.test_client()
r = client.get("/kunder")
print("Status:", r.status_code)
print("Body:  ", r.get_json())
`,
    hints: [
      "jsonify() setter Content-Type til application/json automatisk og serialiserer dict/list",
      "List comprehension over fetchall() konverterer rader til dict — godt mønster for små JSON-svar",
    ],
    docs: [
      {
        title: "flask.jsonify",
        url: "https://flask.palletsprojects.com/en/stable/api/#flask.json.jsonify",
        note: "Konverterer dict/list til JSON-respons med riktig Content-Type.",
      },
    ],
  },

  {
    id: "py-flask-rest-2-post",
    topic: "REST / API",
    title: "REST 2/3: POST /kunder — opprett ny ressurs",
    description:
      "Legg til POST-routen. Den skal lese JSON-body, INSERT i DB, committe, og returnere 201 Created med id-en til den nye ressursen.",
    requires: ["flask"],
    setup: DB_SETUP,
    starter: `from flask import Flask, request, jsonify
import mysql.connector

# === OPPGAVE ===
# • request.get_json() parser JSON-bodyen til dict
# • 201 Created er konvensjonen for 'ny ressurs opprettet' — ikke 200
# • d.commit() er nødvendig — uten den skjer INSERT bare i transaksjonen og blir ikke synlig for senere kall

app = Flask(__name__)

def db():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

# Fra steg 1:
@app.route("/kunder", methods=["GET"])
def liste():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

# Nytt i dette steget:
@app.route("/kunder", methods=["POST"])
def opprett():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass


# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask, request, jsonify
import mysql.connector

app = Flask(__name__)

def db():
    return mysql.connector.connect(database="exam")

# Fra steg 1:
@app.route("/kunder", methods=["GET"])
def liste():
    cur = db().cursor()
    cur.execute("SELECT kundenr, navn FROM kunde")
    return jsonify([{"kundenr": k, "navn": n} for k, n in cur.fetchall()])

# Nytt i dette steget:
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

client = app.test_client()
print("Før:    ", client.get("/kunder").get_json())
print("POST:   ", client.post("/kunder", json={"kundenr": 99, "navn": "Ny Kunde"}).status_code)
print("Etter:  ", client.get("/kunder").get_json())
`,
    hints: [
      "request.get_json() parser JSON-bodyen til dict",
      "201 Created er konvensjonen for 'ny ressurs opprettet' — ikke 200",
      "d.commit() er nødvendig — uten den skjer INSERT bare i transaksjonen og blir ikke synlig for senere kall",
    ],
    docs: [
      {
        title: "request.get_json()",
        url: "https://flask.palletsprojects.com/en/stable/api/#flask.Request.get_json",
        note: "Parser request-body som JSON. Returnerer dict/list. Bruk silent=True for å unngå exception ved ugyldig JSON.",
      },
    ],
  },

  {
    id: "py-flask-rest-3-delete-404",
    topic: "REST / API",
    title: "REST 3/3: DELETE /kunder/<id> — med 404 når ressursen mangler",
    description:
      "Legg til DELETE som sletter på id og returnerer 204 No Content. Hvis cursor.rowcount er 0 → 404 (kundene fantes ikke). Sett sammen alt for full GET/POST/DELETE-test.",
    requires: ["flask"],
    setup: DB_SETUP,
    starter: `from flask import Flask, request, jsonify, abort
import mysql.connector

# === OPPGAVE ===
# • 201 Created etter POST, 204 No Content etter DELETE, 404 hvis ressursen ikke finnes
# • abort(404) hopper rett ut av view-funksjonen og returnerer Flasks default 404-respons

app = Flask(__name__)

def db():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

@app.route("/kunder", methods=["GET"])
def liste():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

@app.route("/kunder", methods=["POST"])
def opprett():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

# Nytt i dette steget — DELETE med 404-håndtering:
@app.route("/kunder/<int:kundenr>", methods=["DELETE"])
def slett(kundenr):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass


# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask, request, jsonify, abort
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

# Nytt i dette steget — DELETE med 404-håndtering:
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
      "abort(404) hopper rett ut av view-funksjonen og returnerer Flasks default 404-respons",
    ],
    docs: [
      {
        title: "REST resource conventions",
        url: "https://restfulapi.net/resource-naming/",
        note: "Substantiv i flertall (`/kunder`), HTTP-verb sier hva som skal skje. ID-en i path: `/kunder/<id>`.",
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
    solution: `import mysql.connector

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
    solution: `import mysql.connector

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
    solution: `import mysql.connector

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
    solution: `import mysql.connector

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
    solution: `import mysql.connector

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
    solution: `import mysql.connector
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
    solution: `client = app.test_client()
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
    solution: `client = app.test_client()
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
    solution: `client = app.test_client()

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
    solution: `client = app.test_client()

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
    solution: `client = app.test_client()

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
    solution: `client = app.test_client()

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
    solution: `client = app.test_client()
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
# === OPPGAVE ===
# • primary_key=True gjør id auto-increment i SQLite
# • unique=True + index=True er to forskjellige ting — unique er en constraint, index gjør oppslag raskere

class Base(so.DeclarativeBase):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

class User(Base):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

    def __repr__(self):
        # TODO: Skriv koden her — se beskrivelsen og hintene.
        pass

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
    solution: `import sqlalchemy as sa
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

# === OPPGAVE ===
# • session.add() planlegger INSERT — commit() utfører den
# • Etter commit får objektet sin id automatisk (auto-increment)
# • session.scalars(query) returnerer instanser (User-objekter); session.execute(query) returnerer Row-objekter
# • I Flask-SQLAlchemy er dette db.session.add() / db.session.commit() — samme API

class Base(so.DeclarativeBase):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

class User(Base):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

    def __repr__(self):
        # TODO: Skriv koden her — se beskrivelsen og hintene.
        pass

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
    solution: `import sqlalchemy as sa
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

# === OPPGAVE ===
# • session.get returnerer None (ikke exception) hvis raden ikke finnes — tilsvarer Flask sin db.get_or_404()-pattern
# • User.username.like('o%') — % er wildcard, akkurat som SQL LIKE
# • .first() returnerer første treff eller None; .one() krever nøyaktig ett treff (exception ellers)
# • I Mega-Tutorial Part IV brukes nøyaktig dette mønsteret i shell-en

class Base(so.DeclarativeBase):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

class User(Base):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

    def __repr__(self):
        # TODO: Skriv koden her — se beskrivelsen og hintene.
        pass

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
    solution: `import sqlalchemy as sa
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

# === OPPGAVE ===
# • order_by(...).limit(n).offset(m) er klassisk paginering — limit + offset
# • I Flask-SQLAlchemy: db.paginate(query, page=2, per_page=2) — samme greie pakket inn
# • Husk at uten ORDER BY er rekkefølgen udefinert — derfor ALLTID order_by før limit

class Base(so.DeclarativeBase):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

class User(Base):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

    def __repr__(self):
        # TODO: Skriv koden her — se beskrivelsen og hintene.
        pass

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
    solution: `import sqlalchemy as sa
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

# === OPPGAVE ===
# • back_populates på BEGGE sider — knytter author ↔ posts sammen, så endringer på en side speiles automatisk
# • default=lambda: datetime.now(timezone.utc) — lambdaen kjører ved INSERT, så hver rad får sin egen timestamp (default=datetime.now(timezone.utc) ville frosset tiden ved import)

class Base(so.DeclarativeBase):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

class User(Base):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

    # Forward-ref med streng — Post er ikke definert enda:
    posts: so.Mapped[list["Post"]] = so.relationship(back_populates="author")

    def __repr__(self):
        # TODO: Skriv koden her — se beskrivelsen og hintene.
        pass

class Post(Base):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

    author: so.Mapped[User] = so.relationship(back_populates="posts")

    def __repr__(self):
        # TODO: Skriv koden her — se beskrivelsen og hintene.
        pass

engine = sa.create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

inspector = sa.inspect(engine)
print("Tabeller:", inspector.get_table_names())
print("post-kolonner:", [c["name"] for c in inspector.get_columns("post")])
print("post FK:")
for fk in inspector.get_foreign_keys("post"):
    print(" ", fk["constrained_columns"], "→", fk["referred_table"], fk["referred_columns"])
`,
    solution: `import sqlalchemy as sa
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
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

class User(Base):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

class Post(Base):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

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
    solution: `import sqlalchemy as sa
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

# === OPPGAVE ===
# • Du skriver aldri UPDATE/DELETE selv — endre attributtet eller kall session.delete(), commit gjør jobben
# • rollback() fungerer bare på endringer som IKKE er commit-et enda — committed data er borte for godt
# • session.refresh(obj) tvinger en ny SELECT etter rollback så Python-objektet matcher DB
# • I produksjon: pakk endringer i try/except og rollback ved feil — så atomicity holder selv ved exceptions

class Base(so.DeclarativeBase):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

class User(Base):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

    def __repr__(self):
        # TODO: Skriv koden her — se beskrivelsen og hintene.
        pass

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
    solution: `import sqlalchemy as sa
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

# === OPPGAVE ===
# • with SessionLocal() as s: gir auto-close — ingen lekkende DB-tilkoblinger
# • Sammenlign med py-flask-json-api: identisk respons, men null SQL-strenger i Python-koden
# • I Flask-SQLAlchemy bytter du sessionmaker med db.session — den er bundet til app-konteksten og ryddes opp etter hver request automatisk
# • to_dict()-metoden er en vanlig pattern; større prosjekter bruker biblioteket marshmallow eller pydantic for serialisering

class Base(so.DeclarativeBase):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

class User(Base):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

    def to_dict(self):
        # TODO: Skriv koden her — se beskrivelsen og hintene.
        pass

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
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

@app.route("/api/users/<int:user_id>", methods=["GET"])
def detalj(user_id):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

@app.route("/api/users", methods=["POST"])
def opprett():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass


# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask, jsonify, abort, request
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
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

print(f"\\nFlask-config:")
print(f"  SECRET_KEY: {Config.SECRET_KEY[:12]}…")
print(f"  DATABASE_URI: {Config.SQLALCHEMY_DATABASE_URI}")
print(f"  DEBUG: {Config.DEBUG} ({type(Config.DEBUG).__name__})")
`,
    solution: `import os
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
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

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
    solution: `from wtforms import Form, StringField, PasswordField, IntegerField
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

# === OPPGAVE ===
# • validate_on_submit() = is_submitted() AND validate() — den korte versjonen i hver POST-handler
# • FlaskForm() trenger ingen argument — den henter request.form automatisk fra Flask sin context
# • I produksjon: WTF_CSRF_ENABLED=True (default). Da må skjemaet inneholde {{ form.csrf_token }} i Jinja-template
# • Sammenlign med py-flask-csrf — der var token-håndteringen manuell. Flask-WTF gjør det usynlig.

app = Flask(__name__)
app.config["SECRET_KEY"] = "test-key"
# I PRODUKSJON: la denne være True (default). Her skrur vi av for at
# test_client skal slippe å hente token først.
app.config["WTF_CSRF_ENABLED"] = False

class LoginForm(FlaskForm):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

@app.route("/login", methods=["POST"])
def login():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass


# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask
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
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

form = KontaktForm(data={"epost": "ola@test"})
print("WTForms Email() — ugyldig:", form.validate(), form.errors)

form = KontaktForm(data={"epost": "ola@test.no"})
print("WTForms Email() — gyldig:", form.validate(), form.epost.data)
`,
    solution: `from email_validator import validate_email, EmailNotValidError

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
# === OPPGAVE ===
# • UserMixin gir gratis-implementasjoner av is_authenticated, is_active, is_anonymous, get_id() — du slipper å skrive dem
# • login_user(user) setter cookie + session. logout_user() fjerner. Du rører aldri session selv.
# • current_user fungerer i alle views OG i Jinja-templates: {% if current_user.is_authenticated %} ...
# • Sammenlign med py-flask-login: der hadde vi 12+ linjer kode for å bygge @login_required selv — her er det én import
# • Passordene 'supersecret' / 'passord1234' er KLARTEKST her av pedagogiske grunner. I produksjon: generate_password_hash ved registrering, check_password_hash i login_user-flyten — se py-pwd-3-secure-login.

    LoginManager, UserMixin,
    login_user, logout_user, login_required, current_user,
)

app = Flask(__name__)
app.config["SECRET_KEY"] = "test-key"

login_manager = LoginManager(app)
login_manager.login_view = "login"  # Hvor uautentiserte sendes via redirect

# User-klassen må arve UserMixin — det gir is_authenticated, is_active, get_id() osv. gratis.
class Bruker(UserMixin):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

# Stand-in for en ekte DB:
brukere = {
    1: Bruker(1, "ola", "supersecret"),
    2: Bruker(2, "kari", "passord1234"),
}

# Flask-Login spør oss: gi meg User-objektet for denne id-en
@login_manager.user_loader
def load_user(user_id):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

@app.route("/login", methods=["POST"])
def login():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

@app.route("/profil")
@login_required
def profil():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

@app.route("/logout")
@login_required
def logout():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass


# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask, request
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

  // ============ APP-ARKITEKTUR ============
  // Broa fra "leketøy" (alt i én fil med `app = Flask(__name__)`) til
  // "ekte prosjekt" (mange filer, blueprints, late-binding extensions).
  // Mega-Tutorial Part XV behandler dette i detalj. Plattformen kjører
  // hver oppgave som én fil, så vi simulerer mappestruktur med tydelige
  // # === app/auth/__init__.py ===-kommentarer. Patternene er identiske.
  {
    id: "py-arch-1-factory",
    topic: "App-arkitektur",
    title: "Application factory: create_app() istedenfor global app",
    description:
      "Hittil i pensum har du sett `app = Flask(__name__)` på modul-nivå. Det fungerer for små eksempler, men gjør tester vanskelige (kan ikke opprette en separat app med TESTING=True) og roter til imports. Løsningen: pakk app-opprettelsen i en funksjon. Mega-Tutorial bytter til dette mønsteret i Part XV.",
    requires: ["flask"],
    starter: `from flask import Flask

# === DET NAIVE MØNSTERET (slik alle Flask-øvelsene har gjort hittil) ===
# app = Flask(__name__)
# app.config["SECRET_KEY"] = "test"
# @app.route("/") ...
#
# Problem: ÉN app per Python-prosess. Tester får ingen egen instans
# med ulik config. Module-level imports trigger Flask-oppstart.

# === APPLICATION FACTORY-MØNSTERET ===
# === OPPGAVE ===
# • I et ekte prosjekt: create_app() ligger i app/__init__.py og kalles fra wsgi.py / run.py / conftest.py
# • config_class-parameter er vanligere enn dict — class Config / class TestConfig(Config) gir typed config med arv
# • Du kan ikke lenger bruke 'from app import app' i blueprints — bruk 'from flask import current_app' istedenfor når du er INNE i en request
# • Mega-Tutorial Part XV viser nøyaktig denne refaktoreringen fra global app til create_app

def create_app(config: dict):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

    @app.route("/info")
    def info():
        # TODO: Skriv koden her — se beskrivelsen og hintene.
        pass

    return app


# Lag to UAVHENGIGE app-instanser med ulik config:
prod_app = create_app({
    "SECRET_KEY": "prod-key-aldri-i-git",
})
test_app = create_app({
    "SECRET_KEY": "test-key",
    "TESTING": True,
})

print("Prod-app: ", prod_app.test_client().get("/info").data.decode())
print("Test-app: ", test_app.test_client().get("/info").data.decode())
print()
print("Hvorfor verdt det:")
print("  • Tester kan opprette egen app med TESTING=True og separat in-memory DB")
print("  • Module-level 'from app import db' trigger ikke Flask-oppstart")
print("  • All config + extension-binding samlet ett sted (create_app)")
print("  • Du kan kjøre flere instanser i samme prosess (sjeldent, men mulig)")
`,
    solution: `from flask import Flask

# === DET NAIVE MØNSTERET (slik alle Flask-øvelsene har gjort hittil) ===
# app = Flask(__name__)
# app.config["SECRET_KEY"] = "test"
# @app.route("/") ...
#
# Problem: ÉN app per Python-prosess. Tester får ingen egen instans
# med ulik config. Module-level imports trigger Flask-oppstart.

# === APPLICATION FACTORY-MØNSTERET ===
def create_app(config: dict):
    """Bygg og returner en ny Flask-app-instans. Hele appen lever inne her."""
    app = Flask(__name__)
    app.config.update(config)

    @app.route("/info")
    def info():
        return f"App: {app.name} | secret={app.config['SECRET_KEY'][:6]}… | testing={app.config.get('TESTING', False)}"

    return app


# Lag to UAVHENGIGE app-instanser med ulik config:
prod_app = create_app({
    "SECRET_KEY": "prod-key-aldri-i-git",
})
test_app = create_app({
    "SECRET_KEY": "test-key",
    "TESTING": True,
})

print("Prod-app: ", prod_app.test_client().get("/info").data.decode())
print("Test-app: ", test_app.test_client().get("/info").data.decode())
print()
print("Hvorfor verdt det:")
print("  • Tester kan opprette egen app med TESTING=True og separat in-memory DB")
print("  • Module-level 'from app import db' trigger ikke Flask-oppstart")
print("  • All config + extension-binding samlet ett sted (create_app)")
print("  • Du kan kjøre flere instanser i samme prosess (sjeldent, men mulig)")
`,
    hints: [
      "I et ekte prosjekt: create_app() ligger i app/__init__.py og kalles fra wsgi.py / run.py / conftest.py",
      "config_class-parameter er vanligere enn dict — class Config / class TestConfig(Config) gir typed config med arv",
      "Du kan ikke lenger bruke 'from app import app' i blueprints — bruk 'from flask import current_app' istedenfor når du er INNE i en request",
      "Mega-Tutorial Part XV viser nøyaktig denne refaktoreringen fra global app til create_app",
    ],
  },
  {
    id: "py-arch-2-blueprint",
    topic: "App-arkitektur",
    title: "Blueprints: del routes opp i moduler med url_prefix",
    description:
      "Når en Flask-app vokser blir én routes.py uleselig. Blueprint er Flask sin måte å gruppere routes (og senere views, error handlers, og statiske filer) i selvstendige moduler. Vi simulerer to 'filer' her — auth-bp og main-bp — og registrerer begge i create_app.",
    requires: ["flask"],
    starter: `from flask import Flask, Blueprint, url_for

# === ville vært i app/auth/__init__.py ===
# Auth-relaterte routes: /auth/login, /auth/logout, /auth/registrer
# === OPPGAVE ===
# • Inne i en blueprint: bruk url_for('auth.login') ikke url_for('login') — Flask trenger blueprint-navnet som scope
# • Inne i SAMME blueprint kan du droppe prefiks: url_for('.login') = url_for('auth.login') hvis du allerede er i auth_bp
# • Blueprints kan ha egne templates/-mapper (template_folder='templates') og statiske filer — full modulær separasjon
# • Du kan registrere samme blueprint flere ganger med ulik url_prefix — sjelden brukt, men nyttig for f.eks. /api/v1 vs /api/v2

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login")
def login():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

@auth_bp.route("/logout")
def logout():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass


# === ville vært i app/main/__init__.py ===
# Hovedroute-grupper: forsiden og profil
main_bp = Blueprint("main", __name__)

@main_bp.route("/")
def index():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

@main_bp.route("/profil")
def profil():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass


# === ville vært i app/__init__.py — create_app() ===
def create_app():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

    # url_prefix gir auth-routes prefiks /auth/...
    app.register_blueprint(auth_bp, url_prefix="/auth")
    # main_bp får ingen prefix — den eier rot-pathene
    app.register_blueprint(main_bp)

    return app


app = create_app()

# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask, Blueprint, url_for

# === ville vært i app/auth/__init__.py ===
# Auth-relaterte routes: /auth/login, /auth/logout, /auth/registrer
auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login")
def login():
    return "auth.login — login-side"

@auth_bp.route("/logout")
def logout():
    return "auth.logout — logget ut"


# === ville vært i app/main/__init__.py ===
# Hovedroute-grupper: forsiden og profil
main_bp = Blueprint("main", __name__)

@main_bp.route("/")
def index():
    return "main.index — forsiden"

@main_bp.route("/profil")
def profil():
    return "main.profil — min profil"


# === ville vært i app/__init__.py — create_app() ===
def create_app():
    app = Flask(__name__)

    # url_prefix gir auth-routes prefiks /auth/...
    app.register_blueprint(auth_bp, url_prefix="/auth")
    # main_bp får ingen prefix — den eier rot-pathene
    app.register_blueprint(main_bp)

    return app


app = create_app()
client = app.test_client()

# Sjekk at alle routene er registrert med riktig prefix:
print("Forsiden:    ", client.get("/").data.decode())
print("Profil:      ", client.get("/profil").data.decode())
print("Login:       ", client.get("/auth/login").data.decode())
print("Logout:      ", client.get("/auth/logout").data.decode())
print()

# url_for med blueprint-prefiks: bruk "blueprint_navn.view_navn"
with app.test_request_context():
    print("url_for('auth.login') →", url_for("auth.login"))
    print("url_for('main.index') →", url_for("main.index"))
    print("url_for('main.profil')→", url_for("main.profil"))
`,
    hints: [
      "Inne i en blueprint: bruk url_for('auth.login') ikke url_for('login') — Flask trenger blueprint-navnet som scope",
      "Inne i SAMME blueprint kan du droppe prefiks: url_for('.login') = url_for('auth.login') hvis du allerede er i auth_bp",
      "Blueprints kan ha egne templates/-mapper (template_folder='templates') og statiske filer — full modulær separasjon",
      "Du kan registrere samme blueprint flere ganger med ulik url_prefix — sjelden brukt, men nyttig for f.eks. /api/v1 vs /api/v2",
    ],
  },
  {
    id: "py-arch-3-extensions-init-app",
    topic: "App-arkitektur",
    title: "Late-binding extensions: db.init_app(app) i factory-en",
    description:
      "Det siste arkitektur-prinsippet som binder alt sammen: opprett extensions UTEN app på modul-nivå (db = SQLAlchemy(), login_manager = LoginManager()), og knytt dem til appen via init_app() inne i create_app(). Dette er HVORFOR factory-mønsteret eksisterer — det lar blueprints importere extensions uten sirkulære imports.",
    requires: ["flask", "flask-login"],
    starter: `from flask import Flask, Blueprint, request
from flask_login import (
# === OPPGAVE ===
# • Hvorfor late binding? Blueprint i app/auth/routes.py har \\"from app.extensions import login_manager\\" øverst — det funker fordi instansen finnes UTEN app, og init_app() knytter den senere.
# • Samme mønster gjelder Flask-SQLAlchemy: db = SQLAlchemy() i extensions.py, db.init_app(app) i create_app. models.py importerer 'db' direkte.
# • test_app.login_manager peker på SAMME instans som app.login_manager — extensionet er én, appene er to. user_loader registreres bare én gang.
# • I ekte prosjekt: extensions.py samler ALLE: db, login_manager, mail, csrf, migrate, ... én linje per. Hver create_app kaller init_app på alle.

    LoginManager, UserMixin,
    login_user, logout_user, login_required, current_user,
)

# === ville vært i app/extensions.py ===
# Lag manager-instansen UTEN app — bindes senere via init_app()
login_manager = LoginManager()
login_manager.login_view = "auth.login"


# === ville vært i app/models.py ===
class Bruker(UserMixin):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

# In-memory bruker-DB (her av enkelhets grunn — i ekte app: SQLAlchemy)
brukere = {1: Bruker(1, "ola"), 2: Bruker(2, "kari")}

# user_loader registreres på extension-instansen — IKKE på app-en.
# Dette er nøyaktig hvorfor late-binding er nødvendig: brukere må kunne
# importere login_manager før appen finnes.
@login_manager.user_loader
def load_user(uid):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass


# === ville vært i app/auth/__init__.py ===
auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

@auth_bp.route("/logout")
@login_required
def logout():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass


# === ville vært i app/main/__init__.py ===
main_bp = Blueprint("main", __name__)

@main_bp.route("/profil")
@login_required
def profil():
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass


# === ville vært i app/__init__.py — selve create_app() ===
def create_app(config):
    # TODO: Skriv koden her — se beskrivelsen og hintene.
    pass

    # 1) Bind extensions til DENNE appen
    login_manager.init_app(app)

    # 2) Registrer blueprints
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(main_bp)

    return app


# === ville vært i wsgi.py / conftest.py ===
app = create_app({"SECRET_KEY": "test-key"})

# Test-koden under er fjernet. Skriv din egen test eller kjør Vis løsning
# for å se hvordan den ferdig versjonen tester routene.`,
    solution: `from flask import Flask, Blueprint, request
from flask_login import (
    LoginManager, UserMixin,
    login_user, logout_user, login_required, current_user,
)

# === ville vært i app/extensions.py ===
# Lag manager-instansen UTEN app — bindes senere via init_app()
login_manager = LoginManager()
login_manager.login_view = "auth.login"


# === ville vært i app/models.py ===
class Bruker(UserMixin):
    def __init__(self, id, navn):
        self.id = id
        self.navn = navn

# In-memory bruker-DB (her av enkelhets grunn — i ekte app: SQLAlchemy)
brukere = {1: Bruker(1, "ola"), 2: Bruker(2, "kari")}

# user_loader registreres på extension-instansen — IKKE på app-en.
# Dette er nøyaktig hvorfor late-binding er nødvendig: brukere må kunne
# importere login_manager før appen finnes.
@login_manager.user_loader
def load_user(uid):
    return brukere.get(int(uid))


# === ville vært i app/auth/__init__.py ===
auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    navn = request.form.get("brukernavn", "")
    funn = next((u for u in brukere.values() if u.navn == navn), None)
    if funn:
        login_user(funn)
        return f"Innlogget: {funn.navn}", 200
    return "Feil brukernavn", 401

@auth_bp.route("/logout")
@login_required
def logout():
    logout_user()
    return "Logget ut", 200


# === ville vært i app/main/__init__.py ===
main_bp = Blueprint("main", __name__)

@main_bp.route("/profil")
@login_required
def profil():
    return f"Hei, {current_user.navn} (id={current_user.id})", 200


# === ville vært i app/__init__.py — selve create_app() ===
def create_app(config):
    app = Flask(__name__)
    app.config.update(config)

    # 1) Bind extensions til DENNE appen
    login_manager.init_app(app)

    # 2) Registrer blueprints
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(main_bp)

    return app


# === ville vært i wsgi.py / conftest.py ===
app = create_app({"SECRET_KEY": "test-key"})
client = app.test_client()

# Demo full flyt:
print("/profil uten login:    ", client.get("/profil").status_code)
print("Login:                 ", client.post("/auth/login", data={"brukernavn": "ola"}).data.decode())
print("/profil etter login:   ", client.get("/profil").data.decode())
print("/auth/logout:          ", client.get("/auth/logout").data.decode())
print("/profil etter logout:  ", client.get("/profil").status_code)
print()
print("Til testene:")
test_app = create_app({"SECRET_KEY": "ulik-test-key", "TESTING": True})
print("  Test-app er separat instans:", test_app is not app)
print("  Bruker SAMME login_manager:", test_app.login_manager is app.login_manager)
`,
    hints: [
      "Hvorfor late binding? Blueprint i app/auth/routes.py har \\\"from app.extensions import login_manager\\\" øverst — det funker fordi instansen finnes UTEN app, og init_app() knytter den senere.",
      "Samme mønster gjelder Flask-SQLAlchemy: db = SQLAlchemy() i extensions.py, db.init_app(app) i create_app. models.py importerer 'db' direkte.",
      "test_app.login_manager peker på SAMME instans som app.login_manager — extensionet er én, appene er to. user_loader registreres bare én gang.",
      "I ekte prosjekt: extensions.py samler ALLE: db, login_manager, mail, csrf, migrate, ... én linje per. Hver create_app kaller init_app på alle.",
    ],
  },

  // ============ STATISTIKK & ML — VERIFISERING AV NUMPY/SCIPY-RUNNER ============
  {
    id: "py-numpy-stats-smoke-test",
    topic: "Statistikk-grunnlag",
    title: "Smoke-test: numpy + scipy.stats lastet",
    description:
      "Røyk-test for numpy/scipy-runneren. Kjør et lite eksempel som beregner gjennomsnitt, standardavvik, og en p-verdi fra en t-test. Hvis dette kjører er vi klar for TEK-1501-øvelser.",
    requires: ["numpy", "scipy"],
    starter: `import numpy as np
from scipy import stats

# === OPPGAVE ===
# Vi har 12 målinger av batteri-levetid fra en produsent som hevder snitt = 100 timer.
# Sjekk om vår observerte snitt er signifikant lavere enn 100.

data = np.array([95.2, 98.1, 102.4, 97.8, 96.5, 99.3, 94.7, 101.2, 97.9, 96.8, 95.5, 98.4])

# TODO:
# 1. Beregn snittet (mean) og standardavviket (std med ddof=1).
# 2. Kjør en one-sample t-test mot 100 med stats.ttest_1samp.
# 3. Print: snitt, std, t-statistikk, p-verdi.

# Skriv koden under:
`,
    solution: `import numpy as np
from scipy import stats

data = np.array([95.2, 98.1, 102.4, 97.8, 96.5, 99.3, 94.7, 101.2, 97.9, 96.8, 95.5, 98.4])

mean = np.mean(data)
std = np.std(data, ddof=1)
t_stat, p_val = stats.ttest_1samp(data, popmean=100)

print(f"Snitt: {mean:.2f}")
print(f"Std:   {std:.2f}")
print(f"t = {t_stat:.3f}, p = {p_val:.4f}")
`,
    hints: [
      "np.mean(data) gir gjennomsnittet.",
      "np.std(data, ddof=1) gir stikkprøve-standardavvik (n-1 i nevner). ddof=0 er populasjons-std.",
      "stats.ttest_1samp(data, popmean=100) returnerer (t_statistic, p_value).",
      "Bruk f-strenger: f\"{mean:.2f}\" for 2 desimaler.",
    ],
    docs: [
      {
        title: "numpy — array-grunnlag",
        url: "https://numpy.org/doc/stable/user/quickstart.html",
        note: "np.array, np.mean, np.std, np.sum, np.var — alt det grunnleggende vi bruker i TEK-1501.",
      },
      {
        title: "scipy.stats — t-test",
        url: "https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ttest_1samp.html",
        snippet: `t_stat, p_val = stats.ttest_1samp(data, popmean=100)`,
        note: "ttest_1samp tester om snittet i data er signifikant ulikt popmean. p < 0.05 → forkast H₀.",
      },
    ],
  },

  // ============================================================
  // DTE-2507 — Socket-programmering (TCP, UDP, threading, TLS, krypto)
  //
  // Pyodide har ikke ekte sockets — vi har en in-process shim (socketShim.ts)
  // som emulerer socket.socket() med kø-baserte pipes. Studenter kan derfor
  // skrive ekte-utseende kode (bind, listen, accept, send, recv) og kjore det.
  // For oppgaver der server-loopen ellers ville blokkere evig kjorer vi den
  // i en bakgrunnstrad — Python's threading-modul finnes i Pyodide.
  // ============================================================
  {
    id: "sock-tcp-echo-server",
    topic: "Sockets (TCP)",
    title: "TCP-echo-server — server-loop i ren Python",
    description:
      "Skriv en TCP-echo-server som lytter pa port 9000, tar imot ÉN tilkobling, leser opp til 1024 bytes, og sender det samme tilbake. Bruk threading sa main-traden kan starte klienten etterpa.",
    requires: [],
    starter: `# === TCP-echo-server ===
# Server skal:
#   1) lage en SOCK_STREAM-socket
#   2) bind til (127.0.0.1, 9000)
#   3) listen()
#   4) accept() (returnerer conn, addr)
#   5) recv(1024), send det samme tilbake, close
#
# Klient skal:
#   1) socket(), connect((127.0.0.1, 9000))
#   2) sendall(b"Hei server")
#   3) recv(1024), print resultatet

import socket, threading

def server():
    # TODO: lag server-socket, bind, listen, accept, recv, send, close
    pass

# Start serveren i en bakgrunnstrad sa hovedtraden kan kjore klienten.
t = threading.Thread(target=server, daemon=True)
t.start()

# === KLIENT ===
c = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
c.connect(("127.0.0.1", 9000))
c.sendall(b"Hei server")
data = c.recv(1024)
print("Klient mottok:", data.decode())
c.close()
`,
    solution: `import socket, threading

def server():
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind(("127.0.0.1", 9000))
    srv.listen(1)
    conn, addr = srv.accept()
    data = conn.recv(1024)
    conn.sendall(data)
    conn.close()
    srv.close()

t = threading.Thread(target=server, daemon=True)
t.start()

c = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
c.connect(("127.0.0.1", 9000))
c.sendall(b"Hei server")
data = c.recv(1024)
print("Klient mottok:", data.decode())
c.close()
`,
    hints: [
      "Server-loopen: socket.socket(AF_INET, SOCK_STREAM); bind((host, port)); listen(); conn, addr = accept().",
      "accept() blokkerer til en klient kobler til. Returnerer (conn, addr).",
      "Husk a close() bade conn og srv etter du er ferdig.",
    ],
  },

  {
    id: "sock-tcp-client",
    topic: "Sockets (TCP)",
    title: "TCP-klient som snakker med en eksisterende server",
    description:
      "En echo-server kjorer allerede pa (127.0.0.1, 8080) — den er startet for deg. Skriv klient-koden som sender 'PING' og printer svaret.",
    requires: [],
    setup: `
import socket, threading

def _bg_server():
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.bind(("127.0.0.1", 8080))
    srv.listen(1)
    conn, _ = srv.accept()
    data = conn.recv(1024)
    conn.sendall(b"PONG: " + data)
    conn.close()
    srv.close()

threading.Thread(target=_bg_server, daemon=True).start()
import time as _t; _t.sleep(0.01)  # gi serveren litt tid pa seg
`,
    starter: `import socket

# === OPPGAVE ===
# Koble til 127.0.0.1:8080
# Send b"PING"
# Les opp til 1024 bytes
# Print svaret

c = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# TODO: skriv koden under
`,
    solution: `import socket

c = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
c.connect(("127.0.0.1", 8080))
c.sendall(b"PING")
print(c.recv(1024).decode())
c.close()
`,
    hints: [
      "connect() tar en tuple (host, port).",
      "sendall() looper til alt er sendt — bedre enn send() som kan vere kort.",
      "recv(n) returnerer bytes — bruk .decode() for a fa str.",
    ],
  },

  {
    id: "sock-udp-time-server",
    topic: "Sockets (UDP)",
    title: "UDP-time-server — returner epoch time",
    description:
      "Skriv en UDP-server som lytter pa port 1234. For hver mottatte datagram skal den svare med string(int(time.time())). Klienten sender 'TID?' og forventer epoch som tekst.",
    requires: [],
    starter: `import socket, threading, time

def server():
    # TODO: lag SOCK_DGRAM-socket, bind, recvfrom, sendto
    pass

threading.Thread(target=server, daemon=True).start()

# Klient
c = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
c.sendto(b"TID?", ("127.0.0.1", 1234))
data, _ = c.recvfrom(1024)
print("Server tid:", data.decode())
c.close()
`,
    solution: `import socket, threading, time

def server():
    srv = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    srv.bind(("127.0.0.1", 1234))
    data, addr = srv.recvfrom(1024)
    srv.sendto(str(int(time.time())).encode(), addr)
    srv.close()

threading.Thread(target=server, daemon=True).start()

c = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
c.sendto(b"TID?", ("127.0.0.1", 1234))
data, _ = c.recvfrom(1024)
print("Server tid:", data.decode())
c.close()
`,
    hints: [
      "UDP bruker SOCK_DGRAM, ikke SOCK_STREAM.",
      "recvfrom returnerer (data, addr) — du trenger addr for a kunne sendto tilbake.",
      "Bruk str(int(time.time())).encode() for a fa epoch som bytes.",
    ],
  },

  {
    id: "sock-http-get-raw",
    topic: "HTTP via sockets",
    title: "HTTP GET med rene sockets (uten requests-biblioteket)",
    description:
      "Skriv en mini-HTTP-klient som sender en GET /hello mot 127.0.0.1:8000 og leser hele svaret. Server-en er startet for deg og svarer alltid '200 OK Hei!'.",
    requires: [],
    setup: `
import socket, threading

def _bg_server():
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.bind(("127.0.0.1", 8000))
    srv.listen(1)
    conn, _ = srv.accept()
    _ = conn.recv(4096)  # ignorer request-en for enkelhets skyld
    body = b"Hei!"
    resp = (
        b"HTTP/1.1 200 OK\\r\\n"
        b"Content-Type: text/plain\\r\\n"
        b"Content-Length: " + str(len(body)).encode() + b"\\r\\n"
        b"Connection: close\\r\\n\\r\\n" + body
    )
    conn.sendall(resp)
    conn.close()
    srv.close()

threading.Thread(target=_bg_server, daemon=True).start()
import time as _t; _t.sleep(0.01)
`,
    starter: `import socket

# === OPPGAVE ===
# 1) Koble til 127.0.0.1:8000
# 2) Send en gyldig HTTP/1.1 GET-request mot /hello.
#    Husk Host-header og linje-skiller \\r\\n.
# 3) Les hele responsen til serveren stenger (recv returnerer b"").
# 4) Print den dekodede responsen.

c = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# TODO: skriv koden under
`,
    solution: `import socket

c = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
c.connect(("127.0.0.1", 8000))
c.sendall(
    b"GET /hello HTTP/1.1\\r\\n"
    b"Host: 127.0.0.1\\r\\n"
    b"Connection: close\\r\\n\\r\\n"
)
chunks = []
while True:
    chunk = c.recv(4096)
    if not chunk:
        break
    chunks.append(chunk)
print(b"".join(chunks).decode())
c.close()
`,
    hints: [
      "HTTP-request-format: 'GET <path> HTTP/1.1\\r\\nHost: <host>\\r\\n\\r\\n'",
      "Connection: close gjor at server lukker etter svaret — recv returnerer b\"\" sluttsignal.",
      "Loop recv(4096) til den returnerer tom bytes.",
    ],
  },

  {
    id: "sock-tcp-multiclient",
    topic: "Sockets (concurrent)",
    title: "Concurrent server — én thread per klient",
    description:
      "Bygg en TCP-server som kan ta imot to klienter samtidig. Hver tilkobling skal hanteres i sin egen thread. Send en personalisert hilsen tilbake basert pa det klienten sender.",
    requires: [],
    starter: `import socket, threading, time

def handle(conn, addr):
    data = conn.recv(1024).decode()
    conn.sendall(f"Hei {data}".encode())
    conn.close()

def server():
    # TODO: socket, bind 7777, listen, accept-loop som starter thread per accept
    pass

threading.Thread(target=server, daemon=True).start()
time.sleep(0.01)

# Test med to klienter
for navn in ["Ola", "Kari"]:
    c = socket.socket()
    c.connect(("127.0.0.1", 7777))
    c.sendall(navn.encode())
    print(c.recv(1024).decode())
    c.close()
`,
    solution: `import socket, threading, time

def handle(conn, addr):
    data = conn.recv(1024).decode()
    conn.sendall(f"Hei {data}".encode())
    conn.close()

def server():
    srv = socket.socket()
    srv.bind(("127.0.0.1", 7777))
    srv.listen(5)
    for _ in range(2):
        conn, addr = srv.accept()
        threading.Thread(target=handle, args=(conn, addr), daemon=True).start()

threading.Thread(target=server, daemon=True).start()
time.sleep(0.05)

for navn in ["Ola", "Kari"]:
    c = socket.socket()
    c.connect(("127.0.0.1", 7777))
    c.sendall(navn.encode())
    print(c.recv(1024).decode())
    c.close()

time.sleep(0.05)
`,
    hints: [
      "Server-loopen: accept() returnerer (conn, addr); start en Thread(target=handle, args=(conn, addr)).",
      "Bruk daemon=True for at threadene ikke skal hindre programmet i a avslutte.",
      "Med 2 forventede klienter kan du for-loop accept-en akkurat 2 ganger.",
    ],
  },

  {
    id: "sock-parse-http-request",
    topic: "HTTP via sockets",
    title: "Parse HTTP-headers fra rå bytes",
    description:
      "Du har mottatt en HTTP-request som bytes. Skriv kode som splitter den i (method, path, headers-dict). Headers er linjer 'Key: Value' fram til en tom linje.",
    requires: [],
    starter: `raw = (
    b"GET /produkter?id=5 HTTP/1.1\\r\\n"
    b"Host: example.com\\r\\n"
    b"User-Agent: Mozilla/5.0\\r\\n"
    b"Accept: text/html\\r\\n"
    b"\\r\\n"
)

# === OPPGAVE ===
# Splitt opp raw i:
#   method = "GET"
#   path   = "/produkter?id=5"
#   headers = {"Host": "example.com", "User-Agent": "Mozilla/5.0", "Accept": "text/html"}
#
# Print method, path og headers.
`,
    solution: `raw = (
    b"GET /produkter?id=5 HTTP/1.1\\r\\n"
    b"Host: example.com\\r\\n"
    b"User-Agent: Mozilla/5.0\\r\\n"
    b"Accept: text/html\\r\\n"
    b"\\r\\n"
)

text = raw.decode("utf-8", errors="replace")
header_block, _, _body = text.partition("\\r\\n\\r\\n")
lines = header_block.split("\\r\\n")
request_line = lines[0]
method, path, _version = request_line.split(" ")

headers = {}
for line in lines[1:]:
    key, _, value = line.partition(": ")
    headers[key] = value

print("Method :", method)
print("Path   :", path)
print("Headers:", headers)
`,
    hints: [
      "Bruk .decode() for a fa en str, sa kan du bruke str-metoder.",
      ".partition(\"\\r\\n\\r\\n\") splitter pa forste blanke linje (skille mellom headers og body).",
      "Request-linjen splitter pa mellomrom: METHOD PATH HTTP/x.x",
    ],
  },

  {
    id: "sock-shutdown-half-close",
    topic: "Sockets (TCP)",
    title: "shutdown(SHUT_WR) — half-close",
    description:
      "Forklarende oppgave: en klient sender alle data, signaliserer 'jeg er ferdig med a sende' med shutdown(SHUT_WR), og leser sa svaret. Server-en venter til recv returnerer b\"\" for a vite at alt er sendt.",
    requires: [],
    setup: `
import socket, threading, time

def _bg():
    srv = socket.socket()
    srv.bind(("127.0.0.1", 7600))
    srv.listen(1)
    conn, _ = srv.accept()
    total = b""
    while True:
        chunk = conn.recv(4096)
        if not chunk:
            break  # klienten har shutdown'et
        total += chunk
    conn.sendall(b"Mottok totalt " + str(len(total)).encode() + b" bytes")
    conn.close()
    srv.close()

threading.Thread(target=_bg, daemon=True).start()
time.sleep(0.01)
`,
    starter: `import socket

c = socket.socket()
c.connect(("127.0.0.1", 7600))

# Send tre meldinger
for msg in [b"hello ", b"world", b" foo"]:
    c.sendall(msg)

# === OPPGAVE ===
# Vi vil at serveren skal vite at vi er ferdige a sende, men vi vil
# fremdeles kunne lese svar. Bruk shutdown(SHUT_WR).

# TODO: c.shutdown(socket.SHUT_WR)

print(c.recv(4096).decode())
c.close()
`,
    solution: `import socket

c = socket.socket()
c.connect(("127.0.0.1", 7600))

for msg in [b"hello ", b"world", b" foo"]:
    c.sendall(msg)

c.shutdown(socket.SHUT_WR)
print(c.recv(4096).decode())
c.close()
`,
    hints: [
      "shutdown(SHUT_WR) sender FIN men holder lese-retningen apen.",
      "Uten shutdown vil server-en sin recv-loop blokkere fordi den ikke vet om mer kommer.",
      "Alternativet er Content-Length-headers eller en linje-avgrenser — protokoll-design.",
    ],
  },

  {
    id: "sock-udp-broadcast-flow",
    topic: "Sockets (UDP)",
    title: "UDP: flere klienter, én server",
    description:
      "Lag en UDP-server som tar imot 3 datagrams fra ulike klienter og samler dem til en liste. Print listen.",
    requires: [],
    starter: `import socket, threading, time

received = []

def server():
    srv = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    srv.bind(("127.0.0.1", 9999))
    for _ in range(3):
        data, addr = srv.recvfrom(1024)
        received.append((data.decode(), addr[1]))
    srv.close()

t = threading.Thread(target=server, daemon=True)
t.start()
time.sleep(0.01)

# Tre klienter
for navn in ["Ola", "Kari", "Per"]:
    # TODO: opprett UDP-socket, send navn til (127.0.0.1, 9999)
    pass

t.join(timeout=1.0)
print(received)
`,
    solution: `import socket, threading, time

received = []

def server():
    srv = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    srv.bind(("127.0.0.1", 9999))
    for _ in range(3):
        data, addr = srv.recvfrom(1024)
        received.append((data.decode(), addr[1]))
    srv.close()

t = threading.Thread(target=server, daemon=True)
t.start()
time.sleep(0.01)

for navn in ["Ola", "Kari", "Per"]:
    c = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    c.sendto(navn.encode(), ("127.0.0.1", 9999))
    c.close()

t.join(timeout=1.0)
print(received)
`,
    hints: [
      "UDP-klient trenger ikke connect — bare sendto med dst-addr.",
      "Hver klient kan lage og lukke sin egen UDP-socket umiddelbart.",
    ],
  },

  {
    id: "sock-tls-konsept-handshake",
    topic: "TLS / SSL",
    title: "TLS-handshake — skritt for skritt",
    description:
      "Forklar TLS 1.3-handshake-en ved a skrive ut riktig sekvens av meldinger i riktig rekkefolge. Dette er en konseptuell ovelse — vi bygger ikke ekte TLS, men du skal vise at du kjenner stegene.",
    requires: [],
    starter: `# Vi skal modellere TLS 1.3 handshake mellom Klient og Server.
# Hver melding er en (avsender, navn) tuple.
#
# Riktig rekkefolge for TLS 1.3 (forenklet):
#   1. Klient -> Server : Client Hello (med SNI, supported ciphers)
#   2. Server -> Klient : Server Hello + Certificate + Finished (i én pakke)
#   3. Klient -> Server : Finished
#   4. Klient -> Server : Application Data (krypterte HTTP-bytes)
#
# OPPGAVE: bygg en liste 'meldinger' med disse fire stegene i riktig rekkefolge
# og print dem.

meldinger = []
# TODO: append de fire trinnene

for avsender, navn in meldinger:
    print(f"{avsender:>7s}  ->  {navn}")
`,
    solution: `meldinger = [
    ("Klient", "Client Hello (SNI, supported ciphers)"),
    ("Server", "Server Hello + Certificate + Finished"),
    ("Klient", "Finished"),
    ("Klient", "Application Data (kryptert HTTP)"),
]
for avsender, navn in meldinger:
    print(f"{avsender:>7s}  ->  {navn}")
`,
    hints: [
      "TLS 1.3 reduserte 2-RTT (TLS 1.2) til 1-RTT — server pakker hello+cert+finished i én pakke.",
      "SNI gar i klartekst i Client Hello — det er det eneste en passiv sniffer ser av destinasjonen.",
      "Sertifikatet i 1.3 er kryptert (etter Server Hello-headeren), i 1.2 er det klartekst.",
    ],
  },

  {
    id: "sock-krypto-hash",
    topic: "Kryptografi",
    title: "Hashing — SHA-256 av et passord",
    description:
      "Beregn SHA-256 av strengen 'hemmelig123' og print resultatet bade som hex og kort byte-lengde.",
    requires: [],
    starter: `import hashlib

passord = "hemmelig123"
# TODO: beregn SHA-256, print hexdigest og lengde i bytes
`,
    solution: `import hashlib

passord = "hemmelig123"
h = hashlib.sha256(passord.encode())
print("Hex:", h.hexdigest())
print("Bytes:", h.digest_size)
`,
    hints: [
      "hashlib.sha256(b\"...\") returnerer et hash-objekt — kall .hexdigest() for hex-string.",
      "digest_size er fast 32 bytes for SHA-256 (256 bits).",
      "Husk: hashlib trenger bytes, ikke str. Bruk .encode().",
    ],
  },

  {
    id: "sock-krypto-hmac",
    topic: "Kryptografi",
    title: "HMAC — autentisert melding",
    description:
      "HMAC er en hash som ogsa beviser at sender kjenner et felles nokkel. Beregn HMAC-SHA256 av meldingen 'overfor 1000kr til Per' med nokkel 'shared-secret'.",
    requires: [],
    starter: `import hmac, hashlib

key = b"shared-secret"
msg = b"overfor 1000kr til Per"

# TODO: lag HMAC-objekt, print hexdigest
`,
    solution: `import hmac, hashlib

key = b"shared-secret"
msg = b"overfor 1000kr til Per"

mac = hmac.new(key, msg, hashlib.sha256)
print("HMAC:", mac.hexdigest())

# Bonus: sjekk om en innkommende MAC matcher
sent_mac = mac.hexdigest()
ok = hmac.compare_digest(sent_mac, mac.hexdigest())
print("Verifikasjon:", "OK" if ok else "FEIL")
`,
    hints: [
      "hmac.new(key, msg, hashlib.sha256) lager et HMAC-objekt — kall .hexdigest().",
      "compare_digest bruker konstant tid og er trygt mot timing-angrep.",
      "HMAC beskytter mot lengde-utvidelse, som naken H(key||msg) ikke gjor.",
    ],
  },

  {
    id: "sock-krypto-token-secrets",
    topic: "Kryptografi",
    title: "Sikre tilfeldige tokens (secrets-modulen)",
    description:
      "Generer et kryptografisk sikkert tilfeldig session-token pa 32 bytes og print det som hex-string. Hvorfor secrets og ikke random?",
    requires: [],
    starter: `import secrets

# TODO: generer 32 tilfeldige bytes som hex
token = ""
print(token)
print("Lengde:", len(token), "tegn")
`,
    solution: `import secrets

token = secrets.token_hex(32)
print(token)
print("Lengde:", len(token), "tegn")
# token_hex(32) returnerer 32 bytes -> 64 hex-tegn.
# random.random/randint er IKKE kryptografisk sikker — predikerbar fra seed.
# secrets bruker OS-CSPRNG (urandom).
`,
    hints: [
      "secrets.token_hex(n) returnerer 2n hex-tegn (én byte = to hex-siffer).",
      "secrets.token_urlsafe(n) er fin for tokens i URL-er.",
      "Bruk ALDRI random-modulen for sikkerhets-tokens — det er pseudoslump.",
    ],
  },

  {
    id: "sock-time-wait-quiz",
    topic: "Sockets (TCP)",
    title: "TIME_WAIT — forklar feilen",
    description:
      "En student kjorer sin server, stopper med Ctrl+C, og restarter umiddelbart. De far 'Address already in use'. Forklar i print hvorfor — og fiks koden.",
    requires: [],
    starter: `# === OPPGAVE ===
# Server-en under feiler ofte ved restart fordi TCP holder den forrige
# tilkoblingen i TIME_WAIT-tilstand i 60-120 sek for a fange forsinkede
# pakker.
#
# Legg til riktig setsockopt-kall slik at restart fungerer umiddelbart.

import socket, threading

def server():
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # TODO: legg til setsockopt for SO_REUSEADDR
    srv.bind(("127.0.0.1", 5555))
    srv.listen(1)
    srv.close()
    print("Server startet og stoppet ok")

threading.Thread(target=server, daemon=True).start()

# Restart umiddelbart:
threading.Thread(target=server, daemon=True).start()

import time; time.sleep(0.05)
`,
    solution: `import socket, threading

def server():
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind(("127.0.0.1", 5555))
    srv.listen(1)
    srv.close()
    print("Server startet og stoppet ok")

threading.Thread(target=server, daemon=True).start()
threading.Thread(target=server, daemon=True).start()

import time; time.sleep(0.05)
`,
    hints: [
      "setsockopt(SOL_SOCKET, SO_REUSEADDR, 1) lar OS rebind selv om gammel TCP-state finnes.",
      "Gjor det FOR bind(), ikke etter.",
      "TIME_WAIT er en feature, ikke en bug — beskytter mot at gamle pakker rotes inn i nye tilkoblinger.",
    ],
  },

  {
    id: "sock-tcp-message-framing",
    topic: "Sockets (TCP)",
    title: "Meldings-framing — lengde-prefiks",
    description:
      "TCP er en byte-stream — du kan ikke regne med at en recv() = en send(). Implementer et enkelt protokoll med 4-byte little-endian lengde foran hver melding.",
    requires: [],
    starter: `import socket, threading, time, struct

def server():
    srv = socket.socket()
    srv.bind(("127.0.0.1", 6000))
    srv.listen(1)
    conn, _ = srv.accept()
    # === OPPGAVE: les én melding ===
    # 1) Les 4 bytes lengde
    # 2) Pakk ut som unsigned int (little-endian): struct.unpack("<I", ...)
    # 3) Les akkurat 'lengde' bytes til
    # 4) Print meldingen
    raw_len = conn.recv(4)
    # TODO
    conn.close()
    srv.close()

threading.Thread(target=server, daemon=True).start()
time.sleep(0.01)

# Klient
msg = b"Hei med deg, lange ord forsvinner hvis vi ikke framer."
c = socket.socket()
c.connect(("127.0.0.1", 6000))
c.sendall(struct.pack("<I", len(msg)) + msg)
c.close()
time.sleep(0.05)
`,
    solution: `import socket, threading, time, struct

def server():
    srv = socket.socket()
    srv.bind(("127.0.0.1", 6000))
    srv.listen(1)
    conn, _ = srv.accept()
    raw_len = conn.recv(4)
    (n,) = struct.unpack("<I", raw_len)
    payload = b""
    while len(payload) < n:
        chunk = conn.recv(n - len(payload))
        if not chunk:
            break
        payload += chunk
    print(payload.decode())
    conn.close()
    srv.close()

threading.Thread(target=server, daemon=True).start()
time.sleep(0.01)

msg = b"Hei med deg, lange ord forsvinner hvis vi ikke framer."
c = socket.socket()
c.connect(("127.0.0.1", 6000))
c.sendall(struct.pack("<I", len(msg)) + msg)
c.close()
time.sleep(0.05)
`,
    hints: [
      "struct.pack('<I', n) gir 4 bytes little-endian unsigned int.",
      "Loop recv(n - len(buffer)) til du har all data — bare recv(n) en gang er ikke nok pa byte-stream.",
      "Real-world: HTTP/2, Redis-RESP, alle bruker en variant av denne lengde-prefiks-mekanismen.",
    ],
  },

  {
    id: "sock-port-pa-osi",
    topic: "Sockets (TCP)",
    title: "Hvilken port hvilken protokoll?",
    description:
      "Print en mapping av port-nummer til protokoll for de mest brukte tjenestene. Lar fingrene huske dem.",
    requires: [],
    starter: `# === OPPGAVE ===
# Bygg en dict med port -> protokoll for tjenestene:
#   21 FTP
#   22 SSH
#   25 SMTP
#   53 DNS
#   80 HTTP
#   110 POP3
#   143 IMAP
#   443 HTTPS
#   3306 MySQL
#   5432 PostgreSQL
#
# Print sortert pa port-nummer.

porter = {}
# TODO

for port in sorted(porter):
    print(f"{port:>5}  {porter[port]}")
`,
    solution: `porter = {
    21: "FTP",
    22: "SSH",
    25: "SMTP",
    53: "DNS",
    80: "HTTP",
    110: "POP3",
    143: "IMAP",
    443: "HTTPS",
    3306: "MySQL",
    5432: "PostgreSQL",
}
for port in sorted(porter):
    print(f"{port:>5}  {porter[port]}")
`,
    hints: [
      "Port-numrene under 1024 kalles well-known ports og krever root for a binde til pa Linux.",
      "DNS er det klassiske UDP-eksemplet (port 53). Resten her er TCP.",
    ],
  },
  ...DTE2507_EXERCISES,

  // ============ TEK-1501: 15 STATISTIKK-ØVELSER ============
  {
    id: "py-tek1-mean-std",
    topic: "Statistikk-grunnlag",
    title: "TEK-1501: Beregn gjennomsnitt og standardavvik",
    description:
      "Klassisk eksamen-startoppgave: gitt en liste med målinger, regn ut x̄ og s. Bruk numpy. Pass på ddof=1 for stikkprøve-standardavvik.",
    requires: ["numpy"],
    starter: `import numpy as np

# 12 målinger av batteri-levetid (timer)
data = np.array([95.2, 98.1, 102.4, 97.8, 96.5, 99.3,
                 94.7, 101.2, 97.9, 96.8, 95.5, 98.4])

# TODO:
# 1. Beregn gjennomsnittet (mean)
# 2. Beregn stikkprøve-standardavviket (std med ddof=1)
# 3. Print både med 3 desimaler

# Forventet output:
# Snitt: 97.817
# Std:   2.317
`,
    solution: `import numpy as np

data = np.array([95.2, 98.1, 102.4, 97.8, 96.5, 99.3,
                 94.7, 101.2, 97.9, 96.8, 95.5, 98.4])

mean = np.mean(data)
std = np.std(data, ddof=1)
print(f"Snitt: {mean:.3f}")
print(f"Std:   {std:.3f}")
`,
    hints: [
      "np.mean(data) gir gjennomsnittet.",
      "np.std(data, ddof=1) gir stikkprøve-std (n−1 i nevner). ddof=0 er populasjons-std.",
      "Bruk f-strenger: f'{mean:.3f}' gir 3 desimaler.",
    ],
  },
  {
    id: "py-tek1-five-number",
    topic: "Statistikk-grunnlag",
    title: "TEK-1501: 5-tallsoppsummering",
    description:
      "Beregn Min, Q1, Median, Q3, Max og IQR for et datasett. Bruker numpy percentile-funksjonen.",
    requires: ["numpy"],
    starter: `import numpy as np

# Eksamensresultater (i poeng, max 100)
scores = np.array([45, 52, 58, 61, 63, 66, 68, 70, 72, 74,
                   75, 77, 79, 82, 85, 87, 89, 92, 95, 98])

# TODO: Beregn og print
#   Min, Q1 (25-persentilen), Median, Q3 (75-persentilen), Max
#   IQR (Q3 − Q1)

# Forventet:
# Min: 45.0  Q1: 65.25  Median: 74.5  Q3: 84.25  Max: 98.0
# IQR: 19.0
`,
    solution: `import numpy as np

scores = np.array([45, 52, 58, 61, 63, 66, 68, 70, 72, 74,
                   75, 77, 79, 82, 85, 87, 89, 92, 95, 98])

q1 = np.percentile(scores, 25)
median = np.percentile(scores, 50)
q3 = np.percentile(scores, 75)
iqr = q3 - q1

print(f"Min: {scores.min()}  Q1: {q1}  Median: {median}  Q3: {q3}  Max: {scores.max()}")
print(f"IQR: {iqr}")
`,
    hints: [
      "np.percentile(data, 25) gir Q1.",
      "scores.min() og scores.max() for ytterpunktene.",
      "IQR = Q3 − Q1 — sentralt for å oppdage outliers.",
    ],
  },
  {
    id: "py-tek1-bayes",
    topic: "Statistikk-grunnlag",
    title: "TEK-1501: Bayes manuelt — medisinsk test",
    description:
      "Implementér Bayes' teorem fra grunnen av. Gitt prior P(syk), sensitivitet og spesifisitet, regn ut P(syk | positiv test).",
    requires: [],
    starter: `# Klassisk eksamen-eksempel
# Sykdom forekommer hos 1% av befolkningen
P_syk = 0.01

# Test er 99% sensitiv: P(test+ | syk) = 0.99
P_pos_gitt_syk = 0.99

# Test er 95% spesifikk: P(test− | frisk) = 0.95
#                       → P(test+ | frisk) = 0.05
P_pos_gitt_frisk = 0.05

# TODO:
# 1. Beregn P(frisk) = 1 − P(syk)
# 2. Beregn P(test+) med total sannsynlighet:
#    P(test+) = P(test+|syk)·P(syk) + P(test+|frisk)·P(frisk)
# 3. Beregn P(syk | test+) med Bayes:
#    P(syk | test+) = P(test+|syk) · P(syk) / P(test+)
# 4. Print svaret i prosent med 2 desimaler

# Forventet: P(syk | test+) = 16.67%
`,
    solution: `P_syk = 0.01
P_pos_gitt_syk = 0.99
P_pos_gitt_frisk = 0.05

P_frisk = 1 - P_syk
P_pos = P_pos_gitt_syk * P_syk + P_pos_gitt_frisk * P_frisk
P_syk_gitt_pos = (P_pos_gitt_syk * P_syk) / P_pos

print(f"P(syk | test+) = {P_syk_gitt_pos * 100:.2f}%")
`,
    hints: [
      "Total sannsynlighet: P(B) = P(B|A)·P(A) + P(B|Aᶜ)·P(Aᶜ).",
      "Bayes: P(A | B) = P(B | A) · P(A) / P(B).",
      "Selv ved 99 % sensitiv test blir P(syk | test+) liten når P(syk) er liten.",
    ],
  },
  {
    id: "py-tek1-combinatorics",
    topic: "Statistikk-grunnlag",
    title: "TEK-1501: Kombinatorikk — Lotto",
    description:
      "Norsk Lotto: 7 av 34 tall, uten tilbakelegging. Beregn antall mulige trekninger og sannsynlighet for 6 og 7 rette. Bruk scipy.special.comb.",
    requires: ["scipy"],
    starter: `from scipy.special import comb

# Norsk Lotto: trekkes 7 av 34 tall uten tilbakelegging
N = 34   # totalt antall tall
K = 7    # vinnertall (vår kupong)
n = 7    # tall vi velger

# TODO:
# 1. Antall mulige trekninger = C(34, 7)
# 2. P(7 rette) = 1 / C(34, 7)
# 3. P(6 rette) = C(7, 6) · C(27, 1) / C(34, 7)
#    (6 av våre 7 rette × 1 av de 27 andre × delt på totalen)
# 4. Print alle med rimelig presisjon

# Forventet (omtrent):
# Antall mulige: 5 379 616
# P(7 rette) = 1.86e-07
# P(6 rette) = 3.51e-05
`,
    solution: `from scipy.special import comb

N = 34
K = 7

total = comb(N, K, exact=True)
P_7 = 1 / total
P_6 = comb(7, 6, exact=True) * comb(27, 1, exact=True) / total

print(f"Antall mulige: {total:,}")
print(f"P(7 rette) = {P_7:.2e}")
print(f"P(6 rette) = {P_6:.2e}")
`,
    hints: [
      "scipy.special.comb(n, k) gir C(n, k). Bruk exact=True for store n.",
      "P(7 rette): bare 1 av total mulige er din kupong.",
      "P(6 rette): velg 6 av dine 7 rette OG 1 av de 27 du IKKE valgte.",
    ],
  },
  {
    id: "py-tek1-binomial",
    topic: "Statistikk-grunnlag",
    title: "TEK-1501: Binomisk fordeling",
    description:
      "5 % av enhetene fra fabrikken er defekte. Vi tester 20. Beregn P(X = 2), P(X ≤ 2) og forventning + varians.",
    requires: ["scipy"],
    starter: `from scipy.stats import binom

# Antagelser:
n = 20      # antall testede enheter
p = 0.05    # sannsynlighet for defekt

# TODO:
# 1. P(X = 2) — PMF
# 2. P(X ≤ 2) — CDF
# 3. E[X] = n·p
# 4. Var(X) = n·p·(1−p)
# 5. Std(X) = √Var

# Forventet:
# P(X = 2) ≈ 0.1887
# P(X ≤ 2) ≈ 0.9245
# E[X] = 1.0,  Var = 0.95
`,
    solution: `from scipy.stats import binom

n = 20
p = 0.05

p_eq_2 = binom.pmf(2, n, p)
p_leq_2 = binom.cdf(2, n, p)
ev = n * p
var = n * p * (1 - p)

print(f"P(X = 2)  = {p_eq_2:.4f}")
print(f"P(X ≤ 2)  = {p_leq_2:.4f}")
print(f"E[X]      = {ev}")
print(f"Var(X)    = {var}")
print(f"Std       = {var**0.5:.4f}")
`,
    hints: [
      "binom.pmf(k, n, p) gir P(X = k).",
      "binom.cdf(k, n, p) gir P(X ≤ k) — kumulativ sannsynlighet.",
      "For binomisk: E = np, Var = np(1−p).",
    ],
  },
  {
    id: "py-tek1-poisson",
    topic: "Statistikk-grunnlag",
    title: "TEK-1501: Poisson — kundeankomster",
    description:
      "I snitt ankommer 4 kunder per 15-minutters periode. Beregn P(0), P(3), P(X ≥ 5), og forventning.",
    requires: ["scipy"],
    starter: `from scipy.stats import poisson

lam = 4  # gjennomsnittlig antall per intervall

# TODO:
# 1. P(X = 0) — ingen ankomster
# 2. P(X = 3) — tre ankomster
# 3. P(X ≥ 5) — minst fem (bruk 1 − cdf(4))
# 4. E[X] og Var(X) — begge er λ

# Forventet:
# P(X = 0) ≈ 0.0183
# P(X = 3) ≈ 0.1954
# P(X ≥ 5) ≈ 0.3712
`,
    solution: `from scipy.stats import poisson

lam = 4
p_0 = poisson.pmf(0, lam)
p_3 = poisson.pmf(3, lam)
p_geq_5 = 1 - poisson.cdf(4, lam)

print(f"P(X = 0)  = {p_0:.4f}")
print(f"P(X = 3)  = {p_3:.4f}")
print(f"P(X >= 5) = {p_geq_5:.4f}")
print(f"E[X] = {lam},  Var[X] = {lam}")
`,
    hints: [
      "poisson.pmf(k, mu) gir P(X = k) der mu = λ.",
      "P(X ≥ 5) = 1 − P(X ≤ 4) = 1 − cdf(4).",
      "Poisson: E[X] = Var(X) = λ (spesielt).",
    ],
  },
  {
    id: "py-tek1-normal",
    topic: "Statistikk-grunnlag",
    title: "TEK-1501: Normalfordeling — IQ-skår",
    description:
      "IQ er normalfordelt med μ = 100, σ = 15. Beregn P(X > 130), P(85 ≤ X ≤ 115), og 95-persentilen.",
    requires: ["scipy"],
    starter: `from scipy.stats import norm

mu = 100
sigma = 15

# TODO:
# 1. P(X > 130) — over 130 IQ
# 2. P(85 ≤ X ≤ 115) — innen ett standardavvik
# 3. 95-persentilen (verdien x slik at P(X ≤ x) = 0.95)

# Forventet:
# P(X > 130)        ≈ 0.0228 (2.3%)
# P(85 ≤ X ≤ 115)  ≈ 0.6827 (68% — '68%-regelen')
# 95-persentilen     ≈ 124.67
`,
    solution: `from scipy.stats import norm

mu = 100
sigma = 15

p_over_130 = 1 - norm.cdf(130, loc=mu, scale=sigma)
p_85_115 = norm.cdf(115, loc=mu, scale=sigma) - norm.cdf(85, loc=mu, scale=sigma)
p95 = norm.ppf(0.95, loc=mu, scale=sigma)

print(f"P(X > 130)       = {p_over_130:.4f}")
print(f"P(85 <= X <= 115) = {p_85_115:.4f}")
print(f"95-persentilen    = {p95:.2f}")
`,
    hints: [
      "norm.cdf(x, loc=μ, scale=σ) gir P(X ≤ x). For P(X > x) bruk 1 − cdf.",
      "P(a ≤ X ≤ b) = cdf(b) − cdf(a).",
      "norm.ppf(p) (percent point function) er invers cdf — gir x slik at P(X ≤ x) = p.",
    ],
  },
  {
    id: "py-tek1-clt",
    topic: "Statistikk-grunnlag",
    title: "TEK-1501: Sentralgrenseteoremet — simulering",
    description:
      "Demonstrer CLT: snitt fra uniform-fordeling konvergerer mot normal. Trekk N utvalg på n = 30 fra U(0,1), beregn snitt for hvert, og verifisér at de er ca. normalfordelt.",
    requires: ["numpy"],
    starter: `import numpy as np

# Simulering: trekk 10 000 utvalg på n = 30 fra U(0, 1)
N = 10000
n = 30

# Teoretisk: X ~ U(0,1) har μ = 0.5, σ² = 1/12
# CLT sier: X̄ ~ N(0.5, 1/(12·30)) tilnærmet

# TODO:
# 1. Simuler N utvalg på n verdier hver (bruk np.random.uniform)
# 2. Beregn snittet for hvert utvalg → x̄-array av lengde N
# 3. Beregn empirisk mean og std av de N snittene
# 4. Sammenlign med teoretisk: 0.5 og √(1/(12·30)) ≈ 0.0527

np.random.seed(42)
# Skriv koden under:
`,
    solution: `import numpy as np

N = 10000
n = 30

np.random.seed(42)
samples = np.random.uniform(0, 1, size=(N, n))
sample_means = samples.mean(axis=1)

emp_mean = sample_means.mean()
emp_std = sample_means.std(ddof=1)

theor_mean = 0.5
theor_std = (1/12 / n) ** 0.5

print(f"Empirisk:  mean = {emp_mean:.4f}, std = {emp_std:.4f}")
print(f"Teoretisk: mean = {theor_mean},   std = {theor_std:.4f}")
print("CLT bekreftet!" if abs(emp_std - theor_std) < 0.001 else "Tjaaa, kanskje større N?")
`,
    hints: [
      "np.random.uniform(0, 1, size=(N, n)) lager en N×n matrise.",
      ".mean(axis=1) tar snittet langs hver rad (per utvalg).",
      "CLT: X̄ ~ N(μ, σ²/n). Her: σ² = 1/12 for U(0,1), så std av X̄ = √(1/(12n)).",
    ],
  },
  {
    id: "py-tek1-ci-mean",
    topic: "Statistikk-grunnlag",
    title: "TEK-1501: 95% konfidensintervall for μ (σ ukjent)",
    description:
      "Klassisk eksamen-oppgave. Gitt 12 målinger, konstruer 95% CI for μ med t-fordelingen (siden σ er ukjent).",
    requires: ["numpy", "scipy"],
    starter: `import numpy as np
from scipy import stats

data = np.array([95.2, 98.1, 102.4, 97.8, 96.5, 99.3,
                 94.7, 101.2, 97.9, 96.8, 95.5, 98.4])

# σ er ukjent, så vi bruker t-fordeling med n − 1 frihetsgrader

# TODO:
# 1. Beregn x̄ og s
# 2. Finn t-kritisk verdi: t_(0.025, n−1) — bruk stats.t.ppf
# 3. Beregn standardfeil SE = s / √n
# 4. CI = (x̄ − t·SE,  x̄ + t·SE)
# 5. Print med 3 desimaler

# Forventet (omtrent):
# x̄ = 97.817, s = 2.317
# t_krit = 2.201
# CI = (96.345, 99.289)
`,
    solution: `import numpy as np
from scipy import stats

data = np.array([95.2, 98.1, 102.4, 97.8, 96.5, 99.3,
                 94.7, 101.2, 97.9, 96.8, 95.5, 98.4])

n = len(data)
x_bar = np.mean(data)
s = np.std(data, ddof=1)

t_crit = stats.t.ppf(0.975, df=n - 1)
se = s / np.sqrt(n)

ci_low = x_bar - t_crit * se
ci_high = x_bar + t_crit * se

print(f"x̄ = {x_bar:.3f}, s = {s:.3f}")
print(f"t-kritisk = {t_crit:.3f}")
print(f"95% CI = ({ci_low:.3f}, {ci_high:.3f})")
`,
    hints: [
      "stats.t.ppf(0.975, df=n-1) gir t_(α/2, n-1) for 95% (α=0.05, α/2=0.025).",
      "SE = s / √n (standardfeilen).",
      "CI = x̄ ± t_krit · SE.",
    ],
  },
  {
    id: "py-tek1-ttest-1samp",
    topic: "Statistikk-grunnlag",
    title: "TEK-1501: One-sample t-test",
    description:
      "Produsenten hevder snittlevetid = 100 timer. Test om vår observerte snittet er signifikant lavere. Bruk α = 0.05.",
    requires: ["numpy", "scipy"],
    starter: `import numpy as np
from scipy import stats

# 12 målinger fra vår batch
data = np.array([95.2, 98.1, 102.4, 97.8, 96.5, 99.3,
                 94.7, 101.2, 97.9, 96.8, 95.5, 98.4])

# H0: μ = 100
# H1: μ ≠ 100 (tosidig)
# α = 0.05

# TODO:
# 1. Kjør stats.ttest_1samp(data, popmean=100)
# 2. Print t-statistikk og p-verdi
# 3. Konkludér: forkast H0 hvis p < 0.05
# 4. Print konklusjon på norsk

# Forventet:
# t ≈ −3.262, p ≈ 0.0076
# Konklusjon: forkast H0 — gjennomsnittet er signifikant ulikt 100
`,
    solution: `import numpy as np
from scipy import stats

data = np.array([95.2, 98.1, 102.4, 97.8, 96.5, 99.3,
                 94.7, 101.2, 97.9, 96.8, 95.5, 98.4])

t_stat, p_val = stats.ttest_1samp(data, popmean=100)
alpha = 0.05

print(f"t = {t_stat:.3f}, p = {p_val:.4f}")
if p_val < alpha:
    print(f"p < {alpha}: FORKAST H0 — snittet er signifikant ulikt 100")
else:
    print(f"p >= {alpha}: BEHOLD H0 — ikke nok bevis for forskjell")
`,
    hints: [
      "stats.ttest_1samp(data, popmean=μ₀) returnerer (t_statistic, p_value).",
      "Sammenlign p_value med α — typisk 0.05.",
      "NB: Husk at 'behold H0' ikke betyr 'H0 er sann', bare 'ikke nok bevis'.",
    ],
  },
  {
    id: "py-tek1-ttest-2samp",
    topic: "Statistikk-grunnlag",
    title: "TEK-1501: Two-sample t-test",
    description:
      "Sammenlign to grupper: kontrollgruppen og behandlingsgruppen. Er det signifikant forskjell?",
    requires: ["numpy", "scipy"],
    starter: `import numpy as np
from scipy import stats

# Kontrollgruppen (uten behandling)
kontroll = np.array([72, 75, 68, 71, 73, 70, 74, 69, 72, 71])

# Behandlingsgruppen
behandling = np.array([78, 82, 75, 80, 79, 77, 81, 76, 83, 78])

# H0: μ_K = μ_B
# H1: μ_K ≠ μ_B

# TODO:
# 1. Bruk stats.ttest_ind med equal_var=False (Welch's t-test, antar ulike varianser)
# 2. Print t og p
# 3. Konkludér med α = 0.05

# Forventet: signifikant forskjell (p < 0.001)
`,
    solution: `import numpy as np
from scipy import stats

kontroll = np.array([72, 75, 68, 71, 73, 70, 74, 69, 72, 71])
behandling = np.array([78, 82, 75, 80, 79, 77, 81, 76, 83, 78])

t_stat, p_val = stats.ttest_ind(kontroll, behandling, equal_var=False)

print(f"Kontroll:    mean={kontroll.mean():.2f}, std={kontroll.std(ddof=1):.2f}")
print(f"Behandling:  mean={behandling.mean():.2f}, std={behandling.std(ddof=1):.2f}")
print(f"t = {t_stat:.3f}, p = {p_val:.4f}")

if p_val < 0.05:
    print("FORKAST H0 — gruppene er signifikant forskjellige")
else:
    print("BEHOLD H0 — ikke nok bevis for forskjell")
`,
    hints: [
      "stats.ttest_ind(a, b, equal_var=False) er Welch's t-test (anbefalt default).",
      "equal_var=True gjør pooled-varians t-test (krever lik varians).",
      "Med p < 0.001 er det HØY tillit til at gruppene forskjeller.",
    ],
  },
  {
    id: "py-tek1-linregress",
    topic: "Statistikk-grunnlag",
    title: "TEK-1501: Lineær regresjon",
    description:
      "Datasett: antall etasjer (x) og byggetid i måneder (y). Finn regresjonslinjen, R², og predikér tid for 8 etasjer.",
    requires: ["numpy", "scipy"],
    starter: `import numpy as np
from scipy import stats

# Data
x = np.array([3, 5, 7, 9, 11])   # antall etasjer
y = np.array([6, 9, 14, 17, 22]) # byggetid (mnd)

# TODO:
# 1. Kjør stats.linregress(x, y)
# 2. Print slope (β1), intercept (β0), r og R² (= r²)
# 3. Skriv regresjonslinjen som "y = a + b·x"
# 4. Predikér byggetid for 8 etasjer

# Forventet:
# β1 ≈ 2.0, β0 ≈ −0.4, r ≈ 0.991, R² ≈ 0.983
# Prediksjon for 8 etasjer ≈ 15.6 mnd
`,
    solution: `import numpy as np
from scipy import stats

x = np.array([3, 5, 7, 9, 11])
y = np.array([6, 9, 14, 17, 22])

result = stats.linregress(x, y)
b1 = result.slope
b0 = result.intercept
r = result.rvalue
r2 = r ** 2

print(f"Slope β1     = {b1:.4f}")
print(f"Intercept β0 = {b0:.4f}")
print(f"r            = {r:.4f}")
print(f"R²           = {r2:.4f}")
print(f"Modell: y = {b0:.2f} + {b1:.2f}·x")

# Prediksjon for x = 8
y_pred = b0 + b1 * 8
print(f"Prediksjon for 8 etasjer: {y_pred:.2f} mnd")
`,
    hints: [
      "stats.linregress(x, y) returnerer LinregressResult med slope, intercept, rvalue, pvalue, stderr.",
      "R² = rvalue² (i enkel lineær regresjon).",
      "Prediksjon: ŷ = β0 + β1·x.",
    ],
  },
  {
    id: "py-tek1-pearson",
    topic: "Statistikk-grunnlag",
    title: "TEK-1501: Pearson-korrelasjon",
    description:
      "Beregn korrelasjon mellom høyde og vekt. Inkluderer p-verdi for å teste H0: r = 0.",
    requires: ["numpy", "scipy"],
    starter: `import numpy as np
from scipy.stats import pearsonr

# Høyde (cm) og vekt (kg) for 10 personer
hoyde = np.array([165, 170, 175, 180, 185, 168, 172, 178, 183, 190])
vekt =  np.array([60,  68,  72,  78,  85,  62,  70,  76,  82,  92])

# TODO:
# 1. Bruk pearsonr(hoyde, vekt) → (r, p)
# 2. Print r, p, og tolkning av styrke:
#    |r| >= 0.9 svært sterk, >= 0.7 sterk, >= 0.4 moderat, ellers svak
# 3. Konkludér: signifikant ulik 0 hvis p < 0.05?
`,
    solution: `import numpy as np
from scipy.stats import pearsonr

hoyde = np.array([165, 170, 175, 180, 185, 168, 172, 178, 183, 190])
vekt =  np.array([60,  68,  72,  78,  85,  62,  70,  76,  82,  92])

r, p = pearsonr(hoyde, vekt)

if abs(r) >= 0.9:
    styrke = "svært sterk"
elif abs(r) >= 0.7:
    styrke = "sterk"
elif abs(r) >= 0.4:
    styrke = "moderat"
else:
    styrke = "svak"

print(f"r = {r:.4f}  ({styrke})")
print(f"p = {p:.4e}")
print(f"Signifikant ulik 0: {'JA' if p < 0.05 else 'NEI'}")
`,
    hints: [
      "scipy.stats.pearsonr(x, y) returnerer (r, p_value).",
      "p-verdien tester H0: r = 0 (ingen lineær sammenheng).",
      "Husk: korrelasjon ≠ kausalitet, selv ved sterk r.",
    ],
  },
  {
    id: "py-tek1-chi2",
    topic: "Statistikk-grunnlag",
    title: "TEK-1501: Kji-kvadrattest for uavhengighet",
    description:
      "Test om kjønn og favoritt-emne er uavhengig. Bruk en 2×3 kontingenstabell.",
    requires: ["numpy", "scipy"],
    starter: `import numpy as np
from scipy.stats import chi2_contingency

# Kontingenstabell:
#               Matematikk  Norsk  Engelsk
#   Gutt           30        20      25
#   Jente          15        35      30

observed = np.array([
    [30, 20, 25],
    [15, 35, 30],
])

# H0: kjønn og favoritt-emne er uavhengige
# H1: de er avhengige

# TODO:
# 1. Bruk chi2_contingency(observed) → (chi2, p, dof, expected)
# 2. Print alle fire
# 3. Konkludér med α = 0.05

# Forventet: chi2 ≈ 11.7, p ≈ 0.0028, dof = 2 → forkast H0
`,
    solution: `import numpy as np
from scipy.stats import chi2_contingency

observed = np.array([
    [30, 20, 25],
    [15, 35, 30],
])

chi2, p, dof, expected = chi2_contingency(observed)

print(f"chi² = {chi2:.4f}")
print(f"p    = {p:.4f}")
print(f"dof  = {dof}")
print(f"Forventet under H0:")
print(expected)

if p < 0.05:
    print("FORKAST H0 — kjønn og favoritt-emne er IKKE uavhengige")
else:
    print("BEHOLD H0 — ingen bevis for avhengighet")
`,
    hints: [
      "chi2_contingency(table) returnerer (chi², p, dof, expected_frequencies).",
      "dof = (rader − 1) · (kolonner − 1).",
      "Forutsetning: alle forventede frekvenser ≥ 5. Sjekk expected.",
    ],
  },
  {
    id: "py-tek1-ci-proportion",
    topic: "Statistikk-grunnlag",
    title: "TEK-1501: Konfidensintervall for andel p",
    description:
      "Av 200 spurte sa 80 'ja'. Beregn 95% CI for andelen p ved hjelp av normal-tilnærming (Wald-CI).",
    requires: ["numpy", "scipy"],
    starter: `import numpy as np
from scipy.stats import norm

# Observasjon
n = 200      # antall spurte
x = 80       # antall som sa 'ja'

# TODO:
# 1. Punktestimat p̂ = x/n
# 2. Sjekk gyldighet: np̂ >= 5 og n(1-p̂) >= 5
# 3. SE = √(p̂(1-p̂)/n)
# 4. z = norm.ppf(0.975) ≈ 1.96
# 5. CI = (p̂ − z·SE, p̂ + z·SE)
# 6. Print som prosent med 1 desimal

# Forventet:
# p̂ = 0.400
# CI = (33.2%, 46.8%)
`,
    solution: `import numpy as np
from scipy.stats import norm

n = 200
x = 80

p_hat = x / n
print(f"p̂ = {p_hat:.3f}")

# Gyldighet
if n * p_hat >= 5 and n * (1 - p_hat) >= 5:
    print("Gyldighet OK")
else:
    print("Advarsel: forutsetninger for Wald-CI er ikke oppfylt")

se = np.sqrt(p_hat * (1 - p_hat) / n)
z = norm.ppf(0.975)
ci_low = p_hat - z * se
ci_high = p_hat + z * se

print(f"95% CI = ({ci_low * 100:.1f}%, {ci_high * 100:.1f}%)")
`,
    hints: [
      "p̂ = x/n (proporsjons-estimat).",
      "SE for andel = √(p̂(1-p̂)/n).",
      "Wald-CI bruker z = 1.96 for 95%. Krever np̂ ≥ 5 og n(1-p̂) ≥ 5.",
    ],
  },
  ...DTE2505_EXERCISES,

  // DTE-2501 ML-pensum — k-NN, trær, ensemble, k-Means, GMM, PCA, NLP, GA, RL, DP.
  ...PY_EXERCISES_DTE2501,

  // TEK-1501 — ANOVA og inferens for proporsjoner.
  ...PY_TEK1_GAPS_EXERCISES,

  // Kurose-Ross — fase 1: kvantitative nettverksoppgaver (Ch 1, 2, 3, 4, 6, 8).
  ...PY_KUROSE_EXERCISES,
];

export const PY_EXERCISES: PyExercise[] = [
  ...PY_EXERCISES_BASE,
  ...PY_DTE2602_EXERCISES,
  ...PY_DTE2602_LOGISTISK_EXERCISES,
  ...PY_DTE2602_GAPS2_EXERCISES,
  ...PY_TEK1_REGDIAG_EXERCISES,
  ...PY_FLASK_BOOTSTRAP_EXERCISES,
  ...PY_KUROSE_EXERCISES,
  ...PY_FASTAPI_EXERCISES,
  ...PY_DTE2505_UTVIDELSE_EXERCISES,
  ...PY_TEK1_UTVIDELSE_EXERCISES,
];
