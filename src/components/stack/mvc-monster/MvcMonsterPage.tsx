import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb, AlertTriangle } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

type LagInfo = {
  rolle: "Model" | "View" | "Controller";
  hva: string;
  filer: string;
  ansvar: string;
  kjenneord: string[];
};

const LAG: LagInfo[] = [
  {
    rolle: "Model",
    hva: "Dataen og forretningslogikken — hvordan data lagres, hentes, valideres.",
    filer: "models/user.py · models/car.py · database.py",
    ansvar:
      "Definer hvordan en User eller Car ser ut. Skriv SQL-koden som lagrer/henter. Sjekk at e-post er unik, at år > 1886, osv. Vet ingenting om HTML eller URL-er.",
    kjenneord: ["class", "SELECT/INSERT/UPDATE/DELETE", "db.commit()", "validering"],
  },
  {
    rolle: "View",
    hva: "Det brukeren ser — strukturen på HTML-en og hvordan data presenteres.",
    filer: "templates/cars/read.html · templates/users/login.html · templates/base.html",
    ansvar:
      "Vis lista over biler i en <table>. Gjengi et skjema med {{ form.field }}. Bruker Jinja for å sette inn data fra controlleren. Vet ingenting om SQL eller routing.",
    kjenneord: ["{% extends %}", "{{ ... }}", "{% for ... %}", "form-felter"],
  },
  {
    rolle: "Controller",
    hva: "Limet — tar imot HTTP-request, snakker med Model, sender data til View.",
    filer: "app.py · routes/user_manager.py · routes/cars_bp.py",
    ansvar:
      "Mottar request på en URL. Kaller `db.add_car(...)` på modellen. Velger hvilken template som skal renderes. Håndterer redirects og statuskoder. Limer alt sammen.",
    kjenneord: ["@app.route / @bp.route", "request.form", "render_template(...)", "redirect(...)"],
  },
];

const STEPS = [
  { title: "Hvorfor dele opp", anchor: "hvorfor" },
  { title: "Tre lag — Model, View, Controller", anchor: "lag" },
  { title: "Anti-pattern: alt i app.py", anchor: "anti" },
  { title: "Med Blueprints — modul-deling", anchor: "blueprints" },
  { title: "Forflyt mellom lagene", anchor: "flyt" },
];

const ANTI_PATTERN = `# DÅRLIG: alt smasket inn i én fil
@app.route("/cars/add", methods=["POST"])
def add_car():
    # — Controller-jobb: hente form-data
    make = request.form["make"]
    model = request.form["model"]
    year = int(request.form["year"])

    # — Model-jobb: validering smurt utover route-koden
    if year < 1886:
        return "Bad year", 400

    # — Model-jobb: rå SQL i routen
    cursor = mysql.connector.connect(...).cursor()
    cursor.execute(
        "INSERT INTO cars (make, model, year) VALUES (%s, %s, %s)",
        (make, model, year),
    )
    # ... og så HTML rendret med string-konkatenering også?`;

const GOOD_PATTERN = `# GODT: hver fil har én rolle
# routes/cars_bp.py  — Controller
@cars_bp.route("/cars/add", methods=["GET", "POST"])
@login_required
def add_car():
    if request.method == "POST":
        with DataBase() as db:
            db.add_car(
                make=request.form["make"],
                model=request.form["model"],
                year=int(request.form["year"]),
                owner_id=current_user.id,
            )
        return redirect(url_for("cars.all"))
    return render_template("cars/add_edit.html", car=None)


# database.py  — Model
class DataBase:
    def add_car(self, make, model, year, owner_id):
        self.cursor.execute(
            "INSERT INTO cars (make, model, year, owner_id) VALUES (%s, %s, %s, %s)",
            (make, model, year, owner_id),
        )


# templates/cars/add_edit.html  — View
{% extends "base.html" %}
{% block content %}
<form method="POST">
  <input name="make"  placeholder="Merke">
  <input name="model" placeholder="Modell">
  <input name="year"  type="number">
  <button class="btn btn-primary">Legg til</button>
</form>
{% endblock %}`;

