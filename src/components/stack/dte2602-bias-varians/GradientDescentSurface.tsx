import { useEffect, useMemo, useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TexBlock } from "@/components/Tex";

/**
 * Gradient descent på en elliptisk loss-flate.
 *
 *   L(w1, w2) = (w1 - a)^2 + 5*(w2 - b)^2
 *
 * Brukeren ser konturlinjer + en "kule" som triller mot minimum. De kan:
 *   - klikke i flata for å sette startpunkt
 *   - skru læringsraten η (for høy → divergens, for lav → krypende)
 *   - skru momentum (0 → ren GD, høyere → bedre å gå gjennom dalen)
 *   - stegge ett kvant av gangen, eller animere
 *
 * Recharts viser loss over iterasjoner ved siden av.
 */

const A = 1.6; // target w1
const B = 0.0; // target w2
const W_MIN = -2.5;
const W_MAX = 3.5;
const W2_MIN = -1.6;
const W2_MAX = 1.6;

function loss(w1: number, w2: number): number {
  return (w1 - A) ** 2 + 5 * (w2 - B) ** 2;
}

function grad(w1: number, w2: number): [number, number] {
  return [2 * (w1 - A), 10 * (w2 - B)];
}

type Step = { w1: number; w2: number; loss: number; iter: number };

