import { useEffect, useMemo, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv visualisering av virtuelt minne — fire moduser:
//   1) translate    — VA splittes i [VPN|offset], page-tabell-oppslag, PA bygges.
//   2) multi-level  — 32-bit VA splittes i [L1|L2|offset], to nivåer page-tabeller.
//   3) tlb          — TLB-miss vs TLB-hit på to sekvensielle oppslag.
//   4) fault        — page fault: present=0, OS evicter via LRU, swap, retry.
// Hvert mode har en pre-computet trace (array av Frame). Step-controlleren
// indekserer bare inn — ingen state-maskin i UI-laget.
// --------------------------------------------------------------------------

type Mode = "translate" | "multi-level" | "tlb" | "fault";

interface BitRange {
  /** Inklusiv start-bit (MSB-side). Bits er nummerert fra venstre/MSB. */
  start: number;
  /** Inklusiv slutt-bit. */
  end: number;
  /** Hva delen heter (vises som overskrift over biten). */
  label: string;
  /** Tailwind-farge-prefix: "brand" | "success" | "warning". */
  color: "brand" | "success" | "warning" | "muted";
}

interface PageTableEntry {
  /** Indeks (= VPN eller L1/L2-indeks). */
  index: number;
  /** Frame number (PFN) eller peker til neste-nivå tabell. */
  frame?: number;
  /** Hex-streng som vises dersom verdien er en peker (multi-level). */
  pointerLabel?: string;
  /** Valid bit. */
  valid: boolean;
  /** Present bit (i RAM). */
  present?: boolean;
  /** Markerer denne raden som "leses nå". */
  highlight?: boolean;
}

interface PageTableInfo {
  /** Tittel over tabellen, f.eks. "Page table (CR3)". */
  title: string;
  /** Liten note under tittelen. */
  subtitle?: string;
  /** Rader. */
  entries: PageTableEntry[];
  /** Hvilken kolonne-tekst som brukes for verdien — "frame" eller "ptr". */
  valueKind: "frame" | "ptr";
}

interface TLBEntry {
  vpn: number;
  pfn: number;
  /** Settes når vi nettopp har lest (cache hit) eller skrevet (etter miss). */
  state: "idle" | "hit" | "filled";
}

interface PhysicalFrame {
  index: number;
  /** Hvilken (prosess, VPN) sin side ligger her. undefined = ledig. */
  page?: { proc: string; vpn: number };
  /** Settes når frame'en akkurat ble lest eller skrevet. */
  highlight?: boolean;
  /** Markerer at vi nettopp evicterte (skraverer). */
  evicted?: boolean;
}

interface SwapEntry {
  /** Identifikator, f.eks. "P0/VPN=3". */
  id: string;
  /** Settes når vi nettopp leste den inn fra disk. */
  reading?: boolean;
}

interface Frame {
  /** Tittel-stripe over diagrammet. */
  step: string;
  /** Brødtekst-forklaring. */
  description: string;
  /** Bit-feltet vises kun i translate / multi-level. */
  bits?: {
    /** Bit-tegnstrengen, f.eks. "0010000100100011" (16 tegn). */
    value: string;
    ranges: BitRange[];
    /** Tekst som vises over hele feltet. */
    title: string;
  };
  /** Page-tabeller (én eller flere — multi-level har to). */
  tables?: PageTableInfo[];
  /** TLB-tabell (kun tlb-mode). */
  tlb?: TLBEntry[];
  /** Fysiske frames (kun fault-mode). */
  frames?: PhysicalFrame[];
  /** Swap-disk (kun fault-mode). */
  swap?: SwapEntry[];
  /** Resultat-linje (ferdig PA, eller "PAGE FAULT", eller "TLB HIT"). */
  result?: {
    label: string;
    value: string;
    tone: "success" | "warning" | "brand" | "destructive";
  };
  /** Cycle-cost-overlay (kun tlb-mode). */
  cost?: { cycles: number; label: string };
}

interface Trace {
  /** Liten intro-tekst over diagrammet. */
  intro: string;
  frames: Frame[];
}

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "translate", label: "Adresseoversettelse", sub: "16-bit VA → PA via page-tabell" },
  { id: "multi-level", label: "Multi-level walk", sub: "32-bit VA, L1 → L2 → frame" },
  { id: "tlb", label: "TLB-hit vs miss", sub: "to sekvensielle oppslag" },
  { id: "fault", label: "Page fault & swap", sub: "demand paging + LRU-eviction" },
];

const MODE_NOTE: Record<Mode, string> = {
  translate:
    "Offset endrer seg ALDRI under oversettelsen. Det er bare den øvre delen (VPN) som slås opp og erstattes med PFN.",
  "multi-level":
    "x86-64 har fire nivåer (CR3 → PML4 → PDPT → PD → PT). Vi viser to nivåer her — prinsippet er det samme. Ubrukte grener allokeres aldri, så minneforbruket er proporsjonalt med faktisk brukte sider.",
  tlb: "TLB-en har 64–1024 entries i ekte CPU-er. Hit = 1 cycle, miss + walk = ~100 cycles. Sekvensiell aksess innenfor samme page treffer alltid TLB-en.",
  fault:
    "Demand paging: sider lastes IKKE før de faktisk treffes. Det er derfor malloc(1 GB) er momentant. Når RAM er fullt, evicter OS-en (her med LRU) — en major fault tar millisekunder, ~10⁶× tregere enn RAM.",
};

// --------------------------------------------------------------------------
// Hjelpere
// --------------------------------------------------------------------------

function toBin(value: number, width: number): string {
  let s = (value >>> 0).toString(2);
  if (s.length < width) s = "0".repeat(width - s.length) + s;
  if (s.length > width) s = s.slice(-width);
  return s;
}

function toHex(value: number, width = 4): string {
  return "0x" + value.toString(16).padStart(width, "0").toUpperCase();
}

// --------------------------------------------------------------------------
// Mode 1 — Single-level adresseoversettelse
// --------------------------------------------------------------------------

interface TranslateExample {
  label: string;
  va: number;
  /** Bare 4 bits VPN i en 16-bit VA med 12 bits offset. */
  vpnBits: number;
  offsetBits: number;
  /** Page-tabell: VPN → PFN. */
  table: { vpn: number; pfn: number; valid: boolean }[];
}

