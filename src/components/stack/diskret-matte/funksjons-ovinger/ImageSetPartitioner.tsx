import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, X, RotateCcw, Eye, EyeOff } from "lucide-react";
import { markDragSolved } from "@/lib/learn/dragProgress";

type Mode = "lær" | "prøv";
type Bucket = "image" | "outside" | "pool";

export interface ImageSetPartitionerProps {
  id: string;
  /** Pretty rule, e.g. "f(x) = x²". */
  rule: string;
  /** Definition set A. */
  A: number[];
  /** Full codomain B (the elements the user partitions). */
  B: number[];
  /** Pure function — applied to every a in A to compute the image f(A). */
  fn: (x: number) => number;
  explanation?: string;
}

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function ImageSetPartitioner({ id, rule, A, B, fn, explanation }: ImageSetPartitionerProps) {
  const image = useMemo(() => new Set(A.map(fn)), [A, fn]);
  const correctBucket = useMemo<Record<number, "image" | "outside">>(() => {
    const m: Record<number, "image" | "outside"> = {};
    for (const b of B) m[b] = image.has(b) ? "image" : "outside";
    return m;
  }, [B, image]);

  const [placed, setPlaced] = useState<Record<number, Bucket>>(() => {
    const m: Record<number, Bucket> = {};
    for (const b of B) m[b] = "pool";
    return m;
  });
  const [poolOrder, setPoolOrder] = useState<number[]>(() => shuffle(B));
  const [dragVal, setDragVal] = useState<number | null>(null);
  const [overBucket, setOverBucket] = useState<Bucket | null>(null);
  const [checked, setChecked] = useState(false);
  const [mode, setMode] = useState<Mode>("lær");

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const allPlaced = B.every((b) => placed[b] !== "pool");
  const correctCount = B.filter((b) => placed[b] === correctBucket[b]).length;
  const allCorrect = correctCount === B.length;

  useEffect(() => {
    if (checked && allCorrect && mode === "prøv") {
      markDragSolved(`disk-funk-img-${id}`);
    }
  }, [checked, allCorrect, mode, id]);

  function reset() {
    const m: Record<number, Bucket> = {};
    for (const b of B) m[b] = "pool";
    setPlaced(m);
    setPoolOrder(shuffle(B));
    setChecked(false);
    setDragVal(null);
    setOverBucket(null);
  }

  function onDropOn(bucket: Bucket) {
    if (dragVal === null || mode === "lær") {
      setDragVal(null);
      setOverBucket(null);
      return;
    }
    setPlaced((p) => ({ ...p, [dragVal]: bucket }));
    setChecked(false);
    setDragVal(null);
    setOverBucket(null);
  }

  const isLearn = mode === "lær";

  // What appears in each bucket
  const inPool = isLearn ? [] : poolOrder.filter((b) => placed[b] === "pool");
  const inImage = isLearn
    ? B.filter((b) => correctBucket[b] === "image")
    : B.filter((b) => placed[b] === "image");
  const inOutside = isLearn
    ? B.filter((b) => correctBucket[b] === "outside")
    : B.filter((b) => placed[b] === "outside");

  // SVG layout: A on the left, B on the right
  const colA = { cx: 60, cyTop: 50, gap: 32, label: "A" };
  const colB = { cx: 220, cyTop: 50, gap: 28, label: "B" };
  const Ay = (i: number) => colA.cyTop + i * colA.gap;
  const By = (i: number) => colB.cyTop + i * colB.gap;
  const svgH = Math.max(Ay(A.length - 1), By(B.length - 1)) + 40;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          Hva er i bildet f(A)?
        </div>
        <ModeToggle
          mode={mode}
          setMode={(m) => {
            setMode(m);
            if (m === "prøv") reset();
          }}
        />
      </div>

      <div className="rounded-md border border-border bg-background p-3 font-mono text-sm mb-3">
        <span className="text-brand">{rule}</span>
        <span className="text-muted-foreground ml-2 text-xs">
          A = {"{" + A.join(", ") + "}"} • B = {"{" + B.join(", ") + "}"}
        </span>
      </div>

      <div className="grid sm:grid-cols-[280px_1fr] gap-4">
        <svg viewBox={`0 0 280 ${svgH}`} className="w-full max-h-[260px]">
          <text
            x={colA.cx}
            y={20}
            className="fill-muted-foreground text-[11px]"
            textAnchor="middle"
          >
            A (domene)
          </text>
          <text
            x={colB.cx}
            y={20}
            className="fill-muted-foreground text-[11px]"
            textAnchor="middle"
          >
            B (kodomene)
          </text>
          {A.map((a, i) => (
            <g key={`a-${a}`}>
              <circle
                cx={colA.cx}
                cy={Ay(i)}
                r={13}
                className="fill-brand/30 stroke-brand"
                strokeWidth={1.5}
              />
              <text
                x={colA.cx}
                y={Ay(i) + 4}
                textAnchor="middle"
                className="fill-foreground text-[11px] font-mono"
              >
                {a}
              </text>
            </g>
          ))}
          {B.map((b, i) => {
            const hit = image.has(b);
            return (
              <g key={`b-${b}`}>
                <circle
                  cx={colB.cx}
                  cy={By(i)}
                  r={13}
                  className={
                    hit ? "fill-emerald-500/25 stroke-emerald-500" : "fill-muted/40 stroke-border"
                  }
                  strokeWidth={1.5}
                />
                <text
                  x={colB.cx}
                  y={By(i) + 4}
                  textAnchor="middle"
                  className="fill-foreground text-[11px] font-mono"
                >
                  {b}
                </text>
              </g>
            );
          })}
          {A.map((a, i) => {
            const target = fn(a);
            const bi = B.indexOf(target);
            if (bi < 0) return null;
            return (
              <line
                key={`l-${a}`}
                x1={colA.cx + 13}
                y1={Ay(i)}
                x2={colB.cx - 13}
                y2={By(bi)}
                className="stroke-foreground/60"
                strokeWidth={1.3}
              />
            );
          })}
        </svg>

        <div className="space-y-3">
          {isLearn && (
            <div className="text-[11px] text-muted-foreground italic">
              Lære-modus: grønne sirkler i B er bildet f(A). Bytt til «prøv» for å selv
              partisjonere.
            </div>
          )}

          {!isLearn && (
            <Bucket
              title="Tilgjengelige B-elementer"
              tone="neutral"
              over={overBucket === "pool" && dragVal !== null}
              onDragOver={(e) => {
                e.preventDefault();
                setOverBucket("pool");
              }}
              onDragLeave={() => overBucket === "pool" && setOverBucket(null)}
              onDrop={() => onDropOn("pool")}
            >
              {inPool.length === 0 ? (
                <span className="text-[11px] text-muted-foreground">Tomt — alle plassert.</span>
              ) : (
                inPool.map((b) => (
                  <Chip
                    key={b}
                    value={b}
                    draggable
                    onDragStart={() => setDragVal(b)}
                    onDragEnd={() => setDragVal(null)}
                  />
                ))
              )}
            </Bucket>
          )}

          <Bucket
            title="I bildet f(A) ✓"
            tone="ok"
            over={!isLearn && overBucket === "image" && dragVal !== null}
            onDragOver={(e) => {
              if (isLearn) return;
              e.preventDefault();
              setOverBucket("image");
            }}
            onDragLeave={() => overBucket === "image" && setOverBucket(null)}
            onDrop={() => onDropOn("image")}
          >
            {inImage.length === 0 && (
              <span className="text-[11px] text-muted-foreground">Tomt</span>
            )}
            {inImage.map((b) => {
              const correct = checked && correctBucket[b] === "image";
              const wrong = checked && correctBucket[b] !== "image";
              return (
                <Chip
                  key={b}
                  value={b}
                  draggable={!isLearn}
                  state={correct ? "ok" : wrong ? "wrong" : undefined}
                  onDragStart={() => !isLearn && setDragVal(b)}
                  onDragEnd={() => setDragVal(null)}
                />
              );
            })}
          </Bucket>

          <Bucket
            title="Utenfor bildet ✗"
            tone="warn"
            over={!isLearn && overBucket === "outside" && dragVal !== null}
            onDragOver={(e) => {
              if (isLearn) return;
              e.preventDefault();
              setOverBucket("outside");
            }}
            onDragLeave={() => overBucket === "outside" && setOverBucket(null)}
            onDrop={() => onDropOn("outside")}
          >
            {inOutside.length === 0 && (
              <span className="text-[11px] text-muted-foreground">Tomt</span>
            )}
            {inOutside.map((b) => {
              const correct = checked && correctBucket[b] === "outside";
              const wrong = checked && correctBucket[b] !== "outside";
              return (
                <Chip
                  key={b}
                  value={b}
                  draggable={!isLearn}
                  state={correct ? "ok" : wrong ? "wrong" : undefined}
                  onDragStart={() => !isLearn && setDragVal(b)}
                  onDragEnd={() => setDragVal(null)}
                />
              );
            })}
          </Bucket>
        </div>
      </div>

      {!isLearn && (
        <div className="flex items-center gap-2 justify-between mt-4">
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Nullstill
          </Button>
          {checked ? (
            <div
              className={cn("text-sm font-medium", allCorrect ? "text-success" : "text-warning")}
            >
              {correctCount} av {B.length} riktig
            </div>
          ) : (
            <Button onClick={() => setChecked(true)} size="sm" disabled={!allPlaced}>
              {allPlaced ? "Sjekk svar" : `Plasser alle (${B.length - inPool.length}/${B.length})`}
            </Button>
          )}
        </div>
      )}

      {checked && allCorrect && explanation && !isLearn && (
        <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          <strong className="text-foreground">Forklaring:</strong> {explanation}
        </div>
      )}
    </div>
  );
}

