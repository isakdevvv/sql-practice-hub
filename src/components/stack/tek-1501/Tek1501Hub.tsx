import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Calculator,
  Code2,
  Dice5,
  GitBranch,
  Layers3,
  Lightbulb,
  LineChart,
  Sigma,
  Target,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { LearningPath } from "@/components/stack/LearningPath";

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
    uke: "Uke 1-2",
    tittel: "Deskriptiv statistikk",
    blurb:
      "Sentralmaal (gjennomsnitt, median, modus, kvartiler), spredningsmaal (varians, standardavvik, IQR), og visualisering med histogram, boksplott, og scatter.",
    Icon: BarChart3,
    trinn: [
      {
        slug: "tek1-deskriptiv",
        title: "Sentralmaal, spredning og visualisering",
        note: "Naar median > mean, og hvorfor",
      },
    ],
  },
  {
    nr: "2",
    uke: "Uke 3-5",
    tittel: "Sannsynlighet og kombinatorikk",
    blurb:
      "Utfallsrom, hendelser, mengdelaere, Kolmogorovs aksiomer, betinget sannsynlighet, Bayes teorem, uavhengighet, og kombinatorikk (permutasjoner og kombinasjoner).",
    Icon: Dice5,
    trinn: [
      {
        slug: "tek1-sannsynlighet",
        title: "Sannsynlighet, mengdelaere og kombinatorikk",
        note: "Lotto, kortspill, kvalitetskontroll",
      },
    ],
  },
  {
    nr: "3",
    uke: "Uke 6-8",
    tittel: "Sannsynlighetsfordelinger",
    blurb:
      "Stokastiske variabler, forventning, varians, og de viktigste fordelingene: Bernoulli, binomisk, hypergeometrisk, Poisson, uniform, eksponential, normal, kji-kvadrat, Student-t — pluss sentralgrenseteoremet.",
    Icon: Sigma,
    trinn: [
      {
        slug: "tek1-fordelinger",
        title: "Diskrete og kontinuerlige fordelinger",
        note: "Inkluderer CLT og fordelings-velger",
      },
    ],
  },
  {
    nr: "4",
    uke: "Uke 9-12",
    tittel: "Statistisk inferens og regresjon",
    blurb:
      "Estimatorer, konfidensintervaller, hypotesetesting (z-, t-, kji-kvadrat), korrelasjon, og lineaer regresjon med minste kvadraters metode.",
    Icon: LineChart,
    trinn: [
      {
        slug: "tek1-statistisk-analyse",
        title: "Konfidensintervall, hypotesetest, regresjon",
        note: "Hele eksamen-tyngdepunktet",
      },
    ],
  },
];

type ExtraResource = {
  href: string;
  Icon: typeof Layers3;
  tittel: string;
  blurb: string;
};

const EKSTRA: ExtraResource[] = [
  {
    href: "/python",
    Icon: Code2,
    tittel: "Python-oevelser",
    blurb:
      "Kjoer numpy + scipy.stats i nettleseren via Pyodide. Beregn snitt/std, kjoer t-tester, lineaer regresjon, og kji-kvadrat — alt uten lokal installasjon.",
  },
  {
    href: "/drag",
    Icon: GitBranch,
    tittel: "Drag-oppgaver",
    blurb:
      "55+ kortere oppgaver: fyll inn formler, match fordelinger til scenarier, sortér hypotesetest-stegene, og quiz paa vanlige feller.",
  },
  {
    href: "/cards",
    Icon: Lightbulb,
    tittel: "Flashcards",
    blurb:
      "40+ kort over begreper, formler, og fordelings-parametere — drillbar repetisjon foer eksamen.",
  },
  {
    href: "/exam",
    Icon: Boxes,
    tittel: "Tidsbasert trening",
    blurb:
      "Press-test deg selv med tidsavgrenset oeving. Velg statistikk-kategorier og kjoer under press.",
  },
];

