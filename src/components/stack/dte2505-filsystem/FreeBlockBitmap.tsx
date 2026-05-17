import { useMemo, useState } from "react";

/**
 * FreeBlockBitmap — interaktiv visualisering av et free-block bitmap.
 *
 * 128 blokker (8 × 16). Hver blokk er enten ledig (grønn) eller brukt (rød).
 * Brukeren kan opprette filer av valgbar størrelse — blokker allokeres
 * etter valgt strategi (first-fit / best-fit / next-fit). Sletting frigjør
 * blokkene som filen okkuperte. Strategi-bytte påvirker fragmentering
 * dramatisk over tid; et lite kart viser hvor mange "hull" (frie segmenter)
 * vi har og største sammenhengende ledige strekk.
 *
 * Demo-knappen "Lag fragmentering" simulerer en realistisk fragmentering:
 * mange små filer → slett annenhver → prøv å skrive en stor fil. Med
 * first-fit må den nye filen ofte spres over flere hull, mens best-fit
 * setter den tett i et passende hull (men etterlater små fragments).
 */

const COLS = 16;
const ROWS = 8;
const TOTAL = COLS * ROWS; // 128

type Strategy = "first-fit" | "best-fit" | "next-fit";

type FileEntry = {
  id: number;
  name: string;
  /** Sammenhengende eller fragmentert liste av blokk-indekser. */
  blocks: number[];
  /** Farge for visualisering (HSL hue). */
  hue: number;
};

type Bitmap = Array<number | null>; // null = ledig, ellers file-id

/** Finn alle ledige "runs": [startIndex, length]. */
function findRuns(bm: Bitmap): Array<{ start: number; length: number }> {
  const runs: Array<{ start: number; length: number }> = [];
  let i = 0;
  while (i < bm.length) {
    if (bm[i] === null) {
      let j = i;
      while (j < bm.length && bm[j] === null) j++;
      runs.push({ start: i, length: j - i });
      i = j;
    } else {
      i++;
    }
  }
  return runs;
}

function allocate(
  bm: Bitmap,
  size: number,
  strategy: Strategy,
  lastPos: number,
): { blocks: number[]; nextLastPos: number } | null {
  const runs = findRuns(bm);
  if (runs.length === 0) return null;

  // Total free check — hvis ikke nok ledig totalt, gi opp.
  const totalFree = runs.reduce((s, r) => s + r.length, 0);
  if (totalFree < size) return null;

  if (strategy === "first-fit") {
    // Forsøk å finne første sammenhengende run >= size.
    const big = runs.find((r) => r.length >= size);
    if (big) {
      const blocks = Array.from({ length: size }, (_, k) => big.start + k);
      return { blocks, nextLastPos: big.start + size };
    }
    // Fall through: ingen sammenhengende — spre over flere hull.
    return spreadAcross(runs, size);
  }

  if (strategy === "best-fit") {
    // Minste run som er >= size.
    const fitting = runs.filter((r) => r.length >= size);
    if (fitting.length > 0) {
      fitting.sort((a, b) => a.length - b.length);
      const r = fitting[0];
      const blocks = Array.from({ length: size }, (_, k) => r.start + k);
      return { blocks, nextLastPos: r.start + size };
    }
    return spreadAcross(runs, size);
  }

  // next-fit
  // Forsøk å finne run >= size som starter på eller etter lastPos.
  const sortedFromHand = [...runs].sort((a, b) => {
    const aa = a.start >= lastPos ? a.start : a.start + bm.length;
    const bb = b.start >= lastPos ? b.start : b.start + bm.length;
    return aa - bb;
  });
  const big = sortedFromHand.find((r) => r.length >= size);
  if (big) {
    const blocks = Array.from({ length: size }, (_, k) => big.start + k);
    return { blocks, nextLastPos: (big.start + size) % bm.length };
  }
  return spreadAcross(runs, size);
}

/** Fallback når ingen run er stor nok: ta de første n ledige blokkene. */
function spreadAcross(
  runs: Array<{ start: number; length: number }>,
  size: number,
): { blocks: number[]; nextLastPos: number } {
  const blocks: number[] = [];
  let remaining = size;
  let last = 0;
  for (const r of runs) {
    const take = Math.min(r.length, remaining);
    for (let k = 0; k < take; k++) blocks.push(r.start + k);
    remaining -= take;
    last = r.start + take;
    if (remaining === 0) break;
  }
  return { blocks, nextLastPos: last };
}

function fragmentationScore(bm: Bitmap): {
  freeRuns: number;
  largestRun: number;
  totalFree: number;
} {
  const runs = findRuns(bm);
  const largestRun = runs.reduce((m, r) => Math.max(m, r.length), 0);
  const totalFree = runs.reduce((s, r) => s + r.length, 0);
  return { freeRuns: runs.length, largestRun, totalFree };
}

