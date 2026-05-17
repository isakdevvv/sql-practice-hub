/**
 * Re-export for skill-engine.
 *
 * NB: I dag bruker dette stub-implementasjonene fra `_stubs.ts`. Når engine-
 * agenten leverer ekte IRT-engine, erstatt med deres implementasjoner og
 * slett `_stubs.ts`.
 */
export type { Mastery, SkillEstimate } from "./_stubs";
import {
  stubEstimateAllSkills,
  stubGetMastery,
  stubGetNextUnlocked,
  type SkillEstimate,
  type Mastery,
  type SkillId,
} from "./_stubs";
import type { Skill } from "./_stubs";

export function estimateAllSkills(skills: Skill[]): Map<SkillId, SkillEstimate> {
  return stubEstimateAllSkills(skills);
}

export function getMastery(est: SkillEstimate | undefined): Mastery {
  return stubGetMastery(est);
}

export function getNextUnlocked(
  skills: Skill[],
  estimates: Map<SkillId, SkillEstimate>,
): SkillId[] {
  return stubGetNextUnlocked(skills, estimates);
}
