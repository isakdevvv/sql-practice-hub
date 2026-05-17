import { Link } from "@tanstack/react-router";
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
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import {
  HubStartCta,
  ModulStatusBadge,
} from "@/components/stack/HubShared";
import { LearningPath } from "@/components/stack/LearningPath";

type Practice = {
  href: string;
  Icon: typeof Search;
  tittel: string;
  blurb: string;
};

const PRACTICE: Practice[] = [
  {
    href: "/drag",
    Icon: GitBranch,
    tittel: "Drag-oppgaver",
    blurb:
      "Filter på «k-NN», «k-Means», «PCA», «Reinforcement learning», «GA» — spaced-repetisjon av konseptene.",
  },
  {
    href: "/python",
    Icon: Code2,
    tittel: "Python-øvelser",
    blurb:
      "Velg topic som starter med «ML —» — k-NN på Iris, k-Means, PCA, Q-learning og knapsack-DP kjører i nettleseren via Pyodide + sklearn.",
  },
  {
    href: "/cards",
    Icon: Lightbulb,
    tittel: "Flashcards",
    blurb:
      "Drillbare kort over k-NN, k-Means, GA, ensemble, RL, NLP og PCA — repetisjon før eksamen.",
  },
];

type Course = {
  slug: string;
  title: string;
  shortDescription: string;
  Icon: typeof Search;
  status: "ready" | "coming-soon";
};

// "Klassisk AI"-spor — Russell & Norvig kapitler om søk, CSP, logikk, planlegging
// og Bayes. Verdifullt for forståelse, men ikke direkte i 2026-eksamen.
const CLASSIC_COURSES: Course[] = [
  {
    slug: "sok-algoritmer",
    title: "Søkealgoritmer i AI",
    shortDescription:
      "BFS, DFS, uniform-cost, iterative deepening, greedy og A*. Heuristikker, admissibility, completeness og optimality.",
    Icon: Search,
    status: "ready",
  },
  {
    slug: "csp",
    title: "Constraint Satisfaction Problems",
    shortDescription:
      "CSP-formulering, backtracking, AC-3, forward checking. MRV, degree heuristic og LCV.",
    Icon: Network,
    status: "ready",
  },
  {
    slug: "logisk-resonnering",
    title: "Logisk resonnering",
    shortDescription:
      "Propositional logic, sannhetstabeller, modus ponens, resolusjon, og en kort introduksjon til first-order logic.",
    Icon: BookOpen,
    status: "ready",
  },
  {
    slug: "planlegging",
    title: "Planlegging",
    shortDescription:
      "STRIPS-handlinger, preconditions/effects. Forward (progression) og backward (regression) planning.",
    Icon: ClipboardList,
    status: "ready",
  },
  {
    slug: "bayes",
    title: "Beslutninger under usikkerhet — Bayes",
    shortDescription:
      "Bayes' teorem med gjennomgått eksempel, naive Bayes-klassifikator og betinget uavhengighet.",
    Icon: Sigma,
    status: "ready",
  },
];