const TRANSLATE_EXAMPLES: TranslateExample[] = [
  {
    label: "Eksempel A — VA = 0x2123",
    va: 0x2123,
    vpnBits: 4,
    offsetBits: 12,
    table: [
      { vpn: 0, pfn: 5, valid: true },
      { vpn: 1, pfn: 3, valid: true },
      { vpn: 2, pfn: 7, valid: true },
      { vpn: 3, pfn: 1, valid: true },
      { vpn: 4, pfn: 0, valid: false },
      { vpn: 5, pfn: 9, valid: true },
    ],
  },
  {
    label: "Eksempel B — VA = 0x5042",
    va: 0x5042,
    vpnBits: 4,
    offsetBits: 12,
    table: [
      { vpn: 0, pfn: 2, valid: true },
      { vpn: 1, pfn: 6, valid: true },
      { vpn: 2, pfn: 0, valid: false },
      { vpn: 3, pfn: 4, valid: true },
      { vpn: 4, pfn: 8, valid: true },
      { vpn: 5, pfn: 11, valid: true },
    ],
  },
];

function buildTranslateTrace(example: TranslateExample): Trace {
  const { va, vpnBits, offsetBits, table } = example;
  const bits = toBin(va, vpnBits + offsetBits);
  const vpn = va >>> offsetBits;
  const offset = va & ((1 << offsetBits) - 1);
  const entry = table.find((e) => e.vpn === vpn);
  const pfn = entry?.pfn ?? 0;
  const pa = (pfn << offsetBits) | offset;

  const ranges: BitRange[] = [
    { start: 0, end: vpnBits - 1, label: `VPN (${vpnBits} bits)`, color: "brand" },
    {
      start: vpnBits,
      end: vpnBits + offsetBits - 1,
      label: `offset (${offsetBits} bits)`,
      color: "success",
    },
  ];

  const tableEntries: PageTableEntry[] = table.map((e) => ({
    index: e.vpn,
    frame: e.pfn,
    valid: e.valid,
  }));

  const frames: Frame[] = [];

  // Frame 0 — VA introdusert
  frames.push({
    step: "1. Virtuell adresse",
    description: `Vi starter med VA = ${toHex(va, 4)}. Page-størrelsen er 4 KB, så de nederste ${offsetBits} bitsene er offset og de øverste ${vpnBits} bitsene er VPN.`,
    bits: { value: bits, ranges, title: "Virtuell adresse (16 bit)" },
    tables: [
      {
        title: "Page table",
        subtitle: "VPN → PFN, valid",
        entries: tableEntries,
        valueKind: "frame",
      },
    ],
  });

  // Frame 1 — split VPN/offset
  frames.push({
    step: "2. Splitt bits",
    description: `VPN = ${vpn} (binært ${bits.slice(0, vpnBits)}). Offset = ${toHex(offset, 3)} (binært ${bits.slice(vpnBits)}). Offset er uendret hele veien — bare VPN oversettes.`,
    bits: { value: bits, ranges, title: "VPN | offset" },
    tables: [
      {
        title: "Page table",
        subtitle: "VPN → PFN, valid",
        entries: tableEntries,
        valueKind: "frame",
      },
    ],
  });

  // Frame 2 — slå opp VPN i tabell
  frames.push({
    step: "3. Slå opp VPN",
    description: entry?.valid
      ? `Page-tabellen radnummer ${vpn} har valid=1 og PFN = ${pfn}. Vi henter ut PFN.`
      : `Page-tabellen radnummer ${vpn} har valid=0 → SEGFAULT (adressen er ikke mappet).`,
    bits: { value: bits, ranges, title: "VPN | offset" },
    tables: [
      {
        title: "Page table",
        subtitle: "VPN → PFN, valid",
        entries: tableEntries.map((e) => ({ ...e, highlight: e.index === vpn })),
        valueKind: "frame",
      },
    ],
  });

  // Frame 3 — sett sammen PA
  frames.push({
    step: "4. Bygg fysisk adresse",
    description: `PA = PFN × 2^${offsetBits} + offset = ${pfn} × ${1 << offsetBits} + ${toHex(offset, 3)} = ${toHex(pa, 4)}. Offset er bit-for-bit den samme som i VA.`,
    bits: {
      value: toBin(pa, vpnBits + offsetBits),
      ranges: [
        { start: 0, end: vpnBits - 1, label: `PFN (${vpnBits} bits)`, color: "warning" },
        {
          start: vpnBits,
          end: vpnBits + offsetBits - 1,
          label: `offset (${offsetBits} bits)`,
          color: "success",
        },
      ],
      title: "Fysisk adresse",
    },
    tables: [
      {
        title: "Page table",
        subtitle: "VPN → PFN, valid",
        entries: tableEntries.map((e) => ({ ...e, highlight: e.index === vpn })),
        valueKind: "frame",
      },
    ],
    result: {
      label: "Fysisk adresse",
      value: toHex(pa, 4),
      tone: entry?.valid ? "success" : "destructive",
    },
  });

  return {
    intro: `Et 16-bit virtuelt adresserom med 4 KB pages: ${vpnBits} bits VPN + ${offsetBits} bits offset. Page-tabellen har 2^${vpnBits} = ${1 << vpnBits} mulige rader.`,
    frames,
  };
}

// --------------------------------------------------------------------------
// Mode 2 — Multi-level page table walk
// --------------------------------------------------------------------------

interface MultiLevelExample {
  va: number;
  /** Bit-bredder. Totalt = l1 + l2 + offset. Holdes på 12 + 8 + 12 = 32 bit. */
  l1Bits: number;
  l2Bits: number;
  offsetBits: number;
  /** L1-tabell: indeks → (peker til L2-tabell, valid). undefined frame = uallokert. */
  l1Table: { index: number; valid: boolean; ptr?: number }[];
  /** L2-tabeller, mappet på L1-pekeren. */
  l2Tables: Record<number, { index: number; valid: boolean; pfn: number }[]>;
}

