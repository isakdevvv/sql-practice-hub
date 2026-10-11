import { useRef, useState } from "react";

// --------------------------------------------------------------------------
// DotProductGeometry — to vektorer a og b med dragbare spisser.
// Vi viser:
//   - vinkelen θ mellom dem (bue)
//   - projeksjonen av b på a (komponentvis), tegnet stiplet
//   - den algebraiske og geometriske formelen for a·b side om side
//   - fargekode: blå når vinkelen er spiss (a·b > 0), grå når ortogonal,
//     rød når stump (a·b < 0).
// --------------------------------------------------------------------------

const W = 460;
const H = 340;
const PAD = 24;
const MIN = -5;
const MAX = 5;

function sx(x: number) {
  return PAD + ((x - MIN) / (MAX - MIN)) * (W - 2 * PAD);
}
function sy(y: number) {
  return H - PAD - ((y - MIN) / (MAX - MIN)) * (H - 2 * PAD);
}
function invX(px: number) {
  return MIN + ((px - PAD) / (W - 2 * PAD)) * (MAX - MIN);
}
function invY(py: number) {
  return MIN + ((H - PAD - py) / (H - 2 * PAD)) * (MAX - MIN);
}

function snap(v: number) {
  return Math.round(v * 2) / 2;
}

type Vec = { x: number; y: number };

