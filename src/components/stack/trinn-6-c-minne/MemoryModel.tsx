import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Fysisk minne-modell — prosess-livssyklus.
// Komplementerer MemoryVisualizer (byte-fokus) ved å vise frames og
// allokeringer over tid, med realistiske ASLR-adresser.
//
// Tre scenarier:
//   1. stack-heap-peker — int x; int *p = malloc; *p = 7; free
//   2. rekursjon        — sum(3) bygger og river ned 4 frames
//   3. use-after-free   — *p etter free er udefinert
// ---------------------------------------------------------------------------

type Region = "stack" | "heap";
type CellState = "live" | "free" | "dangling";

type Cell = {
  id: string;
  region: Region;
  addr: number;
  size: number;
  label: string;
  type?: string;
  bytes: (number | null)[]; // null = uinitialisert
  state: CellState;
  pointsTo?: number;
  asInt?: number;
  asPointer?: boolean;
};

type Step = {
  line: number;
  cells: Cell[];
  note: string;
  warn?: string;
};

type Scenario = {
  id: string;
  title: string;
  blurb: string;
  code: string[];
  steps: Step[];
};

const STACK_BASE = 0x7ffda4c0;
const HEAP_BASE = 0x55abe100;

function fmtAddr(addr: number): string {
  const hex = addr.toString(16).padStart(8, "0");
  return `0x${hex.slice(0, 4)}_${hex.slice(4)}`;
}

function littleEndianBytes(value: number, size: number): number[] {
  const out: number[] = [];
  let v = value >>> 0;
  for (let i = 0; i < size; i++) {
    out.push(v & 0xff);
    v = v >>> 8;
  }
  return out;
}

function pointerBytes(addr: number): number[] {
  const lo = addr >>> 0;
  const hi = Math.floor(addr / 0x100000000) >>> 0;
  return [...littleEndianBytes(lo, 4), ...littleEndianBytes(hi, 4)];
}

function buildStackHeapScenario(): Scenario {
  const xAddr = STACK_BASE - 4;
  const pAddr = STACK_BASE - 16;
  const heapAddr = HEAP_BASE;

  const baseX = (asInt = 42): Cell => ({
    id: "x",
    region: "stack",
    addr: xAddr,
    size: 4,
    label: "x",
    type: "int",
    bytes: littleEndianBytes(asInt, 4),
    state: "live",
    asInt,
  });

  const baseP = (pointsTo: number | undefined, state: CellState = "live"): Cell => ({
    id: "p",
    region: "stack",
    addr: pAddr,
    size: 8,
    label: "p",
    type: "int *",
    bytes: pointsTo === undefined ? Array(8).fill(null) : pointerBytes(pointsTo),
    state,
    pointsTo,
    asPointer: true,
  });

  const baseHeap = (asInt: number | null, state: CellState = "live"): Cell => ({
    id: "heap1",
    region: "heap",
    addr: heapAddr,
    size: 4,
    label: "malloc-blokk",
    type: "int (4 B)",
    bytes: asInt === null ? Array(4).fill(null) : littleEndianBytes(asInt, 4),
    state,
    asInt: asInt ?? undefined,
  });

  return {
    id: "stack-heap-peker",
    title: "Stack + heap + peker",
    blurb:
      "Lokal int på stacken, malloc reserverer på heapen, peker på stacken som peker dit, free frigjør blokka.",
    code: [
      "int main(void) {",
      "    int x = 42;                          // lokal — stacken",
      "    int *p = malloc(sizeof(int));         // 4 bytes på heapen",
      "    *p = 7;                               // skriv via pekeren",
      "    free(p);                              // gi blokka tilbake",
      "    return 0;",
      "}",
    ],
    steps: [
      {
        line: 1,
        cells: [baseX()],
        note: "x havner på stacken: 4 bytes med little-endian 42 (0x2A 00 00 00). Stacken vokser nedover, så x ligger like under rammens topp.",
      },
      {
        line: 2,
        cells: [baseX(), baseP(heapAddr), baseHeap(null)],
        note: "malloc gir 4 sammenhengende bytes på heapen og returnerer adressen. p er en 8-byte verdi på stacken som lagrer den adressen — selve heap-innholdet er uinitialisert (?? = garbage).",
      },
      {
        line: 3,
        cells: [baseX(), baseP(heapAddr), baseHeap(7)],
        note: "*p = 7 betyr: bruk adressen p inneholder, og skriv 4 bytes der. Det er stacken som ber heapen om å endre seg — gjennom adressen.",
      },
      {
        line: 4,
        cells: [baseX(), baseP(heapAddr, "dangling"), baseHeap(null, "free")],
        note: "free returnerer blokka til allokatoren. Pekeren p inneholder fortsatt adressen — den er nå dangling. Verdiene i blokka er udefinerte; allokatoren kan gjenbruke den når som helst.",
        warn:
          "Bruk av *p etter free er udefinert oppførsel. Sett p = NULL etter free for å gjøre feilen synlig.",
      },
    ],
  };
}

