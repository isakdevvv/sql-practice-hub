/**
 * Datamodell for Dockerfile Builder. Bruker krysser av base-image,
 * dependencies, runtime og helsesjekk; assemble() kombinerer disse
 * til en ferdig Dockerfile (+ valgfri docker-compose.yml + .dockerignore).
 */

export type CategoryId =
  | "base"
  | "workdir"
  | "deps"
  | "copy"
  | "runtime"
  | "health"
  | "volume"
  | "compose";

export interface Category {
  id: CategoryId;
  label: string;
  description: string;
  /**
   * "radio" = nøyaktig én option skal være valgt i kategorien.
   * "check" = null eller flere options kan velges fritt.
   */
  kind: "radio" | "check";
}

export const CATEGORIES: readonly Category[] = [
  {
    id: "base",
    label: "Base-image (FROM)",
    description: "Velg ett base-image — bestemmer språk og distro.",
    kind: "radio",
  },
  {
    id: "workdir",
    label: "Workdir, bruker og dockerignore",
    description: "Hvor appen bor inne i containeren og hvem som eier den.",
    kind: "check",
  },
  {
    id: "deps",
    label: "Dependencies",
    description: "Pakkemanagere og apt-pakker. Plasseres FØR app-kopi for cache.",
    kind: "check",
  },
  {
    id: "copy",
    label: "App-kopi og bygg",
    description: "Hvordan kildekoden havner inn — enkel COPY eller multi-stage.",
    kind: "check",
  },
  {
    id: "runtime",
    label: "Runtime (EXPOSE + CMD)",
    description: "Velg én kommando som starter prosessen i containeren.",
    kind: "radio",
  },
  {
    id: "health",
    label: "Helsesjekk",
    description: "HEALTHCHECK + curl mot /health for orchestrators.",
    kind: "check",
  },
  {
    id: "volume",
    label: "Volume",
    description: "Eksponer en sti som persistens-volum.",
    kind: "check",
  },
  {
    id: "compose",
    label: "docker-compose.yml",
    description: "Generer en docker-compose med valgfri databasetjeneste.",
    kind: "check",
  },
];

/**
 * Kode-bidrag en option kan levere. Direktivene plasseres i den
 * rekkefølgen feltene står her — base først, så env, deps, copy, expose, cmd.
 * Det er bevisst at strukturen er flat (string-arrays) — assemble.ts setter
 * dem sammen i korrekt Dockerfile-rekkefølge.
 */
export interface DockerContribution {
  /** FROM-direktiv. Bare base-image-options bør sette dette. */
  from?: string;
  /** Argumenter etter FROM (ARG, navngitte stages). */
  preFrom?: string[];
  /** ENV-variabler. */
  env?: string[];
  /** WORKDIR-linje (én sann verdi — siste vinner). */
  workdir?: string;
  /** apt-get install, useradd, mkdir — kjøres FØR deps. */
  systemRun?: string[];
  /** Kopier deps-fil (requirements.txt, package.json) — FØR app-kopi for cache. */
  depsCopy?: string[];
  /** Installer dependencies (pip install, npm ci, go mod download). */
  depsInstall?: string[];
  /** Kopier resten av appen (COPY . . eller multi-stage). */
  appCopy?: string[];
  /** EXPOSE-linje. */
  expose?: number;
  /** USER-linje (siste vinner, satt sent så bygge-trinn kan være root). */
  user?: string;
  /** CMD-array (én sann verdi). */
  cmd?: string[];
  /** HEALTHCHECK-linje. */
  healthcheck?: string;
  /** VOLUME-linje. */
  volume?: string;
  /** Linjer som havner i .dockerignore (dedupliseres). */
  dockerignore?: string[];
  /** docker-compose service-blokker (YAML-fragmenter under services:). */
  composeServices?: Record<string, string>;
  /** docker-compose top-level volumes-navn. */
  composeVolumes?: string[];
  /** docker-compose top-level networks-navn. */
  composeNetworks?: string[];
}

export interface DockerOption {
  id: string;
  category: CategoryId;
  label: string;
  description: string;
  /** Forutsetter andre options (aktiveres automatisk). */
  requires?: string[];
  /** Kan ikke kombineres med disse options. */
  conflicts?: string[];
  /** På som standard ved første lasting. */
  defaultOn?: boolean;
  contributes: DockerContribution;
}
