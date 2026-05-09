import type { ProjectStep } from "./types";

// Cumulative "Bygg en nettbutikk" — students extend the same Flask app from
// step to step. Each starter contains EVERYTHING from previous steps so the
// student always sees the whole app.py while focusing on one new feature.
//
// The runner's mysql.connector-shim keeps an in-memory SQLite alive for the
// session, but each step still re-runs the seed-block at the top so the
// starter is fully self-contained — useful if a student jumps around.
//
// Each step ends with a TEST-block (assertions + prints) that verifies the
// new feature works. Successful tests print "PASS:" lines.

// ────────────────────────────────────────────────────────────────────────────
// Building blocks (kept short and reused across steps)
// ────────────────────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────────────────────
// Schema fragments — students physically write these in steg 1 + 2.
// ────────────────────────────────────────────────────────────────────────────

const SCHEMA_KUNDE_PRODUKT = `cur.execute("""
        CREATE TABLE kunde (
            kundenr      INTEGER PRIMARY KEY AUTOINCREMENT,
            brukernavn   TEXT UNIQUE NOT NULL,
            passord_hash TEXT NOT NULL,
            epost        TEXT,
            admin        INTEGER NOT NULL DEFAULT 0
        )
    """)
    cur.execute("""
        CREATE TABLE produkt (
            prodnr  INTEGER PRIMARY KEY,
            navn    TEXT NOT NULL,
            pris    REAL NOT NULL,
            lager   INTEGER NOT NULL DEFAULT 0
        )
    """)`;

const SCHEMA_ORDRE_LINJE = `cur.execute("""
        CREATE TABLE ordre (
            ordrenr   INTEGER PRIMARY KEY AUTOINCREMENT,
            kundenr   INTEGER NOT NULL,
            dato      TEXT NOT NULL,
            FOREIGN KEY (kundenr) REFERENCES kunde(kundenr)
        )
    """)
    cur.execute("""
        CREATE TABLE ordrelinje (
            ordrenr  INTEGER NOT NULL,
            prodnr   INTEGER NOT NULL,
            antall   INTEGER NOT NULL,
            pris     REAL NOT NULL,
            PRIMARY KEY (ordrenr, prodnr),
            FOREIGN KEY (ordrenr) REFERENCES ordre(ordrenr),
            FOREIGN KEY (prodnr)  REFERENCES produkt(prodnr)
        )
    """)`;

const SEED_DATA = `cur.executemany("INSERT INTO produkt VALUES (%s, %s, %s, %s)", [
        (1, "T-skjorte", 199.0, 50),
        (2, "Bukse", 599.0, 20),
        (3, "Sko", 1299.0, 10),
        (4, "Lue", 99.0, 100),
    ])
    cur.execute(
        "INSERT INTO kunde (brukernavn, passord_hash, epost, admin) VALUES (%s, %s, %s, %s)",
        ("admin", "ingen-login-bruk-bare-flag", "admin@butikk.no", 1),
    )`;

// Helper that builds a complete DB-init block from selected schema fragments.
// Used for steg 1 (basics only), steg 2 (basics + orders), and 3+ (full).
function buildDbInit(opts: {
  basics: boolean;
  orders: boolean;
  seed: boolean;
  enableForeignKeys?: boolean;
}): string {
  const parts: string[] = [
    `# ──── Database ────`,
    `import mysql.connector`,
    `def get_db():`,
    `    return mysql.connector.connect(database="butikk")`,
    ``,
    `def init_db():`,
    `    db = get_db()`,
    `    cur = db.cursor()`,
    opts.enableForeignKeys ? `    cur.execute("PRAGMA foreign_keys = ON")` : ``,
    `    cur.execute("DROP TABLE IF EXISTS ordrelinje")`,
    `    cur.execute("DROP TABLE IF EXISTS ordre")`,
    `    cur.execute("DROP TABLE IF EXISTS kunde")`,
    `    cur.execute("DROP TABLE IF EXISTS produkt")`,
  ];
  if (opts.basics) parts.push(`    ${SCHEMA_KUNDE_PRODUKT}`);
  if (opts.orders) parts.push(`    ${SCHEMA_ORDRE_LINJE}`);
  if (opts.seed) parts.push(`    ${SEED_DATA}`);
  parts.push(`    db.commit()`, `init_db()`, ``);
  return parts.filter((l) => l !== ``).join("\n") + "\n";
}

// Used by all steps from 3 onward — fully seeded DB.
const DB_INIT = buildDbInit({ basics: true, orders: true, seed: true });

const APP_INIT = `
# ──── Flask-app ────
from flask import Flask
app = Flask(__name__)
app.config["SECRET_KEY"] = "kursbruk-bytt-i-produksjon"
`;

const PASSWORD_HELPERS = `
import hashlib, secrets
def hash_passord(passord, salt=None):
    if salt is None:
        salt = secrets.token_hex(8)
    h = hashlib.sha256((salt + passord).encode()).hexdigest()
    return f"{salt}\${h}"

def sjekk_passord(passord, lagret_hash):
    try:
        salt, _ = lagret_hash.split("$", 1)
    except ValueError:
        return False
    return hash_passord(passord, salt) == lagret_hash
`;

// Variants — each step's solution adds one more block.

const REGISTER_SOLUTION = `
from flask import request, jsonify
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data or "brukernavn" not in data or "passord" not in data:
        return jsonify({"feil": "manglende felt"}), 400
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT 1 FROM kunde WHERE brukernavn = %s", (data["brukernavn"],))
    if cur.fetchone():
        return jsonify({"feil": "brukernavn er tatt"}), 409
    cur.execute(
        "INSERT INTO kunde (brukernavn, passord_hash, epost) VALUES (%s, %s, %s)",
        (data["brukernavn"], hash_passord(data["passord"]), data.get("epost")),
    )
    db.commit()
    return jsonify({"opprettet": data["brukernavn"], "kundenr": cur.lastrowid}), 201
`;

