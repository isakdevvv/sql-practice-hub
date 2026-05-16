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

export const MINI_COURSES: readonly MiniCourse[] = [FLASK_FRA_NULL, BYGG_MINI_SHELL];

export function getMiniCourse(slug: string): MiniCourse | undefined {
  return MINI_COURSES.find((c) => c.slug === slug);
}
