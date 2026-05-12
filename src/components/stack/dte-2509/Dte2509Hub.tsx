import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Code2,
  Database,
  GitBranch,
  KeyRound,
  Layers3,
  Network,
  ShieldAlert,
  ServerCog,
  Boxes,
  FileCode2,
  Lightbulb,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";

type Modul = {
  nr: string;
  uke: string;
  tittel: string;
  blurb: string;
  Icon: typeof Code2;
  trinn: { slug: string; title: string; note?: string }[];
};

const MODULER: Modul[] = [
  {
    nr: "1",
    uke: "Uke 9-10",
    tittel: "HTML/CSS og Git",
    blurb:
      "Statisk struktur, semantiske tags, CSS-styling, Bootstrap-mønstre, og versjonskontroll med Git/GitHub.",
    Icon: FileCode2,
    trinn: [
      { slug: "html-jinja", title: "HTML, CSS og Jinja", note: "Inkluderer Bootstrap-CDN-mønsteret" },
    ],
  },
  {
    nr: "2",
    uke: "Uke 11",
    tittel: "Flask Basics",
    blurb:
      "Sett opp VENV, lag en Flask-app, route-er, render_template, request-livssyklus fra ende til annen.",
    Icon: Code2,
    trinn: [
      { slug: "flask-livssyklus", title: "Flask request-livssyklus" },
      { slug: "python-drill", title: "Python eksamens-drill", note: "Database/web-mønstre i Python" },
    ],
  },
  {
    nr: "3",
    uke: "Uke 12",
    tittel: "Database — design og CRUD",
    blurb:
      "Normalisering, ER-modell til DDL, primær- og fremmednøkler, subqueries, og MySQL-vs-SQLite-syntaks.",
    Icon: Database,
    trinn: [
      { slug: "normalisering", title: "Normalisering — 1NF, 2NF, 3NF" },
      { slug: "er-mapping", title: "ER → DDL mapping" },
      { slug: "nokler", title: "Primær- og fremmednøkler" },
      { slug: "subqueries", title: "Underspørringer" },
      { slug: "mysql-vs-sqlite", title: "MySQL vs SQLite", note: "Hvordan dialektene mappes" },
      { slug: "bytes-encoding", title: "Bytes og encoding" },
    ],
  },
  {
    nr: "4",
    uke: "Uke 13",
    tittel: "User Management",
    blurb:
      "Register, login, sessions, @login_required, logout — og hvordan Flask-Login automatiserer det meste.",
    Icon: KeyRound,
    trinn: [
      { slug: "brukerhandtering", title: "Brukerhåndtering A til Å" },
      { slug: "mvc-monster", title: "MVC-mønsteret", note: "Hvor user-koden hører hjemme" },
    ],
  },
  {
    nr: "5",
    uke: "Uke 16",
    tittel: "API og HTTP",
    blurb:
      "HTTP-verb (GET/POST/PUT/DELETE), statuskode-klasser (2xx/3xx/4xx/5xx), og JSON-API-er.",
    Icon: Network,
    trinn: [
      { slug: "http-anatomi", title: "HTTP-anatomi" },
    ],
  },
  {
    nr: "6",
    uke: "Uke 17",
    tittel: "Web-sikkerhet",
    blurb:
      "SQL injection, XSS, CSRF og passord-hashing — sårbare mønstre og hvordan stoppe dem.",
    Icon: ShieldAlert,
    trinn: [
      { slug: "sikkerhet", title: "Web-sikkerhet — OWASP-essensen", note: "Inkluderer full CSRF-walkthrough" },
    ],
  },
];

type ExtraResource = {
  href: string;
  Icon: typeof Layers3;
  tittel: string;
  blurb: string;
  internal: boolean;
};

const EKSTRA: ExtraResource[] = [
  {
    href: "/practice",
    Icon: Database,
    tittel: "SQL-oppgaver",
    blurb:
      "300+ SQL-problemer over flere datasett. Filtrer på «film»-datasettet for DTE-2509-eksamenstilen.",
    internal: true,
  },
  {
    href: "/python",
    Icon: Code2,
    tittel: "Python-øvelser",
    blurb:
      "68+ Flask + MySQL + auth + CSRF-øvelser som kjører i nettleseren via Pyodide. Skriv koden selv.",
    internal: true,
  },
  {
    href: "/prosjekt",
    Icon: ServerCog,
    tittel: "Prosjekt — Flask-nettbutikk",
    blurb:
      "Bygg en hel app i 11 trinn: DB-skjema, registrering, login, handlekurv, checkout, CSRF, sluttest.",
    internal: true,
  },
  {
    href: "/exam",
    Icon: Boxes,
    tittel: "Tidsbasert eksamenstrening",
    blurb:
      "10 mixed-difficulty SQL-oppgaver i 20 minutter med nedteller. Press-test deg selv før dagen.",
    internal: true,
  },
  {
    href: "/drag",
    Icon: GitBranch,
    tittel: "Drag-oppgaver",
    blurb:
      "545+ kortere oppgaver: SQL-fyll-inn, DDL-konstruksjon, Git-flyt, sikkerhet-quizzer.",
    internal: true,
  },
  {
    href: "/cards",
    Icon: Lightbulb,
    tittel: "Flashcards",
    blurb:
      "200+ kort over begrep, design, SQL, Flask, sikkerhet, HTTP — drillbar repetisjon før eksamen.",
    internal: true,
  },
];

