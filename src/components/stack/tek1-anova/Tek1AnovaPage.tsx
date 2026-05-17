import { Link } from "@tanstack/react-router";
import { Lightbulb, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { Tex, TexBlock } from "@/components/Tex";
import { AnovaCalculator } from "./AnovaCalculator";
import { RelatedVisualizers } from "@/components/stack/RelatedVisualizers";
import { lazy, Suspense } from "react";
import { VisualizerSkeleton } from "@/components/visualizer-shell";

const AnovaVisualizer = lazy(() =>
  import("./AnovaVisualizer").then((m) => ({ default: m.AnovaVisualizer })),
);
const FDistributionExplorer = lazy(() =>
  import("./FDistributionExplorer").then((m) => ({
    default: m.FDistributionExplorer,
  })),
);
const OneWayAnovaSandbox = lazy(() =>
  import("./OneWayAnovaSandbox").then((m) => ({
    default: m.OneWayAnovaSandbox,
  })),
);
const PostHocTukeyVisualizer = lazy(() =>
  import("./PostHocTukeyVisualizer").then((m) => ({
    default: m.PostHocTukeyVisualizer,
  })),
);
const TwoWayAnovaViz = lazy(() =>
  import("./TwoWayAnovaViz").then((m) => ({ default: m.TwoWayAnovaViz })),
);
const AnovaAssumptionsCheck = lazy(() =>
  import("./AnovaAssumptionsCheck").then((m) => ({
    default: m.AnovaAssumptionsCheck,
  })),
);
const AnovaScenarioQuiz = lazy(() =>
  import("./AnovaScenarioQuiz").then((m) => ({
    default: m.AnovaScenarioQuiz,
  })),
);

export function Tek1AnovaPage() {
  return (
    <StackPageShell title="TEK-1501 — ANOVA og F-test" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            TEK-1501 · Inferens for tre eller flere grupper
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Ettveis ANOVA med F-test
          </h1>
          <p className="mt-3 text-muted-foreground">
            ANOVA — analysis of variance — er testen for å sammenligne snitt på
            tvers av tre eller flere grupper i ett jafs. Den ligger på samme
            inferens-rammeverk som t-testen, men bruker variansforhold (F)
            istedenfor differanse mellom snitt. Pensum: OpenIntro Statistics 4E
            kap. 7.5.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hovedidé:</span> sammenlign{" "}
              <em>variasjon mellom gruppene</em> med{" "}
              <em>variasjon innen gruppene</em>. Hvis forholdet er stort er det
              usannsynlig at alle gruppene har samme snitt.
            </div>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            Interaktiv visualisering
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            ANOVA = sammenligning av varians mellom grupper mot innenfor grupper.
            Hvis gruppene er mer forskjellige fra hverandre enn de er internt, så
            er gruppe-tilhørighet sannsynlig viktig. Bytt mellom modusene under
            for å se boxplots, varians-dekomponering, F-fordelingen, Bonferroni og
            et komplett worked example.
          </p>
          <Suspense fallback={<VisualizerSkeleton />}>
            <AnovaVisualizer />
          </Suspense>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            1. Hvorfor ikke bare mange t-tester?
          </h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Med 4 grupper er det{" "}
              <Tex>{"\\binom{4}{2} = 6"}</Tex> par å sammenligne. Hvis hver
              t-test har <Tex>{"\\alpha = 0.05"}</Tex> er sannsynligheten for
              <strong> minst én</strong> falsk forkasting (familywise error
              rate, FWER) langt over 5 %:
            </p>
            <TexBlock>{"\\mathrm{FWER} = 1 - (1 - \\alpha)^m"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Med <Tex>{"m = 6"}</Tex> og <Tex>{"\\alpha = 0.05"}</Tex>:{" "}
              <Tex>{"1 - 0.95^6 \\approx 0.265"}</Tex>. Det er 26.5 % sjanse for
              minst én Type I-feil — ikke 5 %.
            </p>
            <p>
              ANOVA løser dette med ÉN test på hypotesen «alle gruppene har
              samme snitt». Hvis vi forkaster der, kan vi etterpå gjøre
              kontrollerte parvise tester (Tukey HSD, Bonferroni) for å finne
              hvilke gruppene som skiller seg.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Hypoteser og antagelser</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <div>
              <div className="font-semibold mb-1">Hypoteser:</div>
              <TexBlock>{"H_0:\\ \\mu_1 = \\mu_2 = \\cdots = \\mu_k"}</TexBlock>
              <TexBlock>{"H_1:\\ \\text{minst ett par } \\mu_i \\neq \\mu_j"}</TexBlock>
              <p className="text-xs text-muted-foreground">
                Merk: <Tex>{"H_1"}</Tex> sier IKKE at alle er forskjellige —
                bare at ikke alle er like.
              </p>
            </div>
            <div>
              <div className="font-semibold mb-1">3 antagelser:</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Uavhengighet</strong> — observasjoner trukket
                  uavhengig fra hver gruppe.
                </li>
                <li>
                  <strong>Normalitet</strong> — innen hver gruppe er
                  responsen tilnærmet normalfordelt. Mindre kritisk når{" "}
                  <Tex>{"n_i"}</Tex> er stor (CLT).
                </li>
                <li>
                  <strong>Lik varians</strong> (homoskedastisitet) —{" "}
                  <Tex>{"\\sigma_1^2 = \\cdots = \\sigma_k^2"}</Tex>. Hvis
                  brutt: bruk Welch&apos;s ANOVA eller Kruskal–Wallis.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            3. F-statistikk og SS-dekomponering
          </h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <div className="font-semibold">Identitet:</div>
            <TexBlock>{"\\underbrace{\\sum_{i,j}(x_{ij} - \\bar{x}_{..})^2}_{SS_{total}} = \\underbrace{\\sum_i n_i (\\bar{x}_{i.} - \\bar{x}_{..})^2}_{SS_{between}} + \\underbrace{\\sum_{i,j}(x_{ij} - \\bar{x}_{i.})^2}_{SS_{within}}"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              <Tex>{"\\bar{x}_{i.}"}</Tex> = snitt i gruppe <Tex>{"i"}</Tex>,{" "}
              <Tex>{"\\bar{x}_{..}"}</Tex> = totalt snitt (grand mean).
            </p>
            <div className="font-semibold pt-2">Frihetsgrader:</div>
            <TexBlock>{"df_{between} = k - 1, \\quad df_{within} = N - k, \\quad df_{total} = N - 1"}</TexBlock>
            <div className="font-semibold pt-2">Mean squares:</div>
            <TexBlock>{"MS_{between} = \\frac{SS_{between}}{k - 1}, \\qquad MS_{within} = \\frac{SS_{within}}{N - k}"}</TexBlock>
            <div className="font-semibold pt-2">F-statistikken:</div>
            <TexBlock>{"F = \\frac{MS_{between}}{MS_{within}} \\;\\sim\\; F(k - 1,\\; N - k) \\text{ under } H_0"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              <Tex>{"MS_{within}"}</Tex> er en samlet (pooled) estimator for
              den felles variansen <Tex>{"\\sigma^2"}</Tex>.{" "}
              <Tex>{"MS_{between}"}</Tex> estimerer det samme ÉNSAK når{" "}
              <Tex>{"H_0"}</Tex> er sann. Når gruppemiddelene faktisk skiller
              seg, blir <Tex>{"MS_{between}"}</Tex> systematisk større, og{" "}
              <Tex>{"F"}</Tex> blir stor.
            </p>
            <div className="font-semibold pt-2">Forkast-regel:</div>
            <p>
              Forkast <Tex>{"H_0"}</Tex> hvis <Tex>{"F > F_{\\alpha,\\,k-1,\\,N-k}"}</Tex>{" "}
              eller hvis <Tex>{"p\\text{-verdi} < \\alpha"}</Tex>. F-fordelingen
              er kun høyresidet — vi har bare interesse i store F.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Interaktiv ANOVA</h2>
          <AnovaCalculator />
          <p className="text-xs text-muted-foreground mt-3">
            Skru opp <Tex>{"\\mu"}</Tex> for én gruppe og se{" "}
            <Tex>{"SS_{between}"}</Tex> vokse. Skru opp{" "}
            <Tex>{"\\sigma"}</Tex> for alle gruppene og se hvordan{" "}
            <Tex>{"MS_{within}"}</Tex> vokser slik at F går ned.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Eksempel: lese tabellen</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              3 sammensetninger av stål testes for bruddstyrke. <Tex>{"n_1 = n_2 = n_3 = 6"}</Tex>:
            </p>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded border border-border bg-background p-3">{`Sammensetning   målinger (MPa)              snitt
A               412 408 419 405 410 417     411.83
B               428 435 421 432 425 430     428.50
C               419 422 415 425 420 418     419.83
grand mean = (411.83 + 428.50 + 419.83) / 3 = 420.06`}</pre>
            <TexBlock>{"SS_{between} = 6\\,(411.83 - 420.06)^2 + 6\\,(428.50 - 420.06)^2 + 6\\,(419.83 - 420.06)^2 \\approx 833.4"}</TexBlock>
            <TexBlock>{"SS_{within} \\approx 384.2 \\;\\Rightarrow\\; MS_{within} \\approx 25.6"}</TexBlock>
            <TexBlock>{"F = \\frac{833.4 / 2}{25.6} = \\frac{416.7}{25.6} \\approx 16.28"}</TexBlock>
            <p>
              <Tex>{"df = (2,\\,15)"}</Tex>, kritisk <Tex>{"F_{0.05, 2, 15} = 3.68"}</Tex>.
              {" "}<Tex>{"16.28 > 3.68"}</Tex> → forkast <Tex>{"H_0"}</Tex>. Minst én
              sammensetning skiller seg.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Post-hoc: hvilke par skiller seg?</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              ANOVA sier bare at minst ett par skiller seg. Bruk{" "}
              <strong>post-hoc-tester</strong> for å finne hvilke:
            </p>
            <div className="font-semibold">Bonferroni-korreksjon:</div>
            <p>
              Kjør alle <Tex>{"m = \\binom{k}{2}"}</Tex> parvise t-tester, men
              krev <Tex>{"p < \\alpha / m"}</Tex> for å forkaste. Enkel og
              konservativ.
            </p>
            <div className="font-semibold pt-2">Tukey HSD (honest significant difference):</div>
            <TexBlock>{"\\mathrm{HSD} = q_{\\alpha, k, N-k} \\cdot \\sqrt{\\frac{MS_{within}}{n}}"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              <Tex>{"q"}</Tex> = studentized range. Forkast{" "}
              <Tex>{"\\mu_i = \\mu_j"}</Tex> hvis{" "}
              <Tex>{"|\\bar{x}_i - \\bar{x}_j| > \\mathrm{HSD}"}</Tex>. Mer
              kraftig enn Bonferroni når <Tex>{"k"}</Tex> er stor.
            </p>
            <div className="font-semibold pt-2">Beste praksis:</div>
            <p>
              Tukey HSD ved balanserte design (<Tex>{"n_i"}</Tex> like).
              Bonferroni ved få sammenligninger eller når du bare bryr deg om
              utvalgte par.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Eksamen-feller</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>F er alltid ≥ 0.</strong> Forholdet er av to summer av
              kvadrater. p-verdi {">"}{" "}
              <Tex>{"P(F_{\\,k-1,\\,N-k} \\geq F_{\\text{obs}})"}</Tex> — én
              hale (høyresidig).
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>«Forkast H₀»</strong> betyr <em>ikke</em> at alle gruppene
              skiller seg. Bare at minst ett par gjør. Gjør post-hoc for å
              identifisere hvilke.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Lik-varians-antakelsen.</strong> Hvis spredningen er
              veldig ulik mellom gruppene (Levene-test forkaster), bruk
              Welch&apos;s ANOVA (<code>scipy.stats.f_oneway</code> antar lik
              varians; bruk <code>pingouin.welch_anova</code> eller manuelt).
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>To-veis ANOVA er en helt annen test.</strong> Den
              håndterer to faktorer samtidig (f.eks. materiale × temperatur).
              Pensum i TEK-1501 er ettveis.
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Python — <code className="text-xs">scipy.stats.f_oneway</code></h2>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`import numpy as np
from scipy import stats

A = np.array([412, 408, 419, 405, 410, 417])
B = np.array([428, 435, 421, 432, 425, 430])
C = np.array([419, 422, 415, 425, 420, 418])

F, p = stats.f_oneway(A, B, C)
print(f"F = {F:.3f}, p = {p:.4f}")

# Post-hoc (Tukey HSD) — scikit-posthocs eller statsmodels
from statsmodels.stats.multicomp import pairwise_tukeyhsd
labels = ['A']*6 + ['B']*6 + ['C']*6
data = np.concatenate([A, B, C])
print(pairwise_tukeyhsd(data, labels, alpha=0.05))`}</pre>
        </section>

        {/* ============== DYBDE-SEKSJON ============== */}
        <div className="mt-12 mb-6 border-t border-border pt-6">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
            Dybde-modul
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Gå dypere: F-fordeling, post-hoc, to-veis, antagelser
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Pensum-kjernen er over. Disse 6 simulatorene tar tak i de
            vanskeligere flashcard-temaene én etter én — egne moduler for
            F-fordelings-formen, drag-og-slipp ANOVA, Tukey vs Bonferroni,
            to-veis interaksjon, antagelses-sjekk og en scenario-quiz.
          </p>
        </div>

        <section className="mb-10">
          <h3 className="text-lg font-semibold mb-2">
            9. F-fordelingen i dybden
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Tre moduser: hvordan endrer fordelingen seg når{" "}
            <Tex>{"df_1"}</Tex> og <Tex>{"df_2"}</Tex> vokser, hvor lander en
            F-observasjon i halen, og hva er <em>power</em> (1−β) for en gitt
            effektstørrelse?
          </p>
          <Suspense fallback={<VisualizerSkeleton />}>
            <FDistributionExplorer />
          </Suspense>
        </section>

        <section className="mb-10">
          <h3 className="text-lg font-semibold mb-2">
            10. En-faktors sandkasse — dra punktene
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Dra observasjonene opp/ned eller bytt gruppe. SS-dekomponering,
            F-statistikk og p-verdi oppdateres live.
          </p>
          <Suspense fallback={<VisualizerSkeleton />}>
            <OneWayAnovaSandbox />
          </Suspense>
        </section>

        <section className="mb-10">
          <h3 className="text-lg font-semibold mb-2">
            11. Post-hoc: Tukey HSD vs Bonferroni vs ukorrigert
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Etter en signifikant ANOVA — hvilke par er forskjellige? Se hvordan
            ukorrigerte tester finner flere «signifikante» par enn Tukey og
            Bonferroni — og hvorfor det er en falsk seier.
          </p>
          <Suspense fallback={<VisualizerSkeleton />}>
            <PostHocTukeyVisualizer />
          </Suspense>
        </section>

        <section className="mb-10">
          <h3 className="text-lg font-semibold mb-2">
            12. To-veis ANOVA og interaksjon
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Dose × kjønn-design. Parallelle linjer i interaksjons-plot betyr
            ingen interaksjon — krysser de, avhenger effekten av dose av kjønn.
          </p>
          <Suspense fallback={<VisualizerSkeleton />}>
            <TwoWayAnovaViz />
          </Suspense>
        </section>

        <section className="mb-10">
          <h3 className="text-lg font-semibold mb-2">
            13. Antagelser — normalitet, lik varians, uavhengighet
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Q-Q plot per gruppe, residual vs fitted, Levene's test, og
            sekvensplot for uavhengighet. Hver scenario foreslår alternativ
            test hvis antagelsen brytes.
          </p>
          <Suspense fallback={<VisualizerSkeleton />}>
            <AnovaAssumptionsCheck />
          </Suspense>
        </section>

        <section className="mb-10">
          <h3 className="text-lg font-semibold mb-2">
            14. Scenario-quiz: velg riktig test
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            8 use-cases (medisinsk dose, A/B/C-reklame, lager-temperatur,
            inntekt, repeated-measures osv.) — velg test og post-hoc.
          </p>
          <Suspense fallback={<VisualizerSkeleton />}>
            <AnovaScenarioQuiz />
          </Suspense>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "tek1-proporsjoner" }}
                className="text-brand hover:underline"
              >
                Inferens for proporsjoner
              </Link>
              {" "}— én og to proporsjoner, Wilson- og Agresti-Coull-CI.
            </li>
            <li>
              <Link to="/python" className="text-brand hover:underline">/python</Link>
              {" "}— kjør <code className="text-xs">f_oneway</code> + Tukey HSD via Pyodide.
            </li>
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              {" "}under ANOVA — SS-dekomponering, df-regning, post-hoc-valg.
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
        <RelatedVisualizers slug="anova" />
      </div>
    </StackPageShell>
  );
}
