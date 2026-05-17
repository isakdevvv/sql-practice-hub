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
  rekkefolge: 10,
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
  rekkefolge: 10,
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
  forutsetninger: ["flask-fra-null"],
  rekkefolge: 20,
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
  rekkefolge: 10,
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
  rekkefolge: 10,
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
  forutsetninger: ["tcp-state-machine"],
  rekkefolge: 20,
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

// ============================================================================
// PROSESS-SCHEDULER FRA NULL — 6 leksjoner som bygger en OS-prosess-scheduler.
// Studenten implementerer hver schedulering-algoritme i et felles simulator-
// rammeverk: FCFS → Round Robin → prioritet (med starvation) → aging-fix →
// sammenlikning. Insight: hver algoritme er en avveining; ingen er «best».
//
// Runner: python-script (pure Python). Ingen multithreading — vi simulerer
// CPU-ticks med en enkel loop.
// ============================================================================

const PROSESS_SCHEDULER: MiniCourse = {
  id: "prosess-scheduler",
  slug: "prosess-scheduler",
  title: "Prosess-scheduler fra null",
  blurb:
    "Bygg en CPU-scheduler i Python. Start med FCFS, legg på Round Robin med kvantum, deretter prioritet (og se hvordan lav-prioritet sulter), så aging-fixen — og avslutt med en head-to-head-sammenligning. Hver algoritme er en avveining mellom rettferdighet, gjennomstrømning og responstid.",
  estimertTid: "55–70 min",
  fag: ["DTE-2505", "Operativsystem", "Scheduling"],
  color: "warning",
  rekkefolge: 20,
  lessons: [
    // ============ LEKSJON 1 ===========================================
    {
      id: "01-process-queue",
      title: "1. Prosess-objektet og klar-køen",
      narrative:
        "En **scheduler** bestemmer hvilken prosess som får CPU-en hvert øyeblikk. For å snakke om det trenger vi et minimalt prosess-objekt:\n\n- `pid` — identifikator\n- `arrival` — når den ankom systemet (tick-tall)\n- `burst` — total CPU-tid den trenger\n- `remaining` — CPU-tid igjen (starter = burst, krymper når den får kjøre)\n- `priority` — lavere tall = høyere prioritet (Unix-konvensjon)\n- `waited` — total ventetid i klar-køen\n- `completed_at` — tick når den ble ferdig\n\n**Klar-køen** (ready queue) er listen av prosesser som venter på CPU. Vi modellerer den som en vanlig liste — `enqueue` legger til bak, `dequeue` tar fra front.\n\n**Din oppgave:**\n\n1. Fyll inn `Process.__init__` slik at felter er satt og `remaining = burst`.\n2. Implementér `enqueue(prosess)` (legg bak) og `dequeue()` (ta fra front, returner prosessen) på `ReadyQueue`.",
      files: {
        "scheduler.py": `class Process:
    def __init__(self, pid, arrival, burst, priority=5):
        # === DIN OPPGAVE: sett feltene ===
        # self.pid = pid
        # self.arrival = arrival
        # self.burst = burst
        # self.remaining = burst   # samme som burst i starten
        # self.priority = priority
        # self.waited = 0
        # self.completed_at = None
        pass

    def is_done(self):
        return self.remaining <= 0

    def __repr__(self):
        return f"P{self.pid}"


class ReadyQueue:
    def __init__(self):
        self.items = []

    def enqueue(self, p):
        # === DIN OPPGAVE ===
        pass

    def dequeue(self):
        # === DIN OPPGAVE: returner og fjern første element ===
        pass

    def is_empty(self):
        return len(self.items) == 0


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Prosess-felter satt riktig
p = Process(pid=1, arrival=0, burst=5, priority=3)
sjekk(p.pid, 1, "pid satt")
sjekk(p.remaining, 5, "remaining starter = burst")
sjekk(p.waited, 0, "waited starter på 0")
sjekk(p.completed_at, None, "completed_at er None")
sjekk(p.is_done(), False, "ny prosess er ikke done")

# FIFO-orden
q = ReadyQueue()
q.enqueue(Process(1, 0, 5))
q.enqueue(Process(2, 1, 3))
q.enqueue(Process(3, 2, 2))
sjekk(q.dequeue().pid, 1, "FIFO: P1 først ut")
sjekk(q.dequeue().pid, 2, "deretter P2")
sjekk(q.dequeue().pid, 3, "til slutt P3")
sjekk(q.is_empty(), True, "køen er tom etter 3 dequeues")
`,
      },
      defaultFile: "scheduler.py",
      editable: ["scheduler.py"],
      run: { kind: "python-script", entry: "scheduler.py" },
      verifications: [
        { label: "pid er satt", check: { kind: "output-contains", needle: "OK   pid satt" } },
        { label: "remaining starter = burst", check: { kind: "output-contains", needle: "OK   remaining starter = burst" } },
        { label: "waited starter på 0", check: { kind: "output-contains", needle: "OK   waited starter på 0" } },
        { label: "completed_at er None initialt", check: { kind: "output-contains", needle: "OK   completed_at er None" } },
        { label: "is_done() er False for ny prosess", check: { kind: "output-contains", needle: "OK   ny prosess er ikke done" } },
        { label: "FIFO-orden: P1 dequeues først", check: { kind: "output-contains", needle: "OK   FIFO: P1 først ut" } },
        { label: "Køen tømmes riktig", check: { kind: "output-contains", needle: "OK   køen er tom etter 3 dequeues" } },
      ],
      hint:
        "def __init__(self, pid, arrival, burst, priority=5):\n    self.pid = pid\n    self.arrival = arrival\n    self.burst = burst\n    self.remaining = burst\n    self.priority = priority\n    self.waited = 0\n    self.completed_at = None\n\n# ReadyQueue:\ndef enqueue(self, p):\n    self.items.append(p)\n\ndef dequeue(self):\n    return self.items.pop(0)",
    },

    // ============ LEKSJON 2 ===========================================
    {
      id: "02-fcfs",
      title: "2. FCFS (First-Come First-Served)",
      narrative:
        "Det enkleste vi kan tenke oss: kjør prosesser i den rekkefølgen de ankom, fullt ut, én av gangen. Ingen preempting. Det er FCFS.\n\nSimulator-loopen ser slik ut:\n\n```\nfor tick fra 0 og oppover:\n  flytt ankomne prosesser inn i klar-køen\n  hvis køen er tom: idle\n  ellers: pluck én prosess, kjør den ett tick (remaining -= 1)\n  hvis remaining == 0: ferdig\n```\n\n«Pluck én prosess» er stedet algoritmene skiller seg. I FCFS plukker vi alltid prosessen vi har valgt å kjøre (eller velger ny hvis ingen er valgt). Andre prosesser **venter** — vi øker deres `waited`-teller.\n\n**Din oppgave:** Implementér `run_fcfs(processes, max_ticks=100)` som returnerer en log av `(tick, pid)`-par.",
      files: {
        "scheduler.py": `class Process:
    def __init__(self, pid, arrival, burst, priority=5):
        self.pid = pid
        self.arrival = arrival
        self.burst = burst
        self.remaining = burst
        self.priority = priority
        self.waited = 0
        self.completed_at = None

    def is_done(self):
        return self.remaining <= 0

    def __repr__(self):
        return f"P{self.pid}"


def run_fcfs(processes, max_ticks=100):
    """Returner liste av (tick, pid_eller_None_for_idle)."""
    # Vi muterer prosessene direkte (remaining, waited, completed_at).
    not_arrived = sorted(processes, key=lambda p: p.arrival)
    klar = []
    log = []
    nåværende = None  # prosessen som kjører nå (None = ingen)

    # === DIN OPPGAVE ===
    # for tick in range(max_ticks):
    #     # 1. Flytt ankomster: mens not_arrived og første har arrival <= tick:
    #     #      pop front, append til klar
    #     # 2. Hvis nåværende er None og klar er ikke-tom: nåværende = klar.pop(0)
    #     # 3. Hvis nåværende er None og klar tom: log.append((tick, None)); continue
    #     # 4. Kjør ett tick:
    #     #      nåværende.remaining -= 1
    #     #      log.append((tick, nåværende.pid))
    #     #      for p in klar: p.waited += 1
    #     # 5. Hvis nåværende.is_done(): completed_at = tick + 1; nåværende = None
    #     # 6. Tidlig avbryt hvis alt er ferdig (klar tom, not_arrived tom, nåværende None)
    return log


def gjennomsnitt_venting(processes):
    if not processes:
        return 0
    return sum(p.waited for p in processes) / len(processes)


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# 3 prosesser ankommer samtidig
ps = [Process(1, 0, 5), Process(2, 0, 3), Process(3, 0, 2)]
log = run_fcfs(ps)

# Forventet: P1 kjører tick 0-4, P2 5-7, P3 8-9
sjekk(log[0], (0, 1), "tick 0 kjører P1")
sjekk(log[4], (4, 1), "tick 4 fortsatt P1 (siste tick)")
sjekk(log[5], (5, 2), "tick 5 starter P2")
sjekk(log[8], (8, 3), "tick 8 starter P3")
sjekk(log[9], (9, 3), "tick 9 fullfører P3")

# Ventetider
# P1 venter 0, P2 venter 5, P3 venter 8 → snitt = 13/3 = 4.33
sjekk(ps[0].waited, 0, "P1 ventet 0")
sjekk(ps[1].waited, 5, "P2 ventet 5")
sjekk(ps[2].waited, 8, "P3 ventet 8")
print(f"Snitt-venting FCFS: {gjennomsnitt_venting(ps):.2f}")
`,
      },
      defaultFile: "scheduler.py",
      editable: ["scheduler.py"],
      run: { kind: "python-script", entry: "scheduler.py" },
      verifications: [
        { label: "FCFS starter med P1", check: { kind: "output-contains", needle: "OK   tick 0 kjører P1" } },
        { label: "P1 fullfører før P2 starter", check: { kind: "output-contains", needle: "OK   tick 5 starter P2" } },
        { label: "P3 kjører til slutt", check: { kind: "output-contains", needle: "OK   tick 9 fullfører P3" } },
        { label: "P1 venter 0 ticks (kjører først)", check: { kind: "output-contains", needle: "OK   P1 ventet 0" } },
        { label: "P2 venter mens P1 kjører", check: { kind: "output-contains", needle: "OK   P2 ventet 5" } },
        { label: "P3 venter mens P1 og P2 kjører", check: { kind: "output-contains", needle: "OK   P3 ventet 8" } },
      ],
      hint:
        "for tick in range(max_ticks):\n    while not_arrived and not_arrived[0].arrival <= tick:\n        klar.append(not_arrived.pop(0))\n    if nåværende is None and klar:\n        nåværende = klar.pop(0)\n    if nåværende is None:\n        if not not_arrived: break\n        log.append((tick, None)); continue\n    nåværende.remaining -= 1\n    log.append((tick, nåværende.pid))\n    for p in klar: p.waited += 1\n    if nåværende.is_done():\n        nåværende.completed_at = tick + 1\n        nåværende = None\nreturn log",
    },

    // ============ LEKSJON 3 ===========================================
    {
      id: "03-round-robin",
      title: "3. Round Robin med kvantum",
      narrative:
        "FCFS er rettferdig i ankomstrekkefølge, men brutalt mot interaktive prosesser: en lang CPU-tung jobb monopoliserer maskinen mens raske jobber sitter og venter.\n\n**Round Robin** løser det: hver prosess får CPU i maks `kvantum` ticks før den blir **preempted** og lagt bak i køen. Da rullerer alle prosesser gjennom CPU-en i raske runder. Quantum = 4 er typisk i Unix.\n\n**Din oppgave:** Implementér `run_rr(processes, kvantum, max_ticks=100)`. Forskjellen fra FCFS er at vi teller hvor mange ticks `nåværende` har kjørt sammenhengende — når den treffer `kvantum` OG ikke er ferdig, settes den **bak** i køen og vi velger en ny.\n\nTips: hold en lokal teller `kjørt_av_nåværende` som nullstilles hver gang vi bytter prosess.",
      files: {
        "scheduler.py": `class Process:
    def __init__(self, pid, arrival, burst, priority=5):
        self.pid = pid
        self.arrival = arrival
        self.burst = burst
        self.remaining = burst
        self.priority = priority
        self.waited = 0
        self.completed_at = None

    def is_done(self):
        return self.remaining <= 0

    def __repr__(self):
        return f"P{self.pid}"


def run_rr(processes, kvantum, max_ticks=100):
    """Round Robin. Preempt naavaerende etter kvantum ticks."""
    not_arrived = sorted(processes, key=lambda p: p.arrival)
    klar = []
    log = []
    nåværende = None
    kjørt = 0

    # === DIN OPPGAVE ===
    # for tick in range(max_ticks):
    #     # 1. Flytt ankomster inn i klar
    #     # 2. Hvis ingen nåværende: ta neste fra klar, nullstill kjørt
    #     # 3. Hvis fortsatt ingen: log idle og continue (eller break hvis alt tomt)
    #     # 4. Kjør ett tick (remaining -= 1, kjørt += 1, log)
    #     # 5. Andre i klar venter (waited += 1)
    #     # 6. Hvis ferdig: completed_at; nåværende = None
    #     # 7. Ellers hvis kjørt == kvantum og klar er ikke-tom:
    #     #      preempt: legg nåværende bak i klar, sett nåværende = None
    #     #    (Hvis kvantum nås men klar er tom, fortsett — ingen å bytte til)
    return log


def gjennomsnitt_venting(ps):
    return sum(p.waited for p in ps) / len(ps) if ps else 0


def sjekk(faktisk, forventet, navn):
    print(f"OK   {navn}" if faktisk == forventet else f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Tre prosesser, kvantum 2
ps = [Process(1, 0, 5), Process(2, 0, 3), Process(3, 0, 2)]
log = run_rr(ps, kvantum=2)

# Forventet rotasjon (kvantum 2):
# tick 0-1: P1 (rem 5→3)
# tick 2-3: P2 (rem 3→1)
# tick 4-5: P3 (rem 2→0, done)
# tick 6-7: P1 (rem 3→1)
# tick 8:   P2 (rem 1→0, done)
# tick 9:   P1 (rem 1→0, done)
sjekk(log[0][1], 1, "tick 0: P1")
sjekk(log[2][1], 2, "tick 2: byttet til P2")
sjekk(log[4][1], 3, "tick 4: byttet til P3")
sjekk(log[6][1], 1, "tick 6: tilbake til P1")

# Sjekk at alle ble ferdig
sjekk(ps[0].is_done(), True, "P1 ferdig")
sjekk(ps[1].is_done(), True, "P2 ferdig")
sjekk(ps[2].is_done(), True, "P3 ferdig")

# Vis at RR gjør P3 (kortest) ferdig før P1 — fairness-gevinsten
sjekk(ps[2].completed_at < ps[0].completed_at, True, "P3 (kort jobb) ferdig før P1 (lang jobb)")

print(f"Snitt-venting RR(q=2): {gjennomsnitt_venting(ps):.2f}")
`,
      },
      defaultFile: "scheduler.py",
      editable: ["scheduler.py"],
      run: { kind: "python-script", entry: "scheduler.py" },
      verifications: [
        { label: "Tick 0 kjører P1", check: { kind: "output-contains", needle: "OK   tick 0: P1" } },
        { label: "Preempted etter 2 ticks til P2", check: { kind: "output-contains", needle: "OK   tick 2: byttet til P2" } },
        { label: "Roterer til P3 etter neste kvantum", check: { kind: "output-contains", needle: "OK   tick 4: byttet til P3" } },
        { label: "Roterer tilbake til P1", check: { kind: "output-contains", needle: "OK   tick 6: tilbake til P1" } },
        { label: "Alle prosesser fullføres", check: { kind: "output-contains", needle: "OK   P3 ferdig" } },
        { label: "Korte jobber fullfører før lange (fairness)", check: { kind: "output-contains", needle: "OK   P3 (kort jobb) ferdig før P1 (lang jobb)" } },
      ],
      hint:
        "for tick in range(max_ticks):\n    while not_arrived and not_arrived[0].arrival <= tick:\n        klar.append(not_arrived.pop(0))\n    if nåværende is None and klar:\n        nåværende = klar.pop(0)\n        kjørt = 0\n    if nåværende is None:\n        if not not_arrived: break\n        log.append((tick, None)); continue\n    nåværende.remaining -= 1\n    kjørt += 1\n    log.append((tick, nåværende.pid))\n    for p in klar: p.waited += 1\n    if nåværende.is_done():\n        nåværende.completed_at = tick + 1\n        nåværende = None\n    elif kjørt == kvantum and klar:\n        klar.append(nåværende)\n        nåværende = None",
    },

    // ============ LEKSJON 4 ===========================================
    {
      id: "04-priority-starvation",
      title: "4. Prioritetsscheduling (og starvation)",
      narrative:
        "Alle prosesser er ikke like viktige. En backup-jobb i bakgrunnen burde vike for en interaktiv prosess. **Prioritetsscheduling** velger alltid prosessen med høyest prioritet (lavest tall i Unix-konvensjonen) fra klar-køen.\n\nMen det har en skygge-side: **starvation**. Hvis det stadig kommer høy-prioritet-prosesser, vil en lav-prioritet-prosess kanskje *aldri* få CPU.\n\nVi demonstrerer dette med en lav-prioritet-prosess (P3, prio 9) som ankommer på tick 0 — men nye høy-prioritet-prosesser (prio 1) ankommer på tick 2 og 4. P3 sulter.\n\n**Din oppgave:** Implementér `run_priority(processes, max_ticks=20)`. Ved hvert valg fra klar-køen, plukk prosessen med lavest priority-tall (ikke nødvendigvis front). Ingen preempting innen samme prosess.",
      files: {
        "scheduler.py": `class Process:
    def __init__(self, pid, arrival, burst, priority=5):
        self.pid = pid
        self.arrival = arrival
        self.burst = burst
        self.remaining = burst
        self.priority = priority
        self.waited = 0
        self.completed_at = None

    def is_done(self):
        return self.remaining <= 0

    def __repr__(self):
        return f"P{self.pid}"


def run_priority(processes, max_ticks=20):
    """Velg alltid prosessen med LAVEST priority-tall fra klar-køen."""
    not_arrived = sorted(processes, key=lambda p: p.arrival)
    klar = []
    log = []
    nåværende = None

    # === DIN OPPGAVE ===
    # Som FCFS, MEN ved valg fra klar plukker vi prosessen med
    # min(priority). Bruk klar.remove(p) for å fjerne den valgte.
    return log


def sjekk(faktisk, forventet, navn):
    print(f"OK   {navn}" if faktisk == forventet else f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Demo: P3 har lav prioritet og ankommer først, men sulter
ps = [
    Process(pid=3, arrival=0, burst=4, priority=9),  # lav prio (sultende)
    Process(pid=1, arrival=2, burst=3, priority=1),  # høy prio
    Process(pid=2, arrival=4, burst=3, priority=1),  # høy prio
]
log = run_priority(ps, max_ticks=15)

# Tick 0-1: bare P3 i køen → den kjører
sjekk(log[0][1], 3, "tick 0: P3 kjører (eneste i kø)")
sjekk(log[1][1], 3, "tick 1: P3 fortsatt")

# Tick 2: P1 ankommer (prio 1) — preempting skjer IKKE her
# fordi nåværende er P3 og ingen preempting i denne enkle versjonen.
# Men når P3 er ferdig velger vi P1 fremfor å gå tilbake til seg selv.
# Faktisk: i denne enkle versjonen kjører P3 ferdig (4 ticks: 0-3),
# deretter P1 (tick 4-6), så P2 (tick 7-9).

# La oss heller demonstrere med samme starttidspunkt:
ps2 = [
    Process(pid=10, arrival=0, burst=3, priority=9),  # lav prio
    Process(pid=20, arrival=0, burst=3, priority=1),  # høy prio
    Process(pid=30, arrival=0, burst=3, priority=5),  # medium prio
]
log2 = run_priority(ps2, max_ticks=15)

# Forventet: P20 (prio 1) først, så P30 (prio 5), så P10 (prio 9)
sjekk(log2[0][1], 20, "samme arrival: høyeste prio (P20) først")
sjekk(log2[3][1], 30, "deretter P30 (medium prio)")
sjekk(log2[6][1], 10, "P10 sist (lavest prio)")

# Vis starvation: P10 ventet 6 ticks selv om den var i køen fra start
sjekk(ps2[0].waited, 6, "P10 ventet 6 ticks (svekket av prio)")
sjekk(ps2[1].waited, 0, "P20 ventet 0 (kjørte umiddelbart)")
`,
      },
      defaultFile: "scheduler.py",
      editable: ["scheduler.py"],
      run: { kind: "python-script", entry: "scheduler.py" },
      verifications: [
        { label: "Eneste prosess i kø kjøres", check: { kind: "output-contains", needle: "OK   tick 0: P3 kjører (eneste i kø)" } },
        { label: "Høyeste prioritet velges først", check: { kind: "output-contains", needle: "OK   samme arrival: høyeste prio (P20) først" } },
        { label: "Medium prioritet kjøres deretter", check: { kind: "output-contains", needle: "OK   deretter P30 (medium prio)" } },
        { label: "Lav prioritet kjøres sist", check: { kind: "output-contains", needle: "OK   P10 sist (lavest prio)" } },
        { label: "Lav-prio prosess ventet mens andre kjørte", check: { kind: "output-contains", needle: "OK   P10 ventet 6 ticks (svekket av prio)" } },
        { label: "Høy-prio prosess fikk kjøre umiddelbart", check: { kind: "output-contains", needle: "OK   P20 ventet 0 (kjørte umiddelbart)" } },
      ],
      hint:
        "for tick in range(max_ticks):\n    while not_arrived and not_arrived[0].arrival <= tick:\n        klar.append(not_arrived.pop(0))\n    if nåværende is None and klar:\n        nåværende = min(klar, key=lambda p: p.priority)\n        klar.remove(nåværende)\n    if nåværende is None:\n        if not not_arrived: break\n        log.append((tick, None)); continue\n    nåværende.remaining -= 1\n    log.append((tick, nåværende.pid))\n    for p in klar: p.waited += 1\n    if nåværende.is_done():\n        nåværende.completed_at = tick + 1\n        nåværende = None\nreturn log",
    },

    // ============ LEKSJON 5 ===========================================
    {
      id: "05-aging",
      title: "5. Aging — fairness-fix for starvation",
      narrative:
        "Starvation-problemet løses med **aging**: jo lengre en prosess venter, jo høyere blir dens effektive prioritet. Etter nok ventetid får selv lav-prio-prosessen kjøre.\n\nEnkel formel: `effektiv_prio = priority - waited // ALDER`. Når waited øker, synker effektiv_prio (lavere tall = høyere prio). ALDER = 4 betyr at hver 4. tick i kø reduserer effektiv_prio med 1.\n\n**Din oppgave:** Implementér `run_aging(processes, alder=4, max_ticks=20)`. Bruk samme struktur som `run_priority`, men ved valg bruker du `effektiv_prio = p.priority - p.waited // alder` i stedet for `p.priority`.\n\nResultat: P10 (prio 9) sulter ikke lenger — etter ~16 ticks venting blir den effektive prioriteten 9 - 16//4 = 5, og den blir konkurransedyktig.",
      files: {
        "scheduler.py": `class Process:
    def __init__(self, pid, arrival, burst, priority=5):
        self.pid = pid
        self.arrival = arrival
        self.burst = burst
        self.remaining = burst
        self.priority = priority
        self.waited = 0
        self.completed_at = None

    def is_done(self):
        return self.remaining <= 0


def run_aging(processes, alder=4, max_ticks=30):
    """Prioritetsscheduling med aging: effektiv_prio = priority - waited // alder."""
    not_arrived = sorted(processes, key=lambda p: p.arrival)
    klar = []
    log = []
    nåværende = None

    # === DIN OPPGAVE ===
    # Som run_priority, men ved valg fra klar:
    #   def effektiv(p): return p.priority - p.waited // alder
    #   nåværende = min(klar, key=effektiv)
    return log


def sjekk(faktisk, forventet, navn):
    print(f"OK   {navn}" if faktisk == forventet else f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Strømming av høy-prio-jobber — utfordrer aging
# P_low: prio 9, ankommer tick 0
# P_high*: prio 1, ankommer tick 0, 1, 2, 3, 4, 5, 6, 7 — én pr tick
P_low = Process(pid=99, arrival=0, burst=2, priority=9)
P_highs = [Process(pid=i+1, arrival=i, burst=1, priority=1) for i in range(8)]

log = run_aging([P_low] + P_highs, alder=4, max_ticks=30)

# Uten aging hadde P99 aldri kjørt før alle høy-prio var ferdig (tick 8).
# Med aging blir P99s effektive prio etter 4 ticks venting: 9 - 4//4 = 8.
# Etter 8 ticks: 9 - 2 = 7. Etter 16 ticks: 9 - 4 = 5.
# Når effektiv_prio matcher noen i køen, kan P99 vinne.
sjekk(P_low.completed_at is not None, True, "P_low (sultende) fullføres med aging")
sjekk(P_low.completed_at <= 30, True, "P_low ferdig innen max_ticks")

print(f"P_low fullført på tick {P_low.completed_at}")
print(f"P_low ventet {P_low.waited} ticks før den fikk kjøre")
`,
      },
      defaultFile: "scheduler.py",
      editable: ["scheduler.py"],
      run: { kind: "python-script", entry: "scheduler.py" },
      verifications: [
        { label: "P_low fullføres takket være aging", check: { kind: "output-contains", needle: "OK   P_low (sultende) fullføres med aging" } },
        { label: "P_low ferdig før max_ticks", check: { kind: "output-contains", needle: "OK   P_low ferdig innen max_ticks" } },
      ],
      hint:
        "for tick in range(max_ticks):\n    while not_arrived and not_arrived[0].arrival <= tick:\n        klar.append(not_arrived.pop(0))\n    if nåværende is None and klar:\n        nåværende = min(klar, key=lambda p: p.priority - p.waited // alder)\n        klar.remove(nåværende)\n    if nåværende is None:\n        if not not_arrived: break\n        log.append((tick, None)); continue\n    nåværende.remaining -= 1\n    log.append((tick, nåværende.pid))\n    for p in klar: p.waited += 1\n    if nåværende.is_done():\n        nåværende.completed_at = tick + 1\n        nåværende = None\nreturn log",
    },

    // ============ LEKSJON 6 ===========================================
    {
      id: "06-compare",
      title: "6. Head-to-head: hvilken algoritme vinner?",
      narrative:
        "Du har nå fire schedulere: FCFS, RR, prioritet, og aging-prioritet. Spørsmålet er: **hvilken er best?**\n\nSvaret er at det kommer an på hva du måler. Vi kjører samme workload gjennom alle fire og rapporterer:\n\n- **Snitt-venting** — hvor lenge ventet prosesser i køen (lavere er bedre)\n- **Total tid** — siste completion (lavere er bedre = bedre gjennomstrømning)\n- **Sulting** — antall prosesser som aldri ble ferdig (lavere er bedre)\n\nWorkloaden: 5 prosesser, blanding av lange/korte og høy/lav prioritet.\n\n**Din oppgave:** Implementér `sammenlign(navn_til_runner)` som tar en dict med navn → runner-funksjon, kjører alle på en fersk kopi av workloaden, og printer tabell. Funksjonene har ulik signatur:\n\n- FCFS: `run_fcfs(processes)`\n- RR: `lambda ps: run_rr(ps, kvantum=3)`\n- Prio: `run_priority(processes)`\n- Aging: `lambda ps: run_aging(ps, alder=3)`\n\nDu får hjelpefunksjoner `kopier_workload()` og `metrikker(processes, log)`.",
      files: {
        "scheduler.py": `import copy


class Process:
    def __init__(self, pid, arrival, burst, priority=5):
        self.pid = pid
        self.arrival = arrival
        self.burst = burst
        self.remaining = burst
        self.priority = priority
        self.waited = 0
        self.completed_at = None

    def is_done(self):
        return self.remaining <= 0


# === Alle fire algoritmer (gjenbruk fra leksjon 2-5) ===

def run_fcfs(ps, max_ticks=100):
    na = sorted(ps, key=lambda p: p.arrival); klar = []; log = []; n = None
    for tick in range(max_ticks):
        while na and na[0].arrival <= tick: klar.append(na.pop(0))
        if n is None and klar: n = klar.pop(0)
        if n is None:
            if not na: break
            log.append((tick, None)); continue
        n.remaining -= 1; log.append((tick, n.pid))
        for p in klar: p.waited += 1
        if n.is_done(): n.completed_at = tick + 1; n = None
    return log


def run_rr(ps, kvantum=3, max_ticks=100):
    na = sorted(ps, key=lambda p: p.arrival); klar = []; log = []; n = None; kjørt = 0
    for tick in range(max_ticks):
        while na and na[0].arrival <= tick: klar.append(na.pop(0))
        if n is None and klar: n = klar.pop(0); kjørt = 0
        if n is None:
            if not na: break
            log.append((tick, None)); continue
        n.remaining -= 1; kjørt += 1; log.append((tick, n.pid))
        for p in klar: p.waited += 1
        if n.is_done(): n.completed_at = tick + 1; n = None
        elif kjørt == kvantum and klar: klar.append(n); n = None
    return log


def run_priority(ps, max_ticks=100):
    na = sorted(ps, key=lambda p: p.arrival); klar = []; log = []; n = None
    for tick in range(max_ticks):
        while na and na[0].arrival <= tick: klar.append(na.pop(0))
        if n is None and klar:
            n = min(klar, key=lambda p: p.priority); klar.remove(n)
        if n is None:
            if not na: break
            log.append((tick, None)); continue
        n.remaining -= 1; log.append((tick, n.pid))
        for p in klar: p.waited += 1
        if n.is_done(): n.completed_at = tick + 1; n = None
    return log


def run_aging(ps, alder=3, max_ticks=100):
    na = sorted(ps, key=lambda p: p.arrival); klar = []; log = []; n = None
    for tick in range(max_ticks):
        while na and na[0].arrival <= tick: klar.append(na.pop(0))
        if n is None and klar:
            n = min(klar, key=lambda p: p.priority - p.waited // alder); klar.remove(n)
        if n is None:
            if not na: break
            log.append((tick, None)); continue
        n.remaining -= 1; log.append((tick, n.pid))
        for p in klar: p.waited += 1
        if n.is_done(): n.completed_at = tick + 1; n = None
    return log


# === Workload + helpers ===

def workload():
    return [
        Process(pid=1, arrival=0, burst=6, priority=3),   # lang, medium prio
        Process(pid=2, arrival=1, burst=2, priority=1),   # kort, høy prio
        Process(pid=3, arrival=2, burst=8, priority=9),   # lang, lav prio
        Process(pid=4, arrival=3, burst=3, priority=5),   # medium
        Process(pid=5, arrival=4, burst=1, priority=2),   # superkort, høy prio
    ]


def metrikker(ps, log):
    snitt = sum(p.waited for p in ps) / len(ps)
    fullfort = [p for p in ps if p.completed_at is not None]
    total = max((p.completed_at for p in fullfort), default=0)
    sultne = len(ps) - len(fullfort)
    return snitt, total, sultne


# === DIN OPPGAVE ===
# Lag en funksjon sammenlign() som kjører alle fire på fersk workload
# og printer tabell. Bruk copy.deepcopy(workload()) for hver kjøring.
def sammenlign():
    pass


def sjekk(faktisk, forventet, navn):
    print(f"OK   {navn}" if faktisk == forventet else f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


sammenlign()

# Kontroll: kjør hver separat og verifiser at de ALLE fullfører alle 5
for navn, kjor in [("FCFS", run_fcfs), ("RR", lambda p: run_rr(p, kvantum=3)),
                   ("Prio", run_priority), ("Aging", lambda p: run_aging(p, alder=3))]:
    ps = workload()
    kjor(ps)
    fullfort = sum(1 for p in ps if p.completed_at is not None)
    sjekk(fullfort, 5, f"{navn} fullførte alle 5 prosesser")
`,
      },
      defaultFile: "scheduler.py",
      editable: ["scheduler.py"],
      run: { kind: "python-script", entry: "scheduler.py" },
      verifications: [
        { label: "FCFS fullfører alle 5 prosesser", check: { kind: "output-contains", needle: "OK   FCFS fullførte alle 5 prosesser" } },
        { label: "Round Robin fullfører alle 5", check: { kind: "output-contains", needle: "OK   RR fullførte alle 5 prosesser" } },
        { label: "Prioritet fullfører alle 5 (ingen evig starvation her)", check: { kind: "output-contains", needle: "OK   Prio fullførte alle 5 prosesser" } },
        { label: "Aging fullfører alle 5", check: { kind: "output-contains", needle: "OK   Aging fullførte alle 5 prosesser" } },
      ],
      hint:
        "def sammenlign():\n    runners = {\n        'FCFS':  run_fcfs,\n        'RR(q=3)': lambda p: run_rr(p, kvantum=3),\n        'Prio':  run_priority,\n        'Aging': lambda p: run_aging(p, alder=3),\n    }\n    print(f\"{'Algoritme':<10} {'Snitt-vent':>11} {'Total tid':>10} {'Sultne':>7}\")\n    print('-' * 42)\n    for navn, kjor in runners.items():\n        ps = workload()\n        log = kjor(ps)\n        snitt, total, sultne = metrikker(ps, log)\n        print(f'{navn:<10} {snitt:>11.2f} {total:>10} {sultne:>7}')",
    },
  ],
};

