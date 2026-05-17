import { useMemo, useState } from "react";
import { cooksDistance, olsFit, type Pt } from "./regUtils";

/**
 * CooksDistanceHeatmap — viser Cook's distance som boble-størrelse på scatteret.
 *
 * Brukeren skyver en slider for terskelen (4/n eller 1.0), ser hvilke punkter
 * som er flagget, og kan klikke "Fjern flagged" for å se hvordan regresjonen endres
 * når influential points fjernes. En "Angre"-knapp henter dem tilbake.
 */

const INITIAL: Pt[] = [
  { x: 1, y: 2.0 },
  { x: 2, y: 3.1 },
  { x: 3, y: 3.8 },
  { x: 4, y: 5.2 },
  { x: 5, y: 5.7 },
  { x: 6, y: 6.5 },
  { x: 7, y: 7.4 },
  { x: 8, y: 8.5 },
  { x: 9, y: 9.0 },
  { x: 10, y: 10.5 },
  // En outlier nær x̄, ingen leverage
  { x: 5.5, y: 12 },
  // En high-leverage influential point
  { x: 13, y: 4 },
];

type ThreshMode = "4n" | "one";

export function CooksDistanceHeatmap() {
  const [pts, setPts] = useState<Pt[]>(INITIAL);
  const [history, setHistory] = useState<Pt[][]>([]);
  const [mode, setMode] = useState<ThreshMode>("4n");

  const fit = useMemo(() => olsFit(pts), [pts]);
  const cooks = useMemo(() => cooksDistance(pts, fit), [pts, fit]);
  const threshold = mode === "4n" ? 4 / pts.length : 1.0;
  const flaggedIdx = cooks
    .map((d, i) => (d > threshold ? i : -1))
    .filter((i) => i >= 0);

  // Fit på data UTEN flagged — for å vise hvordan linjen skifter
  const ptsClean = pts.filter((_, i) => !flaggedIdx.includes(i));
  const fitClean = useMemo(
    () => (ptsClean.length >= 2 ? olsFit(ptsClean) : null),
    [ptsClean],
  );

  const W = 500;
  const H = 320;
  const PAD = 40;
  const X_MIN = 0;
  const X_MAX = 14;
  const Y_MIN = 0;
  const Y_MAX = 14;

  const sx = (x: number) => PAD + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - 2 * PAD);
  const sy = (y: number) => H - PAD - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * (H - 2 * PAD);

  const maxCook = Math.max(...cooks, 1e-6);
  const bubbleR = (d: number) => 4 + 22 * Math.sqrt(d / maxCook);

  const removeFlagged = () => {
    if (flaggedIdx.length === 0) return;
    setHistory((h) => [...h, pts]);
    setPts(pts.filter((_, i) => !flaggedIdx.includes(i)));
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setPts(prev);
  };

  const reset = () => {
    setHistory([]);
    setPts(INITIAL);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground mr-2">Terskel:</span>
        <button
          type="button"
          onClick={() => setMode("4n")}
          className={`px-2 py-1 rounded-md border font-mono ${
            mode === "4n"
              ? "border-brand bg-brand/10"
              : "border-border bg-background text-muted-foreground hover:border-brand/40"
          }`}
        >
          4/n = {(4 / pts.length).toFixed(3)}
        </button>
        <button
          type="button"
          onClick={() => setMode("one")}
          className={`px-2 py-1 rounded-md border font-mono ${
            mode === "one"
              ? "border-brand bg-brand/10"
              : "border-border bg-background text-muted-foreground hover:border-brand/40"
          }`}
        >
          1.0
        </button>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={removeFlagged}
            disabled={flaggedIdx.length === 0}
            className="px-2 py-1 rounded-md border border-border bg-background hover:bg-accent disabled:opacity-40"
          >
            Fjern {flaggedIdx.length} flagged
          </button>
          <button
            type="button"
            onClick={undo}
            disabled={history.length === 0}
            className="px-2 py-1 rounded-md border border-border bg-background hover:bg-accent disabled:opacity-40"
          >
            Angre
          </button>
          <button
            type="button"
            onClick={reset}
            className="px-2 py-1 rounded-md border border-border bg-background hover:bg-accent"
          >
            Reset
          </button>
        </div>
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block bg-background rounded">
        {/* gridlines */}
        {[2, 4, 6, 8, 10, 12].map((g) => (
          <g key={`gx${g}`}>
            <line
              x1={sx(g)}
              y1={sy(Y_MIN)}
              x2={sx(g)}
              y2={sy(Y_MAX)}
              stroke="currentColor"
              className="text-muted-foreground/15"
              strokeWidth={0.5}
            />
            <text
              x={sx(g)}
              y={H - PAD + 12}
              fontSize={9}
              className="fill-muted-foreground"
              textAnchor="middle"
            >
              {g}
            </text>
          </g>
        ))}
        {/* OLS-linje (alle data) */}
        <line
          x1={sx(X_MIN)}
          y1={sy(fit.b0 + fit.b1 * X_MIN)}
          x2={sx(X_MAX)}
          y2={sy(fit.b0 + fit.b1 * X_MAX)}
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="6 3"
          opacity={0.8}
        />
        {/* OLS-linje (uten flagged) */}
        {fitClean && (
          <line
            x1={sx(X_MIN)}
            y1={sy(fitClean.b0 + fitClean.b1 * X_MIN)}
            x2={sx(X_MAX)}
            y2={sy(fitClean.b0 + fitClean.b1 * X_MAX)}
            stroke="#22c55e"
            strokeWidth={2.5}
          />
        )}
        {/* Bobler */}
        {pts.map((p, i) => {
          const flagged = flaggedIdx.includes(i);
          const r = bubbleR(cooks[i]);
          return (
            <g key={i}>
              <circle
                cx={sx(p.x)}
                cy={sy(p.y)}
                r={r}
                fill={flagged ? "rgba(244,63,94,0.25)" : "rgba(59,130,246,0.18)"}
                stroke={flagged ? "#f43f5e" : "#3b82f6"}
                strokeWidth={1.5}
              />
              <circle cx={sx(p.x)} cy={sy(p.y)} r={3} fill={flagged ? "#f43f5e" : "#3b82f6"} />
            </g>
          );
        })}
        {/* legend */}
        <g transform={`translate(${W - 180}, 20)`}>
          <line x1={0} y1={0} x2={20} y2={0} stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 3" />
          <text x={26} y={3} fontSize={10} className="fill-muted-foreground">
            OLS med alle punkter
          </text>
          <line x1={0} y1={16} x2={20} y2={16} stroke="#22c55e" strokeWidth={2.5} />
          <text x={26} y={19} fontSize={10} className="fill-muted-foreground">
            OLS uten flagged
          </text>
        </g>
      </svg>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <Stat label="β₁ (alle)" value={fit.b1.toFixed(3)} />
        <Stat
          label="β₁ (renset)"
          value={fitClean ? fitClean.b1.toFixed(3) : "—"}
          highlight={!!fitClean}
        />
        <Stat label="R² (alle)" value={fit.r2.toFixed(3)} />
        <Stat
          label="R² (renset)"
          value={fitClean ? fitClean.r2.toFixed(3) : "—"}
        />
      </div>

      <p className="text-[11px] text-muted-foreground">
        Boble-størrelsen er proporsjonal med √Cook's D. Punkter over terskelen markeres
        rødt. Den grønne linja viser hvor regresjonen ville endt opp UTEN de flaggede
        punktene — er forskjellen stor, har du virkelig influential points.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-border p-2 ${
        highlight ? "bg-emerald-500/10 border-emerald-500/40" : "bg-background"
      }`}
    >
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      <div className="font-mono text-sm">{value}</div>
    </div>
  );
}
