import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldAlert, ShieldCheck } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";

// Security primer: SQL injection, XSS, CSRF, password storage, cookie flags.
// Each attack has: how it works, what the sårbarheten looks like, and the fix.
// Hands-on quizzes live in /drag with topic "Sikkerhet".

type Attack = {
  navn: string;
  hva: string;
  saarbarhet: string;
  saarbarhetLang?: "python" | "html" | "sql";
  fiks: string;
  fiksLang?: "python" | "html" | "sql";
};

const ATTACKS: Attack[] = [
  {
    navn: "SQL Injection",
    hva: "Angriperen smugler SQL-syntaks inn i en input som limes direkte inn i en spørring. Kan dumpe hele DB, slette tabeller, eller bypasse innlogging.",
    saarbarhet: `username = request.form["username"]
cursor.execute(
  "SELECT * FROM bruker WHERE navn = '" + username + "'"
)
# Input 'a' OR '1'='1 returnerer ALLE brukere`,
    saarbarhetLang: "python",
    fiks: `username = request.form["username"]
cursor.execute(
  "SELECT * FROM bruker WHERE navn = %s",
  (username,)   # bind-parameter — driveren håndterer escaping
)`,
    fiksLang: "python",
  },
  {
    navn: "Cross-Site Scripting (XSS)",
    hva: "Angriperen lurer en bruker til å kjøre fiendtlig JavaScript i sin egen nettleser, ofte via en kommentar-tekst som rendres på en annen brukers side.",
    saarbarhet: `{# kommentar.html — SÅRBAR #}
<div>{{ kommentar.tekst | safe }}</div>

{# Hvis tekst = '<script>fetch("/api/secret").then(...)</script>'
   så kjører scriptet i offerets browser. #}`,
    saarbarhetLang: "html",
    fiks: `{# Default: autoescape på #}
<div>{{ kommentar.tekst }}</div>

{# < blir &lt;, > blir &gt; — scriptet blir VIST som tekst,
   ikke kjørt. |safe brukes KUN på sanitisert/egengenerert HTML. #}`,
    fiksLang: "html",
  },
  {
    navn: "Cross-Site Request Forgery (CSRF)",
    hva: "Ondsinnet nettsted sender en request til din app fra brukerens nettleser. Cookien følger automatisk med — så server tror brukeren ba om handlingen.",
    saarbarhet: `<!-- ondsinnet.com har dette skjemaet skjult: -->
<form action="https://bank.no/overfor" method="POST">
  <input name="til" value="angriper" />
  <input name="belop" value="100000" />
</form>
<script>document.forms[0].submit()</script>`,
    saarbarhetLang: "html",
    fiks: `{# I form-malen: legg ved CSRF-token. Flask-WTF gir det gratis: #}
<form method="POST">
  {{ form.hidden_tag() }}
  ...
</form>

{# Server validerer at tokenet matcher det som ligger i session.
   Et ondsinnet nettsted kan ikke lese session-cookien — derfor
   ikke gjette tokenet. #}`,
    fiksLang: "html",
  },
  {
    navn: "Usikker passord-lagring",
    hva: "Passord lagres i klartekst, eller med rask hash (SHA-256). Når DB lekker, kan angripere knekke passord på sekunder med GPU.",
    saarbarhet: `# Klartekst — verst tenkelige:
cursor.execute(
  "INSERT INTO bruker (navn, passord) VALUES (%s, %s)",
  (navn, passord)
)

# SHA-256 — også dårlig (for raskt for GPU):
import hashlib
hash = hashlib.sha256(passord.encode()).hexdigest()`,
    saarbarhetLang: "python",
    fiks: `from werkzeug.security import generate_password_hash, check_password_hash

# Ved registrering:
hash = generate_password_hash(passord)  # pbkdf2:sha256 m/ salt
cursor.execute(
  "INSERT INTO bruker (navn, passord_hash) VALUES (%s, %s)",
  (navn, hash)
)

# Ved innlogging:
if check_password_hash(stored_hash, passord_input):
    # OK
    ...`,
    fiksLang: "python",
  },
  {
    navn: "Mass-assignment",
    hva: "Backend setter blindt alle felter fra request.form på user-objektet. En angriper kan da sette is_admin=true ved å legge til feltet.",
    saarbarhet: `@app.route("/profil", methods=["POST"])
def oppdater():
    user = current_user
    for key, val in request.form.items():
        setattr(user, key, val)   # <-- alle felter, ukritisk
    db.session.commit()
# Request med is_admin=true gir nå angriperen admin-tilgang.`,
    saarbarhetLang: "python",
    fiks: `@app.route("/profil", methods=["POST"])
def oppdater():
    user = current_user
    # Eksplisitt allowlist — kun disse feltene aksepteres:
    user.navn  = request.form.get("navn")
    user.epost = request.form.get("epost")
    db.session.commit()`,
    fiksLang: "python",
  },
];