function makeMultiExample(): MultiLevelExample {
  // VA = 0x00C0_4123. L1 = 0x00C >> 4 = 0... actually let's pick crispier:
  // 32-bit VA = 0x10204500
  // L1 = 0x102 (top 12 bits)
  // L2 = 0x04 (next 8 bits)
  // offset = 0x500 (low 12 bits)
  const va = 0x10204500;
  return {
    va,
    l1Bits: 12,
    l2Bits: 8,
    offsetBits: 12,
    l1Table: [
      { index: 0x000, valid: false },
      { index: 0x102, valid: true, ptr: 0x40000 },
      { index: 0x103, valid: true, ptr: 0x41000 },
      { index: 0x7ff, valid: true, ptr: 0x42000 },
    ],
    l2Tables: {
      0x40000: [
        { index: 0x00, valid: true, pfn: 0x123 },
        { index: 0x01, valid: true, pfn: 0x124 },
        { index: 0x03, valid: false, pfn: 0 },
        { index: 0x04, valid: true, pfn: 0x9ab },
        { index: 0x05, valid: true, pfn: 0x9ac },
      ],
      0x41000: [{ index: 0x00, valid: true, pfn: 0x200 }],
      0x42000: [{ index: 0xff, valid: true, pfn: 0x800 }],
    },
  };
}

function buildMultiLevelTrace(ex: MultiLevelExample): Trace {
  const { va, l1Bits, l2Bits, offsetBits, l1Table, l2Tables } = ex;
  const total = l1Bits + l2Bits + offsetBits;
  const bits = toBin(va, total);
  const l1Idx = va >>> (l2Bits + offsetBits);
  const l2Idx = (va >>> offsetBits) & ((1 << l2Bits) - 1);
  const offset = va & ((1 << offsetBits) - 1);

  const l1Entry = l1Table.find((e) => e.index === l1Idx);
  const l2TableRows = l1Entry?.ptr != null ? (l2Tables[l1Entry.ptr] ?? []) : [];
  const l2Entry = l2TableRows.find((e) => e.index === l2Idx);
  const pfn = l2Entry?.pfn ?? 0;
  const pa = (pfn << offsetBits) | offset;

  const ranges: BitRange[] = [
    { start: 0, end: l1Bits - 1, label: `L1 (${l1Bits} b)`, color: "brand" },
    { start: l1Bits, end: l1Bits + l2Bits - 1, label: `L2 (${l2Bits} b)`, color: "warning" },
    { start: l1Bits + l2Bits, end: total - 1, label: `offset (${offsetBits} b)`, color: "success" },
  ];

  const l1Entries: PageTableEntry[] = l1Table.map((e) => ({
    index: e.index,
    valid: e.valid,
    pointerLabel: e.ptr != null ? toHex(e.ptr, 5) : "—",
  }));

  const l2Entries: PageTableEntry[] = l2TableRows.map((e) => ({
    index: e.index,
    valid: e.valid,
    frame: e.pfn,
  }));

  const frames: Frame[] = [];

  // 0 — VA introdusert
  frames.push({
    step: "1. Virtuell adresse",
    description: `VA = ${toHex(va, 8)}. Splitt i tre felt: L1 (${l1Bits} bits), L2 (${l2Bits} bits), offset (${offsetBits} bits). Hvert nivå indekserer inn i en mindre tabell.`,
    bits: { value: bits, ranges, title: "Virtuell adresse (32 bit)" },
    tables: [
      {
        title: "L1-tabell (rot, CR3)",
        subtitle: "indeks → peker til L2",
        entries: l1Entries,
        valueKind: "ptr",
      },
    ],
  });

  // 1 — slå opp L1
  frames.push({
    step: "2. L1-oppslag",
    description: l1Entry?.valid
      ? `L1-indeks = ${toHex(l1Idx, 3)}. Rad ${toHex(l1Idx, 3)} er gyldig og peker på L2-tabellen på ${toHex(l1Entry.ptr ?? 0, 5)}.`
      : `L1-indeks = ${toHex(l1Idx, 3)} er ikke allokert → SEGFAULT.`,
    bits: { value: bits, ranges, title: "L1 | L2 | offset" },
    tables: [
      {
        title: "L1-tabell",
        subtitle: "indeks → peker",
        entries: l1Entries.map((e) => ({ ...e, highlight: e.index === l1Idx })),
        valueKind: "ptr",
      },
    ],
  });

  // 2 — last L2-tabell
  frames.push({
    step: "3. L2-oppslag",
    description: l2Entry?.valid
      ? `L2-indeks = ${toHex(l2Idx, 2)}. Vi leser radnummer ${toHex(l2Idx, 2)} i L2-tabellen → PFN = ${toHex(pfn, 3)}.`
      : `L2-indeks = ${toHex(l2Idx, 2)} er ikke gyldig → SEGFAULT.`,
    bits: { value: bits, ranges, title: "L1 | L2 | offset" },
    tables: [
      {
        title: "L1-tabell",
        subtitle: `peker valgt: ${toHex(l1Entry?.ptr ?? 0, 5)}`,
        entries: l1Entries.map((e) => ({ ...e, highlight: e.index === l1Idx })),
        valueKind: "ptr",
      },
      {
        title: "L2-tabell",
        subtitle: `på ${toHex(l1Entry?.ptr ?? 0, 5)}`,
        entries: l2Entries.map((e) => ({ ...e, highlight: e.index === l2Idx })),
        valueKind: "frame",
      },
    ],
  });

  // 3 — bygg PA
  frames.push({
    step: "4. Bygg fysisk adresse",
    description: `PA = PFN × 2^${offsetBits} + offset = ${toHex(pfn, 3)} × ${toHex(1 << offsetBits, 4)} + ${toHex(offset, 3)} = ${toHex(pa, 8)}. To minneaksesser (én per nivå) — i x86-64 er det fire.`,
    bits: {
      value: toBin(pa, total),
      ranges: [
        {
          start: 0,
          end: l1Bits + l2Bits - 1,
          label: `PFN (${l1Bits + l2Bits} b)`,
          color: "warning",
        },
        {
          start: l1Bits + l2Bits,
          end: total - 1,
          label: `offset (${offsetBits} b)`,
          color: "success",
        },
      ],
      title: "Fysisk adresse",
    },
    tables: [
      {
        title: "L1-tabell",
        subtitle: "ferdig brukt",
        entries: l1Entries.map((e) => ({ ...e, highlight: e.index === l1Idx })),
        valueKind: "ptr",
      },
      {
        title: "L2-tabell",
        subtitle: `PFN = ${toHex(pfn, 3)}`,
        entries: l2Entries.map((e) => ({ ...e, highlight: e.index === l2Idx })),
        valueKind: "frame",
      },
    ],
    result: {
      label: "Fysisk adresse",
      value: toHex(pa, 8),
      tone: l2Entry?.valid ? "success" : "destructive",
    },
  });

  return {
    intro:
      "32-bit VA delt i [L1 (12) | L2 (8) | offset (12)]. To page-table-nivåer. Sparer minne fordi ubrukte L2-tabeller aldri allokeres — i et sparse adresserom kan dette være forskjellen på 4 MB og 4 GB tabell-overhead.",
    frames,
  };
}

