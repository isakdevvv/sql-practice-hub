import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ArrowRight,
  Search,
  Network,
  BookOpen,
  ClipboardList,
  Sigma,
  Boxes,
  TrendingUp,
  Layers,
  Dna,
  MessageSquare,
  Axis3D,
  Sparkles,
  GitMerge,
  Gamepad2,
  Infinity as InfinityIcon,
  Code2,
  GitBranch,
  Lightbulb,
  Swords,
  Dices,
  Calculator,
  Calendar,
  PlayCircle,
  Eye,
  Wrench,
  Brain,
  ScrollText,
  Map,
  Scale,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { LearningPath } from "@/components/stack/LearningPath";
import { ModulStatusBadge, ModulProgressBar } from "@/components/stack/HubShared";
import { EXAM_META } from "@/lib/subjects/catalog";
import { useModulProgress } from "@/lib/stack/moduleProgress";

type Lab = {
  slug: string;
  title: string;
  blurb: string;
  Icon: typeof Search;
  taggar: string[];
};

// Interaktive visualiseringer/labs for DTE-2501 — løfter også de tidligere
// foreldreløse ai-paradigmer-kart og ga-encoding-lab (eksisterte i content-
// registry, men var ikke synlige fra noen landingsside).
const LABS: Lab[] = [
  {
    slug: "dte2501-kmeans-visualizer",
    title: "k-Means live-plot",
    blurb:
      "Velg k, dataset (Iris/blobs/moons), steg ASSIGN/UPDATE eller animer. Inertia-graf per steg.",
    Icon: Layers,
    taggar: ["clustering", "unsupervised"],
  },
  {
    slug: "dte2501-pca-visualizer",
    title: "PCA interaktiv projeksjon",
    blurb:
      "Roter aksen selv og se PC1 maksimere varians. Iris/Wine i 2D, explained variance ratio.",
    Icon: Axis3D,
    taggar: ["dim-reduksjon"],
  },
  {
    slug: "dte2501-pso-visualizer",
    title: "PSO live-sverm",
    blurb:
      "Partikkelsverm på Rastrigin/Ackley. Juster w, c1, c2 — identifiser hvilken preset er balansert.",
    Icon: Sparkles,
    taggar: ["metaheuristikk", "swarm"],
  },
  {
    slug: "dte2501-ga-encoding-lab",
    title: "GA-encoding playground",
    blurb:
      "Velg encoding (bit-streng, permutasjon, real-valued), se hvordan crossover og mutasjon endrer seg.",
    Icon: Dna,
    taggar: ["GA", "encoding"],
  },
  {
    slug: "dte2501-mdp-bellman",
    title: "MDP-regnedrill — Bellman, VI og PI",
    blurb:
      "Regnedrill steg-for-steg på en liten 2-state MDP. Bellman-likning, Value Iteration, Policy Iteration.",
    Icon: Calculator,
    taggar: ["RL", "MDP"],
  },
  {
    slug: "dte2501-ai-paradigmer-kart",
    title: "AI-paradigmer — kart over hele faget",
    blurb:
      "Visualisert kart over hvordan symbolic AI, statistical ML, RL og metaheuristikk henger sammen.",
    Icon: Map,
    taggar: ["oversikt", "konsept"],
  },
  {
    slug: "ai-etikk",
    title: "AI-etikk — bias, fairness, scenario-sandbox",
    blurb:
      "Generer treningsdata, se bias lekke inn. Regn fairness-metrikker live. 6 case-studies (COMPAS, Amazon, Obermeyer, Gender Shades, kreditt, PredPol) + GDPR-checker + quiz.",
    Icon: Scale,
    taggar: ["etikk", "fairness", "GDPR"],
  },
];

type ConceptCourse = {
  slug: string;
  title: string;
  shortDescription: string;
  Icon: typeof Search;
};

