import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  GitBranch,
  TrendingUp,
  Layers,
  Activity,
  Workflow,
  BarChart3,
  Scale,
  FileText,
  PlayCircle,
  Database,
  Wrench,
  TreePine,
  Scaling,
  Gauge,
  Code2,
  Lightbulb,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { Mermaid } from "@/components/Mermaid";

const ML_PIPELINE_CHART = `graph LR
  A[Radata] --> B[EDA]
  B --> C[Preprocessing]
  C --> D[Train/Test split]
  D --> E[Fit]
  E --> F[Predict]
  F --> G[Evaluate]
  E -.tuning.-> H[Hyperparam-sok]
  H --> E
  classDef tune fill:#fef3c7,stroke:#f59e0b,color:#92400e;
  class H tune;`;

type Practice = {
  href: string;
  Icon: typeof Brain;
  tittel: string;
  blurb: string;
};

const PRACTICE: Practice[] = [
  {
    href: "/drag",
    Icon: GitBranch,
    tittel: "Drag-oppgaver",
    blurb:
      "Filter på «ML & AI» — train/test-split, confusion matrix, k-fold, regularisering, ROC-AUC.",
  },
  {
    href: "/python",
    Icon: Code2,
    tittel: "Python-øvelser",
    blurb:
      "sklearn-modeller direkte i browseren via Pyodide: kNN, decision trees, pipeline, GridSearchCV, ROC.",
  },
  {
    href: "/cards",
    Icon: Lightbulb,
    tittel: "Flashcards",
    blurb:
      "Drillbare kort over ML-konsepter, evaluering, bias-varians, regularisering og pipeline-mønstre.",
  },
];

type Course = {
  slug: string;
  title: string;
  shortDescription: string;
  Icon: typeof Brain;
  status: "ready" | "coming-soon";
};

const COURSES: Course[] = [
  {
    slug: "ml-grunnlag",
    title: "ML-grunnlag — felles for hele kurset",
    shortDescription:
      "Data, features, train/val/test, overfitting vs underfitting, bias-variance, evaluering. Rammeverket alle de andre temaene bruker.",
    Icon: GitBranch,
    status: "ready",
  },
  {
    slug: "supervised-learning",
    title: "Supervised learning",
    shortDescription:
      "Regresjon (lineær, logistisk), klassifikasjon (kNN, decision tree, SVM), regulering, hyperparametere.",
    Icon: TrendingUp,
    status: "ready",
  },
  {
    slug: "unsupervised-learning",
    title: "Unsupervised learning",
    shortDescription:
      "Klustering (k-means, hierarchical), dimensjons-reduksjon (PCA), anomalydeteksjon.",
    Icon: Layers,
    status: "ready",
  },
  {
    slug: "nn-intro",
    title: "Innføring i nevrale nett",
    shortDescription:
      "Perceptron, aktiveringsfunksjoner, gradient descent, backpropagation — intuisjon.",
    Icon: Activity,
    status: "ready",
  },
  {
    slug: "dte2602-prosjektflyt",
    title: "ML-prosjekt fra A til Å",
    shortDescription:
      "CRISP-DM-aktig 7-stegs flyt: forstå problem → data → EDA → features → tren → evaluér → deploy. Titanic ende-til-ende.",
    Icon: Workflow,
    status: "ready",
  },
  {
    slug: "dte2602-evaluering-metoder",
    title: "Evaluering og eksperiment-design",
    shortDescription:
      "Train/val/test, k-fold, metrikker (precision/recall/F1/ROC-AUC, RMSE/R²), grid/random search, lekkasje.",
    Icon: BarChart3,
    status: "ready",
  },
  {
    slug: "dte2602-etikk-filosofi",
    title: "Etikk og filosofiske grunnlagsproblemer",
    shortDescription:
      "AI-historie, bias-taksonomi, GDPR i ML, XAI, Kinarommet, EU AI Act, diskusjons-caser.",
    Icon: Scale,
    status: "ready",
  },
  {
    slug: "dte2602-mappe-mal",
    title: "Mappe-oppgave-mal",
    shortDescription:
      "Rapport-struktur, header-eksempler, kode-vs-drøfting, sensor-feller (reproduserbarhet, random_state).",
    Icon: FileText,
    status: "ready",
  },
  {
    slug: "dte2602-eda-pandas",
    title: "EDA i pandas",
    shortDescription:
      "df.info(), describe(), histogrammer, korrelasjonsmatrise, pairplot. Slipp inn en CSV og få auto-generert visualisering.",
    Icon: Database,
    status: "ready",
  },
  {
    slug: "dte2602-preprocessing-pipeline",
    title: "Preprocessing & Pipeline",
    shortDescription:
      "StandardScaler, OneHotEncoder, ColumnTransformer, Pipeline. Datalekkasje-knapp som demonstrerer feilen visuelt.",
    Icon: Wrench,
    status: "ready",
  },
  {
    slug: "dte2602-trees-rf",
    title: "Beslutningstrær & Random Forest",
    shortDescription:
      "Gini, max_depth, bootstrap + random features, feature importance. Bygg tre steg-for-steg interaktivt.",
    Icon: TreePine,
    status: "ready",
  },
  {
    slug: "dte2602-bias-varians",
    title: "Bias-varians & regularisering",
    shortDescription:
      "E[(ŷ-y)²]=bias²+var+støy. Ridge (L2) vs Lasso (L1). Slider for polynom-grad, Lasso-path til null-koeffisienter.",
    Icon: Scaling,
    status: "ready",
  },
  {
    slug: "dte2602-evaluation-roc",
    title: "Forvirringsmatrise, F1 og ROC-AUC",
    shortDescription:
      "TP/FP/FN/TN, precision/recall/F1, ROC med flyttbar terskel. Forvirringsmatrise oppdaterer live.",
    Icon: Gauge,
    status: "ready",
  },
];

