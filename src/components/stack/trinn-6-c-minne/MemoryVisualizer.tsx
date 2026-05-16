import { useEffect, useMemo, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv C-minne-visualiserer.
// Fem moduser, hver med en forhåndsdefinert "trace":
//   1) stack   — int x = 5; int y = 10; int z = x + y;   (stack-frame vokser ↓)
//   2) ptr     — int x = 42; int *p = &x; int y = *p;    (peker + dereferens)
//   3) array   — int arr[5] = {...}; int *p = arr + 2;   (peker-aritmetikk i bytes)
//   4) struct  — struct Point { int x; char c; double d } (byte-for-byte med padding)
//   5) heap    — malloc + free                           (stack vs heap-segment)
// All frames er pre-computed up-front. Step/Play/Reset indekserer bare inn.
// --------------------------------------------------------------------------

type Mode = "stack" | "ptr" | "array" | "struct" | "heap";

type Segment = "stack" | "heap" | "data" | "text";

interface MemCell {
  /** 64-bit virtuell adresse. */
  addr: number;
  /** Byte-verdi (0-255). Vises som hex. */
  byte: number;
  /** Hvilket segment cellen tilhører — styrer bakgrunnsfarge. */
  segment: Segment;
  /** Norsk merkelapp som vises på første byte av en variabel. */
  label?: string;
  /** Vises som liten note ved cellen (typisk "int x", "padding"). */
  note?: string;
  /** "padding" får skravert utseende. */
  kind?: "value" | "padding" | "free";
  /** Settes til true i siste frame der en celle ble skrevet. Får accent. */
  highlight?: boolean;
}

/** En peker = navngitt boks som peker på en adresse. */
interface PointerBox {
  name: string;
  /** Verdien pekeren inneholder (= adressen den peker på). 0 = NULL. */
  value: number;
  /** Hvilken adresse pilen ender på. undefined = ingen pil. */
  target?: number;
  /** Pulserende pil for å vise dereferens. */
  pulsing?: boolean;
  /** Hvor pekeren selv ligger i minnet — for "p ligger på stacken" labeling. */
  segment?: Segment;
}

interface Frame {
  /** Linje i kode-listen som skal høylyses (0-basert). */
  line: number;
  /** Norsk forklaring vist under diagrammet. */
  description: string;
  /** Hele minne-banken. */
  cells: MemCell[];
  /** Pekere (vises som navngitte bokser med piler). */
  pointers: PointerBox[];
  /** Adresse-til-adresse pil for *p (dereferens). */
  dereference?: { from: number; to: number };
}

interface Program {
  /** Kodelinjer som vises i kode-panelet. */
  lines: string[];
  /** Pre-computet trace. */
  frames: Frame[];
  /** Caption på minne-kolonnen. */
  memCaption: string;
}

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "stack", label: "Stack-variabler", sub: "int x, y, z på stacken" },
  { id: "ptr", label: "Peker & dereferens", sub: "int *p = &x; *p" },
  { id: "array", label: "Array-layout", sub: "arr[5] + peker-aritmetikk" },
  { id: "struct", label: "Struct & padding", sub: "alignment byte-for-byte" },
  { id: "heap", label: "Stack vs heap", sub: "malloc og free" },
];

const MODE_NOTE: Record<Mode, string> = {
  stack:
    "Stack-frame vokser nedover. Hver int tar 4 bytes. Adressene synker for hver ny variabel kompilatoren legger til.",
  ptr: "Pekeren p ligger selv på stacken (8 bytes på x86-64). *p betyr 'gå til adressen i p og les sizeof(int) bytes der'.",
  array:
    "Et array er bare sammenhengende bytes. arr + 2 hopper 2 × sizeof(int) = 8 bytes — kompilatoren skalerer automatisk etter peker-typen.",
  struct:
    "Kompilatoren legger til padding-bytes for at hvert felt skal være aligned på en adresse som er delelig med sin egen størrelse. Det er et CPU-krav.",
  heap: "malloc returnerer en peker til heap-segmentet. Pekeren selv (p) ligger på stacken. free gir blokken tilbake til allokatoren — peker-verdien blir dangling.",
};

// --------------------------------------------------------------------------
// Hjelpere
// --------------------------------------------------------------------------

function fmtHex(addr: number, width = 8) {
  const hex = addr.toString(16).padStart(width, "0");
  return "0x" + hex;
}

function fmtByte(b: number) {
  return b.toString(16).padStart(2, "0").toUpperCase();
}

/** Skriv et 32-bits int little-endian over 4 bytes. */
function writeI32LE(cells: MemCell[], addr: number, value: number) {
  const bytes = [value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >> 24) & 0xff];
  for (let i = 0; i < 4; i++) {
    const c = cells.find((m) => m.addr === addr + i);
    if (c) {
      c.byte = bytes[i];
      c.highlight = true;
      c.kind = "value";
    }
  }
}

/** Marker N bytes fra addr med samme label og note (kun første byte får label). */
function labelRange(cells: MemCell[], addr: number, len: number, label: string, note?: string) {
  for (let i = 0; i < len; i++) {
    const c = cells.find((m) => m.addr === addr + i);
    if (c) {
      if (i === 0) {
        c.label = label;
        c.note = note;
      }
    }
  }
}

function clearHighlights(cells: MemCell[]) {
  for (const c of cells) c.highlight = false;
}

function clone(cells: MemCell[]): MemCell[] {
  return cells.map((c) => ({ ...c }));
}

// --------------------------------------------------------------------------
// Program 1 — Variabler på stacken
// --------------------------------------------------------------------------

