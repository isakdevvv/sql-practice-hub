import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex, TexBlock } from "@/components/Tex";
import { RocExplorer } from "@/components/stack/dte2602-evaluation-roc/RocExplorer";

const STEPS = [
  { title: "ROC — hva og hvorfor", anchor: "hva" },
  { title: "Confusion matrix → TPR/FPR", anchor: "cm" },
  { title: "AUC — én tall, hele kurven", anchor: "auc" },
  { title: "Interaktiv utforsker", anchor: "lek" },
  { title: "Eksamen — quick-ref", anchor: "eksamen" },
];

export function Dte2602RocCurvePlotterPage() {
  return (
    <StackPageShell title="ROC-kurve interaktiv" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2602 · Verktøy · Interaktiv
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            ROC-kurve — terskel som skyveknapp
          </h1>
          <p className="mt-3 text-muted-foreground">
            En klassifiserer gir en sannsynlighet, ikke en hard 0/1. Hvor du
            setter terskelen bestemmer trade-off mellom TPR og FPR. ROC-kurven
            tegner hele trade-off-rommet; AUC oppsummerer den i ett tall.
          </p>
        </div>

        <CourseOutline courseId="dte2602-roc-curve-plotter" steps={STEPS} />

        <section id="hva" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. ROC — hva og hvorfor</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-2 text-sm">
            <p>
              ROC = Receiver Operating Characteristic. Aksene:
            </p>
            <TexBlock>{"\\text{TPR} = \\frac{\\text{TP}}{\\text{TP} + \\text{FN}} \\quad (y) \\qquad \\text{FPR} = \\frac{\\text{FP}}{\\text{FP} + \\text{TN}} \\quad (x)"}</TexBlock>
            <p>
              Hvert punkt på kurven svarer til én terskel. Diagonalen{" "}
              <Tex>{"\\text{TPR} = \\text{FPR}"}</Tex> er tilfeldig gjetting;
              øverst-til-venstre (0, 1) er perfekt klassifisering.
            </p>
            <p className="text-xs text-muted-foreground">
              ROC er <em>terskeluavhengig</em> ved at hele kurven vises samtidig
              — derfor er den bedre enn accuracy når klassene er ubalanserte.
            </p>
          </div>
        </section>

        <section id="cm" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Confusion matrix → TPR/FPR</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              For en gitt terskel t klassifiserer du <Tex>{"\\hat{y} = 1"}</Tex>{" "}
              hvis <Tex>{"\\text{score} \\geq t"}</Tex>. Det gir fire tall:
            </p>
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left px-2 py-1"></th>
                  <th className="px-2 py-1">Pred 1</th>
                  <th className="px-2 py-1">Pred 0</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-1">Fakt 1</td>
                  <td className="px-2 py-1 text-emerald-400">TP</td>
                  <td className="px-2 py-1 text-rose-400">FN</td>
                </tr>
                <tr>
                  <td className="px-2 py-1">Fakt 0</td>
                  <td className="px-2 py-1 text-rose-400">FP</td>
                  <td className="px-2 py-1 text-emerald-400">TN</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-muted-foreground">
              Når du senker terskelen, klassifiseres flere som positive ⇒ både TP og FP øker ⇒ vi beveger oss mot øverst-til-høyre.
            </p>
          </div>
        </section>

        <section id="auc" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. AUC — én tall, hele kurven</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-2 text-sm">
            <p>
              AUC (Area Under Curve) = arealet under ROC-kurven. Tolkning:
            </p>
            <TexBlock>{"\\text{AUC} = P\\bigl(\\text{score}(X^+) > \\text{score}(X^-)\\bigr)"}</TexBlock>
            <p className="text-xs">
              «Sannsynligheten for at en tilfeldig positiv får høyere score enn
              en tilfeldig negativ.» Skala:
            </p>
            <ul className="text-xs space-y-1 list-disc pl-5 text-muted-foreground">
              <li>AUC = 0.5 — tilfeldig (kurven ligger på diagonalen)</li>
              <li>AUC = 0.7–0.8 — anstendig</li>
              <li>AUC = 0.9+ — sterk diskriminering</li>
              <li>AUC = 1.0 — perfekt separasjon</li>
              <li>AUC &lt; 0.5 — modellen er omvendt; flipp prediksjonene</li>
            </ul>
          </div>
        </section>

        <section id="lek" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Interaktiv utforsker</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Velg modellkvalitet, skyv terskelen og se confusion matrix, TPR/FPR,
            F1 og AUC oppdateres. Histogrammet under viser score-fordelingene
            for klasse 0 (rød) og klasse 1 (blå) — overlappet er det modellen ikke kan løse.
          </p>
          <RocExplorer />
        </section>

        <section id="eksamen" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Eksamen — quick-ref</h2>
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-5 text-sm space-y-2">
            <p>
              <strong>ROC vs. PR:</strong> ved sterkt ubalanserte klasser kan
              ROC se kunstig god ut — Precision-Recall-kurven er mer ærlig.
            </p>
            <p>
              <strong>Velg terskel etter kostnad:</strong> ROC viser <em>alle</em> alternativer;
              du må velge én. Spørsmål: koster FN mer enn FP (medisinsk screening) eller motsatt (spam-filter)?
            </p>
            <p>
              <strong>AUC er terskeluavhengig:</strong> beveg terskelen i
              utforskeren — bare den gule prikken flytter seg langs kurven,
              kurven og AUC står stille.
            </p>
            <p>
              <strong>Tolkning:</strong> AUC = 0.5 betyr at modellen ikke
              skiller klassene. AUC nær 1.0 ⇒ histogrammene er helt separerte.
            </p>
          </div>
        </section>
      </div>
    </StackPageShell>
  );
}
