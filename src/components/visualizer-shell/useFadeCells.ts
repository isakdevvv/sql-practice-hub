import { useCallback, useRef, useState } from "react";
import type { NodePhase } from "./NodeBox";

// --------------------------------------------------------------------------
// useFadeCells: håndterer fade-in/fade-out-mønsteret som finnes i
// LinkedStructuresVisualizer og lignende.
//   - addCell(v, position) → settes inn med phase="new". 350 ms senere
//     fjernes phase-flagget, så den settler i normal-stil.
//   - removeCell(id) → setter phase="leaving", så fjerner cellen etter 320 ms.
//   - replaceAll(values) → bytter ut hele celle-listen (brukes ved
//     modus-bytte eller reset). Ingen animasjon.
// Hver celle får unik id (auto-incremented), brukt som React-key.
// --------------------------------------------------------------------------

export interface FadeCell<T> {
  id: number;
  value: T;
  phase?: NodePhase;
}

export interface UseFadeCellsOptions {
  /** ms før "new"-flagget fjernes. Default 350. */
  newSettleMs?: number;
  /** ms før "leaving"-celle faktisk fjernes. Default 320. */
  leavingMs?: number;
}

export interface UseFadeCells<T> {
  cells: FadeCell<T>[];
  /** Sett inn med fade-in. position="end" (default) eller "start". */
  addCell: (value: T, position?: "start" | "end") => void;
  /** Marker cellen som leaving og fjern etter delay. */
  removeCell: (id: number) => void;
  /** Erstatt hele listen uten animasjon (brukes ved mode-switch / reset). */
  replaceAll: (values: T[]) => void;
  /** Direkte oppdatering for spesialtilfeller (heap re-shuffle, sortering). */
  setCells: React.Dispatch<React.SetStateAction<FadeCell<T>[]>>;
  /** Internal id-counter. Eksponert i tilfelle en visualizer vil unngå kollisjon. */
  makeId: () => number;
}

export function useFadeCells<T>(
  initial: T[] = [],
  opts: UseFadeCellsOptions = {},
): UseFadeCells<T> {
  const { newSettleMs = 350, leavingMs = 320 } = opts;
  const idRef = useRef(0);
  const makeId = useCallback(() => ++idRef.current, []);

  const [cells, setCells] = useState<FadeCell<T>[]>(() =>
    initial.map((v) => ({ id: ++idRef.current, value: v })),
  );

  const addCell = useCallback(
    (value: T, position: "start" | "end" = "end") => {
      const id = ++idRef.current;
      const newCell: FadeCell<T> = { id, value, phase: "new" };
      setCells((cur) =>
        position === "start" ? [newCell, ...cur] : [...cur, newCell],
      );
      window.setTimeout(() => {
        setCells((cur) =>
          cur.map((c) => (c.id === id ? { ...c, phase: undefined } : c)),
        );
      }, newSettleMs);
    },
    [newSettleMs],
  );

  const removeCell = useCallback(
    (id: number) => {
      setCells((cur) =>
        cur.map((c) => (c.id === id ? { ...c, phase: "leaving" } : c)),
      );
      window.setTimeout(() => {
        setCells((cur) => cur.filter((c) => c.id !== id));
      }, leavingMs);
    },
    [leavingMs],
  );

  const replaceAll = useCallback((values: T[]) => {
    setCells(values.map((v) => ({ id: ++idRef.current, value: v })));
  }, []);

  return { cells, addCell, removeCell, replaceAll, setCells, makeId };
}
