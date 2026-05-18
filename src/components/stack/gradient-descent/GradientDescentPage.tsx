import { useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

type Variant = "gd" | "momentum" | "sgd";

// Loss surface: f(x) = 0.5*x^2 + sin(2x) (non-convex, gir lokalt min rundt -2.3)
function f(x: number): number {
  return 0.5 * x * x + Math.sin(2 * x);
}
function df(x: number): number {
  return x + 2 * Math.cos(2 * x);
}
// Stokastisk støy: kun for SGD-modus
function dfStochastic(x: number, noise: number): number {
  return df(x) + (Math.random() * 2 - 1) * noise;
}

export function GradientDescentPage() {
  const [x, setX] = useState(2.8);
  const [lr, setLr] = useState(0.1);
  const [variant, setVariant] = useState<Variant>("gd");
  const [momentum, setMomentum] = useState(0.9);
  const [running, setRunning] = useState(false);
  const [trace, setTrace] = useState<number[]>([2.8]);
  const velocityRef = useRef(0);

  // Animasjons-loop. Bruker ref for å unngå stale closure.
  const stateRef = useRef({ x, lr, variant, momentum });
  useEffect(() => {
    stateRef.current = { x, lr, variant, momentum };
  }, [x, lr, variant, momentum]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const s = stateRef.current;
      const grad =
        s.variant === "sgd" ? dfStochastic(s.x, 1.2) : df(s.x);
      let nextX: number;
      if (s.variant === "momentum") {
        velocityRef.current = s.momentum * velocityRef.current - s.lr * grad;
        nextX = s.x + velocityRef.current;
      } else {
        nextX = s.x - s.lr * grad;
      }
      nextX = Math.max(-5, Math.min(5, nextX));
      setX(nextX);
      setTrace((t) => [...t.slice(-200), nextX]);
    }, 80);
    return () => clearInterval(id);
  }, [running]);

  function reset(toX = 2.8) {
    setRunning(false);
    setX(toX);
    velocityRef.current = 0;
    setTrace([toX]);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Gradient descent — interaktiv
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Ett parameter, ikke-konveks tap. Velg startpunkt, lærerate og
            variant — se forskjellen mellom vanlig GD, momentum og SGD.
          </p>
        </header>

        <LossPlot x={x} trace={trace} onPick={(nx) => reset(nx)} />

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat label="x" value={x.toFixed(3)} />
          <Stat label="L(x)" value={f(x).toFixed(3)} />
          <Stat label="∇L" value={df(x).toFixed(3)} />
        </div>

        <div className="mt-5 rounded-xl border border-border bg-card p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <VariantTab id="gd" current={variant} onChange={setVariant}>
              Vanlig GD
            </VariantTab>
            <VariantTab id="momentum" current={variant} onChange={setVariant}>
              Momentum
            </VariantTab>
            <VariantTab id="sgd" current={variant} onChange={setVariant}>
              SGD (støy)
            </VariantTab>
          </div>

          <Slider
            label="Lærerate (lr)"
            min={0.005}
            max={0.5}
            step={0.005}
            value={lr}
            onChange={setLr}
            format={(v) => v.toFixed(3)}
          />
          {variant === "momentum" && (
            <Slider
              label="Momentum β"
              min={0}
              max={0.99}
              step={0.01}
              value={momentum}
              onChange={setMomentum}
              format={(v) => v.toFixed(2)}
            />
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              size="sm"
              onClick={() => setRunning((r) => !r)}
              className="gap-1.5"
            >
              {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {running ? "Pause" : "Kjør"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => reset(2.8)} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              Nullstill
            </Button>
            <span className="text-xs text-muted-foreground ml-auto">
              Klikk på kurven for å sette start-x
            </span>
          </div>
        </div>

        <Lessons />
      </main>
    </div>
  );
}

function LossPlot({
  x,
  trace,
  onPick,
}: {
  x: number;
  trace: number[];
  onPick: (x: number) => void;
}) {
  const W = 760;
  const H = 280;
  const xMin = -5;
  const xMax = 5;
  const samples = useMemo(() => {
    const out: { sx: number; sy: number; ly: number }[] = [];
    for (let i = 0; i <= 200; i++) {
      const sx = xMin + (i / 200) * (xMax - xMin);
      out.push({ sx, sy: 0, ly: f(sx) });
    }
    return out;
  }, []);
  const yMin = Math.min(...samples.map((s) => s.ly)) - 0.5;
  const yMax = Math.max(...samples.map((s) => s.ly)) + 0.5;
  const sx = (v: number) => ((v - xMin) / (xMax - xMin)) * W;
  const sy = (v: number) => H - ((v - yMin) / (yMax - yMin)) * H;
  const path = samples
    .map((s, i) => `${i === 0 ? "M" : "L"} ${sx(s.sx).toFixed(1)} ${sy(s.ly).toFixed(1)}`)
    .join(" ");

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto cursor-crosshair"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * W;
          onPick(xMin + (px / W) * (xMax - xMin));
        }}
      >
        <path d={path} fill="none" stroke="currentColor" className="text-muted-foreground/40" strokeWidth={1.5} />
        {/* trace */}
        {trace.length > 1 && (
          <polyline
            points={trace.map((tx) => `${sx(tx)},${sy(f(tx))}`).join(" ")}
            fill="none"
            stroke="currentColor"
            className="text-brand/50"
            strokeWidth={1.5}
          />
        )}
        {/* current */}
        <circle cx={sx(x)} cy={sy(f(x))} r={6} className="fill-brand" />
        <line x1={sx(x)} y1={0} x2={sx(x)} y2={H} stroke="currentColor" className="text-brand/20" strokeDasharray="3 3" />
      </svg>
    </div>
  );
}

function VariantTab({
  id,
  current,
  onChange,
  children,
}: {
  id: Variant;
  current: Variant;
  onChange: (v: Variant) => void;
  children: React.ReactNode;
}) {
  const active = id === current;
  return (
    <button
      onClick={() => onChange(id)}
      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-brand text-brand-foreground"
          : "bg-muted text-foreground hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  format,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <label className="block space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono tabular-nums">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-base font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Lessons() {
  return (
    <section className="mt-8 space-y-3 text-sm">
      <h2 className="text-lg font-semibold">Hva du ser etter</h2>
      <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
        <li>
          <strong className="text-foreground">Stor lr</strong> → hopper over
          minimum, kan eksplodere. <strong className="text-foreground">Liten lr</strong>{" "}
          → konvergerer trygt, men sakte.
        </li>
        <li>
          <strong className="text-foreground">Momentum</strong> akkumulerer
          fart i konsistent retning — krysser flate platåer raskere og
          demper svingninger.
        </li>
        <li>
          <strong className="text-foreground">SGD</strong> har støy i
          gradienten. Det hjelper å unnslippe lokale minima, men kan hindre
          konvergens nær bunnen.
        </li>
        <li>
          Tapet har et globalt min rundt x ≈ -2.3 og et lokalt min rundt x ≈
          0.5. Start til høyre med liten lr → ender i lokalt min. Bruk
          momentum eller SGD-støy for å hoppe ut.
        </li>
      </ul>
    </section>
  );
}
