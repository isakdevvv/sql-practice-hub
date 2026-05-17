import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { SectionQuiz } from "@/components/stack/diskret-matte/figures/SectionQuiz";
import { CssCheckpoint } from "./CssCheckpoint";
import { CssLivePreview } from "./CssLivePreview";

// Course page covering modern CSS: starts from zero (what CSS is, syntax,
// selectors) and walks through box model, flexbox, grid, responsive design,
// custom properties, dark mode, CSS-in-JS vs Tailwind, accessibility. Every
// section has both inline mini-exercises and a gating SectionQuiz so the
// reader actively works through the material.

const COURSE_ID = "css-moderne";

const STEPS = [
  { title: "Hva er CSS?", anchor: "hva-er-css" },
  { title: "Selektorer og spesifisitet", anchor: "selektorer" },
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
            CSS moderne — fra første selektor til Grid og dark mode
          </h1>
          <p className="mt-3 text-muted-foreground">
            Denne siden tar deg fra <em>helt nybegynner</em> til moderne
            layout-mestring. Hver seksjon har sjekkpunkter og en avsluttende
            quiz — du må gjøre øvelsene for å markere seksjonen som mestret
            og lyse opp lista øverst.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on også separat:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgavene
              </Link>{" "}
              under «CSS moderne» — match flexbox-properties, fyll
              grid-template, mobile-first-quiz, custom properties.
            </div>
          </div>
        </div>

        <CourseOutline courseId={COURSE_ID} steps={STEPS} />

        {/* 1. Hva er CSS? */}
        <section id="hva-er-css" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva er CSS?</h2>
          <p className="text-sm text-foreground/90 leading-relaxed mb-3">
            <strong>HTML</strong> beskriver hva som står på siden (overskrifter,
            avsnitt, knapper). <strong>CSS</strong> (Cascading Style Sheets)
            beskriver hvordan det skal se ut — farger, størrelser, avstander,
            layout. En CSS-regel består av <em>selektor</em>, <em>property</em>{" "}
            og <em>verdi</em>:
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`/*  selektor   property      verdi   */
h1            {  color    :    red ;  }
/*  ^^         ^^^^^^^         ^^^   */
/*  Hvilket    Hva som          Hvordan
    element    skal endres      */`}</pre>
          </div>

          <p className="text-sm text-foreground/90 leading-relaxed mb-3">
            CSS kan ligge tre steder — i prioritert rekkefølge når flere regler
            treffer samme element:
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`<!-- 1) Ekstern fil — anbefalt for alt unntatt eksperimenter -->
<link rel="stylesheet" href="style.css" />

<!-- 2) Intern, i <head>-en — for sider med litt unik styling -->
<style>
  h1 { color: red; }
</style>

<!-- 3) Inline, direkte på elementet — vinner alltid (unngå normalt) -->
<h1 style="color: red;">Hei</h1>`}</pre>
          </div>

          <CssLivePreview
            title="Live: din første CSS-regel"
            html={`<h1>Hei verden</h1>\n<p>Et avsnitt.</p>`}
            css={`h1 { color: {{value}}; font-size: 28px; margin: 0 0 8px; }\np  { color: #555; margin: 0; }`}
            toggle={{
              label: "h1 color",
              values: ["red", "#2563eb", "purple", "black"],
            }}
            height={140}
          />

          <CssCheckpoint
            kind="quiz"
            title="Sjekkpunkt — anatomi"
            question={`Hva er "color" i regelen  .knapp { color: white; } ?`}
            options={[
              {
                text: "En property — den sier HVA som endres",
                correct: true,
                rationale:
                  "Riktig. Property + verdi er paret som beskriver endringen. Selektoren (.knapp) sier hvilket element regelen treffer.",
              },
              {
                text: "En selektor — den velger HVILKET element",
                correct: false,
                rationale:
                  "Selektor er .knapp her. color er property — det sier hva som endres på det valgte elementet.",
              },
              {
                text: "En verdi — det endelige resultatet",
                correct: false,
                rationale: "Verdien er white. color er navnet på property-en.",
              },
              {
                text: "En kommentar",
                correct: false,
                rationale:
                  "Kommentarer skrives /* slik */ og blir ignorert av browseren.",
              },
            ]}
            explanation="Mental modell: selektor { property: verdi; } — som å skrive en setning: 'På element X, sett Y til Z.'"
          />

          <CssCheckpoint
            kind="fill"
            title="Fyll inn — koble CSS-fil til HTML"
            prompt="Du har style.css i samme mappe. Hvordan kobler du den til HTML-fila?"
            template={`<__1__ rel="__2__" href="style.css" />`}
            blanks={["link", "stylesheet"]}
            options={["link", "script", "style", "stylesheet", "css", "rel"]}
            language="html"
            explanation="<link> kobler eksterne ressurser. rel='stylesheet' forteller browseren at det er et stilark. Uten rel ignoreres fila — vanlig feilkilde."
          />

          <SectionQuiz
            courseId={COURSE_ID}
            sectionId="hva-er-css"
            nextSection={{ title: "Selektorer og spesifisitet", anchor: "selektorer" }}
            questions={[
              {
                prompt: "Hvor BØR du legge CSS for en større nettside?",
                options: [
                  {
                    text: "I en ekstern .css-fil koblet med <link>",
                    correct: true,
                    rationale:
                      "Cachebar, gjenbrukbar på tvers av sider, ikke blander struktur og stil.",
                  },
                  {
                    text: "Inline med style=\"...\" på hvert element",
                    correct: false,
                    rationale:
                      "Inline vinner over alt — men du mister gjenbruk og caching. Brukes bare unntaksvis.",
                  },
                  {
                    text: "I <style> i hver enkelt HTML-side",
                    correct: false,
                    rationale:
                      "Greit for et lite eksperiment, men gjenbruk på tvers av sider blir umulig.",
                  },
                  {
                    text: "I en .js-fil sammen med koden",
                    correct: false,
                    rationale:
                      "Det finnes mønstre (CSS-in-JS), men det krever et byggesteg og er ikke standard CSS.",
                  },
                ],
              },
              {
                prompt: "Hvilken linje er gyldig CSS-syntaks?",
                options: [
                  {
                    text: "p { color: blue; }",
                    correct: true,
                    rationale: "Selektor { property: verdi; } — kanonisk CSS.",
                  },
                  {
                    text: "p.color = blue",
                    correct: false,
                    rationale:
                      "Det ligner JavaScript, men CSS bruker { ... } og kolon mellom property og verdi.",
                  },
                  {
                    text: "<p color='blue'>",
                    correct: false,
                    rationale:
                      "Dette er gammel HTML-attributt-styling — gjelder ikke som CSS.",
                  },
                  {
                    text: "p: color = blue",
                    correct: false,
                    rationale: "Verdien skilles med kolon, ikke likhetstegn, og avsluttes med semikolon.",
                  },
                ],
              },
            ]}
          />
        </section>

        {/* 2. Selektorer */}
        <section id="selektorer" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Selektorer og spesifisitet</h2>
          <p className="text-sm text-foreground/90 leading-relaxed mb-3">
            En selektor velger hvilke HTML-elementer regelen skal treffe. De
            vanligste tre — og en regel om hva som vinner når flere treffer:
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`/* TYPE — alle <p> på siden */
p          { color: #444; }

/* CLASS — alle elementer med class="kort" */
.kort      { border: 1px solid #ccc; padding: 16px; }

/* ID — det ene elementet med id="hero" */
#hero      { background: #f8fafc; }

/* Etterkommer (descendant) — <a> inni .nav */
.nav a     { color: blue; }

/* Pseudo-class — :hover, :focus, :first-child, ... */
button:hover { background: #2563eb; color: white; }

/* Gruppering — samme regel for flere selektorer */
h1, h2, h3 { font-family: sans-serif; }`}</pre>
          </div>

          <p className="text-sm text-foreground/90 leading-relaxed mb-3">
            <strong>Spesifisitet</strong> bestemmer hvem som vinner når to
            regler treffer samme element. Forenklet rangering:
          </p>
          <div className="overflow-x-auto rounded-lg border border-border mb-3">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2">Selektor</th>
                  <th className="text-left font-semibold px-4 py-2">Vekt</th>
                  <th className="text-left font-semibold px-4 py-2">Eksempel</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">inline style</td><td className="px-4 py-3">1000</td><td className="px-4 py-3 font-mono text-xs">style="..."</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">#id</td><td className="px-4 py-3">100</td><td className="px-4 py-3 font-mono text-xs">#hero</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">.class / :pseudo</td><td className="px-4 py-3">10</td><td className="px-4 py-3 font-mono text-xs">.kort:hover</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">type</td><td className="px-4 py-3">1</td><td className="px-4 py-3 font-mono text-xs">h1, p</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Like vekt? Senere i fila vinner. <code>!important</code> overstyrer
            alt — unngå det. Det ender alltid i en bønne om enda mer{" "}
            <code>!important</code>.
          </p>

          <CssLivePreview
            title="Live: type vs class vs id"
            html={`<p>Vanlig avsnitt — bare type-regel.</p>\n<p class="varsel">Avsnitt med class .varsel.</p>\n<p id="hero">Avsnitt med id #hero.</p>`}
            css={`p          { color: gray; margin: 0 0 4px; }\n.varsel    { color: orange; font-weight: bold; }\n#hero      { color: #2563eb; font-size: 18px; }`}
            height={140}
          />

          <CssCheckpoint
            kind="quiz"
            title="Sjekkpunkt — hvem vinner?"
            question={`Begge reglene treffer samme <p class="varsel" id="hero">. Hvilken farge får teksten?\n\n#hero      { color: blue; }\n.varsel    { color: red;  }`}
            options={[
              {
                text: "Blå — #hero har høyere spesifisitet enn .varsel",
                correct: true,
                rationale:
                  "ID (100) slår class (10). Rekkefølgen i fila spiller bare rolle ved LIK vekt.",
              },
              {
                text: "Rød — .varsel kommer senere i fila",
                correct: false,
                rationale:
                  "Senere-vinner-regelen gjelder bare ved lik spesifisitet. Her er #hero strengt sterkere.",
              },
              {
                text: "Avhenger av rekkefølgen i HTML",
                correct: false,
                rationale: "HTML-rekkefølgen spiller ikke rolle for hvilken regel som vinner.",
              },
              {
                text: "Begge — fargen blir en blanding",
                correct: false,
                rationale: "CSS blander ikke verdier. Én regel vinner og setter color.",
              },
            ]}
            explanation="Praktisk: bruk class for det meste. Reserver id for unike elementer. Det holder spesifisiteten flat og forutsigbar."
          />

          <CssCheckpoint
            kind="fill"
            title="Fyll inn — pseudo-class for hover"
            prompt="Skriv regelen som gir <button> en mørkere bakgrunn KUN når musen er over."
            template={`button__1__hover {\n  background: #1d4ed8;\n}`}
            blanks={[":"]}
            options={[":", ".", "#", "@", "&", "::"]}
            explanation="Pseudo-classes starter med ETT kolon: :hover, :focus, :first-child, :checked. Doble kolon (::before, ::after) er pseudo-elementer — de lager innhold som ikke finnes i HTML."
          />

          <SectionQuiz
            courseId={COURSE_ID}
            sectionId="selektorer"
            nextSection={{ title: "Box model", anchor: "boxmodel" }}
            questions={[
              {
                prompt: "Du vil style alle <a> som ligger inni .footer. Hvilken selektor?",
                options: [
                  { text: ".footer a", correct: true, rationale: "Mellomrom = descendant. Treffer alle <a> et eller annet sted under .footer." },
                  { text: ".footer, a", correct: false, rationale: "Komma = gruppering — treffer .footer OG alle <a> på hele siden." },
                  { text: ".footer > a", correct: false, rationale: "> = DIREKTE barn — bare <a> som ligger som direkte barn, ikke dypere." },
                  { text: ".footer.a", correct: false, rationale: "Det er to klasser på samme element — krever BÅDE class footer OG class a." },
                ],
              },
              {
                prompt: "Hva er bedre praksis for selektorer i en stor app?",
                options: [
                  {
                    text: "Bruk class for det meste, reserver id for unike elementer",
                    correct: true,
                    rationale:
                      "Class er gjenbrukbar og holder spesifisiteten flat. ID skal være unik per side og vinner alt med samme vekt — vanskelig å overstyre.",
                  },
                  {
                    text: "Bruk id overalt for raskhet",
                    correct: false,
                    rationale:
                      "Browsere har optimalisert class-selektorer like godt. Id må være unik — du kan ikke gjenbruke samme stil.",
                  },
                  {
                    text: "Bruk inline style for alt — det er enklest",
                    correct: false,
                    rationale: "Inline vinner alt, men er ikke gjenbrukbar og blander struktur og stil.",
                  },
                  {
                    text: "Bruk !important på hver regel for å være sikker",
                    correct: false,
                    rationale:
                      "Anti-pattern. Når alt er !important, er ingenting !important — ender med kapprustning.",
                  },
                ],
              },
            ]}
          />
        </section>

        {/* 3. Box model */}
        <section id="boxmodel" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Box model — repetisjon</h2>
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

          <CssLivePreview
            title="Live: content-box vs border-box"
            html={`<div class="boks">Begge har width: 200px. Bytt box-sizing og se forskjellen.</div>`}
            css={`.boks {\n  box-sizing: {{value}};\n  width: 200px;\n  padding: 20px;\n  border: 4px solid #2563eb;\n  background: #eff6ff;\n}`}
            toggle={{
              label: "box-sizing",
              values: ["content-box", "border-box"],
            }}
            height={140}
          />

          <div className="rounded-xl border border-border bg-card p-5 mb-3">
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

          <CssCheckpoint
            kind="quiz"
            title="Sjekkpunkt — boks-bredde"
            question={`Med box-sizing: border-box, .kort { width: 300px; padding: 20px; border: 5px solid; }. Hva er den totale ytre bredden?`}
            options={[
              { text: "300px", correct: true, rationale: "Med border-box er width = total ytre bredde inkludert padding og border." },
              { text: "350px", correct: false, rationale: "Det ville vært tilfellet med default content-box (300 + 2×20 + 2×5)." },
              { text: "320px", correct: false, rationale: "Padding telles inn i 300 — ingen ekstra." },
              { text: "330px", correct: false, rationale: "Kombinerer feil regler. Med border-box er svaret 300px." },
            ]}
            explanation="Mental modell: border-box er som å si 'jeg vil ha en boks som er X bred totalt — fyll på inni'. Det er nesten alltid det du faktisk mener."
          />

          <SectionQuiz
            courseId={COURSE_ID}
            sectionId="boxmodel"
            nextSection={{ title: "Flexbox", anchor: "flex" }}
            questions={[
              {
                prompt: "Hvilken reset-regel er nesten alltid lurt å sette globalt?",
                options: [
                  { text: "*, *::before, *::after { box-sizing: border-box; }", correct: true, rationale: "Forutsigbare bokser i hele appen. Tailwind/Bootstrap/normalize gjør dette automatisk." },
                  { text: "* { margin: 0; padding: 0; }", correct: false, rationale: "Hard reset — fjerner nyttige defaults (avsnitt-luft, lister) og må erstattes manuelt." },
                  { text: "html { font-size: 10px; }", correct: false, rationale: "Bryter en a11y-konvensjon: brukerens font-size i nettleseren skal være utgangspunktet." },
                  { text: "body { overflow: hidden; }", correct: false, rationale: "Skrur av scroll på hele siden — sjelden det du vil." },
                ],
              },
              {
                prompt: "To div-er over hverandre, første har margin-bottom: 40px, andre har margin-top: 20px. Avstand mellom dem?",
                options: [
                  { text: "40px — margin collapsing tar største", correct: true, rationale: "Vertikale marginer mellom blokk-søsken kollapser til den største — ikke summen." },
                  { text: "60px — marginene legges sammen", correct: false, rationale: "Det er hva folk tror, men vertikale marginer KOLLAPSER." },
                  { text: "20px — den nyere vinner", correct: false, rationale: "Den STØRSTE vinner, ikke den nyeste." },
                  { text: "0 — marginer slår hverandre ut", correct: false, rationale: "Da hadde det vært vanskelig å lage luft." },
                ],
              },
            ]}
          />
        </section>

        {/* 4. Flexbox */}
        <section id="flex" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Flexbox — én dimensjon</h2>
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

          <CssLivePreview
            title="Live: lek med justify-content"
            html={`<div class="rad">\n  <div class="b">A</div>\n  <div class="b">B</div>\n  <div class="b">C</div>\n</div>`}
            css={`.rad {\n  display: flex;\n  justify-content: {{value}};\n  background: #f1f5f9;\n  padding: 12px;\n  height: 80px;\n  align-items: center;\n}\n.b {\n  background: #2563eb;\n  color: white;\n  padding: 8px 16px;\n  border-radius: 6px;\n  font-weight: 600;\n}`}
            toggle={{
              label: "justify-content",
              values: ["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"],
            }}
            height={140}
          />

          <div className="overflow-x-auto rounded-lg border border-border mb-3">
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

          <CssCheckpoint
            kind="fill"
            title="Fyll inn — sentrer barn både horisontalt og vertikalt"
            prompt="Klassisk: sentrer et barn i .boks (som har en gitt høyde)."
            template={`.boks {\n  display: __1__;\n  justify-content: __2__;\n  align-items: __2__;\n  height: 200px;\n}`}
            blanks={["flex", "center"]}
            options={["flex", "grid", "center", "left", "middle", "stretch"]}
            explanation="display: flex aktiverer flexbox. justify-content + align-items satt til center løser det «umulige» sentrerings-problemet i én linje hver."
          />

          <CssCheckpoint
            kind="quiz"
            title="Sjekkpunkt — gap vs margin"
            question="Hvorfor anbefales `gap: 16px` over `margin-right: 16px` på flex-barna?"
            options={[
              {
                text: "gap legger luft mellom barn — uten ekstra luft på ytterkanten av første/siste",
                correct: true,
                rationale:
                  "margin-right på alle barn gir en ekstra 16px etter siste barn også. gap er smartere: bare MELLOM.",
              },
              {
                text: "gap er raskere i nettleseren",
                correct: false,
                rationale: "Browser-ytelsen er praktisk talt lik. Forskjellen er semantikk.",
              },
              {
                text: "margin fungerer ikke på flex-barn",
                correct: false,
                rationale: "Det gjør det — margin fungerer fortsatt. Men du må kompensere for ytterkanten.",
              },
              {
                text: "gap setter også avstand på utsiden av container-en",
                correct: false,
                rationale: "Tvert imot — gap er ren INTERN avstand. Bruk padding på container for kantluft.",
              },
            ]}
            explanation="gap støttes nå i alle moderne nettlesere for både flex og grid. Bruk det som default."
          />

          <SectionQuiz
            courseId={COURSE_ID}
            sectionId="flex"
            nextSection={{ title: "CSS Grid", anchor: "grid" }}
            questions={[
              {
                prompt: "Du har display: flex og flex-direction: column. Hvilken akse er hovedaksen?",
                options: [
                  { text: "Vertikal — barn stables nedover", correct: true, rationale: "Hovedaksen følger flex-direction. column = vertikal hovedakse, så justify-content styrer vertikal plassering." },
                  { text: "Horisontal — uavhengig av flex-direction", correct: false, rationale: "Nei — hele poenget er at flex-direction bytter aksene." },
                  { text: "Begge samtidig", correct: false, rationale: "Nei — flexbox er per definisjon én-dimensjonalt. Bruk Grid for 2D." },
                  { text: "Den med flest barn", correct: false, rationale: "Det er ikke slik retningen bestemmes." },
                ],
              },
              {
                prompt: "Hva betyr shorthand `flex: 1 0 200px`?",
                options: [
                  { text: "grow=1, shrink=0, basis=200px — vokser men krymper aldri under 200px", correct: true, rationale: "Klassisk «kort som ikke krymper men kan vokse»-mønster." },
                  { text: "grow=1, basis=0, shrink=200", correct: false, rationale: "Rekkefølgen er grow shrink basis." },
                  { text: "Tre uavhengige bredde-verdier", correct: false, rationale: "Det er tre forskjellige flex-properties slått sammen til én." },
                  { text: "Ugyldig — flex aksepterer bare én verdi", correct: false, rationale: "Den aksepterer 1, 2 eller 3 verdier." },
                ],
              },
            ]}
          />
        </section>

        {/* 5. Grid */}
        <section id="grid" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. CSS Grid — to dimensjoner</h2>
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

          <CssLivePreview
            title="Live: lek med kolonne-mal"
            html={`<div class="grid">\n  <div class="c">1</div>\n  <div class="c">2</div>\n  <div class="c">3</div>\n  <div class="c">4</div>\n</div>`}
            css={`.grid {\n  display: grid;\n  grid-template-columns: {{value}};\n  gap: 8px;\n}\n.c {\n  background: #2563eb;\n  color: white;\n  padding: 16px;\n  text-align: center;\n  font-weight: 600;\n  border-radius: 6px;\n}`}
            toggle={{
              label: "grid-template-columns",
              values: ["1fr 1fr", "1fr 2fr", "repeat(4, 1fr)", "100px 1fr 100px", "repeat(auto-fit, minmax(80px, 1fr))"],
            }}
            height={140}
          />

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

          <CssCheckpoint
            kind="fill"
            title="Fyll inn — responsivt grid uten media queries"
            prompt="Et kort-galleri som tilpasser seg viewport-bredden."
            template={`.galleri {\n  display: __1__;\n  grid-template-columns: __2__(auto-fit, __3__(250px, 1fr));\n  gap: 16px;\n}`}
            blanks={["grid", "repeat", "minmax"]}
            options={["grid", "flex", "repeat", "minmax", "auto-fit", "1fr", "100px"]}
            explanation="auto-fit + minmax(250px, 1fr) gir så mange kolonner som får plass, hver minst 250px bred — uten en eneste media query."
          />

          <SectionQuiz
            courseId={COURSE_ID}
            sectionId="grid"
            nextSection={{ title: "Responsiv design", anchor: "responsiv" }}
            questions={[
              {
                prompt: "Hva er fr-enheten?",
                options: [
                  { text: "En andel av LEDIG plass etter at faste størrelser er trukket fra", correct: true, rationale: "1fr 2fr betyr 1/3 og 2/3 av plassen som ikke er bundet til faste kolonner." },
                  { text: "Pixels (frame-pixels)", correct: false, rationale: "fr er ikke en absolutt enhet. 1fr betyr ingenting alene — bare i forhold til andre fr." },
                  { text: "Prosent av viewport-bredden", correct: false, rationale: "vw er prosent av viewport. fr er andel av ledig plass i grid-en." },
                  { text: "Forkortelse for 'first row'", correct: false, rationale: "fr = fraction." },
                ],
              },
              {
                prompt: "Hvorfor velge Grid over Flexbox for hele side-layouten?",
                options: [
                  { text: "Grid er ekte 2D — du kan posisjonere både rader og kolonner samtidig", correct: true, rationale: "Header/sidebar/main/footer er 2D. Flex tvinger deg til å neste containere — Grid løser det med en mal." },
                  { text: "Flexbox støttes ikke lenger i moderne browsere", correct: false, rationale: "Flexbox er fortsatt fullt støttet." },
                  { text: "Grid er alltid raskere", correct: false, rationale: "Ytelse er praktisk talt lik. Forskjellen er semantikk og kapasitet." },
                  { text: "Grid har ikke gap", correct: false, rationale: "Tvert imot — gap kom først i Grid." },
                ],
              },
            ]}
          />
        </section>

        {/* 6. Responsiv */}
        <section id="responsiv" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Responsiv design (mobile-first)</h2>
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
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Husk viewport-meta i HTML
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`<meta name="viewport" content="width=device-width, initial-scale=1" />
<!-- Uten dette zoomer iPhones ut til 980px "desktop"-bredde
     og responsive CSS får aldri sjansen. -->`}</pre>
          </div>

          <CssCheckpoint
            kind="quiz"
            title="Sjekkpunkt — mobile-first"
            question="Hva er hovedfordelen med mobile-first CSS over desktop-first?"
            options={[
              {
                text: "Base-stilene er enklest, og media queries LEGGER TIL kompleksitet for større skjermer",
                correct: true,
                rationale:
                  "Mobile-first: base = mobil, @media (min-width: ...) legger til. Desktop-first må si 'unngå dette på små skjermer'.",
              },
              {
                text: "Det er den eneste måten å lage responsive sider på",
                correct: false,
                rationale: "Desktop-first virker også — men er ofte vanskeligere å vedlikeholde.",
              },
              {
                text: "Det er raskere i nettleseren",
                correct: false,
                rationale: "Begge tilnærminger gir samme runtime-ytelse.",
              },
              {
                text: "Krever ikke viewport-meta",
                correct: false,
                rationale: "Begge trenger <meta name='viewport' ...>.",
              },
            ]}
            explanation="Praktisk: skriv all CSS for mobil først, deretter en @media (min-width: 640px) for nettbrett, og @media (min-width: 1024px) for desktop."
          />

          <SectionQuiz
            courseId={COURSE_ID}
            sectionId="responsiv"
            nextSection={{ title: "Custom properties", anchor: "variables" }}
            questions={[
              {
                prompt: "Hvilken media query treffer skjermer 640px OG BREDERE?",
                options: [
                  { text: "@media (min-width: 640px) { ... }", correct: true, rationale: "min-width = «fra og med». Mobile-first-mønster." },
                  { text: "@media (max-width: 640px) { ... }", correct: false, rationale: "max-width = «opp til» — treffer mobil og SMALERE." },
                  { text: "@media (width: 640px) { ... }", correct: false, rationale: "Treffer KUN nøyaktig 640px." },
                  { text: "@media screen and 640px { ... }", correct: false, rationale: "Syntaktisk feil — mangler property-form." },
                ],
              },
              {
                prompt: "Hva skjer hvis du glemmer <meta name='viewport' ...> på en mobil-side?",
                options: [
                  { text: "iPhones zoomer ut til 980px 'desktop'-bredde — responsiv CSS slår aldri inn", correct: true, rationale: "Default mobil-browser-bredde er bredere enn skjermen for å vise gamle sider." },
                  { text: "CSS fungerer ikke i det hele tatt", correct: false, rationale: "CSS fungerer — bare at viewport-bredden ikke matcher skjermen." },
                  { text: "Nettleseren ber brukeren installere en app", correct: false, rationale: "Det er ikke en ting." },
                  { text: "Ingenting endrer seg", correct: false, rationale: "Veldig synlig — siden blir liten og zoomet ut." },
                ],
              },
            ]}
          />
        </section>

        {/* 7. Variables */}
        <section id="variables" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Custom properties (CSS-variabler)</h2>
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

          <CssLivePreview
            title="Live: bytt --color-brand én gang, hele temaet endres"
            html={`<button class="knapp">Hovedknapp</button>\n<a class="lenke" href="#">En lenke</a>\n<div class="badge">badge</div>`}
            css={`:root {\n  --color-brand: {{value}};\n}\n.knapp {\n  background: var(--color-brand);\n  color: white;\n  border: 0;\n  padding: 8px 14px;\n  border-radius: 6px;\n  font-weight: 600;\n  cursor: pointer;\n  margin-right: 8px;\n}\n.lenke {\n  color: var(--color-brand);\n  font-weight: 600;\n  margin-right: 12px;\n}\n.badge {\n  display: inline-block;\n  background: var(--color-brand);\n  color: white;\n  padding: 2px 8px;\n  border-radius: 999px;\n  font-size: 12px;\n  margin-top: 8px;\n}`}
            toggle={{
              label: "--color-brand",
              values: ["#2563eb", "#10b981", "#dc2626", "#7c3aed", "#f59e0b"],
            }}
            height={140}
          />

          <CssCheckpoint
            kind="fill"
            title="Fyll inn — definer og bruk en variabel"
            prompt="Definer to variabler på :root og bruk dem på .knapp."
            template={`:root {\n  __1__primary: #2563eb;\n  __1__radius: 8px;\n}\n\n.knapp {\n  background: __2__(__1__primary);\n  border-radius: __2__(__1__radius, 4px);\n}`}
            blanks={["--", "var"]}
            options={["--", "$", "@", "var", "let", "calc", "env"]}
            explanation="Definer med dobbelt-bindestrek: --navn. Bruk med var(--navn) eller var(--navn, default). Variablene arves nedover DOM-treet og lever i runtime."
          />

          <SectionQuiz
            courseId={COURSE_ID}
            sectionId="variables"
            nextSection={{ title: "Dark mode", anchor: "dark" }}
            questions={[
              {
                prompt: "Hva er forskjellen mellom CSS custom properties og SCSS-variabler?",
                options: [
                  { text: "CSS-variabler lever i runtime — kan endres fra JS, DevTools eller media queries. SCSS er kompilert bort.", correct: true, rationale: "Denne runtime-eksistensen gjør CSS-variabler ideelle for dark mode og temaer." },
                  { text: "De er identiske", correct: false, rationale: "Helt forskjellige — én er kompilert, én er runtime." },
                  { text: "SCSS er nyere", correct: false, rationale: "SCSS er fra 2006. CSS custom properties ble standard i 2017." },
                  { text: "CSS-variabler kan bare brukes for farger", correct: false, rationale: "Hvilken som helst CSS-verdi: lengder, fonter, fragmenter av verdier." },
                ],
              },
              {
                prompt: "var(--missing, red) — hva skjer hvis --missing aldri er definert?",
                options: [
                  { text: "Bruker red som fallback", correct: true, rationale: "Andre argument til var() er default." },
                  { text: "Setter --missing til red", correct: false, rationale: "Den setter ingenting. Bruker bare red her og nå hvis variabelen mangler." },
                  { text: "Krasjer regelen — ingen styling brukes", correct: false, rationale: "Den fallbacker gracefully." },
                  { text: "Bruker browserens default for property-en", correct: false, rationale: "Det skjer hvis du IKKE har en fallback." },
                ],
              },
            ]}
          />
        </section>

        {/* 8. Dark mode */}
        <section id="dark" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Dark mode — prefers-color-scheme</h2>
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
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
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

          <CssCheckpoint
            kind="fill"
            title="Fyll inn — media query for dark mode"
            prompt="Endre fargene når OS-en er i mørk modus."
            template={`@media (__1__: __2__) {\n  :root {\n    --bg: __3__;\n    --text: white;\n  }\n}`}
            blanks={["prefers-color-scheme", "dark", "black"]}
            options={["prefers-color-scheme", "color-scheme", "dark", "light", "black", "white", "auto"]}
            explanation="prefers-color-scheme leser OS-innstillingen. Sammen med CSS-variabler skriver du fargene én gang og endrer to verdier for hele temaet."
          />

          <SectionQuiz
            courseId={COURSE_ID}
            sectionId="dark"
            nextSection={{ title: "CSS-in-JS vs Tailwind", anchor: "cssinjs" }}
            questions={[
              {
                prompt: "Hvorfor passer custom properties så godt for dark mode?",
                options: [
                  { text: "Du skriver komponent-CSS-en én gang og bytter bare ut variabelverdiene", correct: true, rationale: "Cascading + runtime gjør at å endre :root påvirker hele undertreet — ingen duplisering." },
                  { text: "Custom properties skrur seg automatisk over når media query treffer", correct: false, rationale: "Du må SKRIVE @media-regelen som setter dem." },
                  { text: "Dark mode krever custom properties", correct: false, rationale: "Du KAN skrive dobbelt sett med stiler — men det blir mye duplisering." },
                  { text: "Det reduserer bundle-størrelse", correct: false, rationale: "Marginal forskjell. Hovedgrunnen er vedlikehold." },
                ],
              },
              {
                prompt: "Hvordan lar du brukeren overstyre OS-temaet manuelt?",
                options: [
                  { text: "Sett en class på <html> (f.eks. .dark) som setter de samme variablene", correct: true, rationale: "Higher specificity vinner — class-stilen kan overstyre :root-defaults. Pluss: persister i localStorage." },
                  { text: "Du kan ikke — prefers-color-scheme er enerådende", correct: false, rationale: "Det fungerer fint å overstyre i appen." },
                  { text: "Endre OS-innstillingen fra JS", correct: false, rationale: "Sider har ikke tilgang til OS-innstillinger." },
                  { text: "Bruk !important", correct: false, rationale: "Du trenger ikke !important — class beats :root naturlig." },
                ],
              },
            ]}
          />
        </section>

        {/* 9. CSS-in-JS vs Tailwind */}
        <section id="cssinjs" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">9. CSS-in-JS vs Tailwind</h2>
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
          <p className="text-xs text-muted-foreground mb-3">
            I dette prosjektet brukes <strong>Tailwind</strong>. Sjekk
            klassene i komponentene over — alle bg-, p-, rounded- er
            Tailwind-utilities som blir til ekte CSS på build.
          </p>

          <CssCheckpoint
            kind="quiz"
            title="Sjekkpunkt — utility classes"
            question="Hva betyr Tailwind-klassene `px-4 py-2`?"
            options={[
              { text: "padding-left/right = 1rem, padding-top/bottom = 0.5rem", correct: true, rationale: "px = horisontal padding (x-aksen), py = vertikal padding (y-aksen). 4 og 2 er Tailwinds spacing-skala (4 = 1rem, 2 = 0.5rem default)." },
              { text: "px (piksler), py (prosent)", correct: false, rationale: "Det er ikke enhets-prefiks. p står for padding, x/y for retning, og tallet er skala-stegget." },
              { text: "padding-x: 4px, padding-y: 2px", correct: false, rationale: "Tallet er ikke piksler. 4 i Tailwind-skala = 1rem = 16px (default)." },
              { text: "margin-x: 4, margin-y: 2", correct: false, rationale: "m = margin, p = padding. Bokstaven foran tallet styrer hva som settes." },
            ]}
            explanation="Tailwind-mønster: [property][retning]-[skala]. Eksempler: mt-4 (margin-top 1rem), px-2 (padding-x 0.5rem), gap-8 (gap 2rem)."
          />

          <SectionQuiz
            courseId={COURSE_ID}
            sectionId="cssinjs"
            nextSection={{ title: "Tilgjengelighet", anchor: "a11y" }}
            questions={[
              {
                prompt: "Hva er en hovedfordel med CSS-in-JS over Tailwind?",
                options: [
                  { text: "Du kan bruke JS-uttrykk og props rett i stilen — dynamisk styling uten klasse-akrobatikk", correct: true, rationale: "Eksempel: padding: ${p => p.dense ? '4px' : '12px'}. Det går ikke direkte i Tailwind uten klasse-svingninger." },
                  { text: "Det er alltid raskere", correct: false, rationale: "Tvert imot — CSS-in-JS har runtime-overhead." },
                  { text: "Det krever ingen byggesteg", correct: false, rationale: "Begge har bygg/transformasjons-trinn." },
                  { text: "Det støttes av flere nettlesere", correct: false, rationale: "Begge produserer vanlig CSS i bunn — samme støtte." },
                ],
              },
              {
                prompt: "Hvilken Tailwind-klasse gir mørk bakgrunn KUN ved hover?",
                options: [
                  { text: "hover:bg-gray-800", correct: true, rationale: "Tailwind-prefiks `hover:` er en pseudo-class-modifier. Klassen bg-gray-800 brukes bare når elementet hoveres." },
                  { text: "bg-gray-800-hover", correct: false, rationale: "Det er ikke Tailwind-syntaks." },
                  { text: "@hover bg-gray-800", correct: false, rationale: "Ingen @-prefiks brukes i Tailwind på den måten." },
                  { text: "bg-gray-800.hover", correct: false, rationale: "Tailwind separerer state-modifier fra utility med kolon, ikke punktum." },
                ],
              },
            ]}
          />
        </section>

        {/* 10. A11y */}
        <section id="a11y" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">10. Tilgjengelighet — kontrast og focus</h2>
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

          <CssLivePreview
            title="Live: sammenlign kontrast"
            html={`<p class="svak">Tekst på lys grå (#aaa) — svak kontrast</p>\n<p class="medium">Tekst på medium grå (#7a7a7a) — på grensen</p>\n<p class="god">Tekst på mørk grå (#595959) — god kontrast</p>`}
            css={`p { padding: 6px 0; margin: 0; font-size: 16px; }\n.svak   { color: #aaa; }\n.medium { color: #7a7a7a; }\n.god    { color: #595959; }`}
            height={140}
          />

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

          <CssCheckpoint
            kind="quiz"
            title="Sjekkpunkt — focus-style"
            question="Du vil ha synlig outline KUN ved tastatur-navigasjon. Hva bruker du?"
            options={[
              {
                text: ":focus-visible — vises bare ved 'keyboard-like' fokus",
                correct: true,
                rationale:
                  "Nettleseren skiller på input: tab gir :focus-visible, mus-klikk gir det ikke. Designet forblir rent, tastatur-brukere får synlig fokus.",
              },
              {
                text: ":focus — fjern outline med outline: none ved mus-klikk via JS",
                correct: false,
                rationale: "Det er hva folk gjorde før :focus-visible kom. Komplisert og fragilt.",
              },
              {
                text: "outline: none — bare fjern den helt",
                correct: false,
                rationale: "WCAG-brudd. Tastatur-brukere mister all visuell tilbakemelding.",
              },
              {
                text: ":hover — dekker det meste",
                correct: false,
                rationale: ":hover gjelder mus-pek, ikke fokus.",
              },
            ]}
            explanation="Mønster: button:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }. Aldri outline: none uten en synlig erstatning."
          />

          <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/5 p-5 mb-3">
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

          <SectionQuiz
            courseId={COURSE_ID}
            sectionId="a11y"
            questions={[
              {
                prompt: "Hva er minimumskravet til kontrastforhold for vanlig tekst i WCAG AA?",
                options: [
                  { text: "4.5:1", correct: true, rationale: "AA krever 4.5:1 for normal tekst, 3:1 for store overskrifter (18pt+ eller 14pt+ bold)." },
                  { text: "2:1", correct: false, rationale: "For lavt — det ville utelukket mange svaksynte." },
                  { text: "10:1", correct: false, rationale: "Strengere enn AA. AAA-nivået er 7:1 for vanlig tekst." },
                  { text: "Ingen krav", correct: false, rationale: "WCAG har eksplisitte minimumskrav for kontrast." },
                ],
              },
              {
                prompt: "Hvilken regel hører hjemme i a11y-grunnpakken?",
                options: [
                  { text: "@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }", correct: true, rationale: "Folk med motion sickness slår på OS-innstillingen. Respekter det." },
                  { text: "* { transition: all 1s; }", correct: false, rationale: "Tvert imot — gir for mye bevegelse." },
                  { text: "button { outline: none; }", correct: false, rationale: "Anti-pattern. Fjerner tastatur-fokus uten erstatning." },
                  { text: "img { display: none; }", correct: false, rationale: "Skjuler bilder for alle." },
                ],
              },
            ]}
          />
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
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgavene
              </Link>{" "}— flere repetisjons-øvelser på flexbox, grid, custom properties.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