const LOGIN_SOLUTION = `
from flask import session
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    db = get_db()
    cur = db.cursor()
    cur.execute(
        "SELECT kundenr, passord_hash FROM kunde WHERE brukernavn = %s",
        (data["brukernavn"],),
    )
    rad = cur.fetchone()
    if not rad or not sjekk_passord(data["passord"], rad[1]):
        return jsonify({"feil": "feil brukernavn eller passord"}), 401
    session["kundenr"] = rad[0]
    return jsonify({"innlogget": data["brukernavn"]})

@app.route("/logout", methods=["POST"])
def logout():
    session.pop("kundenr", None)
    return jsonify({"ok": True})
`;

const LOGIN_REQUIRED_SOLUTION = `
from functools import wraps
def login_required(view):
    @wraps(view)
    def wrapper(*args, **kwargs):
        if "kundenr" not in session:
            return jsonify({"feil": "ikke innlogget"}), 401
        return view(*args, **kwargs)
    return wrapper

@app.route("/min-side")
@login_required
def min_side():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT brukernavn, epost FROM kunde WHERE kundenr = %s", (session["kundenr"],))
    rad = cur.fetchone()
    return jsonify({"brukernavn": rad[0], "epost": rad[1]})
`;

const PRODUCTS_AND_CART_SOLUTION = `
@app.route("/produkter")
def produkter():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT prodnr, navn, pris, lager FROM produkt")
    return jsonify([{"prodnr": p, "navn": n, "pris": pr, "lager": l}
                    for p, n, pr, l in cur.fetchall()])

@app.route("/kurv/legg-til", methods=["POST"])
@login_required
def legg_i_kurv():
    data = request.get_json()
    prodnr = int(data["prodnr"])
    antall = int(data.get("antall", 1))
    kurv = session.get("kurv", {})
    kurv[str(prodnr)] = kurv.get(str(prodnr), 0) + antall
    session["kurv"] = kurv
    return jsonify({"kurv": kurv})

@app.route("/kurv")
@login_required
def vis_kurv():
    return jsonify({"kurv": session.get("kurv", {})})
`;

const CHECKOUT_SOLUTION = `
from datetime import datetime
@app.route("/checkout", methods=["POST"])
@login_required
def checkout():
    kurv = session.get("kurv", {})
    if not kurv:
        return jsonify({"feil": "kurv er tom"}), 400
    db = get_db()
    cur = db.cursor()
    try:
        # Lag ordrehode
        cur.execute(
            "INSERT INTO ordre (kundenr, dato) VALUES (%s, %s)",
            (session["kundenr"], datetime.utcnow().isoformat()),
        )
        ordrenr = cur.lastrowid
        # Slå opp pris og trekk fra lager for hver linje
        for prodnr_str, antall in kurv.items():
            prodnr = int(prodnr_str)
            cur.execute("SELECT pris, lager FROM produkt WHERE prodnr = %s", (prodnr,))
            rad = cur.fetchone()
            if not rad or rad[1] < antall:
                db.rollback()
                return jsonify({"feil": f"ikke nok lager av prodnr {prodnr}"}), 409
            cur.execute(
                "INSERT INTO ordrelinje (ordrenr, prodnr, antall, pris) VALUES (%s, %s, %s, %s)",
                (ordrenr, prodnr, antall, rad[0]),
            )
            cur.execute("UPDATE produkt SET lager = lager - %s WHERE prodnr = %s",
                        (antall, prodnr))
        db.commit()
        session.pop("kurv", None)
        return jsonify({"ordrenr": ordrenr}), 201
    except Exception as e:
        db.rollback()
        return jsonify({"feil": str(e)}), 500
`;

const ORDER_HISTORY_AND_ADMIN_SOLUTION = `
def admin_required(view):
    @wraps(view)
    def wrapper(*args, **kwargs):
        if "kundenr" not in session:
            return jsonify({"feil": "ikke innlogget"}), 401
        cur = get_db().cursor()
        cur.execute("SELECT admin FROM kunde WHERE kundenr = %s", (session["kundenr"],))
        rad = cur.fetchone()
        if not rad or not rad[0]:
            return jsonify({"feil": "krever admin"}), 403
        return view(*args, **kwargs)
    return wrapper

@app.route("/mine-ordrer")
@login_required
def mine_ordrer():
    cur = get_db().cursor()
    cur.execute("""
        SELECT o.ordrenr, o.dato,
               (SELECT SUM(antall * pris) FROM ordrelinje WHERE ordrenr = o.ordrenr) AS totalsum
        FROM ordre o
        WHERE kundenr = %s
        ORDER BY o.ordrenr DESC
    """, (session["kundenr"],))
    return jsonify([
        {"ordrenr": nr, "dato": d, "total": t} for nr, d, t in cur.fetchall()
    ])

@app.route("/admin/ordrer")
@admin_required
def admin_ordrer():
    cur = get_db().cursor()
    cur.execute("""
        SELECT o.ordrenr, k.brukernavn, o.dato,
               (SELECT SUM(antall * pris) FROM ordrelinje WHERE ordrenr = o.ordrenr) AS totalsum
        FROM ordre o
        JOIN kunde k ON k.kundenr = o.kundenr
        ORDER BY o.ordrenr DESC
    """)
    return jsonify([
        {"ordrenr": nr, "kunde": k, "dato": d, "total": t} for nr, k, d, t in cur.fetchall()
    ])

# Hjelp for tester: la admin logge inn (admin-brukeren har dummy-hash, så vi
# setter passordet manuelt her). Vanlig kode bør IKKE eksponere noe slikt.
@app.route("/_testhjelp/login-som-admin", methods=["POST"])
def _login_som_admin():
    cur = get_db().cursor()
    cur.execute("SELECT kundenr FROM kunde WHERE brukernavn = 'admin'")
    rad = cur.fetchone()
    if rad:
        session["kundenr"] = rad[0]
        return jsonify({"ok": True})
    return jsonify({"feil": "ingen admin"}), 500
`;

