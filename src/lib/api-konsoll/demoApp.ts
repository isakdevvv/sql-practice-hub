// A small Flask app that the API console boots inside Pyodide so users have
// real endpoints to send requests against. Covers GET/POST/PUT/DELETE,
// JSON bodies, query params, Authorization (Bearer + Basic), CSRF tokens,
// and a tiny in-memory DB so requests have observable side-effects.

export const DEMO_APP_PYTHON = `
import sys
import secrets
import sqlite3 as _sqlite
from flask import Flask, request, jsonify, abort, session

# Tiny in-memory database — same shape as the e-commerce dataset minus the orders.
db = _sqlite.connect(":memory:")
cur = db.cursor()
cur.execute("CREATE TABLE produkter (id INTEGER PRIMARY KEY, navn TEXT, kategori TEXT, pris REAL, lager INTEGER)")
cur.executemany("INSERT INTO produkter VALUES (?,?,?,?,?)", [
    (1, "Laptop", "Elektronikk", 12000, 5),
    (2, "Telefon", "Elektronikk", 8000, 12),
    (3, "Sko", "Klaer", 999, 30),
    (4, "Bok", "Boker", 199, 100),
])
cur.execute("CREATE TABLE kunder (id INTEGER PRIMARY KEY, brukernavn TEXT UNIQUE, passord TEXT)")
cur.executemany("INSERT INTO kunder VALUES (?,?,?)", [
    (1, "ola", "hemmelig"),
    (2, "kari", "passord123"),
])
db.commit()

API_TOKEN = "demo-token-abc123"

app = Flask(__name__)
app.config["SECRET_KEY"] = "api-konsoll-demo-key"

def auth_ok():
    header = request.headers.get("Authorization", "")
    return header == f"Bearer {API_TOKEN}"

def get_csrf():
    if "csrf" not in session:
        session["csrf"] = secrets.token_hex(8)
    return session["csrf"]

# ─── Public read ─────────────────────────────────────────────────────────
@app.route("/api/produkter", methods=["GET"])
def hent_produkter():
    cur.execute("SELECT id, navn, kategori, pris, lager FROM produkter")
    rows = cur.fetchall()
    # Optional filter via query-param
    kategori = request.args.get("kategori")
    if kategori:
        rows = [r for r in rows if r[2].lower() == kategori.lower()]
    return jsonify([
        {"id": r[0], "navn": r[1], "kategori": r[2], "pris": r[3], "lager": r[4]}
        for r in rows
    ])

@app.route("/api/produkter/<int:produkt_id>", methods=["GET"])
def hent_produkt(produkt_id):
    cur.execute("SELECT id, navn, kategori, pris, lager FROM produkter WHERE id = ?", (produkt_id,))
    r = cur.fetchone()
    if not r:
        abort(404)
    return jsonify({"id": r[0], "navn": r[1], "kategori": r[2], "pris": r[3], "lager": r[4]})

# ─── Authenticated write (Bearer token) ──────────────────────────────────
@app.route("/api/produkter", methods=["POST"])
def lag_produkt():
    if not auth_ok():
        return jsonify({"feil": "krever Authorization: Bearer <token>"}), 401
    data = request.get_json(silent=True) or {}
    krav = ["id", "navn", "kategori", "pris", "lager"]
    if not all(k in data for k in krav):
        return jsonify({"feil": f"mangler felt — krever {krav}"}), 400
    cur.execute("INSERT INTO produkter VALUES (?,?,?,?,?)",
                (data["id"], data["navn"], data["kategori"], data["pris"], data["lager"]))
    db.commit()
    return jsonify({"opprettet": data["id"]}), 201

@app.route("/api/produkter/<int:produkt_id>", methods=["PUT"])
def erstatt_produkt(produkt_id):
    if not auth_ok():
        return jsonify({"feil": "krever Bearer-token"}), 401
    data = request.get_json(silent=True) or {}
    cur.execute("SELECT 1 FROM produkter WHERE id = ?", (produkt_id,))
    if not cur.fetchone():
        abort(404)
    cur.execute(
        "UPDATE produkter SET navn=?, kategori=?, pris=?, lager=? WHERE id=?",
        (data.get("navn"), data.get("kategori"), data.get("pris"), data.get("lager"), produkt_id)
    )
    db.commit()
    return jsonify({"oppdatert": produkt_id})

@app.route("/api/produkter/<int:produkt_id>", methods=["DELETE"])
def slett_produkt(produkt_id):
    if not auth_ok():
        return jsonify({"feil": "krever Bearer-token"}), 401
    cur.execute("DELETE FROM produkter WHERE id = ?", (produkt_id,))
    if cur.rowcount == 0:
        abort(404)
    db.commit()
    return ("", 204)

# ─── Session-based login (Cookie) ────────────────────────────────────────
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    cur.execute("SELECT id FROM kunder WHERE brukernavn = ? AND passord = ?",
                (data.get("brukernavn"), data.get("passord")))
    rad = cur.fetchone()
    if not rad:
        return jsonify({"feil": "feil brukernavn eller passord"}), 401
    session["bruker_id"] = rad[0]
    return jsonify({"innlogget": data["brukernavn"]})

@app.route("/api/min-side", methods=["GET"])
def min_side():
    if "bruker_id" not in session:
        return jsonify({"feil": "ikke innlogget"}), 401
    cur.execute("SELECT brukernavn FROM kunder WHERE id = ?", (session["bruker_id"],))
    rad = cur.fetchone()
    return jsonify({"brukernavn": rad[0] if rad else "(ukjent)"})

# ─── CSRF-protected mutation ─────────────────────────────────────────────
@app.route("/api/csrf", methods=["GET"])
def csrf_endpoint():
    return jsonify({"token": get_csrf()})

@app.route("/api/notat", methods=["POST"])
def lagre_notat():
    submitted = request.headers.get("X-CSRF-Token", "")
    expected = session.get("csrf", "")
    if not expected or submitted != expected:
        return jsonify({"feil": "ugyldig eller manglende CSRF-token"}), 403
    data = request.get_json(silent=True) or {}
    return jsonify({"lagret": data.get("notat", "(tomt)")})

# ─── Health/echo ─────────────────────────────────────────────────────────
@app.route("/api/echo", methods=["GET", "POST"])
def echo():
    return jsonify({
        "method": request.method,
        "path": request.path,
        "args": dict(request.args),
        "headers": {k: v for k, v in request.headers.items()},
        "json": request.get_json(silent=True),
    })

# ─── List of routes (for autocomplete) ───────────────────────────────────
def hent_routes():
    out = []
    for rule in app.url_map.iter_rules():
        if rule.endpoint == "static":
            continue
        out.append({
            "path": rule.rule,
            "methods": sorted(m for m in rule.methods if m not in ("HEAD", "OPTIONS")),
        })
    return out
`;
