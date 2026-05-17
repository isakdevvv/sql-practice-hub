/**
 * Re-export for skill-data.
 *
 * NB: I dag re-eksporterer denne filen fra `_stubs.ts`. Når data-agenten
 * leverer den ekte `SKILLS`-listen (150 skills), erstatt innholdet i denne
 * filen med selve datasettet og slett `_stubs.ts`.
 */
export type {
  Skill,
  SkillId,
  SkillEvidens,
  FagOmrade,
  BloomNivaa,
} from "./_stubs";
import { STUB_SKILLS } from "./_stubs";
import type { Skill } from "./_stubs";

export const SKILLS: Skill[] = STUB_SKILLS;