function buildRekursjonScenario(): Scenario {
  const frame = (
    n: number,
    depth: number,
    returnVal?: number,
  ): Cell => {
    const addr = STACK_BASE - (depth + 1) * 16;
    return {
      id: `frame-${depth}`,
      region: "stack",
      addr,
      size: 16,
      label: `sum(n=${n})`,
      type: returnVal !== undefined ? `frame · returnerer ${returnVal}` : "frame",
      bytes: [],
      state: "live",
      asInt: n,
    };
  };

  const r = (val: number | null): Cell => ({
    id: "r",
    region: "stack",
    addr: STACK_BASE - 4,
    size: 4,
    label: "r",
    type: "int",
    bytes: val === null ? Array(4).fill(null) : littleEndianBytes(val, 4),
    state: "live",
    asInt: val ?? undefined,
  });

  return {
    id: "rekursjon",
    title: "Rekursjon — frames på stacken",
    blurb:
      "Hvert kall til sum() legger en ny stack-frame på toppen. Når base-case treffer, river kallene seg ned igjen og hver frame leverer sin returverdi til den under.",
    code: [
      "int sum(int n) {",
      "    if (n == 0) return 0;",
      "    return n + sum(n - 1);",
      "}",
      "int r = sum(3);",
    ],
    steps: [
      {
        line: 4,
        cells: [r(null), frame(3, 0)],
        note: "main kaller sum(3). En frame for sum legges på stacken under r. n=3 lever i frame-en.",
      },
      {
        line: 2,
        cells: [r(null), frame(3, 0), frame(2, 1)],
        note: "sum(3) kaller sum(2). Ny frame på toppen (lavere adresse). Den gamle frame-en for sum(3) ligger nå og venter på returverdien.",
      },
      {
        line: 2,
        cells: [r(null), frame(3, 0), frame(2, 1), frame(1, 2)],
        note: "sum(2) kaller sum(1). Tre frames stablet — stacken vokser nedover, mot heapen.",
      },
      {
        line: 2,
        cells: [r(null), frame(3, 0), frame(2, 1), frame(1, 2), frame(0, 3)],
        note: "sum(1) kaller sum(0). Fire frames totalt. Hvis dette var sum(1_000_000) ville stacken vært tom og prosessen ville fått SIGSEGV.",
      },
      {
        line: 1,
        cells: [r(null), frame(3, 0), frame(2, 1), frame(1, 2), frame(0, 3, 0)],
        note: "Base-case: n == 0, sum(0) returnerer 0. Frame-en er klar til å rives av.",
      },
      {
        line: 2,
        cells: [r(null), frame(3, 0), frame(2, 1), frame(1, 2, 1)],
        note: "sum(0) sin frame poppes (rsp legges tilbake). sum(1) beregner 1 + 0 = 1 og returnerer.",
      },
      {
        line: 2,
        cells: [r(null), frame(3, 0), frame(2, 1, 3)],
        note: "sum(2) beregner 2 + 1 = 3 og returnerer. Stacken krymper én frame til.",
      },
      {
        line: 4,
        cells: [r(6), frame(3, 0, 6)],
        note: "sum(3) beregner 3 + 3 = 6 og returnerer. Returverdien skrives til r på main sin frame.",
      },
    ],
  };
}