// Moderne ML-spor — direkte eksamenspensum. Brukes til "Anbefalt neste".
const ML_COURSES: ConceptCourse[] = [
  {
    slug: "dte2501-knn",
    title: "k-Nearest Neighbors",
    shortDescription:
      "Lazy learning, distansemål, bias-variance, k-valg. Klassifikasjon og regresjon med k-NN.",
    Icon: Boxes,
  },
  {
    slug: "dte2501-supervised-regresjon",
    title: "Regresjon — lineær og polynom",
    shortDescription:
      "MSE, MAE, R², RMSE. Overfitting, regularisering (Ridge/Lasso), polynom-features.",
    Icon: TrendingUp,
  },
  {
    slug: "dte2501-kmeans-clustering",
    title: "k-Means clustering",
    shortDescription:
      "Init → assign → update → konvergens. Elbow, silhouette, og når k-Means feiler.",
    Icon: Layers,
  },
  {
    slug: "dte2501-gmm",
    title: "Gaussian Mixture Models",
    shortDescription:
      "Mikstur-modeller, EM-algoritmen (E-step + M-step), soft clustering vs k-Means.",
    Icon: Sparkles,
  },
  {
    slug: "dte2501-pca",
    title: "Principal Component Analysis",
    shortDescription:
      "Dimensjonsreduksjon, kovariansmatrise, egenvektorer, forklart varians, scree plot.",
    Icon: Axis3D,
  },
  {
    slug: "dte2501-ensemble",
    title: "Ensemble — bagging og boosting",
    shortDescription:
      "Bias-variance, bootstrap, random forest, AdaBoost og gradient boosting.",
    Icon: GitMerge,
  },
  {
    slug: "dte2501-nlp-intro",
    title: "Natural Language Processing",
    shortDescription:
      "Tokenisering, bag-of-words, TF-IDF, embeddings (Word2Vec/GloVe), tekst-klassifikasjon.",
    Icon: MessageSquare,
  },
  {
    slug: "dte2501-genetic-algorithms",
    title: "Genetic algorithms, swarm, ACO",
    shortDescription:
      "Populasjon, fitness, seleksjon, crossover, mutasjon. PSO og Ant Colony Optimization.",
    Icon: Dna,
  },
  {
    slug: "dte2501-reinforcement",
    title: "Reinforcement Learning og MDP",
    shortDescription:
      "MDP, Bellman, Value/Policy Iteration. Known vs unknown world, Q-learning intro.",
    Icon: Gamepad2,
  },
  {
    slug: "dte2501-dp",
    title: "Dynamic Programming og TSP",
    shortDescription:
      "Memoization vs tabulation, Fibonacci, knapsack, Held-Karp DP for TSP.",
    Icon: InfinityIcon,
  },
  {
    slug: "dte2501-minimax",
    title: "Minimax og alpha-beta",
    shortDescription:
      "Adversarial search i 2-spillerspill. Minimax-algoritmen, alpha-beta pruning.",
    Icon: Swords,
  },
  {
    slug: "dte2501-bandits",
    title: "Multi-armed bandits",
    shortDescription:
      "Bandit-problemet, ε-greedy, UCB1, Thompson sampling. Sutton & Barto kap. 2.",
    Icon: Dices,
  },
];

// Klassisk AI-spor — Russell & Norvig. Supplement, ikke direkte i 2026-eksamen.
const CLASSIC_COURSES: ConceptCourse[] = [
  {
    slug: "sok-algoritmer",
    title: "Søkealgoritmer i AI",
    shortDescription:
      "BFS, DFS, uniform-cost, iterative deepening, greedy og A*. Admissibility, optimality.",
    Icon: Search,
  },
  {
    slug: "csp",
    title: "Constraint Satisfaction Problems",
    shortDescription:
      "CSP, backtracking, AC-3, forward checking. MRV, degree heuristic, LCV.",
    Icon: Network,
  },
  {
    slug: "logisk-resonnering",
    title: "Logisk resonnering",
    shortDescription:
      "Propositional logic, sannhetstabeller, modus ponens, resolusjon, FOL-intro.",
    Icon: BookOpen,
  },
  {
    slug: "planlegging",
    title: "Planlegging",
    shortDescription:
      "STRIPS, preconditions/effects, forward (progression), backward (regression).",
    Icon: ClipboardList,
  },
  {
    slug: "bayes",
    title: "Beslutninger under usikkerhet — Bayes",
    shortDescription:
      "Bayes' teorem, naive Bayes-klassifikator, betinget uavhengighet.",
    Icon: Sigma,
  },
];

