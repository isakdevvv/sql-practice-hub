import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Search,
  Compass,
  Swords,
  Dna,
  Bug,
  Wind,
  BarChart3,
  Network,
  Gamepad2,
  ArrowRight,
  Target,
  Brain,
  Eye,
  Cpu,
  TrendingUp,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type ParadigmeId =
  | "search-fundamentals"
  | "advanced-search"
  | "adversarial"
  | "evolutionary"
  | "swarm-ants"
  | "swarm-particles"
  | "ml"
  | "neural-nets"
  | "reinforcement";

export type Paradigme = {
  id: ParadigmeId;
  navn: string;
  kortNavn: string; // kort label i SVG
  oneLiner: string;
  problemTyper: {
    Icon: LucideIcon;
    label: string;
  }[];
  // Slug for "Lær dybde →"-lenke til eksisterende lesjon
  dybdeSlug: string | null;
  dybdeLabel: string;
  // SVG-posisjon (viewBox 0–1000 x 0–600)
  x: number;
  y: number;
  // Klynge-farge
  klynge: "sok" | "adversarial" | "natur" | "data" | "rl";
};

export const PARADIGMER: Paradigme[] = [
  {
    id: "search-fundamentals",
    navn: "Search fundamentals",
    kortNavn: "Søk (grunn)",
    oneLiner:
      "Brute-force-utforskning av en tilstandsgraf — BFS, DFS, uniform-cost. Garantert å finne løsning hvis den finnes, men kan være langsom.",
    problemTyper: [
      { Icon: Network, label: "Korteste vei i graf" },
      { Icon: Target, label: "Tilstands-utforskning" },
      { Icon: Compass, label: "Labyrint-løsning" },
    ],
    dybdeSlug: "sok-algoritmer",
    dybdeLabel: "Søkealgoritmer i AI",
    x: 150,
    y: 110,
    klynge: "sok",
  },
  {
    id: "advanced-search",
    navn: "Advanced / Heuristic search",
    kortNavn: "Heuristisk søk",
    oneLiner:
      "Bruk en heuristikk h(n) for å gjette hvilken retning som er nærmest målet. A* og greedy best-first kombinerer kjent kost g(n) med estimat h(n).",
    problemTyper: [
      { Icon: Compass, label: "GPS-ruting" },
      { Icon: Target, label: "Puzzle (8-puzzle, Rubik)" },
      { Icon: Network, label: "Planlegging med kost" },
    ],
    dybdeSlug: "sok-algoritmer",
    dybdeLabel: "Søkealgoritmer (A*, heuristikker)",
    x: 350,
    y: 80,
    klynge: "sok",
  },
  {
    id: "adversarial",
    navn: "Adversarial search",
    kortNavn: "Adversarial",
    oneLiner:
      "To-spillerspill med motstander som spiller optimalt mot deg. Minimax velger trekk som maksimerer din verste utgang; alpha-beta klipper bort hopeløse grener.",
    problemTyper: [
      { Icon: Swords, label: "Sjakk / Go / dam" },
      { Icon: Gamepad2, label: "Tic-tac-toe" },
      { Icon: Target, label: "Spillteori-trekk" },
    ],
    dybdeSlug: "dte2501-minimax",
    dybdeLabel: "Minimax og alpha-beta",
    x: 580,
    y: 80,
    klynge: "adversarial",
  },
  {
    id: "evolutionary",
    navn: "Evolutionary (GA)",
    kortNavn: "Evolusjonær",
    oneLiner:
      "Behold en populasjon kandidatløsninger. Velg de beste (fitness), kryss dem (crossover), introduser mutasjoner. Repeter til en god løsning vinner frem.",
    problemTyper: [
      { Icon: Sparkles, label: "Knapsack / optimering" },
      { Icon: Cpu, label: "Hyperparameter-søk" },
      { Icon: Network, label: "Ruteplanlegging (TSP)" },
    ],
    dybdeSlug: "dte2501-genetic-algorithms",
    dybdeLabel: "Genetic algorithms, swarm, ACO",
    x: 820,
    y: 130,
    klynge: "natur",
  },
  {
    id: "swarm-ants",
    navn: "Swarm — Ant Colony (ACO)",
    kortNavn: "Maur-sverm",
    oneLiner:
      "Maur deponerer feromon på korte stier; feromonet fordamper på lange. Etter mange iterasjoner trekker svermen seg sammen om en god rute.",
    problemTyper: [
      { Icon: Compass, label: "TSP — rutevalg" },
      { Icon: Network, label: "Nettverks-ruting" },
      { Icon: Target, label: "Job-scheduling" },
    ],
    dybdeSlug: "dte2501-genetic-algorithms",
    dybdeLabel: "GA, PSO, ACO (samme lesjon)",
    x: 870,
    y: 280,
    klynge: "natur",
  },
  {
    id: "swarm-particles",
    navn: "Swarm — Particle (PSO)",
    kortNavn: "Partikkel-sverm",
    oneLiner:
      "Partikler flyr gjennom en søke-rom. Hver partikkel trekker mot sin egen beste posisjon og svermens globale beste — kontinuerlig optimering.",
    problemTyper: [
      { Icon: TrendingUp, label: "Funksjons-min/maks" },
      { Icon: Cpu, label: "NN-vekt-tuning" },
      { Icon: Sparkles, label: "Kontinuerlig optim." },
    ],
    dybdeSlug: "dte2501-genetic-algorithms",
    dybdeLabel: "GA, PSO, ACO (samme lesjon)",
    x: 780,
    y: 430,
    klynge: "natur",
  },
  {
    id: "ml",
    navn: "Machine Learning",
    kortNavn: "ML (klassisk)",
    oneLiner:
      "Lær mønstre fra data. Supervised (k-NN, regresjon, ensembler) bruker etiketter; unsupervised (k-Means, PCA, GMM) finner struktur uten.",
    problemTyper: [
      { Icon: BarChart3, label: "Klassifisering" },
      { Icon: TrendingUp, label: "Regresjon (predikér tall)" },
      { Icon: Eye, label: "Klustring / mønster" },
    ],
    dybdeSlug: "dte2501-knn",
    dybdeLabel: "k-NN (start på ML-sporet)",
    x: 480,
    y: 320,
    klynge: "data",
  },
  {
    id: "neural-nets",
    navn: "Neural networks",
    kortNavn: "Nevrale nett",
    oneLiner:
      "Lag av kunstige nevroner som lærer ikke-lineære funksjoner via backpropagation. Basis for dyp læring — bilder, tekst, lyd, alt.",
    problemTyper: [
      { Icon: Eye, label: "Bildegjenkjenning" },
      { Icon: Brain, label: "Språk (NLP)" },
      { Icon: Cpu, label: "Generative modeller" },
    ],
    dybdeSlug: "nn-intro",
    dybdeLabel: "Nevrale nett — introduksjon",
    x: 230,
    y: 380,
    klynge: "data",
  },
  {
    id: "reinforcement",
    navn: "Reinforcement learning",
    kortNavn: "RL",
    oneLiner:
      "En agent prøver handlinger i en omverden, mottar belønning, og lærer en policy som maksimerer fremtidig belønning. Q-learning, value/policy iteration.",
    problemTyper: [
      { Icon: Gamepad2, label: "Spill-AI (Atari, Go)" },
      { Icon: Target, label: "Robot-kontroll" },
      { Icon: TrendingUp, label: "Anbefalingssystem" },
    ],
    dybdeSlug: "dte2501-reinforcement",
    dybdeLabel: "Reinforcement Learning og MDP",
    x: 130,
    y: 510,
    klynge: "rl",
  },
];

