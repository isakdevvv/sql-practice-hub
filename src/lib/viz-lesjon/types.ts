// Typer for viz-lesjon-systemet (stegvis kode-visualisering). Hver lesjon består av en sekvens
// `Section`-er. Den viktigste er `example` — der eleven ser kode
// kjøre stegvis side-om-side med en visualisering av minnet og
// (for iterator-eksempler) en eksplisitt cursor over iterablen.

export type PrimitiveVal =
  | { kind: "int"; value: number }
  | { kind: "str"; value: string }
  | { kind: "bool"; value: boolean }
  | { kind: "none" }
  | { kind: "ref"; label: string; refId: string };

export type FrameVar = { name: string; value: PrimitiveVal };

export type HeapBlock =
  | {
      kind: "iterable";
      refId: string;
      label: string; // e.g. "list", "Telleren"
      items: PrimitiveVal[];
      // Hvis dette er en iterator over en iterable, peker den hit.
      // Brukes for å tegne pil/cursor.
    }
  | {
      kind: "iterator";
      refId: string;
      label: string; // e.g. "list_iterator", "TelleIter"
      // Hvilken iterable den itererer over (refId), eller intern liste.
      overRefId?: string;
      // Hvor cursoren står: 0 = ikke startet / peker på første,
      // n = peker på element n, "done" = oppbrukt.
      cursor: number | "done";
      // Egne attributter (f.eks. self._i for hånd-skrevet iterator).
      attrs?: { name: string; value: PrimitiveVal }[];
    }
  | {
      kind: "generator";
      refId: string;
      label: string;
      // Hvilken linje generatoren er "pauset" på (for yield-eksempelet).
      pausedAt?: number;
      attrs?: { name: string; value: PrimitiveVal }[];
      // Hva som er produsert så langt.
      yielded: PrimitiveVal[];
    };

export type LogEntry = {
  kind: "call" | "return" | "raise" | "print";
  text: string; // f.eks. "next(it) → 20" eller "StopIteration"
};

/** Ett øyeblikks-snapshot av kjøringen. */
export interface IterStep {
  /** 1-indeksert linje som akkurat ble kjørt. */
  line: number;
  /** Kort forklaring vist over visualiseringen. */
  narration: string;
  /** Lokale variabler i gjeldende scope. */
  vars: FrameVar[];
  /** Heap-objekter (iterable / iterator / generator). */
  heap: HeapBlock[];
  /** Loggføring (next-kall, StopIteration, print osv.) — akkumulert. */
  log: LogEntry[];
  /**
   * Highlight-modus for iterator-visualiseringen:
   * - "cursor" viser pil/strikethrough på iterablens elementer (default).
   * - "none" skjuler cursor (for eksempler uten iterator).
   */
  highlight?: "cursor" | "none";
}

export interface Example {
  /** Tittel over kodeblokken. */
  title: string;
  /** Kort prosa over kodeblokken. */
  intro?: string;
  /** Kildekoden — vises eksakt som-er, med linjenumre. */
  code: string;
  /** Sekvensen av snapshots. Spilles autoplay i "lær"-modus. */
  steps: IterStep[];
  /** Hvilken visualisering som passer best. */
  viz: "iterator" | "frames";
  /** Valgfri "etterord" vist etter siste steg. */
  outro?: string;
}

export type Section =
  | { kind: "prose"; html: string }
  | { kind: "example"; example: Example }
  | { kind: "checkpoint"; question: string; options: string[]; correctIdx: number; explanation: string };

export interface Lesson {
  slug: string;
  title: string;
  blurb: string;
  // For listingssiden:
  estMinutes: number;
  sections: Section[];
}
