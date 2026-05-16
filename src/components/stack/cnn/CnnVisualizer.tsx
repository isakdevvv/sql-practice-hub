import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Play, Pause, SkipForward, SkipBack } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv visualisering for konvolusjonsnett.
// Fem moduser: 1D-konvolusjon, 2D-konvolusjon, stride/padding,
// pooling (max/avg) og filter-galleri.
//
// Metafor gjennomgående: kernel/filter = en "lupe" som leter etter et
// mønster, slir over inputen og noterer hvor sterkt mønsteret er hver plass.
// --------------------------------------------------------------------------

type Mode = "conv1d" | "conv2d" | "stride" | "pool" | "gallery";

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "conv1d", label: "1D-konvolusjon", sub: "kernel slir over en sekvens" },
  { id: "conv2d", label: "2D-konvolusjon", sub: "kernel slir over et bilde" },
  { id: "stride", label: "Stride & padding", sub: "output-størrelse-formelen" },
  { id: "pool", label: "Pooling", sub: "max vs gjennomsnitt" },
  { id: "gallery", label: "Filter-galleri", sub: "4 filtre på samme bilde" },
];

const MODE_NOTE: Record<Mode, string> = {
  conv1d:
    "1D-konvolusjon brukes på sekvenser (tekst, lyd, tidsserier). Akkurat samme prinsipp som 2D, bare en akse.",
  conv2d:
    "Kjernen er din 'lupe'. For hver posisjon: multipliser elementvis, summer — én piksel ut.",
  stride:
    "Stride styrer hvor langt lupa hopper. Padding styrer hva som skjer ved kantene. Formelen O = (I − K + 2P)/S + 1 forteller deg ny dimensjon.",
  pool:
    "Pooling har ingen lærbare vekter — den nedsampler. Max bevarer skarpe trekk, avg glatter ut.",
  gallery:
    "Samme bilde, fire forskjellige filtre. Hvert filter 'lyser opp' der det finner sitt mønster. Dette er hele intuisjonen bak CNN.",
};

// Brytetegn for tall: enten heltall eller 2 desimaler hvis nødvendig.
function fmt(v: number): string {
  if (Number.isInteger(v)) return String(v);
  if (Math.abs(v) < 0.005) return "0";
  return v.toFixed(2);
}

// HSL tint for gråtone-celle.
function shade(v: number, min: number, max: number): string {
  if (max === min) return "hsl(0 0% 92%)";
  const t = (v - min) / (max - min); // 0..1
  const light = 95 - t * 80; // 95% → 15%
  return `hsl(0 0% ${light}%)`;
}

// Farge for kontinuerlig output (negative blå, positive røde).
function activationTint(v: number, absMax: number): string {
  if (absMax === 0) return "hsl(0 0% 92%)";
  const t = Math.max(-1, Math.min(1, v / absMax));
  if (t >= 0) {
    // 0 (lyst) til 1 (mørk brand-rød)
    const l = 95 - t * 55;
    return `hsl(12 80% ${l}%)`;
  } else {
    const l = 95 + t * 55;
    return `hsl(220 70% ${l}%)`;
  }
}

