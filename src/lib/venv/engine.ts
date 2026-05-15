// Venv/pip-simulator — en deterministisk, lokal "fake python+pip" som lar
// studenter øve på Python-virtuelle-miljø: lag venv, aktiver, installer
// pakker, frys requirements.txt, debugge ModuleNotFoundError.
//
// Modell:
// - `files`: flat Record<path, content>. "mappe/fil.txt" er bare en streng.
// - `venvs`: Record<name, Venv>. Hver venv har python-versjon og pakker.
// - `activatedVenv`: navn på aktiv venv eller null (system-python aktiv).
// - `system`: globalt python-miljø — pakker installert med "naked" pip.
//
// Ikke modellert: ekte fil-tre, sub-prosesser, pipes, subshell. Bra nok for
// pedagogisk drill av venv-flyten.

export interface Venv {
  python: string; // f.eks. "3.11.5"
  packages: Record<string, string>; // pakke → versjon
}

export interface VenvRepo {
  /** Flat fil-modell. Stier som "my_env/bin/activate" representerer "filer i mappe". */
  files: Record<string, string>;
  /** Registrerte virtuelle miljø, key = mappenavn (matcher en prefix i files). */
  venvs: Record<string, Venv>;
  /** Navn på aktiv venv, eller null (= system-python). */
  activatedVenv: string | null;
  /** System-Python miljø (det du får uten å aktivere noe). */
  system: Venv;
  /** Logisk tid for å gi installerte pakker stabile timestamps om nødvendig. */
  clock: number;
  /** Sist `python`-kjøring sin output, til UI-visning. */
  lastRun?: string;
}

export function freshVenvRepo(): VenvRepo {
  return {
    files: {},
    venvs: {},
    activatedVenv: null,
    system: {
      python: "3.11.5",
      packages: {
        pip: "23.3.2",
        setuptools: "69.0.3",
      },
    },
    clock: 0,
  };
}

/* --------------------------- Pakke-registry --------------------------- */

// Liten katalog over "kjente" pakker så `pip install <navn>` kan validere
// navn og gi en realistisk versjon. Ukjent pakke → feilmelding (som ekte pip).
export const PACKAGE_REGISTRY: Record<string, string> = {
  numpy: "1.26.4",
  pandas: "2.1.4",
  matplotlib: "3.8.2",
  "scikit-learn": "1.4.0",
  scipy: "1.11.4",
  torch: "2.2.0",
  tensorflow: "2.15.0",
  flask: "3.0.0",
  django: "5.0.1",
  fastapi: "0.109.0",
  requests: "2.31.0",
  beautifulsoup4: "4.12.2",
  pytest: "7.4.4",
  black: "23.12.1",
  ruff: "0.1.14",
  jupyter: "1.0.0",
  ipython: "8.20.0",
  pillow: "10.2.0",
  sqlalchemy: "2.0.25",
  pymysql: "1.1.0",
  pyodide: "0.25.0",
  mypy: "1.8.0",
  pip: "23.3.2",
  setuptools: "69.0.3",
  wheel: "0.42.0",
};

export function isKnownPackage(name: string): boolean {
  return name.toLowerCase() in PACKAGE_REGISTRY;
}

export function canonicalPackageName(name: string): string {
  return name.toLowerCase();
}

export function defaultVersion(name: string): string {
  return PACKAGE_REGISTRY[canonicalPackageName(name)] ?? "0.0.0";
}

/* --------------------------- Aktivt miljø --------------------------- */

/** Returnerer det aktive Python-miljøet (venv eller system). */
export function activeEnv(repo: VenvRepo): Venv {
  if (repo.activatedVenv && repo.venvs[repo.activatedVenv]) {
    return repo.venvs[repo.activatedVenv];
  }
  return repo.system;
}

/** Bane som `which python` skal returnere. */
export function pythonPath(repo: VenvRepo): string {
  if (repo.activatedVenv) return `/proj/${repo.activatedVenv}/bin/python`;
  return "/usr/bin/python3";
}

export function pipPath(repo: VenvRepo): string {
  if (repo.activatedVenv) return `/proj/${repo.activatedVenv}/bin/pip`;
  return "/usr/bin/pip3";
}

/* --------------------------- Fil-helpers --------------------------- */

/** Liste topp-nivå-entries (filer + mapper) i workdir. */
export function topLevelEntries(repo: VenvRepo): { name: string; isDir: boolean }[] {
  const seen = new Map<string, boolean>(); // name → isDir
  for (const p of Object.keys(repo.files)) {
    const slash = p.indexOf("/");
    if (slash === -1) {
      if (!seen.has(p)) seen.set(p, false);
    } else {
      const dir = p.slice(0, slash);
      seen.set(dir, true);
    }
  }
  // Venvs registrert men ingen filer? Vis dem også som mapper.
  for (const name of Object.keys(repo.venvs)) {
    if (!seen.has(name)) seen.set(name, true);
  }
  return Array.from(seen.entries())
    .map(([name, isDir]) => ({ name, isDir }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Sjekk om en fil med eksakt sti finnes. */
export function fileExists(repo: VenvRepo, path: string): boolean {
  return path in repo.files;
}

/** Hent fil-innhold eller null. */
export function readFile(repo: VenvRepo, path: string): string | null {
  return repo.files[path] ?? null;
}

/** Parse en requirements.txt-tekst til (navn, ev. spec). */
export function parseRequirements(
  text: string,
): { name: string; spec: string | null }[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"))
    .map((line) => {
      const m = line.match(/^([A-Za-z0-9_.\-]+)(?:\s*==\s*([0-9A-Za-z.\-]+))?/);
      if (!m) return { name: line, spec: null };
      return { name: m[1], spec: m[2] ?? null };
    });
}

/** Format pakker som `name==version` linjer, sortert alfabetisk. */
export function formatFreeze(env: Venv): string[] {
  return Object.keys(env.packages)
    .filter((n) => n !== "pip" && n !== "setuptools" && n !== "wheel")
    .sort((a, b) => a.localeCompare(b))
    .map((n) => `${n}==${env.packages[n]}`);
}

/** Format pakker som `pip list`-tabell. */
export function formatPipList(env: Venv): string[] {
  const rows = Object.keys(env.packages)
    .sort((a, b) => a.localeCompare(b))
    .map((n) => [n, env.packages[n]]);
  const nameW = Math.max(7, ...rows.map((r) => r[0].length));
  const verW = Math.max(7, ...rows.map((r) => r[1].length));
  const out: string[] = [];
  out.push(`${"Package".padEnd(nameW)} ${"Version".padEnd(verW)}`);
  out.push(`${"-".repeat(nameW)} ${"-".repeat(verW)}`);
  for (const [n, v] of rows) {
    out.push(`${n.padEnd(nameW)} ${v.padEnd(verW)}`);
  }
  return out;
}
