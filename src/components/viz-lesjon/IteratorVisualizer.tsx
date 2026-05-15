import { cn } from "@/lib/utils";
import type {
  FrameVar,
  HeapBlock,
  IterStep,
  LogEntry,
  PrimitiveVal,
} from "@/lib/viz-lesjon/types";

interface Props {
  step: IterStep;
  className?: string;
}

/**
 * Iterator-fokusert visualisering: viser
 *  - iterablen som horisontal rad bokser med en cursor-pil under,
 *  - iteratoren/generatoren som et lite kort med interne attributter,
 *  - en logg for next() → verdi / StopIteration / yield / print,
 *  - lokale variabler i en sidekolonne.
 *
 * Hele poenget er at eleven ser cursoren bevege seg over iterablen
 * mens stegene spilles — det er det "for x in xs" faktisk gjør.
 */
export function IteratorVisualizer({ step, className }: Props) {
  const iterable = step.heap.find((h) => h.kind === "iterable") as
    | Extract<HeapBlock, { kind: "iterable" }>
    | undefined;
  const iterator = step.heap.find(
    (h) => h.kind === "iterator" || h.kind === "generator",
  ) as
    | Extract<HeapBlock, { kind: "iterator" | "generator" }>
    | undefined;
  const showCursor = step.highlight !== "none";

  return (
    <div className={cn("space-y-3", className)}>
      <div className="text-[12px] text-foreground/90 leading-snug min-h-[2.5em]">
        {step.narration}
      </div>

      {iterable && (
        <IterableRow
          iterable={iterable}
          cursor={iterator?.kind === "iterator" ? iterator.cursor : undefined}
          showCursor={showCursor}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <VarsPanel vars={step.vars} />
        {iterator ? (
          <IteratorCard block={iterator} />
        ) : (
          <div className="rounded-md border border-dashed border-border bg-muted/20 p-3 text-[11px] text-muted-foreground italic flex items-center justify-center">
            (ingen iterator opprettet ennå)
          </div>
        )}
      </div>

      <LogPanel log={step.log} />
    </div>
  );
}

/* ----------------------------- iterable + cursor ----------------------------- */

function IterableRow({
  iterable,
  cursor,
  showCursor,
}: {
  iterable: Extract<HeapBlock, { kind: "iterable" }>;
  cursor: number | "done" | undefined;
  showCursor: boolean;
}) {
  const cursorIdx = typeof cursor === "number" ? cursor : -1;
  const done = cursor === "done";
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Iterable — {iterable.label}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">
          id={iterable.refId}
        </span>
      </div>
      <div className="flex items-end gap-1 flex-wrap">
        {iterable.items.map((item, i) => {
          const isCurrent = showCursor && i === cursorIdx;
          const isConsumed = showCursor && (done || i < cursorIdx);
          return (
            <div key={i} className="flex flex-col items-center min-w-[3.5rem]">
              <div
                className={cn(
                  "w-full rounded-md border px-2 py-2 text-center font-mono text-xs transition-all duration-300",
                  isCurrent &&
                    "border-brand bg-brand/15 text-foreground shadow-[0_0_0_2px_var(--color-brand)/30] scale-105",
                  isConsumed &&
                    !isCurrent &&
                    "border-border bg-muted/40 text-muted-foreground line-through opacity-60",
                  !isCurrent &&
                    !isConsumed &&
                    "border-border bg-background text-foreground",
                )}
              >
                <Prim value={item} />
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground font-mono">
                [{i}]
              </div>
              {/* Cursor-pil under nåværende element */}
              <div
                className={cn(
                  "h-3 text-brand transition-opacity duration-200",
                  isCurrent ? "opacity-100" : "opacity-0",
                )}
              >
                ▲
              </div>
            </div>
          );
        })}
        {done && (
          <div className="ml-2 self-center rounded-md border border-warning/50 bg-warning/10 px-2 py-1 text-[11px] font-mono text-warning">
            cursor: done
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- iterator --------------------------------- */

function IteratorCard({
  block,
}: {
  block: Extract<HeapBlock, { kind: "iterator" | "generator" }>;
}) {
  const isGen = block.kind === "generator";
  return (
    <div
      className={cn(
        "rounded-md border bg-card text-xs",
        isGen ? "border-amber-500/40" : "border-brand/40",
      )}
    >
      <div
        className={cn(
          "px-2 py-1 border-b text-[10px] uppercase tracking-wider font-mono flex items-center justify-between",
          isGen
            ? "border-amber-500/30 text-amber-500"
            : "border-brand/30 text-brand",
        )}
      >
        <span>{isGen ? "generator" : "iterator"} — {block.label}</span>
        <span className="opacity-70">id={block.refId}</span>
      </div>
      <div className="px-2 py-1.5 space-y-1 font-mono">
        {block.kind === "iterator" && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">cursor:</span>
            <span className="text-foreground">
              {block.cursor === "done" ? "done" : `→ [${block.cursor}]`}
            </span>
          </div>
        )}
        {block.kind === "generator" && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">pauset på linje:</span>
            <span className="text-foreground">
              {block.pausedAt ?? "—"}
            </span>
          </div>
        )}
        {block.kind === "generator" && block.yielded.length > 0 && (
          <div className="flex items-baseline gap-2">
            <span className="text-muted-foreground">yielded:</span>
            <span className="text-foreground">
              [
              {block.yielded.map((v, i) => (
                <span key={i}>
                  <Prim value={v} />
                  {i < block.yielded.length - 1 ? ", " : ""}
                </span>
              ))}
              ]
            </span>
          </div>
        )}
        {block.attrs && block.attrs.length > 0 && (
          <div className="mt-1 pt-1 border-t border-border space-y-0.5">
            {block.attrs.map((a) => (
              <div key={a.name} className="flex items-center gap-2">
                <span className="text-brand">self.{a.name}</span>
                <span className="text-muted-foreground">=</span>
                <Prim value={a.value} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- vars + log -------------------------------- */

function VarsPanel({ vars }: { vars: FrameVar[] }) {
  return (
    <div className="rounded-md border border-border bg-card text-xs">
      <div className="px-2 py-1 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
        Lokale variabler
      </div>
      <div className="px-2 py-1.5 font-mono space-y-0.5 min-h-[3rem]">
        {vars.length === 0 ? (
          <span className="italic text-muted-foreground">(ingen)</span>
        ) : (
          vars.map((v) => (
            <div key={v.name} className="flex items-center gap-2">
              <span className="text-brand">{v.name}</span>
              <span className="text-muted-foreground">=</span>
              <Prim value={v.value} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function LogPanel({ log }: { log: LogEntry[] }) {
  if (log.length === 0) return null;
  return (
    <div className="rounded-md border border-border bg-card/50 text-xs">
      <div className="px-2 py-1 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
        Logg
      </div>
      <div className="px-2 py-1.5 font-mono space-y-0.5 max-h-32 overflow-auto">
        {log.map((entry, i) => (
          <div
            key={i}
            className={cn(
              "flex items-baseline gap-2",
              entry.kind === "raise" && "text-destructive",
              entry.kind === "return" && "text-emerald-500",
              entry.kind === "call" && "text-brand",
              entry.kind === "print" && "text-sky-500",
            )}
          >
            <span className="text-[10px] opacity-60 uppercase w-12 shrink-0">
              {entry.kind}
            </span>
            <span className="break-all">{entry.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- primitive -------------------------------- */

function Prim({ value }: { value: PrimitiveVal }) {
  if (value.kind === "int")
    return <span className="text-emerald-500">{value.value}</span>;
  if (value.kind === "str")
    return <span className="text-sky-500">{JSON.stringify(value.value)}</span>;
  if (value.kind === "bool")
    return (
      <span className="text-amber-500">{value.value ? "True" : "False"}</span>
    );
  if (value.kind === "none")
    return <span className="text-muted-foreground">None</span>;
  if (value.kind === "ref")
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground">
        <span className="inline-block h-2 w-2 rounded-full bg-brand" />
        <span className="text-[10px] opacity-80">
          {value.label}#{value.refId}
        </span>
      </span>
    );
  return null;
}
