import { useCallback, useMemo, useState } from "react";

/**
 * Policy Iteration animator — side-ved-side med Value Iteration på samme problem.
 *
 * To-fase: policy evaluation (iterativ Bellman-backup for fix π til konvergens)
 * → policy improvement (argmax_a over actions). Viser policy-endringer per
 * runde, og sammenligner antall ytre iterasjoner med VI på samme grid.
 */

const N = 4;
type Action = "up" | "down" | "left" | "right";
const ACTIONS: Action[] = ["up", "down", "left", "right"];
const ARROWS: Record<Action, string> = { up: "↑", down: "↓", left: "←", right: "→" };
type CellKind = "empty" | "wall" | "goal" | "penalty";

function makeGrid(): CellKind[][] {
  const g: CellKind[][] = Array.from({ length: N }, () =>
    Array.from({ length: N }, () => "empty" as CellKind),
  );
  g[0][N - 1] = "goal";
  g[1][N - 1] = "penalty";
  g[2][1] = "wall";
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

function emptyV(): number[][] {
  return Array.from({ length: N }, () => Array(N).fill(0));
}

function initialPolicy(grid: CellKind[][]): (Action | null)[][] {
  const p: (Action | null)[][] = Array.from({ length: N }, () => Array(N).fill(null));
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) if (grid[r][c] === "empty") p[r][c] = "up";
  return p;
}

function evaluatePolicy(
  policy: (Action | null)[][],
  grid: CellKind[][],
  gamma: number,
  maxSweeps = 200,
  theta = 1e-5,
): { V: number[][]; sweeps: number } {
  let V = emptyV();
  let sweeps = 0;
  for (let i = 0; i < maxSweeps; i++) {
    sweeps++;
    const Vn = emptyV();
    let delta = 0;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const k = grid[r][c];
        if (k === "wall") {
          Vn[r][c] = 0;
          continue;
        }
        if (k === "goal" || k === "penalty") {
          Vn[r][c] = reward(k);
          continue;
        }
        const a = policy[r][c];
        if (!a) {
          Vn[r][c] = 0;
          continue;
        }
        const nxt = move(r, c, a, grid);
        Vn[r][c] = reward(grid[nxt.r][nxt.c]) + gamma * V[nxt.r][nxt.c];
        delta = Math.max(delta, Math.abs(Vn[r][c] - V[r][c]));
      }
    }
    V = Vn;
    if (delta < theta) break;
  }
  return { V, sweeps };
}

function improvePolicy(
  V: number[][],
  policy: (Action | null)[][],
  grid: CellKind[][],
  gamma: number,
): { policy: (Action | null)[][]; changes: number; stable: boolean } {
  const newPol: (Action | null)[][] = policy.map((row) => row.slice());
  let changes = 0;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (grid[r][c] !== "empty") continue;
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
      if (bestA !== policy[r][c]) changes++;
      newPol[r][c] = bestA;
    }
  }
  return { policy: newPol, changes, stable: changes === 0 };
}

function viFullRun(grid: CellKind[][], gamma: number, theta = 1e-5): { sweeps: number } {
  let V = emptyV();
  let sweeps = 0;
  for (let i = 0; i < 500; i++) {
    sweeps++;
    const Vn = emptyV();
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
    if (delta < theta) break;
  }
  return { sweeps };
}

type PiRound = {
  k: number;
  policy: (Action | null)[][];
  V: number[][];
  evalSweeps: number;
  improvementChanges: number;
  stable: boolean;
};

