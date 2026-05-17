import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, AlertTriangle, Shield } from "lucide-react";

// ---------------------------------------------------------------------------
// RaceConditionDemo — to tråder skriver til samme globale `counter`.
// Hver tråd kjører N iterasjoner av: tmp = counter; tmp++; counter = tmp;
// Vi simulerer ikke-deterministisk interleaving og viser hvordan resultatet
// blir < 2*N (lost updates).
//
// Bryter på/av mutex:
//   Uten mutex: hver iterasjon kan interleaves mellom read og write → race.
//   Med mutex:  hele iterasjonen er atomisk → alltid 2*N.
//
// Også viser kort hvorfor: instruksjons-tabell med interleaving av T1/T2.
// ---------------------------------------------------------------------------

const N_ITERS = 5000;
const N_RUNS = 5;

type RunResult = {
  result: number;
  lostUpdates: number;
};

export function RaceConditionDemo() {
  const [useMutex, setUseMutex] = useState(false);
  const [runs, setRuns] = useState<RunResult[]>([]);
  const [showTrace, setShowTrace] = useState(false);
  const [busy, setBusy] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
  }, []);

  function runOnce() {
    if (busy) return;
    setBusy(true);
    // Animer 5 kjøringer på rad så brukeren ser ikke-determinismen
    const collected: RunResult[] = [];
    let i = 0;
    const step = () => {
      collected.push(simulate(useMutex));
      setRuns([...collected]);
      i++;
      if (i < N_RUNS) {
        timerRef.current = window.setTimeout(step, 180);
      } else {
        setBusy(false);
      }
    };
    setRuns([]);
    step();
  }

  function reset() {
    setRuns([]);
    setBusy(false);
    if (timerRef.current !== null) clearTimeout(timerRef.current);
  }

  const expected = 2 * N_ITERS;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden" role="region" aria-label="Race condition demo med to tråder">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Race condition</div>
        <div className="text-sm font-semibold">
          To tråder skriver til samme global <code className="font-mono">counter</code>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-muted-foreground max-w-md">
            Forventet etter 2 tråder × {N_ITERS} iter:{" "}
            <strong className="text-foreground tabular-nums">{expected.toLocaleString("no-NO")}</strong>.
            Uten lås kan resultatet bli mindre fordi en read-modify-write kan bli avbrutt midt i.
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={useMutex}
                onChange={(e) => setUseMutex(e.target.checked)}
                className="h-3.5 w-3.5"
              />
              <span className="font-medium">pthread_mutex_lock()</span>
            </label>
            <button
              type="button"
              onClick={runOnce}
              disabled={busy}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-brand text-brand-foreground hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <Play className="h-3.5 w-3.5" />
              Kjør {N_RUNS} ganger
            </button>
            <button
              type="button"
              onClick={reset}
              className="text-xs px-2 py-1 rounded-md border border-border hover:bg-muted inline-flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <CodeBlock useMutex={useMutex} />
          <ResultsPanel runs={runs} expected={expected} useMutex={useMutex} />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowTrace((s) => !s)}
            className="text-xs underline text-muted-foreground hover:text-foreground"
          >
            {showTrace ? "Skjul" : "Vis"} interleaving-eksempel (hvorfor det går galt)
          </button>
          {showTrace && <TraceTable />}
        </div>
      </div>
    </div>
  );
}

function CodeBlock({ useMutex }: { useMutex: boolean }) {
  const code = useMutex
    ? `int counter = 0;
pthread_mutex_t m = PTHREAD_MUTEX_INITIALIZER;

void* worker(void* _) {
    for (int i = 0; i < ${N_ITERS}; i++) {
        pthread_mutex_lock(&m);
        counter++;                 // atomisk RMW
        pthread_mutex_unlock(&m);
    }
    return NULL;
}`
    : `int counter = 0;

void* worker(void* _) {
    for (int i = 0; i < ${N_ITERS}; i++) {
        counter++;                 // 3 maskininstruksjoner!
        // ld; add 1; st  — kan avbrytes
    }
    return NULL;
}`;
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 inline-flex items-center gap-1.5">
        {useMutex ? (
          <>
            <Shield className="h-3 w-3 text-emerald-600" /> Med mutex
          </>
        ) : (
          <>
            <AlertTriangle className="h-3 w-3 text-amber-500" /> Uten mutex
          </>
        )}
      </div>
      <pre className="font-mono text-[11px] leading-relaxed whitespace-pre overflow-x-auto">{code}</pre>
    </div>
  );
}

