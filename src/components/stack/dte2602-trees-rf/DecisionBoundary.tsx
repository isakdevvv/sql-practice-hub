import { useMemo, useState } from "react";

/**
 * DecisionBoundary — sammenlign Decision Tree vs Random Forest beslutningsgrenser
 *
 * Pedagogikk:
 *  - Basis: tre klasser i 2D, depth=3, n_estimators=10
 *  - Dypere: skru opp max_depth → skarpere/overfitter; skru opp n_estimators → glattere
 *  - Eksamen: «hvorfor glatter RF ut beslutningsgrensene?» — gjennomsnitt over
 *    bootstrap-trær som hver overfitter på ulik måte
 */

type Point = { x: number; y: number; cls: 0 | 1 | 2 };

function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function gauss(rand: () => number, m: number, sd: number): number {
  const u = Math.max(1e-9, 1 - rand());
  const v = rand();
  return m + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Three-cluster 2D dataset
function makeDataset(seed: number): Point[] {
  const r = lcg(seed);
  const out: Point[] = [];
  const centers: { x: number; y: number; cls: 0 | 1 | 2 }[] = [
    { x: 0.3, y: 0.3, cls: 0 },
    { x: 0.7, y: 0.4, cls: 1 },
    { x: 0.5, y: 0.75, cls: 2 },
  ];
  for (const c of centers) {
    for (let i = 0; i < 20; i++) {
      out.push({
        x: Math.max(0.05, Math.min(0.95, gauss(r, c.x, 0.08))),
        y: Math.max(0.05, Math.min(0.95, gauss(r, c.y, 0.08))),
        cls: c.cls,
      });
    }
  }
  return out;
}

// --- Decision tree implementation (simplified CART, axis-aligned, Gini) ---

type TreeNode =
  | { kind: "leaf"; label: 0 | 1 | 2 }
  | {
      kind: "split";
      axis: "x" | "y";
      thr: number;
      left: TreeNode; // <= thr
      right: TreeNode; // > thr
    };

function gini(counts: number[]): number {
  const total = counts.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  let g = 1;
  for (const c of counts) {
    const p = c / total;
    g -= p * p;
  }
  return g;
}

function classCounts(points: Point[]): number[] {
  const c = [0, 0, 0];
  for (const p of points) c[p.cls]++;
  return c;
}

function majority(points: Point[]): 0 | 1 | 2 {
  const c = classCounts(points);
  let best = 0;
  for (let i = 1; i < 3; i++) if (c[i] > c[best]) best = i;
  return best as 0 | 1 | 2;
}

function buildTree(
  points: Point[],
  depth: number,
  maxDepth: number,
  featureSubsample: ("x" | "y")[] | null,
  rand: () => number,
): TreeNode {
  if (points.length === 0) return { kind: "leaf", label: 0 };
  if (depth >= maxDepth) {
    return { kind: "leaf", label: majority(points) };
  }
  const counts = classCounts(points);
  if (counts.filter((c) => c > 0).length === 1) {
    return { kind: "leaf", label: majority(points) };
  }

  // candidate features
  let axes: ("x" | "y")[];
  if (featureSubsample) {
    axes = featureSubsample;
  } else {
    axes = ["x", "y"];
  }

  let best: {
    axis: "x" | "y";
    thr: number;
    gain: number;
    left: Point[];
    right: Point[];
  } | null = null;
  const parentGini = gini(counts);
  for (const axis of axes) {
    // Try midpoints between sorted unique values
    const vals = points
      .map((p) => p[axis])
      .sort((a, b) => a - b);
    for (let i = 0; i < vals.length - 1; i++) {
      const thr = (vals[i] + vals[i + 1]) / 2;
      const left = points.filter((p) => p[axis] <= thr);
      const right = points.filter((p) => p[axis] > thr);
      if (left.length === 0 || right.length === 0) continue;
      const ig =
        parentGini -
        (left.length / points.length) * gini(classCounts(left)) -
        (right.length / points.length) * gini(classCounts(right));
      if (!best || ig > best.gain) {
        best = { axis, thr, gain: ig, left, right };
      }
    }
  }
  if (!best || best.gain <= 0) {
    return { kind: "leaf", label: majority(points) };
  }
  // small random tie-break to encourage tree diversity in RF
  void rand;
  return {
    kind: "split",
    axis: best.axis,
    thr: best.thr,
    left: buildTree(best.left, depth + 1, maxDepth, featureSubsample, rand),
    right: buildTree(best.right, depth + 1, maxDepth, featureSubsample, rand),
  };
}

function predict(node: TreeNode, x: number, y: number): 0 | 1 | 2 {
  let cur: TreeNode = node;
  while (cur.kind === "split") {
    const v = cur.axis === "x" ? x : y;
    cur = v <= cur.thr ? cur.left : cur.right;
  }
  return cur.label;
}

function bootstrapSample(points: Point[], rand: () => number): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < points.length; i++) {
    out.push(points[Math.floor(rand() * points.length)]);
  }
  return out;
}

function pickAxes(rand: () => number): ("x" | "y")[] {
  // Random Forest: sqrt(2) ≈ 1 → randomly choose 1 axis per split.
  // We approximate by sampling axes for the whole tree (simple version).
  return rand() < 0.5 ? ["x"] : ["y"];
}

