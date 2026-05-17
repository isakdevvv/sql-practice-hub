// Visual diagrams for ML / AI algorithm flashcards.
// Same conventions as Visuals.tsx: theme-aware <figure> + SVG, currentColor
// stroke, text-foreground, small captions. Each component is a textbook-style
// figure that helps a single flashcard's intuition land — not a full lesson.

import type { FC } from "react";

const STROKE = "currentColor";

// ============= MINIMAX TREE =============
// MAX/MIN-noder med backed-up verdier. Klassisk AIMA-figur.
export const MinimaxTree: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 200" className="w-full max-w-md mx-auto text-foreground">
      {/* Edges */}
      <g stroke={STROKE} strokeWidth="1" opacity="0.6" fill="none">
        <line x1="180" y1="30" x2="90" y2="90" />
        <line x1="180" y1="30" x2="270" y2="90" />
        <line x1="90" y1="90" x2="40" y2="160" />
        <line x1="90" y1="90" x2="130" y2="160" />
        <line x1="270" y1="90" x2="220" y2="160" />
        <line x1="270" y1="90" x2="310" y2="160" />
      </g>
      {/* Root MAX */}
      <polygon points="180,15 195,30 180,45 165,30"
        fill="color-mix(in oklch, var(--brand) 25%, transparent)"
        stroke={STROKE} strokeWidth="1" />
      <text x="180" y="9" textAnchor="middle" className="text-[9px] fill-current opacity-70">MAX</text>
      <text x="180" y="33" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">5</text>
      {/* MIN nodes */}
      <polygon points="90,75 105,90 90,105 75,90"
        fill="color-mix(in oklch, var(--muted) 60%, transparent)"
        stroke={STROKE} strokeWidth="1" />
      <text x="90" y="69" textAnchor="middle" className="text-[9px] fill-current opacity-70">MIN</text>
      <text x="90" y="93" textAnchor="middle" className="text-[10px] fill-current font-mono">5</text>
      <polygon points="270,75 285,90 270,105 255,90"
        fill="color-mix(in oklch, var(--muted) 60%, transparent)"
        stroke={STROKE} strokeWidth="1" />
      <text x="270" y="69" textAnchor="middle" className="text-[9px] fill-current opacity-70">MIN</text>
      <text x="270" y="93" textAnchor="middle" className="text-[10px] fill-current font-mono">2</text>
      {/* Leaves */}
      <g>
        {[
          { x: 40, v: 5 },
          { x: 130, v: 8 },
          { x: 220, v: 2 },
          { x: 310, v: 9 },
        ].map((d) => (
          <g key={d.x}>
            <rect x={d.x - 12} y={150} width="24" height="20" rx="2"
              fill="color-mix(in oklch, var(--success) 15%, transparent)"
              stroke={STROKE} strokeWidth="1" />
            <text x={d.x} y={164} textAnchor="middle" className="text-[10px] fill-current font-mono">{d.v}</text>
          </g>
        ))}
      </g>
      <text x="180" y="190" textAnchor="middle" className="text-[9px] fill-current opacity-60">
        backed-up: max(min(5,8), min(2,9)) = max(5,2) = 5
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Minimax — MAX (rombe-spiss-opp) velger argmax, MIN (rombe-spiss-ned) velger argmin.
    </figcaption>
  </figure>
);

// ============= ALPHA-BETA PRUNING =============
// Samme tre, men én gren krysset ut.
export const AlphaBetaPrune: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 210" className="w-full max-w-md mx-auto text-foreground">
      <g stroke={STROKE} strokeWidth="1" opacity="0.6" fill="none">
        <line x1="180" y1="30" x2="90" y2="90" />
        <line x1="180" y1="30" x2="270" y2="90" />
        <line x1="90" y1="90" x2="40" y2="160" />
        <line x1="90" y1="90" x2="130" y2="160" />
        <line x1="270" y1="90" x2="220" y2="160" />
        <line x1="270" y1="90" x2="310" y2="160" />
      </g>
      {/* MAX root */}
      <polygon points="180,15 195,30 180,45 165,30"
        fill="color-mix(in oklch, var(--brand) 25%, transparent)"
        stroke={STROKE} strokeWidth="1" />
      <text x="180" y="33" textAnchor="middle" className="text-[10px] fill-current font-mono">≥5</text>
      {/* MIN left */}
      <polygon points="90,75 105,90 90,105 75,90"
        fill="color-mix(in oklch, var(--muted) 60%, transparent)"
        stroke={STROKE} strokeWidth="1" />
      <text x="90" y="93" textAnchor="middle" className="text-[10px] fill-current font-mono">5</text>
      {/* MIN right — pruned */}
      <polygon points="270,75 285,90 270,105 255,90"
        fill="color-mix(in oklch, var(--muted) 30%, transparent)"
        stroke={STROKE} strokeWidth="1" strokeDasharray="3,2" />
      <text x="270" y="93" textAnchor="middle" className="text-[10px] fill-current font-mono">≤2</text>
      {/* Leaves left */}
      {[{ x: 40, v: 5 }, { x: 130, v: 8 }].map((d) => (
        <g key={d.x}>
          <rect x={d.x - 12} y={150} width="24" height="20" rx="2"
            fill="color-mix(in oklch, var(--success) 15%, transparent)"
            stroke={STROKE} strokeWidth="1" />
          <text x={d.x} y={164} textAnchor="middle" className="text-[10px] fill-current font-mono">{d.v}</text>
        </g>
      ))}
      {/* Leaves right — second is pruned */}
      <rect x={208} y={150} width="24" height="20" rx="2"
        fill="color-mix(in oklch, var(--success) 15%, transparent)"
        stroke={STROKE} strokeWidth="1" />
      <text x="220" y="164" textAnchor="middle" className="text-[10px] fill-current font-mono">2</text>
      <rect x={298} y={150} width="24" height="20" rx="2"
        fill="color-mix(in oklch, var(--muted) 20%, transparent)"
        stroke={STROKE} strokeWidth="1" strokeDasharray="3,2" />
      <text x="310" y="164" textAnchor="middle" className="text-[10px] fill-current font-mono opacity-50">?</text>
      {/* X over pruned leaf */}
      <g stroke="color-mix(in oklch, var(--destructive) 80%, transparent)" strokeWidth="1.5">
        <line x1="300" y1="152" x2="320" y2="168" />
        <line x1="320" y1="152" x2="300" y2="168" />
      </g>
      <text x="180" y="195" textAnchor="middle" className="text-[9px] fill-current opacity-70">
        MAX har sikret 5. Høyre MIN er allerede ≤2. α ≥ β → klipp resten.
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Alpha-beta pruning — kuttet gren vil aldri påvirke roten.
    </figcaption>
  </figure>
);

// ============= MDP GRID-WORLD MED POLICY =============
export const MdpGridPolicy: FC = () => {
  const cells = [
    ["→", "→", "→", "G"],
    ["↑", "#", "↑", "−"],
    ["↑", "←", "↑", "←"],
  ];
  return (
    <figure className="my-4">
      <svg viewBox="0 0 240 180" className="w-full max-w-sm mx-auto text-foreground">
        {cells.flatMap((row, r) =>
          row.map((c, i) => {
            const x = i * 56 + 8;
            const y = r * 56 + 8;
            const isGoal = c === "G";
            const isTrap = c === "−";
            const isWall = c === "#";
            const fill = isGoal
              ? "color-mix(in oklch, var(--success) 35%, transparent)"
              : isTrap
              ? "color-mix(in oklch, var(--destructive) 30%, transparent)"
              : isWall
              ? "color-mix(in oklch, var(--muted) 70%, transparent)"
              : "color-mix(in oklch, var(--brand) 8%, transparent)";
            return (
              <g key={`${r}-${i}`}>
                <rect x={x} y={y} width="48" height="48" rx="3"
                  fill={fill} stroke={STROKE} strokeWidth="0.8" />
                <text x={x + 24} y={y + 32} textAnchor="middle"
                  className={isGoal || isTrap ? "text-[14px] fill-current font-bold" : "text-[18px] fill-current font-mono"}>
                  {isGoal ? "+1" : isTrap ? "−1" : isWall ? "" : c}
                </text>
              </g>
            );
          })
        )}
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        4×3 grid-world — pilen i hver celle er optimal handling under π*.
      </figcaption>
    </figure>
  );
};

