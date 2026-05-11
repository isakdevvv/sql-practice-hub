import { useMemo, useRef } from "react";
import type {
  HeapObject,
  ObjId,
  VarRef,
  VisualFrame,
  VisualStep,
} from "@/lib/python/types";
import { cn } from "@/lib/utils";
import { StepVisualizerArrows, type ArrowSpec } from "./StepVisualizerArrows";

interface Props {
  steps: VisualStep[] | null;
  stepIdx: number;
  className?: string;
}

/**
 * Python Tutor–style memory diagram: stack frames (left) + heap (right),
 * with arrows from variable references to heap objects.
 */
export function StepVisualizer({ steps, stepIdx, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<Map<string, HTMLElement>>(new Map());
  const heapRefs = useRef<Map<ObjId, HTMLElement>>(new Map());

  const hasSteps = !!steps && steps.length > 0;
  const safeIdx = hasSteps ? Math.min(stepIdx, steps!.length - 1) : 0;
  const step = hasSteps ? steps![safeIdx] : null;
  const prev = hasSteps && safeIdx > 0 ? steps![safeIdx - 1] : null;

  const arrows: ArrowSpec[] = useMemo(
    () => (step ? collectArrows(step) : []),
    [step],
  );

  if (!step) {
    return (
      <div
        className={cn(
          "text-xs text-muted-foreground italic px-3 py-4 text-center",
          className,
        )}
      >
        Trykk «Visualiser» for å se rammer + heap.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative grid grid-cols-[minmax(180px,1fr)_minmax(220px,1.4fr)] gap-3 p-3",
        className,
      )}
    >
      <div className="flex flex-col gap-2 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Rammer
        </div>
        {step.frames.length === 0 ? (
          <div className="text-xs text-muted-foreground italic">
            Ingen rammer (kode kjørte ikke).
          </div>
        ) : (
          step.frames.map((frame, fIdx) => (
            <FrameBox
              key={fIdx}
              frame={frame}
              frameIdx={fIdx}
              isTop={fIdx === step.frames.length - 1}
              prev={prev?.frames[fIdx] ?? null}
              dotRefs={dotRefs}
              heap={step.heap}
            />
          ))
        )}
        {step.event === "exception" && step.error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 px-2 py-1.5 text-[11px] text-destructive font-mono">
            {step.error}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Heap
        </div>
        {Object.keys(step.heap).length === 0 ? (
          <div className="text-xs text-muted-foreground italic">
            Ingen objekter på heap'en.
          </div>
        ) : (
          Object.values(step.heap).map((obj) => (
            <HeapObjectBox
              key={obj.id}
              obj={obj}
              isNew={!prev || !(obj.id in prev.heap)}
              changed={!!prev && obj.id in prev.heap && !sameHeap(prev.heap[obj.id], obj)}
              dotRefs={dotRefs}
              heapRefs={heapRefs}
            />
          ))
        )}
      </div>

      <StepVisualizerArrows
        containerRef={containerRef}
        dotRefs={dotRefs}
        heapRefs={heapRefs}
        arrows={arrows}
        recomputeKey={stepIdx}
      />
    </div>
  );
}

/* ------------------------------- Frame box ------------------------------- */

function FrameBox({
  frame,
  frameIdx,
  isTop,
  prev,
  dotRefs,
  heap,
}: {
  frame: VisualFrame;
  frameIdx: number;
  isTop: boolean;
  prev: VisualFrame | null;
  dotRefs: React.RefObject<Map<string, HTMLElement>>;
  heap: Record<ObjId, HeapObject>;
}) {
  const varKeys = Object.keys(frame.variables);
  return (
    <div
      className={cn(
        "rounded-md border bg-card text-xs",
        isTop ? "border-brand/60 shadow-sm" : "border-border",
      )}
    >
      <div
        className={cn(
          "px-2 py-1 border-b text-[11px] font-mono flex items-center justify-between",
          isTop ? "border-brand/40 bg-brand/5 text-brand" : "border-border text-muted-foreground",
        )}
      >
        <span>{frame.name === "<module>" ? "Globalt scope" : `${frame.name}()`}</span>
        <span className="text-[10px] opacity-70">linje {frame.line}</span>
      </div>
      {varKeys.length === 0 ? (
        <div className="px-2 py-1 text-[11px] italic text-muted-foreground">
          (ingen variabler)
        </div>
      ) : (
        <div className="px-2 py-1.5 space-y-0.5 font-mono">
          {varKeys.map((name) => {
            const v = frame.variables[name];
            const prevV = prev?.variables[name];
            const isNew = prev != null && !(name in prev.variables);
            const changed =
              prev != null && name in prev.variables && !sameVarRef(prevV!, v);
            return (
              <VarRow
                key={name}
                name={name}
                value={v}
                heap={heap}
                isNew={isNew}
                changed={changed}
                refKey={`frame-${frameIdx}-var-${name}`}
                dotRefs={dotRefs}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function VarRow({
  name,
  value,
  heap,
  isNew,
  changed,
  refKey,
  dotRefs,
}: {
  name: string;
  value: VarRef;
  heap: Record<ObjId, HeapObject>;
  isNew: boolean;
  changed: boolean;
  refKey: string;
  dotRefs: React.RefObject<Map<string, HTMLElement>>;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[auto_1fr] gap-x-2 items-center rounded px-1 py-0.5",
        isNew && "bg-success/10",
        !isNew && changed && "bg-warning/10",
      )}
    >
      <span className="text-brand truncate">{name}</span>
      <span className="text-foreground/90 break-all min-w-0">
        {value.kind === "primitive" ? (
          <PrimitiveLabel value={value.value} />
        ) : (
          <RefDot
            id={value.id}
            heap={heap}
            refKey={refKey}
            dotRefs={dotRefs}
          />
        )}
      </span>
    </div>
  );
}

function PrimitiveLabel({ value }: { value: string | number | boolean | null }) {
  if (value === null) return <span className="text-muted-foreground">None</span>;
  if (typeof value === "boolean")
    return <span className="text-amber-500">{value ? "True" : "False"}</span>;
  if (typeof value === "number")
    return <span className="text-emerald-500">{String(value)}</span>;
  return <span className="text-sky-500">{JSON.stringify(value)}</span>;
}

function RefDot({
  id,
  heap,
  refKey,
  dotRefs,
}: {
  id: ObjId;
  heap: Record<ObjId, HeapObject>;
  refKey: string;
  dotRefs: React.RefObject<Map<string, HTMLElement>>;
}) {
  const obj = heap[id];
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span
        ref={(el) => {
          if (el) dotRefs.current?.set(refKey, el);
          else dotRefs.current?.delete(refKey);
        }}
        data-ref-source={refKey}
        className="inline-block h-2 w-2 rounded-full bg-brand"
      />
      <span className="text-[10px] opacity-80 truncate">
        {obj ? obj.preview : `id=${id}`}
      </span>
    </span>
  );
}

/* ------------------------------ Heap object ------------------------------ */

function HeapObjectBox({
  obj,
  isNew,
  changed,
  dotRefs,
  heapRefs,
}: {
  obj: HeapObject;
  isNew: boolean;
  changed: boolean;
  dotRefs: React.RefObject<Map<string, HTMLElement>>;
  heapRefs: React.RefObject<Map<ObjId, HTMLElement>>;
}) {
  return (
    <div
      ref={(el) => {
        if (el) heapRefs.current?.set(obj.id, el);
        else heapRefs.current?.delete(obj.id);
      }}
      data-heap-id={obj.id}
      data-heap-box
      className={cn(
        "rounded-md border bg-card text-xs font-mono",
        isNew
          ? "border-success/60 bg-success/5"
          : changed
            ? "border-warning/60 bg-warning/5"
            : "border-border",
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>
          {obj.type === "instance"
            ? obj.className
            : obj.type === "opaque"
              ? "opak"
              : obj.type}
        </span>
        <span className="opacity-60">id={obj.id}</span>
      </div>
      <div className="px-2 py-1.5">
        <HeapObjectBody obj={obj} dotRefs={dotRefs} />
      </div>
    </div>
  );
}

function HeapObjectBody({
  obj,
  dotRefs,
}: {
  obj: HeapObject;
  dotRefs: React.RefObject<Map<string, HTMLElement>>;
}) {
  if (obj.type === "list" || obj.type === "tuple" || obj.type === "set") {
    const open = obj.type === "tuple" ? "(" : obj.type === "set" ? "{" : "[";
    const close = obj.type === "tuple" ? ")" : obj.type === "set" ? "}" : "]";
    if (obj.items.length === 0) {
      return (
        <span className="text-muted-foreground">
          {open}
          {close}
        </span>
      );
    }
    return (
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
        <span className="text-muted-foreground">{open}</span>
        {obj.items.map((item, i) => (
          <ItemSpan
            key={i}
            value={item}
            refKey={`heap-${obj.id}-item-${i}`}
            dotRefs={dotRefs}
            trailing={i < obj.items.length - 1 ? "," : null}
          />
        ))}
        {obj.truncated ? (
          <span className="text-muted-foreground">+{obj.truncated} skjult</span>
        ) : null}
        <span className="text-muted-foreground">{close}</span>
      </div>
    );
  }
  if (obj.type === "dict") {
    if (obj.entries.length === 0) {
      return <span className="text-muted-foreground">{"{}"}</span>;
    }
    return (
      <div className="space-y-0.5">
        {obj.entries.map((entry, i) => (
          <div key={i} className="flex flex-wrap items-center gap-x-1">
            <ItemSpan
              value={entry.key}
              refKey={`heap-${obj.id}-key-${i}`}
              dotRefs={dotRefs}
              trailing={null}
            />
            <span className="text-muted-foreground">:</span>
            <ItemSpan
              value={entry.value}
              refKey={`heap-${obj.id}-val-${i}`}
              dotRefs={dotRefs}
              trailing={null}
            />
          </div>
        ))}
        {obj.truncated ? (
          <div className="text-muted-foreground">+{obj.truncated} skjult</div>
        ) : null}
      </div>
    );
  }
  if (obj.type === "instance") {
    const keys = Object.keys(obj.attrs);
    if (keys.length === 0) {
      return <span className="text-muted-foreground italic">(ingen attributter)</span>;
    }
    return (
      <div className="space-y-0.5">
        {keys.map((k) => (
          <div key={k} className="flex flex-wrap items-center gap-x-1">
            <span className="text-brand">{k}</span>
            <span className="text-muted-foreground">=</span>
            <ItemSpan
              value={obj.attrs[k]}
              refKey={`heap-${obj.id}-attr-${k}`}
              dotRefs={dotRefs}
              trailing={null}
            />
          </div>
        ))}
      </div>
    );
  }
  if (obj.type === "function") {
    return (
      <div className="text-muted-foreground">
        <span className="text-brand">{obj.name}</span>
        <span className="opacity-80">{obj.signature || "()"}</span>
      </div>
    );
  }
  if (obj.type === "opaque" || obj.type === "module") {
    return <span className="text-muted-foreground italic">{obj.label}</span>;
  }
  return null;
}

function ItemSpan({
  value,
  refKey,
  dotRefs,
  trailing,
}: {
  value: VarRef;
  refKey: string;
  dotRefs: React.RefObject<Map<string, HTMLElement>>;
  trailing: string | null;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      {value.kind === "primitive" ? (
        <PrimitiveLabel value={value.value} />
      ) : (
        <span
          ref={(el) => {
            if (el) dotRefs.current?.set(refKey, el);
            else dotRefs.current?.delete(refKey);
          }}
          data-ref-source={refKey}
          className="inline-block h-2 w-2 rounded-full bg-brand"
        />
      )}
      {trailing ? <span className="text-muted-foreground">{trailing}</span> : null}
    </span>
  );
}

/* --------------------------------- Helpers -------------------------------- */

function collectArrows(step: VisualStep): ArrowSpec[] {
  const out: ArrowSpec[] = [];
  step.frames.forEach((frame, fIdx) => {
    Object.entries(frame.variables).forEach(([name, v]) => {
      if (v.kind === "ref")
        out.push({ sourceKey: `frame-${fIdx}-var-${name}`, targetId: v.id });
    });
  });
  Object.values(step.heap).forEach((obj) => {
    if (obj.type === "list" || obj.type === "tuple" || obj.type === "set") {
      obj.items.forEach((item, i) => {
        if (item.kind === "ref")
          out.push({ sourceKey: `heap-${obj.id}-item-${i}`, targetId: item.id });
      });
    } else if (obj.type === "dict") {
      obj.entries.forEach((entry, i) => {
        if (entry.key.kind === "ref")
          out.push({ sourceKey: `heap-${obj.id}-key-${i}`, targetId: entry.key.id });
        if (entry.value.kind === "ref")
          out.push({ sourceKey: `heap-${obj.id}-val-${i}`, targetId: entry.value.id });
      });
    } else if (obj.type === "instance") {
      Object.entries(obj.attrs).forEach(([name, v]) => {
        if (v.kind === "ref")
          out.push({ sourceKey: `heap-${obj.id}-attr-${name}`, targetId: v.id });
      });
    }
  });
  return out;
}

function sameVarRef(a: VarRef, b: VarRef): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === "primitive" && b.kind === "primitive") return a.value === b.value;
  if (a.kind === "ref" && b.kind === "ref") return a.id === b.id;
  return false;
}

function sameHeap(a: HeapObject, b: HeapObject): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