export function GradientDescentSurface() {
  const [eta, setEta] = useState(0.08);
  const [momentum, setMomentum] = useState(0);
  const [start, setStart] = useState<[number, number]>([-1.8, 1.3]);
  const [history, setHistory] = useState<Step[]>([{ w1: -1.8, w2: 1.3, loss: loss(-1.8, 1.3), iter: 0 }]);
  const [velocity, setVelocity] = useState<[number, number]>([0, 0]);
  const [running, setRunning] = useState(false);
  const rafRef = useRef<number | null>(null);

  // Reset when start, eta or momentum changes drastically: only reset trajectory, keep slider state.
  function reset(newStart?: [number, number]) {
    const s = newStart ?? start;
    setHistory([{ w1: s[0], w2: s[1], loss: loss(s[0], s[1]), iter: 0 }]);
    setVelocity([0, 0]);
    setRunning(false);
  }

  function step() {
    setHistory((prev) => {
      const last = prev[prev.length - 1];
      const [gx, gy] = grad(last.w1, last.w2);
      const [vx, vy] = velocity;
      const nvx = momentum * vx - eta * gx;
      const nvy = momentum * vy - eta * gy;
      const nw1 = last.w1 + nvx;
      const nw2 = last.w2 + nvy;
      setVelocity([nvx, nvy]);
      const nLoss = loss(nw1, nw2);
      // Stop runaway: clamp visualization (but keep loss honest, even if huge)
      const cw1 = Math.max(W_MIN - 1.5, Math.min(W_MAX + 1.5, nw1));
      const cw2 = Math.max(W2_MIN - 1.0, Math.min(W2_MAX + 1.0, nw2));
      const next: Step = { w1: cw1, w2: cw2, loss: nLoss, iter: last.iter + 1 };
      if (prev.length > 250) return [...prev.slice(-200), next];
      return [...prev, next];
    });
  }

  // requestAnimationFrame loop
  useEffect(() => {
    if (!running) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    let frame = 0;
    const tick = () => {
      frame++;
      // Slow it down a hair so the user can see motion
      if (frame % 3 === 0) step();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, eta, momentum]);

  // SVG plot
  const W = 420;
  const H = 260;
  const PAD = 30;
  const sx = (w1: number) => PAD + ((w1 - W_MIN) / (W_MAX - W_MIN)) * (W - 2 * PAD);
  const sy = (w2: number) => H - PAD - ((w2 - W2_MIN) / (W2_MAX - W2_MIN)) * (H - 2 * PAD);
  const inv = (px: number, py: number): [number, number] => [
    W_MIN + ((px - PAD) / (W - 2 * PAD)) * (W_MAX - W_MIN),
    W2_MIN + ((H - PAD - py) / (H - 2 * PAD)) * (W2_MAX - W2_MIN),
  ];

  // Pre-compute contour levels (elliptical, so they are straightforward conic-section sections)
  const contourLevels = useMemo(() => [0.2, 0.6, 1.5, 3, 6, 10, 18, 30], []);

  const svgRef = useRef<SVGSVGElement | null>(null);
  function onSurfaceClick(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    const [w1, w2] = inv(px, py);
    const clamped: [number, number] = [
      Math.max(W_MIN, Math.min(W_MAX, w1)),
      Math.max(W2_MIN, Math.min(W2_MAX, w2)),
    ];
    setStart(clamped);
    reset(clamped);
  }

  const last = history[history.length - 1];
  const diverged = last.loss > 500 || !Number.isFinite(last.loss);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <label className="block text-xs text-muted-foreground">
          <div className="flex justify-between mb-1">
            <span>Læringsrate η</span>
            <span className="font-mono text-foreground">{eta.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min={0.005}
            max={0.22}
            step={0.005}
            value={eta}
            onChange={(e) => setEta(parseFloat(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          <div className="flex justify-between mb-1">
            <span>Momentum</span>
            <span className="font-mono text-foreground">{momentum.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={0.95}
            step={0.05}
            value={momentum}
            onChange={(e) => setMomentum(parseFloat(e.target.value))}
            className="w-full"
          />
        </label>
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => step()}
            className="text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted"
          >
            Step
          </button>
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="text-xs rounded-md border border-brand bg-brand/10 px-3 py-1.5 hover:bg-brand/20"
          >
            {running ? "Pause" : "Run"}
          </button>
          <button
            type="button"
            onClick={() => reset()}
            className="text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Contour + trajectory */}
        <div>
          <div className="text-xs text-muted-foreground mb-1.5">
            Klikk i flata for å sette startpunkt. Stjerne = minimum.
          </div>
          <div className="overflow-x-auto">
            <svg
              ref={svgRef}
              width={W}
              height={H}
              viewBox={`0 0 ${W} ${H}`}
              className="block w-full max-w-full cursor-crosshair"
              onClick={onSurfaceClick}
            >
              {/* Background gradient field — use elliptical contours */}
              {contourLevels.map((level, idx) => {
                // x-radius and y-radius in screen px
                const rx = Math.sqrt(level) * ((W - 2 * PAD) / (W_MAX - W_MIN));
                const ry = Math.sqrt(level / 5) * ((H - 2 * PAD) / (W2_MAX - W2_MIN));
                const cxp = sx(A);
                const cyp = sy(B);
                const alpha = 0.06 + idx * 0.04;
                return (
                  <g key={level}>
                    <ellipse
                      cx={cxp}
                      cy={cyp}
                      rx={rx}
                      ry={ry}
                      fill="currentColor"
                      className="text-sky-500"
                      opacity={alpha * 0.4}
                    />
                    <ellipse
                      cx={cxp}
                      cy={cyp}
                      rx={rx}
                      ry={ry}
                      fill="none"
                      stroke="currentColor"
                      className="text-sky-500"
                      strokeWidth={0.8}
                      opacity={0.55}
                    />
                  </g>
                );
              })}

              {/* Axes */}
              <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="currentColor" className="text-muted-foreground" opacity={0.4} />
              <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="currentColor" className="text-muted-foreground" opacity={0.4} />
              <text x={W - PAD - 6} y={H - PAD + 14} textAnchor="end" fontSize={10} fill="currentColor" className="text-muted-foreground">
                w₁
              </text>
              <text x={PAD - 6} y={PAD + 8} textAnchor="end" fontSize={10} fill="currentColor" className="text-muted-foreground">
                w₂
              </text>

              {/* Optimum */}
              <g transform={`translate(${sx(A)}, ${sy(B)})`}>
                <path d="M 0 -8 L 2 -2 L 8 -2 L 3 2 L 5 8 L 0 4 L -5 8 L -3 2 L -8 -2 L -2 -2 Z" fill="currentColor" className="text-amber-400" />
              </g>

              {/* Trajectory path */}
              {history.length > 1 && (
                <path
                  d={history
                    .map((s, i) => `${i === 0 ? "M" : "L"} ${sx(s.w1)} ${sy(s.w2)}`)
                    .join(" ")}
                  fill="none"
                  stroke="currentColor"
                  className="text-rose-500"
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                  opacity={0.85}
                />
              )}
              {history.map((s, i) => (
                <circle
                  key={i}
                  cx={sx(s.w1)}
                  cy={sy(s.w2)}
                  r={i === history.length - 1 ? 5 : 2}
                  fill="currentColor"
                  className={i === history.length - 1 ? "text-rose-500" : "text-rose-400"}
                  opacity={i === history.length - 1 ? 1 : 0.6}
                />
              ))}
            </svg>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-md border border-border p-2">
              <div className="text-muted-foreground">Iterasjon</div>
              <div className="font-mono text-foreground">{last.iter}</div>
            </div>
            <div className="rounded-md border border-border p-2">
              <div className="text-muted-foreground">w₁, w₂</div>
              <div className="font-mono text-foreground">{last.w1.toFixed(2)}, {last.w2.toFixed(2)}</div>
            </div>
            <div className="rounded-md border border-border p-2">
              <div className="text-muted-foreground">Loss</div>
              <div className="font-mono text-foreground">
                {diverged ? "∞ (divergent!)" : last.loss.toFixed(3)}
              </div>
            </div>
          </div>
        </div>

        {/* Loss curve */}
        <div>
          <div className="text-xs text-muted-foreground mb-1.5">Loss over iterasjoner</div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history.slice(-120)}>
                <CartesianGrid stroke="currentColor" strokeOpacity={0.1} strokeDasharray="3 3" />
                <XAxis dataKey="iter" tick={{ fontSize: 10 }} stroke="currentColor" strokeOpacity={0.5} />
                <YAxis tick={{ fontSize: 10 }} stroke="currentColor" strokeOpacity={0.5} domain={[0, "auto"]} />
                <Tooltip
                  contentStyle={{
                    fontSize: 11,
                    background: "var(--card, #fff)",
                    border: "1px solid var(--border, #ccc)",
                    borderRadius: 6,
                  }}
                  formatter={(v: number) => v.toFixed(3)}
                />
                <Line type="monotone" dataKey="loss" stroke="#f43f5e" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <TexBlock>{"w \\leftarrow w - \\eta\\, \\nabla L(w)"}</TexBlock>
          <p className="text-xs text-muted-foreground mt-1">
            Med momentum: <span className="font-mono">v ← βv − η∇L</span>, deretter{" "}
            <span className="font-mono">w ← w + v</span>.
          </p>
        </div>
      </div>

      <div className="mt-4 grid sm:grid-cols-3 gap-2 text-xs">
        <div className="rounded-md border border-border p-2.5">
          <div className="font-semibold text-amber-500 mb-0.5">η for liten</div>
          <div className="text-muted-foreground">Steget er knøttlite — modellen kryper, kan trenge tusenvis av iterasjoner.</div>
        </div>
        <div className="rounded-md border border-border p-2.5">
          <div className="font-semibold text-emerald-500 mb-0.5">η passe</div>
          <div className="text-muted-foreground">Glir jevnt ned i dalen og lander nær minimum.</div>
        </div>
        <div className="rounded-md border border-border p-2.5">
          <div className="font-semibold text-rose-500 mb-0.5">η for stor</div>
          <div className="text-muted-foreground">Spretter ut av dalen, loss eksploderer — divergens. Sett momentum=0 og dra η-slider opp for å se.</div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        <strong>Hvorfor er elliptiske konturer vanskelige?</strong> Loss-flata her er 5× brattere i w₂ enn i w₁.
        Uten momentum vil GD zigzagge på tvers av den smale aksen. Skru opp momentum og se hvordan banen blir glattere.
      </p>
    </div>
  );
}
