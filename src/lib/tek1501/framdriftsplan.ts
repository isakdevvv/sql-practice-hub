/**
 * TEK-1501 Statistikk — framdriftsplanen fra Canvas, uke for uke.
 *
 * Hentet fra siden «Framdriftsplan TEK-1501 Statistikk» 2026-08-16. Canvas sier
 * selv: «NB! Framdriftsplanen kan endres underveis!» og «Framdriftsplanen er
 * altså omtrentlig og blir ikke å følges eksakt.» Den er likevel den eneste
 * kilden vi har til hvilke *kapitler* faget faktisk bruker — modulinndelingen i
 * appen er bygget på spor A–F fra `plan-tek-1501.md`, ikke på boka.
 *
 * To ting som er verdt å legge merke til før du planlegger lesingen:
 *
 * 1. **Faget underviser kapittel 2 før kapittel 1.** Sannsynlighetsregning
 *    kommer først (uke 34–35), beskrivende statistikk etterpå (uke 36–37).
 *    Appens modul 1 heter «Data» og modul 2 «Sannsynlighet» — altså er det
 *    modul 2 du skal begynne på nå, ikke modul 1.
 * 2. **Kapittel 5 er ikke pensum i det hele tatt**, og fire delkapitler er
 *    utelatt: 1.4, 4.6, 7.9 og 9.5. Se `UTELATT` under.
 *
 * Boka er Kristensen & Wikan, *Sannsynlighetsregning og statistikk for høyere
 * utdanning* (2. utg. 2019). PDF-en er ikke på maskinen — se
 * PLAN-HOST26-MODULER.md §5 — så vi kjenner kapittelnumrene, ikke innholdet i
 * dem utover temaene Canvas oppgir.
 */

/** Modulnummeret i `Tek1501ModulOversikt` som dekker stoffet i uka. */
export type Tek1501Modul = "1" | "2" | "3" | "4" | null;

export interface FramdriftsUke {
  /** ISO-ukenummer, jf. `src/lib/semester/uker.ts`. */
  uke: number;
  /**
   * Kapittelet i boka, slik framdriftsplanen skriver det («2», «8.3»).
   * `null` i repetisjonsukene, som ikke har noe eget kapittel.
   */
  kapittel: string | null;
  /** Temaoverskriften fra framdriftsplanen. */
  tema: string;
  /** Delemnene planen ramser opp. Tom liste i repetisjonsukene. */
  punkter: string[];
  /** Hvilken modul i appen som dekker uka. */
  modul: Tek1501Modul;
  /** Satt der vi ikke kan lese rekkevidden entydig ut av Canvas-tabellen. */
  usikkerhet?: string;
}

/** Delkapitler Canvas eksplisitt holder utenfor pensum. */
export const UTELATT = [
  { hva: "Hele kapittel 5", hvorfor: "Canvas: «Kapittel 5 er ikke pensum.»" },
  { hva: "Kapittel 1.4", hvorfor: "Merket «(ikke 1.4)» i framdriftsplanen." },
  { hva: "Kapittel 4.6", hvorfor: "Merket «(ikke 4.6)» i framdriftsplanen." },
  { hva: "Kapittel 7.9", hvorfor: "Merket «(ikke 7.9)» i framdriftsplanen." },
  { hva: "Kapittel 9.5", hvorfor: "Merket «(ikke 9.5)» i framdriftsplanen." },
] as const;

