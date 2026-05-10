// localStorage-tracking av løste Python-oppgaver + opptjent XP.
// Mønstret etter joinProgress, men med XP-felt så studenten ser fremgang.

const KEY = "sql-practice-py-v1";
const XP_PER_SOLVE = 10;

export interface PyProgress {
  solved: Record<string, true>;
  lastSeen: Record<string, string>;
  xp: number;
}

const EMPTY: PyProgress = { solved: {}, lastSeen: {}, xp: 0 };

export function loadPyProgress(): PyProgress {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY };
  }
}

function save(p: PyProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(p));
}

/** Returns { progress, xpEarned } where xpEarned is 0 if already solved. */
export function markPySolved(id: string): { progress: PyProgress; xpEarned: number } {
  const p = loadPyProgress();
  const wasNew = !p.solved[id];
  p.solved[id] = true;
  p.lastSeen[id] = new Date().toISOString();
  if (wasNew) p.xp += XP_PER_SOLVE;
  save(p);
  return { progress: p, xpEarned: wasNew ? XP_PER_SOLVE : 0 };
}

export function resetPyProgress(): PyProgress {
  save({ ...EMPTY });
  return { ...EMPTY };
}
