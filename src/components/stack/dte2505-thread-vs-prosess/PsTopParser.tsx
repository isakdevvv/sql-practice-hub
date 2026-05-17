import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";

// ---------------------------------------------------------------------------
// PsTopParser — drag-til-rett-kategori for utvalgte rader fra `ps -eLf`.
//
// Pedagogisk poeng: vise at en *thread* deler PID med en annen rad,
// men har en annen LWP (light-weight process / TID). En *prosess* har
// en unik PID som ikke deles. Vi viser også PPID for å forklare
// parent/child-relasjoner.
//
// Brukeren trekker (eller klikker) hver rad til riktig spalte:
//   - "Hovedprosess"   (PID == LWP, ikke barn av eksisterende rad)
//   - "Tråd i prosess" (PID matcher en annen rad sin PID, men LWP er annerledes)
//   - "Child-prosess"  (PPID matcher en annen rad sin PID)
// ---------------------------------------------------------------------------

type Cat = "main" | "thread" | "child";

type Row = {
  id: string;
  pid: number;
  ppid: number;
  lwp: number; // TID i Linux
  user: string;
  cmd: string;
  correct: Cat;
  hint: string;
};

const ROWS: Row[] = [
  {
    id: "a",
    pid: 1042,
    ppid: 1,
    lwp: 1042,
    user: "isak",
    cmd: "java -jar app.jar",
    correct: "main",
    hint: "PID == LWP og PPID=1 (init) — dette er hovedtråden i app.jar.",
  },
  {
    id: "b",
    pid: 1042,
    ppid: 1,
    lwp: 1058,
    user: "isak",
    cmd: "java -jar app.jar",
    correct: "thread",
    hint: "Samme PID (1042) som rad A, men annen LWP (1058) — en tråd i JVM.",
  },
  {
    id: "c",
    pid: 1042,
    ppid: 1,
    lwp: 1062,
    user: "isak",
    cmd: "java -jar app.jar",
    correct: "thread",
    hint: "Igjen samme PID, annen LWP — en GC- eller worker-tråd i samme JVM.",
  },
  {
    id: "d",
    pid: 1199,
    ppid: 1042,
    lwp: 1199,
    user: "isak",
    cmd: "/bin/sh -c ./helper.sh",
    correct: "child",
    hint: "PPID=1042 viser at app.jar har fork+exec-et et sh-script. Egen PID.",
  },
  {
    id: "e",
    pid: 2200,
    ppid: 1,
    lwp: 2200,
    user: "isak",
    cmd: "nginx: master process",
    correct: "main",
    hint: "Egen PID, PPID=1 — egen hovedprosess (ikke relatert til JVM-treet).",
  },
  {
    id: "f",
    pid: 2200,
    ppid: 1,
    lwp: 2215,
    user: "isak",
    cmd: "nginx: master process",
    correct: "thread",
    hint: "Samme PID som rad E, annen LWP — en intern arbeider-tråd i master.",
  },
  {
    id: "g",
    pid: 2310,
    ppid: 2200,
    lwp: 2310,
    user: "www-data",
    cmd: "nginx: worker process",
    correct: "child",
    hint: "PPID=2200 (nginx master) — typisk worker-prosess som fork-et fra master.",
  },
];

const CATEGORIES: { id: Cat; label: string; sub: string; color: string }[] = [
  { id: "main", label: "Hovedprosess", sub: "PID = LWP, ikke barn av annen rad", color: "#3b82f6" },
  { id: "thread", label: "Tråd i prosess", sub: "Samme PID som en annen rad, annen LWP", color: "#10b981" },
  { id: "child", label: "Child-prosess", sub: "PPID matcher en annen rad sin PID", color: "#f59e0b" },
];

type Placements = Partial<Record<string, Cat>>;