function buildStackProgram(): Program {
  const lines = [
    "int main(void) {",
    "    int x = 5;",
    "    int y = 10;",
    "    int z = x + y;",
    "    return 0;",
    "}",
  ];

  // Adresser på en typisk x86-64 stack — vokser nedover.
  // Vi viser z øverst (lavest adresse) fordi den ble allokert sist.
  const addrZ = 0x7fff0008;
  const addrY = 0x7fff000c;
  const addrX = 0x7fff0010;

  const baseCells: MemCell[] = [];
  // 12 bytes, top→bottom: z (4) | y (4) | x (4)
  for (let a = addrZ; a < addrX + 4; a++) {
    baseCells.push({ addr: a, byte: 0, segment: "stack", kind: "free" });
  }

  const frames: Frame[] = [];

  // Frame 0 — start, før noe er allokert.
  {
    const cells = clone(baseCells);
    for (const c of cells) c.kind = "free";
    frames.push({
      line: 0,
      description: "Funksjonen starter. Stacken er klar; kompilatoren har reservert plass, men ingen verdier er skrevet enda.",
      cells,
      pointers: [],
    });
  }

  // Frame 1 — int x = 5;
  {
    const cells = clone(baseCells);
    writeI32LE(cells, addrX, 5);
    labelRange(cells, addrX, 4, "x", "int x = 5");
    frames.push({
      line: 1,
      description: "int x = 5; — kompilatoren legger 4 bytes for x på stacken og skriver tallet 5 (little-endian: 05 00 00 00).",
      cells,
      pointers: [],
    });
  }

  // Frame 2 — int y = 10;
  {
    const cells = clone(baseCells);
    writeI32LE(cells, addrX, 5);
    labelRange(cells, addrX, 4, "x", "int x = 5");
    clearHighlights(cells);
    writeI32LE(cells, addrY, 10);
    labelRange(cells, addrY, 4, "y", "int y = 10");
    frames.push({
      line: 2,
      description: "int y = 10; — neste 4 bytes legges over (lavere adresse). Stacken vokser nedover i diagrammet.",
      cells,
      pointers: [],
    });
  }

  // Frame 3 — int z = x + y;
  {
    const cells = clone(baseCells);
    writeI32LE(cells, addrX, 5);
    labelRange(cells, addrX, 4, "x", "int x = 5");
    writeI32LE(cells, addrY, 10);
    labelRange(cells, addrY, 4, "y", "int y = 10");
    clearHighlights(cells);
    writeI32LE(cells, addrZ, 15);
    labelRange(cells, addrZ, 4, "z", "int z = 15");
    frames.push({
      line: 3,
      description: "int z = x + y; — CPU-en leser bytes på adressen til x og y, legger sammen, og skriver 15 på adressen til z.",
      cells,
      pointers: [],
    });
  }

  // Frame 4 — return 0
  {
    const cells = clone(baseCells);
    writeI32LE(cells, addrX, 5);
    labelRange(cells, addrX, 4, "x", "int x = 5");
    writeI32LE(cells, addrY, 10);
    labelRange(cells, addrY, 4, "y", "int y = 10");
    writeI32LE(cells, addrZ, 15);
    labelRange(cells, addrZ, 4, "z", "int z = 15");
    clearHighlights(cells);
    frames.push({
      line: 4,
      description:
        "return 0; — når funksjonen returnerer, blir stack-pointeren flyttet tilbake og alle disse byteene blir igjen 'ledige'.",
      cells,
      pointers: [],
    });
  }

  return { lines, frames, memCaption: "Stack-frame for main (lavest adresse øverst)" };
}

// --------------------------------------------------------------------------
// Program 2 — Peker og dereferens
// --------------------------------------------------------------------------

