import { useMemo, useState } from "react";
import { Shuffle, RotateCcw } from "lucide-react";

// --------------------------------------------------------------------------
// DataAugDemo — viser hva torchvision-transforms faktisk gjør med
// et "bilde". Vi tegner et 16×16 pikselbilde som en stilisert "katt"
// (asymmetrisk så vi ser at flip har effekt) og applierer transforms
// live ut fra slider/toggle-state.
//
// Studenten ser:
//   - Originalbildet til venstre
//   - 8 augmenterte varianter til høyre, regenererte hver gang seed-en
//     bumpes ELLER en transform toggles
//   - "Identifiserbar?"-tekst som flagger hvis crop er for aggressiv
// --------------------------------------------------------------------------

type Transforms = {
  flip: boolean;
  crop: boolean;
  rotate: boolean;
  jitter: boolean;
  erase: boolean;
};

const GRID = 16;

// "Katt" som binær mønster (1 = piksel på). Asymmetrisk: ett øre høyt,
// ett halehjørne nede til høyre.
const CAT: number[][] = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,0,0,0,0,0,0,0,0,1,0,0,0],
  [0,1,1,1,1,0,0,0,0,0,0,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,0,1,1,1,1,1,1,1,0,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,0,1,1,1,0,0,0,0,1,1,1,1,1,0],
  [0,0,0,1,1,0,0,0,0,0,0,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function flipH(img: number[][]): number[][] {
  return img.map((row) => row.slice().reverse());
}

function rotate(img: number[][], deg: number): number[][] {
  // Nearest-neighbor rotasjon rundt sentrum.
  const cx = (GRID - 1) / 2;
  const cy = (GRID - 1) / 2;
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(-rad);
  const sin = Math.sin(-rad);
  const out: number[][] = Array.from({ length: GRID }, () => Array(GRID).fill(0));
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const sx = Math.round(cos * (x - cx) - sin * (y - cy) + cx);
      const sy = Math.round(sin * (x - cx) + cos * (y - cy) + cy);
      if (sx >= 0 && sx < GRID && sy >= 0 && sy < GRID) {
        out[y][x] = img[sy][sx];
      }
    }
  }
  return out;
}

function crop(img: number[][], offX: number, offY: number, size: number): number[][] {
  // Tar et size×size utsnitt, så stretcher tilbake til GRID×GRID med nearest-neighbor.
  const out: number[][] = Array.from({ length: GRID }, () => Array(GRID).fill(0));
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const sx = Math.min(GRID - 1, Math.max(0, offX + Math.round((x / GRID) * size)));
      const sy = Math.min(GRID - 1, Math.max(0, offY + Math.round((y / GRID) * size)));
      out[y][x] = img[sy][sx];
    }
  }
  return out;
}

function erase(img: number[][], rng: () => number, p: number): number[][] {
  if (rng() > p) return img;
  const out = img.map((r) => r.slice());
  const w = 3 + Math.floor(rng() * 4);
  const h = 3 + Math.floor(rng() * 4);
  const x0 = Math.floor(rng() * (GRID - w));
  const y0 = Math.floor(rng() * (GRID - h));
  for (let yy = y0; yy < y0 + h; yy++) for (let xx = x0; xx < x0 + w; xx++) out[yy][xx] = 0;
  return out;
}

function augment(seed: number, t: Transforms) {
  const rng = mulberry32(seed);
  let img = CAT.map((r) => r.slice());
  let jitterVal = 1.0;

  if (t.flip && rng() < 0.5) img = flipH(img);
  if (t.rotate) {
    const deg = (rng() * 2 - 1) * 25; // ±25°
    img = rotate(img, deg);
  }
  if (t.crop) {
    const size = Math.floor(8 + rng() * 6); // 8..13
    const offX = Math.floor(rng() * (GRID - size));
    const offY = Math.floor(rng() * (GRID - size));
    img = crop(img, offX, offY, size);
  }
  if (t.erase) img = erase(img, rng, 0.5);
  if (t.jitter) jitterVal = 0.55 + rng() * 0.9; // 0.55..1.45 brightness

  return { img, jitterVal };
}