// ============= VALUE ITERATION SWEEP =============
// Tre snapshots av V(s) over tre iterasjoner.
export const ValueIterationSweep: FC = () => {
  const snapshots = [
    { k: 0, vals: [[0, 0, 0, 1], [0, 0, 0, -1], [0, 0, 0, 0]] },
    { k: 3, vals: [[0.5, 0.7, 0.85, 1], [0.4, 0, 0.6, -1], [0.3, 0.35, 0.45, 0.3]] },
    { k: 20, vals: [[0.81, 0.87, 0.92, 1], [0.76, 0, 0.66, -1], [0.71, 0.66, 0.61, 0.39]] },
  ];
  return (
    <figure className="my-4">
      <div className="grid grid-cols-3 gap-2 max-w-2xl mx-auto">
        {snapshots.map((s) => (
          <div key={s.k}>
            <div className="text-center text-[10px] font-mono mb-1 text-muted-foreground">k = {s.k}</div>
            <svg viewBox="0 0 120 90" className="w-full text-foreground">
              {s.vals.flatMap((row, r) =>
                row.map((v, i) => {
                  const x = i * 28 + 4;
                  const y = r * 28 + 4;
                  const intensity = Math.max(0, Math.min(1, v));
                  const isNeg = v < 0;
                  const fill = isNeg
                    ? `color-mix(in oklch, var(--destructive) ${Math.abs(v) * 35}%, transparent)`
                    : `color-mix(in oklch, var(--success) ${intensity * 35}%, transparent)`;
                  return (
                    <g key={`${r}-${i}`}>
                      <rect x={x} y={y} width="26" height="26" rx="2"
                        fill={fill} stroke={STROKE} strokeWidth="0.6" />
                      <text x={x + 13} y={y + 17} textAnchor="middle"
                        className="text-[7px] fill-current font-mono">{v.toFixed(2)}</text>
                    </g>
                  );
                })
              )}
            </svg>
          </div>
        ))}
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        Value iteration — verdier sprer seg utover fra terminal-belønninger ved hver sweep.
      </figcaption>
    </figure>
  );
};

// ============= BELLMAN BACKUP DIAGRAM =============
// "Neste-verdi = belønning + γ × max neste"
export const BellmanBackup: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 380 160" className="w-full max-w-md mx-auto text-foreground">
      {/* Current state */}
      <circle cx="60" cy="80" r="22"
        fill="color-mix(in oklch, var(--brand) 25%, transparent)"
        stroke={STROKE} strokeWidth="1" />
      <text x="60" y="85" textAnchor="middle" className="text-[12px] fill-current font-mono font-semibold">V(s)</text>
      {/* Three actions */}
      <g stroke={STROKE} strokeWidth="1" fill="none" opacity="0.6">
        <line x1="82" y1="70" x2="180" y2="30" />
        <line x1="82" y1="80" x2="180" y2="80" />
        <line x1="82" y1="90" x2="180" y2="130" />
      </g>
      <text x="135" y="42" className="text-[8px] fill-current opacity-70" textAnchor="middle">a₁</text>
      <text x="135" y="74" className="text-[8px] fill-current opacity-70" textAnchor="middle">a₂</text>
      <text x="135" y="124" className="text-[8px] fill-current opacity-70" textAnchor="middle">a₃</text>
      {/* Successor states with rewards */}
      {[
        { y: 30, r: "+1", v: "0.8", best: false },
        { y: 80, r: "0", v: "0.9", best: true },
        { y: 130, r: "−1", v: "0.4", best: false },
      ].map((s, i) => (
        <g key={i}>
          <circle cx="200" cy={s.y} r="16"
            fill={s.best ? "color-mix(in oklch, var(--success) 30%, transparent)" : "color-mix(in oklch, var(--muted) 40%, transparent)"}
            stroke={STROKE} strokeWidth={s.best ? "1.5" : "0.8"} />
          <text x="200" y={s.y + 4} textAnchor="middle" className="text-[9px] fill-current font-mono">{s.v}</text>
          <text x="225" y={s.y + 4} className="text-[8px] fill-current opacity-70">r={s.r}</text>
        </g>
      ))}
      {/* Equation */}
      <text x="190" y="155" textAnchor="middle" className="text-[10px] fill-current font-mono opacity-90">
        V(s) ← max [ r + γ · V(s') ]
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Bellman-backup — verdien i s = beste handlings forventede belønning + diskontert neste verdi.
    </figcaption>
  </figure>
);

// ============= BANDIT ARMS =============
// Tre slot-armer som progress bars med Q-estimat.
export const BanditArms: FC = () => {
  const arms = [
    { name: "A", q: 0.42, n: 12, color: "var(--brand)" },
    { name: "B", q: 0.71, n: 38, color: "var(--success)" },
    { name: "C", q: 0.28, n: 5, color: "var(--muted)" },
  ];
  return (
    <figure className="my-4">
      <svg viewBox="0 0 320 160" className="w-full max-w-md mx-auto text-foreground">
        {arms.map((a, i) => {
          const y = 20 + i * 45;
          return (
            <g key={a.name}>
              <text x="10" y={y + 18} className="text-[12px] fill-current font-mono font-semibold">{a.name}</text>
              <rect x="40" y={y + 4} width="220" height="22" rx="3"
                fill="color-mix(in oklch, var(--muted) 30%, transparent)"
                stroke={STROKE} strokeWidth="0.5" />
              <rect x="40" y={y + 4} width={a.q * 220} height="22" rx="3"
                fill={`color-mix(in oklch, ${a.color} 45%, transparent)`}
                stroke={STROKE} strokeWidth="0.5" />
              <text x="270" y={y + 18} className="text-[10px] fill-current font-mono">
                Q={a.q.toFixed(2)} n={a.n}
              </text>
            </g>
          );
        })}
        <text x="160" y="155" textAnchor="middle" className="text-[10px] fill-current opacity-70">
          B har høyest Q og er prøvd flest ganger
        </text>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        K-armet bandit — hver arms estimat Q(a) og antall pull n(a).
      </figcaption>
    </figure>
  );
};

// ============= EPSILON-GREEDY VS UCB =============
export const EpsGreedyVsUcb: FC = () => (
  <figure className="my-4">
    <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto text-[11px]">
      <div className="rounded border border-border p-3">
        <div className="font-semibold mb-1">ε-greedy</div>
        <div className="font-mono text-[10px] opacity-80 mb-2">
          1−ε: argmax Q(a)<br />
          ε:   uniform random
        </div>
        <div className="text-[10px] opacity-70">Lineær regret med fast ε. Enkel.</div>
      </div>
      <div className="rounded border border-border p-3">
        <div className="font-semibold mb-1">UCB1</div>
        <div className="font-mono text-[10px] opacity-80 mb-2">
          argmax [Q + c·√(ln t / N(a))]
        </div>
        <div className="text-[10px] opacity-70">O(ln t) regret. Sjeldent prøvde armer får bonus.</div>
      </div>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      To strategier for explore-vs-exploit.
    </figcaption>
  </figure>
);

// ============= REGRET CURVE =============
// log vs linear vs greedy
export const RegretCurves: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 320 180" className="w-full max-w-md mx-auto text-foreground">
      {/* Axes */}
      <line x1="40" y1="150" x2="300" y2="150" stroke={STROKE} strokeWidth="1" />
      <line x1="40" y1="20" x2="40" y2="150" stroke={STROKE} strokeWidth="1" />
      <text x="170" y="170" textAnchor="middle" className="text-[10px] fill-current opacity-70">tidssteg t</text>
      <text x="10" y="85" className="text-[10px] fill-current opacity-70" transform="rotate(-90 10 85)">regret L_T</text>
      {/* Curves */}
      {/* Greedy: linear */}
      <path d="M40,150 L300,30" stroke="color-mix(in oklch, var(--destructive) 80%, transparent)"
        strokeWidth="1.5" fill="none" />
      <text x="280" y="38" className="text-[9px] fill-current font-mono">greedy</text>
      {/* eps-fixed: linear lower slope */}
      <path d="M40,150 L300,60" stroke="color-mix(in oklch, var(--brand) 70%, transparent)"
        strokeWidth="1.5" fill="none" />
      <text x="280" y="68" className="text-[9px] fill-current font-mono">ε-fast</text>
      {/* UCB: log */}
      <path d="M40,150 Q120,110 200,100 T300,90" stroke="color-mix(in oklch, var(--success) 80%, transparent)"
        strokeWidth="1.5" fill="none" />
      <text x="280" y="98" className="text-[9px] fill-current font-mono">UCB1</text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Regret-vekst — UCB1 og Thompson gir O(ln T), pur grådig gir Θ(T).
    </figcaption>
  </figure>
);

