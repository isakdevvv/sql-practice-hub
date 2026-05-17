import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

/**
 * Polling vs Interrupt vs DMA — splittskjerm.
 *
 * Samme I/O-jobb (les 8 KB fra disk) kjøres tre ganger med tre strategier.
 * For hver strategi vises:
 *  - CPU-aktivitet over tid (busy-bar)
 *  - Hva CPU faktisk gjør (poll-loop / annet arbeid / interrupt-handler)
 *  - Hvem som flytter data (CPU / DMA-controller)
 *  - Sluttbar: % CPU-tid på I/O vs % på annet arbeid
 *
 * Tidsenhet: "tick" (~1 µs i konseptet, men abstrakt). Total job = 80 ticks.
 */

type Strategy = "polling" | "interrupt" | "dma";

const TOTAL_TICKS = 80;
const DATA_READY_AT = 50; // når disken har lest ferdig
const IRQ_HANDLER_LENGTH = 4; // antall ticks interrupt-handleren bruker
const DMA_SETUP_LENGTH = 2; // CPU bruker 2 ticks på å sette opp DMA
const DMA_FINISH_IRQ_LENGTH = 2; // mini-IRQ når DMA er ferdig

type TickKind =
  | "poll" /* CPU spinner i poll-loop */
  | "user" /* CPU gjør annet (nyttig arbeid) */
  | "irq" /* CPU kjører interrupt-handler */
  | "dma-setup" /* CPU setter opp DMA */
  | "copy" /* CPU kopierer data fra device buffer til RAM */
  | "idle"; /* CPU helt ledig */

const TICK_COLOR: Record<TickKind, string> = {
  poll: "bg-rose-500",
  user: "bg-emerald-500",
  irq: "bg-amber-500",
  "dma-setup": "bg-sky-500",
  copy: "bg-rose-400",
  idle: "bg-muted",
};

const TICK_LABEL: Record<TickKind, string> = {
  poll: "Poll-loop (busy-wait)",
  user: "Annet arbeid",
  irq: "Interrupt-handler",
  "dma-setup": "DMA-oppsett",
  copy: "CPU kopierer data",
  idle: "CPU helt ledig",
};

function buildTrace(strategy: Strategy): TickKind[] {
  const trace: TickKind[] = new Array(TOTAL_TICKS);

  if (strategy === "polling") {
    // CPU spinner hele tiden i en poll-loop til DATA_READY_AT, deretter kopierer
    // den dataene selv (4 ticks), så fri.
    for (let i = 0; i < TOTAL_TICKS; i++) {
      if (i < DATA_READY_AT) trace[i] = "poll";
      else if (i < DATA_READY_AT + 4) trace[i] = "copy";
      else trace[i] = "idle";
    }
  } else if (strategy === "interrupt") {
    // CPU gjør annet arbeid mens disken jobber. Når data er klar (DATA_READY_AT)
    // kommer IRQ, CPU bytter til handler (IRQ_HANDLER_LENGTH ticks), så
    // kopierer den dataene (4 ticks), så annet arbeid igjen.
    for (let i = 0; i < TOTAL_TICKS; i++) {
      if (i < DATA_READY_AT) trace[i] = "user";
      else if (i < DATA_READY_AT + IRQ_HANDLER_LENGTH) trace[i] = "irq";
      else if (i < DATA_READY_AT + IRQ_HANDLER_LENGTH + 4) trace[i] = "copy";
      else trace[i] = "user";
    }
  } else {
    // DMA: CPU setter opp DMA (2 ticks), gjør annet arbeid mens DMA-controller
    // flytter data direkte til RAM, mini-IRQ når ferdig (2 ticks), så fri.
    for (let i = 0; i < TOTAL_TICKS; i++) {
      if (i < DMA_SETUP_LENGTH) trace[i] = "dma-setup";
      else if (i < DATA_READY_AT) trace[i] = "user";
      else if (i < DATA_READY_AT + DMA_FINISH_IRQ_LENGTH) trace[i] = "irq";
      else trace[i] = "user";
    }
  }
  return trace;
}

function ioCost(trace: TickKind[]): number {
  // CPU-tid brukt på I/O-relatert arbeid (poll/irq/dma-setup/copy)
  return trace.filter(
    (t) => t === "poll" || t === "irq" || t === "dma-setup" || t === "copy",
  ).length;
}

