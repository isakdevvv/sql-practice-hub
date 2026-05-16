import { useMemo, useState } from "react";

/**
 * PCA interaktiv projeksjon.
 *
 * Viser et 2D scatter-plot av Iris (forenklet, 2 features) eller wine
 * (forenklet, 2 features). Bruker kan:
 *  - Velge dataset
 *  - Se principal components som piler i original feature-space
 *  - Justere "rotasjons-vinkel" — viser hvordan tilfeldige akser har mindre
 *    varians enn PCA-aksen (som maksimerer)
 *  - Veksle mellom projeksjon på PC1 alene vs. PC1+PC2
 *  - Se variance explained ratio som bar-chart
 */

type Dataset = "iris" | "wine";
type Mode = "scatter" | "pc1" | "pc1pc2";

type Pt = { x: number; y: number; label: number };

const W = 520;
const H = 380;
const PAD = 36;

// Aksene tegnes alltid i samme intervall i datarommet (-3..3 etter sentrering)
const DATA_MIN = -3.5;
const DATA_MAX = 3.5;

function sx(x: number) {
  return PAD + ((x - DATA_MIN) / (DATA_MAX - DATA_MIN)) * (W - 2 * PAD);
}
function sy(y: number) {
  return H - PAD - ((y - DATA_MIN) / (DATA_MAX - DATA_MIN)) * (H - 2 * PAD);
}

const CLASS_COLORS = [
  "hsl(215 80% 55%)",
  "hsl(28 90% 55%)",
  "hsl(150 60% 45%)",
];

const CLASS_NAMES_IRIS = ["setosa", "versicolor", "virginica"];
const CLASS_NAMES_WINE = ["class 1", "class 2", "class 3"];

// ===== Iris (petal length, petal width), 60 punkter =====
function getIris(): Pt[] {
  const raw: Array<[number, number, number]> = [
    // setosa
    [1.4, 0.2, 0], [1.4, 0.2, 0], [1.3, 0.2, 0], [1.5, 0.2, 0], [1.4, 0.2, 0],
    [1.7, 0.4, 0], [1.4, 0.3, 0], [1.5, 0.2, 0], [1.4, 0.2, 0], [1.5, 0.1, 0],
    [1.5, 0.2, 0], [1.6, 0.2, 0], [1.4, 0.1, 0], [1.1, 0.1, 0], [1.2, 0.2, 0],
    [1.5, 0.4, 0], [1.3, 0.4, 0], [1.4, 0.3, 0], [1.7, 0.3, 0], [1.5, 0.3, 0],
    // versicolor
    [4.7, 1.4, 1], [4.5, 1.5, 1], [4.9, 1.5, 1], [4.0, 1.3, 1], [4.6, 1.5, 1],
    [4.5, 1.3, 1], [4.7, 1.6, 1], [3.3, 1.0, 1], [4.6, 1.3, 1], [3.9, 1.4, 1],
    [3.5, 1.0, 1], [4.2, 1.5, 1], [4.0, 1.0, 1], [4.7, 1.4, 1], [3.6, 1.3, 1],
    [4.4, 1.4, 1], [4.5, 1.5, 1], [4.1, 1.0, 1], [4.5, 1.5, 1], [3.9, 1.1, 1],
    // virginica
    [6.0, 2.5, 2], [5.1, 1.9, 2], [5.9, 2.1, 2], [5.6, 1.8, 2], [5.8, 2.2, 2],
    [6.6, 2.1, 2], [4.5, 1.7, 2], [6.3, 1.8, 2], [5.8, 1.8, 2], [6.1, 2.5, 2],
    [5.1, 2.0, 2], [5.3, 1.9, 2], [5.5, 2.1, 2], [5.0, 2.0, 2], [5.1, 2.4, 2],
    [5.3, 2.3, 2], [5.5, 1.8, 2], [6.7, 2.2, 2], [6.9, 2.3, 2], [5.7, 2.5, 2],
  ];
  return raw.map(([a, b, c]) => ({ x: a, y: b, label: c }));
}

