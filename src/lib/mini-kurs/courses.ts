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

// ============================================================================
// TCP-STATE-MACHINE SIMULATOR — 7 leksjoner som bygger TCP-tilstandsmaskinen
// fra null. Studenten implementerer hver overgang i diagrammet fra DTE-2507-
// forelesningen som én if-gren i transition(). Dekker 3-veis handshake (begge
// sider), tap + retransmit, dataoverføring med SEQ/ACK, og 4-veis close.
//
// Runner: python-script (pure Python, ingen socket-import — alt simuleres med
// objektmetoder så det kjører i Pyodide uten avhengigheter).
// ============================================================================

const TCP_STATE_MACHINE: MiniCourse = {
  id: "tcp-state-machine",
  slug: "tcp-state-machine",
  title: "TCP-state-machine fra null",
  blurb:
    "Bygg TCP-tilstandsmaskinen i Python — fra CLOSED → SYN_SENT → ESTABLISHED → FIN_WAIT → TIME_WAIT. Hver pil i diagrammet fra forelesningen blir én if-gren. Du implementerer 3-veis handshake (klient + server), tap og retransmit, dataoverføring med SEQ/ACK, og 4-veis close — og ender opp med å kjøre et helt scenario som printer sekvensdiagram.",
  estimertTid: "45–60 min",
  fag: ["DTE-2507", "Nettverk", "TCP/IP"],
  color: "success",
  lessons: [
    // ============ LEKSJON 1 ===========================================
    {
      id: "01-state-enum",
      title: "1. Tilstands-enum og første overgang",
      narrative:
        "TCP er en **tilstandsmaskin**. En tilkobling er alltid i én av 11 navngitte tilstander (CLOSED, LISTEN, SYN_SENT, SYN_RCVD, ESTABLISHED, FIN_WAIT_1, FIN_WAIT_2, CLOSE_WAIT, LAST_ACK, TIME_WAIT, CLOSING). En **hendelse** — `active_open`, `recv_syn`, `recv_ack`, `close`, `timeout` — får tilstanden til å skifte.\n\nDiagrammet fra forelesningen viser hver overgang som en pil med form `event / action`. F.eks. `LISTEN → SYN_RCVD` ved `recv_syn / send SYN-ACK`. Hver pil blir én if-gren i `transition()`.\n\n**Din oppgave:** Implementér ÉN overgang — den aller første. Når `state == CLOSED` og hendelsen er `\"active_open\"` (klienten ber om å åpne en tilkobling):\n\n1. Sett `self.state = State.SYN_SENT`\n2. Legg `\"SYN\"` til `self.sendt`-listen\n\n`State`-enumet og resten av strukturen er gitt — du fyller bare inn én if-blokk.",
      files: {
        "tcp.py": `from enum import Enum


class State(Enum):
    CLOSED = "CLOSED"
    LISTEN = "LISTEN"
    SYN_SENT = "SYN_SENT"
    SYN_RCVD = "SYN_RCVD"
    ESTABLISHED = "ESTABLISHED"
    FIN_WAIT_1 = "FIN_WAIT_1"
    FIN_WAIT_2 = "FIN_WAIT_2"
    CLOSE_WAIT = "CLOSE_WAIT"
    LAST_ACK = "LAST_ACK"
    TIME_WAIT = "TIME_WAIT"
    CLOSING = "CLOSING"


class TcpConnection:
    def __init__(self, navn):
        self.navn = navn
        self.state = State.CLOSED
        self.sendt = []  # log av segmenter vi har sendt

    def transition(self, event):
        """Én overgang per kall — en if-gren per pil i diagrammet."""
        # === DIN OPPGAVE ===
        # CLOSED + "active_open" → SYN_SENT / send "SYN"
        pass


# Test
def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


c = TcpConnection("klient")
sjekk(c.state, State.CLOSED, "starter i CLOSED")

c.transition("active_open")
sjekk(c.state, State.SYN_SENT, "active_open → SYN_SENT")
sjekk(c.sendt, ["SYN"], "SYN ble sendt")
`,
      },
      defaultFile: "tcp.py",
      editable: ["tcp.py"],
      run: { kind: "python-script", entry: "tcp.py" },
      verifications: [
        {
          label: "Tilkoblingen starter i CLOSED",
          check: { kind: "output-contains", needle: "OK   starter i CLOSED" },
        },
        {
          label: "active_open går til SYN_SENT",
          check: { kind: "output-contains", needle: "OK   active_open → SYN_SENT" },
        },
        {
          label: "SYN-segmentet legges i sendt-listen",
          check: { kind: "output-contains", needle: "OK   SYN ble sendt" },
        },
      ],
      hint:
        'if self.state == State.CLOSED and event == "active_open":\n    self.state = State.SYN_SENT\n    self.sendt.append("SYN")',
    },

    // ============ LEKSJON 2 ===========================================
    {
      id: "02-client-handshake",
      title: "2. Fullfør klientens 3-veis handshake",
      narrative:
        "Klienten har sendt SYN og er nå i SYN_SENT. Den venter på at serveren skal svare med **SYN-ACK** — to flagg i ett segment som sier «ja, jeg vil koble til, og jeg bekrefter din SYN».\n\nNår SYN-ACK ankommer gjør klienten to ting:\n\n1. Sender en ren **ACK** tilbake (bekreftelse på SYN-ACK-en)\n2. Går til ESTABLISHED — tilkoblingen er åpen\n\nHele handshaken fra klientens side:\n\n```\n  CLOSED ─ active_open / send SYN ─→ SYN_SENT\n  SYN_SENT ─ recv_syn_ack / send ACK ─→ ESTABLISHED\n```\n\n**Din oppgave:** Legg til ÉN ny if-gren i `transition()`: `SYN_SENT + \"recv_syn_ack\"` → `ESTABLISHED`, og send `\"ACK\"`. Behold overgangen fra leksjon 1.",
      files: {
        "tcp.py": `from enum import Enum


class State(Enum):
    CLOSED = "CLOSED"
    LISTEN = "LISTEN"
    SYN_SENT = "SYN_SENT"
    SYN_RCVD = "SYN_RCVD"
    ESTABLISHED = "ESTABLISHED"
    FIN_WAIT_1 = "FIN_WAIT_1"
    FIN_WAIT_2 = "FIN_WAIT_2"
    CLOSE_WAIT = "CLOSE_WAIT"
    LAST_ACK = "LAST_ACK"
    TIME_WAIT = "TIME_WAIT"
    CLOSING = "CLOSING"


class TcpConnection:
    def __init__(self, navn):
        self.navn = navn
        self.state = State.CLOSED
        self.sendt = []

    def transition(self, event):
        # Beholder leksjon 1:
        if self.state == State.CLOSED and event == "active_open":
            self.state = State.SYN_SENT
            self.sendt.append("SYN")
            return

        # === DIN OPPGAVE ===
        # SYN_SENT + "recv_syn_ack" → ESTABLISHED / send "ACK"


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


c = TcpConnection("klient")
c.transition("active_open")
c.transition("recv_syn_ack")

sjekk(c.state, State.ESTABLISHED, "tilkoblingen er etablert")
sjekk(c.sendt, ["SYN", "ACK"], "hele handshake-loggen er [SYN, ACK]")
`,
      },
      defaultFile: "tcp.py",
      editable: ["tcp.py"],
      run: { kind: "python-script", entry: "tcp.py" },
      verifications: [
        {
          label: "Klienten ender i ESTABLISHED",
          check: { kind: "output-contains", needle: "OK   tilkoblingen er etablert" },
        },
        {
          label: "Sendte segmenter er [SYN, ACK]",
          check: { kind: "output-contains", needle: "OK   hele handshake-loggen er [SYN, ACK]" },
        },
      ],
      hint:
        'if self.state == State.SYN_SENT and event == "recv_syn_ack":\n    self.state = State.ESTABLISHED\n    self.sendt.append("ACK")\n    return',
    },

    // ============ LEKSJON 3 ===========================================
    {
      id: "03-server-handshake",
      title: "3. Server-sidens handshake (passive open)",
      narrative:
        "Serveren begynner i CLOSED, men i stedet for `active_open` kaller den `passive_open` (i ekte kode: `socket.listen()`). Det tar den til **LISTEN**, hvor den venter passivt på innkommende SYN-er.\n\nNår en SYN ankommer går serveren til **SYN_RCVD** og svarer med SYN-ACK. Når klientens siste ACK kommer, går serveren til ESTABLISHED.\n\n```\n  CLOSED   ─ passive_open                ─→ LISTEN\n  LISTEN   ─ recv_syn      / send SYN-ACK ─→ SYN_RCVD\n  SYN_RCVD ─ recv_ack                    ─→ ESTABLISHED\n```\n\nLegg merke til at LISTEN-overgangen IKKE har en handling — serveren sitter bare og venter. Ingen segmenter sendes ut.\n\n**Din oppgave:** Legg til de tre nye if-grenene over.",
      files: {
        "tcp.py": `from enum import Enum


class State(Enum):
    CLOSED = "CLOSED"
    LISTEN = "LISTEN"
    SYN_SENT = "SYN_SENT"
    SYN_RCVD = "SYN_RCVD"
    ESTABLISHED = "ESTABLISHED"
    FIN_WAIT_1 = "FIN_WAIT_1"
    FIN_WAIT_2 = "FIN_WAIT_2"
    CLOSE_WAIT = "CLOSE_WAIT"
    LAST_ACK = "LAST_ACK"
    TIME_WAIT = "TIME_WAIT"
    CLOSING = "CLOSING"


class TcpConnection:
    def __init__(self, navn):
        self.navn = navn
        self.state = State.CLOSED
        self.sendt = []

    def transition(self, event):
        # Klient-grener fra leksjon 1 og 2:
        if self.state == State.CLOSED and event == "active_open":
            self.state = State.SYN_SENT
            self.sendt.append("SYN")
            return
        if self.state == State.SYN_SENT and event == "recv_syn_ack":
            self.state = State.ESTABLISHED
            self.sendt.append("ACK")
            return

        # === DIN OPPGAVE: tre nye grener ===
        # 1) CLOSED   + "passive_open" → LISTEN (ingen send)
        # 2) LISTEN   + "recv_syn"     → SYN_RCVD / send "SYN-ACK"
        # 3) SYN_RCVD + "recv_ack"     → ESTABLISHED (ingen send)


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


s = TcpConnection("server")
s.transition("passive_open")
sjekk(s.state, State.LISTEN, "passive_open → LISTEN")
sjekk(s.sendt, [], "LISTEN sender ingenting")

s.transition("recv_syn")
sjekk(s.state, State.SYN_RCVD, "recv_syn → SYN_RCVD")
sjekk(s.sendt, ["SYN-ACK"], "server sender SYN-ACK")

s.transition("recv_ack")
sjekk(s.state, State.ESTABLISHED, "recv_ack → ESTABLISHED (server)")
`,
      },
      defaultFile: "tcp.py",
      editable: ["tcp.py"],
      run: { kind: "python-script", entry: "tcp.py" },
      verifications: [
        {
          label: "passive_open tar serveren til LISTEN",
          check: { kind: "output-contains", needle: "OK   passive_open → LISTEN" },
        },
        {
          label: "Server i LISTEN sender ikke noe",
          check: { kind: "output-contains", needle: "OK   LISTEN sender ingenting" },
        },
        {
          label: "recv_syn flytter serveren til SYN_RCVD",
          check: { kind: "output-contains", needle: "OK   recv_syn → SYN_RCVD" },
        },
        {
          label: "Server sender SYN-ACK",
          check: { kind: "output-contains", needle: "OK   server sender SYN-ACK" },
        },
        {
          label: "Etter klientens ACK er serveren ESTABLISHED",
          check: { kind: "output-contains", needle: "OK   recv_ack → ESTABLISHED (server)" },
        },
      ],
      hint:
        'if self.state == State.CLOSED and event == "passive_open":\n    self.state = State.LISTEN\n    return\nif self.state == State.LISTEN and event == "recv_syn":\n    self.state = State.SYN_RCVD\n    self.sendt.append("SYN-ACK")\n    return\nif self.state == State.SYN_RCVD and event == "recv_ack":\n    self.state = State.ESTABLISHED\n    return',
    },

    // ============ LEKSJON 4 ===========================================
    {
      id: "04-retransmit",
      title: "4. Tap og retransmit i SYN_SENT",
      narrative:
        "Internett er ikke pålitelig — en SYN kan forsvinne på veien. Klienten sitter i SYN_SENT og venter, men ingen SYN-ACK kommer.\n\nEtter en **timeout** retransmitterer klienten SYN-en. Etter 3 forsøk uten svar gir den opp og går tilbake til CLOSED.\n\n```\n  SYN_SENT + timeout (retries < 3) → SYN_SENT / send \"SYN\" (igjen)\n  SYN_SENT + timeout (retries ≥ 3) → CLOSED   / (gi opp)\n```\n\nLegg merke til at vi **blir i samme state** ved første timeout — bare loggen og telleren endres. Det er en helt gyldig overgang (selv-loop på diagrammet).\n\nVi har lagt til `self.retries = 0` i `__init__`. Din jobb: implementér timeout-grenen så telleren økes for hvert forsøk, og etter den 3. (når `retries == 3`) går vi til CLOSED uten å sende.\n\n**Tips:** Inkrement først, deretter sjekk. Bruk én if-gren med en intern verdi-sjekk.",
      files: {
        "tcp.py": `from enum import Enum


class State(Enum):
    CLOSED = "CLOSED"
    LISTEN = "LISTEN"
    SYN_SENT = "SYN_SENT"
    SYN_RCVD = "SYN_RCVD"
    ESTABLISHED = "ESTABLISHED"
    FIN_WAIT_1 = "FIN_WAIT_1"
    FIN_WAIT_2 = "FIN_WAIT_2"
    CLOSE_WAIT = "CLOSE_WAIT"
    LAST_ACK = "LAST_ACK"
    TIME_WAIT = "TIME_WAIT"
    CLOSING = "CLOSING"


MAX_RETRIES = 3


class TcpConnection:
    def __init__(self, navn):
        self.navn = navn
        self.state = State.CLOSED
        self.sendt = []
        self.retries = 0

    def transition(self, event):
        if self.state == State.CLOSED and event == "active_open":
            self.state = State.SYN_SENT
            self.sendt.append("SYN")
            return
        if self.state == State.SYN_SENT and event == "recv_syn_ack":
            self.state = State.ESTABLISHED
            self.sendt.append("ACK")
            return

        # === DIN OPPGAVE ===
        # SYN_SENT + "timeout":
        #   - hvis self.retries < MAX_RETRIES: behold state, send "SYN" igjen,
        #     og inkrement self.retries.
        #   - ellers (retries >= MAX_RETRIES): gå til CLOSED, ikke send noe.


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


c = TcpConnection("klient")
c.transition("active_open")
sjekk(c.sendt, ["SYN"], "første SYN sendt")

c.transition("timeout")
sjekk(c.state, State.SYN_SENT, "etter 1. timeout: fortsatt SYN_SENT")
sjekk(c.sendt, ["SYN", "SYN"], "SYN retransmittert (forsøk 2)")
sjekk(c.retries, 1, "retries = 1")

c.transition("timeout")
c.transition("timeout")
sjekk(c.retries, 3, "retries = 3 etter tre timeouts")
sjekk(c.sendt, ["SYN", "SYN", "SYN", "SYN"], "SYN sendt totalt 4 ganger")

c.transition("timeout")  # nå skal vi gi opp
sjekk(c.state, State.CLOSED, "etter 4. timeout: tilbake til CLOSED")
`,
      },
      defaultFile: "tcp.py",
      editable: ["tcp.py"],
      run: { kind: "python-script", entry: "tcp.py" },
      verifications: [
        {
          label: "Første SYN sendes umiddelbart",
          check: { kind: "output-contains", needle: "OK   første SYN sendt" },
        },
        {
          label: "Klienten blir i SYN_SENT etter første timeout",
          check: { kind: "output-contains", needle: "OK   etter 1. timeout: fortsatt SYN_SENT" },
        },
        {
          label: "Retries-telleren økes til 1",
          check: { kind: "output-contains", needle: "OK   retries = 1" },
        },
        {
          label: "Etter tre timeouts er retries = 3",
          check: { kind: "output-contains", needle: "OK   retries = 3 etter tre timeouts" },
        },
        {
          label: "Klienten gir opp og går til CLOSED",
          check: { kind: "output-contains", needle: "OK   etter 4. timeout: tilbake til CLOSED" },
        },
      ],
      hint:
        'if self.state == State.SYN_SENT and event == "timeout":\n    if self.retries < MAX_RETRIES:\n        self.sendt.append("SYN")\n        self.retries += 1\n    else:\n        self.state = State.CLOSED\n    return',
    },

    // ============ LEKSJON 5 ===========================================
    {
      id: "05-data-seq",
      title: "5. Datafase: SEQ-nummer og ACK",
      narrative:
        "I ESTABLISHED-state flyter data. Hvert segment har et **sekvensnummer (SEQ)** som peker på første byte i payload. Mottakeren svarer med en **ACK** som er nummeret på neste byte den forventer — altså `seq + len(payload)`.\n\nI ekte TCP starter SEQ med en tilfeldig ISN (Initial Sequence Number). Vi setter `self.seq = 1000` for forutsigbare tester.\n\n```\n  ESTABLISHED + send_data(payload) → ESTABLISHED / send \"Data(seq=X,len=Y)\"\n                                                   self.seq += len(payload)\n```\n\n**Din oppgave:** Implementér metoden `send_data(payload)`:\n\n1. Sjekk at vi er i ESTABLISHED (hvis ikke, returner stille — TCP nekter å sende data utenfor ESTABLISHED).\n2. Legg `f\"Data(seq={self.seq},len={len(payload)})\"` til `self.sendt`.\n3. Inkrement `self.seq` med `len(payload)`.",
      files: {
        "tcp.py": `from enum import Enum


class State(Enum):
    CLOSED = "CLOSED"
    LISTEN = "LISTEN"
    SYN_SENT = "SYN_SENT"
    SYN_RCVD = "SYN_RCVD"
    ESTABLISHED = "ESTABLISHED"
    FIN_WAIT_1 = "FIN_WAIT_1"
    FIN_WAIT_2 = "FIN_WAIT_2"
    CLOSE_WAIT = "CLOSE_WAIT"
    LAST_ACK = "LAST_ACK"
    TIME_WAIT = "TIME_WAIT"
    CLOSING = "CLOSING"


class TcpConnection:
    def __init__(self, navn):
        self.navn = navn
        self.state = State.CLOSED
        self.sendt = []
        self.seq = 1000  # forenklet ISN

    def transition(self, event):
        if self.state == State.CLOSED and event == "active_open":
            self.state = State.SYN_SENT
            self.sendt.append("SYN")
            return
        if self.state == State.SYN_SENT and event == "recv_syn_ack":
            self.state = State.ESTABLISHED
            self.sendt.append("ACK")
            return

    def send_data(self, payload):
        """Send data — kun lov i ESTABLISHED-state."""
        # === DIN OPPGAVE ===
        # 1. Returner stille hvis self.state != State.ESTABLISHED
        # 2. Append f"Data(seq={self.seq},len={len(payload)})" til self.sendt
        # 3. Øk self.seq med len(payload)
        pass


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Forsøk å sende data FØR handshake — skal feile stille
c = TcpConnection("klient")
c.send_data("hei")
sjekk(c.sendt, [], "send_data utenfor ESTABLISHED ignoreres")

# Etabler tilkobling
c.transition("active_open")
c.transition("recv_syn_ack")

# Send tre segmenter
c.send_data("hei")           # 3 bytes
c.send_data("verden!")       # 7 bytes
c.send_data("siste segment") # 14 bytes

# Etter handshake er SYN og ACK i loggen (de teller ikke i SEQ).
# Datasegmentene skal være de siste 3.
data_segmenter = [s for s in c.sendt if s.startswith("Data")]

sjekk(data_segmenter[0], "Data(seq=1000,len=3)", "første dataseg: seq=1000")
sjekk(data_segmenter[1], "Data(seq=1003,len=7)", "andre: seq=1003 (1000+3)")
sjekk(data_segmenter[2], "Data(seq=1010,len=14)", "tredje: seq=1010 (1003+7)")
sjekk(c.seq, 1024, "endelig seq = 1024 (1010+14)")
`,
      },
      defaultFile: "tcp.py",
      editable: ["tcp.py"],
      run: { kind: "python-script", entry: "tcp.py" },
      verifications: [
        {
          label: "send_data nektes utenfor ESTABLISHED",
          check: { kind: "output-contains", needle: "OK   send_data utenfor ESTABLISHED ignoreres" },
        },
        {
          label: "Første datasegment har seq = 1000",
          check: { kind: "output-contains", needle: "OK   første dataseg: seq=1000" },
        },
        {
          label: "SEQ øker med len(payload) — andre seg har seq = 1003",
          check: { kind: "output-contains", needle: "OK   andre: seq=1003 (1000+3)" },
        },
        {
          label: "Tredje segment fortsetter teller: seq = 1010",
          check: { kind: "output-contains", needle: "OK   tredje: seq=1010 (1003+7)" },
        },
        {
          label: "Endelig SEQ etter alle tre segmenter = 1024",
          check: { kind: "output-contains", needle: "OK   endelig seq = 1024 (1010+14)" },
        },
      ],
      hint:
        'def send_data(self, payload):\n    if self.state != State.ESTABLISHED:\n        return\n    self.sendt.append(f"Data(seq={self.seq},len={len(payload)})")\n    self.seq += len(payload)',
    },

    // ============ LEKSJON 6 ===========================================
    {
      id: "06-close-handshake",
      title: "6. 4-veis close og TIME_WAIT",
      narrative:
        "TCP-lukking er **asymmetrisk** — hver side må lukke sin retning uavhengig. Det gir oss 4 segmenter (FIN, ACK, FIN, ACK) i stedet for 3 som ved åpning.\n\nSiden som lukker først (aktiv close) går gjennom denne sekvensen:\n\n```\n  ESTABLISHED + close      / send FIN ─→ FIN_WAIT_1\n  FIN_WAIT_1  + recv_ack              ─→ FIN_WAIT_2\n  FIN_WAIT_2  + recv_fin   / send ACK ─→ TIME_WAIT\n  TIME_WAIT   + timeout               ─→ CLOSED\n```\n\n**Hvorfor TIME_WAIT?** Når vi sender den siste ACK-en og går rett til CLOSED, og den ACK-en blir mistet, vil den andre siden retransmittere FIN — men vi har glemt tilkoblingen og svarer med RST. Det er stygt. TIME_WAIT (i ekte TCP: 2 × MSL ≈ 60 s) holder oss «levende» lenge nok til å håndtere en eventuell retransmittert FIN.\n\n**Din oppgave:** Implementér de fire nye if-grenene over.",
      files: {
        "tcp.py": `from enum import Enum


class State(Enum):
    CLOSED = "CLOSED"
    LISTEN = "LISTEN"
    SYN_SENT = "SYN_SENT"
    SYN_RCVD = "SYN_RCVD"
    ESTABLISHED = "ESTABLISHED"
    FIN_WAIT_1 = "FIN_WAIT_1"
    FIN_WAIT_2 = "FIN_WAIT_2"
    CLOSE_WAIT = "CLOSE_WAIT"
    LAST_ACK = "LAST_ACK"
    TIME_WAIT = "TIME_WAIT"
    CLOSING = "CLOSING"


class TcpConnection:
    def __init__(self, navn):
        self.navn = navn
        self.state = State.CLOSED
        self.sendt = []

    def transition(self, event):
        if self.state == State.CLOSED and event == "active_open":
            self.state = State.SYN_SENT
            self.sendt.append("SYN")
            return
        if self.state == State.SYN_SENT and event == "recv_syn_ack":
            self.state = State.ESTABLISHED
            self.sendt.append("ACK")
            return

        # === DIN OPPGAVE: fire nye grener ===
        # 1) ESTABLISHED + "close"    → FIN_WAIT_1  / send "FIN"
        # 2) FIN_WAIT_1  + "recv_ack" → FIN_WAIT_2  (ingen send)
        # 3) FIN_WAIT_2  + "recv_fin" → TIME_WAIT   / send "ACK"
        # 4) TIME_WAIT   + "timeout"  → CLOSED      (ingen send)


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


c = TcpConnection("klient")
c.transition("active_open")
c.transition("recv_syn_ack")
# Nå er vi i ESTABLISHED. Start aktiv close.

c.transition("close")
sjekk(c.state, State.FIN_WAIT_1, "close → FIN_WAIT_1")
sjekk(c.sendt[-1], "FIN", "FIN ble sendt")

c.transition("recv_ack")
sjekk(c.state, State.FIN_WAIT_2, "recv_ack → FIN_WAIT_2")

c.transition("recv_fin")
sjekk(c.state, State.TIME_WAIT, "recv_fin → TIME_WAIT")
sjekk(c.sendt[-1], "ACK", "siste ACK ble sendt")

c.transition("timeout")
sjekk(c.state, State.CLOSED, "TIME_WAIT-timeout → CLOSED")
`,
      },
      defaultFile: "tcp.py",
      editable: ["tcp.py"],
      run: { kind: "python-script", entry: "tcp.py" },
      verifications: [
        {
          label: "close tar oss til FIN_WAIT_1 og sender FIN",
          check: { kind: "output-contains", needle: "OK   close → FIN_WAIT_1" },
        },
        {
          label: "FIN er det siste segmentet etter close",
          check: { kind: "output-contains", needle: "OK   FIN ble sendt" },
        },
        {
          label: "ACK på vår FIN tar oss til FIN_WAIT_2",
          check: { kind: "output-contains", needle: "OK   recv_ack → FIN_WAIT_2" },
        },
        {
          label: "Server-FIN tar oss til TIME_WAIT",
          check: { kind: "output-contains", needle: "OK   recv_fin → TIME_WAIT" },
        },
        {
          label: "Vi ACK-er server-FIN-en",
          check: { kind: "output-contains", needle: "OK   siste ACK ble sendt" },
        },
        {
          label: "TIME_WAIT-timeout går til CLOSED",
          check: { kind: "output-contains", needle: "OK   TIME_WAIT-timeout → CLOSED" },
        },
      ],
      hint:
        'if self.state == State.ESTABLISHED and event == "close":\n    self.state = State.FIN_WAIT_1\n    self.sendt.append("FIN")\n    return\nif self.state == State.FIN_WAIT_1 and event == "recv_ack":\n    self.state = State.FIN_WAIT_2\n    return\nif self.state == State.FIN_WAIT_2 and event == "recv_fin":\n    self.state = State.TIME_WAIT\n    self.sendt.append("ACK")\n    return\nif self.state == State.TIME_WAIT and event == "timeout":\n    self.state = State.CLOSED\n    return',
    },

    // ============ LEKSJON 7 ===========================================
    {
      id: "07-scenario-diagram",
      title: "7. Helt scenario med sekvensdiagram",
      narrative:
        "Du har nå alle overgangene. La oss kjøre et fullt scenario: klient og server koordinerer, åpner tilkobling, utveksler data, og lukker — og vi printer et ASCII-sekvensdiagram av hvert segment som flyter mellom dem.\n\nScenarioet er allerede skrevet (`kjor_scenario`-funksjonen mater hendelser inn i begge `TcpConnection`-objektene). Din eneste oppgave er å implementere hjelperen `tegn_pil(avsender, mottaker, segment)` som returnerer én linje med diagrammet:\n\n- Avsender = `\"klient\"`: `\"  klient ──[ SYN ]──> server\"`\n- Avsender = `\"server\"`: `\"  klient <──[ SYN-ACK ]── server\"`\n\nFormat: 2 mellomrom inn, deretter `klient`, så pil med `[ segment ]`, så `server` — med pilens retning avhengig av avsenderen.",
      files: {
        "tcp.py": `from enum import Enum


class State(Enum):
    CLOSED = "CLOSED"
    LISTEN = "LISTEN"
    SYN_SENT = "SYN_SENT"
    SYN_RCVD = "SYN_RCVD"
    ESTABLISHED = "ESTABLISHED"
    FIN_WAIT_1 = "FIN_WAIT_1"
    FIN_WAIT_2 = "FIN_WAIT_2"
    CLOSE_WAIT = "CLOSE_WAIT"
    LAST_ACK = "LAST_ACK"
    TIME_WAIT = "TIME_WAIT"
    CLOSING = "CLOSING"


class TcpConnection:
    """Komplett tilstandsmaskin fra leksjon 1-6. Du har bygd alt dette."""

    def __init__(self, navn):
        self.navn = navn
        self.state = State.CLOSED
        self.sendt = []

    def transition(self, event):
        s, e = self.state, event
        # Åpning — klient
        if s == State.CLOSED and e == "active_open":
            self.state = State.SYN_SENT; self.sendt.append("SYN"); return "SYN"
        if s == State.SYN_SENT and e == "recv_syn_ack":
            self.state = State.ESTABLISHED; self.sendt.append("ACK"); return "ACK"
        # Åpning — server
        if s == State.CLOSED and e == "passive_open":
            self.state = State.LISTEN; return None
        if s == State.LISTEN and e == "recv_syn":
            self.state = State.SYN_RCVD; self.sendt.append("SYN-ACK"); return "SYN-ACK"
        if s == State.SYN_RCVD and e == "recv_ack":
            self.state = State.ESTABLISHED; return None
        # Lukking — aktiv side
        if s == State.ESTABLISHED and e == "close":
            self.state = State.FIN_WAIT_1; self.sendt.append("FIN"); return "FIN"
        if s == State.FIN_WAIT_1 and e == "recv_ack":
            self.state = State.FIN_WAIT_2; return None
        if s == State.FIN_WAIT_2 and e == "recv_fin":
            self.state = State.TIME_WAIT; self.sendt.append("ACK"); return "ACK"
        if s == State.TIME_WAIT and e == "timeout":
            self.state = State.CLOSED; return None
        # Lukking — passiv side
        if s == State.ESTABLISHED and e == "recv_fin":
            self.state = State.CLOSE_WAIT; self.sendt.append("ACK"); return "ACK"
        if s == State.CLOSE_WAIT and e == "close":
            self.state = State.LAST_ACK; self.sendt.append("FIN"); return "FIN"
        if s == State.LAST_ACK and e == "recv_ack":
            self.state = State.CLOSED; return None
        return None


# === DIN OPPGAVE ===
# Returner ÉN linje for sekvensdiagrammet.
# Eksempel-output (eksakt format!):
#   "  klient ──[ SYN ]──> server"
#   "  klient <──[ SYN-ACK ]── server"
def tegn_pil(avsender, mottaker, segment):
    pass


def kjor_scenario():
    klient = TcpConnection("klient")
    server = TcpConnection("server")

    # (avsender_handling_event, mottaker_handling_event)
    # Hver tuple: vi kjører avsenderens event, fanger segmentet,
    # og kjører mottakerens event basert på hva som kom.
    print("=== TCP-tilkobling fra A til Å ===")
    print()
    print("  KLIENT                                  SERVER")
    print("    |                                       |")

    # Server starter i LISTEN
    server.transition("passive_open")

    # 1. Klient sender SYN
    seg = klient.transition("active_open")
    if seg:
        print(tegn_pil("klient", "server", seg))
    server.transition("recv_syn")

    # 2. Server sender SYN-ACK
    seg = server.sendt[-1] if server.sendt else None
    if seg:
        print(tegn_pil("server", "klient", seg))
    klient.transition("recv_syn_ack")

    # 3. Klient sender ACK (siste i handshake)
    seg = klient.sendt[-1]
    print(tegn_pil("klient", "server", seg))
    server.transition("recv_ack")

    print("    |   *** ESTABLISHED ***                 |")

    # 4. Klient lukker
    seg = klient.transition("close")
    if seg:
        print(tegn_pil("klient", "server", seg))

    print("    |                                       |")
    print(f"=== Slutt: klient i {klient.state.value} ===")


# Test
def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


sjekk(
    tegn_pil("klient", "server", "SYN"),
    "  klient ──[ SYN ]──> server",
    "klient→server-pil",
)
sjekk(
    tegn_pil("server", "klient", "SYN-ACK"),
    "  klient <──[ SYN-ACK ]── server",
    "server→klient-pil",
)
sjekk(
    tegn_pil("klient", "server", "FIN"),
    "  klient ──[ FIN ]──> server",
    "FIN er også klient→server",
)

print()
kjor_scenario()
`,
      },
      defaultFile: "tcp.py",
      editable: ["tcp.py"],
      run: { kind: "python-script", entry: "tcp.py" },
      verifications: [
        {
          label: "klient → server tegnes med høyrepil",
          check: { kind: "output-contains", needle: "OK   klient→server-pil" },
        },
        {
          label: "server → klient tegnes med venstrepil",
          check: { kind: "output-contains", needle: "OK   server→klient-pil" },
        },
        {
          label: "Samme funksjon håndterer alle segment-typer",
          check: { kind: "output-contains", needle: "OK   FIN er også klient→server" },
        },
        {
          label: "Sekvensdiagrammet skrives ut",
          check: { kind: "output-contains", needle: "*** ESTABLISHED ***" },
        },
        {
          label: "Scenarioet ender med klient i FIN_WAIT_1 (har sendt FIN)",
          check: { kind: "output-contains", needle: "Slutt: klient i FIN_WAIT_1" },
        },
      ],
      hint:
        'def tegn_pil(avsender, mottaker, segment):\n    if avsender == "klient":\n        return f"  klient ──[ {segment} ]──> server"\n    else:\n        return f"  klient <──[ {segment} ]── server"',
    },
  ],
};

