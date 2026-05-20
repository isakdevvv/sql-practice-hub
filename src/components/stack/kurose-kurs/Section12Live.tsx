import { useEffect, useMemo, useState } from "react";
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from "lucide-react";

// Levende versjon av seksjon 1.2 — Edge & core.
//
// Pedagogisk idé: Internett er delt i to lag:
//   - EDGE  = kant-noder (hosts: laptops, mobiler, servere)
//   - CORE  = et nett av rutere som flytter pakker mellom edge-noder
//   - ACCESS = aksess-ruteren som kobler en edge-host til nærmeste core-ruter
//
// Widgeten viser fire scenarier som alle deler de samme core-ruterne, men
// ender opp med ulike pakke-stier — inklusiv hva som skjer hvis en core-
// ruter faller ut.

type NodeId =
  // Edge — venstre side
  | "laptopA"
  | "mobilB"
  // Edge — høyre side
  | "serverX"
  | "serverY"
  // Aksess-rutere (mellomledd mellom edge og core)
  | "accA"
  | "accB"
  | "accX"
  | "accY"
  // Core-rutere (kjernen)
  | "c1"
  | "c2"
  | "c3"
  | "c4"
  | "c5";

type Node = {
  id: NodeId;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  kind: "laptop" | "phone" | "server" | "access" | "core";
};

const NODES: Node[] = [
  // Venstre edge
  { id: "laptopA", label: "Laptop A", sublabel: "Trine, Tromsø", x: 50, y: 70, kind: "laptop" },
  { id: "mobilB", label: "Mobil B", sublabel: "Jonas, Bergen", x: 50, y: 210, kind: "phone" },

  // Aksess venstre
  { id: "accA", label: "Aksess", sublabel: "fiber", x: 160, y: 70, kind: "access" },
  { id: "accB", label: "Aksess", sublabel: "4G", x: 160, y: 210, kind: "access" },

  // Core — fem rutere i et nettverk
  { id: "c1", label: "K1", x: 280, y: 70, kind: "core" },
  { id: "c2", label: "K2", x: 280, y: 210, kind: "core" },
  { id: "c3", label: "K3", x: 390, y: 140, kind: "core" },
  { id: "c4", label: "K4", x: 500, y: 70, kind: "core" },
  { id: "c5", label: "K5", x: 500, y: 210, kind: "core" },

  // Aksess høyre
  { id: "accX", label: "Aksess", sublabel: "datasenter", x: 620, y: 70, kind: "access" },
  { id: "accY", label: "Aksess", sublabel: "datasenter", x: 620, y: 210, kind: "access" },

  // Høyre edge
  { id: "serverX", label: "Server X", sublabel: "video-tjeneste", x: 730, y: 70, kind: "server" },
  { id: "serverY", label: "Server Y", sublabel: "spill-tjeneste", x: 730, y: 210, kind: "server" },
];

// Stam-nettet av lenker (uorientert). Hver edge er en fysisk kabel.
const EDGES: [NodeId, NodeId][] = [
  // Edge ↔ aksess
  ["laptopA", "accA"],
  ["mobilB", "accB"],
  ["serverX", "accX"],
  ["serverY", "accY"],

  // Aksess ↔ core
  ["accA", "c1"],
  ["accB", "c2"],
  ["accX", "c4"],
  ["accY", "c5"],

  // Core-mesh
  ["c1", "c2"],
  ["c1", "c3"],
  ["c2", "c3"],
  ["c3", "c4"],
  ["c3", "c5"],
  ["c4", "c5"],
  ["c1", "c4"],
  ["c2", "c5"],
];

type Step = {
  title: string;
  description: string;
  /** Pakke-rute (node-IDer) — pakken animeres langs disse. */
  path: NodeId[];
  /** Hvilke rutere som er "ute av drift" i dette steget — vises grået. */
  downNodes?: NodeId[];
  color: "blue" | "amber" | "purple" | "red";
};

