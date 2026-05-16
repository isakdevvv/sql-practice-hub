import { useMemo, useRef, useState } from "react";
import { RotateCcw, Play, Lightbulb, Dices } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv visualisering for sannsynlighet.
// Fem moduser:
//   1. Sannsynlighetstre — myntkast (2 og 3) og kuler-fra-urne
//   2. Venn-diagram — slidere for P(A), P(B), P(A ∩ B); avledede mål live
//   3. Monty Hall — 3 dører, simulering av 1000 runder
//   4. Bursdagsparadokset — eksakt P(ingen delt bursdag) for n personer
//   5. Bayes / konfusjonstabell — 10 000 pasienter, slidere for prevalens etc.
// SVG-basert, Tailwind, lucide-react. Norsk tekst.
// --------------------------------------------------------------------------

type Mode = "tre" | "venn" | "monty" | "bursdag" | "bayes";

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "tre", label: "Sannsynlighetstre", sub: "myntkast og urne" },
  { id: "venn", label: "Venn-diagram", sub: "P(A), P(B), snitt og union" },
  { id: "monty", label: "Monty Hall", sub: "1000 trials — bytt eller bli" },
  { id: "bursdag", label: "Bursdagsparadoks", sub: "n=23 → 50 %" },
  { id: "bayes", label: "Bayes-grid", sub: "10 000 pasienter" },
];

