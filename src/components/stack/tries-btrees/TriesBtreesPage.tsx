import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Plus, RotateCcw } from "lucide-react";

type Mode = "trie" | "btree";

// ---- Trie ----
type TrieNode = {
  children: Map<string, TrieNode>;
  isEnd: boolean;
};

function newTrie(): TrieNode {
  return { children: new Map(), isEnd: false };
}
function insertTrie(root: TrieNode, word: string): void {
  let cur = root;
  for (const ch of word) {
    if (!cur.children.has(ch)) cur.children.set(ch, newTrie());
    cur = cur.children.get(ch)!;
  }
  cur.isEnd = true;
}
function findPrefix(root: TrieNode, prefix: string): TrieNode | null {
  let cur = root;
  for (const ch of prefix) {
    const n = cur.children.get(ch);
    if (!n) return null;
    cur = n;
  }
  return cur;
}
function collectWords(node: TrieNode, prefix: string, out: string[]): void {
  if (node.isEnd) out.push(prefix);
  for (const [ch, child] of node.children) collectWords(child, prefix + ch, out);
}

// ---- B-tree (order = 3, dvs maks 2 nøkler per node) ----
type BNode = {
  keys: number[];
  children: BNode[]; // tom for blad
  leaf: boolean;
};

const B_MIN_DEG = 2; // t — maks 2t-1 = 3 nøkler. Vi viser med t=2.

function newBTree(): BNode {
  return { keys: [], children: [], leaf: true };
}

function insertBTree(root: BNode, k: number): BNode {
  if (root.keys.length === 2 * B_MIN_DEG - 1) {
    const s: BNode = { keys: [], children: [root], leaf: false };
    splitChild(s, 0);
    insertNonFull(s, k);
    return s;
  }
  insertNonFull(root, k);
  return root;
}
function insertNonFull(x: BNode, k: number): void {
  let i = x.keys.length - 1;
  if (x.leaf) {
    while (i >= 0 && k < x.keys[i]) i--;
    x.keys.splice(i + 1, 0, k);
  } else {
    while (i >= 0 && k < x.keys[i]) i--;
    i++;
    if (x.children[i].keys.length === 2 * B_MIN_DEG - 1) {
      splitChild(x, i);
      if (k > x.keys[i]) i++;
    }
    insertNonFull(x.children[i], k);
  }
}
function splitChild(x: BNode, idx: number): void {
  const t = B_MIN_DEG;
  const y = x.children[idx];
  const z: BNode = {
    keys: y.keys.slice(t),
    children: y.leaf ? [] : y.children.slice(t),
    leaf: y.leaf,
  };
  const mid = y.keys[t - 1];
  y.keys = y.keys.slice(0, t - 1);
  if (!y.leaf) y.children = y.children.slice(0, t);
  x.children.splice(idx + 1, 0, z);
  x.keys.splice(idx, 0, mid);
}

function cloneBTree(n: BNode): BNode {
  return {
    keys: [...n.keys],
    leaf: n.leaf,
    children: n.children.map(cloneBTree),
  };
}

