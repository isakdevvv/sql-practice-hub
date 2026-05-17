import { useMemo, useState } from "react";

// ---------------------------------------------------------------------------
// RandomVsSeqBench — interaktiv benchmark som lar brukeren se hvorfor random
// I/O straffer HDD så voldsomt, og hvorfor SSD/NVMe nesten ikke bryr seg.
//
// Modell: brukeren velger workload (random vs sequential), blokk-størrelse,
// antall ops, og disk. Vi regner ut estimert total tid med en enkel modell:
//   total = ops × (latency_per_op + block_size / throughput)
// hvor latency_per_op er stor for HDD-random (seek + rot), liten for HDD-seq
// (~0), liten konstant for SSD random og seq.
// ---------------------------------------------------------------------------

type Disk = "hdd" | "sata-ssd" | "nvme";
const DISKS: Record<Disk, {
  label: string;
  randomLatencyMs: number;
  seqLatencyMs: number;
  throughputMBs: number;
}> = {
  hdd: { label: "HDD 7200 rpm", randomLatencyMs: 12, seqLatencyMs: 0.01, throughputMBs: 200 },
  "sata-ssd": { label: "SATA SSD", randomLatencyMs: 0.1, seqLatencyMs: 0.05, throughputMBs: 550 },
  nvme: { label: "NVMe gen4 SSD", randomLatencyMs: 0.05, seqLatencyMs: 0.01, throughputMBs: 7000 },
};

function estimate(disk: Disk, random: boolean, blockKB: number, ops: number) {
  const d = DISKS[disk];
  const latency = random ? d.randomLatencyMs : d.seqLatencyMs;
  const transferMs = (blockKB / 1024) / d.throughputMBs * 1000; // MB / (MB/s) → s → ms
  return ops * (latency + transferMs);
}

function fmtTime(ms: number) {
  if (ms < 1) return `${(ms * 1000).toFixed(1)} µs`;
  if (ms < 1000) return `${ms.toFixed(2)} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(2)} s`;
  return `${(ms / 60_000).toFixed(1)} min`;
}

export function RandomVsSeqBench() {
  const [blockKB, setBlockKB] = useState(4);
  const [ops, setOps] = useState(10_000);
  const [disk, setDisk] = useState<Disk>("hdd");

  const randomMs = useMemo(() => estimate(disk, true, blockKB, ops), [disk, blockKB, ops]);
  const seqMs = useMemo(() => estimate(disk, false, blockKB, ops), [disk, blockKB, ops]);
  const ratio = seqMs === 0 ? 1 : randomMs / seqMs;

  // Visualisering: to horisontale stolper for random og sequential, lengde proporsjonal
  // til log(time) slik at HDD-random ikke sprenger skalaen.
  const maxLog = Math.log10(Math.max(randomMs, seqMs, 1) + 1);

  function barPct(ms: number) {
    return (Math.log10(ms + 1) / maxLog) * 100;
  }

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
        <div>
          <label className="block font-medium mb-1">Disk</label>
          <select
            value={disk}
            onChange={(e) => setDisk(e.target.value as Disk)}
            className="w-full rounded-md border bg-card px-2 py-1.5"
          >
            {(Object.keys(DISKS) as Disk[]).map((d) => (
              <option key={d} value={d}>{DISKS[d].label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">
            Blokk-størrelse: <span className="font-mono text-brand">{blockKB} KB</span>
          </label>
          <input
            type="range"
            min={4}
            max={1024}
            step={4}
            value={blockKB}
            onChange={(e) => setBlockKB(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">
            Antall ops: <span className="font-mono text-brand">{ops.toLocaleString()}</span>
          </label>
          <input
            type="range"
            min={1000}
            max={1_000_000}
            step={1000}
            value={ops}
            onChange={(e) => setOps(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-2">
        <BenchBar label="Random" pct={barPct(randomMs)} time={fmtTime(randomMs)} color="rgb(239 68 68)" />
        <BenchBar label="Sequential" pct={barPct(seqMs)} time={fmtTime(seqMs)} color="rgb(34 197 94)" />
      </div>

      <div className="mt-4 rounded-lg border bg-muted/30 p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Random/Sequential ratio</span>
          <span className={`font-mono font-semibold ${ratio > 100 ? "text-destructive" : ratio > 5 ? "text-amber-600 dark:text-amber-400" : "text-success"}`}>
            {ratio.toFixed(1)}×
          </span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Sammenlign HDD vs NVMe på 4 KB / 10 000 ops:
          HDD-random kan være {">"}1000× tregere enn HDD-seq, mens NVMe-random er bare 2–5× tregere
          enn NVMe-seq. Bruker DBMS-design dette? Ja — derfor klustrer InnoDB rader på
          primær-nøkkel: sekvensiell adgang per primær-nøkkel er nesten gratis selv på HDD.
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-3 text-xs">
        <strong className="text-brand">Eksperiment-tips.</strong>{" "}
        Sett blokk-størrelse til 1024 KB (1 MB). Forskjellen mellom random og seq krymper —
        fordi transfer-tiden begynner å dominere over latency-tiden. Det er hvorfor
        databaser med store sekvensielle reads (full table scan) ofte er overraskende
        raske selv på HDD, mens index-traversal med små random reads er helt umulig.
      </div>
    </div>
  );
}

function BenchBar({ label, pct, time, color }: { label: string; pct: number; time: string; color: string }) {
  return (
    <div className="grid grid-cols-[100px_1fr_100px] items-center gap-2 text-xs">
      <div className="font-medium">{label}</div>
      <div className="relative h-5 rounded bg-muted/30 overflow-hidden">
        <div
          className="h-full transition-all"
          style={{ width: `${Math.max(2, Math.min(100, pct))}%`, backgroundColor: color, opacity: 0.75 }}
        />
      </div>
      <div className="font-mono text-right">{time}</div>
    </div>
  );
}
