import { useMemo, useRef, useState } from "react";
import { RotateCcw, Plus, Minus, Play } from "lucide-react";

/**
 * BTreeInsertAnimator — bygg et B-tree fra bunnen, én nøkkel om gangen.
 *
 * Brukeren kan:
 *  - Velge order m (3..7) — max barn per intern node, max m−1 nøkler per node.
 *  - Sette inn nøkler manuelt (input) eller spille av en demo-sekvens.
 *  - Slette nøkler og se merge / låne fra søsken når en node blir for tom.
 *
 * Pedagogisk hovedpoeng:
 *  - Treet vokser i bredden (splitter) lenge før det vokser i høyden.
 *  - Høyden er ≈ log_m(N), så selv med millioner av rader er h = 3–4.
 *  - Median bobler opp ved split → derfor stiger høyden bare når roten splitter.
 *
 * Implementasjon: enkel rekursiv B-tree (Bayer/McCreight-stil) med
 *  preemptiv split på vei ned. Vi animerer ved å bygge re-runs av insertion
 *  som en serie snapshots, og lar brukeren steppe gjennom.
 */

type BNode = {
  id: number;
  keys: number[];
  children: BNode[];
};

let __nid = 0;
const nid = () => ++__nid;

function newNode(keys: number[] = [], children: BNode[] = []): BNode {
  return { id: nid(), keys, children };
}

function isLeaf(n: BNode) {
  return n.children.length === 0;
}

function cloneTree(n: BNode): BNode {
  return {
    id: n.id,
    keys: [...n.keys],
    children: n.children.map(cloneTree),
  };
}

function height(n: BNode | null): number {
  if (!n) return 0;
  if (isLeaf(n)) return 1;
  return 1 + Math.max(...n.children.map(height));
}

function nodeCount(n: BNode | null): number {
  if (!n) return 0;
  return 1 + n.children.reduce((s, c) => s + nodeCount(c), 0);
}

function keyCount(n: BNode | null): number {
  if (!n) return 0;
  return n.keys.length + n.children.reduce((s, c) => s + keyCount(c), 0);
}

/** Total kapasitet for nåværende tre (alle noder × (m-1)). */
function totalCapacity(n: BNode | null, m: number): number {
  if (!n) return 0;
  return m - 1 + n.children.reduce((s, c) => s + totalCapacity(c, m), 0);
}

// ----- Insertion: preemptive split ----------------------------------------

function splitChild(parent: BNode, idx: number, m: number) {
  const child = parent.children[idx];
  const mid = Math.floor((m - 1) / 2);
  const medianKey = child.keys[mid];
  const left = newNode(
    child.keys.slice(0, mid),
    isLeaf(child) ? [] : child.children.slice(0, mid + 1),
  );
  const right = newNode(
    child.keys.slice(mid + 1),
    isLeaf(child) ? [] : child.children.slice(mid + 1),
  );
  parent.keys.splice(idx, 0, medianKey);
  parent.children.splice(idx, 1, left, right);
}

function insertNonFull(node: BNode, key: number, m: number) {
  // Hvis nøkkelen finnes, ignorer (sett av duplikater).
  if (node.keys.includes(key)) return;

  if (isLeaf(node)) {
    let i = node.keys.length - 1;
    while (i >= 0 && node.keys[i] > key) i--;
    node.keys.splice(i + 1, 0, key);
    return;
  }
  let i = node.keys.length - 1;
  while (i >= 0 && node.keys[i] > key) i--;
  i++;
  if (node.children[i].keys.length === m - 1) {
    splitChild(node, i, m);
    if (key > node.keys[i]) i++;
  }
  insertNonFull(node.children[i], key, m);
}

function insertKey(root: BNode, key: number, m: number): BNode {
  if (root.keys.length === m - 1) {
    const newRoot = newNode([], [root]);
    splitChild(newRoot, 0, m);
    insertNonFull(newRoot, key, m);
    return newRoot;
  } else {
    insertNonFull(root, key, m);
    return root;
  }
}

