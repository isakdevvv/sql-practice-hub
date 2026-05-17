// Builds a snapshot ("RAG context") of what the user has done on the platform.
// The tutor route passes this to sendToTutor() so Claude can tailor answers.
//
// All reads are best-effort: every progress store may be empty or unavailable
// (SSR has no localStorage). We swallow errors and return safe defaults — the
// chat must still work for a brand-new visitor.

import { loadProgress } from "../progress/storage";
import { problemFsrs } from "../progress/storage";
import { flashcardFsrs } from "../learn/fsrs";
import { dragFsrs, loadDragProgress } from "../learn/dragProgress";
import { joinFsrs } from "../learn/joinProgress";
import { PROBLEMS } from "../problems/data";
import { FLASHCARDS } from "../learn/flashcards";

export interface TutorContext {
  /** Samlet sammendrag av hva brukeren har lært. */
  userSummary: string;
  /** Hvilken side er bruker på nå? (hvis åpnet fra spesifikk side) */
  currentPage?: { kind: string; id: string; title: string };
  /** Top 5 skills brukeren sliter mest med. */
  weakSpots: { skillId: string; navn: string; rating: number }[];
  /** Top 5 skills brukeren er sterk på. */
  strongPoints: { skillId: string; navn: string; rating: number }[];
  /** Due-flashcards de neste 7 dagene. */
  dueCardsCount: number;
  /** Totalt fullført. */
  totalSolved: { sql: number; python: number; drag: number; cards: number };
}

interface SkillSignal {
  skillId: string;
  navn: string;
  /** 0..5 — higher = stronger. Derived from FSRS difficulty (1..10, lower=easier)
   *  combined with reps. We invert so the UI can sort consistently. */
  rating: number;
}

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

/** Translate FSRS difficulty (1..10, lower is easier) + reps into a 0..5 rating.
 *  This is intentionally simple — it's a signal for the LLM, not an exam grade. */
function ratingFromFsrs(difficulty: number, reps: number): number {
  // difficulty 1 (easy) → ~5, difficulty 10 (hard) → ~1
  const fromDiff = Math.max(0, 5 - (difficulty - 1) * 0.5);
  // Reps add confidence: 0 reps → 0 bonus, 5+ reps → +1
  const repBonus = Math.min(1, reps / 5);
  return Math.min(5, Math.max(0, fromDiff * 0.85 + repBonus));
}

/** Per-topic aggregation across SQL problems. Topics come from problem.topics. */
function sqlTopicSignals(): SkillSignal[] {
  const states = safe(() => problemFsrs.getAllStates(), {} as Record<string, { id: string; difficulty: number; reps: number }>);
  const byId = new Map<string, { id: string; difficulty: number; reps: number }>(
    Object.values(states).map((s) => [s.id, s]),
  );

  // Aggregate per topic — average rating weighted by reps+1 so well-practiced
  // problems pull harder than seen-once stragglers.
  const acc = new Map<string, { sum: number; weight: number }>();
  for (const p of PROBLEMS) {
    const st = byId.get(p.id);
    if (!st) continue;
    const r = ratingFromFsrs(st.difficulty, st.reps);
    const w = st.reps + 1;
    for (const t of p.topics) {
      const key = t.toUpperCase();
      const cur = acc.get(key) ?? { sum: 0, weight: 0 };
      cur.sum += r * w;
      cur.weight += w;
      acc.set(key, cur);
    }
  }

  return Array.from(acc.entries()).map(([topic, { sum, weight }]) => ({
    skillId: `sql:${topic}`,
    navn: `SQL · ${topic}`,
    rating: weight > 0 ? sum / weight : 0,
  }));
}

/** Per-category aggregation across flashcards. */
function flashcardCategorySignals(): SkillSignal[] {
  const states = safe(
    () => flashcardFsrs.getAllStates(),
    {} as Record<string, { id: string; difficulty: number; reps: number }>,
  );
  const byId = new Map(Object.values(states).map((s) => [s.id, s]));

  const acc = new Map<string, { sum: number; weight: number; topic: string }>();
  for (const c of FLASHCARDS) {
    const st = byId.get(c.id);
    if (!st) continue;
    const r = ratingFromFsrs(st.difficulty, st.reps);
    const w = st.reps + 1;
    const key = c.topic ?? c.category;
    const cur = acc.get(key) ?? { sum: 0, weight: 0, topic: key };
    cur.sum += r * w;
    cur.weight += w;
    acc.set(key, cur);
  }

  return Array.from(acc.entries()).map(([key, { sum, weight, topic }]) => ({
    skillId: `card:${key}`,
    navn: `Huskelapp · ${topic}`,
    rating: weight > 0 ? sum / weight : 0,
  }));
}