// Logiske naboskap — viser slektskap mellom paradigmer
export const EDGES: [ParadigmeId, ParadigmeId][] = [
  ["search-fundamentals", "advanced-search"],
  ["advanced-search", "adversarial"],
  ["advanced-search", "evolutionary"],
  ["evolutionary", "swarm-ants"],
  ["evolutionary", "swarm-particles"],
  ["swarm-ants", "swarm-particles"],
  ["ml", "neural-nets"],
  ["ml", "reinforcement"],
  ["neural-nets", "reinforcement"],
  ["advanced-search", "ml"],
  ["search-fundamentals", "neural-nets"],
];

const KLYNGE_FARGE: Record<Paradigme["klynge"], { fill: string; stroke: string; text: string }> = {
  sok: { fill: "#1e3a8a", stroke: "#3b82f6", text: "#dbeafe" },
  adversarial: { fill: "#7f1d1d", stroke: "#ef4444", text: "#fee2e2" },
  natur: { fill: "#14532d", stroke: "#22c55e", text: "#dcfce7" },
  data: { fill: "#581c87", stroke: "#a855f7", text: "#f3e8ff" },
  rl: { fill: "#7c2d12", stroke: "#f97316", text: "#ffedd5" },
};

const KLYNGE_ICON: Record<Paradigme["klynge"], LucideIcon> = {
  sok: Search,
  adversarial: Swords,
  natur: Dna,
  data: BarChart3,
  rl: Gamepad2,
};

type Props = {
  selected: ParadigmeId | null;
  onSelect: (id: ParadigmeId) => void;
  highlighted: Set<ParadigmeId>; // for problem-velger-modus
  highlightLabel?: string;
};

