import { useSyncExternalStore } from "react";

const PINNED_KEY = "sql-practice-pinned-subjects";
const LAST_VISITED_KEY = "sql-practice-last-subject";
const EVENT = "sql-practice-user-subjects-change";

const EMPTY: string[] = [];
let pinnedCache: { raw: string | null; value: string[] } = { raw: null, value: EMPTY };
let lastVisitedCache: {
  raw: string | null;
  value: { slug: string; at: number } | null;
} = { raw: null, value: null };

function readPinned(): string[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.localStorage.getItem(PINNED_KEY);
  if (raw === pinnedCache.raw) return pinnedCache.value;
  let value: string[] = EMPTY;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        value = parsed.filter((v): v is string => typeof v === "string");
      }
    } catch {
      value = EMPTY;
    }
  }
  pinnedCache = { raw, value };
  return value;
}

function writePinned(slugs: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PINNED_KEY, JSON.stringify(slugs));
  window.dispatchEvent(new CustomEvent(EVENT));
}

function readLastVisited(): { slug: string; at: number } | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(LAST_VISITED_KEY);
  if (raw === lastVisitedCache.raw) return lastVisitedCache.value;
  let value: { slug: string; at: number } | null = null;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.slug === "string" && typeof parsed.at === "number") {
        value = { slug: parsed.slug, at: parsed.at };
      }
    } catch {
      value = null;
    }
  }
  lastVisitedCache = { raw, value };
  return value;
}

export function pinSubject(slug: string) {
  const current = readPinned();
  if (current.includes(slug)) return;
  writePinned([...current, slug]);
}

export function unpinSubject(slug: string) {
  const current = readPinned();
  if (!current.includes(slug)) return;
  writePinned(current.filter((s) => s !== slug));
}

export function toggleSubject(slug: string) {
  const current = readPinned();
  if (current.includes(slug)) {
    writePinned(current.filter((s) => s !== slug));
  } else {
    writePinned([...current, slug]);
  }
}

export function isPinned(slug: string): boolean {
  return readPinned().includes(slug);
}

export function recordVisit(slug: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_VISITED_KEY, JSON.stringify({ slug, at: Date.now() }));
  window.dispatchEvent(new CustomEvent(EVENT));
}

function subscribe(cb: () => void) {
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

// Server-snapshots må være referansestabile — React advarer ("should be
// cached") og kan ende i evig re-render hvis de returnerer nytt objekt per kall.
const serverPinned = () => EMPTY;
const serverLastVisited = () => null;

export function usePinnedSubjects(): string[] {
  return useSyncExternalStore(subscribe, readPinned, serverPinned);
}

export function useLastVisitedSubject(): { slug: string; at: number } | null {
  return useSyncExternalStore(subscribe, readLastVisited, serverLastVisited);
}
