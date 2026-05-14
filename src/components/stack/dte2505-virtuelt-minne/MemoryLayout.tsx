import { useMemo, useState } from "react";
import { Tex, TexBlock } from "@/components/Tex";

/**
 * Memory Layout — fysisk visualisering av et prosess-adresserom.
 *
 * Vertikal SVG-stripe med høy adresse øverst, lav adresse nederst:
 *
 *   0x7ffffff... ┌──────────────┐
 *                │   STACK ↓    │  (vokser nedover, function frames)
 *                ├──────────────┤
 *                │   (gap)      │  diagonal striper, unmapped
 *                ├──────────────┤
 *                │   HEAP ↑     │  (vokser oppover, malloc())
 *                ├──────────────┤
 *                │   .bss       │  globale variabler (uninit)
 *                │   .data      │  globale variabler (init)
 *                ├──────────────┤
 *                │   .text      │  kode, read-only
 *   0x400000     └──────────────┘
 *
 * Knapper:
 *   - call foo()  → push stack frame (animasjon ned)
 *   - return      → pop øverste frame
 *   - malloc(N)   → utvid heap oppover N byte
 *   - free(ptr)   → fjern en valgt heap-allokering
 *   - reset       → tilbake til start
 *
 * Buffer overflow-demo: skriv lengre enn 16-byte buffer i nederste frame,
 * og se hvordan return-adressen i naboers frame markeres rosa.
 *
 * Stack-overflow-varsel når stack og heap kolliderer (>80 % brukt).
 */

const TOTAL_BYTES = 4096; // logical units used to size the visualisation
const VIEW_HEIGHT = 520;
const VIEW_WIDTH = 380;

// Logical layout — each "segment" measured in our local units (bytes)
const TEXT_BYTES = 200; // fixed: code segment
const DATA_BYTES = 180; // .bss + .data combined
const HEAP_START = TEXT_BYTES + DATA_BYTES;
const STACK_END = TOTAL_BYTES; // top of the address space

const HIGH_ADDR = 0x7ffffffff000;
const LOW_ADDR = 0x0000000400000;

type Frame = {
  id: number;
  name: string;
  bytes: number; // size of the frame
  bufferUsed: number; // how many bytes of buffer have been written (overflow demo)
  bufferLen: number; // capacity (set to 16 for demo)
};

type HeapAlloc = {
  id: number;
  bytes: number;
};

const INITIAL_FRAMES: Frame[] = [
  { id: 1, name: "main()", bytes: 80, bufferUsed: 0, bufferLen: 16 },
];

function fmtAddr(n: number): string {
  // n is a logical byte offset in [0, TOTAL_BYTES). Map back to a fake 64-bit
  // address for display: low end of memory is .text, high end is stack top.
  const fraction = n / TOTAL_BYTES;
  const addr = LOW_ADDR + Math.round(fraction * (HIGH_ADDR - LOW_ADDR));
  return "0x" + addr.toString(16).padStart(12, "0");
}

function bytesToY(byteOffset: number, plotHeight: number, plotTop: number): number {
  // High addresses on top of the SVG (small y). Map byteOffset ∈ [0, TOTAL]
  // → y ∈ [plotTop+plotHeight, plotTop].
  return plotTop + plotHeight * (1 - byteOffset / TOTAL_BYTES);
}

