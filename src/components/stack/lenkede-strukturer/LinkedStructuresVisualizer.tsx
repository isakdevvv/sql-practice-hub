import { useMemo, useState } from "react";
import { ArrowDown } from "lucide-react";
import {
  VisualizerShell,
  OpButton,
  OpLog,
  NodeBox,
  useFadeCells,
  type ModeDef,
  type OpLogEntry,
  type FadeCell,
} from "@/components/visualizer-shell";

// --------------------------------------------------------------------------
// Interaktiv visualisering for lenkede strukturer.
// Fem moduser: linked list, stack (LIFO), queue (FIFO), deque, min-heap.
// Bruker shared shell-primitiver (VisualizerShell, OpButton, OpLog,
// NodeBox, useFadeCells).
// --------------------------------------------------------------------------

type Mode = "list" | "stack" | "queue" | "deque" | "heap";

type Cell = FadeCell<number>;

const MODES: ModeDef<Mode>[] = [
  { id: "list", label: "Linked list", sub: "Node→Node→null" },
  { id: "stack", label: "Stack (LIFO)", sub: "push/pop på toppen" },
  { id: "queue", label: "Queue (FIFO)", sub: "bak inn, foran ut" },
  { id: "deque", label: "Deque", sub: "begge ender O(1)" },
  { id: "heap", label: "Min-heap", sub: "minst først" },
];

const INIT: Record<Mode, number[]> = {
  list: [10, 20, 30],
  stack: [1, 2, 3],
  queue: [10, 20, 30],
  deque: [10, 20, 30],
  heap: [5, 1, 4, 2, 3],
};

const MODE_NOTE: Record<Mode, string> = {
  list: "Tail-peker gjør add_last til O(1). Uten den måtte vi traversere hele lista hver gang.",
  stack: "Toppen er alltid siste element (lst[-1]). LIFO = sist inn, først ut.",
  queue: "Bruker deque, ikke list — lst.pop(0) ville vært O(n) fordi alle må flyttes.",
  deque: "Den eneste strukturen der push/pop fra begge ender er O(1). Default-valg i Python.",
  heap: "Array-basert min-heap. Forelder = (i-1)//2. heappop returnerer alltid minst.",
};