export function CnnVisualizer() {
  const [mode, setMode] = useState<Mode>("conv1d");

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              CNN — slir lupa over input, finn mønsteret
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground italic max-w-md text-right">
            {MODE_NOTE[mode]}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                mode === m.id
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border hover:bg-muted"
              }`}
              title={m.sub}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 bg-background">
        {mode === "conv1d" && <Conv1DView />}
        {mode === "conv2d" && <Conv2DView />}
        {mode === "stride" && <StridePadView />}
        {mode === "pool" && <PoolView />}
        {mode === "gallery" && <GalleryView />}
      </div>
    </div>
  );
}

// ====================================================================
// Mode 1 — 1D-konvolusjon
// ====================================================================

const DEFAULT_INPUT_1D = [1, 2, 3, 4, 5, 4, 3, 2];
const DEFAULT_KERNEL_1D = [1, 0, -1]; // edge / kant-detektor

function Conv1DView() {
  const [input, setInput] = useState<number[]>(DEFAULT_INPUT_1D);
  const [kernel, setKernel] = useState<number[]>(DEFAULT_KERNEL_1D);
  const [pos, setPos] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(false);

  const outLen = input.length - kernel.length + 1; // valid, stride 1
  const output = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i < outLen; i++) {
      let s = 0;
      for (let k = 0; k < kernel.length; k++) s += input[i + k] * kernel[k];
      out.push(s);
    }
    return out;
  }, [input, kernel, outLen]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPos((p) => {
        if (p >= outLen - 1) {
          setPlaying(false);
          return p;
        }
        return p + 1;
      });
    }, 900);
    return () => clearInterval(id);
  }, [playing, outLen]);

  useEffect(() => {
    if (pos > outLen - 1) setPos(Math.max(0, outLen - 1));
  }, [outLen, pos]);

  const reset = () => {
    setInput(DEFAULT_INPUT_1D);
    setKernel(DEFAULT_KERNEL_1D);
    setPos(0);
    setPlaying(false);
  };

  const updateInput = (i: number, v: string) => {
    const n = Number.parseFloat(v);
    if (!Number.isFinite(n)) return;
    setInput((arr) => arr.map((x, j) => (j === i ? n : x)));
  };
  const updateKernel = (i: number, v: string) => {
    const n = Number.parseFloat(v);
    if (!Number.isFinite(n)) return;
    setKernel((arr) => arr.map((x, j) => (j === i ? n : x)));
  };

  const absMax = Math.max(1, ...output.map((v) => Math.abs(v)));
  const inMax = Math.max(1, ...input.map((v) => Math.abs(v)));

  // Cellebredden brukes til å skyve kjernen over inputen.
  const CELL = 48; // px
  const GAP = 6; // px

  return (
    <div className="space-y-5">
      <Controls
        playing={playing}
        onPlay={() => {
          if (pos >= outLen - 1) setPos(0);
          setPlaying((p) => !p);
        }}
        onStep={() => setPos((p) => Math.min(outLen - 1, p + 1))}
        onBack={() => setPos((p) => Math.max(0, p - 1))}
        onReset={reset}
        info={`Steg ${pos + 1} av ${outLen}`}
      />

      <div>
        <Label>Input (8 elementer)</Label>
        <div className="relative" style={{ height: CELL + 36 }}>
          {/* Inputrad */}
          <div className="flex" style={{ gap: GAP }}>
            {input.map((v, i) => {
              const inWindow = i >= pos && i < pos + kernel.length;
              return (
                <input
                  key={i}
                  type="number"
                  value={v}
                  onChange={(e) => updateInput(i, e.target.value)}
                  className={`text-center font-mono text-sm rounded-md border transition-colors ${
                    inWindow
                      ? "border-brand bg-brand/10 ring-2 ring-brand/30"
                      : "border-border bg-card"
                  }`}
                  style={{ width: CELL, height: CELL }}
                />
              );
            })}
          </div>
          {/* Kernel overlagt under */}
          <div
            className="absolute"
            style={{
              top: CELL + 8,
              left: pos * (CELL + GAP),
              transition: "left 320ms ease-out",
            }}
          >
            <div className="flex items-center" style={{ gap: GAP }}>
              {kernel.map((v, i) => (
                <input
                  key={i}
                  type="number"
                  step="0.1"
                  value={v}
                  onChange={(e) => updateKernel(i, e.target.value)}
                  className="text-center font-mono text-xs rounded-md border-2 border-brand bg-brand/5"
                  style={{ width: CELL, height: 26 }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="text-[10px] text-muted-foreground mt-1">
          Kjernen (lupa) er overlagt under inputraden. Rediger tallene direkte.
        </div>
      </div>

      {/* Beregning */}
      <div className="rounded-xl border border-border bg-muted/20 p-3">
        <Label>Beregning for posisjon {pos}</Label>
        <div className="font-mono text-xs overflow-x-auto whitespace-nowrap py-1">
          {kernel.map((k, i) => (
            <span key={i}>
              {i > 0 && <span className="text-muted-foreground"> + </span>}
              <span className="text-foreground">{fmt(input[pos + i])}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-brand">{fmt(k)}</span>
            </span>
          ))}
          <span className="text-muted-foreground"> = </span>
          <span className="text-success font-semibold">{fmt(output[pos])}</span>
        </div>
      </div>

      <div>
        <Label>Output ({outLen} elementer)</Label>
        <div className="flex" style={{ gap: GAP }}>
          {output.map((v, i) => (
            <div
              key={i}
              className={`text-center font-mono text-sm rounded-md border flex items-center justify-center transition-colors ${
                i === pos
                  ? "border-success ring-2 ring-success/40"
                  : "border-border"
              } ${i <= pos ? "" : "opacity-30"}`}
              style={{
                width: CELL,
                height: CELL,
                background: i <= pos ? activationTint(v, absMax) : undefined,
              }}
              title={`output[${i}] = ${fmt(v)}`}
            >
              {i <= pos ? fmt(v) : ""}
            </div>
          ))}
        </div>
        <div className="text-[10px] text-muted-foreground mt-1">
          Output bygges opp én celle om gangen. Rød = positiv aktivering, blå = negativ.
        </div>
      </div>

      <Hint>
        Denne kjernen ({fmt(kernel[0])}, {fmt(kernel[1])}, {fmt(kernel[2])}) er en
        kant-detektor: stor verdi når inputen endrer seg raskt, ~0 når den er flat.
        Endre tallene og se hva som skjer — f.eks. (1,1,1)/3 = løpende gjennomsnitt
        (lavpassfilter), (-1,2,-1) = "spike-detektor".
      </Hint>
    </div>
  );
}

// ====================================================================
// Felles 2D-kjerner
// ====================================================================

type Kernel2D = number[][];

const KERNEL_PRESETS: Record<string, Kernel2D> = {
  "identity": [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
  ],
  "edge-detect": [
    [-1, -1, -1],
    [-1, 8, -1],
    [-1, -1, -1],
  ],
  "blur": [
    [1 / 9, 1 / 9, 1 / 9],
    [1 / 9, 1 / 9, 1 / 9],
    [1 / 9, 1 / 9, 1 / 9],
  ],
  "sharpen": [
    [0, -1, 0],
    [-1, 5, -1],
    [0, -1, 0],
  ],
};

// 6x6 input med en tydelig diagonal "kant" + en vertikal strek.
function defaultImage6(): number[][] {
  return [
    [1, 1, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0],
    [0, 1, 1, 1, 0, 1],
    [0, 0, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 1, 1],
  ];
}

function conv2d(
  input: number[][],
  kernel: Kernel2D,
  stride: number,
  pad: number,
): number[][] {
  const inH = input.length;
  const inW = input[0].length;
  const kH = kernel.length;
  const kW = kernel[0].length;
  // pad input
  const paddedH = inH + 2 * pad;
  const paddedW = inW + 2 * pad;
  const padded: number[][] = Array.from({ length: paddedH }, () =>
    Array(paddedW).fill(0),
  );
  for (let r = 0; r < inH; r++)
    for (let c = 0; c < inW; c++) padded[r + pad][c + pad] = input[r][c];
  const outH = Math.floor((paddedH - kH) / stride) + 1;
  const outW = Math.floor((paddedW - kW) / stride) + 1;
  const out: number[][] = Array.from({ length: outH }, () =>
    Array(outW).fill(0),
  );
  for (let or = 0; or < outH; or++) {
    for (let oc = 0; oc < outW; oc++) {
      let s = 0;
      for (let kr = 0; kr < kH; kr++) {
        for (let kc = 0; kc < kW; kc++) {
          s += padded[or * stride + kr][oc * stride + kc] * kernel[kr][kc];
        }
      }
      out[or][oc] = s;
    }
  }
  return out;
}

// ====================================================================
// Mode 2 — 2D-konvolusjon (steg-for-steg)
// ====================================================================

function Conv2DView() {
  const [preset, setPreset] = useState<keyof typeof KERNEL_PRESETS>("edge-detect");
  const [kernel, setKernel] = useState<Kernel2D>(() =>
    KERNEL_PRESETS["edge-detect"].map((r) => [...r]),
  );
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const input = defaultImage6();
  const outH = input.length - kernel.length + 1; // 4
  const outW = input[0].length - kernel[0].length + 1; // 4
  const totalSteps = outH * outW;

  const fullOutput = useMemo(
    () => conv2d(input, kernel, 1, 0),
    [kernel],
  );

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= totalSteps - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 700);
    return () => clearInterval(id);
  }, [playing, totalSteps]);

  const or = Math.floor(step / outW);
  const oc = step % outW;

  const patch: number[][] = [];
  for (let r = 0; r < kernel.length; r++) {
    const row: number[] = [];
    for (let c = 0; c < kernel[0].length; c++) row.push(input[or + r][oc + c]);
    patch.push(row);
  }

  const products: number[][] = patch.map((row, r) =>
    row.map((v, c) => v * kernel[r][c]),
  );
  const sum = products.flat().reduce((a, b) => a + b, 0);

  const absMax = Math.max(
    1,
    ...fullOutput.flat().map((v) => Math.abs(v)),
  );

  const onKernelEdit = (r: number, c: number, v: string) => {
    const n = Number.parseFloat(v);
    if (!Number.isFinite(n)) return;
    setKernel((k) =>
      k.map((row, ri) =>
        row.map((x, ci) => (ri === r && ci === c ? n : x)),
      ),
    );
    setPreset("identity"); // marker som custom — vi viser "egendefinert"
  };

  const changePreset = (p: keyof typeof KERNEL_PRESETS) => {
    setPreset(p);
    setKernel(KERNEL_PRESETS[p].map((r) => [...r]));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Label inline>Forhåndsdefinert filter:</Label>
        {Object.keys(KERNEL_PRESETS).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => changePreset(p as keyof typeof KERNEL_PRESETS)}
            className={`px-2 py-1 text-xs rounded border ${
              preset === p
                ? "border-brand bg-brand/10 text-brand"
                : "border-border hover:bg-muted"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <Controls
        playing={playing}
        onPlay={() => {
          if (step >= totalSteps - 1) setStep(0);
          setPlaying((p) => !p);
        }}
        onStep={() => setStep((s) => Math.min(totalSteps - 1, s + 1))}
        onBack={() => setStep((s) => Math.max(0, s - 1))}
        onReset={() => {
          setStep(0);
          setPlaying(false);
        }}
        info={`Posisjon (${or}, ${oc}) — steg ${step + 1}/${totalSteps}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[auto_auto_1fr] gap-5">
        {/* Input med highlighted patch */}
        <div>
          <Label>Input 6×6</Label>
          <Grid2D
            data={input}
            cellSize={36}
            highlight={(r, c) =>
              r >= or && r < or + kernel.length && c >= oc && c < oc + kernel[0].length
            }
          />
        </div>

        {/* Kernel (editable) */}
        <div>
          <Label>Kernel 3×3 (lupa)</Label>
          <div
            className="inline-grid gap-1 p-1 rounded border-2 border-brand bg-brand/5"
            style={{ gridTemplateColumns: `repeat(${kernel[0].length}, 36px)` }}
          >
            {kernel.flatMap((row, r) =>
              row.map((v, c) => (
                <input
                  key={`${r}-${c}`}
                  type="number"
                  step="0.1"
                  value={fmt(v)}
                  onChange={(e) => onKernelEdit(r, c, e.target.value)}
                  className="h-9 w-9 text-center font-mono text-xs rounded border border-brand/40 bg-background"
                />
              )),
            )}
          </div>
        </div>

        {/* Output */}
        <div>
          <Label>Output {outH}×{outW}</Label>
          <Grid2D
            data={fullOutput}
            cellSize={36}
            tint={(v) => activationTint(v, absMax)}
            highlight={(r, c) => r === or && c === oc}
            hideUnvisited={(r, c) => r * outW + c > step}
          />
        </div>
      </div>

      {/* Elementvis multiplikasjon */}
      <div className="rounded-xl border border-border bg-muted/20 p-3">
        <Label>Elementvis multiplikasjon + sum</Label>
        <div className="flex items-start gap-2 overflow-x-auto pb-1">
          <SmallGrid data={patch} title="patch" />
          <Op>×</Op>
          <SmallGrid data={kernel} title="kernel" highlight />
          <Op>=</Op>
          <SmallGrid data={products} title="produkt" />
          <Op>→ Σ =</Op>
          <div
            className="px-3 h-12 rounded-lg border-2 border-success bg-success/10 font-mono text-sm flex items-center justify-center text-success font-semibold"
            style={{ minWidth: 64 }}
          >
            {fmt(sum)}
          </div>
        </div>
      </div>

      <Hint>
        Lupa flytter seg én piksel om gangen. På hver posisjon: gang elementvis,
        summer alle 9 verdier — det blir én piksel i output. edge-detect-filteret
        gir høy verdi der nabopikslene er forskjellige (kanter), nær 0 i flate
        områder. blur gir bare et gjennomsnitt av nabolaget.
      </Hint>
    </div>
  );
}

// ====================================================================
// Mode 3 — Stride & padding
// ====================================================================

function StridePadView() {
  const [stride, setStride] = useState(1);
  const [pad, setPad] = useState(0); // 0 = valid, 1 = same (for k=3)
  const input = defaultImage6();
  const k = 3;
  const I = input.length;
  const O = Math.floor((I - k + 2 * pad) / stride) + 1;
  const kernel = KERNEL_PRESETS["edge-detect"];
  const out = useMemo(
    () => conv2d(input, kernel, stride, pad),
    [stride, pad],
  );
  const absMax = Math.max(1, ...out.flat().map((v) => Math.abs(v)));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <Label inline>Stride:</Label>
          <div className="inline-flex gap-1 ml-2">
            {[1, 2].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStride(s)}
                className={`px-3 py-1 text-xs rounded border ${
                  stride === s
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border hover:bg-muted"
                }`}
              >
                s = {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label inline>Padding:</Label>
          <div className="inline-flex gap-1 ml-2">
            <button
              type="button"
              onClick={() => setPad(0)}
              className={`px-3 py-1 text-xs rounded border ${
                pad === 0
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border hover:bg-muted"
              }`}
            >
              valid (p = 0)
            </button>
            <button
              type="button"
              onClick={() => setPad(1)}
              className={`px-3 py-1 text-xs rounded border ${
                pad === 1
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border hover:bg-muted"
              }`}
            >
              same (p = 1)
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/20 p-3 font-mono text-sm">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
          Output-formel
        </div>
        <div>
          O = (I − K + 2P) / S + 1 ={" "}
          <span className="text-muted-foreground">
            ({I} − {k} + 2·{pad}) / {stride} + 1
          </span>{" "}
          = <span className="text-success font-semibold">{O}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Input {I}×{I}, kernel {k}×{k}, padding {pad}, stride {stride} → output{" "}
          {O}×{O}.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label>
            Input {pad > 0 ? `(${I + 2 * pad}×${I + 2 * pad} med padding)` : `${I}×${I}`}
          </Label>
          <PaddedInputView input={input} pad={pad} stride={stride} k={k} outH={O} />
        </div>
        <div>
          <Label>Output {O}×{O}</Label>
          <Grid2D
            data={out}
            cellSize={Math.max(20, Math.min(40, 180 / O))}
            tint={(v) => activationTint(v, absMax)}
          />
        </div>
      </div>

      <Hint>
        <strong>Stride 1, valid:</strong> output krymper ({I} → {I - k + 1}).{" "}
        <strong>Stride 1, same:</strong> output bevares ({I} → {I}). <strong>Stride 2:</strong>{" "}
        omtrent halverer dimensjonen — brukes for nedsampling som alternativ til pooling.
        Bytt mellom knappene og se hvordan O endrer seg.
      </Hint>
    </div>
  );
}

function PaddedInputView({
  input,
  pad,
  stride,
  k,
  outH,
}: {
  input: number[][];
  pad: number;
  stride: number;
  k: number;
  outH: number;
}) {
  const padded: number[][] = Array.from(
    { length: input.length + 2 * pad },
    (_, r) =>
      Array.from({ length: input[0].length + 2 * pad }, (_, c) => {
        const ir = r - pad;
        const ic = c - pad;
        if (ir < 0 || ic < 0 || ir >= input.length || ic >= input[0].length)
          return NaN; // padding
        return input[ir][ic];
      }),
  );
  // Marker alle kernel-startposisjoner med tynne firkanter — vis grønne hjørner
  // for å gjøre stride synlig.
  const isStart = (r: number, c: number) =>
    r % stride === 0 &&
    c % stride === 0 &&
    r / stride < outH &&
    c / stride < outH;

  const cellSize = Math.max(20, Math.min(32, 220 / padded.length));

  return (
    <div
      className="inline-grid gap-[2px] p-1 rounded border border-border bg-background"
      style={{ gridTemplateColumns: `repeat(${padded[0].length}, ${cellSize}px)` }}
    >
      {padded.flatMap((row, r) =>
        row.map((v, c) => {
          const isPad = Number.isNaN(v);
          const start = isStart(r, c) && r + k <= padded.length && c + k <= padded[0].length;
          return (
            <div
              key={`${r}-${c}`}
              className={`flex items-center justify-center font-mono text-[10px] rounded-sm ${
                isPad
                  ? "text-muted-foreground/40 bg-muted/30 border border-dashed border-border"
                  : "border border-border"
              } ${start ? "ring-2 ring-brand/60" : ""}`}
              style={{
                width: cellSize,
                height: cellSize,
                background: isPad
                  ? undefined
                  : shade(v as number, 0, 1),
                color: isPad ? undefined : (v as number) > 0.5 ? "white" : undefined,
              }}
              title={isPad ? "padding (0)" : `${v}`}
            >
              {isPad ? "0" : fmt(v as number)}
            </div>
          );
        }),
      )}
    </div>
  );
}

// ====================================================================
// Mode 4 — Pooling
// ====================================================================

const POOL_INPUT: number[][] = [
  [1, 3, 2, 4],
  [5, 6, 1, 2],
  [3, 1, 2, 9],
  [7, 8, 4, 3],
];

function PoolView() {
  const [type, setType] = useState<"max" | "avg">("max");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const outH = 2;
  const outW = 2;
  const totalSteps = outH * outW;

  const output = useMemo(() => {
    const out: number[][] = [];
    for (let or = 0; or < outH; or++) {
      const row: number[] = [];
      for (let oc = 0; oc < outW; oc++) {
        const vals: number[] = [];
        for (let r = 0; r < 2; r++)
          for (let c = 0; c < 2; c++)
            vals.push(POOL_INPUT[or * 2 + r][oc * 2 + c]);
        row.push(type === "max" ? Math.max(...vals) : vals.reduce((a, b) => a + b, 0) / 4);
      }
      out.push(row);
    }
    return out;
  }, [type]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= totalSteps - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 900);
    return () => clearInterval(id);
  }, [playing]);

  const or = Math.floor(step / outW);
  const oc = step % outW;

  const window: number[] = [];
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 2; c++) window.push(POOL_INPUT[or * 2 + r][oc * 2 + c]);
  const result =
    type === "max" ? Math.max(...window) : window.reduce((a, b) => a + b, 0) / 4;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Label inline>Pool-type:</Label>
        <button
          type="button"
          onClick={() => setType("max")}
          className={`px-3 py-1 text-xs rounded border ${
            type === "max"
              ? "border-brand bg-brand/10 text-brand"
              : "border-border hover:bg-muted"
          }`}
        >
          Max pooling
        </button>
        <button
          type="button"
          onClick={() => setType("avg")}
          className={`px-3 py-1 text-xs rounded border ${
            type === "avg"
              ? "border-brand bg-brand/10 text-brand"
              : "border-border hover:bg-muted"
          }`}
        >
          Average pooling
        </button>
      </div>

      <Controls
        playing={playing}
        onPlay={() => {
          if (step >= totalSteps - 1) setStep(0);
          setPlaying((p) => !p);
        }}
        onStep={() => setStep((s) => Math.min(totalSteps - 1, s + 1))}
        onBack={() => setStep((s) => Math.max(0, s - 1))}
        onReset={() => {
          setStep(0);
          setPlaying(false);
        }}
        info={`Vindu (${or}, ${oc}) — steg ${step + 1}/${totalSteps}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-5 items-start">
        <div>
          <Label>Input 4×4</Label>
          <Grid2D
            data={POOL_INPUT}
            cellSize={48}
            tint={(v) => shade(v, 0, 9)}
            textWhite={(v) => v > 5}
            highlight={(r, c) =>
              r >= or * 2 && r < or * 2 + 2 && c >= oc * 2 && c < oc * 2 + 2
            }
          />
        </div>

        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <Label>Vindu 2×2 → {type === "max" ? "max" : "gjennomsnitt"}</Label>
          <div className="flex items-center gap-2 font-mono text-sm flex-wrap">
            <SmallGrid
              data={[
                [window[0], window[1]],
                [window[2], window[3]],
              ]}
              title="vindu"
              highlight
            />
            <Op>{type === "max" ? "max =" : "avg ="}</Op>
            <div className="px-3 h-12 rounded-lg border-2 border-success bg-success/10 font-mono text-sm flex items-center justify-center text-success font-semibold">
              {fmt(result)}
            </div>
          </div>
          {type === "max" ? (
            <div className="text-[11px] text-muted-foreground mt-2">
              max({window.join(", ")}) = {fmt(result)}
            </div>
          ) : (
            <div className="text-[11px] text-muted-foreground mt-2">
              ({window.join(" + ")}) / 4 = {fmt(result)}
            </div>
          )}
        </div>

        <div>
          <Label>Output 2×2</Label>
          <Grid2D
            data={output}
            cellSize={48}
            tint={(v) => shade(v, 0, 9)}
            textWhite={(v) => v > 5}
            highlight={(r, c) => r === or && c === oc}
            hideUnvisited={(r, c) => r * outW + c > step}
          />
        </div>
      </div>

      <Hint>
        Pooling 2×2 med stride 2 halverer dimensjonen ({POOL_INPUT.length}×
        {POOL_INPUT[0].length} → {outH}×{outW}). Max bevarer skarpe trekk (en kant
        forsvinner ikke), avg glatter ut. Ingen lærbare vekter — det er bare
        en deterministisk reduksjon.
      </Hint>
    </div>
  );
}

