// Oppslag mot skjerm-kursene. Ingen fag er hardkodet her — alt kommer fra
// `fag/index.ts`, som innholdsagentene eier.

import { FAG } from "./fag";
import { finnUndertema, undertemaerIFag, type Fag, type Undertema, type Emne } from "./types";

export const FAG_BY_SLUG: Record<string, Fag> = Object.fromEntries(
  FAG.map((f) => [f.slug, f]),
);

export function fagBySlug(slug: string): Fag | null {
  return FAG_BY_SLUG[slug] ?? null;
}

/** Finn undertema på tvers av alle fag — brukes av søk og av dyplenker
 *  der vi bare har undertema-slugen. */
export function slaOppUndertema(
  fagSlug: string,
  undertemaSlug: string,
): { fag: Fag; emne: Emne; undertema: Undertema } | null {
  const fag = fagBySlug(fagSlug);
  if (!fag) return null;
  const treff = finnUndertema(fag, undertemaSlug);
  return treff ? { fag, ...treff } : null;
}

/** Neste undertema i faget etter dette, i pensumrekkefølge. null på slutten. */
export function nesteUndertema(fagSlug: string, undertemaSlug: string): Undertema | null {
  const fag = fagBySlug(fagSlug);
  if (!fag) return null;
  const alle = undertemaerIFag(fag);
  const i = alle.findIndex((u) => u.slug === undertemaSlug);
  if (i < 0 || i + 1 >= alle.length) return null;
  return alle[i + 1];
}

export { FAG };
