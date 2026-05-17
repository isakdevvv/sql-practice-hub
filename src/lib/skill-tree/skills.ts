// PLACEHOLDER — another agent owns this file and will populate the actual
// skill graph. This stub exists only so `engine.ts` can typecheck and
// `bun --bun vite build` succeeds while both branches are in flight. When the
// real graph lands the merge should keep that side's contents (their data,
// our types here are intentionally minimal and compatible).
//
// IMPORTANT for the merge: the engine relies on the shape of `Skill` below
// (id + prereqs + evidens.{sqlProblemIds,pyExerciseIds,dragExerciseIds,
// flashcardIds,joinExerciseIds}). The other agent's definition must keep
// those field names — anything richer (titles, icons, descriptions, levels)
// can be added freely.

export type SkillId = string;

export interface SkillEvidence {
  sqlProblemIds?: string[];
  pyExerciseIds?: string[];
  dragExerciseIds?: string[];
  flashcardIds?: string[];
  joinExerciseIds?: string[];
}

export interface Skill {
  id: SkillId;
  /** Skill ids that must be "kan" or "mester" before this one unlocks. */
  prereqs: SkillId[];
  /** Concrete pieces of evidence the engine grades attempts against. */
  evidens: SkillEvidence;
  /** Optional human-readable label — engine doesn't read it. */
  title?: string;
}

/** Empty placeholder. Real list comes from the skill-graph agent's branch. */
export const SKILLS: Skill[] = [];
