import { useEffect, useMemo, useRef, useState } from "react";
import { GitFork, Cpu, Play, RotateCcw, Plus, Info } from "lucide-react";

// ---------------------------------------------------------------------------
// MemoryModelVisualizer — animert minne-layout for fork() vs pthread_create()
//
// Tre moduser:
//   1. fork    — kloner hele adresserommet (COW-merket); ny PID
//   2. thread  — legger en ny stack i samme adresserom; deler heap+kode+data; ny TID
//   3. inspect — klikk en del av minnet og se "delt" vs "privat" per modell
//
// O'Gorman kap. 2.3 (multi-threading) + 2.6 (POSIX threads). Visuell
// forklaring av hvorfor tråder er billigere (ingen address-space-kopi),
// men kommer med risiko (felles heap = race conditions).
// ---------------------------------------------------------------------------

type Mode = "fork" | "thread" | "inspect";

type SegmentId = "text" | "data" | "heap" | "stack" | "fd";

type Segment = {
  id: SegmentId;
  label: string;
  short: string;
  blurb: string;
  // Etter fork: hvert segment kopieres (COW på read, kopi ved write)
  forkBehavior: "cow-shared" | "cow-shared-readonly" | "copied" | "duplicated";
  // Etter pthread_create: heap, kode, data, FDs deles; stack er privat per tråd
  threadBehavior: "shared" | "private" | "shared-readonly";
};

const SEGMENTS: Segment[] = [
  {
    id: "text",
    label: "Kode-segment (.text)",
    short: "code",
    blurb: "Den kompilerte maskinkoden. Read-only. Kjernen mapper samme fysiske sider for begge prosesser etter fork.",
    forkBehavior: "cow-shared-readonly",
    threadBehavior: "shared-readonly",
  },
  {
    id: "data",
    label: "Data (.data + .bss)",
    short: "data",
    blurb: "Globale variabler og statiske variabler. Kan både leses og skrives.",
    forkBehavior: "cow-shared",
    threadBehavior: "shared",
  },
  {
    id: "heap",
    label: "Heap (malloc-arena)",
    short: "heap",
    blurb: "Dynamisk minne fra malloc / new. Vokser oppover. ALL pekere går samme sted innen samme prosess.",
    forkBehavior: "cow-shared",
    threadBehavior: "shared",
  },
  {
    id: "stack",
    label: "Stack (per tråd)",
    short: "stk",
    blurb: "Funksjons-kall-frames og lokale variabler. Vokser nedover. Hver tråd får sin egen stack (typisk 8 MB virtuelt) — ellers ville return-adresser kollidert.",
    forkBehavior: "cow-shared",
    threadBehavior: "private",
  },
  {
    id: "fd",
    label: "Fil-deskriptorer",
    short: "fd",
    blurb: "Tabellen over åpne filer/socketer. Etter fork dupliseres den (samme offsets). Tråder deler samme tabell.",
    forkBehavior: "duplicated",
    threadBehavior: "shared",
  },
];

const BEHAVIOR_STYLE: Record<string, { color: string; label: string }> = {
  "cow-shared": { color: "#f59e0b", label: "COW (kopi ved write)" },
  "cow-shared-readonly": { color: "#94a3b8", label: "Delt (read-only)" },
  "copied": { color: "#ef4444", label: "Kopiert" },
  "duplicated": { color: "#8b5cf6", label: "Duplisert (samme offsets)" },
  "shared": { color: "#10b981", label: "Delt mellom tråder" },
  "shared-readonly": { color: "#94a3b8", label: "Delt (read-only)" },
  "private": { color: "#3b82f6", label: "Privat per tråd" },
};

type ForkState = {
  /** Har vi fork-et? */
  done: boolean;
  /** Animations-progresjon 0–1. */
  t: number;
};

type ThreadState = {
  /** Antall ekstra tråder lagt til. */
  extra: number;
  /** Hvilken som animerer (sist lagt til). */
  animating: boolean;
  t: number;
};

