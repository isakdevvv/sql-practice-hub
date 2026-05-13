// FSRS-4.5 spaced repetition for flashcards.
// Wraps `ts-fsrs` and persists per-card state to localStorage. The library's
// `Card` type uses Date objects and snake_case fields; we store a flat,
// JSON-friendly shape and convert at the boundary.

import {
  createEmptyCard,
  fsrs,
  Rating,
  State,
  type Card as TsFsrsCard,
  type RecordLogItem,
} from "ts-fsrs";
import type { FlashCard } from "./types";

const STORAGE_KEY = "fsrs.cards.v1";

export type CardStateName = "new" | "learning" | "review" | "relearning";

/** Flat, serializable per-card state stored in localStorage. */
export interface CardState {
  id: string;
  /** unix-ms */
  due: number;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: CardStateName;
  /** unix-ms, undefined if never reviewed. */
  lastReview?: number;
}

// FSRS scheduler shared across calls. requestRetention 0.9 matches Anki default;
// maximumInterval is two years — long enough to retain rare-but-important
// concepts past the next exam without scheduling cards 30 years out.
const scheduler = fsrs({
  request_retention: 0.9,
  maximum_interval: 365 * 2,
});

// ---- state <-> ts-fsrs Card conversion ----

const STATE_FROM_NUM: Record<State, CardStateName> = {
  [State.New]: "new",
  [State.Learning]: "learning",
  [State.Review]: "review",
  [State.Relearning]: "relearning",
};

const STATE_TO_NUM: Record<CardStateName, State> = {
  new: State.New,
  learning: State.Learning,
  review: State.Review,
  relearning: State.Relearning,
};

function toTsCard(s: CardState): TsFsrsCard {
  return {
    due: new Date(s.due),
    stability: s.stability,
    difficulty: s.difficulty,
    elapsed_days: s.elapsedDays,
    scheduled_days: s.scheduledDays,
    learning_steps: 0,
    reps: s.reps,
    lapses: s.lapses,
    state: STATE_TO_NUM[s.state],
    last_review: s.lastReview != null ? new Date(s.lastReview) : undefined,
  };
}

function fromTsCard(id: string, c: TsFsrsCard): CardState {
  return {
    id,
    due: c.due.getTime(),
    stability: c.stability,
    difficulty: c.difficulty,
    elapsedDays: c.elapsed_days,
    scheduledDays: c.scheduled_days,
    reps: c.reps,
    lapses: c.lapses,
    state: STATE_FROM_NUM[c.state],
    lastReview: c.last_review ? c.last_review.getTime() : undefined,
  };
}

function emptyState(id: string, now: number = Date.now()): CardState {
  return fromTsCard(id, createEmptyCard(new Date(now)));
}

// ---- persistence ----

type Store = Record<string, CardState>;

function loadStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Store;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function saveStore(store: Store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // quota etc. — silently ignored, in-memory state stays consistent.
  }
}

/** Get the stored state for `id`, lazily initializing a fresh card if missing. */
export function getCardState(id: string, now: number = Date.now()): CardState {
  const store = loadStore();
  const existing = store[id];
  if (existing) return existing;
  return emptyState(id, now);
}

/** Read the full store (used for stats / debugging). */
export function getAllStates(): Store {
  return loadStore();
}

// ---- review ----

export type ReviewRating = Rating.Again | Rating.Hard | Rating.Good | Rating.Easy;

/** Run the FSRS scheduler with the given rating and persist the result. */
export function recordReview(
  id: string,
  rating: ReviewRating,
  now: number = Date.now(),
): CardState {
  const store = loadStore();
  const current = store[id] ?? emptyState(id, now);
  const next: RecordLogItem = scheduler.next(toTsCard(current), new Date(now), rating);
  const updated = fromTsCard(id, next.card);
  store[id] = updated;
  saveStore(store);
  return updated;
}

/** Preview the four possible outcomes for `id` at `now` — used to label
 *  the Again/Hard/Good/Easy buttons with their predicted intervals. */
export interface RatingPreview {
  rating: ReviewRating;
  /** Days until next review (rounded, can be 0 for sub-day learning steps). */
  scheduledDays: number;
  /** Human-readable interval like "3d", "<10m", "2mo". */
  label: string;
  /** Resulting state — useful for showing state transitions. */
  state: CardStateName;
}

export function previewRatings(id: string, now: number = Date.now()): RatingPreview[] {
  const current = getCardState(id, now);
  const preview = scheduler.repeat(toTsCard(current), new Date(now));
  const grades: ReviewRating[] = [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy];
  return grades.map((g) => {
    const item = preview[g];
    const dueMs = item.card.due.getTime() - now;
    return {
      rating: g,
      scheduledDays: item.card.scheduled_days,
      label: formatInterval(dueMs),
      state: STATE_FROM_NUM[item.card.state],
    };
  });
}

function formatInterval(ms: number): string {
  if (ms <= 0) return "nå";
  const min = ms / 60_000;
  if (min < 60) return `${Math.max(1, Math.round(min))}m`;
  const h = min / 60;
  if (h < 24) return `${Math.round(h)}t`;
  const d = h / 24;
  if (d < 30) return `${Math.round(d)}d`;
  const mo = d / 30;
  if (mo < 12) return `${Math.round(mo)}mo`;
  return `${(d / 365).toFixed(1)}å`;
}

// ---- queue helpers ----

/** Cards due now or earlier, sorted oldest-due first. Excludes brand-new cards. */
export function getDueCards(cards: FlashCard[], now: number = Date.now(), limit?: number): FlashCard[] {
  const store = loadStore();
  const due = cards
    .map((c) => ({ card: c, state: store[c.id] }))
    .filter((x) => x.state && x.state.state !== "new" && x.state.due <= now)
    .sort((a, b) => (a.state!.due - b.state!.due))
    .map((x) => x.card);
  return limit != null ? due.slice(0, limit) : due;
}

/** Cards never reviewed yet. Order matches input. */
export function getNewCards(cards: FlashCard[], limit?: number): FlashCard[] {
  const store = loadStore();
  const fresh = cards.filter((c) => !store[c.id] || store[c.id].state === "new");
  return limit != null ? fresh.slice(0, limit) : fresh;
}

/** Cards with state but not currently due — counted as "learned" in the stats. */
export function getLearnedCount(cards: FlashCard[], now: number = Date.now()): number {
  const store = loadStore();
  return cards.filter((c) => {
    const s = store[c.id];
    return s && s.state !== "new" && s.due > now;
  }).length;
}

/** Build a study queue: all due cards plus up to `newPerSession` new cards,
 *  shuffled together so the user isn't grinding all news first. */
export function buildStudyQueue(
  cards: FlashCard[],
  newPerSession: number = 20,
  now: number = Date.now(),
): FlashCard[] {
  const due = getDueCards(cards, now);
  const fresh = getNewCards(cards, newPerSession);
  const queue = [...due, ...fresh];
  // Simple Fisher-Yates so new cards are interleaved with reviews.
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
  return queue;
}

/** Wipe all FSRS state. Used by the reset button. */
export function resetFsrs(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

// Re-export Rating so consumers don't need a second ts-fsrs import.
export { Rating };
