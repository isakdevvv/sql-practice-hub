import { useEffect, useMemo, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

/**
 * Buffer cache-simulator.
 *
 * Brukeren ser leseforespørsler mot disk hvor cachen sitter mellom CPU og disk.
 * - Cache-størrelse: 1..6 blokker (skyves)
 * - Sekvens av request-IDer (numerisk blokk-id) som spilles av
 * - Hver hit (grønn) er rask (~50 ns); hver miss (rød) går mot disk (~5 ms)
 * - Write-policy: write-through vs write-back — vis dirty bit
 *
 * Vi simulerer LRU-evict (typisk for Linux page cache).
 */

type Access = { kind: "read" | "write"; block: number };

const DEFAULT_TRACE: Access[] = [
  { kind: "read", block: 1 }, // miss
  { kind: "read", block: 2 }, // miss
  { kind: "read", block: 1 }, // HIT
  { kind: "read", block: 3 }, // miss
  { kind: "write", block: 2 }, // hit (dirty)
  { kind: "read", block: 4 }, // miss (may evict)
  { kind: "read", block: 1 }, // hit/miss avhengig av cache size
  { kind: "read", block: 5 },
  { kind: "read", block: 3 },
  { kind: "read", block: 1 },
  { kind: "write", block: 5 },
  { kind: "read", block: 2 },
];

type CacheEntry = { block: number; dirty: boolean; lastUsed: number };

type StepResult = {
  access: Access;
  hit: boolean;
  evicted: number | null;
  cacheAfter: CacheEntry[];
  wroteBack: boolean; // for write-back: kun ved evict av dirty
  immediateDiskWrite: boolean; // for write-through: hver write
};

function simulate(
  trace: Access[],
  cacheSize: number,
  writePolicy: "write-through" | "write-back",
): StepResult[] {
  let cache: CacheEntry[] = [];
  const out: StepResult[] = [];
  for (let t = 0; t < trace.length; t++) {
    const acc = trace[t];
    const idx = cache.findIndex((e) => e.block === acc.block);
    let hit = idx !== -1;
    let evicted: number | null = null;
    let wroteBack = false;
    let immediateDiskWrite = false;

    if (hit) {
      const e = cache[idx];
      e.lastUsed = t;
      if (acc.kind === "write") {
        if (writePolicy === "write-back") {
          e.dirty = true;
        } else {
          immediateDiskWrite = true; // write-through alltid mot disk
          e.dirty = false;
        }
      }
    } else {
      // miss: må laste blokken inn
      if (cache.length >= cacheSize) {
        // evict LRU
        let lru = 0;
        for (let i = 1; i < cache.length; i++) {
          if (cache[i].lastUsed < cache[lru].lastUsed) lru = i;
        }
        const victim = cache[lru];
        evicted = victim.block;
        if (victim.dirty && writePolicy === "write-back") {
          wroteBack = true;
        }
        cache.splice(lru, 1);
      }
      const newEntry: CacheEntry = {
        block: acc.block,
        dirty: false,
        lastUsed: t,
      };
      if (acc.kind === "write") {
        if (writePolicy === "write-back") {
          newEntry.dirty = true;
        } else {
          immediateDiskWrite = true;
          newEntry.dirty = false;
        }
      }
      cache.push(newEntry);
    }

    out.push({
      access: acc,
      hit,
      evicted,
      cacheAfter: cache.map((e) => ({ ...e })),
      wroteBack,
      immediateDiskWrite,
    });
  }
  return out;
}

const HIT_NS = 50; // 50 ns
const MISS_MS = 5; // 5 ms

export function BufferCacheSim() {
  const [cacheSize, setCacheSize] = useState(3);
  const [policy, setPolicy] = useState<"write-through" | "write-back">(
    "write-back",
  );
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = useMemo(
    () => simulate(DEFAULT_TRACE, cacheSize, policy),
    [cacheSize, policy],
  );

  // Reset step når brukeren endrer params
  useEffect(() => {
    setStep(0);
  }, [cacheSize, policy]);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      setStep((s) => {
        if (s >= steps.length - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 700);
    return () => clearTimeout(t);
  }, [playing, step, steps.length]);

  // Statistikk basert på steg opp til og med nåværende
  const upto = steps.slice(0, step + 1);
  const hits = upto.filter((s) => s.hit).length;
  const misses = upto.length - hits;
  const hitRate = upto.length === 0 ? 0 : Math.round((hits / upto.length) * 100);
  const totalLatencyNs =
    hits * HIT_NS + misses * MISS_MS * 1_000_000; // ms→ns

  const current = steps[Math.min(step, steps.length - 1)];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          Buffer cache · samme blokk to ganger blir GRATIS andre gang
        </div>
        <div className="flex items-center gap-2">
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
            onClick={() => {
              setStep(0);
              setPlaying(false);
            }}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-border hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>

      {/* Controls row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg border border-border bg-background p-3">
          <label className="text-xs font-medium text-foreground block mb-1.5">
            Cache-størrelse: <span className="font-mono">{cacheSize}</span> blokker
          </label>
          <input
            type="range"
            min={1}
            max={6}
            value={cacheSize}
            onChange={(e) => setCacheSize(Number(e.target.value))}
            className="w-full accent-brand"
          />
          <div className="text-[10.5px] text-muted-foreground mt-1">
            Skyv opp og se hit-rate øke når cachen rommer flere blokker.
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-xs font-medium text-foreground mb-1.5">
            Write-policy
          </div>
          <div className="flex rounded-lg border border-border overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setPolicy("write-back")}
              className={`flex-1 px-2 py-1 ${
                policy === "write-back"
                  ? "bg-brand text-brand-foreground"
                  : "hover:bg-muted"
              }`}
            >
              Write-back
            </button>
            <button
              type="button"
              onClick={() => setPolicy("write-through")}
              className={`flex-1 px-2 py-1 ${
                policy === "write-through"
                  ? "bg-brand text-brand-foreground"
                  : "hover:bg-muted"
              }`}
            >
              Write-through
            </button>
          </div>
          <div className="text-[10.5px] text-muted-foreground mt-1.5">
            <strong>Write-back:</strong> skriv først til RAM, marker dirty,
            flush ved evict. Rask, kan miste data ved crash.{" "}
            <strong>Write-through:</strong> skriv til disk hver gang. Trygt, men
            tregt.
          </div>
        </div>
      </div>

      {/* Cache state visualization */}
      <div className="rounded-lg border border-border bg-background p-3 mb-3">
        <div className="text-[11px] text-muted-foreground mb-2">
          Cache-tilstand etter steg {step + 1}
        </div>
        <div className="flex gap-2 mb-3 flex-wrap">
          {Array.from({ length: cacheSize }).map((_, i) => {
            const slot = current.cacheAfter[i];
            return (
              <div
                key={i}
                className={`w-16 h-16 rounded-lg border-2 grid place-items-center text-xs font-mono relative ${
                  slot
                    ? slot.dirty
                      ? "border-amber-500/60 bg-amber-500/10"
                      : "border-sky-500/60 bg-sky-500/10"
                    : "border-dashed border-border bg-muted/30"
                }`}
              >
                {slot ? (
                  <>
                    <div className="font-bold text-sm">B{slot.block}</div>
                    {slot.dirty && (
                      <div className="absolute top-1 right-1 text-[9px] px-1 rounded bg-amber-500 text-white">
                        D
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span
            className={`px-2 py-0.5 rounded font-mono ${
              current.access.kind === "read"
                ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
                : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
            }`}
          >
            {current.access.kind.toUpperCase()} B{current.access.block}
          </span>
          <span
            className={`px-2 py-0.5 rounded font-mono ${
              current.hit
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
            }`}
          >
            {current.hit ? "HIT · ~50 ns" : "MISS · ~5 ms til disk"}
          </span>
          {current.evicted !== null && (
            <span className="px-2 py-0.5 rounded font-mono bg-rose-500/10 text-rose-700 dark:text-rose-300">
              Evict B{current.evicted}
            </span>
          )}
          {current.wroteBack && (
            <span className="px-2 py-0.5 rounded font-mono bg-amber-500/15 text-amber-700 dark:text-amber-300">
              Write-back flush
            </span>
          )}
          {current.immediateDiskWrite && (
            <span className="px-2 py-0.5 rounded font-mono bg-amber-500/15 text-amber-700 dark:text-amber-300">
              Skriver til disk nå
            </span>
          )}
        </div>
      </div>

      {/* Trace bar */}
      <div className="mb-3">
        <div className="text-[11px] text-muted-foreground mb-1">
          Forespørsels-sekvens (klikk for å hoppe)
        </div>
        <div className="flex gap-1 flex-wrap">
          {steps.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStep(i)}
              className={`text-[10px] font-mono px-1.5 py-1 rounded border ${
                i === step
                  ? "border-brand bg-brand/15 text-foreground"
                  : i < step
                    ? s.hit
                      ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300"
                      : "border-rose-500/40 bg-rose-500/5 text-rose-700 dark:text-rose-300"
                    : "border-border bg-background text-muted-foreground"
              }`}
              title={`${s.access.kind} B${s.access.block} — ${
                s.hit ? "hit" : "miss"
              }`}
            >
              {s.access.kind === "read" ? "R" : "W"}B{s.access.block}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="rounded border border-border bg-background p-2">
          <div className="text-[10px] text-muted-foreground uppercase">Hits</div>
          <div className="text-sm font-mono text-emerald-600 dark:text-emerald-400">
            {hits}
          </div>
        </div>
        <div className="rounded border border-border bg-background p-2">
          <div className="text-[10px] text-muted-foreground uppercase">
            Misses
          </div>
          <div className="text-sm font-mono text-rose-600 dark:text-rose-400">
            {misses}
          </div>
        </div>
        <div className="rounded border border-border bg-background p-2">
          <div className="text-[10px] text-muted-foreground uppercase">
            Hit-rate
          </div>
          <div className="text-sm font-mono">{hitRate}%</div>
        </div>
        <div className="rounded border border-border bg-background p-2">
          <div className="text-[10px] text-muted-foreground uppercase">
            Total latency
          </div>
          <div className="text-sm font-mono">
            {(totalLatencyNs / 1_000_000).toFixed(2)} ms
          </div>
        </div>
      </div>

      <div className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
        <strong>Hvorfor cache fungerer:</strong> faktisk diskdata viser sterk
        temporal lokalitet — det du leste nå leses ofte igjen om et øyeblikk
        (loops, indekser, indre tabeller). En 1 GB page cache gir typisk &gt; 95
        % hit-rate. Linux gir hele unytta RAM til cachen og slipper den ved
        memory pressure.
      </div>
    </div>
  );
}
