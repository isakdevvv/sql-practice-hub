import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, X, RotateCcw } from "lucide-react";
import type { CrowsFootExercise, CfMin, CfMax } from "@/lib/learn/types";

type SlotKey = "aMin" | "aMax" | "bMin" | "bMax";
type SlotValue = CfMin | CfMax;

const MIN_OPTIONS: { value: CfMin; label: string; hint: string }[] = [
  { value: "|", label: "|", hint: "obligatorisk (min 1)" },
  { value: "O", label: "O", hint: "valgfri (min 0)" },
];
const MAX_OPTIONS: { value: CfMax; label: string; hint: string }[] = [
  { value: "|", label: "|", hint: "én (maks 1)" },
  { value: "<", label: "<", hint: "mange (kråkefot)" },
];

const SLOT_META: Record<
  SlotKey,
  { kind: "min" | "max"; sideLabel: string; question: string }
> = {
  aMin: {
    kind: "min",
    sideLabel: "Innerst v. A",
    question: "Må det finnes minst én A per B?",
  },
  aMax: {
    kind: "max",
    sideLabel: "Ytterst v. A",
    question: "Hvor mange A maks per B?",
  },
  bMin: {
    kind: "min",
    sideLabel: "Innerst v. B",
    question: "Må det finnes minst én B per A?",
  },
  bMax: {
    kind: "max",
    sideLabel: "Ytterst v. B",
    question: "Hvor mange B maks per A?",
  },
};

