// Stub-engine for ferdighets-treet. Den ekte versjonen leveres av en annen
// agent og bruker FSRS-data, problem-historikk og diagnose-pretest for å
// estimere mastery + confidence. Denne stubben gir trygge default-verdier
// så `recommender.ts` og UI kan kompilere og kjøre uten den.

import { SKILLS, type Skill } from "./skills";

/** Mastery i [0, 1]. 1 = fullt mestret. */
export type Mastery = number;

export interface SkillEstimate {
  skillId: string;
  mastery: Mastery;
  /** Hvor sikre vi er på mastery-estimatet, i [0, 1]. */
  confidence: number;
  /** True hvis alle prereqs er bestått (mastery > MASTERY_PASS). */
  unlocked: boolean;
}

const MASTERY_PASS = 0.7;
const DIAGNOSE_FLAG_KEY = "skill-tree.diagnose.completed";

/**
 * Returnerer et estimat per skill. Stub-versjonen returnerer 0 mastery på
 * alt med lav confidence — det får anbefalings-systemet til å foreslå
 * diagnose-pretest først, som er ønsket atferd inntil ekte data finnes.
 */
export function estimateAllSkills(): SkillEstimate[] {
  return SKILLS.map((s) => ({
    skillId: s.id,
    mastery: 0,
    confidence: 0,
    unlocked: s.prereqs.length === 0,
  }));
}

/** Returner mastery for én skill (0 hvis ukjent). */
export function getMastery(skillId: string): Mastery {
  const est = estimateAllSkills().find((e) => e.skillId === skillId);
  return est?.mastery ?? 0;
}

/**
 * Skills som er låst opp (alle prereqs bestått) men ikke selv bestått.
 * Sortert etter hvor "nær" brukeren er — flest beståtte prereqs først.
 */
export function getNextUnlocked(): Skill[] {
  const estimates = new Map(estimateAllSkills().map((e) => [e.skillId, e]));
  const out: Skill[] = [];
  for (const s of SKILLS) {
    const est = estimates.get(s.id);
    if (!est) continue;
    if (est.mastery >= MASTERY_PASS) continue;
    const prereqsPassed = s.prereqs.every(
      (p) => (estimates.get(p)?.mastery ?? 0) >= MASTERY_PASS,
    );
    if (!prereqsPassed) continue;
    out.push(s);
  }
  return out;
}

/**
 * Skills som var bestått, men har "rustet" — mastery synker over tid.
 * Stub returnerer tom liste til ekte FSRS-integrasjon finnes.
 */
export function getRustyConcepts(): Skill[] {
  return [];
}

/** Har brukeren tatt diagnose-pretesten? Sjekker localStorage-flagg. */
export function hasCompletedDiagnose(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DIAGNOSE_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

/** Marker diagnose som ferdig (brukes av diagnose-siden når den finnes). */
export function markDiagnoseCompleted(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DIAGNOSE_FLAG_KEY, "1");
  } catch {
    // ignore
  }
}
