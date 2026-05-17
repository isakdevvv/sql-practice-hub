import { useState } from "react";

/**
 * LinkTypes — hard link vs symbolic link side-ved-side.
 *
 * To paneler. I begge har vi `/data/original.txt`. Brukeren oppretter
 * en link (`fileB.txt`) til den. På hard-side ender begge på samme
 * inode (refcount øker). På sym-side får fileB en egen inode hvis
 * type er "symlink" med en target-string.
 *
 * "Bryt": slett originalen → hard link fortsetter, symlink dangler.
 * "Endre permissions / size": hard links deler alt; symlink har egen
 * mode (lrwxrwxrwx) men peker bare på path.
 */

type InodeState = {
  num: number;
  type: "file" | "symlink";
  mode: string; // e.g. "rw-r--r--"
  size: number;
  links: number; // refcount
  target?: string; // for symlinks
  exists: boolean; // false hvis inoden er garbage-collected
  content: string;
};

type Side = "hard" | "sym";

type SideState = {
  /** Mapping fra filnavn til inode-nummer (directory-entry). */
  entries: Record<string, number>;
  /** Inode-tabell. */
  inodes: Record<number, InodeState>;
  /** Logg. */
  log: string[];
};

const INITIAL_HARD: SideState = {
  entries: { "original.txt": 100 },
  inodes: {
    100: {
      num: 100,
      type: "file",
      mode: "rw-r--r--",
      size: 42,
      links: 1,
      exists: true,
      content: "Hello, filesystem!",
    },
  },
  log: ["Start: bare original.txt finnes — peker på inode 100."],
};

const INITIAL_SYM: SideState = {
  entries: { "original.txt": 100 },
  inodes: {
    100: {
      num: 100,
      type: "file",
      mode: "rw-r--r--",
      size: 42,
      links: 1,
      exists: true,
      content: "Hello, filesystem!",
    },
  },
  log: ["Start: bare original.txt finnes — peker på inode 100."],
};

function createLink(state: SideState, side: Side, newName: string): SideState {
  if (state.entries[newName] !== undefined) {
    return {
      ...state,
      log: [`Navnet "${newName}" finnes allerede.`, ...state.log],
    };
  }
  if (side === "hard") {
    const targetInode = state.entries["original.txt"];
    if (
      targetInode === undefined ||
      !state.inodes[targetInode]?.exists
    ) {
      return {
        ...state,
        log: [
          `Hard link feiler: original.txt finnes ikke. (Kan ikke hardlinke til ikke-eksisterende inode.)`,
          ...state.log,
        ],
      };
    }
    return {
      ...state,
      entries: { ...state.entries, [newName]: targetInode },
      inodes: {
        ...state.inodes,
        [targetInode]: {
          ...state.inodes[targetInode],
          links: state.inodes[targetInode].links + 1,
        },
      },
      log: [
        `ln original.txt ${newName} — inode ${targetInode}.links: ${state.inodes[targetInode].links} → ${state.inodes[targetInode].links + 1}`,
        ...state.log,
      ],
    };
  } else {
    // Sym
    const newInodeNum =
      Math.max(0, ...Object.keys(state.inodes).map((n) => parseInt(n, 10))) + 1;
    const sym: InodeState = {
      num: newInodeNum,
      type: "symlink",
      mode: "rwxrwxrwx",
      size: "original.txt".length,
      links: 1,
      target: "original.txt",
      exists: true,
      content: "→ original.txt",
    };
    return {
      ...state,
      entries: { ...state.entries, [newName]: newInodeNum },
      inodes: { ...state.inodes, [newInodeNum]: sym },
      log: [
        `ln -s original.txt ${newName} — ny inode ${newInodeNum} (symlink), target="original.txt"`,
        ...state.log,
      ],
    };
  }
}

function deleteName(state: SideState, name: string): SideState {
  const inodeNum = state.entries[name];
  if (inodeNum === undefined) {
    return { ...state, log: [`"${name}" finnes ikke.`, ...state.log] };
  }
  const { [name]: _removed, ...restEntries } = state.entries;
  const inode = state.inodes[inodeNum];
  if (!inode) return state;
  const newLinks = inode.links - 1;
  let newInodes = { ...state.inodes };
  let logLine = "";
  if (newLinks <= 0) {
    // Garbage-collect: inode-blokker frigis, men inoden vises som "borte"
    newInodes[inodeNum] = { ...inode, links: 0, exists: false };
    logLine = `unlink ${name} → inode ${inodeNum}.links = 0 → blokker frigis.`;
  } else {
    newInodes[inodeNum] = { ...inode, links: newLinks };
    logLine = `unlink ${name} → inode ${inodeNum}.links: ${inode.links} → ${newLinks} (inoden lever fortsatt).`;
  }
  return {
    ...state,
    entries: restEntries,
    inodes: newInodes,
    log: [logLine, ...state.log],
  };
}

