/**
 * MIDLERTIDIGE STUBS — slett ved merge!
 *
 * Disse stubs simulerer API-overflaten som de andre skill-tre-agentene leverer:
 *   - src/lib/skill-tree/skills.ts        (datamodell: SKILLS, type Skill)
 *   - src/lib/skill-tree/engine.ts        (IRT/ferdighet: estimateAllSkills, getMastery, getNextUnlocked)
 *   - src/lib/skill-tree/graph.ts         (graf-utils: getPrereqs, getDependents, topologicalSort)
 *
 * UI-koden (SkillGraph.tsx, route /skill-tre) importerer fra disse stubs via
 *   re-export i `skills.ts`, `engine.ts`, `graph.ts`. Når data-agent og engine-agent
 *   merger inn ekte filer skal disse stubs slettes og re-exportene byttes.
 *
 * Stub-data dekker ~24 skills på tvers av flere fag-områder slik at UI'et
 *   kan utvikles, demoes og smoke-testes uten å vente på data-agenten.
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

export type BloomNivaa =
  | "remember"
  | "understand"
  | "apply"
  | "analyze"
  | "evaluate"
  | "create";

export interface SkillEvidens {
  pyExerciseIds?: string[];
  sqlProblemIds?: string[];
  dragExerciseIds?: string[];
  flashcardIds?: string[];
  stackSlugs?: string[];
}

export interface Skill {
  id: SkillId;
  navn: string;
  blurb: string;
  omrade: FagOmrade;
  bloom: BloomNivaa;
  prereqs: SkillId[];
  evidens: SkillEvidens;
  estimertTid: string;
}

/** ---------- STUB SKILLS ---------- */
export const STUB_SKILLS: Skill[] = [
  // ---------- Math ----------
  {
    id: "math-aritmetikk",
    navn: "Aritmetikk",
    blurb: "Grunnleggende +, -, *, / og operatorrekkefølge.",
    omrade: "math",
    bloom: "remember",
    prereqs: [],
    evidens: {},
    estimertTid: "20 min",
  },
  {
    id: "math-algebra",
    navn: "Algebra",
    blurb: "Variabler, likninger og enkel manipulasjon.",
    omrade: "math",
    bloom: "apply",
    prereqs: ["math-aritmetikk"],
    evidens: {},
    estimertTid: "1-2 t",
  },
  {
    id: "math-funksjoner",
    navn: "Funksjoner",
    blurb: "f(x) som regel, definisjonsmengde, sammensetning.",
    omrade: "math",
    bloom: "understand",
    prereqs: ["math-algebra"],
    evidens: {},
    estimertTid: "1 t",
  },
  {
    id: "math-derivasjon",
    navn: "Derivasjon",
    blurb: "Stigningstall og enkle deriveringsregler.",
    omrade: "math",
    bloom: "apply",
    prereqs: ["math-funksjoner"],
    evidens: {},
    estimertTid: "2 t",
  },
  // ---------- Programmering ----------
  {
    id: "prog-variabler",
    navn: "Variabler og typer",
    blurb: "Tildeling, primitive typer, navngiving.",
    omrade: "programming",
    bloom: "remember",
    prereqs: [],
    evidens: { pyExerciseIds: ["py-101"] },
    estimertTid: "30 min",
  },
  {
    id: "prog-kontrollflyt",
    navn: "Kontrollflyt",
    blurb: "if/else, while, for-løkker.",
    omrade: "programming",
    bloom: "apply",
    prereqs: ["prog-variabler"],
    evidens: { pyExerciseIds: ["py-110", "py-111"] },
    estimertTid: "1 t",
  },
  {
    id: "prog-funksjoner",
    navn: "Funksjoner (kode)",
    blurb: "def, parametere, retur, scope.",
    omrade: "programming",
    bloom: "apply",
    prereqs: ["prog-kontrollflyt"],
    evidens: { pyExerciseIds: ["py-120"] },
    estimertTid: "1-2 t",
  },
  {
    id: "prog-rekursjon",
    navn: "Rekursjon",
    blurb: "Funksjoner som kaller seg selv; basetilfelle.",
    omrade: "programming",
    bloom: "analyze",
    prereqs: ["prog-funksjoner"],
    evidens: {},
    estimertTid: "2 t",
  },
  // ---------- Datastrukturer ----------
  {
    id: "ds-lister",
    navn: "Lister og arrays",
    blurb: "Indeksering, slicing, vanlige operasjoner.",
    omrade: "data-structures",
    bloom: "apply",
    prereqs: ["prog-kontrollflyt"],
    evidens: {},
    estimertTid: "1 t",
  },
  {
    id: "ds-dict",
    navn: "Dictionary / hashmap",
    blurb: "Nøkkel-verdi-oppslag i O(1).",
    omrade: "data-structures",
    bloom: "apply",
    prereqs: ["ds-lister"],
    evidens: {},
    estimertTid: "1 t",
  },
  {
    id: "ds-trær",
    navn: "Trær",
    blurb: "Binærtre, traversering.",
    omrade: "data-structures",
    bloom: "analyze",
    prereqs: ["ds-dict", "prog-rekursjon"],
    evidens: {},
    estimertTid: "2 t",
  },
  // ---------- OS ----------
  {
    id: "os-prosesser",
    navn: "Prosesser",
    blurb: "Hva en prosess er; fork/exec.",
    omrade: "os",
    bloom: "understand",
    prereqs: [],
    evidens: { stackSlugs: ["os-prosess"] },
    estimertTid: "1 t",
  },
  {
    id: "os-tråder",
    navn: "Tråder",
    blurb: "Trådmodell, race conditions.",
    omrade: "os",
    bloom: "analyze",
    prereqs: ["os-prosesser"],
    evidens: {},
    estimertTid: "2 t",
  },
  {
    id: "os-shell",
    navn: "Shell og pipes",
    blurb: "bash, |, redirection.",
    omrade: "os",
    bloom: "apply",
    prereqs: [],
    evidens: { dragExerciseIds: ["shell-1"] },
    estimertTid: "1 t",
  },
  // ---------- Networks ----------
  {
    id: "net-tcp",
    navn: "TCP",
    blurb: "3-way handshake, pålitelig levering.",
    omrade: "networks",
    bloom: "understand",
    prereqs: [],
    evidens: {},
    estimertTid: "2 t",
  },
  {
    id: "net-http",
    navn: "HTTP",
    blurb: "Forespørsel/svar, metoder, status-koder.",
    omrade: "networks",
    bloom: "apply",
    prereqs: ["net-tcp"],
    evidens: {},
    estimertTid: "1 t",
  },
  // ---------- Databases ----------
  {
    id: "db-select",
    navn: "SELECT-spørringer",
    blurb: "Henting fra én tabell.",
    omrade: "databases",
    bloom: "apply",
    prereqs: [],
    evidens: { sqlProblemIds: ["sql-1", "sql-2"] },
    estimertTid: "1 t",
  },
  {
    id: "db-join",
    navn: "JOIN",
    blurb: "INNER, LEFT, RIGHT join over tabeller.",
    omrade: "databases",
    bloom: "analyze",
    prereqs: ["db-select"],
    evidens: { sqlProblemIds: ["sql-10", "sql-11"] },
    estimertTid: "2 t",
  },
  {
    id: "db-aggregering",
    navn: "Aggregering",
    blurb: "GROUP BY, HAVING, COUNT/SUM/AVG.",
    omrade: "databases",
    bloom: "apply",
    prereqs: ["db-select"],
    evidens: { sqlProblemIds: ["sql-20"] },
    estimertTid: "1-2 t",
  },
  // ---------- Web ----------
  {
    id: "web-html",
    navn: "HTML",
    blurb: "Semantiske elementer, struktur.",
    omrade: "web",
    bloom: "remember",
    prereqs: [],
    evidens: {},
    estimertTid: "1 t",
  },
  {
    id: "web-css",
    navn: "CSS",
    blurb: "Selektorer, box model, flex/grid.",
    omrade: "web",
    bloom: "apply",
    prereqs: ["web-html"],
    evidens: {},
    estimertTid: "2 t",
  },
  // ---------- ML klassisk ----------
  {
    id: "ml-linreg",
    navn: "Lineær regresjon",
    blurb: "Minste kvadraters metode.",
    omrade: "ml-classical",
    bloom: "apply",
    prereqs: ["math-derivasjon", "prog-funksjoner"],
    evidens: {},
    estimertTid: "2 t",
  },
  {
    id: "ml-logreg",
    navn: "Logistisk regresjon",
    blurb: "Binær klassifikasjon med sigmoid.",
    omrade: "ml-classical",
    bloom: "apply",
    prereqs: ["ml-linreg"],
    evidens: {},
    estimertTid: "2 t",
  },
  // ---------- Security ----------
  {
    id: "sec-sql-injection",
    navn: "SQL-injection",
    blurb: "Hva det er, prepared statements som forsvar.",
    omrade: "security",
    bloom: "analyze",
    prereqs: ["db-select"],
    evidens: {},
    estimertTid: "1 t",
  },
];

