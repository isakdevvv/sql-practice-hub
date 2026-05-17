// Skill-tree ferdighets-estimerings-motor.
//
// Leser de fem eksisterende progress-storages (SQL-problemer, Python-oppgaver,
// drag-oppgaver, flashcards og JOIN-oppgaver) og produserer en Elo-basert
// ferdighets-rating per skill i skill-treet. Holder seg bevisst i sin egen
// localStorage-nøkkel slik at vi aldri muterer kildedataene — denne motoren
// er strengt "read + derive + cache".
//
// Design-valg:
// - Elo i stedet for IRT: små datasett per skill (5-30 oppgaver), Elo trenger
//   ikke parameter-fitting, og K=32 (sjakk-standard) gir rimelig
//   konvergensfart.
// - Oppgavens difficulty hardkodes til 1000 inntil videre. Engine'en kan
//   senere lese en pr-oppgave difficulty-tabell uten å endre APIet.
// - Confidence vokser lineært til 5 attempts og kapsles på 1.0 — etter ~5
//   attempts er Elo-estimatet rimelig stabilt for vårt formål.
// - Cache invalideres ved versjonsbump og når input-storages endres. Vi
//   sjekker en billig "fingerprint" av input før vi returnerer cached state.

import {
  loadProgress,
  type Progress,
  type ProblemAttempt,
} from "@/lib/progress/storage";
import { loadPyProgress, type PyProgress } from "@/lib/python/pyProgress";
import {
  loadDragProgress,
  type DragProgress,
} from "@/lib/learn/dragProgress";
import {
  loadCardProgress,
  type CardProgress,
} from "@/lib/learn/cardProgress";
import {
  loadJoinProgress,
  type JoinProgress,
} from "@/lib/learn/joinProgress";
import { SKILLS as DEFAULT_SKILLS, type Skill, type SkillId } from "@/lib/skill-tree/skills";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface SkillState {
  skillId: SkillId;
  /** Elo-rating. Default `DEFAULT_RATING` (=1000, "ukjent" når attempts=0). */
  rating: number;
  /** 0-1 — øker med flere attempts. confidence = min(1, attempts/5). */
  confidence: number;
  /** Totalt antall attempts som har bidratt til estimatet. */
  attempts: number;
  /** ms-timestamp på siste oppdatering. 0 hvis ingen attempts. */
  lastUpdated: number;
}

export type Mastery = "ukjent" | "lærer" | "kan" | "mester";

// ---------------------------------------------------------------------------
// Tunable constants
// ---------------------------------------------------------------------------

/** Startverdi for både brukerens skill-rating og oppgavens difficulty. */
export const DEFAULT_RATING = 1000;

/** Elo K-faktor. 32 er sjakk-standard. Høyere = raskere bevegelse. */
export const K_FACTOR = 32;

/** Hver oppgave har implisitt difficulty=1000 inntil vi kalibrerer. */
export const TASK_DIFFICULTY = 1000;

/** Antall attempts før confidence treffer 1.0. */
const CONFIDENCE_FULL_AT = 5;

/** Score-bidrag per utfall (brukes i Elo-oppdateringen som "observert score"). */
const SCORE_CORRECT_FIRST_TRY = 1.0;
const SCORE_CORRECT_HINTS = 0.75;
const SCORE_CORRECT_AFTER_FAIL = 0.6;
const SCORE_INCORRECT = 0.0;

/** Bonus-/straffe-rating som legges på toppen av Elo-justeringen. Matcher
 *  spesifikasjonen (correct first-try → +30, hints → +15, etter fail → +10,
 *  feil/forlatt → -5). Vi splitter Elo-formelen og denne flat bonusen så de
 *  to bidragene kan tunes uavhengig. */
const FLAT_BONUS: Record<Outcome, number> = {
  correct_first_try: 30,
  correct_with_hints: 15,
  correct_after_fail: 10,
  incorrect: -5,
};