export function ParadigmeGraph({
  selected,
  onSelect,
  highlighted,
  highlightLabel,
}: Props) {
  const byId = useMemo(() => {
    const m = new Map<ParadigmeId, Paradigme>();
    for (const p of PARADIGMER) m.set(p.id, p);
    return m;
  }, []);

  const valgt = selected ? byId.get(selected) ?? null : null;
  const harHighlight = highlighted.size > 0;

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-2 flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm font-medium">Kart over AI-paradigmer</div>
        {harHighlight && highlightLabel ? (
          <div className="text-xs text-brand">
            Highlightet: {highlighted.size} {highlighted.size === 1 ? "familie" : "familier"} for "{highlightLabel}"
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">Klikk en node for detaljer</div>
        )}
      </div>

      <div className="p-2">
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-auto"
          style={{ maxHeight: "520px" }}
          role="img"
          aria-label="Interaktivt kart over AI-paradigmer"
        >
          {/* Edges */}
          <g>
            {EDGES.map(([aId, bId], i) => {
              const a = byId.get(aId)!;
              const b = byId.get(bId)!;
              const begge = highlighted.has(aId) && highlighted.has(bId);
              const stroke = harHighlight
                ? begge
                  ? "#a855f7"
                  : "#27272a"
                : "#3f3f46";
              const width = begge ? 2.5 : 1.5;
              return (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={stroke}
                  strokeWidth={width}
                  strokeDasharray={begge ? "0" : harHighlight ? "4 4" : "0"}
                  opacity={harHighlight && !begge ? 0.35 : 1}
                />
              );
            })}
          </g>

          {/* Nodes */}
          {PARADIGMER.map((p) => {
            const farger = KLYNGE_FARGE[p.klynge];
            const Icon = KLYNGE_ICON[p.klynge];
            const erValgt = selected === p.id;
            const erHighlight = highlighted.has(p.id);
            const erDempet = harHighlight && !erHighlight;
            return (
              <g
                key={p.id}
                transform={`translate(${p.x}, ${p.y})`}
                style={{ cursor: "pointer" }}
                onClick={() => onSelect(p.id)}
                opacity={erDempet ? 0.35 : 1}
              >
                {/* Highlight-ring */}
                {erHighlight && (
                  <circle
                    r={62}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth={2.5}
                    strokeDasharray="6 4"
                    opacity={0.85}
                  >
                    <animate
                      attributeName="r"
                      values="58;66;58"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {/* Outer ring for valgt */}
                {erValgt && (
                  <circle
                    r={55}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth={3}
                  />
                )}
                {/* Hovedsirkel */}
                <circle
                  r={48}
                  fill={farger.fill}
                  stroke={farger.stroke}
                  strokeWidth={erValgt ? 3 : 2}
                />
                {/* Ikon (lucide via foreignObject for å beholde stroke) */}
                <foreignObject x={-12} y={-32} width={24} height={24}>
                  <Icon
                    width={24}
                    height={24}
                    stroke={farger.text}
                    style={{ display: "block" }}
                  />
                </foreignObject>
                {/* Label */}
                <text
                  x={0}
                  y={4}
                  textAnchor="middle"
                  fill={farger.text}
                  fontSize="11"
                  fontWeight="600"
                  style={{ pointerEvents: "none", fontFamily: "system-ui, sans-serif" }}
                >
                  {p.kortNavn}
                </text>
                {/* Underlabel — kategori */}
                <text
                  x={0}
                  y={20}
                  textAnchor="middle"
                  fill={farger.text}
                  fontSize="9"
                  opacity={0.75}
                  style={{ pointerEvents: "none", fontFamily: "system-ui, sans-serif" }}
                >
                  {p.klynge.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Detalj-panel for valgt node */}
      <div className="border-t border-border p-4">
        {valgt ? (
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <h3 className="text-lg font-semibold">{valgt.navn}</h3>
              <span
                className="text-xs px-2 py-0.5 rounded-full border"
                style={{
                  borderColor: KLYNGE_FARGE[valgt.klynge].stroke,
                  color: KLYNGE_FARGE[valgt.klynge].stroke,
                }}
              >
                {valgt.klynge}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{valgt.oneLiner}</p>
            <div className="mb-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Typiske problemer
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {valgt.problemTyper.map((pt, i) => {
                  const Icon = pt.Icon;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs"
                    >
                      <Icon className="h-4 w-4 text-brand shrink-0" />
                      <span>{pt.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {valgt.dybdeSlug ? (
              <Link
                to="/stack/$slug"
                params={{ slug: valgt.dybdeSlug }}
                className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
              >
                Lær dybde: {valgt.dybdeLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <div className="text-xs text-muted-foreground italic">
                (Ingen dybde-lesjon registrert ennå.)
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic">
            Klikk en node i kartet for å se beskrivelse, problemtyper og lenke til dybde-lesjon.
          </div>
        )}
      </div>
    </div>
  );
}
