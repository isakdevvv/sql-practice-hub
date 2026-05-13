import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * 5x5 grid-world med Value Iteration.
 *
 * Tre lag:
 *  - Basis:   fast oppsett (start, mål, vegger, straffe), klikk "Steg" for én VI-iterasjon.
 *  - Dypere:  klikk celle for å bytte type, slider for γ, vis policy-piler.
 *  - Eksamen: oppgitt MDP — finn V(s) etter konvergens, sjekk fasit.
 */

type Mode = "basis" | "deep" | "exam";

type CellKind = "empty" | "wall" | "goal" | "penalty" | "start";
type Action = "up" | "down" | "left" | "right";
const ACTIONS: Action[] = ["up", "down", "left", "right"];

const N = 5;

function defaultGrid(): CellKind[][] {
  // 5x5 oppsett
  const g: CellKind[][] = Array.from({ length: N }, () =>
    Array.from({ length: N }, () => "empty" as CellKind),
  );
  g[0][0] = "start";
  g[N - 1][N - 1] = "goal";
  g[1][2] = "wall";
  g[2][2] = "wall";
  g[3][1] = "penalty";
  return g;
}

function rewardFor(kind: CellKind): number {
  if (kind === "goal") return 1;
  if (kind === "penalty") return -1;
  return -0.04;
}

function isTerminal(kind: CellKind): boolean {
  return kind === "goal" || kind === "penalty";
}

function move(r: number, c: number, a: Action, grid: CellKind[][]): { r: number; c: number } {
  let nr = r;
  let nc = c;
  if (a === "up") nr = r - 1;
  else if (a === "down") nr = r + 1;
  else if (a === "left") nc = c - 1;
  else if (a === "right") nc = c + 1;
  if (nr < 0 || nr >= N || nc < 0 || nc >= N) {
    return { r, c }; // veggetreff
  }
  if (grid[nr][nc] === "wall") return { r, c };
  return { r: nr, c: nc };
}

function valueIterationStep(
  V: number[][],
  grid: CellKind[][],
  gamma: number,
  slip = 0.1, // 10% sjanse å gli til en av de to perpendikulære retningene (sklisikker MDP)
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
        Vn[r][c] = rewardFor(kind);
        continue;
      }
      let best = -Infinity;
      for (const a of ACTIONS) {
        // perpendikulære actions
        const perp: Action[] =
          a === "up" || a === "down" ? ["left", "right"] : ["up", "down"];
        let q = 0;
        // intendert
        {
          const nxt = move(r, c, a, grid);
          const reward = rewardFor(grid[nxt.r][nxt.c]);
          q += (1 - 2 * slip) * (reward + gamma * V[nxt.r][nxt.c]);
        }
        for (const pa of perp) {
          const nxt = move(r, c, pa, grid);
          const reward = rewardFor(grid[nxt.r][nxt.c]);
          q += slip * (reward + gamma * V[nxt.r][nxt.c]);
        }
        if (q > best) best = q;
      }
      Vn[r][c] = best;
      delta = Math.max(delta, Math.abs(Vn[r][c] - V[r][c]));
    }
  }
  return { V: Vn, delta };
}

function bestPolicy(V: number[][], grid: CellKind[][], gamma: number, slip = 0.1): (Action | null)[][] {
  const pol: (Action | null)[][] = Array.from({ length: N }, () => Array(N).fill(null));
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const kind = grid[r][c];
      if (kind === "wall" || isTerminal(kind)) continue;
      let best: Action | null = null;
      let bestQ = -Infinity;
      for (const a of ACTIONS) {
        const perp: Action[] =
          a === "up" || a === "down" ? ["left", "right"] : ["up", "down"];
        let q = 0;
        const nxt = move(r, c, a, grid);
        q += (1 - 2 * slip) * (rewardFor(grid[nxt.r][nxt.c]) + gamma * V[nxt.r][nxt.c]);
        for (const pa of perp) {
          const nx2 = move(r, c, pa, grid);
          q += slip * (rewardFor(grid[nx2.r][nx2.c]) + gamma * V[nx2.r][nx2.c]);
        }
        if (q > bestQ) {
          bestQ = q;
          best = a;
        }
      }
      pol[r][c] = best;
    }
  }
  return pol;
}

