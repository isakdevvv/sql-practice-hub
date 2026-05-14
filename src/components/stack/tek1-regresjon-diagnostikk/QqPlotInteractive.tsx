import { useEffect, useMemo, useRef, useState } from "react";

// Inverse standard normal (Beasley–Springer–Moro)
function normInv(p: number): number {
  const a1 = -39.6968302866538,
    a2 = 220.946098424521,
    a3 = -275.928510446969,
    a4 = 138.357751867269,
    a5 = -30.6647980661472,
    a6 = 2.50662827745924;
  const b1 = -54.4760987982241,
    b2 = 161.585836858041,
    b3 = -155.698979859887,
    b4 = 66.8013118877197,
    b5 = -13.2806815528857;
  const c1 = -7.78489400243029e-3,
    c2 = -0.322396458041136,
    c3 = -2.40075827716184,
    c4 = -2.54973253934373,
    c5 = 4.37466414146497,
    c6 = 2.93816398269878;
  const d1 = 7.78469570904146e-3,
    d2 = 0.32246712907004,
    d3 = 2.445134137143,
    d4 = 3.75440866190742;
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number, r: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
    );
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q) /
      (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1)
    );
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return (
      -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
    );
  }
}

// Build a sorted sample of length n with given shape
type Preset = "normal" | "skew-right" | "heavy-tails" | "bimodal";

function presetSample(preset: Preset, n: number): number[] {
  // Use deterministic quantile-style points so resets are reproducible.
  const pp = (i: number) => (i + 0.5) / n; // standard plotting position
  const arr: number[] = [];
  for (let i = 0; i < n; i++) {
    const p = pp(i);
    const z = normInv(p);
    let v: number;
    if (preset === "normal") {
      v = z;
    } else if (preset === "skew-right") {
      // Map z through exp to create right skew, centre around 0
      v = Math.exp(0.7 * z) - 1; // E[exp(0.7Z)]-1 ≈ 0.28; we won't subtract — visible skew is the point
    } else if (preset === "heavy-tails") {
      // Stretch tails relative to centre
      v = z * (1 + 0.5 * Math.abs(z));
    } else {
      // bimodal: two clumps
      v = i < n / 2 ? z - 1.5 : z + 1.5;
    }
    arr.push(v);
  }
  arr.sort((a, b) => a - b);
  return arr;
}

const PRESET_LABELS: { id: Preset; label: string; note: string }[] = [
  {
    id: "normal",
    label: "Normal",
    note: "Punktene følger linjen — antakelsen holder.",
  },
  {
    id: "skew-right",
    label: "Høyreskjev",
    note: "Nedre venstre kurver opp, øvre høyre stikker av: store y-verdier er ekstreme.",
  },
  {
    id: "heavy-tails",
    label: "Tunge haler",
    note: "S-form: punktene i begge haler ligger lenger fra 0 enn normalen tilsier.",
  },
  {
    id: "bimodal",
    label: "Bimodal",
    note: "Trapp/«hopp» midt på — to klynger maskerer seg som én normalfordeling.",
  },
];

