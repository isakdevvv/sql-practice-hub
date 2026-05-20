import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Play } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv visualisering for trær.
// Tre moduser:
//   1) BST insert/delete — bygg et binært søketre. Viser in-order under.
//   2) Traversering — fast 7-noders tre, animer preorder/inorder/postorder/BFS.
//   3) AVL-rotasjoner — start med ubalansert tre, kjør rotasjoner steg for steg.
// Layout: x = in-order indeks, y = dybde. Noder er SVG-sirkler; cx/cy animeres
// med CSS-transition. Aktiv node markeres i brand-farge.
// --------------------------------------------------------------------------

type Mode = "bst" | "traversal" | "avl";

type TreeNode = {
  id: number;
  key: number;
  /** AVL-høyde (brukes bare i AVL-modus, men vi holder den oppe ellers også) */
  height: number;
  left: TreeNode | null;
  right: TreeNode | null;
};

type Positioned = {
  node: TreeNode;
  x: number; // 0..1 (in-order indeks / max)
  y: number; // dybde
  parent: TreeNode | null;
};

type LogEntry = { op: string; detail?: string };

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "bst", label: "BST insert/delete", sub: "bygg og slett" },
  { id: "traversal", label: "Traversering", sub: "pre/in/post/BFS" },
  { id: "avl", label: "AVL-rotasjoner", sub: "balansér ubalansert tre" },
];

// --------------------- ID-generator (modul-skop, stabil) ---------------------
let __idCounter = 0;
const nextId = () => ++__idCounter;

// --------------------- Tre-bygging ------------------------------------------

function makeNode(key: number, left: TreeNode | null = null, right: TreeNode | null = null): TreeNode {
  return { id: nextId(), key, height: 1, left, right };
}

function height(n: TreeNode | null): number {
  return n ? n.height : 0;
}
function updateHeight(n: TreeNode) {
  n.height = 1 + Math.max(height(n.left), height(n.right));
}

// BST insert (uten balansering)
function bstInsert(root: TreeNode | null, key: number): TreeNode {
  if (root === null) return makeNode(key);
  if (key < root.key) root.left = bstInsert(root.left, key);
  else if (key > root.key) root.right = bstInsert(root.right, key);
  updateHeight(root);
  return root;
}

function minNode(n: TreeNode): TreeNode {
  while (n.left !== null) n = n.left;
  return n;
}

function bstDelete(root: TreeNode | null, key: number): TreeNode | null {
  if (root === null) return null;
  if (key < root.key) root.left = bstDelete(root.left, key);
  else if (key > root.key) root.right = bstDelete(root.right, key);
  else {
    if (root.left === null) return root.right;
    if (root.right === null) return root.left;
    const succ = minNode(root.right);
    root.key = succ.key;
    root.right = bstDelete(root.right, succ.key);
  }
  updateHeight(root);
  return root;
}

// --------------------- Layout: in-order x, depth y --------------------------

function layout(root: TreeNode | null): { positions: Map<number, Positioned>; depth: number; width: number } {
  const positions = new Map<number, Positioned>();
  if (!root) return { positions, depth: 0, width: 0 };
  let inorderIdx = 0;
  let maxDepth = 0;
  const walk = (n: TreeNode | null, depth: number, parent: TreeNode | null) => {
    if (!n) return;
    walk(n.left, depth + 1, n);
    const x = inorderIdx++;
    positions.set(n.id, { node: n, x, y: depth, parent });
    if (depth > maxDepth) maxDepth = depth;
    walk(n.right, depth + 1, n);
  };
  walk(root, 0, null);
  return { positions, depth: maxDepth, width: Math.max(1, inorderIdx) };
}

function inorderKeys(root: TreeNode | null): number[] {
  const out: number[] = [];
  const walk = (n: TreeNode | null) => {
    if (!n) return;
    walk(n.left);
    out.push(n.key);
    walk(n.right);
  };
  walk(root);
  return out;
}

// --------------------- AVL ---------------------------------------------------