/** Når en mester-skill ikke har vært oppdatert på så mange dager, blir den
 *  "rusty" og returneres fra `getRustyConcepts`. */
const RUSTY_AFTER_DAYS = 30;

// Mastery-tærskler. Justert slik at en pretest-only seed (ingen attempts,
// confidence=0) faller i "ukjent", mens en bruker som har trent flere ganger
// og har høy rating treffer "kan"/"mester".
const MASTERY_LEARNING_AT = 1050; // > 1050 → "lærer" (forutsatt confidence > 0)
const MASTERY_CAN_AT = 1150; // > 1150 og confidence ≥ 0.6 → "kan"
const MASTERY_MASTER_AT = 1250; // > 1250 og confidence ≥ 0.8 → "mester"

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

const CACHE_KEY = "sql-practice-skill-tree-v1";

interface CacheEntry {
  fingerprint: string;
  states: Record<SkillId, SkillState>;
  /** Bumpes hvis vi endrer cache-formatet. */
  version: 1;
}

function readCache(): CacheEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(entry: CacheEntry): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    /* quota — ignorer, neste kall regner på nytt. */
  }
}

/** Billig hash av input-storage så vi vet når cachen er stale. Vi inkluderer
 *  antall solved/attempts + xp i hver storage, pluss antall skills. Det
 *  fanger praktisk talt alle endringer uten å serialisere hele tre. */
function fingerprintInput(
  sql: Progress,
  py: PyProgress,
  drag: DragProgress,
  cards: CardProgress,
  joins: JoinProgress,
  skills: readonly Skill[],
): string {
  const sqlAttemptKeys = Object.keys(sql.attempts).length;
  const sqlAttemptSum = Object.values(sql.attempts).reduce(
    (s, a) => s + a.attempts + (a.solved ? 1 : 0),
    0,
  );
  const pyKeys = Object.keys(py.solved).length;
  const dragKeys = Object.keys(drag.solved).length;
  const cardKnown = Object.keys(cards.known).length;
  const cardUnknown = Object.keys(cards.unknown).length;
  const joinKeys = Object.keys(joins.solved).length;
  return [
    skills.length,
    sqlAttemptKeys,
    sqlAttemptSum,
    sql.xp,
    pyKeys,
    py.xp,
    dragKeys,
    drag.xp,
    cardKnown,
    cardUnknown,
    joinKeys,
  ].join(":");
}

// ---------------------------------------------------------------------------
// Elo
// ---------------------------------------------------------------------------

type Outcome =
  | "correct_first_try"
  | "correct_with_hints"
  | "correct_after_fail"
  | "incorrect";

function outcomeScore(o: Outcome): number {
  switch (o) {
    case "correct_first_try":
      return SCORE_CORRECT_FIRST_TRY;
    case "correct_with_hints":
      return SCORE_CORRECT_HINTS;
    case "correct_after_fail":
      return SCORE_CORRECT_AFTER_FAIL;
    case "incorrect":
      return SCORE_INCORRECT;
  }
}

/** Standard Elo expected-score. */
function expectedScore(playerRating: number, opponentRating: number): number {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}

/** Anvend én Elo-oppdatering på en eksisterende state, og legg på flat bonus
 *  fra spesifikasjonen. Returnerer mutert kopi (rene funksjoner brukes ikke
 *  her — vi muterer en lokal accumulator i `estimateAllSkills`). */
function applyOutcome(
  state: SkillState,
  outcome: Outcome,
  whenMs: number,
): void {
  const expected = expectedScore(state.rating, TASK_DIFFICULTY);
  const observed = outcomeScore(outcome);
  const eloDelta = K_FACTOR * (observed - expected);
  state.rating = state.rating + eloDelta + FLAT_BONUS[outcome];
  state.attempts += 1;
  state.confidence = Math.min(1, state.attempts / CONFIDENCE_FULL_AT);
  if (whenMs > state.lastUpdated) state.lastUpdated = whenMs;
}

