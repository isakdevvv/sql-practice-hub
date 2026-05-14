// Kommando-dispatch for Git-simulator. Tar inn en `Repo` og en linje av tekst
// (det studenten skrev i terminalen), returnerer ny `Repo` + tekstlig output.
//
// Vi modellerer en delmengde av git + et lite shell (ls, cat, echo > fil, rm,
// touch, pwd, clear, mkdir, mv). Det er ingen subshell — pipes, &&, ;, $()
// blir IKKE tolket. Vi splitter på første > / >> for redirection.

import {
  computeStatus,
  currentBranch,
  emptyRepo,
  headTree,
  isAncestor,
  makeCommitHash,
  mergeBase,
  resolveHead,
  resolveRef,
  walkHistory,
  type Commit,
  type Hash,
  type Repo,
} from "./engine";

export interface CommandResult {
  repo: Repo;
  /** Linjer som vises i terminalen, i rekkefølge. */
  out: string[];
  /** True hvis kommandoen gav en feilkode (men vi viser fortsatt out). */
  error?: boolean;
}

/** Parse en kommandolinje til (cmd, args). Støtter dobbel- og enkel-quotes. */
export function tokenize(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      if (ch === quote) {
        quote = null;
      } else if (ch === "\\" && i + 1 < line.length && line[i + 1] === quote) {
        cur += line[++i];
      } else {
        cur += ch;
      }
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

/** Trekk ut ev. redirection: `cmd ... > fil` eller `>> fil`. */
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

export function runLine(repo: Repo, line: string): CommandResult {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return { repo, out: [] };
  const tokens = tokenize(trimmed);
  if (tokens.length === 0) return { repo, out: [] };

  // Felles redirection-håndtering for echo (eneste der det gir mening for oss).
  const { tokens: head, redirect } = extractRedirect(tokens);

  const cmd = head[0];
  const rest = head.slice(1);

  if (cmd === "git") return runGit(repo, rest);
  if (cmd === "ls") return shellLs(repo, rest);
  if (cmd === "cat") return shellCat(repo, rest);
  if (cmd === "pwd") return { repo, out: ["/repo"] };
  if (cmd === "clear") return { repo, out: ["__CLEAR__"] };
  if (cmd === "touch") return shellTouch(repo, rest);
  if (cmd === "rm") return shellRm(repo, rest);
  if (cmd === "mv") return shellMv(repo, rest);
  if (cmd === "mkdir") return { repo, out: [] }; // ingen ekte mapper
  if (cmd === "echo") return shellEcho(repo, rest, redirect);

  return { repo, out: [`${cmd}: command not found`], error: true };
}

/* =============================================================
 * Shell-kommandoer
 * ============================================================= */

function shellLs(repo: Repo, args: string[]): CommandResult {
  const showAll = args.includes("-a") || args.includes("-la") || args.includes("-al");
  const long = args.includes("-l") || args.includes("-la") || args.includes("-al");
  const paths = Object.keys(repo.workdir).sort();
  const lines = long
    ? paths.map((p) => `-rw-r--r-- 1 student staff ${repo.workdir[p].length} ${p}`)
    : [paths.join("  ")].filter(Boolean);
  if (showAll && repo.initialized) lines.unshift(".git/");
  return { repo, out: lines };
}

function shellCat(repo: Repo, args: string[]): CommandResult {
  if (args.length === 0) return { repo, out: ["cat: missing operand"], error: true };
  const out: string[] = [];
  for (const p of args) {
    if (!(p in repo.workdir))
      return { repo, out: [`cat: ${p}: No such file or directory`], error: true };
    out.push(...repo.workdir[p].split("\n"));
  }
  return { repo, out };
}

function shellTouch(repo: Repo, args: string[]): CommandResult {
  if (args.length === 0) return { repo, out: ["touch: missing file"], error: true };
  const wd = { ...repo.workdir };
  for (const p of args) if (!(p in wd)) wd[p] = "";
  return { repo: { ...repo, workdir: wd }, out: [] };
}

function shellRm(repo: Repo, args: string[]): CommandResult {
  const files = args.filter((a) => !a.startsWith("-"));
  if (files.length === 0) return { repo, out: ["rm: missing operand"], error: true };
  const wd = { ...repo.workdir };
  for (const p of files) {
    if (!(p in wd)) return { repo, out: [`rm: ${p}: No such file or directory`], error: true };
    delete wd[p];
  }
  return { repo: { ...repo, workdir: wd }, out: [] };
}

function shellMv(repo: Repo, args: string[]): CommandResult {
  if (args.length !== 2)
    return { repo, out: ["usage: mv <kilde> <mål>"], error: true };
  const [src, dst] = args;
  if (!(src in repo.workdir))
    return { repo, out: [`mv: ${src}: No such file or directory`], error: true };
  const wd = { ...repo.workdir, [dst]: repo.workdir[src] };
  delete wd[src];
  return { repo: { ...repo, workdir: wd }, out: [] };
}

function shellEcho(
  repo: Repo,
  args: string[],
  redirect?: { path: string; append: boolean },
): CommandResult {
  const text = args.join(" ");
  if (!redirect) return { repo, out: [text] };
  const cur = repo.workdir[redirect.path] ?? "";
  const next = redirect.append ? (cur ? cur + "\n" + text : text) : text;
  return {
    repo: { ...repo, workdir: { ...repo.workdir, [redirect.path]: next } },
    out: [],
  };
}

/* =============================================================
 * git-kommandoer
 * ============================================================= */

function runGit(repo: Repo, args: string[]): CommandResult {
  if (args.length === 0)
    return { repo, out: ["usage: git <command> [<args>]"], error: true };
  const sub = args[0];
  const rest = args.slice(1);

  if (sub === "init") return gitInit(repo, rest);

  // Alle andre git-kommandoer krever et initialisert repo
  if (!repo.initialized)
    return {
      repo,
      out: ["fatal: not a git repository (kjør 'git init' først)"],
      error: true,
    };

  switch (sub) {
    case "status":
      return gitStatus(repo);
    case "add":
      return gitAdd(repo, rest);
    case "rm":
      return gitRm(repo, rest);
    case "commit":
      return gitCommit(repo, rest);
    case "log":
      return gitLog(repo, rest);
    case "branch":
      return gitBranch(repo, rest);
    case "checkout":
      return gitCheckout(repo, rest);
    case "switch":
      return gitSwitch(repo, rest);
    case "merge":
      return gitMerge(repo, rest);
    case "reset":
      return gitReset(repo, rest);
    case "diff":
      return gitDiff(repo, rest);
    case "tag":
      return gitTag(repo, rest);
    case "config":
      return gitConfig(repo, rest);
    case "restore":
      return gitRestore(repo, rest);
    case "show":
      return gitShow(repo, rest);
    default:
      return { repo, out: [`git: '${sub}' is not a git command`], error: true };
  }
}

function gitInit(repo: Repo, _args: string[]): CommandResult {
  if (repo.initialized)
    return {
      repo,
      out: [`Reinitialized existing Git repository in /repo/.git/`],
    };
  return {
    repo: {
      ...repo,
      initialized: true,
      HEAD: { kind: "branch", name: repo.config.defaultBranch },
    },
    out: [`Initialized empty Git repository in /repo/.git/`],
  };
}

function gitStatus(repo: Repo): CommandResult {
  const s = computeStatus(repo);
  const out: string[] = [];
  if (s.branch) out.push(`On branch ${s.branch}`);
  else if (s.detached) out.push(`HEAD detached at ${s.detached}`);

  const headHash = resolveHead(repo);
  if (!headHash) out.push("No commits yet");

  if (s.clean) {
    out.push("nothing to commit, working tree clean");
    return { repo, out };
  }

  if (s.staged.length) {
    out.push("Changes to be committed:");
    for (const f of s.staged) {
      const tag =
        f.kind === "staged-added"
          ? "new file"
          : f.kind === "staged-deleted"
            ? "deleted"
            : "modified";
      out.push(`  ${tag}:   ${f.path}`);
    }
  }
  if (s.unstaged.length) {
    out.push("Changes not staged for commit:");
    for (const f of s.unstaged) {
      const tag = f.kind === "deleted" ? "deleted" : "modified";
      out.push(`  ${tag}:   ${f.path}`);
    }
  }
  if (s.untracked.length) {
    out.push("Untracked files:");
    for (const p of s.untracked) out.push(`  ${p}`);
  }
  return { repo, out };
}

function gitAdd(repo: Repo, args: string[]): CommandResult {
  if (args.length === 0)
    return { repo, out: ["Nothing specified, nothing added."], error: true };
  const idx = { ...repo.index };
  const all = args.includes(".") || args.includes("-A") || args.includes("--all");
  const targets = all
    ? new Set<string>([...Object.keys(repo.workdir), ...Object.keys(repo.index)])
    : new Set<string>(args.filter((a) => !a.startsWith("-")));

  for (const p of targets) {
    if (p in repo.workdir) {
      idx[p] = repo.workdir[p];
    } else if (p in repo.index) {
      delete idx[p];
    } else if (!all) {
      return {
        repo,
        out: [`fatal: pathspec '${p}' did not match any files`],
        error: true,
      };
    }
  }
  return { repo: { ...repo, index: idx }, out: [] };
}

function gitRm(repo: Repo, args: string[]): CommandResult {
  const files = args.filter((a) => !a.startsWith("-"));
  if (files.length === 0)
    return { repo, out: ["fatal: no files specified"], error: true };
  const idx = { ...repo.index };
  const wd = { ...repo.workdir };
  for (const p of files) {
    if (!(p in idx) && !(p in wd))
      return {
        repo,
        out: [`fatal: pathspec '${p}' did not match any files`],
        error: true,
      };
    delete idx[p];
    delete wd[p];
  }
  return { repo: { ...repo, index: idx, workdir: wd }, out: [] };
}

function gitCommit(repo: Repo, args: string[]): CommandResult {
  // Støtter:  git commit -m "msg"   git commit -am "msg"   git commit --message="msg"
  let message: string | null = null;
  let stageAll = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "-m" || a === "--message") message = args[++i] ?? null;
    else if (a.startsWith("--message=")) message = a.slice("--message=".length);
    else if (a === "-am" || a === "-ma") {
      stageAll = true;
      message = args[++i] ?? null;
    } else if (a === "-a") stageAll = true;
  }
  if (!message)
    return {
      repo,
      out: ["Aborting commit due to empty commit message."],
      error: true,
    };

  let working = repo;
  if (stageAll) {
    // -a tar med alle tracked, modifiserte filer (men ikke untracked)
    const tracked = new Set(Object.keys(working.index));
    for (const p of Object.keys(headTree(working))) tracked.add(p);
    const idx = { ...working.index };
    for (const p of tracked) {
      if (p in working.workdir) idx[p] = working.workdir[p];
      else delete idx[p];
    }
    working = { ...working, index: idx };
  }

  const head = headTree(working);
  const idxKeys = new Set(Object.keys(working.index));
  const headKeys = new Set(Object.keys(head));
  let changed = false;
  for (const p of idxKeys) {
    if (!headKeys.has(p) || head[p] !== working.index[p]) {
      changed = true;
      break;
    }
  }
  for (const p of headKeys) if (!idxKeys.has(p)) changed = true;

  if (!changed) {
    const branch = currentBranch(working);
    return {
      repo: working,
      out: [
        branch ? `On branch ${branch}` : "",
        "nothing to commit, working tree clean",
      ].filter(Boolean),
    };
  }

  const headHash = resolveHead(working);
  const parents = headHash ? [headHash] : [];
  const clock = working.clock + 1;
  const draft: Omit<Commit, "hash"> = {
    parents,
    message,
    author: `${working.config.userName} <${working.config.userEmail}>`,
    timestamp: clock,
    tree: { ...working.index },
  };
  const hash = makeCommitHash(draft);
  const commit: Commit = { ...draft, hash };

  const objects = { ...working.objects, [hash]: commit };
  const refs = { ...working.refs };
  let HEAD = working.HEAD;
  if (working.HEAD?.kind === "branch") {
    refs[working.HEAD.name] = hash;
  } else if (working.HEAD?.kind === "detached") {
    HEAD = { kind: "detached", hash };
  }

  const branch = currentBranch(working) ?? "(detached HEAD)";
  return {
    repo: { ...working, objects, refs, HEAD, clock },
    out: [`[${branch} ${hash}] ${message}`],
  };
}

