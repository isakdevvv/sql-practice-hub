import { useMemo, useRef, useState } from "react";
import { RotateCcw, ArrowDown } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv visualisering for lenkede strukturer.
// Fem moduser: linked list, stack (LIFO), queue (FIFO), deque, min-heap.
// Hver operasjon animerer noden inn/ut, logger Python-ekvivalent og
// markerer head/tail/top/front/back så studenten kjenner igjen mønsteret.
// --------------------------------------------------------------------------

type Mode = "list" | "stack" | "queue" | "deque" | "heap";

type Cell = {
  id: number;
  value: number;
  /** "new" → fade-in. "leaving" → fade-out før den fjernes fra arrayet. */
  phase?: "new" | "leaving";
};

type LogEntry = { op: string; code: string; result?: string };

const MODES: { id: Mode; label: string; sub: string }[] = [
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
  const idRef = useRef(0);
  const makeCell = (value: number): Cell => ({ id: ++idRef.current, value, phase: "new" });
  const initFor = (m: Mode): Cell[] =>
    INIT[m].map((v) => ({ id: ++idRef.current, value: v }));

  const [cells, setCells] = useState<Cell[]>(() => initFor("list"));
  const [input, setInput] = useState<string>("42");
  const [log, setLog] = useState<LogEntry[]>([]);

  const switchMode = (m: Mode) => {
    setMode(m);
    idRef.current = 0;
    setCells(initFor(m));
    setLog([]);
  };

  const resetMode = () => switchMode(mode);

  // Settle "new"-flagget etter at fade-in har spilt av.
  const settleNew = (next: Cell[]) => {
    setCells(next);
    setTimeout(() => {
      setCells((cur) => cur.map((c) => (c.phase === "new" ? { ...c, phase: undefined } : c)));
    }, 350);
  };

  const pushLog = (entry: LogEntry) => setLog((l) => [entry, ...l].slice(0, 6));

  const parsedInput = () => {
    const n = Number.parseInt(input, 10);
    return Number.isFinite(n) ? n : 0;
  };

  // ------------- Operasjoner per modus -------------

  const addFirst = () => {
    const v = parsedInput();
    settleNew([makeCell(v), ...cells]);
    pushLog({ op: `add_first(${v})`, code: `lst.add_first(${v})  # O(1) — head peker på ny node` });
  };
  const addLast = () => {
    const v = parsedInput();
    settleNew([...cells, makeCell(v)]);
    pushLog({ op: `add_last(${v})`, code: `lst.add_last(${v})   # O(1) takket være tail-peker` });
  };

  const opRemoveFirst = () => {
    if (cells.length === 0) {
      pushLog({ op: "remove_first()", code: "lst.remove_first()  # tom liste", result: "None" });
      return;
    }
    const head = cells[0];
    setCells(cells.map((c, i) => (i === 0 ? { ...c, phase: "leaving" } : c)));
    setTimeout(() => {
      setCells((c2) => c2.filter((x) => x.id !== head.id));
    }, 320);
    pushLog({ op: "remove_first()", code: "lst.remove_first()  # O(1)", result: String(head.value) });
  };

  const opRemoveLast = () => {
    if (cells.length === 0) {
      pushLog({ op: "remove_last()", code: "lst.remove_last()  # tom liste", result: "None" });
      return;
    }
    const tail = cells[cells.length - 1];
    setCells(cells.map((c, i) => (i === cells.length - 1 ? { ...c, phase: "leaving" } : c)));
    setTimeout(() => setCells((c2) => c2.filter((x) => x.id !== tail.id)), 320);
    pushLog({
      op: "remove_last()",
      code: "lst.remove_last()  # O(n) i single-linked — må traversere",
      result: String(tail.value),
    });
  };

  const opPush = () => {
    const v = parsedInput();
    // Stack: toppen er HØYRE i array (= lst[-1])
    settleNew([...cells, makeCell(v)]);
    pushLog({ op: `push(${v})`, code: `stack.append(${v})   # O(1) amortisert` });
  };
  const opPop = () => {
    if (cells.length === 0) {
      pushLog({ op: "pop()", code: "stack.pop()  # tom stack", result: "IndexError" });
      return;
    }
    const top = cells[cells.length - 1];
    setCells(cells.map((c, i) => (i === cells.length - 1 ? { ...c, phase: "leaving" } : c)));
    setTimeout(() => setCells((c2) => c2.filter((x) => x.id !== top.id)), 320);
    pushLog({ op: "pop()", code: "stack.pop()", result: String(top.value) });
  };

  const opEnqueue = () => {
    const v = parsedInput();
    settleNew([...cells, makeCell(v)]);
    pushLog({ op: `enqueue(${v})`, code: `q.append(${v})       # O(1) bak i deque` });
  };
  const opDequeue = () => {
    if (cells.length === 0) {
      pushLog({ op: "dequeue()", code: "q.popleft()  # tom kø", result: "IndexError" });
      return;
    }
    const front = cells[0];
    setCells(cells.map((c, i) => (i === 0 ? { ...c, phase: "leaving" } : c)));
    setTimeout(() => setCells((c2) => c2.filter((x) => x.id !== front.id)), 320);
    pushLog({ op: "dequeue()", code: "q.popleft()  # O(1) foran", result: String(front.value) });
  };

  const opAppendLeft = () => {
    const v = parsedInput();
    settleNew([makeCell(v), ...cells]);
    pushLog({ op: `appendleft(${v})`, code: `dq.appendleft(${v}) # O(1) — foran` });
  };
  const opAppend = () => {
    const v = parsedInput();
    settleNew([...cells, makeCell(v)]);
    pushLog({ op: `append(${v})`, code: `dq.append(${v})     # O(1) — bak` });
  };
  const opPopLeft = () => {
    if (cells.length === 0) return;
    const front = cells[0];
    setCells(cells.map((c, i) => (i === 0 ? { ...c, phase: "leaving" } : c)));
    setTimeout(() => setCells((c2) => c2.filter((x) => x.id !== front.id)), 320);
    pushLog({ op: "popleft()", code: "dq.popleft()  # O(1)", result: String(front.value) });
  };
  const opDequePop = () => {
    if (cells.length === 0) return;
    const back = cells[cells.length - 1];
    setCells(cells.map((c, i) => (i === cells.length - 1 ? { ...c, phase: "leaving" } : c)));
    setTimeout(() => setCells((c2) => c2.filter((x) => x.id !== back.id)), 320);
    pushLog({ op: "pop()", code: "dq.pop()      # O(1)", result: String(back.value) });
  };

  // ----- Heap-operasjoner: bruker array-representasjon, sift up/down -----
  const heapPush = () => {
    const v = parsedInput();
    const arr = cells.map((c) => c.value);
    arr.push(v);
    // sift up
    let i = arr.length - 1;
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (arr[p] > arr[i]) {
        [arr[p], arr[i]] = [arr[i], arr[p]];
        i = p;
      } else break;
    }
    // Behold id-er der vi kan (nye verdier får nye id-er for fade-in).
    // Enkel tilnærming: regenerer hele heapen, marker den nye plassen som "new".
    const inserted = arr[i];
    let foundIdx = -1;
    const next: Cell[] = arr.map((val, idx) => {
      if (val === inserted && idx === i && foundIdx === -1) {
        foundIdx = idx;
        return { id: ++idRef.current, value: val, phase: "new" };
      }
      return { id: ++idRef.current, value: val };
    });
    settleNew(next);
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
      // sift down
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
    // Animer ut roten først, så regenerer
    setCells((cur) => cur.map((c, i) => (i === 0 ? { ...c, phase: "leaving" } : c)));
    setTimeout(() => {
      const next: Cell[] = arr.map((val) => ({ id: ++idRef.current, value: val }));
      setCells(next);
    }, 320);
    pushLog({ op: "heappop()", code: "heapq.heappop(h)  # O(log n) — returnerer min", result: String(min) });
  };

  // -------------------- RENDERING --------------------

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Topp-bar med modus-velger */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">Lenkede strukturer — kjør operasjoner live</div>
          </div>
          <button
            type="button"
            onClick={resetMode}
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
              onClick={() => switchMode(m.id)}
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
              <OpBtn onClick={addFirst}>add_first(v)</OpBtn>
              <OpBtn onClick={addLast}>add_last(v)</OpBtn>
              <OpBtn onClick={opRemoveFirst} variant="danger">
                remove_first()
              </OpBtn>
              <OpBtn onClick={opRemoveLast} variant="danger" hint="O(n) i single-linked">
                remove_last()
              </OpBtn>
            </>
          )}
          {mode === "stack" && (
            <>
              <OpBtn onClick={opPush}>push(v)</OpBtn>
              <OpBtn onClick={opPop} variant="danger">
                pop()
              </OpBtn>
            </>
          )}
          {mode === "queue" && (
            <>
              <OpBtn onClick={opEnqueue}>enqueue(v)</OpBtn>
              <OpBtn onClick={opDequeue} variant="danger">
                dequeue()
              </OpBtn>
            </>
          )}
          {mode === "deque" && (
            <>
              <OpBtn onClick={opAppendLeft}>appendleft(v)</OpBtn>
              <OpBtn onClick={opAppend}>append(v)</OpBtn>
              <OpBtn onClick={opPopLeft} variant="danger">
                popleft()
              </OpBtn>
              <OpBtn onClick={opDequePop} variant="danger">
                pop()
              </OpBtn>
            </>
          )}
          {mode === "heap" && (
            <>
              <OpBtn onClick={heapPush}>heappush(v)</OpBtn>
              <OpBtn onClick={heapPop} variant="danger">
                heappop()
              </OpBtn>
            </>
          )}
        </div>
      </div>

      {/* Operasjons-logg */}
      {log.length > 0 && (
        <div className="px-4 py-3 border-t border-border bg-card">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Operasjons-logg (nyeste først)
          </div>
          <ol className="space-y-1 font-mono text-xs">
            {log.map((entry, i) => (
              <li key={`${entry.op}-${i}`} className="flex items-baseline gap-3 text-foreground/90">
                <span className="text-muted-foreground tabular-nums w-6 text-right">{log.length - i}.</span>
                <code className="flex-1">{entry.code}</code>
                {entry.result !== undefined && (
                  <span className="text-success">→ {entry.result}</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

// ============= visningskomponenter =============

function OpBtn({
  children,
  onClick,
  variant = "default",
  hint,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={hint}
      className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium border transition-colors ${
        variant === "danger"
          ? "border-destructive/40 text-destructive hover:bg-destructive/10"
          : "border-brand/40 text-brand hover:bg-brand/10"
      }`}
    >
      {children}
    </button>
  );
}

function NodeBox({
  cell,
  highlight,
}: {
  cell: Cell;
  highlight?: "head" | "tail" | "top" | "front" | "back" | null;
}) {
  return (
    <div
      className={`relative shrink-0 transition-all duration-300 ease-out ${
        cell.phase === "new"
          ? "animate-in fade-in slide-in-from-top-2 duration-300"
          : cell.phase === "leaving"
          ? "opacity-0 translate-y-2 scale-90"
          : "opacity-100"
      }`}
    >
      <div
        className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center font-mono font-semibold text-sm bg-card ${
          highlight
            ? "border-brand text-brand shadow-[0_0_0_3px_var(--brand-tint,rgba(99,102,241,0.15))]"
            : "border-border text-foreground"
        }`}
      >
        {cell.value}
      </div>
      {highlight && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider text-brand font-semibold">
          {highlight}
        </div>
      )}
    </div>
  );
}

// Pilen som tegner pekeren mellom noder. Bruker SVG for et "ekte" linked-list-utseende.
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
                <NodeBox cell={c} highlight={highlight as "head" | "tail" | null} />
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
  // Vertical stack, top = last
  return (
    <div className="flex items-end gap-6">
      <div className="flex flex-col-reverse gap-1 items-center">
        {cells.length === 0 && <NullMarker label="tom stack" />}
        {cells.map((c, i) => {
          const highlight = i === cells.length - 1 ? "top" : null;
          return <NodeBox key={c.id} cell={c} highlight={highlight as "top" | null} />;
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
                  <NodeBox cell={c} highlight={highlight as "front" | "back" | null} />
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

// Tre-visualisering for heap basert på array-indekser.
function HeapView({ cells }: { cells: Cell[] }) {
  // Beregn nivåer: indeks i er på nivå floor(log2(i+1)).
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
                cell={c}
                highlight={isRoot ? "top" : null}
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
