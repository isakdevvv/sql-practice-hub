import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb, ShieldCheck, AlertTriangle } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hva er user management?", anchor: "hva" },
  { title: "Steg 1: Registrering (med hashing)", anchor: "registrering" },
  { title: "Steg 2: Innlogging (verifiser hash)", anchor: "login" },
  { title: "Steg 3: Sessions (huske brukeren)", anchor: "session" },
  { title: "Steg 4: @login_required (beskytte ruter)", anchor: "login-required" },
  { title: "Steg 5: Logout (rydd opp)", anchor: "logout" },
  { title: "Flask-Login — gratis bibliotek", anchor: "flask-login" },
  { title: "Vanlige feller", anchor: "feller" },
];

const REGISTRER = `# routes/user_manager.py — Controller
from werkzeug.security import generate_password_hash

@users_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == "POST":
        name     = request.form['name']
        email    = request.form['email']
        password = generate_password_hash(request.form['password'])
        #                ^^^^^^^^^^^^^^^^^^^^^^
        # pbkdf2:sha256 m/ salt. ALDRI lagre klartekst.

        with DataBase() as db:
            db.create_user(name, email, password)
        return redirect(url_for('users.login'))
    return render_template("users/register.html")`;

const LOGIN = `# routes/user_manager.py — Controller
from werkzeug.security import check_password_hash
from flask_login import login_user

@users_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == "POST":
        email    = request.form['email']
        password = request.form['password']

        with DataBase() as db:
            user = db.load_user_by_email(email)
            #     (id, name, email, password_hash, role)

            if user and check_password_hash(user[3], password):
                login_user(User(user[0], user[1], user[2], user[4]))
                #   ^ Flask-Login lagrer user_id i session
                return redirect(url_for('home'))

        return render_template('users/login.html', error="Invalid credentials")
    return render_template("users/login.html")`;

const SESSION = `# Hva er en session?
#
# Når brukeren logger inn lagrer Flask user_id i en SIGNERT cookie.
# Cookien sendes med på hver request, så server vet hvem du er.
#
# Du trenger en SECRET_KEY for at signaturen skal være trygg:
import secrets
app.secret_key = secrets.token_urlsafe(16)
#                ^ Endrer du denne, blir alle innloggede brukere
#                  automatisk logget ut (signaturer matcher ikke).

# Manuelt:                                Med Flask-Login:
session['user_id'] = user.id              login_user(user_obj)
user_id = session.get('user_id')          current_user           # alltid tilgjengelig
session.pop('user_id', None)              logout_user()`;

const LOGIN_REQUIRED = `from flask_login import login_required, current_user

@app.route('/min-side')
@login_required          # <-- decorator: må være innlogget
def min_side():
    # current_user er den innloggede User
    return render_template('min_side.html', user=current_user)

# Hva skjer hvis uinnlogget bruker treffer denne routen?
# Flask-Login sender dem til login-siden:
login_manager = LoginManager()
login_manager.login_view = 'users.login'    # hvor de skal sendes
login_manager.init_app(app)`;

const LOGOUT = `from flask_login import logout_user, login_required

@app.route('/logout')
@login_required
def logout():
    logout_user()                   # fjerner user_id fra session
    return redirect(url_for("users.login"))`;

const FLASK_LOGIN_LOADER = `# Flask-Login trenger å vite hvordan en bruker-rad blir et User-objekt.
# Du forteller den med @login_manager.user_loader:

@login_manager.user_loader
def load_user(user_id):
    # user_id er strengen som ligger i session-cookien
    with DataBase() as db:
        row = db.load_user(user_id)
    if row:
        return User(row[0], row[1], row[2], row[4])
    return None

# User-klassen må arve fra UserMixin (eller implementere
# is_authenticated/is_active/is_anonymous/get_id):
from flask_login import UserMixin

class User(UserMixin):
    def __init__(self, id, name, email, role):
        self.id = id
        self.name = name
        self.email = email
        self.role = role`;

type Felle = {
  tittel: string;
  problem: string;
  fix: string;
};