function Bucket({
  title,
  tone,
  over,
  children,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  title: string;
  tone: "ok" | "warn" | "neutral";
  over: boolean;
  children: React.ReactNode;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: () => void;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "rounded-lg border-2 border-dashed p-3 transition-colors min-h-[58px]",
        tone === "ok" && "border-emerald-500/40 bg-emerald-500/5",
        tone === "warn" && "border-rose-500/40 bg-rose-500/5",
        tone === "neutral" && "border-border bg-muted/30",
        over && "border-brand bg-brand/10",
      )}
    >
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  value,
  draggable,
  state,
  onDragStart,
  onDragEnd,
}: {
  value: number;
  draggable?: boolean;
  state?: "ok" | "wrong";
  onDragStart?: () => void;
  onDragEnd?: () => void;
}) {
  return (
    <span
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-xs select-none",
        draggable ? "cursor-grab active:cursor-grabbing" : "cursor-default",
        state === "ok" && "border-success/60 bg-success/10 text-success",
        state === "wrong" && "border-destructive/60 bg-destructive/10 text-destructive",
        !state && "border-border bg-card",
      )}
    >
      {state === "ok" && <Check className="h-3 w-3" />}
      {state === "wrong" && <X className="h-3 w-3" />}
      {value}
    </span>
  );
}

function ModeToggle({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  return (
    <div className="inline-flex rounded-md border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setMode("lær")}
        className={cn(
          "px-2.5 py-1 text-[11px] flex items-center gap-1",
          mode === "lær"
            ? "bg-brand/15 text-foreground"
            : "bg-background text-muted-foreground hover:bg-muted",
        )}
      >
        <Eye className="h-3 w-3" /> Lær
      </button>
      <button
        type="button"
        onClick={() => setMode("prøv")}
        className={cn(
          "px-2.5 py-1 text-[11px] flex items-center gap-1 border-l border-border",
          mode === "prøv"
            ? "bg-brand/15 text-foreground"
            : "bg-background text-muted-foreground hover:bg-muted",
        )}
      >
        <EyeOff className="h-3 w-3" /> Prøv
      </button>
    </div>
  );
}
