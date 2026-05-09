// Persists the user's in-progress ER model per exercise so:
//   - Refreshing the page keeps their work.
//   - Switching to e2 carries forward what they drew in e1 (via seedFrom).
//   - Coming back later resumes exactly where they left off.
//
// Schema is keyed by exercise id, JSON-serialized. The version suffix in the
// storage key lets us bump if ErModel ever changes shape in a breaking way.

import type { ErModel } from "./types";

const STORAGE_KEY = "er-tegner-progress-v1";

type ProgressMap = Record<string, ErModel>;

function readMap(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(map: ProgressMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // localStorage may be full or disabled — fail silently, in-memory state
    // remains the source of truth for the current session.
  }
}

export function loadExerciseModel(exerciseId: string): ErModel | null {
  const map = readMap();
  return map[exerciseId] ?? null;
}

export function saveExerciseModel(exerciseId: string, model: ErModel): void {
  const map = readMap();
  map[exerciseId] = model;
  writeMap(map);
}

export function clearExerciseModel(exerciseId: string): void {
  const map = readMap();
  if (exerciseId in map) {
    delete map[exerciseId];
    writeMap(map);
  }
}

/** Returns true if the user has any saved state for this exercise. */
export function hasExerciseProgress(exerciseId: string): boolean {
  return loadExerciseModel(exerciseId) !== null;
}
