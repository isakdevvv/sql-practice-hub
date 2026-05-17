import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Interaktiv 5x5 grid-world med konfigurerbar belønning, noise og diskonteringsfaktor.
 *
 * Brukeren plasserer terminaler (mål +1, fare -1), vegger og start. Slidere
 * justerer γ, step-reward og noise. Verdier V(s) vises som tall + heatmap,
 * og policy som piler. Gir et felles "lekeplass"-MDP de andre komponentene
 * kan referere til.
 */

type CellKind = "empty" | "wall" | "goal" | "penalty" | "start";
type Action = "up" | "down" | "left" | "right";
type PaintMode = CellKind;

const ACTIONS: Action[] = ["up", "down", "left", "right"];
const N = 5;
const ARROWS: Record<Action, string> = { up: "↑", down: "↓", left: "←", right: "→" };

function defaultGrid(): CellKind[][] {
  const g: CellKind[][] = Array.from({ length: N }, () =>
    Array.from({ length: N }, () => "empty" as CellKind),
  );
  g[0][0] = "start";
  g[0][N - 1] = "goal";
  g[1][N - 1] = "penalty";
  g[2][2] = "wall";
  return g;
}

function isTerminal(k: CellKind): boolean {
  return k === "goal" || k === "penalty";
}

function move(r: number, c: number, a: Action, grid: CellKind[][]): { r: number; c: number } {
  let nr = r;
  let nc = c;
  if (a === "up") nr = r - 1;
  else if (a === "down") nr = r + 1;
  else if (a === "left") nc = c - 1;
  else nc = c + 1;
  if (nr < 0 || nr >= N || nc < 0 || nc >= N) return { r, c };
  if (grid[nr][nc] === "wall") return { r, c };
  return { r: nr, c: nc };
}

function reward(kind: CellKind, stepCost: number): number {
  if (kind === "goal") return 1;
  if (kind === "penalty") return -1;
  return stepCost;
}

function viStep(
  V: number[][],
  grid: CellKind[][],
  gamma: number,
  stepCost: number,
  noise: number,
): { V: number[][]; delta: number } {
  const Vn: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
  let delta = 0;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const kind = grid[r][c];
      if (kind === "wall") {
        Vn[r][c] = 0;
        continue;
      }
      if (isTerminal(kind)) {
        Vn[r][c] = reward(kind, stepCost);
        continue;
      }
      let best = -Infinity;
      for (const a of ACTIONS) {
        const perp: Action[] =
          a === "up" || a === "down" ? ["left", "right"] : ["up", "down"];
        let q = 0;
        const intended = move(r, c, a, grid);
        q += (1 - 2 * noise) * (reward(grid[intended.r][intended.c], stepCost) + gamma * V[intended.r][intended.c]);
        for (const pa of perp) {
          const slip = move(r, c, pa, grid);
          q += noise * (reward(grid[slip.r][slip.c], stepCost) + gamma * V[slip.r][slip.c]);
        }
        if (q > best) best = q;
      }
      Vn[r][c] = best;
      delta = Math.max(delta, Math.abs(Vn[r][c] - V[r][c]));
    }
  }
  return { V: Vn, delta };
}

function policyFrom(
  V: number[][],
  grid: CellKind[][],
  gamma: number,
  stepCost: number,
  noise: number,
): (Action | null)[][] {
  const pol: (Action | null)[][] = Array.from({ length: N }, () => Array(N).fill(null));
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const kind = grid[r][c];
      if (kind === "wall" || isTerminal(kind)) continue;
      let bestA: Action | null = null;
      let bestQ = -Infinity;
      for (const a of ACTIONS) {
        const perp: Action[] =
          a === "up" || a === "down" ? ["left", "right"] : ["up", "down"];
        let q = 0;
        const intended = move(r, c, a, grid);
        q += (1 - 2 * noise) * (reward(grid[intended.r][intended.c], stepCost) + gamma * V[intended.r][intended.c]);
        for (const pa of perp) {
          const slip = move(r, c, pa, grid);
          q += noise * (reward(grid[slip.r][slip.c], stepCost) + gamma * V[slip.r][slip.c]);
        }
        if (q > bestQ) {
          bestQ = q;
          bestA = a;
        }
      }
      pol[r][c] = bestA;
    }
  }
  return pol;
}