// ====================================================================
// Mode 5 — Filter-galleri
// ====================================================================

// 8x8 "bilde": en stilisert bokstav L (vertikal strek + horisontal sokkel)
// pluss en liten skrå tagger nederst til høyre, slik at filtrene gir tydelig
// forskjellige aktiveringer.
function letterImage8(): number[][] {
  const m: number[][] = Array.from({ length: 8 }, () => Array(8).fill(0));
  for (let r = 1; r < 7; r++) m[r][2] = 1;
  for (let c = 2; c < 7; c++) m[6][c] = 1;
  for (let i = 0; i < 4; i++) m[3 + i][3 + i] = 1; // diagonal taggi
  return m;
}

const GALLERY_KERNELS: { name: string; describe: string; k: Kernel2D }[] = [
  {
    name: "Vertikal kant",
    describe: "lyser opp der det er en vertikal strek",
    k: [
      [-1, 2, -1],
      [-1, 2, -1],
      [-1, 2, -1],
    ],
  },
  {
    name: "Horisontal kant",
    describe: "lyser opp der det er en horisontal strek",
    k: [
      [-1, -1, -1],
      [2, 2, 2],
      [-1, -1, -1],
    ],
  },
  {
    name: "Diagonal",
    describe: "fanger opp skrå kanter (↘)",
    k: [
      [2, -1, -1],
      [-1, 2, -1],
      [-1, -1, 2],
    ],
  },
  {
    name: "Blur",
    describe: "glatter ut alt — ingen mønster-deteksjon",
    k: [
      [1 / 9, 1 / 9, 1 / 9],
      [1 / 9, 1 / 9, 1 / 9],
      [1 / 9, 1 / 9, 1 / 9],
    ],
  },
];

