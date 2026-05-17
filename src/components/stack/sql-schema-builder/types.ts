/**
 * Datamodell for SQL Schema Builder. Hvert valg kontribuerer en eller flere
 * tabell-definisjoner (kolonner, primær- og fremmednøkler, constraints,
 * indekser, kommentarer) som blir slått sammen til ett ferdig CREATE-skript
 * av `assemble()`.
 *
 * Designet er bevisst likt Flask App Builder: kategorier i venstre marg,
 * generert SQL-script i høyre. Forskjellen er at outputten er DDL (Data
 * Definition Language) i stedet for Python.
 */

export type CategoryId =
  | "domain"
  | "entities"
  | "normalization"
  | "constraints"
  | "indexes"
  | "dialect";

export interface Category {
  id: CategoryId;
  label: string;
  description: string;
}

export const CATEGORIES: readonly Category[] = [
  {
    id: "domain",
    label: "Domene",
    description: "Hvilket virkelighetsdomene skal databasen modellere?",
  },
  {
    id: "entities",
    label: "Kjerne-entiteter",
    description:
      "Hvilke entiteter (tabeller) skal være med? Avhenger av valgt domene.",
  },
  {
    id: "normalization",
    label: "Normalisering",
    description:
      "Hvor normalisert skal skjemaet være? 1NF gir flate tabeller, 3NF/BCNF splitter ut avhengigheter (f.eks. poststed).",
  },
  {
    id: "constraints",
    label: "Constraints",
    description:
      "Hvilke regler skal databasen håndheve? NOT NULL, CHECK, UNIQUE, DEFAULT.",
  },
  {
    id: "indexes",
    label: "Indekser",
    description:
      "Primær- og FK-indekser kommer automatisk. Kandidat-indekser på e-post og dato er valgfrie.",
  },
  {
    id: "dialect",
    label: "Database-dialekt",
    description:
      "Velger syntaks for auto-increment, TEXT/VARCHAR og evt. ENGINE-klausul.",
  },
];

export type Dialect = "mysql" | "postgresql" | "sqlite";
export type Domain = "webshop" | "skole" | "utleie" | "bibliotek";
export type NormalForm = "1nf" | "2nf" | "3nf" | "bcnf";

/**
 * Én kolonne i en CREATE TABLE-blokk. Dialekt-spesifikt type-uttrykk
 * resolveres av `assemble.ts` ut fra valgt dialect.
 */
export interface Column {
  name: string;
  /** Logisk type — assemble velger riktig SQL-uttrykk per dialect. */
  type:
    | "id-pk"        // INTEGER PRIMARY KEY AUTO_INCREMENT / SERIAL / INTEGER PRIMARY KEY AUTOINCREMENT
    | "int"
    | "decimal"      // DECIMAL(10,2)
    | "text"
    | "varchar"      // VARCHAR(120)
    | "email"        // VARCHAR(254)
    | "date"
    | "datetime"
    | "bool";
  notNull?: boolean;
  unique?: boolean;
  /** Rå SQL-uttrykk for DEFAULT, e.g. "0", "CURRENT_TIMESTAMP", "'kladd'". */
  default?: string;
  /** Rå SQL-uttrykk inn i en CHECK-klausul, e.g. "pris > 0". */
  check?: string;
  /** Refererer til en annen tabell (lager FK). */
  references?: { table: string; column?: string };
  /** Kommentar som vises som "-- ..." over kolonnen. */
  comment?: string;
}

/**
 * Én tabell-definisjon. Rekkefølgen på tabeller bestemmes topologisk av
 * fremmednøkler — parents kommer før children.
 */
export interface Table {
  name: string;
  /** Kort forklaring øverst i CREATE TABLE-blokken. */
  comment?: string;
  columns: Column[];
  /** Composite PK (overstyrer evt. id-pk-kolonne). */
  primaryKey?: string[];
  /** Composite UNIQUE-constraints. */
  uniques?: string[][];
  /** Composite CHECK-constraints på tabell-nivå. */
  tableChecks?: string[];
}

/** Hva en option kontribuerer til skjemaet. */
export interface SchemaContribution {
  tables?: Table[];
  /**
   * Modifiserer eksisterende tabeller — settes etter alle `tables` er samlet.
   * Brukes f.eks. av normaliserings-options som splitter ut Poststed.
   */
  modifyTables?: (tablesByName: Map<string, Table>) => void;
  /**
   * Tilleggs-indekser (utover automatiske PK/FK).
   * Format: { name, table, columns, unique? }.
   */
  indexes?: { name: string; table: string; columns: string[]; unique?: boolean }[];
  /** Forklarende kommentar som puttes øverst i scriptet. */
  rationale?: string;
}

export interface SchemaOption {
  id: string;
  category: CategoryId;
  label: string;
  description: string;
  /** På som standard ved første lasting. */
  defaultOn?: boolean;
  /** Forutsetter andre options (auto-aktiveres). */
  requires?: string[];
  /** Kan ikke kombineres med disse — UI viser dem som "single-select". */
  conflicts?: string[];
  /** Bare relevant når dette domenet er valgt. */
  domain?: Domain;
  /** Bare relevant ved denne dialekten (eller bidrar uansett). */
  dialect?: Dialect;
  /** Bare relevant ved denne normalformen. */
  normalForm?: NormalForm;
  contributes: SchemaContribution;
}