const MODES: { id: Mode; label: string; sub: string; Icon: typeof GitFork }[] = [
  { id: "fork", label: "fork()", sub: "Klon hele prosessen", Icon: GitFork },
  { id: "thread", label: "pthread_create()", sub: "Legg til ny tråd i samme prosess", Icon: Plus },
  { id: "inspect", label: "Inspekter", sub: "Klikk et segment", Icon: Info },
];

export function MemoryModelVisualizer() {
  const [mode, setMode] = useState<Mode>("fork");
  const [fork, setFork] = useState<ForkState>({ done: false, t: 0 });
  const [thread, setThread] = useState<ThreadState>({ extra: 0, animating: false, t: 0 });
  const [selected, setSelected] = useState<SegmentId | null>(null);

  // Reset state når modus bytter
  useEffect(() => {
    setSelected(null);
  }, [mode]);

  // Animasjons-loop for fork
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (mode === "fork" && fork.done && fork.t < 1) {
      const start = performance.now();
      const initial = fork.t;
      const tick = (now: number) => {
        const elapsed = (now - start) / 700; // 700ms total
        const next = Math.min(1, initial + elapsed);
        setFork((f) => ({ ...f, t: next }));
        if (next < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      };
    }
  }, [mode, fork.done, fork.t]);

  // Animasjons-loop for thread
  useEffect(() => {
    if (mode === "thread" && thread.animating && thread.t < 1) {
      const start = performance.now();
      const initial = thread.t;
      const tick = (now: number) => {
        const elapsed = (now - start) / 600;
        const next = Math.min(1, initial + elapsed);
        setThread((s) => ({ ...s, t: next }));
        if (next < 1) rafRef.current = requestAnimationFrame(tick);
        else setThread((s) => ({ ...s, animating: false }));
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      };
    }
  }, [mode, thread.animating, thread.t]);

  function reset() {
    setFork({ done: false, t: 0 });
    setThread({ extra: 0, animating: false, t: 0 });
    setSelected(null);
  }

  function doFork() {
    if (!fork.done) setFork({ done: true, t: 0 });
  }

  function addThread() {
    if (thread.extra >= 3) return;
    setThread({ extra: thread.extra + 1, animating: true, t: 0 });
  }

  const selectedSegment = selected ? SEGMENTS.find((s) => s.id === selected) : null;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden" role="region" aria-label="Animert minne-layout: fork vs pthread_create">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Animert minne-layout
            </div>
            <div className="text-sm font-semibold">
              fork() vs pthread_create() — hva blir kopiert?
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="text-xs px-2 py-1 rounded-md border border-border hover:bg-muted inline-flex items-center gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Nullstill
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {MODES.map((m) => {
            const Icon = m.Icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors inline-flex items-center gap-1.5 ${
                  mode === m.id
                    ? "bg-brand text-brand-foreground border-brand"
                    : "border-border hover:bg-muted"
                }`}
                title={m.sub}
              >
                <Icon className="h-3.5 w-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4">
        {mode === "fork" && (
          <ForkView
            forkState={fork}
            onFork={doFork}
            selected={selected}
            onSelect={setSelected}
          />
        )}
        {mode === "thread" && (
          <ThreadView
            threadState={thread}
            onAdd={addThread}
            selected={selected}
            onSelect={setSelected}
          />
        )}
        {mode === "inspect" && (
          <InspectView selected={selected} onSelect={setSelected} />
        )}

        {selectedSegment && (
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-3 text-sm">
            <div className="font-semibold mb-1">{selectedSegment.label}</div>
            <p className="text-muted-foreground text-xs mb-2">{selectedSegment.blurb}</p>
            <div className="grid sm:grid-cols-2 gap-2 text-xs">
              <div className="rounded border border-border bg-card p-2">
                <div className="uppercase tracking-wider text-[10px] text-muted-foreground mb-1">Etter fork()</div>
                <div className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ background: BEHAVIOR_STYLE[selectedSegment.forkBehavior].color }}
                  />
                  {BEHAVIOR_STYLE[selectedSegment.forkBehavior].label}
                </div>
              </div>
              <div className="rounded border border-border bg-card p-2">
                <div className="uppercase tracking-wider text-[10px] text-muted-foreground mb-1">Etter pthread_create()</div>
                <div className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ background: BEHAVIOR_STYLE[selectedSegment.threadBehavior].color }}
                  />
                  {BEHAVIOR_STYLE[selectedSegment.threadBehavior].label}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
//                              FORK VIEW
// =============================================================================

function ForkView({
  forkState,
  onFork,
  selected,
  onSelect,
}: {
  forkState: ForkState;
  onFork: () => void;
  selected: SegmentId | null;
  onSelect: (id: SegmentId) => void;
}) {
  // SVG layout — én prosess til venstre, en kloning til høyre etter fork
  const W = 560;
  const H = 320;
  const BLOCK_W = 200;
  const BLOCK_H = 260;
  const parentX = 30;
  const blockY = 30;
  const childTargetX = W - BLOCK_W - 30;
  // childX glir fra parentX til childTargetX
  const childX = parentX + (childTargetX - parentX) * forkState.t;
  const childOpacity = forkState.done ? forkState.t : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs text-muted-foreground">
          fork() kopierer hele adresserommet. Linux gjør det lat via{" "}
          <strong>copy-on-write</strong>: sidene markeres read-only og deles, og kopieres først når en av prosessene skriver.
        </div>
        <button
          type="button"
          onClick={onFork}
          disabled={forkState.done}
          className="px-3 py-1.5 rounded-md text-xs font-medium bg-brand text-brand-foreground hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          <GitFork className="h-3.5 w-3.5" />
          {forkState.done ? "fork() utført" : "Kjør fork()"}
        </button>
      </div>

      <div className="rounded-lg border border-border bg-background p-2 overflow-x-auto">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="max-w-full h-auto" role="img" aria-label="Adresserom før og etter fork">
          {/* Parent */}
          <ProcessBlock
            x={parentX}
            y={blockY}
            w={BLOCK_W}
            h={BLOCK_H}
            label="Prosess P1"
            pid="PID 1042"
            selected={selected}
            onSelect={onSelect}
            mode="fork"
            isClone={false}
            cowActive={forkState.done && forkState.t > 0.4}
          />

          {/* Child appearing */}
          {forkState.done && (
            <g style={{ opacity: childOpacity }}>
              <ProcessBlock
                x={childX}
                y={blockY}
                w={BLOCK_W}
                h={BLOCK_H}
                label="Prosess P2 (child)"
                pid="PID 1043"
                selected={selected}
                onSelect={onSelect}
                mode="fork"
                isClone
                cowActive={forkState.done && forkState.t > 0.4}
              />
            </g>
          )}

          {/* Arrow during animation */}
          {forkState.done && forkState.t > 0.05 && forkState.t < 0.95 && (
            <g>
              <line
                x1={parentX + BLOCK_W + 8}
                y1={blockY + BLOCK_H / 2}
                x2={childX - 8}
                y2={blockY + BLOCK_H / 2}
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 3"
              />
              <text
                x={(parentX + BLOCK_W + childX) / 2}
                y={blockY + BLOCK_H / 2 - 8}
                textAnchor="middle"
                fontSize={10}
                fill="#b45309"
                fontWeight={600}
              >
                COW-merker
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="grid sm:grid-cols-3 gap-2 text-xs">
        <Legend swatch="#94a3b8" label=".text delt (read-only)" />
        <Legend swatch="#f59e0b" label="COW: delt til write" />
        <Legend swatch="#8b5cf6" label="FD-tabell duplisert" />
      </div>

      <p className="text-xs text-muted-foreground">
        Etter fork har P2 sin egen PID, men leser samme fysiske sider som P1 til en av dem
        skriver. Da kopierer kjernen siden, oppdaterer page-tabellene, og prosessene divergerer.
        Det er derfor fork er &laquo;billig&raquo; selv for store prosesser — så lenge ingen skriver.
      </p>
    </div>
  );
}

// =============================================================================
//                              THREAD VIEW
// =============================================================================

function ThreadView({
  threadState,
  onAdd,
  selected,
  onSelect,
}: {
  threadState: ThreadState;
  onAdd: () => void;
  selected: SegmentId | null;
  onSelect: (id: SegmentId) => void;
}) {
  const W = 560;
  const H = 340;
  const BLOCK_W = 360;
  const BLOCK_H = 300;
  const blockX = (W - BLOCK_W) / 2;
  const blockY = 20;

  const totalThreads = 1 + threadState.extra;
  // Stack-kolonner inne i blokken (én per tråd)
  const stackBoxes = useMemo(() => {
    const innerPad = 12;
    const stackAreaY = blockY + 175;
    const stackAreaH = 110;
    const colW = (BLOCK_W - innerPad * 2 - (totalThreads - 1) * 8) / totalThreads;
    return Array.from({ length: totalThreads }, (_, i) => ({
      tid: i,
      x: blockX + innerPad + i * (colW + 8),
      y: stackAreaY,
      w: colW,
      h: stackAreaH,
      // Hvis dette er den nye tråden og vi animerer, skaler den inn
      newlyAdded: i === totalThreads - 1 && threadState.animating,
    }));
  }, [totalThreads, blockX, blockY, threadState.animating]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs text-muted-foreground">
          pthread_create() lager <strong>ingen ny prosess</strong> — bare en ny stack inne i samme
          adresserom. Tråden får sin egen TID (thread ID), men deler heap, kode, data og fil-deskriptorer.
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={threadState.extra >= 3}
          className="px-3 py-1.5 rounded-md text-xs font-medium bg-brand text-brand-foreground hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          {threadState.extra >= 3 ? "Maks 4 tråder" : `pthread_create() (#${totalThreads + 1})`}
        </button>
      </div>

      <div className="rounded-lg border border-border bg-background p-2 overflow-x-auto">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="max-w-full h-auto" role="img" aria-label="Adresserom med flere tråder, delt heap og kode">
          {/* Process block */}
          <rect
            x={blockX}
            y={blockY}
            width={BLOCK_W}
            height={BLOCK_H}
            rx={10}
            fill="none"
            stroke="#475569"
            strokeWidth={2}
          />
          <text x={blockX + 10} y={blockY + 16} fontSize={11} fontWeight={700} fill="currentColor">
            Prosess P1 — PID 1042 ({totalThreads} tråd{totalThreads === 1 ? "" : "er"})
          </text>

          {/* Shared segments */}
          <SharedSegmentRow
            x={blockX + 12}
            y={blockY + 28}
            w={BLOCK_W - 24}
            label=".text (kode)"
            color="#cbd5e1"
            stroke="#475569"
            id="text"
            selected={selected}
            onSelect={onSelect}
            tagBg="#f1f5f9"
            tag="delt (RO)"
          />
          <SharedSegmentRow
            x={blockX + 12}
            y={blockY + 60}
            w={BLOCK_W - 24}
            label=".data / .bss"
            color="#fde68a"
            stroke="#a16207"
            id="data"
            selected={selected}
            onSelect={onSelect}
            tagBg="#fef3c7"
            tag="delt"
          />
          <SharedSegmentRow
            x={blockX + 12}
            y={blockY + 92}
            w={BLOCK_W - 24}
            label="Heap (malloc)"
            color="#bbf7d0"
            stroke="#047857"
            id="heap"
            selected={selected}
            onSelect={onSelect}
            tagBg="#dcfce7"
            tag="delt"
          />
          <SharedSegmentRow
            x={blockX + 12}
            y={blockY + 124}
            w={BLOCK_W - 24}
            label="Fil-deskriptorer (fd-tabell)"
            color="#e9d5ff"
            stroke="#7e22ce"
            id="fd"
            selected={selected}
            onSelect={onSelect}
            tagBg="#f3e8ff"
            tag="delt"
          />

          {/* Stack area label */}
          <text x={blockX + 12} y={blockY + 168} fontSize={10} fontWeight={600} fill="currentColor">
            Stacks (privat per tråd):
          </text>

          {/* Stacks */}
          {stackBoxes.map((s) => {
            const scale = s.newlyAdded ? 0.3 + 0.7 * threadState.t : 1;
            const opacity = s.newlyAdded ? threadState.t : 1;
            const isSel = selected === "stack";
            return (
              <g key={s.tid} style={{ transform: `scale(${scale})`, transformOrigin: `${s.x + s.w / 2}px ${s.y + s.h / 2}px`, opacity }}>
                <rect
                  x={s.x}
                  y={s.y}
                  width={s.w}
                  height={s.h}
                  rx={4}
                  fill="#bfdbfe"
                  stroke={isSel ? "#1d4ed8" : "#3b82f6"}
                  strokeWidth={isSel ? 2 : 1}
                  className="cursor-pointer"
                  onClick={() => onSelect("stack")}
                />
                <text
                  x={s.x + s.w / 2}
                  y={s.y + 16}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={600}
                  fill="#1e3a8a"
                >
                  stack
                </text>
                <text
                  x={s.x + s.w / 2}
                  y={s.y + 32}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#1e40af"
                >
                  TID {100 + s.tid}
                </text>
                <text
                  x={s.x + s.w / 2}
                  y={s.y + s.h - 6}
                  textAnchor="middle"
                  fontSize={8}
                  fill="#1e40af"
                >
                  privat
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-xs text-muted-foreground">
        Hver ny tråd koster bare en ny stack (~8 MB virtuelt — fysisk minne allokeres on-demand) +
        en kernel-task-struct. Ingen kopi av page-tabeller, ingen ny prosess-ID. Derfor er
        pthread_create typisk 10–100× raskere enn fork.
      </p>
    </div>
  );
}

// =============================================================================
//                              INSPECT VIEW
// =============================================================================

function InspectView({ selected, onSelect }: { selected: SegmentId | null; onSelect: (id: SegmentId) => void }) {
  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        Klikk hvert segment — se hvordan det oppfører seg under fork (to prosesser) vs.
        pthread_create (to tråder i samme prosess).
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {SEGMENTS.map((seg) => {
          const isSel = selected === seg.id;
          return (
            <button
              key={seg.id}
              type="button"
              onClick={() => onSelect(seg.id)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                isSel ? "border-brand bg-brand/5" : "border-border hover:bg-muted/40"
              }`}
            >
              <div className="text-sm font-semibold">{seg.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">{seg.blurb}</div>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-card"
                  title="Etter fork()"
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: BEHAVIOR_STYLE[seg.forkBehavior].color }} />
                  fork: {BEHAVIOR_STYLE[seg.forkBehavior].label}
                </span>
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-card"
                  title="Etter pthread_create()"
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: BEHAVIOR_STYLE[seg.threadBehavior].color }} />
                  pthread: {BEHAVIOR_STYLE[seg.threadBehavior].label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
//                              SHARED PRIMITIVES
// =============================================================================

function ProcessBlock({
  x,
  y,
  w,
  h,
  label,
  pid,
  selected,
  onSelect,
  mode,
  isClone,
  cowActive,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  pid: string;
  selected: SegmentId | null;
  onSelect: (id: SegmentId) => void;
  mode: Mode;
  isClone: boolean;
  cowActive: boolean;
}) {
  // Segment-rader inni blokken: stack, fd, heap, data, text (top→bunn)
  const innerPad = 10;
  const headerH = 22;
  const rowH = (h - headerH - innerPad * 2) / 5;
  const rows: { seg: Segment; color: string; stroke: string }[] = [
    { seg: SEGMENTS.find((s) => s.id === "text")!, color: "#e2e8f0", stroke: "#475569" },
    { seg: SEGMENTS.find((s) => s.id === "data")!, color: "#fde68a", stroke: "#a16207" },
    { seg: SEGMENTS.find((s) => s.id === "heap")!, color: "#bbf7d0", stroke: "#047857" },
    { seg: SEGMENTS.find((s) => s.id === "stack")!, color: "#bfdbfe", stroke: "#3b82f6" },
    { seg: SEGMENTS.find((s) => s.id === "fd")!, color: "#e9d5ff", stroke: "#7e22ce" },
  ];

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={isClone ? "#fafbfc" : "none"} stroke="#475569" strokeWidth={2} />
      <text x={x + 10} y={y + 15} fontSize={11} fontWeight={700} fill="currentColor">
        {label}
      </text>
      <text x={x + w - 10} y={y + 15} fontSize={10} textAnchor="end" fill="#64748b">
        {pid}
      </text>
      {rows.map((row, i) => {
        const ry = y + headerH + innerPad + i * rowH;
        const behavior = mode === "fork" ? row.seg.forkBehavior : row.seg.threadBehavior;
        const showCowBadge = mode === "fork" && cowActive && (behavior === "cow-shared" || behavior === "cow-shared-readonly");
        const isSel = selected === row.seg.id;
        return (
          <g key={row.seg.id} className="cursor-pointer" onClick={() => onSelect(row.seg.id)}>
            <rect
              x={x + innerPad}
              y={ry}
              width={w - innerPad * 2}
              height={rowH - 4}
              rx={3}
              fill={row.color}
              stroke={isSel ? "#0f172a" : row.stroke}
              strokeWidth={isSel ? 2 : 1}
            />
            <text x={x + innerPad + 6} y={ry + rowH / 2} fontSize={10} fontWeight={600} fill="#0f172a" dominantBaseline="middle">
              {row.seg.label}
            </text>
            {showCowBadge && (
              <g>
                <rect
                  x={x + w - innerPad - 38}
                  y={ry + 4}
                  width={32}
                  height={14}
                  rx={3}
                  fill="#f59e0b"
                />
                <text
                  x={x + w - innerPad - 22}
                  y={ry + 11}
                  fontSize={8}
                  textAnchor="middle"
                  fill="white"
                  fontWeight={700}
                  dominantBaseline="middle"
                >
                  COW
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

function SharedSegmentRow({
  x,
  y,
  w,
  label,
  color,
  stroke,
  id,
  selected,
  onSelect,
  tagBg,
  tag,
}: {
  x: number;
  y: number;
  w: number;
  label: string;
  color: string;
  stroke: string;
  id: SegmentId;
  selected: SegmentId | null;
  onSelect: (id: SegmentId) => void;
  tagBg: string;
  tag: string;
}) {
  const isSel = selected === id;
  return (
    <g className="cursor-pointer" onClick={() => onSelect(id)}>
      <rect
        x={x}
        y={y}
        width={w}
        height={26}
        rx={4}
        fill={color}
        stroke={isSel ? "#0f172a" : stroke}
        strokeWidth={isSel ? 2 : 1}
      />
      <text x={x + 8} y={y + 17} fontSize={11} fontWeight={600} fill="#0f172a">
        {label}
      </text>
      <g>
        <rect x={x + w - 60} y={y + 5} width={52} height={16} rx={3} fill={tagBg} stroke={stroke} strokeWidth={0.5} />
        <text x={x + w - 34} y={y + 16} fontSize={9} textAnchor="middle" fill="#0f172a" fontWeight={600}>
          {tag}
        </text>
      </g>
    </g>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded border border-border bg-card px-2 py-1">
      <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: swatch }} />
      <span className="text-xs">{label}</span>
    </div>
  );
}

// Avoid unused-import warning
void Cpu;
void Play;