function gitLog(repo: Repo, args: string[]): CommandResult {
  const head = resolveHead(repo);
  if (!head)
    return {
      repo,
      out: ["fatal: your current branch does not have any commits yet"],
      error: true,
    };

  const oneline = args.includes("--oneline");
  const graph = args.includes("--graph");
  const all = args.includes("--all");

  const startHashes: Hash[] = all
    ? Array.from(new Set([head, ...Object.values(repo.refs)]))
    : [head];

  const visited = new Set<string>();
  const collected: Commit[] = [];
  for (const start of startHashes) {
    for (const c of walkHistory(repo, start)) {
      if (visited.has(c.hash)) continue;
      visited.add(c.hash);
      collected.push(c);
    }
  }
  collected.sort((a, b) => b.timestamp - a.timestamp);

  const headRef = repo.HEAD;
  const decorate = (h: Hash): string => {
    const labels: string[] = [];
    for (const [name, ref] of Object.entries(repo.refs)) {
      if (ref === h) {
        if (headRef?.kind === "branch" && headRef.name === name)
          labels.unshift(`HEAD -> ${name}`);
        else labels.push(name);
      }
    }
    for (const [name, ref] of Object.entries(repo.tags))
      if (ref === h) labels.push(`tag: ${name}`);
    if (headRef?.kind === "detached" && headRef.hash === h) labels.unshift("HEAD");
    return labels.length ? ` (${labels.join(", ")})` : "";
  };

  const out: string[] = [];
  if (oneline) {
    for (const c of collected) {
      const prefix = graph ? "* " : "";
      out.push(`${prefix}${c.hash}${decorate(c.hash)} ${c.message}`);
    }
  } else {
    for (const c of collected) {
      out.push(`commit ${c.hash}${decorate(c.hash)}`);
      if (c.parents.length > 1)
        out.push(`Merge: ${c.parents.map((p) => p.slice(0, 7)).join(" ")}`);
      out.push(`Author: ${c.author}`);
      out.push(`Date:   t=${c.timestamp}`);
      out.push("");
      out.push(`    ${c.message}`);
      out.push("");
    }
  }
  return { repo, out };
}

