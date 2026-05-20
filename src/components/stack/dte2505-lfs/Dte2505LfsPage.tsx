import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { BookOpen, HardDrive, RotateCcw } from "lucide-react";
import { VisualDefs } from "@/components/stack/kurose-kurs/VisualDefs";
import {
  SegmentIcon,
  AppendOnlyIcon,
  ImapIcon,
  LiveDeadIcon,
  GcIcon,
  WriteAmpIcon,
  CheckpointIcon,
} from "@/components/stack/dte2505/osIcons";

type Tab = "intro" | "live";

export function Dte2505LfsPage() {
  const [tab, setTab] = useState<Tab>("intro");
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Log-structured Filesystem (LFS)</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            OSTEP kap. 43. Hvorfor noen filsystemer skriver ALT som en logg, og hvordan garbage
            collection rydder opp i etterkant. Bygger på dte2505-filsystem.
          </p>
        </header>
        <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border">
          <TabBtn
            active={tab === "intro"}
            onClick={() => setTab("intro")}
            icon={<BookOpen className="h-3.5 w-3.5" />}
          >
            0. Start her
          </TabBtn>
          <TabBtn
            active={tab === "live"}
            onClick={() => setTab("live")}
            icon={<HardDrive className="h-3.5 w-3.5" />}
          >
            1. LFS-disk live
          </TabBtn>
        </div>
        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "live" && <LfsModule />}
        <Lessons />
      </main>
    </div>
  );
}

function TabBtn({
  children,
  active,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
        active
          ? "border-brand text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function Intro({ onPick }: { onPick: (t: Tab) => void }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Bygger på</h2>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
          <li>
            <strong className="text-foreground">Filsystem-grunnlag</strong> (
            <code>dte2505-filsystem</code>): inoder, data-blokker, hvordan FFS grupperer ting på
            disken for å redusere seek-tid.
          </li>
          <li>
            <strong className="text-foreground">Lagringsmedier</strong> (
            <code>dte2505-lagring</code>): HDD-fysikk (seek + rotational delay), NAND-flash (skriv
            kun til tomme celler, må slette i blokker).
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Problemet LFS løser</h2>
        <p className="text-muted-foreground">
          Tradisjonelle filsystemer (UFS, ext2) gjør MANGE små skrivinger spredt ut over disken —
          oppdatere en inode her, en bitmap der, en data-blokk et tredje sted. På HDD er det dyrt
          fordi hver skriving krever seek (mekanisk armbevegelse).
        </p>
        <p className="text-muted-foreground mt-2">
          <strong className="text-foreground">LFS-idéen (Rosenblum 1991):</strong> buffer alle
          skrivinger i RAM. Når bufferet er fullt, skriv ALT sekvensielt til et nytt sted på disken
          — som ett stort segment. Aldri overskriv eksisterende data; gamle versjoner blir bare
          «glemt» og samles opp senere av en garbage collector.
        </p>
      </div>

      <VisualDefs
        title="Ordbok"
        items={[
          {
            term: "Segment",
            icon: <SegmentIcon />,
            body: "En stor, sammenhengende blokk på disken (typisk 1 MB). LFS skriver ALLTID et helt segment om gangen. Disken er delt opp i mange tomme og fulle segmenter.",
          },
          {
            term: "Append-only",
            icon: <AppendOnlyIcon />,
            body: "Nye data tilføyes alltid til enden av loggen. Aldri «redigere på stedet». Endringer blir nye kopier ved enden.",
          },
          {
            term: "Inode-mapping (imap)",
            icon: <ImapIcon />,
            body: "Et oppslagstabell som forteller hvor på disken hver fil-inode bor akkurat nå. Oppdateres ved hver skriving — også imap-en skrives i loggen.",
          },
          {
            term: "Live block vs dead block",
            icon: <LiveDeadIcon />,
            body: (
              <>
                En blokk er <em>live</em> hvis det fortsatt finnes en fil som peker på den. Hvis vi
                oppdaterte fila er den gamle versjonen <em>dead</em> — den ligger på disken, men
                ingen referansene.
              </>
            ),
          },
          {
            term: "Garbage collection (GC)",
            icon: <GcIcon />,
            body: "En bakgrunns-prosess som leser fulle segmenter, kopierer ut bare de live blokkene, og skriver dem til et tomt segment. Det gamle segmentet blir helt tomt og kan gjenbrukes.",
          },
          {
            term: "Write amplification",
            icon: <WriteAmpIcon />,
            body: "«Når jeg vil skrive 1 MB ekte data, hvor mye må disken faktisk skrive?» Hvis GC må flytte 9 MB live data for hver 1 MB ny = 10x write amplification. SSD-er bryr seg mye om dette fordi celler har begrenset levetid.",
          },
          {
            term: "Checkpoint",
            icon: <CheckpointIcon />,
            body: "Et stabilt punkt der hele FS-strukturen kan rekonstrueres fra disken. Hvis maskinen kræsjer mellom checkpoints, kan vi spille av loggen fra siste checkpoint og fram til siste komplette segment.",
          },
        ]}
      />

      <div className="flex gap-2">
        <Button size="sm" onClick={() => onPick("live")}>
          Start på modul 1 →
        </Button>
      </div>
    </div>
  );
}