// ============= KNN BOUNDARY (2D scatter, k=1/3/5) =============
export const KnnBoundary: FC = () => {
  // hardkodede punkter
  const pts = [
    { x: 30, y: 40, c: "A" }, { x: 50, y: 35, c: "A" }, { x: 45, y: 60, c: "A" },
    { x: 70, y: 55, c: "A" }, { x: 60, y: 75, c: "A" },
    { x: 110, y: 40, c: "B" }, { x: 130, y: 55, c: "B" }, { x: 115, y: 75, c: "B" },
    { x: 140, y: 80, c: "B" }, { x: 125, y: 95, c: "B" },
  ];
  const q = { x: 88, y: 65 };
  // sortert etter avstand
  const sorted = [...pts]
    .map((p) => ({ ...p, d: Math.hypot(p.x - q.x, p.y - q.y) }))
    .sort((a, b) => a.d - b.d);
  return (
    <figure className="my-4">
      <svg viewBox="0 0 200 140" className="w-full max-w-sm mx-auto text-foreground">
        <rect x="10" y="10" width="180" height="120" rx="3" fill="none"
          stroke={STROKE} strokeWidth="0.5" opacity="0.4" />
        {/* k=5 sirkler — vises som ringer rundt query */}
        <circle cx={q.x} cy={q.y} r={sorted[4].d}
          fill="none" stroke="color-mix(in oklch, var(--brand) 50%, transparent)"
          strokeWidth="0.8" strokeDasharray="2,2" />
        <circle cx={q.x} cy={q.y} r={sorted[2].d}
          fill="none" stroke="color-mix(in oklch, var(--success) 60%, transparent)"
          strokeWidth="0.8" strokeDasharray="2,2" />
        <circle cx={q.x} cy={q.y} r={sorted[0].d}
          fill="none" stroke="color-mix(in oklch, var(--destructive) 70%, transparent)"
          strokeWidth="0.8" />
        {/* Punkter */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5"
            fill={p.c === "A"
              ? "color-mix(in oklch, var(--brand) 50%, transparent)"
              : "color-mix(in oklch, var(--success) 50%, transparent)"}
            stroke={STROKE} strokeWidth="0.5" />
        ))}
        {/* Query */}
        <g>
          <circle cx={q.x} cy={q.y} r="4.5"
            fill="color-mix(in oklch, var(--destructive) 60%, transparent)"
            stroke={STROKE} strokeWidth="1" />
          <text x={q.x + 7} y={q.y + 3} className="text-[8px] fill-current font-mono">?</text>
        </g>
        {/* Legend */}
        <g className="text-[7px] fill-current">
          <text x="12" y="20">k=1</text>
          <text x="32" y="20">k=3</text>
          <text x="52" y="20">k=5</text>
        </g>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        k-NN — ringene viser de k nærmeste. Større k → glattere grense, mer bias.
      </figcaption>
    </figure>
  );
};

// ============= HILL CLIMBING (1D landskap, lokalt max) =============
export const HillClimbing: FC = () => {
  // generér en kurve med to topper
  const pts: string[] = [];
  for (let i = 0; i <= 100; i++) {
    const x = i * 3;
    const t = i / 100;
    const y = 130 - 50 * Math.exp(-Math.pow((t - 0.3) * 5, 2)) - 80 * Math.exp(-Math.pow((t - 0.75) * 5, 2));
    pts.push(`${x},${y}`);
  }
  return (
    <figure className="my-4">
      <svg viewBox="0 0 320 160" className="w-full max-w-md mx-auto text-foreground">
        <polyline points={pts.join(" ")} fill="none" stroke={STROKE} strokeWidth="1.2" />
        {/* Agent fanget i lokalt max ~x=90 */}
        <circle cx="93" cy="73" r="5"
          fill="color-mix(in oklch, var(--destructive) 70%, transparent)"
          stroke={STROKE} strokeWidth="1" />
        <text x="93" y="62" textAnchor="middle" className="text-[8px] fill-current opacity-80">lokalt</text>
        <text x="93" y="55" textAnchor="middle" className="text-[8px] fill-current opacity-80">max</text>
        {/* Globalt max marker */}
        <circle cx="227" cy="46" r="4"
          fill="color-mix(in oklch, var(--success) 70%, transparent)"
          stroke={STROKE} strokeWidth="1" />
        <text x="227" y="36" textAnchor="middle" className="text-[8px] fill-current opacity-80">globalt</text>
        {/* Akser/baseline */}
        <line x1="0" y1="135" x2="320" y2="135" stroke={STROKE} strokeWidth="0.4" opacity="0.4" />
        <text x="160" y="155" textAnchor="middle" className="text-[10px] fill-current opacity-70">parameter</text>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        Hill climbing — alltid gå oppover lokalt. Kan sitte fast i lokalt maksimum.
      </figcaption>
    </figure>
  );
};

// ============= GRADIENT DESCENT TRAPPER (1D loss bowl) =============
export const GradientDescent: FC = () => {
  // Convex bowl + sequence of step points
  const pts: string[] = [];
  for (let i = 0; i <= 100; i++) {
    const x = i * 3;
    const t = (i - 50) / 30;
    const y = 30 + t * t * 25;
    pts.push(`${x},${Math.min(140, y)}`);
  }
  // Gradient steps — eksponentielt nærmere bunnen
  const stepXs = [30, 60, 95, 125, 145];
  const bowl = (xx: number) => {
    const t = (xx / 3 - 50) / 30;
    return Math.min(140, 30 + t * t * 25);
  };
  return (
    <figure className="my-4">
      <svg viewBox="0 0 320 160" className="w-full max-w-md mx-auto text-foreground">
        <polyline points={pts.join(" ")} fill="none" stroke={STROKE} strokeWidth="1.2" />
        {stepXs.map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={bowl(x)} r="3.5"
              fill="color-mix(in oklch, var(--brand) 60%, transparent)"
              stroke={STROKE} strokeWidth="0.8" />
            {i < stepXs.length - 1 && (
              <line x1={x} y1={bowl(x)} x2={stepXs[i + 1]} y2={bowl(stepXs[i + 1])}
                stroke={STROKE} strokeWidth="0.8" opacity="0.6"
                markerEnd="url(#gd-arrow)" />
            )}
          </g>
        ))}
        <defs>
          <marker id="gd-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 z" fill={STROKE} />
          </marker>
        </defs>
        <text x="160" y="155" textAnchor="middle" className="text-[10px] fill-current opacity-70">parameter θ</text>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        Gradient descent — θ ← θ − α·∇L(θ), steg blir kortere nær minimum.
      </figcaption>
    </figure>
  );
};

