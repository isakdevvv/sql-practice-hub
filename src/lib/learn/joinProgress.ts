// localStorage-backed tracking for which JOIN exercises the user has solved
// in quiz mode. Mirrors the shape of cardProgress but trimmed down. Also
// feeds an FSRS scheduler so JOIN exercises show up in the cross-tool
// "Due i dag"-queue.

import { createFsrsStore, Rating, type ReviewRating } from "./fsrs";

const KEY = "sql-practice-joins-v1";

/** Independent FSRS namespace for JOIN exercises. */
export const joinFsrs = createFsrsStore("fsrs.joins.v1");

export interface JoinProgress {
  solved: Record<string, true>;
  lastSeen: Record<string, string>;
}

const EMPTY: JoinProgress = { solved: {}, lastSeen: {} };

export function loadJoinProgress(): JoinProgress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return EMPTY;
  }
}

function save(p: JoinProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(p));
}

export function markJoinSolved(
  id: string,
  rating: ReviewRating = Rating.Good,
): JoinProgress {
  const p = loadJoinProgress();
  p.solved[id] = true;
  p.lastSeen[id] = new Date().toISOString();
  save(p);
  try {
    joinFsrs.recordReview(id, rating);
  } catch {
    /* ignore */
  }
  return p;
}

export function getDueJoinIds(now: number = Date.now()): string[] {
  return joinFsrs.getDueIds(now);
}

export function resetJoinProgress(): JoinProgress {
  save(EMPTY);
  joinFsrs.reset();
  return EMPTY;
}
