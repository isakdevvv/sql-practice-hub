// Kommando-dispatch for venv/pip-simulatoren. Tar inn `VenvRepo` + tekstlinje
// og returnerer ny repo + output. Modellerer python -m venv, source activate,
// deactivate, pip install/uninstall/list/freeze, samt litt shell (ls, cat,
// echo > fil, rm, pwd, mkdir, which). Ingen pipes, ingen subshell.

import {
  activeEnv,
  canonicalPackageName,
  defaultVersion,
  fileExists,
  formatFreeze,
  formatPipList,
  freshVenvRepo,
  isKnownPackage,
  parseRequirements,
  pipPath,
  pythonPath,
  readFile,
  topLevelEntries,
  type Venv,
  type VenvRepo,
} from "./engine";

export interface CommandResult {
  repo: VenvRepo;
  out: string[];
  error?: boolean;
}

/** Tokenizer som git/commands.ts — håndterer enkle/doble fnutter. */
export function tokenize(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      if (ch === quote) quote = null;
      else if (ch === "\\" && i + 1 < line.length && line[i + 1] === quote) cur += line[++i];
      else cur += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (/\s/.test(ch)) {
      if (cur.length) {
        out.push(cur);
        cur = "";
      }
      continue;
    }
    cur += ch;
  }
  if (cur.length) out.push(cur);
  return out;
}

function extractRedirect(
  tokens: string[],
): { tokens: string[]; redirect?: { path: string; append: boolean } } {
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === ">" || tokens[i] === ">>") {
      const append = tokens[i] === ">>";
      const path = tokens[i + 1];
      return { tokens: tokens.slice(0, i), redirect: path ? { path, append } : undefined };
    }
  }
  return { tokens };
}

/* --------------------------- Felles utils --------------------------- */

function withFile(repo: VenvRepo, path: string, content: string): VenvRepo {
  return { ...repo, files: { ...repo.files, [path]: content } };
}

function withoutFiles(repo: VenvRepo, paths: string[]): VenvRepo {
  const files = { ...repo.files };
  for (const p of paths) delete files[p];
  return { ...repo, files };
}

function updateActiveEnv(repo: VenvRepo, mut: (env: Venv) => Venv): VenvRepo {
  if (repo.activatedVenv && repo.venvs[repo.activatedVenv]) {
    const cur = repo.venvs[repo.activatedVenv];
    return {
      ...repo,
      venvs: { ...repo.venvs, [repo.activatedVenv]: mut(cur) },
    };
  }
  return { ...repo, system: mut(repo.system) };
}

/** Skriv linjer til en fil (med ev. append eller overwrite). */
function writeFileLines(
  repo: VenvRepo,
  path: string,
  lines: string[],
  append: boolean,
): VenvRepo {
  const existing = append && fileExists(repo, path) ? (readFile(repo, path) ?? "") : "";
  const newContent = (existing ? existing + (existing.endsWith("\n") ? "" : "\n") : "") +
    lines.join("\n") + (lines.length ? "\n" : "");
  return withFile(repo, path, newContent);
}

/* --------------------------- Hoved-dispatch --------------------------- */

export function runLine(repo: VenvRepo, line: string): CommandResult {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return { repo, out: [] };
  const allTokens = tokenize(trimmed);
  if (allTokens.length === 0) return { repo, out: [] };

  const { tokens, redirect } = extractRedirect(allTokens);
  const cmd = tokens[0];
  const rest = tokens.slice(1);

  // Spesial: `source X` eller `. X` for å aktivere venv.
  if (cmd === "source" || cmd === ".") return runSource(repo, rest);

  if (cmd === "deactivate") return runDeactivate(repo);

  if (cmd === "python" || cmd === "python3") return runPython(repo, rest);
  if (cmd === "pip" || cmd === "pip3") return runPip(repo, rest, redirect);

  // Shell-aktige
  if (cmd === "ls") return shellLs(repo, rest);
  if (cmd === "cat") return shellCat(repo, rest);
  if (cmd === "pwd") return { repo, out: ["/proj"] };
  if (cmd === "clear") return { repo, out: ["__CLEAR__"] };
  if (cmd === "echo") return shellEcho(repo, rest, redirect);
  if (cmd === "touch") return shellTouch(repo, rest);
  if (cmd === "rm") return shellRm(repo, rest);
  if (cmd === "mkdir") return { repo, out: [] }; // ingen ekte mapper
  if (cmd === "which") return shellWhich(repo, rest);
  if (cmd === "env" || cmd === "printenv") return shellEnv(repo, rest);

  return { repo, out: [`${cmd}: command not found`], error: true };
}