export function FreeBlockBitmap() {
  const [bitmap, setBitmap] = useState<Bitmap>(() =>
    Array.from({ length: TOTAL }, () => null),
  );
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [strategy, setStrategy] = useState<Strategy>("first-fit");
  const [size, setSize] = useState(6);
  const [lastPos, setLastPos] = useState(0);
  const [lastEvent, setLastEvent] = useState<string>(
    "Bitmap er tomt. Velg filstørrelse og strategi, og klikk Allokér.",
  );
  const [highlightFile, setHighlightFile] = useState<number | null>(null);
  const nextId = useMemo(
    () => (files.length === 0 ? 1 : Math.max(...files.map((f) => f.id)) + 1),
    [files],
  );

  function doAllocate() {
    const res = allocate(bitmap, size, strategy, lastPos);
    if (!res) {
      setLastEvent(`Ikke nok ledige blokker (trenger ${size}).`);
      return;
    }
    const newBm: Bitmap = bitmap.slice();
    const id = nextId;
    res.blocks.forEach((b) => {
      newBm[b] = id;
    });
    const hue = (id * 53) % 360;
    const f: FileEntry = {
      id,
      name: `file_${id}.dat`,
      blocks: res.blocks,
      hue,
    };
    setBitmap(newBm);
    setFiles((fs) => [...fs, f]);
    setLastPos(res.nextLastPos);
    setHighlightFile(id);
    const contiguous = res.blocks.every(
      (b, i, arr) => i === 0 || arr[i] - arr[i - 1] === 1,
    );
    setLastEvent(
      contiguous
        ? `Allokerte ${size} blokker sammenhengende fra #${res.blocks[0]} (${strategy}).`
        : `Allokerte ${size} blokker FRAGMENTERT på ${countSegments(res.blocks)} segmenter — ingen run var stor nok (${strategy}).`,
    );
  }

  function doDelete(id: number) {
    const f = files.find((x) => x.id === id);
    if (!f) return;
    const newBm: Bitmap = bitmap.slice();
    f.blocks.forEach((b) => {
      newBm[b] = null;
    });
    setBitmap(newBm);
    setFiles((fs) => fs.filter((x) => x.id !== id));
    if (highlightFile === id) setHighlightFile(null);
    setLastEvent(`Slettet ${f.name} — frigjorde ${f.blocks.length} blokker.`);
  }

  function reset() {
    setBitmap(Array.from({ length: TOTAL }, () => null));
    setFiles([]);
    setLastPos(0);
    setHighlightFile(null);
    setLastEvent("Bitmap reset.");
  }

  function fragmentDemo() {
    // Reset, alloker 12 små filer á 4 blokker, slett annenhver, prøv stor fil (24).
    let bm: Bitmap = Array.from({ length: TOTAL }, () => null);
    const newFiles: FileEntry[] = [];
    let pos = 0;
    let id = 1;
    for (let k = 0; k < 12; k++) {
      const res = allocate(bm, 4, "first-fit", pos);
      if (!res) break;
      const fid = id++;
      const hue = (fid * 53) % 360;
      res.blocks.forEach((b) => (bm[b] = fid));
      newFiles.push({ id: fid, name: `f_${fid}.dat`, blocks: res.blocks, hue });
      pos = res.nextLastPos;
    }
    // Slett annenhver
    let remaining = newFiles.filter((f) => f.id % 2 === 1);
    newFiles
      .filter((f) => f.id % 2 === 0)
      .forEach((f) => {
        f.blocks.forEach((b) => (bm[b] = null));
      });
    // Prøv stor fil 24 blokker med gjeldende strategi
    const big = allocate(bm, 24, strategy, 0);
    let banner = "Demo: 12 filer × 4 blokker, slettet annenhver. ";
    if (big) {
      const fid = id++;
      const hue = (fid * 53) % 360;
      big.blocks.forEach((b) => (bm[b] = fid));
      const bigFile: FileEntry = {
        id: fid,
        name: `big.dat`,
        blocks: big.blocks,
        hue,
      };
      remaining = [...remaining, bigFile];
      const contiguous = big.blocks.every(
        (b, i, arr) => i === 0 || arr[i] - arr[i - 1] === 1,
      );
      banner += contiguous
        ? `big.dat (24 blk) fikk sammenhengende plass — ${strategy} fant et stort hull.`
        : `big.dat (24 blk) ble spredt over ${countSegments(big.blocks)} segmenter — fragmentering!`;
      setHighlightFile(fid);
    } else {
      banner += "big.dat (24 blk) feilet — ikke nok ledig.";
    }
    setBitmap(bm);
    setFiles(remaining);
    setLastPos(0);
    setLastEvent(banner);
  }

  const frag = useMemo(() => fragmentationScore(bitmap), [bitmap]);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <label className="text-xs text-muted-foreground">
          <div className="mb-1">Filstørrelse: {size} blokker</div>
          <input
            type="range"
            min={1}
            max={32}
            step={1}
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value, 10))}
            className="w-full"
          />
        </label>
        <div className="text-xs text-muted-foreground">
          <div className="mb-1">Allokeringsstrategi</div>
          <div className="flex flex-wrap gap-1.5">
            {(["first-fit", "best-fit", "next-fit"] as Strategy[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStrategy(s)}
                className={`text-xs font-mono rounded-md border px-2.5 py-1 transition-colors ${
                  strategy === s
                    ? "border-brand bg-brand/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-brand/40"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 items-end">
          <button
            type="button"
            onClick={doAllocate}
            className="text-xs rounded-md border border-brand bg-brand/10 px-3 py-1.5 hover:bg-brand/20"
          >
            Allokér
          </button>
          <button
            type="button"
            onClick={fragmentDemo}
            className="text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted"
          >
            Lag fragmentering
          </button>
          <button
            type="button"
            onClick={reset}
            className="text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Bitmap grid */}
      <div
        className="grid gap-0.5 mb-3"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {bitmap.map((cell, i) => {
          const file = cell !== null ? files.find((f) => f.id === cell) : null;
          const isHighlight = file && highlightFile === file.id;
          const base = cell === null ? "bg-emerald-500/30" : "bg-rose-500/40";
          const ring = isHighlight ? "ring-2 ring-amber-400" : "";
          const style = file
            ? { backgroundColor: `hsl(${file.hue} 70% 55% / 0.55)` }
            : undefined;
          return (
            <div
              key={i}
              title={
                cell === null
                  ? `Blokk ${i} — ledig`
                  : `Blokk ${i} — ${file?.name ?? "?"}`
              }
              className={`aspect-square rounded-sm border border-border/60 ${ring} ${file ? "" : base}`}
              style={style}
            />
          );
        })}
      </div>

      <div className="grid sm:grid-cols-3 gap-2 mb-3 text-xs">
        <div className="rounded-md border border-border p-2">
          <div className="text-muted-foreground">Ledige blokker</div>
          <div className="font-mono text-emerald-500">
            {frag.totalFree} / {TOTAL}
          </div>
        </div>
        <div className="rounded-md border border-border p-2">
          <div className="text-muted-foreground">Største frie strekk</div>
          <div className="font-mono">{frag.largestRun}</div>
        </div>
        <div className="rounded-md border border-border p-2">
          <div className="text-muted-foreground">Antall frie segmenter</div>
          <div className="font-mono">
            {frag.freeRuns}{" "}
            {frag.freeRuns > 1 && (
              <span className="text-amber-500">(fragmentert)</span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground mb-3">
        {lastEvent}
      </div>

      {files.length > 0 && (
        <div>
          <div className="text-xs text-muted-foreground mb-1.5">Filer</div>
          <div className="flex flex-wrap gap-1.5">
            {files.map((f) => {
              const contiguous = f.blocks.every(
                (b, i, arr) => i === 0 || arr[i] - arr[i - 1] === 1,
              );
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => doDelete(f.id)}
                  onMouseEnter={() => setHighlightFile(f.id)}
                  onMouseLeave={() => setHighlightFile(null)}
                  className="text-[11px] font-mono rounded-md border border-border bg-background px-2 py-1 hover:bg-muted flex items-center gap-1.5"
                  title={`Klikk for å slette ${f.name}`}
                >
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-sm"
                    style={{
                      backgroundColor: `hsl(${f.hue} 70% 55% / 0.8)`,
                    }}
                  />
                  {f.name} ({f.blocks.length} blk
                  {contiguous ? "" : `, ${countSegments(f.blocks)} segm.`})
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4 text-[11px] text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Eksperiment:</strong>{" "}
        Trykk "Lag fragmentering" med <span className="font-mono">first-fit</span>{" "}
        og se hvordan store filer blir spredt. Bytt til{" "}
        <span className="font-mono">best-fit</span> og kjør demoen på nytt —{" "}
        best-fit etterlater små "scraps" som er ubrukelige men reduserer
        spredning av nye store filer (når et stort hull finnes).{" "}
        <span className="font-mono">next-fit</span> hopper videre fra forrige
        allokering — billigere søk, men minne-bruk likner first-fit.
      </div>
    </div>
  );
}

function countSegments(blocks: number[]): number {
  let segs = 1;
  for (let i = 1; i < blocks.length; i++) {
    if (blocks[i] - blocks[i - 1] !== 1) segs++;
  }
  return segs;
}