// MODULE: visualiser LFS-disk med segmenter
type Block = { type: "tom" | "live" | "dead"; file?: string };
const TOTAL_SEGMENTS = 6;
const BLOCKS_PER_SEG = 8;

function LfsModule() {
  const [disk, setDisk] = useState<Block[][]>(() =>
    Array.from({ length: TOTAL_SEGMENTS }, () => Array(BLOCKS_PER_SEG).fill({ type: "tom" })),
  );
  const [writePtr, setWritePtr] = useState<[number, number]>([0, 0]);
  const [log, setLog] = useState<string[]>([]);
  const [files, setFiles] = useState<Record<string, [number, number]>>({});

  function append(blocks: { file: string }[]) {
    setDisk((prev) => {
      const next = prev.map((s) => s.map((b) => ({ ...b })));
      let [s, b] = writePtr;
      const newLog: string[] = [];
      const newFiles = { ...files };
      for (const { file } of blocks) {
        // Mark old version dead
        if (newFiles[file]) {
          const [os, ob] = newFiles[file];
          if (next[os][ob].type === "live") next[os][ob] = { type: "dead", file };
        }
        next[s][b] = { type: "live", file };
        newFiles[file] = [s, b];
        newLog.push(`Skrev ${file} til segment ${s}, blokk ${b}`);
        b++;
        if (b >= BLOCKS_PER_SEG) {
          s++;
          b = 0;
        }
        if (s >= TOTAL_SEGMENTS) {
          s = 0;
        }
      }
      setWritePtr([s, b]);
      setFiles(newFiles);
      setLog((prev) => [...prev, ...newLog].slice(-12));
      return next;
    });
  }

  function gc() {
    setDisk((prev) => {
      const next = prev.map((s) => s.map((b) => ({ ...b })));
      const newLog: string[] = [];
      // Finn segment med flest dead blocks
      let bestSeg = -1;
      let bestDead = 0;
      for (let i = 0; i < next.length; i++) {
        if (i === writePtr[0]) continue;
        const dead = next[i].filter((b) => b.type === "dead").length;
        const live = next[i].filter((b) => b.type === "live").length;
        if (dead > bestDead && live > 0) {
          bestDead = dead;
          bestSeg = i;
        }
        if (dead === BLOCKS_PER_SEG) {
          bestSeg = i;
          bestDead = BLOCKS_PER_SEG;
          break;
        }
      }
      if (bestSeg === -1) {
        setLog((p) => [...p, "Ingen segmenter trenger GC akkurat nå"].slice(-12));
        return prev;
      }
      const liveBlocks = next[bestSeg].filter((b) => b.type === "live");
      if (liveBlocks.length > 0) {
        // Skriv live videre til write-ptr
        let [s, b] = writePtr;
        const newFiles = { ...files };
        for (const block of liveBlocks) {
          while (next[s][b].type !== "tom") {
            b++;
            if (b >= BLOCKS_PER_SEG) {
              s++;
              b = 0;
            }
            if (s >= TOTAL_SEGMENTS) {
              s = 0;
            }
          }
          next[s][b] = { type: "live", file: block.file };
          if (block.file) newFiles[block.file] = [s, b];
          newLog.push(`GC: kopierte ${block.file} fra seg ${bestSeg} til seg ${s}`);
          b++;
        }
        setWritePtr([s, b]);
        setFiles(newFiles);
      }
      // Tøm bestSeg
      for (let i = 0; i < BLOCKS_PER_SEG; i++) next[bestSeg][i] = { type: "tom" };
      newLog.push(
        `GC: frigjorde segment ${bestSeg} (${liveBlocks.length} live flyttet, ${BLOCKS_PER_SEG - liveBlocks.length} dead slettet)`,
      );
      setLog((prev) => [...prev, ...newLog].slice(-12));
      return next;
    });
  }

  function reset() {
    setDisk(
      Array.from({ length: TOTAL_SEGMENTS }, () => Array(BLOCKS_PER_SEG).fill({ type: "tom" })),
    );
    setWritePtr([0, 0]);
    setLog([]);
    setFiles({});
  }

  const liveTotal = disk.flat().filter((b) => b.type === "live").length;
  const deadTotal = disk.flat().filter((b) => b.type === "dead").length;
  const tomTotal = disk.flat().filter((b) => b.type === "tom").length;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Eksperiment:</strong> En disk med 6 segmenter × 8
        blokker. Skriv filer (A, B, C, ...) eller oppdater eksisterende. Hver skriving går alltid
        til neste tomme blokk i logg-rekkefølge. Når en fil oppdateres blir den gamle kopien{" "}
        <em>dead</em>. Trykk GC for å rydde et segment med mange dead blokker.
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="space-y-1.5">
          {disk.map((seg, si) => (
            <div key={si} className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-16">Seg {si}</span>
              <div
                className="flex-1 grid gap-[2px]"
                style={{ gridTemplateColumns: `repeat(${BLOCKS_PER_SEG}, minmax(0, 1fr))` }}
              >
                {seg.map((b, bi) => {
                  const isWritePtr = writePtr[0] === si && writePtr[1] === bi;
                  return (
                    <div
                      key={bi}
                      className={`h-8 rounded flex items-center justify-center text-[10px] font-mono ${
                        b.type === "live"
                          ? "bg-success/30 border border-success text-foreground"
                          : b.type === "dead"
                            ? "bg-destructive/20 border border-destructive/40 text-muted-foreground line-through"
                            : "bg-muted border border-border text-muted-foreground"
                      } ${isWritePtr ? "ring-2 ring-amber-400" : ""}`}
                    >
                      {b.file ?? (isWritePtr ? "▶" : "")}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Button size="sm" onClick={() => append([{ file: "A" }, { file: "B" }])}>
            Skriv A + B
          </Button>
          <Button size="sm" onClick={() => append([{ file: "C" }, { file: "D" }, { file: "E" }])}>
            Skriv C + D + E
          </Button>
          <Button size="sm" onClick={() => append([{ file: "A" }])}>
            Oppdater A
          </Button>
          <Button size="sm" onClick={() => append([{ file: "B" }])}>
            Oppdater B
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={gc}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Kjør GC
          </Button>
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>

        <div className="mt-3 flex gap-3 text-[11px]">
          <span>
            <span className="inline-block w-2 h-2 bg-success mr-1 rounded" /> live ({liveTotal})
          </span>
          <span>
            <span className="inline-block w-2 h-2 bg-destructive/60 mr-1 rounded" /> dead (
            {deadTotal})
          </span>
          <span>
            <span className="inline-block w-2 h-2 bg-muted-foreground/40 mr-1 rounded" /> tom (
            {tomTotal})
          </span>
        </div>

        {log.length > 0 && (
          <div className="mt-3 rounded border border-border bg-background p-2 text-[11px] font-mono space-y-0.5 max-h-40 overflow-y-auto">
            {log.map((l, i) => (
              <div key={i} className="text-muted-foreground">
                {l}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Prøv:</strong> skriv A og B. Oppdater A flere ganger. Se
        hvordan gamle versjoner blir dead. Trykk GC og se segmentet med flest dead-blokker tømmes —
        live data kopieres videre til skrive-pekeren.
      </div>
    </div>
  );
}

function Lessons() {
  return (
    <section className="mt-10 space-y-3 text-sm">
      <h2 className="text-lg font-semibold">Hvorfor LFS i 2026?</h2>
      <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
        <li>
          <strong className="text-foreground">SSD-er elsker append.</strong> NAND-flash krever at en
          blokk slettes før den kan skrives på nytt. Append-only-mønsteret i LFS gjør at det interne
          FTL-laget i SSD slipper å gjøre tunge merge-operasjoner.
        </li>
        <li>
          <strong className="text-foreground">Crash consistency er enklere.</strong> Du
          gjenoppretter ved å bare spille av loggen — ingen fsck som må sjekke alle
          metadata-strukturer separat.
        </li>
        <li>
          <strong className="text-foreground">Brukes i dag:</strong> NetApp WAFL, F2FS
          (Android-mobiler), BTRFS (CoW i samme familie), Apple APFS, deler av ZFS. RocksDB /
          LevelDB bygger LSM-trær på akkurat samme idé.
        </li>
        <li>
          <strong className="text-foreground">Trade-off:</strong> GC tar CPU + I/O. Hvis disken er
          nesten full er det lite tomme segmenter, og GC må flytte mye live data per nye skriving —
          write amplification eksploderer.
        </li>
      </ul>
    </section>
  );
}