function gitBranch(repo: Repo, args: string[]): CommandResult {
  if (
    args.length === 0 ||
    (args.length === 1 && (args[0] === "-a" || args[0] === "-v"))
  ) {
    const lines: string[] = [];
    const cur = currentBranch(repo);
    for (const name of Object.keys(repo.refs).sort()) {
      lines.push(`${name === cur ? "* " : "  "}${name}`);
    }
    if (lines.length === 0) lines.push("(no branches yet — opprett en commit først)");
    return { repo, out: lines };
  }

  if (args[0] === "-d" || args[0] === "-D") {
    const name = args[1];
    if (!name) return { repo, out: ["fatal: branch name required"], error: true };
    if (!(name in repo.refs))
      return { repo, out: [`error: branch '${name}' not found.`], error: true };
    if (currentBranch(repo) === name)
      return {
        repo,
        out: [`error: Cannot delete branch '${name}' checked out at HEAD`],
        error: true,
      };
    const refs = { ...repo.refs };
    delete refs[name];
    return { repo: { ...repo, refs }, out: [`Deleted branch ${name}.`] };
  }

  if (args[0] === "-m") {
    const oldName = args[1];
    const newName = args[2];
    if (!oldName || !newName)
      return { repo, out: ["usage: git branch -m <gammel> <ny>"], error: true };
    if (!(oldName in repo.refs))
      return { repo, out: [`error: branch '${oldName}' not found.`], error: true };
    const refs = { ...repo.refs, [newName]: repo.refs[oldName] };
    delete refs[oldName];
    let HEAD = repo.HEAD;
    if (HEAD?.kind === "branch" && HEAD.name === oldName)
      HEAD = { kind: "branch", name: newName };
    return { repo: { ...repo, refs, HEAD }, out: [] };
  }

  const name = args[0];
  if (name in repo.refs)
    return {
      repo,
      out: [`fatal: A branch named '${name}' already exists.`],
      error: true,
    };
  const target = args[1] ? resolveRef(repo, args[1]) : resolveHead(repo);
  if (!target) return { repo, out: [`fatal: Not a valid object name: HEAD`], error: true };
  return { repo: { ...repo, refs: { ...repo.refs, [name]: target } }, out: [] };
}

