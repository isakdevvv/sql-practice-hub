import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Animert Value Iteration på fast 4x4-grid med terminaler.
 *
 * Steg for steg: V_{k+1}(s) = max_a Σ P(s'|s,a)[R + γV_k(s')]. Vis hvilke
 * celler endrer seg mest hver runde (rød highlight). Konvergens-graf for
 * max|V_new−V_old|. Demonstrer hvordan γ påvirker hvor langt informasjon
 * sprer seg fra terminalstatene.
 */

const N = 4;
type Action = "up" | "down" | "left" | "right";
const ACTIONS: Action[] = ["up", "down", "left", "right"];
const ARROWS: Record<Action, string> = { up: "↑", down: "↓", left: "←", right: "→" };

type CellKind = "empty" | "wall" | "goal" | "penalty";

function defaultGrid(): CellKind[][] {
  const g: CellKind[][] = Array.from({ length: N }, () =>
    Array.from({ length: N }, () => "empty" as CellKind),
  );
  g[0][N - 1] = "goal";
  g[1][N - 1] = "penalty";
  g[1][1] = "wall";
  return g;
}

function move(r: number, c: number, a: Action, grid: CellKind[][]): { r: number; c: number } {
  let nr = r;
  let nc = c;
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

function viStep(V: number[][], grid: CellKind[][], gamma: number): { V: number[][]; delta: number; changedCell: { r: number; c: number } | null } {
  const Vn: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
  let delta = 0;
  let changedCell: { r: number; c: number } | null = null;
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
      let best = -Infinity;
      for (const a of ACTIONS) {
        const nxt = move(r, c, a, grid);
        const q = reward(grid[nxt.r][nxt.c]) + gamma * V[nxt.r][nxt.c];
        if (q > best) best = q;
      }
      Vn[r][c] = best;
      const diff = Math.abs(Vn[r][c] - V[r][c]);
      if (diff > delta) {
        delta = diff;
        changedCell = { r, c };
      }
    }
  }
  return { V: Vn, delta, changedCell };
}