export function ProbabilityVisualizer() {
  const [mode, setMode] = useState<Mode>("tre");

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Topp-bar med modus-velger */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              Sannsynlighet — eksperimentér med trær, Venn, Monty Hall, bursdag og Bayes
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                mode === m.id
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border hover:bg-muted"
              }`}
              title={m.sub}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modus-innhold */}
      <div className="p-5 bg-background">
        {mode === "tre" && <TreMode />}
        {mode === "venn" && <VennMode />}
        {mode === "monty" && <MontyMode />}
        {mode === "bursdag" && <BursdagMode />}
        {mode === "bayes" && <BayesMode />}
      </div>
    </div>
  );
}

// ============================================================================
// MODUS 1: Sannsynlighetstre
// ============================================================================

type TreeExperiment = "coin2" | "coin3" | "urne";

type TreeNode = {
  id: string;
  label: string;        // hva noden representerer (kort)
  depth: number;
  x: number;
  y: number;
  /** edge fra forelder: betinget P og etikett */
  edgeProb?: number;
  edgeLabel?: string;
  parentId?: string;
  pathProb: number;     // produkt fra rot
  outcomeKey?: string;  // f.eks. "KMK" — bare for løv
  isLeaf?: boolean;
};

const EXPERIMENTS: { id: TreeExperiment; label: string; intuisjon: string }[] = [
  {
    id: "coin2",
    label: "To myntkast",
    intuisjon:
      "Fire like sannsynlige utfall: KK, KM, MK, MM — hver med 1/4. Trekk og du ser strukturen 2·2 = 4.",
  },
  {
    id: "coin3",
    label: "Tre myntkast",
    intuisjon:
      "Åtte utfall, hver med 1/8. P(akkurat én krone) = 3/8, P(minst én krone) = 7/8 = 1 − 1/8.",
  },
  {
    id: "urne",
    label: "Trekk 2 kuler uten tilbakelegging",
    intuisjon:
      "Urne: 3 røde, 2 blå. Andre trekk er BETINGET på første — derfor er det 3/5·2/4 ≠ (3/5)².",
  },
];

function TreMode() {
  const [exp, setExp] = useState<TreeExperiment>("coin2");
  const [highlightOutcome, setHighlightOutcome] = useState<string | null>(null);

  const { nodes, edges, leaves, width, height } = useMemo(
    () => buildTree(exp),
    [exp]
  );

  // For hver mulig "hendelse" lager vi en kort meny — f.eks. "minst én krone"
  const eventOptions = useMemo(() => buildEventOptions(exp, leaves), [exp, leaves]);

  const [eventId, setEventId] = useState<string>("all");

  const highlightedLeaves = useMemo(() => {
    if (eventId === "all") return new Set<string>();
    const ev = eventOptions.find((e) => e.id === eventId);
    if (!ev) return new Set<string>();
    return new Set(ev.leafKeys);
  }, [eventId, eventOptions]);

  const totalProb = useMemo(() => {
    if (highlightedLeaves.size === 0) return 1;
    return leaves
      .filter((l) => highlightedLeaves.has(l.outcomeKey!))
      .reduce((s, l) => s + l.pathProb, 0);
  }, [leaves, highlightedLeaves]);

  // Path-set for highlighting (alle ancestor-IDer for highlighta løv)
  const highlightedNodeIds = useMemo(() => {
    const set = new Set<string>();
    if (highlightedLeaves.size === 0) return set;
    for (const leaf of leaves) {
      if (highlightedLeaves.has(leaf.outcomeKey!)) {
        let cur: TreeNode | undefined = leaf;
        while (cur) {
          set.add(cur.id);
          cur = cur.parentId ? nodes.find((n) => n.id === cur!.parentId) : undefined;
        }
      }
    }
    return set;
  }, [highlightedLeaves, leaves, nodes]);

  // Når brukeren klikker et løv direkte
  const onLeafClick = (key: string) => {
    setHighlightOutcome((cur) => (cur === key ? null : key));
  };

  return (
    <div className="space-y-4">
      {/* Eksperiment-velger */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Eksperiment:</span>
        {EXPERIMENTS.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => {
              setExp(e.id);
              setEventId("all");
              setHighlightOutcome(null);
            }}
            className={`px-2.5 py-1 rounded text-xs border transition-colors ${
              exp === e.id
                ? "bg-brand text-brand-foreground border-brand"
                : "border-border hover:bg-muted"
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>

      {/* Hendelses-velger */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Marker hendelse:</span>
        <select
          value={eventId}
          onChange={(e) => {
            setEventId(e.target.value);
            setHighlightOutcome(null);
          }}
          className="text-xs border border-border bg-card rounded px-2 py-1"
        >
          <option value="all">— ingen —</option>
          {eventOptions.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.label}
            </option>
          ))}
        </select>
        {eventId !== "all" && (
          <span className="text-xs font-mono text-brand">
            P = {fmtFrac(totalProb)} ≈ {totalProb.toFixed(4)}
          </span>
        )}
      </div>

      {/* SVG-tre */}
      <div className="overflow-x-auto rounded-xl border border-border bg-muted/20 p-3">
        <svg width={width} height={height} className="block mx-auto">
          {/* Kanter */}
          {edges.map((e) => {
            const onPath =
              highlightedNodeIds.has(e.from.id) && highlightedNodeIds.has(e.to.id);
            const clickPath =
              highlightOutcome &&
              isAncestorOfLeaf(e.from.id, highlightOutcome, leaves, nodes) &&
              isAncestorOfLeaf(e.to.id, highlightOutcome, leaves, nodes);
            const active = onPath || clickPath;
            return (
              <g key={`${e.from.id}-${e.to.id}`}>
                <line
                  x1={e.from.x}
                  y1={e.from.y}
                  x2={e.to.x}
                  y2={e.to.y}
                  stroke={active ? "rgb(var(--brand) / 1)" : "currentColor"}
                  strokeOpacity={active ? 1 : 0.35}
                  strokeWidth={active ? 2.5 : 1.5}
                  className="text-muted-foreground"
                />
                <text
                  x={(e.from.x + e.to.x) / 2 + 6}
                  y={(e.from.y + e.to.y) / 2}
                  fontSize="10"
                  className="font-mono fill-current text-foreground"
                  textAnchor="start"
                >
                  {e.to.edgeLabel}
                </text>
              </g>
            );
          })}
          {/* Noder */}
          {nodes.map((n) => {
            const isLeaf = !!n.isLeaf;
            const isHigh =
              highlightedNodeIds.has(n.id) ||
              (highlightOutcome && n.outcomeKey === highlightOutcome);
            return (
              <g
                key={n.id}
                onClick={() => isLeaf && onLeafClick(n.outcomeKey!)}
                style={{ cursor: isLeaf ? "pointer" : "default" }}
              >
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={isLeaf ? 16 : 8}
                  className={
                    isHigh
                      ? "fill-brand stroke-brand"
                      : isLeaf
                        ? "fill-card stroke-muted-foreground"
                        : "fill-muted-foreground/30 stroke-muted-foreground"
                  }
                  strokeWidth={1.5}
                />
                {isLeaf ? (
                  <>
                    <text
                      x={n.x}
                      y={n.y - 2}
                      fontSize="10"
                      textAnchor="middle"
                      className={`font-mono ${isHigh ? "fill-brand-foreground" : "fill-current text-foreground"}`}
                    >
                      {n.outcomeKey}
                    </text>
                    <text
                      x={n.x}
                      y={n.y + 9}
                      fontSize="8"
                      textAnchor="middle"
                      className={`font-mono ${isHigh ? "fill-brand-foreground" : "fill-muted-foreground"}`}
                    >
                      {fmtFrac(n.pathProb)}
                    </text>
                  </>
                ) : n.depth === 0 ? (
                  <text
                    x={n.x}
                    y={n.y - 14}
                    fontSize="10"
                    textAnchor="middle"
                    className="fill-current text-muted-foreground"
                  >
                    start
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Intuisjon */}
      <Intuition>
        {EXPERIMENTS.find((e) => e.id === exp)!.intuisjon}{" "}
        Klikk på et løv for å markere én sti, eller velg en sammensatt hendelse over.
      </Intuition>
    </div>
  );
}

function isAncestorOfLeaf(
  nodeId: string,
  leafKey: string,
  leaves: TreeNode[],
  nodes: TreeNode[]
): boolean {
  const leaf = leaves.find((l) => l.outcomeKey === leafKey);
  if (!leaf) return false;
  let cur: TreeNode | undefined = leaf;
  while (cur) {
    if (cur.id === nodeId) return true;
    cur = cur.parentId ? nodes.find((n) => n.id === cur!.parentId) : undefined;
  }
  return false;
}

type EventOption = { id: string; label: string; leafKeys: string[] };

function buildEventOptions(exp: TreeExperiment, leaves: TreeNode[]): EventOption[] {
  const keys = leaves.map((l) => l.outcomeKey!);
  if (exp === "coin2") {
    return [
      { id: "atleast1K", label: "Minst én krone", leafKeys: keys.filter((k) => k.includes("K")) },
      { id: "exactly1K", label: "Akkurat én krone", leafKeys: keys.filter((k) => k.split("").filter((c) => c === "K").length === 1) },
      { id: "noK", label: "Ingen krone", leafKeys: keys.filter((k) => !k.includes("K")) },
    ];
  }
  if (exp === "coin3") {
    return [
      { id: "atleast1K", label: "Minst én krone", leafKeys: keys.filter((k) => k.includes("K")) },
      { id: "exactly2K", label: "Akkurat to kroner", leafKeys: keys.filter((k) => k.split("").filter((c) => c === "K").length === 2) },
      { id: "allK", label: "Tre kroner", leafKeys: keys.filter((k) => k === "KKK") },
    ];
  }
  // urne
  return [
    { id: "twoRed", label: "Begge røde (RR)", leafKeys: keys.filter((k) => k === "RR") },
    { id: "twoBlue", label: "Begge blå (BB)", leafKeys: keys.filter((k) => k === "BB") },
    { id: "mix", label: "Én av hver (RB eller BR)", leafKeys: keys.filter((k) => k === "RB" || k === "BR") },
    { id: "secondRed", label: "Andre trekk er rød", leafKeys: keys.filter((k) => k.endsWith("R")) },
  ];
}

function buildTree(exp: TreeExperiment): {
  nodes: TreeNode[];
  edges: { from: TreeNode; to: TreeNode }[];
  leaves: TreeNode[];
  width: number;
  height: number;
} {
  // Definer barn per node.
  let depth: number;
  let labelsAt: (path: string) => { label: string; key: string; p: number }[];

  if (exp === "coin2") {
    depth = 2;
    labelsAt = () => [
      { label: "K (kron)", key: "K", p: 0.5 },
      { label: "M (mynt)", key: "M", p: 0.5 },
    ];
  } else if (exp === "coin3") {
    depth = 3;
    labelsAt = () => [
      { label: "K", key: "K", p: 0.5 },
      { label: "M", key: "M", p: 0.5 },
    ];
  } else {
    // urne: 3 røde + 2 blå, trekk to ganger uten tilbakelegging
    depth = 2;
    labelsAt = (path) => {
      let red = 3,
        blue = 2;
      for (const ch of path) {
        if (ch === "R") red--;
        else if (ch === "B") blue--;
      }
      const total = red + blue;
      const out: { label: string; key: string; p: number }[] = [];
      if (red > 0) out.push({ label: `R (${red}/${total})`, key: "R", p: red / total });
      if (blue > 0) out.push({ label: `B (${blue}/${total})`, key: "B", p: blue / total });
      return out;
    };
  }

  // Bygg bredde-først
  const allLevels: TreeNode[][] = [];
  const root: TreeNode = {
    id: "root",
    label: "Ω",
    depth: 0,
    x: 0,
    y: 0,
    pathProb: 1,
  };
  allLevels.push([root]);

  for (let d = 0; d < depth; d++) {
    const next: TreeNode[] = [];
    for (const parent of allLevels[d]) {
      const path = parent.outcomeKey || "";
      const children = labelsAt(path);
      for (const c of children) {
        const node: TreeNode = {
          id: `${parent.id}-${c.key}`,
          label: c.label,
          depth: d + 1,
          x: 0,
          y: 0,
          edgeProb: c.p,
          edgeLabel: `${c.label} · ${fmtFrac(c.p)}`,
          parentId: parent.id,
          pathProb: parent.pathProb * c.p,
          outcomeKey: (parent.outcomeKey || "") + c.key,
          isLeaf: d + 1 === depth,
        };
        next.push(node);
      }
    }
    allLevels.push(next);
  }

  // Layout: x basert på posisjon på leaf-nivå
  const leaves = allLevels[depth];
  const W = Math.max(680, leaves.length * 90);
  const H = 80 + depth * 90;
  const margin = 40;

  leaves.forEach((leaf, i) => {
    leaf.x = margin + (leaves.length === 1 ? W / 2 : (i * (W - 2 * margin)) / (leaves.length - 1));
    leaf.y = H - 40;
  });

  // Plasser indre noder som gjennomsnitt av barnas x
  for (let d = depth - 1; d >= 0; d--) {
    for (const n of allLevels[d]) {
      const kids = allLevels[d + 1].filter((c) => c.parentId === n.id);
      n.x = kids.reduce((s, k) => s + k.x, 0) / kids.length;
      n.y = 40 + d * 90;
    }
  }

  const nodes = allLevels.flat();
  const edges = nodes
    .filter((n) => n.parentId)
    .map((n) => ({ from: nodes.find((p) => p.id === n.parentId)!, to: n }));

  return { nodes, edges, leaves, width: W, height: H };
}

function fmtFrac(p: number): string {
  // Vis som fin brøk hvis enkel; ellers 4 desimaler
  if (Math.abs(p - 0.5) < 1e-9) return "1/2";
  if (Math.abs(p - 0.25) < 1e-9) return "1/4";
  if (Math.abs(p - 0.125) < 1e-9) return "1/8";
  if (Math.abs(p - 0.375) < 1e-9) return "3/8";
  if (Math.abs(p - 0.75) < 1e-9) return "3/4";
  if (Math.abs(p - 0.875) < 1e-9) return "7/8";
  if (Math.abs(p - 3 / 5) < 1e-9) return "3/5";
  if (Math.abs(p - 2 / 5) < 1e-9) return "2/5";
  if (Math.abs(p - 2 / 4) < 1e-9) return "2/4";
  if (Math.abs(p - 3 / 4) < 1e-9) return "3/4";
  if (Math.abs(p - 1 / 4) < 1e-9) return "1/4";
  if (Math.abs(p - 3 / 10) < 1e-9) return "3/10";
  if (Math.abs(p - 1 / 10) < 1e-9) return "1/10";
  if (Math.abs(p - 6 / 20) < 1e-9) return "3/10";
  if (Math.abs(p - 1) < 1e-9) return "1";
  // Prøv å finne brøk med liten nevner
  for (let den = 2; den <= 60; den++) {
    const num = Math.round(p * den);
    if (Math.abs(num / den - p) < 1e-9) return `${num}/${den}`;
  }
  return p.toFixed(3);
}

// ============================================================================
// MODUS 2: Venn-diagram
// ============================================================================

function VennMode() {
  const [pA, setPA] = useState(0.4);
  const [pB, setPB] = useState(0.3);
  const [pAB, setPAB] = useState(0.1);

  // Tillatelig: max(0, pA+pB-1) ≤ pAB ≤ min(pA, pB)
  const pABmin = Math.max(0, pA + pB - 1);
  const pABmax = Math.min(pA, pB);
  const pABclamped = Math.min(Math.max(pAB, pABmin), pABmax);

  const pAonly = pA - pABclamped;
  const pBonly = pB - pABclamped;
  const pUnion = pA + pB - pABclamped;
  const pNone = 1 - pUnion;
  const pAgivenB = pB > 0 ? pABclamped / pB : NaN;
  const pBgivenA = pA > 0 ? pABclamped / pA : NaN;

  const valid = pAB >= pABmin - 1e-9 && pAB <= pABmax + 1e-9;

  // Geometri: to sirkler med fast radius, overlap basert på pAB
  const R = 80;
  const cx = 220;
  const cy = 130;
  // Avstanden mellom sentre styres av pAB / min(pA, pB) — ren visuell heuristikk
  const overlapFrac = pABmax > 0 ? pABclamped / pABmax : 0;
  // Når overlapFrac=1 (helt overlapp): d=0. Når overlapFrac=0: d=2R (ikke overlapp).
  const d = 2 * R * (1 - overlapFrac);
  const ax = cx - d / 2;
  const bx = cx + d / 2;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Venn-SVG */}
        <div className="rounded-xl border border-border bg-muted/20 p-3 overflow-x-auto">
          <svg width={440} height={260} className="block mx-auto">
            {/* Universet */}
            <rect
              x={10}
              y={10}
              width={420}
              height={240}
              className="fill-card stroke-muted-foreground"
              strokeWidth={1}
              opacity={0.4}
            />
            <text x={20} y={26} fontSize="10" className="fill-current text-muted-foreground">
              Ω (univers, P = 1)
            </text>
            {/* A */}
            <circle
              cx={ax}
              cy={cy}
              r={R}
              fill="rgb(59 130 246 / 0.30)"
              stroke="rgb(59 130 246)"
              strokeWidth={1.5}
            />
            {/* B */}
            <circle
              cx={bx}
              cy={cy}
              r={R}
              fill="rgb(244 63 94 / 0.30)"
              stroke="rgb(244 63 94)"
              strokeWidth={1.5}
            />
            {/* Etiketter */}
            <text
              x={ax - R / 2}
              y={cy - R - 5}
              fontSize="12"
              className="font-mono fill-current text-foreground"
            >
              A
            </text>
            <text
              x={bx + R / 2 - 6}
              y={cy - R - 5}
              fontSize="12"
              className="font-mono fill-current text-foreground"
            >
              B
            </text>

            {/* Verdier inni */}
            <text
              x={ax - R / 2 - 8}
              y={cy + 4}
              fontSize="11"
              textAnchor="middle"
              className="font-mono fill-current text-foreground"
            >
              {pAonly.toFixed(2)}
            </text>
            <text
              x={(ax + bx) / 2}
              y={cy + 4}
              fontSize="11"
              textAnchor="middle"
              className="font-mono fill-current text-foreground font-semibold"
            >
              {pABclamped.toFixed(2)}
            </text>
            <text
              x={bx + R / 2 + 8}
              y={cy + 4}
              fontSize="11"
              textAnchor="middle"
              className="font-mono fill-current text-foreground"
            >
              {pBonly.toFixed(2)}
            </text>
            <text
              x={400}
              y={240}
              fontSize="10"
              textAnchor="end"
              className="font-mono fill-current text-muted-foreground"
            >
              P(ingen) = {pNone.toFixed(2)}
            </text>
          </svg>
        </div>

        {/* Slidere + avledede mål */}
        <div className="space-y-3">
          <SliderRow label="P(A)" value={pA} onChange={setPA} min={0} max={1} step={0.01} accent="blue" />
          <SliderRow label="P(B)" value={pB} onChange={setPB} min={0} max={1} step={0.01} accent="rose" />
          <SliderRow
            label="P(A ∩ B)"
            value={pAB}
            onChange={setPAB}
            min={0}
            max={1}
            step={0.01}
            accent="brand"
          />
          {!valid && (
            <div className="text-xs text-amber-600 dark:text-amber-400">
              Ugyldig: P(A ∩ B) må være mellom {pABmin.toFixed(2)} og {pABmax.toFixed(2)}.
              (max{"{"}0, P(A)+P(B)−1{"}"} ≤ P(A ∩ B) ≤ min{"{"}P(A), P(B){"}"})
            </div>
          )}
          <div className="rounded-lg border border-border bg-muted/20 p-3 font-mono text-xs space-y-1">
            <div>
              P(A ∪ B) = P(A) + P(B) − P(A ∩ B) = <span className="text-brand">{pUnion.toFixed(3)}</span>
            </div>
            <div>
              P(A | B) = P(A ∩ B) / P(B) ={" "}
              <span className="text-brand">{Number.isFinite(pAgivenB) ? pAgivenB.toFixed(3) : "—"}</span>
            </div>
            <div>
              P(B | A) = P(A ∩ B) / P(A) ={" "}
              <span className="text-brand">{Number.isFinite(pBgivenA) ? pBgivenA.toFixed(3) : "—"}</span>
            </div>
            <div className="pt-1 text-muted-foreground">
              Uavhengig hvis P(A ∩ B) = P(A)·P(B) ={" "}
              <span className="text-foreground">{(pA * pB).toFixed(3)}</span>
              {Math.abs(pABclamped - pA * pB) < 0.005 ? " — ja!" : ""}
            </div>
          </div>
        </div>
      </div>

      <Intuition>
        Snittet (lilla midtfelt) er P(A og B). Når sirklene ikke overlapper i det hele tatt er
        hendelsene <em>disjunkte</em> — men ikke uavhengige! Uavhengighet krever akkurat at
        P(A ∩ B) = P(A)·P(B), som er en helt annen geometri.
      </Intuition>
    </div>
  );
}

function SliderRow({
  label,
  value,
  onChange,
  min,
  max,
  step,
  accent,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
  accent: "blue" | "rose" | "brand";
}) {
  const color =
    accent === "blue" ? "accent-blue-500" : accent === "rose" ? "accent-rose-500" : "accent-brand";
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-mono">{label}</span>
        <span className="font-mono text-muted-foreground">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full ${color}`}
      />
    </div>
  );
}

// ============================================================================
// MODUS 3: Monty Hall
// ============================================================================

type MontyState = {
  cars: number[];          // hvor bilen er i hver runde
  picks: number[];         // hva spilleren valgte først
  opened: number[];        // hvilken dør vert åpnet
  stayWins: number;
  switchWins: number;
  done: number;
};

function MontyMode() {
  const [stage, setStage] = useState<"choose" | "decide" | "result">("choose");
  const [pick, setPick] = useState<number | null>(null);
  const [opened, setOpened] = useState<number | null>(null);
  const [decision, setDecision] = useState<"stay" | "switch" | null>(null);
  const [seed, setSeed] = useState(0);

  // Simulering
  const [simStats, setSimStats] = useState<{ stay: number; swap: number; n: number }>({
    stay: 0,
    swap: 0,
    n: 0,
  });
  const [simRunning, setSimRunning] = useState(false);

  // Tilbakestill manuelt spill
  const resetGame = () => {
    setStage("choose");
    setPick(null);
    setOpened(null);
    setDecision(null);
    setSeed((s) => s + 1);
  };

  // Bilen sin posisjon regenereres når seed endres (ny runde)
  const carDoorActive = useMemo(() => Math.floor(Math.random() * 3), [seed]);

  const onPick = (i: number) => {
    if (stage !== "choose") return;
    setPick(i);
    // Vert åpner en av de andre dørene som ikke har bilen
    const candidates = [0, 1, 2].filter((d) => d !== i && d !== carDoorActive);
    const openD = candidates[Math.floor(Math.random() * candidates.length)];
    setOpened(openD);
    setStage("decide");
  };

  const onDecide = (d: "stay" | "switch") => {
    setDecision(d);
    setStage("result");
  };

  const finalDoor = useMemo(() => {
    if (pick === null || opened === null) return null;
    if (decision === "stay") return pick;
    if (decision === "switch") return [0, 1, 2].find((d) => d !== pick && d !== opened)!;
    return null;
  }, [pick, opened, decision]);

  const won = finalDoor !== null && finalDoor === carDoorActive;

  // Kjør 1000 simulering med animasjon
  const runSimulation = () => {
    setSimRunning(true);
    setSimStats({ stay: 0, swap: 0, n: 0 });
    const TOTAL = 1000;
    const BATCH = 25;
    let i = 0;
    let stay = 0;
    let swap = 0;
    const tick = () => {
      const end = Math.min(i + BATCH, TOTAL);
      for (; i < end; i++) {
        const car = Math.floor(Math.random() * 3);
        const guess = Math.floor(Math.random() * 3);
        // Stay vinner hvis guess === car
        if (guess === car) stay++;
        // Switch vinner hvis guess !== car (verten åpner den andre tomme; bytt → bilen)
        else swap++;
      }
      setSimStats({ stay, swap, n: i });
      if (i < TOTAL) {
        requestAnimationFrame(tick);
      } else {
        setSimRunning(false);
      }
    };
    requestAnimationFrame(tick);
  };

  const resetSim = () => setSimStats({ stay: 0, swap: 0, n: 0 });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        {/* Dører */}
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-muted-foreground">
              {stage === "choose" && "Steg 1 — velg en dør."}
              {stage === "decide" && "Steg 2 — verten åpnet en tom dør. Bytt eller bli?"}
              {stage === "result" && (won ? "Du vant bilen!" : "Bommert — geit bak døra.")}
            </div>
            <button
              type="button"
              onClick={resetGame}
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
            >
              <RotateCcw className="h-3 w-3" /> Ny runde
            </button>
          </div>
          <div className="flex justify-center gap-4">
            {[0, 1, 2].map((i) => {
              const isPicked = pick === i;
              const isOpened = opened === i;
              const isFinal = finalDoor === i && stage === "result";
              const reveal = stage === "result" || isOpened;
              const hasCar = i === carDoorActive;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onPick(i)}
                  disabled={stage !== "choose"}
                  className={`relative w-24 h-32 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                    isOpened
                      ? "bg-muted border-muted-foreground/40 text-muted-foreground"
                      : isFinal && won
                        ? "bg-emerald-500/20 border-emerald-500"
                        : isFinal && !won
                          ? "bg-rose-500/20 border-rose-500"
                          : isPicked
                            ? "bg-brand/20 border-brand"
                            : "bg-card border-border hover:border-brand/50"
                  } ${stage === "choose" ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div className="text-xs text-muted-foreground">Dør {i + 1}</div>
                  <div className="text-2xl mt-2">
                    {reveal ? (hasCar ? "🚗" : "🐐") : "🚪"}
                  </div>
                  {isPicked && stage !== "result" && (
                    <div className="absolute -top-2 text-[10px] bg-brand text-brand-foreground px-1.5 rounded">
                      ditt valg
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {stage === "decide" && (
            <div className="mt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => onDecide("stay")}
                className="px-4 py-2 rounded-md border border-border bg-card text-sm hover:bg-muted"
              >
                Bli (behold dør {pick !== null ? pick + 1 : ""})
              </button>
              <button
                type="button"
                onClick={() => onDecide("switch")}
                className="px-4 py-2 rounded-md bg-brand text-brand-foreground text-sm hover:opacity-90"
              >
                Bytt
              </button>
            </div>
          )}
        </div>

        {/* Simulering */}
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              1000-trials simulering
            </div>
            <Dices className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <SimBar
              label="Bli"
              wins={simStats.stay}
              total={Math.max(1, simStats.n)}
              color="bg-slate-500"
            />
            <SimBar
              label="Bytt"
              wins={simStats.swap}
              total={Math.max(1, simStats.n)}
              color="bg-brand"
            />
            <div className="text-xs text-muted-foreground font-mono">
              Spilt: {simStats.n} / 1000
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={runSimulation}
                disabled={simRunning}
                className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-brand text-brand-foreground hover:opacity-90 disabled:opacity-50"
              >
                <Play className="h-3 w-3" /> Kjør 1000
              </button>
              <button
                type="button"
                onClick={resetSim}
                disabled={simRunning}
                className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border hover:bg-muted"
              >
                <RotateCcw className="h-3 w-3" /> Nullstill
              </button>
            </div>
          </div>
        </div>
      </div>

      <Intuition>
        Tenk på det som <strong>100 dører</strong>. Du velger 1, verten åpner 98 tomme. Den ene
        gjenværende døra du <em>ikke</em> valgte først har nå all sannsynligheten som de 99 andre
        delte — 99/100. I 3-dørs-versjonen er det 2/3 vs 1/3. Bytt bryter ned barrieren.
      </Intuition>
    </div>
  );
}

function SimBar({
  label,
  wins,
  total,
  color,
}: {
  label: string;
  wins: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (wins / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-mono mb-1">
        <span>{label}</span>
        <span>
          {wins} / {total} = {pct.toFixed(1)}%
        </span>
      </div>
      <div className="h-3 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ============================================================================
// MODUS 4: Bursdagsparadokset
// ============================================================================

function BursdagMode() {
  const [n, setN] = useState(23);

  const curve = useMemo(() => {
    // P(ingen delt) = 365! / (365^n · (365−n)!) ; her produkt-form
    const points: { n: number; pShare: number; pNone: number }[] = [];
    let pNone = 1;
    for (let k = 1; k <= 60; k++) {
      if (k === 1) pNone = 1;
      else pNone *= (365 - (k - 1)) / 365;
      points.push({ n: k, pShare: 1 - pNone, pNone });
    }
    return points;
  }, []);

  const current = curve.find((p) => p.n === n)!;

  // SVG-kurve
  const W = 480;
  const H = 240;
  const padL = 40;
  const padR = 16;
  const padT = 20;
  const padB = 32;
  const xs = (k: number) => padL + ((k - 1) / 59) * (W - padL - padR);
  const ys = (p: number) => padT + (1 - p) * (H - padT - padB);

  const path = curve
    .map((p, i) => `${i === 0 ? "M" : "L"}${xs(p.n).toFixed(1)},${ys(p.pShare).toFixed(1)}`)
    .join(" ");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <svg width={W} height={H} className="block mx-auto">
            {/* Akser */}
            <line
              x1={padL}
              y1={H - padB}
              x2={W - padR}
              y2={H - padB}
              className="stroke-muted-foreground"
              strokeWidth={1}
            />
            <line
              x1={padL}
              y1={padT}
              x2={padL}
              y2={H - padB}
              className="stroke-muted-foreground"
              strokeWidth={1}
            />
            {/* y-grid 0.25, 0.5, 0.75 */}
            {[0.25, 0.5, 0.75, 1].map((y) => (
              <g key={y}>
                <line
                  x1={padL}
                  y1={ys(y)}
                  x2={W - padR}
                  y2={ys(y)}
                  className="stroke-muted-foreground"
                  strokeOpacity={0.2}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                <text
                  x={padL - 6}
                  y={ys(y) + 3}
                  fontSize="9"
                  textAnchor="end"
                  className="fill-current text-muted-foreground font-mono"
                >
                  {y.toFixed(2)}
                </text>
              </g>
            ))}
            {/* x ticks */}
            {[10, 20, 23, 30, 40, 50, 60].map((k) => (
              <g key={k}>
                <line
                  x1={xs(k)}
                  y1={H - padB}
                  x2={xs(k)}
                  y2={H - padB + 3}
                  className="stroke-muted-foreground"
                  strokeWidth={1}
                />
                <text
                  x={xs(k)}
                  y={H - padB + 14}
                  fontSize="9"
                  textAnchor="middle"
                  className="fill-current text-muted-foreground font-mono"
                >
                  {k}
                </text>
              </g>
            ))}
            {/* 50%-linje */}
            <line
              x1={padL}
              y1={ys(0.5)}
              x2={xs(23)}
              y2={ys(0.5)}
              className="stroke-amber-500"
              strokeDasharray="4 3"
              strokeWidth={1.2}
            />
            <line
              x1={xs(23)}
              y1={ys(0.5)}
              x2={xs(23)}
              y2={H - padB}
              className="stroke-amber-500"
              strokeDasharray="4 3"
              strokeWidth={1.2}
            />
            <text
              x={xs(23) + 4}
              y={ys(0.5) - 4}
              fontSize="10"
              className="fill-amber-500 font-mono font-semibold"
            >
              n=23 → 50.7%
            </text>
            {/* Kurve */}
            <path
              d={path}
              fill="none"
              stroke="rgb(var(--brand) / 1)"
              strokeWidth={2}
              className="text-brand"
            />
            {/* Current n marker */}
            <circle
              cx={xs(n)}
              cy={ys(current.pShare)}
              r={5}
              className="fill-brand"
            />
            {/* y-label */}
            <text
              x={padL + 4}
              y={padT + 10}
              fontSize="10"
              className="fill-current text-muted-foreground"
            >
              P(minst to delt bursdag)
            </text>
            <text
              x={W - padR}
              y={H - 4}
              fontSize="10"
              textAnchor="end"
              className="fill-current text-muted-foreground"
            >
              n personer
            </text>
          </svg>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono">n personer</span>
              <span className="font-mono text-muted-foreground">{n}</span>
            </div>
            <input
              type="range"
              min={2}
              max={60}
              step={1}
              value={n}
              onChange={(e) => setN(parseInt(e.target.value))}
              className="w-full accent-brand"
            />
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-3 font-mono text-xs space-y-1">
            <div>P(ingen delt) = {current.pNone.toFixed(4)}</div>
            <div>
              P(minst to delt) ={" "}
              <span className="text-brand font-semibold">{current.pShare.toFixed(4)}</span>
            </div>
            <div className="pt-1 text-muted-foreground text-[10px]">
              Formel:
              <br />∏ᵢ₌₁..ₙ₋₁ (365−i)/365
            </div>
          </div>
        </div>
      </div>

      <Intuition>
        Vi spør ikke «deler noen bursdag med <em>meg</em>?» — vi spør «deler <em>noen som helst
        to</em> i gruppa bursdag?». Antall par vokser som n(n−1)/2: ved n=23 er det allerede 253
        par — derfor er overraskelsen lavere når du tegner den ut.
      </Intuition>
    </div>
  );
}

// ============================================================================
// MODUS 5: Bayes-grid
// ============================================================================

function BayesMode() {
  const [prevalens, setPrevalens] = useState(0.01);
  const [sensitivitet, setSensitivitet] = useState(0.99);
  const [spesifisitet, setSpesifisitet] = useState(0.95);

  const POP = 10000;
  const syke = Math.round(POP * prevalens);
  const friske = POP - syke;
  const TP = Math.round(syke * sensitivitet);
  const FN = syke - TP;
  const TN = Math.round(friske * spesifisitet);
  const FP = friske - TN;

  const positive = TP + FP;
  const negative = TN + FN;
  const ppv = positive > 0 ? TP / positive : 0;          // P(syk | T+)
  const npv = negative > 0 ? TN / negative : 0;          // P(frisk | T−)

  // 100x100 grid — 10 000 ruter
  // Vi farger per kategori i rekkefølge: TP (rød), FN (gul), FP (oransje), TN (grønn lys).
  const CELLS = 100;
  const SIZE = 4;
  const total = CELLS * CELLS;

  // Beregn cutoffs i en lineær array av 10 000 ruter
  // Rekkefølge: [syke TP][syke FN][friske FP][friske TN]
  const tpEnd = TP;
  const fnEnd = tpEnd + FN;
  const fpEnd = fnEnd + FP;
  // tnEnd = total
  void total;

  const colorFor = (idx: number): { fill: string; cat: string } => {
    if (idx < tpEnd) return { fill: "#dc2626", cat: "TP" };       // rød: syk + positiv
    if (idx < fnEnd) return { fill: "#fbbf24", cat: "FN" };       // gul: syk + negativ (missed!)
    if (idx < fpEnd) return { fill: "#fb923c", cat: "FP" };       // oransje: frisk + positiv
    return { fill: "#86efac", cat: "TN" };                         // grønn: frisk + negativ
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Grid */}
        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <svg
            width={CELLS * SIZE + 20}
            height={CELLS * SIZE + 20}
            className="block mx-auto"
          >
            {Array.from({ length: CELLS * CELLS }).map((_, idx) => {
              const r = Math.floor(idx / CELLS);
              const c = idx % CELLS;
              const { fill } = colorFor(idx);
              return (
                <rect
                  key={idx}
                  x={10 + c * SIZE}
                  y={10 + r * SIZE}
                  width={SIZE - 0.3}
                  height={SIZE - 0.3}
                  fill={fill}
                />
              );
            })}
          </svg>
          <div className="mt-2 flex flex-wrap gap-3 text-[11px] font-mono">
            <Legend color="#dc2626" label={`TP ${TP}`} />
            <Legend color="#fbbf24" label={`FN ${FN}`} />
            <Legend color="#fb923c" label={`FP ${FP}`} />
            <Legend color="#86efac" label={`TN ${TN}`} />
          </div>
        </div>

        {/* Slidere + tabell */}
        <div className="space-y-3">
          <SliderRow
            label="Prevalens P(S)"
            value={prevalens}
            onChange={setPrevalens}
            min={0.001}
            max={0.5}
            step={0.001}
            accent="brand"
          />
          <SliderRow
            label="Sensitivitet P(T+|S)"
            value={sensitivitet}
            onChange={setSensitivitet}
            min={0.5}
            max={1}
            step={0.005}
            accent="brand"
          />
          <SliderRow
            label="Spesifisitet P(T−|¬S)"
            value={spesifisitet}
            onChange={setSpesifisitet}
            min={0.5}
            max={1}
            step={0.005}
            accent="brand"
          />

          {/* 2x2-tabell */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full text-xs font-mono">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-2 py-1 text-left"></th>
                  <th className="px-2 py-1 text-right">Syk</th>
                  <th className="px-2 py-1 text-right">Frisk</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-2 py-1 text-muted-foreground">T+</td>
                  <td className="px-2 py-1 text-right text-rose-600 font-semibold">{TP}</td>
                  <td className="px-2 py-1 text-right text-orange-500">{FP}</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-2 py-1 text-muted-foreground">T−</td>
                  <td className="px-2 py-1 text-right text-amber-500">{FN}</td>
                  <td className="px-2 py-1 text-right text-emerald-600">{TN}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-3 font-mono text-xs space-y-1">
            <div>
              P(syk | T+) = TP / (TP+FP) ={" "}
              <span className="text-brand font-semibold">{(ppv * 100).toFixed(1)}%</span>
            </div>
            <div>
              P(frisk | T−) = TN / (TN+FN) ={" "}
              <span className="text-brand">{(npv * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      <Intuition>
        Selv med en 99 % sensitiv og 95 % spesifikk test ender bare ca. 16 % av de positive med
        faktisk å være syke når prevalensen er 1 %. Den oransje «falsk positiv»-bunken dominerer
        fordi friske er så mange flere. Skru opp prevalensen og se hvordan rød/oransje-balansen
        snur.
      </Intuition>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-1">
      <span
        className="inline-block w-3 h-3 rounded-sm border border-border"
        style={{ backgroundColor: color }}
      />
      {label}
    </div>
  );
}

// ============================================================================
// Felles intuisjon-panel
// ============================================================================

function Intuition({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-brand/30 bg-brand/5 p-3 flex items-start gap-2">
      <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
      <div className="text-xs text-foreground">
        <span className="font-semibold uppercase tracking-wider text-brand text-[10px]">
          Intuisjon
        </span>
        <div className="mt-1 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
