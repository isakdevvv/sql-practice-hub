/**
 * "Mine kurs" — hvilke fag-områder brukeren har valgt å fokusere på.
 *
 * `null` = ingen plan satt (vis alle). `[]` = brukeren har eksplisitt valgt
 * tom liste (vi viser likevel alle som fallback for å unngå tom hjemmeside).
 * Lagres i localStorage.
 */

import { useEffect, useState } from "react";
import type { FagOmrade } from "./skills";

const KEY = "mine-kurs-v1";

export function loadMineKurs(): FagOmrade[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((x): x is FagOmrade => typeof x === "string");
  } catch {
    return null;
  }
}

export function saveMineKurs(omrader: FagOmrade[] | null): void {
  if (typeof window === "undefined") return;
  try {
    if (omrader === null) {
      window.localStorage.removeItem(KEY);
    } else {
      window.localStorage.setItem(KEY, JSON.stringify(omrader));
    }
    window.dispatchEvent(new Event("mine-kurs-changed"));
  } catch {
    // localStorage kan være blokkert (Safari private), ignorer
  }
}

export function useMineKurs(): {
  selected: FagOmrade[] | null;
  setSelected: (next: FagOmrade[] | null) => void;
} {
  const [selected, setLocal] = useState<FagOmrade[] | null>(() => loadMineKurs());

  useEffect(() => {
    const onChange = () => setLocal(loadMineKurs());
    window.addEventListener("mine-kurs-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("mine-kurs-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const setSelected = (next: FagOmrade[] | null) => {
    saveMineKurs(next);
    setLocal(next);
  };
  return { selected, setSelected };
}
