import { useMemo, useState } from "react";

/**
 * PathResolution — stegvis walkthrough av hvordan kjernen resolver
 * en absolutt path til en inode. Hvert steg:
 *
 *   1. Slå opp neste navn i den nåværende directory-inoden.
 *   2. Les block(ene) som directory-inoden peker på.
 *   3. Finn entry med navnet → nytt inode-nummer.
 *   4. Les den nye inoden fra inode-tabellen.
 *
 * Hver path-komponent koster minst to disk-leser:
 * inode-blokk + directory-data-blokk. Dypere path = flere leser.
 * Dette er motivasjonen for dentry-cache (directory-entry-cache)
 * i Linux: gjenta-oppslag av samme path treffer cache, ikke disk.
 */

type Inode = {
  num: number;
  type: "dir" | "file";
  /** For dir: entries. For file: dummy "data". */
  entries?: Array<{ name: string; inode: number }>;
  /** Hvilken data-blokk inoden peker til. */
  dataBlock: number;
  /** Vises i panelet. */
  size: number;
};

/** Et lite eksempel-filsystem som dekker /home/isak/docs/file.txt. */
const FS: Record<number, Inode> = {
  2: {
    num: 2,
    type: "dir",
    dataBlock: 100,
    size: 4096,
    entries: [
      { name: ".", inode: 2 },
      { name: "..", inode: 2 },
      { name: "etc", inode: 17 },
      { name: "home", inode: 21 },
      { name: "var", inode: 19 },
    ],
  },
  21: {
    num: 21,
    type: "dir",
    dataBlock: 240,
    size: 4096,
    entries: [
      { name: ".", inode: 21 },
      { name: "..", inode: 2 },
      { name: "isak", inode: 88 },
      { name: "kari", inode: 89 },
    ],
  },
  88: {
    num: 88,
    type: "dir",
    dataBlock: 520,
    size: 4096,
    entries: [
      { name: ".", inode: 88 },
      { name: "..", inode: 21 },
      { name: "docs", inode: 132 },
      { name: ".bashrc", inode: 133 },
    ],
  },
  132: {
    num: 132,
    type: "dir",
    dataBlock: 740,
    size: 4096,
    entries: [
      { name: ".", inode: 132 },
      { name: "..", inode: 88 },
      { name: "file.txt", inode: 261 },
      { name: "notes.md", inode: 262 },
    ],
  },
  261: {
    num: 261,
    type: "file",
    dataBlock: 980,
    size: 1834,
  },
};

const PATHS = ["/home/isak/docs/file.txt", "/etc", "/home/isak/.bashrc"];

type StepKind =
  | "start" // initialiserer cwd = root inode 2
  | "lookup" // les directory-data-blokk for å finne komponenten
  | "load-inode" // les ny inode-blokk
  | "done";

type Step = {
  kind: StepKind;
  cwdInode: number;
  nextInode?: number;
  componentIdx: number;
  description: string;
  /** Disk-IO logget i dette steget. */
  ios: string[];
  /** Treff på cache i stedet for disk? */
  cacheHits: string[];
};

