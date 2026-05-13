import { useMemo, useRef, useState } from "react";

/**
 * Interaktiv k-Nearest Neighbors-visualisering.
 *
 * Tre lag (basis / dypere / eksamen) styrt av tab-velgeren øverst.
 *  - Basis:   fast k=3, klikkbart query-punkt, viser k naboer som ringer.
 *  - Dypere:  slider for k, valg av distansemetrikk, vis distanseberegning.
 *  - Eksamen: fast scenario med fasit + forklaring.
 */

type Point = { x: number; y: number; label: "A" | "B" };
type Mode = "basis" | "deep" | "exam";
type Metric = "euclidean" | "manhattan";

const DATA: Point[] = [
  // Klasse A — blå (nedre venstre/midten)
  { x: 1.6, y: 2.2, label: "A" },
  { x: 2.2, y: 1.4, label: "A" },
  { x: 2.8, y: 3.0, label: "A" },
  { x: 3.6, y: 2.4, label: "A" },
  { x: 1.0, y: 3.2, label: "A" },
  { x: 4.2, y: 1.8, label: "A" },
  { x: 2.4, y: 4.0, label: "A" },
  { x: 4.8, y: 3.2, label: "A" },
  { x: 3.2, y: 4.6, label: "A" },
  { x: 1.4, y: 4.4, label: "A" },
  // Klasse B — oransje (øvre høyre/midten)
  { x: 6.0, y: 5.4, label: "B" },
  { x: 6.6, y: 6.6, label: "B" },
  { x: 7.8, y: 5.0, label: "B" },
  { x: 5.4, y: 6.8, label: "B" },
  { x: 7.0, y: 7.4, label: "B" },
  { x: 5.8, y: 4.4, label: "B" },
  { x: 7.4, y: 6.0, label: "B" },
  { x: 8.2, y: 6.4, label: "B" },
  { x: 5.0, y: 5.6, label: "B" },
  { x: 6.4, y: 4.6, label: "B" },
];

const EXAM_QUERY = { x: 4.6, y: 4.2 }; // tett opp i grensa A/B
const EXAM_K = 5;

const W = 480;
const H = 360;
const PAD = 28;
const X_MIN = 0;
const X_MAX = 9;
const Y_MIN = 0;
const Y_MAX = 8;