/** ---------- STUB ENGINE ---------- */
export type Mastery = "ukjent" | "lærer" | "kan" | "mester";

export interface SkillEstimate {
  skillId: SkillId;
  /** IRT theta. Rundt 0 = midt på skalaen, -3..+3 typisk. */
  rating: number;
  /** Standardfeil; lav = vi vet mye. 0..1. */
  confidence: number;
  mastery: Mastery;
  /** Antall observasjoner / oppgaver løst. */
  n: number;
  /** ms siden epoch — siste interaksjon. null hvis aldri. */
  sistTrent: number | null;
}

/** Deterministisk pseudo-random fra streng (sha-light) */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function stubEstimateAllSkills(skills: Skill[]): Map<SkillId, SkillEstimate> {
  const out = new Map<SkillId, SkillEstimate>();
  const now = Date.now();
  for (const s of skills) {
    const h = hash(s.id);
    const rating = ((h % 600) - 300) / 100; // -3..+3
    const confidence = (h % 100) / 100;
    const n = h % 20;
    let mastery: Mastery = "ukjent";
    if (n === 0) mastery = "ukjent";
    else if (rating < -0.5) mastery = "lærer";
    else if (rating < 1.5) mastery = "kan";
    else mastery = "mester";
    out.set(s.id, {
      skillId: s.id,
      rating,
      confidence,
      mastery,
      n,
      sistTrent: n === 0 ? null : now - (h % 30) * 86_400_000,
    });
  }
  return out;
}

