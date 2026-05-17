// ---------------------------------------------------------------------------
// StorageCompare — sammenligning HDD / SATA-SSD / NVMe / Optane / RAM på
// realistiske dimensjoner. Vi viser et logaritmisk diagram av latency og en
// tabell med typiske tall.
// ---------------------------------------------------------------------------

type Tech = {
  name: string;
  randomLatencyNs: number; // 4 KB random read
  seqMBs: number; // sequential throughput
  iops: number; // 4 KB random IOPS
  enduranceTBW: string; // for SSD-typer
  pricePerGB: string;
  bus: string;
  color: string;
};

const TECHS: Tech[] = [
  { name: "RAM (DDR4)", randomLatencyNs: 80, seqMBs: 25000, iops: 1_000_000_000, enduranceTBW: "—", pricePerGB: "$3", bus: "memory bus", color: "rgb(34 197 94)" },
  { name: "Optane (3D XPoint)", randomLatencyNs: 10_000, seqMBs: 2500, iops: 500_000, enduranceTBW: "60 PB", pricePerGB: "$1.50", bus: "NVMe", color: "rgb(168 85 247)" },
  { name: "NVMe SSD (gen4)", randomLatencyNs: 30_000, seqMBs: 7000, iops: 1_000_000, enduranceTBW: "600 TB", pricePerGB: "$0.08", bus: "PCIe 4.0 x4", color: "rgb(59 130 246)" },
  { name: "NVMe SSD (gen3)", randomLatencyNs: 80_000, seqMBs: 3500, iops: 500_000, enduranceTBW: "300 TB", pricePerGB: "$0.07", bus: "PCIe 3.0 x4", color: "rgb(99 102 241)" },
  { name: "SATA SSD", randomLatencyNs: 100_000, seqMBs: 550, iops: 100_000, enduranceTBW: "150 TB", pricePerGB: "$0.06", bus: "SATA III", color: "rgb(234 179 8)" },
  { name: "HDD 7200 rpm", randomLatencyNs: 8_000_000, seqMBs: 200, iops: 120, enduranceTBW: "ubegrenset (mekanisk)", pricePerGB: "$0.02", bus: "SATA III", color: "rgb(239 68 68)" },
  { name: "HDD 5400 rpm (laptop)", randomLatencyNs: 12_000_000, seqMBs: 130, iops: 80, enduranceTBW: "ubegrenset", pricePerGB: "$0.02", bus: "SATA III", color: "rgb(244 114 182)" },
];

function fmtLatency(ns: number) {
  if (ns < 1_000) return `${ns} ns`;
  if (ns < 1_000_000) return `${(ns / 1_000).toFixed(1)} µs`;
  return `${(ns / 1_000_000).toFixed(1)} ms`;
}

function fmtIops(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(0)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return `${n}`;
}

export function StorageCompare() {
  // log-skala: min 10 ns (50 ns), max 100 ms (1e8 ns)
  const minLog = Math.log10(50);
  const maxLog = Math.log10(20_000_000);

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4 space-y-4">
      <div>
        <div className="text-xs text-muted-foreground mb-2">
          4 KB random read latency (log-skala) — lavere er bedre
        </div>
        <div className="space-y-1">
          {TECHS.map((t) => {
            const l = Math.log10(t.randomLatencyNs);
            const pct = ((l - minLog) / (maxLog - minLog)) * 100;
            return (
              <div key={t.name} className="grid grid-cols-[140px_1fr_80px] items-center gap-2 text-xs">
                <div className="font-mono truncate">{t.name}</div>
                <div className="relative h-5 rounded bg-muted/30 overflow-hidden">
                  <div
                    className="h-full"
                    style={{ width: `${Math.max(2, Math.min(100, pct))}%`, backgroundColor: t.color, opacity: 0.7 }}
                  />
                </div>
                <div className="font-mono text-right">{fmtLatency(t.randomLatencyNs)}</div>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Tenk over: HDD random read er ~100 000× tregere enn RAM. Det er ikke "litt
          tregere"; det er forskjellen på 1 sekund og ett døgn skalert opp.
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-muted-foreground border-b">
              <th className="py-2 pr-3">Teknologi</th>
              <th className="py-2 pr-3 text-right">Random latency</th>
              <th className="py-2 pr-3 text-right">Seq MB/s</th>
              <th className="py-2 pr-3 text-right">4K IOPS</th>
              <th className="py-2 pr-3 text-right">Endurance</th>
              <th className="py-2 pr-3 text-right">~$/GB</th>
              <th className="py-2 pr-3">Buss</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {TECHS.map((t) => (
              <tr key={t.name} className="border-b border-muted/30 hover:bg-accent/30">
                <td className="py-1.5 pr-3 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                  {t.name}
                </td>
                <td className="py-1.5 pr-3 text-right">{fmtLatency(t.randomLatencyNs)}</td>
                <td className="py-1.5 pr-3 text-right">{t.seqMBs.toLocaleString()}</td>
                <td className="py-1.5 pr-3 text-right">{fmtIops(t.iops)}</td>
                <td className="py-1.5 pr-3 text-right">{t.enduranceTBW}</td>
                <td className="py-1.5 pr-3 text-right">{t.pricePerGB}</td>
                <td className="py-1.5 pr-3 text-muted-foreground">{t.bus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border bg-muted/30 p-3 text-xs leading-relaxed">
        <strong>Hva betyr "buss" her?</strong> Selv om NAND-cellene er like, bestemmer
        bussen mye av ytelsen. SATA III tar maks ~600 MB/s og bruker AHCI-protokoll med én
        kø. NVMe over PCIe har 65 535 køer × 65 535 kommandoer per kø — designet for
        parallell I/O. Det er hvorfor en SATA-SSD og en NVMe-SSD med samme NAND likevel
        har 10× forskjell i IOPS.
      </div>
    </div>
  );
}
