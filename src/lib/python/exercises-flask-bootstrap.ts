import type { PyExercise } from "./types";

/**
 * Flask + Bootstrap + CSS — oppgaver der studenten lærer å style HTML
 * sendt fra Flask via Jinja-templates. Hver oppgave kjører Flask via
 * app.test_client() og verifiserer at responsen inneholder de riktige
 * Bootstrap-klassene eller CSS-reglene.
 *
 * Studenten lærer:
 *   • Bootstrap-klasser (container, btn, card, table, alert, navbar, grid)
 *   • CSS via <style>-tag i Jinja
 *   • Hvordan Flask leverer HTML med ferdig styling til klienten
 */
export const PY_FLASK_BOOTSTRAP_EXERCISES: PyExercise[] = [
  {
    id: "py-flask-bs-container",
    topic: "Flask + Bootstrap",
    title: "Wrap siden i en Bootstrap container",
    description:
      "Bootstrap (Bootstrap = mest brukte CSS-rammeverket fra Twitter, nå Bootstrap-org) styrer breddene sine med klassen `container`. Lag en route `/` som returnerer en side med Bootstrap-CDN i <head> og en <div class=\"container\">…</div> med en <h1>Velkommen</h1>.",
    requires: ["flask"],
    starter: `from flask import Flask, render_template_string

# === OPPGAVE ===
# Lag en side med Bootstrap-CDN og en .container med <h1>Velkommen</h1>.
#
# • Bootstrap (CSS-rammeverk) leveres via en <link rel="stylesheet" href="...">
# • Klassen "container" gir maks-bredde + horisontal padding
# • CDN-URL: https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css

app = Flask(__name__)

TEMPLATE = """
<!doctype html>
<html>
  <head>
    <!-- TODO: legg til Bootstrap-CDN i <link rel="stylesheet"> -->
  </head>
  <body>
    <!-- TODO: wrap <h1>Velkommen</h1> i en <div class="container"> -->
  </body>
</html>
""".strip()

@app.route("/")
def hjem():
    # TODO: returner render_template_string(TEMPLATE)
    pass


client = app.test_client()
html = client.get("/").data.decode()
print(html)

# Selv-test
assert "bootstrap" in html.lower(), "Mangler Bootstrap-CDN"
assert 'class="container"' in html, "Mangler class=\\"container\\""
assert "<h1>Velkommen</h1>" in html, "Mangler <h1>Velkommen</h1>"
print("OK")
`,
    solution: `from flask import Flask, render_template_string

app = Flask(__name__)

TEMPLATE = """
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  </head>
  <body>
    <div class="container">
      <h1>Velkommen</h1>
    </div>
  </body>
</html>
""".strip()

@app.route("/")
def hjem():
    return render_template_string(TEMPLATE)


client = app.test_client()
html = client.get("/").data.decode()
print(html)

assert "bootstrap" in html.lower()
assert 'class="container"' in html
assert "<h1>Velkommen</h1>" in html
print("OK")
`,
    hints: [
      "Bootstrap leveres som en stylesheet — bruk <link rel=\"stylesheet\" href=\"...\"> i <head>.",
      ".container er Bootstraps standard sideramme: setter max-width per breakpoint og sentrerer.",
      "render_template_string tar en streng og rendrer den som Jinja-mal.",
    ],
    docs: [
      {
        title: "Bootstrap — Containers",
        url: "https://getbootstrap.com/docs/5.3/layout/containers/",
        note: ".container = responsiv fast bredde. .container-fluid = alltid 100%.",
      },
      {
        title: "Bootstrap CDN-installasjon",
        url: "https://getbootstrap.com/docs/5.3/getting-started/introduction/#cdn-links",
        note: "Ett <link>-tag laster all Bootstrap-CSS. JS-bundle er valgfritt.",
      },
    ],
  },
  {
    id: "py-flask-bs-button",
    topic: "Flask + Bootstrap",
    title: "Bootstrap-knapper: btn, btn-primary, btn-lg",
    description:
      "Bootstrap-knapper bygges ved å kombinere klassene `btn` + en farge-modifier (`btn-primary`, `btn-danger`, `btn-success`) + valgfri størrelse (`btn-lg`, `btn-sm`). Lag en side med to knapper: en stor primær \"Lagre\" og en liten farlig \"Slett\".",
    requires: ["flask"],
    starter: `from flask import Flask, render_template_string

# === OPPGAVE ===
# Lag to <button>-elementer:
#   1) Stor primær knapp med teksten "Lagre"     → classes: btn btn-primary btn-lg
#   2) Liten fare-knapp med teksten "Slett"      → classes: btn btn-danger btn-sm
#
# Begge skal være inni en .container.

app = Flask(__name__)

TEMPLATE = """
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  </head>
  <body>
    <div class="container">
      <!-- TODO: legg til de to knappene her -->
    </div>
  </body>
</html>
""".strip()

@app.route("/")
def hjem():
    return render_template_string(TEMPLATE)


client = app.test_client()
html = client.get("/").data.decode()
print(html)

assert 'class="btn btn-primary btn-lg"' in html, "Mangler primær-knappens klasser"
assert 'class="btn btn-danger btn-sm"' in html, "Mangler fare-knappens klasser"
assert ">Lagre<" in html and ">Slett<" in html, "Mangler knappetekst"
print("OK")
`,
    solution: `from flask import Flask, render_template_string

app = Flask(__name__)

TEMPLATE = """
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  </head>
  <body>
    <div class="container">
      <button class="btn btn-primary btn-lg">Lagre</button>
      <button class="btn btn-danger btn-sm">Slett</button>
    </div>
  </body>
</html>
""".strip()

@app.route("/")
def hjem():
    return render_template_string(TEMPLATE)


client = app.test_client()
html = client.get("/").data.decode()
print(html)

assert 'class="btn btn-primary btn-lg"' in html
assert 'class="btn btn-danger btn-sm"' in html
assert ">Lagre<" in html and ">Slett<" in html
print("OK")
`,
    hints: [
      "Bootstrap-knapper trenger basis-klassen `btn` — uten den får du ingen styling.",
      "Farge-modifierne er: btn-primary, btn-secondary, btn-success, btn-danger, btn-warning, btn-info.",
      "Størrelse: btn-lg (stor), btn-sm (liten), eller utelat for default.",
    ],
    docs: [
      {
        title: "Bootstrap — Buttons",
        url: "https://getbootstrap.com/docs/5.3/components/buttons/",
        note: "Kombiner btn + farge + størrelse. .btn-outline-* gir kanter uten fyll.",
      },
    ],
  },
  {
    id: "py-flask-bs-form",
    topic: "Flask + Bootstrap",
    title: "Bootstrap-skjema: form-control og mb-3",
    description:
      "Bootstrap styler skjemaer ved å gi hver <input> klassen `form-control` og pakke hver gruppe i en <div class=\"mb-3\"> (mb-3 = margin-bottom på trinn 3, dvs. avstand under). Lag et login-skjema med e-post og passord.",
    requires: ["flask"],
    starter: `from flask import Flask, render_template_string

# === OPPGAVE ===
# Lag et <form method="post" action="/login"> med:
#   • Et felt for e-post  (type="email", name="email")
#   • Et felt for passord (type="password", name="password")
#   • En submit-knapp     (.btn .btn-primary)
#
# Hvert felt skal være i <div class="mb-3"> med tilhørende <label>.
# Inputene skal ha klassen "form-control".

app = Flask(__name__)

TEMPLATE = """
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  </head>
  <body>
    <div class="container">
      <!-- TODO: bygg skjemaet her -->
    </div>
  </body>
</html>
""".strip()

@app.route("/login", methods=["GET"])
def login():
    return render_template_string(TEMPLATE)


client = app.test_client()
html = client.get("/login").data.decode()
print(html)

assert html.count('class="form-control"') == 2, "Trenger to .form-control inputs"
assert html.count('class="mb-3"') >= 2, "Trenger mb-3 rundt hvert felt"
assert 'type="email"' in html and 'type="password"' in html
assert 'class="btn btn-primary"' in html
print("OK")
`,
    solution: `from flask import Flask, render_template_string

app = Flask(__name__)

TEMPLATE = """
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  </head>
  <body>
    <div class="container">
      <form method="post" action="/login">
        <div class="mb-3">
          <label class="form-label">E-post</label>
          <input type="email" name="email" class="form-control">
        </div>
        <div class="mb-3">
          <label class="form-label">Passord</label>
          <input type="password" name="password" class="form-control">
        </div>
        <button type="submit" class="btn btn-primary">Logg inn</button>
      </form>
    </div>
  </body>
</html>
""".strip()

@app.route("/login", methods=["GET"])
def login():
    return render_template_string(TEMPLATE)


client = app.test_client()
html = client.get("/login").data.decode()
print(html)

assert html.count('class="form-control"') == 2
assert html.count('class="mb-3"') >= 2
assert 'type="email"' in html and 'type="password"' in html
assert 'class="btn btn-primary"' in html
print("OK")
`,
    hints: [
      ".form-control gir inputen full bredde, padding og en lys ramme.",
      ".mb-3 er en margin-utility: m = margin, b = bottom, 3 = spacing-trinn 3 (≈1rem).",
      ".form-label gir konsistent vertikal avstand mellom label og input.",
    ],
    docs: [
      {
        title: "Bootstrap — Forms",
        url: "https://getbootstrap.com/docs/5.3/forms/overview/",
        note: ".form-control + .form-label + mb-3 er standard layout for skjema-rader.",
      },
      {
        title: "Bootstrap — Spacing utilities",
        url: "https://getbootstrap.com/docs/5.3/utilities/spacing/",
        note: "Format: {prop}{sides}-{breakpoint}-{size}. mb-3, mt-2, p-4, mx-auto…",
      },
    ],
  },
  {
    id: "py-flask-bs-table",
    topic: "Flask + Bootstrap",
    title: "Tabell-styling: table, table-striped, table-hover",
    description:
      "Lag en route /kunder som sender en liste med kunder til en Jinja-template og rendrer en stripet, hoverbar tabell med Bootstrap. Klassene `table table-striped table-hover` på <table>-elementet.",
    requires: ["flask"],
    starter: `from flask import Flask, render_template_string

# === OPPGAVE ===
# Loop ut KUNDER som rader i en Bootstrap-tabell.
# Bruk klassene "table table-striped table-hover" på <table>.

app = Flask(__name__)

KUNDER = [
    {"navn": "Ola", "epost": "ola@test.no"},
    {"navn": "Kari", "epost": "kari@test.no"},
    {"navn": "Per", "epost": "per@test.no"},
]

TEMPLATE = """
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  </head>
  <body>
    <div class="container">
      <!-- TODO: bygg en <table> med Bootstrap-klasser. Loop med {% for k in kunder %}. -->
    </div>
  </body>
</html>
""".strip()

@app.route("/kunder")
def kunder():
    return render_template_string(TEMPLATE, kunder=KUNDER)


client = app.test_client()
html = client.get("/kunder").data.decode()
print(html)

assert 'class="table table-striped table-hover"' in html
for k in KUNDER:
    assert k["navn"] in html and k["epost"] in html
print("OK")
`,
    solution: `from flask import Flask, render_template_string

app = Flask(__name__)

KUNDER = [
    {"navn": "Ola", "epost": "ola@test.no"},
    {"navn": "Kari", "epost": "kari@test.no"},
    {"navn": "Per", "epost": "per@test.no"},
]

TEMPLATE = """
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  </head>
  <body>
    <div class="container">
      <table class="table table-striped table-hover">
        <thead>
          <tr><th>Navn</th><th>E-post</th></tr>
        </thead>
        <tbody>
          {% for k in kunder %}
          <tr><td>{{ k.navn }}</td><td>{{ k.epost }}</td></tr>
          {% endfor %}
        </tbody>
      </table>
    </div>
  </body>
</html>
""".strip()

@app.route("/kunder")
def kunder():
    return render_template_string(TEMPLATE, kunder=KUNDER)


client = app.test_client()
html = client.get("/kunder").data.decode()
print(html)

assert 'class="table table-striped table-hover"' in html
for k in KUNDER:
    assert k["navn"] in html and k["epost"] in html
print("OK")
`,
    hints: [
      ".table gir basisstyling (kantlinje, padding). De andre er modifiers.",
      "table-striped = annenhver rad får lys bakgrunn. table-hover = highlight ved hover.",
      "Jinja-loop: {% for k in kunder %} … {% endfor %}.",
    ],
    docs: [
      {
        title: "Bootstrap — Tables",
        url: "https://getbootstrap.com/docs/5.3/content/tables/",
        note: ".table-bordered, .table-sm, .table-dark er andre modifiers.",
      },
    ],
  },
  {
    id: "py-flask-bs-alert",
    topic: "Flask + Bootstrap",
    title: "Alert-bokser: alert-success og alert-danger",
    description:
      "Bootstrap har fem ferdige alert-stiler: success, danger, warning, info, primary. Lag en route som tar imot en `?status=`-parameter og viser en grønn suksess-melding hvis status=ok, eller en rød feil-melding ellers.",
    requires: ["flask"],
    starter: `from flask import Flask, request, render_template_string

# === OPPGAVE ===
# Hvis ?status=ok  → <div class="alert alert-success"> med teksten "Lagret!"
# Ellers          → <div class="alert alert-danger">  med teksten "Noe gikk galt"
#
# Send status til Jinja og bruk {% if %}…{% else %}…{% endif %}.

app = Flask(__name__)

TEMPLATE = """
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  </head>
  <body>
    <div class="container">
      <!-- TODO: vis alert basert på status -->
    </div>
  </body>
</html>
""".strip()

@app.route("/melding")
def melding():
    # TODO: hent ?status= og send til templaten
    pass


client = app.test_client()
html_ok = client.get("/melding?status=ok").data.decode()
html_feil = client.get("/melding?status=annet").data.decode()

assert 'class="alert alert-success"' in html_ok and "Lagret!" in html_ok
assert 'class="alert alert-danger"' in html_feil and "Noe gikk galt" in html_feil
print("OK")
print(html_ok)
print("---")
print(html_feil)
`,
    solution: `from flask import Flask, request, render_template_string

app = Flask(__name__)

TEMPLATE = """
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  </head>
  <body>
    <div class="container">
      {% if status == "ok" %}
        <div class="alert alert-success">Lagret!</div>
      {% else %}
        <div class="alert alert-danger">Noe gikk galt</div>
      {% endif %}
    </div>
  </body>
</html>
""".strip()

@app.route("/melding")
def melding():
    status = request.args.get("status", "")
    return render_template_string(TEMPLATE, status=status)


client = app.test_client()
html_ok = client.get("/melding?status=ok").data.decode()
html_feil = client.get("/melding?status=annet").data.decode()

assert 'class="alert alert-success"' in html_ok and "Lagret!" in html_ok
assert 'class="alert alert-danger"' in html_feil and "Noe gikk galt" in html_feil
print("OK")
print(html_ok)
print("---")
print(html_feil)
`,
    hints: [
      "request.args.get('status', '') gir parameter eller tom streng som default.",
      "Jinja-if: {% if x == 'ok' %} … {% else %} … {% endif %}.",
      "Alert-fargene matcher knappene: alert-success/danger/warning/info/primary.",
    ],
    docs: [
      {
        title: "Bootstrap — Alerts",
        url: "https://getbootstrap.com/docs/5.3/components/alerts/",
        note: "Bruk .alert-dismissible + JS for å kunne lukke alerten med kryss.",
      },
    ],
  },
  {
    id: "py-flask-bs-grid",
    topic: "Flask + Bootstrap",
    title: "Grid: row og col-md-6",
    description:
      "Bootstrap-grid er 12-kolonners. En `<div class=\"row\">` deler bredden i celler bestemt av col-klasser. Lag en side med to like brede paneler ved siden av hverandre fra md-breakpoint og oppover.",
    requires: ["flask"],
    starter: `from flask import Flask, render_template_string

# === OPPGAVE ===
# Lag layouten:
#   <div class="container">
#     <div class="row">
#       <div class="col-md-6"> ... Panel A ... </div>
#       <div class="col-md-6"> ... Panel B ... </div>
#     </div>
#   </div>
#
# Hvert panel skal ha en <h2>Panel A</h2> / <h2>Panel B</h2>.

app = Flask(__name__)

TEMPLATE = """
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  </head>
  <body>
    <!-- TODO: container → row → to col-md-6 -->
  </body>
</html>
""".strip()

@app.route("/")
def hjem():
    return render_template_string(TEMPLATE)


client = app.test_client()
html = client.get("/").data.decode()
print(html)

assert 'class="container"' in html
assert 'class="row"' in html
assert html.count('class="col-md-6"') == 2
assert "Panel A" in html and "Panel B" in html
print("OK")
`,
    solution: `from flask import Flask, render_template_string

app = Flask(__name__)

TEMPLATE = """
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  </head>
  <body>
    <div class="container">
      <div class="row">
        <div class="col-md-6"><h2>Panel A</h2></div>
        <div class="col-md-6"><h2>Panel B</h2></div>
      </div>
    </div>
  </body>
</html>
""".strip()

@app.route("/")
def hjem():
    return render_template_string(TEMPLATE)


client = app.test_client()
html = client.get("/").data.decode()
print(html)

assert 'class="container"' in html
assert 'class="row"' in html
assert html.count('class="col-md-6"') == 2
assert "Panel A" in html and "Panel B" in html
print("OK")
`,
    hints: [
      "12-kolonners grid: col-md-6 + col-md-6 = full bredde fra md og oppover.",
      "På små skjermer (<768px) stables col-md-* automatisk over hverandre.",
      ".container → .row → .col-* er hierarkiet du nesten alltid bruker.",
    ],
    docs: [
      {
        title: "Bootstrap — Grid",
        url: "https://getbootstrap.com/docs/5.3/layout/grid/",
        note: "Breakpoints: sm (≥576), md (≥768), lg (≥992), xl (≥1200), xxl (≥1400).",
      },
    ],
  },
  {
    id: "py-flask-bs-card",
    topic: "Flask + Bootstrap",
    title: "Kort-komponent: card, card-body og card-title",
    description:
      "Et Bootstrap-card er en boks med skygge og avrundede hjørner — perfekt for produktlister og oppslag. Lag en route /produkter som rendrer hvert produkt som et card i en grid-rad.",
    requires: ["flask"],
    starter: `from flask import Flask, render_template_string

# === OPPGAVE ===
# For hvert produkt: bygg
#   <div class="col-md-4">
#     <div class="card">
#       <div class="card-body">
#         <h5 class="card-title">{{ navn }}</h5>
#         <p class="card-text">{{ pris }} kr</p>
#       </div>
#     </div>
#   </div>

app = Flask(__name__)

PRODUKTER = [
    {"navn": "Laptop", "pris": 12000},
    {"navn": "Telefon", "pris": 8000},
    {"navn": "Sko", "pris": 1000},
]

TEMPLATE = """
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  </head>
  <body>
    <div class="container">
      <div class="row">
        <!-- TODO: loop produkter som card-er i col-md-4 -->
      </div>
    </div>
  </body>
</html>
""".strip()

@app.route("/produkter")
def produkter():
    return render_template_string(TEMPLATE, produkter=PRODUKTER)


client = app.test_client()
html = client.get("/produkter").data.decode()
print(html)

assert html.count('class="card"') == 3
assert html.count('class="card-title"') == 3
assert html.count('class="card-text"') == 3
for p in PRODUKTER:
    assert p["navn"] in html
print("OK")
`,
    solution: `from flask import Flask, render_template_string

app = Flask(__name__)

PRODUKTER = [
    {"navn": "Laptop", "pris": 12000},
    {"navn": "Telefon", "pris": 8000},
    {"navn": "Sko", "pris": 1000},
]

TEMPLATE = """
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  </head>
  <body>
    <div class="container">
      <div class="row">
        {% for p in produkter %}
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">{{ p.navn }}</h5>
              <p class="card-text">{{ p.pris }} kr</p>
            </div>
          </div>
        </div>
        {% endfor %}
      </div>
    </div>
  </body>
</html>
""".strip()

@app.route("/produkter")
def produkter():
    return render_template_string(TEMPLATE, produkter=PRODUKTER)


client = app.test_client()
html = client.get("/produkter").data.decode()
print(html)

assert html.count('class="card"') == 3
assert html.count('class="card-title"') == 3
assert html.count('class="card-text"') == 3
for p in PRODUKTER:
    assert p["navn"] in html
print("OK")
`,
    hints: [
      ".card er ytterramme. .card-body gir padding. .card-title og .card-text er typografi-modifiers.",
      "Plasser card-er i en .row med .col-md-* så ligger de side-om-side på desktop og stables på mobil.",
      "{% for p in produkter %} … {% endfor %} — p er løkke-variabelen.",
    ],
    docs: [
      {
        title: "Bootstrap — Cards",
        url: "https://getbootstrap.com/docs/5.3/components/card/",
        note: ".card-header, .card-footer, .card-img-top er andre del-komponenter.",
      },
    ],
  },
  {
    id: "py-flask-bs-navbar",
    topic: "Flask + Bootstrap",
    title: "Navbar med navbar-brand og nav-link",
    description:
      "Lag en topp-navigasjon med Bootstrap-navbar. Logo til venstre (`navbar-brand`), tre lenker (`nav-link`): Hjem, Produkter, Konto.",
    requires: ["flask"],
    starter: `from flask import Flask, render_template_string

# === OPPGAVE ===
# Bygg en <nav class="navbar navbar-expand-lg bg-light"> som inneholder
#   • <a class="navbar-brand" href="/">Butikken</a>
#   • <a class="nav-link" href="/">Hjem</a>
#   • <a class="nav-link" href="/produkter">Produkter</a>
#   • <a class="nav-link" href="/konto">Konto</a>

app = Flask(__name__)

TEMPLATE = """
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  </head>
  <body>
    <!-- TODO: legg til navbar her -->
    <div class="container mt-3">
      <h1>Hjem</h1>
    </div>
  </body>
</html>
""".strip()

@app.route("/")
def hjem():
    return render_template_string(TEMPLATE)


client = app.test_client()
html = client.get("/").data.decode()
print(html)

assert 'class="navbar' in html
assert 'class="navbar-brand"' in html and ">Butikken<" in html
assert html.count('class="nav-link"') == 3
assert "Hjem" in html and "Produkter" in html and "Konto" in html
print("OK")
`,
    solution: `from flask import Flask, render_template_string

app = Flask(__name__)

TEMPLATE = """
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  </head>
  <body>
    <nav class="navbar navbar-expand-lg bg-light">
      <div class="container">
        <a class="navbar-brand" href="/">Butikken</a>
        <div class="navbar-nav">
          <a class="nav-link" href="/">Hjem</a>
          <a class="nav-link" href="/produkter">Produkter</a>
          <a class="nav-link" href="/konto">Konto</a>
        </div>
      </div>
    </nav>
    <div class="container mt-3">
      <h1>Hjem</h1>
    </div>
  </body>
</html>
""".strip()

@app.route("/")
def hjem():
    return render_template_string(TEMPLATE)


client = app.test_client()
html = client.get("/").data.decode()
print(html)

assert 'class="navbar' in html
assert 'class="navbar-brand"' in html and ">Butikken<" in html
assert html.count('class="nav-link"') == 3
assert "Hjem" in html and "Produkter" in html and "Konto" in html
print("OK")
`,
    hints: [
      ".navbar-expand-lg = horisontal layout fra lg-breakpoint; under det blir det hamburgermeny.",
      "bg-light og bg-dark er bakgrunnsfarge-utilities; kombiner med navbar-light/navbar-dark for tekstkontrast.",
      ".navbar-brand er ofte sidens logo eller navn — fungerer som lenke til /.",
    ],
    docs: [
      {
        title: "Bootstrap — Navbar",
        url: "https://getbootstrap.com/docs/5.3/components/navbar/",
        note: "Full ansvarlig nav-komponent — toggler, dropdowns, søkefelt.",
      },
    ],
  },
  {
    id: "py-flask-css-inline",
    topic: "Flask + CSS",
    title: "Egen CSS i <style>-tag — selektorer og bokssmodell",
    description:
      "Lag en side uten Bootstrap, men med ditt eget <style>-block: en `.kort`-klasse med 16px padding, lys grå bakgrunn, 8px avrundet kant, og en `h2`-stil som gjør overskriftene blå.",
    requires: ["flask"],
    starter: `from flask import Flask, render_template_string

# === OPPGAVE ===
# Skriv CSS-regler i <style>:
#   .kort { padding: 16px; background: #f5f5f5; border-radius: 8px; }
#   h2    { color: blue; }
# Bruk dem i HTML-en: <div class="kort"><h2>Tittel</h2><p>Tekst</p></div>

app = Flask(__name__)

TEMPLATE = """
<!doctype html>
<html>
  <head>
    <style>
      /* TODO: skriv reglene her */
    </style>
  </head>
  <body>
    <!-- TODO: bygg en .kort med <h2>Tittel</h2> og <p>Tekst</p> -->
  </body>
</html>
""".strip()

@app.route("/")
def hjem():
    return render_template_string(TEMPLATE)


client = app.test_client()
html = client.get("/").data.decode()
print(html)

# Selv-test
assert "padding: 16px" in html or "padding:16px" in html
assert "border-radius: 8px" in html or "border-radius:8px" in html
assert "color: blue" in html or "color:blue" in html
assert 'class="kort"' in html
assert "<h2>Tittel</h2>" in html
print("OK")
`,
    solution: `from flask import Flask, render_template_string

app = Flask(__name__)

TEMPLATE = """
<!doctype html>
<html>
  <head>
    <style>
      .kort { padding: 16px; background: #f5f5f5; border-radius: 8px; }
      h2 { color: blue; }
    </style>
  </head>
  <body>
    <div class="kort">
      <h2>Tittel</h2>
      <p>Tekst</p>
    </div>
  </body>
</html>
""".strip()

@app.route("/")
def hjem():
    return render_template_string(TEMPLATE)


client = app.test_client()
html = client.get("/").data.decode()
print(html)

assert "padding: 16px" in html
assert "border-radius: 8px" in html
assert "color: blue" in html
assert 'class="kort"' in html
assert "<h2>Tittel</h2>" in html
print("OK")
`,
    hints: [
      "Klasseselektor: .kort. Element-selektor: h2. ID-selektor: #navn.",
      "Bokssmodellen: padding er innenfor border, margin utenfor.",
      "border-radius runder hjørnene — 8px er en typisk subtil avrunding.",
    ],
    docs: [
      {
        title: "MDN — CSS-selektorer",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors",
        note: "Klasse (.), id (#), element (h2), barn (>), etterkommer ( ), søsken (+, ~).",
      },
      {
        title: "MDN — Bokssmodellen",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_box_model/Introduction_to_the_CSS_box_model",
        note: "content → padding → border → margin.",
      },
    ],
  },
  {
    id: "py-flask-css-flex",
    topic: "Flask + CSS",
    title: "Flexbox-layout med egen CSS",
    description:
      "Lag en horisontal verktøylinje med tre knapper jevnt fordelt over hele bredden ved hjelp av flexbox: `display: flex; justify-content: space-between;`. Ingen Bootstrap.",
    requires: ["flask"],
    starter: `from flask import Flask, render_template_string

# === OPPGAVE ===
# CSS-regler:
#   .verktoy { display: flex; justify-content: space-between; padding: 8px; background: #eee; }
#   .verktoy button { padding: 8px 16px; }
#
# HTML:
#   <div class="verktoy">
#     <button>Ny</button>
#     <button>Lagre</button>
#     <button>Slett</button>
#   </div>

app = Flask(__name__)

TEMPLATE = """
<!doctype html>
<html>
  <head>
    <style>
      /* TODO: skriv reglene */
    </style>
  </head>
  <body>
    <!-- TODO: bygg .verktoy med tre knapper -->
  </body>
</html>
""".strip()

@app.route("/")
def hjem():
    return render_template_string(TEMPLATE)


client = app.test_client()
html = client.get("/").data.decode()
print(html)

assert "display: flex" in html or "display:flex" in html
assert "justify-content: space-between" in html or "justify-content:space-between" in html
assert html.count("<button>") == 3
assert ">Ny<" in html and ">Lagre<" in html and ">Slett<" in html
print("OK")
`,
    solution: `from flask import Flask, render_template_string

app = Flask(__name__)

TEMPLATE = """
<!doctype html>
<html>
  <head>
    <style>
      .verktoy { display: flex; justify-content: space-between; padding: 8px; background: #eee; }
      .verktoy button { padding: 8px 16px; }
    </style>
  </head>
  <body>
    <div class="verktoy">
      <button>Ny</button>
      <button>Lagre</button>
      <button>Slett</button>
    </div>
  </body>
</html>
""".strip()

@app.route("/")
def hjem():
    return render_template_string(TEMPLATE)


client = app.test_client()
html = client.get("/").data.decode()
print(html)

assert "display: flex" in html
assert "justify-content: space-between" in html
assert html.count("<button>") == 3
print("OK")
`,
    hints: [
      "display: flex på foreldren legger barna på en horisontal akse.",
      "justify-content fordeler barna langs hovedaksen: space-between, space-around, center, flex-start, flex-end.",
      "align-items styrer kryssaksen (vertikalt når flex-direction er row).",
    ],
    docs: [
      {
        title: "MDN — Flexbox",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox",
        note: "Flex er one-dimensional (row eller column). For 2D-layout, bruk CSS Grid.",
      },
      {
        title: "Flexbox Froggy",
        url: "https://flexboxfroggy.com/",
        note: "Interaktiv læring av flex via et 24-nivå-spill. Bra for justify-content/align-items-muskelhukommelse.",
      },
    ],
  },
];
