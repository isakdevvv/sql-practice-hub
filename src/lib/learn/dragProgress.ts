// Persisted progress for drag-oppgaver (match, order, fill, crowsfoot, quiz).
// Each exercise gives a fixed XP on the FIRST correct check. Re-solving the
// same one doesn't add XP, so progress reflects unique completions.

const KEY = "sql-practice-drag-v1";
const XP_PER_SOLVE = 5;

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
 *  call earned (0 if it was already solved). */
export function markDragSolved(id: string): { progress: DragProgress; xpEarned: number } {
  const p = loadDragProgress();
  const wasNew = !p.solved[id];
  p.solved[id] = true;
  p.lastSeen[id] = new Date().toISOString();
  if (wasNew) p.xp += XP_PER_SOLVE;
  save(p);
  return { progress: p, xpEarned: wasNew ? XP_PER_SOLVE : 0 };
}

export function resetDragProgress(): DragProgress {
  save({ ...EMPTY });
  return { ...EMPTY };
}

export { XP_PER_SOLVE as DRAG_XP_PER_SOLVE };