// --------------------------------------------------------------------------
// Mode 3 — TLB hit vs miss
// --------------------------------------------------------------------------

interface TLBExample {
  /** To sekvensielle aksess-VPN'er. Første er miss, andre hit. */
  accesses: { va: number; vpnBits: number; offsetBits: number }[];
  /** Page-table mapping. */
  table: { vpn: number; pfn: number; valid: boolean }[];
  /** Initiell TLB. */
  initialTlb: TLBEntry[];
}

const TLB_EX: TLBExample = {
  accesses: [
    { va: 0x2123, vpnBits: 4, offsetBits: 12 },
    { va: 0x2456, vpnBits: 4, offsetBits: 12 },
  ],
  table: [
    { vpn: 0, pfn: 5, valid: true },
    { vpn: 1, pfn: 3, valid: true },
    { vpn: 2, pfn: 7, valid: true },
    { vpn: 3, pfn: 1, valid: true },
    { vpn: 4, pfn: 9, valid: true },
  ],
  initialTlb: [
    { vpn: 0, pfn: 5, state: "idle" },
    { vpn: 1, pfn: 3, state: "idle" },
    { vpn: 7, pfn: 11, state: "idle" },
    { vpn: 3, pfn: 1, state: "idle" },
  ],
};

function buildTlbTrace(ex: TLBExample): Trace {
  const frames: Frame[] = [];
  const tableEntries: PageTableEntry[] = ex.table.map((e) => ({
    index: e.vpn,
    frame: e.pfn,
    valid: e.valid,
  }));

  let tlb: TLBEntry[] = ex.initialTlb.map((e) => ({ ...e }));

  // --- Access 1: VPN=2 (miss) ---
  const a1 = ex.accesses[0];
  const a1Bits = toBin(a1.va, a1.vpnBits + a1.offsetBits);
  const a1Vpn = a1.va >>> a1.offsetBits;
  const a1Off = a1.va & ((1 << a1.offsetBits) - 1);
  const a1Pfn = ex.table.find((e) => e.vpn === a1Vpn)?.pfn ?? 0;
  const a1Pa = (a1Pfn << a1.offsetBits) | a1Off;
  const ranges1: BitRange[] = [
    { start: 0, end: a1.vpnBits - 1, label: "VPN", color: "brand" },
    { start: a1.vpnBits, end: a1.vpnBits + a1.offsetBits - 1, label: "offset", color: "success" },
  ];

  // F0: aksess 1 starter
  frames.push({
    step: "Aksess #1 — VA " + toHex(a1.va, 4),
    description: `Første aksess: VA = ${toHex(a1.va, 4)}, VPN = ${a1Vpn}. Vi sjekker TLB først.`,
    bits: { value: a1Bits, ranges: ranges1, title: "VA #1" },
    tlb: tlb.map((e) => ({ ...e })),
    tables: [
      {
        title: "Page table",
        subtitle: "VPN → PFN",
        entries: tableEntries,
        valueKind: "frame",
      },
    ],
  });

  // F1: TLB-miss
  frames.push({
    step: "TLB-MISS",
    description: `Ingen entry i TLB-en har VPN = ${a1Vpn}. Det er en TLB-miss — vi må gå til page-tabellen i minnet. ~100 cycles for en single-level walk.`,
    bits: { value: a1Bits, ranges: ranges1, title: "VA #1" },
    tlb: tlb.map((e) => ({ ...e })),
    tables: [
      {
        title: "Page table",
        subtitle: "VPN → PFN",
        entries: tableEntries,
        valueKind: "frame",
      },
    ],
    result: { label: "TLB", value: "MISS", tone: "warning" },
    cost: { cycles: 100, label: "Page-table walk" },
  });

  // F2: slå opp i page-tabellen
  frames.push({
    step: "Walk page table",
    description: `Page-tabellen radnummer ${a1Vpn} → PFN = ${a1Pfn}. Vi henter ut PFN og bygger PA = ${toHex(a1Pa, 4)}.`,
    bits: { value: a1Bits, ranges: ranges1, title: "VA #1" },
    tlb: tlb.map((e) => ({ ...e })),
    tables: [
      {
        title: "Page table",
        subtitle: "leser radnummer " + a1Vpn,
        entries: tableEntries.map((e) => ({ ...e, highlight: e.index === a1Vpn })),
        valueKind: "frame",
      },
    ],
    result: { label: "PA", value: toHex(a1Pa, 4), tone: "success" },
  });

  // F3: fyll TLB med (VPN=2 → PFN=7) — evicter siste (LRU-ish, vi tar siste plass)
  tlb = [
    { vpn: 0, pfn: 5, state: "idle" },
    { vpn: 1, pfn: 3, state: "idle" },
    { vpn: 7, pfn: 11, state: "idle" },
    { vpn: a1Vpn, pfn: a1Pfn, state: "filled" },
  ];
  frames.push({
    step: "Fyll TLB",
    description: `Vi fyller TLB-en med (VPN=${a1Vpn}, PFN=${a1Pfn}). En annen entry må kastes (her: VPN=3, etter LRU-policy). Neste aksess til samme VPN vil være en hit.`,
    bits: { value: a1Bits, ranges: ranges1, title: "VA #1" },
    tlb: tlb.map((e) => ({ ...e })),
    tables: [
      {
        title: "Page table",
        subtitle: "ferdig brukt",
        entries: tableEntries,
        valueKind: "frame",
      },
    ],
  });

  // --- Access 2: VPN=2 (hit, samme page) ---
  const a2 = ex.accesses[1];
  const a2Bits = toBin(a2.va, a2.vpnBits + a2.offsetBits);
  const a2Vpn = a2.va >>> a2.offsetBits;
  const a2Off = a2.va & ((1 << a2.offsetBits) - 1);
  const a2Pfn = tlb.find((e) => e.vpn === a2Vpn)?.pfn ?? 0;
  const a2Pa = (a2Pfn << a2.offsetBits) | a2Off;
  const ranges2: BitRange[] = [
    { start: 0, end: a2.vpnBits - 1, label: "VPN", color: "brand" },
    { start: a2.vpnBits, end: a2.vpnBits + a2.offsetBits - 1, label: "offset", color: "success" },
  ];

  // F4: aksess 2 starter
  frames.push({
    step: "Aksess #2 — VA " + toHex(a2.va, 4),
    description: `Andre aksess: VA = ${toHex(a2.va, 4)}, VPN = ${a2Vpn}. Samme page som forrige aksess. Vi sjekker TLB.`,
    bits: { value: a2Bits, ranges: ranges2, title: "VA #2" },
    tlb: tlb.map((e) => ({ ...e })),
    tables: [
      {
        title: "Page table",
        subtitle: "VPN → PFN",
        entries: tableEntries,
        valueKind: "frame",
      },
    ],
  });

  // F5: TLB-hit
  const hitTlb = tlb.map((e) => ({
    ...e,
    state: e.vpn === a2Vpn ? ("hit" as const) : ("idle" as const),
  }));
  frames.push({
    step: "TLB-HIT",
    description: `Entry (VPN=${a2Vpn}, PFN=${a2Pfn}) ligger i TLB-en. Vi hopper over hele page-table-walken. ~1 cycle.`,
    bits: { value: a2Bits, ranges: ranges2, title: "VA #2" },
    tlb: hitTlb,
    tables: [
      {
        title: "Page table",
        subtitle: "ikke trengt — TLB traff",
        entries: tableEntries,
        valueKind: "frame",
      },
    ],
    result: { label: "TLB", value: "HIT — " + toHex(a2Pa, 4), tone: "success" },
    cost: { cycles: 1, label: "Direkte oversettelse" },
  });

  return {
    intro:
      "To sekvensielle aksesser til samme page demonstrerer hvorfor TLB-en er kritisk. Første aksess: kald cache → miss → walk → fyll TLB. Andre aksess: varm cache → hit. Forskjellen er to størrelsesordener i hastighet.",
    frames,
  };
}