// ----- Deletion (forenklet) -----------------------------------------------
// Vi bruker en standard B-tree delete med rebalansering: borrow fra søsken
// eller merge. Holdes enkel — håndterer bare nøkler som faktisk finnes.

function findKey(node: BNode, key: number): number {
  let i = 0;
  while (i < node.keys.length && node.keys[i] < key) i++;
  return i;
}

function getPred(node: BNode, idx: number): number {
  let cur = node.children[idx];
  while (!isLeaf(cur)) cur = cur.children[cur.children.length - 1];
  return cur.keys[cur.keys.length - 1];
}

function getSucc(node: BNode, idx: number): number {
  let cur = node.children[idx + 1];
  while (!isLeaf(cur)) cur = cur.children[0];
  return cur.keys[0];
}

function borrowFromPrev(node: BNode, idx: number) {
  const child = node.children[idx];
  const sibling = node.children[idx - 1];
  child.keys.unshift(node.keys[idx - 1]);
  if (!isLeaf(child)) {
    child.children.unshift(sibling.children.pop()!);
  }
  node.keys[idx - 1] = sibling.keys.pop()!;
}

function borrowFromNext(node: BNode, idx: number) {
  const child = node.children[idx];
  const sibling = node.children[idx + 1];
  child.keys.push(node.keys[idx]);
  if (!isLeaf(child)) {
    child.children.push(sibling.children.shift()!);
  }
  node.keys[idx] = sibling.keys.shift()!;
}

function mergeNodes(node: BNode, idx: number) {
  const child = node.children[idx];
  const sibling = node.children[idx + 1];
  child.keys.push(node.keys[idx]);
  for (const k of sibling.keys) child.keys.push(k);
  for (const c of sibling.children) child.children.push(c);
  node.keys.splice(idx, 1);
  node.children.splice(idx + 1, 1);
}

function fill(node: BNode, idx: number, t: number) {
  if (idx !== 0 && node.children[idx - 1].keys.length >= t) {
    borrowFromPrev(node, idx);
  } else if (idx !== node.children.length - 1 && node.children[idx + 1].keys.length >= t) {
    borrowFromNext(node, idx);
  } else {
    if (idx !== node.children.length - 1) {
      mergeNodes(node, idx);
    } else {
      mergeNodes(node, idx - 1);
    }
  }
}

function removeFromLeaf(node: BNode, idx: number) {
  node.keys.splice(idx, 1);
}

function removeFromNonLeaf(node: BNode, idx: number, m: number) {
  const k = node.keys[idx];
  const t = Math.ceil(m / 2); // min keys per node = t-1
  if (node.children[idx].keys.length >= t) {
    const pred = getPred(node, idx);
    node.keys[idx] = pred;
    deleteFrom(node.children[idx], pred, m);
  } else if (node.children[idx + 1].keys.length >= t) {
    const succ = getSucc(node, idx);
    node.keys[idx] = succ;
    deleteFrom(node.children[idx + 1], succ, m);
  } else {
    mergeNodes(node, idx);
    deleteFrom(node.children[idx], k, m);
  }
}

function deleteFrom(node: BNode, key: number, m: number) {
  const t = Math.ceil(m / 2);
  const idx = findKey(node, key);
  if (idx < node.keys.length && node.keys[idx] === key) {
    if (isLeaf(node)) removeFromLeaf(node, idx);
    else removeFromNonLeaf(node, idx, m);
  } else {
    if (isLeaf(node)) return; // ikke til stede
    const flag = idx === node.keys.length;
    if (node.children[idx].keys.length < t) fill(node, idx, t);
    if (flag && idx > node.children.length) {
      deleteFrom(node.children[idx - 1], key, m);
    } else {
      deleteFrom(node.children[idx], key, m);
    }
  }
}

function deleteKey(root: BNode, key: number, m: number): BNode {
  deleteFrom(root, key, m);
  if (root.keys.length === 0) {
    if (isLeaf(root)) return newNode();
    return root.children[0];
  }
  return root;
}