// ===== Wine (forenklet: alcohol vs flavanoids), 60 punkter =====
// Approksimerte verdier fra UCI Wine dataset.
function getWine(): Pt[] {
  const raw: Array<[number, number, number]> = [
    // class 1 (alcohol høy ~13-14, flavanoids høy ~3)
    [14.2, 3.1, 0], [13.2, 2.8, 0], [13.1, 3.2, 0], [14.4, 3.5, 0], [13.2, 2.7, 0],
    [14.4, 3.3, 0], [14.0, 2.8, 0], [14.1, 2.9, 0], [13.7, 2.8, 0], [14.1, 3.2, 0],
    [14.1, 3.4, 0], [13.5, 3.0, 0], [13.5, 3.0, 0], [13.8, 3.2, 0], [14.2, 3.0, 0],
    [13.7, 3.0, 0], [13.9, 3.2, 0], [14.1, 3.2, 0], [13.6, 2.8, 0], [14.4, 3.0, 0],
    // class 2 (alcohol middels ~12, flavanoids middels ~2)
    [12.4, 2.0, 1], [12.3, 1.9, 1], [12.5, 2.1, 1], [12.0, 1.6, 1], [12.7, 2.2, 1],
    [12.2, 1.9, 1], [11.6, 2.3, 1], [12.0, 2.1, 1], [12.7, 1.6, 1], [12.0, 1.9, 1],
    [12.5, 2.0, 1], [11.8, 2.5, 1], [12.1, 1.5, 1], [12.6, 2.0, 1], [12.3, 2.2, 1],
    [11.6, 2.0, 1], [11.7, 1.9, 1], [12.5, 2.1, 1], [12.2, 1.6, 1], [12.4, 1.8, 1],
    // class 3 (alcohol høy ~13, flavanoids lav ~0.7)
    [13.0, 0.7, 2], [13.1, 0.6, 2], [13.5, 0.8, 2], [13.7, 0.5, 2], [13.3, 0.7, 2],
    [13.5, 0.6, 2], [13.7, 0.9, 2], [13.1, 0.7, 2], [13.4, 0.5, 2], [12.8, 0.7, 2],
    [13.4, 0.8, 2], [13.6, 0.7, 2], [13.0, 0.6, 2], [12.9, 0.7, 2], [13.3, 0.5, 2],
    [13.8, 0.7, 2], [13.2, 0.6, 2], [13.5, 0.7, 2], [13.2, 0.5, 2], [13.7, 0.8, 2],
  ];
  return raw.map(([a, b, c]) => ({ x: a, y: b, label: c }));
}

// Standardiser: trekk fra mean, del på std
function standardize(pts: Pt[]): Pt[] {
  const n = pts.length;
  let mx = 0;
  let my = 0;
  for (const p of pts) {
    mx += p.x;
    my += p.y;
  }
  mx /= n;
  my /= n;
  let vx = 0;
  let vy = 0;
  for (const p of pts) {
    vx += (p.x - mx) ** 2;
    vy += (p.y - my) ** 2;
  }
  const sx0 = Math.sqrt(vx / (n - 1)) || 1;
  const sy0 = Math.sqrt(vy / (n - 1)) || 1;
  return pts.map((p) => ({
    x: (p.x - mx) / sx0,
    y: (p.y - my) / sy0,
    label: p.label,
  }));
}

