/**
 * Repetisjonsplanleggeren for recall-kortene i DTE-2507 Lag 0.
 *
 * Ligger i egen fil for å holde `skjelettEngine.ts` fri for localStorage, slik
 * at all regne- og protokoll-logikken der kan etterprøves fra kommandolinja
 * uten et nettleser-miljø.
 *
 * Eget navnerom akkurat som DTE-2505-modulen: det gir ekte intervaller uten å
 * røre den globale kortlista, som fortsatt er et åpent punkt (§3.4 i
 * PLAN-HOST26-MODULER.md — alle moduler skal til slutt dele én kø).
 */

import { createFsrsStore } from "@/lib/learn/fsrs";

export const skjelettFsrs = createFsrsStore("dte2507-skjelett-fsrs-v1");