// "Moderne ML"-spor — direkte pensum for DTE-2501 2026-eksamen.
const ML_COURSES: Course[] = [
  {
    slug: "dte2501-knn",
    title: "k-Nearest Neighbors",
    shortDescription:
      "Lazy learning, distansemål, bias-variance, k-valg. Klassifikasjon og regresjon med k-NN.",
    Icon: Boxes,
    status: "ready",
  },
  {
    slug: "dte2501-supervised-regresjon",
    title: "Regresjon — lineær og polynom",
    shortDescription:
      "MSE, MAE, R², RMSE. Overfitting, regularisering (Ridge/Lasso), polynom-features og bias-variance.",
    Icon: TrendingUp,
    status: "ready",
  },
  {
    slug: "dte2501-kmeans-clustering",
    title: "k-Means clustering",
    shortDescription:
      "Init → assign → update → konvergens. Elbow, silhouette, og når k-Means feiler (ikke-konvekse klustre).",
    Icon: Layers,
    status: "ready",
  },
  {
    slug: "dte2501-genetic-algorithms",
    title: "Genetic algorithms, swarm, ACO",
    shortDescription:
      "Populasjon, fitness, seleksjon, crossover, mutasjon. PSO og Ant Colony Optimization.",
    Icon: Dna,
    status: "ready",
  },
  {
    slug: "dte2501-nlp-intro",
    title: "Natural Language Processing",
    shortDescription:
      "Tokenisering, bag-of-words, TF-IDF, embeddings (Word2Vec/GloVe), tekst-klassifikasjon.",
    Icon: MessageSquare,
    status: "ready",
  },
  {
    slug: "dte2501-pca",
    title: "Principal Component Analysis",
    shortDescription:
      "Dimensjonsreduksjon, kovariansmatrise, egenvektorer, forklart varians og scree plot.",
    Icon: Axis3D,
    status: "ready",
  },
  {
    slug: "dte2501-gmm",
    title: "Gaussian Mixture Models",
    shortDescription:
      "Mikstur-modeller, EM-algoritmen (E-step + M-step), soft clustering vs k-Means.",
    Icon: Sparkles,
    status: "ready",
  },
  {
    slug: "dte2501-ensemble",
    title: "Ensemble — bagging og boosting",
    shortDescription:
      "Bias-variance dekomponering, bootstrap, random forest, AdaBoost og gradient boosting.",
    Icon: GitMerge,
    status: "ready",
  },
  {
    slug: "dte2501-reinforcement",
    title: "Reinforcement Learning og MDP",
    shortDescription:
      "MDP, Bellman, Value/Policy Iteration. Known vs unknown world, Q-learning intro.",
    Icon: Gamepad2,
    status: "ready",
  },
  {
    slug: "dte2501-dp",
    title: "Dynamic Programming og TSP",
    shortDescription:
      "Memoization vs tabulation, Fibonacci, knapsack. Held-Karp DP for Travelling Salesman.",
    Icon: InfinityIcon,
    status: "ready",
  },
  {
    slug: "dte2501-minimax",
    title: "Minimax og alpha-beta pruning",
    shortDescription:
      "Adversarial search i 2-spillerspill. Minimax-algoritmen, alpha-beta pruning, evalueringsfunksjoner og quiescence search. AIMA kap. 6.",
    Icon: Swords,
    status: "ready",
  },
  {
    slug: "dte2501-bandits",
    title: "Multi-armed bandits",
    shortDescription:
      "Bandit-problemet, action-value Q(a), ε-greedy, optimistic initial values, UCB1, Thompson sampling og regret. Sutton & Barto kap. 2.",
    Icon: Dices,
    status: "ready",
  },
  {
    slug: "dte2501-mdp-bellman",
    title: "MDP-regnedrill — Bellman, VI og PI",
    shortDescription:
      "Regnedrill for Bellman-likningen, Value Iteration og Policy Iteration på en liten 2-state MDP. Steg-for-steg.",
    Icon: Calculator,
    status: "ready",
  },
  {
    slug: "dte2501-kmeans-visualizer",
    title: "k-Means live-plot",
    shortDescription:
      "Interaktiv visualisering: velg k, dataset (Iris/blobs/moons/klikk selv), steg ASSIGN/UPDATE eller animer. Inertia-graf per steg.",
    Icon: Layers,
    status: "ready",
  },
  {
    slug: "dte2501-pca-visualizer",
    title: "PCA interaktiv projeksjon",
    shortDescription:
      "Roter selv en akse og se PC1 maksimere varians. Iris/Wine i 2D, projisert på PC1 vs PC1+PC2, explained variance ratio.",
    Icon: Axis3D,
    status: "ready",
  },
  {
    slug: "dte2501-pso-visualizer",
    title: "PSO live-sverm",
    shortDescription:
      "Partikkelsverm på Rastrigin/Ackley/daler. Juster w, c1, c2 og spread; identifiser hvilken preset er «for høy inertia», «for lav c2» og «balansert».",
    Icon: Layers,
    status: "ready",
  },
];