// ----- Layout for SVG -----------------------------------------------------

type Laid = {
  node: BNode;
  x: number;
  y: number;
  w: number;
  level: number;
};

function layout(root: BNode | null, nodeWidth: (n: BNode) => number) {
  if (!root)
    return {
      items: [] as Laid[],
      links: [] as { from: Laid; to: Laid }[],
      totalWidth: 0,
      totalHeight: 0,
    };

  // Allokér x-bredde per blad, så fordel oppover
  const leafGap = 24;
  const levelHeight = 78;
  const items: Laid[] = [];
  const links: { from: Laid; to: Laid }[] = [];

  function walkAssign(n: BNode, level: number): { width: number } {
    if (isLeaf(n)) {
      const w = nodeWidth(n);
      return { width: w + leafGap };
    }
    let totalW = 0;
    for (const c of n.children) totalW += walkAssign(c, level + 1).width;
    const myW = nodeWidth(n);
    return { width: Math.max(totalW, myW + leafGap) };
  }

  function placeLeft(n: BNode, x: number, level: number): { width: number; laid: Laid } {
    const myW = nodeWidth(n);
    if (isLeaf(n)) {
      const w = myW + leafGap;
      const laid: Laid = { node: n, x: x + w / 2, y: level * levelHeight + 30, w: myW, level };
      items.push(laid);
      return { width: w, laid };
    }
    let acc = 0;
    const childLaids: Laid[] = [];
    for (const c of n.children) {
      const res = placeLeft(c, x + acc, level + 1);
      acc += res.width;
      childLaids.push(res.laid);
    }
    const w = Math.max(acc, myW + leafGap);
    const centerX = x + w / 2;
    const laid: Laid = { node: n, x: centerX, y: level * levelHeight + 30, w: myW, level };
    items.push(laid);
    for (const cl of childLaids) links.push({ from: laid, to: cl });
    return { width: w, laid };
  }

  const tot = walkAssign(root, 0).width;
  placeLeft(root, 0, 0);

  const maxLevel = Math.max(...items.map((i) => i.level));
  return { items, links, totalWidth: tot, totalHeight: (maxLevel + 1) * levelHeight + 20 };
}

// ----- Komponenten --------------------------------------------------------

const DEMO_SEQUENCES: { label: string; seq: number[] }[] = [
  { label: "Stigende (1..15)", seq: Array.from({ length: 15 }, (_, i) => i + 1) },
  {
    label: "Tilfeldig 1..20",
    seq: [10, 3, 17, 5, 11, 1, 8, 14, 19, 6, 2, 13, 9, 16, 18, 4, 7, 15, 12, 20],
  },
  {
    label: "Tett klynge (50..70)",
    seq: [60, 55, 65, 50, 52, 57, 62, 68, 70, 53, 58, 64, 66, 51, 69],
  },
];