function balanceFactor(n: TreeNode | null): number {
  if (!n) return 0;
  return height(n.left) - height(n.right);
}

function rotateRight(y: TreeNode): TreeNode {
  const x = y.left!;
  const t2 = x.right;
  x.right = y;
  y.left = t2;
  updateHeight(y);
  updateHeight(x);
  return x;
}

function rotateLeft(x: TreeNode): TreeNode {
  const y = x.right!;
  const t2 = y.left;
  y.left = x;
  x.right = t2;
  updateHeight(x);
  updateHeight(y);
  return y;
}

type RotationStep = {
  type: "LL" | "RR" | "LR" | "RL";
  pivotId: number;
  label: string;
};

/**
 * Finn én rotasjon å gjøre, returner stien fra rot ned til pivot og rotasjonstypen.
 * Returnerer null hvis treet er balansert.
 */
function findNextRotation(root: TreeNode | null): { pivot: TreeNode; type: RotationStep["type"] } | null {
  // DFS bottom-up: rotér på dypeste ubalanserte node først.
  let found: { pivot: TreeNode; type: RotationStep["type"] } | null = null;
  const walk = (n: TreeNode | null) => {
    if (!n || found) return;
    walk(n.left);
    if (found) return;
    walk(n.right);
    if (found) return;
    updateHeight(n);
    const bf = balanceFactor(n);
    if (bf > 1) {
      // venstre er tyngst
      if (balanceFactor(n.left) >= 0) found = { pivot: n, type: "LL" };
      else found = { pivot: n, type: "LR" };
    } else if (bf < -1) {
      if (balanceFactor(n.right) <= 0) found = { pivot: n, type: "RR" };
      else found = { pivot: n, type: "RL" };
    }
  };
  walk(root);
  return found;
}

/**
 * Utfør rotasjonen på pivot-noden i treet (pivot identifiseres ved id).
 * Returnerer nytt rot.
 */
function applyRotation(root: TreeNode | null, pivotId: number, type: RotationStep["type"]): TreeNode | null {
  if (!root) return null;
  const replace = (n: TreeNode | null): TreeNode | null => {
    if (!n) return null;
    if (n.id === pivotId) {
      switch (type) {
        case "LL":
          return rotateRight(n);
        case "RR":
          return rotateLeft(n);
        case "LR":
          n.left = rotateLeft(n.left!);
          return rotateRight(n);
        case "RL":
          n.right = rotateRight(n.right!);
          return rotateLeft(n);
      }
    }
    n.left = replace(n.left);
    n.right = replace(n.right);
    updateHeight(n);
    return n;
  };
  return replace(root);
}

// --------------------- Fast tre for traversering ----------------------------

function buildTraversalTree(): TreeNode {
  // Klassisk 7-noders tre:
  //          10
  //        /    \
  //       5      15
  //      / \    /  \
  //     3   7  12  20
  const n3 = makeNode(3);
  const n7 = makeNode(7);
  const n5 = makeNode(5, n3, n7);
  const n12 = makeNode(12);
  const n20 = makeNode(20);
  const n15 = makeNode(15, n12, n20);
  const root = makeNode(10, n5, n15);
  // Sett høyder
  const fix = (n: TreeNode) => {
    if (n.left) fix(n.left);
    if (n.right) fix(n.right);
    updateHeight(n);
  };
  fix(root);
  return root;
}

function buildUnbalancedTree(): TreeNode {
  // Bygg ved å sette inn 1..6 i en ubalansert BST (skewed til høyre).
  let root: TreeNode | null = null;
  for (const k of [1, 2, 3, 4, 5, 6]) {
    root = bstInsert(root, k);
  }
  return root!;
}

// --------------------- Traverseringer ---------------------------------------

type Order = "preorder" | "inorder" | "postorder" | "level";