// ---------------------------------------------------------------------------
// Evidens → outcomes
// ---------------------------------------------------------------------------

function sqlOutcome(a: ProblemAttempt): Outcome {
  if (!a.solved) return "incorrect";
  if (a.attempts === 1 && a.hintsUsed === 0) return "correct_first_try";
  if (a.hintsUsed > 0) return "correct_with_hints";
  return "correct_after_fail";
}

/** Når vi bare har "solved/lastSeen" (Python, drag, join) antar vi at solved
 *  på første attempt er det vanlige tilfellet, men nedgraderer til
 *  "correct_after_fail" hvis vi mangler info — det er den konservative
 *  default'en. For nå rapporterer disse kildene ikke retries, så vi gir
 *  fullt poeng. */
function solvedFlagOutcome(): Outcome {
  return "correct_first_try";
}

/** Flashcard: known=correct, unknown=incorrect. Vi behandler kjent kort som
 *  en "correct_after_fail" — known/unknown er en selv-rapportert binær
 *  signal, ikke et målt forsøk, så vi gir litt mindre vekt enn ekte
 *  første-forsøks-løsning. */
function cardKnownOutcome(): Outcome {
  return "correct_after_fail";
}
function cardUnknownOutcome(): Outcome {
  return "incorrect";
}

interface Evidence {
  outcome: Outcome;
  whenMs: number;
}

function collectEvidence(
  skill: Skill,
  sql: Progress,
  py: PyProgress,
  drag: DragProgress,
  cards: CardProgress,
  joins: JoinProgress,
): Evidence[] {
  const out: Evidence[] = [];
  const ev = skill.evidens ?? {};

  for (const id of ev.sqlProblemIds ?? []) {
    const a = sql.attempts[id];
    if (!a) continue;
    const whenMs = a.solvedAt ? Date.parse(a.solvedAt) : 0;
    out.push({ outcome: sqlOutcome(a), whenMs: isNaN(whenMs) ? 0 : whenMs });
  }

  for (const id of ev.pyExerciseIds ?? []) {
    if (!py.solved[id]) continue;
    const iso = py.lastSeen[id];
    const whenMs = iso ? Date.parse(iso) : 0;
    out.push({ outcome: solvedFlagOutcome(), whenMs: isNaN(whenMs) ? 0 : whenMs });
  }

  for (const id of ev.dragExerciseIds ?? []) {
    if (!drag.solved[id]) continue;
    const iso = drag.lastSeen[id];
    const whenMs = iso ? Date.parse(iso) : 0;
    out.push({ outcome: solvedFlagOutcome(), whenMs: isNaN(whenMs) ? 0 : whenMs });
  }

  for (const id of ev.flashcardIds ?? []) {
    if (cards.known[id]) {
      const iso = cards.lastSeen[id];
      const whenMs = iso ? Date.parse(iso) : 0;
      out.push({ outcome: cardKnownOutcome(), whenMs: isNaN(whenMs) ? 0 : whenMs });
    } else if (cards.unknown[id]) {
      const iso = cards.lastSeen[id];
      const whenMs = iso ? Date.parse(iso) : 0;
      out.push({ outcome: cardUnknownOutcome(), whenMs: isNaN(whenMs) ? 0 : whenMs });
    }
  }

  for (const id of ev.joinExerciseIds ?? []) {
    if (!joins.solved[id]) continue;
    const iso = joins.lastSeen[id];
    const whenMs = iso ? Date.parse(iso) : 0;
    out.push({ outcome: solvedFlagOutcome(), whenMs: isNaN(whenMs) ? 0 : whenMs });
  }

  // Sorter kronologisk så Elo-oppdateringene følger faktisk læringskurve.
  out.sort((a, b) => a.whenMs - b.whenMs);
  return out;
}

// ---------------------------------------------------------------------------
// Pretest-seed
// ---------------------------------------------------------------------------

