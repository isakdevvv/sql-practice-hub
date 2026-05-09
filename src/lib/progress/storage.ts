import type { Problem } from "../problems/types";

const STORAGE_KEY = "sql-practice-progress-v1";

export interface ProblemAttempt {
  solved: boolean;
  attempts: number;
  hintsUsed: number;
  solvedAt?: string; // ISO date
  timeMs?: number;
  xpEarned?: number;
}

export interface Progress {
  attempts: Record<string, ProblemAttempt>;
  xp: number;
  streak: number;
  lastActiveDate?: string; // YYYY-MM-DD
  achievements: string[];
}

const EMPTY: Progress = {
  attempts: {},
  xp: 0,
  streak: 0,
  achievements: [],
};

export function loadProgress(): Progress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as Progress) };
  } catch {
    return EMPTY;
  }
}

export function saveProgress(p: Progress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

// Must match STORAGE_DRAFTS in routes/practice.tsx — the practice editor saves
// drafts here, and import/export in this file must read/write the same key or
// users lose their drafts when moving progress between devices.
const DRAFTS_KEY = "sql-practice-drafts-v2";
const LAST_ID_KEY = "sql-practice-last-id";

export interface ExportBundle {
  version: 1;
  exportedAt: string;
  progress: Progress;
  drafts: Record<string, string>;
  lastId: string | null;
}

export function exportToJson(): string {
  const drafts = (() => {
    try {
      return JSON.parse(window.localStorage.getItem(DRAFTS_KEY) ?? "{}");
    } catch {
      return {};
    }
  })();
  const bundle: ExportBundle = {
    version: 1,
    exportedAt: new Date().toISOString(),
    progress: loadProgress(),
    drafts,
    lastId: window.localStorage.getItem(LAST_ID_KEY),
  };
  return JSON.stringify(bundle, null, 2);
}

export function downloadProgressJson() {
  const json = exportToJson();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  a.href = url;
  a.download = `sql-practice-progress-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function importFromJson(text: string): { ok: true } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "File is not valid JSON." };
  }
  if (!parsed || typeof parsed !== "object") {
    return { ok: false, error: "JSON root must be an object." };
  }
  const b = parsed as Partial<ExportBundle>;
  if (!b.progress || typeof b.progress !== "object") {
    return { ok: false, error: "Missing 'progress' object." };
  }
  saveProgress({ ...EMPTY, ...b.progress });
  if (b.drafts && typeof b.drafts === "object") {
    window.localStorage.setItem(DRAFTS_KEY, JSON.stringify(b.drafts));
  }
  if (typeof b.lastId === "string") {
    window.localStorage.setItem(LAST_ID_KEY, b.lastId);
  }
  return { ok: true };
}

export function levelFromXP(xp: number): number {
  // Each level = +100 xp
  return Math.floor(xp / 100) + 1;
}

export function xpToNextLevel(xp: number): { current: number; needed: number } {
  const lvl = levelFromXP(xp);
  const base = (lvl - 1) * 100;
  return { current: xp - base, needed: 100 };
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00Z").getTime();
  const db = new Date(b + "T00:00:00Z").getTime();
  return Math.round((db - da) / 86400000);
}

export function recordAttempt(
  problem: Problem,
  outcome: { correct: boolean; hintsUsed: number; timeMs: number },
): { progress: Progress; xpEarned: number; newAchievements: string[] } {
  const progress = loadProgress();
  const prev = progress.attempts[problem.id] ?? {
    solved: false,
    attempts: 0,
    hintsUsed: 0,
  };
  const newAttempts = prev.attempts + 1;

  let xpEarned = 0;
  const newAchievements: string[] = [];

  if (outcome.correct && !prev.solved) {
    let base = problem.level * 10 || 5;
    if (newAttempts === 1) base *= 1.5;
    if (outcome.timeMs < problem.estimated_time_min * 60 * 1000) base *= 1.2;
    xpEarned = Math.round(base);

    progress.xp += xpEarned;

    progress.attempts[problem.id] = {
      solved: true,
      attempts: newAttempts,
      hintsUsed: outcome.hintsUsed,
      solvedAt: new Date().toISOString(),
      timeMs: outcome.timeMs,
      xpEarned,
    };

    // Streak
    const today = todayStr();
    if (!progress.lastActiveDate) {
      progress.streak = 1;
    } else {
      const diff = daysBetween(progress.lastActiveDate, today);
      if (diff === 0) {
        // same day, no change
      } else if (diff === 1) {
        progress.streak += 1;
      } else {
        progress.streak = 1;
      }
    }
    progress.lastActiveDate = today;

    // Achievements
    const solvedCount = Object.values(progress.attempts).filter((a) => a.solved).length;
    const tryAdd = (name: string, cond: boolean) => {
      if (cond && !progress.achievements.includes(name)) {
        progress.achievements.push(name);
        newAchievements.push(name);
      }
    };
    tryAdd("First Query", solvedCount >= 1);
    tryAdd("10 Solved", solvedCount >= 10);
    tryAdd("25 Solved", solvedCount >= 25);
    tryAdd("No-Hint Solve", outcome.hintsUsed === 0);
    tryAdd(
      "JOIN Master",
      problem.topics.some((t) => t.toUpperCase().includes("JOIN")) &&
        Object.entries(progress.attempts).filter(
          ([, a]) => a.solved,
        ).length >= 5,
    );
    tryAdd("7-Day Streak", progress.streak >= 7);
  } else {
    progress.attempts[problem.id] = {
      ...prev,
      attempts: newAttempts,
      hintsUsed: Math.max(prev.hintsUsed, outcome.hintsUsed),
    };
  }

  saveProgress(progress);
  return { progress, xpEarned, newAchievements };
}

export function recordHintUsed(problemId: string) {
  const progress = loadProgress();
  const prev = progress.attempts[problemId] ?? {
    solved: false,
    attempts: 0,
    hintsUsed: 0,
  };
  progress.attempts[problemId] = { ...prev, hintsUsed: prev.hintsUsed + 1 };
  saveProgress(progress);
}

export function topicMastery(progress: Progress, allProblems: Problem[]) {
  const counts: Record<string, { solved: number; total: number }> = {};
  for (const p of allProblems) {
    for (const t of p.topics) {
      const key = t.toUpperCase();
      if (!counts[key]) counts[key] = { solved: 0, total: 0 };
      counts[key].total += 1;
      if (progress.attempts[p.id]?.solved) counts[key].solved += 1;
    }
  }
  return counts;
}