function GalleryView() {
  const input = letterImage8();
  const results = GALLERY_KERNELS.map((g) => ({
    ...g,
    out: conv2d(input, g.k, 1, 0),
  }));
  const absMax = Math.max(
    1,
    ...results.flatMap((r) => r.out.flat().map((v) => Math.abs(v))),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row gap-5 items-start">
        <div>
          <Label>Input 8×8 (en stilisert "L" med diagonal tagg)</Label>
          <Grid2D
            data={input}
            cellSize={28}
            tint={(v) => shade(v, 0, 1)}
            textWhite={(v) => v > 0.5}
          />
        </div>
        <div className="text-sm text-muted-foreground flex-1">
          Samme bilde går gjennom fire forskjellige 3×3-kjerner. Hver kjerne
          "leter" etter sitt mønster — sterk aktivering (rød) der mønsteret er
          tydelig, ~0 (lyst) der det ikke finnes. Dette er hele intuisjonen bak
          CNN: i ekte nett læres slike filtre automatisk fra data.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((r) => (
          <div
            key={r.name}
            className="rounded-xl border border-border bg-muted/10 p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm font-semibold">{r.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {r.describe}
                </div>
              </div>
              <SmallGrid data={r.k} title="kjerne" highlight tight />
            </div>
            <div>
              <Label>Aktiveringskart {r.out.length}×{r.out[0].length}</Label>
              <Grid2D
                data={r.out}
                cellSize={28}
                tint={(v) => activationTint(v, absMax)}
              />
            </div>
          </div>
        ))}
      </div>

      <Hint>
        Legg merke til at vertikal-kant-filteret tenner kraftig på kolonnen der
        L-streken står, mens horisontal-kant-filteret tenner på sokkelen.
        Diagonal-filteret finner den lille skrå taggen. Blur-filteret gir bare
        et utvasket bilde — det "leter" ikke etter noe spesifikt. Når CNN
        trener, oppdager den selv hvilke filtre som er nyttige.
      </Hint>
    </div>
  );
}

