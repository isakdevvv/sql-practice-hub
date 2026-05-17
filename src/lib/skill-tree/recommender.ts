// Anbefalings-system for ferdighets-treet.
//
// Kombinerer tre signaler fra engine + skills-grafen og returnerer en
// kort, prioritert liste over "hva bør jeg gjøre nå?" — med konkrete
// CTA-er (rute + tekst) som UI kan render uten å vite mer om treet.
//
// Logikk:
//  1. Hvis brukeren ikke har tatt diagnose-pretesten → returnér én enkelt
//     "diagnose-first"-anbefaling med høyest mulig score. Alt annet kan
//     vente til vi vet noe om kunnskapsnivået.
//  2. Ellers, slå sammen:
//      - getNextUnlocked()  (typisk høy score, 0.70–0.85)
//      - getRustyConcepts() (medium, 0.55–0.65)
//      - "weak-spots" (skills under MASTERY_WEAK med lav confidence, 0.40–0.55)
//  3. Diversifiser: maks 2 anbefalinger fra samme fag-område, slik at en
//     bruker med mange SQL-skills ikke får 5 SQL-kort.

import { SKILLS, type Skill, type SkillArea } from "./skills";
import {
  estimateAllSkills,
  getNextUnlocked,
  getRustyConcepts,
  hasCompletedDiagnose,
} from "./engine";

export type RecommendationType =
  | "next-unlock"
  | "rusty-review"
  | "weak-spot"
  | "diagnose-first";

export interface Recommendation {
  type: RecommendationType;
  skillId?: string;
  /** Kort tittel for kortet, f.eks. "Lær Quicksort". */
  title: string;
  /** Hvorfor vi anbefaler dette nå, f.eks. "Du har bestått alle prereqs". */
  reason: string;
  /** Konkret call-to-action: hvor brukeren havner + knappe-tekst. */
  cta: { to: string; label: string };
  /** Priority-score i [0, 1]. Høyere = mer prioritert. */
  score: number;
}

const MASTERY_WEAK = 0.5;
const LOW_CONFIDENCE = 0.4;
const MAX_PER_AREA = 2;

/**
 * Returner topp `maxCount` anbefalinger for brukeren, sortert etter score.
 *
 * SSR-trygg: bruker hasCompletedDiagnose() som returnerer false på server,
 * så vi ender opp med diagnose-CTA-en — riktig default for en ny besøkende.
 */
export function getRecommendations(maxCount: number = 5): Recommendation[] {
  if (!hasCompletedDiagnose()) {
    return [
      {
        type: "diagnose-first",
        title: "Ta 20-min ferdighets-diagnose",
        reason:
          "Vi vet ikke hva du kan ennå — en kort diagnose lar oss anbefale riktig nivå med en gang.",
        cta: { to: "/diagnose", label: "Start diagnose" },
        score: 1,
      },
    ];
  }

  const recs: Recommendation[] = [];

  // 1) Next-unlock — skills hvor alle prereqs er bestått.
  const unlocked = getNextUnlocked();
  for (let i = 0; i < unlocked.length; i++) {
    const s = unlocked[i];
    // Førstevalg får 0.85, deretter trappes ned (men holdes over rusty/weak).
    const score = Math.max(0.7, 0.85 - i * 0.05);
    recs.push({
      type: "next-unlock",
      skillId: s.id,
      title: `Lær ${s.name}`,
      reason: "Du har bestått alle prereqs — denne er klar for læring.",
      cta: { to: s.route, label: "Start læring" },
      score,
    });
  }

  // 2) Rusty review — bestått tidligere, men på vei til å glemmes.
  const rusty = getRustyConcepts();
  for (let i = 0; i < rusty.length; i++) {
    const s = rusty[i];
    const score = Math.max(0.55, 0.65 - i * 0.03);
    recs.push({
      type: "rusty-review",
      skillId: s.id,
      title: `Repetér ${s.name}`,
      reason: "Du har tidligere mestret denne, men det er en stund siden — frisk opp.",
      cta: { to: s.route, label: "Repetér" },
      score,
    });
  }

  // 3) Weak-spots — skills med lav mastery + lav confidence. Disse er det
  //    verdt å se nærmere på selv om prereqs ikke er fullt bestått.
  const estimates = estimateAllSkills();
  const seen = new Set(recs.map((r) => r.skillId).filter(Boolean) as string[]);
  const weak = estimates
    .filter(
      (e) =>
        e.mastery < MASTERY_WEAK &&
        e.confidence < LOW_CONFIDENCE &&
        !seen.has(e.skillId),
    )
    .slice(0, 5);
  for (let i = 0; i < weak.length; i++) {
    const skill = SKILLS.find((s) => s.id === weak[i].skillId);
    if (!skill) continue;
    const score = Math.max(0.4, 0.55 - i * 0.03);
    recs.push({
      type: "weak-spot",
      skillId: skill.id,
      title: `Sjekk ${skill.name}`,
      reason: "Vi er usikre på om du kan denne — en kort sjekk gir bedre anbefalinger.",
      cta: { to: skill.route, label: "Ta en kort sjekk" },
      score,
    });
  }

  // Sorter alt etter score, deretter diversifiser slik at ingen
  // fag-område dominerer.
  recs.sort((a, b) => b.score - a.score);
  return diversify(recs, maxCount);
}

/**
 * Begrens til MAX_PER_AREA anbefalinger per fag-område, men tillat
 * overflow på slutten hvis vi ikke har nok andre å fylle med.
 */
function diversify(recs: Recommendation[], maxCount: number): Recommendation[] {
  const perArea = new Map<SkillArea | "?", number>();
  const out: Recommendation[] = [];
  const overflow: Recommendation[] = [];

  for (const r of recs) {
    const area = areaOf(r.skillId);
    const n = perArea.get(area) ?? 0;
    if (n < MAX_PER_AREA) {
      out.push(r);
      perArea.set(area, n + 1);
    } else {
      overflow.push(r);
    }
    if (out.length >= maxCount) break;
  }

  // Hvis vi ikke nådde maxCount, fyll med overflow (avstilt diversifisering).
  for (const r of overflow) {
    if (out.length >= maxCount) break;
    out.push(r);
  }

  return out;
}

function areaOf(skillId: string | undefined): SkillArea | "?" {
  if (!skillId) return "?";
  const s = SKILLS.find((x) => x.id === skillId);
  return s?.area ?? "?";
}

/** Convenience: bare topp-anbefalingen, eller null. */
export function getTopRecommendation(): Recommendation | null {
  const rs = getRecommendations(1);
  return rs[0] ?? null;
}