function sx(x: number) {
  return PAD + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - 2 * PAD);
}
function sy(y: number) {
  // SVG y er invertert
  return H - PAD - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * (H - 2 * PAD);
}
function unscaleX(px: number) {
  return X_MIN + ((px - PAD) / (W - 2 * PAD)) * (X_MAX - X_MIN);
}
function unscaleY(py: number) {
  return Y_MIN + ((H - PAD - py) / (H - 2 * PAD)) * (Y_MAX - Y_MIN);
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }, m: Metric) {
  if (m === "manhattan") {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function KnnExplorer() {
  const [mode, setMode] = useState<Mode>("basis");
  const [k, setK] = useState(3);
  const [metric, setMetric] = useState<Metric>("euclidean");
  const [query, setQuery] = useState<{ x: number; y: number }>({ x: 5.0, y: 4.0 });
  const [showSteps, setShowSteps] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef(false);

  // Eksamen-modus låser scenario
  const activeK = mode === "exam" ? EXAM_K : mode === "basis" ? 3 : k;
  const activeMetric: Metric = mode === "exam" ? "euclidean" : metric;
  const activeQuery = mode === "exam" ? EXAM_QUERY : query;

  // Sortér naboer etter distanse
  const ranked = useMemo(() => {
    return DATA.map((p, idx) => ({
      idx,
      point: p,
      d: distance(activeQuery, p, activeMetric),
    })).sort((a, b) => a.d - b.d);
  }, [activeQuery, activeMetric]);

  const neighbors = ranked.slice(0, activeK);
  const votes = neighbors.reduce(
    (acc, n) => {
      acc[n.point.label] += 1;
      return acc;
    },
    { A: 0, B: 0 } as Record<"A" | "B", number>,
  );
  const prediction: "A" | "B" | "Uavgjort" =
    votes.A === votes.B ? "Uavgjort" : votes.A > votes.B ? "A" : "B";

  const examCorrect = mode === "exam" && prediction === "A"; // tett til A-tyngdepunkt
  // (Eksamen-fasit beregnes faktisk live siden vi viser true output.)

  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (mode === "exam") return;
    dragging.current = true;
    updateQueryFromEvent(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (mode === "exam") return;
    if (!dragging.current) return;
    updateQueryFromEvent(e);
  }
  function handlePointerUp(e: React.PointerEvent<SVGSVGElement>) {
    dragging.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  function updateQueryFromEvent(e: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    const nx = Math.max(X_MIN + 0.1, Math.min(X_MAX - 0.1, unscaleX(px)));
    const ny = Math.max(Y_MIN + 0.1, Math.min(Y_MAX - 0.1, unscaleY(py)));
    setQuery({ x: nx, y: ny });
  }

  // Manhattan vises som romber, euklidsk som sirkler — visuell metrikk-hint
  const NeighborShape = activeMetric === "manhattan" ? RhombusMarker : CircleMarker;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          k-NN-utforsker
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["basis", "deep", "exam"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={
                "px-2.5 py-1 rounded border text-xs " +
                (mode === m
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-background hover:border-brand/40")
              }
            >
              {m === "basis" ? "Basis" : m === "deep" ? "Dypere" : "Eksamen"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-4">
        <div className="rounded-lg border border-border bg-background overflow-hidden">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto touch-none select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* gridlinjer */}
            {Array.from({ length: X_MAX - X_MIN + 1 }).map((_, i) => (
              <line
                key={`vx${i}`}
                x1={sx(X_MIN + i)}
                x2={sx(X_MIN + i)}
                y1={sy(Y_MIN)}
                y2={sy(Y_MAX)}
                stroke="currentColor"
                opacity={0.08}
              />
            ))}
            {Array.from({ length: Y_MAX - Y_MIN + 1 }).map((_, i) => (
              <line
                key={`vy${i}`}
                x1={sx(X_MIN)}
                x2={sx(X_MAX)}
                y1={sy(Y_MIN + i)}
                y2={sy(Y_MIN + i)}
                stroke="currentColor"
                opacity={0.08}
              />
            ))}

            {/* "Radius" indikator for euclidean (sirkel rundt query), manhattan = rombe */}
            {neighbors.length > 0 && (() => {
              const farthest = neighbors[neighbors.length - 1];
              if (activeMetric === "euclidean") {
                const rPx =
                  Math.sqrt(
                    Math.pow(sx(farthest.point.x) - sx(activeQuery.x), 2) +
                      Math.pow(sy(farthest.point.y) - sy(activeQuery.y), 2),
                  );
                return (
                  <circle
                    cx={sx(activeQuery.x)}
                    cy={sy(activeQuery.y)}
                    r={rPx}
                    fill="none"
                    stroke="hsl(45 90% 55%)"
                    strokeWidth={1.2}
                    strokeDasharray="4 3"
                    opacity={0.7}
                  />
                );
              }
              // Manhattan -> rhombus med radius i x+y
              const r = farthest.d;
              const cx = sx(activeQuery.x);
              const cy = sy(activeQuery.y);
              const rxPx = sx(activeQuery.x + r) - cx;
              const ryPx = cy - sy(activeQuery.y + r);
              const pts = [
                `${cx},${cy - ryPx}`,
                `${cx + rxPx},${cy}`,
                `${cx},${cy + ryPx}`,
                `${cx - rxPx},${cy}`,
              ].join(" ");
              return (
                <polygon
                  points={pts}
                  fill="none"
                  stroke="hsl(45 90% 55%)"
                  strokeWidth={1.2}
                  strokeDasharray="4 3"
                  opacity={0.7}
                />
              );
            })()}

            {/* linjer til naboer */}
            {showSteps && neighbors.map((n) => (
              <line
                key={`l${n.idx}`}
                x1={sx(activeQuery.x)}
                y1={sy(activeQuery.y)}
                x2={sx(n.point.x)}
                y2={sy(n.point.y)}
                stroke="hsl(45 90% 55%)"
                strokeWidth={1}
                opacity={0.5}
              />
            ))}

            {/* alle datapunkter */}
            {DATA.map((p, i) => {
              const isNeighbor = neighbors.some((n) => n.idx === i);
              const colorA = "hsl(215 80% 55%)";
              const colorB = "hsl(28 90% 55%)";
              const fill = p.label === "A" ? colorA : colorB;
              return (
                <g key={i}>
                  {isNeighbor && (
                    <NeighborShape
                      cx={sx(p.x)}
                      cy={sy(p.y)}
                      r={11}
                      stroke="hsl(45 90% 55%)"
                      fill="none"
                    />
                  )}
                  <circle cx={sx(p.x)} cy={sy(p.y)} r={6} fill={fill} opacity={0.9} />
                </g>
              );
            })}

            {/* query-punkt */}
            <circle
              cx={sx(activeQuery.x)}
              cy={sy(activeQuery.y)}
              r={9}
              fill="hsl(220 10% 12%)"
              stroke="white"
              strokeWidth={2}
              style={{ cursor: mode === "exam" ? "default" : "grab" }}
            />
            <text
              x={sx(activeQuery.x) + 12}
              y={sy(activeQuery.y) - 8}
              fontSize={11}
              fontFamily="monospace"
              fill="currentColor"
            >
              x?
            </text>
          </svg>
        </div>

        <div className="space-y-3">
          <div className="rounded-md border border-border bg-background px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Prediksjon (k={activeK})
            </div>
            <div className="flex items-baseline gap-2">
              <div
                className="text-2xl font-bold"
                style={{
                  color:
                    prediction === "A"
                      ? "hsl(215 80% 55%)"
                      : prediction === "B"
                        ? "hsl(28 90% 55%)"
                        : "hsl(0 0% 50%)",
                }}
              >
                {prediction}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                A:{votes.A} · B:{votes.B}
              </div>
            </div>
          </div>

          {mode !== "exam" && (
            <>
              {mode === "deep" && (
                <label className="block text-sm">
                  <span className="text-xs text-muted-foreground">
                    k = {k}
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    value={k}
                    onChange={(e) => setK(Number(e.target.value))}
                    className="w-full"
                  />
                </label>
              )}

              {mode === "deep" && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Distansemetrikk
                  </div>
                  <div className="flex gap-1">
                    {(["euclidean", "manhattan"] as Metric[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMetric(m)}
                        className={
                          "flex-1 px-2 py-1 rounded border text-xs " +
                          (metric === m
                            ? "border-brand bg-brand/10 text-brand"
                            : "border-border bg-background hover:border-brand/40")
                        }
                      >
                        {m === "euclidean" ? "Euklidsk" : "Manhattan"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowSteps((v) => !v)}
                className="w-full text-xs rounded border border-border bg-background py-1.5 hover:border-brand/40"
              >
                {showSteps ? "Skjul" : "Vis"} distanselinjer
              </button>
            </>
          )}

          {mode === "exam" && (
            <div className="text-xs text-muted-foreground space-y-2">
              <div>
                Query x?= ({EXAM_QUERY.x}, {EXAM_QUERY.y}), k = {EXAM_K},
                euklidsk metrikk.
              </div>
              <div>
                Hvilken klasse predikerer k-NN? Svaret beregnes live til
                høyre.
              </div>
              <div
                className={
                  "rounded border px-2 py-1 " +
                  (examCorrect
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-600")
                }
              >
                Fasit: A (4 av 5 nærmeste er A).
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <Legend color="hsl(215 80% 55%)" label="A" />
            <Legend color="hsl(28 90% 55%)" label="B" />
            <Legend color="hsl(220 10% 12%)" label="x?" />
          </div>
        </div>
      </div>

      {showSteps && mode !== "exam" && (
        <div className="rounded-md border border-border bg-background/60 p-3 text-xs font-mono space-y-0.5 max-h-40 overflow-y-auto">
          <div className="text-muted-foreground mb-1">
            Distanser fra x? til alle treningspunkter (sortert):
          </div>
          {ranked.slice(0, Math.max(activeK + 3, 8)).map((r, i) => {
            const isN = i < activeK;
            return (
              <div
                key={r.idx}
                className={isN ? "text-foreground" : "text-muted-foreground"}
              >
                {String(i + 1).padStart(2, " ")}. {r.point.label} ({r.point.x.toFixed(1)},{" "}
                {r.point.y.toFixed(1)}) — d = {r.d.toFixed(3)}{" "}
                {isN ? "← nabo" : ""}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground leading-relaxed">
        Dra det svarte query-punktet (x?) rundt for å se hvordan prediksjonen
        endres. Med liten k blir grensa zigzag, med stor k blir den glatt.
      </p>
    </div>
  );
}

function CircleMarker(props: {
  cx: number;
  cy: number;
  r: number;
  stroke: string;
  fill: string;
}) {
  return <circle {...props} strokeWidth={2} />;
}

function RhombusMarker({
  cx,
  cy,
  r,
  stroke,
  fill,
}: {
  cx: number;
  cy: number;
  r: number;
  stroke: string;
  fill: string;
}) {
  const pts = [
    `${cx},${cy - r}`,
    `${cx + r},${cy}`,
    `${cx},${cy + r}`,
    `${cx - r},${cy}`,
  ].join(" ");
  return <polygon points={pts} stroke={stroke} fill={fill} strokeWidth={2} />;
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span
        className="inline-block w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span>{label}</span>
    </div>
  );
}
