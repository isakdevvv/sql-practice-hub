import { OPTIONS } from "./options";
import type { DockerOption } from "./types";

/**
 * Resolverer transitive `requires`-avhengigheter (samme mønster som
 * Flask App Builder). Hvis bruker velger `compose-postgres` aktiveres
 * `compose-app` automatisk.
 */
export function resolveRequires(selected: Set<string>): Set<string> {
  const byId = new Map(OPTIONS.map((o) => [o.id, o]));
  const result = new Set(selected);
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of Array.from(result)) {
      const opt = byId.get(id);
      if (!opt?.requires) continue;
      for (const req of opt.requires) {
        if (!result.has(req)) {
          result.add(req);
          changed = true;
        }
      }
    }
  }
  return result;
}

/** Finn options som er i konflikt med valgte (UI viser dette som warning). */
export function findConflicts(selected: Set<string>): { a: string; b: string }[] {
  const conflicts: { a: string; b: string }[] = [];
  const byId = new Map(OPTIONS.map((o) => [o.id, o]));
  for (const id of selected) {
    const opt = byId.get(id);
    if (!opt?.conflicts) continue;
    for (const c of opt.conflicts) {
      if (selected.has(c)) conflicts.push({ a: id, b: c });
    }
  }
  return conflicts;
}

interface Sections {
  preFrom: string[];
  from: string | null;
  env: string[];
  workdir: string | null;
  systemRun: string[];
  depsCopy: string[];
  depsInstall: string[];
  appCopy: string[];
  expose: number | null;
  user: string | null;
  healthcheck: string | null;
  volume: string | null;
  cmd: string[] | null;
  dockerignore: Set<string>;
  composeServices: Record<string, string>;
  composeVolumes: Set<string>;
  composeNetworks: Set<string>;
}

function emptySections(): Sections {
  return {
    preFrom: [],
    from: null,
    env: [],
    workdir: null,
    systemRun: [],
    depsCopy: [],
    depsInstall: [],
    appCopy: [],
    expose: null,
    user: null,
    healthcheck: null,
    volume: null,
    cmd: null,
    dockerignore: new Set(),
    composeServices: {},
    composeVolumes: new Set(),
    composeNetworks: new Set(),
  };
}

function ingest(sec: Sections, opt: DockerOption): void {
  const c = opt.contributes;
  if (c.preFrom) sec.preFrom.push(...c.preFrom);
  if (c.from) sec.from = c.from;
  if (c.env) sec.env.push(...c.env);
  if (c.workdir) sec.workdir = c.workdir;
  if (c.systemRun) sec.systemRun.push(...c.systemRun);
  if (c.depsCopy) sec.depsCopy.push(...c.depsCopy);
  if (c.depsInstall) sec.depsInstall.push(...c.depsInstall);
  if (c.appCopy) sec.appCopy.push(...c.appCopy);
  if (c.expose !== undefined) sec.expose = c.expose;
  if (c.user) sec.user = c.user;
  if (c.healthcheck) sec.healthcheck = c.healthcheck;
  if (c.volume) sec.volume = c.volume;
  if (c.cmd) sec.cmd = c.cmd;
  if (c.dockerignore) for (const d of c.dockerignore) sec.dockerignore.add(d);
  if (c.composeServices) {
    for (const [name, body] of Object.entries(c.composeServices)) {
      sec.composeServices[name] = body;
    }
  }
  if (c.composeVolumes) for (const v of c.composeVolumes) sec.composeVolumes.add(v);
  if (c.composeNetworks) for (const n of c.composeNetworks) sec.composeNetworks.add(n);
}

/** Serialiser CMD-arrayet som JSON-array (exec-form) — anbefalt skrivemåte. */
function cmdToExecForm(cmd: string[]): string {
  return `CMD [${cmd.map((s) => JSON.stringify(s)).join(", ")}]`;
}

interface AssembledFiles {
  dockerfile: string;
  dockerignore: string | null;
  compose: string | null;
}

export interface AssembleResult {
  files: AssembledFiles;
  /** Imageport for run-instruks, valgt av runtime-option. */
  exposedPort: number | null;
}

/**
 * Hovedfunksjon: ta sett av valgte option-id-er, returner ferdige filer.
 * `selected` skal allerede være kjørt gjennom resolveRequires.
 */
