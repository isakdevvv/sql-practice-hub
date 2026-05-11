import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

// Course page covering HTML structure, semantic elements, CSS basics and Jinja.
// Hands-on drills live in /drag (HTML, CSS, Jinja topics).

type Tag = { tag: string; rolle: string };
const SEMANTIC_TAGS: Tag[] = [
  { tag: "<header>", rolle: "Toppinfo for siden eller en seksjon — logo, navigasjon, tittel" },
  { tag: "<nav>", rolle: "Hovedmeny med lenker — én eller flere per side" },
  { tag: "<main>", rolle: "Hovedinnhold på siden — kun ÉN per dokument" },
  { tag: "<section>", rolle: "Tematisk gruppe innenfor noe annet — har vanligvis en overskrift" },
  { tag: "<article>", rolle: "Innhold som kan stå alene (blogginnlegg, produktkort, kommentar)" },
  { tag: "<aside>", rolle: "Innhold tangentielt til hovedinnholdet — sidebar, fotnote, reklame" },
  { tag: "<footer>", rolle: "Bunninfo for siden eller seksjon — copyright, kontakt" },
];

const JINJA_DIRECTIVES: { syntax: string; what: string }[] = [
  {
    syntax: "{% extends \"base.html\" %}",
    what: "Arv fra en base-mal. MÅ være første linje i barn-malen.",
  },
  {
    syntax: "{% block name %}...{% endblock %}",
    what: "Definer eller overskriv en blokk fra base. Hver blokk kan overskrives én gang per fil.",
  },
  {
    syntax: "{% include \"_partial.html\" %}",
    what: "Lim inn en annen mal her. Brukes for headers, footers, gjentakende biter.",
  },
  {
    syntax: "{% import \"macros.html\" as m %}",
    what: "Last en mal med macroer som en modul. Bruk så m.macroNavn(args).",
  },
  {
    syntax: "{% for x in xs %} ... {% else %} ... {% endfor %}",
    what: "Iterer. {% else %} kjøres bare hvis listen var tom (Jinja-spesifikt).",
  },
  {
    syntax: "{% if cond %} ... {% elif %} ... {% else %} ... {% endif %}",
    what: "Standard kontrollflyt. Husk endif.",
  },
  {
    syntax: "{{ url_for('vis_kunde', nr=42) }}",
    what: "Generer URL fra view-funksjonens navn. Bytt aldri ut med hardkodet sti.",
  },
  {
    syntax: "{{ var | safe }}",
    what: "Slå av autoescape for det ene uttrykket. KUN på trygg/sanitisert innhold.",
  },
];

const STEPS = [
  { title: "HTML-skjelettet", anchor: "skjelett" },
  { title: "Semantiske elementer", anchor: "semantiske" },
  { title: "Lister — ul, ol, li", anchor: "lister" },
  { title: "Skjema", anchor: "skjema" },
  { title: "CSS — kobling og selektorer", anchor: "css" },
  { title: "Jinja — mal-arv", anchor: "jinja" },
  { title: "Bootstrap — raskt utseende", anchor: "bootstrap" },
  { title: "Sikkerhet i Jinja", anchor: "sikkerhet" },
];