// ============= BFS VS DFS TREE-TRAVERSAL =============
export const BfsVsDfs: FC = () => {
  // Felles tre, to nummereringer
  const bfsOrder = [1, 2, 3, 4, 5, 6, 7];
  const dfsOrder = [1, 2, 4, 5, 3, 6, 7];
  const positions = [
    { x: 80, y: 20 },
    { x: 35, y: 60 },
    { x: 125, y: 60 },
    { x: 15, y: 100 },
    { x: 55, y: 100 },
    { x: 105, y: 100 },
    { x: 145, y: 100 },
  ];
  const edges: [number, number][] = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6],
  ];
  const Tree: FC<{ order: number[]; title: string; color: string }> = ({ order, title, color }) => (
    <div>
      <div className="text-center text-[10px] font-mono mb-1 text-muted-foreground">{title}</div>
      <svg viewBox="0 0 170 130" className="w-full text-foreground">
        {edges.map(([a, b], i) => (
          <line key={i}
            x1={positions[a].x} y1={positions[a].y}
            x2={positions[b].x} y2={positions[b].y}
            stroke={STROKE} strokeWidth="0.8" opacity="0.5" />
        ))}
        {positions.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="10"
              fill={`color-mix(in oklch, ${color} 30%, transparent)`}
              stroke={STROKE} strokeWidth="0.8" />
            <text x={p.x} y={p.y + 4} textAnchor="middle"
              className="text-[10px] fill-current font-mono font-semibold">{order[i]}</text>
          </g>
        ))}
      </svg>
    </div>
  );
  return (
    <figure className="my-4">
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        <Tree order={bfsOrder} title="BFS — nivå for nivå" color="var(--brand)" />
        <Tree order={dfsOrder} title="DFS — dypest først" color="var(--success)" />
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        BFS bruker kø (FIFO), DFS bruker stack (LIFO). Tallene viser besøks-rekkefølge.
      </figcaption>
    </figure>
  );
};

// ============= A* GRID MED f/g/h-tall =============
export const AStarGrid: FC = () => {
  // 5×4 grid med startcelle (0,0), målcelle (4,3), én vegg
  type Cell = { g?: number; h?: number; state?: "open" | "closed" | "start" | "goal" | "wall" | "path" };
  const grid: Cell[][] = [
    [{ state: "start", g: 0, h: 7 }, { state: "path", g: 1, h: 6 }, { state: "open", g: 2, h: 5 }, { state: "open" }, { state: "open" }],
    [{ state: "open" }, { state: "wall" }, { state: "path", g: 3, h: 4 }, { state: "open" }, { state: "open" }],
    [{ state: "open" }, { state: "wall" }, { state: "path", g: 4, h: 3 }, { state: "path", g: 5, h: 2 }, { state: "path", g: 6, h: 1 }],
    [{ state: "open" }, { state: "open" }, { state: "open" }, { state: "open" }, { state: "goal", g: 7, h: 0 }],
  ];
  const color = (s?: Cell["state"]) => {
    if (s === "start") return "color-mix(in oklch, var(--brand) 50%, transparent)";
    if (s === "goal") return "color-mix(in oklch, var(--success) 50%, transparent)";
    if (s === "wall") return "color-mix(in oklch, var(--muted) 80%, transparent)";
    if (s === "path") return "color-mix(in oklch, var(--success) 22%, transparent)";
    if (s === "closed") return "color-mix(in oklch, var(--brand) 12%, transparent)";
    return "transparent";
  };
  return (
    <figure className="my-4">
      <svg viewBox="0 0 260 220" className="w-full max-w-md mx-auto text-foreground">
        {grid.flatMap((row, r) =>
          row.map((c, i) => {
            const x = i * 48 + 8;
            const y = r * 48 + 8;
            return (
              <g key={`${r}-${i}`}>
                <rect x={x} y={y} width="44" height="44" rx="2"
                  fill={color(c.state)} stroke={STROKE} strokeWidth="0.6" />
                {c.g !== undefined && (
                  <>
                    <text x={x + 4} y={y + 12} className="text-[7px] fill-current font-mono opacity-80">g={c.g}</text>
                    <text x={x + 24} y={y + 12} className="text-[7px] fill-current font-mono opacity-80">h={c.h}</text>
                    <text x={x + 22} y={y + 32} textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">
                      f={(c.g! + c.h!)}
                    </text>
                  </>
                )}
              </g>
            );
          })
        )}
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        A* — f(n) = g(n) + h(n). g = sti-kost hittil, h = heuristikk-estimat til mål.
      </figcaption>
    </figure>
  );
};

// ============= NEURALT NETT (1 hidden layer) =============
export const NeuralNetLayers: FC = () => {
  const xs = [40, 100, 160, 220];
  const layers = [
    { xIdx: 0, count: 3, label: "input" },
    { xIdx: 1, count: 4, label: "hidden" },
    { xIdx: 2, count: 4, label: "hidden" },
    { xIdx: 3, count: 2, label: "output" },
  ];
  const yOf = (count: number, i: number) => 30 + i * (100 / Math.max(count - 1, 1));
  const colorOf = (label: string) =>
    label === "input" ? "var(--brand)" : label === "output" ? "var(--success)" : "var(--muted)";
  return (
    <figure className="my-4">
      <svg viewBox="0 0 260 160" className="w-full max-w-md mx-auto text-foreground">
        {/* Edges */}
        {layers.slice(0, -1).map((L, li) => {
          const Lnext = layers[li + 1];
          const x1 = xs[L.xIdx];
          const x2 = xs[Lnext.xIdx];
          return Array.from({ length: L.count }).flatMap((_, i) =>
            Array.from({ length: Lnext.count }).map((_, j) => (
              <line key={`${li}-${i}-${j}`}
                x1={x1} y1={yOf(L.count, i)}
                x2={x2} y2={yOf(Lnext.count, j)}
                stroke={STROKE} strokeWidth="0.3" opacity="0.4" />
            ))
          );
        })}
        {/* Nodes */}
        {layers.flatMap((L) =>
          Array.from({ length: L.count }).map((_, i) => (
            <circle key={`${L.xIdx}-${i}`} cx={xs[L.xIdx]} cy={yOf(L.count, i)} r="6"
              fill={`color-mix(in oklch, ${colorOf(L.label)} 40%, transparent)`}
              stroke={STROKE} strokeWidth="0.8" />
          ))
        )}
        {/* Labels */}
        {layers.map((L) => (
          <text key={L.xIdx} x={xs[L.xIdx]} y="150" textAnchor="middle"
            className="text-[9px] fill-current opacity-70">{L.label}</text>
        ))}
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        Feed-forward NN — input → flere skjulte lag (vekter+aktivering) → output.
      </figcaption>
    </figure>
  );
};