function StrategyTrack({
  strategy,
  title,
  subtitle,
  currentTick,
  trace,
}: {
  strategy: Strategy;
  title: string;
  subtitle: string;
  currentTick: number;
  trace: TickKind[];
}) {
  const ioTicks = useMemo(() => ioCost(trace), [trace]);
  const pct = Math.round((ioTicks / TOTAL_TICKS) * 100);
  const live = trace[Math.min(currentTick, TOTAL_TICKS - 1)];

  // Bus-tilgang-visning: hvem flytter data?
  const busOwner =
    strategy === "dma" && currentTick >= DMA_SETUP_LENGTH && currentTick < DATA_READY_AT
      ? "DMA-controller"
      : live === "copy"
        ? "CPU"
        : currentTick < DATA_READY_AT
          ? strategy === "dma"
            ? "DMA-controller"
            : "Disk"
          : "Ledig";

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-[10.5px] text-muted-foreground">{subtitle}</div>
        </div>
        <div
          className={`text-xs font-mono px-2 py-0.5 rounded ${
            pct > 90
              ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
              : pct > 30
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
          }`}
        >
          {pct}% CPU på I/O
        </div>
      </div>

      {/* Timeline */}
      <div className="flex h-5 rounded overflow-hidden border border-border bg-muted mb-1.5">
        {trace.map((k, i) => (
          <div
            key={i}
            className={`${TICK_COLOR[k]} ${
              i === currentTick ? "ring-2 ring-foreground/60 z-10 relative" : ""
            } transition-opacity ${
              i <= currentTick ? "opacity-100" : "opacity-30"
            }`}
            style={{ width: `${100 / TOTAL_TICKS}%` }}
            title={`tick ${i + 1}: ${TICK_LABEL[k]}`}
          />
        ))}
      </div>

      {/* Live status */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded bg-muted/60 px-2 py-1">
          <div className="text-muted-foreground">CPU akkurat nå</div>
          <div className="font-mono">{TICK_LABEL[live]}</div>
        </div>
        <div className="rounded bg-muted/60 px-2 py-1">
          <div className="text-muted-foreground">Bus-tilgang</div>
          <div className="font-mono">{busOwner}</div>
        </div>
      </div>
    </div>
  );
}

export function IoStrategySim() {
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x, 2x, 4x
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  const traces = useMemo(
    () => ({
      polling: buildTrace("polling"),
      interrupt: buildTrace("interrupt"),
      dma: buildTrace("dma"),
    }),
    [],
  );

  useEffect(() => {
    if (!playing) return;
    function step(t: number) {
      if (!lastRef.current) lastRef.current = t;
      const dt = t - lastRef.current;
      // 1 tick per 60 ms ved 1x
      if (dt >= 60 / speed) {
        lastRef.current = t;
        setTick((p) => {
          if (p >= TOTAL_TICKS - 1) {
            setPlaying(false);
            return p;
          }
          return p + 1;
        });
      }
      rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastRef.current = 0;
    };
  }, [playing, speed]);

  function reset() {
    setTick(0);
    setPlaying(false);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          Samme I/O-jobb · tre strategier · live CPU-bruk
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={TOTAL_TICKS - 1}
            value={tick}
            onChange={(e) => {
              setTick(Number(e.target.value));
              setPlaying(false);
            }}
            className="w-32 accent-brand"
            aria-label="Scrub timeline"
          />
          <div className="text-[11px] font-mono text-muted-foreground w-16 text-right">
            t = {String(tick + 1).padStart(2, "0")}/{TOTAL_TICKS}
          </div>
          <div className="flex rounded-lg border border-border overflow-hidden text-xs">
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 ${
                  speed === s ? "bg-brand text-brand-foreground" : "hover:bg-muted"
                }`}
              >
                {s}×
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-border hover:bg-muted"
          >
            {playing ? (
              <>
                <Pause className="h-3 w-3" /> Pause
              </>
            ) : (
              <>
                <Play className="h-3 w-3" /> Spill
              </>
            )}
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-border hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <StrategyTrack
          strategy="polling"
          title="Polling"
          subtitle="CPU spør disken i en busy-loop til data er klar"
          currentTick={tick}
          trace={traces.polling}
        />
        <StrategyTrack
          strategy="interrupt"
          title="Interrupt"
          subtitle="CPU gjør annet · disk avbryter når data er klar"
          currentTick={tick}
          trace={traces.interrupt}
        />
        <StrategyTrack
          strategy="dma"
          title="DMA"
          subtitle="DMA-controller flytter data · CPU helt fri imens"
          currentTick={tick}
          trace={traces.dma}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[10.5px]">
        {(
          [
            "poll",
            "irq",
            "dma-setup",
            "copy",
            "user",
            "idle",
          ] as TickKind[]
        ).map((k) => (
          <div key={k} className="flex items-center gap-1.5">
            <span
              className={`inline-block w-3 h-3 rounded ${TICK_COLOR[k]}`}
            />
            <span className="text-muted-foreground">{TICK_LABEL[k]}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
        <strong>Hva å se etter:</strong> polling-baren er rød hele veien — CPU
        kaster bort ALT på å vente. Interrupt-baren er grønn (nyttig arbeid)
        helt til den oransje IRQ-stripen midt i. DMA-baren har bare to bittesmå
        oppgaver for CPU (oppsett + ferdig-IRQ); resten er fritt arbeid og
        DMA-controlleren snakker direkte med RAM via memory-buss.
      </div>
    </div>
  );
}