export function TriesBtreesPage() {
  const [mode, setMode] = useState<Mode>("trie");

  // Trie state
  const [trieRoot, setTrieRoot] = useState<TrieNode>(() => {
    const t = newTrie();
    ["hus", "huske", "hat", "hatt", "katt"].forEach((w) => insertTrie(t, w));
    return t;
  });
  const [trieInput, setTrieInput] = useState("");
  const [prefix, setPrefix] = useState("");

  const matched = useMemo(() => {
    if (!prefix) return [] as string[];
    const node = findPrefix(trieRoot, prefix);
    if (!node) return [];
    const out: string[] = [];
    collectWords(node, prefix, out);
    return out;
  }, [trieRoot, prefix]);

  // B-tree state
  const [btreeRoot, setBtreeRoot] = useState<BNode>(() => {
    let r = newBTree();
    [10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 50, 35, 40].forEach((k) => {
      r = insertBTree(cloneBTree(r), k);
    });
    return r;
  });
  const [btreeInput, setBtreeInput] = useState("");

  function trieInsert() {
    const w = trieInput.trim().toLowerCase();
    if (!w) return;
    const next = cloneTrie(trieRoot);
    insertTrie(next, w);
    setTrieRoot(next);
    setTrieInput("");
  }
  function btreeInsert() {
    const n = parseInt(btreeInput, 10);
    if (isNaN(n)) return;
    setBtreeRoot((r) => insertBTree(cloneBTree(r), n));
    setBtreeInput("");
  }
  function resetTrie() {
    const t = newTrie();
    ["hus", "huske", "hat", "hatt", "katt"].forEach((w) => insertTrie(t, w));
    setTrieRoot(t);
    setPrefix("");
  }
  function resetBtree() {
    let r = newBTree();
    [10, 20, 5, 6, 12, 30].forEach((k) => {
      r = insertBTree(cloneBTree(r), k);
    });
    setBtreeRoot(r);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Trier og B-trær — to spesialiserte trær
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Trier oppslag av ord i O(k) der k = nøkkelens lengde. B-trær gir
            bredere, grunnere trær — ideelt når data ligger på disk og hver
            nodelesning koster mye.
          </p>
        </header>

        <div className="flex gap-2 mb-4">
          <ModeTab id="trie" current={mode} onChange={setMode}>
            Trie (prefix-tre)
          </ModeTab>
          <ModeTab id="btree" current={mode} onChange={setMode}>
            B-tree (t = 2)
          </ModeTab>
        </div>

        {mode === "trie" ? (
          <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            <div className="flex flex-wrap gap-2 items-end">
              <div className="flex-1 min-w-40">
                <label className="text-xs text-muted-foreground block mb-1">
                  Sett inn ord
                </label>
                <input
                  value={trieInput}
                  onChange={(e) => setTrieInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && trieInsert()}
                  placeholder="f.eks. hund"
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                />
              </div>
              <Button size="sm" onClick={trieInsert} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Sett inn
              </Button>
              <Button size="sm" variant="outline" onClick={resetTrie} className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" /> Nullstill
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 items-end">
              <div className="flex-1 min-w-40">
                <label className="text-xs text-muted-foreground block mb-1">
                  Søk prefix (autocomplete)
                </label>
                <input
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value.toLowerCase())}
                  placeholder="f.eks. hu"
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                />
              </div>
              <div className="text-xs text-muted-foreground pb-2">
                {prefix
                  ? matched.length > 0
                    ? `${matched.length} treff: ${matched.join(", ")}`
                    : "Ingen treff på prefix"
                  : ""}
              </div>
            </div>

            <TrieView root={trieRoot} highlightPrefix={prefix} />
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            <div className="flex flex-wrap gap-2 items-end">
              <div className="flex-1 min-w-40">
                <label className="text-xs text-muted-foreground block mb-1">
                  Sett inn nøkkel (heltall)
                </label>
                <input
                  type="number"
                  value={btreeInput}
                  onChange={(e) => setBtreeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && btreeInsert()}
                  placeholder="f.eks. 42"
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                />
              </div>
              <Button size="sm" onClick={btreeInsert} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Sett inn
              </Button>
              <Button size="sm" variant="outline" onClick={resetBtree} className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" /> Nullstill
              </Button>
            </div>

            <BtreeView root={btreeRoot} />
            <div className="text-xs text-muted-foreground">
              t = 2 betyr maks 3 nøkler per node. Når en node blir full,
              splittes den og midt-nøkkelen pushes opp.
            </div>
          </div>
        )}

        <Lessons mode={mode} />
      </main>
    </div>
  );
}

function cloneTrie(n: TrieNode): TrieNode {
  const c: TrieNode = { children: new Map(), isEnd: n.isEnd };
  for (const [k, v] of n.children) c.children.set(k, cloneTrie(v));
  return c;
}