export function runScript(repo: VenvRepo, lines: string[]): { repo: VenvRepo; out: string[] } {
  let cur = repo;
  const all: string[] = [];
  for (const l of lines) {
    const r = runLine(cur, l);
    cur = r.repo;
    for (const o of r.out) if (o !== "__CLEAR__") all.push(o);
  }
  return { repo: cur, out: all };
}

export function freshRepo(): VenvRepo {
  return freshVenvRepo();
}

/* --------------------------- python --------------------------- */

function runPython(repo: VenvRepo, args: string[]): CommandResult {
  // `python -m venv <name>`
  if (args[0] === "-m" && args[1] === "venv" && args[2]) {
    const name = args[2];
    if (name in repo.venvs) {
      return { repo, out: [`Error: venv '${name}' eksisterer allerede.`], error: true };
    }
    const venvs = {
      ...repo.venvs,
      [name]: {
        python: repo.system.python,
        packages: {
          pip: "23.3.2",
          setuptools: "69.0.3",
        },
      },
    };
    // Marker venv-mappa med pyvenv.cfg + bin/activate så `ls` viser den.
    const files = {
      ...repo.files,
      [`${name}/pyvenv.cfg`]: `home = /usr/bin\nversion = ${repo.system.python}\n`,
      [`${name}/bin/activate`]: `# venv activate script for ${name}\n`,
      [`${name}/bin/python`]: "",
      [`${name}/bin/pip`]: "",
    };
    return { repo: { ...repo, venvs, files }, out: [] };
  }

  // `python --version` / `python -V`
  if (args[0] === "--version" || args[0] === "-V") {
    return { repo, out: [`Python ${activeEnv(repo).python}`] };
  }

  // `python -c "import X"` — sjekk import
  if (args[0] === "-c") {
    const code = args.slice(1).join(" ");
    return runPythonCode(repo, code);
  }

  // `python script.py`
  if (args[0]) {
    const path = args[0];
    if (!fileExists(repo, path)) {
      return {
        repo,
        out: [`python: can't open file '${path}': [Errno 2] No such file or directory`],
        error: true,
      };
    }
    return runPythonCode(repo, readFile(repo, path) ?? "");
  }

  return { repo, out: ["Python REPL er ikke modellert. Bruk `python -c \"...\"` eller `python script.py`."], error: true };
}

