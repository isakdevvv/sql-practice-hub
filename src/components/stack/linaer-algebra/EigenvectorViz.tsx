import { useMemo, useState } from "react";

// --------------------------------------------------------------------------
// EigenvectorViz — finn egenvektorene visuelt.
// Gitt en 2×2-matrise A, lar vi studenten rotere en enhetsvektor v rundt
// origo (slider eller klikk-på-sirkel). For hver vinkel beregner vi Av og
// tegner det. Hvis v og Av ligger på samme linje (samme eller motsatt
// retning), er v en egenvektor.
//
// I tillegg: en "vinkelfeil"-kurve som viser sinθ mellom v og Av, slik at
// nullpunktene = egenvektor-retningene. Klikk på et nullpunkt → snap til
// nøyaktig egenvektor.
// --------------------------------------------------------------------------

const W = 360;
const H = 360;
const PAD = 24;
const MIN = -3;
const MAX = 3;

function sx(x: number) {
  return PAD + ((x - MIN) / (MAX - MIN)) * (W - 2 * PAD);
}
function sy(y: number) {
  return H - PAD - ((y - MIN) / (MAX - MIN)) * (H - 2 * PAD);
}

type Preset = {
  name: string;
  m: [number, number, number, number];
  desc: string;
};

const PRESETS: Preset[] = [
  { name: "diagonal", m: [2, 0, 0, 0.5], desc: "Strekker x, krymper y. Eigen: e₁, e₂." },
  { name: "symmetrisk", m: [3, 1, 1, 3], desc: "λ=4 langs (1,1); λ=2 langs (1,-1)." },
  { name: "shear", m: [1, 1, 0, 1], desc: "Bare én eigen: (1,0). Resten roteres." },
  { name: "rotasjon", m: [0, -1, 1, 0], desc: "Ren rotasjon (90°). Ingen reelle eigen." },
  { name: "speil", m: [1, 0, 0, -1], desc: "λ=1 langs x-aksen; λ=-1 langs y-aksen." },
];

function eig2x2(m: [number, number, number, number]) {
  const [a, b, c, d] = m;
  const tr = a + d;
  const det = a * d - b * c;
  const disc = tr * tr - 4 * det;
  if (disc < -1e-9) return null;
  const sqrtD = Math.sqrt(Math.max(0, disc));
  const l1 = (tr + sqrtD) / 2;
  const l2 = (tr - sqrtD) / 2;
  function vecFor(l: number): [number, number] | null {
    // (A - λI) v = 0
    const m11 = a - l;
    const m12 = b;
    // row 1: m11*x + m12*y = 0 → if m12 != 0: v = (m12, -m11)
    if (Math.abs(m12) > 1e-9) {
      const x = m12;
      const y = -m11;
      const n = Math.hypot(x, y);
      return [x / n, y / n];
    }
    const m21 = c;
    const m22 = d - l;
    if (Math.abs(m21) > 1e-9) {
      const x = m22;
      const y = -m21;
      const n = Math.hypot(x, y);
      return [x / n, y / n];
    }
    // identity-shifted case: any direction works
    return [1, 0];
  }
  return { l1, l2, v1: vecFor(l1), v2: vecFor(l2) };
}