type ExamTopic = {
  topic: string;
  Icon: typeof Search;
  slugs: { slug: string; label: string }[];
};

const EXAM_TOPICS: ExamTopic[] = [
  {
    topic: "Supervised — k-NN & regresjon",
    Icon: TrendingUp,
    slugs: [
      { slug: "dte2501-knn", label: "k-NN" },
      { slug: "dte2501-supervised-regresjon", label: "Regresjon" },
    ],
  },
  {
    topic: "Unsupervised — clustering",
    Icon: Layers,
    slugs: [
      { slug: "dte2501-kmeans-clustering", label: "k-Means" },
      { slug: "dte2501-kmeans-visualizer", label: "Live-plot" },
      { slug: "dte2501-gmm", label: "GMM/EM" },
    ],
  },
  {
    topic: "Dim.-reduksjon",
    Icon: Axis3D,
    slugs: [
      { slug: "dte2501-pca", label: "PCA-teori" },
      { slug: "dte2501-pca-visualizer", label: "PCA-projeksjon" },
    ],
  },
  {
    topic: "Ensemble",
    Icon: GitMerge,
    slugs: [{ slug: "dte2501-ensemble", label: "Bagging & boosting" }],
  },
  {
    topic: "NLP",
    Icon: MessageSquare,
    slugs: [{ slug: "dte2501-nlp-intro", label: "TF-IDF & embeddings" }],
  },
  {
    topic: "Metaheuristikk",
    Icon: Dna,
    slugs: [
      { slug: "dte2501-genetic-algorithms", label: "GA/PSO/ACO" },
      { slug: "dte2501-ga-encoding-lab", label: "GA-encoding" },
      { slug: "dte2501-pso-visualizer", label: "PSO-sverm" },
    ],
  },
  {
    topic: "RL & MDP",
    Icon: Gamepad2,
    slugs: [
      { slug: "dte2501-reinforcement", label: "VI/PI/Q-learning" },
      { slug: "dte2501-mdp-bellman", label: "Bellman-drill" },
      { slug: "dte2501-bandits", label: "Bandits" },
    ],
  },
  {
    topic: "Adversarial & DP",
    Icon: Swords,
    slugs: [
      { slug: "dte2501-minimax", label: "Minimax" },
      { slug: "dte2501-dp", label: "DP/TSP" },
    ],
  },
  {
    topic: "Klassisk AI (supplement)",
    Icon: BookOpen,
    slugs: [
      { slug: "sok-algoritmer", label: "Søk" },
      { slug: "csp", label: "CSP" },
      { slug: "logisk-resonnering", label: "Logikk" },
      { slug: "planlegging", label: "Planlegging" },
      { slug: "bayes", label: "Bayes" },
    ],
  },
  {
    topic: "Etikk",
    Icon: Scale,
    slugs: [{ slug: "ai-etikk", label: "Bias, fairness, GDPR" }],
  },
];

const MODE_ANCHORS: { id: string; label: string; Icon: typeof Search }[] = [
  { id: "les", label: "Les", Icon: BookOpen },
  { id: "visualiser", label: "Visualiser", Icon: Eye },
  { id: "ov", label: "Øv", Icon: Wrench },
  { id: "eksamen", label: "Eksamen", Icon: ScrollText },
  { id: "tutor", label: "AI-tutor", Icon: Brain },
];

