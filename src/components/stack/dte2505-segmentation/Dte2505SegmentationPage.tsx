import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { BookOpen, Layers, RotateCcw } from "lucide-react";

type Tab = "intro" | "live";

export function Dte2505SegmentationPage() {
  const [tab, setTab] = useState<Tab>("intro");
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Segmentering & ekstern fragmentering
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            OSTEP kap. 14. Hvordan et adresse-rom kan deles i logiske segmenter (kode, stack, heap)
            i stedet for ett stort blokk — og hvorfor det førte til ekstern fragmentering, som
            senere ble løst med paging.
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
            icon={<Layers className="h-3.5 w-3.5" />}
          >
            1. Allokerings-sim
          </TabBtn>
        </div>
        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "live" && <SegModule />}
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
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${active ? "border-brand text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
    >
      {icon}
      {children}
    </button>
  );
}
function Def({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-semibold text-foreground">{term}</dt>
      <dd className="text-muted-foreground mt-0.5">{children}</dd>
    </div>
  );
}

function Intro({ onPick }: { onPick: (t: Tab) => void }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Bygger på</h2>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
          <li>
            <strong className="text-foreground">Virtuelt minne basics</strong> (
            <code>dte2505-virtuelt-minne</code>): hver prosess har sitt eget virtuelle adresse-rom;
            OS-et + MMU oversetter til fysisk minne.
          </li>
          <li>
            <strong className="text-foreground">Trinn 6: C-minne</strong> (
            <code>trinn-6-c-minne</code>): du har sett at en prosess har kode, stack (vokser
            nedover) og heap (vokser oppover).
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Hvorfor segmentering?</h2>
        <p className="text-muted-foreground">
          Den naive måten å gi en prosess minne på: «her er et stort sammenhengende stykke fra
          adresse X til Y». Det er enkelt, men kaster bort plass — hvis prosessen bruker 1 MB kode +
          1 KB stack + 100 KB heap, må vi enda allokere maks-mulig størrelse (kanskje 100 MB) som
          ett stykke.
        </p>
        <p className="text-muted-foreground mt-2">
          <strong className="text-foreground">Segmentering-idéen:</strong> del prosessens virtuelle
          adresse-rom i tre (eller flere) <em>logiske</em> segmenter. Hvert segment plasseres
          separat i fysisk minne. Da kan vi tett-pakke kode, stack og heap der det er plass.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Ordbok</h2>
        <dl className="space-y-2.5 text-[13px]">
          <Def term="Segment">
            En logisk del av et adresse-rom med en spesifikk rolle: kode, stack, heap. Hvert segment
            har en base-adresse (hvor i fysisk minne det ligger) og en limit (hvor stort det er).
          </Def>
          <Def term="Base + limit-register">
            CPU-hardware har to registre per aktivt segment. Når en prosess prøver å lese virtuell
            adresse v: fysisk = base + v, og hvis v ≥ limit → segmentation fault.
          </Def>
          <Def term="Intern fragmentering">
            Plass <em>inne i</em> en allokert blokk som ikke brukes. F.eks. hvis vi alltid runder
            opp til 4 KB-sider og prosessen trenger 100 B, kaster vi 3996 B.
          </Def>
          <Def term="Ekstern fragmentering">
            Plass <em>mellom</em> allokerte blokker. Det er nok TOTALT-ledig plass, men ingen
            sammenhengende stor nok blokk. Hovedproblemet med segmentering.
          </Def>
          <Def term="First fit / Best fit / Worst fit">
            Strategier for å velge hvilken ledig blokk en ny allokering skal få:
            <ul className="list-disc pl-5 mt-1">
              <li>
                <strong>First fit</strong>: ta første ledig blokk som er stor nok. Raskt, men kan
                fragmenttere starten av minnet.
              </li>
              <li>
                <strong>Best fit</strong>: ta den minste ledige blokken som passer. Mindre slack,
                men flere små rester.
              </li>
              <li>
                <strong>Worst fit</strong>: ta den største ledige blokken. Sjelden bra.
              </li>
            </ul>
          </Def>
          <Def term="Compaction">
            Flytte alle allokerte blokker sammen for å konsolidere ledig plass i én stor blokk. Dyrt
            — krever oppdatering av alle base-registre.
          </Def>
        </dl>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onPick("live")}>
          Start på modul 1 →
        </Button>
      </div>
    </div>
  );
}

