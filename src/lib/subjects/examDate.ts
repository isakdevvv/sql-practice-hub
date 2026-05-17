// Parser for EXAM_META.eksamen-strenger i catalog.ts.
//
// Stringene er menneske-skrevne og varierer:
//   "14.12.2026 (3t skriftlig)"
//   "02.12.2026 (2t skriftlig)"
//   "30.11.2026 (2 × 2t)"
//   "Hjemmeeksamen + mappe (3t × 2)"        — ingen entydig dato
//   "09.12.2026 (3t hjemme) + mappe 16.12"  — to datoer, plukker den første
//
// Parseren henter ut første "dd.mm.yyyy" hvis den finnes, og returnerer
// null for "Hjemmeeksamen + mappe"-typen som ikke har noen tradisjonell dato.

const DATE_RE = /(\d{1,2})\.(\d{1,2})\.(\d{4})/;

/** Returner Date-objektet for første dd.mm.yyyy i strengen, ellers null. */
export function parseExamDate(eksamen: string | undefined): Date | null {
  if (!eksamen) return null;
  const m = eksamen.match(DATE_RE);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  // Måneder i Date er 0-indekserte. Lag dato kl. 23:59 lokal tid så
  // countdown'en regner med at eksamen-dagen er hele dagen ut.
  const d = new Date(year, month - 1, day, 23, 59, 0);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Dager fra `now` til eksamen. Negative hvis eksamen er passert. */
export function daysUntil(eksamenDate: Date, now: Date = new Date()): number {
  const ms = eksamenDate.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export type ExamUrgency = "past" | "urgent" | "soon" | "later" | "no-date";

/**
 * Klassifiser eksamen-urgens basert på dager til eksamen:
 * - past: eksamen er passert
 * - urgent: < 30 dager
 * - soon: < 90 dager
 * - later: ≥ 90 dager
 * - no-date: ingen tradisjonell dato (hjemmeeksamen/mappe)
 */
export function examUrgency(
  eksamen: string | undefined,
  now: Date = new Date(),
): { urgency: ExamUrgency; days: number | null; date: Date | null } {
  const date = parseExamDate(eksamen);
  if (!date) return { urgency: "no-date", days: null, date: null };
  const days = daysUntil(date, now);
  if (days < 0) return { urgency: "past", days, date };
  if (days < 30) return { urgency: "urgent", days, date };
  if (days < 90) return { urgency: "soon", days, date };
  return { urgency: "later", days, date };
}

/** Kort menneskelig "X dager / mnd" for visning. */
export function formatDaysUntil(days: number): string {
  if (days < 0) return "Passert";
  if (days === 0) return "I dag";
  if (days === 1) return "I morgen";
  if (days < 30) return `${days} dager`;
  if (days < 60) return `~${Math.round(days / 7)} uker`;
  const months = Math.round(days / 30);
  return `~${months} mnd`;
}