function buildSteps(path: string, cachedDirs: Set<number>): Step[] {
  const parts = path.split("/").filter((p) => p.length > 0);
  const steps: Step[] = [];
  let cwd = 2; // root inode

  steps.push({
    kind: "start",
    cwdInode: cwd,
    componentIdx: -1,
    description: "Start: cwd = root inode 2. Mount-tabellen forteller kernel at root (/) er inode 2 på denne disken.",
    ios: cachedDirs.has(2) ? [] : ["les inode-blokk for inode 2 (root-dir)"],
    cacheHits: cachedDirs.has(2) ? ["dentry-cache traff: root inode 2"] : [],
  });

  for (let i = 0; i < parts.length; i++) {
    const comp = parts[i];
    const dir = FS[cwd];
    if (!dir || dir.type !== "dir") {
      steps.push({
        kind: "done",
        cwdInode: cwd,
        componentIdx: i,
        description: `ENOTDIR: inode ${cwd} er ikke en katalog. Kan ikke fortsette path-resolution.`,
        ios: [],
        cacheHits: [],
      });
      return steps;
    }
    const entry = dir.entries?.find((e) => e.name === comp);
    const lookupKey = `${cwd}/${comp}`;
    const isCached = cachedDirs.has(cwd);
    steps.push({
      kind: "lookup",
      cwdInode: cwd,
      componentIdx: i,
      description: isCached
        ? `Slår opp "${comp}" i inode ${cwd} — dentry-cache traff, slipper disk-les.`
        : `Slår opp "${comp}" i inode ${cwd}. Må lese directory-data-blokken (#${dir.dataBlock}) for å finne entry.`,
      ios: isCached ? [] : [`les directory-blokk #${dir.dataBlock} for inode ${cwd}`],
      cacheHits: isCached ? [`dentry-cache: ${lookupKey}`] : [],
    });
    if (!entry) {
      steps.push({
        kind: "done",
        cwdInode: cwd,
        componentIdx: i,
        description: `ENOENT: ingen entry "${comp}" i inode ${cwd}. Path-resolution feiler.`,
        ios: [],
        cacheHits: [],
      });
      return steps;
    }
    const nextInodeNum = entry.inode;
    const nextInodeCached = cachedDirs.has(nextInodeNum);
    steps.push({
      kind: "load-inode",
      cwdInode: cwd,
      nextInode: nextInodeNum,
      componentIdx: i,
      description: nextInodeCached
        ? `Inode ${nextInodeNum} er allerede i inode-cachen — slipper disk.`
        : `Last inode ${nextInodeNum} fra inode-tabellen for å se hva slags objekt det er.`,
      ios: nextInodeCached ? [] : [`les inode-blokk for inode ${nextInodeNum}`],
      cacheHits: nextInodeCached ? [`inode-cache: ${nextInodeNum}`] : [],
    });
    cwd = nextInodeNum;
  }

  const final = FS[cwd];
  steps.push({
    kind: "done",
    cwdInode: cwd,
    componentIdx: parts.length,
    description:
      final?.type === "file"
        ? `Ferdig: path → inode ${cwd} (regular file, ${final.size} B). Kernel returnerer file descriptor.`
        : `Ferdig: path → inode ${cwd} (directory). open() returnerer dir-fd, opendir() bruker readdir.`,
    ios: [],
    cacheHits: [],
  });
  return steps;
}

