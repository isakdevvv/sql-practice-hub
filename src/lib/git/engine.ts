// Git-simulator — en helt lokal, deterministisk "fake git" som modellerer nok
// av Git til at studenter kan øve på workflow: init, add, commit, log, branch,
// checkout, merge (FF + enkel 3-way), reset, status, diff.
//
// Designvalg:
// - Hash-er er deterministiske 7-tegns hex basert på innholdet ditt (FNV-1a).
//   Ekte git bruker SHA-1, men vi er ikke avhengig av krypto her.
// - Trær lagres som flat `Record<path, content>` per commit — ingen sub-trees.
//   Ingen mapper, "dir/file.txt" er bare en sti-streng.
// - Arbeidskatalog (`workdir`) og index (staging area) er separate kart.
// - Vi har én "remote" (origin) som er en hel speil-Repo for å kunne simulere
//   push/pull, men i v1 brukes den ikke i øvelsene.

export type Hash = string;

export interface Commit {
  hash: Hash;
  message: string;
  parents: Hash[]; // 0 = root, 1 = vanlig, 2 = merge
  tree: Record<string, string>;
  author: string;
  timestamp: number;
}

export type HeadState =
  | { kind: "branch"; name: string }
  | { kind: "detached"; hash: Hash }
  | null;

export interface Repo {
  initialized: boolean;
  objects: Record<Hash, Commit>;
  refs: Record<string, Hash>; // local branches
  tags: Record<string, Hash>;
  HEAD: HeadState;
  workdir: Record<string, string>;
  index: Record<string, string>;
  // Filer som er fjernet fra workdir men fortsatt i index/HEAD trenger ingen
  // egen state — vi utleder "deleted" ved å sammenligne kart.
  // En logisk klokke gir oss unike timestamps for kronologisk log.
  clock: number;
  // Konfig — git config user.name / user.email
  config: {
    userName: string;
    userEmail: string;
    defaultBranch: string;
  };
}

export function emptyRepo(): Repo {
  return {
    initialized: false,
    objects: {},
    refs: {},
    tags: {},
    HEAD: null,
    workdir: {},
    index: {},
    clock: 0,
    config: {
      userName: "Student",
      userEmail: "student@uit.no",
      defaultBranch: "main",
    },
  };
}

/* --------------------------- Hashing (FNV-1a 32-bit) --------------------------- */

export function hashContent(input: string): Hash {
  // FNV-1a — deterministisk og rask. Brukes til commit-hasher.
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // 32-bit unsigned → 8 hex, vi tar 7 (som `git log --oneline`).
  const hex = (h >>> 0).toString(16).padStart(8, "0");
  return hex.slice(0, 7);
}

export function makeCommitHash(c: Omit<Commit, "hash">): Hash {
  const treePart = Object.keys(c.tree)
    .sort()
    .map((k) => `${k}:${c.tree[k]}`)
    .join("\n");
  return hashContent(
    `${c.parents.join(",")}|${c.message}|${c.author}|${c.timestamp}|${treePart}`,
  );
}

/* --------------------------- Helpers --------------------------- */

export function currentBranch(repo: Repo): string | null {
  if (repo.HEAD?.kind === "branch") return repo.HEAD.name;
  return null;
}

export function resolveHead(repo: Repo): Hash | null {
  if (!repo.HEAD) return null;
  if (repo.HEAD.kind === "branch") return repo.refs[repo.HEAD.name] ?? null;
  return repo.HEAD.hash;
}

export function headCommit(repo: Repo): Commit | null {
  const h = resolveHead(repo);
  return h ? (repo.objects[h] ?? null) : null;
}

export function headTree(repo: Repo): Record<string, string> {
  const c = headCommit(repo);
  return c ? { ...c.tree } : {};
}

/** Resolver en ref-streng (gren-navn, tag, full hash, "HEAD", "HEAD~1") til hash. */
export function resolveRef(repo: Repo, ref: string): Hash | null {
  if (ref === "HEAD") return resolveHead(repo);
  // HEAD~N — gå N parents tilbake
  const tildeMatch = ref.match(/^HEAD~(\d+)$/);
  if (tildeMatch) {
    let h = resolveHead(repo);
    for (let i = 0; i < Number(tildeMatch[1]) && h; i++) {
      h = repo.objects[h]?.parents[0] ?? null;
    }
    return h;
  }
  if (repo.refs[ref]) return repo.refs[ref];
  if (repo.tags[ref]) return repo.tags[ref];
  if (repo.objects[ref]) return ref;
  // Prøv prefiks-match på hash
  const matches = Object.keys(repo.objects).filter((k) => k.startsWith(ref));
  if (matches.length === 1) return matches[0];
  return null;
}