const PENSUM_REGEX = [
  { kjern: "Lag en Flask-app", svar: "Modul 2 — flask-livssyklus + python-drill" },
  { kjern: "Render en HTML-template med data", svar: "Modul 2 — flask-livssyklus + html-jinja" },
  { kjern: "Lag en CRUD-route mot MySQL", svar: "Modul 3 — mysql-vs-sqlite + Python-øvelser" },
  { kjern: "Skriv DDL for film-skjemaet", svar: "Modul 3 — mysql-vs-sqlite + DDL-drag-øvelse" },
  { kjern: "Forklar normalisering med eksempel", svar: "Modul 3 — normalisering" },
  { kjern: "Implementér login med session", svar: "Modul 4 — brukerhandtering" },
  { kjern: "Beskytt en route med decorator", svar: "Modul 4 — brukerhandtering" },
  { kjern: "Hva betyr HTTP 201?", svar: "Modul 5 — http-anatomi + flashcards" },
  { kjern: "Stopp CSRF-angrep", svar: "Modul 6 — sikkerhet (CSRF-walkthrough)" },
  { kjern: "Hvorfor må passord hashes?", svar: "Modul 4 — brukerhandtering + sikkerhet" },
];

export function Dte2509Hub() {
  return (
    <StackPageShell title="DTE-2509 Databaser og webapplikasjoner 1" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2509-1 · 10 stp · Databaser og webapplikasjoner
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Databaser og web —{" "}
            <span className="bg-gradient-to-r from-brand to-success bg-clip-text text-transparent">
              hele faget
            </span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Seks moduler som dekker hele DTE-2509-pensumet fra Roy E. Olsens kurs-repo:
            HTML/CSS+Git → Flask Basics → Database CRUD → User Management → API/HTTP →
            Web-sikkerhet. Hver modul peker direkte til stack-leksjonene og øvelsene som
            faktisk testes.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Eksamensinnspurt?</span> Gå til{" "}
              <Link to="/eksamen" className="text-brand hover:underline">
                /eksamen
              </Link>{" "}
              for tidsbasert trening og prosjekt-lenker. Eller hopp rett i øvelser nederst.
            </div>
          </div>
        </div>

        {/* Modul-grid */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-1">Modul for modul</h2>
          <p className="text-xs text-muted-foreground mb-5">
            Strukturen følger den offisielle UiT-pensum-skjemaet fra DTE-2509-26V-repoet.
          </p>
          <div className="space-y-5">
            {MODULER.map((m) => {
              const Icon = m.Icon;
              return (
                <div
                  key={m.nr}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                      <Icon className="h-4 w-4 text-brand" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-brand">
                          MODUL {m.nr}
                        </span>
                        <span className="text-xs text-muted-foreground">· {m.uke}</span>
                      </div>
                      <h3 className="text-base font-semibold text-foreground">
                        {m.tittel}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{m.blurb}</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {m.trinn.map((t) => (
                      <Link
                        key={t.slug}
                        to="/stack/$slug"
                        params={{ slug: t.slug }}
                        className="group rounded-lg border border-border bg-background hover:border-brand/40 p-3 transition-colors flex items-start gap-2"
                      >
                        <ArrowRight className="h-3.5 w-3.5 mt-0.5 text-muted-foreground group-hover:text-brand group-hover:translate-x-0.5 transition-all shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium leading-snug">{t.title}</div>
                          {t.note && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {t.note}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Praktisk øvelse */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-1">Praktisk øvelse</h2>
          <p className="text-xs text-muted-foreground mb-5">
            Stack-leksjonene forklarer teorien. Her skriver du koden selv.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {EKSTRA.map((r) => {
              const Icon = r.Icon;
              return (
                <Link
                  key={r.href}
                  to={r.href}
                  className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-brand" />
                    <h3 className="font-semibold text-foreground leading-tight">
                      {r.tittel}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {r.blurb}
                  </p>
                  <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Åpne
                    <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Eksamen-spørsmål mappet til ressurs */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-1">«Hvor lærer jeg dette?»</h2>
          <p className="text-xs text-muted-foreground mb-5">
            Typiske eksamen-spørsmål mappet til riktig modul/leksjon.
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-1/2">
                    Hvis oppgaven sier ...
                  </th>
                  <th className="text-left font-semibold px-4 py-2">Slå opp her</th>
                </tr>
              </thead>
              <tbody>
                {PENSUM_REGEX.map((r) => (
                  <tr key={r.kjern} className="border-t border-border">
                    <td className="px-4 py-3 italic">«{r.kjern}»</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.svar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <Boxes className="h-4 w-4 text-brand" />
            Hva med eksamens-prosjektet?
          </h2>
          <p className="text-muted-foreground mb-2">
            Den obligatoriske oppgaven i kurset (CRUD-Bil per bruker) tester samme
            ferdigheter som vårt nettbutikk-prosjekt: DB-skjema, registrering, login,
            session, beskyttede ruter, CSRF.{" "}
            <Link to="/prosjekt" className="text-brand hover:underline">
              Bygg nettbutikken
            </Link>{" "}
            som øvelse — så er du klar for obligen i sin egen kontekst.
          </p>
        </div>
      </div>
    </StackPageShell>
  );
}
