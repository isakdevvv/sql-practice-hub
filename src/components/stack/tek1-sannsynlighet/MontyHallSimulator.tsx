import { useMemo, useState } from "react";

/**
 * MontyHallSimulator — klassisk 3-dørs gåte med Monte Carlo + animert tre.
 *
 * Brukeren velger en dør. Vert åpner en annen dør med geit. Brukeren ser
 * resultatet for begge strategier (bytte, behold). Knapper kjører N
 * simuleringer per strategi og viser vinnerprosent.
 *
 * Variant-knapper: 3 / 4 / 100 dører. Med 100 dører blir intuisjonen tydelig:
 * vert åpner 98 dører med geit, bytte gir 99% sjanse for å vinne.
 */

type Strategy = "switch" | "stay";

function simulateOnce(numDoors: number, strategy: Strategy): boolean {
  const car = Math.floor(Math.random() * numDoors);
  const firstPick = Math.floor(Math.random() * numDoors);

  // Vert åpner alle dører som verken er firstPick eller har bilen, og holder igjen ÉN
  // som ikke er firstPick. (For 3 dører: åpner én geit-dør.)
  // For å bestemme "byttet-dør": vi velger den ene gjenværende lukkede døren som ikke er firstPick.
  // Hvis car != firstPick, da må den gjenværende lukkede døren være car. Ellers tilfeldig blant non-firstPick.
  let switchedPick: number;
  if (car !== firstPick) {
    switchedPick = car;
  } else {
    // Velg en tilfeldig blant ikke-firstPick
    let r = Math.floor(Math.random() * (numDoors - 1));
    if (r >= firstPick) r += 1;
    switchedPick = r;
  }
  const finalPick = strategy === "switch" ? switchedPick : firstPick;
  return finalPick === car;
}

function runMany(n: number, doors: number, strategy: Strategy): number {
  let wins = 0;
  for (let i = 0; i < n; i++) {
    if (simulateOnce(doors, strategy)) wins++;
  }
  return wins;
}

export function MontyHallSimulator() {
  const [numDoors, setNumDoors] = useState(3);
  const [results, setResults] = useState<{ switchWins: number; stayWins: number; trials: number } | null>(null);
  const [busy, setBusy] = useState(false);

  function runSim(trials: number) {
    setBusy(true);
    // Defer to next tick so the UI can update spinner
    setTimeout(() => {
      const sw = runMany(trials, numDoors, "switch");
      const st = runMany(trials, numDoors, "stay");
      setResults({ switchWins: sw, stayWins: st, trials });
      setBusy(false);
    }, 0);
  }

  const switchTheoretical = (numDoors - 1) / numDoors;
  const stayTheoretical = 1 / numDoors;

  const treeNodes = useMemo(
    () => [
      { label: `Bilen bak din dør (${(stayTheoretical * 100).toFixed(1)} %)`, behold: "VINN", bytt: "TAP", p: stayTheoretical },
      { label: `Bilen IKKE bak din dør (${(switchTheoretical * 100).toFixed(1)} %)`, behold: "TAP", bytt: "VINN", p: switchTheoretical },
    ],
    [stayTheoretical, switchTheoretical],
  );

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">Antall dører:</span>
        {[3, 4, 10, 100].map((n) => (
          <button
            key={n}
            onClick={() => {
              setNumDoors(n);
              setResults(null);
            }}
            className={`px-3 py-1 rounded-md text-xs border transition-colors ${
              numDoors === n
                ? "border-brand bg-brand/10 text-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-background p-4">
        <div className="text-xs font-semibold mb-2">Sannsynlighetstreet</div>
        <div className="space-y-2">
          {treeNodes.map((tn, i) => (
            <div key={i} className="grid grid-cols-[1fr_120px_120px] gap-3 items-center text-xs">
              <div className="font-mono">
                <span className="text-muted-foreground">p={tn.p.toFixed(3)} ·</span> {tn.label}
              </div>
              <div className="text-center">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Behold</div>
                <span className={`font-bold font-mono ${tn.behold === "VINN" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {tn.behold}
                </span>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Bytt</div>
                <span className={`font-bold font-mono ${tn.bytt === "VINN" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {tn.bytt}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-md border border-border p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Teoretisk — behold</div>
            <div className="font-mono font-bold text-lg tabular-nums">{(stayTheoretical * 100).toFixed(2)} %</div>
          </div>
          <div className="rounded-md border border-emerald-500/40 bg-emerald-500/5 p-2">
            <div className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Teoretisk — bytt</div>
            <div className="font-mono font-bold text-lg tabular-nums text-emerald-700 dark:text-emerald-400">
              {(switchTheoretical * 100).toFixed(2)} %
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">Kjør Monte Carlo:</span>
        {[100, 1000, 10000].map((n) => (
          <button
            key={n}
            disabled={busy}
            onClick={() => runSim(n)}
            className="px-3 py-1 rounded-md text-xs border border-border bg-background hover:bg-muted/50 transition-colors disabled:opacity-50"
          >
            {n.toLocaleString("nb-NO")} runder × 2
          </button>
        ))}
      </div>

      {results && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Behold ({results.trials.toLocaleString("nb-NO")} runder)
            </div>
            <div className="font-mono text-2xl font-bold tabular-nums">
              {((results.stayWins / results.trials) * 100).toFixed(2)} %
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">
              {results.stayWins} vinn / {results.trials}
            </div>
            <div className="h-2 mt-2 rounded-full bg-muted overflow-hidden border border-border">
              <div className="h-full bg-muted-foreground" style={{ width: `${(results.stayWins / results.trials) * 100}%` }} />
            </div>
          </div>
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3">
            <div className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
              Bytt ({results.trials.toLocaleString("nb-NO")} runder)
            </div>
            <div className="font-mono text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
              {((results.switchWins / results.trials) * 100).toFixed(2)} %
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">
              {results.switchWins} vinn / {results.trials}
            </div>
            <div className="h-2 mt-2 rounded-full bg-muted overflow-hidden border border-border">
              <div className="h-full bg-emerald-500" style={{ width: `${(results.switchWins / results.trials) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      <div className="rounded-md border border-brand/30 bg-brand/5 p-3 text-[11px] leading-relaxed">
        <strong>Hvorfor virker dette?</strong> Sjansen for at du gjettet riktig i førstevalget er 1/{numDoors}.
        Vert åpner alle øvrige geite-dører, så all den gjenværende sannsynligheten (
        {((numDoors - 1) / numDoors * 100).toFixed(1)} %) konsentreres på den ene døren du KAN bytte til. Med
        100 dører blir effekten ekstrem — bytte vinner i 99 % av tilfellene.
      </div>
    </div>
  );
}
