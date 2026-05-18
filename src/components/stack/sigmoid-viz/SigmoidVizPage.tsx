import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}
function dsigmoid(x: number): number {
  const s = sigmoid(x);
  return s * (1 - s);
}

export function SigmoidVizPage() {
  const [w, setW] = useState(1);
  const [b, setB] = useState(0);
  const [x0, setX0] = useState(2);

  const z0 = w * x0 + b;
  const y0 = sigmoid(z0);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Sigmoid — σ(wx + b)
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Logistisk regresjon trenger en glatt aktivering som mapper hva
            som helst til (0, 1). Sigmoid gjør jobben. Dra slidere for å se
            hvordan w og b styrer kurva.
          </p>
        </header>

        <SigmoidPlot w={w} b={b} x0={x0} z0={z0} y0={y0} />

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat label="z = wx+b" value={z0.toFixed(3)} />
          <Stat label="σ(z)" value={y0.toFixed(3)} />
          <Stat label="σ'(z)" value={dsigmoid(z0).toFixed(3)} />
        </div>

        <div className="mt-5 rounded-xl border border-border bg-card p-4 space-y-4">
          <Slider label="w (helning)" min={-5} max={5} step={0.1} value={w} onChange={setW} />
          <Slider label="b (bias)" min={-5} max={5} step={0.1} value={b} onChange={setB} />
          <Slider label="x (testpunkt)" min={-6} max={6} step={0.1} value={x0} onChange={setX0} />
        </div>

        <DerivativePlot w={w} b={b} />

        <Lessons w={w} b={b} />
      </main>
    </div>
  );
}

function SigmoidPlot({
  w,
  b,
  x0,
  z0,
  y0,
}: {
  w: number;
  b: number;
  x0: number;
  z0: number;
  y0: number;
}) {
  const W = 760;
  const H = 280;
  const xMin = -6;
  const xMax = 6;
  const sx = (v: number) => ((v - xMin) / (xMax - xMin)) * W;
  const sy = (v: number) => H - v * H;
  const path = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 240; i++) {
      const x = xMin + (i / 240) * (xMax - xMin);
      const y = sigmoid(w * x + b);
      pts.push(`${i === 0 ? "M" : "L"} ${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`);
    }
    return pts.join(" ");
  }, [w, b]);

  const boundaryX = w === 0 ? null : -b / w;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* gridlines: 0, 0.5, 1 */}
        <line x1={0} x2={W} y1={sy(0)} y2={sy(0)} stroke="currentColor" className="text-muted-foreground/20" />
        <line x1={0} x2={W} y1={sy(0.5)} y2={sy(0.5)} stroke="currentColor" className="text-muted-foreground/30" strokeDasharray="4 4" />
        <line x1={0} x2={W} y1={sy(1)} y2={sy(1)} stroke="currentColor" className="text-muted-foreground/20" />
        <line x1={sx(0)} x2={sx(0)} y1={0} y2={H} stroke="currentColor" className="text-muted-foreground/20" />

        {boundaryX !== null && boundaryX >= xMin && boundaryX <= xMax && (
          <line
            x1={sx(boundaryX)}
            x2={sx(boundaryX)}
            y1={0}
            y2={H}
            stroke="currentColor"
            className="text-amber-500/60"
            strokeDasharray="6 4"
          />
        )}

        <path d={path} fill="none" stroke="currentColor" className="text-brand" strokeWidth={2.5} />

        <line x1={sx(x0)} x2={sx(x0)} y1={sy(y0)} y2={H} stroke="currentColor" className="text-brand/40" strokeDasharray="3 3" />
        <line x1={0} x2={sx(x0)} y1={sy(y0)} y2={sy(y0)} stroke="currentColor" className="text-brand/40" strokeDasharray="3 3" />
        <circle cx={sx(x0)} cy={sy(y0)} r={6} className="fill-brand" />

        <text x={W - 10} y={sy(1) - 4} textAnchor="end" className="fill-muted-foreground text-[10px]">1.0</text>
        <text x={W - 10} y={sy(0.5) - 4} textAnchor="end" className="fill-muted-foreground text-[10px]">0.5 (beslutningsgrense)</text>
        <text x={W - 10} y={sy(0) - 4} textAnchor="end" className="fill-muted-foreground text-[10px]">0.0</text>
      </svg>
    </div>
  );
}

function DerivativePlot({ w, b }: { w: number; b: number }) {
  const W = 760;
  const H = 140;
  const xMin = -6;
  const xMax = 6;
  const sx = (v: number) => ((v - xMin) / (xMax - xMin)) * W;
  const sy = (v: number) => H - (v / 0.25) * (H * 0.85) - 8;
  const path = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 240; i++) {
      const x = xMin + (i / 240) * (xMax - xMin);
      const y = dsigmoid(w * x + b) * Math.abs(w);
      pts.push(`${i === 0 ? "M" : "L"} ${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`);
    }
    return pts.join(" ");
  }, [w, b]);

  return (
    <div className="mt-4 rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 pt-3 pb-1 text-xs text-muted-foreground">
        Derivasjon w·σ'(wx+b) — hvor "skarp" gradienten er.
        Verdier nær 0 = forsvinnende gradient.
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <path d={path} fill="none" stroke="currentColor" className="text-violet-500" strokeWidth={2} />
      </svg>
    </div>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono tabular-nums">{value.toFixed(2)}</span>
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

function Lessons({ w, b }: { w: number; b: number }) {
  const boundary = w === 0 ? null : -b / w;
  return (
    <section className="mt-8 space-y-3 text-sm">
      <h2 className="text-lg font-semibold">Hva du ser etter</h2>
      <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
        <li>
          <strong className="text-foreground">Stor |w|</strong> → bratt
          overgang. Negativ w speilvender kurva (mapping flippes).
        </li>
        <li>
          <strong className="text-foreground">b skifter</strong>{" "}
          beslutningsgrensa langs x-aksen. Grensa der σ = 0.5 ligger på{" "}
          <code className="font-mono">x = -b/w</code>
          {boundary !== null && (
            <span>
              {" "}
              = <strong className="text-foreground">{boundary.toFixed(2)}</strong>
            </span>
          )}.
        </li>
        <li>
          Derivasjonen σ'(z) = σ(z)(1-σ(z)) maks 0.25 i origo, og dør i
          halene. Dette er <strong className="text-foreground">vanishing gradient</strong>{" "}
          — store nett med sigmoid-aktivering lærer sakte i dype lag.
        </li>
        <li>
          I logistisk regresjon: σ tolkes som P(y=1|x). Log-loss straffer
          selvsikkert feil-prediksjoner kraftig.
        </li>
      </ul>
    </section>
  );
}
