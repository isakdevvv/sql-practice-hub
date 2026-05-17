import { useMemo, useState } from "react";
import {
  type DistKind,
  type DistParams,
  distMoments,
  distPdf,
  distSample,
  histogram,
  mulberry32,
  normalPdf,
} from "./distUtils";

/**
 * DistributionRelationships — graf over hvordan fordelinger henger sammen.
 * Klikk på en kant → få transformasjons-formel + interaktivt
 * simuleringseksempel som verifiserer relasjonen empirisk.
 */

interface NodePos { id: NodeId; x: number; y: number; label: string }
type NodeId =
  | "bernoulli"
  | "binomial"
  | "poisson"
  | "normal"
  | "uniform"
  | "exponential"
  | "gamma"
  | "chisq"
  | "studentt"
  | "f"
  | "geometric";

const NODES: NodePos[] = [
  { id: "bernoulli",   x: 80,  y: 60,  label: "Bernoulli(p)" },
  { id: "binomial",    x: 260, y: 60,  label: "Binomial(n, p)" },
  { id: "poisson",     x: 460, y: 60,  label: "Poisson(λ)" },
  { id: "normal",      x: 640, y: 60,  label: "Normal(µ, σ²)" },

  { id: "uniform",     x: 80,  y: 200, label: "Uniform(0, 1)" },
  { id: "geometric",   x: 260, y: 200, label: "Geometrisk(p)" },
  { id: "exponential", x: 460, y: 200, label: "Exp(λ)" },
  { id: "gamma",       x: 640, y: 200, label: "Gamma(k, β)" },

  { id: "chisq",       x: 280, y: 340, label: "χ²(k)" },
  { id: "studentt",    x: 480, y: 340, label: "Student-t(ν)" },
  { id: "f",           x: 660, y: 340, label: "F(d₁, d₂)" },
];

interface Edge {
  from: NodeId;
  to: NodeId;
  label: string;
  formula: string;
  description: string;
  // simulation: build samples of "from" -> transform -> compare to "to" PDF
  simulate?: (rng: () => number) => { values: number[]; target: { kind: DistKind; par: DistParams } };
}

