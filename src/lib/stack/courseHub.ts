import { phaseOfSlug } from "./curriculum";
import { SUBJECT_BY_SLUG } from "@/lib/subjects/catalog";
import type { Subject } from "@/lib/subjects/catalog";

/**
 * For en gitt stack-slug, finn det aktuelle kurs/fag-hub-slug.
 * Brukes til "← Tilbake til kurs"-knapper i StackPagerFooter.
 *
 * Strategi: hver curriculum-fase har en `slugs`-liste. Hvis første slug i
 * fasens liste matcher et fag i SUBJECT_BY_SLUG, regner vi det som hub-en
 * for fasen. Returnerer null hvis vi allerede står på hub-en, eller hvis
 * fasen ikke har et registrert fag-hub.
 */
export function courseHubForSlug(slug: string): {
  hubSlug: string;
  subject: Subject;
} | null {
  const phase = phaseOfSlug(slug);
  if (!phase) return null;
  const first = phase.slugs[0];
  if (!first) return null;
  const subject = SUBJECT_BY_SLUG[first];
  if (!subject) return null;
  if (first === slug) return null; // vi er allerede på hub-en
  return { hubSlug: first, subject };
}

/**
 * Andre trinn i samme curriculum-fase som denne slugen, eksklusivt slugen selv
 * og hub-en (hub-en er det første trinnet). Brukes til "andre sider i dette
 * faget"-mini-navigasjon.
 */
export function siblingSlugsInPhase(slug: string, max = 8): string[] {
  const phase = phaseOfSlug(slug);
  if (!phase) return [];
  const hubSlug = phase.slugs[0];
  return phase.slugs.filter((s) => s !== slug && s !== hubSlug).slice(0, max);
}
