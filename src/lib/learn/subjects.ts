import type { DragExercise } from "./types";

// Subject = a "fag" the user can pick to focus their practice on.
// Each subject lists the topic strings (from DragExercise.topic) it owns.
// Exercises whose topic isn't claimed end up under "annet".

export type SubjectId =
  | "python"
  | "algoritmer"
  | "datakomm"
  | "database"
  | "web"
  | "verktoy"
  | "ml-ai"
  | "os"
  | "webapps2"
  | "systemutvikling"
  | "api-prosjekt"
  | "mobil";

export interface Subject {
  id: SubjectId;
  label: string;          // Norwegian display name
  short: string;          // 1-line description for the picker
  topics: readonly string[];
  /** Optional topic prefix match — used to auto-pick up future topics
   *  without re-listing them. Example: "Python kap." matches all Liang chapters. */
  topicPrefixes?: readonly string[];
}

export const SUBJECTS: readonly Subject[] = [
  {
    id: "python",
    label: "Python (Liang)",
    short: "Introduksjon til Python — kap. 1–23 fra Liang-boka",
    topics: [],
    topicPrefixes: ["Python kap."],
  },
  {
    id: "algoritmer",
    label: "Algoritmer (DTE-2511)",
    short: "Big-O, rekursjon, sortering, lenkede strukturer, trær, grafer, hashing, DP",
    topics: [
      "Big-O",
      "Rekursjon",
      "Sortering",
      "Lenkede strukturer",
      "Trær",
      "Grafer (algo)",
      "Hashing",
      "Dynamic programming",
    ],
  },
  {
    id: "datakomm",
    label: "Datakomm & sikkerhet (DTE-2507)",
    short: "OSI/TCP-IP, transportlag, TLS, kryptografi, nettverkssikkerhet",
    topics: [
      "OSI/TCP-IP",
      "TLS",
      "Kryptografi",
      "Nettverkssikkerhet",
      "Transportlag",
    ],
  },
  {
    id: "database",
    label: "Database & SQL",
    short:
      "SQL, JOIN, GROUP BY, normalisering, ER-modell, nøkler, transaksjoner",
    topics: [
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
    ],
  },
  {
    id: "web",
    label: "Webutvikling (Flask/HTTP)",
    short: "Flask, Jinja, HTTP, sikkerhet, sesjoner, JWT",
    topics: [
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
    ],
  },
  {
    id: "verktoy",
    label: "Verktøy & praksis",
    short: "Git, backup, deployment, generell praksis",
    topics: ["Git", "Backup", "Praktisk", "Verktøy"],
  },
  {
    id: "os",
    label: "OS & Linux (DTE-2505)",
    short:
      "Operativsystem-grunnlag, Linux i bruk, shell scripting, brukere/rettigheter, virtualisering",
    topics: [
      "OS-grunnlag",
      "Linux",
      "Shell scripting",
      "Brukere & rettigheter",
      "Virtualisering",
    ],
  },
  {
    id: "ml-ai",
    label: "ML & AI (DTE-2602/2501/2502)",
    short:
      "Maskinlæring, supervised/unsupervised, evaluering, nevrale nett, dyplæring, søk og CSP",
    topics: [
      "ML-grunnlag",
      "Supervised learning",
      "Unsupervised learning",
      "Nevrale nett",
      "Modellevaluering",
      "Søk (AI)",
      "CSP",
      "Logisk resonnering",
      "Planlegging",
      "Bayes",
      "Backpropagation",
      "CNN",
      "Regularisering (NN)",
      "NN-optimering",
      "PyTorch/TF",
    ],
  },
  {
    id: "webapps2",
    label: "Web Applikasjoner 2 (DTE-2802)",
    short: "C#, ASP.NET MVC + Web API, EF Core, Blazor",
    topics: ["C#", "ASP.NET MVC", "ASP.NET Web API", "EF Core", "Blazor", "LINQ"],
  },
  {
    id: "systemutvikling",
    label: "Systemutvikling (DTE-2604)",
    short: "Smidig, Scrum, brukerhistorier, UML, prosjekt-praksis",
    topics: ["Smidig", "Scrum", "Brukerhistorier", "UML", "Estimering", "Code review"],
  },
  {
    id: "api-prosjekt",
    label: "API-prosjekt fra A til Å",
    short:
      "Planlegging, arkitektur, testing, CI/CD, deploy, dokumentasjon",
    topics: [
      "API-planlegging",
      "API-arkitektur",
      "API-kontrakt",
      "API-testing",
      "API-deploy",
    ],
  },
  {
    id: "mobil",
    label: "Mobil (DTE-2603)",
    short: "Kotlin, Android, MVVM, korutiner, Room, Retrofit",
    topics: [
      "Kotlin",
      "Android livssyklus",
      "MVVM",
      "Korutiner",
      "Room",
      "RecyclerView",
      "Retrofit",
    ],
  },
] as const;

// Build a Map for O(1) lookup from topic → subject.
const TOPIC_TO_SUBJECT: Map<string, SubjectId> = (() => {
  const m = new Map<string, SubjectId>();
  for (const s of SUBJECTS) for (const t of s.topics) m.set(t, s.id);
  return m;
})();

/** Returns the subject id for a given exercise topic, or null if no subject claims it. */
export function subjectOf(topic: string): SubjectId | null {
  const exact = TOPIC_TO_SUBJECT.get(topic);
  if (exact) return exact;
  for (const s of SUBJECTS) {
    if (s.topicPrefixes?.some((p) => topic.startsWith(p))) return s.id;
  }
  return null;
}

/** True if the exercise belongs to the given subject. */
export function exerciseInSubject(e: DragExercise, id: SubjectId): boolean {
  return subjectOf(e.topic) === id;
}

/** Count exercises grouped by subject across the full list. */
export function countBySubject(
  all: readonly DragExercise[],
): Record<SubjectId | "annet", number> {
  const out: Record<string, number> = { annet: 0 };
  for (const s of SUBJECTS) out[s.id] = 0;
  for (const e of all) {
    const id = subjectOf(e.topic);
    out[id ?? "annet"] = (out[id ?? "annet"] ?? 0) + 1;
  }
  return out as Record<SubjectId | "annet", number>;
}