const HTML_TEMPLATES_SOLUTION = `
from flask import render_template_string

PRODUKT_HTML = """
<!doctype html>
<html lang="no">
<head><meta charset="utf-8"><title>Butikk</title></head>
<body>
<h1>Velkommen til butikken</h1>
{% if brukernavn %}
  <p>Innlogget som <strong>{{ brukernavn }}</strong></p>
{% else %}
  <p><a href="/login">Logg inn</a> for å handle</p>
{% endif %}
<ul>
{% for p in produkter %}
  <li>{{ p.navn }} — {{ p.pris }} kr ({{ p.lager }} på lager)</li>
{% endfor %}
</ul>
</body>
</html>
""".strip()

@app.route("/butikk")
def butikk():
    cur = get_db().cursor()
    cur.execute("SELECT prodnr, navn, pris, lager FROM produkt")
    produkter = [{"prodnr": p, "navn": n, "pris": pr, "lager": l}
                 for p, n, pr, l in cur.fetchall()]
    brukernavn = None
    if "kundenr" in session:
        cur.execute("SELECT brukernavn FROM kunde WHERE kundenr = %s", (session["kundenr"],))
        rad = cur.fetchone()
        if rad:
            brukernavn = rad[0]
    return render_template_string(PRODUKT_HTML, produkter=produkter, brukernavn=brukernavn)
`;

const CSRF_SOLUTION = `
def get_csrf():
    if "csrf" not in session:
        session["csrf"] = secrets.token_hex(16)
    return session["csrf"]

@app.route("/csrf")
def csrf_endpoint():
    return jsonify({"token": get_csrf()})

@app.before_request
def sjekk_csrf():
    if request.method == "POST" and request.path not in ("/login", "/register"):
        token = request.headers.get("X-CSRF-Token", "")
        if not token or token != session.get("csrf"):
            return jsonify({"feil": "ugyldig CSRF-token"}), 403
`;

// ────────────────────────────────────────────────────────────────────────────
// Test snippets — appended to user code each step to verify success.
// ────────────────────────────────────────────────────────────────────────────

// Test for steg 1 — kunde + produkt-tabellene fra brukerens hånd.
const TEST_SCHEMA_BASICS = `
# ──── Test ────
db = get_db()
cur = db.cursor()

# 1. Tabellene finnes
cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tabeller = [r[0] for r in cur.fetchall()]
print(f"PASS: kunde-tabell finnes" if "kunde" in tabeller else f"FAIL: kunde mangler ({tabeller})")
print(f"PASS: produkt-tabell finnes" if "produkt" in tabeller else f"FAIL: produkt mangler ({tabeller})")

# 2. Riktige kolonner
cur.execute("PRAGMA table_info(kunde)")
kunde_kolonner = {row[1]: row for row in cur.fetchall()}
forventet = {"kundenr", "brukernavn", "passord_hash", "epost", "admin"}
print(f"PASS: kunde har riktige kolonner"
      if forventet.issubset(kunde_kolonner.keys())
      else f"FAIL: mangler {forventet - kunde_kolonner.keys()}")

# 3. PRIMARY KEY på kundenr
print(f"PASS: kundenr er primærnøkkel"
      if kunde_kolonner.get("kundenr") and kunde_kolonner["kundenr"][5] == 1
      else f"FAIL: kundenr ikke PRIMARY KEY")

# 4. NOT NULL på brukernavn og passord_hash
print(f"PASS: brukernavn er NOT NULL"
      if kunde_kolonner.get("brukernavn") and kunde_kolonner["brukernavn"][3] == 1
      else f"FAIL: brukernavn skal være NOT NULL")
print(f"PASS: passord_hash er NOT NULL"
      if kunde_kolonner.get("passord_hash") and kunde_kolonner["passord_hash"][3] == 1
      else f"FAIL: passord_hash skal være NOT NULL")

# 5. UNIQUE på brukernavn — prøv å sette inn duplikat
try:
    cur.execute("INSERT INTO kunde (brukernavn, passord_hash) VALUES ('admin', 'x')")
    print("FAIL: duplikat brukernavn ble akseptert (mangler UNIQUE?)")
except Exception:
    print("PASS: UNIQUE-constraint hindrer duplikat brukernavn")

# 6. Seed-data på plass
cur.execute("SELECT COUNT(*) FROM produkt"); n = cur.fetchone()[0]
print(f"PASS: 4 produkter seeded" if n == 4 else f"FAIL: forventet 4 produkter, fikk {n}")
cur.execute("SELECT COUNT(*) FROM kunde WHERE admin = 1"); na = cur.fetchone()[0]
print(f"PASS: admin-bruker seeded" if na >= 1 else f"FAIL: ingen admin-bruker")
`;

// Test for steg 2 — ordre + ordrelinje med FK + composite PK.
const TEST_SCHEMA_ORDERS = `
# ──── Test ────
db = get_db()
cur = db.cursor()

# 1. Tabellene finnes
cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tabeller = [r[0] for r in cur.fetchall()]
print(f"PASS: ordre finnes" if "ordre" in tabeller else f"FAIL: ordre mangler")
print(f"PASS: ordrelinje finnes" if "ordrelinje" in tabeller else f"FAIL: ordrelinje mangler")

# 2. Composite PK på ordrelinje (begge kolonner pk-flagget)
cur.execute("PRAGMA table_info(ordrelinje)")
linje_kolonner = {row[1]: row for row in cur.fetchall()}
pk_kolonner = [name for name, row in linje_kolonner.items() if row[5] > 0]
print(f"PASS: ordrelinje har sammensatt PK (ordrenr + prodnr)"
      if set(pk_kolonner) == {"ordrenr", "prodnr"}
      else f"FAIL: PK = {pk_kolonner}, forventet {{ordrenr, prodnr}}")

# 3. FK fra ordre til kunde
cur.execute("PRAGMA foreign_key_list(ordre)")
ordre_fks = [(row[2], row[3], row[4]) for row in cur.fetchall()]
print(f"PASS: ordre.kundenr → kunde.kundenr"
      if ("kunde", "kundenr", "kundenr") in ordre_fks
      else f"FAIL: FK fra ordre mangler ({ordre_fks})")

# 4. To FK-er fra ordrelinje
cur.execute("PRAGMA foreign_key_list(ordrelinje)")
linje_fks = [(row[2], row[3], row[4]) for row in cur.fetchall()]
has_ordre = any(t == "ordre" for t, _, _ in linje_fks)
has_produkt = any(t == "produkt" for t, _, _ in linje_fks)
print(f"PASS: ordrelinje har FK til ordre" if has_ordre else f"FAIL: FK til ordre mangler")
print(f"PASS: ordrelinje har FK til produkt" if has_produkt else f"FAIL: FK til produkt mangler")

# 5. FK-håndhevelse — prøv å sette inn ordrelinje med ugyldig prodnr
cur.execute("INSERT INTO ordre (kundenr, dato) VALUES (1, '2025-01-01')")
ordrenr = cur.lastrowid
try:
    cur.execute("INSERT INTO ordrelinje VALUES (%s, %s, %s, %s)", (ordrenr, 999, 1, 100.0))
    db.commit()
    print("FAIL: ugyldig FK ble akseptert — har du PRAGMA foreign_keys = ON?")
except Exception as e:
    print("PASS: FK håndheves — ugyldig prodnr avvist")
    db.rollback()
`;