const STEPS: Step[] = [
  // ---------- Scenario 1: Laptop A → Server X (forward path med forwarding-table-lookup på hver hop) ----------
  {
    title: "1. Laptop A sender pakken til sin gateway",
    description:
      "Trines laptop har bare ett valg: send pakken til default gateway (aksess-ruteren). Den vet ingenting om internett-topologien — den stoler på at gatewayen tar over resten. Pakken har destinasjon = Server X sin IP-adresse.",
    path: ["laptopA", "accA"],
    color: "blue",
  },
  {
    title: "2. Aksess-ruteren slår opp i forwarding-tabellen",
    description:
      "Aksess-ruteren ser destinasjons-IP i pakken og slår opp i sin forwarding-tabell: «mot 195.x.x.x → send ut på lenke til K1». Tabellen er fylt på forhånd av OSPF/BGP. Pakken videresendes til K1.",
    path: ["accA", "c1"],
    color: "blue",
  },
  {
    title: "3. K1 ruter pakken videre mot K4",
    description:
      "K1 gjør samme oppslag: destinasjons-IP matcher Server X. Tabellen sier: «korteste vei dit går via K4». K1 setter pakken på output-køen til K4 og sender den ut.",
    path: ["c1", "c4"],
    color: "blue",
  },
  {
    title: "4. K4 leverer til aksess-ruteren, som sender til Server X",
    description:
      "K4 ser at neste hop ligger lokalt — sender til accX. AccX gjør link-layer-bytte (Ethernet med MAC-adresser) og leverer endelig til Server X. Hele forwardingen tok 5 hops på kanskje 30 ms.",
    path: ["c4", "accX", "serverX"],
    color: "blue",
  },
  {
    title: "5. Server X svarer — pakken tar samme vei tilbake",
    description:
      "Svaret følger samme rute speilvendt. Internett bruker hop-by-hop forwarding — hver ruter tar sin egen beslutning basert på destinasjons-IP, så returveien er ikke garantert lik. I praksis er den ofte symmetrisk når topologien er enkel.",
    path: ["serverX", "accX", "c4", "c1", "accA", "laptopA"],
    color: "blue",
  },

  // ---------- Scenario 2: Mobil B → Server Y (parallell trafikk på samme core) ----------
  {
    title: "6. Mobil B til Server Y — samme core, andre lenker",
    description:
      "Jonas i Bergen åpner et spill. Mobilen treffer en helt annen aksess-ruter (4G) og bruker en annen rute gjennom core (K2 → K5). Likevel deler de fysisk samme core-nett — bare ulike lenker er aktive samtidig. Slik skaleres internett: én core, mange parallelle pakkestrømmer.",
    path: ["mobilB", "accB", "c2", "c5", "accY", "serverY"],
    color: "amber",
  },

  // ---------- Scenario 3: Edge-til-edge på samme side ----------
  {
    title: "7. Laptop A sender melding til Mobil B",
    description:
      "Selv om begge er på «venstre side» av tegningen, finnes det ingen direkte kabel mellom dem. Pakken må inn i core. Forwarding-tabellen i K1 sier nå: «mot mobilB → via K3 → K2». K3 er den kortest stien gjennom mesh-en.",
    path: ["laptopA", "accA", "c1", "c3", "c2", "accB", "mobilB"],
    color: "purple",
  },

  // ---------- Scenario 4: K3 faller ut — OSPF-konvergens og re-ruting ----------
  {
    title: "8. K3 faller ut (strømbrudd)",
    description:
      "Plutselig mister K3 strømmen. Naboene K1, K2, K4, K5 har sendt periodiske «Hello»-pakker (hvert 10. sek i OSPF) — nå slutter K3 å svare. Innen 30–40 sekunder erklærer naboene at K3 er nede.",
    path: ["c1", "c3"],
    downNodes: ["c3"],
    color: "red",
  },
  {
    title: "9. LSA-flooding: K1 forteller resten av core",
    description:
      "Når K1 oppdager at K3 er nede, lager den en Link State Advertisement og flooder den til alle naboer (K2, K4). De flooder videre. På sekunder vet hele core at lenkene K1–K3, K2–K3, K4–K3, K5–K3 er borte.",
    path: ["c1", "c2", "c5"],
    downNodes: ["c3"],
    color: "purple",
  },
  {
    title: "10. Dijkstra: hver ruter regner ut nye korteste stier",
    description:
      "Med oppdatert topologi-kart kjører hver core-ruter Dijkstras algoritme i sitt eget hode og bygger en ny forwarding-tabell. For trafikk fra K1 mot K2 er den nye stien nå K1 → K4 → K5 → K2. Konvergens tar typisk 1–10 sekunder i en moderne OSPF-domene.",
    path: ["c1", "c4", "c5", "c2"],
    downNodes: ["c3"],
    color: "purple",
  },
  {
    title: "11. Ny pakke fra Laptop A til Server Y går rundt K3",
    description:
      "Trine sender en ny pakke — denne gangen mot Server Y (som tilfeldigvis er på samme side som Server X). Med oppdaterte forwarding-tabeller går pakken K1 → K4 → K5. Det er styrken til mesh-core: flere veier, og når én forsvinner finner protokollene en ny innen sekunder.",
    path: ["laptopA", "accA", "c1", "c4", "c5", "accY", "serverY"],
    downNodes: ["c3"],
    color: "red",
  },
];

