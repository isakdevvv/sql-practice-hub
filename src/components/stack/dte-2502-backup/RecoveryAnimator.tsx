import { useEffect, useMemo, useRef, useState } from "react";

/**
 * RecoveryAnimator — pedagogisk kjerne:
 *   "Krasj på dag 17 — hva trengs for å gjenopprette?"
 *
 * For hver strategi viser vi hvilken kjede av filer som må anvendes,
 * hvor lang tid det tar, og hva som skjer hvis en av filene midt i kjeden
 * er korrupt.
 *
 * Antakelser:
 *   - 1000 GB dataset, 20 GB delta/dag
 *   - Restore-throughput:    400 GB/t for full, 80 GB/t for delta-anvendelse
 *     (delta-anvendelse er CPU-bound: lesing + diff-merge)
 *   - Krasj-dag default = 17.
 */

type Strategy = "full-daily" | "weekly-inc" | "weekly-diff";

type RestoreStep = {
  kind: "full" | "incremental" | "differential";
  day: number;
  label: string;
  sizeGb: number;
  /** Antall sekunder denne fila skal lyse opp i animasjonen. */
  durationS: number;
};

const TOTAL_DATA_GB = 1000;
const DAILY_DELTA_GB = 20;
const FULL_RESTORE_GB_PER_HOUR = 400;
const DELTA_APPLY_GB_PER_HOUR = 80;
const CRASH_DAY = 17;

/** Returner alle dager der det er en full backup, for valgt strategi. */
function fullDaysFor(strategy: Strategy): number[] {
  if (strategy === "full-daily") {
    return Array.from({ length: 30 }, (_, i) => i + 1);
  }
  // weekly: full hver søndag (dag 7, 14, 21, 28) + dag 1 (mandag, init)
  return [1, 7, 14, 21, 28];
}

function lastFullDayBefore(strategy: Strategy, crashDay: number): number {
  const fulls = fullDaysFor(strategy).filter((d) => d <= crashDay);
  return fulls[fulls.length - 1] ?? 1;
}

function restoreChain(strategy: Strategy, crashDay: number): RestoreStep[] {
  const lastFull = lastFullDayBefore(strategy, crashDay);
  const steps: RestoreStep[] = [
    {
      kind: "full",
      day: lastFull,
      label: `FULL (dag ${lastFull})`,
      sizeGb: TOTAL_DATA_GB,
      durationS: (TOTAL_DATA_GB / FULL_RESTORE_GB_PER_HOUR) * 0.6, // skaleres for anim
    },
  ];

  if (strategy === "full-daily") return steps;

  if (strategy === "weekly-diff") {
    // Bare siste differensielle (dagen før krasj eller selve krasj-dagen)
    const diffDay = crashDay > lastFull ? crashDay : lastFull;
    if (diffDay > lastFull) {
      const daysSinceFull = diffDay - lastFull;
      const sizeGb = DAILY_DELTA_GB * daysSinceFull;
      steps.push({
        kind: "differential",
        day: diffDay,
        label: `DIFF (dag ${diffDay}, +${daysSinceFull}d delta)`,
        sizeGb,
        durationS: (sizeGb / DELTA_APPLY_GB_PER_HOUR) * 0.6,
      });
    }
    return steps;
  }

  // weekly-inc: hver dag fra lastFull+1 til crashDay må anvendes i rekkefølge
  for (let d = lastFull + 1; d <= crashDay; d++) {
    steps.push({
      kind: "incremental",
      day: d,
      label: `INC (dag ${d})`,
      sizeGb: DAILY_DELTA_GB,
      durationS: (DAILY_DELTA_GB / DELTA_APPLY_GB_PER_HOUR) * 0.6 + 0.2, // overhead per kjedeledd
    });
  }
  return steps;
}

function totalRestoreHours(steps: RestoreStep[]): number {
  let hours = 0;
  for (const s of steps) {
    if (s.kind === "full") hours += s.sizeGb / FULL_RESTORE_GB_PER_HOUR;
    else hours += s.sizeGb / DELTA_APPLY_GB_PER_HOUR;
  }
  // ekstra overhead per inkrementelt steg (mount + cataloging)
  const incExtra = steps.filter((s) => s.kind === "incremental").length * 0.05;
  return hours + incExtra;
}

function fmtHours(h: number): string {
  if (h < 0.05) return `< 5 min`;
  if (h < 1) return `${Math.round(h * 60)} min`;
  if (h < 10) return `${h.toFixed(1)} t`;
  return `${Math.round(h)} t`;
}

function fmtGb(gb: number): string {
  if (gb >= 1000) return `${(gb / 1000).toFixed(2)} TB`;
  return `${gb.toFixed(0)} GB`;
}