function gitCheckout(repo: Repo, args: string[]): CommandResult {
  if (args.length === 0)
    return { repo, out: ["usage: git checkout <branch|hash|-b name>"], error: true };

  if (args[0] === "-b") {
    const name = args[1];
    if (!name) return { repo, out: ["fatal: branch name required"], error: true };
    if (name in repo.refs)
      return { repo, out: [`fatal: A branch named '${name}' already exists.`], error: true };
    const target = resolveHead(repo);
    if (!target)
      return { repo, out: ["fatal: Not a valid object name: HEAD"], error: true };
    const refs = { ...repo.refs, [name]: target };
    return {
      repo: { ...repo, refs, HEAD: { kind: "branch", name } },
      out: [`Switched to a new branch '${name}'`],
    };
  }

  if (args[0] === "--") {
    const wd = { ...repo.workdir };
    for (const p of args.slice(1)) {
      if (p in repo.index) wd[p] = repo.index[p];
      else delete wd[p];
    }
    return { repo: { ...repo, workdir: wd }, out: [] };
  }

  const ref = args[0];
  if (ref in repo.refs) {
    const targetHash = repo.refs[ref];
    const c = repo.objects[targetHash];
    return {
      repo: {
        ...repo,
        HEAD: { kind: "branch", name: ref },
        workdir: { ...(c?.tree ?? {}) },
        index: { ...(c?.tree ?? {}) },
      },
      out: [`Switched to branch '${ref}'`],
    };
  }
  const hash = resolveRef(repo, ref);
  if (hash) {
    const c = repo.objects[hash];
    return {
      repo: {
        ...repo,
        HEAD: { kind: "detached", hash },
        workdir: { ...(c?.tree ?? {}) },
        index: { ...(c?.tree ?? {}) },
      },
      out: [
        `Note: switching to '${ref}'.`,
        `You are in 'detached HEAD' state.`,
        `HEAD is now at ${hash} ${c?.message ?? ""}`,
      ],
    };
  }
  return {
    repo,
    out: [`error: pathspec '${ref}' did not match any file(s) known to git`],
    error: true,
  };
}

