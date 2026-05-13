import { useEffect, useMemo, useRef, useState } from "react";

/**
 * TspDpVisualizer — Held-Karp DP for TSP, steg-for-steg
 *
 * Pedagogikk:
 *  - Basis: 4 byer, vi viser DP-tabellen og fyller én celle av gangen
 *  - Dypere: 5 byer, kompleksitet n²·2ⁿ vs n!
 *  - Eksamen: "Forklar tilstanden dp[S][i] og rekurrensen"
 *
 * State: dp[mask][i] = shortest path that starts at 0, visits exactly the
 * cities in mask, ends at i.  mask is an n-bit subset of {0..n-1}, and
 * city 0 is always in mask.
 *
 * Recurrence:
 *   dp[mask][i] = min over j in mask \ {i}:  dp[mask \ {i}][j] + dist(j, i)
 *
 * Base case:
 *   dp[{0}][0] = 0
 *   else +Infinity
 */

type DpCell = {
  mask: number;
  i: number;
  value: number; // Infinity if unfilled or unreachable
  from?: { mask: number; j: number }; // backpointer
};

const CITY_COUNT_OPTIONS = [4, 5] as const;
type CityCount = (typeof CITY_COUNT_OPTIONS)[number];

function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function makeCities(n: number, seed: number) {
  const r = lcg(seed);
  return Array.from({ length: n }, () => ({
    x: r() * 0.8 + 0.1,
    y: r() * 0.8 + 0.1,
  }));
}

function distMatrix(cities: { x: number; y: number }[]) {
  const n = cities.length;
  const d = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const dx = cities[i].x - cities[j].x;
      const dy = cities[i].y - cities[j].y;
      d[i][j] = Math.sqrt(dx * dx + dy * dy);
    }
  }
  return d;
}

/** Build DP fill order — increasing subset size, must include city 0. */
function fillOrder(n: number): { mask: number; i: number }[] {
  const order: { mask: number; i: number }[] = [];
  // Base
  order.push({ mask: 1, i: 0 });
  // size 2..n
  for (let size = 2; size <= n; size++) {
    for (let mask = 0; mask < 1 << n; mask++) {
      if (!(mask & 1)) continue; // must include city 0
      if (popcount(mask) !== size) continue;
      for (let i = 1; i < n; i++) {
        if (!(mask & (1 << i))) continue;
        order.push({ mask, i });
      }
    }
  }
  return order;
}

function popcount(x: number): number {
  let c = 0;
  while (x) {
    c += x & 1;
    x >>>= 1;
  }
  return c;
}

function maskToString(mask: number, n: number): string {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    if (mask & (1 << i)) out.push(String(i));
  }
  return `{${out.join(",")}}`;
}

function maskToBinary(mask: number, n: number): string {
  let s = "";
  for (let i = n - 1; i >= 0; i--) {
    s += mask & (1 << i) ? "1" : "0";
  }
  return s;
}