function buildUAFScenario(): Scenario {
  const pAddr = STACK_BASE - 16;
  const heapAddr = HEAP_BASE;

  const p = (pointsTo: number | undefined, state: CellState = "live"): Cell => ({
    id: "p",
    region: "stack",
    addr: pAddr,
    size: 8,
    label: "p",
    type: "int *",
    bytes: pointsTo === undefined ? Array(8).fill(null) : pointerBytes(pointsTo),
    state,
    pointsTo,
    asPointer: true,
  });

  const heap = (val: number | null, state: CellState = "live"): Cell => ({
    id: "heap1",
    region: "heap",
    addr: heapAddr,
    size: 4,
    label: "malloc-blokk",
    type: "int (4 B)",
    bytes: val === null ? Array(4).fill(null) : littleEndianBytes(val, 4),
    state,
    asInt: val ?? undefined,
  });

  return {
    id: "use-after-free",
    title: "Use-after-free — pekeren overlever blokka",
    blurb:
      "free fjerner ikke pekeren — den fjerner kun allokatorens regnskap. Bruker du pekeren etterpå, gambler du.",
    code: [
      "int *p = malloc(sizeof(int));",
      "*p = 99;",
      "free(p);",
      "*p = 5;            // udefinert — heap-blokken kan være returnert",
    ],
    steps: [
      {
        line: 0,
        cells: [p(heapAddr), heap(null)],
        note: "malloc reserverer 4 bytes. p lagrer adressen.",
      },
      {
        line: 1,
        cells: [p(heapAddr), heap(99)],
        note: "*p = 99 skriver gjennom pekeren. Heap-innholdet er nå 0x63 0x00 0x00 0x00.",
      },
      {
        line: 2,
        cells: [p(heapAddr, "dangling"), heap(null, "free")],
        note: "free gir blokka tilbake til allokatoren. p står igjen som dangling — adressen ER fortsatt 0x55ab_e100, men eierskapet er borte.",
      },
      {
        line: 3,
        cells: [p(heapAddr, "dangling"), heap(5, "free")],
        note: "*p = 5 skriver til en blokk vi ikke eier lenger. Av og til virker det. Av og til skriver vi over en helt annen allokering. Av og til krasjer programmet. Det er definisjonen på udefinert oppførsel.",
        warn:
          "Dette er en klassisk sårbarhet i C/C++. Sanitizere (gcc -fsanitize=address) fanger det. Defensiv kode: sett p = NULL rett etter free.",
      },
    ],
  };
}

const SCENARIOS: Scenario[] = [
  buildStackHeapScenario(),
  buildRekursjonScenario(),
  buildUAFScenario(),
];

function hex2(n: number | null): string {
  if (n === null) return "??";
  return n.toString(16).padStart(2, "0").toUpperCase();
}

function stateClasses(state: CellState, region: Region): string {
  if (state === "free") {
    return "border-dashed border-muted-foreground/40 bg-muted/30 text-muted-foreground";
  }
  if (state === "dangling") {
    return "border-red-500/60 bg-red-500/10 text-foreground";
  }
  return region === "stack"
    ? "border-sky-500/50 bg-sky-500/10 text-foreground"
    : "border-amber-500/60 bg-amber-500/10 text-foreground";
}

