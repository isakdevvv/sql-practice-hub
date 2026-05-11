// Calculate per-phase progress for the læreplan-view.
//
// Two sources:
//  1. Trinn-side visits (CourseOutline writes per-slug visited Set to localStorage)
//  2. Drag exercise solved (dragProgress.solved Record<id, true>)
//
// Per phase we report: pages visited, exercises solved, percent.
// The percent weights pages 30% / exercises 70% — exercises is where the real
// learning happens.

import { DRAG_EXERCISES } from "@/lib/learn/dragExercises";
import { phaseOfSlug, PHASES, type CurriculumPhase } from "@/lib/stack/curriculum";
import { TRINN } from "@/lib/stack/content";
import { loadDragProgress } from "@/lib/learn/dragProgress";

const COURSE_VISITED_PREFIX = "sql-practice-course-visited-v1:";

/** Returns the per-slug visited set as stored by CourseOutline.tsx. */
function loadVisitedFor(slug: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(COURSE_VISITED_PREFIX + slug);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export interface PhaseProgress {
  phase: CurriculumPhase;
  /** Slugs in this phase that are 'ready' (publicly accessible). */
  readySlugs: string[];
  /** Pages where the student has at least scrolled to one section. */
  pagesStarted: number;
  /** Total ready pages in this phase. */
  pagesTotal: number;
  /** Drag exercises tagged with one of this phase's topics. */
  exercisesTotal: number;
  /** Of those exercises, how many the student has solved. */
  exercisesSolved: number;
  /** 0..100 — weighted: 30% pages, 70% exercises. */
  percent: number;
}

/** Get topics owned by this phase by inspecting which trinn-slugs it contains
 *  and looking up topics from drag exercises. Approximation: we don't have a
 *  formal phase→topic mapping, so we infer it from existing exercises that
 *  reference these slugs in their topic or that match common topic patterns.
 *
 *  For simplicity, we treat each exercise as belonging to the phase whose slug
 *  most closely matches its topic. Since topic names aren't slug names, we
 *  use a static mapping below. */
const PHASE_TOPICS: Record<string, readonly string[]> = {
  math: [
    "Diskret matte",
    "Logikk (matte)",
    "Mengder",
    "Kombinatorikk",
    "Induksjon",
    "Sannsynlighet",
    "Bayes (matte)",
    "Statistikk",
    "Linær algebra",
    "Vektorer",
    "Matriser",
    "Eigenvektorer",
  ],
  hardware: [
    "Transistor",
    "Logiske porter",
    "CPU-arkitektur",
    "Assembly",
    "C-minne",
    "Bytes-representasjon",
    "CPython",
    "Syscalls",
    "WSGI",
  ],
  algoritmer: [
    "Big-O",
    "Rekursjon",
    "Sortering",
    "Lenkede strukturer",
    "Trær",
    "Grafer (algo)",
    "Hashing",
    "Dynamic programming",
  ],
  "fp-typer": [
    "Funksjonell programmering",
    "Pure functions",
    "Higher-order funksjoner",
    "Immutability",
    "Typesystemer",
    "Generics",
    "Sum types",
    "Variance",
  ],
  os: [
    "OS-grunnlag",
    "Linux",
    "Shell scripting",
    "Brukere & rettigheter",
    "Virtualisering",
  ],
  nettverk: [
    "OSI/TCP-IP",
    "TLS",
    "Kryptografi",
    "Nettverkssikkerhet",
    "Transportlag",
  ],
  database: [
    "SQL grunnleggende",
    "JOIN",
    "GROUP BY",
    "NULL",
    "DDL",
    "DML",
    "ER-modell",
    "Normalisering",
    "Nøkler",
    "Underspørringer",
    "Transaksjoner",
    "Indeks",
    "Integritet",
    "Relasjonsalgebra",
    "Rettigheter",
    "Datatyper",
    "Lagring",
    "Database",
    "Transaksjoner (DB)",
    "ACID",
    "Isolation levels",
    "Indekser (DB)",
    "Query-optimisering",
    "EXPLAIN",
  ],
  web: [
    "Flask",
    "Flask routing",
    "Flask forms",
    "Flask-Login",
    "Jinja",
    "Blueprints",
    "HTTP",
    "HTTP / Flask",
    "JWT",
    "CSS",
    "HTML",
    "CORS",
    "Sikkerhet",
    "Hashing",
    "JavaScript",
    "TypeScript",
    "React",
    "CSS moderne",
  ],
  "ai-klassisk": [
    "Søk (AI)",
    "CSP",
    "Logisk resonnering",
    "Planlegging",
    "Bayes",
  ],
  ml: [
    "ML-grunnlag",
    "Supervised learning",
    "Unsupervised learning",
    "Nevrale nett",
    "Modellevaluering",
  ],
  "deep-learning": [
    "Backpropagation",
    "CNN",
    "Regularisering (NN)",
    "NN-optimering",
    "PyTorch/TF",
  ],
  systemutvikling: [
    "Smidig",
    "Scrum",
    "Brukerhistorier",
    "UML",
    "Estimering",
    "Code review",
  ],
  "api-prosjekt": [
    "API-planlegging",
    "API-arkitektur",
    "API-kontrakt",
    "API-testing",
    "API-deploy",
  ],
  "spes-mobil": [
    "Kotlin",
    "Android livssyklus",
    "MVVM",
    "Korutiner",
    "Room",
    "RecyclerView",
    "Retrofit",
  ],
  "spes-enterprise": [
    "C#",
    "ASP.NET MVC",
    "ASP.NET Web API",
    "EF Core",
    "Blazor",
    "LINQ",
  ],
  devops: [
    "Git-dyp",
    "Docker",
    "Linux-CLI advanced",
    "sed/awk/jq",
    "Containere",
  ],
  drill: ["Cross-phase drill"],
};

export function computeProgress(): PhaseProgress[] {
  const drag = loadDragProgress();
  const trinnBySlug = new Map(TRINN.map((t) => [t.slug, t] as const));

  return PHASES.map((phase) => {
    const readySlugs = phase.slugs.filter(
      (s) => trinnBySlug.get(s)?.status === "ready",
    );

    // Pages "started" = has at least one visited section
    const pagesStarted = readySlugs.filter(
      (s) => loadVisitedFor(s).size > 0,
    ).length;
    const pagesTotal = readySlugs.length;

    // Exercises: drag exercises whose topic matches this phase's topics
    const phaseTopics = new Set(PHASE_TOPICS[phase.id] ?? []);
    const phaseExercises = DRAG_EXERCISES.filter((e) => phaseTopics.has(e.topic));
    const exercisesTotal = phaseExercises.length;
    const exercisesSolved = phaseExercises.filter((e) => drag.solved[e.id]).length;

    const pagesPct = pagesTotal === 0 ? 0 : pagesStarted / pagesTotal;
    const exPct = exercisesTotal === 0 ? 0 : exercisesSolved / exercisesTotal;
    // Weighted: pages 30%, exercises 70%
    const percent =
      pagesTotal === 0 && exercisesTotal === 0
        ? 0
        : Math.round(100 * (0.3 * pagesPct + 0.7 * exPct));

    return {
      phase,
      readySlugs,
      pagesStarted,
      pagesTotal,
      exercisesTotal,
      exercisesSolved,
      percent,
    };
  });
}

/** Find the recommended "next" phase: first one where percent < 80%.
 *  If all are above 80%, return the last phase. */
export function recommendNextPhase(progress: readonly PhaseProgress[]): PhaseProgress {
  for (const p of progress) {
    if (p.percent < 80) return p;
  }
  return progress[progress.length - 1];
}

/** Slug-level: phase's first not-yet-visited ready slug. */
export function recommendNextSlug(progress: PhaseProgress): string | null {
  for (const slug of progress.readySlugs) {
    if (loadVisitedFor(slug).size === 0) return slug;
  }
  return null;
}

/** Resolve a slug back to its phase (re-export from curriculum for convenience). */
export { phaseOfSlug };
