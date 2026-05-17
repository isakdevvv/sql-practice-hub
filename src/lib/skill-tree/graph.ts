/**
 * Graph-utilities over SKILLS.
 *
 * Designet for å brukes av:
 *   - IRT-engine (sjekke om bruker har låst opp prereqs)
 *   - visualisering (topologisk layout)
 *   - recommender (findLeaves gir neste-anbefalte ferdigheter)
 *
 * Alle funksjoner er rene og kaster ikke ved normal bruk — unntak er
 * `validateGraph()` som bevisst kaster ved sykluser/dangling prereqs.
 */

import { SKILLS, SKILL_BY_ID } from "./skills";
import type { Skill, SkillId } from "./types";

/** Hent skill ved id. Kaster hvis id ikke finnes. */
export function getSkill(id: SkillId): Skill {
  const skill = SKILL_BY_ID.get(id);
  if (!skill) {
    throw new Error(`Skill not found: ${id}`);
  }
  return skill;
}

/** Hent alle skills (kopi av array). */
export function getAllSkills(): readonly Skill[] {
  return SKILLS;
}

/**
 * Hent direkte (eller transitive) prereqs for en skill.
 * @param transitive false → bare direkte prereqs; true → hele forfedre-mengden.
 *                   Resultatet inkluderer ikke skillen selv.
 */
export function getPrereqs(id: SkillId, transitive = false): SkillId[] {
  const skill = getSkill(id);
  if (!transitive) return [...skill.prereqs];

  const visited = new Set<SkillId>();
  const stack = [...skill.prereqs];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    if (visited.has(cur)) continue;
    visited.add(cur);
    const node = SKILL_BY_ID.get(cur);
    if (node) stack.push(...node.prereqs);
  }
  return [...visited];
}

/**
 * Hent skills som har `id` som direkte prereq.
 * (Den motsatte retningen av getPrereqs.)
 */
export function getDependents(id: SkillId): SkillId[] {
  // Sjekker først at id eksisterer:
  getSkill(id);
  return SKILLS.filter((s) => s.prereqs.includes(id)).map((s) => s.id);
}

/**
 * Topologisk sortering (Kahn). Kaster hvis grafen har en syklus.
 * Returnerer alle skill-id-er slik at alle prereqs til en skill kommer før den selv.
 */
export function topologicalSort(): SkillId[] {
  const inDegree = new Map<SkillId, number>();
  const adj = new Map<SkillId, SkillId[]>();

  for (const s of SKILLS) {
    inDegree.set(s.id, 0);
    adj.set(s.id, []);
  }
  for (const s of SKILLS) {
    for (const p of s.prereqs) {
      // p → s (p må læres før s)
      if (!adj.has(p)) {
        throw new Error(`topologicalSort: ukjent prereq "${p}" referert av "${s.id}"`);
      }
      adj.get(p)!.push(s.id);
      inDegree.set(s.id, (inDegree.get(s.id) ?? 0) + 1);
    }
  }

  // Stabil ordning: start med id-er i alfabetisk rekkefølge så output blir deterministisk.
  const queue: SkillId[] = [];
  const ids = [...inDegree.keys()].sort();
  for (const id of ids) {
    if (inDegree.get(id) === 0) queue.push(id);
  }

  const result: SkillId[] = [];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    result.push(cur);
    for (const nb of adj.get(cur) ?? []) {
      const d = (inDegree.get(nb) ?? 0) - 1;
      inDegree.set(nb, d);
      if (d === 0) {
        // Sett inn i alfabetisk posisjon for deterministisk output.
        let i = 0;
        while (i < queue.length && queue[i] < nb) i++;
        queue.splice(i, 0, nb);
      }
    }
  }

  if (result.length !== SKILLS.length) {
    const missing = SKILLS.filter((s) => !result.includes(s.id)).map((s) => s.id);
    throw new Error(`Cycle detected in skill graph; nodes not sortable: ${missing.join(", ")}`);
  }
  return result;
}

/**
 * Gitt en mengde "låste-opp" skill-id-er, returner skills brukeren KAN
 * lære nå: alle skills der alle direkte prereqs er låst opp, men selve
 * skillen ikke er det.
 */
export function findLeaves(unlockedSet: ReadonlySet<SkillId>): SkillId[] {
  const result: SkillId[] = [];
  for (const s of SKILLS) {
    if (unlockedSet.has(s.id)) continue;
    if (s.prereqs.every((p) => unlockedSet.has(p))) {
      result.push(s.id);
    }
  }
  return result;
}

/**
 * Valider grafen:
 *   - alle id-er er unike
 *   - alle prereqs peker på eksisterende skills
 *   - ingen sykluser
 *
 * Kaster Error med beskrivelse hvis noe er galt. Returnerer ellers true.
 */
export function validateGraph(): true {
  // 1) unike id-er
  const seen = new Set<SkillId>();
  for (const s of SKILLS) {
    if (seen.has(s.id)) {
      throw new Error(`validateGraph: duplicate skill id "${s.id}"`);
    }
    seen.add(s.id);
  }

  // 2) prereqs eksisterer + self-loops
  for (const s of SKILLS) {
    for (const p of s.prereqs) {
      if (!seen.has(p)) {
        throw new Error(`validateGraph: skill "${s.id}" har ukjent prereq "${p}"`);
      }
      if (p === s.id) {
        throw new Error(`validateGraph: skill "${s.id}" har seg selv som prereq`);
      }
    }
  }

  // 3) sykluser — gjenbruk topologicalSort som kaster.
  topologicalSort();

  return true;
}

/**
 * Hjelp for engine/UI: tell skills per fagområde.
 */
export function countByOmrade(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const s of SKILLS) {
    counts[s.omrade] = (counts[s.omrade] ?? 0) + 1;
  }
  return counts;
}