const PENSUM_REGEX = [
  {
    kjern: "Beregn gjennomsnitt og standardavvik for dette utvalget",
    svar: "Modul 1 — deskriptiv statistikk + Python-oevelse Snitt og std",
  },
  {
    kjern: "Hva er median vs. mean, og naar foretrekkes median?",
    svar: "Modul 1 — sentralmaal-seksjonen + flashcard Skjevhet",
  },
  {
    kjern: "Tegn et histogram av disse maalingene",
    svar: "Modul 1 — visualisering + Python-oevelse Histogram med matplotlib",
  },
  {
    kjern: "Hvor mange ulike permutasjoner finnes av 5 av 8 bokstaver?",
    svar: "Modul 2 — kombinatorikk + drag Permutasjon vs kombinasjon",
  },
  {
    kjern: "Beregn P(A | B) gitt P(A), P(B), P(B|A)",
    svar: "Modul 2 — Bayes teorem + Python-oevelse Bayes manuelt",
  },
  {
    kjern: "10 % defekte enheter — sannsynlighet for 2 defekte i utvalg paa 20",
    svar: "Modul 3 — binomisk fordeling + Python-oevelse scipy.stats.binom",
  },
  {
    kjern: "Sannsynlighet for at X (normalfordelt) overstiger en verdi",
    svar: "Modul 3 — normalfordelingen + Python-oevelse P(X > x) med norm.cdf",
  },
  {
    kjern: "Hvilken fordeling passer best her?",
    svar: "Modul 3 — fordelings-velger-tabellen",
  },
  {
    kjern: "Konstruer 95 % konfidensintervall for mu",
    svar: "Modul 4 — CI-seksjonen + Python-oevelse CI manuelt",
  },
  {
    kjern: "Test om gjennomsnittet er forskjellig fra 100 (p-verdi)",
    svar: "Modul 4 — one-sample t-test + Python-oevelse ttest_1samp",
  },
  {
    kjern: "Sammenlign to grupper — er forskjellen signifikant?",
    svar: "Modul 4 — two-sample t-test + drag t-test-stegene",
  },
  {
    kjern: "Beregn korrelasjon og lineaer regresjon mellom x og y",
    svar: "Modul 4 — regresjon + Python-oevelse scipy.stats.linregress",
  },
  {
    kjern: "Test om to kategoriske variabler er uavhengige",
    svar: "Modul 4 — kji-kvadrattest + Python-oevelse chi2_contingency",
  },
];

