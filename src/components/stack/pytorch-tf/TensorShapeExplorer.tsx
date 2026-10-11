import { useMemo, useState } from "react";

// --------------------------------------------------------------------------
// TensorShapeExplorer — velg en operasjon og se shape + cell-grid endre seg.
// Vi modellerer en 1D-rekke med 24 elementer og lar studenten se hvordan
// reshape/transpose/unsqueeze tolker SAMME bytes som ulike shapes.
// Broadcasting demonstreres med to små tensorer som "strekkes" til felles
// shape — den ahaen man trenger for å slutte å være redd for broadcast-feil.
// --------------------------------------------------------------------------

type Op =
  | "base"
  | "reshape-3-8"
  | "reshape-2-3-4"
  | "transpose"
  | "unsqueeze-0"
  | "permute"
  | "broadcast";

const OPS: { id: Op; label: string; code: string; out: number[] }[] = [
  { id: "base", label: "Start", code: "x = torch.arange(24)", out: [24] },
  { id: "reshape-3-8", label: "reshape(3, 8)", code: "x.reshape(3, 8)", out: [3, 8] },
  { id: "reshape-2-3-4", label: "reshape(2, 3, 4)", code: "x.reshape(2, 3, 4)", out: [2, 3, 4] },
  { id: "transpose", label: "(3, 8).T", code: "x.reshape(3, 8).T", out: [8, 3] },
  { id: "unsqueeze-0", label: "unsqueeze(0)", code: "x.unsqueeze(0)  # (1, 24)", out: [1, 24] },
  { id: "permute", label: "permute(2, 0, 1)", code: "x.reshape(2,3,4).permute(2,0,1)", out: [4, 2, 3] },
  { id: "broadcast", label: "broadcast a+b", code: "a:(3,1) + b:(1,4)  → (3,4)", out: [3, 4] },
];

// Generer base-data 0..23
const BASE = Array.from({ length: 24 }, (_, i) => i);

// For visualisering, returner en 2D "rad × kolonne"-array som vi kan tegne.
// For 3D-shapes viser vi to 2D-paneler ved siden av hverandre.
function viewAs(shape: number[]): { panels: number[][][]; labels: string[] } {
  if (shape.length === 1) {
    return { panels: [[BASE]], labels: ["[:]"] };
  }
  if (shape.length === 2) {
    const [r, c] = shape;
    const grid: number[][] = [];
    for (let i = 0; i < r; i++) {
      grid.push(BASE.slice(i * c, (i + 1) * c));
    }
    return { panels: [grid], labels: ["[:, :]"] };
  }
  if (shape.length === 3) {
    const [d, r, c] = shape;
    const panels: number[][][] = [];
    const labels: string[] = [];
    for (let i = 0; i < d; i++) {
      const grid: number[][] = [];
      for (let j = 0; j < r; j++) {
        const start = i * r * c + j * c;
        grid.push(BASE.slice(start, start + c));
      }
      panels.push(grid);
      labels.push(`[${i}, :, :]`);
    }
    return { panels, labels };
  }
  return { panels: [], labels: [] };
}

function viewTranspose(): { panels: number[][][]; labels: string[] } {
  // (3,8).T = (8,3)
  const r = 3, c = 8;
  const src: number[][] = [];
  for (let i = 0; i < r; i++) src.push(BASE.slice(i * c, (i + 1) * c));
  const out: number[][] = [];
  for (let j = 0; j < c; j++) {
    const row: number[] = [];
    for (let i = 0; i < r; i++) row.push(src[i][j]);
    out.push(row);
  }
  return { panels: [out], labels: ["transposed"] };
}

function viewPermute(): { panels: number[][][]; labels: string[] } {
  // (2,3,4) → permute(2,0,1) → (4,2,3)
  const d = 2, r = 3, c = 4;
  const cube: number[][][] = [];
  for (let i = 0; i < d; i++) {
    const m: number[][] = [];
    for (let j = 0; j < r; j++) {
      m.push(BASE.slice(i * r * c + j * c, i * r * c + (j + 1) * c));
    }
    cube.push(m);
  }
  // result[k][i][j] = cube[i][j][k] for k in 0..c
  const panels: number[][][] = [];
  const labels: string[] = [];
  for (let k = 0; k < c; k++) {
    const m: number[][] = [];
    for (let i = 0; i < d; i++) {
      const row: number[] = [];
      for (let j = 0; j < r; j++) row.push(cube[i][j][k]);
      m.push(row);
    }
    panels.push(m);
    labels.push(`[${k}, :, :]`);
  }
  return { panels, labels };
}

