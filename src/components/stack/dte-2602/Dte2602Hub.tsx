import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
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
  Sigma,
  Shuffle,
  Calendar,
  Sparkles,
  BookOpen,
  Eye,
  ScrollText,
  Boxes,
  LineChart,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { LearningPath } from "@/components/stack/LearningPath";
import { MlPipelineFlow } from "./MlPipelineFlow";
import { Dte2602ModulOversikt } from "./Dte2602ModulOversikt";
import { Mermaid } from "@/components/Mermaid";
import { ModulStatusBadge, ModulProgressBar } from "@/components/stack/HubShared";
import { EXAM_META } from "@/lib/subjects/catalog";
import { useModulProgress } from "@/lib/stack/moduleProgress";

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

type Lab = {
  slug: string;
  title: string;
  blurb: string;
  Icon: typeof Brain;
  taggar: string[];
};

const LABS: Lab[] = [
  {
    slug: "dte2602-eda-pandas",
    title: "EDA i pandas",
    blurb:
      "Slipp inn en CSV og få auto-generert beskrivelser, histogrammer, korrelasjonsmatrise og pairplot.",
    Icon: Database,
    taggar: ["EDA", "data"],
  },
  {
    slug: "dte2602-preprocessing-pipeline",
    title: "Preprocessing & Pipeline",
    blurb:
      "Scaler, OneHotEncoder, ColumnTransformer. Datalekkasje-knapp som demonstrerer feilen visuelt.",
    Icon: Wrench,
    taggar: ["pipeline", "lekkasje"],
  },
  {
    slug: "dte2602-lineaer-regresjon",
    title: "Lineær regresjon fra null",
    blurb:
      "Drag datapunkter, se OLS, R², RSS og residualer oppdateres live.",
    Icon: TrendingUp,
    taggar: ["regresjon"],
  },
  {
    slug: "dte2602-trees-rf",
    title: "Beslutningstrær & Random Forest",
    blurb:
      "Gini, max_depth, bootstrap + random features, feature importance. Bygg tre steg-for-steg.",
    Icon: TreePine,
    taggar: ["trær", "ensemble"],
  },
  {
    slug: "dte2602-bias-varians",
    title: "Bias-varians & regularisering",
    blurb:
      "Slider for polynom-grad og λ. Ridge vs Lasso path, soft-thresholding-effekten.",
    Icon: Scaling,
    taggar: ["regularisering", "bias-varians"],
  },
  {
    slug: "dte2602-evaluation-roc",
    title: "Forvirringsmatrise, F1 og ROC-AUC",
    blurb:
      "Flyttbar terskel — TP/FP/FN/TN, precision/recall, ROC oppdateres live.",
    Icon: Gauge,
    taggar: ["evaluering"],
  },
  {
    slug: "dte2602-roc-curve-plotter",
    title: "ROC-kurve interaktiv (dyp)",
    blurb:
      "Velg modell-kvalitet, skyv terskelen — se hvordan separasjon påvirker AUC og confusion matrix.",
    Icon: LineChart,
    taggar: ["evaluering", "ROC"],
  },
  {
    slug: "dte2602-logistisk-regresjon",
    title: "Logistisk regresjon dypt",
    blurb:
      "Sigmoid, log-odds, MLE, log-loss + GD. Live 2D-trening med decision boundary, odds-ratio, softmax, class-weights.",
    Icon: TrendingUp,
    taggar: ["klassifikasjon"],
  },
  {
    slug: "dte2602-lda-qda-nb",
    title: "LDA, QDA & Naive Bayes",
    blurb:
      "Generative klassifikatorer side-by-side. Decision boundaries på live data — Bayes-teorem in action.",
    Icon: Sigma,
    taggar: ["klassifikasjon", "Bayes"],
  },
  {
    slug: "dte2602-svm",
    title: "SVM — maximum margin",
    blurb:
      "Dragbare 2D-punkter viser hvordan grensa kun avhenger av nærmeste punkter. Lineær vs RBF-kernel. Drill mot logistisk regresjon.",
    Icon: Boxes,
    taggar: ["klassifikasjon", "kernel"],
  },
  {
    slug: "dte2602-cv-varianter",
    title: "Cross-validation-varianter",
    blurb:
      "LOOCV, k-fold, Stratified, GroupKFold, TimeSeriesSplit. Slider viser hvilke punkter som er train/test i hver iterasjon.",
    Icon: Shuffle,
    taggar: ["evaluering", "CV"],
  },
];

