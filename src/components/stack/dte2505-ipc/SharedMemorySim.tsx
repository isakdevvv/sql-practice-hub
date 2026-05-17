import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Shield, AlertTriangle } from "lucide-react";

// ---------------------------------------------------------------------------
// SharedMemorySim — to prosesser deler en 8-felts minne-region (en int per
// felt). Brukeren kan kjøre dem MED eller UTEN POSIX-semafor og se hvordan
// race conditions oppstår når begge prosesser gjør read-modify-write samtidig.
//
// Modus:
//   1. step    → brukeren steg-vis velger hvem som gjør hva (load, add, store)
//   2. auto    → P1 og P2 inkrementerer samme felt N ganger så raskt vi kan
//                animere; sluttverdi sammenlignes med forventet.
//
// Synkronisering:
//   useSemaphore=false → ingen lås, hver instruksjon kan interleaves
//   useSemaphore=true  → sem_wait/sem_post rundt RMW; bare én i kritisk seksjon
//
// Lærepunktet: shared memory er raskest, men også farligst.
// ---------------------------------------------------------------------------

const FIELDS = 8;
const TARGET_FIELD = 0; // begge prosesser inkrementerer felt[0]
const ITERATIONS_PER_PROC = 25;

type ProcId = "P1" | "P2";

type ProcState = {
  /** Pseudo-PC: 0 = load, 1 = add, 2 = store, 3 = done iteration */
  pc: number;
  reg: number; // local register (kopi av minnet)
  iter: number; // hvor mange ferdig
  blocked: boolean;
};

type Sim = {
  mem: number[];
  procs: Record<ProcId, ProcState>;
  semaphore: number; // 1 = ledig, 0 = tatt
  semHolder: ProcId | null;
  semWaitQueue: ProcId[];
  log: { t: number; who: ProcId | "sem"; text: string; tone: "info" | "good" | "bad" }[];
  tick: number;
  conflicts: number; // antall ganger en RMW ble interleaved
};

function initial(): Sim {
  return {
    mem: Array.from({ length: FIELDS }, () => 0),
    procs: {
      P1: { pc: 0, reg: 0, iter: 0, blocked: false },
      P2: { pc: 0, reg: 0, iter: 0, blocked: false },
    },
    semaphore: 1,
    semHolder: null,
    semWaitQueue: [],
    log: [],
    tick: 0,
    conflicts: 0,
  };
}

function pushLog(s: Sim, who: ProcId | "sem", text: string, tone: "info" | "good" | "bad" = "info") {
  s.log = [{ t: s.tick, who, text, tone }, ...s.log].slice(0, 12);
}

function semWait(s: Sim, who: ProcId): boolean {
  // Returnerer true hvis vi fikk semaforen og kan fortsette
  if (s.semaphore > 0) {
    s.semaphore = 0;
    s.semHolder = who;
    pushLog(s, "sem", `${who}: sem_wait — fikk lås`, "info");
    return true;
  }
  if (!s.semWaitQueue.includes(who)) s.semWaitQueue.push(who);
  s.procs[who].blocked = true;
  pushLog(s, "sem", `${who}: sem_wait — BLOKKERT (holder=${s.semHolder})`, "bad");
  return false;
}

function semPost(s: Sim, who: ProcId) {
  if (s.semHolder !== who) return;
  s.semHolder = null;
  s.semaphore = 1;
  // Vekk neste i kø
  if (s.semWaitQueue.length > 0) {
    const next = s.semWaitQueue.shift()!;
    s.procs[next].blocked = false;
    s.semaphore = 0;
    s.semHolder = next;
    pushLog(s, "sem", `${who}: sem_post — vekker ${next}, gir lås`, "info");
  } else {
    pushLog(s, "sem", `${who}: sem_post — lås ledig`, "info");
  }
}

/** Et mikrosteg for én prosess. Returnerer ny Sim. */
function step(s: Sim, who: ProcId, useSemaphore: boolean): Sim {
  const next = cloneSim(s);
  next.tick++;
  const p = next.procs[who];
  if (p.iter >= ITERATIONS_PER_PROC) {
    pushLog(next, who, "ferdig — ingen flere iterasjoner", "info");
    return next;
  }
  if (p.blocked) {
    pushLog(next, who, "fortsatt blokkert på sem", "bad");
    return next;
  }

  // PC 0: hvis vi bruker semafor, ta lås først
  if (p.pc === 0) {
    if (useSemaphore && next.semHolder !== who) {
      const ok = semWait(next, who);
      if (!ok) return next;
    }
    p.reg = next.mem[TARGET_FIELD];
    pushLog(next, who, `load r ← mem[${TARGET_FIELD}]  (r=${p.reg})`, "good");
    p.pc = 1;
    return next;
  }
  if (p.pc === 1) {
    p.reg += 1;
    pushLog(next, who, `add r, 1            (r=${p.reg})`, "good");
    p.pc = 2;
    return next;
  }
  if (p.pc === 2) {
    // Sjekk for race: hvis minnet har endret seg siden vi loadet (uten sem)
    const beforeStore = next.mem[TARGET_FIELD];
    if (!useSemaphore && beforeStore !== p.reg - 1) {
      next.conflicts++;
      pushLog(
        next,
        who,
        `store mem[${TARGET_FIELD}] ← ${p.reg}  ⚠ overskrev verdi ${beforeStore} (LOST UPDATE)`,
        "bad",
      );
    } else {
      pushLog(next, who, `store mem[${TARGET_FIELD}] ← ${p.reg}`, "good");
    }
    next.mem[TARGET_FIELD] = p.reg;
    p.pc = 3;
    return next;
  }
  if (p.pc === 3) {
    if (useSemaphore) {
      semPost(next, who);
    }
    p.iter++;
    p.pc = 0;
    return next;
  }
  return next;
}

