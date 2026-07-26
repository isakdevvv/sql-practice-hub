// ---------------------------------------------------------------------------
// core/due.ts — samlet due-kø på tvers av alle øvingsmoduler.
//
// Bygger på PRACTICE_MODULES-registeret: itererer modulenes FSRS-stores og
// resolver hvert due-item til tittel + deep-link + fag. Erstatter den
// hardkodede innsamlingen som tidligere lå i routes/repetisjon.tsx, og gir
// fag-sidene billige due-tall per emne.
// ---------------------------------------------------------------------------

import { PRACTICE_MODULES, type PracticeItemRef, type PracticeModule } from "./registry";

export interface DueEntry {
  module: PracticeModule;
  item: PracticeItemRef;
  /** FSRS due-tidspunkt (epoch ms). */
  due: number;
}

/**
 * Alle items som er due nå eller tidligere, på tvers av modulene, sortert
 * eldste først. `subjectSlug` filtrerer på fag; items uten avledet fag
 * regnes som tverrgående og tas med kun i det ufiltrerte resultatet.
 */
export function collectDue(now: number = Date.now(), subjectSlug?: string): DueEntry[] {
  const out: DueEntry[] = [];
  for (const module of PRACTICE_MODULES) {
    for (const s of Object.values(module.fsrs.getAllStates())) {
      if (s.state === "new" || s.due > now) continue;
      const item = module.resolve(s.id);
      if (subjectSlug && item.subjectSlug !== subjectSlug) continue;
      out.push({ module, item, due: s.due });
    }
  }
  out.sort((a, b) => a.due - b.due);
  return out;
}

/** Antall due per modul-id, pluss totalen. */
export function dueCounts(
  now: number = Date.now(),
  subjectSlug?: string,
): { byModule: Record<string, number>; total: number } {
  const byModule: Record<string, number> = {};
  for (const m of PRACTICE_MODULES) byModule[m.id] = 0;
  let total = 0;
  for (const entry of collectDue(now, subjectSlug)) {
    byModule[entry.module.id] += 1;
    total += 1;
  }
  return { byModule, total };
}

/** Fag-slugs som faktisk har due-items akkurat nå — driver filter-chips. */
export function subjectsWithDue(now: number = Date.now()): string[] {
  const seen = new Set<string>();
  for (const entry of collectDue(now)) {
    if (entry.item.subjectSlug) seen.add(entry.item.subjectSlug);
  }
  return [...seen];
}
