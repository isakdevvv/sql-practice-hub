import { Link } from "@tanstack/react-router";
import {Lightbulb, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex, TexBlock } from "@/components/Tex";

const STEPS = [
  { title: "Hvorfor deskriptiv statistikk?", anchor: "motivasjon" },
  { title: "Sentralmål — gjennomsnitt, median, modus", anchor: "sentral" },
  { title: "Kvartiler og persentiler", anchor: "kvartiler" },
  { title: "Spredningsmål — varians, std, IQR", anchor: "spredning" },
  { title: "Visualisering — histogram, boksplott, scatter", anchor: "visual" },
  { title: "Når bruke hva?", anchor: "naar" },
  { title: "Eksamen-feller", anchor: "feller" },
];

export function Tek1DeskriptivPage() {
  return (
    <StackPageShell
      title="Modul 1 — Deskriptiv statistikk"
      group="eksamen"
    >
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            TEK-1501 · Modul 1 av 4
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Deskriptiv statistikk — sammenfatt dataene
          </h1>
          <p className="mt-3 text-muted-foreground">
            Før vi modellerer noe må vi se på rå-dataene. Deskriptiv statistikk
            er verktøykassa for å beskrive et utvalg med få tall: hvor ligger
            dataene typisk (sentralmål), hvor mye varierer de (spredning), og
            hvordan ser de ut (visualisering). Det er fundamentet alt annet i
            kurset hviler på.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgavene
              </Link>{" "}
              under «Deskriptiv statistikk», og{" "}
              <Link to="/python" className="text-brand hover:underline">
                Python-øvelsene
              </Link>{" "}
              under «Statistikk-grunnlag» — beregn snitt/std/median fra ekte
              datasett.
            </div>
          </div>
        </div>

        <CourseOutline courseId="tek1-deskriptiv" steps={STEPS} />

        <section id="motivasjon" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor deskriptiv statistikk?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Du har et datasett med 200 målinger av tykkelse på en stålplate. Du
            kan ikke vise alle 200 tall til sjefen — du må sammenfatte. Med to
            tall (snitt og std) får du fortalt mesteparten: «målingene ligger
            rundt 12.4 mm, med spredning på ±0.3 mm». Det er deskriptiv
            statistikk.
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Tommelfingerregel
            </div>
            <p className="text-sm text-foreground">
              Et utvalg beskrives alltid med to ting: <strong>lokasjon</strong>{" "}
              (sentralmål — hvor er midten?) og <strong>spredning</strong> (hvor
              langt fra midten ligger typisk verdi?). Pluss et bilde
              (visualisering) for å se formen.
            </p>
          </div>
        </section>

        <section id="sentral" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Sentralmål</h2>
          <p className="text-sm text-muted-foreground mb-4">
            «Hvor ligger midten av dataene?» Tre vanlige svar — hvert med sine
            styrker og svakheter.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div>
              <div className="font-semibold text-sm mb-1">Gjennomsnitt (mean, <Tex>{"\\bar{x}"}</Tex>):</div>
              <TexBlock>{"\\bar{x} = \\frac{1}{n} \\sum_{i=1}^{n} x_i"}</TexBlock>
              <p className="text-xs text-muted-foreground mt-2">
                Pros: matematisk håndterbart, bruker ALL info.<br />
                Cons: TREKKES KRAFTIG av ekstreme verdier (outliers).
              </p>
            </div>
            <div>
              <div className="font-semibold text-sm mb-1">Median:</div>
              <p className="text-xs text-muted-foreground">
                Sorter dataene. Median = midtre verdi (eller snittet av de to midtre hvis n er partall).<br />
                Pros: ROBUST mot outliers. Riktig sentralmål for skjeve fordelinger.<br />
                Cons: bruker bare midt-info, ikke alle verdier.
              </p>
            </div>
            <div>
              <div className="font-semibold text-sm mb-1">Modus:</div>
              <p className="text-xs text-muted-foreground">
                Verdien som forekommer oftest.<br />
                Pros: eneste som funker for kategoriske data ("blå", "rød", ...).<br />
                Cons: kan være ikke-unik eller ikke eksistere.
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Eksempel — lønn på et lite kontor
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Lønn (1000 kr/år):  450, 460, 480, 490, 500, 510, 520, 540, 2400

  Gjennomsnitt = 5350/9 ≈ 594.4
  Median       = 500 (femte verdi i sortert rekke)
  Modus        = ingen (alle verdier er unike)

  Hvilket forteller "typisk lønn"? MEDIAN.
  Gjennomsnittet er kraftig trukket av sjefens 2400.`}</pre>
          </div>
        </section>

        <section id="kvartiler" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Kvartiler og persentiler</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Generaliseringen av median: del datasettet i fire like deler.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Q1 (1. kvartil, 25-persentil):  25% av dataene er ≤ Q1
Q2 (2. kvartil = median):       50% av dataene er ≤ Q2
Q3 (3. kvartil, 75-persentil):  75% av dataene er ≤ Q3

IQR (Interkvartilbredde) = Q3 - Q1
  → spredning i midtre 50% av dataene
  → robust mot outliers (unlike standardavvik)

5-tallsoppsummering:  Min, Q1, Median, Q3, Max
  → grunnlaget for boksplott.`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Eksempel — eksamenskarakterer
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Karakterer:  C, C, D, D, D, D, D, E, E, F

  n = 10. Med 0-indeksert sortert rekke:
  Min      = F (eller C — avhenger av "best er lavest" eller motsatt)
  Q1 (n*0.25 = 2.5 → mellom indeks 2 og 3) ≈ D
  Median (n*0.5 = 5 → snitt av indeks 4 og 5) ≈ D
  Q3 (n*0.75 = 7.5 → mellom indeks 7 og 8)  ≈ E
  Max      = C (eller F)

  IQR (numerisk, om vi mapper A=5..F=0): Q3 - Q1 ≈ 1 karakter`}</pre>
          </div>
        </section>

        <section id="spredning" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Spredningsmål</h2>
          <p className="text-sm text-muted-foreground mb-4">
            «Hvor mye varierer dataene rundt sentralmålet?» Tre vanlige svar.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div>
              <div className="font-semibold text-sm mb-1">Range (variasjonsbredde):</div>
              <TexBlock>{"\\text{Range} = x_{\\max} - x_{\\min}"}</TexBlock>
              <p className="text-xs text-muted-foreground mt-1">Enkleste, men outlier-sensitiv.</p>
            </div>
            <div>
              <div className="font-semibold text-sm mb-1">Varians (stikkprøve, <Tex>{"s^2"}</Tex>):</div>
              <TexBlock>{"s^2 = \\frac{1}{n-1} \\sum_{i=1}^{n} (x_i - \\bar{x})^2"}</TexBlock>
              <p className="text-xs text-muted-foreground mt-1">
                MERK: <Tex>{"n-1"}</Tex>, ikke <Tex>{"n"}</Tex>. Vi har brukt opp én "frihetsgrad" på <Tex>{"\\bar{x}"}</Tex>.
                Det gjør <Tex>{"s^2"}</Tex> forventningsrett (unbiased) for <Tex>{"\\sigma^2"}</Tex>.
              </p>
            </div>
            <div>
              <div className="font-semibold text-sm mb-1">Standardavvik (stikkprøve, <Tex>{"s"}</Tex>):</div>
              <TexBlock>{"s = \\sqrt{s^2} = \\sqrt{\\frac{1}{n-1} \\sum_{i=1}^{n} (x_i - \\bar{x})^2}"}</TexBlock>
              <p className="text-xs text-muted-foreground mt-1">Samme enhet som dataene. Lettere å tolke enn varians.</p>
            </div>
            <div>
              <div className="font-semibold text-sm mb-1">IQR (interkvartilbredde):</div>
              <TexBlock>{"\\text{IQR} = Q_3 - Q_1"}</TexBlock>
              <p className="text-xs text-muted-foreground mt-1">Robust mot outliers.</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong>Klassisk eksamen-felle:</strong> blande sammen{" "}
            <em>populasjons-varians</em> (deler på n) og{" "}
            <em>stikkprøve-varians</em> (deler på n-1). I TEK-1501 oppgaver er
            datasettet nesten alltid et stikkprøveutvalg — bruk{" "}
            <code className="text-xs">n-1</code>. I numpy: <code className="text-xs">np.var(x, ddof=1)</code>{" "}
            for stikkprøve, <code className="text-xs">ddof=0</code> for populasjon.
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Manuell beregning — fem målinger
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre mb-3">{`Data:  2, 4, 4, 6, 8     (n = 5)

  Avvik:        -2.8, -0.8, -0.8, 1.2, 3.2
  Kvadrert:     7.84, 0.64, 0.64, 1.44, 10.24
  Sum:          20.80`}</pre>
            <TexBlock>{"\\bar{x} = \\frac{2+4+4+6+8}{5} = \\frac{24}{5} = 4.8"}</TexBlock>
            <TexBlock>{"s^2 = \\frac{20.80}{5-1} = 5.20"}</TexBlock>
            <TexBlock>{"s = \\sqrt{5.20} \\approx 2.28"}</TexBlock>
          </div>
        </section>

        <section id="visual" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Visualisering</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tall sammenfatter, men bilder avslører. Disse er obligatoriske å
            kjenne.
          </p>
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold text-sm mb-2">Histogram</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Del verdiområdet i intervaller (bins). Tegn én søyle per
                intervall, høyde = antall observasjoner. Viser formen på
                fordelingen: symmetrisk, skjev, bimodal?
              </p>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`Bins:  [0-2)  [2-4)  [4-6)  [6-8)  [8-10)
Antall:   3      8     12      6      1

  Søylene:   ▮▮▮  ▮▮▮▮▮▮▮▮  ▮▮▮▮▮▮▮▮▮▮▮▮  ▮▮▮▮▮▮  ▮

  Tolkning: høyrehale-skjev (positiv skjevhet) — typisk for inntekt.`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold text-sm mb-2">Boksplott (boxplot)</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Visualiserer 5-tallsoppsummeringen. Boksen går fra Q1 til Q3,
                strek inni = median, «whiskers» strekker seg til siste verdi
                innenfor 1.5×IQR. Punkter utenfor = outliers.
              </p>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`     min     Q1       median       Q3     max
      |---------[============|============]---------|

  Bra for å sammenligne FLERE grupper side-om-side.
  Bra for å oppdage outliers.`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold text-sm mb-2">Scatter plot</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Hvert datapunkt = (x, y)-koordinat. Brukes for å se sammenheng
                mellom to variabler. Grunnlaget for korrelasjon og regresjon
                (Modul 4).
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold text-sm mb-2">Frekvenstabell</h3>
              <p className="text-sm text-muted-foreground mb-2">
                For kategoriske data: en tabell med kategori → antall (og evt.
                prosent). Visualiseres som søylediagram eller kakediagram.
              </p>
            </div>
          </div>
        </section>

        <section id="naar" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Når bruke hva?</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-1/2">
                    Situasjon
                  </th>
                  <th className="text-left font-semibold px-4 py-2">
                    Anbefalt mål
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Symmetrisk fordeling, ingen outliers</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Mean + std
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Skjev fordeling (inntekt, ventetid)</td>
                  <td className="px-4 py-3 text-muted-foreground">Median + IQR</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Datasett med åpenbare outliers</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Median + IQR (robust)
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Kategoriske data (farger, merker)</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Modus + frekvenstabell
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Sammenligne to grupper</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Boksplott + median
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Se formen på fordelingen</td>
                  <td className="px-4 py-3 text-muted-foreground">Histogram</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Sammenheng mellom to målinger</td>
                  <td className="px-4 py-3 text-muted-foreground">Scatter</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="feller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Eksamen-feller</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>n vs. n−1 i nevner.</strong> For stikkprøve-varians bruker
              vi n−1. For populasjons-varians (sjeldent på eksamen) bruker vi n.
              Default er ALLTID n−1 i TEK-1501-kontekst.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Mean påvirkes av ALLE verdier.</strong> Én ekstremverdi kan
              flytte snittet kraftig. Median påvirkes bare av rekkefølgen.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Standardavvik <Tex>{"\\neq"}</Tex> standardfeil.</strong> <Tex>{"s"}</Tex> = utvalgets
              spredning. <Tex>{"SE = s/\\sqrt{n}"}</Tex> = usikkerheten i snittet. De forveksles ofte.
              Mer om SE i Modul 4.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Bins påvirker histogrammet.</strong> For få bins skjuler
              struktur, for mange viser støy. Vanlig tommelregel: <Tex>{"\\text{bins} \\approx \\sqrt{n}"}</Tex> eller
              Sturges' formel <Tex>{"\\lceil \\log_2(n) + 1 \\rceil"}</Tex>.
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>{" "}
              under «Deskriptiv statistikk» — beregn snitt/median/IQR for små
              datasett.
            </li>
            <li>
              <Link to="/python" className="text-brand hover:underline">
                Python-øvelser
              </Link>{" "}
              — verifisér håndregning med numpy.
            </li>
            <li>
              Neste modul:{" "}
              <Link
                to="/stack/$slug"
                params={{ slug: "tek1-sannsynlighet" }}
                className="text-brand hover:underline"
              >
                Sannsynlighet og kombinatorikk
              </Link>{" "}
              — fra observert data til modellert usikkerhet.
            </li>
          </ul>
        </div>
              <div className="mt-6">
          <Link
            to="/stack/$slug"
            params={{ slug: "tek-1501" }}
            className="text-brand hover:underline inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tilbake til TEK-1501-hub
          </Link>
        </div>
</div>
    </StackPageShell>
  );
}