export function QqPlotInteractive() {
  const N = 20;
  const [preset, setPreset] = useState<Preset>("normal");
  const [observed, setObserved] = useState<number[]>(() =>
    presetSample("normal", N),
  );
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const theoretical = useMemo(
    () => Array.from({ length: N }, (_, i) => normInv((i + 0.5) / N)),
    [],
  );

  // Linear regression of observed (y) on theoretical (x)
  const reg = useMemo(() => {
    const n = N;
    const meanX = theoretical.reduce((s, v) => s + v, 0) / n;
    const meanY = observed.reduce((s, v) => s + v, 0) / n;
    let sxx = 0,
      syy = 0,
      sxy = 0;
    for (let i = 0; i < n; i++) {
      const dx = theoretical[i] - meanX;
      const dy = observed[i] - meanY;
      sxx += dx * dx;
      syy += dy * dy;
      sxy += dx * dy;
    }
    const slope = sxy / (sxx || 1);
    const intercept = meanY - slope * meanX;
    const r = sxy / (Math.sqrt(sxx * syy) || 1);
    return { slope, intercept, r2: r * r };
  }, [observed, theoretical]);

  // SVG layout
  const W = 480;
  const H = 320;
  const padL = 38;
  const padR = 10;
  const padT = 10;
  const padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  // y bounds: include data + the y=x reference range
  const yMin = -4;
  const yMax = 4;
  const xMin = -3;
  const xMax = 3;
  const xPx = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * plotW;
  const yPx = (y: number) =>
    padT + plotH - ((y - yMin) / (yMax - yMin)) * plotH;
  const fromPxY = (py: number) =>
    yMin + ((padT + plotH - py) / plotH) * (yMax - yMin);

  function applyPreset(p: Preset) {
    setPreset(p);
    setObserved(presetSample(p, N));
  }

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    if (dragIdx == null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const sy = e.clientY - rect.top;
    const ratioY = H / rect.height;
    const newY = Math.max(yMin, Math.min(yMax, fromPxY(sy * ratioY)));
    setObserved((cur) => {
      const next = [...cur];
      next[dragIdx] = newY;
      return next;
    });
  }

  useEffect(() => {
    function up() {
      setDragIdx(null);
    }
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
  }, []);

  const note = PRESET_LABELS.find((p) => p.id === preset)?.note;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold">
        Q-Q-plot — dra punktene, se R² endre seg
      </div>
      <p className="text-xs text-muted-foreground">
        Hvert punkt sammenligner et observert kvantil med det forventede fra{" "}
        <code>N(0,1)</code>. Punkter på diagonalen (y = x) = normalfordelte
        data. Dra punktene vertikalt, eller velg en preset for å se klassiske
        avvik.
      </p>

      <div className="flex flex-wrap gap-2">
        {PRESET_LABELS.map((p) => (
          <button
            key={p.id}
            onClick={() => applyPreset(p.id)}
            className={`rounded border px-2.5 py-1 text-xs transition ${
              preset === p.id
                ? "border-brand bg-brand/10 text-brand"
                : "border-border bg-background hover:border-brand/40"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto border border-border rounded bg-background touch-none"
        onMouseMove={onMove}
        onTouchMove={(e) => {
          if (dragIdx == null || !svgRef.current || e.touches.length === 0)
            return;
          const t = e.touches[0];
          const rect = svgRef.current.getBoundingClientRect();
          const sy = t.clientY - rect.top;
          const ratioY = H / rect.height;
          const newY = Math.max(yMin, Math.min(yMax, fromPxY(sy * ratioY)));
          setObserved((cur) => {
            const next = [...cur];
            next[dragIdx] = newY;
            return next;
          });
        }}
      >
        {/* axes / grid */}
        {[-3, -2, -1, 0, 1, 2, 3].map((g) => (
          <line
            key={`gx${g}`}
            x1={xPx(g)}
            y1={padT}
            x2={xPx(g)}
            y2={padT + plotH}
            stroke="hsl(0 0% 60% / 0.18)"
            strokeWidth={0.6}
          />
        ))}
        {[-4, -2, 0, 2, 4].map((g) => (
          <line
            key={`gy${g}`}
            x1={padL}
            y1={yPx(g)}
            x2={padL + plotW}
            y2={yPx(g)}
            stroke="hsl(0 0% 60% / 0.18)"
            strokeWidth={0.6}
          />
        ))}

        {/* y = x reference line */}
        <line
          x1={xPx(xMin)}
          y1={yPx(xMin)}
          x2={xPx(xMax)}
          y2={yPx(xMax)}
          stroke="hsl(0 0% 50%)"
          strokeWidth={1}
          strokeDasharray="4 3"
        />

        {/* regression line on observed */}
        <line
          x1={xPx(xMin)}
          y1={yPx(reg.intercept + reg.slope * xMin)}
          x2={xPx(xMax)}
          y2={yPx(reg.intercept + reg.slope * xMax)}
          stroke="hsl(220 70% 55%)"
          strokeWidth={1.5}
        />

        {/* points */}
        {observed.map((y, i) => {
          const x = theoretical[i];
          return (
            <circle
              key={i}
              cx={xPx(x)}
              cy={yPx(y)}
              r={6}
              fill="hsl(220 75% 55%)"
              stroke="white"
              strokeWidth={1.5}
              style={{ cursor: "ns-resize" }}
              onMouseDown={() => setDragIdx(i)}
              onTouchStart={(e) => {
                e.preventDefault();
                setDragIdx(i);
              }}
            />
          );
        })}

        {/* x ticks */}
        {[-3, -2, -1, 0, 1, 2, 3].map((g) => (
          <text
            key={`tx${g}`}
            x={xPx(g)}
            y={padT + plotH + 14}
            textAnchor="middle"
            fontSize={10}
            className="fill-muted-foreground"
          >
            {g}
          </text>
        ))}
        {/* y ticks */}
        {[-4, -2, 0, 2, 4].map((g) => (
          <text
            key={`ty${g}`}
            x={padL - 6}
            y={yPx(g) + 3}
            textAnchor="end"
            fontSize={10}
            className="fill-muted-foreground"
          >
            {g}
          </text>
        ))}

        {/* axis labels */}
        <text
          x={padL + plotW / 2}
          y={H - 4}
          textAnchor="middle"
          fontSize={10}
          className="fill-muted-foreground"
        >
          Teoretisk kvantil (N(0,1))
        </text>
        <text
          x={padL - 28}
          y={padT + plotH / 2}
          textAnchor="middle"
          fontSize={10}
          className="fill-muted-foreground"
          transform={`rotate(-90 ${padL - 28} ${padT + plotH / 2})`}
        >
          Observert kvantil
        </text>
      </svg>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg border border-border bg-background p-3 font-mono space-y-0.5">
          <div>n = {N} punkter</div>
          <div>helning = {reg.slope.toFixed(3)} (1.000 = ren normal)</div>
          <div>intercept = {reg.intercept.toFixed(3)}</div>
          <div className="text-brand">R² = {reg.r2.toFixed(4)}</div>
        </div>
        <div className="rounded-lg border border-brand/30 bg-brand/5 p-3">
          <div className="font-semibold mb-1">
            Tolking: {PRESET_LABELS.find((p) => p.id === preset)?.label}
          </div>
          <div className="text-muted-foreground">{note}</div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-1">
        <div className="font-semibold">Lese-koder for Q-Q-plot</div>
        <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
          <li>
            <strong>Punkter over linjen i høyre hale:</strong> dataene har
            tyngre høyre hale enn normalen (positiv skew eller tunge haler).
          </li>
          <li>
            <strong>S-form:</strong> tunge haler (begge endene utenfor linja
            i hver sin retning) eller lette haler (begge endene innenfor).
          </li>
          <li>
            <strong>Bend/krumning:</strong> skjevhet i fordelingen.
          </li>
          <li>
            <strong>Enkeltpunkt langt unna:</strong> outlier; sjekk om det er
            målefeil før du forkaster.
          </li>
        </ul>
      </div>
    </div>
  );
}