const TEST_REGISTER = `
# ──── Test ────
client = app.test_client()
r = client.post("/register", json={"brukernavn": "ola", "passord": "hemmelig", "epost": "ola@x.no"})
print(f"PASS: opprettet ola" if r.status_code == 201 else f"FAIL: status {r.status_code}, body {r.get_json()}")
r2 = client.post("/register", json={"brukernavn": "ola", "passord": "abc"})
print(f"PASS: avviser duplikat" if r2.status_code == 409 else f"FAIL: forventet 409, fikk {r2.status_code}")
r3 = client.post("/register", json={"brukernavn": "kari"})
print(f"PASS: avviser manglende passord" if r3.status_code == 400 else f"FAIL: forventet 400, fikk {r3.status_code}")
`;

const TEST_LOGIN = `
# ──── Test ────
client = app.test_client()
client.post("/register", json={"brukernavn": "kari", "passord": "passord123", "epost": "kari@x.no"})
r = client.post("/login", json={"brukernavn": "kari", "passord": "feil"})
print(f"PASS: feil passord avvist" if r.status_code == 401 else f"FAIL: forventet 401, fikk {r.status_code}")
r = client.post("/login", json={"brukernavn": "kari", "passord": "passord123"})
print(f"PASS: login ok" if r.status_code == 200 else f"FAIL: status {r.status_code}, body {r.get_json()}")
client.post("/logout")
r = client.post("/login", json={"brukernavn": "ukjent", "passord": "x"})
print(f"PASS: ukjent bruker avvist" if r.status_code == 401 else f"FAIL: forventet 401, fikk {r.status_code}")
`;

const TEST_MIN_SIDE = `
# ──── Test ────
client = app.test_client()
client.post("/register", json={"brukernavn": "per", "passord": "p"})
# Uten innlogging:
r = client.get("/min-side")
print(f"PASS: blokkerer uinnloggede" if r.status_code == 401 else f"FAIL: forventet 401, fikk {r.status_code}")
client.post("/login", json={"brukernavn": "per", "passord": "p"})
r = client.get("/min-side")
print(f"PASS: viser min side" if r.status_code == 200 and r.get_json().get("brukernavn") == "per"
      else f"FAIL: {r.status_code} {r.get_json()}")
`;

const TEST_CART = `
# ──── Test ────
client = app.test_client()
r = client.get("/produkter")
print(f"PASS: produktliste returnert" if r.status_code == 200 and len(r.get_json()) == 4
      else f"FAIL: produkter={r.status_code} {r.get_json()}")
client.post("/register", json={"brukernavn": "anne", "passord": "a"})
client.post("/login", json={"brukernavn": "anne", "passord": "a"})
client.post("/kurv/legg-til", json={"prodnr": 1, "antall": 2})
client.post("/kurv/legg-til", json={"prodnr": 3, "antall": 1})
r = client.get("/kurv")
kurv = r.get_json().get("kurv", {})
ok = kurv.get("1") == 2 and kurv.get("3") == 1
print(f"PASS: kurv inneholder 2 t-skjorter + 1 sko" if ok else f"FAIL: kurv={kurv}")
`;

const TEST_CHECKOUT = `
# ──── Test ────
client = app.test_client()
client.post("/register", json={"brukernavn": "leo", "passord": "l"})
client.post("/login", json={"brukernavn": "leo", "passord": "l"})
client.post("/kurv/legg-til", json={"prodnr": 1, "antall": 3})
client.post("/kurv/legg-til", json={"prodnr": 4, "antall": 2})
r = client.post("/checkout")
print(f"PASS: ordre opprettet" if r.status_code == 201 else f"FAIL: {r.status_code} {r.get_json()}")
ordrenr = r.get_json().get("ordrenr")
# Sjekk DB:
cur = get_db().cursor()
cur.execute("SELECT COUNT(*) FROM ordrelinje WHERE ordrenr = %s", (ordrenr,))
n = cur.fetchone()[0]
print(f"PASS: 2 ordrelinjer lagret" if n == 2 else f"FAIL: {n} ordrelinjer")
cur.execute("SELECT lager FROM produkt WHERE prodnr = 1")
lager = cur.fetchone()[0]
print(f"PASS: lager trukket fra (47 igjen)" if lager == 47 else f"FAIL: lager={lager}")
# Tom kurv etter checkout:
r = client.get("/kurv")
print(f"PASS: kurv tømt etter checkout" if r.get_json().get("kurv") in ({}, None)
      else f"FAIL: kurv={r.get_json()}")
`;

const TEST_ORDER_HISTORY = `
# ──── Test ────
client = app.test_client()
client.post("/register", json={"brukernavn": "sara", "passord": "x"})
client.post("/login", json={"brukernavn": "sara", "passord": "x"})
client.post("/kurv/legg-til", json={"prodnr": 2, "antall": 1})
client.post("/checkout")
client.post("/kurv/legg-til", json={"prodnr": 4, "antall": 5})
client.post("/checkout")

# 1. Egen ordrehistorikk
r = client.get("/mine-ordrer")
mine = r.get_json()
print(f"PASS: bruker ser sine 2 ordrer" if r.status_code == 200 and len(mine) == 2
      else f"FAIL: {r.status_code} {mine}")

# 2. Vanlig bruker blokkeres fra admin-route
r = client.get("/admin/ordrer")
print(f"PASS: vanlig bruker avvist på /admin (403)" if r.status_code == 403
      else f"FAIL: forventet 403, fikk {r.status_code}")

# 3. Logg inn som admin og se alle
client.post("/logout")
client.post("/_testhjelp/login-som-admin")
r = client.get("/admin/ordrer")
alle = r.get_json()
print(f"PASS: admin ser alle 2+ ordrer" if r.status_code == 200 and len(alle) >= 2
      else f"FAIL: {r.status_code} {alle}")

# 4. Admin uten innlogging blir 401
client.post("/logout")
r = client.get("/admin/ordrer")
print(f"PASS: uten login → 401" if r.status_code == 401
      else f"FAIL: forventet 401, fikk {r.status_code}")
`;