function ModeTab({
  id,
  current,
  onChange,
  children,
}: {
  id: Mode;
  current: Mode;
  onChange: (m: Mode) => void;
  children: React.ReactNode;
}) {
  const active = id === current;
  return (
    <button
      onClick={() => onChange(id)}
      className={`rounded-md px-3 py-1.5 text-xs font-medium ${
        active ? "bg-brand text-brand-foreground" : "bg-muted hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}

function TrieView({
  root,
  highlightPrefix,
}: {
  root: TrieNode;
  highlightPrefix: string;
}) {
  return (
    <div className="rounded-md border border-border bg-background p-3 overflow-x-auto">
      <TrieRender node={root} path="" highlightPrefix={highlightPrefix} isRoot />
    </div>
  );
}

function TrieRender({
  node,
  path,
  highlightPrefix,
  isRoot,
}: {
  node: TrieNode;
  path: string;
  highlightPrefix: string;
  isRoot?: boolean;
}) {
  const onPath =
    !!highlightPrefix && highlightPrefix.startsWith(path) && path.length <= highlightPrefix.length;
  const isPrefixNode = onPath && path === highlightPrefix;
  const children = [...node.children.entries()].sort(([a], [b]) => a.localeCompare(b));
  return (
    <div className="flex items-start gap-2">
      <div
        className={`flex flex-col items-center justify-center min-w-9 h-9 rounded-full border text-xs font-mono ${
          isPrefixNode
            ? "border-brand bg-brand/20 text-brand font-semibold"
            : onPath
              ? "border-brand/40 bg-brand/5"
              : "border-border bg-background"
        } ${isRoot ? "border-dashed" : ""} ${node.isEnd ? "ring-2 ring-success/40" : ""}`}
        title={node.isEnd ? `ord: ${path}` : path || "root"}
      >
        {isRoot ? "·" : path.slice(-1)}
      </div>
      {children.length > 0 && (
        <div className="flex flex-col gap-1.5 border-l border-border/60 pl-3">
          {children.map(([ch, child]) => (
            <TrieRender
              key={ch}
              node={child}
              path={path + ch}
              highlightPrefix={highlightPrefix}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BtreeView({ root }: { root: BNode }) {
  return (
    <div className="overflow-x-auto">
      <BtreeRender node={root} />
    </div>
  );
}

function BtreeRender({ node }: { node: BNode }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center rounded-md border border-border bg-background overflow-hidden">
        {node.keys.map((k, i) => (
          <div
            key={i}
            className={`px-3 py-1.5 text-sm font-mono tabular-nums ${
              i > 0 ? "border-l border-border" : ""
            }`}
          >
            {k}
          </div>
        ))}
        {node.keys.length === 0 && (
          <div className="px-3 py-1.5 text-xs text-muted-foreground">tom</div>
        )}
      </div>
      {!node.leaf && node.children.length > 0 && (
        <div className="flex items-start gap-3">
          {node.children.map((c, i) => (
            <BtreeRender key={i} node={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function Lessons({ mode }: { mode: Mode }) {
  return (
    <section className="mt-8 space-y-3 text-sm">
      <h2 className="text-lg font-semibold">Hvorfor disse?</h2>
      <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
        {mode === "trie" ? (
          <>
            <li>
              <strong className="text-foreground">Trie-oppslag:</strong>{" "}
              O(k) der k er ord-lengde — uavhengig av antall ord lagret.
            </li>
            <li>
              <strong className="text-foreground">Prefix-søk:</strong> "alle
              ord som starter med hu_" er trivielt: gå til hu-noden, samle
              alle ord under.
            </li>
            <li>
              Minne kan bli stort hvis ordene er ulike. Komprimerte trier
              (radix tree / Patricia trie) slår sammen kjeder av single-child
              noder.
            </li>
          </>
        ) : (
          <>
            <li>
              <strong className="text-foreground">Bredt og grunt:</strong>{" "}
              hver node har 2t-1 nøkler. Færre nivåer enn binærtrær → færre
              disk-reads.
            </li>
            <li>
              <strong className="text-foreground">Garantert balansert</strong>{" "}
              — alle blader på samme nivå. Innsetting kan splitte noder
              oppover.
            </li>
            <li>
              Brukt i de fleste databaseindekser (B+-tree, faktisk) og i
              filsystem (NTFS, ext4, …) fordi disk-I/O dominerer.
            </li>
          </>
        )}
      </ul>
    </section>
  );
}
