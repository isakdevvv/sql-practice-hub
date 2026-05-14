import { Link } from "@tanstack/react-router";
import { Lightbulb, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { Tex, TexBlock } from "@/components/Tex";
import { RegresjonDiagnostikk } from "./RegresjonDiagnostikk";
import { QqPlotInteractive } from "./QqPlotInteractive";
import { BootstrapResamplingSim } from "@/components/stack/tek1-bootstrap/BootstrapResamplingSim";

export function Tek1RegresjonDiagnostikkPage() {
  return (
    <StackPageShell
      title="TEK-1501 — Regresjon-diagnostikk"
      group="eksamen"
    >
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            TEK-1501 · Etter regresjon — diagnostikk
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Regresjon-diagnostikk: residualer, R², Cook&apos;s D
          </h1>
          <p className="mt-3 text-muted-foreground">
            En regresjonslinje er bare halve jobben. Diagnostikken forteller deg
            om OLS-antakelsene faktisk holder, om R² lyver, og om enkelte
            observasjoner drar resultatet alene. Pensum: OpenIntro Statistics 4E
            kap. 8.2–8.4.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hovedidé:</span> en høy R² er
              <em> ikke</em> bevis på en god modell. Residualplott avslører
              ikke-linearitet og heteroskedastisitet som R² aldri ser.
            </div>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. De 4 OLS-antakelsene</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>
                <strong>Linearitet:</strong> sann sammenheng mellom{" "}
                <Tex>{"x"}</Tex> og <Tex>{"y"}</Tex> er lineær. Brudd:
                residualene danner en systematisk kurve.
              </li>
              <li>
                <strong>Uavhengighet av feil:</strong>{" "}
                <Tex>{"\\varepsilon_i"}</Tex> er uavhengige. Brudd: tidsserie-data
                har autokorrelasjon (Durbin–Watson-test).
              </li>
              <li>
                <strong>Homoskedastisitet:</strong> konstant varians{" "}
                <Tex>{"\\mathrm{Var}(\\varepsilon_i) = \\sigma^2"}</Tex> for alle{" "}
                <Tex>{"x"}</Tex>. Brudd: residualplott viser trakt-form.
              </li>
              <li>
                <strong>Normalitet:</strong>{" "}
                <Tex>{"\\varepsilon_i \\sim N(0, \\sigma^2)"}</Tex>. Brudd
                synlig i Q-Q-plot. Mindre kritisk for store{" "}
                <Tex>{"n"}</Tex> (CLT redder de fleste estimater).
              </li>
            </ol>
            <p className="text-xs text-muted-foreground">
              Modellen «virker» fortsatt med brudd, men <em>standardfeilene</em>{" "}
              og dermed konfidensintervaller og p-verdier blir feil.
            </p>
          </div>
        </section>

        <Section number="2" title="Residualer — definisjon og bruk">
          <p className="text-sm text-muted-foreground mb-3">
            Etter en OLS-tilpassing <Tex>{"\\hat{y}_i = \\hat{\\beta}_0 + \\hat{\\beta}_1 x_i"}</Tex>{" "}
            er den observerte feilen for punkt <Tex>{"i"}</Tex>:
          </p>
          <TexBlock>{"e_i = y_i - \\hat{y}_i"}</TexBlock>
          <p className="text-sm text-muted-foreground mt-3">
            Standardplott: <em>residual mot ŷ</em>. Grunnlinje: tilfeldig sky
            sentrert om 0, samme spredning over hele <Tex>{"x"}</Tex>-aksen.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-xs font-semibold text-emerald-400 mb-1">
                Bra mønster
              </div>
              <div className="text-xs text-muted-foreground">
                Random sky, ingen kurve, samme spredning. Antakelsene holder.
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-xs font-semibold text-amber-400 mb-1">
                Dårlige mønstre
              </div>
              <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                <li>Kurve → ikke-lineær sammenheng</li>
                <li>Trakt → heteroskedastisitet</li>
                <li>Tydelig outlier → enkeltobservasjon drar fittet</li>
              </ul>
            </div>
          </div>
        </Section>

        <Section number="3" title="Heteroskedastisitet — trakt-formen">
          <p className="text-sm text-muted-foreground mb-3">
            Varians vokser eller krymper med <Tex>{"\\hat{y}"}</Tex>:
            klassisk «trakt-form». Eksempel: kostnader vokser med prosjekt-størrelse,
            men <em>spredningen</em> i kostnader vokser også.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            Konsekvens: <Tex>{"\\hat{\\beta}"}</Tex> er fortsatt forventningsrett, men{" "}
            <Tex>{"\\mathrm{SE}(\\hat{\\beta})"}</Tex> er feil. Konfidensintervaller
            for smale, p-verdier for små. Vi tror modellen er signifikant når
            den ikke er det.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            <strong>Fiks:</strong> log-transform av <Tex>{"y"}</Tex>, weighted
            least squares (WLS), eller bruk robust «sandwich»-estimator for
            standardfeil (i statsmodels: <code>get_robustcov_results(cov_type=&quot;HC3&quot;)</code>).
          </p>
        </Section>

        <Section number="4" title="Q-Q-plot — sjekk normalitet">
          <p className="text-sm text-muted-foreground mb-3">
            Sorter residualene og plot mot teoretiske kvantiler fra{" "}
            <Tex>{"N(0,1)"}</Tex>. Hvis residualene er normalfordelt skal
            punktene følge diagonalen.
          </p>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>S-form → tunge haler / lette haler</li>
            <li>Krumning → skjevhet</li>
            <li>Enkeltpunkter langt unna diagonalen → outliers</li>
          </ul>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre mt-3">{`import scipy.stats as st
import matplotlib.pyplot as plt

st.probplot(residuals, dist="norm", plot=plt)
plt.show()`}</pre>
          <div className="mt-4">
            <QqPlotInteractive />
          </div>
        </Section>

        <Section number="4b" title="Bootstrap — CI uten å anta normalfordeling">
          <p className="text-sm text-muted-foreground mb-3">
            Når residualene ikke ser normale ut og du fortsatt vil ha et
            konfidensintervall for en parameter, kan bootstrap hjelpe. Vi
            sampler MED tilbakelegging fra det observerte utvalget, regner
            statistikken på hvert resample, og bruker percentilene av
            resultatene som CI.
          </p>
          <BootstrapResamplingSim />
        </Section>

        <Section number="5" title="Outliers, leverage og innflytelse">
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Tre relaterte men ulike begreper:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Outlier:</strong> punkt med uvanlig stor residual (langt
                fra linja i <Tex>{"y"}</Tex>-retning).
              </li>
              <li>
                <strong>Høy leverage:</strong> punkt med uvanlig <Tex>{"x"}</Tex>{" "}
                (langt fra <Tex>{"\\bar{x}"}</Tex>). Stor <Tex>{"h_{ii}"}</Tex>{" "}
                i hat-matrisen.
              </li>
              <li>
                <strong>Innflytelse:</strong> punkt som faktisk drar{" "}
                <Tex>{"\\hat{\\beta}"}</Tex>. Krever <em>både</em> outlier og
                høy leverage.
              </li>
            </ul>
            <div className="font-semibold pt-2">Cook&apos;s distance:</div>
            <TexBlock>{"D_i = \\frac{e_i^2}{p\\, s^2} \\cdot \\frac{h_{ii}}{(1 - h_{ii})^2}"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              <Tex>{"p"}</Tex> = antall parametre (2 for enkel regresjon),{" "}
              <Tex>{"s^2"}</Tex> = MSE, <Tex>{"h_{ii}"}</Tex> = leverage.
              Tommelfingerregel: <Tex>{"D_i > 4/n"}</Tex> ⇒ verdt å undersøke;{" "}
              <Tex>{"D_i > 1"}</Tex> ⇒ alvorlig.
            </p>
          </div>
        </Section>

        <Section number="6" title="R² og R²-adjusted">
          <p className="text-sm text-muted-foreground mb-3">
            <strong>R²</strong> (determinasjonskoeffisient) måler andelen
            variasjon i <Tex>{"y"}</Tex> som forklares av modellen:
          </p>
          <TexBlock>{"R^2 = 1 - \\frac{\\sum (y_i - \\hat{y}_i)^2}{\\sum (y_i - \\bar{y})^2} = 1 - \\frac{\\mathrm{SSE}}{\\mathrm{SST}}"}</TexBlock>
          <p className="text-sm text-muted-foreground mt-3">
            Verdier i <Tex>{"[0, 1]"}</Tex>. Problem: <em>R² stiger alltid
            når du legger til en prediktor</em>, selv om prediktoren bare er
            støy. Justert R² straffer ekstra prediktorer:
          </p>
          <TexBlock>{"R^2_{\\text{adj}} = 1 - (1 - R^2) \\cdot \\frac{n - 1}{n - p - 1}"}</TexBlock>
          <p className="text-sm text-muted-foreground mt-3">
            <Tex>{"n"}</Tex> = antall observasjoner, <Tex>{"p"}</Tex> = antall
            prediktorer (uten intercept). For nestede modeller velg den med
            høyere <Tex>{"R^2_{\\text{adj}}"}</Tex>.
          </p>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 mt-3 text-xs">
            <strong>R² lyver når:</strong>
            <ul className="list-disc pl-5 mt-1 space-y-0.5 text-muted-foreground">
              <li>Du tvinger gjennom origo (<code>intercept=False</code>) — sammenligning blir feil.</li>
              <li>Du har transformert <Tex>{"y"}</Tex> (R² for log-y og y er ikke sammenlignbart).</li>
              <li>Du har én ekstrem outlier som drar SST mye.</li>
              <li>Modellen passer godt <em>i trening</em>, ikke i test. R² er treningsmål.</li>
            </ul>
          </div>
        </Section>

        <Section number="7" title="Multikollinearitet — VIF kort">
          <p className="text-sm text-muted-foreground mb-3">
            Når to prediktorer er sterkt korrelerte blir{" "}
            <Tex>{"\\hat{\\beta}"}</Tex>-estimatene ustabile — små endringer i
            data gir store sprang i koeffisientene. Variance Inflation Factor:
          </p>
          <TexBlock>{"\\mathrm{VIF}_j = \\frac{1}{1 - R_j^2}"}</TexBlock>
          <p className="text-sm text-muted-foreground mt-3">
            <Tex>{"R_j^2"}</Tex> er fra regresjon av <Tex>{"x_j"}</Tex> mot
            alle andre prediktorer. Tommelfingerregel:{" "}
            <Tex>{"\\mathrm{VIF} > 5"}</Tex> bekymring;{" "}
            <Tex>{"\\mathrm{VIF} > 10"}</Tex> alvorlig.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            <strong>Fiks:</strong> drop én av de korrelerte, kombiner dem til
            én indeks, eller bruk Ridge-regresjon som tåler kollinearitet.
          </p>
        </Section>

        <Section number="8" title="Interaktivt: scatter + residual + Q-Q">
          <p className="text-sm text-muted-foreground mb-3">
            Bytt mellom scenariene og se hvordan residualplottet og Q-Q endrer
            seg. R² kan faktisk være anstendig høy selv når antakelsene er
            knust.
          </p>
          <RegresjonDiagnostikk />
        </Section>

        <Section number="9" title="Python — sjekk antakelsene før du tror på koeffisientene">
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`import numpy as np
import scipy.stats as st
import statsmodels.api as sm

X = sm.add_constant(x)              # legg til intercept-kolonne
model = sm.OLS(y, X).fit()

print(model.summary())              # R², R²-adj, p-verdier, F
residuals = model.resid
fitted    = model.fittedvalues

# 1) Residual vs predicted: skal være random sky
# 2) Q-Q for normalitet
st.probplot(residuals, dist="norm", plot=plt)

# 3) Cook's distance for innflytelse
infl = model.get_influence()
cooks = infl.cooks_distance[0]
print("Outliers (D > 4/n):", np.where(cooks > 4/len(y))[0])`}</pre>
          <p className="text-xs text-muted-foreground mt-3">
            <code>model.summary()</code> rapporterer{" "}
            <code>R-squared</code>, <code>Adj. R-squared</code>,
            Durbin–Watson, og Jarque-Bera (normalitets-test) i ett.
          </p>
        </Section>

        <Section number="10" title="Eksamen-sjekkliste">
          <div className="rounded-xl border border-border bg-card p-5 text-sm">
            <ol className="list-decimal pl-5 space-y-1.5 text-muted-foreground">
              <li>
                <strong>Tegn scatter først</strong> — er sammenhengen i det hele
                tatt lineær?
              </li>
              <li>
                Fit OLS, sjekk <em>residual mot ŷ</em>: mønster? Trakt?
              </li>
              <li>
                Q-Q-plot på residualer: følger diagonalen?
              </li>
              <li>
                Cook&apos;s D: noen punkter over <Tex>{"4/n"}</Tex>?
              </li>
              <li>
                Rapporter R² <strong>og</strong> R²-adj — særlig ved flere
                prediktorer.
              </li>
              <li>
                Sjekk VIF for multikollinearitet før du tolker individuelle{" "}
                <Tex>{"\\hat{\\beta}_j"}</Tex>.
              </li>
            </ol>
          </div>
        </Section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "tek1-hypotesetest-regresjon" }}
                className="text-brand hover:underline"
              >
                Hypotesetest og regresjon
              </Link>{" "}
              — slik tolker du <Tex>{"\\hat{\\beta}_1"}</Tex>{" "}
              og p-verdier <em>etter</em> du har sjekket antakelsene.
            </li>
            <li>
              <Link to="/python" className="text-brand hover:underline">/python</Link>{" "}
              — kjør <code>statsmodels</code>-eksempelet over på fasit-datasett.
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

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-3">
        {number}. {title}
      </h2>
      {children}
    </section>
  );
}
