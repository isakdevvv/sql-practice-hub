import { Link } from "@tanstack/react-router";
import { Lightbulb, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { Tex, TexBlock } from "@/components/Tex";
import { CvSplitVisualizer } from "./CvSplitVisualizer";

export function CvVarianterPage() {
  return (
    <StackPageShell
      title="DTE-2602 — Cross-validation-varianter"
      group="eksamen"
    >
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2602 · Resampling og modellvalg
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Cross-validation — alle variantene
          </h1>
          <p className="mt-3 text-muted-foreground">
            Cross-validation er kjernen i modellvalg. Pensum: ISLP kap. 5.1. Du
            lærer hvorfor enkelt validation-set er for støyete, hvordan LOOCV
            og k-fold balanserer bias mot varians, og hvilken variant du faktisk
            må bruke når data er korrelert eller har tidsstruktur.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hovedidé:</span> bruk{" "}
              <em>all</em> treningsdata til å estimere generaliseringsfeil. Roter
              hva som er test så snittet er stabilt.
            </div>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            1. Hvorfor CV i det hele tatt?
          </h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Vi vil estimere <strong>generaliseringsfeil</strong>{" "}
              <Tex>{"\\mathrm{Err}_{\\text{test}}"}</Tex> — modellens forventede
              feil på ukjent data. En enkelt train/test-split gir <em>ett</em>{" "}
              estimat som kan være veldig støyete, særlig på lite data.
            </p>
            <p>
              CV gjentar splittingen mange ganger og snitter — vi får et mer
              stabilt estimat, og bruker samtidig all data til både trening og
              validering. Prisen er kompute: <Tex>{"k"}</Tex> train-runder
              istedenfor 1.
            </p>
            <div className="font-semibold pt-2">CV-estimatet:</div>
            <TexBlock>{"\\mathrm{CV}_{(k)} = \\frac{1}{k} \\sum_{i=1}^k \\mathrm{MSE}_i"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              hvor <Tex>{"\\mathrm{MSE}_i"}</Tex> er feilen på fold{" "}
              <Tex>{"i"}</Tex> når modellen er trent på de andre{" "}
              <Tex>{"k-1"}</Tex> foldene.
            </p>
          </div>
        </section>

        <Section number="2" title="Validation-set approach">
          <p className="text-sm text-muted-foreground mb-3">
            Den enkleste varianten: del én gang, train på 70-80 %, valider på
            resten.
          </p>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`X_tr, X_val, y_tr, y_val = train_test_split(
    X_train, y_train,
    test_size=0.2,
    random_state=42,
)`}</pre>
          <ul className="list-disc pl-5 mt-3 text-sm text-muted-foreground space-y-1">
            <li>
              <strong>Fordeler:</strong> raskt, én train + én score per modell.
            </li>
            <li>
              <strong>Ulemper:</strong> estimatet har <em>høy varians</em> —
              kjør med ulik <code>random_state</code> og se score variere
              mellom kjøringer. På lite data er det ubrukelig.
            </li>
            <li>
              <strong>Ulempe #2:</strong> du bruker bare 80 % til trening — det
              modellen lærer er en pessimistisk versjon av hva den ville lært
              på 100 %.
            </li>
          </ul>
        </Section>

        <Section number="3" title="LOOCV — Leave-One-Out">
          <p className="text-sm text-muted-foreground mb-3">
            Spesial-tilfellet hvor <Tex>{"k = n"}</Tex>. Hver iterasjon: tren
            på <Tex>{"n - 1"}</Tex> samples, test på den ene utelatte.
          </p>
          <TexBlock>{"\\mathrm{CV}_{(n)} = \\frac{1}{n} \\sum_{i=1}^n (y_i - \\hat{y}_{(-i)})^2"}</TexBlock>
          <p className="text-sm text-muted-foreground mt-3">
            <Tex>{"\\hat{y}_{(-i)}"}</Tex> = prediksjonen for{" "}
            <Tex>{"x_i"}</Tex> fra en modell trent uten <Tex>{"x_i"}</Tex>.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <div className="text-xs uppercase font-semibold text-emerald-400 mb-2">
                Pro
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                <li>Praktisk talt null bias — hver modell ser <Tex>{"n-1"}</Tex> samples.</li>
                <li>Deterministisk (ingen random shuffle).</li>
              </ul>
            </div>
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
              <div className="text-xs uppercase font-semibold text-rose-400 mb-2">
                Con
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                <li>Tregt — <Tex>{"n"}</Tex> treninger.</li>
                <li>
                  Estimatene er <em>sterkt korrelerte</em> (hver modell ser
                  nesten samme data) ⇒ snittet har <em>høyere varians</em> enn
                  10-fold.
                </li>
              </ul>
            </div>
          </div>
        </Section>

        <Section number="4" title="k-fold CV — standardvalget">
          <p className="text-sm text-muted-foreground mb-3">
            Del data i <Tex>{"k"}</Tex> like store deler. For hver fold:
            tren på de andre <Tex>{"k-1"}</Tex>, valider på folden. Gjenta{" "}
            <Tex>{"k"}</Tex> ganger.
          </p>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`from sklearn.model_selection import KFold, cross_val_score

cv = KFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(model, X, y, cv=cv, scoring='neg_mean_squared_error')
print(f"CV MSE: {-scores.mean():.3f} ± {scores.std():.3f}")`}</pre>
          <p className="text-sm text-muted-foreground mt-3">
            Praksis: <Tex>{"k = 5"}</Tex> eller <Tex>{"k = 10"}</Tex>. Stor{" "}
            <Tex>{"k"}</Tex> nærmer seg LOOCV (lav bias, høy varians); liten{" "}
            <Tex>{"k"}</Tex> har lavere varians men høyere bias (mindre data
            per trening).
          </p>
        </Section>

        <Section number="5" title="Stratified k-fold — bevar klassebalanse">
          <p className="text-sm text-muted-foreground mb-3">
            Ved klassifikasjon — særlig <em>ubalansert</em> klassifikasjon —
            kan vanlig k-fold gi folder uten minoritetsklassen i det hele tatt.
            Stratified k-fold tvinger hver fold til å ha omtrent samme
            klassebalanse som hele datasettet.
          </p>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`from sklearn.model_selection import StratifiedKFold

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(clf, X, y, cv=cv, scoring='f1')`}</pre>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>I sklearn:</strong> <code>cross_val_score</code>
            {" "}velger automatisk Stratified for klassifikasjon når du gir{" "}
            <code>cv=5</code> (heltall). Men ved manuell{" "}
            <code>KFold(...)</code> får du <em>ikke</em> stratifisering —
            skriv det eksplisitt.
          </p>
        </Section>

        <Section number="6" title="GroupKFold — for korrelerte observasjoner">
          <p className="text-sm text-muted-foreground mb-3">
            Når du har grupper i data (samme pasient med 10 målinger, samme
            bruker med 100 events) er observasjonene <em>ikke</em> uavhengige.
            Hvis samme pasient havner i både train og val, lekker
            pasient-spesifikke mønstre — CV-scoren blir kunstig høy.
          </p>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`from sklearn.model_selection import GroupKFold

cv = GroupKFold(n_splits=5)
scores = cross_val_score(model, X, y, groups=patient_id, cv=cv)`}</pre>
          <p className="text-xs text-muted-foreground mt-3">
            <code>groups</code> garanterer at <em>én pasients alle målinger</em>{" "}
            havner enten i train eller test, aldri begge.
          </p>
        </Section>

        <Section number="7" title="TimeSeriesSplit — aldri se framtiden">
          <p className="text-sm text-muted-foreground mb-3">
            For tidsserier (aksjekurs, sensorlogger, mva-tall) gir vanlig CV
            fasit-lekkasje: hvis du tester på et punkt fra mai og trener på et
            punkt fra august, har modellen sett framtiden. Det er ingen
            klassifikator har i produksjon.
          </p>
          <TexBlock>{"\\text{Fold } i: \\quad \\text{train} = [t_0, t_i], \\quad \\text{test} = (t_i, t_{i+1}]"}</TexBlock>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`from sklearn.model_selection import TimeSeriesSplit

cv = TimeSeriesSplit(n_splits=5)
for tr, te in cv.split(X):
    # tr er alltid tidlige indekser; te er senere
    pass`}</pre>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Frist:</strong> ikke shuffle data. Ikke skaler på hele
            datasettet før split. Begge tilsvarer å lekke fra framtiden
            tilbake.
          </p>
        </Section>

        <Section number="8" title="Bias-varians-tradeoff i CV-estimatet">
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">k</th>
                  <th className="text-left font-semibold px-4 py-2">Bias</th>
                  <th className="text-left font-semibold px-4 py-2">Varians</th>
                  <th className="text-left font-semibold px-4 py-2">Regning</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">2-3</td>
                  <td className="px-4 py-3 text-muted-foreground">Høy (lite data per trening)</td>
                  <td className="px-4 py-3 text-muted-foreground">Lav (foldene overlapper lite)</td>
                  <td className="px-4 py-3 text-muted-foreground">Rask</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">5-10</td>
                  <td className="px-4 py-3 text-muted-foreground">Moderat — standardvalg</td>
                  <td className="px-4 py-3 text-muted-foreground">Moderat</td>
                  <td className="px-4 py-3 text-muted-foreground">Akseptabel</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">n (LOOCV)</td>
                  <td className="px-4 py-3 text-muted-foreground">Lav</td>
                  <td className="px-4 py-3 text-muted-foreground">Høy (sterk korrelasjon mellom modeller)</td>
                  <td className="px-4 py-3 text-muted-foreground">Treg</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            ISLP kap. 5.1.4: 5-fold eller 10-fold gir <em>bedre</em> estimat enn
            LOOCV på de fleste reelle datasett.
          </p>
        </Section>

        <Section number="9" title="Interaktivt: se hvilke punkter som er train vs test">
          <p className="text-sm text-muted-foreground mb-3">
            Bytt mellom variantene og dra slideren for å gå gjennom hver
            iterasjon. Se på den lille tabellen — for vanlig k-fold svinger
            «andel klasse 1» mellom foldene, men ikke for stratifisert.
          </p>
          <CvSplitVisualizer />
        </Section>

        <Section number="10" title="Python — sammenlign alle på samme datasett">
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import (
    KFold, StratifiedKFold, LeaveOneOut, cross_val_score
)

