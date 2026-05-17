import { useMemo, useState } from "react";

// --------------------------------------------------------------------------
// BiasVarianceTradeoffPlot — modell-kompleksitet på x, error på y.
// To kurver: train_error (faller monotont) og test_error (U-formet).
// Studenten drar en "valgt-kompleksitet"-vertikal-linje og ser bias-, varians-
// og irreducible-bidragene som stablede segmenter.
//
// Modus-toggles: liten / middels / stor datasett-størrelse. Større N flater
// ut overfit-halen på test-kurven, slik at bias-variance-balansepunktet
// flytter seg til høyere kompleksitet.
// --------------------------------------------------------------------------

type DataSize = "lite" | "middels" | "stort";

// Antall sample-punkter langs kompleksitets-aksen.
const N = 60;
const COMPLEXITY_MAX = 10; // 1..10
const W = 560;
const H = 220;
const PAD_L = 38;
const PAD_R = 12;
const PAD_T = 14;
const PAD_B = 28;

// Modeller. NB! Vi simulerer pedagogisk korrekte kurver, ikke ekte trening.
//   bias² faller med kompleksitet (mer fleksibel modell ⇒ mindre systematisk feil)
//   variance vokser med kompleksitet (modellen følger støy)
//   irreducible er konstant
// train_error = bias² · 0.6 (modellen tilpasser data den ser ⇒ lavere enn test)
// test_error  = bias² + variance + irreducible
function curves(size: DataSize) {
  // Hvor fort variansen vokser avhenger av N.
  const varScale = size === "stort" ? 0.012 : size === "middels" ? 0.025 : 0.05;
  const irreducible = 0.08;
  const bias = (c: number) => 0.7 / (c + 0.2); // 1..10 → ~0.58 → 0.07
  const variance = (c: number) => varScale * Math.pow(c, 1.6);
  const train = (c: number) => Math.max(0.005, bias(c) * 0.55 + 0.01);
  const test = (c: number) => bias(c) + variance(c) + irreducible;
  const points: Array<{ c: number; train: number; test: number; bias: number; variance: number; irreducible: number }> = [];
  for (let i = 0; i < N; i++) {
    const c = 1 + (i / (N - 1)) * (COMPLEXITY_MAX - 1);
    points.push({
      c,
      train: train(c),
      test: test(c),
      bias: bias(c),
      variance: variance(c),
      irreducible,
    });
  }
  return points;
}

