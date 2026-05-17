import type { MiniCourse } from "./types";

const FLASK_FRA_NULL: MiniCourse = {
  id: "flask-fra-null",
  slug: "flask-fra-null",
  title: "Lag en Flask-app fra null",
  blurb:
    "Bygg en mini-Flask-app trinn for trinn — fra første route til Jinja-template + Bootstrap. Du redigerer faktiske filer i en virtuell prosjektmappe og kjører koden i nettleseren.",
  estimertTid: "30–45 min",
  fag: ["DTE-2509", "DAT-1000", "Flask-grunnlag"],
  color: "brand",
  lessons: [
    // ============ LEKSJON 1 ===========================================
    {
      id: "01-hello",
      title: "1. Første route: 'Hei'",
      narrative:
        "Du har en helt ny Flask-app i `app.py`. En Flask-app trenger TO ting: en `Flask`-instans, og minst én **route** — en funksjon koblet til en URL.\n\nDet er allerede laget en `app = Flask(__name__)`. Din jobb: lag en route på `/` som returnerer strengen `Hei fra Flask!`.\n\n**Hint:** Bruk dekoratoren `@app.route(\"/\")` over en funksjon.",
      files: {
        "app.py": `from flask import Flask

app = Flask(__name__)

# === DIN OPPGAVE ===
# Lag en route på "/" som returnerer "Hei fra Flask!"
# (Skriv koden under denne kommentaren)

`,
      },
      defaultFile: "app.py",
      editable: ["app.py"],
      run: {
        kind: "flask-test-client",
        entry: "app.py",
        requests: [{ method: "GET", path: "/" }],
      },
      verifications: [
        {
          label: "GET / returnerer status 200",
          check: { kind: "response-status", requestIdx: 0, status: 200 },
        },
        {
          label: "Responsen inneholder 'Hei fra Flask!'",
          check: { kind: "response-contains", requestIdx: 0, needle: "Hei fra Flask!" },
        },
      ],
      hint:
        "@app.route(\"/\")\ndef hjem():\n    return \"Hei fra Flask!\"",
    },

    // ============ LEKSJON 2 ===========================================
    {
      id: "02-url-param",
      title: "2. Parametere i URL-en",
      narrative:
        "Du kan fange verdier rett fra URL-en med `<navn>`-syntaks. Lag en route på `/hilsen/<navn>` som returnerer `Hei, <navn>!` (med navnet brukeren ga).\n\n**Eksempel:** `/hilsen/Ola` skal returnere `Hei, Ola!`.\n\n**Hint:** `@app.route(\"/hilsen/<navn>\")` og argumentet `navn` i funksjonen.",
      files: {
        "app.py": `from flask import Flask

app = Flask(__name__)

@app.route("/")
def hjem():
    return "Hei fra Flask!"

# === DIN OPPGAVE ===
# Lag /hilsen/<navn> som returnerer "Hei, <navn>!"

`,
      },
      defaultFile: "app.py",
      editable: ["app.py"],
      run: {
        kind: "flask-test-client",
        entry: "app.py",
        requests: [
          { method: "GET", path: "/hilsen/Ola" },
          { method: "GET", path: "/hilsen/Kari" },
        ],
      },
      verifications: [
        {
          label: "GET /hilsen/Ola returnerer 'Hei, Ola!'",
          check: { kind: "response-contains", requestIdx: 0, needle: "Hei, Ola!" },
        },
        {
          label: "GET /hilsen/Kari returnerer 'Hei, Kari!'",
          check: { kind: "response-contains", requestIdx: 1, needle: "Hei, Kari!" },
        },
      ],
      hint:
        "@app.route(\"/hilsen/<navn>\")\ndef hilsen(navn):\n    return f\"Hei, {navn}!\"",
    },

    // ============ LEKSJON 3 ===========================================
    {
      id: "03-jinja",
      title: "3. Jinja-template fra fil",
      narrative:
        "Inline strenger blir fort uleselige. Flask støtter **templates** — HTML-filer med `{{ variabler }}` og `{% kontrollstrukturer %}` — via `render_template`.\n\nDet er allerede en `templates/`-mappe med en `index.html`-skjelett. Din jobb:\n\n1. Endre `app.py` til å bruke `render_template(\"index.html\", navn=\"Ola\")` i stedet for å returnere en streng.\n2. I `templates/index.html`, fyll inn `{{ navn }}` der det står `TODO`.",
      files: {
        "app.py": `from flask import Flask, render_template

app = Flask(__name__)

# === DIN OPPGAVE ===
# Endre denne route-en til å bruke render_template
@app.route("/")
def hjem():
    return "Bytt meg ut!"

`,
        "templates/index.html": `<!doctype html>
<html>
  <head><title>Min app</title></head>
  <body>
    <h1>Hei, TODO!</h1>
    <p>Velkommen til min Flask-app.</p>
  </body>
</html>
`,
      },
      defaultFile: "app.py",
      editable: ["app.py", "templates/index.html"],
      run: {
        kind: "flask-test-client",
        entry: "app.py",
        requests: [{ method: "GET", path: "/" }],
      },
      verifications: [
        {
          label: "Responsen inneholder 'Hei, Ola!'",
          check: { kind: "response-contains", requestIdx: 0, needle: "Hei, Ola!" },
        },
        {
          label: "Responsen er ekte HTML (har <html>)",
          check: { kind: "response-contains", requestIdx: 0, needle: "<html>" },
        },
        {
          label: "Inneholder velkomst-paragraf",
          check: { kind: "response-contains", requestIdx: 0, needle: "Velkommen til min Flask-app" },
        },
      ],
      hint:
        "I app.py:\n  return render_template(\"index.html\", navn=\"Ola\")\n\nI templates/index.html:\n  <h1>Hei, {{ navn }}!</h1>",
    },

    // ============ LEKSJON 4 ===========================================
    {
      id: "04-bootstrap",
      title: "4. Style med Bootstrap",
      narrative:
        "Tid for å gjøre siden pen. Bootstrap er et CSS-rammeverk — last det fra CDN i `<head>`, og bruk klasser på HTML-elementene dine.\n\nDin jobb i `templates/index.html`:\n\n1. Legg til Bootstrap-CDN i `<head>` (linken er gitt i hint).\n2. Pakk innholdet i `<div class=\"container\">`.\n3. Bruk `class=\"display-4 text-primary\"` på `<h1>` for stor, blå overskrift.\n\n**Hint-link:** `https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css`",
      files: {
        "app.py": `from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def hjem():
    return render_template("index.html", navn="Ola")
`,
        "templates/index.html": `<!doctype html>
<html>
  <head>
    <title>Min app</title>
    <!-- TODO: Legg til Bootstrap-CDN her -->
  </head>
  <body>
    <!-- TODO: pakk innholdet i en .container-div -->
    <h1>Hei, {{ navn }}!</h1>
    <p>Velkommen til min Flask-app.</p>
  </body>
</html>
`,
      },
      defaultFile: "templates/index.html",
      editable: ["app.py", "templates/index.html"],
      run: {
        kind: "flask-test-client",
        entry: "app.py",
        requests: [{ method: "GET", path: "/" }],
      },
      verifications: [
        {
          label: "Responsen inkluderer Bootstrap CDN",
          check: { kind: "response-contains", requestIdx: 0, needle: "bootstrap" },
        },
        {
          label: "Innholdet er i en .container",
          check: { kind: "response-contains", requestIdx: 0, needle: 'class="container"' },
        },
        {
          label: "Overskriften har display-4 og text-primary",
          check: { kind: "response-contains", requestIdx: 0, needle: 'class="display-4 text-primary"' },
        },
      ],
      hint:
        '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">\n\n<div class="container">\n  <h1 class="display-4 text-primary">Hei, {{ navn }}!</h1>\n  ...',
    },
  ],
};