export function MemoryModel() {
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
  const [stepIdx, setStepIdx] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const scenario = useMemo(
    () => SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0],
    [scenarioId],
  );
  const step = scenario.steps[Math.min(stepIdx, scenario.steps.length - 1)];

  const stackCells = step.cells
    .filter((c) => c.region === "stack")
    .sort((a, b) => b.addr - a.addr);
  const heapCells = step.cells
    .filter((c) => c.region === "heap")
    .sort((a, b) => a.addr - b.addr);

  const activePointerTarget = (() => {
    const hoveredCell = step.cells.find((c) => c.id === hoveredId);
    if (hoveredCell?.pointsTo !== undefined) return hoveredCell.pointsTo;
    const ptr = step.cells.find((c) => c.asPointer);
    return ptr?.pointsTo;
  })();

  const goPrev = () => setStepIdx((i) => Math.max(0, i - 1));
  const goNext = () =>
    setStepIdx((i) => Math.min(scenario.steps.length - 1, i + 1));
  const reset = () => setStepIdx(0);

  const switchScenario = (id: string) => {
    setScenarioId(id);
    setStepIdx(0);
    setHoveredId(null);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
      <div>
        <div className="flex flex-wrap gap-2 mb-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => switchScenario(s.id)}
              className={`text-xs px-3 py-1.5 rounded-md border transition ${
                s.id === scenarioId
                  ? "border-brand bg-brand/15 text-foreground font-medium"
                  : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{scenario.blurb}</p>
      </div>

      <div className="rounded-lg border border-border bg-background/60 overflow-hidden">
        <pre className="font-mono text-xs leading-relaxed m-0 p-0">
          {scenario.code.map((line, i) => {
            const active = i === step.line;
            return (
              <div
                key={i}
                className={`px-4 py-1 flex gap-3 ${
                  active
                    ? "bg-brand/15 border-l-2 border-brand text-foreground"
                    : "border-l-2 border-transparent text-muted-foreground"
                }`}
              >
                <span className="text-muted-foreground/60 select-none w-5 text-right">
                  {i + 1}
                </span>
                <span className="whitespace-pre">{line}</span>
              </div>
            );
          })}
        </pre>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={goPrev}
          disabled={stepIdx === 0}
          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Forrige
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={stepIdx >= scenario.steps.length - 1}
          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-brand bg-brand/15 text-foreground font-medium hover:bg-brand/25 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Neste
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted/40 text-muted-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
        <div className="ml-auto text-xs text-muted-foreground tabular-nums">
          Steg {stepIdx + 1} / {scenario.steps.length}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MemoryColumn
          title="STACK"
          subtitle="høye adresser øverst · vokser ↓"
          cells={stackCells}
          activePointerTarget={activePointerTarget}
          hoveredId={hoveredId}
          onHover={setHoveredId}
        />
        <MemoryColumn
          title="HEAP"
          subtitle="lave adresser nederst · vokser ↑"
          cells={heapCells}
          activePointerTarget={activePointerTarget}
          hoveredId={hoveredId}
          onHover={setHoveredId}
          empty="Ingen heap-allokering ennå."
        />
      </div>

      <div className="rounded-lg border border-brand/30 bg-brand/5 p-3 flex items-start gap-2.5">
        <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
        <p className="text-sm leading-relaxed">{step.note}</p>
      </div>
      {step.warn && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm leading-relaxed">{step.warn}</p>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        Adressene er konstruerte men realistiske: stacken på{" "}
        <code>0x7ffd_…</code> (typisk Linux x86-64 user-space), heapen på{" "}
        <code>0x55ab_…</code>. ASLR randomiserer dem hver kjøring.
      </p>
    </div>
  );
}

function MemoryColumn({
  title,
  subtitle,
  cells,
  activePointerTarget,
  hoveredId,
  onHover,
  empty,
}: {
  title: string;
  subtitle: string;
  cells: Cell[];
  activePointerTarget: number | undefined;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  empty?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground">
          {title}
        </span>
        <span className="text-[10px] text-muted-foreground/70">{subtitle}</span>
      </div>
      {cells.length === 0 ? (
        <div className="text-xs text-muted-foreground/70 italic py-6 text-center">
          {empty ?? "—"}
        </div>
      ) : (
        <div className="space-y-1.5">
          {cells.map((cell) => {
            const isTarget =
              activePointerTarget !== undefined &&
              activePointerTarget === cell.addr;
            const isHovered = hoveredId === cell.id;
            return (
              <MemoryCell
                key={cell.id}
                cell={cell}
                isTarget={isTarget}
                isHovered={isHovered}
                onHover={onHover}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function MemoryCell({
  cell,
  isTarget,
  isHovered,
  onHover,
}: {
  cell: Cell;
  isTarget: boolean;
  isHovered: boolean;
  onHover: (id: string | null) => void;
}) {
  const stateCls = stateClasses(cell.state, cell.region);
  const ring = isTarget
    ? "ring-2 ring-brand ring-offset-2 ring-offset-card"
    : isHovered
      ? "ring-1 ring-foreground/30"
      : "";

  return (
    <div
      onMouseEnter={() => onHover(cell.id)}
      onMouseLeave={() => onHover(null)}
      className={`rounded-md border ${stateCls} ${ring} px-3 py-2 transition`}
    >
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="font-mono text-[11px] text-muted-foreground">
            {fmtAddr(cell.addr)}
          </span>
          <span className="text-xs font-semibold truncate">{cell.label}</span>
          {cell.type && (
            <span className="text-[10px] text-muted-foreground truncate">
              {cell.type}
            </span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {cell.size} B
        </span>
      </div>

      {cell.bytes.length > 0 && (
        <div className="flex flex-wrap gap-0.5 mt-1">
          {cell.bytes.map((b, i) => (
            <span
              key={i}
              className="font-mono text-[10px] px-1 py-0.5 rounded bg-background/70 border border-border/60 tabular-nums"
              title={`byte ${i}`}
            >
              {hex2(b)}
            </span>
          ))}
        </div>
      )}

      {cell.asPointer && cell.pointsTo !== undefined && (
        <div className="mt-1.5 text-[11px] font-mono text-brand">
          → {fmtAddr(cell.pointsTo)}
        </div>
      )}
      {cell.asInt !== undefined && !cell.asPointer && (
        <div className="mt-1.5 text-[11px] text-muted-foreground">
          tolket: <span className="font-mono">{cell.asInt}</span>
        </div>
      )}
      {cell.state === "free" && (
        <div className="mt-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          frigjort · innhold udefinert
        </div>
      )}
      {cell.state === "dangling" && (
        <div className="mt-1.5 text-[10px] uppercase tracking-wider text-red-500">
          dangling · peker til frigjort minne
        </div>
      )}
    </div>
  );
}
