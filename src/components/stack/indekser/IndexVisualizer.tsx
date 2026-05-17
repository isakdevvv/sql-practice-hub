import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Play, Search } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv visualisering for B-tree-indekser.
// Tre moduser:
//   1) B-tree search — hardkodet B-tree (order 4) med ~20 nøkler, animér
//      søk fra rot til blad. Marker hvilken child-pointer som følges, og
//      tell antall sammenligninger (O(log n)).
//   2) Full vs index scan — 100 rader, animér Seq Scan vs Index Scan og
//      tell rader-lest for begge.
//   3) Composite index — vis hvorfor (a,b) hjelper WHERE a=? AND b=?, men
//      ikke WHERE b=? — fordi nøklene er sortert leksikografisk på (a,b).
// --------------------------------------------------------------------------

type Mode = "btree" | "scan" | "composite";

type LogEntry = { op: string; detail?: string };

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "btree", label: "B-tree-søk", sub: "traverser fra rot til blad" },
  { id: "scan", label: "Full vs index scan", sub: "tell rader-lest" },
  { id: "composite", label: "Composite-indeks", sub: "(a,b) vs WHERE b=?" },
];

// =====================================================================
//                          B-tree-modell (order 4)
// =====================================================================
// Order 4: hver intern node har inntil 4 barn og inntil 3 nøkler.
// Vi bygger et fast tre med 20 nøkler så studenten ser samme struktur
// hver gang. Lik nøkler i intern nodene fungerer som separatorer; bladene
// inneholder selve "rad-pekerne" (her bare id-en).

type BNode = {
  id: number;
  keys: number[];
  /** Tomt for bladnoder. Lengde = keys.length + 1 ellers. */
  children: BNode[];
  isLeaf: boolean;
};

let __bid = 0;
const nextBid = () => ++__bid;

function leaf(keys: number[]): BNode {
  return { id: nextBid(), keys, children: [], isLeaf: true };
}

function internal(keys: number[], children: BNode[]): BNode {
  return { id: nextBid(), keys, children, isLeaf: false };
}

/**
 * Bygger et fast tre med 20 nøkler:
 *   nøkler = 5, 10, 15, 20, 25, 30, 35, 40, 45, 50,
 *            55, 60, 65, 70, 75, 80, 85, 90, 95, 100
 * Tre nivåer: rot (1 nøkkel) → 2 interne (2 nøkler hver) → 6 blad.
 */
function buildBTree(): BNode {
  __bid = 0;
  // Bladnoder
  const l1 = leaf([5, 10, 15]);
  const l2 = leaf([20, 25, 30]);
  const l3 = leaf([35, 40, 45]);
  const l4 = leaf([50, 55, 60]);
  const l5 = leaf([65, 70, 75]);
  const l6 = leaf([80, 85, 90, 95, 100]); // siste blad litt fyldigere
  // Internnoder
  const i1 = internal([20, 35], [l1, l2, l3]);
  const i2 = internal([65, 80], [l4, l5, l6]);
  // Rot
  return internal([50], [i1, i2]);
}

type StepKind = "compare" | "descend" | "found" | "notfound";
type SearchStep = {
  nodeId: number;
  /** Pekeren som velges i denne noden (indeks i children). Bare relevant for interne noder. */
  childIdx?: number;
  kind: StepKind;
  detail: string;
};

