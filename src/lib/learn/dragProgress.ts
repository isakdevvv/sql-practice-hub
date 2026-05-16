// Persisted progress for drag-oppgaver (match, order, fill, crowsfoot, quiz).
// Each exercise gives a fixed XP on the FIRST correct check. Re-solving the
// same one doesn't add XP, so progress reflects unique completions.
//
// On top of the XP/solved tracking we also feed every solve into a per-type
// FSRS scheduler so drag exercises participate in the cross-tool
// "Due i dag"-repetition queue.

import { createFsrsStore, Rating, type ReviewRating } from "./fsrs";

const KEY = "sql-practice-drag-v1";
const XP_PER_SOLVE = 5;

/** Independent FSRS namespace for drag exercises. Stored in its own
 *  localStorage key so flashcard/SQL state isn't polluted. */
export const dragFsrs = createFsrsStore("fsrs.drag.v1");

export interface DragProgress {
  /** Map fra exercise id → true når brukeren har sjekket riktig svar minst én gang. */
  solved: Record<string, true>;
  /** ISO-tidspunkt sist sett, per exercise id. */
  lastSeen: Record<string, string>;
  /** Total opptjent XP. */
  xp: number;
}

const EMPTY: DragProgress = { solved: {}, lastSeen: {}, xp: 0 };

export function loadDragProgress(): DragProgress {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY };
  }
}

function save(p: DragProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(p));
}

/** Mark an exercise as solved. Returns the new progress and how much XP this
 *  call earned (0 if it was already solved). Also schedules the next FSRS
 *  review — `rating` defaults to Good which matches "solved cleanly". */
export function markDragSolved(
  id: string,
  rating: ReviewRating = Rating.Good,
): { progress: DragProgress; xpEarned: number } {
  const p = loadDragProgress();
  const wasNew = !p.solved[id];
  p.solved[id] = true;
  p.lastSeen[id] = new Date().toISOString();
  if (wasNew) p.xp += XP_PER_SOLVE;
  save(p);
  // Schedule the next FSRS review for this exercise. We don't fail the save
  // if FSRS throws — solve tracking is the source of truth, scheduling is a
  // best-effort layer on top.
  try {
    dragFsrs.recordReview(id, rating);
  } catch {
    /* ignore */
  }
  return { progress: p, xpEarned: wasNew ? XP_PER_SOLVE : 0 };
}

/** Ids of drag exercises whose FSRS interval is due now-or-earlier. */
export function getDueDragIds(now: number = Date.now()): string[] {
  return dragFsrs.getDueIds(now);
}

export function resetDragProgress(): DragProgress {
  save({ ...EMPTY });
  dragFsrs.reset();
  return { ...EMPTY };
}

export { XP_PER_SOLVE as DRAG_XP_PER_SOLVE };