const COOKIE_FLAGS = [
  { flag: "Secure", betyr: "Cookien sendes kun over HTTPS — ingen klartekst-lekkasje." },
  { flag: "HttpOnly", betyr: "JavaScript kan ikke lese cookien — XSS kan ikke stjele session." },
  { flag: "SameSite=Lax", betyr: "Cookien sendes ikke ved cross-site POST — sterk CSRF-beskyttelse." },
];

export function SikkerhetPage() {
  return (
    <StackPageShell title="Web-sikkerhet — OWASP-essensen" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Sikkerhet · Web-app
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Web-sikkerhet — angrep og forsvar
          </h1>
          <p className="mt-3 text-muted-foreground">
            De fem sårbarhetene under ser du på eksamen og i den virkelige verden.
            For hver: hvordan angrepet fungerer, hva sårbar kode ser ut, og den korrekte
            fiksen. Aldri «filtrer bort farlige tegn» — alltid riktig mekanisme.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgavene
              </Link>{" "}
              har 7+ flervalgs-spørsmål for sikkerhet — finn sårbar kode, velg riktig
              fiks.
            </div>
          </div>
        </div>

        {ATTACKS.map((a, i) => (
          <section key={a.navn} className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive text-xs font-bold">
                {i + 1}
              </span>
              <h2 className="text-xl font-semibold">{a.navn}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{a.hva}</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="h-4 w-4 text-destructive" />
                  <div className="text-xs uppercase tracking-wider text-destructive font-semibold">
                    Sårbar kode
                  </div>
                </div>
                <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">
                  {a.saarbarhet}
                </pre>
              </div>
              <div className="rounded-xl border border-success/30 bg-success/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  <div className="text-xs uppercase tracking-wider text-success font-semibold">
                    Trygg fiks
                  </div>
                </div>
                <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">
                  {a.fiks}
                </pre>
              </div>
            </div>
          </section>
        ))}

        {/* Cookies */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Bonus: Sikre cookies</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tre flagg som hever beskyttelsen dramatisk. I Flask:
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`app.config["SESSION_COOKIE_SECURE"]   = True
app.config["SESSION_COOKIE_HTTPONLY"] = True   # default
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"`}</pre>
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Flagg</th>
                  <th className="text-left font-semibold px-4 py-2">Hva det gjør</th>
                </tr>
              </thead>
              <tbody>
                {COOKIE_FLAGS.map((c) => (
                  <tr key={c.flag} className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-brand">{c.flag}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.betyr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Huskeregler */}
        <section className="mb-10">
          <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/5 p-5">
            <div className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold mb-2">
              Fem prinsipper du må huske
            </div>
            <ol className="space-y-1.5 text-sm text-foreground list-decimal pl-5">
              <li>Stol aldri på input. Ikke fra forms, ikke fra URL, ikke fra headers.</li>
              <li>Bruk parameterized queries — alltid, uten unntak.</li>
              <li>La rammeverket escape HTML for deg. Bare slå av med |safe når du må og vet hvorfor.</li>
              <li>Hash passord med slow hashing (pbkdf2, bcrypt, argon2). Aldri MD5/SHA-256.</li>
              <li>Minste privilegium: gi DB-brukeren SELECT/INSERT, ikke DROP. Begrens hva som kan skje hvis noe bryter.</li>
            </ol>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>
              : multiple-choice — finn den sårbare linjen, velg riktig forsvar.
            </li>
            <li>
              <Link to="/cards" className="text-brand hover:underline">
                Repetisjonskort
              </Link>
              : kort om SQL injection, XSS, CSRF, sesjon, cookies.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
