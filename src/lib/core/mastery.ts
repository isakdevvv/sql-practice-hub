// ---------------------------------------------------------------------------
// core/mastery.ts — «har brukeren forstått dette?», ikke bare «har hen sett det».
//
// Fram til nå har fremdrift betydd at siden ble åpnet: `markTrinnSeen` kalles
// på mount, så kloss-stripa ble grønn av å scrolle forbi. Denne modulen gir
// det sterkere begrepet: en seksjon er *mestret* først når konsept-sjekken er
// besvart riktig.
//
// Lagringen er med vilje den samme som den eksisterende SectionQuiz allerede
// skriver til (`sql-practice-course-mastered-v1:<leksjon>` → liste med
// seksjons-id-er), slik at ingen mister fremgang de alt har opparbeidet.
// ---------------------------------------------------------------------------

import { CHECKS_BY_LESSON } from "./checks";

const PREFIX = "sql-practice-course-mastered-v1:";
const EVENT = "course-mastered-changed";

export function masteredSections(lessonSlug: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(PREFIX + lessonSlug);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function markSectionMastered(lessonSlug: string, sectionId: string): void {
  if (typeof window === "undefined") return;
  const set = masteredSections(lessonSlug);
  if (set.has(sectionId)) return;
  set.add(sectionId);
  try {
    window.localStorage.setItem(PREFIX + lessonSlug, JSON.stringify([...set]));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { courseId: lessonSlug } }));
  } catch {
    // quota o.l. — ignorer
  }
}

export function isSectionMastered(lessonSlug: string, sectionId: string): boolean {
  return masteredSections(lessonSlug).has(sectionId);
}

/** Hvor mange av leksjonens konsept-sjekker som er bestått. */
export function lessonMastery(lessonSlug: string): { bestatt: number; totalt: number } {
  const kreves = CHECKS_BY_LESSON[lessonSlug] ?? [];
  if (kreves.length === 0) return { bestatt: 0, totalt: 0 };
  const set = masteredSections(lessonSlug);
  return { bestatt: kreves.filter((c) => set.has(c.id)).length, totalt: kreves.length };
}

/**
 * Er leksjonen mestret? Leksjoner uten registrerte sjekker returnerer `true`
 * — vi kan ikke kreve at noen består en prøve som ikke finnes, og de skal
 * derfor heller ikke sperre veien videre.
 */
export function isLessonMastered(lessonSlug: string): boolean {
  const { bestatt, totalt } = lessonMastery(lessonSlug);
  return totalt === 0 || bestatt === totalt;
}

/** Har leksjonen i det hele tatt sjekker? Styrer om den kan låse noe. */
export function lessonHasChecks(lessonSlug: string): boolean {
  return (CHECKS_BY_LESSON[lessonSlug] ?? []).length > 0;
}

/** Abonner på mestrings-endringer (også fra andre faner). */
export function subscribeMastery(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
