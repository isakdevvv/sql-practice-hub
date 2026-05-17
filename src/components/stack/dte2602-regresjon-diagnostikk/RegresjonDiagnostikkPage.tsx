import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex, TexBlock } from "@/components/Tex";
import { AssumptionsChecklist } from "./AssumptionsChecklist";
import { CooksDistanceHeatmap } from "./CooksDistanceHeatmap";
import { DiagnosticPresets } from "./DiagnosticPresets";
import { DraggableScatterFit } from "./DraggableScatterFit";

const STEPS = [
  { title: "Hvorfor diagnostikk?", anchor: "hvorfor" },
  { title: "Dra og se", anchor: "drag" },
  { title: "5 uhellsbilder", anchor: "presets" },
  { title: "Cook's distance-jakt", anchor: "cooks" },
  { title: "OLS-antakelser sjekkliste", anchor: "antakelser" },
  { title: "Eksamen — quick-ref", anchor: "eksamen" },
];

export function RegresjonDiagnostikkPage() {
  return (
    <StackPageShell title="Regresjon-diagnostikk" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2602 · Verktøy · Interaktiv
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Regresjon-diagnostikk — etter modellen er fittet
          </h1>
          <p className="mt-3 text-muted-foreground">
            Du har kjørt OLS og fått en linje. Spørsmålet er: <em>kan du stole på den?</em> Lær å lese
            residualplott, Q-Q-plott og Cook's distance ved å dra punktene selv og kjenne
            uhellsbildene igjen før eksamen.
          </p>
        </div>

        <CourseOutline courseId="dte2602-regresjon-diagnostikk" steps={STEPS} />

        <section id="hvorfor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor diagnostikk?</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-2 text-sm">
            <p>
              OLS gir alltid en linje — selv når dataene er en banan, en trakt eller en
              outlier-katastrofe. Linjen ser like prikkfri ut i et tomt scatter. Diagnostikk
              er det som forteller deg at modellen ikke bør stole på.
            </p>
            <p>
              For at OLS-estimat skal være best lineær forventningsrett (BLUE) trenger vi
              Gauss-Markov-antakelsene: linearitet, uavhengige feil, konstant varians, og
              (for inferens) normalfordelte residualer. Bryt en av dem, og standardfeil,
              p-verdier eller selve β̂ kan bli villedende.
            </p>
            <TexBlock>{"\\hat{\\beta}_1 \\text{ er forventningsrett } \\Leftrightarrow \\mathbb{E}[\\varepsilon|x] = 0"}</TexBlock>
            <p>
              Verktøyene under er for å bygge intuisjon: hva ser et brudd på antakelsene
              ut som <em>i hvert plot?</em>
            </p>
          </div>
        </section>

        <section id="drag" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Dra og se</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm mb-4">
            <p>
              Dra et punkt opp eller ned og se i sanntid hvordan{" "}
              <Tex>{"R^2"}</Tex>, MSE, β̂ og alle tre diagnose-plot endres. Bytt tab for å se
              residual-, Q-Q- og leverage-plottet.
            </p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>
                <strong>Residual vs ŷ:</strong> mønster = feil i modellen.
              </li>
              <li>
                <strong>Q-Q:</strong> avvik fra diagonalen = brudd på normalitet.
              </li>
              <li>
                <strong>Leverage:</strong> langt til høyre = stor x-avvik; langt opp/ned = stor residual.
                Begge samtidig = influential.
              </li>
            </ul>
          </div>
          <DraggableScatterFit />
        </section>

        <section id="presets" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Fem uhellsbilder</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Klikk gjennom presetene og les hva som faktisk skjer. Etter en runde her skal
            du kjenne vifte-formen, U-mønsteret og leverage-bomben igjen umiddelbart.
          </p>
          <DiagnosticPresets />
        </section>

        <section id="cooks" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Cook's distance-jakt</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-2 text-sm mb-4">
            <p>
              Cook's D måler hvor mye <Tex>{"\\hat{\\beta}"}</Tex> ville endret seg hvis vi
              fjernet observasjonen. Formel:
            </p>
            <TexBlock>
              {"D_i = \\frac{e_i^2 \\, h_{ii}}{p \\, \\hat{\\sigma}^2 (1 - h_{ii})^2}"}
            </TexBlock>
            <p className="text-xs text-muted-foreground">
              <Tex>{"e_i"}</Tex> = residual, <Tex>{"h_{ii}"}</Tex> = leverage,{" "}
              <Tex>{"p"}</Tex> = antall β-parametre (2 her). Tommelfingerregel:{" "}
              <Tex>{"D_i > 4/n"}</Tex> = mistenkelig.
            </p>
          </div>
          <CooksDistanceHeatmap />
        </section>

        <section id="antakelser" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. OLS-antakelser — sjekkliste</h2>
          <p className="text-sm text-muted-foreground mb-4">
            For hver antakelse: hvilket plot/test avgjør? Hva gjør du hvis den brytes? Klikk for å folde ut.
          </p>
          <AssumptionsChecklist />
        </section>

        <section id="eksamen" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Eksamen — quick-ref</h2>
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-5 text-sm space-y-2">
            <p>
              <strong>Residual-plott:</strong> spør først om mønster (sky vs kurve vs vifte). Mønster ⇒ feil i modellen, ikke i dataene.
            </p>
            <p>
              <strong>Q-Q:</strong> sett standardiserte residualer (e_i / σ̂√(1 − h_ii)) mot N(0,1)-kvantiler. Avvik i halene = tunge haler.
            </p>
            <p>
              <strong>Leverage h_ii:</strong> over <Tex>{"2p/n"}</Tex> er høy. Influential = leverage ekstrem OG residual stor.
            </p>
            <p>
              <strong>Cook's D:</strong> over <Tex>{"4/n"}</Tex> = mistenkelig. Over 1 = veldig sannsynlig influential.
            </p>
            <p>
              <strong>VIF:</strong> over 5 (moderat) eller 10 (alvorlig) ⇒ multikollinaritet. Fiks ved å fjerne en prediktor eller bruke ridge.
            </p>
            <p>
              <strong>R² er ikke nok:</strong> en høy R² kan kombineres med U-mønster i residualene. Diagnose-plott er obligatorisk i alle rapporter.
            </p>
          </div>
        </section>
      </div>
    </StackPageShell>
  );
}
