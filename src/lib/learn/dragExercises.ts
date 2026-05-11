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
  {
    id: "d-order-git-branch-flow",
    kind: "order",
    title: "Branch-flyt: jobbe på en feature og merge tilbake",
    prompt:
      "Sett kommandoene i riktig rekkefølge for å lage en feature-branch, gjøre endringer, og merge tilbake til main.",
    topic: "Git",
    items: [
      "git checkout -b feat/min-feature",
      "# rediger filer ...",
      "git add .",
      "git commit -m \"min feature\"",
      "git checkout main",
      "git merge feat/min-feature",
      "git push",
    ],
    explanation:
      "checkout -b lager OG bytter til den nye branchen. Du jobber der, committer, så bytter du tilbake til main og fletter inn branchen. Push helt til slutt. Kurset følger nøyaktig denne flyten i git.md.",
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

  // ============= UNDERSPØRRINGER (SUBQUERIES) — alle nivåer =============
  // Nivå 1 (nybegynner): subquery i WHERE (IN, scalar)
  // Nivå 2 (mellom): EXISTS, NOT IN/NOT EXISTS, korrelerte
  // Nivå 3 (avansert): subquery i FROM (avledet tabell), CTE, nested
  // Nivå 4 (ekspert): rekursiv CTE, window-funksjoner kombinert

  {
    id: "d-quiz-subquery-predict-inner",
    kind: "quiz",
    title: "Hva returnerer den INDRE SELECTen?",
    prompt:
      "Den indre SELECTen kjører først. Hva er resultatet av den, før den ytre filtreringen?",
    topic: "Underspørringer",
    question:
      "Tabellen Produkt har 5 rader med pris: 50, 100, 100, 200, 300. Hva returnerer den innerste delen (SELECT AVG(pris) FROM Produkt)?",
    code: "SELECT prodnavn\nFROM Produkt\nWHERE pris > (SELECT AVG(pris) FROM Produkt);",
    language: "sql",
    options: [
      {
        text: "Ett tall: 150 (gjennomsnittet av prisene)",
        correct: true,
        rationale:
          "AVG returnerer EN skalar-verdi. Den ytre WHERE bruker så 150 som sammenligningsverdi.",
      },
      {
        text: "En liste med 5 tall — én per rad",
        correct: false,
        rationale:
          "AVG aggregerer alle rader til ett tall. Hadde vi droppet aggregatet hadde vi fått 5 rader, men da ville scalar-sammenligningen feilet.",
      },
      {
        text: "En tabell med kolonnene navn og pris",
        correct: false,
        rationale:
          "Den indre SELECTen plukker bare AVG(pris) — én kolonne, én verdi.",
      },
      {
        text: "150, 150, 150, 150, 150 — én verdi per rad",
        correct: false,
        rationale:
          "AVG uten GROUP BY returnerer ÉN rad, ikke en verdi per input-rad.",
      },
    ],
    explanation:
      "Les alltid innenfra og ut: innerste SELECT først, så den ytre. AVG/COUNT/SUM/MIN/MAX uten GROUP BY → skalar (ett tall). Med GROUP BY → flere rader.",
  },
  {
    id: "d-quiz-subquery-in-vs-equals",
    kind: "quiz",
    title: "= vs IN — hvilken skal du bruke?",
    prompt: "Subqueryen kan returnere én eller flere rader. Velg riktig operator.",
    topic: "Underspørringer",
    question:
      "Du vil finne kunder i samme by som kunde nr 5. Subqueryen returnerer KÉN by-verdi (skalar). Hva er riktig?",
    code: "SELECT navn\nFROM Kunde\nWHERE by ??? (SELECT by FROM Kunde WHERE kundenr = 5);",
    language: "sql",
    options: [
      {
        text: "= — fordi subqueryen returnerer én skalarverdi",
        correct: true,
        rationale:
          "Når subqueryen er garantert å returnere én rad, fungerer = perfekt. IN ville også fungert, men = er mer presist og raskere.",
      },
      {
        text: "IN — alltid trygt med subqueries",
        correct: false,
        rationale:
          "Ville fungert her, men hvis subqueryen plutselig returnerer flere rader (eks. duplikater), gir = en runtime-feil. IN aksepterer 0..N verdier.",
      },
      {
        text: "EXISTS — den eneste riktige med subqueries",
        correct: false,
        rationale:
          "EXISTS returnerer bare TRUE/FALSE, ikke en verdi du kan sammenligne by mot. Feil syntaks her.",
      },
      {
        text: "LIKE — sammenligner strenger",
        correct: false,
        rationale:
          "LIKE er for mønster-matching med %, ikke for sammenligning mot subquery-resultat.",
      },
    ],
    explanation:
      "Regel: skalar (én rad, én kolonne) → =. Liste (flere rader) → IN. Sjekk om noe finnes → EXISTS. Hvis du er usikker, IN er trygt — fungerer både for 0, 1 og N rader.",
  },
  {
    id: "d-fill-subquery-in",
    kind: "fill",
    title: "Subquery i WHERE — IN-listen",
    prompt:
      "Finn alle produkter som er bestilt minst én gang. Bruk IN med en subquery som returnerer alle bestilte prodNr.",
    topic: "Underspørringer",
    language: "sql",
    template:
      "SELECT prodnavn\nFROM Produkt\n__1__ prodnr __2__ (\n  __3__ DISTINCT prodnr\n  FROM Ordrelinje\n);",
    blanks: ["WHERE", "IN", "SELECT"],
    options: ["WHERE", "IN", "EXISTS", "ANY", "SELECT", "FROM", "JOIN", "DISTINCT"],
    explanation:
      "Subquery returnerer en LISTE av prodNr — IN sjekker om hver produkt-rad finnes i den listen. JOIN ville gitt samme resultat ofte, men subquery er enklere når du bare trenger «finnes / finnes ikke».",
  },
  {
    id: "d-fill-subquery-not-in",
    kind: "fill",
    title: "NOT IN — produkter som ALDRI er solgt",
    prompt:
      "Finn produkter som ikke er på noen ordrelinje. Pass på NULL-fellen — bruk IS NOT NULL i subqueryen.",
    topic: "Underspørringer",
    language: "sql",
    template:
      "SELECT prodnavn\nFROM Produkt\nWHERE prodnr __1__ __2__ (\n  SELECT prodnr\n  FROM Ordrelinje\n  WHERE prodnr __3__ NULL\n);",
    blanks: ["NOT", "IN", "IS NOT"],
    options: ["NOT", "IN", "IS NOT", "IS", "=", "EXISTS", "ANY"],
    explanation:
      "NOT IN-fellen: hvis subqueryen returnerer ÉN NULL-verdi, blir HELE NOT IN UKJENT (NULL) og du får 0 rader. Filtrer NULL ut i subqueryen, eller bytt til NOT EXISTS som ikke har problemet.",
  },
  {
    id: "d-fill-subquery-scalar",
    kind: "fill",
    title: "Skalar-subquery i SELECT",
    prompt:
      "Vis hvert produkt sammen med antallet ganger det er bestilt. Bruk en skalar-subquery i SELECT-listen.",
    topic: "Underspørringer",
    language: "sql",
    template:
      "SELECT p.prodnavn,\n       (__1__ __2__(*) __3__ Ordrelinje ol __4__ ol.prodnr = p.prodnr) __5__ antall\nFROM Produkt p;",
    blanks: ["SELECT", "COUNT", "FROM", "WHERE", "AS"],
    options: ["SELECT", "COUNT", "SUM", "FROM", "WHERE", "ON", "AS", "IN"],
    explanation:
      "Skalar-subquery i SELECT-listen kjøres ÉN gang per ytre rad. Korrelert via p.prodnr — refererer til den ytre tabellens kolonne. Funksjonelt likt LEFT JOIN + GROUP BY, men noen ganger lettere å lese.",
  },
  {
    id: "d-fill-subquery-exists",
    kind: "fill",
    title: "EXISTS — kunder som har lagt inn ordre",
    prompt:
      "Finn kunder som har MINST én ordre. EXISTS er ofte raskere enn IN — sjekker bare om det FINNES en match.",
    topic: "Underspørringer",
    language: "sql",
    template:
      "SELECT k.navn\nFROM Kunde k\nWHERE __1__ (\n  __2__ 1\n  FROM Ordre o\n  __3__ o.kundenr = k.kundenr\n);",
    blanks: ["EXISTS", "SELECT", "WHERE"],
    options: ["EXISTS", "IN", "ANY", "SELECT", "FROM", "WHERE", "JOIN", "1"],
    explanation:
      "SELECT 1 (eller hva som helst) i EXISTS — innholdet matter ikke, bare om RADER FINNES. Korrelasjonen `o.kundenr = k.kundenr` kobler subqueryen til hver ytre kunde-rad.",
  },
  {
    id: "d-fill-subquery-correlated",
    kind: "fill",
    title: "Korrelert subquery — kunders dyreste ordre",
    prompt:
      "For hver kunde, vis ordren med høyest totalsum. Korrelert subquery refererer til ytre tabells kolonne.",
    topic: "Underspørringer",
    language: "sql",
    template:
      "SELECT o.ordrenr, o.kundenr, o.total\nFROM Ordre o\nWHERE o.total = (\n  SELECT __1__(o2.total)\n  FROM Ordre o2\n  __2__ o2.kundenr __3__ o.kundenr\n);",
    blanks: ["MAX", "WHERE", "="],
    options: ["MAX", "MIN", "AVG", "WHERE", "ON", "=", "AND", "HAVING"],
    explanation:
      "Korrelert = subqueryen referer til ytre query (her o.kundenr). Subqueryen evaluerer på nytt for HVER ytre rad — kan være tregt på store datasett. Window-funksjoner (ROW_NUMBER OVER PARTITION) er ofte raskere.",
  },
  {
    id: "d-fill-subquery-derived",
    kind: "fill",
    title: "Subquery i FROM (avledet tabell)",
    prompt:
      "Finn gjennomsnittsalder per kjønn — men bare for grupper med flere enn 10 personer. Gruppér først i en sub-SELECT, filtrer så.",
    topic: "Underspørringer",
    language: "sql",
    template:
      "SELECT kjonn, snittalder\nFROM (\n  SELECT kjonn, __1__(*) __2__ antall, __3__(alder) __2__ snittalder\n  FROM Person\n  __4__ kjonn\n) __5__\nWHERE antall > 10;",
    blanks: ["COUNT", "AS", "AVG", "GROUP BY", "AS gr"],
    options: ["COUNT", "AVG", "SUM", "AS", "AS gr", "GROUP BY", "ORDER BY", "HAVING"],
    explanation:
      "Avledet tabell (også: «inline view»): subquery i FROM må ha et alias (her «gr»). Brukes når du vil filtrere/joine på AGGREGERTE verdier — HAVING fungerer også, men avledede tabeller skalerer bedre når du har flere lag.",
  },
  {
    id: "d-fill-subquery-cte",
    kind: "fill",
    title: "CTE (WITH ... AS) — lesbart alternativ",
    prompt:
      "Samme problem som «avledet tabell»-oppgaven over, men løst med CTE. Mye lettere å lese.",
    topic: "Underspørringer",
    language: "sql",
    template:
      "__1__ gr __2__ (\n  SELECT kjonn, COUNT(*) AS antall, AVG(alder) AS snittalder\n  FROM Person\n  GROUP BY kjonn\n)\nSELECT kjonn, snittalder\n__3__ gr\nWHERE antall > 10;",
    blanks: ["WITH", "AS", "FROM"],
    options: ["WITH", "AS", "FROM", "SELECT", "WHERE", "JOIN", "IN", "EXISTS"],
    explanation:
      "CTE = Common Table Expression. Lik avledet tabell, men navngitt øverst — gir lesbarhet og lar deg referere samme «midlertidige tabell» flere ganger. Postgres kan også gjøre rekursive CTE-er for trær.",
  },
  {
    id: "d-fill-subquery-cte-multi",
    kind: "fill",
    title: "Flere CTE-er — toppselgerne per kategori",
    prompt:
      "Bruk to CTE-er: én for salg per produkt, én for max-salg per kategori. JOIN dem til slutt.",
    topic: "Underspørringer",
    language: "sql",
    template:
      "WITH salg_per_produkt __1__ (\n  SELECT p.prodnr, p.kategori, SUM(ol.antall) AS solgt\n  FROM Produkt p\n  JOIN Ordrelinje ol ON ol.prodnr = p.prodnr\n  GROUP BY p.prodnr, p.kategori\n)__2__\nmax_per_kat AS (\n  SELECT kategori, MAX(solgt) AS max_solgt\n  FROM salg_per_produkt\n  __3__ kategori\n)\nSELECT s.prodnr, s.kategori, s.solgt\nFROM salg_per_produkt s\nJOIN max_per_kat m\n  __4__ s.kategori = m.kategori __5__ s.solgt = m.max_solgt;",
    blanks: ["AS", ",", "GROUP BY", "ON", "AND"],
    options: ["AS", ",", "WITH", "SELECT", "GROUP BY", "HAVING", "ON", "AND", "WHERE"],
    explanation:
      "Flere CTE-er separeres med komma — kun ett WITH øverst. Hver CTE kan referere til foregående. Dette mønsteret («finn topp-N per gruppe») er klassisk eksamenstoff — kjenn det igjen.",
  },
  {
    id: "d-quiz-subquery-vs-join",
    kind: "quiz",
    title: "Subquery vs JOIN — hvilken er bedre?",
    prompt: "Velg det best dekkende svaret.",
    topic: "Underspørringer",
    question:
      "Du vil finne navn på alle kunder som har minst én ordre. Du kan bruke INNER JOIN eller EXISTS-subquery. Hvilken er BEST?",
    options: [
      {
        text: "EXISTS-subquery — får ikke duplikater, semantisk klarere",
        correct: true,
        rationale:
          "INNER JOIN gir ÉN rad per match — så kunde med 5 ordrer kommer 5 ganger med mindre du legger til DISTINCT. EXISTS sjekker bare «finnes match?» og gir hver kunde én gang.",
      },
      {
        text: "INNER JOIN — alltid raskere enn subquery",
        correct: false,
        rationale:
          "Det varierer per DB-motor. Moderne optimalisatorer omformer ofte EXISTS-subqueries internt til semi-joins, så ytelsen er ofte lik.",
      },
      {
        text: "De er identiske i alle henseender",
        correct: false,
        rationale: "Resultatet kan skille seg ved duplikater (se EXISTS-svaret).",
      },
      {
        text: "Subquery er feil her — kun JOIN kan finne match",
        correct: false,
        rationale: "EXISTS er en helt vanlig løsning på dette problemet.",
      },
    ],
    explanation:
      "Tommelfingerregel: bruker du data fra begge tabeller i SELECT → JOIN. Vil du bare sjekke om noe finnes → EXISTS. Vil du forenkle med en liste av verdier → IN.",
  },
  {
    id: "d-order-subquery-evaluation",
    kind: "order",
    title: "Evalueringsrekkefølge — hvordan kjøres en nøstet query?",
    prompt:
      "En query har subquery i WHERE. I hvilken rekkefølge evaluerer SQL motoren delene? Konseptuelt rekkefølge, ikke optimalisert.",
    topic: "Underspørringer",
    items: [
      "FROM — bestem tabellen(e) og legg dem i minnet",
      "WHERE blir evaluert — for hver rad må subquery-resultatet være kjent",
      "Subquery: kjøres (eventuelt én gang for skalar, eller per rad for korrelert)",
      "Resultatet fra subqueryen brukes til å filtrere ytre rader",
      "GROUP BY — grupperer de filtrerte radene",
      "HAVING — filtrerer gruppene",
      "SELECT — plukker ut kolonnene som ble bedt om",
      "ORDER BY — sorterer slutt-resultatet",
      "LIMIT — kutter ned til N rader",
    ],
    explanation:
      "Den faktiske rekkefølgen i SQL motoren matcher IKKE den syntaktiske rekkefølgen i din query. Det forklarer hvorfor du kan referere til kolonne-alias i ORDER BY (sist) men ikke i WHERE (tidlig).",
  },
  {
    id: "d-fill-subquery-not-exists",
    kind: "fill",
    title: "NOT EXISTS — anti-join trygg mot NULL",
    prompt:
      "Finn produkter som ALDRI er bestilt. NOT EXISTS er sikrere enn NOT IN her.",
    topic: "Underspørringer",
    language: "sql",
    template:
      "SELECT p.prodnavn\nFROM Produkt p\nWHERE __1__ __2__ (\n  SELECT 1\n  FROM Ordrelinje ol\n  WHERE ol.prodnr __3__ p.prodnr\n);",
    blanks: ["NOT", "EXISTS", "="],
    options: ["NOT", "EXISTS", "IN", "ANY", "=", "IS", "AND", "WHERE"],
    explanation:
      "NOT EXISTS har ikke NULL-fellen som NOT IN. Den korrelerte sjekken `ol.prodnr = p.prodnr` peker tilbake på den ytre tabellen — finner ingen match → produktet er aldri bestilt.",
  },
  {
    id: "d-match-subquery-typer",
    kind: "match",
    title: "Subquery-typer og når du bruker hver",
    prompt: "Koble hver subquery-type til sin typiske bruk.",
    topic: "Underspørringer",
    pairs: [
      {
        left: "Skalar-subquery (én rad, én kolonne)",
        right: "Sammenligning med = i WHERE, eller utregnet kolonne i SELECT",
      },
      {
        left: "Listesubquery (mange rader, én kolonne)",
        right: "WHERE x IN (SELECT ...) — sjekker tilhørighet",
      },
      {
        left: "EXISTS-subquery",
        right: "Sjekk om minst én match finnes — gir TRUE/FALSE",
      },
      {
        left: "Korrelert subquery",
        right: "Refererer til ytre tabells kolonne — evalueres per ytre rad",
      },
      {
        left: "Avledet tabell (subquery i FROM)",
        right: "Filtrer/joine på aggregerte verdier eller for-prosesserte data",
      },
      {
        left: "CTE (WITH ... AS)",
        right: "Navngitt midlertidig resultat — lesbart, gjenbrukbart i samme query",
      },
    ],
    explanation:
      "Disse seks dekker 99% av subquery-bruk. Når du møter en spørring du ikke forstår, klassifiser den først — det gir deg rammeverket for å lese den.",
  },
  {
    id: "d-fill-subquery-having",
    kind: "fill",
    title: "Subquery i HAVING — over gjennomsnittet",
    prompt:
      "Finn kategorier hvor SNITTPRISEN er høyere enn totalsnittet på tvers av alle produkter.",
    topic: "Underspørringer",
    language: "sql",
    template:
      "SELECT kategori, AVG(pris) AS kat_snitt\nFROM Produkt\n__1__ kategori\n__2__ AVG(pris) > (\n  SELECT __3__(pris)\n  FROM Produkt\n);",
    blanks: ["GROUP BY", "HAVING", "AVG"],
    options: ["GROUP BY", "HAVING", "WHERE", "AVG", "SUM", "MAX", "ORDER BY"],
    explanation:
      "HAVING tillater aggregat-uttrykk OG kan sammenligne mot subquery. Skalar-subqueryen returnerer ett totalsnitt — hver kategorigruppe sammenlignes mot dette.",
  },
  {
    id: "d-fill-subquery-nested-3",
    kind: "fill",
    title: "Tre nivåer nøsting (avansert)",
    prompt:
      "Finn kunder som har bestilt det MEST POPULÆRE produktet. Tre nivåer: ytterst kunde, mellom prodnr, innerst antall-pop.",
    topic: "Underspørringer",
    language: "sql",
    template:
      "SELECT DISTINCT k.navn\nFROM Kunde k\nINNER JOIN Ordre o ON o.kundenr = k.kundenr\nINNER JOIN Ordrelinje ol __1__ ol.ordrenr = o.ordrenr\nWHERE ol.prodnr __2__ (\n  SELECT prodnr\n  FROM Ordrelinje\n  GROUP BY prodnr\n  HAVING SUM(antall) = (\n    SELECT __3__(SUM(antall))\n    FROM Ordrelinje\n    __4__ prodnr\n  )\n);",
    blanks: ["ON", "=", "MAX", "GROUP BY"],
    options: ["ON", "WHERE", "=", "IN", "MAX", "SUM", "GROUP BY", "HAVING"],
    explanation:
      "Les innenfra og ut: innerst finner MAX av totalsalg per produkt. Mellom-laget plukker prodnr som matcher den maxen. Ytterst finner kunder som har bestilt det. Tre nivåer er øvre grense for lesbarhet — over det bør du bruke CTE.",
  },

  // ============= PRIMÆRNØKKEL / FREMMEDNØKKEL — riktig valg =============

  {
    id: "d-quiz-pk-choice-customer",
    kind: "quiz",
    title: "Hvilken kolonne bør være PK?",
    prompt: "Velg det best dekkende svaret.",
    topic: "Nøkler",
    question:
      "Du designer Kunde-tabellen: (id INT AUTO_INCREMENT, navn TEXT, epost TEXT UNIQUE, telefon TEXT, fnr CHAR(11) UNIQUE). Hvilken bør være PK?",
    options: [
      {
        text: "id (surrogatnøkkel) — alle andre kandidatnøkler får UNIQUE",
        correct: true,
        rationale:
          "Surrogatnøkkel er stabil (endrer aldri verdi), kort (INT), og lekker ikke business-info. epost og fnr er naturlige kandidatnøkler — de får UNIQUE i tillegg.",
      },
      {
        text: "epost — den er jo unik per person",
        correct: false,
        rationale:
          "Folk bytter epost. Hvis PK endres, må alle FK-er oppdateres — vondt. Bruk surrogat-id som PK og UNIQUE på epost.",
      },
      {
        text: "fnr (fødselsnummer)",
        correct: false,
        rationale:
          "Selv om det er stabilt, er det sensitivt — du sprer det da via FK til mange tabeller. Datatilsynet liker ikke det. Hold fnr i én tabell, bruk surrogat-id andre steder.",
      },
      {
        text: "navn",
        correct: false,
        rationale:
          "Navn er ikke unike (mange Per Hansen finnes). Ville brutt PK-kravet om unikhet.",
      },
    ],
    explanation:
      "Hovedregel: bruk surrogatnøkkel (AUTO_INCREMENT / SERIAL / UUID) for PK. Sett UNIQUE på naturlige kandidatnøkler. Da kan business-data endre seg uten å bryte relasjoner.",
  },
  {
    id: "d-quiz-pk-junction",
    kind: "quiz",
    title: "PK i en M:N-koblingstabell",
    prompt: "Velg det riktige PK-valget.",
    topic: "Nøkler",
    question:
      "Du lager koblingstabellen Tar(sid, fkode, semester) for at studenter tar fag. Hva er PK?",
    options: [
      {
        text: "Sammensatt PK = (sid, fkode)",
        correct: true,
        rationale:
          "Standard for M:N: PK består av FK-ene til de to entitetene. Sperrer dobbeltregistrering (samme student kan ikke ta samme fag to ganger).",
      },
      {
        text: "Ny surrogat-id (tarId INT AUTO_INCREMENT)",
        correct: false,
        rationale:
          "Tillater dobbeltregistrering — to rader med samme (sid, fkode). Hvis du legger til surrogat, må du fortsatt sette UNIQUE på (sid, fkode).",
      },
      {
        text: "PK = sid",
        correct: false,
        rationale:
          "Da kunne hver student bare tatt ÉTT fag totalt. Ikke det vi vil.",
      },
      {
        text: "PK = (sid, fkode, semester) — inkluder semester",
        correct: false,
        rationale:
          "Det åpner for samme student-fag-par på ulike semestre. RIKTIG hvis det er forretningsregelen — men da må spørsmålet eksplisitt si det. Standard er (sid, fkode).",
      },
    ],
    explanation:
      "Junction table PK = (FK_a, FK_b). semester og andre relasjons-attributter er bare kolonner. Hvis samme par MÅ kunne forekomme flere ganger, utvid PK med en diskriminator (dato, semester).",
  },
  {
    id: "d-quiz-pk-weak-entity",
    kind: "quiz",
    title: "PK i en svak entitet",
    prompt: "Velg det riktige PK-valget.",
    topic: "Nøkler",
    question:
      "Ordrelinje(ordreNr, linjeNr, prodNr, antall). Hver ordrelinje hører til én ordre, og linjeNr er bare unikt INNENFOR den ordren. Hva er PK?",
    options: [
      {
        text: "(ordreNr, linjeNr) — sammensatt med eier-FK",
        correct: true,
        rationale:
          "Klassisk svak entitet: eier-FK + lokal diskriminator. ordreNr alene er ikke unik (én ordre har flere linjer), linjeNr alene er ikke unik (linje 1 finnes i mange ordre).",
      },
      {
        text: "linjeNr alene",
        correct: false,
        rationale: "Ikke unik på tvers av ordrer — linje 1 finnes i hver ordre.",
      },
      {
        text: "(linjeNr, prodNr)",
        correct: false,
        rationale:
          "Tilfeldigvis unik i de fleste datasett, men logisk feil — produkt er en attributt, ikke en identifikator.",
      },
      {
        text: "ordreNr alene",
        correct: false,
        rationale: "Ikke unik — én ordre har flere linjer.",
      },
    ],
    explanation:
      "Svak entitet → PK inkluderer eier-FK. ordreNr må også være FOREIGN KEY (referanseintegritet) — med ON DELETE CASCADE er typisk (sletter ordren, forsvinner linjene).",
  },
  {
    id: "d-quiz-fk-side",
    kind: "quiz",
    title: "Hvor hører FK-en hjemme (1:N)?",
    prompt: "Velg den riktige plasseringen.",
    topic: "Nøkler",
    question:
      "1:N-relasjon: én KATEGORI har 0..N PRODUKTer; hvert PRODUKT hører til nøyaktig én KATEGORI. Hvor legger du FK-en?",
    options: [
      {
        text: "I PRODUKT — kolonnen Produkt.kategoriNr → Kategori(kategoriNr)",
        correct: true,
        rationale:
          "Huskeregel: «FK-en bor på mange-siden». Hvert produkt har én kategori, så det er én verdi — passer i én kolonne.",
      },
      {
        text: "I KATEGORI — kolonnen Kategori.prodNr → Produkt(prodNr)",
        correct: false,
        rationale:
          "Da kunne én kategori bare ha ETT produkt. Du må trekke flere prodNr inn i én rad — bryter 1NF og kardinaliteten.",
      },
      {
        text: "I en ny koblingstabell KategoriProdukt(kategoriNr, prodNr)",
        correct: false,
        rationale:
          "Koblingstabell brukes til M:N. Her er det 1:N, så det er overkill — tabellen ville hatt UNIQUE på prodNr, og du fjerner ikke noe.",
      },
      {
        text: "I begge tabeller — symmetri er fint",
        correct: false,
        rationale:
          "Dupliserer informasjon → bryter 3NF og inviterer inkonsistens. Aldri samme FK to steder.",
      },
    ],
    explanation:
      "1:N → FK på mange-siden, alltid. 1:1 → FK på én av sidene + UNIQUE. M:N → ingen FK direkte; bruk koblingstabell.",
  },
  {
    id: "d-match-pk-types",
    kind: "match",
    title: "Nøkkel-typer i praksis",
    prompt: "Match hvert begrep til riktig definisjon eller bruk.",
    topic: "Nøkler",
    pairs: [
      {
        left: "Surrogatnøkkel",
        right: "Kunstig PK (auto_increment / SERIAL / UUID) — stabil, kort",
      },
      {
        left: "Naturlig nøkkel",
        right: "Eksisterende business-felt (epost, fnr, ISBN) — kan endre seg",
      },
      {
        left: "Sammensatt nøkkel",
        right: "PK = flere kolonner kombinert — vanlig i junction og svake entiteter",
      },
      {
        left: "Alternativ nøkkel",
        right: "Kandidatnøkkel som IKKE ble valgt som PK — får UNIQUE-constraint",
      },
      {
        left: "Fremmednøkkel (FK)",
        right: "Kolonne(r) som peker på en annen tabells PK (eller UNIQUE)",
      },
      {
        left: "Selv-refererende FK",
        right: "FK som peker tilbake på samme tabells PK — for hierarkier (leder/underordnet)",
      },
    ],
  },
  {
    id: "d-quiz-fk-on-delete",
    kind: "quiz",
    title: "ON DELETE — riktig oppførsel",
    prompt: "Velg det best dekkende svaret.",
    topic: "Nøkler",
    question:
      "En kunde slettes. Du har Ordre(ordreNr, kundeNr FK). Hvilken ON DELETE-strategi er TRYGGEST i et regnskapssystem?",
    options: [
      {
        text: "ON DELETE RESTRICT (eller NO ACTION) — nekt sletting hvis det finnes ordrer",
        correct: true,
        rationale:
          "I et regnskapssystem skal historikken bevares — du kan ikke slette en kunde som har transaksjoner. RESTRICT tvinger deg til å bestemme bevisst hva som skal skje.",
      },
      {
        text: "ON DELETE CASCADE — slett alle kundens ordrer også",
        correct: false,
        rationale:
          "Du mister regnskapshistorikk. CASCADE passer for svake entiteter (ordrelinje slettes med ordre), ikke for kunde/ordre.",
      },
      {
        text: "ON DELETE SET NULL — fjern kundenavn fra ordren",
        correct: false,
        rationale:
          "Anonymiserer historikken, men sliter med å rapportere. Akseptabelt i noen scenarier (GDPR-sletting), men ikke standard.",
      },
      {
        text: "Ingen FK — la backend håndtere det",
        correct: false,
        rationale:
          "Da kan du ende opp med ordrer som peker på ikke-eksisterende kunder. Referanseintegritet skal håndheves i DB-en.",
      },
    ],
    explanation:
      "ON DELETE-strategier: RESTRICT/NO ACTION (nekt), CASCADE (slett barn), SET NULL (sett FK til NULL — FK må være nullable), SET DEFAULT (bytt til en default). Velg ut fra hva forretningen vil.",
  },
  {
    id: "d-fill-fk-cascade",
    kind: "fill",
    title: "CREATE TABLE med riktig FK-strategi",
    prompt:
      "Lag Ordrelinje slik at sletting av Ordre AUTOMATISK sletter linjene. Behold referanseintegritet til Produkt — ikke tillat sletting av et produkt som har solgt linjer.",
    topic: "Nøkler",
    language: "sql",
    template:
      "CREATE TABLE Ordrelinje (\n  ordreNr  INT NOT NULL,\n  linjeNr  INT NOT NULL,\n  prodNr   INT NOT NULL,\n  antall   INT NOT NULL,\n  __1__ KEY (ordreNr, linjeNr),\n  FOREIGN KEY (ordreNr) REFERENCES Ordre(ordreNr) ON DELETE __2__,\n  FOREIGN KEY (prodNr)  REFERENCES Produkt(prodNr) ON DELETE __3__\n);",
    blanks: ["PRIMARY", "CASCADE", "RESTRICT"],
    options: ["PRIMARY", "FOREIGN", "UNIQUE", "CASCADE", "RESTRICT", "SET NULL", "NO ACTION", "ON"],
    explanation:
      "Ordrelinje er svak entitet → CASCADE mot Ordre (linjer dør med ordren). Produkt er sterk og felles for mange — RESTRICT hindrer sletting hvis det finnes salgshistorikk.",
  },
  {
    id: "d-quiz-pk-natural-vs-surrogate",
    kind: "quiz",
    title: "Naturlig vs surrogat PK — flere tilfeller",
    prompt: "Flere riktige svar mulig.",
    topic: "Nøkler",
    multi: true,
    question:
      "I hvilke scenarier er det FAGLIG riktig å bruke en NATURLIG nøkkel som PK (uten surrogat)?",
    options: [
      {
        text: "Land(landkode CHAR(2)) — landkoder er ISO-standard og endres aldri",
        correct: true,
        rationale:
          "ISO 3166-1 landkoder er stabile, korte (2 tegn) og standardiserte. Lite poeng å lage en surrogat-INT.",
      },
      {
        text: "Valuta(valutakode CHAR(3)) — NOK, USD, EUR",
        correct: true,
        rationale: "Samme argument: ISO 4217 er stabilt og menneskelig lesbart.",
      },
      {
        text: "Kunde(epost VARCHAR)",
        correct: false,
        rationale:
          "Epost kan endres — hvis PK endres, må alle FK-er oppdateres. Bruk surrogat.",
      },
      {
        text: "Postnummer(postnr CHAR(4)) — for Poststed-oppslag",
        correct: true,
        rationale:
          "Norske postnumre er stabile, korte og en naturlig nøkkel. Vanlig praksis å bruke som PK.",
      },
      {
        text: "Bruker(brukernavn) — brukervalgt streng",
        correct: false,
        rationale:
          "Brukere vil endre brukernavn. Bruk surrogat-id internt.",
      },
    ],
    explanation:
      "Tommelfingerregel: naturlig PK fungerer når verdiene er KORTE, STABILE og STANDARDISERTE (helst eksterne standarder). I tvil — bruk surrogat.",
  },
  {
    id: "d-order-pk-decision",
    kind: "order",
    title: "Beslutningstre for PK-valg",
    prompt:
      "Sett spørsmålene i riktig rekkefølge når du designer en ny tabells PK.",
    topic: "Nøkler",
    items: [
      "Finn alle kandidatnøkler — minimale kombinasjoner som er unike",
      "Er det en M:N-koblingstabell? → bruk sammensatt PK av FK-ene",
      "Er det en svak entitet? → bruk (eier-FK, partiell nøkkel)",
      "Finnes det en KORT, STABIL, STANDARDISERT naturlig nøkkel (landkode, ISBN)? → bruk den",
      "Ellers: surrogat-PK (id INT AUTO_INCREMENT eller UUID)",
      "Sett UNIQUE på alle naturlige kandidatnøkler som ble igjen",
      "Vurder FK-er som peker hit — er PK-typen FK-vennlig (INT > VARCHAR)?",
    ],
    explanation:
      "Beslutningstreet hindrer at du «bare velger første kolonne» som PK. Surrogat-id er default; kompositt og naturlig er bevisste unntak med konkret grunn.",
  },
  {
    id: "d-match-fk-relasjon-pk",
    kind: "match",
    title: "Hvordan PK ser ut i 1:1, 1:N, M:N",
    prompt:
      "Match relasjonstype med hvordan PK og FK plasseres for å gjøre relasjonen mulig.",
    topic: "Nøkler",
    pairs: [
      {
        left: "1:1 — én PERSON har ett PASS",
        right: "FK i Pass(personId) med UNIQUE NOT NULL — eller slå sammen til én tabell",
      },
      {
        left: "1:N — én KUNDE har 0..N ORDREr",
        right: "FK i Ordre(kundeNr) — vanlig kolonne, NOT NULL hvis total deltakelse",
      },
      {
        left: "M:N — STUDENT tar mange FAG, FAG har mange STUDENTer",
        right: "Koblingstabell Tar(sid, fkode) med sammensatt PK = (sid, fkode) og to FK-er",
      },
      {
        left: "Rekursiv 1:N — ANSATT har leder som også er ANSATT",
        right: "FK i samme tabell: Ansatt.lederNr → Ansatt.ansattNr — nullable for toppsjef",
      },
      {
        left: "Svak entitet — ORDRELINJE finnes bare gjennom ORDRE",
        right: "Sammensatt PK = (ordreNr, linjeNr) der ordreNr er FK NOT NULL med ON DELETE CASCADE",
      },
    ],
    explanation:
      "Disse fem mønstrene dekker ~95% av relasjoner i grunnkurs-databaser. Memoriser dem — på eksamen får du raskt rett DDL fra et ER-diagram hvis du gjenkjenner mønsteret.",
  },
  {
    id: "d-fill-pk-junction-with-attr",
    kind: "fill",
    title: "M:N med relasjonsattributt — hvilken PK?",
    prompt:
      "STUDENT tar FAG. Vi vil tillate at samme student tar samme fag i ulike semestre. Hva blir PK i koblingstabellen?",
    topic: "Nøkler",
    language: "sql",
    template:
      "CREATE TABLE Tar (\n  sid       INT NOT NULL,\n  fkode     VARCHAR(8) NOT NULL,\n  semester  VARCHAR(8) NOT NULL,\n  karakter  CHAR(1),\n  PRIMARY KEY (__1__, __2__, __3__),\n  FOREIGN KEY (sid)   __4__ Student(sid),\n  FOREIGN KEY (fkode) __4__ Fag(fkode)\n);",
    blanks: ["sid", "fkode", "semester", "REFERENCES"],
    options: ["sid", "fkode", "semester", "karakter", "REFERENCES", "ON", "PRIMARY", "FOREIGN"],
    explanation:
      "Utvid PK med diskriminatoren (semester) så samme (sid, fkode) kan forekomme flere ganger med ulike semestre. Hadde forretningsregel vært «én registrering total», hadde PK vært bare (sid, fkode).",
  },

  // ============= BIG-O — kompleksitetsanalyse =============

  {
    id: "d-match-bigo-class-to-eks",
    kind: "match",
    title: "Big-O — klasse til eksempel",
    prompt: "Koble hver Big-O-klasse til et typisk eksempel fra pensum.",
    topic: "Big-O",
    pairs: [
      { left: "O(1)", right: "Dict-get / array-oppslag / stack push" },
      { left: "O(log n)", right: "Binærsøk i sortert liste" },
      { left: "O(n)", right: "Skann en liste og finn max" },
      { left: "O(n log n)", right: "Mergesort, heapsort" },
      { left: "O(n²)", right: "Bubble sort, nested løkke over samme liste" },
      { left: "O(2ⁿ)", right: "Naiv rekursiv Fibonacci" },
      { left: "O(n!)", right: "Generer alle permutasjoner" },
    ],
    explanation:
      "Memoriser disse syv. Når du møter ukjent kode: identifiser mønsteret (én løkke? nestet? halverer?) og match mot lista.",
  },
  {
    id: "d-order-bigo-vekst",
    kind: "order",
    title: "Sortér vekstrater fra langsomst-voksende til raskest-voksende",
    prompt: "Sortér klassene fra MINST arbeid (best for store n) til MEST arbeid.",
    topic: "Big-O",
    items: [
      "O(1) — konstant",
      "O(log n) — logaritmisk",
      "O(n) — lineær",
      "O(n log n) — lineærlogaritmisk",
      "O(n²) — kvadratisk",
      "O(2ⁿ) — eksponentiell",
      "O(n!) — faktoriell",
    ],
    explanation:
      "Husk: log < lineær < lineærlog < kvadratisk < eksponentiell < faktoriell. For n = 1000: log n ≈ 10, n = 1000, n log n ≈ 10000, n² = 1 million, 2ⁿ er astronomisk.",
  },
  {
    id: "d-quiz-bigo-single-loop",
    kind: "quiz",
    title: "Big-O — enkel løkke",
    prompt: "Velg riktig kompleksitet.",
    topic: "Big-O",
    question: "Hva er Big-O for denne funksjonen?",
    code: "def sum_list(lst):\n    total = 0\n    for x in lst:\n        total += x\n    return total",
    language: "python",
    options: [
      { text: "O(n)", correct: true, rationale: "Én løkke gjennom listen — direkte proporsjonal med n." },
      { text: "O(1)", correct: false, rationale: "Tiden vokser med n — ikke konstant." },
      { text: "O(n²)", correct: false, rationale: "Bare ÉN løkke, ingen nesting." },
      { text: "O(log n)", correct: false, rationale: "Vi halverer ikke noe — vi går gjennom alt." },
    ],
    explanation: "Tommelfingerregel: enkel for-løkke over n elementer = O(n).",
  },
  {
    id: "d-quiz-bigo-nested-loop",
    kind: "quiz",
    title: "Big-O — nestet løkke",
    prompt: "Velg riktig kompleksitet.",
    topic: "Big-O",
    question: "Hva er Big-O for denne funksjonen?",
    code: "def has_duplicate(lst):\n    for i in range(len(lst)):\n        for j in range(i + 1, len(lst)):\n            if lst[i] == lst[j]:\n                return True\n    return False",
    language: "python",
    options: [
      { text: "O(n²)", correct: true, rationale: "Indre løkke kjører n + (n-1) + ... + 1 ≈ n²/2 ganger. Dropper konstanten → O(n²)." },
      { text: "O(n)", correct: false, rationale: "To nestede løkker — ikke lineær." },
      { text: "O(n log n)", correct: false, rationale: "Ingen halvering her." },
      { text: "O(1)", correct: false, rationale: "Tiden vokser med n²." },
    ],
    explanation:
      "Alternativ med O(n) snitt: `return len(lst) != len(set(lst))`. Set-lookup er O(1) i snitt — sjekk hele lista én gang.",
  },
  {
    id: "d-quiz-bigo-binary-search",
    kind: "quiz",
    title: "Big-O — halvering",
    prompt: "Velg riktig kompleksitet.",
    topic: "Big-O",
    question: "Hva er Big-O for denne funksjonen?",
    code: "def find(sorted_lst, mål):\n    lo, hi = 0, len(sorted_lst) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if sorted_lst[mid] == mål: return mid\n        elif sorted_lst[mid] < mål: lo = mid + 1\n        else: hi = mid - 1\n    return -1",
    language: "python",
    options: [
      { text: "O(log n)", correct: true, rationale: "Hver iterasjon halverer søkeområdet. n → n/2 → n/4 → ... → 1 tar log n steg." },
      { text: "O(n)", correct: false, rationale: "Vi går IKKE gjennom alle elementene." },
      { text: "O(n log n)", correct: false, rationale: "Bare én løkke som halverer — ikke n iterasjoner." },
      { text: "O(1)", correct: false, rationale: "Tiden vokser (sakte) med n." },
    ],
    explanation: "Binærsøk — krever sortert input. Halvering → log₂(n) = O(log n).",
  },
  {
    id: "d-quiz-bigo-fib-naiv",
    kind: "quiz",
    title: "Big-O — naiv rekursiv Fibonacci",
    prompt: "Velg riktig kompleksitet.",
    topic: "Big-O",
    question: "Hva er Big-O for denne funksjonen?",
    code: "def fib(n):\n    if n < 2: return n\n    return fib(n-1) + fib(n-2)",
    language: "python",
    options: [
      { text: "O(2ⁿ)", correct: true, rationale: "Hvert kall splittes i to nye. Tre-strukturen vokser eksponentielt." },
      { text: "O(n)", correct: false, rationale: "Ville krevd memoization — denne regner samme delproblem mange ganger." },
      { text: "O(n²)", correct: false, rationale: "Eksponentiell vekst er mye verre enn kvadratisk." },
      { text: "O(log n)", correct: false, rationale: "Ingen halvering — heller dobling." },
    ],
    explanation:
      "Fiks: `@lru_cache` på funksjonen gjør den O(n). Eller bygg iterativt med to variabler i en løkke.",
  },
  {
    id: "d-quiz-bigo-two-sequences",
    kind: "quiz",
    title: "Big-O — to løkker etter hverandre",
    prompt: "Velg riktig kompleksitet.",
    topic: "Big-O",
    question: "Hva er Big-O for denne funksjonen?",
    code: "def analyser(lst):\n    s = 0\n    for x in lst:\n        s += x\n    biggest = lst[0]\n    for x in lst:\n        if x > biggest:\n            biggest = x\n    return s, biggest",
    language: "python",
    options: [
      { text: "O(n)", correct: true, rationale: "Sekvens = addisjon: O(n) + O(n) = O(2n) = O(n). Konstanter slipes bort." },
      { text: "O(n²)", correct: false, rationale: "Løkkene er IKKE nestet — de står etter hverandre." },
      { text: "O(2n)", correct: false, rationale: "Riktig telling, men Big-O dropper konstanten — skrives O(n)." },
      { text: "O(log n)", correct: false, rationale: "Vi går gjennom hele lista to ganger — ikke logaritmisk." },
    ],
    explanation:
      "Klassisk feil: «to løkker = O(n²)». Nei — nesting gir multiplikasjon, sekvens gir addisjon.",
  },
  {
    id: "d-fill-bigo-analyse",
    kind: "fill",
    title: "Fyll inn Big-O-klassene",
    prompt: "Sett inn riktig Big-O for hver linje.",
    topic: "Big-O",
    template:
      "lst[5]                        # __1__\nbinary_search(sortert, x)     # __2__\nfor x in lst: ...             # __3__\nsorted(lst)                   # __4__\nfor i in lst:\n    for j in lst:\n        ...                   # __5__",
    blanks: ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)"],
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)", "O(n!)"],
    language: "python",
    explanation:
      "Python sin sorted() bruker Timsort som er O(n log n). Tabell og dict-lookup er O(1) i snitt.",
  },
  {
    id: "d-match-bigo-builtin",
    kind: "match",
    title: "Big-O for innebygde Python-operasjoner",
    prompt: "Lett å overse — disse koster mer enn du tror. Match.",
    topic: "Big-O",
    pairs: [
      { left: "lst[i] (oppslag på indeks)", right: "O(1)" },
      { left: "lst.append(x)", right: "O(1) amortisert" },
      { left: "lst.pop(0) (pop fra start)", right: "O(n) — flytter alle elementene" },
      { left: "x in lst (medlemstest i liste)", right: "O(n)" },
      { left: "x in set / x in dict", right: "O(1) snitt" },
      { left: "lst.sort()", right: "O(n log n)" },
      { left: "deque.popleft()", right: "O(1)" },
      { left: "lst1 + lst2 (konkatenering)", right: "O(n + m) — lager ny liste" },
    ],
    explanation:
      "Klassisk performance-feil: bruke `lst.pop(0)` i kø-mønster. Bytt til `deque.popleft()` for O(1).",
  },
  {
    id: "d-quiz-bigo-string-concat",
    kind: "quiz",
    title: "Big-O — string-konkatenering i løkke",
    prompt: "Velg riktig kompleksitet.",
    topic: "Big-O",
    question: "Hva er Big-O for denne funksjonen?",
    code: "def joiner(lst):\n    s = \"\"\n    for ord in lst:\n        s = s + ord\n    return s",
    language: "python",
    options: [
      { text: "O(n²)", correct: true, rationale: "Hver `s + ord` lager EN HELT NY STRING. Etter n iterasjoner: 1+2+3+...+n ≈ n²/2 tegn kopieres." },
      { text: "O(n)", correct: false, rationale: "Det ville krevd at konkatenering var O(1) — det er det IKKE for immutable strings." },
      { text: "O(log n)", correct: false, rationale: "Ingen halvering." },
      { text: "O(1)", correct: false, rationale: "Tiden vokser med n²." },
    ],
    explanation:
      "Fiks: `''.join(lst)` er O(n) — den allokerer én ny string og fyller alt på én gang. Klassisk Python-performance-tip.",
  },
  {
    id: "d-quiz-bigo-set-vs-list",
    kind: "quiz",
    title: "Big-O — set vs list for medlemskap",
    prompt: "Velg riktig kompleksitet for hele funksjonen.",
    topic: "Big-O",
    question: "Hva er Big-O for denne funksjonen?",
    code: "def find_dups(lst):\n    seen = set()\n    dups = []\n    for x in lst:\n        if x in seen:\n            dups.append(x)\n        else:\n            seen.add(x)\n    return dups",
    language: "python",
    options: [
      { text: "O(n) — én løkke, set-lookup er O(1) i snitt", correct: true, rationale: "`x in seen` er O(1) snitt fordi seen er et set (hash-tabell), ikke en liste." },
      { text: "O(n²)", correct: false, rationale: "Ville vært riktig HVIS seen var en liste — da ville `x in seen` vært O(n)." },
      { text: "O(n log n)", correct: false, rationale: "Ingen sortering eller halvering." },
      { text: "O(1)", correct: false, rationale: "Vi går gjennom hele lst." },
    ],
    explanation:
      "Mest impact-fulle optimalisering i Python: hvis du gjør gjentatte medlemskaps-sjekker, bruk set i stedet for list. n² → n.",
  },
  {
    id: "d-order-bigo-growth-table",
    kind: "order",
    title: "Sortér konkrete kjøretider for n = 1000",
    prompt: "Sortér fra raskest til tregst når n = 1000.",
    topic: "Big-O",
    items: [
      "log₂(1000) ≈ 10",
      "1000",
      "1000 × log₂(1000) ≈ 10 000",
      "1000² = 1 000 000",
      "2¹⁰⁰⁰ — astronomisk",
      "1000! — uberegnelig",
    ],
    explanation:
      "Ved n = 1000: log n er 10. n² er en million. 2ⁿ og n! er ikke håndterbart.",
  },
  {
    id: "d-quiz-bigo-list-vs-deque",
    kind: "quiz",
    title: "Hvorfor er deque raskere enn list som kø?",
    prompt: "Velg det best dekkende svaret.",
    topic: "Big-O",
    question: "Du implementerer BFS og bruker en kø. Hvorfor er `collections.deque` rett valg, og ikke vanlig `list`?",
    options: [
      {
        text: "deque.popleft() er O(1); list.pop(0) er O(n) fordi alle elementer må flyttes ett hakk",
        correct: true,
        rationale:
          "BFS køer ofte mange elementer. Med list ville hver dequeue koste O(n) → totalt O(n²) for BFS. Med deque: O(n).",
      },
      {
        text: "deque er typestrengt og hindrer feil",
        correct: false,
        rationale: "Ikke relevant — Python er dynamisk typet uansett.",
      },
      {
        text: "deque bruker mindre minne",
        correct: false,
        rationale: "Faktisk litt mer minne per element. Det er HASTIGHETEN på popleft som er forskjellen.",
      },
      {
        text: "list støtter ikke å fjerne første element",
        correct: false,
        rationale: "list.pop(0) fungerer — det er bare tregt.",
      },
    ],
    explanation:
      "Generelt: når du trenger FIFO-oppførsel, alltid deque. Når du trenger LIFO eller indeksering, list er fin.",
  },
  {
    id: "d-quiz-bigo-quicksort-worst",
    kind: "quiz",
    title: "Quicksort — verste tilfelle",
    prompt: "Velg riktig kompleksitet.",
    topic: "Big-O",
    question: "Quicksort kjøres på en allerede sortert liste, og pivoten velges alltid som FØRSTE element. Hva blir kompleksiteten?",
    options: [
      {
        text: "O(n²) — partisjon er ubalansert hver runde",
        correct: true,
        rationale: "Med første-element som pivot på sortert input: alle andre er større, så hver rekursjon reduserer størrelsen med bare 1.",
      },
      {
        text: "O(n log n) — det er jo quicksort sin garanti",
        correct: false,
        rationale: "n log n er forventet/snitt. Med dårlig pivot-strategi kan verste bli n².",
      },
      {
        text: "O(n) — sortert input gjør sortering trivielt",
        correct: false,
        rationale: "Quicksort vet ikke at input er sortert — den partisjonerer uansett.",
      },
      {
        text: "O(log n)", correct: false, rationale: "Aldri så raskt.",
      },
    ],
    explanation:
      "Fiks: median-of-three eller randomisert pivot. Med disse er O(n²) ekstremt usannsynlig på praktisk input.",
  },
  {
    id: "d-match-bigo-strategier",
    kind: "match",
    title: "«Hvordan blir du raskere?» — bytt ut for hva",
    prompt: "For hvert tregt mønster, hva er den klassiske fiksen?",
    topic: "Big-O",
    pairs: [
      { left: "x in lst (gjentatt)", right: "Konverter til set først — O(1) snitt per sjekk" },
      { left: "lst.pop(0) i løkke", right: "Bruk deque.popleft() — O(1)" },
      { left: "s = s + ord i løkke", right: "Bygg liste først, så ''.join() — O(n)" },
      { left: "Naiv rekursiv fib", right: "@lru_cache eller iterativ — O(n)" },
      { left: "Sortér så finn min", right: "Bare min(lst) — O(n) i stedet for O(n log n)" },
      { left: "Dobbel-løkke for å finne duplikater", right: "len(lst) != len(set(lst)) — O(n)" },
    ],
    explanation:
      "Disse seks fiksene løser kanskje 80% av Python-performance-problemer studenter møter.",
  },
  {
    id: "d-quiz-bigo-space",
    kind: "quiz",
    title: "Plass-kompleksitet",
    prompt: "Velg riktig svar.",
    topic: "Big-O",
    question: "En rekursiv funksjon traverserer et balansert binærtre med n noder. Hvor mye PLASS bruker den på kallstacken?",
    options: [
      {
        text: "O(log n) — dybden på balansert tre er log n",
        correct: true,
        rationale: "Hver rekursjon legger til én frame; vi gir tilbake før vi går til ny gren. Maks dybde = treet høyde = log n for balansert tre.",
      },
      {
        text: "O(n) — vi besøker n noder",
        correct: false,
        rationale: "Tid er O(n), men PLASS er bare den maksimale dybden i kallstacken samtidig.",
      },
      {
        text: "O(1) — vi lager ikke nye datastrukturer",
        correct: false,
        rationale: "Kallstacken teller — hvert rekursivt kall bruker plass.",
      },
      {
        text: "O(n²)",
        correct: false,
        rationale: "Aldri så mye plass.",
      },
    ],
    explanation:
      "For UBALANSERT tre (lineær kjede) blir dybden n, og plass-kompleksiteten O(n). Balansering er det som holder den lav.",
  },

  // ============= REKURSJON =============

  {
    id: "d-match-rekursjon-deler",
    kind: "match",
    title: "Rekursjon — de to delene",
    prompt: "Match hver del av en rekursiv funksjon til hva den gjør.",
    topic: "Rekursjon",
    pairs: [
      { left: "Base case", right: "Det enkleste tilfellet — svaret kjent uten rekursjon" },
      { left: "Rekursivt steg", right: "Reduser problemet og kall funksjonen på det mindre" },
      { left: "Stack frame", right: "Lokal kontekst lagret når funksjonen kaller seg selv" },
      { left: "RecursionError", right: "Når dybden overskrider grensen — manglende base case" },
    ],
  },
  {
    id: "d-fill-rekursjon-fakultet",
    kind: "fill",
    title: "Fyll inn fakultet-funksjonen",
    prompt: "Den mest klassiske rekursjonsoppgaven. Fyll inn de manglende delene.",
    topic: "Rekursjon",
    template:
      "def fakultet(n):\n    if n __1__ 1:        # base case\n        return __2__\n    return n * fakultet(__3__)   # rekursivt steg",
    blanks: ["<=", "1", "n - 1"],
    options: ["<=", "<", "==", ">=", "0", "1", "n", "n - 1", "n + 1"],
    language: "python",
    explanation:
      "Base case dekker BÅDE n=0 og n=1 (begge skal returnere 1). Rekursivt steg må MINSKE n.",
  },
  {
    id: "d-order-rekursjon-kallstack",
    kind: "order",
    title: "Kallstack — sortér rekkefølge av kall",
    prompt:
      "fakultet(3) kalles. Sortér hendelsene i den rekkefølgen de faktisk skjer i tid.",
    topic: "Rekursjon",
    items: [
      "fakultet(3) kalles → frame pushes",
      "fakultet(3) kaller fakultet(2) → frame pushes",
      "fakultet(2) kaller fakultet(1) → frame pushes",
      "fakultet(1) treffer base case → returnerer 1",
      "fakultet(2) regner 2 * 1 = 2 → returnerer 2",
      "fakultet(3) regner 3 * 2 = 6 → returnerer 6",
    ],
    explanation:
      "Push-rekkefølgen er fra-toppen-ned: fakultet(3) → fakultet(2) → fakultet(1). Returer er nedenfra-opp.",
  },
  {
    id: "d-fill-rekursjon-flatten",
    kind: "fill",
    title: "Fyll inn flatten av nestede lister",
    prompt: "Fyll inn de manglende delene av flatten-funksjonen.",
    topic: "Rekursjon",
    template:
      "def flatten(nested):\n    flat = []\n    for item in nested:\n        if __1__(item, __2__):\n            flat.__3__(flatten(item))   # rekursivt steg\n        else:\n            flat.__4__(item)            # base-handling\n    return flat",
    blanks: ["isinstance", "list", "extend", "append"],
    options: ["isinstance", "type", "list", "tuple", "extend", "append", "add", "insert"],
    language: "python",
    explanation:
      ".extend() pakker UT en iterable og legger til hvert element. .append() ville lagt til hele lista som ett element — feil her.",
  },
  {
    id: "d-quiz-rekursjon-fib-output",
    kind: "quiz",
    title: "Fibonacci — output prediction",
    prompt: "Velg riktig svar.",
    topic: "Rekursjon",
    question: "Hva returnerer fib(6)?",
    code: "def fib(n):\n    if n < 2: return n\n    return fib(n - 1) + fib(n - 2)",
    language: "python",
    options: [
      { text: "8", correct: true, rationale: "Sekvensen er 0, 1, 1, 2, 3, 5, 8, 13. fib(6) = 8." },
      { text: "5", correct: false, rationale: "Det er fib(5)." },
      { text: "13", correct: false, rationale: "Det er fib(7)." },
      { text: "6", correct: false, rationale: "Fibonacci-tallene følger ikke n direkte." },
    ],
    explanation: "Fibonacci-sekvens: f(0)=0, f(1)=1, så hver er sum av de to forrige.",
  },
  {
    id: "d-quiz-rekursjon-base-glemt",
    kind: "quiz",
    title: "Hva skjer hvis du glemmer base case?",
    prompt: "Velg det riktige svaret.",
    topic: "Rekursjon",
    question: "Du skriver `def f(n): return n * f(n - 1)` uten base case. Hva skjer når du kaller f(10)?",
    options: [
      {
        text: "RecursionError — maximum recursion depth exceeded",
        correct: true,
        rationale: "Funksjonen kaller seg selv uendelig. Python kaster RecursionError ved ~1000 dybder.",
      },
      {
        text: "Funksjonen returnerer 0",
        correct: false,
        rationale: "Den når aldri å returnere — den fortsetter å rekurrere.",
      },
      {
        text: "Funksjonen returnerer fakultet av 10",
        correct: false,
        rationale: "Uten base case stopper rekursjonen aldri. Du får ingen verdi.",
      },
      {
        text: "Funksjonen returnerer None",
        correct: false,
        rationale: "Ingen return blir nådd — feilen kommer først.",
      },
    ],
    explanation:
      "Skriv ALLTID base case FØRST når du designer rekursive funksjoner. Spør: «hva er det enkleste tilfellet jeg vet svaret på?»",
  },
  {
    id: "d-quiz-rekursjon-naiv-fib-cost",
    kind: "quiz",
    title: "Hvorfor er naiv fib treg?",
    prompt: "Velg det mest dekkende svaret.",
    topic: "Rekursjon",
    question: "Den naive `fib(n)` har O(2ⁿ) tid. Hva er den primære grunnen?",
    options: [
      {
        text: "Samme delproblem regnes ut mange ganger",
        correct: true,
        rationale: "fib(5) regner fib(3) to ganger, fib(2) tre ganger, fib(1) fem ganger... eksponentiell duplisering.",
      },
      {
        text: "Rekursjon i Python er treg",
        correct: false,
        rationale: "Det er overhead, men ikke hovedgrunnen. Iterativ fib er O(n) — selve rekursjonen er ikke problemet.",
      },
      {
        text: "Python lager nye tall hver gang",
        correct: false,
        rationale: "Sant for arithmetic, men ikke kjernen i kompleksitetsproblemet.",
      },
      {
        text: "Stacken vokser eksponentielt",
        correct: false,
        rationale: "Stacken er bare O(n) dyp samtidig. Det er ANTALL kall over tid som er eksponentielt.",
      },
    ],
    explanation:
      "Fiks: @lru_cache lagrer resultatene. Da regnes hvert delproblem ÉN gang → O(n).",
  },
  {
    id: "d-fill-rekursjon-memo",
    kind: "fill",
    title: "Memoization-fiks for fib",
    prompt: "Bruk @lru_cache for å gjøre fib O(n).",
    topic: "Rekursjon",
    template:
      "from functools import __1__\n\n@__1__(maxsize=None)\ndef fib(n):\n    if n < 2:\n        return __2__\n    return fib(n - 1) + fib(n - 2)",
    blanks: ["lru_cache", "n"],
    options: ["lru_cache", "cache", "memoize", "decorator", "n", "1", "0"],
    language: "python",
    explanation:
      "@lru_cache cacher input/output. Andre kall med samme n returnerer fra cachen. Python 3.9+: kan også bruke @cache (alias).",
  },
  {
    id: "d-quiz-rekursjon-default-arg",
    kind: "quiz",
    title: "Default-argument-fellen",
    prompt: "Velg det riktige problemet.",
    topic: "Rekursjon",
    question: "Hva er galt med denne rekursive funksjonen?",
    code: "def append_path(node, path=[]):\n    path.append(node)\n    if node.barn:\n        for c in node.barn:\n            append_path(c, path)\n    return path",
    language: "python",
    options: [
      {
        text: "Default-lista deles mellom kall — ulike trær vil mutere SAMME lista",
        correct: true,
        rationale: "Python evaluerer default-argumenter ÉN gang ved funksjonsdefinisjon. `[]` er da én delt liste.",
      },
      {
        text: "Mangler base case",
        correct: false,
        rationale: "Den HAR base case (når node.barn er tomt går for-løkka aldri).",
      },
      {
        text: "Bruker for mye minne",
        correct: false,
        rationale: "Ikke hovedproblemet.",
      },
      {
        text: "Returnerer feil type",
        correct: false,
        rationale: "Den returnerer en liste, som forventet.",
      },
    ],
    explanation:
      "Fiks: `def append_path(node, path=None): if path is None: path = []`. Lag NY liste hver kall — ikke gjenbruk default.",
  },
  {
    id: "d-fill-rekursjon-ruler",
    kind: "fill",
    title: "Ruler — del-og-hersk",
    prompt: "Tegn linjal-stikker. Fyll inn rekursjons-strukturen.",
    topic: "Rekursjon",
    template:
      "def ruler(left, right, height, rul):\n    if height <= __1__:        # base case\n        return\n    mid = (left + right) // __2__\n    ruler(left, mid, height - 1, rul)    # venstre halvdel\n    rul[mid] = height                     # jobb i midten\n    ruler(mid, right, height - __3__, rul) # høyre halvdel",
    blanks: ["0", "2", "1"],
    options: ["0", "1", "2", "-1", "height"],
    language: "python",
    explanation:
      "Klassisk del-og-hersk: rekursér venstre, jobb i midten, rekursér høyre. Samme mønster som in-order traversering av binærtre.",
  },
  {
    id: "d-match-rekursjon-vs-iter",
    kind: "match",
    title: "Når velger du rekursjon vs iterasjon?",
    prompt: "Match hvert scenario til riktig valg.",
    topic: "Rekursjon",
    pairs: [
      { left: "Traversering av binærtre", right: "Rekursjon — naturlig selv-lik struktur" },
      { left: "Summere tall fra 1 til n", right: "Iterasjon — enkel for-løkke holder" },
      { left: "Flatten av nestede lister", right: "Rekursjon — vet ikke dybden på forhånd" },
      { left: "Beregne fakultet (n > 1000)", right: "Iterasjon — rekursjon overflower stacken" },
      { left: "Mergesort", right: "Rekursjon — del-og-hersk naturlig" },
      { left: "Telle elementer i en liste", right: "Iterasjon eller len() — ingen grunn til rekursjon" },
    ],
  },
  {
    id: "d-quiz-rekursjon-output-flatten",
    kind: "quiz",
    title: "Flatten — output prediction",
    prompt: "Velg riktig output.",
    topic: "Rekursjon",
    question: "Hva returnerer flatten([1, [2, [3, 4]], 5])?",
    code: "def flatten(nested):\n    flat = []\n    for item in nested:\n        if isinstance(item, list):\n            flat.extend(flatten(item))\n        else:\n            flat.append(item)\n    return flat",
    language: "python",
    options: [
      { text: "[1, 2, 3, 4, 5]", correct: true, rationale: "Rekursjonen flater ut alle nivåer." },
      { text: "[1, 2, [3, 4], 5]", correct: false, rationale: "Det er bare ett nivå flating — funksjonen rekurrerer dypere." },
      { text: "[[1, 2, 3, 4, 5]]", correct: false, rationale: "Resultatet skal IKKE være pakket inn." },
      { text: "[1, [2, [3, 4]], 5]", correct: false, rationale: "Det er input — funksjonen endrer noe." },
    ],
  },

  // ============= SORTERING =============

  {
    id: "d-match-sort-egenskaper",
    kind: "match",
    title: "Match sorteringsalgoritme til egenskap",
    prompt: "Hver algoritme har en distinkt egenskap som skiller den ut.",
    topic: "Sortering",
    pairs: [
      { left: "Bubble sort", right: "Største element «bobler» til høyre hver runde" },
      { left: "Selection sort", right: "Finn minste, bytt til front, gjenta" },
      { left: "Insertion sort", right: "Sett element på riktig plass i sortert prefix" },
      { left: "Mergesort", right: "Del, sortér rekursivt, flett — alltid O(n log n)" },
      { left: "Quicksort", right: "Pivot-partisjon — rask i snitt, kan bli O(n²)" },
      { left: "Heapsort", right: "heapify så pop minste n ganger — alltid O(n log n)" },
    ],
  },
  {
    id: "d-match-sort-kompleksitet",
    kind: "match",
    title: "Match sorteringsalgoritme til snitt-kompleksitet",
    prompt: "Lær disse — de er nesten alltid på eksamen.",
    topic: "Sortering",
    pairs: [
      { left: "Bubble sort", right: "O(n²)" },
      { left: "Selection sort", right: "O(n²)" },
      { left: "Insertion sort", right: "O(n²)" },
      { left: "Mergesort", right: "O(n log n)" },
      { left: "Quicksort (snitt)", right: "O(n log n)" },
      { left: "Heapsort", right: "O(n log n)" },
      { left: "Python sin sorted() / Timsort", right: "O(n log n)" },
    ],
    explanation:
      "n² er treig på store data. O(n log n) er taket for sammenligningsbasert sortering. For radix/counting sort kan du komme under, men de krever spesielle inputs.",
  },
  {
    id: "d-order-mergesort-steps",
    kind: "order",
    title: "Mergesort — sortér stegene",
    prompt: "Sortér stegene i mergesort fra det første som skjer til det siste.",
    topic: "Sortering",
    items: [
      "Sjekk base case: hvis len(lst) <= 1, returner som er",
      "Beregn midten: mid = len(lst) // 2",
      "Rekursivt sortér venstre halvdel",
      "Rekursivt sortér høyre halvdel",
      "Flett de to sorterte halvdelene til én sortert liste",
      "Returner det flettede resultatet",
    ],
    explanation:
      "Mergesort er pure del-og-hersk: hvert kall splitter og rekurrerer, så fletter. Garantert O(n log n).",
  },
  {
    id: "d-fill-mergesort-merge",
    kind: "fill",
    title: "Fyll inn merge-funksjonen",
    prompt: "Merge tar to sorterte lister og fletter dem til én sortert liste.",
    topic: "Sortering",
    template:
      "def merge(a, b):\n    result = []\n    i = j = 0\n    while i < __1__ and j < __2__:\n        if a[i] __3__ b[j]:\n            result.append(a[i]); i += 1\n        else:\n            result.append(b[j]); j += 1\n    result.__4__(a[i:])\n    result.__4__(b[j:])\n    return result",
    blanks: ["len(a)", "len(b)", "<=", "extend"],
    options: ["len(a)", "len(b)", "len(result)", "<", "<=", ">=", "extend", "append", "add"],
    language: "python",
    explanation:
      "Det viktige er <= (ikke <): bevarer stabilitet — like elementer fra a kommer før like fra b.",
  },
  {
    id: "d-fill-bubble-sort",
    kind: "fill",
    title: "Fyll inn bubble sort",
    prompt: "Implementer bubble sort med tidlig exit.",
    topic: "Sortering",
    template:
      "def bubble_sort(lst):\n    n = len(lst)\n    for i in range(n - 1):\n        byttet = False\n        for j in range(n - 1 - __1__):\n            if lst[j] __2__ lst[j + 1]:\n                lst[j], lst[j + 1] = lst[j + 1], lst[j]\n                byttet = __3__\n        if not byttet:\n            break        # allerede sortert\n    return lst",
    blanks: ["i", ">", "True"],
    options: ["i", "j", "n", ">", "<", ">=", "True", "False", "None"],
    language: "python",
    explanation:
      "Indre løkka stopper ved n-1-i fordi de siste i elementene allerede er sortert. Tidlig exit gir O(n) beste tilfelle.",
  },
  {
    id: "d-fill-insertion-sort",
    kind: "fill",
    title: "Fyll inn insertion sort",
    prompt: "Implementer insertion sort som setter hvert element på rett plass.",
    topic: "Sortering",
    template:
      "def insertion_sort(lst):\n    for i in range(__1__, len(lst)):\n        key = lst[i]\n        j = i - 1\n        while j >= 0 and lst[j] __2__ key:\n            lst[j + 1] = lst[j]\n            j __3__ 1\n        lst[j + 1] = __4__\n    return lst",
    blanks: ["1", ">", "-=", "key"],
    options: ["0", "1", "i", ">", "<", ">=", "-=", "+=", "key", "lst[i]", "lst[j]"],
    language: "python",
    explanation:
      "Vi starter på i=1 fordi lst[0:1] alltid er «sortert» (én element). while-løkka skifter elementer høyre til vi finner riktig sted.",
  },
  {
    id: "d-fill-quicksort",
    kind: "fill",
    title: "Fyll inn quicksort med list comprehensions",
    prompt: "Implementer enkel quicksort med tre partisjoner.",
    topic: "Sortering",
    template:
      "import random\n\ndef quicksort(lst):\n    if len(lst) __1__ 1:\n        return lst\n    pivot = random.choice(lst)\n    mindre  = [x for x in lst if x < __2__]\n    likt    = [x for x in lst if x == __2__]\n    storre  = [x for x in lst if x > __2__]\n    return quicksort(__3__) + likt + quicksort(__4__)",
    blanks: ["<=", "pivot", "mindre", "storre"],
    options: ["<=", "<", ">=", ">", "pivot", "lst", "mindre", "storre", "likt"],
    language: "python",
    explanation:
      "Det er viktig å rekurrere KUN på mindre og storre — likt er allerede plassert riktig. Inkluderer du pivoten i en av rekursjonene risikerer du uendelig løkke.",
  },
  {
    id: "d-quiz-sort-stable",
    kind: "quiz",
    title: "Stabilitet — hvilken er stabil?",
    prompt: "Velg riktig.",
    topic: "Sortering",
    question:
      "Du sorterer en liste av (navn, alder) først på alder, så på navn. Hvilken sorterings-algoritme MÅ du bruke for at den andre sorteringen ikke skal ødelegge resultatet av den første?",
    options: [
      {
        text: "En STABIL algoritme — mergesort, insertion sort, eller Python sin Timsort",
        correct: true,
        rationale: "Stabilitet betyr at like nøkler beholder relativ rekkefølge. Avgjørende for multi-key-sortering.",
      },
      {
        text: "Quicksort — den er raskest",
        correct: false,
        rationale: "Quicksort er IKKE stabil — like elementer kan bytte plass under partisjonering.",
      },
      {
        text: "Heapsort — den er garantert O(n log n)",
        correct: false,
        rationale: "Heapsort er IKKE stabil — heap-strukturen kan ombytte like elementer.",
      },
      {
        text: "Det spiller ingen rolle",
        correct: false,
        rationale: "Det spiller stor rolle — ustabil sortering ødelegger den forrige.",
      },
    ],
    explanation:
      "Stabil: mergesort, insertion, bubble, Python Timsort. Ustabil: quicksort, heapsort, selection.",
  },
  {
    id: "d-quiz-sort-best-case-bubble",
    kind: "quiz",
    title: "Bubble sort på allerede sortert liste",
    prompt: "Velg riktig.",
    topic: "Sortering",
    question: "Hva er beste-tilfelle for bubble sort MED tidlig exit (byttet-flag)?",
    options: [
      {
        text: "O(n) — én gjennomgang oppdager null bytter, og funksjonen avslutter",
        correct: true,
        rationale: "Hvis flagget aldri settes, breaker vi etter første runde. Total: n-1 sammenligninger.",
      },
      {
        text: "O(n²) — alltid",
        correct: false,
        rationale: "Det er sant uten tidlig exit. MED flagget kan vi avslutte ved sortert input.",
      },
      {
        text: "O(log n)",
        correct: false,
        rationale: "Bubble sort halverer ingenting.",
      },
      {
        text: "O(n log n)",
        correct: false,
        rationale: "Bubble sort er aldri n log n.",
      },
    ],
  },
  {
    id: "d-quiz-sort-pivot",
    kind: "quiz",
    title: "Pivot-valg i quicksort",
    prompt: "Velg den BESTE strategien.",
    topic: "Sortering",
    question: "Du implementerer quicksort. Hvilken pivot-strategi gir best forventet ytelse på alle slags input?",
    options: [
      {
        text: "Median-of-three (median av første, midt, siste) eller randomisert pivot",
        correct: true,
        rationale: "Randomisert eller median-of-three gjør worst-case nesten umulig å trigge i praksis.",
      },
      {
        text: "Alltid første element",
        correct: false,
        rationale: "Trigger O(n²) på sortert eller omvendt sortert input — VANLIG i praksis.",
      },
      {
        text: "Alltid siste element",
        correct: false,
        rationale: "Samme problem som første element.",
      },
      {
        text: "Alltid middelelementet",
        correct: false,
        rationale: "Bedre enn første/siste, men angriper kan fortsatt konstruere input som trigger n².",
      },
    ],
    explanation:
      "Real-world quicksort (eks. C++ sin std::sort, Java sin Arrays.sort) bruker introsort: quicksort med median-of-three, faller tilbake til heapsort ved dårlig pivot-mønster.",
  },
  {
    id: "d-order-quicksort-steps",
    kind: "order",
    title: "Quicksort på [3, 1, 4, 1, 5, 9, 2, 6] — sortér første runde",
    prompt: "Pivot velges som 4. Sortér stegene i hvordan partisjonen settes opp.",
    topic: "Sortering",
    items: [
      "Pivot velges: pivot = 4",
      "Bygg mindre: [3, 1, 1, 2] (alt < 4)",
      "Bygg likt: [4] (alt == 4)",
      "Bygg storre: [5, 9, 6] (alt > 4)",
      "Kall quicksort([3, 1, 1, 2]) rekursivt",
      "Kall quicksort([5, 9, 6]) rekursivt",
      "Konkateneer: quicksort(mindre) + likt + quicksort(storre)",
    ],
  },
  {
    id: "d-quiz-sort-counting-compares",
    kind: "quiz",
    title: "Insertion sort — antall sammenligninger",
    prompt: "Velg riktig svar.",
    topic: "Sortering",
    question: "Insertion sort kjøres på [5, 4, 3, 2, 1] (omvendt sortert). Hvor mange sammenligninger gjør den?",
    options: [
      {
        text: "10 sammenligninger",
        correct: true,
        rationale: "i=1: 1 sammenligning. i=2: 2. i=3: 3. i=4: 4. Total: 1+2+3+4 = 10 = n(n-1)/2 for n=5.",
      },
      {
        text: "4 sammenligninger",
        correct: false,
        rationale: "Det er antall ytre iterasjoner — hver gjør flere sammenligninger.",
      },
      {
        text: "5 sammenligninger",
        correct: false,
        rationale: "Det er n — ikke kvadratisk.",
      },
      {
        text: "25 sammenligninger",
        correct: false,
        rationale: "Det er n² — overdriver. Reell er n(n-1)/2.",
      },
    ],
    explanation: "Insertion sort i verste tilfelle: n(n-1)/2 sammenligninger. For n=5: 10.",
  },
  {
    id: "d-quiz-sort-heap-pop",
    kind: "quiz",
    title: "Heapsort — pop-rekkefølge",
    prompt: "Velg riktig.",
    topic: "Sortering",
    question: "En min-heap inneholder [1, 3, 2, 8, 5, 9, 4]. Hvilken rekkefølge kommer heappop ut i?",
    options: [
      {
        text: "1, 2, 3, 4, 5, 8, 9 — alltid stigende",
        correct: true,
        rationale: "En min-heap pop returnerer ALLTID det minste. Gjenta n ganger → sortert sekvens.",
      },
      {
        text: "1, 3, 2, 8, 5, 9, 4 — i lagringsrekkefølge",
        correct: false,
        rationale: "Heap-strukturen er IKKE sortert — kun root er garantert minst.",
      },
      {
        text: "9, 8, 5, 4, 3, 2, 1 — synkende",
        correct: false,
        rationale: "Min-heap er stigende ved pop. For synkende: max-heap eller negate verdiene.",
      },
      {
        text: "Vilkårlig rekkefølge",
        correct: false,
        rationale: "Pop-rekkefølge er deterministisk — alltid minste først.",
      },
    ],
    explanation:
      "Heap-array kan se ut «usortert», men strukturen garanterer at root (lst[0]) er min. Etter heapify gjør hver pop strukturen om så neste min kommer til root.",
  },

  // ============= LENKEDE STRUKTURER =============

  {
    id: "d-match-struktur-bruk",
    kind: "match",
    title: "Datastruktur til bruksområde",
    prompt: "Match strukturen til scenariet der den er det naturlige valget.",
    topic: "Lenkede strukturer",
    pairs: [
      { left: "Stack (LIFO)", right: "Postfix-evaluator, undo-funksjon, DFS" },
      { left: "Queue (FIFO)", right: "BFS, oppgavekø, print-spool" },
      { left: "Deque", right: "Sliding window, undo+redo, generelt 'best av begge'" },
      { left: "Prioritetskø (heapq)", right: "Dijkstra, Huffman, scheduling" },
      { left: "Linked list", right: "Hyppige insert/slett midt i sekvensen" },
      { left: "Vanlig list", right: "Indeksert oppslag, sjeldne mid-insertions" },
    ],
  },
  {
    id: "d-order-stack-postfix",
    kind: "order",
    title: "Postfix-evaluator — sortér stegene",
    prompt:
      "Uttrykket «4 5 + 3 *» evalueres. Sortér hva som skjer på stacken i rekkefølge.",
    topic: "Lenkede strukturer",
    items: [
      "Les '4' → stack: [4]",
      "Les '5' → stack: [4, 5]",
      "Les '+' → pop 5, pop 4, push 4+5=9 → stack: [9]",
      "Les '3' → stack: [9, 3]",
      "Les '*' → pop 3, pop 9, push 9*3=27 → stack: [27]",
      "Slutt → pop 27 → returner 27",
    ],
    explanation:
      "I postfix-evaluator: tall pushes på stacken, operatorer popper to og pusher resultatet. Rekkefølgen er kritisk — første pop er ANDRE operand.",
  },
  {
    id: "d-fill-stack-postfix",
    kind: "fill",
    title: "Fyll inn postfix-evaluator",
    prompt: "Fyll inn manglende deler av evaluatoren.",
    topic: "Lenkede strukturer",
    template:
      "from collections import deque\n\ndef eval_postfix(expr):\n    stack = __1__()\n    for token in expr.split():\n        if token in ('+', '-', '*', '/'):\n            b = stack.__2__()\n            a = stack.__2__()\n            if token == '+': stack.append(a + b)\n            elif token == '-': stack.append(a - b)\n            elif token == '*': stack.append(a * b)\n            elif token == '/': stack.append(a // b)\n        else:\n            stack.__3__(int(token))\n    return stack.__2__()",
    blanks: ["deque", "pop", "append"],
    options: ["deque", "list", "stack", "Queue", "pop", "popleft", "append", "appendleft", "push"],
    language: "python",
    explanation:
      "Rekkefølgen i operator-handling er KRITISK: første pop er b (andre operand), andre pop er a (første). Test med ikke-kommutative operasjoner (5 3 -) for å verifisere.",
  },
  {
    id: "d-quiz-stack-vs-queue",
    kind: "quiz",
    title: "Stack vs Queue — output",
    prompt: "Velg riktig.",
    topic: "Lenkede strukturer",
    question: "Du legger inn 1, 2, 3 i denne rekkefølgen. Først i en stack, så i en kø. Hva tar du UT?",
    options: [
      {
        text: "Stack: 3, 2, 1. Kø: 1, 2, 3.",
        correct: true,
        rationale: "Stack er LIFO — sist inn, først ut. Kø er FIFO — først inn, først ut.",
      },
      {
        text: "Stack: 1, 2, 3. Kø: 3, 2, 1.",
        correct: false,
        rationale: "Du har snudd det. LIFO = Last In First Out, ikke First In First Out.",
      },
      {
        text: "Begge: 1, 2, 3.",
        correct: false,
        rationale: "Stack reverserer rekkefølgen.",
      },
      {
        text: "Begge: 3, 2, 1.",
        correct: false,
        rationale: "Kø bevarer rekkefølgen, så det blir 1, 2, 3.",
      },
    ],
    explanation:
      "Huskeregel: Stack = stable med tallerkener (du tar fra toppen). Kø = butikk-kø (først inn først ut).",
  },
  {
    id: "d-fill-linked-add-first",
    kind: "fill",
    title: "Fyll inn LinkedList.add_first()",
    prompt: "Legg et nytt element FØRST i en single-linked list.",
    topic: "Lenkede strukturer",
    template:
      "def add_first(self, e):\n    new_node = Node(e)\n    new_node._next = self.__1__      # 'pek' til det som var først\n    self._head = __2__                # head peker til ny\n    self._size __3__ 1\n    if self._tail is None:               # tom liste fra før\n        self._tail = self._head",
    blanks: ["_head", "new_node", "+="],
    options: ["_head", "_tail", "new_node", "Node(e)", "+=", "-=", "="],
    language: "python",
    explanation:
      "Rekkefølgen er kritisk: koble FØRST den nye noden til det som var head, så pek head til den nye. Motsatt rekkefølge ville mistet referansen.",
  },
  {
    id: "d-quiz-linked-remove-last",
    kind: "quiz",
    title: "Hvorfor er remove_last() treg i single-linked list?",
    prompt: "Velg riktig forklaring.",
    topic: "Lenkede strukturer",
    question:
      "I en single-linked list med tail-peker er add_last() O(1), men remove_last() er O(n). Hvorfor?",
    options: [
      {
        text: "Vi må finne NEST-siste node for å sette ny tail — og det krever traversering fra head",
        correct: true,
        rationale:
          "Nodene har bare `_next`, ikke `_prev`. For å oppdatere tail må vi nå nest-siste node, og det krever å gå fra head O(n) skritt.",
      },
      {
        text: "Vi må re-allokere lista",
        correct: false,
        rationale: "Linked lists re-allokerer ikke — det er en array-egenskap.",
      },
      {
        text: "Tail-pekeren er ugyldig",
        correct: false,
        rationale: "Tail er gyldig — vi bare ikke kan «gå bakover» fra den.",
      },
      {
        text: "Garbage collector blir treg",
        correct: false,
        rationale: "Ikke relevant.",
      },
    ],
    explanation: "Løsning: double-linked list med `_prev`-peker. Da blir remove_last() O(1).",
  },
  {
    id: "d-fill-heapq",
    kind: "fill",
    title: "Fyll inn heapq-bruk",
    prompt: "Bygg prioritetskø og pop minste element.",
    topic: "Lenkede strukturer",
    template:
      "import heapq\n\npq = []\nheapq.__1__(pq, (3, 'lav prioritet'))\nheapq.__1__(pq, (1, 'høyest'))\nheapq.__1__(pq, (2, 'midt'))\n\nminste = heapq.__2__(pq)   # returnerer (1, 'høyest')",
    blanks: ["heappush", "heappop"],
    options: ["heappush", "heappop", "heapify", "push", "pop", "append", "popleft"],
    language: "python",
    explanation:
      "heapq er en MIN-heap. Bruk tuple (prioritet, payload) for å ordne på prioritet. Mindre prioritet = popper først.",
  },
  {
    id: "d-quiz-heap-max",
    kind: "quiz",
    title: "Hvordan lage en max-heap med heapq?",
    prompt: "Velg riktig løsning.",
    topic: "Lenkede strukturer",
    question: "Python sin heapq er en min-heap. Hvordan får du en MAX-heap (popper STØRSTE element først)?",
    options: [
      {
        text: "Negér prioriteten: putt inn (-pri, payload), pop og negér tilbake",
        correct: true,
        rationale:
          "Hvis du putter inn negative tall, blir det største (mest positive) negative det minste tallet — popper først. Negér ved bruk.",
      },
      {
        text: "Bruk heapq.heappopmax()",
        correct: false,
        rationale: "Den finnes ikke. heapq har bare min-versjoner offisielt.",
      },
      {
        text: "Reverser listen før heappop",
        correct: false,
        rationale: "Heap-strukturen brytes hvis du reverserer — det er ikke en sortert liste.",
      },
      {
        text: "Bruk reversed() rundt heappop",
        correct: false,
        rationale: "reversed() endrer ikke pop-rekkefølgen.",
      },
    ],
    explanation:
      "Trikset (-pri, payload) er idiomet. Alternativ: heapq._heapify_max (intern, undokumentert) — ikke anbefalt.",
  },
  {
    id: "d-order-bfs-using-queue",
    kind: "order",
    title: "BFS bruker kø — sortér stegene",
    prompt: "BFS fra A på grafen A-B, A-C, B-D, C-D. Sortér rekkefølge for besøk.",
    topic: "Lenkede strukturer",
    items: [
      "Initialiser queue = deque(['A']), visited = {'A'}",
      "Pop 'A', besøk A, enqueue naboer B og C",
      "Pop 'B' (først inn), besøk B, enqueue nabo D",
      "Pop 'C', besøk C (D er allerede i kø)",
      "Pop 'D', besøk D, ingen nye naboer",
      "Kø tom — BFS ferdig. Rekkefølge: A, B, C, D",
    ],
    explanation:
      "FIFO-køen sikrer at vi besøker noder i ordrekkefølge etter avstand fra start. Det er DET som gjør BFS bredde-først.",
  },
  {
    id: "d-quiz-deque-perf",
    kind: "quiz",
    title: "deque vs list — performance",
    prompt: "Velg det best dekkende svaret.",
    topic: "Lenkede strukturer",
    question: "Du har en kø som vil få millioner av enqueue/dequeue-operasjoner. Du bruker list.append() og list.pop(0). Hva er problemet?",
    options: [
      {
        text: "list.pop(0) er O(n) — alle elementene må flyttes ett hakk venstre",
        correct: true,
        rationale:
          "Python list er en array under panseret. Å fjerne første element kopierer alle resten. Med millioner av pop(0) blir total kostnad O(n²).",
      },
      {
        text: "list er ikke trådsikker",
        correct: false,
        rationale: "Heller ikke deque er trådsikker. Performance er hovedproblemet.",
      },
      {
        text: "list bruker mer minne",
        correct: false,
        rationale: "Minne er sammenlignbart. Hastighet er forskjellen.",
      },
      {
        text: "list kan ikke holde store mengder data",
        correct: false,
        rationale: "Det kan den. Bare ikke effektivt med pop(0).",
      },
    ],
    explanation: "Bytt til deque: appendleft og popleft begge O(1). Forskjellen er enorm på store n.",
  },
  {
    id: "d-fill-linked-list-search",
    kind: "fill",
    title: "Fyll inn LinkedList.index_of()",
    prompt: "Finn indeks til første forekomst av element. Returner -1 hvis ikke funnet.",
    topic: "Lenkede strukturer",
    template:
      "def index_of(self, e):\n    current = self.__1__\n    index = 0\n    while current is not None:\n        if current.__2__ == e:\n            return __3__\n        current = current.__4__\n        index += 1\n    return __5__",
    blanks: ["_head", "_element", "index", "_next", "-1"],
    options: ["_head", "_tail", "_element", "_next", "_prev", "_size", "index", "-1", "0", "None"],
    language: "python",
    explanation: "Traverser fra head, sjekk hvert element, tell indeks. -1 er konvensjon for «ikke funnet».",
  },
  {
    id: "d-quiz-stack-balance-parens",
    kind: "quiz",
    title: "Parantes-balanse med stack",
    prompt: "Velg riktig output.",
    topic: "Lenkede strukturer",
    question: "Hva returnerer denne funksjonen for inputtet «((a+b)*[c-d])»?",
    code: "def balanced(s):\n    stack = []\n    par = {')': '(', ']': '[', '}': '{'}\n    for c in s:\n        if c in '([{':\n            stack.append(c)\n        elif c in ')]}':\n            if not stack or stack.pop() != par[c]:\n                return False\n    return len(stack) == 0",
    language: "python",
    options: [
      { text: "True", correct: true, rationale: "Alle paranteser matcher: ((..)..) og [..] er balansert." },
      { text: "False", correct: false, rationale: "Input er gyldig balansert." },
      { text: "None", correct: false, rationale: "Funksjonen returnerer bool, ikke None." },
      { text: "0", correct: false, rationale: "Funksjonen returnerer bool, ikke int." },
    ],
    explanation:
      "Klassisk stack-bruk: push opener, ved closer pop og sjekk om matchet. Returner True hvis stacken er tom på slutten.",
  },

  // ============= OSI / TCP-IP =============

  {
    id: "d-match-osi-protokoller",
    kind: "match",
    title: "Protokoll → riktig lag",
    prompt: "Plasser hver protokoll på riktig TCP/IP-lag.",
    topic: "OSI/TCP-IP",
    pairs: [
      { left: "HTTP, SMTP, DNS, SSH", right: "Lag 5 — Application" },
      { left: "TCP, UDP", right: "Lag 4 — Transport" },
      { left: "IP, ICMP, OSPF", right: "Lag 3 — Network" },
      { left: "Ethernet, WiFi, ARP", right: "Lag 2 — Link" },
      { left: "Kobber, fiber, radio", right: "Lag 1 — Physical" },
    ],
    explanation:
      "Eksamen tester denne nesten alltid. ARP er teknisk lag 2/3 — den oversetter IP til MAC.",
  },
  {
    id: "d-order-encapsulation",
    kind: "order",
    title: "Encapsulation — sortér rekkefølge",
    prompt: "HTTP-request går ned-gjennom hos avsender. Sortér stegene.",
    topic: "OSI/TCP-IP",
    items: [
      "Applikasjon: HTTP-request lages (GET /side HTTP/1.1)",
      "Transport: TCP legger på header med src/dst-port",
      "Network: IP legger på header med src/dst-IP",
      "Link: Ethernet legger på header med src/dst-MAC",
      "Physical: bits sendes som spenning/lys/radio",
    ],
    explanation:
      "Mottakeren reverserer rekkefølgen — først lag 2, så 3, så 4, så app.",
  },
  {
    id: "d-match-port-protokoll",
    kind: "match",
    title: "Port-nummer → protokoll",
    prompt: "Match well-known portene til riktig protokoll.",
    topic: "OSI/TCP-IP",
    pairs: [
      { left: "80", right: "HTTP" },
      { left: "443", right: "HTTPS" },
      { left: "22", right: "SSH" },
      { left: "53", right: "DNS" },
      { left: "25", right: "SMTP" },
      { left: "21", right: "FTP" },
      { left: "3306", right: "MySQL" },
      { left: "5432", right: "PostgreSQL" },
    ],
  },
  {
    id: "d-quiz-osi-vs-tcpip",
    kind: "quiz",
    title: "OSI vs TCP/IP — hovedforskjell",
    prompt: "Velg riktig.",
    topic: "OSI/TCP-IP",
    question: "Hva er hovedforskjellen mellom OSI-modellen og TCP/IP-modellen?",
    options: [
      {
        text: "OSI har 7 lag (teoretisk), TCP/IP har 5 lag (praktisk). Application/Presentation/Session slås sammen.",
        correct: true,
        rationale: "OSI er en mer detaljert teoretisk modell; TCP/IP er det Internett faktisk bruker.",
      },
      {
        text: "OSI er for trådløst, TCP/IP er for kablet",
        correct: false,
        rationale: "Begge modellene dekker alle medier.",
      },
      {
        text: "TCP/IP er nyere og erstattet OSI",
        correct: false,
        rationale: "TCP/IP er faktisk ELDRE (1970-tallet) enn OSI (1984). Men TCP/IP «vant» i praksis.",
      },
      {
        text: "OSI bruker bare TCP, TCP/IP bruker bare IP",
        correct: false,
        rationale: "Tull — begge modeller er protokoll-agnostiske rammeverk.",
      },
    ],
  },
  {
    id: "d-quiz-arp-lag",
    kind: "quiz",
    title: "Hvor bor ARP?",
    prompt: "Velg riktig.",
    topic: "OSI/TCP-IP",
    question: "ARP (Address Resolution Protocol) brukes for å oversette IP-adresser til MAC-adresser. Hvilket lag tilhører den?",
    options: [
      {
        text: "Den ligger på grensen mellom lag 2 og 3 — oversetter mellom dem",
        correct: true,
        rationale: "ARP bro-bygger mellom Network (IP) og Link (MAC). Klassisk eksamen-tørrnøtt.",
      },
      {
        text: "Lag 5 — Applikasjon",
        correct: false,
        rationale: "Ingen applikasjon snakker ARP direkte — det er nettverk-stakken.",
      },
      {
        text: "Lag 4 — Transport",
        correct: false,
        rationale: "Transport snakker porter, ikke MAC.",
      },
      {
        text: "Lag 1 — Fysisk",
        correct: false,
        rationale: "Fysisk er signaler, ikke logikk.",
      },
    ],
  },
  {
    id: "d-fill-ip-subnet",
    kind: "fill",
    title: "Fyll inn IP-subnetting",
    prompt: "IP-en 192.168.1.42 i nettet /24 — fyll inn riktige verdier.",
    topic: "OSI/TCP-IP",
    template:
      "IP-adresse:    192.168.1.42\nSubnet-maske:  255.255.255.__1__\nNetwork:       __2__\nBroadcast:     192.168.1.__3__\nAntall adresser i nettet: __4__",
    blanks: ["0", "192.168.1.0", "255", "256"],
    options: ["0", "1", "255", "256", "128", "192.168.1.0", "192.168.0.0", "10.0.0.0"],
    explanation:
      "/24 = 24 bit prefix = 8 bit til host = 2⁸ = 256 adresser (inkl. network og broadcast).",
  },
  {
    id: "d-match-spesielle-ip",
    kind: "match",
    title: "Spesielle IP-adresser",
    prompt: "Match hver IP til hva den betyr.",
    topic: "OSI/TCP-IP",
    pairs: [
      { left: "127.0.0.1", right: "Loopback — deg selv" },
      { left: "10.0.0.0/8", right: "Privat klasse A (RFC 1918)" },
      { left: "172.16.0.0/12", right: "Privat klasse B" },
      { left: "192.168.0.0/16", right: "Privat klasse C — hjemmenett" },
      { left: "0.0.0.0", right: "«Alle grensesnitt» eller ukjent kilde" },
      { left: "255.255.255.255", right: "Limited broadcast — samme nett" },
    ],
  },

  // ============= TRANSPORTLAG =============

  {
    id: "d-match-tcp-vs-udp",
    kind: "match",
    title: "TCP vs UDP — egenskaper",
    prompt: "Match hver egenskap til riktig protokoll.",
    topic: "Transportlag",
    pairs: [
      { left: "Pålitelig levering med retransmisjon", right: "TCP" },
      { left: "Forbindelsesløs — bare send", right: "UDP" },
      { left: "Krever 3-veis håndtrykk før data", right: "TCP" },
      { left: "8 byte header, lav overhead", right: "UDP" },
      { left: "Flow control og congestion control", right: "TCP" },
      { left: "Rekkefølge ikke garantert", right: "UDP" },
      { left: "Brukes av HTTP, SSH, SMTP", right: "TCP" },
      { left: "Brukes av DNS, VoIP, spill", right: "UDP" },
    ],
  },
  {
    id: "d-order-tcp-handshake",
    kind: "order",
    title: "TCP 3-veis håndtrykk",
    prompt: "Sortér meldingene i klient-server-utvekslingen.",
    topic: "Transportlag",
    items: [
      "Klient → Server: SYN, seq=x",
      "Server → Klient: SYN+ACK, seq=y, ack=x+1",
      "Klient → Server: ACK, ack=y+1",
      "Forbindelsen er nå åpen — data kan flyte",
    ],
    explanation:
      "SYN-ACK sparer en runde — server bekrefter klientens SYN OG sender sin egen i samme melding.",
  },
  {
    id: "d-order-tcp-close",
    kind: "order",
    title: "TCP 4-veis avskjed",
    prompt: "Sortér meldingene for å lukke forbindelsen.",
    topic: "Transportlag",
    items: [
      "Klient sender FIN — «ferdig å sende»",
      "Server sender ACK",
      "Server fortsetter å sende resterende data",
      "Server sender FIN når den også er ferdig",
      "Klient sender ACK",
      "Klient venter i TIME_WAIT (2×MSL) før full lukking",
    ],
    explanation:
      "Hver retning lukkes uavhengig. TIME_WAIT hindrer at gamle pakker forveksles med nye forbindelser.",
  },
  {
    id: "d-quiz-tcp-flow-vs-congestion",
    kind: "quiz",
    title: "Flow control vs congestion control",
    prompt: "Velg riktig forskjell.",
    topic: "Transportlag",
    question: "Hva er forskjellen mellom flow control og congestion control i TCP?",
    options: [
      {
        text: "Flow control beskytter MOTTAKEREN; congestion control beskytter NETTVERKET",
        correct: true,
        rationale: "rwnd er fra mottakeren («jeg har ikke plass»); cwnd er TCP-avsenderens estimat av nettverket («pakker forsvinner»).",
      },
      {
        text: "Flow control er for TCP, congestion control er for UDP",
        correct: false,
        rationale: "UDP har ingen av delene — det er hele poenget.",
      },
      {
        text: "Begge handler om å begrense hastighet — bare ulike navn",
        correct: false,
        rationale: "De løser to ulike problemer.",
      },
      {
        text: "Congestion control krever ekstra header-felt",
        correct: false,
        rationale: "Begge fungerer med standard TCP-header.",
      },
    ],
    explanation:
      "Faktisk send-hastighet er min(rwnd, cwnd) — begge må gi grønt lys.",
  },
  {
    id: "d-quiz-tcp-fast-retransmit",
    kind: "quiz",
    title: "TCP fast retransmit — trigger",
    prompt: "Velg riktig.",
    topic: "Transportlag",
    question: "Hva trigger TCP fast retransmit?",
    options: [
      {
        text: "Tre duplikate ACK-er i rad",
        correct: true,
        rationale: "Tre dupl. ACK-er signaliserer at mottaker har mottatt påfølgende segmenter men venter på et tapt — retransmitter umiddelbart uten å vente på timeout.",
      },
      {
        text: "Timeout på en pakke",
        correct: false,
        rationale: "Det er REGULAR retransmit. Fast retransmit er raskere — uten å vente.",
      },
      {
        text: "En enkelt duplikat ACK",
        correct: false,
        rationale: "Én duplikat kan være forbigående reordering. Tre regnes som tap.",
      },
      {
        text: "RST-flagg fra mottaker",
        correct: false,
        rationale: "RST er forbindelsesnullstilling, ikke retransmit-trigger.",
      },
    ],
  },
  {
    id: "d-quiz-tcp-vs-udp-velg",
    kind: "quiz",
    title: "TCP eller UDP for use-case",
    prompt: "Velg det best passende.",
    topic: "Transportlag",
    question: "Du designer et live video-conference-system. Hvilken transport-protokoll velger du for selve video-strømmen?",
    options: [
      {
        text: "UDP — heller dropp en frame enn å pause hele samtalen",
        correct: true,
        rationale: "Sanntid: en frame som kommer 1 sekund forsinket er verdiløs uansett. TCP-retransmisjon ville stoppet strømmen.",
      },
      {
        text: "TCP — vi vil ikke miste en eneste frame",
        correct: false,
        rationale: "Real-time video er ikke pålitelig-først. Et tapt frame er bedre enn en frosset skjerm.",
      },
      {
        text: "Begge — TCP for video, UDP for lyd",
        correct: false,
        rationale: "Begge skal være UDP — eller QUIC/SRT som bygger på UDP.",
      },
      {
        text: "FTP",
        correct: false,
        rationale: "FTP er en applikasjonsprotokoll for filer, ikke streaming.",
      },
    ],
    explanation: "Generelt for sanntid: UDP. For data som MÅ være helt riktig: TCP.",
  },
  {
    id: "d-fill-tcp-segment",
    kind: "fill",
    title: "Fyll inn TCP-segment-feltene",
    prompt: "TCP-headeren har 6 viktige felter du må kunne.",
    topic: "Transportlag",
    template:
      "TCP-header inneholder:\n  source __1__:        avsender-prosess\n  destination __1__:   mottaker-prosess\n  __2__ number:        rekkefølge-nummer for bytene\n  __3__ number:        bekrefter mottatt opp til\n  flags:               SYN, __4__, FIN, RST, PSH, URG\n  window size:         hvor mye __5__ kan ta imot",
    blanks: ["port", "sequence", "ack", "ACK", "mottaker"],
    options: ["port", "address", "sequence", "byte", "ack", "ACK", "SYN", "FIN", "mottaker", "avsender"],
    explanation:
      "Disse 6 + window-felt-et er kjernen i hva TCP gjør forskjellig fra UDP.",
  },

  // ============= KRYPTOGRAFI =============

  {
    id: "d-match-cia-trekanten",
    kind: "match",
    title: "CIA-trekanten — match garanti til trussel",
    prompt: "Hver krypto-garanti svarer til en konkret trussel.",
    topic: "Kryptografi",
    pairs: [
      { left: "Konfidensialitet", right: "Beskytter mot avlytting — kryptering" },
      { left: "Integritet", right: "Beskytter mot endring — hash + MAC" },
      { left: "Autentisitet", right: "Beskytter mot impersonation — signatur/sertifikat" },
    ],
  },
  {
    id: "d-quiz-symm-vs-asymm",
    kind: "quiz",
    title: "Symmetrisk eller asymmetrisk?",
    prompt: "Velg det best dekkende svaret.",
    topic: "Kryptografi",
    question: "Hva er hovedforskjellen mellom symmetrisk og asymmetrisk kryptering?",
    options: [
      {
        text: "Symmetrisk bruker SAMME nøkkel begge veier; asymmetrisk har en public + en private",
        correct: true,
        rationale: "Det er hele forskjellen. Symmetrisk er raskere men krever sikker nøkkel-utveksling. Asymmetrisk løser nettopp det problemet.",
      },
      {
        text: "Symmetrisk er sikrere",
        correct: false,
        rationale: "Begge er sikre når riktig brukt. Forskjellen er hvordan nøkkelen er strukturert.",
      },
      {
        text: "Asymmetrisk brukes bare for hash",
        correct: false,
        rationale: "Hash er en helt tredje kategori — enveis.",
      },
      {
        text: "Symmetrisk fungerer ikke over internett",
        correct: false,
        rationale: "Den fungerer fint — etter at man har avtalt nøkkelen. Det er DEN delen som er hard.",
      },
    ],
  },
  {
    id: "d-quiz-hash-vs-encrypt",
    kind: "quiz",
    title: "Hash eller kryptering?",
    prompt: "Velg riktig løsning.",
    topic: "Kryptografi",
    question: "Du skal lagre passord i en database. Skal du KRYPTERE eller HASHE dem?",
    options: [
      {
        text: "Hash — med slow hash (bcrypt, Argon2), enveis så de aldri kan reverseres",
        correct: true,
        rationale: "Passord trenger ikke å kunne reverseres — du sammenligner hash. Slow hash gjør brute-force dyrt.",
      },
      {
        text: "Kryptere med AES",
        correct: false,
        rationale: "Kryptering er reversibelt — hvis nøkkelen lekker, lekker alle passord. Hash er enveis.",
      },
      {
        text: "Lagre i klartekst",
        correct: false,
        rationale: "Aldri. Lekkasje = alle passord eksponert.",
      },
      {
        text: "SHA-256",
        correct: false,
        rationale: "Bedre enn klartekst, men SHA-256 er for raskt for passord. GPU-er tester milliarder per sekund.",
      },
    ],
  },
  {
    id: "d-order-digital-signatur",
    kind: "order",
    title: "Digital signatur — sortér flyt",
    prompt: "Alice signerer et dokument. Sortér stegene fra signering til verifisering.",
    topic: "Kryptografi",
    items: [
      "Alice beregner hash av dokumentet (SHA-256)",
      "Alice krypterer hashen med sin PRIVATE nøkkel → signatur",
      "Alice publiserer (dokument, signatur) sammen",
      "Bob beregner sin egen hash av dokumentet",
      "Bob dekrypterer signaturen med Alice sin PUBLIC nøkkel",
      "Bob sammenligner: matcher → ekte signatur",
    ],
    explanation:
      "Signering = privat nøkkel. Verifisering = public nøkkel. Motsatt av kryptering hvor public krypterer og private dekrypterer.",
  },
  {
    id: "d-match-krypto-algoritmer",
    kind: "match",
    title: "Krypto-algoritme → kategori",
    prompt: "Plasser algoritmen i riktig kategori.",
    topic: "Kryptografi",
    pairs: [
      { left: "AES-256", right: "Symmetrisk kryptering" },
      { left: "ChaCha20", right: "Symmetrisk kryptering" },
      { left: "RSA-2048", right: "Asymmetrisk kryptering" },
      { left: "ECC (Curve25519)", right: "Asymmetrisk kryptering" },
      { left: "SHA-256, SHA-3", right: "Hash-funksjon" },
      { left: "HMAC-SHA256", right: "MAC (integritet med nøkkel)" },
      { left: "bcrypt, Argon2", right: "Passord-hash (slow)" },
    ],
  },
  {
    id: "d-quiz-pki-stol",
    kind: "quiz",
    title: "PKI — hvorfor stoler nettleseren på et sertifikat?",
    prompt: "Velg den primære grunnen.",
    topic: "Kryptografi",
    question: "Du går til https://nettbank.no. Hvorfor godtar nettleseren sertifikatet?",
    options: [
      {
        text: "En CA som nettleseren stoler på har signert sertifikatet, og signatur+domene+dato sjekkes ut",
        correct: true,
        rationale: "Trust-chain: nettleserens trust store → CA → ev. mellom-CA → server-sertifikat. Hvert ledd må verifiseres.",
      },
      {
        text: "Serveren har et offentlig kjent fingeravtrykk",
        correct: false,
        rationale: "Ingen sentral fingeravtrykk-database. Det er CA-signaturer som er roten av tillit.",
      },
      {
        text: "Sertifikatet er kryptert med AES",
        correct: false,
        rationale: "Sertifikatet er en signert public key — ikke kryptert.",
      },
      {
        text: "DNS bekrefter at sertifikatet er ekte",
        correct: false,
        rationale: "DNS oversetter navn til IP. Det er PKI som bekrefter identitet.",
      },
    ],
  },
  {
    id: "d-quiz-md5-sha1-status",
    kind: "quiz",
    title: "MD5 og SHA-1 — hvorfor ikke bruke dem?",
    prompt: "Velg det riktige svaret.",
    topic: "Kryptografi",
    question: "Hvorfor brukes ikke MD5 og SHA-1 lenger i nye systemer?",
    options: [
      {
        text: "Kollisjoner er funnet — to ulike inputs kan gi samme hash",
        correct: true,
        rationale: "Begge har dokumenterte kollisjons-angrep. Det bryter collision-resistance og gjør dem ubrukelige for signaturer/sertifikater.",
      },
      {
        text: "De er for trege",
        correct: false,
        rationale: "Faktisk for RASKE for passord, men det er ikke hovedgrunnen til å droppe dem.",
      },
      {
        text: "Output er for lite",
        correct: false,
        rationale: "MD5 er 128 bit, SHA-1 er 160 bit — det er kollisjons-angrep som er problemet, ikke output-størrelse alene.",
      },
      {
        text: "Begge er patenterte",
        correct: false,
        rationale: "Begge er åpne standarder.",
      },
    ],
  },

  // ============= TLS =============

  {
    id: "d-order-tls-handshake",
    kind: "order",
    title: "TLS 1.3 håndtrykk — sortér stegene",
    prompt: "Sortér meldinger i TLS 1.3-håndtrykket.",
    topic: "TLS",
    items: [
      "Klient → Server: ClientHello (versjoner, ciphers, SNI, klient-random, key share)",
      "Server → Klient: ServerHello (valgt versjon/cipher, server-random, server key share)",
      "Server → Klient: Certificate + CertificateVerify (signert med private key)",
      "Begge sider utleder samme symmetriske session-nøkkel via ECDHE",
      "Begge sider sender Finished kryptert med session-nøkkel",
      "Applikasjonsdata flyter — kryptert med symmetrisk nøkkel",
    ],
    explanation:
      "TLS 1.3 gjør hele dette på 1 RTT — mye raskere enn TLS 1.2 sine 2 RTT.",
  },
  {
    id: "d-quiz-tls-13-vs-12",
    kind: "quiz",
    title: "TLS 1.3 vs 1.2 — viktigste endring",
    prompt: "Velg den mest dekkende.",
    topic: "TLS",
    question: "Hva er den viktigste sikkerhetsendringen fra TLS 1.2 til 1.3?",
    options: [
      {
        text: "Perfect Forward Secrecy er PÅKREVD, og utdaterte ciphers er fjernet",
        correct: true,
        rationale: "TLS 1.2 lot deg konfigurere PFS bort. TLS 1.3 gjør det obligatorisk + fjerner alt utrygt (RSA static, SHA-1, RC4, etc.).",
      },
      {
        text: "TLS 1.3 bruker bare RSA",
        correct: false,
        rationale: "Tvert imot — TLS 1.3 fjernet RSA-static og krever ECDHE.",
      },
      {
        text: "TLS 1.3 er ikke kompatibel med TLS 1.2",
        correct: false,
        rationale: "Servere kan tilby begge, klienter velger den nyeste den støtter.",
      },
      {
        text: "TLS 1.3 har ingen håndtrykk-fase",
        correct: false,
        rationale: "Den HAR håndtrykk — bare raskere (1 RTT).",
      },
    ],
  },
  {
    id: "d-match-tls-meldinger",
    kind: "match",
    title: "TLS-melding → formål",
    prompt: "Match hver melding til hva den faktisk gjør.",
    topic: "TLS",
    pairs: [
      { left: "ClientHello", right: "Klient sier hvilke versjoner/ciphers den støtter + sitt random-tall" },
      { left: "ServerHello", right: "Server velger versjon + cipher, sender sitt random" },
      { left: "Certificate", right: "Server sender sitt X.509-sertifikat" },
      { left: "CertificateVerify", right: "Server signerer håndtrykket med sin private key" },
      { left: "Finished", right: "Bekrefter at session-nøklene matcher og håndtrykket var integritetsbeskyttet" },
    ],
  },
  {
    id: "d-quiz-tls-pfs",
    kind: "quiz",
    title: "Perfect Forward Secrecy — hvorfor?",
    prompt: "Velg det best dekkende svaret.",
    topic: "TLS",
    question: "Hva er fordelen med Perfect Forward Secrecy (PFS)?",
    options: [
      {
        text: "Selv om serverens private nøkkel lekker SENERE, kan ikke gamle session-er dekrypteres",
        correct: true,
        rationale: "Hver session bruker en ephemeral DH-nøkkel som forkastes etterpå. Den private RSA/EC-nøkkelen brukes BARE til signering, ikke nøkkel-utveksling.",
      },
      {
        text: "PFS gjør TLS-håndtrykket raskere",
        correct: false,
        rationale: "Det legger faktisk litt på — du må regne ut ECDHE per session.",
      },
      {
        text: "PFS hindrer MITM-angrep",
        correct: false,
        rationale: "PFS handler om beskyttelse av PRE-RECORD trafikk hvis nøkkel lekker fremover. MITM er en annen kategori.",
      },
      {
        text: "PFS krever ingen sertifikater",
        correct: false,
        rationale: "Sertifikater trengs fortsatt for autentisitet.",
      },
    ],
  },
  {
    id: "d-quiz-tls-sertifikat-validering",
    kind: "quiz",
    title: "Sertifikatvalidering — hva sjekkes?",
    prompt: "Flere riktige svar.",
    topic: "TLS",
    multi: true,
    question: "Når nettleseren validerer et TLS-sertifikat, hva sjekker den?",
    options: [
      { text: "Signaturen verifiserer mot CA-ens public key", correct: true, rationale: "Roten av PKI-tillit." },
      { text: "Sertifikatkjeden går opp til en trusted root", correct: true, rationale: "Hele kjeden må være intakt." },
      { text: "Dato er gyldig (ikke utløpt, ikke fra fremtiden)", correct: true, rationale: "Utløpte sertifikater avvises." },
      { text: "CN/SAN matcher domenenavnet", correct: true, rationale: "Hindrer at et gyldig sertifikat for fake.com presenteres for nettbank.no." },
      { text: "Sertifikatet er ikke tilbakekalt (CRL/OCSP)", correct: true, rationale: "Sjekker mot revocation lists." },
      { text: "Sertifikatet bruker SHA-256", correct: false, rationale: "Anbefalt, men ikke et HARD krav — kan være andre moderne hash." },
    ],
  },

  // ============= NETTVERKSSIKKERHET =============

  {
    id: "d-match-angrep-forsvar",
    kind: "match",
    title: "Angrep → riktig forsvar",
    prompt: "Match hver klassisk nettverksangrep til sitt primære forsvar.",
    topic: "Nettverkssikkerhet",
    pairs: [
      { left: "ARP spoofing / MITM på LAN", right: "Static ARP, DAI på switch, TLS for end-to-end" },
      { left: "DNS-spoofing", right: "DNSSEC + DoH/DoT, HSTS" },
      { left: "TCP SYN flood", right: "SYN cookies, rate limiting på brannmur" },
      { left: "DDoS", right: "CDN/anti-DDoS-tjeneste (Cloudflare), kapasitet" },
      { left: "Port scanning", right: "Default deny brannmur, fail2ban, port knocking" },
      { left: "Sniffing på åpent WiFi", right: "Alltid HTTPS, VPN, WPA3 på AP" },
    ],
  },
  {
    id: "d-quiz-stateful-vs-stateless",
    kind: "quiz",
    title: "Stateful vs stateless brannmur",
    prompt: "Velg hovedforskjellen.",
    topic: "Nettverkssikkerhet",
    question: "Hva er hovedforskjellen mellom en stateful og stateless brannmur?",
    options: [
      {
        text: "Stateful holder oversikt over åpne forbindelser; stateless sjekker hver pakke isolert",
        correct: true,
        rationale: "Stateful kan automatisk tillate retur-trafikk; stateless må ha eksplisitte regler for begge retninger.",
      },
      {
        text: "Stateful er for TCP, stateless er for UDP",
        correct: false,
        rationale: "Begge støtter begge — stateful holder også UDP-«flow»-state.",
      },
      {
        text: "Stateless er sikrere",
        correct: false,
        rationale: "Stateful gir mer presis kontroll. Stateless er enklere men krever bredere åpninger.",
      },
      {
        text: "Stateless kan ikke kjøre på Linux",
        correct: false,
        rationale: "iptables kan kjøre i begge moduser.",
      },
    ],
  },
  {
    id: "d-quiz-ids-vs-ips",
    kind: "quiz",
    title: "IDS vs IPS",
    prompt: "Velg forskjellen.",
    topic: "Nettverkssikkerhet",
    question: "Hva er forskjellen mellom IDS og IPS?",
    options: [
      {
        text: "IDS er PASSIV (varsler), IPS er AKTIV (dropper)",
        correct: true,
        rationale: "IDS plasseres på SPAN-port og kan ikke stoppe trafikk. IPS er in-line og dropper.",
      },
      {
        text: "IDS er for store nett, IPS for små",
        correct: false,
        rationale: "Ingen sammenheng med skala.",
      },
      {
        text: "IDS bruker AI, IPS bruker regler",
        correct: false,
        rationale: "Begge kan bruke begge teknikker.",
      },
      {
        text: "IDS er gratis, IPS er kommersielt",
        correct: false,
        rationale: "Begge finnes som åpen kildekode (Snort/Suricata).",
      },
    ],
  },
  {
    id: "d-quiz-default-deny",
    kind: "quiz",
    title: "Default deny — hvorfor?",
    prompt: "Velg det best dekkende svaret.",
    topic: "Nettverkssikkerhet",
    question: "Hvorfor er «default deny» (blokker alt, åpne kun det du trenger) standard for brannmurer?",
    options: [
      {
        text: "Du vet hva du EKSPONERER. Default allow betyr at glemte tjenester står åpne",
        correct: true,
        rationale: "Eksplisitt allowlist er forsvarlig. Default allow inviterer feil — én tjeneste glemt eller en port åpnet av en utvikler «midlertidig».",
      },
      {
        text: "Default deny er raskere",
        correct: false,
        rationale: "Performance er nesten lik. Sikkerhet er hovedgrunnen.",
      },
      {
        text: "Default allow er bare for hjemmenett",
        correct: false,
        rationale: "Default deny anbefales overalt, også hjemmenett.",
      },
      {
        text: "Default deny krever mindre logging",
        correct: false,
        rationale: "Du logger fortsatt drop-pakker.",
      },
    ],
  },
  {
    id: "d-fill-iptables",
    kind: "fill",
    title: "Fyll inn iptables-regler",
    prompt: "Konfigurer en typisk web-server-brannmur.",
    topic: "Nettverkssikkerhet",
    language: "sql",
    template:
      "# Tillat etablerte forbindelser\niptables -A INPUT -m state --state __1__,RELATED -j ACCEPT\n\n# Tillat SSH fra admin-nettet\niptables -A INPUT -p tcp -s 10.0.0.0/24 --dport __2__ -j ACCEPT\n\n# Tillat HTTPS fra alle\niptables -A INPUT -p tcp --dport __3__ -j ACCEPT\n\n# Default __4__ — alt annet droppes\niptables -P INPUT __5__",
    blanks: ["ESTABLISHED", "22", "443", "deny", "DROP"],
    options: ["ESTABLISHED", "NEW", "RELATED", "22", "80", "443", "8080", "deny", "allow", "DROP", "ACCEPT", "REJECT"],
    explanation:
      "Først tillat etablerte (så retur-trafikk fungerer), så spesifikke tillatelser, så default DROP. Default DROP MÅ være siste — ellers trumfes den.",
  },
  {
    id: "d-quiz-nat-protection",
    kind: "quiz",
    title: "Beskytter NAT?",
    prompt: "Velg det mest presise svaret.",
    topic: "Nettverkssikkerhet",
    question: "Folk sier ofte at NAT «beskytter» et hjemmenett. Stemmer dette?",
    options: [
      {
        text: "Som BIVIRKNING — utenfra kan ikke noen koble seg inn uten en etablert NAT-mapping. Men NAT er ikke designet som brannmur.",
        correct: true,
        rationale: "Korrekt. NAT skjuler interne IP-er og hindrer uoppfordret innkommende. Men du må fortsatt ha brannmur for å konfigurere policy.",
      },
      {
        text: "Ja — NAT er en fullverdig brannmur",
        correct: false,
        rationale: "Det er en bivirkning. Eksplisitt brannmur trengs.",
      },
      {
        text: "Nei — NAT gir ingen sikkerhetsfordeler",
        correct: false,
        rationale: "Det gir BIVIRKNING-beskyttelse. Ikke designet for det, men effekten finnes.",
      },
      {
        text: "Bare IPv6 NAT beskytter",
        correct: false,
        rationale: "IPv6 trenger vanligvis ikke NAT — det er IPv4 som har det.",
      },
    ],
  },
  {
    id: "d-match-web-server-sjekkliste",
    kind: "match",
    title: "Web-server-sjekkliste — match tiltak til hva det hindrer",
    prompt: "Hver konfigurasjon beskytter mot en konkret klasse angrep.",
    topic: "Nettverkssikkerhet",
    pairs: [
      { left: "HSTS-header", right: "Hindrer downgrade fra HTTPS til HTTP" },
      { left: "Bare TLS 1.2/1.3, fjern eldre", right: "Hindrer POODLE, BEAST, og andre angrep på gamle versjoner" },
      { left: "fail2ban på SSH", right: "Hindrer brute-force på passord" },
      { left: "Rate limiting på login", right: "Hindrer credential stuffing" },
      { left: "CSP-header", right: "Reduserer XSS-skade" },
      { left: "Bare port 443 åpen utenfra", right: "Reduserer angrepsoverflate" },
    ],
  },
  {
    id: "d-order-defense-in-depth",
    kind: "order",
    title: "Forsvarsdyp — sortér lagene",
    prompt: "Sortér lagene fra ute (Internett) til inne (database) i en typisk web-app.",
    topic: "Nettverkssikkerhet",
    items: [
      "DDoS-mitigation / CDN (Cloudflare)",
      "WAF — Web Application Firewall",
      "Load balancer + TLS-terminering",
      "Brannmur (stateful) — kun port 443 åpen",
      "Applikasjons-servere",
      "Intern brannmur — kun DB-port fra app-server",
      "Database (privat nett, ikke eksponert)",
    ],
  },

  // ============= PYTHON KAP. 1 — Introduksjon, datamaskinen, språk, feiltyper =============

  {
    id: "d-py1-match-hw-roles",
    kind: "match",
    title: "Datamaskinens komponenter",
    prompt: "Match hver komponent til hovedoppgaven sin.",
    topic: "Python kap. 1",
    pairs: [
      { left: "CPU", right: "Henter og utfører instruksjoner, gjør aritmetikk og logikk" },
      { left: "RAM (hovedminne)", right: "Flyktig minne for data og programmer som kjører nå" },
      { left: "Harddisk / SSD", right: "Permanent lagring som beholder data uten strøm" },
      { left: "Buss", right: "Ledningene som flytter data mellom CPU, minne og I/O" },
      { left: "I/O-enheter", right: "Tastatur, skjerm, mus — kommuniserer med brukeren" },
      { left: "Nettverkskort (NIC)", right: "Kobler maskinen til andre maskiner via nettverket" },
    ],
    explanation:
      "RAM er flyktig (mister innhold når strømmen kuttes), disk er permanent. CPU er hjernen, buss er nervesystemet.",
  },
  {
    id: "d-py1-quiz-byte-bits",
    kind: "quiz",
    title: "Hvor mange bits er én byte?",
    prompt: "Velg riktig svar.",
    topic: "Python kap. 1",
    question: "Hva er størrelsen på én byte?",
    options: [
      { text: "8 bits", correct: true, rationale: "Standard definisjon: 1 byte = 8 bits = 256 unike verdier (2⁸)." },
      { text: "4 bits", correct: false, rationale: "4 bits kalles en nibble — halvparten av en byte." },
      { text: "16 bits", correct: false, rationale: "16 bits = 2 bytes = en «word» på mange CPU-er." },
      { text: "1024 bits", correct: false, rationale: "1024 er prefikset for kilo (1 KB = 1024 bytes), ikke størrelsen på en byte." },
    ],
    explanation:
      "1 byte = 8 bits = ett ASCII-tegn. Husk: bits er informasjon (0/1), bytes er enheten datamaskinen jobber med.",
  },
  {
    id: "d-py1-order-storage-sizes",
    kind: "order",
    title: "Sortér enheter fra minst til størst",
    prompt: "Sortér lagringsenhetene fra MINST til STØRST.",
    topic: "Python kap. 1",
    items: [
      "bit",
      "byte",
      "kilobyte (KB)",
      "megabyte (MB)",
      "gigabyte (GB)",
      "terabyte (TB)",
    ],
    explanation:
      "Hvert hopp er ~1000× (eller 1024× i binær). En typisk laptop har 16 GB RAM, 1 TB disk.",
  },
  {
    id: "d-py1-match-memory-types",
    kind: "match",
    title: "Minnetyper",
    prompt: "Match hver minnetype til riktig egenskap.",
    topic: "Python kap. 1",
    pairs: [
      { left: "RAM", right: "Rask, flyktig — mister innhold ved strømbrudd" },
      { left: "ROM", right: "Read-only, beholder innhold uten strøm (BIOS / firmware)" },
      { left: "Cache (L1/L2/L3)", right: "Ekstra raskt minne nær CPU, mindre enn RAM" },
      { left: "SSD", right: "Solid-state-disk — permanent, raskere enn HDD" },
      { left: "HDD", right: "Magnetisk roterende disk — billig, permanent, treigere" },
    ],
    explanation:
      "Minnehierarkiet: registre > cache > RAM > SSD > HDD. Jo nærmere CPU, jo raskere og mindre.",
  },
  {
    id: "d-py1-match-lang-levels",
    kind: "match",
    title: "Programmeringsspråk — nivåer",
    prompt: "Match språknivå til beskrivelse.",
    topic: "Python kap. 1",
    pairs: [
      { left: "Maskinkode", right: "Ren binær (0/1) — det CPU faktisk kjører" },
      { left: "Assembly", right: "Symbolske navn for instruksjoner — MOV, ADD, JMP. CPU-spesifikt" },
      { left: "Høynivåspråk", right: "Python, Java, C — leselig syntaks, abstrahert fra hardware" },
    ],
    explanation:
      "Maskinkode er det eneste CPU forstår. Alt annet må oversettes ned dit av en assembler, kompilator eller interpreter.",
  },
  {
    id: "d-py1-quiz-python-interp",
    kind: "quiz",
    title: "Python — kompilert eller tolket?",
    prompt: "Velg det mest presise svaret.",
    topic: "Python kap. 1",
    question: "Hvordan kjøres Python-kode?",
    options: [
      {
        text: "Tolket — interpreteren leser og kjører koden linje for linje (via bytekode)",
        correct: true,
        rationale: "CPython kompilerer først til bytekode (.pyc), så kjører bytekoden i en virtuell maskin. Brukeren ser dette som «tolket».",
      },
      {
        text: "Kompilert direkte til maskinkode før kjøring (som C)",
        correct: false,
        rationale: "Det er C/Rust/Go. Python kjøres via interpreter — ingen .exe lages.",
      },
      {
        text: "Kjøres bare via en nettleser",
        correct: false,
        rationale: "Det er JavaScript. Python kjører i en lokal interpreter.",
      },
      {
        text: "Krever Java Virtual Machine",
        correct: false,
        rationale: "Det er Java/Kotlin. Python har sin egen VM (CPython).",
      },
    ],
    explanation:
      "Praktisk konsekvens: ingen separat «build»-fase, men også typefeil oppdages først ved kjøring.",
  },
  {
    id: "d-py1-match-os-jobs",
    kind: "match",
    title: "Hva gjør et operativsystem?",
    prompt: "Match hver OS-oppgave til beskrivelse.",
    topic: "Python kap. 1",
    pairs: [
      { left: "Prosesshåndtering", right: "Starter, stopper og veksler mellom programmer som kjører" },
      { left: "Minnehåndtering", right: "Tildeler og frigjør RAM til prosessene" },
      { left: "Filsystem", right: "Organiserer data på disk i filer og mapper" },
      { left: "I/O-håndtering", right: "Snakker med tastatur, mus, skjerm, nettverk via drivere" },
      { left: "Sikkerhet og tilgang", right: "Bestemmer hvilke brukere som kan gjøre hva" },
    ],
    explanation:
      "OS er laget mellom hardware og applikasjonene. Eksempler: Windows, macOS, Linux.",
  },
  {
    id: "d-py1-quiz-python-creator",
    kind: "quiz",
    title: "Python — opphav",
    prompt: "Velg riktig svar.",
    topic: "Python kap. 1",
    question: "Hvem skapte Python, og omtrent når?",
    options: [
      { text: "Guido van Rossum, rundt 1990 (første utgivelse 1991)", correct: true, rationale: "Han utviklet språket på CWI i Nederland og kalte det opp etter Monty Python's Flying Circus." },
      { text: "Linus Torvalds, 1991", correct: false, rationale: "Linus Torvalds lagde Linux i 1991." },
      { text: "James Gosling, 1995", correct: false, rationale: "James Gosling lagde Java." },
      { text: "Brendan Eich, 1995", correct: false, rationale: "Brendan Eich lagde JavaScript på 10 dager i 1995." },
    ],
    explanation:
      "Navnet kommer fra TV-showet, ikke slangen. Python 2 ble pensjonert i 2020 — bruk Python 3.",
  },
  {
    id: "d-py1-match-error-types",
    kind: "match",
    title: "Tre typer feil i programmer",
    prompt: "Match feiltype til situasjon.",
    topic: "Python kap. 1",
    pairs: [
      { left: "Syntaksfeil", right: "Programmet kan ikke engang starte — manglende kolon, parantes, feilstavet keyword" },
      { left: "Kjøretidsfeil (runtime)", right: "Programmet krasjer underveis — ZeroDivisionError, NameError, FileNotFoundError" },
      { left: "Logisk feil", right: "Programmet kjører fint, men gir feil resultat — feil formel, feil < vs >" },
    ],
    explanation:
      "Verst å finne er logiske feil — interpreten merker ingenting. Du må teste outputen mot forventet svar.",
  },
  {
    id: "d-py1-quiz-error-classify",
    kind: "quiz",
    title: "Hvilken feiltype?",
    prompt: "Velg riktig feiltype for dette utdraget.",
    topic: "Python kap. 1",
    question: "Du kjører `print(\"Hei)` (manglende avsluttende anførselstegn). Hva slags feil er det?",
    code: "print(\"Hei)",
    language: "python",
    options: [
      { text: "Syntaksfeil — programmet kan ikke starte", correct: true, rationale: "Mangler avsluttende anførselstegn → SyntaxError: EOL while scanning string literal. Oppdages før kjøring." },
      { text: "Kjøretidsfeil — programmet krasjer underveis", correct: false, rationale: "Programmet starter ikke i det hele tatt." },
      { text: "Logisk feil — feil resultat", correct: false, rationale: "Programmet kjører ikke, så det produserer ingen resultat." },
      { text: "Typefeil — feil datatype", correct: false, rationale: "Det er en kategori kjøretidsfeil, men her er det ren syntaks som feiler." },
    ],
    explanation:
      "Syntaks: koden er ikke gyldig Python. Runtime: koden er gyldig, men noe går galt under kjøring. Logisk: alt kjører, men resultatet er feil.",
  },
  {
    id: "d-py1-quiz-pep8-style",
    kind: "quiz",
    title: "PEP 8 — navnekonvensjon",
    prompt: "Velg navnet som følger PEP 8 for en variabel.",
    topic: "Python kap. 1",
    question: "Hvilket variabelnavn er anbefalt Python-stil?",
    options: [
      { text: "max_speed", correct: true, rationale: "PEP 8: variabler og funksjoner i `snake_case` — små bokstaver med understrek." },
      { text: "MaxSpeed", correct: false, rationale: "`PascalCase` er for klasser, ikke variabler." },
      { text: "maxSpeed", correct: false, rationale: "`camelCase` er JavaScript/Java-stil — ikke Python-konvensjonen." },
      { text: "MAX_SPEED", correct: false, rationale: "Det er konvensjonen for konstanter (`SCREAMING_SNAKE_CASE`), ikke vanlige variabler." },
    ],
    explanation:
      "PEP 8 i ett øyekast: variabler = snake_case, klasser = PascalCase, konstanter = SCREAMING_SNAKE_CASE.",
  },

  // ============= PYTHON KAP. 2 — Variabler, uttrykk, operatorer =============

  {
    id: "d-py2-fill-hello",
    kind: "fill",
    title: "Skriv ut en linje",
    prompt: "Fyll inn for å skrive ut «Hei, verden!» til konsollen.",
    topic: "Python kap. 2",
    template: "__1__(__2__Hei, verden!__2__)",
    blanks: ["print", "\""],
    options: ["print", "input", "println", "\"", "'", "print(", ")"],
    language: "python",
    explanation:
      "`print()` skriver til stdout. Strenger kan stå i \" eller ' — bare vær konsekvent.",
  },
  {
    id: "d-py2-quiz-input-returntype",
    kind: "quiz",
    title: "Hvilken type returnerer input()?",
    prompt: "Velg riktig type.",
    topic: "Python kap. 2",
    question: "Hva er typen til verdien `input()` returnerer?",
    code: "x = input(\"Tall? \")",
    language: "python",
    options: [
      { text: "str (alltid string)", correct: true, rationale: "`input()` returnerer ALLTID en string, uansett hva brukeren skriver. Tall må konverteres med int() eller float()." },
      { text: "int hvis brukeren skriver et tall", correct: false, rationale: "Klassisk feil. Python tolker ikke input automatisk — alt er str." },
      { text: "float", correct: false, rationale: "Ikke automatisk. Du må selv kjøre float(input(...))." },
      { text: "bool", correct: false, rationale: "Bare hvis du eksplisitt kjører bool() på resultatet — og «False» som string er True!" },
    ],
    explanation:
      "Klassisk nybegynnerfeil: `x = input(\"Alder? \")` og så `if x > 18`. Det krasjer fordi du sammenligner str med int. Skriv `int(input(...))`.",
  },
  {
    id: "d-py2-fill-input-int",
    kind: "fill",
    title: "Les inn et tall",
    prompt: "Fyll inn så vi får alderen som heltall.",
    topic: "Python kap. 2",
    template: "alder = __1__(__2__(__3__Alder? __3__))",
    blanks: ["int", "input", "\""],
    options: ["int", "float", "str", "input", "print", "read", "\"", "'", "input("],
    language: "python",
    explanation:
      "Nesting: `int(input(...))` leser strengen, så konverterer til heltall. Krasjer hvis brukeren skriver «abc» — bruk try/except i robust kode.",
  },
  {
    id: "d-py2-quiz-identifier-valid",
    kind: "quiz",
    title: "Gyldig identifikator?",
    prompt: "Velg det gyldige variabelnavnet.",
    topic: "Python kap. 2",
    question: "Hvilket av disse er en GYLDIG identifikator i Python?",
    options: [
      { text: "_total2", correct: true, rationale: "Starter med underscore, etterfulgt av bokstaver/tall — alle regler oppfylt." },
      { text: "2total", correct: false, rationale: "Identifikatorer kan IKKE starte med et tall." },
      { text: "total-sum", correct: false, rationale: "Bindestrek er ikke lov — Python tolker det som subtraksjon." },
      { text: "for", correct: false, rationale: "Reservert nøkkelord — kan ikke brukes som variabelnavn." },
    ],
    explanation:
      "Regler: starter med bokstav eller _, deretter bokstaver/tall/_. Skiller mellom store og små bokstaver. Ikke et reservert ord.",
  },
  {
    id: "d-py2-fill-simul-assign-swap",
    kind: "fill",
    title: "Bytt verdier på én linje",
    prompt: "Fyll inn for å bytte verdiene mellom x og y.",
    topic: "Python kap. 2",
    template: "x = 5\ny = 10\n__1__, __2__ = __3__, __4__\nprint(x, y)  # 10 5",
    blanks: ["x", "y", "y", "x"],
    options: ["x", "y", "tmp", "5", "10", "swap"],
    language: "python",
    explanation:
      "Samtidig tilordning: høyresiden evalueres helt ferdig FØR venstresiden tilordnes. Derfor trenger man ingen midlertidig variabel.",
  },
  {
    id: "d-py2-quiz-true-division",
    kind: "quiz",
    title: "Operatoren / vs //",
    prompt: "Velg riktig output.",
    topic: "Python kap. 2",
    question: "Hva blir resultatet av `10 / 3` og `10 // 3`?",
    code: "print(10 / 3)\nprint(10 // 3)",
    language: "python",
    options: [
      { text: "3.3333333333333335 og 3", correct: true, rationale: "`/` er alltid float-divisjon (selv mellom ints), `//` er heltallsdivisjon (gulvfunksjon)." },
      { text: "3 og 3", correct: false, rationale: "I Python 3 returnerer `/` alltid float, ikke int." },
      { text: "3 og 3.33", correct: false, rationale: "Det er omvendt — `/` gir float, `//` gir int." },
      { text: "Begge gir 3.333…", correct: false, rationale: "`//` runder NEDOVER til heltall." },
    ],
    explanation:
      "Husk: i Python 3 er `/` ALLTID float-divisjon. I Python 2 var `/` heltallsdivisjon mellom ints — derfor importerer eldre kode `from __future__ import division`.",
  },
  {
    id: "d-py2-quiz-power-op",
    kind: "quiz",
    title: "Eksponent-operatoren **",
    prompt: "Velg riktig output.",
    topic: "Python kap. 2",
    question: "Hva blir `2 ** 3 ** 2`?",
    code: "print(2 ** 3 ** 2)",
    language: "python",
    options: [
      { text: "512", correct: true, rationale: "`**` er HØYRE-assosiativ. Beregnes som `2 ** (3 ** 2)` = `2 ** 9` = 512." },
      { text: "64", correct: false, rationale: "Det ville vært riktig hvis ** var venstre-assosiativ: `(2**3)**2 = 8**2 = 64`. Men det er ikke det." },
      { text: "8", correct: false, rationale: "Det er bare `2 ** 3`." },
      { text: "9", correct: false, rationale: "Det er `3 ** 2`." },
    ],
    explanation:
      "`**` er den ENESTE operatoren i Python som er høyreassosiativ. Skriv paranteser hvis du er i tvil.",
  },
  {
    id: "d-py2-quiz-modulo",
    kind: "quiz",
    title: "Modulo med negative tall",
    prompt: "Velg riktig output.",
    topic: "Python kap. 2",
    question: "Hva returnerer `-7 % 3` i Python?",
    code: "print(-7 % 3)",
    language: "python",
    options: [
      { text: "2", correct: true, rationale: "Python definerer modulo slik at fortegnet følger NEVNEREN (3 er positiv → resultat positivt). -7 = -3*3 + 2." },
      { text: "-1", correct: false, rationale: "Det ville vært C/Java sitt svar. Python er annerledes — viktig forskjell." },
      { text: "1", correct: false, rationale: "Sjekk regneregelen: -7 = -3*3 + 2, ikke -2*3 + (-1)." },
      { text: "-7", correct: false, rationale: "Det er ikke modulo, det er bare tallet selv." },
    ],
    explanation:
      "Praktisk: `n % k` med k > 0 gir alltid 0..k-1 i Python. Derfor er `-1 % 7 = 6` — perfekt for «forrige indeks i en sirkulær buffer».",
  },
  {
    id: "d-py2-quiz-scientific",
    kind: "quiz",
    title: "Vitenskapelig notasjon",
    prompt: "Velg riktig verdi.",
    topic: "Python kap. 2",
    question: "Hva er verdien av `1.5e3`?",
    options: [
      { text: "1500.0", correct: true, rationale: "`1.5e3` betyr `1.5 × 10³` = 1500. Returnerer alltid float." },
      { text: "1.53", correct: false, rationale: "`e` står for «times 10 to the power of», ikke «opphøyd i»." },
      { text: "150", correct: false, rationale: "Det ville vært `1.5e2`." },
      { text: "15000", correct: false, rationale: "Det ville vært `1.5e4`." },
    ],
    explanation:
      "Negative eksponenter er også lov: `2.5e-3 = 0.0025`. Brukes ofte for veldig store eller veldig små tall.",
  },
  {
    id: "d-py2-quiz-precedence-mix",
    kind: "quiz",
    title: "Operatorpresedens",
    prompt: "Velg riktig output.",
    topic: "Python kap. 2",
    question: "Hva blir `2 + 3 * 4 ** 2 // 5`?",
    code: "print(2 + 3 * 4 ** 2 // 5)",
    language: "python",
    options: [
      { text: "11", correct: true, rationale: "** først: 4**2 = 16. Så *: 3*16 = 48. Så //: 48//5 = 9. Til slutt +: 2+9 = 11." },
      { text: "13", correct: false, rationale: "Ikke +→*→**. Husk PEMDAS: ** binder STERKEST." },
      { text: "10", correct: false, rationale: "Sjekk heltallsdivisjon: 48//5 = 9, ikke 8 eller 10." },
      { text: "16", correct: false, rationale: "Det er bare 4**2. Du har glemt resten." },
    ],
    explanation:
      "Presedens fra sterk til svak: `**`, deretter `*`, `/`, `//`, `%`, deretter `+`, `-`. Skriv paranteser hvis du er i tvil.",
  },
  {
    id: "d-py2-fill-augmented",
    kind: "fill",
    title: "Augmented assignment",
    prompt: "Skriv om uten å bruke navnet `total` to ganger på samme linje.",
    topic: "Python kap. 2",
    template:
      "# før\ntotal = total + 5\n\n# etter (augmented)\ntotal __1__ 5",
    blanks: ["+="],
    options: ["+=", "-=", "*=", "/=", "=", "==", "++"],
    language: "python",
    explanation:
      "`total += 5` er nøyaktig som `total = total + 5`, bare kortere. Finnes også -=, *=, /=, //=, %=, **=.",
  },
  {
    id: "d-py2-match-typeconv",
    kind: "match",
    title: "Type-konvertering",
    prompt: "Match hvert uttrykk til riktig output.",
    topic: "Python kap. 2",
    pairs: [
      { left: "int(3.9)", right: "3 (kutter mot null, ingen avrunding)" },
      { left: "int(\"42\")", right: "42 (parser strengen som tall)" },
      { left: "int(\"3.5\")", right: "ValueError (int() parser ikke desimaltall i string)" },
      { left: "float(3)", right: "3.0" },
      { left: "str(42)", right: "\"42\"" },
      { left: "round(2.5)", right: "2 (banker's rounding — runder til partall)" },
      { left: "round(3.5)", right: "4 (runder til partall)" },
    ],
    explanation:
      "Snublesteiner: `int(\"3.5\")` krasjer — du må gå via float: `int(float(\"3.5\"))` = 3. `round()` bruker «banker's rounding» — ulikt det du lærte på skolen.",
  },
  {
    id: "d-py2-quiz-int-of-string-decimal",
    kind: "quiz",
    title: "int() av desimal-string",
    prompt: "Velg riktig output.",
    topic: "Python kap. 2",
    question: "Hva skjer ved `int(\"3.5\")`?",
    code: "print(int(\"3.5\"))",
    language: "python",
    options: [
      { text: "ValueError — int() vil ikke parse string med punktum", correct: true, rationale: "`int()` av string aksepterer bare heltallsformat. For desimaler må du gå via float først." },
      { text: "3 — kutter automatisk", correct: false, rationale: "Det ville fungert med int(3.5), ikke int(\"3.5\")." },
      { text: "3.5", correct: false, rationale: "int() returnerer aldri float." },
      { text: "4", correct: false, rationale: "int() avrunder ikke — og denne kasten feiler uansett." },
    ],
    explanation:
      "Fiks: `int(float(\"3.5\"))` = 3. Eller hvis du faktisk vil ha desimaler: bruk `float(\"3.5\")` direkte.",
  },
  {
    id: "d-py2-fill-distance-formula",
    kind: "fill",
    title: "Avstand mellom to punkter",
    prompt: "Fyll inn for å beregne avstanden mellom (x1, y1) og (x2, y2).",
    topic: "Python kap. 2",
    template:
      "# distansen = sqrt((x2-x1)² + (y2-y1)²)\nimport __1__\ndistanse = __1__.__2__((x2 - x1) __3__ 2 + (y2 - y1) __3__ 2)",
    blanks: ["math", "sqrt", "**"],
    options: ["math", "numpy", "sqrt", "pow", "abs", "**", "*", "^"],
    language: "python",
    explanation:
      "Klassisk Pythagoras. `**` er eksponent, `^` er bitwise XOR — vanlig forveksling fra matte-notasjon.",
  },
  {
    id: "d-py2-quiz-min-changes",
    kind: "quiz",
    title: "Minimum antall mynter (case study 2.9)",
    prompt: "Velg riktig output.",
    topic: "Python kap. 2",
    question: "Vi har 156 cent og denominasjoner [100, 25, 10, 5, 1]. Hvor mange mynter av hver type med grådig algoritme?",
    options: [
      { text: "1×100 + 2×25 + 0×10 + 1×5 + 1×1 = 5 mynter", correct: true, rationale: "100 → rest 56. 56//25 = 2, rest 6. 6//10 = 0, rest 6. 6//5 = 1, rest 1. 1×1." },
      { text: "1×100 + 5×10 + 1×5 + 1×1 = 8 mynter", correct: false, rationale: "Grådig velger størst først — 25-myntene tas før 10." },
      { text: "0×100 + 6×25 + 0×10 + 1×5 + 1×1 = 8 mynter", correct: false, rationale: "Grådig hopper aldri over en mynt hvis den får plass." },
      { text: "1×100 + 2×25 + 6×1 = 9 mynter", correct: false, rationale: "Etter 100+50=150, prøv 5 før 1: 1×5 + 1×1 ikke 6×1." },
    ],
    explanation:
      "Mønsteret: `antall = beløp // verdi; beløp = beløp % verdi`. Grådig fungerer for amerikanske/norske mynter, men ikke alltid generelt.",
  },

  // ============= PYTHON KAP. 3 — Boolean, if/elif, logiske operatorer =============

  {
    id: "d-py3-quiz-bool-of-things",
    kind: "quiz",
    title: "bool() av ulike verdier",
    prompt: "Velg det FALSE-aktige uttrykket.",
    topic: "Python kap. 3",
    question: "Hvilken av disse er falsy (gir False ved bool())?",
    options: [
      { text: "0", correct: true, rationale: "Falsy i Python: 0, 0.0, \"\" (tom string), [], {}, set(), None, False." },
      { text: "\"False\"", correct: false, rationale: "Ikke-tom string → ALLTID truthy. Klassisk felle." },
      { text: "[0]", correct: false, rationale: "Lista har ETT element (selv om elementet er 0) → truthy." },
      { text: "\"0\"", correct: false, rationale: "Ikke-tom string — selv om innholdet er «0», er strengen sann." },
    ],
    explanation:
      "Faste regler: tomme containere og null-verdier er falsy. ALT annet er truthy. Aldri bool(\"False\") forvent False!",
  },
  {
    id: "d-py3-match-comparison-ops",
    kind: "match",
    title: "Sammenligningsoperatorer",
    prompt: "Match operator til betydning.",
    topic: "Python kap. 3",
    pairs: [
      { left: "==", right: "Likhet — er a og b like verdier?" },
      { left: "!=", right: "Ulikhet — er a og b forskjellige?" },
      { left: "<", right: "Strengt mindre enn" },
      { left: "<=", right: "Mindre enn eller lik" },
      { left: "is", right: "Identitet — peker a og b på SAMME objekt?" },
      { left: "in", right: "Medlemskap — er a inneholdt i b?" },
    ],
    explanation:
      "Vanlig feil: bruk `is` for å sammenligne verdier. `is` sjekker minneidentitet, ikke verdi. Bruk `==` for verdier.",
  },
  {
    id: "d-py3-quiz-random-range",
    kind: "quiz",
    title: "random.randint — inklusiv eller eksklusiv?",
    prompt: "Velg riktig svar.",
    topic: "Python kap. 3",
    question: "Hvilke verdier kan `random.randint(1, 6)` returnere?",
    code: "import random\nx = random.randint(1, 6)",
    language: "python",
    options: [
      { text: "1, 2, 3, 4, 5 eller 6 — BEGGE endepunkter inkludert", correct: true, rationale: "`randint(a, b)` inkluderer både a og b. Perfekt for «kast en terning»." },
      { text: "1, 2, 3, 4 eller 5 — øvre grense ekskludert", correct: false, rationale: "Det er `random.randrange(1, 6)` eller `range(1, 6)`. randint er inklusiv i begge ender." },
      { text: "0, 1, 2, 3, 4 eller 5", correct: false, rationale: "randint starter på første argument (1), ikke 0." },
      { text: "Ethvert flyttall mellom 1 og 6", correct: false, rationale: "Det er `random.uniform(1, 6)`. randint gir bare heltall." },
    ],
    explanation:
      "Huskeregel: `randint` er INKLUSIV i begge ender (uvanlig for Python — alt annet er øvre-eksklusivt). `randrange(a, b)` er som range — eksklusivt b.",
  },
  {
    id: "d-py3-fill-if-statement",
    kind: "fill",
    title: "Enkel if-setning",
    prompt: "Fyll inn for å skrive «Voksen» hvis alder er minst 18.",
    topic: "Python kap. 3",
    template: "alder = int(input(\"Alder? \"))\n__1__ alder __2__ 18__3__\n    print(\"Voksen\")",
    blanks: ["if", ">=", ":"],
    options: ["if", "elif", "else", ">=", ">", "==", "=", ":", ";", "{", "then"],
    language: "python",
    explanation:
      "Mønster: `if <vilkår>:` etterfulgt av innrykket blokk. Husk kolonet — uten det får du SyntaxError.",
  },
  {
    id: "d-py3-fill-if-else",
    kind: "fill",
    title: "if-else for partall/oddetall",
    prompt: "Fyll inn for å sjekke om n er partall.",
    topic: "Python kap. 3",
    template:
      "n = int(input(\"Tall? \"))\nif n __1__ 2 == 0:\n    print(\"Partall\")\n__2__:\n    print(\"Oddetall\")",
    blanks: ["%", "else"],
    options: ["%", "/", "//", "**", "else", "elif", "or", "if"],
    language: "python",
    explanation:
      "`n % 2 == 0` er kanonisk for «partall». For oddetall kan du bruke `n % 2 != 0` eller `n % 2 == 1`.",
  },
  {
    id: "d-py3-fill-elif-grade",
    kind: "fill",
    title: "if-elif-else for karakterer",
    prompt: "Fyll inn slik at vi får riktig karakter ut.",
    topic: "Python kap. 3",
    template:
      "score = 85\nif score >= 90:\n    karakter = \"A\"\n__1__ score >= 80:\n    karakter = \"B\"\n__1__ score >= 70:\n    karakter = \"C\"\n__2__:\n    karakter = \"F\"\nprint(karakter)  # B",
    blanks: ["elif", "else"],
    options: ["elif", "else", "if", "elseif", "or", "case"],
    language: "python",
    explanation:
      "`elif` er Python sin «else if» — én sammenhengende kjede. Bare ÉN gren kjøres. Husk: rekkefølgen betyr noe — start fra strengeste vilkår.",
  },
  {
    id: "d-py3-quiz-assign-vs-equal",
    kind: "quiz",
    title: "Klassisk feil i if-test",
    prompt: "Hva er feilen?",
    topic: "Python kap. 3",
    question: "Hva er problemet med denne koden?",
    code: "x = int(input(\"Tall? \"))\nif x = 5:\n    print(\"Fem!\")",
    language: "python",
    options: [
      { text: "SyntaxError — bruker = (tilordning) i stedet for == (likhet)", correct: true, rationale: "Python skiller skarpt: `=` er tilordning, `==` er sammenligning. I if-test må det være `==`." },
      { text: "Programmet kjører, men gir feil svar", correct: false, rationale: "Det parsesr ikke i det hele tatt — SyntaxError før kjøring." },
      { text: "`if` mangler kolon", correct: false, rationale: "Kolonet er på plass — det er likhetstegnet som er feil." },
      { text: "x må være string", correct: false, rationale: "Type er ikke problemet — det er operatoren." },
    ],
    explanation:
      "Forskjell fra C/Java: i Python er `=` ikke et uttrykk — du kan ikke skrive `if (x = 5)`. Det gir SyntaxError, IKKE en logisk feil. Bra defaul!",
  },
  {
    id: "d-py3-fill-bmi-classify",
    kind: "fill",
    title: "BMI-kategorisering",
    prompt: "Fyll inn så BMI-en blir riktig klassifisert.",
    topic: "Python kap. 3",
    template:
      "bmi = vekt / (hoyde ** 2)\nif bmi __1__ 18.5:\n    kat = \"Undervekt\"\n__2__ bmi < 25:\n    kat = \"Normal\"\n__2__ bmi < 30:\n    kat = \"Overvekt\"\n__3__:\n    kat = \"Fedme\"",
    blanks: ["<", "elif", "else"],
    options: ["<", ">", "<=", "==", "elif", "else", "if", "or"],
    language: "python",
    explanation:
      "Når if/elif er sortert stigende, dekker hver gren et halvåpent intervall. Klassisk mønster for kategorisering på et tall.",
  },
  {
    id: "d-py3-match-logical-ops",
    kind: "match",
    title: "Logiske operatorer",
    prompt: "Match Python-uttrykk til betydning.",
    topic: "Python kap. 3",
    pairs: [
      { left: "a and b", right: "Sann bare hvis BÅDE a og b er sanne (short-circuit)" },
      { left: "a or b", right: "Sann hvis MINST ÉN av a og b er sann" },
      { left: "not a", right: "Inverterer — True blir False, False blir True" },
      { left: "a and not b", right: "Sann hvis a er sann og b er usann" },
    ],
    explanation:
      "Short-circuit: `a and b` evaluerer ikke b hvis a er falsy. `a or b` evaluerer ikke b hvis a er truthy. Praktisk for å unngå feil: `x is not None and x > 0`.",
  },
  {
    id: "d-py3-quiz-shortcircuit",
    kind: "quiz",
    title: "Short-circuit — krasjer det?",
    prompt: "Velg riktig svar.",
    topic: "Python kap. 3",
    question: "Krasjer denne koden når x er None?",
    code: "x = None\nif x is not None and x > 0:\n    print(\"positiv\")",
    language: "python",
    options: [
      { text: "Nei — `x is not None` er False, så `x > 0` evalueres aldri", correct: true, rationale: "Short-circuit: `and` slutter ved første False. Derfor er denne rekkefølgen trygg." },
      { text: "Ja — TypeError fra x > 0", correct: false, rationale: "Det ville skjedd hvis rekkefølgen var omvendt: `x > 0 and x is not None`. Da krasjer det." },
      { text: "Ja — NameError", correct: false, rationale: "x er definert som None. Det er bare ikke et tall." },
      { text: "Den printer «positiv»", correct: false, rationale: "x er None, ikke positivt. Vilkåret blir False." },
    ],
    explanation:
      "Klassisk mønster: sjekk «finnes» FØR du sjekker innhold. `x is not None and x > 0` er trygt, `x > 0 and x is not None` krasjer på None.",
  },
  {
    id: "d-py3-quiz-de-morgan",
    kind: "quiz",
    title: "De Morgan — negering",
    prompt: "Velg ekvivalent uttrykk.",
    topic: "Python kap. 3",
    question: "Hva er ekvivalent med `not (a and b)`?",
    options: [
      { text: "(not a) or (not b)", correct: true, rationale: "De Morgan: not (A og B) = (not A) eller (not B). Tenk «hvis det ikke er begge, da er minst én feil»." },
      { text: "(not a) and (not b)", correct: false, rationale: "Det er De Morgan for OR: not (a or b). Ulik regel." },
      { text: "not a and not b", correct: false, rationale: "Uten paranteser binder `not` sterkere enn `and` — dette tolkes som `(not a) and (not b)`. Feil." },
      { text: "a or b", correct: false, rationale: "Inverterer ikke noe." },
    ],
    explanation:
      "De Morgan: NOT distribuerer over AND/OR og bytter dem. Brukbart hver gang du skal forenkle eller invertere et komplekst vilkår.",
  },
  {
    id: "d-py3-fill-leap-year",
    kind: "fill",
    title: "Skuddår-vilkår",
    prompt: "Fyll inn det riktige vilkåret for skuddår.",
    topic: "Python kap. 3",
    template:
      "år = int(input(\"År? \"))\nskudd = (år % 4 == 0 __1__ år % 100 != 0) __2__ (år % 400 == 0)\nprint(skudd)",
    blanks: ["and", "or"],
    options: ["and", "or", "not", "==", "%"],
    language: "python",
    explanation:
      "Regel: skuddår = (delelig med 4 OG ikke delelig med 100) ELLER delelig med 400. 1900 er IKKE skuddår (delelig med 100, ikke med 400), 2000 ER skuddår (delelig med 400).",
  },
  {
    id: "d-py3-quiz-ternary",
    kind: "quiz",
    title: "Conditional expression (ternary)",
    prompt: "Velg riktig output.",
    topic: "Python kap. 3",
    question: "Hva blir verdien av `status`?",
    code: "score = 75\nstatus = \"Bestått\" if score >= 60 else \"Ikke bestått\"\nprint(status)",
    language: "python",
    options: [
      { text: "Bestått", correct: true, rationale: "Syntaks: `<verdi-hvis-sann> if <vilkår> else <verdi-hvis-usann>`. 75 >= 60 → første gren." },
      { text: "Ikke bestått", correct: false, rationale: "75 >= 60 er True." },
      { text: "True", correct: false, rationale: "Det er ikke en bool-test som returnerer True/False — det returnerer strengen." },
      { text: "SyntaxError", correct: false, rationale: "Python støtter dette syntakset. Annerledes enn C: `cond ? a : b`." },
    ],
    explanation:
      "Python-versjonen er omvendt av C/Java: verdi FØRST, så vilkår. Bruk med måte — nesting blir fort uleselig.",
  },
  {
    id: "d-py3-quiz-match-case",
    kind: "quiz",
    title: "Python 3.10 match-case",
    prompt: "Velg riktig output.",
    topic: "Python kap. 3",
    question: "Hva printer denne koden?",
    code: "x = 2\nmatch x:\n    case 1:\n        print(\"en\")\n    case 2 | 3:\n        print(\"to eller tre\")\n    case _:\n        print(\"annet\")",
    language: "python",
    options: [
      { text: "to eller tre", correct: true, rationale: "`case 2 | 3` matcher både 2 og 3. `|` er OR i pattern. `_` er catch-all (wildcard)." },
      { text: "en", correct: false, rationale: "Bare `case 1` matcher x = 1, ikke x = 2." },
      { text: "annet", correct: false, rationale: "`_` er bare fallback hvis ingen andre matcher." },
      { text: "SyntaxError", correct: false, rationale: "match-case er gyldig fra Python 3.10." },
    ],
    explanation:
      "Bare ett tilfelle kjøres (som en if-elif-else-kjede). `_` matcher hva som helst og brukes som default — analogt med `default:` i andre språk.",
  },
  {
    id: "d-py3-quiz-and-or-precedence",
    kind: "quiz",
    title: "Presedens — and vs or",
    prompt: "Velg riktig output.",
    topic: "Python kap. 3",
    question: "Hva blir `True or False and False`?",
    code: "print(True or False and False)",
    language: "python",
    options: [
      { text: "True", correct: true, rationale: "`and` binder STERKERE enn `or`. Tolkes som `True or (False and False)` = `True or False` = True." },
      { text: "False", correct: false, rationale: "Det ville vært riktig hvis or hadde sterkere presedens — men det har det ikke i Python." },
      { text: "SyntaxError", correct: false, rationale: "Uttrykket er gyldig." },
      { text: "None", correct: false, rationale: "or/and returnerer en operand (truthy/falsy), aldri None her." },
    ],
    explanation:
      "Presedens (logisk): `not` > `and` > `or`. Sammenligning (`<`, `==`, …) binder enda sterkere enn `not`. Skriv paranteser når du blander.",
  },
  {
    id: "d-py3-quiz-chained-comparison",
    kind: "quiz",
    title: "Kjeded sammenligning",
    prompt: "Velg riktig output.",
    topic: "Python kap. 3",
    question: "Hva returnerer dette?",
    code: "x = 5\nprint(1 < x < 10)",
    language: "python",
    options: [
      { text: "True", correct: true, rationale: "Python støtter kjeding: `1 < x < 10` er identisk med `1 < x and x < 10`. Veldig leselig." },
      { text: "False", correct: false, rationale: "1 < 5 er True, 5 < 10 er True. Begge sanne → True." },
      { text: "SyntaxError", correct: false, rationale: "Python støtter dette — i motsetning til C/Java der `1 < x < 10` tolkes som `(1 < x) < 10` = `True < 10` = True (men feil av andre grunner)." },
      { text: "5", correct: false, rationale: "Returnerer bool, ikke verdien." },
    ],
    explanation:
      "Pythonisk: `0 <= idx < len(arr)`. I C/Java må du skrive `0 <= idx && idx < arr.length` — Python sparer deg for AND-en.",
  },
  {
    id: "d-py3-quiz-detect-point",
    kind: "quiz",
    title: "Punkt inne i sirkel?",
    prompt: "Velg riktig vilkår.",
    topic: "Python kap. 3",
    question: "Hvilket vilkår tester om punktet (x, y) er innenfor sirkel med radius r sentrert i origo?",
    options: [
      { text: "x ** 2 + y ** 2 <= r ** 2", correct: true, rationale: "Avstand fra origo er sqrt(x²+y²). Innenfor = avstand ≤ r. Kvadrer begge sider for å unngå sqrt." },
      { text: "x + y <= r", correct: false, rationale: "Det er ikke avstandsformelen. Definerer et romb-område." },
      { text: "abs(x) <= r and abs(y) <= r", correct: false, rationale: "Det definerer et KVADRAT, ikke en sirkel." },
      { text: "x ** 2 + y ** 2 == r ** 2", correct: false, rationale: "Det er KANTEN av sirkelen, ikke innsiden." },
    ],
    explanation:
      "Triks: kvadrer for å spare en sqrt-kalkulasjon. Strengt innenfor: bruk `<`. Inkludert kanten: bruk `<=`.",
  },

  // ============= PYTHON KAP. 4 — Matematiske funksjoner, strenger, objekter =============

  {
    id: "d-py4-match-math-fns",
    kind: "match",
    title: "math-modulen — funksjoner",
    prompt: "Match funksjon til hva den gjør.",
    topic: "Python kap. 4",
    pairs: [
      { left: "math.sqrt(x)", right: "Kvadratrot av x" },
      { left: "math.ceil(x)", right: "Runder OPPOVER til nærmeste heltall" },
      { left: "math.floor(x)", right: "Runder NEDOVER til nærmeste heltall" },
      { left: "math.log(x)", right: "Naturlig logaritme (base e)" },
      { left: "math.log10(x)", right: "Logaritme base 10" },
      { left: "math.pi", right: "Konstanten π ≈ 3.14159…" },
      { left: "abs(x)", right: "Absoluttverdi (innebygd, IKKE i math)" },
    ],
    explanation:
      "Huskeregel: `abs()` og `round()` er innebygde — alt annet matematisk må du `import math`. NumPy har egne versjoner som er raskere på arrays.",
  },
  {
    id: "d-py4-quiz-str-immut",
    kind: "quiz",
    title: "Strenger er uforanderlige",
    prompt: "Velg riktig output.",
    topic: "Python kap. 4",
    question: "Hva skjer?",
    code: "s = \"hei\"\ns[0] = \"H\"\nprint(s)",
    language: "python",
    options: [
      { text: "TypeError — 'str' object does not support item assignment", correct: true, rationale: "Strenger er IMMUTABLE i Python. Du må lage en ny: `s = \"H\" + s[1:]`." },
      { text: "Hei", correct: false, rationale: "Det ville fungert i C eller hvis strenger var lister. Men i Python er strenger uforanderlige." },
      { text: "hei", correct: false, rationale: "Tilordningen krasjer før noe printes." },
      { text: "H", correct: false, rationale: "Ingen mutasjon skjer — feilen kommer før print." },
    ],
    explanation:
      "Bygg ny string: `s = \"H\" + s[1:]`. Eller bruk `s.replace(s[0], \"H\", 1)`. Lister er muterbare, strenger ikke.",
  },
  {
    id: "d-py4-match-str-methods",
    kind: "match",
    title: "String-metoder",
    prompt: "Match metode til resultat (alle returnerer NY string — original endres ikke).",
    topic: "Python kap. 4",
    pairs: [
      { left: "\"  Hei  \".strip()", right: "\"Hei\" — fjerner whitespace i begge ender" },
      { left: "\"hei\".upper()", right: "\"HEI\"" },
      { left: "\"hei verden\".split()", right: "[\"hei\", \"verden\"] — splitter på whitespace" },
      { left: "\",\".join([\"a\",\"b\",\"c\"])", right: "\"a,b,c\"" },
      { left: "\"hallo\".replace(\"a\", \"e\")", right: "\"hello\"" },
      { left: "\"abc\".find(\"b\")", right: "1 — indeks til første treff, -1 hvis ikke funnet" },
      { left: "len(\"hei\")", right: "3" },
    ],
    explanation:
      "Alle string-metoder returnerer ny string siden strenger er immutable. Klassisk feil: `s.upper()` uten å tilordne — original endres ikke.",
  },
  {
    id: "d-py4-quiz-fstring",
    kind: "quiz",
    title: "f-strings — formattering",
    prompt: "Velg riktig output.",
    topic: "Python kap. 4",
    question: "Hva printer dette?",
    code: "navn = \"Ola\"\nalder = 25\nprint(f\"{navn} er {alder} år\")",
    language: "python",
    options: [
      { text: "Ola er 25 år", correct: true, rationale: "f-string: variabler i `{}` settes inn direkte. Krever Python 3.6+." },
      { text: "{navn} er {alder} år", correct: false, rationale: "Det ville vært output uten `f`-prefiks: `\"{navn} er {alder} år\"`." },
      { text: "Ola er Ola år", correct: false, rationale: "Hver `{}` viser sin egen variabel — ikke samme." },
      { text: "SyntaxError", correct: false, rationale: "f-strings er gyldig Python 3.6+." },
    ],
    explanation:
      "Tre måter å formatere på: `f\"{x}\"` (best), `\"{}\".format(x)`, `\"%s\" % x`. f-string er raskest og mest leselig.",
  },
  {
    id: "d-py4-fill-fstring-decimal",
    kind: "fill",
    title: "f-string med desimaler",
    prompt: "Vis pris med to desimaler.",
    topic: "Python kap. 4",
    template: "pris = 1/3\nprint(f\"Pris: {pris__1__}\")",
    blanks: [":.2f"],
    options: [":.2f", ":.2", ":2f", "%.2f", "round(2)", ":,.2"],
    language: "python",
    explanation:
      "Format-spec etter kolon: `:.2f` = 2 desimaler. `:,.2f` legger til tusenseparator. `:>10` høyrejusterer i 10 bredde.",
  },
  {
    id: "d-py4-quiz-ord-chr",
    kind: "quiz",
    title: "ord() og chr() — tegnkoder",
    prompt: "Velg riktig output.",
    topic: "Python kap. 4",
    question: "Hva er `ord(\"A\")` og `chr(65)`?",
    code: "print(ord(\"A\"), chr(65))",
    language: "python",
    options: [
      { text: "65 A", correct: true, rationale: "ord() returnerer Unicode-kodepunktet. chr() går motsatt vei. \"A\" har kode 65." },
      { text: "97 a", correct: false, rationale: "97 er 'a' (liten). Store og små bokstaver har ulike koder — 32 fra hverandre." },
      { text: "1 A", correct: false, rationale: "ord() er ikke posisjon i alfabetet." },
      { text: "A 65", correct: false, rationale: "Rekkefølgen er motsatt." },
    ],
    explanation:
      "ASCII: 'A'=65, 'a'=97, '0'=48. For å skifte til store: `chr(ord(c) - 32)` — eller bare `c.upper()`.",
  },
  {
    id: "d-py4-quiz-in-operator",
    kind: "quiz",
    title: "in-operator på strenger",
    prompt: "Velg riktig output.",
    topic: "Python kap. 4",
    question: "Hva returnerer `\"py\" in \"Python\"`?",
    code: "print(\"py\" in \"Python\")",
    language: "python",
    options: [
      { text: "False — `in` er case-sensitiv", correct: true, rationale: "P er stort, p er lite. Bruk `.lower()` på begge for case-insensitiv test." },
      { text: "True", correct: false, rationale: "Python skiller mellom store og små bokstaver i string-sammenligning." },
      { text: "0", correct: false, rationale: "`in` returnerer bool, ikke indeks. For indeks: `.find()`." },
      { text: "2", correct: false, rationale: "Det ville vært `\"py\".find(\"py\")` på en match. Men her er det ingen match." },
    ],
    explanation:
      "Case-insensitiv: `\"py\".lower() in \"Python\".lower()`. Alternativ: regex med `re.IGNORECASE`-flagg.",
  },
  {
    id: "d-py4-fill-str-concat",
    kind: "fill",
    title: "String-konkatenering",
    prompt: "Bygg én string fra tre deler.",
    topic: "Python kap. 4",
    template:
      "fornavn = \"Ola\"\netternavn = \"Nordmann\"\nfullt_navn = fornavn __1__ \" \" __1__ etternavn\nprint(fullt_navn)  # Ola Nordmann",
    blanks: ["+"],
    options: ["+", ",", "*", ".", "&", "and"],
    language: "python",
    explanation:
      "`+` for streng-konkatenering. `,` i print legger automatisk inn mellomrom. f-string er ofte bedre: f\"{fornavn} {etternavn}\".",
  },

  // ============= PYTHON KAP. 5 — Løkker (while, for, range) =============

  {
    id: "d-py5-quiz-range-args",
    kind: "quiz",
    title: "range() med tre argumenter",
    prompt: "Velg riktig output.",
    topic: "Python kap. 5",
    question: "Hva blir resultatet?",
    code: "print(list(range(1, 10, 2)))",
    language: "python",
    options: [
      { text: "[1, 3, 5, 7, 9]", correct: true, rationale: "range(start, stop, step): starter på 1, stopper FØR 10, hopper 2 om gangen. STOP er eksklusivt." },
      { text: "[1, 3, 5, 7, 9, 10]", correct: false, rationale: "stop er IKKE inkludert. range(1, 10) gir 1..9, aldri 10." },
      { text: "[2, 4, 6, 8]", correct: false, rationale: "Det ville vært range(2, 10, 2)." },
      { text: "[1, 2, 3, 4, 5, 6, 7, 8, 9]", correct: false, rationale: "Det er steg 1, ikke 2." },
    ],
    explanation:
      "range(stop), range(start, stop), range(start, stop, step). STOP er ALLTID eksklusivt — som array-slicing. Negativt steg går baklengs.",
  },
  {
    id: "d-py5-fill-sum-loop",
    kind: "fill",
    title: "Akkumuler en sum",
    prompt: "Fyll inn slik at vi summerer tallene 1..100.",
    topic: "Python kap. 5",
    template:
      "total = __1__\nfor i in range(1, 101):\n    total __2__ i\nprint(total)  # 5050",
    blanks: ["0", "+="],
    options: ["0", "1", "-1", "+=", "=", "+", "i", "total"],
    language: "python",
    explanation:
      "Klassisk akkumulator-mønster: initialiser før løkken, oppdater inni. range(1, 101) inkluderer 1..100 (101 eksklusiv).",
  },
  {
    id: "d-py5-quiz-while-input",
    kind: "quiz",
    title: "Sentinel-løkke",
    prompt: "Velg riktig sentinel-mønster.",
    topic: "Python kap. 5",
    question: "Hvordan les tall til brukeren skriver 0?",
    code: "x = int(input(\"Tall? \"))\nwhile __MANGLER__:\n    print(x ** 2)\n    x = int(input(\"Tall? \"))",
    language: "python",
    options: [
      { text: "x != 0", correct: true, rationale: "Klassisk sentinel: les én gang før løkken (priming read), så test før hver iterasjon." },
      { text: "x == 0", correct: false, rationale: "Da kjører løkken bare hvis x ER 0 — motsatt av det vi vil." },
      { text: "True", correct: false, rationale: "Det ville være uendelig løkke uten break." },
      { text: "x > 0", correct: false, rationale: "Da stopper løkken også for negative tall, ikke bare 0." },
    ],
    explanation:
      "Priming read = les én gang før while-vilkåret. Alternativ: `while True:` med `if x == 0: break` inni. Stilspørsmål.",
  },
  {
    id: "d-py5-quiz-nested-loops",
    kind: "quiz",
    title: "Nestede løkker — antall print",
    prompt: "Velg riktig antall.",
    topic: "Python kap. 5",
    question: "Hvor mange ganger printer denne koden «*»?",
    code: "for i in range(3):\n    for j in range(4):\n        print(\"*\", end=\"\")",
    language: "python",
    options: [
      { text: "12", correct: true, rationale: "Ytre kjører 3 ganger, indre 4 ganger per ytre. Totalt 3×4 = 12." },
      { text: "7", correct: false, rationale: "Nestede løkker MULTIPLISERER, ikke summerer. Sekvens-løkker summerer." },
      { text: "3", correct: false, rationale: "Det er bare ytre løkke." },
      { text: "4", correct: false, rationale: "Det er bare indre løkke." },
    ],
    explanation:
      "Nestet = multiplikasjon (Big-O O(n×m)). Sekvens = addisjon (O(n+m)). Vanlig kilde til kvadratisk kompleksitet.",
  },
  {
    id: "d-py5-quiz-break-vs-continue",
    kind: "quiz",
    title: "break vs continue",
    prompt: "Velg riktig output.",
    topic: "Python kap. 5",
    question: "Hva printer denne koden?",
    code: "for i in range(5):\n    if i == 2:\n        continue\n    if i == 4:\n        break\n    print(i)",
    language: "python",
    options: [
      { text: "0 1 3", correct: true, rationale: "i=0,1 printes. i=2 hopper over (continue). i=3 printes. i=4 stopper løkken (break). 4 printes IKKE." },
      { text: "0 1 2 3", correct: false, rationale: "i=2 hopper over med continue — ikke printet." },
      { text: "0 1 3 4", correct: false, rationale: "break på i=4 skjer FØR print(4). 4 printes ikke." },
      { text: "0 1 2 3 4", correct: false, rationale: "Glemmer at continue og break gjør noe." },
    ],
    explanation:
      "`continue` = hopp til neste iterasjon. `break` = ut av løkka. `pass` = gjør ingenting (placeholder, ikke kontrollflyt).",
  },
  {
    id: "d-py5-quiz-for-else",
    kind: "quiz",
    title: "for-else — sjelden, men viktig",
    prompt: "Velg riktig output.",
    topic: "Python kap. 5",
    question: "Hva printer dette?",
    code: "for i in range(5):\n    if i == 10:\n        break\nelse:\n    print(\"ikke funnet\")\nprint(\"ferdig\")",
    language: "python",
    options: [
      { text: "ikke funnet\\nferdig", correct: true, rationale: "for-else: else kjører bare når løkken IKKE ble brutt med break. Her ble den aldri brutt → else kjører." },
      { text: "ferdig", correct: false, rationale: "for-else er ikke det samme som if-else. else hører til for-løkka." },
      { text: "Bare 'ferdig'", correct: false, rationale: "else kjører siden ingen break ble truffet." },
      { text: "SyntaxError", correct: false, rationale: "for-else er gyldig Python — uvanlig, men gyldig." },
    ],
    explanation:
      "Praktisk bruk: søke etter noe i en løkke. break når funnet, else når ikke. «if it ran to completion» — uvanlig kontrollflyt.",
  },
  {
    id: "d-py5-fill-multiplication-table",
    kind: "fill",
    title: "Gangetabell",
    prompt: "Fyll inn for å skrive ut 5-gangen.",
    topic: "Python kap. 5",
    template:
      "for i in __1__(1, __2__):\n    print(f\"5 × {i} = {5 __3__ i}\")",
    blanks: ["range", "11", "*"],
    options: ["range", "list", "iter", "10", "11", "12", "*", "+", "x", "·"],
    language: "python",
    explanation:
      "range(1, 11) gir 1..10. Husk: STOP er eksklusivt, så for å inkludere 10 må du skrive 11.",
  },
  {
    id: "d-py5-quiz-iterate-string",
    kind: "quiz",
    title: "Iterere over en string",
    prompt: "Velg riktig output.",
    topic: "Python kap. 5",
    question: "Hva printer denne løkken?",
    code: "for c in \"abc\":\n    print(c, end=\" \")",
    language: "python",
    options: [
      { text: "a b c", correct: true, rationale: "Strenger er iterable — for-løkka går gjennom hvert tegn." },
      { text: "abc", correct: false, rationale: "Du printer hvert tegn for seg med mellomrom — ikke hele strengen på én linje." },
      { text: "0 1 2", correct: false, rationale: "Det er indekser. For å få indeks + tegn: `for i, c in enumerate(s)`." },
      { text: "TypeError", correct: false, rationale: "Strings er iterable i Python." },
    ],
    explanation:
      "Alt iterable kan brukes med for: lister, strenger, sets, dicts, range-objekter. Bruk `enumerate()` hvis du trenger indeks også.",
  },
  {
    id: "d-py5-quiz-floating-pitfall",
    kind: "quiz",
    title: "Float-felle i while",
    prompt: "Hvorfor er denne løkken farlig?",
    topic: "Python kap. 5",
    question: "Hva er problemet?",
    code: "x = 0.1\nwhile x != 1.0:\n    x += 0.1\n    print(x)",
    language: "python",
    options: [
      { text: "x treffer aldri nøyaktig 1.0 pga. flytetallsavrunding — uendelig løkke", correct: true, rationale: "0.1 + 0.1 + ... = 0.9999999... pga. binær representasjon. Bruk `abs(x - 1.0) < 1e-9` eller heltall i stedet." },
      { text: "x må deklareres som float", correct: false, rationale: "x er allerede float (0.1)." },
      { text: "Krasjer med TypeError", correct: false, rationale: "Ingen typefeil — det er en logisk fastlås." },
      { text: "Printer 1.0 ti ganger", correct: false, rationale: "Den når aldri nøyaktig 1.0 — printer i det uendelige." },
    ],
    explanation:
      "Regel: aldri test float-likhet med `==`. Bruk tolerance: `abs(a-b) < epsilon`, eller bruk integer arithmetic og divider på slutten.",
  },

  // ============= PYTHON KAP. 6 — Funksjoner =============

  {
    id: "d-py6-fill-def",
    kind: "fill",
    title: "Definer en funksjon",
    prompt: "Fyll inn for en funksjon som returnerer kvadratet.",
    topic: "Python kap. 6",
    template: "__1__ kvadrat(x)__2__\n    __3__ x * x\n\nprint(kvadrat(4))  # 16",
    blanks: ["def", ":", "return"],
    options: ["def", "function", "fn", ":", ";", "return", "yield", "print", "="],
    language: "python",
    explanation:
      "Syntaks: `def navn(parametre):` etterfulgt av innrykket blokk. `return` sender verdien tilbake. Uten return: returnerer None.",
  },
  {
    id: "d-py6-quiz-default-arg",
    kind: "quiz",
    title: "Standardverdier på parametre",
    prompt: "Velg riktig output.",
    topic: "Python kap. 6",
    question: "Hva printer dette?",
    code: "def hilsen(navn, frase=\"Hei\"):\n    return f\"{frase}, {navn}!\"\n\nprint(hilsen(\"Ola\"))\nprint(hilsen(\"Kari\", \"Hallo\"))",
    language: "python",
    options: [
      { text: "Hei, Ola!\\nHallo, Kari!", correct: true, rationale: "Første kall bruker default 'Hei'. Andre overskriver med 'Hallo'." },
      { text: "Hei, Ola!\\nHei, Kari!", correct: false, rationale: "Andre kall sender ekspressivt 'Hallo' — det overskriver default." },
      { text: "Hallo, Ola!\\nHallo, Kari!", correct: false, rationale: "Første kall sender ikke 'Hallo' — bare 'Ola'." },
      { text: "TypeError", correct: false, rationale: "Parametre med default er valgfrie — første kall er gyldig." },
    ],
    explanation:
      "Default-verdier evalueres ÉN GANG ved def-tidspunkt. Mutable defaults (`def f(x=[])`) er klassisk felle — bruk None.",
  },
  {
    id: "d-py6-quiz-mutable-default",
    kind: "quiz",
    title: "Mutable default — fellen",
    prompt: "Velg riktig output.",
    topic: "Python kap. 6",
    question: "Hva printer dette?",
    code: "def legg_til(x, ls=[]):\n    ls.append(x)\n    return ls\n\nprint(legg_til(1))\nprint(legg_til(2))",
    language: "python",
    options: [
      { text: "[1]\\n[1, 2]", correct: true, rationale: "Default-listen lages ÉN gang og deles mellom alle kall! Hvert kall legger til samme liste." },
      { text: "[1]\\n[2]", correct: false, rationale: "Det ville fungert med `ls=None; if ls is None: ls = []`. Default er en delt liste." },
      { text: "[1]\\n[1]", correct: false, rationale: "Andre kall får ny x=2, men samme liste." },
      { text: "TypeError", correct: false, rationale: "Gyldig kode — men med subtil bug." },
    ],
    explanation:
      "Klassisk felle. Fiks: `def legg_til(x, ls=None): ls = ls or []`. Default-verdier evalueres bare én gang — du deler samme objekt mellom alle kall.",
  },
  {
    id: "d-py6-quiz-keyword-args",
    kind: "quiz",
    title: "Keyword arguments",
    prompt: "Velg riktig output.",
    topic: "Python kap. 6",
    question: "Hva returnerer dette?",
    code: "def rekt(bredde, høyde):\n    return bredde * høyde\n\nprint(rekt(høyde=3, bredde=5))",
    language: "python",
    options: [
      { text: "15", correct: true, rationale: "Keyword-args lar deg sende i hvilken som helst rekkefølge — argumentnavn binder verdiene riktig." },
      { text: "TypeError — feil rekkefølge", correct: false, rationale: "Rekkefølgen spiller ingen rolle når du bruker keyword-args." },
      { text: "8", correct: false, rationale: "Det er 5 + 3, ikke 5 × 3." },
      { text: "53", correct: false, rationale: "Konkatenering ville krevd strings, ikke ints." },
    ],
    explanation:
      "Tip: bruk keyword-args ved kall for å gjøre koden selvforklarende. `rekt(bredde=5, høyde=3)` er klarere enn `rekt(5, 3)`.",
  },
  {
    id: "d-py6-quiz-scope-local",
    kind: "quiz",
    title: "Lokal vs global scope",
    prompt: "Velg riktig output.",
    topic: "Python kap. 6",
    question: "Hva printer dette?",
    code: "x = 10\n\ndef endre():\n    x = 20\n    print(x)\n\nendre()\nprint(x)",
    language: "python",
    options: [
      { text: "20\\n10", correct: true, rationale: "Inni endre() lages en NY lokal x. Den globale x er uberørt — den er fortsatt 10 etter at funksjonen er ferdig." },
      { text: "20\\n20", correct: false, rationale: "Det ville krevd `global x` inni funksjonen." },
      { text: "10\\n10", correct: false, rationale: "Funksjonen printer sin egen lokale x = 20." },
      { text: "UnboundLocalError", correct: false, rationale: "Vi tilordner x FØR vi leser den inni funksjonen — det er gyldig." },
    ],
    explanation:
      "LEGB-regelen: Local → Enclosing → Global → Built-in. For å MODIFISERE en global, bruk `global x`. Bare lesing krever ikke deklarasjon.",
  },
  {
    id: "d-py6-quiz-args-kwargs",
    kind: "quiz",
    title: "*args og **kwargs",
    prompt: "Velg riktig output.",
    topic: "Python kap. 6",
    question: "Hva printer dette?",
    code: "def f(*args, **kwargs):\n    print(args, kwargs)\n\nf(1, 2, navn=\"Ola\")",
    language: "python",
    options: [
      { text: "(1, 2) {'navn': 'Ola'}", correct: true, rationale: "*args samler posisjonelle argumenter som tuple. **kwargs samler keyword-args som dict." },
      { text: "[1, 2] ['navn': 'Ola']", correct: false, rationale: "*args er TUPLE (ikke list). **kwargs er DICT med {} syntaks." },
      { text: "(1, 2, 'Ola') {}", correct: false, rationale: "navn=\"Ola\" er keyword-arg → går til **kwargs, ikke *args." },
      { text: "TypeError", correct: false, rationale: "Helt gyldig syntaks." },
    ],
    explanation:
      "Navnene er konvensjon — det er `*` og `**` som har betydning. Pakk opp ved kall: `f(*lst)` eller `f(**dct)`.",
  },
  {
    id: "d-py6-fill-lambda",
    kind: "fill",
    title: "Lambda — anonym funksjon",
    prompt: "Skriv lambda som dobler verdien.",
    topic: "Python kap. 6",
    template: "dobbel = __1__ x: x * 2\nprint(dobbel(5))  # 10",
    blanks: ["lambda"],
    options: ["lambda", "def", "fn", "=>", "function", "anon"],
    language: "python",
    explanation:
      "Lambda er kun ETT uttrykk — ingen statements. Brukes typisk som callback: `sorted(lst, key=lambda x: x[1])`. For komplekse funksjoner: bruk `def`.",
  },
  {
    id: "d-py6-quiz-pass-by-reference",
    kind: "quiz",
    title: "Mutabel argument — modifiseres i funksjonen?",
    prompt: "Velg riktig output.",
    topic: "Python kap. 6",
    question: "Hva printer dette?",
    code: "def legg_til(ls):\n    ls.append(99)\n\ntall = [1, 2, 3]\nlegg_til(tall)\nprint(tall)",
    language: "python",
    options: [
      { text: "[1, 2, 3, 99]", correct: true, rationale: "Lister sendes som referanse. `.append()` MUTERER originalen — endringen er synlig utenfor." },
      { text: "[1, 2, 3]", correct: false, rationale: "Det ville krevd at lister var pass-by-value (kopiert)." },
      { text: "[99]", correct: false, rationale: "append legger til, erstatter ikke." },
      { text: "[1, 2, 3, [99]]", correct: false, rationale: "append legger til 99 selv, ikke en liste med 99." },
    ],
    explanation:
      "Python: pass-by-object-reference. Ints/strings er immutable så funksjonen kan ikke endre dem. Lister/dicts er mutable — endres in-place.",
  },
  {
    id: "d-py6-fill-recursive",
    kind: "fill",
    title: "Rekursiv funksjon — faktorial",
    prompt: "Fyll inn for n!.",
    topic: "Python kap. 6",
    template:
      "def fak(n):\n    if n <= __1__:\n        return __2__\n    return n * fak(n __3__ 1)\n\nprint(fak(5))  # 120",
    blanks: ["1", "1", "-"],
    options: ["0", "1", "n", "-", "+", "*", "/"],
    language: "python",
    explanation:
      "Hver rekursiv funksjon trenger: (1) base case som stopper, (2) rekursivt steg som nærmer seg base. Glem base = uendelig rekursjon → RecursionError.",
  },
  {
    id: "d-py6-match-builtins",
    kind: "match",
    title: "Innebygde funksjoner",
    prompt: "Match funksjon til oppgave.",
    topic: "Python kap. 6",
    pairs: [
      { left: "len(x)", right: "Antall elementer (liste, string, dict, set, …)" },
      { left: "sum(iterable)", right: "Summen av alle tallene" },
      { left: "max(iterable)", right: "Største verdi" },
      { left: "min(iterable)", right: "Minste verdi" },
      { left: "sorted(iterable)", right: "Returnerer NY sortert liste" },
      { left: "type(x)", right: "Returnerer objektets type (class)" },
      { left: "isinstance(x, t)", right: "True hvis x er av type t (eller subklasse)" },
    ],
    explanation:
      "`sorted()` returnerer NY liste — `list.sort()` muterer in-place. Lær forskjellen — relevant for funksjonell stil.",
  },

  // ============= PYTHON KAP. 7 — Lister =============

  {
    id: "d-py7-match-list-methods",
    kind: "match",
    title: "Liste-metoder",
    prompt: "Match metode til effekt.",
    topic: "Python kap. 7",
    pairs: [
      { left: "lst.append(x)", right: "Legg til på slutten (in-place, O(1) amortisert)" },
      { left: "lst.insert(i, x)", right: "Sett inn på indeks i (in-place, O(n) — flytter resten)" },
      { left: "lst.remove(x)", right: "Fjern FØRSTE forekomst av x (O(n))" },
      { left: "lst.pop()", right: "Fjern OG returner siste element (O(1))" },
      { left: "lst.pop(0)", right: "Fjern OG returner FØRSTE element (O(n) — bruk deque)" },
      { left: "lst.sort()", right: "Sortér in-place — returnerer None" },
      { left: "sorted(lst)", right: "Returnerer NY sortert liste — original urørt" },
    ],
    explanation:
      "Klassisk feil: `lst = lst.sort()` setter lst til None! `.sort()` returnerer None og muterer in-place.",
  },
  {
    id: "d-py7-quiz-slice",
    kind: "quiz",
    title: "List slicing",
    prompt: "Velg riktig output.",
    topic: "Python kap. 7",
    question: "Hva er `lst[1:4]`?",
    code: "lst = [10, 20, 30, 40, 50]\nprint(lst[1:4])",
    language: "python",
    options: [
      { text: "[20, 30, 40]", correct: true, rationale: "Slice [a:b] = indeks a..b-1. Start inklusiv, slutt eksklusiv. Indeks 1,2,3 → 20,30,40." },
      { text: "[10, 20, 30]", correct: false, rationale: "Start er indeks 1 (= 20), ikke 0." },
      { text: "[20, 30, 40, 50]", correct: false, rationale: "Slutt er eksklusiv — indeks 4 (=50) ekskluderes." },
      { text: "[20, 30]", correct: false, rationale: "Slice inkluderer indeks 1, 2, 3 — totalt 3 elementer." },
    ],
    explanation:
      "Triks: tenk på indekser som «mellomrom». [a:b] tar elementene mellom posisjon a og b. Lengde alltid = b - a (når innenfor).",
  },
  {
    id: "d-py7-quiz-slice-step",
    kind: "quiz",
    title: "Slice med negativt steg",
    prompt: "Velg riktig output.",
    topic: "Python kap. 7",
    question: "Hva er `lst[::-1]`?",
    code: "lst = [1, 2, 3, 4, 5]\nprint(lst[::-1])",
    language: "python",
    options: [
      { text: "[5, 4, 3, 2, 1]", correct: true, rationale: "Slicing-syntaks [start:stop:step]. Negativt steg går baklengs — `[::-1]` reverserer hele lista." },
      { text: "[1, 2, 3, 4, 5]", correct: false, rationale: "Det er originalen — ikke reversert." },
      { text: "[-1, -2, -3, -4, -5]", correct: false, rationale: "Slice endrer ikke tallene." },
      { text: "[]", correct: false, rationale: "Slicing med [::-1] gir hele lista i revers — ikke tom." },
    ],
    explanation:
      "Idiomatisk: `lst[::-1]` for revers, `s[::-1]` reverser string. Alternativ: `reversed(lst)` (returnerer iterator).",
  },
  {
    id: "d-py7-quiz-list-copy",
    kind: "quiz",
    title: "Kopier vs referanse",
    prompt: "Velg riktig output.",
    topic: "Python kap. 7",
    question: "Hva printer dette?",
    code: "a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)",
    language: "python",
    options: [
      { text: "[1, 2, 3, 4]", correct: true, rationale: "`b = a` kopierer IKKE — bare lager nytt navn til samme liste. Mutering via b synes via a." },
      { text: "[1, 2, 3]", correct: false, rationale: "Det ville krevd `b = a.copy()` eller `b = a[:]` eller `b = list(a)`." },
      { text: "[4]", correct: false, rationale: "append legger til, erstatter ikke." },
      { text: "TypeError", correct: false, rationale: "Helt gyldig kode — bare ikke det du tror." },
    ],
    explanation:
      "For å lage en KOPI: `b = a.copy()` eller `b = a[:]` eller `b = list(a)`. For dypere kopi (med nestede lister): `import copy; b = copy.deepcopy(a)`.",
  },
  {
    id: "d-py7-fill-comprehension",
    kind: "fill",
    title: "List comprehension",
    prompt: "Lag liste med kvadratene av 0..9.",
    topic: "Python kap. 7",
    template: "kvadrater = [x __1__ 2 for x __2__ range(10)]\nprint(kvadrater)  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]",
    blanks: ["**", "in"],
    options: ["**", "*", "^", "in", "of", "from", "where"],
    language: "python",
    explanation:
      "Syntaks: `[uttrykk for var in iterable]`. Tillegg av filter: `[x for x in lst if x > 0]`. Generelt raskere enn for-løkke med append.",
  },
  {
    id: "d-py7-fill-comprehension-filter",
    kind: "fill",
    title: "Comprehension med filter",
    prompt: "Plukk ut partall fra en liste.",
    topic: "Python kap. 7",
    template: "tall = [1, 2, 3, 4, 5, 6]\npartall = [x for x in tall __1__ x __2__ 2 == 0]\nprint(partall)  # [2, 4, 6]",
    blanks: ["if", "%"],
    options: ["if", "where", "filter", "%", "/", "//", "**"],
    language: "python",
    explanation:
      "if-leddet kommer SIST. Hvis du vil ha if-else, må else komme FØR for: `[x if x > 0 else 0 for x in lst]`.",
  },
  {
    id: "d-py7-quiz-in-list",
    kind: "quiz",
    title: "in på liste — Big-O",
    prompt: "Velg riktig kompleksitet.",
    topic: "Python kap. 7",
    question: "Hva er Big-O for `x in stor_liste`?",
    options: [
      { text: "O(n) — må skanne lista lineært", correct: true, rationale: "Lister har ingen hash-struktur — Python må sjekke hvert element til den finner x eller når slutten." },
      { text: "O(1)", correct: false, rationale: "Det ville krevd en hashtabell (set/dict). Lister er ordnet sekvens." },
      { text: "O(log n)", correct: false, rationale: "Lister er ikke automatisk sorterte — binærsøk krever sortert input." },
      { text: "O(n²)", correct: false, rationale: "En enkelt `in`-test er bare ett pass gjennom lista." },
    ],
    explanation:
      "Hvis du gjør gjentatte medlemskaps-tester: konverter til set først (`s = set(lst)`). Det reduserer fra O(n²) til O(n) ved n tester.",
  },
  {
    id: "d-py7-quiz-sort-key",
    kind: "quiz",
    title: "Sortér med key",
    prompt: "Velg riktig output.",
    topic: "Python kap. 7",
    question: "Hva printer dette?",
    code: "ord = [\"banan\", \"å\", \"epler\"]\nord.sort(key=len)\nprint(ord)",
    language: "python",
    options: [
      { text: "['å', 'epler', 'banan']", correct: true, rationale: "key=len sorterer etter lengde, ikke alfabetisk. å=1, epler=5, banan=5. Stabil sortering beholder rekkefølge ved like nøkler." },
      { text: "['banan', 'epler', 'å']", correct: false, rationale: "Det er omvendt — bruk reverse=True." },
      { text: "['banan', 'å', 'epler']", correct: false, rationale: "Det er originalen, usortert." },
      { text: "['å', 'banan', 'epler']", correct: false, rationale: "epler og banan har samme lengde — stabil sortering beholder original rekkefølge." },
    ],
    explanation:
      "`key=func` brukes på hvert element før sammenligning. Vanlige eksempler: `key=str.lower`, `key=lambda x: x[1]`, `key=len`.",
  },
  {
    id: "d-py7-fill-enumerate",
    kind: "fill",
    title: "enumerate — indeks + verdi",
    prompt: "Print indeks og element side om side.",
    topic: "Python kap. 7",
    template:
      "frukt = [\"eple\", \"banan\", \"kiwi\"]\nfor __1__, navn in __2__(frukt):\n    print(i, navn)",
    blanks: ["i", "enumerate"],
    options: ["i", "x", "frukt", "len", "range", "enumerate", "zip", "iter"],
    language: "python",
    explanation:
      "`enumerate(it)` returnerer (indeks, verdi) for hvert element. Pythonsk måte å unngå manuell indeks. Default start=0, kan overstyres: `enumerate(lst, start=1)`.",
  },

  // ============= PYTHON KAP. 8 — Multidimensjonale lister =============

  {
    id: "d-py8-fill-2d-create",
    kind: "fill",
    title: "Lag en 2D-liste (rader × kolonner)",
    prompt: "Lag en 3×4 matrise fylt med nuller.",
    topic: "Python kap. 8",
    template:
      "matrise = [[0 __1__ __2__ in range(4)] __1__ __3__ in range(3)]\nprint(matrise)",
    blanks: ["for", "j", "i"],
    options: ["for", "in", "i", "j", "x", "_", "range"],
    language: "python",
    explanation:
      "FELLE: `[[0]*4] * 3` lager 3 referanser til SAMME indre liste — endrer du én, endres alle! Bruk nested comprehension som her.",
  },
  {
    id: "d-py8-quiz-shared-ref-trap",
    kind: "quiz",
    title: "Den klassiske 2D-fellen",
    prompt: "Velg riktig output.",
    topic: "Python kap. 8",
    question: "Hva printer dette?",
    code: "m = [[0] * 3] * 3\nm[0][0] = 9\nprint(m)",
    language: "python",
    options: [
      { text: "[[9, 0, 0], [9, 0, 0], [9, 0, 0]]", correct: true, rationale: "`* 3` lager 3 REFERANSER til samme indre liste. Endrer du én rad, endres alle." },
      { text: "[[9, 0, 0], [0, 0, 0], [0, 0, 0]]", correct: false, rationale: "Det ville krevd at hver rad var sin egen liste — bruk comprehension." },
      { text: "[9, 0, 0]", correct: false, rationale: "m er en 3×3-matrise, ikke en flat liste." },
      { text: "TypeError", correct: false, rationale: "Gyldig kode — bare med subtil bug." },
    ],
    explanation:
      "FIX: `m = [[0]*3 for _ in range(3)]`. Comprehension lager NY indre liste hver gang. `*` på en liste med mutables er nesten alltid feil.",
  },
  {
    id: "d-py8-fill-iterate-2d",
    kind: "fill",
    title: "Itererer over alle celler",
    prompt: "Print alle elementer i en 2D-liste.",
    topic: "Python kap. 8",
    template:
      "m = [[1, 2, 3], [4, 5, 6]]\nfor __1__ in m:\n    for __2__ in __1__:\n        print(verdi, end=\" \")",
    blanks: ["rad", "verdi"],
    options: ["rad", "verdi", "i", "j", "x", "m", "row"],
    language: "python",
    explanation:
      "Vær konsistent: ytre løkke = rad, indre = celle i rad. For (indeks_rad, indeks_kol): `for i, rad in enumerate(m): for j, v in enumerate(rad):`.",
  },
  {
    id: "d-py8-quiz-transpose",
    kind: "quiz",
    title: "Matrise-transponering",
    prompt: "Velg riktig uttrykk.",
    topic: "Python kap. 8",
    question: "Hvordan transponere matrise m (rader↔kolonner) med list comprehension?",
    options: [
      { text: "[[m[i][j] for i in range(len(m))] for j in range(len(m[0]))]", correct: true, rationale: "Bytt om i og j. Ytre løkke over j (gamle kolonner = nye rader), indre over i." },
      { text: "[[m[j][i] for i in range(len(m))] for j in range(len(m[0]))]", correct: false, rationale: "Indeksene er feil — m[j][i] med j som rad og i som kol gir originalen, ikke transponert." },
      { text: "list(zip(*m))", correct: false, rationale: "Det FUNGERER også (returnerer tuples), men spørsmålet er om comprehension-formen." },
      { text: "m[::-1]", correct: false, rationale: "Det reverserer rad-rekkefølgen, ikke transponerer." },
    ],
    explanation:
      "Idiomatisk alternativ: `list(zip(*m))` (returnerer tuples). For NumPy: `np.transpose(m)` eller `m.T`.",
  },
  {
    id: "d-py8-quiz-row-vs-col",
    kind: "quiz",
    title: "rader vs kolonner",
    prompt: "Velg riktig svar.",
    topic: "Python kap. 8",
    question: "Hvis `m = [[1, 2, 3], [4, 5, 6]]`, hva er `m[1][2]`?",
    code: "m = [[1, 2, 3], [4, 5, 6]]\nprint(m[1][2])",
    language: "python",
    options: [
      { text: "6", correct: true, rationale: "m[1] er andre rad: [4, 5, 6]. m[1][2] er tredje element der: 6." },
      { text: "3", correct: false, rationale: "Det ville vært m[0][2]." },
      { text: "5", correct: false, rationale: "Det er m[1][1]." },
      { text: "IndexError", correct: false, rationale: "Indeksene er innenfor rekkevidde." },
    ],
    explanation:
      "Konvensjon: `m[rad][kol]`. Rad først, kolonne etterpå. Antall rader = `len(m)`, antall kolonner = `len(m[0])`.",
  },
  {
    id: "d-py8-fill-row-sum",
    kind: "fill",
    title: "Sum av hver rad",
    prompt: "Returner en liste med summen per rad.",
    topic: "Python kap. 8",
    template:
      "m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\nrad_summer = [__1__(rad) __2__ rad in m]\nprint(rad_summer)  # [6, 15, 24]",
    blanks: ["sum", "for"],
    options: ["sum", "len", "max", "min", "for", "in", "if"],
    language: "python",
    explanation:
      "Comprehension over ytre liste, applisér `sum()` på hver indre. For kolonne-sum: `[sum(rad[i] for rad in m) for i in range(len(m[0]))]`.",
  },

  // ============= PYTHON KAP. 9 — Objekter og klasser =============

  {
    id: "d-py9-fill-class-init",
    kind: "fill",
    title: "Klasse med __init__",
    prompt: "Fyll inn for en Punkt-klasse.",
    topic: "Python kap. 9",
    template:
      "class Punkt:\n    def __init__(__1__, x, y):\n        __1__.x = x\n        __1__.y = y\n\np = Punkt(3, 4)\nprint(p.x, p.y)  # 3 4",
    blanks: ["self"],
    options: ["self", "this", "cls", "obj", "klasse", "x"],
    language: "python",
    explanation:
      "`self` er konvensjonen for første parameter — IKKE et reservert ord. Python sender automatisk objektet inn som første arg.",
  },
  {
    id: "d-py9-quiz-self-explicit",
    kind: "quiz",
    title: "Hvorfor 'self' eksplisitt?",
    prompt: "Velg riktig svar.",
    topic: "Python kap. 9",
    question: "Hvorfor må Python-metoder ta `self` som første parameter?",
    options: [
      { text: "For å gi metoden tilgang til instansen sine attributter", correct: true, rationale: "Uten self vet ikke metoden HVILKEN instans den jobber på. `p.metode()` blir egentlig `Klasse.metode(p)`." },
      { text: "Det er et reservert nøkkelord", correct: false, rationale: "Konvensjon, ikke reservert. Du KAN kalle den `this` — men ikke gjør det." },
      { text: "Det er gammel kode-stil — moderne Python trenger det ikke", correct: false, rationale: "Det er fortsatt standard i Python 3." },
      { text: "Bare for __init__, ikke andre metoder", correct: false, rationale: "ALLE instans-metoder må ta self som første parameter." },
    ],
    explanation:
      "«Explicit is better than implicit» — Python-design. Andre språk skjuler det (Java/C++ har implicit `this`).",
  },
  {
    id: "d-py9-fill-method",
    kind: "fill",
    title: "Instansmetode",
    prompt: "Legg til en metode som beregner avstand fra origo.",
    topic: "Python kap. 9",
    template:
      "import math\n\nclass Punkt:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    \n    def avstand_fra_origo(__1__):\n        return math.sqrt(__1__.x ** 2 + __1__.y ** 2)\n\np = Punkt(3, 4)\nprint(p.avstand_fra_origo())  # 5.0",
    blanks: ["self"],
    options: ["self", "this", "cls", "p", "x"],
    language: "python",
    explanation:
      "Alle instansmetoder må ta self som første parameter. Kalles som `p.avstand_fra_origo()` — Python sender p inn som self.",
  },
  {
    id: "d-py9-quiz-class-vs-instance-attr",
    kind: "quiz",
    title: "Klassevariabel vs instansvariabel",
    prompt: "Velg riktig output.",
    topic: "Python kap. 9",
    question: "Hva printer dette?",
    code: "class Bil:\n    antall_hjul = 4\n    def __init__(self, merke):\n        self.merke = merke\n\na = Bil(\"Volvo\")\nb = Bil(\"Toyota\")\nprint(a.antall_hjul, b.antall_hjul)",
    language: "python",
    options: [
      { text: "4 4", correct: true, rationale: "`antall_hjul` er en klassevariabel — delt mellom ALLE instanser. `merke` er instansvariabel (forskjellig per objekt)." },
      { text: "Volvo Toyota", correct: false, rationale: "Det ville vært `a.merke, b.merke`." },
      { text: "AttributeError", correct: false, rationale: "Klassevariabler er tilgjengelige via instans." },
      { text: "None None", correct: false, rationale: "Klassevariabler har faktiske verdier." },
    ],
    explanation:
      "Klassevariabel = definert i klasse-blokken, delt av alle. Instans = `self.x = ...` i __init__, unik per objekt. Klassisk feil: mutable klassevariabel (`liste = []`) deles utilsiktet.",
  },
  {
    id: "d-py9-quiz-str-method",
    kind: "quiz",
    title: "__str__ — printbar representasjon",
    prompt: "Velg riktig output.",
    topic: "Python kap. 9",
    question: "Hva printer dette?",
    code: "class Punkt:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    def __str__(self):\n        return f\"({self.x}, {self.y})\"\n\nprint(Punkt(3, 4))",
    language: "python",
    options: [
      { text: "(3, 4)", correct: true, rationale: "`print(obj)` kaller `__str__()` automatisk. Uten den får du noe som `<__main__.Punkt object at 0x...>`." },
      { text: "<Punkt object at 0x...>", correct: false, rationale: "Det er default uten __str__. Her er den definert." },
      { text: "Punkt(3, 4)", correct: false, rationale: "Det er hva __repr__ typisk gir — for utviklere." },
      { text: "3 4", correct: false, rationale: "Ikke matchet f-string." },
    ],
    explanation:
      "Dunder-metoder: __str__ for brukervennlig, __repr__ for utvikler (debug), __eq__ for ==, __len__ for len(), __add__ for +.",
  },
  {
    id: "d-py9-match-encapsulation",
    kind: "match",
    title: "Innkapsling — navnekonvensjoner",
    prompt: "Match prefiks til betydning.",
    topic: "Python kap. 9",
    pairs: [
      { left: "self.navn", right: "Offentlig — ment til ekstern bruk" },
      { left: "self._navn", right: "Internt — konvensjon for «private», men teknisk tilgjengelig" },
      { left: "self.__navn", right: "Name mangling — Python bytter til _Klasse__navn for å hindre overskriving" },
      { left: "self.__navn__", right: "Dunder — reservert for Pythons eget bruk (magic methods)" },
    ],
    explanation:
      "Python har INGEN ekte private. _x er æressak («ikke rør»). __x er name-mangled (ikke ekte privat). __x__ er reservert.",
  },
  {
    id: "d-py9-quiz-equality",
    kind: "quiz",
    title: "Likhet på objekter",
    prompt: "Velg riktig output.",
    topic: "Python kap. 9",
    question: "Hva printer dette (uten __eq__ implementert)?",
    code: "class P:\n    def __init__(self, x):\n        self.x = x\n\nprint(P(5) == P(5))",
    language: "python",
    options: [
      { text: "False — uten __eq__ sammenligner Python objekt-identitet (samme adresse)", correct: true, rationale: "To nyopprettede objekter har forskjellig minneadresse, så de er IKKE «samme» selv om de har samme attributter." },
      { text: "True — Python sammenligner attributter automatisk", correct: false, rationale: "Du må definere __eq__ for det. Klassisk forventnings-vs-virkelighet-felle." },
      { text: "TypeError", correct: false, rationale: "== er alltid lov på objekter — bare default-implementasjonen er identitet." },
      { text: "None", correct: false, rationale: "== returnerer alltid bool." },
    ],
    explanation:
      "For å sammenligne på innhold: implementer `__eq__(self, other)` som returnerer `self.x == other.x`. Husk `__hash__` hvis objektet skal i set/dict.",
  },
  {
    id: "d-py9-fill-property",
    kind: "fill",
    title: "@property — getter",
    prompt: "Fyll inn for et beregnet attributt.",
    topic: "Python kap. 9",
    template:
      "class Sirkel:\n    def __init__(self, r):\n        self.r = r\n    \n    @__1__\n    def areal(__2__):\n        return 3.14 * __2__.r ** 2\n\nc = Sirkel(2)\nprint(c.areal)  # 12.56 — kalles UTEN ()",
    blanks: ["property", "self"],
    options: ["property", "staticmethod", "classmethod", "self", "this", "cls"],
    language: "python",
    explanation:
      "@property lar deg lese metoden som om det var et attributt — uten paranteser. Nyttig for beregnede verdier. Kombiner med @ x.setter for skriving.",
  },

  // ============= PYTHON KAP. 12 — Arv og polymorfisme =============

  {
    id: "d-py12-fill-inheritance",
    kind: "fill",
    title: "Arv — utvid en klasse",
    prompt: "La Hund arve fra Dyr.",
    topic: "Python kap. 12",
    template:
      "class Dyr:\n    def __init__(self, navn):\n        self.navn = navn\n    def lyd(self):\n        return \"...\"\n\nclass Hund__1__:\n    def lyd(__2__):\n        return \"voff\"\n\nh = Hund(\"Rex\")\nprint(h.navn, h.lyd())  # Rex voff",
    blanks: ["(Dyr)", "self"],
    options: ["(Dyr)", "(Dyr.__init__)", "extends Dyr", ": Dyr", "self", "this", "cls"],
    language: "python",
    explanation:
      "Syntaks: `class Sub(Super):`. Sub arver alle metoder og attributter. Overriding: bare definer på nytt i sub.",
  },
  {
    id: "d-py12-quiz-super",
    kind: "quiz",
    title: "super() — kall superklassens __init__",
    prompt: "Velg riktig output.",
    topic: "Python kap. 12",
    question: "Hva printer dette?",
    code: "class Dyr:\n    def __init__(self, navn):\n        self.navn = navn\n\nclass Hund(Dyr):\n    def __init__(self, navn, rase):\n        super().__init__(navn)\n        self.rase = rase\n\nh = Hund(\"Rex\", \"Labrador\")\nprint(h.navn, h.rase)",
    language: "python",
    options: [
      { text: "Rex Labrador", correct: true, rationale: "super().__init__(navn) kjører Dyr.__init__ som setter self.navn. Så setter Hund.__init__ self.rase." },
      { text: "None Labrador", correct: false, rationale: "super().__init__ KJØRER faktisk — det er ikke en no-op." },
      { text: "AttributeError", correct: false, rationale: "Begge attributter blir riktig satt." },
      { text: "Rex Rex", correct: false, rationale: "rase settes til \"Labrador\", ikke navn." },
    ],
    explanation:
      "Alltid kall super().__init__() i subklasse-init hvis superklasse har viktige init-handlinger. Ellers ender du opp uten basis-attributter.",
  },
  {
    id: "d-py12-quiz-isinstance",
    kind: "quiz",
    title: "isinstance vs type",
    prompt: "Velg riktig output.",
    topic: "Python kap. 12",
    question: "Hva printer dette?",
    code: "class A: pass\nclass B(A): pass\n\nb = B()\nprint(isinstance(b, A), type(b) == A)",
    language: "python",
    options: [
      { text: "True False", correct: true, rationale: "isinstance() tar arv i betraktning — b ER en A (via B). type() == sjekker eksakt type — b er B, ikke A." },
      { text: "True True", correct: false, rationale: "type() er strikt — vurderer ikke arv." },
      { text: "False False", correct: false, rationale: "isinstance regner med arv: B er subklasse av A." },
      { text: "False True", correct: false, rationale: "Motsatt — isinstance er den «smarte», type er den strenge." },
    ],
    explanation:
      "Bruk `isinstance(x, T)` for polymorfisme-vennlig typesjekk. `type(x) == T` er sjelden riktig — bryter arv.",
  },
  {
    id: "d-py12-quiz-polymorphism",
    kind: "quiz",
    title: "Polymorfisme",
    prompt: "Velg riktig output.",
    topic: "Python kap. 12",
    question: "Hva printer denne løkken?",
    code: "class Dyr:\n    def lyd(self):\n        return \"...\"\n\nclass Hund(Dyr):\n    def lyd(self):\n        return \"voff\"\n\nclass Katt(Dyr):\n    def lyd(self):\n        return \"mjau\"\n\nfor d in [Hund(), Katt(), Dyr()]:\n    print(d.lyd(), end=\" \")",
    language: "python",
    options: [
      { text: "voff mjau ...", correct: true, rationale: "Hver instans bruker SIN egen lyd()-metode. Hund overrider, Katt overrider, Dyr beholder default. Polymorfisme i praksis." },
      { text: "... ... ...", correct: false, rationale: "Det ville krevd at alle brukte basisklassens lyd(). Override betyr at sub erstatter." },
      { text: "voff voff voff", correct: false, rationale: "Hver klasse har sin egen metode." },
      { text: "TypeError", correct: false, rationale: "Helt gyldig — det er hele poenget med polymorfisme." },
    ],
    explanation:
      "Polymorfisme: samme grensesnitt (`d.lyd()`), ulik implementasjon. Klient-koden bryr seg ikke om eksakt type — bare at metoden finnes.",
  },
  {
    id: "d-py12-match-dunder",
    kind: "match",
    title: "Magic methods (dunder)",
    prompt: "Match dunder til hva den styrer.",
    topic: "Python kap. 12",
    pairs: [
      { left: "__init__", right: "Konstruktør — kalles når objekt opprettes" },
      { left: "__str__", right: "Brukervennlig string — kalles av print() og str()" },
      { left: "__repr__", right: "Utvikler-string — kalles i REPL og av repr()" },
      { left: "__eq__", right: "Bestemmer hva == returnerer" },
      { left: "__len__", right: "Bestemmer hva len() returnerer" },
      { left: "__add__", right: "Bestemmer hva + gjør" },
      { left: "__getitem__", right: "Bestemmer hva obj[k] gjør (indeksering)" },
    ],
    explanation:
      "Dunder = «double underscore». Lar deg gi egne klasser samme syntaks som innebygde typer — Pythons versjon av operator overloading.",
  },
  {
    id: "d-py12-quiz-override-call-super",
    kind: "quiz",
    title: "Override som utvider basis",
    prompt: "Velg riktig output.",
    topic: "Python kap. 12",
    question: "Hva printer dette?",
    code: "class A:\n    def hilsen(self):\n        return \"Hei fra A\"\n\nclass B(A):\n    def hilsen(self):\n        return super().hilsen() + \" og B\"\n\nprint(B().hilsen())",
    language: "python",
    options: [
      { text: "Hei fra A og B", correct: true, rationale: "super().hilsen() kaller A sin versjon, så legger B til sitt eget tillegg. Klassisk «utvid, ikke erstatt»-mønster." },
      { text: "Hei fra A", correct: false, rationale: "B har sin egen hilsen()." },
      { text: "Hei fra B", correct: false, rationale: "Sjekk linje for linje — B bygger på A sin output." },
      { text: "RecursionError", correct: false, rationale: "super() peker oppover til A, ikke tilbake til B." },
    ],
    explanation:
      "Common pattern: subklasse vil ofte UTVIDE (ikke bytte ut) basis. Kalle super().metode() henter forelderens versjon.",
  },

  // ============= PYTHON KAP. 13 — Filer og exception handling =============

  {
    id: "d-py13-fill-read-file",
    kind: "fill",
    title: "Les fil med 'with'",
    prompt: "Les hele filen som én streng.",
    topic: "Python kap. 13",
    template:
      "__1__ open(\"data.txt\", \"__2__\") __3__ f:\n    innhold = f.read()\nprint(innhold)",
    blanks: ["with", "r", "as"],
    options: ["with", "open", "using", "r", "w", "rb", "as", "into", "to"],
    language: "python",
    explanation:
      "`with` lukker filen automatisk — selv ved exception. Modus: 'r' lese, 'w' skrive (overskriver), 'a' append, 'rb' binær.",
  },
  {
    id: "d-py13-match-file-modes",
    kind: "match",
    title: "Filmoder",
    prompt: "Match modus til atferd.",
    topic: "Python kap. 13",
    pairs: [
      { left: "\"r\"", right: "Les (default) — feiler hvis filen ikke finnes" },
      { left: "\"w\"", right: "Skriv — OVERSKRIVER hvis filen finnes, lager hvis ikke" },
      { left: "\"a\"", right: "Append — legg til på slutten, behold eksisterende" },
      { left: "\"x\"", right: "Eksklusiv create — feiler hvis filen allerede finnes" },
      { left: "\"rb\"", right: "Binær lesing — for bilder, pdf, andre ikke-tekst" },
      { left: "\"r+\"", right: "Lese OG skrive — fil må eksistere" },
    ],
    explanation:
      "Vanlig felle: åpne med \"w\" når du ville hatt \"a\" — wipes out hele innholdet. Sjekk modus før test-kjøring.",
  },
  {
    id: "d-py13-fill-try-except",
    kind: "fill",
    title: "try/except — fang feil",
    prompt: "Fyll inn for å håndtere divisjon med null.",
    topic: "Python kap. 13",
    template:
      "__1__:\n    x = int(input(\"Tall? \"))\n    print(10 / x)\n__2__ ZeroDivisionError:\n    print(\"Kan ikke dele på null\")\n__2__ ValueError:\n    print(\"Skriv et tall, ikke tekst\")",
    blanks: ["try", "except"],
    options: ["try", "except", "catch", "throw", "raise", "finally"],
    language: "python",
    explanation:
      "Mønster: try fanger, except matcher én eksepsjon-type. Spesifikke unntak FØR generelle. `except:` uten type fanger ALT (inkl. KeyboardInterrupt) — unngå.",
  },
  {
    id: "d-py13-match-error-types",
    kind: "match",
    title: "Vanlige Python-unntak",
    prompt: "Match unntak til typisk årsak.",
    topic: "Python kap. 13",
    pairs: [
      { left: "ZeroDivisionError", right: "x / 0" },
      { left: "ValueError", right: "int(\"abc\") — gyldig type, ugyldig verdi" },
      { left: "TypeError", right: "\"a\" + 1 — feil type" },
      { left: "IndexError", right: "lst[100] når len(lst) = 5" },
      { left: "KeyError", right: "dct[\"finnes_ikke\"]" },
      { left: "FileNotFoundError", right: "open(\"finnes_ikke.txt\")" },
      { left: "AttributeError", right: "obj.metode_som_ikke_finnes()" },
    ],
    explanation:
      "Fang spesifikke unntak — ikke `except:`. Hvis du må fange alt: `except Exception as e:` (utelater KeyboardInterrupt, SystemExit).",
  },
  {
    id: "d-py13-quiz-try-finally",
    kind: "quiz",
    title: "try/finally — kjører finally alltid?",
    prompt: "Velg riktig output.",
    topic: "Python kap. 13",
    question: "Hva printer dette?",
    code: "try:\n    print(\"A\")\n    raise ValueError(\"oops\")\n    print(\"B\")\nexcept ValueError:\n    print(\"C\")\nfinally:\n    print(\"D\")",
    language: "python",
    options: [
      { text: "A C D", correct: true, rationale: "A printes, raise hopper til except → C, finally kjører UANSETT → D. B printes aldri." },
      { text: "A B C D", correct: false, rationale: "B printes ikke — raise hopper over." },
      { text: "A D", correct: false, rationale: "except matcher ValueError → C printes også." },
      { text: "C D", correct: false, rationale: "A printes før raise." },
    ],
    explanation:
      "finally kjører ALLTID — uansett om try ble ferdig, raised, eller returnerte. Brukes til opprydding (lukke fil, frigjøre lås). `with` er ofte bedre.",
  },
  {
    id: "d-py13-fill-raise",
    kind: "fill",
    title: "raise — kast eget unntak",
    prompt: "Kast ValueError hvis input er negativ.",
    topic: "Python kap. 13",
    template:
      "def kvadrat_av_positiv(x):\n    if x < 0:\n        __1__ ValueError(\"x må være ikke-negativ\")\n    return x ** 0.5\n\nprint(kvadrat_av_positiv(-4))",
    blanks: ["raise"],
    options: ["raise", "throw", "return", "yield", "error", "panic"],
    language: "python",
    explanation:
      "`raise <Exception>(<melding>)`. Velg riktig exception-klasse: ValueError for ugyldig verdi, TypeError for feil type, custom for domenefeil.",
  },
  {
    id: "d-py13-fill-custom-exception",
    kind: "fill",
    title: "Egen exception-klasse",
    prompt: "Lag en exception for en bankkonto.",
    topic: "Python kap. 13",
    template:
      "class IkkeNokSaldo(__1__):\n    pass\n\nclass Konto:\n    def __init__(self, saldo):\n        self.saldo = saldo\n    def ta_ut(self, belop):\n        if belop > self.saldo:\n            __2__ IkkeNokSaldo(f\"Mangler {belop - self.saldo}\")\n        self.saldo -= belop",
    blanks: ["Exception", "raise"],
    options: ["Exception", "Error", "BaseException", "raise", "throw", "return"],
    language: "python",
    explanation:
      "Arv fra Exception (ikke BaseException — den fanger KeyboardInterrupt og lignende). Custom exceptions gir domene-spesifikk feilhåndtering.",
  },

  // ============= PYTHON KAP. 14 — Tuples, sets, dictionaries =============

  {
    id: "d-py14-quiz-tuple-immut",
    kind: "quiz",
    title: "Tupler er uforanderlige",
    prompt: "Velg riktig output.",
    topic: "Python kap. 14",
    question: "Hva skjer?",
    code: "t = (1, 2, 3)\nt[0] = 99\nprint(t)",
    language: "python",
    options: [
      { text: "TypeError — tuples er immutable", correct: true, rationale: "Tupler kan IKKE endres etter opprettelse. Bruk liste hvis du trenger mutering." },
      { text: "(99, 2, 3)", correct: false, rationale: "Tupler er ikke som lister — du kan ikke skrive til indeks." },
      { text: "(1, 2, 3)", correct: false, rationale: "Tilordningen krasjer FØR print, så vi ser TypeError ikke print." },
      { text: "[99, 2, 3]", correct: false, rationale: "Det ville vært liste-syntaks. t er tuple — uansett." },
    ],
    explanation:
      "Tupler = uforanderlige sekvenser. Brukes som dict-keys (hashbare), return av flere verdier, faste records. Liste når du trenger mutering.",
  },
  {
    id: "d-py14-match-set-ops",
    kind: "match",
    title: "Mengde-operasjoner (sets)",
    prompt: "Match operator til mengdeoperasjon.",
    topic: "Python kap. 14",
    pairs: [
      { left: "a | b", right: "Union — elementer i a eller b (eller begge)" },
      { left: "a & b", right: "Snitt — elementer som er i BÅDE a og b" },
      { left: "a - b", right: "Differanse — i a men IKKE i b" },
      { left: "a ^ b", right: "Symmetrisk differanse — i a eller b, men ikke begge" },
      { left: "a <= b", right: "Delmengde — er alle elementer i a også i b?" },
      { left: "x in a", right: "Medlemskap — er x i a? (O(1) snitt)" },
    ],
    explanation:
      "Sets bruker hash → medlemskap er O(1) snitt. Praktisk for å fjerne duplikater: `set(lst)`. Setter er UORDNET — bruk list hvis rekkefølgen betyr noe.",
  },
  {
    id: "d-py14-quiz-dict-access",
    kind: "quiz",
    title: "Dict — tilgang og default",
    prompt: "Velg riktig output.",
    topic: "Python kap. 14",
    question: "Hva skjer ved oppslag på en nøkkel som ikke finnes?",
    code: "d = {\"a\": 1, \"b\": 2}\nprint(d[\"c\"])",
    language: "python",
    options: [
      { text: "KeyError — nøkkelen finnes ikke", correct: true, rationale: "Direkte indeks-tilgang krasjer ved manglende nøkkel. Bruk `.get(\"c\", default)` for å unngå." },
      { text: "None", correct: false, rationale: "`d.get(\"c\")` gir None. `d[\"c\"]` krasjer." },
      { text: "0", correct: false, rationale: "Ingen automatisk default. Hvis du vil ha det: `defaultdict(int)`." },
      { text: "False", correct: false, rationale: "Ikke et bool — ingen tilbakefallsverdi." },
    ],
    explanation:
      "Tre alternativer: (1) `d[\"c\"]` — krasjer, (2) `d.get(\"c\")` → None, (3) `d.get(\"c\", 0)` → 0. Velg ut fra om manglende nøkkel er en feil eller forventet.",
  },
  {
    id: "d-py14-fill-dict-comp",
    kind: "fill",
    title: "Dict comprehension",
    prompt: "Lag dict {0:0, 1:1, 2:4, 3:9, ...} for 0..9.",
    topic: "Python kap. 14",
    template: "kvadrater = {x: x __1__ 2 __2__ x in range(10)}\nprint(kvadrater[5])  # 25",
    blanks: ["**", "for"],
    options: ["**", "*", "^", "for", "in", "if"],
    language: "python",
    explanation:
      "Dict comprehension: `{key_uttrykk: value_uttrykk for var in iterable}`. Sett comprehension: bare `{x for x ...}` (uten kolon).",
  },
  {
    id: "d-py14-quiz-dict-iter",
    kind: "quiz",
    title: "Itererer over en dict",
    prompt: "Velg riktig output.",
    topic: "Python kap. 14",
    question: "Hva printer dette?",
    code: "d = {\"a\": 1, \"b\": 2}\nfor k in d:\n    print(k, end=\" \")",
    language: "python",
    options: [
      { text: "a b", correct: true, rationale: "Iterere over dict gir NØKLENE som default. Bruk `.items()` for (nøkkel, verdi)-par." },
      { text: "1 2", correct: false, rationale: "Det ville krevd `.values()`." },
      { text: "('a', 1) ('b', 2)", correct: false, rationale: "Det krever `.items()`." },
      { text: "a 1 b 2", correct: false, rationale: "Default iter gir bare nøkler, ikke verdier også." },
    ],
    explanation:
      "Tre måter: `for k in d` (nøkler), `for v in d.values()`, `for k, v in d.items()`. Bruk den siste når du trenger begge.",
  },
  {
    id: "d-py14-fill-counter",
    kind: "fill",
    title: "Tellemønster med dict",
    prompt: "Tell forekomst av hvert tegn.",
    topic: "Python kap. 14",
    template:
      "telling = {}\nfor c in \"banana\":\n    telling[c] = telling.__1__(c, __2__) + 1\nprint(telling)  # {'b': 1, 'a': 3, 'n': 2}",
    blanks: ["get", "0"],
    options: ["get", "find", "pop", "0", "1", "None"],
    language: "python",
    explanation:
      "`.get(k, 0)` returnerer 0 hvis nøkkelen mangler — perfekt for inkrementering. Alternativ: `from collections import Counter; Counter(\"banana\")`.",
  },
  {
    id: "d-py14-quiz-tuple-unpack",
    kind: "quiz",
    title: "Tuple-unpacking",
    prompt: "Velg riktig output.",
    topic: "Python kap. 14",
    question: "Hva printer dette?",
    code: "def min_max(lst):\n    return min(lst), max(lst)\n\nmn, mx = min_max([3, 1, 4, 1, 5, 9])\nprint(mn, mx)",
    language: "python",
    options: [
      { text: "1 9", correct: true, rationale: "Funksjonen returnerer tuple (1, 9). Tuple-unpacking deler ut i to variabler." },
      { text: "(1, 9)", correct: false, rationale: "Det ville vært om vi printet hele resultatet — men vi printer separate variabler." },
      { text: "TypeError", correct: false, rationale: "Helt gyldig Python — vanlig mønster for «returner flere verdier»." },
      { text: "[1, 9]", correct: false, rationale: "Det er liste-syntaks — funksjonen returnerer tuple." },
    ],
    explanation:
      "Tuple-unpacking er hvordan «flere returverdier» fungerer i Python. Egentlig én tuple, deretter unpacking. Også for swap: `a, b = b, a`.",
  },

  // ============= PYTHON KAP. 19 — Binære søketrær (BST) =============

  {
    id: "d-py19-quiz-bst-property",
    kind: "quiz",
    title: "BST-invarianten",
    prompt: "Velg riktig regel.",
    topic: "Python kap. 19",
    question: "Hva er BST-invarianten for en node n?",
    options: [
      { text: "Alle nøkler i venstre undertre < n.key, og alle nøkler i høyre undertre > n.key", correct: true, rationale: "Klassisk BST-regel. Gjelder REKURSIVT — ikke bare for direkte barn." },
      { text: "Venstre barn < n.key < høyre barn (bare direkte barn teller)", correct: false, rationale: "Det er BST som tre med dyp 2. Hele undertreet må respektere regelen rekursivt." },
      { text: "Alle nivåer har samme antall noder", correct: false, rationale: "Det er en komplett binær tre, ikke BST. BST kan være ubalansert." },
      { text: "Roten er minste verdi", correct: false, rationale: "Minste verdi finnes lengst til VENSTRE (følg .left ned). Roten er bare … roten." },
    ],
    explanation:
      "In-order traversering av BST gir sortert rekkefølge — det er BSTs «hovedtriks». Brukes ofte til å verifisere at et tre faktisk er en BST.",
  },
  {
    id: "d-py19-fill-bst-search",
    kind: "fill",
    title: "BST-søk (rekursiv)",
    prompt: "Fyll inn for å søke etter target.",
    topic: "Python kap. 19",
    template:
      "def søk(node, mål):\n    if node is None:\n        return False\n    if mål == node.key:\n        return True\n    if mål < node.key:\n        return søk(node.__1__, mål)\n    return søk(node.__2__, mål)",
    blanks: ["left", "right"],
    options: ["left", "right", "parent", "next", "child"],
    language: "python",
    explanation:
      "Hvert sprang halverer (ideelt) søkeområdet → O(log n) for balansert BST. Ubalansert BST kan degenerere til O(n) (kjede).",
  },
  {
    id: "d-py19-match-traversal",
    kind: "match",
    title: "Tre-traverseringer",
    prompt: "Match traversering til rekkefølge.",
    topic: "Python kap. 19",
    pairs: [
      { left: "In-order (LNR)", right: "Venstre, node, høyre — gir SORTERT rekkefølge i BST" },
      { left: "Pre-order (NLR)", right: "Node, venstre, høyre — egnet for å lage kopi av treet" },
      { left: "Post-order (LRN)", right: "Venstre, høyre, node — egnet for å slette treet" },
      { left: "Level-order / BFS", right: "Nivå for nivå (bredde først) — krever kø, ikke rekursjon" },
    ],
    explanation:
      "DFS-variantene (in/pre/post) bruker rekursjon eller stack. BFS bruker kø. Velg ut fra problem: trenger du sortert? in-order. Hele nivåer? BFS.",
  },
  {
    id: "d-py19-quiz-traversal-output",
    kind: "quiz",
    title: "In-order av lite BST",
    prompt: "Velg riktig output.",
    topic: "Python kap. 19",
    question: "Gitt et BST hvor 5 er rot, 3 er venstre barn, 7 er høyre barn, 1 er venstre barn av 3. Hva er in-order?",
    options: [
      { text: "1 3 5 7", correct: true, rationale: "In-order: V-N-H rekursivt. Ned til 1 (lengst v), så 3, så 5 (rot), så 7. Resultat = sortert." },
      { text: "5 3 1 7", correct: false, rationale: "Det er pre-order (N-V-H)." },
      { text: "1 3 7 5", correct: false, rationale: "Det er post-order (V-H-N): 1, 3, 7, 5." },
      { text: "5 3 7 1", correct: false, rationale: "Det ville vært level-order (BFS): 5, så 3,7, så 1." },
    ],
    explanation:
      "Memo: in-order = sortert. Hvis et BST ikke gir sortert i in-order → ikke et gyldig BST.",
  },
  {
    id: "d-py19-order-bst-insert-steps",
    kind: "order",
    title: "Sortér BST-insert-stegene",
    prompt: "Sett stegene i riktig rekkefølge for å sette inn en ny nøkkel.",
    topic: "Python kap. 19",
    items: [
      "Hvis treet er tomt: sett ny node som rot, ferdig",
      "Start på roten",
      "Sammenlign ny nøkkel med current.key",
      "Hvis mindre: gå venstre (eller plasser her hvis venstre = None)",
      "Hvis større: gå høyre (eller plasser her hvis høyre = None)",
      "Hvis lik: enten ignorer eller behandle dupliserings-policy",
    ],
    explanation:
      "Standard BST-insert er O(høyde). Ubalansert: O(n). Balansert (AVL/red-black/treap): O(log n) garantert.",
  },

  // ============= PYTHON KAP. 21 — Hashing =============

  {
    id: "d-py21-quiz-hash-purpose",
    kind: "quiz",
    title: "Hva er en hash-funksjon?",
    prompt: "Velg riktig svar.",
    topic: "Python kap. 21",
    question: "Hva er primær-egenskapen til en hash-funksjon brukt i hash-tabeller?",
    options: [
      { text: "Avbilder en nøkkel til en heltall-indeks, deterministisk og raskt", correct: true, rationale: "Brukes til å finne riktig «bucket». Samme input → samme output. Bør spre uniformt for å unngå klustering." },
      { text: "Krypterer nøkkelen så den ikke kan reverseres", correct: false, rationale: "Det er KRYPTOGRAFISK hashing (SHA-256). Hash-tabell-hashing er IKKE krypto-sikker." },
      { text: "Sorterer nøkler alfabetisk", correct: false, rationale: "Sortering har ingenting med hashing å gjøre." },
      { text: "Komprimerer data for lagring", correct: false, rationale: "Hash er en indeks, ikke en komprimering." },
    ],
    explanation:
      "Krav: deterministisk, rask, uniform distribusjon. Python hash() er en NON-KRYPTOGRAFISK hash som randomiseres mellom kjøringer (`PYTHONHASHSEED`).",
  },
  {
    id: "d-py21-quiz-collision",
    kind: "quiz",
    title: "Hva er en hash-kollisjon?",
    prompt: "Velg riktig svar.",
    topic: "Python kap. 21",
    question: "Hva betyr «kollisjon» i en hash-tabell?",
    options: [
      { text: "To FORSKJELLIGE nøkler hasher til SAMME bucket", correct: true, rationale: "Uunngåelig hvis vi har flere mulige nøkler enn buckets. Må håndteres med chaining eller open addressing." },
      { text: "To programmer som leser samme fil", correct: false, rationale: "Det er race condition / lock contention — ikke hashing." },
      { text: "En nøkkel som ikke finnes", correct: false, rationale: "Det er en miss, ikke kollisjon." },
      { text: "Hash-tabellen er full", correct: false, rationale: "Det er «overflow» — kan utløse rehashing, men er ikke kollisjon." },
    ],
    explanation:
      "Pigeonhole-prinsippet: hvis vi mapper uendelig mange nøkler til endelig mange buckets, MÅ vi få kollisjoner. Spørsmålet er bare HVOR ofte og hvordan vi håndterer det.",
  },
  {
    id: "d-py21-match-collision-handling",
    kind: "match",
    title: "Kollisjons-håndtering",
    prompt: "Match strategi til mekanisme.",
    topic: "Python kap. 21",
    pairs: [
      { left: "Separate chaining", right: "Hver bucket inneholder en liste — kollisjoner appendes til lista" },
      { left: "Linear probing", right: "Ved kollisjon: prøv bucket i+1, i+2, … til en tom finnes" },
      { left: "Quadratic probing", right: "Ved kollisjon: prøv bucket i+1², i+2², i+3², … (reduserer klustering)" },
      { left: "Double hashing", right: "Ved kollisjon: bruk en ANNEN hash-funksjon for å bestemme steg" },
    ],
    explanation:
      "Chaining brukes av Python dict/set. Open addressing (probing) brukes av Java HashMap (lenger). Trade-off: probing er cache-vennlig, chaining håndterer høy load-faktor bedre.",
  },
  {
    id: "d-py21-quiz-load-factor",
    kind: "quiz",
    title: "Load-faktor",
    prompt: "Velg riktig definisjon.",
    topic: "Python kap. 21",
    question: "Hva er load-faktoren α i en hash-tabell?",
    options: [
      { text: "antall elementer / antall buckets", correct: true, rationale: "Måler hvor «full» tabellen er. Python rehasher når α > ~2/3 (open addressing). Stor α → flere kollisjoner." },
      { text: "Maksimum kjededybde i en bucket", correct: false, rationale: "Det er kollisjons-statistikk, ikke load-faktoren." },
      { text: "Antall hash-funksjoner brukt", correct: false, rationale: "Vanligvis bare én primær hash." },
      { text: "Tid det tar å rehashe", correct: false, rationale: "Det er en KONSEKVENS, ikke definisjonen." },
    ],
    explanation:
      "Når α blir for høy: rehash (dobl buckets, beregn alle hash på nytt). O(n) operasjon, men sjelden — amortisert O(1) per insert.",
  },
  {
    id: "d-py21-quiz-hashable",
    kind: "quiz",
    title: "Hva er hashbart i Python?",
    prompt: "Velg riktig svar.",
    topic: "Python kap. 21",
    question: "Hvilket av disse kan IKKE brukes som dict-key?",
    options: [
      { text: "list", correct: true, rationale: "Lister er MUTABLE — hash kunne endret seg mens objektet er i tabellen. Python forbyr det." },
      { text: "tuple", correct: false, rationale: "Immutable — hashbar (forutsatt at INNHOLDET også er hashbart)." },
      { text: "str", correct: false, rationale: "Immutable — hashbar." },
      { text: "int", correct: false, rationale: "Immutable — hashbar. hash(n) = n for små heltall." },
    ],
    explanation:
      "Regel: mutable objekter er IKKE hashbare (lister, sets, dicts). Immutable er hashbare (ints, floats, strs, tuples-med-immutable-innhold, frozensets).",
  },

  // ============= PYTHON KAP. 22 — Grafer og applikasjoner (BFS/DFS) =============

  {
    id: "d-py22-match-graph-rep",
    kind: "match",
    title: "Graf-representasjoner",
    prompt: "Match representasjon til egenskap.",
    topic: "Python kap. 22",
    pairs: [
      { left: "Naboliste (dict of lists)", right: "Plass O(V+E) — bra for sparse grafer (få kanter)" },
      { left: "Nabomatrise (2D-array)", right: "Plass O(V²) — bra for dense grafer, O(1) kant-oppslag" },
      { left: "Kant-liste (liste av (u,v)-par)", right: "Plass O(E) — kompakt, men dyrt å finne naboer" },
    ],
    explanation:
      "Praktisk: 99% av tilfellene → naboliste. Bytt til matrise bare hvis E ≈ V² eller du gjør massive «finnes kanten u→v?»-spørringer.",
  },
  {
    id: "d-py22-quiz-bfs-property",
    kind: "quiz",
    title: "Hva garanterer BFS?",
    prompt: "Velg riktig egenskap.",
    topic: "Python kap. 22",
    question: "Hva er hovedgarantien til BFS i en uvektet graf?",
    options: [
      { text: "Finner korteste vei (færrest kanter) fra start til alle andre noder", correct: true, rationale: "BFS besøker noder nivå for nivå. Første gang du når en node er via færrest mulig kanter." },
      { text: "Finner korteste vei i en VEKTET graf", correct: false, rationale: "Det krever Dijkstra. BFS ignorerer kantvekter — kun «antall hopp»." },
      { text: "Sorterer noder etter ID", correct: false, rationale: "BFS er ikke sortering." },
      { text: "Finner alle sykluser", correct: false, rationale: "BFS finner én vei. Syklusdeteksjon er en separat applikasjon." },
    ],
    explanation:
      "Datastruktur for BFS: KØ (FIFO). For DFS: STACK (eller rekursjon). Bytte av datastruktur er den eneste forskjellen.",
  },
  {
    id: "d-py22-order-bfs-steps",
    kind: "order",
    title: "Sortér BFS-stegene",
    prompt: "Sett stegene i riktig rekkefølge.",
    topic: "Python kap. 22",
    items: [
      "Putt startnoden i køen og marker som besøkt",
      "Hent neste node fra køen",
      "For hver nabo av denne noden …",
      "… hvis ikke besøkt: marker som besøkt og legg i køen",
      "Når køen er tom: ferdig",
    ],
    explanation:
      "Nøkkel: marker «besøkt» NÅR DU LEGGER I KØEN, ikke når du tar ut. Ellers kan samme node havne i køen flere ganger.",
  },
  {
    id: "d-py22-fill-bfs",
    kind: "fill",
    title: "BFS — fyll inn",
    prompt: "Fyll inn datastrukturen og operasjonen.",
    topic: "Python kap. 22",
    template:
      "from collections import __1__\n\ndef bfs(graf, start):\n    besøkt = {start}\n    kø = __1__([start])\n    while kø:\n        v = kø.__2__()\n        for u in graf[v]:\n            if u not in besøkt:\n                besøkt.add(u)\n                kø.append(u)\n    return besøkt",
    blanks: ["deque", "popleft"],
    options: ["deque", "list", "queue", "stack", "popleft", "pop", "append", "remove"],
    language: "python",
    explanation:
      "BFS = FIFO = popleft(). DFS = LIFO = pop() (eller rekursjon). Bruker deque fordi list.pop(0) er O(n). For DFS er list helt fint.",
  },
  {
    id: "d-py22-quiz-dfs-recursive",
    kind: "quiz",
    title: "Rekursiv DFS",
    prompt: "Velg riktig output for traverserings-rekkefølgen.",
    topic: "Python kap. 22",
    question: "Gitt graf {A:[B,C], B:[D], C:[], D:[]} og start på A, hvilken DFS-rekkefølge er mulig?",
    code: "def dfs(g, v, besøkt=None):\n    if besøkt is None: besøkt = []\n    besøkt.append(v)\n    for n in g[v]:\n        if n not in besøkt:\n            dfs(g, n, besøkt)\n    return besøkt",
    language: "python",
    options: [
      { text: "A B D C", correct: true, rationale: "A → B (første nabo) → D (B sin nabo) → tilbake → C (A sin neste nabo)." },
      { text: "A C B D", correct: false, rationale: "Først nabo til A er B (rekkefølge i adj-liste matters)." },
      { text: "A B C D", correct: false, rationale: "Det er BFS-aktig. DFS går dypt FØR bredt." },
      { text: "D B C A", correct: false, rationale: "Det er post-order — den koden bruker pre-order." },
    ],
    explanation:
      "DFS-rekkefølgen avhenger av (1) hvor du starter, (2) rekkefølgen i naboliste, (3) pre/post-order. Vanlig feil: glemme «not in besøkt» → uendelig rekursjon ved sykluser.",
  },
  {
    id: "d-py22-quiz-cycle-detection",
    kind: "quiz",
    title: "Syklusdeteksjon i urettet graf",
    prompt: "Velg riktig hint.",
    topic: "Python kap. 22",
    question: "Hvordan oppdage en syklus i en URETTET graf med DFS?",
    options: [
      { text: "Hvis vi støter på en besøkt node som IKKE er forelder i DFS-treet, er det syklus", correct: true, rationale: "I urettet graf: hver kant går «tilbake til forelder» — det er normalt. Bare ikke-forelder-tilbakekanter indikerer syklus." },
      { text: "Bare tell antall kanter > V-1", correct: false, rationale: "Det fungerer for KOBLET graf, ikke generelt. En frakoblet graf kan ha få kanter men likevel ha syklus." },
      { text: "BFS finner sykluser, DFS gjør det ikke", correct: false, rationale: "Begge kan finne sykluser. Standard er DFS." },
      { text: "Hvis to noder har samme grad", correct: false, rationale: "Grad har ikke noe direkte med sykluser å gjøre." },
    ],
    explanation:
      "Rettet graf: bruk DFS med tre tilstander (white/gray/black). Tilbake-kant til en gray-node = syklus. Topologisk sort krever ingen sykluser (DAG).",
  },

  // ============= PYTHON KAP. 23 — Vektede grafer (Dijkstra, MST) =============

  {
    id: "d-py23-quiz-dijkstra-purpose",
    kind: "quiz",
    title: "Hva løser Dijkstra?",
    prompt: "Velg riktig svar.",
    topic: "Python kap. 23",
    question: "Hva er Dijkstras algoritme designet for?",
    options: [
      { text: "Single-source shortest path i vektet graf med IKKE-NEGATIVE vekter", correct: true, rationale: "Korteste vei fra ÉN startnode til alle andre. Krasjer hvis vekter er negative — bruk Bellman-Ford da." },
      { text: "Minste utspennende tre (MST)", correct: false, rationale: "Det er Prim eller Kruskal." },
      { text: "All-pairs shortest path", correct: false, rationale: "Det er Floyd-Warshall (O(V³))." },
      { text: "Sortere noder topologisk", correct: false, rationale: "Det er topologisk sort med DFS eller Kahn's algoritme." },
    ],
    explanation:
      "Datastruktur: min-heap (priority queue) ↔ heapq i Python. Tidskompleksitet: O((V+E) log V) med binær heap.",
  },
  {
    id: "d-py23-order-dijkstra-steps",
    kind: "order",
    title: "Sortér Dijkstra-stegene",
    prompt: "Sett stegene i riktig rekkefølge.",
    topic: "Python kap. 23",
    items: [
      "Initialiser dist[start] = 0, dist[alle andre] = ∞",
      "Legg (0, start) i en min-heap",
      "Hent (d, u) med minst d fra heapen",
      "Hvis d > dist[u]: hopp over (utdatert entry)",
      "Ellers: for hver kant (u, v, w), prøv å «relaxe» — dist[v] = min(dist[v], d + w)",
      "Hvis vi forbedret dist[v]: push (dist[v], v) i heapen",
      "Når heapen er tom: dist inneholder alle korteste avstander",
    ],
    explanation:
      "Hvorfor lazy delete (steg 4): heapq støtter ikke decrease-key. Vi pusher ny entry og ignorerer gamle. Vanlig Python-trick.",
  },
  {
    id: "d-py23-quiz-dijkstra-negative",
    kind: "quiz",
    title: "Dijkstra og negative vekter",
    prompt: "Velg riktig svar.",
    topic: "Python kap. 23",
    question: "Hvorfor fungerer ikke Dijkstra med negative kantvekter?",
    options: [
      { text: "Dijkstra antar at en gang en node er ferdigbehandlet, finner vi ingen kortere vei — negative kanter bryter dette", correct: true, rationale: "Dijkstra er grådig. Negative kanter kan oppdage en kortere vei SENERE — den grådige antagelsen bryter sammen." },
      { text: "Heap-strukturen kan ikke holde negative tall", correct: false, rationale: "Heap håndterer negative tall fint." },
      { text: "Negative vekter er ikke gyldige i grafer", correct: false, rationale: "De er helt gyldige — bare ikke for Dijkstra." },
      { text: "Algoritmen kan komme i uendelig løkke", correct: false, rationale: "Dijkstra terminerer. Den får bare feil svar med negative vekter." },
    ],
    explanation:
      "Bellman-Ford håndterer negative vekter (V-1 iterasjoner). Negativ syklus = ingen korteste vei (kan reduseres uendelig). Bellman-Ford kan detektere dette.",
  },
  {
    id: "d-py23-match-mst",
    kind: "match",
    title: "MST-algoritmer",
    prompt: "Match algoritme til strategi.",
    topic: "Python kap. 23",
    pairs: [
      { left: "Prim", right: "Vokser ett tre — på hvert steg, legg til den letteste kanten ut fra treet" },
      { left: "Kruskal", right: "Sortér alle kanter, legg til lette kanter som ikke lager syklus (union-find)" },
      { left: "Boruvka", right: "Hver komponent finner sin letteste utgående kant samtidig" },
    ],
    explanation:
      "Prim er bra for dense grafer (matrise + O(V²)). Kruskal er bra for sparse (sort kanter + union-find: O(E log E)). Begge gir SAMME MST (eller én av flere hvis vekter er like).",
  },
  {
    id: "d-py23-quiz-mst-property",
    kind: "quiz",
    title: "MST-egenskaper",
    prompt: "Velg riktig påstand.",
    topic: "Python kap. 23",
    question: "Hvor mange kanter har et MST for en koblet graf med V noder?",
    options: [
      { text: "Nøyaktig V-1", correct: true, rationale: "Tre med V noder har V-1 kanter — definisjon. Færre = ikke koblet. Flere = syklus." },
      { text: "V", correct: false, rationale: "Det ville lagt til en syklus." },
      { text: "E", correct: false, rationale: "Det er hele grafen, ikke MST." },
      { text: "V × log(V)", correct: false, rationale: "Det er kjøretiden for noen algoritmer, ikke antall kanter." },
    ],
    explanation:
      "Sjekkliste for «er X et tre på V noder?»: (1) V-1 kanter, (2) koblet, (3) ingen sykluser. Bare to av tre nok — den tredje følger automatisk.",
  },
  {
    id: "d-py23-fill-dijkstra-heap",
    kind: "fill",
    title: "Dijkstra — initialisering",
    prompt: "Fyll inn for første del av Dijkstra.",
    topic: "Python kap. 23",
    template:
      "import heapq\n\ndef dijkstra(graf, start):\n    dist = {n: __1__ for n in graf}\n    dist[start] = __2__\n    heap = [(__2__, start)]\n    while heap:\n        d, u = heapq.__3__(heap)\n        if d > dist[u]:\n            continue\n        # ... relax ...",
    blanks: ["float('inf')", "0", "heappop"],
    options: ["float('inf')", "None", "0", "-1", "heappop", "heappush", "pop", "append"],
    language: "python",
    explanation:
      "float('inf') er Python-konvensjon for «ikke nådd ennå». heapq er en MIN-heap — vi henter alltid minste foreløpige avstand først.",
  },

  // ============= ML-GRUNNLAG =============

  {
    id: "d-order-ml-pipeline",
    kind: "order",
    title: "ML-pipeline — sortér stegene",
    prompt: "Sortér de syv stegene i et typisk ML-prosjekt fra start til slutt.",
    topic: "ML-grunnlag",
    items: [
      "1. Samle inn og rens data, håndter NaN og outliers",
      "2. Feature engineering — velg og skalér kolonner",
      "3. Split i train / val / test",
      "4. Velg modell og tren på TRAIN-set",
      "5. Tune hyperparametere på VAL-set (eller cross-val)",
      "6. Evaluer på TEST-set — én gang, helt på slutten",
      "7. Deploy og overvåk modellen i produksjon",
    ],
    explanation:
      "Aller viktigst: TEST-settet skal ALDRI brukes til tuning. Det er den siste prøven — ikke pugg fasiten.",
  },
  {
    id: "d-match-ml-paradigmer",
    kind: "match",
    title: "Match paradigme til scenario",
    prompt: "Hvilken type ML er hver av disse?",
    topic: "ML-grunnlag",
    pairs: [
      { left: "Predikere boligpris fra størrelse, beliggenhet", right: "Supervised — regresjon" },
      { left: "Filtrere spam-eposter", right: "Supervised — klassifikasjon" },
      { left: "Gruppere kunder etter kjøpsmønster", right: "Unsupervised — klustering" },
      { left: "Redusere 100 features til 2D for plott", right: "Unsupervised — PCA" },
      { left: "Robot som lærer å gå via belønning", right: "Reinforcement learning" },
      { left: "Identifisere mistenkelig nettverkstrafikk uten merket data", right: "Unsupervised — anomalideteksjon" },
    ],
  },
  {
    id: "d-quiz-ml-overfitting",
    kind: "quiz",
    title: "Overfitting — gjenkjenn symptomet",
    prompt: "Velg det best dekkende svaret.",
    topic: "ML-grunnlag",
    question:
      "Du trener en decision tree med ubegrenset dybde. Train-accuracy: 99%. Test-accuracy: 65%. Hva har skjedd?",
    options: [
      {
        text: "Overfitting — modellen har memorert treningsdata inkl. støy",
        correct: true,
        rationale: "Stort gap mellom train og test = klassisk overfit. Fiks: regularisering, max_depth, mer data.",
      },
      {
        text: "Underfitting — modellen er for enkel",
        correct: false,
        rationale: "Underfitting gir LAV train-accuracy også. Her er train-accuracy høy.",
      },
      {
        text: "Modellen er perfekt — 99% er flott",
        correct: false,
        rationale: "Train-accuracy alene er meningsløs. Det er TEST-accuracy som teller.",
      },
      {
        text: "Test-settet er feil",
        correct: false,
        rationale: "Mulig, men 34 prosentpoeng gap er sterk indikator på overfit.",
      },
    ],
  },
  {
    id: "d-quiz-ml-underfitting",
    kind: "quiz",
    title: "Underfitting — gjenkjenn symptomet",
    prompt: "Velg riktig.",
    topic: "ML-grunnlag",
    question:
      "Lineær regresjon på sterkt ikke-lineær data. Train RMSE: 8.5, Test RMSE: 8.7. Hva er problemet?",
    options: [
      {
        text: "Underfitting — modellen er for enkel for mønsteret",
        correct: true,
        rationale: "Likt høyt error på BÅDE train og test = modellen kan ikke fange mønsteret engang i treningsdata.",
      },
      {
        text: "Overfitting",
        correct: false,
        rationale: "Overfitting har LAV train-error og HØY test-error. Her er begge høye.",
      },
      {
        text: "Bra balanse — train ≈ test",
        correct: false,
        rationale: "Train ≈ test er bra hvis BEGGE er lave. Begge høye = modellen er ikke flink nok.",
      },
      {
        text: "For mye regularisering",
        correct: false,
        rationale: "Mulig delårsak, men ikke hovedproblemet med lineær på ikke-lineær data.",
      },
    ],
  },
  {
    id: "d-match-ml-metrikker",
    kind: "match",
    title: "Riktig metrikk for problemet",
    prompt: "Match scenario til den viktigste metrikken.",
    topic: "Modellevaluering",
    pairs: [
      { left: "Boligpris-prediksjon (regresjon)", right: "RMSE eller MAE" },
      { left: "Spam-detektor — vil ikke kalle legit mail spam", right: "Precision (lav FP)" },
      { left: "Kreft-screening — vil ikke MISSE en syk pasient", right: "Recall (lav FN)" },
      { left: "Balansert klassifikasjon, like FP/FN-kostnader", right: "Accuracy" },
      { left: "Ranking-system uavhengig av threshold", right: "ROC-AUC" },
      { left: "Sterkt ubalanserte klasser (99/1)", right: "F1 eller PR-AUC, IKKE accuracy" },
    ],
  },
  {
    id: "d-quiz-ml-data-leakage",
    kind: "quiz",
    title: "Data leakage — finn feilen",
    prompt: "Velg det feilaktige steget.",
    topic: "ML-grunnlag",
    question: "I hvilken av disse rekkefølgene har du data leakage?",
    code: "scaler = StandardScaler()\nX_scaled = scaler.fit_transform(X)\nX_tr, X_te, y_tr, y_te = train_test_split(X_scaled, y)",
    language: "python",
    options: [
      {
        text: "Du skalerer FØR splitting — scaleren ser TEST-data og «lekker» informasjon",
        correct: true,
        rationale: "Riktig flyt: split først, fit_transform(X_train) på treningssettet, transform(X_test) etterpå.",
      },
      {
        text: "Du må alltid skalere FØR split",
        correct: false,
        rationale: "Akkurat motsatt — split først.",
      },
      {
        text: "Ingenting feil",
        correct: false,
        rationale: "Det ER en feil — subtil men reell. Test-statistikker har påvirket scaleren.",
      },
      {
        text: "train_test_split krever ulik X-størrelse",
        correct: false,
        rationale: "Den fungerer fint på en gitt X.",
      },
    ],
    explanation:
      "Bruk sklearn Pipeline — den håndterer fit/transform-rekkefølgen riktig automatisk.",
  },
  {
    id: "d-fill-train-test-split",
    kind: "fill",
    title: "Fyll inn train/test-split",
    prompt: "Split data 80/20, sett random seed, stratifisér for klassebalanse.",
    topic: "ML-grunnlag",
    template:
      "from sklearn.model_selection import __1__\n\nX_train, X_test, y_train, y_test = __1__(\n    X, y,\n    __2__=0.2,\n    __3__=42,\n    __4__=y          # behold klassefordeling\n)",
    blanks: ["train_test_split", "test_size", "random_state", "stratify"],
    options: ["train_test_split", "split", "test_size", "test_ratio", "random_state", "seed", "stratify", "balance"],
    language: "python",
    explanation:
      "stratify=y er avgjørende for ubalanserte klassifikasjons-datasett. random_state gjør resultatene reproduserbare.",
  },
  {
    id: "d-quiz-bias-variance",
    kind: "quiz",
    title: "Bias-variance — tolk diagnose",
    prompt: "Velg det riktige tiltaket.",
    topic: "ML-grunnlag",
    question: "Modellen din har høy bias (underfit). Hvilket tiltak hjelper?",
    options: [
      {
        text: "Mer komplekst modell eller flere features",
        correct: true,
        rationale: "Høy bias = for enkel modell. Øk kapasitet — flere features, dypere tre, mer parametere.",
      },
      {
        text: "Mer treningsdata",
        correct: false,
        rationale: "Mer data hjelper mot VARIANCE (overfit), ikke bias.",
      },
      {
        text: "Mer regularisering",
        correct: false,
        rationale: "Det FORVERRER bias. Mindre regularisering kan hjelpe.",
      },
      {
        text: "Skalér featuresene",
        correct: false,
        rationale: "Skalering er god praksis men løser ikke bias.",
      },
    ],
  },

  // ============= SUPERVISED LEARNING =============

  {
    id: "d-match-supervised-algos",
    kind: "match",
    title: "Supervised algoritme → egenskap",
    prompt: "Match hver algoritme til sin distinktive egenskap.",
    topic: "Supervised learning",
    pairs: [
      { left: "Lineær regresjon", right: "Tolkbar, antar lineær sammenheng, trenger skalering" },
      { left: "Logistisk regresjon", right: "Binær klassifikator med sigmoid, gir sannsynlighet" },
      { left: "kNN", right: "Ingen trening — bare data. Trenger skalerte features." },
      { left: "Decision tree", right: "Tolkbar, takler blandet datatype, overfitter lett" },
      { left: "Random Forest", right: "Mange trær på subsets — robust default-valg" },
      { left: "Gradient Boosting", right: "Sekvensielle trær korrigerer feil — vinner Kaggle" },
      { left: "SVM", right: "Maksimerer margin, kernel-triks for ikke-lineær" },
    ],
  },
  {
    id: "d-quiz-knn-k-velg",
    kind: "quiz",
    title: "kNN — velge k",
    prompt: "Velg riktig effekt.",
    topic: "Supervised learning",
    question: "Du øker k i kNN fra 3 til 50. Hva skjer?",
    options: [
      {
        text: "Modellen blir glattere — mindre variance, mer bias",
        correct: true,
        rationale: "Større k = gjennomsnitt over flere naboer = beslutningen blir mindre påvirket av enkeltpunkter. Bias øker, variance synker.",
      },
      {
        text: "Modellen overfitter mer",
        correct: false,
        rationale: "Motsatt — liten k overfitter (én neste-nabo).",
      },
      {
        text: "Ingen effekt — k er bare en stil-parameter",
        correct: false,
        rationale: "k har stor effekt på generalisering.",
      },
      {
        text: "Treningen blir tregere",
        correct: false,
        rationale: "kNN har ingen trening. PREDIKSJON blir litt tregere fordi man finner flere naboer.",
      },
    ],
  },
  {
    id: "d-quiz-tree-max-depth",
    kind: "quiz",
    title: "Decision tree — max_depth",
    prompt: "Velg det mest dekkende.",
    topic: "Supervised learning",
    question: "Hvorfor settes max_depth ofte til 5-10 i et decision tree?",
    options: [
      {
        text: "For å hindre overfitting — uten grense memorerer treet treningsdata fullt ut",
        correct: true,
        rationale: "Et tre med ubegrenset dybde lager én blad-node per treningssample → 100% train accuracy, dårlig generalisering.",
      },
      {
        text: "Det går raskere å trene",
        correct: false,
        rationale: "Trenings-hastigheten er sekundær. Generalisering er hovedgrunnen.",
      },
      {
        text: "Sklearn krever max_depth",
        correct: false,
        rationale: "Det er VALGFRITT. Default er None (ubegrenset).",
      },
      {
        text: "Større max_depth gir alltid bedre resultat",
        correct: false,
        rationale: "Det er motsatt — dypere overfitter.",
      },
    ],
  },
  {
    id: "d-fill-sklearn-knn",
    kind: "fill",
    title: "Fyll inn kNN-bruk",
    prompt: "Tren en kNN-klassifikator med k=5 på skalert data.",
    topic: "Supervised learning",
    template:
      "from sklearn.preprocessing import __1__\nfrom sklearn.neighbors import __2__\n\nscaler = __1__()\nX_train_s = scaler.__3__(X_train)\nX_test_s  = scaler.__4__(X_test)        # IKKE fit_transform!\n\nmodel = __2__(n_neighbors=__5__)\nmodel.fit(X_train_s, y_train)\npreds = model.predict(X_test_s)",
    blanks: ["StandardScaler", "KNeighborsClassifier", "fit_transform", "transform", "5"],
    options: ["StandardScaler", "MinMaxScaler", "KNeighborsClassifier", "KNN", "fit_transform", "transform", "fit", "3", "5", "10"],
    language: "python",
    explanation:
      "Den klassiske data-leakage-fellen: scaler skal FITTES KUN på train, så transformere test. fit_transform begge ganger lekker test-statistikk.",
  },
  {
    id: "d-fill-sklearn-rf",
    kind: "fill",
    title: "Fyll inn Random Forest",
    prompt: "Tren en Random Forest-klassifikator med 100 trær.",
    topic: "Supervised learning",
    template:
      "from sklearn.ensemble import __1__\nfrom sklearn.metrics import accuracy_score\n\nmodel = __1__(\n    __2__=100,\n    max_depth=10,\n    __3__=42)\n\nmodel.fit(X_train, y_train)\npreds = model.predict(X_test)\nprint(accuracy_score(y_test, preds))",
    blanks: ["RandomForestClassifier", "n_estimators", "random_state"],
    options: ["RandomForestClassifier", "RandomForest", "DecisionTree", "n_estimators", "n_trees", "random_state", "seed"],
    language: "python",
    explanation:
      "Random Forest takler u-skalerte features og er en god default. n_estimators=100 er typisk; flere gir litt bedre og tregere.",
  },
  {
    id: "d-match-regr-vs-klass",
    kind: "match",
    title: "Regresjon eller klassifikasjon?",
    prompt: "Match problemet til riktig type.",
    topic: "Supervised learning",
    pairs: [
      { left: "Predikere boligpris (NOK)", right: "Regresjon" },
      { left: "Sjekke om mail er spam", right: "Klassifikasjon (binær)" },
      { left: "Predikere sangsjanger", right: "Klassifikasjon (multi-klasse)" },
      { left: "Predikere temperatur i morgen", right: "Regresjon" },
      { left: "Anbefale produkter (stjerne 1-5)", right: "Regresjon eller ordinal klassifikasjon" },
      { left: "Diagnose ja/nei kreft", right: "Klassifikasjon (binær)" },
    ],
  },
  {
    id: "d-quiz-regularization",
    kind: "quiz",
    title: "Regularisering — hva gjør den?",
    prompt: "Velg det mest dekkende.",
    topic: "Supervised learning",
    question: "Du legger til L2-regularisering (Ridge) på lineær regresjon. Hva skjer?",
    options: [
      {
        text: "Vektene skvises mot null — modellen blir enklere og overfitter mindre",
        correct: true,
        rationale: "L2 legger til λ·||w||² i loss. Optimalisering vil unngå store vekter → mindre kompleksitet, mindre overfit.",
      },
      {
        text: "Modellen blir mer fleksibel",
        correct: false,
        rationale: "Motsatt — regularisering BEGRENSER fleksibilitet.",
      },
      {
        text: "Training-loss blir lavere",
        correct: false,
        rationale: "Training-loss blir HØYERE (regularisering er en straff). Men test-loss blir bedre.",
      },
      {
        text: "Modellen kan ikke lenger lære lineære funksjoner",
        correct: false,
        rationale: "Den lærer fortsatt lineære — bare med mindre vekter.",
      },
    ],
    explanation: "Lasso (L1) gjør samme, men kan sette vekter helt til 0 → feature selection.",
  },
  {
    id: "d-quiz-ensemble-rf-vs-gb",
    kind: "quiz",
    title: "Random Forest vs Gradient Boosting",
    prompt: "Velg den viktigste forskjellen.",
    topic: "Supervised learning",
    question: "Hva er hovedforskjellen mellom Random Forest og Gradient Boosting?",
    options: [
      {
        text: "RF trener trær PARALLELLT på subsets; GB trener trær SEKVENSIELT der hvert korrigerer forrige",
        correct: true,
        rationale: "Det er hele forskjellen. RF er bagging (parallell, gjennomsnitt); GB er boosting (sekvensiell, residualer).",
      },
      {
        text: "RF er for klassifikasjon, GB for regresjon",
        correct: false,
        rationale: "Begge kan brukes til begge.",
      },
      {
        text: "GB er alltid bedre",
        correct: false,
        rationale: "GB er ofte bedre på tabulær data, men RF er mer robust mot dårlige hyperparametere.",
      },
      {
        text: "RF er deterministisk, GB er stokastisk",
        correct: false,
        rationale: "Begge bruker randomness (subsets, bagging).",
      },
    ],
  },

  // ============= UNSUPERVISED LEARNING =============

  {
    id: "d-match-unsupervised-algos",
    kind: "match",
    title: "Unsupervised algoritme → bruk",
    prompt: "Match algoritmen til typisk bruksområde.",
    topic: "Unsupervised learning",
    pairs: [
      { left: "k-means", right: "Klustering når du forhåndsbestemmer antall grupper" },
      { left: "Hierarchical clustering", right: "Klustering uten å forhåndsbestemme k, gir dendrogram" },
      { left: "PCA", right: "Dim-reduksjon for visualisering eller speed-up" },
      { left: "Isolation Forest", right: "Anomalideteksjon — finn de utypiske" },
      { left: "DBSCAN", right: "Klustering basert på tetthet — håndterer irregulære former" },
      { left: "t-SNE / UMAP", right: "Ikke-lineær dim-reduksjon for visualisering" },
    ],
  },
  {
    id: "d-quiz-kmeans-scale",
    kind: "quiz",
    title: "k-means — hvorfor skalere?",
    prompt: "Velg riktig grunn.",
    topic: "Unsupervised learning",
    question: "Hvorfor MÅ du skalere features før k-means?",
    options: [
      {
        text: "k-means bruker euclidean avstand — features med stor variasjon dominerer ellers",
        correct: true,
        rationale: "Hvis én feature går 0-1000 og en annen 0-1, vil førstnevnte dominere avstandsberegningen helt og slett.",
      },
      {
        text: "k-means krever positive verdier",
        correct: false,
        rationale: "k-means takler både positive og negative.",
      },
      {
        text: "Skalering gjør k-means raskere",
        correct: false,
        rationale: "Skalering endrer ikke kjørehastighet — kun KVALITETEN av klusterene.",
      },
      {
        text: "sklearn krever det",
        correct: false,
        rationale: "Den krever det ikke teknisk, men resultatet blir dårlig uten.",
      },
    ],
  },
  {
    id: "d-order-kmeans-algo",
    kind: "order",
    title: "k-means algoritmen — sortér stegene",
    prompt: "Sortér iterasjonene av k-means.",
    topic: "Unsupervised learning",
    items: [
      "Plassér k senter-punkter tilfeldig",
      "Beregn avstand fra hvert datapunkt til hvert senter",
      "Tilordne hvert datapunkt til NÆRMESTE senter",
      "Oppdater hvert senter til gjennomsnittet av sine tilordnede punkter",
      "Sjekk: har sentrene flyttet seg? Hvis ja, gjenta",
      "Hvis nei (konvergert), returner cluster-labels og sentre",
    ],
  },
  {
    id: "d-quiz-elbow-method",
    kind: "quiz",
    title: "Elbow-metoden — hva er den til?",
    prompt: "Velg det riktige formålet.",
    topic: "Unsupervised learning",
    question: "Du plotter SSE (sum of squared errors) for k=1 til k=10 i k-means. Hva ser du etter?",
    options: [
      {
        text: "«Albuen» — punktet der SSE slutter å falle dramatisk. Dette indikerer det optimale antallet klustere.",
        correct: true,
        rationale: "Før albuen: hvert ekstra cluster forklarer mye. Etter: marginal gevinst. Albuen er sweet spot.",
      },
      {
        text: "Punktet hvor SSE er lavest — alltid det høyeste k-et",
        correct: false,
        rationale: "Det er trivielt — SSE går mot 0 når k = n. Men da har vi ett cluster per punkt — ubrukelig.",
      },
      {
        text: "Punktet hvor accuracy er høyest",
        correct: false,
        rationale: "Unsupervised har ingen accuracy. SSE er evaluasjonen.",
      },
      {
        text: "Hvor mange features det er",
        correct: false,
        rationale: "Antall features er X.shape[1], ikke fra elbow.",
      },
    ],
  },
  {
    id: "d-fill-sklearn-kmeans",
    kind: "fill",
    title: "Fyll inn k-means",
    prompt: "Tren k-means med 3 klustere og hent ut labels.",
    topic: "Unsupervised learning",
    template:
      "from sklearn.cluster import __1__\nfrom sklearn.preprocessing import StandardScaler\n\nX_scaled = StandardScaler().__2__(X)\n\nkm = __1__(__3__=3, random_state=42, n_init=10)\nkm.fit(X_scaled)\n\nlabels = km.__4__\ncenters = km.__5__",
    blanks: ["KMeans", "fit_transform", "n_clusters", "labels_", "cluster_centers_"],
    options: ["KMeans", "KCluster", "kmeans", "fit_transform", "fit", "transform", "n_clusters", "k", "labels_", "predictions_", "cluster_centers_", "centroids_"],
    language: "python",
    explanation:
      "n_init=10 kjører algoritmen 10 ganger med ulike random init og beholder beste — anbefalt fordi k-means kan henge seg på lokale minima.",
  },
  {
    id: "d-quiz-pca-forklart-varians",
    kind: "quiz",
    title: "PCA — explained_variance_ratio",
    prompt: "Velg riktig tolkning.",
    topic: "Unsupervised learning",
    question:
      "PCA.explained_variance_ratio_ = [0.55, 0.28, 0.12, 0.05]. Hva betyr det?",
    options: [
      {
        text: "PC1 forklarer 55% av variansen, PC2 28%, totalt fanger 4 komponenter 100%",
        correct: true,
        rationale: "Sum er 1.0 og lista har 4 elementer = 4 komponenter brukt. Behold ofte nok komponenter til å forklare 90-95% av variansen.",
      },
      {
        text: "Modellen har 55% accuracy",
        correct: false,
        rationale: "PCA har ingen accuracy — det er ikke en prediksjonsmodell.",
      },
      {
        text: "De første to komponentene er nok",
        correct: false,
        rationale: "PC1+PC2 = 83%. Om det er nok avhenger av tap-toleranse.",
      },
      {
        text: "Datasettet har 55 features",
        correct: false,
        rationale: "Antall features finner du i X.shape[1], ikke i variance ratio.",
      },
    ],
  },
  {
    id: "d-match-dim-reduction",
    kind: "match",
    title: "Dim-reduksjon — velg riktig teknikk",
    prompt: "For hvert behov, hvilken teknikk passer best?",
    topic: "Unsupervised learning",
    pairs: [
      { left: "Behold lineær struktur, raskt", right: "PCA" },
      { left: "Visualiser klustere i 2D (ikke-lineær)", right: "t-SNE eller UMAP" },
      { left: "Beholde global struktur + raskere enn t-SNE", right: "UMAP" },
      { left: "Komprimere bilder eller signaler", right: "PCA" },
      { left: "Feature selection (ikke -reduksjon)", right: "L1-regularisering (Lasso)" },
    ],
  },

  // ============= NEVRALE NETT =============

  {
    id: "d-match-aktivering",
    kind: "match",
    title: "Aktiveringsfunksjon → bruksområde",
    prompt: "Match hver funksjon til der den passer.",
    topic: "Nevrale nett",
    pairs: [
      { left: "ReLU", right: "Default for skjulte lag — rask, fungerer" },
      { left: "Sigmoid", right: "Binær klassifikasjon — siste lag (output ∈ 0,1)" },
      { left: "Softmax", right: "Multi-klasse klassifikasjon — siste lag (sum = 1)" },
      { left: "Tanh", right: "Skjulte lag i RNN — sentrert rundt 0" },
      { left: "Linear (ingen)", right: "Regresjon — siste lag uten activation" },
    ],
  },
  {
    id: "d-quiz-perceptron-xor",
    kind: "quiz",
    title: "Perceptron — kan den lære XOR?",
    prompt: "Velg riktig.",
    topic: "Nevrale nett",
    question: "Kan en enkel perceptron lære XOR-funksjonen (1, 1 → 0; 1, 0 → 1; etc.)?",
    options: [
      {
        text: "Nei — XOR er ikke lineært separerbar, krever et skjult lag",
        correct: true,
        rationale: "Klassisk Minsky-Papert-resultat fra 1969 som stoppet NN-forskning i 17 år. Med ETT skjult lag kan en NN lære XOR.",
      },
      {
        text: "Ja, med riktige vekter",
        correct: false,
        rationale: "Det finnes ingen vekter som løser XOR med én perceptron. Lineær separabilitet er kjernen.",
      },
      {
        text: "Bare hvis du bruker sigmoid",
        correct: false,
        rationale: "Aktiveringsfunksjon endrer ikke lineær separabilitet for én lag.",
      },
      {
        text: "Bare med Adam-optimizer",
        correct: false,
        rationale: "Optimizer endrer hvordan vi finner vekter, ikke om de eksisterer.",
      },
    ],
  },
  {
    id: "d-quiz-loss-velg",
    kind: "quiz",
    title: "Velg riktig loss-funksjon",
    prompt: "Hva bruker du for binær klassifikasjon?",
    topic: "Nevrale nett",
    question: "Du bygger en NN for å klassifisere mail som spam/ikke spam. Hvilken loss-funksjon?",
    options: [
      {
        text: "Binary cross-entropy (med sigmoid output)",
        correct: true,
        rationale: "BCE er standard for binær klassifikasjon. Sigmoid output gir P(spam=1), BCE måler avvik fra true label.",
      },
      {
        text: "MSE (Mean Squared Error)",
        correct: false,
        rationale: "MSE er for regresjon. Fungerer dårlig for klassifikasjon — gir treigere konvergens og dårligere gradient-flyt.",
      },
      {
        text: "Categorical cross-entropy",
        correct: false,
        rationale: "Det er for MULTI-klasse. Binær er enklere — BCE.",
      },
      {
        text: "Hinge loss",
        correct: false,
        rationale: "Hinge loss er for SVM, ikke standard for NN.",
      },
    ],
  },
  {
    id: "d-order-nn-trening",
    kind: "order",
    title: "Trening av nevralt nett — sortér stegene",
    prompt: "Sortér én iterasjon (epoch) av NN-trening.",
    topic: "Nevrale nett",
    items: [
      "1. Forward pass: kjør input gjennom nettet, regn ut ŷ",
      "2. Beregn loss L(ŷ, y)",
      "3. Backward pass: regn gradient ∂L/∂w for hver vekt",
      "4. Optimizer oppdaterer: w = w - lr · ∂L/∂w",
      "5. Gjenta for neste batch",
      "6. Når alle batches er kjørt: én EPOCH er fullført",
    ],
    explanation:
      "Hver epoch er ÉN runde gjennom hele datasettet. Typisk trener man i 10-100 epochs med early stopping på val-loss.",
  },
  {
    id: "d-fill-nn-pytorch",
    kind: "fill",
    title: "Fyll inn PyTorch NN-skjelett",
    prompt: "Bygg en enkel klassifikasjons-NN.",
    topic: "Nevrale nett",
    template:
      "import torch.nn as nn\n\nclass NN(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.fc1 = nn.__1__(10, 64)    # 10 input, 64 skjult\n        self.fc2 = nn.__1__(64, 2)     # 64 → 2 klasser\n        self.relu = nn.__2__()\n\n    def forward(self, x):\n        x = self.relu(self.__3__(x))\n        return self.__4__(x)\n\nloss_fn = nn.__5__()      # cross-entropy for multi-klasse",
    blanks: ["Linear", "ReLU", "fc1", "fc2", "CrossEntropyLoss"],
    options: ["Linear", "Dense", "ReLU", "Sigmoid", "Tanh", "fc1", "fc2", "layer1", "CrossEntropyLoss", "BCELoss", "MSELoss"],
    language: "python",
    explanation:
      "nn.Linear er fully-connected layer. CrossEntropyLoss i PyTorch inkluderer softmax — du legger IKKE softmax i siste lag.",
  },
  {
    id: "d-quiz-vanishing-gradient",
    kind: "quiz",
    title: "Vanishing gradient — symptom og fiks",
    prompt: "Velg riktig.",
    topic: "Nevrale nett",
    question: "Et dypt nett med sigmoid aktivering i alle lag konvergerer veldig sakte. Hva er problemet?",
    options: [
      {
        text: "Vanishing gradient — sigmoid-gradient er liten, og produktet av små gradienter forsvinner i dype nett",
        correct: true,
        rationale: "Sigmoid har max-gradient 0.25. I 10-lags nett blir gradient 0.25^10 ≈ 10^-6 — usynlig. Bytt til ReLU.",
      },
      {
        text: "For mye data",
        correct: false,
        rationale: "Mer data hjelper vanligvis — ikke et problem.",
      },
      {
        text: "Modellen overfitter",
        correct: false,
        rationale: "Overfit gir høy train-acc og lav test-acc, ikke treg konvergens.",
      },
      {
        text: "Adam-optimizer er ikke kompatibel med sigmoid",
        correct: false,
        rationale: "Adam fungerer fint med alle aktiveringer.",
      },
    ],
  },
  {
    id: "d-quiz-learning-rate",
    kind: "quiz",
    title: "Learning rate — for høyt vs for lavt",
    prompt: "Velg det riktige symptomet.",
    topic: "Nevrale nett",
    question: "Du trener en NN. Loss vokser opp og ned vilt og divergerer til NaN. Hva er sannsynlig årsak?",
    options: [
      {
        text: "Learning rate er FOR HØYT — stegene over loss-landskapet blir for store",
        correct: true,
        rationale: "Klassisk divergens-symptom. Reduser lr (typisk fra 1e-3 til 1e-4) eller bruk gradient clipping.",
      },
      {
        text: "Learning rate er for lavt",
        correct: false,
        rationale: "For lavt lr gir TREG konvergens, ikke divergens.",
      },
      {
        text: "For lite data",
        correct: false,
        rationale: "Lite data gir overfit, ikke divergens.",
      },
      {
        text: "For mange epochs",
        correct: false,
        rationale: "Det gir overfit (lav train-loss, høy val-loss) — ikke NaN.",
      },
    ],
  },
  {
    id: "d-match-nn-hyperparametere",
    kind: "match",
    title: "Hyperparameter → effekt",
    prompt: "Match hver hyperparameter til hva som skjer hvis den er FOR HØY.",
    topic: "Nevrale nett",
    pairs: [
      { left: "learning_rate for høyt", right: "Loss divergerer, NaN" },
      { left: "epochs for mange", right: "Overfitting — val-loss begynner å stige" },
      { left: "hidden layers for dypt", right: "Vanishing gradient, tregere konvergens, mer overfit" },
      { left: "batch_size for stort", right: "Mer minne, jevnere gradient men færre updates" },
      { left: "dropout for høyt", right: "Underfitting — nettet slår av for mye" },
    ],
  },
  {
    id: "d-quiz-softmax-vs-sigmoid",
    kind: "quiz",
    title: "Softmax eller sigmoid på output?",
    prompt: "Velg riktig.",
    topic: "Nevrale nett",
    question: "Du klassifiserer bilder til 10 kategorier. Hvilken aktivering på siste lag?",
    options: [
      {
        text: "Softmax — gir sannsynlighet per klasse, sum = 1",
        correct: true,
        rationale: "Softmax fordeler sannsynligheten mellom klassene. Multi-klasse standard.",
      },
      {
        text: "Sigmoid på hver klasse",
        correct: false,
        rationale: "Sigmoid er for BINÆR eller multi-LABEL (ikke multi-klasse). En bilde kan ikke være både 'hund' og 'katt' samtidig.",
      },
      {
        text: "ReLU",
        correct: false,
        rationale: "ReLU er for skjulte lag. På output gir det rå tall, ikke sannsynlighet.",
      },
      {
        text: "Linear",
        correct: false,
        rationale: "Linear er for regresjon. Klassifikasjon trenger sannsynlighet.",
      },
    ],
  },

  // ============ OS-GRUNNLAG (DTE-2505) ============
  {
    id: "d-match-kernel-userspace",
    kind: "match",
    title: "Kernel vs userspace — hvor hører hva hjemme?",
    prompt: "Plasser hver komponent i riktig lag.",
    topic: "OS-grunnlag",
    pairs: [
      { left: "Scheduler", right: "Kernel" },
      { left: "Disk-driver", right: "Kernel" },
      { left: "TCP/IP-stack", right: "Kernel" },
      { left: "bash", right: "Userspace" },
      { left: "firefox", right: "Userspace" },
      { left: "systemd", right: "Userspace" },
    ],
    explanation:
      "Kernelen kjører i privilegert modus og eier maskinvaren. Selv systemd (PID 1) er en userspace-prosess — den ber kernelen via syscalls.",
  },
  {
    id: "d-order-prosess-livssyklus",
    kind: "order",
    title: "Prosess-livssyklus — fork/exec/wait/exit",
    prompt: "Sorter stegene i klassisk Unix prosess-håndtering.",
    topic: "OS-grunnlag",
    items: [
      "Parent kaller fork() — kopi av prosessen lages",
      "Child kaller execve() — programbilde erstattes",
      "Child kjører til ferdig",
      "Child kaller exit() — terminerer",
      "Parent kaller wait() — henter exit-status",
    ],
    explanation:
      "Hver gang bash starter et program, er det fork+exec+wait. Uten wait blir child en zombie i prosess-tabellen.",
  },
  {
    id: "d-match-prosess-states",
    kind: "match",
    title: "Prosess-tilstander → beskrivelse",
    prompt: "Match hver prosess-tilstand til hva den betyr.",
    topic: "OS-grunnlag",
    pairs: [
      { left: "READY", right: "Klar til å kjøre, venter på CPU" },
      { left: "RUNNING", right: "Kjører på CPU akkurat nå" },
      { left: "WAITING", right: "Sover — venter på I/O eller signal" },
      { left: "TERMINATED", right: "Ferdig — venter på at parent gjør wait()" },
    ],
  },
  {
    id: "d-match-scheduler-typer",
    kind: "match",
    title: "Scheduling-algoritmer → karakteristikk",
    prompt: "Match algoritmen til kjennetegnet.",
    topic: "OS-grunnlag",
    pairs: [
      { left: "FCFS", right: "First-come, first-served — én treg prosess blokkerer kø" },
      { left: "SJF", right: "Shortest job first — lavest snitt-ventetid, krever forutsigelse" },
      { left: "Round-robin", right: "Tidskvante per prosess, rettferdig" },
      { left: "Priority", right: "Høyest prioritet kjører — fare for starvation" },
      { left: "CFS (Linux)", right: "Gir mest tid til den som har fått minst" },
    ],
  },
  {
    id: "d-quiz-syscall",
    kind: "quiz",
    title: "Hva er en syscall?",
    prompt: "Velg riktig.",
    topic: "OS-grunnlag",
    question: "Hvilken av disse er en syscall?",
    options: [
      {
        text: "open() — kontrollert overgang fra userspace til kernel for å åpne en fil",
        correct: true,
        rationale: "open, read, write, fork, execve er klassiske POSIX-syscalls.",
      },
      {
        text: "printf() — skriver ut tekst",
        correct: false,
        rationale: "printf er en libc-funksjon. Den kaller ETTERHVERT syscallen write().",
      },
      {
        text: "malloc() — allokerer minne",
        correct: false,
        rationale: "malloc er libc. Den ber kernelen via brk() eller mmap() bare når den trenger mer minne.",
      },
      {
        text: "strlen() — beregner strenglengde",
        correct: false,
        rationale: "Ren brukerkode — ingen kernel involvert.",
      },
    ],
  },

  // ============ LINUX-BRUK ============
  {
    id: "d-fill-chmod-755",
    kind: "fill",
    title: "chmod octal — sett rwxr-xr-x på et skript",
    prompt: "Fyll inn riktig octal-verdi.",
    topic: "Linux",
    template: "chmod __1__ script.sh",
    blanks: ["755"],
    options: ["755", "644", "777", "700", "600", "750"],
    explanation:
      "rwx=7 for eier, r-x=5 for gruppe, r-x=5 for andre. Vanlig for kjørbare skript.",
  },
  {
    id: "d-fill-chmod-644",
    kind: "fill",
    title: "chmod octal — vanlig tekstfil",
    prompt: "rw-r--r-- = ?",
    topic: "Linux",
    template: "chmod __1__ notater.txt",
    blanks: ["644"],
    options: ["644", "755", "664", "666", "600", "700"],
    explanation: "rw-=6 for eier, r--=4 for gruppe, r--=4 for andre. Standard for vanlige filer.",
  },
  {
    id: "d-fill-chmod-700",
    kind: "fill",
    title: "chmod octal — privat ssh-katalog",
    prompt: "Bare eier får lese, skrive og åpne katalogen.",
    topic: "Linux",
    template: "chmod __1__ ~/.ssh",
    blanks: ["700"],
    options: ["700", "755", "777", "644", "600", "750"],
    explanation:
      "rwx for eier, ingenting for andre. ssh nekter å bruke nøkler hvis katalogen er for åpen.",
  },
  {
    id: "d-match-rwx-octal",
    kind: "match",
    title: "Symbolske rettigheter → octal",
    prompt: "Match rwx-mønstre til riktig tall.",
    topic: "Linux",
    pairs: [
      { left: "rwx", right: "7" },
      { left: "rw-", right: "6" },
      { left: "r-x", right: "5" },
      { left: "r--", right: "4" },
      { left: "-wx", right: "3" },
      { left: "---", right: "0" },
    ],
    explanation: "r=4, w=2, x=1. Summer per gruppe.",
  },
  {
    id: "d-match-ps-top-kill",
    kind: "match",
    title: "Prosess-verktøy → bruk",
    prompt: "Match hver kommando til hva den gjør.",
    topic: "Linux",
    pairs: [
      { left: "ps aux", right: "Vis alle prosesser én gang (snapshot)" },
      { left: "top", right: "Interaktiv prosess-monitor som oppdateres" },
      { left: "kill -9 1234", right: "Send SIGKILL til prosess 1234 — drep umiddelbart" },
      { left: "kill 1234", right: "Send SIGTERM — be pent om å avslutte" },
      { left: "pkill -f mønster", right: "Drep prosesser basert på kommandolinje" },
      { left: "killall nginx", right: "Drep alle prosesser med dette navnet" },
    ],
  },
  {
    id: "d-match-signal-nummer",
    kind: "match",
    title: "Signal → nummer og effekt",
    prompt: "Match Unix-signaler til hva de gjør.",
    topic: "Linux",
    pairs: [
      { left: "SIGINT (2)", right: "Ctrl+C — avbryt prosess" },
      { left: "SIGTERM (15)", right: "Standard 'avslutt pent' — kan fanges" },
      { left: "SIGKILL (9)", right: "Drep umiddelbart — KAN IKKE fanges" },
      { left: "SIGHUP (1)", right: "Terminal lukket — brukes ofte til reload config" },
      { left: "SIGSTOP (19)", right: "Suspendér prosessen" },
    ],
  },
  {
    id: "d-fill-pipe-grep",
    kind: "fill",
    title: "Pipe — finn nginx i prosesser",
    prompt: "Dra inn riktige tegn for å sende output videre.",
    topic: "Linux",
    template: "ps aux __1__ grep nginx",
    blanks: ["|"],
    options: ["|", ">", ">>", "<", "&", "2>"],
    explanation: "| (pipe) sender stdout fra venstre kommando som stdin til høyre.",
  },
  {
    id: "d-fill-redirect-stderr",
    kind: "fill",
    title: "Redirect — send både stdout og stderr til logg",
    prompt: "Fyll inn riktige redirect-operatorer.",
    topic: "Linux",
    template: "min-skript.sh __1__ /var/log/app.log",
    blanks: ["&>"],
    options: ["&>", ">", "2>", ">>", "<", "|", "2>&1"],
    explanation: "&> er kortform for både stdout og stderr. Alternativ: > fil 2>&1.",
  },
  {
    id: "d-match-pakkehandterer",
    kind: "match",
    title: "Distribusjon → pakkehåndterer",
    prompt: "Match distro til pakkeverktøyet den bruker.",
    topic: "Linux",
    pairs: [
      { left: "Ubuntu / Debian", right: "apt" },
      { left: "Fedora / RHEL", right: "dnf" },
      { left: "Arch Linux", right: "pacman" },
      { left: "Alpine", right: "apk" },
      { left: "openSUSE", right: "zypper" },
      { left: "macOS (3.parts)", right: "brew" },
    ],
  },
  {
    id: "d-match-linux-kommandoer",
    kind: "match",
    title: "Mest-brukte Linux-kommandoer",
    prompt: "Match hver kommando til hva den gjør.",
    topic: "Linux",
    pairs: [
      { left: "ls -la", right: "Liste filer langt format, også skjulte" },
      { left: "cd ~", right: "Gå til hjemmekatalog" },
      { left: "grep -r mønster .", right: "Søk rekursivt etter mønster i alle filer" },
      { left: "find . -name '*.log'", right: "Finn alle .log-filer fra her og nedover" },
      { left: "du -sh katalog", right: "Vis total disk-bruk for katalogen, menneske-lesbart" },
      { left: "df -h", right: "Vis diskplass per filsystem" },
      { left: "tail -f /var/log/syslog", right: "Følg log-fil i sanntid" },
    ],
  },
  {
    id: "d-quiz-systemctl",
    kind: "quiz",
    title: "Sett opp nginx til å starte automatisk",
    prompt: "Hvilken kommando får nginx til å starte ved hver boot?",
    topic: "Linux",
    question: "Du har installert nginx. Hva må du kjøre for at den skal starte automatisk ved boot?",
    options: [
      {
        text: "sudo systemctl enable nginx",
        correct: true,
        rationale: "enable lager symlink slik at systemd starter tjenesten ved boot.",
      },
      {
        text: "sudo systemctl start nginx",
        correct: false,
        rationale: "start starter den NÅ, men autostart krever enable.",
      },
      {
        text: "sudo systemctl status nginx",
        correct: false,
        rationale: "status viser bare info om tjenesten.",
      },
      {
        text: "sudo apt install nginx-autostart",
        correct: false,
        rationale: "Det finnes ingen slik pakke. systemd håndterer autostart.",
      },
    ],
  },

  // ============ SHELL SCRIPTING ============
  {
    id: "d-fill-shebang",
    kind: "fill",
    title: "Shebang — første linje i et bash-skript",
    prompt: "Fyll inn shebang-linjen.",
    topic: "Shell scripting",
    template: "__1__\necho \"hei\"",
    blanks: ["#!/bin/bash"],
    options: ["#!/bin/bash", "#/bin/bash", "//bin/bash", "#!bash", "#!/bash"],
    explanation:
      "Shebang er '#!' fulgt av interpreter-stien. Forteller kernelen hvilket program som skal kjøre filen.",
  },
  {
    id: "d-fill-variabel",
    kind: "fill",
    title: "Bash-variabel — INGEN mellomrom rundt =",
    prompt: "Sett variabelen og bruk den i echo.",
    topic: "Shell scripting",
    template: "navn__1__\"Isak\"\necho \"Hei __2__navn\"",
    blanks: ["=", "$"],
    options: ["=", "$", " = ", "==", "@", ":"],
    explanation:
      "navn=\"Isak\" (uten mellomrom). $navn ekspanderer verdien. \"navn = ...\" gir 'command not found'.",
  },
  {
    id: "d-fill-if-then-fi",
    kind: "fill",
    title: "if/then/fi — sjekk om filen finnes",
    prompt: "Fyll inn nøkkelordene.",
    topic: "Shell scripting",
    template: "__1__ [ -f fil.txt ]; __2__\n    echo \"finnes\"\n__3__",
    blanks: ["if", "then", "fi"],
    options: ["if", "then", "fi", "endif", "else", "elif", "do", "done"],
    explanation: "Bash bruker if/then/fi (ikke endif). Avsluttet med 'fi' — 'if' baklengs.",
  },
  {
    id: "d-fill-for-loop",
    kind: "fill",
    title: "for-løkke over filer",
    prompt: "Iterér over alle .log-filer i katalogen.",
    topic: "Shell scripting",
    template:
      "__1__ fil __2__ *.log; __3__\n    echo \"Komprimerer $fil\"\n    gzip \"$fil\"\n__4__",
    blanks: ["for", "in", "do", "done"],
    options: ["for", "in", "do", "done", "while", "fi", "if", "then"],
  },
  {
    id: "d-fill-while-read",
    kind: "fill",
    title: "while — les linje for linje fra fil",
    prompt: "Fyll inn for å lese fil linje for linje.",
    topic: "Shell scripting",
    template:
      "__1__ read linje; __2__\n    echo \"Fikk: $linje\"\n__3__ < fil.txt",
    blanks: ["while", "do", "done"],
    options: ["while", "do", "done", "for", "fi", "then", "if"],
  },
  {
    id: "d-match-exit-koder",
    kind: "match",
    title: "Exit-kode → betydning",
    prompt: "Match Unix-konvensjonelle exit-koder.",
    topic: "Shell scripting",
    pairs: [
      { left: "0", right: "Suksess" },
      { left: "1", right: "Generell feil" },
      { left: "2", right: "Feil bruk — manglende argumenter o.l." },
      { left: "127", right: "Kommando ikke funnet" },
      { left: "130", right: "Avbrutt med Ctrl+C (128 + SIGINT 2)" },
    ],
  },
  {
    id: "d-match-bash-special-vars",
    kind: "match",
    title: "Bash special variables",
    prompt: "Match variabelen til hva den inneholder.",
    topic: "Shell scripting",
    pairs: [
      { left: "$0", right: "Skript-navnet" },
      { left: "$1, $2", right: "Første og andre argument" },
      { left: "$#", right: "Antall argumenter" },
      { left: "$@", right: "Alle argumenter som separate ord" },
      { left: "$?", right: "Exit-kode fra forrige kommando" },
      { left: "$$", right: "PID til selve skriptet" },
    ],
  },
  {
    id: "d-quiz-strict-mode",
    kind: "quiz",
    title: "set -euo pipefail — hva gjør hver flagg?",
    prompt: "Velg det som er FEIL om bash strict mode.",
    topic: "Shell scripting",
    question: "Hvilken påstand om 'set -euo pipefail' er FEIL?",
    options: [
      {
        text: "-e gjør at skriptet kjører videre selv om en kommando feiler",
        correct: true,
        rationale: "Tvert imot: -e avslutter skriptet ved første feil.",
      },
      {
        text: "-u gjør at bruk av udefinert variabel gir feil",
        correct: false,
        rationale: "Riktig — fanger typos i variabelnavn.",
      },
      {
        text: "-o pipefail gjør at hele pipen feiler hvis et tidlig ledd feiler",
        correct: false,
        rationale:
          "Riktig — uten dette returnerer pipen bare exit-koden fra siste kommando.",
      },
      {
        text: "Alle tre flaggene anbefales i robuste drift-skript",
        correct: false,
        rationale: "Riktig — standard 'bash strict mode'.",
      },
    ],
  },

  // ============ BRUKERE & RETTIGHETER ============
  {
    id: "d-match-passwd-felter",
    kind: "match",
    title: "/etc/passwd — feltene i en linje",
    prompt: "Linjen 'isak:x:1000:1000:Isak Olsen,,,:/home/isak:/bin/bash' har 7 kolon-separerte felter. Match feltet til betydningen.",
    topic: "Brukere & rettigheter",
    pairs: [
      { left: "isak", right: "Brukernavn" },
      { left: "x", right: "Passord (x = ligger i /etc/shadow)" },
      { left: "1000 (3. felt)", right: "UID" },
      { left: "1000 (4. felt)", right: "Primær GID" },
      { left: "Isak Olsen,,,", right: "GECOS — fullt navn og kontaktinfo" },
      { left: "/home/isak", right: "Hjemmekatalog" },
      { left: "/bin/bash", right: "Login-shell" },
    ],
  },
  {
    id: "d-quiz-sudo-vs-su",
    kind: "quiz",
    title: "sudo vs su — hva er forskjellen?",
    prompt: "Velg det som er RIKTIG.",
    topic: "Brukere & rettigheter",
    question: "Hvilken påstand om sudo og su er RIKTIG?",
    options: [
      {
        text: "sudo krever ditt eget passord, su krever målbrukerens passord",
        correct: true,
        rationale:
          "sudo gir deg lov til å handle som en annen — autentiseres med ditt passord. su bytter til en annen bruker — autentiseres med dens passord.",
      },
      {
        text: "sudo og su er identiske kommandoer",
        correct: false,
        rationale: "Ulike: sudo kjører én kommando, su åpner en ny shell.",
      },
      {
        text: "su krever ditt eget passord, sudo krever root-passord",
        correct: false,
        rationale: "Motsatt. su krever målbrukerens passord, sudo krever DITT eget.",
      },
      {
        text: "Begge to logger ingenting",
        correct: false,
        rationale: "sudo logger hver bruk i /var/log/auth.log — viktig for sporbarhet.",
      },
    ],
  },
  {
    id: "d-fill-useradd",
    kind: "fill",
    title: "useradd — opprett bruker med hjem og bash",
    prompt: "Fyll inn flaggene for å lage bruker med hjemmekatalog og bash.",
    topic: "Brukere & rettigheter",
    template: "sudo useradd __1__ __2__ /bin/bash alice",
    blanks: ["-m", "-s"],
    options: ["-m", "-s", "-d", "-g", "-G", "-u", "-r"],
    explanation:
      "-m lager hjemmekatalogen, -s setter login-shell. Uten -m får brukeren ingen /home/alice.",
  },
  {
    id: "d-fill-usermod-group",
    kind: "fill",
    title: "Legg bruker til sudo-gruppe (uten å miste eksisterende)",
    prompt: "Fyll inn riktig flagg-kombinasjon.",
    topic: "Brukere & rettigheter",
    template: "sudo usermod __1__ sudo alice",
    blanks: ["-aG"],
    options: ["-aG", "-G", "-g", "-A", "-a", "-r"],
    explanation:
      "-aG = append til Groups. Bare -G uten -a OVERSKRIVER eksisterende gruppemedlemskap — kan låse brukeren ute.",
  },
  {
    id: "d-match-acl-vs-rwx",
    kind: "match",
    title: "ACL vs DAC vs MAC",
    prompt: "Match tilgangsmodellen til kjennetegnet.",
    topic: "Brukere & rettigheter",
    pairs: [
      { left: "DAC (rwx)", right: "Discretionary — eieren bestemmer hvem som har tilgang" },
      { left: "ACL (setfacl)", right: "Fingerkornet — gi spesifikke brukere/grupper rettigheter utover owner/group/other" },
      { left: "MAC (SELinux/AppArmor)", right: "Mandatory — kernelen håndhever policy, selv root kan blokkeres" },
      { left: "Sticky bit (1777)", right: "Brukes på /tmp — bare eieren kan slette sine egne filer" },
      { left: "SUID (4xxx)", right: "Kjør som filens eier — f.eks. /usr/bin/passwd kjører som root" },
    ],
  },
  {
    id: "d-quiz-private-ssh",
    kind: "quiz",
    title: "Riktige rettigheter på ~/.ssh/id_rsa",
    prompt: "ssh-klienten nekter å bruke private nøkler som er for åpne.",
    topic: "Brukere & rettigheter",
    question: "Hvilke rettigheter må private SSH-nøkkelen ~/.ssh/id_rsa ha?",
    options: [
      {
        text: "600 (rw-------) — bare eier leser og skriver",
        correct: true,
        rationale:
          "ssh sjekker dette og nekter å bruke nøkkelen ellers. 600 = ingen tilgang for gruppe eller andre.",
      },
      {
        text: "644 (rw-r--r--) — vanlig tekstfil-rettighet",
        correct: false,
        rationale: "Andre kan lese — privat nøkkel blir kompromittert. ssh nekter.",
      },
      {
        text: "777 (rwxrwxrwx) — alle får alt",
        correct: false,
        rationale: "Verst mulig — alle kan lese den private nøkkelen.",
      },
      {
        text: "700 (rwx------) — eier får execute også",
        correct: false,
        rationale: "Vil teknisk fungere, men x trengs ikke for en nøkkelfil. 600 er konvensjonen.",
      },
    ],
  },

  // ============ VIRTUALISERING ============
  {
    id: "d-match-vm-vs-container",
    kind: "match",
    title: "VM vs container — hva er hva?",
    prompt: "Match egenskapen til riktig teknologi.",
    topic: "Virtualisering",
    pairs: [
      { left: "Egen kernel per instans", right: "Virtuell maskin (VM)" },
      { left: "Deler vert-OS sin kernel", right: "Container" },
      { left: "Boot tar minutter, GB med RAM", right: "Virtuell maskin (VM)" },
      { left: "Starter på sekunder, MB med RAM", right: "Container" },
      { left: "Kan kjøre Windows på Linux-host", right: "Virtuell maskin (VM)" },
      { left: "Isolasjon via namespaces + cgroups", right: "Container" },
    ],
  },
  {
    id: "d-quiz-hypervisor-type",
    kind: "quiz",
    title: "Type 1 vs Type 2 hypervisor",
    prompt: "Velg riktig.",
    topic: "Virtualisering",
    question: "Hva er forskjellen på Type 1 og Type 2 hypervisor?",
    options: [
      {
        text: "Type 1 kjører direkte på maskinvaren (bare-metal); Type 2 kjører oppå et vanlig OS",
        correct: true,
        rationale:
          "Type 1: ESXi, Hyper-V, KVM, Xen — brukes i datasentre. Type 2: VirtualBox, VMware Workstation — på en vanlig PC.",
      },
      {
        text: "Type 1 er for containere, Type 2 er for VM-er",
        correct: false,
        rationale: "Begge er hypervisors for VM-er. Containere bruker andre teknologier (Docker, containerd).",
      },
      {
        text: "Type 1 er åpen kildekode, Type 2 er proprietær",
        correct: false,
        rationale: "Begge typer har både åpne og proprietære implementasjoner.",
      },
      {
        text: "Det finnes ingen praktisk forskjell",
        correct: false,
        rationale: "Type 1 har mindre overhead og brukes i prod-datasentre. Type 2 er enklere for dev/testing.",
      },
    ],
  },
  // ============ DTE-2501: SØK (AI) ============
  {
    id: "d-match-sok-frontier",
    kind: "match",
    title: "Søkealgoritme → frontier-datastruktur",
    prompt: "Match hver søkealgoritme til datastrukturen den bruker for frontier.",
    topic: "Søk (AI)",
    pairs: [
      { left: "BFS", right: "FIFO-kø — pakker ut grunne noder først" },
      { left: "DFS", right: "LIFO-stack — pakker ut dypeste node først" },
      { left: "UCS (Dijkstra)", right: "Prioritetskø sortert på g(n)" },
      { left: "Greedy best-first", right: "Prioritetskø sortert på h(n)" },
      { left: "A*", right: "Prioritetskø sortert på f(n) = g(n) + h(n)" },
    ],
    explanation:
      "Alle disse algoritmene har samme «graph search»-skjelett. Det eneste som varierer er hvordan frontier-en sorterer noder. Det er en god ting å huske: skjelett + datastruktur = algoritme.",
  },
  {
    id: "d-quiz-bfs-vs-dfs",
    kind: "quiz",
    title: "BFS eller DFS?",
    prompt: "Velg riktig.",
    topic: "Søk (AI)",
    question:
      "Du leter etter den GRUNNESTE løsningen i et tilstandsrom hvor alle kantkostnader er like. Hvilken algoritme passer best?",
    options: [
      {
        text: "BFS — fordi den utforsker nivå for nivå og finner grunneste mål først",
        correct: true,
        rationale:
          "BFS pakker noder ut i den rekkefølgen de ble lagt til (FIFO), så alle noder i dybde d er utforsket før dybde d+1. Det garanterer grunneste mål med like kostnader.",
      },
      {
        text: "DFS — fordi den er minne-effektiv",
        correct: false,
        rationale:
          "DFS er minne-effektiv, men kan finne et dypere mål før det grunneste. Den er ikke optimal selv med like kostnader.",
      },
      {
        text: "Greedy best-first",
        correct: false,
        rationale:
          "Greedy bruker en heuristikk. Oppgaven sa ingenting om heuristikk, og greedy er uansett ikke optimal.",
      },
      {
        text: "Alle gir samme svar",
        correct: false,
        rationale:
          "Nei — BFS og UCS er optimale med like kostnader; DFS og greedy er det ikke.",
      },
    ],
  },
  {
    id: "d-quiz-a-star-optimal",
    kind: "quiz",
    title: "Når er A* optimal?",
    prompt: "Velg riktig.",
    topic: "Søk (AI)",
    question: "Hvilken egenskap garanterer at A* med graph search finner den optimale løsningen?",
    options: [
      {
        text: "h(n) er konsistent (monotonic)",
        correct: true,
        rationale:
          "Konsistens (h(n) ≤ c(n,n') + h(n')) er det sterke kravet for graph search. Det innebærer admissibility og gjør at vi ikke trenger å re-åpne lukkede noder.",
      },
      {
        text: "h(n) er admissible — men det er nok bare for tree search",
        correct: false,
        rationale:
          "Halvt riktig: admissibility alene gir optimal A* i TREE search, men ikke i graph search.",
      },
      {
        text: "h(n) er null overalt",
        correct: false,
        rationale:
          "Da reduseres A* til UCS — fortsatt optimalt, men ikke fordi heuristikken er bra.",
      },
      {
        text: "h(n) er stor og presis",
        correct: false,
        rationale:
          "«Stor» kan bety overestimering, og da bryter den admissibility — A* slutter å være optimal.",
      },
    ],
  },
  {
    id: "d-match-heuristikk-problem",
    kind: "match",
    title: "Heuristikk → problem",
    prompt: "Match en god heuristikk til problemet den passer på.",
    topic: "Søk (AI)",
    pairs: [
      { left: "8-puzzle", right: "Sum av Manhattan-distanse fra hver brikke til sin målposisjon" },
      { left: "Romania-kart (vei)", right: "Rettlinjet luftavstand til Bucharest" },
      { left: "Rutenett-pathfinding (4-naboer)", right: "Manhattan-distanse til mål" },
      { left: "Rutenett-pathfinding (8-naboer)", right: "Chebyshev- eller diagonal-distanse" },
      { left: "Travelling Salesman", right: "Minimum spanning tree over gjenværende byer" },
    ],
    explanation:
      "En god heuristikk er admissible (undervurderer aldri) og så NÆR den faktiske kosten som mulig. Manhattan dominerer «antall feilplasserte» fordi den teller minst like mye.",
  },
  {
    id: "d-match-admissible-vs-konsistent",
    kind: "match",
    title: "Admissible vs konsistent",
    prompt: "Match begrepet til riktig betingelse.",
    topic: "Søk (AI)",
    pairs: [
      { left: "Admissible", right: "h(n) ≤ faktisk kostnad fra n til mål" },
      { left: "Konsistent", right: "h(n) ≤ c(n, n') + h(n') for hver nabo n'" },
      { left: "Konsistent ⇒ admissible", right: "Ja — konsistens er det sterkere kravet" },
      { left: "Admissible ⇒ A* optimal", right: "Ja, i TREE search" },
      { left: "Konsistent ⇒ A* optimal", right: "Ja, også i GRAPH search" },
    ],
    explanation:
      "I praksis: hvis du designer en heuristikk og kan vise konsistens, har du gratis admissibility OG en garanti om at graph search-versjonen av A* fortsatt er optimal.",
  },
  {
    id: "d-order-astar-bfs",
    kind: "order",
    title: "A*-besøksrekkefølge — Romania",
    prompt:
      "Vi kjører A* fra Arad mot Bucharest med h = luftavstand. Sortér de første nodene som ekspanderes (lavest f først).",
    topic: "Søk (AI)",
    items: [
      "Arad        (f = 366)",
      "Sibiu       (f = 393)",
      "Rimnicu V.  (f = 413)",
      "Fagaras     (f = 415)",
      "Pitesti     (f = 417)",
      "Bucharest   (f = 418)",
    ],
    explanation:
      "f(n) = g(n) + h(n). A* pakker alltid ut den frontier-noden med lavest f først. Dette er den klassiske rekkefølgen fra Russell & Norvig (kap. 3).",
  },
  {
    id: "d-fill-astar-pseudo",
    kind: "fill",
    title: "Fyll inn A*-pseudokoden",
    prompt: "Dra de riktige uttrykkene inn i pseudokoden.",
    topic: "Søk (AI)",
    template:
      "frontier <- priority_queue sortert på __1__\nwhile frontier ikke tom:\n  n <- frontier.pop()       # lavest f\n  if goal_test(n): return path(n)\n  for child in expand(n):\n    g(child) = g(n) + __2__\n    f(child) = __3__ + h(child)\n    frontier.add(child)",
    blanks: ["f(n)", "cost(n, child)", "g(child)"],
    options: ["f(n)", "h(n)", "g(n)", "cost(n, child)", "g(child)", "h(child)", "depth(n)"],
    explanation:
      "Husk forskjellen på g (akkumulert reell kostnad så langt) og h (estimert resterende kostnad). f = g + h er kompasset til A*.",
  },
  {
    id: "d-quiz-greedy-pitfall",
    kind: "quiz",
    title: "Hvorfor er greedy ikke optimal?",
    prompt: "Velg riktig.",
    topic: "Søk (AI)",
    question:
      "Greedy best-first bruker bare h(n) — hvorfor er det ikke garantert å finne den optimale veien?",
    options: [
      {
        text: "Den ignorerer g(n) — hvor mye det HAR kostet å komme hit",
        correct: true,
        rationale:
          "Ved bare å se på h kan greedy velge en kortvarig svak omvei som ser bra ut på luftavstand, men koster mye i reelle stegkostnader.",
      },
      {
        text: "Den bruker BFS-kø i stedet for prioritetskø",
        correct: false,
        rationale: "Nei, greedy bruker prioritetskø sortert på h(n).",
      },
      {
        text: "Den er ikke complete heller",
        correct: false,
        rationale:
          "Helt riktig at greedy uten cycle-check kan loope, men SPØRSMÅLET er om optimalitet — og roten der er at den ignorerer g.",
      },
      {
        text: "Heuristikken er aldri admissible",
        correct: false,
        rationale:
          "Admissibility har ikke noe å gjøre med det. Selv med en perfekt admissible h, kan greedy velge feil fordi den glemmer g.",
      },
    ],
  },
  {
    id: "d-match-egenskap-algoritme",
    kind: "match",
    title: "Egenskap → algoritme",
    prompt: "Match egenskapen til den ENE algoritmen den beskriver best.",
    topic: "Søk (AI)",
    pairs: [
      { left: "Optimal med ulike kostnader, ingen heuristikk", right: "UCS" },
      { left: "Optimal med admissible h, lite minne i tree search", right: "A*" },
      { left: "Minne O(b·d), optimal med like kostnader", right: "IDS" },
      { left: "Minne O(b·m), ikke optimal", right: "DFS" },
      { left: "Aldri optimal — bruker bare h", right: "Greedy best-first" },
    ],
  },
  {
    id: "d-quiz-completeness",
    kind: "quiz",
    title: "DFS og completeness",
    prompt: "Velg riktig.",
    topic: "Søk (AI)",
    question:
      "Hvorfor sier vi at standard DFS IKKE er complete på et generelt søkeproblem?",
    options: [
      {
        text: "Den kan låse seg i en uendelig gren før den finner målet",
        correct: true,
        rationale:
          "Hvis tilstandsrommet er uendelig (eller har sykler uten cycle-check), kan DFS følge én gren for alltid og aldri komme tilbake til andre.",
      },
      {
        text: "Den bruker for mye minne",
        correct: false,
        rationale:
          "DFS bruker tvert imot LITE minne — det er én av styrkene. Completeness handler om noe annet.",
      },
      {
        text: "Den krever heuristikk",
        correct: false,
        rationale: "DFS er en uinformert algoritme — bruker ingen heuristikk.",
      },
      {
        text: "Den finner alltid målet, men kanskje sent",
        correct: false,
        rationale: "Det er DEFINISJONEN av complete — å si den IKKE er complete er nettopp å si at den kan misse målet.",
      },
    ],
  },

  // ============ DTE-2501: CSP ============
  {
    id: "d-match-csp-komponenter",
    kind: "match",
    title: "CSP — komponenter",
    prompt: "Match hvert symbol til hva det representerer i et CSP.",
    topic: "CSP",
    pairs: [
      { left: "X = {X1, ..., Xn}", right: "Variabler" },
      { left: "D = {D1, ..., Dn}", right: "Domener — tillatte verdier per variabel" },
      { left: "C = {C1, ..., Cm}", right: "Begrensninger mellom variabler" },
      { left: "(scope, rel)", right: "Selve formen til en begrensning" },
      { left: "Tildeling {Xi = vi}", right: "En partiell eller fullstendig løsning" },
    ],
  },
  {
    id: "d-match-heuristikk-csp",
    kind: "match",
    title: "CSP-heuristikk → strategi",
    prompt: "Match hver heuristikk til hva den optimerer.",
    topic: "CSP",
    pairs: [
      { left: "MRV (minimum remaining values)", right: "Velg variabel med MINST igjen i domenet" },
      { left: "Degree heuristic", right: "Tiebreaker for MRV: flest constraints mot uassignede" },
      { left: "LCV (least constraining value)", right: "Velg verdi som fjerner FÆRREST muligheter hos naboer" },
      { left: "Forward checking", right: "Etter tildeling: fjern verdien fra naboers domener" },
      { left: "AC-3", right: "Propager arc consistency over alle arcs til intet endres" },
    ],
    explanation:
      "MRV er «fail-first» på variabel-valg; LCV er «succeed-first» på verdi-valg. Asymmetrien gir mening fordi vi vil finne ÉN løsning raskest mulig.",
  },
  {
    id: "d-order-ac3-trace",
    kind: "order",
    title: "AC-3 — kartfarging-trace",
    prompt:
      "Vi har tre regioner A, B, C med D = {rød, grønn, blå}. Constraints: A != B, B != C, A != C. Hva er rekkefølgen av AC-3-steg når vi setter A = rød først?",
    topic: "CSP",
    items: [
      "Sett A = {rød}",
      "Revider arc (B, A): fjern rød fra D(B) -> D(B) = {grønn, blå}",
      "Revider arc (C, A): fjern rød fra D(C) -> D(C) = {grønn, blå}",
      "Revider arc (B, C): ingen endring (begge har grønn og blå)",
      "Revider arc (C, B): ingen endring",
      "AC-3 ferdig: alle arcs konsistente",
    ],
    explanation:
      "AC-3 itererer over alle arcs og REVIDERER hvert venstre-domene. Når et domene endres, må alle arcs INN mot den variabelen testes på nytt. Her er det ingen videre propagering nødvendig.",
  },
  {
    id: "d-quiz-mrv-vs-degree",
    kind: "quiz",
    title: "Når bruker vi degree heuristic?",
    prompt: "Velg riktig.",
    topic: "CSP",
    question:
      "I starten av en kartfarging-CSP har alle variabler domene-størrelse 3. MRV gir ingen klar vinner. Hva gjør degree-heuristikken?",
    options: [
      {
        text: "Velger variabelen med flest begrensninger mot uassignede variabler",
        correct: true,
        rationale:
          "Den «mest sosiale» variabelen — den med flest naboer i constraint graph — er ofte den som propagerer flest konsekvenser. Bra fail-first når MRV er tie.",
      },
      {
        text: "Velger en tilfeldig variabel",
        correct: false,
        rationale:
          "Det ville vært å gi opp. Degree-heuristikken bruker grafstrukturen til å bryte tie-en smart.",
      },
      {
        text: "Velger den variabelen som har lavest verdi-index",
        correct: false,
        rationale: "Tilfeldig avhengig av variabel-navngivning — ikke en heuristikk.",
      },
      {
        text: "Velger variabelen med MINST grad — for å la de viktige stå urørt",
        correct: false,
        rationale: "Motsatt — vi vil tildele de mest BEGRENSEDE først, ikke de friere.",
      },
    ],
  },
  {
    id: "d-fill-backtracking",
    kind: "fill",
    title: "Backtracking — fyll inn skjelettet",
    prompt: "Dra de riktige ordene inn.",
    topic: "CSP",
    template:
      "function BACKTRACK(assignment, csp):\n  if assignment is complete: return __1__\n  var <- __2__(csp)\n  for value in ORDER-DOMAIN-VALUES(var, csp):\n    if value is consistent with assignment:\n      assignment[var] = value\n      inferences <- __3__(csp, var, value)\n      if inferences != failure:\n        result <- BACKTRACK(assignment, csp)\n        if result != failure: return result\n      remove value, undo inferences\n  return __4__",
    blanks: ["assignment", "SELECT-UNASSIGNED-VARIABLE", "INFERENCE", "failure"],
    options: [
      "assignment",
      "SELECT-UNASSIGNED-VARIABLE",
      "INFERENCE",
      "failure",
      "success",
      "csp.variables",
      "MRV",
      "value",
    ],
  },
  {
    id: "d-quiz-csp-vs-search",
    kind: "quiz",
    title: "Hvorfor backtracking og ikke A*?",
    prompt: "Velg riktig.",
    topic: "CSP",
    question:
      "Hvorfor bruker vi backtracking + constraint propagation på CSP i stedet for A*?",
    options: [
      {
        text: "Fordi en partial assignment ikke har en naturlig kost, og målet er bare konsistens — ikke optimalitet",
        correct: true,
        rationale:
          "CSP-er har ofte ingen kostnadsfunksjon. Vi vil bare finne EN lovlig tildeling. Constraint propagation er kraftigere enn heuristisk graf-søk i den settingen.",
      },
      {
        text: "Fordi A* ikke kan håndtere flere variabler",
        correct: false,
        rationale: "A* kan håndtere det fint som tilstandsrom-søk. Det er bare lite effektivt på CSP.",
      },
      {
        text: "Fordi A* er treigere asymptotisk",
        correct: false,
        rationale: "Det handler ikke om asymptotikk — det handler om hva slags problem vi løser.",
      },
      {
        text: "Fordi backtracking ALLTID finner svar raskere",
        correct: false,
        rationale: "Bare i CSP-settingen. Generelt er det forskjellige verktøy for forskjellige problemer.",
      },
    ],
  },

  // ============ DTE-2501: LOGISK RESONNERING ============
  {
    id: "d-match-konnektiv",
    kind: "match",
    title: "Logiske konnektiv",
    prompt: "Match hvert symbol til navn og betydning.",
    topic: "Logisk resonnering",
    pairs: [
      { left: "¬P", right: "Negasjon — NOT" },
      { left: "P ∧ Q", right: "Konjunksjon — AND" },
      { left: "P ∨ Q", right: "Disjunksjon — OR (inklusiv)" },
      { left: "P ⇒ Q", right: "Implikasjon — «hvis P så Q»" },
      { left: "P ⇔ Q", right: "Biimplikasjon — sann hvis P og Q har samme verdi" },
    ],
  },
  {
    id: "d-fill-modus-ponens",
    kind: "fill",
    title: "Modus ponens — fyll inn",
    prompt: "Dra de riktige formlene inn i inferensregelen.",
    topic: "Logisk resonnering",
    template: "Premisser:\n  __1__\n  __2__\n──────────\nKonklusjon:\n  __3__",
    blanks: ["α ⇒ β", "α", "β"],
    options: ["α ⇒ β", "α", "β", "¬α", "¬β", "α ∨ β", "α ∧ β"],
    explanation:
      "Modus ponens er kanskje den mest brukte inferensregelen. Sammenlign med modus TOLLENS: fra α ⇒ β og ¬β slutter vi ¬α. Begge er sound.",
  },
  {
    id: "d-quiz-modus-tollens",
    kind: "quiz",
    title: "Modus tollens — gjenkjenn formen",
    prompt: "Velg riktig.",
    topic: "Logisk resonnering",
    question:
      'Vi vet: «Hvis det regner, blir gresset vått» og «Gresset er ikke vått». Hva følger?',
    options: [
      {
        text: "Det regner ikke",
        correct: true,
        rationale:
          "Klassisk modus tollens: fra (Regn ⇒ Vått) og ¬Vått får vi ¬Regn. Det er en sound inferens.",
      },
      {
        text: "Det regner",
        correct: false,
        rationale:
          "Det ville være «affirming the consequent» eller en feilbruk av modus ponens — ikke gyldig.",
      },
      {
        text: "Gresset er vått fordi det regner",
        correct: false,
        rationale: "Premisset sier at gresset IKKE er vått. Du leser premisset feil.",
      },
      {
        text: "Vi vet ikke",
        correct: false,
        rationale: "Vi vet faktisk — modus tollens gir oss et eksakt svar.",
      },
    ],
  },
  {
    id: "d-match-pl-vs-fol",
    kind: "match",
    title: "PL vs FOL — uttrykksevne",
    prompt: "Match utsagn til om det krever PL eller FOL.",
    topic: "Logisk resonnering",
    pairs: [
      { left: "«Det regner»", right: "PL — én proposisjon" },
      { left: "«Hvis det regner, blir det vått»", right: "PL — to proposisjoner og en implikasjon" },
      { left: "«Alle mennesker er dødelige»", right: "FOL — kvantor over et domene" },
      { left: "«Det finnes en bok Per har lest»", right: "FOL — eksistens-kvantor + relasjon" },
      { left: "«Sokrates er menneske»", right: "FOL — predikat anvendt på konstant" },
    ],
    explanation:
      "PL har bare proposisjoner. FOL legger til OBJEKTER, RELASJONER mellom dem, og KVANTORER (∀, ∃). Det er prisen for å håndtere store eller uendelige domener.",
  },
  {
    id: "d-quiz-resolusjon",
    kind: "quiz",
    title: "Resolusjon — gjenkjenn steget",
    prompt: "Velg riktig.",
    topic: "Logisk resonnering",
    question: "Vi har klausulene (P ∨ Q) og (¬P ∨ R). Hva følger fra resolusjon?",
    options: [
      {
        text: "Q ∨ R",
        correct: true,
        rationale:
          "Resolusjon: når en literal og dens negasjon opptrer i hver sin klausul, faller de bort og vi får unionen av resten. P og ¬P faller bort, igjen blir Q ∨ R.",
      },
      {
        text: "P ∨ R",
        correct: false,
        rationale: "Nei — P og ¬P er nettopp det som forsvinner. Det er R og Q som overlever.",
      },
      {
        text: "Q ∧ R",
        correct: false,
        rationale: "Resolusjon gir en disjunksjon (∨) av de gjenværende literalene, ikke konjunksjon.",
      },
      {
        text: "P ∧ Q ∧ R",
        correct: false,
        rationale: "Resolusjon kombinerer to klausuler til ÉN klausul, ikke en konjunksjon av alt.",
      },
    ],
  },
  {
    id: "d-order-resolution-cnf",
    kind: "order",
    title: "Konverter P ⇒ (Q ∨ R) til CNF",
    prompt: "Sortér transformasjons-stegene fra implikasjon til CNF.",
    topic: "Logisk resonnering",
    items: [
      "Start: P ⇒ (Q ∨ R)",
      "Fjern ⇒ med α ⇒ β = ¬α ∨ β: ¬P ∨ (Q ∨ R)",
      "Flat ut assosiative ∨: ¬P ∨ Q ∨ R",
      "Resultat: én klausul {¬P, Q, R}",
    ],
    explanation:
      "CNF (konjunktiv normalform) er en konjunksjon av disjunksjoner. Hvert ledd er en klausul. Hele KB blir et SETT av klausuler, og resolusjon kjøres på dette settet.",
  },

  // ============ DTE-2501: PLANLEGGING ============
  {
    id: "d-match-strips",
    kind: "match",
    title: "STRIPS-handling — delene",
    prompt: "Match hver del av en STRIPS-handling til hva den betyr.",
    topic: "Planlegging",
    pairs: [
      { left: "Precondition", right: "Predikater som må være sanne FØR handlingen kan kjøres" },
      { left: "Add list", right: "Predikater som blir sanne ETTER handlingen" },
      { left: "Delete list", right: "Predikater som blir usanne ETTER handlingen" },
      { left: "Scope (parametere)", right: "Variablene som handlingen er parametrisert over" },
      { left: "Anvendelse", right: "Bruk: state' = (state − delete) ∪ add" },
    ],
  },
  {
    id: "d-quiz-strips-applicable",
    kind: "quiz",
    title: "Når er en STRIPS-handling anvendelig?",
    prompt: "Velg riktig.",
    topic: "Planlegging",
    question:
      "Handlingen Move(x, A, B) har precondition {On(x, A), Clear(x), Clear(B)}. I nåværende tilstand vet vi: On(C, A), Clear(C), On(D, B). Er Move(C, A, B) anvendelig?",
    options: [
      {
        text: "Nei — Clear(B) er ikke sann (D ligger på B)",
        correct: true,
        rationale:
          "ALLE preconditions må være sanne. On(C,A) og Clear(C) holder, men Clear(B) er ikke i tilstanden — D blokkerer.",
      },
      {
        text: "Ja — to av tre preconditions er oppfylt",
        correct: false,
        rationale: "Det holder ikke at to av tre er oppfylt — ALLE må være.",
      },
      {
        text: "Ja — vi kan flytte D av B underveis",
        correct: false,
        rationale:
          "Nei. STRIPS-handlinger er atomære. Du må eksplisitt kjøre Move(D, B, ...) først i planen.",
      },
      {
        text: "Nei — On(D, B) motsier handlingen",
        correct: false,
        rationale:
          "Ikke direkte motsigelse — det er at preconditions inkluderer Clear(B), som On(D, B) gjør usann.",
      },
    ],
  },
  {
    id: "d-fill-strips-effect",
    kind: "fill",
    title: "Fyll inn Fly-handlingens effect",
    prompt: "Dra inn de riktige predikatene.",
    topic: "Planlegging",
    template:
      "Action: Fly(p, from, to)\nPrecondition: At(p, from) ∧ Plane(p) ∧ Airport(from) ∧ Airport(to)\nEffect: __1__(p, to) ∧ __2__ At(p, from)",
    blanks: ["At", "¬"],
    options: ["At", "¬", "Plane", "Airport", "On", "Clear", "∧", "∨"],
    explanation:
      "Effect-notasjonen kombinerer add og delete. Positive literals (At(p, to)) er adds, negative literals (¬At(p, from)) er deletes.",
  },
  {
    id: "d-match-forward-vs-backward",
    kind: "match",
    title: "Forward vs backward planning",
    prompt: "Match egenskapen til retningen den passer.",
    topic: "Planlegging",
    pairs: [
      { left: "Søker fra start mot mål", right: "Forward (progression)" },
      { left: "Søker fra mål mot start", right: "Backward (regression)" },
      { left: "Tilstander er konkrete — alt definert", right: "Forward" },
      { left: "Tilstander er partielle — bare mål-literals", right: "Backward" },
      { left: "Bare RELEVANTE handlinger vurderes — typisk mindre branching", right: "Backward" },
    ],
    explanation:
      "Moderne planleggere som FF og Fast Downward bruker forward-søk med kraftige heuristikker. Backward-planning er historisk viktig og enklere å forstå konseptuelt.",
  },

  // ============ DTE-2501: BAYES ============
  {
    id: "d-fill-bayes-formel",
    kind: "fill",
    title: "Bayes' teorem — fyll inn",
    prompt: "Dra inn de riktige termene i Bayes-formelen.",
    topic: "Bayes",
    template: "P(H | D) = ( __1__ · __2__ ) / __3__",
    blanks: ["P(D | H)", "P(H)", "P(D)"],
    options: ["P(D | H)", "P(H)", "P(D)", "P(H | D)", "P(¬H)", "P(D ∧ H)"],
    explanation:
      "Posterior = likelihood × prior / evidens. Husk hvilken sannsynlighet som er HVA — det er den vanligste feilen.",
  },
  {
    id: "d-match-bayes-begreper",
    kind: "match",
    title: "Bayes-vokabular",
    prompt: "Match hvert term i Bayes-formelen til navn.",
    topic: "Bayes",
    pairs: [
      { left: "P(H)", right: "Prior — det vi trodde FØR vi så data" },
      { left: "P(H | D)", right: "Posterior — det vi tror ETTER å ha sett data" },
      { left: "P(D | H)", right: "Likelihood — hvor sannsynlig er data hvis H er sann?" },
      { left: "P(D)", right: "Evidens / marginal — normaliseringskonstanten" },
      { left: "P(H | D) ∝ P(D | H) · P(H)", right: "Når vi sammenligner hypoteser kan vi ignorere P(D)" },
    ],
  },
  {
    id: "d-quiz-sykdomstest",
    kind: "quiz",
    title: "Sykdomstest — base-rate-fellen",
    prompt: "Velg riktig.",
    topic: "Bayes",
    question:
      "P(S) = 0.01, P(+|S) = 0.99, P(+|¬S) = 0.01. Hva er P(S | +)?",
    options: [
      {
        text: "Omtrent 0.50 (50%)",
        correct: true,
        rationale:
          "P(+) = 0.99·0.01 + 0.01·0.99 = 0.0198. P(S|+) = 0.99·0.01 / 0.0198 = 0.5. Sjelden prior dominerer sterk likelihood.",
      },
      {
        text: "Omtrent 0.99 (99%)",
        correct: false,
        rationale:
          "Det er P(+|S), ikke P(S|+). Bytte av betingelse er nettopp det Bayes korrigerer for — og base-rate-fellen vi går i.",
      },
      {
        text: "Omtrent 0.01 (1%)",
        correct: false,
        rationale: "Det er den UBETINGEDE prior P(S). Vi har fått ny info (positiv test) — posterior må være høyere.",
      },
      {
        text: "Det går ikke an å regne uten P(¬S)",
        correct: false,
        rationale: "P(¬S) = 1 − P(S) = 0.99 — det er implisitt gitt.",
      },
    ],
  },
  {
    id: "d-quiz-naive-bayes-antagelse",
    kind: "quiz",
    title: "Naive Bayes — hva er «naivt»?",
    prompt: "Velg riktig.",
    topic: "Bayes",
    question: "Hva er kjerneantagelsen i en naive Bayes-klassifikator?",
    options: [
      {
        text: "Features er betinget uavhengige gitt klassen",
        correct: true,
        rationale:
          "P(x1, ..., xn | C) faktoriseres som ∏ P(xi | C). Det reduserer modellstørrelsen fra eksponentiell til lineær i antall features.",
      },
      {
        text: "Features er helt uavhengige av hverandre",
        correct: false,
        rationale:
          "Vanlig misforståelse. Antagelsen er BETINGET uavhengighet GITT klassen — ikke ubetinget uavhengighet.",
      },
      {
        text: "Alle klasser er like sannsynlige",
        correct: false,
        rationale:
          "Nei — vi multipliserer med prior P(C). Klassene kan ha ulike priorer.",
      },
      {
        text: "P(D) er null",
        correct: false,
        rationale: "Det ville gjort hele Bayes-uttrykket udefinert.",
      },
    ],
  },
  {
    id: "d-match-uavhengighet",
    kind: "match",
    title: "Uavhengighet — eksempler",
    prompt: "Match scenario til hvilken type uavhengighet det illustrerer.",
    topic: "Bayes",
    pairs: [
      { left: "To uavhengige terningkast", right: "Marginal uavhengighet: P(A ∧ B) = P(A)·P(B)" },
      { left: "Paraply ute & våte fortauer gitt at det regner", right: "Betinget uavhengig gitt regn" },
      { left: "Spam-features (ord) gitt klasse «spam»", right: "Naive Bayes-antagelsen — betinget uavhengig gitt klasse" },
      { left: "Høyde i cm & høyde i tommer", right: "STERKT avhengig — bryter naive-antagelsen" },
    ],
    explanation:
      "Marginal uavhengighet og betinget uavhengighet er forskjellige ting. Mye Bayes-intuisjon hviler på å skille de to.",
  },
  {
    id: "d-fill-naive-bayes-arg",
    kind: "fill",
    title: "Naive Bayes — klassifikator-uttrykk",
    prompt: "Fyll inn argmax-uttrykket for naive Bayes-klassifikatoren.",
    topic: "Bayes",
    template:
      "klasse = argmax over C av  __1__ · ∏ __2__\n# (vi kan droppe P(D) fordi den er felles for alle C)",
    blanks: ["P(C)", "P(xi | C)"],
    options: ["P(C)", "P(xi | C)", "P(C | xi)", "P(D)", "P(C ∧ xi)", "P(¬C)"],
    explanation:
      "Prior × produkt av likelihoods. P(D) er konstant over klassene, så vi dropper den under argmax.",
  },
  {
    id: "d-quiz-laplace-smoothing",
    kind: "quiz",
    title: "Laplace smoothing — hvorfor?",
    prompt: "Velg riktig.",
    topic: "Bayes",
    question:
      "Hvorfor legger vi til 1 i tellere og |V| i nevneren når vi estimerer P(xi | C) for naive Bayes?",
    options: [
      {
        text: "For å unngå null-sannsynligheter når en feature-verdi ikke er sett for klassen i trening",
        correct: true,
        rationale:
          "Hvis et ord aldri er sett i klassen «spam» under trening, blir P(ord | spam) = 0 og hele produktet kollapser til 0. Laplace add-1 gir små positive sannsynligheter i stedet.",
      },
      {
        text: "For å gjøre modellen tregere så den generaliserer bedre",
        correct: false,
        rationale: "Smoothing endrer ikke trenings-tid nevneverdig — det handler om null-håndtering.",
      },
      {
        text: "For å normalisere posterior til 1",
        correct: false,
        rationale: "Normalisering håndteres separat. Smoothing handler om å unngå null i likelihoodene.",
      },
      {
        text: "For å oppfylle Kolmogorovs aksiomer",
        correct: false,
        rationale: "Aksiomene oppfylles uansett. Problemet er PRAKTISK — at zero-frequency ødelegger argmax.",
      },
    ],
  },

  // ============ DTE-2802 — C# ============
  {
    id: "d-match-csharp-types",
    kind: "match",
    title: "C# primitive typer",
    prompt: "Match C#-typen til riktig beskrivelse.",
    topic: "C#",
    pairs: [
      { left: "int", right: "32-bit signert heltall" },
      { left: "long", right: "64-bit signert heltall" },
      { left: "double", right: "64-bit flytetall — IKKE for penger" },
      { left: "decimal", right: "Høy-presisjons desimaltall — for penger" },
      { left: "bool", right: "true eller false" },
      { left: "string", right: "Sekvens av tegn (referansetype)" },
      { left: "char", right: "Ett enkelt Unicode-tegn (16 bit)" },
    ],
  },
  {
    id: "d-quiz-csharp-var",
    kind: "quiz",
    title: "var vs eksplisitt type",
    prompt: "Velg det som stemmer om var i C#.",
    topic: "C#",
    question: "Hva betyr var i C#?",
    options: [
      {
        text: "Type-inferens ved kompilering — variabelen er fortsatt statisk typet",
        correct: true,
        rationale:
          "var lar kompilatoren utlede typen fra høyresida. var x = 1; gir x: int. Du kan IKKE senere skrive x = \"hei\";",
      },
      {
        text: "Dynamisk typing som i Python — typen kan endres",
        correct: false,
        rationale:
          "C# har en separat dynamic-type for det. var er ren type-inferens.",
      },
      {
        text: "Object-type som boxes alle verdier",
        correct: false,
        rationale: "Ingen boxing. var er rent kompiler-trikset — IL-en er identisk.",
      },
      {
        text: "Bare lov i Lambdas",
        correct: false,
        rationale: "var fungerer for lokale variabler overalt der typen kan utledes.",
      },
    ],
  },
  {
    id: "d-match-csharp-properties",
    kind: "match",
    title: "C# properties — varianter",
    prompt: "Match property-syntaksen til hva den gjør.",
    topic: "C#",
    pairs: [
      { left: "public int X { get; set; }", right: "Auto-property, lesbar og skrivbar" },
      { left: "public int X { get; init; }", right: "Auto-property, settes bare ved object init" },
      { left: "public int X { get; private set; }", right: "Lesbar utenfra, settbar bare innenfor klassen" },
      { left: "public int X => _x + 1;", right: "Computed, expression-bodied — read-only" },
      { left: "public int X { get; }", right: "Auto-property uten setter — må settes i konstruktør" },
    ],
  },
  {
    id: "d-fill-csharp-linq-where",
    kind: "fill",
    title: "LINQ — voksne, sortert",
    prompt: "Fyll inn LINQ-kjeden som henter voksne personer sortert på navn.",
    topic: "LINQ",
    template:
      "var voksne = personer\n    .__1__(p => p.Alder >= 18)\n    .__2__(p => p.Navn)\n    .__3__(p => p.Navn)\n    .ToList();",
    blanks: ["Where", "OrderBy", "Select"],
    options: ["Where", "OrderBy", "Select", "GroupBy", "Filter", "Map", "Sort", "Find"],
    explanation:
      "Where filtrerer, OrderBy sorterer, Select projeserer ut én verdi per element. Filter/Map er JS-navn, ikke C#.",
  },
  {
    id: "d-fill-csharp-async",
    kind: "fill",
    title: "async / await — controller-action",
    prompt: "Fyll inn async-mønsteret for en GET-action.",
    topic: "C#",
    template:
      "public __1__ Task<IActionResult> Get(int id)\n{\n    var b = __2__ _db.Books.FindAsync(id);\n    return b == null ? NotFound() : Ok(b);\n}",
    blanks: ["async", "await"],
    options: ["async", "await", "Task", "return", "void", "static"],
    explanation:
      "async i signaturen tillater await inne i metoden. await venter på Task<T> uten å blokkere tråden.",
  },
  {
    id: "d-quiz-csharp-nrt",
    kind: "quiz",
    title: "Nullable reference types — ? og !",
    prompt: "Velg det som stemmer om NRT-syntaks.",
    topic: "C#",
    question: "Hva er forskjellen på string? og string!.Length?",
    options: [
      {
        text: "string? = type som kan være null. !.Length = null-forgiving — du lover kompilatoren at den ikke er null",
        correct: true,
        rationale:
          "? på typen markerer at null er gyldig. ! på en bruk-side overstyrer kompilatorens advarsel, men kaster fortsatt NRE i runtime hvis verdien faktisk er null.",
      },
      {
        text: "string? = obligatorisk, !.Length = optional",
        correct: false,
        rationale: "Motsatt. ? = kan være null (valgfri).",
      },
      {
        text: "string? gjør at NullReferenceException ikke kan kastes",
        correct: false,
        rationale:
          "NRT er bare kompilatorsjekker — NRE kan fortsatt kastes i runtime. Kompilatoren advarer deg.",
      },
      {
        text: "! konverterer null til tom streng",
        correct: false,
        rationale: "Nei. ! suppresser bare kompilatorens null-warning på det uttrykket.",
      },
    ],
  },
  {
    id: "d-quiz-csharp-record-class",
    kind: "quiz",
    title: "record vs class",
    prompt: "Velg riktig forskjell.",
    topic: "C#",
    question: "Hva skiller record fra class i C# 9+?",
    options: [
      {
        text: "record har verdi-likhet på alle properties; class sammenligner på referanse",
        correct: true,
        rationale:
          "To records med samme verdier i alle properties er == lik. To classes med samme verdier er == ulike (med mindre du overrider Equals).",
      },
      {
        text: "record er en value type (struct)",
        correct: false,
        rationale: "record er en referansetype, akkurat som class. Det finnes record struct for struct.",
      },
      {
        text: "record kan ikke ha metoder",
        correct: false,
        rationale: "record kan ha metoder, konstruktører, og alt class kan. Forskjellen er likhets-semantikk og 'with'-uttrykk.",
      },
      {
        text: "record kjører raskere fordi den ikke har konstruktør",
        correct: false,
        rationale: "Records HAR konstruktør — bare ofte autogenerert fra positional syntax.",
      },
    ],
  },
  {
    id: "d-match-csharp-async-keywords",
    kind: "match",
    title: "async-relaterte typer/nøkkelord",
    prompt: "Match til riktig betydning.",
    topic: "C#",
    pairs: [
      { left: "Task", right: "Async-operasjon uten resultatverdi" },
      { left: "Task<T>", right: "Async-operasjon som returnerer T" },
      { left: "await", right: "Vent på Task uten å blokkere tråden" },
      { left: "async", right: "Markerer metode som inneholder await" },
      { left: "Task.WhenAll", right: "Vent på flere Tasks samtidig" },
    ],
  },

  // ============ DTE-2802 — ASP.NET MVC ============
  {
    id: "d-order-mvc-request-flow",
    kind: "order",
    title: "MVC request-flyt",
    prompt: "Sortér stegene fra request til respons.",
    topic: "ASP.NET MVC",
    items: [
      "Browser sender HTTP-request",
      "Routing-middleware matcher URL mot mønster {controller}/{action}/{id?}",
      "Controller-klasse instansieres med DI (services injiseres)",
      "Action-metoden kjører — henter/manipulerer model",
      "Action returnerer View(model) eller RedirectToAction(...)",
      "Razor-engine rendrer .cshtml-fil til HTML med modellen",
      "HTML-respons sendes til browser",
    ],
    explanation:
      "Routing først, så instansiering med DI, så action, så view-rendering. PRG-mønsteret betyr at POST ofte avslutter med RedirectToAction i stedet for return View().",
  },
  {
    id: "d-fill-mvc-route-pattern",
    kind: "fill",
    title: "MVC default route-mønster",
    prompt: "Fyll inn det vanlige default-route-mønsteret.",
    topic: "ASP.NET MVC",
    template:
      "app.MapControllerRoute(\n    name: \"default\",\n    pattern: \"{__1__=Home}/{__2__=Index}/{__3__?}\");",
    blanks: ["controller", "action", "id"],
    options: ["controller", "action", "id", "view", "method", "page", "name"],
    explanation:
      "{controller=Home} = standardverdi Home hvis ikke oppgitt. {id?} = ? betyr valgfritt. /Books/Details/5 mappes da til BooksController.Details(5).",
  },
  {
    id: "d-match-mvc-validation-attrs",
    kind: "match",
    title: "Validation-attributter",
    prompt: "Match attributtet til hva det validerer.",
    topic: "ASP.NET MVC",
    pairs: [
      { left: "[Required]", right: "Feltet kan ikke være null eller tom" },
      { left: "[StringLength(50)]", right: "Maks 50 tegn" },
      { left: "[Range(1, 100)]", right: "Tall mellom 1 og 100" },
      { left: "[EmailAddress]", right: "Må være gyldig e-postadresse" },
      { left: "[RegularExpression(\"...\")]", right: "Må matche regex-mønsteret" },
      { left: "[Compare(\"Passord\")]", right: "Verdi må være lik annet felt" },
    ],
  },
  {
    id: "d-quiz-mvc-tempdata",
    kind: "quiz",
    title: "TempData vs ViewData vs ViewBag",
    prompt: "Velg riktig.",
    topic: "ASP.NET MVC",
    question:
      "Du lagrer en bok, redirecter til Index og vil vise «Bok lagret!». Hvilken brukes?",
    options: [
      {
        text: "TempData — fordi den lever over en redirect (én neste request)",
        correct: true,
        rationale:
          "TempData er designet for flash-meldinger. ViewData/ViewBag dør ved redirect siden de bare lever én request.",
      },
      {
        text: "ViewData — fordi den er sterkest typet",
        correct: false,
        rationale: "ViewData er Dictionary<string, object> — ikke sterkt typet, og dør ved redirect.",
      },
      {
        text: "ViewBag — fordi den er dynamic",
        correct: false,
        rationale: "ViewBag er bare dynamic wrapper rundt ViewData. Samme levetid.",
      },
      {
        text: "Session — fordi den er global",
        correct: false,
        rationale:
          "Session kunne fungert, men er overkill og lever altfor lenge. TempData er rett verktøy.",
      },
    ],
  },
  {
    id: "d-fill-mvc-razor",
    kind: "fill",
    title: "Razor — loop med model",
    prompt: "Fyll inn Razor-syntaks for å vise en liste.",
    topic: "ASP.NET MVC",
    template:
      "__1__ IEnumerable<Book>\n\n<ul>\n@__2__ (var b in Model)\n{\n    <li>__3__ b.Tittel</li>\n}\n</ul>",
    blanks: ["@model", "foreach", "@"],
    options: ["@model", "foreach", "@", "@foreach", "@for", "model", "Model"],
    explanation:
      "@model deklarerer Model-typen. @foreach (eller bare 'foreach' inni @{}-blokk) gir C#-loop. @-prefiks bytter fra HTML til C#-uttrykk.",
  },
  {
    id: "d-quiz-mvc-antiforgery",
    kind: "quiz",
    title: "AntiForgeryToken",
    prompt: "Velg riktig.",
    topic: "ASP.NET MVC",
    question: "Hvorfor brukes [ValidateAntiForgeryToken] på POST-actioner?",
    options: [
      {
        text: "Beskyttelse mot CSRF — angriper på annet domene kan ikke forfalske POST-requests",
        correct: true,
        rationale:
          "Token sendes med form og må matche cookien. Angriper-domenet kan ikke lese cookien (same-origin), så POST avvises.",
      },
      {
        text: "Beskyttelse mot SQL injection",
        correct: false,
        rationale: "SQL injection unngås med parameterisering, ikke anti-forgery tokens.",
      },
      {
        text: "Beskyttelse mot XSS",
        correct: false,
        rationale: "XSS-beskyttelse er Razor sin automatiske HTML-encoding.",
      },
      {
        text: "Krypterer data i transit",
        correct: false,
        rationale: "Det er HTTPS sin jobb. Anti-forgery handler om request-opphav.",
      },
    ],
  },

  // ============ DTE-2802 — Web API ============
  {
    id: "d-match-webapi-verbs",
    kind: "match",
    title: "HTTP-verb til attributt",
    prompt: "Match handlingen til riktig HTTP-attributt.",
    topic: "ASP.NET Web API",
    pairs: [
      { left: "Hente liste eller én ressurs", right: "[HttpGet]" },
      { left: "Opprette ny ressurs", right: "[HttpPost]" },
      { left: "Erstatte hele ressursen", right: "[HttpPut]" },
      { left: "Slette ressursen", right: "[HttpDelete]" },
      { left: "Endre noen felter på ressursen", right: "[HttpPatch]" },
    ],
  },
  {
    id: "d-quiz-webapi-201",
    kind: "quiz",
    title: "POST som lykkes — hvilken status?",
    prompt: "Velg riktig action result.",
    topic: "ASP.NET Web API",
    question:
      "En POST /api/users opprettet en ny bruker. Hvilken metode bør du returnere?",
    options: [
      {
        text: "CreatedAtAction(nameof(Get), new { id = u.Id }, u) — 201 Created med Location-header",
        correct: true,
        rationale:
          "201 Created er semantisk riktig for POST som lager ressurs. Location-headeren peker på den nye ressursen så klienten kan slå den opp.",
      },
      {
        text: "Ok(u) — 200 OK",
        correct: false,
        rationale: "200 OK fungerer teknisk, men 201 Created er mer presist for «ny ressurs ble laget».",
      },
      {
        text: "NoContent() — 204",
        correct: false,
        rationale: "204 brukes ved suksess UTEN body. POST returnerer typisk den nye ressursen.",
      },
      {
        text: "Accepted() — 202",
        correct: false,
        rationale: "202 betyr «mottatt for prosessering», ikke «ferdig opprettet». Brukes ved asynkrone jobber.",
      },
    ],
  },
  {
    id: "d-match-webapi-results",
    kind: "match",
    title: "ActionResult-metoder til statuskode",
    prompt: "Match hjelpe-metode til HTTP-status den returnerer.",
    topic: "ASP.NET Web API",
    pairs: [
      { left: "Ok()", right: "200 OK" },
      { left: "CreatedAtAction(...)", right: "201 Created" },
      { left: "NoContent()", right: "204 No Content" },
      { left: "BadRequest()", right: "400 Bad Request" },
      { left: "Unauthorized()", right: "401 Unauthorized" },
      { left: "NotFound()", right: "404 Not Found" },
      { left: "Conflict()", right: "409 Conflict" },
    ],
  },
  {
    id: "d-match-webapi-binding",
    kind: "match",
    title: "Model binding — kilder",
    prompt: "Match parameter-attributtet til hvor data hentes fra.",
    topic: "ASP.NET Web API",
    pairs: [
      { left: "[FromRoute]", right: "Verdi tatt fra URL-segment ({id})" },
      { left: "[FromQuery]", right: "Verdi tatt fra query string (?q=...)" },
      { left: "[FromBody]", right: "JSON i request-body" },
      { left: "[FromHeader]", right: "HTTP-header (f.eks. X-Api-Key)" },
      { left: "[FromForm]", right: "multipart/form-data — typisk fil-upload" },
    ],
  },
  {
    id: "d-quiz-webapi-cors-order",
    kind: "quiz",
    title: "CORS — middleware-rekkefølge",
    prompt: "Hvor i pipelinen plasseres UseCors?",
    topic: "ASP.NET Web API",
    question:
      "Hvor i Program.cs må app.UseCors(\"policy\") komme for at CORS-headerne skal funke?",
    options: [
      {
        text: "Før UseAuthorization og MapControllers — slik at preflight ikke blir blokkert av auth",
        correct: true,
        rationale:
          "Preflight (OPTIONS) blir 401 hvis Authorization kjører først. CORS legger på headerne FØR auth-sjekken slipper browseren videre.",
      },
      {
        text: "Helt sist — etter MapControllers",
        correct: false,
        rationale:
          "Middleware etter MapControllers kjører ikke — pipelinen er allerede ferdig. CORS-header må legges på FØR responsen sendes.",
      },
      {
        text: "Rekkefølgen er irrelevant",
        correct: false,
        rationale: "Rekkefølgen er kritisk — det er hele poenget med en pipeline.",
      },
      {
        text: "Den må kalles inne i hver controller-action",
        correct: false,
        rationale: "UseCors er middleware på app-nivå. Du kan i tillegg legge [EnableCors] på enkelt-actioner.",
      },
    ],
  },
  {
    id: "d-fill-webapi-attribute-routing",
    kind: "fill",
    title: "Attribute routing — controller + action",
    prompt: "Fyll inn attributtene for et CRUD-endepunkt.",
    topic: "ASP.NET Web API",
    template:
      "[__1__]\n[Route(\"api/[__2__]\")]\npublic class UsersController : ControllerBase\n{\n    [__3__(\"{id:int}\")]\n    public IActionResult Get(int id) { ... }\n}",
    blanks: ["ApiController", "controller", "HttpGet"],
    options: ["ApiController", "controller", "HttpGet", "HttpPost", "Route", "FromRoute", "action"],
    explanation:
      "[ApiController] aktiverer automatisk validering. [controller] erstattes med klassenavnet uten 'Controller'-suffiks (Users). [HttpGet(\"{id:int}\")] matcher GET /api/users/42.",
  },

  // ============ DTE-2802 — EF Core ============
  {
    id: "d-fill-efcore-dbcontext",
    kind: "fill",
    title: "DbContext med DbSet",
    prompt: "Fyll inn DbContext-skjelettet.",
    topic: "EF Core",
    template:
      "public class AppDb : __1__\n{\n    public AppDb(DbContextOptions<AppDb> opts) : base(opts) { }\n\n    public __2__<Book> Books => Set<Book>();\n    public __2__<Forfatter> Forfattere => Set<Forfatter>();\n}",
    blanks: ["DbContext", "DbSet"],
    options: ["DbContext", "DbSet", "DataContext", "TableSet", "Table", "Entity", "Db"],
    explanation:
      "Arv fra DbContext, eksponer hver tabell som DbSet<T>. EF Core utleder tabellnavnet (vanligvis klassenavnet eller pluralisert).",
  },
  {
    id: "d-order-efcore-migrations",
    kind: "order",
    title: "EF Core migrations — første kjøring",
    prompt: "Sortér stegene for å lage og kjøre første migrasjon.",
    topic: "EF Core",
    items: [
      "Installer EF CLI: dotnet tool install --global dotnet-ef",
      "Definer entity-klasser + DbContext + DbSet-properties",
      "Registrer DbContext i Program.cs med AddDbContext + UseSqlServer",
      "Kjør dotnet ef migrations add InitialCreate — genererer migrasjons-fil",
      "Kjør dotnet ef database update — applier migrasjonen på DB",
    ],
    explanation:
      "Modellen først, så Program.cs-registrering så CLI vet hvilken context, så migrate-add, så database update. Migrasjons-fila kan inspiseres før du kjører den.",
  },
  {
    id: "d-quiz-efcore-linq-to-sql",
    kind: "quiz",
    title: "LINQ til SQL — når går det galt?",
    prompt: "Velg det mest sannsynlige problemet.",
    topic: "EF Core",
    code: `var b = await _db.Books.ToListAsync();
var f = b.Where(x => x.Tittel.StartsWith(\"A\")).ToList();`,
    language: "javascript",
    question: "Hva er problemet med denne koden?",
    options: [
      {
        text: "Henter HELE Books-tabellen til minnet før filtreringen — bør filtrere i SQL",
        correct: true,
        rationale:
          "Første ToListAsync materialiserer alt. Where som kommer etter kjører i minnet. Skriv heller: _db.Books.Where(...).ToListAsync() så blir det WHERE i SQL.",
      },
      {
        text: "Where støttes ikke etter ToListAsync",
        correct: false,
        rationale: "Where fungerer fint på List<T>. Problemet er ytelse, ikke kompiler-feil.",
      },
      {
        text: "Bør bruke Find i stedet for Where",
        correct: false,
        rationale: "Find tar bare primary key og returnerer én entitet. Ikke aktuelt her.",
      },
      {
        text: "Manglende await",
        correct: false,
        rationale: "Awaiten er der på første linjen. Andre linjen jobber på List<Book> som ikke trenger await.",
      },
    ],
  },
  {
    id: "d-match-efcore-relations",
    kind: "match",
    title: "EF Core relasjoner — fluent API",
    prompt: "Match relasjonsmønsteret til riktig konfigurasjon.",
    topic: "EF Core",
    pairs: [
      { left: "HasOne + WithMany", right: "Én-til-mange: én forfatter har mange bøker" },
      { left: "HasMany + WithMany", right: "Mange-til-mange: bøker har mange tags, tags har mange bøker" },
      { left: "HasOne + WithOne", right: "Én-til-én: bruker har én profil" },
      { left: "HasForeignKey", right: "Spesifiser hvilken kolonne som er FK" },
      { left: "OnDelete(Cascade)", right: "Slett barn når foreldre slettes" },
    ],
  },
  {
    id: "d-quiz-efcore-tracking",
    kind: "quiz",
    title: "AsNoTracking — når?",
    prompt: "Velg riktig bruk.",
    topic: "EF Core",
    question: "Når gir AsNoTracking() mening?",
    options: [
      {
        text: "Read-only queries der du ikke skal mutere og lagre entitetene — sparer minne og CPU",
        correct: true,
        rationale:
          "Uten tracking dropper EF Core change detection og identity resolution. 20-40% raskere på store result-sett, og mindre minnebruk.",
      },
      {
        text: "Når du vil lagre endringer — sørger for at de blir lagret",
        correct: false,
        rationale:
          "Motsatt! AsNoTracking betyr at endringer IKKE blir oppdaget av SaveChanges. Du må re-attache entiteten manuelt for å lagre.",
      },
      {
        text: "For å unngå deadlocks i transaksjoner",
        correct: false,
        rationale: "Tracking har ingenting med isolasjonsnivå eller låsing å gjøre.",
      },
      {
        text: "Når du jobber med many-to-many relasjoner",
        correct: false,
        rationale: "Tracking er ortogonalt til relasjonstype. Det handler om read vs write.",
      },
    ],
  },
  {
    id: "d-fill-efcore-include",
    kind: "fill",
    title: "Eager loading med Include",
    prompt: "Fyll inn for å laste bøker med forfatter på én spørring.",
    topic: "EF Core",
    template:
      "var bokerMedForfatter = await _db.Books\n    .__1__(b => b.Forfatter)\n    .AsNoTracking()\n    .__2__();",
    blanks: ["Include", "ToListAsync"],
    options: ["Include", "ToListAsync", "Join", "Load", "Where", "Select", "All"],
    explanation:
      "Include forteller EF Core å JOIN-e med Forfatter i samme SQL. Uten Include måtte du gjøre en ekstra query per bok (N+1).",
  },

  // ============ DTE-2802 — Blazor ============
  {
    id: "d-quiz-blazor-server-vs-wasm",
    kind: "quiz",
    title: "Blazor Server vs WebAssembly",
    prompt: "Velg riktig sammenligning.",
    topic: "Blazor",
    question:
      "Hva er hoved­forskjellen på Blazor Server og Blazor WebAssembly?",
    options: [
      {
        text: "Server: C# kjører på server, UI-diffs over SignalR. WASM: .NET-runtime lastes ned, C# kjører i browser",
        correct: true,
        rationale:
          "Server-modellen krever stabil forbindelse, gir rask oppstart, har direkte server-tilgang. WASM-modellen tar litt tid å laste men kan fungere offline og er mer SPA-aktig.",
      },
      {
        text: "Server kjører JavaScript, WASM kjører C#",
        correct: false,
        rationale: "Begge kjører C#. Server gjør det på server, WASM gjør det i browseren via dotnet.wasm.",
      },
      {
        text: "WASM er kun for desktop, Server er for web",
        correct: false,
        rationale: "Begge er web-teknologier. WASM kjører i nettleseren via WebAssembly.",
      },
      {
        text: "Server bruker REST, WASM bruker GraphQL",
        correct: false,
        rationale: "Server bruker SignalR (WebSocket) for UI-diffs. WASM kan bruke hva som helst for API-kall.",
      },
    ],
  },
  {
    id: "d-match-blazor-anatomy",
    kind: "match",
    title: "Blazor-komponent anatomi",
    prompt: "Match Blazor-direktivet til hva det gjør.",
    topic: "Blazor",
    pairs: [
      { left: "@page \"/counter\"", right: "Gjør komponenten til en rute" },
      { left: "@code { ... }", right: "C#-kode for komponenten (state, metoder)" },
      { left: "[Parameter]", right: "Property som mottar verdi fra forelder-komponent" },
      { left: "@onclick=\"...\"", right: "Bind klikk-event til C#-metode" },
      { left: "@bind", right: "Two-way databinding mellom input og C#-variabel" },
      { left: "@inject", right: "Injiser en service fra DI-containeren" },
    ],
  },
  {
    id: "d-fill-blazor-counter",
    kind: "fill",
    title: "Blazor — telleren",
    prompt: "Fyll inn den klassiske Counter-komponenten.",
    topic: "Blazor",
    template:
      "@__1__ \"/counter\"\n\n<h1>Teller: @count</h1>\n<button @__2__=\"Inc\">+</button>\n\n@__3__ {\n    private int count = 0;\n    private void Inc() => count++;\n}",
    blanks: ["page", "onclick", "code"],
    options: ["page", "onclick", "code", "route", "onchange", "bind", "inject", "if"],
    explanation:
      "@page deklarerer ruten. @onclick binder klikk-event til metoden. @code inneholder C#-tilstand og logikk.",
  },
  {
    id: "d-quiz-blazor-editform",
    kind: "quiz",
    title: "EditForm — hva gir validering?",
    prompt: "Velg riktig.",
    topic: "Blazor",
    question:
      "Hva må stå inne i en <EditForm> for at validation-attributter på modellen (som [Required]) skal trigge?",
    options: [
      {
        text: "<DataAnnotationsValidator /> som setter opp DataAnnotations-validator basert på modellens attributter",
        correct: true,
        rationale:
          "Uten DataAnnotationsValidator vil EditForm bare gjøre struktur-validering — attributtene blir ignorert. Den må stå inni EditForm.",
      },
      {
        text: "En egen [Validate]-attribute på EditForm-elementet",
        correct: false,
        rationale: "Det finnes ikke. Du trenger DataAnnotationsValidator-komponenten inni EditForm.",
      },
      {
        text: "ValidationMessage er nok i seg selv",
        correct: false,
        rationale: "ValidationMessage VISER feilmeldinger, men trigger ikke validering. Du må også ha DataAnnotationsValidator.",
      },
      {
        text: "Det kjører automatisk uten ekstra komponenter",
        correct: false,
        rationale:
          "Blazor må eksplisitt fortelles hvilken validation-mekanisme som brukes. DataAnnotationsValidator kobler attributtene inn.",
      },
    ],
  },
];