const EDGES: Edge[] = [
  {
    from: "bernoulli", to: "binomial",
    label: "sum av n",
    formula: "X = \\sum_{i=1}^{n} Y_i, \\quad Y_i \\sim \\mathrm{Bernoulli}(p)",
    description: "Summerer n uavhengige Bernoulli-forsøk med samme p → Binomial(n, p).",
    simulate: (rng) => {
      const n = 15, p = 0.4, trials = 4000;
      const out: number[] = [];
      for (let t = 0; t < trials; t++) {
        let s = 0;
        for (let i = 0; i < n; i++) if (rng() < p) s++;
        out.push(s);
      }
      return { values: out, target: { kind: "binomial", par: { n, p } } };
    },
  },
  {
    from: "binomial", to: "poisson",
    label: "n→∞, p→0, np=λ",
    formula: "\\mathrm{Bin}(n, p) \\xrightarrow{n \\to \\infty,\\ p \\to 0} \\mathrm{Poi}(np)",
    description: "Når n er stor og p liten med konstant np = λ, så går binomial mot Poisson. Praktisk: bruk Poisson som tilnærming når n ≥ 30 og p ≤ 0.1.",
    simulate: (rng) => {
      const n = 200, p = 0.025; // np = 5
      const trials = 4000;
      const out: number[] = [];
      for (let t = 0; t < trials; t++) {
        let s = 0;
        for (let i = 0; i < n; i++) if (rng() < p) s++;
        out.push(s);
      }
      return { values: out, target: { kind: "poisson", par: { lambda: n * p } } };
    },
  },
  {
    from: "binomial", to: "normal",
    label: "n stor, np(1−p)>5",
    formula: "\\mathrm{Bin}(n, p) \\approx \\mathcal{N}(np,\\, np(1-p))",
    description: "Når n er stor og np(1−p) > 5 er binomialen godt tilnærmet med en normal med samme µ og σ². De Moivre–Laplace-teoremet.",
    simulate: (rng) => {
      const n = 100, p = 0.4;
      const out: number[] = [];
      for (let t = 0; t < 4000; t++) {
        let s = 0;
        for (let i = 0; i < n; i++) if (rng() < p) s++;
        out.push(s);
      }
      return { values: out, target: { kind: "normal", par: { mu: n * p, sigma: Math.sqrt(n * p * (1 - p)) } } };
    },
  },
  {
    from: "poisson", to: "normal",
    label: "λ stor",
    formula: "\\mathrm{Poi}(\\lambda) \\xrightarrow{\\lambda \\to \\infty} \\mathcal{N}(\\lambda,\\, \\lambda)",
    description: "Når λ er stor blir Poisson tilnærmet normal med µ = σ² = λ. Praktisk: λ ≥ 10.",
    simulate: (rng) => {
      const lam = 20;
      const out: number[] = [];
      for (let t = 0; t < 4000; t++) out.push(distSample(rng, "poisson", { lambda: lam }));
      return { values: out, target: { kind: "normal", par: { mu: lam, sigma: Math.sqrt(lam) } } };
    },
  },
  {
    from: "exponential", to: "gamma",
    label: "sum av k stk",
    formula: "Y = \\sum_{i=1}^{k} X_i, \\quad X_i \\sim \\mathrm{Exp}(\\beta) \\;\\Rightarrow\\; Y \\sim \\mathrm{Gamma}(k, \\beta)",
    description: "Summen av k uavhengige Exp(β) blir Gamma med shape k og rate β. Spesielt: k=1 gir bare Exp tilbake.",
    simulate: (rng) => {
      const k = 4, beta = 1;
      const out: number[] = [];
      for (let t = 0; t < 4000; t++) {
        let s = 0;
        for (let i = 0; i < k; i++) s += -Math.log(Math.max(1e-12, rng())) / beta;
        out.push(s);
      }
      return { values: out, target: { kind: "gamma", par: { shape: k, rate: beta } } };
    },
  },
  {
    from: "normal", to: "chisq",
    label: "sum av kvadrerte Z",
    formula: "X = \\sum_{i=1}^{k} Z_i^2,\\quad Z_i \\sim \\mathcal{N}(0,1) \\;\\Rightarrow\\; X \\sim \\chi^2(k)",
    description: "Sum av k uavhengige standardnormale i kvadrat blir chi-kvadrat med k frihetsgrader. Grunnlaget for varians-tester og uavhengighetstester.",
    simulate: (rng) => {
      const k = 5;
      const out: number[] = [];
      for (let t = 0; t < 4000; t++) {
        let s = 0;
        for (let i = 0; i < k; i++) {
          const z = distSample(rng, "normal", { mu: 0, sigma: 1 });
          s += z * z;
        }
        out.push(s);
      }
      return { values: out, target: { kind: "chisq", par: { df: k } } };
    },
  },
  {
    from: "chisq", to: "studentt",
    label: "Z / √(χ²/ν)",
    formula: "T = \\frac{Z}{\\sqrt{X/\\nu}},\\; Z \\sim \\mathcal{N}(0,1),\\; X \\sim \\chi^2(\\nu) \\;\\Rightarrow\\; T \\sim t_\\nu",
    description: "Ratio mellom en standardnormal og kvadratrot av en uavhengig chi-kvadrat-pr-df. Grunnlaget for t-tester når σ er ukjent.",
    simulate: (rng) => {
      const v = 8;
      const out: number[] = [];
      for (let t = 0; t < 4000; t++) {
        const z = distSample(rng, "normal", { mu: 0, sigma: 1 });
        const x = distSample(rng, "chisq", { df: v });
        out.push(z / Math.sqrt(x / v));
      }
      return { values: out, target: { kind: "studentt", par: { df: v } } };
    },
  },
  {
    from: "chisq", to: "f",
    label: "(χ²₁/d₁) / (χ²₂/d₂)",
    formula: "F = \\frac{X_1/d_1}{X_2/d_2},\\; X_i \\sim \\chi^2(d_i) \\;\\Rightarrow\\; F \\sim F(d_1, d_2)",
    description: "Ratio mellom to skalerte chi-kvadrat-variabler. Grunnlaget for varians-sammenligning (F-test) og ANOVA.",
  },
  {
    from: "uniform", to: "exponential",
    label: "−ln(U)/λ",
    formula: "X = -\\frac{1}{\\lambda} \\ln U,\\; U \\sim U(0,1) \\;\\Rightarrow\\; X \\sim \\mathrm{Exp}(\\lambda)",
    description: "Inverse-CDF-metoden: −ln(U)/λ er eksponentielt fordelt. Slik genereres eksponentielle samples i praksis.",
    simulate: (rng) => {
      const lam = 1.5;
      const out: number[] = [];
      for (let t = 0; t < 4000; t++) out.push(-Math.log(Math.max(1e-12, rng())) / lam);
      return { values: out, target: { kind: "exponential", par: { lambda: lam } } };
    },
  },
  {
    from: "geometric", to: "exponential",
    label: "kontinuerlig grense",
    formula: "\\mathrm{Geom}(p) \\cdot \\Delta t \\xrightarrow{\\Delta t \\to 0} \\mathrm{Exp}(\\lambda),\\; \\lambda = p/\\Delta t",
    description: "Eksponential er den kontinuerlige analogen til geometrisk: tid mellom hendelser. Begge har 'memoryless'-egenskapen.",
  },
];