export function BiasVarianceTradeoffPlot() {
  const [size, setSize] = useState<DataSize>("middels");
  const [selected, setSelected] = useState(5);

  const pts = useMemo(() => curves(size), [size]);

  // Beste kompleksitet = argmin(test_error)
  const bestIdx = useMemo(() => {
    let best = 0;
    for (let i = 1; i < pts.length; i++) if (pts[i].test < pts[best].test) best = i;
    return best;
  }, [pts]);
  const bestC = pts[bestIdx].c;

  const yMax = 1.4;
  const x = (c: number) => PAD_L + ((c - 1) / (COMPLEXITY_MAX - 1)) * (W - PAD_L - PAD_R);
  const y = (v: number) => PAD_T + (1 - Math.min(1, v / yMax)) * (H - PAD_T - PAD_B);

  const pathOf = (key: "train" | "test") => {
    let d = `M ${x(pts[0].c)} ${y(pts[0][key])}`;
    for (let i = 1; i < pts.length; i++) d += ` L ${x(pts[i].c)} ${y(pts[i][key])}`;
    return d;
  };

  // Plukk punkt nærmest valgt kompleksitet.
  const selPt = useMemo(() => {
    let best = pts[0];
    for (const p of pts) if (Math.abs(p.c - selected) < Math.abs(best.c - selected)) best = p;
    return best;
  }, [pts, selected]);

  const regime: "underfit" | "balansert" | "overfit" = (() => {
    if (selPt.c < bestC - 1) return "underfit";
    if (selPt.c > bestC + 1) return "overfit";
    return "balansert";
  })();

  const onPlotMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const setFromEvent = (clientX: number) => {
      const rect = svg.getBoundingClientRect();
      const sx = clientX - rect.left;
      const frac = (sx - PAD_L) / (W - PAD_L - PAD_R);
      const c = 1 + Math.max(0, Math.min(1, frac)) * (COMPLEXITY_MAX - 1);
      setSelected(c);
    };
    setFromEvent(e.clientX);
    const move = (ev: MouseEvent) => setFromEvent(ev.clientX);
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
        <span className="text-muted-foreground">Datasett-størrelse:</span>
        {(["lite", "middels", "stort"] as DataSize[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSize(s)}
            className={`px-2 py-1 rounded border ${
              size === s
                ? "border-brand bg-brand/10 text-brand"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSelected(bestC)}
          className="ml-auto px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground"
        >
          Hopp til optimum
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="text-xs text-muted-foreground mb-1">
            Modell-kompleksitet (x) vs error (y) — dra på plottet for å velge kompleksitet
          </div>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full select-none cursor-ew-resize"
            onMouseDown={onPlotMouseDown}
          >
            {/* akser */}
            <line x1={PAD_L} y1={H - PAD_B} x2={W - PAD_R} y2={H - PAD_B} stroke="currentColor" strokeOpacity={0.3} />
            <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={H - PAD_B} stroke="currentColor" strokeOpacity={0.3} />
            {/* x-tick */}
            {[1, 3, 5, 7, 9, 10].map((c) => (
              <g key={c}>
                <line x1={x(c)} y1={H - PAD_B} x2={x(c)} y2={H - PAD_B + 4} stroke="currentColor" strokeOpacity={0.3} />
                <text x={x(c)} y={H - PAD_B + 14} fontSize="9" textAnchor="middle" fill="currentColor" opacity={0.7}>
                  {c}
                </text>
              </g>
            ))}
            <text x={(W + PAD_L) / 2} y={H - 4} fontSize="9" textAnchor="middle" fill="currentColor" opacity={0.7}>
              kompleksitet →
            </text>
            {/* y-tick */}
            {[0, 0.35, 0.7, 1.05].map((v) => (
              <g key={v}>
                <line x1={PAD_L - 4} y1={y(v)} x2={PAD_L} y2={y(v)} stroke="currentColor" strokeOpacity={0.3} />
                <text x={PAD_L - 6} y={y(v) + 3} fontSize="9" textAnchor="end" fill="currentColor" opacity={0.7}>
                  {v.toFixed(2)}
                </text>
              </g>
            ))}

            {/* underfit / overfit-band */}
            <rect
              x={PAD_L}
              y={PAD_T}
              width={x(bestC - 0.7) - PAD_L}
              height={H - PAD_T - PAD_B}
              fill="rgb(59 130 246)"
              fillOpacity={0.05}
            />
            <rect
              x={x(bestC + 0.7)}
              y={PAD_T}
              width={W - PAD_R - x(bestC + 0.7)}
              height={H - PAD_T - PAD_B}
              fill="rgb(244 63 94)"
              fillOpacity={0.05}
            />
            <text x={(PAD_L + x(bestC - 0.7)) / 2} y={PAD_T + 12} fontSize="9" textAnchor="middle" fill="rgb(59 130 246)" opacity={0.7}>
              underfit
            </text>
            <text x={(W - PAD_R + x(bestC + 0.7)) / 2} y={PAD_T + 12} fontSize="9" textAnchor="middle" fill="rgb(244 63 94)" opacity={0.7}>
              overfit
            </text>

            {/* train- og test-kurver */}
            <path d={pathOf("train")} fill="none" stroke="rgb(34 197 94)" strokeWidth={2} />
            <path d={pathOf("test")} fill="none" stroke="rgb(244 63 94)" strokeWidth={2} />

            {/* optimum-markør */}
            <line x1={x(bestC)} y1={PAD_T} x2={x(bestC)} y2={H - PAD_B} stroke="currentColor" strokeDasharray="2 3" strokeOpacity={0.4} />
            <circle cx={x(bestC)} cy={y(pts[bestIdx].test)} r={4} fill="rgb(244 63 94)" />
            <text x={x(bestC)} y={y(pts[bestIdx].test) - 8} fontSize="9" textAnchor="middle" fill="rgb(244 63 94)">
              optimum
            </text>

            {/* valgt kompleksitet */}
            <line
              x1={x(selPt.c)}
              y1={PAD_T - 4}
              x2={x(selPt.c)}
              y2={H - PAD_B}
              stroke="rgb(234 179 8)"
              strokeWidth={2}
            />
            <circle cx={x(selPt.c)} cy={y(selPt.train)} r={4} fill="rgb(34 197 94)" />
            <circle cx={x(selPt.c)} cy={y(selPt.test)} r={4} fill="rgb(244 63 94)" />

            {/* legend */}
            <g transform={`translate(${W - PAD_R - 130}, ${PAD_T + 4})`}>
              <rect x={0} y={0} width={130} height={32} fill="currentColor" fillOpacity={0.03} stroke="currentColor" strokeOpacity={0.15} />
              <line x1={6} y1={10} x2={20} y2={10} stroke="rgb(34 197 94)" strokeWidth={2} />
              <text x={24} y={13} fontSize="9" fill="currentColor" opacity={0.8}>train_error</text>
              <line x1={6} y1={24} x2={20} y2={24} stroke="rgb(244 63 94)" strokeWidth={2} />
              <text x={24} y={27} fontSize="9" fill="currentColor" opacity={0.8}>test_error</text>
            </g>
          </svg>
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-1">
            Test-error dekomponert v/ valgt kompleksitet
          </div>
          <div className="text-[10px] text-muted-foreground mb-1">
            kompleksitet = {selPt.c.toFixed(1)}
          </div>
          <DecompBar
            bias2={selPt.bias}
            variance={selPt.variance}
            irreducible={selPt.irreducible}
          />
          <div className="mt-3 space-y-1 text-xs">
            <KV label="bias²" value={selPt.bias} color="rgb(59 130 246)" />
            <KV label="variance" value={selPt.variance} color="rgb(244 63 94)" />
            <KV label="irreducible" value={selPt.irreducible} color="rgb(148 163 184)" />
            <div className="border-t border-border pt-1 mt-1">
              <KV label="test_error" value={selPt.test} bold />
              <KV label="train_error" value={selPt.train} muted />
              <KV label="gap" value={selPt.test - selPt.train} muted />
            </div>
          </div>
          <div className="mt-2 inline-block px-2 py-1 rounded text-xs font-medium"
            style={{
              background:
                regime === "underfit"
                  ? "rgba(59,130,246,0.15)"
                  : regime === "overfit"
                    ? "rgba(244,63,94,0.15)"
                    : "rgba(34,197,94,0.15)",
              color:
                regime === "underfit"
                  ? "rgb(59 130 246)"
                  : regime === "overfit"
                    ? "rgb(244 63 94)"
                    : "rgb(34 197 94)",
            }}
          >
            {regime === "underfit"
              ? "Underfit · bias dominerer"
              : regime === "overfit"
                ? "Overfit · variance dominerer"
                : "Balansert"}
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-3 text-xs">
        <strong className="text-brand">Hva å se etter:</strong>{" "}
        Dra terskelen helt mot venstre (kompleksitet 1): train og test ligger HØYT
        og tett — det er underfit, modellen er for enkel. Helt mot høyre: train
        går mot 0 men test stiger igjen — overfit. Bytt datasett-størrelse til
        <em> stort</em>: optimum flytter seg til høyere kompleksitet fordi mer
        data demper variansen — det er hvorfor «bare hent mer data» faktisk
        funker mot overfit.
      </div>
    </div>
  );
}

function DecompBar({
  bias2,
  variance,
  irreducible,
}: {
  bias2: number;
  variance: number;
  irreducible: number;
}) {
  const total = bias2 + variance + irreducible;
  const bw = (v: number) => (total > 0 ? (v / total) * 100 : 0);
  return (
    <div className="h-6 rounded overflow-hidden border border-border flex">
      <div className="h-full" style={{ width: `${bw(bias2)}%`, background: "rgb(59 130 246)", opacity: 0.7 }} title={`bias² = ${bias2.toFixed(3)}`} />
      <div className="h-full" style={{ width: `${bw(variance)}%`, background: "rgb(244 63 94)", opacity: 0.7 }} title={`variance = ${variance.toFixed(3)}`} />
      <div className="h-full" style={{ width: `${bw(irreducible)}%`, background: "rgb(148 163 184)", opacity: 0.7 }} title={`irreducible = ${irreducible.toFixed(3)}`} />
    </div>
  );
}

function KV({
  label,
  value,
  color,
  bold,
  muted,
}: {
  label: string;
  value: number;
  color?: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between ${muted ? "text-muted-foreground" : ""}`}>
      <span className="flex items-center gap-1">
        {color && <span className="inline-block w-2 h-2 rounded-sm" style={{ background: color }} />}
        {label}
      </span>
      <span className={`font-mono ${bold ? "font-semibold" : ""}`}>{value.toFixed(3)}</span>
    </div>
  );
}