function buildPointerProgram(): Program {
  const lines = [
    "int main(void) {",
    "    int x = 42;",
    "    int *p = &x;",
    "    int y = *p;",
    "    return 0;",
    "}",
  ];

  // Stack-layout (sist allokert øverst): y (4) | padding | p (8) | x (4)
  const addrY = 0x7fff0008; // 4 bytes
  // 4 bytes padding for alignment før p (8 byte alignment kreves).
  const padStart = 0x7fff000c;
  const addrP = 0x7fff0010; // 8 bytes
  const addrX = 0x7fff0018; // 4 bytes

  const baseCells: MemCell[] = [];
  for (let a = addrY; a < addrX + 4; a++) {
    const isPad = a >= padStart && a < addrP;
    baseCells.push({
      addr: a,
      byte: 0,
      segment: "stack",
      kind: isPad ? "padding" : "free",
      note: isPad ? "padding" : undefined,
    });
  }

  function writeU64LE(cells: MemCell[], addr: number, value: number) {
    // 64-bit, men JS-tall stopper ved 2^53. Det rekker for adressene våre.
    for (let i = 0; i < 8; i++) {
      const byte = Math.floor(value / Math.pow(2, 8 * i)) & 0xff;
      const c = cells.find((m) => m.addr === addr + i);
      if (c) {
        c.byte = byte;
        c.highlight = true;
        c.kind = "value";
      }
    }
  }

  const frames: Frame[] = [];

  // Frame 0
  frames.push({
    line: 0,
    description: "Funksjonen starter. Stacken er klar.",
    cells: clone(baseCells),
    pointers: [],
  });

  // Frame 1 — int x = 42;
  {
    const cells = clone(baseCells);
    writeI32LE(cells, addrX, 42);
    labelRange(cells, addrX, 4, "x", "int x = 42");
    frames.push({
      line: 1,
      description: "int x = 42; — 4 bytes for x, verdien 2A 00 00 00 (little-endian).",
      cells,
      pointers: [],
    });
  }

  // Frame 2 — int *p = &x;
  {
    const cells = clone(baseCells);
    writeI32LE(cells, addrX, 42);
    labelRange(cells, addrX, 4, "x", "int x = 42");
    clearHighlights(cells);
    writeU64LE(cells, addrP, addrX);
    labelRange(cells, addrP, 8, "p", "int *p");
    frames.push({
      line: 2,
      description: `int *p = &x; — p er en 8-byte peker som inneholder adressen til x (${fmtHex(addrX)}).`,
      cells,
      pointers: [{ name: "p", value: addrX, target: addrX, segment: "stack" }],
    });
  }

  // Frame 3 — int y = *p;  (animér pil)
  {
    const cells = clone(baseCells);
    writeI32LE(cells, addrX, 42);
    labelRange(cells, addrX, 4, "x", "int x = 42");
    writeU64LE(cells, addrP, addrX);
    labelRange(cells, addrP, 8, "p", "int *p");
    clearHighlights(cells);
    // Markér x som lest
    for (let i = 0; i < 4; i++) {
      const c = cells.find((m) => m.addr === addrX + i);
      if (c) c.highlight = true;
    }
    frames.push({
      line: 3,
      description:
        "int y = *p; — STEG 1: følg pekeren. CPU-en leser de 4 byteene på adressen p inneholder.",
      cells,
      pointers: [{ name: "p", value: addrX, target: addrX, pulsing: true, segment: "stack" }],
      dereference: { from: addrP, to: addrX },
    });
  }

  // Frame 4 — y = 42
  {
    const cells = clone(baseCells);
    writeI32LE(cells, addrX, 42);
    labelRange(cells, addrX, 4, "x", "int x = 42");
    writeU64LE(cells, addrP, addrX);
    labelRange(cells, addrP, 8, "p", "int *p");
    clearHighlights(cells);
    writeI32LE(cells, addrY, 42);
    labelRange(cells, addrY, 4, "y", "int y = 42");
    frames.push({
      line: 3,
      description: "STEG 2: bytene tolkes som int (= 42) og skrives til y. Resultat: y = 42.",
      cells,
      pointers: [{ name: "p", value: addrX, target: addrX, segment: "stack" }],
    });
  }

  // Frame 5 — return
  {
    const cells = clone(baseCells);
    writeI32LE(cells, addrX, 42);
    labelRange(cells, addrX, 4, "x", "int x = 42");
    writeU64LE(cells, addrP, addrX);
    labelRange(cells, addrP, 8, "p", "int *p");
    writeI32LE(cells, addrY, 42);
    labelRange(cells, addrY, 4, "y", "int y = 42");
    clearHighlights(cells);
    frames.push({
      line: 4,
      description:
        "return 0; — alt frigjøres når stack-pointeren flyttes tilbake. Pekeren p eksisterer ikke utenfor denne funksjonen.",
      cells,
      pointers: [{ name: "p", value: addrX, target: addrX, segment: "stack" }],
    });
  }

  return { lines, frames, memCaption: "Stack-frame: y, padding, p, x" };
}

// --------------------------------------------------------------------------
// Program 3 — Array-layout og peker-aritmetikk
// --------------------------------------------------------------------------

function buildArrayProgram(): Program {
  const lines = [
    "int main(void) {",
    "    int arr[5] = {10, 20, 30, 40, 50};",
    "    int *p = arr;",
    "    p = p + 2;        // peker-aritmetikk!",
    "    int v = *p;       // v = 30",
    "    return 0;",
    "}",
  ];

  // arr ligger på 0x7fff0000, 5 × 4 = 20 bytes.
  const addrArr = 0x7fff0000;
  const values = [10, 20, 30, 40, 50];

  const baseCells: MemCell[] = [];
  for (let i = 0; i < 5 * 4; i++) {
    baseCells.push({
      addr: addrArr + i,
      byte: 0,
      segment: "stack",
      kind: "free",
    });
  }

  const frames: Frame[] = [];

  // Frame 0 — allokering, ennå ikke initialisert
  frames.push({
    line: 0,
    description: "Funksjonen starter. 20 sammenhengende bytes er reservert for arrayet.",
    cells: clone(baseCells),
    pointers: [],
  });

  // Frame 1 — init med {10, 20, 30, 40, 50}
  {
    const cells = clone(baseCells);
    for (let i = 0; i < 5; i++) {
      writeI32LE(cells, addrArr + i * 4, values[i]);
      labelRange(cells, addrArr + i * 4, 4, `arr[${i}]`, `= ${values[i]}`);
    }
    frames.push({
      line: 1,
      description:
        "int arr[5] = {10, 20, 30, 40, 50}; — 5 ints lagt sammenhengende. arr[i] ligger på adressen arr + i × 4 bytes.",
      cells,
      pointers: [],
    });
  }

  // Frame 2 — int *p = arr;
  {
    const cells = clone(baseCells);
    for (let i = 0; i < 5; i++) {
      writeI32LE(cells, addrArr + i * 4, values[i]);
      labelRange(cells, addrArr + i * 4, 4, `arr[${i}]`, `= ${values[i]}`);
    }
    clearHighlights(cells);
    frames.push({
      line: 2,
      description: `int *p = arr; — arrayet "decay-er" til en peker. p inneholder ${fmtHex(addrArr)}, adressen til arr[0].`,
      cells,
      pointers: [{ name: "p", value: addrArr, target: addrArr, segment: "stack" }],
    });
  }

  // Frame 3 — p = p + 2 (peker-aritmetikk)
  {
    const cells = clone(baseCells);
    for (let i = 0; i < 5; i++) {
      writeI32LE(cells, addrArr + i * 4, values[i]);
      labelRange(cells, addrArr + i * 4, 4, `arr[${i}]`, `= ${values[i]}`);
    }
    clearHighlights(cells);
    const newP = addrArr + 2 * 4;
    frames.push({
      line: 3,
      description: `p = p + 2; — kompilatoren skalerer med sizeof(int) = 4. p øker med 2 × 4 = 8 bytes, fra ${fmtHex(addrArr)} til ${fmtHex(newP)}.`,
      cells,
      pointers: [{ name: "p", value: newP, target: newP, pulsing: true, segment: "stack" }],
    });
  }

  // Frame 4 — int v = *p; (= 30)
  {
    const cells = clone(baseCells);
    for (let i = 0; i < 5; i++) {
      writeI32LE(cells, addrArr + i * 4, values[i]);
      labelRange(cells, addrArr + i * 4, 4, `arr[${i}]`, `= ${values[i]}`);
    }
    clearHighlights(cells);
    const newP = addrArr + 2 * 4;
    // Markér de 4 byteene som leses
    for (let i = 0; i < 4; i++) {
      const c = cells.find((m) => m.addr === newP + i);
      if (c) c.highlight = true;
    }
    frames.push({
      line: 4,
      description: "int v = *p; — leser 4 bytes på den nye adressen. arr[2] = 30, så v = 30.",
      cells,
      pointers: [{ name: "p", value: newP, target: newP, segment: "stack" }],
      dereference: { from: -1, to: newP },
    });
  }

  // Frame 5 — return
  {
    const cells = clone(baseCells);
    for (let i = 0; i < 5; i++) {
      writeI32LE(cells, addrArr + i * 4, values[i]);
      labelRange(cells, addrArr + i * 4, 4, `arr[${i}]`, `= ${values[i]}`);
    }
    clearHighlights(cells);
    const newP = addrArr + 2 * 4;
    frames.push({
      line: 5,
      description: "return 0; — &arr[i] er det samme som arr + i. Bracket-notasjon er bare sukker for peker-aritmetikk.",
      cells,
      pointers: [{ name: "p", value: newP, target: newP, segment: "stack" }],
    });
  }

  return { lines, frames, memCaption: "Arrayet arr[5] — 20 sammenhengende bytes" };
}