export function BTreeInsertAnimator() {
  const [m, setM] = useState(4);
  const [root, setRoot] = useState<BNode>(() => newNode());
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<{ op: string; key: number }[]>([]);
  const [playing, setPlaying] = useState(false);
  const playRef = useRef<number | null>(null);

  // Når m endres: bygg om treet helt (treet er ikke gyldig for ny m)
  const onChangeOrder = (nm: number) => {
    setM(nm);
    setRoot(newNode());
    setHistory([]);
  };

  const doInsert = (k: number) => {
    if (Number.isNaN(k)) return;
    setRoot((r) => insertKey(cloneTree(r), k, m));
    setHistory((h) => [...h, { op: "insert", key: k }]);
  };

  const doDelete = (k: number) => {
    if (Number.isNaN(k)) return;
    setRoot((r) => deleteKey(cloneTree(r), k, m));
    setHistory((h) => [...h, { op: "delete", key: k }]);
  };

  const reset = () => {
    setRoot(newNode());
    setHistory([]);
    stopPlay();
  };

  const stopPlay = () => {
    if (playRef.current) {
      window.clearTimeout(playRef.current);
      playRef.current = null;
    }
    setPlaying(false);
  };

  const playSeq = (seq: number[]) => {
    stopPlay();
    setRoot(newNode());
    setHistory([]);
    setPlaying(true);
    let i = 0;
    let cur = newNode();
    const step = () => {
      if (i >= seq.length) {
        setPlaying(false);
        playRef.current = null;
        return;
      }
      cur = insertKey(cloneTree(cur), seq[i], m);
      setRoot(cur);
      setHistory((h) => [...h, { op: "insert", key: seq[i] }]);
      i++;
      playRef.current = window.setTimeout(step, 600);
    };
    step();
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parts = input
      .split(/[\s,;]+/)
      .map((s) => parseInt(s, 10))
      .filter((n) => !Number.isNaN(n) && n >= 0 && n < 1000);
    for (const k of parts) doInsert(k);
    setInput("");
  };

  // Layout
  const nodeWidth = (n: BNode) => Math.max(64, n.keys.length * 30 + 18);
  const { items, links, totalWidth, totalHeight } = useMemo(
    () => layout(root.keys.length === 0 && isLeaf(root) ? null : root, nodeWidth),

    [root],
  );

  const h = height(root.keys.length === 0 && isLeaf(root) ? null : root);
  const nNodes = nodeCount(root.keys.length === 0 && isLeaf(root) ? null : root);
  const nKeys = keyCount(root.keys.length === 0 && isLeaf(root) ? null : root);
  const cap = totalCapacity(root.keys.length === 0 && isLeaf(root) ? null : root, m);
  const fill = cap > 0 ? Math.round((nKeys / cap) * 100) : 0;

  // Teoretisk høyde for N=nKeys i et B-tree av order m: h_max ≈ log_t((N+1)/2)+1, t = ceil(m/2)
  const t = Math.ceil(m / 2);
  const theoH = nKeys === 0 ? 0 : Math.max(1, Math.ceil(Math.log((nKeys + 1) / 2) / Math.log(t)));

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
        <h3 className="font-semibold">B-tree insert / delete-animator</h3>
        <div className="sm:ml-auto flex items-center gap-3">
          <label className="text-xs flex items-center gap-2">
            <span className="text-muted-foreground">Order m =</span>
            <select
              value={m}
              onChange={(e) => onChangeOrder(parseInt(e.target.value, 10))}
              className="bg-background border border-border rounded px-2 py-1 text-sm"
            >
              {[3, 4, 5, 6, 7].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-border hover:bg-muted"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Tøm
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        Order m = max barn per intern node, max m−1 nøkler per node, min ⌈m/2⌉−1 nøkler per
        ikke-rot-node. Ved overflow splittes noden og median bobler opp; ved underflow lånes fra
        søsken eller noder slås sammen.
      </p>

      <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2 mb-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Skriv tall: 5 12 3 ..."
          className="flex-1 min-w-[180px] bg-background border border-border rounded px-3 py-1.5 text-sm font-mono"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-brand text-white hover:bg-brand/90"
        >
          <Plus className="h-3.5 w-3.5" /> Sett inn
        </button>
        <button
          type="button"
          onClick={() => {
            const parts = input
              .split(/[\s,;]+/)
              .map((s) => parseInt(s, 10))
              .filter((n) => !Number.isNaN(n));
            for (const k of parts) doDelete(k);
            setInput("");
          }}
          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded border border-border hover:bg-muted"
        >
          <Minus className="h-3.5 w-3.5" /> Slett
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs text-muted-foreground">Demo:</span>
        {DEMO_SEQUENCES.map((d) => (
          <button
            key={d.label}
            type="button"
            disabled={playing}
            onClick={() => playSeq(d.seq)}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-border hover:bg-muted disabled:opacity-50"
          >
            <Play className="h-3 w-3" /> {d.label}
          </button>
        ))}
        {playing && (
          <button
            type="button"
            onClick={stopPlay}
            className="text-xs px-2.5 py-1 rounded border border-border hover:bg-muted"
          >
            Stopp
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_220px] gap-4">
        {/* SVG */}
        <div className="rounded-lg border border-border bg-background overflow-auto">
          <svg
            width={Math.max(totalWidth, 300)}
            height={Math.max(totalHeight, 120)}
            className="block"
          >
            {links.map((lk, i) => (
              <line
                key={i}
                x1={lk.from.x}
                y1={lk.from.y + 18}
                x2={lk.to.x}
                y2={lk.to.y - 18}
                stroke="currentColor"
                strokeOpacity={0.35}
                strokeWidth={1}
              />
            ))}
            {items.map((it) => {
              const w = it.w;
              const isRoot = it.level === 0;
              const isLf = isLeaf(it.node);
              return (
                <g key={it.node.id} transform={`translate(${it.x - w / 2}, ${it.y - 18})`}>
                  <rect
                    width={w}
                    height={36}
                    rx={6}
                    className={
                      isLf
                        ? "fill-emerald-500/10 stroke-emerald-500/40"
                        : isRoot
                          ? "fill-brand/10 stroke-brand/50"
                          : "fill-amber-500/10 stroke-amber-500/40"
                    }
                    strokeWidth={1.5}
                  />
                  {it.node.keys.map((k, ki) => {
                    const cellW = w / it.node.keys.length;
                    return (
                      <g key={ki} transform={`translate(${ki * cellW}, 0)`}>
                        {ki > 0 && (
                          <line
                            x1={0}
                            y1={4}
                            x2={0}
                            y2={32}
                            stroke="currentColor"
                            strokeOpacity={0.25}
                          />
                        )}
                        <text
                          x={cellW / 2}
                          y={23}
                          textAnchor="middle"
                          className="fill-foreground text-[12px] font-mono"
                        >
                          {k}
                        </text>
                      </g>
                    );
                  })}
                  {it.node.keys.length === 0 && (
                    <text
                      x={w / 2}
                      y={23}
                      textAnchor="middle"
                      className="fill-muted-foreground text-[10px] italic"
                    >
                      tomt
                    </text>
                  )}
                </g>
              );
            })}
            {items.length === 0 && (
              <text x={150} y={60} className="fill-muted-foreground text-sm" textAnchor="middle">
                Tomt tre — sett inn nøkler for å bygge.
              </text>
            )}
          </svg>
        </div>

        {/* Sidepanel */}
        <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-2">
          <div className="font-semibold text-sm mb-1">Status</div>
          <Stat label="Høyde h" value={h.toString()} />
          <Stat label="Noder" value={nNodes.toString()} />
          <Stat label="Nøkler" value={nKeys.toString()} />
          <Stat label="Kapasitet (nøkler)" value={`${nKeys}/${cap}`} />
          <Stat label="Fyll-grad" value={`${fill}%`} />
          <div className="pt-2 border-t border-border">
            <div className="text-muted-foreground mb-1">
              Teoretisk min høyde for N={nKeys}, t=⌈m/2⌉={t}:
            </div>
            <div className="font-mono">
              ≈ log<sub>{t}</sub>({nKeys || 1}) = {theoH}
            </div>
          </div>
          <div className="pt-2 border-t border-border">
            <div className="text-muted-foreground mb-1">Siste op:</div>
            <div className="font-mono text-foreground/80 max-h-24 overflow-auto">
              {history.length === 0
                ? "—"
                : history.slice(-8).map((h, i) => (
                    <div key={i}>
                      {h.op === "insert" ? "ins" : "del"} {h.key}
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-3 text-xs">
        <strong>Observér:</strong> hver gang en blad-node passerer m−1 nøkler, splitter den og
        medianen bobler opp. Treet vokser dermed i bredden lenge før det vokser i høyden. Roten er
        den eneste noden som kan ha færre nøkler enn ⌈m/2⌉−1, og treet vokser i høyden kun når roten
        splitter.
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