const TEST_HTML_TEMPLATE = `
# ──── Test ────
client = app.test_client()
r = client.get("/butikk")
html = r.data.decode()
print(f"PASS: status 200" if r.status_code == 200 else f"FAIL: {r.status_code}")
print(f"PASS: viser produkter" if "T-skjorte" in html and "Sko" in html else "FAIL: produkter mangler")
print(f"PASS: viser pris" if "199" in html else "FAIL: pris mangler")
print(f"PASS: viser login-lenke når ikke innlogget" if "Logg inn" in html
      else f"FAIL: login-lenke mangler")

# Innlogget — skal vise brukernavn
client.post("/register", json={"brukernavn": "ida", "passord": "p"})
client.post("/login", json={"brukernavn": "ida", "passord": "p"})
html2 = client.get("/butikk").data.decode()
print(f"PASS: viser brukernavn etter login" if "ida" in html2
      else "FAIL: brukernavn mangler i innlogget visning")
`;

const TEST_CSRF = `
# ──── Test ────
client = app.test_client()
client.post("/register", json={"brukernavn": "max", "passord": "m"})
client.post("/login", json={"brukernavn": "max", "passord": "m"})
# Uten CSRF:
r = client.post("/kurv/legg-til", json={"prodnr": 1, "antall": 1})
print(f"PASS: avvist uten CSRF-token" if r.status_code == 403 else f"FAIL: {r.status_code}")
# Med CSRF:
token = client.get("/csrf").get_json()["token"]
r = client.post("/kurv/legg-til", json={"prodnr": 1, "antall": 1}, headers={"X-CSRF-Token": token})
print(f"PASS: ok med CSRF-token" if r.status_code == 200 else f"FAIL: {r.status_code} {r.get_json()}")
# Login og register skal fortsatt gå uten CSRF:
r = client.post("/register", json={"brukernavn": "ny", "passord": "x"})
print(f"PASS: register ok uten CSRF" if r.status_code == 201 else f"FAIL: {r.status_code}")
`;

// ────────────────────────────────────────────────────────────────────────────
// Steps — each step's `starter` is what the student opens. Solutions add one
// more block of code and one matching test block.
// ────────────────────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────────────────────
// STEG 1 — Lag kunde + produkt (CREATE TABLE basics)
// ────────────────────────────────────────────────────────────────────────────

const S1_STARTER = `# ──── Database ────
import mysql.connector
def get_db():
    return mysql.connector.connect(database="butikk")

def init_db():
    db = get_db()
    cur = db.cursor()
    cur.execute("DROP TABLE IF EXISTS ordrelinje")
    cur.execute("DROP TABLE IF EXISTS ordre")
    cur.execute("DROP TABLE IF EXISTS kunde")
    cur.execute("DROP TABLE IF EXISTS produkt")

    # TODO: Lag CREATE TABLE for kunde med:
    #   - kundenr     INTEGER PRIMARY KEY AUTOINCREMENT
    #   - brukernavn  TEXT UNIQUE NOT NULL
    #   - passord_hash TEXT NOT NULL
    #   - epost       TEXT          (kan være NULL)
    #   - admin       INTEGER NOT NULL DEFAULT 0
    # cur.execute(""" CREATE TABLE kunde ( ... ) """)

    # TODO: Lag CREATE TABLE for produkt med:
    #   - prodnr  INTEGER PRIMARY KEY
    #   - navn    TEXT NOT NULL
    #   - pris    REAL NOT NULL
    #   - lager   INTEGER NOT NULL DEFAULT 0
    # cur.execute(""" CREATE TABLE produkt ( ... ) """)

    # Seed-data — disse forventer at tabellene finnes, så de må komme ETTER
    # CREATE TABLE-setningene over.
    ${SEED_DATA}
    db.commit()

init_db()
` + TEST_SCHEMA_BASICS;

const S1_SOLUTION = buildDbInit({ basics: true, orders: false, seed: true }) + TEST_SCHEMA_BASICS;

// ────────────────────────────────────────────────────────────────────────────
// STEG 2 — Lag ordre + ordrelinje (FK + composite PK)
// ────────────────────────────────────────────────────────────────────────────

const S2_STARTER = `# ──── Database ────
import mysql.connector
def get_db():
    return mysql.connector.connect(database="butikk")

def init_db():
    db = get_db()
    cur = db.cursor()
    cur.execute("PRAGMA foreign_keys = ON")    # SQLite trenger denne for å håndheve FK
    cur.execute("DROP TABLE IF EXISTS ordrelinje")
    cur.execute("DROP TABLE IF EXISTS ordre")
    cur.execute("DROP TABLE IF EXISTS kunde")
    cur.execute("DROP TABLE IF EXISTS produkt")

    # Fra forrige steg — beholdes som det er:
    ${SCHEMA_KUNDE_PRODUKT}

    # TODO: Lag CREATE TABLE for ordre med:
    #   - ordrenr  INTEGER PRIMARY KEY AUTOINCREMENT
    #   - kundenr  INTEGER NOT NULL
    #   - dato     TEXT NOT NULL
    #   - FOREIGN KEY (kundenr) REFERENCES kunde(kundenr)
    # cur.execute(""" CREATE TABLE ordre ( ... ) """)

    # TODO: Lag CREATE TABLE for ordrelinje med SAMMENSATT primærnøkkel:
    #   - ordrenr   INTEGER NOT NULL
    #   - prodnr    INTEGER NOT NULL
    #   - antall    INTEGER NOT NULL
    #   - pris      REAL NOT NULL
    #   - PRIMARY KEY (ordrenr, prodnr)
    #   - FOREIGN KEY (ordrenr) REFERENCES ordre(ordrenr)
    #   - FOREIGN KEY (prodnr)  REFERENCES produkt(prodnr)
    # cur.execute(""" CREATE TABLE ordrelinje ( ... ) """)

    ${SEED_DATA}
    db.commit()

init_db()
` + TEST_SCHEMA_ORDERS;