// --------------------------------------------------------------------------
// Program 4 — Struct-layout og alignment-padding
// --------------------------------------------------------------------------

function buildStructProgram(): Program {
  const lines = [
    "struct Point {",
    "    int    x;     // 4 bytes",
    "    char   c;     // 1 byte",
    "    double d;     // 8 bytes",
    "};",
    "",
    "struct Point pt = { 100, 'A', 3.14 };",
  ];

  // Layout på x86-64 med standard alignment:
  // offset 0-3   : int x         (4 bytes)
  // offset 4     : char c        (1 byte)
  // offset 5-7   : padding       (3 bytes — double må starte på multiplum av 8)
  // offset 8-15  : double d      (8 bytes)
  // sizeof = 16
  const base = 0x7fff0000;
  const offX = 0;
  const offC = 4;
  const offPad = 5;
  const offD = 8;

  const baseCells: MemCell[] = [];
  for (let i = 0; i < 16; i++) {
    baseCells.push({
      addr: base + i,
      byte: 0,
      segment: "stack",
      kind: "free",
    });
  }

  const frames: Frame[] = [];

  // Frame 0 — struct deklarert, ikke initialisert
  frames.push({
    line: 6,
    description:
      "struct Point pt; — kompilatoren regner ut størrelsen og legger ut 16 bytes. Ingen verdier skrevet ennå.",
    cells: clone(baseCells),
    pointers: [],
  });

  // Frame 1 — int x = 100
  {
    const cells = clone(baseCells);
    writeI32LE(cells, base + offX, 100);
    labelRange(cells, base + offX, 4, "x", "int x = 100");
    frames.push({
      line: 1,
      description: "Felt 1: int x = 100. Starter på offset 0, tar 4 bytes (64 00 00 00 little-endian).",
      cells,
      pointers: [],
    });
  }

  // Frame 2 — char c = 'A'
  {
    const cells = clone(baseCells);
    writeI32LE(cells, base + offX, 100);
    labelRange(cells, base + offX, 4, "x", "int x = 100");
    clearHighlights(cells);
    const cCell = cells.find((m) => m.addr === base + offC);
    if (cCell) {
      cCell.byte = 0x41; // 'A'
      cCell.label = "c";
      cCell.note = "char c = 'A' (0x41)";
      cCell.highlight = true;
      cCell.kind = "value";
    }
    frames.push({
      line: 2,
      description: "Felt 2: char c = 'A'. Bare 1 byte på offset 4. ASCII 'A' = 0x41.",
      cells,
      pointers: [],
    });
  }

  // Frame 3 — padding 3 bytes (offset 5-7)
  {
    const cells = clone(baseCells);
    writeI32LE(cells, base + offX, 100);
    labelRange(cells, base + offX, 4, "x", "int x = 100");
    const cCell = cells.find((m) => m.addr === base + offC);
    if (cCell) {
      cCell.byte = 0x41;
      cCell.label = "c";
      cCell.note = "char c = 'A' (0x41)";
      cCell.kind = "value";
    }
    clearHighlights(cells);
    for (let i = 0; i < 3; i++) {
      const pad = cells.find((m) => m.addr === base + offPad + i);
      if (pad) {
        pad.kind = "padding";
        pad.note = i === 0 ? "padding" : undefined;
        pad.label = i === 0 ? "(padding)" : undefined;
        pad.highlight = true;
      }
    }
    frames.push({
      line: 3,
      description:
        "Kompilatoren legger til padding for alignment — double må starte på en adresse delelig med 8. Offset 5, 6, 7 blir 3 ubrukte bytes.",
      cells,
      pointers: [],
    });
  }

  // Frame 4 — double d = 3.14 (vi viser bare 8 bytes, ikke ekte IEEE)
  {
    const cells = clone(baseCells);
    writeI32LE(cells, base + offX, 100);
    labelRange(cells, base + offX, 4, "x", "int x = 100");
    const cCell = cells.find((m) => m.addr === base + offC);
    if (cCell) {
      cCell.byte = 0x41;
      cCell.label = "c";
      cCell.note = "char c = 'A' (0x41)";
      cCell.kind = "value";
    }
    for (let i = 0; i < 3; i++) {
      const pad = cells.find((m) => m.addr === base + offPad + i);
      if (pad) {
        pad.kind = "padding";
        pad.label = i === 0 ? "(padding)" : undefined;
        pad.note = i === 0 ? "padding" : undefined;
      }
    }
    clearHighlights(cells);
    // 3.14 i IEEE-754 double little-endian: 1F 85 EB 51 B8 1E 09 40
    const dbytes = [0x1f, 0x85, 0xeb, 0x51, 0xb8, 0x1e, 0x09, 0x40];
    for (let i = 0; i < 8; i++) {
      const c = cells.find((m) => m.addr === base + offD + i);
      if (c) {
        c.byte = dbytes[i];
        c.kind = "value";
        c.highlight = true;
      }
    }
    labelRange(cells, base + offD, 8, "d", "double d = 3.14");
    frames.push({
      line: 4,
      description:
        "Felt 3: double d = 3.14. 8 bytes på offset 8, korrekt aligned. IEEE-754 binær representasjon.",
      cells,
      pointers: [],
    });
  }

  // Frame 5 — final
  {
    const cells = clone(baseCells);
    writeI32LE(cells, base + offX, 100);
    labelRange(cells, base + offX, 4, "x", "int x = 100");
    const cCell = cells.find((m) => m.addr === base + offC);
    if (cCell) {
      cCell.byte = 0x41;
      cCell.label = "c";
      cCell.note = "char c = 'A' (0x41)";
      cCell.kind = "value";
    }
    for (let i = 0; i < 3; i++) {
      const pad = cells.find((m) => m.addr === base + offPad + i);
      if (pad) {
        pad.kind = "padding";
        pad.label = i === 0 ? "(padding)" : undefined;
        pad.note = i === 0 ? "padding" : undefined;
      }
    }
    const dbytes = [0x1f, 0x85, 0xeb, 0x51, 0xb8, 0x1e, 0x09, 0x40];
    for (let i = 0; i < 8; i++) {
      const c = cells.find((m) => m.addr === base + offD + i);
      if (c) {
        c.byte = dbytes[i];
        c.kind = "value";
      }
    }
    labelRange(cells, base + offD, 8, "d", "double d = 3.14");
    clearHighlights(cells);
    frames.push({
      line: 6,
      description:
        "Ferdig: sizeof(struct Point) = 16 bytes (ikke 13!). Naiv sortering ville gitt 24 bytes — sortér felt fra størst til minst for å redusere padding.",
      cells,
      pointers: [],
    });
  }

  return { lines, frames, memCaption: "struct Point — 16 bytes med padding" };
}

