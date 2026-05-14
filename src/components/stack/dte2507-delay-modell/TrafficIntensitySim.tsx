import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { Slider } from "@/components/ui/slider";

/**
 * Trafikkintensitet ρ = L·a / R (Kurose & Ross s. 39).
 *  L = pakkestørrelse (bits)
 *  a = ankomstrate (pakker/s)
 *  R = link-rate (bits/s)
 *
 * Når ρ → 1: køens forventede ventetid eksploderer (M/M/1-formel som referanse).
 * Boka skriver: "Design your system so that the traffic intensity is no greater than 1."
 */

export function TrafficIntensitySim() {
  const [L] = useState(12000); // bits
  const [R] = useState(100_000_000); // bps
  const [aRel, setARel] = useState(0.6); // relativ ankomstrate som andel av R/L → setter ρ direkte

  // ρ = (L*a)/R, så vi kan velge ρ direkte og avlede a
  const rho = aRel; // direkte styring
  const a = (rho * R) / L; // pakker/s

  // M/M/1-tilnærming: gj.snittlig antall i kø ~ ρ^2 / (1-ρ). Gjør pen kurve.
  function avgInQueue(p: number): number {
    if (p >= 0.999) return 1000;
    return (p * p) / (1 - p);
  }

  const data = useMemo(() => {
    const out: Array<{ rho: number; q: number }> = [];
    for (let i = 0; i <= 99; i++) {
      const p = i / 100;
      out.push({ rho: p, q: Math.min(50, avgInQueue(p)) });
    }
    return out;
  }, []);

  const status =
    rho < 0.5
      ? { color: "text-emerald-600", label: "Trygg sone — kø er liten" }
      : rho < 0.8
        ? { color: "text-amber-600", label: "Begynner å vokse" }
        : rho < 0.95
          ? { color: "text-orange-600", label: "Køen vokser raskt" }
          : { color: "text-red-600", label: "Køen eksploderer" };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Trafikkintensitet ρ = La/R og kø-eksplosjon
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_240px]">
        <div className="h-[260px] p-3 bg-background">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 12, bottom: 24, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="rho"
                type="number"
                domain={[0, 1]}
                tickFormatter={(v) => v.toFixed(2)}
                label={{ value: "ρ = La / R", position: "insideBottom", offset: -16, fontSize: 11 }}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                domain={[0, 50]}
                label={{
                  value: "gj.snitt antall i kø",
                  angle: -90,
                  position: "insideLeft",
                  offset: 12,
                  fontSize: 11,
                }}
                tick={{ fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{ fontSize: 11 }}
                formatter={(v: number) => [v.toFixed(2), "kø"]}
              />
              <ReferenceLine
                x={rho}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{ value: `ρ = ${rho.toFixed(2)}`, fontSize: 10, fill: "#ef4444" }}
              />
              <Line
                type="monotone"
                dataKey="q"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <aside className="border-t md:border-t-0 md:border-l border-border bg-background p-4 text-sm space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono text-brand">ρ (trafikkintensitet)</span>
              <span className="font-mono">{rho.toFixed(2)}</span>
            </div>
            <Slider
              min={0}
              max={0.99}
              step={0.01}
              value={[aRel]}
              onValueChange={(v) => setARel(v[0])}
            />
          </div>
          <div className="rounded-md border border-border bg-muted/20 p-2 text-[11px] space-y-1">
            <div>
              <span className="text-muted-foreground">L = </span>
              <span className="font-mono">{L / 8} byte</span>
            </div>
            <div>
              <span className="text-muted-foreground">R = </span>
              <span className="font-mono">{(R / 1e6).toFixed(0)} Mbps</span>
            </div>
            <div>
              <span className="text-muted-foreground">a = </span>
              <span className="font-mono">{a.toFixed(0)} pkt/s</span>
            </div>
          </div>
          <div className={`text-xs font-semibold ${status.color}`}>{status.label}</div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <strong>Golden rule</strong> (Kurose &amp; Ross s. 39):
            <em> Design your system so that the traffic intensity is no greater than 1.</em>{" "}
            Ved ρ &gt; 1 vokser køen <strong>uten øvre grense</strong> — eller pakker blir droppet.
          </p>
        </aside>
      </div>
    </div>
  );
}