function buildUserSummary(args: {
  totalSolved: TutorContext["totalSolved"];
  weakSpots: SkillSignal[];
  strongPoints: SkillSignal[];
  dueCardsCount: number;
}): string {
  const { totalSolved, weakSpots, strongPoints, dueCardsCount } = args;
  const parts: string[] = [];
  const totalProblemsAll = totalSolved.sql + totalSolved.drag + totalSolved.cards;
  if (totalProblemsAll === 0) {
    parts.push("Brukeren er ny eller har ikke aktivitet enda.");
  } else {
    parts.push(
      `Brukeren har løst ${totalSolved.sql} SQL-oppgaver, ${totalSolved.drag} drag-oppgaver og kan ${totalSolved.cards} huskelapper.`,
    );
  }
  if (dueCardsCount > 0) {
    parts.push(`${dueCardsCount} kort er due for repetisjon nå.`);
  }
  if (strongPoints.length > 0) {
    parts.push(
      `Sterkest på: ${strongPoints
        .slice(0, 3)
        .map((s) => s.navn)
        .join(", ")}.`,
    );
  }
  if (weakSpots.length > 0) {
    parts.push(
      `Svakest på: ${weakSpots
        .slice(0, 3)
        .map((s) => s.navn)
        .join(", ")}.`,
    );
  }
  return parts.join(" ");
}

export function buildTutorContext(
  currentPage?: { kind: string; id: string; title?: string },
): TutorContext {
  // ---- totals ----
  const progress = safe(() => loadProgress(), { attempts: {} } as ReturnType<typeof loadProgress>);
  const sqlSolved = Object.values(progress.attempts).filter((a) => a.solved).length;

  const dragP = safe(() => loadDragProgress(), { solved: {} } as ReturnType<typeof loadDragProgress>);
  const dragSolved = Object.keys(dragP.solved).length;

  const flashcardStates = safe(() => flashcardFsrs.getAllStates(), {} as Record<string, { state: string }>);
  const cardsLearned = Object.values(flashcardStates).filter((s) => s.state !== "new").length;

  // Python: we don't have a unified progress store mounted here yet — leave as 0
  // and surface this as a known TODO in the summary.
  const pythonSolved = 0;

  const totalSolved = {
    sql: sqlSolved,
    python: pythonSolved,
    drag: dragSolved,
    cards: cardsLearned,
  };

  // ---- due cards (next 7 days) across all FSRS stores ----
  const cutoff = Date.now() + 7 * 86400_000;
  const dueCardsCount = safe(() => {
    let n = 0;
    for (const store of [flashcardFsrs, problemFsrs, dragFsrs, joinFsrs]) {
      for (const s of Object.values(store.getAllStates())) {
        if (s.state !== "new" && s.due <= cutoff) n += 1;
      }
    }
    return n;
  }, 0);

  // ---- skill signals ----
  const signals = [...sqlTopicSignals(), ...flashcardCategorySignals()];
  // Sort weak→strong (low rating first) and strong→weak.
  const sorted = [...signals].sort((a, b) => a.rating - b.rating);
  const weakSpots = sorted.slice(0, 5);
  const strongPoints = [...signals].sort((a, b) => b.rating - a.rating).slice(0, 5);

  const userSummary = buildUserSummary({
    totalSolved,
    weakSpots,
    strongPoints,
    dueCardsCount,
  });

  const ctx: TutorContext = {
    userSummary,
    weakSpots,
    strongPoints,
    dueCardsCount,
    totalSolved,
  };
  if (currentPage) {
    ctx.currentPage = {
      kind: currentPage.kind,
      id: currentPage.id,
      title: currentPage.title ?? currentPage.id,
    };
  }
  return ctx;
}
