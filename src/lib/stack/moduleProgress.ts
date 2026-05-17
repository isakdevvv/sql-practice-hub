import { useEffect, useState } from "react";

// Felles kilde til sannhet for "har brukeren sett dette trinnet i en fag-hub-modul"?
// Lagrer en flat Record<trinnSlug, true> i localStorage. Hub-er regner ut progress
// per modul ved å telle hvor mange av modulens trinn-slugs som finnes i settet.
//
// Nøkkelen er versjonert (v1) så vi kan flytte til en rikere struktur senere uten
// å miste data (eller migrere eksplisitt).

const KEY = "stack.visited.v1";
const EVENT = "stack-visited-change";

const EMPTY: Record<string, true> = Object.freeze({}) as Record<string, true>;
let cache: { raw: string | null; value: Record<string, true> } = {
  raw: null,
  value: EMPTY,
};

function readVisited(): Record<string, true> {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.localStorage.getItem(KEY);
  if (raw === cache.raw) return cache.value;
  let value: Record<string, true> = EMPTY;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const next: Record<string, true> = {};
        for (const k of Object.keys(parsed)) {
          if (parsed[k] === true) next[k] = true;
        }
        value = next;
      }
    } catch {
      value = EMPTY;
    }
  }
  cache = { raw, value };
  return value;
}

function writeVisited(next: Record<string, true>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function markTrinnSeen(slug: string): void {
  if (typeof window === "undefined") return;
  if (!slug) return;
  const current = readVisited();
  if (current[slug]) return;
  writeVisited({ ...current, [slug]: true });
}

export function isTrinnSeen(slug: string): boolean {
  return Boolean(readVisited()[slug]);
}

export type ModulStatus = "not-started" | "in-progress" | "done";

export type ModulProgress = {
  seen: number;
  total: number;
  status: ModulStatus;
};

export function computeModulProgress(trinnSlugs: string[]): ModulProgress {
  const total = trinnSlugs.length;
  if (total === 0) return { seen: 0, total: 0, status: "not-started" };
  const visited = readVisited();
  let seen = 0;
  for (const slug of trinnSlugs) {
    if (visited[slug]) seen += 1;
  }
  const status: ModulStatus =
    seen === 0 ? "not-started" : seen >= total ? "done" : "in-progress";
  return { seen, total, status };
}

/**
 * Reaktivt hook for å lese progress for ett modul. Re-renderer når noen
 * trinn-slug markeres som besøkt i localStorage (også fra andre faner).
 *
 * Bruker `useState` + `useEffect` (ikke `useSyncExternalStore`) for å
 * unngå SSR-hydration-mismatch — på server returneres alltid not-started,
 * på klient les fra storage etter mount, og oppdater når storage endres.
 */
export function useModulProgress(trinnSlugs: string[]): ModulProgress {
  const total = trinnSlugs.length;
  const key = trinnSlugs.join("|");
  // Lazy initial state: les fra storage hvis klient, ellers tomt.
  const [progress, setProgress] = useState<ModulProgress>(() =>
    computeModulProgress(trinnSlugs),
  );

  useEffect(() => {
    const update = () => setProgress(computeModulProgress(trinnSlugs));
    update();
    if (typeof window === "undefined") return;
    const handler = () => update();
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return progress;
}

/**
 * Hook for å markere et trinn som besøkt når komponenten mountes.
 * Brukes i `stack.$slug.tsx` for å fange leksjons-visning.
 */
export function useTrinnVisitTracker(slug: string | undefined): void {
  useEffect(() => {
    if (!slug) return;
    markTrinnSeen(slug);
  }, [slug]);
}