export function PolicyIterationAnimator() {
  const grid = useMemo(makeGrid, []);
  const [gamma, setGamma] = useState(0.9);
  const [rounds, setRounds] = useState<PiRound[]>(() => {
    const pol0 = initialPolicy(grid);
    return [{ k: 0, policy: pol0, V: emptyV(), evalSweeps: 0, improvementChanges: 0, stable: false }];
  });

  const reset = useCallback(() => {
    const pol0 = initialPolicy(grid);
    setRounds([{ k: 0, policy: pol0, V: emptyV(), evalSweeps: 0, improvementChanges: 0, stable: false }]);
  }, [grid]);

  const stepPI = useCallback(() => {
    setRounds((rs) => {
      const last = rs[rs.length - 1];
      if (last.stable) return rs;
      const { V, sweeps } = evaluatePolicy(last.policy, grid, gamma);
      const { policy: newPol, changes, stable } = improvePolicy(V, last.policy, grid, gamma);
      return [...rs, { k: last.k + 1, policy: newPol, V, evalSweeps: sweeps, improvementChanges: changes, stable }];
    });
  }, [grid, gamma]);

  const runToConvergence = useCallback(() => {
    setRounds((rs) => {
      let curr = [...rs];
      for (let i = 0; i < 20; i++) {
        const last = curr[curr.length - 1];
        if (last.stable) break;
        const { V, sweeps } = evaluatePolicy(last.policy, grid, gamma);
        const { policy: newPol, changes, stable } = improvePolicy(V, last.policy, grid, gamma);
        curr.push({ k: last.k + 1, policy: newPol, V, evalSweeps: sweeps, improvementChanges: changes, stable });
      }
      return curr;
    });
  }, [grid, gamma]);

  const latest = rounds[rounds.length - 1];
  const totalEvalSweeps = rounds.reduce((s, r) => s + r.evalSweeps, 0);
  const viComparison = useMemo(() => viFullRun(grid, gamma), [grid, gamma]);

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-[10px] uppercase tracking-wider text-brand font-semibold">
          Policy Iteration vs Value Iteration — samme problem
        </div>
        <div className="text-xs font-mono text-muted-foreground">PI-runde k = {latest.k}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_240px] gap-3">
        <div className="rounded-lg border border-border bg-background p-2">
          <div className="grid grid-cols-4 gap-1.5 aspect-square">
            {grid.map((row, r) =>
              row.map((kind, c) => {
                const v = latest.V[r][c];
                const a = latest.policy[r][c];
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
                        ? `rgba(64, 180, 110, ${0.1 + 0.4 * Math.min(1, v)})`
                        : `rgba(220, 80, 80, ${0.1 + 0.4 * Math.min(1, -v)})`;
                return (
                  <div
                    key={`${r}-${c}`}
                    className="relative aspect-square rounded border border-border flex items-center justify-center font-mono text-xs"
                    style={{ background: bg }}
                  >
                    {!isWall && (
                      <span className={isGoal || isPen ? "text-white font-bold" : "text-foreground/85"}>
                        {isGoal ? "+1" : isPen ? "−1" : v.toFixed(2)}
                      </span>
                    )}
                    {a && !isWall && !isGoal && !isPen && (
                      <span className="absolute top-0 right-1 text-[12px] leading-none text-brand font-bold">
                        {ARROWS[a]}
                      </span>
                    )}
                  </div>
                );
              }),
            )}
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <label className="block">
            <span className="text-muted-foreground">γ = {gamma.toFixed(2)}</span>
            <input
              type="range"
              min={0.5}
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

          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={stepPI}
              className="rounded bg-brand text-brand-foreground px-2 py-1 text-xs font-medium hover:opacity-90 disabled:opacity-40"
              disabled={latest.stable}
            >
              Steg PI ▶
            </button>
            <button
              type="button"
              onClick={runToConvergence}
              className="rounded border border-border px-2 py-1 text-xs hover:border-brand/40 disabled:opacity-40"
              disabled={latest.stable}
            >
              Kjør til stabil
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded border border-border px-2 py-1 text-xs hover:border-brand/40"
            >
              Reset
            </button>
          </div>

          {latest.stable && (
            <div className="rounded border border-emerald-500/40 bg-emerald-500/10 p-2 text-[11px] text-emerald-700 dark:text-emerald-400">
              Policy stabil — π* funnet etter {latest.k} ytre iterasjoner.
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-border">
        <table className="w-full text-[11px]">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-2 py-1">k</th>
              <th className="text-left px-2 py-1">Eval-sweeps</th>
              <th className="text-left px-2 py-1">Improvement-endringer</th>
              <th className="text-left px-2 py-1">Stabil?</th>
            </tr>
          </thead>
          <tbody>
            {rounds.map((r) => (
              <tr key={r.k} className="border-t border-border">
                <td className="px-2 py-1 font-mono">{r.k}</td>
                <td className="px-2 py-1 font-mono">{r.k === 0 ? "—" : r.evalSweeps}</td>
                <td className="px-2 py-1 font-mono">{r.k === 0 ? "—" : r.improvementChanges}</td>
                <td className="px-2 py-1">{r.k === 0 ? "—" : r.stable ? "✓" : "nei"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded border border-brand/30 bg-brand/5 p-3 text-[11px] space-y-1">
        <div className="font-semibold">Sammenlign med Value Iteration på samme grid:</div>
        <div className="font-mono">
          PI: {latest.k} ytre runder · {totalEvalSweeps} eval-sweeps totalt
        </div>
        <div className="font-mono">
          VI: {viComparison.sweeps} backups til konvergens
        </div>
        <div className="text-muted-foreground">
          PI bruker færre ytre iterasjoner men hver iterasjon er dyrere (full evaluering).
          VI er enklere mekanisk: ett pass per "iterasjon". På små problemer er
          PI raskere fordi den oppdager optimum eksakt på et tidligere tidspunkt.
        </div>
      </div>
    </div>
  );
}
