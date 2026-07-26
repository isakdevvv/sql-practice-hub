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
//
// phasesForSubject() er den ene kilden til hvilke curriculum-faser et fag
// eier. Alt annet her — og fremdriftstallene i core/subjectProgress.ts og på
// /fag/:slug — bygger på den.
// ---------------------------------------------------------------------------

import { PHASES, phaseOfSlug, type CurriculumPhase } from "@/lib/stack/curriculum";
import { getTrinnBySlug } from "@/lib/stack/content";
import { computeModulProgress, isTrinnSeen } from "@/lib/stack/moduleProgress";

export interface Block {
  slug: string;
  title: string;
  seen: boolean;
}

// Fag som eier faser de ikke står først i. Konvensjonen ellers er at et fag
// er hub for fasen der fagets egen slug er første slug (dte-2505 → os,
// dte-2507 → nettverk osv.). DTE-2509 bryter den: det dekker to faser, og
// begge starter på en leksjon (`er-mapping`, `http-anatomi`) i stedet for på
// fagets slug. Uten denne mappingen ville databaser og web vært faglose —
// ingen klosser i stripen på /fag/dte-2509 og 0 av 0 sider i fremdriften.
const SUBJECT_PHASE_IDS: Record<string, readonly string[]> = {
  "dte-2509": ["database", "web"],
};

/** Curriculum-fasene et fag eier, i studierekkefølge. Tom liste for fag uten
 *  eget løp (og for faser som ikke tilhører noe fag, som `hardware`). */
export function phasesForSubject(subjectSlug: string): CurriculumPhase[] {
  const explicit = SUBJECT_PHASE_IDS[subjectSlug];
  if (explicit) {
    return explicit
      .map((id) => PHASES.find((p) => p.id === id))
      .filter((p): p is CurriculumPhase => !!p)
      .sort((a, b) => a.num - b.num);
  }
  const p = phaseOfSlug(subjectSlug);
  return p && p.slugs[0] === subjectSlug ? [p] : [];
}

/** Alle leksjons-slugs i fagets faser, i studierekkefølge. Inkluderer stubs —
 *  brukes til fremdriftstall, ikke til klosser. */
export function lessonSlugsForSubject(subjectSlug: string): string[] {
  return phasesForSubject(subjectSlug).flatMap((p) => [...p.slugs]);
}

/** Fagets byggeklosser i studierekkefølge, med sett-status. Klossene er
 *  fasenes ready-trinn (stubs og selve hub-siden er ikke klosser). */
export function blocksForSubject(subjectSlug: string): Block[] {
  const out: Block[] = [];
  for (const slug of lessonSlugsForSubject(subjectSlug)) {
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

/** Fasene faget bygger på (curriculum dependsOn), med fremdrift. Faser faget
 *  eier selv utelates — når web bygger på database og begge er DTE-2509, er
 *  database en del av faget, ikke en grunnmur under det. */
export function phaseFoundations(subjectSlug: string): Foundation[] {
  const own = phasesForSubject(subjectSlug);
  const ownIds = new Set(own.map((p) => p.id));
  const out: Foundation[] = [];
  const seenIds = new Set<string>();
  for (const phase of own) {
    for (const depId of phase.dependsOn ?? []) {
      if (ownIds.has(depId) || seenIds.has(depId)) continue;
      const dep = PHASES.find((p) => p.id === depId);
      if (!dep) continue;
      seenIds.add(depId);
      const progress = computeModulProgress([...dep.slugs]);
      out.push({ phase: dep, seen: progress.seen, total: progress.total });
    }
  }
  return out.sort((a, b) => a.phase.num - b.phase.num);
}