// --------------------------------------------------------------------------
// Program 5 — Stack vs heap (malloc + free)
// --------------------------------------------------------------------------

function buildHeapProgram(): Program {
  const lines = [
    "int main(void) {",
    "    int *p = malloc(4 * sizeof(int));",
    "    p[0] = 10;",
    "    p[1] = 20;",
    "    free(p);",
    "    return 0;",
    "}",
  ];

  // Stack: p (8 bytes) på 0x7fff0008..0x7fff000f
  // Heap-blokk:  16 bytes på 0x00604010..0x00604020
  const addrP = 0x7fff0008;
  const addrHeap = 0x00604010;

  const baseCells: MemCell[] = [];
  // Stack-del (p)
  for (let i = 0; i < 8; i++) {
    baseCells.push({
      addr: addrP + i,
      byte: 0,
      segment: "stack",
      kind: "free",
    });
  }
  // Heap-del (4 ints = 16 bytes)
  for (let i = 0; i < 16; i++) {
    baseCells.push({
      addr: addrHeap + i,
      byte: 0,
      segment: "heap",
      kind: "free",
    });
  }

  function writeU64LE(cells: MemCell[], addr: number, value: number) {
    for (let i = 0; i < 8; i++) {
      const byte = Math.floor(value / Math.pow(2, 8 * i)) & 0xff;
      const c = cells.find((m) => m.addr === addr + i);
      if (c) {
        c.byte = byte;
        c.highlight = true;
        c.kind = "value";
      }
    }
  }

  const frames: Frame[] = [];

  // Frame 0
  frames.push({
    line: 0,
    description:
      "Start. Stacken har plass til p, men heap-blokken finnes ikke ennå — malloc har ikke blitt kalt.",
    cells: clone(baseCells),
    pointers: [],
  });

  // Frame 1 — malloc: heapen får 16 bytes, p får adressen
  {
    const cells = clone(baseCells);
    // Heap-bytene markeres som value (allokert) men er fortsatt nullstilt (eller "uninitialisert")
    for (let i = 0; i < 16; i++) {
      const c = cells.find((m) => m.addr === addrHeap + i);
      if (c) {
        c.kind = "value";
        c.highlight = true;
        if (i === 0) {
          c.label = "malloc-blokk";
          c.note = "16 bytes på heap";
        }
      }
    }
    clearHighlights(cells);
    // p får adresse
    writeU64LE(cells, addrP, addrHeap);
    labelRange(cells, addrP, 8, "p", "int *p");
    frames.push({
      line: 1,
      description: `malloc(16) — allokatoren reserverer 16 bytes på heapen og returnerer adressen ${fmtHex(addrHeap)}. p (som ligger på stacken) lagrer denne adressen.`,
      cells,
      pointers: [{ name: "p", value: addrHeap, target: addrHeap, segment: "stack" }],
    });
  }

  // Frame 2 — p[0] = 10
  {
    const cells = clone(baseCells);
    for (let i = 0; i < 16; i++) {
      const c = cells.find((m) => m.addr === addrHeap + i);
      if (c) {
        c.kind = "value";
        if (i === 0) {
          c.label = "malloc-blokk";
          c.note = "p[0]";
        }
        if (i === 4) c.note = "p[1]";
        if (i === 8) c.note = "p[2]";
        if (i === 12) c.note = "p[3]";
      }
    }
    writeU64LE(cells, addrP, addrHeap);
    labelRange(cells, addrP, 8, "p", "int *p");
    clearHighlights(cells);
    writeI32LE(cells, addrHeap, 10);
    frames.push({
      line: 2,
      description: "p[0] = 10; — pekeren dereferenses, og bytene skrives til heap-blokken. Vi krysser segment-grensen.",
      cells,
      pointers: [{ name: "p", value: addrHeap, target: addrHeap, pulsing: true, segment: "stack" }],
      dereference: { from: addrP, to: addrHeap },
    });
  }

  // Frame 3 — p[1] = 20
  {
    const cells = clone(baseCells);
    for (let i = 0; i < 16; i++) {
      const c = cells.find((m) => m.addr === addrHeap + i);
      if (c) {
        c.kind = "value";
        if (i === 0) {
          c.label = "malloc-blokk";
          c.note = "p[0]";
        }
        if (i === 4) c.note = "p[1]";
        if (i === 8) c.note = "p[2]";
        if (i === 12) c.note = "p[3]";
      }
    }
    writeU64LE(cells, addrP, addrHeap);
    labelRange(cells, addrP, 8, "p", "int *p");
    writeI32LE(cells, addrHeap, 10);
    clearHighlights(cells);
    writeI32LE(cells, addrHeap + 4, 20);
    frames.push({
      line: 3,
      description: "p[1] = 20; — samme som *(p + 1) = 20. p + 1 er 4 bytes lenger ut på heapen.",
      cells,
      pointers: [{ name: "p", value: addrHeap, target: addrHeap, segment: "stack" }],
    });
  }

  // Frame 4 — free(p) — heap-blokken returneres
  {
    const cells = clone(baseCells);
    // Heap-bytene markeres som "free" igjen, verdier nullstilt for visualisering
    for (let i = 0; i < 16; i++) {
      const c = cells.find((m) => m.addr === addrHeap + i);
      if (c) {
        c.kind = "free";
        c.byte = 0;
        c.highlight = true;
        if (i === 0) {
          c.label = "(frigjort)";
          c.note = "tilbake til allokator";
        }
      }
    }
    // p inneholder fortsatt adressen — det er en "dangling pointer".
    writeU64LE(cells, addrP, addrHeap);
    labelRange(cells, addrP, 8, "p (dangling)", "peker fortsatt på frigjort blokk");
    // Bare framhev heap-frigjøringen, ikke p
    for (let i = 0; i < 8; i++) {
      const c = cells.find((m) => m.addr === addrP + i);
      if (c) c.highlight = false;
    }
    frames.push({
      line: 4,
      description:
        "free(p); — heap-blokken gis tilbake til allokatoren. MERK: p selv har fortsatt samme verdi (en 'dangling pointer'). Bruk av *p nå = udefinert oppførsel.",
      cells,
      pointers: [{ name: "p", value: addrHeap, target: addrHeap, segment: "stack" }],
    });
  }

  // Frame 5 — return
  {
    const cells = clone(baseCells);
    for (let i = 0; i < 16; i++) {
      const c = cells.find((m) => m.addr === addrHeap + i);
      if (c) {
        c.kind = "free";
        c.byte = 0;
        if (i === 0) {
          c.label = "(frigjort)";
        }
      }
    }
    writeU64LE(cells, addrP, addrHeap);
    labelRange(cells, addrP, 8, "p (dangling)", "settes vanligvis til NULL etter free");
    clearHighlights(cells);
    frames.push({
      line: 5,
      description:
        "return 0; — stack-rammen rives ned, p forsvinner sammen med funksjonen. God skikk: p = NULL; rett etter free() for å unngå use-after-free.",
      cells,
      pointers: [{ name: "p", value: addrHeap, target: addrHeap, segment: "stack" }],
    });
  }

  return { lines, frames, memCaption: "Stack (p) + heap-segment (malloc-blokk)" };
}