export function PathResolution() {
  const [pathIdx, setPathIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [cachedDirs, setCachedDirs] = useState<Set<number>>(new Set());

  const path = PATHS[pathIdx];
  const steps = useMemo(() => buildSteps(path, cachedDirs), [path, cachedDirs]);

  const visible = steps.slice(0, stepIdx + 1);
  const totalIos = visible.reduce((s, st) => s + st.ios.length, 0);
  const totalCacheHits = visible.reduce(
    (s, st) => s + st.cacheHits.length,
    0,
  );
  const current = steps[stepIdx];

  function reset() {
    setStepIdx(0);
  }
  function next() {
    if (stepIdx < steps.length - 1) setStepIdx(stepIdx + 1);
  }
  function selectPath(i: number) {
    setPathIdx(i);
    setStepIdx(0);
  }
  function warmCache() {
    // Cache alle dirs vi har sett — for å vise effekten ved gjentatt oppslag.
    const seen = new Set<number>();
    steps.forEach((s) => {
      if (s.kind === "lookup" || s.kind === "start") seen.add(s.cwdInode);
      if (s.kind === "load-inode" && s.nextInode !== undefined)
        seen.add(s.nextInode);
    });
    setCachedDirs(seen);
    setStepIdx(0);
  }
  function clearCache() {
    setCachedDirs(new Set());
    setStepIdx(0);
  }

  const parts = path.split("/").filter((p) => p.length > 0);
  const currentComponentIdx =
    current?.componentIdx !== undefined ? current.componentIdx : -1;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Path</div>
          <div className="flex flex-wrap gap-1.5">
            {PATHS.map((p, i) => (
              <button
                key={p}
                type="button"
                onClick={() => selectPath(i)}
                className={`text-xs font-mono rounded-md border px-2.5 py-1 transition-colors ${
                  pathIdx === i
                    ? "border-brand bg-brand/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-brand/40"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Cache-tilstand</div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={clearCache}
              className={`text-xs rounded-md border px-2.5 py-1 ${
                cachedDirs.size === 0
                  ? "border-brand bg-brand/10"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Kald cache
            </button>
            <button
              type="button"
              onClick={warmCache}
              className={`text-xs rounded-md border px-2.5 py-1 ${
                cachedDirs.size > 0
                  ? "border-brand bg-brand/10"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Varm cache
            </button>
          </div>
        </div>
      </div>

      {/* Path breadcrumbs */}
      <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 mb-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
          Path-komponenter
        </div>
        <div className="flex flex-wrap items-center gap-1 font-mono text-sm">
          <span
            className={`px-2 py-0.5 rounded ${currentComponentIdx === -1 ? "bg-brand/20 text-brand" : "text-muted-foreground"}`}
          >
            /
          </span>
          {parts.map((p, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className="text-muted-foreground">/</span>
              <span
                className={`px-2 py-0.5 rounded ${
                  i < currentComponentIdx
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : i === currentComponentIdx
                      ? "bg-brand/20 text-brand"
                      : "text-muted-foreground"
                }`}
              >
                {p}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <button
          type="button"
          onClick={next}
          disabled={stepIdx >= steps.length - 1}
          className="text-xs rounded-md border border-brand bg-brand/10 px-3 py-1.5 hover:bg-brand/20 disabled:opacity-40"
        >
          Neste steg
        </button>
        <button
          type="button"
          onClick={() => setStepIdx(steps.length - 1)}
          className="text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted"
        >
          Kjør ferdig
        </button>
        <button
          type="button"
          onClick={reset}
          className="text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted"
        >
          Reset
        </button>
        <div className="ml-auto text-xs text-muted-foreground">
          Steg {stepIdx + 1} / {steps.length}
        </div>
      </div>

      {/* Steps log */}
      <div className="space-y-1.5 mb-3">
        {visible.map((s, i) => {
          const isCurrent = i === stepIdx;
          return (
            <div
              key={i}
              className={`rounded-md border px-3 py-2 text-xs ${
                isCurrent
                  ? "border-brand bg-brand/5"
                  : "border-border bg-background"
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="font-mono text-[10px] text-muted-foreground mt-0.5">
                  #{i + 1}
                </span>
                <div className="flex-1">
                  <div className="text-foreground">{s.description}</div>
                  {s.ios.length > 0 && (
                    <div className="mt-1 text-[10px] text-rose-500 font-mono">
                      {s.ios.map((io, k) => (
                        <div key={k}>→ DISK: {io}</div>
                      ))}
                    </div>
                  )}
                  {s.cacheHits.length > 0 && (
                    <div className="mt-1 text-[10px] text-emerald-500 font-mono">
                      {s.cacheHits.map((c, k) => (
                        <div key={k}>✓ {c}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid sm:grid-cols-3 gap-2 text-xs">
        <div className="rounded-md border border-border p-2">
          <div className="text-muted-foreground">Disk-leser hittil</div>
          <div className="font-mono text-rose-500">{totalIos}</div>
        </div>
        <div className="rounded-md border border-border p-2">
          <div className="text-muted-foreground">Cache-treff</div>
          <div className="font-mono text-emerald-500">{totalCacheHits}</div>
        </div>
        <div className="rounded-md border border-border p-2">
          <div className="text-muted-foreground">Sluttinode</div>
          <div className="font-mono">
            {current?.kind === "done" ? current.cwdInode : "—"}
          </div>
        </div>
      </div>

      <div className="mt-4 text-[11px] text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Hvorfor caching?</strong>{" "}
        <code className="font-mono">/home/isak/docs/file.txt</code> ville
        kosta ~8 disk-leser med kald cache (inode + dir-blokk per
        komponent). Linux har derfor en{" "}
        <span className="text-foreground">dentry-cache</span> som hasher
        (parent_inode, name) → child_inode. Et hot path som åpnes ofte
        treffer cache fra steg 1 og hopper rett til den endelige
        inoden — null disk-IO. Det er derfor f.eks. en for-loop som åpner{" "}
        <code className="font-mono">/etc/passwd</code> tusen ganger ikke
        bremser etter første gang.
      </div>
    </div>
  );
}