type ConceptCourse = {
  slug: string;
  title: string;
  shortDescription: string;
  Icon: typeof Brain;
};

const CONCEPT_COURSES: ConceptCourse[] = [
  {
    slug: "ml-grunnlag",
    title: "ML-grunnlag — felles for hele kurset",
    shortDescription:
      "Data, features, train/val/test, overfitting vs underfitting, bias-variance, evaluering.",
    Icon: GitBranch,
  },
  {
    slug: "supervised-learning",
    title: "Supervised learning",
    shortDescription:
      "Regresjon (lineær, logistisk), klassifikasjon (kNN, decision tree, SVM), regulering, hyperparametere.",
    Icon: TrendingUp,
  },
  {
    slug: "unsupervised-learning",
    title: "Unsupervised learning",
    shortDescription:
      "Klustering (k-means, hierarchical), dimensjons-reduksjon (PCA), anomalydeteksjon.",
    Icon: Layers,
  },
  {
    slug: "nn-intro",
    title: "Innføring i nevrale nett",
    shortDescription:
      "Perceptron, aktiveringsfunksjoner, gradient descent, backpropagation — intuisjon.",
    Icon: Activity,
  },
  {
    slug: "dte2602-prosjektflyt",
    title: "ML-prosjekt fra A til Å",
    shortDescription:
      "CRISP-DM-aktig 7-stegs flyt: forstå problem → data → EDA → features → tren → evaluér → deploy.",
    Icon: Workflow,
  },
  {
    slug: "dte2602-evaluering-metoder",
    title: "Evaluering og eksperiment-design",
    shortDescription:
      "Train/val/test, k-fold, metrikker (precision/recall/F1/ROC-AUC, RMSE/R²), grid/random search, lekkasje.",
    Icon: BarChart3,
  },
  {
    slug: "dte2602-etikk-filosofi",
    title: "Etikk og filosofi",
    shortDescription:
      "AI-historie, bias-taksonomi, GDPR i ML, XAI, EU AI Act, diskusjons-caser.",
    Icon: Scale,
  },
  {
    slug: "dte2602-mappe-mal",
    title: "Mappe-oppgave-mal",
    shortDescription:
      "Rapport-struktur, header-eksempler, kode-vs-drøfting, sensor-feller.",
    Icon: FileText,
  },
];

type ExamTopic = {
  topic: string;
  Icon: typeof Brain;
  slugs: { slug: string; label: string }[];
};

const EXAM_TOPICS: ExamTopic[] = [
  {
    topic: "ML-grunnlag",
    Icon: GitBranch,
    slugs: [
      { slug: "ml-grunnlag", label: "Konsept" },
      { slug: "dte2602-prosjektflyt", label: "Workflow" },
    ],
  },
  {
    topic: "Data & EDA",
    Icon: Database,
    slugs: [
      { slug: "dte2602-eda-pandas", label: "Pandas-EDA" },
      { slug: "dte2602-preprocessing-pipeline", label: "Pipeline" },
    ],
  },
  {
    topic: "Regresjon",
    Icon: TrendingUp,
    slugs: [
      { slug: "dte2602-lineaer-regresjon", label: "Lineær" },
      { slug: "dte2602-logistisk-regresjon", label: "Logistisk" },
      { slug: "dte2602-bias-varians", label: "Bias-varians" },
    ],
  },
  {
    topic: "Klassifikasjon",
    Icon: Boxes,
    slugs: [
      { slug: "supervised-learning", label: "Oversikt" },
      { slug: "dte2602-svm", label: "SVM" },
      { slug: "dte2602-lda-qda-nb", label: "LDA/QDA/NB" },
      { slug: "dte2602-trees-rf", label: "Trær & RF" },
    ],
  },
  {
    topic: "Unsupervised",
    Icon: Layers,
    slugs: [{ slug: "unsupervised-learning", label: "k-means, PCA" }],
  },
  {
    topic: "Evaluering",
    Icon: Gauge,
    slugs: [
      { slug: "dte2602-evaluering-metoder", label: "Konsept" },
      { slug: "dte2602-evaluation-roc", label: "ROC-AUC" },
      { slug: "dte2602-roc-curve-plotter", label: "ROC-plotter" },
      { slug: "dte2602-cv-varianter", label: "CV-varianter" },
    ],
  },
  {
    topic: "Nevrale nett (intro)",
    Icon: Activity,
    slugs: [{ slug: "nn-intro", label: "Perceptron + GD" }],
  },
  {
    topic: "Mappe & etikk",
    Icon: FileText,
    slugs: [
      { slug: "dte2602-mappe-mal", label: "Mappe-mal" },
      { slug: "dte2602-etikk-filosofi", label: "Etikk" },
    ],
  },
];

