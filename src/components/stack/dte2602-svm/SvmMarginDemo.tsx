import { useMemo, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Pedagogisk SVM-demo                                                */
/*                                                                     */
/*  Dette er INGEN ekte QP-solver. Vi tilnærmer den optimale lineære   */
/*  SVM-grensa ved å:                                                  */
/*    1) ta gjennomsnittet (centroid) av hver klasse,                  */
/*    2) bruke retningen mellom de to nærmeste motstander-punktene     */
/*       (kandidat-støttevektorer) til å definere normalen w,          */
/*    3) plassere hyperplanet midt mellom de to nærmeste punktene.    */
/*                                                                     */
/*  Det er en god heuristikk for "max margin"-intuisjon: når et punkt  */
/*  nær grensa flyttes ut/inn, hopper grensa. Når et fjernt punkt     */
/*  flyttes, skjer ingenting — det er nettopp det SVM gjør.            */
/*                                                                     */
/*  RBF-modusen er en visuell hint: vi tegner en kurvet grense som    */
/*  er en sum av Gauss-bumper sentrert på hvert punkt. Ikke en ekte   */
/*  RBF-SVM, men "føles" som riktig form.                              */
/* ------------------------------------------------------------------ */

type Pt = { x: number; y: number; cls: 0 | 1 };

const INIT_POINTS: Pt[] = [
  // klasse 0 — rød (nede til venstre)
  { x: 1.4, y: 1.6, cls: 0 },
  { x: 2.1, y: 1.2, cls: 0 },
  { x: 1.0, y: 2.4, cls: 0 },
  { x: 2.6, y: 2.2, cls: 0 }, // nært grensa — kandidat-støttevektor
  { x: 0.6, y: 1.0, cls: 0 },
  // klasse 1 — blå (oppe til høyre)
  { x: 4.0, y: 4.0, cls: 1 },
  { x: 3.4, y: 4.3, cls: 1 },
  { x: 4.6, y: 3.0, cls: 1 },
  { x: 3.0, y: 3.4, cls: 1 }, // nært grensa — kandidat-støttevektor
  { x: 4.2, y: 4.6, cls: 1 },
];

type LinearModel = {
  // Beslutningsgrense: w1*x + w2*y + b = 0
  // Positiv side (w·x + b > 0) er klasse 1.
  w1: number;
  w2: number;
  b: number;
  // Marginbredde i original-units
  margin: number;
  // Indekser i points-array som er "støttevektorer" (nærmest grensa)
  supportIdx: number[];
};

function fitLinearSvmHeuristic(points: Pt[]): LinearModel | null {
  const c0 = points.filter((p) => p.cls === 0);
  const c1 = points.filter((p) => p.cls === 1);
  if (c0.length === 0 || c1.length === 0) return null;

  // Trinn 1: finn paret (a fra cls=0, b fra cls=1) som har minst avstand.
  // Det paret er kandidat-støttevektorer.
  let best: { a: Pt; b: Pt; ai: number; bi: number; d: number } | null = null;
  for (let i = 0; i < points.length; i++) {
    for (let j = 0; j < points.length; j++) {
      if (points[i].cls !== 0 || points[j].cls !== 1) continue;
      const dx = points[j].x - points[i].x;
      const dy = points[j].y - points[i].y;
      const d = Math.hypot(dx, dy);
      if (!best || d < best.d) {
        best = { a: points[i], b: points[j], ai: i, bi: j, d };
      }
    }
  }
  if (!best) return null;

  // Trinn 2: normalvektor w peker fra cls=0 til cls=1.
  const wx = best.b.x - best.a.x;
  const wy = best.b.y - best.a.y;
  const wn = Math.hypot(wx, wy) || 1;
  const w1 = wx / wn;
  const w2 = wy / wn;
  // Midtpunktet er på hyperplanet: w·m + b = 0
  const mx = (best.a.x + best.b.x) / 2;
  const my = (best.a.y + best.b.y) / 2;
  const b = -(w1 * mx + w2 * my);
  // Margin = halv avstand mellom paret. (For ekte SVM er margin = 1/||w||;
  // her bruker vi geometrisk avstand direkte fordi w er normalisert.)
  const margin = best.d / 2;

  // Trinn 3: identifiser alle "tett-på"-punkter (≤ 1.05 × margin) som
  // støttevektorer for visualisering.
  const supportIdx: number[] = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const signedDist = w1 * p.x + w2 * p.y + b;
    const dist = Math.abs(signedDist);
    if (dist <= margin * 1.06) supportIdx.push(i);
  }
  return { w1, w2, b, margin, supportIdx };
}