// --------------------------------------------------------------------------
// Bygg riktig program
// --------------------------------------------------------------------------

function buildProgram(mode: Mode): Program {
  if (mode === "stack") return buildStackProgram();
  if (mode === "ptr") return buildPointerProgram();
  if (mode === "array") return buildArrayProgram();
  if (mode === "struct") return buildStructProgram();
  return buildHeapProgram();
}

// --------------------------------------------------------------------------
// Hovedkomponent
// --------------------------------------------------------------------------

export function MemoryVisualizer() {
  const [mode, setMode] = useState<Mode>("stack");
  const program = useMemo(() => buildProgram(mode), [mode]);
  const frames = program.frames;
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);

  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [mode]);

  useEffect(() => {
    if (!playing) return;
    if (step >= frames.length - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), speed);
    return () => window.clearTimeout(t);
  }, [playing, step, frames.length, speed]);

  const current: Frame =
    frames[step] ?? ({ line: 0, description: "", cells: [], pointers: [] } as Frame);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden" role="region" aria-label="Interaktiv visualisering: C-minne">
      {/* Topp-bar */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              C-minne — bytes, adresser og pekere steg for steg
            </div>
          </div>
          <div className="text-xs text-muted-foreground tabular-nums">
            steg {Math.min(step + 1, frames.length)} / {frames.length}
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

      {/* Hovedlayout: kode | minne-diagram */}
      <div className="grid lg:grid-cols-[1fr_1fr] gap-0 border-b border-border">
        {/* Kode-panel */}
        <div className="border-r border-border bg-background p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            C-kode
          </div>
          <pre className="font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre">
            {program.lines.map((line, i) => {
              const isActive = i === current.line;
              return (
                <div
                  key={i}
                  className={`-mx-2 px-2 rounded flex ${
                    isActive
                      ? "bg-brand/15 text-foreground border-l-2 border-brand"
                      : "text-muted-foreground border-l-2 border-transparent"
                  }`}
                >
                  <span className="inline-block w-7 text-right pr-2 select-none opacity-60">
                    {isActive ? "▶" : i + 1}
                  </span>
                  <span className="flex-1">{line || " "}</span>
                </div>
              );
            })}
          </pre>

          {/* Segment-legende */}
          <div className="mt-4 pt-3 border-t border-border">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Segmenter
            </div>
            <div className="flex flex-wrap gap-2 text-[10px]">
              <LegendChip color="stack" label="STACK — lokale variabler" />
              <LegendChip color="heap" label="HEAP — malloc-blokker" />
              <LegendChip color="padding" label="padding (alignment)" />
              <LegendChip color="free" label="ledig / frigjort" />
            </div>
          </div>
        </div>

        {/* Minne-diagram (SVG) */}
        <div className="bg-muted/5 p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            {program.memCaption}
          </div>
          <MemoryDiagram cells={current.cells} pointers={current.pointers} dereference={current.dereference} />
        </div>
      </div>

      {/* Beskrivelse */}
      <div className="px-4 py-3 border-b border-border bg-muted/20">
        <div className="text-sm text-foreground">
          {current.description || "Trykk Play eller Neste for å starte."}
        </div>
        <div className="text-xs text-muted-foreground italic mt-2">{MODE_NOTE[mode]}</div>
      </div>

      {/* Kontroller */}
      <div className="px-4 py-3 bg-muted/20 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStep(0);
            }}
            className="px-2 py-1 rounded border border-border hover:bg-muted text-xs inline-flex items-center gap-1"
            title="Reset"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStep((s) => Math.max(0, s - 1));
            }}
            disabled={step === 0}
            className="px-2 py-1 rounded border border-border hover:bg-muted text-xs inline-flex items-center gap-1 disabled:opacity-40"
            title="Forrige steg"
          >
            <SkipBack className="h-3 w-3" /> Forrige
          </button>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            disabled={step >= frames.length - 1 && !playing}
            className="px-3 py-1 rounded border border-brand bg-brand text-brand-foreground hover:opacity-90 text-xs inline-flex items-center gap-1 disabled:opacity-40"
          >
            {playing ? (
              <>
                <Pause className="h-3 w-3" /> Pause
              </>
            ) : (
              <>
                <Play className="h-3 w-3" /> Play
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStep((s) => Math.min(frames.length - 1, s + 1));
            }}
            disabled={step >= frames.length - 1}
            className="px-2 py-1 rounded border border-border hover:bg-muted text-xs inline-flex items-center gap-1 disabled:opacity-40"
            title="Neste steg"
          >
            Neste <SkipForward className="h-3 w-3" />
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-muted-foreground" htmlFor="mem-speed">
            tempo
          </label>
          <input
            id="mem-speed"
            type="range"
            min={200}
            max={1500}
            step={50}
            value={1700 - speed}
            onChange={(e) => setSpeed(1700 - Number.parseInt(e.target.value, 10))}
            className="w-28 accent-brand"
          />
        </div>

        <div className="w-full">
          <input
            type="range"
            min={0}
            max={Math.max(0, frames.length - 1)}
            value={step}
            onChange={(e) => {
              setPlaying(false);
              setStep(Number.parseInt(e.target.value, 10));
            }}
            className="w-full accent-brand"
            aria-label="Steg-scrubber"
          />
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Sub-komponenter
// --------------------------------------------------------------------------

