/**
 * Datamodell for FastAPI App Builder. Hvert valg kontribuerer kode-fragmenter
 * som blir slått sammen til én ferdig FastAPI-app av `assemble()`.
 */

export type CategoryId =
  | "core"
  | "endpoints"
  | "models"
  | "validation"
  | "di"
  | "auth"
  | "database"
  | "docs";

export interface Category {
  id: CategoryId;
  label: string;
  description: string;
}

export const CATEGORIES: readonly Category[] = [
  {
    id: "core",
    label: "Kjerne",
    description: "FastAPI()-init, Pydantic-imports, uvicorn-run. Alltid med.",
  },
  {
    id: "endpoints",
    label: "Endepunkter",
    description: "GET/POST/PUT/DELETE for /kunder + hjem-side.",
  },
  {
    id: "models",
    label: "Pydantic-modeller",
    description: "KundeIn / KundeUt / ErrorResponse / paginert wrapper.",
  },
  {
    id: "validation",
    label: "Validering",
    description: "Field-constraints, regex på epost, custom validators.",
  },
  {
    id: "di",
    label: "Dependency Injection",
    description: "get_db (yield), get_current_user, paginerings-deps.",
  },
  {
    id: "auth",
    label: "Autentisering",
    description: "OAuth2PasswordBearer, JWT, passordhashing med passlib.",
  },
  {
    id: "database",
    label: "Database",
    description: "SQLite via SQLAlchemy ORM (engine + SessionLocal + Base).",
  },
  {
    id: "docs",
    label: "Test & docs",
    description: "TestClient, /docs, /redoc, OpenAPI-tags.",
  },
];

/** Kode-fragmenter en option kan kontribuere til den endelige app-en. */
export interface CodeContribution {
  /** import-statements (dedupliseres). */
  imports?: string[];
  /** Globale konstanter og app-config (etter `app = FastAPI(...)`). */
  config?: string[];
  /** Pydantic-modeller (BaseModel-klasser). */
  models?: string[];
  /** DB-oppsett (engine, SessionLocal, Base, create_all). */
  dbSetup?: string[];
  /** Dependency-funksjoner (Depends-mål). */
  dependencies?: string[];
  /** Hjelpere (auth-funksjoner, password-utils osv.). */
  helpers?: string[];
  /** En eller flere route-handlere. */
  routes?: string[];
  /** Test-kode (TestClient-kall). */
  tests?: string[];
}

export interface AppOption {
  id: string;
  category: CategoryId;
  label: string;
  /** Kort forklaring som vises under label. */
  description: string;
  /** Forutsetter andre options (de aktiveres automatisk). */
  requires?: string[];
  /** Kan ikke kombineres med disse options. */
  conflicts?: string[];
  /** På som standard ved første lasting. */
  defaultOn?: boolean;
  /** Kode bidragen til FastAPI-appen. */
  contributes: CodeContribution;
}