// ============= PERCEPTRON 2D (vektvektor som dreier) =============
export const Perceptron2D: FC = () => {
  // To klasser, lineær grense
  const pos = [{ x: 30, y: 80 }, { x: 50, y: 60 }, { x: 40, y: 100 }, { x: 60, y: 90 }];
  const neg = [{ x: 130, y: 40 }, { x: 150, y: 60 }, { x: 140, y: 30 }, { x: 160, y: 50 }];
  return (
    <figure className="my-4">
      <svg viewBox="0 0 200 140" className="w-full max-w-sm mx-auto text-foreground">
        {/* Grenselinje w·x = 0 */}
        <line x1="40" y1="130" x2="170" y2="10"
          stroke={STROKE} strokeWidth="1.2" strokeDasharray="4,3" />
        {/* Vektvektor w (normal til linja) */}
        <g stroke="color-mix(in oklch, var(--brand) 80%, transparent)" strokeWidth="1.5">
          <line x1="100" y1="70" x2="135" y2="100" markerEnd="url(#pp-arr)" />
        </g>
        <defs>
          <marker id="pp-arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 z" fill="color-mix(in oklch, var(--brand) 80%, transparent)" />
          </marker>
        </defs>
        <text x="140" y="115" className="text-[9px] fill-current font-mono">w</text>
        {/* Punkter */}
        {pos.map((p, i) => (
          <circle key={`p${i}`} cx={p.x} cy={p.y} r="3.5"
            fill="color-mix(in oklch, var(--success) 50%, transparent)"
            stroke={STROKE} strokeWidth="0.5" />
        ))}
        {neg.map((p, i) => (
          <g key={`n${i}`}>
            <line x1={p.x - 3} y1={p.y - 3} x2={p.x + 3} y2={p.y + 3}
              stroke="color-mix(in oklch, var(--destructive) 70%, transparent)" strokeWidth="1.2" />
            <line x1={p.x + 3} y1={p.y - 3} x2={p.x - 3} y2={p.y + 3}
              stroke="color-mix(in oklch, var(--destructive) 70%, transparent)" strokeWidth="1.2" />
          </g>
        ))}
        {/* Labels */}
        <text x="50" y="20" className="text-[9px] fill-current opacity-70">+ klasse</text>
        <text x="120" y="135" className="text-[9px] fill-current opacity-70">− klasse</text>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        Perceptron — vektvektor w står normalt på beslutningsgrensen w·x + b = 0.
      </figcaption>
    </figure>
  );
};

// ============= Q-LEARNING UPDATE =============
// Visualiserer Q(s,a) ← Q(s,a) + α·(r + γ max Q' − Q)
export const QLearningUpdate: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 380 150" className="w-full max-w-md mx-auto text-foreground">
      {/* s-state */}
      <rect x="20" y="50" width="60" height="50" rx="4"
        fill="color-mix(in oklch, var(--brand) 25%, transparent)"
        stroke={STROKE} strokeWidth="1" />
      <text x="50" y="73" textAnchor="middle" className="text-[10px] fill-current font-mono opacity-80">s</text>
      <text x="50" y="90" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">Q(s,a)</text>
      {/* Action arrow with reward */}
      <line x1="85" y1="75" x2="180" y2="75" stroke={STROKE} strokeWidth="1" markerEnd="url(#ql-arr)" />
      <defs>
        <marker id="ql-arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 z" fill={STROKE} />
        </marker>
      </defs>
      <text x="130" y="68" textAnchor="middle" className="text-[9px] fill-current opacity-80">a</text>
      <text x="130" y="92" textAnchor="middle" className="text-[9px] fill-current font-mono">r = +1</text>
      {/* s' state with max Q */}
      <rect x="190" y="50" width="80" height="50" rx="4"
        fill="color-mix(in oklch, var(--success) 25%, transparent)"
        stroke={STROKE} strokeWidth="1" />
      <text x="230" y="73" textAnchor="middle" className="text-[10px] fill-current font-mono opacity-80">s'</text>
      <text x="230" y="90" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">max Q(s',·)</text>
      {/* Update equation */}
      <text x="190" y="135" textAnchor="middle" className="text-[10px] fill-current font-mono">
        Q ← Q + α·(r + γ·maxQ' − Q)
      </text>
      <text x="190" y="20" textAnchor="middle" className="text-[9px] fill-current opacity-70">
        TD-mål = r + γ · max_a' Q(s', a')
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Q-learning — bootstrap Q(s,a) mot belønning + diskontert maks-Q i neste state.
    </figcaption>
  </figure>
);

// ============= K-MEANS ITERATION =============
export const KMeansSteps: FC = () => {
  const pts = [
    { x: 30, y: 30 }, { x: 40, y: 40 }, { x: 50, y: 35 },
    { x: 100, y: 100 }, { x: 110, y: 110 }, { x: 95, y: 105 },
    { x: 35, y: 90 }, { x: 45, y: 100 }, { x: 30, y: 110 },
  ];
  // 3 snapshots — random init, then converged
  const snapshots = [
    {
      title: "init",
      centers: [{ x: 50, y: 50 }, { x: 80, y: 80 }, { x: 110, y: 40 }],
      assign: [0, 0, 0, 1, 1, 1, 0, 0, 1],
    },
    {
      title: "iter 2",
      centers: [{ x: 40, y: 60 }, { x: 90, y: 95 }, { x: 100, y: 35 }],
      assign: [0, 0, 0, 1, 1, 1, 0, 0, 0],
    },
    {
      title: "konvergert",
      centers: [{ x: 40, y: 35 }, { x: 102, y: 105 }, { x: 37, y: 100 }],
      assign: [0, 0, 0, 1, 1, 1, 2, 2, 2],
    },
  ];
  const colors = ["var(--brand)", "var(--success)", "var(--destructive)"];
  return (
    <figure className="my-4">
      <div className="grid grid-cols-3 gap-2 max-w-2xl mx-auto">
        {snapshots.map((s) => (
          <div key={s.title}>
            <div className="text-center text-[10px] font-mono mb-1 text-muted-foreground">{s.title}</div>
            <svg viewBox="0 0 140 140" className="w-full text-foreground">
              <rect x="2" y="2" width="136" height="136" rx="3" fill="none"
                stroke={STROKE} strokeWidth="0.4" opacity="0.4" />
              {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3"
                  fill={`color-mix(in oklch, ${colors[s.assign[i]]} 45%, transparent)`}
                  stroke={STROKE} strokeWidth="0.4" />
              ))}
              {s.centers.map((c, i) => (
                <g key={i}>
                  <line x1={c.x - 5} y1={c.y} x2={c.x + 5} y2={c.y}
                    stroke={`color-mix(in oklch, ${colors[i]} 90%, transparent)`} strokeWidth="1.5" />
                  <line x1={c.x} y1={c.y - 5} x2={c.x} y2={c.y + 5}
                    stroke={`color-mix(in oklch, ${colors[i]} 90%, transparent)`} strokeWidth="1.5" />
                </g>
              ))}
            </svg>
          </div>
        ))}
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        k-Means (Lloyd) — assign-til-nærmeste og oppdater senter, til ingen punkt skifter cluster.
      </figcaption>
    </figure>
  );
};