export function MvcMonsterPage() {
  return (
    <StackPageShell title="MVC-mønsteret — Model · View · Controller" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2509 · Arkitektur-mønster
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            MVC-mønsteret — slik er en Flask-app delt opp
          </h1>
          <p className="mt-3 text-muted-foreground">
            Kurset DTE-2509 kommenterer eksplisitt{" "}
            <code>{"# MVC - Model View Controller"}</code> i app.py-filene
            (Flask_DB/Movies, MovieApp_WTForms). Det er ikke bare en konvensjon —
            det er hvordan koden faktisk er organisert. Eksamen kan be deg
            <em> peke ut hvilken fil som tilhører hvilket lag</em>.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Husk:</span> En route-funksjon (Controller)
              <em> orkestrerer</em>. Den henter ikke selv data og rendrer ikke selv HTML.
              Den DELEGERER til Model og View.
            </div>
          </div>
        </div>

        <CourseOutline courseId="mvc-monster" steps={STEPS} />

        {/* Hvorfor */}
        <section id="hvorfor" className="mb-10">
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Hvorfor dele opp i tre lag?
            </div>
            <ul className="space-y-2 text-sm text-foreground list-disc pl-5">
              <li>
                <strong>Lesbarhet:</strong> du finner SQL i Model-mappa, HTML i templates,
                routing i routes/. Ikke 400 linjer i én app.py.
              </li>
              <li>
                <strong>Gjenbruk:</strong> samme <code>add_car()</code>-metode kan kalles fra
                både POST-route og fra et script som importerer fra cron-jobben.
              </li>
              <li>
                <strong>Testing:</strong> du kan teste Model uten å starte Flask. Du kan
                rendre View med mock-data uten databasen.
              </li>
              <li>
                <strong>Sikkerhet:</strong> validering ligger ett sted (Model). Du glemmer
                den ikke en av tre steder.
              </li>
            </ul>
          </div>
        </section>

        {/* Lag */}
        <section id="lag" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Tre lag — én rolle per fil</h2>
          <div className="space-y-4">
            {LAG.map((l) => (
              <div key={l.rolle} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="rounded-full bg-brand/10 text-brand px-3 py-0.5 text-xs font-bold">
                    {l.rolle}
                  </span>
                  <span className="text-sm font-medium">{l.hva}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  <strong>Typiske filer:</strong> <code>{l.filer}</code>
                </div>
                <p className="text-sm mb-3">{l.ansvar}</p>
                <div className="flex flex-wrap gap-2">
                  {l.kjenneord.map((k) => (
                    <span
                      key={k}
                      className="font-mono text-xs px-2 py-0.5 rounded bg-background border border-border"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Anti-pattern */}
        <section id="anti" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            <AlertTriangle className="inline h-5 w-5 text-amber-500 mr-1.5 align-text-top" />
            Anti-pattern: alt i app.py
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Dette er det MVC løser — koden blir uleselig, vanskelig å teste, og
            sikkerhetsfeil sniker seg inn.
          </p>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-amber-500/30 p-3 mb-4">
            {ANTI_PATTERN}
          </pre>
          <p className="text-sm text-muted-foreground mb-3">Slik fordeles ansvarene riktig:</p>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-emerald-500/30 p-3">
            {GOOD_PATTERN}
          </pre>
        </section>

        {/* Blueprints */}
        <section id="blueprints" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Med Blueprints — modul-deling av Controller-laget</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Når Controller-laget vokser, splittes routes i flere filer via Flask Blueprints.
            Repoets <code>OvingsoppgaveCRUDCar</code> har to: <code>users_bp</code> for
            auth-routes og <code>cars_bp</code> for bil-CRUD. Hovedfilen app.py registrerer
            dem med URL-prefiks.
          </p>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">
            {`# app.py — bare oppsett, ingen routes
from routes.user_manager import users_bp, login_manager
from routes.cars_bp import cars_bp

app = Flask(__name__)
login_manager.init_app(app)

app.register_blueprint(users_bp, url_prefix='/users')
app.register_blueprint(cars_bp, url_prefix='/cars')`}
          </pre>
          <p className="text-sm text-muted-foreground mt-3">
            Hver blueprint-fil ser ut som en mini-app: egne <code>@bp.route(...)</code>-
            funksjoner, men deler app-objektet, sessions, og models med resten.
          </p>
        </section>

        {/* Flyt */}
        <section id="flyt" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Forflyt mellom lagene — én request</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Ta «brukeren legger til en ny bil»:
          </p>
          <ol className="space-y-2 text-sm list-decimal pl-5">
            <li>
              <strong>Nettleser → Controller:</strong> POST <code>/cars/cars/add</code> med
              form-data treffer <code>cars_bp.add_car</code>.
            </li>
            <li>
              <strong>Controller → Model:</strong> Routen kaller{" "}
              <code>db.add_car(make, model, year, owner_id=current_user.id)</code>.
            </li>
            <li>
              <strong>Model → MySQL:</strong> Klassen sender INSERT med parametre. Commit
              skjer i <code>__exit__</code>.
            </li>
            <li>
              <strong>Controller → View:</strong> Etter suksess →{" "}
              <code>redirect(url_for(&quot;cars.all&quot;))</code>. Det blir et nytt request
              som rendrer biloversikten.
            </li>
            <li>
              <strong>View → Nettleser:</strong> Jinja-template{" "}
              <code>cars/read.html</code> rendrer tabellen med <code>{"{% for car in cars %}"}</code>.
            </li>
          </ol>
        </section>

        {/* CTA */}
        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/prosjekt" className="text-brand hover:underline">
                Prosjekt
              </Link>
              : bygg en hel app som MVC — modeller, views og controllers fordelt riktig.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "flask-livssyklus" }}
                className="text-brand hover:underline"
              >
                Flask request-livssyklus
              </Link>
              : se hvordan Flask plukker opp en request og kaller controlleren din.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
