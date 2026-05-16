// FSRS-4.5 spaced repetition. Originally written for flashcards; now generic
// over `id: string` so drag/JOIN/SQL progress can plug in their own stores.
// Wraps `ts-fsrs` and persists per-id state to localStorage. The library's
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

const FLASHCARD_STORAGE_KEY = "fsrs.cards.v1";

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

// ---- persistence (parameterized by storage key) ----

type Store = Record<string, CardState>;

function loadStoreAt(storageKey: string): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Store;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function saveStoreAt(storageKey: string, store: Store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(store));
  } catch {
    // quota etc. — silently ignored, in-memory state stays consistent.
  }
}

// ---- review ----

export type ReviewRating = Rating.Again | Rating.Hard | Rating.Good | Rating.Easy;

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

// ---- generic FSRS store factory ----

/** A self-contained FSRS scheduler bound to one localStorage key. Used by
 *  flashcards, drag exercises, JOIN exercises and SQL problems — each gets
 *  its own namespace so ids don't collide and one feature's data is
 *  independent of another's. */
export interface FsrsStore {
  /** Get the stored state for `id`, lazily initializing a fresh card. */
  getCardState(id: string, now?: number): CardState;
  /** Read the full underlying store. */
  getAllStates(): Record<string, CardState>;
  /** Run the FSRS scheduler with the given rating and persist the result. */
  recordReview(id: string, rating: ReviewRating, now?: number): CardState;
  /** Preview Again/Hard/Good/Easy intervals for the next review. */
  previewRatings(id: string, now?: number): RatingPreview[];
  /** Wipe all state in this namespace. */
  reset(): void;
  /** Return ids that are due now or earlier. Excludes brand-new ids. */
  getDueIds(now?: number): string[];
  /** Underlying localStorage key — exposed for migration/debug only. */
  readonly storageKey: string;
}

export function createFsrsStore(storageKey: string): FsrsStore {
  return {
    storageKey,
    getCardState(id, now = Date.now()) {
      const store = loadStoreAt(storageKey);
      return store[id] ?? emptyState(id, now);
    },
    getAllStates() {
      return loadStoreAt(storageKey);
    },
    recordReview(id, rating, now = Date.now()) {
      const store = loadStoreAt(storageKey);
      const current = store[id] ?? emptyState(id, now);
      const next: RecordLogItem = scheduler.next(toTsCard(current), new Date(now), rating);
      const updated = fromTsCard(id, next.card);
      store[id] = updated;
      saveStoreAt(storageKey, store);
      return updated;
    },
    previewRatings(id, now = Date.now()) {
      const current = this.getCardState(id, now);
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
    },
    reset() {
      if (typeof window === "undefined") return;
      window.localStorage.removeItem(storageKey);
    },
    getDueIds(now = Date.now()) {
      const store = loadStoreAt(storageKey);
      return Object.values(store)
        .filter((s) => s.state !== "new" && s.due <= now)
        .sort((a, b) => a.due - b.due)
        .map((s) => s.id);
    },
  };
}

// ---- flashcard store (the original, kept under its old localStorage key) ----

/** Shared FSRS namespace for FlashCards. */
export const flashcardFsrs = createFsrsStore(FLASHCARD_STORAGE_KEY);

// Backward-compatible function-style exports used across the flashcard UI.
// (These were the only public surface before the refactor.)

export function getCardState(id: string, now: number = Date.now()): CardState {
  return flashcardFsrs.getCardState(id, now);
}

export function getAllStates(): Record<string, CardState> {
  return flashcardFsrs.getAllStates();
}

export function recordReview(
  id: string,
  rating: ReviewRating,
  now: number = Date.now(),
): CardState {
  return flashcardFsrs.recordReview(id, rating, now);
}

export function previewRatings(id: string, now: number = Date.now()): RatingPreview[] {
  return flashcardFsrs.previewRatings(id, now);
}

// ---- queue helpers (flashcard-specific; preserved for cards.tsx) ----

/** Cards due now or earlier, sorted oldest-due first. Excludes brand-new cards. */
export function getDueCards(cards: FlashCard[], now: number = Date.now(), limit?: number): FlashCard[] {
  const store = flashcardFsrs.getAllStates();
  const due = cards
    .map((c) => ({ card: c, state: store[c.id] }))
    .filter((x) => x.state && x.state.state !== "new" && x.state.due <= now)
    .sort((a, b) => (a.state!.due - b.state!.due))
    .map((x) => x.card);
  return limit != null ? due.slice(0, limit) : due;
}

/** Cards never reviewed yet. Order matches input. */
export function getNewCards(cards: FlashCard[], limit?: number): FlashCard[] {
  const store = flashcardFsrs.getAllStates();
  const fresh = cards.filter((c) => !store[c.id] || store[c.id].state === "new");
  return limit != null ? fresh.slice(0, limit) : fresh;
}

/** Cards with state but not currently due — counted as "learned" in the stats. */
export function getLearnedCount(cards: FlashCard[], now: number = Date.now()): number {
  const store = flashcardFsrs.getAllStates();
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

/** Wipe all flashcard FSRS state. Used by the reset button. */
export function resetFsrs(): void {
  flashcardFsrs.reset();
}

// Re-export Rating so consumers don't need a second ts-fsrs import.
export { Rating };
