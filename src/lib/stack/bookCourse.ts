// Generisk modell for "bok-som-kurs" — en linær gjennomgang av en lærebok
// kapittel for kapittel, med våre egne definisjoner, illustrasjoner, eksempler
// og oppgaver. INGEN tekst eller figurer er kopiert fra kildeboka — alt er
// skrevet på nytt i våre egne ord.

import type React from "react";

export type BookDef = {
  /** Termen vi forklarer. */
  term: string;
  /** Vår egen forklaring, 1-3 setninger. */
  body: React.ReactNode;
};

export type BookExample = {
  title: string;
  body: React.ReactNode;
};

export type BookExercise = {
  question: React.ReactNode;
  /** Valgfritt løsnings-hint som kan vises på klikk. */
  hint?: React.ReactNode;
  /** Valgfritt svar som kan vises på klikk. */
  answer?: React.ReactNode;
};

export type BookSection = {
  /** F.eks. "1.1", "1.2", "3.5.2". */
  num: string;
  title: string;
  /** Innledning, 1-3 setninger. */
  intro: React.ReactNode;
  definitions?: BookDef[];
  /** SVG-illustrasjoner som er våre egne tegninger av konseptet. */
  illustrations?: { caption: string; svg: React.FC }[];
  examples?: BookExample[];
  exercises?: BookExercise[];
  /** Slugs av eksisterende /stack-sider som dekker dette tema. */
  relatedSlugs?: string[];
};

export type BookChapter = {
  num: number;
  /** Slug for /stack/<slug>. */
  slug: string;
  title: string;
  /** Kort en-setning summary av kapittelet. */
  oneLiner: string;
  /** Hva man lærer (kort liste). */
  learningObjectives?: string[];
  /** Lengre intro før seksjonene. Valgfri. */
  intro?: React.ReactNode;
  sections: BookSection[];
  /** Slugs av eksisterende /stack-sider for hele kapittelet. */
  relatedSlugs?: string[];
};

export type BookCourse = {
  slug: string;
  title: string;
  author: string;
  edition: string;
  /** Vår beskrivelse av boken og hvorfor man tar dette kurset. */
  blurb: string;
  /** Hvilket UiT-fag boken brukes i, hvis aktuelt. */
  subjectSlug?: string;
  chapters: BookChapter[];
};

// localStorage-key for "kapittel sett som ferdig"-progress. Generisk per bok.
export function bookProgressKey(bookSlug: string): string {
  return `book-course-progress-v1:${bookSlug}`;
}

export function loadBookProgress(bookSlug: string): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(bookProgressKey(bookSlug));
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function saveBookProgress(bookSlug: string, done: Set<number>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(bookProgressKey(bookSlug), JSON.stringify([...done]));
  // Trigger storage-event for andre tabs/komponenter
  window.dispatchEvent(new StorageEvent("storage", { key: bookProgressKey(bookSlug) }));
}
