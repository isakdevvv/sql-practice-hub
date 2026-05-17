/**
 * Skill-tree — fase 1 av knowledge graph for SQL Practice Hub.
 *
 * Eksporterer datamodell (types), data (skills) og grafalgoritmer (graph).
 * Andre agenter (IRT-engine, visualisering, recommender) konsumerer disse.
 */

export type {
  SkillId,
  FagOmrade,
  BloomNivaa,
  SkillEvidens,
  Skill,
} from "./types";

export { SKILLS, SKILL_BY_ID } from "./skills";

export {
  getSkill,
  getAllSkills,
  getPrereqs,
  getDependents,
  topologicalSort,
  findLeaves,
  validateGraph,
  countByOmrade,
} from "./graph";