const FELLER: Felle[] = [
  {
    tittel: "Klartekst-passord i databasen",
    problem:
      "INSERT INTO users (passord) VALUES (...) med rå passord. Når DB-lekkasje skjer, har angripere alle passord.",
    fix: "generate_password_hash() ved registrering, check_password_hash() ved login. Aldri klartekst, ALDRI MD5/SHA-1/SHA-256.",
  },
  {
    tittel: "Glemt @login_required",
    problem:
      "Ruten ser ut til å være beskyttet (du tester den innlogget), men uinnloggede brukere kan også treffe den. @login_required mangler.",
    fix: "Sett @login_required PÅ HVER beskyttede route. Test som uinnlogget bruker i en privat nettleser.",
  },
  {
    tittel: "Manglende SECRET_KEY",
    problem:
      "Flask kræsjer eller logger en advarsel. Sessions virker ikke. Cookien er ikke signert.",
    fix: "app.secret_key = secrets.token_urlsafe(16) — gjør dette ÉN gang ved app-oppstart. Lagre i miljøvariabel i prod.",
  },
  {
    tittel: "Login-route returnerer ALDRI feilmelding",
    problem:
      "Hvis password er feil hopper du bare ut av if-blokken og rendrer login.html uten error-message. Brukeren skjønner ikke hvorfor.",
    fix: "render_template('login.html', error='Feil brukernavn eller passord') — ikke avslør om det er e-post eller passord som er feil (info-lekkasje).",
  },
  {
    tittel: "Session-cookie uten Secure/HttpOnly/SameSite",
    problem:
      "Cookien kan stjeles via JavaScript (XSS) eller sendes ved CSRF. På HTTP kan den snifføres ren.",
    fix:
      "Sett app.config['SESSION_COOKIE_SECURE'] = True (kun HTTPS), HTTPONLY = True (default), SAMESITE = 'Lax'. Se sikkerhet-stack-leksjonen.",
  },
];

