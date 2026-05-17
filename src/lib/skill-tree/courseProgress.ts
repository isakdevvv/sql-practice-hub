/**
 * Course progress — beregner % mestret per fag-område slik at home og
 * skill-tre-filter kan vise "hvor langt er jeg" per spor.
 *
 * "Mestret" = mastery `kan` eller `mester`. "Påbegynt" = `lærer`. Resten er
 * ukjent. % regnes som mestret / total i området.
 */

import { SKILLS, type FagOmrade, type SkillId } from "./skills";
import { getMastery, type Mastery } from "./engine";

export interface OmradeProgress {
  omrade: FagOmrade;
  total: number;
  mestret: number;
  paabegynt: number;
  ukjent: number;
  /** 0..100 */
  percent: number;
  /** Første skill (i SKILLS-rekkefølge) som ikke er "kan" eller "mester". */
  nesteSkillId: SkillId | null;
}

export function computeOmradeProgress(): Map<FagOmrade, OmradeProgress> {
  const byOmrade = new Map<FagOmrade, OmradeProgress>();
  for (const s of SKILLS) {
    const omrade = s.omrade as FagOmrade;
    let row = byOmrade.get(omrade);
    if (!row) {
      row = {
        omrade,
        total: 0,
        mestret: 0,
        paabegynt: 0,
        ukjent: 0,
        percent: 0,
        nesteSkillId: null,
      };
      byOmrade.set(omrade, row);
    }
    row.total += 1;
    const m: Mastery = getMastery(s.id);
    if (m === "kan" || m === "mester") {
      row.mestret += 1;
    } else if (m === "lærer") {
      row.paabegynt += 1;
      if (!row.nesteSkillId) row.nesteSkillId = s.id;
    } else {
      row.ukjent += 1;
      if (!row.nesteSkillId) row.nesteSkillId = s.id;
    }
  }
  for (const row of byOmrade.values()) {
    row.percent = row.total === 0 ? 0 : Math.round((row.mestret / row.total) * 100);
  }
  return byOmrade;
}