// ---- Component ----

type AlgoKind = "tree" | "forest";

export function DecisionBoundary() {
  const [algo, setAlgo] = useState<AlgoKind>("tree");
  const [maxDepth, setMaxDepth] = useState(4);
  const [nEst, setNEst] = useState(20);
  const [seed, setSeed] = useState(7);

  const points = useMemo(() => makeDataset(seed), [seed]);

  // Build model
  const ensemble = useMemo(() => {
    if (algo === "tree") {
      const r = lcg(seed + 1);
      return [buildTree(points, 0, maxDepth, null, r)];
    }
    const trees: TreeNode[] = [];
    for (let i = 0; i < nEst; i++) {
      const r = lcg(seed + 1 + i * 7);
      const sample = bootstrapSample(points, r);
      const axes = pickAxes(r);
      trees.push(buildTree(sample, 0, maxDepth, axes, r));
    }
    return trees;
  }, [algo, maxDepth, nEst, seed, points]);

  // Compute decision boundary grid
  const GRID = 40;
  const W = 360;
  const H = 320;
  const PAD = 30;
  const sx = (v: number) => PAD + v * (W - 2 * PAD);
  const sy = (v: number) => PAD + (1 - v) * (H - 2 * PAD);

  const grid = useMemo(() => {
    const cells: { x: number; y: number; cls: 0 | 1 | 2 }[] = [];
    for (let i = 0; i < GRID; i++) {
      for (let j = 0; j < GRID; j++) {
        const x = (i + 0.5) / GRID;
        const y = (j + 0.5) / GRID;
        // ensemble vote
        const votes = [0, 0, 0];
        for (const tree of ensemble) {
          votes[predict(tree, x, y)]++;
        }
        let best = 0;
        for (let k = 1; k < 3; k++) if (votes[k] > votes[best]) best = k;
        cells.push({ x, y, cls: best as 0 | 1 | 2 });
      }
    }
    return cells;
  }, [ensemble]);

  const colors = [
    "rgba(244, 63, 94, 0.45)", // red
    "rgba(59, 130, 246, 0.45)", // blue
    "rgba(34, 197, 94, 0.45)", // green
  ];
  const pointColors = ["#f43f5e", "#3b82f6", "#22c55e"];
  const cellW = (W - 2 * PAD) / GRID;
  const cellH = (H - 2 * PAD) / GRID;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Algoritme</div>
            <div className="flex gap-1">
              {(["tree", "forest"] as AlgoKind[]).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAlgo(a)}
                  className={`px-2.5 py-1 text-xs rounded border transition ${
                    algo === a
                      ? "bg-brand text-brand-foreground border-brand"
                      : "bg-background border-border text-muted-foreground"
                  }`}
                >
                  {a === "tree" ? "Decision Tree" : "Random Forest"}
                </button>
              ))}
            </div>
          </div>
          <Slider
            label={`max_depth: ${maxDepth}`}
            min={1}
            max={10}
            step={1}
            value={maxDepth}
            onChange={setMaxDepth}
          />
          {algo === "forest" && (
            <Slider
              label={`n_estimators: ${nEst}`}
              min={1}
              max={50}
              step={1}
              value={nEst}
              onChange={setNEst}
            />
          )}
        </div>
        <div className="space-y-2 text-xs">
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="px-3 py-1.5 text-xs rounded border border-border text-muted-foreground"
          >
            Nytt datasett
          </button>
          <div className="rounded-lg border border-border bg-background p-3 space-y-1">
            <div className="font-semibold text-muted-foreground">
              Tipsoppskrift
            </div>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-muted-foreground">
              <li>
                Tree, depth=1 → bare én vertikal eller horisontal linje
                (underfit).
              </li>
              <li>
                Tree, depth=10 → mange trappetrinn — overfit.
              </li>
              <li>
                Forest, depth=10, n=50 → grensene glatter seg ut.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <svg width={W} height={H} className="block bg-background rounded">
          {grid.map((c, i) => (
            <rect
              key={i}
              x={sx(c.x) - cellW / 2}
              y={sy(c.y) - cellH / 2}
              width={cellW + 0.5}
              height={cellH + 0.5}
              fill={colors[c.cls]}
              stroke="none"
            />
          ))}
          {/* axes */}
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#888" />
          <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#888" />
          {/* training points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={sx(p.x)}
              cy={sy(p.y)}
              r={4}
              fill={pointColors[p.cls]}
              stroke="#fff"
              strokeWidth={1}
            />
          ))}
        </svg>
      </div>

      <div className="text-xs text-muted-foreground flex gap-3 flex-wrap">
        {[0, 1, 2].map((c) => (
          <span key={c} className="inline-flex items-center gap-1">
            <span
              className="inline-block w-3 h-3"
              style={{ background: pointColors[c] }}
            />
            klasse {c}
          </span>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        <strong>Eksamen-fasit:</strong> et beslutningstre lager akse-justerte
        splits og overfit lett — grensene blir trappetrinn-formede. Random
        Forest gjennomsnitter <em>bootstrap</em>-trær med ulik random feature
        subset → grensene glatter seg ut. Det er bias-varians-prinsippet i
        praksis.
      </p>
    </div>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </label>
  );
}
