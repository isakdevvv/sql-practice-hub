import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex, TexBlock } from "@/components/Tex";
import { DistributionPlotter } from "./DistributionPlotter";

const STEPS = [
  { title: "Bruksanvisning", anchor: "intro" },
  { title: "Plotter", anchor: "plot" },
  { title: "Kritiske verdier — tabell vs. plot", anchor: "krit" },
  { title: "Eksamen — quick-ref", anchor: "eksamen" },
];

export function Tek1DistribusjonsPlotterPage() {
  return (
    <StackPageShell title="Fordelings-plotter (interaktiv)" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            TEK-1501 · Verktøy · Interaktiv
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Fordelings-plotter — se hva parameterne gjør
          </h1>
          <p className="mt-3 text-muted-foreground">
            Skyv på μ, σ, λ, df, n og p. Plotteren tegner PDF/PMF og CDF side
            om side, og skygger forkastningsområdene ved α = 0.05 så du kobler
            fordelingen direkte til hypotesetest-tabellene.
          </p>
        </div>

        <CourseOutline courseId="tek1-distribusjons-plotter" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva ser du på?</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-2 text-sm">
            <p>
              <strong>Venstre:</strong> tetthet <Tex>{"f(x)"}</Tex> (kontinuerlig)
              eller punktssannsynlighet <Tex>{"P(X=k)"}</Tex> (diskret).
            </p>
            <p>
              <strong>Høyre:</strong> kumulativ fordeling{" "}
              <Tex>{"F(x) = P(X \\leq x)"}</Tex>. Den blå linjen krysser 0.95 ved
              den kritiske verdien for en ensidig høyre-test med α = 0.05.
            </p>
            <p>
              <strong>Røde haler:</strong> forkastningsregionen ved α = 0.05.
              For symmetriske fordelinger (N, t) er det 0.025 i hver hale; for
              χ², Poisson og binomisk er det 0.05 i høyre hale.
            </p>
          </div>
        </section>

        <section id="plot" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Plotter</h2>
          <DistributionPlotter />
        </section>

        <section id="krit" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Kritiske verdier — tabell vs. plot</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p className="text-xs text-muted-foreground">
              Standard kritiske verdier ved α = 0.05 (sammenlign med plotteren over):
            </p>
            <TexBlock>{"z_{0.025} \\approx 1.96, \\quad z_{0.05} \\approx 1.6449"}</TexBlock>
            <TexBlock>{"t_{0.025, df=10} \\approx 2.228, \\quad t_{0.025, df=30} \\approx 2.042"}</TexBlock>
            <TexBlock>{"\\chi^2_{0.05, df=5} \\approx 11.07, \\quad \\chi^2_{0.05, df=10} \\approx 18.31"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Sett plotteren til disse parameterne og se at den gule streken
              havner på samme x-verdi.
            </p>
          </div>
        </section>

        <section id="eksamen" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Eksamen — quick-ref</h2>
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-5 text-sm space-y-2">
            <p>
              <strong>Velg fordeling først, parametre etterpå.</strong> Når
              du gjenkjenner mønsteret (telling → Poisson, andeler → binomisk,
              kontinuerlig måling → normal/t, varianser → χ²/F), er resten bare
              å sette inn.
            </p>
            <p>
              <strong>Tosidig vs. ensidig:</strong> tosidig deler α likt mellom
              halene (α/2 hver), ensidig legger hele α i én hale. Symmetriske
              fordelinger gir <Tex>{"z_{\\alpha/2} > z_\\alpha"}</Tex>.
            </p>
            <p>
              <strong>Normalapproksimasjon:</strong> for binomisk gjelder
              tommelregelen <Tex>{"np \\geq 5, n(1-p) \\geq 5"}</Tex>; for
              Poisson når <Tex>{"\\lambda \\geq 10"}</Tex>. Skyv på sliderne og
              se hvordan formen nærmer seg klokkekurven.
            </p>
          </div>
        </section>
      </div>
    </StackPageShell>
  );
}