const SEED_KEY = "sql-practice-skill-tree-seed-v1";

interface SeedEntry {
  /** Rating-justering som legges på toppen av DEFAULT_RATING. */
  delta: number;
  /** Vi teller pretest som 1 ekstra attempt mot confidence. */
  whenMs: number;
}

type SeedMap = Record<SkillId, SeedEntry>;

function readSeed(): SeedMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SEED_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as SeedMap;
  } catch {
    return {};
  }
}

function writeSeed(seed: SeedMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SEED_KEY, JSON.stringify(seed));
  } catch {
    /* ignorer quota */
  }
}

/** Sett initial rating fra pretest-svar. Correct → +60 (≈2x Elo-bonus, så
 *  brukeren starter klart over default), incorrect → -30. Vi lagrer seedet i
 *  egen nøkkel slik at det overlever cache-invalidering, og det blir
 *  applisert i `estimateAllSkills` før evidens-loopen. */
export function seedFromDiagnose(
  answers: { skillId: SkillId; correct: boolean }[],
): void {
  const seed = readSeed();
  const now = Date.now();
  for (const a of answers) {
    const delta = a.correct ? 60 : -30;
    seed[a.skillId] = { delta, whenMs: now };
  }
  writeSeed(seed);
  invalidateCache();
}

/** Eksponert hovedsakelig for tester / reset-knapper. */
export function clearSeed(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SEED_KEY);
  invalidateCache();
}

function invalidateCache(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CACHE_KEY);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Tilstand for én skill, med fallback til "ukjent"-default. */
function emptyState(skillId: SkillId): SkillState {
  return {
    skillId,
    rating: DEFAULT_RATING,
    confidence: 0,
    attempts: 0,
    lastUpdated: 0,
  };
}

/** Beregner ferdighets-state for alle skills. Caches resultatet i
 *  localStorage og returnerer cache hvis input ikke har endret seg siden
 *  sist. `skills`-argumentet defaulter til `SKILLS` fra `./skills.ts` —
 *  men kan overstyres for tester og for sider som vil filtrere på en
 *  delmengde. */
export function estimateAllSkills(
  skills: readonly Skill[] = DEFAULT_SKILLS,
): Map<SkillId, SkillState> {
  const sql = loadProgress();
  const py = loadPyProgress();
  const drag = loadDragProgress();
  const cards = loadCardProgress();
  const joins = loadJoinProgress();

  const fp = fingerprintInput(sql, py, drag, cards, joins, skills);
  const cached = readCache();
  if (cached && cached.fingerprint === fp) {
    const map = new Map<SkillId, SkillState>();
    for (const s of skills) {
      map.set(s.id, cached.states[s.id] ?? emptyState(s.id));
    }
    return map;
  }

  const seed = readSeed();
  const map = new Map<SkillId, SkillState>();
  const serialized: Record<SkillId, SkillState> = {};

  for (const skill of skills) {
    const state = emptyState(skill.id);

    // Anvend pretest-seed først, slik at evidens kan løfte ratingen videre
    // (eller la den seed-justerte ratingen vise når brukeren ikke har noen
    // evidens enda).
    const s = seed[skill.id];
    if (s) {
      state.rating += s.delta;
      // Pretest teller som halv attempt så confidence beveger seg litt,
      // men er stadig lav nok til at "ukjent"/"lærer" stemmer for brukere
      // som bare har tatt pretesten.
      state.attempts += 1;
      state.confidence = Math.min(1, state.attempts / CONFIDENCE_FULL_AT);
      state.lastUpdated = s.whenMs;
    }

    const evidence = collectEvidence(skill, sql, py, drag, cards, joins);
    for (const e of evidence) {
      applyOutcome(state, e.outcome, e.whenMs);
    }

    map.set(skill.id, state);
    serialized[skill.id] = state;
  }

  writeCache({ version: 1, fingerprint: fp, states: serialized });
  return map;
}

