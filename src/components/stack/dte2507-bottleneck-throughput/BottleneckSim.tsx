import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, Server, Router, Laptop } from "lucide-react";

/**
 * Interaktiv flaskehals-simulator.
 *
 * Tre lenker i kjede:
 *   server --(R_server)--> core --(R_core)--> client
 *
 * End-to-end throughput ≈ min(R_server, R_core, R_client_access).
 *
 * Viser også hvilken lenke som er flaskehalsen, og end-to-end-tid for å
 * overføre en gitt fil F (sek = F / min(R_i)).
 */

function fmtRate(bps: number): string {
  if (bps >= 1e9) return `${(bps / 1e9).toFixed(2)} Gbps`;
  if (bps >= 1e6) return `${(bps / 1e6).toFixed(0)} Mbps`;
  if (bps >= 1e3) return `${(bps / 1e3).toFixed(0)} kbps`;
  return `${bps.toFixed(0)} bps`;
}

function fmtTime(s: number): string {
  if (s >= 3600) return `${(s / 3600).toFixed(2)} t`;
  if (s >= 60) return `${(s / 60).toFixed(1)} min`;
  if (s >= 1) return `${s.toFixed(1)} s`;
  return `${(s * 1000).toFixed(0)} ms`;
}

type Preset = {
  label: string;
  R_server: number;
  R_core: number;
  R_client: number;
  note: string;
};

const PRESETS: Preset[] = [
  {
    label: "Hjemme-fiber 2024 (typisk)",
    R_server: 10_000_000_000, // 10 Gbps server
    R_core: 100_000_000_000, // 100 Gbps core
    R_client: 100_000_000, // 100 Mbps fiber-bredbånd
    note: "Access-linken (din fiber) er bottleneck — som boka sier på s. 45.",
  },
  {
    label: "Mobil 4G (LTE)",
    R_server: 10_000_000_000,
    R_core: 100_000_000_000,
    R_client: 30_000_000,
    note: "Access er bottleneck igjen — radio-grensen avgjør.",
  },
  {
    label: "Treig nedlastings-server",
    R_server: 5_000_000,
    R_core: 100_000_000_000,
    R_client: 1_000_000_000,
    note: "Sjelden i 2024, men forekommer: server-side throttling overstyrer rask access.",
  },
  {
    label: "Mellomlenke kongestert",
    R_server: 10_000_000_000,
    R_core: 50_000_000,
    R_client: 1_000_000_000,
    note: "Backbone overbelastet (sjeldent i praksis, men teoretisk mulig).",
  },
];