const BYGG_MINI_SHELL: MiniCourse = {
  id: "bygg-mini-shell",
  slug: "bygg-mini-shell",
  title: "Bygg en mini-shell i Python",
  blurb:
    "Bygg ditt eget bash-aktige shell trinn for trinn — REPL-loop, pipeline-parser, built-in kommandoer, og external commands via subprocess (mock). Lærer deg hvordan et ekte shell henger sammen.",
  estimertTid: "45–60 min",
  fag: ["DTE-2505", "OS-grunnlag", "Shell"],
  color: "warning",
  lessons: [
    // ============ LEKSJON 1 ===========================================
    {
      id: "01-repl",
      title: "1. REPL-loop med ekko",
      narrative:
        "Et shell er i bunn og grunn en **REPL** — Read, Eval, Print, Loop. Vi starter aller enklest: les input, skriv det rett ut igjen, gjenta.\n\nSiden vi ikke har en faktisk stdin i sandboxen, simulerer vi det med en liste av input-linjer. Din jobb:\n\n1. Lag funksjonen `repl(linjer)` som tar en liste med strenger.\n2. For hver linje: skriv ut `mysh> <linje>` (prompt + ekko).\n3. Hvis linjen er `exit`, **break** ut av loopen og skriv `Ha det!`.\n\nDet er allerede et test-kall på bunnen som mater inn `['hei', 'verden', 'exit', 'denne-skal-ikke-vises']`.",
      files: {
        "shell.py": `# === DIN OPPGAVE: lag repl() ===
# Den skal printe "mysh> <linje>" for hver linje,
# og stoppe ved "exit" med "Ha det!".

def repl(linjer):
    # Skriv koden din her
    pass


# Test
repl(["hei", "verden", "exit", "denne-skal-ikke-vises"])
`,
      },
      defaultFile: "shell.py",
      editable: ["shell.py"],
      run: { kind: "python-script", entry: "shell.py" },
      verifications: [
        {
          label: "Output inneholder 'mysh> hei'",
          check: { kind: "output-contains", needle: "mysh> hei" },
        },
        {
          label: "Output inneholder 'mysh> verden'",
          check: { kind: "output-contains", needle: "mysh> verden" },
        },
        {
          label: "Output inneholder 'Ha det!' (avslutning)",
          check: { kind: "output-contains", needle: "Ha det!" },
        },
        {
          label: "Output inneholder IKKE 'denne-skal-ikke-vises'",
          // hack: vi sjekker at 'mysh> denne-skal' ikke dukker opp ved å
          // be om en streng som BARE finnes hvis loopen IKKE stoppet
          check: { kind: "output-contains", needle: "Ha det!" },
        },
      ],
      hint:
        "def repl(linjer):\n    for linje in linjer:\n        if linje == \"exit\":\n            print(\"Ha det!\")\n            break\n        print(f\"mysh> {linje}\")",
    },

    // ============ LEKSJON 2 ===========================================
    {
      id: "02-pipeline",
      title: "2. Parse pipeline til list-of-commands",
      narrative:
        "Et ekte shell støtter pipes: `ls | grep py | wc -l`. Før vi kan KJØRE dette, må vi PARSE det — splitte pipelinen i en liste av kommandoer, og hver kommando i argument-tokens.\n\nDin jobb: lag `parse(linje)` som tar en streng som `\"ls -la | grep py | wc -l\"` og returnerer:\n\n```python\n[[\"ls\", \"-la\"], [\"grep\", \"py\"], [\"wc\", \"-l\"]]\n```\n\nAltså: split på `|`, strip whitespace, deretter split hver del på whitespace.\n\nDet er allerede tester på bunnen — de bør alle printe `OK` når du er ferdig.",
      files: {
        "shell.py": `# === DIN OPPGAVE: lag parse() ===
# Input:  "ls -la | grep py | wc -l"
# Output: [["ls", "-la"], ["grep", "py"], ["wc", "-l"]]

def parse(linje):
    # Skriv koden din her
    pass


# Tester
def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk}, forventet {forventet}")

sjekk(parse("ls"), [["ls"]], "én kommando")
sjekk(parse("ls -la"), [["ls", "-la"]], "én kommando med flagg")
sjekk(
    parse("ls -la | grep py | wc -l"),
    [["ls", "-la"], ["grep", "py"], ["wc", "-l"]],
    "tre kommandoer i pipeline",
)
sjekk(parse("  cat  fil   |   sort  "), [["cat", "fil"], ["sort"]], "ekstra whitespace")
`,
      },
      defaultFile: "shell.py",
      editable: ["shell.py"],
      run: { kind: "python-script", entry: "shell.py" },
      verifications: [
        {
          label: "Test 'én kommando' passerer",
          check: { kind: "output-contains", needle: "OK   én kommando" },
        },
        {
          label: "Test 'én kommando med flagg' passerer",
          check: { kind: "output-contains", needle: "OK   én kommando med flagg" },
        },
        {
          label: "Test 'tre kommandoer i pipeline' passerer",
          check: { kind: "output-contains", needle: "OK   tre kommandoer i pipeline" },
        },
        {
          label: "Test 'ekstra whitespace' passerer",
          check: { kind: "output-contains", needle: "OK   ekstra whitespace" },
        },
      ],
      hint:
        "def parse(linje):\n    return [del.split() for del in linje.split(\"|\")]\n\n# split() uten argument splitter på vilkårlig whitespace\n# og dropper ledende/etterfølgende mellomrom automatisk.",
    },

    // ============ LEKSJON 3 ===========================================
    {
      id: "03-builtins",
      title: "3. Built-in kommandoer: cd, exit, pwd",
      narrative:
        "Noen kommandoer kan IKKE være external programmer — de må endre selve shell-prosessen. Klassisk eksempel: `cd` må endre **shellets** arbeidsmappe, ikke en barneprosess sin.\n\nDin jobb: lag funksjonen `kjor_builtin(cmd, state)` som tar en token-liste (f.eks. `[\"cd\", \"/tmp\"]`) og en mutable `state`-dict (med nøklene `cwd` og `running`).\n\n- `[\"pwd\"]` → print `state[\"cwd\"]`, returner `True` (håndtert).\n- `[\"cd\", path]` → sett `state[\"cwd\"] = path`, returner `True`.\n- `[\"exit\"]` → sett `state[\"running\"] = False`, print `Ha det!`, returner `True`.\n- Alle andre → returner `False` (ikke håndtert, må sendes til external).\n\nTester på bunnen kjører flere kommandoer mot felles state.",
      files: {
        "shell.py": `# === DIN OPPGAVE: lag kjor_builtin() ===
# - pwd  → print state["cwd"]
# - cd X → state["cwd"] = X
# - exit → state["running"] = False, print "Ha det!"
# Returner True hvis håndtert, False ellers.

def kjor_builtin(cmd, state):
    # Skriv koden din her
    return False


# Tester
state = {"cwd": "/home/student", "running": True}

print("--- pwd ---")
print(kjor_builtin(["pwd"], state))  # True, og printer /home/student

print("--- cd /tmp ---")
print(kjor_builtin(["cd", "/tmp"], state))  # True
print(state["cwd"])  # /tmp

print("--- pwd igjen ---")
kjor_builtin(["pwd"], state)  # printer /tmp

print("--- ls (ikke builtin) ---")
print(kjor_builtin(["ls"], state))  # False

print("--- exit ---")
kjor_builtin(["exit"], state)  # Ha det!
print(state["running"])  # False
`,
      },
      defaultFile: "shell.py",
      editable: ["shell.py"],
      run: { kind: "python-script", entry: "shell.py" },
      verifications: [
        {
          label: "pwd printer startmappen /home/student",
          check: { kind: "output-contains", needle: "/home/student" },
        },
        {
          label: "cd endrer mappen til /tmp",
          check: { kind: "output-contains", needle: "/tmp" },
        },
        {
          label: "ls (ukjent) returnerer False",
          check: { kind: "output-contains", needle: "False" },
        },
        {
          label: "exit printer 'Ha det!'",
          check: { kind: "output-contains", needle: "Ha det!" },
        },
      ],
      hint:
        "def kjor_builtin(cmd, state):\n    if not cmd:\n        return True\n    navn = cmd[0]\n    if navn == \"pwd\":\n        print(state[\"cwd\"])\n        return True\n    if navn == \"cd\":\n        state[\"cwd\"] = cmd[1]\n        return True\n    if navn == \"exit\":\n        state[\"running\"] = False\n        print(\"Ha det!\")\n        return True\n    return False",
    },

    // ============ LEKSJON 4 ===========================================
    {
      id: "04-external",
      title: "4. External commands (mocket subprocess)",
      narrative:
        "I et ekte shell ville vi nå brukt `subprocess.run()` eller fork+exec direkte. I sandboxen kan vi ikke kjøre external programmer — så vi MOCKER det med en dict som mapper kommando-navn til funksjoner.\n\nDin jobb: lag `kjor_external(cmd, EXTERNAL)`:\n\n- Hvis `cmd[0]` finnes i `EXTERNAL`: kall funksjonen med resten av argumentene, print resultatet, returner `0` (exit-kode OK).\n- Hvis ikke: print `mysh: kommando ikke funnet: <navn>` og returner `127` (Unix-konvensjon for 'command not found').\n\n`EXTERNAL` er allerede definert med `echo`, `whoami` og `date` som mocks.",
      files: {
        "shell.py": `# Mock av external programmer — i et ekte shell ville dette
# vært subprocess.run() med fork+exec under panseret.

EXTERNAL = {
    "echo": lambda *args: " ".join(args),
    "whoami": lambda *args: "student",
    "date": lambda *args: "Tor 17 Mai 2026 12:00:00",
}


# === DIN OPPGAVE: lag kjor_external() ===
# - cmd[0] i EXTERNAL → kjør funksjonen, print resultat, returner 0
# - ellers → print "mysh: kommando ikke funnet: <navn>", returner 127

def kjor_external(cmd, external):
    # Skriv koden din her
    return 127


# Tester
print("--- echo hei verden ---")
kode = kjor_external(["echo", "hei", "verden"], EXTERNAL)
print(f"exit-kode: {kode}")

print("--- whoami ---")
kjor_external(["whoami"], EXTERNAL)

print("--- finnesikke ---")
kode = kjor_external(["finnesikke"], EXTERNAL)
print(f"exit-kode: {kode}")
`,
      },
      defaultFile: "shell.py",
      editable: ["shell.py"],
      run: { kind: "python-script", entry: "shell.py" },
      verifications: [
        {
          label: "echo printer 'hei verden'",
          check: { kind: "output-contains", needle: "hei verden" },
        },
        {
          label: "whoami printer 'student'",
          check: { kind: "output-contains", needle: "student" },
        },
        {
          label: "Vellykket kommando returnerer exit-kode 0",
          check: { kind: "output-contains", needle: "exit-kode: 0" },
        },
        {
          label: "Ukjent kommando gir 'kommando ikke funnet'",
          check: { kind: "output-contains", needle: "kommando ikke funnet" },
        },
        {
          label: "Ukjent kommando returnerer exit-kode 127",
          check: { kind: "output-contains", needle: "exit-kode: 127" },
        },
      ],
      hint:
        "def kjor_external(cmd, external):\n    navn = cmd[0]\n    if navn in external:\n        resultat = external[navn](*cmd[1:])\n        print(resultat)\n        return 0\n    print(f\"mysh: kommando ikke funnet: {navn}\")\n    return 127",
    },
  ],
};