/** Henter state for én skill. Bruker felles cache så gjentatte kall i samme
 *  render-pass er gratis. */
export function getSkillState(
  id: SkillId,
  skills: readonly Skill[] = DEFAULT_SKILLS,
): SkillState {
  const all = estimateAllSkills(skills);
  return all.get(id) ?? emptyState(id);
}

/** Avbild rating+confidence → fire mastery-bånd.
 *  - "ukjent": ingen attempts, eller confidence svært lav.
 *  - "lærer": noe attempts og rating har beveget seg over default.
 *  - "kan": stabil rating klart over default med rimelig confidence.
 *  - "mester": høy rating og høy confidence. */
export function getMastery(
  id: SkillId,
  skills: readonly Skill[] = DEFAULT_SKILLS,
): Mastery {
  const s = getSkillState(id, skills);
  if (s.attempts === 0) return "ukjent";
  if (s.rating > MASTERY_MASTER_AT && s.confidence >= 0.8) return "mester";
  if (s.rating > MASTERY_CAN_AT && s.confidence >= 0.6) return "kan";
  if (s.rating > MASTERY_LEARNING_AT) return "lærer";
  // Lav rating + få attempts faller tilbake til "ukjent" så pretest-svar
  // hvor brukeren tippet feil ikke låser dem som "lærer" for alltid.
  if (s.confidence < 0.4) return "ukjent";
  return "lærer";
}

/** Skills som er klare for å gjøres: alle prereqs er "kan" eller "mester",
 *  og brukeren selv er "ukjent" eller "lærer" (altså ikke ferdig allerede).
 *  En skill uten prereqs er alltid unlocked. */
export function getNextUnlocked(
  skills: readonly Skill[] = DEFAULT_SKILLS,
): SkillId[] {
  const states = estimateAllSkills(skills);
  const masteryOf = (id: SkillId): Mastery => {
    const s = states.get(id);
    if (!s || s.attempts === 0) return "ukjent";
    if (s.rating > MASTERY_MASTER_AT && s.confidence >= 0.8) return "mester";
    if (s.rating > MASTERY_CAN_AT && s.confidence >= 0.6) return "kan";
    if (s.rating > MASTERY_LEARNING_AT) return "lærer";
    if (s.confidence < 0.4) return "ukjent";
    return "lærer";
  };

  const out: SkillId[] = [];
  for (const skill of skills) {
    const own = masteryOf(skill.id);
    if (own !== "ukjent" && own !== "lærer") continue;
    const prereqsOk = skill.prereqs.every((p) => {
      const m = masteryOf(p);
      return m === "kan" || m === "mester";
    });
    if (prereqsOk) out.push(skill.id);
  }
  return out;
}

/** Skills brukeren en gang var "mester" på, men ikke har trent på de siste
 *  `RUSTY_AFTER_DAYS` dagene. Brukes til "rusty repetition"-forslag. */
export function getRustyConcepts(
  skills: readonly Skill[] = DEFAULT_SKILLS,
  now: number = Date.now(),
): SkillId[] {
  const states = estimateAllSkills(skills);
  const cutoff = now - RUSTY_AFTER_DAYS * 86400000;
  const out: SkillId[] = [];
  for (const skill of skills) {
    const s = states.get(skill.id);
    if (!s) continue;
    // "Var mester på" — rating-/confidence-tærskler matcher mastery-funksjonen.
    const wasMaster = s.rating > MASTERY_MASTER_AT && s.confidence >= 0.8;
    if (wasMaster && s.lastUpdated > 0 && s.lastUpdated < cutoff) {
      out.push(skill.id);
    }
  }
  return out;
}

// Eksponer interne deler for tester. Ikke en del av det stabile APIet.
export const __testing = {
  applyOutcome,
  expectedScore,
  outcomeScore,
  fingerprintInput,
  CACHE_KEY,
  SEED_KEY,
};