// Beregn 2x2 kovariansmatrise og dens egenvektorer (analytisk)
function pca2D(pts: Pt[]) {
  const n = pts.length;
  let mx = 0;
  let my = 0;
  for (const p of pts) {
    mx += p.x;
    my += p.y;
  }
  mx /= n;
  my /= n;
  let cxx = 0;
  let cyy = 0;
  let cxy = 0;
  for (const p of pts) {
    cxx += (p.x - mx) ** 2;
    cyy += (p.y - my) ** 2;
    cxy += (p.x - mx) * (p.y - my);
  }
  const d = n - 1 || 1;
  cxx /= d;
  cyy /= d;
  cxy /= d;
  // Egenverdier av [[cxx, cxy], [cxy, cyy]]
  const tr = cxx + cyy;
  const det = cxx * cyy - cxy * cxy;
  const disc = Math.max(0, (tr * tr) / 4 - det);
  const root = Math.sqrt(disc);
  const lam1 = tr / 2 + root;
  const lam2 = tr / 2 - root;
  // Egenvektor for lam1: (cxy, lam1 - cxx) eller (lam1 - cyy, cxy)
  let v1: [number, number];
  if (Math.abs(cxy) > 1e-9) {
    v1 = [cxy, lam1 - cxx];
  } else {
    v1 = cxx >= cyy ? [1, 0] : [0, 1];
  }
  const n1 = Math.hypot(v1[0], v1[1]) || 1;
  v1 = [v1[0] / n1, v1[1] / n1];
  // PC2 = perpendikulær
  const v2: [number, number] = [-v1[1], v1[0]];
  return {
    mean: { x: mx, y: my },
    cov: { cxx, cyy, cxy },
    eig: {
      vals: [lam1, lam2] as [number, number],
      vecs: [v1, v2] as [[number, number], [number, number]],
    },
  };
}

// Varians langs en akse (enhetsvektor) gitt sentrerte punkter
function varianceAlong(centered: Pt[], axis: [number, number]): number {
  let s = 0;
  let s2 = 0;
  for (const p of centered) {
    const proj = p.x * axis[0] + p.y * axis[1];
    s += proj;
    s2 += proj * proj;
  }
  const n = centered.length;
  const mean = s / n;
  return s2 / n - mean * mean;
}