export function LinkedStructuresVisualizer() {
  const [mode, setMode] = useState<Mode>("list");
  const { cells, addCell, removeCell, replaceAll, setCells, makeId } = useFadeCells<number>(INIT.list);
  const [input, setInput] = useState<string>("42");
  const [log, setLog] = useState<OpLogEntry[]>([]);

  const switchMode = (m: Mode) => {
    setMode(m);
    replaceAll(INIT[m]);
    setLog([]);
  };

  const resetMode = () => switchMode(mode);

  const pushLog = (entry: OpLogEntry) => setLog((l) => [entry, ...l].slice(0, 6));

  const parsedInput = () => {
    const n = Number.parseInt(input, 10);
    return Number.isFinite(n) ? n : 0;
  };

  // ------------- Operasjoner per modus -------------

  const addFirst = () => {
    const v = parsedInput();
    addCell(v, "start");
    pushLog({ op: `add_first(${v})`, code: `lst.add_first(${v})  # O(1) — head peker på ny node` });
  };
  const addLast = () => {
    const v = parsedInput();
    addCell(v, "end");
    pushLog({ op: `add_last(${v})`, code: `lst.add_last(${v})   # O(1) takket være tail-peker` });
  };

  const opRemoveFirst = () => {
    if (cells.length === 0) {
      pushLog({ op: "remove_first()", code: "lst.remove_first()  # tom liste", result: "None" });
      return;
    }
    const head = cells[0];
    removeCell(head.id);
    pushLog({ op: "remove_first()", code: "lst.remove_first()  # O(1)", result: String(head.value) });
  };

  const opRemoveLast = () => {
    if (cells.length === 0) {
      pushLog({ op: "remove_last()", code: "lst.remove_last()  # tom liste", result: "None" });
      return;
    }
    const tail = cells[cells.length - 1];
    removeCell(tail.id);
    pushLog({
      op: "remove_last()",
      code: "lst.remove_last()  # O(n) i single-linked — må traversere",
      result: String(tail.value),
    });
  };

  const opPush = () => {
    const v = parsedInput();
    addCell(v, "end");
    pushLog({ op: `push(${v})`, code: `stack.append(${v})   # O(1) amortisert` });
  };
  const opPop = () => {
    if (cells.length === 0) {
      pushLog({ op: "pop()", code: "stack.pop()  # tom stack", result: "IndexError" });
      return;
    }
    const top = cells[cells.length - 1];
    removeCell(top.id);
    pushLog({ op: "pop()", code: "stack.pop()", result: String(top.value) });
  };

  const opEnqueue = () => {
    const v = parsedInput();
    addCell(v, "end");
    pushLog({ op: `enqueue(${v})`, code: `q.append(${v})       # O(1) bak i deque` });
  };
  const opDequeue = () => {
    if (cells.length === 0) {
      pushLog({ op: "dequeue()", code: "q.popleft()  # tom kø", result: "IndexError" });
      return;
    }
    const front = cells[0];
    removeCell(front.id);
    pushLog({ op: "dequeue()", code: "q.popleft()  # O(1) foran", result: String(front.value) });
  };

  const opAppendLeft = () => {
    const v = parsedInput();
    addCell(v, "start");
    pushLog({ op: `appendleft(${v})`, code: `dq.appendleft(${v}) # O(1) — foran` });
  };
  const opAppend = () => {
    const v = parsedInput();
    addCell(v, "end");
    pushLog({ op: `append(${v})`, code: `dq.append(${v})     # O(1) — bak` });
  };
  const opPopLeft = () => {
    if (cells.length === 0) return;
    const front = cells[0];
    removeCell(front.id);
    pushLog({ op: "popleft()", code: "dq.popleft()  # O(1)", result: String(front.value) });
  };
  const opDequePop = () => {
    if (cells.length === 0) return;
    const back = cells[cells.length - 1];
    removeCell(back.id);
    pushLog({ op: "pop()", code: "dq.pop()      # O(1)", result: String(back.value) });
  };

  // ----- Heap-operasjoner: bruker array-representasjon, sift up/down -----
  const heapPush = () => {
    const v = parsedInput();
    const arr = cells.map((c) => c.value);
    arr.push(v);
    let i = arr.length - 1;
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (arr[p] > arr[i]) {
        [arr[p], arr[i]] = [arr[i], arr[p]];
        i = p;
      } else break;
    }
    const inserted = arr[i];
    let foundIdx = -1;
    const next: Cell[] = arr.map((val, idx) => {
      if (val === inserted && idx === i && foundIdx === -1) {
        foundIdx = idx;
        return { id: makeId(), value: val, phase: "new" };
      }
      return { id: makeId(), value: val };
    });
    setCells(next);
    window.setTimeout(() => {
      setCells((cur) => cur.map((c) => (c.phase === "new" ? { ...c, phase: undefined } : c)));
    }, 350);
    pushLog({ op: `heappush(${v})`, code: `heapq.heappush(h, ${v})  # O(log n) — sift up` });
  };

  const heapPop = () => {
    if (cells.length === 0) {
      pushLog({ op: "heappop()", code: "heapq.heappop(h)  # tom", result: "IndexError" });
      return;
    }
    const arr = cells.map((c) => c.value);
    const min = arr[0];
    const last = arr.pop()!;
    if (arr.length > 0) {
      arr[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        let smallest = i;
        if (l < arr.length && arr[l] < arr[smallest]) smallest = l;
        if (r < arr.length && arr[r] < arr[smallest]) smallest = r;
        if (smallest !== i) {
          [arr[i], arr[smallest]] = [arr[smallest], arr[i]];
          i = smallest;
        } else break;
      }
    }
    setCells((cur) => cur.map((c, i) => (i === 0 ? { ...c, phase: "leaving" } : c)));
    window.setTimeout(() => {
      const next: Cell[] = arr.map((val) => ({ id: makeId(), value: val }));
      setCells(next);
    }, 320);
    pushLog({ op: "heappop()", code: "heapq.heappop(h)  # O(log n) — returnerer min", result: String(min) });
  };

  return (
    <VisualizerShell<Mode>
      title="Lenkede strukturer — kjør operasjoner live"
      modes={MODES}
      activeMode={mode}
      onModeChange={switchMode}
      onReset={resetMode}
    >
      {/* Visualisering */}
      <div className="p-6 min-h-[260px] flex items-center justify-center bg-background">
        {mode === "list" && <LinkedListView cells={cells} />}
        {mode === "stack" && <StackView cells={cells} />}
        {mode === "queue" && <QueueView cells={cells} frontLabel="front" backLabel="back" />}
        {mode === "deque" && <QueueView cells={cells} frontLabel="venstre" backLabel="høyre" />}
        {mode === "heap" && <HeapView cells={cells} />}
      </div>

      {/* Operasjons-panel */}
      <div className="px-4 py-3 border-t border-border bg-muted/20">
        <div className="flex items-center gap-2 mb-2">
          <label className="text-xs text-muted-foreground" htmlFor="ll-val">
            Verdi
          </label>
          <input
            id="ll-val"
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-20 px-2 py-1 rounded border border-border bg-background text-sm font-mono"
          />
          <span className="text-xs text-muted-foreground italic">{MODE_NOTE[mode]}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {mode === "list" && (
            <>
              <OpButton onClick={addFirst}>add_first(v)</OpButton>
              <OpButton onClick={addLast}>add_last(v)</OpButton>
              <OpButton onClick={opRemoveFirst} variant="danger">
                remove_first()
              </OpButton>
              <OpButton onClick={opRemoveLast} variant="danger" hint="O(n) i single-linked">
                remove_last()
              </OpButton>
            </>
          )}
          {mode === "stack" && (
            <>
              <OpButton onClick={opPush}>push(v)</OpButton>
              <OpButton onClick={opPop} variant="danger">
                pop()
              </OpButton>
            </>
          )}
          {mode === "queue" && (
            <>
              <OpButton onClick={opEnqueue}>enqueue(v)</OpButton>
              <OpButton onClick={opDequeue} variant="danger">
                dequeue()
              </OpButton>
            </>
          )}
          {mode === "deque" && (
            <>
              <OpButton onClick={opAppendLeft}>appendleft(v)</OpButton>
              <OpButton onClick={opAppend}>append(v)</OpButton>
              <OpButton onClick={opPopLeft} variant="danger">
                popleft()
              </OpButton>
              <OpButton onClick={opDequePop} variant="danger">
                pop()
              </OpButton>
            </>
          )}
          {mode === "heap" && (
            <>
              <OpButton onClick={heapPush}>heappush(v)</OpButton>
              <OpButton onClick={heapPop} variant="danger">
                heappop()
              </OpButton>
            </>
          )}
        </div>
      </div>

      <OpLog entries={log} />
    </VisualizerShell>
  );
}

