// ---------------------------------------------------------------------------
// core/path.ts — byggeklossene i et fag, og hva de bygger på.
//
// Pedagogikken i appen er progressiv scaffolding: hver leksjon er en kloss
// som bygger på tidligere klosser, og ingenting skal møtes før grunnlaget
// er introdusert. Dataene finnes allerede — curriculum-fasene har
// `dependsOn`-kanter og hvert trinn har `prerequisites` — men de har vært
// nesten usynlige for studenten. Denne fila regner dem om til tre ting
// UI kan vise:
//
//  - blocksForSubject(): fagets klosser i rekkefølge, med sett-status
//  - nextBlockForSubject(): første usette kloss — «fortsett her»
//  - prereqStatus(): en leksjons prerequisites med sett-status
//  - phaseFoundations(): fasene faget bygger på, med fremdrift
// ---------------------------------------------------------------------------

import { PHASES, phaseOfSlug, type CurriculumPhase } from "@/lib/stack/curriculum";
import { getTrinnBySlug } from "@/lib/stack/content";
import { computeModulProgress, isTrinnSeen } from "@/lib/stack/moduleProgress";

export interface Block {
  slug: string;
  title: string;
  seen: boolean;
}

/** Fasen et fag er hub for, eller null. Klossene til et fag er fasens
 *  ready-trinn (stubs og selve hub-siden er ikke klosser). */
function subjectPhase(subjectSlug: string): CurriculumPhase | null {
  const p = phaseOfSlug(subjectSlug);
  return p && p.slugs[0] === subjectSlug ? p : null;
}

/** Fagets byggeklosser i studierekkefølge, med sett-status. */
export function blocksForSubject(subjectSlug: string): Block[] {
  const phase = subjectPhase(subjectSlug);
  if (!phase) return [];
  const out: Block[] = [];
  for (const slug of phase.slugs) {
    if (slug === subjectSlug) continue; // hub-siden er ikke en kloss
    const trinn = getTrinnBySlug(slug);
    if (!trinn) continue; // stub eller uregistrert
    out.push({ slug, title: trinn.title, seen: isTrinnSeen(slug) });
  }
  return out;
}

/** Første usette kloss i faget — «fortsett her». Null når alt er sett
 *  (eller faget ikke har et løp). */
export function nextBlockForSubject(
  subjectSlug: string,
): { block: Block; index: number; total: number } | null {
  const blocks = blocksForSubject(subjectSlug);
  const idx = blocks.findIndex((b) => !b.seen);
  if (idx === -1) return null;
  return { block: blocks[idx], index: idx, total: blocks.length };
}

/** En leksjons prerequisites med sett-status. Tom liste = ingen prereqs
 *  registrert. Kun ready-trinn tas med (stubs kan ikke besøkes). */
export function prereqStatus(slug: string): Block[] {
  const trinn = getTrinnBySlug(slug);
  if (!trinn) return [];
  const out: Block[] = [];
  for (const p of trinn.prerequisites) {
    if (!getTrinnBySlug(p.slug)) continue;
    out.push({ slug: p.slug, title: p.title, seen: isTrinnSeen(p.slug) });
  }
  return out;
}

export interface Foundation {
  phase: CurriculumPhase;
  seen: number;
  total: number;
}

/** Fasene faget bygger på (curriculum dependsOn), med fremdrift. */
export function phaseFoundations(subjectSlug: string): Foundation[] {
  const phase = subjectPhase(subjectSlug);
  if (!phase || !phase.dependsOn || phase.dependsOn.length === 0) return [];
  const out: Foundation[] = [];
  for (const depId of phase.dependsOn) {
    const dep = PHASES.find((p) => p.id === depId);
    if (!dep) continue;
    const progress = computeModulProgress([...dep.slugs]);
    out.push({ phase: dep, seen: progress.seen, total: progress.total });
  }
  return out;
}