type Block = {
  id: number;
  start: number;
  size: number;
  type: "kode" | "stack" | "heap";
  pid: number;
};

function SegModule() {
  const RAM_SIZE = 64;
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [nextId, setNextId] = useState(1);
  const [nextPid, setNextPid] = useState(1);
  const [strategy, setStrategy] = useState<"first" | "best">("first");
  const [log, setLog] = useState<string[]>([]);

  function findFit(size: number, sorted: Block[]): number {
    // Sorted by start
    let prevEnd = 0;
    const gaps: { start: number; size: number }[] = [];
    for (const b of sorted) {
      if (b.start - prevEnd >= size) gaps.push({ start: prevEnd, size: b.start - prevEnd });
      prevEnd = b.start + b.size;
    }
    if (RAM_SIZE - prevEnd >= size) gaps.push({ start: prevEnd, size: RAM_SIZE - prevEnd });
    if (gaps.length === 0) return -1;
    if (strategy === "first") return gaps[0].start;
    // Best fit
    let best = gaps[0];
    for (const g of gaps) if (g.size < best.size) best = g;
    return best.start;
  }

  function allokerProsess() {
    setBlocks((prev) => {
      const sorted = [...prev].sort((a, b) => a.start - b.start);
      const kodeStart = findFit(8, sorted);
      if (kodeStart < 0) {
        setLog((p) => [...p, "❌ Ikke plass til kode-segment (8 KB)"]);
        return prev;
      }
      const next1 = [
        ...sorted,
        { id: nextId, start: kodeStart, size: 8, type: "kode" as const, pid: nextPid },
      ].sort((a, b) => a.start - b.start);
      const stackStart = findFit(4, next1);
      if (stackStart < 0) {
        setLog((p) => [...p, "❌ Ikke plass til stack-segment (4 KB)"]);
        return prev;
      }
      const next2 = [
        ...next1,
        { id: nextId + 1, start: stackStart, size: 4, type: "stack" as const, pid: nextPid },
      ].sort((a, b) => a.start - b.start);
      const heapStart = findFit(6, next2);
      if (heapStart < 0) {
        setLog((p) => [...p, "❌ Ikke plass til heap-segment (6 KB)"]);
        return prev;
      }
      const final = [
        ...next2,
        { id: nextId + 2, start: heapStart, size: 6, type: "heap" as const, pid: nextPid },
      ];
      setLog((p) =>
        [
          ...p,
          `✅ Prosess ${nextPid}: kode@${kodeStart}, stack@${stackStart}, heap@${heapStart}`,
        ].slice(-10),
      );
      setNextId(nextId + 3);
      setNextPid(nextPid + 1);
      return final;
    });
  }

  function frigjorProsess(pid: number) {
    setBlocks((prev) => prev.filter((b) => b.pid !== pid));
    setLog((p) => [...p, `🗑 Frigjorde prosess ${pid}`].slice(-10));
  }

  function reset() {
    setBlocks([]);
    setNextId(1);
    setNextPid(1);
    setLog([]);
  }

  const sorted = [...blocks].sort((a, b) => a.start - b.start);
  const usedKB = blocks.reduce((s, b) => s + b.size, 0);
  let largestGap = 0;
  let totalGap = 0;
  let prevEnd = 0;
  for (const b of sorted) {
    const gap = b.start - prevEnd;
    if (gap > largestGap) largestGap = gap;
    totalGap += gap;
    prevEnd = b.start + b.size;
  }
  const tailGap = RAM_SIZE - prevEnd;
  if (tailGap > largestGap) largestGap = tailGap;
  totalGap += tailGap;
  const pids = [...new Set(blocks.map((b) => b.pid))];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Eksperiment:</strong> 64 KB RAM. Hver prosess trenger 3
        segmenter (kode 8 KB + stack 4 KB + heap 6 KB = 18 KB totalt, men hver må være
        sammenhengende). Allokér flere prosesser, frigjør noen i tilfeldig rekkefølge, og se hvordan
        ekstern fragmentering bygger seg opp.
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Fysisk RAM (64 KB)
        </div>
        <div className="relative h-12 rounded border border-border bg-muted overflow-hidden">
          {sorted.map((b) => {
            const cls =
              b.type === "kode" ? "bg-brand" : b.type === "stack" ? "bg-amber-500" : "bg-success";
            return (
              <div
                key={b.id}
                className={`absolute top-0 bottom-0 ${cls} flex items-center justify-center text-[9px] font-mono text-white border-r border-background`}
                style={{
                  left: `${(b.start / RAM_SIZE) * 100}%`,
                  width: `${(b.size / RAM_SIZE) * 100}%`,
                }}
                title={`P${b.pid} ${b.type} @ ${b.start}-${b.start + b.size}`}
              >
                P{b.pid}.{b.type[0]}
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
          <span>
            <span className="inline-block w-2 h-2 bg-brand mr-1 rounded" /> kode
          </span>
          <span>
            <span className="inline-block w-2 h-2 bg-amber-500 mr-1 rounded" /> stack
          </span>
          <span>
            <span className="inline-block w-2 h-2 bg-success mr-1 rounded" /> heap
          </span>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3 text-xs">
          <div className="rounded border border-border p-2">
            <div className="text-muted-foreground">Brukt</div>
            <div className="font-mono font-semibold">{usedKB} KB</div>
          </div>
          <div className="rounded border border-border p-2">
            <div className="text-muted-foreground">Total ledig</div>
            <div className="font-mono font-semibold">{totalGap} KB</div>
          </div>
          <div className="rounded border border-border p-2">
            <div className="text-muted-foreground">Største ledig blokk</div>
            <div className="font-mono font-semibold">{largestGap} KB</div>
          </div>
        </div>

        {totalGap > largestGap && totalGap > 0 && (
          <div className="mt-2 rounded border border-amber-500/40 bg-amber-500/10 p-2 text-[11px]">
            <strong>Ekstern fragmentering!</strong> Du har {totalGap} KB ledig totalt, men største
            sammenhengende er bare {largestGap} KB. En ny prosess som trenger 8 KB kode kan ikke
            allokeres selv om det er nok plass.
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Button size="sm" onClick={allokerProsess}>
            + Ny prosess
          </Button>
          {pids.map((p) => (
            <Button key={p} size="sm" variant="outline" onClick={() => frigjorProsess(p)}>
              Frigjør P{p}
            </Button>
          ))}
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>

        <div className="mt-3 flex gap-2 text-xs items-center">
          <span className="text-muted-foreground">Fit-strategi:</span>
          <Button
            size="sm"
            variant={strategy === "first" ? "default" : "outline"}
            onClick={() => setStrategy("first")}
          >
            First-fit
          </Button>
          <Button
            size="sm"
            variant={strategy === "best" ? "default" : "outline"}
            onClick={() => setStrategy("best")}
          >
            Best-fit
          </Button>
        </div>

        {log.length > 0 && (
          <div className="mt-3 rounded border border-border bg-background p-2 text-[11px] font-mono space-y-0.5 max-h-32 overflow-y-auto">
            {log.map((l, i) => (
              <div key={i} className="text-muted-foreground">
                {l}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Lessons() {
  return (
    <section className="mt-10 space-y-3 text-sm">
      <h2 className="text-lg font-semibold">Hvorfor paging tok over</h2>
      <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
        <li>
          <strong className="text-foreground">Variabel størrelse = fragmentering.</strong> Segmenter
          har vilkårlig størrelse. Etter mange alloc/free får du «sveitserost-minne».
        </li>
        <li>
          <strong className="text-foreground">Paging fikser dette</strong> ved å bruke{" "}
          <em>like store</em> 4 KB-sider. Da kan enhver ny side puttes hvor som helst — null ekstern
          fragmentering. Litt intern (avrunding), men mye mindre totalt problem.
        </li>
        <li>
          <strong className="text-foreground">Hybrid:</strong> moderne x86 har både segmentering OG
          paging. Linux bruker enkle flate segmenter (alt fra 0 til 2^32) og lar paging gjøre
          hovedjobben.
        </li>
        <li>
          Segmentering er <em>ikke</em> død — Intel kaller fortsatt sine register CS, DS, SS. Men i
          praksis brukes de bare for å markere kode/data-skille (privilegium-nivåer), ikke for
          adresse-oversetting.
        </li>
      </ul>
    </section>
  );
}