const S2_SOLUTION =
  buildDbInit({ basics: true, orders: true, seed: true, enableForeignKeys: true }) +
  TEST_SCHEMA_ORDERS;

// ────────────────────────────────────────────────────────────────────────────
// STEG 3+ — appen er bygd på fullt skjema (DB_INIT)
// ────────────────────────────────────────────────────────────────────────────

const S3_STARTER = DB_INIT + APP_INIT + PASSWORD_HELPERS + `
# TODO: Lag en POST /register-route som:
#   - leser brukernavn + passord fra request.get_json()
#   - returnerer 400 hvis felt mangler
#   - returnerer 409 hvis brukernavnet finnes fra før
#   - hasher passordet med hash_passord() før INSERT
#   - returnerer 201 + {opprettet, kundenr} ved suksess

` + TEST_REGISTER;

const S3_SOLUTION = DB_INIT + APP_INIT + PASSWORD_HELPERS + REGISTER_SOLUTION + TEST_REGISTER;

const S4_STARTER =
  DB_INIT + APP_INIT + PASSWORD_HELPERS + REGISTER_SOLUTION + `
# TODO: Lag POST /login som:
#   - finner kunde basert på brukernavn
#   - sjekker passord med sjekk_passord()
#   - setter session["kundenr"] hvis ok
#   - returnerer 401 ved feil passord eller ukjent bruker
# Lag også POST /logout som tømmer session.

` + TEST_LOGIN;

const S4_SOLUTION =
  DB_INIT + APP_INIT + PASSWORD_HELPERS + REGISTER_SOLUTION + LOGIN_SOLUTION + TEST_LOGIN;

const S5_STARTER =
  DB_INIT + APP_INIT + PASSWORD_HELPERS + REGISTER_SOLUTION + LOGIN_SOLUTION + `
# TODO:
#   - Lag en @login_required-decorator som blokkerer (401) når
#     "kundenr" ikke er i session.
#   - Beskytt en GET /min-side-route som returnerer brukernavn + epost
#     for den innloggede kunden.

` + TEST_MIN_SIDE;

const S5_SOLUTION =
  DB_INIT + APP_INIT + PASSWORD_HELPERS + REGISTER_SOLUTION + LOGIN_SOLUTION +
  LOGIN_REQUIRED_SOLUTION + TEST_MIN_SIDE;

const S6_STARTER =
  DB_INIT + APP_INIT + PASSWORD_HELPERS + REGISTER_SOLUTION + LOGIN_SOLUTION +
  LOGIN_REQUIRED_SOLUTION + `
# TODO:
#   - GET /produkter — returner alle produkter som JSON
#   - POST /kurv/legg-til (krever login) — legg prodnr + antall i session["kurv"]
#   - GET /kurv (krever login) — returner gjeldende kurv

` + TEST_CART;

const S6_SOLUTION =
  DB_INIT + APP_INIT + PASSWORD_HELPERS + REGISTER_SOLUTION + LOGIN_SOLUTION +
  LOGIN_REQUIRED_SOLUTION + PRODUCTS_AND_CART_SOLUTION + TEST_CART;

const S7_STARTER =
  DB_INIT + APP_INIT + PASSWORD_HELPERS + REGISTER_SOLUTION + LOGIN_SOLUTION +
  LOGIN_REQUIRED_SOLUTION + PRODUCTS_AND_CART_SOLUTION + `
# TODO: POST /checkout (krever login) som:
#   - INSERTer en rad i ordre med kundenr + dato
#   - For hver linje i kurven: INSERT i ordrelinje + UPDATE produkt.lager
#   - Bruker transaksjon (commit/rollback) — alt eller ingenting
#   - Tømmer session["kurv"] ved suksess
#   - Returnerer {ordrenr} med 201, eller 409 hvis lager ikke holder

` + TEST_CHECKOUT;

const S7_SOLUTION =
  DB_INIT + APP_INIT + PASSWORD_HELPERS + REGISTER_SOLUTION + LOGIN_SOLUTION +
  LOGIN_REQUIRED_SOLUTION + PRODUCTS_AND_CART_SOLUTION + CHECKOUT_SOLUTION + TEST_CHECKOUT;

const S8_STARTER =
  DB_INIT + APP_INIT + PASSWORD_HELPERS + REGISTER_SOLUTION + LOGIN_SOLUTION +
  LOGIN_REQUIRED_SOLUTION + PRODUCTS_AND_CART_SOLUTION + CHECKOUT_SOLUTION + `
# TODO:
#   - Lag @admin_required-decorator: 401 uten login, 403 uten admin-flag
#   - GET /mine-ordrer (login_required): returner kundens ordrer + totalsum
#   - GET /admin/ordrer (admin_required): returner ALLE ordrer + brukernavn
# Test-endepunktet /_testhjelp/login-som-admin er allerede satt opp under,
# slik at testene kan verifisere admin-routen uten å håndtere passord-hash.

` + TEST_ORDER_HISTORY;

const S8_SOLUTION =
  DB_INIT + APP_INIT + PASSWORD_HELPERS + REGISTER_SOLUTION + LOGIN_SOLUTION +
  LOGIN_REQUIRED_SOLUTION + PRODUCTS_AND_CART_SOLUTION + CHECKOUT_SOLUTION +
  ORDER_HISTORY_AND_ADMIN_SOLUTION + TEST_ORDER_HISTORY;

const S9_STARTER =
  DB_INIT + APP_INIT + PASSWORD_HELPERS + REGISTER_SOLUTION + LOGIN_SOLUTION +
  LOGIN_REQUIRED_SOLUTION + PRODUCTS_AND_CART_SOLUTION + CHECKOUT_SOLUTION +
  ORDER_HISTORY_AND_ADMIN_SOLUTION + `
# TODO: Render produktlista som ekte HTML med Jinja:
#   - Lag en string-template PRODUKT_HTML med {% for %}-løkke over produkter
#   - GET /butikk: hent produkter, finn brukernavn fra session, render
#   - Bruk render_template_string fra flask
# Templaten skal vise pris, lager, og en login-lenke når man IKKE er innlogget.

` + TEST_HTML_TEMPLATE;

