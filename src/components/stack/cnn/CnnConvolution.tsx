import { useEffect, useMemo, useRef, useState } from "react";
import { Tex, TexBlock } from "@/components/Tex";

type Padding = "valid" | "same";

const SIZE = 8; // input H, W
const K = 3; // kernel size (fixed)

const PRESETS: Record<string, number[]> = {
  identity: [0, 0, 0, 0, 1, 0, 0, 0, 0],
  "edge-detect": [-1, -1, -1, -1, 8, -1, -1, -1, -1],
  sobel_x: [-1, 0, 1, -2, 0, 2, -1, 0, 1],
  sobel_y: [-1, -2, -1, 0, 0, 0, 1, 2, 1],
  blur: [
    1 / 9,
    1 / 9,
    1 / 9,
    1 / 9,
    1 / 9,
    1 / 9,
    1 / 9,
    1 / 9,
    1 / 9,
  ],
  sharpen: [0, -1, 0, -1, 5, -1, 0, -1, 0],
};

// Default input: 8×8 with a tilted L-shape so kernels produce visible features.
function defaultInput(): number[][] {
  const m: number[][] = Array.from({ length: SIZE }, () =>
    Array(SIZE).fill(0),
  );
  for (let r = 1; r < 7; r++) m[r][2] = 1;
  for (let c = 2; c < 6; c++) m[6][c] = 1;
  m[3][4] = 1;
  m[3][5] = 1;
  return m;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function applyConv(
  input: number[][],
  kernel: number[],
  stride: number,
  padding: Padding,
): { output: number[][]; padded: number[][]; pad: number } {
  const inH = input.length;
  const inW = input[0].length;
  const pad = padding === "same" ? Math.floor(K / 2) : 0;
  const padH = inH + 2 * pad;
  const padW = inW + 2 * pad;
  const padded: number[][] = Array.from({ length: padH }, () =>
    Array(padW).fill(0),
  );
  for (let r = 0; r < inH; r++)
    for (let c = 0; c < inW; c++) padded[r + pad][c + pad] = input[r][c];

  const outH = Math.floor((padH - K) / stride) + 1;
  const outW = Math.floor((padW - K) / stride) + 1;
  const output: number[][] = Array.from({ length: outH }, () =>
    Array(outW).fill(0),
  );
  for (let i = 0; i < outH; i++) {
    for (let j = 0; j < outW; j++) {
      let s = 0;
      for (let u = 0; u < K; u++) {
        for (let v = 0; v < K; v++) {
          s += padded[i * stride + u][j * stride + v] * kernel[u * K + v];
        }
      }
      output[i][j] = s;
    }
  }
  return { output, padded, pad };
}

export function CnnConvolution() {
  const [input, setInput] = useState<number[][]>(defaultInput);
  const [kernel, setKernel] = useState<number[]>(PRESETS["edge-detect"]);
  const [stride, setStride] = useState(1);
  const [padding, setPadding] = useState<Padding>("valid");
  const [pos, setPos] = useState({ i: 0, j: 0 }); // current output cell
  const [animating, setAnimating] = useState(false);
  const [drawValue, setDrawValue] = useState(1);
  const animRef = useRef<number | null>(null);

  const conv = useMemo(
    () => applyConv(input, kernel, stride, padding),
    [input, kernel, stride, padding],
  );

  const outH = conv.output.length;
  const outW = conv.output[0]?.length ?? 0;

  // Clamp pos when output shape changes
  useEffect(() => {
    setPos((p) => ({
      i: Math.min(p.i, Math.max(0, outH - 1)),
      j: Math.min(p.j, Math.max(0, outW - 1)),
    }));
  }, [outH, outW]);

  // Animation loop
  useEffect(() => {
    if (!animating) {
      if (animRef.current) {
        clearTimeout(animRef.current);
        animRef.current = null;
      }
      return;
    }
    animRef.current = window.setTimeout(() => {
      setPos((p) => {
        let nj = p.j + 1;
        let ni = p.i;
        if (nj >= outW) {
          nj = 0;
          ni = p.i + 1;
        }
        if (ni >= outH) {
          ni = 0;
          nj = 0;
        }
        return { i: ni, j: nj };
      });
    }, 380);
    return () => {
      if (animRef.current) clearTimeout(animRef.current);
    };
  }, [animating, pos, outH, outW]);

  function setKernelCell(idx: number, value: number) {
    setKernel((k) => k.map((v, i) => (i === idx ? value : v)));
  }

  // Compute the dot product detail for the highlighted output cell
  const detail = useMemo(() => {
    const { padded, pad } = conv;
    const startR = pos.i * stride;
    const startC = pos.j * stride;
    const terms: {
      kr: number;
      kc: number;
      iR: number;
      iC: number;
      inVal: number;
      kVal: number;
      prod: number;
    }[] = [];
    let total = 0;
    for (let u = 0; u < K; u++) {
      for (let v = 0; v < K; v++) {
        const pr = startR + u;
        const pc = startC + v;
        const iR = pr - pad;
        const iC = pc - pad;
        const inVal = padded[pr]?.[pc] ?? 0;
        const kVal = kernel[u * K + v];
        const prod = inVal * kVal;
        total += prod;
        terms.push({ kr: u, kc: v, iR, iC, inVal, kVal, prod });
      }
    }
    return { terms, total, startR: startR - pad, startC: startC - pad };
  }, [conv, kernel, pos, stride]);

  // Cell drawing on the input grid
  function handleCellClick(r: number, c: number) {
    setInput((m) => {
      const next = m.map((row) => row.slice());
      next[r][c] = drawValue;
      return next;
    });
  }

  // Determine output value range for color scaling
  const outAbsMax = useMemo(() => {
    let m = 1e-6;
    for (const row of conv.output)
      for (const v of row) m = Math.max(m, Math.abs(v));
    return m;
  }, [conv]);

  const cellSize = 30;
  const inputGridW = SIZE * cellSize;
  const inputGridH = SIZE * cellSize;
  const outGridW = outW * cellSize;
  const outGridH = outH * cellSize;

  const presetKeys = Object.keys(PRESETS);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold">
        Konvolusjon — kernel glir over 8×8-bilde
      </div>
      <p className="text-xs text-muted-foreground">
        Klikk i input-rutenettet for å tegne (skift draw-verdi over). Velg
        kernel-preset eller skriv inn 9 verdier. Animasjonen glir gjennom alle
        output-posisjoner og viser regnestykket bak hvert tall.
      </p>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="rounded-lg border border-border bg-background p-3 space-y-2">
          <div className="font-semibold">Kernel-preset</div>
          <div className="flex flex-wrap gap-1.5">
            {presetKeys.map((k) => (
              <button
                key={k}
                onClick={() => setKernel(PRESETS[k].slice())}
                className="rounded border border-border bg-card px-2 py-0.5 text-[11px] hover:border-brand/40"
              >
                {k}
              </button>
            ))}
          </div>
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
          >
            {kernel.map((v, i) => (
              <input
                key={i}
                type="number"
                step={0.1}
                value={Number.isFinite(v) ? Number(v.toFixed(3)) : 0}
                onChange={(e) =>
                  setKernelCell(i, Number(e.target.value) || 0)
                }
                className="w-full rounded border border-border bg-background px-1 py-0.5 text-[11px] text-center"
              />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-3 space-y-2">
          <div className="font-semibold">Stride & padding</div>
          <label className="block">
            <span className="text-[11px] text-muted-foreground">
              stride = {stride}
            </span>
            <div className="flex gap-1 mt-1">
              {[1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setStride(s)}
                  className={`rounded border px-2 py-0.5 text-[11px] ${
                    stride === s
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border bg-card hover:border-brand/40"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </label>
          <label className="block">
            <span className="text-[11px] text-muted-foreground">padding</span>
            <div className="flex gap-1 mt-1">
              {(["valid", "same"] as Padding[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPadding(p)}
                  className={`rounded border px-2 py-0.5 text-[11px] ${
                    padding === p
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border bg-card hover:border-brand/40"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </label>
          <div className="text-[11px] text-muted-foreground">
            Output: {outH}×{outW} (formel: ⌊(W + 2p − k)/s⌋ + 1)
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-3 space-y-2">
          <div className="font-semibold">Animasjon & tegning</div>
          <div className="flex gap-1">
            <button
              onClick={() => setAnimating((a) => !a)}
              className="rounded border border-brand bg-brand/10 px-2 py-0.5 text-[11px] text-brand"
            >
              {animating ? "Pause" : "Spill"}
            </button>
            <button
              onClick={() => setPos({ i: 0, j: 0 })}
              className="rounded border border-border bg-card px-2 py-0.5 text-[11px] hover:border-brand/40"
            >
              Til start
            </button>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setInput(defaultInput())}
              className="rounded border border-border bg-card px-2 py-0.5 text-[11px] hover:border-brand/40"
            >
              Reset bilde
            </button>
            <button
              onClick={() =>
                setInput(
                  Array.from({ length: SIZE }, () => Array(SIZE).fill(0)),
                )
              }
              className="rounded border border-border bg-card px-2 py-0.5 text-[11px] hover:border-brand/40"
            >
              Tøm
            </button>
          </div>
          <label className="block">
            <span className="text-[11px] text-muted-foreground">
              tegne-verdi
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={drawValue}
              onChange={(e) => setDrawValue(Number(e.target.value))}
              className="w-full accent-brand"
            />
            <div className="text-[11px]">v = {drawValue.toFixed(1)}</div>
          </label>
        </div>
      </div>

      {/* Grids: input + output */}
      <div className="flex flex-wrap gap-6 items-start justify-center">
        {/* Input */}
        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-muted-foreground text-center">
            Input (8×8) — klikk for å tegne
          </div>
          <svg
            viewBox={`0 0 ${inputGridW} ${inputGridH}`}
            width={inputGridW}
            height={inputGridH}
            className="bg-background rounded border border-border max-w-full h-auto"
          >
            {input.map((row, r) =>
              row.map((v, c) => {
                const isWindow =
                  (() => {
                    // Determine if this input pixel is currently under the kernel
                    const pad = padding === "same" ? Math.floor(K / 2) : 0;
                    const startR = pos.i * stride - pad;
                    const startC = pos.j * stride - pad;
                    return (
                      r >= startR &&
                      r < startR + K &&
                      c >= startC &&
                      c < startC + K
                    );
                  })();
                const shade = Math.round(clamp(v, 0, 1) * 100);
                return (
                  <g key={`${r}-${c}`}>
                    <rect
                      x={c * cellSize}
                      y={r * cellSize}
                      width={cellSize}
                      height={cellSize}
                      fill={`hsl(220 60% ${100 - shade * 0.6}%)`}
                      stroke="hsl(0 0% 70%)"
                      strokeWidth={0.6}
                      onClick={() => handleCellClick(r, c)}
                      style={{ cursor: "crosshair" }}
                    />
                    <text
                      x={c * cellSize + cellSize / 2}
                      y={r * cellSize + cellSize / 2 + 3}
                      textAnchor="middle"
                      fontSize={9}
                      fill={v > 0.5 ? "white" : "hsl(0 0% 35%)"}
                      pointerEvents="none"
                    >
                      {v.toFixed(1)}
                    </text>
                    {isWindow && (
                      <rect
                        x={c * cellSize + 1}
                        y={r * cellSize + 1}
                        width={cellSize - 2}
                        height={cellSize - 2}
                        fill="hsl(48 95% 55% / 0.25)"
                        stroke="hsl(48 95% 45%)"
                        strokeWidth={1.5}
                        pointerEvents="none"
                      />
                    )}
                  </g>
                );
              }),
            )}
          </svg>
        </div>

        {/* Output */}
        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-muted-foreground text-center">
            Output feature-map ({outH}×{outW})
          </div>
          <svg
            viewBox={`0 0 ${Math.max(outGridW, 1)} ${Math.max(outGridH, 1)}`}
            width={outGridW}
            height={outGridH}
            className="bg-background rounded border border-border max-w-full h-auto"
          >
            {conv.output.map((row, r) =>
              row.map((v, c) => {
                const norm = v / outAbsMax;
                const hue = norm >= 0 ? 220 : 0;
                const light = 100 - Math.abs(norm) * 50;
                const isPos = pos.i === r && pos.j === c;
                return (
                  <g
                    key={`${r}-${c}`}
                    onClick={() => setPos({ i: r, j: c })}
                    style={{ cursor: "pointer" }}
                  >
                    <rect
                      x={c * cellSize}
                      y={r * cellSize}
                      width={cellSize}
                      height={cellSize}
                      fill={`hsl(${hue} 70% ${light}%)`}
                      stroke="hsl(0 0% 70%)"
                      strokeWidth={0.6}
                    />
                    <text
                      x={c * cellSize + cellSize / 2}
                      y={r * cellSize + cellSize / 2 + 3}
                      textAnchor="middle"
                      fontSize={9}
                      fill={Math.abs(norm) > 0.4 ? "white" : "hsl(0 0% 35%)"}
                      pointerEvents="none"
                    >
                      {v.toFixed(1)}
                    </text>
                    {isPos && (
                      <rect
                        x={c * cellSize + 1}
                        y={r * cellSize + 1}
                        width={cellSize - 2}
                        height={cellSize - 2}
                        fill="none"
                        stroke="hsl(48 95% 45%)"
                        strokeWidth={2}
                        pointerEvents="none"
                      />
                    )}
                  </g>
                );
              }),
            )}
          </svg>
        </div>
      </div>

      {/* Calculation panel */}
      <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-2">
        <div className="font-semibold">
          Regnestykke for output[{pos.i}][{pos.j}] = {detail.total.toFixed(3)}
        </div>
        <TexBlock>
          {`y_{${pos.i},${pos.j}} = \\sum_{u,v} I_{i+u,\\,j+v}\\, K_{u,v}`}
        </TexBlock>
        <div className="font-mono text-[11px] leading-relaxed break-all">
          {detail.terms
            .map(
              (t) =>
                `(${t.inVal.toFixed(1)}·${t.kVal.toFixed(2)})`,
            )
            .join(" + ")}{" "}
          = {detail.total.toFixed(3)}
        </div>
        <div className="text-muted-foreground">
          Kernel-vinduet starter ved (rad, kol) = ({detail.startR},{" "}
          {detail.startC}) i input.{" "}
          {padding === "same"
            ? "Verdier utenfor bildet hentes fra null-padding."
            : "Valid-padding: vi hopper kantene."}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-1.5">
        <div className="font-semibold">Lese-tips for kernels</div>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>
            <strong>edge-detect</strong>: midten +8, naboene −1 — output stor
            der piksel skiller seg fra omgivelsene.
          </li>
          <li>
            <strong>blur</strong>: gjennomsnitt over 3×3 — output glattes ut.
          </li>
          <li>
            <strong>sharpen</strong>: forsterker piksel relativt til naboene.
          </li>
          <li>
            <strong>sobel_x / sobel_y</strong>: vertikale / horisontale
            kanter — to klassiske «kant-filtre».
          </li>
        </ul>
        <p className="text-muted-foreground">
          I et trent CNN læres disse kernel-verdiene automatisk fra data,
          ikke håndlages — men nettverket ender ofte opp med filtre som
          ligner mistenkelig på Sobel og Gabor.
        </p>
        <p className="text-muted-foreground">
          Antall parametere i et conv-lag:{" "}
          <Tex>{"(k\\cdot k\\cdot C_\\text{in} + 1)\\cdot C_\\text{out}"}</Tex>
          . Her: <Tex>{"3\\cdot 3\\cdot 1 + 1 = 10"}</Tex> per kernel.
        </p>
      </div>
    </div>
  );
}
