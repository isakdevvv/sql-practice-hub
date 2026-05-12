import { useMemo, useState } from "react";

function parseIp(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let val = 0;
  for (const p of parts) {
    const n = Number(p);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    val = (val << 8) | n;
  }
  return val >>> 0;
}

function ipToString(val: number): string {
  return [(val >>> 24) & 0xff, (val >>> 16) & 0xff, (val >>> 8) & 0xff, val & 0xff].join(".");
}

function ipToBinary(val: number): string {
  return [(val >>> 24) & 0xff, (val >>> 16) & 0xff, (val >>> 8) & 0xff, val & 0xff]
    .map((b) => b.toString(2).padStart(8, "0"))
    .join(".");
}

function parseCidr(input: string): { ip: number; prefix: number } | null {
  const m = input.match(/^([\d.]+)\/(\d+)$/);
  if (!m) return null;
  const ip = parseIp(m[1]);
  const prefix = Number(m[2]);
  if (ip == null || prefix < 0 || prefix > 32) return null;
  return { ip, prefix };
}

function computeSubnet(ip: number, prefix: number) {
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const total = 2 ** (32 - prefix);
  const usable = total > 2 ? total - 2 : total;
  const first = prefix < 31 ? network + 1 : network;
  const last = prefix < 31 ? broadcast - 1 : broadcast;
  return { mask, network, broadcast, total, usable, first, last };
}

export function SubnetCalculator() {
  const [input, setInput] = useState("192.168.1.130/26");
  const parsed = useMemo(() => parseCidr(input), [input]);
  const calc = useMemo(() => (parsed ? computeSubnet(parsed.ip, parsed.prefix) : null), [parsed]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div>
        <label className="text-xs text-muted-foreground">CIDR (f.eks. 10.0.0.5/24)</label>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="block font-mono text-base w-full bg-background border border-border rounded-md px-3 py-2 mt-1"
          placeholder="192.168.1.130/26"
        />
      </div>

      {!parsed && <p className="text-xs text-amber-600 dark:text-amber-400">Ugyldig CIDR. Format: a.b.c.d/N (0 ≤ N ≤ 32).</p>}

      {parsed && calc && (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <Card label="Subnet-maske" mono>{ipToString(calc.mask)}</Card>
            <Card label="Maske (oktett)" mono>/{parsed.prefix} ({Array(parsed.prefix).fill("1").join("").padEnd(32, "0").match(/.{8}/g)!.map((o) => parseInt(o, 2)).join(".")})</Card>
            <Card label="Network address" mono>{ipToString(calc.network)}</Card>
            <Card label="Broadcast address" mono>{ipToString(calc.broadcast)}</Card>
            <Card label="Første brukbare IP" mono>{ipToString(calc.first)}</Card>
            <Card label="Siste brukbare IP" mono>{ipToString(calc.last)}</Card>
            <Card label="Antall IP-er totalt">{calc.total.toLocaleString("nb-NO")}</Card>
            <Card label="Antall brukbare host-er">{calc.usable.toLocaleString("nb-NO")}</Card>
          </div>

          <div className="rounded-lg border border-dashed border-border p-3 bg-muted/30">
            <div className="text-xs text-muted-foreground mb-2">Binær representasjon</div>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex gap-2">
                <span className="w-20 text-muted-foreground">IP</span>
                <span>{ipToBinary(parsed.ip)}</span>
              </div>
              <div className="flex gap-2">
                <span className="w-20 text-muted-foreground">Maske</span>
                <span>{ipToBinary(calc.mask)}</span>
              </div>
              <div className="flex gap-2 text-brand">
                <span className="w-20 text-muted-foreground">Network</span>
                <span>{ipToBinary(calc.network)}</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 leading-snug">
              Network = IP AND Maske. Alt etter prefix-grensen er host-bits og settes til 0.
              Broadcast har alle host-bits 1.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ label, mono, children }: { label: string; mono?: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={mono ? "font-mono text-sm font-semibold text-brand" : "text-sm font-semibold"}>
        {children}
      </div>
    </div>
  );
}
