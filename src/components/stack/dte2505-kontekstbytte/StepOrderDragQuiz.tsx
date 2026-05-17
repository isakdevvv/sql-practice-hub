import { useMemo, useState } from "react";
import { Check, RotateCcw, AlertTriangle } from "lucide-react";

// Avsluttende drag-quiz: dra de 10 stegene i kontekstbytte A→B i riktig rekkefølge.
// Vi gjør en enkel reorder-quiz uten ekstra drag-libs (HTML5 native DnD).

type Step = {
  id: string;
  label: string;
  detail: string;
};

// Korrekt rekkefølge (fasit).
const SOLUTION: Step[] = [
  { id: "s1", label: "Save PC til A",       detail: "først — frys hvor A skal resume" },
  { id: "s2", label: "Save SP til A",       detail: "bruker-stack-pekeren" },
  { id: "s3", label: "Save R0–R7 til A",    detail: "generelle registre" },
  { id: "s4", label: "Save PSR til A",      detail: "flagg, modus, IE" },
  { id: "s5", label: "Save MMU-regs til A", detail: "ferdig å eie A's adresseområde" },
  { id: "l1", label: "Load MMU-regs fra B", detail: "B's page-table aktivt først" },
  { id: "l2", label: "Load PSR fra B",      detail: "B's flagg/modus" },
  { id: "l3", label: "Load R0–R7 fra B",    detail: "B's generelle registre" },
  { id: "l4", label: "Load SP fra B",       detail: "stack-pekeren til B" },
  { id: "l5", label: "Load PC fra B",       detail: "sist — neste fetch går til B's kode" },
];

// Et "stokket" startoppsett — alltid samme, så elever ikke kan reload-juke.
const SHUFFLED_IDS = ["l5", "s3", "l1", "s1", "l4", "s5", "l3", "s2", "l2", "s4"];

function shuffle(steps: Step[]): Step[] {
  const map = new Map(steps.map((s) => [s.id, s]));
  return SHUFFLED_IDS.map((id) => map.get(id)!).filter(Boolean);
}

export function StepOrderDragQuiz() {
  const [order, setOrder] = useState<Step[]>(() => shuffle(SOLUTION));
  const [checked, setChecked] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const correctness = useMemo(
    () => order.map((s, i) => s.id === SOLUTION[i].id),
    [order],
  );
  const allCorrect = correctness.every(Boolean);

  function onDragStart(id: string) {
    setDraggingId(id);
    setChecked(false);
  }
  function onDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    setOverId(id);
  }
  function onDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setOverId(null);
      return;
    }
    setOrder((prev) => {
      const fromIdx = prev.findIndex((s) => s.id === draggingId);
      const toIdx = prev.findIndex((s) => s.id === targetId);
      if (fromIdx < 0 || toIdx < 0) return prev;
      const next = prev.slice();
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
    setDraggingId(null);
    setOverId(null);
  }

  function reset() {
    setOrder(shuffle(SOLUTION));
    setChecked(false);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          Drag-quiz: riktig save/restore-rekkefølge
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setChecked(true)}
            className="rounded-md bg-brand text-brand-foreground text-xs font-semibold px-3 py-1.5 hover:opacity-90"
          >
            Sjekk
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-border text-xs font-semibold px-3 py-1.5 hover:bg-muted flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        Dra stegene til de står i riktig rekkefølge for et kontekstbytte fra Tråd A til Tråd B.
        Husk PC-regelen.
      </p>

      <ol className="space-y-1.5">
        {order.map((step, i) => {
          const isCorrect = checked && correctness[i];
          const isWrong = checked && !correctness[i];
          const isOver = overId === step.id && draggingId !== step.id;
          return (
            <li
              key={step.id}
              draggable
              onDragStart={() => onDragStart(step.id)}
              onDragOver={(e) => onDragOver(e, step.id)}
              onDragLeave={() => setOverId((cur) => (cur === step.id ? null : cur))}
              onDrop={() => onDrop(step.id)}
              onDragEnd={() => { setDraggingId(null); setOverId(null); }}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-grab active:cursor-grabbing select-none transition-colors ${
                isCorrect ? "border-emerald-500/60 bg-emerald-500/5"
                : isWrong ? "border-red-500/60 bg-red-500/5"
                : isOver ? "border-brand bg-brand/10"
                : "border-border bg-background hover:bg-muted/50"
              }`}
            >
              <span className="font-mono text-[11px] w-6 text-muted-foreground tabular-nums">
                {i + 1}.
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{step.label}</div>
                <div className="text-[11px] text-muted-foreground">{step.detail}</div>
              </div>
              {isCorrect && <Check className="h-4 w-4 text-emerald-500 shrink-0" />}
              {isWrong && <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />}
              <span className="text-muted-foreground text-xs select-none" aria-hidden>⋮⋮</span>
            </li>
          );
        })}
      </ol>

      {checked && (
        <div className={`mt-3 rounded-md border p-3 text-sm ${allCorrect ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300" : "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-300"}`}>
          {allCorrect ? (
            <span><strong>Riktig!</strong> Du har save (PC først) → load (PC sist). Det er nettopp denne speil-symmetrien som gjør at en interrupt midt i bytte ikke kan ødelegge konsistensen.</span>
          ) : (
            <span><strong>Ikke helt:</strong> sjekk at PC er <em>første</em> save og <em>siste</em> load. MMU og PSR rammes rundt GP-registrene. Prøv igjen.</span>
          )}
        </div>
      )}
    </div>
  );
}
