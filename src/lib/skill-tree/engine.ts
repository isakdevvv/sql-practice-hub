/**
 * Skill-tree engine — STUB.
 *
 * Andre agenter eier den fulle engine-implementasjonen. Diagnosen kaller
 * `seedFromDiagnose(answers)` ved fullføring, og denne stubben skriver
 * resultatet til localStorage på en stabil nøkkel som engine-agenten kan lese.
 *
 * Hvis deres versjon eksisterer ved merge, vinner deres versjon. Stubben her
 * lar diagnose-route bygge og fungere isolert.
 */

import type { SkillArea } from "./skills";

export interface DiagnoseAnswer {
  questionId: string;
  /** Skills som ble testet av spørsmålet. */
  skills: string[];
  /** Vanskelighetsgrad 1-5. */
  difficulty: number;
  /** Var svaret riktig? */
  correct: boolean;
  /** Brukeren hoppet over — telles som feil men med lav confidence. */
  skipped: boolean;
  /** Millisekunder brukt. Bare telemetri. */
  timeMs: number;
}

export interface DiagnoseResult {
  /** Per skill: rating 0-100 og antall observasjoner. */
  skillRatings: Record<string, { rating: number; observations: number }>;
  /** Per fag-område: aggregert rating 0-100. */
  areaRatings: Record<SkillArea, { rating: number; observations: number }>;
  /** ISO-timestamp for når diagnosen ble tatt. */
  takenAt: string;
}

const STORAGE_KEY = "sql-practice-hub:skill-tree:diagnose";

/**
 * Lagrer rå svar + utledede ratings til localStorage. Engine-agenten
 * leser samme nøkkel og bruker det som seed for det adaptive systemet.
 */
export function seedFromDiagnose(
  answers: DiagnoseAnswer[],
  result: DiagnoseResult,
): void {
  if (typeof window === "undefined") return;
  try {
    const payload = {
      version: 1,
      answers,
      result,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage kan være utilgjengelig (privat modus etc.) — feiler stille.
  }
}

export function loadDiagnoseSeed(): {
  answers: DiagnoseAnswer[];
  result: DiagnoseResult;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1) return null;
    return { answers: parsed.answers, result: parsed.result };
  } catch {
    return null;
  }
}