function gitSwitch(repo: Repo, args: string[]): CommandResult {
  if (args[0] === "-c") return gitCheckout(repo, ["-b", args[1] ?? ""]);
  if (args[0] === "--detach") return gitCheckout(repo, [args[1] ?? ""]);
  return gitCheckout(repo, args);
}

function gitMerge(repo: Repo, args: string[]): CommandResult {
  const name = args.find((a) => !a.startsWith("-"));
  if (!name) return { repo, out: ["usage: git merge <branch>"], error: true };
  const noFF = args.includes("--no-ff");
  const targetHash = resolveRef(repo, name);
  if (!targetHash)
    return { repo, out: [`merge: ${name} - not something we can merge`], error: true };
  const headHash = resolveHead(repo);
  if (!headHash)
    return { repo, out: ["fatal: no current branch to merge into"], error: true };
  if (headHash === targetHash) return { repo, out: ["Already up to date."] };

  if (isAncestor(repo, headHash, targetHash) && !noFF) {
    const refs = { ...repo.refs };
    if (repo.HEAD?.kind === "branch") refs[repo.HEAD.name] = targetHash;
    const c = repo.objects[targetHash];
    return {
      repo: {
        ...repo,
        refs,
        workdir: { ...(c?.tree ?? {}) },
        index: { ...(c?.tree ?? {}) },
      },
      out: [`Updated ${headHash}..${targetHash}`, `Fast-forward`],
    };
  }

  // Enkel 3-veis merge
  const base = mergeBase(repo, headHash, targetHash);
  const baseTree = base ? repo.objects[base].tree : {};
  const ourTree = repo.objects[headHash].tree;
  const theirTree = repo.objects[targetHash].tree;

  const merged: Record<string, string> = { ...ourTree };
  const conflicts: string[] = [];
  const allPaths = new Set([
    ...Object.keys(ourTree),
    ...Object.keys(theirTree),
    ...Object.keys(baseTree),
  ]);
  for (const p of allPaths) {
    const b = baseTree[p];
    const o = ourTree[p];
    const t = theirTree[p];
    if (o === t) {
      if (t === undefined) delete merged[p];
      else merged[p] = t;
      continue;
    }
    if (o === b) {
      if (t === undefined) delete merged[p];
      else merged[p] = t;
      continue;
    }
    if (t === b) {
      continue;
    }
    conflicts.push(p);
    merged[p] = `<<<<<<< HEAD\n${o ?? ""}\n=======\n${t ?? ""}\n>>>>>>> ${name}`;
  }

  if (conflicts.length) {
    return {
      repo: { ...repo, workdir: merged, index: merged },
      out: [
        ...conflicts.map((p) => `CONFLICT (content): Merge conflict in ${p}`),
        `Automatic merge failed; fix conflicts and then commit the result.`,
      ],
      error: true,
    };
  }

  const clock = repo.clock + 1;
  const draft: Omit<Commit, "hash"> = {
    parents: [headHash, targetHash],
    message: `Merge branch '${name}'`,
    author: `${repo.config.userName} <${repo.config.userEmail}>`,
    timestamp: clock,
    tree: merged,
  };
  const hash = makeCommitHash(draft);
  const commit: Commit = { ...draft, hash };
  const objects = { ...repo.objects, [hash]: commit };
  const refs = { ...repo.refs };
  if (repo.HEAD?.kind === "branch") refs[repo.HEAD.name] = hash;
  return {
    repo: { ...repo, objects, refs, clock, workdir: merged, index: merged },
    out: [
      `Merge made by the 'recursive' strategy.`,
      `[${currentBranch(repo)} ${hash}] Merge branch '${name}'`,
    ],
  };
}