export function HtmlJinjaPage() {
  return (
    <StackPageShell title="HTML, CSS og Jinja" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Frontend i Flask-stacken
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            HTML, CSS og Jinja — fra skjelett til renderbar side
          </h1>
          <p className="mt-3 text-muted-foreground">
            HTML er strukturen, CSS er stilen, Jinja er hva som limer sammen Python-data
            og HTML. Her er det viktigste eksamen tester — semantiske elementer,
            koblingen til CSS, og Jinja sin arv- og kontrollflyt.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgavene
              </Link>{" "}
              har 17+ konkrete fyll-inn-oppgaver for HTML/CSS/Jinja og en quiz om sikkerhet.
            </div>
          </div>
        </div>

        {/* 1. HTML-skjelett */}
        <CourseOutline courseId="html-jinja" steps={STEPS} />

        <section id="skjelett" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. HTML-skjelettet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hver HTML-fil starter med samme oppsett. Lær det utenat — det kommer ofte
            som «skriv en gyldig HTML-fil» på eksamen.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`<!DOCTYPE html>
<html lang="no">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Min side</title>
    <link rel="stylesheet" href="/static/style.css" />
  </head>
  <body>
    <h1>Hei verden</h1>
  </body>
</html>`}</pre>
          </div>
          <ul className="mt-3 space-y-1 text-sm list-disc pl-5 text-muted-foreground">
            <li><code>&lt;!DOCTYPE html&gt;</code> — forteller browseren at det er HTML5</li>
            <li><code>&lt;html lang="no"&gt;</code> — språk for skjermlesere og søk</li>
            <li><code>&lt;head&gt;</code> — metadata (vises ikke direkte): tittel, CSS, viewport</li>
            <li><code>&lt;body&gt;</code> — det som vises i nettleseren</li>
          </ul>
        </section>

        {/* 2. Semantiske elementer */}
        <section id="semantiske" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Semantiske elementer</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Bruk semantiske tags istedenfor <code>&lt;div&gt;</code> overalt. De gjør
            ingenting visuelt, men forteller skjermlesere, søkemotorer og andre
            utviklere hva delene betyr.
          </p>
          <div className="overflow-hidden rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Tag</th>
                  <th className="text-left font-semibold px-4 py-2">Bruk</th>
                </tr>
              </thead>
              <tbody>
                {SEMANTIC_TAGS.map((t) => (
                  <tr key={t.tag} className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-brand">{t.tag}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.rolle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`<body>
  <header>
    <h1>Min blogg</h1>
    <nav>
      <a href="/">Hjem</a>
      <a href="/om">Om</a>
    </nav>
  </header>

  <main>
    <article>
      <h2>Innlegg</h2>
      <section><h3>Bakgrunn</h3><p>...</p></section>
      <section><h3>Konklusjon</h3><p>...</p></section>
    </article>
  </main>

  <footer><p>© 2026</p></footer>
</body>`}</pre>
          </div>
        </section>

        {/* 3. Lister */}
        <section id="lister" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Lister — ul, ol, li</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Uordnet (kuler)
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`<ul>
  <li>Rød</li>
  <li>Blå</li>
  <li>Grønn</li>
</ul>`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Ordnet (1, 2, 3)
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`<ol>
  <li>Først</li>
  <li>Så</li>
  <li>Til slutt</li>
</ol>`}</pre>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Navigasjon bør pakkes som <code>&lt;nav&gt;&gt;&lt;ul&gt;&lt;li&gt;</code> —
            det er det skjermlesere forventer.
          </p>
        </section>

        {/* 4. Skjema */}
        <section id="skjema" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Skjema — input, label, button</h2>
          <p className="text-sm text-muted-foreground mb-4">
            label kobles til input via <code>for=id</code>. Det er BÅDE tilgjengelighet
            og UX (klikk på label fokuserer feltet).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`<form action="/login" method="POST">
  <label for="u">Brukernavn:</label>
  <input type="text" id="u" name="username" required />

  <label for="p">Passord:</label>
  <input type="password" id="p" name="password" required />

  <button type="submit">Logg inn</button>
</form>`}</pre>
          </div>
          <ul className="mt-3 space-y-1 text-sm list-disc pl-5 text-muted-foreground">
            <li>
              <code>method="POST"</code> for noe som endrer state (login, opprette).
              GET kun til lese-skjemaer (søk).
            </li>
            <li>
              <code>type="password"</code> maskerer tegnene, <code>type="email"</code>{" "}
              gir innebygd validering.
            </li>
            <li>
              <code>name</code> styrer nøkkelen i <code>request.form</code> på
              serversiden.
            </li>
          </ul>
        </section>

        {/* 5. CSS-kobling */}
        <section id="css" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. CSS — kobling og grunnselektorer</h2>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              I HTML-headeren
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`<link rel="stylesheet" href="/static/style.css" />`}</pre>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-4 mb-2">
              I style.css
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`/* tag-selektor */
p { color: black; }

/* class-selektor */
.alert { background: yellow; }

/* id-selektor */
#header { font-size: 24px; }

/* descendant-selektor */
nav a { text-decoration: none; }`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Box model — padding, border, margin
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`button {
  padding: 12px;              /* luft INNI rammen */
  border: 1px solid black;    /* rammen selv */
  margin: 16px;               /* luft UTENFOR rammen */
}`}</pre>
            <p className="mt-3 text-xs text-muted-foreground">
              Innenfra og ut: content → padding → border → margin. padding deler
              bakgrunnsfargen, margin er alltid transparent.
            </p>
          </div>
        </section>

        {/* 6. Jinja */}
        <section id="jinja" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Jinja — mal-arv og kontrollflyt</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Jinja kjører på serversiden i Flask. Den genererer HTML basert på data fra
            view-funksjonen. To syntaks-paranteser:{" "}
            <code>{"{{ uttrykk }}"}</code> for verdier,{" "}
            <code>{"{% blokk %}"}</code> for kontrollflyt.
          </p>
          <div className="overflow-hidden rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-2/5">Syntaks</th>
                  <th className="text-left font-semibold px-4 py-2">Hva det gjør</th>
                </tr>
              </thead>
              <tbody>
                {JINJA_DIRECTIVES.map((d) => (
                  <tr key={d.syntax} className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-xs text-brand">{d.syntax}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.what}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              base.html (felles mal)
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`<!DOCTYPE html>
<html lang="no">
  <head>
    <title>{% block title %}Min app{% endblock %}</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}" />
  </head>
  <body>
    {% include "_header.html" %}
    <main>
      {% block content %}{% endblock %}
    </main>
  </body>
</html>`}</pre>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-4 mb-2">
              kunder.html (arver fra base)
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`{% extends "base.html" %}

{% block title %}Kundeliste{% endblock %}

{% block content %}
  <h1>Alle kunder</h1>
  <ul>
    {% for kunde in kunder %}
      <li>{{ kunde.navn }} — {{ kunde.epost }}</li>
    {% else %}
      <li>Ingen kunder ennå.</li>
    {% endfor %}
  </ul>
{% endblock %}`}</pre>
          </div>
        </section>

        {/* 6.5 Bootstrap */}
        <section id="bootstrap" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Bootstrap — raskt utseende uten egen CSS</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Kurset bruker <strong>Bootstrap</strong> for å gi sidene et brukbart standardutseende
            uten at du må skrive masse CSS selv. Mønsteret er to linjer i{" "}
            <code>base.html</code>:
          </p>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3 mb-3">
            {`<!-- I <head>: -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- Før </body>: -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>`}
          </pre>
          <p className="text-sm text-muted-foreground mb-3">
            Etter at CSS-en er koblet på, gir Bootstrap deg ferdige klasser du legger direkte
            på HTML-elementer:
          </p>
          <div className="overflow-hidden rounded-lg border border-border mb-3">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-1/3">Klasse</th>
                  <th className="text-left font-semibold px-4 py-2">Hva den gjør</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">container</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Sentrert wrapper med responsive max-bredder. Legges på en{" "}
                    <code>&lt;div&gt;</code> rundt hovedinnholdet.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">btn btn-primary</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Lager en blå knapp. Andre varianter: <code>btn-secondary</code>,{" "}
                    <code>btn-danger</code>, <code>btn-success</code>.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">form-control</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Stiler <code>&lt;input&gt;</code> / <code>&lt;textarea&gt;</code> /{" "}
                    <code>&lt;select&gt;</code> som et skjema-felt med ramme og padding.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">navbar navbar-expand-lg</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Lager en responsiv menylinje øverst. Kollapses til burger-meny på mobil.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">card</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Boks med ramme og skygge. Bruk sammen med{" "}
                    <code>card-body</code>, <code>card-title</code>.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm">
            <strong>Når trenger du Bootstrap?</strong> Aldri strengt tatt. Men på eksamen er
            det forventet at du kan kjenne igjen klasser som <code>container</code> og{" "}
            <code>btn btn-primary</code>, fordi kurset bruker dem i alle eksempel-prosjekter.
            For din egen sluttkode kan du bare bruke Tailwind eller skrive egen CSS — det er
            ikke krav om Bootstrap.
          </div>
        </section>

        {/* 7. Sikkerhet */}
        <section id="sikkerhet" className="mb-10">
          <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/5 p-5">
            <div className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold mb-2">
              Viktig — sikkerhet i Jinja
            </div>
            <ul className="space-y-2 text-sm text-foreground">
              <li>
                <strong>Default autoescape:</strong> <code>{"{{ tekst }}"}</code> i en
                .html-fil escaper automatisk. Det er trygt mot XSS.
              </li>
              <li>
                <strong>|safe slår av escaping:</strong> bruk KUN på innhold du selv har
                generert eller sanitisert. Aldri på brukerinput.
              </li>
              <li>
                <strong>CSRF-token:</strong> hvert form skal ha{" "}
                <code>{"{{ form.hidden_tag() }}"}</code> (Flask-WTF) eller{" "}
                <code>{'<input type="hidden" name="csrf_token" value="...">'}</code>.
              </li>
              <li>
                <strong>url_for, ikke harde stier:</strong> URL-er endrer seg — view-navn
                er stabile.
              </li>
            </ul>
          </div>
        </section>

        {/* Bunn-CTA */}
        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>
              : fyll-inn for HTML-skjelett, semantiske tags, CSS box model, Jinja
              extends/block/for/if.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "flask-livssyklus" }}
                className="text-brand hover:underline"
              >
                Flask-livssyklusen
              </Link>
              : når kjøres view-funksjonen, og når renderes malen?
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