export function BrukerhandteringPage() {
  return (
    <StackPageShell
      title="Brukerhåndtering — register, login, session, logout"
      group="eksamen"
    >
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2509 · Modul 4 · User Management
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Brukerhåndtering — fra registrering til logout
          </h1>
          <p className="mt-3 text-muted-foreground">
            Modul 4 i kurset: en Flask-app skal støtte at folk{" "}
            <em>registrerer seg</em>, <em>logger inn</em>, blir <em>husket på tvers av sider</em>
            , kan <em>logge ut</em>, og at noen ruter er <em>beskyttet</em>. Repoets{" "}
            <code>UserExample</code>, <code>BlueprintExample</code> og{" "}
            <code>OvingsoppgaveCRUDCar</code> bruker samme oppskrift — vi går gjennom den steg
            for steg.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/python" className="text-brand hover:underline">
                Python-øvelsene
              </Link>{" "}
              har 14+ oppgaver under «Login & sessions», «Passord-sikkerhet» og
              «Decorators» — skriv koden selv.
            </div>
          </div>
        </div>

        <CourseOutline courseId="brukerhandtering" steps={STEPS} />

        {/* Hva er user management */}
        <section id="hva" className="mb-10">
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Fire krav, fem byggeklosser
            </div>
            <p className="text-sm text-foreground mb-3">
              Brukerhåndtering består av <strong>fire krav</strong> som Flask oppfyller med{" "}
              <strong>fem byggeklosser</strong>:
            </p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left font-semibold px-4 py-2 w-1/2">Krav</th>
                    <th className="text-left font-semibold px-4 py-2">Byggekloss</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="px-4 py-3">Lagre passord trygt</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      werkzeug.security: generate/check_password_hash
                    </td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-3">Verifisere innlogging</td>
                    <td className="px-4 py-3 font-mono text-xs">check_password_hash + login_user</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-3">Huske bruker mellom requester</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      flask.session + SECRET_KEY (signert cookie)
                    </td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-3">Beskytte ruter</td>
                    <td className="px-4 py-3 font-mono text-xs">@login_required</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-3">Identifisere innlogget bruker</td>
                    <td className="px-4 py-3 font-mono text-xs">current_user</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Registrering */}
        <section id="registrering" className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Steg 1: Registrering</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Når brukeren fyller ut et register-skjema MÅ passordet hashes før det treffer
            databasen. Vi bruker <code>werkzeug.security.generate_password_hash</code>{" "}
            (pbkdf2 med salt — slow nok til at GPU-knekking blir tregt).
          </p>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">
            {REGISTRER}
          </pre>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
            <strong>Hva blir lagret?</strong> Noe sånt som{" "}
            <code>pbkdf2:sha256:600000$abc...$xyz...</code> — algoritme, iterasjoner, salt og
            hash i ett. Selv samme passord får ulike hashes hver gang (pga salt).
          </div>
        </section>

        {/* Login */}
        <section id="login" className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Steg 2: Innlogging</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Login-routen henter brukeren basert på e-post, og sammenligner det innsendte
            passordet mot den lagrede hashen via <code>check_password_hash</code>.{" "}
            <strong>Ikke</strong> hash inputen og sammenlign strenger — funksjonen leser
            algoritme/iterasjoner/salt fra den lagrede hashen og gjør jobben.
          </p>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">
            {LOGIN}
          </pre>
        </section>

        {/* Session */}
        <section id="session" className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Steg 3: Sessions</h2>
          <p className="text-sm text-muted-foreground mb-3">
            HTTP er statsløst — server husker ingenting mellom requests. Session-cookien
            løser dette: når brukeren logger inn lagres ID-en deres i en{" "}
            <strong>signert</strong> cookie som nettleseren sender med på hver request.
          </p>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">
            {SESSION}
          </pre>
        </section>

        {/* @login_required */}
        <section id="login-required" className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Steg 4: @login_required</h2>
          <p className="text-sm text-muted-foreground mb-3">
            En decorator som limes på en route og som sjekker om brukeren er innlogget før
            funksjonen kjøres. Hvis ikke — redirect til login-siden.
          </p>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">
            {LOGIN_REQUIRED}
          </pre>
          <p className="text-sm text-muted-foreground mt-3">
            Vil du skrive din egen decorator? Det er en god eksamens-øvelse:
          </p>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3 mt-2">
            {`from functools import wraps
from flask import session, redirect, url_for

def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return wrapper`}
          </pre>
        </section>

        {/* Logout */}
        <section id="logout" className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Steg 5: Logout</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Fjern user_id fra session og redirect. Det er alt.
          </p>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">
            {LOGOUT}
          </pre>
        </section>

        {/* Flask-Login */}
        <section id="flask-login" className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Flask-Login — gratis bibliotek</h2>
          <p className="text-sm text-muted-foreground mb-3">
            <code>pip install flask-login</code> gir deg{" "}
            <code>login_user/logout_user/current_user/@login_required</code> gratis — du
            slipper å skrive decoratoren selv. Det eneste du må gjøre er å registrere en
            «user_loader» som forteller biblioteket hvordan det skal slå opp en bruker fra
            et user_id:
          </p>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">
            {FLASK_LOGIN_LOADER}
          </pre>
          <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-3 text-sm flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div>
              Repoets <code>OvingsoppgaveCRUDCar</code> bruker akkurat dette mønsteret med
              Blueprints — <code>users_bp</code> for auth, <code>cars_bp</code> for CRUD.
              Hovedfilen registrerer dem med <code>url_prefix='/users'</code> og{" "}
              <code>'/cars'</code>.
            </div>
          </div>
        </section>

        {/* Feller */}
        <section id="feller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            <AlertTriangle className="inline h-5 w-5 text-amber-500 mr-1.5 align-text-top" />
            Vanlige feller på eksamen
          </h2>
          <div className="space-y-3">
            {FELLER.map((f) => (
              <div
                key={f.tittel}
                className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"
              >
                <div className="font-semibold text-foreground mb-2">{f.tittel}</div>
                <p className="text-sm mb-2">
                  <span className="text-amber-700 dark:text-amber-400 font-semibold">
                    Problem:{" "}
                  </span>
                  {f.problem}
                </p>
                <p className="text-sm">
                  <span className="text-success font-semibold">Fiks: </span>
                  {f.fix}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/python" className="text-brand hover:underline">
                Python-øvelser
              </Link>
              : skriv hele auth-flyten selv — 4 Login & sessions + 5 Passord-sikkerhet +
              4 CSRF + 1 Decorators-øvelse.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "sikkerhet" }}
                className="text-brand hover:underline"
              >
                Web-sikkerhet
              </Link>
              : CSRF-token på alle POSTs, cookie-flagg, og hvorfor sessions må signeres.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "mvc-monster" }}
                className="text-brand hover:underline"
              >
                MVC-mønsteret
              </Link>
              : hvor user-management-koden hører hjemme (models/, templates/users/, routes/user_manager.py).
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
