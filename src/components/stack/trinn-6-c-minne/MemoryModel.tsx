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
// To språk:
//   C       — eksplisitt minnehåndtering, frames og malloc/free
//   Python  — alt er heap-objekter med refcount; stacken har bare navne-
//             bindinger (referanser). Samme adressemodell under huden.
// ---------------------------------------------------------------------------

type Region = "stack" | "heap";
type CellState = "live" | "free" | "dangling";
type Language = "c" | "python";

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
  // Python-spesifikt:
  kind?: "reference"; // navne-binding på stacken — ingen adresse, ingen bytes
  refcount?: number; // for heap-objekter
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
  language: Language;
};

const STACK_BASE = 0x7ffda4c0;
const HEAP_BASE = 0x55abe100;
const PY_HEAP_BASE = 0x55cc1000;

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
    language: "c",
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
    language: "c",
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
    language: "c",
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

// --- Python-scenarier ------------------------------------------------------
// I CPython er ALT et heap-objekt med en refcount. Stacken har bare
// navne-bindinger (lokale variabler) som er pekere inn i heapen. Når en
// refcount når 0 frigjøres objektet umiddelbart (CPython bruker også en
// cyclic GC for å rydde sykluser, men vi visualiserer kun refcount).

function pyRef(name: string, target: number, hovered = false): Cell {
  return {
    id: `ref-${name}`,
    region: "stack",
    addr: 0,
    size: 0,
    label: name,
    bytes: [],
    state: hovered ? "live" : "live",
    pointsTo: target,
    kind: "reference",
  };
}

function pyInt(addr: number, value: number, refcount: number, state: CellState = "live"): Cell {
  return {
    id: `obj-${addr.toString(16)}`,
    region: "heap",
    addr,
    size: 4,
    label: `int(${value})`,
    type: "PyLongObject",
    bytes: state === "free" ? Array(4).fill(null) : littleEndianBytes(value, 4),
    state,
    asInt: state === "free" ? undefined : value,
    refcount,
  };
}

function pyStr(addr: number, value: string, refcount: number, state: CellState = "live"): Cell {
  const charBytes = [...value].map((c) => c.charCodeAt(0) & 0xff);
  return {
    id: `obj-${addr.toString(16)}`,
    region: "heap",
    addr,
    size: charBytes.length,
    label: `str("${value}")`,
    type: "PyUnicodeObject",
    bytes: state === "free" ? Array(charBytes.length).fill(null) : charBytes,
    state,
    refcount,
  };
}

function pyList(addr: number, items: number[], refcount: number, state: CellState = "live"): Cell {
  return {
    id: `obj-${addr.toString(16)}`,
    region: "heap",
    addr,
    size: items.length * 8,
    label: `list([${items.join(", ")}])`,
    type: "PyListObject",
    bytes: [],
    state,
    refcount,
  };
}

function buildPyObjectsScenario(): Scenario {
  const addrInt = PY_HEAP_BASE;
  const addrStr = PY_HEAP_BASE + 0x40;
  return {
    id: "py-objekter",
    title: "Alt er objekter på heapen",
    language: "python",
    blurb:
      "I Python har ingen variabel en 'verdi' direkte. Variabler er navn som peker inn i heapen, hvor selve objektet — int, str, list — lever med sin egen refcount.",
    code: [
      "x = 42",
      'y = "hei"',
      "print(x, y)",
    ],
    steps: [
      {
        line: 0,
        cells: [pyRef("x", addrInt), pyInt(addrInt, 42, 1)],
        note: "x = 42 lager et PyLongObject på heapen og binder navnet x til adressen. Stacken inneholder ikke 42 — bare en peker dit.",
      },
      {
        line: 1,
        cells: [
          pyRef("x", addrInt),
          pyRef("y", addrStr),
          pyInt(addrInt, 42, 1),
          pyStr(addrStr, "hei", 1),
        ],
        note: 'y = "hei" lager et PyUnicodeObject. Strenger har sin egen heap-blokk med bytes for hvert tegn (0x68 0x65 0x69 = h e i). To navn, to objekter, hver refcount=1.',
      },
      {
        line: 2,
        cells: [
          pyRef("x", addrInt),
          pyRef("y", addrStr),
          pyInt(addrInt, 42, 1),
          pyStr(addrStr, "hei", 1),
        ],
        note: "print() leser via pekerne, finner objektene på heapen, og kaller deres __str__. Når funksjonen returnerer holdes objektene fortsatt i live av x og y i frame-en.",
      },
    ],
  };
}