// --------------------------------------------------------------------------
// Mode 4 — Page fault & demand paging med LRU
// --------------------------------------------------------------------------

interface FaultExample {
  /** Initiell fysisk RAM (4 frames). */
  frames: PhysicalFrame[];
  /** LRU-kø: eldst først, nyest sist. */
  lru: number[];
  /** Page-tabell før faulten. */
  table: { vpn: number; pfn?: number; valid: boolean; present: boolean }[];
  /** VPN-en som forårsaker faulten (present=0 men valid=1 → swap-in). */
  faultVpn: number;
  /** Hvor på disk den ligger. */
  swap: SwapEntry[];
}

const FAULT_EX: FaultExample = {
  frames: [
    { index: 0, page: { proc: "P0", vpn: 1 } },
    { index: 1, page: { proc: "P0", vpn: 5 } },
    { index: 2, page: { proc: "P0", vpn: 2 } },
    { index: 3, page: { proc: "P0", vpn: 7 } },
  ],
  lru: [1, 5, 2, 7], // VPN 1 = eldst → evictes først
  table: [
    { vpn: 1, pfn: 0, valid: true, present: true },
    { vpn: 2, pfn: 2, valid: true, present: true },
    { vpn: 3, valid: true, present: false }, // ← target
    { vpn: 5, pfn: 1, valid: true, present: true },
    { vpn: 7, pfn: 3, valid: true, present: true },
  ],
  faultVpn: 3,
  swap: [{ id: "P0/VPN=3" }],
};