export const FRAMDRIFTSPLAN: FramdriftsUke[] = [
  {
    uke: 34,
    kapittel: "2",
    tema: "Sannsynlighetsregning",
    punkter: [
      "Mengdelære og Venn-diagram",
      "Uavhengige og avhengige hendelser",
      "Kombinatorikk",
    ],
    modul: "2",
  },
  {
    uke: 35,
    kapittel: "2",
    tema: "Sannsynlighetsregning (forts.)",
    punkter: [],
    modul: "2",
  },
  {
    uke: 36,
    kapittel: "1 (ikke 1.4)",
    tema: "Beskrivende statistikk",
    punkter: ["Sentralmål", "Spredningsmål"],
    modul: "1",
  },
  {
    uke: 37,
    kapittel: "1 (ikke 1.4)",
    tema: "Beskrivende statistikk (forts.)",
    punkter: [],
    modul: "1",
  },
  {
    uke: 38,
    kapittel: "3",
    tema: "Diskrete sannsynlighetsfordelinger",
    punkter: [
      "Stokastiske variabler",
      "Binomisk fordeling",
      "Hypergeometrisk fordeling",
      "Geometrisk fordeling",
      "Poisson-fordeling",
    ],
    modul: "3",
  },
  {
    uke: 39,
    kapittel: "3",
    tema: "Diskrete sannsynlighetsfordelinger (forts.)",
    punkter: [],
    modul: "3",
  },
  {
    uke: 40,
    kapittel: "4 (ikke 4.6)",
    tema: "Kontinuerlige sannsynlighetsfordelinger",
    punkter: [
      "Normalfordelingen",
      "Student t",
      "Kjikvadrat",
      "Uniform fordeling",
      "Eksponentialfordeling",
      "Sentralgrenseteoremet",
    ],
    modul: "3",
  },
  {
    uke: 41,
    kapittel: "4 (ikke 4.6)",
    tema: "Kontinuerlige sannsynlighetsfordelinger (forts.)",
    punkter: [],
    modul: "3",
  },
  {
    uke: 42,
    kapittel: "6",
    tema: "Estimering",
    punkter: ["Estimatorer", "Punktestimering", "Konfidensintervaller"],
    modul: "4",
  },
  {
    uke: 43,
    kapittel: "6",
    tema: "Estimering (forts.)",
    punkter: [],
    modul: "4",
  },
  {
    uke: 44,
    kapittel: "7 (ikke 7.9)",
    tema: "Hypotesetesting",
    punkter: [],
    modul: "4",
  },
  {
    uke: 45,
    kapittel: "7 (ikke 7.9)",
    tema: "Hypotesetesting (forts.)",
    punkter: [],
    modul: "4",
  },
  {
    uke: 46,
    kapittel: "8.3",
    tema: "Krysstabeller",
    punkter: ["Kjikvadrat-tester for uavhengighet"],
    modul: "4",
  },
  {
    uke: 47,
    kapittel: "9 (ikke 9.5)",
    tema: "Lineær regresjon",
    punkter: [],
    modul: "4",
  },
  {
    uke: 48,
    kapittel: "9 (ikke 9.5)",
    tema: "Lineær regresjon (forts.)",
    punkter: [],
    modul: "4",
    usikkerhet:
      "Canvas-tabellen har tom kapittelcelle her, og ordet «Repetisjon» står mellom uke 48 og 49. Alle andre temaer får to uker, så vi leser uke 48 som andre uke på kapittel 9 — men det kan like gjerne være første repetisjonsuke.",
  },
  { uke: 49, kapittel: null, tema: "Repetisjon", punkter: [], modul: null },
  { uke: 50, kapittel: null, tema: "Repetisjon", punkter: [], modul: null },
  {
    uke: 51,
    kapittel: null,
    tema: "Repetisjon — eksamen 14. desember",
    punkter: [],
    modul: null,
  },
];

/** Hva som står på planen i en gitt uke. `undefined` utenfor uke 34–51. */
export function framdriftFor(uke: number): FramdriftsUke | undefined {
  return FRAMDRIFTSPLAN.find((u) => u.uke === uke);
}

/** Ukene en modul i appen dekker, f.eks. modul 2 → [34, 35]. */
export function ukerForModul(modul: Tek1501Modul): number[] {
  return FRAMDRIFTSPLAN.filter((u) => u.modul === modul).map((u) => u.uke);
}

/**
 * Kapitlene en modul i appen dekker, uten «(ikke 4.6)»-tilleggene og uten
 * gjentakelser — f.eks. modul 4 → ["6", "7", "8.3", "9"]. Modulene i appen er
 * temainndelt og spenner derfor over flere kapitler enn ett; en visning som
 * bare tar det første kapittelet lyver om modul 3 og 4.
 */
export function kapitlerForModul(modul: Tek1501Modul): string[] {
  const sett = new Set<string>();
  for (const u of FRAMDRIFTSPLAN) {
    if (u.modul !== modul || !u.kapittel) continue;
    sett.add(u.kapittel.replace(/\s*\(.*\)$/, ""));
  }
  return [...sett];
}

/** «uke 34–35» eller «uke 46» — spennet en modul undervises i. */
export function ukespennForModul(modul: Tek1501Modul): string | null {
  const uker = ukerForModul(modul);
  if (uker.length === 0) return null;
  return uker.length === 1 ? `uke ${uker[0]}` : `uke ${uker[0]}–${uker[uker.length - 1]}`;
}