const MODE_ANCHORS: { id: string; label: string; Icon: typeof Brain }[] = [
  { id: "les", label: "Les", Icon: BookOpen },
  { id: "visualiser", label: "Visualiser", Icon: Eye },
  { id: "ov", label: "Øv", Icon: Wrench },
  { id: "eksamen", label: "Eksamen", Icon: ScrollText },
  { id: "tutor", label: "AI-tutor", Icon: Brain },
];

export function Dte2602Hub() {
  const meta = EXAM_META["dte-2602"];

  const allConceptSlugs = useMemo(() => CONCEPT_COURSES.map((c) => c.slug), []);
  const { seen, total } = useModulProgress(allConceptSlugs);
  const nextSlug = useNextUnseenSlug(allConceptSlugs);
  const nextCourse = useMemo(
    () => CONCEPT_COURSES.find((c) => c.slug === nextSlug) ?? CONCEPT_COURSES[0],
    [nextSlug],
  );
  const allDone = total > 0 && seen === total;

  return (
    <StackPageShell title="DTE-2602 Introduksjon maskinlæring og AI" group="eksamen">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Hero */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 text-brand border border-brand/30 px-2.5 py-1 font-semibold">
              DTE-2602
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted text-muted-foreground border border-border px-2.5 py-1">
              {meta?.stp ?? 10} stp
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2.5 py-1">
              <Calendar className="h-3 w-3" />
              Eksamen {meta?.eksamen ?? "09.12.2026 (3t hjemme) + mappe 16.12"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted text-muted-foreground border border-border px-2.5 py-1">
              sklearn i nettleseren
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Introduksjon maskinlæring og AI
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Hvordan ML faktisk fungerer fra rådata til evaluert modell. Hver del har
            teori + interaktiv lab. Eksamen er hjemmeeksamen + mappe — du må
            kunne argumentere for valgene dine.
          </p>
        </div>

        {/* Modus-rad */}
        <nav
          aria-label="Velg modus"
          className="mb-6 sticky top-14 z-20 -mx-4 px-4 py-2 bg-background/85 backdrop-blur border-b border-border"
        >
          <div className="flex flex-wrap gap-1.5 text-xs">
            {MODE_ANCHORS.map((m) => {
              const Icon = m.Icon;
              return (
                <a
                  key={m.id}
                  href={`#${m.id}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card hover:border-brand/50 hover:bg-brand/5 px-2.5 py-1.5 text-foreground transition-colors"
                >
                  <Icon className="h-3.5 w-3.5 text-brand" />
                  {m.label}
                </a>
              );
            })}
          </div>
        </nav>

        {/* Anbefalt neste + framdrift */}
        <div className="mb-10 grid sm:grid-cols-[2fr_1fr] gap-3">
          <Link
            to="/stack/$slug"
            params={{ slug: nextCourse.slug }}
            className="group rounded-xl border-2 border-brand/40 bg-gradient-to-br from-brand/10 to-success/5 hover:border-brand transition-colors p-5 block"
          >
            <div className="flex items-center gap-2 mb-1">
              <PlayCircle className="h-5 w-5 text-brand" />
              <div className="text-[10px] uppercase tracking-wider font-semibold text-brand">
                {allDone ? "Repeter" : seen === 0 ? "Start her" : "Anbefalt neste"}
              </div>
            </div>
            <h3 className="font-semibold text-foreground leading-tight text-lg mt-1">
              {nextCourse.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-snug mt-1">
              {nextCourse.shortDescription}
            </p>
            <div className="mt-3 flex items-center text-xs font-medium text-brand">
              {seen === 0 ? "Start" : "Fortsett"}
              <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
              Din framdrift
            </div>
            <div className="text-2xl font-semibold tabular-nums">
              {seen}{" "}
              <span className="text-muted-foreground text-base font-normal">
                / {total}
              </span>
            </div>
            <ModulProgressBar trinnSlugs={allConceptSlugs} />
            <div className="mt-3 text-[11px] text-muted-foreground">
              Konsept-leksjoner sett. {LABS.length} labs telles ikke her.
            </div>
          </div>
        </div>

        {/* Modul-for-modul: fase 1–7 med sjekkpunkt per fase */}
        <Dte2602ModulOversikt />

        {/* Læringssti */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-3">Læringssti — anbefalt rekkefølge</h2>
          <LearningPath
            fag="DTE-2602"
            forbinder={[
              "DTE-2501 (utvider med RL, GA og dyperere ML-algoritmer)",
              "DTE-2502 (Neural Networks — dyplæring)",
              "TEK-1501 (statistikk for hypotesetest av modeller)",
            ]}
            layers={[
              {
                navn: "Basis — fra rådata til modell",
                intro:
                  "Lær workflow'en før algoritmene. Hva du gjør FØR fit/predict avgjør om modellen faktisk lærer noe nyttig.",
                steps: [
                  { slug: "ml-grunnlag", title: "ML-grunnlag", blurb: "Hva ML er, supervised vs unsupervised, evaluering — mental modell." },
                  { slug: "dte2602-eda-pandas", title: "EDA med pandas (interaktiv)", blurb: "describe/info/korrelasjon — drop en CSV og se auto-rapport." },
                  { slug: "dte2602-preprocessing-pipeline", title: "Pipelines + datalekkasje", blurb: "Scaler, OneHotEncoder, ColumnTransformer." },
                ],
              },
              {
                navn: "Dypere — algoritmer og evaluering",
                intro:
                  "Når data er klart kan vi velge algoritme. Like viktig: hvilke metrics vi måler med og hvor modellen feiler.",
                steps: [
                  { slug: "supervised-learning", title: "Supervised — generelt", blurb: "Klassifisering vs regresjon, baseline-tankegang." },
                  { slug: "dte2602-trees-rf", title: "Trær og Random Forest", blurb: "Gini, max_depth, bootstrap + feature subsampling." },
                  { slug: "unsupervised-learning", title: "Unsupervised — generelt", blurb: "Clustering, dim.reduksjon — når labels mangler." },
                  { slug: "dte2602-evaluation-roc", title: "ROC + forvirringsmatrise", blurb: "Flyttbar terskel → precision/recall oppdateres live." },
                ],
              },
              {
                navn: "Eksamen — bevisst valg og refleksjon",
                intro:
                  "Mappevurderingen krever rapport + kode. Disse leksjonene gir deg språket for å forklare valg, trade-offs og bias.",
                steps: [
                  { slug: "dte2602-bias-varians", title: "Bias-varians + regularisering", blurb: "Polynom-grad slider med ekte train/test-MSE." },
                  { slug: "dte2602-prosjektflyt", title: "Prosjekt-workflow", blurb: "Stegene fra problem-formulering til deploy." },
                  { slug: "dte2602-etikk-filosofi", title: "Etikk og filosofi", blurb: "Bias i data, hvem som rammes, LLM/opphavsrett." },
                  { slug: "dte2602-mappe-mal", title: "Mappe-mal", blurb: "Hvordan strukturere de to mappe-oppgavene." },
                ],
              },
            ]}
          />
        </section>

        {/* === LES === */}
        <section id="les" className="mb-12 scroll-mt-28">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Les — konsept-leksjoner</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Rammeverket alle de andre temaene bruker. Les disse først, så gå til
            labs eller eksamen-temaer.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {CONCEPT_COURSES.map((c) => {
              const Icon = c.Icon;
              return (
                <Link
                  key={c.slug}
                  to="/stack/$slug"
                  params={{ slug: c.slug }}
                  className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-brand" />
                    <h3 className="font-semibold text-foreground leading-tight">
                      {c.title}
                    </h3>
                    <ModulStatusBadge trinnSlugs={[c.slug]} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {c.shortDescription}
                  </p>
                  <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Åpne
                    <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* === VISUALISER === */}
        <section id="visualiser" className="mb-12 scroll-mt-28">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Visualiser & labs</h2>
            <span className="rounded-full bg-success/10 text-success border border-success/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              {LABS.length} interaktive
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Slipp inn data, drag punkter, skyv terskler — bygg intuisjon for hver
            ML-teknikk før du leser formelen.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {LABS.map((lab) => {
              const Icon = lab.Icon;
              return (
                <Link
                  key={lab.slug}
                  to="/stack/$slug"
                  params={{ slug: lab.slug }}
                  className="group rounded-xl border border-success/30 bg-success/5 hover:border-success p-5 transition-colors block"
                >
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Icon className="h-4 w-4 text-success" />
                    <h3 className="font-semibold text-foreground leading-tight">
                      {lab.title}
                    </h3>
                    <ModulStatusBadge trinnSlugs={[lab.slug]} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {lab.blurb}
                  </p>
                  <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex flex-wrap gap-1">
                      {lab.taggar.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] rounded bg-muted text-muted-foreground px-1.5 py-0.5"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <span className="inline-flex items-center text-xs text-success font-medium">
                      Åpne lab
                      <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* === ØV === */}
        <section id="ov" className="mb-12 scroll-mt-28">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Øv — gjør, ikke bare les</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Python-øvelser kjører ekte sklearn i Pyodide. Drag og flashcards for
            konsept-repetisjon.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              to="/python"
              className="group rounded-xl border border-brand/40 bg-brand/5 hover:border-brand p-5 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <Code2 className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-foreground leading-tight">
                  Python-øvelser — sklearn i nettleseren
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                kNN, decision trees, pipeline, GridSearchCV, ROC. Pyodide kjører
                hele scikit-learn lokalt.
              </p>
              <div className="mt-3 flex items-center text-xs text-brand font-medium">
                Åpne
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
            <Link
              to="/drag"
              className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-foreground leading-tight">
                  Drag-oppgaver
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Filter på «ML &amp; AI» — train/test-split, confusion matrix,
                k-fold, regularisering, ROC-AUC.
              </p>
              <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Åpne
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
            <Link
              to="/cards"
              className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-foreground leading-tight">
                  Flashcards
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                ML-konsepter, evaluering, bias-varians, regularisering og
                pipeline-mønstre.
              </p>
              <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Åpne
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        {/* === EKSAMEN === */}
        <section id="eksamen" className="mb-12 scroll-mt-28">
          <div className="flex items-center gap-2 mb-2">
            <ScrollText className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Eksamen-temaer</h2>
            <span className="text-[11px] text-muted-foreground">
              {meta?.eksamen ?? "09.12.2026 + mappe 16.12"} · {meta?.stp ?? 10} stp
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Hjemmeeksamen + mappe — du må kunne argumentere for valg. Hver kategori
            har konsept-leksjon + interaktiv lab.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {EXAM_TOPICS.map((t) => {
              const Icon = t.Icon;
              return (
                <div
                  key={t.topic}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-brand" />
                    <h3 className="font-semibold text-foreground text-sm">
                      {t.topic}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {t.slugs.map((s) => (
                      <Link
                        key={s.slug}
                        to="/stack/$slug"
                        params={{ slug: s.slug }}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-background hover:border-brand/50 hover:bg-brand/5 px-2 py-1 text-[11px] text-foreground transition-colors"
                      >
                        {s.label}
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* === AI-TUTOR === */}
        <section id="tutor" className="mb-12 scroll-mt-28">
          <a
            href="/tutor"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl border border-brand/30 bg-gradient-to-br from-brand/10 to-violet-500/5 hover:border-brand p-5 transition-colors flex items-start gap-4"
          >
            <div className="shrink-0 rounded-lg bg-brand/15 p-2.5">
              <Sparkles className="h-5 w-5 text-brand" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold">Spør AI om DTE-2602</h2>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-success/15 text-success border border-success/30">
                  Sjekk forståelse
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-snug">
                Få forklart hvorfor man ALDRI rører TEST-settet før evaluering,
                eller hvordan k-fold CV gir bedre varians-estimat enn ett-shot-split.
                Tutoren ser hva du har gjort på faget.
              </p>
              <div className="mt-2 flex items-center text-xs font-medium text-brand">
                Åpne tutor
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </a>
        </section>

        {/* ML-pipeline — referansediagram */}
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
          <div className="overflow-x-auto rounded-lg border border-border">
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
          <div className="mt-6">
            <MlPipelineFlow />
          </div>
        </section>
      </div>
    </StackPageShell>
  );
}

function useNextUnseenSlug(slugs: string[]): string {
  const { seen, total } = useModulProgress(slugs);
  if (typeof window === "undefined" || seen === 0 || seen >= total) {
    return slugs[0];
  }
  try {
    const raw = window.localStorage.getItem("stack.visited.v1");
    if (!raw) return slugs[0];
    const visited = JSON.parse(raw) as Record<string, true>;
    const next = slugs.find((s) => !visited[s]);
    return next ?? slugs[0];
  } catch {
    return slugs[0];
  }
}