function CourseCard({ c }: { c: ConceptCourse }) {
  const Icon = c.Icon;
  return (
    <Link
      to="/stack/$slug"
      params={{ slug: c.slug }}
      className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-brand" />
        <h3 className="font-semibold text-foreground leading-tight">{c.title}</h3>
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
}

export function Dte2501Hub() {
  const meta = EXAM_META["dte-2501"];

  // "Anbefalt neste" og framdrift — bare moderne ML-spor (eksamenspensum).
  const mlSlugs = useMemo(() => ML_COURSES.map((c) => c.slug), []);
  const { seen, total } = useModulProgress(mlSlugs);
  const nextSlug = useNextUnseenSlug(mlSlugs);
  const nextCourse = useMemo(
    () => ML_COURSES.find((c) => c.slug === nextSlug) ?? ML_COURSES[0],
    [nextSlug],
  );
  const allDone = total > 0 && seen === total;

  return (
    <StackPageShell title="DTE-2501 AI Methods and Applications" group="eksamen">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Hero med eksamen-meta */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 text-brand border border-brand/30 px-2.5 py-1 font-semibold">
              DTE-2501
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted text-muted-foreground border border-border px-2.5 py-1">
              {meta?.stp ?? 10} stp
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2.5 py-1">
              <Calendar className="h-3 w-3" />
              {meta?.eksamen ?? "Hjemmeeksamen + mappe (3t × 2)"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted text-muted-foreground border border-border px-2.5 py-1">
              ML + klassisk AI
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">AI Methods and Applications</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Både{" "}
            <strong className="text-foreground">moderne ML</strong> (k-NN,
            k-Means, PCA, GMM, ensemble, RL, GA/PSO, NLP, DP) og{" "}
            <strong className="text-foreground">klassisk symbolic AI</strong>{" "}
            (søk, CSP, logikk, planlegging, Bayes). Eksamen er ML-forankret —
            klassisk er supplement. Velg modus under.
          </p>
        </div>

        {/* Sticky modus-rad */}
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
              Din framdrift (ML-spor)
            </div>
            <div className="text-2xl font-semibold tabular-nums">
              {seen}{" "}
              <span className="text-muted-foreground text-base font-normal">
                / {total}
              </span>
            </div>
            <ModulProgressBar trinnSlugs={mlSlugs} />
            <div className="mt-3 text-[11px] text-muted-foreground">
              Eksamenspensum. Klassisk AI og labs telles ikke her.
            </div>
          </div>
        </div>

        {/* Læringssti */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-3">Læringssti — anbefalt rekkefølge</h2>
          <LearningPath
            fag="DTE-2501"
            forbinder={[
              "DTE-2602 (deler grunnlaget for supervised/unsupervised)",
              "TEK-1501 (sannsynlighet, fordelinger og estimering)",
              "Lineær algebra (PCA, gradient)",
            ]}
            layers={[
              {
                navn: "Basis — supervised vs unsupervised",
                intro:
                  "Først skiller vi merkede fra umerkede data. Lær k-NN og k-Means som de enkleste algoritmene for hvert tilfelle.",
                steps: [
                  { slug: "dte2501-knn", title: "k-NN — nærmeste-nabo", blurb: "Euclidean avstand, valg av k, hvorfor skalering er kritisk." },
                  { slug: "dte2501-supervised-regresjon", title: "Lineær/polynom regresjon", blurb: "Ridge/Lasso — første møte med regularisering." },
                  { slug: "dte2501-kmeans-clustering", title: "k-Means clustering", blurb: "Lloyd's algoritme, k-means++, albue/silhouette." },
                ],
              },
              {
                navn: "Dypere — sannsynlighet og struktur",
                intro:
                  "Når enkle algoritmer ikke holder, går vi til probabilistiske modeller (GMM/EM), dimensjonsreduksjon (PCA), og kombinerer mange modeller (ensembler).",
                steps: [
                  { slug: "dte2501-gmm", title: "GMM + EM", blurb: "Soft clustering — sannsynligheter i stedet for harde tildelinger." },
                  { slug: "dte2501-pca", title: "PCA — dimensjonsreduksjon", blurb: "Kovariansmatrise, egenvektorer, explained variance ratio." },
                  { slug: "dte2501-ensemble", title: "Ensembler", blurb: "Bagging (RF) vs Boosting (AdaBoost, GBM)." },
                  { slug: "dte2501-nlp-intro", title: "NLP & TF-IDF", blurb: "Tokenisering, bag-of-words, TF-IDF, cosine similarity." },
                ],
              },
              {
                navn: "Eksamen — beslutninger og optimering",
                intro:
                  "Pensumets toppnivå: metaheuristikker (GA/PSO/ACO), reinforcement learning og dynamisk programmering.",
                steps: [
                  { slug: "dte2501-genetic-algorithms", title: "GA, PSO, ACO", blurb: "Bit-strenger, crossover, mutasjon, fitness — og swarm-varianter." },
                  { slug: "dte2501-reinforcement", title: "MDP, VI, PI, Q-learning", blurb: "Bellman-likning, Value/Policy Iteration." },
                  { slug: "dte2501-dp", title: "Dynamic Programming", blurb: "TSP via Held-Karp bitmask, knapsack — DP-prinsippet." },
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
            Forklart-først-format. Moderne ML er eksamenspensum; klassisk AI er
            supplement.
          </p>
          <h3 className="text-sm font-semibold text-foreground mb-3 mt-2">
            Moderne ML-spor · {ML_COURSES.length} leksjoner
          </h3>
          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {ML_COURSES.map((c) => (
              <CourseCard key={c.slug} c={c} />
            ))}
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-3 mt-4">
            Klassisk AI-spor · {CLASSIC_COURSES.length} leksjoner
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {CLASSIC_COURSES.map((c) => (
              <CourseCard key={c.slug} c={c} />
            ))}
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
            Klikk-gjennom-simulatorer — det raskeste sporet til å bygge intuisjon
            for k-Means, PCA, PSO, GA-encoding og MDP-løsning.
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
            Praktisk øving — drag-konseptmatching, Python-oppgaver i nettleseren,
            og flashcard-repetisjon før eksamen.
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
                Topic «ML —»: k-NN på Iris, k-Means, PCA, Q-learning og
                knapsack-DP. Pyodide + scikit-learn kjører lokalt.
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
                Filter på «k-NN», «k-Means», «PCA», «Reinforcement learning», «GA»
                for spaced-repetisjon av konseptene.
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
                Kort over k-NN, k-Means, GA, ensemble, RL, NLP og PCA —
                repetisjon før eksamen.
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
              {meta?.eksamen ?? "Hjemmeeksamen + mappe"} · {meta?.stp ?? 10} stp
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Pensumet gruppert etter metode-familie. Hver kategori har direkte
            lenker til både konsept-leksjoner og labs.
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
                <h2 className="text-lg font-semibold">Spør AI om DTE-2501</h2>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-success/15 text-success border border-success/30">
                  Sjekk forståelse
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-snug">
                Få forklart hvorfor PCA velger retningen med størst varians, eller
                hvordan EM-algoritmen oppdaterer en GMM. Tutoren ser hva du har
                gjort på faget.
              </p>
              <div className="mt-2 flex items-center text-xs font-medium text-brand">
                Åpne tutor
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </a>
        </section>

        {/* Pensum-oversikt — referansetabell */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Pensum-oversikt</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Eksamenstemaene fra UiT-emnebeskrivelsen, gruppert etter type metode.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Familie</th>
                  <th className="text-left font-semibold px-4 py-2">Sentral idé</th>
                  <th className="text-left font-semibold px-4 py-2 w-56">Typiske metoder</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Supervised</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Lær fra (X, y)-eksempler — klassifikasjon og regresjon
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">k-NN, lineær, polynom</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Unsupervised</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Lær struktur uten etiketter — klustring, generative modeller
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">k-Means, GMM</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Dim.-reduksjon</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Komprimer mange features til få meningsfulle akser
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">PCA</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Ensemble</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Kombiner svake modeller til én sterk
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">Bagging, boosting</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">NLP</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Få maskiner til å lese og klassifisere tekst
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">TF-IDF, Word2Vec</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Metaheuristikk</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Søk inspirert av natur — populasjon eller sverm
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">GA, PSO, ACO</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">RL</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Agent lærer fra belønning i en MDP
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">VI, PI, Q-learning</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">DP</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Bryt store problem i overlappende del-problemer
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">Memo/tab, TSP (Held-Karp)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Klassisk AI</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Eksplisitt kunnskap og søk — ikke statistisk læring
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">Søk, CSP, logikk, Bayes</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Eksamenstips:</strong> mange spørsmål handler om å plassere et
            problem i riktig familie. «Velg gruppe uten etiketter» → klustring.
            «Predikér tall» → regresjon. «Predikér klasse» → klassifikasjon.
            «Lær fra prøving og feiling» → RL. «Komprimer features» → PCA.
          </p>
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
