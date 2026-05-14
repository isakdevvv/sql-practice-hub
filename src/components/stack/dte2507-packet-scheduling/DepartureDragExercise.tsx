import { useMemo, useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";

type DisciplineId = "fifo" | "priority" | "rr";

const DISCIPLINES: { id: DisciplineId; label: string; explanation: string }[] = [
  {
    id: "fifo",
    label: "FIFO",
    explanation: "Pakkene sendes i ren ankomst-rekkefølge: 1, 2, 3, 4, 5.",
  },
  {
    id: "priority",
    label: "Priority (klasse 1 prioriteres)",
    explanation:
      "Klasse 1-pakker (1 og 4) hopper foran klasse 2-pakker (2, 3, 5) som var i køen. " +
      "Pakke 4 ankommer t=2 og hopper foran 2 og 3 som ennå venter.",
  },
  {
    id: "rr",
    label: "Round Robin (klasse 1, klasse 2, ...)",
    explanation:
      "Alternerer klasse 1 og 2. Klasse 1: 1,4. Klasse 2: 2,3,5. Output: 1, 2, 4, 3, 5 " +
      "(klasse 2 fortsetter alene når klasse 1 er tom).",
  },
];

// Pakker — samme datasett som SchedulerComparison
type Pkt = { id: number; arrival: number; cls: 1 | 2 };
const PACKETS: Pkt[] = [
  { id: 1, arrival: 0, cls: 1 },
  { id: 2, arrival: 1, cls: 2 },
  { id: 3, arrival: 1, cls: 2 },
  { id: 4, arrival: 2, cls: 1 },
  { id: 5, arrival: 3, cls: 2 },
];

// Riktige svar (departure-rekkefølge i tidssloter t=0..4) for hver disiplin
const ANSWERS: Record<DisciplineId, number[]> = {
  fifo: [1, 2, 3, 4, 5],
  priority: [1, 4, 2, 3, 5], // priority hopper 4 frem
  rr: [1, 2, 4, 3, 5],
};

const SLOTS = 5;

const CLS_COLOR: Record<1 | 2, { fill: string; stroke: string; text: string }> = {
  1: { fill: "#bfdbfe", stroke: "#3b82f6", text: "#1e3a8a" },
  2: { fill: "#fed7aa", stroke: "#f97316", text: "#7c2d12" },
};

export function DepartureDragExercise() {
  const [disciplineId, setDisciplineId] = useState<DisciplineId>("fifo");
  // Per disiplin: hva er plassert i hver slot, og hvilke pakker er fortsatt i palletten
  const [slots, setSlots] = useState<Record<DisciplineId, (number | null)[]>>({
    fifo: Array(SLOTS).fill(null),
    priority: Array(SLOTS).fill(null),
    rr: Array(SLOTS).fill(null),
  });
  const [checked, setChecked] = useState<Record<DisciplineId, boolean>>({
    fifo: false,
    priority: false,
    rr: false,
  });
  const [draggedPkt, setDraggedPkt] = useState<number | null>(null);

  const discipline = DISCIPLINES.find((d) => d.id === disciplineId)!;
  const currentSlots = slots[disciplineId];
  const isChecked = checked[disciplineId];

  const palette = useMemo(
    () => PACKETS.map((p) => p.id).filter((id) => !currentSlots.includes(id)),
    [currentSlots]
  );

  const correctCount = useMemo(
    () => currentSlots.filter((id, i) => id === ANSWERS[disciplineId][i]).length,
    [currentSlots, disciplineId]
  );
  const allCorrect = correctCount === SLOTS;

  function placeInSlot(slotIdx: number, pktId: number) {
    setSlots((s) => {
      const next = { ...s };
      const arr = next[disciplineId].slice();
      // Hvis pakken allerede står et annet sted, fjern den derfra
      const existing = arr.indexOf(pktId);
      if (existing !== -1) arr[existing] = null;
      // Hvis slottet er opptatt, send det tilbake til palett (ved å sette null)
      arr[slotIdx] = pktId;
      next[disciplineId] = arr;
      return next;
    });
    setChecked((c) => ({ ...c, [disciplineId]: false }));
  }

  function clearSlot(slotIdx: number) {
    setSlots((s) => {
      const next = { ...s };
      const arr = next[disciplineId].slice();
      arr[slotIdx] = null;
      next[disciplineId] = arr;
      return next;
    });
    setChecked((c) => ({ ...c, [disciplineId]: false }));
  }

  function reset() {
    setSlots((s) => ({ ...s, [disciplineId]: Array(SLOTS).fill(null) }));
    setChecked((c) => ({ ...c, [disciplineId]: false }));
  }

  function check() {
    setChecked((c) => ({ ...c, [disciplineId]: true }));
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Plot departures — dra pakker til riktig tids­slot
        </div>
        <div className="flex gap-1.5">
          {DISCIPLINES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDisciplineId(d.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                disciplineId === d.id
                  ? "bg-brand text-brand-foreground"
                  : "border border-border bg-card hover:border-brand/40 text-foreground"
              }`}
            >
              {d.label.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 bg-background space-y-5">
        {/* Ankomster */}
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Ankomster (gitt)
          </div>
          <div className="flex gap-2 flex-wrap">
            {PACKETS.map((p) => {
              const c = CLS_COLOR[p.cls];
              return (
                <div key={p.id} className="text-center">
                  <div
                    className="w-12 h-12 rounded-md flex items-center justify-center text-base font-bold font-mono"
                    style={{ background: c.fill, border: `1.5px solid ${c.stroke}`, color: c.text }}
                  >
                    {p.id}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-1">
                    t={p.arrival} · K{p.cls}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Palett: ledige pakker å dra fra */}
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Pakker å plassere ({disciplineId.toUpperCase()})
          </div>
          <div className="flex gap-2 flex-wrap min-h-[56px] rounded-md border border-dashed border-border bg-muted/20 p-2">
            {palette.length === 0 ? (
              <div className="text-xs text-muted-foreground self-center">
                Alle pakker plassert
              </div>
            ) : (
              palette.map((pid) => {
                const p = PACKETS.find((pp) => pp.id === pid)!;
                const c = CLS_COLOR[p.cls];
                return (
                  <div
                    key={pid}
                    draggable
                    onDragStart={() => setDraggedPkt(pid)}
                    onDragEnd={() => setDraggedPkt(null)}
                    className="w-12 h-12 rounded-md flex items-center justify-center text-base font-bold font-mono cursor-grab active:cursor-grabbing select-none"
                    style={{ background: c.fill, border: `1.5px solid ${c.stroke}`, color: c.text }}
                  >
                    {pid}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Slots: departure-tidspunkter */}
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Departure-tidsslot
          </div>
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: SLOTS }).map((_, slotIdx) => {
              const pid = currentSlots[slotIdx];
              const correct = ANSWERS[disciplineId][slotIdx];
              const isCorrect = isChecked && pid === correct;
              const isWrong = isChecked && pid !== null && pid !== correct;
              const isEmpty = pid === null;
              const p = pid !== null ? PACKETS.find((pp) => pp.id === pid)! : null;
              const c = p ? CLS_COLOR[p.cls] : null;
              return (
                <div key={slotIdx} className="text-center">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={() => {
                      if (draggedPkt !== null) {
                        placeInSlot(slotIdx, draggedPkt);
                        setDraggedPkt(null);
                      }
                    }}
                    onClick={() => !isEmpty && clearSlot(slotIdx)}
                    className={`relative w-14 h-14 rounded-md flex items-center justify-center text-base font-bold font-mono cursor-pointer select-none transition-colors ${
                      isEmpty
                        ? "border-2 border-dashed border-border bg-muted/30 hover:border-brand/40"
                        : isCorrect
                          ? "border-2 border-emerald-500"
                          : isWrong
                            ? "border-2 border-rose-500"
                            : "border-2 border-brand/40"
                    }`}
                    style={
                      !isEmpty && c
                        ? { background: c.fill, color: c.text }
                        : undefined
                    }
                    role="button"
                    aria-label={`Slot t=${slotIdx}`}
                  >
                    {pid ?? ""}
                    {isCorrect && (
                      <span className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                    {isWrong && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                        <X className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-1">
                    t={slotIdx}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Dra fra paletten over til en slot. Klikk en utfylt slot for å fjerne pakken.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 justify-between">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card hover:border-brand/40 text-xs font-medium px-3 py-2"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Nullstill {disciplineId.toUpperCase()}
          </button>
          {isChecked ? (
            <div
              className={`text-sm font-medium ${
                allCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {correctCount} av {SLOTS} riktig
            </div>
          ) : (
            <button
              type="button"
              onClick={check}
              disabled={currentSlots.some((s) => s === null)}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand hover:bg-brand/90 disabled:opacity-40 text-brand-foreground text-xs font-medium px-3 py-2"
            >
              Sjekk svar
            </button>
          )}
        </div>

        {isChecked && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">{discipline.label}:</strong> {discipline.explanation}
          </div>
        )}
      </div>
    </div>
  );
}
