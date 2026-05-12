import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hva sensor leter etter", anchor: "sensor" },
  { title: "Rapport-struktur", anchor: "struktur" },
  { title: "Eksempel-headere du kan kopiere", anchor: "headere" },
  { title: "Kode kontra drøfting", anchor: "kode-vs-droftning" },
  { title: "Vanlige sensor-feller", anchor: "feller" },
  { title: "Sjekkliste før innlevering", anchor: "sjekkliste" },
];

export function Dte2602MappeMalPage() {
  return (
    <StackPageShell title="DTE-2602 · Mappe-oppgave-mal" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2602 · Mappe-mal
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Mappe-oppgave: struktur og forventninger
          </h1>
          <p className="mt-3 text-muted-foreground">
            DTE-2602 har mappevurdering med to oppgaver: rapport + programmering.
            Sensor ser hundrevis av disse. Her er mønsteret som gjør at din skiller
            seg ut — eller faller gjennom.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Lett bom:</span> studenter leverer notebook
              med all output i, men en sensor som kjører koden på nytt får andre tall
              fordi <code>random_state</code> ikke er satt. <strong>Reproduserbarhet</strong>
              {" "}er det letteste å fikse, men også det enkleste å glemme.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2602-mappe-mal" steps={STEPS} />

        <section id="sensor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva sensor leter etter</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Sensor har en mental sjekkliste — den ligner alltid på dette:
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Sensor-sjekkliste (uoffisiell men universell):

  □ Er problemstillingen tydelig formulert?
  □ Er datasettets størrelse, kilde og begrensninger beskrevet?
  □ Er det EDA — er studenten kjent med dataene?
  □ Er train/test (eller k-fold) brukt riktig?
  □ Er evaluering med flere metrikker — ikke bare accuracy?
  □ Sammenlignes minst 2 algoritmer eller minst 2 hyperparameter-valg?
  □ Er hyperparametere dokumentert? (random_state, C, k, max_depth ...)
  □ Er koden faktisk kjørbar — kan jeg klone og kjøre?
  □ Er resultatene reproduserbare med samme seed?
  □ Er det en bevisst diskusjon av begrensninger og bias?
  □ Er etisk drøfting til stede (ikke bare et avsnitt på slutten)?
  □ Er referanser oppgitt — Géron, ISLR, sklearn-docs?`}</pre>
          </div>
        </section>

        <section id="struktur" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Rapport-struktur</h2>
          <p className="text-sm text-muted-foreground mb-4">
            8-12 sider er typisk. Følg denne strukturen — sensor finner det de
            leter etter raskere, og du får bedre karakter.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`1. SAMMENDRAG                       (½ side)
   - hva ble gjort, hva ble funnet, hvilken karakter prøver du å få ;)
   - skrives SIST

2. INNLEDNING                       (1 side)
   - hva er problemet?
   - hvorfor er det interessant / relevant?
   - hva er suksess-kriteriet?
   - oversikt over rapporten

3. DATA                             (1-2 sider)
   - kilde + lisens
   - størrelse: rader, features, klassebalanse
   - kjente begrensninger i datasettet
   - eventuell rensing (NaN, outliers, deduplisering)

4. UTFORSKNING (EDA)                (1-2 sider)
   - 3-5 nøkkel-figurer (distribusjoner, korrelasjon, pairplot)
   - HVA viser figuren, HVA betyr det for modelleringen

5. METODE                           (1-2 sider)
   - algoritmer prøvd og HVORFOR de er passende
   - preprocessing-pipeline
   - train/test/cv-strategi
   - hyperparameter-søk

6. RESULTATER                       (2-3 sider)
   - tabell: modell × metrikk
   - confusion matrix / regresjons-residual-plot
   - lærings-/valideringskurver
   - sammenligning + tolkning

7. DISKUSJON                        (1-2 sider)
   - hvor feiler modellen?
   - hva tror du årsaken er?
   - hva ville du gjort med mer tid/data?
   - etiske og samfunnsmessige aspekter

8. KONKLUSJON                       (½ side)
   - svar på problemstillingen i punkt 2

9. REFERANSER                       (½ side)
   - Géron, ISLR, sklearn-docs, fagartikler du leste`}</pre>
          </div>
        </section>

        <section id="headere" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Eksempel-headere du kan kopiere</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Konkrete header-formuleringer som signaliserer at du vet hva som
            forventes.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Klassifisering av irisblomster basert på morfometriske trekk
## En sammenligning av kNN, logistisk regresjon og random forest

Forfatter: Ola Nordmann
Emne: DTE-2602 · UiT
Dato: vår 2026

## Sammendrag
Vi trener tre maskinlæringsmodeller på Fisher sitt Iris-datasett
(150 eksempler, 4 features, 3 klasser) og evaluerer dem ved 5-fold
stratifisert kryss-validering. Random forest oppnådde beste
f1_macro = 0.97 ± 0.03; tilsvarende logistisk regresjon = 0.96 ± 0.02.
Begge slår en majoritets-baseline (f1_macro = 0.33). Vi diskuterer
modellens begrensninger og hvorfor datasettet er kjent skjevt
representert.

## 1 Innledning
### 1.1 Problemstilling
### 1.2 Motivasjon
### 1.3 Avgrensning
### 1.4 Rapportstruktur

## 2 Data
### 2.1 Kilde og lisens
### 2.2 Datasett-statistikk
### 2.3 Kjente begrensninger

## 3 Utforskende analyse
### 3.1 Klassebalanse
### 3.2 Feature-distribusjoner
### 3.3 Korrelasjon og separasjonsindikatorer

## 4 Metode
### 4.1 Forprosessering
### 4.2 Algoritmer
### 4.3 Eksperimentell oppsett (train/test, k-fold)
### 4.4 Hyperparameter-søk

## 5 Resultater
### 5.1 Sammenligning av modeller
### 5.2 Confusion matrix for beste modell
### 5.3 Læringskurve

## 6 Diskusjon
### 6.1 Hvor feiler modellen?
### 6.2 Begrensninger ved metoden
### 6.3 Etiske aspekter

## 7 Konklusjon

## Referanser
[1] Géron, A. (2022). Hands-On Machine Learning… 3. utg. O'Reilly.
[2] James, G. et al. (2021). An Introduction to Statistical Learning.
[3] Pedregosa, F. et al. (2011). Scikit-learn: Machine Learning in Python.`}</pre>
          </div>
        </section>

        <section id="kode-vs-droftning" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Kode kontra drøfting</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Vanlig misforståelse: studenter limer inn 5 sider kode i rapporten.
            Det er feil sjanger.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-success/30 bg-success/5 p-5">
              <strong className="text-success block mb-2">I rapporten:</strong>
              <ul className="space-y-1 text-sm text-foreground list-disc pl-5">
                <li>Korte kode-snippets (5-15 linjer) som ILLUSTRERER et poeng</li>
                <li>Resultat-tabeller</li>
                <li>Figurer med tolkning</li>
                <li>Drøfting og argumentasjon</li>
                <li>Sitater fra litteraturen</li>
              </ul>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
              <strong className="text-amber-600 dark:text-amber-400 block mb-2">I notebook / .py:</strong>
              <ul className="space-y-1 text-sm text-foreground list-disc pl-5">
                <li>All koden — kjørbar og kommentert</li>
                <li>Markdown-celler som forklarer hva som gjøres</li>
                <li>Reproduserbare resultater (random_state)</li>
                <li>Pipeline for hele flyten</li>
              </ul>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Forholdstall:</strong> en rapport på 10 sider bør ha kanskje 1-2
            sider med kode (snippets), og resten skal være tekst, tabeller og figurer.
            Notebook-en din kan være 500+ linjer kode — der bor den.
          </p>
        </section>

        <section id="feller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Vanlige sensor-feller</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Disse trekker karakter selv om modelleringen er god.
          </p>
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-sm font-semibold mb-1">Felle 1: «Det funker på min maskin»</div>
              <p className="text-xs text-muted-foreground">
                Sensor klarer ikke kjøre koden — pakker mangler, sti er hardkodet
                til <code>/Users/ola/data</code>. Inkluder <code>requirements.txt</code>
                og bruk relative stier. Test på en ren venv før innlevering.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-sm font-semibold mb-1">Felle 2: Ingen random_state</div>
              <p className="text-xs text-muted-foreground">
                Rapporten sier «accuracy = 0.94», men sensor kjører koden og får 0.91.
                Sett <code>random_state=42</code> overalt: <code>train_test_split</code>,
                modell-konstruktører, cv-objekter.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-sm font-semibold mb-1">Felle 3: Hyperparametere ikke dokumentert</div>
              <p className="text-xs text-muted-foreground">
                Tekst sier «vi tunet hyperparametere» — men hvilke verdier ble prøvd?
                Hvilke vant? Skriv det. <code>gs.best_params_</code> tilhører rapporten.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-sm font-semibold mb-1">Felle 4: «Modellen fikk 99 %»</div>
              <p className="text-xs text-muted-foreground">
                Hvis tallene er urealistisk gode — det er sannsynligvis data-lekkasje.
                Sensor vil spørre. Se etter <code>fit</code> på hele X før split, eller
                en feature som er en proxy for y.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-sm font-semibold mb-1">Felle 5: Bare accuracy</div>
              <p className="text-xs text-muted-foreground">
                På klassifikasjon: alltid precision/recall/f1 + confusion matrix.
                På regresjon: MAE og R², ikke bare RMSE.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-sm font-semibold mb-1">Felle 6: Manglende etisk drøfting</div>
              <p className="text-xs text-muted-foreground">
                UiT-pensum nevner eksplisitt filosofiske og etiske spørsmål. En rapport
                som ikke drøfter dette, etterlater poeng på bordet. Selv en ½ side om
                «hvis modellen ble brukt i produksjon, hva ville være bekymringene»
                hjelper.
              </p>
            </div>
          </div>
        </section>

        <section id="sjekkliste" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Sjekkliste før innlevering</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Gå gjennom denne dagen før du leverer. Ikke timen før.
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Tekniske krav:
  □ Notebook kjører ende-til-ende uten feil (Restart & Run All)
  □ requirements.txt eller environment.yml er med
  □ random_state=42 satt overalt
  □ Ingen hardkodede stier — bruk relative paths eller pathlib
  □ README.md forklarer "hvordan kjører jeg dette"