function bestAction(V: number[][], grid: CellKind[][], gamma: number, r: number, c: number): Action | null {
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

function valueColor(v: number, vmax: number): string {
  if (v >= 0) {
    const t = vmax > 0 ? Math.min(1, v / vmax) : 0;
    return `rgba(64, 180, 110, ${0.1 + 0.5 * t})`;
  }
  const t = Math.min(1, -v / 1);
  return `rgba(220, 80, 80, ${0.1 + 0.5 * t})`;
}

export function ValueIterationAnimator() {
  const grid = useMemo(defaultGrid, []);
  const [gamma, setGamma] = useState(0.9);
  const [V, setV] = useState<number[][]>(() => Array.from({ length: N }, () => Array(N).fill(0)));
  const [iter, setIter] = useState(0);
  const [deltas, setDeltas] = useState<number[]>([]);
  const [highlight, setHighlight] = useState<{ r: number; c: number } | null>(null);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(400);
  const timer = useRef<number | null>(null);

  const reset = useCallback(() => {
    setV(Array.from({ length: N }, () => Array(N).fill(0)));
    setIter(0);
    setDeltas([]);
    setHighlight(null);
  }, []);

  const step = useCallback(() => {
    setV((prev) => {
      const { V: Vn, delta, changedCell } = viStep(prev, grid, gamma);
      setDeltas((ds) => [...ds, delta]);
      setHighlight(changedCell);
      return Vn;
    });
    setIter((k) => k + 1);
  }, [grid, gamma]);

  useEffect(() => {
    if (!running) return;
    timer.current = window.setTimeout(() => {
      setV((prev) => {
        const { V: Vn, delta, changedCell } = viStep(prev, grid, gamma);
        setDeltas((ds) => [...ds, delta]);
        setHighlight(changedCell);
        if (delta < 1e-4) setRunning(false);
        return Vn;
      });
      setIter((k) => k + 1);
    }, speed);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [running, V, grid, gamma, speed]);

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  // reset når γ endrer seg
  useEffect(() => {
    reset();
  }, [gamma, reset]);

  const vmax = Math.max(0.001, ...V.flat().filter((v) => v > 0));
  const maxDelta = Math.max(0.01, ...deltas);

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-[10px] uppercase tracking-wider text-brand font-semibold">
          Value Iteration — animasjon
        </div>
        <div className="text-xs font-mono text-muted-foreground">k = {iter}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-3">
        <div className="rounded-lg border border-border bg-background p-2">
          <div className="grid grid-cols-4 gap-1.5 aspect-square">
            {grid.map((row, r) =>
              row.map((kind, c) => {
                const v = V[r][c];
                const isHL = highlight?.r === r && highlight?.c === c;
                const isWall = kind === "wall";
                const isGoal = kind === "goal";
                const isPen = kind === "penalty";
                const bg = isWall
                  ? "rgba(60, 60, 60, 0.85)"
                  : isGoal
                    ? "rgba(64, 180, 110, 0.75)"
                    : isPen
                      ? "rgba(220, 80, 80, 0.75)"
                      : valueColor(v, vmax);
                const arrow = !isWall && !isGoal && !isPen ? bestAction(V, grid, gamma, r, c) : null;
                return (
                  <div
                    key={`${r}-${c}`}
                    className="relative aspect-square rounded border flex items-center justify-center font-mono text-xs"
                    style={{
                      background: bg,
                      borderColor: isHL ? "rgb(239,68,68)" : undefined,
                      borderWidth: isHL ? 2 : 1,
                    }}
                  >
                    {!isWall && (
                      <span className={isGoal || isPen ? "text-white font-bold" : "text-foreground/85"}>
                        {isGoal ? "+1" : isPen ? "−1" : v.toFixed(2)}
                      </span>
                    )}
                    {arrow && (
                      <span className="absolute top-0 right-1 text-[12px] leading-none text-brand font-bold">
                        {ARROWS[arrow]}
                      </span>
                    )}
                  </div>
                );
              }),
            )}
          </div>
          {highlight && deltas.length > 0 && (
            <div className="mt-2 text-[11px] text-red-600 dark:text-red-400">
              Største endring i runde {iter}: celle ({highlight.r},{highlight.c}) · Δ = {deltas[deltas.length - 1].toFixed(4)}
            </div>
          )}
        </div>

        <div className="space-y-2 text-xs">
          <label className="block">
            <span className="text-muted-foreground">γ = {gamma.toFixed(2)}</span>
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
          <label className="block">
            <span className="text-muted-foreground">hastighet = {speed} ms</span>
            <input
              type="range"
              min={60}
              max={1000}
              step={20}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full"
            />
          </label>

          <div className="flex flex-col gap-1.5 pt-1">
            <button
              type="button"
              onClick={step}
              className="rounded bg-brand text-brand-foreground px-2 py-1 text-xs font-medium hover:opacity-90"
            >
              Steg ▶
            </button>
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              className="rounded border border-border px-2 py-1 text-xs hover:border-brand/40"
            >
              {running ? "Pause" : "Auto-run"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded border border-border px-2 py-1 text-xs hover:border-brand/40"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {deltas.length > 0 && (
        <div className="rounded border border-border bg-muted/10 p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Konvergens (log-skala) — max |V_new − V_old|
          </div>
          <svg viewBox={`0 0 ${Math.max(deltas.length * 14, 200)} 80`} className="w-full h-20">
            <line x1={0} y1={75} x2={Math.max(deltas.length * 14, 200)} y2={75} stroke="currentColor" strokeOpacity={0.2} />
            {deltas.map((d, i) => {
              const x = i * 14 + 8;
              const h = Math.max(2, (d / maxDelta) * 65);
              const y = 75 - h;
              return (
                <rect key={i} x={x - 4} y={y} width={9} height={h} className="fill-brand/70" />
              );
            })}
          </svg>
          <div className="text-[10px] text-muted-foreground mt-1">
            Etter {iter} iter: Δ = {deltas.length > 0 ? deltas[deltas.length - 1].toFixed(5) : "—"}.
            Banach: <span className="font-mono">‖V_k − V*‖ ≤ γ^k · ‖V_0 − V*‖</span> — eksponentielt med rate γ.
          </div>
        </div>
      )}

      <div className="text-[11px] text-muted-foreground">
        Med liten γ (0.3) sprer informasjon fra mål-cellen seg kun et par celler før den "dør ut" —
        verdier langt unna terminaler nær 0. Med γ ≈ 0.99 sprer den seg over hele gridet og agenten
        planlegger langt fremover. Skru på <em>Auto-run</em> og senk γ for å se forskjellen.
      </div>
    </div>
  );
}