const S9_SOLUTION =
  DB_INIT + APP_INIT + PASSWORD_HELPERS + REGISTER_SOLUTION + LOGIN_SOLUTION +
  LOGIN_REQUIRED_SOLUTION + PRODUCTS_AND_CART_SOLUTION + CHECKOUT_SOLUTION +
  ORDER_HISTORY_AND_ADMIN_SOLUTION + HTML_TEMPLATES_SOLUTION + TEST_HTML_TEMPLATE;

const S10_STARTER =
  DB_INIT + APP_INIT + PASSWORD_HELPERS + REGISTER_SOLUTION + LOGIN_SOLUTION +
  LOGIN_REQUIRED_SOLUTION + PRODUCTS_AND_CART_SOLUTION + CHECKOUT_SOLUTION +
  ORDER_HISTORY_AND_ADMIN_SOLUTION + HTML_TEMPLATES_SOLUTION + `
# TODO: Beskytt alle POST-endepunkter (unntatt /login og /register) med CSRF:
#   - GET /csrf returnerer en token, lagret i session
#   - @app.before_request sjekker X-CSRF-Token-headeren på alle POSTs
#     og avviser med 403 hvis token mangler eller ikke matcher

` + TEST_CSRF;

const S10_SOLUTION =
  DB_INIT + APP_INIT + PASSWORD_HELPERS + REGISTER_SOLUTION + LOGIN_SOLUTION +
  LOGIN_REQUIRED_SOLUTION + PRODUCTS_AND_CART_SOLUTION + CHECKOUT_SOLUTION +
  ORDER_HISTORY_AND_ADMIN_SOLUTION + HTML_TEMPLATES_SOLUTION +
  CSRF_SOLUTION + TEST_CSRF;