export function DotProductGeometry() {
  const [a, setA] = useState<Vec>({ x: 4, y: 0 });
  const [b, setB] = useState<Vec>({ x: 2, y: 3 });
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<"a" | "b" | null>(null);

  function startDrag(which: "a" | "b") {
    return (e: React.PointerEvent) => {
      dragRef.current = which;
      (e.target as Element).setPointerCapture(e.pointerId);
    };
  }
  function onMove(e: React.PointerEvent) {
    if (!dragRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    const x = Math.max(MIN, Math.min(MAX, snap(invX(px))));
    const y = Math.max(MIN, Math.min(MAX, snap(invY(py))));
    if (dragRef.current === "a") setA({ x, y });
    else setB({ x, y });
  }
  function endDrag() {
    dragRef.current = null;
  }

  const dot = a.x * b.x + a.y * b.y;
  const lenA = Math.hypot(a.x, a.y);
  const lenB = Math.hypot(b.x, b.y);
  const cosT = lenA && lenB ? dot / (lenA * lenB) : 0;
  const clampedCos = Math.max(-1, Math.min(1, cosT));
  const theta = Math.acos(clampedCos);
  const thetaDeg = (theta * 180) / Math.PI;

  // projection of b on a: ((a·b)/|a|²) * a
  const scaleProj = lenA ? dot / (lenA * lenA) : 0;
  const projB: Vec = { x: scaleProj * a.x, y: scaleProj * a.y };

  // angle arc: small arc near origin
  const ang0 = Math.atan2(a.y, a.x);
  const ang1 = Math.atan2(b.y, b.x);
  let aStart = ang0;
  let aEnd = ang1;
  // make a sweep that follows the smaller angle
  let sweep = aEnd - aStart;
  if (sweep > Math.PI) sweep -= 2 * Math.PI;
  if (sweep < -Math.PI) sweep += 2 * Math.PI;
  const arcR = 1.2;
  const arcStart = {
    x: sx(arcR * Math.cos(aStart)),
    y: sy(arcR * Math.sin(aStart)),
  };
  const arcEnd = {
    x: sx(arcR * Math.cos(aStart + sweep)),
    y: sy(arcR * Math.sin(aStart + sweep)),
  };
  const largeArc = Math.abs(sweep) > Math.PI ? 1 : 0;
  // svg y is flipped, so sweep direction inverts
  const sweepFlag = sweep > 0 ? 0 : 1;
  // arc radius in svg units
  const arcRPx = arcR * ((W - 2 * PAD) / (MAX - MIN));

  const sign =
    Math.abs(dot) < 1e-3
      ? "ortogonal"
      : dot > 0
      ? "spiss vinkel (a·b > 0)"
      : "stump vinkel (a·b < 0)";
  const dotColor =
    Math.abs(dot) < 1e-3
      ? "hsl(0 0% 55%)"
      : dot > 0
      ? "hsl(215 85% 55%)"
      : "hsl(0 70% 55%)";

  function ArrowSimple({
    from,
    to,
    color,
    dashed,
    width = 2.6,
  }: {
    from: Vec;
    to: Vec;
    color: string;
    dashed?: boolean;
    width?: number;
  }) {
    const x1 = sx(from.x);
    const y1 = sy(from.y);
    const x2 = sx(to.x);
    const y2 = sy(to.y);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len < 1) return null;
    const ux = dx / len;
    const uy = dy / len;
    const head = 10;
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
        <line
          x1={x1}
          y1={y1}
          x2={ex}
          y2={ey}
          stroke={color}
          strokeWidth={width}
          strokeLinecap="round"
          strokeDasharray={dashed ? "5 4" : undefined}
        />
        <polygon points={`${x2},${y2} ${hx1},${hy1} ${hx2},${hy2}`} fill={color} />
      </g>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs font-medium mb-2">
        Dra <span style={{ color: "hsl(215 85% 55%)" }}>● a-tip</span> og{" "}
        <span style={{ color: "hsl(28 90% 55%)" }}>● b-tip</span> — se hvordan
        vinkelen θ og a·b henger sammen.
      </div>
      <div className="grid md:grid-cols-[1fr_220px] gap-3">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto touch-none select-none"
          onPointerMove={onMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {/* grid */}
          {Array.from({ length: MAX - MIN + 1 }, (_, i) => MIN + i).map((g) => (
            <g key={`g${g}`}>
              <line x1={sx(g)} y1={sy(MIN)} x2={sx(g)} y2={sy(MAX)} stroke="currentColor" strokeOpacity={g === 0 ? 0.35 : 0.06} />
              <line x1={sx(MIN)} y1={sy(g)} x2={sx(MAX)} y2={sy(g)} stroke="currentColor" strokeOpacity={g === 0 ? 0.35 : 0.06} />
            </g>
          ))}

          {/* angle arc */}
          {lenA > 0.5 && lenB > 0.5 && (
            <path
              d={`M ${arcStart.x} ${arcStart.y} A ${arcRPx} ${arcRPx} 0 ${largeArc} ${sweepFlag} ${arcEnd.x} ${arcEnd.y}`}
              stroke={dotColor}
              strokeWidth={2}
              fill="none"
            />
          )}
          {lenA > 0.5 && lenB > 0.5 && (
            <text
              x={sx(arcR * 1.6 * Math.cos(aStart + sweep / 2))}
              y={sy(arcR * 1.6 * Math.sin(aStart + sweep / 2))}
              fontSize="11"
              fontWeight={600}
              fill={dotColor}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              θ={thetaDeg.toFixed(0)}°
            </text>
          )}

          {/* projection line (from projB straight up/down to b) */}
          {lenA > 0.5 && (
            <line
              x1={sx(b.x)}
              y1={sy(b.y)}
              x2={sx(projB.x)}
              y2={sy(projB.y)}
              stroke="hsl(280 60% 60%)"
              strokeWidth={1.4}
              strokeDasharray="4 3"
            />
          )}

          {/* projection vector */}
          {lenA > 0.5 && (
            <ArrowSimple from={{ x: 0, y: 0 }} to={projB} color="hsl(280 60% 60%)" width={3.2} />
          )}

          {/* main vectors */}
          <ArrowSimple from={{ x: 0, y: 0 }} to={a} color="hsl(215 85% 55%)" />
          <ArrowSimple from={{ x: 0, y: 0 }} to={b} color="hsl(28 90% 55%)" />

          {/* drag handles */}
          <circle
            cx={sx(a.x)}
            cy={sy(a.y)}
            r={10}
            fill="hsl(215 85% 55%)"
            stroke="white"
            strokeWidth={2}
            onPointerDown={startDrag("a")}
            style={{ cursor: "grab" }}
          />
          <circle
            cx={sx(b.x)}
            cy={sy(b.y)}
            r={10}
            fill="hsl(28 90% 55%)"
            stroke="white"
            strokeWidth={2}
            onPointerDown={startDrag("b")}
            style={{ cursor: "grab" }}
          />
          <text x={sx(a.x) + 14} y={sy(a.y) - 6} fontSize="11" fontWeight={600} fill="hsl(215 85% 55%)">a</text>
          <text x={sx(b.x) + 14} y={sy(b.y) - 6} fontSize="11" fontWeight={600} fill="hsl(28 90% 55%)">b</text>
          <text x={sx(projB.x) + 6} y={sy(projB.y) + 14} fontSize="10" fontWeight={600} fill="hsl(280 60% 60%)">
            projₐ b
          </text>
        </svg>

        <div className="space-y-2 text-xs font-mono">
          <div className="rounded border border-border p-2">
            <div className="text-muted-foreground">Algebraisk:</div>
            <div>a·b = {a.x}·{b.x} + {a.y}·{b.y}</div>
            <div className="font-semibold" style={{ color: dotColor }}>
              = {dot.toFixed(2)}
            </div>
          </div>
          <div className="rounded border border-border p-2">
            <div className="text-muted-foreground">Geometrisk:</div>
            <div>‖a‖·‖b‖·cos θ</div>
            <div>= {lenA.toFixed(2)}·{lenB.toFixed(2)}·{cosT.toFixed(2)}</div>
            <div className="font-semibold" style={{ color: dotColor }}>
              = {(lenA * lenB * cosT).toFixed(2)}
            </div>
          </div>
          <div className="rounded border border-border p-2">
            <div className="text-muted-foreground">cos θ:</div>
            <div className="tabular-nums">{cosT.toFixed(3)}</div>
            <div className="text-muted-foreground mt-1">Status:</div>
            <div style={{ color: dotColor }} className="font-semibold">{sign}</div>
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Lilla pil = projeksjonen av b på a — lengde ‖b‖·cos θ langs a. Stiplet
        linje står vinkelrett på a. Når θ=90°, kollapser projeksjonen til 0
        (ortogonale vektorer).
      </p>
    </div>
  );
}