export function CrowsFoot({ exercise }: { exercise: CrowsFootExercise }) {
  const [placed, setPlaced] = useState<Partial<Record<SlotKey, SlotValue>>>({});
  const [dragVal, setDragVal] = useState<{ value: SlotValue; kind: "min" | "max" } | null>(
    null,
  );
  const [overSlot, setOverSlot] = useState<SlotKey | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setPlaced({});
    setChecked(false);
    setDragVal(null);
    setOverSlot(null);
  }, [exercise.id]);

  const allFilled = (["aMin", "aMax", "bMin", "bMax"] as SlotKey[]).every((k) => placed[k]);
  const correctCount = useMemo(() => {
    const keys: SlotKey[] = ["aMin", "aMax", "bMin", "bMax"];
    return keys.reduce((n, k) => n + (placed[k] === exercise.answer[k] ? 1 : 0), 0);
  }, [placed, exercise.answer]);
  const allCorrect = correctCount === 4;

  function onDrop(slot: SlotKey) {
    if (!dragVal) return;
    if (SLOT_META[slot].kind !== dragVal.kind) {
      setDragVal(null);
      setOverSlot(null);
      return;
    }
    setPlaced((p) => ({ ...p, [slot]: dragVal.value }));
    setDragVal(null);
    setOverSlot(null);
    setChecked(false);
  }

  function clearSlot(slot: SlotKey) {
    setPlaced((p) => {
      const next = { ...p };
      delete next[slot];
      return next;
    });
    setChecked(false);
  }

  function reset() {
    setPlaced({});
    setChecked(false);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm leading-relaxed">
        <strong className="text-foreground">Scenario:</strong> {exercise.scenario}
      </div>

      {/* Diagram */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          {/* Entity A */}
          <div className="flex justify-end">
            <EntityBox name={exercise.entityA} />
          </div>

          {/* Connector + slots */}
          <div className="flex items-center justify-center select-none">
            <Slot
              slotKey="aMin"
              value={placed.aMin}
              expected={exercise.answer.aMin}
              checked={checked}
              over={overSlot === "aMin"}
              dragKind={dragVal?.kind ?? null}
              onDragOver={() => setOverSlot("aMin")}
              onDragLeave={() => setOverSlot((s) => (s === "aMin" ? null : s))}
              onDrop={() => onDrop("aMin")}
              onClear={() => clearSlot("aMin")}
            />
            <Slot
              slotKey="aMax"
              value={placed.aMax}
              expected={exercise.answer.aMax}
              checked={checked}
              over={overSlot === "aMax"}
              dragKind={dragVal?.kind ?? null}
              onDragOver={() => setOverSlot("aMax")}
              onDragLeave={() => setOverSlot((s) => (s === "aMax" ? null : s))}
              onDrop={() => onDrop("aMax")}
              onClear={() => clearSlot("aMax")}
            />
            <div className="h-0.5 w-10 bg-foreground/40" />
            <Slot
              slotKey="bMax"
              value={placed.bMax}
              expected={exercise.answer.bMax}
              checked={checked}
              over={overSlot === "bMax"}
              dragKind={dragVal?.kind ?? null}
              onDragOver={() => setOverSlot("bMax")}
              onDragLeave={() => setOverSlot((s) => (s === "bMax" ? null : s))}
              onDrop={() => onDrop("bMax")}
              onClear={() => clearSlot("bMax")}
              flip
            />
            <Slot
              slotKey="bMin"
              value={placed.bMin}
              expected={exercise.answer.bMin}
              checked={checked}
              over={overSlot === "bMin"}
              dragKind={dragVal?.kind ?? null}
              onDragOver={() => setOverSlot("bMin")}
              onDragLeave={() => setOverSlot((s) => (s === "bMin" ? null : s))}
              onDrop={() => onDrop("bMin")}
              onClear={() => clearSlot("bMin")}
            />
          </div>

          {/* Entity B */}
          <div className="flex justify-start">
            <EntityBox name={exercise.entityB} />
          </div>
        </div>

        {/* Slot legend */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
          <div>
            <strong className="text-foreground">Venstre (nær {exercise.entityA}):</strong>{" "}
            beskriver hvor mange {exercise.entityA} per én {exercise.entityB}.
          </div>
          <div className="text-right">
            <strong className="text-foreground">Høyre (nær {exercise.entityB}):</strong>{" "}
            beskriver hvor mange {exercise.entityB} per én {exercise.entityA}.
          </div>
        </div>
      </div>

      {/* Symbol palette */}
      <div className="grid sm:grid-cols-2 gap-3">
        <Palette
          title="Min-symboler (innerst)"
          subtitle="Brukes på de indre slotene"
          options={MIN_OPTIONS}
          kind="min"
          activeValue={dragVal?.kind === "min" ? dragVal.value : null}
          onPick={(v) => setDragVal({ value: v, kind: "min" })}
        />
        <Palette
          title="Max-symboler (ytterst)"
          subtitle="Brukes på de ytre slotene"
          options={MAX_OPTIONS}
          kind="max"
          activeValue={dragVal?.kind === "max" ? dragVal.value : null}
          onPick={(v) => setDragVal({ value: v, kind: "max" })}
        />
      </div>

      <div className="flex items-center gap-2 justify-between">
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Nullstill
        </Button>
        {checked ? (
          <div
            className={cn(
              "text-sm font-medium",
              allCorrect ? "text-success" : "text-warning",
            )}
          >
            {correctCount} av 4 riktig
          </div>
        ) : (
          <Button onClick={() => setChecked(true)} disabled={!allFilled} size="sm">
            Sjekk svar
          </Button>
        )}
      </div>

      {checked && (
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground space-y-1">
          <div>
            <strong className="text-foreground">Fasit:</strong>{" "}
            <span className="font-mono">
              {exercise.entityA} {exercise.answer.aMin}
              {exercise.answer.aMax}——{exercise.answer.bMax}
              {exercise.answer.bMin} {exercise.entityB}
            </span>
          </div>
          <div>
            <strong className="text-foreground">Forklaring:</strong> {exercise.explanation}
          </div>
        </div>
      )}
    </div>
  );
}

function EntityBox({ name }: { name: string }) {
  return (
    <div className="rounded-md border-2 border-foreground/70 bg-background px-4 py-3 font-mono text-sm font-semibold tracking-wide">
      {name}
    </div>
  );
}

function Slot({
  value,
  expected,
  checked,
  over,
  dragKind,
  onDragOver,
  onDragLeave,
  onDrop,
  onClear,
  slotKey,
  flip = false,
}: {
  slotKey: SlotKey;
  value: SlotValue | undefined;
  expected: SlotValue;
  checked: boolean;
  over: boolean;
  dragKind: "min" | "max" | null;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: () => void;
  onClear: () => void;
  flip?: boolean;
}) {
  const armed = dragKind !== null;
  const correct = checked && value === expected;
  const wrong = checked && value !== undefined && value !== expected;
  const slotKind = SLOT_META[slotKey].kind;
  const compatible = dragKind === null || dragKind === slotKind;
  return (
    <div
      title={SLOT_META[slotKey].question}
      onDragOver={(e) => {
        e.preventDefault();
        if (compatible) onDragOver();
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        if (compatible) onDrop();
      }}
      onClick={() => {
        if (armed && compatible) onDrop();
        else if (value) onClear();
      }}
      className={cn(
        "flex items-center justify-center w-9 h-10 mx-0.5 rounded border-2 border-dashed font-mono text-lg font-bold transition-colors",
        flip && "scale-x-[-1]",
        value ? "bg-card" : "bg-muted/30",
        over && compatible && !checked && "border-brand bg-brand/10",
        !over && !checked && "border-border",
        correct && "!border-success/70 !bg-success/15 text-success",
        wrong && "!border-destructive/70 !bg-destructive/15 text-destructive",
        value && !checked && "cursor-pointer hover:border-warning/60",
      )}
    >
      {value ? (
        <span className="inline-flex items-center gap-0.5">
          {checked &&
            (correct ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />)}
          <span style={flip ? { transform: "scaleX(-1)" } : undefined}>{value}</span>
        </span>
      ) : (
        <span className="text-muted-foreground/60 text-xs">?</span>
      )}
    </div>
  );
}

function Palette<T extends SlotValue>({
  title,
  subtitle,
  options,
  kind,
  activeValue,
  onPick,
}: {
  title: string;
  subtitle: string;
  options: { value: T; label: string; hint: string }[];
  kind: "min" | "max";
  activeValue: T | null;
  onPick: (v: T) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
        {title}
      </div>
      <div className="text-[11px] text-muted-foreground/80 mb-2">{subtitle}</div>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.value}
            draggable
            onDragStart={() => onPick(opt.value)}
            onDragEnd={() => {
              /* slot.onDrop handles cleanup; no-op here */
            }}
            onClick={() => onPick(opt.value)}
            className={cn(
              "rounded-md border bg-background px-3 py-2 cursor-grab active:cursor-grabbing transition-colors flex flex-col items-center min-w-[72px]",
              activeValue === opt.value
                ? "border-brand bg-brand/10"
                : "border-border hover:border-brand/50",
            )}
          >
            <span className="font-mono text-base font-bold">{opt.label}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">{opt.hint}</span>
          </button>
        ))}
      </div>
      <div className="text-[10px] text-muted-foreground/70 mt-2">
        Dra symbolet til riktig slot, eller klikk først på symbolet og deretter på sloten.
      </div>
    </div>
  );
}

// Click-to-pick fallback: clicking a symbol "arms" it in dragVal,
// then clicking a slot drops it. Implemented via the existing dragVal state —
// see CrowsFoot.onDrop for slot click handler.