export function PsTopParser() {
  const [placements, setPlacements] = useState<Placements>({});
  const [revealed, setRevealed] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const unplaced = useMemo(() => ROWS.filter((r) => !placements[r.id]), [placements]);
  const placed = useMemo(() => (cat: Cat) => ROWS.filter((r) => placements[r.id] === cat), [placements]);
  const allPlaced = unplaced.length === 0;
  const correctCount = useMemo(() => ROWS.filter((r) => placements[r.id] === r.correct).length, [placements]);

  function reset() {
    setPlacements({});
    setRevealed(false);
  }

  function place(id: string, cat: Cat) {
    setPlacements((p) => ({ ...p, [id]: cat }));
  }

  function unplace(id: string) {
    setPlacements((p) => {
      const np = { ...p };
      delete np[id];
      return np;
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden" role="region" aria-label="Drag-til-kategori: ps -eLf">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Avsluttende øving</div>
        <div className="text-sm font-semibold">Parse <code className="font-mono">ps -eLf</code> — dra hver rad til riktig kategori</div>
      </div>

      <div className="p-4 space-y-3">
        <div className="text-xs text-muted-foreground">
          Hver rad har <code className="font-mono">PID</code>, <code className="font-mono">PPID</code> (parent),{" "}
          <code className="font-mono">LWP</code> (light-weight process = Linux-navn for TID), bruker og kommando.
          Bruk reglene over kategoriene for å plassere alle 7. Klikk en plassert rad for å sende den tilbake.
        </div>

        {/* Unplaced pool */}
        <div className="rounded-lg border border-border bg-background p-2">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">Ikke plassert ({unplaced.length})</div>
          <div className="grid sm:grid-cols-2 gap-1.5">
            {unplaced.length === 0 ? (
              <div className="text-xs italic text-muted-foreground col-span-2">Alle radene er plassert.</div>
            ) : (
              unplaced.map((r) => (
                <PsRow key={r.id} row={r} draggable onDragStart={() => setDraggedId(r.id)} onDragEnd={() => setDraggedId(null)} onClick={() => {}} />
              ))
            )}
          </div>
        </div>

        {/* Drop targets */}
        <div className="grid sm:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => (
            <DropZone
              key={cat.id}
              cat={cat}
              rows={placed(cat.id)}
              revealed={revealed}
              onDrop={(id) => place(id, cat.id)}
              onRowClick={unplace}
              isDragging={draggedId !== null}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="text-xs text-muted-foreground">
            {allPlaced ? (
              revealed ? (
                <span className={correctCount === ROWS.length ? "text-emerald-700 dark:text-emerald-400 font-semibold" : "text-amber-700 dark:text-amber-400 font-semibold"}>
                  Score: {correctCount} / {ROWS.length}
                </span>
              ) : (
                <span className="text-foreground">Alle plassert — klikk «Sjekk» for å se fasit.</span>
              )
            ) : (
              <span>Plasser alle {ROWS.length} radene.</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRevealed(true)}
              disabled={!allPlaced}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-brand text-brand-foreground hover:opacity-90 disabled:opacity-40"
            >
              Sjekk svar
            </button>
            <button
              type="button"
              onClick={reset}
              className="text-xs px-2 py-1 rounded-md border border-border hover:bg-muted inline-flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Nullstill
            </button>
          </div>
        </div>

        {revealed && (
          <div className="rounded-lg border border-border bg-background p-3 space-y-1.5">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Forklaring per rad</div>
            {ROWS.map((r) => {
              const placedCat = placements[r.id];
              const correct = placedCat === r.correct;
              return (
                <div key={r.id} className="flex items-start gap-2 text-xs">
                  {correct ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-rose-600 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      PID {r.pid} LWP {r.lwp} — {r.cmd}
                    </span>
                    <div className="text-muted-foreground">{r.hint}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function PsRow({
  row,
  draggable,
  onClick,
  onDragStart,
  onDragEnd,
  highlight,
}: {
  row: Row;
  draggable: boolean;
  onClick: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  highlight?: "ok" | "err" | null;
}) {
  return (
    <div
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", row.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.();
      }}
      onDragEnd={() => onDragEnd?.()}
      onClick={onClick}
      className={`text-[11px] font-mono rounded border px-2 py-1.5 select-none ${
        draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
      } ${
        highlight === "ok"
          ? "border-emerald-500 bg-emerald-500/10"
          : highlight === "err"
          ? "border-rose-500 bg-rose-500/10"
          : "border-border bg-card hover:border-brand/40"
      }`}
      title={`PID=${row.pid} PPID=${row.ppid} LWP=${row.lwp}`}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">PID</span>
        <span className="font-semibold">{row.pid}</span>
        <span className="text-muted-foreground">PPID</span>
        <span>{row.ppid}</span>
        <span className="text-muted-foreground">LWP</span>
        <span className="font-semibold">{row.lwp}</span>
      </div>
      <div className="truncate">
        <span className="text-muted-foreground">{row.user}</span> {row.cmd}
      </div>
    </div>
  );
}

function DropZone({
  cat,
  rows,
  revealed,
  onDrop,
  onRowClick,
  isDragging,
}: {
  cat: { id: Cat; label: string; sub: string; color: string };
  rows: Row[];
  revealed: boolean;
  onDrop: (id: string) => void;
  onRowClick: (id: string) => void;
  isDragging: boolean;
}) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        if (id) onDrop(id);
        setOver(false);
      }}
      className={`rounded-lg border-2 p-2 min-h-[120px] transition-colors ${
        over
          ? "border-brand bg-brand/5"
          : isDragging
          ? "border-dashed border-brand/40 bg-brand/[0.02]"
          : "border-border bg-background"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
        <span className="text-xs font-semibold">{cat.label}</span>
        <span className="text-[10px] text-muted-foreground">({rows.length})</span>
      </div>
      <div className="text-[10px] text-muted-foreground mb-1.5">{cat.sub}</div>
      <div className="space-y-1">
        {rows.length === 0 ? (
          <div className="text-[11px] italic text-muted-foreground py-4 text-center">slipp her</div>
        ) : (
          rows.map((r) => (
            <PsRow
              key={r.id}
              row={r}
              draggable={!revealed}
              onClick={() => onRowClick(r.id)}
              highlight={revealed ? (r.correct === cat.id ? "ok" : "err") : null}
            />
          ))
        )}
      </div>
    </div>
  );
}
