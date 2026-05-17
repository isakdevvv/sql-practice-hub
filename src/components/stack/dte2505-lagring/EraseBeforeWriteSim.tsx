import { useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";

// ---------------------------------------------------------------------------
// EraseBeforeWriteSim — viser hvorfor NAND-flash krever at en hel BLOCK må
// erases før noen page i den kan re-programmeres, og hvordan dette fører til
// write amplification: én logisk write (4 KB) kan trigge flytting av mange
// pages og en helt erase av en block.
//
// Modell: én block med 8 pages. Hver page er én av: empty (kan skrives),
// valid (data ligger her), stale (logisk slettet/overskrevet — men cellene
// står fortsatt programmert). Spillet: prøv å skrive page → controller
// må gjøre garbage collection når blocken er full.
// ---------------------------------------------------------------------------

type PageState = "empty" | "valid" | "stale";

type Page = {
  state: PageState;
  /** Hvilken logisk LBA pekte hit (for å vise hva som er flyttet). */
  lba?: number;
};

const PAGES_PER_BLOCK = 8;

function emptyBlock(): Page[] {
  return Array.from({ length: PAGES_PER_BLOCK }, () => ({ state: "empty" as PageState }));
}

export function EraseBeforeWriteSim() {
  const [block, setBlock] = useState<Page[]>(emptyBlock);
  const [logicalWrites, setLogicalWrites] = useState(0);
  const [physicalWrites, setPhysicalWrites] = useState(0);
  const [erases, setErases] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [nextLba, setNextLba] = useState(1);

  function addLog(line: string) {
    setLog((l) => [line, ...l].slice(0, 8));
  }

  function writeNew() {
    // 1) Marker eksisterende LBA som stale hvis lba allerede finnes (modell:
    //    bare skriv inn ny LBA hver gang for enkelhet).
    const lba = nextLba;
    setNextLba((n) => n + 1);
    setLogicalWrites((c) => c + 1);

    setBlock((prev) => {
      const next = prev.slice();
      const emptyIdx = next.findIndex((p) => p.state === "empty");
      if (emptyIdx !== -1) {
        next[emptyIdx] = { state: "valid", lba };
        setPhysicalWrites((c) => c + 1);
        addLog(`Write LBA ${lba} → page ${emptyIdx} (1× fysisk write)`);
        return next;
      }
      // Ingen ledige pages → trigger garbage collection.
      // Tell valid pages, "flytt" dem til en tom block, erase denne, skriv ny.
      const validPages = next.filter((p) => p.state === "valid").length;
      // GC: vi simulerer at controller flytter alle valid pages (det er fysisk
      // skriv også!), erases denne blocken, og skriver ny LBA inn.
      setPhysicalWrites((c) => c + validPages + 1);
      setErases((c) => c + 1);
      addLog(
        `GC trigget. Flytt ${validPages} valid pages (${validPages}× fysisk write) → erase block (1×) → write ny LBA ${lba} (1× fysisk write). Totalt ${validPages + 1}× fysisk for 1× logisk.`,
      );
      // Resultat: ny block med valid pages + den nye LBA-en.
      const fresh = emptyBlock();
      let i = 0;
      for (const p of next) {
        if (p.state === "valid") {
          fresh[i] = { state: "valid", lba: p.lba };
          i += 1;
        }
      }
      fresh[i] = { state: "valid", lba };
      return fresh;
    });
  }

  function overwriteExisting() {
    // Marker en tilfeldig valid page som stale (logisk overskrevet), skriv ny
    // page inn på neste empty.
    setBlock((prev) => {
      const next = prev.slice();
      const validIdxes = next
        .map((p, i) => (p.state === "valid" ? i : -1))
        .filter((i) => i !== -1);
      if (validIdxes.length === 0) {
        addLog("Ingenting å overskrive — gjør først noen Write new.");
        return prev;
      }
      const overwriteIdx = validIdxes[Math.floor(Math.random() * validIdxes.length)];
      const oldLba = next[overwriteIdx].lba!;
      next[overwriteIdx] = { state: "stale", lba: oldLba };

      const emptyIdx = next.findIndex((p) => p.state === "empty");
      const lba = oldLba; // samme logiske adresse, nytt fysisk sted
      setLogicalWrites((c) => c + 1);
      if (emptyIdx !== -1) {
        next[emptyIdx] = { state: "valid", lba };
        setPhysicalWrites((c) => c + 1);
        addLog(
          `Overwrite LBA ${lba}: marker gammel page som stale, skriv ny page (1× fysisk write).`,
        );
      } else {
        const validPages = next.filter((p) => p.state === "valid").length;
        setPhysicalWrites((c) => c + validPages + 1);
        setErases((c) => c + 1);
        addLog(
          `Overwrite LBA ${lba}: ingen tomme pages → GC (${validPages}× write + 1× erase + 1× write).`,
        );
        const fresh = emptyBlock();
        let i = 0;
        for (const p of next) {
          if (p.state === "valid") {
            fresh[i] = { state: "valid", lba: p.lba };
            i += 1;
          }
        }
        return fresh;
      }
      return next;
    });
  }

  function reset() {
    setBlock(emptyBlock());
    setLogicalWrites(0);
    setPhysicalWrites(0);
    setErases(0);
    setLog([]);
    setNextLba(1);
  }

  const wa = logicalWrites === 0 ? 0 : physicalWrites / logicalWrites;

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <div className="text-xs text-muted-foreground mb-2">
            NAND-block med {PAGES_PER_BLOCK} pages
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {block.map((p, i) => (
              <div
                key={i}
                className={`aspect-square rounded-md border-2 flex flex-col items-center justify-center text-xs font-mono ${
                  p.state === "empty"
                    ? "border-muted bg-muted/30 text-muted-foreground"
                    : p.state === "valid"
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 line-through opacity-70"
                }`}
              >
                <div className="text-[10px] uppercase">{p.state}</div>
                {p.lba != null && <div>LBA {p.lba}</div>}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={writeNew}
              className="rounded-md bg-brand text-brand-foreground px-3 py-1.5 text-sm hover:bg-brand/90"
            >
              Write ny LBA
            </button>
            <button
              onClick={overwriteExisting}
              className="rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent"
            >
              Overskriv eksisterende
            </button>
            <button
              onClick={reset}
              className="rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent inline-flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Nullstill
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span><span className="inline-block w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/50 align-middle mr-1" />valid</span>
            <span><span className="inline-block w-3 h-3 rounded bg-amber-500/30 border border-amber-500/50 align-middle mr-1" />stale</span>
            <span><span className="inline-block w-3 h-3 rounded bg-muted border border-muted-foreground/30 align-middle mr-1" />empty</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border bg-muted/30 p-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Logiske writes</div>
              <div className="font-mono text-lg">{logicalWrites}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Fysiske writes</div>
              <div className="font-mono text-lg">{physicalWrites}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Erase-operasjoner</div>
              <div className="font-mono text-lg">{erases}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Write amplification</div>
              <div className={`font-mono text-lg ${wa > 1.5 ? "text-amber-600 dark:text-amber-400" : ""}`}>
                {wa.toFixed(2)}×
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-3 text-xs space-y-1 min-h-[120px]">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <Trash2 className="h-3 w-3" /> Hendelseslogg
            </div>
            {log.length === 0 ? (
              <div className="text-muted-foreground italic">Ingen aktivitet ennå.</div>
            ) : (
              log.map((line, i) => (
                <div key={i} className="font-mono text-[11px] leading-snug">
                  {line}
                </div>
              ))
            )}
          </div>

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
            <strong className="text-amber-600 dark:text-amber-400">Prøv:</strong> trykk
            "Write ny LBA" til blocken er full. Trykk så én gang til — observer at WA
            spretter over 1.0. Cellene må erases blockvis fordi NAND-fysikk ikke kan
            re-programmere én enkelt page; bare hele block kan tilbakestilles til alle 1-er.
          </div>
        </div>
      </div>
    </div>
  );
}