// Map (from,to) → edge
function edgeKey(from: NodeId, to: NodeId) {
  return `${from}→${to}`;
}

function ComparePlot({ values, target }: {
  values: number[]; target: { kind: DistKind; par: DistParams };
}) {
  const W = 480, H = 200;
  const padL = 32, padR = 8, padT = 8, padB = 22;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const sorted = [...values].sort((a, b) => a - b);
  const lo = sorted[Math.floor(values.length * 0.005)] ?? -3;
  const hi = sorted[Math.floor(values.length * 0.995)] ?? 3;
  const pad = (hi - lo) * 0.08 + 1e-9;
  const a = lo - pad, b = hi + pad;
  const isDisc = target.kind === "binomial" || target.kind === "poisson";
  const nBins = isDisc ? Math.min(60, Math.ceil(b - a) + 1) : 35;
  const bins = histogram(values, nBins, [a, b]);
  const binW = bins.length > 0 ? bins[0].x1 - bins[0].x0 : 1;
  const total = values.length;
  const density = (c: number) => c / (total * binW);

  let yMax = 0;
  for (const bn of bins) yMax = Math.max(yMax, density(bn.c));
  // overlay
  const steps = 200;
  const overlayPts: Array<{ x: number; y: number }> = [];
  if (isDisc) {
    const lo2 = Math.max(0, Math.floor(a));
    const hi2 = Math.ceil(b);
    for (let k = lo2; k <= hi2; k++) {
      const y = distPdf(target.kind, target.par, k);
      overlayPts.push({ x: k, y });
      // for discrete we compare PMF to density approximated as count/(total*1)
      yMax = Math.max(yMax, y);
    }
  } else {
    for (let i = 0; i <= steps; i++) {
      const x = a + ((b - a) * i) / steps;
      const y = distPdf(target.kind, target.par, x);
      overlayPts.push({ x, y });
      yMax = Math.max(yMax, y);
    }
  }
  yMax = yMax * 1.15 + 1e-9;
  const xPx = (x: number) => padL + ((x - a) / (b - a)) * plotW;
  const yPx = (y: number) => padT + plotH - (y / yMax) * plotH;
  let path = "";
  if (!isDisc) {
    for (let i = 0; i < overlayPts.length; i++) {
      const pt = overlayPts[i];
      path += (i === 0 ? "M " : " L ") + xPx(pt.x).toFixed(2) + " " + yPx(pt.y).toFixed(2);
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-background rounded border border-border">
      <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} stroke="hsl(0 0% 55%)" strokeWidth={0.7} />
      {bins.map((bn, i) => {
        // for discrete: re-bin as density per integer
        const x0 = xPx(bn.x0), x1 = xPx(bn.x1);
        const dens = isDisc ? bn.c / total : density(bn.c);
        const yt = yPx(dens), yb = padT + plotH;
        return (
          <rect key={i} x={x0} y={yt}
            width={Math.max(0.5, x1 - x0 - 0.5)} height={Math.max(0, yb - yt)}
            fill="hsl(220 65% 55%)" opacity={0.65} />
        );
      })}
      {!isDisc && <path d={path} fill="none" stroke="hsl(160 70% 40%)" strokeWidth={1.8} strokeDasharray="4 3" />}
      {isDisc && overlayPts.map((pt, i) => (
        <g key={i}>
          <circle cx={xPx(pt.x)} cy={yPx(pt.y)} r={3} fill="hsl(160 70% 40%)" />
        </g>
      ))}
      {Array.from({ length: 5 }).map((_, i) => {
        const x = a + ((b - a) * i) / 4;
        return (
          <text key={i} x={xPx(x)} y={padT + plotH + 14} fontSize={9} textAnchor="middle" className="fill-muted-foreground">
            {x.toFixed(1)}
          </text>
        );
      })}
    </svg>
  );
}

