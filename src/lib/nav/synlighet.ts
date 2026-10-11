// ---------------------------------------------------------------------------
// nav/synlighet.ts — hva som vises i Lær, Øv og søket.
//
// Høsten 2026 gjelder fire eksamensfag. Alt annet innhold er SKJULT, ikke
// slettet: rutene og dataene ligger urørt, de er bare filtrert bort fra
// inngangene og søket. Bryteren «vis alt» (lagret i nettleseren) slår
// filteret av igjen, og hele ordningen fjernes ved å la `erSynligFag`
// returnere true.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useState } from "react";
import type { PyCategoryId } from "@/lib/python/types";
import { EXAM_SEASON_SLUGS } from "@/lib/subjects/catalog";

const NOKKEL = "vis-alt-innhold-v1";

/** Les bryteren direkte. Alltid false på server. */
export function visAlt(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(NOKKEL) === "1";
  } catch {
    return false;
  }
}

/** Fag uten slug (tverrgående innhold) regnes som ikke-eksamensfag. */
export function erSynligFag(fagSlug: string | undefined, alt: boolean): boolean {
  return alt || (!!fagSlug && EXAM_SEASON_SLUGS.includes(fagSlug));
}

/** Bryteren som React-tilstand. Leses etter mount, så server og klient
 *  rendrer det samme (skjulte) utgangspunktet først. */
export function useVisAlt(): [boolean, (v: boolean) => void] {
  const [alt, setAlt] = useState(false);
  useEffect(() => setAlt(visAlt()), []);
  const sett = useCallback((v: boolean) => {
    try {
      if (v) window.localStorage.setItem(NOKKEL, "1");
      else window.localStorage.removeItem(NOKKEL);
    } catch {
      // Uten lagring gjelder valget bare til siden lastes på nytt.
    }
    setAlt(v);
  }, []);
  return [alt, sett];
}

/** Python-kategori → fag. Ligger her (og ikke i nav/ov.ts) fordi søket også
 *  trenger den, og søket skal ikke dra med seg drag-oppgavene i headeren. */
export const PY_FAG: Partial<Record<PyCategoryId, string>> = {
  dte2507: "dte-2507",
  kurose: "dte-2507",
  dte2602: "dte-2602",
  "dte2501-ml": "dte-2501",
  "dte2505-os": "dte-2505",
  "stat-other": "tek-1501",
  web: "dte-2509",
  "db-data": "dte-2509",
  "api-sec": "dte-2509",
};
