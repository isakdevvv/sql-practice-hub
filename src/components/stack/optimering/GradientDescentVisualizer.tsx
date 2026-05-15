import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Play, StepForward, Square } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv gradient-descent-visualisering.
// Fire moduser:
//   1) 1D parabola   f(x) = (x-3)² + 1                — konveks
//   2) 1D non-convex f(x) = sin(x) + 0.1·x²            — flere lokale minima
//   3) 2D contour    f(x,y) = x² + 10y²                — ill-conditioned bowl
//   4) Sammenlign    GD vs Momentum vs Adam på 2D     — side-om-side spor
// --------------------------------------------------------------------------

type Mode = "parabola" | "sinx2" | "contour" | "compare";

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "parabola", label: "1D parabola", sub: "f(x) = (x−3)² + 1" },
  { id: "sinx2", label: "1D non-convex", sub: "f(x) = sin(x) + 0.1·x²" },
  { id: "contour", label: "2D contour", sub: "f = x² + 10y² (zigzag)" },
  { id: "compare", label: "Sammenlign", sub: "GD · Momentum · Adam" },
];

const MODE_NOTE: Record<Mode, string> = {
  parabola:
    "Konveks: én entydig minimum i x=3. Med riktig α konvergerer GD raskt. Sett α høyt (>1.0) → oscillerer eller divergerer.",
  sinx2:
    "Non-convex: flere lokale minima. Startverdien avgjør hvilket minimum du havner i — global minimum er ikke garantert.",
  contour:
    "Ill-conditioned: gradienten peker bratt nedover y-aksen og slakt langs x-aksen. Ren GD zigzag-er på tvers av dalen.",
  compare:
    "Samme bowl, tre optimerere. Momentum og Adam demper zigzag og kommer raskere til bunnen.",
};

// ---------- matematikk ----------

function f1(x: number): number {
  return (x - 3) ** 2 + 1;
}
function df1(x: number): number {
  return 2 * (x - 3);
}

function f2(x: number): number {
  return Math.sin(x) + 0.1 * x * x;
}
function df2(x: number): number {
  return Math.cos(x) + 0.2 * x;
}

function f2d(x: number, y: number): number {
  return x * x + 10 * y * y;
}
function grad2d(x: number, y: number): [number, number] {
  return [2 * x, 20 * y];
}

// ---------- typer ----------

type Point1D = { x: number; y: number };
type Point2D = { x: number; y: number };

type CompareState = {
  gd: Point2D[];
  momentum: Point2D[];
  adam: Point2D[];
  // momentum state
  vmx: number;
  vmy: number;
  // adam state
  amx: number;
  amy: number;
  asx: number;
  asy: number;
  t: number;
};

// ---------- hoved-komponent ----------

