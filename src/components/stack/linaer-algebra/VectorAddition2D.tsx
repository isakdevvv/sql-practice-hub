import { useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

// --------------------------------------------------------------------------
// VectorAddition2D — drag spissene på to vektorer v og w i ℝ².
// Vi tegner parallelogramregelen live: v translatert fra w-spissen og
// w translatert fra v-spissen lukker firkanten, og diagonalen er v + w.
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

function Arrow({
  from,
  to,
  color,
  dashed = false,
  width = 2,
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
  // shorten line by head so the arrow tip joins cleanly
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
        strokeDasharray={dashed ? "5 4" : undefined}
        strokeLinecap="round"
      />
      <polygon points={`${x2},${y2} ${hx1},${hy1} ${hx2},${hy2}`} fill={color} />
    </g>
  );
}

export function VectorAddition2D() {
  const [v, setV] = useState<Vec>({ x: 3, y: 1 });
  const [w, setW] = useState<Vec>({ x: 1, y: 3 });
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<"v" | "w" | null>(null);

  function startDrag(which: "v" | "w") {
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
    if (dragRef.current === "v") setV({ x, y });
    else setW({ x, y });
  }

  function endDrag() {
    dragRef.current = null;
  }

  function reset() {
    setV({ x: 3, y: 1 });
    setW({ x: 1, y: 3 });
  }

  const sum: Vec = { x: v.x + w.x, y: v.y + w.y };
  const lenV = Math.hypot(v.x, v.y);
  const lenW = Math.hypot(w.x, w.y);
  const lenSum = Math.hypot(sum.x, sum.y);

  // grid lines
  const grid: number[] = [];
  for (let i = MIN; i <= MAX; i++) grid.push(i);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-4 mb-3">
        <div className="text-xs font-medium">
          Dra <span style={{ color: "hsl(215 85% 55%)" }}>● v-tip</span> og{" "}
          <span style={{ color: "hsl(28 90% 55%)" }}>● w-tip</span> — se v+w
          (grønn) som diagonal av parallellogrammet.
        </div>
        <button
          onClick={reset}
          className="ml-auto inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-muted"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto touch-none select-none"
        onPointerMove={onMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* grid */}
        {grid.map((g) => (
          <g key={`gx${g}`}>
            <line
              x1={sx(g)}
              y1={sy(MIN)}
              x2={sx(g)}
              y2={sy(MAX)}
              stroke="currentColor"
              strokeOpacity={g === 0 ? 0.35 : 0.08}
              strokeWidth={g === 0 ? 1.2 : 1}
            />
            <line
              x1={sx(MIN)}
              y1={sy(g)}
              x2={sx(MAX)}
              y2={sy(g)}
              stroke="currentColor"
              strokeOpacity={g === 0 ? 0.35 : 0.08}
              strokeWidth={g === 0 ? 1.2 : 1}
            />
          </g>
        ))}
        {/* axis labels */}
        <text x={W - 18} y={sy(0) - 4} fontSize="10" fill="currentColor" opacity={0.5}>
          x
        </text>
        <text x={sx(0) + 4} y={14} fontSize="10" fill="currentColor" opacity={0.5}>
          y
        </text>

        {/* parallelogram dashed copies */}
        <Arrow from={w} to={sum} color="hsl(215 85% 55%)" dashed width={1.6} />
        <Arrow from={v} to={sum} color="hsl(28 90% 55%)" dashed width={1.6} />

        {/* main vectors v, w */}
        <Arrow from={{ x: 0, y: 0 }} to={v} color="hsl(215 85% 55%)" width={2.8} />
        <Arrow from={{ x: 0, y: 0 }} to={w} color="hsl(28 90% 55%)" width={2.8} />

        {/* sum v+w */}
        <Arrow from={{ x: 0, y: 0 }} to={sum} color="hsl(150 65% 42%)" width={2.8} />

        {/* draggable handles */}
        <circle
          cx={sx(v.x)}
          cy={sy(v.y)}
          r={10}
          fill="hsl(215 85% 55%)"
          fillOpacity={0.95}
          stroke="white"
          strokeWidth={2}
          onPointerDown={startDrag("v")}
          style={{ cursor: "grab" }}
        />
        <circle
          cx={sx(w.x)}
          cy={sy(w.y)}
          r={10}
          fill="hsl(28 90% 55%)"
          fillOpacity={0.95}
          stroke="white"
          strokeWidth={2}
          onPointerDown={startDrag("w")}
          style={{ cursor: "grab" }}
        />
        <circle
          cx={sx(sum.x)}
          cy={sy(sum.y)}
          r={6}
          fill="hsl(150 65% 42%)"
          stroke="white"
          strokeWidth={2}
        />

        {/* labels next to vectors */}
        <text x={sx(v.x) + 14} y={sy(v.y) - 6} fontSize="11" fontWeight={600} fill="hsl(215 85% 55%)">
          v
        </text>
        <text x={sx(w.x) + 14} y={sy(w.y) - 6} fontSize="11" fontWeight={600} fill="hsl(28 90% 55%)">
          w
        </text>
        <text x={sx(sum.x) + 10} y={sy(sum.y) - 8} fontSize="11" fontWeight={600} fill="hsl(150 65% 42%)">
          v+w
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-mono">
        <div className="rounded border border-border p-2">
          <div style={{ color: "hsl(215 85% 55%)" }} className="font-semibold">v</div>
          <div>= ({v.x}, {v.y})</div>
          <div className="text-muted-foreground">‖v‖ = {lenV.toFixed(2)}</div>
        </div>
        <div className="rounded border border-border p-2">
          <div style={{ color: "hsl(28 90% 55%)" }} className="font-semibold">w</div>
          <div>= ({w.x}, {w.y})</div>
          <div className="text-muted-foreground">‖w‖ = {lenW.toFixed(2)}</div>
        </div>
        <div className="rounded border border-border p-2">
          <div style={{ color: "hsl(150 65% 42%)" }} className="font-semibold">v + w</div>
          <div>= ({sum.x}, {sum.y})</div>
          <div className="text-muted-foreground">‖v+w‖ = {lenSum.toFixed(2)}</div>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Triangulær ulikhet: ‖v+w‖ ≤ ‖v‖+‖w‖ = {(lenV + lenW).toFixed(2)} — likhet bare når v og w er parallelle (samme retning).
      </p>
    </div>
  );
}
