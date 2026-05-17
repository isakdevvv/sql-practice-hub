import { useState } from "react";
import { RotateCcw } from "lucide-react";

// --------------------------------------------------------------------------
// MatrixTransformGrid — viser hvordan en 2×2-matrise virker på rommet.
// Studenten justerer matrise-elementene (a, b, c, d) og ser:
//   - enhetsruta [0,1]² mappes til parallellogrammet kolonnene utspenner
//   - basisvektorene e₁=(1,0) og e₂=(0,1) går til (a,c) og (b,d)
//   - et 4×4 grid får forvridd
// Presets: rotasjon, skalering, shear, refleksjon.
// --------------------------------------------------------------------------

const W = 460;
const H = 360;
const PAD = 24;
const MIN = -4;
const MAX = 4;

function sx(x: number) {
  return PAD + ((x - MIN) / (MAX - MIN)) * (W - 2 * PAD);
}
function sy(y: number) {
  return H - PAD - ((y - MIN) / (MAX - MIN)) * (H - 2 * PAD);
}

type Preset = "identitet" | "rot45" | "rot90" | "skaler2x" | "shearX" | "speilX";

function applyPreset(p: Preset): [number, number, number, number] {
  switch (p) {
    case "identitet":
      return [1, 0, 0, 1];
    case "rot45": {
      const c = Math.cos(Math.PI / 4);
      const s = Math.sin(Math.PI / 4);
      return [c, -s, s, c];
    }
    case "rot90":
      return [0, -1, 1, 0];
    case "skaler2x":
      return [2, 0, 0, 0.5];
    case "shearX":
      return [1, 1, 0, 1];
    case "speilX":
      return [1, 0, 0, -1];
  }
}

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs font-mono">
      <span className="w-3 font-semibold">{label}</span>
      <input
        type="range"
        min={-2.5}
        max={2.5}
        step={0.1}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 accent-brand"
      />
      <span className="w-10 text-right tabular-nums">{value.toFixed(1)}</span>
    </label>
  );
}