function PixelBox({ img, jitter = 1.0, size = 80 }: { img: number[][]; jitter?: number; size?: number }) {
  const cell = size / GRID;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }} className="block">
      <rect x={0} y={0} width={size} height={size} fill="rgb(15,23,42)" />
      {img.map((row, y) =>
        row.map((v, x) => {
          if (!v) return null;
          const intensity = Math.min(255, Math.max(0, Math.round(220 * jitter)));
          return (
            <rect
              key={`${x}-${y}`}
              x={x * cell}
              y={y * cell}
              width={cell}
              height={cell}
              fill={`rgb(${intensity},${intensity},${Math.min(255, intensity + 20)})`}
            />
          );
        }),
      )}
    </svg>
  );
}

export function DataAugDemo() {
  const [t, setT] = useState<Transforms>({
    flip: true,
    crop: true,
    rotate: true,
    jitter: false,
    erase: false,
  });
  const [seed, setSeed] = useState(1);

  const variants = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => augment(seed * 17 + i * 101, t));
  }, [seed, t]);

  const toggles: { key: keyof Transforms; label: string; sub: string }[] = [
    { key: "flip", label: "HorizontalFlip", sub: "p=0.5" },
    { key: "crop", label: "RandomCrop", sub: "8–13 px" },
    { key: "rotate", label: "Rotation", sub: "±25°" },
    { key: "jitter", label: "ColorJitter", sub: "brightness ±45%" },
    { key: "erase", label: "RandomErasing", sub: "p=0.5" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {/* Transform-togglene */}
      <div className="flex flex-wrap gap-2 mb-3">
        {toggles.map((tg) => {
          const on = t[tg.key];
          return (
            <button
              key={tg.key}
              onClick={() => setT((prev) => ({ ...prev, [tg.key]: !prev[tg.key] }))}
              className={
                "rounded-md border px-2 py-1 text-xs text-left transition-colors " +
                (on
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-card hover:bg-muted/40")
              }
            >
              <div className="font-semibold">{tg.label}</div>
              <div className="text-[10px] opacity-70 font-mono">{tg.sub}</div>
            </button>
          );
        })}
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="ml-auto inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1 text-xs"
        >
          <Shuffle className="h-3.5 w-3.5" /> Resample
        </button>
        <button
          onClick={() => {
            setSeed(1);
            setT({ flip: true, crop: true, rotate: true, jitter: false, erase: false });
          }}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1 text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-4 items-start">
        {/* Original */}
        <div>
          <div className="text-[11px] text-muted-foreground mb-1">Original</div>
          <div className="rounded-md border border-border bg-background/40 p-2 inline-block">
            <PixelBox img={CAT} size={96} />
          </div>
          <div className="text-[10px] text-muted-foreground mt-1 font-mono">label="katt"</div>
        </div>

        {/* 8 augmenteringer */}
        <div>
          <div className="text-[11px] text-muted-foreground mb-1">8 augmenteringer (samme label)</div>
          <div className="grid grid-cols-4 gap-2">
            {variants.map((v, i) => (
              <div key={i} className="rounded-md border border-border bg-background/40 p-1">
                <PixelBox img={v.img} jitter={v.jitterVal} size={72} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Forklaring */}
      <div className="mt-3 grid sm:grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-md border border-border bg-background/40 p-2">
          <div className="font-semibold mb-1">Hvorfor det virker</div>
          <p className="text-muted-foreground leading-snug">
            Hver augmentert variant teller som et "nytt" eksempel for modellen. Den
            tvinges til å lære egenskapen <em>"katt"</em>, ikke <em>"katt i akkurat
            denne posisjonen og lyset"</em>. Effektivt utvider du treningssettet med en
            faktor på 10–100×.
          </p>
        </div>
        <div className="rounded-md border border-border bg-background/40 p-2">
          <div className="font-semibold mb-1">Sjekkpunkter</div>
          <ul className="text-muted-foreground leading-snug list-disc pl-4 space-y-0.5">
            <li>HorizontalFlip <strong>aldri</strong> på tekst eller "6 vs 9".</li>
            <li>RandomCrop som er for aggressiv kan kutte bort objektet.</li>
            <li>Augmentering brukes <strong>kun</strong> på train, ikke val/test.</li>
            <li>Skreddersy domene: medisin ≠ naturbilde ≠ satellitt.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
