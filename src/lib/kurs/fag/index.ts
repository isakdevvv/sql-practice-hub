// Barrel for alle skjerm-baserte fag. Innholdsagenter eier denne mappa:
// legg fila di som `src/lib/kurs/fag/<slug>.tsx` og eksportér den herfra.
// `registry.ts` plukker opp alt som ligger i FAG uten flere endringer.

import type { Fag } from "../types";
import { dte2505 } from "./dte-2505";
import { dte2507 } from "./dte-2507";

export const FAG: readonly Fag[] = [dte2505, dte2507];