// RBF-aktig score: positiv betyr klasse 1.
// Bare brukt til å tegne en "kurvet" beslutningsgrense via marching squares.
function rbfScore(points: Pt[], x: number, y: number, gamma: number): number {
  let s = 0;
  for (const p of points) {
    const d2 = (p.x - x) ** 2 + (p.y - y) ** 2;
    const k = Math.exp(-gamma * d2);
    s += p.cls === 1 ? k : -k;
  }
  return s;
}

export function SvmMarginDemo() {
  const [points, setPoints] = useState<Pt[]>(INIT_POINTS);
  const [mode, setMode] = useState<"linear" | "rbf">("linear");
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Plot-konstanter
  const W = 460;
  const H = 360;
  const PAD = 36;
  const X_MIN = 0;
  const X_MAX = 5;
  const Y_MIN = 0;
  const Y_MAX = 5;
  const sx = (v: number) => PAD + ((v - X_MIN) / (X_MAX - X_MIN)) * (W - 2 * PAD);
  const sy = (v: number) => H - PAD - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * (H - 2 * PAD);
  const inv_x = (px: number) => X_MIN + ((px - PAD) / (W - 2 * PAD)) * (X_MAX - X_MIN);
  const inv_y = (py: number) => Y_MIN + ((H - PAD - py) / (H - 2 * PAD)) * (Y_MAX - Y_MIN);

  const linearModel = useMemo(() => fitLinearSvmHeuristic(points), [points]);

  // For lineær: tegn beslutningslinja og marginlinjene i data-space.
  // For x i [X_MIN, X_MAX]: y = -(w1*x + b) / w2  (forutsetter w2 ≠ 0).
  const linearLines = useMemo(() => {
    if (!linearModel) return null;
    const { w1, w2, b, margin } = linearModel;
    if (Math.abs(w2) < 1e-6) {
      // vertikal linje
      const xVal = -b / w1;
      return {
        boundary: { x1: xVal, y1: Y_MIN, x2: xVal, y2: Y_MAX },
        marginPos: { x1: xVal + margin, y1: Y_MIN, x2: xVal + margin, y2: Y_MAX },
        marginNeg: { x1: xVal - margin, y1: Y_MIN, x2: xVal - margin, y2: Y_MAX },
      };
    }
    const yFor = (x: number) => -(w1 * x + b) / w2;
    // Marginlinjer parallelle: w·x + b = ±margin
    const yForOffset = (x: number, off: number) => -(w1 * x + b - off) / w2;
    return {
      boundary: { x1: X_MIN, y1: yFor(X_MIN), x2: X_MAX, y2: yFor(X_MAX) },
      marginPos: {
        x1: X_MIN,
        y1: yForOffset(X_MIN, margin),
        x2: X_MAX,
        y2: yForOffset(X_MAX, margin),
      },
      marginNeg: {
        x1: X_MIN,
        y1: yForOffset(X_MIN, -margin),
        x2: X_MAX,
        y2: yForOffset(X_MAX, -margin),
      },
    };
  }, [linearModel]);

  // RBF-grensekurve via marching-squares på et 36x36 grid:
  // tegnes som mange små stiplete segmenter der scoren krysser 0.
  const rbfSegments = useMemo(() => {
    if (mode !== "rbf") return [] as { x1: number; y1: number; x2: number; y2: number }[];
    const gamma = 1.2; // håndtunet for visuell behagelighet
    const N = 36;
    const dx = (X_MAX - X_MIN) / N;
    const dy = (Y_MAX - Y_MIN) / N;
    // Compute scores at grid corners
    const grid: number[][] = [];
    for (let j = 0; j <= N; j++) {
      const row: number[] = [];
      for (let i = 0; i <= N; i++) {
        row.push(rbfScore(points, X_MIN + i * dx, Y_MIN + j * dy, gamma));
      }
      grid.push(row);
    }
    const segs: { x1: number; y1: number; x2: number; y2: number }[] = [];
    // For hver cell-kant: finn der scoren krysser 0 (lineær interpolasjon)
    const cross = (
      ax: number,
      ay: number,
      av: number,
      bx: number,
      by: number,
      bv: number,
    ): [number, number] | null => {
      if ((av > 0) === (bv > 0)) return null;
      const t = av / (av - bv);
      return [ax + t * (bx - ax), ay + t * (by - ay)];
    };
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const x0 = X_MIN + i * dx;
        const x1 = x0 + dx;
        const y0 = Y_MIN + j * dy;
        const y1 = y0 + dy;
        const v00 = grid[j][i];
        const v10 = grid[j][i + 1];
        const v01 = grid[j + 1][i];
        const v11 = grid[j + 1][i + 1];
        const edges: [number, number][] = [];
        const e1 = cross(x0, y0, v00, x1, y0, v10);
        const e2 = cross(x1, y0, v10, x1, y1, v11);
        const e3 = cross(x0, y1, v01, x1, y1, v11);
        const e4 = cross(x0, y0, v00, x0, y1, v01);
        if (e1) edges.push(e1);
        if (e2) edges.push(e2);
        if (e3) edges.push(e3);
        if (e4) edges.push(e4);
        if (edges.length === 2) {
          segs.push({ x1: edges[0][0], y1: edges[0][1], x2: edges[1][0], y2: edges[1][1] });
        } else if (edges.length === 4) {
          // saddle — bare koble par sammen tilfeldig (god nok for visualisering)
          segs.push({ x1: edges[0][0], y1: edges[0][1], x2: edges[1][0], y2: edges[1][1] });
          segs.push({ x1: edges[2][0], y1: edges[2][1], x2: edges[3][0], y2: edges[3][1] });
        }
      }
    }
    return segs;
  }, [mode, points]);

  // Drag-håndtering
  const onPointerDown = (i: number) => (e: React.PointerEvent<SVGCircleElement>) => {
    e.preventDefault();
    setDraggingIdx(i);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (draggingIdx == null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const nx = Math.min(X_MAX, Math.max(X_MIN, inv_x(px)));
    const ny = Math.min(Y_MAX, Math.max(Y_MIN, inv_y(py)));
    setPoints((arr) => {
      const next = arr.slice();
      next[draggingIdx] = { ...next[draggingIdx], x: nx, y: ny };
      return next;
    });
  };
  const onPointerUp = () => setDraggingIdx(null);

  // Reset
  const reset = () => setPoints(INIT_POINTS);

  // Skravurmønster for marginsone — vi maler en bånd-rect rotert med w.
  // Enklere visuelt: vi fyller polygon mellom de to marginlinjene i SVG-space.
  const marginPoly = useMemo(() => {
    if (!linearLines) return null;
    const { marginPos, marginNeg } = linearLines;
    const p1 = `${sx(marginPos.x1)},${sy(marginPos.y1)}`;
    const p2 = `${sx(marginPos.x2)},${sy(marginPos.y2)}`;
    const p3 = `${sx(marginNeg.x2)},${sy(marginNeg.y2)}`;
    const p4 = `${sx(marginNeg.x1)},${sy(marginNeg.y1)}`;
    return `${p1} ${p2} ${p3} ${p4}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linearLines]);

  const supportSet = useMemo(
    () => new Set(linearModel?.supportIdx ?? []),
    [linearModel],
  );

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="inline-flex rounded-md border border-border overflow-hidden">
          <button
            className={`px-3 py-1.5 text-xs ${
              mode === "linear"
                ? "bg-brand text-brand-foreground"
                : "bg-card text-muted-foreground"
            }`}
            onClick={() => setMode("linear")}
          >
            Lineær kjerne
          </button>
          <button
            className={`px-3 py-1.5 text-xs ${
              mode === "rbf"
                ? "bg-brand text-brand-foreground"
                : "bg-card text-muted-foreground"
            }`}
            onClick={() => setMode("rbf")}
          >
            RBF-kjerne (intuisjon)
          </button>
        </div>
        <button
          onClick={reset}
          className="ml-auto px-3 py-1.5 text-xs rounded bg-muted text-muted-foreground"
        >
          Tilbakestill punkter
        </button>
      </div>

      <div className="flex justify-center">
        <svg
          ref={svgRef}
          width={W}
          height={H}
          className="block touch-none select-none"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {/* bakgrunnsregioner farger — bare hint */}
          <rect
            x={PAD}
            y={PAD}
            width={W - 2 * PAD}
            height={H - 2 * PAD}
            fill="rgba(244,63,94,0.05)"
          />

          {/* defs for skravurmønster */}
          <defs>
            <pattern
              id="margin-hatch"
              patternUnits="userSpaceOnUse"
              width="8"
              height="8"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="8" stroke="#facc15" strokeWidth="1.2" />
            </pattern>
          </defs>

          {/* lineær modus: marginbånd + linjer */}
          {mode === "linear" && marginPoly && (
            <polygon points={marginPoly} fill="url(#margin-hatch)" opacity={0.55} />
          )}
          {mode === "linear" && linearLines && (
            <>
              {/* margin-grenser */}
              <line
                x1={sx(linearLines.marginPos.x1)}
                y1={sy(linearLines.marginPos.y1)}
                x2={sx(linearLines.marginPos.x2)}
                y2={sy(linearLines.marginPos.y2)}
                stroke="#facc15"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
              <line
                x1={sx(linearLines.marginNeg.x1)}
                y1={sy(linearLines.marginNeg.y1)}
                x2={sx(linearLines.marginNeg.x2)}
                y2={sy(linearLines.marginNeg.y2)}
                stroke="#facc15"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
              {/* hovedgrense */}
              <line
                x1={sx(linearLines.boundary.x1)}
                y1={sy(linearLines.boundary.y1)}
                x2={sx(linearLines.boundary.x2)}
                y2={sy(linearLines.boundary.y2)}
                stroke="#22c55e"
                strokeWidth={2.5}
              />
            </>
          )}

          {/* RBF-modus: kurvet grense */}
          {mode === "rbf" &&
            rbfSegments.map((s, i) => (
              <line
                key={i}
                x1={sx(s.x1)}
                y1={sy(s.y1)}
                x2={sx(s.x2)}
                y2={sy(s.y2)}
                stroke="#22c55e"
                strokeWidth={2}
              />
            ))}

          {/* akser */}
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#888" />
          <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#888" />
          <text x={W / 2} y={H - 8} textAnchor="middle" fontSize={10} fill="#888">
            feature 1
          </text>
          <text
            x={12}
            y={H / 2}
            textAnchor="middle"
            fontSize={10}
            fill="#888"
            transform={`rotate(-90, 12, ${H / 2})`}
          >
            feature 2
          </text>

          {/* punkter */}
          {points.map((p, i) => {
            const isSupport = mode === "linear" && supportSet.has(i);
            return (
              <circle
                key={i}
                cx={sx(p.x)}
                cy={sy(p.y)}
                r={isSupport ? 8 : 6}
                fill={p.cls === 1 ? "#3b82f6" : "#f43f5e"}
                stroke={isSupport ? "#facc15" : "#fff"}
                strokeWidth={isSupport ? 2.5 : 1.2}
                style={{ cursor: "grab" }}
                onPointerDown={onPointerDown(i)}
              />
            );
          })}
        </svg>
      </div>

      <div className="mt-3 grid sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
        <div className="rounded-md border border-border bg-background/40 p-3">
          {mode === "linear" ? (
            <>
              <div className="font-semibold text-foreground mb-1">Hva ser du?</div>
              Den heltrukne grønne linja er <strong>beslutningsgrensa</strong>. De
              gule, stiplede linjene er <strong>margin-grensene</strong>.
              Punktene med gul ring er <strong>støttevektorene</strong> — de
              eneste punktene som faktisk bestemmer hvor grensa havner.
            </>
          ) : (
            <>
              <div className="font-semibold text-foreground mb-1">RBF-modus (intuisjon)</div>
              Med en <strong>RBF-kjerne</strong> kan grensa bukte seg rundt
              klyngene istedenfor å være en rett linje. Drag et punkt langt ut
              fra sin klynge og se hvordan grensa former seg lokalt rundt det.
            </>
          )}
        </div>
        <div className="rounded-md border border-border bg-background/40 p-3">
          <div className="font-semibold text-foreground mb-1">Prøv selv</div>
          Dra et punkt som <em>ikke</em> er støttevektor langt vekk — grensa
          flytter seg ikke. Dra et støttevektor-punkt litt — grensa hopper.
          Det er kjernen i SVM: bare de nærmeste punktene teller.
        </div>
      </div>
    </div>
  );
}