export function PcaInteractiveProjection() {
  const [dataset, setDataset] = useState<Dataset>("iris");
  const [angleDeg, setAngleDeg] = useState(0);
  const [mode, setMode] = useState<Mode>("scatter");

  const raw = useMemo(() => (dataset === "iris" ? getIris() : getWine()), [dataset]);
  const pts = useMemo(() => standardize(raw), [raw]);
  const pca = useMemo(() => pca2D(pts), [pts]);

  // Brukerens "tilfeldige" akse fra slider
  const angleRad = (angleDeg * Math.PI) / 180;
  const userAxis: [number, number] = [Math.cos(angleRad), Math.sin(angleRad)];
  const userVar = varianceAlong(pts, userAxis);

  const pc1Var = varianceAlong(pts, pca.eig.vecs[0]);
  const pc2Var = varianceAlong(pts, pca.eig.vecs[1]);
  const totalVar = pc1Var + pc2Var;
  const r1 = pc1Var / totalVar;
  const r2 = pc2Var / totalVar;

  // Projisert visning
  const displayPts = useMemo(() => {
    if (mode === "scatter") return pts;
    const v1 = pca.eig.vecs[0];
    const v2 = pca.eig.vecs[1];
    return pts.map((p) => {
      const c1 = p.x * v1[0] + p.y * v1[1];
      const c2 = p.x * v2[0] + p.y * v2[1];
      if (mode === "pc1") {
        // Projiser ned til PC1 — sett PC2-koordinat til 0
        const nx = c1 * v1[0];
        const ny = c1 * v1[1];
        return { x: nx, y: ny, label: p.label };
      }
      // mode === "pc1pc2": vis i PC-basis (rotert plot)
      return { x: c1, y: c2, label: p.label };
    });
  }, [pts, pca, mode]);

  const classNames = dataset === "iris" ? CLASS_NAMES_IRIS : CLASS_NAMES_WINE;

  // Skalering av PC-piler — lengde proporsjonal med sqrt(egenverdi)
  const arrowScale = 2.2;
  const pc1Len = Math.sqrt(Math.max(0, pca.eig.vals[0])) * arrowScale;
  const pc2Len = Math.sqrt(Math.max(0, pca.eig.vals[1])) * arrowScale;
  const userLen = Math.sqrt(Math.max(0, userVar)) * arrowScale;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          PCA interaktiv projeksjon
        </div>
        <div className="text-[11px] text-muted-foreground">
          n = {pts.length} · standardiserte features
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4">
        {/* PLOT */}
        <div className="rounded-lg border border-border bg-background overflow-hidden">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
            {/* gridlinjer */}
            {[-3, -2, -1, 0, 1, 2, 3].map((v) => (
              <g key={v} opacity={v === 0 ? 0.25 : 0.08}>
                <line
                  x1={sx(v)}
                  x2={sx(v)}
                  y1={sy(DATA_MIN)}
                  y2={sy(DATA_MAX)}
                  stroke="currentColor"
                />
                <line
                  x1={sx(DATA_MIN)}
                  x2={sx(DATA_MAX)}
                  y1={sy(v)}
                  y2={sy(v)}
                  stroke="currentColor"
                />
              </g>
            ))}

            {/* akselabels */}
            <text x={W / 2} y={H - 6} fontSize={10} textAnchor="middle" fill="currentColor" opacity={0.6}>
              {mode === "pc1pc2"
                ? "PC1 (rotert basis)"
                : dataset === "iris"
                  ? "petal length (standardisert)"
                  : "alcohol (standardisert)"}
            </text>
            <text
              x={12}
              y={H / 2}
              fontSize={10}
              textAnchor="middle"
              fill="currentColor"
              opacity={0.6}
              transform={`rotate(-90, 12, ${H / 2})`}
            >
              {mode === "pc1pc2"
                ? "PC2 (rotert basis)"
                : dataset === "iris"
                  ? "petal width (standardisert)"
                  : "flavanoids (standardisert)"}
            </text>

            {/* projeksjons-linjer for PC1-modus */}
            {mode === "pc1" &&
              pts.map((p, i) => {
                const d = displayPts[i];
                return (
                  <line
                    key={`pl-${i}`}
                    x1={sx(p.x)}
                    y1={sy(p.y)}
                    x2={sx(d.x)}
                    y2={sy(d.y)}
                    stroke="currentColor"
                    strokeWidth={0.6}
                    opacity={0.22}
                    strokeDasharray="2 2"
                  />
                );
              })}

            {/* punkter */}
            {displayPts.map((p, i) => (
              <circle
                key={i}
                cx={sx(p.x)}
                cy={sy(p.y)}
                r={4}
                fill={CLASS_COLORS[p.label]}
                opacity={0.85}
              />
            ))}

            {/* PC-akser (kun i scatter-modus, hvor original feature-space gir mening) */}
            {mode !== "pc1pc2" && (
              <>
                {/* PC1 */}
                <line
                  x1={sx(-pc1Len * pca.eig.vecs[0][0])}
                  y1={sy(-pc1Len * pca.eig.vecs[0][1])}
                  x2={sx(pc1Len * pca.eig.vecs[0][0])}
                  y2={sy(pc1Len * pca.eig.vecs[0][1])}
                  stroke="hsl(0 80% 50%)"
                  strokeWidth={2.5}
                />
                <text
                  x={sx(pc1Len * pca.eig.vecs[0][0]) + 6}
                  y={sy(pc1Len * pca.eig.vecs[0][1]) - 4}
                  fontSize={11}
                  fontWeight={700}
                  fill="hsl(0 80% 50%)"
                >
                  PC1
                </text>
                {/* PC2 */}
                <line
                  x1={sx(-pc2Len * pca.eig.vecs[1][0])}
                  y1={sy(-pc2Len * pca.eig.vecs[1][1])}
                  x2={sx(pc2Len * pca.eig.vecs[1][0])}
                  y2={sy(pc2Len * pca.eig.vecs[1][1])}
                  stroke="hsl(285 70% 55%)"
                  strokeWidth={2}
                />
                <text
                  x={sx(pc2Len * pca.eig.vecs[1][0]) + 6}
                  y={sy(pc2Len * pca.eig.vecs[1][1]) - 4}
                  fontSize={11}
                  fontWeight={700}
                  fill="hsl(285 70% 55%)"
                >
                  PC2
                </text>
                {/* Brukerens akse */}
                <line
                  x1={sx(-userLen * userAxis[0])}
                  y1={sy(-userLen * userAxis[1])}
                  x2={sx(userLen * userAxis[0])}
                  y2={sy(userLen * userAxis[1])}
                  stroke="hsl(45 95% 50%)"
                  strokeWidth={1.8}
                  strokeDasharray="6 3"
                />
                <text
                  x={sx(userLen * userAxis[0]) + 6}
                  y={sy(userLen * userAxis[1]) + 12}
                  fontSize={10}
                  fontWeight={700}
                  fill="hsl(45 95% 50%)"
                >
                  din akse
                </text>
              </>
            )}
          </svg>
        </div>

        {/* KONTROLLER */}
        <div className="space-y-3">
          <div>
            <div className="text-[11px] text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
              Dataset
            </div>
            <div className="grid grid-cols-2 gap-1">
              {(["iris", "wine"] as Dataset[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDataset(d)}
                  className={
                    "px-2 py-1 rounded border text-xs " +
                    (dataset === d
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border bg-background hover:border-brand/40")
                  }
                >
                  {d === "iris" ? "Iris" : "Wine"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
              Visning
            </div>
            <div className="flex flex-col gap-1">
              {(
                [
                  ["scatter", "Original (med akser)"],
                  ["pc1", "Projisert på PC1"],
                  ["pc1pc2", "Rotert til PC1/PC2"],
                ] as const
              ).map(([m, label]) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={
                    "px-2 py-1 rounded border text-xs text-left " +
                    (mode === m
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border bg-background hover:border-brand/40")
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <label className="block text-sm">
            <div className="text-[11px] text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
              Rotasjons-vinkel = {angleDeg}°
            </div>
            <input
              type="range"
              min={0}
              max={180}
              value={angleDeg}
              onChange={(e) => setAngleDeg(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-[10px] text-muted-foreground mt-1">
              Justér din egen akse (gul) og sammenlign variansen med PC1.
            </div>
          </label>

          <div className="rounded-md border border-border bg-background px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Varians langs akser
            </div>
            <div className="text-xs font-mono mt-1">
              <span style={{ color: "hsl(0 80% 50%)" }}>PC1</span>: {pc1Var.toFixed(3)}
            </div>
            <div className="text-xs font-mono">
              <span style={{ color: "hsl(285 70% 55%)" }}>PC2</span>: {pc2Var.toFixed(3)}
            </div>
            <div className="text-xs font-mono">
              <span style={{ color: "hsl(45 95% 50%)" }}>din</span>: {userVar.toFixed(3)}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              {userVar >= pc1Var - 1e-6
                ? "Du fant PC1!"
                : `${((userVar / pc1Var) * 100).toFixed(0)} % av PC1`}
            </div>
          </div>
        </div>
      </div>

      {/* Variance explained ratio bar-chart */}
      <div className="rounded-md border border-border bg-background p-3">
        <div className="text-[11px] text-muted-foreground mb-2 font-semibold uppercase tracking-wider">
          Explained variance ratio
        </div>
        <div className="space-y-2">
          {[
            { name: "PC1", ratio: r1, color: "hsl(0 80% 50%)" },
            { name: "PC2", ratio: r2, color: "hsl(285 70% 55%)" },
          ].map((b) => (
            <div key={b.name} className="flex items-center gap-2">
              <div className="w-10 text-xs font-mono font-semibold" style={{ color: b.color }}>
                {b.name}
              </div>
              <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all"
                  style={{ width: `${b.ratio * 100}%`, background: b.color }}
                />
              </div>
              <div className="w-14 text-xs font-mono text-right">
                {(b.ratio * 100).toFixed(1)} %
              </div>
            </div>
          ))}
        </div>
        <div className="text-[11px] text-muted-foreground mt-2">
          Kumulativt PC1+PC2: <strong>{((r1 + r2) * 100).toFixed(1)} %</strong>{" "}
          (alltid 100 % i 2D — interessant når d {">"} 2).
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs flex-wrap">
        {classNames.map((name, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: CLASS_COLORS[i] }}
            />
            <span className="text-muted-foreground">{name}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        <strong>Slik leser du plottet:</strong> Den røde linjen er PC1 — aksen
        som maksimerer varians. Den lilla er PC2 (perpendikulær). Den gule
        stiplede linjen er den vinkelen du har valgt. Flytt slideren og se at
        ingen annen retning fanger mer varians enn PC1.
      </p>
    </div>
  );
}
