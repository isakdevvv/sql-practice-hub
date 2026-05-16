import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex, TexBlock } from "@/components/Tex";
import { RegressionPlayground } from "./RegressionPlayground";

const STEPS = [
  { title: "Modellen", anchor: "modell" },
  { title: "Least squares — utledning", anchor: "ols" },
  { title: "R², RSS, TSS", anchor: "r2" },
  { title: "Interaktiv lekeplass", anchor: "lek" },
  { title: "Eksamen — quick-ref", anchor: "eksamen" },
];

export function Dte2602LineaerRegresjonPage() {
  return (
    <StackPageShell title="Lineær regresjon — fra null" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2602 · Verktøy · Interaktiv
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Lineær regresjon — fra utledning til drag-og-slipp
          </h1>
          <p className="mt-3 text-muted-foreground">
            Vi utleder least-squares-formelen fra førsteprinsipp, og lar deg
            dra datapunkter for å se hvordan regresjonslinjen, R², RSS og
            residualene reagerer i sanntid.
          </p>
        </div>

        <CourseOutline courseId="dte2602-lineaer-regresjon" steps={STEPS} />

        <section id="modell" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Modellen</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-2 text-sm">
            <p>Enkel lineær regresjon antar at responsen y kan modelleres som en linje pluss støy:</p>
            <TexBlock>{"y_i = \\beta_0 + \\beta_1 x_i + \\varepsilon_i, \\quad \\varepsilon_i \\sim \\mathcal{N}(0, \\sigma^2)"}</TexBlock>
            <p>
              Modellen har to ukjente: <Tex>{"\\beta_0"}</Tex> (skjæring) og{" "}
              <Tex>{"\\beta_1"}</Tex> (stigning). Predikert verdi:
            </p>
            <TexBlock>{"\\hat{y}_i = \\hat{\\beta}_0 + \\hat{\\beta}_1 x_i"}</TexBlock>
          </div>
        </section>

        <section id="ols" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Least squares — utledning</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>Minimér summen av kvadrerte residualer (RSS, residual sum of squares):</p>
            <TexBlock>{"\\mathrm{RSS}(\\beta_0, \\beta_1) = \\sum_{i=1}^n (y_i - \\beta_0 - \\beta_1 x_i)^2"}</TexBlock>
            <p>Sett de partielle deriverte lik null:</p>
            <TexBlock>{"\\frac{\\partial \\mathrm{RSS}}{\\partial \\beta_0} = -2 \\sum (y_i - \\beta_0 - \\beta_1 x_i) = 0"}</TexBlock>
            <TexBlock>{"\\frac{\\partial \\mathrm{RSS}}{\\partial \\beta_1} = -2 \\sum x_i (y_i - \\beta_0 - \\beta_1 x_i) = 0"}</TexBlock>
            <p>Løs systemet og du får de berømte OLS-formlene:</p>
            <TexBlock>{"\\hat{\\beta}_1 = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sum (x_i - \\bar{x})^2} = \\frac{S_{xy}}{S_{xx}}"}</TexBlock>
            <TexBlock>{"\\hat{\\beta}_0 = \\bar{y} - \\hat{\\beta}_1 \\bar{x}"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Linjen går alltid gjennom tyngdepunktet <Tex>{"(\\bar{x}, \\bar{y})"}</Tex> — det er den gule sirkelen i plottet.
            </p>
          </div>
        </section>

        <section id="r2" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. R², RSS, TSS</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-2 text-sm">
            <p>Tre kvadratsummer:</p>
            <TexBlock>{"\\mathrm{TSS} = \\sum (y_i - \\bar{y})^2 \\quad \\text{(total variasjon)}"}</TexBlock>
            <TexBlock>{"\\mathrm{RSS} = \\sum (y_i - \\hat{y}_i)^2 \\quad \\text{(rest etter modell)}"}</TexBlock>
            <TexBlock>{"\\mathrm{ESS} = \\sum (\\hat{y}_i - \\bar{y})^2 \\quad \\text{(forklart variasjon)}"}</TexBlock>
            <TexBlock>{"\\mathrm{TSS} = \\mathrm{ESS} + \\mathrm{RSS}"}</TexBlock>
            <p>
              Forklaringsgrad:
            </p>
            <TexBlock>{"R^2 = 1 - \\frac{\\mathrm{RSS}}{\\mathrm{TSS}} = \\frac{\\mathrm{ESS}}{\\mathrm{TSS}}"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              R² ∈ [0, 1] for trening: 1 = perfekt fit, 0 = like bra som å bare gjette ȳ.
              På testdata kan R² bli negativ — det betyr at modellen er dårligere enn å gjette gjennomsnittet.
            </p>
          </div>
        </section>

        <section id="lek" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Interaktiv lekeplass</h2>
          <RegressionPlayground />
        </section>

        <section id="eksamen" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Eksamen — quick-ref</h2>
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-5 text-sm space-y-2">
            <p>
              <strong>Husk formlene utenat:</strong>{" "}
              <Tex>{"\\hat{\\beta}_1 = S_{xy}/S_{xx}"}</Tex>,{" "}
              <Tex>{"\\hat{\\beta}_0 = \\bar{y} - \\hat{\\beta}_1 \\bar{x}"}</Tex>.
            </p>
            <p>
              <strong>R² er ikke alt:</strong> en høy R² på trening kan
              skjule overtilpasning. Test alltid på et hold-out-sett.
            </p>
            <p>
              <strong>Residualplottet er gull:</strong> hvis du ser tydelig
              mønster (kurve, vifte, klynger), bryter modellforutsetningene
              (linearitet, konstant varians, uavhengige feil). Dra punktene
              over i en parabel og se RSS skyte i været.
            </p>
            <p>
              <strong>Uteliggere:</strong> ett punkt langt ute kan dreie hele
              linjen — OLS er svært følsom for outliere. Test ved å dra ett
              punkt opp til (8, 12) og se β₁ endre seg dramatisk.
            </p>
          </div>
        </section>
      </div>
    </StackPageShell>
  );
}