export function assemble(selected: Set<string>): AssembleResult {
  const sec = emptySections();

  // Behold options-rekkefølgen for konsistent output uansett klikk-orden.
  for (const opt of OPTIONS) {
    if (selected.has(opt.id)) ingest(sec, opt);
  }

  // === Dockerfile ====================================================
  const lines: string[] = [];
  const port = sec.expose ?? 8000;

  lines.push(
    "# =====================================================================",
    "# Dockerfile — generert av Dockerfile Builder",
    "# =====================================================================",
    "#",
    "# Bygg og kjør lokalt:",
    "#   docker build -t app .",
    `#   docker run --rm -p ${port}:${port} app`,
    "#",
    "# Eller med docker-compose (hvis du genererte compose-filen):",
    "#   docker compose up --build",
    "# =====================================================================",
    "",
  );

  // preFrom (multi-stage builder-blokker) før hoved-FROM
  if (sec.preFrom.length > 0) {
    lines.push(...sec.preFrom);
    lines.push("");
  }

  // FROM (fallback hvis bruker ikke valgte en base — bør ikke skje pga radio)
  lines.push(sec.from ?? "FROM python:3.12-slim");
  lines.push("");

  if (sec.env.length > 0) {
    lines.push(...sec.env);
    lines.push("");
  }

  if (sec.workdir) {
    lines.push(sec.workdir);
    lines.push("");
  }

  if (sec.systemRun.length > 0) {
    lines.push(...sec.systemRun);
    lines.push("");
  }

  // Deps FØR app-kopi → Docker cacher install-laget når kildekoden endres.
  if (sec.depsCopy.length > 0 || sec.depsInstall.length > 0) {
    lines.push("# Kopier deps-filer først så install-laget kan caches");
    if (sec.depsCopy.length > 0) lines.push(...sec.depsCopy);
    if (sec.depsInstall.length > 0) lines.push(...sec.depsInstall);
    lines.push("");
  }

  if (sec.appCopy.length > 0) {
    lines.push("# Kopier applikasjonskoden");
    lines.push(...sec.appCopy);
    lines.push("");
  }

  if (sec.expose !== null) {
    lines.push(`EXPOSE ${sec.expose}`);
    lines.push("");
  }

  if (sec.volume) {
    lines.push(sec.volume);
    lines.push("");
  }

  if (sec.healthcheck) {
    lines.push(sec.healthcheck);
    lines.push("");
  }

  // USER settes sent — bygge-trinn må ofte være root.
  if (sec.user) {
    lines.push(sec.user);
    lines.push("");
  }

  // CMD må være siste linje for klar synlighet.
  if (sec.cmd) {
    lines.push(cmdToExecForm(sec.cmd));
  } else {
    lines.push('CMD ["echo", "Ingen runtime valgt — kryss av en CMD i Builder"]');
  }

  const dockerfile = lines.join("\n");

  // === .dockerignore =================================================
  const dockerignore =
    sec.dockerignore.size > 0
      ? [
          "# Generert av Dockerfile Builder — hold COPY . . liten og ren",
          ...Array.from(sec.dockerignore),
        ].join("\n")
      : null;

  // === docker-compose.yml ===========================================
  let compose: string | null = null;
  if (Object.keys(sec.composeServices).length > 0) {
    const out: string[] = [];
    out.push("# Generert av Dockerfile Builder");
    out.push("# Kjør: docker compose up --build");
    out.push("");
    out.push("services:");

    // Slå sammen app-service med eventuelle ekstra volumer (SQLite-bind).
    const services = { ...sec.composeServices };
    const extraAppLines = services["_app_volumes"];
    delete services["_app_volumes"];

    // Sørg for at app rendres først, så db
    const order = ["app", ...Object.keys(services).filter((k) => k !== "app")];
    for (const name of order) {
      if (!services[name]) continue;
      out.push(services[name]);
      if (name === "app" && extraAppLines) {
        out.push(extraAppLines);
      }
      out.push("");
    }

    if (sec.composeVolumes.size > 0) {
      out.push("volumes:");
      for (const v of sec.composeVolumes) {
        out.push(`  ${v}:`);
      }
      out.push("");
    }

    if (sec.composeNetworks.size > 0) {
      out.push("networks:");
      for (const n of sec.composeNetworks) {
        out.push(`  ${n}:`);
        out.push("    driver: bridge");
      }
    }

    compose = out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
  }

  return {
    files: { dockerfile, dockerignore, compose },
    exposedPort: sec.expose,
  };
}