export function TspDpVisualizer() {
  const [nCities, setNCities] = useState<CityCount>(4);
  const [seed, setSeed] = useState(3);
  const [filledCount, setFilledCount] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  const cities = useMemo(() => makeCities(nCities, seed), [nCities, seed]);
  const dMat = useMemo(() => distMatrix(cities), [cities]);
  const order = useMemo(() => fillOrder(nCities), [nCities]);

  // Reset when problem changes
  useEffect(() => {
    setFilledCount(0);
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
  }, [nCities, seed]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Compute DP up to filledCount
  const dpState = useMemo(() => {
    const n = nCities;
    const INF = Infinity;
    const cells = new Map<string, DpCell>();
    for (let s = 0; s < filledCount; s++) {
      const { mask, i } = order[s];
      const key = `${mask}:${i}`;
      if (mask === 1 && i === 0) {
        cells.set(key, { mask, i, value: 0 });
        continue;
      }
      let best = INF;
      let from: { mask: number; j: number } | undefined;
      const prevMask = mask & ~(1 << i);
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        if (!(prevMask & (1 << j))) continue;
        const prevKey = `${prevMask}:${j}`;
        const prev = cells.get(prevKey);
        if (!prev) continue;
        const cand = prev.value + dMat[j][i];
        if (cand < best) {
          best = cand;
          from = { mask: prevMask, j };
        }
      }
      cells.set(key, { mask, i, value: best, from });
    }
    return cells;
  }, [filledCount, order, nCities, dMat]);

  // Tour reconstruction once everything is filled
  const tour = useMemo(() => {
    if (filledCount < order.length) return null;
    const n = nCities;
    const allMask = (1 << n) - 1;
    // best final: min over i ≠ 0 of dp[allMask][i] + dist(i, 0)
    let bestI = -1;
    let bestLen = Infinity;
    for (let i = 1; i < n; i++) {
      const c = dpState.get(`${allMask}:${i}`);
      if (!c) continue;
      const total = c.value + dMat[i][0];
      if (total < bestLen) {
        bestLen = total;
        bestI = i;
      }
    }
    if (bestI < 0) return null;
    // backtrack
    const path: number[] = [0];
    let cur: { mask: number; i: number } = { mask: allMask, i: bestI };
    while (cur.i !== 0 || cur.mask !== 1) {
      path.push(cur.i);
      const cell = dpState.get(`${cur.mask}:${cur.i}`);
      if (!cell || !cell.from) break;
      cur = { mask: cell.from.mask, i: cell.from.j };
    }
    path.reverse();
    return { path, len: bestLen };
  }, [filledCount, order.length, dpState, dMat, nCities]);

  const currentStep =
    filledCount > 0 ? order[filledCount - 1] : null;

  const stepOne = () => {
    if (filledCount < order.length) setFilledCount((c) => c + 1);
  };

  const runAll = () => {
    if (running) {
      setRunning(false);
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    setRunning(true);
    const tick = () => {
      setFilledCount((c) => {
        if (c >= order.length) {
          setRunning(false);
          timerRef.current = null;
          return c;
        }
        timerRef.current = window.setTimeout(tick, 180);
        return c + 1;
      });
    };
    timerRef.current = window.setTimeout(tick, 180);
  };

  const reset = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
    setFilledCount(0);
  };

  // ---- Render ----
  const W = 280;
  const H = 220;
  const PAD = 25;
  const sx = (x: number) => PAD + x * (W - 2 * PAD);
  const sy = (y: number) => PAD + y * (H - 2 * PAD);

  // Build all masks that include city 0, sorted by popcount then mask.
  const allMasks: number[] = [];
  for (let m = 0; m < 1 << nCities; m++) {
    if (m & 1) allMasks.push(m);
  }
  allMasks.sort((a, b) => popcount(a) - popcount(b) || a - b);

  // Complexity values
  const factorial = (k: number): number =>
    k <= 1 ? 1 : k * factorial(k - 1);
  const bruteOps = factorial(nCities - 1);
  const dpOps = nCities * nCities * (1 << nCities);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              Antall byer
            </div>
            <div className="flex gap-1">
              {CITY_COUNT_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNCities(n)}
                  disabled={running}
                  className={`px-2 py-1 text-xs rounded border transition ${
                    nCities === n
                      ? "bg-brand text-brand-foreground border-brand"
                      : "bg-background border-border text-muted-foreground"
                  }`}
                >
                  {n} byer
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2 flex-wrap">
            <button
              type="button"
              onClick={stepOne}
              disabled={running || filledCount >= order.length}
              className="px-3 py-1.5 text-xs rounded bg-brand text-brand-foreground disabled:opacity-40"
            >
              Fyll neste celle
            </button>
            <button
              type="button"
              onClick={runAll}
              className="px-3 py-1.5 text-xs rounded bg-muted hover:bg-muted/80"
            >
              {running ? "Stopp" : "Full kjøring"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="px-3 py-1.5 text-xs rounded border border-border text-muted-foreground"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setSeed((s) => s + 1)}
              disabled={running}
              className="px-3 py-1.5 text-xs rounded border border-border text-muted-foreground"
            >
              Nye byer
            </button>
          </div>
          <div className="text-xs text-muted-foreground pt-1">
            Fylt <span className="font-mono">{filledCount}</span>/
            <span className="font-mono">{order.length}</span>
            {tour && (
              <span className="ml-2 text-emerald-400 font-mono">
                · Beste tour = {tour.len.toFixed(3)}
              </span>
            )}
          </div>
        </div>
        <div className="space-y-1 text-xs">
          <div className="rounded-lg border border-border bg-background p-3 space-y-1">
            <div className="font-semibold text-muted-foreground mb-1">
              Kompleksitet
            </div>
            <div>
              Brute force (n−1)!:{" "}
              <span className="font-mono">{bruteOps.toLocaleString("nb")}</span>{" "}
              ruter
            </div>
            <div>
              Held-Karp n²·2ⁿ:{" "}
              <span className="font-mono">{dpOps.toLocaleString("nb")}</span>{" "}
              celler
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              For n=20: 1.2·10¹⁸ vs 4·10⁸. For n=30: 9·10³¹ vs 9·10¹¹.
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* City layout */}
        <div>
          <div className="text-xs font-semibold mb-1">Byer</div>
          <svg width={W} height={H} className="block bg-background rounded">
            {/* All edges, light */}
            {cities.map((_, i) =>
              cities.map((_, j) => {
                if (j <= i) return null;
                return (
                  <line
                    key={`e${i}-${j}`}
                    x1={sx(cities[i].x)}
                    y1={sy(cities[i].y)}
                    x2={sx(cities[j].x)}
                    y2={sy(cities[j].y)}
                    stroke="#444"
                    strokeWidth={0.5}
                    opacity={0.4}
                  />
                );
              }),
            )}
            {/* Current step backpointer */}
            {currentStep &&
              dpState.get(`${currentStep.mask}:${currentStep.i}`)?.from && (() => {
                const cell = dpState.get(
                  `${currentStep.mask}:${currentStep.i}`,
                );
                if (!cell || !cell.from) return null;
                const j = cell.from.j;
                return (
                  <line
                    x1={sx(cities[j].x)}
                    y1={sy(cities[j].y)}
                    x2={sx(cities[currentStep.i].x)}
                    y2={sy(cities[currentStep.i].y)}
                    stroke="#facc15"
                    strokeWidth={2.5}
                  />
                );
              })()}
            {/* Final tour */}
            {tour &&
              tour.path.map((c, i) => {
                if (i === tour.path.length - 1) {
                  return (
                    <line
                      key={`tr${i}`}
                      x1={sx(cities[c].x)}
                      y1={sy(cities[c].y)}
                      x2={sx(cities[tour.path[0]].x)}
                      y2={sy(cities[tour.path[0]].y)}
                      stroke="#22c55e"
                      strokeWidth={2}
                    />
                  );
                }
                const next = tour.path[i + 1];
                return (
                  <line
                    key={`tr${i}`}
                    x1={sx(cities[c].x)}
                    y1={sy(cities[c].y)}
                    x2={sx(cities[next].x)}
                    y2={sy(cities[next].y)}
                    stroke="#22c55e"
                    strokeWidth={2}
                  />
                );
              })}
            {/* Cities */}
            {cities.map((c, i) => (
              <g key={`c${i}`}>
                <circle
                  cx={sx(c.x)}
                  cy={sy(c.y)}
                  r={9}
                  fill={i === 0 ? "#facc15" : "#1f2937"}
                  stroke="#e5e7eb"
                  strokeWidth={1.5}
                />
                <text
                  x={sx(c.x)}
                  y={sy(c.y) + 4}
                  textAnchor="middle"
                  fontSize={11}
                  fill={i === 0 ? "#000" : "#e5e7eb"}
                  fontWeight={i === 0 ? 700 : 400}
                >
                  {i}
                </text>
              </g>
            ))}
          </svg>
          <div className="text-[10px] text-muted-foreground mt-1">
            Gul = startby. Gul kant = nåværende celle leser fra forrige celle.
            Grønn = endelig beste tour.
          </div>
        </div>

        {/* DP table */}
        <div>
          <div className="text-xs font-semibold mb-1">
            DP-tabell — <span className="font-mono">dp[mask][i]</span>
          </div>
          <div className="overflow-auto max-h-[260px] border border-border rounded">
            <table className="text-[10px] font-mono w-full">
              <thead className="bg-muted/40 sticky top-0">
                <tr>
                  <th className="px-1 py-1 text-left">mask</th>
                  {Array.from({ length: nCities }, (_, i) => (
                    <th key={i} className="px-1 py-1 text-center">
                      i={i}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allMasks.map((mask) => (
                  <tr key={mask} className="border-t border-border">
                    <td className="px-1 py-0.5 text-muted-foreground">
                      <span className="text-foreground">
                        {maskToString(mask, nCities)}
                      </span>{" "}
                      <span className="opacity-60">
                        {maskToBinary(mask, nCities)}
                      </span>
                    </td>
                    {Array.from({ length: nCities }, (_, i) => {
                      if (!(mask & (1 << i))) {
                        return (
                          <td
                            key={i}
                            className="px-1 py-0.5 text-center text-muted-foreground/30"
                          >
                            ·
                          </td>
                        );
                      }
                      const key = `${mask}:${i}`;
                      const cell = dpState.get(key);
                      const isCurrent =
                        currentStep &&
                        currentStep.mask === mask &&
                        currentStep.i === i;
                      if (!cell) {
                        return (
                          <td
                            key={i}
                            className="px-1 py-0.5 text-center text-muted-foreground/30"
                          >
                            ?
                          </td>
                        );
                      }
                      return (
                        <td
                          key={i}
                          className={`px-1 py-0.5 text-center ${
                            isCurrent
                              ? "bg-amber-400/30 text-amber-200 font-bold"
                              : "text-emerald-300"
                          }`}
                        >
                          {cell.value === Infinity
                            ? "∞"
                            : cell.value.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {currentStep && (
            <div className="text-[11px] text-muted-foreground mt-2 font-mono">
              dp[{maskToString(currentStep.mask, nCities)}][i=
              {currentStep.i}]{" "}
              ={" "}
              {(() => {
                const cell = dpState.get(
                  `${currentStep.mask}:${currentStep.i}`,
                );
                if (!cell) return "?";
                if (cell.value === Infinity) return "∞ (umulig)";
                if (!cell.from) return "0 (base case)";
                return `dp[${maskToString(
                  cell.from.mask,
                  nCities,
                )}][${cell.from.j}] + dist(${cell.from.j},${currentStep.i})`;
              })()}
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        <strong>Eksamen-fasit:</strong> tilstand{" "}
        <span className="font-mono">dp[S][i]</span> = korteste vei som starter
        i by 0, besøker eksakt subset S, og slutter i i. Antall tilstander = n·2ⁿ,
        hver oppdatering tar O(n) → totalt{" "}
        <span className="font-mono">O(n²·2ⁿ)</span>.
      </p>
    </div>
  );
}