// ============= PCA: rotasjon mot største varians-retning =============
export const PcaProjection: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 220 160" className="w-full max-w-md mx-auto text-foreground">
      {/* Aksene */}
      <line x1="10" y1="80" x2="210" y2="80" stroke={STROKE} strokeWidth="0.6" opacity="0.5" />
      <line x1="110" y1="10" x2="110" y2="150" stroke={STROKE} strokeWidth="0.6" opacity="0.5" />
      {/* Punktsky — diagonal */}
      {Array.from({ length: 24 }).map((_, i) => {
        const t = (i / 23 - 0.5) * 160;
        const noise = ((i * 13) % 7 - 3) * 2;
        const x = 110 + t * 0.6;
        const y = 80 - t * 0.45 + noise;
        return (
          <circle key={i} cx={x} cy={y} r="2.5"
            fill="color-mix(in oklch, var(--brand) 40%, transparent)"
            stroke={STROKE} strokeWidth="0.3" />
        );
      })}
      {/* PC1 (større pil, diagonal) */}
      <line x1="30" y1="120" x2="190" y2="40"
        stroke="color-mix(in oklch, var(--success) 80%, transparent)"
        strokeWidth="2" markerEnd="url(#pca-arr1)" />
      {/* PC2 (mindre pil, perpendikulær) */}
      <line x1="80" y1="35" x2="130" y2="100"
        stroke="color-mix(in oklch, var(--destructive) 70%, transparent)"
        strokeWidth="1.5" markerEnd="url(#pca-arr2)" />
      <defs>
        <marker id="pca-arr1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 z" fill="color-mix(in oklch, var(--success) 80%, transparent)" />
        </marker>
        <marker id="pca-arr2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 z" fill="color-mix(in oklch, var(--destructive) 70%, transparent)" />
        </marker>
      </defs>
      <text x="190" y="35" className="text-[9px] fill-current font-mono">PC1</text>
      <text x="135" y="100" className="text-[9px] fill-current font-mono">PC2</text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      PCA — PC1 langs retning med størst varians, PC2 ortogonal og kortere.
    </figcaption>
  </figure>
);

// ============= BIAS-VARIANCE TRADEOFF =============
export const BiasVarianceCurve: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 320 180" className="w-full max-w-md mx-auto text-foreground">
      <line x1="40" y1="150" x2="300" y2="150" stroke={STROKE} strokeWidth="1" />
      <line x1="40" y1="20" x2="40" y2="150" stroke={STROKE} strokeWidth="1" />
      <text x="170" y="170" textAnchor="middle" className="text-[10px] fill-current opacity-70">modellkompleksitet</text>
      <text x="10" y="85" className="text-[10px] fill-current opacity-70" transform="rotate(-90 10 85)">forventet feil</text>
      {/* Bias² — synker */}
      <path d="M50,40 Q120,90 280,140" fill="none"
        stroke="color-mix(in oklch, var(--brand) 80%, transparent)" strokeWidth="1.5" />
      <text x="260" y="135" className="text-[9px] fill-current font-mono">Bias²</text>
      {/* Variance — vokser */}
      <path d="M50,145 Q170,135 280,40" fill="none"
        stroke="color-mix(in oklch, var(--destructive) 80%, transparent)" strokeWidth="1.5" />
      <text x="260" y="48" className="text-[9px] fill-current font-mono">Variance</text>
      {/* Total — U-form */}
      <path d="M50,50 Q170,80 290,55" fill="none"
        stroke="color-mix(in oklch, var(--success) 80%, transparent)" strokeWidth="2" />
      <text x="155" y="78" className="text-[9px] fill-current font-mono">Total</text>
      {/* Sweet spot */}
      <line x1="170" y1="80" x2="170" y2="150" stroke={STROKE} strokeWidth="0.6" strokeDasharray="2,2" opacity="0.5" />
      <text x="170" y="160" textAnchor="middle" className="text-[8px] fill-current opacity-70">optimal</text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Bias-variance — total feil minimeres mellom underfitting og overfitting.
    </figcaption>
  </figure>
);

// ============= GA-LØKKE (kromosomer + crossover) =============
export const GaCrossover: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 320 180" className="w-full max-w-md mx-auto text-foreground">
      {/* Parents */}
      <text x="10" y="35" className="text-[10px] fill-current opacity-70">A</text>
      <g>
        {["1", "0", "1", "1", "0", "1"].map((b, i) => (
          <g key={i}>
            <rect x={30 + i * 22} y={20} width="20" height="22" rx="2"
              fill={i < 3 ? "color-mix(in oklch, var(--brand) 35%, transparent)" : "color-mix(in oklch, var(--brand) 15%, transparent)"}
              stroke={STROKE} strokeWidth="0.6" />
            <text x={40 + i * 22} y={36} textAnchor="middle" className="text-[10px] fill-current font-mono">{b}</text>
          </g>
        ))}
      </g>
      <text x="10" y="75" className="text-[10px] fill-current opacity-70">B</text>
      <g>
        {["0", "1", "0", "1", "1", "0"].map((b, i) => (
          <g key={i}>
            <rect x={30 + i * 22} y={60} width="20" height="22" rx="2"
              fill={i < 3 ? "color-mix(in oklch, var(--success) 15%, transparent)" : "color-mix(in oklch, var(--success) 35%, transparent)"}
              stroke={STROKE} strokeWidth="0.6" />
            <text x={40 + i * 22} y={76} textAnchor="middle" className="text-[10px] fill-current font-mono">{b}</text>
          </g>
        ))}
      </g>
      {/* Cut point */}
      <line x1={96} y1={15} x2={96} y2={88} stroke="color-mix(in oklch, var(--destructive) 80%, transparent)" strokeWidth="1" strokeDasharray="3,2" />
      <text x={96} y={12} textAnchor="middle" className="text-[8px] fill-current opacity-70">cut</text>
      {/* Arrow */}
      <line x1="160" y1="100" x2="160" y2="120" stroke={STROKE} strokeWidth="1" markerEnd="url(#ga-arr)" />
      <defs>
        <marker id="ga-arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 z" fill={STROKE} />
        </marker>
      </defs>
      {/* Children */}
      <text x="10" y="145" className="text-[10px] fill-current opacity-70">A'</text>
      <g>
        {["1", "0", "1", "1", "1", "0"].map((b, i) => (
          <g key={i}>
            <rect x={30 + i * 22} y={130} width="20" height="22" rx="2"
              fill={i < 3 ? "color-mix(in oklch, var(--brand) 35%, transparent)" : "color-mix(in oklch, var(--success) 35%, transparent)"}
              stroke={STROKE} strokeWidth="0.6" />
            <text x={40 + i * 22} y={146} textAnchor="middle" className="text-[10px] fill-current font-mono">{b}</text>
          </g>
        ))}
      </g>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      One-point crossover — barn arver venstre fra A, høyre fra B.
    </figcaption>
  </figure>
);

// ============= EM FOR GMM (soft assignment) =============
export const EmGmm: FC = () => {
  const pts = [
    { x: 35, y: 50, p: 0.95 }, { x: 45, y: 65, p: 0.92 }, { x: 55, y: 55, p: 0.88 },
    { x: 130, y: 90, p: 0.05 }, { x: 140, y: 100, p: 0.08 }, { x: 120, y: 80, p: 0.12 },
    { x: 80, y: 75, p: 0.5 }, { x: 85, y: 80, p: 0.55 },
  ];
  return (
    <figure className="my-4">
      <svg viewBox="0 0 200 140" className="w-full max-w-sm mx-auto text-foreground">
        {/* To gaussian-ellipser */}
        <ellipse cx="45" cy="60" rx="32" ry="22"
          fill="none" stroke="color-mix(in oklch, var(--brand) 50%, transparent)" strokeWidth="1" strokeDasharray="3,2" />
        <ellipse cx="130" cy="90" rx="30" ry="20"
          fill="none" stroke="color-mix(in oklch, var(--success) 50%, transparent)" strokeWidth="1" strokeDasharray="3,2" />
        {/* Punkter med fargeblanding (soft assignment) */}
        {pts.map((p, i) => {
          // Bland brand og success ut fra p
          const r = Math.round(p.p * 100);
          return (
            <circle key={i} cx={p.x} cy={p.y} r="4"
              fill={`color-mix(in oklch, var(--brand) ${r * 0.5}%, color-mix(in oklch, var(--success) ${(100 - r) * 0.5}%, transparent))`}
              stroke={STROKE} strokeWidth="0.5" />
          );
        })}
        <text x="20" y="20" className="text-[8px] fill-current opacity-70">cluster 1</text>
        <text x="115" y="125" className="text-[8px] fill-current opacity-70">cluster 2</text>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        EM for GMM — hvert punkt har en posterior γᵢₖ over begge komponenter (soft).
      </figcaption>
    </figure>
  );
};