function LegendChip({ color, label }: { color: "stack" | "heap" | "padding" | "free"; label: string }) {
  const cls =
    color === "stack"
      ? "bg-blue-500/20 border-blue-500/40"
      : color === "heap"
      ? "bg-emerald-500/20 border-emerald-500/40"
      : color === "padding"
      ? "bg-amber-500/15 border-amber-500/40"
      : "bg-muted border-border";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block w-3 h-3 rounded-sm border ${cls}`} />
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}

/**
 * Tegner minne som en vertikal kolonne av byte-celler. Adressen er til
 * venstre, byte-verdien (hex) til høyre. Pekere tegnes som navngitte bokser
 * med piler ned til target-adressen.
 */
function MemoryDiagram({
  cells,
  pointers,
  dereference,
}: {
  cells: MemCell[];
  pointers: PointerBox[];
  dereference?: { from: number; to: number };
}) {
  if (cells.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic px-2 py-6 rounded border border-dashed border-border">
        Ingen minne å vise i dette steget.
      </div>
    );
  }

  // Sortér etter adresse, men VIS lavest adresse øverst (stack vokser nedover).
  const sorted = [...cells].sort((a, b) => a.addr - b.addr);

  // Geometri
  const cellH = 22;
  const cellW = 240;
  const addrW = 90;
  const valW = 64;
  const noteW = cellW - addrW - valW;
  const padX = 16;
  const ptrColW = 130;
  const totalW = padX + cellW + ptrColW + padX;
  // Hvis vi har segment-bytte (stack→heap-hopp), legg inn en gap-rad.
  const rows: ({ kind: "cell"; cell: MemCell } | { kind: "gap"; label: string })[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].segment !== sorted[i - 1].segment) {
      rows.push({ kind: "gap", label: `── ${sorted[i].segment.toUpperCase()} ──` });
    } else if (i === 0) {
      rows.push({ kind: "gap", label: `── ${sorted[i].segment.toUpperCase()} ──` });
    }
    rows.push({ kind: "cell", cell: sorted[i] });
  }
  const totalH = rows.length * cellH + 12;

  // Map adresse → y-koordinat (senterlinjen til cellen)
  const yForAddr = new Map<number, number>();
  rows.forEach((r, idx) => {
    if (r.kind === "cell") {
      yForAddr.set(r.cell.addr, idx * cellH + cellH / 2 + 6);
    }
  });

  return (
    <div className="overflow-x-auto">
      <svg
        width={totalW}
        height={totalH}
        viewBox={`0 0 ${totalW} ${totalH}`}
        className="font-mono text-[10px]"
      >
        <defs>
          <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="currentColor" className="text-brand" />
          </marker>
          <marker id="arrowhead-deref" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="currentColor" className="text-amber-500" />
          </marker>
          <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="1.5" className="text-amber-500/50" />
          </pattern>
        </defs>

        {rows.map((r, idx) => {
          const y = idx * cellH + 6;
          if (r.kind === "gap") {
            return (
              <g key={`gap-${idx}`}>
                <line
                  x1={padX}
                  y1={y + cellH / 2}
                  x2={padX + cellW}
                  y2={y + cellH / 2}
                  stroke="currentColor"
                  strokeDasharray="3 3"
                  className="text-muted-foreground/50"
                />
                <text
                  x={padX + cellW / 2}
                  y={y + cellH / 2 - 3}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[9px] uppercase tracking-wider"
                >
                  {r.label}
                </text>
              </g>
            );
          }
          const cell = r.cell;
          // Bakgrunnsfarge basert på segment + kind
          let bgClass = "fill-card";
          let borderClass = "stroke-border";
          if (cell.kind === "padding") {
            bgClass = "fill-amber-500/10";
            borderClass = "stroke-amber-500/40";
          } else if (cell.kind === "free") {
            bgClass = "fill-muted/40";
            borderClass = "stroke-border";
          } else if (cell.segment === "heap") {
            bgClass = "fill-emerald-500/10";
            borderClass = "stroke-emerald-500/40";
          } else if (cell.segment === "stack") {
            bgClass = "fill-blue-500/10";
            borderClass = "stroke-blue-500/40";
          }
          if (cell.highlight) {
            bgClass = "fill-brand/25";
            borderClass = "stroke-brand";
          }

          return (
            <g key={cell.addr}>
              {/* Adresse-label til venstre for cellen */}
              <text
                x={padX - 4}
                y={y + cellH / 2 + 3}
                textAnchor="end"
                className="fill-muted-foreground"
              >
                {fmtHex(cell.addr)}
              </text>

              {/* Selve cellen */}
              <rect
                x={padX}
                y={y + 1}
                width={cellW}
                height={cellH - 2}
                rx={3}
                className={`${bgClass} ${borderClass}`}
                strokeWidth={cell.highlight ? 1.5 : 1}
              />
              {cell.kind === "padding" && (
                <rect
                  x={padX}
                  y={y + 1}
                  width={cellW}
                  height={cellH - 2}
                  rx={3}
                  fill="url(#hatch)"
                  className="text-amber-500/40"
                />
              )}

              {/* Byte-verdi */}
              <text
                x={padX + 8}
                y={y + cellH / 2 + 3}
                className={`${cell.kind === "free" ? "fill-muted-foreground/50" : "fill-foreground"} font-semibold`}
              >
                {cell.kind === "free" ? "··" : fmtByte(cell.byte)}
              </text>

              {/* Variabel-label */}
              {cell.label && (
                <text
                  x={padX + 36}
                  y={y + cellH / 2 + 3}
                  className="fill-foreground font-semibold"
                >
                  {cell.label}
                </text>
              )}

              {/* Note (gråtekst lengst til høyre) */}
              {cell.note && !cell.label && (
                <text
                  x={padX + cellW - 6}
                  y={y + cellH / 2 + 3}
                  textAnchor="end"
                  className="fill-muted-foreground italic"
                >
                  {cell.note}
                </text>
              )}
              {cell.note && cell.label && (
                <text
                  x={padX + cellW - 6}
                  y={y + cellH / 2 + 3}
                  textAnchor="end"
                  className="fill-muted-foreground italic"
                >
                  {cell.note}
                </text>
              )}
            </g>
          );
        })}

        {/* Pekere — navngitte bokser til høyre, pil ned til target-adressen */}
        {pointers.map((p, i) => {
          const targetY = p.target != null ? yForAddr.get(p.target) : undefined;
          // Boks: legg over første "highlight" eller bare øverst til høyre
          const boxY = 30 + i * 36;
          const boxX = padX + cellW + 14;
          const boxW = ptrColW - 28;
          const boxH = 26;
          return (
            <g key={p.name + i} className={p.pulsing ? "animate-pulse" : ""}>
              <rect
                x={boxX}
                y={boxY}
                width={boxW}
                height={boxH}
                rx={4}
                className={`${p.pulsing ? "fill-amber-500/15 stroke-amber-500" : "fill-brand/15 stroke-brand"}`}
                strokeWidth={1.5}
              />
              <text
                x={boxX + 6}
                y={boxY + 11}
                className="fill-foreground font-semibold"
              >
                {p.name}
              </text>
              <text
                x={boxX + 6}
                y={boxY + 22}
                className="fill-muted-foreground"
              >
                {fmtHex(p.value)}
              </text>

              {/* Pil fra boks til target-adresse */}
              {targetY != null && (
                <path
                  d={`M ${boxX} ${boxY + boxH / 2} C ${boxX - 30} ${boxY + boxH / 2}, ${padX + cellW + 20} ${targetY}, ${padX + cellW + 2} ${targetY}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  markerEnd="url(#arrowhead)"
                  className={p.pulsing ? "text-amber-500" : "text-brand"}
                />
              )}
            </g>
          );
        })}

        {/* Eksplisitt dereferens-pil (animert i et eget steg) */}
        {dereference && yForAddr.get(dereference.to) != null && (
          <g className="animate-pulse">
            <text
              x={padX + cellW - 10}
              y={yForAddr.get(dereference.to)! - 8}
              textAnchor="end"
              className="fill-amber-500 font-semibold text-[9px]"
            >
              *p leses her
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
