/**
 * Re-export for graf-utils.
 *
 * NB: I dag re-eksporterer denne filen fra `_stubs.ts`. Når graph-agenten
 * leverer ekte algoritmer, erstatt med deres implementasjoner og slett
 * `_stubs.ts`.
 */
import {
  stubGetPrereqs,
  stubGetDependents,
  stubTopologicalSort,
  type Skill,
  type SkillId,
} from "./_stubs";
import { SKILLS } from "./skills";

export function getPrereqs(id: SkillId, skills: Skill[] = SKILLS): SkillId[] {
  return stubGetPrereqs(skills, id);
}

export function getDependents(id: SkillId, skills: Skill[] = SKILLS): SkillId[] {
  return stubGetDependents(skills, id);
}

export function topologicalSort(skills: Skill[] = SKILLS): SkillId[] {
  return stubTopologicalSort(skills);
}