function gitReset(repo: Repo, args: string[]): CommandResult {
  if (args[0] === "HEAD" && args.length > 1) {
    const idx = { ...repo.index };
    const head = headTree(repo);
    for (const p of args.slice(1)) {
      if (p in head) idx[p] = head[p];
      else delete idx[p];
    }
    return { repo: { ...repo, index: idx }, out: [] };
  }
  const mode = args.find((a) => a.startsWith("--"))?.slice(2) ?? "mixed";
  const ref = args.find((a) => !a.startsWith("--")) ?? "HEAD";
  const target = resolveRef(repo, ref);
  if (!target) return { repo, out: [`fatal: ambiguous argument '${ref}'`], error: true };
  const c = repo.objects[target];

  const refs = { ...repo.refs };
  if (repo.HEAD?.kind === "branch") refs[repo.HEAD.name] = target;

  let workdir = repo.workdir;
  let index = repo.index;
  if (mode === "hard") {
    workdir = { ...(c?.tree ?? {}) };
    index = { ...(c?.tree ?? {}) };
  } else if (mode === "mixed") {
    index = { ...(c?.tree ?? {}) };
  }
  return {
    repo: { ...repo, refs, workdir, index },
    out: [`HEAD is now at ${target} ${c?.message ?? ""}`],
  };
}

