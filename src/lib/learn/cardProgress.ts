// Lightweight localStorage-backed tracking for flashcard self-grading.
// Stores per-card "known" or "unknown" state plus simple deck stats.

import { awardXP } from "@/lib/progress/xp";

const KEY = "sql-practice-cards-v1";
const XP_PER_CARD = 2;

export interface CardProgress {
  known: Record<string, true>;
  unknown: Record<string, true>;
  /** ISO timestamps of recent reviews — kept short for streak/last-seen UI. */
  lastSeen: Record<string, string>;
}

const EMPTY: CardProgress = { known: {}, unknown: {}, lastSeen: {} };

export function loadCardProgress(): CardProgress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return EMPTY;
  }
}

function save(p: CardProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(p));
}

export function markKnown(id: string): CardProgress {
  const p = loadCardProgress();
  const wasNew = !p.known[id];
  p.known[id] = true;
  delete p.unknown[id];
  p.lastSeen[id] = new Date().toISOString();
  save(p);
  // Award unified XP only on the first time a card flips to known.
  // The dedup-key in xp.ts also gates this, but we avoid the call when
  // we already know it's a repeat to keep the storage write count down.
  if (wasNew) {
    awardXP("card", `card-${id}`, XP_PER_CARD);
  }
  return p;
}

export function markUnknown(id: string): CardProgress {
  const p = loadCardProgress();
  p.unknown[id] = true;
  delete p.known[id];
  p.lastSeen[id] = new Date().toISOString();
  save(p);
  return p;
}

export function resetCards(): CardProgress {
  save(EMPTY);
  return EMPTY;
}
