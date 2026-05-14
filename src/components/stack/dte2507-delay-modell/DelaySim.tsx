import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { RotateCcw } from "lucide-react";

type Preset = "lan" | "wifi" | "fiber-internet" | "geo-sat" | "custom";

const PRESETS: Record<Exclude<Preset, "custom">, {
  label: string;
  L: number; // bits
  R: number; // bits/s
  d: number; // m
  s: number; // m/s (signal-hastighet i mediet)
  dProcUs: number; // mikrosekunder
}> = {
  lan: {
    label: "LAN (Gigabit, kort kabel)",
    L: 12000, // 1500 byte
    R: 1_000_000_000,
    d: 100,
    s: 2e8,
    dProcUs: 5,
  },
  wifi: {
    label: "Hjemme-WiFi → DSL/fiber",
    L: 12000,
    R: 100_000_000,
    d: 5_000_000, // 5000 km — bredbåndsruting
    s: 2e8,
    dProcUs: 50,
  },
  "fiber-internet": {
    label: "Fiber over Atlanteren",
    L: 12000,
    R: 1_000_000_000,
    d: 6_000_000, // 6000 km undersjøisk kabel
    s: 2e8, // fiber, ~2/3 c
    dProcUs: 200,
  },
  "geo-sat": {
    label: "Geostasjonær satellitt",
    L: 12000,
    R: 50_000_000,
    d: 72_000_000, // tur-retur opp+ned (36 000 km opp + 36 000 km ned, vi viser ett ledd her som 36 000 km × 2)
    s: 3e8,
    dProcUs: 500,
  },
};

function fmtSeconds(s: number): string {
  if (s >= 1) return `${s.toFixed(3)} s`;
  if (s >= 1e-3) return `${(s * 1e3).toFixed(2)} ms`;
  if (s >= 1e-6) return `${(s * 1e6).toFixed(1)} µs`;
  return `${(s * 1e9).toFixed(0)} ns`;
}

function fmtDistance(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(0)} km`;
  return `${m.toFixed(0)} m`;
}

function fmtRate(bps: number): string {
  if (bps >= 1e9) return `${(bps / 1e9).toFixed(1)} Gbps`;
  if (bps >= 1e6) return `${(bps / 1e6).toFixed(0)} Mbps`;
  if (bps >= 1e3) return `${(bps / 1e3).toFixed(0)} kbps`;
  return `${bps.toFixed(0)} bps`;
}

export function DelaySim() {
  // Slider-tilstand
  const [L, setL] = useState(12000); // bits (1500 byte)
  const [R, setR] = useState(100_000_000); // bps (100 Mbps)
  const [d, setD] = useState(1000); // km, lagret som km for slider, konverteres
  const [s, setS] = useState(2e8); // m/s
  const [dProcUs, setDProcUs] = useState(50); // mikrosekunder

  function applyPreset(p: Exclude<Preset, "custom">) {
    const v = PRESETS[p];
    setL(v.L);
    setR(v.R);
    setD(Math.round(v.d / 1000));
    setS(v.s);
    setDProcUs(v.dProcUs);
  }

  const d_proc = dProcUs * 1e-6; // s
  const d_trans = L / R; // s
  const d_prop = (d * 1000) / s; // s (d er km, omgjør til m)
  const d_queue = 0; // settes separat i kø-modul, ikke her
  const d_nodal = d_proc + d_queue + d_trans + d_prop;

  const dominant = useMemo(() => {
    const arr = [
      { name: "d_proc", v: d_proc },
      { name: "d_trans", v: d_trans },
      { name: "d_prop", v: d_prop },
    ];
    arr.sort((a, b) => b.v - a.v);
    return arr[0].name;
  }, [d_proc, d_trans, d_prop]);

  const bars = [
    { name: "d_proc", value: d_proc, color: "bg-slate-400", label: "Prosesserings­forsinkelse" },
    { name: "d_trans", value: d_trans, color: "bg-orange-500", label: "Transmisjons­forsinkelse" },
    { name: "d_prop", value: d_prop, color: "bg-blue-500", label: "Propagasjons­forsinkelse" },
  ];
  const maxBar = Math.max(...bars.map((b) => b.value));

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Nodal-delay-bygger
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(Object.keys(PRESETS) as Array<Exclude<Preset, "custom">>).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => applyPreset(p)}
              className="px-2 py-1 text-[11px] font-medium rounded-md border border-border bg-card hover:border-brand/40 text-foreground"
            >
              {PRESETS[p].label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_280px]">
        <div className="p-4 space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono text-brand">L (frame-størrelse)</span>
              <span className="font-mono">{(L / 8).toFixed(0)} byte = {L} bits</span>
            </div>
            <Slider
              min={400}
              max={120000}
              step={400}
              value={[L]}
              onValueChange={(v) => setL(v[0])}
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono text-brand">R (link-rate)</span>
              <span className="font-mono">{fmtRate(R)}</span>
            </div>
            <input
              type="range"
              min={5}
              max={11}
              step={0.1}
              value={Math.log10(R)}
              onChange={(e) => setR(Math.round(Math.pow(10, parseFloat(e.target.value))))}
              className="w-full accent-brand"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono text-brand">d (avstand)</span>
              <span className="font-mono">{fmtDistance(d * 1000)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={5}
              step={0.05}
              value={Math.log10(Math.max(0.001, d))}
              onChange={(e) => setD(Math.pow(10, parseFloat(e.target.value)))}
              className="w-full accent-brand"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono text-brand">s (propagasjons­hastighet)</span>
              <span className="font-mono">{(s / 1e8).toFixed(2)} &times; 10^8 m/s</span>
            </div>
            <Slider
              min={1.5e8}
              max={3.0e8}
              step={1e6}
              value={[s]}
              onValueChange={(v) => setS(v[0])}
            />
            <div className="text-[10px] text-muted-foreground mt-1">
              Fiber/kobber ~2&times;10^8 m/s. Vakuum/radio = c = 3&times;10^8 m/s.
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono text-brand">d_proc (per ruter)</span>
              <span className="font-mono">{dProcUs} &micro;s</span>
            </div>
            <Slider
              min={1}
              max={1000}
              step={1}
              value={[dProcUs]}
              onValueChange={(v) => setDProcUs(v[0])}
            />
          </div>

          <button
            type="button"
            onClick={() => applyPreset("wifi")}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card hover:border-brand/40 text-[11px] font-medium px-2.5 py-1.5"
          >
            <RotateCcw className="h-3 w-3" /> Reset til hjemme-WiFi
          </button>
        </div>

        <aside className="border-t md:border-t-0 md:border-l border-border bg-background p-4 text-sm">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Sammensetning
          </div>
          <div className="space-y-2">
            {bars.map((b) => (
              <div key={b.name}>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="font-mono text-foreground">{b.name}</span>
                  <span className="font-mono">{fmtSeconds(b.value)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full ${b.color}`}
                    style={{ width: `${maxBar === 0 ? 0 : (b.value / maxBar) * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{b.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs">
            <div className="font-semibold text-brand">d_nodal</div>
            <div className="font-mono text-base">{fmtSeconds(d_nodal)}</div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Dominerende ledd: <span className="font-mono text-foreground">{dominant}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