function CourseCard({ c }: { c: Course }) {
  const Icon = c.Icon;
  if (c.status !== "ready") {
    return (
      <div className="rounded-xl border border-border bg-card/30 p-5 opacity-60">
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
      to="/stack/$slug"
      params={{ slug: c.slug }}
      className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-brand" />
        <h3 className="font-semibold text-foreground leading-tight">{c.title}</h3>
        <ModulStatusBadge trinnSlugs={[c.slug]} />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{c.shortDescription}</p>
      <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
        Åpne
        <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}

export function Dte2501Hub() {
  return (
    <StackPageShell title="DTE-2501 AI Methods and Applications" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · 10 stp · Teknisk spesialisering
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            AI Methods and Applications
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Faget dekker både{" "}
            <strong className="text-foreground">klassisk symbolic AI</strong>{" "}
            (søk, CSP, logikk, planlegging, Bayes) og{" "}
            <strong className="text-foreground">moderne ML</strong>{" "}
            (k-NN, k-Means, PCA, GMM, ensemble, reinforcement learning,
            genetic algorithms, NLP, dynamic programming). Eksamen er forankret i
            ML-sporet — det klassiske sporet gir bakgrunn og er fortsatt verdifullt
            å lese.
          </p>
        </div>

        <HubStartCta
          startSlug="dte2501-knn"
          startSubtitle="Start med k-NN på det moderne ML-sporet, så regresjon og k-Means. Klassisk AI er supplement."
          jumpHref="#moduler"
          jumpSubtitle="Hopp til ML-sporet eller klassisk AI-sporet — 25+ mini-kurs totalt."
        />

        <section className="mb-10">
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
                  { slug: "dte2501-kmeans-clustering", title: "k-Means clustering", blurb: "Lloyd's algoritme, k-means++, albue/silhouette for å velge k." },
                ],
              },
              {
                navn: "Dypere — sannsynlighet og struktur",
                intro:
                  "Når enkle algoritmer ikke holder, går vi til probabilistiske modeller (GMM/EM), dimensjonsreduksjon (PCA), og kombinerer mange modeller (ensembler).",
                steps: [
                  { slug: "dte2501-gmm", title: "GMM + EM", blurb: "Soft clustering — sannsynligheter i stedet for harde tildelinger." },
                  { slug: "dte2501-pca", title: "PCA — dimensjonsreduksjon", blurb: "Kovariansmatrise, egenvektorer, explained variance ratio." },
                  { slug: "dte2501-ensemble", title: "Ensembler", blurb: "Bagging (RF) vs Boosting (AdaBoost, GBM) — to ulike måter å kombinere modeller." },
                  { slug: "dte2501-nlp-intro", title: "NLP & TF-IDF", blurb: "Tokenisering, bag-of-words, TF-IDF, cosine similarity." },
                ],
              },
              {
                navn: "Eksamen — beslutninger og optimering",
                intro:
                  "Pensumets toppnivå: metaheuristikker (GA/PSO/ACO), reinforcement learning og dynamisk programmering. Disse er ofte stilløftere på eksamen.",
                steps: [
                  { slug: "dte2501-genetic-algorithms", title: "GA, PSO, ACO", blurb: "Bit-strenger, crossover, mutasjon, fitness — og swarm-varianter." },
                  { slug: "dte2501-reinforcement", title: "MDP, VI, PI, Q-learning", blurb: "Bellman-likning, Value/Policy Iteration, kjent vs ukjent verden." },
                  { slug: "dte2501-dp", title: "Dynamic Programming", blurb: "TSP via Held-Karp bitmask, knapsack — DP-prinsippet konkretisert." },
                ],
              },
            ]}
          />
        </section>

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

        <section id="moduler" className="mb-10 scroll-mt-20">
          <h2 className="text-xl font-semibold mb-1">Moderne ML-spor</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Eksamenspensumet. Bygger videre på DTE-2602.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {ML_COURSES.map((c) => (
              <CourseCard key={c.slug} c={c} />
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-1">Klassisk AI-spor</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Russell &amp; Norvig-tradisjonen: symbolic AI og resonnering. Bra bakgrunn
            for konseptuelle eksamensspørsmål om hva AI er.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {CLASSIC_COURSES.map((c) => (
              <CourseCard key={c.slug} c={c} />
            ))}
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
                    <h3 className="font-semibold text-foreground leading-tight">
                      {r.tittel}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {r.blurb}
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

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Hvor passer dette inn?</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">Drag-oppgaver:</strong> filter på
              «k-NN», «k-Means», «PCA», «Reinforcement learning» i{" "}
              <Link to="/drag" className="text-brand hover:underline">/drag</Link>{" "}
              for spaced-repetisjon av konseptene.
            </li>
            <li>
              <strong className="text-foreground">Python-øvelser:</strong> velg topic
              som starter med «ML —» i{" "}
              <Link to="/python" className="text-brand hover:underline">/python</Link>{" "}
              — k-NN på Iris, k-Means, PCA, Q-learning og knapsack-DP kjører i
              nettleseren via Pyodide + scikit-learn.
            </li>
            <li>
              <strong className="text-foreground">Forkunnskap:</strong> faget bygger
              på{" "}
              <Link to="/stack/$slug" params={{ slug: "dte-2602" }} className="text-brand hover:underline">
                DTE-2602
              </Link>{" "}
              (intro til ML). Hvis du er rusten, gå dit først.
            </li>
            <li>
              <strong className="text-foreground">Lavnivå-grafer (BFS/DFS):</strong> se{" "}
              <Link to="/stack/$slug" params={{ slug: "algoritmer" }} className="text-brand hover:underline">
                algoritmer-trinnet
              </Link>{" "}
              for selve implementasjonen.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
