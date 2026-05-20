import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

// CellulaViz — fullskala interaktiv for 7.3.
// Heksagonalt nett av basestasjoner. Brukeren kan dra mobil-ikonet og se
// signalstyrken fra hver basestasjon i sanntid. Mobilen er alltid koblet til
// sterkeste basestasjon — beveger man seg over en cellegrense, skjer en
// håndover (markert med animasjon og en logg-linje).
//
// Pedagogisk hovedpoeng:
//   - signal faller med 1/r² (path loss)
//   - hver basestasjon dekker en celle, og to nabo-celler bruker ULIKE frekvenser
//     for å unngå interferens (frekvensgjenbruk-mønster 1/3 her)
//   - håndover er ren bok-føring — ingen pakker tapes hvis det skjer i tide

type Cell = {
  id: string;
  cx: number;
  cy: number;
  groupId: 1 | 2 | 3; // frekvensgruppe
};

const SVG_W = 720;
const SVG_H = 360;
const CELL_R = 70; // omkrets-radius for heksagon (senter til hjørne)

// Bygg et lite heksagonalt grid (3 grupper, frekvensgjenbruk 1/3)
function buildCells(): Cell[] {
  const w = Math.sqrt(3) * CELL_R; // horisontal step mellom to celler i samme rad
  const h = 1.5 * CELL_R; // vertikal step mellom rader
  const startX = 100;
  const startY = 80;
  const out: Cell[] = [];
  let i = 0;
  for (let row = 0; row < 3; row++) {
    const cols = row % 2 === 0 ? 4 : 4;
    for (let col = 0; col < cols; col++) {
      const offset = row % 2 === 0 ? 0 : w / 2;
      const cx = startX + col * w + offset;
      const cy = startY + row * h;
      if (cx > SVG_W - 60 || cy > SVG_H - 30) continue;
      // Tildel én av 3 grupper basert på rad+kol så naboer ikke har samme
      const groupId = (((row * 2 + col) % 3) + 1) as 1 | 2 | 3;
      out.push({ id: `c${i++}`, cx, cy, groupId });
    }
  }
  return out;
}

const GROUP_COLORS = {
  1: "#3b82f6", // blå
  2: "#10b981", // grønn
  3: "#f59e0b", // oransje
};

function hexPath(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6; // start fra topp
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x1 - x2, y1 - y2);
}

// Signal-styrke: enkelt invers-kvadrat-modell normalisert til 0..1
function signal(userX: number, userY: number, cellX: number, cellY: number): number {
  const d = dist(userX, userY, cellX, cellY);
  // Strong at d=0, dropping fast. Maks rekkevidde ~150 px før det blir < 5 %.
  const s = 1 / (1 + (d / 30) ** 2);
  return s;
}

