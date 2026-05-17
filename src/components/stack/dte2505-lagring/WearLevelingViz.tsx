import { useState } from "react";
import { Play, RotateCcw } from "lucide-react";

// ---------------------------------------------------------------------------
// WearLevelingViz — to grids side ved side. Begge representerer en SSD med
// 16 blocks. I "no wear leveling" går alle writes til samme block (hot block).
// I "wear leveling" fordeler controlleren writes jevnt. Etter samme antall
// logiske writes ser brukeren at hot blocks i venstre grid har brukt opp
// hele PE-budsjettet, mens høyre grid har lik slitasje overalt.
// ---------------------------------------------------------------------------

const NUM_BLOCKS = 16;
const PE_LIMIT = 100; // forenklet PE-grense

function emptyWear() {
  return Array.from({ length: NUM_BLOCKS }, () => 0);
}

function colorFor(wear: number) {
  const t = Math.min(1, wear / PE_LIMIT);
  // grønn → gul → rød
  if (t < 0.5) {
    return `rgb(${Math.round(34 + (234 - 34) * (t / 0.5))}, ${Math.round(197 + (179 - 197) * (t / 0.5))}, ${Math.round(94 + (8 - 94) * (t / 0.5))})`;
  }
  const t2 = (t - 0.5) / 0.5;
  return `rgb(${Math.round(234 + (239 - 234) * t2)}, ${Math.round(179 + (68 - 179) * t2)}, ${Math.round(8 + (68 - 8) * t2)})`;
}

export function WearLevelingViz() {
  const [noWear, setNoWear] = useState<number[]>(emptyWear());
  const [withWear, setWithWear] = useState<number[]>(emptyWear());
  const [writesDone, setWritesDone] = useState(0);
  const [running, setRunning] = useState(false);

  function doBurst(count: number) {
    setNoWear((prev) => {
      const next = prev.slice();
      // No wear leveling: alle writes treffer LBA → block 0..3 (en liten "hot region")
      for (let i = 0; i < count; i++) {
        const idx = i % 4;
        next[idx] = Math.min(PE_LIMIT, next[idx] + 1);
      }
      return next;
    });
    setWithWear((prev) => {
      const next = prev.slice();
      // Med wear leveling: round-robin over alle blocks
      for (let i = 0; i < count; i++) {
        const idx = (writesDone + i) % NUM_BLOCKS;
        next[idx] = Math.min(PE_LIMIT, next[idx] + 1);
      }
      return next;
    });
    setWritesDone((c) => c + count);
  }

  function autoRun() {
    setRunning(true);
    let total = 0;
    const max = 400;
    const tick = () => {
      if (total >= max) {
        setRunning(false);
        return;
      }
      doBurst(20);
      total += 20;
      setTimeout(tick, 80);
    };
    tick();
  }

  function reset() {
    setNoWear(emptyWear());
    setWithWear(emptyWear());
    setWritesDone(0);
    setRunning(false);
  }

  const noWearDead = noWear.filter((w) => w >= PE_LIMIT).length;
  const withWearDead = withWear.filter((w) => w >= PE_LIMIT).length;
  const noWearAvg = noWear.reduce((a, b) => a + b, 0) / NUM_BLOCKS;
  const withWearAvg = withWear.reduce((a, b) => a + b, 0) / NUM_BLOCKS;

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <h4 className="font-semibold text-sm">Uten wear leveling</h4>
            <span className="text-xs text-muted-foreground">snitt {noWearAvg.toFixed(0)} PE</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {noWear.map((w, i) => (
              <div
                key={i}
                className="aspect-square rounded border flex items-center justify-center text-[10px] font-mono"
                style={{ backgroundColor: colorFor(w), color: w > PE_LIMIT * 0.5 ? "white" : "black" }}
                title={`Block ${i}: ${w}/${PE_LIMIT} PE`}
              >
                {w >= PE_LIMIT ? "💀" : w}
              </div>
            ))}
          </div>
          <div className="text-xs text-destructive mt-2">
            {noWearDead} av {NUM_BLOCKS} blocks utbrent
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-2">
            <h4 className="font-semibold text-sm">Med wear leveling</h4>
            <span className="text-xs text-muted-foreground">snitt {withWearAvg.toFixed(0)} PE</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {withWear.map((w, i) => (
              <div
                key={i}
                className="aspect-square rounded border flex items-center justify-center text-[10px] font-mono"
                style={{ backgroundColor: colorFor(w), color: w > PE_LIMIT * 0.5 ? "white" : "black" }}
                title={`Block ${i}: ${w}/${PE_LIMIT} PE`}
              >
                {w >= PE_LIMIT ? "💀" : w}
              </div>
            ))}
          </div>
          <div className="text-xs text-success mt-2">
            {withWearDead} av {NUM_BLOCKS} blocks utbrent
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <button
          onClick={() => doBurst(20)}
          disabled={running}
          className="rounded-md bg-brand text-brand-foreground px-3 py-1.5 text-sm hover:bg-brand/90 disabled:opacity-50"
        >
          +20 logiske writes
        </button>
        <button
          onClick={autoRun}
          disabled={running}
          className="rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50 inline-flex items-center gap-1"
        >
          <Play className="h-3.5 w-3.5" /> Kjør 400 writes
        </button>
        <button
          onClick={reset}
          className="rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent inline-flex items-center gap-1"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Nullstill
        </button>
        <span className="text-xs text-muted-foreground ml-auto">
          Totalt {writesDone} writes utført
        </span>
      </div>

      <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
        <strong className="text-amber-600 dark:text-amber-400">Hvorfor det betyr noe.</strong>{" "}
        Et OS lagrer ofte de samme logiske blokkene om og om igjen (filsystem-metadata, journal,
        swap). Uten wear leveling ville disse fysisk slitt ut noen få NAND-blocks, og hele
        disken er ubrukelig selv om 99 % av cellene er ferske. SSD-controlleren skjuler dette ved
        å mappe logiske LBA-er om til fysiske blocks dynamisk — derfor er FTL (Flash Translation
        Layer) hjertet i enhver SSD.
      </div>
    </div>
  );
}