// ============= ENSEMBLE: BAGGING VS BOOSTING =============
export const BaggingVsBoosting: FC = () => (
  <figure className="my-4">
    <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto text-[11px]">
      <div className="rounded border border-border p-3">
        <div className="font-semibold mb-2 text-center">Bagging (parallell)</div>
        <svg viewBox="0 0 140 90" className="w-full text-foreground">
          <rect x="55" y="5" width="30" height="14" rx="2"
            fill="color-mix(in oklch, var(--brand) 25%, transparent)"
            stroke={STROKE} strokeWidth="0.6" />
          <text x="70" y="15" textAnchor="middle" className="text-[7px] fill-current font-mono">data</text>
          {[20, 60, 100].map((x, i) => (
            <g key={i}>
              <line x1="70" y1="20" x2={x + 15} y2="38" stroke={STROKE} strokeWidth="0.5" opacity="0.5" />
              <rect x={x} y={38} width="30" height="14" rx="2"
                fill="color-mix(in oklch, var(--success) 20%, transparent)"
                stroke={STROKE} strokeWidth="0.6" />
              <text x={x + 15} y="48" textAnchor="middle" className="text-[7px] fill-current font-mono">M{i + 1}</text>
              <line x1={x + 15} y1="52" x2="70" y2="70" stroke={STROKE} strokeWidth="0.5" opacity="0.5" />
            </g>
          ))}
          <rect x="55" y="70" width="30" height="14" rx="2"
            fill="color-mix(in oklch, var(--brand) 35%, transparent)"
            stroke={STROKE} strokeWidth="0.6" />
          <text x="70" y="80" textAnchor="middle" className="text-[7px] fill-current font-mono">vote</text>
        </svg>
        <div className="text-[10px] opacity-70 mt-1">↓ variance</div>
      </div>
      <div className="rounded border border-border p-3">
        <div className="font-semibold mb-2 text-center">Boosting (sekvensiell)</div>
        <svg viewBox="0 0 140 90" className="w-full text-foreground">
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={10 + i * 40} y={35} width="30" height="20" rx="2"
                fill="color-mix(in oklch, var(--brand) 25%, transparent)"
                stroke={STROKE} strokeWidth="0.6" />
              <text x={25 + i * 40} y="49" textAnchor="middle" className="text-[8px] fill-current font-mono">M{i + 1}</text>
              {i < 2 && (
                <line x1={40 + i * 40} y1={45} x2={50 + i * 40} y2={45}
                  stroke={STROKE} strokeWidth="0.8" markerEnd="url(#bb-arr)" />
              )}
            </g>
          ))}
          <defs>
            <marker id="bb-arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 z" fill={STROKE} />
            </marker>
          </defs>
          <text x="70" y="75" textAnchor="middle" className="text-[7px] fill-current opacity-70">hver retter forrige</text>
        </svg>
        <div className="text-[10px] opacity-70 mt-1">↓ bias</div>
      </div>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      Bagging trener uavhengig + stemme. Boosting trener i serie og veier feilene.
    </figcaption>
  </figure>
);

// ============= CONFUSION MATRIX / KLASSE-METRIKKER =============
export const ConfusionMatrix: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 240 200" className="w-full max-w-sm mx-auto text-foreground">
      <text x="120" y="14" textAnchor="middle" className="text-[10px] fill-current opacity-70">predikert</text>
      <text x="14" y="105" textAnchor="middle" className="text-[10px] fill-current opacity-70" transform="rotate(-90 14 105)">faktisk</text>
      <text x="90" y="32" textAnchor="middle" className="text-[9px] fill-current font-mono">+</text>
      <text x="170" y="32" textAnchor="middle" className="text-[9px] fill-current font-mono">−</text>
      <text x="50" y="75" textAnchor="middle" className="text-[9px] fill-current font-mono">+</text>
      <text x="50" y="135" textAnchor="middle" className="text-[9px] fill-current font-mono">−</text>
      {/* Cells */}
      <rect x="70" y="50" width="60" height="50" rx="2" fill="color-mix(in oklch, var(--success) 35%, transparent)" stroke={STROKE} strokeWidth="0.8" />
      <text x="100" y="72" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">TP</text>
      <text x="100" y="86" textAnchor="middle" className="text-[9px] fill-current font-mono">85</text>
      <rect x="140" y="50" width="60" height="50" rx="2" fill="color-mix(in oklch, var(--destructive) 30%, transparent)" stroke={STROKE} strokeWidth="0.8" />
      <text x="170" y="72" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">FN</text>
      <text x="170" y="86" textAnchor="middle" className="text-[9px] fill-current font-mono">10</text>
      <rect x="70" y="110" width="60" height="50" rx="2" fill="color-mix(in oklch, var(--destructive) 30%, transparent)" stroke={STROKE} strokeWidth="0.8" />
      <text x="100" y="132" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">FP</text>
      <text x="100" y="146" textAnchor="middle" className="text-[9px] fill-current font-mono">5</text>
      <rect x="140" y="110" width="60" height="50" rx="2" fill="color-mix(in oklch, var(--success) 35%, transparent)" stroke={STROKE} strokeWidth="0.8" />
      <text x="170" y="132" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">TN</text>
      <text x="170" y="146" textAnchor="middle" className="text-[9px] fill-current font-mono">100</text>
      <text x="120" y="180" textAnchor="middle" className="text-[8px] fill-current opacity-70">
        precision = TP/(TP+FP), recall = TP/(TP+FN)
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Confusion matrix — TP/FP/FN/TN er byggeklossene for nesten alle klasse-metrikker.
    </figcaption>
  </figure>
);

// ============= TFIDF / COSINE — to vektorer =============
export const CosineSim: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 220 160" className="w-full max-w-sm mx-auto text-foreground">
      {/* Akser */}
      <line x1="30" y1="130" x2="200" y2="130" stroke={STROKE} strokeWidth="0.6" opacity="0.5" />
      <line x1="30" y1="20" x2="30" y2="130" stroke={STROKE} strokeWidth="0.6" opacity="0.5" />
      {/* Vektor x */}
      <line x1="30" y1="130" x2="160" y2="40"
        stroke="color-mix(in oklch, var(--brand) 80%, transparent)"
        strokeWidth="1.8" markerEnd="url(#cs-a)" />
      <text x="165" y="45" className="text-[9px] fill-current font-mono">x</text>
      {/* Vektor y — liten vinkel θ */}
      <line x1="30" y1="130" x2="180" y2="60"
        stroke="color-mix(in oklch, var(--success) 80%, transparent)"
        strokeWidth="1.8" markerEnd="url(#cs-b)" />
      <text x="185" y="63" className="text-[9px] fill-current font-mono">y</text>
      {/* Vinkel-bue */}
      <path d="M70,114 A 50 50 0 0 0 75 105" fill="none" stroke={STROKE} strokeWidth="0.6" />
      <text x="80" y="115" className="text-[9px] fill-current font-mono">θ</text>
      <defs>
        <marker id="cs-a" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 z" fill="color-mix(in oklch, var(--brand) 80%, transparent)" />
        </marker>
        <marker id="cs-b" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 z" fill="color-mix(in oklch, var(--success) 80%, transparent)" />
        </marker>
      </defs>
      <text x="110" y="150" textAnchor="middle" className="text-[9px] fill-current font-mono">cos(θ) = (x·y) / (‖x‖·‖y‖)</text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Cosine similarity måler vinkel — liten θ → likhet nær 1.
    </figcaption>
  </figure>
);