export function CellulaViz() {
  const cells = useMemo(() => buildCells(), []);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [user, setUser] = useState({ x: 200, y: 180 });
  const draggingRef = useRef(false);
  const [moveCount, setMoveCount] = useState(0);
  const [handovers, setHandovers] = useState<{ from: string; to: string; at: number }[]>([]);
  const lastBestRef = useRef<string | null>(null);

  // Signal per celle
  const signals = useMemo(
    () =>
      cells
        .map((c) => ({ cell: c, s: signal(user.x, user.y, c.cx, c.cy) }))
        .sort((a, b) => b.s - a.s),
    [cells, user.x, user.y]
  );

  const best = signals[0]?.cell;
  const second = signals[1]?.cell;

  // Logg håndover når best endrer seg
  useEffect(() => {
    if (!best) return;
    const prev = lastBestRef.current;
    if (prev && prev !== best.id) {
      const from = prev;
      const to = best.id;
      setHandovers((h) => [{ from, to, at: moveCount }, ...h].slice(0, 6));
    }
    lastBestRef.current = best.id;
  }, [best?.id, moveCount]);

  // Drag-håndtering — bruker ref for å unngå closure-race på dragging
  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || !svgRef.current) return;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const screenCTM = svgRef.current.getScreenCTM();
    if (!screenCTM) return;
    const loc = pt.matrixTransform(screenCTM.inverse());
    setUser({
      x: Math.max(20, Math.min(SVG_W - 20, loc.x)),
      y: Math.max(20, Math.min(SVG_H - 20, loc.y)),
    });
    setMoveCount((c) => c + 1);
  };
  const onPointerUp = () => {
    draggingRef.current = false;
  };

  const reset = () => {
    setUser({ x: 200, y: 180 });
    setHandovers([]);
    setMoveCount(0);
    lastBestRef.current = null;
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold">CellulaViz — celler, signal og håndover</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dra mobilen rundt. Cellen med sterkest signal vinner. Krysser du grensen, skjer en
            håndover.
          </p>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 px-2 py-1.5 text-xs rounded border border-border hover:bg-muted"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* Hovedplot */}
      <div className="rounded-md border border-border bg-background p-2 overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full h-auto min-w-[640px] touch-none select-none"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* Celler (heksagoner) */}
          {cells.map((c) => {
            const isBest = best?.id === c.id;
            const isSecond = second?.id === c.id;
            const color = GROUP_COLORS[c.groupId];
            return (
              <g key={c.id}>
                <path
                  d={hexPath(c.cx, c.cy, CELL_R - 2)}
                  fill={color}
                  fillOpacity={isBest ? 0.22 : 0.08}
                  stroke={color}
                  strokeWidth={isBest ? 2.5 : 1}
                  strokeOpacity={isBest ? 0.9 : 0.5}
                />
                {/* Basestasjon-symbol */}
                <g transform={`translate(${c.cx},${c.cy})`}>
                  <circle r={6} fill={color} stroke="white" strokeWidth={1.5} />
                  <line x1={0} y1={-12} x2={0} y2={-6} stroke={color} strokeWidth={2} />
                  <path
                    d="M -7 -16 Q 0 -22 7 -16"
                    fill="none"
                    stroke={color}
                    strokeWidth={1.5}
                  />
                </g>
                <text
                  x={c.cx}
                  y={c.cy + 22}
                  fontSize={9}
                  fill="currentColor"
                  opacity={isBest ? 0.9 : 0.5}
                  textAnchor="middle"
                  fontWeight={isBest ? "bold" : "normal"}
                >
                  BS-{c.id.slice(1)} · f{c.groupId}
                  {isSecond ? " (2.)" : ""}
                </text>
              </g>
            );
          })}

          {/* Linje fra bruker til beste basestasjon */}
          {best && (
            <line
              x1={user.x}
              y1={user.y}
              x2={best.cx}
              y2={best.cy}
              stroke={GROUP_COLORS[best.groupId]}
              strokeWidth={2}
              strokeDasharray="4 3"
              opacity={0.7}
            />
          )}

          {/* Brukeren (mobil) */}
          <g
            transform={`translate(${user.x},${user.y})`}
            onPointerDown={onPointerDown}
            style={{ cursor: "grab" }}
          >
            <circle r={14} fill="currentColor" opacity={0.05} />
            <rect x={-7} y={-11} width={14} height={22} rx={3} fill="#111827" />
            <rect x={-5.5} y={-9} width={11} height={15} fill="#3b82f6" />
            <circle cx={0} cy={8} r={1.5} fill="#9ca3af" />
          </g>
        </svg>
      </div>

      {/* Signal-tabell + håndover-logg */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-md border border-border p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Signalstyrke (top 4)
          </div>
          <div className="space-y-1.5">
            {signals.slice(0, 4).map(({ cell, s }, i) => (
              <div key={cell.id} className="flex items-center gap-2 text-xs">
                <span
                  className="inline-block h-2.5 w-2.5 rounded"
                  style={{ background: GROUP_COLORS[cell.groupId] }}
                />
                <span className="w-16 font-mono">BS-{cell.id.slice(1)}</span>
                <div className="flex-1 h-2 rounded bg-muted overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${s * 100}%`,
                      background: GROUP_COLORS[cell.groupId],
                      opacity: i === 0 ? 1 : 0.5,
                    }}
                  />
                </div>
                <span className="w-12 text-right font-mono tabular-nums">
                  {(s * 100).toFixed(0)}%
                </span>
                {i === 0 && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    AKTIV
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-border p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Håndover-logg
          </div>
          {handovers.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              Ingen håndover ennå. Dra mobilen over en cellegrense.
            </p>
          ) : (
            <ul className="space-y-1 text-xs font-mono">
              {handovers.map((h, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-muted-foreground">#{h.at}</span>
                  <span>BS-{h.from.slice(1)}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-semibold">BS-{h.to.slice(1)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Frekvensgjenbruk-forklaring */}
      <details className="rounded-md border border-dashed border-border p-3">
        <summary className="text-sm font-medium cursor-pointer">
          Hvorfor har naboceller forskjellig farge (f1/f2/f3)?
        </summary>
        <div className="mt-2 text-sm space-y-2 text-muted-foreground">
          <p>
            Hvis to nabo-basestasjoner brukte samme frekvens, ville signalene deres rote til
            hverandre nær cellegrensen. Løsningen er <strong>frekvensgjenbruk</strong>: hele
            spektrumet deles i N grupper (her N=3), og du sørger for at ingen nabo har samme
            gruppe. Lenger ute kan f1 brukes på nytt — for da er den første f1-stasjonen så langt
            unna at signalet er for svakt til å forstyrre.
          </p>
          <p>
            I praksis: 4G/5G bruker bredbåndige OFDMA-skjemaer der det ikke er rene «kanaler» men
            «ressurs-blokker», men prinsippet er det samme — sektorer og frekvensbånd planlegges så
            naboceller ikke kolliderer.
          </p>
        </div>
      </details>
    </div>
  );
}