/* --------------------------- Status-utledning --------------------------- */

export type FileChange =
  | { path: string; kind: "untracked" }
  | { path: string; kind: "modified" } // workdir != index
  | { path: string; kind: "deleted" } // i index, ikke i workdir
  | { path: string; kind: "staged-added" } // i index, ikke i HEAD
  | { path: string; kind: "staged-modified" } // i index og HEAD, ulik
  | { path: string; kind: "staged-deleted" }; // i HEAD, ikke i index

export interface RepoStatus {
  branch: string | null;
  detached: Hash | null;
  staged: FileChange[]; // index vs HEAD
  unstaged: FileChange[]; // workdir vs index
  untracked: string[];
  clean: boolean;
}

export function computeStatus(repo: Repo): RepoStatus {
  const head = headTree(repo);
  const idx = repo.index;
  const wd = repo.workdir;

  const staged: FileChange[] = [];
  const stagedPaths = new Set([...Object.keys(idx), ...Object.keys(head)]);
  for (const p of stagedPaths) {
    const inIdx = p in idx;
    const inHead = p in head;
    if (inIdx && !inHead) staged.push({ path: p, kind: "staged-added" });
    else if (!inIdx && inHead) staged.push({ path: p, kind: "staged-deleted" });
    else if (inIdx && inHead && idx[p] !== head[p])
      staged.push({ path: p, kind: "staged-modified" });
  }

  const unstaged: FileChange[] = [];
  const untracked: string[] = [];
  const allPaths = new Set([...Object.keys(idx), ...Object.keys(wd)]);
  for (const p of allPaths) {
    const inIdx = p in idx;
    const inWd = p in wd;
    if (!inIdx && inWd) {
      // Ikke i index → ukjent fil
      untracked.push(p);
    } else if (inIdx && !inWd) {
      unstaged.push({ path: p, kind: "deleted" });
    } else if (inIdx && inWd && idx[p] !== wd[p]) {
      unstaged.push({ path: p, kind: "modified" });
    }
  }
  staged.sort((a, b) => a.path.localeCompare(b.path));
  unstaged.sort((a, b) => a.path.localeCompare(b.path));
  untracked.sort();

  const branch = currentBranch(repo);
  const detached = repo.HEAD?.kind === "detached" ? repo.HEAD.hash : null;
  const clean = staged.length === 0 && unstaged.length === 0 && untracked.length === 0;
  return { branch, detached, staged, unstaged, untracked, clean };
}

/* --------------------------- Commit-historikk --------------------------- */

/** Topologisk-ordnet liste av commits, nyeste først, fra et utgangspunkt. */
export function walkHistory(repo: Repo, start: Hash | null): Commit[] {
  if (!start) return [];
  const seen = new Set<Hash>();
  const out: Commit[] = [];
  // Vi sorterer ikke topologisk strikt — for merge er det godt nok å bruke
  // timestamp som tiebreaker, siden alle parents er eldre enn barnet.
  const queue: Hash[] = [start];
  while (queue.length) {
    const h = queue.shift()!;
    if (seen.has(h)) continue;
    seen.add(h);
    const c = repo.objects[h];
    if (!c) continue;
    out.push(c);
    for (const p of c.parents) queue.push(p);
  }
  return out.sort((a, b) => b.timestamp - a.timestamp);
}

/* --------------------------- Felles merge-base --------------------------- */

export function mergeBase(repo: Repo, a: Hash, b: Hash): Hash | null {
  // Alle aner til a
  const aAncestors = new Set<Hash>();
  const queue: Hash[] = [a];
  while (queue.length) {
    const h = queue.shift()!;
    if (aAncestors.has(h)) continue;
    aAncestors.add(h);
    for (const p of repo.objects[h]?.parents ?? []) queue.push(p);
  }
  // Første hash i b's anekjede som finnes i a's er en felles forfar.
  // (For helt enkle treer holder dette — vi velger bare den første vi finner via BFS.)
  const seenB = new Set<Hash>();
  const qb: Hash[] = [b];
  while (qb.length) {
    const h = qb.shift()!;
    if (seenB.has(h)) continue;
    seenB.add(h);
    if (aAncestors.has(h)) return h;
    for (const p of repo.objects[h]?.parents ?? []) qb.push(p);
  }
  return null;
}

export function isAncestor(repo: Repo, ancestor: Hash, descendant: Hash): boolean {
  if (ancestor === descendant) return true;
  const seen = new Set<Hash>();
  const queue: Hash[] = [descendant];
  while (queue.length) {
    const h = queue.shift()!;
    if (seen.has(h)) continue;
    seen.add(h);
    if (h === ancestor) return true;
    for (const p of repo.objects[h]?.parents ?? []) queue.push(p);
  }
  return false;
}
