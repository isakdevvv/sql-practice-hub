/**
 * Undervisningsukene høsten 2026, som ISO-uker.
 *
 * Alt som skal vises «uke for uke» i appen — TEK-1501s framdriftsplan,
 * DTE-2505s modulåpninger, obligfrister, eksamensdatoene — regnes om til
 * ukenummer her. Ellers ender vi med fire ulike ukekalendere som er uenige.
 *
 * Anker: ISO-uke 34 i 2026 begynner mandag 17. august. (2026-01-01 er en
 * torsdag, så ISO-uke 1 starter mandag 2025-12-29, og uke 34 ligger 33 uker
 * senere.) Alle datoer regnes i UTC — sommertid slutter 25.10.2026, og
 * lokal tidssone ville gitt en times drift midt i semesteret.
 */

/** Første undervisningsuke i høstsemesteret. */
export const FORSTE_UKE = 34;
/** Siste uke vi planlegger for — eksamensuka i TEK-1501. */
export const SISTE_UKE = 51;

const UKE_34_MANDAG_UTC = Date.UTC(2026, 7, 17);
const DOGN = 86_400_000;

export interface Uke {
  /** ISO-ukenummer. */
  nr: number;
  /** Mandagen i uka, ISO-dato. */
  mandag: string;
  /** Søndagen i uka, ISO-dato. */
  sondag: string;
}

function isoDato(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Mandagen i en gitt ISO-uke i 2026, som millisekunder siden epoke (UTC). */
function mandagMs(uke: number): number {
  return UKE_34_MANDAG_UTC + (uke - FORSTE_UKE) * 7 * DOGN;
}

/** Alle undervisningsukene, uke 34 til og med uke 51. */
export const SEMESTERUKER: Uke[] = Array.from(
  { length: SISTE_UKE - FORSTE_UKE + 1 },
  (_, i): Uke => {
    const nr = FORSTE_UKE + i;
    const ms = mandagMs(nr);
    return { nr, mandag: isoDato(ms), sondag: isoDato(ms + 6 * DOGN) };
  },
);

/**
 * Hvilken undervisningsuke en ISO-dato faller i. `null` når datoen ligger
 * utenfor semesteret — da skal kalleren si det, ikke gjette nærmeste uke.
 */
export function ukeFor(iso: string): number | null {
  const ms = Date.parse(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(ms)) return null;
  const uke = FORSTE_UKE + Math.floor((ms - UKE_34_MANDAG_UTC) / (7 * DOGN));
  return uke >= FORSTE_UKE && uke <= SISTE_UKE ? uke : null;
}

/** Uka vi er i nå, eller `null` utenfor semesteret. */
export function naavaerendeUke(naa: Date = new Date()): number | null {
  const iso = `${naa.getFullYear()}-${String(naa.getMonth() + 1).padStart(2, "0")}-${String(naa.getDate()).padStart(2, "0")}`;
  return ukeFor(iso);
}

/** «17.08–23.08» — datospennet i en uke, til visning. */
export function ukeSpenn(uke: Uke): string {
  const kort = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;
  return `${kort(uke.mandag)}–${kort(uke.sondag)}`;
}
