// core/checks — konsept-sjekkene, samlet fra én fil per fag.
//
// Delt opp per fag med vilje: flere agenter/sesjoner skriver sjekker
// parallelt, og én delt fil ville gitt nøyaktig de merge-kollisjonene dette
// repoet har mistet arbeid til før. Hver fag-fil eies av én om gangen;
// denne indeksen slår dem sammen og røres normalt ikke.

import type { KonseptSjekkDef } from "./types";
import { TEK1_CHECKS } from "./tek1";
import { DTE2507_CHECKS } from "./dte2507";
import { DTE2505_CHECKS } from "./dte2505";
import { DTE2602_CHECKS } from "./dte2602";

export type { KonseptSjekkDef, SjekkFlervalg, SjekkSporsmal, SjekkTall, SjekkValg } from "./types";

export const CHECKS_BY_LESSON: Record<string, KonseptSjekkDef[]> = {
  ...TEK1_CHECKS,
  ...DTE2507_CHECKS,
  ...DTE2505_CHECKS,
  ...DTE2602_CHECKS,
};
