import { useMemo, useState } from "react";

/**
 * Stokastiske overganger: vis hvordan optimal policy endres med noise-nivå.
 *
 * Klassisk Russell & Norvig 4x3 gridworld med ulike noise-nivåer. Lite noise:
 * tar kortest vei langs fare-kanten. Mye noise: tar omveg langs sikre vegger.
 * "Veggpressing" (gå mot vegg = stå stille) blir optimal i veldig noisy env.
 */

const ROWS = 3;
const COLS = 4;
type Action = "up" | "down" | "left" | "right";
const ACTIONS: Action[] = ["up", "down", "left", "right"];
const ARROWS: Record<Action, string> = { up: "↑", down: "↓", left: "←", right: "→" };
type CellKind = "empty" | "wall" | "goal" | "penalty";

// Russell & Norvig 4x3
function rnGrid(): CellKind[][] {
  const g: CellKind[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => "empty" as CellKind),
  );
  g[0][COLS - 1] = "goal";
  g[1][COLS - 1] = "penalty";
  g[1][1] = "wall";
  return g;
}

function move(r: number, c: number, a: Action, grid: CellKind[][]): { r: number; c: number } {
  let nr = r, nc = c;
  if (a === "up") nr--;
  else if (a === "down") nr++;
  else if (a === "left") nc--;
  else nc++;
  if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return { r, c };
  if (grid[nr][nc] === "wall") return { r, c };
  return { r: nr, c: nc };
}

function reward(k: CellKind): number {
  if (k === "goal") return 1;
  if (k === "penalty") return -1;
  return -0.04;
}

function solve(grid: CellKind[][], gamma: number, noise: number): { V: number[][]; policy: (Action | null)[][] } {
  let V = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  for (let i = 0; i < 300; i++) {
    const Vn = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    let delta = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const k = grid[r][c];
        if (k === "wall") continue;
        if (k === "goal" || k === "penalty") {
          Vn[r][c] = reward(k);
          continue;
        }
        let best = -Infinity;
        for (const a of ACTIONS) {
          const perp: Action[] = a === "up" || a === "down" ? ["left", "right"] : ["up", "down"];
          let q = 0;
          const intended = move(r, c, a, grid);
          q += (1 - 2 * noise) * (reward(grid[intended.r][intended.c]) + gamma * V[intended.r][intended.c]);
          for (const pa of perp) {
            const slip = move(r, c, pa, grid);
            q += noise * (reward(grid[slip.r][slip.c]) + gamma * V[slip.r][slip.c]);
          }
          if (q > best) best = q;
        }
        Vn[r][c] = best;
        delta = Math.max(delta, Math.abs(Vn[r][c] - V[r][c]));
      }
    }
    V = Vn;
    if (delta < 1e-5) break;
  }

  const policy: (Action | null)[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] !== "empty") continue;
      let bestA: Action | null = null;
      let bestQ = -Infinity;
      for (const a of ACTIONS) {
        const perp: Action[] = a === "up" || a === "down" ? ["left", "right"] : ["up", "down"];
        let q = 0;
        const intended = move(r, c, a, grid);
        q += (1 - 2 * noise) * (reward(grid[intended.r][intended.c]) + gamma * V[intended.r][intended.c]);
        for (const pa of perp) {
          const slip = move(r, c, pa, grid);
          q += noise * (reward(grid[slip.r][slip.c]) + gamma * V[slip.r][slip.c]);
        }
        if (q > bestQ) {
          bestQ = q;
          bestA = a;
        }
      }
      policy[r][c] = bestA;
    }
  }
  return { V, policy };
}

