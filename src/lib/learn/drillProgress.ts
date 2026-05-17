// ---------------------------------------------------------------------------
// drillProgress.ts — lokal progress-tracking for drill-øvinger.
//
// Brukes av `DrillShell` (skriver) og `/drill`-hub-siden (leser for å vise
// "Ikke startet" / "Påbegynt" / "Fullført"-badge per drill-kort).
//
// Lagring: ett localStorage-felt per drill med nøkkel `drill-progress:{id}`.
// JSON-payload matcher `DrillProgress`-typen.
//
// Designprinsipper:
// - Tolerant for storage-feil (Safari private mode, kvote-overskridelse, SSR).
//   Alle operasjoner returnerer null/undefined uten å kaste — siden må fungere
//   selv om vi ikke kan skrive.
// - `setDrillProgress` aksepterer Partial — caller trenger bare oppgi feltene
//   som faktisk endrer seg. Vi merger med eksisterende record (eller bygger
//   en fra defaults hvis den ikke fantes).
// - `started`/`completed` settes som ISO-strings så de er trivielle å
//   serialisere og parse.
// ---------------------------------------------------------------------------

import { awardXP } from "@/lib/progress/xp";

const XP_PER_STEP = 3;

/** Form av lagret payload. `completed` er null før alle steg er fullført. */
export type DrillProgress = {
  /** ISO-timestamp for første interaksjon. */
  started: string;
  /** ISO-timestamp når alle steg ble fullført. Null hvis fortsatt påbegynt. */
  completed: string | null;
  /** Antall steg som er markert done akkurat nå. */
  stepsDone: number;
  /** Total mengde steg i drillet (settes ved første skriving). */
  totalSteps: number;
};

const KEY_PREFIX = "drill-progress:";

function key(id: string): string {
  return `${KEY_PREFIX}${id}`;
}

/**
 * Sjekker om localStorage faktisk er brukbart i runtime. I noen miljøer
 * (SSR, Safari private mode med strenge innstillinger) finnes objektet
 * men kaster på første skriving — vi tester med en kort try/catch.
 */
function hasStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const probe = "__drill_progress_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

/**
 * Les progress for ett drill. Returnerer null hvis ingen record finnes
 * eller hvis lagring er utilgjengelig (private mode, SSR, parse-feil).
 */
export function getDrillProgress(id: string): DrillProgress | null {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(key(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DrillProgress>;
    // Validér minimalt — vi godtar partielt utfylte records og
    // returnerer dem; manglende felter blir undefined og caller har
    // ansvaret. (Vi kan ikke vite hva som er "riktig" totalSteps uten
    // å spørre drillet selv.)
    if (typeof parsed !== "object" || parsed === null) return null;
    return {
      started: typeof parsed.started === "string" ? parsed.started : new Date(0).toISOString(),
      completed: typeof parsed.completed === "string" ? parsed.completed : null,
      stepsDone: typeof parsed.stepsDone === "number" ? parsed.stepsDone : 0,
      totalSteps: typeof parsed.totalSteps === "number" ? parsed.totalSteps : 0,
    };
  } catch {
    return null;
  }
}

/**
 * Skriv (eller oppdater) progress for ett drill. Partial-felter merges inn
 * over eksisterende record. Hvis ingen record finnes opprettes en med
 * default-verdier (started=now, completed=null, stepsDone=0, totalSteps=0)
 * før partialet appliseres.
 *
 * Stille på feil — vi ikke kaster ved kvote-overskridelse eller andre
 * storage-problemer. Konsekvensen er at progress-badgen ikke oppdaterer
 * seg, men drillet selv fortsetter å fungere.
 */
export function setDrillProgress(id: string, progress: Partial<DrillProgress>): void {
  if (!hasStorage()) return;
  try {
    const existing = getDrillProgress(id);
    const nowIso = new Date().toISOString();
    const merged: DrillProgress = {
      started: existing?.started ?? nowIso,
      completed: existing?.completed ?? null,
      stepsDone: existing?.stepsDone ?? 0,
      totalSteps: existing?.totalSteps ?? 0,
      ...progress,
    };
    window.localStorage.setItem(key(id), JSON.stringify(merged));

    // Award unified XP for every step that just crossed from not-done to done.
    // We award per-step (not per-drill) so partial drill completion still
    // contributes XP. Dedup-key includes the step index so re-saves at the
    // same stepsDone never double-award.
    const prevSteps = existing?.stepsDone ?? 0;
    if (merged.stepsDone > prevSteps) {
      for (let step = prevSteps; step < merged.stepsDone; step++) {
        awardXP("drill", `drill-${id}-step-${step}`, XP_PER_STEP);
      }
    }
  } catch {
    // Silent — se docblock over.
  }
}

/**
 * Slett progress-record for ett drill. Brukes når brukeren eksplisitt
 * velger «Start på nytt» og vil at hub-en skal vise "Ikke startet" igjen.
 */
export function clearDrillProgress(id: string): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(key(id));
  } catch {
    // Silent.
  }
}

/**
 * Hjelpe-funksjon for hub-siden — utleder badge-status fra en progress-record.
 * Holdt ut av selve hub-rendringen for å gjøre badge-logikken enhets-testbar
 * senere uten å trenge React-tre.
 */
export type DrillProgressStatus = "not-started" | "in-progress" | "completed";

export function statusFromProgress(p: DrillProgress | null): DrillProgressStatus {
  if (!p) return "not-started";
  if (p.completed) return "completed";
  if (p.stepsDone > 0) return "in-progress";
  // Edge case: vi har en record men stepsDone=0. Behandl som påbegynt fordi
  // bare "started"-skrivingen oppretter record-en i utgangspunktet.
  return "in-progress";
}
