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
];
