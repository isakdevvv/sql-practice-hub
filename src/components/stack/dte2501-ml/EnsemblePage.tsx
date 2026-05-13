import { Link } from "@tanstack/react-router";
import { Lightbulb, GitMerge, AlertTriangle } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hvorfor ensemble?", anchor: "why" },
  { title: "Bias og variance — repetisjon", anchor: "bias-variance" },
  { title: "Bagging og bootstrap", anchor: "bagging" },
  { title: "Random Forest", anchor: "rf" },
  { title: "Boosting — sekvensiell læring", anchor: "boost" },
  { title: "AdaBoost", anchor: "adaboost" },
  { title: "Gradient Boosting (XGBoost-familien)", anchor: "gbm" },
  { title: "Bagging vs boosting — oppsummering", anchor: "compare" },
  { title: "Eksamen-typiske spørsmål", anchor: "exam" },
];

export function EnsemblePage() {
  return (
    <StackPageShell title="Ensemble — bagging og boosting" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · Ensemble methods
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Ensemble — kombinér mange svake modeller
          </h1>
          <p className="mt-3 text-muted-foreground">
            En enkelt modell har sjelden best resultat. Tre familier av
            ensemble-metoder regjerer Kaggle-konkurranser og industri:{" "}
            <strong>bagging</strong> (parallell, reduserer variance),{" "}
            <strong>boosting</strong> (sekvensiell, reduserer bias), og{" "}
            <strong>stacking</strong> (kombiner ulike modell-typer).
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Sentral idé:</span> hvis mange{" "}
              <em>uavhengige</em>, litt-bedre-enn-tilfeldige modeller stemmer,
              gir flertall et mye bedre svar enn hver enkelt. Det er bare
              statistikk.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2501-ensemble" steps={STEPS} />

        <section id="why" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor ensemble?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tenk 1000 personer som skal gjette antall kuler i et glass. Hver
            person er litt skjev (bias), men feilen er <em>tilfeldig</em>. Snittet
            blir overraskende presist (Galtons «vox populi»-eksperiment).
            Maskinlæring utnytter samme prinsipp.
          </p>
          <p className="text-sm text-muted-foreground">
            For at det skal funke må modellene være{" "}
            <strong>diverse</strong> — hvis alle gjør samme feil, blir snittet
            ikke bedre. Hele kunsten i ensemble er å skape diversitet.
          </p>
        </section>

        <section id="bias-variance" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Bias og variance — repetisjon</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`E[(ŷ − y)²]  =  Bias²    +     Variance      +    Støy
                  ↑              ↑                ↑
              feil-antakelse   ustabilitet       irreduserbar
              i modellen       mellom            (umulig å
                               treninger          fjerne)

Bagging   → reduserer Variance.  Tren mange høy-variance modeller
            (dype trær) på bootstrap-sampler. Snitt jevner ut.
Boosting  → reduserer Bias.      Tren mange høy-bias modeller
            (grunne trær) sekvensielt, hvor hver retter feilene
            fra forrige.`}</pre>
          </div>
        </section>

        <section id="bagging" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Bagging og bootstrap</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <strong>Bagging</strong> = <strong>B</strong>ootstrap{" "}
            <strong>Agg</strong>regat<strong>ing</strong>. Trekk N tilfeldige
            eksempler <em>med tilbakelegging</em> fra treningsdata, tren én
            modell, repeter. Til slutt: stem.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Algoritme:
   for b = 1 .. B:
       Sₐ = bootstrap-sample(treningssett)   # ~63% unike eksempler
       Modell_b.fit(Sₐ)
   Predikér: majoritet (klassifikasjon) eller snitt (regresjon)

Out-of-bag (OOB) error:
   Modell_b ble ikke trent på de ~37% restende — bruk dem som
   gratis valideringssett. Ingen separat CV nødvendig.

Hvorfor det virker:
   Variansen til snittet = σ² / B  (hvis modellene var uavhengige)
   I praksis er trærne korrelerte → litt mindre forbedring.`}</pre>
          </div>
        </section>

        <section id="rf" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Random Forest</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Random Forest = bagging av <em>beslutningstrær</em> + ekstra triks
            for diversitet: ved hver split, vurder bare et tilfeldig subset av
            features.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`for b = 1 .. B:
    Sₐ = bootstrap-sample(X, y)
    Tren tre med modifisert split-regel:
        for hver node:
            kandidat_features = random.sample(features, k=√d)
            velg beste split blant disse
Sluttprediksjon: majoritetsstemme

Default i sklearn: B=100 trær, k=√d features.
Lite tuning trengs — RF er «default arbeidshesten» i industri.`}</pre>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Hyperparameter</th>
                  <th className="text-left font-semibold px-4 py-2">Effekt når du øker</th>
                  <th className="text-left font-semibold px-4 py-2">Typisk verdi</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">n_estimators</td>
                  <td className="px-4 py-2 text-muted-foreground">Mer stabil — flate ut etter ~500</td>
                  <td className="px-4 py-2 text-muted-foreground">100–500</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">max_depth</td>
                  <td className="px-4 py-2 text-muted-foreground">Dypere trær → høyere variance per tre</td>
                  <td className="px-4 py-2 text-muted-foreground">None (fri) eller 8–20</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">min_samples_split</td>
                  <td className="px-4 py-2 text-muted-foreground">Større → enklere trær, mer bias</td>
                  <td className="px-4 py-2 text-muted-foreground">2 (default) til 20</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">max_features</td>
                  <td className="px-4 py-2 text-muted-foreground">Færre → mer diversitet, mindre korrelasjon mellom trær</td>
                  <td className="px-4 py-2 text-muted-foreground">√d (klass.), d/3 (regresjon)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">bootstrap</td>
                  <td className="px-4 py-2 text-muted-foreground">På: gir OOB-estimat. Av: hvert tre ser hele data</td>
                  <td className="px-4 py-2 text-muted-foreground">True (default)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="boost" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Boosting — sekvensiell læring</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Boosting er en helt annen idé: bygg modellen <em>steg for steg</em>,
            der hver nye modell fokuserer på det forrige bommet på.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Initialiser:
   ŷ₀ = konstant (snittet for regresjon, log-odds for klassifikasjon)

for m = 1 .. M:
    rₘ = beregn resterende feil ŷₘ₋₁ er fra y     (residual / pseudo-residual)
    hₘ = tren ny modell til å predikere rₘ
    ŷₘ = ŷₘ₋₁ + η · hₘ(x)                          (η = learning rate)

Slutt: ŷ = ŷ_M

Kontrast til bagging:
   • Sekvensiell (kan ikke parallelliseres på samme måte)
   • Bruker hele treningssettet i hver iterasjon
   • Reduserer bias (kompenserer for tidligere feil)`}</pre>
          </div>
        </section>

        <section id="adaboost" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. AdaBoost</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Adaptive Boosting (Freund &amp; Schapire, 1995): hver iterasjon
            gir <em>høyere vekt</em> til de eksemplene forrige modell tok feil av.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Initialiser:  wᵢ = 1/N for alle i.