function buildPyAliasingScenario(): Scenario {
  const addrList = PY_HEAP_BASE;
  return {
    id: "py-aliasing",
    title: "Aliasing — to navn, samme objekt",
    language: "python",
    blurb:
      "Tildeling i Python kopierer aldri objektet — den kopierer pekeren. To navn som peker til samme list-objekt mutereres sammen. Dette er klassisk gotcha.",
    code: [
      "a = [1, 2, 3]",
      "b = a               # b peker til samme liste",
      "b.append(4)         # muterer listen — a ser endringen",
      "print(a)            # [1, 2, 3, 4]",
    ],
    steps: [
      {
        line: 0,
        cells: [pyRef("a", addrList), pyList(addrList, [1, 2, 3], 1)],
        note: "a = [1, 2, 3] lager et PyListObject med tre elementer. a peker dit. Refcount = 1.",
      },
      {
        line: 1,
        cells: [
          pyRef("a", addrList),
          pyRef("b", addrList),
          pyList(addrList, [1, 2, 3], 2),
        ],
        note: "b = a kopierer IKKE listen. Den kopierer pekeren — adressen 0x55cc_1000. Refcount øker til 2. Begge navn refererer det samme heap-objektet.",
      },
      {
        line: 2,
        cells: [
          pyRef("a", addrList),
          pyRef("b", addrList),
          pyList(addrList, [1, 2, 3, 4], 2),
        ],
        note: "b.append(4) endrer objektet på heapen — ikke pekeren. Siden a peker til samme objekt, ser a også [1, 2, 3, 4]. Dette er kilde til de fleste 'jeg endret bare b!'-bugs i Python.",
        warn:
          "Vil du ha en kopi? Bruk b = a.copy() eller b = list(a) — da blir det et nytt heap-objekt med egen refcount.",
      },
      {
        line: 3,
        cells: [
          pyRef("a", addrList),
          pyRef("b", addrList),
          pyList(addrList, [1, 2, 3, 4], 2),
        ],
        note: "print(a) viser den muterte listen. Begge navnene lever fortsatt — refcount = 2.",
      },
    ],
  };
}

function buildPyRefcountScenario(): Scenario {
  const addrInt = PY_HEAP_BASE;
  const addrStr = PY_HEAP_BASE + 0x40;
  return {
    id: "py-refcount",
    title: "Refcount og GC — hvordan minne frigjøres",
    language: "python",
    blurb:
      "CPython teller hver gang en ny peker til et objekt opprettes. Når telleren når 0 frigjøres objektet umiddelbart. Det er Python sitt 'free' — bare automatisk.",
    code: [
      "x = 42",
      "y = x               # samme objekt",
      'y = "annet"        # y rebinder',
      "del x               # x forsvinner",
    ],
    steps: [
      {
        line: 0,
        cells: [pyRef("x", addrInt), pyInt(addrInt, 42, 1)],
        note: "x = 42 — PyLongObject på heapen, refcount = 1.",
      },
      {
        line: 1,
        cells: [
          pyRef("x", addrInt),
          pyRef("y", addrInt),
          pyInt(addrInt, 42, 2),
        ],
        note: "y = x kopierer pekeren. Refcount øker til 2. Begge navn peker til samme int-objekt — i CPython er små heltall ofte cachet, så x is y vil være True her.",
      },
      {
        line: 2,
        cells: [
          pyRef("x", addrInt),
          pyRef("y", addrStr),
          pyInt(addrInt, 42, 1),
          pyStr(addrStr, "annet", 1),
        ],
        note: 'y = "annet" lager et nytt str-objekt. y rebindes til det. Refcount på int(42) faller fra 2 til 1 — den lever ennå (x peker fortsatt).',
      },
      {
        line: 3,
        cells: [
          pyRef("y", addrStr),
          pyInt(addrInt, 42, 0, "free"),
          pyStr(addrStr, "annet", 1),
        ],
        note: "del x fjerner navnet x fra frame-en. Refcount på int(42) faller til 0 → CPython frigjør objektet umiddelbart. Heap-blokken returneres til allokatoren. y → str-objektet lever videre.",
      },
    ],
  };
}