function gitDiff(repo: Repo, args: string[]): CommandResult {
  const cached = args.includes("--cached") || args.includes("--staged");
  const head = headTree(repo);
  const left = cached ? head : repo.index;
  const right = cached ? repo.index : repo.workdir;
  const paths = Array.from(new Set([...Object.keys(left), ...Object.keys(right)])).sort();
  const out: string[] = [];
  for (const p of paths) {
    const a = left[p];
    const b = right[p];
    if (a === b) continue;
    out.push(`diff --git a/${p} b/${p}`);
    if (a === undefined) out.push(`new file: ${p}`);
    else if (b === undefined) out.push(`deleted: ${p}`);
    out.push(`--- a/${p}`);
    out.push(`+++ b/${p}`);
    const aLines = (a ?? "").split("\n");
    const bLines = (b ?? "").split("\n");
    for (const ln of aLines) if (ln) out.push(`- ${ln}`);
    for (const ln of bLines) if (ln) out.push(`+ ${ln}`);
  }
  if (!out.length) out.push("(ingen forskjeller)");
  return { repo, out };
}

function gitTag(repo: Repo, args: string[]): CommandResult {
  if (args.length === 0) {
    return { repo, out: Object.keys(repo.tags).sort() };
  }
  if (args[0] === "-d") {
    const name = args[1];
    if (!(name in repo.tags))
      return { repo, out: [`error: tag '${name}' not found.`], error: true };
    const tags = { ...repo.tags };
    delete tags[name];
    return { repo: { ...repo, tags }, out: [] };
  }
  const name = args[0];
  const target = args[1] ? resolveRef(repo, args[1]) : resolveHead(repo);
  if (!target) return { repo, out: ["fatal: no HEAD to tag"], error: true };
  return { repo: { ...repo, tags: { ...repo.tags, [name]: target } }, out: [] };
}

function gitConfig(repo: Repo, args: string[]): CommandResult {
  if (args[0] === "--global") return gitConfig(repo, args.slice(1));
  const key = args[0];
  const value = args.slice(1).join(" ").replace(/^"|"$/g, "");
  if (key === "user.name")
    return { repo: { ...repo, config: { ...repo.config, userName: value } }, out: [] };
  if (key === "user.email")
    return { repo: { ...repo, config: { ...repo.config, userEmail: value } }, out: [] };
  return { repo, out: [] };
}

function gitRestore(repo: Repo, args: string[]): CommandResult {
  const staged = args.includes("--staged");
  const files = args.filter((a) => !a.startsWith("--"));
  if (files.length === 0)
    return { repo, out: ["fatal: you must specify path(s) to restore"], error: true };
  if (staged) {
    const idx = { ...repo.index };
    const head = headTree(repo);
    for (const p of files) {
      if (p in head) idx[p] = head[p];
      else delete idx[p];
    }
    return { repo: { ...repo, index: idx }, out: [] };
  }
  const wd = { ...repo.workdir };
  for (const p of files) {
    if (p in repo.index) wd[p] = repo.index[p];
    else delete wd[p];
  }
  return { repo: { ...repo, workdir: wd }, out: [] };
}

function gitShow(repo: Repo, args: string[]): CommandResult {
  const ref = args[0] ?? "HEAD";
  const h = resolveRef(repo, ref);
  if (!h) return { repo, out: [`fatal: bad revision '${ref}'`], error: true };
  const c = repo.objects[h];
  const out: string[] = [
    `commit ${c.hash}`,
    `Author: ${c.author}`,
    `Date:   t=${c.timestamp}`,
    "",
    `    ${c.message}`,
    "",
  ];
  for (const p of Object.keys(c.tree).sort()) {
    out.push(`--- ${p} ---`);
    out.push(c.tree[p]);
  }
  return { repo, out };
}

/* =============================================================
 * Helper: kjør en sekvens av kommandolinjer (brukt til setup)
 * ============================================================= */

export function runScript(repo: Repo, lines: string[]): { repo: Repo; out: string[][] } {
  let r = repo;
  const out: string[][] = [];
  for (const line of lines) {
    const res = runLine(r, line);
    r = res.repo;
    out.push(res.out);
  }
  return { repo: r, out };
}

export function freshRepo(): Repo {
  return emptyRepo();
}