function buildFaultTrace(ex: FaultExample): Trace {
  const frames: Frame[] = [];

  const renderTable = (rows: typeof ex.table, highlightVpn?: number): PageTableInfo => ({
    title: "Page table (P0)",
    subtitle: "VPN → PFN, valid, present",
    entries: rows.map((r) => ({
      index: r.vpn,
      frame: r.pfn,
      valid: r.valid,
      present: r.present,
      highlight: highlightVpn === r.vpn,
    })),
    valueKind: "frame",
  });

  // F0 — CPU prøver å lese VPN=3
  frames.push({
    step: "1. CPU aksess",
    description: `Prosess P0 prøver å lese fra en adresse som mapper til VPN = ${ex.faultVpn}. MMU slår opp i page-tabellen.`,
    tables: [renderTable(ex.table, ex.faultVpn)],
    frames: ex.frames.map((f) => ({ ...f })),
    swap: ex.swap.map((s) => ({ ...s })),
  });

  // F1 — present=0 → page fault trap
  frames.push({
    step: "2. PAGE FAULT",
    description: `PTE for VPN=${ex.faultVpn} har valid=1 men present=0 — siden er ikke i RAM. MMU triggerer en page fault → CPU hopper inn i kernel-trap-handleren.`,
    tables: [renderTable(ex.table, ex.faultVpn)],
    frames: ex.frames.map((f) => ({ ...f })),
    swap: ex.swap.map((s) => ({ ...s })),
    result: { label: "Fault", value: "MAJOR (på disk)", tone: "destructive" },
    cost: { cycles: 5_000_000, label: "~5 ms (disk-lesing kommer)" },
  });

  // F2 — OS velger offer via LRU
  const evictVpn = ex.lru[0];
  const evictFrameIdx = ex.frames.find((f) => f.page?.vpn === evictVpn)?.index ?? 0;
  frames.push({
    step: "3. Velg offer (LRU)",
    description: `RAM er full. OS-en sjekker LRU-køen og finner at VPN=${evictVpn} er den minst nylig brukte. Den evictes fra frame ${evictFrameIdx}.`,
    tables: [renderTable(ex.table, evictVpn)],
    frames: ex.frames.map((f) => ({
      ...f,
      evicted: f.page?.vpn === evictVpn,
      highlight: f.page?.vpn === evictVpn,
    })),
    swap: ex.swap.map((s) => ({ ...s })),
  });

  // F3 — write evicted page to swap (hvis dirty), update PTE for evicted VPN
  const updatedTable3 = ex.table.map((r) =>
    r.vpn === evictVpn ? { ...r, present: false, pfn: undefined } : r,
  );
  frames.push({
    step: "4. Skriv offer til swap",
    description: `Hvis evicted siden er dirty (skrevet til), skriv den til swap-disk. Frame ${evictFrameIdx} frigjøres. PTE for VPN=${evictVpn} oppdateres: present=0.`,
    tables: [renderTable(updatedTable3, evictVpn)],
    frames: ex.frames.map((f) => ({
      ...f,
      page: f.page?.vpn === evictVpn ? undefined : f.page,
      highlight: f.index === evictFrameIdx,
    })),
    swap: [...ex.swap, { id: `P0/VPN=${evictVpn}` }],
  });

  // F4 — read target page from swap into the now-free frame
  frames.push({
    step: "5. Les inn fra swap",
    description: `OS-en initierer disk-lesing av VPN=${ex.faultVpn} inn i frame ${evictFrameIdx}. Mens lesingen pågår blokkeres prosessen — andre prosesser får CPU-tid.`,
    tables: [renderTable(updatedTable3, ex.faultVpn)],
    frames: ex.frames.map((f) => ({
      ...f,
      page:
        f.index === evictFrameIdx
          ? { proc: "P0", vpn: ex.faultVpn }
          : f.page?.vpn === evictVpn
            ? undefined
            : f.page,
      highlight: f.index === evictFrameIdx,
    })),
    swap: [{ id: `P0/VPN=${ex.faultVpn}`, reading: true }, { id: `P0/VPN=${evictVpn}` }],
  });

  // F5 — update PTE, set present=1
  const updatedTable5 = updatedTable3.map((r) =>
    r.vpn === ex.faultVpn ? { ...r, present: true, pfn: evictFrameIdx } : r,
  );
  frames.push({
    step: "6. Oppdater PTE",
    description: `Lesingen er ferdig. PTE for VPN=${ex.faultVpn} oppdateres: present=1, PFN=${evictFrameIdx}. Den faulted instruksjonen restartes — denne gangen treffer den.`,
    tables: [renderTable(updatedTable5, ex.faultVpn)],
    frames: ex.frames.map((f) => ({
      ...f,
      page:
        f.index === evictFrameIdx
          ? { proc: "P0", vpn: ex.faultVpn }
          : f.page?.vpn === evictVpn
            ? undefined
            : f.page,
      highlight: f.index === evictFrameIdx,
    })),
    swap: [{ id: `P0/VPN=${evictVpn}` }],
    result: { label: "Status", value: "Mappet — retry", tone: "success" },
  });

  return {
    intro:
      "Page fault-syklusen: CPU treffer present=0 → trap → OS finner ledig (eller evicterer) frame → leser fra disk → oppdaterer PTE → restarter instruksjonen. Brukeren merker det ikke; bare at programmet er litt tregere.",
    frames,
  };
}

// --------------------------------------------------------------------------
// Bygg riktig trace
// --------------------------------------------------------------------------

function buildTrace(mode: Mode, exampleIdx: number): Trace {
  if (mode === "translate") return buildTranslateTrace(TRANSLATE_EXAMPLES[exampleIdx % 2]);
  if (mode === "multi-level") return buildMultiLevelTrace(makeMultiExample());
  if (mode === "tlb") return buildTlbTrace(TLB_EX);
  return buildFaultTrace(FAULT_EX);
}

// --------------------------------------------------------------------------
// Hovedkomponent
// --------------------------------------------------------------------------

