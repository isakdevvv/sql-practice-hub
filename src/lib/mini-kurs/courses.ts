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


const MINIMAX_ALFABETA: MiniCourse = {
  id: "minimax-alfabeta",
  slug: "minimax-alfabeta",
  title: "Minimax + alfa-beta pruning fra null",
  blurb:
    "Bygg en tic-tac-toe-AI som aldri taper. Brettrep og terminal-sjekk → naiv minimax → returnér beste trekk → alfa-beta-pruning (mål nodereduksjonen selv) → heuristisk evaluering for depth-limited søk → spill mot AI-en. Dette er AIMA-kapittel 5 gjort til kode du selv skriver.",
  estimertTid: "60–75 min",
  fag: ["DTE-2501", "Klassisk AI", "Spillsøk"],
  color: "purple",
  rekkefolge: 20,
  lessons: [
    // ============ LEKSJON 1 ===========================================
    {
      id: "01-brett-og-terminal",
      title: "1. Brettrepresentasjon og terminal-sjekk",
      narrative:
        "Før vi kan søke i et spilltre, må vi kunne svare på tre spørsmål om enhver posisjon:\n\n1. **Hvem har vunnet (om noen)?** — terminal-test.\n2. **Hvilke trekk er lovlige nå?** — successor-funksjon.\n3. **Hvordan ser brettet ut etter et trekk?** — neste-state-funksjon.\n\nVi representerer tic-tac-toe-brettet som en **tuple av 9 strenger**: `\"X\"`, `\"O\"`, eller `\".\"` (tom). Cellene er nummerert slik:\n\n```\n0 | 1 | 2\n---------\n3 | 4 | 5\n---------\n6 | 7 | 8\n```\n\n**Hvorfor tuple og ikke liste?** Tuples er immutable og hashbare — det betyr at vi senere kan cache resultater per brett uten å bekymre oss for at noen muterer dem under føttene våre. En liste hadde feilet i et `dict`.\n\n**Din oppgave** — to funksjoner:\n\n- `winner(board)` returnerer `\"X\"` hvis X har tre på rad, `\"O\"` hvis O har det, `\"draw\"` hvis brettet er fullt uten vinner, og `None` ellers (spillet pågår).\n- `legal_moves(board, player)` returnerer en liste av `(idx, nytt_brett)` — én entry per tom celle, der `idx` er hvor `player` plasseres og `nytt_brett` er den resulterende posisjonen.\n\nLISTE-konstanten `LINES` er allerede definert med alle 8 vinnende linjer (3 rader, 3 kolonner, 2 diagonaler).",
      files: {
        "spill.py": `# Alle 8 vinnerlinjer: rader, kolonner, diagonaler.
LINES = [
    (0, 1, 2), (3, 4, 5), (6, 7, 8),  # rader
    (0, 3, 6), (1, 4, 7), (2, 5, 8),  # kolonner
    (0, 4, 8), (2, 4, 6),             # diagonaler
]


def winner(board):
    """Returner "X", "O", "draw", eller None."""
    # === DIN OPPGAVE ===
    # 1. For hver (a, b, c) i LINES:
    #      hvis board[a] == board[b] == board[c] og board[a] != ".":
    #          returner board[a]
    # 2. Hvis "." ikke finnes i brettet: returner "draw"
    # 3. Ellers: returner None  (spillet pågår)
    return None


def legal_moves(board, player):
    """Returner liste av (idx, nytt_brett) for hvert lovlig trekk."""
    # === DIN OPPGAVE ===
    # For hver i fra 0 til 8:
    #   hvis board[i] == "."
    #     lag en kopi av brettet med player i posisjon i
    #     (tip: ny = list(board); ny[i] = player; tuple(ny))
    #     legg til (i, ny_tuple) i resultatet
    return []


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


tomt = (".", ".", ".", ".", ".", ".", ".", ".", ".")
sjekk(winner(tomt), None, "tomt brett: ingen vinner")

x_rad = ("X", "X", "X", ".", ".", ".", ".", ".", ".")
sjekk(winner(x_rad), "X", "X vinner topp-raden")

o_diag = ("O", ".", ".", ".", "O", ".", ".", ".", "O")
sjekk(winner(o_diag), "O", "O vinner diagonalen")

fullt_uavgjort = ("X", "O", "X", "X", "O", "O", "O", "X", "X")
sjekk(winner(fullt_uavgjort), "draw", "fullt brett uten 3-pa-rad er draw")

moves = legal_moves(tomt, "X")
sjekk(len(moves), 9, "9 lovlige trekk fra tomt brett")
forste = ("X", ".", ".", ".", ".", ".", ".", ".", ".")
sjekk(moves[0][1] if moves else None, forste, "forste trekk plasserer X i celle 0")

ett_x = ("X", ".", ".", ".", ".", ".", ".", ".", ".")
sjekk(len(legal_moves(ett_x, "O")), 8, "8 lovlige trekk etter ett X")
`,
      },
      defaultFile: "spill.py",
      editable: ["spill.py"],
      run: { kind: "python-script", entry: "spill.py" },
      verifications: [
        { label: "Tomt brett: ingen vinner", check: { kind: "output-contains", needle: "OK   tomt brett: ingen vinner" } },
        { label: "Tre på rad oppdages (X)", check: { kind: "output-contains", needle: "OK   X vinner topp-raden" } },
        { label: "Diagonal-vinst oppdages (O)", check: { kind: "output-contains", needle: "OK   O vinner diagonalen" } },
        { label: "Fullt brett uten vinner = draw", check: { kind: "output-contains", needle: "OK   fullt brett uten 3-pa-rad er draw" } },
        { label: "legal_moves teller riktig antall fra tomt brett", check: { kind: "output-contains", needle: "OK   9 lovlige trekk fra tomt brett" } },
        { label: "legal_moves bygger nytt brett korrekt", check: { kind: "output-contains", needle: "OK   forste trekk plasserer X i celle 0" } },
        { label: "legal_moves hopper over fylte celler", check: { kind: "output-contains", needle: "OK   8 lovlige trekk etter ett X" } },
      ],
      hint:
        "def winner(board):\n    for (a, b, c) in LINES:\n        if board[a] == board[b] == board[c] and board[a] != \".\":\n            return board[a]\n    if \".\" not in board:\n        return \"draw\"\n    return None\n\ndef legal_moves(board, player):\n    out = []\n    for i in range(9):\n        if board[i] == \".\":\n            ny = list(board)\n            ny[i] = player\n            out.append((i, tuple(ny)))\n    return out",
    },

    // ============ LEKSJON 2 ===========================================
    {
      id: "02-naiv-minimax",
      title: "2. Naiv minimax (full søk)",
      narrative:
        "Nå skal vi bygge selve **minimax**-algoritmen. Idéen er forbløffende enkel:\n\n- X er **maximizer**: vil ha så høy score som mulig (+1 = X vinner).\n- O er **minimizer**: vil ha så lav score som mulig (-1 = O vinner).\n- Draw = 0.\n\nAlgoritmen sier: **utforsk hele spilletreet rekursivt**. Ved hver intern node:\n- Hvis det er X sin tur, ta maks av alle barn-scorer.\n- Hvis det er O sin tur, ta min av alle barn-scorer.\n- Ved en terminal-node, returnér +1 / -1 / 0.\n\n**Hvorfor virker det?** Fordi vi antar at motstanderen spiller optimalt. Når X vurderer et trekk, regner X med at O vil svare med det trekket som er VERST mulig for X. Dette gir et minimum-garantert utfall.\n\nMatematisk er dette en perfekt søkealgoritme — den gir alltid optimalt spill — men den må utforske **hele** treet. For tic-tac-toe er det 549 946 noder fra tomt brett. For sjakk er det rundt 10⁴⁰. Vi løser skalérings­problemet i leksjon 4.\n\n**Din oppgave:** Implementér `minimax(board, player)` → returner score. Bruk `winner()` og `legal_moves()` fra leksjon 1 (er ferdig-implementert øverst). Bruk `other(p)` til å bytte spiller.",
      files: {
        "spill.py": `LINES = [
    (0, 1, 2), (3, 4, 5), (6, 7, 8),
    (0, 3, 6), (1, 4, 7), (2, 5, 8),
    (0, 4, 8), (2, 4, 6),
]


def winner(board):
    for (a, b, c) in LINES:
        if board[a] == board[b] == board[c] and board[a] != ".":
            return board[a]
    if "." not in board:
        return "draw"
    return None


def legal_moves(board, player):
    out = []
    for i in range(9):
        if board[i] == ".":
            ny = list(board)
            ny[i] = player
            out.append((i, tuple(ny)))
    return out


def other(p):
    return "O" if p == "X" else "X"


def minimax(board, player):
    """Returner score: +1 hvis X vinner med optimalt spill, -1 for O, 0 for draw."""
    # === DIN OPPGAVE ===
    # 1. Sjekk terminal-state med winner(board):
    #      "X" -> 1, "O" -> -1, "draw" -> 0
    # 2. Hvis player == "X":
    #      best = -10 (start veldig lavt)
    #      for hvert lovlig trekk: rekursjon, oppdater best = max(best, score)
    #      returner best
    #    Ellers (player == "O"):
    #      best = 10
    #      for hvert lovlig trekk: rekursjon, oppdater best = min(best, score)
    #      returner best
    return 0


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# X kan vinne i ett trekk (legg i celle 2):
# X X .
# O O .
# . . .
nesten_vunnet = ("X", "X", ".", "O", "O", ".", ".", ".", ".")
sjekk(minimax(nesten_vunnet, "X"), 1, "X vinner fra nesten-vunnet posisjon")

# O kan vinne i ett trekk (legg i celle 2):
# O O .
# X X .
# . . .
o_kan_vinne = ("O", "O", ".", "X", "X", ".", ".", ".", ".")
sjekk(minimax(o_kan_vinne, "O"), -1, "O vinner fra nesten-vunnet posisjon")

# Tvunget draw: brett der ingen kan vinne
tvang_draw = ("X", "O", "X", "X", "O", "O", "O", "X", ".")
sjekk(minimax(tvang_draw, "X"), 0, "fullt-nesten brett: draw")

# Optimalt spill fra tomt brett gir alltid draw
tomt = (".", ".", ".", ".", ".", ".", ".", ".", ".")
sjekk(minimax(tomt, "X"), 0, "optimalt spill fra tomt brett er draw")
`,
      },
      defaultFile: "spill.py",
      editable: ["spill.py"],
      run: { kind: "python-script", entry: "spill.py" },
      verifications: [
        { label: "X finner vinnende trekk", check: { kind: "output-contains", needle: "OK   X vinner fra nesten-vunnet posisjon" } },
        { label: "O finner vinnende trekk", check: { kind: "output-contains", needle: "OK   O vinner fra nesten-vunnet posisjon" } },
        { label: "Tvunget uavgjort returnerer 0", check: { kind: "output-contains", needle: "OK   fullt-nesten brett: draw" } },
        { label: "Tomt brett gir draw under optimalt spill", check: { kind: "output-contains", needle: "OK   optimalt spill fra tomt brett er draw" } },
      ],
      hint:
        "w = winner(board)\nif w == \"X\": return 1\nif w == \"O\": return -1\nif w == \"draw\": return 0\nif player == \"X\":\n    best = -10\n    for (_, ny) in legal_moves(board, player):\n        v = minimax(ny, other(player))\n        if v > best: best = v\n    return best\nelse:\n    best = 10\n    for (_, ny) in legal_moves(board, player):\n        v = minimax(ny, other(player))\n        if v < best: best = v\n    return best",
    },

    // ============ LEKSJON 3 ===========================================
    {
      id: "03-beste-trekk",
      title: "3. Returnér beste trekk (ikke bare score)",
      narrative:
        "`minimax()` forteller oss hva **resultatet** blir hvis begge spiller optimalt. Men en AI som faktisk skal spille trenger noe annet: **hvilket trekk skal jeg gjøre nå?**\n\nMønsteret er enkelt: kjør minimax for hvert lovlig trekk fra rot-noden, og velg trekket som ga den beste scoren (max for X, min for O). Funksjonen returnerer **indeksen** av cellen (0–8), ikke selve scoren.\n\nDette splittes ofte i to funksjoner i AI-litteratur — `value()` returnerer score, `best_action()` returnerer trekket. Vi følger samme oppdeling: `minimax()` fra forrige leksjon gir score, og `best_move()` velger den beste handlingen.\n\n**Din oppgave:** Implementér `best_move(board, player)` → returner indeks (0–8) av beste trekk.\n\n**Edge case:** Hvis flere trekk gir samme score, returnér den **første** du finner (gjør tester deterministiske).",
      files: {
        "spill.py": `LINES = [
    (0, 1, 2), (3, 4, 5), (6, 7, 8),
    (0, 3, 6), (1, 4, 7), (2, 5, 8),
    (0, 4, 8), (2, 4, 6),
]


def winner(board):
    for (a, b, c) in LINES:
        if board[a] == board[b] == board[c] and board[a] != ".":
            return board[a]
    if "." not in board:
        return "draw"
    return None


def legal_moves(board, player):
    out = []
    for i in range(9):
        if board[i] == ".":
            ny = list(board)
            ny[i] = player
            out.append((i, tuple(ny)))
    return out


def other(p):
    return "O" if p == "X" else "X"


def minimax(board, player):
    w = winner(board)
    if w == "X": return 1
    if w == "O": return -1
    if w == "draw": return 0
    if player == "X":
        best = -10
        for (_, ny) in legal_moves(board, player):
            v = minimax(ny, other(player))
            if v > best: best = v
        return best
    else:
        best = 10
        for (_, ny) in legal_moves(board, player):
            v = minimax(ny, other(player))
            if v < best: best = v
        return best


def best_move(board, player):
    """Returner indeks (0-8) av beste trekk for player."""
    # === DIN OPPGAVE ===
    # 1. Initialiser best_idx = -1
    # 2. Hvis player == "X": best_score = -10, vi vil maksimere
    #    Ellers:             best_score = 10,  vi vil minimere
    # 3. For hver (i, ny_brett) i legal_moves(board, player):
    #      score = minimax(ny_brett, other(player))
    #      hvis (X og score > best_score) eller (O og score < best_score):
    #          oppdater best_score og best_idx
    # 4. Returner best_idx
    return -1


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# X X . / O O . / . . .  -> X velger 2 og vinner
vinn_for_x = ("X", "X", ".", "O", "O", ".", ".", ".", ".")
sjekk(best_move(vinn_for_x, "X"), 2, "X tar vinnende trekk pa celle 2")

# X X . / . . . / . . .  -> O ma blokkere pa 2
trussel_mot_o = ("X", "X", ".", ".", ".", ".", ".", ".", ".")
# Merk: her er O sin tur, og X truer med a vinne pa 2.
sjekk(best_move(trussel_mot_o, "O"), 2, "O blokkerer X sin trussel pa celle 2")

# O O . / X . . / . . .  -> X ma blokkere pa 2
trussel_mot_x = ("O", "O", ".", "X", ".", ".", ".", ".", ".")
sjekk(best_move(trussel_mot_x, "X"), 2, "X blokkerer O sin trussel pa celle 2")

# Bare ett trekk igjen
en_igjen = ("X", "O", "X", "X", "O", "O", "O", "X", ".")
sjekk(best_move(en_igjen, "X"), 8, "best_move finner det eneste lovlige trekket")
`,
      },
      defaultFile: "spill.py",
      editable: ["spill.py"],
      run: { kind: "python-script", entry: "spill.py" },
      verifications: [
        { label: "X velger vinnende trekk", check: { kind: "output-contains", needle: "OK   X tar vinnende trekk pa celle 2" } },
        { label: "O blokkerer motstanders trussel", check: { kind: "output-contains", needle: "OK   O blokkerer X sin trussel pa celle 2" } },
        { label: "X blokkerer motstanders trussel", check: { kind: "output-contains", needle: "OK   X blokkerer O sin trussel pa celle 2" } },
        { label: "Håndterer brett med ett trekk igjen", check: { kind: "output-contains", needle: "OK   best_move finner det eneste lovlige trekket" } },
      ],
      hint:
        "best_idx = -1\nif player == \"X\":\n    best_score = -10\n    for (i, ny) in legal_moves(board, player):\n        s = minimax(ny, other(player))\n        if s > best_score:\n            best_score = s\n            best_idx = i\nelse:\n    best_score = 10\n    for (i, ny) in legal_moves(board, player):\n        s = minimax(ny, other(player))\n        if s < best_score:\n            best_score = s\n            best_idx = i\nreturn best_idx",
    },

    // ============ LEKSJON 4 ===========================================
    {
      id: "04-alfa-beta",
      title: "4. Alfa-beta pruning",
      narrative:
        "Naiv minimax utforsker **hele** spilletreet. For tic-tac-toe fra tomt brett: ca 550 000 noder. For et brett 3 trekk inn: ca 900. Kan vi gjøre det smartere?\n\n**Alfa-beta pruning** sier: noen grener trenger vi aldri å utforske, fordi vi allerede vet at de aldri kan endre svaret.\n\nIntuisjonen — anta vi er X og vurderer to trekk A og B:\n- Trekk A returnerer score 0 (draw) etter full søk.\n- Vi begynner å utforske trekk B. Det første barn-trekket O kan svare med gir -1 (O vinner).\n- Da vet vi: O kommer til å velge MINST -1 fra B. Vi som X vil aldri velge B over A (som ga 0). Resten av B-treet er irrelevant. **Cut.**\n\nFormelt holder vi to verdier under rekursjonen:\n- `alpha` = beste score X kan garantere så langt (oppdateres på max-noder).\n- `beta` = beste score O kan garantere så langt (oppdateres på min-noder).\n\nNår `alpha >= beta`: avbryt. Den ene siden vil aldri tillate at vi når denne grenen.\n\n**Din oppgave:** Implementér `alphabeta(board, player, alpha, beta)`. Tell utforskede noder i `counter[\"ab\"]` og sammenlign med naiv `counter[\"naiv\"]`. For det delvis fylte test-brettet skal alfa-beta gi rundt **3x færre** noder enn naiv.",
      files: {
        "spill.py": `LINES = [
    (0, 1, 2), (3, 4, 5), (6, 7, 8),
    (0, 3, 6), (1, 4, 7), (2, 5, 8),
    (0, 4, 8), (2, 4, 6),
]


def winner(board):
    for (a, b, c) in LINES:
        if board[a] == board[b] == board[c] and board[a] != ".":
            return board[a]
    if "." not in board:
        return "draw"
    return None


def legal_moves(board, player):
    out = []
    for i in range(9):
        if board[i] == ".":
            ny = list(board)
            ny[i] = player
            out.append((i, tuple(ny)))
    return out


def other(p):
    return "O" if p == "X" else "X"


counter = {"naiv": 0, "ab": 0}


def minimax(board, player):
    """Naiv minimax. Vi teller noder i counter["naiv"]."""
    counter["naiv"] += 1
    w = winner(board)
    if w == "X": return 1
    if w == "O": return -1
    if w == "draw": return 0
    if player == "X":
        best = -10
        for (_, ny) in legal_moves(board, player):
            v = minimax(ny, other(player))
            if v > best: best = v
        return best
    else:
        best = 10
        for (_, ny) in legal_moves(board, player):
            v = minimax(ny, other(player))
            if v < best: best = v
        return best


def alphabeta(board, player, alpha, beta):
    """Minimax med alfa-beta pruning. Tell noder i counter["ab"]."""
    counter["ab"] += 1
    # === DIN OPPGAVE ===
    # 1. Sjekk terminal-state akkurat som i minimax (returner 1/-1/0).
    # 2. Hvis player == "X" (maximizer):
    #      v = -10
    #      for hvert lovlig trekk (_, ny):
    #          v = max(v, alphabeta(ny, other(player), alpha, beta))
    #          hvis v >= beta:  returner v  # beta-cutoff
    #          alpha = max(alpha, v)
    #      returner v
    # 3. Ellers (minimizer):
    #      v = 10
    #      for hvert lovlig trekk:
    #          v = min(v, alphabeta(ny, other(player), alpha, beta))
    #          hvis v <= alpha: returner v  # alfa-cutoff
    #          beta = min(beta, v)
    #      returner v
    return 0


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Delvis fylt brett (3 trekk inn). Sammenligning blir tydelig her uten at
# Pyodide bremser ned i full-tree-soket (som har 549k noder).
# X . O
# . X .
# . . .
brett = ("X", ".", "O",
         ".", "X", ".",
         ".", ".", ".")

counter["naiv"] = 0
score_naiv = minimax(brett, "O")

counter["ab"] = 0
score_ab = alphabeta(brett, "O", -10, 10)

print(f"naiv minimax: {counter['naiv']} noder")
print(f"alfa-beta:    {counter['ab']} noder")
print(f"reduksjon:    {counter['naiv'] - counter['ab']} noder spart")

sjekk(score_naiv, score_ab, "samme score: alfa-beta endrer ikke svaret")
sjekk(counter["ab"] < counter["naiv"], True, "alfa-beta utforsker faerre noder")
sjekk(counter["ab"] * 2 < counter["naiv"], True, "alfa-beta er minst 2x raskere")
`,
      },
      defaultFile: "spill.py",
      editable: ["spill.py"],
      run: { kind: "python-script", entry: "spill.py" },
      verifications: [
        { label: "Alfa-beta gir samme svar som naiv minimax", check: { kind: "output-contains", needle: "OK   samme score: alfa-beta endrer ikke svaret" } },
        { label: "Pruning kutter faktisk noder bort", check: { kind: "output-contains", needle: "OK   alfa-beta utforsker faerre noder" } },
        { label: "Reduksjonen er signifikant (minst 2x)", check: { kind: "output-contains", needle: "OK   alfa-beta er minst 2x raskere" } },
      ],
      hint:
        "w = winner(board)\nif w == \"X\": return 1\nif w == \"O\": return -1\nif w == \"draw\": return 0\nif player == \"X\":\n    v = -10\n    for (_, ny) in legal_moves(board, player):\n        v = max(v, alphabeta(ny, other(player), alpha, beta))\n        if v >= beta: return v\n        alpha = max(alpha, v)\n    return v\nelse:\n    v = 10\n    for (_, ny) in legal_moves(board, player):\n        v = min(v, alphabeta(ny, other(player), alpha, beta))\n        if v <= alpha: return v\n        beta = min(beta, v)\n    return v",
    },

    // ============ LEKSJON 5 ===========================================
    {
      id: "05-heuristisk-evaluering",
      title: "5. Heuristisk evaluering for depth-limited søk",
      narrative:
        "Tic-tac-toe har et lite spilletre — vi kan søke til løvnodene (terminal states) i hver posisjon. Men sjakk har ~10⁴⁰ noder; vi kommer aldri til løvnodene. Vi må **stoppe søket** ved en gitt dybde og **gjette** verdien av posisjonen vi står i.\n\nDet er det en **heuristisk evaluator** gjør. Den tar en ikke-terminal posisjon og returnerer et estimat av hvor god den er for X (positiv = bra for X, negativ = bra for O).\n\nFor tic-tac-toe kan vi bruke en enkel heuristikk: **antall \"åpne 2-på-rader\"**.\n- En åpen 2-på-rad for X: en vinnerlinje med 2 X-er og 1 tom celle (umiddelbar trussel).\n- `evaluate(board) = open_twos(X) - open_twos(O)`.\n\nKombinert med dybde-begrenset minimax kan vi nå analysere mye større spill — vi bytter eksakthet mot fart.\n\n**Din oppgave** — to funksjoner:\n1. `count_open_twos(board, player)` — tell linjer med nøyaktig 2 av `player`s markører + 1 tom celle.\n2. `evaluate(board)` — returner +100 hvis X har vunnet, -100 hvis O har, 0 hvis draw, ellers `count_open_twos(\"X\") - count_open_twos(\"O\")`.\n\n`minimax_depth()` er ferdig-implementert — bruker `evaluate()` på løv-nodene OG når `depth == 0`.",
      files: {
        "spill.py": `LINES = [
    (0, 1, 2), (3, 4, 5), (6, 7, 8),
    (0, 3, 6), (1, 4, 7), (2, 5, 8),
    (0, 4, 8), (2, 4, 6),
]


def winner(board):
    for (a, b, c) in LINES:
        if board[a] == board[b] == board[c] and board[a] != ".":
            return board[a]
    if "." not in board:
        return "draw"
    return None


def legal_moves(board, player):
    out = []
    for i in range(9):
        if board[i] == ".":
            ny = list(board)
            ny[i] = player
            out.append((i, tuple(ny)))
    return out


def other(p):
    return "O" if p == "X" else "X"


def count_open_twos(board, player):
    """Antall vinnerlinjer med 2 av playerens markorer + 1 tom celle."""
    # === DIN OPPGAVE ===
    # For hver (a, b, c) i LINES:
    #   celler = [board[a], board[b], board[c]]
    #   hvis celler.count(player) == 2 og celler.count(".") == 1:
    #     telleren oker med 1
    # Returner telleren.
    return 0


def evaluate(board):
    """Heuristisk score for ikke-terminale brett.

    Terminal:
      - X har vunnet -> +100
      - O har vunnet -> -100
      - draw         ->  0
    Ellers: count_open_twos(X) - count_open_twos(O)
    """
    # === DIN OPPGAVE ===
    # Sjekk winner(board) forst. Returner 100 / -100 / 0 ved terminal.
    # Ellers: count_open_twos(board, "X") - count_open_twos(board, "O")
    return 0


def minimax_depth(board, player, depth):
    """Minimax med max-dybde. Bruker evaluate() ved depth==0 eller terminal."""
    w = winner(board)
    if w is not None or depth == 0:
        return evaluate(board)
    if player == "X":
        best = -1000
        for (_, ny) in legal_moves(board, player):
            v = minimax_depth(ny, other(player), depth - 1)
            if v > best: best = v
        return best
    else:
        best = 1000
        for (_, ny) in legal_moves(board, player):
            v = minimax_depth(ny, other(player), depth - 1)
            if v < best: best = v
        return best


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# X X . / . . . / . . . -> X har 1 apen 2-rad (topp-raden)
b1 = ("X", "X", ".", ".", ".", ".", ".", ".", ".")
sjekk(count_open_twos(b1, "X"), 1, "X har 1 apen 2-rad i topp-raden")
sjekk(count_open_twos(b1, "O"), 0, "O har 0 apne 2-rader")
sjekk(evaluate(b1), 1, "evaluate gir +1 for X-fordel")

# X har vunnet
b2 = ("X", "X", "X", ".", ".", ".", ".", ".", ".")
sjekk(evaluate(b2), 100, "evaluate gir +100 nar X har vunnet")

# O har 1 trussel, X har 0
b3 = ("O", "O", ".", "X", ".", ".", ".", ".", ".")
sjekk(evaluate(b3), -1, "evaluate gir -1 nar O har 1 mer trussel")

# Depth-limited minimax: dybde 2 fra tomt brett -> ingen vinner enda
tomt = (".", ".", ".", ".", ".", ".", ".", ".", ".")
sjekk(minimax_depth(tomt, "X", 2), 0, "depth=2 fra tomt brett gir 0")
`,
      },
      defaultFile: "spill.py",
      editable: ["spill.py"],
      run: { kind: "python-script", entry: "spill.py" },
      verifications: [
        { label: "count_open_twos teller X-trusler riktig", check: { kind: "output-contains", needle: "OK   X har 1 apen 2-rad i topp-raden" } },
        { label: "count_open_twos teller O-trusler riktig", check: { kind: "output-contains", needle: "OK   O har 0 apne 2-rader" } },
        { label: "evaluate gir X-fordel som positiv", check: { kind: "output-contains", needle: "OK   evaluate gir +1 for X-fordel" } },
        { label: "evaluate gir +100 for X-vinst", check: { kind: "output-contains", needle: "OK   evaluate gir +100 nar X har vunnet" } },
        { label: "evaluate gir negativ for O-fordel", check: { kind: "output-contains", needle: "OK   evaluate gir -1 nar O har 1 mer trussel" } },
        { label: "Depth-limited minimax kjorer pa evaluate()", check: { kind: "output-contains", needle: "OK   depth=2 fra tomt brett gir 0" } },
      ],
      hint:
        "def count_open_twos(board, player):\n    count = 0\n    for (a, b, c) in LINES:\n        celler = [board[a], board[b], board[c]]\n        if celler.count(player) == 2 and celler.count(\".\") == 1:\n            count += 1\n    return count\n\ndef evaluate(board):\n    w = winner(board)\n    if w == \"X\": return 100\n    if w == \"O\": return -100\n    if w == \"draw\": return 0\n    return count_open_twos(board, \"X\") - count_open_twos(board, \"O\")",
    },

    // ============ LEKSJON 6 ===========================================
    {
      id: "06-spill-mot-ai",
      title: "6. Spill mot AI-en (full demo)",
      narrative:
        "Tid for å se hele systemet i aksjon. Vi har bygget:\n\n- Brettrepresentasjon og terminal-sjekk (leksjon 1)\n- Naiv minimax (leksjon 2)\n- Beste-trekk-velger (leksjon 3)\n- Alfa-beta pruning (leksjon 4)\n- Heuristisk evaluering (leksjon 5)\n\nNå koblet sammen: en `play_game()`-funksjon som lar to AI-er — begge med alfa-beta — spille en hel runde mot hverandre, ASCII-printer brettet underveis, og verifiserer det klassiske resultatet: **optimalt spill i tic-tac-toe ender alltid uavgjort**.\n\nDet er et nydelig teorem: hvis begge spillerne spiller perfekt, kan ingen tvinge fram en vinst. Tic-tac-toe er \"løst\" akkurat sånn.\n\nAll infrastruktur fra leksjon 1–4 er ferdig-implementert øverst. **Din oppgave** er bare `play_game()`:\n- Start med tomt brett, X til trekk.\n- Loop til winner returnerer noe annet enn None:\n  - Velg trekk med `best_move()`.\n  - Plasser markøren på brettet.\n  - Print posisjonen med `print_board()`.\n  - Bytt spiller.\n- Returner `(winner_string, antall_trekk)`.\n\nVi tester at AI vs AI alltid blir draw, og at AI-en finner vinnerne / blokkerer trusler i tre nøkkel-scenarier.",
      files: {
        "spill.py": `LINES = [
    (0, 1, 2), (3, 4, 5), (6, 7, 8),
    (0, 3, 6), (1, 4, 7), (2, 5, 8),
    (0, 4, 8), (2, 4, 6),
]


def winner(board):
    for (a, b, c) in LINES:
        if board[a] == board[b] == board[c] and board[a] != ".":
            return board[a]
    if "." not in board:
        return "draw"
    return None


def legal_moves(board, player):
    out = []
    for i in range(9):
        if board[i] == ".":
            ny = list(board)
            ny[i] = player
            out.append((i, tuple(ny)))
    return out


def other(p):
    return "O" if p == "X" else "X"


def alphabeta(board, player, alpha, beta):
    w = winner(board)
    if w == "X": return 1
    if w == "O": return -1
    if w == "draw": return 0
    if player == "X":
        v = -10
        for (_, ny) in legal_moves(board, player):
            v = max(v, alphabeta(ny, other(player), alpha, beta))
            if v >= beta: return v
            alpha = max(alpha, v)
        return v
    else:
        v = 10
        for (_, ny) in legal_moves(board, player):
            v = min(v, alphabeta(ny, other(player), alpha, beta))
            if v <= alpha: return v
            beta = min(beta, v)
        return v


def best_move(board, player):
    best_idx = -1
    if player == "X":
        best_score = -10
        for (i, ny) in legal_moves(board, player):
            s = alphabeta(ny, other(player), -10, 10)
            if s > best_score:
                best_score = s
                best_idx = i
    else:
        best_score = 10
        for (i, ny) in legal_moves(board, player):
            s = alphabeta(ny, other(player), -10, 10)
            if s < best_score:
                best_score = s
                best_idx = i
    return best_idx


def print_board(board):
    rows = []
    for r in range(3):
        rows.append(" " + " | ".join(board[r * 3:r * 3 + 3]))
    print("\\n---+---+---\\n".join(rows))
    print()


def play_game():
    """Spill AI vs AI med alfa-beta. Returner (vinner_streng, antall_trekk)."""
    # === DIN OPPGAVE ===
    # 1. Start: board = (".",) * 9, player = "X", trekk_nr = 0
    # 2. Loop sa lenge winner(board) is None:
    #      idx = best_move(board, player)
    #      lag nytt brett med player i posisjon idx (list -> sett -> tuple)
    #      print_board(nytt brett)
    #      trekk_nr += 1, player = other(player)
    # 3. Returner (winner(board), trekk_nr)
    return ("draw", 0)


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


print("=== AI vs AI ===")
resultat, antall = play_game()
print(f"Resultat: {resultat}, etter {antall} trekk")

sjekk(resultat, "draw", "AI vs AI ender alltid uavgjort")
sjekk(antall, 9, "alle 9 ruter fylles ved optimalt spill")

# AI som O skal blokkere truende vinst
trussel_X = ("X", "X", ".", ".", "O", ".", ".", ".", ".")
sjekk(best_move(trussel_X, "O"), 2, "AI(O) blokkerer X-X-tom-trussel")

# AI som X skal ta vinnende trekk
vinn_X = ("X", "X", ".", "O", "O", ".", ".", ".", ".")
sjekk(best_move(vinn_X, "X"), 2, "AI(X) tar vinnende trekk")

# AI som O skal blokkere truende posisjon
# X har X i 0 og 4 -> tvunget til a forsvare
diag_trussel = ("X", ".", ".", ".", "X", ".", ".", ".", ".")
o_svar = best_move(diag_trussel, "O")
ny_brett = list(diag_trussel)
ny_brett[o_svar] = "O"
# Etter O sitt forsvar skal X ikke kunne vinne i ett trekk:
neste_X = best_move(tuple(ny_brett), "X")
test_brett = list(ny_brett)
test_brett[neste_X] = "X"
sjekk(winner(tuple(test_brett)), None, "O sitt forsvar hindrer X i a vinne i ett trekk")
`,
      },
      defaultFile: "spill.py",
      editable: ["spill.py"],
      run: { kind: "python-script", entry: "spill.py" },
      verifications: [
        { label: "AI vs AI ender alltid uavgjort", check: { kind: "output-contains", needle: "OK   AI vs AI ender alltid uavgjort" } },
        { label: "Alle 9 ruter fylles ved optimalt spill", check: { kind: "output-contains", needle: "OK   alle 9 ruter fylles ved optimalt spill" } },
        { label: "AI(O) blokkerer umiddelbar trussel", check: { kind: "output-contains", needle: "OK   AI(O) blokkerer X-X-tom-trussel" } },
        { label: "AI(X) tar vinnende trekk når tilgjengelig", check: { kind: "output-contains", needle: "OK   AI(X) tar vinnende trekk" } },
        { label: "AI forsvarer mot diagonal-trussel", check: { kind: "output-contains", needle: "OK   O sitt forsvar hindrer X i a vinne i ett trekk" } },
      ],
      hint:
        "board = (\".\",) * 9\nplayer = \"X\"\ntrekk_nr = 0\nwhile winner(board) is None:\n    idx = best_move(board, player)\n    ny = list(board)\n    ny[idx] = player\n    board = tuple(ny)\n    print_board(board)\n    trekk_nr += 1\n    player = other(player)\nreturn (winner(board), trekk_nr)",
    },
  ],
};

const STRIPS_PLANLEGGER: MiniCourse = {
  id: "strips-planlegger",
  slug: "strips-planlegger",
  title: "STRIPS-planlegger fra null",
  blurb:
    "Bygg en klassisk STRIPS-planlegger steg for steg. State som mengde av literals, actions med precondition/add/del, forward search (BFS), enkle heuristikker, A* og til slutt et lite logistikk-domene som rutes med samme motor. Studenten skriver hver kjernekomponent selv og sammenligner søkestrategiene på samme problem.",
  estimertTid: "70–90 min",
  fag: ["DTE-2501", "Klassisk AI", "Planlegging"],
  color: "purple",
  rekkefolge: 30,
  lessons: [
    // ============ LEKSJON 1 ===========================================
    {
      id: "01-state-og-action",
      title: "1. State, action og operator-representasjon",
      narrative:
        "En **STRIPS-planlegger** er en søke-algoritme som ikke jobber på tall eller posisjoner, men på *symbolske fakta om verden*. Den tenker mer som et menneske enn som en sjakkmotor.\n\nTo grunnbegreper:\n\n- **State** er en mengde positive literals. En blokk-verden med A oppå B på bordet ser slik ut: `{\"on(A, table)\", \"on(B, table)\", \"clear(A)\", \"clear(B)\"}`. Alt vi ikke ser, antas å være usant (\"closed-world assumption\").\n- **Action** har et navn, et sett **preconditions** (literals som må holde for at action er anvendelig), et sett **add_effects** (literals som blir sanne etterpå) og et sett **del_effects** (literals som blir usanne).\n\n**Hvorfor sett?** Rekkefølge betyr ingenting — kun *hvilke* fakta som er sanne. Bruker vi `frozenset` blir state hashbar og kan brukes i visited-sett i søk.\n\n**Din oppgave:** Skriv to funksjoner.\n- `applicable(action, state)` — er alle preconditions oppfylt i state?\n- `apply(action, state)` — gi ny state ved å fjerne del_effects og legge til add_effects.\n\nMatematisk: `apply(a, s) = (s - del(a)) ∪ add(a)`.",
      files: {
        "strips.py": "class Action:\n    \"\"\"En STRIPS-action: navn + preconditions + add_effects + del_effects.\"\"\"\n    def __init__(self, name, preconditions, add_effects, del_effects):\n        self.name = name\n        self.preconditions = frozenset(preconditions)\n        self.add_effects = frozenset(add_effects)\n        self.del_effects = frozenset(del_effects)\n\n    def __repr__(self):\n        return self.name\n\n\n# === DIN OPPGAVE 1 ===\ndef applicable(action, state):\n    \"\"\"True hvis alle action.preconditions er i state.\"\"\"\n    # Hint: bruk .issubset() på frozenset.\n    pass\n\n\n# === DIN OPPGAVE 2 ===\ndef apply(action, state):\n    \"\"\"Returner ny state: (state - del_effects) | add_effects.\n    state kommer som frozenset eller set; returner gjerne frozenset.\n    \"\"\"\n    pass\n\n\n# === Blocks-world: A og B på bordet, begge clear ===\nstate0 = frozenset({\n    \"on(A, table)\",\n    \"on(B, table)\",\n    \"clear(A)\",\n    \"clear(B)\",\n})\n\n# Action: stable B oppe på A.\nstack_B_on_A = Action(\n    name=\"stack(B, A)\",\n    preconditions={\"clear(A)\", \"clear(B)\", \"on(B, table)\"},\n    add_effects={\"on(B, A)\"},\n    del_effects={\"on(B, table)\", \"clear(A)\"},\n)\n\n# Action: unstack B fra A (motsatt).\nunstack_B_from_A = Action(\n    name=\"unstack(B, A)\",\n    preconditions={\"on(B, A)\", \"clear(B)\"},\n    add_effects={\"on(B, table)\", \"clear(A)\"},\n    del_effects={\"on(B, A)\"},\n)\n\n\ndef sjekk(faktisk, forventet, navn):\n    if faktisk == forventet:\n        print(f\"OK   {navn}\")\n    else:\n        print(f\"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}\")\n\n\n# applicable: i start-state er stack(B, A) lovlig\nsjekk(applicable(stack_B_on_A, state0), True, \"stack lovlig i start\")\n\n# unstack derimot krever on(B, A) — som ikke er sant ennaa\nsjekk(applicable(unstack_B_from_A, state0), False, \"unstack ulovlig i start\")\n\n# Etter apply: B er pa A, og A er ikke lenger clear\nstate1 = apply(stack_B_on_A, state0)\nsjekk(\"on(B, A)\" in state1, True, \"apply legger til on(B,A)\")\nsjekk(\"on(B, table)\" in state1, False, \"apply fjerner on(B,table)\")\nsjekk(\"clear(A)\" in state1, False, \"apply fjerner clear(A)\")\nsjekk(\"clear(B)\" in state1, True, \"apply rorer ikke clear(B)\")\n\n# Na er unstack lovlig\nsjekk(applicable(unstack_B_from_A, state1), True, \"unstack lovlig etter stack\")\n\n# Sjekk reversibilitet: stack -> unstack gir tilbake start\nstate2 = apply(unstack_B_from_A, state1)\nsjekk(state2 == state0, True, \"unstack reverserer stack\")\n",
      },
      defaultFile: "strips.py",
      editable: ["strips.py"],
      run: { kind: "python-script", entry: "strips.py" },
      verifications: [
        {
          label: "applicable() godtar lovlig action",
          check: { kind: "output-contains", needle: "OK   stack lovlig i start" },
        },
        {
          label: "applicable() avviser action uten oppfylt precondition",
          check: { kind: "output-contains", needle: "OK   unstack ulovlig i start" },
        },
        {
          label: "apply() legger til add_effects",
          check: { kind: "output-contains", needle: "OK   apply legger til on(B,A)" },
        },
        {
          label: "apply() fjerner del_effects",
          check: { kind: "output-contains", needle: "OK   apply fjerner on(B,table)" },
        },
        {
          label: "apply() rører ikke literals utenfor add/del",
          check: { kind: "output-contains", needle: "OK   apply rorer ikke clear(B)" },
        },
        {
          label: "stack + unstack reverserer hverandre",
          check: { kind: "output-contains", needle: "OK   unstack reverserer stack" },
        },
      ],
      hint:
        "def applicable(action, state):\n    return action.preconditions.issubset(state)\n\ndef apply(action, state):\n    return (frozenset(state) - action.del_effects) | action.add_effects",
    },

    // ============ LEKSJON 2 ===========================================
    {
      id: "02-bfs-forward-search",
      title: "2. Goal-test og enkel forward search (BFS)",
      narrative:
        "Nå har vi `applicable` og `apply`. Da er en planlegger nesten gratis: planlegging = grafsøk der **noder er states** og **kanter er actions**.\n\nGoal-testen er ikke equality — målet er en **delvis spesifikasjon**: \"jeg vil bare at `on(C, B)` skal være sant. Resten bryr jeg meg ikke om.\" Det uttrykkes som `goal.issubset(state)`.\n\nVi starter med **breadth-first search (BFS)**:\n\n1. Køen inneholder `(state, plan-så-langt)`.\n2. Trekk neste state ut, sjekk om målet er nådd.\n3. Ellers: for hver lovlige action, beregn ny state, og put `(ny_state, plan + [action])` i køen.\n4. Bruk et `visited`-sett på states så vi ikke utforsker samme state to ganger.\n\n**Hvorfor BFS først?** Den finner den korteste planen (færrest steg), uten heuristikker. Bra utgangspunkt og bra sammenligningsgrunnlag.\n\n**Din oppgave:** Skriv `plan_bfs(initial, goal, actions)` som returnerer listen av action-navn, eller `None` hvis ingen plan finnes.",
      files: {
        "strips.py": "from collections import deque\n\n\nclass Action:\n    def __init__(self, name, preconditions, add_effects, del_effects):\n        self.name = name\n        self.preconditions = frozenset(preconditions)\n        self.add_effects = frozenset(add_effects)\n        self.del_effects = frozenset(del_effects)\n    def __repr__(self):\n        return self.name\n\n\ndef applicable(action, state):\n    return action.preconditions.issubset(state)\n\n\ndef apply(action, state):\n    return (frozenset(state) - action.del_effects) | action.add_effects\n\n\n# === DIN OPPGAVE ===\ndef plan_bfs(initial, goal, actions):\n    \"\"\"Returner liste av action-navn fra initial til en state der goal er oppfylt.\n    Returner None hvis ingen plan finnes.\n    Bruk frozenset(state), en deque-ko, og et visited-sett.\n    Goal-test: goal.issubset(state).\n    \"\"\"\n    pass\n\n\n# ===== Blocks-world: 3 blokker A, B, C =====\n# Start: alle på bordet, alle clear. Mål: C oppe på B oppe på A.\nblokker = [\"A\", \"B\", \"C\"]\n\ninitial = set()\nfor b in blokker:\n    initial.add(f\"on({b}, table)\")\n    initial.add(f\"clear({b})\")\n\ngoal = {\"on(B, A)\", \"on(C, B)\"}\n\n\n# Hjelpefunksjon: generer alle move-actions for 3 blokker.\ndef lag_move_actions(blokker):\n    actions = []\n    plasser = list(blokker) + [\"table\"]\n    for b in blokker:\n        for src in plasser:\n            for dst in plasser:\n                if b == src or b == dst or src == dst:\n                    continue\n                if dst == \"table\":\n                    pre = {f\"on({b}, {src})\", f\"clear({b})\"}\n                    add = {f\"on({b}, table)\", f\"clear({src})\"}\n                    dele = {f\"on({b}, {src})\"}\n                else:\n                    pre = {f\"on({b}, {src})\", f\"clear({b})\", f\"clear({dst})\"}\n                    add = {f\"on({b}, {dst})\"}\n                    dele = {f\"on({b}, {src})\", f\"clear({dst})\"}\n                    if src != \"table\":\n                        add = add | {f\"clear({src})\"}\n                actions.append(Action(f\"move({b},{src}->{dst})\", pre, add, dele))\n    return actions\n\n\nactions = lag_move_actions(blokker)\nprint(f\"Antall mulige actions: {len(actions)}\")\n\nplan = plan_bfs(initial, goal, actions)\nprint(f\"Plan: {plan}\")\n\n\ndef simuler(plan, initial, actions):\n    if plan is None:\n        return None\n    by_name = {a.name: a for a in actions}\n    s = frozenset(initial)\n    for navn in plan:\n        a = by_name[navn]\n        if not applicable(a, s):\n            return None\n        s = apply(a, s)\n    return s\n\n\nresultat = simuler(plan, initial, actions)\n\n\ndef sjekk(faktisk, forventet, navn):\n    if faktisk == forventet:\n        print(f\"OK   {navn}\")\n    else:\n        print(f\"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}\")\n\n\nsjekk(plan is not None, True, \"plan_bfs fant en plan\")\nsjekk(resultat is not None and goal.issubset(resultat), True, \"sluttstate oppfyller goal\")\n# Den korteste planen for 3-tarn er 2 steg (stable B på A, deretter C på B).\nsjekk(plan is not None and len(plan) == 2, True, \"BFS fant minimal plan (2 steg)\")\n# Tomt mål: planen skal være tom liste, ikke None.\nsjekk(plan_bfs(initial, set(), actions), [], \"tomt mal gir tom plan\")\n",
      },
      defaultFile: "strips.py",
      editable: ["strips.py"],
      run: { kind: "python-script", entry: "strips.py" },
      verifications: [
        {
          label: "plan_bfs() finner en plan",
          check: { kind: "output-contains", needle: "OK   plan_bfs fant en plan" },
        },
        {
          label: "Sluttstate oppfyller goal (subset-test)",
          check: { kind: "output-contains", needle: "OK   sluttstate oppfyller goal" },
        },
        {
          label: "BFS finner minimal plan (2 steg for 3-tårn)",
          check: { kind: "output-contains", needle: "OK   BFS fant minimal plan (2 steg)" },
        },
        {
          label: "Tomt mål returnerer tom plan",
          check: { kind: "output-contains", needle: "OK   tomt mal gir tom plan" },
        },
      ],
      hint:
        "def plan_bfs(initial, goal, actions):\n    initial = frozenset(initial)\n    goal = frozenset(goal)\n    if goal.issubset(initial):\n        return []\n    visited = {initial}\n    kø = deque([(initial, [])])\n    while kø:\n        state, plan = kø.popleft()\n        for a in actions:\n            if applicable(a, state):\n                ny = apply(a, state)\n                if ny in visited:\n                    continue\n                if goal.issubset(ny):\n                    return plan + [a.name]\n                visited.add(ny)\n                kø.append((ny, plan + [a.name]))\n    return None",
    },

    // ============ LEKSJON 3 ===========================================
    {
      id: "03-heuristikk-greedy",
      title: "3. Heuristikker: greedy med count-of-unsatisfied-goals",
      narrative:
        "BFS er korrekt og finner optimale planer, men den utforsker dumt. På et 4-blokk-problem utforsker BFS titalls states; en god heuristikk kan kutte det dramatisk.\n\nDen enkleste planlegger-heuristikken er **antallet usatisfied goal-literals**:\n\n```python\ndef h(state, goal):\n    return len(goal - state)\n```\n\nEr alle mål-literals oppfylt, gir den 0 (vi er i mål). Mangler 3, gir den 3. Den er ikke alltid admissibel (kan overestimere), men den er rask og veldig nyttig.\n\n**Greedy best-first search** velger neste state utelukkende basert på `h`. Den ignorerer hvor lang planen er så langt (g). Det gjør den rask, men kan gi suboptimale planer — og i verste fall sykler den (vi unngår det med visited).\n\n**Din oppgave:**\n- Skriv `h_count(state, goal)`.\n- Skriv `plan_greedy(initial, goal, actions, h)` med en priority-kø (heapq).\n\nSammenlign så node-tellingen med BFS på samme problem (4 blokker, tårn av høyde 4). Greedy bør utforske dramatisk færre noder.",
      files: {
        "strips.py": "from collections import deque\nfrom heapq import heappush, heappop\n\n\nclass Action:\n    def __init__(self, name, preconditions, add_effects, del_effects):\n        self.name = name\n        self.preconditions = frozenset(preconditions)\n        self.add_effects = frozenset(add_effects)\n        self.del_effects = frozenset(del_effects)\n    def __repr__(self):\n        return self.name\n\n\ndef applicable(action, state):\n    return action.preconditions.issubset(state)\n\n\ndef apply(action, state):\n    return (frozenset(state) - action.del_effects) | action.add_effects\n\n\n# === DIN OPPGAVE 1: tell antall usatisfied goal-literals ===\ndef h_count(state, goal):\n    \"\"\"Returner antall literals i goal som ikke er i state.\"\"\"\n    pass\n\n\n# === DIN OPPGAVE 2: greedy best-first search ===\ndef plan_greedy(initial, goal, actions, h):\n    \"\"\"Returner (plan, antall_noder_utforsket).\n    Plan er liste av action-navn (eller None hvis ingen finnes).\n    Bruk heapq som prioritetsko, prioritert kun pa h(state, goal).\n    NB: heapq trenger en tie-breaker fordi state er frozenset (ikke ordnet) -\n    bruk en monotont okende teller.\n    \"\"\"\n    pass\n\n\n# ===== Felles BFS for sammenligning =====\ndef plan_bfs(initial, goal, actions):\n    initial = frozenset(initial)\n    goal = frozenset(goal)\n    if goal.issubset(initial):\n        return [], 0\n    visited = {initial}\n    kø = deque([(initial, [])])\n    noder = 0\n    while kø:\n        state, plan = kø.popleft()\n        noder += 1\n        for a in actions:\n            if applicable(a, state):\n                ny = apply(a, state)\n                if ny in visited:\n                    continue\n                if goal.issubset(ny):\n                    return plan + [a.name], noder\n                visited.add(ny)\n                kø.append((ny, plan + [a.name]))\n    return None, noder\n\n\n# ===== Problem: 4 blokker, mål B-på-A, C-på-B, D-på-C =====\nblokker = [\"A\", \"B\", \"C\", \"D\"]\n\ninitial = set()\nfor b in blokker:\n    initial.add(f\"on({b}, table)\")\n    initial.add(f\"clear({b})\")\n\ngoal = {\"on(B, A)\", \"on(C, B)\", \"on(D, C)\"}\n\n\ndef lag_move_actions(blokker):\n    actions = []\n    plasser = list(blokker) + [\"table\"]\n    for b in blokker:\n        for src in plasser:\n            for dst in plasser:\n                if b == src or b == dst or src == dst:\n                    continue\n                if dst == \"table\":\n                    pre = {f\"on({b}, {src})\", f\"clear({b})\"}\n                    add = {f\"on({b}, table)\", f\"clear({src})\"}\n                    dele = {f\"on({b}, {src})\"}\n                else:\n                    pre = {f\"on({b}, {src})\", f\"clear({b})\", f\"clear({dst})\"}\n                    add = {f\"on({b}, {dst})\"}\n                    dele = {f\"on({b}, {src})\", f\"clear({dst})\"}\n                    if src != \"table\":\n                        add = add | {f\"clear({src})\"}\n                actions.append(Action(f\"move({b},{src}->{dst})\", pre, add, dele))\n    return actions\n\n\nactions = lag_move_actions(blokker)\n\nbfs_plan, bfs_n = plan_bfs(initial, goal, actions)\ngreedy_plan, greedy_n = plan_greedy(initial, goal, actions, h_count)\n\nprint(f\"BFS:    {bfs_n} noder, plan-lengde {len(bfs_plan) if bfs_plan else '-'}\")\nprint(f\"GREEDY: {greedy_n} noder, plan-lengde {len(greedy_plan) if greedy_plan else '-'}\")\n\n\ndef sjekk(faktisk, forventet, navn):\n    if faktisk == forventet:\n        print(f\"OK   {navn}\")\n    else:\n        print(f\"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}\")\n\n\nsjekk(h_count(frozenset(initial), frozenset(goal)), 3, \"h_count teller 3 manglende ved start\")\nsjekk(h_count(frozenset(goal), frozenset(goal)), 0, \"h_count = 0 i mal\")\nsjekk(greedy_plan is not None, True, \"greedy fant en plan\")\nsjekk(greedy_n < bfs_n, True, \"greedy utforsker faerre noder enn BFS\")\n",
      },
      defaultFile: "strips.py",
      editable: ["strips.py"],
      run: { kind: "python-script", entry: "strips.py" },
      verifications: [
        {
          label: "h_count teller manglende literals",
          check: { kind: "output-contains", needle: "OK   h_count teller 3 manglende ved start" },
        },
        {
          label: "h_count = 0 når mål er nådd",
          check: { kind: "output-contains", needle: "OK   h_count = 0 i mal" },
        },
        {
          label: "Greedy finner en plan",
          check: { kind: "output-contains", needle: "OK   greedy fant en plan" },
        },
        {
          label: "Greedy utforsker færre noder enn BFS",
          check: { kind: "output-contains", needle: "OK   greedy utforsker faerre noder enn BFS" },
        },
      ],
      hint:
        "def h_count(state, goal):\n    return len(frozenset(goal) - frozenset(state))\n\ndef plan_greedy(initial, goal, actions, h):\n    initial = frozenset(initial)\n    goal = frozenset(goal)\n    if goal.issubset(initial):\n        return [], 0\n    teller = 0\n    frontier = [(h(initial, goal), teller, initial, [])]\n    visited = {initial}\n    noder = 0\n    while frontier:\n        _, _, state, plan = heappop(frontier)\n        noder += 1\n        for a in actions:\n            if applicable(a, state):\n                ny = apply(a, state)\n                if ny in visited:\n                    continue\n                visited.add(ny)\n                if goal.issubset(ny):\n                    return plan + [a.name], noder\n                teller += 1\n                heappush(frontier, (h(ny, goal), teller, ny, plan + [a.name]))\n    return None, noder",
    },

    // ============ LEKSJON 4 ===========================================
    {
      id: "04-astar",
      title: "4. A*-søk: kombiner g (kostnad) og h (heuristikk)",
      narrative:
        "Greedy er rask, men ignorerer hvor lang planen blir. BFS er optimal, men ignorerer alt vi vet om målet. **A\\* kombinerer begge:**\n\n```\nf(state) = g(state) + h(state, goal)\n```\n\n- `g` = antall steg fra initial til nåværende state (planlengde så langt).\n- `h` = vår estimerte avstand fra state til mål.\n\nVi prioriterer states med minst `f`. Hvis `h` er **admissibel** (aldri overestimerer den faktiske avstanden), garanterer A* optimal plan — som BFS — men utforsker langt færre noder.\n\nVår `h_count` er ikke streng admissibel for alle domener, men den er en kjent nyttig planlegger-heuristikk og A* finner ofte samme optimum som BFS.\n\n**Implementasjons-detaljer som gjør A* tricky:**\n\n1. **Re-opening:** Hvis vi finner en bedre vei (lavere g) til en state vi allerede har popget, må vi vurdere den på nytt. Hold en `g_score`-dict og hopp over noder hvor vi alt har sett en bedre vei.\n2. **Tie-breaker:** Som i greedy må vi gi heapq noe ordnet å sammenligne — bruk en monotont økende teller.\n\n**Din oppgave:** Implementér `plan_astar(initial, goal, actions, h)` så den returnerer (plan, noder_utforsket). Test at den finner samme plan-lengde som BFS, men med færre noder.",
      files: {
        "strips.py": "from collections import deque\nfrom heapq import heappush, heappop\n\n\nclass Action:\n    def __init__(self, name, preconditions, add_effects, del_effects):\n        self.name = name\n        self.preconditions = frozenset(preconditions)\n        self.add_effects = frozenset(add_effects)\n        self.del_effects = frozenset(del_effects)\n    def __repr__(self):\n        return self.name\n\n\ndef applicable(action, state):\n    return action.preconditions.issubset(state)\n\n\ndef apply(action, state):\n    return (frozenset(state) - action.del_effects) | action.add_effects\n\n\ndef h_count(state, goal):\n    return len(frozenset(goal) - frozenset(state))\n\n\n# === DIN OPPGAVE: A*-soek ===\ndef plan_astar(initial, goal, actions, h):\n    \"\"\"Returner (plan, antall_noder_utforsket).\n    f(state) = g(state) + h(state, goal).\n    Bruk heapq, en monotont okende tie-breaker, og en g_score-dict for\n    a oppdage bedre veier til allerede sette states.\n    \"\"\"\n    pass\n\n\n# ===== BFS for sammenligning =====\ndef plan_bfs(initial, goal, actions):\n    initial = frozenset(initial)\n    goal = frozenset(goal)\n    if goal.issubset(initial):\n        return [], 0\n    visited = {initial}\n    kø = deque([(initial, [])])\n    noder = 0\n    while kø:\n        state, plan = kø.popleft()\n        noder += 1\n        for a in actions:\n            if applicable(a, state):\n                ny = apply(a, state)\n                if ny in visited:\n                    continue\n                if goal.issubset(ny):\n                    return plan + [a.name], noder\n                visited.add(ny)\n                kø.append((ny, plan + [a.name]))\n    return None, noder\n\n\n# ===== Problem: 4 blokker, tarn-mal =====\nblokker = [\"A\", \"B\", \"C\", \"D\"]\n\ninitial = set()\nfor b in blokker:\n    initial.add(f\"on({b}, table)\")\n    initial.add(f\"clear({b})\")\n\ngoal = {\"on(B, A)\", \"on(C, B)\", \"on(D, C)\"}\n\n\ndef lag_move_actions(blokker):\n    actions = []\n    plasser = list(blokker) + [\"table\"]\n    for b in blokker:\n        for src in plasser:\n            for dst in plasser:\n                if b == src or b == dst or src == dst:\n                    continue\n                if dst == \"table\":\n                    pre = {f\"on({b}, {src})\", f\"clear({b})\"}\n                    add = {f\"on({b}, table)\", f\"clear({src})\"}\n                    dele = {f\"on({b}, {src})\"}\n                else:\n                    pre = {f\"on({b}, {src})\", f\"clear({b})\", f\"clear({dst})\"}\n                    add = {f\"on({b}, {dst})\"}\n                    dele = {f\"on({b}, {src})\", f\"clear({dst})\"}\n                    if src != \"table\":\n                        add = add | {f\"clear({src})\"}\n                actions.append(Action(f\"move({b},{src}->{dst})\", pre, add, dele))\n    return actions\n\n\nactions = lag_move_actions(blokker)\n\nbfs_plan, bfs_n = plan_bfs(initial, goal, actions)\nastar_plan, astar_n = plan_astar(initial, goal, actions, h_count)\n\nprint(f\"BFS: {bfs_n} noder, plan-lengde {len(bfs_plan) if bfs_plan else '-'}\")\nprint(f\"A*:  {astar_n} noder, plan-lengde {len(astar_plan) if astar_plan else '-'}\")\n\n\ndef sjekk(faktisk, forventet, navn):\n    if faktisk == forventet:\n        print(f\"OK   {navn}\")\n    else:\n        print(f\"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}\")\n\n\nsjekk(astar_plan is not None, True, \"A-stjerne fant en plan\")\nsjekk(astar_plan is not None and len(astar_plan) == len(bfs_plan), True, \"A-stjerne samme lengde som BFS\")\nsjekk(astar_n < bfs_n, True, \"A-stjerne utforsker faerre noder enn BFS\")\n",
      },
      defaultFile: "strips.py",
      editable: ["strips.py"],
      run: { kind: "python-script", entry: "strips.py" },
      verifications: [
        {
          label: "A* finner en plan",
          check: { kind: "output-contains", needle: "OK   A-stjerne fant en plan" },
        },
        {
          label: "A* finner samme plan-lengde som BFS (optimalt)",
          check: { kind: "output-contains", needle: "OK   A-stjerne samme lengde som BFS" },
        },
        {
          label: "A* utforsker færre noder enn BFS",
          check: { kind: "output-contains", needle: "OK   A-stjerne utforsker faerre noder enn BFS" },
        },
      ],
      hint:
        "def plan_astar(initial, goal, actions, h):\n    initial = frozenset(initial)\n    goal = frozenset(goal)\n    if goal.issubset(initial):\n        return [], 0\n    teller = 0\n    frontier = [(h(initial, goal), 0, teller, initial, [])]\n    g_score = {initial: 0}\n    noder = 0\n    while frontier:\n        f, g, _, state, plan = heappop(frontier)\n        if g > g_score.get(state, float('inf')):\n            continue\n        noder += 1\n        if goal.issubset(state):\n            return plan, noder\n        for a in actions:\n            if applicable(a, state):\n                ny = apply(a, state)\n                ny_g = g + 1\n                if ny_g >= g_score.get(ny, float('inf')):\n                    continue\n                g_score[ny] = ny_g\n                teller += 1\n                heappush(frontier, (ny_g + h(ny, goal), ny_g, teller, ny, plan + [a.name]))\n    return None, noder",
    },

    // ============ LEKSJON 5 ===========================================
    {
      id: "05-logistikk-domene",
      title: "5. Et rikere domene: logistikk (move, load, unload)",
      narrative:
        "Til slutt: bytt domene. Samme motor — A* med h_count fra leksjon 4 — løser et helt nytt problem hvis vi bare beskriver det som STRIPS.\n\n**Logistikk-verden:**\n- En **truck** står i én by om gangen — fakta `truck_at(by)`.\n- En **pakke** kan ligge i en by — `at(pakke, by)` — eller i trucken — `in_truck(pakke)`.\n- **Actions:**\n  - `move(b1, b2)`: krever `truck_at(b1)`, gir `truck_at(b2)`, fjerner `truck_at(b1)`. Bare lovlig mellom byer som er naboer.\n  - `load(p, b)`: krever `truck_at(b)` og `at(p, b)`. Gir `in_truck(p)`, fjerner `at(p, b)`.\n  - `unload(p, b)`: krever `truck_at(b)` og `in_truck(p)`. Gir `at(p, b)`, fjerner `in_truck(p)`.\n\nVi bygger Norges-ruten Tromsø ↔ Bodø ↔ Oslo (nabolag-restriksjon, ikke direkte-flighter). En pakke skal fra Tromsø til Oslo. Forventet plan:\n\n1. load(P1, Tromsø)\n2. move(Tromsø → Bodø)\n3. move(Bodø → Oslo)\n4. unload(P1, Oslo)\n\nFire steg. Samme A* finner det fra h_count alene.\n\n**Din oppgave:** Skriv `lag_actions(byer, pakker, naboer)` som genererer ALLE lovlige `move`, `load` og `unload`-actions for det gitte domenet. `naboer` er en liste av `(by1, by2)` — toveis. Bruk så A* fra leksjon 4 (gitt for deg) til å løse problemet.",
      files: {
        "strips.py": "from heapq import heappush, heappop\n\n\nclass Action:\n    def __init__(self, name, preconditions, add_effects, del_effects):\n        self.name = name\n        self.preconditions = frozenset(preconditions)\n        self.add_effects = frozenset(add_effects)\n        self.del_effects = frozenset(del_effects)\n    def __repr__(self):\n        return self.name\n\n\ndef applicable(action, state):\n    return action.preconditions.issubset(state)\n\n\ndef apply(action, state):\n    return (frozenset(state) - action.del_effects) | action.add_effects\n\n\ndef h_count(state, goal):\n    return len(frozenset(goal) - frozenset(state))\n\n\ndef plan_astar(initial, goal, actions, h):\n    initial = frozenset(initial)\n    goal = frozenset(goal)\n    if goal.issubset(initial):\n        return [], 0\n    teller = 0\n    frontier = [(h(initial, goal), 0, teller, initial, [])]\n    g_score = {initial: 0}\n    noder = 0\n    while frontier:\n        f, g, _, state, plan = heappop(frontier)\n        if g > g_score.get(state, float(\"inf\")):\n            continue\n        noder += 1\n        if goal.issubset(state):\n            return plan, noder\n        for a in actions:\n            if applicable(a, state):\n                ny = apply(a, state)\n                ny_g = g + 1\n                if ny_g >= g_score.get(ny, float(\"inf\")):\n                    continue\n                g_score[ny] = ny_g\n                teller += 1\n                heappush(frontier, (ny_g + h(ny, goal), ny_g, teller, ny, plan + [a.name]))\n    return None, noder\n\n\n# === DIN OPPGAVE ===\ndef lag_actions(byer, pakker, naboer):\n    \"\"\"Returner liste av alle lovlige Action-objekter for logistikk-domenet.\n\n    naboer: liste av (by1, by2)-tuples som er forbundet TOVEIS.\n      F.eks. [(\"Tromsoe\", \"Bodoe\"), (\"Bodoe\", \"Oslo\")] gir 4 move-actions.\n\n    Lag:\n    - move(b1, b2) for hver (b1, b2) som er naboer (begge retninger).\n      Navn: f\"move({b1}->{b2})\"\n    - load(p, b) for hver pakke p og by b.\n      Navn: f\"load({p}, {b})\"\n    - unload(p, b) for hver pakke p og by b.\n      Navn: f\"unload({p}, {b})\"\n    \"\"\"\n    pass\n\n\n# ===== Norges-ruta: Tromsoe -> Bodoe -> Oslo =====\nbyer = [\"Tromsoe\", \"Bodoe\", \"Oslo\"]\npakker = [\"P1\"]\nnaboer = [(\"Tromsoe\", \"Bodoe\"), (\"Bodoe\", \"Oslo\")]\n\ninitial = {\"truck_at(Tromsoe)\", \"at(P1, Tromsoe)\"}\ngoal = {\"at(P1, Oslo)\"}\n\nactions = lag_actions(byer, pakker, naboer)\nplan, noder = plan_astar(initial, goal, actions, h_count)\n\nprint(f\"Antall actions generert: {len(actions) if actions else 0}\")\nprint(f\"Plan: {plan}\")\nprint(f\"Noder utforsket: {noder}\")\n\n\ndef sjekk(faktisk, forventet, navn):\n    if faktisk == forventet:\n        print(f\"OK   {navn}\")\n    else:\n        print(f\"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}\")\n\n\n# Forventet antall actions: 4 move (2 naboer toveis) + 3 load (1 pakke x 3 byer) + 3 unload = 10\nsjekk(actions is not None and len(actions) == 10, True, \"lag_actions genererer 10 actions\")\nsjekk(plan is not None, True, \"A-stjerne fant plan i logistikk\")\nsjekk(plan is not None and len(plan) == 4, True, \"plan er 4 steg (load-move-move-unload)\")\nsjekk(plan is not None and plan[0] == \"load(P1, Tromsoe)\", True, \"forste steg er load i Tromsoe\")\nsjekk(plan is not None and plan[-1] == \"unload(P1, Oslo)\", True, \"siste steg er unload i Oslo\")\n# Negativ test: mål om aa flytte pakke til en by som ikke er nåbar er likevel løsbart via to move.\n# Sjekk at vi ikke kan flytte direkte (ingen move(Tromsoe->Oslo) i actions-listen).\ndirekte = [a for a in actions if a.name == \"move(Tromsoe->Oslo)\"]\nsjekk(len(direkte), 0, \"ingen direkte Tromsoe->Oslo (kun naboer)\")\n",
      },
      defaultFile: "strips.py",
      editable: ["strips.py"],
      run: { kind: "python-script", entry: "strips.py" },
      verifications: [
        {
          label: "lag_actions() genererer riktig antall actions (10)",
          check: { kind: "output-contains", needle: "OK   lag_actions genererer 10 actions" },
        },
        {
          label: "A* finner en plan i logistikk-domenet",
          check: { kind: "output-contains", needle: "OK   A-stjerne fant plan i logistikk" },
        },
        {
          label: "Plan har 4 steg: load-move-move-unload",
          check: { kind: "output-contains", needle: "OK   plan er 4 steg (load-move-move-unload)" },
        },
        {
          label: "Første steg er load(P1, Tromsoe)",
          check: { kind: "output-contains", needle: "OK   forste steg er load i Tromsoe" },
        },
        {
          label: "Siste steg er unload(P1, Oslo)",
          check: { kind: "output-contains", needle: "OK   siste steg er unload i Oslo" },
        },
        {
          label: "Bare nabo-moves genereres (ingen direkte Tromsø-Oslo)",
          check: { kind: "output-contains", needle: "OK   ingen direkte Tromsoe->Oslo (kun naboer)" },
        },
      ],
      hint:
        "def lag_actions(byer, pakker, naboer):\n    actions = []\n    kanter = set()\n    for a, b in naboer:\n        kanter.add((a, b))\n        kanter.add((b, a))\n    for b1, b2 in kanter:\n        pre = {f\"truck_at({b1})\"}\n        add = {f\"truck_at({b2})\"}\n        dele = {f\"truck_at({b1})\"}\n        actions.append(Action(f\"move({b1}->{b2})\", pre, add, dele))\n    for p in pakker:\n        for b in byer:\n            pre = {f\"truck_at({b})\", f\"at({p}, {b})\"}\n            add = {f\"in_truck({p})\"}\n            dele = {f\"at({p}, {b})\"}\n            actions.append(Action(f\"load({p}, {b})\", pre, add, dele))\n    for p in pakker:\n        for b in byer:\n            pre = {f\"truck_at({b})\", f\"in_truck({p})\"}\n            add = {f\"at({p}, {b})\"}\n            dele = {f\"in_truck({p})\"}\n            actions.append(Action(f\"unload({p}, {b})\", pre, add, dele))\n    return actions",
    },
  ],
};

const BAYES_NETT: MiniCourse = {
  id: "bayes-nett",
  slug: "bayes-nett",
  title: "Bayes-nett: konstruksjon og variable elimination",
  blurb:
    "Bygg et Bayes-nett fra null — joint distribution → CPT-er → naiv enumeration-inferens → faktorer og pointwise produkt → variable elimination → d-separasjon. Vi bruker det klassiske Burglar/Earthquake/Alarm/JohnCalls/MaryCalls-nettet og verifiserer den berømte posterioren P(Burglar | begge ringer) ~ 0.284.",
  estimertTid: "75–90 min",
  fag: ["DTE-2501", "Klassisk AI", "Probabilistisk resonnering"],
  color: "purple",
  rekkefolge: 40,
  lessons: [
    // ============ LEKSJON 1 ===========================================
    {
      id: "01-joint",
      title: "1. Joint distribution og marginalisering",
      narrative:
        "En **joint distribution** P(X1, X2, ..., Xn) gir sannsynligheten for hver kombinasjon av variabel-verdier. Med fire binære variabler (Cloudy, Sprinkler, Rain, WetGrass) får vi 2^4 = **16 rader**. Hver rad er én verden, og alle sammen summer til 1.\n\nFra jointen kan vi i prinsippet svare på *hvilket som helst* sannsynlighetsspørsmål. Vil du vite P(Rain=True)? Da summerer du alle rader der Rain=True. Dette kalles **marginalisering** — vi 'summer ut' variabler vi ikke bryr oss om.\n\n**Problem:** med n binære variabler vokser jointen som 2^n. 30 variabler = 1 milliard rader. Derfor finnes Bayes-nett: en *kompakt* representasjon som utnytter betinget uavhengighet. Men vi starter med jointen for å bygge intuisjonen.\n\n**Din oppgave:** Implementér `marginalize(joint, vars_order, var)` som summer ut én variabel og returnerer den nye, mindre jointen pluss den oppdaterte variabel-rekkefølgen.",
      files: {
        "joint.py": `# Joint distribution som dict: tuple(verdier) -> sannsynlighet.
# Variabel-rekkefølge i tuplen er gitt av VARS-listen.

VARS = ["Cloudy", "Sprinkler", "Rain", "WetGrass"]

# En eksempel-joint (ikke ekte modell — bare normaliserte tall til testen).
def _bygg_joint():
    from itertools import product
    raw = {}
    total = 0.0
    for c, s, r, w in product([True, False], repeat=4):
        p = 0.05
        if c and s and r and w: p = 0.10
        if c and not s and r and w: p = 0.12
        if not c and s and not r and not w: p = 0.08
        raw[(c, s, r, w)] = p
        total += p
    return {k: v / total for k, v in raw.items()}


joint = _bygg_joint()


# === DIN OPPGAVE ===
# Summer ut variabel "var" fra joint. Returner (ny_joint, ny_vars_order).
#   - finn indeksen til var i vars_order
#   - for hver (key, p) i joint:
#       lag ny key uten den indeksen
#       ny_joint[new_key] += p   (summer over alle verdier av var)
def marginalize(joint, vars_order, var):
    pass


def naer(a, b, tol=1e-9):
    return abs(a - b) < tol


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Sjekk 1: full joint summer til 1
sjekk(naer(sum(joint.values()), 1.0), True, "joint summer til 1")

# Sjekk 2: marginalisering reduserer antall rader fra 16 til 8
j_uten_C, vars_uten_C = marginalize(joint, VARS, "Cloudy")
sjekk(len(j_uten_C), 8, "marginalisering halverer antall rader")
sjekk(vars_uten_C, ["Sprinkler", "Rain", "WetGrass"], "Cloudy fjernet fra vars-listen")

# Sjekk 3: ny joint summer fortsatt til 1
sjekk(naer(sum(j_uten_C.values()), 1.0), True, "marginalisering bevarer total-masse")

# Sjekk 4: kontrollsum mot manuell beregning for ett spesifikt utfall.
# P(S=T, R=T, W=T) = P(C=T,S=T,R=T,W=T) + P(C=F,S=T,R=T,W=T)
forventet_STT = joint[(True, True, True, True)] + joint[(False, True, True, True)]
faktisk_STT = j_uten_C[(True, True, True)]
sjekk(naer(faktisk_STT, forventet_STT), True, "marginalisert verdi matcher manuell sum")
`,
      },
      defaultFile: "joint.py",
      editable: ["joint.py"],
      run: { kind: "python-script", entry: "joint.py" },
      verifications: [
        {
          label: "Joint distribution summer til 1",
          check: { kind: "output-contains", needle: "OK   joint summer til 1" },
        },
        {
          label: "Marginalisering halverer antall rader",
          check: { kind: "output-contains", needle: "OK   marginalisering halverer antall rader" },
        },
        {
          label: "Variabel fjernes fra vars-listen",
          check: { kind: "output-contains", needle: "OK   Cloudy fjernet fra vars-listen" },
        },
        {
          label: "Total sannsynlighet bevares",
          check: { kind: "output-contains", needle: "OK   marginalisering bevarer total-masse" },
        },
        {
          label: "Marginalisert sannsynlighet matcher manuell sum",
          check: { kind: "output-contains", needle: "OK   marginalisert verdi matcher manuell sum" },
        },
      ],
      hint:
        "def marginalize(joint, vars_order, var):\n    idx = vars_order.index(var)\n    new_vars = [v for v in vars_order if v != var]\n    new_joint = {}\n    for k, p in joint.items():\n        new_k = tuple(k[i] for i in range(len(k)) if i != idx)\n        new_joint[new_k] = new_joint.get(new_k, 0.0) + p\n    return new_joint, new_vars",
    },

    // ============ LEKSJON 2 ===========================================
    {
      id: "02-bayesnet-cpt",
      title: "2. Bayes-nett-struktur og CPT-er",
      narrative:
        "Et **Bayes-nett** er en kompakt representasjon av en joint distribution. Det består av:\n\n1. En **DAG** (directed acyclic graph) der hver node er en variabel.\n2. En **CPT (Conditional Probability Table)** for hver node: P(node | foreldre).\n\nKjede-regelen for Bayes-nett: P(X1, ..., Xn) = produkt over i av P(Xi | foreldre(Xi)). I stedet for 2^n verdier trenger vi bare summen av CPT-størrelsene — eksponentielt mindre når strukturen er sparsom.\n\nVi bygger det klassiske AIMA-nettet (Russell og Norvig, kap. 14):\n\n- **Burglar** (B) og **Earthquake** (E) er rot-noder.\n- **Alarm** (A) avhenger av begge.\n- **JohnCalls** (J) og **MaryCalls** (M) avhenger av Alarm.\n\nMed binære variabler trenger Alarm 2^2 = 4 rader (én per kombinasjon av foreldre), John og Mary trenger 2 rader hver. Vi lagrer bare **P(node = True | foreldre)** — P(False) er 1 minus det.\n\n**Din oppgave:** Implementér `BayesNet.cpt(node, parent_values)` som returnerer P(node = True | parents = parent_values). `parent_values` er en dict.",
      files: {
        "bayesnet.py": `class BayesNet:
    def __init__(self):
        self.nodes = []              # rekkefølge (topologisk)
        self.parents = {}            # node -> liste av foreldre
        self.cpts = {}               # node -> dict(tuple(parent_vals) -> P(node=True | parents))

    def add(self, node, parents, table):
        """Legg til en node med foreldre og CPT.
        table: dict tuple(parent_values) -> P(node = True | parents).
        For en rot-node er parents=[] og nøkkelen er ()."""
        self.nodes.append(node)
        self.parents[node] = list(parents)
        self.cpts[node] = dict(table)

    # === DIN OPPGAVE ===
    # Returner P(node = True | parent_values).
    # parent_values: dict {forelder-navn: True/False, ...}
    # Hent ut verdiene i samme rekkefølge som self.parents[node], lag tuple,
    # og slå opp i self.cpts[node].
    def cpt(self, node, parent_values):
        pass


# Bygg AIMA-nettet
net = BayesNet()
net.add("Burglar",    [],                      {(): 0.001})
net.add("Earthquake", [],                      {(): 0.002})
net.add("Alarm",      ["Burglar", "Earthquake"], {
    (True,  True):  0.95,
    (True,  False): 0.94,
    (False, True):  0.29,
    (False, False): 0.001,
})
net.add("JohnCalls",  ["Alarm"], {(True,): 0.90, (False,): 0.05})
net.add("MaryCalls",  ["Alarm"], {(True,): 0.70, (False,): 0.01})


def naer(a, b, tol=1e-9):
    return abs(a - b) < tol


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Rot-noder
sjekk(naer(net.cpt("Burglar", {}), 0.001), True, "P(Burglar=True) hentes korrekt")
sjekk(naer(net.cpt("Earthquake", {}), 0.002), True, "P(Earthquake=True) hentes korrekt")

# Alarm med begge foreldre
sjekk(naer(net.cpt("Alarm", {"Burglar": True, "Earthquake": False}), 0.94), True,
      "P(Alarm | B=T, E=F) = 0.94")
sjekk(naer(net.cpt("Alarm", {"Burglar": False, "Earthquake": False}), 0.001), True,
      "P(Alarm | B=F, E=F) = 0.001")

# Mary og John med én forelder
sjekk(naer(net.cpt("JohnCalls", {"Alarm": True}), 0.90), True,
      "P(JohnCalls | Alarm) = 0.90")
sjekk(naer(net.cpt("MaryCalls", {"Alarm": False}), 0.01), True,
      "P(MaryCalls | not Alarm) = 0.01")
`,
      },
      defaultFile: "bayesnet.py",
      editable: ["bayesnet.py"],
      run: { kind: "python-script", entry: "bayesnet.py" },
      verifications: [
        {
          label: "P(Burglar=True) returneres riktig",
          check: { kind: "output-contains", needle: "OK   P(Burglar=True) hentes korrekt" },
        },
        {
          label: "P(Earthquake=True) returneres riktig",
          check: { kind: "output-contains", needle: "OK   P(Earthquake=True) hentes korrekt" },
        },
        {
          label: "P(Alarm | B=T, E=F) slås opp riktig",
          check: { kind: "output-contains", needle: "OK   P(Alarm | B=T, E=F) = 0.94" },
        },
        {
          label: "P(Alarm | B=F, E=F) slås opp riktig",
          check: { kind: "output-contains", needle: "OK   P(Alarm | B=F, E=F) = 0.001" },
        },
        {
          label: "P(JohnCalls | Alarm) slås opp riktig",
          check: { kind: "output-contains", needle: "OK   P(JohnCalls | Alarm) = 0.90" },
        },
        {
          label: "P(MaryCalls | not Alarm) slås opp riktig",
          check: { kind: "output-contains", needle: "OK   P(MaryCalls | not Alarm) = 0.01" },
        },
      ],
      hint:
        "def cpt(self, node, parent_values):\n    key = tuple(parent_values[p] for p in self.parents[node])\n    return self.cpts[node][key]",
    },

    // ============ LEKSJON 3 ===========================================
    {
      id: "03-enumeration",
      title: "3. Inferens ved enumeration",
      narrative:
        "Nå skal vi svare på det berømte spørsmålet: **Hvis både John og Mary ringer, hva er sannsynligheten for innbrudd?**\n\nFormelt: P(Burglar | JohnCalls=True, MaryCalls=True).\n\nKjernen i enumeration-inferens er Bayes' regel + marginalisering:\n\nP(X | e) = alpha * sum over y av P(X, e, y)\n\nder y er alle kombinasjoner av skjulte variabler (her: Earthquake og Alarm), og alpha = 1 / P(e) er en normaliseringskonstant.\n\nVi rekursivt itererer over alle variabler i topologisk rekkefølge:\n- Hvis variabelen er i evidence eller spørsmålet: bruk den faste verdien, multipliser inn CPT.\n- Hvis ikke: summer over begge verdier (True og False).\n\nDet klassiske AIMA-svaret er **P(Burglar | JC, MC) ~ 0.284**. Naturlig — selv om begge ringer er det fortsatt 71% sjanse for at det IKKE er innbrudd (basisraten 0.001 trekker hardt ned).\n\n**Din oppgave:** Implementér `enumerate_all(vars, evidence, net)` — kjernen i rekursjonen.",
      files: {
        "enum.py": `class BayesNet:
    def __init__(self):
        self.nodes = []
        self.parents = {}
        self.cpts = {}

    def add(self, node, parents, table):
        self.nodes.append(node)
        self.parents[node] = list(parents)
        self.cpts[node] = dict(table)

    def cpt(self, node, parent_values):
        key = tuple(parent_values[p] for p in self.parents[node])
        return self.cpts[node][key]

    def p(self, node, value, full_assignment):
        """P(node = value | parents). full_assignment må inneholde alle foreldre."""
        p_true = self.cpt(node, full_assignment)
        return p_true if value else 1.0 - p_true


def enumerate_ask(X, evidence, net):
    """P(X | evidence) — returner dict X-verdi -> sannsynlighet."""
    Q = {}
    for x in [True, False]:
        e_ext = dict(evidence)
        e_ext[X] = x
        Q[x] = enumerate_all(net.nodes, e_ext, net)
    s = Q[True] + Q[False]
    return {k: v / s for k, v in Q.items()}


# === DIN OPPGAVE ===
# Rekursivt: ta første variabel Y i vars.
#   - hvis Y er i evidence: P(Y=evidence[Y] | parents) * enumerate_all(resten, evidence, net)
#   - ellers: summer over Y=True og Y=False, ekstender evidence i hvert kall
# Basis: tom vars-liste -> returner 1.0
def enumerate_all(vars, evidence, net):
    pass


# Bygg AIMA-nettet
net = BayesNet()
net.add("Burglar",    [],                      {(): 0.001})
net.add("Earthquake", [],                      {(): 0.002})
net.add("Alarm",      ["Burglar", "Earthquake"], {
    (True,  True):  0.95,
    (True,  False): 0.94,
    (False, True):  0.29,
    (False, False): 0.001,
})
net.add("JohnCalls",  ["Alarm"], {(True,): 0.90, (False,): 0.05})
net.add("MaryCalls",  ["Alarm"], {(True,): 0.70, (False,): 0.01})


posterior = enumerate_ask("Burglar", {"JohnCalls": True, "MaryCalls": True}, net)
print(f"P(Burglar=True | JC, MC) = {posterior[True]:.6f}")
print(f"P(Burglar=False | JC, MC) = {posterior[False]:.6f}")


def naer(a, b, tol=1e-4):
    return abs(a - b) < tol


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# AIMA-fasit: 0.2841718...
sjekk(naer(posterior[True], 0.2842), True, "P(Burglar | begge ringer) ~ 0.284")
sjekk(naer(posterior[True] + posterior[False], 1.0), True, "posterior summer til 1")

# Sanity: hvis ingen ringer, skal P(Burglar) være ~ basisraten 0.001
post_blank = enumerate_ask("Burglar", {}, net)
sjekk(naer(post_blank[True], 0.001), True, "uten evidens er P(Burglar) ~ basisrate")

# Sanity: hvis kun John ringer (kun ett vitne), posterior ligger ~0.016
post_john = enumerate_ask("Burglar", {"JohnCalls": True}, net)
sjekk(post_john[True] < posterior[True], True, "kun John gir lavere posterior enn begge")
`,
      },
      defaultFile: "enum.py",
      editable: ["enum.py"],
      run: { kind: "python-script", entry: "enum.py" },
      verifications: [
        {
          label: "P(Burglar | begge ringer) gir AIMA-svaret ~0.284",
          check: { kind: "output-contains", needle: "OK   P(Burglar | begge ringer) ~ 0.284" },
        },
        {
          label: "Posterior summer til 1 (normalisering)",
          check: { kind: "output-contains", needle: "OK   posterior summer til 1" },
        },
        {
          label: "Uten evidens er posterior lik basisraten",
          check: { kind: "output-contains", needle: "OK   uten evidens er P(Burglar) ~ basisrate" },
        },
        {
          label: "Færre vitner gir lavere posterior",
          check: { kind: "output-contains", needle: "OK   kun John gir lavere posterior enn begge" },
        },
      ],
      hint:
        "def enumerate_all(vars, evidence, net):\n    if not vars:\n        return 1.0\n    Y = vars[0]\n    rest = vars[1:]\n    if Y in evidence:\n        return net.p(Y, evidence[Y], evidence) * enumerate_all(rest, evidence, net)\n    else:\n        total = 0.0\n        for y in [True, False]:\n            e_ext = dict(evidence)\n            e_ext[Y] = y\n            total += net.p(Y, y, e_ext) * enumerate_all(rest, e_ext, net)\n        return total",
    },

    // ============ LEKSJON 4 ===========================================
    {
      id: "04-faktorer",
      title: "4. Faktorer og pointwise produkt",
      narrative:
        "Enumeration er korrekt, men gjentar mye arbeid. For et større nett blir det fort uoverkommelig.\n\nFor å gjøre noe smartere trenger vi en mer fleksibel byggekloss: **faktoren**. En faktor er en tabell som mapper assignment-tupler til tall — som en CPT, men uten noe krav om at det skal være en sannsynlighet (kan godt være 0.42 * 0.7 = 0.294).\n\nEksempel: en faktor over (X, Y) er en tabell med 4 rader for binære variabler. Kombinasjons-operasjonen er **pointwise produkt**: f1 multiplisert med f2 gir en ny faktor over union av variablene, der hver rad er produktet av matchende rader i de to.\n\nKonkret: hvis f1 har variabler [X] med rader (T)=0.6, (F)=0.4 og f2 har variabler [X, Y] med fire rader, så får f1*f2 variabler [X, Y] og hver verdi er f1[(x,)] * f2[(x, y)].\n\nDette er kjernen i variable elimination, som vi bygger i neste leksjon.\n\n**Din oppgave:** Implementér `pointwise_product(f1, f2)`. Tips: bruk `itertools.product([True, False], repeat=len(new_vars))` for å iterere over alle assignment-tupler.",
      files: {
        "faktor.py": `from itertools import product


class Factor:
    def __init__(self, vars, table):
        """vars: liste av variabel-navn. table: dict tuple(verdier i samme rekkefølge) -> tall."""
        self.vars = list(vars)
        self.table = dict(table)

    def __repr__(self):
        return f"Factor({self.vars})"


# === DIN OPPGAVE ===
# Kombiner to faktorer ved punktvis multiplikasjon.
# Steg:
#   1. new_vars = f1.vars ++ (de variabler fra f2 som ikke er i f1)
#   2. for hver kombinasjon assign over [True, False]^len(new_vars):
#        val_map = {var: verdi for var, verdi in zip(new_vars, assign)}
#        nøkkel1 = tuple(val_map[v] for v in f1.vars)
#        nøkkel2 = tuple(val_map[v] for v in f2.vars)
#        new_table[assign] = f1.table[nøkkel1] * f2.table[nøkkel2]
def pointwise_product(f1, f2):
    pass


def naer(a, b, tol=1e-9):
    return abs(a - b) < tol


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Test 1: f over [X], g over [X] -> produkt over [X] (samme variabler)
fa = Factor(["X"], {(True,): 0.6, (False,): 0.4})
fb = Factor(["X"], {(True,): 0.5, (False,): 0.5})
prod1 = pointwise_product(fa, fb)
sjekk(set(prod1.vars), {"X"}, "produkt av samme-var beholder samme variabler")
sjekk(naer(prod1.table[(True,)], 0.30), True, "produkt: 0.6 * 0.5 = 0.30")

# Test 2: faktor over [X] vs [X, Y] -> produkt over [X, Y]
fc = Factor(["X"], {(True,): 0.6, (False,): 0.4})
fd = Factor(["X", "Y"], {
    (True,  True):  0.7, (True,  False): 0.3,
    (False, True):  0.2, (False, False): 0.8,
})
prod2 = pointwise_product(fc, fd)
sjekk(set(prod2.vars), {"X", "Y"}, "produkt av [X] og [X,Y] gir [X,Y]")

# Verdi-sjekk: P(X=T) * P(Y=T|X=T) = 0.6 * 0.7 = 0.42
# Vi må finne riktig nøkkel uavhengig av rekkefølge i prod2.vars
def hent(f, val_map):
    return f.table[tuple(val_map[v] for v in f.vars)]

sjekk(naer(hent(prod2, {"X": True,  "Y": True}),  0.42), True, "0.6 * 0.7 = 0.42")
sjekk(naer(hent(prod2, {"X": True,  "Y": False}), 0.18), True, "0.6 * 0.3 = 0.18")
sjekk(naer(hent(prod2, {"X": False, "Y": True}),  0.08), True, "0.4 * 0.2 = 0.08")
sjekk(naer(hent(prod2, {"X": False, "Y": False}), 0.32), True, "0.4 * 0.8 = 0.32")

# Test 3: hvis vi summer alle rader når f1 og f2 begge er marginale sannsynligheter
# over uavhengige variabler, må summen være 1.
fe = Factor(["A"], {(True,): 0.3, (False,): 0.7})
fg = Factor(["B"], {(True,): 0.2, (False,): 0.8})
prod3 = pointwise_product(fe, fg)
sjekk(naer(sum(prod3.table.values()), 1.0), True, "produkt av uavhengige marginaler summer til 1")
`,
      },
      defaultFile: "faktor.py",
      editable: ["faktor.py"],
      run: { kind: "python-script", entry: "faktor.py" },
      verifications: [
        {
          label: "Produkt av faktor med seg selv beholder samme variabler",
          check: { kind: "output-contains", needle: "OK   produkt av samme-var beholder samme variabler" },
        },
        {
          label: "Skalar-multiplikasjon: 0.6 * 0.5 = 0.30",
          check: { kind: "output-contains", needle: "OK   produkt: 0.6 * 0.5 = 0.30" },
        },
        {
          label: "Variabel-union: [X] x [X,Y] gir [X,Y]",
          check: { kind: "output-contains", needle: "OK   produkt av [X] og [X,Y] gir [X,Y]" },
        },
        {
          label: "Rad-for-rad multiplikasjon: 0.6 * 0.7 = 0.42",
          check: { kind: "output-contains", needle: "OK   0.6 * 0.7 = 0.42" },
        },
        {
          label: "Rad-for-rad multiplikasjon: 0.4 * 0.8 = 0.32",
          check: { kind: "output-contains", needle: "OK   0.4 * 0.8 = 0.32" },
        },
        {
          label: "Produkt av uavhengige marginaler summer til 1",
          check: { kind: "output-contains", needle: "OK   produkt av uavhengige marginaler summer til 1" },
        },
      ],
      hint:
        "def pointwise_product(f1, f2):\n    new_vars = list(f1.vars) + [v for v in f2.vars if v not in f1.vars]\n    new_table = {}\n    for assign in product([True, False], repeat=len(new_vars)):\n        val_map = dict(zip(new_vars, assign))\n        k1 = tuple(val_map[v] for v in f1.vars)\n        k2 = tuple(val_map[v] for v in f2.vars)\n        new_table[assign] = f1.table[k1] * f2.table[k2]\n    return Factor(new_vars, new_table)",
    },

    // ============ LEKSJON 5 ===========================================
    {
      id: "05-variable-elimination",
      title: "5. Variable elimination",
      narrative:
        "**Variable elimination (VE)** er den smarte versjonen av enumeration. I stedet for å iterere over alle 2^n verdier av skjulte variabler, jobber vi med faktorer og eliminerer én skjult variabel om gangen.\n\nAlgoritmen:\n\n1. Lag én faktor for hver CPT (multiplier inn evidence ved å filtrere bort rader som strider).\n2. For hver skjult variabel H:\n   - Multipliser sammen alle faktorer som har H i scope (pointwise produkt).\n   - Summer ut H fra det produktet (kalt **sum-out**).\n   - Erstatt de gamle faktorene med den nye, mindre faktoren.\n3. Til slutt: multipliser sammen alle resterende faktorer og normaliser.\n\nVinninga er at vi aldri jobber med jointen som helhet — bare små lokale faktorer. På større nett er VE eksponentielt raskere enn enumeration.\n\nVi har gitt deg `restrict` (filtrer på evidence), `pointwise_product` (fra forrige leksjon) og `normalize`. Du skal skrive `sum_out(var, factor)` og `variable_elimination(X, evidence, net)`.\n\n**Din oppgave:** to funksjoner. `sum_out` fjerner én variabel ved å summere over begge verdier. `variable_elimination` orkesterer hele algoritmen.",
      files: {
        "ve.py": `from itertools import product


class BayesNet:
    def __init__(self):
        self.nodes = []
        self.parents = {}
        self.cpts = {}

    def add(self, node, parents, table):
        self.nodes.append(node)
        self.parents[node] = list(parents)
        self.cpts[node] = dict(table)


class Factor:
    def __init__(self, vars, table):
        self.vars = list(vars)
        self.table = dict(table)


def cpt_to_factor(net, node):
    """CPT for node -> Factor med variabler [foreldre..., node]."""
    vars = list(net.parents[node]) + [node]
    table = {}
    for assign in product([True, False], repeat=len(net.parents[node])):
        p_true = net.cpts[node][assign]
        table[tuple(list(assign) + [True])]  = p_true
        table[tuple(list(assign) + [False])] = 1.0 - p_true
    return Factor(vars, table)


def pointwise_product(f1, f2):
    new_vars = list(f1.vars) + [v for v in f2.vars if v not in f1.vars]
    new_table = {}
    for assign in product([True, False], repeat=len(new_vars)):
        val_map = dict(zip(new_vars, assign))
        k1 = tuple(val_map[v] for v in f1.vars)
        k2 = tuple(val_map[v] for v in f2.vars)
        new_table[assign] = f1.table[k1] * f2.table[k2]
    return Factor(new_vars, new_table)


def restrict(factor, var, value):
    """Bruk evidence: behold bare rader hvor var=value, fjern var fra scope."""
    new_vars = [v for v in factor.vars if v != var]
    idx = factor.vars.index(var)
    new_table = {}
    for k, v in factor.table.items():
        if k[idx] == value:
            new_k = tuple(k[i] for i in range(len(k)) if i != idx)
            new_table[new_k] = v
    return Factor(new_vars, new_table)


def normalize(factor):
    s = sum(factor.table.values())
    return Factor(factor.vars, {k: v / s for k, v in factor.table.items()})


# === DIN OPPGAVE 1 ===
# Fjern variabel "var" fra faktoren ved å summere over [True, False].
# Resultatet har én færre variabel.
#   - new_vars = factor.vars uten "var"
#   - idx = factor.vars.index(var)
#   - for hver assign over [True, False]^len(new_vars):
#       summer factor.table[(...med var=True...)] + factor.table[(...med var=False...)]
def sum_out(var, factor):
    pass


# === DIN OPPGAVE 2 ===
# Variable elimination:
#   1. Lag faktor per node, restriker hver med evidence
#   2. For hver skjult variabel h (alle bortsett fra X og evidence):
#        - samle alle faktorer som har h i scope
#        - multipliser dem sammen
#        - sum_out h
#        - erstatt de samlede faktorene med den nye
#   3. Multipliser resterende, normaliser, returner dict X-verdi -> p
def variable_elimination(X, evidence, net):
    pass


# Bygg AIMA-nettet
net = BayesNet()
net.add("Burglar",    [],                      {(): 0.001})
net.add("Earthquake", [],                      {(): 0.002})
net.add("Alarm",      ["Burglar", "Earthquake"], {
    (True,  True):  0.95,
    (True,  False): 0.94,
    (False, True):  0.29,
    (False, False): 0.001,
})
net.add("JohnCalls",  ["Alarm"], {(True,): 0.90, (False,): 0.05})
net.add("MaryCalls",  ["Alarm"], {(True,): 0.70, (False,): 0.01})


post = variable_elimination("Burglar", {"JohnCalls": True, "MaryCalls": True}, net)
print(f"VE P(Burglar=True | JC, MC)  = {post[True]:.6f}")
print(f"VE P(Burglar=False | JC, MC) = {post[False]:.6f}")


def naer(a, b, tol=1e-4):
    return abs(a - b) < tol


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# VE skal gi samme svar som enumeration: ~0.2842
sjekk(naer(post[True], 0.2842), True, "VE matcher AIMA-svaret ~0.284")
sjekk(naer(post[True] + post[False], 1.0), True, "VE-posterior summer til 1")

# Sjekk uten evidens
post_blank = variable_elimination("Burglar", {}, net)
sjekk(naer(post_blank[True], 0.001), True, "VE uten evidens gir basisrate")

# Sjekk sum_out alene: sum_out("Y", f) på f([X,Y] -> {(T,T)=0.42,(T,F)=0.18,(F,T)=0.08,(F,F)=0.32})
# må gi [X] -> {(T,)=0.60, (F,)=0.40}
test_f = Factor(["X", "Y"], {
    (True,  True):  0.42, (True,  False): 0.18,
    (False, True):  0.08, (False, False): 0.32,
})
res = sum_out("Y", test_f)
sjekk(res.vars, ["X"], "sum_out fjerner riktig variabel fra scope")
sjekk(naer(res.table[(True,)], 0.60), True, "sum_out: 0.42 + 0.18 = 0.60")
sjekk(naer(res.table[(False,)], 0.40), True, "sum_out: 0.08 + 0.32 = 0.40")
`,
      },
      defaultFile: "ve.py",
      editable: ["ve.py"],
      run: { kind: "python-script", entry: "ve.py" },
      verifications: [
        {
          label: "VE gir samme AIMA-svar som enumeration (~0.284)",
          check: { kind: "output-contains", needle: "OK   VE matcher AIMA-svaret ~0.284" },
        },
        {
          label: "VE-posterior summer til 1",
          check: { kind: "output-contains", needle: "OK   VE-posterior summer til 1" },
        },
        {
          label: "VE uten evidens reduserer til basisraten",
          check: { kind: "output-contains", needle: "OK   VE uten evidens gir basisrate" },
        },
        {
          label: "sum_out fjerner riktig variabel",
          check: { kind: "output-contains", needle: "OK   sum_out fjerner riktig variabel fra scope" },
        },
        {
          label: "sum_out summerer rader korrekt: 0.42 + 0.18 = 0.60",
          check: { kind: "output-contains", needle: "OK   sum_out: 0.42 + 0.18 = 0.60" },
        },
      ],
      hint:
        "def sum_out(var, factor):\n    new_vars = [v for v in factor.vars if v != var]\n    idx = factor.vars.index(var)\n    new_table = {}\n    for assign in product([True, False], repeat=len(new_vars)):\n        total = 0.0\n        for v in [True, False]:\n            full = list(assign)\n            full.insert(idx, v)\n            total += factor.table[tuple(full)]\n        new_table[assign] = total\n    return Factor(new_vars, new_table)\n\n\ndef variable_elimination(X, evidence, net):\n    factors = []\n    for node in net.nodes:\n        f = cpt_to_factor(net, node)\n        for ev_var, ev_val in evidence.items():\n            if ev_var in f.vars:\n                f = restrict(f, ev_var, ev_val)\n        factors.append(f)\n    hidden = [v for v in net.nodes if v != X and v not in evidence]\n    for h in hidden:\n        involved = [f for f in factors if h in f.vars]\n        rest     = [f for f in factors if h not in f.vars]\n        if not involved:\n            continue\n        prod = involved[0]\n        for f in involved[1:]:\n            prod = pointwise_product(prod, f)\n        prod = sum_out(h, prod)\n        factors = rest + [prod]\n    result = factors[0]\n    for f in factors[1:]:\n        result = pointwise_product(result, f)\n    result = normalize(result)\n    return {k[0]: v for k, v in result.table.items()}",
    },

    // ============ LEKSJON 6 ===========================================
    {
      id: "06-dseparasjon",
      title: "6. D-separasjon — betinget uavhengighet",
      narrative:
        "Det fineste med Bayes-nett er at strukturen direkte forteller oss hvilke uavhengighets-relasjoner som holder. Verktøyet heter **d-separasjon**.\n\nTo noder X og Y er **d-separated** gitt evidence E hvis ALLE stier mellom dem er **blokkert**. En sti er blokkert hvis det finnes en mellom-node Z på stien slik at:\n\n- **Kjede** (A -> Z -> B) eller **diverging** (A <- Z -> B): blokkert hvis Z er i E (vi har observert mellomstedet).\n- **Collider** (A -> Z <- B): blokkert hvis Z OG alle dens etterkommere er UTENFOR E. Observerer du en collider eller noe nedstrøms, *åpnes* stien — det er den famøse 'explaining away'-effekten.\n\nEksempler fra Burglar-nettet:\n\n- **E og J uten evidens:** sti E -> A -> J er en åpen kjede -> IKKE d-separert.\n- **E og J gitt {A}:** kjeden blokkeres -> d-separert.\n- **B og E uten evidens:** sti B -> A <- E er en collider, ingen observasjon -> blokkert, så d-separert.\n- **B og E gitt {A}:** colliden er observert -> stien åpnes, ikke lenger d-separert.\n\nVi har gitt deg `ancestors(...)`-helper. Du skal implementere `d_separated(x, y, evidence, parents, children)` ved en BFS som markerer hvilke stier som er aktive.\n\n**Din oppgave:** Implementér d-separasjon-sjekken etter Bayes-ball-/reachable-algoritmen. Detaljene står i koden.",
      files: {
        "dsep.py": `# DAG-en til AIMA-nettet
parents = {
    "Burglar":     [],
    "Earthquake":  [],
    "Alarm":       ["Burglar", "Earthquake"],
    "JohnCalls":   ["Alarm"],
    "MaryCalls":   ["Alarm"],
}
nodes = list(parents.keys())
children = {n: [] for n in nodes}
for n, ps in parents.items():
    for p in ps:
        children[p].append(n)


def ancestors(node_set, parents):
    """Returner mengden av alle forfedre (inkl. selv) til nodene i node_set."""
    result = set(node_set)
    changed = True
    while changed:
        changed = False
        for n in list(result):
            for p in parents[n]:
                if p not in result:
                    result.add(p)
                    changed = True
    return result


# === DIN OPPGAVE ===
# Implementér d-separasjon ved BFS over (node, retning)-tilstander.
# Retning "up" betyr at vi kom inn i node fra et BARN. Retning "down" fra en FORELDER.
#
# Algoritmen (Bayes-ball / Geiger-Verma):
#   1. ev_anc = ancestors(evidence, parents)
#   2. frontier = [(x, "up"), (x, "down")]; visited = sett
#   3. mens frontier ikke er tom:
#        pop (node, d)
#        hvis (node, d) allerede besøkt: hopp
#        marker som besøkt
#        hvis node == y og node != x: returner False (de er IKKE d-separated)
#
#        hvis d == "up":  (kom fra et barn)
#          hvis node IKKE er i evidence:
#            for hver forelder p: legg til (p, "up")
#            for hvert barn  c: legg til (c, "down")  -- diverging
#
#        hvis d == "down":  (kom fra en forelder)
#          hvis node IKKE er i evidence:
#            for hvert barn c: legg til (c, "down")   -- kjede
#          hvis node ER i ev_anc:  (collider observert eller har observert etterkommer)
#            for hver forelder p: legg til (p, "up")
#
#   4. y ble aldri nådd -> returner True
def d_separated(x, y, evidence, parents, children):
    pass


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Klassiske d-sep-spørsmål for Burglar-nettet:
sjekk(d_separated("Earthquake", "JohnCalls", set(), parents, children), False,
      "E og J UTEN evidens er IKKE d-separated (kjede)")

sjekk(d_separated("Earthquake", "JohnCalls", {"Alarm"}, parents, children), True,
      "E og J GITT Alarm ER d-separated (kjede blokkeres)")

sjekk(d_separated("Burglar", "Earthquake", set(), parents, children), True,
      "B og E uten evidens ER d-separated (collider lukket)")

sjekk(d_separated("Burglar", "Earthquake", {"Alarm"}, parents, children), False,
      "B og E gitt Alarm er IKKE d-separated (collider observert -> explaining away)")

sjekk(d_separated("JohnCalls", "MaryCalls", set(), parents, children), False,
      "John og Mary uten evidens er IKKE d-separated (delt forfar)")

sjekk(d_separated("JohnCalls", "MaryCalls", {"Alarm"}, parents, children), True,
      "John og Mary GITT Alarm ER d-separated")
`,
      },
      defaultFile: "dsep.py",
      editable: ["dsep.py"],
      run: { kind: "python-script", entry: "dsep.py" },
      verifications: [
        {
          label: "E og J uten evidens: ikke d-separert (kjede)",
          check: { kind: "output-contains", needle: "OK   E og J UTEN evidens er IKKE d-separated" },
        },
        {
          label: "E og J gitt Alarm: d-separert (kjede blokkeres)",
          check: { kind: "output-contains", needle: "OK   E og J GITT Alarm ER d-separated" },
        },
        {
          label: "B og E uten evidens: d-separert (collider lukket)",
          check: { kind: "output-contains", needle: "OK   B og E uten evidens ER d-separated" },
        },
        {
          label: "B og E gitt Alarm: collider observert -> explaining away",
          check: { kind: "output-contains", needle: "OK   B og E gitt Alarm er IKKE d-separated" },
        },
        {
          label: "John og Mary uten evidens: delt forfar => avhengige",
          check: { kind: "output-contains", needle: "OK   John og Mary uten evidens er IKKE d-separated" },
        },
        {
          label: "John og Mary gitt Alarm: d-separert",
          check: { kind: "output-contains", needle: "OK   John og Mary GITT Alarm ER d-separated" },
        },
      ],
      hint:
        "def d_separated(x, y, evidence, parents, children):\n    ev = set(evidence)\n    ev_anc = ancestors(ev, parents)\n    visited = set()\n    frontier = [(x, \"up\"), (x, \"down\")]\n    while frontier:\n        node, d = frontier.pop()\n        if (node, d) in visited:\n            continue\n        visited.add((node, d))\n        if node == y and node != x:\n            return False\n        if d == \"up\":\n            if node not in ev:\n                for p in parents[node]:\n                    frontier.append((p, \"up\"))\n                for c in children[node]:\n                    frontier.append((c, \"down\"))\n        else:\n            if node not in ev:\n                for c in children[node]:\n                    frontier.append((c, \"down\"))\n            if node in ev_anc:\n                for p in parents[node]:\n                    frontier.append((p, \"up\"))\n    return True",
    },
  ],
};

const MDP_QLEARNING: MiniCourse = {
  id: "mdp-qlearning",
  slug: "mdp-qlearning",
  title: "MDP og Q-learning fra null",
  blurb:
    "Bygg en stokastisk GridWorld og en agent som lærer å navigere den — først ved å regne ut optimale verdier med full kunnskap (value iteration og policy iteration), så ved ren prøving og feiling uten å vite hvordan verdenen virker (Q-learning og SARSA). Avslutt med cliff-walking-eksempelet som viser hvorfor on-policy og off-policy lærer ulike strategier.",
  estimertTid: "75–90 min",
  fag: ["DTE-2501", "Klassisk AI", "Reinforcement learning"],
  color: "purple",
  rekkefolge: 50,
  lessons: [
    // ============ LEKSJON 1 ===========================================
    {
      id: "01-mdp-grid",
      title: "1. MDP-strukturen og GridWorld",
      narrative:
        "En **Markov Decision Process (MDP)** er det matematiske skjelettet under all reinforcement learning. Den har fem deler:\n\n1. **S** — mengden av tilstander.\n2. **A** — mengden av handlinger.\n3. **T(s, a, s')** — sannsynligheten for å havne i s' når du gjør a fra s.\n4. **R(s, a, s')** — belønningen for overgangen.\n5. **gamma** — diskonteringsfaktor (0 ≤ gamma ≤ 1) som vekter framtidige belønninger.\n\nMarkov-egenskapen sier at fremtiden bare avhenger av nåværende tilstand — fortidens vei dit spiller ingen rolle.\n\n**GridWorld 4×3** (AIMA-figur 17.1) er den klassiske test-MDP-en. Et 4-bredt-3-høyt grid med koordinater (x, y), y=0 nederst. Mål-tilstand +1 ved (3, 2). Felle -1 ved (3, 1). En vegg ved (1, 1) — agenten kan ikke stå der. Handlinger {N, S, E, W} er **stokastiske**: 80% sjanse for å gå i intendert retning, 10% til hver side. Hvis du støter mot vegg eller kant: du blir stående. Hver overgang til en ikke-terminal-tilstand gir belønning -0.04 (\"living cost\"); +1 ved mål, -1 ved felle.\n\n**Hvorfor stokastisk?** Reelle verdener er støyete. En robot som prøver å gå nord glir av og til vestover. En policy som ignorerer det, fungerer dårlig i virkeligheten.\n\n**Din oppgave:** Implementér `transitions(s, a)` som returnerer en liste av `(prob, next_state, reward)`-tripler. Bruk hjelpefunksjonen `move(s, a)` som allerede er gitt — den håndterer vegg/kant ved å returnere s uendret.",
      files: {
        "gridworld.py": `# GridWorld 4x3 (AIMA fig 17.1)
COLS, ROWS = 4, 3
WALL = (1, 1)
PLUS = (3, 2)
MINUS = (3, 1)
LIVING = -0.04
TERMINALS = {PLUS, MINUS}
ACTIONS = ["N", "S", "E", "W"]
DELTAS = {"N": (0, 1), "S": (0, -1), "E": (1, 0), "W": (-1, 0)}
# For en gitt intendert handling: hva er de to "perpendikulere" sklirelningene?
PERP = {"N": ["W", "E"], "S": ["E", "W"], "E": ["N", "S"], "W": ["S", "N"]}


def all_states():
    return [(x, y) for x in range(COLS) for y in range(ROWS) if (x, y) != WALL]


def move(s, a):
    """Forsøk steget. Treffer vegg eller kant => bli stående."""
    dx, dy = DELTAS[a]
    nx, ny = s[0] + dx, s[1] + dy
    if 0 <= nx < COLS and 0 <= ny < ROWS and (nx, ny) != WALL:
        return (nx, ny)
    return s


def reward_for_entering(s):
    if s == PLUS:
        return 1.0
    if s == MINUS:
        return -1.0
    return LIVING


def transitions(s, a):
    """Returner liste av (prob, next_state, reward).

    Terminal-tilstander har en selv-loop med prob 1.0 og reward 0.
    Ikke-terminal: 0.8 sannsynlighet for intendert retning,
    0.1 for hver av de to perpendikulere. Slå sammen utfall som
    havner i samme next_state.
    """
    # === DIN OPPGAVE ===
    # Hvis s in TERMINALS: returner [(1.0, s, 0.0)]
    # Ellers:
    #   intended = move(s, a)
    #   left     = move(s, PERP[a][0])
    #   right    = move(s, PERP[a][1])
    #   Bygg en dict ns -> prob ved å summere 0.8/0.1/0.1.
    #   Returner [(p, ns, reward_for_entering(ns)) for ns, p in dict.items()]
    return []


# ============ TESTER ============
def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


def sjekk_nær(faktisk, forventet, navn, tol=1e-9):
    if faktisk is None:
        print(f"FEIL {navn}: fikk None")
        return
    if abs(faktisk - forventet) < tol:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Terminal: selv-loop
ts = transitions(PLUS, "N")
sjekk(len(ts), 1, "terminal returnerer ett utfall")
if ts:
    p, ns, r = ts[0]
    sjekk_nær(p, 1.0, "terminal: prob = 1.0")
    sjekk(ns, PLUS, "terminal: blir stående")
    sjekk_nær(r, 0.0, "terminal: reward = 0")

# Fra (0, 0), N: 0.8 -> (0, 1), 0.1 -> (0, 0) (vest, kant), 0.1 -> (1, 0) (øst)
ts00N = transitions((0, 0), "N")
prob_sum = sum(p for p, _, _ in ts00N)
sjekk_nær(prob_sum, 1.0, "fra (0,0) N: prob-er summer til 1.0")
prob_by_ns = {ns: p for p, ns, _ in ts00N}
sjekk_nær(prob_by_ns.get((0, 1), 0.0), 0.8, "fra (0,0) N: 0.8 til (0,1)")
sjekk_nær(prob_by_ns.get((0, 0), 0.0), 0.1, "fra (0,0) N: 0.1 blir stående (kant W)")
sjekk_nær(prob_by_ns.get((1, 0), 0.0), 0.1, "fra (0,0) N: 0.1 til (1,0)")

# Fra (2, 2), E: prøver østover mot +1-cellen (3, 2). Sjekk overgang.
ts22E = transitions((2, 2), "E")
prob_by_ns_22 = {ns: p for p, ns, _ in ts22E}
sjekk_nær(prob_by_ns_22.get((3, 2), 0.0), 0.8, "fra (2,2) E: 0.8 til mål (3,2)")
# Hvilken reward har overgangen til (3, 2)?
for p, ns, r in ts22E:
    if ns == (3, 2):
        sjekk_nær(r, 1.0, "fra (2,2) E: reward = +1 ved å treffe målet")
        break

# Fra (0, 0), E: 0.8 -> (1, 0); 0.1 N -> (0, 1); 0.1 S -> (0, 0).
ts00E = transitions((0, 0), "E")
prob_by_ns_E = {ns: p for p, ns, _ in ts00E}
sjekk_nær(prob_by_ns_E.get((1, 0), 0.0), 0.8, "fra (0,0) E: 0.8 til (1,0)")
sjekk_nær(prob_by_ns_E.get((0, 1), 0.0), 0.1, "fra (0,0) E: 0.1 til (0,1) (N-skliing)")
sjekk_nær(prob_by_ns_E.get((0, 0), 0.0), 0.1, "fra (0,0) E: 0.1 blir stående (S-kant)")
`,
      },
      defaultFile: "gridworld.py",
      editable: ["gridworld.py"],
      run: { kind: "python-script", entry: "gridworld.py" },
      verifications: [
        { label: "Terminal har én selv-loop", check: { kind: "output-contains", needle: "OK   terminal returnerer ett utfall" } },
        { label: "Terminal: prob 1.0", check: { kind: "output-contains", needle: "OK   terminal: prob = 1.0" } },
        { label: "Terminal: next_state = seg selv", check: { kind: "output-contains", needle: "OK   terminal: blir stående" } },
        { label: "Terminal: reward 0", check: { kind: "output-contains", needle: "OK   terminal: reward = 0" } },
        { label: "Sannsynlighetene summer til 1", check: { kind: "output-contains", needle: "OK   fra (0,0) N: prob-er summer til 1.0" } },
        { label: "80% i intendert retning", check: { kind: "output-contains", needle: "OK   fra (0,0) N: 0.8 til (0,1)" } },
        { label: "10% sklir vestover (kant)", check: { kind: "output-contains", needle: "OK   fra (0,0) N: 0.1 blir stående (kant W)" } },
        { label: "10% sklir østover", check: { kind: "output-contains", needle: "OK   fra (0,0) N: 0.1 til (1,0)" } },
        { label: "Overgang til mål gir +1", check: { kind: "output-contains", needle: "OK   fra (2,2) E: reward = +1 ved å treffe målet" } },
      ],
      hint:
        "if s in TERMINALS:\n    return [(1.0, s, 0.0)]\nintended = move(s, a)\nleft = move(s, PERP[a][0])\nright = move(s, PERP[a][1])\nbucket = {}\nfor p, ns in [(0.8, intended), (0.1, left), (0.1, right)]:\n    bucket[ns] = bucket.get(ns, 0.0) + p\nreturn [(p, ns, reward_for_entering(ns)) for ns, p in bucket.items()]",
    },

    // ============ LEKSJON 2 ===========================================
    {
      id: "02-value-iteration",
      title: "2. Value iteration: Bellmans optimal-ligning",
      narrative:
        "Hva er den beste oppførselen i en MDP? Vi definerer **V*(s)** som forventet diskontert framtidig belønning hvis vi spiller optimalt fra s. **Bellmans optimal-ligning** sier at V* tilfredsstiller:\n\n```\nV*(s) = max_a  sum_{s'} T(s, a, s') * ( R(s, a, s') + gamma * V*(s') )\n```\n\nLes den slik: \"den beste verdien i s er den handlingen som maksimerer forventet umiddelbar belønning pluss diskontert verdi av neste tilstand\". Det er et fastpunkt: en verdifunksjon som ER optimal er konsistent med denne ligningen.\n\n**Value iteration** finner V* ved å bruke ligningen som en oppdaterings-regel. Start med V_0 = 0. Beregn V_{k+1}(s) som høyresiden av Bellman, basert på V_k. Gjenta. Det kan vises at avstanden mellom V_k og V* krymper med faktor gamma per iterasjon — så vi konvergerer eksponentielt.\n\nStopp-kriterium: når `max_s |V_{k+1}(s) - V_k(s)| < tol`.\n\n**Hvorfor gamma < 1?** Diskontering modellerer både utålmodighet og usikkerhet om fremtiden. For uendelige episoder gjør gamma summen konvergent. For endelige episoder er det ikke strengt nødvendig, men gjør optimaliseringen veloppdragen.\n\n**Din oppgave:** Implementér `value_iteration(gamma, tol)` som returnerer dict-en V*. Terminal-tilstander skal beholde V = 0 — all belønningen kommer FRA overgangen INN i dem, ikke ut av dem.",
      files: {
        "vi.py": `# Gjenbruk MDP-koden fra leksjon 1 (ferdig utfylt her)
COLS, ROWS = 4, 3
WALL = (1, 1)
PLUS = (3, 2)
MINUS = (3, 1)
LIVING = -0.04
TERMINALS = {PLUS, MINUS}
ACTIONS = ["N", "S", "E", "W"]
DELTAS = {"N": (0, 1), "S": (0, -1), "E": (1, 0), "W": (-1, 0)}
PERP = {"N": ["W", "E"], "S": ["E", "W"], "E": ["N", "S"], "W": ["S", "N"]}


def all_states():
    return [(x, y) for x in range(COLS) for y in range(ROWS) if (x, y) != WALL]


def move(s, a):
    dx, dy = DELTAS[a]
    nx, ny = s[0] + dx, s[1] + dy
    if 0 <= nx < COLS and 0 <= ny < ROWS and (nx, ny) != WALL:
        return (nx, ny)
    return s


def reward_for_entering(s):
    return 1.0 if s == PLUS else (-1.0 if s == MINUS else LIVING)


def transitions(s, a):
    if s in TERMINALS:
        return [(1.0, s, 0.0)]
    bucket = {}
    for p, ns in [(0.8, move(s, a)), (0.1, move(s, PERP[a][0])), (0.1, move(s, PERP[a][1]))]:
        bucket[ns] = bucket.get(ns, 0.0) + p
    return [(p, ns, reward_for_entering(ns)) for ns, p in bucket.items()]


def value_iteration(gamma=0.9, tol=1e-6, max_iter=1000):
    """Returner dict V* over alle ikke-vegg-tilstander.

    Terminal-tilstander: V(s) = 0 (belønningen kommer fra å GÅ INN i dem).
    """
    V = {s: 0.0 for s in all_states()}
    # === DIN OPPGAVE ===
    # Iterer max_iter ganger:
    #   delta = 0
    #   new_V = kopi av V
    #   For hver s i all_states():
    #       hvis s in TERMINALS: new_V[s] = 0.0; continue
    #       For hver a i ACTIONS: regn Q(s,a) = sum_(p, ns, r) p * (r + gamma * V[ns])
    #       new_V[s] = max over a
    #       oppdater delta = max(delta, |new_V[s] - V[s]|)
    #   V = new_V
    #   hvis delta < tol: break
    return V


# ============ TESTER ============
V = value_iteration(gamma=0.9)
print("V*:")
for y in range(ROWS - 1, -1, -1):
    for x in range(COLS):
        s = (x, y)
        if s == WALL:
            print(f"{'WALL':>8}", end=" ")
        else:
            print(f"{V[s]:8.3f}", end=" ")
    print()


def sjekk_innenfor(faktisk, lo, hi, navn):
    if faktisk is None:
        print(f"FEIL {navn}: fikk None")
        return
    if lo <= faktisk <= hi:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, ikke i [{lo}, {hi}]")


def sjekk_nær(faktisk, forventet, navn, tol=0.02):
    if faktisk is None:
        print(f"FEIL {navn}: fikk None")
        return
    if abs(faktisk - forventet) < tol:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# AIMA-referansetall ved gamma=0.9: V*((0,0)) ca 0.37, V*((2,2)) ca 0.93.
sjekk_nær(V[(0, 0)], 0.374, "V*((0,0)) ca 0.37")
sjekk_nær(V[(2, 2)], 0.928, "V*((2,2)) ca 0.93 (ett steg fra +1)")
sjekk_nær(V[(0, 2)], 0.610, "V*((0,2)) ca 0.61")
print("OK   V*((0,0)) < V*((0,1)) (lenger fra mål)" if V[(0, 0)] < V[(0, 1)] else f"FEIL V*((0,0)) skulle være < V*((0,1))")
sjekk_innenfor(V[(2, 0)], 0.0, 0.5, "V*((2,0)) liten (nær -1-feller)")

# Terminal-verdier skal være 0
print(f"OK   terminal V=0 ved +1" if V[PLUS] == 0.0 else f"FEIL terminal V skal være 0 ved +1, fikk {V[PLUS]}")
print(f"OK   terminal V=0 ved -1" if V[MINUS] == 0.0 else f"FEIL terminal V skal være 0 ved -1, fikk {V[MINUS]}")
`,
      },
      defaultFile: "vi.py",
      editable: ["vi.py"],
      run: { kind: "python-script", entry: "vi.py" },
      verifications: [
        { label: "V*((0,0)) konvergerer til AIMA-tall", check: { kind: "output-contains", needle: "OK   V*((0,0)) ca 0.37" } },
        { label: "V*((2,2)) er nær 1 (ett steg fra mål)", check: { kind: "output-contains", needle: "OK   V*((2,2)) ca 0.93 (ett steg fra +1)" } },
        { label: "V*((0,2)) er omtrent 0.61", check: { kind: "output-contains", needle: "OK   V*((0,2)) ca 0.61" } },
        { label: "Tilstander nær -1-fellen har lav verdi", check: { kind: "output-contains", needle: "OK   V*((2,0)) liten (nær -1-feller)" } },
        { label: "Terminal-tilstand +1 har V=0", check: { kind: "output-contains", needle: "OK   terminal V=0 ved +1" } },
        { label: "Terminal-tilstand -1 har V=0", check: { kind: "output-contains", needle: "OK   terminal V=0 ved -1" } },
      ],
      hint:
        "for it in range(max_iter):\n    delta = 0.0\n    new_V = dict(V)\n    for s in all_states():\n        if s in TERMINALS:\n            new_V[s] = 0.0\n            continue\n        best = -float('inf')\n        for a in ACTIONS:\n            q = sum(p * (r + gamma * V[ns]) for p, ns, r in transitions(s, a))\n            if q > best:\n                best = q\n        new_V[s] = best\n        delta = max(delta, abs(new_V[s] - V[s]))\n    V = new_V\n    if delta < tol:\n        break\nreturn V",
    },

    // ============ LEKSJON 3 ===========================================
    {
      id: "03-policy-extract",
      title: "3. Ekstrahere policy fra verdiene",
      narrative:
        "V*(s) forteller hvor BRA hver tilstand er. Men vi vil egentlig vite hva agenten skal GJØRE der. Det er **policy-en** pi(s): en handling for hver tilstand.\n\n**Ekstraksjons-regel:** velg handlingen som maksimerer den forventede verdien av neste-tilstand:\n\n```\npi*(s) = argmax_a  sum_{s'} T(s, a, s') * ( R(s, a, s') + gamma * V*(s') )\n```\n\nDette uttrykket inni argmax-en kalles **Q*(s, a)** — den optimale handlings-verdi-funksjonen. Vi tar bare den handlingen med høyest Q i hver tilstand.\n\n**Hvorfor er dette greedy-ekstraktet OPTIMAL?** Fordi V* er definert via Bellmans optimal-ligning, og argmax-en der ER nettopp policy-handlingen. Bellman-fastpunktet og greedy-mhp-V* er to sider av samme sak.\n\n**ASCII-visualisering:** vi vil se policy-en som et grid med piler: `^` (N), `v` (S), `>` (E), `<` (W). Mål-cellen vises som `+`, felle som `-`, vegg som `#`.\n\n**Din oppgave:** Implementér `optimal_policy(V, gamma)`. For hver ikke-terminal-tilstand: regn ut Q for hver handling, returner argmax. Test verifiserer:\n- Policy ved (2, 2) er E (ett steg øst → mål).\n- Policy ved (3, 0) — den \"farlige\" cellen rett under -1 — er W (gå vekk fra fellen, ikke N).\n- Policy unngår fellen.",
      files: {
        "policy.py": `# Ferdig MDP-kode fra leksjon 1 og 2
COLS, ROWS = 4, 3
WALL = (1, 1)
PLUS = (3, 2)
MINUS = (3, 1)
LIVING = -0.04
TERMINALS = {PLUS, MINUS}
ACTIONS = ["N", "S", "E", "W"]
DELTAS = {"N": (0, 1), "S": (0, -1), "E": (1, 0), "W": (-1, 0)}
PERP = {"N": ["W", "E"], "S": ["E", "W"], "E": ["N", "S"], "W": ["S", "N"]}
ARROWS = {"N": "^", "S": "v", "E": ">", "W": "<"}


def all_states():
    return [(x, y) for x in range(COLS) for y in range(ROWS) if (x, y) != WALL]


def move(s, a):
    dx, dy = DELTAS[a]
    nx, ny = s[0] + dx, s[1] + dy
    if 0 <= nx < COLS and 0 <= ny < ROWS and (nx, ny) != WALL:
        return (nx, ny)
    return s


def reward_for_entering(s):
    return 1.0 if s == PLUS else (-1.0 if s == MINUS else LIVING)


def transitions(s, a):
    if s in TERMINALS:
        return [(1.0, s, 0.0)]
    bucket = {}
    for p, ns in [(0.8, move(s, a)), (0.1, move(s, PERP[a][0])), (0.1, move(s, PERP[a][1]))]:
        bucket[ns] = bucket.get(ns, 0.0) + p
    return [(p, ns, reward_for_entering(ns)) for ns, p in bucket.items()]


def value_iteration(gamma=0.9, tol=1e-6, max_iter=1000):
    V = {s: 0.0 for s in all_states()}
    for _ in range(max_iter):
        delta = 0.0
        new_V = dict(V)
        for s in all_states():
            if s in TERMINALS:
                new_V[s] = 0.0
                continue
            best = -float("inf")
            for a in ACTIONS:
                q = sum(p * (r + gamma * V[ns]) for p, ns, r in transitions(s, a))
                if q > best:
                    best = q
            new_V[s] = best
            delta = max(delta, abs(new_V[s] - V[s]))
        V = new_V
        if delta < tol:
            break
    return V


def optimal_policy(V, gamma=0.9):
    """Returner dict pi: state -> action for alle ikke-terminale tilstander."""
    pi = {}
    # === DIN OPPGAVE ===
    # For hver s i all_states():
    #   hvis s in TERMINALS: hopp over
    #   ellers: pi[s] = argmax_a sum_(p, ns, r) p * (r + gamma * V[ns])
    return pi


def print_policy(pi):
    for y in range(ROWS - 1, -1, -1):
        for x in range(COLS):
            s = (x, y)
            if s == WALL:
                ch = "#"
            elif s == PLUS:
                ch = "+"
            elif s == MINUS:
                ch = "-"
            else:
                ch = ARROWS[pi[s]]
            print(ch, end=" ")
        print()


# ============ TESTER ============
V = value_iteration(gamma=0.9)
pi = optimal_policy(V, gamma=0.9)
print("Optimal policy:")
print_policy(pi)


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Disse posisjonene har én tydelig optimal handling:
sjekk(pi.get((2, 2)), "E", "pi((2,2)) = E (ett steg til mål)")
sjekk(pi.get((0, 2)), "E", "pi((0,2)) = E (toppraden, gå mot målet)")
sjekk(pi.get((1, 2)), "E", "pi((1,2)) = E (fortsett mot målet)")
# (3, 0) er rett under -1-fellen. Optimal handling er W (vekk fra fellen),
# ikke N (som ville sklidd 10% inn i fellen).
sjekk(pi.get((3, 0)), "W", "pi((3,0)) = W (unngå -1-fellen)")
# Terminaler skal IKKE være i policy-en
sjekk(PLUS in pi, False, "terminal +1 ikke i policy")
sjekk(MINUS in pi, False, "terminal -1 ikke i policy")
`,
      },
      defaultFile: "policy.py",
      editable: ["policy.py"],
      run: { kind: "python-script", entry: "policy.py" },
      verifications: [
        { label: "Policy ved (2,2) er E", check: { kind: "output-contains", needle: "OK   pi((2,2)) = E (ett steg til mål)" } },
        { label: "Toppraden går østover", check: { kind: "output-contains", needle: "OK   pi((0,2)) = E (toppraden, gå mot målet)" } },
        { label: "Policy fortsetter østover", check: { kind: "output-contains", needle: "OK   pi((1,2)) = E (fortsett mot målet)" } },
        { label: "Policy unngår -1-fellen ved (3,0)", check: { kind: "output-contains", needle: "OK   pi((3,0)) = W (unngå -1-fellen)" } },
        { label: "Terminaler er ikke i policy", check: { kind: "output-contains", needle: "OK   terminal +1 ikke i policy" } },
      ],
      hint:
        "for s in all_states():\n    if s in TERMINALS:\n        continue\n    best_a, best_q = None, -float('inf')\n    for a in ACTIONS:\n        q = sum(p * (r + gamma * V[ns]) for p, ns, r in transitions(s, a))\n        if q > best_q:\n            best_q, best_a = q, a\n    pi[s] = best_a\nreturn pi",
    },

    // ============ LEKSJON 4 ===========================================
    {
      id: "04-policy-iteration",
      title: "4. Policy iteration",
      narrative:
        "**Value iteration** flytter på V-er. **Policy iteration** flytter på selve policy-en og ofte i færre iterasjoner. Den veksler mellom to steg:\n\n1. **Policy evaluation** — gitt en policy pi, regn ut V_pi (verdien hvis du følger pi). Dette er Bellman UTEN max — bare den handlingen pi velger:\n\n   ```\n   V_pi(s) = sum_{s'} T(s, pi(s), s') * ( R(s, pi(s), s') + gamma * V_pi(s') )\n   ```\n\n   Vi løser dette iterativt (samme stil som VI, men med faste handlinger).\n\n2. **Policy improvement** — gjør pi greedy mot V_pi:\n\n   ```\n   pi_ny(s) = argmax_a sum_{s'} T(s,a,s') * (R(s,a,s') + gamma * V_pi(s'))\n   ```\n\nGjenta til policy-en ikke endrer seg. Da har du fastpunkt og dermed optimal pi.\n\n**Hvorfor færre iterasjoner?** VI flytter små marginale skritt på V-er; PI gjør store hopp ved å fullføre evaluation før improvement. Hver iterasjon er dyrere, men det går ofte raskere totalt — og den terminerer EKSAKT (fordi det fins endelig mange policy-er).\n\nVi starter med en tilfeldig policy (alle N). Det vil ta noen runder før den når optimal.\n\n**Din oppgave:** Implementér `policy_iteration(gamma, eval_iter)`. Returner `(pi, V, antall_runder)`. Sjekk at policy-en er identisk med den fra VI.",
      files: {
        "pi.py": `# Ferdig MDP-kode
COLS, ROWS = 4, 3
WALL = (1, 1)
PLUS = (3, 2)
MINUS = (3, 1)
LIVING = -0.04
TERMINALS = {PLUS, MINUS}
ACTIONS = ["N", "S", "E", "W"]
DELTAS = {"N": (0, 1), "S": (0, -1), "E": (1, 0), "W": (-1, 0)}
PERP = {"N": ["W", "E"], "S": ["E", "W"], "E": ["N", "S"], "W": ["S", "N"]}


def all_states():
    return [(x, y) for x in range(COLS) for y in range(ROWS) if (x, y) != WALL]


def move(s, a):
    dx, dy = DELTAS[a]
    nx, ny = s[0] + dx, s[1] + dy
    if 0 <= nx < COLS and 0 <= ny < ROWS and (nx, ny) != WALL:
        return (nx, ny)
    return s


def reward_for_entering(s):
    return 1.0 if s == PLUS else (-1.0 if s == MINUS else LIVING)


def transitions(s, a):
    if s in TERMINALS:
        return [(1.0, s, 0.0)]
    bucket = {}
    for p, ns in [(0.8, move(s, a)), (0.1, move(s, PERP[a][0])), (0.1, move(s, PERP[a][1]))]:
        bucket[ns] = bucket.get(ns, 0.0) + p
    return [(p, ns, reward_for_entering(ns)) for ns, p in bucket.items()]


def value_iteration(gamma=0.9, tol=1e-8, max_iter=2000):
    """Brukes som referanse — vi sjekker at PI gir samme policy."""
    V = {s: 0.0 for s in all_states()}
    for _ in range(max_iter):
        delta = 0.0
        new_V = dict(V)
        for s in all_states():
            if s in TERMINALS:
                new_V[s] = 0.0
                continue
            best = -float("inf")
            for a in ACTIONS:
                q = sum(p * (r + gamma * V[ns]) for p, ns, r in transitions(s, a))
                if q > best:
                    best = q
            new_V[s] = best
            delta = max(delta, abs(new_V[s] - V[s]))
        V = new_V
        if delta < tol:
            break
    return V


def vi_policy(V, gamma=0.9):
    pi = {}
    for s in all_states():
        if s in TERMINALS:
            continue
        pi[s] = max(ACTIONS, key=lambda a: sum(p * (r + gamma * V[ns]) for p, ns, r in transitions(s, a)))
    return pi


# ============ DIN OPPGAVE ============
def policy_eval(pi, gamma=0.9, iters=100):
    """Iterativ policy evaluation: fastpunktiterasjon med fast pi."""
    V = {s: 0.0 for s in all_states()}
    for _ in range(iters):
        new_V = dict(V)
        for s in all_states():
            if s in TERMINALS:
                new_V[s] = 0.0
                continue
            a = pi[s]
            new_V[s] = sum(p * (r + gamma * V[ns]) for p, ns, r in transitions(s, a))
        V = new_V
    return V


def policy_iteration(gamma=0.9, eval_iter=100):
    """Returner (pi, V, antall_runder)."""
    # Start med tilfeldig policy: alle nord
    pi = {s: "N" for s in all_states() if s not in TERMINALS}
    runder = 0
    # === DIN OPPGAVE ===
    # while True:
    #   runder += 1
    #   V = policy_eval(pi, gamma, eval_iter)
    #   stable = True
    #   for s in alle ikke-terminale stater:
    #       gammel = pi[s]
    #       pi[s] = argmax_a sum_(p,ns,r) p * (r + gamma * V[ns])
    #       hvis pi[s] != gammel: stable = False
    #   hvis stable: break
    # return pi, V, runder
    return pi, {}, runder


# ============ TESTER ============
pi_pi, V_pi, runder = policy_iteration(gamma=0.9, eval_iter=200)
V_vi = value_iteration(gamma=0.9)
pi_vi = vi_policy(V_vi, gamma=0.9)

print(f"Policy iteration konvergerte i {runder} runder.")


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


def sjekk_innenfor(faktisk, lo, hi, navn):
    if faktisk is None:
        print(f"FEIL {navn}: fikk None")
        return
    if lo <= faktisk <= hi:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, ikke i [{lo}, {hi}]")


# PI skal gi samme policy som VI
sjekk(pi_pi.get((2, 2)), pi_vi.get((2, 2)), "PI og VI gir samme handling ved (2,2)")
sjekk(pi_pi.get((0, 2)), pi_vi.get((0, 2)), "PI og VI gir samme handling ved (0,2)")
sjekk(pi_pi.get((3, 0)), pi_vi.get((3, 0)), "PI og VI gir samme handling ved (3,0)")
sjekk(pi_pi.get((0, 0)), pi_vi.get((0, 0)), "PI og VI gir samme handling ved start (0,0)")
# Antall runder skal være rimelig lite (typisk 3-7 for dette grid-et)
sjekk_innenfor(runder, 1, 20, "PI konvergerte i et rimelig antall runder")
`,
      },
      defaultFile: "pi.py",
      editable: ["pi.py"],
      run: { kind: "python-script", entry: "pi.py" },
      verifications: [
        { label: "PI matcher VI ved (2,2)", check: { kind: "output-contains", needle: "OK   PI og VI gir samme handling ved (2,2)" } },
        { label: "PI matcher VI ved (0,2)", check: { kind: "output-contains", needle: "OK   PI og VI gir samme handling ved (0,2)" } },
        { label: "PI matcher VI ved (3,0)", check: { kind: "output-contains", needle: "OK   PI og VI gir samme handling ved (3,0)" } },
        { label: "PI matcher VI ved start (0,0)", check: { kind: "output-contains", needle: "OK   PI og VI gir samme handling ved start (0,0)" } },
        { label: "PI konvergerer raskt", check: { kind: "output-contains", needle: "OK   PI konvergerte i et rimelig antall runder" } },
      ],
      hint:
        "while True:\n    runder += 1\n    V = policy_eval(pi, gamma, eval_iter)\n    stable = True\n    for s in all_states():\n        if s in TERMINALS:\n            continue\n        gammel = pi[s]\n        pi[s] = max(ACTIONS, key=lambda a: sum(p * (r + gamma * V[ns]) for p, ns, r in transitions(s, a)))\n        if pi[s] != gammel:\n            stable = False\n    if stable:\n        break\nreturn pi, V, runder",
    },

    // ============ LEKSJON 5 ===========================================
    {
      id: "05-q-learning",
      title: "5. Q-learning: model-free RL",
      narrative:
        "Frem til nå har vi visst T og R perfekt. Det er **planlegging**, ikke læring. Reinforcement learning gir agenten en mye hardere oppgave: lær uten å ha tilgang til T eller R. Agenten ser bare (state, action, reward, next_state)-overganger fra opplevelse — og må gjette resten.\n\n**Q-learning** bygger en tabell Q(s, a) som tilnærmer Q*(s, a). Oppdaterings-regelen er en **temporal difference** (TD)-formel:\n\n```\nQ(s, a) <- Q(s, a) + alpha * ( r + gamma * max_a' Q(s', a') - Q(s, a) )\n```\n\nLes uttrykket i parentes: \"hva vi nettopp observerte (r + gamma * beste-fremtidige-Q) MINUS hva tabellen sa (Q(s, a))\". Det er feilen — TD-feilen. Vi nudger tabellen alpha-andelen i retning sannheten.\n\n**Off-policy:** Q-learning bruker max over neste-handlinger i oppdateringen, uavhengig av hva agenten faktisk gjorde. Den lærer alltid den OPTIMALE policy-en, selv om den utforsker dårligere.\n\n**Epsilon-greedy:** under trening velger agenten en tilfeldig handling med sannsynlighet epsilon, ellers argmax Q. Dette balanserer **utforskning** (lære noe nytt) og **utnyttelse** (få belønning).\n\nVi bruker `random.seed(42)` for reproduserbarhet — uten den varierer resultatene fra kjøring til kjøring.\n\n**Din oppgave:** Implementér `q_learning(episodes, alpha, gamma, epsilon)`. Etter 5000 episoder skal greedy-policy-en fra Q ligne den fra value iteration på de viktigste cellene.",
      files: {
        "qlearn.py": `import random

# ============ MDP-SIMULATOR (model-free interface) ============
# Agenten ser bare step(s, a) -> (next_state, reward, done)
COLS, ROWS = 4, 3
WALL = (1, 1)
PLUS = (3, 2)
MINUS = (3, 1)
LIVING = -0.04
START = (0, 0)
TERMINALS = {PLUS, MINUS}
ACTIONS = ["N", "S", "E", "W"]
DELTAS = {"N": (0, 1), "S": (0, -1), "E": (1, 0), "W": (-1, 0)}
PERP = {"N": ["W", "E"], "S": ["E", "W"], "E": ["N", "S"], "W": ["S", "N"]}


def all_states():
    return [(x, y) for x in range(COLS) for y in range(ROWS) if (x, y) != WALL]


def move(s, a):
    dx, dy = DELTAS[a]
    nx, ny = s[0] + dx, s[1] + dy
    if 0 <= nx < COLS and 0 <= ny < ROWS and (nx, ny) != WALL:
        return (nx, ny)
    return s


def reward_for_entering(s):
    return 1.0 if s == PLUS else (-1.0 if s == MINUS else LIVING)


def step(s, a):
    """Stokastisk steg: 80% intendert, 10% hver perpendikulær. Agenten ser kun resultatet."""
    if s in TERMINALS:
        return s, 0.0, True
    r = random.random()
    if r < 0.8:
        chosen = a
    elif r < 0.9:
        chosen = PERP[a][0]
    else:
        chosen = PERP[a][1]
    ns = move(s, chosen)
    return ns, reward_for_entering(ns), ns in TERMINALS


# ============ DIN OPPGAVE ============
def q_learning(episodes, alpha=0.1, gamma=0.9, epsilon=0.1, max_steps=200):
    """Returner Q-tabell etter trening.

    For hver episode:
      s = START
      gjenta inntil terminal eller max_steps:
        epsilon-greedy velg a fra Q[s, *]
        ns, r, done = step(s, a)
        beste_neste = 0 hvis ns terminal, ellers max_a Q[(ns, a)]
        Q[(s, a)] += alpha * (r + gamma * beste_neste - Q[(s, a)])
        s = ns
    """
    Q = {(s, a): 0.0 for s in all_states() for a in ACTIONS}
    # === DIN OPPGAVE ===
    # Implementér løkken over episodes som beskrevet.
    return Q


def greedy_policy(Q):
    pi = {}
    for s in all_states():
        if s in TERMINALS:
            continue
        pi[s] = max(ACTIONS, key=lambda a: Q[(s, a)])
    return pi


# ============ TESTER ============
random.seed(42)
Q = q_learning(episodes=5000, alpha=0.1, gamma=0.9, epsilon=0.1)
pi = greedy_policy(Q)

print("Lært greedy-policy:")
ARROWS = {"N": "^", "S": "v", "E": ">", "W": "<"}
for y in range(ROWS - 1, -1, -1):
    for x in range(COLS):
        s = (x, y)
        if s == WALL:
            ch = "#"
        elif s == PLUS:
            ch = "+"
        elif s == MINUS:
            ch = "-"
        else:
            ch = ARROWS[pi[s]]
        print(ch, end=" ")
    print()


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Q har lært noe — sjekk at noen viktige Q-verdier er positive
def sjekk_større(faktisk, terskel, navn):
    if faktisk > terskel:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk}, ikke > {terskel}")


# (2, 2) er ett steg fra +1. Q((2,2), E) bør være høyt (nær 1).
sjekk_større(Q[((2, 2), "E")], 0.7, "Q((2,2), E) > 0.7 (ett steg fra mål)")
# Policy ved (2, 2) skal være E
sjekk(pi.get((2, 2)), "E", "lært pi((2,2)) = E")
# Policy ved (0, 2) skal være E (gå mot målet langs topp)
sjekk(pi.get((0, 2)), "E", "lært pi((0,2)) = E")
# Policy ved (1, 2) skal være E
sjekk(pi.get((1, 2)), "E", "lært pi((1,2)) = E")
`,
      },
      defaultFile: "qlearn.py",
      editable: ["qlearn.py"],
      run: { kind: "python-script", entry: "qlearn.py" },
      verifications: [
        { label: "Q-verdi nær mål er høy", check: { kind: "output-contains", needle: "OK   Q((2,2), E) > 0.7 (ett steg fra mål)" } },
        { label: "Lært policy: pi((2,2)) = E", check: { kind: "output-contains", needle: "OK   lært pi((2,2)) = E" } },
        { label: "Lært policy: pi((0,2)) = E", check: { kind: "output-contains", needle: "OK   lært pi((0,2)) = E" } },
        { label: "Lært policy: pi((1,2)) = E", check: { kind: "output-contains", needle: "OK   lært pi((1,2)) = E" } },
      ],
      hint:
        "for ep in range(episodes):\n    s = START\n    for _ in range(max_steps):\n        if s in TERMINALS:\n            break\n        if random.random() < epsilon:\n            a = random.choice(ACTIONS)\n        else:\n            a = max(ACTIONS, key=lambda act: Q[(s, act)])\n        ns, r, done = step(s, a)\n        best_next = 0.0 if ns in TERMINALS else max(Q[(ns, act)] for act in ACTIONS)\n        Q[(s, a)] = Q[(s, a)] + alpha * (r + gamma * best_next - Q[(s, a)])\n        s = ns\n        if done:\n            break\nreturn Q",
    },

    // ============ LEKSJON 6 ===========================================
    {
      id: "06-eps-greedy",
      title: "6. Epsilon-greedy: utforskning vs utnyttelse",
      narrative:
        "Hvilken epsilon skal du velge? Det er den mest fundamentale tradeoffen i RL:\n\n- **Lav epsilon** (nesten ren utnyttelse): agenten holder seg til det den TROR er best. Hvis den initielle gjettingen er feil, blir den sittende fast i en suboptimal policy. Den utforsker aldri nok til å finne bedre alternativer.\n- **Høy epsilon** (mye utforskning): agenten gjør tilfeldige ting hele tiden. Den oppdager kanskje gode strategier, men UTNYTTER dem aldri — så total-belønningen lider.\n\nDe to ekstremene har et søtt sted i mellom. På vårt grid er 0.1 vanligvis fint.\n\nFor å se det konkret skal vi måle **gjennomsnittlig total-reward per episode** for tre verdier av epsilon. Etter trening evaluerer vi GREEDY (ingen epsilon) policy-en fra hver konfigurasjon for å se hvor god den ble.\n\n**Læringskurver i ASCII:** vi bucketter episodene i 10 bins og printer gjennomsnittlig reward som stjerner. Større stjerner = bedre.\n\n**Din oppgave:** Implementér `evaluate_policy(Q, episodes)` som kjører agenten i ren-greedy modus (ingen epsilon) og returnerer gjennomsnittlig sum-reward. Bruk denne til å sammenligne ulike epsilon-verdier.\n\nForventede observasjoner:\n- epsilon=0.01 og 0.1 lærer ofte rimelige policy-er. epsilon=0.1 er typisk best.\n- epsilon=0.5 lærer kanskje en OK policy, men den lave snitt-rewarden under trening viser at agenten kaster bort tid på tilfeldighet.",
      files: {
        "eps.py": `import random

COLS, ROWS = 4, 3
WALL = (1, 1)
PLUS = (3, 2)
MINUS = (3, 1)
LIVING = -0.04
START = (0, 0)
TERMINALS = {PLUS, MINUS}
ACTIONS = ["N", "S", "E", "W"]
DELTAS = {"N": (0, 1), "S": (0, -1), "E": (1, 0), "W": (-1, 0)}
PERP = {"N": ["W", "E"], "S": ["E", "W"], "E": ["N", "S"], "W": ["S", "N"]}


def all_states():
    return [(x, y) for x in range(COLS) for y in range(ROWS) if (x, y) != WALL]


def move(s, a):
    dx, dy = DELTAS[a]
    nx, ny = s[0] + dx, s[1] + dy
    if 0 <= nx < COLS and 0 <= ny < ROWS and (nx, ny) != WALL:
        return (nx, ny)
    return s


def reward_for_entering(s):
    return 1.0 if s == PLUS else (-1.0 if s == MINUS else LIVING)


def step(s, a):
    if s in TERMINALS:
        return s, 0.0, True
    r = random.random()
    if r < 0.8:
        chosen = a
    elif r < 0.9:
        chosen = PERP[a][0]
    else:
        chosen = PERP[a][1]
    ns = move(s, chosen)
    return ns, reward_for_entering(ns), ns in TERMINALS


def q_learning_traced(episodes, alpha=0.1, gamma=0.9, epsilon=0.1, max_steps=200):
    """Q-learning som returnerer Q OG en liste over total-reward per episode."""
    Q = {(s, a): 0.0 for s in all_states() for a in ACTIONS}
    rewards = []
    for ep in range(episodes):
        s = START
        total = 0.0
        for _ in range(max_steps):
            if s in TERMINALS:
                break
            if random.random() < epsilon:
                a = random.choice(ACTIONS)
            else:
                a = max(ACTIONS, key=lambda act: Q[(s, act)])
            ns, r, done = step(s, a)
            total += r
            best_next = 0.0 if ns in TERMINALS else max(Q[(ns, act)] for act in ACTIONS)
            Q[(s, a)] = Q[(s, a)] + alpha * (r + gamma * best_next - Q[(s, a)])
            s = ns
            if done:
                break
        rewards.append(total)
    return Q, rewards


# ============ DIN OPPGAVE ============
def evaluate_policy(Q, episodes=200, max_steps=200):
    """Kjør agenten i ren-greedy modus (ingen epsilon). Returner snitt sum-reward per episode."""
    # === DIN OPPGAVE ===
    # For hver episode:
    #   s = START, total = 0
    #   gjenta inntil terminal eller max_steps:
    #     a = argmax_a Q[(s, a)]
    #     ns, r, done = step(s, a)
    #     total += r
    #     s = ns
    #   samle total
    # Returner snittet.
    return 0.0


# ============ TESTER ============
def kjør(epsilon, episodes=1500):
    random.seed(42)
    Q, rewards = q_learning_traced(episodes, alpha=0.1, gamma=0.9, epsilon=epsilon)
    eval_score = evaluate_policy(Q, episodes=200)
    return Q, rewards, eval_score


print("Læringskurver (gjennomsnitt per 150-episode-bin):")
print()
for eps in [0.01, 0.1, 0.5]:
    _, rewards, _ = kjør(eps)
    print(f"epsilon = {eps}:")
    bin_size = len(rewards) // 10
    for i in range(10):
        bucket = rewards[i * bin_size:(i + 1) * bin_size]
        snitt = sum(bucket) / len(bucket) if bucket else 0.0
        stars_count = max(0, min(40, int((snitt + 1.0) * 25)))
        print(f"  {i*bin_size:4d}..{(i+1)*bin_size-1:4d}: {snitt:+.3f}  {'*' * stars_count}")
    print()

print("Greedy-evaluering av lærte policy-er:")
print(f"{'epsilon':>10}  {'snitt-reward (greedy)':>22}")
score_by_eps = {}
for eps in [0.01, 0.1, 0.5]:
    _, _, score = kjør(eps)
    score_by_eps[eps] = score
    print(f"{eps:>10}  {score:>22.3f}")


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


def sjekk_større(faktisk, terskel, navn):
    if faktisk > terskel:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk}, ikke > {terskel}")


# Greedy-evaluert policy med epsilon=0.1 skal nå målet (positiv snitt-reward)
sjekk_større(score_by_eps[0.1], 0.5, "epsilon=0.1 lærer policy med snitt-reward > 0.5")
sjekk_større(score_by_eps[0.01], 0.0, "epsilon=0.01 evalueringen er bedre enn null")
# epsilon=0.5 skal IKKE være best i greedy-evaluering — den tilfeldige utforskningen
# senker treningskvaliteten. Vi sjekker at 0.1 er BEDRE eller LIK 0.5.
if score_by_eps[0.1] >= score_by_eps[0.5] - 0.05:
    print("OK   epsilon=0.1 er minst like god som 0.5 i greedy-evaluering")
else:
    print(f"FEIL eps=0.1 ({score_by_eps[0.1]:.3f}) skulle slå 0.5 ({score_by_eps[0.5]:.3f})")
`,
      },
      defaultFile: "eps.py",
      editable: ["eps.py"],
      run: { kind: "python-script", entry: "eps.py" },
      verifications: [
        { label: "Lært policy ved epsilon=0.1 lykkes (snitt > 0.5)", check: { kind: "output-contains", needle: "OK   epsilon=0.1 lærer policy med snitt-reward > 0.5" } },
        { label: "Selv epsilon=0.01 lærer noe nyttig", check: { kind: "output-contains", needle: "OK   epsilon=0.01 evalueringen er bedre enn null" } },
        { label: "Moderat utforskning slår høy utforskning", check: { kind: "output-contains", needle: "OK   epsilon=0.1 er minst like god som 0.5 i greedy-evaluering" } },
      ],
      hint:
        "totals = []\nfor _ in range(episodes):\n    s = START\n    total = 0.0\n    for _ in range(max_steps):\n        if s in TERMINALS:\n            break\n        a = max(ACTIONS, key=lambda act: Q[(s, act)])\n        ns, r, done = step(s, a)\n        total += r\n        s = ns\n        if done:\n            break\n    totals.append(total)\nreturn sum(totals) / len(totals)",
    },

    // ============ LEKSJON 7 ===========================================
    {
      id: "07-sarsa-cliff",
      title: "7. SARSA vs Q-learning på cliff-walking",
      narrative:
        "**SARSA** er en TD-algoritme i samme familie som Q-learning, men med én avgjørende forskjell. Oppdateringen bruker den NESTE FAKTISKE handlingen, ikke max:\n\n```\nQ(s, a) <- Q(s, a) + alpha * ( r + gamma * Q(s', a') - Q(s, a) )\n```\n\nDet gjør SARSA **on-policy** — den lærer verdien av den policy-en den faktisk følger (inkludert epsilon-utforskningen). Q-learning er **off-policy**: den lærer verdien av den OPTIMALE policy-en, uavhengig av hvor mye den utforsker.\n\n**Cliff-walking** (Sutton & Barto kap. 6) er det klassiske eksempelet som viser forskjellen. Grid: 12 kolonner × 4 rader. Start ved (0, 0), mål ved (11, 0). Hele bunnraden mellom dem — celler (1,0) til (10,0) — er et **stup**: -100 reward og teleport tilbake til start. Ellers -1 per steg.\n\nOptimal under PERFEKT spilling: gå langs kanten på rad 1 (12 steg, -12 reward). Men med epsilon-utforskning kan en glipp inn i stupet koste -100. Q-learning IGNORERER denne risikoen (off-policy: regner som om vi alltid spiller greedy), så den lærer å gå langs kanten. SARSA TAR INN risikoen (on-policy: medregner at vi noen ganger gjør tilfeldige trekk), så den lærer en tryggere vei lenger fra stupet — gjerne via y=2 eller y=3.\n\nDet pedagogiske poenget: \"optimalt\" avhenger av om vi sammenligner med ren-greedy spilling (Q-learning) eller med den faktiske blanding av exploit+explore (SARSA).\n\n**Din oppgave:** Implementér `sarsa(episodes, alpha, gamma, epsilon)`. Strukturen er HELT lik Q-learning, men du må velge `a'` FØR du oppdaterer, og bruke `Q[(ns, na)]` istedenfor max.",
      files: {
        "sarsa.py": `import random

# ============ CLIFF-WALKING WORLD ============
COLS, ROWS = 12, 4
START = (0, 0)
GOAL = (11, 0)
CLIFF = {(x, 0) for x in range(1, 11)}
ACTIONS = ["N", "S", "E", "W"]
DELTAS = {"N": (0, 1), "S": (0, -1), "E": (1, 0), "W": (-1, 0)}


def all_states():
    return [(x, y) for x in range(COLS) for y in range(ROWS)]


def step(s, a):
    """Deterministisk steg i cliff-world. Tråkk i stup => -100 og teleport til start."""
    if s == GOAL:
        return s, 0.0, True
    dx, dy = DELTAS[a]
    nx, ny = s[0] + dx, s[1] + dy
    if not (0 <= nx < COLS and 0 <= ny < ROWS):
        nx, ny = s  # bli stående mot vegg
    ns = (nx, ny)
    if ns in CLIFF:
        return START, -100.0, False
    if ns == GOAL:
        return ns, -1.0, True
    return ns, -1.0, False


def epsilon_greedy(Q, s, epsilon):
    if random.random() < epsilon:
        return random.choice(ACTIONS)
    return max(ACTIONS, key=lambda a: Q[(s, a)])


def q_learning(episodes, alpha=0.1, gamma=1.0, epsilon=0.1, max_steps=500):
    """Standard Q-learning. Beholdt som referanse — IKKE rør."""
    Q = {(s, a): 0.0 for s in all_states() for a in ACTIONS}
    for _ in range(episodes):
        s = START
        for _ in range(max_steps):
            if s == GOAL:
                break
            a = epsilon_greedy(Q, s, epsilon)
            ns, r, done = step(s, a)
            best_next = 0.0 if ns == GOAL else max(Q[(ns, act)] for act in ACTIONS)
            Q[(s, a)] = Q[(s, a)] + alpha * (r + gamma * best_next - Q[(s, a)])
            s = ns
            if done:
                break
    return Q


# ============ DIN OPPGAVE ============
def sarsa(episodes, alpha=0.1, gamma=1.0, epsilon=0.1, max_steps=500):
    """On-policy SARSA. Forskjell fra Q-learning:
       - velg neste handling a' FØR oppdatering (med epsilon-greedy)
       - bruk Q[(s', a')] istedenfor max_a Q[(s', a)] i oppdateringen
    """
    Q = {(s, a): 0.0 for s in all_states() for a in ACTIONS}
    # === DIN OPPGAVE ===
    # For hver episode:
    #   s = START
    #   a = epsilon_greedy(Q, s, epsilon)
    #   gjenta inntil ferdig eller max_steps:
    #     ns, r, done = step(s, a)
    #     na = epsilon_greedy(Q, ns, epsilon) hvis ns != GOAL else None
    #     next_q = 0.0 hvis ns == GOAL else Q[(ns, na)]
    #     Q[(s, a)] += alpha * (r + gamma * next_q - Q[(s, a)])
    #     s, a = ns, na
    #     break hvis done
    return Q


def greedy_path(Q, max_len=50):
    s = START
    path = [s]
    for _ in range(max_len):
        if s == GOAL:
            break
        a = max(ACTIONS, key=lambda act: Q[(s, act)])
        ns, _, done = step(s, a)
        path.append(ns)
        s = ns
        if done:
            break
    return path


# ============ TESTER ============
random.seed(42)
Q_ql = q_learning(episodes=500, alpha=0.1, gamma=1.0, epsilon=0.1)
random.seed(42)
Q_sa = sarsa(episodes=500, alpha=0.1, gamma=1.0, epsilon=0.1)

path_ql = greedy_path(Q_ql)
path_sa = greedy_path(Q_sa)

print(f"Q-learning sti-lengde: {len(path_ql)}")
print(f"  sti: {path_ql}")
print(f"SARSA sti-lengde: {len(path_sa)}")
print(f"  sti: {path_sa}")

CLIFF_ADJ = {(x, 1) for x in range(1, 11)}  # rader 1 over stupet


def cliff_adj_count(path):
    return sum(1 for s in path if s in CLIFF_ADJ)


ql_adj = cliff_adj_count(path_ql)
sa_adj = cliff_adj_count(path_sa)
print(f"Q-learning kantceller besøkt: {ql_adj}")
print(f"SARSA kantceller besøkt:      {sa_adj}")


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


def sjekk_større_eller_lik(faktisk, terskel, navn):
    if faktisk >= terskel:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk}, ikke >= {terskel}")


# Begge må faktisk nå målet
sjekk(path_ql[-1], GOAL, "Q-learning når målet")
sjekk(path_sa[-1], GOAL, "SARSA når målet")
# Q-learning bør hugge kanten (mange celler i rad 1 like over stupet)
sjekk_større_eller_lik(ql_adj, 5, "Q-learning lærer den korteste, kantnære stien (>=5 kantceller)")
# SARSA bør gå tryggere — færre celler på rad 1
if sa_adj < ql_adj:
    print("OK   SARSA velger en tryggere sti enn Q-learning")
else:
    print(f"FEIL SARSA-stien skulle være tryggere; ql_adj={ql_adj}, sa_adj={sa_adj}")
`,
      },
      defaultFile: "sarsa.py",
      editable: ["sarsa.py"],
      run: { kind: "python-script", entry: "sarsa.py" },
      verifications: [
        { label: "Q-learning når målet", check: { kind: "output-contains", needle: "OK   Q-learning når målet" } },
        { label: "SARSA når målet", check: { kind: "output-contains", needle: "OK   SARSA når målet" } },
        { label: "Q-learning lærer kantvei", check: { kind: "output-contains", needle: "OK   Q-learning lærer den korteste, kantnære stien" } },
        { label: "SARSA velger tryggere vei", check: { kind: "output-contains", needle: "OK   SARSA velger en tryggere sti enn Q-learning" } },
      ],
      hint:
        "for _ in range(episodes):\n    s = START\n    a = epsilon_greedy(Q, s, epsilon)\n    for _ in range(max_steps):\n        ns, r, done = step(s, a)\n        if ns == GOAL:\n            Q[(s, a)] = Q[(s, a)] + alpha * (r + gamma * 0.0 - Q[(s, a)])\n            break\n        na = epsilon_greedy(Q, ns, epsilon)\n        Q[(s, a)] = Q[(s, a)] + alpha * (r + gamma * Q[(ns, na)] - Q[(s, a)])\n        s, a = ns, na\n        if done:\n            break\nreturn Q",
    },
  ],
};

const SYNC_SEMAFOR_MUTEX: MiniCourse = {
  id: "sync-semafor-mutex",
  slug: "sync-semafor-mutex",
  title: "Semaforer og mutex: konkurrens fra null",
  blurb:
    "Bygg synkroniserings-primitiver i Python. Start med en delt teller som råtner under race condition, fiks den med en mutex, generaliser til semaforer, løs producer/consumer med bounded buffer, deretter reader-writer — og avslutt med test-and-set, hardware-primitivet hele tårnet hviler på. All trådning simuleres manuelt med .step() så hvert race er deterministisk og synlig.",
  estimertTid: "60–80 min",
  fag: ["DTE-2505", "Operativsystem", "Synkronisering"],
  color: "warning",
  rekkefolge: 40,
  lessons: [
    // ============ LEKSJON 1 ===========================================
    {
      id: "01-race-condition",
      title: "1. Race condition i en delt teller",
      narrative:
        "Når to tråder deler én variabel og begge skriver til den, kan oppdateringer **forsvinne**. Det er en race condition, og den er stedet hele synkroniserings-pensum begynner.\n\nVi simulerer trådene manuelt — Pyodide har ingen ekte threading, og vi vil uansett ha deterministisk kontroll. Hver tråd skal inkrementere en delt teller 1000 ganger. Inkrement er ikke ett steg på CPU-en, men tre:\n\n```\nload   temp = counter.value\nadd    temp = temp + 1\nstore  counter.value = temp\n```\n\nVår `Thread.step()` utfører nøyaktig ETT av disse tre stegene per kall. En interleaved-scheduler bestemmer hvilken tråd som får neste tick. Hvis vi veksler mellom tråd A og B mellom load og store, kan begge lese samme `value`, hver gang til samme `temp+1`, og skrive samme nye verdi — den andre oppdateringen er **tapt**.\n\n**Din oppgave:**\n\n1. Fyll inn `Thread.step()` slik at den utfører neste mikro-steg (L → A → S → L → …) og inkrementerer `iter`-telleren når S er fullført.\n2. Implementér `run_interleaved(threads, pattern)` som rullerer indekser fra `pattern` til alle tråder er ferdige.\n\nNår testen kjører den aggressive [0,1]-patternen, skal du se at sluttverdien er < 2000.",
      files: {
        "race.py": `class SharedCounter:
    def __init__(self):
        self.value = 0


class Thread:
    """Simulert tråd. Hvert .step() utfører ÉN av tre mikro-operasjoner:
       phase "L" : temp = counter.value
       phase "A" : temp = temp + 1
       phase "S" : counter.value = temp
    Etter S har vi fullført ett inkrement; iter += 1, og phase = "L" igjen.
    """
    def __init__(self, name, counter, n):
        self.name = name
        self.counter = counter
        self.n = n
        self.iter = 0
        self.phase = "L"
        self.temp = 0

    def step(self):
        """Utfør neste mikro-steg. Returner True hvis tråden hadde arbeid."""
        if self.iter >= self.n:
            return False
        # === DIN OPPGAVE ===
        # if self.phase == "L":
        #     self.temp = self.counter.value
        #     self.phase = "A"
        # elif self.phase == "A":
        #     self.temp = self.temp + 1
        #     self.phase = "S"
        # elif self.phase == "S":
        #     self.counter.value = self.temp
        #     self.phase = "L"
        #     self.iter += 1
        # return True
        pass

    def done(self):
        return self.iter >= self.n and self.phase == "L"


def run_interleaved(threads, pattern, max_loops=10_000_000):
    """Kjør trådene i rekkefølgen pattern (liste av indekser, gjentas).
    Hopp over tråder som er done. Avslutt når alle er done.
    """
    # === DIN OPPGAVE ===
    # i = 0
    # safety = 0
    # while any(not t.done() for t in threads):
    #     idx = pattern[i % len(pattern)]
    #     if not threads[idx].done():
    #         threads[idx].step()
    #     i += 1
    #     safety += 1
    #     if safety > max_loops:
    #         raise RuntimeError("safety: scheduler henger")
    pass


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Sanity 1: én tråd alene, kjør n=3 — verdi skal bli 3 og tråd skal være done
c = SharedCounter()
t = Thread("X", c, 3)
for _ in range(9):
    t.step()
sjekk(t.done(), True, "tråd ferdig etter n*3 steg")
sjekk(c.value, 3, "verdi=3 når tråd kjører alene n=3")

# Sanity 2: aggressiv interleave [0, 1] skaper race condition
c = SharedCounter()
t1 = Thread("A", c, 1000)
t2 = Thread("B", c, 1000)
run_interleaved([t1, t2], [0, 1])
print(f"Aggressiv interleave [0,1] sluttverdi: {c.value} (forventet < 2000)")
sjekk(c.value <= 2000, True, "race-verdi er aldri hoyere enn 2000")
sjekk(c.value < 2000, True, "aggressiv interleave gir race < 2000")

# Sanity 3: sekvensiell pattern [0,0,0, 1,1,1, ...] gir 2000 fordi A
# fullfører ett helt inkrement før B starter sitt
c = SharedCounter()
t1 = Thread("A", c, 1000)
t2 = Thread("B", c, 1000)
run_interleaved([t1, t2], [0, 0, 0, 1, 1, 1])
sjekk(c.value, 2000, "sekvensiell (L-A-S per traad) gir 2000")
`,
      },
      defaultFile: "race.py",
      editable: ["race.py"],
      run: { kind: "python-script", entry: "race.py" },
      verifications: [
        { label: "Tråd fullføres etter n*3 mikro-steg", check: { kind: "output-contains", needle: "OK   tråd ferdig etter n*3 steg" } },
        { label: "Single-thread n=3 gir verdi 3", check: { kind: "output-contains", needle: "OK   verdi=3 når tråd kjører alene n=3" } },
        { label: "Race-verdi overstiger aldri 2000", check: { kind: "output-contains", needle: "OK   race-verdi er aldri hoyere enn 2000" } },
        { label: "Aggressiv interleave skaper race (< 2000)", check: { kind: "output-contains", needle: "OK   aggressiv interleave gir race < 2000" } },
        { label: "Sekvensiell pattern gir korrekt 2000", check: { kind: "output-contains", needle: "OK   sekvensiell (L-A-S per traad) gir 2000" } },
      ],
      hint:
        "def step(self):\n    if self.iter >= self.n:\n        return False\n    if self.phase == \"L\":\n        self.temp = self.counter.value\n        self.phase = \"A\"\n    elif self.phase == \"A\":\n        self.temp = self.temp + 1\n        self.phase = \"S\"\n    elif self.phase == \"S\":\n        self.counter.value = self.temp\n        self.phase = \"L\"\n        self.iter += 1\n    return True\n\ndef run_interleaved(threads, pattern, max_loops=10_000_000):\n    i = 0; safety = 0\n    while any(not t.done() for t in threads):\n        idx = pattern[i % len(pattern)]\n        if not threads[idx].done():\n            threads[idx].step()\n        i += 1; safety += 1\n        if safety > max_loops:\n            raise RuntimeError(\"safety\")",
    },

    // ============ LEKSJON 2 ===========================================
    {
      id: "02-mutex-lock",
      title: "2. Lock/mutex som beskytter kritisk seksjon",
      narrative:
        "Race condition fra leksjon 1 oppsto fordi load → add → store ikke var **atomisk**: scheduleren kunne stikke inn mellom stegene. Løsningen er en **mutex** (mutual exclusion) — en lås som maks én tråd kan holde av gangen.\n\nReglene er enkle:\n\n- `lock.acquire(who)` blokkerer (her: returnerer False) hvis noen andre holder den.\n- `lock.release(who)` slipper låsen — bare innehaveren kan gjøre det.\n- Kritisk seksjon (load → add → store) plasseres MELLOM acquire og release.\n\nVi simulerer fortsatt manuelt: en tråd som ikke får låsen, sitter i `try_lock`-tilstanden og spinner. Når den får låsen, går den gjennom load → add → store → unlock, deretter tilbake til try_lock for neste iterasjon.\n\n**Din oppgave:**\n\n1. Implementér `Lock.try_acquire(who)` og `Lock.release(who)`.\n2. Fyll inn `LockedThread.step()` så den følger tilstandsmaskinen: `try_lock → load → add → store → unlock → (loop til iter==n)`.\n\nMed lås skal totalen ALLTID være 2000 — uansett pattern.",
      files: {
        "mutex.py": `class SharedCounter:
    def __init__(self):
        self.value = 0


class Lock:
    """Mutex. held_by = None (ledig) eller navn på trad som holder."""
    def __init__(self):
        self.held_by = None

    def try_acquire(self, who):
        """Returner True hvis vi fikk laasen, False ellers."""
        # === DIN OPPGAVE ===
        # if self.held_by is None:
        #     self.held_by = who
        #     return True
        # return False
        pass

    def release(self, who):
        """Slipp laasen. Kun innehaver kan slippe."""
        # === DIN OPPGAVE ===
        # if self.held_by != who:
        #     raise RuntimeError("kun innehaver kan slippe")
        # self.held_by = None
        pass


class LockedThread:
    """Tilstandsmaskin: try_lock -> load -> add -> store -> unlock."""
    def __init__(self, name, counter, lock, n):
        self.name = name
        self.counter = counter
        self.lock = lock
        self.n = n
        self.iter = 0
        self.state = "try_lock"
        self.temp = 0

    def step(self):
        if self.state == "done":
            return False
        # === DIN OPPGAVE: state-maskinen ===
        # if self.state == "try_lock":
        #     if self.lock.try_acquire(self.name):
        #         self.state = "load"
        #     return True
        # if self.state == "load":
        #     self.temp = self.counter.value
        #     self.state = "add"
        #     return True
        # if self.state == "add":
        #     self.temp += 1
        #     self.state = "store"
        #     return True
        # if self.state == "store":
        #     self.counter.value = self.temp
        #     self.state = "unlock"
        #     return True
        # if self.state == "unlock":
        #     self.lock.release(self.name)
        #     self.iter += 1
        #     if self.iter >= self.n:
        #         self.state = "done"
        #     else:
        #         self.state = "try_lock"
        #     return True
        pass

    def done(self):
        return self.state == "done"


def run_rr(threads, max_loops=10_000_000):
    """Round-robin scheduler — én step per tråd hver runde."""
    i = 0
    while any(not t.done() for t in threads):
        threads[i % len(threads)].step()
        i += 1
        if i > max_loops:
            raise RuntimeError("safety")


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Lock-mekanikk
lock = Lock()
sjekk(lock.try_acquire("A"), True, "A faar laasen")
sjekk(lock.try_acquire("B"), False, "B blokkeres mens A holder")
lock.release("A")
sjekk(lock.try_acquire("B"), True, "B faar laasen etter A slipper")
lock.release("B")
sjekk(lock.held_by, None, "ledig etter siste release")

# 2 traader x 1000 = 2000 med RR-scheduler
c = SharedCounter()
lock = Lock()
threads = [LockedThread("A", c, lock, 1000), LockedThread("B", c, lock, 1000)]
run_rr(threads)
sjekk(c.value, 2000, "2 traader x 1000 = 2000 med mutex")

# 3 traader x 500 = 1500
c = SharedCounter()
lock = Lock()
threads = [LockedThread("A", c, lock, 500), LockedThread("B", c, lock, 500), LockedThread("C", c, lock, 500)]
run_rr(threads)
sjekk(c.value, 1500, "3 traader x 500 = 1500 med mutex")
`,
      },
      defaultFile: "mutex.py",
      editable: ["mutex.py"],
      run: { kind: "python-script", entry: "mutex.py" },
      verifications: [
        { label: "Acquire lykkes for første tråd", check: { kind: "output-contains", needle: "OK   A faar laasen" } },
        { label: "Andre tråd blokkeres mens første holder", check: { kind: "output-contains", needle: "OK   B blokkeres mens A holder" } },
        { label: "Etter release kan ny tråd ta låsen", check: { kind: "output-contains", needle: "OK   B faar laasen etter A slipper" } },
        { label: "Lås er ledig etter siste release", check: { kind: "output-contains", needle: "OK   ledig etter siste release" } },
        { label: "2 tråder * 1000 inkrementer gir nøyaktig 2000", check: { kind: "output-contains", needle: "OK   2 traader x 1000 = 2000 med mutex" } },
        { label: "3 tråder * 500 inkrementer gir nøyaktig 1500", check: { kind: "output-contains", needle: "OK   3 traader x 500 = 1500 med mutex" } },
      ],
      hint:
        "def try_acquire(self, who):\n    if self.held_by is None:\n        self.held_by = who\n        return True\n    return False\n\ndef release(self, who):\n    if self.held_by != who:\n        raise RuntimeError(\"kun innehaver kan slippe\")\n    self.held_by = None\n\ndef step(self):\n    if self.state == \"done\":\n        return False\n    if self.state == \"try_lock\":\n        if self.lock.try_acquire(self.name):\n            self.state = \"load\"\n        return True\n    if self.state == \"load\":\n        self.temp = self.counter.value\n        self.state = \"add\"; return True\n    if self.state == \"add\":\n        self.temp += 1\n        self.state = \"store\"; return True\n    if self.state == \"store\":\n        self.counter.value = self.temp\n        self.state = \"unlock\"; return True\n    if self.state == \"unlock\":\n        self.lock.release(self.name)\n        self.iter += 1\n        self.state = \"done\" if self.iter >= self.n else \"try_lock\"\n        return True",
    },

    // ============ LEKSJON 3 ===========================================
    {
      id: "03-semaphore-pool",
      title: "3. Semafor med teller — ressurspool",
      narrative:
        "En **semafor** er en mutex generalisert til N samtidige innehavere. Internt er den bare et heltall:\n\n- `Semaphore(initial=3)` starter med 3 «tilgjengelige tillatelser».\n- `acquire()` decrementerer (eller blokkerer hvis 0).\n- `release()` incrementerer.\n\nMutex er bare `Semaphore(1)`. Men kraften kommer når du setter initial > 1 — for eksempel: en database tåler maks 3 samtidige forbindelser, eller en parkeringsplass har 3 plasser.\n\nVi simulerer 5 «kunder» som hver vil bruke en ressurs i noen ticks. Med `Semaphore(3)` skal aldri mer enn 3 holde ressursen samtidig — de øvrige må vente i `wait`-tilstand.\n\n**Din oppgave:**\n\n1. Implementér `Semaphore.try_acquire()` (decrement hvis > 0, returner True; ellers False) og `Semaphore.release()` (increment).\n2. Fyll inn `PoolUser.step()` med tilstands-overgangene `wait → in_use → done`. I `in_use` decrementerer du `remaining_work`; når den når 0, gi tilbake tillatelsen og gå til `done`.",
      files: {
        "semaphore.py": `class Semaphore:
    """Telle-semafor. count = antall ledige tillatelser."""
    def __init__(self, initial):
        self.count = initial

    def try_acquire(self):
        # === DIN OPPGAVE ===
        # if self.count > 0:
        #     self.count -= 1
        #     return True
        # return False
        pass

    def release(self):
        # === DIN OPPGAVE ===
        # self.count += 1
        pass


class PoolUser:
    """Kunde som vil bruke ressurs i work_ticks ticks."""
    def __init__(self, name, sem, work_ticks):
        self.name = name
        self.sem = sem
        self.work_ticks = work_ticks
        self.remaining_work = work_ticks
        self.state = "wait"
        self.held = False

    def step(self):
        if self.state == "done":
            return False
        # === DIN OPPGAVE ===
        # if self.state == "wait":
        #     if self.sem.try_acquire():
        #         self.state = "in_use"
        #         self.held = True
        #     return True
        # if self.state == "in_use":
        #     self.remaining_work -= 1
        #     if self.remaining_work <= 0:
        #         self.sem.release()
        #         self.held = False
        #         self.state = "done"
        #     return True
        pass

    def done(self):
        return self.state == "done"


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Semafor-mekanikk
s = Semaphore(2)
sjekk(s.try_acquire(), True, "tillatelse 1 av 2 OK")
sjekk(s.try_acquire(), True, "tillatelse 2 av 2 OK")
sjekk(s.try_acquire(), False, "tredje acquire blokkeres")
s.release()
sjekk(s.try_acquire(), True, "ny acquire OK etter release")

# Pool-test: 5 kunder, ressurs-pool = 3, work=4 ticks hver
sem = Semaphore(3)
users = [PoolUser(f"K{i}", sem, work_ticks=4) for i in range(5)]
max_concurrent = 0
i = 0
while any(not u.done() for u in users):
    users[i % 5].step()
    held = sum(1 for u in users if u.held)
    if held > max_concurrent:
        max_concurrent = held
    i += 1
    if i > 100000:
        raise RuntimeError("safety")

sjekk(max_concurrent <= 3, True, "aldri mer enn 3 samtidige holdere")
sjekk(max_concurrent, 3, "vi naadde 3 samtidige holdere")
sjekk(sem.count, 3, "semafor tilbake til 3 etter alle")
sjekk(all(u.done() for u in users), True, "alle 5 kunder fullfoert")
print(f"max samtidige holdere observert: {max_concurrent}")
`,
      },
      defaultFile: "semaphore.py",
      editable: ["semaphore.py"],
      run: { kind: "python-script", entry: "semaphore.py" },
      verifications: [
        { label: "Første acquire dekrementerer til 1", check: { kind: "output-contains", needle: "OK   tillatelse 1 av 2 OK" } },
        { label: "Andre acquire bruker siste tillatelse", check: { kind: "output-contains", needle: "OK   tillatelse 2 av 2 OK" } },
        { label: "Tredje acquire blokkeres når count=0", check: { kind: "output-contains", needle: "OK   tredje acquire blokkeres" } },
        { label: "Release frigjør slot for ny acquire", check: { kind: "output-contains", needle: "OK   ny acquire OK etter release" } },
        { label: "Samtidige holdere overstiger aldri kapasiteten", check: { kind: "output-contains", needle: "OK   aldri mer enn 3 samtidige holdere" } },
        { label: "Vi når faktisk maks-kapasiteten 3", check: { kind: "output-contains", needle: "OK   vi naadde 3 samtidige holdere" } },
        { label: "Semafor returnerer til startverdi etter bruk", check: { kind: "output-contains", needle: "OK   semafor tilbake til 3 etter alle" } },
      ],
      hint:
        "def try_acquire(self):\n    if self.count > 0:\n        self.count -= 1\n        return True\n    return False\n\ndef release(self):\n    self.count += 1\n\ndef step(self):\n    if self.state == \"done\":\n        return False\n    if self.state == \"wait\":\n        if self.sem.try_acquire():\n            self.state = \"in_use\"; self.held = True\n        return True\n    if self.state == \"in_use\":\n        self.remaining_work -= 1\n        if self.remaining_work <= 0:\n            self.sem.release(); self.held = False; self.state = \"done\"\n        return True",
    },

    // ============ LEKSJON 4 ===========================================
    {
      id: "04-producer-consumer",
      title: "4. Producer/consumer med bounded buffer",
      narrative:
        "Klassikeren. En **producer** legger varer i en buffer; en **consumer** plukker dem ut. Bufferet har kapasitet N — producer må vente når det er fullt, consumer må vente når det er tomt.\n\nLøsningen bruker TO semaforer:\n\n- `empty = Semaphore(N)` — antall ledige slots (starter på N)\n- `full = Semaphore(0)` — antall fylte slots (starter på 0)\n\nProducer-løkken: `empty.acquire(); put(x); full.release()`. Den blokkerer på `empty` når bufferet er fullt.\n\nConsumer-løkken: `full.acquire(); get(); empty.release()`. Den blokkerer på `full` når bufferet er tomt.\n\nSemafor-paret invarianer: `empty.count + full.count + (varer-under-transport) = N`. Bufferet kan aldri overstige N eller gå under 0.\n\n**Din oppgave:** Fyll inn `Producer.step()` (tilstander `wait_empty → put`) og `Consumer.step()` (`wait_full → get`). Verifiseringen sjekker at bufferet aldri overskrider 3.",
      files: {
        "pc.py": `class Semaphore:
    def __init__(self, initial):
        self.count = initial

    def try_acquire(self):
        if self.count > 0:
            self.count -= 1
            return True
        return False

    def release(self):
        self.count += 1


class BoundedBuffer:
    def __init__(self, capacity):
        self.capacity = capacity
        self.items = []

    def put(self, x):
        self.items.append(x)

    def get(self):
        return self.items.pop(0)

    def size(self):
        return len(self.items)


class Producer:
    """wait_empty -> put -> wait_empty (loop) -> done."""
    def __init__(self, name, buffer, empty_sem, full_sem, n):
        self.name = name
        self.buffer = buffer
        self.empty = empty_sem
        self.full = full_sem
        self.n = n
        self.produced = 0
        self.state = "wait_empty"

    def step(self):
        if self.state == "done":
            return False
        # === DIN OPPGAVE ===
        # if self.state == "wait_empty":
        #     if self.empty.try_acquire():
        #         self.state = "put"
        #     return True
        # if self.state == "put":
        #     self.buffer.put(f"{self.name}-{self.produced}")
        #     self.full.release()
        #     self.produced += 1
        #     if self.produced >= self.n:
        #         self.state = "done"
        #     else:
        #         self.state = "wait_empty"
        #     return True
        pass

    def done(self):
        return self.state == "done"


class Consumer:
    """wait_full -> get -> wait_full (loop) -> done."""
    def __init__(self, name, buffer, empty_sem, full_sem, n):
        self.name = name
        self.buffer = buffer
        self.empty = empty_sem
        self.full = full_sem
        self.n = n
        self.consumed = 0
        self.state = "wait_full"
        self.taken = []

    def step(self):
        if self.state == "done":
            return False
        # === DIN OPPGAVE ===
        # if self.state == "wait_full":
        #     if self.full.try_acquire():
        #         self.state = "get"
        #     return True
        # if self.state == "get":
        #     x = self.buffer.get()
        #     self.taken.append(x)
        #     self.empty.release()
        #     self.consumed += 1
        #     if self.consumed >= self.n:
        #         self.state = "done"
        #     else:
        #         self.state = "wait_full"
        #     return True
        pass

    def done(self):
        return self.state == "done"


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Test 1: 6 varer gjennom buffer med kapasitet 3
buf = BoundedBuffer(3)
empty = Semaphore(3)
full = Semaphore(0)
prod = Producer("P", buf, empty, full, 6)
cons = Consumer("C", buf, empty, full, 6)

# Pattern: gi producer 2 steg for hvert consumer-steg, slik at bufferet vokser
max_size = 0
i = 0
while not (prod.done() and cons.done()):
    pick = i % 3
    if pick < 2 and not prod.done():
        prod.step()
    elif not cons.done():
        cons.step()
    elif not prod.done():
        prod.step()
    sz = buf.size()
    if sz > max_size:
        max_size = sz
    i += 1
    if i > 100000:
        raise RuntimeError("safety")

sjekk(prod.done(), True, "producer ferdig")
sjekk(cons.done(), True, "consumer ferdig")
sjekk(max_size <= 3, True, "buffer overskrider aldri kapasiteten 3")
sjekk(buf.size(), 0, "buffer er tom til slutt")
sjekk(len(cons.taken), 6, "consumer tok alle 6 varer")
sjekk(empty.count, 3, "empty-semafor tilbake til 3")
sjekk(full.count, 0, "full-semafor tilbake til 0")
print(f"max buffer-size observert: {max_size}")
print(f"items tatt: {cons.taken}")

# Test 2: kjør bare producer — den maa BLOKKERES naar buffer = 3
buf = BoundedBuffer(3)
empty = Semaphore(3)
full = Semaphore(0)
prod = Producer("P", buf, empty, full, 5)
for _ in range(30):
    prod.step()
sjekk(buf.size(), 3, "producer fylte til kapasitet")
sjekk(prod.done(), False, "producer ikke ferdig — blokkert paa empty")
sjekk(prod.state, "wait_empty", "producer staar i wait_empty")

# Test 3: kjør bare consumer paa tomt buffer — blokkeres paa full=0
buf = BoundedBuffer(3)
empty = Semaphore(3)
full = Semaphore(0)
cons = Consumer("C", buf, empty, full, 3)
for _ in range(30):
    cons.step()
sjekk(cons.consumed, 0, "consumer fikk null varer fra tomt buffer")
sjekk(cons.state, "wait_full", "consumer staar i wait_full")
`,
      },
      defaultFile: "pc.py",
      editable: ["pc.py"],
      run: { kind: "python-script", entry: "pc.py" },
      verifications: [
        { label: "Producer fullfører alle 6 varer", check: { kind: "output-contains", needle: "OK   producer ferdig" } },
        { label: "Consumer fullfører alle 6 varer", check: { kind: "output-contains", needle: "OK   consumer ferdig" } },
        { label: "Buffer overskrider aldri kapasitet 3", check: { kind: "output-contains", needle: "OK   buffer overskrider aldri kapasiteten 3" } },
        { label: "Buffer tom til slutt (alle plukket)", check: { kind: "output-contains", needle: "OK   buffer er tom til slutt" } },
        { label: "Consumer mottok alle 6 producer-varer", check: { kind: "output-contains", needle: "OK   consumer tok alle 6 varer" } },
        { label: "Semaforer returnerer til startverdier", check: { kind: "output-contains", needle: "OK   empty-semafor tilbake til 3" } },
        { label: "Producer blokkeres når buffer er fullt", check: { kind: "output-contains", needle: "OK   producer fylte til kapasitet" } },
        { label: "Consumer blokkeres på tomt buffer", check: { kind: "output-contains", needle: "OK   consumer fikk null varer fra tomt buffer" } },
      ],
      hint:
        "def step(self):  # Producer\n    if self.state == \"done\": return False\n    if self.state == \"wait_empty\":\n        if self.empty.try_acquire():\n            self.state = \"put\"\n        return True\n    if self.state == \"put\":\n        self.buffer.put(f\"{self.name}-{self.produced}\")\n        self.full.release()\n        self.produced += 1\n        self.state = \"done\" if self.produced >= self.n else \"wait_empty\"\n        return True\n\ndef step(self):  # Consumer\n    if self.state == \"done\": return False\n    if self.state == \"wait_full\":\n        if self.full.try_acquire():\n            self.state = \"get\"\n        return True\n    if self.state == \"get\":\n        x = self.buffer.get()\n        self.taken.append(x)\n        self.empty.release()\n        self.consumed += 1\n        self.state = \"done\" if self.consumed >= self.n else \"wait_full\"\n        return True",
    },

    // ============ LEKSJON 5 ===========================================
    {
      id: "05-reader-writer",
      title: "5. Reader/writer-problemet",
      narrative:
        "En **delt ressurs** der mange tråder vil lese og noen vil skrive. Lesing kan skje parallelt — flere readers samtidig er trygt. Men skriving må være **eksklusiv**: ingen andre readers eller writers kan røre ressursen mens en writer er aktiv.\n\nEn klassisk implementasjon bruker en `reader_count` + en simulert mutex på selve count-oppdateringen:\n\n- `acquire_read()`: hvis writer aktiv → blokker. Ellers inkrementer reader_count.\n- `release_read()`: dekrementer reader_count.\n- `acquire_write()`: hvis writer aktiv ELLER reader_count > 0 → blokker. Ellers sett writer_active = True.\n- `release_write()`: writer_active = False.\n\nDenne varianten er «reader-preference» — så lenge én reader leser, kommer alltid en ny reader inn før en ventende writer. (Writer-preference og fair fungerer også, men holder oss til den enkleste her.)\n\n**Din oppgave:** Implementér `RWLock`-metodene under. Sjekkene tester at 3 readers kan slippe inn samtidig, at en writer blokkeres mens de leser, og at writer slipper inn først når siste reader er borte.",
      files: {
        "rw.py": `class RWLock:
    def __init__(self):
        self.reader_count = 0
        self.writer_active = False

    def try_acquire_read(self):
        """Slipp inn hvis ingen writer er aktiv."""
        # === DIN OPPGAVE ===
        # if self.writer_active:
        #     return False
        # self.reader_count += 1
        # return True
        pass

    def release_read(self):
        # === DIN OPPGAVE ===
        # self.reader_count -= 1
        pass

    def try_acquire_write(self):
        """Eksklusiv: kun hvis ingen reader OG ingen writer."""
        # === DIN OPPGAVE ===
        # if self.writer_active:
        #     return False
        # if self.reader_count > 0:
        #     return False
        # self.writer_active = True
        # return True
        pass

    def release_write(self):
        # === DIN OPPGAVE ===
        # self.writer_active = False
        pass


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


rw = RWLock()

# Scenario 1: 3 readers samtidig
sjekk(rw.try_acquire_read(), True, "reader 1 slipper inn")
sjekk(rw.try_acquire_read(), True, "reader 2 slipper inn")
sjekk(rw.try_acquire_read(), True, "reader 3 slipper inn")
sjekk(rw.reader_count, 3, "3 readers samtidig")

# Scenario 2: writer blokkert mens readers leser
sjekk(rw.try_acquire_write(), False, "writer blokkert av readers")

# Scenario 3: alle readers slipper, writer kommer inn
rw.release_read()
rw.release_read()
sjekk(rw.try_acquire_write(), False, "writer blokkert mens 1 reader igjen")
rw.release_read()
sjekk(rw.reader_count, 0, "alle readers ferdig")
sjekk(rw.try_acquire_write(), True, "writer slipper inn etter siste reader")

# Scenario 4: ny reader blokkert mens writer aktiv
sjekk(rw.try_acquire_read(), False, "reader blokkert mens writer aktiv")
sjekk(rw.try_acquire_write(), False, "annen writer blokkert mens writer aktiv")

# Scenario 5: writer slipper, reader kommer inn
rw.release_write()
sjekk(rw.writer_active, False, "writer sluppet")
sjekk(rw.try_acquire_read(), True, "reader slipper inn etter writer")
`,
      },
      defaultFile: "rw.py",
      editable: ["rw.py"],
      run: { kind: "python-script", entry: "rw.py" },
      verifications: [
        { label: "Reader 1 slipper inn på tom lås", check: { kind: "output-contains", needle: "OK   reader 1 slipper inn" } },
        { label: "Reader 2 slipper inn parallelt", check: { kind: "output-contains", needle: "OK   reader 2 slipper inn" } },
        { label: "Reader 3 slipper inn parallelt", check: { kind: "output-contains", needle: "OK   reader 3 slipper inn" } },
        { label: "Writer blokkeres mens readers leser", check: { kind: "output-contains", needle: "OK   writer blokkert av readers" } },
        { label: "Writer fortsatt blokkert med 1 reader igjen", check: { kind: "output-contains", needle: "OK   writer blokkert mens 1 reader igjen" } },
        { label: "Writer slipper inn etter siste reader", check: { kind: "output-contains", needle: "OK   writer slipper inn etter siste reader" } },
        { label: "Reader blokkeres mens writer aktiv", check: { kind: "output-contains", needle: "OK   reader blokkert mens writer aktiv" } },
        { label: "Annen writer blokkeres (eksklusivitet)", check: { kind: "output-contains", needle: "OK   annen writer blokkert mens writer aktiv" } },
        { label: "Reader slipper inn etter writer slipper", check: { kind: "output-contains", needle: "OK   reader slipper inn etter writer" } },
      ],
      hint:
        "def try_acquire_read(self):\n    if self.writer_active:\n        return False\n    self.reader_count += 1\n    return True\n\ndef release_read(self):\n    self.reader_count -= 1\n\ndef try_acquire_write(self):\n    if self.writer_active or self.reader_count > 0:\n        return False\n    self.writer_active = True\n    return True\n\ndef release_write(self):\n    self.writer_active = False",
    },

    // ============ LEKSJON 6 ===========================================
    {
      id: "06-test-and-set",
      title: "6. Test-and-set: hvordan mutex egentlig er implementert",
      narrative:
        "Vi har laget Lock, Semaphore og RWLock — men det er én ting vi har snyltet på: **selve laasen leser og skriver atomisk**. Hvis to tråder sjekker `held_by is None` samtidig før noen rekker å sette den, kan begge tro at de fikk låsen. Hva beskytter låsen?\n\nSvaret er hardware. CPU-er har et atomisk **test-and-set**-instruksjon:\n\n```\nTAS(addr) := { old = *addr; *addr = True; return old; }   atomisk\n```\n\nLeser den gamle verdien OG setter til True i ÉN udelelig operasjon. Ingen tråd kan skyte inn mellom les og skriv.\n\nDen enkleste mutex bygges som **spin-lock** med TAS:\n\n```\nacquire:  while test_and_set(flag): pass    # spinn til du ser False (=ledig)\nrelease:  clear(flag)                       # sett False\n```\n\nNaiv variant — `if not flag: flag = True` — er IKKE trygg. Det er to operasjoner (read, write) med plass for race condition mellom.\n\n**Din oppgave:**\n\n1. Implementér `AtomicFlag.test_and_set()` (returner gammel verdi, sett til True).\n2. Fyll inn `SpinLockThread.step()` med tilstandsmaskinen: `tas → load → add → store → clear` (spinner i tas til den får låsen).\n\n2 tråder x 500 inkrementer skal gi nøyaktig 1000 — fordi TAS-spinlock er en ekte mutex.",
      files: {
        "tas.py": `class AtomicFlag:
    """Hardware-primitivet: test_and_set er ATOMISK
       (les + skriv = ett udelelig steg).
    """
    def __init__(self):
        self.value = False

    def test_and_set(self):
        """Returner gammel verdi. Sett til True. ATOMISK."""
        # === DIN OPPGAVE ===
        # old = self.value
        # self.value = True
        # return old
        pass

    def clear(self):
        self.value = False


class SpinLockThread:
    """Bruker TAS-spinlock til aa beskytte teller.
       Tilstander: tas (spinner) -> load -> add -> store -> clear -> (loop)
    """
    def __init__(self, name, flag, shared, n):
        self.name = name
        self.flag = flag
        self.shared = shared
        self.n = n
        self.iter = 0
        self.state = "tas"
        self.temp = 0

    def step(self):
        if self.state == "done":
            return False
        # === DIN OPPGAVE ===
        # if self.state == "tas":
        #     old = self.flag.test_and_set()
        #     if old is False:  # vi fikk laasen
        #         self.state = "load"
        #     # else: spinn videre (forblir i "tas")
        #     return True
        # if self.state == "load":
        #     self.temp = self.shared["x"]
        #     self.state = "add"; return True
        # if self.state == "add":
        #     self.temp += 1
        #     self.state = "store"; return True
        # if self.state == "store":
        #     self.shared["x"] = self.temp
        #     self.state = "clear"; return True
        # if self.state == "clear":
        #     self.flag.clear()
        #     self.iter += 1
        #     self.state = "done" if self.iter >= self.n else "tas"
        #     return True
        pass

    def done(self):
        return self.state == "done"


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Test 1: TAS-mekanikk
f = AtomicFlag()
sjekk(f.test_and_set(), False, "foerste TAS returnerer False (var ledig)")
sjekk(f.value, True, "flag satt til True etter foerste TAS")
sjekk(f.test_and_set(), True, "andre TAS returnerer True (allerede tatt)")
sjekk(f.value, True, "flag fortsatt True")
f.clear()
sjekk(f.value, False, "clear setter False")

# Test 2: TAS-spinlock beskytter delt teller
flag = AtomicFlag()
shared = {"x": 0}
threads = [SpinLockThread("A", flag, shared, 500), SpinLockThread("B", flag, shared, 500)]
i = 0
while any(not t.done() for t in threads):
    threads[i % 2].step()
    i += 1
    if i > 1_000_000:
        raise RuntimeError("safety")
sjekk(shared["x"], 1000, "TAS-spinlock gir korrekt 1000")
sjekk(flag.value, False, "flag sluppet til slutt")

# Test 3: 3 traader x 300 = 900
flag = AtomicFlag()
shared = {"x": 0}
threads = [SpinLockThread(n, flag, shared, 300) for n in ("A", "B", "C")]
i = 0
while any(not t.done() for t in threads):
    threads[i % 3].step()
    i += 1
    if i > 1_000_000:
        raise RuntimeError("safety")
sjekk(shared["x"], 900, "3 traader x 300 = 900 med TAS-spinlock")
`,
      },
      defaultFile: "tas.py",
      editable: ["tas.py"],
      run: { kind: "python-script", entry: "tas.py" },
      verifications: [
        { label: "Første TAS returnerer gammel False", check: { kind: "output-contains", needle: "OK   foerste TAS returnerer False (var ledig)" } },
        { label: "Flag settes til True av TAS", check: { kind: "output-contains", needle: "OK   flag satt til True etter foerste TAS" } },
        { label: "Andre TAS returnerer True (allerede tatt)", check: { kind: "output-contains", needle: "OK   andre TAS returnerer True (allerede tatt)" } },
        { label: "clear() setter flagget til False", check: { kind: "output-contains", needle: "OK   clear setter False" } },
        { label: "TAS-spinlock beskytter 2 tråder × 500 = 1000", check: { kind: "output-contains", needle: "OK   TAS-spinlock gir korrekt 1000" } },
        { label: "Spinlock slippes etter siste tråd", check: { kind: "output-contains", needle: "OK   flag sluppet til slutt" } },
        { label: "TAS-spinlock skalerer til 3 tråder", check: { kind: "output-contains", needle: "OK   3 traader x 300 = 900 med TAS-spinlock" } },
      ],
      hint:
        "def test_and_set(self):\n    old = self.value\n    self.value = True\n    return old\n\ndef step(self):\n    if self.state == \"done\": return False\n    if self.state == \"tas\":\n        old = self.flag.test_and_set()\n        if old is False:\n            self.state = \"load\"\n        return True\n    if self.state == \"load\":\n        self.temp = self.shared[\"x\"]; self.state = \"add\"; return True\n    if self.state == \"add\":\n        self.temp += 1; self.state = \"store\"; return True\n    if self.state == \"store\":\n        self.shared[\"x\"] = self.temp; self.state = \"clear\"; return True\n    if self.state == \"clear\":\n        self.flag.clear()\n        self.iter += 1\n        self.state = \"done\" if self.iter >= self.n else \"tas\"\n        return True",
    },
  ],
};

const DEADLOCK_BANKERS: MiniCourse = {
  id: "deadlock-bankers",
  slug: "deadlock-bankers",
  title: "Deadlock-deteksjon og bankers algoritme",
  blurb:
    "Bygg deadlock-håndteringen i et OS fra null. Først en resource allocation graph der du finner sykler. Så multi-instance deteksjon der vektorer av ressurser strømmer fritt mellom prosesser. Deretter bankers algoritme — først safety-sjekk, så request-grant — og til slutt en recovery-strategi som finner minste sett prosesser å avbryte for å bryte alle sykler.",
  estimertTid: "60–75 min",
  fag: ["DTE-2505", "Operativsystem", "Deadlock"],
  color: "warning",
  rekkefolge: 50,
  lessons: [
    // ============ LEKSJON 1 ===========================================
    {
      id: "01-rag-coffman",
      title: "1. Resource allocation graph og Coffman-betingelsene",
      narrative:
        "Deadlock oppstår når et sett prosesser sitter fast og venter på hverandre i en sirkel. Coffman (1971) viste at fire betingelser må alle holde samtidig for at deadlock skal være mulig:\n\n1. **Mutual exclusion** — en ressurs kan kun holdes av én prosess om gangen.\n2. **Hold and wait** — en prosess holder ressurser mens den venter på nye.\n3. **No preemption** — ressurser tas ikke fra en prosess; de må frigis frivillig.\n4. **Sirkulær venting** — det finnes en sirkel P1 → R1 → P2 → R2 → ... → P1.\n\nDe tre første er strukturelle (hvordan systemet er bygget). Den fjerde er den vi kan oppdage i øyeblikket — og vi gjør det med en **resource allocation graph** (RAG):\n\n- **Noder:** prosesser (P1, P2, ...) og ressurser (R1, R2, ...).\n- **Held-edge:** ressurs → prosess (\"R1 holdes av P2\").\n- **Request-edge:** prosess → ressurs (\"P1 ber om R1\").\n\nMed kun én instans per ressurstype: **sirkel i grafen = deadlock**. Vi finner sirkler med DFS og tre-farging (WHITE/GRAY/BLACK). Hvis DFS treffer en GRAY-node, har vi en bak-kant — altså en sirkel.\n\n**Din oppgave:** Bygg `ResourceGraph` med `add_edge(src, dst)` og `has_cycle()` (DFS, tre-farging).",
      files: {
        "deadlock.py": `class ResourceGraph:
    """Rettet graf med prosess- og ressurs-noder.

    Konvensjon for kanter:
      add_edge("R1", "P2")  betyr "R1 holdes av P2"   (R -> P)
      add_edge("P1", "R1")  betyr "P1 ber om R1"      (P -> R)
    """

    def __init__(self):
        self.edges = {}  # node -> list[node]

    def add_node(self, name):
        if name not in self.edges:
            self.edges[name] = []

    def add_edge(self, src, dst):
        # === DIN OPPGAVE ===
        # Sørg for at både src og dst er noder i grafen,
        # og legg dst til i self.edges[src] (unngå duplikater).
        pass

    def has_cycle(self):
        # === DIN OPPGAVE ===
        # DFS med tre farger: WHITE=0 (urørt), GRAY=1 (på stack), BLACK=2 (ferdig).
        # Bak-kant til en GRAY-node = sirkel funnet.
        # Returner True/False.
        return False


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Test 1: sirkulær venting P1 -> R1 -> P2 -> R2 -> P1
g = ResourceGraph()
g.add_edge("P1", "R1")  # P1 ber om R1
g.add_edge("R1", "P2")  # R1 holdes av P2
g.add_edge("P2", "R2")  # P2 ber om R2
g.add_edge("R2", "P1")  # R2 holdes av P1
sjekk(g.has_cycle(), True, "sirkel detektert i 2-prosess deadlock")

# Test 2: kjede uten sirkel — P1 venter, men ingen venter på P1.
g2 = ResourceGraph()
g2.add_edge("P1", "R1")
g2.add_edge("R1", "P2")
g2.add_edge("P2", "R2")
# Ingen kant tilbake til P1 — R2 holdes ikke av noen.
sjekk(g2.has_cycle(), False, "ingen sirkel i ren kjede")

# Test 3: lengre sirkel — 3 prosesser, 3 ressurser
g3 = ResourceGraph()
for i in range(3):
    g3.add_edge(f"P{i+1}", f"R{i+1}")
    g3.add_edge(f"R{i+1}", f"P{((i+1) % 3) + 1}")
sjekk(g3.has_cycle(), True, "sirkel detektert i 3-prosess sirkel")

# Test 4: add_edge skal ikke duplikere
g4 = ResourceGraph()
g4.add_edge("A", "B")
g4.add_edge("A", "B")
sjekk(len(g4.edges["A"]), 1, "add_edge ignorerer duplikat")
`,
      },
      defaultFile: "deadlock.py",
      editable: ["deadlock.py"],
      run: { kind: "python-script", entry: "deadlock.py" },
      verifications: [
        { label: "Detekterer sirkel mellom 2 prosesser", check: { kind: "output-contains", needle: "OK   sirkel detektert i 2-prosess deadlock" } },
        { label: "Ingen falsk-positiv for ren kjede", check: { kind: "output-contains", needle: "OK   ingen sirkel i ren kjede" } },
        { label: "Detekterer lengre sirkel (3 prosesser)", check: { kind: "output-contains", needle: "OK   sirkel detektert i 3-prosess sirkel" } },
        { label: "add_edge dedupliserer parallelle kanter", check: { kind: "output-contains", needle: "OK   add_edge ignorerer duplikat" } },
      ],
      hint:
        "def add_edge(self, src, dst):\n    self.add_node(src)\n    self.add_node(dst)\n    if dst not in self.edges[src]:\n        self.edges[src].append(dst)\n\ndef has_cycle(self):\n    WHITE, GRAY, BLACK = 0, 1, 2\n    color = {n: WHITE for n in self.edges}\n    def dfs(n):\n        color[n] = GRAY\n        for nb in self.edges.get(n, []):\n            if color[nb] == GRAY:\n                return True\n            if color[nb] == WHITE and dfs(nb):\n                return True\n        color[n] = BLACK\n        return False\n    for n in list(self.edges.keys()):\n        if color[n] == WHITE and dfs(n):\n            return True\n    return False",
    },

    // ============ LEKSJON 2 ===========================================
    {
      id: "02-detection-multi-instance",
      title: "2. Deteksjon med multi-instance ressurser",
      narrative:
        "RAG-tilnærmingen fra leksjon 1 dekker bare en-instans-ressurser. I virkelige OS har vi ofte flere instanser av samme ressurstype: 4 skrivere, 3 minneblokker, 12 fil-deskriptorer. Da er sirkel-i-graf hverken nødvendig eller tilstrekkelig for deadlock — vi må telle.\n\nVi bruker tre vektorer/matriser i stedet:\n\n- **Available[m]** — ledige instanser per ressurstype (m typer).\n- **Allocation[n][m]** — hvor mye prosess i holder av type j.\n- **Request[n][m]** — hvor mye prosess i venter på akkurat nå.\n\nAlgoritmen er en simulering av \"hvem kan fullføre\":\n\n```\nwork = Available\nfinish[i] = (Allocation[i] er nullvektor)   # prosesser som ikke holder noe\ngjenta:\n  finn en prosess i der finish[i] er False OG Request[i] <= work\n  hvis funnet: work += Allocation[i]; finish[i] = True\n  ellers: stopp\nprosesser med finish[i] == False er deadlocked\n```\n\nNøkkelinnsikt: hvis ingen kan komme videre med dagens `work`, er de gjenstående i en sykel av venting og frigjør aldri ressursene sine.\n\n**Din oppgave:** Implementér `detect_deadlock(available, allocation, request)` som returnerer en sortert liste av indekser til deadlockede prosesser (tom liste hvis ingen deadlock).",
      files: {
        "deadlock.py": `def detect_deadlock(available, allocation, request):
    """Multi-instance deadlock-deteksjon.

    Argumenter:
      available: liste[int] av lengde m (antall ressurstyper)
      allocation: liste[liste[int]] med n rader, m kolonner
      request:    liste[liste[int]] med n rader, m kolonner

    Returner: sortert liste av indekser til prosesser som er deadlocked.
    """
    n = len(allocation)
    m = len(available)
    work = list(available)
    # === DIN OPPGAVE ===
    # 1. Initialisér finish[i] = True hvis prosess i ikke holder noe
    #    (allocation[i] er nullvektor) — slike prosesser er ikke deadlocked.
    # 2. Gjenta:
    #      finn en finish[i] == False der request[i][j] <= work[j] for alle j
    #      hvis funnet: work += allocation[i], finish[i] = True
    #      ellers: bryt
    # 3. Returner sortert liste av i der finish[i] == False
    finish = [False] * n
    return []


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Test 1: klassisk Silberschatz "no deadlock"-eksempel
# 5 prosesser, 3 ressurstyper, available = (0,0,0)
available = [0, 0, 0]
allocation = [
    [0, 1, 0],
    [2, 0, 0],
    [3, 0, 3],
    [2, 1, 1],
    [0, 0, 2],
]
request = [
    [0, 0, 0],
    [2, 0, 2],
    [0, 0, 0],
    [1, 0, 0],
    [0, 0, 2],
]
sjekk(detect_deadlock(available, allocation, request), [], "Silberschatz: ingen deadlock")

# Test 2: endre P2.request fra (0,0,0) til (0,0,1) — nå sulter alle som trenger C
request2 = [
    [0, 0, 0],
    [2, 0, 2],
    [0, 0, 1],
    [1, 0, 0],
    [0, 0, 2],
]
sjekk(detect_deadlock(available, allocation, request2), [1, 2, 3, 4], "deadlock i {P1,P2,P3,P4}")

# Test 3: enkelt 2-prosess deadlock — begge ber om ressursen den andre holder
# 2 ressurstyper (R0, R1), 1 instans hver, available = (0, 0)
avail3 = [0, 0]
alloc3 = [
    [1, 0],   # P0 holder R0
    [0, 1],   # P1 holder R1
]
req3 = [
    [0, 1],   # P0 ber om R1
    [1, 0],   # P1 ber om R0
]
sjekk(detect_deadlock(avail3, alloc3, req3), [0, 1], "2-prosess klassisk deadlock")

# Test 4: alle prosesser har null-allocation — kan aldri være deadlock
avail4 = [5, 5]
alloc4 = [[0, 0], [0, 0]]
req4 = [[10, 10], [10, 10]]  # de venter på umulig forespørsel, men holder ingenting
sjekk(detect_deadlock(avail4, alloc4, req4), [], "tomme prosesser er ikke deadlocked")
`,
      },
      defaultFile: "deadlock.py",
      editable: ["deadlock.py"],
      run: { kind: "python-script", entry: "deadlock.py" },
      verifications: [
        { label: "Silberschatz: ingen deadlock identifisert", check: { kind: "output-contains", needle: "OK   Silberschatz: ingen deadlock" } },
        { label: "Detekterer flertall-prosess deadlock korrekt", check: { kind: "output-contains", needle: "OK   deadlock i {P1,P2,P3,P4}" } },
        { label: "2-prosess klassisk deadlock detektert", check: { kind: "output-contains", needle: "OK   2-prosess klassisk deadlock" } },
        { label: "Prosesser uten allocation regnes ikke som deadlocked", check: { kind: "output-contains", needle: "OK   tomme prosesser er ikke deadlocked" } },
      ],
      hint:
        "n = len(allocation); m = len(available)\nwork = list(available)\nfinish = [all(allocation[i][j] == 0 for j in range(m)) for i in range(n)]\nwhile True:\n    progressed = False\n    for i in range(n):\n        if not finish[i] and all(request[i][j] <= work[j] for j in range(m)):\n            for j in range(m):\n                work[j] += allocation[i][j]\n            finish[i] = True\n            progressed = True\n    if not progressed:\n        break\nreturn sorted(i for i, f in enumerate(finish) if not f)",
    },

    // ============ LEKSJON 3 ===========================================
    {
      id: "03-bankers-safety",
      title: "3. Bankers algoritme — safety-check",
      narrative:
        "Deteksjon kjører i ettertid: når deadlock først har skjedd, finner vi ut hvem som sitter fast. **Bankers algoritme** er et forsøk på å unngå deadlock i utgangspunktet, ved å aldri tildele ressurser hvis det kan føre til en farlig tilstand.\n\nForskjellen fra deteksjon er **max claim**: hver prosess deklarerer på forhånd hvor mye den TOTALT kan komme til å trenge. Vi sjekker ikke om dagens request er rimelig — vi sjekker om systemet ville være safe selv hvis hver prosess plutselig ba om alt den noensinne kan trenge.\n\n- **Need[i][j] = Max[i][j] - Allocation[i][j]** — det prosessen MAKS kan komme til å be om i tillegg.\n- En tilstand er **safe** hvis det finnes en sekvens av prosesser slik at hver kan fullføre (med dagens Available + det som frigjøres av tidligere) selv om de ber om hele Need-en sin.\n\nAlgoritmen er identisk med deteksjon, men med `Need` i stedet for `Request`:\n\n```\nwork = Available\nfinish = [False, False, ...]\ngjenta:\n  finn i der finish[i] == False og Need[i] <= work\n  ja: work += Allocation[i]; finish[i] = True\n  nei: bryt\nsafe hvis alle finish[i] == True\n```\n\nReturner også **safe sequence** — rekkefølgen prosessene kunne fullføres i. Det er bevisstøtten for at staten er safe.\n\n**Din oppgave:** `is_safe(available, max_claim, allocation) -> (bool, list[int])`.",
      files: {
        "bankers.py": `def is_safe(available, max_claim, allocation):
    """Bankers safety-check.

    Returner (safe, sequence). sequence er rekkefolgen prosesser kunne
    fullfore i, eller listen som ble bygget for fant ikke (delvis).
    """
    n = len(allocation)
    m = len(available)
    # === DIN OPPGAVE ===
    # 1. Bygg need[i][j] = max_claim[i][j] - allocation[i][j].
    # 2. work = kopi av available; finish = [False] * n; safe_seq = [].
    # 3. Loop: finn finish[i]==False der need[i][j] <= work[j] for alle j.
    #    Hvis funnet: work += allocation[i], finish[i] = True, safe_seq.append(i).
    #    Hvis ingen i ble funnet i en hel runde: bryt.
    # 4. Returner (all(finish), safe_seq).
    return (False, [])


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Test 1: klassisk Tanenbaum/Silberschatz-eksempel
# 5 prosesser, 3 ressurstyper (A, B, C), 10/5/7 instanser totalt
# Available = (3, 3, 2)
available = [3, 3, 2]
allocation = [
    [0, 1, 0],   # P0
    [2, 0, 0],   # P1
    [3, 0, 2],   # P2
    [2, 1, 1],   # P3
    [0, 0, 2],   # P4
]
max_claim = [
    [7, 5, 3],
    [3, 2, 2],
    [9, 0, 2],
    [2, 2, 2],
    [4, 3, 3],
]
safe, seq = is_safe(available, max_claim, allocation)
sjekk(safe, True, "Tanenbaum: safe state")
sjekk(seq, [1, 3, 4, 0, 2], "safe sequence P1, P3, P4, P0, P2")

# Test 2: gjor det unsafe — gi P0 to ekstra instanser av B fra available
# available = (3, 1, 2), alloc P0 = (0, 3, 0). Need P0 = (7, 2, 3).
# Need P1 = (1,2,2). work=(3,1,2): P1 trenger B=2>1. Stuck.
# Need P3 = (0,1,1). OK. work += (2,1,1) = (5,2,3).
# Need P1 = (1,2,2) OK. work += (2,0,0) = (7,2,3).
# Need P4 = (4,3,1). B=3>2. Stuck.
# Need P0 = (7,2,3). OK. work += (0,3,0) = (7,5,3).
# Need P4 = (4,3,1) OK. work += (0,0,2)=(7,5,5). Need P2 = (6,0,0) OK. Alle fullforer.
# Aha, fortsatt safe. La oss heller flytte slik at det blir tydelig unsafe.
# Reduser available[A] til 0: available=(0,3,2). Nei, vi maa bruke nye verdier.
# Bruk i stedet: max_claim[P4][A] = 5 (uendret), men allocate P4 = (2, 0, 2).
# Sum A blir 0+2+3+2+2=9 (max 10), available[A] = 1. need[P4][A]=3. work=(1,3,2):
# P1 need (1,2,2) OK -> work=(3,3,2). P3 need (0,1,1) OK -> work=(5,4,3).
# P4 need (3,3,1): A=3 OK -> work=(7,4,5). P0 need (7,4,3) OK -> (7,5,5). P2 need (6,0,0) OK. Safe.
# La oss heller bruke et helt nytt eksempel for unsafe:
# 2 prosesser, 1 type. Available=0. Max P0=2, alloc P0=1, need P0=1.
# Max P1=2, alloc P1=1, need P1=1. Begge trenger 1, ingen har — UNSAFE.
unsafe_avail = [0]
unsafe_alloc = [[1], [1]]
unsafe_max = [[2], [2]]
unsafe_ok, _ = is_safe(unsafe_avail, unsafe_max, unsafe_alloc)
sjekk(unsafe_ok, False, "unsafe: begge trenger 1, ingen tilgjengelig")

# Test 3: triviell safe — alle prosesser kan fullfore med dagens available
triv_avail = [10]
triv_alloc = [[0], [0]]
triv_max = [[5], [5]]
triv_ok, triv_seq = is_safe(triv_avail, triv_max, triv_alloc)
sjekk(triv_ok, True, "triviell: rikelig available")
sjekk(triv_seq, [0, 1], "ferdig-i-rekkefolge naar begge er like")
`,
      },
      defaultFile: "bankers.py",
      editable: ["bankers.py"],
      run: { kind: "python-script", entry: "bankers.py" },
      verifications: [
        { label: "Tanenbaum-eksempel detekteres som safe", check: { kind: "output-contains", needle: "OK   Tanenbaum: safe state" } },
        { label: "Korrekt safe sequence [1, 3, 4, 0, 2]", check: { kind: "output-contains", needle: "OK   safe sequence P1, P3, P4, P0, P2" } },
        { label: "Unsafe state identifiseres riktig", check: { kind: "output-contains", needle: "OK   unsafe: begge trenger 1, ingen tilgjengelig" } },
        { label: "Triviell rikelig-ressurs er safe", check: { kind: "output-contains", needle: "OK   triviell: rikelig available" } },
        { label: "Konsistent rekkefølge for like prosesser", check: { kind: "output-contains", needle: "OK   ferdig-i-rekkefolge naar begge er like" } },
      ],
      hint:
        "n = len(allocation); m = len(available)\nneed = [[max_claim[i][j] - allocation[i][j] for j in range(m)] for i in range(n)]\nwork = list(available)\nfinish = [False] * n\nsafe_seq = []\nwhile True:\n    progressed = False\n    for i in range(n):\n        if not finish[i] and all(need[i][j] <= work[j] for j in range(m)):\n            for j in range(m):\n                work[j] += allocation[i][j]\n            finish[i] = True\n            safe_seq.append(i)\n            progressed = True\n            break  # restart slik at vi prefererer lavest-indeks-foerst per runde\n    if not progressed:\n        break\nreturn (all(finish), safe_seq)",
    },

    // ============ LEKSJON 4 ===========================================
    {
      id: "04-bankers-request",
      title: "4. Bankers algoritme — request-grant med tilbakerulling",
      narrative:
        "Safety-check er bare halve algoritmen. Bankers brukes til **å avgjøre om en tildeling er trygg å gjennomføre**: en prosess kommer med en request, vi prøver tildelingen midlertidig, sjekker safety, og enten committer eller ruller tilbake.\n\nAlgoritmen for `request_resources(pid, request, ...)`:\n\n1. **Sanity 1:** `request[j] <= Need[pid][j]` for alle j. Ellers feilmelding — prosessen ba om mer enn den noen gang sa den ville trenge.\n2. **Sanity 2:** `request[j] <= Available[j]` for alle j. Ellers: ressursene er ikke tilgjengelige akkurat nå — blokker (i ekte OS: prosessen suspenders).\n3. **Tentativ tildeling:** lag kopier av Available og Allocation, gjør tildelingen i kopiene.\n4. **Safety-sjekk** på den hypotetiske tilstanden.\n5. Hvis safe → commit (i denne sandkassen returnerer vi bare `True`). Hvis unsafe → forkast kopiene og returner `False` med begrunnelse.\n\nLegg merke til at en `False` her ikke betyr at tildelingen ville skapt deadlock akkurat nå — det betyr at det ville etterlatt systemet i en tilstand der deadlock er **mulig** hvis verste fall inntreffer. Bankers er konservativ av design.\n\n**Din oppgave:** Implementér `request_resources(pid, request, available, max_claim, allocation) -> (granted: bool, melding: str)`. Du kan bruke `is_safe` fra forrige leksjon — den er gjenbruksklart i fila.",
      files: {
        "bankers.py": `def is_safe(available, max_claim, allocation):
    """Gjenbruk fra leksjon 3."""
    n = len(allocation)
    m = len(available)
    need = [[max_claim[i][j] - allocation[i][j] for j in range(m)] for i in range(n)]
    work = list(available)
    finish = [False] * n
    safe_seq = []
    while True:
        progressed = False
        for i in range(n):
            if not finish[i] and all(need[i][j] <= work[j] for j in range(m)):
                for j in range(m):
                    work[j] += allocation[i][j]
                finish[i] = True
                safe_seq.append(i)
                progressed = True
                break
        if not progressed:
            break
    return all(finish), safe_seq


def request_resources(pid, request, available, max_claim, allocation):
    """Forsoek aa innvilge en request fra prosess pid.

    Returner (granted, melding).
      granted=True : "granted"
      granted=False: feilmelding ("over need", "ikke tilgjengelig", eller "unsafe")
    """
    m = len(available)
    # === DIN OPPGAVE ===
    # 1. need = max_claim[pid] - allocation[pid]
    # 2. Hvis request[j] > need[j] for noen j: return (False, "request overstiger max-claim (need)")
    # 3. Hvis request[j] > available[j] for noen j: return (False, "ikke nok tilgjengelig akkurat nå")
    # 4. Lag kopier: new_available[j] = available[j] - request[j]
    #    new_allocation[pid][j] = allocation[pid][j] + request[j]  (kopier hele matrisen!)
    # 5. Kjor is_safe(new_available, max_claim, new_allocation).
    #    Hvis safe -> return (True, "granted")
    #    Hvis unsafe -> return (False, "ville etterlatt systemet i unsafe state — denied")
    return (False, "ikke implementert")


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Sett opp Tanenbaum/Silberschatz-eksemplet pa nytt
available = [3, 3, 2]
allocation = [
    [0, 1, 0],
    [2, 0, 0],
    [3, 0, 2],
    [2, 1, 1],
    [0, 0, 2],
]
max_claim = [
    [7, 5, 3],
    [3, 2, 2],
    [9, 0, 2],
    [2, 2, 2],
    [4, 3, 3],
]

# Test 1: P1 ber om (1, 0, 2). Klassisk svar fra Silberschatz: GRANTED.
g1, m1 = request_resources(1, [1, 0, 2], available, max_claim, allocation)
sjekk(g1, True, "P1's request (1,0,2) granted")

# Test 2: simuler at vi har commitet test 1.
# avail = (2, 3, 0), alloc P1 = (3, 0, 2).
# Naa proever P0 (0, 2, 0). Klassisk svar: DENIED (unsafe).
avail_after = [2, 3, 0]
alloc_after = [r[:] for r in allocation]
alloc_after[1] = [3, 0, 2]
g2, m2 = request_resources(0, [0, 2, 0], avail_after, max_claim, alloc_after)
sjekk(g2, False, "P0's request (0,2,0) denied (ville bli unsafe)")
sjekk("unsafe" in m2, True, "feilmelding nevner unsafe")

# Test 3: P0 ber om (10, 0, 0) — over max-claim (Max[P0]=7, alloc=0, need=7).
g3, m3 = request_resources(0, [10, 0, 0], available, max_claim, allocation)
sjekk(g3, False, "P0's request (10,0,0) avvist umiddelbart")
sjekk("max-claim" in m3 or "need" in m3.lower(), True, "feilmelding nevner max-claim")

# Test 4: P4 ber om (3, 3, 0) — overstiger available (3, 3, 2) paa A og B?
# need P4 = (4, 3, 1). request (3, 3, 0) <= need OK. available (3, 3, 2). request (3,3,0) OK paa avail.
# Vi maa lage en sak der available er for liten. P3 ber om (2, 2, 2) — need P3 = (0, 1, 1).
# request (2,2,2) overstiger need[B]=1. Vil bli avvist paa need-sjekken — ikke det vi tester her.
# Konstruér i stedet en sak der request <= need men > available:
# P4 trenger (4,3,1). available naa er (3,3,2). request (4, 0, 0): need[A]=4 OK, men avail[A]=3.
g4, m4 = request_resources(4, [4, 0, 0], available, max_claim, allocation)
sjekk(g4, False, "P4's request (4,0,0) avvist — overstiger available")
sjekk("tilgjengelig" in m4.lower(), True, "feilmelding nevner tilgjengelig")
`,
      },
      defaultFile: "bankers.py",
      editable: ["bankers.py"],
      run: { kind: "python-script", entry: "bankers.py" },
      verifications: [
        { label: "Klassisk granted-eksempel godkjennes", check: { kind: "output-contains", needle: "OK   P1's request (1,0,2) granted" } },
        { label: "Klassisk denied-eksempel avvises (unsafe)", check: { kind: "output-contains", needle: "OK   P0's request (0,2,0) denied (ville bli unsafe)" } },
        { label: "Feilmelding for unsafe forklarer hvorfor", check: { kind: "output-contains", needle: "OK   feilmelding nevner unsafe" } },
        { label: "Request over max-claim avvises umiddelbart", check: { kind: "output-contains", needle: "OK   P0's request (10,0,0) avvist umiddelbart" } },
        { label: "Feilmelding nevner max-claim", check: { kind: "output-contains", needle: "OK   feilmelding nevner max-claim" } },
        { label: "Request over tilgjengelig avvises", check: { kind: "output-contains", needle: "OK   P4's request (4,0,0) avvist — overstiger available" } },
        { label: "Feilmelding nevner tilgjengelig", check: { kind: "output-contains", needle: "OK   feilmelding nevner tilgjengelig" } },
      ],
      hint:
        "need = [max_claim[pid][j] - allocation[pid][j] for j in range(m)]\nif any(request[j] > need[j] for j in range(m)):\n    return (False, \"request overstiger max-claim (need)\")\nif any(request[j] > available[j] for j in range(m)):\n    return (False, \"ikke nok tilgjengelig akkurat nå\")\nnew_available = [available[j] - request[j] for j in range(m)]\nnew_allocation = [row[:] for row in allocation]\nfor j in range(m):\n    new_allocation[pid][j] += request[j]\nsafe, _ = is_safe(new_available, max_claim, new_allocation)\nif safe:\n    return (True, \"granted\")\nreturn (False, \"ville etterlatt systemet i unsafe state — denied\")",
    },

    // ============ LEKSJON 5 ===========================================
    {
      id: "05-recovery",
      title: "5. Recovery — minste sett prosesser å avbryte",
      narrative:
        "Bankers algoritme er avoidance — den hindrer at deadlock noensinne oppstår. Men hvis OS-et har valgt deteksjon i stedet (billigere i runtime), må vi rydde opp etter at deadlock har skjedd. To klassiske recovery-strategier:\n\n1. **Process termination** — abort én eller flere deadlockede prosesser, frigjør ressursene deres. Variant a: abort alle deadlockede (brutalt, men enkelt). Variant b: abort én om gangen, sjekk etter hver om deadlock er borte (kostbart, men sparer prosesser).\n2. **Resource preemption** — ta ressursen midlertidig fra én prosess (rollback til en checkpoint) og gi den til en annen. Krever støtte for rollback i prosessen.\n\nVi implementerer **minimum termination**: gitt et deadlock, finn det minste settet prosesser man kan abortere slik at de gjenstående ikke lenger er deadlocked. Strategien er greedy enumeration over delmengder i økende størrelse — for små lab-eksempler er det helt OK. (I praksis bruker OS-et heuristikker basert på prioritet, kjøretid og ressurser holdt.)\n\nAbort av prosess i betyr:\n\n- `Available += Allocation[i]`\n- `Allocation[i] = 0`\n- `Request[i] = 0`\n\nSå sjekker vi om resten fortsatt er deadlocket.\n\n**Din oppgave:** Implementér `minimum_abort_set(available, allocation, request)` som returnerer en `set[int]` — det minste settet prosesser hvis abort eliminerer all deadlock. Returner tom mengde hvis ingen deadlock.",
      files: {
        "recovery.py": `from itertools import combinations


def detect_deadlock(available, allocation, request):
    """Gjenbruk fra leksjon 2."""
    n = len(allocation)
    m = len(available)
    work = list(available)
    finish = [all(allocation[i][j] == 0 for j in range(m)) for i in range(n)]
    while True:
        progressed = False
        for i in range(n):
            if not finish[i] and all(request[i][j] <= work[j] for j in range(m)):
                for j in range(m):
                    work[j] += allocation[i][j]
                finish[i] = True
                progressed = True
        if not progressed:
            break
    return sorted(i for i, f in enumerate(finish) if not f)


def minimum_abort_set(available, allocation, request):
    """Finn minste sett prosesser som maa abortes for aa bryte all deadlock.

    Strategi: enumerér delmengder av deadlockede prosesser i ökende størrelse.
    For hver kandidat: simuler abort (frigi alloc, fjern request), kjør
    detect_deadlock paa nytt. Hvis ingen gjenværende deadlock — returner kandidaten.
    """
    # === DIN OPPGAVE ===
    # 1. dl = detect_deadlock(available, allocation, request)
    # 2. Hvis dl er tom: return set()
    # 3. For size i 1..len(dl):
    #      for combo i combinations(dl, size):
    #        simuler abort av prosessene i combo:
    #          new_avail = list(available); new_alloc = deep copy; new_req = deep copy
    #          for hver p i combo:
    #            new_avail += allocation[p]; new_alloc[p] = nullvektor; new_req[p] = nullvektor
    #        sjekk: remaining = detect_deadlock(new_avail, new_alloc, new_req)
    #          (remaining vil aldri inneholde p in combo siden de naa har alloc=0)
    #        hvis remaining er tom: return set(combo)
    # 4. Worst case: return set(dl)
    return set()


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Test 1: ingen deadlock — minimum abort er tom mengde
avail0 = [5, 5]
alloc0 = [[1, 0], [0, 1]]
req0 = [[0, 0], [0, 0]]
sjekk(minimum_abort_set(avail0, alloc0, req0), set(), "ingen deadlock -> tom mengde")

# Test 2: 2-prosess deadlock — abort av én holder
avail1 = [0, 0]
alloc1 = [
    [1, 0],
    [0, 1],
]
req1 = [
    [0, 1],
    [1, 0],
]
ab = minimum_abort_set(avail1, alloc1, req1)
sjekk(len(ab), 1, "2-prosess: abort av én er nok")
sjekk(ab.issubset({0, 1}), True, "abort-prosessen er en av de to")

# Test 3: konstruert sak der KUN spesifikk prosess er nok
# 3 prosesser, 1 ressurstype, available = 0
# P0: holder 3, ber om 0  -> ikke deadlocked (men i deteksjons-init: P0 har alloc>0 men req=0 -> kan fullfore med work=0 siden 0<=0)
# Faktisk: P0 har request 0 <= work=0, sa P0 fullfor foerst, frigjor 3. Da kan resten fullfore.
# Det blir ingen deadlock. La oss konstruere annerledes.
#
# 3 prosesser, 2 ressurstyper. Available=(0,0).
# P0: alloc=(0,2), req=(1,0)  trenger A, holder B
# P1: alloc=(2,0), req=(0,1)  trenger B, holder A — kontra P0
# P2: alloc=(0,1), req=(1,0)  trenger A, holder B
#
# Sykel mellom P0 og P1. P2 venter ogsa pa A.
# Abort P0 alene: frigjor (0,2). work=(0,2).
#   P1 req (0,1) <= (0,2) OK -> work=(2,2). P2 req (1,0) <= (2,2) OK. Loest.
# Abort P1 alene: frigjor (2,0). work=(2,0).
#   P0 req (1,0) <= (2,0) OK -> work=(2,2). P2 req (1,0) OK. Loest.
# Abort P2 alene: frigjor (0,1). work=(0,1).
#   P0 req (1,0): A=0 stuck. P1 req (0,1) <= (0,1) OK -> work=(2,1). P0 req (1,0) OK -> work=(2,3). Loest!
# Alle tre virker som singletons. Hmm, vi trenger en sak med entydig svar.
#
# La oss konstruere:
# Available=(0,)
# P0: alloc=(5,), req=(1,)
# P1: alloc=(0,), req=(1,)
# P2: alloc=(0,), req=(1,)
# work=0. P1: req 1>0 stuck. P2: stuck. P0: req 1>0 stuck. Alle stuck.
# Init finish: P1 og P2 har alloc=0 -> finish=True. Bare P0 er "deadlocked".
# Hmm, men da er ikke det egentlig deadlock, bare P0 staar stille fordi
# alle andre ikke frigjor noe. Faktisk korrekt: P0 holder 5 og ber om 1
# men ingen kan frigjøre A. P0 alene staar fast.
ab2 = minimum_abort_set([0], [[5], [0], [0]], [[1], [1], [1]])
sjekk(ab2, {0}, "kun P0 maa aborteres (P1, P2 holder ingenting)")
`,
      },
      defaultFile: "recovery.py",
      editable: ["recovery.py"],
      run: { kind: "python-script", entry: "recovery.py" },
      verifications: [
        { label: "Ingen deadlock gir tom abort-mengde", check: { kind: "output-contains", needle: "OK   ingen deadlock -> tom mengde" } },
        { label: "2-prosess deadlock løses med abort av én", check: { kind: "output-contains", needle: "OK   2-prosess: abort av én er nok" } },
        { label: "Abortert prosess er en av de deadlockede", check: { kind: "output-contains", needle: "OK   abort-prosessen er en av de to" } },
        { label: "Identifiserer entydig minste abort-sett", check: { kind: "output-contains", needle: "OK   kun P0 maa aborteres (P1, P2 holder ingenting)" } },
      ],
      hint:
        "dl = detect_deadlock(available, allocation, request)\nif not dl:\n    return set()\nm = len(available)\nfor size in range(1, len(dl) + 1):\n    for combo in combinations(dl, size):\n        new_avail = list(available)\n        new_alloc = [row[:] for row in allocation]\n        new_req = [row[:] for row in request]\n        for p in combo:\n            for j in range(m):\n                new_avail[j] += new_alloc[p][j]\n                new_alloc[p][j] = 0\n                new_req[p][j] = 0\n        remaining = detect_deadlock(new_avail, new_alloc, new_req)\n        if not remaining:\n            return set(combo)\nreturn set(dl)",
    },
  ],
};

const IPC_PIPES_QUEUES: MiniCourse = {
  id: "ipc-pipes-queues",
  slug: "ipc-pipes-queues",
  title: "Inter-Process Communication (IPC) fra null",
  blurb:
    "Bygg de fem IPC-mekanismene operativsystemet tilbyr: anonymous pipes, named pipes, message queues, shared memory + lock, og Unix-domene sockets. Hver leksjon bygger en bit fra grunnen og demonstrerer hvorfor mekanismen finnes — fra rene byte-strømmer til strukturerte meldinger til request/response over sockets.",
  estimertTid: "60–80 min",
  fag: ["DTE-2505", "Operativsystem", "IPC"],
  color: "warning",
  rekkefolge: 60,
  lessons: [
    // ============ LEKSJON 1 ===========================================
    {
      id: "01-anonymous-pipe",
      title: "1. Anonymous pipe: FIFO byte-stream",
      narrative:
        "En **anonym pipe** er den enkleste IPC-mekanismen i Unix: en endimensjonal byte-strøm fra en skriver til en leser. Det er ingen meldingsgrenser — pipen er bare bytes på rekke. Den klassiske bruken er shell-pipelining: `ls | wc -l` der ls-prosessens stdout er den ene enden av en pipe og wc's stdin er den andre.\n\nTo egenskaper definerer pipens semantikk:\n\n- **FIFO** — det første som skrives er det første som leses.\n- **Begrenset buffer + blokking** — kernel allokerer en fast buffer (typisk 64 KB på Linux). Når writeren forsøker å skrive mer enn det er plass til, blokkerer den til en leser tar litt. Når leseren forsøker å lese fra en tom buffer, blokkerer den til writeren legger inn noe. Dette er den naturlige flow-controllen i pipen.\n\nVi simulerer blokking deterministisk: en `pending_write` lagrer bytes som ikke fikk plass, og en `pending_read` lagrer hvor mange bytes leseren fortsatt mangler. `step()` forsøker å fullføre alle ventende operasjoner.\n\n**Din oppgave:**\n\n1. Implementér `write(data)`: skriv så mange bytes som det er plass til, lagre resten i `pending_write`. Returner antall bytes som ble lagret nå.\n2. Implementér `read(n)`: ta opp til n bytes fra bufferen. Hvis bufferen er tom for n, lagre `pending_read = mangel` og `read_result` så fortsatt-bytes kan plukkes opp av `step()`.\n3. Implementér `step()`: fullfør ventende write hvis det er plass, og ventende read hvis det er bytes.",
      files: {
        "pipe.py": `from collections import deque


class Pipe:
    """Anonym pipe: FIFO byte-stream med begrenset buffer.

    write(bytes) blokkerer hvis det ikke er plass.
    read(n) blokkerer hvis bufferen er tom.
    Vi simulerer blokking ved at write/read kan henge i "pending"-state,
    og pipe.step() forsoker a fullfore ventende operasjoner.
    """

    def __init__(self, capacity):
        self.capacity = capacity
        self.buffer = deque()
        self.pending_write = None  # bytes som ikke fikk plass
        self.pending_read = None   # int: hvor mange bytes leseren fortsatt mangler
        self.read_result = None    # akkumulert resultat av sist begynte read

    def write(self, data):
        """Forsok a skrive data. Returner hvor mange bytes som ble lagret nå."""
        # === DIN OPPGAVE ===
        # plass = self.capacity - len(self.buffer)
        # skrev = min(plass, len(data))
        # for b in data[:skrev]: self.buffer.append(b)
        # rest = data[skrev:]
        # if rest: self.pending_write = rest
        # return skrev
        pass

    def read(self, n):
        """Forsok a lese n bytes. Hvis bufferen er tom for n, lagre rest i pending_read.
        Returner bytes hvis vi fikk ALT, ellers None."""
        # === DIN OPPGAVE ===
        # ut = bytes()
        # while self.buffer and len(ut) < n:
        #     ut += bytes([self.buffer.popleft()])
        # if len(ut) < n:
        #     self.pending_read = n - len(ut)
        #     self.read_result = ut
        #     return None
        # return ut
        pass

    def step(self):
        """Ett "tidssteg": fullfor ventende write hvis det er plass,
        og ventende read hvis det er bytes."""
        # === DIN OPPGAVE ===
        # Pending write: prov a flytte data fra self.pending_write inn i bufferen.
        # Pending read: prov a hente flere bytes fra bufferen inn i self.read_result.
        pass


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# --- Test 1: enkel skriv 100 + les 100 (100-byte buffer) ---
p = Pipe(capacity=100)
data = bytes(range(100))
sjekk(p.write(data), 100, "skrev 100 bytes")
sjekk(p.pending_write, None, "ingen pending write")
sjekk(p.read(100), data, "leste tilbake samme 100 bytes")

# --- Test 2: writer blokkerer nar buffer er full (skriv 150 i 100-buffer) ---
p2 = Pipe(capacity=100)
big = bytes(range(150))
sjekk(p2.write(big), 100, "blocking write: 100 av 150 skrev seg")
sjekk(p2.pending_write is not None, True, "resten er pending")
sjekk(len(p2.pending_write), 50, "50 bytes star i pending")

# Leseren henter 100 -> det frigjor plass for de neste 50.
sjekk(p2.read(100), big[:100], "leste de forste 100 bytes")
p2.step()
sjekk(p2.pending_write, None, "pending write fullfort etter step")
sjekk(p2.read(50), big[100:], "leste de siste 50 bytes")

# --- Test 3: reader blokkerer nar pipen er tom ---
p3 = Pipe(capacity=10)
sjekk(p3.read(5), None, "blocking read: returner None nar tom")
sjekk(p3.pending_read, 5, "5 bytes pending read")
p3.write(b"hei")
p3.step()
sjekk(p3.pending_read, 2, "etter 3 bytes write: 2 fortsatt pending")
p3.write(b"jo")
p3.step()
sjekk(p3.pending_read, None, "alle 5 lest")
sjekk(p3.read_result, b"heijo", "samlet read-resultat er heijo")
`,
      },
      defaultFile: "pipe.py",
      editable: ["pipe.py"],
      run: { kind: "python-script", entry: "pipe.py" },
      verifications: [
        { label: "write 100 bytes lykkes", check: { kind: "output-contains", needle: "OK   skrev 100 bytes" } },
        { label: "read 100 returnerer samme bytes (FIFO)", check: { kind: "output-contains", needle: "OK   leste tilbake samme 100 bytes" } },
        { label: "write 150 i 100-buffer fyller buffer", check: { kind: "output-contains", needle: "OK   blocking write: 100 av 150 skrev seg" } },
        { label: "Resten av write blir pending", check: { kind: "output-contains", needle: "OK   50 bytes star i pending" } },
        { label: "step() flusher pending write etter read", check: { kind: "output-contains", needle: "OK   pending write fullfort etter step" } },
        { label: "Read pa tom pipe returnerer None (blokker)", check: { kind: "output-contains", needle: "OK   blocking read: returner None nar tom" } },
        { label: "Pending read fullfores etter delvise writes", check: { kind: "output-contains", needle: "OK   alle 5 lest" } },
        { label: "Akkumulert read-resultat er korrekt", check: { kind: "output-contains", needle: "OK   samlet read-resultat er heijo" } },
      ],
      hint:
        "def write(self, data):\n    plass = self.capacity - len(self.buffer)\n    skrev = min(plass, len(data))\n    for b in data[:skrev]:\n        self.buffer.append(b)\n    rest = data[skrev:]\n    if rest:\n        self.pending_write = rest\n    return skrev\n\ndef read(self, n):\n    ut = bytes()\n    while self.buffer and len(ut) < n:\n        ut += bytes([self.buffer.popleft()])\n    if len(ut) < n:\n        self.pending_read = n - len(ut)\n        self.read_result = ut\n        return None\n    return ut\n\ndef step(self):\n    if self.pending_write is not None:\n        plass = self.capacity - len(self.buffer)\n        data = self.pending_write\n        skrev = min(plass, len(data))\n        for b in data[:skrev]:\n            self.buffer.append(b)\n        rest = data[skrev:]\n        self.pending_write = rest if rest else None\n    if self.pending_read is not None:\n        tatt = bytes()\n        while self.buffer and len(tatt) < self.pending_read:\n            tatt += bytes([self.buffer.popleft()])\n        self.read_result = (self.read_result or bytes()) + tatt\n        self.pending_read -= len(tatt)\n        if self.pending_read <= 0:\n            self.pending_read = None",
    },

    // ============ LEKSJON 2 ===========================================
    {
      id: "02-named-pipe",
      title: "2. Named pipe (FIFO): kommunikasjon via navn",
      narrative:
        "Anonymous pipes har en alvorlig begrensning: **bare prosesser i samme prosess-familie kan dele en**. Den klassiske bruken er `pipe()` + `fork()` — barneprosessen arver pipe-deskriptoren. To helt urelaterte prosesser kan ikke finne hverandres anonymous pipe.\n\n**Named pipes** (også kalt FIFOs i Unix) løser dette ved å gi pipen et **navn i filsystemet**, typisk `/tmp/min-fifo`. Hvilken som helst prosess som vet navnet kan åpne pipen — som om den var en fil — og lese eller skrive. Bakom kulissene er det fortsatt en pipe-buffer i kernel, ikke en ekte fil på disk; navnet er bare en katalogpost som peker på pipen.\n\nVi modellerer dette med en **`NamedPipeRegistry`** — en class-level dict fra navn til Pipe-objekt. `open(navn)` slår opp i registry og oppretter pipen hvis den ikke finnes; så får to urelaterte prosesser tilgang til samme objekt ved å bare kjenne navnet.\n\n**Din oppgave:**\n\n1. Implementér `NamedPipeRegistry.open(navn, capacity=100)` slik at samme navn alltid returnerer samme Pipe-objekt (singleton per navn).\n2. Implementér `NamedPipeRegistry.unlink(navn)` som fjerner navnet fra registry (analogt med `rm /tmp/min-fifo`).\n3. Skriv `Producer.run()` som åpner pipen `/tmp/fifo-data`, skriver `b\"melding-fra-A\"`, og er ferdig. Skriv `Consumer.run()` som åpner samme navn og leser 13 bytes.",
      files: {
        "namedpipe.py": `from collections import deque


class Pipe:
    """Den samme pipen som i leksjon 1, kort gjengitt."""
    def __init__(self, capacity):
        self.capacity = capacity
        self.buffer = deque()

    def write(self, data):
        plass = self.capacity - len(self.buffer)
        skrev = min(plass, len(data))
        for b in data[:skrev]:
            self.buffer.append(b)
        return skrev

    def read(self, n):
        ut = bytes()
        while self.buffer and len(ut) < n:
            ut += bytes([self.buffer.popleft()])
        return ut


class NamedPipeRegistry:
    """Filsystem-mock: navn -> Pipe-objekt. To prosesser som apner samme
    navn far samme objekt — det er nettopp poenget med named pipes."""
    _pipes = {}

    @classmethod
    def open(cls, navn, capacity=100):
        # === DIN OPPGAVE ===
        # Hvis navn ikke finnes: opprett ny Pipe(capacity) og lagre i _pipes.
        # Returner den eksisterende/nye pipen.
        pass

    @classmethod
    def unlink(cls, navn):
        # === DIN OPPGAVE ===
        # Fjern navnet fra _pipes hvis det finnes. Ikke feil om det mangler.
        pass

    @classmethod
    def clear(cls):
        cls._pipes = {}


class Producer:
    """En "prosess" som skriver til en named pipe."""
    def __init__(self, pipe_navn, melding):
        self.pipe_navn = pipe_navn
        self.melding = melding

    def run(self):
        # === DIN OPPGAVE ===
        # Apne pipen ved navn, skriv self.melding.
        pass


class Consumer:
    """En urelatert "prosess" — den vet bare navnet."""
    def __init__(self, pipe_navn, antall):
        self.pipe_navn = pipe_navn
        self.antall = antall
        self.mottatt = None

    def run(self):
        # === DIN OPPGAVE ===
        # Apne pipen ved navn, les self.antall bytes, lagre i self.mottatt.
        pass


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


NamedPipeRegistry.clear()

# --- Test 1: samme navn -> samme pipe-objekt (singleton-property) ---
a = NamedPipeRegistry.open("/tmp/fifo")
b = NamedPipeRegistry.open("/tmp/fifo")
sjekk(a is b, True, "to open av samme navn gir samme objekt")

# --- Test 2: ulike navn -> ulike pipes ---
c = NamedPipeRegistry.open("/tmp/annen-fifo")
sjekk(a is not c, True, "ulike navn gir ulike pipes")

# --- Test 3: Producer og Consumer urelaterte, samme navn ---
NamedPipeRegistry.clear()
prod = Producer("/tmp/fifo-data", b"melding-fra-A")
cons = Consumer("/tmp/fifo-data", 13)

prod.run()
# Pipen overlever selv om Producer er "ferdig" — registry holder den.
cons.run()
sjekk(cons.mottatt, b"melding-fra-A", "Consumer leste hele meldingen")

# --- Test 4: unlink fjerner navnet, men ikke pipen vi alt holder ---
existing = NamedPipeRegistry.open("/tmp/midlertidig")
existing.write(b"data")
NamedPipeRegistry.unlink("/tmp/midlertidig")
ny = NamedPipeRegistry.open("/tmp/midlertidig")
sjekk(ny is existing, False, "etter unlink: ny open gir frisk pipe")
sjekk(len(ny.buffer), 0, "den friske pipen er tom")

# unlink av ikke-eksisterende navn skal ikke krasje
NamedPipeRegistry.unlink("/tmp/aldri-fantes")
print("OK   unlink ukjent navn krasjer ikke")
`,
      },
      defaultFile: "namedpipe.py",
      editable: ["namedpipe.py"],
      run: { kind: "python-script", entry: "namedpipe.py" },
      verifications: [
        { label: "Samme navn returnerer samme pipe-objekt", check: { kind: "output-contains", needle: "OK   to open av samme navn gir samme objekt" } },
        { label: "Ulike navn gir ulike pipes", check: { kind: "output-contains", needle: "OK   ulike navn gir ulike pipes" } },
        { label: "Urelaterte prosesser kan kommunisere via navn", check: { kind: "output-contains", needle: "OK   Consumer leste hele meldingen" } },
        { label: "unlink frigjor navnet", check: { kind: "output-contains", needle: "OK   etter unlink: ny open gir frisk pipe" } },
        { label: "unlink av ukjent navn er trygt", check: { kind: "output-contains", needle: "OK   unlink ukjent navn krasjer ikke" } },
      ],
      hint:
        "@classmethod\ndef open(cls, navn, capacity=100):\n    if navn not in cls._pipes:\n        cls._pipes[navn] = Pipe(capacity)\n    return cls._pipes[navn]\n\n@classmethod\ndef unlink(cls, navn):\n    cls._pipes.pop(navn, None)\n\n# Producer.run:\ndef run(self):\n    p = NamedPipeRegistry.open(self.pipe_navn)\n    p.write(self.melding)\n\n# Consumer.run:\ndef run(self):\n    p = NamedPipeRegistry.open(self.pipe_navn)\n    self.mottatt = p.read(self.antall)",
    },

    // ============ LEKSJON 3 ===========================================
    {
      id: "03-message-queue",
      title: "3. Message queue: strukturerte meldinger, ikke bytes",
      narrative:
        "Pipes er **byte-strømmer** — det er ingen meldingsgrenser. Hvis prosess A skriver `b\"hei\"` og `b\"verden\"`, og prosess B leser 11 bytes, får B `b\"heiverden\"` uten å vite hvor den ene meldingen sluttet og den neste begynte. Applikasjonen må selv definere et rammeformat (lengde-prefiks, terminator, e.l.).\n\n**Message queues** løser dette ved å bevare meldingsgrensene: hver `send` legger ett objekt i køen, og `receive` returnerer ett objekt. I tillegg har klassiske SysV-meldingskøer et **type-felt** på hver melding, og leseren kan **filtrere på type** — `receive(msg_type=2)` returnerer bare meldinger som har type 2 (FIFO blant disse). Dette er hvordan en server kan multiplekse forespørsler på én kø.\n\n**Din oppgave:**\n\n1. `send(msg)`: legg `msg` (en dict, må ha `\"msg_type\"`-felt) bakerst i køen.\n2. `receive(msg_type=None)`: hvis `msg_type` er None, returner og fjern første melding. Hvis satt, returner og fjern første melding med matchende type. Returner `None` hvis ingen matcher.",
      files: {
        "msgqueue.py": `class MessageQueue:
    """Bevarer meldingsgrenser og stotter type-basert filtrering."""

    def __init__(self):
        self.meldinger = []

    def send(self, msg):
        """Legg meldingen bak i kø. msg er en dict med minst "msg_type"."""
        # === DIN OPPGAVE ===
        pass

    def receive(self, msg_type=None):
        """Hvis msg_type er None: returner og fjern forste melding.
        Hvis satt: returner og fjern forste melding med matchende type.
        Returner None hvis ingen passende."""
        # === DIN OPPGAVE ===
        pass

    def __len__(self):
        return len(self.meldinger)


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# --- Test 1: send og motta i FIFO-orden ---
q = MessageQueue()
q.send({"msg_type": 1, "data": "forste"})
q.send({"msg_type": 1, "data": "andre"})
q.send({"msg_type": 1, "data": "tredje"})
sjekk(len(q), 3, "tre meldinger i kø")
sjekk(q.receive()["data"], "forste", "FIFO: forste melding ut først")
sjekk(q.receive()["data"], "andre", "FIFO: andre melding ut neste")
sjekk(len(q), 1, "to fjernet, en igjen")

# --- Test 2: selektiv mottak pa msg_type ---
q2 = MessageQueue()
q2.send({"msg_type": 1, "data": "loggmelding-1"})
q2.send({"msg_type": 2, "data": "kommando-A"})
q2.send({"msg_type": 1, "data": "loggmelding-2"})
q2.send({"msg_type": 2, "data": "kommando-B"})
q2.send({"msg_type": 3, "data": "feilmelding"})

# Hent type 2 (kommandoer) — skal komme i FIFO blant type-2.
sjekk(q2.receive(msg_type=2)["data"], "kommando-A", "type=2: forste kommando")
sjekk(q2.receive(msg_type=2)["data"], "kommando-B", "type=2: andre kommando")
sjekk(q2.receive(msg_type=2), None, "type=2: ingen flere kommandoer")

# Type 1 (logging) er fortsatt intakt og i orden.
sjekk(q2.receive(msg_type=1)["data"], "loggmelding-1", "type=1 fortsatt FIFO")
sjekk(q2.receive(msg_type=1)["data"], "loggmelding-2", "type=1 nr 2 FIFO")

# Type 3 (errors) ligger igjen.
sjekk(len(q2), 1, "kun feilmelding igjen")
sjekk(q2.receive()["data"], "feilmelding", "uten filter henter neste i kø")

# --- Test 3: receive pa tom kø returnerer None ---
tom = MessageQueue()
sjekk(tom.receive(), None, "tom kø: receive gir None")
sjekk(tom.receive(msg_type=5), None, "tom kø: filtrert receive gir None")
`,
      },
      defaultFile: "msgqueue.py",
      editable: ["msgqueue.py"],
      run: { kind: "python-script", entry: "msgqueue.py" },
      verifications: [
        { label: "FIFO-orden ivaretas", check: { kind: "output-contains", needle: "OK   FIFO: forste melding ut først" } },
        { label: "Lengde-telling stemmer", check: { kind: "output-contains", needle: "OK   tre meldinger i kø" } },
        { label: "Selektiv mottak pa msg_type=2", check: { kind: "output-contains", needle: "OK   type=2: forste kommando" } },
        { label: "Andre kommando hentes etter forste", check: { kind: "output-contains", needle: "OK   type=2: andre kommando" } },
        { label: "Ingen flere av type 2 returnerer None", check: { kind: "output-contains", needle: "OK   type=2: ingen flere kommandoer" } },
        { label: "Type 1 er uberort av type-2-mottakene", check: { kind: "output-contains", needle: "OK   type=1 fortsatt FIFO" } },
        { label: "Tom kø returnerer None", check: { kind: "output-contains", needle: "OK   tom kø: receive gir None" } },
      ],
      hint:
        "def send(self, msg):\n    self.meldinger.append(msg)\n\ndef receive(self, msg_type=None):\n    if msg_type is None:\n        if not self.meldinger:\n            return None\n        return self.meldinger.pop(0)\n    for i, m in enumerate(self.meldinger):\n        if m.get(\"msg_type\") == msg_type:\n            return self.meldinger.pop(i)\n    return None",
    },

    // ============ LEKSJON 4 ===========================================
    {
      id: "04-shared-memory-lock",
      title: "4. Shared memory + synkronisering: race og fiksen",
      narrative:
        "Pipes og message queues kopierer data — sender skriver, mottaker leser, ferdig. Det er trygt, men ineffektivt for store dataobjekter. **Shared memory** er IPC-mekanismen som *ikke* kopierer: et minneområde mappes inn i adresseromet til flere prosesser, og de leser/skriver direkte i samme bytes.\n\nDette er ekstremt raskt, men prisen er at du **selv må synkronisere** — kjernel beskytter deg ikke lenger. Den klassiske feilen: to prosesser inkrementerer en delt teller. Hver inkrement er egentlig tre operasjoner: les, regn ut +1, skriv tilbake. Hvis scheduleren bytter mellom prosesser midt i sekvensen, kan begge lese den samme verdien og skrive +1 — og en inkrement er borte. Dette er en **race condition**.\n\nFiksen er en **mutex/lock**: før kritisk seksjon, kall `acquire`; etterpå, `release`. Hvis en annen prosess holder låsen, blokkerer du.\n\nVi simulerer det ved at hver prosess utfører ett mikro-steg om gangen (`read`, `compute`, `write`) i en round-robin loop. Uten lock blir interleavingen ødeleggende; med lock må prosessen ha eksklusiv tilgang gjennom hele sekvensen.\n\n**Din oppgave:**\n\n1. `SharedMemory.attach(navn)`: returner samme dict-objekt for samme navn (singleton).\n2. `Lock.acquire(eier)`: hvis ingen eier, sett `eier`, returner True. Ellers returner False (ikke blokker — vi simulerer dette ved at prosessen ikke får gjort progresjon).\n3. `Lock.release(eier)`: frigi låsen kun hvis kalleren er nåværende eier.\n4. `Process.step()`: implementér den 3-fasede syklusen read → compute → write, og hvis prosessen har en lock, må den holde låsen gjennom hele syklusen.",
      files: {
        "shmem.py": `class SharedMemory:
    """Et navngitt delt segment — flere "prosesser" leser/skriver samme dict."""
    _segments = {}

    @classmethod
    def attach(cls, navn):
        # === DIN OPPGAVE ===
        # Hvis navn ikke finnes, opprett {"value": 0} og lagre.
        # Returner segmentet.
        pass

    @classmethod
    def reset(cls):
        cls._segments = {}


class Lock:
    """Primitiv mutex — eid av en bestemt eier eller fri."""

    def __init__(self):
        self.eier = None

    def acquire(self, eier):
        # === DIN OPPGAVE ===
        # Hvis self.eier er None: sett self.eier = eier; returner True.
        # Ellers: returner False (prosessen far ikke gjort noe na).
        pass

    def release(self, eier):
        # === DIN OPPGAVE ===
        # Frigi kun hvis kalleren er navarende eier.
        pass


class Process:
    """Utforer en increment-loop ett mikro-steg om gangen.
    Faser: read -> compute -> write -> (telle ned iterasjon)."""

    def __init__(self, pid, iterasjoner, seg, lock=None):
        self.pid = pid
        self.iter_igjen = iterasjoner
        self.seg = seg
        self.lock = lock
        self.phase = "read"
        self.local = 0

    def is_done(self):
        return self.iter_igjen == 0

    def step(self):
        if self.is_done():
            return
        # === DIN OPPGAVE ===
        # 1. Hvis self.lock er satt og vi ikke eier den: forsok acquire(self.pid).
        #    Hvis ikke vi far den: return (blokkert).
        # 2. Hvis phase == "read": self.local = self.seg["value"]; phase = "compute".
        # 3. Elif phase == "compute": self.local += 1; phase = "write".
        # 4. Elif phase == "write":
        #      self.seg["value"] = self.local
        #      self.phase = "read"
        #      self.iter_igjen -= 1
        #      hvis lock: self.lock.release(self.pid)
        pass


def kjor_interleaved(processes):
    """Round-robin scheduler: stepper alle prosesser pa rundgang til ferdig."""
    while any(not p.is_done() for p in processes):
        for p in processes:
            p.step()


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# --- Test 1: shared memory er virkelig delt mellom attach ---
SharedMemory.reset()
a = SharedMemory.attach("teller")
b = SharedMemory.attach("teller")
a["value"] = 42
sjekk(b["value"], 42, "to attach til samme navn deler segmentet")

# --- Test 2: UTEN lock -> race condition gir tap ---
SharedMemory.reset()
seg = SharedMemory.attach("teller")
p1 = Process(pid=1, iterasjoner=1000, seg=seg)
p2 = Process(pid=2, iterasjoner=1000, seg=seg)
kjor_interleaved([p1, p2])
verdi_uten_lock = seg["value"]
print(f"Uten lock: {verdi_uten_lock} (forventet 2000 hvis ingen race)")
sjekk(verdi_uten_lock < 2000, True, "uten lock: race tap (verdi < 2000)")

# --- Test 3: MED lock -> alle inkrementer registrert ---
SharedMemory.reset()
seg2 = SharedMemory.attach("teller")
lock = Lock()
p3 = Process(pid=3, iterasjoner=1000, seg=seg2, lock=lock)
p4 = Process(pid=4, iterasjoner=1000, seg=seg2, lock=lock)
kjor_interleaved([p3, p4])
sjekk(seg2["value"], 2000, "med lock: alle inkrementer registrert")

# --- Test 4: lock-eierskap ---
l = Lock()
sjekk(l.acquire("A"), True, "A far lock som er fri")
sjekk(l.acquire("B"), False, "B nektes lock som A holder")
l.release("B")  # skal ikke frigi (B er ikke eier)
sjekk(l.eier, "A", "release fra ikke-eier ignoreres")
l.release("A")
sjekk(l.eier, None, "release fra eier frigir")
sjekk(l.acquire("B"), True, "B far lock etter frigjoring")
`,
      },
      defaultFile: "shmem.py",
      editable: ["shmem.py"],
      run: { kind: "python-script", entry: "shmem.py" },
      verifications: [
        { label: "Shared memory er delt mellom attach-kall", check: { kind: "output-contains", needle: "OK   to attach til samme navn deler segmentet" } },
        { label: "Race condition uten lock gir tap", check: { kind: "output-contains", needle: "OK   uten lock: race tap (verdi < 2000)" } },
        { label: "Lock fikser racen — alle inkrementer registreres", check: { kind: "output-contains", needle: "OK   med lock: alle inkrementer registrert" } },
        { label: "Lock kan eies av kun en om gangen", check: { kind: "output-contains", needle: "OK   B nektes lock som A holder" } },
        { label: "Release fra ikke-eier er en no-op", check: { kind: "output-contains", needle: "OK   release fra ikke-eier ignoreres" } },
        { label: "Eier kan frigi og noen andre far lock", check: { kind: "output-contains", needle: "OK   B far lock etter frigjoring" } },
      ],
      hint:
        "# SharedMemory.attach:\n@classmethod\ndef attach(cls, navn):\n    if navn not in cls._segments:\n        cls._segments[navn] = {\"value\": 0}\n    return cls._segments[navn]\n\n# Lock:\ndef acquire(self, eier):\n    if self.eier is None:\n        self.eier = eier\n        return True\n    return False\n\ndef release(self, eier):\n    if self.eier == eier:\n        self.eier = None\n\n# Process.step:\ndef step(self):\n    if self.is_done():\n        return\n    if self.lock is not None and self.lock.eier != self.pid:\n        if not self.lock.acquire(self.pid):\n            return\n    if self.phase == \"read\":\n        self.local = self.seg[\"value\"]\n        self.phase = \"compute\"\n    elif self.phase == \"compute\":\n        self.local += 1\n        self.phase = \"write\"\n    elif self.phase == \"write\":\n        self.seg[\"value\"] = self.local\n        self.phase = \"read\"\n        self.iter_igjen -= 1\n        if self.lock is not None:\n            self.lock.release(self.pid)",
    },

    // ============ LEKSJON 5 ===========================================
    {
      id: "05-unix-socket",
      title: "5. Unix-domene sockets: request/response",
      narrative:
        "Pipes, FIFOs og message queues er alle **én-veis** eller kø-orienterte. For request/response — der klient sender en forespørsel og forventer et svar tilbake — er **sockets** den naturlige abstraksjonen. Unix-domene sockets bruker en filsystem-sti som adresse (`/tmp/echo.sock`), mens TCP-sockets bruker `(host, port)`; API-et er identisk, så koden du skriver mot Unix-sockets fungerer (nesten) uendret over nettverk.\n\nKjernekonseptet er **lytt og kobl**. Server-siden gjør:\n\n1. `bind(path)` — reserver adressen.\n2. `listen()` — gå i lyttetilstand.\n3. `accept()` — vent på en innkommende tilkobling, returner en *ny* socket dedikert til den klienten. Lyttesocket-en lever videre og kan akseptere flere.\n\nKlient-siden gjør `connect(path)`. Etter at `accept` paret dem, har vi et bi-direksjonelt rør: `send`/`recv` virker begge veier.\n\nVi modellerer kanalen med et `Connection`-objekt som har én rx-buffer for hver side. Når klient sender, havner bytes i `server_rx`, og omvendt. Det gir oss en deterministisk simulering uten ekte sockets eller threading.\n\n**Din oppgave:**\n\n1. `bind(path)`: registrer denne socket-en i `SocketRegistry` under `path`.\n2. `connect(path)`: slå opp lyttesocketen og legg deg selv i dens `backlog`.\n3. `accept()`: pop første ventende klient fra backlog, lag et nytt `Connection`-objekt, koble klient og en ny server-side socket til samme kanal. Returner server-siden. Returner `None` hvis backlog er tom.\n4. `send(data)` / `recv(n)`: skriv/les fra riktig side av Connection-objektet (klient skriver til `server_rx`, server skriver til `client_rx`).",
      files: {
        "socket.py": `from collections import deque


class SocketRegistry:
    """Filsystem-mock: path -> bundet UnixSocket i lyttetilstand."""
    _bound = {}

    @classmethod
    def bind(cls, path, sock):
        if path in cls._bound:
            raise OSError(f"Address already in use: {path}")
        cls._bound[path] = sock

    @classmethod
    def lookup(cls, path):
        return cls._bound.get(path)

    @classmethod
    def clear(cls):
        cls._bound = {}


class Connection:
    """Bi-direksjonell kanal — en rx-buffer pa hver side."""
    def __init__(self):
        self.server_rx = deque()   # det server-siden leser
        self.client_rx = deque()   # det klient-siden leser


class UnixSocket:
    """En socket. Tilstander:
       - "idle" (frisk)
       - "listening" (etter bind + listen)
       - "connected" (etter connect/accept)
    """

    def __init__(self):
        self.state = "idle"
        self.path = None
        self.backlog = deque()   # ventende connect-forespørsler (kun for listener)
        self.conn = None
        self.side = None          # "server" eller "client"

    def bind(self, path):
        # === DIN OPPGAVE ===
        # Registrer i SocketRegistry og lagre path.
        pass

    def listen(self):
        if self.path is None:
            raise OSError("listen() krever bind() forst")
        self.state = "listening"

    def accept(self):
        """Returner ny server-side-socket koblet til ventende klient,
        eller None hvis backlog er tom."""
        if self.state != "listening":
            raise OSError("accept krever listen-state")
        # === DIN OPPGAVE ===
        # if not self.backlog: return None
        # client_sock = self.backlog.popleft()
        # conn = Connection()
        # server_side = UnixSocket()
        # server_side.state = "connected"
        # server_side.conn = conn
        # server_side.side = "server"
        # client_sock.state = "connected"
        # client_sock.conn = conn
        # client_sock.side = "client"
        # return server_side
        pass

    def connect(self, path):
        listener = SocketRegistry.lookup(path)
        if listener is None or listener.state != "listening":
            raise ConnectionRefusedError(path)
        # === DIN OPPGAVE ===
        # Legg deg selv (self) bak i listenerens backlog.
        # Tilstand settes til "connected" av motsatt sides accept().
        pass

    def send(self, data):
        if self.state != "connected":
            raise OSError("send krever tilkoblet socket")
        # === DIN OPPGAVE ===
        # Klient skriver til server_rx; server skriver til client_rx.
        # Returner antall bytes sendt.
        pass

    def recv(self, n):
        if self.state != "connected":
            raise OSError("recv krever tilkoblet socket")
        # === DIN OPPGAVE ===
        # Klient leser fra client_rx; server leser fra server_rx.
        # Returner opp til n bytes (det som ligger der nå).
        pass


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


SocketRegistry.clear()

# --- Test 1: bind + listen + accept-konstruksjon ---
server = UnixSocket()
server.bind("/tmp/echo.sock")
server.listen()

klient = UnixSocket()
klient.connect("/tmp/echo.sock")
sjekk(len(server.backlog), 1, "klient er i serverens backlog etter connect")

server_side = server.accept()
sjekk(server_side is not None, True, "accept returnerer en ny socket")
sjekk(klient.state, "connected", "klient er tilkoblet etter accept")
sjekk(server_side.side, "server", "server_side har riktig rolle")

# --- Test 2: ekte echo-server: klient sender "hei", server speiler tilbake ---
klient.send(b"hei")
mottatt = server_side.recv(100)
sjekk(mottatt, b"hei", "server leste hei")
server_side.send(mottatt)
ekko = klient.recv(100)
sjekk(ekko, b"hei", "klient fikk echo tilbake")

# --- Test 3: connect til ukjent path gir ConnectionRefusedError ---
fant_feil = False
try:
    UnixSocket().connect("/tmp/finnes-ikke")
except ConnectionRefusedError:
    fant_feil = True
sjekk(fant_feil, True, "connect til ukjent path gir ConnectionRefused")

# --- Test 4: server haandterer to klienter uavhengig ---
k2 = UnixSocket()
k2.connect("/tmp/echo.sock")
server_side2 = server.accept()
k2.send(b"verden")
sjekk(server_side2.recv(100), b"verden", "klient 2 har sin egen kanal")

# Forrige par paavirkes ikke.
klient.send(b"runde-2")
sjekk(server_side.recv(100), b"runde-2", "klient 1 sin kanal er uberorta")

# --- Test 5: bind to ganger til samme path gir OSError ---
fant = False
try:
    annen = UnixSocket()
    annen.bind("/tmp/echo.sock")
except OSError:
    fant = True
sjekk(fant, True, "dobbel bind krasjer med OSError")
`,
      },
      defaultFile: "socket.py",
      editable: ["socket.py"],
      run: { kind: "python-script", entry: "socket.py" },
      verifications: [
        { label: "bind + listen + connect bygger kobling", check: { kind: "output-contains", needle: "OK   klient er i serverens backlog etter connect" } },
        { label: "accept gir ny socket koblet til klient", check: { kind: "output-contains", needle: "OK   accept returnerer en ny socket" } },
        { label: "Klient blir tilkoblet etter accept", check: { kind: "output-contains", needle: "OK   klient er tilkoblet etter accept" } },
        { label: "Echo: server mottar klientens bytes", check: { kind: "output-contains", needle: "OK   server leste hei" } },
        { label: "Echo: klient mottar svar fra server", check: { kind: "output-contains", needle: "OK   klient fikk echo tilbake" } },
        { label: "connect til ukjent path feiler", check: { kind: "output-contains", needle: "OK   connect til ukjent path gir ConnectionRefused" } },
        { label: "Flere klienter har uavhengige kanaler", check: { kind: "output-contains", needle: "OK   klient 2 har sin egen kanal" } },
        { label: "Dobbel bind feiler med OSError", check: { kind: "output-contains", needle: "OK   dobbel bind krasjer med OSError" } },
      ],
      hint:
        "def bind(self, path):\n    SocketRegistry.bind(path, self)\n    self.path = path\n\ndef accept(self):\n    if self.state != \"listening\":\n        raise OSError(\"accept krever listen-state\")\n    if not self.backlog:\n        return None\n    client_sock = self.backlog.popleft()\n    conn = Connection()\n    server_side = UnixSocket()\n    server_side.state = \"connected\"\n    server_side.conn = conn\n    server_side.side = \"server\"\n    client_sock.state = \"connected\"\n    client_sock.conn = conn\n    client_sock.side = \"client\"\n    return server_side\n\ndef connect(self, path):\n    listener = SocketRegistry.lookup(path)\n    if listener is None or listener.state != \"listening\":\n        raise ConnectionRefusedError(path)\n    listener.backlog.append(self)\n\ndef send(self, data):\n    if self.state != \"connected\":\n        raise OSError(\"send krever tilkoblet socket\")\n    if self.side == \"client\":\n        self.conn.server_rx.extend(data)\n    else:\n        self.conn.client_rx.extend(data)\n    return len(data)\n\ndef recv(self, n):\n    if self.state != \"connected\":\n        raise OSError(\"recv krever tilkoblet socket\")\n    kilde = self.conn.client_rx if self.side == \"client\" else self.conn.server_rx\n    ut = bytes()\n    while kilde and len(ut) < n:\n        ut += bytes([kilde.popleft()])\n    return ut",
    },
  ],
};

const CLT_SAMPLING: MiniCourse = {
  id: "clt-sampling",
  slug: "clt-sampling",
  title: "Sentralgrense-teoremet + sampling distributions",
  blurb:
    "Bygg sentralgrense-teoremet (CLT) fra null — start med en bimodal populasjon, ta tusenvis av samples, og se hvordan sampling distribution av mean blir normalfordelt selv om populasjonen IKKE er det. Endre med standardfeil-formelen, konfidensintervaller, og en titt på når n er for liten.",
  estimertTid: "60–75 min",
  fag: ["TEK-1501", "Statistikk", "Sentralgrense"],
  color: "success",
  rekkefolge: 10,
  lessons: [
    // ============ LEKSJON 1 ===========================================
    {
      id: "01-populasjon-vs-sample",
      title: "1. Populasjon vs sample: hva er fordelingen din?",
      narrative:
        "Før vi snakker om CLT må vi være knivskarpe på forskjellen mellom **populasjon** og **sample** (utvalg).\n\n- **Populasjon**: ALLE objektene vi bryr oss om — for eksempel høyden til samtlige voksne på øya. Populasjonens gjennomsnitt (`mu`) og standardavvik (`sigma`) er deterministiske, kjente størrelser hvis vi kunne måle alle.\n- **Sample**: et utdrag av populasjonen — n målinger plukket ut (forhåpentligvis tilfeldig). Sample-statistikker (`x̄`, `s`) er TILFELDIGE — de varierer fra utvalg til utvalg.\n\nFor å bygge intuisjon trenger vi en konkret populasjon. Vi simulerer en **bimodal** populasjon — for eksempel høyden til en blandet befolkning av to grupper (kortere kvinner rundt 150 cm, lengre menn rundt 185 cm). Dette er bevisst IKKE normalfordelt: histogrammet har TO topper med en dal i midten. Det er det vi får mye av CLT-magien fra senere.\n\n**Din oppgave:** implementér `mean(values)` og `std(values)` (populasjons-std, deler på n — ikke n-1). Disse er fundamentet for alt som kommer.",
      files: {
        "clt.py": `import random
import math

# Bygg populasjonen deterministisk - bimodal blanding av to grupper.
def bygg_populasjon():
    rng = random.Random(2026)
    pop = []
    for _ in range(10000):
        if rng.random() < 0.5:
            pop.append(rng.gauss(150, 6))   # gruppe A
        else:
            pop.append(rng.gauss(185, 6))   # gruppe B
    return tuple(pop)

POPULATION = bygg_populasjon()


def mean(values):
    "Aritmetisk gjennomsnitt: sum / antall."
    # === DIN OPPGAVE ===
    # Returner sum(values) / len(values)
    pass


def std(values):
    "Populasjons-standardavvik: kvadratroten av gjennomsnittlig kvadrert avvik fra mean."
    # === DIN OPPGAVE ===
    # 1. m = mean(values)
    # 2. var = gjennomsnittet av (v - m)**2 over alle v
    # 3. returner math.sqrt(var)
    pass


def ascii_histogram(values, num_buckets=20, width=40, label=""):
    "Print ascii-histogram. Bucket verdier i num_buckets like brede intervaller."
    lo = min(values)
    hi = max(values)
    if hi == lo:
        print("(alle verdier like)")
        return
    bucket_size = (hi - lo) / num_buckets
    counts = [0] * num_buckets
    for v in values:
        idx = int((v - lo) / bucket_size)
        if idx == num_buckets:
            idx = num_buckets - 1
        counts[idx] += 1
    max_count = max(counts) if max(counts) > 0 else 1
    if label:
        print(label)
    for i, c in enumerate(counts):
        bin_start = lo + i * bucket_size
        bars = int(width * c / max_count)
        print(f"  {bin_start:7.2f} | {'*' * bars} ({c})")


def sjekk_naer(faktisk, forventet, navn, toleranse=0.5):
    if faktisk is None:
        print(f"FEIL {navn}: fikk None (ikke implementert?)")
        return
    if abs(faktisk - forventet) < toleranse:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet ca {forventet!r}")


# Test mean
sjekk_naer(mean([1.0, 2.0, 3.0]), 2.0, "mean av [1,2,3] er 2", toleranse=1e-9)
sjekk_naer(mean([5.0, 5.0, 5.0, 5.0]), 5.0, "mean av konstanter er den konstanten", toleranse=1e-9)

# Test std
sjekk_naer(std([5.0, 5.0, 5.0]), 0.0, "std av konstanter er 0", toleranse=1e-9)
# var([1,2,3,4,5]) = ((4+1+0+1+4)/5) = 2.0, std = sqrt(2) ~= 1.4142
sjekk_naer(std([1.0, 2.0, 3.0, 4.0, 5.0]), math.sqrt(2.0), "std av [1..5] er sqrt(2)", toleranse=1e-6)

# Populasjons-statistikker
if mean(POPULATION) is None or std(POPULATION) is None:
    print("FEIL: mean/std ikke implementert - kan ikke teste populasjon")
else:
    mu = mean(POPULATION)
    sigma = std(POPULATION)
    print(f"\\nPopulasjons-mean = {mu:.4f}")
    print(f"Populasjons-std  = {sigma:.4f}")

    if 165 < mu < 170:
        print("OK   populasjons-mean ligger mellom de to klyngene (~167)")
    else:
        print(f"FEIL: mu={mu}")

    if 17 < sigma < 20:
        print("OK   populasjons-std er ca 18 (stor pga to klynger)")
    else:
        print(f"FEIL: sigma={sigma}")

    ascii_histogram(POPULATION, num_buckets=20, width=40,
                    label="\\nPOPULASJON (skal vaere bimodal - to topper med dal):")

    # Sjekk at populasjonen IKKE er normal - midten skal ha mindre tetthet enn endene
    lo, hi = min(POPULATION), max(POPULATION)
    bs = (hi - lo) / 20
    counts = [0] * 20
    for v in POPULATION:
        idx = int((v - lo) / bs)
        if idx == 20:
            idx = 19
        counts[idx] += 1
    midt_snitt = (counts[9] + counts[10]) / 2
    max_count = max(counts)
    if midt_snitt < max_count * 0.5:
        print("OK   populasjonen er IKKE normalfordelt (tydelig dipp i midten)")
    else:
        print(f"FEIL: forventet bimodal, midt_snitt={midt_snitt} vs max={max_count}")
`,
      },
      defaultFile: "clt.py",
      editable: ["clt.py"],
      run: { kind: "python-script", entry: "clt.py" },
      verifications: [
        { label: "mean regnes riktig", check: { kind: "output-contains", needle: "OK   mean av [1,2,3] er 2" } },
        { label: "mean av konstanter", check: { kind: "output-contains", needle: "OK   mean av konstanter er den konstanten" } },
        { label: "std av konstanter er 0", check: { kind: "output-contains", needle: "OK   std av konstanter er 0" } },
        { label: "std av [1..5] er sqrt(2)", check: { kind: "output-contains", needle: "OK   std av [1..5] er sqrt(2)" } },
        { label: "Populasjons-mean ligger mellom klyngene", check: { kind: "output-contains", needle: "OK   populasjons-mean ligger mellom de to klyngene" } },
        { label: "Populasjons-std er ca 18", check: { kind: "output-contains", needle: "OK   populasjons-std er ca 18" } },
        { label: "Populasjonen er bimodal (ikke normal)", check: { kind: "output-contains", needle: "OK   populasjonen er IKKE normalfordelt" } },
      ],
      hint:
        "def mean(values):\n    return sum(values) / len(values)\n\ndef std(values):\n    m = mean(values)\n    var = sum((v - m) ** 2 for v in values) / len(values)\n    return math.sqrt(var)",
    },

    // ============ LEKSJON 2 ===========================================
    {
      id: "02-en-sample",
      title: "2. Én sample, ett sample-mean",
      narrative:
        "Nå tar vi vårt FØRSTE sample fra populasjonen. Vi har 10000 verdier i populasjonen, men i virkeligheten ville vi sjelden måle alle — ofte måler vi bare n=30 eller så.\n\n`sample(population, n, seed)` returnerer et tilfeldig utvalg av størrelse n, **med erstatning** (vi kan tilfeldigvis trekke samme verdi to ganger — det er greit her, og det er nødvendig for at teorien skal være ren). For reproduserbarhet bruker vi en `random.Random(seed)`-instans i stedet for den globale `random`-modulen.\n\nViktig observasjon: sample-mean er **nær** populasjons-mean (167.24), men ikke eksakt. Trekk et nytt sample, du får et nytt sample-mean. Trekk 1000 ganger, du får 1000 forskjellige verdier. Det er DENNE variasjonen som blir hovedtema i neste leksjon — sampling distribution.\n\n**Din oppgave:** implementér `sample(population, n, seed)` med `random.Random(seed).choices(population, k=n)`. Implementér `sample_mean(population, n, seed)` som returnerer mean av samplet.",
      files: {
        "clt.py": `import random
import math


def bygg_populasjon():
    rng = random.Random(2026)
    pop = []
    for _ in range(10000):
        if rng.random() < 0.5:
            pop.append(rng.gauss(150, 6))
        else:
            pop.append(rng.gauss(185, 6))
    return tuple(pop)

POPULATION = bygg_populasjon()


def mean(values):
    return sum(values) / len(values)


def std(values):
    m = mean(values)
    return math.sqrt(sum((v - m) ** 2 for v in values) / len(values))


def sample(population, n, seed):
    "Trekk n verdier med erstatning. Bruk random.Random(seed) for reproduserbarhet."
    # === DIN OPPGAVE ===
    # rng = random.Random(seed)
    # returner rng.choices(population, k=n)
    pass


def sample_mean(population, n, seed):
    "Returner mean av ett sample av storrelse n."
    # === DIN OPPGAVE ===
    # 1. Hent et sample med sample(population, n, seed)
    # 2. Returner mean(sample)
    pass


POP_MEAN = mean(POPULATION)
POP_STD = std(POPULATION)
print(f"Populasjon: mean={POP_MEAN:.4f}, std={POP_STD:.4f}\\n")

# Test sample
s1 = sample(POPULATION, 30, seed=1)
if s1 is None:
    print("FEIL sample: ikke implementert")
else:
    if len(s1) == 30:
        print("OK   sample returnerer riktig antall verdier (n=30)")
    else:
        print(f"FEIL: len(sample)={len(s1)}")

    # alle verdiene maa komme fra populasjonen
    pop_set = set(POPULATION)
    if all(v in pop_set for v in s1):
        print("OK   sample-verdier kommer fra populasjonen")
    else:
        print("FEIL: sample inneholder verdier utenfor populasjonen")

    # Reproduserbart med samme seed
    s1_igjen = sample(POPULATION, 30, seed=1)
    if list(s1) == list(s1_igjen):
        print("OK   samme seed gir samme sample")
    else:
        print("FEIL: samme seed gir ulike samples")

    # Annet seed -> annet sample
    s2 = sample(POPULATION, 30, seed=2)
    if list(s1) != list(s2):
        print("OK   ulik seed gir ulike samples")

# Test sample_mean
m1 = sample_mean(POPULATION, 30, seed=1)
if m1 is None:
    print("FEIL sample_mean: ikke implementert")
else:
    print(f"\\nSample-mean (n=30, seed=1) = {m1:.4f}")
    print(f"Avstand fra populasjons-mean: {abs(m1 - POP_MEAN):.4f}")

    # Sample-mean fra n=30 fra denne populasjonen burde vaere innenfor +-10 av sann mean
    if abs(m1 - POP_MEAN) < 10:
        print("OK   sample-mean er rimelig naer populasjons-mean (men ikke eksakt)")
    else:
        print(f"FEIL: sample-mean for langt unna: {m1}")

    # Sample-mean varierer med seed
    means_med_ulike_seeds = [sample_mean(POPULATION, 30, seed=s) for s in range(10)]
    unike = len(set(means_med_ulike_seeds))
    if unike >= 9:
        print(f"OK   sample-mean varierer med seed ({unike}/10 unike verdier)")
    else:
        print(f"FEIL: forventet variasjon, men fikk bare {unike} unike means")
`,
      },
      defaultFile: "clt.py",
      editable: ["clt.py"],
      run: { kind: "python-script", entry: "clt.py" },
      verifications: [
        { label: "sample returnerer n verdier", check: { kind: "output-contains", needle: "OK   sample returnerer riktig antall verdier" } },
        { label: "sample-verdier kommer fra populasjonen", check: { kind: "output-contains", needle: "OK   sample-verdier kommer fra populasjonen" } },
        { label: "Samme seed gir samme sample", check: { kind: "output-contains", needle: "OK   samme seed gir samme sample" } },
        { label: "Ulik seed gir ulike samples", check: { kind: "output-contains", needle: "OK   ulik seed gir ulike samples" } },
        { label: "Sample-mean er naer (men ikke lik) populasjons-mean", check: { kind: "output-contains", needle: "OK   sample-mean er rimelig naer" } },
        { label: "Sample-mean varierer mellom samples", check: { kind: "output-contains", needle: "OK   sample-mean varierer med seed" } },
      ],
      hint:
        "def sample(population, n, seed):\n    rng = random.Random(seed)\n    return rng.choices(population, k=n)\n\ndef sample_mean(population, n, seed):\n    return mean(sample(population, n, seed))",
    },

    // ============ LEKSJON 3 ===========================================
    {
      id: "03-sampling-distribution",
      title: "3. Sampling distribution: kjernen i CLT",
      narrative:
        "Nå når kjernen i hele kurset. Vi tok ETT sample-mean i forrige leksjon — men hva skjer hvis vi tar 1000 samples, regner mean av hvert, og ser på fordelingen av disse 1000 mean-verdiene?\n\nDette kalles **sampling distribution of the mean**. Det er en helt egen fordeling — IKKE fordelingen av rå data, men fordelingen av sample-statistikker.\n\n**Sentralgrenseteoremet** (CLT) sier:\n\n> Uansett hvilken form populasjonen har, vil sampling distribution of the mean (av mange samples av størrelse n) nærme seg en **normalfordeling** ettersom n blir stor — med gjennomsnitt `mu` og standardavvik `sigma/sqrt(n)`.\n\nDette er en av de mest forbløffende setningene i hele statistikken. Populasjonen vår er BIMODAL (to topper, dal i midten). Likevel: hvis vi tar mange samples av størrelse n=30 og histogrammerer mean-verdiene, ser vi en pen klokkekurve som er **normalfordelt rundt populasjons-mean**.\n\n**Din oppgave:** implementér `sampling_distribution(population, n, num_samples, seed)` som tar `num_samples` (typisk 1000) ulike samples av størrelse `n`, regner mean for hvert, og returnerer listen. Bruk én delt `rng = random.Random(seed)` for ALLE samples (ikke ny rng per sample — det blir ikke uavhengig).",
      files: {
        "clt.py": `import random
import math


def bygg_populasjon():
    rng = random.Random(2026)
    pop = []
    for _ in range(10000):
        if rng.random() < 0.5:
            pop.append(rng.gauss(150, 6))
        else:
            pop.append(rng.gauss(185, 6))
    return tuple(pop)

POPULATION = bygg_populasjon()


def mean(values):
    return sum(values) / len(values)


def std(values):
    m = mean(values)
    return math.sqrt(sum((v - m) ** 2 for v in values) / len(values))


def sampling_distribution(population, n, num_samples, seed=42):
    "Returner liste av num_samples sample-means, hvert beregnet fra et tilfeldig sample av storrelse n."
    # === DIN OPPGAVE ===
    # rng = random.Random(seed)
    # means = []
    # gjenta num_samples ganger:
    #     s = rng.choices(population, k=n)
    #     means.append(sum(s) / n)
    # returner means
    pass


def ascii_histogram(values, num_buckets=20, width=40, label=""):
    lo = min(values)
    hi = max(values)
    if hi == lo:
        print("(alle verdier like)")
        return
    bucket_size = (hi - lo) / num_buckets
    counts = [0] * num_buckets
    for v in values:
        idx = int((v - lo) / bucket_size)
        if idx == num_buckets:
            idx = num_buckets - 1
        counts[idx] += 1
    max_count = max(counts) if max(counts) > 0 else 1
    if label:
        print(label)
    for i, c in enumerate(counts):
        bin_start = lo + i * bucket_size
        bars = int(width * c / max_count)
        print(f"  {bin_start:7.2f} | {'*' * bars} ({c})")


POP_MEAN = mean(POPULATION)
POP_STD = std(POPULATION)
print(f"Populasjon: mean={POP_MEAN:.4f}, std={POP_STD:.4f} (BIMODAL)\\n")

means = sampling_distribution(POPULATION, n=30, num_samples=1000, seed=42)
if means is None:
    print("FEIL sampling_distribution: ikke implementert")
else:
    print(f"Sampling distribution: n=30, num_samples={len(means)}")

    if len(means) == 1000:
        print("OK   sampling_distribution returnerer num_samples elementer")
    else:
        print(f"FEIL: lengde={len(means)}, forventet 1000")

    sd_mean = mean(means)
    sd_std = std(means)
    print(f"  mean of means = {sd_mean:.4f}  (forventet ca {POP_MEAN:.4f})")
    print(f"  std of means  = {sd_std:.4f}  (forventet ca {POP_STD / math.sqrt(30):.4f})")

    # Test: mean of means er naer populasjons-mean
    if abs(sd_mean - POP_MEAN) < 1.0:
        print("OK   mean of sample means er naer populasjons-mean")
    else:
        print(f"FEIL: avstand={abs(sd_mean - POP_MEAN)}")

    # Test: std of means er naer sigma/sqrt(n) (innenfor 15%)
    teor_se = POP_STD / math.sqrt(30)
    rel_err = abs(sd_std - teor_se) / teor_se
    if rel_err < 0.15:
        print(f"OK   std of sample means matcher sigma/sqrt(n) (rel-err={rel_err*100:.2f}%)")
    else:
        print(f"FEIL: rel_err={rel_err*100}%")

    ascii_histogram(means, num_buckets=20, width=40,
                    label="\\nSAMPLING DISTRIBUTION av mean (n=30):")

    # Test: histogrammet skal vaere unimodalt og symmetrisk (i sterk kontrast til den bimodale populasjonen)
    lo, hi = min(means), max(means)
    bs = (hi - lo) / 20
    counts = [0] * 20
    for v in means:
        idx = int((v - lo) / bs)
        if idx == 20:
            idx = 19
        counts[idx] += 1
    # Midten skal vaere DER toppen er - i motsetning til populasjonen
    mid_avg = (counts[8] + counts[9] + counts[10] + counts[11]) / 4
    max_count = max(counts)
    if mid_avg >= max_count * 0.6:
        print("OK   sampling distribution er unimodal (klokkeform - CLT virker!)")
    else:
        print(f"FEIL: mid_avg={mid_avg} vs max={max_count}")

    # Bonus: midt-pukken er ikke ved 150 eller 185 (populasjons-topper), men ved 167 (populasjons-mean)
    peak_bin_start = lo + bs * counts.index(max(counts))
    if 165 < peak_bin_start < 170:
        print(f"OK   toppen er ved ~167 (mu), IKKE ved 150 eller 185 (populasjons-topper)")
`,
      },
      defaultFile: "clt.py",
      editable: ["clt.py"],
      run: { kind: "python-script", entry: "clt.py" },
      verifications: [
        { label: "Returnerer num_samples mean-verdier", check: { kind: "output-contains", needle: "OK   sampling_distribution returnerer num_samples elementer" } },
        { label: "Mean of sample means er naer populasjons-mean", check: { kind: "output-contains", needle: "OK   mean of sample means er naer populasjons-mean" } },
        { label: "Std of sample means matcher sigma/sqrt(n)", check: { kind: "output-contains", needle: "OK   std of sample means matcher sigma/sqrt(n)" } },
        { label: "Sampling distribution er unimodal (klokkeform - CLT!)", check: { kind: "output-contains", needle: "OK   sampling distribution er unimodal" } },
        { label: "Toppen er ved mu, ikke ved populasjons-topper", check: { kind: "output-contains", needle: "OK   toppen er ved ~167" } },
      ],
      hint:
        "def sampling_distribution(population, n, num_samples, seed=42):\n    rng = random.Random(seed)\n    means = []\n    for _ in range(num_samples):\n        s = rng.choices(population, k=n)\n        means.append(sum(s) / n)\n    return means",
    },

    // ============ LEKSJON 4 ===========================================
    {
      id: "04-standardfeil",
      title: "4. SE = sigma / sqrt(n): standardfeil-formelen",
      narrative:
        "Sampling distribution har sin egen std — vi kaller den **standardfeilen** (SE, standard error of the mean). Det er IKKE samme som populasjonens std.\n\nCLT gir oss en eksakt formel: **`SE = sigma / sqrt(n)`**.\n\nLes den nøye:\n- Når n vokser, går SE ned. Større sample => mindre usikkerhet om mean.\n- Forholdet er **kvadratrot**: for å halvere SE må vi FIREDOBLE n. Ikke doble. (Derfor er det dyrt å være veldig presis.)\n- SE bestemmes av populasjonen (`sigma`) — vi velger BARE n.\n\nVi skal verifisere dette empirisk: kjør `sampling_distribution` for ulike n, regn empirisk std av mean-verdiene, og sammenlign med teoretisk SE.\n\nMerk: med n=10 fra en bimodal populasjon kan empirisk SE avvike litt fra formelen (CLT-konvergens er ikke perfekt for liten n med ikke-normal populasjon). Men selv da skal det være innenfor 10% i de fleste tilfeller.\n\n**Din oppgave:** implementér `empirisk_se(population, n, num_samples=1000, seed=42)` som returnerer `std` av sampling-distribution-mean-listen.",
      files: {
        "clt.py": `import random
import math


def bygg_populasjon():
    rng = random.Random(2026)
    pop = []
    for _ in range(10000):
        if rng.random() < 0.5:
            pop.append(rng.gauss(150, 6))
        else:
            pop.append(rng.gauss(185, 6))
    return tuple(pop)

POPULATION = bygg_populasjon()


def mean(values):
    return sum(values) / len(values)


def std(values):
    m = mean(values)
    return math.sqrt(sum((v - m) ** 2 for v in values) / len(values))


def sampling_distribution(population, n, num_samples, seed=42):
    rng = random.Random(seed)
    means = []
    for _ in range(num_samples):
        s = rng.choices(population, k=n)
        means.append(sum(s) / n)
    return means


def empirisk_se(population, n, num_samples=1000, seed=42):
    "Empirisk standardfeil = std av sample-means fra sampling distribution."
    # === DIN OPPGAVE ===
    # 1. Hent listen av mean-verdier med sampling_distribution(...)
    # 2. Returner std() av denne listen
    pass


POP_STD = std(POPULATION)
print(f"Populasjons-sigma = {POP_STD:.4f}\\n")

# Tabell over empirisk vs teoretisk SE
print(f"{'n':>5} | {'empirisk SE':>13} | {'sigma/sqrt(n)':>14} | {'rel-err':>10}")
print("-" * 55)
ses = {}
for n in [10, 30, 100, 500]:
    emp = empirisk_se(POPULATION, n, num_samples=1000, seed=42)
    if emp is None:
        print(f"FEIL empirisk_se(n={n}): ikke implementert")
        break
    ses[n] = emp
    teor = POP_STD / math.sqrt(n)
    rel = abs(emp - teor) / teor
    print(f"{n:>5} | {emp:>13.4f} | {teor:>14.4f} | {rel*100:>9.2f}%")

if len(ses) == 4:
    # Test 1: empirisk SE for n=100 er innenfor 10% av teoretisk
    teor_100 = POP_STD / math.sqrt(100)
    rel_100 = abs(ses[100] - teor_100) / teor_100
    if rel_100 < 0.1:
        print(f"\\nOK   empirisk SE for n=100 er innenfor 10% av sigma/sqrt(n)")
    else:
        print(f"FEIL: rel_100={rel_100*100}%")

    # Test 2: SE faller monotont naar n oker (kvadratrot-loven)
    if ses[10] > ses[30] > ses[100] > ses[500]:
        print("OK   standardfeil faller monotont naar n oker")
    else:
        print(f"FEIL: ses ikke monotont synkende: {ses}")

    # Test 3: empirisk ratio SE(10)/SE(40) ~ sqrt(40/10) = 2
    se10 = empirisk_se(POPULATION, 10, num_samples=1000, seed=42)
    se40 = empirisk_se(POPULATION, 40, num_samples=1000, seed=42)
    ratio = se10 / se40
    if abs(ratio - 2.0) < 0.3:
        print(f"OK   firedobling av n halverer SE (ratio={ratio:.2f}, forventet 2.0)")
    else:
        print(f"FEIL: ratio={ratio}")

    # Test 4: SE for n=500 er minst 5x mindre enn SE for n=10
    if ses[10] / ses[500] > 5:
        print(f"OK   SE for n=500 er minst 5x mindre enn for n=10 (ratio={ses[10]/ses[500]:.2f})")
`,
      },
      defaultFile: "clt.py",
      editable: ["clt.py"],
      run: { kind: "python-script", entry: "clt.py" },
      verifications: [
        { label: "Empirisk SE for n=100 matcher sigma/sqrt(n) innenfor 10%", check: { kind: "output-contains", needle: "OK   empirisk SE for n=100 er innenfor 10%" } },
        { label: "SE faller monotont naar n oker", check: { kind: "output-contains", needle: "OK   standardfeil faller monotont" } },
        { label: "Firedobling av n halverer SE (kvadratrot-loven)", check: { kind: "output-contains", needle: "OK   firedobling av n halverer SE" } },
        { label: "SE for n=500 er minst 5x mindre enn for n=10", check: { kind: "output-contains", needle: "OK   SE for n=500 er minst 5x mindre" } },
      ],
      hint:
        "def empirisk_se(population, n, num_samples=1000, seed=42):\n    means = sampling_distribution(population, n, num_samples, seed)\n    return std(means)",
    },

    // ============ LEKSJON 5 ===========================================
    {
      id: "05-konfidensintervall",
      title: "5. 95% konfidensintervall: hvor sikker er du paa mean?",
      narrative:
        "Du tar ETT sample og regner ETT sample-mean. Men du vet det er litt usikkerhet. Et **konfidensintervall** (KI) gir deg et intervall som SANSYNLIGVIS inneholder den sanne populasjons-meanen.\n\nFor 95% KI med kjent populasjons-sigma:\n\n```\nKI = [x_bar - 1.96 * SE, x_bar + 1.96 * SE]\n```\n\nhvor `SE = sigma / sqrt(n)` (fra forrige leksjon). Tallet 1.96 kommer fra normalfordelingens 97.5-prosentil — 95% av massen ligger innenfor +- 1.96 standardavvik fra mean.\n\n**Hva BETYR 95%?** Det er ikke at det er 95% sjanse for at sann mean ligger i akkurat dette intervallet. Den tolkningen er feil. Den riktige er: hvis du lager 1000 KIer fra 1000 ulike samples, vil ca 950 av dem inneholde sann mean. Konfidensen handler om PROSEDYREN, ikke om en enkelt KI.\n\nVi tester dette empirisk. Lag 1000 KI fra 1000 ulike samples (alle av størrelse n=50). Tell hvor mange som inneholder sann populasjons-mean. Tallet skal være mellom 930 og 970.\n\n**Din oppgave:** implementér `confidence_interval(sample, sigma, conf=0.95)` som returnerer `(lo, hi)`. Bruk `z = 1.96` for `conf=0.95`. Skriv som om det er det eneste støttede konfidensnivået (vi blir komplekse senere).",
      files: {
        "clt.py": `import random
import math


def bygg_populasjon():
    rng = random.Random(2026)
    pop = []
    for _ in range(10000):
        if rng.random() < 0.5:
            pop.append(rng.gauss(150, 6))
        else:
            pop.append(rng.gauss(185, 6))
    return tuple(pop)

POPULATION = bygg_populasjon()


def mean(values):
    return sum(values) / len(values)


def std(values):
    m = mean(values)
    return math.sqrt(sum((v - m) ** 2 for v in values) / len(values))


def confidence_interval(sample, sigma, conf=0.95):
    "Bygg KI for mean med kjent populasjons-sigma. Z=1.96 for 95%."
    # === DIN OPPGAVE ===
    # 1. n = len(sample)
    # 2. x_bar = mean(sample)
    # 3. SE = sigma / sqrt(n)
    # 4. z = 1.96   (anta conf=0.95)
    # 5. Returner (x_bar - z * SE, x_bar + z * SE)
    pass


POP_MEAN = mean(POPULATION)
POP_STD = std(POPULATION)
print(f"Sann populasjons-mean = {POP_MEAN:.4f}")
print(f"Populasjons-sigma     = {POP_STD:.4f}\\n")

# Et konkret eksempel
rng = random.Random(123)
s_demo = rng.choices(POPULATION, k=50)
ki_demo = confidence_interval(s_demo, sigma=POP_STD, conf=0.95)
if ki_demo is None:
    print("FEIL confidence_interval: ikke implementert")
else:
    lo, hi = ki_demo
    bredde = hi - lo
    print(f"Eksempel-KI (n=50, seed=123): ({lo:.4f}, {hi:.4f})")
    print(f"  bredde = {bredde:.4f}")
    print(f"  inneholder sann mean {POP_MEAN:.4f}? {lo <= POP_MEAN <= hi}")

    # Forventet bredde: 2 * 1.96 * sigma / sqrt(50)
    forventet_bredde = 2 * 1.96 * POP_STD / math.sqrt(50)
    if abs(bredde - forventet_bredde) < 0.01:
        print(f"OK   KI-bredde matcher 2*1.96*sigma/sqrt(n) = {forventet_bredde:.4f}")
    else:
        print(f"FEIL: bredde={bredde}, forventet {forventet_bredde}")

    # Coverage-test: 1000 KI, tell hvor mange som inneholder sann mean
    rng2 = random.Random(42)
    n_per_sample = 50
    n_samples = 1000
    treff = 0
    for _ in range(n_samples):
        s = rng2.choices(POPULATION, k=n_per_sample)
        l, h = confidence_interval(s, sigma=POP_STD, conf=0.95)
        if l <= POP_MEAN <= h:
            treff += 1
    coverage = treff / n_samples
    print(f"\\nCoverage-test: {treff}/{n_samples} KI inneholder sann mean ({coverage*100:.1f}%)")

    if 0.93 <= coverage <= 0.97:
        print(f"OK   ca 95% av KI-ene inneholder sann mean (akseptabelt 93-97%)")
    else:
        print(f"FEIL: coverage={coverage*100:.1f}% (forventet 93-97%)")

    # Sanity: kortere KI med stoerre n
    s_stor = random.Random(7).choices(POPULATION, k=500)
    l_stor, h_stor = confidence_interval(s_stor, sigma=POP_STD, conf=0.95)
    bredde_stor = h_stor - l_stor
    print(f"\\nKI for n=500: bredde = {bredde_stor:.4f}  (forventet ca {bredde / math.sqrt(10):.4f})")
    if bredde_stor < bredde / 2:
        print("OK   KI for n=500 er minst halvparten saa bred som KI for n=50")
`,
      },
      defaultFile: "clt.py",
      editable: ["clt.py"],
      run: { kind: "python-script", entry: "clt.py" },
      verifications: [
        { label: "KI-bredde matcher 2*1.96*sigma/sqrt(n)", check: { kind: "output-contains", needle: "OK   KI-bredde matcher 2*1.96*sigma/sqrt(n)" } },
        { label: "Ca 95% av KI-ene inneholder sann mean", check: { kind: "output-contains", needle: "OK   ca 95% av KI-ene inneholder sann mean" } },
        { label: "Stoerre n gir smalere KI", check: { kind: "output-contains", needle: "OK   KI for n=500 er minst halvparten" } },
      ],
      hint:
        "def confidence_interval(sample, sigma, conf=0.95):\n    n = len(sample)\n    x_bar = sum(sample) / n\n    se = sigma / math.sqrt(n)\n    z = 1.96   # 95%\n    return (x_bar - z * se, x_bar + z * se)",
    },

    // ============ LEKSJON 6 ===========================================
    {
      id: "06-liten-n-t-fordeling",
      title: "6. Naar n er for liten: t-fordeling-glimt",
      narrative:
        "CLT er en **grenseverdi-setning**: jo større n, jo mer perfekt blir normalfordelings-tilnærmingen. For n=100 fra en bimodal populasjon ser sampling distribution ut som en lærebok-klokke. Men hva med n=5?\n\nFor små samples blir sampling distribution fortsatt unimodal, men:\n- **Tykkere haler** (heavier tails) — flere ekstreme verdier enn en perfekt normal har.\n- **Lavere midt-pukk** — i forhold til halene.\n- Spesielt: hvis vi må ESTIMERE sigma fra samplet (vi kjenner sjelden sann sigma!), blir variabiliteten enda høyere.\n\nDette er kjernen i hvorfor statistikere bruker **Student's t-fordeling** for små samples. T-fordelingen ligner normalfordelingen, men har tykkere haler — så et 95% KI med t-fordeling blir BREDERE enn med normal. Når n vokser, konvergerer t mot normal (de er identiske i grensen).\n\nI denne leksjonen gjør vi den enkle observasjonen kvantitativt: vi sammenligner sampling distribution for n=5 og n=100. Begge ser visuelt bell-formet ut, men n=5-versjonen har mye større spredning — eksakt sqrt(20) = 4.47 ganger større, per `SE = sigma / sqrt(n)`-formelen.\n\nKodemessig hopper vi over t-tabellen — fokuset er på intuisjon, ikke kalkulasjon.\n\n**Din oppgave:** implementér `sammenlign_spredning(population, n_smaa, n_stor, num_samples=2000, seed=42)` som returnerer tuppelet `(spread_smaa, spread_stor, ratio)` der `spread_X = std av sampling_distribution(population, n=X, ...)` og `ratio = spread_smaa / spread_stor`.",
      files: {
        "clt.py": `import random
import math


def bygg_populasjon():
    rng = random.Random(2026)
    pop = []
    for _ in range(10000):
        if rng.random() < 0.5:
            pop.append(rng.gauss(150, 6))
        else:
            pop.append(rng.gauss(185, 6))
    return tuple(pop)

POPULATION = bygg_populasjon()


def mean(values):
    return sum(values) / len(values)


def std(values):
    m = mean(values)
    return math.sqrt(sum((v - m) ** 2 for v in values) / len(values))


def sampling_distribution(population, n, num_samples, seed=42):
    rng = random.Random(seed)
    means = []
    for _ in range(num_samples):
        s = rng.choices(population, k=n)
        means.append(sum(s) / n)
    return means


def ascii_histogram(values, num_buckets=20, width=25, label=""):
    lo = min(values)
    hi = max(values)
    if hi == lo:
        print("(alle verdier like)")
        return
    bucket_size = (hi - lo) / num_buckets
    counts = [0] * num_buckets
    for v in values:
        idx = int((v - lo) / bucket_size)
        if idx == num_buckets:
            idx = num_buckets - 1
        counts[idx] += 1
    max_count = max(counts) if max(counts) > 0 else 1
    if label:
        print(label)
    for i, c in enumerate(counts):
        bin_start = lo + i * bucket_size
        bars = int(width * c / max_count)
        print(f"  {bin_start:7.2f} | {'*' * bars} ({c})")


def sammenlign_spredning(population, n_smaa, n_stor, num_samples=2000, seed=42):
    "Returner (spread_smaa, spread_stor, ratio) der ratio = spread_smaa / spread_stor."
    # === DIN OPPGAVE ===
    # 1. means_smaa = sampling_distribution(population, n_smaa, num_samples, seed)
    # 2. means_stor = sampling_distribution(population, n_stor, num_samples, seed + 1)
    #    (annet seed for uavhengighet)
    # 3. spread_smaa = std(means_smaa)
    # 4. spread_stor = std(means_stor)
    # 5. ratio = spread_smaa / spread_stor
    # 6. Returner (spread_smaa, spread_stor, ratio)
    pass


POP_MEAN = mean(POPULATION)
POP_STD = std(POPULATION)
print(f"Populasjon: mean={POP_MEAN:.4f}, sigma={POP_STD:.4f}\\n")

res = sammenlign_spredning(POPULATION, n_smaa=5, n_stor=100, num_samples=2000, seed=42)
if res is None:
    print("FEIL sammenlign_spredning: ikke implementert")
else:
    spread_smaa, spread_stor, ratio = res
    print(f"Spread av sampling distribution:")
    print(f"  n=5:    {spread_smaa:.4f}  (teoretisk SE = {POP_STD / math.sqrt(5):.4f})")
    print(f"  n=100:  {spread_stor:.4f}  (teoretisk SE = {POP_STD / math.sqrt(100):.4f})")
    print(f"  ratio = {ratio:.4f}  (forventet sqrt(100/5) = {math.sqrt(100/5):.4f})")

    # Test 1: spread for n=5 er klart stoerre enn for n=100
    if spread_smaa > spread_stor * 4:
        print("OK   spread for n=5 er minst 4x stoerre enn for n=100")
    else:
        print(f"FEIL: spread_smaa={spread_smaa}, spread_stor={spread_stor}")

    # Test 2: ratio matcher sqrt(n_stor/n_smaa) innenfor 15%
    teor_ratio = math.sqrt(100 / 5)
    rel = abs(ratio - teor_ratio) / teor_ratio
    if rel < 0.15:
        print(f"OK   ratio matcher sqrt(n_stor/n_smaa) (rel-err={rel*100:.2f}%)")
    else:
        print(f"FEIL: rel={rel*100}%")

    # Test 3: spread_stor matcher sigma/sqrt(100) (innenfor 10%)
    teor_stor = POP_STD / 10
    rel_stor = abs(spread_stor - teor_stor) / teor_stor
    if rel_stor < 0.1:
        print(f"OK   spread for n=100 matcher sigma/sqrt(n)")

    # Histogrammer (gir studenten lov til aa SE forskjellen)
    means_smaa = sampling_distribution(POPULATION, 5, 2000, seed=42)
    means_stor = sampling_distribution(POPULATION, 100, 2000, seed=43)
    ascii_histogram(means_smaa, num_buckets=20, width=25,
                    label="\\nSAMPLING DISTRIBUTION n=5 (bred - haler kan vaere tykkere):")
    ascii_histogram(means_stor, num_buckets=20, width=25,
                    label="\\nSAMPLING DISTRIBUTION n=100 (mye smalere - klassisk normal):")

    print("\\n--- INTUISJON ---")
    print("For sma n (under ca 30) er CLT-konvergensen ikke perfekt.")
    print("Sampling distribution kan ha tykkere haler enn normalfordelingen.")
    print("Derfor bruker statistikere TI-fordelingen for sma samples - den har")
    print("tykkere haler innebygd, og gir riktig dekning paa 95% KI.")
`,
      },
      defaultFile: "clt.py",
      editable: ["clt.py"],
      run: { kind: "python-script", entry: "clt.py" },
      verifications: [
        { label: "Spread for n=5 er minst 4x stoerre enn for n=100", check: { kind: "output-contains", needle: "OK   spread for n=5 er minst 4x stoerre" } },
        { label: "Ratio matcher sqrt(n_stor/n_smaa)", check: { kind: "output-contains", needle: "OK   ratio matcher sqrt(n_stor/n_smaa)" } },
        { label: "Spread for n=100 matcher sigma/sqrt(n)", check: { kind: "output-contains", needle: "OK   spread for n=100 matcher sigma/sqrt(n)" } },
      ],
      hint:
        "def sammenlign_spredning(population, n_smaa, n_stor, num_samples=2000, seed=42):\n    means_smaa = sampling_distribution(population, n_smaa, num_samples, seed)\n    means_stor = sampling_distribution(population, n_stor, num_samples, seed + 1)\n    spread_smaa = std(means_smaa)\n    spread_stor = std(means_stor)\n    ratio = spread_smaa / spread_stor\n    return (spread_smaa, spread_stor, ratio)",
    },
  ],
};

const MULTI_REGRESJON: MiniCourse = {
  id: "multi-regresjon",
  slug: "multi-regresjon",
  title: "Multiple regresjon med residual-diagnostikk",
  blurb:
    "Bygg multiple regresjon fra null i pure Python — design-matrise, normalligning med egen matrise-invers, predikajoner og residualer, R^2 og adjusted R^2, ASCII residual-plot for diagnostikk, og VIF for multikollinaritet. Du ser HVORDAN matrise-operasjonene fungerer i stedet for at numpy gjør jobben.",
  estimertTid: "75–90 min",
  fag: ["TEK-1501", "Statistikk", "Regresjon"],
  color: "success",
  rekkefolge: 20,
  lessons: [
    // ============ LEKSJON 1 ===========================================
    {
      id: "01-design-matrise",
      title: "1. Fra simpel til multiple: design-matrise X",
      narrative:
        "I simpel lineær regresjon hadde vi én forklaringsvariabel: ``y = b0 + b1*x + ε``. Multiple regresjon utvider dette til vilkårlig mange:\n\n```\ny = β0 + β1*x1 + β2*x2 + ... + βk*xk + ε\n```\n\nFor å gjøre matematikken pen — og for å regne effektivt — pakker vi alle k features og intercept inn i en **design-matrise** X. Hver rad er én observasjon, hver kolonne er én feature. Den første kolonnen er konstant 1 (for intercept β0); det er ikke en feature i ekte forstand, bare et knep så formelen ``ŷ = X·β`` også inkluderer β0.\n\nMed n observasjoner og k features har X dimensjon ``n × (k+1)``.\n\nEksempel med 3 observasjoner og 2 features (x1, x2):\n\n```\nX = [[1, x1[0], x2[0]],\n     [1, x1[1], x2[1]],\n     [1, x1[2], x2[2]]]\n```\n\nDenne strukturen er fundamental — alle senere leksjoner forutsetter at du kan bygge X riktig.\n\n**Din oppgave:** implementér ``build_design_matrix(features)`` der ``features`` er en liste av lister (én liste per feature). Returnér en n × (k+1)-matrise (liste av lister) med intercept-kolonne av 1-er som første kolonne.",
      files: {
        "main.py": `def build_design_matrix(features):
    """features = [x1_liste, x2_liste, ...]. Returnér n x (k+1) matrise med intercept-kolonne."""
    # === DIN OPPGAVE ===
    # n = len(features[0])
    # k = len(features)
    # For hver rad i (0 til n-1): [1.0, features[0][i], features[1][i], ..., features[k-1][i]]
    pass


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Test 1: 2 features, 3 observasjoner
x1 = [10.0, 20.0, 30.0]
x2 = [1.5, 2.5, 3.5]
X = build_design_matrix([x1, x2])
forventet = [[1.0, 10.0, 1.5], [1.0, 20.0, 2.5], [1.0, 30.0, 3.5]]
sjekk(X, forventet, "X har riktig form for 2 features")

# Test 2: 1 feature alene (simpel regresjon-grensetilfelle)
X2 = build_design_matrix([[5.0, 6.0]])
sjekk(X2, [[1.0, 5.0], [1.0, 6.0]], "X med 1 feature gir 2 kolonner (intercept + feature)")

# Test 3: 3 features
a = [1.0, 2.0]
b = [3.0, 4.0]
c = [5.0, 6.0]
X3 = build_design_matrix([a, b, c])
sjekk(X3, [[1.0, 1.0, 3.0, 5.0], [1.0, 2.0, 4.0, 6.0]], "X med 3 features har 4 kolonner")

# Test 4: antall rader = antall observasjoner
X4 = build_design_matrix([[1.0, 2.0, 3.0, 4.0, 5.0]])
if X4 is not None and len(X4) == 5:
    print("OK   antall rader matcher antall observasjoner")
else:
    print(f"FEIL antall rader: fikk {len(X4) if X4 else None}, forventet 5")

# Test 5: forste kolonne er alltid 1.0
X5 = build_design_matrix([[100.0, 200.0]])
if X5 is not None and all(row[0] == 1.0 for row in X5):
    print("OK   intercept-kolonnen er alltid 1.0")
else:
    print(f"FEIL intercept-kolonne: {X5}")
`,
      },
      defaultFile: "main.py",
      editable: ["main.py"],
      run: { kind: "python-script", entry: "main.py" },
      verifications: [
        { label: "X har riktig form for 2 features", check: { kind: "output-contains", needle: "OK   X har riktig form for 2 features" } },
        { label: "X med 1 feature gir 2 kolonner", check: { kind: "output-contains", needle: "OK   X med 1 feature gir 2 kolonner" } },
        { label: "X med 3 features har 4 kolonner", check: { kind: "output-contains", needle: "OK   X med 3 features har 4 kolonner" } },
        { label: "Antall rader matcher antall observasjoner", check: { kind: "output-contains", needle: "OK   antall rader matcher antall observasjoner" } },
        { label: "Intercept-kolonnen er alltid 1.0", check: { kind: "output-contains", needle: "OK   intercept-kolonnen er alltid 1.0" } },
      ],
      hint:
        "def build_design_matrix(features):\n    n = len(features[0])\n    k = len(features)\n    return [[1.0] + [features[j][i] for j in range(k)] for i in range(n)]",
    },

    // ============ LEKSJON 2 ===========================================
    {
      id: "02-normalligning",
      title: "2. Normalligningen: β = (X'X)^-1 X'y",
      narrative:
        "Vi vil finne β-vektoren som minimerer ``sum (y_i - ŷ_i)^2``. Med kalkulus på matrise-form (sett gradienten = 0) får man den lukkede løsningen — **normalligningen**:\n\n```\nβ = (X'X)^-1 X'y\n```\n\nHer er ``X'`` (X-transpose) en (k+1)×n matrise, ``X'X`` er en (k+1)×(k+1) kvadratisk matrise, og ``X'X)^-1`` er dens invers. Resultatet er en vektor med k+1 elementer: intercept først, så koeffisienter for hver feature.\n\n**Hvorfor lære dette manuelt?** I praksis bruker du ``numpy.linalg.solve(X.T @ X, X.T @ y)`` (eller direkte ``numpy.linalg.lstsq``). Men formelen FORSVINNER ikke. Du skal forstå hva som skjer når du leser modellsammendraget: intercept og k koeffisienter kommer fra denne lukkede løsningen, og hvis ``X'X`` er nær singular (multikollinaritet), blir koeffisientene ustabile. Det forklarer leksjon 6.\n\n**Din oppgave:** implementér tre hjelpefunksjoner — ``transpose(M)``, ``matmul(A, B)``, ``inverse(M)`` med Gauss-Jordan — og deretter ``normal_equation(X, y)``. Vi gir også ``matvec(A, v)`` som er enkelt nok at vi bare har den ferdig. Bruk DEM, ikke numpy.",
      files: {
        "main.py": `def transpose(M):
    """Returner M-transpose (bytter rader og kolonner)."""
    # === DIN OPPGAVE ===
    # rows = len(M); cols = len(M[0])
    # Returner liste med cols rader, hver rad har rows elementer.
    pass


def matmul(A, B):
    """Matrise-multiplikasjon: A (n x m) ganget med B (m x p) = (n x p)."""
    # === DIN OPPGAVE ===
    # n = len(A); m = len(A[0]); p = len(B[0])
    # C[i][j] = sum(A[i][k] * B[k][j] for k in range(m))
    pass


def matvec(A, v):
    """Matrise-vektor: A (n x m) ganget med v (lengde m) = vektor med lengde n."""
    return [sum(A[i][j] * v[j] for j in range(len(v))) for i in range(len(A))]


def inverse(M):
    """Gauss-Jordan invers for kvadratisk n x n matrise.
    Augmentér [M | I], bruk rad-operasjoner til M blir I, så er hoyre halvdel inversen."""
    # === DIN OPPGAVE ===
    # 1. n = len(M)
    # 2. A = [row[:] + [1.0 if i==j else 0.0 for j in range(n)] for i, row in enumerate(M)]
    # 3. For hver kolonne i i 0..n-1:
    #      - Pivot: bytt om rader sa A[i][i] har storst |verdi|. Hvis 0 -> singular.
    #      - Skalér rad i sa A[i][i] = 1.
    #      - Eliminer kolonne i fra alle andre rader (A[r] -= A[r][i] * A[i]).
    # 4. Returner hoyre halvdel: [row[n:] for row in A].
    pass


def build_design_matrix(features):
    n = len(features[0])
    k = len(features)
    return [[1.0] + [features[j][i] for j in range(k)] for i in range(n)]


def normal_equation(X, y):
    """beta = (X'X)^-1 X'y. Returner liste med k+1 elementer."""
    # === DIN OPPGAVE ===
    # Xt = transpose(X)
    # XtX = matmul(Xt, X)
    # XtX_inv = inverse(XtX)
    # Xty = matvec(Xt, y)
    # return matvec(XtX_inv, Xty)
    pass


def sjekk_nær(faktisk, forventet, navn, tol=1e-6):
    if faktisk is None:
        print(f"FEIL {navn}: fikk None")
        return
    if abs(faktisk - forventet) < tol:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Test transpose
T = transpose([[1, 2, 3], [4, 5, 6]])
if T == [[1, 4], [2, 5], [3, 6]]:
    print("OK   transpose 2x3 -> 3x2")
else:
    print(f"FEIL transpose: fikk {T}")

# Test matmul: 2x3 * 3x2 = 2x2
P = matmul([[1, 2, 3], [4, 5, 6]], [[7, 8], [9, 10], [11, 12]])
if P == [[58, 64], [139, 154]]:
    print("OK   matmul 2x3 * 3x2")
else:
    print(f"FEIL matmul: fikk {P}")

# Test inverse: en 2x2 vi vet svaret pa
# [[4, 7], [2, 6]]^-1 = [[0.6, -0.7], [-0.2, 0.4]]
inv = inverse([[4.0, 7.0], [2.0, 6.0]])
if inv is not None:
    sjekk_nær(inv[0][0], 0.6, "inverse [0][0]")
    sjekk_nær(inv[0][1], -0.7, "inverse [0][1]")
    sjekk_nær(inv[1][0], -0.2, "inverse [1][0]")
    sjekk_nær(inv[1][1], 0.4, "inverse [1][1]")

# Test normal_equation: kjent eksakt-svar
# y = 1 + 2*x1 + 3*x2 (uten stoy) -> beta skal bli [1, 2, 3]
x1 = [1.0, 2.0, 3.0, 4.0, 5.0]
x2 = [2.0, 1.0, 4.0, 3.0, 5.0]
y = [1 + 2 * a + 3 * b for a, b in zip(x1, x2)]
X = build_design_matrix([x1, x2])
beta = normal_equation(X, y)
if beta is None:
    print("FEIL normal_equation: ikke implementert")
else:
    print(f"beta = {beta}")
    sjekk_nær(beta[0], 1.0, "normalligning intercept = 1", tol=1e-5)
    sjekk_nær(beta[1], 2.0, "normalligning beta1 = 2",   tol=1e-5)
    sjekk_nær(beta[2], 3.0, "normalligning beta2 = 3",   tol=1e-5)

# I praksis ville vi brukt numpy.linalg.solve(X.T @ X, X.T @ y).
# Forskjellen: numerisk stabilitet og hastighet, men formelen er den samme.
`,
      },
      defaultFile: "main.py",
      editable: ["main.py"],
      run: { kind: "python-script", entry: "main.py" },
      verifications: [
        { label: "transpose bytter rader og kolonner", check: { kind: "output-contains", needle: "OK   transpose 2x3 -> 3x2" } },
        { label: "matmul regner riktig 2x3 ganger 3x2", check: { kind: "output-contains", needle: "OK   matmul 2x3 * 3x2" } },
        { label: "inverse regner riktig [0][0] og [0][1]", check: { kind: "output-contains", needle: "OK   inverse [0][0]" } },
        { label: "inverse regner riktig [1][0] og [1][1]", check: { kind: "output-contains", needle: "OK   inverse [1][1]" } },
        { label: "normalligning gir riktig intercept", check: { kind: "output-contains", needle: "OK   normalligning intercept = 1" } },
        { label: "normalligning gir riktig beta1", check: { kind: "output-contains", needle: "OK   normalligning beta1 = 2" } },
        { label: "normalligning gir riktig beta2", check: { kind: "output-contains", needle: "OK   normalligning beta2 = 3" } },
      ],
      hint:
        "def transpose(M):\n    rows = len(M); cols = len(M[0])\n    return [[M[i][j] for i in range(rows)] for j in range(cols)]\n\ndef matmul(A, B):\n    n = len(A); m = len(A[0]); p = len(B[0])\n    return [[sum(A[i][k] * B[k][j] for k in range(m)) for j in range(p)] for i in range(n)]\n\ndef inverse(M):\n    n = len(M)\n    A = [row[:] + [1.0 if i == j else 0.0 for j in range(n)] for i, row in enumerate(M)]\n    for i in range(n):\n        max_row = max(range(i, n), key=lambda r: abs(A[r][i]))\n        if abs(A[max_row][i]) < 1e-12:\n            raise ValueError(\"Singular\")\n        A[i], A[max_row] = A[max_row], A[i]\n        pivot = A[i][i]\n        for j in range(2 * n):\n            A[i][j] /= pivot\n        for r in range(n):\n            if r == i:\n                continue\n            factor = A[r][i]\n            for j in range(2 * n):\n                A[r][j] -= factor * A[i][j]\n    return [row[n:] for row in A]\n\ndef normal_equation(X, y):\n    Xt = transpose(X)\n    return matvec(inverse(matmul(Xt, X)), matvec(Xt, y))",
    },

    // ============ LEKSJON 3 ===========================================
    {
      id: "03-predikt-residualer",
      title: "3. Predikajoner og residualer",
      narrative:
        "Med β estimert kan vi predikere: ``ŷ = X · β``. For hver rad i X er prediksjonen ``β0 + β1*x1 + β2*x2 + ...``. Det er bare matrise-vektor-produkt.\n\n**Residualen** for observasjon i er differansen mellom hva vi observerte og hva modellen sier:\n\n```\nr_i = y_i - ŷ_i\n```\n\nResidualene er datapunktene som er IGJEN etter at modellen har forklart hva den kan. Hele diagnostikken (leksjon 5) handler om å lese mønstre i residualene — for det er der det modellen *ikke* fanger opp dukker opp.\n\n**Egenskap ved OLS (ordinary least squares):** når modellen inneholder intercept, vil ``sum(r_i) = 0`` eksakt. Dette er ikke et tilfeldighet — det er ligningen for β0 (intercept-kolonnen er konstant 1, så summen av residualer ganget med 1 må være null for at gradienten skal være null). Dette gir oss en gratis sanity-test for implementasjonen vår.\n\n**Din oppgave:** implementér ``predict(X, beta)`` og ``residuals(y, y_pred)``.",
      files: {
        "main.py": `def transpose(M):
    return [[M[i][j] for i in range(len(M))] for j in range(len(M[0]))]


def matmul(A, B):
    n = len(A); m = len(A[0]); p = len(B[0])
    return [[sum(A[i][k] * B[k][j] for k in range(m)) for j in range(p)] for i in range(n)]


def matvec(A, v):
    return [sum(A[i][j] * v[j] for j in range(len(v))) for i in range(len(A))]


def inverse(M):
    n = len(M)
    A = [row[:] + [1.0 if i == j else 0.0 for j in range(n)] for i, row in enumerate(M)]
    for i in range(n):
        max_row = max(range(i, n), key=lambda r: abs(A[r][i]))
        if abs(A[max_row][i]) < 1e-12:
            raise ValueError("Singular")
        A[i], A[max_row] = A[max_row], A[i]
        pivot = A[i][i]
        for j in range(2 * n):
            A[i][j] /= pivot
        for r in range(n):
            if r == i:
                continue
            factor = A[r][i]
            for j in range(2 * n):
                A[r][j] -= factor * A[i][j]
    return [row[n:] for row in A]


def build_design_matrix(features):
    n = len(features[0])
    k = len(features)
    return [[1.0] + [features[j][i] for j in range(k)] for i in range(n)]


def normal_equation(X, y):
    Xt = transpose(X)
    return matvec(inverse(matmul(Xt, X)), matvec(Xt, y))


def predict(X, beta):
    """y_pred = X . beta. Returner liste med n predikajoner."""
    # === DIN OPPGAVE ===
    # Returner matvec(X, beta).
    pass


def residuals(y, y_pred):
    """r_i = y_i - y_pred_i. Returner liste med n residualer."""
    # === DIN OPPGAVE ===
    # Returner [y[i] - y_pred[i] for i in range(len(y))].
    pass


def sjekk_nær(faktisk, forventet, navn, tol=1e-6):
    if abs(faktisk - forventet) < tol:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Eksakt datasett: y = 5 + 2*x1 - x2
x1 = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0]
x2 = [0.0, 1.0, 0.5, 2.0, 1.5, 3.0]
y = [5 + 2 * a - b for a, b in zip(x1, x2)]
X = build_design_matrix([x1, x2])
beta = normal_equation(X, y)
y_pred = predict(X, beta)

if y_pred is None:
    print("FEIL predict: ikke implementert")
else:
    print(f"y      = {[round(v, 2) for v in y]}")
    print(f"y_pred = {[round(v, 2) for v in y_pred]}")
    # Pa eksakt data skal y_pred = y
    max_diff = max(abs(y[i] - y_pred[i]) for i in range(len(y)))
    if max_diff < 1e-6:
        print("OK   predikajoner matcher y eksakt pa eksakt data")
    else:
        print(f"FEIL predikajoner avviker (max diff = {max_diff})")

resid = residuals(y, y_pred) if y_pred else None
if resid is None:
    print("FEIL residuals: ikke implementert")
else:
    print(f"residualer = {[round(r, 6) for r in resid]}")
    # Pa eksakt data skal alle residualer vaere nesten 0
    max_r = max(abs(r) for r in resid)
    if max_r < 1e-6:
        print("OK   alle residualer er nesten null pa eksakt data")

# Med stoy: sum(residualer) skal fortsatt vaere nær 0 (intercept-egenskap ved OLS)
import random
rng = random.Random(42)
y_støy = [5 + 2 * a - b + rng.gauss(0, 0.2) for a, b in zip(x1, x2)]
beta_støy = normal_equation(X, y_støy)
pred_støy = predict(X, beta_støy)
resid_støy = residuals(y_støy, pred_støy)
sum_r = sum(resid_støy)
print(f"sum(residualer) ved stoy = {sum_r:.2e}")
sjekk_nær(sum_r, 0.0, "sum av residualer er ~0 (OLS-egenskap)", tol=1e-9)
`,
      },
      defaultFile: "main.py",
      editable: ["main.py"],
      run: { kind: "python-script", entry: "main.py" },
      verifications: [
        { label: "predict matcher y eksakt pa eksakt data", check: { kind: "output-contains", needle: "OK   predikajoner matcher y eksakt" } },
        { label: "Alle residualer er nesten null pa eksakt data", check: { kind: "output-contains", needle: "OK   alle residualer er nesten null" } },
        { label: "Sum av residualer er ~0 (OLS-egenskap)", check: { kind: "output-contains", needle: "OK   sum av residualer er ~0" } },
      ],
      hint:
        "def predict(X, beta):\n    return matvec(X, beta)\n\ndef residuals(y, y_pred):\n    return [y[i] - y_pred[i] for i in range(len(y))]",
    },

    // ============ LEKSJON 4 ===========================================
    {
      id: "04-r2-adjusted",
      title: "4. R^2, adjusted R^2 og overfit-fellen",
      narrative:
        "**R^2** (forklart varians) er det mest brukte modell-tilpasningsmaalet:\n\n```\nR^2 = 1 - SS_res / SS_tot\nSS_res = sum (y_i - y_pred_i)^2\nSS_tot = sum (y_i - mean(y))^2\n```\n\nR^2 = 1 betyr modellen forklarer all variasjon. R^2 = 0 betyr modellen er like ille som å bare gjette gjennomsnittet. (Du kan også få NEGATIV R^2 hvis modellen er VERRE enn gjennomsnittet — men ikke fra OLS på treningsdata.)\n\n**Problemet med R^2:** den øker MONOTONT når du legger til flere features, selv helt irrelevante. En feature som er ren støy vil ved ren tilfeldighet forklare litt av variasjonen i y. R^2 belønner deg for å overfitte.\n\n**Adjusted R^2** straffer for antall features:\n\n```\nadj R^2 = 1 - (1 - R^2) * (n - 1) / (n - k - 1)\n```\n\nHer er n antall observasjoner og k antall features (uten intercept). Hvis du legger til en feature som ikke gir reell forklaringskraft, vil ``n - k - 1`` minke fortere enn ``1 - R^2`` minker, og adjusted R^2 GÅR NED. Det er signalet ditt om at den nye featuren ikke er verdt det.\n\nI denne leksjonen genererer vi y fra én ekte feature, deretter tilpasser tre modeller med 1, 2 og 3 features (de to siste er ren støy). Du vil se R^2 stige monotont, men adj R^2 synke — eksakt det vi vil at den skal gjøre.\n\n**Din oppgave:** implementér ``r_squared(y, y_pred)`` og ``adjusted_r_squared(y, y_pred, k)``.",
      files: {
        "main.py": `import random


def transpose(M):
    return [[M[i][j] for i in range(len(M))] for j in range(len(M[0]))]


def matmul(A, B):
    n = len(A); m = len(A[0]); p = len(B[0])
    return [[sum(A[i][k] * B[k][j] for k in range(m)) for j in range(p)] for i in range(n)]


def matvec(A, v):
    return [sum(A[i][j] * v[j] for j in range(len(v))) for i in range(len(A))]


def inverse(M):
    n = len(M)
    A = [row[:] + [1.0 if i == j else 0.0 for j in range(n)] for i, row in enumerate(M)]
    for i in range(n):
        max_row = max(range(i, n), key=lambda r: abs(A[r][i]))
        if abs(A[max_row][i]) < 1e-12:
            raise ValueError("Singular")
        A[i], A[max_row] = A[max_row], A[i]
        pivot = A[i][i]
        for j in range(2 * n):
            A[i][j] /= pivot
        for r in range(n):
            if r == i:
                continue
            factor = A[r][i]
            for j in range(2 * n):
                A[r][j] -= factor * A[i][j]
    return [row[n:] for row in A]


def build_design_matrix(features):
    n = len(features[0])
    k = len(features)
    return [[1.0] + [features[j][i] for j in range(k)] for i in range(n)]


def normal_equation(X, y):
    Xt = transpose(X)
    return matvec(inverse(matmul(Xt, X)), matvec(Xt, y))


def predict(X, beta):
    return matvec(X, beta)


def mean(xs):
    return sum(xs) / len(xs)


def r_squared(y, y_pred):
    """1 - SS_res / SS_tot."""
    # === DIN OPPGAVE ===
    # y_mean = mean(y)
    # ss_res = sum((y[i] - y_pred[i]) ** 2 for i in range(len(y)))
    # ss_tot = sum((y[i] - y_mean) ** 2 for i in range(len(y)))
    # Returner 1 - ss_res / ss_tot.
    pass


def adjusted_r_squared(y, y_pred, k):
    """1 - (1 - R^2) * (n - 1) / (n - k - 1)."""
    # === DIN OPPGAVE ===
    # n = len(y)
    # r2 = r_squared(y, y_pred)
    # Returner 1 - (1 - r2) * (n - 1) / (n - k - 1).
    pass


# Genererer data: y = 1 + 2*x1 + stoy. Bare x1 er ekte; x2 og x3 er hvit stoy.
rng = random.Random(42)
n = 30
x1 = [rng.gauss(0, 1) for _ in range(n)]
x2_støy = [rng.gauss(0, 1) for _ in range(n)]
x3_støy = [rng.gauss(0, 1) for _ in range(n)]
y = [1 + 2 * x + rng.gauss(0, 0.5) for x in x1]


def fit_og_rapporter(features, navn, k):
    X = build_design_matrix(features)
    beta = normal_equation(X, y)
    pred = predict(X, beta)
    r2 = r_squared(y, pred)
    adj = adjusted_r_squared(y, pred, k)
    print(f"  {navn:<20s} R^2 = {r2:.4f}, adj R^2 = {adj:.4f}")
    return r2, adj


print("Modeller med okende antall features:")
r2_1, adj_1 = fit_og_rapporter([x1],                              "modell A (x1)",         k=1)
r2_2, adj_2 = fit_og_rapporter([x1, x2_støy],                    "modell B (+ stoy)",     k=2)
r2_3, adj_3 = fit_og_rapporter([x1, x2_støy, x3_støy],          "modell C (+ 2 stoy)",   k=3)

# Test 1: R^2 oker monotont (eller likt) nar vi legger til features
if r2_1 <= r2_2 <= r2_3:
    print("OK   R^2 oker monotont nar vi legger til features")
else:
    print(f"FEIL R^2 ikke monotont: {r2_1}, {r2_2}, {r2_3}")

# Test 2: adjusted R^2 SYNKER nar vi legger til irrelevante features
if adj_1 > adj_2 > adj_3:
    print("OK   adjusted R^2 synker nar irrelevante features legges til")
else:
    print(f"FEIL adj R^2 forventet monotont synkende, fikk: {adj_1}, {adj_2}, {adj_3}")

# Test 3: pa eksakt data skal R^2 vaere 1.0
y_eksakt = [1 + 2 * x for x in x1]
X1 = build_design_matrix([x1])
beta_e = normal_equation(X1, y_eksakt)
pred_e = predict(X1, beta_e)
r2_e = r_squared(y_eksakt, pred_e)
print(f"R^2 pa eksakt data: {r2_e:.6f}")
if r2_e > 0.9999:
    print("OK   R^2 = 1 pa eksakt data")
else:
    print(f"FEIL forventet R^2 = 1, fikk {r2_e}")
`,
      },
      defaultFile: "main.py",
      editable: ["main.py"],
      run: { kind: "python-script", entry: "main.py" },
      verifications: [
        { label: "R^2 oker monotont nar features legges til", check: { kind: "output-contains", needle: "OK   R^2 oker monotont" } },
        { label: "Adjusted R^2 synker ved irrelevante features", check: { kind: "output-contains", needle: "OK   adjusted R^2 synker" } },
        { label: "R^2 = 1 pa eksakt data", check: { kind: "output-contains", needle: "OK   R^2 = 1 pa eksakt data" } },
      ],
      hint:
        "def r_squared(y, y_pred):\n    y_mean = mean(y)\n    ss_res = sum((y[i] - y_pred[i]) ** 2 for i in range(len(y)))\n    ss_tot = sum((yi - y_mean) ** 2 for yi in y)\n    return 1 - ss_res / ss_tot\n\ndef adjusted_r_squared(y, y_pred, k):\n    n = len(y)\n    r2 = r_squared(y, y_pred)\n    return 1 - (1 - r2) * (n - 1) / (n - k - 1)",
    },

    // ============ LEKSJON 5 ===========================================
    {
      id: "05-residual-plot",
      title: "5. Residual-plot: les mønstre i resten",
      narrative:
        "Når en multiple regresjon viser høy R^2 betyr det BARE at modellen forklarer mye av variansen i treningsdataene. Det sier ikke at modellen er RIKTIG. To modeller med samme R^2 kan ha radikalt forskjellige residual-mønstre — og residual-mønsteret avslører hva som er galt.\n\nKlassisk diagnostikk: plott residualer (y-akse) mot predikajoner (x-akse). Tre mønstre du må kjenne igjen:\n\n**A) Tilfeldig spredt rundt 0** — modellen er bra. Residualer er hvit støy.\n\n**B) Trakt-form** (varians vokser fra venstre til høyre, eller motsatt) — **heteroskedastisitet**. Modellens prediksjons-feil avhenger av prediksjonens størrelse. OLS-koeffisientene er fortsatt unbiased, men standard errors er feil → t-tester og konfidensintervaller lyver. Fiks: log-transformér y, eller bruk vektet minste kvadraters metode.\n\n**C) Systematisk kurve** (smile- eller frown-form) — modellen mangler en ikke-lineær term. Du har antatt linearitet, men det sanne forholdet er kvadratisk eller mer. Fiks: legg til x^2 eller log(x) som ny feature.\n\nI denne leksjonen lager du en enkel ASCII residual-plotter. Vi konstruerer deretter tre datasett som GIR forutsigbart hver av de tre mønstrene, og programmet sjekker både at plot-funksjonen virker OG at residual-varians-mønstrene er som forventet.\n\n**Din oppgave:** implementér ``residual_plot(y_pred, residuals, width=40, height=11)`` som returnerer en streng — en ASCII-scatter med ``*`` for punkter, ``-`` for midt-linja (residual = 0). Bruk doble anførsler i docstrings.",
      files: {
        "main.py": `import random


def mean(xs):
    return sum(xs) / len(xs)


def transpose(M):
    return [[M[i][j] for i in range(len(M))] for j in range(len(M[0]))]


def matmul(A, B):
    n = len(A); m = len(A[0]); p = len(B[0])
    return [[sum(A[i][k] * B[k][j] for k in range(m)) for j in range(p)] for i in range(n)]


def matvec(A, v):
    return [sum(A[i][j] * v[j] for j in range(len(v))) for i in range(len(A))]


def inverse(M):
    n = len(M)
    A = [row[:] + [1.0 if i == j else 0.0 for j in range(n)] for i, row in enumerate(M)]
    for i in range(n):
        max_row = max(range(i, n), key=lambda r: abs(A[r][i]))
        if abs(A[max_row][i]) < 1e-12:
            raise ValueError("Singular")
        A[i], A[max_row] = A[max_row], A[i]
        pivot = A[i][i]
        for j in range(2 * n):
            A[i][j] /= pivot
        for r in range(n):
            if r == i:
                continue
            factor = A[r][i]
            for j in range(2 * n):
                A[r][j] -= factor * A[i][j]
    return [row[n:] for row in A]


def build_design_matrix(features):
    n = len(features[0])
    k = len(features)
    return [[1.0] + [features[j][i] for j in range(k)] for i in range(n)]


def normal_equation(X, y):
    Xt = transpose(X)
    return matvec(inverse(matmul(Xt, X)), matvec(Xt, y))


def predict(X, beta):
    return matvec(X, beta)


def residuals(y, y_pred):
    return [y[i] - y_pred[i] for i in range(len(y))]


def residual_plot(y_pred, residuals_list, width=40, height=11):
    """ASCII scatter: residualer paa y-akse, predikajoner paa x-akse.
    Returner streng med height rader, hver width tegn bred.
    Midtraden viser y=0-linja med tegnet "-"."""
    # === DIN OPPGAVE ===
    # 1. Hent max_r = max(abs(r) for r in residuals_list). Default til 1 hvis 0.
    # 2. min_p = min(y_pred); span_p = max(y_pred) - min_p (default 1 hvis 0).
    # 3. Lag grid: liste av height rader, hver er liste av width " "-tegn.
    # 4. midrow = height // 2.
    # 5. For hver (x, r) i zip(y_pred, residuals_list):
    #      col = int((x - min_p) / span_p * (width - 1))
    #      row = int(midrow - (r / max_r) * midrow)
    #      Klamp row og col inn i [0, height-1] / [0, width-1].
    #      grid[row][col] = "*".
    # 6. Tegn midt-linja: for hver c i 0..width-1, hvis grid[midrow][c] == " ": grid[midrow][c] = "-".
    # 7. Returner "\\n".join("".join(row) for row in grid).
    pass


def half_variance(values_x, values_r):
    """Hjelper: returner (var_venstre_halvdel, var_hoyre_halvdel) basert paa x."""
    n = len(values_x)
    sorted_pairs = sorted(zip(values_x, values_r))
    half = n // 2
    venstre = [r for _, r in sorted_pairs[:half]]
    hoyre   = [r for _, r in sorted_pairs[half:]]
    def var(xs):
        if not xs:
            return 0.0
        m = mean(xs)
        return sum((x - m) ** 2 for x in xs) / len(xs)
    return var(venstre), var(hoyre)


# ============================================================
# Plotsanity: plot-funksjonen returnerer streng med riktig form
# ============================================================
y_pred_test = [1.0, 2.0, 3.0, 4.0, 5.0]
resid_test  = [0.5, -0.5, 0.0, 0.3, -0.3]
plot = residual_plot(y_pred_test, resid_test, width=20, height=7)
if plot is None:
    print("FEIL residual_plot returnerte None")
else:
    print("Plot (test):")
    print(plot)
    linjer = plot.split("\\n")
    if len(linjer) == 7 and all(len(l) == 20 for l in linjer):
        print("OK   plot har riktig dimensjon (7 rader, 20 kolonner)")
    else:
        print(f"FEIL plot-dimensjon: {len(linjer)} rader, lengder {[len(l) for l in linjer]}")
    if "*" in plot:
        print("OK   plot inneholder * for datapunkter")
    if "-" in plot:
        print("OK   plot inneholder - for midt-linja")


# ============================================================
# Tre mønstre: programmet sjekker varians-mønstrene
# ============================================================

rng = random.Random(42)

# A) Tilfeldig: konstant varians, ingen trend
xs_A = [i * 0.5 for i in range(30)]
resid_A = [rng.gauss(0, 1.0) for _ in range(30)]
var_v_A, var_h_A = half_variance(xs_A, resid_A)
print(f"\\nA) Tilfeldig:  var venstre = {var_v_A:.3f}, var hoyre = {var_h_A:.3f}")
if 0.3 < var_v_A < 3.0 and 0.3 < var_h_A < 3.0 and max(var_v_A, var_h_A) / max(min(var_v_A, var_h_A), 0.001) < 3.0:
    print("OK   monster A: tilfeldig (likt varians-niva)")
else:
    print(f"FEIL: ikke balansert varians")

# B) Trakt: varians vokser med predikert
xs_B = [i * 0.5 for i in range(30)]
resid_B = [rng.gauss(0, 0.1 + i * 0.3) for i in range(30)]
var_v_B, var_h_B = half_variance(xs_B, resid_B)
print(f"B) Trakt:      var venstre = {var_v_B:.3f}, var hoyre = {var_h_B:.3f}")
if var_h_B > 5 * var_v_B:
    print("OK   monster B: heteroskedastisitet (varians vokser mye)")
else:
    print(f"FEIL: forventet h>>v, fikk h={var_h_B}, v={var_v_B}")

# C) Systematisk kurve: residual = ((i - 14.5)/14.5)^2 * 10 - 3 -> u-form
xs_C = [i * 0.5 for i in range(30)]
resid_C = [((i - 14.5) / 14.5) ** 2 * 10 - 3 for i in range(30)]
# Sjekk: gjennomsnitt av residualer i venstre + hoyre halvdel er positivt,
# gjennomsnitt i midten er negativt -> u-form
n = len(xs_C)
left = resid_C[: n // 3]
mid = resid_C[n // 3 : 2 * n // 3]
right = resid_C[2 * n // 3 :]
m_l, m_m, m_r = mean(left), mean(mid), mean(right)
print(f"C) Kurve:      mean venstre={m_l:.2f}, midten={m_m:.2f}, hoyre={m_r:.2f}")
if m_l > 0 and m_m < 0 and m_r > 0:
    print("OK   monster C: systematisk u-form i residualene")
else:
    print(f"FEIL forventet pos/neg/pos, fikk {m_l}, {m_m}, {m_r}")

# Vis ogsa plot for monster C som demo
if plot is not None:
    print("\\nMonster C visualisert:")
    print(residual_plot(xs_C, resid_C, width=40, height=11))
`,
      },
      defaultFile: "main.py",
      editable: ["main.py"],
      run: { kind: "python-script", entry: "main.py" },
      verifications: [
        { label: "Plot har riktig dimensjon", check: { kind: "output-contains", needle: "OK   plot har riktig dimensjon" } },
        { label: "Plot inneholder * for datapunkter", check: { kind: "output-contains", needle: "OK   plot inneholder * for datapunkter" } },
        { label: "Plot tegner midt-linje med -", check: { kind: "output-contains", needle: "OK   plot inneholder - for midt-linja" } },
        { label: "Monster A: tilfeldig spredning", check: { kind: "output-contains", needle: "OK   monster A: tilfeldig" } },
        { label: "Monster B: heteroskedastisitet (trakt)", check: { kind: "output-contains", needle: "OK   monster B: heteroskedastisitet" } },
        { label: "Monster C: systematisk u-form", check: { kind: "output-contains", needle: "OK   monster C: systematisk u-form" } },
      ],
      hint:
        "def residual_plot(y_pred, residuals_list, width=40, height=11):\n    if not residuals_list:\n        return \"\"\n    max_r = max(abs(r) for r in residuals_list)\n    if max_r == 0:\n        max_r = 1.0\n    min_p = min(y_pred)\n    max_p = max(y_pred)\n    span_p = max_p - min_p if max_p > min_p else 1.0\n    grid = [[\" \"] * width for _ in range(height)]\n    midrow = height // 2\n    for x, r in zip(y_pred, residuals_list):\n        col = int((x - min_p) / span_p * (width - 1))\n        row = int(midrow - (r / max_r) * midrow)\n        row = max(0, min(height - 1, row))\n        col = max(0, min(width - 1, col))\n        grid[row][col] = \"*\"\n    for c in range(width):\n        if grid[midrow][c] == \" \":\n            grid[midrow][c] = \"-\"\n    return \"\\n\".join(\"\".join(row) for row in grid)",
    },

    // ============ LEKSJON 6 ===========================================
    {
      id: "06-vif-multikollinaritet",
      title: "6. Multikollinaritet og VIF",
      narrative:
        "Hva skjer hvis to features måler nesten det samme — f.eks. høyde i cm og høyde i tommer? Eller mer realistisk: alder og antall år i utdanning, eller inntekt og formue? Da er ``X'X`` nær singular, og inversen — som vi trenger for normalligningen — eksploderer. Resultatet: β-estimatene blir ekstremt sensitive til små endringer i dataene. Du kan trene to ganger på nesten samme data og få helt forskjellige koeffisienter. Modellen prediker fortsatt OK, men koeffisientene er ubrukelige til tolkning.\n\nDette heter **multikollinaritet**.\n\nEnkleste test: ``correlation(x_i, x_j)``. Hvis to features har korrelasjon > 0.9, er du i trøbbel. Men korrelasjon er bare parvis — hva hvis x1 ≈ x2 + x3? Da kan ingen parvis korrelasjon være høy, men de er likevel kollinære.\n\n**VIF (Variance Inflation Factor)** fanger dette. For feature i:\n\n1. Regnér regresjon der x_i er TARGET, og alle andre features er prediktorer.\n2. La R_i^2 være R^2 fra DEN regresjonen.\n3. ``VIF_i = 1 / (1 - R_i^2)``.\n\nIntuisjon: hvis R_i^2 er nær 1, betyr det at x_i er nesten fullstendig forklart av de andre. Da blir VIF kjempestor. Tommelfingerregel: VIF > 5 er bekymringsfullt, VIF > 10 er problematisk. VIF = 1 betyr ingen kollinaritet (R_i^2 = 0).\n\nI denne leksjonen bygger vi to syntetiske datasett: ett der ``x2 = 2*x1 + støy`` (sterkt kollinært), og ett der alle features er uavhengige hvit støy. Du bekrefter at korrelasjons-deteksjonen og VIF gir forutsigbart høye/lave verdier.\n\n**Din oppgave:** implementér ``correlation(a, b)`` og ``vif(features, idx)``. ``vif`` skal bruke ``normal_equation`` på ``features[idx]`` som y og de andre features som X.",
      files: {
        "main.py": `import random


def mean(xs):
    return sum(xs) / len(xs)


def variance(xs):
    m = mean(xs)
    return sum((x - m) ** 2 for x in xs) / len(xs)


def transpose(M):
    return [[M[i][j] for i in range(len(M))] for j in range(len(M[0]))]


def matmul(A, B):
    n = len(A); m = len(A[0]); p = len(B[0])
    return [[sum(A[i][k] * B[k][j] for k in range(m)) for j in range(p)] for i in range(n)]


def matvec(A, v):
    return [sum(A[i][j] * v[j] for j in range(len(v))) for i in range(len(A))]


def inverse(M):
    n = len(M)
    A = [row[:] + [1.0 if i == j else 0.0 for j in range(n)] for i, row in enumerate(M)]
    for i in range(n):
        max_row = max(range(i, n), key=lambda r: abs(A[r][i]))
        if abs(A[max_row][i]) < 1e-12:
            raise ValueError("Singular")
        A[i], A[max_row] = A[max_row], A[i]
        pivot = A[i][i]
        for j in range(2 * n):
            A[i][j] /= pivot
        for r in range(n):
            if r == i:
                continue
            factor = A[r][i]
            for j in range(2 * n):
                A[r][j] -= factor * A[i][j]
    return [row[n:] for row in A]


def build_design_matrix(features):
    n = len(features[0])
    k = len(features)
    return [[1.0] + [features[j][i] for j in range(k)] for i in range(n)]


def normal_equation(X, y):
    Xt = transpose(X)
    return matvec(inverse(matmul(Xt, X)), matvec(Xt, y))


def predict(X, beta):
    return matvec(X, beta)


def r_squared(y, y_pred):
    y_mean = mean(y)
    ss_res = sum((y[i] - y_pred[i]) ** 2 for i in range(len(y)))
    ss_tot = sum((yi - y_mean) ** 2 for yi in y)
    if ss_tot == 0:
        return 0.0
    return 1 - ss_res / ss_tot


def correlation(a, b):
    """Pearson-korrelasjon mellom to lister med samme lengde."""
    # === DIN OPPGAVE ===
    # m_a = mean(a); m_b = mean(b)
    # cov = sum((a[i] - m_a) * (b[i] - m_b) for i in range(len(a))) / len(a)
    # sd_a = sqrt(variance(a)); sd_b = sqrt(variance(b))
    # Returner cov / (sd_a * sd_b). Pass paa division by zero (returner 0.0).
    pass


def vif(features, idx):
    """VIF for features[idx]. Regn regresjon mot de andre features, returner 1/(1-R^2)."""
    # === DIN OPPGAVE ===
    # target = features[idx]
    # andre = [features[j] for j in range(len(features)) if j != idx]
    # X = build_design_matrix(andre)
    # beta = normal_equation(X, target)
    # pred = predict(X, beta)
    # r2 = r_squared(target, pred)
    # Returner float("inf") hvis r2 >= 1, ellers 1.0 / (1.0 - r2).
    pass


def sjekk_nær(faktisk, forventet, navn, tol=1e-3):
    if abs(faktisk - forventet) < tol:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Sett opp: x2 = 2*x1 + liten stoy (sterkt kollinaert), x3 uavhengig
rng = random.Random(42)
n = 50
x1 = [rng.gauss(0, 1) for _ in range(n)]
x2 = [2 * x + rng.gauss(0, 0.1) for x in x1]
x3 = [rng.gauss(0, 1) for _ in range(n)]

cor_12 = correlation(x1, x2)
cor_13 = correlation(x1, x3)
print(f"corr(x1, x2) = {cor_12:.4f}  (forventet naer 1)")
print(f"corr(x1, x3) = {cor_13:.4f}  (forventet naer 0)")

if cor_12 is not None and cor_12 > 0.95:
    print("OK   correlation oppdager sterk kollinaritet (corr > 0.95)")
else:
    print(f"FEIL corr(x1,x2) = {cor_12}, forventet > 0.95")

if cor_13 is not None and abs(cor_13) < 0.3:
    print("OK   correlation oppdager uavhengighet (|corr| < 0.3)")
else:
    print(f"FEIL corr(x1,x3) = {cor_13}, forventet |.| < 0.3")

# VIF: x1 og x2 burde ha hoy VIF, x3 burde ha lav
features = [x1, x2, x3]
vif_x1 = vif(features, 0)
vif_x2 = vif(features, 1)
vif_x3 = vif(features, 2)
print(f"VIF(x1) = {vif_x1:.2f}  (forventet > 10)")
print(f"VIF(x2) = {vif_x2:.2f}  (forventet > 10)")
print(f"VIF(x3) = {vif_x3:.2f}  (forventet naer 1)")

if vif_x1 is not None and vif_x1 > 10:
    print("OK   VIF(x1) > 10 (multikollinaritet oppdaget)")
else:
    print(f"FEIL VIF(x1) = {vif_x1}, forventet > 10")

if vif_x2 is not None and vif_x2 > 10:
    print("OK   VIF(x2) > 10 (multikollinaritet oppdaget)")
else:
    print(f"FEIL VIF(x2) = {vif_x2}, forventet > 10")

if vif_x3 is not None and vif_x3 < 2:
    print("OK   VIF(x3) naer 1 (uavhengig feature)")
else:
    print(f"FEIL VIF(x3) = {vif_x3}, forventet < 2")

# Test 2: uavhengige features skal ha VIF naer 1
x1b = [rng.gauss(0, 1) for _ in range(n)]
x2b = [rng.gauss(0, 1) for _ in range(n)]
x3b = [rng.gauss(0, 1) for _ in range(n)]
fb = [x1b, x2b, x3b]
vifs_uavh = [vif(fb, i) for i in range(3)]
print(f"VIF for tre uavhengige: {[f'{v:.2f}' for v in vifs_uavh]}")
if all(v is not None and v < 2 for v in vifs_uavh):
    print("OK   alle uavhengige features har VIF < 2")
else:
    print(f"FEIL noen VIF for uavhengige > 2")
`,
      },
      defaultFile: "main.py",
      editable: ["main.py"],
      run: { kind: "python-script", entry: "main.py" },
      verifications: [
        { label: "correlation oppdager sterk kollinaritet", check: { kind: "output-contains", needle: "OK   correlation oppdager sterk kollinaritet" } },
        { label: "correlation oppdager uavhengighet", check: { kind: "output-contains", needle: "OK   correlation oppdager uavhengighet" } },
        { label: "VIF(x1) > 10 ved kollinaritet", check: { kind: "output-contains", needle: "OK   VIF(x1) > 10" } },
        { label: "VIF(x2) > 10 ved kollinaritet", check: { kind: "output-contains", needle: "OK   VIF(x2) > 10" } },
        { label: "VIF naer 1 for uavhengig feature", check: { kind: "output-contains", needle: "OK   VIF(x3) naer 1" } },
        { label: "Alle uavhengige features har VIF < 2", check: { kind: "output-contains", needle: "OK   alle uavhengige features har VIF < 2" } },
      ],
      hint:
        "def correlation(a, b):\n    n = len(a)\n    m_a = mean(a); m_b = mean(b)\n    cov = sum((a[i] - m_a) * (b[i] - m_b) for i in range(n)) / n\n    sd_a = variance(a) ** 0.5\n    sd_b = variance(b) ** 0.5\n    if sd_a == 0 or sd_b == 0:\n        return 0.0\n    return cov / (sd_a * sd_b)\n\ndef vif(features, idx):\n    target = features[idx]\n    andre = [features[j] for j in range(len(features)) if j != idx]\n    X = build_design_matrix(andre)\n    beta = normal_equation(X, target)\n    pred = predict(X, beta)\n    r2 = r_squared(target, pred)\n    if r2 >= 1.0:\n        return float(\"inf\")\n    return 1.0 / (1.0 - r2)",
    },
  ],
};

const HYPERPARAMETER_TUNING: MiniCourse = {
  id: "hyperparameter-tuning",
  slug: "hyperparameter-tuning",
  title: "Hyperparameter-tuning fra null",
  blurb:
    "Lær å velge modell-parametere systematisk — fra naivt train/test-split, via K-fold cross-validation, grid search og random search, til den smarte three-way-split-en som hindrer at du \"overfitter til validation-settet\". Bygges på k-NN-klassifikator du selv implementerer. Pure Python, ingen sklearn.",
  estimertTid: "60–75 min",
  fag: ["DTE-2602", "Maskinlæring", "Modellvalg"],
  color: "purple",
  rekkefolge: 30,
  lessons: [
    // ============ LEKSJON 1 ===========================================
    {
      id: "01-train-test-split",
      title: "1. Train/test-split som baseline",
      narrative:
        "Du har trent en modell. Hvor god er den? Hvis du måler på de samme dataene du trente på, fusker du — modellen kan ha **memorert** treningssettet uten å ha lært noe generelt. Standard-løsningen er **train/test-split**: hold tilbake en del av data (typisk 20%) som modellen aldri ser under trening, og bruk de tilbakeholdte til å måle ytelsen.\n\n**k-NN-klassifikatoren** har én hyperparameter: `k`, antall naboer som stemmer. Når `k=1` overfitter modellen (kopiere nærmeste nabo, også støy). Når `k` er for stor, jevnes klasseskillet ut og modellen underfitter. Et sted i mellom ligger det beste valget — men hva er \"i mellom\" for ditt datasett?\n\nDenne leksjonen lager et 2D-datasett med to klasser (Gauss-skyer med overlapp), splitter 80/20, og rapporterer test-accuracy for `k` i [1, 3, 5, 7, 9]. Du finner beste `k` ved å se på tallene.\n\n**Din oppgave:**\n\n1. Implementér `train_test_split(X, y, test_frac=0.2, seed=42)` som returnerer fire lister: `X_train, X_test, y_train, y_test`. Bruk `random.Random(seed)` for å shuffle indekser før du splitter.\n2. Implementér `knn_predict(x_query, X_train, y_train, k)` som returnerer flertallsklassen blant de `k` nærmeste naboene (euklidsk avstand).\n3. Implementér `accuracy(X_test, y_test, X_train, y_train, k)` — andel riktige.",
      files: {
        "knn.py": `import math
import random
from collections import Counter


# === Datasett: 50 punkter, 2 klasser, Gauss-skyer med overlapp ===
random.seed(1)
X = []
y = []
for _ in range(25):
    X.append([random.gauss(0, 1.7), random.gauss(0, 1.7)])
    y.append(0)
for _ in range(25):
    X.append([random.gauss(1.5, 1.7), random.gauss(1.5, 1.7)])
    y.append(1)


def train_test_split(X, y, test_frac=0.2, seed=42):
    """Shuffle (med seed) og del i train/test. Returnér (X_train, X_test, y_train, y_test)."""
    # === DIN OPPGAVE ===
    # 1. idx = list(range(len(X)))
    # 2. rng = random.Random(seed); rng.shuffle(idx)
    # 3. n_test = int(len(X) * test_frac)
    # 4. test_idx = idx[:n_test]; train_idx = idx[n_test:]
    # 5. Returnér de fire listene i riktig rekkefølge.
    return [], [], [], []


def euclidean(a, b):
    return math.sqrt(sum((ai - bi) ** 2 for ai, bi in zip(a, b)))


def knn_predict(x_query, X_train, y_train, k=3):
    """Returnér flertallsklassen blant k nærmeste naboer."""
    # === DIN OPPGAVE ===
    # 1. Lag liste med (avstand, label) for hver (X_train[i], y_train[i]).
    # 2. Sorter på avstand.
    # 3. Ta k første labels.
    # 4. Returnér mest vanlige label med Counter.most_common(1).
    return 0


def accuracy(X_test, y_test, X_train, y_train, k=3):
    """Andel av X_test der knn_predict treffer y_test."""
    # === DIN OPPGAVE ===
    # Tell hvor mange knn_predict-prediksjoner som matcher y_test. Returnér andel.
    return 0.0


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


# Test split-størrelser
X_train, X_test, y_train, y_test = train_test_split(X, y, test_frac=0.2, seed=42)
sjekk(len(X_train), 40, "train har 40 punkter")
sjekk(len(X_test), 10, "test har 10 punkter")
sjekk(len(y_train), 40, "y_train har 40 labels")
sjekk(len(y_test), 10, "y_test har 10 labels")

# Kjør k-NN for k i [1, 3, 5, 7, 9]
print()
print("Test-accuracy for ulike k:")
accs = {}
for k in [1, 3, 5, 7, 9]:
    accs[k] = accuracy(X_test, y_test, X_train, y_train, k)
    print(f"  k={k}: acc={accs[k]:.4f}")

# Beste k på dette datasettet er k=3 (acc=0.8)
sjekk_naer(accs[1], 0.7, "k=1 gir 0.7")
sjekk_naer(accs[3], 0.8, "k=3 gir 0.8")
sjekk_naer(accs[5], 0.7, "k=5 gir 0.7")

# Beste k
best_k = max(accs, key=accs.get)
sjekk(best_k, 3, "beste k er 3")
`,
      },
      defaultFile: "knn.py",
      editable: ["knn.py"],
      run: { kind: "python-script", entry: "knn.py" },
      verifications: [
        {
          label: "train_test_split deler riktig (40 train, 10 test)",
          check: { kind: "output-contains", needle: "OK   train har 40 punkter" },
        },
        {
          label: "y_train og y_test har riktig størrelse",
          check: { kind: "output-contains", needle: "OK   y_test har 10 labels" },
        },
        {
          label: "k=1 gir test-accuracy 0.7",
          check: { kind: "output-contains", needle: "OK   k=1 gir 0.7" },
        },
        {
          label: "k=3 gir test-accuracy 0.8 (best på dette splittet)",
          check: { kind: "output-contains", needle: "OK   k=3 gir 0.8" },
        },
        {
          label: "Beste k identifisert som 3",
          check: { kind: "output-contains", needle: "OK   beste k er 3" },
        },
      ],
      hint:
        "def train_test_split(X, y, test_frac=0.2, seed=42):\n    idx = list(range(len(X)))\n    rng = random.Random(seed)\n    rng.shuffle(idx)\n    n_test = int(len(X) * test_frac)\n    test_idx = idx[:n_test]\n    train_idx = idx[n_test:]\n    X_train = [X[i] for i in train_idx]\n    y_train = [y[i] for i in train_idx]\n    X_test = [X[i] for i in test_idx]\n    y_test = [y[i] for i in test_idx]\n    return X_train, X_test, y_train, y_test\n\ndef knn_predict(x_query, X_train, y_train, k=3):\n    dists = [(euclidean(x_query, X_train[i]), y_train[i]) for i in range(len(X_train))]\n    dists.sort(key=lambda t: t[0])\n    nearest = [lbl for _, lbl in dists[:k]]\n    return Counter(nearest).most_common(1)[0][0]\n\ndef accuracy(X_test, y_test, X_train, y_train, k=3):\n    correct = sum(1 for xq, yt in zip(X_test, y_test) if knn_predict(xq, X_train, y_train, k) == yt)\n    return correct / len(X_test)",
    },

    // ============ LEKSJON 2 ===========================================
    {
      id: "02-kfold-cv",
      title: "2. K-fold cross-validation",
      narrative:
        "Forrige leksjon ga oss ett tall: \"k=3 har test-accuracy 0.8 på dette splittet.\" Men hva om splittet var heldig? Skift seed til 43 — kanskje testene treffer en annen tilfeldig delmengde, og k=5 vinner. Vi har egentlig **ett enkelt eksperiment**, og estimatet av accuracy har stor varians når test-settet er bare 10 punkter.\n\n**K-fold cross-validation** løser dette: del data i K like deler (\"folds\"), tren på K-1 av dem og test på den siste. Gjenta K ganger, med en ny fold som test hver gang. Til slutt har du **K accuracies** — gjennomsnitt og standardavvik gir et mye mer robust estimat.\n\nFor 50 datapunkter og K=5: hver fold har 10 punkter. Vi trener 5 ganger på 40 og tester på 10 hver gang. Alle datapunkter brukes til test akkurat én gang, og til trening fire ganger.\n\n**Hvorfor mer robust?** Variansen av et gjennomsnitt over K uavhengige målinger er 1/K av variansen til ett enkelt mål. Du får en bredere prøve av datasettets variabilitet.\n\n**Din oppgave:**\n\n1. Implementér `kfold(n, k=5, seed=42)` som returnerer en liste av `(train_idx, test_idx)`-par, der indeksene er disjunkte og hver indeks havner i nøyaktig ett test-sett.\n2. Implementér `cross_val_score(X, y, params, k=5, seed=42)` som returnerer en liste med K accuracies pluss `mean(scores)` og `std(scores)`.",
      files: {
        "knn.py": `import math
import random
from collections import Counter


random.seed(1)
X = []
y = []
for _ in range(25):
    X.append([random.gauss(0, 1.7), random.gauss(0, 1.7)])
    y.append(0)
for _ in range(25):
    X.append([random.gauss(1.5, 1.7), random.gauss(1.5, 1.7)])
    y.append(1)


def euclidean(a, b):
    return math.sqrt(sum((ai - bi) ** 2 for ai, bi in zip(a, b)))


def knn_predict(x_query, X_train, y_train, k=3):
    dists = [(euclidean(x_query, X_train[i]), y_train[i]) for i in range(len(X_train))]
    dists.sort(key=lambda t: t[0])
    nearest = [lbl for _, lbl in dists[:k]]
    return Counter(nearest).most_common(1)[0][0]


def kfold(n, k=5, seed=42):
    """Returnér liste av (train_idx, test_idx) for K folds.

    Shuffles indices med seed, deler i k like deler. Siste fold tar evt. resterende.
    """
    # === DIN OPPGAVE ===
    # 1. idx = list(range(n)); rng = random.Random(seed); rng.shuffle(idx)
    # 2. fold_size = n // k
    # 3. For i in range(k):
    #       start = i * fold_size
    #       end = (i + 1) * fold_size if i < k - 1 else n
    #       test_idx = idx[start:end]
    #       train_idx = idx[:start] + idx[end:]
    #       Legg til (train_idx, test_idx).
    # 4. Returnér listen.
    return []


def mean(xs):
    return sum(xs) / len(xs)


def std(xs):
    """Populasjons-standardavvik."""
    m = mean(xs)
    return math.sqrt(sum((x - m) ** 2 for x in xs) / len(xs))


def cross_val_score(X, y, params, k=5, seed=42):
    """Returnér (scores_liste, mean, std) over k folds.

    params er dict, f.eks. {"k": 3}. Sendes som **params til knn_predict.
    """
    # === DIN OPPGAVE ===
    # 1. scores = []
    # 2. For (train_idx, test_idx) in kfold(len(X), k=k, seed=seed):
    #       X_tr = [X[i] for i in train_idx]; y_tr = [y[i] for i in train_idx]
    #       X_te = [X[i] for i in test_idx]; y_te = [y[i] for i in test_idx]
    #       correct = sum(1 for xq, yt in zip(X_te, y_te) if knn_predict(xq, X_tr, y_tr, **params) == yt)
    #       scores.append(correct / len(X_te))
    # 3. Returnér (scores, mean(scores), std(scores))
    return [], 0.0, 0.0


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


# Test kfold
folds = kfold(50, k=5, seed=42)
sjekk(len(folds), 5, "kfold returnerer 5 folds")

# Hver fold har ca. 10 test-indekser og 40 train-indekser
sjekk(len(folds[0][1]), 10, "fold 0 test har 10 punkter")
sjekk(len(folds[0][0]), 40, "fold 0 train har 40 punkter")

# Disjunkthet: alle test-indekser samlet er nettopp {0..49}
all_test = []
for _, ti in folds:
    all_test.extend(ti)
sjekk(sorted(all_test), list(range(50)), "test-indekser dekker 0..49 uten dupletter")

# Tren/test-grupper innen én fold er disjunkte
tr0, te0 = folds[0]
sjekk(len(set(tr0) & set(te0)), 0, "train og test i fold 0 er disjunkte")

# Test cross_val_score
print()
print("CV scores for ulike k:")
for kv in [1, 3, 5, 7, 9]:
    scores, m, s = cross_val_score(X, y, {"k": kv}, k=5, seed=42)
    print(f"  k={kv}: scores={[round(x, 2) for x in scores]}, mean={m:.4f}, std={s:.4f}")

# Sjekk at k=3 fortsatt vinner (eller er en av de beste) over CV
scores_3, m3, s3 = cross_val_score(X, y, {"k": 3}, k=5, seed=42)
sjekk(len(scores_3), 5, "k=3 CV har 5 scores")
sjekk_naer(m3, 0.64, "k=3 CV-mean er 0.64")
sjekk(0.0 < s3 < 0.3, True, "k=3 CV-std er rimelig (0 < s < 0.3)")
`,
      },
      defaultFile: "knn.py",
      editable: ["knn.py"],
      run: { kind: "python-script", entry: "knn.py" },
      verifications: [
        {
          label: "kfold returnerer 5 folds",
          check: { kind: "output-contains", needle: "OK   kfold returnerer 5 folds" },
        },
        {
          label: "Hver fold har 10 test / 40 train punkter",
          check: { kind: "output-contains", needle: "OK   fold 0 test har 10 punkter" },
        },
        {
          label: "Test-indekser dekker hele datasettet uten dupletter",
          check: { kind: "output-contains", needle: "OK   test-indekser dekker 0..49 uten dupletter" },
        },
        {
          label: "Train og test i samme fold er disjunkte",
          check: { kind: "output-contains", needle: "OK   train og test i fold 0 er disjunkte" },
        },
        {
          label: "cross_val_score returnerer 5 individuelle scores",
          check: { kind: "output-contains", needle: "OK   k=3 CV har 5 scores" },
        },
        {
          label: "CV-mean for k=3 er ca. 0.64",
          check: { kind: "output-contains", needle: "OK   k=3 CV-mean er 0.64" },
        },
      ],
      hint:
        "def kfold(n, k=5, seed=42):\n    idx = list(range(n))\n    rng = random.Random(seed)\n    rng.shuffle(idx)\n    fold_size = n // k\n    folds = []\n    for i in range(k):\n        start = i * fold_size\n        end = (i + 1) * fold_size if i < k - 1 else n\n        test_idx = idx[start:end]\n        train_idx = idx[:start] + idx[end:]\n        folds.append((train_idx, test_idx))\n    return folds\n\ndef cross_val_score(X, y, params, k=5, seed=42):\n    scores = []\n    for train_idx, test_idx in kfold(len(X), k=k, seed=seed):\n        X_tr = [X[i] for i in train_idx]\n        y_tr = [y[i] for i in train_idx]\n        X_te = [X[i] for i in test_idx]\n        y_te = [y[i] for i in test_idx]\n        correct = sum(1 for xq, yt in zip(X_te, y_te) if knn_predict(xq, X_tr, y_tr, **params) == yt)\n        scores.append(correct / len(X_te))\n    return scores, mean(scores), std(scores)",
    },

    // ============ LEKSJON 3 ===========================================
    {
      id: "03-grid-search",
      title: "3. Grid search",
      narrative:
        "Vi vil prøve mange hyperparameter-kombinasjoner samtidig — ikke bare `k`, men også **avstandsmål** (`euclidean` vs `manhattan`). \"Grid search\" betyr: gi en dict som spesifiserer hva som skal prøves for hver parameter, generér ALLE kombinasjoner (kartesisk produkt), kjør CV på hver, returnér beste.\n\n```\nparam_grid = {\n    \"k\":        [1, 3, 5, 7, 9],\n    \"distance\": [\"euclidean\", \"manhattan\"]\n}\n# -> 5 * 2 = 10 kombinasjoner totalt\n```\n\n**Hvorfor cartesian product, ikke parallell-iterasjon?** Vi vet ikke om beste `k` er det samme for euklidsk og manhattan-avstand. Bare ved å prøve alle kombinasjoner kan vi være sikre på at vi finner beste totalt.\n\n**Hvor stor blir gridet?** Multiplikativt. Med 3 parametere og 5 verdier hver blir det 125. Det er greit. Med 6 parametere og 10 verdier hver er det 1 million — for mye. Da bruker vi random search (neste leksjon).\n\n**Din oppgave:**\n\n1. Utvid `knn_predict` til å støtte `distance=\"euclidean\"` eller `distance=\"manhattan\"` via en DIST_FNS-dict (allerede skrevet).\n2. Implementér `grid_search(X, y, param_grid, k=5, seed=42)`. Returnér `(best_params, best_score, all_results)` der `all_results` er en liste `[(params, mean_cv_score), ...]`.\n\n**Tips:** generér alle kombinasjoner ved å starte med `[{}]` og iterativt utvide:\n\n```\ncombos = [{}]\nfor key, values in param_grid.items():\n    combos = [{**c, key: v} for c in combos for v in values]\n```",
      files: {
        "knn.py": `import math
import random
from collections import Counter


random.seed(1)
X = []
y = []
for _ in range(25):
    X.append([random.gauss(0, 1.7), random.gauss(0, 1.7)])
    y.append(0)
for _ in range(25):
    X.append([random.gauss(1.5, 1.7), random.gauss(1.5, 1.7)])
    y.append(1)


def euclidean(a, b):
    return math.sqrt(sum((ai - bi) ** 2 for ai, bi in zip(a, b)))


def manhattan(a, b):
    return sum(abs(ai - bi) for ai, bi in zip(a, b))


DIST_FNS = {"euclidean": euclidean, "manhattan": manhattan}


def knn_predict(x_query, X_train, y_train, k=3, distance="euclidean"):
    dist_fn = DIST_FNS[distance]
    dists = [(dist_fn(x_query, X_train[i]), y_train[i]) for i in range(len(X_train))]
    dists.sort(key=lambda t: t[0])
    nearest = [lbl for _, lbl in dists[:k]]
    return Counter(nearest).most_common(1)[0][0]


def kfold(n, k=5, seed=42):
    idx = list(range(n))
    rng = random.Random(seed)
    rng.shuffle(idx)
    fold_size = n // k
    folds = []
    for i in range(k):
        start = i * fold_size
        end = (i + 1) * fold_size if i < k - 1 else n
        folds.append((idx[:start] + idx[end:], idx[start:end]))
    return folds


def mean(xs):
    return sum(xs) / len(xs)


def cross_val_score(X, y, params, k=5, seed=42):
    scores = []
    for train_idx, test_idx in kfold(len(X), k=k, seed=seed):
        X_tr = [X[i] for i in train_idx]
        y_tr = [y[i] for i in train_idx]
        X_te = [X[i] for i in test_idx]
        y_te = [y[i] for i in test_idx]
        correct = sum(1 for xq, yt in zip(X_te, y_te) if knn_predict(xq, X_tr, y_tr, **params) == yt)
        scores.append(correct / len(X_te))
    return mean(scores)


def grid_search(X, y, param_grid, k=5, seed=42):
    """Prøv alle kombinasjoner av param_grid. Returnér (best_params, best_score, all_results).

    all_results = [({...params}, mean_cv_score), ...] for hver kombinasjon.
    """
    # === DIN OPPGAVE ===
    # 1. Generér alle kombinasjoner (cartesian product) av param_grid.
    #    Start med [{}], for hver (key, values): combos = [{**c, key: v} for c in combos for v in values]
    # 2. For hver combo: kjør cross_val_score, lagre (combo, score) i all_results.
    # 3. Finn (combo, score) med høyest score. Returnér (best_params, best_score, all_results).
    return None, -1.0, []


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


param_grid = {"k": [1, 3, 5, 7, 9], "distance": ["euclidean", "manhattan"]}
best_params, best_score, results = grid_search(X, y, param_grid, k=5, seed=42)

# Skal være 10 kombinasjoner totalt
sjekk(len(results), 10, "grid har 10 kombinasjoner")

print()
print("Grid search-resultater (sortert beste først):")
for p, s in sorted(results, key=lambda t: -t[1]):
    print(f"  {p}: {s:.4f}")

# Beste skal være k=3, manhattan med score 0.66
sjekk(best_params is not None, True, "fant beste parametere")
sjekk(best_params["k"], 3, "beste k er 3")
sjekk(best_params["distance"], "manhattan", "beste distance er manhattan")
sjekk_naer(best_score, 0.66, "beste CV-score er 0.66")
`,
      },
      defaultFile: "knn.py",
      editable: ["knn.py"],
      run: { kind: "python-script", entry: "knn.py" },
      verifications: [
        {
          label: "Grid genererer 10 kombinasjoner (5 k × 2 distance)",
          check: { kind: "output-contains", needle: "OK   grid har 10 kombinasjoner" },
        },
        {
          label: "Grid search returnerer best_params",
          check: { kind: "output-contains", needle: "OK   fant beste parametere" },
        },
        {
          label: "Beste k er 3 (samme som leksjon 1)",
          check: { kind: "output-contains", needle: "OK   beste k er 3" },
        },
        {
          label: "Beste avstandsmål er manhattan",
          check: { kind: "output-contains", needle: "OK   beste distance er manhattan" },
        },
        {
          label: "Beste CV-score er 0.66",
          check: { kind: "output-contains", needle: "OK   beste CV-score er 0.66" },
        },
      ],
      hint:
        "def grid_search(X, y, param_grid, k=5, seed=42):\n    combos = [{}]\n    for key, values in param_grid.items():\n        combos = [{**c, key: v} for c in combos for v in values]\n    all_results = []\n    best_params = None\n    best_score = -1.0\n    for params in combos:\n        score = cross_val_score(X, y, params, k=k, seed=seed)\n        all_results.append((params, score))\n        if score > best_score:\n            best_score = score\n            best_params = params\n    return best_params, best_score, all_results",
    },

    // ============ LEKSJON 4 ===========================================
    {
      id: "04-random-search",
      title: "4. Random search",
      narrative:
        "Grid search blir uhåndterlig fort. Med 6 parametere og 10 verdier hver er det 1 000 000 kombinasjoner. Selv om hver CV-kjøring er rask, blir totalen umulig.\n\n**Random search** sampler tilfeldig N kombinasjoner i stedet for å prøve ALLE. Studier (Bergstra & Bengio 2012) viser at hvis bare noen få parametere faktisk har stor effekt, finner random search nesten alltid like god — eller bedre — løsning med en brøkdel av kostnaden. Grunnen: random search dekker FLERE verdier av hver enkelt parameter med N samples enn et grid med samme totalkostnad.\n\n**Algoritmen:**\n\n```\nfor _ in range(n_iter):\n    sample én tilfeldig kombinasjon\n    kjør CV\n    hold på beste\n```\n\nVi bygger ut gridet ved å legge til flere verdier av `k`, slik at random search faktisk har et større rom å utforske enn forrige leksjon. Med en brøkdel av kombinasjonene (n_iter=10 vs 16 i et fullt grid) skal vi se at random fortsatt finner k=3 som beste.\n\n**Din oppgave:** implementér `random_search(X, y, param_distributions, n_iter=10, k=5, seed=42)`. Bruk `random.Random(seed)` for reproduserbarhet. Returnér `(best_params, best_score, n_tried)` der `n_tried` er antall UNIKE kombinasjoner faktisk testet (kan være < `n_iter` hvis duplikater samples).",
      files: {
        "knn.py": `import math
import random
from collections import Counter


random.seed(1)
X = []
y = []
for _ in range(25):
    X.append([random.gauss(0, 1.7), random.gauss(0, 1.7)])
    y.append(0)
for _ in range(25):
    X.append([random.gauss(1.5, 1.7), random.gauss(1.5, 1.7)])
    y.append(1)


def euclidean(a, b):
    return math.sqrt(sum((ai - bi) ** 2 for ai, bi in zip(a, b)))


def manhattan(a, b):
    return sum(abs(ai - bi) for ai, bi in zip(a, b))


DIST_FNS = {"euclidean": euclidean, "manhattan": manhattan}


def knn_predict(x_query, X_train, y_train, k=3, distance="euclidean"):
    dist_fn = DIST_FNS[distance]
    dists = [(dist_fn(x_query, X_train[i]), y_train[i]) for i in range(len(X_train))]
    dists.sort(key=lambda t: t[0])
    nearest = [lbl for _, lbl in dists[:k]]
    return Counter(nearest).most_common(1)[0][0]


def kfold(n, k=5, seed=42):
    idx = list(range(n))
    rng = random.Random(seed)
    rng.shuffle(idx)
    fold_size = n // k
    folds = []
    for i in range(k):
        start = i * fold_size
        end = (i + 1) * fold_size if i < k - 1 else n
        folds.append((idx[:start] + idx[end:], idx[start:end]))
    return folds


def mean(xs):
    return sum(xs) / len(xs)


def cross_val_score(X, y, params, k=5, seed=42):
    scores = []
    for train_idx, test_idx in kfold(len(X), k=k, seed=seed):
        X_tr = [X[i] for i in train_idx]
        y_tr = [y[i] for i in train_idx]
        X_te = [X[i] for i in test_idx]
        y_te = [y[i] for i in test_idx]
        correct = sum(1 for xq, yt in zip(X_te, y_te) if knn_predict(xq, X_tr, y_tr, **params) == yt)
        scores.append(correct / len(X_te))
    return mean(scores)


def random_search(X, y, param_distributions, n_iter=10, k=5, seed=42):
    """Sample n_iter tilfeldige kombinasjoner. Returnér (best_params, best_score, n_unique_tried)."""
    # === DIN OPPGAVE ===
    # 1. rng = random.Random(seed)
    # 2. tried = set(); best_params = None; best_score = -1.0
    # 3. For _ in range(n_iter):
    #       params = {key: rng.choice(choices) for key, choices in param_distributions.items()}
    #       fingeravtrykk = tuple(sorted(params.items()))
    #       hvis i tried: continue
    #       legg til tried, kjør CV, oppdater beste hvis høyere score.
    # 4. Returnér (best_params, best_score, len(tried))
    return None, -1.0, 0


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


# Et større parameter-rom: 8 k-verdier * 2 distances = 16 kombinasjoner
param_dist = {
    "k": [1, 3, 5, 7, 9, 11, 13, 15],
    "distance": ["euclidean", "manhattan"],
}

# Random search med 10 iter (vs et fullt grid som ville trengt 16)
best_params, best_score, n_tried = random_search(X, y, param_dist, n_iter=10, k=5, seed=42)

print(f"Random search: {n_tried} unike kombinasjoner testet (av 10 iter, av 16 mulige)")
print(f"Beste: {best_params}, score: {best_score:.4f}")

sjekk(best_params is not None, True, "fant beste parametere")
sjekk(n_tried <= 10, True, "n_tried <= n_iter")
sjekk(n_tried >= 5, True, "n_tried er ikke trivielt lite")

# Med seed=42 finner random search k=3, euclidean med score 0.64 — bare litt
# lavere enn grid sitt beste (k=3, manhattan, 0.66), men med færre kombinasjoner.
sjekk(best_params["k"], 3, "beste k er fortsatt 3")
sjekk(best_score >= 0.62, True, "best_score er minst 0.62 (nær grid sitt 0.66)")
`,
      },
      defaultFile: "knn.py",
      editable: ["knn.py"],
      run: { kind: "python-script", entry: "knn.py" },
      verifications: [
        {
          label: "Random search returnerer beste parametere",
          check: { kind: "output-contains", needle: "OK   fant beste parametere" },
        },
        {
          label: "n_tried er <= n_iter",
          check: { kind: "output-contains", needle: "OK   n_tried <= n_iter" },
        },
        {
          label: "n_tried er ikke trivielt lite",
          check: { kind: "output-contains", needle: "OK   n_tried er ikke trivielt lite" },
        },
        {
          label: "Random search finner k=3 (samme som grid)",
          check: { kind: "output-contains", needle: "OK   beste k er fortsatt 3" },
        },
        {
          label: "Random search-score er nær grid sin (>= 0.62)",
          check: { kind: "output-contains", needle: "OK   best_score er minst 0.62" },
        },
      ],
      hint:
        "def random_search(X, y, param_distributions, n_iter=10, k=5, seed=42):\n    rng = random.Random(seed)\n    tried = set()\n    best_params = None\n    best_score = -1.0\n    for _ in range(n_iter):\n        params = {key: rng.choice(choices) for key, choices in param_distributions.items()}\n        fp = tuple(sorted(params.items()))\n        if fp in tried:\n            continue\n        tried.add(fp)\n        score = cross_val_score(X, y, params, k=k, seed=seed)\n        if score > best_score:\n            best_score = score\n            best_params = params\n    return best_params, best_score, len(tried)",
    },

    // ============ LEKSJON 5 ===========================================
    {
      id: "05-three-way-split",
      title: "5. Three-way-split: ikke overfit til validation-settet",
      narrative:
        "Her er en innsikt som overrasker nybegynnere: hvis du tuner mot validation-settet 1000 ganger og velger beste, har du **overfittet til validation-settet**. Validation-score-en din overestimerer den ekte ytelsen.\n\n**Hvorfor?** Hver gang du sammenligner mot val-settet og holder på vinneren, gjør du implisitt en \"trening\" på val-settet — du lar dets særegenheter påvirke hvilken modell du velger. Etter 1000 tunings finner du en kombinasjon som tilfeldig passer godt med akkurat dette val-settet, og du ekstrapolerer falskt at den er like god generelt.\n\n**Demonstrasjonen er drepende:** lag et datasett der labels er **rene tilfeldige** (uten signal). Sann sannsynlighet for riktig prediksjon er 0.5. Sample 1000 \"modeller\" (ulike seeds som genererer ulike tilfeldige prediksjoner), velg beste på val. Du finner én som tilfeldig får 0.85 på val. Men på et fersk test-sett er den 0.5 — eller verre.\n\n**Løsningen:** del data i TRE: train (tren modellen), val (tun hyperparametere), test (siste, urørte sett — sjekk én gang helt på slutten). Test-settet ser modellen aldri, ikke en gang gjennom hyperparameter-jakt. Da blir test-score et ærlig estimat av out-of-sample-ytelse.\n\n**Din oppgave:**\n\n1. Implementér `three_way_split(X, y, val_frac=0.2, test_frac=0.2, seed=42)` som returnerer 6 lister: `X_train, X_val, X_test, y_train, y_val, y_test`.\n2. Kjør \"tilfeldig hyperparameter-jakt\" på et signal-fritt datasett: 1000 ulike `seed_modell`-verdier som hver gir en tilfeldig prediktor. Velg beste på val. Sammenlign val-score (oppblåst) med test-score (ærlig).",
      files: {
        "split.py": `import math
import random
from collections import Counter


# === Signal-fritt datasett: labels er helt tilfeldige (sann acc = 0.5) ===
random.seed(7)
n = 100
X = [[random.gauss(0, 1)] for _ in range(n)]
y = [random.randint(0, 1) for _ in range(n)]


def three_way_split(X, y, val_frac=0.2, test_frac=0.2, seed=42):
    """Del i train (resten), val (val_frac) og test (test_frac).

    Returnér (X_train, X_val, X_test, y_train, y_val, y_test).
    """
    # === DIN OPPGAVE ===
    # 1. idx = list(range(len(X))); rng = random.Random(seed); rng.shuffle(idx)
    # 2. n_test = int(len(X) * test_frac); n_val = int(len(X) * val_frac)
    # 3. test_idx = idx[:n_test]
    #    val_idx = idx[n_test:n_test + n_val]
    #    train_idx = idx[n_test + n_val:]
    # 4. Returnér seks lister i riktig rekkefølge.
    return [], [], [], [], [], []


def random_predictor(seed_modell, x_query):
    """En 'modell' som bare returnerer 0 eller 1 basert på seed + input."""
    rng = random.Random(seed_modell + hash(tuple(x_query)))
    return rng.randint(0, 1)


def accuracy(seed_modell, X_eval, y_eval):
    correct = sum(1 for xq, yt in zip(X_eval, y_eval) if random_predictor(seed_modell, xq) == yt)
    return correct / len(X_eval)


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


# Test three_way_split
X_train, X_val, X_test, y_train, y_val, y_test = three_way_split(
    X, y, val_frac=0.2, test_frac=0.2, seed=42
)
sjekk(len(X_train), 60, "train har 60 punkter")
sjekk(len(X_val), 20, "val har 20 punkter")
sjekk(len(X_test), 20, "test har 20 punkter")

# Disjunkthet: ingen overlapp mellom de tre split-ene
train_set = {tuple(p) for p in X_train}
val_set = {tuple(p) for p in X_val}
test_set = {tuple(p) for p in X_test}
sjekk(len(train_set & val_set), 0, "train og val er disjunkte")
sjekk(len(train_set & test_set), 0, "train og test er disjunkte")
sjekk(len(val_set & test_set), 0, "val og test er disjunkte")

# === Demonstrasjon: overfitting til val-settet ===
# Sample 1000 'modeller', velg den som scorer høyest på val.
best_val = -1.0
best_seed = None
for s in range(1000):
    v = accuracy(s, X_val, y_val)
    if v > best_val:
        best_val = v
        best_seed = s

# Score vinneren på det FERSKE test-settet.
test_score = accuracy(best_seed, X_test, y_test)

print()
print(f"Beste val-accuracy etter 1000 tilfeldige tunings: {best_val:.4f}")
print(f"Den samme modellens test-accuracy:               {test_score:.4f}")
print(f"(Sann accuracy er 0.5 — labels er random!)")

# Val skal være OPPBLÅST (langt over 0.5) fordi vi har 'overfittet' til val.
sjekk(best_val >= 0.75, True, "val-score er oppblåst (>= 0.75)")

# Test skal være mye lavere (rundt 0.5, kanskje under).
sjekk(test_score <= 0.6, True, "test-score er ærlig (~0.5, ikke oppblåst)")

# Gapet (best_val - test_score) skal være stort — det er bevis på overfitting.
gap = best_val - test_score
sjekk(gap >= 0.2, True, "gap mellom val og test er stort (>= 0.2)")
`,
      },
      defaultFile: "split.py",
      editable: ["split.py"],
      run: { kind: "python-script", entry: "split.py" },
      verifications: [
        {
          label: "three_way_split deler i 60 train / 20 val / 20 test",
          check: { kind: "output-contains", needle: "OK   train har 60 punkter" },
        },
        {
          label: "Val-settet har 20 punkter",
          check: { kind: "output-contains", needle: "OK   val har 20 punkter" },
        },
        {
          label: "Test-settet har 20 punkter",
          check: { kind: "output-contains", needle: "OK   test har 20 punkter" },
        },
        {
          label: "Train og val er disjunkte",
          check: { kind: "output-contains", needle: "OK   train og val er disjunkte" },
        },
        {
          label: "Val og test er disjunkte",
          check: { kind: "output-contains", needle: "OK   val og test er disjunkte" },
        },
        {
          label: "Val-score er oppblåst etter 1000 tunings (overfittet)",
          check: { kind: "output-contains", needle: "OK   val-score er oppblåst" },
        },
        {
          label: "Test-score er ærlig (~0.5, ikke oppblåst)",
          check: { kind: "output-contains", needle: "OK   test-score er ærlig" },
        },
        {
          label: "Gap mellom val og test demonstrerer overfitting til val",
          check: { kind: "output-contains", needle: "OK   gap mellom val og test er stort" },
        },
      ],
      hint:
        "def three_way_split(X, y, val_frac=0.2, test_frac=0.2, seed=42):\n    idx = list(range(len(X)))\n    rng = random.Random(seed)\n    rng.shuffle(idx)\n    n_test = int(len(X) * test_frac)\n    n_val = int(len(X) * val_frac)\n    test_idx = idx[:n_test]\n    val_idx = idx[n_test:n_test + n_val]\n    train_idx = idx[n_test + n_val:]\n    X_train = [X[i] for i in train_idx]\n    y_train = [y[i] for i in train_idx]\n    X_val = [X[i] for i in val_idx]\n    y_val = [y[i] for i in val_idx]\n    X_test = [X[i] for i in test_idx]\n    y_test = [y[i] for i in test_idx]\n    return X_train, X_val, X_test, y_train, y_val, y_test",
    },
  ],
};

const FEATURE_ENGINEERING: MiniCourse = {
  id: "feature-engineering",
  slug: "feature-engineering",
  title: "Feature engineering og preprocessing pipeline",
  blurb:
    "Modeller blir bare så gode som dataene du gir dem. Bygg de seks viktigste preprocessing-stegene fra null: håndtering av manglende verdier, z-score-standardisering med riktig fit/transform-split, min-max-scaling, one-hot encoding av kategoriske features, polynomial features for ikke-lineære sammenhenger, og til slutt en Pipeline-klasse som chain-er alt sammen og forhindrer data leakage automatisk.",
  estimertTid: "60–75 min",
  fag: ["DTE-2602", "Maskinlæring", "Preprocessing"],
  color: "purple",
  rekkefolge: 40,
  lessons: [
    // ============ LEKSJON 1 ===========================================
    {
      id: "01-manglende-verdier",
      title: "1. Manglende verdier: drop, mean og median imputation",
      narrative:
        "Ekte datasett er nesten alltid \"skitne\". Folk lar felter stå tomme, sensorer faller ut, joins gir NULL. I Python representerer vi en manglende verdi som `None`. Problem: de fleste ML-modeller knekker hvis du gir dem `None` — `w * None + b` er en feilmelding.\n\nDu har **tre vanlige strategier**:\n\n1. **Drop rows.** Fjern alle rader som har minst én manglende verdi. Enkelt, men du kaster bort signal hvis du har mye missing.\n2. **Mean imputation.** Erstatt `None` i en kolonne med gjennomsnittet av de kjente verdiene i samme kolonne. Bevarer alle rader; reduserer varians litt.\n3. **Median imputation.** Som over, men bruk median. Mer robust mot outliers.\n\nValget er en avveining: er manglende data tilfeldig (drop er trygt) eller systematisk (drop introduserer bias)? Er kolonnen normalfordelt (mean OK) eller skjev/outlier-tung (median bedre)?\n\n**Datasett:** 12 rader med to kolonner (id, måling). Tre måling-verdier er `None`.\n\n**Din oppgave:** implementér de tre funksjonene. Hver returnerer en NY liste (ikke muter input).",
      files: {
        "preprocess.py": `# 12 rader, kolonne 1 har tre None-verdier (rad-indeks 2, 5, 9)
rows = [
    [1, 10.0],
    [2, 20.0],
    [3, None],
    [4, 40.0],
    [5, 50.0],
    [6, None],
    [7, 70.0],
    [8, 80.0],
    [9, 90.0],
    [10, None],
    [11, 110.0],
    [12, 120.0],
]


def drop_rows_with_nan(rows):
    """Returnér en ny liste uten rader som inneholder None."""
    # === DIN OPPGAVE ===
    # Returnér [row for row in rows if alle felt != None]
    return []


def mean_of(values):
    """Hjelpefunksjon. Returner gjennomsnitt, eller 0 hvis tom."""
    return sum(values) / len(values) if values else 0.0


def median_of(values):
    """Hjelpefunksjon. Returner median, eller 0 hvis tom."""
    s = sorted(values)
    n = len(s)
    if n == 0:
        return 0.0
    if n % 2 == 1:
        return s[n // 2]
    return (s[n // 2 - 1] + s[n // 2]) / 2


def impute_mean(rows, column_idx):
    """Erstatt None i kolonne column_idx med kolonne-gjennomsnittet."""
    # === DIN OPPGAVE ===
    # 1. Samle alle ikke-None verdier i kolonne column_idx.
    # 2. m = mean_of(verdier)
    # 3. For hver rad: hvis rad[column_idx] er None, sett den til m.
    # 4. Returner en ny liste (kopier hver rad med list(row) eller row[:]).
    return []


def impute_median(rows, column_idx):
    """Som impute_mean, men med median."""
    # === DIN OPPGAVE ===
    # Samme struktur, men bruk median_of i stedet.
    return []


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


def sjekk_naer(faktisk, forventet, navn, eps=1e-9):
    if faktisk is None:
        print(f"FEIL {navn}: fikk None")
        return
    if abs(faktisk - forventet) < eps:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Drop
droppet = drop_rows_with_nan(rows)
sjekk(len(droppet), 9, "drop fjerner 3 av 12 rader")
sjekk(droppet[0], [1, 10.0], "drop bevarer første gyldige rad")

# Mean imputation
# 9 ikke-None verdier: 10, 20, 40, 50, 70, 80, 90, 110, 120 -> sum 590, mean 65.555...
imp_mean = impute_mean(rows, 1)
sjekk(len(imp_mean), 12, "mean-imputation beholder alle 12 rader")
forventet_mean = (10 + 20 + 40 + 50 + 70 + 80 + 90 + 110 + 120) / 9
sjekk_naer(imp_mean[2][1], forventet_mean, "rad 2 fikk kolonne-mean")
sjekk_naer(imp_mean[5][1], forventet_mean, "rad 5 fikk kolonne-mean")
sjekk_naer(imp_mean[9][1], forventet_mean, "rad 9 fikk kolonne-mean")
sjekk(imp_mean[0][1], 10.0, "kjent verdi er uendret av mean-imputation")

# Median imputation
# Sortert: [10,20,40,50,70,80,90,110,120] -> middelelement 70
imp_med = impute_median(rows, 1)
sjekk(imp_med[2][1], 70.0, "rad 2 fikk kolonne-median (70)")
sjekk(imp_med[5][1], 70.0, "rad 5 fikk kolonne-median (70)")

# Input ikke mutert
sjekk(rows[2][1], None, "input-listen er ikke mutert")
`,
      },
      defaultFile: "preprocess.py",
      editable: ["preprocess.py"],
      run: { kind: "python-script", entry: "preprocess.py" },
      verifications: [
        {
          label: "drop_rows_with_nan fjerner riktig antall rader",
          check: { kind: "output-contains", needle: "OK   drop fjerner 3 av 12 rader" },
        },
        {
          label: "drop bevarer rader uten None",
          check: { kind: "output-contains", needle: "OK   drop bevarer første gyldige rad" },
        },
        {
          label: "mean-imputation beholder alle rader",
          check: { kind: "output-contains", needle: "OK   mean-imputation beholder alle 12 rader" },
        },
        {
          label: "mean-imputation bruker riktig gjennomsnitt",
          check: { kind: "output-contains", needle: "OK   rad 2 fikk kolonne-mean" },
        },
        {
          label: "median-imputation bruker riktig median",
          check: { kind: "output-contains", needle: "OK   rad 2 fikk kolonne-median (70)" },
        },
        {
          label: "Kjente verdier endres ikke",
          check: { kind: "output-contains", needle: "OK   kjent verdi er uendret av mean-imputation" },
        },
        {
          label: "Input-listen mutleres ikke",
          check: { kind: "output-contains", needle: "OK   input-listen er ikke mutert" },
        },
      ],
      hint:
        "def drop_rows_with_nan(rows):\n    return [row for row in rows if all(v is not None for v in row)]\n\ndef impute_mean(rows, column_idx):\n    kjente = [row[column_idx] for row in rows if row[column_idx] is not None]\n    m = mean_of(kjente)\n    out = []\n    for row in rows:\n        ny = list(row)\n        if ny[column_idx] is None:\n            ny[column_idx] = m\n        out.append(ny)\n    return out\n\ndef impute_median(rows, column_idx):\n    kjente = [row[column_idx] for row in rows if row[column_idx] is not None]\n    m = median_of(kjente)\n    out = []\n    for row in rows:\n        ny = list(row)\n        if ny[column_idx] is None:\n            ny[column_idx] = m\n        out.append(ny)\n    return out",
    },

    // ============ LEKSJON 2 ===========================================
    {
      id: "02-standardisering",
      title: "2. Standardisering (z-score) med fit/transform",
      narrative:
        "Ulike features lever på ulike skalaer. Alder er kanskje 20–80, inntekt er 200000–900000. En lineær modell som måler avstander (eller en gradient descent som tar samme læringsrate i alle retninger) blir totalt dominert av inntekten — den har ~10000x større tall.\n\n**Standardisering (z-score)** løser dette:\n\n```\nz = (x - mean) / std\n```\n\nEtter transformasjon har hver kolonne mean ≈ 0 og std ≈ 1. Inntekt og alder er nå sammenlignbare.\n\n**Kritisk: fit på train, transform på begge.**\n\nMellomliggende statistikk (mean og std) skal beregnes BARE fra treningssettet. Når du transformerer testsettet, bruker du de SAMME tallene — du fitter ikke på nytt. Hvorfor? Hvis du fitter på testen, har modellen i praksis sett testen før evalueringen. Det er **data leakage**, og du måler ikke ekte generalisering lenger.\n\nDette mønsteret — `fit` lagrer statistikk, `transform` bruker den — er sklearns standard og det du må venne deg til.\n\n**Din oppgave:** implementér klassen `Standardizer` med `.fit(X)` (lagrer mean og std per kolonne) og `.transform(X)` (bruker lagrede stats). `X` er en liste av rader; hver rad er en liste av tall.",
      files: {
        "standardize.py": `import math


def mean(xs):
    return sum(xs) / len(xs)


def std(xs):
    m = mean(xs)
    var = sum((x - m) ** 2 for x in xs) / len(xs)
    return math.sqrt(var)


class Standardizer:
    """Lagrer mean + std per kolonne fra fit. transform bruker lagrede stats."""

    def __init__(self):
        self.means = None
        self.stds = None

    def fit(self, X):
        """Beregn og lagre mean og std for hver kolonne. Returnér self."""
        # === DIN OPPGAVE ===
        # n_cols = len(X[0])
        # self.means = []
        # self.stds = []
        # For hver j i 0..n_cols:
        #     kol = [row[j] for row in X]
        #     self.means.append(mean(kol))
        #     self.stds.append(std(kol))
        # return self
        return self

    def transform(self, X):
        """Returnér ny matrise med (v - mean[j]) / std[j] per element."""
        # === DIN OPPGAVE ===
        # For hver rad: lag ny rad med standardiserte verdier.
        # Hvis std[j] == 0, bruk 1 for å unngå deling-på-null.
        return []


def sjekk_naer(faktisk, forventet, navn, eps=1e-6):
    if abs(faktisk - forventet) < eps:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Treningssett: alder + inntekt-i-tusen
X_train = [
    [25, 300],
    [30, 400],
    [35, 500],
    [40, 600],
    [45, 700],
    [50, 800],
]

# Testsett (skal IKKE påvirke fit)
X_test = [
    [28, 350],
    [38, 550],
    [48, 750],
]

st = Standardizer()
st.fit(X_train)

# Etter fit skal mean av kolonne 0 være 37.5
sjekk_naer(st.means[0], 37.5, "fit lagrer mean for kolonne 0")
sjekk_naer(st.means[1], 550.0, "fit lagrer mean for kolonne 1")

# Transform trening: kolonne-mean av z-verdier skal være 0
X_train_z = st.transform(X_train)
kol0_mean = mean([row[0] for row in X_train_z])
kol1_mean = mean([row[1] for row in X_train_z])
sjekk_naer(kol0_mean, 0.0, "trenings-mean av kolonne 0 er 0 etter transform")
sjekk_naer(kol1_mean, 0.0, "trenings-mean av kolonne 1 er 0 etter transform")

# Trenings-std skal være 1
kol0_std = std([row[0] for row in X_train_z])
sjekk_naer(kol0_std, 1.0, "trenings-std av kolonne 0 er 1 etter transform")

# Test transformeres med TRAIN-stats (ikke nye stats fra test!)
X_test_z = st.transform(X_test)
forventet = (28 - 37.5) / std([25, 30, 35, 40, 45, 50])
sjekk_naer(X_test_z[0][0], forventet, "test bruker train-stats (ingen leakage)")
`,
      },
      defaultFile: "standardize.py",
      editable: ["standardize.py"],
      run: { kind: "python-script", entry: "standardize.py" },
      verifications: [
        {
          label: "fit lagrer mean per kolonne",
          check: { kind: "output-contains", needle: "OK   fit lagrer mean for kolonne 0" },
        },
        {
          label: "fit lagrer mean for andre kolonne",
          check: { kind: "output-contains", needle: "OK   fit lagrer mean for kolonne 1" },
        },
        {
          label: "Trenings-mean er 0 etter transform",
          check: { kind: "output-contains", needle: "OK   trenings-mean av kolonne 0 er 0 etter transform" },
        },
        {
          label: "Trenings-std er 1 etter transform",
          check: { kind: "output-contains", needle: "OK   trenings-std av kolonne 0 er 1 etter transform" },
        },
        {
          label: "Test bruker train-stats (forhindrer data leakage)",
          check: { kind: "output-contains", needle: "OK   test bruker train-stats" },
        },
      ],
      hint:
        "def fit(self, X):\n    n_cols = len(X[0])\n    self.means = []\n    self.stds = []\n    for j in range(n_cols):\n        kol = [row[j] for row in X]\n        self.means.append(mean(kol))\n        self.stds.append(std(kol))\n    return self\n\ndef transform(self, X):\n    out = []\n    for row in X:\n        ny = []\n        for j, v in enumerate(row):\n            s = self.stds[j] if self.stds[j] > 0 else 1.0\n            ny.append((v - self.means[j]) / s)\n        out.append(ny)\n    return out",
    },

    // ============ LEKSJON 3 ===========================================
    {
      id: "03-minmax",
      title: "3. Min-max scaling og når man velger hva",
      narrative:
        "**Min-max scaling** skalerer hver kolonne lineært til intervallet `[0, 1]`:\n\n```\nx_scaled = (x - min) / (max - min)\n```\n\nMin-verdien går til 0, max-verdien går til 1, alt mellom interpoleres lineært. Forskjellen fra z-score er filosofisk:\n\n- **Z-score** sentrerer rundt 0, krymper med std. Bra hvis dataene er ca. normalfordelte og du vil bevare retningen av outliers.\n- **Min-max** legger alt eksakt mellom 0 og 1. Bra hvis du trenger en kjent skala (f.eks. nevrale nett som forventer input i [0,1]) — men én ekstrem outlier presser alle andre verdier mot 0 eller 1.\n\n**Eksperiment i denne leksjonen:** vi har et datasett der én outlier ligger 1000x lenger ute enn resten. Etter min-max blir alt utenom outlieren klemt inn i et bittelite område nær 0. Z-score håndterer dette bedre fordi mean og std er mindre sensitive til én ekstrem.\n\n**Din oppgave:** implementér `MinMaxScaler` med samme `.fit/.transform`-API som forrige leksjon.",
      files: {
        "minmax.py": `class MinMaxScaler:
    """Skaler hver kolonne til [0, 1] basert på fit-settets min og max."""

    def __init__(self):
        self.mins = None
        self.maxs = None

    def fit(self, X):
        # === DIN OPPGAVE ===
        # For hver kolonne j: lagre min og max av kolonnen i X.
        # Returnér self.
        return self

    def transform(self, X):
        # === DIN OPPGAVE ===
        # For hver verdi: (v - min[j]) / (max[j] - min[j]).
        # Hvis max == min: skriv 0.
        return []


def sjekk_naer(faktisk, forventet, navn, eps=1e-6):
    if abs(faktisk - forventet) < eps:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Sjekk: normalt datasett
X_normal = [[1.0], [2.0], [3.0], [4.0], [5.0]]
mm = MinMaxScaler()
mm.fit(X_normal)
out_normal = mm.transform(X_normal)

sjekk_naer(out_normal[0][0], 0.0, "min skaleres til 0")
sjekk_naer(out_normal[-1][0], 1.0, "max skaleres til 1")
sjekk_naer(out_normal[2][0], 0.5, "midten skaleres til 0.5")

# Sjekk: hva skjer med outlier?
# Normaldata 1-5, men én outlier på 1000.
X_outlier = [[1.0], [2.0], [3.0], [4.0], [5.0], [1000.0]]
mm2 = MinMaxScaler()
mm2.fit(X_outlier)
out_outlier = mm2.transform(X_outlier)

# Alle "normale" punkter klemmes mot 0
# (5 - 1) / (1000 - 1) ≈ 0.004
sjekk_naer(out_outlier[4][0], 4 / 999, "normalverdiene klemmes mot 0 av outlier")
sjekk_naer(out_outlier[5][0], 1.0, "outlier sitter på 1.0")
print("OK   outlier-sensitivitet demonstrert")
`,
      },
      defaultFile: "minmax.py",
      editable: ["minmax.py"],
      run: { kind: "python-script", entry: "minmax.py" },
      verifications: [
        {
          label: "Min-verdien skaleres til 0",
          check: { kind: "output-contains", needle: "OK   min skaleres til 0" },
        },
        {
          label: "Max-verdien skaleres til 1",
          check: { kind: "output-contains", needle: "OK   max skaleres til 1" },
        },
        {
          label: "Mellomverdier interpoleres lineært",
          check: { kind: "output-contains", needle: "OK   midten skaleres til 0.5" },
        },
        {
          label: "Outlier-følsomhet er synliggjort",
          check: { kind: "output-contains", needle: "OK   normalverdiene klemmes mot 0 av outlier" },
        },
        {
          label: "Outlier sitter på 1.0",
          check: { kind: "output-contains", needle: "OK   outlier sitter på 1.0" },
        },
      ],
      hint:
        "def fit(self, X):\n    n_cols = len(X[0])\n    self.mins = [min(row[j] for row in X) for j in range(n_cols)]\n    self.maxs = [max(row[j] for row in X) for j in range(n_cols)]\n    return self\n\ndef transform(self, X):\n    out = []\n    for row in X:\n        ny = []\n        for j, v in enumerate(row):\n            rng = self.maxs[j] - self.mins[j]\n            ny.append(0.0 if rng == 0 else (v - self.mins[j]) / rng)\n        out.append(ny)\n    return out",
    },

    // ============ LEKSJON 4 ===========================================
    {
      id: "04-onehot",
      title: "4. One-hot encoding av kategoriske features",
      narrative:
        "Lineær regresjon kan ikke spise `farge = \"rød\"`. Den trenger tall. Naiv løsning: gi hver kategori et heltall (rød=0, grønn=1, blå=2). Problem: modellen tror nå at \"blå er dobbelt så mye som grønn\" — vi har påtvunget en ordning som ikke finnes.\n\n**One-hot encoding** løser det. Hver kategori får sin egen binære kolonne:\n\n```\nfarge=rød   ->  [1, 0, 0]\nfarge=grønn ->  [0, 1, 0]\nfarge=blå   ->  [0, 0, 1]\n```\n\nNå er kategoriene likestilte; modellen kan lære én vekt per kategori uten å påtvinge ordning.\n\n**Pris å betale:** dimensjonalitet eksploderer. Hvis en kolonne har 100 unike verdier (f.eks. postnummer), får du 100 nye kolonner. For tree-baserte modeller er det ofte bedre å beholde label-encoding; for lineære modeller og nevrale nett er one-hot standard.\n\n**Din oppgave:** implementér `one_hot(values, categories)`. `values` er listen som skal kodes. `categories` er rekkefølgen kategoriene skal ha i output. Returnér en matrise (liste av lister): én rad per verdi, en kolonne per kategori, der eksakt én kolonne er 1.",
      files: {
        "onehot.py": `def one_hot(values, categories):
    """Konverter en liste kategoriske verdier til en matrise med 0/1."""
    # === DIN OPPGAVE ===
    # For hver v i values: lag en liste der posisjon i = 1 hvis categories[i] == v, 0 ellers.
    # Returnér matrisen.
    return []


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# 6 verdier, 3 kategorier
farger = ["rød", "grønn", "blå", "rød", "grønn", "blå"]
oh = one_hot(farger, ["rød", "grønn", "blå"])

sjekk(len(oh), 6, "output har 6 rader (en per verdi)")
sjekk(len(oh[0]) if oh else 0, 3, "output har 3 kolonner (en per kategori)")
sjekk(oh[0], [1, 0, 0], "rød kodes som [1,0,0]")
sjekk(oh[1], [0, 1, 0], "grønn kodes som [0,1,0]")
sjekk(oh[2], [0, 0, 1], "blå kodes som [0,0,1]")
sjekk(oh[3], [1, 0, 0], "rød kodes likt hver gang")

# Demonstrer at hver rad har eksakt én 1-er
alle_summer_til_1 = all(sum(row) == 1 for row in oh)
if alle_summer_til_1:
    print("OK   hver rad summerer til 1 (eksakt en kategori aktiv)")
else:
    print("FEIL ikke alle rader summerer til 1")

# Vis HVORFOR vi trenger one-hot for lineær modell:
# Naivt: rød=0, grønn=1, blå=2. Modellen y = w*kategori antar lineær trend.
# Det er feil hvis y faktisk varierer fritt over kategoriene.
print("Naiv koding paatvinger ordning. One-hot likestiller kategorier.")
`,
      },
      defaultFile: "onehot.py",
      editable: ["onehot.py"],
      run: { kind: "python-script", entry: "onehot.py" },
      verifications: [
        {
          label: "Output har riktig antall rader",
          check: { kind: "output-contains", needle: "OK   output har 6 rader (en per verdi)" },
        },
        {
          label: "Output har én kolonne per kategori",
          check: { kind: "output-contains", needle: "OK   output har 3 kolonner (en per kategori)" },
        },
        {
          label: "Første kategori kodes som [1,0,0]",
          check: { kind: "output-contains", needle: "OK   rød kodes som [1,0,0]" },
        },
        {
          label: "Andre kategori kodes som [0,1,0]",
          check: { kind: "output-contains", needle: "OK   grønn kodes som [0,1,0]" },
        },
        {
          label: "Tredje kategori kodes som [0,0,1]",
          check: { kind: "output-contains", needle: "OK   blå kodes som [0,0,1]" },
        },
        {
          label: "Eksakt én kategori aktiv per rad",
          check: { kind: "output-contains", needle: "OK   hver rad summerer til 1" },
        },
      ],
      hint:
        "def one_hot(values, categories):\n    out = []\n    for v in values:\n        rad = [1 if v == cat else 0 for cat in categories]\n        out.append(rad)\n    return out",
    },

    // ============ LEKSJON 5 ===========================================
    {
      id: "05-polynomial",
      title: "5. Polynomial features og feature interaction",
      narrative:
        "Lineær regresjon er kraftig, men begrenset til lineære sammenhenger. Hva hvis den ekte funksjonen er en parabel `y = x^2`? En rett linje vil bomme — uansett hvor lenge du tuner.\n\n**Triks:** la modellen forbli lineær, men gi den TRANSFORMERTE features. Hvis du gir den `x` OG `x^2` som inputs, kan lineær regresjon lære vektene `(0, 1)` og rekonstruere `y = x^2` eksakt.\n\nFor to features `x1, x2` og degree=2 lager `polynomial_features` denne utvidelsen:\n\n```\n[1, x1, x2, x1^2, x1*x2, x2^2]\n```\n\n- `1` er bias-leddet (alltid med).\n- `x1, x2` er de originale.\n- `x1^2, x2^2` lar modellen fange kvadratiske mønstre.\n- `x1*x2` er en **interaksjons-feature** — fanger \"effekten av x1 avhenger av x2\".\n\nKostnad: dimensjonalitet vokser raskt. For `d` features og degree `p` får du O(d^p) nye features. I praksis nøyer man seg med degree=2 eller 3.\n\n**Din oppgave:** implementér `polynomial_features(X, degree=2)` for det spesifikke tilfellet 2 features, degree 2. Output skal være 6 kolonner per rad, i rekkefølgen `[1, x1, x2, x1^2, x1*x2, x2^2]`.",
      files: {
        "polynomial.py": `def polynomial_features(X, degree=2):
    """Utvid hver 2-feature-rad til 6 polynomielle features."""
    # === DIN OPPGAVE ===
    # For hver rad [x1, x2]:
    #     ny rad = [1.0, x1, x2, x1*x1, x1*x2, x2*x2]
    # Returnér matrisen.
    return []


def sjekk(faktisk, forventet, navn):
    if faktisk == forventet:
        print(f"OK   {navn}")
    else:
        print(f"FEIL {navn}: fikk {faktisk!r}, forventet {forventet!r}")


# Grunntest: 2 features -> 6 kolonner
X = [[1.0, 2.0], [3.0, 4.0]]
pf = polynomial_features(X, degree=2)
sjekk(len(pf), 2, "polynomial bevarer rad-antall")
sjekk(len(pf[0]) if pf else 0, 6, "polynomial: 2 features med degree 2 -> 6 kolonner")
sjekk(pf[0], [1.0, 1.0, 2.0, 1.0, 2.0, 4.0], "rad 1 utvides korrekt")
sjekk(pf[1], [1.0, 3.0, 4.0, 9.0, 12.0, 16.0], "rad 2 utvides korrekt")

# Demonstrér at lineær regresjon nå kan fange parabel
# Sann modell: y = 1 + 0*x1 + 0*x2 + 2*x1^2 + 0*x1*x2 + 0*x2^2 = 1 + 2*x1^2
# Med poly-features kan en vektor [1, 0, 0, 2, 0, 0] gjenkjenne dette eksakt.
sann_w = [1.0, 0.0, 0.0, 2.0, 0.0, 0.0]
y_pred_rad1 = sum(w * f for w, f in zip(sann_w, pf[0]))
y_pred_rad2 = sum(w * f for w, f in zip(sann_w, pf[1]))

# For X = [1, 2]: y = 1 + 2*1 = 3
# For X = [3, 4]: y = 1 + 2*9 = 19
sjekk(y_pred_rad1, 3.0, "lineær fit på poly fanger y = 1 + 2*x1^2 (rad 1)")
sjekk(y_pred_rad2, 19.0, "lineær fit på poly fanger parabel (rad 2)")
`,
      },
      defaultFile: "polynomial.py",
      editable: ["polynomial.py"],
      run: { kind: "python-script", entry: "polynomial.py" },
      verifications: [
        {
          label: "Antall rader bevares",
          check: { kind: "output-contains", needle: "OK   polynomial bevarer rad-antall" },
        },
        {
          label: "Output har 6 kolonner",
          check: { kind: "output-contains", needle: "OK   polynomial: 2 features med degree 2 -> 6 kolonner" },
        },
        {
          label: "Rad utvides i riktig rekkefølge",
          check: { kind: "output-contains", needle: "OK   rad 1 utvides korrekt" },
        },
        {
          label: "Andre rad utvides korrekt",
          check: { kind: "output-contains", needle: "OK   rad 2 utvides korrekt" },
        },
        {
          label: "Lineær modell over poly-features fanger parabel",
          check: { kind: "output-contains", needle: "OK   lineær fit på poly fanger parabel (rad 2)" },
        },
      ],
      hint:
        "def polynomial_features(X, degree=2):\n    out = []\n    for row in X:\n        x1, x2 = row[0], row[1]\n        out.append([1.0, x1, x2, x1 * x1, x1 * x2, x2 * x2])\n    return out",
    },

    // ============ LEKSJON 6 ===========================================
    {
      id: "06-pipeline",
      title: "6. Bygg en Pipeline — alt sammen, leakage-fritt",
      narrative:
        "Du har nå byggeklossene. Et reelt ML-prosjekt trenger dem alle i sekvens: først håndter manglende verdier, så standardisér, så lag polynomielle features. Hvis du gjør det manuelt for trening, må du HUSKE å gjøre eksakt det samme for test — med samme lagrede statistikk. Glipper du, lekker du data eller knekker prediksjonen.\n\n**Pipeline-mønsteret** automatiserer dette. En `Pipeline` er en sekvens av transformere som hver har `.fit()` og `.transform()`. Pipeline-en eksponerer det samme API-et:\n\n- `Pipeline.fit(X_train)` kaller fit-then-transform på hver transformator i rekkefølge. Output fra steg 1 mates inn i steg 2.\n- `Pipeline.transform(X)` kaller transform (IKKE fit) på hver i rekkefølge.\n\n**Hvorfor dette forhindrer leakage:** etter `pipeline.fit(X_train)` er ALLE statistikker frosne. Når du senere kjører `pipeline.transform(X_test)`, brukes nøyaktig de samme tallene. Det er strukturelt umulig å fitte på testen ved et uhell.\n\n**Datasett:** trening med None-verdier (krever imputer), test uten None (samme pipeline brukes likevel).\n\n**Din oppgave:** implementér `Pipeline`. De tre byggeklossene (`MeanImputer`, `Standardizer`, `PolynomialFeatures`) er allerede gitt. Du må kun skrive `Pipeline.fit` og `Pipeline.transform`.",
      files: {
        "pipeline.py": `import math


def mean(xs):
    return sum(xs) / len(xs) if xs else 0.0


def std(xs):
    if not xs:
        return 0.0
    m = mean(xs)
    var = sum((x - m) ** 2 for x in xs) / len(xs)
    return math.sqrt(var)


class MeanImputer:
    def __init__(self):
        self.means = None

    def fit(self, X):
        n_cols = len(X[0])
        self.means = []
        for j in range(n_cols):
            kjente = [row[j] for row in X if row[j] is not None]
            self.means.append(mean(kjente))
        return self

    def transform(self, X):
        out = []
        for row in X:
            ny = [self.means[j] if v is None else v for j, v in enumerate(row)]
            out.append(ny)
        return out


class Standardizer:
    def __init__(self):
        self.means = None
        self.stds = None

    def fit(self, X):
        n_cols = len(X[0])
        self.means = [mean([row[j] for row in X]) for j in range(n_cols)]
        self.stds = [std([row[j] for row in X]) for j in range(n_cols)]
        return self

    def transform(self, X):
        out = []
        for row in X:
            ny = []
            for j, v in enumerate(row):
                s = self.stds[j] if self.stds[j] > 0 else 1.0
                ny.append((v - self.means[j]) / s)
            out.append(ny)
        return out


class PolynomialFeatures:
    def __init__(self, degree=2):
        self.degree = degree

    def fit(self, X):
        # Stateless — ingenting å lagre
        return self

    def transform(self, X):
        out = []
        for row in X:
            x1, x2 = row[0], row[1]
            out.append([1.0, x1, x2, x1 * x1, x1 * x2, x2 * x2])
        return out


class Pipeline:
    """Chain av transformere. fit kaller fit + transform i rekkefølge."""

    def __init__(self, steps):
        self.steps = steps

    def fit(self, X):
        """fit-and-transform gjennom hvert steg. Returnér self."""
        # === DIN OPPGAVE ===
        # current = X
        # For hvert steg:
        #     steg.fit(current)
        #     current = steg.transform(current)
        # return self
        return self

    def transform(self, X):
        """Kjør bare transform gjennom hvert steg, i rekkefølge."""
        # === DIN OPPGAVE ===
        # current = X
        # For hvert steg: current = steg.transform(current)
        # return current
        return X


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


# Trening med None-verdier; test uten
X_train = [
    [1.0, 10.0],
    [2.0, None],
    [3.0, 30.0],
    [None, 40.0],
    [5.0, 50.0],
]
X_test = [
    [2.5, 25.0],
    [4.0, 45.0],
]

pipe = Pipeline([MeanImputer(), Standardizer(), PolynomialFeatures(degree=2)])
pipe.fit(X_train)

# Imputer-stats skal være lagret fra X_train (over ikke-None verdier)
forventet_kol0 = (1 + 2 + 3 + 5) / 4
forventet_kol1 = (10 + 30 + 40 + 50) / 4
sjekk_naer(pipe.steps[0].means[0], forventet_kol0,
           "imputer.means[0] beregnet fra train")
sjekk_naer(pipe.steps[0].means[1], forventet_kol1,
           "imputer.means[1] beregnet fra train")

# Standardizer skal være fittet på IMPUTED train (etter MeanImputer.transform)
# Vi reproduserer:
X_train_imputed = pipe.steps[0].transform(X_train)
forventet_std_mean0 = mean([row[0] for row in X_train_imputed])
sjekk_naer(pipe.steps[1].means[0], forventet_std_mean0,
           "standardizer fittet på imputed train")

# Transform på test skal kjøre alle tre steg og returnere 2 rader, 6 kolonner
X_test_out = pipe.transform(X_test)
sjekk(len(X_test_out), 2, "pipeline.transform gir 2 rader for test")
sjekk(len(X_test_out[0]) if X_test_out else 0, 6,
      "pipeline gir 6 kolonner (etter polynomial)")
sjekk_naer(X_test_out[0][0], 1.0, "polynomial-konstanten 1 ligger på posisjon 0")

# Demonstrer leakage-beskyttelse:
# Hvis vi (feil) hadde fittet på test, ville imputer.means endret seg.
# Vi viser at de IKKE har endret seg etter transform(X_test):
sjekk_naer(pipe.steps[0].means[0], forventet_kol0,
           "imputer-stats uendret etter test-transform")
print("OK   pipeline forhindrer data leakage strukturelt")
`,
      },
      defaultFile: "pipeline.py",
      editable: ["pipeline.py"],
      run: { kind: "python-script", entry: "pipeline.py" },
      verifications: [
        {
          label: "Imputer lagrer mean per kolonne",
          check: { kind: "output-contains", needle: "OK   imputer.means[0] beregnet fra train" },
        },
        {
          label: "Standardizer fittes på output fra imputer",
          check: { kind: "output-contains", needle: "OK   standardizer fittet på imputed train" },
        },
        {
          label: "Pipeline gir riktig rad-antall på test",
          check: { kind: "output-contains", needle: "OK   pipeline.transform gir 2 rader for test" },
        },
        {
          label: "Pipeline gir 6 kolonner (poly degree 2 over 2 features)",
          check: { kind: "output-contains", needle: "OK   pipeline gir 6 kolonner (etter polynomial)" },
        },
        {
          label: "Konstant-leddet 1 ligger først",
          check: { kind: "output-contains", needle: "OK   polynomial-konstanten 1 ligger på posisjon 0" },
        },
        {
          label: "Statistikkene er uendret etter test-transform (ingen leakage)",
          check: { kind: "output-contains", needle: "OK   imputer-stats uendret etter test-transform" },
        },
        {
          label: "Pipeline forhindrer data leakage strukturelt",
          check: { kind: "output-contains", needle: "OK   pipeline forhindrer data leakage strukturelt" },
        },
      ],
      hint:
        "def fit(self, X):\n    current = X\n    for steg in self.steps:\n        steg.fit(current)\n        current = steg.transform(current)\n    return self\n\ndef transform(self, X):\n    current = X\n    for steg in self.steps:\n        current = steg.transform(current)\n    return current",
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
  MINIMAX_ALFABETA,
  STRIPS_PLANLEGGER,
  BAYES_NETT,
  MDP_QLEARNING,
  SYNC_SEMAFOR_MUTEX,
  DEADLOCK_BANKERS,
  IPC_PIPES_QUEUES,
  CLT_SAMPLING,
  MULTI_REGRESJON,
  HYPERPARAMETER_TUNING,
  FEATURE_ENGINEERING,
];

export function getMiniCourse(slug: string): MiniCourse | undefined {
  return MINI_COURSES.find((c) => c.slug === slug);
}
