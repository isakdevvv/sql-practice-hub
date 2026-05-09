// localStorage-backed tracking for which JOIN exercises the user has solved
// in quiz mode. Mirrors the shape of cardProgress but trimmed down.

const KEY = "sql-practice-joins-v1";

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

export function markJoinSolved(id: string): JoinProgress {
  const p = loadJoinProgress();
  p.solved[id] = true;
  p.lastSeen[id] = new Date().toISOString();
  save(p);
  return p;
}

export function resetJoinProgress(): JoinProgress {
  save(EMPTY);
  return EMPTY;
}