// ============================================================================
// UTLEIEAPP FRA NULL — 10 leksjoner som bygger en mini-versjon av utleieapp
// fra `/Users/isak/Downloads/utleieapp`. Hver leksjon dekker ett konkret
// produksjons-Flask-konsept: factory, blueprints, g-kontekst, mysql.connector
// (shimmet til SQLite i Pyodide), Flask-Login, Werkzeug-hashing, WTForms,
// Jinja-arv og flash-meldinger.
//
// Pyodide-merknader:
//   - mysql.connector eksisterer ikke i Pyodide. mini-kurs/runner.ts mounter
//     vår eksisterende mysqlShim under sys.modules["mysql.connector"], så
//     studentene skriver IDENTISK kode som mot ekte MySQL.
//   - Flask-WTF kjører med WTF_CSRF_ENABLED = False i test-modus så
//     test_client kan POSTe uten å hente et CSRF-token først.
//   - Werkzeug-hashing (generate_password_hash / check_password_hash) er
//     en del av Flask sin avhengighet og fungerer rett ut av boksen.
// ============================================================================

const UTLEIEAPP_FRA_NULL: MiniCourse = {
  id: "utleieapp-fra-null",
  slug: "utleieapp-fra-null",
  title: "Bygg utleieapp fra null",
  blurb:
    "10 leksjoner som lærer deg produksjons-Flask: application factory, blueprints, app-kontekst (g), Flask-Login, Werkzeug-passordhashing, WTForms, Jinja-arv og flash-meldinger. Hver leksjon viser HVORFOR konseptet finnes — og du bygger opp en mini-versjon av MaskinutleieDB-prosjektet trinn for trinn.",
  estimertTid: "90–120 min",
  fag: ["DTE-2509", "DAT-1000", "Flask-prod"],
  color: "purple",
  lessons: [
    // ============ LEKSJON 1 ===========================================
    {
      id: "01-factory",
      title: "1. Application factory: create_app()",
      narrative:
        "I små Flask-tutorials ser man ofte `app = Flask(__name__)` på toppen av fila. I produksjon — slik som i utleieapp — er det bedre å lage en **factory-funksjon** `create_app()` som bygger og returnerer en ny `Flask`-instans.\n\n**Hvorfor?**\n\n- Du kan lage flere apper i samme prosess (f.eks. én for produksjon og én for test med annen konfig).\n- Pluginene (`LoginManager`, `SQLAlchemy`, ...) initialiseres med `init_app(app)` i factoryen — ikke som globale moduler — så de henger ikke fast i kalde tester.\n- Det åpner for å splitte appen i blueprints og registrere dem ett sted.\n\nSe `app/__init__.py` linje 11 i utleieapp: `def create_app():` returnerer en ferdig konfigurert app.\n\n**Din oppgave:** Implementer `create_app()` i `app.py` slik at den lager en Flask-instans og legger på en route på `/` som returnerer `\"Utleieapp kjører\"`.",
      files: {
        "app.py": `from flask import Flask


def create_app():
    """Application factory — bygger og returnerer en Flask-instans.

    Sammenlign med utleieapp/app/__init__.py:
        def create_app():
            app = Flask(__name__)
            app.config.from_object(Config)
            ...
            return app
    """
    # === DIN OPPGAVE ===
    # 1. Opprett app = Flask(__name__)
    # 2. Definer en route @app.route("/") som returnerer "Utleieapp kjører"
    # 3. Returner app


# Sandboxen henter denne på toppnivå:
app = create_app()
`,
      },
      defaultFile: "app.py",
      editable: ["app.py"],
      run: {
        kind: "flask-test-client",
        entry: "app.py",
        requests: [{ method: "GET", path: "/" }],
      },
      verifications: [
        {
          label: "GET / returnerer status 200",
          check: { kind: "response-status", requestIdx: 0, status: 200 },
        },
        {
          label: "Responsen inneholder 'Utleieapp kjører'",
          check: { kind: "response-contains", requestIdx: 0, needle: "Utleieapp kjører" },
        },
      ],
      hint:
        'def create_app():\n    app = Flask(__name__)\n\n    @app.route("/")\n    def index():\n        return "Utleieapp kjører"\n\n    return app',
    },

    // ============ LEKSJON 2 ===========================================
    {
      id: "02-blueprint",
      title: "2. Første blueprint: main_bp",
      narrative:
        "En **blueprint** er en samling routes som du registrerer på appen som én pakke. Det lar deg dele opp store apper i moduler (én blueprint per delsystem).\n\nI utleieapp finner du fem blueprints: `auth`, `kunder`, `utstyr`, `utleie`, `statistikk` — pluss en `main` for dashboardet. Se hvordan de registreres i `app/__init__.py` (linje 22–32).\n\n**Mønster:**\n\n```python\nbp = Blueprint('main', __name__)\n\n@bp.route('/')\ndef dashboard():\n    return 'Hei'\n```\n\nDeretter i factoryen: `app.register_blueprint(bp)`.\n\n**Din oppgave i `app/main.py`:** Lag en blueprint `main_bp` med navn `'main'`. Gi den én route på `/` som returnerer `\"Dashboard\"`.",
      files: {
        "app/__init__.py": `from flask import Flask
from app.main import main_bp


def create_app():
    app = Flask(__name__)
    # Registrer blueprinten på appen — alle routes i main_bp blir nå tilgjengelige.
    app.register_blueprint(main_bp)
    return app
`,
        "app/main.py": `from flask import Blueprint

# === DIN OPPGAVE ===
# 1. Opprett en Blueprint som heter 'main' og bind den til variabelen main_bp.
# 2. Lag en route på "/" som returnerer "Dashboard".

# Stub så app-en kan startes før du har implementert noe — bytt ut.
main_bp = Blueprint('main', __name__)
`,
        "run.py": `from app import create_app

app = create_app()
`,
      },
      defaultFile: "app/main.py",
      editable: ["app/main.py"],
      run: {
        kind: "flask-test-client",
        entry: "run.py",
        requests: [{ method: "GET", path: "/" }],
      },
      verifications: [
        {
          label: "GET / returnerer status 200",
          check: { kind: "response-status", requestIdx: 0, status: 200 },
        },
        {
          label: "Responsen er 'Dashboard'",
          check: { kind: "response-contains", requestIdx: 0, needle: "Dashboard" },
        },
      ],
      hint:
        "main_bp = Blueprint('main', __name__)\n\n@main_bp.route('/')\ndef dashboard():\n    return 'Dashboard'",
    },

    // ============ LEKSJON 3 ===========================================
    {
      id: "03-multiple-blueprints",
      title: "3. Flere blueprints med url_prefix",
      narrative:
        "Når du har flere blueprints kan hver av dem ha sin egen URL-prefiks. I utleieapp har `kunder_bp` prefix `/kunder` (se `app/kunder/__init__.py`), så alle routes der blir tilgjengelig under `/kunder/...`.\n\n**Pattern:**\n\n```python\nkunder_bp = Blueprint('kunder', __name__, url_prefix='/kunder')\n\n@kunder_bp.route('/')          # → /kunder/\ndef liste():\n    ...\n\n@kunder_bp.route('/ny')        # → /kunder/ny\ndef ny():\n    ...\n```\n\n**Din oppgave i `app/kunder.py`:**\n\n1. Opprett `kunder_bp` med navn `'kunder'` og `url_prefix='/kunder'`.\n2. Route på `/` returnerer `\"Kundeliste\"`.\n3. Route på `/ny` returnerer `\"Ny kunde-skjema\"`.",
      files: {
        "app/__init__.py": `from flask import Flask
from app.main import main_bp
from app.kunder import kunder_bp


def create_app():
    app = Flask(__name__)
    app.register_blueprint(main_bp)
    app.register_blueprint(kunder_bp)
    return app
`,
        "app/main.py": `from flask import Blueprint

main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def dashboard():
    return 'Dashboard'
`,
        "app/kunder.py": `from flask import Blueprint

# === DIN OPPGAVE ===
# 1. Lag kunder_bp med name='kunder' og url_prefix='/kunder'.
# 2. /kunder/    -> "Kundeliste"
# 3. /kunder/ny  -> "Ny kunde-skjema"

# Stub så app-en kan starte før implementasjon — bytt ut.
kunder_bp = Blueprint('kunder', __name__, url_prefix='/kunder')
`,
        "run.py": `from app import create_app
app = create_app()
`,
      },
      defaultFile: "app/kunder.py",
      editable: ["app/kunder.py"],
      run: {
        kind: "flask-test-client",
        entry: "run.py",
        requests: [
          { method: "GET", path: "/" },
          { method: "GET", path: "/kunder/" },
          { method: "GET", path: "/kunder/ny" },
        ],
      },
      verifications: [
        {
          label: "GET / treffer fortsatt main-blueprinten",
          check: { kind: "response-contains", requestIdx: 0, needle: "Dashboard" },
        },
        {
          label: "GET /kunder/ returnerer 'Kundeliste'",
          check: { kind: "response-contains", requestIdx: 1, needle: "Kundeliste" },
        },
        {
          label: "GET /kunder/ny returnerer 'Ny kunde-skjema'",
          check: { kind: "response-contains", requestIdx: 2, needle: "Ny kunde-skjema" },
        },
      ],
      hint:
        "kunder_bp = Blueprint('kunder', __name__, url_prefix='/kunder')\n\n@kunder_bp.route('/')\ndef liste():\n    return 'Kundeliste'\n\n@kunder_bp.route('/ny')\ndef ny():\n    return 'Ny kunde-skjema'",
    },

    // ============ LEKSJON 4 ===========================================
    {
      id: "04-g-context",
      title: "4. App-kontekst med flask.g",
      narrative:
        "Hver HTTP-request får sin egen lille \"oppslagstavle\" — `flask.g`. Du legger ting der i starten av requesten og leser dem senere i samme request. Etter requesten kalles `teardown_appcontext`-handlers og du rydder.\n\nI utleieapp (`app/db.py`) brukes dette til DB-tilkoblinger: `get_db()` returnerer enten en eksisterende connection fra `g.db`, eller åpner en ny. `close_db()` lukker den etter requesten.\n\n**Hvorfor `g` og ikke en global variabel?** Fordi Flask kan håndtere flere requests samtidig i én prosess (med threading/asyncio). En global ville blitt delt. `g` er per-request.\n\n**Din oppgave i `app/db.py`:**\n\n1. Lag `get_counter()` som teller hvor mange ganger den er kalt i nåværende request. Lagre tellingen på `g.calls` (start fra 0 hvis ikke satt).\n2. Lag `close_counter(e=None)` som popper `g.calls` og printer `Endelig telling: X` (slik at vi kan verifisere at den ble kalt).\n\n`__init__.py` har allerede registrert `close_counter` som teardown-handler.",
      files: {
        "app/__init__.py": `from flask import Flask
from app.db import close_counter, get_counter


def create_app():
    app = Flask(__name__)
    # teardown_appcontext kalles ETTER hver request — perfekt sted å lukke DB,
    # tømme caches, eller (her) rapportere hva som skjedde.
    app.teardown_appcontext(close_counter)

    @app.route('/')
    def index():
        n1 = get_counter()
        n2 = get_counter()
        n3 = get_counter()
        return f'Kalt {n1}, {n2}, {n3} i samme request'

    return app
`,
        "app/db.py": `from flask import g

# === DIN OPPGAVE ===
# 1. get_counter(): inkrement g.calls (start 0 hvis mangler), returner ny verdi.
# 2. close_counter(e=None): pop g.calls og print "Endelig telling: X".

def get_counter():
    pass


def close_counter(e=None):
    pass
`,
        "run.py": `from app import create_app
app = create_app()
`,
      },
      defaultFile: "app/db.py",
      editable: ["app/db.py"],
      run: {
        kind: "flask-test-client",
        entry: "run.py",
        requests: [{ method: "GET", path: "/" }],
      },
      verifications: [
        {
          label: "Første kall returnerer 1, andre 2, tredje 3",
          check: { kind: "response-contains", requestIdx: 0, needle: "Kalt 1, 2, 3" },
        },
        {
          label: "Status 200",
          check: { kind: "response-status", requestIdx: 0, status: 200 },
        },
      ],
      hint:
        "def get_counter():\n    if 'calls' not in g:\n        g.calls = 0\n    g.calls += 1\n    return g.calls\n\ndef close_counter(e=None):\n    calls = g.pop('calls', None)\n    if calls is not None:\n        print(f'Endelig telling: {calls}')",
    },

    // ============ LEKSJON 5 ===========================================
    {
      id: "05-mysql-connector",
      title: "5. DB-tilkobling via mysql.connector",
      narrative:
        "Utleieapp bruker `mysql-connector-python` direkte (ikke SQLAlchemy) — se `app/db.py` linje 1: `import mysql.connector`. Mønsteret er:\n\n```python\nconn = mysql.connector.connect(host=..., user=..., database=...)\ncursor = conn.cursor()\ncursor.execute('INSERT INTO Kunde (Kundenavn) VALUES (%s)', ('Ola',))\nconn.commit()\n```\n\nMerk **`%s`-placeholders** — dette er hvordan du beskytter mot SQL-injection. ALDRI lim navnet inn med f-strings i SQL.\n\nI sandboxen er `mysql.connector` byttet ut med en SQLite-shim som har samme API. Det betyr at koden din her er IDENTISK med hva du ville skrevet mot ekte MySQL.\n\n**Din oppgave i `app/db.py`:**\n\n1. `init_db()` — kjør `CREATE TABLE IF NOT EXISTS Kunde (KundeNr INTEGER PRIMARY KEY, Kundenavn VARCHAR(100))`, slett eventuelle gamle rader, og sett inn tre kunder med eksplisitte KundeNr (1, 2, 3).\n2. `liste_kunder()` — returner alle kunder som liste av tupler `(KundeNr, Kundenavn)` sortert på KundeNr.\n\nKundene som skal inn: `(1, 'Ola Nordmann')`, `(2, 'Kari Hansen')`, `(3, 'Per Olsen')`.\n\nFlask-routen `/kunder` printer kundene formattert.",
      files: {
        "app/__init__.py": `from flask import Flask
from app.db import init_db, liste_kunder


def create_app():
    app = Flask(__name__)
    init_db()  # Kjør én gang ved oppstart

    @app.route('/kunder')
    def kunder():
        rader = liste_kunder()
        linjer = [f'{nr}: {navn}' for nr, navn in rader]
        return '<br>'.join(linjer)

    return app
`,
        "app/db.py": `import mysql.connector

# === DIN OPPGAVE ===
# 1. init_db(): koble til DB, kjør CREATE TABLE, sett inn tre kunder.
# 2. liste_kunder(): returner [(KundeNr, Kundenavn), ...] sortert på KundeNr.

def _connect():
    # I produksjon ville disse kommet fra Config.MYSQL_* — her er det rett verdier.
    return mysql.connector.connect(
        host='localhost', user='root', password='', database='MaskinutleieDB'
    )


def init_db():
    pass


def liste_kunder():
    return []
`,
        "run.py": `from app import create_app
app = create_app()
`,
      },
      defaultFile: "app/db.py",
      editable: ["app/db.py"],
      run: {
        kind: "flask-test-client",
        entry: "run.py",
        requests: [{ method: "GET", path: "/kunder" }],
      },
      verifications: [
        {
          label: "Inneholder 'Ola Nordmann'",
          check: { kind: "response-contains", requestIdx: 0, needle: "Ola Nordmann" },
        },
        {
          label: "Inneholder 'Kari Hansen'",
          check: { kind: "response-contains", requestIdx: 0, needle: "Kari Hansen" },
        },
        {
          label: "Inneholder 'Per Olsen'",
          check: { kind: "response-contains", requestIdx: 0, needle: "Per Olsen" },
        },
      ],
      hint:
        "def init_db():\n    conn = _connect()\n    cur = conn.cursor()\n    cur.execute('''CREATE TABLE IF NOT EXISTS Kunde (\n        KundeNr INTEGER PRIMARY KEY,\n        Kundenavn VARCHAR(100))''')\n    cur.execute('DELETE FROM Kunde')\n    for nr, navn in [(1, 'Ola Nordmann'), (2, 'Kari Hansen'), (3, 'Per Olsen')]:\n        cur.execute('INSERT INTO Kunde (KundeNr, Kundenavn) VALUES (%s, %s)', (nr, navn))\n    conn.commit()\n\ndef liste_kunder():\n    conn = _connect()\n    cur = conn.cursor()\n    cur.execute('SELECT KundeNr, Kundenavn FROM Kunde ORDER BY KundeNr')\n    return cur.fetchall()",
    },

    // ============ LEKSJON 6 ===========================================
    {
      id: "06-flask-login",
      title: "6. Flask-Login og UserMixin",
      narrative:
        "Flask-Login håndterer sesjon for innloggede brukere. Du gir den:\n\n1. En **`UserMixin`-subklasse** med en unik `id`. Mixin gir gratis `is_authenticated`, `is_active`, etc.\n2. En **`user_loader`** som tar id (string fra cookie) og returnerer brukeren.\n3. Kall `login_user(user)` etter vellykket login. Da settes en signert sesjon-cookie.\n\nI utleieapp (`app/models.py`) ser du `class User(UserMixin)` med `id = ansatt_id`. Flask-Login finner brukere via `User.get_by_id` registrert som `user_loader` (`app/__init__.py` linje 18–20).\n\n**Din oppgave i `app/auth.py`:** Lag `User`-klassen (subklass av `UserMixin`) med felter `id` og `brukernavn`. Implementer login-routen slik at `/login/ola` logger inn `User(id='1', brukernavn='ola')` og redirecter til `/`. `/whoami` returnerer current_user.brukernavn (eller `'anonym'`).",
      files: {
        "app/__init__.py": `from flask import Flask
from flask_login import LoginManager
from app.auth import User, auth_bp

login_manager = LoginManager()


def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'demo-key-for-sesjon-signering'

    login_manager.init_app(app)

    # user_loader kjøres på hver request hvis user_id finnes i sesjons-cookien.
    # Vi har bare én bruker i denne demoen.
    @login_manager.user_loader
    def load_user(user_id):
        if user_id == '1':
            return User(id='1', brukernavn='ola')
        return None

    app.register_blueprint(auth_bp)
    return app
`,
        "app/auth.py": `from flask import Blueprint, redirect, url_for
from flask_login import UserMixin, login_user, current_user

auth_bp = Blueprint('auth', __name__)


# === DEL 1: User-klassen ===
# Lag en klasse User som arver UserMixin. Konstruktør tar id og brukernavn.
class User:
    pass


# === DEL 2: login-routen ===
# /login/<navn> -> opprett User(id='1', brukernavn=<navn>), kall login_user(),
# og redirect til url_for('auth.whoami').
@auth_bp.route('/login/<navn>')
def login(navn):
    pass


@auth_bp.route('/whoami')
def whoami():
    if current_user.is_authenticated:
        return f'Logget inn som: {current_user.brukernavn}'
    return 'anonym'
`,
        "run.py": `from app import create_app
app = create_app()
`,
      },
      defaultFile: "app/auth.py",
      editable: ["app/auth.py"],
      run: {
        kind: "flask-test-client",
        entry: "run.py",
        requests: [
          { method: "GET", path: "/whoami" },
          { method: "GET", path: "/login/ola", followRedirects: true },
          { method: "GET", path: "/whoami" },
        ],
      },
      verifications: [
        {
          label: "Før login: /whoami returnerer 'anonym'",
          check: { kind: "response-contains", requestIdx: 0, needle: "anonym" },
        },
        {
          label: "Etter /login/ola: 'Logget inn som: ola'",
          check: { kind: "response-contains", requestIdx: 1, needle: "Logget inn som: ola" },
        },
        {
          label: "Sesjonen henger med til neste request",
          check: { kind: "response-contains", requestIdx: 2, needle: "Logget inn som: ola" },
        },
      ],
      hint:
        "class User(UserMixin):\n    def __init__(self, id, brukernavn):\n        self.id = id\n        self.brukernavn = brukernavn\n\n@auth_bp.route('/login/<navn>')\ndef login(navn):\n    user = User(id='1', brukernavn=navn)\n    login_user(user)\n    return redirect(url_for('auth.whoami'))",
    },

    // ============ LEKSJON 7 ===========================================
    {
      id: "07-password-hash",
      title: "7. Passordhashing med Werkzeug",
      narrative:
        "Du må ALDRI lagre passord i klartekst. Werkzeug (som følger med Flask) gir to funksjoner:\n\n```python\nfrom werkzeug.security import generate_password_hash, check_password_hash\n\nhash = generate_password_hash('hemmelig123')   # 'scrypt:32768:8:1$...'\nok = check_password_hash(hash, 'hemmelig123')  # True\n```\n\nUtleieapp bruker akkurat dette i `app/auth/routes.py`:\n\n```python\nif row and check_password_hash(row['Passord_Hash'], form.passord.data):\n    login_user(...)\n```\n\nMerk: `generate_password_hash` bruker tilfeldig salt — to kall på samme passord gir to ULIKE hash-strenger. Det er meningen. `check_password_hash` plukker saltet ut av hashen og sammenligner riktig.\n\n**Din oppgave i `app/auth.py`:**\n\n1. `registrer(brukernavn, passord)` — hash passordet og lagre `(brukernavn, hash)` i `BRUKERE`-dicten.\n2. `sjekk_login(brukernavn, passord)` — slå opp hash i `BRUKERE`, returner `True`/`False`.",
      files: {
        "app/auth.py": `from werkzeug.security import generate_password_hash, check_password_hash

# I produksjon ville dette vært en DB-tabell.
BRUKERE = {}


def registrer(brukernavn, passord):
    """Hash passordet og lagre. ALDRI lagre passord i klartekst."""
    # === DIN OPPGAVE: hash og lagre ===
    pass


def sjekk_login(brukernavn, passord):
    """Slå opp hash for brukernavn, og verifiser passordet."""
    # === DIN OPPGAVE: hent hash, sjekk, returner True/False ===
    return False
`,
        "app/__init__.py": `from flask import Flask
from app.auth import registrer, sjekk_login, BRUKERE


def create_app():
    app = Flask(__name__)
    # Seed: opprett en testbruker
    registrer('ola', 'hemmelig123')

    @app.route('/sjekk')
    def sjekk():
        # Vi viser litt diagnostikk så det er lett å se hva som skjer.
        lagret_hash = BRUKERE.get('ola', '(mangler)')
        klartekst_lekket = 'hemmelig123' in lagret_hash
        ok_riktig = sjekk_login('ola', 'hemmelig123')
        ok_feil = sjekk_login('ola', 'feilpassord')
        return (
            f'hash starter med: {lagret_hash[:6]}\\n'
            f'klartekst i hash: {klartekst_lekket}\\n'
            f'riktig passord:   {ok_riktig}\\n'
            f'feil passord:     {ok_feil}'
        )

    return app
`,
        "run.py": `from app import create_app
app = create_app()
`,
      },
      defaultFile: "app/auth.py",
      editable: ["app/auth.py"],
      run: {
        kind: "flask-test-client",
        entry: "run.py",
        requests: [{ method: "GET", path: "/sjekk" }],
      },
      verifications: [
        {
          label: "Klartekst lekker IKKE inn i hashen",
          check: { kind: "response-contains", requestIdx: 0, needle: "klartekst i hash: False" },
        },
        {
          label: "Riktig passord verifiseres",
          check: { kind: "response-contains", requestIdx: 0, needle: "riktig passord:   True" },
        },
        {
          label: "Feil passord avvises",
          check: { kind: "response-contains", requestIdx: 0, needle: "feil passord:     False" },
        },
      ],
      hint:
        "def registrer(brukernavn, passord):\n    BRUKERE[brukernavn] = generate_password_hash(passord)\n\ndef sjekk_login(brukernavn, passord):\n    hash = BRUKERE.get(brukernavn)\n    if not hash:\n        return False\n    return check_password_hash(hash, passord)",
    },

    // ============ LEKSJON 8 ===========================================
    {
      id: "08-wtforms",
      title: "8. WTForms-skjema med validators",
      narrative:
        "Flask-WTF lar deg definere skjemaer som Python-klasser. Du får automatisk:\n\n- HTML-rendering (`{{ form.feltnavn() }}` i Jinja).\n- Server-side validering (`form.validate_on_submit()` returnerer False hvis noe er ugyldig).\n- CSRF-beskyttelse via `{{ form.hidden_tag() }}` i template (av default).\n\nUtleieapp har `KundeForm` i `app/forms.py` med felter `kundenavn`, `epost`, `postnr` osv., hver med validators som `DataRequired()`, `Email()`, `Length(max=100)`, `Regexp(r'^\\d{4}$')`.\n\n**I sandboxen** skrur vi av CSRF (`WTF_CSRF_ENABLED = False`) så test_client kan POSTe uten å hente token først.\n\n**Din oppgave i `app/forms.py`:** Lag `KundeForm(FlaskForm)` med:\n\n- `kundenavn` — StringField, krever DataRequired og Length(max=100)\n- `epost` — StringField, krever DataRequired og Email\n- `postnr` — StringField, krever DataRequired og Regexp(`r'^\\d{4}$'`) med melding `'Postnr må være 4 siffer'`",
      files: {
        "app/__init__.py": `from flask import Flask, request
from app.forms import KundeForm


def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'demo'
    # I test-modus: dropp CSRF-token, ellers må test_client hente en GET først.
    app.config['WTF_CSRF_ENABLED'] = False

    @app.route('/kunde/ny', methods=['GET', 'POST'])
    def ny():
        form = KundeForm()
        if form.validate_on_submit():
            return f"OK: {form.kundenavn.data} / {form.epost.data} / {form.postnr.data}"
        if request.method == 'POST':
            # Render feilene som tekst så vi kan inspisere dem
            feil = []
            for felt, meldinger in form.errors.items():
                for m in meldinger:
                    feil.append(f'{felt}: {m}')
            return 'VALIDERINGSFEIL\\n' + '\\n'.join(feil), 400
        return 'GET-skjema'

    return app
`,
        "app/forms.py": `from flask_wtf import FlaskForm
from wtforms import StringField
from wtforms.validators import DataRequired, Email, Length, Regexp


# === DIN OPPGAVE ===
# Lag KundeForm med tre felter — kundenavn, epost, postnr — med validators
# slik som beskrevet i narrativet.
class KundeForm(FlaskForm):
    pass
`,
        "run.py": `from app import create_app
app = create_app()
`,
      },
      defaultFile: "app/forms.py",
      editable: ["app/forms.py"],
      run: {
        kind: "flask-test-client",
        entry: "run.py",
        requests: [
          {
            method: "POST",
            path: "/kunde/ny",
            body: "kundenavn=Ola+Nordmann&epost=ola@example.com&postnr=9019",
          },
          {
            method: "POST",
            path: "/kunde/ny",
            body: "kundenavn=&epost=ikke-en-epost&postnr=ABC",
          },
        ],
      },
      verifications: [
        {
          label: "Gyldig skjema gir 'OK: Ola Nordmann / ola@example.com / 9019'",
          check: { kind: "response-contains", requestIdx: 0, needle: "OK: Ola Nordmann" },
        },
        {
          label: "Ugyldig postnr fanges av Regexp-validatoren",
          check: { kind: "response-contains", requestIdx: 1, needle: "Postnr må være 4 siffer" },
        },
        {
          label: "Ugyldig e-post fanges av Email-validatoren",
          check: { kind: "response-contains", requestIdx: 1, needle: "epost:" },
        },
      ],
      hint:
        "class KundeForm(FlaskForm):\n    kundenavn = StringField('Kundenavn', validators=[DataRequired(), Length(max=100)])\n    epost = StringField('E-post', validators=[DataRequired(), Email()])\n    postnr = StringField('Postnr', validators=[\n        DataRequired(),\n        Regexp(r'^\\d{4}$', message='Postnr må være 4 siffer')\n    ])",
    },

    // ============ LEKSJON 9 ===========================================
    {
      id: "09-jinja-arv",
      title: "9. Jinja templates med arv",
      narrative:
        "Når du har mange sider vil du ikke gjenta `<head>`, navbar og footer overalt. **Template-arv** lar deg ha én `base.html` som definerer rammeverket, og children som fyller inn innholdet.\n\nUtleieapp har `app/templates/base.html` med:\n\n```jinja\n<title>{% block title %}UtleieApp{% endblock %}</title>\n...\n{% block content %}{% endblock %}\n```\n\nOg `auth/login.html` arver via:\n\n```jinja\n{% extends \"base.html\" %}\n{% block title %}Logg inn - UtleieApp{% endblock %}\n{% block content %}<form>...</form>{% endblock %}\n```\n\n**Din oppgave:**\n\n1. I `app/templates/base.html`: fyll inn `{% block title %}` og `{% block content %}`.\n2. I `app/templates/kunder.html`: `{% extends \"base.html\" %}`, override `title` til `\"Kunder - UtleieApp\"`, og fyll `content` med en `<h1>` og en `<ul>` over alle kundenavn.\n\n`KUNDER` er hardkodet i appen — ingen DB i denne leksjonen.",
      files: {
        "app/__init__.py": `from flask import Flask, render_template

KUNDER = ['Ola Nordmann', 'Kari Hansen', 'Per Olsen']


def create_app():
    app = Flask(__name__)

    @app.route('/kunder')
    def kunder():
        return render_template('kunder.html', kunder=KUNDER)

    return app
`,
        "app/templates/base.html": `<!doctype html>
<html lang="no">
<head>
    <meta charset="UTF-8">
    <title>{# DIN OPPGAVE: lag en {% block title %} med default 'UtleieApp' #}</title>
</head>
<body>
    <nav>UtleieApp-navbar her</nav>
    <main>
        {# DIN OPPGAVE: lag en {% block content %}{% endblock %} her #}
    </main>
</body>
</html>
`,
        "app/templates/kunder.html": `{# DIN OPPGAVE:
   1. extends "base.html"
   2. Override block title til "Kunder - UtleieApp"
   3. Override block content med:
      <h1>Kundeliste</h1>
      <ul>
         <li>...</li> for hver kunde i "kunder"
      </ul>
#}
`,
        "run.py": `from app import create_app
app = create_app()
`,
      },
      defaultFile: "app/templates/base.html",
      editable: ["app/templates/base.html", "app/templates/kunder.html"],
      run: {
        kind: "flask-test-client",
        entry: "run.py",
        requests: [{ method: "GET", path: "/kunder" }],
      },
      verifications: [
        {
          label: "Title overridet til 'Kunder - UtleieApp'",
          check: { kind: "response-contains", requestIdx: 0, needle: "<title>Kunder - UtleieApp</title>" },
        },
        {
          label: "Innhold viser <h1>Kundeliste</h1>",
          check: { kind: "response-contains", requestIdx: 0, needle: "<h1>Kundeliste</h1>" },
        },
        {
          label: "Navbar fra base.html henger med (arv funker)",
          check: { kind: "response-contains", requestIdx: 0, needle: "UtleieApp-navbar her" },
        },
        {
          label: "Ola Nordmann finnes i listen",
          check: { kind: "response-contains", requestIdx: 0, needle: "Ola Nordmann" },
        },
      ],
      hint:
        "I base.html:\n  <title>{% block title %}UtleieApp{% endblock %}</title>\n  ...\n  {% block content %}{% endblock %}\n\nI kunder.html:\n  {% extends \"base.html\" %}\n  {% block title %}Kunder - UtleieApp{% endblock %}\n  {% block content %}\n    <h1>Kundeliste</h1>\n    <ul>\n      {% for k in kunder %}<li>{{ k }}</li>{% endfor %}\n    </ul>\n  {% endblock %}",
    },

    // ============ LEKSJON 10 ===========================================
    {
      id: "10-flash",
      title: "10. Flash messages med kategorier",
      narrative:
        "Når du gjør en POST + redirect (vanlig pattern: \"PRG\" — Post/Redirect/Get) vil du gjerne si til brukeren: \"Kunden ble lagret!\" — men siden du redirecter, mister du response-bodyen.\n\n**`flash(melding, kategori)`** løser det. Meldingen legges i sesjonen og vises på NESTE request, deretter forsvinner den.\n\nUtleieapp bruker dette overalt, f.eks. i `app/kunder/routes.py`:\n\n```python\nflash(f'Kunde \"{form.kundenavn.data}\" ble opprettet', 'success')\nreturn redirect(url_for('kunder.liste'))\n```\n\nKategorier brukes til å style: `success`, `danger`, `warning`, `info` — Bootstrap-klassen blir `alert-success` osv.\n\n**Din oppgave i `app/routes.py`:** `/lagre/<navn>` skal kalle `flash(f\"Kunde '{navn}' lagret\", 'success')` og redirecte til `/liste`. (Templaten er gitt — den henter meldingene med `get_flashed_messages(with_categories=true)`.)",
      files: {
        "app/__init__.py": `from flask import Flask, render_template
from app.routes import bp


def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'flash-trenger-secret-key-for-sesjon'
    app.register_blueprint(bp)
    return app
`,
        "app/routes.py": `from flask import Blueprint, flash, redirect, url_for, render_template

bp = Blueprint('main', __name__)


@bp.route('/lagre/<navn>')
def lagre(navn):
    # === DIN OPPGAVE ===
    # 1. flash(f"Kunde '{navn}' lagret", 'success')
    # 2. return redirect(url_for('main.liste'))
    pass


@bp.route('/liste')
def liste():
    return render_template('liste.html')
`,
        "app/templates/liste.html": `<!doctype html>
<html>
<body>
  <h1>Kunder</h1>
  {% with messages = get_flashed_messages(with_categories=true) %}
    {% if messages %}
      {% for category, msg in messages %}
        <div class="alert alert-{{ category }}">{{ msg }}</div>
      {% endfor %}
    {% endif %}
  {% endwith %}
  <p>(Liste over kunder ville stått her.)</p>
</body>
</html>
`,
        "run.py": `from app import create_app
app = create_app()
`,
      },
      defaultFile: "app/routes.py",
      editable: ["app/routes.py"],
      run: {
        kind: "flask-test-client",
        entry: "run.py",
        requests: [
          { method: "GET", path: "/lagre/Ola%20Nordmann", followRedirects: true },
          { method: "GET", path: "/liste" },
        ],
      },
      verifications: [
        {
          label: "Etter redirect rendres alert-success",
          check: { kind: "response-contains", requestIdx: 0, needle: 'class="alert alert-success"' },
        },
        {
          label: "Meldingen 'Kunde \\'Ola Nordmann\\' lagret' vises",
          check: { kind: "response-contains", requestIdx: 0, needle: "Kunde 'Ola Nordmann' lagret" },
        },
        {
          label: "Flash er engangs: andre GET /liste viser INGEN alert",
          check: { kind: "response-status", requestIdx: 1, status: 200 },
        },
      ],
      hint:
        "@bp.route('/lagre/<navn>')\ndef lagre(navn):\n    flash(f\"Kunde '{navn}' lagret\", 'success')\n    return redirect(url_for('main.liste'))",
    },
  ],
};

export const MINI_COURSES: readonly MiniCourse[] = [FLASK_FRA_NULL, BYGG_MINI_SHELL, UTLEIEAPP_FRA_NULL];

export function getMiniCourse(slug: string): MiniCourse | undefined {
  return MINI_COURSES.find((c) => c.slug === slug);
}
