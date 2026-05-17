import { useMemo, useState } from "react";

/**
 * Slider for γ + side-ved-side visning av V og π for tre forskjellige γ-verdier
 * samtidig på samme gridworld. Demonstrer hvordan γ skifter mellom myopic
 * (greedy, tar nærmeste reward) og far-sighted (planlegger rundt farer).
 */

const N = 5;
type Action = "up" | "down" | "left" | "right";
const ACTIONS: Action[] = ["up", "down", "left", "right"];
const ARROWS: Record<Action, string> = { up: "↑", down: "↓", left: "←", right: "→" };
type CellKind = "empty" | "wall" | "goal" | "penalty";

// Konstruert grid: liten reward nært start, stor reward langt unna bak en fare-stripe.
function farRewardGrid(): CellKind[][] {
  const g: CellKind[][] = Array.from({ length: N }, () =>
    Array.from({ length: N }, () => "empty" as CellKind),
  );
  // Liten reward (mål +1) tett ved start
  g[0][1] = "goal";
  // Stor "fare-stripe" å gå rundt
  g[2][1] = "penalty";
  g[2][2] = "penalty";
  g[2][3] = "penalty";
  return g;
}

function move(r: number, c: number, a: Action, grid: CellKind[][]): { r: number; c: number } {
  let nr = r, nc = c;
  if (a === "up") nr--;
  else if (a === "down") nr++;
  else if (a === "left") nc--;
  else nc++;
  if (nr < 0 || nr >= N || nc < 0 || nc >= N) return { r, c };
  if (grid[nr][nc] === "wall") return { r, c };
  return { r: nr, c: nc };
}

function reward(k: CellKind): number {
  if (k === "goal") return 1;
  if (k === "penalty") return -1;
  return -0.04;
}

function solveVI(grid: CellKind[][], gamma: number, sweeps = 200): number[][] {
  let V = Array.from({ length: N }, () => Array(N).fill(0));
  for (let i = 0; i < sweeps; i++) {
    const Vn = Array.from({ length: N }, () => Array(N).fill(0));
    let delta = 0;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const k = grid[r][c];
        if (k === "wall") continue;
        if (k === "goal" || k === "penalty") {
          Vn[r][c] = reward(k);
          continue;
        }
        let best = -Infinity;
        for (const a of ACTIONS) {
          const nxt = move(r, c, a, grid);
          const q = reward(grid[nxt.r][nxt.c]) + gamma * V[nxt.r][nxt.c];
          if (q > best) best = q;
        }
        Vn[r][c] = best;
        delta = Math.max(delta, Math.abs(Vn[r][c] - V[r][c]));
      }
    }
    V = Vn;
    if (delta < 1e-5) break;
  }
  return V;
}

function bestAct(V: number[][], grid: CellKind[][], gamma: number, r: number, c: number): Action | null {
  if (grid[r][c] !== "empty") return null;
  let bestA: Action | null = null;
  let bestQ = -Infinity;
  for (const a of ACTIONS) {
    const nxt = move(r, c, a, grid);
    const q = reward(grid[nxt.r][nxt.c]) + gamma * V[nxt.r][nxt.c];
    if (q > bestQ) {
      bestQ = q;
      bestA = a;
    }
  }
  return bestA;
}

function MiniGrid({ V, grid, gamma, title }: { V: number[][]; grid: CellKind[][]; gamma: number; title: string }) {
  const vmax = Math.max(0.001, ...V.flat().filter((v) => v > 0));
  return (
    <div className="rounded-lg border border-border bg-background p-2">
      <div className="text-[10px] uppercase tracking-wider text-brand font-semibold mb-1">
        {title} <span className="font-mono normal-case text-muted-foreground">γ = {gamma.toFixed(2)}</span>
      </div>
      <div className="grid grid-cols-5 gap-1 aspect-square">
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
            const a = !isWall && !isGoal && !isPen ? bestAct(V, grid, gamma, r, c) : null;
            return (
              <div
                key={`${r}-${c}`}
                className="relative aspect-square rounded border border-border flex items-center justify-center font-mono text-[9px]"
                style={{ background: bg }}
              >
                {!isWall && (
                  <span className={isGoal || isPen ? "text-white font-bold text-[10px]" : "text-foreground/85"}>
                    {isGoal ? "+1" : isPen ? "−" : v.toFixed(1)}
                  </span>
                )}
                {a && (
                  <span className="absolute top-0 right-0.5 text-[10px] leading-none text-brand font-bold">
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

export function GammaEffectExplorer() {
  const grid = useMemo(farRewardGrid, []);
  const [gamma, setGamma] = useState(0.7);
  const V = useMemo(() => solveVI(grid, gamma), [grid, gamma]);

  const G1 = useMemo(() => solveVI(grid, 0.3), [grid]);
  const G2 = useMemo(() => solveVI(grid, 0.7), [grid]);
  const G3 = useMemo(() => solveVI(grid, 0.95), [grid]);

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="text-[10px] uppercase tracking-wider text-brand font-semibold">
        γ-effekt: myopic vs far-sighted
      </div>

      <div className="rounded border border-border bg-muted/10 p-3 text-[11px] space-y-1">
        <div className="font-semibold">Gridworld:</div>
        <div className="text-muted-foreground">
          Lite mål (+1) i øvre venstre hjørne, men det er en fare-stripe på rad 2 som blokkerer
          den korteste vei nedover. Step-reward = −0.04 (livskostnad).
        </div>
      </div>

      <div>
        <label className="block text-xs mb-2">
          <span className="text-muted-foreground">Slider γ = {gamma.toFixed(2)}</span>
          <input
            type="range"
            min={0.1}
            max={0.99}
            step={0.01}
            value={gamma}
            onChange={(e) => setGamma(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <MiniGrid V={V} grid={grid} gamma={gamma} title="Interaktiv" />
      </div>

      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold pt-2">
        Side-ved-side: tre γ-verdier samtidig
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <MiniGrid V={G1} grid={grid} gamma={0.3} title="Myopic" />
        <MiniGrid V={G2} grid={grid} gamma={0.7} title="Balansert" />
        <MiniGrid V={G3} grid={grid} gamma={0.95} title="Far-sighted" />
      </div>

      <div className="rounded border border-brand/30 bg-brand/5 p-3 text-[11px] space-y-1">
        <div className="font-semibold">Hva å se etter:</div>
        <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
          <li>
            <strong className="text-foreground">γ = 0.3 (myopic):</strong> verdiene faller raskt
            til ~0 noen celler unna mål. Agenten "ser ikke" lenger enn 2-3 steg. Policy blir
            grådig: piler peker direkte mot målet.
          </li>
          <li>
            <strong className="text-foreground">γ = 0.7:</strong> verdier sprer seg lengre. Policy
            begynner å unngå fare-stripen — den ekstra "kostnaden" av en straff registreres.
          </li>
          <li>
            <strong className="text-foreground">γ = 0.95 (far-sighted):</strong> alle celler har
            substansielle verdier. Policy unngår fare-stripen selv om det betyr lengre vei.
            Agenten planlegger flere steg fremover.
          </li>
        </ul>
        <div className="pt-1 text-muted-foreground">
          Matematisk: <span className="font-mono">V(s) ≈ Σ γ^k · R_k</span>. Stor γ → langt-frem-reward
          teller; liten γ → bare nær-fremtid betyr noe.
        </div>
      </div>
    </div>
  );
}