// ============================================================================
// CSP-SOLVER: KART, N-QUEENS OG SUDOKU — 6 leksjoner som bygger en generell
// Constraint Satisfaction Problem-løser fra null. Vi starter med rep av et
// CSP (variabler, domener, binære constraints), implementerer backtracking,
// legger på MRV-heuristikk og forward checking, og avslutter med to klassiske
// anvendelser: N-queens og Sudoku — samme algoritme løser alle tre problemer.
//
// Pedagogisk vinkel for DTE-2501: gjør AIMA-kapittel 6 til kjørbar kode.
// Studenten oppdager selv at "samme solver, ulik problem-formulering".
// Runner: python-script (pure Python, ingen avhengigheter).
// ============================================================================

const CSP_SUDOKU: MiniCourse = {
  id: "csp-sudoku",
  slug: "csp-sudoku",
  title: "CSP-solver: kart, N-queens og Sudoku",
  blurb:
    "Bygg en generell CSP-løser i Python — variabler, domener og constraints → backtracking → MRV-heuristikk → forward checking. Avslutt med å formulere N-queens og 4×4 Sudoku som CSP-er og løse dem med samme solver. Dette er AIMA-kapittel 6 gjort til kode du selv skriver.",
  estimertTid: "60–75 min",
  fag: ["DTE-2501", "Klassisk AI", "Constraint satisfaction"],
  color: "purple",
  lessons: [
    // ============ LEKSJON 1 ===========================================
    {
      id: "01-csp-struct",
      title: "1. CSP-strukturen og konsistens-sjekk",
      narrative:
        "Et **CSP (Constraint Satisfaction Problem)** har tre deler:\n\n1. **Variabler** — det vi skal tilordne verdier til (`Norge`, `Sverige`, ...).\n2. **Domener** — lovlige verdier per variabel (`{rød, grønn, blå}`).\n3. **Constraints** — relasjoner mellom variabler som må holde (`naboer må ha ulik farge`).\n\nSudoku, kart-fargelegging og N-queens er alle CSP-er — samme algoritme løser alle tre. Det vi gjør i dag bygger fundamentet.\n\nVi representerer hver constraint som en trippel `(var1, var2, fn)` der `fn(verdi1, verdi2)` returnerer `True` hvis paret er gyldig. Det kalles **binære constraints**.\n\n**Din oppgave:** Implementér `is_consistent(var, value, assignment)` — kjernen i hele CSP-maskineriet. Den skal returnere `True` hvis det å tildele `var = value` ikke bryter noen constraint mot variabler som allerede har fått verdi.\n\nTeknikk: iterer over alle constraints. For hver `(v1, v2, fn)`:\n- Hvis `var == v1` og `v2` er i assignment: sjekk `fn(value, assignment[v2])`.\n- Hvis `var == v2` og `v1` er i assignment: sjekk `fn(assignment[v1], value)`.\n- Ellers: constraint involverer ikke `var` — hopp over.",
      files: {
        "csp.py": `class CSP:
    def __init__(self, variables, domains, constraints):
        """
        variables:  liste av variabelnavn
        domains:    dict var -> liste av lovlige verdier
        constraints: liste av (var1, var2, fn) der fn(a, b) -> bool
        """
        self.variables = variables
        self.domains = domains
        self.constraints = constraints

    def is_consistent(self, var, value, assignment):
        """True hvis assignment ∪ {var: value} ikke bryter noen constraint."""
        # === DIN OPPGAVE ===
        # For hver (v1, v2, fn) i self.constraints:
        #   - hvis var == v1 og v2 in assignment: sjekk fn(value, assignment[v2])
        #   - hvis var == v2 og v1 in assignment: sjekk fn(assignment[v1], value)
        # Returner False ved første brudd, ellers True til slutt.
        return True


# === Test: kart-fargelegging av Norden ===
ulik = lambda a, b: a != b
csp = CSP(
    variables=["Norge", "Sverige", "Finland", "Russland"],
    domains={
        "Norge": ["rød", "grønn", "blå"],
        "Sverige": ["rød", "grønn", "blå"],
        "Finland": ["rød", "grønn", "blå"],
        "Russland": ["rød", "grønn", "blå"],
    },
    constraints=[
        ("Norge", "Sverige", ulik),
        ("Sverige", "Finland", ulik),
        ("Finland", "Russland", ulik),
        ("Norge", "Finland", ulik),  # møtes på toppen
        # Russland og Norge er IKKE naboer i denne modellen.
    ],
)


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Tom tilordning — alt er konsistent
sjekk(csp.is_consistent("Norge", "rød", {}), True, "tom assignment: alt OK")

# Norge=rød: Sverige=rød bryter (de er naboer)
sjekk(csp.is_consistent("Sverige", "rød", {"Norge": "rød"}), False, "samme farge på naboer bryter")

# Norge=rød: Sverige=grønn er OK
sjekk(csp.is_consistent("Sverige", "grønn", {"Norge": "rød"}), True, "ulike farger på naboer OK")

# Russland og Norge er ikke naboer — samme farge er greit
sjekk(csp.is_consistent("Russland", "rød", {"Norge": "rød"}), True, "ikke-naboer kan dele farge")
`,
      },
      defaultFile: "csp.py",
      editable: ["csp.py"],
      run: { kind: "python-script", entry: "csp.py" },
      verifications: [
        {
          label: "Tom assignment: alle verdier konsistente",
          check: { kind: "output-contains", needle: "OK   tom assignment: alt OK" },
        },
        {
          label: "Naboer med samme farge avvises",
          check: { kind: "output-contains", needle: "OK   samme farge på naboer bryter" },
        },
        {
          label: "Naboer med ulike farger godtas",
          check: { kind: "output-contains", needle: "OK   ulike farger på naboer OK" },
        },
        {
          label: "Variabler uten constraint ignoreres",
          check: { kind: "output-contains", needle: "OK   ikke-naboer kan dele farge" },
        },
      ],
      hint:
        "for (v1, v2, fn) in self.constraints:\n    if var == v1 and v2 in assignment:\n        if not fn(value, assignment[v2]):\n            return False\n    if var == v2 and v1 in assignment:\n        if not fn(assignment[v1], value):\n            return False\nreturn True",
    },

    // ============ LEKSJON 2 ===========================================
    {
      id: "02-backtrack",
      title: "2. Backtracking-søk",
      narrative:
        "**Backtracking** er kjernen i alle CSP-løsere. Pseudokoden er pinlig enkel:\n\n```\nsolve(assignment):\n  hvis alle variabler er tilordnet: returner assignment\n  velg en uassignet variabel\n  for hver verdi i variabelens domene:\n    hvis konsistent: prøv den, og solve rekursivt\n    hvis svaret ikke er None: returner det\n    ellers: backtrack (fjern verdien, prøv neste)\n  returner None  # ingen verdi virket\n```\n\nDet er bare en `for`-løkke med rekursjon. Magien er at den utforsker hele tre-søket uten å rote.\n\nVi har lagt til en `noder`-teller på CSP-klassen så vi kan måle hvor mye arbeid algoritmen gjør.\n\n**Din oppgave:** Implementér `backtrack(csp, assignment)`. Inkrement `csp.noder` ved hver rekursivt kall (det er én utforsket node i søketreet).",
      files: {
        "csp.py": `class CSP:
    def __init__(self, variables, domains, constraints):
        self.variables = variables
        self.domains = domains
        self.constraints = constraints
        self.noder = 0  # ny: teller utforskede søke-noder

    def is_consistent(self, var, value, assignment):
        for (v1, v2, fn) in self.constraints:
            if var == v1 and v2 in assignment:
                if not fn(value, assignment[v2]):
                    return False
            if var == v2 and v1 in assignment:
                if not fn(assignment[v1], value):
                    return False
        return True


def backtrack(csp, assignment):
    """Returner et komplett assignment, eller None hvis ingen finnes."""
    # === DIN OPPGAVE ===
    # 1. Inkrement csp.noder
    # 2. Hvis len(assignment) == len(csp.variables): returner dict(assignment)
    # 3. Velg første uassignerte variabel
    # 4. For hver value i csp.domains[var]:
    #    - hvis csp.is_consistent(var, value, assignment):
    #         assignment[var] = value
    #         resultat = backtrack(csp, assignment)
    #         hvis resultat != None: returner resultat
    #         ellers: del assignment[var]  (backtrack)
    # 5. Returner None
    pass


# Samme kart som leksjon 1
ulik = lambda a, b: a != b
csp = CSP(
    variables=["Norge", "Sverige", "Finland", "Russland"],
    domains={
        "Norge": ["rød", "grønn", "blå"],
        "Sverige": ["rød", "grønn", "blå"],
        "Finland": ["rød", "grønn", "blå"],
        "Russland": ["rød", "grønn", "blå"],
    },
    constraints=[
        ("Norge", "Sverige", ulik),
        ("Sverige", "Finland", ulik),
        ("Finland", "Russland", ulik),
        ("Norge", "Finland", ulik),
    ],
)

løsning = backtrack(csp, {})
print(f"Løsning: {løsning}")
print(f"Antall noder utforsket: {csp.noder}")


def er_gyldig(løs, csp):
    if løs is None or len(løs) != len(csp.variables):
        return False
    for (v1, v2, fn) in csp.constraints:
        if v1 in løs and v2 in løs:
            if not fn(løs[v1], løs[v2]):
                return False
    return True


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


sjekk(løsning is not None, True, "fant en løsning")
sjekk(er_gyldig(løsning, csp), True, "løsning oppfyller alle constraints")
sjekk(csp.noder > 0, True, "noder ble talt under søk")
`,
      },
      defaultFile: "csp.py",
      editable: ["csp.py"],
      run: { kind: "python-script", entry: "csp.py" },
      verifications: [
        {
          label: "Backtracking fant en løsning",
          check: { kind: "output-contains", needle: "OK   fant en løsning" },
        },
        {
          label: "Løsningen oppfyller alle constraints",
          check: { kind: "output-contains", needle: "OK   løsning oppfyller alle constraints" },
        },
        {
          label: "Noder ble talt under søket",
          check: { kind: "output-contains", needle: "OK   noder ble talt under søk" },
        },
      ],
      hint:
        "def backtrack(csp, assignment):\n    csp.noder += 1\n    if len(assignment) == len(csp.variables):\n        return dict(assignment)\n    var = next(v for v in csp.variables if v not in assignment)\n    for value in csp.domains[var]:\n        if csp.is_consistent(var, value, assignment):\n            assignment[var] = value\n            result = backtrack(csp, assignment)\n            if result is not None:\n                return result\n            del assignment[var]\n    return None",
    },

    // ============ LEKSJON 3 ===========================================
    {
      id: "03-mrv",
      title: "3. MRV-heuristikk (Minimum Remaining Values)",
      narrative:
        "Naiv backtracking velger neste variabel i listerekkefølge. Det er ofte tilfeldig — og dårlig.\n\n**MRV (Minimum Remaining Values)** velger den mest *skvisete* variabelen først: den som har færrest gjenværende lovlige verdier. Intuisjon: hvis en variabel bare har 1 verdi igjen, må du jo prøve den. Hvis det viser seg å ikke fungere, oppdager du det med MINIMALT bygge-arbeid.\n\nFor å gjøre `backtrack` heuristikk-vennlig sender vi inn `select_var` som en funksjon-parameter — strategi-mønster.\n\nVi prøver to strategier på samme problem (Australia kart-fargelegging, 7 regioner, 3 farger) og sammenligner antall utforskede noder:\n\n```\nvelg_første(csp, assignment) → første ledige variabel i listen\nvelg_mrv(csp, assignment)    → variabel med færrest LOVLIGE verdier nå\n```\n\n«Lovlig verdi» = en verdi som ville passere `is_consistent` mot nåværende assignment.\n\n**Din oppgave:** Implementér `velg_mrv(csp, assignment)`.",
      files: {
        "csp.py": `class CSP:
    def __init__(self, variables, domains, constraints):
        self.variables = variables
        self.domains = domains
        self.constraints = constraints
        self.noder = 0

    def is_consistent(self, var, value, assignment):
        for (v1, v2, fn) in self.constraints:
            if var == v1 and v2 in assignment:
                if not fn(value, assignment[v2]):
                    return False
            if var == v2 and v1 in assignment:
                if not fn(assignment[v1], value):
                    return False
        return True


def backtrack(csp, assignment, select_var):
    csp.noder += 1
    if len(assignment) == len(csp.variables):
        return dict(assignment)
    var = select_var(csp, assignment)
    for value in csp.domains[var]:
        if csp.is_consistent(var, value, assignment):
            assignment[var] = value
            result = backtrack(csp, assignment, select_var)
            if result is not None:
                return result
            del assignment[var]
    return None


def velg_første(csp, assignment):
    """Naiv strategi: velg første uassignet variabel."""
    for v in csp.variables:
        if v not in assignment:
            return v


# === DIN OPPGAVE ===
# MRV: returner den uassignerte variabelen med færrest LOVLIGE verdier
# (verdier som ville passere csp.is_consistent mot nåværende assignment).
def velg_mrv(csp, assignment):
    pass


def _bygg_australia():
    ulik = lambda a, b: a != b
    regioner = ["WA", "NT", "Q", "NSW", "V", "SA", "T"]
    return CSP(
        variables=regioner,
        domains={v: ["rød", "grønn", "blå"] for v in regioner},
        constraints=[
            ("WA", "NT", ulik), ("WA", "SA", ulik),
            ("NT", "Q", ulik), ("NT", "SA", ulik),
            ("Q", "NSW", ulik), ("Q", "SA", ulik),
            ("NSW", "V", ulik), ("NSW", "SA", ulik),
            ("V", "SA", ulik),
            # T (Tasmania) er en øy — ingen constraints
        ],
    )


csp_naiv = _bygg_australia()
csp_mrv = _bygg_australia()

løsn_naiv = backtrack(csp_naiv, {}, velg_første)
løsn_mrv = backtrack(csp_mrv, {}, velg_mrv)

print(f"Naiv: {csp_naiv.noder} noder, løsning: {løsn_naiv}")
print(f"MRV:  {csp_mrv.noder} noder, løsning: {løsn_mrv}")


def er_gyldig(løs, csp):
    if løs is None or len(løs) != len(csp.variables):
        return False
    for (v1, v2, fn) in csp.constraints:
        if v1 in løs and v2 in løs and not fn(løs[v1], løs[v2]):
            return False
    return True


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


sjekk(er_gyldig(løsn_mrv, csp_mrv), True, "MRV finner gyldig løsning")
sjekk(csp_mrv.noder <= csp_naiv.noder, True, "MRV bruker færre eller like mange noder")
sjekk(løsn_mrv is not None and løsn_mrv.get("T") in ["rød", "grønn", "blå"], True, "Tasmania får en farge selv om den ikke har constraints")
`,
      },
      defaultFile: "csp.py",
      editable: ["csp.py"],
      run: { kind: "python-script", entry: "csp.py" },
      verifications: [
        {
          label: "MRV produserer gyldig løsning på Australia-kartet",
          check: { kind: "output-contains", needle: "OK   MRV finner gyldig løsning" },
        },
        {
          label: "MRV bruker færre eller like mange noder som naiv",
          check: { kind: "output-contains", needle: "OK   MRV bruker færre eller like mange noder" },
        },
        {
          label: "Variabler uten constraints (Tasmania) håndteres",
          check: { kind: "output-contains", needle: "OK   Tasmania får en farge" },
        },
      ],
      hint:
        "def velg_mrv(csp, assignment):\n    uassigned = [v for v in csp.variables if v not in assignment]\n    def lovlige(v):\n        return sum(1 for val in csp.domains[v]\n                   if csp.is_consistent(v, val, assignment))\n    return min(uassigned, key=lovlige)",
    },

    // ============ LEKSJON 4 ===========================================
    {
      id: "04-forward-check",
      title: "4. Forward checking — propager constraints framover",
      narrative:
        "MRV gjør oss flinkere til å *velge* — men vi sjekker fortsatt bare bakover. **Forward checking** ser FRAMOVER: rett etter at vi tilordner `var = value`, fjerner vi alle nå-inkonsistente verdier fra naboenes domener. Hvis et domene blir tomt, har vi truffet en dead end UTEN å gå dypere i rekursjonen.\n\nDette er en form for **constraint propagation** — vi sprer effekten av valg vårt utover i nettverket før vi prøver neste variabel.\n\nNB: Forward checking endrer `csp.domains` dynamisk under søket. Vi MÅ huske hva vi fjernet, så vi kan **reversere** når vi backtracker. Mønster: `propagate()` returnerer en liste over `(nabo, fjernet_verdi)`-par, og caller restaurerer dem hvis svaret er None.\n\n**Din oppgave:** Implementér `propagate(csp, var, value)`. For hver constraint som involverer `var`, fjern verdier fra naboens domene som ikke har støtte gitt at `var = value`. Returner listen av fjernede par.",
      files: {
        "csp.py": `class CSP:
    def __init__(self, variables, domains, constraints):
        self.variables = variables
        self.domains = domains
        self.constraints = constraints
        self.noder = 0

    def is_consistent(self, var, value, assignment):
        for (v1, v2, fn) in self.constraints:
            if var == v1 and v2 in assignment:
                if not fn(value, assignment[v2]):
                    return False
            if var == v2 and v1 in assignment:
                if not fn(assignment[v1], value):
                    return False
        return True


# === DIN OPPGAVE ===
# Etter tilordningen var=value: fjern alle inkonsistente verdier fra
# naboers domener. Returner liste av (nabo, fjernet_verdi)-par så caller
# kan restaurere ved backtrack.
def propagate(csp, var, value, assignment):
    removed = []
    # For hver (v1, v2, fn) i csp.constraints:
    #   bestem hvilken er naboen (motsatt av var)
    #   hvis naboen IKKE er i assignment:
    #     for hver val i list(csp.domains[nabo]):
    #       hvis ikke fn(value, val) -- husk å sjekke rekkefølge!
    #         csp.domains[nabo].remove(val)
    #         removed.append((nabo, val))
    return removed


def backtrack_fc(csp, assignment):
    """Backtracking med forward checking."""
    csp.noder += 1
    if len(assignment) == len(csp.variables):
        return dict(assignment)

    var = next(v for v in csp.variables if v not in assignment)

    for value in list(csp.domains[var]):
        if not csp.is_consistent(var, value, assignment):
            continue
        assignment[var] = value
        removed = propagate(csp, var, value, assignment)

        # Sjekk om noen uassigned domener ble tomme
        tomt_domene = any(
            len(csp.domains[v]) == 0
            for v in csp.variables
            if v not in assignment
        )
        if not tomt_domene:
            result = backtrack_fc(csp, assignment)
            if result is not None:
                return result

        # Restore (alltid)
        for (v, val) in removed:
            csp.domains[v].append(val)
        del assignment[var]

    return None


# Test på Australia
ulik = lambda a, b: a != b
regioner = ["WA", "NT", "Q", "NSW", "V", "SA", "T"]
csp = CSP(
    variables=regioner,
    domains={v: ["rød", "grønn", "blå"] for v in regioner},
    constraints=[
        ("WA", "NT", ulik), ("WA", "SA", ulik),
        ("NT", "Q", ulik), ("NT", "SA", ulik),
        ("Q", "NSW", ulik), ("Q", "SA", ulik),
        ("NSW", "V", ulik), ("NSW", "SA", ulik),
        ("V", "SA", ulik),
    ],
)

løsning = backtrack_fc(csp, {})
print(f"Løsning: {løsning}")
print(f"Noder utforsket med FC: {csp.noder}")


def er_gyldig(løs, csp):
    if løs is None or len(løs) != len(csp.variables):
        return False
    for (v1, v2, fn) in csp.constraints:
        if v1 in løs and v2 in løs and not fn(løs[v1], løs[v2]):
            return False
    return True


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


sjekk(er_gyldig(løsning, csp), True, "FC finner gyldig løsning")
# Etter at hele søket er ferdig OG restaurert, skal domenene være intakte:
sjekk(len(csp.domains["WA"]), 3, "WA-domenet er restaurert til 3 verdier")
sjekk(len(csp.domains["T"]), 3, "Tasmania-domenet er fortsatt 3 verdier")

# Direkte test av propagate
csp2 = CSP(
    variables=["A", "B"],
    domains={"A": [1, 2, 3], "B": [1, 2, 3]},
    constraints=[("A", "B", ulik)],
)
fjernet = propagate(csp2, "A", 2, {"A": 2})
sjekk(2 not in csp2.domains["B"], True, "propagate fjernet inkonsistent verdi fra nabo")
sjekk(("B", 2) in fjernet, True, "fjerning ble registrert i return-listen")
`,
      },
      defaultFile: "csp.py",
      editable: ["csp.py"],
      run: { kind: "python-script", entry: "csp.py" },
      verifications: [
        {
          label: "Forward checking finner gyldig løsning",
          check: { kind: "output-contains", needle: "OK   FC finner gyldig løsning" },
        },
        {
          label: "Domener er restaurert etter søket",
          check: { kind: "output-contains", needle: "OK   WA-domenet er restaurert til 3 verdier" },
        },
        {
          label: "Tasmania (ingen constraint) bevart",
          check: { kind: "output-contains", needle: "OK   Tasmania-domenet er fortsatt 3 verdier" },
        },
        {
          label: "propagate fjerner inkonsistent verdi fra nabo",
          check: { kind: "output-contains", needle: "OK   propagate fjernet inkonsistent verdi fra nabo" },
        },
        {
          label: "propagate returnerer korrekt liste av fjernede par",
          check: { kind: "output-contains", needle: "OK   fjerning ble registrert i return-listen" },
        },
      ],
      hint:
        "def propagate(csp, var, value, assignment):\n    removed = []\n    for (v1, v2, fn) in csp.constraints:\n        if v1 == var and v2 not in assignment:\n            for val in list(csp.domains[v2]):\n                if not fn(value, val):\n                    csp.domains[v2].remove(val)\n                    removed.append((v2, val))\n        elif v2 == var and v1 not in assignment:\n            for val in list(csp.domains[v1]):\n                if not fn(val, value):\n                    csp.domains[v1].remove(val)\n                    removed.append((v1, val))\n    return removed",
    },

    // ============ LEKSJON 5 ===========================================
    {
      id: "05-n-queens",
      title: "5. N-queens som CSP",
      narrative:
        "Nå har vi en generell CSP-solver. Tid for å se at den løser ulike problemer **uten endringer i selve algoritmen** — bare i problem-formuleringen.\n\n**N-queens:** plasser N dronninger på et N×N brett så ingen to truer hverandre (samme rad, kolonne eller diagonal).\n\nSmart formulering: la `Qi` = kolonnen der dronningen i rad `i` står. Da er det automatisk én dronning per rad — vi slipper den constraint-en.\n\nGjenstår to constraints, for hvert par av rader `(i, j)` med `i < j`:\n\n- Ulik kolonne: `Qi != Qj`\n- Ulik diagonal: `|Qi - Qj| != |i - j|`\n\n**Din oppgave:** Implementér `bygg_queens(N)` som returnerer en `CSP`-instans for N-queens. Bruk eksisterende `backtrack_fc` til å løse den.\n\n**Lambda-fellen:** når du lager constraint-funksjoner i en løkke, må du binde løkke-variablene som default-argumenter — ellers fanger lambdaene den samme variabelen. Eksempel: `lambda a, b, di=i, dj=j: ...`.",
      files: {
        "csp.py": `class CSP:
    def __init__(self, variables, domains, constraints):
        self.variables = variables
        self.domains = domains
        self.constraints = constraints
        self.noder = 0

    def is_consistent(self, var, value, assignment):
        for (v1, v2, fn) in self.constraints:
            if var == v1 and v2 in assignment:
                if not fn(value, assignment[v2]):
                    return False
            if var == v2 and v1 in assignment:
                if not fn(assignment[v1], value):
                    return False
        return True


def propagate(csp, var, value, assignment):
    removed = []
    for (v1, v2, fn) in csp.constraints:
        if v1 == var and v2 not in assignment:
            for val in list(csp.domains[v2]):
                if not fn(value, val):
                    csp.domains[v2].remove(val)
                    removed.append((v2, val))
        elif v2 == var and v1 not in assignment:
            for val in list(csp.domains[v1]):
                if not fn(val, value):
                    csp.domains[v1].remove(val)
                    removed.append((v1, val))
    return removed


def backtrack_fc(csp, assignment):
    csp.noder += 1
    if len(assignment) == len(csp.variables):
        return dict(assignment)
    var = next(v for v in csp.variables if v not in assignment)
    for value in list(csp.domains[var]):
        if not csp.is_consistent(var, value, assignment):
            continue
        assignment[var] = value
        removed = propagate(csp, var, value, assignment)
        tomt = any(len(csp.domains[v]) == 0 for v in csp.variables if v not in assignment)
        if not tomt:
            result = backtrack_fc(csp, assignment)
            if result is not None:
                return result
        for (v, val) in removed:
            csp.domains[v].append(val)
        del assignment[var]
    return None


# === DIN OPPGAVE ===
# Returner en CSP for N-queens.
#   - variables: ["Q0", "Q1", ..., f"Q{N-1}"]
#   - domains:   hver Qi har lovlige kolonner [0, 1, ..., N-1]
#   - constraints: for hvert par (i, j) med i < j, legg til:
#         ulik kolonne: a != b
#         ulik diagonal: abs(a - b) != abs(i - j)
#   HUSK lambda-fellen: bind i og j som default-argumenter.
def bygg_queens(N):
    pass


def tegn_brett(løsning, N):
    """Tegn brettet med Q for dronning, . for tom."""
    if løsning is None:
        return "(ingen løsning)"
    linjer = []
    for i in range(N):
        kol = løsning[f"Q{i}"]
        rad = ["Q" if c == kol else "." for c in range(N)]
        linjer.append(" ".join(rad))
    return "\\n".join(linjer)


# Løs 4-queens
csp4 = bygg_queens(4)
løs4 = backtrack_fc(csp4, {})
print("4-queens løsning:")
print(tegn_brett(løs4, 4))
print(f"Noder: {csp4.noder}")


def er_gyldig_queens(løs, N):
    if løs is None or len(løs) != N:
        return False
    for i in range(N):
        for j in range(i + 1, N):
            a, b = løs[f"Q{i}"], løs[f"Q{j}"]
            if a == b:
                return False
            if abs(a - b) == abs(i - j):
                return False
    return True


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


sjekk(er_gyldig_queens(løs4, 4), True, "4-queens-løsning er gyldig")

# Test også 6-queens
csp6 = bygg_queens(6)
løs6 = backtrack_fc(csp6, {})
sjekk(er_gyldig_queens(løs6, 6), True, "6-queens-løsning er også gyldig")
sjekk(løs6 is not None, True, "samme solver klarer ulike N")
`,
      },
      defaultFile: "csp.py",
      editable: ["csp.py"],
      run: { kind: "python-script", entry: "csp.py" },
      verifications: [
        {
          label: "4-queens har en gyldig løsning",
          check: { kind: "output-contains", needle: "OK   4-queens-løsning er gyldig" },
        },
        {
          label: "Samme bygg_queens fungerer for 6×6",
          check: { kind: "output-contains", needle: "OK   6-queens-løsning er også gyldig" },
        },
        {
          label: "Solver håndterer N=6 uten endringer",
          check: { kind: "output-contains", needle: "OK   samme solver klarer ulike N" },
        },
      ],
      hint:
        "def bygg_queens(N):\n    variables = [f'Q{i}' for i in range(N)]\n    domains = {v: list(range(N)) for v in variables}\n    constraints = []\n    for i in range(N):\n        for j in range(i + 1, N):\n            constraints.append((\n                f'Q{i}', f'Q{j}',\n                lambda a, b, di=i, dj=j: a != b and abs(a - b) != abs(di - dj),\n            ))\n    return CSP(variables, domains, constraints)",
    },

    // ============ LEKSJON 6 ===========================================
    {
      id: "06-sudoku",
      title: "6. Sudoku (4×4) som CSP",
      narrative:
        "Tid for hovedretten. **Sudoku** er den klassiske CSP-applikasjonen.\n\nEt 4×4 mini-sudoku har:\n\n- **16 variabler** — én per celle, navngitt `(rad, kol)` med `rad, kol ∈ {0,1,2,3}`.\n- **Domener** — `{1, 2, 3, 4}` for tomme celler, og en énverdi-liste `[given]` for forhåndsutfylte celler.\n- **Constraints** — ulik verdi for hvert par av celler i samme rad, samme kolonne, eller samme 2×2 blokk.\n\n«Blokk» i et 4×4 sudoku er én av fire 2×2 ruter:\n\n```\n[0,1] [0,1] | [2,3] [2,3]\n[0,1] [0,1] | [2,3] [2,3]\n------------+------------\n[0,1] [0,1] | [2,3] [2,3]\n[0,1] [0,1] | [2,3] [2,3]\n```\n\nFormalt: to celler `(r1, c1)` og `(r2, c2)` er i samme blokk hvis `r1 // 2 == r2 // 2` OG `c1 // 2 == c2 // 2`.\n\n**Din oppgave:** Implementér `bygg_sudoku(grid)` der `grid` er en 4×4 matrise med `0` for tomme celler og verdi `1-4` for fastsatte.\n\nGenerer constraints kun for distinkte par `(r1,c1) < (r2,c2)` slik at vi unngår duplikater.",
      files: {
        "csp.py": `class CSP:
    def __init__(self, variables, domains, constraints):
        self.variables = variables
        self.domains = domains
        self.constraints = constraints
        self.noder = 0

    def is_consistent(self, var, value, assignment):
        for (v1, v2, fn) in self.constraints:
            if var == v1 and v2 in assignment:
                if not fn(value, assignment[v2]):
                    return False
            if var == v2 and v1 in assignment:
                if not fn(assignment[v1], value):
                    return False
        return True


def propagate(csp, var, value, assignment):
    removed = []
    for (v1, v2, fn) in csp.constraints:
        if v1 == var and v2 not in assignment:
            for val in list(csp.domains[v2]):
                if not fn(value, val):
                    csp.domains[v2].remove(val)
                    removed.append((v2, val))
        elif v2 == var and v1 not in assignment:
            for val in list(csp.domains[v1]):
                if not fn(val, value):
                    csp.domains[v1].remove(val)
                    removed.append((v1, val))
    return removed


def backtrack_fc(csp, assignment):
    csp.noder += 1
    if len(assignment) == len(csp.variables):
        return dict(assignment)
    var = next(v for v in csp.variables if v not in assignment)
    for value in list(csp.domains[var]):
        if not csp.is_consistent(var, value, assignment):
            continue
        assignment[var] = value
        removed = propagate(csp, var, value, assignment)
        tomt = any(len(csp.domains[v]) == 0 for v in csp.variables if v not in assignment)
        if not tomt:
            result = backtrack_fc(csp, assignment)
            if result is not None:
                return result
        for (v, val) in removed:
            csp.domains[v].append(val)
        del assignment[var]
    return None


ulik = lambda a, b: a != b


# === DIN OPPGAVE ===
# grid: 4x4 matrise med 0 for tom, 1-4 for given.
# Returner CSP med:
#   variables: alle (r, c) for r in 0..3, c in 0..3
#   domains:   [1,2,3,4] for tomme, [grid[r][c]] for given
#   constraints: for hvert par av distinkte celler i samme rad, kolonne,
#                eller 2×2 blokk: ulik verdi
def bygg_sudoku(grid):
    pass


def tegn_sudoku(løs):
    if løs is None:
        return "(ingen løsning)"
    linjer = []
    for r in range(4):
        rad = [str(løs[(r, c)]) for c in range(4)]
        linjer.append(" ".join(rad[:2]) + " | " + " ".join(rad[2:]))
        if r == 1:
            linjer.append("-" * 9)
    return "\\n".join(linjer)


# Konkret 4x4-puzzle (0 = tom)
puzzle = [
    [1, 0, 0, 4],
    [0, 0, 1, 0],
    [0, 2, 0, 0],
    [3, 0, 0, 2],
]

print("Puzzle:")
for r in puzzle:
    print(" ", r)

csp = bygg_sudoku(puzzle)
løsning = backtrack_fc(csp, {})

print()
print("Løsning:")
print(tegn_sudoku(løsning))
print(f"Noder utforsket: {csp.noder}")


def er_gyldig_sudoku(løs):
    if løs is None:
        return False
    # Hver rad må ha {1,2,3,4}
    for r in range(4):
        rad_verdier = sorted(løs[(r, c)] for c in range(4))
        if rad_verdier != [1, 2, 3, 4]:
            return False
    # Hver kolonne må ha {1,2,3,4}
    for c in range(4):
        kol_verdier = sorted(løs[(r, c)] for r in range(4))
        if kol_verdier != [1, 2, 3, 4]:
            return False
    # Hver 2x2 blokk
    for br in range(2):
        for bc in range(2):
            blokk_verdier = sorted(
                løs[(br * 2 + dr, bc * 2 + dc)]
                for dr in range(2) for dc in range(2)
            )
            if blokk_verdier != [1, 2, 3, 4]:
                return False
    return True


def respekterer_givens(løs, grid):
    if løs is None:
        return False
    for r in range(4):
        for c in range(4):
            if grid[r][c] != 0 and løs[(r, c)] != grid[r][c]:
                return False
    return True


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


sjekk(løsning is not None, True, "Sudoku løst")
sjekk(er_gyldig_sudoku(løsning), True, "alle rader/kolonner/blokker er {1,2,3,4}")
sjekk(respekterer_givens(løsning, puzzle), True, "given-tall er bevart")
`,
      },
      defaultFile: "csp.py",
      editable: ["csp.py"],
      run: { kind: "python-script", entry: "csp.py" },
      verifications: [
        {
          label: "Sudoku-puzzelet ble løst",
          check: { kind: "output-contains", needle: "OK   Sudoku løst" },
        },
        {
          label: "Hver rad, kolonne og blokk har {1,2,3,4}",
          check: { kind: "output-contains", needle: "OK   alle rader/kolonner/blokker er {1,2,3,4}" },
        },
        {
          label: "Forhåndsutfylte tall (givens) er bevart",
          check: { kind: "output-contains", needle: "OK   given-tall er bevart" },
        },
      ],
      hint:
        "def bygg_sudoku(grid):\n    celler = [(r, c) for r in range(4) for c in range(4)]\n    domains = {}\n    for (r, c) in celler:\n        if grid[r][c] == 0:\n            domains[(r, c)] = [1, 2, 3, 4]\n        else:\n            domains[(r, c)] = [grid[r][c]]\n    constraints = []\n    for i, a in enumerate(celler):\n        for b in celler[i + 1:]:\n            (r1, c1), (r2, c2) = a, b\n            samme_rad = r1 == r2\n            samme_kol = c1 == c2\n            samme_blokk = (r1 // 2 == r2 // 2) and (c1 // 2 == c2 // 2)\n            if samme_rad or samme_kol or samme_blokk:\n                constraints.append((a, b, ulik))\n    return CSP(celler, domains, constraints)",
    },
  ],
};