export function VirtueltMinneVisualizer() {
  const [mode, setMode] = useState<Mode>("translate");
  const [exampleIdx, setExampleIdx] = useState(0);
  const trace = useMemo(() => buildTrace(mode, exampleIdx), [mode, exampleIdx]);
  const frames = trace.frames;
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1100);

  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [mode, exampleIdx]);

  useEffect(() => {
    if (!playing) return;
    if (step >= frames.length - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), speed);
    return () => window.clearTimeout(t);
  }, [playing, step, frames.length, speed]);

  const current: Frame = frames[step] ?? frames[0];

  return (
    <div
      className="rounded-2xl border border-border bg-card overflow-hidden"
      role="region"
      aria-label="Interaktiv visualisering: virtuelt minne"
    >
      {/* Topp-bar */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              Virtuelt minne — adresseoversettelse, TLB og page faults
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
        {/* Eksempel-toggle for translate-mode */}
        {mode === "translate" && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {TRANSLATE_EXAMPLES.map((ex, i) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => setExampleIdx(i)}
                className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                  exampleIdx === i
                    ? "bg-foreground text-background border-foreground"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                {ex.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Intro */}
      <div className="px-4 py-2.5 border-b border-border bg-muted/10 text-xs text-muted-foreground">
        {trace.intro}
      </div>

      {/* Hovedlayout: diagram */}
      <div className="p-4 bg-muted/5 border-b border-border">
        <FrameDiagram frame={current} mode={mode} />
      </div>

      {/* Beskrivelse */}
      <div className="px-4 py-3 border-b border-border bg-muted/20">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xs uppercase tracking-wider text-brand font-semibold">
            {current.step}
          </span>
        </div>
        <div className="text-sm text-foreground">{current.description}</div>
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
          <label className="text-xs text-muted-foreground" htmlFor="vmem-speed">
            tempo
          </label>
          <input
            id="vmem-speed"
            type="range"
            min={200}
            max={2000}
            step={100}
            value={2200 - speed}
            onChange={(e) => setSpeed(2200 - Number.parseInt(e.target.value, 10))}
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

function FrameDiagram({ frame, mode }: { frame: Frame; mode: Mode }) {
  return (
    <div className="space-y-4">
      {/* Bit-felt */}
      {frame.bits && <BitField bits={frame.bits} />}

      {/* Tabeller + ev. TLB / frames / swap */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Page tables */}
        {frame.tables && frame.tables.length > 0 && (
          <div className={`space-y-3 ${frame.tables.length > 1 ? "lg:col-span-2" : ""}`}>
            <div className={frame.tables.length > 1 ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : ""}>
              {frame.tables.map((t, i) => (
                <PageTableView key={i} info={t} />
              ))}
            </div>
          </div>
        )}

        {/* TLB-panel — tlb-mode */}
        {frame.tlb && <TLBView entries={frame.tlb} />}

        {/* Physical RAM + swap — fault-mode */}
        {frame.frames && <PhysicalRAMView frames={frame.frames} />}
        {frame.swap && <SwapView entries={frame.swap} />}
      </div>

      {/* Resultat / kost */}
      {(frame.result || frame.cost) && (
        <div className="flex flex-wrap gap-3">
          {frame.result && <ResultPill result={frame.result} />}
          {frame.cost && <CostPill cost={frame.cost} />}
        </div>
      )}

      {/* Mobil-hint for multi-level */}
      {mode === "multi-level" && (
        <div className="lg:hidden text-[10px] text-muted-foreground italic">
          Tabellene står over hverandre på smale skjermer.
        </div>
      )}
    </div>
  );
}

function BitField({ bits }: { bits: NonNullable<Frame["bits"]> }) {
  const width = 420;
  const cellW = width / bits.value.length;
  const cellH = 26;
  const labelH = 18;
  const totalH = labelH + cellH + 16;

  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
        {bits.title}
      </div>
      <div className="overflow-x-auto">
        <svg
          width={width}
          height={totalH}
          viewBox={`0 0 ${width} ${totalH}`}
          className="font-mono text-[10px] block"
        >
          {/* Field-labels */}
          {bits.ranges.map((r, i) => {
            const x = r.start * cellW;
            const w = (r.end - r.start + 1) * cellW;
            const color = colorClass(r.color);
            return (
              <g key={i}>
                <rect
                  x={x + 1}
                  y={0}
                  width={w - 2}
                  height={labelH - 4}
                  rx={3}
                  className={`${color.bg} ${color.border}`}
                  strokeWidth={1}
                />
                <text
                  x={x + w / 2}
                  y={labelH - 8}
                  textAnchor="middle"
                  className={`${color.text} font-semibold`}
                >
                  {r.label}
                </text>
              </g>
            );
          })}
          {/* Bit-cells */}
          {bits.value.split("").map((b, i) => {
            const x = i * cellW;
            const range = bits.ranges.find((r) => i >= r.start && i <= r.end);
            const color = colorClass(range?.color ?? "muted");
            return (
              <g key={i}>
                <rect
                  x={x + 0.5}
                  y={labelH}
                  width={cellW - 1}
                  height={cellH}
                  className={`${color.cellBg} ${color.border}`}
                  strokeWidth={0.8}
                />
                <text
                  x={x + cellW / 2}
                  y={labelH + cellH / 2 + 3.5}
                  textAnchor="middle"
                  className="fill-foreground font-semibold"
                >
                  {b}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function PageTableView({ info }: { info: PageTableInfo }) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-3 py-2 bg-muted/40 border-b border-border">
        <div className="text-xs font-semibold">{info.title}</div>
        {info.subtitle && (
          <div className="text-[10px] text-muted-foreground italic">{info.subtitle}</div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead className="text-[10px] uppercase text-muted-foreground bg-muted/20">
            <tr>
              <th className="text-left px-2 py-1 w-20">Indeks</th>
              <th className="text-left px-2 py-1">
                {info.valueKind === "frame" ? "PFN" : "Peker"}
              </th>
              <th className="text-left px-2 py-1 w-14">Valid</th>
              {info.entries.some((e) => e.present !== undefined) && (
                <th className="text-left px-2 py-1 w-16">Present</th>
              )}
            </tr>
          </thead>
          <tbody>
            {info.entries.map((e) => {
              const hl = e.highlight;
              return (
                <tr
                  key={e.index}
                  className={`border-t border-border transition-colors duration-300 ${
                    hl ? "bg-brand/20" : ""
                  } ${!e.valid ? "opacity-60" : ""}`}
                >
                  <td className="px-2 py-1 text-brand">{formatIndex(e.index)}</td>
                  <td className="px-2 py-1">
                    {info.valueKind === "frame"
                      ? e.frame !== undefined
                        ? toHex(e.frame, 2)
                        : "—"
                      : (e.pointerLabel ?? "—")}
                  </td>
                  <td className="px-2 py-1">
                    {e.valid ? (
                      <span className="text-success font-semibold">1</span>
                    ) : (
                      <span className="text-destructive font-semibold">0</span>
                    )}
                  </td>
                  {e.present !== undefined && (
                    <td className="px-2 py-1">
                      {e.present ? (
                        <span className="text-success font-semibold">1</span>
                      ) : (
                        <span className="text-warning font-semibold">0</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TLBView({ entries }: { entries: TLBEntry[] }) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-3 py-2 bg-muted/40 border-b border-border">
        <div className="text-xs font-semibold">TLB ({entries.length} entries)</div>
        <div className="text-[10px] text-muted-foreground italic">
          Hardware-cache i MMU-en. Hit = ~1 cycle, miss = page-table walk.
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead className="text-[10px] uppercase text-muted-foreground bg-muted/20">
            <tr>
              <th className="text-left px-2 py-1 w-20">VPN</th>
              <th className="text-left px-2 py-1 w-20">PFN</th>
              <th className="text-left px-2 py-1">Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => {
              const cls =
                e.state === "hit" ? "bg-success/20" : e.state === "filled" ? "bg-warning/20" : "";
              const label =
                e.state === "hit" ? "← HIT" : e.state === "filled" ? "← nettopp fylt" : "";
              return (
                <tr
                  key={i}
                  className={`border-t border-border transition-colors duration-300 ${cls}`}
                >
                  <td className="px-2 py-1 text-brand">{e.vpn}</td>
                  <td className="px-2 py-1">{toHex(e.pfn, 2)}</td>
                  <td className="px-2 py-1 text-[10px] text-muted-foreground italic">{label}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PhysicalRAMView({ frames }: { frames: PhysicalFrame[] }) {
  const width = 360;
  const cellW = 84;
  const cellH = 56;
  const padX = 12;
  const padY = 24;
  const totalW = padX * 2 + frames.length * cellW;
  const totalH = padY + cellH + 12;
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-3 py-2 bg-muted/40 border-b border-border">
        <div className="text-xs font-semibold">Fysisk RAM (4 frames)</div>
        <div className="text-[10px] text-muted-foreground italic">
          Hver frame har samme størrelse som en page (4 KB).
        </div>
      </div>
      <div className="p-2 overflow-x-auto">
        <svg
          width={Math.max(totalW, width)}
          height={totalH}
          viewBox={`0 0 ${Math.max(totalW, width)} ${totalH}`}
          className="font-mono text-[10px] block"
        >
          <defs>
            <pattern
              id="evict-hatch"
              patternUnits="userSpaceOnUse"
              width="6"
              height="6"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="6"
                stroke="currentColor"
                strokeWidth="1.2"
                className="text-destructive/40"
              />
            </pattern>
          </defs>
          {frames.map((f, i) => {
            const x = padX + i * cellW;
            const hl = f.highlight;
            const ev = f.evicted;
            const empty = !f.page;
            const bgClass = ev
              ? "fill-destructive/10 stroke-destructive/50"
              : empty
                ? "fill-muted/50 stroke-border"
                : hl
                  ? "fill-brand/25 stroke-brand"
                  : "fill-success/15 stroke-success/40";
            return (
              <g key={i}>
                <text
                  x={x + cellW / 2}
                  y={padY - 8}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                >
                  frame {f.index}
                </text>
                <rect
                  x={x + 1}
                  y={padY}
                  width={cellW - 2}
                  height={cellH}
                  rx={4}
                  className={bgClass}
                  strokeWidth={hl ? 1.6 : 1}
                />
                {ev && (
                  <rect
                    x={x + 1}
                    y={padY}
                    width={cellW - 2}
                    height={cellH}
                    rx={4}
                    fill="url(#evict-hatch)"
                  />
                )}
                {f.page ? (
                  <>
                    <text
                      x={x + cellW / 2}
                      y={padY + cellH / 2 - 4}
                      textAnchor="middle"
                      className="fill-foreground font-semibold"
                    >
                      {f.page.proc}
                    </text>
                    <text
                      x={x + cellW / 2}
                      y={padY + cellH / 2 + 12}
                      textAnchor="middle"
                      className="fill-muted-foreground"
                    >
                      VPN = {f.page.vpn}
                    </text>
                  </>
                ) : (
                  <text
                    x={x + cellW / 2}
                    y={padY + cellH / 2 + 4}
                    textAnchor="middle"
                    className="fill-muted-foreground italic"
                  >
                    (ledig)
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function SwapView({ entries }: { entries: SwapEntry[] }) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-3 py-2 bg-muted/40 border-b border-border">
        <div className="text-xs font-semibold">Swap-disk</div>
        <div className="text-[10px] text-muted-foreground italic">
          Sider lagret på SSD/HDD. Lese-tid: ~5 ms (~10⁶× tregere enn RAM).
        </div>
      </div>
      <div className="p-3 flex flex-wrap gap-2">
        {entries.length === 0 ? (
          <span className="text-xs text-muted-foreground italic">(tom)</span>
        ) : (
          entries.map((e, i) => (
            <div
              key={i}
              className={`px-2 py-1 rounded border text-xs font-mono inline-flex items-center gap-1.5 transition-colors duration-300 ${
                e.reading
                  ? "bg-warning/20 border-warning text-warning-foreground"
                  : "bg-muted/40 border-border"
              }`}
            >
              <DiskIcon active={e.reading} />
              <span>{e.id}</span>
              {e.reading && <span className="text-[10px] italic">leser…</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function DiskIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      className={active ? "text-warning-foreground animate-pulse" : "text-muted-foreground"}
    >
      <ellipse cx="8" cy="3.5" rx="6" ry="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 3.5v9c0 1.1 2.7 2 6 2s6-.9 6-2v-9" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 8c0 1.1 2.7 2 6 2s6-.9 6-2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function ResultPill({ result }: { result: NonNullable<Frame["result"]> }) {
  const cls =
    result.tone === "success"
      ? "bg-success/15 border-success text-success"
      : result.tone === "warning"
        ? "bg-warning/15 border-warning text-warning"
        : result.tone === "destructive"
          ? "bg-destructive/15 border-destructive text-destructive"
          : "bg-brand/15 border-brand text-brand";
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono ${cls}`}
    >
      <span className="text-[10px] uppercase tracking-wider opacity-80">{result.label}</span>
      <span className="font-semibold text-sm">{result.value}</span>
    </div>
  );
}

function CostPill({ cost }: { cost: NonNullable<Frame["cost"]> }) {
  const formatted =
    cost.cycles >= 1_000_000
      ? `~${(cost.cycles / 1_000_000).toFixed(0)} M cycles`
      : cost.cycles >= 1000
        ? `~${(cost.cycles / 1000).toFixed(0)} k cycles`
        : `${cost.cycles} cycle${cost.cycles === 1 ? "" : "s"}`;
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/30 text-xs">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Kost</span>
      <span className="font-mono font-semibold text-foreground">{formatted}</span>
      <span className="text-muted-foreground italic">— {cost.label}</span>
    </div>
  );
}

// --------------------------------------------------------------------------
// Farge-tokens
// --------------------------------------------------------------------------

function colorClass(c: BitRange["color"]) {
  switch (c) {
    case "brand":
      return {
        bg: "fill-brand/30 stroke-brand/60",
        cellBg: "fill-brand/10 stroke-brand/40",
        text: "fill-brand",
        border: "stroke-brand/60",
      };
    case "success":
      return {
        bg: "fill-success/30 stroke-success/60",
        cellBg: "fill-success/10 stroke-success/40",
        text: "fill-success-foreground",
        border: "stroke-success/60",
      };
    case "warning":
      return {
        bg: "fill-warning/30 stroke-warning/60",
        cellBg: "fill-warning/10 stroke-warning/40",
        text: "fill-warning-foreground",
        border: "stroke-warning/60",
      };
    default:
      return {
        bg: "fill-muted/40 stroke-border",
        cellBg: "fill-muted/20 stroke-border",
        text: "fill-muted-foreground",
        border: "stroke-border",
      };
  }
}

function formatIndex(idx: number): string {
  // Vis kort tall (translate, tlb) eller hex (multi-level som har 12-bit indekser)
  if (idx >= 0x10) return toHex(idx, idx >= 0x100 ? 3 : 2);
  return String(idx);
}