/** Bygg steg for å søke etter en nøkkel fra rot til blad. */
function planSearch(root: BNode, target: number): { steps: SearchStep[]; comparisons: number } {
  const steps: SearchStep[] = [];
  let comparisons = 0;
  let cur: BNode | null = root;
  while (cur) {
    // I hver node: sammenligner mot nøklene én etter én til vi finner riktig peker.
    let i = 0;
    while (i < cur.keys.length && target > cur.keys[i]) {
      comparisons++;
      i++;
    }
    // Likhetssjekk
    if (i < cur.keys.length) comparisons++;
    if (i < cur.keys.length && target === cur.keys[i]) {
      if (cur.isLeaf) {
        steps.push({ nodeId: cur.id, kind: "found", detail: `nøkkel ${target} funnet i blad` });
        return { steps, comparisons };
      }
      // I et B-tree med duplikater kan en intern nøkkel være selve treffet,
      // men her brukes interne nøkler kun som separator → vi går ned høyre.
      steps.push({
        nodeId: cur.id,
        childIdx: i + 1,
        kind: "descend",
        detail: `${target} = ${cur.keys[i]} → følg høyre peker (separator)`,
      });
      cur = cur.children[i + 1] ?? null;
      continue;
    }
    if (cur.isLeaf) {
      steps.push({
        nodeId: cur.id,
        kind: "notfound",
        detail: `nøkkel ${target} finnes ikke i bladet`,
      });
      return { steps, comparisons };
    }
    const leftKey = i === 0 ? "-∞" : String(cur.keys[i - 1]);
    const rightKey = i === cur.keys.length ? "+∞" : String(cur.keys[i]);
    steps.push({
      nodeId: cur.id,
      childIdx: i,
      kind: "descend",
      detail: `${leftKey} < ${target} < ${rightKey} → følg peker #${i + 1}`,
    });
    cur = cur.children[i];
  }
  return { steps, comparisons };
}

/** Flat-list noder i en stabil rekkefølge, inkludert dybde og x-posisjon (in-order). */
type PositionedB = { node: BNode; depth: number; x: number; parent: BNode | null };

function layoutBTree(root: BNode): { list: PositionedB[]; maxDepth: number; width: number } {
  const list: PositionedB[] = [];
  let xCounter = 0;
  let maxDepth = 0;
  const walk = (n: BNode, depth: number, parent: BNode | null) => {
    if (depth > maxDepth) maxDepth = depth;
    if (n.isLeaf) {
      list.push({ node: n, depth, x: xCounter, parent });
      xCounter += 1;
      return;
    }
    // Plasser internnoden over snittet av barna sine x-er.
    const before = xCounter;
    n.children.forEach((c) => walk(c, depth + 1, n));
    const after = xCounter;
    const mid = (before + after - 1) / 2;
    list.push({ node: n, depth, x: mid, parent });
  };
  walk(root, 0, null);
  return { list, maxDepth, width: Math.max(1, xCounter) };
}

// =====================================================================
//                          Scan-modell (100 rader)
// =====================================================================

const SCAN_ROWS = 100;
const SCAN_TARGET = 42;

// =====================================================================
//                          Composite-modell
// =====================================================================
// Indeks på (a, b). Innholdet er sortert leksikografisk: først på a,
// så på b innen samme a. Studenten skal se at WHERE a=? AND b=? gir
// et lite, sammenhengende intervall, mens WHERE b=? sprer treffene
// utover hele indeksen.

type CompKey = { a: number; b: number };

function buildCompositeIndex(): CompKey[] {
  // 5 verdier av a, 4 verdier av b per a → 20 nøkler totalt.
  const out: CompKey[] = [];
  for (let a = 1; a <= 5; a++) {
    for (const b of [10, 20, 30, 40]) {
      out.push({ a, b });
    }
  }
  return out;
}

type CompMode = "ab" | "bonly";

// =====================================================================
//                          HOVEDKOMPONENT
// =====================================================================