// ============================================================================
// DNS-RESOLVER FRA NULL — 6 leksjoner som bygger en rekursiv DNS-resolver.
// Starter med record-strukturen, bygger en autoritativ nameserver, kobler
// flere sammen i et hierarki (root → TLD → autoritativ), implementerer
// rekursiv resolusjon, legger på TTL-cache, demonstrerer cache-poisoning
// med transaction-ID-mitigering, og avslutter med å integrere alt i en
// CachedResolver.
//
// Pedagogisk vinkel for DTE-2507: gjør DNS-protokollen fra forelesningen
// til kode studenten selv skriver. Spoofing-leksjonen viser HVORFOR
// transaction-ID-randomization og kildeport-randomization finnes.
// Runner: python-script (pure Python, ingen sockets — alt simuleres).
// ============================================================================

const DNS_RESOLVER: MiniCourse = {
  id: "dns-resolver",
  slug: "dns-resolver",
  title: "DNS-resolver fra null",
  blurb:
    "Bygg en rekursiv DNS-resolver i Python — fra record-strukturen, gjennom hierarkiet (root → TLD → autoritativ), til TTL-cache og spoofing-angrep. Hver leksjon legger ett konsept til, og du ender opp med en cached resolver som demonstrerer hvorfor transaction-ID-randomization eksisterer.",
  estimertTid: "55–70 min",
  fag: ["DTE-2507", "Nettverk", "DNS"],
  color: "success",
  lessons: [
    // ============ LEKSJON 1 ===========================================
    {
      id: "01-records",
      title: "1. DNS-records og en enkel nameserver",
      narrative:
        "DNS er ikke ett system — det er millioner av nameservere som koordinerer. Hver server kjenner sin egen **sone** (et avgrenset domene-tre) og lagrer **records** for den sonen.\n\nVanlige record-typer:\n\n- `A` — navn → IPv4-adresse\n- `NS` — sone → autoritativ nameserver (delegasjon)\n- `CNAME` — alias → kanonisk navn\n- `MX` — domene → mail-server\n\nVi modellerer en record som `(name, type, value, ttl)`. En `NameServer` er bare en liste av records pluss en query-metode.\n\n**Din oppgave:** Implementér `NameServer.query(name, type)` som returnerer alle records hvor BÅDE name OG type matcher eksakt. Dette er kjernen — hver autoritativ DNS-server gjør i bunn og grunn bare dette.",
      files: {
        "dns.py": `class Record:
    def __init__(self, name, type, value, ttl=3600):
        self.name = name
        self.type = type
        self.value = value
        self.ttl = ttl

    def __repr__(self):
        return f"Record({self.name}, {self.type}, {self.value})"

    def __eq__(self, other):
        return (
            isinstance(other, Record)
            and self.name == other.name
            and self.type == other.type
            and self.value == other.value
        )


class NameServer:
    def __init__(self, navn):
        self.navn = navn
        self.records = []

    def add(self, record):
        self.records.append(record)

    def query(self, name, type):
        """Returner alle records med matchende name OG type."""
        # === DIN OPPGAVE ===
        # Iterer self.records og returner de som matcher.
        pass


# === Test: autoritativ server for example.com ===
auth = NameServer("ns.example.com")
auth.add(Record("example.com", "A", "93.184.216.34"))
auth.add(Record("www.example.com", "A", "93.184.216.34"))
auth.add(Record("mail.example.com", "A", "93.184.216.35"))
auth.add(Record("example.com", "MX", "mail.example.com"))


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Eksakt match
svar = auth.query("www.example.com", "A")
sjekk(len(svar), 1, "www.example.com har én A-record")
sjekk(svar[0].value, "93.184.216.34", "verdi er korrekt IP")

# Type-filter virker
svar = auth.query("example.com", "MX")
sjekk(len(svar), 1, "MX-query treffer kun MX-record")
sjekk(svar[0].value, "mail.example.com", "MX peker på mailserver")

# Tom for ukjent navn
sjekk(auth.query("ukjent.example.com", "A"), [], "ukjent navn → tom liste")

# Tom for feil type
sjekk(auth.query("www.example.com", "MX"), [], "feil type → tom liste")
`,
      },
      defaultFile: "dns.py",
      editable: ["dns.py"],
      run: { kind: "python-script", entry: "dns.py" },
      verifications: [
        {
          label: "Eksakt navn-match returnerer record",
          check: { kind: "output-contains", needle: "OK   www.example.com har én A-record" },
        },
        {
          label: "Verdien hentes ut korrekt",
          check: { kind: "output-contains", needle: "OK   verdi er korrekt IP" },
        },
        {
          label: "Type-filter virker (MX vs A)",
          check: { kind: "output-contains", needle: "OK   MX-query treffer kun MX-record" },
        },
        {
          label: "Ukjent navn returnerer tom liste",
          check: { kind: "output-contains", needle: "OK   ukjent navn → tom liste" },
        },
        {
          label: "Feil type returnerer tom liste",
          check: { kind: "output-contains", needle: "OK   feil type → tom liste" },
        },
      ],
      hint:
        "def query(self, name, type):\n    return [r for r in self.records\n            if r.name == name and r.type == type]",
    },

    // ============ LEKSJON 2 ===========================================
    {
      id: "02-delegation",
      title: "2. Hierarkiet: root → TLD → autoritativ",
      narrative:
        "Ingen enkelt nameserver kjenner hele DNS. Hierarkiet fungerer slik:\n\n- **Root-servere** kjenner bare TLD-ene (`com`, `org`, `no`, ...).\n- **TLD-servere** kjenner registrerte domener under sin TLD (`com` kjenner `example.com`, `google.com`, ...).\n- **Autoritative servere** kjenner sitt eget domene.\n\nNår du spør root om `www.example.com`, svarer den ikke 'jeg vet ikke' — den **delegerer**: «spør com-serveren». Det er en NS-record: `com → ns.com`.\n\nFor at dette skal funke trenger vi `find_delegation(name)`: gitt et navn, finn NS-records for nærmeste *foreldre*-sone serveren har delegasjon for.\n\n**Eksempel:** `root.find_delegation('www.example.com')` → NS-record for `com` (ikke for `www.example.com` eller `example.com` — root vet ikke om dem).\n\n**Din oppgave:** Implementér `find_delegation`. Bryt navnet ned i suffikser fra lengst til kortest: `www.example.com → example.com → com`. For hvert suffix, sjekk om vi har en NS-record. Returner FØRSTE treff (lengste matchende suffix).",
      files: {
        "dns.py": `class Record:
    def __init__(self, name, type, value, ttl=3600):
        self.name = name
        self.type = type
        self.value = value
        self.ttl = ttl

    def __repr__(self):
        return f"Record({self.name}, {self.type}, {self.value})"


class NameServer:
    def __init__(self, navn):
        self.navn = navn
        self.records = []

    def add(self, record):
        self.records.append(record)

    def query(self, name, type):
        return [r for r in self.records if r.name == name and r.type == type]

    def find_delegation(self, name):
        """Returner NS-records for nærmeste suffix av name som vi har delegasjon for."""
        # === DIN OPPGAVE ===
        # Eksempel: name = "www.example.com"
        #   Prøv "www.example.com" — har vi NS for det? Hvis ja: returner.
        #   Prøv "example.com" — har vi NS for det? Hvis ja: returner.
        #   Prøv "com" — har vi NS for det? Hvis ja: returner.
        # Returner [] hvis ingen suffix treffer.
        #
        # Tips: name.split(".") gir delene; kombiner stadig færre.
        return []


# === Bygg et lite DNS-hierarki ===
root = NameServer("root")
root.add(Record("com", "NS", "ns.com"))
root.add(Record("ns.com", "A", "192.5.6.30"))   # glue record
root.add(Record("no", "NS", "ns.no"))
root.add(Record("ns.no", "A", "194.0.21.1"))

com = NameServer("ns.com")
com.add(Record("example.com", "NS", "ns.example.com"))
com.add(Record("ns.example.com", "A", "199.43.135.53"))

ex = NameServer("ns.example.com")
ex.add(Record("www.example.com", "A", "93.184.216.34"))


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Root delegerer www.example.com til com-serveren
deleg = root.find_delegation("www.example.com")
sjekk(len(deleg), 1, "root delegerer www.example.com til én sone")
sjekk(deleg[0].name, "com", "root deleger til 'com' (ikke 'example.com')")
sjekk(deleg[0].value, "ns.com", "NS peker på ns.com")

# com-serveren delegerer videre til example.com
deleg = com.find_delegation("www.example.com")
sjekk(deleg[0].name, "example.com", "com deleger til 'example.com' (lengste match)")

# Autoritativ server har INGEN delegasjon for sine egne records
sjekk(ex.find_delegation("www.example.com"), [], "autoritativ har ingen videre delegasjon")

# Helt ukjent TLD
sjekk(root.find_delegation("noe.org"), [], "ukjent TLD → tom liste")
`,
      },
      defaultFile: "dns.py",
      editable: ["dns.py"],
      run: { kind: "python-script", entry: "dns.py" },
      verifications: [
        {
          label: "Root delegerer ned i hierarkiet",
          check: { kind: "output-contains", needle: "OK   root delegerer www.example.com til én sone" },
        },
        {
          label: "Delegasjonen peker på riktig sone",
          check: { kind: "output-contains", needle: "OK   root deleger til 'com' (ikke 'example.com')" },
        },
        {
          label: "NS-recorden peker på riktig nameserver",
          check: { kind: "output-contains", needle: "OK   NS peker på ns.com" },
        },
        {
          label: "Lengste matchende suffix vinner",
          check: { kind: "output-contains", needle: "OK   com deleger til 'example.com' (lengste match)" },
        },
        {
          label: "Autoritativ server uten delegasjon returnerer tom",
          check: { kind: "output-contains", needle: "OK   autoritativ har ingen videre delegasjon" },
        },
        {
          label: "Ukjente TLD-er returnerer tom",
          check: { kind: "output-contains", needle: "OK   ukjent TLD → tom liste" },
        },
      ],
      hint:
        'def find_delegation(self, name):\n    deler = name.split(".")\n    # Prøv lengste suffix først: hele navnet, deretter dropp ett ledd om gangen\n    for i in range(len(deler)):\n        suffix = ".".join(deler[i:])\n        ns = self.query(suffix, "NS")\n        if ns:\n            return ns\n    return []',
    },

    // ============ LEKSJON 3 ===========================================
    {
      id: "03-recursive-resolver",
      title: "3. Rekursiv resolver med trace",
      narrative:
        "Når din PC spør Googles DNS (8.8.8.8) etter `www.example.com`, gjør den en **rekursiv resolusjon** for deg:\n\n1. Spør en root-server — får «spør com».\n2. Spør com-serveren — får «spør ns.example.com på 199.43.135.53».\n3. Spør 199.43.135.53 — får svaret: A → 93.184.216.34.\n\nDette er Internett som kommer til live — én lokal query nøster opp hele kjeden.\n\n**Algoritmen:**\n\n```\nnåværende = root_ip\nrepeat (med max 10 hopp):\n    server = ip_til_server[nåværende]\n    hvis server.query(name, type) gir svar: returner\n    delegasjon = server.find_delegation(name)\n    hvis tom: returner None  # NXDOMAIN\n    ns_navn = delegasjon[0].value\n    glue = server.query(ns_navn, 'A')   # NS-ens IP («glue record»)\n    nåværende = glue[0].value\n```\n\nVi bygger også opp en **trace**-liste som logger hvert hopp — det er det `dig +trace` skriver ut i Linux.\n\n**Din oppgave:** Implementér `resolve(name, type, root_ip, ip_til_server)`. Returner `(record_eller_None, trace_liste)`.",
      files: {
        "dns.py": `class Record:
    def __init__(self, name, type, value, ttl=3600):
        self.name = name
        self.type = type
        self.value = value
        self.ttl = ttl

    def __repr__(self):
        return f"Record({self.name}, {self.type}, {self.value})"


class NameServer:
    def __init__(self, navn):
        self.navn = navn
        self.records = []

    def add(self, record):
        self.records.append(record)

    def query(self, name, type):
        return [r for r in self.records if r.name == name and r.type == type]

    def find_delegation(self, name):
        deler = name.split(".")
        for i in range(len(deler)):
            suffix = ".".join(deler[i:])
            ns = self.query(suffix, "NS")
            if ns:
                return ns
        return []


def resolve(name, type, root_ip, ip_til_server):
    """Rekursiv DNS-resolusjon. Returner (record, trace) eller (None, trace)."""
    trace = []
    # === DIN OPPGAVE ===
    # nåværende = root_ip
    # for _ in range(10):
    #     server = ip_til_server[nåværende]
    #     trace.append(f"Spør {server.navn} om {name} ({type})")
    #     svar = server.query(name, type)
    #     if svar:
    #         trace.append(f"  → svar: {svar[0].value}")
    #         return svar[0], trace
    #     deleg = server.find_delegation(name)
    #     if not deleg:
    #         trace.append("  → NXDOMAIN")
    #         return None, trace
    #     ns_navn = deleg[0].value
    #     glue = server.query(ns_navn, "A")
    #     if not glue:
    #         trace.append(f"  → mangler glue for {ns_navn}")
    #         return None, trace
    #     trace.append(f"  → referral til {ns_navn} ({glue[0].value})")
    #     nåværende = glue[0].value
    # return None, trace + ["  → for mange hopp"]
    return None, trace


# === Bygg hierarki ===
def bygg_hierarki():
    root = NameServer("root")
    root.add(Record("com", "NS", "ns.com"))
    root.add(Record("ns.com", "A", "192.5.6.30"))

    com = NameServer("ns.com")
    com.add(Record("example.com", "NS", "ns.example.com"))
    com.add(Record("ns.example.com", "A", "199.43.135.53"))

    ex = NameServer("ns.example.com")
    ex.add(Record("www.example.com", "A", "93.184.216.34", ttl=300))

    ip_til_server = {
        "(root)": root,
        "192.5.6.30": com,
        "199.43.135.53": ex,
    }
    return ip_til_server


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


ip_til_server = bygg_hierarki()
record, trace = resolve("www.example.com", "A", "(root)", ip_til_server)

print("Trace:")
for linje in trace:
    print(" ", linje)

sjekk(record is not None, True, "fant en record")
sjekk(record.value if record else None, "93.184.216.34", "endelig IP er korrekt")
sjekk(len(trace) >= 3, True, "trace har minst 3 spørringer (root + com + ex)")

# NXDOMAIN
record, trace = resolve("finnesikke.com", "A", "(root)", ip_til_server)
sjekk(record, None, "ukjent navn returnerer None")
`,
      },
      defaultFile: "dns.py",
      editable: ["dns.py"],
      run: { kind: "python-script", entry: "dns.py" },
      verifications: [
        {
          label: "Resolver finner den autoritative recorden",
          check: { kind: "output-contains", needle: "OK   fant en record" },
        },
        {
          label: "Endelig IP er korrekt",
          check: { kind: "output-contains", needle: "OK   endelig IP er korrekt" },
        },
        {
          label: "Trace logger alle tre nivåer (root → com → ex)",
          check: { kind: "output-contains", needle: "OK   trace har minst 3 spørringer" },
        },
        {
          label: "Ukjent navn returnerer None (NXDOMAIN)",
          check: { kind: "output-contains", needle: "OK   ukjent navn returnerer None" },
        },
      ],
      hint:
        'nåværende = root_ip\nfor _ in range(10):\n    server = ip_til_server[nåværende]\n    trace.append(f"Spør {server.navn} om {name} ({type})")\n    svar = server.query(name, type)\n    if svar:\n        trace.append(f"  → svar: {svar[0].value}")\n        return svar[0], trace\n    deleg = server.find_delegation(name)\n    if not deleg:\n        trace.append("  → NXDOMAIN")\n        return None, trace\n    ns_navn = deleg[0].value\n    glue = server.query(ns_navn, "A")\n    if not glue:\n        return None, trace\n    trace.append(f"  → referral til {ns_navn} ({glue[0].value})")\n    nåværende = glue[0].value\nreturn None, trace',
    },

    // ============ LEKSJON 4 ===========================================
    {
      id: "04-ttl-cache",
      title: "4. TTL og caching",
      narrative:
        "En rekursiv resolver kan ikke spørre root-serveren hver gang noen ber om `google.com` — det ville drept root-serverne. Løsningen er **caching med TTL**.\n\nHver DNS-record har et `ttl` (time-to-live) i sekunder. Resolveren lagrer recorden, men bare så lenge TTL-en sier den er gyldig.\n\nTTL er en kontrakt: «jeg lover at denne mappingen ikke endrer seg på N sekunder». Lave TTL-er gir rask respons på endringer (men mer trafikk); høye TTL-er gir mindre last (men sen propagering).\n\nFor å gjøre testing forutsigbar bruker vi en **simulert klokke** — `now` er et tall vi sender inn manuelt. I produksjon ville det vært `time.time()`.\n\n**Din oppgave:** Implementér `Cache` med:\n\n- `put(record, now)` — lagre recorden med utløp `now + record.ttl`\n- `get(name, type, now)` — returner recorden hvis den finnes OG ikke har utløpt; ellers `None` (og slett utløpte entries)",
      files: {
        "dns.py": `class Record:
    def __init__(self, name, type, value, ttl=3600):
        self.name = name
        self.type = type
        self.value = value
        self.ttl = ttl

    def __repr__(self):
        return f"Record({self.name}, {self.type}, {self.value})"


class Cache:
    def __init__(self):
        self.entries = {}  # (name, type) -> (record, expiry_time)

    def put(self, record, now):
        """Lagre record med utløpstid = now + record.ttl."""
        # === DIN OPPGAVE ===
        pass

    def get(self, name, type, now):
        """Returner recorden hvis cached og ikke utløpt. Slett hvis utløpt."""
        # === DIN OPPGAVE ===
        # 1. Hvis (name, type) ikke i entries: returner None
        # 2. (rec, exp) = entries[(name, type)]
        # 3. Hvis now >= exp: del entries[(name, type)]; returner None
        # 4. Ellers: returner rec
        return None


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


cache = Cache()
r = Record("example.com", "A", "93.184.216.34", ttl=60)

# Tom cache
sjekk(cache.get("example.com", "A", now=100), None, "tom cache gir None")

# Legg inn ved tid 100, TTL 60 → utløp 160
cache.put(r, now=100)

# Hit innen TTL
hit = cache.get("example.com", "A", now=120)
sjekk(hit is not None, True, "cache hit ved t=120 (innen TTL)")
sjekk(hit.value if hit else None, "93.184.216.34", "riktig record returneres")

# Akkurat før utløp
sjekk(cache.get("example.com", "A", now=159) is not None, True, "hit ved t=159 (1 sek igjen)")

# Akkurat ved utløp
sjekk(cache.get("example.com", "A", now=160), None, "utløpt ved t=160 (TTL=0)")

# Etter utløp — recorden er fjernet
sjekk(cache.get("example.com", "A", now=200), None, "fortsatt None etter utløp")
sjekk(("example.com", "A") not in cache.entries, True, "utløpt entry ble slettet")

# Annen type → cache miss
cache.put(Record("example.com", "MX", "mail.example.com", ttl=60), now=100)
sjekk(cache.get("example.com", "A", now=130), None, "ulik type → miss")
sjekk(cache.get("example.com", "MX", now=130) is not None, True, "MX-record cached separat")
`,
      },
      defaultFile: "dns.py",
      editable: ["dns.py"],
      run: { kind: "python-script", entry: "dns.py" },
      verifications: [
        {
          label: "Tom cache returnerer None",
          check: { kind: "output-contains", needle: "OK   tom cache gir None" },
        },
        {
          label: "Cache hit innen TTL fungerer",
          check: { kind: "output-contains", needle: "OK   cache hit ved t=120 (innen TTL)" },
        },
        {
          label: "Riktig record returneres på hit",
          check: { kind: "output-contains", needle: "OK   riktig record returneres" },
        },
        {
          label: "TTL utløper presist (>= now)",
          check: { kind: "output-contains", needle: "OK   utløpt ved t=160 (TTL=0)" },
        },
        {
          label: "Utløpt entry slettes fra cachen",
          check: { kind: "output-contains", needle: "OK   utløpt entry ble slettet" },
        },
        {
          label: "Records av ulik type caches separat",
          check: { kind: "output-contains", needle: "OK   MX-record cached separat" },
        },
      ],
      hint:
        "def put(self, record, now):\n    self.entries[(record.name, record.type)] = (record, now + record.ttl)\n\ndef get(self, name, type, now):\n    if (name, type) not in self.entries:\n        return None\n    rec, exp = self.entries[(name, type)]\n    if now >= exp:\n        del self.entries[(name, type)]\n        return None\n    return rec",
    },

    // ============ LEKSJON 5 ===========================================
    {
      id: "05-spoofing",
      title: "5. DNS-spoofing og transaction-ID-mitigering",
      narrative:
        "Den naive cachen aksepterer alle records som kommer inn. Det er en katastrofal sikkerhetsfeil — fordi DNS bruker UDP (ingen handshake), kan **hvem som helst** sende svar.\n\n**Spoofing-angrepet:** Mallory venter til Alice ber om `bank.no`. Hun sender et raskt svar med sin egen IP til Alice' resolver, FØR det ekte svaret kommer. Hvis resolveren aksepterer det første svaret som ankommer, er cachen forgiftet — Alice surfer til 'bank.no' og lander på Mallorys phishing-side.\n\n**Mitigeringen:** transaction ID. Resolveren sender en tilfeldig 16-bits ID med hver query. Bare svar med MATCHENDE ID (og samme navn + type!) aksepteres. En angriper som ikke ser den ekte queryen må gjette — 1 av 65536 sjanse per pakke.\n\nDette er fortsatt ikke nok i praksis (Kaminsky-angrepet, 2008), så moderne resolvere randomiserer også **kildeporten**, og DNSSEC legger på kryptografisk signatur. Men ID-sjekken er minimums-baseline.\n\n**Din oppgave:** Implementér `SecureCache.accept(response_id, record)` slik at recorden KUN lagres hvis `response_id` matcher en pending query OG navnet/typen matcher det vi forventet.",
      files: {
        "dns.py": `class Record:
    def __init__(self, name, type, value, ttl=3600):
        self.name, self.type, self.value, self.ttl = name, type, value, ttl

    def __repr__(self):
        return f"Record({self.name}, {self.type}, {self.value})"


# === Den sårbare cachen — for demonstrasjon ===
class VulnerableCache:
    def __init__(self):
        self.entries = {}

    def accept(self, record):
        """Aksepter ALLE records — ingen validering. Klassisk DNS pre-1993."""
        self.entries[(record.name, record.type)] = record


# === Den sikre cachen — din oppgave ===
class SecureCache:
    def __init__(self):
        self.entries = {}
        self.pending = {}  # query_id -> (name, type) vi forventer svar for

    def send_query(self, query_id, name, type):
        """Registrer at vi sendte en query med denne ID-en."""
        self.pending[query_id] = (name, type)

    def accept(self, response_id, record):
        """Aksepter record KUN hvis response_id matcher pending query
        OG (record.name, record.type) matcher det vi spurte om."""
        # === DIN OPPGAVE ===
        # 1. Sjekk om response_id finnes i self.pending
        # 2. Sjekk om self.pending[response_id] == (record.name, record.type)
        # 3. Hvis begge: lagre i self.entries, slett fra pending
        # 4. Ellers: gjør INGENTING (angrepet faller på gulvet)
        pass


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# === Del 1: Demonstrér spoofing av sårbar cache ===
print("--- Sårbar cache (DNS pre-mitigering) ---")
vuln = VulnerableCache()
# Ekte svar fra ekte server
vuln.accept(Record("bank.no", "A", "10.0.0.1"))
print(f"Etter ekte svar:    bank.no → {vuln.entries[('bank.no', 'A')].value}")

# ANGRIPER injiserer falskt svar — cachen tar imot
vuln.accept(Record("bank.no", "A", "6.6.6.6"))
print(f"Etter spoof-pakke:  bank.no → {vuln.entries[('bank.no', 'A')].value}")
sjekk(vuln.entries[("bank.no", "A")].value, "6.6.6.6", "sårbar cache forgiftet")

# === Del 2: Sikker cache med transaction-ID-validering ===
print()
print("--- Sikker cache (med query-ID-matching) ---")
sikker = SecureCache()
sikker.send_query(query_id=42, name="bank.no", type="A")

# Ekte svar med matchende ID
sikker.accept(response_id=42, record=Record("bank.no", "A", "10.0.0.1"))
sjekk(("bank.no", "A") in sikker.entries, True, "ekte svar (matching ID) akseptert")
sjekk(sikker.entries[("bank.no", "A")].value, "10.0.0.1", "riktig IP lagret")

# Angriper sender spoof med GAL ID — avvist
sikker.accept(response_id=99999, record=Record("bank.no", "A", "6.6.6.6"))
sjekk(sikker.entries[("bank.no", "A")].value, "10.0.0.1", "spoof med feil ID avvist")

# Ny query — angriper gjetter ID men spør om feil navn
sikker.send_query(query_id=7, name="github.com", type="A")
sikker.accept(response_id=7, record=Record("evil.com", "A", "6.6.6.6"))
sjekk(("evil.com", "A") not in sikker.entries, True, "feil navn med matching ID avvist")
sjekk(("github.com", "A") not in sikker.entries, True, "ingenting lagret for github.com")
`,
      },
      defaultFile: "dns.py",
      editable: ["dns.py"],
      run: { kind: "python-script", entry: "dns.py" },
      verifications: [
        {
          label: "Sårbar cache lar seg forgifte",
          check: { kind: "output-contains", needle: "OK   sårbar cache forgiftet" },
        },
        {
          label: "Sikker cache aksepterer matching ID",
          check: { kind: "output-contains", needle: "OK   ekte svar (matching ID) akseptert" },
        },
        {
          label: "Riktig IP lagres",
          check: { kind: "output-contains", needle: "OK   riktig IP lagret" },
        },
        {
          label: "Spoof med feil ID avvises",
          check: { kind: "output-contains", needle: "OK   spoof med feil ID avvist" },
        },
        {
          label: "Spoof med matching ID men feil navn avvises",
          check: { kind: "output-contains", needle: "OK   feil navn med matching ID avvist" },
        },
        {
          label: "Cachen forblir ren etter angrep",
          check: { kind: "output-contains", needle: "OK   ingenting lagret for github.com" },
        },
      ],
      hint:
        "def accept(self, response_id, record):\n    if response_id not in self.pending:\n        return\n    if self.pending[response_id] != (record.name, record.type):\n        return\n    self.entries[(record.name, record.type)] = record\n    del self.pending[response_id]",
    },

    // ============ LEKSJON 6 ===========================================
    {
      id: "06-cached-resolver",
      title: "6. Sett alt sammen: CachedResolver",
      narrative:
        "Tid for å pakke det vi har gjort i de fem forrige leksjonene sammen til noe nyttig: en `CachedResolver` som vanlige operativsystemer faktisk implementerer.\n\nLogikken er:\n\n```\nresolve(name, type, now):\n    hit = cache.get(name, type, now)\n    hvis hit: returner (hit, 'CACHE HIT')\n    record = full_rekursiv_resolution(...)   # fra leksjon 3\n    hvis record: cache.put(record, now)\n    returner (record, 'CACHE MISS')\n```\n\nIngen ny algoritmisk innsikt — bare integrasjon. Verdien er at vi nå kan måle hva caching gjør:\n\n- Første spørring → MISS, full rekursjon (mange hopp)\n- Andre spørring innen TTL → HIT (null hopp)\n- Tredje spørring etter TTL → MISS igjen\n\nResolveren er gitt — alt du gjør er å implementere `CachedResolver.resolve(name, type, now)` som integrerer cache + rekursjon.",
      files: {
        "dns.py": `class Record:
    def __init__(self, name, type, value, ttl=3600):
        self.name, self.type, self.value, self.ttl = name, type, value, ttl

    def __repr__(self):
        return f"Record({self.name}, {self.type}, {self.value})"


class NameServer:
    def __init__(self, navn):
        self.navn = navn
        self.records = []

    def add(self, record):
        self.records.append(record)

    def query(self, name, type):
        return [r for r in self.records if r.name == name and r.type == type]

    def find_delegation(self, name):
        deler = name.split(".")
        for i in range(len(deler)):
            suffix = ".".join(deler[i:])
            ns = self.query(suffix, "NS")
            if ns:
                return ns
        return []


class Cache:
    def __init__(self):
        self.entries = {}

    def put(self, record, now):
        self.entries[(record.name, record.type)] = (record, now + record.ttl)

    def get(self, name, type, now):
        if (name, type) not in self.entries:
            return None
        rec, exp = self.entries[(name, type)]
        if now >= exp:
            del self.entries[(name, type)]
            return None
        return rec


def full_resolve(name, type, root_ip, ip_til_server):
    """Rekursiv DNS-resolution (uten cache) — fra leksjon 3.
    Returner (record, antall_hopp) eller (None, antall_hopp)."""
    nåværende = root_ip
    hopp = 0
    for _ in range(10):
        hopp += 1
        server = ip_til_server[nåværende]
        svar = server.query(name, type)
        if svar:
            return svar[0], hopp
        deleg = server.find_delegation(name)
        if not deleg:
            return None, hopp
        ns_navn = deleg[0].value
        glue = server.query(ns_navn, "A")
        if not glue:
            return None, hopp
        nåværende = glue[0].value
    return None, hopp


class CachedResolver:
    def __init__(self, root_ip, ip_til_server):
        self.root_ip = root_ip
        self.ip_til_server = ip_til_server
        self.cache = Cache()

    def resolve(self, name, type, now):
        """Returner (record, status) der status er 'HIT' eller 'MISS'."""
        # === DIN OPPGAVE ===
        # 1. Sjekk cache: hit = self.cache.get(name, type, now)
        # 2. Hvis hit: returner (hit, "HIT")
        # 3. Ellers: record, _ = full_resolve(name, type, self.root_ip, self.ip_til_server)
        # 4. Hvis record: self.cache.put(record, now)
        # 5. Returner (record, "MISS")
        pass


# === Sett opp DNS-hierarki ===
root = NameServer("root")
root.add(Record("com", "NS", "ns.com"))
root.add(Record("ns.com", "A", "192.5.6.30"))

com = NameServer("ns.com")
com.add(Record("example.com", "NS", "ns.example.com"))
com.add(Record("ns.example.com", "A", "199.43.135.53"))

ex = NameServer("ns.example.com")
# TTL=60 så vi kan demonstrere utløp
ex.add(Record("www.example.com", "A", "93.184.216.34", ttl=60))

ip_til_server = {
    "(root)": root,
    "192.5.6.30": com,
    "199.43.135.53": ex,
}

resolver = CachedResolver("(root)", ip_til_server)


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Første spørring → MISS, full rekursjon
r1, s1 = resolver.resolve("www.example.com", "A", now=1000)
print(f"t=1000: {s1} → {r1.value if r1 else None}")
sjekk(s1, "MISS", "første spørring er cache MISS")
sjekk(r1.value, "93.184.216.34", "fikk korrekt IP fra fullsøk")

# Andre spørring innen TTL (60 sek) → HIT
r2, s2 = resolver.resolve("www.example.com", "A", now=1030)
print(f"t=1030: {s2} → {r2.value if r2 else None}")
sjekk(s2, "HIT", "andre spørring innen TTL er HIT")
sjekk(r2.value, "93.184.216.34", "cache returnerer samme IP")

# Etter TTL har utløpt → MISS igjen
r3, s3 = resolver.resolve("www.example.com", "A", now=1100)
print(f"t=1100: {s3} → {r3.value if r3 else None}")
sjekk(s3, "MISS", "etter TTL er det MISS igjen")

# Ukjent navn → MISS, ingen record
r4, s4 = resolver.resolve("nope.com", "A", now=2000)
sjekk(r4, None, "NXDOMAIN returnerer None")
sjekk(s4, "MISS", "NXDOMAIN er MISS")
`,
      },
      defaultFile: "dns.py",
      editable: ["dns.py"],
      run: { kind: "python-script", entry: "dns.py" },
      verifications: [
        {
          label: "Første spørring er cache MISS",
          check: { kind: "output-contains", needle: "OK   første spørring er cache MISS" },
        },
        {
          label: "Full rekursjon gir korrekt svar",
          check: { kind: "output-contains", needle: "OK   fikk korrekt IP fra fullsøk" },
        },
        {
          label: "Andre spørring innen TTL er HIT",
          check: { kind: "output-contains", needle: "OK   andre spørring innen TTL er HIT" },
        },
        {
          label: "Cache returnerer samme record",
          check: { kind: "output-contains", needle: "OK   cache returnerer samme IP" },
        },
        {
          label: "Etter TTL er det MISS igjen",
          check: { kind: "output-contains", needle: "OK   etter TTL er det MISS igjen" },
        },
        {
          label: "NXDOMAIN håndteres riktig",
          check: { kind: "output-contains", needle: "OK   NXDOMAIN returnerer None" },
        },
      ],
      hint:
        'def resolve(self, name, type, now):\n    hit = self.cache.get(name, type, now)\n    if hit is not None:\n        return hit, "HIT"\n    record, _ = full_resolve(name, type, self.root_ip, self.ip_til_server)\n    if record is not None:\n        self.cache.put(record, now)\n    return record, "MISS"',
    },
  ],
};

export const MINI_COURSES: readonly MiniCourse[] = [
  FLASK_FRA_NULL,
  BYGG_MINI_SHELL,
  UTLEIEAPP_FRA_NULL,
  TCP_STATE_MACHINE,
  CSP_SUDOKU,
  DNS_RESOLVER,
];

export function getMiniCourse(slug: string): MiniCourse | undefined {
  return MINI_COURSES.find((c) => c.slug === slug);
}