export function Dte2602Hub() {
  return (
    <StackPageShell title="DTE-2602 Introduksjon maskinlæring og AI" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2602 · 10 stp · Teknisk spesialisering
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Introduksjon maskinlæring og AI
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Mini-kurs som dekker UiT-pensum: hvordan ML faktisk fungerer fra rådata til
            evaluert modell. Hver del har teori, drag-oppgaver og kjørbar kode i
            nettleseren via Pyodide.
          </p>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">ML-pipeline — én side</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Alle ML-prosjekter følger samme grunnflyt. Lær stegene utenat — så blir
            algoritme-valg den ENE delen som varierer.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <Mermaid
              chart={ML_PIPELINE_CHART}
              ariaLabel="ML-pipeline flowchart: radata gjennom EDA, preprocessing, split, fit, predict, evaluate, med tuning-loop fra fit"
            />
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Steg</th>
                  <th className="text-left font-semibold px-4 py-2">Hva du gjør</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">1. Data</td><td className="px-4 py-3 text-muted-foreground">Samle inn, rens, håndter NaN/outliers</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">2. Features</td><td className="px-4 py-3 text-muted-foreground">Velg/skap kolonner som bærer signal. Skalér.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">3. Split</td><td className="px-4 py-3 text-muted-foreground">Train / val / test — train_test_split(stratify=y)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">4. Model</td><td className="px-4 py-3 text-muted-foreground">Velg algoritme. Tren på TRAIN-set.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">5. Tune</td><td className="px-4 py-3 text-muted-foreground">Velg hyperparametere på VAL-set (eller cross-val)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">6. Eval</td><td className="px-4 py-3 text-muted-foreground">Mål på TEST-set: accuracy/precision/recall/RMSE</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">7. Deploy</td><td className="px-4 py-3 text-muted-foreground">Lagre modell, integrer i app, overvåk drift</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Viktigste regel:</strong> rør ALDRI TEST-settet før helt på slutten.
            Bruker du det til hyperparameter-tuning, har du «lekket» informasjon og
            modellen din vil prestere dårligere i produksjon.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Mini-kurs</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {COURSES.map((c) => {
              const isReady = c.status === "ready";
              const Icon = c.Icon;
              if (!isReady) {
                return (
                  <div key={c.slug} className="rounded-xl border border-border bg-card/30 p-5 opacity-60">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground leading-tight">{c.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{c.shortDescription}</p>
                  </div>
                );
              }
              return (
                <Link
                  key={c.slug}
                  to="/stack/$slug"
                  params={{ slug: c.slug }}
                  className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-brand" />
                    <h3 className="font-semibold text-foreground leading-tight">{c.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.shortDescription}</p>
                  <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Åpne
                    <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Kjørbare prosjekter</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Mini-prosjekter i Pyodide (sklearn + matplotlib i nettleseren). Speilet etter
            mappevurderings-format: hvert trinn har starter-kode, hint, fasit og en
            sjekk-test.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              to="/prosjekt-ml/$slug"
              params={{ slug: "iris-klassifisering" }}
              className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <PlayCircle className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-foreground leading-tight">
                  Iris-klassifisering (8 trinn)
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Last data, EDA, train/test, kNN, logistisk regresjon, GridSearchCV,
                confusion matrix.
              </p>
              <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Åpne
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
            <Link
              to="/prosjekt-ml/$slug"
              params={{ slug: "klustering-blobs" }}
              className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <PlayCircle className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-foreground leading-tight">
                  Klustering med make_blobs (6 trinn)
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Generer 3 klustre, k-means, elbow-metoden, sammenligne med DBSCAN.
              </p>
              <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Åpne
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Porteføljespor (eksamensspeil)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            To 5-stegs løp som speiler mappevurderingen (innlevering 16.12.2026). Hvert
            steg har starter-kode, hint, fasit og en fasit-streng som sjekkes mot stdout.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              to="/portfolio-dte2602/$slug"
              params={{ slug: "dataset-analyse" }}
              className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <PlayCircle className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-foreground leading-tight">
                  Spor A · Dataset-analyse (5 steg)
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Last data → rens → visualiser → tolk → konkluder. Bygg en EDA-rapport
                på wine-datasettet steg-for-steg.
              </p>
              <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Åpne
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
            <Link
              to="/portfolio-dte2602/$slug"
              params={{ slug: "ml-pipeline" }}
              className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <PlayCircle className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-foreground leading-tight">
                  Spor B · ML-pipeline (5 steg)
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pipeline → split → tren → evaluer (F1 + confusion) → tune (GridSearchCV).
              </p>
              <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Åpne
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-1">Praktisk øvelse</h2>
          <p className="text-xs text-muted-foreground mb-5">
            Stack-leksjonene forklarer teorien. Her øver du selv.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {PRACTICE.map((r) => {
              const Icon = r.Icon;
              return (
                <Link
                  key={r.href}
                  to={r.href}
                  className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-brand" />
                    <h3 className="font-semibold text-foreground leading-tight">{r.tittel}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.blurb}</p>
                  <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Åpne
                    <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Hvor passer dette inn?</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">Drag-oppgaver:</strong> filter på «ML & AI» i{" "}
              <Link to="/drag" className="text-brand hover:underline">/drag</Link>.
            </li>
            <li>
              <strong className="text-foreground">Praktisk kode:</strong> kjør sklearn-modeller direkte i browser på{" "}
              <Link to="/python" className="text-brand hover:underline">/python</Link>.
            </li>
            <li>
              <strong className="text-foreground">DTE-2501 AI Methods:</strong> kommer i neste runde — søk, CSP, logikk, Bayes.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
