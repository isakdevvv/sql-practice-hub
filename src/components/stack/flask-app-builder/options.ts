import type { AppOption } from "./types";

/**
 * Alle options brukeren kan krysse av i Flask App Builder. Hver option
 * leverer kode-fragmenter som komponeres av assemble.ts.
 *
 * Det er bevisst lagt på mange options — målet er at brukeren skal se
 * mange byggesteiner og hvordan de henger sammen. Antall = 28.
 */
export const OPTIONS: readonly AppOption[] = [
  // ============ KJERNE (alltid på) ====================================
  {
    id: "core-app",
    category: "core",
    label: "Flask-app + secret key",
    description: "Oppretter app-instans med en secret_key for sessions/CSRF.",
    defaultOn: true,
    contributes: {
      imports: ["from flask import Flask"],
      config: [`app = Flask(__name__)\napp.secret_key = "bytt-meg-i-produksjon"`],
    },
  },

  // ============ SIDER =================================================
  {
    id: "page-hjem",
    category: "pages",
    label: "Hjem-side (/)",
    description: "Enkel forside med tittel og kort tekst.",
    defaultOn: true,
    contributes: {
      imports: ["from flask import render_template_string"],
      routes: [
        `@app.route("/")
def hjem():
    return render_template_string(TEMPLATE_HJEM)`,
      ],
      templates: {
        TEMPLATE_HJEM: `{% extends "base" %}
{% block content %}
  <div class="px-4 py-5 my-5 text-center">
    <h1 class="display-5 fw-bold">Velkommen til Butikken</h1>
    <p class="lead">En liten Flask-app generert av Builder-en.</p>
  </div>
{% endblock %}`,
      },
    },
  },
  {
    id: "page-om",
    category: "pages",
    label: "Om-side (/om)",
    description: "Statisk informasjon om appen.",
    contributes: {
      routes: [
        `@app.route("/om")
def om():
    return render_template_string(TEMPLATE_OM)`,
      ],
      templates: {
        TEMPLATE_OM: `{% extends "base" %}
{% block content %}
  <h1 class="mb-3">Om</h1>
  <p>Denne appen er bygd som en demo av Flask + Bootstrap.</p>
{% endblock %}`,
      },
    },
  },
  {
    id: "page-kontakt",
    category: "pages",
    label: "Kontakt-side (/kontakt)",
    description: "Enkel kontakt-side med adresse og e-post.",
    contributes: {
      routes: [
        `@app.route("/kontakt")
def kontakt():
    return render_template_string(TEMPLATE_KONTAKT)`,
      ],
      templates: {
        TEMPLATE_KONTAKT: `{% extends "base" %}
{% block content %}
  <h1 class="mb-3">Kontakt</h1>
  <ul class="list-unstyled">
    <li><strong>E-post:</strong> hei@butikken.no</li>
    <li><strong>Telefon:</strong> 555-1234</li>
  </ul>
{% endblock %}`,
      },
    },
  },

  // ============ SKJEMAER ==============================================
  {
    id: "form-login",
    category: "forms",
    label: "Login-skjema (/login)",
    description: "E-post + passord med form-control og btn-primary.",
    contributes: {
      imports: ["from flask import request, redirect, url_for"],
      routes: [
        `@app.route("/login", methods=["GET", "POST"])
def login():
    error = None
    if request.method == "POST":
        email = request.form.get("email", "")
        password = request.form.get("password", "")
        # OPT_AUTH_VERIFY  # auth-options hekker sjekken inn her
        if email and password:
            return redirect(url_for("hjem"))
        error = "E-post eller passord mangler"
    return render_template_string(TEMPLATE_LOGIN, error=error)`,
      ],
      templates: {
        TEMPLATE_LOGIN: `{% extends "base" %}
{% block content %}
  <h1 class="mb-3">Logg inn</h1>
  {% if error %}<div class="alert alert-danger">{{ error }}</div>{% endif %}
  <form method="post" class="col-md-6">
    <div class="mb-3">
      <label class="form-label">E-post</label>
      <input type="email" name="email" class="form-control" required>
    </div>
    <div class="mb-3">
      <label class="form-label">Passord</label>
      <input type="password" name="password" class="form-control" required>
    </div>
    <button type="submit" class="btn btn-primary">Logg inn</button>
  </form>
{% endblock %}`,
      },
    },
  },
  {
    id: "form-register",
    category: "forms",
    label: "Registreringsskjema (/registrer)",
    description: "Navn, e-post, passord med Bootstrap-skjema.",
    contributes: {
      imports: ["from flask import request"],
      routes: [
        `@app.route("/registrer", methods=["GET", "POST"])
def registrer():
    melding = None
    if request.method == "POST":
        navn = request.form.get("navn", "")
        if navn:
            melding = f"Velkommen, {navn}!"
    return render_template_string(TEMPLATE_REGISTRER, melding=melding)`,
      ],
      templates: {
        TEMPLATE_REGISTRER: `{% extends "base" %}
{% block content %}
  <h1 class="mb-3">Registrer ny konto</h1>
  {% if melding %}<div class="alert alert-success">{{ melding }}</div>{% endif %}
  <form method="post" class="col-md-6">
    <div class="mb-3"><label class="form-label">Navn</label>
      <input type="text" name="navn" class="form-control" required></div>
    <div class="mb-3"><label class="form-label">E-post</label>
      <input type="email" name="email" class="form-control" required></div>
    <div class="mb-3"><label class="form-label">Passord</label>
      <input type="password" name="password" class="form-control" required></div>
    <button type="submit" class="btn btn-success">Opprett konto</button>
  </form>
{% endblock %}`,
      },
    },
  },
  {
    id: "form-soek",
    category: "forms",
    label: "Søkeskjema (/sok)",
    description: "Inline søkefelt med btn-outline-secondary.",
    contributes: {
      imports: ["from flask import request"],
      routes: [
        `@app.route("/sok")
def sok():
    q = request.args.get("q", "")
    return render_template_string(TEMPLATE_SOK, q=q)`,
      ],
      templates: {
        TEMPLATE_SOK: `{% extends "base" %}
{% block content %}
  <h1 class="mb-3">Søk</h1>
  <form class="row g-2 mb-4" method="get">
    <div class="col-auto"><input name="q" value="{{ q }}" class="form-control" placeholder="Søk..."></div>
    <div class="col-auto"><button class="btn btn-outline-secondary">Søk</button></div>
  </form>
  {% if q %}<p class="text-muted">Du søkte etter: <code>{{ q }}</code></p>{% endif %}
{% endblock %}`,
      },
    },
  },

  // ============ AUTH ==================================================
  {
    id: "auth-session-login",
    category: "auth",
    label: "Session-basert login",
    description: "Lagrer user_id i session etter vellykket innlogging.",
    requires: ["form-login"],
    contributes: {
      imports: ["from flask import session"],
      helpers: [
        `USERS = {
    "ola@ex.no": {"id": 1, "navn": "Ola"},
    "kari@ex.no": {"id": 2, "navn": "Kari"},
}`,
      ],
      routes: [
        `@app.route("/logout")
def logout():
    session.pop("user_id", None)
    return redirect(url_for("hjem"))`,
      ],
    },
  },
  {
    id: "auth-password-hash",
    category: "auth",
    label: "Passordhashing (werkzeug)",
    description: "Bruk generate_password_hash / check_password_hash.",
    requires: ["form-login"],
    contributes: {
      imports: [
        "from werkzeug.security import generate_password_hash, check_password_hash",
      ],
      helpers: [
        `# Eksempel: passordene er hashet ved registrering
PASSWORD_HASHES = {
    "ola@ex.no": generate_password_hash("hunter2"),
    "kari@ex.no": generate_password_hash("riktig hesteband staple"),
}`,
      ],
    },
  },
  {
    id: "auth-csrf",
    category: "auth",
    label: "CSRF-token",
    description: "Genererer og sjekker token på alle POST-skjemaer.",
    contributes: {
      imports: ["import secrets", "from flask import session, request, abort"],
      helpers: [
        `@app.before_request
def issue_csrf_token():
    if "csrf_token" not in session:
        session["csrf_token"] = secrets.token_urlsafe(32)


def verify_csrf():
    sent = request.form.get("csrf_token", "")
    if not sent or sent != session.get("csrf_token"):
        abort(403, "Ugyldig CSRF-token")


app.jinja_env.globals["csrf_token"] = lambda: session.get("csrf_token", "")`,
      ],
    },
  },

  // ============ DATABASE ==============================================
  {
    id: "db-init",
    category: "database",
    label: "SQLite-database med kunde-tabell",
    description: "Oppretter in-memory DB og legger inn 3 demo-kunder.",
    contributes: {
      imports: ["import sqlite3"],
      helpers: [
        `def get_db():
    if not hasattr(get_db, "_conn"):
        conn = sqlite3.connect(":memory:", check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("""CREATE TABLE kunde (
            id INTEGER PRIMARY KEY,
            navn TEXT NOT NULL,
            epost TEXT
        )""")
        conn.executemany(
            "INSERT INTO kunde (navn, epost) VALUES (?, ?)",
            [("Ola Nordmann", "ola@ex.no"), ("Kari Hansen", "kari@ex.no"),
             ("Per Berg", "per@ex.no")],
        )
        conn.commit()
        get_db._conn = conn
    return get_db._conn`,
      ],
    },
  },
  {
    id: "db-list",
    category: "database",
    label: "Vis kundeliste (/kunder)",
    description: "SELECT-er alle kunder og rendrer dem i en Bootstrap-tabell.",
    requires: ["db-init"],
    contributes: {
      routes: [
        `@app.route("/kunder")
def kunder():
    rows = get_db().execute("SELECT id, navn, epost FROM kunde ORDER BY navn").fetchall()
    return render_template_string(TEMPLATE_KUNDER, kunder=rows)`,
      ],
      templates: {
        TEMPLATE_KUNDER: `{% extends "base" %}
{% block content %}
  <h1 class="mb-3">Kunder</h1>
  <table class="table table-striped table-hover">
    <thead><tr><th>#</th><th>Navn</th><th>E-post</th></tr></thead>
    <tbody>
      {% for k in kunder %}
      <tr><td>{{ k.id }}</td><td>{{ k.navn }}</td><td>{{ k.epost }}</td></tr>
      {% endfor %}
    </tbody>
  </table>
{% endblock %}`,
      },
    },
  },
  {
    id: "db-create",
    category: "database",
    label: "Opprett kunde (POST /kunder)",
    description: "POST-route som setter inn ny kunde og redirecter.",
    requires: ["db-init", "db-list"],
    contributes: {
      imports: ["from flask import request, redirect, url_for"],
      routes: [
        `@app.route("/kunder/ny", methods=["POST"])
def opprett_kunde():
    navn = request.form.get("navn", "").strip()
    epost = request.form.get("epost", "").strip()
    if navn:
        get_db().execute("INSERT INTO kunde (navn, epost) VALUES (?, ?)", (navn, epost))
        get_db().commit()
    return redirect(url_for("kunder"))`,
      ],
    },
  },
  {
    id: "db-delete",
    category: "database",
    label: "Slett kunde (POST /kunder/<id>/slett)",
    description: "Endpoint som sletter kunde basert på id.",
    requires: ["db-init", "db-list"],
    contributes: {
      imports: ["from flask import redirect, url_for"],
      routes: [
        `@app.route("/kunder/<int:kid>/slett", methods=["POST"])
def slett_kunde(kid):
    get_db().execute("DELETE FROM kunde WHERE id = ?", (kid,))
    get_db().commit()
    return redirect(url_for("kunder"))`,
      ],
    },
  },

  // ============ BOOTSTRAP UI ==========================================
  {
    id: "ui-base-template",
    category: "ui",
    label: "Bootstrap base-template",
    description: "<!doctype>-shell med CDN, navbar-slot og Jinja-block content.",
    defaultOn: true,
    contributes: {
      templates: {
        base: `<!doctype html>
<html lang="no">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ title|default("Butikken") }}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
</head>
<body{% if dark_theme %} data-bs-theme="dark"{% endif %}>
  {% block navbar %}{% endblock %}
  <main class="container py-4">
    {% block flash %}{% endblock %}
    {% block content %}{% endblock %}
  </main>
</body>
</html>`,
      },
    },
  },
  {
    id: "ui-navbar",
    category: "ui",
    label: "Bootstrap-navbar",
    description: "Topp-navigasjon med brand + lenker til hjem, kunder, kontakt.",
    requires: ["ui-base-template"],
    defaultOn: true,
    contributes: {
      templates: {
        navbar: `{% block navbar %}
<nav class="navbar navbar-expand-lg bg-light border-bottom">
  <div class="container">
    <a class="navbar-brand" href="/">Butikken</a>
    <div class="navbar-nav">
      <a class="nav-link" href="/">Hjem</a>
      {% if has_kunder %}<a class="nav-link" href="/kunder">Kunder</a>{% endif %}
      <a class="nav-link" href="/om">Om</a>
      <a class="nav-link" href="/kontakt">Kontakt</a>
    </div>
  </div>
</nav>
{% endblock %}`,
      },
    },
  },
  {
    id: "ui-flash",
    category: "ui",
    label: "Flash-meldinger",
    description: "Bruk get_flashed_messages() og vis dem som .alert.",
    requires: ["ui-base-template"],
    contributes: {
      imports: ["from flask import get_flashed_messages"],
      templates: {
        flash: `{% block flash %}
{% for kategori, msg in get_flashed_messages(with_categories=true) %}
  <div class="alert alert-{{ kategori }}">{{ msg }}</div>
{% endfor %}
{% endblock %}`,
      },
    },
  },
  {
    id: "ui-cards",
    category: "ui",
    label: "Card-grid for kunder",
    description: "Bytter tabellen i /kunder med Bootstrap cards i en grid.",
    requires: ["db-list"],
    conflicts: [],
    contributes: {
      templates: {
        TEMPLATE_KUNDER_CARDS: `{% extends "base" %}
{% block content %}
  <h1 class="mb-3">Kunder (kort-visning)</h1>
  <div class="row">
    {% for k in kunder %}
    <div class="col-md-4 mb-3">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">{{ k.navn }}</h5>
          <p class="card-text text-muted">{{ k.epost }}</p>
        </div>
      </div>
    </div>
    {% endfor %}
  </div>
{% endblock %}`,
      },
    },
  },
  {
    id: "ui-dark-theme",
    category: "ui",
    label: "Dark mode",
    description: "Aktiverer data-bs-theme=\"dark\" på <body>.",
    requires: ["ui-base-template"],
    contributes: {
      helpers: [`app.jinja_env.globals["dark_theme"] = True`],
    },
  },
  {
    id: "ui-footer",
    category: "ui",
    label: "Footer",
    description: "Sticky footer med copyright og lenker.",
    requires: ["ui-base-template"],
    contributes: {
      templates: {
        footer: `<footer class="bg-light border-top py-3 mt-5">
  <div class="container text-center text-muted small">
    © 2026 Butikken AS · <a href="/om">Om</a> · <a href="/kontakt">Kontakt</a>
  </div>
</footer>`,
      },
    },
  },

  // ============ JSON-API ==============================================
  {
    id: "api-kunder-get",
    category: "api",
    label: "GET /api/kunder (JSON)",
    description: "Returnerer alle kunder som JSON-array.",
    requires: ["db-init"],
    contributes: {
      imports: ["from flask import jsonify"],
      routes: [
        `@app.route("/api/kunder")
def api_kunder():
    rows = get_db().execute("SELECT id, navn, epost FROM kunde").fetchall()
    return jsonify([dict(r) for r in rows])`,
      ],
    },
  },
  {
    id: "api-kunde-get",
    category: "api",
    label: "GET /api/kunder/<id>",
    description: "Returnerer én kunde eller 404.",
    requires: ["db-init"],
    contributes: {
      imports: ["from flask import jsonify", "from werkzeug.exceptions import NotFound"],
      routes: [
        `@app.route("/api/kunder/<int:kid>")
def api_kunde(kid):
    row = get_db().execute("SELECT id, navn, epost FROM kunde WHERE id = ?", (kid,)).fetchone()
    if row is None:
        raise NotFound(f"Ingen kunde med id={kid}")
    return jsonify(dict(row))`,
      ],
    },
  },
  {
    id: "api-kunder-post",
    category: "api",
    label: "POST /api/kunder",
    description: "Opprett kunde via JSON-body.",
    requires: ["db-init"],
    contributes: {
      imports: ["from flask import request, jsonify"],
      routes: [
        `@app.route("/api/kunder", methods=["POST"])
def api_kunde_ny():
    data = request.get_json(silent=True) or {}
    navn = data.get("navn", "").strip()
    if not navn:
        return jsonify({"feil": "navn er påkrevd"}), 400
    cur = get_db().execute(
        "INSERT INTO kunde (navn, epost) VALUES (?, ?)",
        (navn, data.get("epost", "")),
    )
    get_db().commit()
    return jsonify({"id": cur.lastrowid, "navn": navn}), 201`,
      ],
    },
  },
  {
    id: "api-bearer",
    category: "api",
    label: "Bearer-token-sjekk",
    description: "Beskytter /api/* bak en token i Authorization-header.",
    contributes: {
      imports: ["from functools import wraps", "from flask import request, jsonify"],
      helpers: [
        `API_TOKEN = "demo-token-bytt-meg"


def krev_bearer(fn):
    @wraps(fn)
    def wrap(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"feil": "mangler Bearer-token"}), 401
        if auth[7:] != API_TOKEN:
            return jsonify({"feil": "ugyldig token"}), 403
        return fn(*args, **kwargs)
    return wrap`,
      ],
    },
  },
  {
    id: "api-error-handler",
    category: "api",
    label: "404 → JSON",
    description: "Returnerer JSON-feilmelding i stedet for HTML på 404.",
    contributes: {
      imports: ["from flask import jsonify"],
      helpers: [
        `@app.errorhandler(404)
def ikke_funnet(_e):
    return jsonify({"feil": "ikke funnet"}), 404`,
      ],
    },
  },
];
