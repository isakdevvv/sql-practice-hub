// Stub-definisjon av ferdighets-treet. Andre agenter eier den fulle grafen;
// denne filen finnes så recommender + UI kompilerer uavhengig av andre
// branches. Når den ekte skills.ts merges inn, blir denne overskrevet.

export type SkillArea =
  | "sql"
  | "python"
  | "web"
  | "ml"
  | "os"
  | "nett"
  | "mobil"
  | "matte"
  | "annet";

export interface Skill {
  id: string;
  /** Menneske-lesbart navn, f.eks. "Quicksort". */
  name: string;
  /** Hvilket fag-område. Brukes til diversifisering av anbefalinger. */
  area: SkillArea;
  /** id-er til ferdigheter denne bygger på. */
  prereqs: string[];
  /** Hvor brukeren havner når de vil lære/øve denne. */
  route: string;
  /** Kort beskrivelse for UI. */
  blurb?: string;
}

// Liten frø-graf — fungerer som no-op hvis andre agenter ikke har levert
// sin egen versjon enda. Holdes intensjonelt kort.
export const SKILLS: Skill[] = [
  {
    id: "sql-select",
    name: "SELECT-grunnleggende",
    area: "sql",
    prereqs: [],
    route: "/practice",
    blurb: "Hente data fra én tabell med SELECT/WHERE/ORDER BY.",
  },
  {
    id: "sql-joins",
    name: "JOIN-er",
    area: "sql",
    prereqs: ["sql-select"],
    route: "/joins",
    blurb: "INNER, LEFT og selvjoins på tvers av tabeller.",
  },
  {
    id: "py-basics",
    name: "Python grunnsyntaks",
    area: "python",
    prereqs: [],
    route: "/python",
    blurb: "Variabler, kontrollflyt, funksjoner.",
  },
];

export function getSkill(id: string): Skill | undefined {
  return SKILLS.find((s) => s.id === id);
}