export function IndexVisualizer() {
  const [mode, setMode] = useState<Mode>("btree");
  const [log, setLog] = useState<LogEntry[]>([]);

  // B-tree-state
  const [tree] = useState<BNode>(() => buildBTree());
  const [searchInput, setSearchInput] = useState("40");
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const [activeChildIdx, setActiveChildIdx] = useState<number | null>(null);
  const [visitedNodeIds, setVisitedNodeIds] = useState<Set<number>>(new Set());
  const [comparisons, setComparisons] = useState(0);
  const [searchResult, setSearchResult] = useState<"idle" | "found" | "notfound">("idle");
  const [searchRunning, setSearchRunning] = useState(false);
  const searchTimerRef = useRef<number | null>(null);

  // Scan-state
  const [scanKind, setScanKind] = useState<"seq" | "index">("seq");
  const [scanIdx, setScanIdx] = useState(-1);
  const [scanCount, setScanCount] = useState(0);
  const [scanDone, setScanDone] = useState(false);
  const [scanRunning, setScanRunning] = useState(false);
  const [indexHighlight, setIndexHighlight] = useState<number[]>([]); // hvilke rader vi "hopper" til
  const scanTimerRef = useRef<number | null>(null);

  // Composite-state
  const [compKeys] = useState<CompKey[]>(() => buildCompositeIndex());
  const [compMode, setCompMode] = useState<CompMode>("ab");
  const [compA, setCompA] = useState("3");
  const [compB, setCompB] = useState("20");
  const [compHighlights, setCompHighlights] = useState<Set<number>>(new Set());

  useEffect(
    () => () => {
      if (searchTimerRef.current !== null) window.clearTimeout(searchTimerRef.current);
      if (scanTimerRef.current !== null) window.clearTimeout(scanTimerRef.current);
    },
    [],
  );

  const pushLog = (e: LogEntry) => setLog((l) => [e, ...l].slice(0, 6));

  // --------- B-tree-søk ---------
  const runSearch = () => {
    if (searchTimerRef.current !== null) window.clearTimeout(searchTimerRef.current);
    const target = Number.parseInt(searchInput, 10);
    if (!Number.isFinite(target)) return;
    setActiveNodeId(null);
    setActiveChildIdx(null);
    setVisitedNodeIds(new Set());
    setComparisons(0);
    setSearchResult("idle");
    setSearchRunning(true);
    const { steps, comparisons: total } = planSearch(tree, target);
    pushLog({ op: `search(${target})`, detail: `${steps.length} steg, ${total} sammenligninger` });
    const step = (i: number) => {
      if (i >= steps.length) {
        setSearchRunning(false);
        setActiveChildIdx(null);
        return;
      }
      const s = steps[i];
      setActiveNodeId(s.nodeId);
      setVisitedNodeIds((cur) => new Set(cur).add(s.nodeId));
      setActiveChildIdx(s.childIdx ?? null);
      // Progressivt øk telleren etter hvert som vi besøker noder.
      setComparisons((c) => Math.min(total, c + 1 + (s.kind === "found" ? 0 : 0)));
      if (s.kind === "found") setSearchResult("found");
      if (s.kind === "notfound") setSearchResult("notfound");
      searchTimerRef.current = window.setTimeout(() => step(i + 1), 900);
    };
    step(0);
    // Sett endelig sammenligningstall etter hele animasjonen.
    window.setTimeout(() => setComparisons(total), 900 * steps.length + 50);
  };

  const resetSearch = () => {
    if (searchTimerRef.current !== null) window.clearTimeout(searchTimerRef.current);
    setActiveNodeId(null);
    setActiveChildIdx(null);
    setVisitedNodeIds(new Set());
    setComparisons(0);
    setSearchResult("idle");
    setSearchRunning(false);
    setLog([]);
  };

  // --------- Scan ---------
  const runScan = (kind: "seq" | "index") => {
    if (scanTimerRef.current !== null) window.clearTimeout(scanTimerRef.current);
    setScanKind(kind);
    setScanIdx(-1);
    setScanCount(0);
    setScanDone(false);
    setScanRunning(true);
    setIndexHighlight([]);

    if (kind === "seq") {
      pushLog({ op: `seq scan WHERE id=${SCAN_TARGET}`, detail: "leser hver rad, O(n)" });
      const step = (i: number) => {
        if (i > SCAN_TARGET) {
          // Stopper på treffet (PK er unik → vi vet det er bare én).
          setScanDone(true);
          setScanRunning(false);
          return;
        }
        setScanIdx(i);
        setScanCount(i + 1);
        // I praksis ville en seq scan på en non-unik kolonne lest hele tabellen,
        // men WHERE id=42 på PK gir tidlig avbrudd. Vi bruker hele 100 rader
        // for å vise variasjon: lar den fortsette litt etter treffet.
        if (i >= SCAN_ROWS - 1) {
          setScanDone(true);
          setScanRunning(false);
          return;
        }
        scanTimerRef.current = window.setTimeout(() => step(i + 1), 30);
      };
      step(0);
    } else {
      pushLog({ op: `index scan WHERE id=${SCAN_TARGET}`, detail: "B-tree, 3 nivåer → 1 rad" });
      // Marker de "logiske" stegene: rot → intern → blad → rad.
      // Vi animerer 3 "hopps" og ender på rad 42 i tabellen.
      const stops = [0, SCAN_ROWS / 3, (SCAN_ROWS / 3) * 2, SCAN_TARGET];
      let counter = 0;
      const step = (i: number) => {
        if (i >= stops.length) {
          setScanDone(true);
          setScanRunning(false);
          return;
        }
        const idx = Math.floor(stops[i]);
        setScanIdx(idx);
        counter += 1;
        setScanCount(counter);
        setIndexHighlight((cur) => [...cur, idx]);
        scanTimerRef.current = window.setTimeout(() => step(i + 1), 650);
      };
      step(0);
    }
  };

  const resetScan = () => {
    if (scanTimerRef.current !== null) window.clearTimeout(scanTimerRef.current);
    setScanIdx(-1);
    setScanCount(0);
    setScanDone(false);
    setScanRunning(false);
    setIndexHighlight([]);
    setLog([]);
  };

  // --------- Composite ---------
  const runComposite = () => {
    const a = Number.parseInt(compA, 10);
    const b = Number.parseInt(compB, 10);
    const next = new Set<number>();
    if (compMode === "ab") {
      compKeys.forEach((k, i) => {
        if (k.a === a && k.b === b) next.add(i);
      });
      pushLog({
        op: `WHERE a=${a} AND b=${b}`,
        detail: next.size > 0 ? "treffer ett sammenhengende intervall" : "ingen treff",
      });
    } else {
      compKeys.forEach((k, i) => {
        if (k.b === b) next.add(i);
      });
      pushLog({
        op: `WHERE b=${b}`,
        detail: "treff sprer seg — indeks (a,b) hjelper IKKE → full scan",
      });
    }
    setCompHighlights(next);
  };

  const resetComposite = () => {
    setCompHighlights(new Set());
    setLog([]);
  };

  const resetCurrent = () => {
    if (mode === "btree") resetSearch();
    else if (mode === "scan") resetScan();
    else resetComposite();
  };

  // =====================================================================
  //                          RENDER
  // =====================================================================

  return (
    <div
      className="rounded-2xl border border-border bg-card overflow-hidden"
      role="region"
      aria-label="Interaktiv visualisering: Indekser og B-tree"
    >
      {/* Topp-bar */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              Indekser — B-tree-søk, scan-sammenligning og kolonnerekkefølge
            </div>
          </div>
          <button
            type="button"
            onClick={resetCurrent}
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
                resetSearch();
                resetScan();
                resetComposite();
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
        {mode === "btree" && (
          <BTreeView
            root={tree}
            activeNodeId={activeNodeId}
            activeChildIdx={activeChildIdx}
            visitedNodeIds={visitedNodeIds}
            comparisons={comparisons}
            result={searchResult}
            target={Number.parseInt(searchInput, 10)}
          />
        )}
        {mode === "scan" && (
          <ScanView
            kind={scanKind}
            scanIdx={scanIdx}
            scanCount={scanCount}
            done={scanDone}
            highlights={indexHighlight}
          />
        )}
        {mode === "composite" && (
          <CompositeView
            keys={compKeys}
            mode={compMode}
            highlights={compHighlights}
            a={Number.parseInt(compA, 10)}
            b={Number.parseInt(compB, 10)}
          />
        )}
      </div>

      {/* Operasjons-panel */}
      <div className="px-4 py-3 border-t border-border bg-muted/20">
        {mode === "btree" && (
          <>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <label className="text-xs text-muted-foreground" htmlFor="iv-key">
                Søk etter nøkkel
              </label>
              <input
                id="iv-key"
                type="number"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-24 px-2 py-1 rounded border border-border bg-background text-sm font-mono"
              />
              <span className="text-xs text-muted-foreground italic">
                Treet inneholder 5, 10, 15, …, 100. Prøv f.eks. 40 (finnes) eller 42 (ikke).
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <OpBtn onClick={runSearch} disabled={searchRunning}>
                <span className="inline-flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  kjør søk
                </span>
              </OpBtn>
            </div>
          </>
        )}

        {mode === "scan" && (
          <>
            <div className="text-xs text-muted-foreground italic mb-2">
              Samme spørring (<code className="font-mono">WHERE id = {SCAN_TARGET}</code>), to ulike
              planer. Telleren viser hvor mange rader DB-en faktisk leser.
            </div>
            <div className="flex flex-wrap gap-1.5">
              <OpBtn onClick={() => runScan("seq")} disabled={scanRunning}>
                <span className="inline-flex items-center gap-1">
                  <Play className="h-3 w-3" />
                  seq scan
                </span>
              </OpBtn>
              <OpBtn onClick={() => runScan("index")} disabled={scanRunning}>
                <span className="inline-flex items-center gap-1">
                  <Play className="h-3 w-3" />
                  index scan
                </span>
              </OpBtn>
            </div>
          </>
        )}

        {mode === "composite" && (
          <>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setCompMode("ab")}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono border ${
                    compMode === "ab"
                      ? "bg-brand text-brand-foreground border-brand"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  WHERE a=? AND b=?
                </button>
                <button
                  type="button"
                  onClick={() => setCompMode("bonly")}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono border ${
                    compMode === "bonly"
                      ? "bg-brand text-brand-foreground border-brand"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  WHERE b=?
                </button>
              </div>
              <div className="flex items-center gap-2">
                {compMode === "ab" && (
                  <>
                    <label className="text-xs text-muted-foreground" htmlFor="iv-a">
                      a
                    </label>
                    <input
                      id="iv-a"
                      type="number"
                      value={compA}
                      onChange={(e) => setCompA(e.target.value)}
                      className="w-16 px-2 py-1 rounded border border-border bg-background text-sm font-mono"
                    />
                  </>
                )}
                <label className="text-xs text-muted-foreground" htmlFor="iv-b">
                  b
                </label>
                <input
                  id="iv-b"
                  type="number"
                  value={compB}
                  onChange={(e) => setCompB(e.target.value)}
                  className="w-16 px-2 py-1 rounded border border-border bg-background text-sm font-mono"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <OpBtn onClick={runComposite}>
                <span className="inline-flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  finn treff
                </span>
              </OpBtn>
            </div>
          </>
        )}
      </div>

      {/* Logg */}
      {log.length > 0 && (
        <div
          className="px-4 py-3 border-t border-border bg-card"
          aria-live="polite"
          aria-atomic="false"
        >
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Operasjons-logg (nyeste først)
          </div>
          <ol className="space-y-1 font-mono text-xs">
            {log.map((entry, i) => (
              <li key={`${entry.op}-${i}`} className="flex items-baseline gap-3 text-foreground/90">
                <span className="text-muted-foreground tabular-nums w-6 text-right">
                  {log.length - i}.
                </span>
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
//                          B-tree SVG-view
// =====================================================================

function BTreeView({
  root,
  activeNodeId,
  activeChildIdx,
  visitedNodeIds,
  comparisons,
  result,
  target,
}: {
  root: BNode;
  activeNodeId: number | null;
  activeChildIdx: number | null;
  visitedNodeIds: Set<number>;
  comparisons: number;
  result: "idle" | "found" | "notfound";
  target: number;
}) {
  const { list, maxDepth, width } = useMemo(() => layoutBTree(root), [root]);

  // Mål
  const xStep = 80; // breddeplass per blad-kolonne
  const yStep = 110;
  const padX = 30;
  const padY = 30;
  const svgWidth = padX * 2 + width * xStep;
  const svgHeight = padY * 2 + (maxDepth + 1) * yStep;

  // Slå opp node-bokser
  const boxFor = (id: number) => {
    const p = list.find((q) => q.node.id === id);
    if (!p) return null;
    const keyW = 32;
    const nodeW = Math.max(keyW * p.node.keys.length + 12, 60);
    const nodeH = 32;
    const cx = padX + (p.x + 0.5) * xStep;
    const cy = padY + p.depth * yStep + nodeH / 2 + 10;
    return { cx, cy, nodeW, nodeH };
  };

  const renderEdge = (parent: BNode, child: BNode, childIdx: number) => {
    const pb = boxFor(parent.id);
    const cb = boxFor(child.id);
    if (!pb || !cb) return null;
    const isActive = activeNodeId === parent.id && activeChildIdx === childIdx;
    const isVisited = visitedNodeIds.has(parent.id) && visitedNodeIds.has(child.id);
    return (
      <line
        key={`edge-${parent.id}-${child.id}`}
        x1={pb.cx}
        y1={pb.cy + pb.nodeH / 2}
        x2={cb.cx}
        y2={cb.cy - cb.nodeH / 2}
        stroke={
          isActive
            ? "hsl(var(--brand))"
            : isVisited
              ? "hsl(var(--brand) / 0.5)"
              : "hsl(var(--border))"
        }
        strokeWidth={isActive ? 2.5 : 1.5}
        style={{ transition: "stroke 0.25s ease, stroke-width 0.25s ease" }}
      />
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded border border-border bg-card font-mono">
            order 4, 20 nøkler
          </span>
          <span className="text-muted-foreground italic">
            interne noder = separator-nøkler; rad-pekere ligger i bladene
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">sammenligninger:</span>
          <span className="px-2 py-0.5 rounded bg-brand/10 text-brand font-mono font-semibold tabular-nums">
            {comparisons}
          </span>
          <span className="text-muted-foreground hidden sm:inline">≤ ⌈log₄(20)⌉·3 ≈ 6</span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="mx-auto block"
          role="img"
          aria-label="B-tre indeks"
        >
          {/* Kanter først */}
          {list.map(({ node }) =>
            node.isLeaf ? null : node.children.map((c, idx) => renderEdge(node, c, idx)),
          )}

          {/* Noder */}
          {list.map(({ node }) => {
            const box = boxFor(node.id);
            if (!box) return null;
            const isActive = activeNodeId === node.id;
            const isVisited = visitedNodeIds.has(node.id);
            const keyW = 32;
            const startX = box.cx - box.nodeW / 2 + 6;
            return (
              <g key={node.id}>
                <rect
                  x={box.cx - box.nodeW / 2}
                  y={box.cy - box.nodeH / 2}
                  width={box.nodeW}
                  height={box.nodeH}
                  rx={6}
                  fill={
                    isActive
                      ? "hsl(var(--brand))"
                      : isVisited
                        ? "hsl(var(--brand) / 0.12)"
                        : "hsl(var(--card))"
                  }
                  stroke={isActive || isVisited ? "hsl(var(--brand))" : "hsl(var(--border))"}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  style={{ transition: "fill 0.25s ease, stroke 0.25s ease" }}
                />
                {node.keys.map((k, ki) => {
                  const isTarget = result === "found" && node.isLeaf && k === target && isActive;
                  return (
                    <g key={ki}>
                      {ki > 0 && (
                        <line
                          x1={startX + ki * keyW - 3}
                          y1={box.cy - box.nodeH / 2 + 4}
                          x2={startX + ki * keyW - 3}
                          y2={box.cy + box.nodeH / 2 - 4}
                          stroke={
                            isActive ? "hsl(var(--brand-foreground) / 0.5)" : "hsl(var(--border))"
                          }
                          strokeWidth={1}
                        />
                      )}
                      <text
                        x={startX + ki * keyW + keyW / 2 - 3}
                        y={box.cy + 4}
                        textAnchor="middle"
                        fontSize={12}
                        fontFamily="ui-monospace, SFMono-Regular, monospace"
                        fontWeight={isTarget ? 700 : 600}
                        fill={isActive ? "hsl(var(--brand-foreground))" : "hsl(var(--foreground))"}
                        style={{
                          textDecoration: isTarget ? "underline" : undefined,
                        }}
                      >
                        {k}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {result !== "idle" && (
        <div className="mt-3 text-center text-xs">
          {result === "found" ? (
            <span className="px-2 py-1 rounded bg-success/10 text-success font-mono font-semibold">
              ✓ nøkkel {target} funnet
            </span>
          ) : (
            <span className="px-2 py-1 rounded bg-destructive/10 text-destructive font-mono font-semibold">
              ✗ nøkkel {target} ikke i indeksen
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// =====================================================================
//                          Scan-view
// =====================================================================

function ScanView({
  kind,
  scanIdx,
  scanCount,
  done,
  highlights,
}: {
  kind: "seq" | "index";
  scanIdx: number;
  scanCount: number;
  done: boolean;
  highlights: number[];
}) {
  const highlightSet = new Set(highlights);
  return (
    <div>
      <div className="flex items-center justify-between mb-3 text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded font-mono font-semibold ${
              kind === "seq"
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                : "bg-brand/10 text-brand"
            }`}
          >
            {kind === "seq" ? "Seq Scan" : "Index Scan (B-tree, 3 nivåer)"}
          </span>
          <span className="text-muted-foreground italic">
            WHERE id = {SCAN_TARGET} på 100-rads tabell
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">rader lest:</span>
          <span className="px-2 py-0.5 rounded bg-card border border-border font-mono font-semibold tabular-nums">
            {scanCount}
          </span>
          <span className="text-muted-foreground hidden sm:inline">
            {kind === "seq" ? "O(n)" : "O(log n) + 1"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: SCAN_ROWS }, (_, i) => {
          const isCurrent = i === scanIdx;
          const isVisited = kind === "seq" ? i < scanIdx : highlightSet.has(i);
          const isHit = i === SCAN_TARGET && done;
          return (
            <div
              key={i}
              className={`relative h-7 rounded text-[10px] font-mono flex items-center justify-center border transition-colors ${
                isHit
                  ? "bg-success/20 border-success text-success font-bold"
                  : isCurrent
                    ? "bg-brand text-brand-foreground border-brand font-bold"
                    : isVisited
                      ? kind === "seq"
                        ? "bg-amber-500/15 border-amber-500/40"
                        : "bg-brand/15 border-brand/40 text-brand"
                      : "bg-card border-border text-muted-foreground"
              }`}
              title={`id = ${i}`}
            >
              {i}
            </div>
          );
        })}
      </div>

      {done && (
        <div className="mt-3 text-center text-xs">
          <span className="px-2 py-1 rounded bg-success/10 text-success font-mono font-semibold">
            ✓ fant rad id = {SCAN_TARGET} etter {scanCount} {kind === "seq" ? "rader" : "I/O-steg"}
          </span>
        </div>
      )}
    </div>
  );
}

// =====================================================================
//                          Composite-view
// =====================================================================

function CompositeView({
  keys,
  mode,
  highlights,
  a,
  b,
}: {
  keys: CompKey[];
  mode: CompMode;
  highlights: Set<number>;
  a: number;
  b: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3 text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded border border-border bg-card font-mono">
            CREATE INDEX … ON t (a, b)
          </span>
          <span className="text-muted-foreground italic">
            nøkler er sortert leksikografisk på (a, b)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{mode === "ab" ? "predikat:" : "predikat:"}</span>
          <span className="px-2 py-0.5 rounded bg-brand/10 text-brand font-mono font-semibold">
            {mode === "ab" ? `a=${a} AND b=${b}` : `b=${b}`}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {keys.map((k, i) => {
          const hit = highlights.has(i);
          return (
            <span
              key={i}
              className={`px-2 py-1 rounded border text-xs font-mono transition-colors ${
                hit
                  ? "bg-brand text-brand-foreground border-brand font-bold"
                  : "bg-card border-border text-muted-foreground"
              }`}
              title={`(a=${k.a}, b=${k.b})`}
            >
              ({k.a},{k.b})
            </span>
          );
        })}
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs">
        {mode === "ab" ? (
          <div>
            <strong className="text-brand">Bra:</strong> alle (a={a}, …) ligger ved siden av
            hverandre i indeksen, og innen dem er b sortert. DB-en navigerer rett til a={a}, så til
            b={b} — ett sammenhengende intervall, typisk én blad-side.
          </div>
        ) : (
          <div>
            <strong className="text-amber-700 dark:text-amber-400">Hjelper IKKE:</strong> b er bare
            sortert <em>innen</em> samme a. Treff på b={b} sprer seg utover alle a-grupper. DB-en
            kan ikke hoppe — den må skanne hele indeksen (eller dropper den og kjører Seq Scan på
            tabellen).
          </div>
        )}
      </div>
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