const SCENARIOS: Scenario[] = [
  buildStackHeapScenario(),
  buildRekursjonScenario(),
  buildUAFScenario(),
  buildPyObjectsScenario(),
  buildPyAliasingScenario(),
  buildPyRefcountScenario(),
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
  const [language, setLanguage] = useState<Language>("c");
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
  const [stepIdx, setStepIdx] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const scenariosForLang = useMemo(
    () => SCENARIOS.filter((s) => s.language === language),
    [language],
  );

  const scenario = useMemo(
    () =>
      scenariosForLang.find((s) => s.id === scenarioId) ?? scenariosForLang[0],
    [scenariosForLang, scenarioId],
  );
  const step = scenario.steps[Math.min(stepIdx, scenario.steps.length - 1)];

  const stackCells = step.cells
    .filter((c) => c.region === "stack")
    .sort((a, b) => {
      // Referanser øverst (insertion-rekkefølge), så byte-celler synkende på adresse.
      if (a.kind === "reference" && b.kind !== "reference") return -1;
      if (b.kind === "reference" && a.kind !== "reference") return 1;
      return b.addr - a.addr;
    });
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

  const switchLanguage = (lang: Language) => {
    setLanguage(lang);
    setStepIdx(0);
    setHoveredId(null);
    const first = SCENARIOS.find((s) => s.language === lang);
    if (first) setScenarioId(first.id);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Språk
        </span>
        {(["c", "python"] as const).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => switchLanguage(lang)}
            className={`text-xs px-3 py-1 rounded-md border transition ${
              language === lang
                ? "border-brand bg-brand/20 text-foreground font-semibold"
                : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
            }`}
          >
            {lang === "c" ? "C" : "Python"}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-muted-foreground italic">
          {language === "c"
            ? "eksplisitt minne · frames + malloc/free"
            : "implisitt · alt på heapen med refcount"}
        </span>
      </div>

      <div>
        <div className="flex flex-wrap gap-2 mb-2">
          {scenariosForLang.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => switchScenario(s.id)}
              className={`text-xs px-3 py-1.5 rounded-md border transition ${
                s.id === scenario.id
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

      <div className="rounded-lg border border-border bg-background/60 overflow-x-auto">
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
          title={language === "python" ? "STACK · lokale bindinger" : "STACK"}
          subtitle={
            language === "python"
              ? "navn → adresse på heapen"
              : "høye adresser øverst · vokser ↓"
          }
          cells={stackCells}
          activePointerTarget={activePointerTarget}
          hoveredId={hoveredId}
          onHover={setHoveredId}
          empty={
            language === "python"
              ? "Ingen lokale variabler ennå."
              : "Ingen stack-frame ennå."
          }
        />
        <MemoryColumn
          title={language === "python" ? "HEAP · objekter" : "HEAP"}
          subtitle={
            language === "python"
              ? "PyObject med refcount"
              : "lave adresser nederst · vokser ↑"
          }
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
        {language === "c" ? (
          <>
            Adressene er konstruerte men realistiske: stacken på{" "}
            <code>0x7ffd_…</code> (typisk Linux x86-64 user-space), heapen på{" "}
            <code>0x55ab_…</code>. ASLR randomiserer dem hver kjøring.
          </>
        ) : (
          <>
            CPython holder hvert objekt på heapen via{" "}
            <code>PyObject_New</code>. Refcount-feltet er 8 bytes som dekrementeres ved hver{" "}
            <code>Py_DECREF</code> — når det treffer 0 kalles destruktoren og minnet frigjøres.
            Bytt til C-modusen for å se hvordan dette gjøres manuelt med{" "}
            <code>malloc</code>/<code>free</code>.
          </>
        )}
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
  const ring = isTarget
    ? "ring-2 ring-brand ring-offset-2 ring-offset-card"
    : isHovered
      ? "ring-1 ring-foreground/30"
      : "";

  // Python-referanse: kompakt rad "navn → adresse".
  if (cell.kind === "reference") {
    return (
      <div
        onMouseEnter={() => onHover(cell.id)}
        onMouseLeave={() => onHover(null)}
        className={`rounded-md border border-sky-500/50 bg-sky-500/10 ${ring} px-3 py-1.5 transition flex items-baseline gap-2`}
      >
        <span className="text-xs font-semibold">{cell.label}</span>
        <span className="text-[10px] text-muted-foreground">navn</span>
        <span className="ml-auto text-[11px] font-mono text-brand">
          → {cell.pointsTo !== undefined ? fmtAddr(cell.pointsTo) : "—"}
        </span>
      </div>
    );
  }

  const stateCls = stateClasses(cell.state, cell.region);

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
        <div className="flex items-baseline gap-1.5 shrink-0">
          {cell.refcount !== undefined && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono tabular-nums ${
                cell.refcount === 0
                  ? "bg-red-500/15 text-red-500 border border-red-500/40"
                  : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40"
              }`}
              title="refcount — antall navn som peker til dette objektet"
            >
              ref={cell.refcount}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {cell.size} B
          </span>
        </div>
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