export function BottleneckSim() {
  const [R_server, setR_server] = useState(10_000_000_000); // 10 Gbps
  const [R_core, setR_core] = useState(100_000_000_000); // 100 Gbps
  const [R_client, setR_client] = useState(100_000_000); // 100 Mbps
  const [fileMB, setFileMB] = useState(100); // MB

  const links = [
    { name: "R_server", value: R_server, label: "Server-link" },
    { name: "R_core", value: R_core, label: "Core / backbone" },
    { name: "R_client", value: R_client, label: "Klientens access-link" },
  ];
  const minLink = links.reduce((a, b) => (b.value < a.value ? b : a));
  const throughput = minLink.value;
  const fileBits = fileMB * 8 * 1e6; // MB -> bits
  const transferTime = fileBits / throughput;

  function applyPreset(p: Preset) {
    setR_server(p.R_server);
    setR_core(p.R_core);
    setR_client(p.R_client);
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Flaskehals-simulator
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              className="px-2 py-1 text-[11px] font-medium rounded-md border border-border bg-card hover:border-brand/40 text-foreground"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <NodeBox icon={<Server className="h-5 w-5" />} label="Server" />
          <LinkBar value={R_server} isBottleneck={minLink.name === "R_server"} />
          <NodeBox icon={<Router className="h-5 w-5" />} label="Core" />
          <LinkBar value={R_core} isBottleneck={minLink.name === "R_core"} />
          <NodeBox icon={<Router className="h-5 w-5" />} label="ISP" />
          <LinkBar value={R_client} isBottleneck={minLink.name === "R_client"} />
          <NodeBox icon={<Laptop className="h-5 w-5" />} label="Klient" />
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <SliderRow
            label="R_server"
            value={R_server}
            onChange={setR_server}
            isBottleneck={minLink.name === "R_server"}
          />
          <SliderRow
            label="R_core (backbone)"
            value={R_core}
            onChange={setR_core}
            isBottleneck={minLink.name === "R_core"}
          />
          <SliderRow
            label="R_client (access)"
            value={R_client}
            onChange={setR_client}
            isBottleneck={minLink.name === "R_client"}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-md border border-brand/30 bg-brand/5 p-3">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-brand mb-1">
              End-to-end throughput
            </div>
            <div className="font-mono text-xl text-brand">{fmtRate(throughput)}</div>
            <div className="text-[11px] text-muted-foreground mt-1">
              = min(R_server, R_core, R_client) ={" "}
              <span className="text-foreground font-medium">{minLink.label}</span>
            </div>
          </div>
          <div className="rounded-md border border-border bg-muted/20 p-3">
            <div className="flex justify-between text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
              <span>Filstørrelse</span>
              <span className="text-foreground">{fileMB} MB</span>
            </div>
            <Slider
              min={1}
              max={5000}
              step={1}
              value={[fileMB]}
              onValueChange={(v) => setFileMB(v[0])}
            />
            <div className="text-xs mt-2 leading-relaxed">
              Tid å overføre <strong>{fileMB} MB</strong>:{" "}
              <span className="font-mono text-base text-brand">{fmtTime(transferTime)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-border bg-muted/20 p-3 text-[12px] leading-relaxed">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-brand mb-1">Observasjon</div>
          <p>
            Selv om to av tre lenker har 10 Gbps eller mer, bestemmer den minste alene hele
            ratenivået. <strong>Å oppgradere en lenke som ikke er bottleneck endrer
            ingenting.</strong> Dette er bokens hovedbudskap: «throughput is the rate at which
            the bits are flowing from server to client» og det kappes ved <em>min</em>.
          </p>
        </div>
      </div>
    </div>
  );
}

function NodeBox({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-md border border-border bg-background min-w-[60px]">
      <div className="text-brand">{icon}</div>
      <div className="text-[10px] font-medium text-muted-foreground">{label}</div>
    </div>
  );
}

function LinkBar({ value, isBottleneck }: { value: number; isBottleneck: boolean }) {
  return (
    <div className="flex flex-col items-center gap-0.5 flex-1 min-w-[80px]">
      <div className="text-[10px] font-mono">
        {value >= 1e9 ? `${(value / 1e9).toFixed(0)} Gbps` : `${(value / 1e6).toFixed(0)} Mbps`}
      </div>
      <div
        className={`h-1 w-full rounded-full ${
          isBottleneck ? "bg-red-500" : "bg-emerald-500/70"
        }`}
      />
      <ArrowRight
        className={`h-3 w-3 ${isBottleneck ? "text-red-500" : "text-emerald-500/70"}`}
      />
      {isBottleneck && (
        <div className="text-[9px] uppercase tracking-wider font-semibold text-red-500">flaskehals</div>
      )}
    </div>
  );
}

function SliderRow({
  label,
  value,
  onChange,
  isBottleneck,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  isBottleneck: boolean;
}) {
  return (
    <div className={`rounded-md border p-2 ${isBottleneck ? "border-red-500/50 bg-red-500/5" : "border-border bg-background"}`}>
      <div className="flex justify-between text-[11px] mb-1">
        <span className="font-mono text-brand">{label}</span>
        <span className="font-mono">{fmtRate(value)}</span>
      </div>
      <input
        type="range"
        min={5}
        max={11}
        step={0.05}
        value={Math.log10(value)}
        onChange={(e) => onChange(Math.round(Math.pow(10, parseFloat(e.target.value))))}
        className="w-full accent-brand"
      />
      <div className="text-[9px] text-muted-foreground mt-0.5">
        {isBottleneck ? "← styrer end-to-end-raten" : "har slack — endring her gir ingen effekt"}
      </div>
    </div>
  );
}