function chmod(state: SideState, name: string, newMode: string): SideState {
  const inodeNum = state.entries[name];
  if (inodeNum === undefined || !state.inodes[inodeNum]?.exists) {
    return { ...state, log: [`chmod feiler: "${name}" ikke funnet.`, ...state.log] };
  }
  const inode = state.inodes[inodeNum];
  if (inode.type === "symlink") {
    // chmod på symlink-name (via path) følger lenken på Linux. Vi simulerer
    // den vanlige semantikken: chmod via name endrer target-inoden.
    const targetName = inode.target!;
    const targetInodeNum = state.entries[targetName];
    if (targetInodeNum === undefined || !state.inodes[targetInodeNum]?.exists) {
      return {
        ...state,
        log: [
          `chmod via symlink ${name} feiler: target "${targetName}" dangling.`,
          ...state.log,
        ],
      };
    }
    return {
      ...state,
      inodes: {
        ...state.inodes,
        [targetInodeNum]: { ...state.inodes[targetInodeNum], mode: newMode },
      },
      log: [
        `chmod ${newMode} ${name} — symlinks følges; endrer target-inode ${targetInodeNum}.mode (selve lenke-inoden har fortsatt lrwxrwxrwx).`,
        ...state.log,
      ],
    };
  }
  return {
    ...state,
    inodes: {
      ...state.inodes,
      [inodeNum]: { ...inode, mode: newMode },
    },
    log: [
      `chmod ${newMode} ${name} — inode ${inodeNum}.mode = ${newMode}. Alle hardlinks deler denne moden.`,
      ...state.log,
    ],
  };
}

function appendBytes(state: SideState, name: string, bytes: number): SideState {
  const inodeNum = state.entries[name];
  if (inodeNum === undefined || !state.inodes[inodeNum]?.exists) {
    return { ...state, log: [`write feiler: "${name}" ikke funnet.`, ...state.log] };
  }
  const inode = state.inodes[inodeNum];
  if (inode.type === "symlink") {
    const targetName = inode.target!;
    const targetInodeNum = state.entries[targetName];
    if (targetInodeNum === undefined || !state.inodes[targetInodeNum]?.exists) {
      return {
        ...state,
        log: [
          `write via symlink ${name} feiler: dangling — target "${targetName}" finnes ikke.`,
          ...state.log,
        ],
      };
    }
    return {
      ...state,
      inodes: {
        ...state.inodes,
        [targetInodeNum]: {
          ...state.inodes[targetInodeNum],
          size: state.inodes[targetInodeNum].size + bytes,
        },
      },
      log: [
        `write ${bytes} B til ${name} → symlink fulgt → target-inode ${targetInodeNum}.size += ${bytes}`,
        ...state.log,
      ],
    };
  }
  return {
    ...state,
    inodes: {
      ...state.inodes,
      [inodeNum]: { ...inode, size: inode.size + bytes },
    },
    log: [
      `write ${bytes} B til ${name} → inode ${inodeNum}.size += ${bytes}. Alle hardlinks ser den nye størrelsen.`,
      ...state.log,
    ],
  };
}