// ============= OVERFITTING — under/passe/over =============
export const OverfittingCurves: FC = () => (
  <figure className="my-4">
    <div className="grid grid-cols-3 gap-2 max-w-2xl mx-auto">
      {[
        { title: "underfit", path: "M10,80 L150,30", desc: "for enkel" },
        { title: "passe", path: "M10,90 Q40,60 80,50 T150,30", desc: "fanger trenden" },
        { title: "overfit", path: "M10,90 L25,40 L40,80 L55,30 L70,90 L85,30 L100,90 L115,30 L130,80 L150,30", desc: "fanger støy" },
      ].map((c) => (
        <div key={c.title}>
          <div className="text-center text-[10px] font-mono mb-1 text-muted-foreground">{c.title}</div>
          <svg viewBox="0 0 160 110" className="w-full text-foreground">
            <rect x="2" y="2" width="156" height="106" rx="3" fill="none" stroke={STROKE} strokeWidth="0.4" opacity="0.4" />
            {/* Sanne datapunkter */}
            {[20, 35, 50, 65, 80, 95, 110, 125, 140].map((x, i) => {
              const y = 80 - i * 5 + ((i % 3) - 1) * 10;
              return (
                <circle key={i} cx={x} cy={y} r="2.5"
                  fill="color-mix(in oklch, var(--brand) 45%, transparent)"
                  stroke={STROKE} strokeWidth="0.3" />
              );
            })}
            <path d={c.path} fill="none"
              stroke="color-mix(in oklch, var(--success) 80%, transparent)" strokeWidth="1.2" />
          </svg>
          <div className="text-center text-[9px] opacity-60 mt-1">{c.desc}</div>
        </div>
      ))}
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      Modell-tilpasning — undertilpasset, godt tilpasset, overtilpasset.
    </figcaption>
  </figure>
);

// ============= TRAIN-VAL-TEST SPLIT =============
export const TrainValTest: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 320 80" className="w-full max-w-md mx-auto text-foreground">
      <rect x="10" y="20" width="180" height="36" rx="3"
        fill="color-mix(in oklch, var(--brand) 30%, transparent)" stroke={STROKE} strokeWidth="0.8" />
      <text x="100" y="44" textAnchor="middle" className="text-[11px] fill-current font-mono font-semibold">train (60%)</text>
      <rect x="195" y="20" width="60" height="36" rx="3"
        fill="color-mix(in oklch, var(--success) 30%, transparent)" stroke={STROKE} strokeWidth="0.8" />
      <text x="225" y="44" textAnchor="middle" className="text-[11px] fill-current font-mono font-semibold">val (20%)</text>
      <rect x="260" y="20" width="50" height="36" rx="3"
        fill="color-mix(in oklch, var(--muted) 60%, transparent)" stroke={STROKE} strokeWidth="0.8" />
      <text x="285" y="44" textAnchor="middle" className="text-[11px] fill-current font-mono font-semibold">test (20%)</text>
      <text x="160" y="74" textAnchor="middle" className="text-[9px] fill-current opacity-70">
        bare test brukes til endelig rapport
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Datasplitt — train trener, val justerer hyperparametre, test rapporterer.
    </figcaption>
  </figure>
);

// ============= CROSS-VALIDATION (K-fold) =============
export const CrossValidation: FC = () => {
  const folds = 5;
  const testIdx = [0, 1, 2, 3, 4];
  return (
    <figure className="my-4">
      <svg viewBox="0 0 320 170" className="w-full max-w-md mx-auto text-foreground">
        {testIdx.map((ti, row) => (
          <g key={row}>
            <text x="6" y={row * 28 + 24} className="text-[9px] fill-current font-mono opacity-70">fold {row + 1}</text>
            {Array.from({ length: folds }).map((_, c) => {
              const isTest = c === ti;
              return (
                <rect key={c} x={50 + c * 50} y={row * 28 + 10} width="46" height="20" rx="2"
                  fill={isTest
                    ? "color-mix(in oklch, var(--destructive) 40%, transparent)"
                    : "color-mix(in oklch, var(--brand) 25%, transparent)"}
                  stroke={STROKE} strokeWidth="0.6" />
              );
            })}
          </g>
        ))}
        <text x="160" y="160" textAnchor="middle" className="text-[9px] fill-current opacity-70">
          rødt = test, blått = train. K rotasjoner, snitt scoren.
        </text>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        K-fold cross-validation — hver fold er test én gang, train K−1 ganger.
      </figcaption>
    </figure>
  );
};

// ============= ML-PROSJEKT-PIPELINE =============
export const MlPipeline: FC = () => {
  const steps = ["data", "rens", "split", "modell", "evaluér", "deploy"];
  return (
    <figure className="my-4">
      <svg viewBox="0 0 320 80" className="w-full max-w-md mx-auto text-foreground">
        {steps.map((s, i) => {
          const x = 10 + i * 52;
          return (
            <g key={s}>
              <rect x={x} y={20} width="45" height="32" rx="3"
                fill="color-mix(in oklch, var(--brand) 18%, transparent)"
                stroke={STROKE} strokeWidth="0.8" />
              <text x={x + 22.5} y={40} textAnchor="middle"
                className="text-[9px] fill-current font-mono">{s}</text>
              {i < steps.length - 1 && (
                <line x1={x + 45} y1={36} x2={x + 52} y2={36}
                  stroke={STROKE} strokeWidth="0.8" markerEnd="url(#mlp-arr)" />
              )}
            </g>
          );
        })}
        <defs>
          <marker id="mlp-arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 z" fill={STROKE} />
          </marker>
        </defs>
        <text x="160" y="74" textAnchor="middle" className="text-[9px] fill-current opacity-70">
          iterer: dårlig evaluering → tilbake til data/modell
        </text>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        Typisk ML-pipeline — sjelden ferdig på første pass.
      </figcaption>
    </figure>
  );
};

// ============= REGISTRY =============
export const ML_ALG_VISUALS: Record<string, FC> = {
  "ml-minimax-tree": MinimaxTree,
  "ml-alphabeta-prune": AlphaBetaPrune,
  "ml-mdp-grid-policy": MdpGridPolicy,
  "ml-value-iter-sweep": ValueIterationSweep,
  "ml-bellman-backup": BellmanBackup,
  "ml-bandit-arms": BanditArms,
  "ml-bandit-epsilon-vs-ucb": EpsGreedyVsUcb,
  "ml-bandit-regret": RegretCurves,
  "ml-knn-boundary": KnnBoundary,
  "ml-hill-climbing": HillClimbing,
  "ml-gradient-descent": GradientDescent,
  "ml-bfs-vs-dfs": BfsVsDfs,
  "ml-astar-grid": AStarGrid,
  "ml-nn-layers": NeuralNetLayers,
  "ml-perceptron-2d": Perceptron2D,
  "ml-qlearning-update": QLearningUpdate,
  "ml-kmeans-steps": KMeansSteps,
  "ml-pca-projection": PcaProjection,
  "ml-bias-variance": BiasVarianceCurve,
  "ml-ga-crossover": GaCrossover,
  "ml-em-gmm": EmGmm,
  "ml-bagging-vs-boosting": BaggingVsBoosting,
  "ml-confusion-matrix": ConfusionMatrix,
  "ml-cosine-sim": CosineSim,
  "ml-overfitting": OverfittingCurves,
  "ml-train-val-test": TrainValTest,
  "ml-cross-validation": CrossValidation,
  "ml-pipeline": MlPipeline,
};
