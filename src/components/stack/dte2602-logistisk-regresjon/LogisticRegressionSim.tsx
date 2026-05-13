import { useEffect, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ---------- data-generator ----------
function gauss(mu: number, sigma: number) {
  const u1 = Math.max(1e-9, Math.random());
  const u2 = Math.random();
  return mu + sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

type Point = { x1: number; x2: number; y: 0 | 1 };

function generateData(n = 80, overlap = 1.0, seedSalt = 0): Point[] {
  // seedSalt brukes bare for å trigge regenerate
  void seedSalt;
  const out: Point[] = [];
  const sd = 1.0 * overlap;
  for (let i = 0; i < n / 2; i++) {
    out.push({ x1: gauss(-1.5, sd), x2: gauss(-1.0, sd), y: 0 });
  }
  for (let i = 0; i < n / 2; i++) {
    out.push({ x1: gauss(1.5, sd), x2: gauss(1.0, sd), y: 1 });
  }
  return out;
}

// ---------- modell ----------
function sigmoid(z: number): number {
  if (z >= 0) {
    const e = Math.exp(-z);
    return 1 / (1 + e);
  }
  const e = Math.exp(z);
  return e / (1 + e);
}

type Theta = { b: number; w1: number; w2: number };

function predictProb(t: Theta, x1: number, x2: number): number {
  return sigmoid(t.b + t.w1 * x1 + t.w2 * x2);
}

function logLoss(t: Theta, data: Point[], lambda: number): number {
  let loss = 0;
  for (const p of data) {
    const z = t.b + t.w1 * p.x1 + t.w2 * p.x2;
    // numerisk stabil cross-entropy
    let term: number;
    if (z >= 0) term = Math.log(1 + Math.exp(-z)) + (1 - p.y) * z;
    else term = Math.log(1 + Math.exp(z)) - p.y * z;
    loss += term;
  }
  loss /= data.length;
  // L2-reg (gjelder ikke bias)
  loss += (lambda / 2) * (t.w1 * t.w1 + t.w2 * t.w2);
  return loss;
}

function gradStep(
  t: Theta,
  data: Point[],
  lr: number,
  lambda: number,
): Theta {
  let gb = 0;
  let gw1 = 0;
  let gw2 = 0;
  for (const p of data) {
    const yh = predictProb(t, p.x1, p.x2);
    const err = yh - p.y;
    gb += err;
    gw1 += err * p.x1;
    gw2 += err * p.x2;
  }
  const n = data.length;
  gb /= n;
  gw1 /= n;
  gw2 /= n;
  // L2 på vektene (ikke bias)
  gw1 += lambda * t.w1;
  gw2 += lambda * t.w2;
  return {
    b: t.b - lr * gb,
    w1: t.w1 - lr * gw1,
    w2: t.w2 - lr * gw2,
  };
}

// ---------- visual ----------
export function LogisticRegressionSim() {
  const [data, setData] = useState<Point[]>(() => generateData(80, 1.0, 0));
  const [overlap, setOverlap] = useState(1.0);
  const [lr, setLr] = useState(0.5);
  const [lambda, setLambda] = useState(0.0);
  const [theta, setTheta] = useState<Theta>({ b: 0, w1: 0.1, w2: 0.1 });
  const [history, setHistory] = useState<{ epoch: number; loss: number }[]>([
    { epoch: 0, loss: logLoss({ b: 0, w1: 0.1, w2: 0.1 }, data, 0) },
  ]);
  const [running, setRunning] = useState(false);
  const [seed, setSeed] = useState(0);
  const rafRef = useRef<number | null>(null);

  // Plot-konstanter
  const W = 420;
  const H = 320;
  const padL = 40;
  const padR = 10;
  const padT = 10;
  const padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const xMin = -5;
  const xMax = 5;
  const yMin = -4;
  const yMax = 4;
  const toPx = (x1: number, x2: number) => ({
    px: padL + ((x1 - xMin) / (xMax - xMin)) * plotW,
    py: padT + (1 - (x2 - yMin) / (yMax - yMin)) * plotH,
  });

  // Decision boundary: b + w1*x1 + w2*x2 = 0  ⇒  x2 = -(b + w1*x1)/w2
  const boundary = useMemo(() => {
    if (Math.abs(theta.w2) < 1e-6) return null;
    const xs = [xMin, xMax];
    const pts = xs.map((x1) => ({
      x1,
      x2: -(theta.b + theta.w1 * x1) / theta.w2,
    }));
    return pts;
  }, [theta]);

  // Train-loop med RAF (animasjon)
  useEffect(() => {
    if (!running) return;
    let alive = true;
    let cur = theta;
    let h = history;
    function tick() {
      if (!alive) return;
      // 1 epoch = 5 batch-iterations per frame for å gå raskere
      let next = cur;
      for (let i = 0; i < 5; i++) {
        next = gradStep(next, data, lr, lambda);
      }
      cur = next;
      const epoch = h.length;
      const loss = logLoss(next, data, lambda);
      h = [...h, { epoch, loss }];
      setTheta(next);
      setHistory(h);
      // stopp etter 300 epochs eller veldig liten endring
      if (h.length > 300 || (h.length > 5 && Math.abs(h[h.length - 1].loss - h[h.length - 2].loss) < 1e-7)) {
        setRunning(false);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      alive = false;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, data, lr, lambda]);

  function resetWeights() {
    setRunning(false);
    const init: Theta = { b: 0, w1: 0.1, w2: 0.1 };
    setTheta(init);
    setHistory([{ epoch: 0, loss: logLoss(init, data, lambda) }]);
  }

  function regenData() {
    setRunning(false);
    setSeed((s) => s + 1);
    const next = generateData(80, overlap, seed + 1);
    setData(next);
    const init: Theta = { b: 0, w1: 0.1, w2: 0.1 };
    setTheta(init);
    setHistory([{ epoch: 0, loss: logLoss(init, next, lambda) }]);
  }

  // Stats: accuracy
  const acc = useMemo(() => {
    let correct = 0;
    for (const p of data) {
      const yh = predictProb(theta, p.x1, p.x2) >= 0.5 ? 1 : 0;
      if (yh === p.y) correct++;
    }
    return correct / data.length;
  }, [theta, data]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold">
        Logistisk regresjon — live gradient descent
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full border border-border rounded bg-background">
            {/* aksesystem */}
            {[-4, -2, 0, 2, 4].map((g) => (
              <g key={`x${g}`}>
                <line
                  x1={toPx(g, yMin).px}
                  y1={padT}
                  x2={toPx(g, yMin).px}
                  y2={padT + plotH}
                  stroke="hsl(0 0% 92%)"
                  strokeWidth={0.5}
                />
                <text
                  x={toPx(g, yMin).px}
                  y={H - 6}
                  textAnchor="middle"
                  fontSize={9}
                  fill="hsl(0 0% 50%)"
                >
                  {g}
                </text>
              </g>
            ))}
            {[-3, 0, 3].map((g) => (
              <g key={`y${g}`}>
                <line
                  x1={padL}
                  y1={toPx(xMin, g).py}
                  x2={padL + plotW}
                  y2={toPx(xMin, g).py}
                  stroke="hsl(0 0% 92%)"
                  strokeWidth={0.5}
                />
                <text
                  x={padL - 4}
                  y={toPx(xMin, g).py + 3}
                  textAnchor="end"
                  fontSize={9}
                  fill="hsl(0 0% 50%)"
                >
                  {g}
                </text>
              </g>
            ))}

            {/* sannsynlighetsbakgrunn (forenklet: fyll skyggelegging) */}
            {boundary && (
              <line
                x1={toPx(boundary[0].x1, boundary[0].x2).px}
                y1={toPx(boundary[0].x1, boundary[0].x2).py}
                x2={toPx(boundary[1].x1, boundary[1].x2).px}
                y2={toPx(boundary[1].x1, boundary[1].x2).py}
                stroke="hsl(280 60% 50%)"
                strokeWidth={2}
              />
            )}

            {data.map((p, i) => {
              const { px, py } = toPx(p.x1, p.x2);
              return (
                <circle
                  key={i}
                  cx={px}
                  cy={py}
                  r={3.5}
                  fill={p.y === 1 ? "hsl(220 70% 55%)" : "hsl(0 70% 55%)"}
                  fillOpacity={0.65}
                  stroke="white"
                  strokeWidth={0.7}
                />
              );
            })}
          </svg>
          <div className="mt-1 text-xs text-muted-foreground flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-[hsl(0_70%_55%)]" />
              y = 0
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-[hsl(220_70%_55%)]" />
              y = 1
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-0.5 w-4 bg-[hsl(280_60%_50%)]" />
              decision boundary
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 6 }}>
              <CartesianGrid stroke="hsl(0 0% 92%)" strokeDasharray="3 3" />
              <XAxis
                dataKey="epoch"
                tick={{ fontSize: 10, fill: "hsl(0 0% 50%)" }}
                label={{ value: "epoch", position: "insideBottom", offset: -3, fontSize: 10 }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(0 0% 50%)" }}
                width={48}
              />
              <Tooltip
                contentStyle={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(0 0% 90%)", fontSize: 11 }}
                formatter={(v: number) => v.toFixed(4)}
              />
              <Line
                type="monotone"
                dataKey="loss"
                stroke="hsl(220 70% 50%)"
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="rounded-lg border border-border bg-background p-3 text-xs font-mono space-y-0.5">
            <div>epoch: {history.length - 1}</div>
            <div>loss: {history[history.length - 1].loss.toFixed(4)}</div>
            <div>accuracy: {(acc * 100).toFixed(1)} %</div>
            <div>b = {theta.b.toFixed(3)}, w₁ = {theta.w1.toFixed(3)}, w₂ = {theta.w2.toFixed(3)}</div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <label className="text-sm block">
          <span className="block text-xs text-muted-foreground mb-1">
            lærings-rate η = {lr.toFixed(2)}
          </span>
          <input
            type="range"
            min={0.05}
            max={2.0}
            step={0.05}
            value={lr}
            onChange={(e) => setLr(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="text-sm block">
          <span className="block text-xs text-muted-foreground mb-1">
            L2-reg λ = {lambda.toFixed(3)}
          </span>
          <input
            type="range"
            min={0}
            max={0.5}
            step={0.005}
            value={lambda}
            onChange={(e) => setLambda(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="text-sm block">
          <span className="block text-xs text-muted-foreground mb-1">
            overlap (klasse-spredning) = {overlap.toFixed(2)}
          </span>
          <input
            type="range"
            min={0.4}
            max={2.5}
            step={0.05}
            value={overlap}
            onChange={(e) => setOverlap(Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          className={
            "rounded px-3 py-1.5 text-xs font-semibold " +
            (running
              ? "bg-rose-500 text-white hover:bg-rose-600"
              : "bg-brand text-white hover:opacity-90")
          }
        >
          {running ? "Stopp trening" : "Start trening"}
        </button>
        <button
          onClick={() => setTheta((t) => gradStep(t, data, lr, lambda))}
          className="rounded border border-border bg-background px-3 py-1.5 text-xs hover:border-brand/40"
          disabled={running}
        >
          1 gradient-steg
        </button>
        <button
          onClick={resetWeights}
          className="rounded border border-border bg-background px-3 py-1.5 text-xs hover:border-brand/40"
        >
          Reset vekter
        </button>
        <button
          onClick={regenData}
          className="rounded border border-border bg-background px-3 py-1.5 text-xs hover:border-brand/40"
        >
          Trekk nye data
        </button>
      </div>
    </div>
  );
}

// ---------- 1D sigmoid-visualisering ----------
export function SigmoidVisual() {
  const [w, setW] = useState(1);
  const [b, setB] = useState(0);

  const data = useMemo(() => {
    const out: { x: number; sigma: number }[] = [];
    for (let i = -60; i <= 60; i++) {
      const x = i / 10;
      out.push({ x, sigma: sigmoid(w * x + b) });
    }
    return out;
  }, [w, b]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold">
        Sigmoid: <span className="font-mono">σ(w·x + b)</span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 6, right: 10, left: 0, bottom: 4 }}>
          <CartesianGrid stroke="hsl(0 0% 92%)" strokeDasharray="3 3" />
          <XAxis dataKey="x" tick={{ fontSize: 10, fill: "hsl(0 0% 50%)" }} />
          <YAxis
            domain={[0, 1]}
            tick={{ fontSize: 10, fill: "hsl(0 0% 50%)" }}
            width={36}
          />
          <Tooltip
            contentStyle={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(0 0% 90%)", fontSize: 11 }}
            formatter={(v: number) => v.toFixed(3)}
            labelFormatter={(l) => `x = ${l}`}
          />
          <Line type="monotone" dataKey="sigma" stroke="hsl(140 60% 45%)" dot={false} strokeWidth={2} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-sm block">
          <span className="block text-xs text-muted-foreground mb-1">
            w = {w.toFixed(2)} (helling)
          </span>
          <input
            type="range"
            min={-4}
            max={4}
            step={0.1}
            value={w}
            onChange={(e) => setW(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="text-sm block">
          <span className="block text-xs text-muted-foreground mb-1">
            b = {b.toFixed(2)} (skift)
          </span>
          <input
            type="range"
            min={-4}
            max={4}
            step={0.1}
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">
        Vipp w til negativ — kurven flippes. Endre b — kurven flytter
        horisontalt. Stor |w| ⇒ skarpere overgang (strenger klassifisering).
      </p>
    </div>
  );
}