export function MatrixTransformGrid() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);
  const [d, setD] = useState(1);

  function setMat([na, nb, nc, nd]: [number, number, number, number]) {
    setA(na);
    setB(nb);
    setC(nc);
    setD(nd);
  }

  function apply([x, y]: [number, number]): [number, number] {
    return [a * x + b * y, c * x + d * y];
  }

  const det = a * d - b * c;

  // unit square corners (original)
  const unit: [number, number][] = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ];
  const unitT = unit.map(apply);

  // grid lines from -3..3
  const lines: [number, number][][] = [];
  for (let i = -3; i <= 3; i++) {
    lines.push([
      [i, -3],
      [i, 3],
    ]);
    lines.push([
      [-3, i],
      [3, i],
    ]);
  }

  const e1T = apply([1, 0]);
  const e2T = apply([0, 1]);

  function pathFromPoly(pts: [number, number][]) {
    return (
      pts.map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p[0])} ${sy(p[1])}`).join(" ") +
      " Z"
    );
  }

  function ArrowSimple({
    to,
    color,
    width = 2.6,
  }: {
    to: [number, number];
    color: string;
    width?: number;
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
        <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={width} strokeLinecap="round" />
        <polygon points={`${x2},${y2} ${hx1},${hy1} ${hx2},${hy2}`} fill={color} />
      </g>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            {/* original grid (faint) */}
            {lines.map((ln, i) => (
              <line
                key={`og${i}`}
                x1={sx(ln[0][0])}
                y1={sy(ln[0][1])}
                x2={sx(ln[1][0])}
                y2={sy(ln[1][1])}
                stroke="currentColor"
                strokeOpacity={0.06}
                strokeWidth={1}
              />
            ))}
            {/* axes */}
            <line x1={sx(MIN)} y1={sy(0)} x2={sx(MAX)} y2={sy(0)} stroke="currentColor" strokeOpacity={0.35} />
            <line x1={sx(0)} y1={sy(MIN)} x2={sx(0)} y2={sy(MAX)} stroke="currentColor" strokeOpacity={0.35} />

            {/* transformed grid */}
            {lines.map((ln, i) => {
              const p1 = apply(ln[0]);
              const p2 = apply(ln[1]);
              return (
                <line
                  key={`tg${i}`}
                  x1={sx(p1[0])}
                  y1={sy(p1[1])}
                  x2={sx(p2[0])}
                  y2={sy(p2[1])}
                  stroke="hsl(215 85% 55%)"
                  strokeOpacity={0.22}
                  strokeWidth={1}
                />
              );
            })}

            {/* original unit square (outline) */}
            <path d={pathFromPoly(unit)} fill="hsl(0 0% 50%)" fillOpacity={0.12} stroke="currentColor" strokeOpacity={0.5} strokeWidth={1.2} strokeDasharray="4 3" />
            {/* transformed unit square (filled) */}
            <path
              d={pathFromPoly(unitT)}
              fill={det >= 0 ? "hsl(150 65% 50%)" : "hsl(0 70% 55%)"}
              fillOpacity={0.22}
              stroke={det >= 0 ? "hsl(150 65% 35%)" : "hsl(0 70% 45%)"}
              strokeWidth={2}
            />

            {/* basis vectors after */}
            <ArrowSimple to={e1T} color="hsl(215 85% 55%)" />
            <ArrowSimple to={e2T} color="hsl(28 90% 55%)" />

            {/* labels */}
            <text x={sx(e1T[0]) + 6} y={sy(e1T[1]) - 4} fontSize="11" fill="hsl(215 85% 55%)" fontWeight={600}>
              Ae₁
            </text>
            <text x={sx(e2T[0]) + 6} y={sy(e2T[1]) - 4} fontSize="11" fill="hsl(28 90% 55%)" fontWeight={600}>
              Ae₂
            </text>
          </svg>
        </div>

        <div className="space-y-3">
          <div className="font-mono text-xs">
            <div className="text-muted-foreground mb-1">A =</div>
            <div className="grid grid-cols-2 gap-2 max-w-[180px]">
              <div className="rounded border border-border bg-background p-1 text-center tabular-nums">{a.toFixed(2)}</div>
              <div className="rounded border border-border bg-background p-1 text-center tabular-nums">{b.toFixed(2)}</div>
              <div className="rounded border border-border bg-background p-1 text-center tabular-nums">{c.toFixed(2)}</div>
              <div className="rounded border border-border bg-background p-1 text-center tabular-nums">{d.toFixed(2)}</div>
            </div>
            <div className="mt-2 text-muted-foreground">
              det(A) = ad − bc ={" "}
              <span className={det >= 0 ? "text-foreground" : "text-red-500"}>{det.toFixed(2)}</span>
              {det < 0 && <span className="ml-2">(orientering snur)</span>}
              {Math.abs(det) < 1e-3 && <span className="ml-2">(singulær — kollapser)</span>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Slider label="a" value={a} onChange={setA} />
            <Slider label="b" value={b} onChange={setB} />
            <Slider label="c" value={c} onChange={setC} />
            <Slider label="d" value={d} onChange={setD} />
          </div>

          <div className="text-xs font-medium pt-1">Presets:</div>
          <div className="flex flex-wrap gap-1.5">
            {(["identitet", "rot45", "rot90", "skaler2x", "shearX", "speilX"] as Preset[]).map((p) => (
              <button
                key={p}
                onClick={() => setMat(applyPreset(p))}
                className="rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-muted"
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setMat([1, 0, 0, 1])}
              className="ml-auto inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-muted"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>

          <div className="rounded-md bg-muted/40 p-2 text-xs space-y-1">
            <div className="font-semibold">Hva ser du?</div>
            <div className="text-muted-foreground">
              Stiplet grå = original enhetsrute. Farget = transformert rute.
              Kolonnene i A er presis bildene av e₁ og e₂. Arealet av den
              transformerte ruten er |det(A)|.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