export function Tek1501Hub() {
  return (
    <StackPageShell
      title="TEK-1501 Sannsynlighet og statistikk for ingenioerer"
      group="eksamen"
    >
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            TEK-1501 · 5 stp · Sannsynlighet og statistikk for ingenioerer
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Statistikk for ingenioerer —{" "}
            <span className="bg-gradient-to-r from-brand to-success bg-clip-text text-transparent">
              hele faget
            </span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Fire moduler som dekker hele TEK-1501-pensumet: deskriptiv statistikk
            -&gt; sannsynlighet og kombinatorikk -&gt; sannsynlighetsfordelinger
            -&gt; statistisk inferens og regresjon. Hver modul peker direkte til
            stack-leksjonene, drag-oevelsene, og Python-koden du faktisk skriver
            paa eksamen.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Eksamen er 3-timers skriftlig.</span>{" "}
              Tyngdepunktet er Modul 2 (sannsynlighet) og Modul 3 (fordelinger) —
              men hver eksamen har minst én oppgave fra hver modul. Modul 4 er
              ofte en lang oppgave med CI + hypotesetest + regresjon.
            </div>
          </div>
        </div>

        <div className="mb-10">
          <LearningPath
            fag="TEK-1501"
            forbinder={[
              "DTE-2501 (RL/ML bruker sannsynlighet)",
              "DTE-2602 (evaluering, hypotesetest av modeller)",
              "Matematikk R1/R2",
            ]}
            layers={[
              {
                navn: "Basis — beskriv dataene",
                intro:
                  "Lær å sammenfatte målinger med tall og bilder. Før vi modellerer noe, må vi se hva vi faktisk har.",
                steps: [
                  { slug: "tek1-deskriptiv", title: "Sentralmål, spredning og visualisering", blurb: "Mean, median, varians, IQR + histogram med live bin-slider." },
                  { slug: "tek1-sannsynlighet", title: "Sannsynlighet, mengdelære, Bayes", blurb: "Venn-diagram, betinget P, og Bayes — bygg intuisjon før formler." },
                  { slug: "tek1-kombinatorikk", title: "Kombinatorikk", blurb: "Permutasjon, kombinasjon, m/uten tilbakelegging — interaktiv trekksim." },
                ],
              },
              {
                navn: "Dypere — modeller for tilfeldighet",
                intro:
                  "Når dataene er forstått, putter vi dem inn i sannsynlighetsfordelinger. Slik kan vi regne ut hva som er sannsynlig før vi har sett det.",
                steps: [
                  { slug: "tek1-diskrete-fordelinger", title: "Binomisk, Poisson, hypergeometrisk", blurb: "Live PMF-plot — se hvordan n og p endrer formen." },
                  { slug: "tek1-kontinuerlige-fordelinger", title: "Normal, eksp, t, χ²", blurb: "PDF med drag-bart areal — tren intuisjonen for P(a<X<b)." },
                  { slug: "tek1-forventning-clt", title: "Forventning, varians, CLT", blurb: "Simulator for sentralgrenseteoremet med 4 ulike grunnfordelinger." },
                ],
              },
              {
                navn: "Eksamen — trekke konklusjoner",
                intro:
                  "Når modellen sitter, bruker vi den til å si noe vi ikke visste: hvor sikre er vi, og er forskjellen reell?",
                steps: [
                  { slug: "tek1-estimering-ki", title: "Konfidensintervaller", blurb: "100-utvalg-simulator viser hvorfor 95% KI ikke garanterer 95% i hvert tilfelle." },
                  { slug: "tek1-hypotesetest-regresjon", title: "Hypotesetest + regresjon", blurb: "H₀/H₁-overlapp med skyvbar kritisk grense, drag-bar scatter med live R²." },
                  { slug: "tek1-statistisk-analyse", title: "Komplett analyse", blurb: "Bredt sammenfattende kurs — koble alle teknikkene." },
                ],
              },
            ]}
          />
        </div>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-1">Modul for modul</h2>
          <p className="text-xs text-muted-foreground mb-5">
            Strukturen foelger UiT-emnebeskrivelsen for TEK-1501. Pedagogisk
            progresjon: data -&gt; modell -&gt; inferens.
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
                        <span className="text-xs text-muted-foreground">
                          · {m.uke}
                        </span>
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
                          <div className="text-sm font-medium leading-snug">
                            {t.title}
                          </div>
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

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-1">Praktisk oevelse</h2>
          <p className="text-xs text-muted-foreground mb-5">
            Stack-leksjonene forklarer teorien. Her gjoer du regnearbeidet selv —
            foerst med blyant, saa verifisert i Python.
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
                    Aapne
                    <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-1">Hvor laerer jeg dette?</h2>
          <p className="text-xs text-muted-foreground mb-5">
            Typiske TEK-1501-eksamenspoersmaal mappet til riktig modul/leksjon.
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-1/2">
                    Hvis oppgaven sier ...
                  </th>
                  <th className="text-left font-semibold px-4 py-2">
                    Slaa opp her
                  </th>
                </tr>
              </thead>
              <tbody>
                {PENSUM_REGEX.map((r) => (
                  <tr key={r.kjern} className="border-t border-border">
                    <td className="px-4 py-3 italic">{r.kjern}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.svar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="rounded-xl border border-border bg-card p-5 text-sm space-y-3">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <Target className="h-4 w-4 text-brand" />
            Eksamen-strategi
          </h2>
          <ul className="space-y-2 text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">Foerst:</strong> identifiser
              hvilken fordeling som passer. Diskret eller kontinuerlig? Antall
              forsoek fast? Trekninger med eller uten tilbakelegging? Bruk{" "}
              <Link
                to="/stack/$slug"
                params={{ slug: "tek1-fordelinger" }}
                className="text-brand hover:underline"
              >
                fordelings-velgeren
              </Link>
              .
            </li>
            <li>
              <strong className="text-foreground">Deretter:</strong> sett opp
              formelen. Skriv ut hva n, p, mu, sigma er FOER du tar fram
              kalkulator. De fleste regnefeil skjer fordi parameterne ble blandet
              sammen.
            </li>
            <li>
              <strong className="text-foreground">Til slutt:</strong> sjekk om
              svaret er rimelig. Sannsynlighet skal vaere mellom 0 og 1.
              Konfidensintervall skal inneholde punktestimatet. p-verdi &gt; 0.05
              betyr IKKE at H0 er sann — bare at vi ikke kan forkaste den.
            </li>
          </ul>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <Calculator className="h-4 w-4 text-brand" />
            Hva med kalkulatoren?
          </h2>
          <p className="text-muted-foreground">
            Eksamen tillater grafisk kalkulator (Casio fx-9860 e.l.) eller
            tilsvarende. Mange tabeller (normal, t, kji-kvadrat) er gitt i
            eksamensvedlegget. Alle Python-oevelsene her speiler det du gjoer paa
            kalkulatoren — saa kan du verifisere haandregningen din. Det er den
            beste forberedelsen.
          </p>
        </div>
      </div>
    </StackPageShell>
  );
}