export function MemoryLayout() {
  const [frames, setFrames] = useState<Frame[]>(INITIAL_FRAMES);
  const [heapAllocs, setHeapAllocs] = useState<HeapAlloc[]>([]);
  const [mallocSize, setMallocSize] = useState(120);
  const [bufferInput, setBufferInput] = useState("");
  const [selectedAlloc, setSelectedAlloc] = useState<number | null>(null);
  const [nextFrameId, setNextFrameId] = useState(2);
  const [nextAllocId, setNextAllocId] = useState(1);

  const stackUsed = useMemo(() => frames.reduce((a, f) => a + f.bytes, 0), [frames]);
  const heapUsed = useMemo(() => heapAllocs.reduce((a, h) => a + h.bytes, 0), [heapAllocs]);
  const gapBytes = TOTAL_BYTES - HEAP_START - heapUsed - stackUsed;
  const gapFraction = Math.max(0, gapBytes / (TOTAL_BYTES - HEAP_START));
  const collisionWarn = gapFraction < 0.2;
  const collision = gapBytes <= 0;

  const bufferOverflow = bufferInput.length > 16;
  const overflowBytes = Math.max(0, bufferInput.length - 16);

  // Build the SVG geometry
  const plotTop = 20;
  const plotHeight = VIEW_HEIGHT - 40;

  // .text spans bytes [0, TEXT_BYTES)
  // .data spans bytes [TEXT_BYTES, TEXT_BYTES+DATA_BYTES)
  // heap spans bytes [HEAP_START, HEAP_START+heapUsed)
  // gap spans bytes [HEAP_START+heapUsed, TOTAL-stackUsed)
  // stack spans bytes [TOTAL-stackUsed, TOTAL)

  function callFoo() {
    if (collision) return;
    setFrames((fs) => [
      ...fs,
      {
        id: nextFrameId,
        name: `foo_${nextFrameId}()`,
        bytes: 64 + Math.floor(Math.random() * 40),
        bufferUsed: 0,
        bufferLen: 16,
      },
    ]);
    setNextFrameId((id) => id + 1);
  }

  function returnFn() {
    setFrames((fs) => (fs.length > 1 ? fs.slice(0, -1) : fs));
    setBufferInput("");
  }

  function doMalloc() {
    if (collision) return;
    setHeapAllocs((hs) => [...hs, { id: nextAllocId, bytes: mallocSize }]);
    setNextAllocId((id) => id + 1);
  }

  function doFree() {
    if (selectedAlloc === null) return;
    setHeapAllocs((hs) => hs.filter((h) => h.id !== selectedAlloc));
    setSelectedAlloc(null);
  }

  function reset() {
    setFrames(INITIAL_FRAMES);
    setHeapAllocs([]);
    setBufferInput("");
    setSelectedAlloc(null);
    setNextFrameId(2);
    setNextAllocId(1);
  }

  // Compute Y positions for each frame, top-down (innermost call = nearest top of stack region).
  // The stack region starts at TOTAL_BYTES going down to TOTAL_BYTES - stackUsed.
  let stackCursor = TOTAL_BYTES;
  const frameRects = frames.map((f) => {
    const topByte = stackCursor; // higher byte = top of frame
    const bottomByte = stackCursor - f.bytes; // lower byte
    stackCursor = bottomByte;
    const yTop = bytesToY(topByte, plotHeight, plotTop);
    const yBot = bytesToY(bottomByte, plotHeight, plotTop);
    return { frame: f, yTop, yBot, topByte, bottomByte };
  });

  // Heap rects from bottom of heap region growing upward.
  let heapCursor = HEAP_START;
  const heapRects = heapAllocs.map((h) => {
    const bottomByte = heapCursor;
    const topByte = heapCursor + h.bytes;
    heapCursor = topByte;
    const yTop = bytesToY(topByte, plotHeight, plotTop);
    const yBot = bytesToY(bottomByte, plotHeight, plotTop);
    return { alloc: h, yTop, yBot, topByte, bottomByte };
  });

  const dataYTop = bytesToY(HEAP_START, plotHeight, plotTop);
  const dataYBot = bytesToY(TEXT_BYTES, plotHeight, plotTop);
  const textYTop = bytesToY(TEXT_BYTES, plotHeight, plotTop);
  const textYBot = bytesToY(0, plotHeight, plotTop);

  // Determine overflow target: when the topmost frame's buffer overflows, it
  // writes upward into the next frame's saved return address.
  const innermost = frameRects[frameRects.length - 1];
  const caller = frameRects[frameRects.length - 2];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="grid lg:grid-cols-[1fr_minmax(0,1fr)] gap-5">
        {/* SVG memory map */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-[420px]">
            <svg
              viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
              className="w-full h-auto"
              role="img"
              aria-label="Prosess-adresserom: stack, heap, .data og .text"
            >
              <defs>
                <pattern
                  id="gapStripes"
                  patternUnits="userSpaceOnUse"
                  width="8"
                  height="8"
                  patternTransform="rotate(45)"
                >
                  <rect width="8" height="8" fill="transparent" />
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="8"
                    stroke="currentColor"
                    strokeOpacity="0.18"
                    strokeWidth="2"
                  />
                </pattern>
                <marker
                  id="arrDown"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="9"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 0 L 5 10 Z" fill="#facc15" />
                </marker>
                <marker
                  id="arrUp"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="1"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 10 L 10 10 L 5 0 Z" fill="#10b981" />
                </marker>
              </defs>

              {/* Frame box around full memory */}
              <rect
                x={70}
                y={plotTop}
                width={VIEW_WIDTH - 90}
                height={plotHeight}
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.2}
              />

              {/* .text segment */}
              <rect
                x={70}
                y={textYTop}
                width={VIEW_WIDTH - 90}
                height={textYBot - textYTop}
                fill="#6366f1"
                fillOpacity={0.15}
                stroke="#6366f1"
                strokeOpacity={0.6}
              />
              <text
                x={(70 + VIEW_WIDTH - 20) / 2}
                y={(textYTop + textYBot) / 2}
                textAnchor="middle"
                fontSize="11"
                fontFamily="ui-monospace, SFMono-Regular, monospace"
                fill="currentColor"
                opacity={0.85}
              >
                .text (kode, r-x)
              </text>

              {/* .bss + .data */}
              <rect
                x={70}
                y={dataYTop}
                width={VIEW_WIDTH - 90}
                height={dataYBot - dataYTop}
                fill="#0ea5e9"
                fillOpacity={0.15}
                stroke="#0ea5e9"
                strokeOpacity={0.6}
              />
              <text
                x={(70 + VIEW_WIDTH - 20) / 2}
                y={(dataYTop + dataYBot) / 2}
                textAnchor="middle"
                fontSize="11"
                fontFamily="ui-monospace, SFMono-Regular, monospace"
                fill="currentColor"
                opacity={0.85}
              >
                .bss / .data
              </text>

              {/* Heap allocations from bottom up */}
              {heapRects.map(({ alloc, yTop, yBot }) => (
                <g
                  key={alloc.id}
                  onClick={() => setSelectedAlloc(alloc.id)}
                  style={{ cursor: "pointer" }}
                >
                  <rect
                    x={70}
                    y={yTop}
                    width={VIEW_WIDTH - 90}
                    height={yBot - yTop}
                    fill="#10b981"
                    fillOpacity={selectedAlloc === alloc.id ? 0.4 : 0.22}
                    stroke="#10b981"
                    strokeOpacity={selectedAlloc === alloc.id ? 1 : 0.6}
                    strokeWidth={selectedAlloc === alloc.id ? 2 : 1}
                  />
                  <text
                    x={(70 + VIEW_WIDTH - 20) / 2}
                    y={(yTop + yBot) / 2 + 3}
                    textAnchor="middle"
                    fontSize="10"
                    fontFamily="ui-monospace, SFMono-Regular, monospace"
                    fill="currentColor"
                    opacity={0.85}
                  >
                    malloc #{alloc.id} ({alloc.bytes}B)
                  </text>
                </g>
              ))}

              {/* Gap stripes */}
              <rect
                x={70}
                y={bytesToY(TOTAL_BYTES - stackUsed, plotHeight, plotTop)}
                width={VIEW_WIDTH - 90}
                height={Math.max(
                  0,
                  bytesToY(HEAP_START + heapUsed, plotHeight, plotTop) -
                    bytesToY(TOTAL_BYTES - stackUsed, plotHeight, plotTop),
                )}
                fill="url(#gapStripes)"
              />

              {/* Stack frames from top of memory going down */}
              {frameRects.map(({ frame, yTop, yBot }, idx) => {
                const isInnermost = idx === frameRects.length - 1;
                const isCaller = caller && idx === frameRects.length - 2;
                const overwritten = bufferOverflow && isCaller && overflowBytes > 0;
                return (
                  <g key={frame.id}>
                    <rect
                      x={70}
                      y={yTop}
                      width={VIEW_WIDTH - 90}
                      height={yBot - yTop}
                      fill={overwritten ? "#f43f5e" : "#facc15"}
                      fillOpacity={overwritten ? 0.4 : 0.22}
                      stroke={overwritten ? "#f43f5e" : "#facc15"}
                      strokeOpacity={0.7}
                    />
                    <text
                      x={(70 + VIEW_WIDTH - 20) / 2}
                      y={(yTop + yBot) / 2 + 3}
                      textAnchor="middle"
                      fontSize="10"
                      fontFamily="ui-monospace, SFMono-Regular, monospace"
                      fill="currentColor"
                      opacity={0.9}
                    >
                      {frame.name} {isInnermost ? "← rsp" : ""}
                      {overwritten ? " ⚠ ret-addr" : ""}
                    </text>
                  </g>
                );
              })}

              {/* Address ticks */}
              <text
                x={64}
                y={plotTop + 4}
                textAnchor="end"
                fontSize="9"
                fontFamily="ui-monospace, monospace"
                fill="currentColor"
                opacity={0.7}
              >
                {fmtAddr(TOTAL_BYTES)}
              </text>
              <text
                x={64}
                y={bytesToY(TOTAL_BYTES - stackUsed, plotHeight, plotTop) + 3}
                textAnchor="end"
                fontSize="9"
                fontFamily="ui-monospace, monospace"
                fill="currentColor"
                opacity={0.7}
              >
                {fmtAddr(TOTAL_BYTES - stackUsed)}
              </text>
              <text
                x={64}
                y={bytesToY(HEAP_START + heapUsed, plotHeight, plotTop) + 3}
                textAnchor="end"
                fontSize="9"
                fontFamily="ui-monospace, monospace"
                fill="currentColor"
                opacity={0.7}
              >
                {fmtAddr(HEAP_START + heapUsed)}
              </text>
              <text
                x={64}
                y={bytesToY(HEAP_START, plotHeight, plotTop) + 3}
                textAnchor="end"
                fontSize="9"
                fontFamily="ui-monospace, monospace"
                fill="currentColor"
                opacity={0.7}
              >
                {fmtAddr(HEAP_START)}
              </text>
              <text
                x={64}
                y={textYBot}
                textAnchor="end"
                fontSize="9"
                fontFamily="ui-monospace, monospace"
                fill="currentColor"
                opacity={0.7}
              >
                {fmtAddr(0)}
              </text>

              {/* Direction arrows */}
              {frameRects.length > 0 && (
                <g>
                  <line
                    x1={VIEW_WIDTH - 14}
                    y1={plotTop + 12}
                    x2={VIEW_WIDTH - 14}
                    y2={plotTop + 36}
                    stroke="#facc15"
                    strokeWidth={1.5}
                    markerEnd="url(#arrDown)"
                  />
                </g>
              )}
              {heapRects.length > 0 && (
                <line
                  x1={VIEW_WIDTH - 14}
                  y1={bytesToY(HEAP_START, plotHeight, plotTop) - 14}
                  x2={VIEW_WIDTH - 14}
                  y2={bytesToY(HEAP_START, plotHeight, plotTop) - 38}
                  stroke="#10b981"
                  strokeWidth={1.5}
                  markerEnd="url(#arrUp)"
                />
              )}
            </svg>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 w-full max-w-[420px] text-[11px]">
            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2">
              <div className="text-amber-700 dark:text-amber-300 font-semibold">Stack</div>
              <div className="font-mono">
                {stackUsed}B · {frames.length} frame{frames.length === 1 ? "" : "s"}
              </div>
            </div>
            <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-2">
              <div className="text-emerald-700 dark:text-emerald-300 font-semibold">Heap</div>
              <div className="font-mono">
                {heapUsed}B · {heapAllocs.length} alloc{heapAllocs.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          {collisionWarn && !collision && (
            <div className="mt-2 w-full max-w-[420px] rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              Stack og heap nærmer seg (mindre enn 20 % gap igjen).
            </div>
          )}
          {collision && (
            <div className="mt-2 w-full max-w-[420px] rounded-md border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-300 font-semibold">
              Stack overflow! Stack og heap har kollidert — kernel ville sendt SIGSEGV.
            </div>
          )}
        </div>

        {/* Controls + explainer */}
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="text-xs font-semibold text-foreground mb-2">Stack-operasjoner</div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={callFoo}
                disabled={collision}
                className="text-xs rounded-md border border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-3 py-1.5 hover:bg-amber-500/20 disabled:opacity-50"
              >
                call foo()
              </button>
              <button
                type="button"
                onClick={returnFn}
                disabled={frames.length <= 1}
                className="text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted disabled:opacity-50"
              >
                return
              </button>
            </div>
            <TexBlock className="mt-2 text-[11px]">{`\\text{rsp}' = \\text{rsp} - \\text{sizeof(frame)}`}</TexBlock>
            <div className="text-[11px] text-muted-foreground">
              x86-64: <Tex>{`\\texttt{call}`}</Tex> pusher saved return address + saved rbp,
              deretter trekker kompilatoren rsp ned for lokale variabler.
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background p-3">
            <div className="text-xs font-semibold text-foreground mb-2">Heap-operasjoner</div>
            <div className="flex flex-wrap items-end gap-2">
              <label className="text-[11px] text-muted-foreground">
                Bytes
                <input
                  type="number"
                  min={8}
                  max={1024}
                  step={8}
                  value={mallocSize}
                  onChange={(e) =>
                    setMallocSize(Math.max(8, Math.min(1024, parseInt(e.target.value || "0", 10))))
                  }
                  className="block w-24 mt-0.5 font-mono text-xs rounded-md border border-border bg-background px-2 py-1"
                />
              </label>
              <button
                type="button"
                onClick={doMalloc}
                disabled={collision}
                className="text-xs rounded-md border border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 hover:bg-emerald-500/20 disabled:opacity-50"
              >
                malloc({mallocSize})
              </button>
              <button
                type="button"
                onClick={doFree}
                disabled={selectedAlloc === null}
                className="text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted disabled:opacity-50"
              >
                free({selectedAlloc === null ? "?" : "#" + selectedAlloc})
              </button>
              <button
                type="button"
                onClick={reset}
                className="text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted"
              >
                Reset
              </button>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Klikk en grønn heap-blokk i tegningen for å velge før{" "}
              <code className="font-mono">free()</code>. Heap-en vokser oppover via{" "}
              <code className="font-mono">brk()</code>/<code className="font-mono">mmap()</code>.
            </p>
          </div>

          <div className="rounded-lg border border-rose-500/40 bg-rose-500/5 p-3">
            <div className="text-xs font-semibold text-rose-700 dark:text-rose-300 mb-2">
              Buffer overflow-demo (16-byte buffer i innerste frame)
            </div>
            <input
              type="text"
              value={bufferInput}
              onChange={(e) => setBufferInput(e.target.value)}
              placeholder="Skriv inn input til strcpy() — over 16 chars trigger overflow"
              className="w-full font-mono text-xs rounded-md border border-border bg-background px-2 py-1.5"
            />
            <div className="mt-2 font-mono text-[11px]">
              <span className="text-muted-foreground">strlen(input) = </span>
              <span
                className={
                  bufferOverflow ? "text-rose-600 dark:text-rose-400 font-bold" : "text-foreground"
                }
              >
                {bufferInput.length}
              </span>
              <span className="text-muted-foreground"> / 16</span>
            </div>
            {bufferOverflow && (
              <div className="mt-2 text-[11px] text-rose-700 dark:text-rose-300">
                <strong>{overflowBytes} byte</strong> spilte over bufferen og overskrev
                {caller ? (
                  <>
                    {" "}
                    return-adressen i <code className="font-mono">{caller.frame.name}</code>.
                  </>
                ) : (
                  <> det som lå ovenfor i stacken.</>
                )}{" "}
                Innerste frame: <code className="font-mono">{innermost?.frame.name}</code> — rosa
                highlight til venstre.
              </div>
            )}
            {!bufferOverflow && bufferInput.length > 0 && (
              <div className="mt-2 text-[11px] text-muted-foreground">
                OK — bufferen er stor nok. Prøv f.eks. 20 tegn.
              </div>
            )}
            <p className="mt-2 text-[11px] text-muted-foreground">
              Klassikeren: <code className="font-mono">strcpy(buf, user_input)</code> uten
              lengdesjekk. Angriper skriver en payload som ender med en ny return-adresse → CPU
              hopper til angripers kode (ROP, shellcode). Mitigeringer: stack canaries, ASLR, NX
              bit.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-background p-3 text-[11px] text-muted-foreground space-y-1.5">
            <div className="font-semibold text-foreground">Hvorfor stacken vokser ned</div>
            <p>
              Historisk: stack og heap dynamisk store, plassert i hver sin ende av adresserommet så
              de kan ekspandere mot hverandre uten å vite på forhånd hvor mye hver trenger.
            </p>
            <p>
              x86/x86-64: <code className="font-mono">push</code> trekker rsp ned. Når rsp møter
              heapens øvre kant → stack overflow → kernel sender SIGSEGV.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