const STRATEGY_LABEL: Record<Strategy, string> = {
  "full-daily": "Full hver dag",
  "weekly-inc": "Full ukentlig + Inkrementell daglig",
  "weekly-diff": "Full ukentlig + Differensiell daglig",
};

export function RecoveryAnimator() {
  const [strategy, setStrategy] = useState<Strategy>("weekly-inc");
  const [crashDay, setCrashDay] = useState<number>(CRASH_DAY);
  const [stepIdx, setStepIdx] = useState<number>(-1); // -1 = pre-recovery
  const [playing, setPlaying] = useState(false);
  const [corruptedStep, setCorruptedStep] = useState<number | null>(null);
  const playRef = useRef<number | null>(null);

  const steps = useMemo(
    () => restoreChain(strategy, crashDay),
    [strategy, crashDay],
  );
  const totalHours = useMemo(() => totalRestoreHours(steps), [steps]);

  // Reset når input endrer seg
  useEffect(() => {
    setStepIdx(-1);
    setPlaying(false);
    setCorruptedStep(null);
  }, [strategy, crashDay]);

  // Auto-play
  useEffect(() => {
    if (!playing) return;
    if (corruptedStep !== null && stepIdx >= corruptedStep) {
      setPlaying(false);
      return;
    }
    if (stepIdx >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    playRef.current = window.setTimeout(() => {
      setStepIdx((i) => i + 1);
    }, 750);
    return () => {
      if (playRef.current !== null) {
        window.clearTimeout(playRef.current);
        playRef.current = null;
      }
    };
  }, [playing, stepIdx, steps.length, corruptedStep]);

  function startRecovery() {
    setStepIdx(0);
    setPlaying(true);
  }
  function reset() {
    setStepIdx(-1);
    setPlaying(false);
    setCorruptedStep(null);
  }
  function corruptMidRecovery() {
    if (steps.length < 2) return;
    // Korrupt et tilfeldig sted etter første steg (gjerne inkrementell midt i kjeden)
    const midIdx = Math.min(
      steps.length - 1,
      Math.max(1, Math.floor(steps.length / 2)),
    );
    setCorruptedStep(midIdx);
    setStepIdx(midIdx);
    setPlaying(false);
  }

  const fullyRecovered =
    stepIdx === steps.length - 1 && corruptedStep === null;
  const recoveryFailed = corruptedStep !== null && stepIdx >= corruptedStep;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Kontroller */}
      <div className="grid sm:grid-cols-[1fr_auto] gap-3 mb-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">
            Backup-strategi
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            {(Object.keys(STRATEGY_LABEL) as Strategy[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStrategy(s)}
                className={`text-xs rounded-md border px-2 py-1.5 text-left ${
                  strategy === s
                    ? "border-brand bg-brand/10"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {STRATEGY_LABEL[s]}
              </button>
            ))}
          </div>
        </div>
        <div className="sm:w-32">
          <div className="text-xs text-muted-foreground mb-1">Krasj-dag</div>
          <input
            type="number"
            min={2}
            max={30}
            value={crashDay}
            onChange={(e) =>
              setCrashDay(Math.max(2, Math.min(30, Number(e.target.value))))
            }
            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm font-mono"
          />
        </div>
      </div>

      {/* Run-controls */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          type="button"
          onClick={startRecovery}
          disabled={playing}
          className="text-xs rounded-md border border-rose-500/60 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3 py-1.5 hover:bg-rose-500/20 disabled:opacity-40"
        >
          {stepIdx === -1 ? `Krasj på dag ${crashDay} — start recovery` : "Restart recovery"}
        </button>
        <button
          type="button"
          onClick={() => setStepIdx((i) => Math.min(steps.length - 1, i + 1))}
          disabled={stepIdx === -1 || stepIdx >= steps.length - 1 || recoveryFailed}
          className="text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted disabled:opacity-40"
        >
          Neste steg
        </button>
        <button
          type="button"
          onClick={corruptMidRecovery}
          disabled={stepIdx === -1 || steps.length < 2 || corruptedStep !== null}
          className="text-xs rounded-md border border-rose-500/60 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3 py-1.5 hover:bg-rose-500/20 disabled:opacity-40"
        >
          ⚠ Korrupt fil midt i kjeden
        </button>
        <button
          type="button"
          onClick={reset}
          className="text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted"
        >
          Reset
        </button>
      </div>

      {/* Kjede-visualisering */}
      <div className="rounded-lg border border-border bg-muted/20 p-3 mb-3 overflow-x-auto">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Recovery-kjede ({steps.length} {steps.length === 1 ? "fil" : "filer"} må anvendes i rekkefølge)
        </div>
        <div className="flex items-center gap-2 min-w-max">
          {steps.map((s, i) => {
            const isApplied = stepIdx >= i;
            const isCurrent = stepIdx === i && !recoveryFailed;
            const isCorrupt = corruptedStep === i;
            const bg = isCorrupt
              ? "border-rose-500 bg-rose-500/15"
              : isApplied
                ? s.kind === "full"
                  ? "border-emerald-500 bg-emerald-500/10"
                  : s.kind === "differential"
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-amber-500 bg-amber-500/10"
                : "border-border bg-background";
            return (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`rounded-md border-2 px-3 py-2 min-w-[120px] text-center transition ${bg} ${
                    isCurrent ? "ring-2 ring-brand/40" : ""
                  }`}
                >
                  <div
                    className={`text-[10px] uppercase tracking-wider font-semibold ${
                      isCorrupt
                        ? "text-rose-600 dark:text-rose-400"
                        : s.kind === "full"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : s.kind === "differential"
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {isCorrupt ? "KORRUPT" : s.kind}
                  </div>
                  <div className="font-mono text-[11px] font-semibold leading-tight mt-0.5">
                    {s.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {fmtGb(s.sizeGb)}
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <span
                    className={`text-lg ${
                      isApplied ? "text-foreground" : "text-muted-foreground/40"
                    }`}
                  >
                    →
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status banner */}
      {stepIdx === -1 && (
        <div className="rounded-md border border-border bg-background p-3 text-xs text-muted-foreground">
          Trykk <strong className="text-foreground">"Krasj på dag {crashDay} — start recovery"</strong> for å
          se hva som må gjenopprettes. Sammenlign mellom strategier hvor mange filer som trengs.
        </div>
      )}

      {fullyRecovered && (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs">
          <div className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            ✓ Database gjenopprettet til dag {crashDay}
          </div>
          <div className="text-foreground">
            Total recovery-tid: <strong>{fmtHours(totalHours)}</strong> ({steps.length}{" "}
            {steps.length === 1 ? "fil anvendt" : "filer anvendt i sekvens"})
          </div>
        </div>
      )}

      {recoveryFailed && (
        <div className="rounded-md border border-rose-500/60 bg-rose-500/15 p-3 text-xs">
          <div className="font-semibold text-rose-600 dark:text-rose-400 mb-1">
            ✗ Recovery feilet — kjeden er brutt
          </div>
          <div className="text-foreground">
            {strategy === "weekly-inc" ? (
              <>
                Inkrementell #{corruptedStep} er korrupt. Siden hver inkrementell
                bygger på forrige, kan vi <strong>ikke</strong> hoppe over den —
                alt etter dette punktet er utilgjengelig. Databasen kan kun gjenopprettes
                til <strong>dag {steps[corruptedStep! - 1]?.day ?? "?"}</strong>, ikke {crashDay}.
                Tap: ~{(crashDay - (steps[corruptedStep! - 1]?.day ?? crashDay)) * DAILY_DELTA_GB} GB data.
              </>
            ) : strategy === "weekly-diff" ? (
              <>
                Differensiell er korrupt. Heldigvis trenger differensiell bare ÉN
                fil — så hele recoveryen feiler ved dette steget. Eneste alternativ
                er å gå tilbake til siste full og akseptere tap av {crashDay - steps[0].day}{" "}
                dager.
              </>
            ) : (
              <>
                Full-fila er korrupt. Bytt til forrige tilgjengelige fulle backup.
              </>
            )}
          </div>
        </div>
      )}

      {/* Stats nederst */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
        <Stat label="Filer som må anvendes" value={String(steps.length)} />
        <Stat label="Restore-tid (estimert)" value={fmtHours(totalHours)} />
        <Stat
          label="Kjede-sårbarhet"
          value={
            steps.length === 1
              ? "Lav"
              : steps.length <= 2
                ? "Middels"
                : "Høy"
          }
          accent={
            steps.length === 1
              ? "emerald"
              : steps.length <= 2
                ? "amber"
                : "rose"
          }
        />
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">
        <strong className="text-foreground">Mønster:</strong> inkrementell minimerer
        backup-vinduet hver natt, men gjør recovery til en lang og sårbar kjede.
        Differensiell betaler litt mer for hver backup (vokser gjennom uka), men
        recovery er alltid bare 2 filer. Full-daily er enklest å gjenopprette men
        dyrest å lagre.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "emerald" | "amber" | "rose";
}) {
  const accentClass =
    accent === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : accent === "amber"
        ? "text-amber-600 dark:text-amber-400"
        : accent === "rose"
          ? "text-rose-600 dark:text-rose-400"
          : "";
  return (
    <div className="rounded-md border border-border bg-background p-2">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={`text-sm font-semibold tabular-nums ${accentClass}`}>
        {value}
      </div>
    </div>
  );
}