function MiniBoard({
  grid,
  V,
  policy,
  label,
}: {
  grid: CellKind[][];
  V: number[][];
  policy: (Action | null)[][];
  label: string;
}) {
  const vmax = Math.max(0.001, ...V.flat().filter((v) => v > 0));
  return (
    <div className="rounded-lg border border-border bg-background p-2">
      <div className="text-[10px] uppercase tracking-wider text-brand font-semibold mb-1">{label}</div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, aspectRatio: `${COLS}/${ROWS}` }}>
        {grid.map((row, r) =>
          row.map((kind, c) => {
            const v = V[r][c];
            const isWall = kind === "wall";
            const isGoal = kind === "goal";
            const isPen = kind === "penalty";
            const bg = isWall
              ? "rgba(60, 60, 60, 0.85)"
              : isGoal
                ? "rgba(64, 180, 110, 0.75)"
                : isPen
                  ? "rgba(220, 80, 80, 0.75)"
                  : v >= 0
                    ? `rgba(64, 180, 110, ${0.1 + 0.4 * Math.min(1, v / vmax)})`
                    : `rgba(220, 80, 80, ${0.1 + 0.4 * Math.min(1, -v)})`;
            const a = policy[r][c];
            return (
              <div
                key={`${r}-${c}`}
                className="relative aspect-square rounded border border-border flex items-center justify-center font-mono text-[10px]"
                style={{ background: bg }}
              >
                {!isWall && (
                  <span className={isGoal || isPen ? "text-white font-bold text-[11px]" : "text-foreground/85"}>
                    {isGoal ? "+1" : isPen ? "−1" : v.toFixed(2)}
                  </span>
                )}
                {a && !isGoal && !isPen && !isWall && (
                  <span className="absolute top-0 right-0.5 text-[11px] leading-none text-brand font-bold">
                    {ARROWS[a]}
                  </span>
                )}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}

export function NoisyEnvironmentDemo() {
  const grid = useMemo(rnGrid, []);
  const [noise, setNoise] = useState(0.1);
  const gamma = 0.9;

  const interactive = useMemo(() => solve(grid, gamma, noise), [grid, noise]);
  const det = useMemo(() => solve(grid, gamma, 0), [grid]);
  const mid = useMemo(() => solve(grid, gamma, 0.2), [grid]);
  const hi = useMemo(() => solve(grid, gamma, 0.4), [grid]);

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="text-[10px] uppercase tracking-wider text-brand font-semibold">
        Stokastiske overganger — Russell &amp; Norvig 4×3
      </div>

      <div className="rounded border border-border bg-muted/10 p-3 text-[11px] text-muted-foreground">
        Med <strong>noise = p</strong> går agenten faktisk i intendert retning med sannsynlighet
        <span className="font-mono"> 1 − 2p</span>, og glir til hver av de to perpendikulære
        retningene med sannsynlighet <span className="font-mono">p</span>. γ = 0.9 fast.
      </div>

      <label className="block text-xs">
        <span className="text-muted-foreground">noise = {(noise * 100).toFixed(0)}%</span>
        <input
          type="range"
          min={0}
          max={0.4}
          step={0.02}
          value={noise}
          onChange={(e) => setNoise(Number(e.target.value))}
          className="w-full"
        />
      </label>
      <MiniBoard grid={grid} V={interactive.V} policy={interactive.policy} label={`Interaktiv (noise=${(noise * 100).toFixed(0)}%)`} />

      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold pt-2">
        Side-ved-side sammenligning
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <MiniBoard grid={grid} V={det.V} policy={det.policy} label="Deterministisk (0%)" />
        <MiniBoard grid={grid} V={mid.V} policy={mid.policy} label="Moderat (20%)" />
        <MiniBoard grid={grid} V={hi.V} policy={hi.policy} label="Svært noisy (40%)" />
      </div>

      <div className="rounded border border-brand/30 bg-brand/5 p-3 text-[11px] space-y-1">
        <div className="font-semibold">Observer:</div>
        <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
          <li>
            <strong className="text-foreground">0% noise:</strong> agenten tar korteste vei langs
            kanten av fare-cellen. Trygt fordi handlinger er deterministiske.
          </li>
          <li>
            <strong className="text-foreground">20% noise:</strong> cellen rett under start får
            policy "up" eller "left" — den unngår å gå mot fare-stripa fordi den kan gli inn i den.
          </li>
          <li>
            <strong className="text-foreground">40% noise:</strong> "veggpressing" blir optimal —
            cellen ved siden av faren peker mot veggen så glide-handlinger ikke skader. Policy
            blir tydelig konservativ. Cellen i nedre-høyre under faren foretrekker å gå venstre
            for å gå rundt, ikke opp.
          </li>
        </ul>
        <div className="pt-1 text-muted-foreground">
          Dette er kjernen i hvorfor RL trenger stokastisk modellering: optimal "policy" avhenger
          ikke bare av belønninger, men av hvor mye verden lar deg avvike fra planen.
        </div>
      </div>
    </div>
  );
}
