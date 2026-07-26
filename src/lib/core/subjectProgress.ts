// ---------------------------------------------------------------------------
// core/subjectProgress.ts — samlet fremdrift for ett fag på tvers av moduler.
//
// Fag-siden (og andre oversikter) trenger ett tall-sett per emne: hvor mange
// leksjoner er sett, hvor mange kort er i læring, hvor mange oppgaver er
// løst, og hva som er due akkurat nå. Denne fila regner det ut fra de
// eksisterende kildene (curriculum-fasen, FSRS-stores, SQL-progresjon) uten
// å innføre ny lagring.
// ---------------------------------------------------------------------------

import { phaseOfSlug } from "@/lib/stack/curriculum";
import { computeModulProgress } from "@/lib/stack/moduleProgress";
import { flashcardFsrs } from "@/lib/learn/fsrs";
import { FLASHCARDS } from "@/lib/learn/flashcards";
import { loadProgress } from "@/lib/progress/storage";
import { PROBLEMS } from "@/lib/problems/data";
import { dueCounts } from "./due";

export interface SubjectSnapshot {
  /** Leksjoner i fagets curriculum-fase: sett / totalt. 0/0 hvis faget ikke
   *  er hub for en fase. */
  lessonsSeen: number;
  lessonsTotal: number;
  /** Flashcards som tilhører faget og har vært gjennom minst én repetisjon. */
  cardsLearned: number;
  cardsTotal: number;
  /** SQL-oppgaver løst (kun meningsfullt for dte-2509 i dag). */
  problemsSolved: number;
  problemsTotal: number;
  /** Items due for repetisjon i dette faget akkurat nå. */
  dueNow: number;
}

function cardSubject(category: string): string {
  return category === "statistikk" ? "tek-1501" : "dte-2509";
}

export function subjectSnapshot(slug: string, now: number = Date.now()): SubjectSnapshot {
  // Leksjoner: fagets curriculum-fase (kun når faget selv er fasens hub).
  const phase = phaseOfSlug(slug);
  const lessonSlugs = phase && phase.slugs[0] === slug ? [...phase.slugs] : [];
  const lessons = computeModulProgress(lessonSlugs);

  // Kort: fagets flashcards, "lært" = FSRS-tilstand utover "new".
  const subjectCards = FLASHCARDS.filter((c) => cardSubject(c.category) === slug);
  let cardsLearned = 0;
  if (subjectCards.length > 0) {
    const states = flashcardFsrs.getAllStates();
    for (const c of subjectCards) {
      const s = states[c.id];
      if (s && s.state !== "new") cardsLearned += 1;
    }
  }

  // SQL-oppgaver: hele PROBLEMS-settet hører til dte-2509.
  let problemsSolved = 0;
  let problemsTotal = 0;
  if (slug === "dte-2509") {
    problemsTotal = PROBLEMS.length;
    const attempts = loadProgress().attempts;
    for (const a of Object.values(attempts)) {
      if (a.solved) problemsSolved += 1;
    }
  }

  return {
    lessonsSeen: lessons.seen,
    lessonsTotal: lessons.total,
    cardsLearned,
    cardsTotal: subjectCards.length,
    problemsSolved,
    problemsTotal,
    dueNow: dueCounts(now, slug).total,
  };
}