// ============= visningskomponenter =============

function Arrow({ dir = "right" }: { dir?: "right" | "left" }) {
  return (
    <svg
      viewBox="0 0 32 16"
      className="w-8 h-4 text-muted-foreground shrink-0"
      aria-hidden="true"
    >
      {dir === "right" ? (
        <>
          <line x1="0" y1="8" x2="26" y2="8" stroke="currentColor" strokeWidth="1.5" />
          <polyline points="22,3 28,8 22,13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <line x1="6" y1="8" x2="32" y2="8" stroke="currentColor" strokeWidth="1.5" />
          <polyline points="10,3 4,8 10,13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

function NullMarker({ label = "null" }: { label?: string }) {
  return (
    <div className="text-xs font-mono text-muted-foreground italic shrink-0 px-2 py-1 rounded border border-dashed border-border">
      {label}
    </div>
  );
}

function LinkedListView({ cells }: { cells: Cell[] }) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center gap-1 min-w-fit mx-auto pt-6 pb-2 px-2">
        <div className="flex flex-col items-center mr-2 shrink-0">
          <div className="text-[10px] uppercase tracking-wider text-brand font-semibold">head</div>
          <ArrowDown className="h-3 w-3 text-brand" />
        </div>
        {cells.length === 0 ? (
          <NullMarker label="head=None  tail=None" />
        ) : (
          cells.map((c, i) => {
            const highlight = i === 0 ? "head" : i === cells.length - 1 ? "tail" : null;
            return (
              <span key={c.id} className="flex items-center gap-1">
                <NodeBox value={c.value} highlight={highlight} phase={c.phase} />
                <Arrow />
              </span>
            );
          })
        )}
        {cells.length > 0 && <NullMarker />}
      </div>
    </div>
  );
}

function StackView({ cells }: { cells: Cell[] }) {
  return (
    <div className="flex items-end gap-6">
      <div className="flex flex-col-reverse gap-1 items-center">
        {cells.length === 0 && <NullMarker label="tom stack" />}
        {cells.map((c, i) => {
          const highlight = i === cells.length - 1 ? "top" : null;
          return <NodeBox key={c.id} value={c.value} highlight={highlight} phase={c.phase} />;
        })}
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
          bunn
        </div>
      </div>
      <div className="text-xs text-muted-foreground self-end pb-6">
        <div className="font-mono">stack.append(v) → toppen</div>
        <div className="font-mono">stack.pop()    ← toppen</div>
      </div>
    </div>
  );
}

function QueueView({
  cells,
  frontLabel,
  backLabel,
}: {
  cells: Cell[];
  frontLabel: string;
  backLabel: string;
}) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex flex-col items-center gap-2 min-w-fit mx-auto px-2">
        <div className="flex items-center gap-8 text-[10px] uppercase tracking-wider text-brand font-semibold">
          <span>← {frontLabel}</span>
          <span>{backLabel} →</span>
        </div>
        <div className="flex items-center gap-1 pt-2">
          {cells.length === 0 ? (
            <NullMarker label="tom" />
          ) : (
            cells.map((c, i) => {
              const highlight =
                i === 0 ? "front" : i === cells.length - 1 ? "back" : null;
              return (
                <span key={c.id} className="flex items-center gap-1">
                  <NodeBox value={c.value} highlight={highlight} phase={c.phase} />
                  {i < cells.length - 1 && <Arrow />}
                </span>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function HeapView({ cells }: { cells: Cell[] }) {
  const levels = useMemo(() => {
    const out: Cell[][] = [];
    cells.forEach((c, i) => {
      const lvl = Math.floor(Math.log2(i + 1));
      if (!out[lvl]) out[lvl] = [];
      out[lvl].push(c);
    });
    return out;
  }, [cells]);

  if (cells.length === 0) {
    return <NullMarker label="tom heap" />;
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full overflow-x-auto py-2">
      <div className="text-[10px] uppercase tracking-wider text-brand font-semibold">
        rot = min
      </div>
      {levels.map((row, lvl) => (
        <div
          key={lvl}
          className="flex items-center justify-center gap-6"
          style={{ gap: `${Math.max(8, 64 / Math.max(1, lvl))}px` }}
        >
          {row.map((c, i) => {
            const globalIdx = 2 ** lvl - 1 + i;
            const isRoot = globalIdx === 0;
            return (
              <NodeBox
                key={c.id}
                value={c.value}
                highlight={isRoot ? "top" : null}
                phase={c.phase}
              />
            );
          })}
        </div>
      ))}
      <div className="text-[10px] text-muted-foreground font-mono mt-2">
        array: [{cells.map((c) => c.value).join(", ")}]
      </div>
    </div>
  );
}
