import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex, TexBlock } from "@/components/Tex";
import { SamplingDistributionSim } from "./SamplingDistributionSim";
import { ConfidenceIntervalVisualizer } from "./ConfidenceIntervalVisualizer";
import { TtestVisualizer } from "./TtestVisualizer";
import { PValueDistributionSim } from "./PValueDistributionSim";
import { InferenceMatchQuiz } from "./InferenceMatchQuiz";

const STEPS = [
  { title: "Hvorfor inferens?", anchor: "hvorfor" },
  { title: "Sampling-distribution — CLT", anchor: "sampling" },
  { title: "Konfidensintervall — coverage", anchor: "ci" },
  { title: "t-test — to grupper live", anchor: "ttest" },
  { title: "p-verdi — hva er den?", anchor: "pvalue" },
  { title: "Quiz — match test til scenario", anchor: "quiz" },
  { title: "Eksamen — quick-ref", anchor: "eksamen" },
];

export function Tek1InferensSamplingPage() {
  return (
    <StackPageShell
      title="Statistisk inferens — sampling-distribution"
      group="eksamen"
    >
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            TEK-1501 · Verktøy · Interaktiv lesjon
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Statistisk inferens — fra utvalg til konklusjon
          </h1>
          <p className="mt-3 text-muted-foreground">
            Vi har observert ett utvalg. Hva kan vi si om den underliggende
            populasjonen? Denne lesjonen bygger intuisjon for de fire
            byggesteinene i klassisk inferens — sampling-distribution,
            konfidensintervall, hypotesetest og p-verdi — gjennom fem
            simulatorer du kan skru på live.
          </p>
        </div>

        <CourseOutline courseId="tek1-inferens-sampling" steps={STEPS} />

        <section id="hvorfor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor inferens?</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Vi vil egentlig vite{" "}
              <strong>populasjons-parameterne</strong> — for eksempel den sanne
              gjennomsnittlige blodtrykksenkningen <Tex>{"\\mu"}</Tex> for alle
              pasienter, eller den sanne andelen <Tex>{"p"}</Tex> velgere som
              støtter et parti. Men vi måler bare et utvalg av størrelse{" "}
              <Tex>{"n"}</Tex>. Spørsmålet er:
            </p>
            <TexBlock>
              {"\\hat\\theta = f(X_1, X_2, \\ldots, X_n) \\approx \\theta \\,?"}
            </TexBlock>
            <p>
              Estimatoren <Tex>{"\\hat\\theta"}</Tex> er selv en{" "}
              <strong>tilfeldig variabel</strong> — den varierer hvis vi gjentar
              eksperimentet. Hele inferens-byggverket handler om å forstå hvor
              mye den varierer, og hva det betyr for konklusjonene vi trekker.
            </p>
          </div>
        </section>

        <section id="sampling" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            2. Sampling-distribution og CLT
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Tenk på <Tex>{"\\bar X"}</Tex> som en oppskrift som tar n
            observasjoner og spytter ut ett tall. Gjenta oppskriften 2 000
            ganger ⇒ fordelingen av disse 2 000 gjennomsnittene er{" "}
            <em>sampling-distribution</em>. Central Limit Theorem sier at uansett
            hvor rar populasjonen er, blir denne fordelingen tilnærmet normal
            når n vokser, sentrert om <Tex>{"\\mu"}</Tex> med spredning{" "}
            <Tex>{"\\sigma/\\sqrt n"}</Tex>.
          </p>
          <SamplingDistributionSim />
        </section>

        <section id="ci" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            3. Konfidensintervall — 100 forsøk på samme µ
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Et 95 % CI er en{" "}
            <strong>prosedyre</strong>: «fra hvert utvalg, beregn x̄ ± t·SE». Den
            har egenskapen at over uendelig mange gjentakelser inneholder
            intervallet den sanne µ i 95 % av forsøkene. Klikk «Trekk 100 nye» og
            se hvordan ca. 5 av 100 bommer.
          </p>
          <ConfidenceIntervalVisualizer />
        </section>

        <section id="ttest" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            4. t-test — to grupper, p-verdi i sanntid
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            To-utvalgs t-test sammenligner to gjennomsnitt. Skyv på{" "}
            <em>effekt</em>, <em>σ</em> og <em>n</em> — observer hvordan{" "}
            <Tex>{"t = (\\bar X_A - \\bar X_B)/SE_{\\text{diff}}"}</Tex> vandrer
            inn i den røde kritiske regionen, og p-verdien synker.
          </p>
          <TtestVisualizer />
        </section>

        <section id="pvalue" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            5. p-verdi-fordelingen — hva er en p-verdi egentlig?
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Klassisk resultat: <strong>under H₀ er p-verdien uniformt
            fordelt</strong> på [0, 1]. Det betyr at 5 % av eksperimentene gir{" "}
            p &lt; 0.05 selv når det ikke er noen effekt — det er Type I-feil. Under H₁
            skjeves fordelingen mot 0; andelen som havner under α er den
            statistiske styrken (power = 1 − β).
          </p>
          <PValueDistributionSim />
        </section>

        <section id="quiz" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            6. Quiz — match test til scenario
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Åtte realistiske scenarier (medisin, A/B-test, valg, røyking,
            trening, reaksjonstid, smerteskårer, pærelevetid). Velg riktig test
            og riktig tolking av p-verdien.
          </p>
          <InferenceMatchQuiz />
        </section>

        <section id="eksamen" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Eksamen — quick-ref</h2>
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-5 text-sm space-y-3">
            <div>
              <strong>CLT-betingelser:</strong> X̄ → N(µ, σ/√n) når n er stor.
              Tommelfingel: n ≥ 30 er nok om populasjonen ikke er ekstrem; ved
              kraftig skjevhet trenger du større n.
            </div>
            <div>
              <strong>SE-formler:</strong>{" "}
              <Tex>{"SE_{\\bar X} = \\sigma/\\sqrt n"}</Tex> (kjent σ),{" "}
              <Tex>{"= s/\\sqrt n"}</Tex> (ukjent σ ⇒ bruk t),{" "}
              <Tex>{"SE_{\\hat p} = \\sqrt{\\hat p(1-\\hat p)/n}"}</Tex>{" "}
              (andeler).
            </div>
            <div>
              <strong>Test-valg:</strong>
              <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[12px]">
                <li>1 snitt vs verdi → one-sample t-test</li>
                <li>2 snitt, ulike personer → Welch t-test</li>
                <li>2 målinger samme person → paret t-test</li>
                <li>≥ 3 snitt → ANOVA + post-hoc</li>
                <li>Andel(er) → z-test for proporsjon</li>
                <li>Kategorisk × kategorisk → χ²-test</li>
                <li>Skjev/ordinal data → Mann-Whitney / Wilcoxon</li>
              </ul>
            </div>
            <div>
              <strong>p-verdi er IKKE:</strong> P(H₀|data), 1 − P(H₁), eller
              effektstørrelse. Den er P(data minst så ekstreme | H₀ sann).
            </div>
            <div>
              <strong>Type I / Type II:</strong> α = P(forkaste H₀ | H₀ sann),
              β = P(behold H₀ | H₁ sann). Power = 1 − β vokser med større n og
              større reell effekt.
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Tilstøtende lesjoner</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "tek1-statistisk-analyse" }}
                className="text-brand hover:underline"
              >
                Modul 4 — Statistisk inferens og regresjon
              </Link>{" "}
              (CI-formler og hypotesetest-strukturen)
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "tek1-bootstrap" }}
                className="text-brand hover:underline"
              >
                Bootstrap-resampling
              </Link>{" "}
              (samme intuisjon uten normal-antakelse)
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "tek1-anova" }}
                className="text-brand hover:underline"
              >
                Ettveis ANOVA
              </Link>{" "}
              (når du har ≥ 3 grupper)
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "tek1-p-verdi-kalkulator" }}
                className="text-brand hover:underline"
              >
                p-verdi-kalkulator
              </Link>{" "}
              (z/t/χ²/F → p)
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
