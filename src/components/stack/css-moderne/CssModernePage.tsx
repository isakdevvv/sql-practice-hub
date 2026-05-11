import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

// Course page covering modern CSS: box model, flexbox, grid, responsive
// design, CSS variables, dark mode, CSS-in-JS vs Tailwind, accessibility.

const STEPS = [
  { title: "Box model — repetisjon", anchor: "boxmodel" },
  { title: "Flexbox — én dimensjon", anchor: "flex" },
  { title: "CSS Grid — to dimensjoner", anchor: "grid" },
  { title: "Responsiv design (mobile-first)", anchor: "responsiv" },
  { title: "Custom properties (CSS-variabler)", anchor: "variables" },
  { title: "Dark mode — prefers-color-scheme", anchor: "dark" },
  { title: "CSS-in-JS vs Tailwind", anchor: "cssinjs" },
  { title: "Tilgjengelighet — kontrast og focus", anchor: "a11y" },
];

export function CssModernePage() {
  return (
    <StackPageShell title="CSS moderne" group="stack">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Moderne web · Styling
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            CSS moderne — flexbox, grid og custom properties
          </h1>
          <p className="mt-3 text-muted-foreground">
            CSS i 2020+ er en helt annen sak enn floats og clearfix. Flexbox og
            Grid løser layout uten hacks, custom properties gir ekte
            variabler, og <code>prefers-color-scheme</code> gir dark mode
            gratis. Dette er det moderne grunnlaget — det <em>før</em> du
            vurderer Tailwind eller styled-components.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgavene
              </Link>{" "}
              under «CSS moderne» — match flexbox-properties, fyll grid-template,
              mobile-first-quiz, custom properties.
            </div>
          </div>
        </div>

        <CourseOutline courseId="css-moderne" steps={STEPS} />

        {/* 1. Box model */}
        <section id="boxmodel" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Box model — repetisjon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hvert HTML-element er en boks med fire lag: innhold, padding,
            border, margin. <code>box-sizing: border-box</code> er nesten alltid
            det du vil ha — uten det legges padding og border <em>på toppen</em>{" "}
            av <code>width</code>.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`/* Anbefalt reset — gjør alle bokser forutsigbare */
*, *::before, *::after {
  box-sizing: border-box;
}

.kort {
  width: 300px;          /* med border-box: total bredde = 300px */
  padding: 16px;          /* luft INNI */
  border: 1px solid #ccc;
  margin: 8px;            /* luft UTENFOR */
  background: #fafafa;
}

/* Uten border-box ville faktisk bredde bli:
   300 + 2*16 (padding) + 2*1 (border) = 334px */`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Margin collapsing — gotcha
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`/* Vertikale marginer mellom søsken SLÅR SAMMEN — tar største */
<div style="margin-bottom: 20px"></div>
<div style="margin-top:    30px"></div>
/* Faktisk avstand: 30px, ikke 50px */

/* Horisontale marginer slår IKKE sammen */
/* Padding slår heller ikke sammen */
/* Flex/Grid-barn har IKKE margin collapsing — bruk gap istedenfor */`}</pre>
          </div>
        </section>

        {/* 2. Flexbox */}
        <section id="flex" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Flexbox — én dimensjon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Flexbox legger barn ut langs én akse — horisontalt eller vertikalt.
            Bruk det for navigasjons-rader, knapp-grupper, kort i en rad. Bruk
            Grid for ekte 2D-layouts.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`.foreldre {
  display: flex;
  flex-direction: row;          /* row | column | row-reverse | ... */
  justify-content: space-between; /* langs HOVEDAKSEN */
  align-items: center;          /* langs KRYSSAKSEN */
  gap: 16px;                    /* avstand mellom barn — bedre enn margin */
  flex-wrap: wrap;              /* bryt til ny linje hvis ikke plass */
}

.barn {
  flex-grow: 1;                 /* fyll resten av plassen */
  flex-shrink: 0;               /* IKKE krymp under width */
  flex-basis: 200px;            /* utgangs-bredde */
  /* shorthand: flex: 1 0 200px;  */
}`}</pre>
          </div>
          <div className="overflow-hidden rounded-lg border border-border mb-3">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-1/3">Property</th>
                  <th className="text-left font-semibold px-4 py-2">Hva den gjør</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">justify-content</td><td className="px-4 py-3 text-muted-foreground">Plasser barn langs hovedaksen — flex-start / center / space-between / space-around / space-evenly</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">align-items</td><td className="px-4 py-3 text-muted-foreground">Plasser barn langs kryssaksen — flex-start / center / stretch / baseline</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">gap</td><td className="px-4 py-3 text-muted-foreground">Avstand mellom barn — erstatter margin-hacks</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">flex-grow</td><td className="px-4 py-3 text-muted-foreground">Hvor mye barnet skal vokse hvis det er ledig plass</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">flex-shrink</td><td className="px-4 py-3 text-muted-foreground">Hvor mye barnet kan krympe hvis det mangler plass</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">flex-basis</td><td className="px-4 py-3 text-muted-foreground">Utgangs-størrelse FØR grow/shrink</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>Hvorfor flex slår floats:</strong> floats var laget for
            tekstflyt rundt bilder. Layout med floats krevde clearfix-hacks,
            tabeller eller absolute positioning. Flex sentrerer både
            horisontalt og vertikalt med to linjer.
          </p>
        </section>

        {/* 3. Grid */}
        <section id="grid" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. CSS Grid — to dimensjoner</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Grid lar deg bygge ekte rutenett — rader OG kolonner samtidig.{" "}
            <code>fr</code>-enheten («fraction») deler ledig plass, og{" "}
            <code>auto-fit</code> gir responsivt grid uten media queries.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`.galleri {
  display: grid;
  grid-template-columns: repeat(3, 1fr);   /* 3 like brede kolonner */
  gap: 16px;
}

/* Responsivt grid — uten media queries */
.kort-rad {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}
/* auto-fit: så mange kolonner som får plass, minst 250px hver */`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              grid-template-areas — visuell layout
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`.layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  min-height: 100vh;
}

header  { grid-area: header; }
nav     { grid-area: sidebar; }
main    { grid-area: main; }
footer  { grid-area: footer; }`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Enheter — fr vs prosent vs piksler
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`grid-template-columns: 200px 1fr 1fr;
/* Første kolonne 200px. Resten av plassen deles likt mellom de to siste. */

grid-template-columns: 1fr 2fr;
/* Andre kolonne får 2/3 av plassen */

grid-template-columns: min-content 1fr max-content;
/* min-content: så smal som mulig uten å bryte ord
   max-content: så bred som innholdet vil ha
   1fr:         resten */`}</pre>
          </div>
        </section>

        {/* 4. Responsiv */}
        <section id="responsiv" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Responsiv design (mobile-first)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <em>Mobile-first</em> betyr at base-stilene gjelder for mobil, og
            media queries <em>legger til</em> ting for større skjermer. Det er
            enklere — den minste skjermen har færrest valg.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`/* Base — mobil. Ingen media queries. */
.boks {
  padding: 12px;
  font-size: 14px;
}
.nav { display: flex; flex-direction: column; }

/* Tablet og oppover */
@media (min-width: 640px) {
  .boks { padding: 16px; font-size: 15px; }
  .nav  { flex-direction: row; }
}

/* Desktop */
@media (min-width: 1024px) {
  .boks { padding: 24px; font-size: 16px; }
}

/* Vanlige breakpoints (Tailwind-stil):
   sm: 640px    tablet portrait
   md: 768px    tablet landscape
   lg: 1024px   small desktop
   xl: 1280px   desktop
   2xl: 1536px  large desktop */`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Husk viewport-meta i HTML
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`<meta name="viewport" content="width=device-width, initial-scale=1" />
<!-- Uten dette zoomer iPhones ut til 980px "desktop"-bredde
     og responsive CSS får aldri sjansen. -->`}</pre>
          </div>
        </section>

        {/* 5. Variables */}
        <section id="variables" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Custom properties (CSS-variabler)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Ekte variabler i CSS — leses i runtime, kan endres med JavaScript,
            arves nedover i DOM-treet. Bruk dem for fargepaletter, spacing,
            border-radius — alt som gjentas mange ganger.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`:root {
  --color-brand: #2563eb;
  --color-text:  #0f172a;
  --color-bg:    #ffffff;
  --radius:      8px;
  --space-1:     4px;
  --space-2:     8px;
  --space-4:     16px;
  --space-8:     32px;
}

.knapp {
  background: var(--color-brand);
  color: white;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius);
}

/* Default-verdi hvis variabelen ikke er satt */
.tekst {
  color: var(--color-text, #333);
}

/* Endre i en seksjon — gjelder for hele undertreet */
.dark-section {
  --color-text: #fff;
  --color-bg:   #111;
}`}</pre>
          </div>
          <p className="text-xs text-muted-foreground">
            CSS-variabler vs SCSS-variabler: SCSS løses i kompilering og er{" "}
            <em>borte</em> i runtime. CSS custom properties lever i nettleseren
            — du kan endre dem i DevTools, fra JS, eller via media queries.
            Det er hva som gjør dark-mode-veksling triviell.
          </p>
        </section>

        {/* 6. Dark mode */}
        <section id="dark" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Dark mode — prefers-color-scheme</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En media query som speiler brukerens OS-innstilling. Sammen med CSS
            custom properties trenger du ikke skrive dobbelt sett med stiler.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`:root {
  --bg:   #ffffff;
  --text: #0f172a;
  --link: #2563eb;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg:   #0f172a;
    --text: #f8fafc;
    --link: #60a5fa;
  }
}

body {
  background: var(--bg);
  color: var(--text);
}
a { color: var(--link); }`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Manuell veksler — class-basert (overstyrer OS)
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`/* Følg OS som standard */
:root {
  --bg: white; --text: black;
}
@media (prefers-color-scheme: dark) {
  :root { --bg: black; --text: white; }
}

/* Manuell veksel — class på <html> overstyrer */
html.dark  { --bg: black; --text: white; }
html.light { --bg: white; --text: black; }

// JS-bryter
document.documentElement.classList.toggle("dark");`}</pre>
          </div>
        </section>

        {/* 7. CSS-in-JS vs Tailwind */}
        <section id="cssinjs" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. CSS-in-JS vs Tailwind</h2>
          <p className="text-sm text-muted-foreground mb-4">
            To hovedretninger på 2020-tallet for å skrive CSS i en
            komponentbasert verden.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mb-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                CSS-in-JS (styled-components, emotion)
              </div>
              <pre className="font-mono text-[11px] overflow-x-auto whitespace-pre">{`import styled from "styled-components";

const Knapp = styled.button\`
  background: \${p => p.primary
    ? "#2563eb" : "#e5e7eb"};
  color: \${p => p.primary
    ? "white" : "black"};
  padding: 8px 16px;
  border-radius: 6px;
\`;

<Knapp primary>Lagre</Knapp>`}</pre>
              <ul className="mt-2 text-xs space-y-1 text-muted-foreground list-disc pl-4">
                <li>Komponent + stil på ett sted</li>
                <li>Tilgang til JS-data</li>
                <li>Runtime-overhead</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Tailwind — utility classes
              </div>
              <pre className="font-mono text-[11px] overflow-x-auto whitespace-pre">{`<button
  className="bg-blue-600 text-white
             px-4 py-2 rounded-md
             hover:bg-blue-700">
  Lagre
</button>

<button
  className="bg-gray-200 text-black
             px-4 py-2 rounded-md">
  Avbryt
</button>`}</pre>
              <ul className="mt-2 text-xs space-y-1 text-muted-foreground list-disc pl-4">
                <li>Ingen CSS-fil — alt i markup</li>
                <li>Tree-shaket — bare brukte klasser</li>
                <li>Tett kobling — markup blir lang</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            I dette prosjektet brukes <strong>Tailwind</strong>. Sjekk
            klassene i komponentene over — alle bg-, p-, rounded-er
            Tailwind-utilities som blir til ekte CSS på build.
          </p>
        </section>

        {/* 8. A11y */}
        <section id="a11y" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Tilgjengelighet — kontrast og focus</h2>
          <p className="text-sm text-muted-foreground mb-4">
            To CSS-ting som flest visuelle bugs gjemmer seg bak: dårlig
            kontrast og usynlige focus-stiler. Begge er pålagte for WCAG
            AA-samsvar.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Kontrast — minst 4.5:1 for normal tekst
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`/* SVAKT — #aaa på hvit bakgrunn er ~2.3:1 */
.svak { color: #aaa; background: white; }

/* OK — #595959 på hvit er ~7:1 */
.god { color: #595959; background: white; }

/* Test med devtools: Inspect → Accessibility → Contrast ratio
   eller https://webaim.org/resources/contrastchecker */`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Focus-styles — aldri fjern uten erstatning
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`/* FEIL — usynlig tastatur-navigasjon */
button:focus { outline: none; }

/* RIKTIG — egen, synlig focus */
button:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}

/* :focus-visible vises BARE ved tastatur-navigasjon (ikke mus-klikk),
   så designet ditt forblir rent. Støttes i alle moderne nettlesere. */`}</pre>
          </div>
          <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/5 p-5">
            <div className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold mb-2">
              Annet du må ha
            </div>
            <ul className="space-y-1 text-sm list-disc pl-5">
              <li><strong>prefers-reduced-motion</strong> — slå av animasjoner for folk som blir kvalme</li>
              <li><strong>min-height: 44px på trykk-mål</strong> — fingre er ikke piksler</li>
              <li><strong>line-height ≥ 1.5</strong> på tekst — leselig med dysleksi</li>
              <li><strong>focus-within</strong> — stiler en wrapper når NOE inni har fokus</li>
            </ul>
          </div>
        </section>

        {/* Bunn-CTA */}
        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "react-grunnlag" }} className="text-brand hover:underline">
                React-grunnlag
              </Link>{" "}— sett stilene sammen med komponenter.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "html-jinja" }} className="text-brand hover:underline">
                HTML, CSS og Jinja
              </Link>{" "}— grunnleggende HTML-strukturen disse stilene treffer.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
