import { useState } from "react";

/**
 * AssumptionsChecklist — 5 OLS-antakelser med klikkbar utfolding.
 *
 * Hver linje viser antakelsen, hvilket plot/test som avgjør om den holder,
 * og en kort "hvis brutt — gjør dette". Brukeren klikker for å folde ut.
 */

type Assumption = {
  id: string;
  title: string;
  oneLiner: string;
  diagnostic: string;
  detail: string;
  fixes: string[];
};

const ASSUMPTIONS: Assumption[] = [
  {
    id: "lin",
    title: "1. Linearitet",
    oneLiner: "Forventet y er en lineær funksjon av prediktorene.",
    diagnostic: "Residual vs ŷ — skal være tilfeldig sky uten kurvet mønster.",
    detail:
      "Hvis du ser U- eller ∩-form i residual-plottet, er sammenhengen ikke-lineær. OLS undertegner systematisk i endene og overskyter i midten (eller motsatt). Dette betyr at predikasjoner på ekstreme x blir bias-skjeve.",
    fixes: [
      "Legg til polynom-ledd (x², x³) og re-sjekk residualene.",
      "Bruk splines eller en ikke-lineær modell (tre, GAM).",
      "Transformer y eller x (log, sqrt).",
    ],
  },
  {
    id: "indep",
    title: "2. Uavhengige feil",
    oneLiner: "ε_i er uavhengige (ingen autokorrelasjon).",
    diagnostic:
      "Tidsserieplott av residualer + Durbin-Watson-test (DW ≈ 2 = uavhengig).",
    detail:
      "Bryt mest typisk for tidsserier: dagens feil avhenger av gårsdagens. Standardfeil blir undervurdert ⇒ falsk signifikans. For tverrsnittsdata er det vanligvis OK med mindre du har klynger.",
    fixes: [
      "Tidsserie: ARIMA, AR(p)-ledd, eller generalized least-squares.",
      "Klynger: cluster-robust standardfeil eller mixed-effects-modell.",
    ],
  },
  {
    id: "homo",
    title: "3. Homoskedastisitet",
    oneLiner: "Var(ε) er konstant — uavhengig av x.",
    diagnostic:
      "Residual vs ŷ — skal være jevn vertikal spredning, ikke vifte. Breusch-Pagan-test gir p-verdi.",
    detail:
      "Vifte-form i residual-plottet (smal til venstre, vid til høyre) er klassisk heteroskedastisitet. β̂ er fortsatt forventningsrett, men SE er feil ⇒ p-verdier og konfidensintervall stoler du ikke på.",
    fixes: [
      "Vektet least-squares (WLS) med vekter ∝ 1/σ_i².",
      "Robust HC-standardfeil (sandwich estimator).",
      "Transformer y (log gjør ofte at variansen flater ut).",
    ],
  },
  {
    id: "norm",
    title: "4. Normalfordelte residualer",
    oneLiner: "ε ~ N(0, σ²) — viktig for små n; ved n stor er CLT din venn.",
    diagnostic:
      "Q-Q-plott av standardiserte residualer mot N(0,1). Punktene skal ligge på diagonalen.",
    detail:
      "Avvik i halene betyr tunge haler (kurtosis) eller skjevhet. Punkt-estimat for β̂ er fortsatt OK, men t- og F-tester (og prediksjonsintervall) avhenger av normalitet — særlig hvis n er liten.",
    fixes: [
      "Transformer y (log, Box-Cox).",
      "Bruk robuste/percentile-bootstrap konfidensintervall.",
      "Bytt til en passende GLM (Poisson for tellinger, gamma for skewed).",
    ],
  },
  {
    id: "multi",
    title: "5. Ingen perfekt multikollinaritet",
    oneLiner: "Prediktorene må ikke være lineære kombinasjoner av hverandre.",
    diagnostic:
      "VIF for hver prediktor. Tommelfingerregel: VIF > 5 ⇒ moderat; > 10 ⇒ alvorlig.",
    detail:
      "Hvis x1 og x2 er nesten perfekt korrelerte, kan ikke OLS skille bidragene deres. Standardfeilen til β̂_1 og β̂_2 blir gigantisk, og du kan få begge ikke-signifikante samtidig som modellen har høy R².",
    fixes: [
      "Fjern en av de korrelerte prediktorene.",
      "Slå dem sammen til én komposittvariabel.",
      "Bruk ridge-regresjon (legger til λ‖β‖² straff) eller PCA.",
    ],
  },
];

export function AssumptionsChecklist() {
  const [open, setOpen] = useState<string | null>("lin");

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {ASSUMPTIONS.map((a, i) => {
        const isOpen = open === a.id;
        return (
          <div
            key={a.id}
            className={i > 0 ? "border-t border-border" : undefined}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : a.id)}
              className="w-full text-left p-4 hover:bg-accent/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    isOpen ? "bg-brand" : "bg-muted-foreground/40"
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{a.title}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {isOpen ? "fold inn" : "klikk for detalj"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {a.oneLiner}
                  </div>
                </div>
              </div>
            </button>

            {isOpen && (
              <div className="px-5 pb-5 pl-12 text-xs space-y-2 bg-background/40">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Diagnose
                  </div>
                  <div className="text-foreground">{a.diagnostic}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Detalj
                  </div>
                  <div className="text-muted-foreground">{a.detail}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Hvis brutt — gjør dette
                  </div>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-0.5">
                    {a.fixes.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