function ResultsPanel({ runs, expected, useMutex }: { runs: RunResult[]; expected: number; useMutex: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
        Resultater (5 kjøringer)
      </div>
      <div className="space-y-1">
        {runs.length === 0 && (
          <div className="text-xs text-muted-foreground italic">Klikk «Kjør» for å starte simulasjonen.</div>
        )}
        {runs.map((r, i) => {
          const ok = r.result === expected;
          return (
            <div key={i} className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground">run #{i + 1}</span>
              <span className={ok ? "text-emerald-700 dark:text-emerald-400 font-semibold" : "text-rose-700 dark:text-rose-400 font-semibold"}>
                counter = {r.result.toLocaleString("no-NO")}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {ok ? "OK" : `−${r.lostUpdates.toLocaleString("no-NO")}`}
              </span>
            </div>
          );
        })}
      </div>
      {runs.length === N_RUNS && (
        <div className={`mt-3 text-[11px] rounded border p-2 ${useMutex ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300" : "border-amber-500/30 bg-amber-500/5 text-amber-800 dark:text-amber-300"}`}>
          {useMutex
            ? "Med mutex er resultatet deterministisk og alltid lik forventet verdi."
            : "Uten mutex varierer resultatet mellom kjøringer — klassisk race condition."}
        </div>
      )}
    </div>
  );
}

function TraceTable() {
  // Forklarer hvorfor counter++ ikke er atomisk
  return (
    <div className="mt-2 rounded-lg border border-border bg-background overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-muted/40">
          <tr>
            <th className="px-2 py-1.5 text-left w-12">Tid</th>
            <th className="px-2 py-1.5 text-left">T1</th>
            <th className="px-2 py-1.5 text-left">T2</th>
            <th className="px-2 py-1.5 text-left w-24">counter</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          <tr className="border-t border-border"><td className="px-2 py-1">t=0</td><td className="px-2 py-1">load r1, [counter]   // r1=5</td><td className="px-2 py-1 text-muted-foreground"></td><td className="px-2 py-1 tabular-nums">5</td></tr>
          <tr className="border-t border-border"><td className="px-2 py-1">t=1</td><td className="px-2 py-1 text-muted-foreground">(preemptet)</td><td className="px-2 py-1">load r1, [counter]   // r1=5</td><td className="px-2 py-1 tabular-nums">5</td></tr>
          <tr className="border-t border-border"><td className="px-2 py-1">t=2</td><td className="px-2 py-1 text-muted-foreground"></td><td className="px-2 py-1">add r1, 1            // r1=6</td><td className="px-2 py-1 tabular-nums">5</td></tr>
          <tr className="border-t border-border"><td className="px-2 py-1">t=3</td><td className="px-2 py-1 text-muted-foreground"></td><td className="px-2 py-1">store [counter], r1  // counter=6</td><td className="px-2 py-1 tabular-nums">6</td></tr>
          <tr className="border-t border-border"><td className="px-2 py-1">t=4</td><td className="px-2 py-1">add r1, 1            // r1=6</td><td className="px-2 py-1 text-muted-foreground"></td><td className="px-2 py-1 tabular-nums">6</td></tr>
          <tr className="border-t border-border bg-rose-500/5"><td className="px-2 py-1">t=5</td><td className="px-2 py-1">store [counter], r1  // counter=6</td><td className="px-2 py-1 text-muted-foreground"></td><td className="px-2 py-1 tabular-nums text-rose-700 dark:text-rose-400 font-bold">6</td></tr>
        </tbody>
      </table>
      <div className="px-2 py-2 text-[11px] text-muted-foreground border-t border-border">
        To inkrementer endte med +1 i stedet for +2 — ett oppdrag «forsvant». Det er dette
        som skjer mange tusen ganger når race condition rammer en høyfrekvent telleren.
      </div>
    </div>
  );
}

// =============================================================================
//                              SIMULATOR
// =============================================================================

function simulate(useMutex: boolean): RunResult {
  if (useMutex) {
    return { result: 2 * N_ITERS, lostUpdates: 0 };
  }
  // Modeller race med Math.random — over mange iterasjoner taper vi
  // i størrelsesorden noen tusen oppdateringer per kjøring.
  // Vi estimerer at i ~6–14 % av iterasjonene mister én tråd sin write.
  const lossRate = 0.06 + Math.random() * 0.08;
  const lost = Math.floor(2 * N_ITERS * lossRate * 0.5);
  return {
    result: 2 * N_ITERS - lost,
    lostUpdates: lost,
  };
}