export function GradientDescentVisualizer() {
  const [mode, setMode] = useState<Mode>("parabola");

  // Hyper-parametere
  const [lr, setLr] = useState(0.1); // 0.001 .. 1.0 (lineær lagring; slider bruker log)
  const [startX, setStartX] = useState(-2);
  const [startY, setStartY] = useState(0.8); // brukes i 2D
  const [maxSteps, setMaxSteps] = useState(30);

  // 1D historikk
  const [hist1d, setHist1d] = useState<Point1D[]>([]);
  // 2D historikk (gjelder også "compare")
  const [hist2d, setHist2d] = useState<Point2D[]>([]);
  // Momentum state (for 2D)
  const vRef = useRef<[number, number]>([0, 0]);
  // Adam state
  const adamRef = useRef<{ m: [number, number]; s: [number, number]; t: number }>({
    m: [0, 0],
    s: [0, 0],
    t: 0,
  });
  // For "compare"-modus
  const [cmp, setCmp] = useState<CompareState>(() => initCompare(-2.5, 0.9));

  // Auto-run intervall
  const runTimer = useRef<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Re-initialiser når man bytter modus eller startverdi
  useEffect(() => {
    stopRun();
    resetAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function resetAll() {
    if (mode === "parabola" || mode === "sinx2") {
      setHist1d([{ x: startX, y: mode === "parabola" ? f1(startX) : f2(startX) }]);
    } else if (mode === "contour") {
      setHist2d([{ x: startX, y: startY }]);
      vRef.current = [0, 0];
      adamRef.current = { m: [0, 0], s: [0, 0], t: 0 };
    } else if (mode === "compare") {
      setCmp(initCompare(startX, startY));
    }
  }

  function stopRun() {
    if (runTimer.current !== null) {
      window.clearInterval(runTimer.current);
      runTimer.current = null;
    }
    setIsRunning(false);
  }

  // Reset hver gang start-verdier endres (men kun struktur — ikke kjør)
  useEffect(() => {
    stopRun();
    resetAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startX, startY]);

  // ---------- ett steg ----------

  function step() {
    if (mode === "parabola") {
      const cur = hist1d[hist1d.length - 1];
      if (!cur) return;
      const g = df1(cur.x);
      const nx = cur.x - lr * g;
      if (Math.abs(nx) > 1e6 || !Number.isFinite(nx)) {
        // divergens — stopp
        stopRun();
        return;
      }
      setHist1d((h) =>
        h.length >= maxSteps + 1 ? h : [...h, { x: nx, y: f1(nx) }],
      );
    } else if (mode === "sinx2") {
      const cur = hist1d[hist1d.length - 1];
      if (!cur) return;
      const g = df2(cur.x);
      const nx = cur.x - lr * g;
      if (Math.abs(nx) > 1e6 || !Number.isFinite(nx)) {
        stopRun();
        return;
      }
      setHist1d((h) =>
        h.length >= maxSteps + 1 ? h : [...h, { x: nx, y: f2(nx) }],
      );
    } else if (mode === "contour") {
      const cur = hist2d[hist2d.length - 1];
      if (!cur) return;
      const [gx, gy] = grad2d(cur.x, cur.y);
      const nx = cur.x - lr * gx;
      const ny = cur.y - lr * gy;
      if (Math.abs(nx) > 1e6 || Math.abs(ny) > 1e6 || !Number.isFinite(nx) || !Number.isFinite(ny)) {
        stopRun();
        return;
      }
      setHist2d((h) => (h.length >= maxSteps + 1 ? h : [...h, { x: nx, y: ny }]));
    } else if (mode === "compare") {
      setCmp((s) => stepCompare(s, lr, maxSteps));
    }
  }

  // Kjør alle
  function runAll() {
    if (isRunning) {
      stopRun();
      return;
    }
    setIsRunning(true);
    runTimer.current = window.setInterval(() => {
      // Bruker function-form for å lese fersk state.
      // step() bruker setState slik at vi har ferskest data fra closure.
      // For å være helt sikker leser vi via setters med funksjons-callback:
      if (mode === "parabola" || mode === "sinx2") {
        setHist1d((h) => {
          if (h.length >= maxSteps + 1) {
            stopRun();
            return h;
          }
          const cur = h[h.length - 1];
          const g = mode === "parabola" ? df1(cur.x) : df2(cur.x);
          const nx = cur.x - lr * g;
          if (Math.abs(nx) > 1e6 || !Number.isFinite(nx)) {
            stopRun();
            return h;
          }
          const ny = mode === "parabola" ? f1(nx) : f2(nx);
          return [...h, { x: nx, y: ny }];
        });
      } else if (mode === "contour") {
        setHist2d((h) => {
          if (h.length >= maxSteps + 1) {
            stopRun();
            return h;
          }
          const cur = h[h.length - 1];
          const [gx, gy] = grad2d(cur.x, cur.y);
          const nx = cur.x - lr * gx;
          const ny = cur.y - lr * gy;
          if (
            Math.abs(nx) > 1e6 ||
            Math.abs(ny) > 1e6 ||
            !Number.isFinite(nx) ||
            !Number.isFinite(ny)
          ) {
            stopRun();
            return h;
          }
          return [...h, { x: nx, y: ny }];
        });
      } else if (mode === "compare") {
        setCmp((s) => {
          const done =
            s.gd.length >= maxSteps + 1 &&
            s.momentum.length >= maxSteps + 1 &&
            s.adam.length >= maxSteps + 1;
          if (done) {
            stopRun();
            return s;
          }
          return stepCompare(s, lr, maxSteps);
        });
      }
    }, 160);
  }

  function handleReset() {
    stopRun();
    resetAll();
  }

  // ---------- avledede verdier til UI ----------

  const currentValueText = useMemo(() => {
    if (mode === "parabola" || mode === "sinx2") {
      const cur = hist1d[hist1d.length - 1];
      if (!cur) return "—";
      return `x = ${cur.x.toFixed(3)},  f(x) = ${cur.y.toFixed(3)}`;
    }
    if (mode === "contour") {
      const cur = hist2d[hist2d.length - 1];
      if (!cur) return "—";
      return `x = ${cur.x.toFixed(3)},  y = ${cur.y.toFixed(3)},  f = ${f2d(cur.x, cur.y).toFixed(3)}`;
    }
    // compare
    const g = cmp.gd[cmp.gd.length - 1];
    const m = cmp.momentum[cmp.momentum.length - 1];
    const a = cmp.adam[cmp.adam.length - 1];
    return `GD f=${f2d(g.x, g.y).toFixed(3)} · mom f=${f2d(m.x, m.y).toFixed(3)} · adam f=${f2d(a.x, a.y).toFixed(3)}`;
  }, [mode, hist1d, hist2d, cmp]);

  const steps =
    mode === "parabola" || mode === "sinx2"
      ? Math.max(0, hist1d.length - 1)
      : mode === "contour"
      ? Math.max(0, hist2d.length - 1)
      : Math.max(0, cmp.gd.length - 1);

  // ---------- log-slider for lr ----------

  // Mapper slider 0..1 til lr 0.001..1.0 (log10).
  const lrSlider = Math.log10(lr / 0.001) / Math.log10(1.0 / 0.001);
  const onLrSlider = (v: number) => {
    const next = 0.001 * Math.pow(1.0 / 0.001, v);
    setLr(Number(next.toFixed(4)));
  };

  const diverging = useMemo(() => {
    if (mode === "parabola" || mode === "sinx2") {
      const cur = hist1d[hist1d.length - 1];
      if (!cur) return false;
      return Math.abs(cur.x) > 30;
    }
    if (mode === "contour") {
      const cur = hist2d[hist2d.length - 1];
      if (!cur) return false;
      return Math.abs(cur.x) > 30 || Math.abs(cur.y) > 30;
    }
    return false;
  }, [mode, hist1d, hist2d]);

  // ---------- RENDER ----------

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Topp-bar med modus-velger */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              Gradient descent — se hvordan optimerere finner bunnen
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                mode === m.id
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border hover:bg-muted"
              }`}
              title={m.sub}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visualisering */}
      <div className="p-4 sm:p-6 min-h-[280px] flex items-center justify-center bg-background">
        {(mode === "parabola" || mode === "sinx2") && (
          <Plot1D mode={mode} hist={hist1d} diverging={diverging} />
        )}
        {mode === "contour" && (
          <Plot2D
            path={hist2d}
            color="var(--brand, #6366f1)"
            label="GD"
            diverging={diverging}
          />
        )}
        {mode === "compare" && <CompareView cmp={cmp} />}
      </div>

      {/* Kontroller */}
      <div className="px-4 py-3 border-t border-border bg-muted/20 space-y-3">
        <div className="text-xs text-muted-foreground italic">{MODE_NOTE[mode]}</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Learning rate (log slider) */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground w-24 shrink-0" htmlFor="gd-lr">
              learning rate α
            </label>
            <input
              id="gd-lr"
              type="range"
              min={0}
              max={1}
              step={0.005}
              value={lrSlider}
              onChange={(e) => onLrSlider(Number(e.target.value))}
              className="flex-1 accent-brand"
            />
            <span className="font-mono text-xs w-16 text-right tabular-nums">
              {lr < 0.01 ? lr.toExponential(1) : lr.toFixed(3)}
            </span>
          </div>

          {/* Antall steg */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground w-24 shrink-0" htmlFor="gd-steps">
              maks steg
            </label>
            <input
              id="gd-steps"
              type="range"
              min={5}
              max={100}
              step={1}
              value={maxSteps}
              onChange={(e) => setMaxSteps(Number(e.target.value))}
              className="flex-1 accent-brand"
            />
            <span className="font-mono text-xs w-16 text-right tabular-nums">
              {steps}/{maxSteps}
            </span>
          </div>

          {/* Start-x */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground w-24 shrink-0" htmlFor="gd-sx">
              start x
            </label>
            <input
              id="gd-sx"
              type="range"
              min={mode === "sinx2" ? -8 : -5}
              max={mode === "sinx2" ? 8 : 5}
              step={0.1}
              value={startX}
              onChange={(e) => setStartX(Number(e.target.value))}
              className="flex-1 accent-brand"
            />
            <span className="font-mono text-xs w-16 text-right tabular-nums">
              {startX.toFixed(2)}
            </span>
          </div>

          {/* Start-y (kun 2D) */}
          {(mode === "contour" || mode === "compare") && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground w-24 shrink-0" htmlFor="gd-sy">
                start y
              </label>
              <input
                id="gd-sy"
                type="range"
                min={-1.5}
                max={1.5}
                step={0.05}
                value={startY}
                onChange={(e) => setStartY(Number(e.target.value))}
                className="flex-1 accent-brand"
              />
              <span className="font-mono text-xs w-16 text-right tabular-nums">
                {startY.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Knapper */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={step}
            disabled={isRunning}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-brand/40 text-brand hover:bg-brand/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <StepForward className="h-3.5 w-3.5" />
            Steg
          </button>
          <button
            type="button"
            onClick={runAll}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-brand/40 text-brand hover:bg-brand/10"
          >
            {isRunning ? (
              <>
                <Square className="h-3.5 w-3.5" />
                Stopp
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                Kjør alle
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-muted"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <span className="ml-auto text-xs font-mono text-muted-foreground tabular-nums">
            {currentValueText}
          </span>
        </div>

        {diverging && (
          <div className="text-xs text-destructive font-medium">
            α er for stor — punktet divergerer. Prøv lavere α.
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 1D plot
// ============================================================================

function Plot1D({
  mode,
  hist,
  diverging,
}: {
  mode: "parabola" | "sinx2";
  hist: Point1D[];
  diverging: boolean;
}) {
  const W = 640;
  const H = 280;
  const padL = 36;
  const padR = 16;
  const padT = 16;
  const padB = 30;

  // Domene
  const [xMin, xMax] = mode === "parabola" ? [-2, 8] : [-8, 8];
  const yMin = 0;
  const yMax = mode === "parabola" ? 30 : 8;

  const xToPx = (x: number) =>
    padL + ((x - xMin) / (xMax - xMin)) * (W - padL - padR);
  const yToPx = (y: number) =>
    padT + (1 - (y - yMin) / (yMax - yMin)) * (H - padT - padB);

  const f = mode === "parabola" ? f1 : f2;
  const df = mode === "parabola" ? df1 : df2;

  // Funksjons-kurven
  const pathD = useMemo(() => {
    const N = 200;
    const pts: string[] = [];
    for (let i = 0; i <= N; i++) {
      const x = xMin + ((xMax - xMin) * i) / N;
      const y = Math.min(Math.max(f(x), yMin - 2), yMax + 2);
      pts.push(`${i === 0 ? "M" : "L"} ${xToPx(x).toFixed(2)} ${yToPx(y).toFixed(2)}`);
    }
    return pts.join(" ");
  }, [mode, xMin, xMax, yMin, yMax]);

  const cur = hist[hist.length - 1];

  // Tangent på siste punkt
  let tangentLine: { x1: number; y1: number; x2: number; y2: number } | null = null;
  if (cur && !diverging) {
    const m = df(cur.x);
    const dx = 1.0;
    const x1 = cur.x - dx;
    const x2 = cur.x + dx;
    const y1 = cur.y + m * (x1 - cur.x);
    const y2 = cur.y + m * (x2 - cur.x);
    tangentLine = { x1, y1, x2, y2 };
  }

  // Gitter
  const xTicks = mode === "parabola" ? [-2, 0, 2, 3, 4, 6, 8] : [-8, -4, 0, 4, 8];
  const yTicks = mode === "parabola" ? [0, 10, 20, 30] : [0, 2, 4, 6, 8];

  // Minima-markører for sinx2 (omtrentlige numeriske minima)
  const minimaMarkers =
    mode === "sinx2"
      ? [-4.49, 1.31, 7.07].filter((x) => x >= xMin && x <= xMax).map((x) => ({ x, y: f2(x) }))
      : [{ x: 3, y: 1 }];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-3xl mx-auto block"
        style={{ height: "min(40vh, 320px)" }}
      >
        {/* Bakgrunns-gitter */}
        {xTicks.map((t) => (
          <g key={`vx-${t}`}>
            <line
              x1={xToPx(t)}
              y1={padT}
              x2={xToPx(t)}
              y2={H - padB}
              stroke="currentColor"
              strokeOpacity={0.06}
            />
            <text
              x={xToPx(t)}
              y={H - padB + 14}
              fontSize="10"
              textAnchor="middle"
              className="fill-muted-foreground"
              fontFamily="ui-monospace, monospace"
            >
              {t}
            </text>
          </g>
        ))}
        {yTicks.map((t) => (
          <g key={`vy-${t}`}>
            <line
              x1={padL}
              y1={yToPx(t)}
              x2={W - padR}
              y2={yToPx(t)}
              stroke="currentColor"
              strokeOpacity={0.06}
            />
            <text
              x={padL - 6}
              y={yToPx(t) + 3}
              fontSize="10"
              textAnchor="end"
              className="fill-muted-foreground"
              fontFamily="ui-monospace, monospace"
            >
              {t}
            </text>
          </g>
        ))}

        {/* x-akse */}
        <line
          x1={padL}
          y1={H - padB}
          x2={W - padR}
          y2={H - padB}
          stroke="currentColor"
          strokeOpacity={0.3}
        />
        {/* y-akse */}
        <line
          x1={padL}
          y1={padT}
          x2={padL}
          y2={H - padB}
          stroke="currentColor"
          strokeOpacity={0.3}
        />

        {/* Funksjons-kurve */}
        <path
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.4}
          strokeWidth={1.5}
        />

        {/* Minima */}
        {minimaMarkers.map((m, i) => (
          <g key={`min-${i}`}>
            <circle
              cx={xToPx(m.x)}
              cy={yToPx(m.y)}
              r={3}
              className="fill-success"
              opacity={0.7}
            />
          </g>
        ))}

        {/* Breadcrumbs */}
        {hist.slice(0, -1).map((p, i) => {
          const opacity = 0.15 + 0.5 * (i / Math.max(1, hist.length - 1));
          return (
            <circle
              key={`bc-${i}`}
              cx={xToPx(p.x)}
              cy={yToPx(Math.min(Math.max(p.y, yMin - 1), yMax + 1))}
              r={3}
              className="fill-brand"
              opacity={opacity * 0.5}
            />
          );
        })}

        {/* Sti mellom breadcrumbs */}
        {hist.length > 1 && (
          <path
            d={hist
              .map(
                (p, i) =>
                  `${i === 0 ? "M" : "L"} ${xToPx(p.x).toFixed(2)} ${yToPx(
                    Math.min(Math.max(p.y, yMin - 1), yMax + 1),
                  ).toFixed(2)}`,
              )
              .join(" ")}
            fill="none"
            stroke="var(--brand, #6366f1)"
            strokeOpacity={0.35}
            strokeWidth={1}
            strokeDasharray="2 3"
          />
        )}

        {/* Tangent på siste punkt */}
        {tangentLine && (
          <line
            x1={xToPx(tangentLine.x1)}
            y1={yToPx(Math.min(Math.max(tangentLine.y1, yMin - 5), yMax + 5))}
            x2={xToPx(tangentLine.x2)}
            y2={yToPx(Math.min(Math.max(tangentLine.y2, yMin - 5), yMax + 5))}
            stroke="var(--destructive, #ef4444)"
            strokeWidth={1.5}
            strokeOpacity={0.7}
          />
        )}

        {/* Nåværende punkt */}
        {cur && !diverging && (
          <circle
            cx={xToPx(cur.x)}
            cy={yToPx(Math.min(Math.max(cur.y, yMin - 1), yMax + 1))}
            r={6}
            className="fill-brand"
            stroke="white"
            strokeWidth={2}
            style={{ transition: "cx 200ms ease-out, cy 200ms ease-out" }}
          />
        )}

        {/* Tittel */}
        <text
          x={W - padR}
          y={padT + 4}
          fontSize="11"
          textAnchor="end"
          className="fill-muted-foreground"
          fontFamily="ui-monospace, monospace"
        >
          {mode === "parabola" ? "f(x) = (x−3)² + 1" : "f(x) = sin(x) + 0.1·x²"}
        </text>
      </svg>
    </div>
  );
}

// ============================================================================
// 2D contour plot
// ============================================================================

function Plot2D({
  path,
  color,
  label,
  diverging,
}: {
  path: Point2D[];
  color: string;
  label: string;
  diverging: boolean;
}) {
  const W = 560;
  const H = 320;
  const padL = 36;
  const padR = 16;
  const padT = 16;
  const padB = 30;

  const xMin = -3;
  const xMax = 3;
  const yMin = -1.2;
  const yMax = 1.2;

  const xToPx = (x: number) =>
    padL + ((x - xMin) / (xMax - xMin)) * (W - padL - padR);
  const yToPx = (y: number) =>
    padT + (1 - (y - yMin) / (yMax - yMin)) * (H - padT - padB);

  // Konturer som ellipser: f(x,y) = x² + 10y² = c
  // x² / c + y² / (c/10) = 1 → halvakser √c og √(c/10)
  const contourLevels = [0.5, 2, 5, 10, 20];

  const cur = path[path.length - 1];
  const gradArrow = useMemo(() => {
    if (!cur || diverging) return null;
    const [gx, gy] = grad2d(cur.x, cur.y);
    const norm = Math.hypot(gx, gy);
    if (norm < 1e-6) return null;
    // Tegn gradienten skalert til litt under et viz-utstrekning
    const scale = 0.5 / norm;
    return { dx: gx * scale, dy: gy * scale };
  }, [cur, diverging]);

  const xTicks = [-3, -2, -1, 0, 1, 2, 3];
  const yTicks = [-1, 0, 1];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-2xl mx-auto block"
        style={{ height: "min(45vh, 360px)" }}
      >
        {/* Bakgrunns-gitter */}
        {xTicks.map((t) => (
          <g key={`gx-${t}`}>
            <line
              x1={xToPx(t)}
              y1={padT}
              x2={xToPx(t)}
              y2={H - padB}
              stroke="currentColor"
              strokeOpacity={0.06}
            />
            <text
              x={xToPx(t)}
              y={H - padB + 14}
              fontSize="10"
              textAnchor="middle"
              className="fill-muted-foreground"
              fontFamily="ui-monospace, monospace"
            >
              {t}
            </text>
          </g>
        ))}
        {yTicks.map((t) => (
          <g key={`gy-${t}`}>
            <line
              x1={padL}
              y1={yToPx(t)}
              x2={W - padR}
              y2={yToPx(t)}
              stroke="currentColor"
              strokeOpacity={0.06}
            />
            <text
              x={padL - 6}
              y={yToPx(t) + 3}
              fontSize="10"
              textAnchor="end"
              className="fill-muted-foreground"
              fontFamily="ui-monospace, monospace"
            >
              {t}
            </text>
          </g>
        ))}

        {/* Akser */}
        <line
          x1={padL}
          y1={H - padB}
          x2={W - padR}
          y2={H - padB}
          stroke="currentColor"
          strokeOpacity={0.3}
        />
        <line
          x1={padL}
          y1={padT}
          x2={padL}
          y2={H - padB}
          stroke="currentColor"
          strokeOpacity={0.3}
        />

        {/* Konturer */}
        {contourLevels.map((c) => {
          const rxData = Math.sqrt(c);
          const ryData = Math.sqrt(c / 10);
          const cx = xToPx(0);
          const cy = yToPx(0);
          const rx = (rxData / (xMax - xMin)) * (W - padL - padR);
          const ry = (ryData / (yMax - yMin)) * (H - padT - padB);
          return (
            <g key={`c-${c}`}>
              <ellipse
                cx={cx}
                cy={cy}
                rx={rx}
                ry={ry}
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.25}
                strokeWidth={1}
              />
              <text
                x={cx + rx + 2}
                y={cy + 3}
                fontSize="9"
                className="fill-muted-foreground"
                fontFamily="ui-monospace, monospace"
                opacity={0.6}
              >
                {c}
              </text>
            </g>
          );
        })}

        {/* Minimum-markør */}
        <circle cx={xToPx(0)} cy={yToPx(0)} r={3} className="fill-success" opacity={0.8} />

        {/* Sti */}
        {path.length > 1 && (
          <path
            d={path
              .map(
                (p, i) =>
                  `${i === 0 ? "M" : "L"} ${xToPx(clamp(p.x, xMin, xMax)).toFixed(2)} ${yToPx(
                    clamp(p.y, yMin, yMax),
                  ).toFixed(2)}`,
              )
              .join(" ")}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeOpacity={0.7}
          />
        )}
        {path.slice(0, -1).map((p, i) => (
          <circle
            key={`p2-${i}`}
            cx={xToPx(clamp(p.x, xMin, xMax))}
            cy={yToPx(clamp(p.y, yMin, yMax))}
            r={2.5}
            fill={color}
            opacity={0.4}
          />
        ))}

        {/* Gradient-pil ved nåværende punkt (peker mot −∇f) */}
        {cur && gradArrow && (
          <line
            x1={xToPx(clamp(cur.x, xMin, xMax))}
            y1={yToPx(clamp(cur.y, yMin, yMax))}
            x2={xToPx(clamp(cur.x - gradArrow.dx, xMin, xMax))}
            y2={yToPx(clamp(cur.y - gradArrow.dy, yMin, yMax))}
            stroke="var(--destructive, #ef4444)"
            strokeWidth={1.5}
            strokeOpacity={0.7}
            markerEnd="url(#arrowhead)"
          />
        )}

        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <polygon points="0 0, 8 4, 0 8" fill="var(--destructive, #ef4444)" opacity={0.8} />
          </marker>
        </defs>

        {/* Nåværende punkt */}
        {cur && !diverging && (
          <circle
            cx={xToPx(clamp(cur.x, xMin, xMax))}
            cy={yToPx(clamp(cur.y, yMin, yMax))}
            r={6}
            fill={color}
            stroke="white"
            strokeWidth={2}
            style={{ transition: "cx 200ms ease-out, cy 200ms ease-out" }}
          />
        )}

        {/* Etikett */}
        <text
          x={W - padR}
          y={padT + 4}
          fontSize="11"
          textAnchor="end"
          className="fill-muted-foreground"
          fontFamily="ui-monospace, monospace"
        >
          {label}: f(x,y) = x² + 10y²
        </text>
      </svg>
    </div>
  );
}

// ============================================================================
// Compare view — tre optimerere side om side på samme bowl
// ============================================================================

function CompareView({ cmp }: { cmp: CompareState }) {
  return (
    <div className="w-full space-y-2">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MiniCompare title="GD" color="var(--brand, #6366f1)" path={cmp.gd} />
        <MiniCompare title="Momentum (β=0.9)" color="#10b981" path={cmp.momentum} />
        <MiniCompare title="Adam" color="#f59e0b" path={cmp.adam} />
      </div>
      <div className="text-[10px] text-muted-foreground text-center font-mono">
        Samme f(x,y) = x² + 10y² · samme startpunkt · samme α — bare optimizer-formel varierer.
      </div>
    </div>
  );
}

function MiniCompare({
  title,
  color,
  path,
}: {
  title: string;
  color: string;
  path: Point2D[];
}) {
  const W = 280;
  const H = 200;
  const padL = 24;
  const padR = 8;
  const padT = 22;
  const padB = 18;
  const xMin = -3;
  const xMax = 3;
  const yMin = -1.2;
  const yMax = 1.2;
  const xToPx = (x: number) =>
    padL + ((x - xMin) / (xMax - xMin)) * (W - padL - padR);
  const yToPx = (y: number) =>
    padT + (1 - (y - yMin) / (yMax - yMin)) * (H - padT - padB);

  const cur = path[path.length - 1];
  const contourLevels = [0.5, 2, 5, 10, 20];

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-3 py-1.5 text-xs font-mono font-semibold flex items-center justify-between border-b border-border bg-muted/30">
        <span style={{ color }}>{title}</span>
        <span className="text-muted-foreground text-[10px] tabular-nums">
          {cur ? `f=${f2d(cur.x, cur.y).toFixed(3)}` : "—"}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full block">
        {/* Konturer */}
        {contourLevels.map((c) => {
          const rxData = Math.sqrt(c);
          const ryData = Math.sqrt(c / 10);
          const cx = xToPx(0);
          const cy = yToPx(0);
          const rx = (rxData / (xMax - xMin)) * (W - padL - padR);
          const ry = (ryData / (yMax - yMin)) * (H - padT - padB);
          return (
            <ellipse
              key={`mc-${c}`}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.18}
              strokeWidth={1}
            />
          );
        })}

        {/* Akser (subtilt) */}
        <line
          x1={padL}
          y1={H - padB}
          x2={W - padR}
          y2={H - padB}
          stroke="currentColor"
          strokeOpacity={0.2}
        />
        <line
          x1={padL}
          y1={padT}
          x2={padL}
          y2={H - padB}
          stroke="currentColor"
          strokeOpacity={0.2}
        />

        <circle cx={xToPx(0)} cy={yToPx(0)} r={2.5} className="fill-success" opacity={0.8} />

        {path.length > 1 && (
          <path
            d={path
              .map(
                (p, i) =>
                  `${i === 0 ? "M" : "L"} ${xToPx(clamp(p.x, xMin, xMax)).toFixed(2)} ${yToPx(
                    clamp(p.y, yMin, yMax),
                  ).toFixed(2)}`,
              )
              .join(" ")}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeOpacity={0.8}
          />
        )}

        {path.slice(0, -1).map((p, i) => (
          <circle
            key={`mp-${i}`}
            cx={xToPx(clamp(p.x, xMin, xMax))}
            cy={yToPx(clamp(p.y, yMin, yMax))}
            r={1.8}
            fill={color}
            opacity={0.45}
          />
        ))}

        {cur && (
          <circle
            cx={xToPx(clamp(cur.x, xMin, xMax))}
            cy={yToPx(clamp(cur.y, yMin, yMax))}
            r={4.5}
            fill={color}
            stroke="white"
            strokeWidth={1.5}
            style={{ transition: "cx 180ms ease-out, cy 180ms ease-out" }}
          />
        )}
      </svg>
    </div>
  );
}

// ============================================================================
// helpers
// ============================================================================

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function initCompare(sx: number, sy: number): CompareState {
  return {
    gd: [{ x: sx, y: sy }],
    momentum: [{ x: sx, y: sy }],
    adam: [{ x: sx, y: sy }],
    vmx: 0,
    vmy: 0,
    amx: 0,
    amy: 0,
    asx: 0,
    asy: 0,
    t: 0,
  };
}

function stepCompare(s: CompareState, lr: number, maxSteps: number): CompareState {
  const next: CompareState = { ...s };

  // GD
  if (s.gd.length < maxSteps + 1) {
    const cur = s.gd[s.gd.length - 1];
    const [gx, gy] = grad2d(cur.x, cur.y);
    const nx = cur.x - lr * gx;
    const ny = cur.y - lr * gy;
    if (
      Math.abs(nx) < 1e6 &&
      Math.abs(ny) < 1e6 &&
      Number.isFinite(nx) &&
      Number.isFinite(ny)
    ) {
      next.gd = [...s.gd, { x: nx, y: ny }];
    }
  }

  // Momentum: v ← β·v + g ; w ← w − lr·v
  if (s.momentum.length < maxSteps + 1) {
    const cur = s.momentum[s.momentum.length - 1];
    const [gx, gy] = grad2d(cur.x, cur.y);
    const beta = 0.9;
    const vmx = beta * s.vmx + gx;
    const vmy = beta * s.vmy + gy;
    const nx = cur.x - lr * vmx;
    const ny = cur.y - lr * vmy;
    next.vmx = vmx;
    next.vmy = vmy;
    if (
      Math.abs(nx) < 1e6 &&
      Math.abs(ny) < 1e6 &&
      Number.isFinite(nx) &&
      Number.isFinite(ny)
    ) {
      next.momentum = [...s.momentum, { x: nx, y: ny }];
    }
  }

  // Adam
  if (s.adam.length < maxSteps + 1) {
    const cur = s.adam[s.adam.length - 1];
    const [gx, gy] = grad2d(cur.x, cur.y);
    const b1 = 0.9;
    const b2 = 0.999;
    const eps = 1e-8;
    const t = s.t + 1;
    const amx = b1 * s.amx + (1 - b1) * gx;
    const amy = b1 * s.amy + (1 - b1) * gy;
    const asx = b2 * s.asx + (1 - b2) * gx * gx;
    const asy = b2 * s.asy + (1 - b2) * gy * gy;
    const mhx = amx / (1 - Math.pow(b1, t));
    const mhy = amy / (1 - Math.pow(b1, t));
    const shx = asx / (1 - Math.pow(b2, t));
    const shy = asy / (1 - Math.pow(b2, t));
    // Adam bruker typisk en større effektiv lr enn ren GD. For å gjøre sammenligningen
    // rettferdig på dette bowlet bruker vi samme α, men husk at Adam normaliserer per parameter.
    const nx = cur.x - lr * (mhx / (Math.sqrt(shx) + eps));
    const ny = cur.y - lr * (mhy / (Math.sqrt(shy) + eps));
    next.amx = amx;
    next.amy = amy;
    next.asx = asx;
    next.asy = asy;
    next.t = t;
    if (
      Math.abs(nx) < 1e6 &&
      Math.abs(ny) < 1e6 &&
      Number.isFinite(nx) &&
      Number.isFinite(ny)
    ) {
      next.adam = [...s.adam, { x: nx, y: ny }];
    }
  }

  return next;
}