// ============================================================================
// FREE-LIST MALLOC FRA NULL — 5 leksjoner som bygger en bibliotek-malloc/free
// fra grunnen av. Studenten lærer heap-modellen (bare-bones alloc), free,
// coalescing av tilstøtende free-blokker, plassering-strategier (first-fit /
// best-fit), og avslutter med en konkret fragmentering-demo som viser hvorfor
// disse mekanismene er nødvendige i ekte allokatorer.
// ============================================================================

const FREE_LIST_MALLOC: MiniCourse = {
  id: "free-list-malloc",
  slug: "free-list-malloc",
  title: "Free-list malloc fra null",
  blurb:
    "Skriv din egen malloc i Python. Start med en flat liste av (start, size, free)-blokker, legg på free(), så coalescing av nabo-blokker, deretter first-fit vs best-fit, og se hvordan ekstern fragmentering oppstår — og hva som demper den. Samme mønster som glibc bruker, bare uten C-pekerne.",
  estimertTid: "50–65 min",
  fag: ["DTE-2505", "Operativsystem", "Minnehåndtering"],
  color: "warning",
  rekkefolge: 30,
  lessons: [
    // ============ LEKSJON 1 ===========================================
    {
      id: "01-heap-modell",
      title: "1. Heap-modellen + bare-bones alloc",
      narrative:
        "En allokator (`malloc` i C, `new` i C++) får en stor sammenhengende region minne fra OS-en — **heapen** — og deler den ut i biter etter behov. Inne i heapen holder allokatoren en bokføring: hvilke biter er **brukt** og hvilke er **frie**.\n\nVi modellerer det med en sortert liste av `Block`-objekter. Hver block har tre felter:\n\n- `start` — offset inn i heapen (i bytes)\n- `size` — hvor mange bytes\n- `free` — `True` hvis ledig, `False` hvis utdelt\n\nVed start har heapen ÉN block: hele regionen, fri.\n\n**Alloc-algoritmen (første pass):**\n\n1. Gå gjennom blokkene og finn første som er `free` og har `size >= n`.\n2. Hvis blokken er nøyaktig `n` bytes: marker den `free = False`. Ferdig.\n3. Hvis blokken er større: **split** den i to. Den første delen blir `n` bytes brukt; resten blir en ny fri block bak.\n4. Returner `start`-adressen til den brukte delen.\n\nDette kalles ofte **first-fit**: vi tar første passende blokk og deler hvis den er for stor.\n\n**Din oppgave:** Fyll inn `Heap.__init__(total_size)` og `Heap.alloc(n)`. Returnér start-adressen, eller `None` hvis det ikke er plass.",
      files: {
        "malloc.py": `class Block:
    def __init__(self, start, size, free=True):
        self.start = start
        self.size = size
        self.free = free

    def __repr__(self):
        flag = "F" if self.free else "U"
        return f"Block({self.start}..{self.start + self.size - 1}, {flag})"


class Heap:
    def __init__(self, total_size):
        # === DIN OPPGAVE ===
        # Lag self.blocks som en liste med ÉN fri block som dekker
        # hele regionen [0, total_size). Lagre også total_size.
        pass

    def alloc(self, n):
        # === DIN OPPGAVE ===
        # 1. Finn første block der b.free og b.size >= n (first-fit).
        # 2. Hvis ingen finnes: returner None.
        # 3. Hvis b.size == n: sett b.free = False, returner b.start.
        # 4. Ellers: split. Erstatt b med to blocks:
        #      brukt = Block(b.start, n, free=False)
        #      rest  = Block(b.start + n, b.size - n, free=True)
        #    Bruk self.blocks[i:i+1] = [brukt, rest] for å sette inn paret.
        # 5. Returner brukt.start.
        return None


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Heapen starter med én stor fri block
h = Heap(100)
sjekk(len(h.blocks), 1, "ny heap har 1 block")
sjekk(h.blocks[0].size, 100, "ny block dekker hele regionen")
sjekk(h.blocks[0].free, True, "ny block er fri")

# alloc(10) splitter: [U 0..9][F 10..99]
addr1 = h.alloc(10)
sjekk(addr1, 0, "første alloc gir adresse 0")
sjekk(len(h.blocks), 2, "etter alloc har vi 2 blocks (1 brukt + 1 fri rest)")

# alloc(20) splitter resten: [U 0..9][U 10..29][F 30..99]
addr2 = h.alloc(20)
sjekk(addr2, 10, "andre alloc starter rett bak første")

# alloc(5): [U 0..9][U 10..29][U 30..34][F 35..99]
addr3 = h.alloc(5)
sjekk(addr3, 30, "tredje alloc fortsetter sekvensielt")
sjekk(len(h.blocks), 4, "3 brukt + 1 fri rest = 4 blocks")

# alloc av noe som ikke passer
addr4 = h.alloc(200)
sjekk(addr4, None, "for stor alloc returnerer None")

# Vis heapen
print("Layout:", h.blocks)
`,
      },
      defaultFile: "malloc.py",
      editable: ["malloc.py"],
      run: { kind: "python-script", entry: "malloc.py" },
      verifications: [
        { label: "Ny heap har 1 fri block", check: { kind: "output-contains", needle: "OK   ny heap har 1 block" } },
        { label: "Første block dekker hele regionen", check: { kind: "output-contains", needle: "OK   ny block dekker hele regionen" } },
        { label: "Første alloc returnerer adresse 0", check: { kind: "output-contains", needle: "OK   første alloc gir adresse 0" } },
        { label: "Alloc splitter den frie blokken", check: { kind: "output-contains", needle: "OK   etter alloc har vi 2 blocks (1 brukt + 1 fri rest)" } },
        { label: "Etterfølgende allocs fortsetter sekvensielt", check: { kind: "output-contains", needle: "OK   andre alloc starter rett bak første" } },
        { label: "3 allocs gir 4 blocks (3 brukt + 1 fri rest)", check: { kind: "output-contains", needle: "OK   3 brukt + 1 fri rest = 4 blocks" } },
        { label: "For stor alloc returnerer None", check: { kind: "output-contains", needle: "OK   for stor alloc returnerer None" } },
      ],
      hint:
        "def __init__(self, total_size):\n    self.total_size = total_size\n    self.blocks = [Block(0, total_size, free=True)]\n\ndef alloc(self, n):\n    for i, b in enumerate(self.blocks):\n        if b.free and b.size >= n:\n            if b.size == n:\n                b.free = False\n                return b.start\n            brukt = Block(b.start, n, free=False)\n            rest = Block(b.start + n, b.size - n, free=True)\n            self.blocks[i:i+1] = [brukt, rest]\n            return brukt.start\n    return None",
    },

    // ============ LEKSJON 2 ===========================================
    {
      id: "02-free",
      title: "2. free() — gi minnet tilbake",
      narrative:
        "En allokator som bare deler ut og aldri tar tilbake er ubrukelig — etter et par minutter er heapen oppbrukt. **free(addr)** sin jobb er motsatt av alloc: den finner blokken som starter på `addr` og setter den `free = True`.\n\nDet er enklere enn alloc. Vi bytter ikke noe i layouten — vi flipper bare et flagg. Studenten vil oppdage at heapen nå har **hull** (ekstern fragmentering): mellom brukte blokker ligger frie blokker som ikke kan vokse. Det er problemet vi løser i neste leksjon.\n\n**Din oppgave:** Implementér `Heap.free(addr)`:\n\n1. Gå gjennom blokkene. Finn den som har `b.start == addr` OG `b.free == False`.\n2. Sett `b.free = True`. Returnér `True`.\n3. Hvis ingen block matcher (f.eks. ugyldig adresse): returnér `False`.\n\nViktig: vi slår IKKE sammen nabo-blokker enda — det er leksjon 3.",
      files: {
        "malloc.py": `class Block:
    def __init__(self, start, size, free=True):
        self.start = start
        self.size = size
        self.free = free

    def __repr__(self):
        flag = "F" if self.free else "U"
        return f"Block({self.start}..{self.start + self.size - 1}, {flag})"


class Heap:
    def __init__(self, total_size):
        self.total_size = total_size
        self.blocks = [Block(0, total_size, free=True)]

    def alloc(self, n):
        for i, b in enumerate(self.blocks):
            if b.free and b.size >= n:
                if b.size == n:
                    b.free = False
                    return b.start
                brukt = Block(b.start, n, free=False)
                rest = Block(b.start + n, b.size - n, free=True)
                self.blocks[i:i+1] = [brukt, rest]
                return brukt.start
        return None

    def free(self, addr):
        # === DIN OPPGAVE ===
        # Finn block med b.start == addr og b.free == False.
        # Sett b.free = True og returner True.
        # Hvis ingen match: returner False.
        # IKKE coalesce enda — vi vil SE hullene.
        return False


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Alloker 3 blokker
h = Heap(100)
a = h.alloc(20)   # 0..19
b = h.alloc(30)   # 20..49
c = h.alloc(15)   # 50..64
print("Etter 3 allocs:", h.blocks)
sjekk(sum(1 for bl in h.blocks if not bl.free), 3, "3 blokker er brukt")

# Free midten — det skal lage et hull
ok = h.free(b)
sjekk(ok, True, "free returnerer True ved gyldig addr")
print("Etter free midten:", h.blocks)

# Midten er fri, men nabofarvann er fortsatt brukt
midt = next(bl for bl in h.blocks if bl.start == b)
sjekk(midt.free, True, "midten er nå fri")
sjekk(h.blocks[0].free, False, "venstre nabo fortsatt brukt")
sjekk(h.blocks[2].free, False, "høyre nabo fortsatt brukt")

# Antall blokker er uendret (vi har IKKE coalesced)
sjekk(len(h.blocks), 4, "antall blocks uendret (ingen coalescing)")

# Free med ugyldig addr returnerer False
sjekk(h.free(999), False, "ugyldig addr gir False")

# Dobbel-free (allerede fri) er også False
sjekk(h.free(b), False, "dobbel-free gir False")
`,
      },
      defaultFile: "malloc.py",
      editable: ["malloc.py"],
      run: { kind: "python-script", entry: "malloc.py" },
      verifications: [
        { label: "3 blokker er brukt etter 3 allocs", check: { kind: "output-contains", needle: "OK   3 blokker er brukt" } },
        { label: "free returnerer True ved gyldig adresse", check: { kind: "output-contains", needle: "OK   free returnerer True ved gyldig addr" } },
        { label: "Midten blir fri etter free", check: { kind: "output-contains", needle: "OK   midten er nå fri" } },
        { label: "Venstre nabo er fortsatt brukt (hull synlig)", check: { kind: "output-contains", needle: "OK   venstre nabo fortsatt brukt" } },
        { label: "Høyre nabo er fortsatt brukt (hull synlig)", check: { kind: "output-contains", needle: "OK   høyre nabo fortsatt brukt" } },
        { label: "Layout uendret (4 blocks fortsatt)", check: { kind: "output-contains", needle: "OK   antall blocks uendret (ingen coalescing)" } },
        { label: "Ugyldig adresse returnerer False", check: { kind: "output-contains", needle: "OK   ugyldig addr gir False" } },
        { label: "Dobbel-free returnerer False", check: { kind: "output-contains", needle: "OK   dobbel-free gir False" } },
      ],
      hint:
        "def free(self, addr):\n    for b in self.blocks:\n        if b.start == addr and not b.free:\n            b.free = True\n            return True\n    return False",
    },

    // ============ LEKSJON 3 ===========================================
    {
      id: "03-coalescing",
      title: "3. Coalescing — slå sammen tilstøtende free-blokker",
      narrative:
        "Etter mange alloc/free-runder ender heapen opp med mange små frie blokker mellom brukte. Det heter **ekstern fragmentering**: total fri minne kan være rikelig, men ingen sammenhengende blokk er stor nok til en stor alloc.\n\nMotgiften er **coalescing** (på norsk: sammenslåing). Når en block frigjøres, sjekker vi om naboene også er frie — i så fall slår vi dem sammen til én større fri block.\n\nAlgoritmen er enkel siden vi holder `blocks`-listen sortert etter `start`:\n\n```\ni = 0\nmens i < len(blocks) - 1:\n    a = blocks[i]\n    b = blocks[i+1]\n    hvis a.free og b.free:\n        a.size += b.size       # absorber b inn i a\n        del blocks[i+1]\n        # ikke øk i — kanskje neste også er fri\n    ellers:\n        i += 1\n```\n\nVi kaller `_coalesce()` på slutten av `free()`. Resultat: fri minne forblir så stort og sammenhengende som mulig.\n\n**Din oppgave:** Implementér `_coalesce()` og kall den i `free()`. Etter en kjede av frees skal du se at heapen kollapser tilbake til ÉN stor fri block.",
      files: {
        "malloc.py": `class Block:
    def __init__(self, start, size, free=True):
        self.start = start
        self.size = size
        self.free = free

    def __repr__(self):
        flag = "F" if self.free else "U"
        return f"Block({self.start}..{self.start + self.size - 1}, {flag})"


class Heap:
    def __init__(self, total_size):
        self.total_size = total_size
        self.blocks = [Block(0, total_size, free=True)]

    def alloc(self, n):
        for i, b in enumerate(self.blocks):
            if b.free and b.size >= n:
                if b.size == n:
                    b.free = False
                    return b.start
                brukt = Block(b.start, n, free=False)
                rest = Block(b.start + n, b.size - n, free=True)
                self.blocks[i:i+1] = [brukt, rest]
                return brukt.start
        return None

    def free(self, addr):
        for b in self.blocks:
            if b.start == addr and not b.free:
                b.free = True
                self._coalesce()
                return True
        return False

    def _coalesce(self):
        # === DIN OPPGAVE ===
        # Iterer fra venstre. Hvis blocks[i] og blocks[i+1] BEGGE er frie,
        # absorber blocks[i+1] inn i blocks[i] (legg sammen size, slett i+1).
        # Ikke øk i etter en merge — kanskje den nye naboen også er fri.
        # Stopp når i når nest-siste indeks.
        pass


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Alloker 3 blokker
h = Heap(100)
a = h.alloc(20)
b = h.alloc(30)
c = h.alloc(15)
# Layout: [U 0..19][U 20..49][U 50..64][F 65..99]
sjekk(len(h.blocks), 4, "start: 3 brukt + 1 fri rest = 4 blocks")

# Free midten først — naboene er fortsatt brukt, så ingen merge skjer
h.free(b)
sjekk(len(h.blocks), 4, "free midt: ingen merge (begge naboene brukt)")

# Free a — nå er a og b naboer og begge frie → de merger
h.free(a)
print("Etter free a + b:", h.blocks)
sjekk(len(h.blocks), 3, "free a: a+b merget → 3 blocks")
# Den merged blokken dekker 0..49 (50 bytes)
merged = h.blocks[0]
sjekk(merged.start, 0, "merged block starter på 0")
sjekk(merged.size, 50, "merged block er 20+30 = 50 bytes")
sjekk(merged.free, True, "merged block er fri")

# Free c — nå merger den med både venstre (50 bytes) og høyre (35 bytes rest)
h.free(c)
print("Etter free c:", h.blocks)
sjekk(len(h.blocks), 1, "etter alle frees: 1 stor block")
sjekk(h.blocks[0].size, 100, "den merged blokken dekker hele heapen")
sjekk(h.blocks[0].free, True, "og er fri")

# Sanity: ny heap, ulike rekkefølger gir samme resultat
h2 = Heap(60)
x = h2.alloc(10); y = h2.alloc(20); z = h2.alloc(10)
h2.free(z); h2.free(y); h2.free(x)
sjekk(len(h2.blocks), 1, "frees i omvendt rekkefølge gir også 1 block")
sjekk(h2.blocks[0].size, 60, "og dekker hele heapen")
`,
      },
      defaultFile: "malloc.py",
      editable: ["malloc.py"],
      run: { kind: "python-script", entry: "malloc.py" },
      verifications: [
        { label: "Start: 4 blocks (3 brukt + 1 rest)", check: { kind: "output-contains", needle: "OK   start: 3 brukt + 1 fri rest = 4 blocks" } },
        { label: "Free med begge naboene brukt → ingen merge", check: { kind: "output-contains", needle: "OK   free midt: ingen merge (begge naboene brukt)" } },
        { label: "Free nabo til fri block → merge", check: { kind: "output-contains", needle: "OK   free a: a+b merget → 3 blocks" } },
        { label: "Merged block har riktig størrelse", check: { kind: "output-contains", needle: "OK   merged block er 20+30 = 50 bytes" } },
        { label: "Etter alle frees: 1 stor block", check: { kind: "output-contains", needle: "OK   etter alle frees: 1 stor block" } },
        { label: "Merged block dekker hele heapen", check: { kind: "output-contains", needle: "OK   den merged blokken dekker hele heapen" } },
        { label: "Frees i omvendt rekkefølge gir også 1 block", check: { kind: "output-contains", needle: "OK   frees i omvendt rekkefølge gir også 1 block" } },
      ],
      hint:
        "def _coalesce(self):\n    i = 0\n    while i < len(self.blocks) - 1:\n        a = self.blocks[i]\n        b = self.blocks[i + 1]\n        if a.free and b.free:\n            a.size += b.size\n            del self.blocks[i + 1]\n            # ikke øk i — kanskje neste også er fri\n        else:\n            i += 1",
    },

    // ============ LEKSJON 4 ===========================================
    {
      id: "04-first-fit-vs-best-fit",
      title: "4. First-fit vs best-fit",
      narrative:
        "Når flere frie blokker er store nok til en alloc, må allokatoren velge **en**. Det er en design-knapp med målbare konsekvenser:\n\n- **first-fit:** ta den første som passer. Rask (stopper tidlig i lista), men kan etterlate seg mange små rester foran i heapen.\n- **best-fit:** velg den minste blokken som passer. Skåner store blokker, men er tregere (må scanne alt) og lager flere ørsmå rester som er praktisk umulige å gjenbruke.\n- **worst-fit:** velg den største (sjeldent brukt — sløser store blokker raskt).\n\nIngen vinner alltid. glibc bruker en variant av best-fit (segregated free lists), jemalloc bruker bucketed first-fit. Avveiningen avhenger av workload.\n\n**Din oppgave:** Utvid `alloc(n, strategy=\"first-fit\")` til å støtte `\"best-fit\"`. Algoritmen:\n\n1. Bygg liste av kandidater: alle `(i, b)`-par der `b.free` og `b.size >= n`.\n2. Hvis tom: returnér `None`.\n3. first-fit: ta første kandidat. best-fit: `min(kandidater, key=lambda ib: ib[1].size)`.\n4. Resten (split eller eksakt match) er som før.",
      files: {
        "malloc.py": `class Block:
    def __init__(self, start, size, free=True):
        self.start = start
        self.size = size
        self.free = free

    def __repr__(self):
        flag = "F" if self.free else "U"
        return f"Block({self.start}..{self.start + self.size - 1}, {flag})"


class Heap:
    def __init__(self, total_size):
        self.total_size = total_size
        self.blocks = [Block(0, total_size, free=True)]

    def alloc(self, n, strategy="first-fit"):
        # === DIN OPPGAVE ===
        # 1. kandidater = [(i, b) for i, b in enumerate(self.blocks)
        #                  if b.free and b.size >= n]
        # 2. Hvis tom: return None.
        # 3. Hvis strategy == "first-fit": velg kandidater[0].
        #    Hvis strategy == "best-fit":  velg min på b.size.
        # 4. Split eller eksakt match som før. Returnér brukt.start.
        return None

    def free(self, addr):
        for b in self.blocks:
            if b.start == addr and not b.free:
                b.free = True
                self._coalesce()
                return True
        return False

    def _coalesce(self):
        i = 0
        while i < len(self.blocks) - 1:
            a = self.blocks[i]
            b = self.blocks[i + 1]
            if a.free and b.free:
                a.size += b.size
                del self.blocks[i + 1]
            else:
                i += 1

    def free_sizes(self):
        return [b.size for b in self.blocks if b.free]


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


def lag_heap_med_tre_frie(strategi=None):
    """Lag heap med 3 frie blocks av størrelse 100, 50 og 200,
    adskilt av to ør-små brukte blokker (5 bytes hver) så coalesce
    ikke slår dem sammen igjen når vi frigjør."""
    h = Heap(360)
    # 5 sekvensielle allocs: 100, 5, 50, 5, 200
    a = h.alloc(100)   # 0..99
    s1 = h.alloc(5)    # 100..104  (sperre — forblir brukt)
    b = h.alloc(50)    # 105..154
    s2 = h.alloc(5)    # 155..159  (sperre — forblir brukt)
    c = h.alloc(200)   # 160..359
    # Frigjør a, b, c → tre adskilte frie blocks
    h.free(a); h.free(b); h.free(c)
    return h


# Bekreft layout
h_kontroll = lag_heap_med_tre_frie()
sjekk(h_kontroll.free_sizes(), [100, 50, 200], "tre frie blocks 100/50/200 oppsett OK")

# --- first-fit ---
h_ff = lag_heap_med_tre_frie()
addr_ff = h_ff.alloc(30, strategy="first-fit")
sjekk(addr_ff, 0, "first-fit alloc(30) tar fra 100-blokken (adresse 0)")
sjekk(h_ff.free_sizes(), [70, 50, 200], "first-fit etterlater 70/50/200")

# --- best-fit ---
h_bf = lag_heap_med_tre_frie()
addr_bf = h_bf.alloc(30, strategy="best-fit")
sjekk(addr_bf, 105, "best-fit alloc(30) tar fra 50-blokken (adresse 105)")
sjekk(h_bf.free_sizes(), [100, 20, 200], "best-fit etterlater 100/20/200")

# --- eksakt match foretrekker minst eksakt? ---
# Hvis det finnes en eksakt match, både first-fit og best-fit tar den.
h_ex = lag_heap_med_tre_frie()
addr_ex = h_ex.alloc(50, strategy="best-fit")
sjekk(addr_ex, 105, "best-fit foretrekker eksakt 50-match")
sjekk(h_ex.free_sizes(), [100, 200], "etter eksakt match: bare 100 og 200 igjen")

# --- ingen passer ---
h_no = lag_heap_med_tre_frie()
sjekk(h_no.alloc(500, strategy="first-fit"), None, "ingen passende → None (first-fit)")
sjekk(h_no.alloc(500, strategy="best-fit"), None, "ingen passende → None (best-fit)")
`,
      },
      defaultFile: "malloc.py",
      editable: ["malloc.py"],
      run: { kind: "python-script", entry: "malloc.py" },
      verifications: [
        { label: "Oppsett: tre frie blocks 100/50/200", check: { kind: "output-contains", needle: "OK   tre frie blocks 100/50/200 oppsett OK" } },
        { label: "first-fit velger første passende (100-blokken)", check: { kind: "output-contains", needle: "OK   first-fit alloc(30) tar fra 100-blokken (adresse 0)" } },
        { label: "first-fit etterlater 70/50/200", check: { kind: "output-contains", needle: "OK   first-fit etterlater 70/50/200" } },
        { label: "best-fit velger minste passende (50-blokken)", check: { kind: "output-contains", needle: "OK   best-fit alloc(30) tar fra 50-blokken (adresse 105)" } },
        { label: "best-fit etterlater 100/20/200", check: { kind: "output-contains", needle: "OK   best-fit etterlater 100/20/200" } },
        { label: "Eksakt match foretrekkes av best-fit", check: { kind: "output-contains", needle: "OK   best-fit foretrekker eksakt 50-match" } },
        { label: "Ingen passende block → None (begge strategier)", check: { kind: "output-contains", needle: "OK   ingen passende → None (best-fit)" } },
      ],
      hint:
        "def alloc(self, n, strategy=\"first-fit\"):\n    kandidater = [(i, b) for i, b in enumerate(self.blocks)\n                  if b.free and b.size >= n]\n    if not kandidater:\n        return None\n    if strategy == \"first-fit\":\n        i, b = kandidater[0]\n    elif strategy == \"best-fit\":\n        i, b = min(kandidater, key=lambda ib: ib[1].size)\n    else:\n        return None\n    if b.size == n:\n        b.free = False\n        return b.start\n    brukt = Block(b.start, n, free=False)\n    rest = Block(b.start + n, b.size - n, free=True)\n    self.blocks[i:i+1] = [brukt, rest]\n    return brukt.start",
    },

    // ============ LEKSJON 5 ===========================================
    {
      id: "05-fragmentering",
      title: "5. Fragmentering-demo + sammenligning",
      narrative:
        "Nå har du alle byggeklossene: alloc med to strategier, free, og coalescing. Tid for å SE hvorfor disse mekanismene er viktige.\n\nVi kjører en realistisk workload — en blanding av alloc og free i ulike størrelser — gjennom **to** allokatorer:\n\n- **Med coalescing** (det du har bygget)\n- **Uten coalescing** (en degenerasjon vi simulerer ved et flagg)\n\nMåling: antall frie blokker etter workload. Færre frie blokker betyr at minnet er bedre konsolidert — fri-listen er kortere, og fremtidige store allocs har større sjanse for å passe.\n\n**Din oppgave:** Implementér `kjor_workload(coalesce_pa)` som:\n\n1. Lager `Heap(300)` med flag `coalesce_enabled = coalesce_pa`.\n2. Allokerer 5 blokker à 40 bytes (i rekkefølge). Lagre adressene.\n3. Frigjør blokk index 0, 1, og 3 (det skaper to nabopar 0+1 som er kandidater for merge, og en enkeltstående 3).\n4. Returnerer antall frie blokker via `h.num_free_blocks()`.\n\nFinalresultat: uten coalescing er det 4 frie blocks (3 fri + 1 trailing rest). Med coalescing er det 3 (0+1 merget til én + 3 + rest).",
      files: {
        "malloc.py": `class Block:
    def __init__(self, start, size, free=True):
        self.start = start
        self.size = size
        self.free = free

    def __repr__(self):
        flag = "F" if self.free else "U"
        return f"Block({self.start}..{self.start + self.size - 1}, {flag})"


class Heap:
    def __init__(self, total_size, coalesce_enabled=True):
        self.total_size = total_size
        self.coalesce_enabled = coalesce_enabled
        self.blocks = [Block(0, total_size, free=True)]

    def alloc(self, n, strategy="first-fit"):
        kandidater = [(i, b) for i, b in enumerate(self.blocks)
                      if b.free and b.size >= n]
        if not kandidater:
            return None
        if strategy == "first-fit":
            i, b = kandidater[0]
        elif strategy == "best-fit":
            i, b = min(kandidater, key=lambda ib: ib[1].size)
        else:
            return None
        if b.size == n:
            b.free = False
            return b.start
        brukt = Block(b.start, n, free=False)
        rest = Block(b.start + n, b.size - n, free=True)
        self.blocks[i:i+1] = [brukt, rest]
        return brukt.start

    def free(self, addr):
        for b in self.blocks:
            if b.start == addr and not b.free:
                b.free = True
                if self.coalesce_enabled:
                    self._coalesce()
                return True
        return False

    def _coalesce(self):
        i = 0
        while i < len(self.blocks) - 1:
            a = self.blocks[i]
            b = self.blocks[i + 1]
            if a.free and b.free:
                a.size += b.size
                del self.blocks[i + 1]
            else:
                i += 1

    def num_free_blocks(self):
        return sum(1 for b in self.blocks if b.free)

    def total_free(self):
        return sum(b.size for b in self.blocks if b.free)

    def largest_free(self):
        return max((b.size for b in self.blocks if b.free), default=0)


# === DIN OPPGAVE ===
def kjor_workload(coalesce_pa):
    """Kjør samme workload, returnér antall frie blokker.
    Steg:
      1. h = Heap(300, coalesce_enabled=coalesce_pa)
      2. addrs = [h.alloc(40) for _ in range(5)]
      3. h.free(addrs[0]); h.free(addrs[1]); h.free(addrs[3])
      4. return h.num_free_blocks()
    """
    return -1


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Kjør med og uten coalescing
uten = kjor_workload(False)
med = kjor_workload(True)

print(f"Uten coalescing: {uten} frie blocks")
print(f"Med coalescing:  {med} frie blocks")
print(f"Reduksjon takket være coalescing: {uten - med} block(s)")

# Test: uten coalescing får vi 4 frie blocks (3 individuelle + trailing rest 100)
sjekk(uten, 4, "uten coalescing: 4 frie blocks (fragmentert)")
# Med coalescing: blokk 0 og 1 merger til én → 3 frie blocks
sjekk(med, 3, "med coalescing: 3 frie blocks (nabopar merget)")
sjekk(uten > med, True, "coalescing reduserer fri-list-lengden")

# Mer realistisk sammenligning: first-fit vs best-fit etter mange ops
def realistisk(strategi):
    """20 ops på Heap(1000) med coalescing alltid på.
    Tell antall frie blocks og største fri block til slutt."""
    h = Heap(1000, coalesce_enabled=True)
    addrs = []
    # 10 allocs av ulik størrelse
    for n in [50, 80, 30, 100, 40, 60, 20, 70, 90, 25]:
        addrs.append(h.alloc(n, strategy=strategi))
    # Free annenhver (skaper hull)
    for i in [1, 3, 5, 7, 9]:
        h.free(addrs[i])
    # Nye allocs som må gjenbruke hullene
    for n in [25, 35, 45, 15]:
        h.alloc(n, strategy=strategi)
    return h.num_free_blocks(), h.largest_free()


ff_frie, ff_storst = realistisk("first-fit")
bf_frie, bf_storst = realistisk("best-fit")
print(f"first-fit etter realistisk workload: {ff_frie} frie blocks, største = {ff_storst}")
print(f"best-fit  etter realistisk workload: {bf_frie} frie blocks, største = {bf_storst}")

# Begge skal fullføre uten None-allocs
sjekk(ff_storst > 0, True, "first-fit etterlater minst én fri block")
sjekk(bf_storst > 0, True, "best-fit etterlater minst én fri block")
`,
      },
      defaultFile: "malloc.py",
      editable: ["malloc.py"],
      run: { kind: "python-script", entry: "malloc.py" },
      verifications: [
        { label: "Uten coalescing: 4 frie blocks", check: { kind: "output-contains", needle: "OK   uten coalescing: 4 frie blocks (fragmentert)" } },
        { label: "Med coalescing: 3 frie blocks (merge skjedde)", check: { kind: "output-contains", needle: "OK   med coalescing: 3 frie blocks (nabopar merget)" } },
        { label: "Coalescing reduserer fri-list-lengden", check: { kind: "output-contains", needle: "OK   coalescing reduserer fri-list-lengden" } },
        { label: "first-fit fullfører realistisk workload", check: { kind: "output-contains", needle: "OK   first-fit etterlater minst én fri block" } },
        { label: "best-fit fullfører realistisk workload", check: { kind: "output-contains", needle: "OK   best-fit etterlater minst én fri block" } },
      ],
      hint:
        "def kjor_workload(coalesce_pa):\n    h = Heap(300, coalesce_enabled=coalesce_pa)\n    addrs = [h.alloc(40) for _ in range(5)]\n    h.free(addrs[0])\n    h.free(addrs[1])\n    h.free(addrs[3])\n    return h.num_free_blocks()",
    },
  ],
};