function cloneSim(s: Sim): Sim {
  return {
    mem: s.mem.slice(),
    procs: {
      P1: { ...s.procs.P1 },
      P2: { ...s.procs.P2 },
    },
    semaphore: s.semaphore,
    semHolder: s.semHolder,
    semWaitQueue: s.semWaitQueue.slice(),
    log: s.log.slice(),
    tick: s.tick,
    conflicts: s.conflicts,
  };
}

function chooseRunnable(s: Sim, useSemaphore: boolean): ProcId | null {
  const candidates: ProcId[] = [];
  for (const id of ["P1", "P2"] as ProcId[]) {
    const p = s.procs[id];
    if (p.iter >= ITERATIONS_PER_PROC) continue;
    if (p.blocked) continue;
    candidates.push(id);
  }
  if (candidates.length === 0) return null;
  // Tilfeldig velging — modellerer kjernens scheduler
  void useSemaphore;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function SharedMemorySim() {
  const [useSemaphore, setUseSemaphore] = useState(false);
  const [sim, setSim] = useState<Sim>(initial);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const tickFn = () => {
      setSim((prev) => {
        const who = chooseRunnable(prev, useSemaphore);
        if (!who) {
          setRunning(false);
          return prev;
        }
        return step(prev, who, useSemaphore);
      });
      timerRef.current = window.setTimeout(tickFn, 60);
    };
    timerRef.current = window.setTimeout(tickFn, 60);
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [running, useSemaphore]);

  const expected = ITERATIONS_PER_PROC * 2;
  const actual = sim.mem[TARGET_FIELD];
  const done =
    sim.procs.P1.iter >= ITERATIONS_PER_PROC && sim.procs.P2.iter >= ITERATIONS_PER_PROC;

  function reset() {
    setRunning(false);
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    setSim(initial());
  }

  function stepOnce(who: ProcId) {
    setSim((s) => step(s, who, useSemaphore));
  }

  function runAuto() {
    if (running) return;
    setRunning(true);
  }

  return (
    <div
      className="rounded-2xl border border-border bg-card overflow-hidden"
      role="region"
      aria-label="Shared memory simulator — race condition og semafor"
    >
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Interaktiv visualisering
        </div>
        <div className="text-sm font-semibold">
          Shared memory — to prosesser deler 8 felter
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          P1 og P2 inkrementerer mem[0] {ITERATIONS_PER_PROC} ganger hver. Forventet
          sluttverdi: <strong className="text-foreground">{expected}</strong>. Uten
          semafor blir det tapt — med semafor er det alltid riktig.
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Toggle + global controls */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={useSemaphore}
              onChange={(e) => {
                setUseSemaphore(e.target.checked);
                reset();
              }}
              className="h-3.5 w-3.5"
            />
            {useSemaphore ? (
              <Shield className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            )}
            <span className="font-medium">
              sem_wait/sem_post (POSIX-semafor i shm)
            </span>
          </label>
          <button
            type="button"
            onClick={running ? () => setRunning(false) : runAuto}
            className="ml-auto px-3 py-1.5 rounded-md text-xs font-medium bg-brand text-brand-foreground hover:opacity-90 inline-flex items-center gap-1.5"
          >
            {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {running ? "pause" : "kjør auto"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="px-2 py-1.5 rounded-md text-xs border border-border hover:bg-muted inline-flex items-center gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" /> reset
          </button>
        </div>

        {/* Minne-grid */}
        <div>
          <div className="text-[11px] text-muted-foreground mb-1.5 font-mono">
            int *shm = mmap(...);  // 8 felter delt mellom prosessene
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sim.mem.map((v, i) => {
              const isTarget = i === TARGET_FIELD;
              return (
                <div
                  key={i}
                  className={`min-w-[56px] rounded-md border px-2 py-1.5 text-center ${
                    isTarget
                      ? "border-rose-500/40 bg-rose-500/10"
                      : "border-border bg-muted/30"
                  }`}
                >
                  <div className="text-[9px] font-mono text-muted-foreground">
                    mem[{i}]
                  </div>
                  <div
                    className={`font-mono text-base font-semibold ${
                      isTarget ? "text-rose-700 dark:text-rose-300" : "text-foreground"
                    }`}
                  >
                    {v}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground italic">
            Begge prosesser jobber på <span className="font-mono">mem[{TARGET_FIELD}]</span>{" "}
            (rødt felt).
          </div>
        </div>

        {/* Prosess-paneler */}
        <div className="grid sm:grid-cols-2 gap-3">
          {(["P1", "P2"] as ProcId[]).map((id) => {
            const p = sim.procs[id];
            const color = id === "P1" ? "emerald" : "sky";
            const palette =
              color === "emerald"
                ? {
                    border: "border-emerald-500/40",
                    bg: "bg-emerald-500/10",
                    text: "text-emerald-700 dark:text-emerald-300",
                  }
                : {
                    border: "border-sky-500/40",
                    bg: "bg-sky-500/10",
                    text: "text-sky-700 dark:text-sky-300",
                  };
            return (
              <div
                key={id}
                className={`rounded-lg border p-3 ${palette.bg} ${palette.border} ${
                  p.blocked ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className={`text-sm font-semibold font-mono ${palette.text}`}>
                    {id}
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground">
                    iter {p.iter}/{ITERATIONS_PER_PROC}
                  </div>
                </div>
                <div className="text-[11px] font-mono mb-1">
                  <span className="text-muted-foreground">pc:</span>{" "}
                  <strong>{["load", "add", "store", "next"][p.pc]}</strong>
                  {" · "}
                  <span className="text-muted-foreground">reg:</span> {p.reg}
                </div>
                {p.blocked && (
                  <div className="text-[11px] text-amber-700 dark:text-amber-300 mb-1">
                    BLOKKERT på sem_wait
                  </div>
                )}
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => stepOnce(id)}
                    disabled={p.blocked || p.iter >= ITERATIONS_PER_PROC || running}
                    className="text-[10px] font-mono px-2 py-1 rounded border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    steg {id}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Semafor-status */}
        {useSemaphore && (
          <div className="rounded-lg border border-violet-500/40 bg-violet-500/10 p-3">
            <div className="text-[11px] uppercase tracking-wider text-violet-700 dark:text-violet-300 font-semibold mb-1">
              sem_t mutex
            </div>
            <div className="text-xs font-mono">
              verdi = <strong>{sim.semaphore}</strong>{" "}
              {sim.semHolder && (
                <span>
                  · holdt av <strong>{sim.semHolder}</strong>
                </span>
              )}
              {sim.semWaitQueue.length > 0 && (
                <span>
                  · ventekø: [{sim.semWaitQueue.join(", ")}]
                </span>
              )}
            </div>
          </div>
        )}

        {/* Resultat */}
        <div
          className={`rounded-lg border p-3 ${
            done
              ? actual === expected
                ? "border-emerald-500/40 bg-emerald-500/10"
                : "border-rose-500/40 bg-rose-500/10"
              : "border-border bg-muted/20"
          }`}
        >
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            sluttverdi
          </div>
          <div className="text-sm font-mono">
            <span>
              mem[{TARGET_FIELD}] ={" "}
              <strong
                className={
                  done
                    ? actual === expected
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-rose-700 dark:text-rose-300"
                    : ""
                }
              >
                {actual}
              </strong>
            </span>{" "}
            <span className="text-muted-foreground">/ forventet {expected}</span>
          </div>
          {sim.conflicts > 0 && (
            <div className="text-[11px] text-rose-600 dark:text-rose-300 mt-1">
              {sim.conflicts} tapte oppdateringer (LOST UPDATES) oppdaget under løpet
            </div>
          )}
          {done && actual === expected && useSemaphore && (
            <div className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1">
              Semaforen kanal-iserer adgang — RMW er nå atomisk fra prosessenes synspunkt.
            </div>
          )}
        </div>

        {/* Logg */}
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
            Interleaving-logg
          </div>
          {sim.log.length === 0 ? (
            <div className="text-[11px] italic text-muted-foreground">
              Klikk «kjør auto» eller «steg» for å starte.
            </div>
          ) : (
            <div className="space-y-0.5 font-mono text-[11px] max-h-44 overflow-y-auto">
              {sim.log.map((l, i) => (
                <div
                  key={i}
                  className={
                    l.tone === "bad"
                      ? "text-rose-600 dark:text-rose-300"
                      : l.tone === "good"
                        ? "text-emerald-600 dark:text-emerald-300"
                        : "text-muted-foreground"
                  }
                >
                  <span className="opacity-50">t={l.t}</span>{" "}
                  <span className="text-foreground">[{l.who}]</span> {l.text}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-md border border-brand/30 bg-brand/5 p-3 text-[11px]">
          <strong>Lærepunkt:</strong> <code className="font-mono">counter++</code> i
          shared memory er <em>tre</em> maskininstruksjoner (load, add, store). Uten
          synkronisering kan en annen prosess shipe en store imellom — det er en LOST
          UPDATE. En POSIX-semafor i selve det delte minnet (
          <code className="font-mono">sem_init(s, 1, 1)</code>) gir gjensidig
          utelukkelse på tvers av prosesser.
        </div>
      </div>
    </div>
  );
}