export function TensorShapeExplorer() {
  const [op, setOp] = useState<Op>("base");

  const view = useMemo(() => {
    if (op === "transpose") return viewTranspose();
    if (op === "permute") return viewPermute();
    if (op === "broadcast") return null; // håndteres separat
    const spec = OPS.find((o) => o.id === op)!;
    return viewAs(spec.out);
  }, [op]);

  const selected = OPS.find((o) => o.id === op)!;
  const numEls = selected.out.reduce((a, b) => a * b, 1);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {/* Op-toggles */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {OPS.map((o) => {
          const active = o.id === op;
          return (
            <button
              key={o.id}
              onClick={() => setOp(o.id)}
              className={
                "rounded-md border px-2 py-1 text-xs font-mono transition-colors " +
                (active
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border hover:border-brand/50 hover:bg-muted/30")
              }
            >
              {o.label}
            </button>
          );
        })}
      </div>

      {/* Kode + shape */}
      <div className="rounded-md border border-border bg-background/40 p-2 mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <code className="font-mono">{selected.code}</code>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-muted-foreground">
            shape ={" "}
            <span className="font-mono text-foreground">({selected.out.join(", ")})</span>
          </div>
          {op !== "broadcast" && (
            <div className="text-muted-foreground">
              elementer = <span className="font-mono text-foreground">{numEls}</span>
            </div>
          )}
        </div>
      </div>

      {op !== "broadcast" && view && (
        <div className="flex flex-wrap gap-3">
          {view.panels.map((panel, pi) => (
            <div key={pi} className="rounded-md border border-border bg-background/40 p-2">
              {view.panels.length > 1 && (
                <div className="text-[10px] text-muted-foreground font-mono mb-1">
                  {view.labels[pi]}
                </div>
              )}
              <Grid grid={panel} />
            </div>
          ))}
        </div>
      )}

      {op === "broadcast" && <BroadcastPanel />}

      {/* Forklaring */}
      <div className="mt-3 text-xs text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Hva å se etter:</strong>{" "}
        {op === "base" && "Vi starter med en 1D-rekke av 24 elementer (verdiene 0..23)."}
        {op === "reshape-3-8" &&
          "Samme bytes, ny tolkning: 24 = 3·8. Element [r, c] = r·8 + c (rad-major layout)."}
        {op === "reshape-2-3-4" &&
          "24 = 2·3·4. Hver «slab» er en (3,4)-matrise. Akse 0 = ytre løkke, akse −1 = innerste."}
        {op === "transpose" &&
          "Bytt akse 0 og 1: rader blir kolonner. Underliggende minne er IKKE flyttet — bare strides endres (raskt)."}
        {op === "unsqueeze-0" &&
          "Lager en ny akse av størrelse 1 i posisjon 0. Brukes mye for batch-dim («single sample → mini-batch»)."}
        {op === "permute" &&
          "Generaliserer transpose til vilkårlig akse-rekkefølge. (D, R, C) → (C, D, R) — siste akse blir første."}
      </div>
    </div>
  );
}

function Grid({ grid }: { grid: number[][] }) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const CELL = 26;
  const W = cols * CELL + 4;
  const H = rows * CELL + 4;
  return (
    <svg width={W} height={H} className="block">
      {grid.flatMap((row, ri) =>
        row.map((v, ci) => {
          // Farge basert på verdi for å gjøre transpose / permute visuelt sporbart
          const hue = (v * 15) % 360;
          return (
            <g key={`${ri}-${ci}`}>
              <rect
                x={ci * CELL + 2}
                y={ri * CELL + 2}
                width={CELL - 2}
                height={CELL - 2}
                rx={2}
                fill={`hsl(${hue}, 70%, 80%)`}
                stroke="rgb(100,116,139)"
                strokeOpacity={0.35}
              />
              <text
                x={ci * CELL + CELL / 2 + 1}
                y={ri * CELL + CELL / 2 + 5}
                textAnchor="middle"
                fontSize={10}
                className="font-mono"
                fill="rgb(15,23,42)"
              >
                {v}
              </text>
            </g>
          );
        }),
      )}
    </svg>
  );
}

function BroadcastPanel() {
  // a: (3,1) = [[0],[1],[2]]
  // b: (1,4) = [[0,1,2,3]]
  // result: (3,4) where r[i][j] = a[i][0] + b[0][j]
  const a = [[0], [1], [2]];
  const b = [[0, 1, 2, 3]];
  // strukket a → (3,4) ved å replikere kolonne
  const aStretched = a.map(([v]) => [v, v, v, v]);
  // strukket b → (3,4) ved å replikere rad
  const bStretched = [b[0], b[0], b[0]];
  const result = aStretched.map((row, i) => row.map((v, j) => v + bStretched[i][j]));

  const Tag = ({ children, color }: { children: React.ReactNode; color: string }) => (
    <span
      className="inline-block rounded px-1 py-0.5 text-[10px] font-mono"
      style={{ backgroundColor: color + "22", color }}
    >
      {children}
    </span>
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-md border border-border bg-background/40 p-2">
          <div className="text-[10px] text-muted-foreground font-mono mb-1">
            <Tag color="rgb(56,189,248)">a</Tag> shape (3, 1)
          </div>
          <Grid grid={a} />
        </div>
        <div className="rounded-md border border-border bg-background/40 p-2">
          <div className="text-[10px] text-muted-foreground font-mono mb-1">
            <Tag color="rgb(244,114,182)">b</Tag> shape (1, 4)
          </div>
          <Grid grid={b} />
        </div>
      </div>
      <div className="text-xs text-center text-muted-foreground font-mono">
        ↓ broadcast: hver tensor «strekkes» til felles shape (3, 4)
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-md border border-border bg-background/40 p-2">
          <div className="text-[10px] text-muted-foreground font-mono mb-1">
            <Tag color="rgb(56,189,248)">a</Tag> strukket → (3, 4)
          </div>
          <Grid grid={aStretched} />
        </div>
        <div className="rounded-md border border-border bg-background/40 p-2">
          <div className="text-[10px] text-muted-foreground font-mono mb-1">
            <Tag color="rgb(244,114,182)">b</Tag> strukket → (3, 4)
          </div>
          <Grid grid={bStretched} />
        </div>
      </div>
      <div className="rounded-md border border-emerald-400/40 bg-emerald-400/5 p-2">
        <div className="text-[10px] text-muted-foreground font-mono mb-1">
          a + b = (3, 4)  — element-vis
        </div>
        <Grid grid={result} />
      </div>
      <div className="text-xs text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Regelen:</strong> akser justeres høyrestilt. En
        akse på 1 «strekkes» til å matche den andre. Ulike størrelser som ikke er 1 → error.
        I praksis kopieres ingen data — det skjer virtuelt via strides — men resultatet er
        som om det ble kopiert.
      </div>
    </div>
  );
}
