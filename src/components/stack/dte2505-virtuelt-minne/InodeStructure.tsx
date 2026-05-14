import { useMemo, useState } from "react";
import { Tex, TexBlock } from "@/components/Tex";

/**
 * Inode-struktur — fysisk visualisering av Unix-stil inode med
 * direkte, indirect, double-indirect og triple-indirect pekere.
 *
 * Antagelser (klassisk):
 *   - Blokkstørrelse: 4 KB (justerbar 1/2/4/8 KB)
 *   - Peker-størrelse: 32-bit (4 B) ⇒ 1024 pekere per indirect-blokk
 *     (eller 4096/8/etc. avhengig av blokk-størrelse)
 *   - 12 direkte pekere
 *
 * Brukeren drar slider for filstørrelse (1 KB → 4 TB), og vi farger
 * pekergrenene som faktisk er aktive. Maks-filstørrelse vises live.
 */

const DIRECT = 12;
const POINTER_BYTES = 4; // 32-bit pointers
const BLOCK_SIZE_OPTIONS = [
  { label: "1 KB", bytes: 1024 },
  { label: "2 KB", bytes: 2048 },
  { label: "4 KB", bytes: 4096 },
  { label: "8 KB", bytes: 8192 },
];

function formatBytes(b: number): string {
  if (b === 0) return "0 B";
  if (b < 1024) return `${b} B`;
  const units = ["KB", "MB", "GB", "TB", "PB"];
  let n = b / 1024;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2)} ${units[i]}`;
}

type Computed = {
  blockSize: number;
  pointersPerBlock: number;
  /** Max bytes addressable by direct pointers alone. */
  directCap: number;
  /** Max bytes addressable by one indirect (singleton) tier. */
  indirectCap: number;
  /** Max bytes addressable by one double-indirect tier. */
  doubleCap: number;
  /** Max bytes addressable by one triple-indirect tier. */
  tripleCap: number;
  /** Sum (overall maximum file size). */
  maxFile: number;
  /** How many blocks of each tier are used for the current file size. */
  usage: {
    direct: number; // 0..12
    indirect: number; // 0..1
    double: number; // 0..1
    triple: number; // 0..1
    /** Tier that is "tipping" the file size in: highest tier with usage > 0. */
    highest: "none" | "direct" | "indirect" | "double" | "triple";
  };
};

function compute(fileSize: number, blockSize: number): Computed {
  const pointersPerBlock = blockSize / POINTER_BYTES;
  const directCap = DIRECT * blockSize;
  const indirectCap = pointersPerBlock * blockSize;
  const doubleCap = pointersPerBlock * pointersPerBlock * blockSize;
  const tripleCap =
    pointersPerBlock * pointersPerBlock * pointersPerBlock * blockSize;
  const maxFile = directCap + indirectCap + doubleCap + tripleCap;

  let remaining = fileSize;
  // Direct
  const direct = Math.min(DIRECT, Math.ceil(remaining / blockSize));
  remaining = Math.max(0, remaining - DIRECT * blockSize);
  const indirect = remaining > 0 ? 1 : 0;
  remaining = Math.max(0, remaining - indirectCap);
  const double = remaining > 0 ? 1 : 0;
  remaining = Math.max(0, remaining - doubleCap);
  const triple = remaining > 0 ? 1 : 0;

  const highest: Computed["usage"]["highest"] =
    triple > 0
      ? "triple"
      : double > 0
        ? "double"
        : indirect > 0
          ? "indirect"
          : direct > 0
            ? "direct"
            : "none";

  return {
    blockSize,
    pointersPerBlock,
    directCap,
    indirectCap,
    doubleCap,
    tripleCap,
    maxFile,
    usage: { direct, indirect, double, triple, highest },
  };
}

const SLIDER_STEPS = 200;

/** Logaritmisk slider [0..200] → bytes (1 B .. 4 TB). */
function sliderToBytes(t: number, maxBytes: number): number {
  const minLog = 0; // 2^0 = 1 byte
  const maxLog = Math.log2(maxBytes);
  const ratio = t / SLIDER_STEPS;
  return Math.round(Math.pow(2, minLog + ratio * (maxLog - minLog)));
}

function bytesToSlider(bytes: number, maxBytes: number): number {
  const minLog = 0;
  const maxLog = Math.log2(maxBytes);
  const log = Math.log2(Math.max(1, bytes));
  return Math.round(((log - minLog) / (maxLog - minLog)) * SLIDER_STEPS);
}

export function InodeStructure() {
  const [blockSizeIdx, setBlockSizeIdx] = useState(2); // 4 KB default
  const blockSize = BLOCK_SIZE_OPTIONS[blockSizeIdx].bytes;
  const maxBytes = useMemo(() => {
    const c = compute(0, blockSize);
    return c.maxFile;
  }, [blockSize]);
  // Default file: just over directCap to demonstrate indirect.
  const defaultBytes = DIRECT * blockSize + blockSize * 4;
  const [sliderT, setSliderT] = useState(() =>
    bytesToSlider(defaultBytes, maxBytes),
  );
  const fileSize = sliderToBytes(sliderT, maxBytes);
  const c = compute(fileSize, blockSize);
  const u = c.usage;

  function highlightClass(active: boolean, color: string): string {
    return active
      ? `${color} ring-2 ring-offset-1 ring-offset-background`
      : "bg-muted/30 border-border text-muted-foreground";
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Controls */}
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <label className="block text-xs text-muted-foreground">
          <div className="flex justify-between mb-1">
            <span>Filstørrelse</span>
            <span className="font-mono text-foreground">
              {formatBytes(fileSize)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={SLIDER_STEPS}
            step={1}
            value={sliderT}
            onChange={(e) => setSliderT(parseInt(e.target.value, 10))}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] mt-0.5 opacity-60 font-mono">
            <span>1 B</span>
            <span>{formatBytes(maxBytes)}</span>
          </div>
        </label>
        <div>
          <div className="text-xs text-muted-foreground mb-1">
            Blokkstørrelse
          </div>
          <div className="flex flex-wrap gap-1.5">
            {BLOCK_SIZE_OPTIONS.map((o, i) => (
              <button
                key={o.label}
                type="button"
                onClick={() => setBlockSizeIdx(i)}
                className={`text-xs rounded-md border px-3 py-1.5 transition-colors ${
                  blockSizeIdx === i
                    ? "border-brand bg-brand/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-brand/40"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-muted-foreground mt-2">
            Pointer = 32-bit (4 B) ⇒{" "}
            <span className="font-mono text-foreground">
              {c.pointersPerBlock.toLocaleString()}
            </span>{" "}
            pekere per indirect-blokk.
          </div>
        </div>
      </div>

      {/* Inode SVG */}
      <div className="rounded-lg border border-border bg-background p-3 mb-4 overflow-x-auto">
        <svg
          viewBox="0 0 700 360"
          className="w-full max-w-[700px] mx-auto block"
          style={{ minWidth: 540 }}
          role="img"
          aria-label="Inode-struktur med direkte og indirect pekere"
        >
          {/* Inode box */}
          <g>
            <rect
              x="10"
              y="10"
              width="160"
              height="340"
              rx="8"
              className="fill-card stroke-border"
              strokeWidth="1.5"
            />
            <text
              x="90"
              y="32"
              textAnchor="middle"
              className="fill-foreground text-[11px] font-semibold"
            >
              INODE
            </text>
            <line
              x1="20"
              y1="42"
              x2="160"
              y2="42"
              className="stroke-border"
              strokeWidth="1"
            />
            {/* Metadata fields */}
            <text x="22" y="58" className="fill-muted-foreground text-[9px]">
              mode (rwxrwxrwx)
            </text>
            <text x="22" y="72" className="fill-muted-foreground text-[9px]">
              uid / gid
            </text>
            <text x="22" y="86" className="fill-muted-foreground text-[9px]">
              size: {formatBytes(fileSize)}
            </text>
            <text x="22" y="100" className="fill-muted-foreground text-[9px]">
              atime / mtime / ctime
            </text>
            <text x="22" y="114" className="fill-muted-foreground text-[9px]">
              link count
            </text>
            <line
              x1="20"
              y1="122"
              x2="160"
              y2="122"
              className="stroke-border"
              strokeWidth="1"
            />
            {/* Direct pointers — 12 slots in a 3-col grid */}
            {Array.from({ length: 12 }).map((_, i) => {
              const col = i % 3;
              const row = Math.floor(i / 3);
              const x = 22 + col * 46;
              const y = 130 + row * 22;
              const active = i < u.direct;
              return (
                <g key={`d${i}`}>
                  <rect
                    x={x}
                    y={y}
                    width="42"
                    height="18"
                    rx="3"
                    className={
                      active
                        ? "fill-emerald-500/25 stroke-emerald-500"
                        : "fill-muted stroke-border"
                    }
                    strokeWidth="1"
                  />
                  <text
                    x={x + 21}
                    y={y + 12}
                    textAnchor="middle"
                    className={
                      active
                        ? "fill-emerald-700 dark:fill-emerald-300 text-[9px] font-mono"
                        : "fill-muted-foreground text-[9px] font-mono"
                    }
                  >
                    d{i}
                  </text>
                </g>
              );
            })}
            <text x="90" y="222" textAnchor="middle" className="fill-muted-foreground text-[8.5px]">
              12 direkte
            </text>
            {/* Indirect pointer */}
            <rect
              x="22"
              y="232"
              width="136"
              height="22"
              rx="3"
              className={
                u.indirect > 0
                  ? "fill-sky-500/25 stroke-sky-500"
                  : "fill-muted stroke-border"
              }
              strokeWidth="1"
            />
            <text
              x="90"
              y="247"
              textAnchor="middle"
              className={
                u.indirect > 0
                  ? "fill-sky-700 dark:fill-sky-300 text-[10px] font-mono"
                  : "fill-muted-foreground text-[10px] font-mono"
              }
            >
              indirect
            </text>
            {/* Double */}
            <rect
              x="22"
              y="260"
              width="136"
              height="22"
              rx="3"
              className={
                u.double > 0
                  ? "fill-violet-500/25 stroke-violet-500"
                  : "fill-muted stroke-border"
              }
              strokeWidth="1"
            />
            <text
              x="90"
              y="275"
              textAnchor="middle"
              className={
                u.double > 0
                  ? "fill-violet-700 dark:fill-violet-300 text-[10px] font-mono"
                  : "fill-muted-foreground text-[10px] font-mono"
              }
            >
              double-indirect
            </text>
            {/* Triple */}
            <rect
              x="22"
              y="288"
              width="136"
              height="22"
              rx="3"
              className={
                u.triple > 0
                  ? "fill-rose-500/25 stroke-rose-500"
                  : "fill-muted stroke-border"
              }
              strokeWidth="1"
            />
            <text
              x="90"
              y="303"
              textAnchor="middle"
              className={
                u.triple > 0
                  ? "fill-rose-700 dark:fill-rose-300 text-[10px] font-mono"
                  : "fill-muted-foreground text-[10px] font-mono"
              }
            >
              triple-indirect
            </text>
          </g>

          {/* Data block clusters and pointer chains */}
          {/* Direct → data block */}
          <line
            x1="170"
            y1="170"
            x2="230"
            y2="170"
            className={u.direct > 0 ? "stroke-emerald-500" : "stroke-border"}
            strokeWidth="1.5"
          />
          <rect
            x="230"
            y="156"
            width="60"
            height="28"
            rx="3"
            className={
              u.direct > 0
                ? "fill-emerald-500/15 stroke-emerald-500"
                : "fill-muted stroke-border"
            }
            strokeWidth="1"
          />
          <text
            x="260"
            y="174"
            textAnchor="middle"
            className="fill-foreground text-[9px] font-mono"
          >
            data
          </text>
          <text
            x="260"
            y="200"
            textAnchor="middle"
            className="fill-muted-foreground text-[8.5px]"
          >
            {u.direct}/{DIRECT} brukt
          </text>

          {/* Indirect chain */}
          <line
            x1="170"
            y1="243"
            x2="230"
            y2="243"
            className={u.indirect > 0 ? "stroke-sky-500" : "stroke-border"}
            strokeWidth="1.5"
          />
          <rect
            x="230"
            y="228"
            width="60"
            height="30"
            rx="3"
            className={
              u.indirect > 0
                ? "fill-sky-500/15 stroke-sky-500"
                : "fill-muted stroke-border"
            }
            strokeWidth="1"
          />
          <text
            x="260"
            y="240"
            textAnchor="middle"
            className="fill-foreground text-[8.5px] font-mono"
          >
            indir.
          </text>
          <text
            x="260"
            y="252"
            textAnchor="middle"
            className="fill-muted-foreground text-[8.5px] font-mono"
          >
            {c.pointersPerBlock} ptrs
          </text>
          <line
            x1="290"
            y1="243"
            x2="350"
            y2="243"
            className={u.indirect > 0 ? "stroke-sky-500" : "stroke-border"}
            strokeWidth="1.5"
          />
          <rect
            x="350"
            y="228"
            width="60"
            height="30"
            rx="3"
            className={
              u.indirect > 0
                ? "fill-sky-500/15 stroke-sky-500"
                : "fill-muted stroke-border"
            }
            strokeWidth="1"
          />
          <text
            x="380"
            y="247"
            textAnchor="middle"
            className="fill-foreground text-[9px] font-mono"
          >
            data
          </text>

          {/* Double chain */}
          <line
            x1="170"
            y1="271"
            x2="230"
            y2="271"
            className={u.double > 0 ? "stroke-violet-500" : "stroke-border"}
            strokeWidth="1.5"
          />
          <rect
            x="230"
            y="262"
            width="60"
            height="18"
            rx="3"
            className={
              u.double > 0
                ? "fill-violet-500/15 stroke-violet-500"
                : "fill-muted stroke-border"
            }
            strokeWidth="1"
          />
          <text
            x="260"
            y="275"
            textAnchor="middle"
            className="fill-foreground text-[8.5px] font-mono"
          >
            indir.
          </text>
          <line
            x1="290"
            y1="271"
            x2="350"
            y2="271"
            className={u.double > 0 ? "stroke-violet-500" : "stroke-border"}
            strokeWidth="1.5"
          />
          <rect
            x="350"
            y="262"
            width="60"
            height="18"
            rx="3"
            className={
              u.double > 0
                ? "fill-violet-500/15 stroke-violet-500"
                : "fill-muted stroke-border"
            }
            strokeWidth="1"
          />
          <text
            x="380"
            y="275"
            textAnchor="middle"
            className="fill-foreground text-[8.5px] font-mono"
          >
            indir.
          </text>
          <line
            x1="410"
            y1="271"
            x2="470"
            y2="271"
            className={u.double > 0 ? "stroke-violet-500" : "stroke-border"}
            strokeWidth="1.5"
          />
          <rect
            x="470"
            y="262"
            width="60"
            height="18"
            rx="3"
            className={
              u.double > 0
                ? "fill-violet-500/15 stroke-violet-500"
                : "fill-muted stroke-border"
            }
            strokeWidth="1"
          />
          <text
            x="500"
            y="275"
            textAnchor="middle"
            className="fill-foreground text-[8.5px] font-mono"
          >
            data
          </text>

          {/* Triple chain */}
          <line
            x1="170"
            y1="299"
            x2="230"
            y2="299"
            className={u.triple > 0 ? "stroke-rose-500" : "stroke-border"}
            strokeWidth="1.5"
          />
          <rect
            x="230"
            y="290"
            width="50"
            height="18"
            rx="3"
            className={
              u.triple > 0
                ? "fill-rose-500/15 stroke-rose-500"
                : "fill-muted stroke-border"
            }
            strokeWidth="1"
          />
          <text
            x="255"
            y="303"
            textAnchor="middle"
            className="fill-foreground text-[8.5px] font-mono"
          >
            indir.
          </text>
          <line
            x1="280"
            y1="299"
            x2="330"
            y2="299"
            className={u.triple > 0 ? "stroke-rose-500" : "stroke-border"}
            strokeWidth="1.5"
          />
          <rect
            x="330"
            y="290"
            width="50"
            height="18"
            rx="3"
            className={
              u.triple > 0
                ? "fill-rose-500/15 stroke-rose-500"
                : "fill-muted stroke-border"
            }
            strokeWidth="1"
          />
          <text
            x="355"
            y="303"
            textAnchor="middle"
            className="fill-foreground text-[8.5px] font-mono"
          >
            indir.
          </text>
          <line
            x1="380"
            y1="299"
            x2="430"
            y2="299"
            className={u.triple > 0 ? "stroke-rose-500" : "stroke-border"}
            strokeWidth="1.5"
          />
          <rect
            x="430"
            y="290"
            width="50"
            height="18"
            rx="3"
            className={
              u.triple > 0
                ? "fill-rose-500/15 stroke-rose-500"
                : "fill-muted stroke-border"
            }
            strokeWidth="1"
          />
          <text
            x="455"
            y="303"
            textAnchor="middle"
            className="fill-foreground text-[8.5px] font-mono"
          >
            indir.
          </text>
          <line
            x1="480"
            y1="299"
            x2="530"
            y2="299"
            className={u.triple > 0 ? "stroke-rose-500" : "stroke-border"}
            strokeWidth="1.5"
          />
          <rect
            x="530"
            y="290"
            width="50"
            height="18"
            rx="3"
            className={
              u.triple > 0
                ? "fill-rose-500/15 stroke-rose-500"
                : "fill-muted stroke-border"
            }
            strokeWidth="1"
          />
          <text
            x="555"
            y="303"
            textAnchor="middle"
            className="fill-foreground text-[8.5px] font-mono"
          >
            data
          </text>

          {/* Tier capacity labels */}
          <text
            x="595"
            y="174"
            className="fill-muted-foreground text-[8.5px] font-mono"
          >
            ≤ {formatBytes(c.directCap)}
          </text>
          <text
            x="595"
            y="247"
            className="fill-muted-foreground text-[8.5px] font-mono"
          >
            ≤ {formatBytes(c.indirectCap)}
          </text>
          <text
            x="595"
            y="275"
            className="fill-muted-foreground text-[8.5px] font-mono"
          >
            ≤ {formatBytes(c.doubleCap)}
          </text>
          <text
            x="595"
            y="303"
            className="fill-muted-foreground text-[8.5px] font-mono"
          >
            ≤ {formatBytes(c.tripleCap)}
          </text>
        </svg>
      </div>

      {/* Tier usage cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs">
        <div
          className={`rounded-md border p-2 ${highlightClass(
            u.direct > 0,
            "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
          )}`}
        >
          <div className="font-semibold">Direkte</div>
          <div className="font-mono">
            {u.direct} / {DIRECT}
          </div>
          <div className="opacity-70 text-[10px]">
            ≤ {formatBytes(c.directCap)}
          </div>
        </div>
        <div
          className={`rounded-md border p-2 ${highlightClass(
            u.indirect > 0,
            "bg-sky-500/10 border-sky-500/40 text-sky-700 dark:text-sky-300",
          )}`}
        >
          <div className="font-semibold">Indirect</div>
          <div className="font-mono">
            {u.indirect} / 1
          </div>
          <div className="opacity-70 text-[10px]">
            ≤ {formatBytes(c.indirectCap)}
          </div>
        </div>
        <div
          className={`rounded-md border p-2 ${highlightClass(
            u.double > 0,
            "bg-violet-500/10 border-violet-500/40 text-violet-700 dark:text-violet-300",
          )}`}
        >
          <div className="font-semibold">Double-indirect</div>
          <div className="font-mono">
            {u.double} / 1
          </div>
          <div className="opacity-70 text-[10px]">
            ≤ {formatBytes(c.doubleCap)}
          </div>
        </div>
        <div
          className={`rounded-md border p-2 ${highlightClass(
            u.triple > 0,
            "bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-300",
          )}`}
        >
          <div className="font-semibold">Triple-indirect</div>
          <div className="font-mono">
            {u.triple} / 1
          </div>
          <div className="opacity-70 text-[10px]">
            ≤ {formatBytes(c.tripleCap)}
          </div>
        </div>
      </div>

      {/* Math */}
      <div className="rounded-md border border-border bg-background p-3">
        <div className="text-xs text-muted-foreground mb-2">
          Maks-filstørrelse for {BLOCK_SIZE_OPTIONS[blockSizeIdx].label}{" "}
          blokker, 32-bit pekere:
        </div>
        <TexBlock>{
          `\\text{max} = ${DIRECT}\\cdot B + p\\cdot B + p^2 \\cdot B + p^3 \\cdot B`
        }</TexBlock>
        <div className="text-xs text-muted-foreground mb-1">
          med <Tex>{`B = ${c.blockSize}`}</Tex> B og{" "}
          <Tex>{`p = B / 4 = ${c.pointersPerBlock}`}</Tex> pekere per blokk:
        </div>
        <div className="font-mono text-xs text-foreground">
          = {DIRECT}·{c.blockSize}
          {" + "}
          {c.pointersPerBlock}·{c.blockSize}
          {" + "}
          {c.pointersPerBlock}²·{c.blockSize}
          {" + "}
          {c.pointersPerBlock}³·{c.blockSize}
        </div>
        <div className="font-mono text-sm text-brand mt-1">
          = {formatBytes(c.maxFile)}
        </div>
        <div className="text-[11px] text-muted-foreground mt-2">
          Bruker tar i bruk{" "}
          <span className="font-semibold text-foreground">
            {u.highest === "none" ? "ingen pekere" : u.highest}
          </span>{" "}
          for {formatBytes(fileSize)} fil. Total adressert plass av aktive
          tiers: {formatBytes(c.directCap * (u.direct === DIRECT ? 1 : u.direct / DIRECT) + (u.indirect ? c.indirectCap : 0) + (u.double ? c.doubleCap : 0) + (u.triple ? c.tripleCap : 0))}{" "}
          (øvre grense — den faktiske filen er som regel mindre fordi siste
          indirect-blokk bare delvis fylles).
        </div>
      </div>

      <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs">
        <div className="rounded-md border border-border p-2.5">
          <div className="font-semibold text-emerald-500 mb-0.5">
            Hvorfor 12 direkte?
          </div>
          <div className="text-muted-foreground">
            De fleste filer er små. 12 × 4 KB = 48 KB dekker majoriteten av
            filsystemets innhold uten å betale ekstra disk-hopp for å lese en
            indirect-blokk.
          </div>
        </div>
        <div className="rounded-md border border-border p-2.5">
          <div className="font-semibold text-rose-500 mb-0.5">
            Hvorfor flere tiers?
          </div>
          <div className="text-muted-foreground">
            Med 4 KB-blokker når triple-indirect raskt TB-skala. Modernere
            filsystemer (ext4 extents, btrfs, ZFS) bruker B-trær i stedet, men
            inode-modellen er fortsatt eksamenspensum.
          </div>
        </div>
      </div>
    </div>
  );
}