Innholdskrav:
  □ Problemstilling formulert i innledning
  □ Datasettet er beskrevet (kilde, størrelse, klassebalanse)
  □ Minst 3 EDA-figurer med tolkning
  □ Minst 2 algoritmer sammenlignet
  □ Hyperparametere dokumentert
  □ Train/test (evt. k-fold) tydelig forklart
  □ Confusion matrix eller residual-plot inkludert
  □ Etisk drøfting til stede
  □ Konklusjon svarer på problemstillingen

Formelle krav:
  □ Sidetall, kapittelnummerering konsistent
  □ Alle figurer/tabeller har bildetekst med nummer
  □ Referanser i konsistent stil (APA / Vancouver)
  □ Stavekontroll kjørt
  □ Navn og emne på forsiden`}</pre>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Relaterte sider</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2602-prosjektflyt" }} className="text-brand hover:underline">
                Prosjekt-arbeidsflyt
              </Link>
              {" "}— 7 stegs flyt for kode-delen.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2602-evaluering-metoder" }} className="text-brand hover:underline">
                Evaluering &amp; eksperiment-design
              </Link>
              {" "}— metrikker og hyperparameter-søk.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2602-etikk-filosofi" }} className="text-brand hover:underline">
                Etikk &amp; filosofi
              </Link>
              {" "}— hva du skal drøfte i diskusjonen.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
