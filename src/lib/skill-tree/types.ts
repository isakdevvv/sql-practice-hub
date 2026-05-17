/**
 * Skill-tree datamodell — fase 1 av et ferdighets-tre (knowledge graph)
 * for SQL Practice Hub. Konsumeres av IRT-engine, visualisering og recommender.
 *
 * Hver Skill er et atomisk konsept (~20 min – 2 t å lære). Prereqs uttrykker
 * direkte forutsetninger — den transitive lukningen beregnes i graph.ts.
 *
 * Evidens-feltet peker på FAKTISKE id-er fra eksisterende oppgavebanker,
 * slik at engine/recommender kan vise "her er konkrete oppgaver som trener
 * denne ferdigheten".
 */

export type SkillId = string;

export type FagOmrade =
  | "math"
  | "programming"
  | "data-structures"
  | "os"
  | "networks"
  | "databases"
  | "web"
  | "ml-classical"
  | "ml-deep"
  | "security"
  | "engineering-practice";

/**
 * Bloom's taxonomy revidert (Anderson & Krathwohl 2001).
 * Indikerer hvilket kognitivt nivå atomet trener — ikke vanskelighet.
 */
export type BloomNivaa =
  | "remember"
  | "understand"
  | "apply"
  | "analyze"
  | "evaluate"
  | "create";

export interface SkillEvidens {
  /** Matcher PY_EXERCISES.id i src/lib/python/exercises*.ts */
  pyExerciseIds?: string[];
  /** Matcher PROBLEMS.id i src/lib/problems/data.ts */
  sqlProblemIds?: string[];
  /** Matcher dragExercises.id i src/lib/learn/dragExercises.ts */
  dragExerciseIds?: string[];
  /** Matcher flashcards.id i src/lib/learn/flashcards.ts */
  flashcardIds?: string[];
  /** Matcher stack content slug i src/lib/stack/content/<slug>.tsx */
  stackSlugs?: string[];
}

export interface Skill {
  id: SkillId;
  /** Norsk navn — e.g. "Rekursjon" */
  navn: string;
  /** 1-setnings forklaring */
  blurb: string;
  omrade: FagOmrade;
  /** Hvilket dybde-nivå dette atomet trener */
  bloom: BloomNivaa;
  /** Direkte forutsetninger — id-er må finnes i SKILLS */
  prereqs: SkillId[];
  /** Hvilke faktiske oppgaver/innhold treffer dette? */
  evidens: SkillEvidens;
  /** Menneskelig estimat: "20 min", "1-2 t" */
  estimertTid: string;
}