export function LinkTypes() {
  const [hard, setHard] = useState<SideState>(INITIAL_HARD);
  const [sym, setSym] = useState<SideState>(INITIAL_SYM);

  function actAll(side: Side, action: (s: SideState) => SideState) {
    if (side === "hard") setHard(action);
    else setSym(action);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="grid lg:grid-cols-2 gap-4">
        <SidePanel
          title="Hard link"
          subtitle="ln original.txt fileB.txt"
          accent="emerald"
          state={hard}
          onCreate={(name) => actAll("hard", (s) => createLink(s, "hard", name))}
          onDelete={(name) => actAll("hard", (s) => deleteName(s, name))}
          onChmod={(name, mode) =>
            actAll("hard", (s) => chmod(s, name, mode))
          }
          onWrite={(name) => actAll("hard", (s) => appendBytes(s, name, 10))}
          explainer="To navn, samme inode-nummer. Begge navn er likeverdige. Inoden lever til siste navn er slettet."
        />
        <SidePanel
          title="Symbolic link"
          subtitle="ln -s original.txt fileB.txt"
          accent="violet"
          state={sym}
          onCreate={(name) => actAll("sym", (s) => createLink(s, "sym", name))}
          onDelete={(name) => actAll("sym", (s) => deleteName(s, name))}
          onChmod={(name, mode) => actAll("sym", (s) => chmod(s, name, mode))}
          onWrite={(name) => actAll("sym", (s) => appendBytes(s, name, 10))}
          explainer="fileB er en EGEN inode av type symlink. Innholdet er bare path-strengen 'original.txt'. Slettes original → dangling."
        />
      </div>

      <div className="mt-5 grid sm:grid-cols-3 gap-3 text-xs">
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
          <div className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            Hard link
          </div>
          <ul className="text-muted-foreground space-y-1 list-disc pl-4">
            <li>Samme inode → deler ALT (mode, size, blocks, mtime)</li>
            <li>Kan ikke krysse filsystem-grenser</li>
            <li>Kan ikke peke på en katalog (i Linux)</li>
            <li>Inode-refcount tracker antall navn</li>
          </ul>
        </div>
        <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-3">
          <div className="font-semibold text-violet-600 dark:text-violet-400 mb-1">
            Symbolic link
          </div>
          <ul className="text-muted-foreground space-y-1 list-disc pl-4">
            <li>Egen inode, type=symlink — innholdet er en path-streng</li>
            <li>Kan krysse filsystem-grenser</li>
            <li>Kan peke på katalog</li>
            <li>Blir dangling hvis target slettes</li>
          </ul>
        </div>
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <div className="font-semibold text-amber-600 dark:text-amber-400 mb-1">
            Praktisk
          </div>
          <ul className="text-muted-foreground space-y-1 list-disc pl-4">
            <li><code className="font-mono">ls -li</code> viser inode-nr + linkcount</li>
            <li><code className="font-mono">readlink</code> leser symlink-target</li>
            <li><code className="font-mono">stat -L</code> følger symlinks</li>
            <li>Backups bør dereferere symlinks (eller ikke, etter behov)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function SidePanel({
  title,
  subtitle,
  accent,
  state,
  onCreate,
  onDelete,
  onChmod,
  onWrite,
  explainer,
}: {
  title: string;
  subtitle: string;
  accent: "emerald" | "violet";
  state: SideState;
  onCreate: (name: string) => void;
  onDelete: (name: string) => void;
  onChmod: (name: string, mode: string) => void;
  onWrite: (name: string) => void;
  explainer: string;
}) {
  const [newName, setNewName] = useState("fileB.txt");
  const accentBorder =
    accent === "emerald" ? "border-emerald-500/40" : "border-violet-500/40";
  const accentBg = accent === "emerald" ? "bg-emerald-500/5" : "bg-violet-500/5";
  const accentText =
    accent === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-violet-600 dark:text-violet-400";

  const aliveInodeNums = new Set(
    Object.values(state.entries),
  );

  return (
    <div className={`rounded-lg border ${accentBorder} ${accentBg} p-4`}>
      <div className="mb-3">
        <div className={`text-xs uppercase tracking-wider font-semibold ${accentText}`}>
          {title}
        </div>
        <code className="font-mono text-xs text-muted-foreground">
          {subtitle}
        </code>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="text-xs font-mono rounded-md border border-border bg-background px-2 py-1 w-28"
          placeholder="fileB.txt"
        />
        <button
          type="button"
          onClick={() => onCreate(newName)}
          className="text-xs rounded-md border border-brand bg-brand/10 px-2.5 py-1 hover:bg-brand/20"
        >
          Lag link
        </button>
        <button
          type="button"
          onClick={() => onDelete("original.txt")}
          className="text-xs rounded-md border border-rose-500/50 bg-rose-500/5 px-2.5 py-1 hover:bg-rose-500/10 text-rose-500"
        >
          Slett original.txt
        </button>
        <button
          type="button"
          onClick={() => onChmod("original.txt", "rwxr-x---")}
          className="text-xs rounded-md border border-border bg-background px-2.5 py-1 hover:bg-muted"
        >
          chmod 750
        </button>
        <button
          type="button"
          onClick={() => onWrite("original.txt")}
          className="text-xs rounded-md border border-border bg-background px-2.5 py-1 hover:bg-muted"
        >
          +10 B
        </button>
      </div>

      {/* Directory-entries */}
      <div className="rounded-md border border-border bg-background p-2 mb-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
          Directory entries
        </div>
        {Object.keys(state.entries).length === 0 ? (
          <div className="text-xs text-muted-foreground italic">(tomt)</div>
        ) : (
          <div className="space-y-1">
            {Object.entries(state.entries).map(([name, inodeNum]) => {
              const inode = state.inodes[inodeNum];
              const dangling = inode?.type === "symlink" &&
                (() => {
                  const t = inode.target!;
                  const ti = state.entries[t];
                  return ti === undefined || !state.inodes[ti]?.exists;
                })();
              return (
                <div
                  key={name}
                  className="flex items-center justify-between text-xs font-mono"
                >
                  <span>{name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded ${
                      dangling
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    → inode {inodeNum}
                    {dangling && " (dangling!)"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Inode-tabell */}
      <div className="rounded-md border border-border bg-background p-2 mb-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
          Inode-tabell
        </div>
        <div className="space-y-1">
          {Object.values(state.inodes).map((inode) => {
            const referenced = aliveInodeNums.has(inode.num);
            return (
              <div
                key={inode.num}
                className={`text-xs font-mono rounded px-1.5 py-1 ${
                  !inode.exists
                    ? "bg-muted/40 text-muted-foreground line-through"
                    : referenced
                      ? "bg-background"
                      : "bg-amber-500/10"
                }`}
              >
                <div>
                  inode {inode.num} · {inode.type} · mode={inode.mode}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  size={inode.size} B · links={inode.links}
                  {inode.target && ` · target="${inode.target}"`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Log */}
      <div className="rounded-md border border-border bg-background p-2 max-h-32 overflow-y-auto">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
          Logg
        </div>
        <div className="space-y-0.5">
          {state.log.map((l, i) => (
            <div
              key={i}
              className={`text-[10px] font-mono ${i === 0 ? "text-foreground" : "text-muted-foreground"}`}
            >
              {l}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 text-[10px] text-muted-foreground italic">
        {explainer}
      </div>
    </div>
  );
}
