// Dato-håndtering for eksamener i catalog.ts.
//
// To kilder: den strukturerte `events`-lista (presis — fra oppmeldingen) og
// den menneske-skrevne `eksamen`-strengen (fallback for fag uten events).
// Strengene varierer:
//   "14.12.2026 — 3t skriftlig"
//   "Hjemmeeksamen + mappe (3t × 2)"   — ingen entydig dato
// Parseren henter ut første "dd.mm.yyyy" hvis den finnes, og returnerer
// null for typen uten tradisjonell dato.

import type { ExamEvent } from "./catalog";

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

/** Tidspunktet en eksamenshendelse faktisk er over: innleveringsfrist der
 *  den finnes, ellers start + varighet, ellers slutten av dagen. */
export function examEventEnd(ev: ExamEvent): Date {
  const [y, m, d] = ev.date.split("-").map(Number);
  if (ev.deadline) {
    const [hh, mm] = ev.deadline.split(":").map(Number);
    return new Date(y, m - 1, d, hh, mm);
  }
  if (ev.start) {
    const [hh, mm] = ev.start.split(":").map(Number);
    return new Date(y, m - 1, d, hh + (ev.hours ?? 0), mm);
  }
  return new Date(y, m - 1, d, 23, 59);
}

/** Første hendelse som ikke er over ennå. Null når alle er passert. */
export function nextExamEvent(
  events: ExamEvent[] | undefined,
  now: Date = new Date(),
): ExamEvent | null {
  if (!events || events.length === 0) return null;
  return (
    events
      .map((ev) => ({ ev, end: examEventEnd(ev) }))
      .filter((x) => x.end.getTime() >= now.getTime())
      .sort((a, b) => a.end.getTime() - b.end.getTime())[0]?.ev ?? null
  );
}

/** «fre 30. nov · 09:00 (2t) · Bodø» — kompakt linje for én hendelse. */
export function formatExamEvent(ev: ExamEvent): string {
  const [y, m, d] = ev.date.split("-").map(Number);
  const dato = new Date(y, m - 1, d).toLocaleDateString("nb-NO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const bits: string[] = [dato];
  if (ev.start) bits.push(ev.hours ? `${ev.start} (${ev.hours}t)` : ev.start);
  else if (ev.hours) bits.push(`${ev.hours}t`);
  if (ev.deadline) bits.push(`frist ${ev.deadline}`);
  if (ev.campus) bits.push(ev.campus);
  return bits.join(" · ");
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