/** Mini-tolker: leter etter `import X`/`from X import ...` og `print(...)`. */
function runPythonCode(repo: VenvRepo, code: string): CommandResult {
  const env = activeEnv(repo);
  const out: string[] = [];
  const lines = code.split(/\r?\n|;/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    // import X / from X import Y / import X as Y
    const imp = line.match(/^(?:import|from)\s+([A-Za-z_][A-Za-z0-9_]*)/);
    if (imp) {
      const mod = imp[1];
      // Standard-bibliotek: en hardkodet shortlist.
      const STD = new Set([
        "os", "sys", "math", "json", "re", "time", "random", "collections",
        "itertools", "functools", "pathlib", "datetime", "io", "csv", "sqlite3",
        "subprocess", "argparse", "unittest", "typing", "dataclasses", "enum",
        "string", "textwrap", "hashlib", "base64", "urllib",
      ]);
      const installed = canonicalPackageName(mod) in env.packages || STD.has(mod);
      // sklearn er populært å forveksle med scikit-learn
      const aliased = mod === "sklearn" && "scikit-learn" in env.packages;
      if (!installed && !aliased) {
        return {
          repo: { ...repo, lastRun: out.concat([`ModuleNotFoundError: No module named '${mod}'`]).join("\n") },
          out: [...out, `Traceback (most recent call last):`, `  File "<stdin>", line 1, in <module>`, `ModuleNotFoundError: No module named '${mod}'`],
          error: true,
        };
      }
      continue;
    }
    // print("...") eller print('...')
    const pr = line.match(/^print\s*\(\s*(['"])([^'"]*)\1\s*\)\s*$/);
    if (pr) {
      out.push(pr[2]);
      continue;
    }
    // print(1+2) — bare aksepter, ikke evaluer
    if (/^print\s*\(/.test(line)) {
      out.push("");
      continue;
    }
    // Andre linjer: stille, vi modellerer ikke uttrykk.
  }
  return { repo: { ...repo, lastRun: out.join("\n") }, out };
}

/* --------------------------- pip --------------------------- */

function runPip(
  repo: VenvRepo,
  args: string[],
  redirect?: { path: string; append: boolean },
): CommandResult {
  const sub = args[0];
  if (!sub) return { repo, out: ["Usage: pip <command> [options]"], error: true };

  if (sub === "--version" || sub === "-V") {
    const env = activeEnv(repo);
    return { repo, out: [`pip ${env.packages.pip ?? "23.3.2"} from ${pipPath(repo)}`] };
  }

  if (sub === "install") return pipInstall(repo, args.slice(1));
  if (sub === "uninstall") return pipUninstall(repo, args.slice(1));
  if (sub === "list") return pipList(repo);
  if (sub === "freeze") return pipFreeze(repo, redirect);
  if (sub === "show") return pipShow(repo, args.slice(1));

  return { repo, out: [`pip: ukjent subkommando '${sub}'`], error: true };
}

function pipInstall(repo: VenvRepo, args: string[]): CommandResult {
  // -r requirements.txt
  if (args[0] === "-r") {
    const path = args[1];
    if (!path) return { repo, out: ["pip install -r krever en filsti."], error: true };
    if (!fileExists(repo, path)) {
      return {
        repo,
        out: [`ERROR: Could not open requirements file: [Errno 2] No such file or directory: '${path}'`],
        error: true,
      };
    }
    const reqs = parseRequirements(readFile(repo, path) ?? "");
    if (!reqs.length) return { repo, out: [`(${path} er tom — ingenting å installere)`] };
    let cur = repo;
    const out: string[] = [];
    let warned = false;
    if (!cur.activatedVenv) {
      out.push("WARNING: pip kjører mot system-Python. Aktiver et venv først — `source .venv/bin/activate`.");
      warned = true;
    }
    for (const r of reqs) {
      const res = installOne(cur, r.name, r.spec);
      cur = res.repo;
      out.push(...res.out);
      if (res.error) return { repo: cur, out, error: true };
    }
    if (!warned) out.push(`Successfully installed ${reqs.length} pakke${reqs.length === 1 ? "" : "r"} fra ${path}.`);
    return { repo: cur, out };
  }

  // pip install pkg [pkg ...]   — støtter også pkg==version
  if (!args.length) return { repo, out: ["ERROR: You must give at least one requirement to install"], error: true };
  let cur = repo;
  const out: string[] = [];
  if (!cur.activatedVenv) {
    out.push("WARNING: pip kjører mot system-Python. Aktiver et venv først — `source .venv/bin/activate`.");
  }
  for (const spec of args) {
    const m = spec.match(/^([A-Za-z0-9_.\-]+)(?:==([0-9A-Za-z.\-]+))?$/);
    if (!m) {
      return { repo: cur, out: [...out, `ERROR: Invalid requirement: '${spec}'`], error: true };
    }
    const res = installOne(cur, m[1], m[2] ?? null);
    cur = res.repo;
    out.push(...res.out);
    if (res.error) return { repo: cur, out, error: true };
  }
  return { repo: cur, out };
}

function installOne(repo: VenvRepo, name: string, spec: string | null): CommandResult {
  if (!isKnownPackage(name)) {
    return {
      repo,
      out: [
        `ERROR: Could not find a version that satisfies the requirement ${name}`,
        `ERROR: No matching distribution found for ${name}`,
      ],
      error: true,
    };
  }
  const canonical = canonicalPackageName(name);
  const version = spec ?? defaultVersion(canonical);
  const next = updateActiveEnv(repo, (env) => ({
    ...env,
    packages: { ...env.packages, [canonical]: version },
  }));
  return {
    repo: next,
    out: [
      `Collecting ${name}${spec ? `==${spec}` : ""}`,
      `  Downloading ${canonical}-${version}-py3-none-any.whl`,
      `Installing collected packages: ${canonical}`,
      `Successfully installed ${canonical}-${version}`,
    ],
  };
}

function pipUninstall(repo: VenvRepo, args: string[]): CommandResult {
  const yes = args.includes("-y") || args.includes("--yes");
  const pkgs = args.filter((a) => a !== "-y" && a !== "--yes");
  if (!pkgs.length) return { repo, out: ["ERROR: You must give at least one requirement to uninstall"], error: true };
  let cur = repo;
  const out: string[] = [];
  for (const p of pkgs) {
    const canonical = canonicalPackageName(p);
    const env = activeEnv(cur);
    if (!(canonical in env.packages)) {
      out.push(`WARNING: Skipping ${p} as it is not installed.`);
      continue;
    }
    cur = updateActiveEnv(cur, (env) => {
      const pkgs = { ...env.packages };
      delete pkgs[canonical];
      return { ...env, packages: pkgs };
    });
    out.push(`Successfully uninstalled ${canonical}-${env.packages[canonical]}`);
    if (!yes) out.push(`(brukte underforstått -y — i ekte pip må du bekrefte)`);
  }
  return { repo: cur, out };
}

function pipList(repo: VenvRepo): CommandResult {
  const env = activeEnv(repo);
  return { repo, out: formatPipList(env) };
}

function pipFreeze(
  repo: VenvRepo,
  redirect?: { path: string; append: boolean },
): CommandResult {
  const env = activeEnv(repo);
  const lines = formatFreeze(env);
  if (redirect) {
    const next = writeFileLines(repo, redirect.path, lines, redirect.append);
    return { repo: next, out: [] };
  }
  return { repo, out: lines };
}

function pipShow(repo: VenvRepo, args: string[]): CommandResult {
  const name = args[0];
  if (!name) return { repo, out: ["ERROR: pip show krever et pakke-navn"], error: true };
  const env = activeEnv(repo);
  const canonical = canonicalPackageName(name);
  if (!(canonical in env.packages)) {
    return { repo, out: [`WARNING: Package(s) not found: ${name}`], error: true };
  }
  const v = env.packages[canonical];
  return {
    repo,
    out: [
      `Name: ${canonical}`,
      `Version: ${v}`,
      `Location: ${repo.activatedVenv ? `/proj/${repo.activatedVenv}/lib/python3.11/site-packages` : "/usr/lib/python3.11/site-packages"}`,
    ],
  };
}

/* --------------------------- source / deactivate --------------------------- */

function runSource(repo: VenvRepo, args: string[]): CommandResult {
  const path = args[0];
  if (!path) return { repo, out: ["source: filename argument required"], error: true };
  // Aksepter både `source X/bin/activate` og `source X`.
  const m = path.match(/^([^/]+)(?:\/bin\/activate)?$/);
  if (!m) {
    return { repo, out: [`source: ${path}: kan ikke aktivere — forventet '<venv>/bin/activate'`], error: true };
  }
  const venvName = m[1];
  if (!(venvName in repo.venvs)) {
    return { repo, out: [`bash: ${path}: No such file or directory`], error: true };
  }
  if (repo.activatedVenv === venvName) {
    return { repo, out: [`(${venvName} er allerede aktivt)`] };
  }
  return { repo: { ...repo, activatedVenv: venvName }, out: [] };
}

function runDeactivate(repo: VenvRepo): CommandResult {
  if (!repo.activatedVenv) {
    return { repo, out: ["(ingen venv aktivt — deactivate har ingen effekt)"] };
  }
  return { repo: { ...repo, activatedVenv: null }, out: [] };
}

/* --------------------------- shell --------------------------- */

function shellLs(repo: VenvRepo, args: string[]): CommandResult {
  // -l og -a er bare for vise, vi viser alt likevel
  const longFmt = args.includes("-l") || args.includes("-la") || args.includes("-al");
  const path = args.find((a) => !a.startsWith("-"));
  if (path) {
    // ls inn i en venv-mappe
    const prefix = `${path.replace(/\/$/, "")}/`;
    const matches = Object.keys(repo.files)
      .filter((f) => f.startsWith(prefix))
      .map((f) => f.slice(prefix.length));
    if (!matches.length && !(path in repo.venvs)) {
      return { repo, out: [`ls: cannot access '${path}': No such file or directory`], error: true };
    }
    const entries = new Set<string>();
    for (const m of matches) {
      const slash = m.indexOf("/");
      entries.add(slash === -1 ? m : m.slice(0, slash));
    }
    return { repo, out: longFmt ? Array.from(entries).sort() : [Array.from(entries).sort().join("  ")] };
  }
  const tops = topLevelEntries(repo);
  if (!tops.length) return { repo, out: [] };
  if (longFmt) {
    return { repo, out: tops.map((e) => `${e.isDir ? "d" : "-"}  ${e.name}`) };
  }
  return { repo, out: [tops.map((e) => e.name + (e.isDir ? "/" : "")).join("  ")] };
}

function shellCat(repo: VenvRepo, args: string[]): CommandResult {
  if (!args.length) return { repo, out: ["cat: missing operand"], error: true };
  const out: string[] = [];
  for (const p of args) {
    if (!fileExists(repo, p)) {
      return { repo, out: [`cat: ${p}: No such file or directory`], error: true };
    }
    const c = readFile(repo, p) ?? "";
    if (c) out.push(...c.replace(/\n$/, "").split("\n"));
  }
  return { repo, out };
}

function shellEcho(
  repo: VenvRepo,
  args: string[],
  redirect?: { path: string; append: boolean },
): CommandResult {
  const text = args.join(" ");
  if (redirect) {
    const lines = text.split("\n");
    const next = writeFileLines(repo, redirect.path, lines, redirect.append);
    return { repo: next, out: [] };
  }
  return { repo, out: [text] };
}

function shellTouch(repo: VenvRepo, args: string[]): CommandResult {
  let cur = repo;
  for (const p of args) {
    if (!fileExists(cur, p)) cur = withFile(cur, p, "");
  }
  return { repo: cur, out: [] };
}

function shellRm(repo: VenvRepo, args: string[]): CommandResult {
  const recursive = args.some((a) => a === "-r" || a === "-rf" || a === "-fr" || a === "-R");
  const force = args.some((a) => a === "-f" || a === "-rf" || a === "-fr");
  const paths = args.filter((a) => !a.startsWith("-"));
  if (!paths.length) return { repo, out: ["rm: missing operand"], error: true };
  let cur = repo;
  for (const p of paths) {
    // Sletter vi en hel venv?
    if (p in repo.venvs) {
      if (!recursive) return { repo: cur, out: [`rm: cannot remove '${p}': Is a directory`], error: true };
      // Fjern alle files under prefix + fjern venvs-entry + deaktiver om aktiv
      const prefix = `${p}/`;
      const toDelete = Object.keys(cur.files).filter((f) => f.startsWith(prefix) || f === p);
      cur = withoutFiles(cur, toDelete);
      const venvs = { ...cur.venvs };
      delete venvs[p];
      cur = {
        ...cur,
        venvs,
        activatedVenv: cur.activatedVenv === p ? null : cur.activatedVenv,
      };
      continue;
    }
    // Vanlig fil
    if (!fileExists(cur, p)) {
      if (force) continue;
      return { repo: cur, out: [`rm: cannot remove '${p}': No such file or directory`], error: true };
    }
    cur = withoutFiles(cur, [p]);
  }
  return { repo: cur, out: [] };
}

function shellWhich(repo: VenvRepo, args: string[]): CommandResult {
  const target = args[0];
  if (!target) return { repo, out: [] };
  if (target === "python" || target === "python3") return { repo, out: [pythonPath(repo)] };
  if (target === "pip" || target === "pip3") return { repo, out: [pipPath(repo)] };
  return { repo, out: [], error: true };
}

function shellEnv(repo: VenvRepo, args: string[]): CommandResult {
  // Bare det studenter trenger se: VIRTUAL_ENV.
  const filterPrefix = args[0]; // ev. `env | grep ...` ignorerer vi
  const lines = [];
  if (repo.activatedVenv) lines.push(`VIRTUAL_ENV=/proj/${repo.activatedVenv}`);
  lines.push(`PATH=${repo.activatedVenv ? `/proj/${repo.activatedVenv}/bin:` : ""}/usr/local/bin:/usr/bin:/bin`);
  return { repo, out: filterPrefix ? lines.filter((l) => l.startsWith(filterPrefix.toUpperCase())) : lines };
}