export function EigenvectorViz() {
  const [presetIdx, setPresetIdx] = useState(1);
  const [angle, setAngle] = useState(45);

  const preset = PRESETS[presetIdx];
  const [a, b, c, d] = preset.m;
  const eig = useMemo(() => eig2x2(preset.m), [preset]);

  const theta = (angle * Math.PI) / 180;
  const v: [number, number] = [Math.cos(theta), Math.sin(theta)];
  const Av: [number, number] = [a * v[0] + b * v[1], c * v[0] + d * v[1]];

  const lenAv = Math.hypot(Av[0], Av[1]);
  // angle between Av and v (signed via cross)
  const cross = v[0] * Av[1] - v[1] * Av[0];
  const dot = v[0] * Av[0] + v[1] * Av[1];
  const angBetweenRad = Math.atan2(Math.abs(cross), dot);
  const angBetweenDeg = (angBetweenRad * 180) / Math.PI;
  const isEigen = angBetweenDeg < 2 || angBetweenDeg > 178;
  const lambda = isEigen ? (dot >= 0 ? lenAv : -lenAv) : null;

  // sample the alignment curve over 360°
  const curve = useMemo(() => {
    const pts: { ang: number; err: number; cross: number }[] = [];
    for (let i = 0; i <= 180; i++) {
      const t = (i * Math.PI) / 180;
      const cv: [number, number] = [Math.cos(t), Math.sin(t)];
      const Acv: [number, number] = [a * cv[0] + b * cv[1], c * cv[0] + d * cv[1]];
      const cr = cv[0] * Acv[1] - cv[1] * Acv[0];
      const nA = Math.hypot(Acv[0], Acv[1]);
      const err = nA > 1e-9 ? cr / nA : 0;
      pts.push({ ang: i, err, cross: cr });
    }
    return pts;
  }, [a, b, c, d]);

  // snap to nearest eigenvector by clicking
  function snapToNearestEigen() {
    if (!eig || !eig.v1) return;
    const candidates: number[] = [];
    if (eig.v1) candidates.push((Math.atan2(eig.v1[1], eig.v1[0]) * 180) / Math.PI);
    if (eig.v2) candidates.push((Math.atan2(eig.v2[1], eig.v2[0]) * 180) / Math.PI);
    let best = candidates[0];
    let bestDist = Infinity;
    for (const cand of candidates) {
      const norm = ((cand % 360) + 360) % 360;
      const cur = ((angle % 360) + 360) % 360;
      const d1 = Math.abs(norm - cur);
      const d2 = Math.min(d1, 360 - d1);
      if (d2 < bestDist) {
        bestDist = d2;
        best = norm;
      }
    }
    setAngle(best);
  }

  function ArrowSimple({
    to,
    color,
    width = 2.6,
    dashed,
  }: {
    to: [number, number];
    color: string;
    width?: number;
    dashed?: boolean;
  }) {
    const x1 = sx(0);
    const y1 = sy(0);
    const x2 = sx(to[0]);
    const y2 = sy(to[1]);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len < 1) return null;
    const ux = dx / len;
    const uy = dy / len;
    const head = 9;
    const ex = x2 - ux * head * 0.6;
    const ey = y2 - uy * head * 0.6;
    const px = -uy;
    const py = ux;
    const hx1 = x2 - ux * head + px * head * 0.45;
    const hy1 = y2 - uy * head + py * head * 0.45;
    const hx2 = x2 - ux * head - px * head * 0.45;
    const hy2 = y2 - uy * head - py * head * 0.45;
    return (
      <g>
        <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dashed ? "5 4" : undefined} />
        <polygon points={`${x2},${y2} ${hx1},${hy1} ${hx2},${hy2}`} fill={color} />
      </g>
    );
  }

  const Wc = 360; // curve width
  const Hc = 80;
  const padC = 18;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs font-medium">Matrise:</span>
        {PRESETS.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setPresetIdx(i)}
            className={`rounded-md border px-2 py-1 text-xs ${
              i === presetIdx
                ? "border-brand bg-brand/10 text-brand"
                : "border-border bg-background hover:bg-muted"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-[1fr_220px] gap-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* grid */}
          {[-3, -2, -1, 0, 1, 2, 3].map((g) => (
            <g key={`g${g}`}>
              <line x1={sx(g)} y1={sy(MIN)} x2={sx(g)} y2={sy(MAX)} stroke="currentColor" strokeOpacity={g === 0 ? 0.35 : 0.06} />
              <line x1={sx(MIN)} y1={sy(g)} x2={sx(MAX)} y2={sy(g)} stroke="currentColor" strokeOpacity={g === 0 ? 0.35 : 0.06} />
            </g>
          ))}

          {/* unit circle */}
          <circle cx={sx(0)} cy={sy(0)} r={((W - 2 * PAD) / (MAX - MIN)) * 1} fill="none" stroke="currentColor" strokeOpacity={0.15} />

          {/* eigen lines through origin */}
          {eig?.v1 &&
            (() => {
              const k = 3;
              return (
                <line
                  x1={sx(-k * eig.v1[0])}
                  y1={sy(-k * eig.v1[1])}
                  x2={sx(k * eig.v1[0])}
                  y2={sy(k * eig.v1[1])}
                  stroke="hsl(150 60% 45%)"
                  strokeOpacity={0.4}
                  strokeDasharray="4 4"
                  strokeWidth={1.3}
                />
              );
            })()}
          {eig?.v2 &&
            Math.abs(eig.l1 - eig.l2) > 1e-6 &&
            (() => {
              const k = 3;
              return (
                <line
                  x1={sx(-k * eig.v2[0])}
                  y1={sy(-k * eig.v2[1])}
                  x2={sx(k * eig.v2[0])}
                  y2={sy(k * eig.v2[1])}
                  stroke="hsl(280 60% 55%)"
                  strokeOpacity={0.4}
                  strokeDasharray="4 4"
                  strokeWidth={1.3}
                />
              );
            })()}

          {/* v and Av */}
          <ArrowSimple to={v} color="hsl(215 85% 55%)" width={2.8} />
          <ArrowSimple to={Av} color={isEigen ? "hsl(150 65% 42%)" : "hsl(28 90% 55%)"} width={3} />

          {/* labels */}
          <text x={sx(v[0]) + 8} y={sy(v[1]) - 4} fontSize="11" fontWeight={600} fill="hsl(215 85% 55%)">v</text>
          <text x={sx(Av[0]) + 8} y={sy(Av[1]) - 4} fontSize="11" fontWeight={600} fill={isEigen ? "hsl(150 65% 42%)" : "hsl(28 90% 55%)"}>
            Av
          </text>
        </svg>

        <div className="space-y-2">
          <div className="font-mono text-xs">
            <div className="text-muted-foreground mb-1">A =</div>
            <div className="grid grid-cols-2 gap-1 max-w-[140px]">
              <div className="rounded border border-border bg-background p-1 text-center">{a}</div>
              <div className="rounded border border-border bg-background p-1 text-center">{b}</div>
              <div className="rounded border border-border bg-background p-1 text-center">{c}</div>
              <div className="rounded border border-border bg-background p-1 text-center">{d}</div>
            </div>
          </div>
          <label className="flex flex-col gap-1 text-xs font-mono">
            <span>retning v: {angle}°</span>
            <input
              type="range"
              min={0}
              max={359}
              step={1}
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value))}
              className="accent-brand"
            />
          </label>
          <button
            onClick={snapToNearestEigen}
            disabled={!eig?.v1}
            className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
          >
            Snap til nærmeste egen
          </button>

          <div className="rounded border border-border p-2 text-xs font-mono space-y-0.5">
            <div>vinkel(v, Av) = {angBetweenDeg.toFixed(1)}°</div>
            {isEigen ? (
              <div className="text-green-600 font-semibold">
                EGENVEKTOR! λ = {lambda?.toFixed(2)}
              </div>
            ) : (
              <div className="text-muted-foreground">ikke parallelle</div>
            )}
          </div>
        </div>
      </div>

      {/* alignment-error curve (sin of angle) */}
      <div className="mt-3">
        <div className="text-xs text-muted-foreground mb-1">
          «Hvor parallelle?»-kurve over alle retninger (0–180°). Nullpunkter = egenretninger.
        </div>
        <svg viewBox={`0 0 ${Wc} ${Hc}`} className="w-full h-auto">
          <line x1={padC} y1={Hc / 2} x2={Wc - padC} y2={Hc / 2} stroke="currentColor" strokeOpacity={0.3} />
          {/* curve */}
          <path
            d={curve
              .map((p, i) => {
                const x = padC + (p.ang / 180) * (Wc - 2 * padC);
                const y = Hc / 2 - Math.max(-1, Math.min(1, p.err)) * (Hc / 2 - 6);
                return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
              })
              .join(" ")}
            stroke="hsl(215 85% 55%)"
            strokeWidth={1.6}
            fill="none"
          />
          {/* current angle marker */}
          <line
            x1={padC + ((angle % 180) / 180) * (Wc - 2 * padC)}
            y1={4}
            x2={padC + ((angle % 180) / 180) * (Wc - 2 * padC)}
            y2={Hc - 4}
            stroke="hsl(28 90% 55%)"
            strokeWidth={1.4}
            strokeDasharray="3 3"
          />
          {/* eigen direction markers */}
          {eig?.v1 &&
            (() => {
              const a1 = ((Math.atan2(eig.v1[1], eig.v1[0]) * 180) / Math.PI + 180) % 180;
              return (
                <line
                  x1={padC + (a1 / 180) * (Wc - 2 * padC)}
                  y1={Hc / 2 - 8}
                  x2={padC + (a1 / 180) * (Wc - 2 * padC)}
                  y2={Hc / 2 + 8}
                  stroke="hsl(150 60% 45%)"
                  strokeWidth={2}
                />
              );
            })()}
          {eig?.v2 &&
            Math.abs(eig.l1 - eig.l2) > 1e-6 &&
            (() => {
              const a2 = ((Math.atan2(eig.v2[1], eig.v2[0]) * 180) / Math.PI + 180) % 180;
              return (
                <line
                  x1={padC + (a2 / 180) * (Wc - 2 * padC)}
                  y1={Hc / 2 - 8}
                  x2={padC + (a2 / 180) * (Wc - 2 * padC)}
                  y2={Hc / 2 + 8}
                  stroke="hsl(280 60% 55%)"
                  strokeWidth={2}
                />
              );
            })()}
          <text x={padC} y={Hc - 2} fontSize="9" fill="currentColor" opacity={0.6}>0°</text>
          <text x={Wc - padC - 18} y={Hc - 2} fontSize="9" fill="currentColor" opacity={0.6}>180°</text>
        </svg>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        <strong>{preset.name}:</strong> {preset.desc}{" "}
        {eig
          ? `Egenverdier: λ₁=${eig.l1.toFixed(2)}, λ₂=${eig.l2.toFixed(2)}.`
          : "Ingen reelle egenverdier (komplekse — typisk for ren rotasjon)."}
      </p>
    </div>
  );
}
