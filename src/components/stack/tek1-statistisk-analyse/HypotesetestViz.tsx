import { useMemo, useState } from "react";

// --------------------------------------------------------------------------
// HypotesetestViz — visualiserer null-fordelingen N(0,1) under H₀ med
// avvisningsområde(r) skravert, plus observert teststatistikk og p-verdi
// som area-under-tail. Tre modus for H₁: tosidig, høyresidig, venstresidig.
// --------------------------------------------------------------------------

type Side = "two" | "right" | "left";

const W = 540;
const H = 220;
const PAD_L = 30;
const PAD_R = 16;
const PAD_T = 14;
const PAD_B = 26;
const Z_MIN = -4;
const Z_MAX = 4;
const STEPS = 240;

// pdf og cdf for standardnormal
function pdf(z: number) {
  return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
}
function erf(x: number) {
  const sign = Math.sign(x);
  x = Math.abs(x);
  const a1 = 0.254829592,
    a2 = -0.284496736,
    a3 = 1.421413741,
    a4 = -1.453152027,
    a5 = 1.061405429,
    p = 0.3275911;
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}
function cdf(z: number) {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}
// invers cdf via bisection (vi trenger ikke høy presisjon — visuelt)
function invCdf(p: number) {
  let lo = -8,
    hi = 8;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (cdf(mid) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function buildCurve() {
  const pts: { z: number; y: number }[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const z = Z_MIN + (i / STEPS) * (Z_MAX - Z_MIN);
    pts.push({ z, y: pdf(z) });
  }
  return pts;
}

export function HypotesetestViz() {
  const [side, setSide] = useState<Side>("two");
  const [alpha, setAlpha] = useState(0.05);
  const [zObs, setZObs] = useState(1.8);

  const curve = useMemo(buildCurve, []);
  const yMax = pdf(0) * 1.08;

  const x = (z: number) =>
    PAD_L + ((z - Z_MIN) / (Z_MAX - Z_MIN)) * (W - PAD_L - PAD_R);
  const y = (v: number) => PAD_T + (1 - v / yMax) * (H - PAD_T - PAD_B);

  const yBase = y(0);

  // kritiske z
  const crit = useMemo(() => {
    if (side === "two") {
      const z = invCdf(1 - alpha / 2);
      return { lo: -z, hi: z };
    }
    if (side === "right") {
      return { lo: -Infinity, hi: invCdf(1 - alpha) };
    }
    return { lo: invCdf(alpha), hi: Infinity };
  }, [side, alpha]);

  // p-verdi
  const pValue = useMemo(() => {
    if (side === "two") return 2 * (1 - cdf(Math.abs(zObs)));
    if (side === "right") return 1 - cdf(zObs);
    return cdf(zObs);
  }, [side, zObs]);

  const reject = pValue < alpha;

  // sti for hele kurven
  const fullPath = useMemo(() => {
    let d = `M ${x(curve[0].z)} ${y(curve[0].y)}`;
    for (let i = 1; i < curve.length; i++) d += ` L ${x(curve[i].z)} ${y(curve[i].y)}`;
    return d;
  }, [curve]);

  // shaded fill: avvisningsområde(r)
  const buildShade = (lo: number, hi: number) => {
    const inside = curve.filter((p) => p.z >= lo && p.z <= hi);
    if (inside.length === 0) return "";
    let d = `M ${x(inside[0].z)} ${yBase}`;
    for (const p of inside) d += ` L ${x(p.z)} ${y(p.y)}`;
    d += ` L ${x(inside[inside.length - 1].z)} ${yBase} Z`;
    return d;
  };

  const rejectShades: string[] = [];
  if (side === "two") {
    rejectShades.push(buildShade(Z_MIN, crit.lo));
    rejectShades.push(buildShade(crit.hi, Z_MAX));
  } else if (side === "right") {
    rejectShades.push(buildShade(crit.hi, Z_MAX));
  } else {
    rejectShades.push(buildShade(Z_MIN, crit.lo));
  }

  // p-verdi shade (under observert)
  let pShade = "";
  if (side === "two") {
    const a = -Math.abs(zObs);
    const b = Math.abs(zObs);
    pShade = buildShade(Z_MIN, a) + " " + buildShade(b, Z_MAX);
  } else if (side === "right") {
    pShade = buildShade(zObs, Z_MAX);
  } else {
    pShade = buildShade(Z_MIN, zObs);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">H₁</span>
          <div className="inline-flex rounded-md border border-border overflow-hidden">
            {(
              [
                { k: "two" as Side, label: "μ ≠ μ₀" },
                { k: "right" as Side, label: "μ > μ₀" },
                { k: "left" as Side, label: "μ < μ₀" },
              ]
            ).map(({ k, label }) => (
              <button
                key={k}
                onClick={() => setSide(k)}
                className={
                  "px-2 py-1 text-xs font-mono " +
                  (side === k
                    ? "bg-brand text-white"
                    : "bg-card hover:bg-muted/40")
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">α</span>
          <input
            type="range"
            min={0.01}
            max={0.2}
            step={0.01}
            value={alpha}
            onChange={(e) => setAlpha(parseFloat(e.target.value))}
            className="w-28"
          />
          <span className="font-mono w-12 text-right">{alpha.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">z_obs</span>
          <input
            type="range"
            min={-3.5}
            max={3.5}
            step={0.05}
            value={zObs}
            onChange={(e) => setZObs(parseFloat(e.target.value))}
            className="w-36"
          />
          <span className="font-mono w-12 text-right">{zObs.toFixed(2)}</span>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background/40 overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          {/* gridlines */}
          {[-3, -2, -1, 0, 1, 2, 3].map((z) => (
            <line
              key={z}
              x1={x(z)}
              x2={x(z)}
              y1={PAD_T}
              y2={yBase}
              stroke="currentColor"
              strokeOpacity={z === 0 ? 0.18 : 0.06}
            />
          ))}

          {/* avvisningsområde (rosa) */}
          {rejectShades.map((d, i) =>
            d ? <path key={i} d={d} fill="rgb(244,114,182)" fillOpacity={0.2} /> : null,
          )}

          {/* p-verdi shade (mer mettet) */}
          {pShade && (
            <path
              d={pShade}
              fill={reject ? "rgb(239,68,68)" : "rgb(56,189,248)"}
              fillOpacity={0.45}
            />
          )}

          {/* kurve */}
          <path d={fullPath} stroke="currentColor" strokeOpacity={0.85} fill="none" strokeWidth={1.5} />

          {/* x-akse */}
          <line
            x1={PAD_L}
            x2={W - PAD_R}
            y1={yBase}
            y2={yBase}
            stroke="currentColor"
            strokeOpacity={0.5}
          />
          {[-3, -2, -1, 0, 1, 2, 3].map((z) => (
            <g key={"t" + z}>
              <line
                x1={x(z)}
                x2={x(z)}
                y1={yBase}
                y2={yBase + 3}
                stroke="currentColor"
                strokeOpacity={0.5}
              />
              <text
                x={x(z)}
                y={yBase + 14}
                textAnchor="middle"
                fontSize={9}
                className="fill-muted-foreground"
              >
                {z}
              </text>
            </g>
          ))}

          {/* kritiske z-linjer */}
          {isFinite(crit.lo) && (
            <line
              x1={x(crit.lo)}
              x2={x(crit.lo)}
              y1={PAD_T}
              y2={yBase}
              stroke="rgb(244,114,182)"
              strokeWidth={1.2}
              strokeDasharray="3 3"
            />
          )}
          {isFinite(crit.hi) && (
            <line
              x1={x(crit.hi)}
              x2={x(crit.hi)}
              y1={PAD_T}
              y2={yBase}
              stroke="rgb(244,114,182)"
              strokeWidth={1.2}
              strokeDasharray="3 3"
            />
          )}

          {/* observert z-verdi */}
          <line
            x1={x(zObs)}
            x2={x(zObs)}
            y1={PAD_T - 4}
            y2={yBase + 8}
            stroke={reject ? "rgb(239,68,68)" : "rgb(56,189,248)"}
            strokeWidth={2}
          />
          <text
            x={x(zObs)}
            y={PAD_T - 6}
            textAnchor="middle"
            fontSize={10}
            fill={reject ? "rgb(239,68,68)" : "rgb(56,189,248)"}
            fontFamily="monospace"
          >
            z_obs
          </text>
        </svg>
      </div>

      <div className="mt-3 grid sm:grid-cols-3 gap-2 text-xs">
        <div className="rounded-md border border-border bg-background/40 p-2">
          <div className="text-muted-foreground">Kritisk z</div>
          <div className="font-mono text-sm">
            {side === "two"
              ? `±${crit.hi.toFixed(3)}`
              : side === "right"
                ? `+${crit.hi.toFixed(3)}`
                : crit.lo.toFixed(3)}
          </div>
        </div>
        <div className="rounded-md border border-border bg-background/40 p-2">
          <div className="text-muted-foreground">p-verdi</div>
          <div className="font-mono text-sm">{pValue.toFixed(4)}</div>
        </div>
        <div
          className={
            "rounded-md border p-2 " +
            (reject
              ? "border-red-500/40 bg-red-500/5"
              : "border-emerald-500/30 bg-emerald-500/5")
          }
        >
          <div className="text-muted-foreground">Konklusjon</div>
          <div className={"font-semibold text-sm " + (reject ? "text-red-500" : "text-emerald-500")}>
            {reject ? "FORKAST H₀" : "BEHOLD H₀"}
          </div>
        </div>
      </div>

      <p className="mt-3 text-[12px] text-muted-foreground leading-snug">
        <span className="font-semibold text-foreground">Hva å se etter:</span>{" "}
        Rosa skravur er avvisningsområdet — det med totalt areal α under H₀.
        Den mer mettede flekken er p-verdien: arealet "lenger ute" enn det vi
        observerte. Forkast H₀ ⇔ p &lt; α ⇔ z_obs lander i rosa område. Bytt
        til ensidig: nå legges hele α i én hale, så samme z_obs blir "mer
        signifikant". Skru α opp: avvisningsområdet vokser — flere
        falske-alarmer (Type I-feil).
      </p>
    </div>
  );
}