const COLOR_CLASS: Record<Step["color"], string> = {
  blue: "fill-brand",
  amber: "fill-amber-500",
  purple: "fill-purple-500",
  red: "fill-destructive",
};
const COLOR_LABEL: Record<Step["color"], string> = {
  blue: "A→X",
  amber: "B→Y",
  purple: "A→B",
  red: "omvei",
};
// bg-* varianter for legend-prikker (<span>). fill-* virker kun i SVG.
const BG_CLASS: Record<Step["color"], string> = {
  blue: "bg-brand",
  amber: "bg-amber-500",
  purple: "bg-purple-500",
  red: "bg-destructive",
};

export function Section12Live() {
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pktProgress, setPktProgress] = useState(0); // 0..1 innen nåværende steg

  const step = STEPS[stepIdx];

  // Animasjons-loop
  useEffect(() => {
    if (!playing) return;
    let raf: number;
    let last = performance.now();
    const SPEED = 1 / 2400; // ~2.4 sek per steg
    function tick(now: number) {
      const dt = now - last;
      last = now;
      setPktProgress((p) => {
        const next = p + dt * SPEED;
        if (next >= 1) {
          setStepIdx((i) => {
            if (i + 1 >= STEPS.length) {
              setPlaying(false);
              return i;
            }
            return i + 1;
          });
          return 0;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  function nextStep() {
    setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
    setPktProgress(0);
  }
  function prevStep() {
    setStepIdx((i) => Math.max(0, i - 1));
    setPktProgress(0);
  }
  function reset() {
    setStepIdx(0);
    setPktProgress(0);
    setPlaying(false);
  }

  const packetPos = useMemo(() => packetPosition(step.path, pktProgress), [step, pktProgress]);
  const activeEdges = useMemo(() => pathToEdges(step.path), [step]);
  const downSet = useMemo(() => new Set(step.downNodes ?? []), [step]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <span className="font-medium text-foreground">{step.title}</span>
        <span className="ml-auto font-mono">
          Steg {stepIdx + 1} / {STEPS.length}
        </span>
      </div>

      <svg viewBox="0 0 780 280" className="w-full h-auto bg-muted/10">
        {/* Bakgrunn: edge-soner (venstre + høyre) + core-sone */}
        <rect
          x={10}
          y={20}
          width={210}
          height={240}
          rx={10}
          className="fill-amber-500/5 stroke-amber-500/30"
          strokeDasharray="4 3"
          strokeWidth={1}
        />
        <text
          x={115}
          y={38}
          textAnchor="middle"
          className="fill-amber-700 dark:fill-amber-300 text-[10px] font-semibold tracking-wide"
        >
          EDGE — kant
        </text>

        <rect
          x={235}
          y={20}
          width={330}
          height={240}
          rx={10}
          className="fill-brand/5 stroke-brand/30"
          strokeDasharray="4 3"
          strokeWidth={1}
        />
        <text
          x={400}
          y={38}
          textAnchor="middle"
          className="fill-brand text-[10px] font-semibold tracking-wide"
        >
          CORE — kjernen
        </text>

        <rect
          x={580}
          y={20}
          width={190}
          height={240}
          rx={10}
          className="fill-amber-500/5 stroke-amber-500/30"
          strokeDasharray="4 3"
          strokeWidth={1}
        />
        <text
          x={675}
          y={38}
          textAnchor="middle"
          className="fill-amber-700 dark:fill-amber-300 text-[10px] font-semibold tracking-wide"
        >
          EDGE — kant
        </text>

        {/* Edges */}
        {EDGES.map(([a, b], i) => {
          const na = NODES.find((n) => n.id === a)!;
          const nb = NODES.find((n) => n.id === b)!;
          const isActive = activeEdges.some(
            ([x, y]) => (x === a && y === b) || (x === b && y === a),
          );
          const isDown = downSet.has(a) || downSet.has(b);
          return (
            <line
              key={i}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              className={
                isDown
                  ? "stroke-muted-foreground/15"
                  : isActive
                    ? "stroke-foreground/75"
                    : "stroke-muted-foreground/30"
              }
              strokeWidth={isActive ? 2.2 : 1.4}
              strokeDasharray={isDown ? "3 3" : undefined}
            />
          );
        })}

        {/* Noder */}
        {NODES.map((n) => (
          <NodeShape key={n.id} node={n} down={downSet.has(n.id)} />
        ))}

        {/* Animert pakke */}
        {packetPos && (
          <g>
            <circle
              cx={packetPos.x}
              cy={packetPos.y}
              r={11}
              className={`${COLOR_CLASS[step.color]} stroke-background`}
              strokeWidth={2}
            />
            <text
              x={packetPos.x}
              y={packetPos.y + 3}
              textAnchor="middle"
              className="fill-background text-[8px] font-bold pointer-events-none"
            >
              {COLOR_LABEL[step.color]}
            </text>
          </g>
        )}
      </svg>

      <div className="px-4 py-3 text-sm text-muted-foreground border-t border-border">
        {step.description}
      </div>

      {/* Kontroller */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-1.5 border-t border-border bg-muted/20">
        <button
          onClick={prevStep}
          disabled={stepIdx === 0}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 disabled:opacity-40"
        >
          <SkipBack className="h-3 w-3" /> Forrige
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 px-2 py-1 text-xs font-medium hover:bg-brand/20"
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing
            ? "Pause"
            : stepIdx === STEPS.length - 1 && pktProgress >= 0.99
              ? "Spill av igjen"
              : "Spill av"}
        </button>
        <button
          onClick={nextStep}
          disabled={stepIdx === STEPS.length - 1}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 disabled:opacity-40"
        >
          Neste <SkipForward className="h-3 w-3" />
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 ml-auto"
        >
          <RotateCcw className="h-3 w-3" />
        </button>

        {/* Steg-prikker */}
        <div className="ml-2 flex gap-1">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setStepIdx(i);
                setPktProgress(0);
              }}
              className={`h-1.5 w-4 rounded-full ${
                i === stepIdx ? "bg-brand" : i < stepIdx ? "bg-brand/40" : "bg-muted-foreground/20"
              }`}
              aria-label={`Gå til steg ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground border-t border-border">
        <LegendDot color="blue" /> Laptop A → Server X
        <LegendDot color="amber" /> Mobil B → Server Y
        <LegendDot color="purple" /> Laptop A → Mobil B
        <LegendDot color="red" /> Omvei rundt nedet K3
        <span className="ml-auto">K = core-ruter (kjernen)</span>
      </div>
    </div>
  );
}

function NodeShape({ node, down }: { node: Node; down: boolean }) {
  // Laptop (edge): rektangel med liten skjerm og tastatur-stripe
  if (node.kind === "laptop") {
    return (
      <g opacity={down ? 0.4 : 1}>
        <rect
          x={node.x - 18}
          y={node.y - 14}
          width={36}
          height={22}
          rx={2}
          className="fill-card stroke-amber-500"
          strokeWidth={2}
        />
        <rect
          x={node.x - 14}
          y={node.y - 10}
          width={28}
          height={14}
          rx={1}
          className="fill-amber-500/20"
        />
        <rect
          x={node.x - 22}
          y={node.y + 8}
          width={44}
          height={4}
          rx={1}
          className="fill-card stroke-amber-500"
          strokeWidth={1.5}
        />
        <text
          x={node.x}
          y={node.y + 26}
          textAnchor="middle"
          className="fill-foreground text-[10px] font-semibold"
        >
          {node.label}
        </text>
        {node.sublabel && (
          <text
            x={node.x}
            y={node.y + 38}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px]"
          >
            {node.sublabel}
          </text>
        )}
      </g>
    );
  }

  // Mobil (edge): smal avrundet rektangel
  if (node.kind === "phone") {
    return (
      <g opacity={down ? 0.4 : 1}>
        <rect
          x={node.x - 9}
          y={node.y - 18}
          width={18}
          height={32}
          rx={3}
          className="fill-card stroke-amber-500"
          strokeWidth={2}
        />
        <rect
          x={node.x - 6}
          y={node.y - 14}
          width={12}
          height={20}
          rx={1}
          className="fill-amber-500/20"
        />
        <circle cx={node.x} cy={node.y + 10} r={1.4} className="fill-amber-500" />
        <text
          x={node.x}
          y={node.y + 28}
          textAnchor="middle"
          className="fill-foreground text-[10px] font-semibold"
        >
          {node.label}
        </text>
        {node.sublabel && (
          <text
            x={node.x}
            y={node.y + 40}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px]"
          >
            {node.sublabel}
          </text>
        )}
      </g>
    );
  }

  // Server (edge): tårn med flere "skuffer"
  if (node.kind === "server") {
    return (
      <g opacity={down ? 0.4 : 1}>
        <rect
          x={node.x - 16}
          y={node.y - 22}
          width={32}
          height={44}
          rx={2}
          className="fill-card stroke-success"
          strokeWidth={2}
        />
        <rect
          x={node.x - 12}
          y={node.y - 17}
          width={24}
          height={6}
          rx={1}
          className="fill-success/15"
        />
        <rect
          x={node.x - 12}
          y={node.y - 8}
          width={24}
          height={6}
          rx={1}
          className="fill-success/15"
        />
        <rect
          x={node.x - 12}
          y={node.y + 1}
          width={24}
          height={6}
          rx={1}
          className="fill-success/15"
        />
        <rect
          x={node.x - 12}
          y={node.y + 10}
          width={24}
          height={6}
          rx={1}
          className="fill-success/15"
        />
        <circle cx={node.x - 8} cy={node.y - 14} r={1.2} className="fill-success" />
        <circle cx={node.x - 8} cy={node.y - 5} r={1.2} className="fill-success" />
        <circle cx={node.x - 8} cy={node.y + 4} r={1.2} className="fill-success" />
        <circle cx={node.x - 8} cy={node.y + 13} r={1.2} className="fill-success" />
        <text
          x={node.x}
          y={node.y + 36}
          textAnchor="middle"
          className="fill-foreground text-[10px] font-semibold"
        >
          {node.label}
        </text>
        {node.sublabel && (
          <text
            x={node.x}
            y={node.y + 48}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px]"
          >
            {node.sublabel}
          </text>
        )}
      </g>
    );
  }

  // Aksess-ruter: liten avrundet boks med "antenne-prikk"
  if (node.kind === "access") {
    return (
      <g opacity={down ? 0.4 : 1}>
        <rect
          x={node.x - 14}
          y={node.y - 10}
          width={28}
          height={20}
          rx={4}
          className="fill-card stroke-muted-foreground/70"
          strokeWidth={1.8}
        />
        <circle cx={node.x - 6} cy={node.y} r={1.4} className="fill-muted-foreground" />
        <circle cx={node.x} cy={node.y} r={1.4} className="fill-muted-foreground" />
        <circle cx={node.x + 6} cy={node.y} r={1.4} className="fill-muted-foreground" />
        <line
          x1={node.x}
          y1={node.y - 10}
          x2={node.x}
          y2={node.y - 16}
          className="stroke-muted-foreground/70"
          strokeWidth={1.5}
        />
        <circle cx={node.x} cy={node.y - 18} r={1.6} className="fill-muted-foreground" />
        <text
          x={node.x}
          y={node.y + 24}
          textAnchor="middle"
          className="fill-foreground text-[9px] font-medium"
        >
          {node.label}
        </text>
        {node.sublabel && (
          <text
            x={node.x}
            y={node.y + 34}
            textAnchor="middle"
            className="fill-muted-foreground text-[8px]"
          >
            {node.sublabel}
          </text>
        )}
      </g>
    );
  }

  // Core-ruter: hexagon med bokstav-merkelapp
  return (
    <g opacity={down ? 0.35 : 1}>
      {down && (
        <circle
          cx={node.x}
          cy={node.y}
          r={26}
          className="fill-destructive/10 stroke-destructive/40"
          strokeDasharray="3 2"
          strokeWidth={1.5}
        />
      )}
      <polygon
        points={hexPoints(node.x, node.y, 17)}
        className={down ? "fill-muted stroke-destructive" : "fill-brand/15 stroke-brand"}
        strokeWidth={2}
      />
      <text
        x={node.x}
        y={node.y + 4}
        textAnchor="middle"
        className={`text-[11px] font-bold ${down ? "fill-destructive" : "fill-brand"}`}
      >
        {node.label}
      </text>
      {down && (
        <text
          x={node.x}
          y={node.y + 36}
          textAnchor="middle"
          className="fill-destructive text-[9px] font-semibold"
        >
          NEDE
        </text>
      )}
    </g>
  );
}

function LegendDot({ color }: { color: Step["color"] }) {
  return <span className={`inline-block w-2 h-2 rounded-full ${BG_CLASS[color]}`} />;
}

function nodeById(id: NodeId): Node {
  return NODES.find((n) => n.id === id)!;
}

function pathToEdges(path: NodeId[]): [NodeId, NodeId][] {
  const out: [NodeId, NodeId][] = [];
  for (let i = 0; i < path.length - 1; i++) out.push([path[i], path[i + 1]]);
  return out;
}

function packetPosition(path: NodeId[], progress: number): { x: number; y: number } | null {
  if (path.length < 2) return null;
  const segments = path.length - 1;
  const t = Math.min(progress, 0.999) * segments;
  const segIdx = Math.floor(t);
  const segT = t - segIdx;
  const a = nodeById(path[segIdx]);
  const b = nodeById(path[segIdx + 1]);
  return {
    x: a.x + (b.x - a.x) * segT,
    y: a.y + (b.y - a.y) * segT,
  };
}

function hexPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(" ");
}
