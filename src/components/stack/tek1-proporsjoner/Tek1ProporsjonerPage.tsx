import { Link } from "@tanstack/react-router";
import { Lightbulb, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { Tex, TexBlock } from "@/components/Tex";
import {
  ProporsjonsCalculator,
  TwoProporsjonsCalculator,
} from "./ProporsjonsCalculator";
import { ProportionCiVisualizer } from "./ProportionCiVisualizer";
import { OneProportionZtest } from "./OneProportionZtest";
import { TwoProportionComparison } from "./TwoProportionComparison";
import { SampleSizeCalculator } from "./SampleSizeCalculator";
import { ChiSquareGoodnessOfFit } from "./ChiSquareGoodnessOfFit";
import { ProportionMatchQuiz } from "./ProportionMatchQuiz";

export function Tek1ProporsjonerPage() {
  return (
    <StackPageShell title="TEK-1501 — Inferens for proporsjoner" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            TEK-1501 · Andeler, andelsdifferanser, og bedre KI-er
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Inferens for proporsjoner
          </h1>
          <p className="mt-3 text-muted-foreground">
            Når dataene er binære (suksess/ikke-suksess), trenger vi inferens
            for en proporsjon <Tex>{"p"}</Tex>. Pensum: OpenIntro Statistics 4E
            kap. 6.1 (én proporsjon) og 6.2 (to proporsjoner). Du lærer hvorfor
            standard Wald-CI er en av de dårligste teknikkene i statistikken og
            hvilke bedre alternativ du bør bruke.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Faktum:</span> Wald-CI for én
              proporsjon har overraskende dårlig <em>dekningsgrad</em> selv ved
              <em> store</em> n når <Tex>{"\\hat{p}"}</Tex> er nær 0 eller 1.
              Wilson-CI og Agresti-Coull-CI fikser problemet med svært enkel
              matematikk — så hvorfor lærer mange enda Wald?
            </div>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Punktestimat og CLT-betingelse</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Med <Tex>{"x"}</Tex> suksesser i <Tex>{"n"}</Tex> uavhengige
              Bernoulli-forsøk:
            </p>
            <TexBlock>{"\\hat{p} = \\frac{x}{n}"}</TexBlock>
            <p>
              For at <Tex>{"\\hat{p}"}</Tex> skal være tilnærmet normalfordelt
              (slik at z-baserte CI/tester funker) krever vi{" "}
              <strong>CLT-betingelsen for proporsjoner</strong>:
            </p>
            <TexBlock>{"n\\hat{p} \\geq 10 \\quad \\text{og} \\quad n(1-\\hat{p}) \\geq 10"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Når dette ikke er oppfylt: bruk <strong>exakt binomial test</strong>{" "}
              (Clopper-Pearson-CI). Den er konservativ men korrekt.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Wald, Wilson og Agresti-Coull</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <div className="font-semibold">Wald-CI (standard som bør unngås):</div>
            <TexBlock>{"\\hat{p} \\pm z_{\\alpha/2} \\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}}"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Symmetrisk om <Tex>{"\\hat{p}"}</Tex>. Når{" "}
              <Tex>{"\\hat{p} = 0"}</Tex> blir SE = 0 og CI degenererer til ett
              punkt — det er meningsløst.
            </p>
            <div className="font-semibold pt-2">Wilson-score-CI (anbefalt):</div>
            <TexBlock>{"\\frac{\\hat{p} + \\frac{z^2}{2n} \\pm z\\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n} + \\frac{z^2}{4n^2}}}{1 + \\frac{z^2}{n}}"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Asymmetrisk når <Tex>{"\\hat{p}"}</Tex> er nær 0 eller 1. Default
              i moderne biblioteker (R&apos;s <code>prop.test</code>,{" "}
              <code>statsmodels.proportion_confint(method=&apos;wilson&apos;)</code>).
            </p>
            <div className="font-semibold pt-2">Agresti-Coull-CI («pluss-fire»-trikset):</div>
            <p>
              «Legg til <Tex>{"z^2/2"}</Tex> suksesser og <Tex>{"z^2/2"}</Tex>{" "}
              fiaskoer, så gjør Wald»:
            </p>
            <TexBlock>{"\\tilde{p} = \\frac{x + z^2/2}{n + z^2}, \\quad \\mathrm{CI} = \\tilde{p} \\pm z\\sqrt{\\frac{\\tilde{p}(1-\\tilde{p})}{n + z^2}}"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              For 95 %-CI: <Tex>{"z \\approx 1.96"}</Tex>, så vi legger til ~2
              suksesser og ~2 fiaskoer (derav «pluss-fire»). Like enkel som
              Wald, men nesten like god dekning som Wilson.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Interaktiv: én proporsjon</h2>
          <ProporsjonsCalculator />
          <p className="text-xs text-muted-foreground mt-3">
            Sett <Tex>{"x = 0"}</Tex> eller <Tex>{"x = n"}</Tex> — se at Wald
            kollapser, mens Wilson og AC fortsatt gir meningsfulle intervaller.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            3b. Wald vs Wilson vs Clopper-Pearson — visualisering
          </h2>
          <ProportionCiVisualizer />
          <p className="text-xs text-muted-foreground mt-3">
            Clopper-Pearson er <em>eksakt</em> — beregnet direkte fra
            binomial-fordelingen — og garanterer at dekningsgraden er minst
            konfidensnivået. Den er konservativ (bredere CI), men trygg ved
            ekstreme <Tex>{"\\hat{p}"}</Tex>.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Test av én proporsjon</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Test <Tex>{"H_0: p = p_0"}</Tex> mot <Tex>{"H_1: p \\neq p_0"}</Tex>:
            </p>
            <TexBlock>{"z = \\frac{\\hat{p} - p_0}{\\sqrt{p_0 (1 - p_0) / n}} \\;\\sim\\; N(0, 1) \\text{ under } H_0"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Viktig: bruk <Tex>{"p_0"}</Tex>, IKKE <Tex>{"\\hat{p}"}</Tex>, i
              nevneren — vi regner SE under nullhypotesen. CLT-betingelsen
              sjekkes med <Tex>{"n p_0 \\geq 10"}</Tex>,{" "}
              <Tex>{"n(1 - p_0) \\geq 10"}</Tex>.
            </p>
            <div className="font-semibold pt-2">Eksempel:</div>
            <p>
              <Tex>{"n = 200"}</Tex>, <Tex>{"x = 90"}</Tex>,{" "}
              <Tex>{"\\hat{p} = 0.45"}</Tex>. Test{" "}
              <Tex>{"H_0: p = 0.5"}</Tex> mot tosidig <Tex>{"H_1"}</Tex>:
            </p>
            <TexBlock>{"z = \\frac{0.45 - 0.5}{\\sqrt{0.5 \\cdot 0.5 / 200}} = \\frac{-0.05}{0.03536} = -1.414"}</TexBlock>
            <p>
              <Tex>{"|{-1.414}| < 1.96"}</Tex> → behold <Tex>{"H_0"}</Tex>.
              p-verdi <Tex>{"\\approx 0.157"}</Tex>.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            4b. Interaktiv: 1-prop z-test og null-fordelingen
          </h2>
          <OneProportionZtest />
          <p className="text-xs text-muted-foreground mt-3">
            Den blå kurven er null-fordelingen{" "}
            <Tex>{"N(p_0, \\sqrt{p_0(1-p_0)/n})"}</Tex>. Skygge = avvisningsområde
            ved α = 0.05. Rød prikk = observert <Tex>{"\\hat{p}"}</Tex>. Skru n
            opp — SE krymper og samme avstand fra <Tex>{"p_0"}</Tex> blir
            statistisk signifikant (power øker).
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. To proporsjoner — pooled vs unpooled SE</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <div className="font-semibold">KI for <Tex>{"p_1 - p_2"}</Tex> (unpooled SE):</div>
            <TexBlock>{"(\\hat{p}_1 - \\hat{p}_2) \\pm z_{\\alpha/2} \\sqrt{\\frac{\\hat{p}_1(1-\\hat{p}_1)}{n_1} + \\frac{\\hat{p}_2(1-\\hat{p}_2)}{n_2}}"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Vi antar ikke at proporsjonene er like — så vi bruker hver{" "}
              <Tex>{"\\hat{p}_i"}</Tex> separat.
            </p>
            <div className="font-semibold pt-2">Test <Tex>{"H_0: p_1 = p_2"}</Tex> (pooled SE):</div>
            <TexBlock>{"\\hat{p}_{\\text{pool}} = \\frac{x_1 + x_2}{n_1 + n_2}"}</TexBlock>
            <TexBlock>{"z = \\frac{\\hat{p}_1 - \\hat{p}_2}{\\sqrt{\\hat{p}_{\\text{pool}} (1 - \\hat{p}_{\\text{pool}})\\left(\\frac{1}{n_1} + \\frac{1}{n_2}\\right)}}"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Under <Tex>{"H_0"}</Tex> er <Tex>{"p_1 = p_2"}</Tex>, så vi
              estimerer dette felles <Tex>{"p"}</Tex> med pooled-andelen. Da
              blir SE-uttrykket korrekt.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Interaktiv: to proporsjoner</h2>
          <TwoProporsjonsCalculator />
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            6b. Visualisering — to grupper med error bars
          </h2>
          <TwoProportionComparison />
          <p className="text-xs text-muted-foreground mt-3">
            Forhåndsdefinerte scenarier: vaksine-effektivitet, A/B-test,
            kjønnsfordeling. Husk: <strong>KI bruker unpooled SE</strong> mens{" "}
            <strong>z-testen bruker pooled SE</strong>.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Sample size-planlegging</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              For å oppnå en KI med ønsket margin of error <Tex>{"E"}</Tex>:
            </p>
            <TexBlock>{"n = \\frac{z_{\\alpha/2}^2 \\cdot \\hat{p}^*(1 - \\hat{p}^*)}{E^2}"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              <Tex>{"\\hat{p}^*"}</Tex> = beste forhåndsestimat (fra pilotstudie
              eller litteratur). Konservativt valg er{" "}
              <Tex>{"\\hat{p}^* = 0.5"}</Tex> som maksimerer{" "}
              <Tex>{"\\hat{p}^*(1 - \\hat{p}^*) = 0.25"}</Tex>.
            </p>
            <p className="font-semibold">Eksempel:</p>
            <p>
              Margin på <Tex>{"\\pm 3\\%"}</Tex> (E = 0.03) ved 95 %-konfidens,
              uten forhåndskunnskap:
            </p>
            <TexBlock>{"n = \\frac{1.96^2 \\cdot 0.25}{0.03^2} \\approx 1067"}</TexBlock>
            <p>Derfor har politiske gallup-spørreundersøkelser typisk ~1000 respondenter.</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            7b. Interaktiv: sample-size-kalkulator
          </h2>
          <SampleSizeCalculator />
          <p className="text-xs text-muted-foreground mt-3">
            Tre brukseksempler innebygget: meningsmåling (E = 3 %), medisinsk
            studie (E = 5 %), QA-inspeksjon (E = 1 %). Bytt til{" "}
            <em>To proporsjoner</em>-modus for å planlegge en A/B-test eller
            klinisk studie der du sammenligner to grupper.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Når CLT ikke holder — exakt binomial</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Med små <Tex>{"n"}</Tex> eller ekstreme <Tex>{"\\hat{p}"}</Tex>:
              bruk binomialfordelingen direkte. To-sidet p-verdi for{" "}
              <Tex>{"H_0: p = p_0"}</Tex> er
            </p>
            <TexBlock>{"p\\text{-verdi} = \\sum_{k:\\,P(K=k|p_0)\\,\\leq\\,P(K=x|p_0)} \\binom{n}{k} p_0^k (1-p_0)^{n-k}"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Eller bruk <code>scipy.stats.binomtest</code> som beregner exakt.
              Clopper-Pearson-CI er den exakte motparten av denne testen.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">9. Eksamen-feller</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>SE i test vs KI er ulike.</strong> KI bruker{" "}
              <Tex>{"\\hat{p}"}</Tex> i SE. z-test for{" "}
              <Tex>{"H_0: p = p_0"}</Tex> bruker <Tex>{"p_0"}</Tex>. Ikke bland.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>2-prop: pooled i test, unpooled i KI.</strong> Vanlig
              eksamen-felle å bruke samme SE for begge.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Wald nær 0/1 er meningsløs.</strong> Ved{" "}
              <Tex>{"x = 0"}</Tex> får du CI = [0, 0]. Ved{" "}
              <Tex>{"x = n"}</Tex> får du CI = [1, 1]. Bruk Wilson eller
              Agresti-Coull.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>CLT-sjekk.</strong> Husk <Tex>{"n\\hat{p} \\geq 10"}</Tex>{" "}
              OG <Tex>{"n(1 - \\hat{p}) \\geq 10"}</Tex>. Hvis brutt: bruk
              binomial-exakt eller mer data.
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            9b. Chi-square goodness-of-fit
          </h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm mb-3">
            <p>
              Når du har <strong>flere enn to kategorier</strong> (multinomial)
              og vil teste om dataene følger en gitt fordeling, bruker du{" "}
              <Tex>{"\\chi^2"}</Tex>-goodness-of-fit:
            </p>
            <TexBlock>{"\\chi^2 = \\sum_{i=1}^{k} \\frac{(O_i - E_i)^2}{E_i} \\;\\sim\\; \\chi^2_{k-1} \\text{ under } H_0"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Krav: alle <Tex>{"E_i \\geq 5"}</Tex> for at chi-kvadrat-approks
              skal være rimelig. Hvis brutt: slå sammen små kategorier.
            </p>
          </div>
          <ChiSquareGoodnessOfFit />
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            9c. Hvilken test passer? — match-quiz
          </h2>
          <ProportionMatchQuiz />
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">10. Python — proporsjons-CI og test</h2>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`from statsmodels.stats.proportion import (
    proportion_confint, proportions_ztest
)

# 1-prop: 90 suksesser av 200
ci = proportion_confint(count=90, nobs=200, alpha=0.05, method='wilson')
print(f"Wilson 95 % CI: {ci}")

# 1-prop z-test: H_0: p = 0.5
zstat, pval = proportions_ztest(count=90, nobs=200, value=0.5)
print(f"z = {zstat:.3f}, p = {pval:.4f}")

# 2-prop z-test: H_0: p_1 = p_2 (pooled SE)
zstat, pval = proportions_ztest(count=[48, 30], nobs=[120, 100])
print(f"z = {zstat:.3f}, p = {pval:.4f}")

# Exakt binomial (når CLT ikke holder)
from scipy import stats
res = stats.binomtest(k=2, n=12, p=0.5, alternative='two-sided')
print(f"exakt p = {res.pvalue:.4f}")
print(f"Clopper-Pearson CI = {res.proportion_ci(method='exact')}")`}</pre>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "tek1-anova" }}
                className="text-brand hover:underline"
              >
                Ettveis ANOVA og F-test
              </Link>{" "}
              — sammenligning av snitt for flere grupper.
            </li>
            <li>
              <Link to="/python" className="text-brand hover:underline">/python</Link>{" "}
              — <code className="text-xs">proportion_confint</code>,{" "}
              <code className="text-xs">proportions_ztest</code> og{" "}
              <code className="text-xs">binomtest</code>.
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