const LINREG_GD: MiniCourse = {
  id: "linreg-gd",
  slug: "linreg-gd",
  title: "Lineær regresjon med gradient descent fra null",
  blurb:
    "Bygg en lineær regresjonsmodell trinn for trinn — fra hypotese-funksjon og MSE-tap, via partielle deriverte, til full trenings-loop. Eksperimentér med læringsrate og se hvordan modellen divergerer hvis du tar for store steg. Avslutt med mini-batch SGD. Dette er kjernen i ALL gradient-basert maskinlæring, skrevet fra null i Python.",
  estimertTid: "60–75 min",
  fag: ["DTE-2602", "Maskinlæring", "Supervised learning"],
  color: "purple",
  rekkefolge: 10,
  lessons: [
    // ============ LEKSJON 1 ===========================================
    {
      id: "01-hypotese-mse",
      title: "1. Hypotese-funksjonen og MSE-tap",
      narrative:
        "**Lineær regresjon** antar at sammenhengen mellom input `x` og output `y` er en rett linje:\n\n```\ny = w * x + b\n```\n\n`w` er stigningstallet (vekt), `b` er skjæringspunktet (bias). Hele maskinlæringsoppgaven er: gitt et datasett med par `(x_i, y_i)`, finn de `w` og `b` som best forklarer dataene.\n\nMen hva betyr «best»? Vi trenger et **taps-mål** — en skalar som forteller hvor dårlig modellen er nå. Standard for regresjon er **MSE (Mean Squared Error)**:\n\n```\nMSE = (1/n) * sum_i (y_pred_i - y_i)^2\n```\n\nKvadratet straffer store feil hardere enn små, og er glatt og deriverbar (viktig for senere). MSE er null hvis modellen er perfekt, og positiv ellers.\n\nDatasettet vårt er 10 punkter generert fra `y = 2x - 1` med litt støy. Hvis du klarer å gjette `w=2`, `b=-1`, bør MSE være liten.\n\n**Din oppgave:**\n\n1. Implementér `predict(x, w, b)` — bare `w*x + b`.\n2. Implementér `mse(xs, ys, w, b)` — gjennomsnittlig kvadratfeil over alle par.",
      files: {
        "linreg.py": `# Datasett: y = 2x - 1 + litt støy
xs = [0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0]
ys = [-1.1057, 0.7905, 3.0906, 4.7435, 7.0215, 8.9194, 10.7348, 13.0045, 14.7225, 16.9602]


def predict(x, w, b):
    """Returner modellens prediksjon for input x gitt vekt w og bias b."""
    # === DIN OPPGAVE ===
    # Returner w * x + b
    pass


def mse(xs, ys, w, b):
    """Mean Squared Error: gjennomsnittlig (prediksjon - sann)^2 over alle par."""
    # === DIN OPPGAVE ===
    # n = len(xs)
    # Summer (predict(x, w, b) - y)^2 for hvert par (x, y), del på n.
    pass


def sjekk_nær(faktisk, forventet, navn, toleranse=1e-6):
    if faktisk is None:
        print(f"FEIL {navn}: fikk None (ikke implementert?)")
        return
    if abs(faktisk - forventet) < toleranse:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Test predict
sjekk_nær(predict(3.0, 2.0, -1.0), 5.0, "predict: 2*3 - 1 = 5")
sjekk_nær(predict(0.0, 5.0, 7.0), 7.0, "predict: bias alene ved x=0")
sjekk_nær(predict(-2.0, 1.5, 1.0), -2.0, "predict: negativ x fungerer")

# Test mse
# Perfekt modell på et trivielt datasett der y = 2x - 1 eksakt
perfekt_xs = [0.0, 1.0, 2.0]
perfekt_ys = [-1.0, 1.0, 3.0]
sjekk_nær(mse(perfekt_xs, perfekt_ys, 2.0, -1.0), 0.0, "MSE er 0 ved perfekt fit")

# Helt feil modell: w=0, b=0 → prediksjoner er alle 0
sjekk_nær(mse(perfekt_xs, perfekt_ys, 0.0, 0.0),
          (1.0 + 1.0 + 9.0) / 3.0,
          "MSE regner gjennomsnitt av kvadrerte feil")

# På det støyete datasettet med "riktig" w og b skal MSE være liten men > 0
støy_mse = mse(xs, ys, 2.0, -1.0)
if støy_mse is None:
    print("FEIL støy-mse: ikke implementert")
elif 0.0 < støy_mse < 0.1:
    print(f"OK   støyete datasett: MSE = {støy_mse:.4f} (liten men positiv)")
else:
    print(f"FEIL støy-mse: fikk {støy_mse}, forventet 0 < x < 0.1")
`,
      },
      defaultFile: "linreg.py",
      editable: ["linreg.py"],
      run: { kind: "python-script", entry: "linreg.py" },
      verifications: [
        { label: "predict: w*x + b regnes riktig", check: { kind: "output-contains", needle: "OK   predict: 2*3 - 1 = 5" } },
        { label: "predict: bias alene fungerer", check: { kind: "output-contains", needle: "OK   predict: bias alene ved x=0" } },
        { label: "predict: negative inputs fungerer", check: { kind: "output-contains", needle: "OK   predict: negativ x fungerer" } },
        { label: "MSE er 0 ved perfekt fit", check: { kind: "output-contains", needle: "OK   MSE er 0 ved perfekt fit" } },
        { label: "MSE regner gjennomsnitt av kvadrater", check: { kind: "output-contains", needle: "OK   MSE regner gjennomsnitt av kvadrerte feil" } },
        { label: "MSE er liten men positiv på støyete data", check: { kind: "output-contains", needle: "OK   støyete datasett:" } },
      ],
      hint:
        "def predict(x, w, b):\n    return w * x + b\n\ndef mse(xs, ys, w, b):\n    n = len(xs)\n    return sum((predict(x, w, b) - y) ** 2 for x, y in zip(xs, ys)) / n",
    },

    // ============ LEKSJON 2 ===========================================
    {
      id: "02-gradient",
      title: "2. Partielle deriverte av MSE",
      narrative:
        "MSE forteller hvor dårlig modellen er. For å gjøre den BEDRE, må vi vite hvilken VEI vi skal flytte `w` og `b`. Det er nettopp hva gradienten gir oss: en vektor som peker i retningen hvor MSE øker raskest. Vi går i motsatt retning.\n\nMSE er en funksjon av to variabler: `L(w, b) = (1/n) * sum (w*x_i + b - y_i)^2`. Vi trenger **partielle deriverte**:\n\n```\ndL/dw = (2/n) * sum_i (y_pred_i - y_i) * x_i\ndL/db = (2/n) * sum_i (y_pred_i - y_i)\n```\n\nUtledning (kort): derivér ledd for ledd. Indre ledd `(w*x + b - y)` har derivert `x` mhp `w` og `1` mhp `b`. Kjerneregelen gir faktoren `2*(w*x + b - y)`. Summer over alle par, del på `n`.\n\n**Intuisjon for dL/dw:** hvis modellen ligger for HØYT (`y_pred > y`) for et punkt med stor `x`, vil `(pred - y) * x` være positiv — så `dL/dw` er positiv → vi må MINKE `w`. Hvis modellen ligger for lavt, gradienten blir negativ → vi øker `w`. Perfekt avstemt.\n\n**Sanity:** ved et lineært-perfekt datasett (uten støy) og riktige `w, b` skal begge gradienter være eksakt 0 — vi er på minimumspunktet.\n\n**Din oppgave:** implementér `gradients(xs, ys, w, b)` som returnerer paret `(dw, db)`.",
      files: {
        "linreg.py": `# Datasett: y = 2x - 1 + litt støy
xs = [0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0]
ys = [-1.1057, 0.7905, 3.0906, 4.7435, 7.0215, 8.9194, 10.7348, 13.0045, 14.7225, 16.9602]


def predict(x, w, b):
    return w * x + b


def mse(xs, ys, w, b):
    n = len(xs)
    return sum((predict(x, w, b) - y) ** 2 for x, y in zip(xs, ys)) / n


def gradients(xs, ys, w, b):
    """Returner tuppel (dw, db) — partielle deriverte av MSE mhp w og b."""
    # === DIN OPPGAVE ===
    # n = len(xs)
    # dw = (2/n) * sum( (predict(x_i, w, b) - y_i) * x_i ) for alle i
    # db = (2/n) * sum(  predict(x_i, w, b) - y_i )         for alle i
    # Returner (dw, db).
    pass


def sjekk_nær(faktisk, forventet, navn, toleranse=1e-6):
    if faktisk is None:
        print(f"FEIL {navn}: fikk None")
        return
    if abs(faktisk - forventet) < toleranse:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Lineært-perfekt datasett: y = 2x - 1 eksakt, ingen støy
ren_xs = [0.0, 1.0, 2.0, 3.0, 4.0]
ren_ys = [-1.0, 1.0, 3.0, 5.0, 7.0]

# Ved (w=2, b=-1) skal begge gradienter være eksakt 0
g = gradients(ren_xs, ren_ys, 2.0, -1.0)
if g is None:
    print("FEIL gradient ved minimum: ikke implementert")
else:
    dw, db = g
    sjekk_nær(dw, 0.0, "dw er 0 ved minimum av rent datasett")
    sjekk_nær(db, 0.0, "db er 0 ved minimum av rent datasett")

# Ved (w=0, b=0) på samme rene datasett: predikerer 0 for alt.
# y_pred - y = -y = [1, -1, -3, -5, -7]
# dw = (2/5) * sum((y_pred - y) * x) = (2/5)*(0 + -1 + -6 + -15 + -28) = (2/5)*(-50) = -20
# db = (2/5) * sum(y_pred - y)        = (2/5)*(1 - 1 - 3 - 5 - 7)      = (2/5)*(-15) = -6
g0 = gradients(ren_xs, ren_ys, 0.0, 0.0)
if g0 is None:
    print("FEIL gradient(0,0): ikke implementert")
else:
    dw0, db0 = g0
    sjekk_nær(dw0, -20.0, "dw ved (0,0) på rent datasett")
    sjekk_nær(db0, -6.0, "db ved (0,0) på rent datasett")

# På det støyete datasettet skal gradient ved sanne (w, b) være liten men ikke nøyaktig null
g_støy = gradients(xs, ys, 2.0, -1.0)
if g_støy is None:
    print("FEIL gradient(støy): ikke implementert")
else:
    dw_s, db_s = g_støy
    if abs(dw_s) < 2.0 and abs(db_s) < 1.0:
        print(f"OK   gradient på støyete data nær sanne (w,b): dw={dw_s:.4f}, db={db_s:.4f}")
    else:
        print(f"FEIL gradient(støy): forventet liten, fikk dw={dw_s}, db={db_s}")
`,
      },
      defaultFile: "linreg.py",
      editable: ["linreg.py"],
      run: { kind: "python-script", entry: "linreg.py" },
      verifications: [
        { label: "dw er 0 ved minimum (rent datasett)", check: { kind: "output-contains", needle: "OK   dw er 0 ved minimum av rent datasett" } },
        { label: "db er 0 ved minimum (rent datasett)", check: { kind: "output-contains", needle: "OK   db er 0 ved minimum av rent datasett" } },
        { label: "dw ved (0,0) regnes riktig (formel)", check: { kind: "output-contains", needle: "OK   dw ved (0,0) på rent datasett" } },
        { label: "db ved (0,0) regnes riktig (formel)", check: { kind: "output-contains", needle: "OK   db ved (0,0) på rent datasett" } },
        { label: "Gradient er liten på støyete data ved sanne (w,b)", check: { kind: "output-contains", needle: "OK   gradient på støyete data nær sanne" } },
      ],
      hint:
        "def gradients(xs, ys, w, b):\n    n = len(xs)\n    dw = (2.0 / n) * sum((predict(x, w, b) - y) * x for x, y in zip(xs, ys))\n    db = (2.0 / n) * sum((predict(x, w, b) - y) for x, y in zip(xs, ys))\n    return dw, db",
    },

    // ============ LEKSJON 3 ===========================================
    {
      id: "03-step",
      title: "3. Ett oppdaterings-steg",
      narrative:
        "Vi har nå alle byggesteinene for **gradient descent**. Kjerneoppdateringen er bedragersk enkel:\n\n```\nw_ny = w - lr * dw\nb_ny = b - lr * db\n```\n\n`lr` (learning rate, læringsrate) er et lite positivt tall som styrer hvor stort skritt vi tar. Vi går i MOTSATT retning av gradienten fordi gradienten peker mot ØKENDE tap; vi vil ned.\n\nTenk det som å rulle ned en kul-skål: gradienten er bakke-vektoren, læringsraten er hvor langt du sklir per tidssteg. For lite → bevegelsen er treg. For stort → du overshooter bunnen og kan ende lenger oppe enn der du startet.\n\nI denne leksjonen gjør vi BARE ETT steg, fra et dårlig utgangspunkt `(w=0, b=0)`. Du skal verifisere at MSE FALLER etter dette ene steget — det er hele begrunnelsen for at gradient descent fungerer.\n\n**Din oppgave:** implementér `step(xs, ys, w, b, lr)` som regner gradient, oppdaterer `w` og `b`, og returnerer det nye paret `(w, b)`.",
      files: {
        "linreg.py": `xs = [0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0]
ys = [-1.1057, 0.7905, 3.0906, 4.7435, 7.0215, 8.9194, 10.7348, 13.0045, 14.7225, 16.9602]


def predict(x, w, b):
    return w * x + b


def mse(xs, ys, w, b):
    n = len(xs)
    return sum((predict(x, w, b) - y) ** 2 for x, y in zip(xs, ys)) / n


def gradients(xs, ys, w, b):
    n = len(xs)
    dw = (2.0 / n) * sum((predict(x, w, b) - y) * x for x, y in zip(xs, ys))
    db = (2.0 / n) * sum((predict(x, w, b) - y) for x, y in zip(xs, ys))
    return dw, db


def step(xs, ys, w, b, lr):
    """Ett gradient-descent-steg. Returner nye (w, b)."""
    # === DIN OPPGAVE ===
    # 1. Hent dw, db = gradients(xs, ys, w, b)
    # 2. Returner (w - lr * dw, b - lr * db)
    pass


# Start fra dårlige verdier
w0, b0 = 0.0, 0.0
loss_før = mse(xs, ys, w0, b0)
print(f"Før step: w={w0}, b={b0}, loss={loss_før:.4f}")

res = step(xs, ys, w0, b0, lr=0.01)
if res is None:
    print("FEIL: step returnerte None")
else:
    w1, b1 = res
    loss_etter = mse(xs, ys, w1, b1)
    print(f"Etter 1 step (lr=0.01): w={w1:.4f}, b={b1:.4f}, loss={loss_etter:.4f}")

    if loss_etter < loss_før:
        print("OK   loss går NED etter ett gradient-descent-steg")
    else:
        print(f"FEIL: loss økte fra {loss_før} til {loss_etter}")

    # Etter ett steg fra (0,0) i retning av sanne (2, -1) bør w være positiv (vi beveger oss mot 2)
    if w1 > 0:
        print("OK   w beveget seg i riktig retning (positiv)")
    else:
        print(f"FEIL: w={w1} (forventet > 0)")

    # Ett mer steg — fortsatt nedgang
    w2, b2 = step(xs, ys, w1, b1, lr=0.01)
    loss2 = mse(xs, ys, w2, b2)
    if loss2 < loss_etter:
        print("OK   loss fortsetter å falle ved andre steg")
    else:
        print(f"FEIL: andre steg økte loss")
`,
      },
      defaultFile: "linreg.py",
      editable: ["linreg.py"],
      run: { kind: "python-script", entry: "linreg.py" },
      verifications: [
        { label: "MSE faller etter ett gradient-descent-steg", check: { kind: "output-contains", needle: "OK   loss går NED etter ett gradient-descent-steg" } },
        { label: "w beveger seg i riktig retning (mot positiv)", check: { kind: "output-contains", needle: "OK   w beveget seg i riktig retning" } },
        { label: "MSE fortsetter å falle etter andre steg", check: { kind: "output-contains", needle: "OK   loss fortsetter å falle ved andre steg" } },
      ],
      hint:
        "def step(xs, ys, w, b, lr):\n    dw, db = gradients(xs, ys, w, b)\n    return w - lr * dw, b - lr * db",
    },

    // ============ LEKSJON 4 ===========================================
    {
      id: "04-train",
      title: "4. Trenings-loopen",
      narrative:
        "Ett steg er ikke nok. Vi gjentar mange ganger — det kalles å **trene** modellen. En **epoke** er én pass over hele datasettet. Etter nok epoker konvergerer `(w, b)` mot minimum.\n\nFor å forstå dynamikken lagrer vi `loss_history` — MSE etter hvert steg. Hvis alt går bra er denne strengt synkende (med batch gradient descent uten støy i selve gradient-beregningen, er det matematisk garantert at hvert steg reduserer tapet, så lenge `lr` ikke er for stor).\n\nI denne leksjonen plotter vi også loss-kurven som en grov ascii-graf: hvert tegn er én sample langs x-aksen, antall stjerner er proporsjonal med loss. Du skal se den falle bratt først, så flate ut når modellen nærmer seg minimum.\n\n**Din oppgave:** implementér `train(xs, ys, lr, epochs)`. Start fra `(w=0, b=0)`, gjør `epochs` gradient-steg, og returnér `(w, b, loss_history)`. `loss_history` skal inneholde MSE FØR hvert steg, pluss MSE etter siste steg — totalt `epochs + 1` elementer.",
      files: {
        "linreg.py": `xs = [0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0]
ys = [-1.1057, 0.7905, 3.0906, 4.7435, 7.0215, 8.9194, 10.7348, 13.0045, 14.7225, 16.9602]
SANN_W = 2.0
SANN_B = -1.0


def predict(x, w, b):
    return w * x + b


def mse(xs, ys, w, b):
    n = len(xs)
    return sum((predict(x, w, b) - y) ** 2 for x, y in zip(xs, ys)) / n


def gradients(xs, ys, w, b):
    n = len(xs)
    dw = (2.0 / n) * sum((predict(x, w, b) - y) * x for x, y in zip(xs, ys))
    db = (2.0 / n) * sum((predict(x, w, b) - y) for x, y in zip(xs, ys))
    return dw, db


def step(xs, ys, w, b, lr):
    dw, db = gradients(xs, ys, w, b)
    return w - lr * dw, b - lr * db


def train(xs, ys, lr, epochs):
    """Returner (w, b, loss_history). loss_history har epochs+1 entries."""
    # === DIN OPPGAVE ===
    # w, b = 0.0, 0.0
    # loss_hist = []
    # gjenta "epochs" ganger:
    #     loss_hist.append( mse(xs, ys, w, b) )
    #     w, b = step(xs, ys, w, b, lr)
    # loss_hist.append( mse(xs, ys, w, b) )   # final
    # return w, b, loss_hist
    pass


# Tren
res = train(xs, ys, lr=0.01, epochs=500)
if res is None:
    print("FEIL: train returnerte None")
else:
    w, b, hist = res
    print(f"Etter 500 epoker (lr=0.01): w={w:.4f}, b={b:.4f}")
    print(f"Initial loss: {hist[0]:.4f}")
    print(f"Final loss:   {hist[-1]:.6f}")
    print(f"loss_history-lengde: {len(hist)}")

    # ascii loss-kurve (12 samples evenly spaced)
    print("\\nLoss-kurve (* = relativ størrelse):")
    n = len(hist)
    samples = [hist[int(i * (n - 1) / 11)] for i in range(12)]
    max_loss = max(samples) if max(samples) > 0 else 1
    for i, l in enumerate(samples):
        bars = int(40 * l / max_loss)
        print(f"  epoke {int(i * (n - 1) / 11):4d}: {'*' * bars}")

    # Test 1: lengde stemmer
    if len(hist) == 501:
        print("OK   loss_history har 501 entries (500 epoker + final)")
    else:
        print(f"FEIL: lengde = {len(hist)}, forventet 501")

    # Test 2: loss monotont (eller nesten — tillat 1% lokal stigning pga floats)
    ups = sum(1 for i in range(len(hist) - 1) if hist[i + 1] > hist[i] + 1e-9)
    if ups == 0:
        print("OK   loss er strengt synkende gjennom hele treningen")
    else:
        print(f"FEIL: loss steg ved {ups} steg")

    # Test 3: konvergens innen 5% av sanne (w, b)
    err_w = abs(w - SANN_W) / abs(SANN_W)
    err_b = abs(b - SANN_B) / abs(SANN_B)
    if err_w < 0.05 and err_b < 0.05:
        print(f"OK   konvergerte innen 5% (err_w={err_w*100:.2f}%, err_b={err_b*100:.2f}%)")
    else:
        print(f"FEIL: ikke konvergert (err_w={err_w*100:.2f}%, err_b={err_b*100:.2f}%)")

    # Test 4: final loss < initial
    if hist[-1] < hist[0]:
        print("OK   final loss er mye mindre enn initial loss")
    else:
        print("FEIL: ingen forbedring")
`,
      },
      defaultFile: "linreg.py",
      editable: ["linreg.py"],
      run: { kind: "python-script", entry: "linreg.py" },
      verifications: [
        { label: "loss_history har riktig lengde (epochs + 1)", check: { kind: "output-contains", needle: "OK   loss_history har 501 entries" } },
        { label: "Loss er monotont synkende", check: { kind: "output-contains", needle: "OK   loss er strengt synkende" } },
        { label: "Konvergerer innen 5% av sanne (w, b)", check: { kind: "output-contains", needle: "OK   konvergerte innen 5%" } },
        { label: "Final loss << initial loss", check: { kind: "output-contains", needle: "OK   final loss er mye mindre enn initial" } },
      ],
      hint:
        "def train(xs, ys, lr, epochs):\n    w, b = 0.0, 0.0\n    loss_hist = []\n    for _ in range(epochs):\n        loss_hist.append(mse(xs, ys, w, b))\n        w, b = step(xs, ys, w, b, lr)\n    loss_hist.append(mse(xs, ys, w, b))\n    return w, b, loss_hist",
    },

    // ============ LEKSJON 5 ===========================================
    {
      id: "05-lr-jakt",
      title: "5. Læringsrate-jakt: når GD divergerer",
      narrative:
        "Læringsraten er den eneste hyperparameteren i vår algoritme — men også den farligste. Den styrer hvor stort skritt vi tar i hvert oppdaterings-steg.\n\n- **For liten** (`lr → 0`): konvergerer, men tregt. Du kan trenge millioner av epoker.\n- **Akkurat passe**: rask konvergens.\n- **For stor**: vi overshooter minimum. Hver iterasjon havner LENGER fra minimum. Loss eksploderer mot uendelig — modellen **divergerer**.\n\nDet er ingen formel som gir riktig `lr` for et nytt problem. Du må prøve. I praksis: start med 0.01, kjør 100 epoker, sjekk om loss faller. Hvis den eksploderer, halver. Hvis den faller treg-fjotsete, doble.\n\nDenne leksjonen kjører trenings-loopen med fem ulike `lr`-verdier og rapporterer final loss for hver. Du skal kunne se den **u-formede** ytelses-kurven: middels `lr` er best, ekstremene mislykkes.\n\nViktig fallgruve: for store `lr` kan tallene bli så store at Python kaster `OverflowError`. Vi håndterer det ved `try/except` og marker som DIVERGERT.\n\n**Din oppgave:** implementér `lr_jakt(xs, ys, lr_kandidater, epochs)` som returnerer en dict `{lr: final_loss_eller_None}`. Bruk `None` (i Python) for divergente kjøringer. Definert som: final loss > 10000, eller `math.inf`, eller `math.nan`, eller en `OverflowError`/`ValueError` fra Python.",
      files: {
        "linreg.py": `import math

xs = [0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0]
ys = [-1.1057, 0.7905, 3.0906, 4.7435, 7.0215, 8.9194, 10.7348, 13.0045, 14.7225, 16.9602]


def predict(x, w, b):
    return w * x + b


def mse(xs, ys, w, b):
    n = len(xs)
    return sum((predict(x, w, b) - y) ** 2 for x, y in zip(xs, ys)) / n


def gradients(xs, ys, w, b):
    n = len(xs)
    dw = (2.0 / n) * sum((predict(x, w, b) - y) * x for x, y in zip(xs, ys))
    db = (2.0 / n) * sum((predict(x, w, b) - y) for x, y in zip(xs, ys))
    return dw, db


def step(xs, ys, w, b, lr):
    dw, db = gradients(xs, ys, w, b)
    return w - lr * dw, b - lr * db


def train_safe(xs, ys, lr, epochs):
    """Som train, men tåler overflow. Returner (w, b, final_loss eller None)."""
    w, b = 0.0, 0.0
    try:
        for _ in range(epochs):
            w, b = step(xs, ys, w, b, lr)
            if not math.isfinite(w) or not math.isfinite(b):
                return w, b, None
        loss = mse(xs, ys, w, b)
        if not math.isfinite(loss) or loss > 10000:
            return w, b, None
        return w, b, loss
    except (OverflowError, ValueError):
        return w, b, None


def lr_jakt(xs, ys, lr_kandidater, epochs):
    """Kjør train_safe for hver lr og returner dict {lr: final_loss eller None}."""
    # === DIN OPPGAVE ===
    # resultat = {}
    # for lr in lr_kandidater:
    #     _, _, final = train_safe(xs, ys, lr, epochs)
    #     resultat[lr] = final
    # return resultat
    pass


lr_kandidater = [0.0001, 0.01, 0.1, 1.0, 2.0]
res = lr_jakt(xs, ys, lr_kandidater, epochs=200)

if res is None:
    print("FEIL: lr_jakt returnerte None")
else:
    print("Læringsrate-jakt (200 epoker):")
    for lr in lr_kandidater:
        v = res.get(lr)
        if v is None:
            print(f"  lr={lr:<8}: DIVERGERT")
        else:
            print(f"  lr={lr:<8}: final loss = {v:.6f}")

    # Sjekker
    # 1) lr=0.0001 skal være MYE høyere enn lr=0.01 (underkonvergent)
    if res[0.0001] is not None and res[0.01] is not None and res[0.0001] > res[0.01]:
        print("OK   for lav lr (0.0001) konvergerer tregere enn 0.01")
    else:
        print(f"FEIL: forventet 0.0001 > 0.01, fikk {res[0.0001]} vs {res[0.01]}")

    # 2) lr=0.01 skal være rimelig liten (< 1.0)
    if res[0.01] is not None and res[0.01] < 1.0:
        print("OK   middels lr (0.01) gir liten final loss")
    else:
        print(f"FEIL: lr=0.01 ga {res[0.01]}, forventet < 1.0")

    # 3) Minst én av de store lr-ene skal divergere
    if res[1.0] is None or res[2.0] is None:
        print("OK   minst én stor lr (1.0 eller 2.0) divergerer")
    else:
        print(f"FEIL: forventet at lr=1.0 eller 2.0 divergerte; fikk {res[1.0]}, {res[2.0]}")

    # 4) lr=0.1 også divergerer på vårt datasett (xs går opp til 9)
    if res[0.1] is None:
        print("OK   lr=0.1 divergerer på dette datasettet")
    else:
        print(f"OBS  lr=0.1 ga {res[0.1]} (forventet divergens — tolereres)")
`,
      },
      defaultFile: "linreg.py",
      editable: ["linreg.py"],
      run: { kind: "python-script", entry: "linreg.py" },
      verifications: [
        { label: "For lav lr (0.0001) konvergerer tregere enn 0.01", check: { kind: "output-contains", needle: "OK   for lav lr (0.0001) konvergerer tregere enn 0.01" } },
        { label: "Middels lr (0.01) gir liten final loss", check: { kind: "output-contains", needle: "OK   middels lr (0.01) gir liten final loss" } },
        { label: "Stor lr divergerer (eksploderer)", check: { kind: "output-contains", needle: "OK   minst én stor lr" } },
      ],
      hint:
        "def lr_jakt(xs, ys, lr_kandidater, epochs):\n    resultat = {}\n    for lr in lr_kandidater:\n        _, _, final = train_safe(xs, ys, lr, epochs)\n        resultat[lr] = final\n    return resultat",
    },

    // ============ LEKSJON 6 ===========================================
    {
      id: "06-mini-batch",
      title: "6. Mini-batch gradient descent",
      narrative:
        "Hittil har vi brukt **batch gradient descent**: hvert oppdaterings-steg ser på ALLE datapunktene og regner gjennomsnittsgradienten. Det er nøyaktig, men dyrt: med 1 million eksempler venter du på 1 million summer per steg.\n\n**Mini-batch SGD** (Stochastic Gradient Descent) tar i stedet et lite tilfeldig utvalg `K` punkter per steg. Gradienten blir et bråkete estimat, men:\n\n- HVERT steg er K/n ganger billigere.\n- Bråket fungerer som regularisering — gjør det vanskeligere å sette seg fast i flate plataer.\n- I praksis konvergerer SGD til samme `(w, b)` som batch GD, bare med en mer rufsete loss-kurve.\n\nVi bruker `random.Random(seed)` (egen instans, ikke globale `random`) så testen er reproduserbar.\n\n**Det viktige observasjons-punktet:** loss er IKKE lenger strengt synkende. Hvert mini-batch ser litt forskjellig data, så enkelte steg kan tilfeldigvis øke loss. Men trenden er fortsatt nedover.\n\n**Din oppgave:** implementér `train_mini_batch(xs, ys, lr, epochs, batch_size, seed=42)`. Hvert steg: trekk `batch_size` indekser uten erstatning med `rng.sample(range(n), batch_size)`, regn gradient på dette delsettet, oppdater `(w, b)`. Returner `(w, b, loss_history)` der loss_history fortsatt måles på HELE datasettet (så vi kan sammenligne).",
      files: {
        "linreg.py": `import random

xs = [0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0]
ys = [-1.1057, 0.7905, 3.0906, 4.7435, 7.0215, 8.9194, 10.7348, 13.0045, 14.7225, 16.9602]
SANN_W = 2.0
SANN_B = -1.0


def predict(x, w, b):
    return w * x + b


def mse(xs, ys, w, b):
    n = len(xs)
    return sum((predict(x, w, b) - y) ** 2 for x, y in zip(xs, ys)) / n


def gradients_subset(xs, ys, idxs, w, b):
    """Som gradients, men kun over indekser i idxs."""
    k = len(idxs)
    dw = (2.0 / k) * sum((predict(xs[i], w, b) - ys[i]) * xs[i] for i in idxs)
    db = (2.0 / k) * sum((predict(xs[i], w, b) - ys[i]) for i in idxs)
    return dw, db


def train_mini_batch(xs, ys, lr, epochs, batch_size, seed=42):
    """Returner (w, b, loss_history). loss_history måles på hele datasettet."""
    # === DIN OPPGAVE ===
    # rng = random.Random(seed)
    # w, b = 0.0, 0.0
    # n = len(xs)
    # loss_hist = [ mse(xs, ys, w, b) ]
    # gjenta "epochs" ganger:
    #     idxs = rng.sample(range(n), batch_size)
    #     dw, db = gradients_subset(xs, ys, idxs, w, b)
    #     w -= lr * dw
    #     b -= lr * db
    #     loss_hist.append( mse(xs, ys, w, b) )
    # return w, b, loss_hist
    pass


res = train_mini_batch(xs, ys, lr=0.01, epochs=500, batch_size=4)
if res is None:
    print("FEIL: train_mini_batch returnerte None")
else:
    w, b, hist = res
    print(f"Mini-batch (K=4, lr=0.01, 500 epoker): w={w:.4f}, b={b:.4f}")
    print(f"Initial loss: {hist[0]:.4f}, final loss: {hist[-1]:.6f}")

    # Tell antall steg der loss økte (vi forventer noen — det er hele poenget)
    ups = sum(1 for i in range(len(hist) - 1) if hist[i + 1] > hist[i])
    downs = sum(1 for i in range(len(hist) - 1) if hist[i + 1] < hist[i])
    print(f"Steg der loss økte: {ups}, steg der loss sank: {downs}")

    # Test 1: konvergerer fortsatt nær sanne verdier (lempelig: 10% slack)
    err_w = abs(w - SANN_W) / abs(SANN_W)
    err_b = abs(b - SANN_B) / abs(SANN_B)
    if err_w < 0.1 and err_b < 0.1:
        print(f"OK   konvergerer til riktig (w, b) innen 10% (err_w={err_w*100:.2f}%)")
    else:
        print(f"FEIL: ikke konvergert (err_w={err_w*100:.2f}%, err_b={err_b*100:.2f}%)")

    # Test 2: kurven SKAL være bråkete — minst 50 ups blant 500 steg
    if ups >= 50:
        print(f"OK   loss-kurven er noisy ({ups} stigninger blant 500 steg)")
    else:
        print(f"FEIL: forventet >=50 stigninger, fikk {ups}")

    # Test 3: trenden er likevel nedover (final << initial)
    if hist[-1] < hist[0] / 10:
        print("OK   trenden er klart nedover tross støy")
    else:
        print(f"FEIL: forventet final < initial/10")

    # Reproduserbarhet: samme seed skal gi samme resultat
    res2 = train_mini_batch(xs, ys, lr=0.01, epochs=500, batch_size=4, seed=42)
    if res2 is not None:
        w2, b2, _ = res2
        if abs(w2 - w) < 1e-9 and abs(b2 - b) < 1e-9:
            print("OK   reproduserbar med samme seed")
        else:
            print(f"FEIL: seed=42 ga forskjellige resultater")
`,
      },
      defaultFile: "linreg.py",
      editable: ["linreg.py"],
      run: { kind: "python-script", entry: "linreg.py" },
      verifications: [
        { label: "Mini-batch konvergerer nær sanne (w, b)", check: { kind: "output-contains", needle: "OK   konvergerer til riktig (w, b) innen 10%" } },
        { label: "Loss-kurven er noisy (mange lokale stigninger)", check: { kind: "output-contains", needle: "OK   loss-kurven er noisy" } },
        { label: "Trenden er klart nedover tross støy", check: { kind: "output-contains", needle: "OK   trenden er klart nedover" } },
        { label: "Reproduserbar med samme seed", check: { kind: "output-contains", needle: "OK   reproduserbar med samme seed" } },
      ],
      hint:
        "def train_mini_batch(xs, ys, lr, epochs, batch_size, seed=42):\n    rng = random.Random(seed)\n    w, b = 0.0, 0.0\n    n = len(xs)\n    loss_hist = [mse(xs, ys, w, b)]\n    for _ in range(epochs):\n        idxs = rng.sample(range(n), batch_size)\n        dw, db = gradients_subset(xs, ys, idxs, w, b)\n        w -= lr * dw\n        b -= lr * db\n        loss_hist.append(mse(xs, ys, w, b))\n    return w, b, loss_hist",
    },
  ],
};