// ====================================================================
// Delkomponenter
// ====================================================================

function Controls({
  playing,
  onPlay,
  onStep,
  onBack,
  onReset,
  info,
}: {
  playing: boolean;
  onPlay: () => void;
  onStep: () => void;
  onBack: () => void;
  onReset: () => void;
  info?: string;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={onPlay}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md border border-brand bg-brand/10 text-brand hover:bg-brand/20"
      >
        {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        {playing ? "Pause" : "Spill av"}
      </button>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 px-2 py-1.5 text-xs rounded-md border border-border hover:bg-muted"
      >
        <SkipBack className="h-3 w-3" />
      </button>
      <button
        type="button"
        onClick={onStep}
        className="inline-flex items-center gap-1 px-2 py-1.5 text-xs rounded-md border border-border hover:bg-muted"
      >
        <SkipForward className="h-3 w-3" />
        Neste
      </button>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-1 px-2 py-1.5 text-xs rounded-md border border-border hover:bg-muted text-muted-foreground"
      >
        <RotateCcw className="h-3 w-3" />
        Reset
      </button>
      {info && (
        <span className="text-[11px] text-muted-foreground ml-2 font-mono">
          {info}
        </span>
      )}
    </div>
  );
}

function Label({
  children,
  inline,
}: {
  children: React.ReactNode;
  inline?: boolean;
}) {
  return (
    <div
      className={`text-[10px] uppercase tracking-wider text-muted-foreground ${
        inline ? "inline" : "mb-1"
      }`}
    >
      {children}
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground leading-relaxed">
      {children}
    </div>
  );
}

function Op({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-base text-muted-foreground self-center px-1">
      {children}
    </div>
  );
}

function Grid2D({
  data,
  cellSize,
  highlight,
  tint,
  textWhite,
  hideUnvisited,
}: {
  data: number[][];
  cellSize: number;
  highlight?: (r: number, c: number) => boolean;
  tint?: (v: number) => string;
  textWhite?: (v: number) => boolean;
  hideUnvisited?: (r: number, c: number) => boolean;
}) {
  if (data.length === 0) return null;
  return (
    <div
      className="inline-grid gap-[2px] p-1 rounded border border-border bg-background"
      style={{ gridTemplateColumns: `repeat(${data[0].length}, ${cellSize}px)` }}
    >
      {data.flatMap((row, r) =>
        row.map((v, c) => {
          const hi = highlight?.(r, c);
          const hidden = hideUnvisited?.(r, c);
          return (
            <div
              key={`${r}-${c}`}
              className={`flex items-center justify-center font-mono rounded-sm border transition-all ${
                hi
                  ? "border-brand ring-2 ring-brand/50 z-10"
                  : "border-border/60"
              } ${hidden ? "opacity-20" : ""}`}
              style={{
                width: cellSize,
                height: cellSize,
                fontSize: cellSize < 26 ? 9 : cellSize < 36 ? 10 : 11,
                background: hidden
                  ? undefined
                  : tint
                    ? tint(v)
                    : undefined,
                color: !hidden && textWhite?.(v) ? "white" : undefined,
              }}
              title={`(${r},${c}) = ${fmt(v)}`}
            >
              {hidden ? "" : fmt(v)}
            </div>
          );
        }),
      )}
    </div>
  );
}

function SmallGrid({
  data,
  title,
  highlight,
  tight,
}: {
  data: number[][];
  title?: string;
  highlight?: boolean;
  tight?: boolean;
}) {
  const size = tight ? 22 : 28;
  return (
    <div className="inline-flex flex-col items-center">
      {title && (
        <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">
          {title}
        </div>
      )}
      <div
        className={`inline-grid gap-[2px] p-1 rounded border ${
          highlight ? "border-brand bg-brand/5" : "border-border bg-card"
        }`}
        style={{ gridTemplateColumns: `repeat(${data[0].length}, ${size}px)` }}
      >
        {data.flatMap((row, r) =>
          row.map((v, c) => (
            <div
              key={`${r}-${c}`}
              className="flex items-center justify-center font-mono text-[10px] rounded-sm border border-border/40 bg-background"
              style={{ width: size, height: size }}
            >
              {fmt(v)}
            </div>
          )),
        )}
      </div>
    </div>
  );
}