export const PROJECT_STEPS: ProjectStep[] = [
  {
    id: "p1-schema-basics",
    concept: "Schema (PK, UNIQUE)",
    title: "1. Lag kunde- og produkt-tabellene",
    task:
      "Skriv CREATE TABLE-setningene for kunde og produkt med riktig PRIMARY KEY, UNIQUE og NOT NULL. Dette er fundamentet for hele nettbutikken.",
    context:
      "Vi bygger databasen MED hånden. kunde får auto-økende primærnøkkel (AUTOINCREMENT) og UNIQUE-krav på brukernavn så ingen kan registrere seg dobbelt. produkt har en manuell primærnøkkel (vi velger prodnr selv) og DEFAULT på lager-feltet. Kommentarene i koden viser nøyaktig hvilke kolonner som skal med.",
    starter: S1_STARTER,
    solution: S1_SOLUTION,
    requires: ["flask"],
    hints: [
      'cur.execute(""" CREATE TABLE navn (...) """) — trippel-quotes lar deg skrive over flere linjer',
      "AUTOINCREMENT må stå rett etter PRIMARY KEY på INTEGER-kolonner",
      "UNIQUE NOT NULL = ingen duplikater og ingen NULL — perfekt for brukernavn",
      "Seed-koden under er allerede skrevet — den feiler hvis tabellene mangler",
    ],
  },
  {
    id: "p2-schema-orders",
    concept: "Schema (FK, sammensatt PK)",
    title: "2. Lag ordre + ordrelinje med fremmednøkler",
    task:
      "Skriv CREATE TABLE for ordre (med FK til kunde) og ordrelinje (med sammensatt PK + to FK-er). Dette gjør at vi kan lagre hvem som kjøpte hva.",
    context:
      "Hver ordrelinje har en SAMMENSATT primærnøkkel (ordrenr, prodnr) — det hindrer dobbel-registrering av samme produkt på samme ordre. Den har ÒG to fremmednøkler: én til ordre (eieren) og én til produkt. Merk: SQLite må eksplisitt slå på FK-håndhevelse med PRAGMA foreign_keys = ON — i MySQL er det på som standard.",
    starter: S2_STARTER,
    solution: S2_SOLUTION,
    requires: ["flask"],
    hints: [
      "FOREIGN KEY (kolonne) REFERENCES tabell(kolonne) — etter alle vanlige kolonner",
      "PRIMARY KEY (kol_a, kol_b) på en EGEN linje gir sammensatt PK",
      "ordrelinje.pris kopieres fra produkt.pris ved kjøpstidspunktet — derfor trengs den i tabellen",
      "Testen prøver å sette inn ordrelinje med ugyldig prodnr — FK-en skal blokkere det",
    ],
  },
  {
    id: "p3-register",
    concept: "Registrering",
    title: "3. Registrér nye brukere",
    task:
      "POST /register tar imot brukernavn, passord, epost (JSON), hasher passordet og legger inn ny rad i kunde. Avvis duplikater (409) og manglende felt (400).",
    context:
      "Passord skal ALDRI lagres i klartekst. Vi bruker en enkel salt+sha256 her — i prod ville det vært bcrypt eller argon2. Funksjonene hash_passord() og sjekk_passord() er allerede skrevet for deg.",
    starter: S3_STARTER,
    solution: S3_SOLUTION,
    requires: ["flask"],
    hints: [
      "request.get_json() — None hvis bodyen ikke er JSON",
      "Sjekk om brukernavn finnes med SELECT 1 FROM kunde WHERE brukernavn = %s",
      "cur.lastrowid gir deg den nye kundens id etter INSERT",
    ],
  },
  {
    id: "p4-login",
    concept: "Login & sessions",
    title: "4. Login og logout",
    task:
      "POST /login slår opp brukeren, verifiserer passordet med sjekk_passord(), og setter session['kundenr']. POST /logout tømmer session.",
    context:
      "Flask sin session er en signert cookie — du må sette app.config['SECRET_KEY'] for at den skal virke (allerede gjort i toppen). test_client() holder cookies mellom requester automatisk.",
    starter: S4_STARTER,
    solution: S4_SOLUTION,
    requires: ["flask"],
    hints: [
      "session er dict-aktig: session['kundenr'] = ...",
      "Returner alltid 401 ved feil — ikke lekk om brukernavnet finnes",
      "session.pop('kundenr', None) er trygg logout",
    ],
  },
  {
    id: "p5-login-required",
    concept: "Adgangskontroll",
    title: "5. Beskytt /min-side med @login_required",
    task:
      "Lag en decorator som blokkerer (401) requester der 'kundenr' ikke er i session, og beskytt en GET /min-side-route med den.",
    context:
      "Decorator-mønsteret er essensielt i Flask: én funksjon kan beskytte hundrevis av routes. Bruk functools.wraps for å bevare navn + dokstring.",
    starter: S5_STARTER,
    solution: S5_SOLUTION,
    requires: ["flask"],
    hints: [
      "from functools import wraps",
      "Decorator returnerer funksjonen 'wrapper' som tar *args, **kwargs",
      "Husk @wraps(view) — ellers får alle routes navnet 'wrapper'",
    ],
  },
  {
    id: "p6-cart",
    concept: "Handlekurv",
    title: "6. Produkter og handlekurv",
    task:
      "Lag GET /produkter (offentlig), POST /kurv/legg-til (krever login) som lagrer kurven i session, og GET /kurv som returnerer den.",
    context:
      "Handlekurven holdes i session — den er en liten dict {prodnr: antall}. Det betyr at den følger brukeren mellom requester uten at vi trenger en kurv-tabell i DB-en. Først ved checkout skrives den til ordrelinje.",
    starter: S6_STARTER,
    solution: S6_SOLUTION,
    requires: ["flask"],
    hints: [
      "Nøkkelen i session blir str (JSON), så bruk str(prodnr) som key",
      "Husk å sette session['kurv'] = kurv etter endring — Flask trenger reassignment",
      "session.get('kurv', {}) gir tom kurv som default",
    ],
  },
  {
    id: "p7-checkout",
    concept: "Transaksjoner",
    title: "7. Checkout som lagrer ordre",
    task:
      "POST /checkout flytter kurven fra session til ordre + ordrelinje, trekker fra lager, og bruker transaksjon (commit/rollback) — alt eller ingenting.",
    context:
      "Dette er den vanskeligste delen — flere INSERTs og UPDATEs som må lykkes sammen. Hvis lageret ikke holder for én linje, må alle endringer rulles tilbake. Husk å låse prisen NÅ (ved kjøpstidspunktet), ikke når kunden måtte se på ordren senere.",
    starter: S7_STARTER,
    solution: S7_SOLUTION,
    requires: ["flask"],
    hints: [
      "Lagrings-pris hentes fra produkt.pris ved kjøp og kopieres inn i ordrelinje.pris",
      "Bruk try/except — db.rollback() i except, db.commit() ved suksess",
      "session.pop('kurv', None) etter vellykket checkout",
    ],
  },
  {
    id: "p8-history-admin",
    concept: "Roller & historikk",
    title: "8. Ordrehistorikk og admin-rolle",
    task:
      "GET /mine-ordrer viser kundens egne ordrer. GET /admin/ordrer viser ALLE ordrer — beskyttet av @admin_required-decoratoren som sjekker admin-flagget i kunde-tabellen.",
    context:
      "Adgangskontroll med ROLLER er vanlig i ekte apper: vanlige kunder ser bare sine egne data, mens admin har et overordnet view. Kunde-tabellen har et admin-flag (INTEGER 0 eller 1) — vi seedet en admin-bruker i steg 1. JOIN brukes her for å vise brukernavn ved siden av hver ordre i admin-visningen.",
    starter: S8_STARTER,
    solution: S8_SOLUTION,
    requires: ["flask"],
    hints: [
      "@admin_required må først sjekke login (401), så admin-flag (403)",
      "JOIN kunde for å hente brukernavn til admin-listen",
      "Subquery (SELECT SUM(...)) gir totalsum per ordre — eller bruk GROUP BY",
    ],
  },
  {
    id: "p9-html",
    concept: "Jinja-templates",
    title: "9. Render produkter som ekte HTML",
    task:
      "Lag en GET /butikk-route som rendrer en HTML-side med Jinja: produktliste, priser, lagerstatus, og en login-lenke når brukeren ikke er innlogget.",
    context:
      "Frem til nå har vi bare sendt JSON. Nå rendrer vi ekte HTML med Jinja sin {% for %} og {% if %}. Vi bruker render_template_string for å holde alt i én fil her — i en ekte app ville templaten ligget i templates/butikk.html og vi ville brukt render_template('butikk.html', ...). Jinja autoescaper alle {{ }}-uttrykk så XSS-beskyttelsen er innebygd.",
    starter: S9_STARTER,
    solution: S9_SOLUTION,
    requires: ["flask"],
    hints: [
      "{% for p in produkter %} ... {% endfor %} — løkker",
      "{% if brukernavn %} ... {% else %} ... {% endif %} — betingelser",
      "{{ p.navn }} skriver ut feltet — autoescaping beskytter mot XSS",
      "render_template_string(TEMPLATE, produkter=..., brukernavn=...)",
    ],
  },
  {
    id: "p10-csrf",
    concept: "Sikkerhet",
    title: "10. CSRF-beskyttelse på alle POSTs",
    task:
      "Beskytt mot Cross-Site Request Forgery: GET /csrf gir en session-bundet token, og @app.before_request avviser POSTs uten gyldig X-CSRF-Token-header (unntatt /login og /register).",
    context:
      "Uten CSRF kan en ondsinnet side få nettleseren til å POSTe til /kurv/legg-til eller /checkout med kundens cookie — angriperen handler i kundens navn. Tokenet beviser at requesten kom fra en side angriperen IKKE kontrollerer.",
    starter: S10_STARTER,
    solution: S10_SOLUTION,
    requires: ["flask"],
    hints: [
      "secrets.token_hex(16) gir 32 hex-tegn — nok entropi",
      "@app.before_request kjøres før hver request — perfekt sted for global sjekk",
      "request.headers.get('X-CSRF-Token', '') gir tom streng som default",
    ],
  },
];