for m = 1 .. M:
    1. Tren svak klassifikator hₘ på vektet datasett.
    2. Beregn feilraten:
           εₘ = Σ wᵢ · 𝟙(hₘ(xᵢ) ≠ yᵢ)   /   Σ wᵢ
    3. Modell-vekt:
           αₘ = (1/2) · ln((1 − εₘ) / εₘ)
    4. Oppdater eksempel-vekter:
           wᵢ ← wᵢ · exp(αₘ · 𝟙(hₘ(xᵢ) ≠ yᵢ))
           normaliser så Σ wᵢ = 1.

Sluttprediksjon:
   ŷ(x) = sign( Σ αₘ · hₘ(x) )

Visuell intuisjon:
   Hvert misklassifisert punkt blir «større» i neste runde.
   Treet i neste runde fokuserer på de tunge punktene.`}</pre>
          </div>
        </section>

        <section id="gbm" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Gradient Boosting (XGBoost-familien)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            I stedet for å oppdatere vekter, lar Gradient Boosting hver nye
            modell predikere{" "}
            <em>gradienten av tap-funksjonen</em> — altså «retningen man bør
            justere ŷ for å minke tapet».
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Generell oppskrift (regresjon med MSE):
   ŷ₀ = mean(y)
   for m = 1 .. M:
       rₘᵢ = −∂L/∂ŷ |_(ŷ=ŷₘ₋₁) = (yᵢ − ŷₘ₋₁)       # = residual for MSE
       Tren tre hₘ til å predikere rₘ.
       ŷₘ = ŷₘ₋₁ + η · hₘ(x)

Implementasjoner:
   • sklearn GradientBoostingClassifier  — original
   • XGBoost   — optimalisert C++, regularisering
   • LightGBM  — histogram-baserte splits, raskest
   • CatBoost  — håndterer kategoriske features

Hyperparametere du må kjenne:
   n_estimators (M):      antall iterasjoner
   learning_rate (η):     0.01–0.3, ofte 0.1
   max_depth:             2–8, ofte 3 (kalt «stumps»)
   subsample:             stochastic GB → 0.5–1.0`}</pre>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Variant</th>
                  <th className="text-left font-semibold px-4 py-2">Hva som gjøres annerledes</th>
                  <th className="text-left font-semibold px-4 py-2">Best på</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">AdaBoost</td>
                  <td className="px-4 py-2 text-muted-foreground">Oppdaterer eksempel-vekter, kombinerer med αₘ</td>
                  <td className="px-4 py-2 text-muted-foreground">Binær klassifikasjon, ren data</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Gradient Boosting</td>
                  <td className="px-4 py-2 text-muted-foreground">Predikerer residual / negativ gradient av loss</td>
                  <td className="px-4 py-2 text-muted-foreground">Regresjon, fleksibel loss</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">XGBoost</td>
                  <td className="px-4 py-2 text-muted-foreground">GB + 2.ordens-info, regularisering, parallell</td>
                  <td className="px-4 py-2 text-muted-foreground">Tabular Kaggle, structured data</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">LightGBM</td>
                  <td className="px-4 py-2 text-muted-foreground">Histogram-baserte splits, leaf-wise vekst</td>
                  <td className="px-4 py-2 text-muted-foreground">Store datasett, raskeste trening</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">CatBoost</td>
                  <td className="px-4 py-2 text-muted-foreground">Innebygd håndtering av kategoriske features</td>
                  <td className="px-4 py-2 text-muted-foreground">Mange kategoriske kolonner</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Når ensemble IKKE hjelper:</span>{" "}
              hvis basis-modellene er sterkt korrelerte (gjør samme feil), så
              hjelper det lite å snitte. Tegn: bagging gir bare 1–2 % bedre
              accuracy enn én enkelt baseline. Tiltak: øk diversiteten
              (max_features, ulike algoritmer i stacking) — eller bytt
              modell-type helt. Hvis basis-modellen allerede er state-of-the-art
              (XGBoost på godt tunet tabular), gir stacking sjelden mer enn ~1%.
            </div>
          </div>
        </section>

        <section id="compare" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Bagging vs boosting — oppsummering</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Aspekt</th>
                  <th className="text-left font-semibold px-4 py-2">Bagging (RF)</th>
                  <th className="text-left font-semibold px-4 py-2">Boosting (XGB)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Trening</td>
                  <td className="px-4 py-2 text-muted-foreground">Parallell</td>
                  <td className="px-4 py-2 text-muted-foreground">Sekvensiell</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Diversitet via</td>
                  <td className="px-4 py-2 text-muted-foreground">Bootstrap + feature-sampling</td>
                  <td className="px-4 py-2 text-muted-foreground">Vekt-/residual-fokus</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Reduserer</td>
                  <td className="px-4 py-2 text-muted-foreground">Variance</td>
                  <td className="px-4 py-2 text-muted-foreground">Bias</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Basis-modell</td>
                  <td className="px-4 py-2 text-muted-foreground">Dype trær</td>
                  <td className="px-4 py-2 text-muted-foreground">Grunne trær (stumps)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Risk for overfit</td>
                  <td className="px-4 py-2 text-muted-foreground">Lav</td>
                  <td className="px-4 py-2 text-muted-foreground">Høyere — must early-stop</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Typisk vinner på</td>
                  <td className="px-4 py-2 text-muted-foreground">Standard tabular</td>
                  <td className="px-4 py-2 text-muted-foreground">Kaggle, structured data</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="exam" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">9. Eksamen-typiske spørsmål</h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">«Forklar bagging i 3 setninger.»</strong>{" "}
              Tren mange modeller på bootstrap-sampler, snitt prediksjonene,
              reduser variance.
            </li>
            <li>
              <strong className="text-foreground">«Hva skiller Random Forest fra ren bagging?»</strong>{" "}
              Tilfeldig subset av features ved hver split → mer diversitet.
            </li>
            <li>
              <strong className="text-foreground">«Hvorfor er boosting følsom for støy?»</strong>{" "}
              Vektingen blåser opp misklassifiserte punkter — outliers blir
              «jaget» i hver runde.
            </li>
            <li>
              <strong className="text-foreground">«Kan boosting parallelliseres?»</strong>{" "}
              Iterasjonene må gå sekvensielt, men <em>innenfor</em> hvert tre
              kan splittene parallelliseres (slik XGBoost gjør).
            </li>
          </ul>
        </section>

        <div className="rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <GitMerge className="h-4 w-4 text-brand" />
            Neste steg
          </h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2501-knn" }} className="text-brand hover:underline">
                k-NN
              </Link>{" "}
              for å sammenligne lazy vs eager learning.
            </li>
            <li>
              Drag-øvelser med topic «Ensemble» og Python-øvelser med
              <code className="font-mono"> GradientBoostingClassifier</code>.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
