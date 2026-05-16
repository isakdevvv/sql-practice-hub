import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex, TexBlock } from "@/components/Tex";
import { PValueCalculator } from "./PValueCalculator";

const STEPS = [
  { title: "Hva er p-verdi?", anchor: "hva" },
  { title: "Ensidig vs. tosidig", anchor: "sider" },
  { title: "Kalkulator", anchor: "kalk" },
  { title: "Eksamen — quick-ref", anchor: "eksamen" },
];

export function Tek1PVerdiKalkulatorPage() {
  return (
    <StackPageShell title="p-verdi-kalkulator" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            TEK-1501 · Verktøy · Interaktiv
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            p-verdi-kalkulator
          </h1>
          <p className="mt-3 text-muted-foreground">
            Velg test-type (z, t, χ², F), skriv inn test-statistikken og df.
            Få ensidig og tosidig p-verdi, og se hvilken hale som faktisk
            blir «p-verdien» i visualiseringen.
          </p>
        </div>

        <CourseOutline courseId="tek1-p-verdi-kalkulator" steps={STEPS} />

        <section id="hva" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva er p-verdi?</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Hvis nullhypotesen H₀ er sann og du gjentar eksperimentet
              uendelig mange ganger, hvor stor andel av forsøkene vil gi en
              test-statistikk minst så ekstrem som det du faktisk observerte?
            </p>
            <TexBlock>{"p = P\\bigl(T \\text{ minst så ekstrem som } t_{\\text{obs}} \\,\\big|\\, H_0\\bigr)"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              <strong>Liten p:</strong> de observerte dataene er svært
              usannsynlige under H₀ ⇒ forkast H₀.{" "}
              <strong>Stor p:</strong> dataene er forenlige med H₀ ⇒ behold H₀.
            </p>
            <p className="text-xs text-muted-foreground">
              Beslutningsregel ved signifikansnivå α: forkast H₀ hvis{" "}
              <Tex>{"p < \\alpha"}</Tex>.
            </p>
          </div>
        </section>

        <section id="sider" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Ensidig vs. tosidig</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-2 text-sm">
            <p>
              <strong>Ensidig:</strong> H₁ peker i én retning, f.eks.{" "}
              <Tex>{"H_1: \\mu > \\mu_0"}</Tex>. Hele α-budsjettet legges i én hale.
            </p>
            <TexBlock>{"p_{\\text{ens}} = P(T > t_{\\text{obs}})"}</TexBlock>
            <p>
              <strong>Tosidig:</strong> H₁ åpner for begge retninger,{" "}
              <Tex>{"H_1: \\mu \\neq \\mu_0"}</Tex>. For symmetriske
              fordelinger:
            </p>
            <TexBlock>{"p_{\\text{tos}} = 2 \\cdot P(T > |t_{\\text{obs}}|)"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              χ² og F brukes nesten alltid som ensidige høyre-haletester (store
              verdier ⇒ avvik fra H₀). Det finnes ingen vanlig «tosidig χ²».
            </p>
          </div>
        </section>

        <section id="kalk" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Kalkulator</h2>
          <PValueCalculator />
        </section>

        <section id="eksamen" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Eksamen — quick-ref</h2>
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-5 text-sm space-y-2">
            <p>
              <strong>Standard kritiske p-verdier:</strong>{" "}
              <Tex>{"z = 1.96 \\Rightarrow p_{\\text{tos}} = 0.05"}</Tex>,{" "}
              <Tex>{"z = 2.576 \\Rightarrow p_{\\text{tos}} = 0.01"}</Tex>.
            </p>
            <p>
              <strong>Sjekk fortegnet på statistikken:</strong> negativt z med
              H₁: μ &gt; μ₀ gir p &gt; 0.5 (du peker mot feil hale).
            </p>
            <p>
              <strong>Forveksling alarm:</strong> p-verdi er IKKE P(H₀ sann | data).
              Det er P(data minst så ekstreme | H₀ sann). Frekventistisk vs.
              bayesiansk er to ulike verdener.
            </p>
            <p>
              <strong>Liten df ⇒ stor p:</strong> med få datapunkter krever
              t-fordelingen mye sterkere bevis enn z gjør. Sammenlign t(df=2)
              med z på samme statistikk — du ser umiddelbart hvorfor utvalget
              må være stort nok.
            </p>
          </div>
        </section>
      </div>
    </StackPageShell>
  );
}