const ARROWS: Record<Action, string> = {
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
};

function valueColor(v: number, minV: number, maxV: number): string {
  // røde for negativ, grønne for positiv, gradvis
  if (v >= 0) {
    const t = maxV > 0 ? v / maxV : 0;
    const alpha = 0.15 + 0.45 * t;
    return `rgba(64, 180, 110, ${alpha})`;
  }
  const t = minV < 0 ? v / minV : 0;
  const alpha = 0.15 + 0.45 * t;
  return `rgba(220, 80, 80, ${alpha})`;
}

export function MdpGridworld() {
  const [mode, setMode] = useState<Mode>("basis");
  const [grid, setGrid] = useState<CellKind[][]>(defaultGrid);
  const [V, setV] = useState<number[][]>(() =>
    Array.from({ length: N }, () => Array(N).fill(0)),
  );
  const [iter, setIter] = useState(0);
  const [gamma, setGamma] = useState(0.9);
  const [showPolicy, setShowPolicy] = useState(false);
  const [running, setRunning] = useState(false);
  const [paintMode, setPaintMode] = useState<CellKind>("wall");
  const timer = useRef<number | null>(null);

  // Eksamen-modus låser grid + γ
  useEffect(() => {
    if (mode === "exam") {
      const g = defaultGrid();
      setGrid(g);
      setGamma(0.9);
      setV(Array.from({ length: N }, () => Array(N).fill(0)));
      setIter(0);
    }
  }, [mode]);

  const stepVI = useCallback(() => {
    setV((prevV) => {
      const { V: Vn } = valueIterationStep(prevV, grid, gamma);
      return Vn;
    });
    setIter((i) => i + 1);
  }, [grid, gamma]);

  // Run-to-convergence
  useEffect(() => {
    if (!running) return;
    timer.current = window.setTimeout(() => {
      setV((prevV) => {
        const { V: Vn, delta } = valueIterationStep(prevV, grid, gamma);
        if (delta < 1e-4) setRunning(false);
        return Vn;
      });
      setIter((i) => i + 1);
    }, 120);
    return () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [running, V, grid, gamma]);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  function reset() {
    setRunning(false);
    setV(Array.from({ length: N }, () => Array(N).fill(0)));
    setIter(0);
  }
  function resetGrid() {
    setGrid(defaultGrid());
    reset();
  }

  function handleCellClick(r: number, c: number) {
    if (mode !== "deep") return;
    setGrid((g) => {
      const g2 = g.map((row) => row.slice());
      // toggle: hvis allerede den typen → tilbake til empty
      if (g2[r][c] === paintMode) {
        g2[r][c] = "empty";
      } else {
        // sørg for at vi ikke har flere start/goal
        if (paintMode === "start" || paintMode === "goal") {
          for (let i = 0; i < N; i++)
            for (let j = 0; j < N; j++) if (g2[i][j] === paintMode) g2[i][j] = "empty";
        }
        g2[r][c] = paintMode;
      }
      return g2;
    });
    reset();
  }

  const policy = useMemo(
    () => (showPolicy ? bestPolicy(V, grid, gamma) : null),
    [V, grid, gamma, showPolicy],
  );

  const flatV = V.flat();
  const minV = Math.min(...flatV);
  const maxV = Math.max(...flatV);

  // Eksamen fasit: konvergert V[0][0] for default grid med γ=0.9
  const examConverged = mode === "exam" && iter > 20;
  const startCell = (() => {
    for (let r = 0; r < N; r++)
      for (let c = 0; c < N; c++) if (grid[r][c] === "start") return { r, c };
    return null;
  })();

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          MDP grid-world &amp; Value Iteration
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["basis", "deep", "exam"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={
                "px-2.5 py-1 rounded border text-xs " +
                (mode === m
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-background hover:border-brand/40")
              }
            >
              {m === "basis" ? "Basis" : m === "deep" ? "Dypere" : "Eksamen"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-4">
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
                const policyArrow =
                  policy && policy[r][c] ? ARROWS[policy[r][c] as Action] : null;
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => handleCellClick(r, c)}
                    className={
                      "relative aspect-square rounded border flex items-center justify-center font-mono text-xs " +
                      (mode === "deep" ? "cursor-pointer hover:border-brand/60" : "cursor-default") +
                      " border-border"
                    }
                    style={{ background: bg }}
                  >
                    {!isWall && (
                      <span
                        className={
                          isGoal || isPen
                            ? "text-white font-bold"
                            : "text-foreground/80"
                        }
                      >
                        {isGoal
                          ? "G"
                          : isPen
                            ? "−"
                            : isStart
                              ? "S"
                              : v.toFixed(2)}
                      </span>
                    )}
                    {policyArrow && !isGoal && !isPen && !isWall && (
                      <span className="absolute top-0 right-1 text-[14px] leading-none text-brand font-bold">
                        {policyArrow}
                      </span>
                    )}
                  </button>
                );
              }),
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-md border border-border bg-background px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Tilstand
            </div>
            <div className="text-sm font-mono">iter = {iter}</div>
            <div className="text-xs text-muted-foreground">γ = {gamma.toFixed(2)}</div>
            {startCell && (
              <div className="text-xs text-muted-foreground">
                V(S) = {V[startCell.r][startCell.c].toFixed(3)}
              </div>
            )}
          </div>

          {mode === "deep" && (
            <>
              <label className="block text-xs">
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
              <div>
                <div className="text-xs text-muted-foreground mb-1">Klikk-modus</div>
                <div className="grid grid-cols-2 gap-1">
                  {(["wall", "goal", "penalty", "start"] as CellKind[]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setPaintMode(k)}
                      className={
                        "px-1.5 py-1 rounded border text-[11px] " +
                        (paintMode === k
                          ? "border-brand bg-brand/10 text-brand"
                          : "border-border bg-background hover:border-brand/40")
                      }
                    >
                      {k === "wall"
                        ? "Vegg"
                        : k === "goal"
                          ? "Mål (+1)"
                          : k === "penalty"
                            ? "Straffe (-1)"
                            : "Start"}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPolicy((v) => !v)}
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:border-brand/40"
              >
                {showPolicy ? "Skjul" : "Vis"} policy-piler
              </button>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={stepVI}
              className="rounded-md bg-brand text-brand-foreground px-3 py-1.5 text-sm font-medium hover:opacity-90"
            >
              Steg VI (én iterasjon)
            </button>
            {!running ? (
              <button
                type="button"
                onClick={() => setRunning(true)}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:border-brand/40"
              >
                Kjør til konvergens
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setRunning(false)}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:border-brand/40"
              >
                Pause
              </button>
            )}
            <button
              type="button"
              onClick={reset}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:border-brand/40"
            >
              Reset V
            </button>
            {mode === "deep" && (
              <button
                type="button"
                onClick={resetGrid}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:border-brand/40"
              >
                Reset grid
              </button>
            )}
          </div>

          {mode === "exam" && (
            <div className="text-xs space-y-1.5">
              <div className="text-muted-foreground">
                Kjør VI til konvergens og les V(S). Stokastisitet: slip = 10 %
                til hver perpendikulær retning per action.
              </div>
              {examConverged && startCell && (
                <div className="rounded border border-emerald-500/40 bg-emerald-500/10 p-2 text-emerald-700 dark:text-emerald-400 font-mono">
                  V(S) ≈ {V[startCell.r][startCell.c].toFixed(3)} (γ=0.9)
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-muted-foreground leading-relaxed">
        Bellman-oppdatering: V(s) ← max_a Σ_{`{s'}`} P(s'|s,a)·[R(s,a,s') + γV(s')].
        Stokastisitet: med p = 10 % glir handlingen til hver av de to
        perpendikulære retningene. R = −0.04 i tomme celler (livskostnad).
      </div>
    </div>
  );
}