function traversalSequence(root: TreeNode | null, order: Order): TreeNode[] {
  const out: TreeNode[] = [];
  if (!root) return out;
  if (order === "level") {
    const q: TreeNode[] = [root];
    while (q.length) {
      const n = q.shift()!;
      out.push(n);
      if (n.left) q.push(n.left);
      if (n.right) q.push(n.right);
    }
    return out;
  }
  const walk = (n: TreeNode | null) => {
    if (!n) return;
    if (order === "preorder") out.push(n);
    walk(n.left);
    if (order === "inorder") out.push(n);
    walk(n.right);
    if (order === "postorder") out.push(n);
  };
  walk(root);
  return out;
}

// =====================================================================
//                         HOVEDKOMPONENT
// =====================================================================

export function TreeVisualizer() {
  const [mode, setMode] = useState<Mode>("bst");

  // Ett tre per modus, holdes adskilt så reset av én ikke nuker de andre.
  const [bstRoot, setBstRoot] = useState<TreeNode | null>(() => {
    let r: TreeNode | null = null;
    for (const k of [10, 5, 15, 3, 7, 12, 20]) r = bstInsert(r, k);
    return r;
  });
  const [traversalRoot] = useState<TreeNode>(() => buildTraversalTree());
  const [avlRoot, setAvlRoot] = useState<TreeNode | null>(() => buildUnbalancedTree());

  const [input, setInput] = useState("8");
  const [log, setLog] = useState<LogEntry[]>([]);

  // Traversering-state
  const [order, setOrder] = useState<Order>("inorder");
  const [travVisited, setTravVisited] = useState<number[]>([]); // ids besøkt
  const [travActive, setTravActive] = useState<number | null>(null);
  const [travRunning, setTravRunning] = useState(false);
  const travTimerRef = useRef<number | null>(null);

  // AVL-state
  const [avlActive, setAvlActive] = useState<number | null>(null);
  const [avlLastType, setAvlLastType] = useState<RotationStep["type"] | null>(null);

  // Stopp evt. løpende traversering når modus skifter
  useEffect(() => {
    return () => {
      if (travTimerRef.current !== null) window.clearTimeout(travTimerRef.current);
    };
  }, []);

  const pushLog = (e: LogEntry) => setLog((l) => [e, ...l].slice(0, 6));

  const parsedInput = () => {
    const n = Number.parseInt(input, 10);
    return Number.isFinite(n) ? n : 0;
  };

  // --------- BST-operasjoner ---------
  const opInsert = () => {
    const v = parsedInput();
    // Klon treet på vei ned (deep-ish) for å trigge re-render uten å mutere noder vi viser.
    const cloned = cloneTree(bstRoot);
    const next = bstInsert(cloned, v);
    setBstRoot(next);
    pushLog({ op: `insert(${v})`, detail: "BST-egenskap bevart" });
  };

  const opDelete = () => {
    const v = parsedInput();
    const cloned = cloneTree(bstRoot);
    const next = bstDelete(cloned, v);
    setBstRoot(next);
    pushLog({ op: `delete(${v})`, detail: "ev. inorder successor" });
  };

  const opResetBst = () => {
    let r: TreeNode | null = null;
    for (const k of [10, 5, 15, 3, 7, 12, 20]) r = bstInsert(r, k);
    setBstRoot(r);
    setLog([]);
  };

  // --------- Traversering ---------
  const runTraversal = (o: Order) => {
    if (travTimerRef.current !== null) window.clearTimeout(travTimerRef.current);
    setOrder(o);
    setTravVisited([]);
    setTravActive(null);
    setTravRunning(true);
    const seq = traversalSequence(traversalRoot, o);
    const step = (i: number) => {
      if (i >= seq.length) {
        setTravActive(null);
        setTravRunning(false);
        return;
      }
      const n = seq[i];
      setTravActive(n.id);
      setTravVisited((cur) => [...cur, n.id]);
      travTimerRef.current = window.setTimeout(() => step(i + 1), 550);
    };
    step(0);
    pushLog({ op: `${o}`, detail: orderHint(o) });
  };

  const resetTraversal = () => {
    if (travTimerRef.current !== null) window.clearTimeout(travTimerRef.current);
    setTravVisited([]);
    setTravActive(null);
    setTravRunning(false);
  };

  // --------- AVL ---------
  const stepAvl = () => {
    const cloned = cloneTree(avlRoot);
    const found = findNextRotation(cloned);
    if (!found) {
      pushLog({ op: "balansert", detail: "ingen rotasjon nødvendig" });
      setAvlActive(null);
      setAvlLastType(null);
      return;
    }
    const pivotId = found.pivot.id;
    setAvlActive(pivotId);
    setAvlLastType(found.type);
    // Liten pause så studenten ser hvilken node som er pivot, før rotasjonen utføres.
    window.setTimeout(() => {
      const next = applyRotation(cloned, pivotId, found.type);
      setAvlRoot(next);
      pushLog({ op: `${found.type}-rotasjon`, detail: `pivot = nøkkel ${found.pivot.key}` });
      // Hold highlight litt etterpå
      window.setTimeout(() => setAvlActive(null), 700);
    }, 450);
  };

  const opResetAvl = () => {
    setAvlRoot(buildUnbalancedTree());
    setAvlActive(null);
    setAvlLastType(null);
    setLog([]);
  };

  // --------- Rendering ---------

  const currentRoot =
    mode === "bst" ? bstRoot : mode === "traversal" ? traversalRoot : avlRoot;

  const layoutData = useMemo(() => layout(currentRoot), [currentRoot]);

  const activeId =
    mode === "traversal" ? travActive : mode === "avl" ? avlActive : null;
  const visitedSet =
    mode === "traversal" ? new Set(travVisited) : new Set<number>();

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden" role="region" aria-label="Interaktiv visualisering: Trær og BST/AVL">
      {/* Topp-bar med modus-velger */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">Trær — bygg, traverser og balansér</div>
          </div>
          <button
            type="button"
            onClick={
              mode === "bst" ? opResetBst : mode === "avl" ? opResetAvl : resetTraversal
            }
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMode(m.id);
                setLog([]);
                resetTraversal();
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                mode === m.id
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border hover:bg-muted"
              }`}
              title={m.sub}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visualisering */}
      <div className="p-4 min-h-[280px] bg-background">
        <TreeSvg
          layoutData={layoutData}
          activeId={activeId}
          visitedSet={visitedSet}
        />
        {mode === "bst" && (
          <InorderChips keys={inorderKeys(bstRoot)} note="BST-egenskap: inorder gir alltid sortert rekkefølge" />
        )}
        {mode === "traversal" && (
          <TraversalChips
            sequence={traversalSequence(traversalRoot, order).map((n) => n.key)}
            visitedCount={travVisited.length}
            order={order}
          />
        )}
        {mode === "avl" && avlLastType && (
          <div className="mt-3 text-center text-xs">
            <span className="px-2 py-1 rounded bg-brand/10 text-brand font-mono font-semibold">
              {avlLastType}-rotasjon
            </span>
            <span className="ml-2 text-muted-foreground">{rotationHint(avlLastType)}</span>
          </div>
        )}
      </div>

      {/* Operasjons-panel */}
      <div className="px-4 py-3 border-t border-border bg-muted/20">
        {mode === "bst" && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-xs text-muted-foreground" htmlFor="tv-val">
                Verdi
              </label>
              <input
                id="tv-val"
                type="number"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-20 px-2 py-1 rounded border border-border bg-background text-sm font-mono"
              />
              <span className="text-xs text-muted-foreground italic">
                Sett inn eller slett en nøkkel. Duplikater ignoreres.
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <OpBtn onClick={opInsert}>insert(n)</OpBtn>
              <OpBtn onClick={opDelete} variant="danger">delete(n)</OpBtn>
            </div>
          </>
        )}

        {mode === "traversal" && (
          <>
            <div className="text-xs text-muted-foreground italic mb-2">
              Kjør en traversering på det faste 7-nodertreet. Sekvensen bygges opp etter hvert som hver node besøkes.
            </div>
            <div className="flex flex-wrap gap-1.5">
              <OpBtn onClick={() => runTraversal("preorder")} disabled={travRunning}>
                preorder
              </OpBtn>
              <OpBtn onClick={() => runTraversal("inorder")} disabled={travRunning}>
                inorder
              </OpBtn>
              <OpBtn onClick={() => runTraversal("postorder")} disabled={travRunning}>
                postorder
              </OpBtn>
              <OpBtn onClick={() => runTraversal("level")} disabled={travRunning}>
                level-order (BFS)
              </OpBtn>
            </div>
          </>
        )}

        {mode === "avl" && (
          <>
            <div className="text-xs text-muted-foreground italic mb-2">
              Treet er ubalansert (skewed). Klikk «balansér ett steg» for å kjøre én rotasjon om gangen.
            </div>
            <div className="flex flex-wrap gap-1.5">
              <OpBtn onClick={stepAvl}>
                <span className="inline-flex items-center gap-1">
                  <Play className="h-3 w-3" />
                  balansér ett steg
                </span>
              </OpBtn>
            </div>
          </>
        )}
      </div>

      {/* Logg */}
      {log.length > 0 && (
        <div className="px-4 py-3 border-t border-border bg-card" aria-live="polite" aria-atomic="false">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Operasjons-logg (nyeste først)
          </div>
          <ol className="space-y-1 font-mono text-xs">
            {log.map((entry, i) => (
              <li key={`${entry.op}-${i}`} className="flex items-baseline gap-3 text-foreground/90">
                <span className="text-muted-foreground tabular-nums w-6 text-right">{log.length - i}.</span>
                <code className="flex-1">{entry.op}</code>
                {entry.detail !== undefined && (
                  <span className="text-muted-foreground italic">{entry.detail}</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

// =====================================================================
//                          SVG-rendering
// =====================================================================

function TreeSvg({
  layoutData,
  activeId,
  visitedSet,
}: {
  layoutData: { positions: Map<number, Positioned>; depth: number; width: number };
  activeId: number | null;
  visitedSet: Set<number>;
}) {
  const { positions, depth, width } = layoutData;
  // Layout-mål: total bredde basert på antall noder.
  const xStep = 56;
  const yStep = 70;
  const padX = 30;
  const padY = 30;
  const svgWidth = Math.max(360, padX * 2 + Math.max(1, width) * xStep);
  const svgHeight = padY * 2 + (depth + 1) * yStep;

  const positionFor = (id: number) => {
    const p = positions.get(id);
    if (!p) return null;
    return {
      cx: padX + p.x * xStep + xStep / 2,
      cy: padY + p.y * yStep + yStep / 2,
    };
  };

  if (positions.size === 0) {
    return (
      <div className="flex items-center justify-center h-[240px] text-sm text-muted-foreground italic">
        tomt tre
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="mx-auto block"
        role="img"
        aria-label="Trevisualisering"
      >
        {/* Edges først så de havner under noder */}
        {Array.from(positions.values()).map(({ node }) => {
          const p = positionFor(node.id);
          if (!p) return null;
          const childEdges: React.ReactNode[] = [];
          for (const child of [node.left, node.right]) {
            if (!child) continue;
            const cp = positionFor(child.id);
            if (!cp) continue;
            childEdges.push(
              <line
                key={`e-${node.id}-${child.id}`}
                x1={p.cx}
                y1={p.cy}
                x2={cp.cx}
                y2={cp.cy}
                stroke="var(--border)"
                strokeWidth={1.5}
                style={{ transition: "x1 0.35s ease, y1 0.35s ease, x2 0.35s ease, y2 0.35s ease" }}
              />
            );
          }
          return childEdges;
        })}

        {/* Noder */}
        {Array.from(positions.values()).map(({ node }) => {
          const p = positionFor(node.id);
          if (!p) return null;
          const isActive = activeId === node.id;
          const isVisited = visitedSet.has(node.id);
          return (
            <g key={node.id}>
              <circle
                cx={p.cx}
                cy={p.cy}
                r={20}
                fill={
                  isActive
                    ? "var(--brand)"
                    : isVisited
                    ? "color-mix(in oklch, var(--brand) 18%, transparent)"
                    : "var(--card)"
                }
                stroke={
                  isActive || isVisited ? "var(--brand)" : "var(--border)"
                }
                strokeWidth={2}
                style={{
                  transition:
                    "cx 0.35s ease, cy 0.35s ease, fill 0.25s ease, stroke 0.25s ease",
                }}
              />
              <text
                x={p.cx}
                y={p.cy + 4}
                textAnchor="middle"
                fontSize={13}
                fontFamily="ui-monospace, SFMono-Regular, monospace"
                fontWeight={600}
                fill={
                  isActive
                    ? "var(--brand-foreground)"
                    : "var(--foreground)"
                }
                style={{ transition: "x 0.35s ease, y 0.35s ease, fill 0.25s ease" }}
              >
                {node.key}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// =====================================================================
//                          Småkomponenter
// =====================================================================

function OpBtn({
  children,
  onClick,
  variant = "default",
  hint,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={hint}
      disabled={disabled}
      className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        variant === "danger"
          ? "border-destructive/40 text-destructive hover:bg-destructive/10"
          : "border-brand/40 text-brand hover:bg-brand/10"
      }`}
    >
      {children}
    </button>
  );
}