export function DistributionRelationships() {
  const [selected, setSelected] = useState<string | null>("bernoulli→binomial");
  const [seed, setSeed] = useState(20260518);

  const selectedEdge = useMemo(
    () => EDGES.find((e) => edgeKey(e.from, e.to) === selected) || null,
    [selected],
  );

  const simResult = useMemo(() => {
    if (!selectedEdge?.simulate) return null;
    const rng = mulberry32(seed);
    return selectedEdge.simulate(rng);
  }, [selectedEdge, seed]);

  const nodeMap = useMemo(() => {
    const m: Record<string, NodePos> = {};
    for (const n of NODES) m[n.id] = n;
    return m;
  }, []);

  const W = 740, H = 400;

  // Draw curve between (x1,y1) and (x2,y2) with slight arc
  function arrowPath(from: NodePos, to: NodePos): string {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ux = dx / len, uy = dy / len;
    // truncate endpoints so arrows don't overlap nodes (node radius ~70 wide / 22 tall — approx)
    const ox = ux * 75, oy = uy * 18;
    const sx = from.x + ox, sy = from.y + oy;
    const ex = to.x - ox, ey = to.y - oy;
    const mx = (sx + ex) / 2;
    const my = (sy + ey) / 2;
    // perpendicular offset for arc
    const perpX = -uy * 18;
    const perpY = ux * 18;
    return `M ${sx} ${sy} Q ${mx + perpX} ${my + perpY} ${ex} ${ey}`;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold">
        Distribution Relationships — hvordan fordelinger transformeres til hverandre
      </div>
      <p className="text-xs text-muted-foreground">
        Pilene viser transformasjoner og grenseresultater. Klikk på en kant for
        å se transformasjons-formelen og en empirisk simulering som verifiserer
        at venstre-side-fordelingen virkelig gir høyre-side-fordelingen.
      </p>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-background rounded border border-border">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(220 70% 50%)" />
            </marker>
            <marker id="arrow-sel" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(15 80% 55%)" />
            </marker>
          </defs>

          {/* edges */}
          {EDGES.map((edge) => {
            const from = nodeMap[edge.from];
            const to = nodeMap[edge.to];
            if (!from || !to) return null;
            const key = edgeKey(edge.from, edge.to);
            const isSel = selected === key;
            const d = arrowPath(from, to);
            // midpoint for label
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2 - 6;
            return (
              <g key={key} className="cursor-pointer" onClick={() => setSelected(key)}>
                <path d={d} fill="none"
                  stroke={isSel ? "hsl(15 80% 55%)" : "hsl(220 70% 50%)"}
                  strokeWidth={isSel ? 2.4 : 1.4}
                  markerEnd={isSel ? "url(#arrow-sel)" : "url(#arrow)"}
                  opacity={isSel ? 1 : 0.55}
                />
                <rect
                  x={mx - 50} y={my - 9} width={100} height={16} rx={3}
                  fill="hsl(0 0% 100%)" stroke={isSel ? "hsl(15 80% 55%)" : "hsl(220 30% 80%)"}
                  className="dark:fill-[hsl(220_15%_15%)]"
                  opacity={0.96}
                />
                <text x={mx} y={my + 2} fontSize={9} textAnchor="middle"
                  className={isSel ? "fill-[hsl(15_80%_45%)] font-semibold" : "fill-muted-foreground"}>
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* nodes */}
          {NODES.map((n) => (
            <g key={n.id}>
              <rect
                x={n.x - 72} y={n.y - 16} width={144} height={32} rx={6}
                fill="hsl(220 70% 95%)"
                stroke="hsl(220 70% 50%)"
                strokeWidth={1.2}
                className="dark:fill-[hsl(220_50%_20%)]"
              />
              <text x={n.x} y={n.y + 4} fontSize={11} textAnchor="middle"
                className="fill-[hsl(220_70%_30%)] dark:fill-[hsl(220_70%_85%)] font-semibold">
                {n.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {selectedEdge && (
        <div className="rounded-lg border border-border bg-background p-4 space-y-3">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <div className="text-sm font-semibold">
              {nodeMap[selectedEdge.from].label} → {nodeMap[selectedEdge.to].label}
            </div>
            {selectedEdge.simulate && (
              <button type="button" onClick={() => setSeed((s) => s + 1)}
                className="px-2 py-0.5 rounded text-[11px] font-medium border border-border hover:bg-muted">
                Nytt seed
              </button>
            )}
          </div>
          <div className="rounded bg-muted/30 px-3 py-2 font-mono text-[11px] overflow-x-auto">
            {selectedEdge.formula}
          </div>
          <p className="text-xs text-muted-foreground">{selectedEdge.description}</p>

          {simResult && (
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Empirisk simulering — histogrammet av <em>transformert</em> data
                (blå) vs. teoretisk PDF/PMF av høyre-side-fordelingen (grønn)
              </div>
              <ComparePlot values={simResult.values} target={simResult.target} />
              <div className="text-[11px] text-muted-foreground">
                {(() => {
                  const m = distMoments(simResult.target.kind, simResult.target.par);
                  let empMu = 0;
                  for (const v of simResult.values) empMu += v;
                  empMu /= simResult.values.length;
                  let empV = 0;
                  for (const v of simResult.values) empV += (v - empMu) ** 2;
                  empV /= simResult.values.length - 1;
                  return (
                    <>teoretisk E[X] = <strong>{m.mean.toFixed(3)}</strong>, empirisk = <strong>{empMu.toFixed(3)}</strong>
                    {" · "}teoretisk Var = <strong>{(isFinite(m.variance) ? m.variance.toFixed(3) : "∞")}</strong>, empirisk = <strong>{empV.toFixed(3)}</strong></>
                  );
                })()}
              </div>
            </div>
          )}

          {!simResult && (
            <div className="text-[11px] text-muted-foreground italic">
              (Ingen interaktiv simulering for denne kanten — formelen står for seg selv.)
            </div>
          )}
        </div>
      )}

      <div className="rounded-md border border-blue-500/30 bg-blue-500/5 p-3 text-[11px] text-muted-foreground space-y-1">
        <div><strong>Hovedmønster:</strong> Diskret-rad øverst (Bernoulli → Binomial → Poisson → Normal) — fra én-shot til mange-shot til tilnærming. Kontinuerlig-rad midten — bygger blokker for inferens. Nederste rad (χ², t, F) — test-fordelinger som ALLE er avledet fra normaler.</div>
        <div><strong>Memo:</strong> Når en sannsynlighetsmodell kommer frem på eksamen, spør deg: er det en sum, et antall, en ratio, eller en tid? Det bestemmer hvilken pil i grafen som passer.</div>
      </div>
    </div>
  );
}

// silenser potensielt ubrukt
void normalPdf;
