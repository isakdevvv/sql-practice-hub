/**
 * Datamodell for Flask App Builder. Hvert valg kontribuerer kode-fragmenter
 * som blir slått sammen til én ferdig Flask-app av `assemble()`.
 */

export type CategoryId =
  | "core"
  | "pages"
  | "forms"
  | "auth"
  | "database"
  | "ui"
  | "api";

export interface Category {
  id: CategoryId;
  label: string;
  description: string;
}

export const CATEGORIES: readonly Category[] = [
  {
    id: "core",
    label: "Kjerne",
    description: "App-oppsett. Alltid med — kan ikke slås av.",
  },
  {
    id: "pages",
    label: "Sider",
    description: "Vanlige sider: hjem, om, kontakt.",
  },
  {
    id: "forms",
    label: "Skjemaer",
    description: "Login-, registrerings- og søkeskjema med form-control.",
  },
  {
    id: "auth",
    label: "Autentisering",
    description: "Session-basert login, passordhashing, CSRF-token.",
  },
  {
    id: "database",
    label: "Database",
    description: "SQLite kunde-tabell + CRUD-routes.",
  },
  {
    id: "ui",
    label: "Bootstrap UI",
    description: "Navbar, alerts, tabell, card-grid, dark theme.",
  },
  {
    id: "api",
    label: "JSON-API",
    description: "REST-endepunkter som returnerer JSON.",
  },
];

/** Kode-fragmenter en option kan kontribuere til den endelige app-en. */
export interface CodeContribution {
  /** import-statements (dedupliseres). */
  imports?: string[];
  /** Globale konstanter og app-config (etter `app = Flask(__name__)`). */
  config?: string[];
  /** Hjelpere som funksjoner og DB-init (settes før routes). */
  helpers?: string[];
  /** En eller flere route-handlere. */
  routes?: string[];
  /** Templates (rendret som render_template_string i denne sandkassen). */
  templates?: Record<string, string>;
  /** Test-kode under `if __name__ == "__main__":`-blokken (test_client-kall). */
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
  /** Kode bidragen til Flask-appen. */
  contributes: CodeContribution;
}