const DECISION_TREE: MiniCourse = {
  id: "decision-tree",
  slug: "decision-tree",
  title: "Decision tree fra null",
  blurb:
    "Bygg en klassifikasjons-tre-modell trinn for trinn — fra Gini-impurity og vektet split, via finn-beste-split, til rekursiv tre-bygging og ASCII-visualisering. Ingen sklearn; alt er ren Python du selv skriver. Datasett: enkel toy-kundebase (alder, inntekt → kjøper/ikke).",
  estimertTid: "60–75 min",
  fag: ["DTE-2602", "Maskinlæring", "Klassifisering"],
  color: "purple",
  rekkefolge: 20,
  lessons: [
    // ============ LEKSJON 1 ===========================================
    {
      id: "01-gini",
      title: "1. Gini-impurity for en gruppe",
      narrative:
        "Et **decision tree** klassifiserer ved å splitte data i renere og renere grupper. \"Renhet\" måles med **Gini-impurity**:\n\n```\ngini(gruppe) = 1 - sum(p_i^2)\n```\n\nder `p_i` er andelen av klasse `i` i gruppen.\n\n**Intuisjon:**\n- Gruppe der alle har samme klasse → `gini = 0` (perfekt ren).\n- 50/50 binær fordeling → `gini = 0.5` (maks rotete).\n- 75/25 → `gini = 0.375` (mer ensartet enn 50/50).\n\nVi vil senere velge splits som gjør gini i barne-gruppene så lav som mulig. Først må vi kunne måle gini for én gruppe.\n\n**Din oppgave:** implementér `gini(labels)`. `labels` er en liste med klasse-tall (f.eks. `[0, 1, 1, 0, 1]`). Returnér gini som flyttall.\n\n**Tips:** `from collections import Counter` gir deg `Counter(labels).values()` → antall per klasse. Andelen er `antall / n`.",
      files: {
        "tree.py": `from collections import Counter


def gini(labels):
    """1 - sum(p_i^2) der p_i er andelen av klasse i."""
    n = len(labels)
    if n == 0:
        return 0.0
    # === DIN OPPGAVE ===
    # Tell antall per klasse med Counter(labels).
    # For hver klasse: regn andel = antall / n, og legg andel**2 til en sum.
    # Returnér 1 - summen.
    return 0.0


def sjekk_naer(faktisk, forventet, navn, eps=1e-9):
    if abs(faktisk - forventet) < eps:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Rent: alle har samme klasse
sjekk_naer(gini([1, 1, 1, 1]), 0.0, "ren gruppe gir 0")

# 50/50: maks rotete
sjekk_naer(gini([1, 0, 1, 0]), 0.5, "50/50 gir 0.5")

# 75/25 (= 3 av en, 1 av en annen): 1 - (0.75^2 + 0.25^2) = 0.375
sjekk_naer(gini([0, 0, 0, 1]), 0.375, "75/25 gir 0.375")

# Tre klasser, ulik fordeling: [0,0,1,1,2] -> andeler 2/5, 2/5, 1/5
# 1 - (4/25 + 4/25 + 1/25) = 1 - 9/25 = 16/25 = 0.64
sjekk_naer(gini([0, 0, 1, 1, 2]), 0.64, "tre klasser, 2/2/1")

# Tom gruppe -> 0 (allerede håndtert i stuben)
sjekk_naer(gini([]), 0.0, "tom gruppe gir 0")
`,
      },
      defaultFile: "tree.py",
      editable: ["tree.py"],
      run: { kind: "python-script", entry: "tree.py" },
      verifications: [
        {
          label: "Ren gruppe gir gini = 0",
          check: { kind: "output-contains", needle: "OK   ren gruppe gir 0" },
        },
        {
          label: "50/50-split gir gini = 0.5",
          check: { kind: "output-contains", needle: "OK   50/50 gir 0.5" },
        },
        {
          label: "75/25-split gir gini = 0.375",
          check: { kind: "output-contains", needle: "OK   75/25 gir 0.375" },
        },
        {
          label: "Tre klasser regnes riktig",
          check: { kind: "output-contains", needle: "OK   tre klasser, 2/2/1" },
        },
      ],
      hint:
        "n = len(labels)\nif n == 0:\n    return 0.0\nteller = Counter(labels)\nreturn 1.0 - sum((antall / n) ** 2 for antall in teller.values())",
    },

    // ============ LEKSJON 2 ===========================================
    {
      id: "02-weighted-gini",
      title: "2. Vektet gini etter et split",
      narrative:
        "Et **split** deler datasettet i to: en venstre-gruppe `L` og en høyre-gruppe `R`. Vi vil velge splits som gir lav samlet gini — men en stor gruppe teller mer enn en liten. Derfor bruker vi **vektet gini**:\n\n```\nweighted_gini(L, R) = |L|/n * gini(L) + |R|/n * gini(R)\n```\n\nder `n = |L| + |R|`.\n\n**Hvorfor?** Tenk: hvis splittet gir L=99 rotete elementer og R=1 rent element, er det knapt et fremskritt — den vektede gini-en speiler det. En split som gir to like store, rene grupper er ideelt og gir vektet gini = 0.\n\n**Din oppgave:** implementér `weighted_gini(left_labels, right_labels)`. Gjenbruk `gini` fra forrige leksjon — den er allerede definert øverst.",
      files: {
        "tree.py": `from collections import Counter


def gini(labels):
    n = len(labels)
    if n == 0:
        return 0.0
    teller = Counter(labels)
    return 1.0 - sum((antall / n) ** 2 for antall in teller.values())


def weighted_gini(left_labels, right_labels):
    """|L|/n * gini(L) + |R|/n * gini(R)."""
    # === DIN OPPGAVE ===
    # n = len(left) + len(right)
    # Hvis n == 0: returnér 0.0
    # Ellers: regn vektet sum og returnér.
    return 0.0


def sjekk_naer(faktisk, forventet, navn, eps=1e-9):
    if abs(faktisk - forventet) < eps:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Perfekt split: begge gruppene helt rene
sjekk_naer(weighted_gini([1, 1, 1], [0, 0, 0]), 0.0, "perfekt split gir 0")

# Begge gruppene like rotete som før split (ingen vinning)
# L=[1,0], R=[1,0]: gini=0.5 begge, vektet = 0.5
sjekk_naer(weighted_gini([1, 0], [1, 0]), 0.5, "ingen vinning gir 0.5")

# Ubalansert: L=[1,1,1] (gini=0), R=[0,1] (gini=0.5).
# Vektet = 3/5 * 0 + 2/5 * 0.5 = 0.2
sjekk_naer(weighted_gini([1, 1, 1], [0, 1]), 0.2, "ubalansert ren + rotete")

# Tom høyre-gruppe: alt på venstre. Vektet = 1 * gini(L).
# L=[1,0,1,0] -> gini=0.5, vektet=0.5
sjekk_naer(weighted_gini([1, 0, 1, 0], []), 0.5, "tom høyregruppe")
`,
      },
      defaultFile: "tree.py",
      editable: ["tree.py"],
      run: { kind: "python-script", entry: "tree.py" },
      verifications: [
        {
          label: "Perfekt split (begge rene) gir 0",
          check: { kind: "output-contains", needle: "OK   perfekt split gir 0" },
        },
        {
          label: "Split uten vinning gir samme gini som før (0.5)",
          check: { kind: "output-contains", needle: "OK   ingen vinning gir 0.5" },
        },
        {
          label: "Ubalansert split vektes riktig",
          check: { kind: "output-contains", needle: "OK   ubalansert ren + rotete" },
        },
        {
          label: "Tom høyre-gruppe håndteres",
          check: { kind: "output-contains", needle: "OK   tom høyregruppe" },
        },
      ],
      hint:
        "n = len(left_labels) + len(right_labels)\nif n == 0:\n    return 0.0\nreturn (len(left_labels) / n) * gini(left_labels) + (len(right_labels) / n) * gini(right_labels)",
    },

    // ============ LEKSJON 3 ===========================================
    {
      id: "03-best-split-feature",
      title: "3. Beste split for én feature",
      narrative:
        "Nå skal vi prøve alle mulige terskler for én enkelt feature og finne den som gir lavest vektet gini.\n\n**Algoritmen:**\n1. Hent alle unike verdier av feature-en i datasettet, sortert.\n2. For hvert nabopar `(v_i, v_{i+1})`: prøv tersklen `t = (v_i + v_{i+1}) / 2`.\n3. Splitt: venstre = `x[f] < t`, høyre = `x[f] >= t`.\n4. Regn vektet gini. Hold på den tersklen med lavest verdi.\n\n**Hvorfor midt mellom?** Tersklen ligger der ingen punkter er — det gjør prediksjonen entydig for alle treningspunkter. Sklearn gjør det samme.\n\n**Toy-datasett:** `X` er en liste av `[alder, inntekt]`-par. `y` er klasse (1 = kjøper, 0 = ikke). Vi kjøpte når både alder >= 35 OG inntekt >= 500000.\n\n**Din oppgave:** implementér `best_split_for_feature(xs, ys, feature_idx)`. Returnér `(terskel, vektet_gini, andel_til_venstre)` for tersklen som minimerer vektet gini. Returnér `None` hvis ingen split er mulig (alle verdier like).",
      files: {
        "tree.py": `from collections import Counter


def gini(labels):
    n = len(labels)
    if n == 0:
        return 0.0
    teller = Counter(labels)
    return 1.0 - sum((antall / n) ** 2 for antall in teller.values())


def weighted_gini(left_labels, right_labels):
    n = len(left_labels) + len(right_labels)
    if n == 0:
        return 0.0
    return (len(left_labels) / n) * gini(left_labels) + (len(right_labels) / n) * gini(right_labels)


def best_split_for_feature(xs, ys, feature_idx):
    """Returnér (terskel, vektet_gini, andel_venstre) eller None."""
    # === DIN OPPGAVE ===
    # 1. verdier = sortert liste av unike x[feature_idx]
    # 2. Hvis len(verdier) < 2: returnér None
    # 3. For hver i fra 0 til len(verdier)-2:
    #       t = (verdier[i] + verdier[i+1]) / 2
    #       venstre_y = ys hvor xs[j][feature_idx] < t
    #       høyre_y   = ys hvor xs[j][feature_idx] >= t
    #       wg = weighted_gini(venstre_y, høyre_y)
    #       Hold på (t, wg, andel_venstre) hvis wg er lavest så langt.
    # 4. Returnér beste.
    return None


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


def sjekk_naer(faktisk, forventet, navn, eps=1e-6):
    if abs(faktisk - forventet) < eps:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Toy: [alder, inntekt] -> kjoper
X = [
    [25, 300000],
    [28, 350000],
    [30, 600000],
    [32, 700000],
    [40, 520000],
    [45, 600000],
    [50, 700000],
    [55, 800000],
    [38, 350000],
    [42, 400000],
]
y = [0, 0, 0, 0, 1, 1, 1, 1, 0, 0]

# Feature 0 = alder. Beste split bør være rundt 39 (mellom 38 og 40).
resultat_alder = best_split_for_feature(X, y, 0)
sjekk(resultat_alder is not None, True, "alder gir en split")
if resultat_alder is not None:
    t, wg, frac = resultat_alder
    sjekk_naer(t, 39.0, "alder-terskel er 39.0")
    # Med t=39.0: venstre=[25,28,30,32,38] (alle y=0), høyre=[40,45,50,55,42] (4×1, 1×0).
    # gini(venstre)=0, gini(høyre) = 1 - (0.8^2 + 0.2^2) = 0.32, vektet = 0.5*0 + 0.5*0.32 = 0.16
    sjekk_naer(wg, 0.16, "alder-split gir 0.16")

# Feature 1 = inntekt. Beste terskel mellom 400000 og 520000.
# Unike sortert: [300000, 350000, 400000, 520000, 600000, 700000, 800000]
# Beste terskel her er 460000.
resultat_inntekt = best_split_for_feature(X, y, 1)
sjekk(resultat_inntekt is not None, True, "inntekt gir en split")
if resultat_inntekt is not None:
    t, wg, frac = resultat_inntekt
    sjekk_naer(t, 460000.0, "inntekt-terskel er 460000")
`,
      },
      defaultFile: "tree.py",
      editable: ["tree.py"],
      run: { kind: "python-script", entry: "tree.py" },
      verifications: [
        {
          label: "Beste alders-terskel funnet (39.0)",
          check: { kind: "output-contains", needle: "OK   alder-terskel er 39.0" },
        },
        {
          label: "Alder-split har vektet gini 0.16",
          check: { kind: "output-contains", needle: "OK   alder-split gir 0.16" },
        },
        {
          label: "Beste inntekts-terskel funnet (460000)",
          check: { kind: "output-contains", needle: "OK   inntekt-terskel er 460000" },
        },
      ],
      hint:
        "verdier = sorted({x[feature_idx] for x in xs})\nif len(verdier) < 2:\n    return None\nbest = None\nfor i in range(len(verdier) - 1):\n    t = (verdier[i] + verdier[i + 1]) / 2\n    venstre_y = [ys[j] for j, x in enumerate(xs) if x[feature_idx] < t]\n    hoyre_y = [ys[j] for j, x in enumerate(xs) if x[feature_idx] >= t]\n    if not venstre_y or not hoyre_y:\n        continue\n    wg = weighted_gini(venstre_y, hoyre_y)\n    if best is None or wg < best[1]:\n        best = (t, wg, len(venstre_y) / len(xs))\nreturn best",
    },

    // ============ LEKSJON 4 ===========================================
    {
      id: "04-best-split-all",
      title: "4. Beste split over alle features",
      narrative:
        "Nå velger vi den FEATUREN som gir best split — ikke bare den beste tersklen innen én feature.\n\n**Algoritmen:**\n1. For hver feature: kall `best_split_for_feature`.\n2. Sammenlign vektede gini-verdier. Velg den minste.\n3. Returnér `(feature_idx, terskel, vektet_gini)`.\n\nDette er beslutningen treet tar ved hver intern node: \"hvilket spørsmål skal jeg stille for å splitte dataene mest mulig rent?\"\n\nPå toy-datasettet bør alder vinne (vektet gini 0.16) over inntekt (vektet gini høyere).\n\n**Din oppgave:** implementér `best_split(X, ys)`. Returnér `(feature_idx, terskel, gini)`. Returnér `None` hvis ingen feature gir et lovlig split (kan skje hvis alle rader er identiske).",
      files: {
        "tree.py": `from collections import Counter


def gini(labels):
    n = len(labels)
    if n == 0:
        return 0.0
    teller = Counter(labels)
    return 1.0 - sum((antall / n) ** 2 for antall in teller.values())


def weighted_gini(left_labels, right_labels):
    n = len(left_labels) + len(right_labels)
    if n == 0:
        return 0.0
    return (len(left_labels) / n) * gini(left_labels) + (len(right_labels) / n) * gini(right_labels)


def best_split_for_feature(xs, ys, feature_idx):
    verdier = sorted({x[feature_idx] for x in xs})
    if len(verdier) < 2:
        return None
    best = None
    for i in range(len(verdier) - 1):
        t = (verdier[i] + verdier[i + 1]) / 2
        venstre_y = [ys[j] for j, x in enumerate(xs) if x[feature_idx] < t]
        hoyre_y = [ys[j] for j, x in enumerate(xs) if x[feature_idx] >= t]
        if not venstre_y or not hoyre_y:
            continue
        wg = weighted_gini(venstre_y, hoyre_y)
        if best is None or wg < best[1]:
            best = (t, wg, len(venstre_y) / len(xs))
    return best


def best_split(X, ys):
    """Returnér (feature_idx, terskel, vektet_gini) eller None."""
    # === DIN OPPGAVE ===
    # For hver feature_idx i range(len(X[0])):
    #   resultat = best_split_for_feature(X, ys, feature_idx)
    #   hvis None: skip.
    #   Sammenlign resultat[1] (vektet gini). Hold på det laveste.
    # Returnér (feature_idx, terskel, gini) eller None.
    return None


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


def sjekk_naer(faktisk, forventet, navn, eps=1e-6):
    if abs(faktisk - forventet) < eps:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Samme toy-datasett som forrige leksjon
X = [
    [25, 300000],
    [28, 350000],
    [30, 600000],
    [32, 700000],
    [40, 520000],
    [45, 600000],
    [50, 700000],
    [55, 800000],
    [38, 350000],
    [42, 400000],
]
y = [0, 0, 0, 0, 1, 1, 1, 1, 0, 0]

resultat = best_split(X, y)
sjekk(resultat is not None, True, "fant beste split")
if resultat is not None:
    f, t, wg = resultat
    sjekk(f, 0, "alder vinner over inntekt")
    sjekk_naer(t, 39.0, "valgt terskel er 39.0")
    sjekk_naer(wg, 0.16, "valgt vektet gini er 0.16")

# Et opplagt tilfelle: feature 1 har et perfekt split, feature 0 har ingen vinning.
X2 = [[1, 10], [1, 20], [1, 30], [1, 40]]
y2 = [0, 0, 1, 1]
res2 = best_split(X2, y2)
sjekk(res2 is not None, True, "opplagt tilfelle har split")
if res2 is not None:
    f2, t2, wg2 = res2
    sjekk(f2, 1, "feature 1 velges (alder er konstant)")
    sjekk_naer(wg2, 0.0, "perfekt rent split")
`,
      },
      defaultFile: "tree.py",
      editable: ["tree.py"],
      run: { kind: "python-script", entry: "tree.py" },
      verifications: [
        {
          label: "Alder velges som beste feature (vinner over inntekt)",
          check: { kind: "output-contains", needle: "OK   alder vinner over inntekt" },
        },
        {
          label: "Beste terskel er 39.0",
          check: { kind: "output-contains", needle: "OK   valgt terskel er 39.0" },
        },
        {
          label: "Vektet gini for beste split er 0.16",
          check: { kind: "output-contains", needle: "OK   valgt vektet gini er 0.16" },
        },
        {
          label: "Konstant feature ignoreres riktig",
          check: { kind: "output-contains", needle: "OK   feature 1 velges (alder er konstant)" },
        },
        {
          label: "Perfekt rent split får gini 0",
          check: { kind: "output-contains", needle: "OK   perfekt rent split" },
        },
      ],
      hint:
        "best = None\nfor f in range(len(X[0])):\n    r = best_split_for_feature(X, ys, f)\n    if r is None:\n        continue\n    t, wg, _ = r\n    if best is None or wg < best[2]:\n        best = (f, t, wg)\nreturn best",
    },

    // ============ LEKSJON 5 ===========================================
    {
      id: "05-build-tree",
      title: "5. Bygg treet rekursivt",
      narrative:
        "Et **decision tree** er en rekursiv struktur. Hver node er enten:\n- En **leaf** med en prediksjon (`{\"leaf\": True, \"label\": ...}`)\n- En **intern node** med en split: feature + terskel + venstre- og høyre-undertre.\n\nRekursjonen er nesten ord for ord lik backtracking, bare uten backtrack:\n\n```\nbuild_tree(X, ys, depth):\n  hvis ren ELLER for dyp ELLER for liten:\n      returnér leaf med majoritets-label\n  ellers:\n      f, t, _ = best_split(X, ys)\n      del data etter t\n      returnér intern node med build_tree(venstre) og build_tree(høyre)\n```\n\n**Stopp-kriterier (\"stopping rules\"):**\n- Alle labels er like → leaf (kan ikke bli renere).\n- `depth >= max_depth` → leaf (vi nådde maks-dybden).\n- `len(X) < min_split` → leaf (for lite data å splitte trygt).\n\n**Prediksjon:** traverser ned. Hvis `x[feature] < threshold`, gå venstre; ellers høyre. Stopp ved leaf og returnér `label`.\n\n**Din oppgave:** implementér `build_tree(X, ys, depth, max_depth, min_split)` og `predict(tree, x)`.",
      files: {
        "tree.py": `from collections import Counter


def gini(labels):
    n = len(labels)
    if n == 0:
        return 0.0
    teller = Counter(labels)
    return 1.0 - sum((antall / n) ** 2 for antall in teller.values())


def weighted_gini(left_labels, right_labels):
    n = len(left_labels) + len(right_labels)
    if n == 0:
        return 0.0
    return (len(left_labels) / n) * gini(left_labels) + (len(right_labels) / n) * gini(right_labels)


def best_split_for_feature(xs, ys, feature_idx):
    verdier = sorted({x[feature_idx] for x in xs})
    if len(verdier) < 2:
        return None
    best = None
    for i in range(len(verdier) - 1):
        t = (verdier[i] + verdier[i + 1]) / 2
        venstre_y = [ys[j] for j, x in enumerate(xs) if x[feature_idx] < t]
        hoyre_y = [ys[j] for j, x in enumerate(xs) if x[feature_idx] >= t]
        if not venstre_y or not hoyre_y:
            continue
        wg = weighted_gini(venstre_y, hoyre_y)
        if best is None or wg < best[1]:
            best = (t, wg, len(venstre_y) / len(xs))
    return best


def best_split(X, ys):
    best = None
    for f in range(len(X[0])):
        r = best_split_for_feature(X, ys, f)
        if r is None:
            continue
        t, wg, _ = r
        if best is None or wg < best[2]:
            best = (f, t, wg)
    return best


def majoritet(labels):
    return Counter(labels).most_common(1)[0][0]


def build_tree(X, ys, depth=0, max_depth=3, min_split=2):
    """Bygg et tre rekursivt. Returnér en dict-node."""
    # === DIN OPPGAVE ===
    # 1. Stopp-kriterier: hvis len(set(ys)) == 1 OR depth >= max_depth OR len(X) < min_split:
    #       returnér {"leaf": True, "label": majoritet(ys)}
    # 2. Ellers: split = best_split(X, ys)
    #       hvis split is None: returnér leaf med majoritets-label
    #       ellers: del X og ys i venstre/høyre etter (f, t)
    #       returnér {"leaf": False, "feature": f, "threshold": t,
    #                 "left": build_tree(...), "right": build_tree(...)}
    return {"leaf": True, "label": 0}


def predict(tree, x):
    """Traverser treet. Returnér label."""
    # === DIN OPPGAVE ===
    # Hvis tree["leaf"]: returnér tree["label"]
    # Ellers: hvis x[tree["feature"]] < tree["threshold"]: gå venstre, ellers høyre.
    return 0


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Toy datasett: kjoper = (alder >= 35 AND inntekt >= 500000)
X = [
    [25, 300000],
    [28, 350000],
    [30, 600000],
    [32, 700000],
    [40, 520000],
    [45, 600000],
    [50, 700000],
    [55, 800000],
    [38, 350000],
    [42, 400000],
]
y = [0, 0, 0, 0, 1, 1, 1, 1, 0, 0]

tre = build_tree(X, y, max_depth=3)

# Treet skal være en intern node (ikke leaf)
sjekk(tre["leaf"], False, "rota er intern node")

# Sjekk at predict klassifiserer alle treningspunkter riktig
treff = sum(1 for xi, yi in zip(X, y) if predict(tre, xi) == yi)
sjekk(treff, 10, "alle 10 treningspunkter klassifiseres riktig")

# Sjekk noen kjente prediksjoner
sjekk(predict(tre, [25, 300000]), 0, "ung+lav -> ikke kjoper")
sjekk(predict(tre, [50, 700000]), 1, "eldre+hoy -> kjoper")
sjekk(predict(tre, [42, 400000]), 0, "eldre+lav -> ikke kjoper")
sjekk(predict(tre, [30, 700000]), 0, "ung+hoy -> ikke kjoper")
`,
      },
      defaultFile: "tree.py",
      editable: ["tree.py"],
      run: { kind: "python-script", entry: "tree.py" },
      verifications: [
        {
          label: "Rota er en intern node (ikke leaf)",
          check: { kind: "output-contains", needle: "OK   rota er intern node" },
        },
        {
          label: "Alle 10 treningspunkter klassifiseres riktig",
          check: { kind: "output-contains", needle: "OK   alle 10 treningspunkter klassifiseres riktig" },
        },
        {
          label: "Ung + lav inntekt klassifiseres som ikke-kjøper",
          check: { kind: "output-contains", needle: "OK   ung+lav -> ikke kjoper" },
        },
        {
          label: "Eldre + høy inntekt klassifiseres som kjøper",
          check: { kind: "output-contains", needle: "OK   eldre+hoy -> kjoper" },
        },
        {
          label: "Eldre + lav inntekt klassifiseres som ikke-kjøper",
          check: { kind: "output-contains", needle: "OK   eldre+lav -> ikke kjoper" },
        },
        {
          label: "Ung + høy inntekt klassifiseres som ikke-kjøper",
          check: { kind: "output-contains", needle: "OK   ung+hoy -> ikke kjoper" },
        },
      ],
      hint:
        "def build_tree(X, ys, depth=0, max_depth=3, min_split=2):\n    if len(set(ys)) == 1 or depth >= max_depth or len(X) < min_split:\n        return {\"leaf\": True, \"label\": majoritet(ys)}\n    split = best_split(X, ys)\n    if split is None:\n        return {\"leaf\": True, \"label\": majoritet(ys)}\n    f, t, _ = split\n    venstre_X = [x for x in X if x[f] < t]\n    venstre_y = [ys[i] for i, x in enumerate(X) if x[f] < t]\n    hoyre_X = [x for x in X if x[f] >= t]\n    hoyre_y = [ys[i] for i, x in enumerate(X) if x[f] >= t]\n    return {\n        \"leaf\": False,\n        \"feature\": f,\n        \"threshold\": t,\n        \"left\": build_tree(venstre_X, venstre_y, depth + 1, max_depth, min_split),\n        \"right\": build_tree(hoyre_X, hoyre_y, depth + 1, max_depth, min_split),\n    }\n\ndef predict(tree, x):\n    if tree[\"leaf\"]:\n        return tree[\"label\"]\n    if x[tree[\"feature\"]] < tree[\"threshold\"]:\n        return predict(tree[\"left\"], x)\n    return predict(tree[\"right\"], x)",
    },

    // ============ LEKSJON 6 ===========================================
    {
      id: "06-print-tree-depth",
      title: "6. ASCII-visualisering + max_depth-effekt",
      narrative:
        "Et tre er bare en datastruktur, men det er enklere å forstå hva modellen \"tenker\" hvis vi kan **printe** det.\n\nVi vil ha et format som dette:\n\n```\nalder < 39.0?\n  JA:\n    -> klasse=0\n  NEI:\n    inntekt < 460000.0?\n      JA:\n        -> klasse=0\n      NEI:\n        -> klasse=1\n```\n\nDette gjør det også mulig å se **overfit**-faren. Et veldig dypt tre kan ha en leaf for hvert treningspunkt og dermed gi 0 treningsfeil — men da har det \"lært\" støy. Ved å variere `max_depth` kan vi se hvor mye av modellens treffsikkerhet som faktisk er meningsfull struktur.\n\nPå vårt toy-datasett:\n- `max_depth=1`: bare ett split (alder < 39) → noen feilklassifiseringer.\n- `max_depth=2`: alder først, deretter inntekt → 0 feil.\n- `max_depth=3`: like bra som depth=2 (treet stopper på rene noder uansett).\n\n**Din oppgave:** implementér `print_tree(tree, indent=0)` rekursivt. Bruk `FEATURE_NAMES` for å printe navn istedenfor index.",
      files: {
        "tree.py": `from collections import Counter


def gini(labels):
    n = len(labels)
    if n == 0:
        return 0.0
    teller = Counter(labels)
    return 1.0 - sum((antall / n) ** 2 for antall in teller.values())


def weighted_gini(left_labels, right_labels):
    n = len(left_labels) + len(right_labels)
    if n == 0:
        return 0.0
    return (len(left_labels) / n) * gini(left_labels) + (len(right_labels) / n) * gini(right_labels)


def best_split_for_feature(xs, ys, feature_idx):
    verdier = sorted({x[feature_idx] for x in xs})
    if len(verdier) < 2:
        return None
    best = None
    for i in range(len(verdier) - 1):
        t = (verdier[i] + verdier[i + 1]) / 2
        venstre_y = [ys[j] for j, x in enumerate(xs) if x[feature_idx] < t]
        hoyre_y = [ys[j] for j, x in enumerate(xs) if x[feature_idx] >= t]
        if not venstre_y or not hoyre_y:
            continue
        wg = weighted_gini(venstre_y, hoyre_y)
        if best is None or wg < best[1]:
            best = (t, wg, len(venstre_y) / len(xs))
    return best


def best_split(X, ys):
    best = None
    for f in range(len(X[0])):
        r = best_split_for_feature(X, ys, f)
        if r is None:
            continue
        t, wg, _ = r
        if best is None or wg < best[2]:
            best = (f, t, wg)
    return best


def majoritet(labels):
    return Counter(labels).most_common(1)[0][0]


def build_tree(X, ys, depth=0, max_depth=3, min_split=2):
    if len(set(ys)) == 1 or depth >= max_depth or len(X) < min_split:
        return {"leaf": True, "label": majoritet(ys)}
    split = best_split(X, ys)
    if split is None:
        return {"leaf": True, "label": majoritet(ys)}
    f, t, _ = split
    venstre_X = [x for x in X if x[f] < t]
    venstre_y = [ys[i] for i, x in enumerate(X) if x[f] < t]
    hoyre_X = [x for x in X if x[f] >= t]
    hoyre_y = [ys[i] for i, x in enumerate(X) if x[f] >= t]
    return {
        "leaf": False, "feature": f, "threshold": t,
        "left": build_tree(venstre_X, venstre_y, depth + 1, max_depth, min_split),
        "right": build_tree(hoyre_X, hoyre_y, depth + 1, max_depth, min_split),
    }


def predict(tree, x):
    if tree["leaf"]:
        return tree["label"]
    if x[tree["feature"]] < tree["threshold"]:
        return predict(tree["left"], x)
    return predict(tree["right"], x)


FEATURE_NAMES = ["alder", "inntekt"]


def print_tree(tree, indent=0):
    """Print treet rekursivt med innrykk."""
    pad = "  " * indent
    # === DIN OPPGAVE ===
    # Hvis leaf: print f"{pad}-> klasse={label}"
    # Ellers:
    #   print f"{pad}{FEATURE_NAMES[feature]} < {threshold}?"
    #   print f"{pad}  JA:"
    #   print_tree(left, indent + 2)
    #   print f"{pad}  NEI:"
    #   print_tree(right, indent + 2)
    pass


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Toy datasett
X = [
    [25, 300000],
    [28, 350000],
    [30, 600000],
    [32, 700000],
    [40, 520000],
    [45, 600000],
    [50, 700000],
    [55, 800000],
    [38, 350000],
    [42, 400000],
]
y = [0, 0, 0, 0, 1, 1, 1, 1, 0, 0]


def treningsfeil(tre, X, y):
    return sum(1 for xi, yi in zip(X, y) if predict(tre, xi) != yi)


# Tren tre for ulike max_depth og print
for md in [1, 2, 3]:
    tre = build_tree(X, y, max_depth=md)
    errs = treningsfeil(tre, X, y)
    print()
    print(f"--- max_depth={md} ({errs}/10 treningsfeil) ---")
    print_tree(tre)


# Verifikasjoner
tre1 = build_tree(X, y, max_depth=1)
tre2 = build_tree(X, y, max_depth=2)
tre3 = build_tree(X, y, max_depth=3)
sjekk(treningsfeil(tre1, X, y), 1, "depth=1 gir 1 treningsfeil")
sjekk(treningsfeil(tre2, X, y), 0, "depth=2 gir 0 treningsfeil")
sjekk(treningsfeil(tre3, X, y), 0, "depth=3 gir 0 treningsfeil")

# Print-output må ha både "alder" og "inntekt" når depth=2 (skal forgrene på begge)
import io, sys
buf = io.StringIO()
gammel = sys.stdout
sys.stdout = buf
print_tree(tre2)
sys.stdout = gammel
output = buf.getvalue()
sjekk("alder" in output, True, "viz nevner alder")
sjekk("inntekt" in output, True, "viz nevner inntekt")
sjekk("klasse=" in output, True, "viz nevner klasse=")
`,
      },
      defaultFile: "tree.py",
      editable: ["tree.py"],
      run: { kind: "python-script", entry: "tree.py" },
      verifications: [
        {
          label: "max_depth=1 gir 1 treningsfeil (single split)",
          check: { kind: "output-contains", needle: "OK   depth=1 gir 1 treningsfeil" },
        },
        {
          label: "max_depth=2 gir 0 treningsfeil",
          check: { kind: "output-contains", needle: "OK   depth=2 gir 0 treningsfeil" },
        },
        {
          label: "max_depth=3 gir 0 treningsfeil",
          check: { kind: "output-contains", needle: "OK   depth=3 gir 0 treningsfeil" },
        },
        {
          label: "Visualiseringen nevner 'alder'",
          check: { kind: "output-contains", needle: "OK   viz nevner alder" },
        },
        {
          label: "Visualiseringen nevner 'inntekt'",
          check: { kind: "output-contains", needle: "OK   viz nevner inntekt" },
        },
        {
          label: "Visualiseringen viser klasse-etikett ved leaves",
          check: { kind: "output-contains", needle: "OK   viz nevner klasse=" },
        },
      ],
      hint:
        "pad = \"  \" * indent\nif tree[\"leaf\"]:\n    print(f\"{pad}-> klasse={tree['label']}\")\nelse:\n    navn = FEATURE_NAMES[tree[\"feature\"]]\n    print(f\"{pad}{navn} < {tree['threshold']}?\")\n    print(f\"{pad}  JA:\")\n    print_tree(tree[\"left\"], indent + 2)\n    print(f\"{pad}  NEI:\")\n    print_tree(tree[\"right\"], indent + 2)",
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
  PROSESS_SCHEDULER,
  FREE_LIST_MALLOC,
  LINREG_GD,
  DECISION_TREE,
];

export function getMiniCourse(slug: string): MiniCourse | undefined {
  return MINI_COURSES.find((c) => c.slug === slug);
}
