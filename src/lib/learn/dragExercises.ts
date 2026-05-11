import type { DragExercise } from "./types";

// Three exercise kinds: match (pair items), order (arrange in correct order),
// fill (drop tokens into placeholder slots in a SQL/HTML template).

export const DRAG_EXERCISES: DragExercise[] = [
  // ============ MATCH ============
  {
    id: "d-match-keywords",
    kind: "match",
    title: "SQL-nøkkelord til funksjon",
    prompt: "Dra hvert SQL-nøkkelord til riktig beskrivelse.",
    topic: "SQL grunnleggende",
    pairs: [
      { left: "SELECT", right: "Hente data fra én eller flere tabeller" },
      { left: "INSERT", right: "Legge til nye rader i en tabell" },
      { left: "UPDATE", right: "Endre verdier i eksisterende rader" },
      { left: "DELETE", right: "Fjerne rader fra en tabell" },
      { left: "GROUP BY", right: "Gruppere rader for aggregering" },
      { left: "HAVING", right: "Filtrere grupper etter aggregering" },
      { left: "DISTINCT", right: "Fjerne duplikater fra resultatet" },
    ],
  },
  {
    id: "d-match-status",
    kind: "match",
    title: "HTTP-statuskoder",
    prompt: "Match hver statuskode til riktig betydning.",
    topic: "HTTP",
    pairs: [
      { left: "200", right: "OK — request var vellykket" },
      { left: "201", right: "Created — ny ressurs opprettet" },
      { left: "301", right: "Moved Permanently — permanent redirect" },
      { left: "401", right: "Unauthorized — ikke innlogget" },
      { left: "403", right: "Forbidden — innlogget, men mangler tilgang" },
      { left: "404", right: "Not Found — siden finnes ikke" },
      { left: "500", right: "Internal Server Error — feil i backend" },
    ],
  },
  {
    id: "d-match-joins",
    kind: "match",
    title: "JOIN-typer",
    prompt: "Match hver JOIN-type til hva den returnerer.",
    topic: "JOIN",
    pairs: [
      {
        left: "INNER JOIN",
        right: "Bare rader som har match i begge tabeller",
      },
      {
        left: "LEFT JOIN",
        right: "Alle rader fra venstre tabell + matchende fra høyre (ellers NULL)",
      },
      {
        left: "RIGHT JOIN",
        right: "Alle rader fra høyre tabell + matchende fra venstre (ellers NULL)",
      },
      {
        left: "FULL OUTER JOIN",
        right: "Alle rader fra begge tabeller, NULL der det ikke er match",
      },
      {
        left: "CROSS JOIN",
        right: "Kartesisk produkt — alle kombinasjoner av rader",
      },
    ],
  },
  {
    id: "d-match-norm",
    kind: "match",
    title: "Normalformer",
    prompt: "Match hver normalform til kravet den stiller.",
    topic: "Normalisering",
    pairs: [
      { left: "1NF", right: "Atomiske verdier — ingen lister i én kolonne" },
      {
        left: "2NF",
        right: "Alle ikke-nøkkelfelt avhenger av HELE primærnøkkelen",
      },
      { left: "3NF", right: "Ingen transitive avhengigheter" },
      {
        left: "BCNF",
        right: "Alle determinanter er kandidatnøkler (strengere 3NF)",
      },
    ],
  },
  {
    id: "d-match-acid",
    kind: "match",
    title: "ACID-egenskapene",
    prompt: "Match hver ACID-egenskap til hva den garanterer.",
    topic: "Transaksjoner",
    pairs: [
      {
        left: "Atomicity",
        right: "Alt eller ingenting — feiler én del, rulles alt tilbake",
      },
      {
        left: "Consistency",
        right: "Databasen forblir gyldig — regler og relasjoner holder",
      },
      {
        left: "Isolation",
        right: "Transaksjoner forstyrrer ikke hverandre",
      },
      {
        left: "Durability",
        right: "COMMIT-et data overlever krasj og strømbrudd",
      },
    ],
  },
  {
    id: "d-match-flask",
    kind: "match",
    title: "Flask-konsepter",
    prompt: "Match hvert Flask-konsept til hva det gjør.",
    topic: "Flask",
    pairs: [
      { left: "@app.route", right: "Kobler en URL til en Python-funksjon" },
      {
        left: "render_template()",
        right: "Renderer en HTML-fil fra templates/ med Jinja",
      },
      {
        left: "url_for()",
        right: "Genererer URL fra route-navn — overlever path-endringer",
      },
      {
        left: "@login_required",
        right: "Beskytter route — bare for innloggede",
      },
      {
        left: "request.form",
        right: "Henter data sendt via HTML-form (POST)",
      },
      {
        left: "redirect()",
        right: "Sender brukeren videre til en annen URL",
      },
    ],
  },
  {
    id: "d-match-security",
    kind: "match",
    title: "Sikkerhetstrusler og forsvar",
    prompt: "Match hver trussel til riktig forsvar.",
    topic: "Sikkerhet",
    pairs: [
      { left: "SQL Injection", right: "Prepared statements / parameteriserte spørringer" },
      { left: "XSS", right: "Output-escaping (Jinja autoescape)" },
      { left: "CSRF", right: "CSRF-token i hver form (Flask-WTF)" },
      { left: "Avlytting", right: "HTTPS / TLS-kryptering" },
      { left: "Svake passord", right: "Hashing med bcrypt + lange passord" },
    ],
  },

  // ============ ORDER ============
  {
    id: "d-order-eval",
    kind: "order",
    title: "SQL-evalueringsrekkefølge",
    prompt:
      "Dra klausulene i den rekkefølgen databasen logisk evaluerer dem (ikke skrivrekkefølgen).",
    topic: "SQL grunnleggende",
    items: ["FROM", "JOIN", "WHERE", "GROUP BY", "HAVING", "SELECT", "ORDER BY", "LIMIT"],
    explanation:
      "Selv om vi SKRIVER SELECT først, evaluerer databasen FROM/JOIN først for å bygge radene, deretter filtrerer (WHERE), grupperer (GROUP BY), filtrerer grupper (HAVING), velger kolonner (SELECT), sorterer (ORDER BY) og kutter til slutt (LIMIT). Dette forklarer hvorfor SELECT-alias ikke kan brukes i WHERE.",
  },
  {
    id: "d-order-prosjekt",
    kind: "order",
    title: "Bygge en Flask-app fra bunn",
    prompt: "Dra stegene i riktig rekkefølge.",
    topic: "Praktisk",
    items: [
      "Opprett virtual environment (python -m venv venv)",
      "Aktiver venv (venv\\Scripts\\activate)",
      "pip install flask",
      "Lag templates/ og static/-mapper",
      "Skriv app.py med routes",
      "app.run(debug=True)",
      "Test i nettleser",
    ],
  },
  {
    id: "d-order-transaction",
    kind: "order",
    title: "En sikker bankoverføring",
    prompt: "Dra SQL-stegene for å overføre 1000 kr fra konto A til konto B i riktig rekkefølge.",
    topic: "Transaksjoner",
    items: [
      "START TRANSACTION;",
      "UPDATE konto SET saldo = saldo - 1000 WHERE kontonr = 1;",
      "UPDATE konto SET saldo = saldo + 1000 WHERE kontonr = 2;",
      "COMMIT;",
    ],
    explanation:
      "Begge UPDATE-ene må lykkes før COMMIT. Hvis noe feiler imellom, kan vi kjøre ROLLBACK i stedet og databasen er som før. Uten transaksjon risikerer du å trekke fra konto A men aldri legge til konto B.",
  },
  {
    id: "d-order-request",
    kind: "order",
    title: "Hva skjer når brukeren åpner /kunder",
    prompt: "Dra stegene fra request til ferdig HTML-side.",
    topic: "HTTP / Flask",
    items: [
      "Nettleser sender HTTP GET /kunder",
      "Flask matcher URLen mot @app.route(\"/kunder\")",
      "Funksjonen kjører cursor.execute(\"SELECT * FROM kunde\")",
      "Funksjonen kaller render_template(\"kunder.html\", kunder=rows)",
      "Jinja2 fyller inn variabler i HTML-malen",
      "Flask sender HTTP 200 + HTML tilbake",
      "Nettleser viser siden",
    ],
  },

  // ============ FILL ============
  {
    id: "d-fill-where",
    kind: "fill",
    title: "Fyll inn SELECT med WHERE",
    prompt: "Dra de riktige nøkkelordene inn i SQL-spørringen.",
    topic: "SQL grunnleggende",
    template:
      "__1__ navn, epost\n__2__ kunde\n__3__ kundenr __4__ (1, 2, 5)\n__5__ navn ASC;",
    blanks: ["SELECT", "FROM", "WHERE", "IN", "ORDER BY"],
    options: ["SELECT", "FROM", "WHERE", "IN", "ORDER BY", "GROUP BY", "HAVING", "AND", "BETWEEN"],
  },
  {
    id: "d-fill-join",
    kind: "fill",
    title: "Fyll inn en INNER JOIN",
    prompt:
      "Dra inn riktige nøkkelord. Vi vil hente kundenavn og utleieid for kunder som har leid.",
    topic: "JOIN",
    template:
      "SELECT k.navn, u.utleieid\n__1__ kunde k\n__2__ JOIN utleie u\n  __3__ k.kundenr __4__ u.kundenr;",
    blanks: ["FROM", "INNER", "ON", "="],
    options: ["FROM", "INNER", "LEFT", "ON", "WHERE", "=", "IS", "AS"],
  },
  {
    id: "d-fill-group",
    kind: "fill",
    title: "Fyll inn GROUP BY + HAVING",
    prompt:
      "Vi vil finne avdelinger med mer enn 5 ansatte. Dra de riktige nøkkelordene inn.",
    topic: "GROUP BY",
    template:
      "SELECT deptno, __1__(*) AS antall\nFROM emp\n__2__ deptno\n__3__ COUNT(*) > 5;",
    blanks: ["COUNT", "GROUP BY", "HAVING"],
    options: ["COUNT", "SUM", "AVG", "GROUP BY", "ORDER BY", "WHERE", "HAVING"],
    explanation:
      "WHERE filtrerer rader FØR gruppering — vi kan ikke bruke COUNT(*) der. HAVING filtrerer gruppene ETTER GROUP BY og er der aggregat-vilkår hører hjemme.",
  },
  {
    id: "d-fill-null",
    kind: "fill",
    title: "Finn aktive utleier (ikke innlevert)",
    prompt:
      "Vi vil finne alle utleier som ikke er levert tilbake (innlevertdato mangler).",
    topic: "NULL",
    template:
      "SELECT *\nFROM utleie\nWHERE innlevertdato __1__ __2__;",
    blanks: ["IS", "NULL"],
    options: ["IS", "=", "!=", "NULL", "EMPTY", "NOT", "AND"],
    explanation:
      "Husk: `= NULL` virker IKKE — NULL er ikke en vanlig verdi. Bruk alltid `IS NULL` eller `IS NOT NULL`.",
  },
  {
    id: "d-fill-create",
    kind: "fill",
    title: "Lag tabell med fremmednøkkel",
    prompt: "Fyll ut CREATE TABLE for en utleie-tabell som peker til kunde.",
    topic: "DDL",
    template:
      "CREATE __1__ utleie (\n  utleieid INT __2__ KEY,\n  kundenr INT,\n  __3__ KEY (kundenr) __4__ kunde(kundenr)\n);",
    blanks: ["TABLE", "PRIMARY", "FOREIGN", "REFERENCES"],
    options: ["TABLE", "VIEW", "INDEX", "PRIMARY", "FOREIGN", "UNIQUE", "REFERENCES", "ON", "AS"],
  },
  {
    id: "d-fill-insert",
    kind: "fill",
    title: "INSERT en ny kunde",
    prompt: "Fyll inn de manglende delene av en INSERT-setning.",
    topic: "DML",
    template:
      "__1__ __2__ kunde (kundenr, navn)\n__3__ (1003, 'Per');",
    blanks: ["INSERT", "INTO", "VALUES"],
    options: ["INSERT", "INTO", "VALUES", "SELECT", "ADD", "SET", "FROM"],
  },
  {
    id: "d-fill-update",
    kind: "fill",
    title: "Trygg UPDATE",
    prompt:
      "Endre Pers fornavn til Pål. Sørg for å bruke WHERE så bare riktig kunde endres.",
    topic: "DML",
    template:
      "__1__ kunde\n__2__ fornavn = 'Pål'\n__3__ kundenr = 1003;",
    blanks: ["UPDATE", "SET", "WHERE"],
    options: ["UPDATE", "SET", "WHERE", "INSERT", "VALUES", "SELECT", "FROM"],
    explanation:
      "Glemmer du WHERE oppdateres ALLE rader. Dette er en av de vanligste eksamensfellene.",
  },

  // ============ FLASK / PYTHON ============
  {
    id: "d-fill-flask-route",
    kind: "fill",
    title: "Enkel Flask-route",
    prompt: "Lag en route for /about som viser teksten 'Om oss'.",
    topic: "Flask routing",
    language: "python",
    example: `# Den enkleste Flask-routen
from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "Hei!"

if __name__ == "__main__":
    app.run(debug=True)`,
    template: `__1__("/about")
__2__ about():
    __3__ "Om oss"`,
    blanks: ["@app.route", "def", "return"],
    options: ["@app.route", "@route", "@app.get", "def", "function", "fun", "return", "yield", "print", "echo"],
    explanation:
      "@app.route binder URLen til funksjonen. 'def' starter funksjonsdefinisjonen i Python. 'return' sender responsen tilbake til nettleseren — Flask gjør om strengen til en HTTP-respons med Content-Type text/html.",
  },
  {
    id: "d-fill-flask-post",
    kind: "fill",
    title: "Route som tar imot et skjema",
    prompt:
      "Fyll inn en route som viser skjemaet på GET og lagrer + redirecter på POST.",
    topic: "Flask forms",
    language: "python",
    example: `# Typisk login-route som håndterer både GET og POST
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        # ... verifiser bruker ...
        return redirect(url_for("dashboard"))
    return render_template("login.html")`,
    template: `@app.route("/kunde/ny", methods=[__1__, __2__])
def ny_kunde():
    if request.__3__ == "POST":
        navn = request.__4__["navn"]
        # ... INSERT i databasen ...
        return __5__(url_for("kunder"))
    return __6__("ny_kunde.html")`,
    blanks: ['"GET"', '"POST"', "method", "form", "redirect", "render_template"],
    options: [
      '"GET"',
      '"POST"',
      '"PUT"',
      "method",
      "type",
      "form",
      "args",
      "json",
      "redirect",
      "render_template",
      "render",
      "send_file",
    ],
    explanation:
      "request.method er strengen 'GET' eller 'POST'. request.form er en dict med data fra HTML-skjemaet. Etter vellykket POST følger man Post-Redirect-Get-mønsteret: redirect tilbake til en GET-side så brukeren ikke ved et uhell sender skjemaet på nytt med Refresh.",
  },
  {
    id: "d-fill-blueprint",
    kind: "fill",
    title: "Definere en Blueprint",
    prompt:
      "Lag en auth-blueprint som har URL-prefix /auth og en /login-route.",
    topic: "Blueprints",
    language: "python",
    example: `# Eksempel — kunde_bp i en fil "kunder.py"
from flask import Blueprint, render_template

kunde_bp = Blueprint("kunder", __name__, url_prefix="/kunder")

@kunde_bp.route("/")
def liste():
    return render_template("kunder.html")`,
    template: `from flask import __1__, render_template

auth_bp = __2__("auth", __3__, url_prefix=__4__)

@auth_bp.__5__("/login")
def login():
    return render_template("login.html")`,
    blanks: ["Blueprint", "Blueprint", "__name__", '"/auth"', "route"],
    options: [
      "Blueprint",
      "Blueprint",
      "Flask",
      "App",
      "__name__",
      "__main__",
      "name",
      '"/auth"',
      '"auth"',
      '"/"',
      "route",
      "url",
      "path",
      "page",
    ],
    explanation:
      "En Blueprint er en gruppe routes som kan registreres på en Flask-app. __name__ trengs for at templating skal finne mapper. url_prefix legges automatisk foran alle routes — i dette tilfellet blir login-routen tilgjengelig på /auth/login.",
  },
  {
    id: "d-fill-register-bp",
    kind: "fill",
    title: "Registrere en Blueprint i app.py",
    prompt: "Vis hvordan auth_bp og kunde_bp kobles inn i hovedappen.",
    topic: "Blueprints",
    language: "python",
    example: `# Eksempel — minimal app.py
from flask import Flask
from auth import auth_bp

app = Flask(__name__)
app.config["SECRET_KEY"] = "hemmelig"
app.register_blueprint(auth_bp)`,
    template: `from flask import __1__
from auth import auth_bp
from kunder import kunde_bp

app = Flask(__2__)
app.config[__3__] = "hemmelig"
app.__4__(auth_bp)
app.__5__(kunde_bp)`,
    blanks: ["Flask", "__name__", '"SECRET_KEY"', "register_blueprint", "register_blueprint"],
    options: [
      "Flask",
      "Blueprint",
      "App",
      "__name__",
      "__main__",
      '"SECRET_KEY"',
      '"DEBUG"',
      '"DATABASE_URI"',
      "register_blueprint",
      "register_blueprint",
      "register",
      "add_blueprint",
      "use",
    ],
    explanation:
      "Hver blueprint må registreres på app-objektet. SECRET_KEY trengs for sessions og CSRF — uten den feiler login og forms.",
  },
  {
    id: "d-fill-mysql-connect",
    kind: "fill",
    title: "Koble Flask til MySQL",
    prompt: "Opprett databaseforbindelse mot lokal MySQL og lag en cursor.",
    topic: "Database",
    language: "python",
    example: `# Typisk databasekobling
import mysql.connector

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="hemmelig",
    database="EmployeeDB"
)
cursor = db.cursor()
cursor.execute("SELECT * FROM emp")
rows = cursor.fetchall()`,
    template: `import mysql.connector

db = mysql.connector.__1__(
    host=__2__,
    user="root",
    password="hemmelig",
    database=__3__
)
cursor = db.__4__()`,
    blanks: ["connect", '"localhost"', '"UtleieDB"', "cursor"],
    options: [
      "connect",
      "open",
      "create_engine",
      "connection",
      '"localhost"',
      '"127.0.0.1"',
      '"server"',
      '"UtleieDB"',
      '"main"',
      '"db"',
      "cursor",
      "session",
      "engine",
      "query",
    ],
  },
  {
    id: "d-fill-prepared-insert",
    kind: "fill",
    title: "Trygg INSERT med prepared statement",
    prompt: "Lagre et nytt produkt uten å åpne for SQL Injection.",
    topic: "Sikkerhet",
    language: "python",
    example: `# INSERT med parametre (%s) for å beskytte mot SQL Injection
sql = "INSERT INTO kunde (navn, epost) VALUES (%s, %s)"
values = ("Ola", "ola@test.no")
cursor.execute(sql, values)
db.commit()`,
    template: `sql = "INSERT INTO produkt (navn, pris) VALUES (__1__, __2__)"
values = (navn, pris)
cursor.__3__(sql, values)
db.__4__()`,
    blanks: ["%s", "%s", "execute", "commit"],
    options: ["%s", "%s", "?", "$1", ":1", "{}", "execute", "run", "query", "commit", "save", "flush", "close"],
    explanation:
      "%s er placeholder i mysql-connector. Verdiene sendes som tuple og databasen behandler dem som DATA, aldri som SQL-kode. Glemmer man db.commit() lagres ikke INSERT permanent.",
  },
  {
    id: "d-fill-prepared-select",
    kind: "fill",
    title: "SELECT med parameter",
    prompt: "Hent en kunde basert på ID — uten strengkonkatenering.",
    topic: "Sikkerhet",
    language: "python",
    example: `# Trygg SELECT med parameter
cursor.execute(
    "SELECT * FROM kunde WHERE kundenr = %s",
    (kundenr,)
)
kunde = cursor.fetchone()`,
    template: `cursor.execute(
    "SELECT * FROM ansatt WHERE ansattnr = __1__",
    (__2__,)
)
ansatt = cursor.__3__()`,
    blanks: ["%s", "ansattnr", "fetchone"],
    options: ["%s", "?", "{}", "ansattnr", "id", "navn", "fetchone", "fetchall", "first", "one"],
    explanation:
      "Tuplen `(ansattnr,)` med komma er viktig — uten kommaet blir det ikke en tuple. fetchone() returnerer én rad eller None; fetchall() returnerer en liste av rader.",
  },
  {
    id: "d-fill-user-loader",
    kind: "fill",
    title: "Flask-Login user_loader",
    prompt: "Sett opp Flask-Login slik at innlogget bruker hentes ved hver request.",
    topic: "Flask-Login",
    language: "python",
    example: `# Komplett Flask-Login-oppsett
from flask_login import LoginManager, UserMixin, login_user, login_required

login_manager = LoginManager()
login_manager.init_app(app)

class User(UserMixin):
    def __init__(self, id, username):
        self.id = id
        self.username = username

@login_manager.user_loader
def load_user(user_id):
    # Hent bruker fra database basert på ID
    return User(int(user_id), "test")`,
    template: `from flask_login import LoginManager, UserMixin

login_manager = LoginManager()
login_manager.__1__(app)

class User(__2__):
    def __init__(self, id):
        self.id = id

@login_manager.__3__
def load_user(user_id):
    return User(user_id)`,
    blanks: ["init_app", "UserMixin", "user_loader"],
    options: [
      "init_app",
      "init",
      "register",
      "UserMixin",
      "User",
      "AnonymousUser",
      "Auth",
      "user_loader",
      "login_loader",
      "loader",
      "load_user",
    ],
    explanation:
      "UserMixin gir User-klassen standard-metoder som Flask-Login forventer (is_authenticated, get_id osv.). @user_loader registrerer en callback som mottar ID-strengen fra session-cookien og returnerer User-objektet — kjøres på hver request.",
  },
  {
    id: "d-fill-login-flow",
    kind: "fill",
    title: "Login-route som logger inn brukeren",
    prompt:
      "Fyll inn login-funksjonen som verifiserer passord og setter session.",
    topic: "Flask-Login",
    language: "python",
    example: `# Komplett login-route
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        u = request.form["username"]
        p = request.form["password"]
        user = find_user(u, p)
        if user:
            login_user(user)
            return redirect(url_for("dashboard"))
        flash("Feil brukernavn eller passord")
    return render_template("login.html")`,
    template: `@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        navn = request.form["username"]
        passord = request.form["password"]
        user = finn_bruker(navn, passord)
        if user:
            __1__(user)
            return __2__(__3__("dashboard"))
        __4__("Feil passord")
    return __5__("login.html")`,
    blanks: ["login_user", "redirect", "url_for", "flash", "render_template"],
    options: [
      "login_user",
      "logout_user",
      "log_in",
      "set_user",
      "redirect",
      "send",
      "url_for",
      "url",
      "route",
      "flash",
      "alert",
      "message",
      "render_template",
      "render",
    ],
    explanation:
      "login_user(user) lagrer brukerens ID i session-cookien. Etter dette vil current_user gi tilgang til den innloggede brukeren. redirect + url_for følger Post-Redirect-Get. flash() lagrer en melding for neste request — brukes til å vise tilbakemeldinger uten å forstyrre URLen.",
  },
  {
    id: "d-fill-jinja-loop",
    kind: "fill",
    title: "Vise kundeliste i Jinja-template",
    prompt: "Fyll ut HTML-templaten som looper gjennom alle kunder fra databasen.",
    topic: "Jinja",
    language: "html",
    example: `{# Eksempel — Jinja-loop med variabler #}
<ul>
{% for produkt in produkter %}
    <li>{{ produkt.navn }} — {{ produkt.pris }} kr</li>
{% endfor %}
</ul>`,
    template: `<ul>
__1__ for kunde in kunder __2__
    <li>__3__ kunde.navn __4__ ( __3__ kunde.epost __4__ )</li>
__5__ endfor __6__
</ul>`,
    blanks: ["{%", "%}", "{{", "}}", "{%", "%}"],
    options: ["{%", "{%", "%}", "%}", "{{", "}}", "<%", "%>", "${", "}"],
    explanation:
      "{% %} er for kontroll-strukturer (for, if, endfor, endif). {{ }} er for å skrive ut verdier — som blir HTML-escaped automatisk for å beskytte mot XSS.",
  },
  {
    id: "d-fill-jinja-form",
    kind: "fill",
    title: "Jinja-skjema med CSRF",
    prompt: "Lag et innloggingsskjema med CSRF-beskyttelse via Flask-WTF.",
    topic: "Jinja",
    language: "html",
    example: `{# Eksempel — registreringsskjema med CSRF #}
<form method="POST" action="{{ url_for('register') }}">
    {{ form.hidden_tag() }}
    {{ form.username.label }} {{ form.username() }}
    {{ form.email.label }} {{ form.email() }}
    <button type="submit">Registrer</button>
</form>`,
    template: `<form method=__1__ action="__2__ url_for('login') __3__">
    __2__ form.hidden_tag() __3__
    <label>Brukernavn:</label>
    <input type=__4__ name="username">
    <label>Passord:</label>
    <input type=__5__ name="password">
    <button type=__6__>Logg inn</button>
</form>`,
    blanks: ['"POST"', "{{", "}}", '"text"', '"password"', '"submit"'],
    options: [
      '"POST"',
      '"GET"',
      '"FORM"',
      "{{",
      "}}",
      "{%",
      "%}",
      '"text"',
      '"input"',
      '"password"',
      '"hidden"',
      '"submit"',
      '"button"',
    ],
    explanation:
      "form.hidden_tag() rendrer det skjulte CSRF-tokenet. Uten det avviser Flask-WTF POST-en som ugyldig. type='password' skjuler tegnene i feltet.",
  },
  {
    id: "d-order-login",
    kind: "order",
    title: "Login-prosessen — fra knapp til dashboard",
    prompt: "Dra stegene som skjer fra brukeren trykker «Logg inn» til dashbordet vises.",
    topic: "Flask-Login",
    items: [
      "Bruker fyller ut skjemaet og trykker submit",
      "Nettleseren sender POST /login med username + password",
      "Flask matcher URLen og kaller login()-funksjonen",
      "request.method == 'POST' er sant, så vi henter form-data",
      "Backend slår opp brukeren i databasen og verifiserer passord-hash",
      "login_user(user) lagrer bruker-ID i session-cookien",
      "Routen returnerer redirect(url_for('dashboard'))",
      "Nettleser følger redirecten og henter /dashboard med GET",
      "@login_required slipper requesten gjennom fordi current_user nå er innlogget",
      "render_template('dashboard.html') sender ferdig HTML tilbake",
    ],
    explanation:
      "Mønsteret heter Post-Redirect-Get: POST med data → 302 redirect → GET av ny side. Det forhindrer at Refresh sender skjemaet på nytt. login_user() er den eneste linjen som faktisk «logger inn» — alt etter det sjekker bare session-cookien.",
  },

  // ============ HTTP-REQUEST-ANATOMI ============
  // Bygges fra "se hva en request er" → "lag den selv" → senere: "send og
  // prosessér i Python". Rene drag-oppgaver — ingen ekte server.
  {
    id: "d-fill-http-get-anatomy",
    kind: "fill",
    title: "Anatomi: GET-request",
    prompt:
      "Fyll inn delene som mangler i en GET-request. Dette er det browseren faktisk sender til serveren.",
    topic: "HTTP",
    template:
      "__1__ /api/kunder HTTP/1.1\n__2__: api.butikk.no\n__3__: application/json\n__4__: SQLSandbox/1.0",
    blanks: ["GET", "Host", "Accept", "User-Agent"],
    options: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "Host",
      "From",
      "Accept",
      "Content-Type",
      "User-Agent",
      "Authorization",
    ],
    explanation:
      "GET-requester har metoden først, så stien, så HTTP-versjonen — alt på samme linje. Headere kommer rett etter, én per linje, alltid på formen 'Navn: verdi'. GET-requester har vanligvis INGEN body.",
  },
  {
    id: "d-fill-http-post-json",
    kind: "fill",
    title: "Anatomi: POST med JSON-body",
    prompt:
      "Bygg opp en POST-request som sender JSON-data. Pass på hvilken header som skiller seg fra GET.",
    topic: "HTTP",
    template:
      "__1__ /api/kunder HTTP/1.1\nHost: api.butikk.no\n__2__: application/json\n__3__: 38\n\n{\"navn\": \"Ola\", \"epost\": \"ola@test.no\"}",
    blanks: ["POST", "Content-Type", "Content-Length"],
    options: [
      "POST",
      "GET",
      "PUT",
      "Content-Type",
      "Content-Length",
      "Accept",
      "Host",
      "Authorization",
    ],
    explanation:
      "POST-bodyen står ETTER én tom linje. Content-Type forteller serveren hvordan bodyen skal tolkes (her: JSON). Content-Length er antall bytes i bodyen — browseren regner ut dette selv.",
  },
  {
    id: "d-fill-http-auth-bearer",
    kind: "fill",
    title: "Autentisert request — Bearer-token",
    prompt:
      "API-endepunkter som krever innlogging må ta imot et token. Det sendes i Authorization-headeren.",
    topic: "HTTP",
    template:
      "GET /api/min-side HTTP/1.1\nHost: api.butikk.no\n__1__: __2__ eyJhbGciOiJIUzI1NiJ9.abc.xyz\nAccept: application/json",
    blanks: ["Authorization", "Bearer"],
    options: [
      "Authorization",
      "Auth",
      "Token",
      "Bearer",
      "Basic",
      "Cookie",
      "X-Token",
    ],
    explanation:
      "Authorization-headeren har to deler: et 'scheme' (Bearer for tokens, Basic for brukernavn:passord) og selve verdien. Bearer er standard for OAuth/JWT — uten den vet ikke serveren hvordan tokenet skal tolkes.",
  },
  {
    id: "d-fill-http-csrf",
    kind: "fill",
    title: "CSRF-beskyttet POST",
    prompt:
      "Når en form POSTer endringer må den bevise at requesten kom fra ditt eget skjema. Hvilken header brukes?",
    topic: "HTTP",
    template:
      "POST /kurv/legg-til HTTP/1.1\nHost: butikk.no\nContent-Type: application/json\nCookie: session=__1__\n__2__: __3__\n\n{\"prodnr\": 1, \"antall\": 2}",
    blanks: ["abc123", "X-CSRF-Token", "f4d8e7a2"],
    options: [
      "abc123",
      "f4d8e7a2",
      "X-CSRF-Token",
      "X-CSRF",
      "X-XSRF-Token",
      "Authorization",
      "Cookie",
    ],
    explanation:
      "CSRF-tokenet sendes i en custom header (typisk X-CSRF-Token). Cookien er det som binder requesten til en bestemt session. Tokenet er det som beviser at den ondsinnede siden NIKE.com ikke kan POSTe i ditt navn — den har ikke tilgang til ditt CSRF-token.",
  },
  {
    id: "d-fill-http-response",
    kind: "fill",
    title: "Anatomi: HTTP-respons",
    prompt:
      "Slik ser det serveren sender TILBAKE ut. Status-linjen først, så headere, så bodyen.",
    topic: "HTTP",
    template:
      "HTTP/1.1 __1__ __2__\n__3__: application/json\n__4__: 52\n\n[{\"id\":1,\"navn\":\"Ola Nordmann\"}]",
    blanks: ["200", "OK", "Content-Type", "Content-Length"],
    options: [
      "200",
      "201",
      "OK",
      "Created",
      "Content-Type",
      "Content-Length",
      "Status",
      "Length",
      "Body",
    ],
    explanation:
      "Statuskoden (200) og fritekst-frase ('OK') henger sammen. Statuskoden er det maskinen leser, frase-tekst er for mennesker. Server sender Content-Type så klienten vet hvordan bodyen tolkes.",
  },
  {
    id: "d-match-http-methods",
    kind: "match",
    title: "HTTP-metode → bruksområde",
    prompt: "Match hver HTTP-metode til hva den standardmessig brukes til (REST-konvensjon).",
    topic: "HTTP",
    pairs: [
      { left: "GET", right: "Hent data — idempotent, ingen sideeffekt" },
      { left: "POST", right: "Lag ny ressurs — sender body" },
      { left: "PUT", right: "Erstatt hele ressursen — idempotent" },
      { left: "PATCH", right: "Endre noen felter — partiell oppdatering" },
      { left: "DELETE", right: "Fjern ressursen — idempotent" },
      { left: "OPTIONS", right: "Spør hvilke metoder som er tillatt — CORS-preflight" },
    ],
  },
  {
    id: "d-match-http-headers",
    kind: "match",
    title: "Vanlige HTTP-headere → formål",
    prompt: "Match hver header til hva den brukes til.",
    topic: "HTTP",
    pairs: [
      { left: "Authorization", right: "Bevis for at brukeren er innlogget (Bearer-token / Basic auth)" },
      { left: "Content-Type", right: "Hvilket format har bodyen (JSON / form / HTML)" },
      { left: "Accept", right: "Hvilket format ønsker klienten i responsen" },
      { left: "Cookie", right: "Sender session-id tilbake til serveren ved hver request" },
      { left: "X-CSRF-Token", right: "Beskyttelse mot Cross-Site Request Forgery" },
      { left: "User-Agent", right: "Identifikasjon av klienten (browser, app, bot)" },
    ],
  },
  {
    id: "d-order-http-lifecycle",
    kind: "order",
    title: "HTTP-livssyklusen — fra knappetrykk til ferdig side",
    prompt:
      "Dra stegene som skjer fra brukeren klikker en lenke til siden er ferdig vist. Inkluderer både nettverk- og applikasjonslag.",
    topic: "HTTP",
    items: [
      "Bruker klikker en lenke i browseren",
      "Browser slår opp domenenavn via DNS",
      "TCP-handshake mellom browser og server",
      "TLS-handshake (kryptering forhandles)",
      "Browser sender HTTP-request over TCP-koblingen",
      "Server matcher URL-en mot en route i Flask",
      "Route-funksjonen kjører — eventuelt SQL mot databasen",
      "Server bygger HTTP-respons og sender tilbake",
      "Browser parser HTML, henter CSS/JS",
      "Browser bygger DOM og rendrer siden",
    ],
    explanation:
      "Det er minst 10 steg fra klikk til ferdig side — hvert kan gå galt. DNS kan være tregt, TLS kan feile, server kan time ut, DB kan svare 500. Dev-tools sin Network-fane viser alle disse stegene målt i millisekunder for hver request.",
  },

  // ============ SIKKERHET / JWT / CORS / TLS ============
  {
    id: "d-match-owasp",
    kind: "match",
    title: "OWASP Top 10 — sårbarhet → forsvar",
    prompt:
      "Match hver vanlig sårbarhet til det viktigste forsvaret mot den.",
    topic: "Sikkerhet",
    pairs: [
      {
        left: "SQL Injection",
        right: "Bruk parameteriserte spørringer / prepared statements",
      },
      {
        left: "Cross-Site Scripting (XSS)",
        right: "Escape brukerinput ved utskrift i HTML (auto-escape i Jinja2)",
      },
      {
        left: "Cross-Site Request Forgery (CSRF)",
        right: "CSRF-token i skjema + SameSite-cookies",
      },
      {
        left: "Broken Authentication",
        right: "Sterke passordkrav, hashing med bcrypt/argon2, rate limiting",
      },
      {
        left: "Sensitive Data Exposure",
        right: "TLS i transit + kryptering av data i hvile",
      },
      {
        left: "Broken Access Control",
        right: "Sjekk autorisasjon på serversiden for hver request",
      },
    ],
  },
  {
    id: "d-match-hash-algos",
    kind: "match",
    title: "Hash-algoritmer og kjente svakheter",
    prompt:
      "Match hver hash-algoritme til status og typisk bruk i 2025.",
    topic: "Hashing",
    pairs: [
      {
        left: "MD5",
        right: "Brutt — kollisjoner kjent siden 2004, aldri til passord",
      },
      {
        left: "SHA-1",
        right: "Brutt — kollisjon demonstrert i 2017 (SHAttered), unngå",
      },
      {
        left: "SHA-256",
        right: "Trygg som generell hash, men FOR RASK til passord",
      },
      {
        left: "bcrypt",
        right: "Treg passord-hash med innebygget salt og work factor",
      },
      {
        left: "argon2",
        right: "Moderne anbefaling for passord — minne-hard, vant PHC i 2015",
      },
    ],
  },
  {
    id: "d-order-sql-injection",
    kind: "order",
    title: "SQL Injection-angrep — steg for steg",
    prompt:
      "Dra stegene i den rekkefølgen et klassisk SQL injection-angrep utfolder seg.",
    topic: "Sikkerhet",
    items: [
      "Utvikler bygger SQL-streng ved å konkatenere brukerinput",
      "Angriper finner et input-felt som ikke er sanitised",
      "Angriper sender input som inneholder ' OR 1=1 --",
      "Serveren bygger og sender SQL-en til databasen som én streng",
      "Databasen kjører den manipulerte spørringen og returnerer alle rader",
      "Angriper får tilgang til data hen ikke skulle hatt",
    ],
    explanation:
      "Roten er alltid det samme: brukerinput tolkes som SQL-kode. Forsvar = parameteriserte spørringer (`?`-plassholdere) — da kan ikke input bryte ut av streng-konteksten.",
  },
  {
    id: "d-order-password-handling",
    kind: "order",
    title: "Trygg passord-håndtering",
    prompt:
      "Dra stegene i riktig rekkefølge fra brukeren registrerer passordet til hen logger inn neste gang.",
    topic: "Sikkerhet",
    items: [
      "Bruker sender passord over HTTPS",
      "Server genererer et tilfeldig salt",
      "Server hasher passord + salt med bcrypt/argon2",
      "Server lagrer hash + salt i databasen (aldri klartekst)",
      "Ved login: server henter lagret hash for brukeren",
      "Server hasher innsendt passord med samme salt og sammenligner",
    ],
    explanation:
      "Passord skal ALDRI lagres i klartekst. Salt forhindrer rainbow-table-angrep, og en treg hash som bcrypt gjør brute force upraktisk.",
  },
  {
    id: "d-match-jwt-parts",
    kind: "match",
    title: "JWT-deler og innhold",
    prompt:
      "Et JWT består av tre base64url-kodede deler skilt med punktum. Match hver del til hva den inneholder.",
    topic: "JWT",
    pairs: [
      {
        left: "Header",
        right: "Algoritme (alg) og token-type (typ), f.eks. HS256 og JWT",
      },
      {
        left: "Payload",
        right: "Claims om brukeren — sub, exp, iat, custom-felter",
      },
      {
        left: "Signature",
        right: "HMAC/RSA av header.payload med serverens hemmelige nøkkel",
      },
      {
        left: "exp-claim",
        right: "Unix-tidspunkt når tokenet utløper",
      },
      {
        left: "sub-claim",
        right: "Subject — typisk bruker-ID",
      },
    ],
  },
  {
    id: "d-fill-jwt-anatomy",
    kind: "fill",
    title: "JWT — anatomi av et token",
    prompt:
      "Et JWT består av tre deler skilt med punktum. Dra riktig navn til hver del av tokenet under.",
    topic: "JWT",
    template:
      "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJvbGEifQ.signature\n# del 1: __1__\n# del 2: __2__\n# del 3: __3__",
    blanks: ["header", "payload", "signature"],
    options: ["header", "payload", "signature", "salt", "claim", "secret", "nonce"],
    explanation:
      "Del 1 og 2 er base64url-kodet JSON og kan dekodes av hvem som helst. Del 3 er en HMAC/RSA-signatur av de to første med serverens hemmelige nøkkel — den hindrer manipulering.",
  },
  {
    id: "d-order-jwt-flow",
    kind: "order",
    title: "JWT login-flyt",
    prompt:
      "Dra stegene i en typisk JWT-basert autentiseringsflyt i riktig rekkefølge.",
    topic: "JWT",
    items: [
      "Klient sender brukernavn og passord til /login",
      "Server verifiserer passordet mot hashen i databasen",
      "Server signerer et JWT med sin hemmelige nøkkel",
      "Klient mottar tokenet og lagrer det (localStorage eller cookie)",
      "Klient sender tokenet i Authorization-headeren med hver request",
      "Server verifiserer signaturen og leser claims fra payloaden",
    ],
    explanation:
      "Etter login holder serveren ikke session-state — alt som trengs står i tokenet, og signaturen beviser at det er ekte. Det gjør JWT godt for mikrotjenester og APIer.",
  },
  {
    id: "d-match-cors-headers",
    kind: "match",
    title: "CORS-headere → formål",
    prompt:
      "Match hver CORS-header til hva den styrer.",
    topic: "CORS",
    pairs: [
      {
        left: "Access-Control-Allow-Origin",
        right: "Hvilke origins (domener) som har lov til å lese responsen",
      },
      {
        left: "Access-Control-Allow-Methods",
        right: "Hvilke HTTP-metoder (GET, POST, PUT…) som er tillatt",
      },
      {
        left: "Access-Control-Allow-Headers",
        right: "Hvilke custom request-headere klienten har lov til å sende",
      },
      {
        left: "Access-Control-Allow-Credentials",
        right: "Om cookies/auth-headere får sendes med cross-origin",
      },
      {
        left: "Access-Control-Max-Age",
        right: "Hvor lenge browseren kan cache preflight-svaret",
      },
    ],
  },
  {
    id: "d-order-cors-preflight",
    kind: "order",
    title: "CORS preflight-flyt",
    prompt:
      "Dra stegene i en CORS preflight-request i riktig rekkefølge (f.eks. en POST med JSON-body fra et annet domene).",
    topic: "CORS",
    items: [
      "Browseren ser at requesten er cross-origin og ikke 'simple'",
      "Browseren sender en OPTIONS-request med Access-Control-Request-* headere",
      "Server svarer med Access-Control-Allow-Origin/Methods/Headers",
      "Browseren sjekker om svaret tillater den planlagte requesten",
      "Browseren sender den ekte POST-requesten med body",
      "Server returnerer den faktiske responsen med Access-Control-Allow-Origin",
    ],
    explanation:
      "Preflight skjer for ikke-trivielle cross-origin-requests (custom headere, JSON content-type, PUT/DELETE m.m.). Den ekte requesten sendes ALDRI hvis preflight feiler.",
  },
  {
    id: "d-match-tls-handshake",
    kind: "match",
    title: "TLS-handshake-steg → hva som skjer",
    prompt:
      "Match hvert steg i TLS 1.2-handshaket til hva som faktisk skjer.",
    topic: "TLS",
    pairs: [
      {
        left: "ClientHello",
        right: "Klient sender støttede cipher suites og en tilfeldig nonce",
      },
      {
        left: "ServerHello",
        right: "Server velger cipher suite og sender egen nonce",
      },
      {
        left: "Certificate",
        right: "Server sender X.509-sertifikatet sitt (kjede til CA)",
      },
      {
        left: "Key Exchange",
        right: "Partene avleder en delt symmetrisk sesjonsnøkkel (ECDHE)",
      },
      {
        left: "Finished",
        right: "Begge bekrefter handshaket med en MAC over alle meldingene",
      },
    ],
  },
  {
    id: "d-match-cert-fields",
    kind: "match",
    title: "Sertifikat-felter → betydning",
    prompt:
      "Match hvert felt i et X.509-sertifikat til hva det betyr.",
    topic: "TLS",
    pairs: [
      {
        left: "CN (Common Name)",
        right: "Hovednavnet sertifikatet er utstedt for, f.eks. example.com",
      },
      {
        left: "SAN (Subject Alt Name)",
        right: "Liste over alle gyldige domener — det browsere faktisk sjekker",
      },
      {
        left: "Issuer",
        right: "Sertifiseringsmyndigheten (CA) som har signert sertifikatet",
      },
      {
        left: "Not After (expiry)",
        right: "Tidspunktet når sertifikatet utløper og må fornyes",
      },
      {
        left: "Public Key",
        right: "Serverens offentlige nøkkel — brukes til å verifisere signaturer",
      },
    ],
  },
  {
    id: "d-fill-werkzeug-hash",
    kind: "fill",
    title: "Hashing av passord med werkzeug",
    prompt:
      "Fyll inn riktige funksjoner for å hashe og verifisere et passord i Flask med werkzeug.security.",
    topic: "Hashing",
    template:
      "from werkzeug.security import __1__, __2__\n\n# ved registrering\nhash = __1__('hemmelig')\n\n# ved login\nok = __2__(hash, 'hemmelig')",
    blanks: ["generate_password_hash", "check_password_hash"],
    options: [
      "generate_password_hash",
      "check_password_hash",
      "hash_password",
      "verify_password",
      "bcrypt",
      "sha256",
      "encrypt",
      "decrypt",
    ],
    explanation:
      "werkzeug.security håndterer salt og iterasjoner automatisk — du trenger bare gi inn klartekst-passordet. Lagre returverdien fra generate_password_hash som en streng i databasen.",
  },

  // ============ NORMALISERING ============
  {
    id: "d-match-norm-anomalier",
    kind: "match",
    title: "Anomalier — hva fikser hvilken normalform?",
    prompt:
      "Match hvert problem til normalformen som løser det. Tenk på hvilket krav som faktisk fjerner anomalien.",
    topic: "Normalisering",
    pairs: [
      {
        left: "Liste i én kolonne",
        right: "1NF — splitt til atomiske verdier (én verdi per felt)",
      },
      {
        left: "Produktnavn gjentas på hver ordrelinje",
        right: "2NF — flytt felt som bare avhenger av del av PK ut i egen tabell",
      },
      {
        left: "Poststed avhenger av PostNr, ikke av KundeNr",
        right: "3NF — fjern transitiv avhengighet til egen tabell",
      },
      {
        left: "Sletter siste student → mister fag-info",
        right: "3NF — separer fag fra student i egen Fag-tabell",
      },
      {
        left: "Determinant er ikke kandidatnøkkel",
        right: "BCNF — strengere 3NF, alle determinanter må være kandidatnøkler",
      },
    ],
  },
  {
    id: "d-match-norm-fd-typer",
    kind: "match",
    title: "Avhengighets-typer",
    prompt: "Match hvert begrep til riktig definisjon.",
    topic: "Normalisering",
    pairs: [
      {
        left: "Funksjonell avhengighet (X → Y)",
        right: "Verdien til X bestemmer verdien til Y entydig",
      },
      {
        left: "Partiell avhengighet",
        right: "Et felt avhenger bare av DEL av en sammensatt primærnøkkel",
      },
      {
        left: "Transitiv avhengighet",
        right: "A → B → C der B ikke er nøkkel — C avhenger «via» B",
      },
      {
        left: "Determinant",
        right: "Venstresiden i en FD — det som bestemmer noe annet",
      },
      {
        left: "Kandidatnøkkel",
        right: "Minimal kombinasjon av felter som identifiserer hver rad unikt",
      },
    ],
  },
  {
    id: "d-match-norm-violation",
    kind: "match",
    title: "Hvilken normalform brytes?",
    prompt:
      "Hver tabell bryter med én konkret normalform. Match tabellen til normalformen som brytes.",
    topic: "Normalisering",
    pairs: [
      {
        left: "Kunde(id, navn, telefon='22 11 33, 99 88 77')",
        right: "1NF — flerverdi i én kolonne",
      },
      {
        left: "Ordrelinje(ordreNr, prodNr, antall, prodNavn) PK=(ordreNr,prodNr)",
        right: "2NF — prodNavn avhenger bare av prodNr",
      },
      {
        left: "Kunde(id, navn, postNr, poststed)",
        right: "3NF — poststed avhenger av postNr (transitivt)",
      },
      {
        left: "Ansatt(ansattNr, prosjekt, timer, prosjektNavn) PK=(ansattNr,prosjekt)",
        right: "2NF — prosjektNavn avhenger bare av prosjekt",
      },
    ],
  },
  {
    id: "d-order-norm-steps",
    kind: "order",
    title: "Normalisering — fra unormalisert til 3NF",
    prompt: "Dra stegene i riktig rekkefølge for å normalisere en tabell.",
    topic: "Normalisering",
    items: [
      "Skriv ned alle attributter og eksempel-rader",
      "Identifiser primærnøkkel(er) og funksjonelle avhengigheter",
      "1NF: splitt flerverdi-felt til atomiske verdier (én verdi per celle)",
      "2NF: fjern partielle avhengigheter (felt som bare avhenger av del av PK) til egne tabeller",
      "3NF: fjern transitive avhengigheter (felt som avhenger av et ikke-nøkkelfelt) til egne tabeller",
      "Sjekk at hver tabell har én PK og at alle FK-er peker riktig",
    ],
    explanation:
      "Rekkefølgen er viktig: du kan ikke vurdere 2NF før tabellen er i 1NF, og du kan ikke vurdere 3NF før den er i 2NF. Hopp aldri over et trinn.",
  },
  {
    id: "d-order-norm-decompose-2nf",
    kind: "order",
    title: "Splitt opp Ordrelinje (2NF)",
    prompt:
      "Tabellen Ordrelinje(ordreNr, prodNr, antall, prodNavn, prodPris) bryter 2NF. Dra stegene for å splitte den.",
    topic: "Normalisering",
    items: [
      "Identifiser FD-er: (ordreNr, prodNr) → antall;  prodNr → prodNavn, prodPris",
      "Se at prodNavn og prodPris kun avhenger av DEL av PK (prodNr) — partiell avhengighet",
      "Lag ny tabell Produkt(prodNr, prodNavn, prodPris)",
      "La Ordrelinje beholde (ordreNr, prodNr, antall) med PK=(ordreNr, prodNr)",
      "Legg til FK i Ordrelinje: prodNr → Produkt(prodNr)",
    ],
    explanation:
      "2NF bryr seg bare om sammensatte primærnøkler. Hvis PK består av ÉN kolonne, kan tabellen ikke bryte 2NF — da hopper du rett til 3NF-sjekk.",
  },
  {
    id: "d-order-norm-decompose-3nf",
    kind: "order",
    title: "Splitt opp Kunde (3NF)",
    prompt:
      "Tabellen Kunde(kundeNr, navn, postNr, poststed) bryter 3NF. Dra stegene for å fikse den.",
    topic: "Normalisering",
    items: [
      "Identifiser FD-er: kundeNr → navn, postNr;  postNr → poststed",
      "Se at poststed avhenger av postNr (ikke-nøkkelfelt) — transitiv avhengighet",
      "Lag ny tabell Poststed(postNr, poststed) med PK = postNr",
      "La Kunde beholde (kundeNr, navn, postNr) — uten poststed",
      "Legg til FK i Kunde: postNr → Poststed(postNr)",
    ],
    explanation:
      "Resultatet: poststed lagres ÉN gang per postnummer. Endrer Posten et stedsnavn, oppdateres ett sted istedenfor på alle kunder.",
  },
  {
    id: "d-fill-norm-2nf",
    kind: "fill",
    title: "Fyll inn Produkt-tabellen (2NF)",
    prompt:
      "Vi splitter Ordrelinje(ordreNr, prodNr, antall, prodNavn, prodPris) til 2NF. Fyll inn riktige nøkkelord i de to nye tabellene.",
    topic: "Normalisering",
    template:
      "CREATE TABLE Produkt (\n  prodNr INT __1__ KEY,\n  prodNavn VARCHAR(80),\n  prodPris DECIMAL(8,2)\n);\n\nCREATE TABLE Ordrelinje (\n  ordreNr INT,\n  prodNr  INT,\n  antall  INT,\n  PRIMARY KEY (__2__, __3__),\n  FOREIGN KEY (prodNr) __4__ Produkt(prodNr)\n);",
    blanks: ["PRIMARY", "ordreNr", "prodNr", "REFERENCES"],
    options: [
      "PRIMARY",
      "FOREIGN",
      "UNIQUE",
      "ordreNr",
      "prodNr",
      "antall",
      "prodNavn",
      "REFERENCES",
      "ON",
      "AS",
    ],
    explanation:
      "Sammensatt PK (ordreNr, prodNr) sikrer at samme produkt ikke legges to ganger på samme ordre. prodNavn og prodPris er flyttet til Produkt — de avhenger bare av prodNr.",
  },
  {
    id: "d-fill-norm-3nf",
    kind: "fill",
    title: "Fyll inn Poststed-tabellen (3NF)",
    prompt:
      "Vi splitter Kunde(kundeNr, navn, postNr, poststed) til 3NF. Fyll ut nøkkelordene.",
    topic: "Normalisering",
    template:
      "CREATE TABLE Poststed (\n  postNr   CHAR(4) PRIMARY KEY,\n  poststed VARCHAR(40) __1__ NULL\n);\n\nCREATE TABLE Kunde (\n  kundeNr INT PRIMARY KEY,\n  navn    VARCHAR(80),\n  postNr  CHAR(4),\n  __2__ KEY (postNr) __3__ Poststed(__4__)\n);",
    blanks: ["NOT", "FOREIGN", "REFERENCES", "postNr"],
    options: [
      "NOT",
      "IS",
      "FOREIGN",
      "PRIMARY",
      "UNIQUE",
      "REFERENCES",
      "ON",
      "postNr",
      "poststed",
      "kundeNr",
    ],
    explanation:
      "Etter 3NF lagres hvert poststed nøyaktig én gang. Kunde har bare en FK til Poststed — selve stedsnavnet hentes via JOIN når det trengs.",
  },

  // ============ ER-MODELL ============
  {
    id: "d-match-er-mapping",
    kind: "match",
    title: "ER → tabell-regler",
    prompt:
      "Match hver ER-konstruksjon til hvordan den skal bli i tabellene (mapping-reglene).",
    topic: "ER-modell",
    pairs: [
      { left: "Entitet (rektangel)", right: "Egen tabell med primærnøkkel" },
      {
        left: "1:N-relasjon",
        right: "Fremmednøkkel på MANGE-siden",
      },
      {
        left: "M:N-relasjon",
        right: "Egen koblingstabell med (FK_a, FK_b) som sammensatt PK",
      },
      {
        left: "1:1-relasjon",
        right: "FK på én side med UNIQUE, eller slå sammen til én tabell",
      },
      {
        left: "Flerverdi-attributt",
        right: "Egen tabell med FK tilbake til eier",
      },
      {
        left: "Svak entitet",
        right: "PK = (FK til eier, eget delvis ID)",
      },
      {
        left: "Total deltakelse (| innerst)",
        right: "NOT NULL på fremmednøkkelen",
      },
    ],
  },
  {
    id: "d-match-er-symbols",
    kind: "match",
    title: "Kråkefot-symboler",
    prompt: "Match hvert kråkefot-symbol til betydningen sin.",
    topic: "ER-modell",
    pairs: [
      { left: "| |", right: "Nøyaktig én (1..1, obligatorisk)" },
      { left: "O |", right: "Null eller én (0..1, valgfri)" },
      { left: "| <", right: "Én eller flere (1..N, obligatorisk mange)" },
      { left: "O <", right: "Null eller flere (0..N, valgfri mange)" },
    ],
  },
  {
    id: "d-match-er-attrtyper",
    kind: "match",
    title: "Attributt-typer",
    prompt: "Match hvert attributt-eksempel til riktig type.",
    topic: "ER-modell",
    pairs: [
      { left: "fornavn", right: "Enkelt attributt — én atomisk verdi" },
      {
        left: "adresse (gate, postnr, sted)",
        right: "Sammensatt — flere kolonner i samme tabell",
      },
      {
        left: "telefonnumre (kan ha flere)",
        right: "Flerverdi — egen tabell med FK",
      },
      {
        left: "alder (utregnes fra fødselsdato)",
        right: "Avledet — beregnes, lagres ofte ikke",
      },
      {
        left: "kundeNr",
        right: "Nøkkel-attributt — identifiserer entiteten",
      },
    ],
  },
  {
    id: "d-match-er-ordliste",
    kind: "match",
    title: "ER-ordliste norsk → engelsk",
    prompt: "Match norske begreper til engelsk/SQL-ekvivalent.",
    topic: "ER-modell",
    pairs: [
      { left: "Entitet", right: "Entity (≈ tabell)" },
      { left: "Attributt", right: "Attribute (≈ kolonne)" },
      { left: "Primærnøkkel", right: "Primary key (PK)" },
      { left: "Fremmednøkkel", right: "Foreign key (FK)" },
      { left: "Kardinalitet", right: "Cardinality (1, N, M)" },
      { left: "Deltakelse", right: "Participation (total / partial)" },
      { left: "Koblingstabell", right: "Junction / linking table" },
      { left: "Svak entitet", right: "Weak entity" },
    ],
  },
  {
    id: "d-order-er-checklist",
    kind: "order",
    title: "Tegn et ER-diagram — sjekkliste",
    prompt: "Dra stegene i riktig rekkefølge for å bygge et ER-diagram.",
    topic: "ER-modell",
    items: [
      "Finn entitetene (substantivene): KUNDE, ORDRE, PRODUKT…",
      "Sett opp attributter for hver entitet og marker primærnøkkel (understrek)",
      "Finn relasjonene (verbene): «kunde legger inn ordre»",
      "For hver relasjon, bestem kardinalitet (1:1, 1:N, M:N) i begge retninger",
      "Bestem deltakelse (total/valgfri) i begge retninger",
      "Identifiser M:N-relasjoner — lag koblingstabell med eventuelle relasjons-attributter",
      "Sjekk svake entiteter (eksisterer bare gjennom en eier)",
      "Skriv ut tabellene: PK understreket, FK med pil/notasjon",
    ],
    explanation:
      "Huskeregel for FK ved 1:N: «FK-en bor på mange-siden». Den siden som peker mot 1 er der FK-en hører hjemme.",
  },
  {
    id: "d-order-er-mn-mapping",
    kind: "order",
    title: "Mappe en M:N-relasjon",
    prompt:
      "Student tar Fag (M:N) med attributtet semester. Dra stegene for å mappe det til tabeller.",
    topic: "ER-modell",
    items: [
      "Behold STUDENT(sid, navn) som egen tabell",
      "Behold FAG(fkode, tittel) som egen tabell",
      "Lag koblingstabell TAR(sid, fkode, semester)",
      "Sett sammensatt PK = (sid, fkode) i TAR",
      "Legg til FK: TAR.sid → STUDENT(sid)",
      "Legg til FK: TAR.fkode → FAG(fkode)",
    ],
    explanation:
      "Sammensatt PK (sid, fkode) hindrer at samme student tar samme fag dobbelt. Relasjons-attributtet «semester» hører hjemme i koblingstabellen — ikke i STUDENT eller FAG.",
  },
  {
    id: "d-fill-er-1n",
    kind: "fill",
    title: "Mappe 1:N (Kunde — Bestilling)",
    prompt:
      "KUNDE ||——O< BESTILLING. Plasser fremmednøkkelen riktig og fyll ut SQL.",
    topic: "ER-modell",
    template:
      "CREATE TABLE Kunde (\n  kundeNr INT __1__ KEY,\n  navn    VARCHAR(80)\n);\n\nCREATE TABLE Bestilling (\n  bestNr  INT PRIMARY KEY,\n  dato    DATE,\n  __2__   INT NOT NULL,\n  FOREIGN KEY (kundeNr) __3__ Kunde(__4__)\n);",
    blanks: ["PRIMARY", "kundeNr", "REFERENCES", "kundeNr"],
    options: [
      "PRIMARY",
      "FOREIGN",
      "UNIQUE",
      "kundeNr",
      "bestNr",
      "navn",
      "REFERENCES",
      "ON",
      "AS",
    ],
    explanation:
      "FK bor på mange-siden — Bestilling er mange-siden, så kundeNr legges der. NOT NULL fordi diagrammet viser «||» (total deltakelse) på Bestilling-siden.",
  },
  {
    id: "d-fill-er-mn",
    kind: "fill",
    title: "Mappe M:N (Student — Fag)",
    prompt:
      "STUDENT >O——O< FAG, med attributtet «semester» på relasjonen. Lag koblingstabellen.",
    topic: "ER-modell",
    template:
      "CREATE TABLE Tar (\n  sid      INT,\n  fkode    CHAR(6),\n  semester VARCHAR(10),\n  PRIMARY KEY (__1__, __2__),\n  FOREIGN KEY (sid)   __3__ Student(sid),\n  FOREIGN KEY (fkode) __4__ Fag(fkode)\n);",
    blanks: ["sid", "fkode", "REFERENCES", "REFERENCES"],
    options: [
      "sid",
      "fkode",
      "semester",
      "REFERENCES",
      "REFERENCES",
      "ON",
      "PRIMARY",
      "UNIQUE",
    ],
    explanation:
      "Koblingstabellen har sammensatt PK (sid, fkode) — det hindrer dobbelt-registrering. Relasjons-attributtet «semester» hører hjemme her, ikke i Student eller Fag.",
  },
  {
    id: "d-fill-er-11",
    kind: "fill",
    title: "Mappe 1:1 (Person — Pass)",
    prompt:
      "PERSON ||——O| PASS. FK på Pass-siden — sørg for at hvert pass tilhører maks én person.",
    topic: "ER-modell",
    template:
      "CREATE TABLE Person (\n  pid  INT PRIMARY KEY,\n  navn VARCHAR(80)\n);\n\nCREATE TABLE Pass (\n  passNr  CHAR(9) PRIMARY KEY,\n  utstedt DATE,\n  pid     INT __1__,\n  FOREIGN KEY (pid) __2__ Person(pid)\n);",
    blanks: ["UNIQUE", "REFERENCES"],
    options: ["UNIQUE", "PRIMARY", "FOREIGN", "NOT", "REFERENCES", "ON", "AS"],
    explanation:
      "UNIQUE på FK-en gjør 1:1-relasjonen ekte — uten UNIQUE kunne flere pass pekt på samme person (= 1:N). Pass har valgfri deltakelse mot Person, så UNIQUE alene holder; for total deltakelse legges også NOT NULL til.",
  },

  // ============ KRÅKEFOT (visuelle relasjoner) ============
  // Konvensjon: symbolet nær entitet X beskriver «hvor mange X per én av den andre».
  {
    id: "d-cf-kunde-bestilling",
    kind: "crowsfoot",
    title: "KUNDE — BESTILLING",
    prompt: "Plasser kråkefot-symbolene som beskriver relasjonen.",
    topic: "ER-modell",
    scenario:
      "En kunde kan ha 0, én eller mange bestillinger. Hver bestilling tilhører nøyaktig én kunde.",
    entityA: "KUNDE",
    entityB: "BESTILLING",
    answer: { aMin: "|", aMax: "|", bMin: "O", bMax: "<" },
    explanation:
      "Symbolene nær KUNDE (||) leses «for én bestilling, akkurat 1 kunde». Symbolene nær BESTILLING (O<) leses «for én kunde, 0..N bestillinger».",
  },
  {
    id: "d-cf-bestilling-linje",
    kind: "crowsfoot",
    title: "BESTILLING — ORDRELINJE",
    prompt: "Bestillingen MÅ ha minst én linje. Plasser symbolene.",
    topic: "ER-modell",
    scenario:
      "Hver bestilling består av én eller flere ordrelinjer (minst én — ellers er den ikke en bestilling). Hver ordrelinje hører til nøyaktig én bestilling.",
    entityA: "BESTILLING",
    entityB: "ORDRELINJE",
    answer: { aMin: "|", aMax: "|", bMin: "|", bMax: "<" },
    explanation:
      "Total deltakelse fra ORDRELINJE-siden («|» innerst nær BESTILLING) — en ordrelinje må alltid ha en bestilling. På BESTILLING-siden er det «|<» fordi det skal være MINST én linje per bestilling.",
  },
  {
    id: "d-cf-linje-produkt",
    kind: "crowsfoot",
    title: "ORDRELINJE — PRODUKT",
    prompt: "Plasser symbolene for relasjonen mellom ordrelinje og produkt.",
    topic: "ER-modell",
    scenario:
      "Hver ordrelinje peker på nøyaktig ett produkt. Et produkt kan finnes på 0, én eller mange ordrelinjer (helt nye produkter er ennå ikke solgt).",
    entityA: "ORDRELINJE",
    entityB: "PRODUKT",
    answer: { aMin: "O", aMax: "<", bMin: "|", bMax: "|" },
    explanation:
      "Nær ORDRELINJE: «O<» — for ett produkt finnes 0..N ordrelinjer (ferskt produkt har ingen). Nær PRODUKT: «||» — hver ordrelinje har akkurat ett produkt.",
  },
  {
    id: "d-cf-person-pass",
    kind: "crowsfoot",
    title: "PERSON — PASS (1:1)",
    prompt: "1:1-relasjon med valgfri deltakelse på pass-siden.",
    topic: "ER-modell",
    scenario:
      "Hver person kan ha ett pass eller ingen (ikke alle har pass). Hvert pass tilhører nøyaktig én person.",
    entityA: "PERSON",
    entityB: "PASS",
    answer: { aMin: "|", aMax: "|", bMin: "O", bMax: "|" },
    explanation:
      "1:1-relasjoner kjennes igjen ved at YTRE symbol er «|» på begge sider (ikke kråkefot). Forskjellen ligger i indre symbolet: O = valgfri, | = obligatorisk.",
  },
  {
    id: "d-cf-student-fag",
    kind: "crowsfoot",
    title: "STUDENT — FAG (M:N)",
    prompt: "En klassisk mange-til-mange. Plasser symbolene.",
    topic: "ER-modell",
    scenario:
      "En student kan ta 0..N fag. Et fag kan ha 0..N studenter. Begge sider er valgfrie (et nyopprettet fag har ingen studenter ennå).",
    entityA: "STUDENT",
    entityB: "FAG",
    answer: { aMin: "O", aMax: "<", bMin: "O", bMax: "<" },
    explanation:
      "M:N kjennes igjen ved at YTRE symbol er «<» (kråkefot) på BEGGE sider. Når du ser dette mønsteret, vet du at du trenger en koblingstabell — TAR(sid, fkode).",
  },
  {
    id: "d-cf-ansatt-avdeling",
    kind: "crowsfoot",
    title: "ANSATT — AVDELING",
    prompt: "Hver ansatt jobber i en avdeling. Avdelinger har minst én ansatt.",
    topic: "ER-modell",
    scenario:
      "Hver ansatt er knyttet til nøyaktig én avdeling. Hver avdeling har minst én ansatt (ellers slettes avdelingen).",
    entityA: "ANSATT",
    entityB: "AVDELING",
    answer: { aMin: "|", aMax: "<", bMin: "|", bMax: "|" },
    explanation:
      "Nær ANSATT: «|<» — én avdeling har 1..N ansatte (minst én). Nær AVDELING: «||» — hver ansatt har akkurat én avdeling. FK ligger på mange-siden (Ansatt.avdNr).",
  },
  {
    id: "d-cf-faktura-betaling",
    kind: "crowsfoot",
    title: "FAKTURA — BETALING",
    prompt: "En faktura kan delbetales eller ikke betales ennå.",
    topic: "ER-modell",
    scenario:
      "En faktura kan ha 0..N betalinger (ikke betalt, eller delbetalt over flere ganger). Hver betaling tilhører nøyaktig én faktura.",
    entityA: "FAKTURA",
    entityB: "BETALING",
    answer: { aMin: "|", aMax: "|", bMin: "O", bMax: "<" },
    explanation:
      "Klassisk 1:N med valgfri deltakelse på mange-siden. FK Betaling.fakturaNr er NOT NULL (total fra betalings-siden), men en faktura trenger ikke ha betalinger ennå.",
  },
  {
    id: "d-cf-forfatter-bok",
    kind: "crowsfoot",
    title: "FORFATTER — BOK",
    prompt: "Bøker kan ha flere forfattere. Forfattere har vanligvis skrevet noe.",
    topic: "ER-modell",
    scenario:
      "En bok kan ha én eller flere forfattere (minst én). En forfatter har skrevet 0..N bøker (vi tar med forfattere som ennå ikke har gitt ut noe).",
    entityA: "FORFATTER",
    entityB: "BOK",
    answer: { aMin: "|", aMax: "<", bMin: "O", bMax: "<" },
    explanation:
      "M:N: ytre «<» på begge sider. Indre er forskjellig — bok må ha minst én forfatter («|» nær FORFATTER), men forfatter trenger ikke ha bok («O» nær BOK). Trengs koblingstabell SKREVET(forfNr, bokNr).",
  },
  {
    id: "d-cf-bil-registrering",
    kind: "crowsfoot",
    title: "BIL — REGISTRERING (1:1, oblig.)",
    prompt: "I dette landet kan ikke en bil eksistere uten registrering.",
    topic: "ER-modell",
    scenario:
      "Hver bil må ha nøyaktig én registrering. Hver registrering er knyttet til nøyaktig én bil. Ingen av sidene er valgfrie.",
    entityA: "BIL",
    entityB: "REGISTRERING",
    answer: { aMin: "|", aMax: "|", bMin: "|", bMax: "|" },
    explanation:
      "Total 1:1: alle fire symboler er «|». Mappes ofte ved å slå sammen til én tabell, eller med FK + UNIQUE + NOT NULL på én side.",
  },
  {
    id: "d-cf-leder-ansatt",
    kind: "crowsfoot",
    title: "ANSATT — LEDER (rekursiv)",
    prompt: "En ansatt har en leder, som også er ansatt. Toppsjefen har ingen leder.",
    topic: "ER-modell",
    scenario:
      "Hver ansatt har 0 eller én leder (toppsjefen har ingen). En leder kan ha 0..N underordnede. A = «den ansatte», B = «leder-rollen». ",
    entityA: "ANSATT",
    entityB: "LEDER",
    answer: { aMin: "O", aMax: "<", bMin: "O", bMax: "|" },
    explanation:
      "Rekursive relasjoner mappes med en FK i samme tabell — Ansatt.lederNr → Ansatt.ansattNr. FK kan være NULL (toppsjefen har ingen). En leder kan ha 0..N underordnede, så «O<» på A-siden.",
  },

  // ============ KAP. 6 — RELASJONSALGEBRA ============
  {
    id: "d-match-algebra",
    kind: "match",
    title: "Relasjonsalgebra → SQL",
    prompt: "Koble hver algebra-operator til riktig SQL-uttrykk.",
    topic: "Relasjonsalgebra",
    pairs: [
      { left: "σ (seleksjon)", right: "WHERE — velger ut rader" },
      { left: "π (projeksjon)", right: "SELECT kolonner — velger ut kolonner" },
      { left: "⋈ (natural join)", right: "INNER JOIN på felles kolonnenavn" },
      { left: "× (kartesisk produkt)", right: "CROSS JOIN — alle kombinasjoner" },
      { left: "∪ (union)", right: "UNION — rader i A eller B" },
      { left: "∩ (snitt)", right: "INTERSECT — rader i begge" },
      { left: "− (differanse)", right: "EXCEPT / MINUS — i A, ikke i B" },
      { left: "ρ (renaming)", right: "AS — alias for tabell eller kolonne" },
    ],
  },
  {
    id: "d-match-integritet",
    kind: "match",
    title: "Integritetsregler",
    prompt: "Koble hver integritetsregel til riktig forklaring.",
    topic: "Integritet",
    pairs: [
      { left: "Entitetsintegritet", right: "Primærnøkkelen kan ikke være NULL" },
      {
        left: "Referanseintegritet",
        right: "Fremmednøkkel må peke på en eksisterende rad (eller være NULL)",
      },
      {
        left: "Domeneintegritet",
        right: "Hver verdi må være innenfor sin datatype og CHECK-skranke",
      },
      {
        left: "Brukerdefinerte skranker",
        right: "Forretningsregler (eks. salgsdato ≥ produksjonsdato)",
      },
    ],
  },
  {
    id: "d-fill-relalg-equiv",
    kind: "fill",
    title: "Algebrauttrykk → SQL",
    prompt:
      "Algebrauttrykket π_navn,pris(σ_pris>100(Produkt)) skal oversettes til SQL. Fyll inn de manglende delene.",
    topic: "Relasjonsalgebra",
    template: "SELECT __1__\nFROM __2__\nWHERE __3__;",
    blanks: ["DISTINCT navn, pris", "Produkt", "pris > 100"],
    options: [
      "DISTINCT navn, pris",
      "Produkt",
      "pris > 100",
      "*",
      "navn AND pris",
      "pris >= 100",
    ],
    language: "sql",
    explanation:
      "Seleksjon (σ) blir WHERE, projeksjon (π) blir kolonnelisten — algebra fjerner duplikater, så DISTINCT er presis.",
  },

  // ============ KAP. 9 — INDEKSER ============
  {
    id: "d-match-indeks",
    kind: "match",
    title: "Indekstyper og bruk",
    prompt: "Koble hver indekssituasjon til riktig vurdering.",
    topic: "Indeks",
    pairs: [
      { left: "WHERE pris > 100 på stor tabell", right: "B-tre-indeks: bra (område-søk)" },
      { left: "WHERE epost = 'x@y'", right: "B-tre eller hash: begge fungerer for likhet" },
      { left: "LIKE '%foo'", right: "Full scan — leading wildcard hindrer indeks" },
      { left: "Lite tabell (< 1000 rader)", right: "Indeks ofte ikke verdt det — full scan er rask" },
      { left: "Mange INSERT/sek på loggtabell", right: "Færre indekser → raskere skriv" },
      { left: "Boolean-kolonne (få distinkte verdier)", right: "Indeks gir liten gevinst" },
    ],
  },
  {
    id: "d-fill-create-index",
    kind: "fill",
    title: "Opprett en indeks",
    prompt:
      "Du har stor Bestilling-tabell og kjører ofte WHERE kunde_id = ?. Lag indeks på kunde_id.",
    topic: "Indeks",
    template: "__1__ INDEX __2__ ON __3__ (__4__);",
    blanks: ["CREATE", "idx_bestilling_kunde", "Bestilling", "kunde_id"],
    options: [
      "CREATE",
      "ALTER",
      "idx_bestilling_kunde",
      "Bestilling",
      "kunde_id",
      "*",
      "PRIMARY KEY",
    ],
    language: "sql",
    explanation:
      "CREATE INDEX <navn> ON <tabell>(<kolonner>). Konvensjon: prefiks idx_ + tabell + kolonne(r) gjør formålet tydelig.",
  },

  // ============ KAP. 10 — TRANSAKSJONER ============
  {
    id: "d-match-anomalier",
    kind: "match",
    title: "Anomali → minste isolasjonsnivå som forhindrer den",
    prompt: "Koble hver samtidighets-anomali til det laveste nivået som hindrer den.",
    topic: "Transaksjoner",
    pairs: [
      { left: "Dirty read", right: "READ COMMITTED" },
      { left: "Non-repeatable read", right: "REPEATABLE READ" },
      { left: "Phantom read", right: "SERIALIZABLE" },
      { left: "Lost update", right: "Eksplisitte låser eller versjonsnummer" },
    ],
  },
  {
    id: "d-order-bankoverf",
    kind: "order",
    title: "Trygg overføring 100 kr fra konto A til B",
    prompt: "Sett operasjonene i riktig rekkefølge slik at overføringen er atomisk.",
    topic: "Transaksjoner",
    items: [
      "BEGIN TRANSACTION;",
      "UPDATE Konto SET saldo = saldo - 100 WHERE id = 'A';",
      "UPDATE Konto SET saldo = saldo + 100 WHERE id = 'B';",
      "-- sjekk at A.saldo ≥ 0; ellers ROLLBACK",
      "COMMIT;",
    ],
    explanation:
      "Begge UPDATE-ene må ligge inne i samme transaksjon — uten det kan systemet krasje midt i og la pengene 'forsvinne'. Sjekk på saldo og ROLLBACK gir konsistens.",
  },
  {
    id: "d-fill-savepoint",
    kind: "fill",
    title: "Bruk SAVEPOINT inni en transaksjon",
    prompt:
      "Inni en transaksjon vil du ha mulighet til å rulle tilbake bare den siste delen om noe feiler.",
    topic: "Transaksjoner",
    template:
      "BEGIN;\nUPDATE A SET x = 1;\n__1__ s1;\nUPDATE B SET y = 2;\n-- noe feilet\n__2__ __3__ s1;\nCOMMIT;",
    blanks: ["SAVEPOINT", "ROLLBACK", "TO"],
    options: ["SAVEPOINT", "ROLLBACK", "TO", "BEGIN", "COMMIT", "RELEASE", "TRANSACTION"],
    language: "sql",
    explanation:
      "SAVEPOINT s1 setter et merke. ROLLBACK TO s1 ruller bare tilbake til merket — UPDATE A består, COMMIT gjelder.",
  },

  // ============= LAGRINGSMEDIER (kap. 4) =============
  {
    id: "d-match-storage",
    kind: "match",
    title: "Lagringsmedier — egenskap",
    prompt: "Match hvert lagringsmedium til den viktigste egenskapen.",
    topic: "Lagring",
    pairs: [
      { left: "HDD", right: "Roterende plater — billig, mye plass, men tregere" },
      { left: "SSD", right: "Ingen bevegelige deler — rask random read, dyrere" },
      { left: "RAM", right: "Ekstremt rask, men flyktig — data forsvinner ved strømbrudd" },
      { left: "Sider/blokker", right: "Enheten databasen leser av gangen for å redusere I/O" },
    ],
  },

  // ============= ON DELETE / FK-OPPFØRSEL (kap. 3) =============
  {
    id: "d-match-on-delete",
    kind: "match",
    title: "ON DELETE — hva skjer i barn-tabellen?",
    prompt: "Når en rad i foreldretabellen slettes — hva gjør hver ON DELETE-strategi?",
    topic: "Integritet",
    pairs: [
      { left: "CASCADE", right: "Slett relaterte rader i barn-tabellen automatisk" },
      { left: "SET NULL", right: "Sett FK-kolonnen til NULL i barn-radene" },
      { left: "RESTRICT", right: "Forhindre slettingen hvis det finnes barn-rader" },
      { left: "NO ACTION", right: "Ligner RESTRICT — sjekken kan utsettes til transaksjons-slutt" },
    ],
  },

  // ============= MYSQL WORKBENCH (kap. 8) =============
  {
    id: "d-match-workbench",
    kind: "match",
    title: "MySQL Workbench — funksjoner",
    prompt: "Match hver Workbench-funksjon til hva den gjør.",
    topic: "Verktøy",
    pairs: [
      { left: "Forward Engineer", right: "Generer database (CREATE TABLE) fra ER-diagram" },
      { left: "Reverse Engineer", right: "Bygg ER-diagram fra eksisterende database" },
      { left: "Data Export", right: "Lag SQL-fil (mysqldump) for backup eller flytting" },
      { left: "Data Import", right: "Kjør en SQL-fil for å gjenopprette eller importere database" },
      { left: "Set as Default Schema", right: "Velg hvilken database SQL-spørringer kjøres mot" },
    ],
  },

  // ============= GIT (kap. 8) =============
  {
    id: "d-order-git",
    kind: "order",
    title: "Første push av et nytt prosjekt til GitHub",
    prompt: "Sett kommandoene i riktig rekkefølge fra tom mappe til pushet repo.",
    topic: "Git",
    items: [
      "git init",
      "git add .",
      "git commit -m \"første commit\"",
      "git remote add origin <url>",
      "git push -u origin main",
    ],
    explanation:
      "init lager .git-mappen, add staser endringer, commit lagrer dem lokalt, remote add kobler til GitHub-repoet, push -u sender dem opp og setter upstream slik at senere `git push` alene fungerer.",
  },

  // ============= HTTP-METODER (kap. 7) =============
  {
    id: "d-match-http-methods-rest",
    kind: "match",
    title: "HTTP-metoder — bruksområde",
    prompt: "Match hver HTTP-metode til vanlig bruk i et REST-API.",
    topic: "HTTP",
    pairs: [
      { left: "GET", right: "Hente data — skal ikke endre serverstate" },
      { left: "POST", right: "Opprette ny ressurs (eller annen ikke-idempotent handling)" },
      { left: "PUT", right: "Erstatte hele ressursen" },
      { left: "PATCH", right: "Oppdatere deler av ressursen" },
      { left: "DELETE", right: "Slette ressursen" },
    ],
  },

  // ============= HTML SEMANTIKK (kap. 5) =============
  {
    id: "d-match-html-semantic",
    kind: "match",
    title: "Semantiske HTML5-elementer",
    prompt: "Match hver semantiske tag til hva den representerer.",
    topic: "HTML",
    pairs: [
      { left: "<header>", right: "Toppen av siden eller en seksjon — typisk logo og tittel" },
      { left: "<nav>", right: "Navigasjonsmeny — lenker til andre sider" },
      { left: "<main>", right: "Hovedinnholdet — det unike på akkurat denne siden" },
      { left: "<section>", right: "En tematisk del av innholdet" },
      { left: "<article>", right: "Selvstendig innhold som kan stå alene (blogg-innlegg, nyhet)" },
      { left: "<footer>", right: "Bunnen av siden — copyright, lenker, kontakt" },
    ],
  },

  // ============= CSS-EGENSKAPER (kap. 5) =============
  {
    id: "d-match-css",
    kind: "match",
    title: "CSS-egenskaper",
    prompt: "Match hver CSS-egenskap til hva den styrer.",
    topic: "CSS",
    pairs: [
      { left: "color", right: "Tekstfarge" },
      { left: "background-color", right: "Bakgrunnsfarge" },
      { left: "margin", right: "Plass UTENFOR elementets ramme" },
      { left: "padding", right: "Plass INNENFOR elementets ramme" },
      { left: "font-family", right: "Hvilken skrifttype som brukes" },
      { left: "display", right: "Hvordan elementet legger seg ut (block, flex, grid, none)" },
    ],
  },

  // ============= DATATYPER (kap. 1) =============
  {
    id: "d-match-datatypes",
    kind: "match",
    title: "SQL-datatyper",
    prompt: "Match hver kolonneverdi til riktig datatype.",
    topic: "Datatyper",
    pairs: [
      { left: "KundeNr (1, 2, 3, …)", right: "INT" },
      { left: "Fornavn (\"Ola\", \"Kari\")", right: "VARCHAR(50)" },
      { left: "Født (1995-04-12)", right: "DATE" },
      { left: "Pris (199.90)", right: "DECIMAL(10,2)" },
      { left: "Beskrivelse (lang tekst)", right: "TEXT" },
      { left: "Aktiv (sant/usant)", right: "BOOLEAN / TINYINT(1)" },
    ],
  },

  // ============= GRANT-SYNTAKS (kap. 4) =============
  {
    id: "d-fill-grant",
    kind: "fill",
    title: "Gi en bruker leserettighet",
    prompt: "Fyll inn riktig SQL for å gi student-brukeren bare lesetilgang.",
    topic: "Rettigheter",
    template: "__1__ __2__\n  __3__ EmployeeDB.*\n  __4__ 'student'@'localhost';",
    blanks: ["GRANT", "SELECT", "ON", "TO"],
    options: ["GRANT", "SELECT", "INSERT", "ON", "TO", "FROM", "REVOKE", "WITH"],
    language: "sql",
    explanation:
      "GRANT <privilegier> ON <database>.<tabell> TO '<bruker>'@'<host>'. SELECT alene gir kun lesetilgang — prinsippet om minste privilegium.",
  },

  // ============= MYSQLDUMP (kap. 8) =============
  {
    id: "d-fill-mysqldump",
    kind: "fill",
    title: "Backup av database med mysqldump",
    prompt: "Fyll inn kommandoen som lager en SQL-backup av databasen EmployeeDB.",
    topic: "Backup",
    template: "__1__ -u root __2__ EmployeeDB __3__ backup.sql",
    blanks: ["mysqldump", "-p", ">"],
    options: ["mysqldump", "mysql", "-p", "-u", ">", "<", "|", "backup"],
    explanation:
      "mysqldump er eksport-verktøyet (mysql er klienten for å kjøre SQL). -p ber om passord. > omdirigerer output til fila. For å importere igjen: mysql -u root -p EmployeeDB < backup.sql",
  },

  // ============= ANOMALIER + ISOLATION (eksisterende d-match-anomalier finnes — droppes for å unngå duplikat) =============

  // ============= NORMALISERING (utvidet — 1NF, 2NF, 3NF, BCNF) =============
  // Skikkelige oppgaver: identifisere brudd, finne FD-er, dekomponere, og skrive
  // riktig CREATE TABLE. Hver oppgave bygger på et konkret, navngitt skjema.

  {
    id: "d-match-norm-fd-finn",
    kind: "match",
    title: "Finn funksjonelle avhengigheter (FD-er)",
    prompt:
      "Tabellen Ansatt(ansattNr, fnavn, enavn, avdNr, avdNavn, byggNavn) — koble hver attributt til riktig determinant. «X → Y» leses «X bestemmer Y».",
    topic: "Normalisering",
    pairs: [
      { left: "fnavn, enavn", right: "ansattNr → fnavn, enavn" },
      { left: "avdNr (per ansatt)", right: "ansattNr → avdNr" },
      { left: "avdNavn", right: "avdNr → avdNavn (transitiv)" },
      { left: "byggNavn", right: "avdNr → byggNavn (transitiv)" },
    ],
    explanation:
      "ansattNr bestemmer ALT direkte. Men avdNavn og byggNavn avhenger «via» avdNr — det er transitive avhengigheter. Det er nettopp det 3NF fjerner.",
  },
  {
    id: "d-match-norm-keys",
    kind: "match",
    title: "Nøkkel-typer",
    prompt: "Koble hvert begrep til riktig definisjon. Forskjellen er strikt og kommer ofte på eksamen.",
    topic: "Normalisering",
    pairs: [
      {
        left: "Superkey",
        right: "En kombinasjon som identifiserer hver rad unikt — kan inneholde overflødige felter",
      },
      {
        left: "Kandidatnøkkel",
        right: "MINIMAL superkey — fjerner du én kolonne mister du unikheten",
      },
      {
        left: "Primærnøkkel (PK)",
        right: "Den kandidatnøkkelen vi velger som offisiell — én per tabell",
      },
      {
        left: "Alternativ nøkkel",
        right: "Kandidatnøkkel som IKKE ble valgt som PK — får UNIQUE-constraint",
      },
      {
        left: "Fremmednøkkel (FK)",
        right: "Peker på en kandidatnøkkel (oftest PK) i en annen tabell",
      },
    ],
  },
  {
    id: "d-match-norm-level",
    kind: "match",
    title: "Hvilken normalform er tabellen i?",
    prompt:
      "Bare ÉN normalform er den høyeste hver tabell oppfyller. Match. Husk: bryter du 2NF, er du ikke i 3NF heller.",
    topic: "Normalisering",
    pairs: [
      {
        left: "Person(id, navn, hobbier='golf, sjakk')",
        right: "Ikke i 1NF — flerverdi-felt",
      },
      {
        left: "Ordrelinje(ordreNr, prodNr, antall, prodNavn) PK=(ordreNr,prodNr)",
        right: "1NF (bryter 2NF — prodNavn er partiell)",
      },
      {
        left: "Kunde(id, navn, postNr, poststed)",
        right: "2NF (bryter 3NF — poststed avhenger transitivt via postNr)",
      },
      {
        left: "Bok(isbn, tittel, forlagId) + Forlag(forlagId, navn)",
        right: "3NF — alle ikke-nøkkelfelt avhenger direkte av PK",
      },
    ],
    explanation:
      "Normalformene er kumulative: 3NF ⊂ 2NF ⊂ 1NF. Du må alltid svare med den HØYESTE formen tabellen oppfyller — bryter den 2NF, er den i 1NF (ikke i 3NF).",
  },
  {
    id: "d-match-norm-partiell-vs-trans",
    kind: "match",
    title: "Partiell vs. transitiv — hvilken er det?",
    prompt:
      "Hver avhengighet bryter enten 2NF (partiell — avhenger av DEL av PK) eller 3NF (transitiv — avhenger via et ikke-nøkkelfelt). Match.",
    topic: "Normalisering",
    pairs: [
      {
        left: "PK=(kursId, studId); kursId → kursNavn",
        right: "Partiell (2NF brudd) — kursNavn avhenger av halve PK",
      },
      {
        left: "PK=ansattNr; ansattNr → avdNr → avdNavn",
        right: "Transitiv (3NF brudd) — avdNavn avhenger «via» avdNr",
      },
      {
        left: "PK=(bilId, datoFra); bilId → modell",
        right: "Partiell (2NF brudd) — modell avhenger bare av bilId",
      },
      {
        left: "PK=isbn; isbn → forlagId → forlagAdresse",
        right: "Transitiv (3NF brudd) — forlagAdresse avhenger via forlagId",
      },
      {
        left: "PK=(ordreNr, varNr); (ordreNr, varNr) → antall",
        right: "Verken eller — antall avhenger av HELE PK, lovlig FD",
      },
    ],
    explanation:
      "Huskeregel: partielle avhengigheter kan BARE oppstå når PK er sammensatt (flere kolonner). Har tabellen én-kolonne PK, hopper du rett til 3NF-sjekken.",
  },
  {
    id: "d-order-norm-1nf-fix",
    kind: "order",
    title: "Splitt opp Person (1NF)",
    prompt:
      "Person(id, navn, telefoner='22 11 33, 99 88 77') bryter 1NF. Dra stegene for å fikse det.",
    topic: "Normalisering",
    items: [
      "Identifiser bruddet: kolonnen telefoner inneholder en liste av verdier",
      "Lag ny tabell Telefon(personId, nummer) med PK = (personId, nummer)",
      "Fjern telefoner-kolonnen fra Person",
      "Sett FK i Telefon: personId → Person(id), gjerne ON DELETE CASCADE",
      "Hver eksisterende verdi i den gamle listen blir én rad i Telefon",
    ],
    explanation:
      "1NF krever at hver celle er atomisk — én verdi per felt. Lister, kommaseparerte strenger og JSON-arrays bryter dette. Løsningen er ALLTID egen tabell, aldri «splitt på komma i SQL».",
  },
  {
    id: "d-order-norm-full-decompose",
    kind: "order",
    title: "Full normalisering: Levering → 3NF",
    prompt:
      "Levering(leveringId, kundeNr, kundeNavn, postNr, poststed, varer='melk;brød;ost') skal opp i 3NF. Dra stegene i riktig rekkefølge.",
    topic: "Normalisering",
    items: [
      "1NF: splitt varer-listen til egen tabell Leveringslinje(leveringId, vare) — PK=(leveringId, vare)",
      "Skriv ned FD-er: leveringId → kundeNr; kundeNr → kundeNavn, postNr; postNr → poststed",
      "2NF: PK i Levering er én kolonne — ingen partielle avhengigheter mulig, hopp over",
      "3NF: kundeNavn og postNr avhenger via kundeNr → flytt til Kunde(kundeNr, kundeNavn, postNr)",
      "3NF: poststed avhenger via postNr → flytt til Poststed(postNr, poststed)",
      "Levering beholder (leveringId, kundeNr) med FK kundeNr → Kunde(kundeNr)",
    ],
    explanation:
      "Når du normaliserer kjøreklart må du ofte gjennom flere brudd i ÉN tabell. Ta dem i rekkefølge 1NF → 2NF → 3NF. Ikke prøv å fikse alt på én gang — du mister oversikten.",
  },
  {
    id: "d-fill-norm-1nf",
    kind: "fill",
    title: "Lag Telefon-tabellen (1NF)",
    prompt:
      "Du splitter telefoner-listen ut av Person. Fyll inn nøkkelordene som gjør tabellen 1NF-konform.",
    topic: "Normalisering",
    language: "sql",
    template:
      "CREATE TABLE Person (\n  id   INT __1__ KEY,\n  navn VARCHAR(80) NOT NULL\n);\n\nCREATE TABLE Telefon (\n  personId INT,\n  nummer   VARCHAR(20),\n  PRIMARY KEY (__2__, __3__),\n  FOREIGN KEY (personId) __4__ Person(id) ON DELETE __5__\n);",
    blanks: ["PRIMARY", "personId", "nummer", "REFERENCES", "CASCADE"],
    options: [
      "PRIMARY",
      "FOREIGN",
      "UNIQUE",
      "personId",
      "nummer",
      "navn",
      "REFERENCES",
      "ON",
      "CASCADE",
      "RESTRICT",
      "SET",
    ],
    explanation:
      "Sammensatt PK (personId, nummer) hindrer at samme telefon registreres to ganger på samme person. ON DELETE CASCADE er vanlig her — sletter du personen vil du normalt også slette telefonene.",
  },
  {
    id: "d-fill-norm-2nf-ansatt-prosjekt",
    kind: "fill",
    title: "2NF — Ansatt på prosjekt",
    prompt:
      "AnsattProsjekt(ansattNr, prosjektNr, timer, ansattNavn, prosjektNavn) bryter 2NF. Splitt opp riktig.",
    topic: "Normalisering",
    language: "sql",
    template:
      "CREATE TABLE Ansatt (\n  ansattNr   INT PRIMARY KEY,\n  ansattNavn VARCHAR(80) __1__ NULL\n);\n\nCREATE TABLE Prosjekt (\n  prosjektNr   INT PRIMARY KEY,\n  prosjektNavn VARCHAR(80) NOT NULL\n);\n\nCREATE TABLE AnsattProsjekt (\n  ansattNr   INT,\n  prosjektNr INT,\n  timer      INT,\n  PRIMARY KEY (__2__, __3__),\n  __4__ KEY (ansattNr)   REFERENCES Ansatt(ansattNr),\n  __5__ KEY (prosjektNr) REFERENCES Prosjekt(prosjektNr)\n);",
    blanks: ["NOT", "ansattNr", "prosjektNr", "FOREIGN", "FOREIGN"],
    options: [
      "NOT",
      "IS",
      "ansattNr",
      "prosjektNr",
      "timer",
      "ansattNavn",
      "FOREIGN",
      "PRIMARY",
      "UNIQUE",
      "REFERENCES",
    ],
    explanation:
      "Etter splittingen avhenger timer av HELE PK (ansattNr, prosjektNr) — det er den eneste FD-en som gir mening i koblings-tabellen. ansattNavn og prosjektNavn er flyttet ut til hver sin egen tabell.",
  },
  {
    id: "d-fill-norm-3nf-ansatt-avd",
    kind: "fill",
    title: "3NF — Ansatt og avdeling",
    prompt:
      "Ansatt(ansattNr, navn, avdNr, avdNavn, byggNavn) bryter 3NF. avdNr → avdNavn, byggNavn er transitivt. Splitt ut Avdeling.",
    topic: "Normalisering",
    language: "sql",
    template:
      "CREATE TABLE Avdeling (\n  avdNr     INT __1__ KEY,\n  avdNavn   VARCHAR(80) NOT NULL,\n  byggNavn  VARCHAR(40)\n);\n\nCREATE TABLE Ansatt (\n  ansattNr INT PRIMARY KEY,\n  navn     VARCHAR(80) NOT NULL,\n  avdNr    INT,\n  __2__ KEY (avdNr) __3__ Avdeling(__4__)\n);",
    blanks: ["PRIMARY", "FOREIGN", "REFERENCES", "avdNr"],
    options: [
      "PRIMARY",
      "FOREIGN",
      "UNIQUE",
      "REFERENCES",
      "ON",
      "avdNr",
      "avdNavn",
      "byggNavn",
      "ansattNr",
    ],
    explanation:
      "Etter normaliseringen: avdNavn og byggNavn lagres ÉN gang per avdeling. Endrer du byggnavn må du nå oppdatere ett sted, ikke på hver ansatt. Det er hele poenget med 3NF.",
  },
  {
    id: "d-match-norm-anomali-konkret",
    kind: "match",
    title: "Anomalier i praksis — hva skjer hvis…?",
    prompt:
      "Tabellen Kurs(kursKode, kursNavn, studId, studNavn) lagrer hver student-deltakelse som én rad. Match scenariene til riktig anomali-type.",
    topic: "Normalisering",
    pairs: [
      {
        left: "Vi vil opprette MAT100 før noen har meldt seg på",
        right: "Innsettings-anomali — krever en student-rad for å lagre kurset",
      },
      {
        left: "Kurset bytter navn fra «Diskret matematikk» til «Diskrete strukturer»",
        right: "Oppdaterings-anomali — kursNavn må endres på MANGE rader",
      },
      {
        left: "Siste student melder seg av MAT100",
        right: "Slettings-anomali — info om kurset MAT100 forsvinner helt",
      },
      {
        left: "Per (studId=42) skifter etternavn",
        right: "Oppdaterings-anomali — studNavn må endres på alle Pers kurs",
      },
    ],
    explanation:
      "Alle tre anomali-typene rammer denne tabellen samtidig. Løsning: del i Student(studId, studNavn), Kurs(kursKode, kursNavn), og koblingstabell Pamelding(kursKode, studId).",
  },
  {
    id: "d-order-norm-decompose-bcnf",
    kind: "order",
    title: "Når 3NF ikke holder (BCNF)",
    prompt:
      "Bestilling(kunde, vare, selger) der hver selger selger BARE ett spesifikt vare-merke. PK=(kunde, vare). Determinant selger → vare bryter BCNF.",
    topic: "Normalisering",
    items: [
      "Finn alle FD-er: (kunde, vare) → selger;  selger → vare",
      "Sjekk: er hver determinant en kandidatnøkkel? selger er IKKE — det bryter BCNF",
      "Splitt ut SelgerVare(selger, vare) med PK = selger — selger-FD-en bor her",
      "La Bestilling beholde (kunde, selger) — vare er nå avledet via SelgerVare",
      "Legg FK selger → SelgerVare(selger). PK for Bestilling = (kunde, selger)",
    ],
    explanation:
      "BCNF (Boyce-Codd) er strengere enn 3NF: ALLE determinanter må være kandidatnøkler. 3NF tillater unntak for ikke-nøkkelfelt som inngår i en annen kandidatnøkkel — BCNF tillater ingen. På eksamen er 3NF ofte godt nok, men kjenn igjen mønsteret.",
  },
  {
    id: "d-fill-norm-mn-junction",
    kind: "fill",
    title: "M:N-koblingstabell — riktig skjema",
    prompt:
      "Student tar Fag M:N med relasjons-attributtet semester. Fyll inn det normaliserte skjemaet.",
    topic: "Normalisering",
    language: "sql",
    template:
      "CREATE TABLE Student (\n  sid  INT PRIMARY KEY,\n  navn VARCHAR(80)\n);\n\nCREATE TABLE Fag (\n  fkode  VARCHAR(8) PRIMARY KEY,\n  tittel VARCHAR(80)\n);\n\nCREATE TABLE Tar (\n  sid      INT,\n  fkode    VARCHAR(8),\n  __1__    VARCHAR(8),\n  __2__ KEY (sid, fkode),\n  FOREIGN KEY (sid)   __3__ Student(sid),\n  FOREIGN KEY (fkode) __4__ Fag(__5__)\n);",
    blanks: ["semester", "PRIMARY", "REFERENCES", "REFERENCES", "fkode"],
    options: [
      "semester",
      "tittel",
      "navn",
      "PRIMARY",
      "FOREIGN",
      "UNIQUE",
      "REFERENCES",
      "ON",
      "fkode",
      "sid",
      "tar",
    ],
    explanation:
      "Relasjons-attributtet semester hører hjemme i KOBLINGSTABELLEN — ikke i Student eller Fag. Det avhenger av begge sider (samme student kan ta samme fag i ulike semestre om PK utvides). Med PK=(sid, fkode) sperrer du dobbeltregistrering.",
  },

  // ============= KRÅKEFOT (utvidet — flere domener og spesialtilfeller) =============
  // Konvensjon: symbolet nær entitet X beskriver «hvor mange X per én av den andre».

  {
    id: "d-cf-pasient-lege",
    kind: "crowsfoot",
    title: "PASIENT — FASTLEGE",
    prompt: "Hver pasient har én fastlege; en lege har en pasient-liste.",
    topic: "ER-modell",
    scenario:
      "Hver pasient skal ha nøyaktig én fastlege. En fastlege har én eller flere pasienter (en lege uten pasienter regnes ikke som fastlege).",
    entityA: "PASIENT",
    entityB: "FASTLEGE",
    answer: { aMin: "|", aMax: "<", bMin: "|", bMax: "|" },
    explanation:
      "Nær PASIENT: «|<» — én fastlege har 1..N pasienter. Nær FASTLEGE: «||» — én pasient har akkurat én fastlege. FK Pasient.legeNr er NOT NULL (total deltakelse).",
  },
  {
    id: "d-cf-bok-utlan",
    kind: "crowsfoot",
    title: "BOK — UTLÅN",
    prompt: "Biblioteket: en bok kan lånes ut mange ganger, et utlån gjelder akkurat én bok.",
    topic: "ER-modell",
    scenario:
      "En bok kan ha 0..N utlån over tid (nye bøker har ingen utlån ennå). Hvert utlån gjelder nøyaktig én bok.",
    entityA: "BOK",
    entityB: "UTLÅN",
    answer: { aMin: "|", aMax: "|", bMin: "O", bMax: "<" },
    explanation:
      "Klassisk historisk 1:N. Et utlån eksisterer ikke uten bok (total mot BOK), men en bok finnes uavhengig av utlån. FK Utlån.bokId er NOT NULL.",
  },
  {
    id: "d-cf-bok-forfatter-mn",
    kind: "crowsfoot",
    title: "BOK — FORFATTER (begge oblig.)",
    prompt: "Hver bok må ha minst én forfatter, og vi tar bare med forfattere som har gitt ut noe.",
    topic: "ER-modell",
    scenario:
      "Hver bok har én eller flere forfattere. Hver forfatter har skrevet minst én bok (vi inkluderer ikke navn uten utgitte bøker).",
    entityA: "BOK",
    entityB: "FORFATTER",
    answer: { aMin: "|", aMax: "<", bMin: "|", bMax: "<" },
    explanation:
      "M:N med total deltakelse på BEGGE sider: alle fire indre symboler er «|», ytre er «<». Mappes til koblingstabell SKREVET(bokId, forfId) — og constraint at hver bok og hver forfatter må finnes minst én gang i tabellen kan kreve trigger/sjekk i applikasjonen.",
  },
  {
    id: "d-cf-flight-passasjer",
    kind: "crowsfoot",
    title: "FLIGHT — PASSASJER",
    prompt: "En flight kan gå tom; en passasjer kan reise mange ganger.",
    topic: "ER-modell",
    scenario:
      "En flight kan ha 0..N passasjerer (helt nyopprettet rute har ingen ennå). En passasjer kan ha 0..N flighter (registreres f.eks. via bonus-program før første reise).",
    entityA: "FLIGHT",
    entityB: "PASSASJER",
    answer: { aMin: "O", aMax: "<", bMin: "O", bMax: "<" },
    explanation:
      "M:N med valgfri deltakelse begge veier. Mappes til Booking(flightId, passasjerId, seteNr). Ingen NOT NULL-krav utover at FK-ene må peke på eksisterende rader når de først er satt.",
  },
  {
    id: "d-cf-bygning-rom",
    kind: "crowsfoot",
    title: "BYGNING — ROM (svak entitet)",
    prompt: "Rom finnes bare gjennom en bygning. Bygninger uten rom regnes som tomme tomter.",
    topic: "ER-modell",
    scenario:
      "Hver bygning har én eller flere rom. Hvert rom tilhører nøyaktig én bygning og kan ikke eksistere uten den (svak entitet).",
    entityA: "BYGNING",
    entityB: "ROM",
    answer: { aMin: "|", aMax: "|", bMin: "|", bMax: "<" },
    explanation:
      "Svake entiteter har alltid total deltakelse mot eier-entiteten. PK i ROM blir typisk (bygningId, romNr) — sammensatt, der bygningId er FK og NOT NULL. ON DELETE CASCADE er vanlig.",
  },
  {
    id: "d-cf-bil-eier",
    kind: "crowsfoot",
    title: "BIL — EIER (1:1)",
    prompt: "Akkurat én eier per bil i denne forenklede modellen.",
    topic: "ER-modell",
    scenario:
      "Hver bil har nøyaktig én eier. Hver person eier 0 eller én bil (de fleste eier ingen bil i datasettet).",
    entityA: "BIL",
    entityB: "EIER",
    answer: { aMin: "O", aMax: "|", bMin: "|", bMax: "|" },
    explanation:
      "1:1 (ytre «|» begge sider). FK på BIL-siden med UNIQUE og NOT NULL fungerer godt: Bil.eierId UNIQUE NOT NULL → Eier(id). Hvis sambeskap skal støttes, må modellen utvides til M:N.",
  },
  {
    id: "d-cf-konto-eier-mn",
    kind: "crowsfoot",
    title: "BANKKONTO — EIER (M:N)",
    prompt: "Sambeskap støttes. En konto må ha minst én eier; eier må eie minst én konto.",
    topic: "ER-modell",
    scenario:
      "En bankkonto har én eller flere eiere (sambeskap mulig). Hver eier har minst én konto (ellers registreres ikke).",
    entityA: "BANKKONTO",
    entityB: "EIER",
    answer: { aMin: "|", aMax: "<", bMin: "|", bMax: "<" },
    explanation:
      "Total M:N: «|<» begge veier. Koblingstabell Eierskap(kontoNr, eierId) med begge som FK. Minst-én-krav krever logikk i applikasjonen — DDL alene kan ikke kreve at hver konto har minst én rad i koblingstabellen.",
  },
  {
    id: "d-cf-vare-leverandor",
    kind: "crowsfoot",
    title: "VARE — LEVERANDØR",
    prompt: "Samme vare kan komme fra flere leverandører; en leverandør har et sortiment.",
    topic: "ER-modell",
    scenario:
      "En vare kan leveres av 0..N leverandører (vi registrerer også varer vi ennå ikke har funnet leverandør for). En leverandør tilbyr én eller flere varer.",
    entityA: "VARE",
    entityB: "LEVERANDØR",
    answer: { aMin: "|", aMax: "<", bMin: "O", bMax: "<" },
    explanation:
      "M:N, ulik deltakelse: vare-siden er valgfri (O), leverandør-siden er total (|). Mappes til Sortiment(vareId, levId, pris, leveringstid) — koblingstabell med relasjons-attributter.",
  },
  {
    id: "d-cf-bord-reservasjon",
    kind: "crowsfoot",
    title: "BORD — RESERVASJON",
    prompt: "Restaurant: et bord kan bookes mange ganger, en booking gjelder ett bord.",
    topic: "ER-modell",
    scenario:
      "Et bord kan ha 0..N reservasjoner over tid. Hver reservasjon gjelder nøyaktig ett bord og kan ikke eksistere uten et bord.",
    entityA: "BORD",
    entityB: "RESERVASJON",
    answer: { aMin: "|", aMax: "|", bMin: "O", bMax: "<" },
    explanation:
      "Klassisk 1:N: bordet eksisterer uavhengig, reservasjonen ikke. FK Reservasjon.bordNr NOT NULL. Tidsoverlapping må håndteres med constraints eller forretningslogikk (ikke bare av kardinaliteten).",
  },
  {
    id: "d-cf-kategori-produkt",
    kind: "crowsfoot",
    title: "KATEGORI — PRODUKT",
    prompt: "Produkter tilordnes én kategori; tomme kategorier er tillatt under oppsett.",
    topic: "ER-modell",
    scenario:
      "Hvert produkt hører til nøyaktig én kategori. En kategori kan ha 0..N produkter (vi oppretter kategorier før vi fyller dem).",
    entityA: "KATEGORI",
    entityB: "PRODUKT",
    answer: { aMin: "|", aMax: "|", bMin: "O", bMax: "<" },
    explanation:
      "1:N. FK Produkt.katId NOT NULL (total fra produkt-siden). En kategori uten produkter er gyldig — derfor «O<» nær KATEGORI sett fra produkt-perspektivet.",
  },
  {
    id: "d-cf-spiller-lag-historikk",
    kind: "crowsfoot",
    title: "SPILLER — LAG (historisk M:N)",
    prompt: "Spillere bytter lag over tid; tom karriere er mulig i søknadsperioden.",
    topic: "ER-modell",
    scenario:
      "En spiller kan ha vært på 0..N lag over karrieren (helt nye spillere har ingen lag ennå). Et lag har minst én spiller i sin historie (ellers er det ikke en gang etablert).",
    entityA: "SPILLER",
    entityB: "LAG",
    answer: { aMin: "|", aMax: "<", bMin: "O", bMax: "<" },
    explanation:
      "Historiske M:N krever en koblingstabell med tidsperiode: Kontrakt(spillerId, lagId, fra, til). Da kan samme spiller-lag-par forekomme flere ganger med ulike perioder — utvid PK med fra-dato.",
  },
  {
    id: "d-cf-melding-bruker",
    kind: "crowsfoot",
    title: "MELDING — BRUKER (avsender/mottaker)",
    prompt: "Hver melding har én avsender og én mottaker — to relasjoner til samme entitet.",
    topic: "ER-modell",
    scenario:
      "Vi modellerer relasjonen «MELDING avsendt av BRUKER». Hver melding har nøyaktig én avsender. En bruker kan sende 0..N meldinger.",
    entityA: "MELDING",
    entityB: "BRUKER",
    answer: { aMin: "O", aMax: "<", bMin: "|", bMax: "|" },
    explanation:
      "Flere relasjoner mellom samme entitetspar er vanlig — modelleres som adskilte relasjoner med hvert sitt sett kardinaliteter. Her: avsendt-av (1:N) og mottatt-av (1:N) er to ulike FK-er i MELDING: avsenderId og mottakerId, begge → Bruker(id).",
  },

  // ============= STERKE vs SVAKE RELASJONER (heltrukken vs stiplet) =============
  // I klassisk ER-notasjon vises identifiserende relasjon (svak entitet) med
  // dobbel linje rundt entiteten, dobbel diamant rundt relasjonen, og stiplet
  // understrek på den partielle nøkkelen. I kråkefot brukes ofte stiplet linje
  // for ikke-identifiserende relasjon, heltrukket for identifiserende.

  {
    id: "d-match-strong-weak",
    kind: "match",
    title: "Sterk vs. svak entitet — kjenn igjen",
    prompt:
      "Koble hver setning til riktig type. Forskjellen avgjør om PK kan stå alene eller må inkludere eier-FK.",
    topic: "ER-modell",
    pairs: [
      {
        left: "KUNDE — kan eksistere uten andre tabeller",
        right: "Sterk entitet (heltrukken enkelt linje rundt rektangelet)",
      },
      {
        left: "ORDRELINJE — kan ikke eksistere uten en ORDRE",
        right: "Svak entitet (dobbel linje rundt rektangelet)",
      },
      {
        left: "PASIENT — har eget pasientnr som identifiserer entydig",
        right: "Sterk entitet — PK er ikke avhengig av andre",
      },
      {
        left: "AVHENGIG (familiemedlem) — kun ID innenfor én ansatt",
        right: "Svak entitet — PK = (ansattNr, avh-løpenr)",
      },
    ],
    explanation:
      "Tommelfingerregelen: kan tabellen ha en rad uten å peke på noen annen? → sterk. Trenger den eier-FK-en som DEL av PK for å være unik? → svak.",
  },
  {
    id: "d-match-relasjon-linjetyper",
    kind: "match",
    title: "Linjetyper — heltrukken vs. stiplet",
    prompt:
      "I ER-diagrammer skiller man identifiserende (svak) og ikke-identifiserende (vanlig) relasjon. Match.",
    topic: "ER-modell",
    pairs: [
      {
        left: "Heltrukken linje (identifiserende)",
        right: "Eier-FK INNGÅR i barnets primærnøkkel — barnet er svak entitet",
      },
      {
        left: "Stiplet linje (ikke-identifiserende)",
        right: "Eier-FK er bare en vanlig FK — barnet har egen, uavhengig PK",
      },
      {
        left: "Dobbelt rektangel",
        right: "Markerer at entiteten er svak — total deltakelse mot eier",
      },
      {
        left: "Dobbel diamant",
        right: "Markerer en identifiserende relasjon (klassisk Chen-notasjon)",
      },
      {
        left: "Stiplet understrek på attributt",
        right: "Partiell nøkkel — bare unik innenfor én eier",
      },
    ],
    explanation:
      "Mange verktøy bruker bare heltrukken/stiplet linje uten dobbel-symboler. Da er det LINJEN som forteller om relasjonen er identifiserende (heltrukken) eller ikke (stiplet).",
  },
  {
    id: "d-quiz-strong-weak-ordrelinje",
    kind: "quiz",
    title: "Hva slags entitet er ORDRELINJE?",
    prompt: "Velg det best dekkende svaret.",
    topic: "ER-modell",
    question:
      "ORDRELINJE har følgende PK: (ordreNr, linjeNr) der ordreNr er FK til ORDRE og linjeNr bare er unikt INNENFOR én ordre. Hva slags entitet er ORDRELINJE?",
    options: [
      {
        text: "Svak entitet med identifiserende relasjon til ORDRE",
        correct: true,
        rationale:
          "Identifiserende fordi ordreNr (eier-FK) er DEL av PK. Svak fordi linjeNr alene ikke er unik på tvers av ordrer.",
      },
      {
        text: "Sterk entitet — den har jo en sammensatt primærnøkkel",
        correct: false,
        rationale:
          "Sammensatt PK gjør deg ikke automatisk sterk. Sterk = kan identifiseres uten eier-FK.",
      },
      {
        text: "M:N-koblingstabell",
        correct: false,
        rationale:
          "En koblingstabell har FK-er til to forskjellige tabeller, ikke bare én. ORDRELINJE peker bare til ORDRE (og evt. PRODUKT — men selve eierskapet er ORDRE).",
      },
      {
        text: "Bare en vanlig 1:N-relasjon — ingenting svakt der",
        correct: false,
        rationale:
          "Den ER 1:N med ORDRE, men selve entiteten klassifiseres som svak fordi den ikke kan eksistere uten den.",
      },
    ],
    explanation:
      "Svak entitet → tegnes med dobbel ramme / heltrukken linje. PK = (eier-FK, partiell nøkkel). FK skal som regel ha ON DELETE CASCADE: sletter du ordren, forsvinner linjene.",
  },
  {
    id: "d-quiz-identifying-vs-not",
    kind: "quiz",
    title: "Identifiserende eller ikke?",
    prompt: "Velg riktig diagnose for hvert scenario.",
    topic: "ER-modell",
    question:
      "Tabellen Garantibevis(serieNr, kjøpsdato, fk_bestilling). serieNr er unik på tvers av hele systemet. fk_bestilling peker på en Bestilling. Hva slags relasjon er det fra Garantibevis til Bestilling?",
    options: [
      {
        text: "Ikke-identifiserende (stiplet linje) — Garantibevis er sterk",
        correct: true,
        rationale:
          "Garantibevis har egen unik PK (serieNr) og kan identifiseres uten å vite hvilken bestilling den hører til. fk_bestilling er bare en vanlig FK.",
      },
      {
        text: "Identifiserende (heltrukken linje) — Garantibevis er svak",
        correct: false,
        rationale:
          "Ville krevd at fk_bestilling var DEL av PK. Her er PK serieNr alene.",
      },
      {
        text: "M:N-relasjon",
        correct: false,
        rationale: "Et garantibevis tilhører én bestilling. 1:N, ikke M:N.",
      },
    ],
    explanation:
      "Spørsmålet å stille: er eier-FK DEL av barnets PK? Ja → identifiserende/svak. Nei → ikke-identifiserende/sterk. Stiplet vs. heltrukken linje viser akkurat dette.",
  },

  // ============= HTML — semantiske elementer & dokumentstruktur =============
  {
    id: "d-fill-html-skeleton",
    kind: "fill",
    title: "HTML-skjelett — minste gyldige dokument",
    prompt: "Fyll inn de manglende delene av en HTML-fil. Dette er hodet ALLE filer starter med.",
    topic: "HTML",
    language: "html",
    template:
      "<!DOCTYPE __1__>\n<html lang=\"no\">\n  <__2__>\n    <meta charset=\"UTF-8\" />\n    <__3__>Min side</__3__>\n  </__2__>\n  <__4__>\n    <h1>Hei verden</h1>\n  </__4__>\n</html>",
    blanks: ["html", "head", "title", "body"],
    options: ["html", "head", "header", "title", "body", "main", "section", "h1"],
    explanation:
      "<!DOCTYPE html> forteller nettleseren at det er HTML5. <head> har metadata (vises ikke), <body> har innholdet (vises). <title> styrer fanenavnet og vises i søkeresultater.",
  },
  {
    id: "d-fill-html-semantic",
    kind: "fill",
    title: "Semantiske elementer — sideoppsett",
    prompt:
      "Bytt ut de generiske <div>-ene med semantiske tags. Skjermlesere og søkemotorer bruker disse for å forstå strukturen.",
    topic: "HTML",
    language: "html",
    template:
      "<body>\n  <__1__>\n    <h1>Bloggen min</h1>\n    <__2__>\n      <a href=\"/\">Hjem</a>\n      <a href=\"/om\">Om</a>\n    </__2__>\n  </__1__>\n\n  <__3__>\n    <__4__>\n      <h2>Innlegg om HTML</h2>\n      <p>Det er nyttig.</p>\n    </__4__>\n  </__3__>\n\n  <__5__>\n    <p>© 2026</p>\n  </__5__>\n</body>",
    blanks: ["header", "nav", "main", "article", "footer"],
    options: [
      "header",
      "nav",
      "main",
      "article",
      "section",
      "aside",
      "footer",
      "div",
      "span",
    ],
    explanation:
      "header (toppinfo), nav (lenkemeny), main (hovedinnhold — én per side), article (selvstendig innholdsbit som kan stå alene), section (tematisk del), footer (bunninfo). Disse er bare semantikk — visuelt er de tomme blokk-elementer som <div>.",
  },
  {
    id: "d-fill-html-section-article",
    kind: "fill",
    title: "section vs. article — riktig nesting",
    prompt:
      "Et innlegg har flere seksjoner: tittel, brødtekst, kommentarer. Plasser elementene.",
    topic: "HTML",
    language: "html",
    template:
      "<main>\n  <__1__>\n    <header>\n      <h2>Tittel</h2>\n      <p>Av Per</p>\n    </header>\n    <__2__ aria-labelledby=\"brod\">\n      <h3 id=\"brod\">Brødtekst</h3>\n      <p>Innhold ...</p>\n    </__2__>\n    <__2__ aria-labelledby=\"komm\">\n      <h3 id=\"komm\">Kommentarer</h3>\n      <ol>\n        <li>Fin tekst!</li>\n      </ol>\n    </__2__>\n  </__1__>\n</main>",
    blanks: ["article", "section"],
    options: ["article", "section", "aside", "main", "header", "div"],
    explanation:
      "<article> = noe som kan stå alene (et innlegg, en kommentar, en produktkort). <section> = en tematisk gruppe innenfor noe annet. Tommelregel: kan du ta dette ut og publisere det andre steder uten kontekst? → article. Hvis ikke → section.",
  },
  {
    id: "d-fill-html-list",
    kind: "fill",
    title: "Ordnet vs. uordnet liste",
    prompt: "Lag en uordnet liste (kulepunkter) over favorittfargene dine.",
    topic: "HTML",
    language: "html",
    template:
      "<__1__>\n  <__2__>Rød</__2__>\n  <__2__>Blå</__2__>\n  <__2__>Grønn</__2__>\n</__1__>",
    blanks: ["ul", "li"],
    options: ["ul", "ol", "li", "dl", "dt", "dd"],
    explanation:
      "<ul> = uordnet (kuler). <ol> = ordnet (1, 2, 3). <li> er listepunkter inni begge. <dl>/<dt>/<dd> er definisjonslister (begrep + forklaring), brukes sjeldnere.",
  },
  {
    id: "d-fill-html-link-css",
    kind: "fill",
    title: "Knytt en CSS-fil til HTML",
    prompt: "Legg til en stilark-lenke i head-en. Stilarket heter style.css.",
    topic: "HTML",
    language: "html",
    template:
      "<head>\n  <meta charset=\"UTF-8\" />\n  <title>Min side</title>\n  <__1__ rel=\"__2__\" __3__=\"/static/style.css\" />\n</head>",
    blanks: ["link", "stylesheet", "href"],
    options: ["link", "script", "rel", "stylesheet", "src", "href", "style", "type"],
    explanation:
      "<link rel=\"stylesheet\" href=\"...\" /> kobler en ekstern CSS-fil. rel=\"stylesheet\" forteller browseren TYPEN — uten det blir filen ignorert. href er stien (relativ eller absolutt). I Flask: href=\"{{ url_for('static', filename='style.css') }}\".",
  },
  {
    id: "d-fill-html-form",
    kind: "fill",
    title: "Skjema med label og POST",
    prompt:
      "Lag et innloggingsskjema. label skal kobles til input via for/id. Skjemaet skal sende POST til /login.",
    topic: "HTML",
    language: "html",
    template:
      "<form action=\"/login\" __1__=\"POST\">\n  <__2__ __3__=\"u\">Brukernavn:</__2__>\n  <__4__ type=\"text\" __5__=\"u\" name=\"username\" />\n\n  <__2__ __3__=\"p\">Passord:</__2__>\n  <__4__ type=\"password\" __5__=\"p\" name=\"password\" />\n\n  <button type=\"submit\">Logg inn</button>\n</form>",
    blanks: ["method", "label", "for", "input", "id"],
    options: ["method", "action", "label", "for", "input", "id", "name", "type"],
    explanation:
      "method=POST sender data i body, ikke i URL (passord skal aldri ende opp i historikk eller logger). label[for] = input[id] gir tilgjengelighet: klikker du på label, fokuseres input-feltet. Bruk type=\"password\" så tegnene maskeres.",
  },
  {
    id: "d-fill-html-img",
    kind: "fill",
    title: "Bilde med alt-tekst",
    prompt:
      "Sett inn et bilde av en katt. alt-teksten beskriver bildet for skjermlesere og hvis bildet feiler.",
    topic: "HTML",
    language: "html",
    template:
      "<__1__ __2__=\"/static/katt.jpg\" __3__=\"En oransje katt som sover i sola\" />",
    blanks: ["img", "src", "alt"],
    options: ["img", "image", "picture", "src", "href", "alt", "title", "name"],
    explanation:
      "alt-attributtet er PÅKREVD. Beskriv bildet kort — eller bruk alt=\"\" hvis bildet er rent dekorativt så skjermlesere hopper over det. Bilder uten alt er en av de mest vanlige tilgjengelighetsfeilene.",
  },
  {
    id: "d-fill-html-table",
    kind: "fill",
    title: "Tabell med header-rad",
    prompt: "Bruk <thead>/<tbody> for å skille header fra data. Det gir bedre stiling og semantikk.",
    topic: "HTML",
    language: "html",
    template:
      "<table>\n  <__1__>\n    <__2__>\n      <__3__>Navn</__3__>\n      <__3__>Alder</__3__>\n    </__2__>\n  </__1__>\n  <__4__>\n    <__2__>\n      <__5__>Per</__5__>\n      <__5__>30</__5__>\n    </__2__>\n  </__4__>\n</table>",
    blanks: ["thead", "tr", "th", "tbody", "td"],
    options: ["thead", "tbody", "tfoot", "tr", "th", "td", "table", "col"],
    explanation:
      "<th> = header-celle (fet, sentrert som default, leses som «kolonneoverskrift» av skjermlesere). <td> = data-celle. <thead>/<tbody> hjelper også med å feste header når brukeren scroller en lang tabell.",
  },
  {
    id: "d-order-html-heading",
    kind: "order",
    title: "Heading-hierarkiet",
    prompt: "Sortér overskriftene fra topp til bunn slik de bør stå på en typisk bloggside.",
    topic: "HTML",
    items: [
      "<h1> — én per side, beskriver hele sidens innhold",
      "<h2> — hoved-seksjoner (Innlegg, Om meg, Kontakt)",
      "<h3> — under-seksjoner innenfor h2 (Tittel på et innlegg)",
      "<h4> — sjeldnere brukt (under-deler av h3)",
      "<h5> og <h6> — kun ved svært dyp struktur",
    ],
    explanation:
      "Hopp ALDRI over nivåer (h1 → h3 er feil). Skjermlesere bruker overskriftshierarkiet til navigasjon — et brutt hierarki gjør siden uleselig for brukere som ikke ser den.",
  },

  // ============= CSS — kobling og selektorer =============
  {
    id: "d-fill-css-basic",
    kind: "fill",
    title: "CSS — class- og id-selektor",
    prompt:
      "Skriv tre regler: én for alle <p>, én for klassen .alert, og én for id-en #header.",
    topic: "CSS",
    language: "html",
    template:
      "__1__ {\n  color: black;\n}\n\n__2__alert {\n  background: yellow;\n  border: 1px solid red;\n}\n\n__3__header {\n  font-size: 24px;\n}",
    blanks: ["p", ".", "#"],
    options: ["p", "P", ".", "#", "*", ":", "@"],
    explanation:
      "Tag-selektor: bare navnet (p, div, h1). Class-selektor: prikk (.alert). ID-selektor: skigard (#header). ID-er skal være unike på siden — class kan brukes mange ganger.",
  },
  {
    id: "d-fill-css-flexbox",
    kind: "fill",
    title: "Flexbox — sentrer på linje",
    prompt:
      "Sentrer barna både horisontalt og vertikalt med flexbox. Antar at .boks har en høyde.",
    topic: "CSS",
    language: "html",
    template:
      ".boks {\n  __1__: flex;\n  __2__: center;        /* horisontal */\n  __3__: center;        /* vertikal */\n  height: 200px;\n}",
    blanks: ["display", "justify-content", "align-items"],
    options: [
      "display",
      "flex",
      "justify-content",
      "align-items",
      "align-content",
      "flex-direction",
      "center",
      "row",
    ],
    explanation:
      "display: flex aktiverer flexbox. justify-content styrer aksen flex går langs (horisontal i default row). align-items styrer den vinkelrette aksen (vertikal i row). For å sentrere = center på begge.",
  },
  {
    id: "d-fill-css-box-model",
    kind: "fill",
    title: "Box model — padding, border, margin",
    prompt: "Gi knappen 12px luft INNI (mellom innhold og kant), 1px svart kant, og 16px luft UTENFOR.",
    topic: "CSS",
    language: "html",
    template:
      "button {\n  __1__: 12px;\n  __2__: 1px solid black;\n  __3__: 16px;\n}",
    blanks: ["padding", "border", "margin"],
    options: ["padding", "border", "margin", "outline", "spacing", "gap"],
    explanation:
      "Box model lag-for-lag innenfra og ut: content → padding → border → margin. padding er INNI rammen (samme bakgrunnsfarge), margin er UTENFOR (transparent — pusher andre elementer vekk).",
  },
  {
    id: "d-fill-css-import",
    kind: "fill",
    title: "CSS @import vs <link>",
    prompt:
      "Importer reset.css fra en annen CSS-fil. Skal stå ØVERST i fila før alt annet.",
    topic: "CSS",
    language: "html",
    template: "__1__ url(\"reset.css\");\n\nbody {\n  margin: 0;\n}",
    blanks: ["@import"],
    options: ["@import", "@include", "@use", "import", "link", "require"],
    explanation:
      "@import inni CSS, men anbefales mot — det blokkerer parallell nedlasting. Foretrukket: bruk flere <link rel=\"stylesheet\"> i HTML-headeren. @import er likevel viktig å kjenne igjen.",
  },

  // ============= JINJA / FLASK-MALER =============
  {
    id: "d-fill-jinja-extends",
    kind: "fill",
    title: "Jinja — extends base-mal",
    prompt:
      "Lag en barn-mal som arver fra base.html og fyller inn tittel og innhold-blokkene.",
    topic: "Jinja",
    language: "html",
    example: `{# base.html #}
<!DOCTYPE html>
<html>
  <head>
    <title>{% block title %}Standard tittel{% endblock %}</title>
  </head>
  <body>
    <main>
      {% block content %}{% endblock %}
    </main>
  </body>
</html>`,
    template:
      "{% __1__ \"base.html\" %}\n\n{% __2__ title %}Kundeliste{% __3__ %}\n\n{% __2__ content %}\n  <h1>Alle kunder</h1>\n  <p>...</p>\n{% __3__ %}",
    blanks: ["extends", "block", "endblock"],
    options: ["extends", "block", "endblock", "include", "import", "from", "for", "endfor"],
    explanation:
      "{% extends %} må være ALLER ØVERST i barn-malen (før all annen tekst). Hver {% block %} i basen kan overskrives — det som ikke overskrives, beholder default-innholdet fra base.html.",
  },
  {
    id: "d-fill-jinja-include",
    kind: "fill",
    title: "Jinja — include partial",
    prompt:
      "Trekk ut headeren til en delfil _header.html og inkluder den i basemalen.",
    topic: "Jinja",
    language: "html",
    template:
      "{# I base.html #}\n<body>\n  {% __1__ \"_header.html\" %}\n\n  <main>\n    {% block content %}{% endblock %}\n  </main>\n</body>",
    blanks: ["include"],
    options: ["include", "extends", "import", "block", "use", "render"],
    explanation:
      "{% include %} kopierer innholdet av en annen mal inn på dette stedet. Brukes for biter som går igjen (header, footer, navigasjons-menyer). Forskjellen fra {% extends %}: include er enkel kopiering, extends er arv.",
  },
  {
    id: "d-fill-jinja-import",
    kind: "fill",
    title: "Jinja — import macro",
    prompt:
      "Lag en gjenbrukbar macro for å vise en knapp. Importer den i en annen mal.",
    topic: "Jinja",
    language: "html",
    example: `{# macros.html #}
{% macro knapp(tekst, type='button') %}
  <button type="{{ type }}" class="btn">{{ tekst }}</button>
{% endmacro %}`,
    template:
      "{# i en annen mal #}\n{% __1__ \"macros.html\" as m %}\n\n<form>\n  ...\n  {{ m.__2__(\"Lagre\", type=\"submit\") }}\n</form>",
    blanks: ["import", "knapp"],
    options: ["import", "include", "extends", "from", "knapp", "macro", "render"],
    explanation:
      "{% import 'fil.html' as alias %} laster ALLE macroer fra fila inn under et navnerom. Bruk så `alias.macroNavn(...)`. Alternativt: {% from 'fil.html' import knapp %} importerer bare én macro direkte.",
  },
  {
    id: "d-fill-jinja-for",
    kind: "fill",
    title: "Jinja — for-løkke over liste",
    prompt:
      "Vis hver kunde fra view-en som <li>. Hvis lista er tom skal det stå «Ingen kunder».",
    topic: "Jinja",
    language: "html",
    template:
      "<ul>\n  {% __1__ kunde in kunder %}\n    <li>{{ __2__.navn }}</li>\n  {% __3__ %}\n    <li>Ingen kunder</li>\n  {% __4__ %}\n</ul>",
    blanks: ["for", "kunde", "else", "endfor"],
    options: ["for", "in", "endfor", "kunde", "kunder", "else", "if", "endif"],
    explanation:
      "Jinja har en innebygd {% else %} for tom liste — den kjøres bare hvis iterablen var tom. Det er ofte renere enn å sjekke `{% if kunder %}` separat.",
  },
  {
    id: "d-fill-jinja-if",
    kind: "fill",
    title: "Jinja — if/elif/else",
    prompt:
      "Vis ulik melding basert på bruker.rolle. Tre tilfeller: admin, vanlig bruker, og ellers.",
    topic: "Jinja",
    language: "html",
    template:
      "{% __1__ bruker.rolle == \"admin\" %}\n  <p>Hei, admin!</p>\n{% __2__ bruker.rolle == \"bruker\" %}\n  <p>Velkommen.</p>\n{% __3__ %}\n  <p>Ukjent rolle.</p>\n{% __4__ %}",
    blanks: ["if", "elif", "else", "endif"],
    options: ["if", "elif", "else", "endif", "elseif", "case", "switch", "endcase"],
    explanation:
      "Jinja-syntaksen for kontrollflyt: alle blokker MÅ avsluttes (endif, endfor, endblock). Glemmer du endif, får du ofte en svært forvirrende feilmelding lengre nede i malen.",
  },
  {
    id: "d-fill-jinja-url_for",
    kind: "fill",
    title: "Jinja — url_for og static-filer",
    prompt:
      "Lag en lenke til kunder-siden og link inn en CSS-fil fra static-mappa. Bruk url_for istedenfor harkodede stier.",
    topic: "Jinja",
    language: "html",
    template:
      "<head>\n  <link rel=\"stylesheet\" href=\"{{ __1__('static', __2__='style.css') }}\" />\n</head>\n<body>\n  <a href=\"{{ __1__('__3__') }}\">Til kunder</a>\n</body>",
    blanks: ["url_for", "filename", "kunder"],
    options: ["url_for", "url", "link", "path", "filename", "file", "kunder", "static", "name"],
    explanation:
      "url_for genererer URL-en for en route ut fra view-funksjonens NAVN — så hvis URL-en endres, slipper du å oppdatere alle malene. For statiske filer: url_for('static', filename='...').",
  },
  {
    id: "d-fill-jinja-escape",
    kind: "fill",
    title: "Jinja — escape og |safe (sikkerhet)",
    prompt:
      "Brukerinput skal ALLTID escapes (default). Men i denne admin-malen vil vi vise rå HTML — bruk safe-filteret.",
    topic: "Jinja",
    language: "html",
    template:
      "{# Default: escapes automatisk #}\n<p>Tittel: {{ tittel }}</p>\n\n{# Eksplisitt: rå HTML, kun for VERIFISERT-trygg innhold #}\n<div>{{ rapport_html | __1__ }}</div>\n\n{# Eksplisitt escape om autoescape er av: #}\n<p>{{ bruker_input | __2__ }}</p>",
    blanks: ["safe", "e"],
    options: ["safe", "e", "escape", "raw", "html", "unsafe"],
    explanation:
      "Jinja autoescaper alt mellom {{ ... }} i .html-filer. |safe slår av escaping for det ene uttrykket — bruk KUN på innhold du selv har generert. |e (eller |escape) er motsatt. Bruker du |safe på user input, har du laget en XSS-sårbarhet.",
  },
  {
    id: "d-order-jinja-render-flow",
    kind: "order",
    title: "Render-flyt: fra Python til HTML",
    prompt:
      "En route returnerer render_template. Sett stegene i riktig rekkefølge fra request til ferdig HTML.",
    topic: "Jinja",
    items: [
      "View-funksjonen kaller render_template(\"kunder.html\", kunder=rows)",
      "Jinja2 finner kunder.html i templates/-mappa",
      "Jinja2 ser {% extends \"base.html\" %} og henter base-malen",
      "Jinja2 erstatter {% block content %} i base med innholdet fra kunder.html",
      "Jinja2 evaluerer {{ kunde.navn }} og {% for %}-løkker mot variablene den fikk",
      "Resultatet er en HTML-streng som sendes som body i HTTP-responsen",
    ],
    explanation:
      "render_template returnerer en STRING — Flask pakker den så i et Response-objekt med Content-Type: text/html. Hele templating-jobben skjer på serversiden FØR noen byte sendes til browseren.",
  },

  // ============= SQL — MANGE JOINs (fyll inn) =============
  {
    id: "d-fill-sql-3way-join",
    kind: "fill",
    title: "Tre-veis JOIN — kunder + utleier + biler",
    prompt:
      "Finn navnet på kunden og merket på bilen for hver utleie. Tre tabeller: kunde, utleie, bil.",
    topic: "JOIN",
    language: "sql",
    template:
      "SELECT k.navn, b.merke\nFROM kunde k\n__1__ utleie u __2__ k.kundenr = u.kundenr\n__1__ bil b __2__ u.bilnr = b.bilnr;",
    blanks: ["INNER JOIN", "ON", "INNER JOIN", "ON"],
    options: ["INNER JOIN", "LEFT JOIN", "ON", "WHERE", "=", "AND", "FROM"],
    explanation:
      "Kjede JOIN-er sekvensielt: hver ny JOIN bygger på resultatet fra forrige. Velg alias for hver tabell (k, u, b) — det gjør lange spørringer lesbare.",
  },
  {
    id: "d-fill-sql-4way-aggregate",
    kind: "fill",
    title: "Fire-veis JOIN med GROUP BY",
    prompt:
      "Finn TOTAL-sum av ordrelinjer per kunde — krever JOIN gjennom kunde → ordre → ordrelinje → produkt.",
    topic: "JOIN",
    language: "sql",
    template:
      "SELECT k.navn, __1__(ol.antall * p.pris) AS total\nFROM kunde k\nINNER JOIN ordre o ON k.kundenr = o.kundenr\nINNER JOIN ordrelinje ol __2__ o.ordrenr = ol.ordrenr\nINNER JOIN produkt p __2__ ol.prodnr = p.prodnr\n__3__ k.kundenr, k.navn\n__4__ total __5__;",
    blanks: ["SUM", "ON", "GROUP BY", "ORDER BY", "DESC"],
    options: ["SUM", "COUNT", "AVG", "ON", "WHERE", "GROUP BY", "HAVING", "ORDER BY", "DESC", "ASC"],
    explanation:
      "Når du joiner 4 tabeller og aggregerer: GROUP BY må inneholde ALLE ikke-aggregerte kolonner i SELECT. Her grupperer vi på k.kundenr (PK) — k.navn må også med selv om den er funksjonelt avhengig.",
  },
  {
    id: "d-fill-sql-left-join-missing",
    kind: "fill",
    title: "LEFT JOIN — finn kunder UTEN ordre",
    prompt:
      "Finn kunder som aldri har lagt inn en ordre. LEFT JOIN + IS NULL-trikset.",
    topic: "JOIN",
    language: "sql",
    template:
      "SELECT k.navn\nFROM kunde k\n__1__ JOIN ordre o ON k.kundenr = o.kundenr\nWHERE o.ordrenr __2__ __3__;",
    blanks: ["LEFT", "IS", "NULL"],
    options: ["LEFT", "RIGHT", "INNER", "IS", "=", "!=", "NULL", "EMPTY"],
    explanation:
      "LEFT JOIN beholder ALLE kunder, men setter o-kolonnene til NULL der det ikke er match. WHERE o.ordrenr IS NULL plukker ut nettopp de som ikke matchet. Klassisk «anti-join»-mønster.",
  },
  {
    id: "d-fill-sql-join-having",
    kind: "fill",
    title: "JOIN + GROUP BY + HAVING — toppkunder",
    prompt:
      "Finn kunder med flere enn 3 ordre. Først joiner vi, så grupperer vi, så filtrerer vi med HAVING.",
    topic: "JOIN",
    language: "sql",
    template:
      "SELECT k.navn, __1__(o.ordrenr) AS antall_ordre\nFROM kunde k\nINNER JOIN ordre o __2__ k.kundenr = o.kundenr\n__3__ k.kundenr, k.navn\n__4__ COUNT(o.ordrenr) > 3\n__5__ antall_ordre DESC;",
    blanks: ["COUNT", "ON", "GROUP BY", "HAVING", "ORDER BY"],
    options: ["COUNT", "SUM", "AVG", "ON", "WHERE", "GROUP BY", "HAVING", "ORDER BY", "AS", "DESC"],
    explanation:
      "WHERE filtrerer RADER før gruppering. HAVING filtrerer GRUPPER etter. COUNT(*) og aggregater kan bare brukes i HAVING — ikke i WHERE. Husk: GROUP BY, HAVING, ORDER BY — i denne rekkefølgen.",
  },
  {
    id: "d-fill-sql-self-join",
    kind: "fill",
    title: "SELF JOIN — ansatt og leder",
    prompt:
      "Hver rad i Ansatt har en lederNr som peker på en annen rad i Ansatt. Finn par av (ansatt-navn, leder-navn).",
    topic: "JOIN",
    language: "sql",
    template:
      "SELECT a.navn AS ansatt, l.navn AS leder\nFROM ansatt a\n__1__ ansatt l __2__ a.lederNr = l.ansattNr;",
    blanks: ["LEFT JOIN", "ON"],
    options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "ON", "WHERE", "AS", "="],
    explanation:
      "Self-join = en tabell joinet med seg selv. KREVER alias på begge sider (a og l), ellers kan ikke SQL skille hvilken som er hvilken. LEFT JOIN her fanger også med toppsjefen som ikke har leder (lederNr IS NULL).",
  },
  {
    id: "d-fill-sql-mn-traverse",
    kind: "fill",
    title: "M:N-traversering — studenter på fag",
    prompt:
      "Tre tabeller: student, fag, og koblingstabellen tar(sid, fkode). Finn fag-titlene for student med sid=42.",
    topic: "JOIN",
    language: "sql",
    template:
      "SELECT f.tittel\nFROM student s\nINNER JOIN tar t __1__ s.sid = t.sid\nINNER JOIN fag f __1__ t.fkode = f.fkode\n__2__ s.sid = 42;",
    blanks: ["ON", "WHERE"],
    options: ["ON", "WHERE", "AND", "USING", "=", "HAVING", "GROUP BY"],
    explanation:
      "For å traversere en M:N-relasjon må du gjennom KOBLINGSTABELLEN: student → tar → fag. Tre JOIN-er — det er normalt. Filtrer på s.sid (PK i student) for å begrense til én konkret student.",
  },
  {
    id: "d-fill-sql-left-vs-inner",
    kind: "fill",
    title: "LEFT JOIN beholder ulike sider",
    prompt:
      "Vi vil ha ALLE produkter, også de som aldri er solgt. Antall solgte vises som 0 (ikke NULL) via COALESCE.",
    topic: "JOIN",
    language: "sql",
    template:
      "SELECT p.prodnavn,\n       __1__(SUM(ol.antall), 0) AS solgt\nFROM produkt p\n__2__ JOIN ordrelinje ol ON p.prodnr = ol.prodnr\n__3__ p.prodnr, p.prodnavn\n__4__ solgt __5__;",
    blanks: ["COALESCE", "LEFT", "GROUP BY", "ORDER BY", "DESC"],
    options: [
      "COALESCE",
      "IFNULL",
      "NVL",
      "LEFT",
      "INNER",
      "RIGHT",
      "GROUP BY",
      "ORDER BY",
      "DESC",
      "ASC",
    ],
    explanation:
      "INNER JOIN ville fjernet produkter uten ordrelinjer. LEFT JOIN beholder dem og fyller på NULL. COALESCE(x, 0) erstatter NULL med 0 så summen blir tall, ikke NULL.",
  },
  {
    id: "d-fill-sql-three-where",
    kind: "fill",
    title: "JOIN med flere filtre",
    prompt:
      "Finn alle utleier i 2025 av biler i kategori «SUV» — krever JOIN mellom utleie, bil, og kategori.",
    topic: "JOIN",
    language: "sql",
    template:
      "SELECT u.utleienr, b.merke, k.navn AS kategori\nFROM utleie u\nINNER JOIN bil b ON u.bilnr __1__ b.bilnr\nINNER JOIN kategori k __2__ b.kategoriNr = k.kategoriNr\nWHERE u.utleieDato __3__ '2025-01-01' AND u.utleieDato < '2026-01-01'\n  __4__ k.navn = 'SUV';",
    blanks: ["=", "ON", ">=", "AND"],
    options: ["=", "==", "ON", "WHERE", ">=", "<=", "AND", "OR", "BETWEEN"],
    explanation:
      "Flere WHERE-betingelser bindes med AND/OR. For å filtrere på et år bruker man typisk to halvåpne grenser (>= jan 1, < jan 1 neste år) — det fungerer også på DATETIME uten å bekymre seg om time-deler.",
  },

  // ============= HTTP — STATUSKODER (alle de viktige) =============
  {
    id: "d-match-http-status-full",
    kind: "match",
    title: "HTTP-statuskoder — alle de viktige",
    prompt:
      "Match hver statuskode til riktig betydning. Lær deg minst disse — de er sentrale på eksamen.",
    topic: "HTTP",
    pairs: [
      { left: "200 OK", right: "Suksess — ressurs returnert" },
      { left: "201 Created", right: "Ny ressurs opprettet (typisk etter POST)" },
      { left: "204 No Content", right: "Suksess, men ingen body — typisk etter DELETE" },
      { left: "301 Moved Permanently", right: "Permanent redirect — oppdater bokmerker" },
      { left: "302 Found", right: "Midlertidig redirect — Flask sin redirect() returnerer denne" },
      { left: "304 Not Modified", right: "Cache er fortsatt gyldig — bruk lokal kopi" },
      { left: "400 Bad Request", right: "Klienten sendte feil syntaks/data" },
      { left: "401 Unauthorized", right: "Ikke autentisert — logg inn først" },
      { left: "403 Forbidden", right: "Innlogget, men har ikke tilgang" },
      { left: "404 Not Found", right: "Ressursen finnes ikke" },
      { left: "405 Method Not Allowed", right: "Routen finnes, men ikke for denne metoden (eks. POST mot GET-only)" },
      { left: "409 Conflict", right: "Ressurs-konflikt — typisk duplikat eller versjons-mismatch" },
      { left: "500 Internal Server Error", right: "Uventet feil i backend — bugg" },
      { left: "501 Not Implemented", right: "Serveren støtter ikke metoden i det hele tatt" },
      { left: "503 Service Unavailable", right: "Server overlastet eller under vedlikehold" },
    ],
    explanation:
      "Familiene: 1xx info, 2xx suksess, 3xx redirect, 4xx KLIENTfeil, 5xx SERVERfeil. Hvis du er i tvil om 4xx vs 5xx — spør: er det klientens skyld eller serverens? Det avgjør hvilken klasse.",
  },
  {
    id: "d-match-http-scenario",
    kind: "match",
    title: "Scenario → riktig statuskode",
    prompt:
      "For hvert scenario, hvilken statuskode skal serveren returnere?",
    topic: "HTTP",
    pairs: [
      { left: "Bruker prøver å se en side som ikke finnes", right: "404 Not Found" },
      { left: "API mottar JSON med manglende påkrevd felt", right: "400 Bad Request" },
      { left: "POST oppretter ny kunde, ID returneres i Location-header", right: "201 Created" },
      { left: "Logget inn bruker prøver å åpne admin-panelet uten admin-rolle", right: "403 Forbidden" },
      { left: "Cookie/session er utløpt", right: "401 Unauthorized" },
      { left: "Databasen er nede pga. vedlikehold", right: "503 Service Unavailable" },
      { left: "Backend kaster en uhåndtert exception", right: "500 Internal Server Error" },
      { left: "Bruker prøver å DELETE en route som bare støtter GET", right: "405 Method Not Allowed" },
      { left: "Skjema sender unik epost som allerede finnes", right: "409 Conflict" },
      { left: "Browseren har siden i cache, server sjekker ETag", right: "304 Not Modified" },
    ],
    explanation:
      "401 vs 403 er den vanligste fellen: 401 = «jeg vet ikke hvem du er» (ikke autentisert), 403 = «jeg vet hvem du er, men du får ikke». Husk: AuthentiCation før AuthoriZation.",
  },
  {
    id: "d-quiz-http-401-vs-403",
    kind: "quiz",
    title: "401 vs 403 — hvilken er riktig?",
    prompt: "Velg riktig statuskode.",
    topic: "HTTP",
    question:
      "En bruker logger inn som vanlig bruker. De prøver å åpne /admin. Backend sjekker rollen og oppdager at brukeren IKKE er admin. Hvilken statuskode bør svaret være?",
    options: [
      {
        text: "403 Forbidden",
        correct: true,
        rationale: "Brukeren er autentisert (vi vet hvem de er), men har ikke nødvendig tilgang. Det er definisjonen av 403.",
      },
      {
        text: "401 Unauthorized",
        correct: false,
        rationale: "401 betyr «ikke logget inn / ugyldig credentials». Her er brukeren logget inn — det er bare rolle som mangler.",
      },
      {
        text: "404 Not Found",
        correct: false,
        rationale: "Routen finnes — vi har bare ikke tilgang. Noen apper bruker 404 her for å skjule eksistensen, men det er en bevisst sikkerhets-strategi, ikke standard-svaret.",
      },
      {
        text: "500 Internal Server Error",
        correct: false,
        rationale: "5xx er for når SERVEREN feiler. Her oppfører serveren seg helt riktig.",
      },
    ],
    explanation:
      "Tommelfingerregel: 401 = «vi vet ikke hvem du er» → server sender WWW-Authenticate-header. 403 = «vi vet hvem du er, men nei» → ingen mengde retry hjelper uten ny rolle.",
  },
  {
    id: "d-quiz-http-201-vs-200",
    kind: "quiz",
    title: "Når skal man returnere 201?",
    prompt: "Velg det best dekkende svaret.",
    topic: "HTTP",
    question:
      "En POST-endpoint mottar JSON og lagrer en ny kunde i databasen. Hva er den mest korrekte responsen?",
    options: [
      {
        text: "201 Created med Location-header som peker på den nye ressursen",
        correct: true,
        rationale:
          "201 forteller eksplisitt at noe er opprettet. Location-headeren peker på URL-en til den nye kunden (f.eks. /kunder/123).",
      },
      {
        text: "200 OK — det er jo vellykket",
        correct: false,
        rationale:
          "Fungerer, men 201 er mer spesifikk og standard for «noe ble opprettet». 200 burde reserveres for GET/PUT-suksess uten ny ressurs.",
      },
      {
        text: "204 No Content",
        correct: false,
        rationale:
          "204 er for suksess UTEN body — typisk DELETE. Etter create vil vi som regel returnere kunden eller en ID i body.",
      },
      {
        text: "302 Found",
        correct: false,
        rationale:
          "302 er en redirect — brukes etter Post-Redirect-Get i form-baserte apper, men ikke for API-svar.",
      },
    ],
    explanation:
      "201 + Location: standard for REST. Post-Redirect-Get-mønsteret i HTML-baserte apper bruker 302/303 for å unngå dobbel innsending ved Refresh — det er en annen kontekst.",
  },
  {
    id: "d-quiz-http-501-vs-500",
    kind: "quiz",
    title: "Hva betyr 501 Not Implemented?",
    prompt: "Velg det riktige svaret.",
    topic: "HTTP",
    question:
      "Klienten sender en PATCH-request til en server som bare støtter GET og POST på den routen. Riktig svar?",
    options: [
      {
        text: "405 Method Not Allowed — routen finnes, men ikke PATCH for den",
        correct: true,
        rationale:
          "405 er det riktige svaret når en route eksisterer men ikke støtter den metoden. Responsen bør inneholde Allow-header med listen av tillatte metoder.",
      },
      {
        text: "501 Not Implemented — serveren støtter ikke PATCH i det hele tatt",
        correct: false,
        rationale:
          "501 brukes når SERVEREN ikke kjenner metoden i det hele tatt (sjelden). Hvis serveren støtter PATCH andre steder men ikke her, er 405 riktig.",
      },
      {
        text: "400 Bad Request",
        correct: false,
        rationale:
          "400 er for ugyldig syntaks. PATCH er en gyldig HTTP-metode, problemet er at den ikke er tillatt her.",
      },
      {
        text: "500 Internal Server Error",
        correct: false,
        rationale: "5xx er for uventede feil. Dette er en kjent og forventet situasjon.",
      },
    ],
    explanation:
      "501 er sjelden i moderne webrammeverk fordi de fleste støtter alle HTTP-metoder. Du møter 501 oftest i proxy/gateway-scenarier eller eldre servere.",
  },
  {
    id: "d-quiz-http-304-cache",
    kind: "quiz",
    title: "304 Not Modified — når brukes den?",
    prompt: "Velg riktig forklaring.",
    topic: "HTTP",
    question:
      "Browseren har en CSS-fil i cache. Den sender en request med If-None-Match-header. Serveren sammenligner ETag-en og finner at filen ikke er endret. Hva returnerer serveren?",
    options: [
      {
        text: "304 Not Modified — uten body. Browseren bruker sin cachede versjon.",
        correct: true,
        rationale:
          "Dette er hele poenget med 304: sparer bandwidth ved å si «ikke endret, bruk det du har». Body skal være tom.",
      },
      {
        text: "200 OK med hele filen på nytt",
        correct: false,
        rationale: "Det ville beseiret hele cache-mekanismen — du sparer ingenting.",
      },
      {
        text: "301 Moved Permanently",
        correct: false,
        rationale: "301 er en redirect, ikke en cache-respons.",
      },
      {
        text: "204 No Content",
        correct: false,
        rationale: "204 betyr «suksess uten body» (etter DELETE/PUT). 304 er det riktige for cache-validering.",
      },
    ],
    explanation:
      "304-responser har ingen body og er små. De er kjernen i HTTP cache-validering sammen med ETag og Last-Modified-headere.",
  },
  {
    id: "d-order-http-request",
    kind: "order",
    title: "HTTP-request livssyklus",
    prompt:
      "Sett stegene i riktig rekkefølge fra brukerens klikk til ferdig vist side.",
    topic: "HTTP",
    items: [
      "Bruker klikker på en lenke i nettleseren",
      "Browseren slår opp DNS for vertsnavnet",
      "TCP-håndtrykk (SYN, SYN-ACK, ACK) opprettes med serveren",
      "TLS-håndtrykk (hvis HTTPS) etablerer kryptert kanal",
      "Browseren sender HTTP-request: GET /side HTTP/1.1 + headere",
      "Serveren matcher URL mot en route og kjører view-funksjonen",
      "View returnerer HTML, server sender HTTP-response: 200 OK + headere + body",
      "Browseren parser HTML, henter linkede CSS/JS/bilder, og renderer siden",
    ],
    explanation:
      "DNS → TCP → TLS → HTTP er fire separate trinn FØR ditt request engang når Flask. Hver legger til litt latency — derfor er HTTP/2 og HTTP/3 designet for å redusere oppstartstiden.",
  },
  {
    id: "d-match-http-methods-semantic",
    kind: "match",
    title: "HTTP-metoder og deres formål",
    prompt: "Match metoden til riktig semantikk.",
    topic: "HTTP",
    pairs: [
      { left: "GET", right: "Hent ressurs — idempotent, ingen sideeffekter" },
      { left: "POST", right: "Opprett ressurs eller utfør handling med sideeffekter" },
      { left: "PUT", right: "Erstatt en ressurs fullstendig — idempotent" },
      { left: "PATCH", right: "Delvis oppdatering av en ressurs" },
      { left: "DELETE", right: "Slett ressurs — idempotent" },
      { left: "HEAD", right: "Som GET, men bare headere — sjekk om ressurs finnes" },
      { left: "OPTIONS", right: "Spør serveren hvilke metoder som er tillatt (CORS preflight)" },
    ],
    explanation:
      "Idempotent = trygt å kjøre flere ganger (samme resultat). GET, PUT, DELETE skal være idempotente. POST er IKKE idempotent — to POST = to nye ressurser. Refresh på POST-side er derfor farlig (derav Post-Redirect-Get).",
  },
  {
    id: "d-fill-flask-status",
    kind: "fill",
    title: "Returner egen statuskode i Flask",
    prompt:
      "Returner en 201-respons med Location-header etter at en ny kunde er opprettet.",
    topic: "Flask",
    language: "python",
    template:
      "from flask import Flask, request, __1__, url_for\n\n@app.route(\"/kunder\", methods=[\"POST\"])\ndef opprett_kunde():\n    navn = request.form[\"navn\"]\n    nr = db_insert(navn)\n    response = __1__(\"\", __2__=__3__)\n    response.headers[\"Location\"] = url_for(\"vis_kunde\", nr=nr)\n    return response",
    blanks: ["make_response", "status", "201"],
    options: ["make_response", "Response", "redirect", "status", "code", "201", "200", "302"],
    explanation:
      "make_response gir et Response-objekt du kan endre. Alternativt: return \"\", 201, {\"Location\": ...} — Flask aksepterer (body, status, headers)-tuple direkte fra view-funksjonen.",
  },

  // ============= SIKKERHET — MULTIPLE CHOICE =============
  {
    id: "d-quiz-sql-injection",
    kind: "quiz",
    title: "SQL Injection — hva er feil?",
    prompt: "Velg det BESTE forsvaret.",
    topic: "Sikkerhet",
    question: "Koden under er sårbar. Hva er den korrekte fiksen?",
    code: "username = request.form[\"username\"]\ncursor.execute(\"SELECT * FROM bruker WHERE navn = '\" + username + \"'\")",
    language: "python",
    options: [
      {
        text: "Bruk parameterisert spørring: cursor.execute(\"SELECT * FROM bruker WHERE navn = %s\", (username,))",
        correct: true,
        rationale:
          "Parameterized queries lar DB-driveren håndtere escaping. Selve SQL-koden parses FØR username settes inn, så ingen brukerinput kan endre strukturen.",
      },
      {
        text: "Filtrer bort apostrofer fra username før du legger den inn",
        correct: false,
        rationale:
          "Blacklist-tilnærming. Glemmer du ett tegn (--, %, ;), er du fortsatt sårbar. Det er en kontinuerlig kamp og du taper alltid.",
      },
      {
        text: "Sett brukernavnet i en variabel før konkatenering",
        correct: false,
        rationale: "Endrer ingenting — strengen blir den samme. Bruk parameterized queries.",
      },
      {
        text: "Bytt til en NoSQL-database",
        correct: false,
        rationale:
          "NoSQL har sine egne injeksjons-sårbarheter (f.eks. MongoDB operator injection). Problemet er konkatenering, ikke valg av database.",
      },
    ],
    explanation:
      "Den eneste pålitelige løsningen er parameterized queries (også kalt prepared statements). De fleste DB-drivere støtter det — bare ALDRI lim strenger inn i SQL.",
  },
  {
    id: "d-quiz-xss",
    kind: "quiz",
    title: "XSS — hvilken kode er sårbar?",
    prompt: "Velg det sårbare kodemønsteret.",
    topic: "Sikkerhet",
    question:
      "Hvilken av disse Jinja-malene er sårbar for cross-site scripting (XSS) hvis kommentar.tekst kan inneholde brukerinput?",
    options: [
      {
        text: "{{ kommentar.tekst | safe }}",
        correct: true,
        rationale:
          "|safe slår av autoescape. Hvis tekst inneholder <script>...</script>, vil det kjøres i andre brukeres nettlesere. Klassisk reflected/stored XSS.",
      },
      {
        text: "{{ kommentar.tekst }}",
        correct: false,
        rationale: "Default i Jinja: autoescape escaper <, >, & osv. til entiteter. Trygt.",
      },
      {
        text: "{{ kommentar.tekst | e }}",
        correct: false,
        rationale: "|e er det samme som default escape — eksplisitt eskaping.",
      },
      {
        text: "{{ kommentar.tekst | escape }}",
        correct: false,
        rationale: "Identisk med |e og default. Helt trygt.",
      },
    ],
    explanation:
      "Regelen: |safe bare på innhold du selv har generert/sanitisert. Aldri på brukerinput. Hvis du må vise rik tekst fra brukere, bruk en allowlist-sanitizer som bleach FØRST, deretter |safe.",
  },
  {
    id: "d-quiz-csrf",
    kind: "quiz",
    title: "CSRF — hva beskytter mot det?",
    prompt: "Velg den primære forsvarsmekanismen.",
    topic: "Sikkerhet",
    question:
      "En innlogget bruker besøker et ondsinnet nettsted som har et skjult <form action=\"https://bank.no/overfor\" method=\"POST\">. Browseren sender med cookies automatisk. Hva er DEN viktigste beskyttelsen?",
    options: [
      {
        text: "CSRF-token: skjult, unik verdi i hvert skjema som serveren validerer",
        correct: true,
        rationale:
          "Tokenet legges i hvert skjema og i session. Det ondsinnede nettstedet kan ikke lese cookien (Same-Origin Policy) og kan derfor ikke gjette tokenet.",
      },
      {
        text: "HTTPS i seg selv",
        correct: false,
        rationale:
          "HTTPS krypterer transporten, men hjelper ikke mot CSRF — request-en er fortsatt gyldig.",
      },
      {
        text: "Hashe brukerens passord med bcrypt",
        correct: false,
        rationale:
          "Hashing beskytter mot lekkasje av passord, ikke CSRF. Passordet trengs ikke for CSRF-angrep — cookie-en sendes automatisk.",
      },
      {
        text: "Vise et CAPTCHA på alle sider",
        correct: false,
        rationale:
          "Reduserer risiko, men CSRF-token er den standardiserte og praktiske løsningen. CAPTCHA på alle sider ville være forferdelig UX.",
      },
    ],
    explanation:
      "Flask-WTF gir CSRF-token gratis i skjemaer ({{ form.hidden_tag() }}). SameSite=Lax/Strict på session-cookien er en ekstra og enklere beskyttelse moderne browsere støtter.",
  },
  {
    id: "d-quiz-password-storage",
    kind: "quiz",
    title: "Passord-lagring — riktig fremgangsmåte",
    prompt: "Velg den korrekte og sikre metoden.",
    topic: "Sikkerhet",
    question: "Hvordan SKAL passord lagres i databasen?",
    options: [
      {
        text: "Hash + salt med bcrypt, scrypt eller Argon2 (slow hashing)",
        correct: true,
        rationale:
          "Slow hashing gjør brute-force dyrt — selv om hele DB-en lekker, koster det årevis å knekke ett passord. Salt unngår rainbow tables.",
      },
      {
        text: "SHA-256 av passordet",
        correct: false,
        rationale:
          "SHA-256 er FOR raskt — en GPU prøver milliarder per sekund. Bruk slow hashing istedenfor.",
      },
      {
        text: "AES-kryptert med en server-nøkkel",
        correct: false,
        rationale:
          "Kryptering er reversibelt — har du nøkkelen får du klartekst. Passord skal være ENVEIS hashet, aldri krypterte.",
      },
      {
        text: "Klartekst — men bare i en intern DB",
        correct: false,
        rationale:
          "Aldri klartekst. Hver eneste lekkasje vi ser i nyhetene har lagret passord på dårlig vis.",
      },
    ],
    explanation:
      "I Flask: werkzeug.security.generate_password_hash() bruker pbkdf2:sha256 by default — godt nok. For nye prosjekter: bcrypt/argon2 er state of the art. Sjekk innlogging med check_password_hash().",
  },
  {
    id: "d-quiz-sql-injection-spot",
    kind: "quiz",
    title: "Hvilke linjer er trygge?",
    prompt: "Flere riktige svar mulig.",
    topic: "Sikkerhet",
    multi: true,
    question:
      "Marker ALLE linjer som er TRYGGE mot SQL injection. Antar at navn kommer fra request.form.",
    options: [
      {
        text: "cursor.execute(\"SELECT * FROM bruker WHERE navn = %s\", (navn,))",
        correct: true,
        rationale: "Parameterized query. %s i mysql.connector er en bind-parameter, ikke en streng-format.",
      },
      {
        text: "cursor.execute(f\"SELECT * FROM bruker WHERE navn = '{navn}'\")",
        correct: false,
        rationale: "f-string konkatenerer brukerinput direkte. Klassisk SQL injection.",
      },
      {
        text: "cursor.execute(\"SELECT * FROM bruker WHERE navn = '%s'\" % navn)",
        correct: false,
        rationale:
          "% er Python string formatting — ikke en bind-parameter. Like sårbart som +-konkatenering.",
      },
      {
        text: "cursor.execute(\"SELECT * FROM bruker WHERE id = %s\", (int(id),))",
        correct: true,
        rationale:
          "Parameterized og int() validerer typen før det går til DB. Dobbelt trygt.",
      },
      {
        text: "cursor.execute(\"SELECT * FROM \" + tabellnavn + \" WHERE id = %s\", (id,))",
        correct: false,
        rationale:
          "Tabellnavn kan IKKE være parameter i de fleste DB-drivere. Hvis tabellnavn kommer fra request, må du whitelist-validere det manuelt mot en kjent liste.",
      },
    ],
    explanation:
      "Regelen: alle brukerverdier skal inn som parametere (%s i mysql, ? i sqlite). Hvis du må variere strukturen (tabellnavn, kolonner) — bygg fra en hardkodet allowlist, aldri direkte fra input.",
  },
  {
    id: "d-quiz-cookie-flags",
    kind: "quiz",
    title: "Sikre cookies — hvilke flagg?",
    prompt: "Flere riktige svar.",
    topic: "Sikkerhet",
    multi: true,
    question:
      "Hvilke cookie-flagg SKAL settes på en session-cookie i en produksjons-app?",
    options: [
      {
        text: "Secure — cookien sendes bare over HTTPS",
        correct: true,
        rationale: "Uten Secure kan cookien lekke over HTTP og fanges opp på et åpent WiFi.",
      },
      {
        text: "HttpOnly — JavaScript kan ikke lese cookien",
        correct: true,
        rationale:
          "Beskytter mot at en XSS-sårbarhet kan stjele session. Selv om XSS finnes, kan angriperen ikke hente cookien.",
      },
      {
        text: "SameSite=Lax (eller Strict) — CSRF-beskyttelse",
        correct: true,
        rationale:
          "SameSite hindrer at cookien sendes med cross-site requests fra andre nettsteder — sterk CSRF-beskyttelse i moderne browsere.",
      },
      {
        text: "Path=/ — cookien gjelder for hele sitet",
        correct: false,
        rationale: "Path er ikke en sikkerhetsmekanisme, bare scope. Default-verdien er fin.",
      },
      {
        text: "Max-Age=999999999 — cookien varer for alltid",
        correct: false,
        rationale: "Lange sesjoner ØKER risikoen. Kort gyldighet + refresh er bedre.",
      },
    ],
    explanation:
      "I Flask: app.config['SESSION_COOKIE_SECURE'] = True, SESSION_COOKIE_HTTPONLY = True (default), SESSION_COOKIE_SAMESITE = 'Lax'. Tre linjer som høyner sikkerheten dramatisk.",
  },
  {
    id: "d-quiz-mass-assignment",
    kind: "quiz",
    title: "Mass-assignment-sårbarhet",
    prompt: "Velg det BESTE forsvaret.",
    topic: "Sikkerhet",
    question:
      "En route oppdaterer brukerprofil ved å iterere request.form: `for key, value in request.form.items(): setattr(user, key, value)`. Hva er hovedfaren?",
    options: [
      {
        text: "Brukeren kan sende inn felter de ikke skulle hatt tilgang til (f.eks. is_admin=true)",
        correct: true,
        rationale:
          "Klassisk mass-assignment: brukeren kan trigge oppdatering av felter form-en aldri viste — inkludert rolle-felt eller andre privilegier.",
      },
      {
        text: "Det blir tregt",
        correct: false,
        rationale: "Det er ikke en sikkerhets-bekymring her.",
      },
      {
        text: "request.form er kun lesbar",
        correct: false,
        rationale: "Ikke teknisk relevant for sårbarheten.",
      },
      {
        text: "Det kan lage SQL injection",
        correct: false,
        rationale: "SQL injection er en annen vektor — her er problemet hvilke FELTER som settes.",
      },
    ],
    explanation:
      "Løsning: bruk en eksplisitt allowlist — hent BARE de feltene route-en faktisk tillater. Eks: navn = request.form.get(\"navn\"); user.navn = navn. Aldri loop blindt over input.",
  },
];
