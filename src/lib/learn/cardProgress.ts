// Lightweight localStorage-backed tracking for flashcard self-grading.
// Stores per-card "known" or "unknown" state plus simple deck stats.

const KEY = "sql-practice-cards-v1";

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
  p.known[id] = true;
  delete p.unknown[id];
  p.lastSeen[id] = new Date().toISOString();
  save(p);
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