function valueColor(v: number, minV: number, maxV: number): string {
  if (v >= 0) {
    const t = maxV > 0 ? v / maxV : 0;
    return `rgba(64, 180, 110, ${0.12 + 0.5 * t})`;
  }
  const t = minV < 0 ? v / minV : 0;
  return `rgba(220, 80, 80, ${0.12 + 0.5 * t})`;
}

export function GridworldSim() {
  const [grid, setGrid] = useState<CellKind[][]>(defaultGrid);
  const [V, setV] = useState<number[][]>(() => Array.from({ length: N }, () => Array(N).fill(0)));
  const [iter, setIter] = useState(0);
  const [gamma, setGamma] = useState(0.9);
  const [stepCost, setStepCost] = useState(-0.04);
  const [noise, setNoise] = useState(0.1);
  const [paintMode, setPaintMode] = useState<PaintMode>("wall");
  const [showPolicy, setShowPolicy] = useState(true);
  const [running, setRunning] = useState(false);
  const timer = useRef<number | null>(null);

  const reset = useCallback(() => {
    setV(Array.from({ length: N }, () => Array(N).fill(0)));
    setIter(0);
  }, []);

  const stepVI = useCallback(() => {
    setV((prev) => {
      const { V: Vn } = viStep(prev, grid, gamma, stepCost, noise);
      return Vn;
    });
    setIter((k) => k + 1);
  }, [grid, gamma, stepCost, noise]);

  useEffect(() => {
    if (!running) return;
    timer.current = window.setTimeout(() => {
      setV((prev) => {
        const { V: Vn, delta } = viStep(prev, grid, gamma, stepCost, noise);
        if (delta < 1e-4) setRunning(false);
        return Vn;
      });
      setIter((k) => k + 1);
    }, 100);
    return () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [running, V, grid, gamma, stepCost, noise]);

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  function handleCellClick(r: number, c: number) {
    setGrid((g) => {
      const g2 = g.map((row) => row.slice());
      if (g2[r][c] === paintMode) {
        g2[r][c] = "empty";
      } else {
        if (paintMode === "start") {
          for (let i = 0; i < N; i++)
            for (let j = 0; j < N; j++) if (g2[i][j] === "start") g2[i][j] = "empty";
        }
        g2[r][c] = paintMode;
      }
      return g2;
    });
    reset();
  }

  const policy = useMemo(
    () => (showPolicy ? policyFrom(V, grid, gamma, stepCost, noise) : null),
    [V, grid, gamma, stepCost, noise, showPolicy],
  );

  const flatV = V.flat();
  const minV = Math.min(...flatV);
  const maxV = Math.max(...flatV);

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="text-[10px] uppercase tracking-wider text-brand font-semibold">
        Konfigurerbar 5×5 gridworld
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_230px] gap-3">
        <div className="rounded-lg border border-border bg-background p-2">
          <div className="grid grid-cols-5 gap-1.5 aspect-square">
            {grid.map((row, r) =>
              row.map((kind, c) => {
                const v = V[r][c];
                const isWall = kind === "wall";
                const isGoal = kind === "goal";
                const isPen = kind === "penalty";
                const isStart = kind === "start";
                const bg = isWall
                  ? "rgba(60, 60, 60, 0.85)"
                  : isGoal
                    ? "rgba(64, 180, 110, 0.7)"
                    : isPen
                      ? "rgba(220, 80, 80, 0.7)"
                      : valueColor(v, minV, maxV);
                const arrow = policy && policy[r][c] ? ARROWS[policy[r][c] as Action] : null;
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => handleCellClick(r, c)}
                    className="relative aspect-square rounded border border-border flex items-center justify-center font-mono text-[10px] cursor-pointer hover:border-brand/60"
                    style={{ background: bg }}
                  >
                    {!isWall && (
                      <span
                        className={
                          isGoal || isPen ? "text-white font-bold" : "text-foreground/80"
                        }
                      >
                        {isGoal ? "+1" : isPen ? "−1" : isStart && iter === 0 ? "S" : v.toFixed(2)}
                      </span>
                    )}
                    {arrow && !isGoal && !isPen && !isWall && (
                      <span className="absolute top-0 right-1 text-[13px] leading-none text-brand font-bold">
                        {arrow}
                      </span>
                    )}
                  </button>
                );
              }),
            )}
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="rounded border border-border bg-muted/20 p-2 space-y-1">
            <div className="font-mono">iter = {iter}</div>
            <div className="text-muted-foreground">
              max |V| = {Math.max(Math.abs(minV), Math.abs(maxV)).toFixed(3)}
            </div>
          </div>

          <label className="block">
            <span className="text-muted-foreground">γ = {gamma.toFixed(2)}</span>
            <input
              type="range"
              min={0.1}
              max={0.99}
              step={0.01}
              value={gamma}
              onChange={(e) => {
                setGamma(Number(e.target.value));
                reset();
              }}
              className="w-full"
            />
          </label>

          <label className="block">
            <span className="text-muted-foreground">
              step-reward = {stepCost.toFixed(2)}
            </span>
            <input
              type="range"
              min={-0.2}
              max={0}
              step={0.01}
              value={stepCost}
              onChange={(e) => {
                setStepCost(Number(e.target.value));
                reset();
              }}
              className="w-full"
            />
          </label>

          <label className="block">
            <span className="text-muted-foreground">noise = {(noise * 100).toFixed(0)}%</span>
            <input
              type="range"
              min={0}
              max={0.4}
              step={0.02}
              value={noise}
              onChange={(e) => {
                setNoise(Number(e.target.value));
                reset();
              }}
              className="w-full"
            />
          </label>

          <div>
            <div className="text-muted-foreground mb-1">Klikk-modus</div>
            <div className="grid grid-cols-2 gap-1">
              {(["wall", "goal", "penalty", "start"] as PaintMode[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setPaintMode(k)}
                  className={
                    "px-1.5 py-1 rounded border text-[10px] " +
                    (paintMode === k
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border bg-background hover:border-brand/40")
                  }
                >
                  {k === "wall" ? "Vegg" : k === "goal" ? "Mål (+1)" : k === "penalty" ? "Fare (−1)" : "Start"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-1">
            <button
              type="button"
              onClick={stepVI}
              className="rounded bg-brand text-brand-foreground px-2 py-1 text-xs font-medium hover:opacity-90"
            >
              Steg VI
            </button>
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              className="rounded border border-border px-2 py-1 text-xs hover:border-brand/40"
            >
              {running ? "Pause" : "Kjør til konvergens"}
            </button>
            <button
              type="button"
              onClick={() => setShowPolicy((s) => !s)}
              className="rounded border border-border px-2 py-1 text-xs hover:border-brand/40"
            >
              {showPolicy ? "Skjul policy" : "Vis policy"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded border border-border px-2 py-1 text-xs hover:border-brand/40"
            >
              Reset V
            </button>
            <button
              type="button"
              onClick={() => {
                setGrid(defaultGrid());
                reset();
              }}
              className="rounded border border-border px-2 py-1 text-xs hover:border-brand/40"
            >
              Reset grid
            </button>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-muted-foreground leading-relaxed">
        Bellman-backup brukes per celle: <span className="font-mono">V(s) ← max_a Σ_s' P(s'|s,a)[R+γV(s')]</span>.
        Med <span className="font-mono">noise</span> p glir actionen til hver av de to perpendikulære
        retningene med sannsynlighet p. Vegger blokkerer (agenten blir værende).
      </div>
    </div>
  );
}