X, y = load_breast_cancer(return_X_y=True)
pipe = Pipeline([('sc', StandardScaler()), ('clf', LogisticRegression(max_iter=1000))])

for name, cv in [
    ("KFold(5)",            KFold(n_splits=5, shuffle=True, random_state=0)),
    ("StratifiedKFold(5)",  StratifiedKFold(n_splits=5, shuffle=True, random_state=0)),
    ("LeaveOneOut",         LeaveOneOut()),
]:
    s = cross_val_score(pipe, X, y, cv=cv, scoring='accuracy')
    print(f"{name:22s}: acc = {s.mean():.3f} ± {s.std():.3f}  (n_folds={len(s)})")`}</pre>
          <p className="text-xs text-muted-foreground mt-3">
            Forventet: tilsvarende snitt for alle tre, men LOOCV-standardavviket
            er en blanding av «hver fold har 1 sample» og høy korrelasjon —
            ikke direkte tolkbart som usikkerhet i snittet.
          </p>
        </Section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2602-bias-varians" }}
                className="text-brand hover:underline"
              >
                Bias-varians og regularisering
              </Link>{" "}
              — CV brukes typisk for å velge alpha i Ridge/Lasso.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2602-evaluering-metoder" }}
                className="text-brand hover:underline"
              >
                Evaluering og eksperiment-design
              </Link>{" "}
              — CV i kontekst av train/val/test og GridSearchCV.
            </li>
          </ul>
        </div>

        <div className="mt-6">
          <Link
            to="/stack/$slug"
            params={{ slug: "dte-2602" }}
            className="text-brand hover:underline inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tilbake til DTE-2602-hub
          </Link>
        </div>
      </div>
    </StackPageShell>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-3">
        {number}. {title}
      </h2>
      {children}
    </section>
  );
}