function InorderChips({ keys, note }: { keys: number[]; note: string }) {
  return (
    <div className="mt-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
        Inorder ({note})
      </div>
      <div className="flex flex-wrap gap-1.5">
        {keys.length === 0 ? (
          <span className="text-xs text-muted-foreground italic">tomt</span>
        ) : (
          keys.map((k, i) => (
            <span
              key={`${k}-${i}`}
              className="px-2 py-0.5 rounded border border-border bg-card text-xs font-mono"
            >
              {k}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function TraversalChips({
  sequence,
  visitedCount,
  order,
}: {
  sequence: number[];
  visitedCount: number;
  order: Order;
}) {
  return (
    <div className="mt-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
        Sekvens ({order})
      </div>
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {sequence.length === 0 ? (
          <span className="text-xs text-muted-foreground italic">trykk på en knapp</span>
        ) : (
          sequence.map((k, i) => {
            const shown = i < visitedCount;
            return (
              <span
                key={`${k}-${i}`}
                className={`px-2 py-0.5 rounded border text-xs font-mono transition-opacity duration-200 ${
                  shown
                    ? "border-brand/60 bg-brand/10 text-brand opacity-100"
                    : "border-dashed border-border text-muted-foreground opacity-30"
                }`}
              >
                {k}
              </span>
            );
          })
        )}
      </div>
    </div>
  );
}

function orderHint(o: Order): string {
  switch (o) {
    case "preorder":
      return "rot → venstre → høyre";
    case "inorder":
      return "venstre → rot → høyre (sortert for BST)";
    case "postorder":
      return "venstre → høyre → rot";
    case "level":
      return "BFS, nivå for nivå med kø";
  }
}

function rotationHint(t: RotationStep["type"]): string {
  switch (t) {
    case "LL":
      return "venstre-tunge node, høyre-rotasjon";
    case "RR":
      return "høyre-tunge node, venstre-rotasjon";
    case "LR":
      return "først venstre-rotasjon på venstre barn, så høyre-rotasjon";
    case "RL":
      return "først høyre-rotasjon på høyre barn, så venstre-rotasjon";
  }
}

// =====================================================================
//                          Util: klone tre
// =====================================================================

function cloneTree(n: TreeNode | null): TreeNode | null {
  if (!n) return null;
  return {
    id: n.id,
    key: n.key,
    height: n.height,
    left: cloneTree(n.left),
    right: cloneTree(n.right),
  };
}