export function stubGetMastery(est: SkillEstimate | undefined): Mastery {
  return est?.mastery ?? "ukjent";
}

export function stubGetNextUnlocked(
  skills: Skill[],
  estimates: Map<SkillId, SkillEstimate>,
): SkillId[] {
  // En skill er "neste ulåst" hvis alle prereqs er kan/mester, men selve skillen
  // er ukjent eller lærer.
  const out: SkillId[] = [];
  for (const s of skills) {
    const own = stubGetMastery(estimates.get(s.id));
    if (own === "kan" || own === "mester") continue;
    const allPrereqsOk = s.prereqs.every((p) => {
      const m = stubGetMastery(estimates.get(p));
      return m === "kan" || m === "mester";
    });
    if (allPrereqsOk) out.push(s.id);
  }
  return out;
}

/** ---------- STUB GRAPH ---------- */
export function stubGetPrereqs(skills: Skill[], id: SkillId): SkillId[] {
  const s = skills.find((x) => x.id === id);
  return s ? [...s.prereqs] : [];
}

export function stubGetDependents(skills: Skill[], id: SkillId): SkillId[] {
  return skills.filter((s) => s.prereqs.includes(id)).map((s) => s.id);
}

export function stubTopologicalSort(skills: Skill[]): SkillId[] {
  const ids = skills.map((s) => s.id);
  const visited = new Set<SkillId>();
  const order: SkillId[] = [];
  const byId = new Map(skills.map((s) => [s.id, s]));
  function visit(id: SkillId) {
    if (visited.has(id)) return;
    visited.add(id);
    const s = byId.get(id);
    if (s) for (const p of s.prereqs) visit(p);
    order.push(id);
  }
  for (const id of ids) visit(id);
  return order;
}
