import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Send, Wifi } from "lucide-react";

// Levende seksjon 6.4 — Switched LAN: switch self-learning + VLAN
//
// Vi tegner én switch i midten med 4 porter, og 4 hosts rundt. Brukeren kan:
//   1) Velge sender + mottaker, trykke "Send" → en ramme reiser inn på en port,
//      switchen lærer Src-MAC ↔ port, slår opp Dst-MAC, og enten flooder eller
//      forwarder unicast.
//   2) Toggle VLAN-modus: nå er hostene fordelt på to VLAN. Selv om to host
//      sitter på "samme" switch, må trafikken matche VLAN-ID, ellers droppes.
//
// Vi viser MAC-tabellen som en levende tabell og høydepunkter porten som lærer.

type HostId = "h1" | "h2" | "h3" | "h4";

type Host = {
  id: HostId;
  label: string;
  mac: string;
  port: number; // 1..4 — hvilken switch-port hosten henger på
  vlan: 10 | 20; // VLAN-ID
  x: number;
  y: number;
};

const HOSTS: Host[] = [
  { id: "h1", label: "A", mac: "AA:01", port: 1, vlan: 10, x: 100, y: 80 },
  { id: "h2", label: "B", mac: "BB:02", port: 2, vlan: 10, x: 700, y: 80 },
  { id: "h3", label: "C", mac: "CC:03", port: 3, vlan: 20, x: 100, y: 340 },
  { id: "h4", label: "D", mac: "DD:04", port: 4, vlan: 20, x: 700, y: 340 },
];

// Switch-geometri
const SW_X = 400;
const SW_Y = 210;
const SW_W = 240;
const SW_H = 140;

const PORTS: { id: number; x: number; y: number; side: "L" | "R" | "T" | "B" }[] = [
  { id: 1, x: SW_X - SW_W / 2, y: SW_Y - 35, side: "L" },
  { id: 2, x: SW_X + SW_W / 2, y: SW_Y - 35, side: "R" },
  { id: 3, x: SW_X - SW_W / 2, y: SW_Y + 35, side: "L" },
  { id: 4, x: SW_X + SW_W / 2, y: SW_Y + 35, side: "R" },
];

type MacEntry = { mac: string; port: number; vlan: 10 | 20; expiresAt: number };

type Phase =
  | { kind: "idle" }
  | { kind: "ingress"; from: HostId; to: HostId; t0: number }
  | { kind: "learn"; from: HostId; to: HostId; t0: number }
  | { kind: "lookup"; from: HostId; to: HostId; t0: number; floodPorts: number[] }
  | { kind: "egress"; from: HostId; to: HostId; t0: number; floodPorts: number[]; vlanDrop: boolean };

const STEP_DURATION = 1100; // ms per fase

export function Section64Live() {
  const [table, setTable] = useState<MacEntry[]>([]);
  const [vlanMode, setVlanMode] = useState(false);
  const [from, setFrom] = useState<HostId>("h1");
  const [to, setTo] = useState<HostId>("h2");
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [t, setT] = useState(0);
  const [logs, setLogs] = useState<{ msg: string; kind: "info" | "ok" | "warn" }[]>([]);
  const [playing, setPlaying] = useState(false);
  const phaseTimer = useRef<number | null>(null);

  const fromHost = HOSTS.find((h) => h.id === from)!;
  const toHost = HOSTS.find((h) => h.id === to)!;

  useEffect(() => {
    if (!playing || phase.kind === "idle") return;
    let raf: number;
    const start = performance.now() - t * 1000;
    function tick(now: number) {
      const dt = now - start;
      setT(dt / 1000);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, phase.kind]);

  function pushLog(msg: string, kind: "info" | "ok" | "warn" = "info") {
    setLogs((prev) => [{ msg, kind }, ...prev].slice(0, 12));
  }

  function startTransmission() {
    if (from === to) return;
    if (phaseTimer.current) clearTimeout(phaseTimer.current);
    setT(0);

    const fHost = HOSTS.find((h) => h.id === from)!;
    const tHost = HOSTS.find((h) => h.id === to)!;

    pushLog(`Host ${fHost.label} sender ramme → ${tHost.label} (mac ${tHost.mac})`, "info");

    // Sjekk VLAN-isolering
    const vlanDrop = vlanMode && fHost.vlan !== tHost.vlan;
    if (vlanDrop) {
      pushLog(
        `VLAN-isolering: ${fHost.label} på VLAN${fHost.vlan}, ${tHost.label} på VLAN${tHost.vlan}`,
        "warn",
      );
    }

    setPhase({ kind: "ingress", from, to, t0: 0 });
    setPlaying(true);

    // Sekvens: ingress → learn → lookup → egress
    const t1 = STEP_DURATION;
    const t2 = STEP_DURATION * 2;
    const t3 = STEP_DURATION * 3;

    setTimeout(() => {
      // LEARN: legg til/oppdater Src-MAC i tabellen
      setTable((prev) => {
        const filtered = prev.filter((e) => e.mac !== fHost.mac);
        const entry: MacEntry = {
          mac: fHost.mac,
          port: fHost.port,
          vlan: fHost.vlan,
          expiresAt: Date.now() + 60_000,
        };
        return [...filtered, entry];
      });
      pushLog(
        `LÆRER: ${fHost.mac} sitter på port ${fHost.port}${vlanMode ? ` (VLAN${fHost.vlan})` : ""}`,
        "ok",
      );
      setPhase({ kind: "learn", from, to, t0: t1 / 1000 });
    }, t1);

    setTimeout(() => {
      // LOOKUP: prøv å finne Dst-MAC
      setTable((current) => {
        const hit = current.find(
          (e) => e.mac === tHost.mac && (!vlanMode || e.vlan === fHost.vlan),
        );
        let floodPorts: number[] = [];
        if (vlanDrop) {
          // I VLAN-modus med mismatch: switchen vil rett og slett ikke ha en VLAN-bro
          // og rammen blir aldri sett av andre VLAN-er.
          floodPorts = [];
          pushLog(`VLAN-mismatch — ingen forwarding`, "warn");
        } else if (hit) {
          floodPorts = [hit.port];
          pushLog(`OPPSLAG: ${tHost.mac} finnes → unicast til port ${hit.port}`, "ok");
        } else {
          // Flood til alle porter (i samme VLAN hvis vlanMode) bortsett fra inn-porten
          floodPorts = HOSTS.filter(
            (h) => h.port !== fHost.port && (!vlanMode || h.vlan === fHost.vlan),
          ).map((h) => h.port);
          pushLog(
            `OPPSLAG: ${tHost.mac} ukjent → FLOOD til port ${floodPorts.join(", ") || "(ingen)"}`,
            "warn",
          );
        }
        setPhase({ kind: "lookup", from, to, t0: t2 / 1000, floodPorts });
        return current;
      });
    }, t2);

    setTimeout(() => {
      setPhase((p) =>
        p.kind === "lookup"
          ? { kind: "egress", from, to, t0: t3 / 1000, floodPorts: p.floodPorts, vlanDrop }
          : p,
      );
    }, t3);

    setTimeout(() => {
      setPhase({ kind: "idle" });
      setPlaying(false);
      setT(0);
    }, t3 + STEP_DURATION);
  }

  function resetAll() {
    if (phaseTimer.current) clearTimeout(phaseTimer.current);
    setTable([]);
    setPhase({ kind: "idle" });
    setPlaying(false);
    setT(0);
    setLogs([]);
  }

  // Visualiser ramme-progresjon
  const frameProgress = useMemo(() => {
    if (phase.kind === "idle") return 0;
    const dt = t - phase.t0;
    return Math.max(0, Math.min(1, dt / (STEP_DURATION / 1000)));
  }, [phase, t]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <span className="font-medium text-foreground">
          Switch self-learning + VLAN — send en ramme og følg den gjennom switchen
        </span>
      </div>

      {/* Kontroll-strip */}
      <div className="px-4 py-2 border-b border-border bg-muted/10 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Fra:</span>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value as HostId)}
            className="rounded border border-border bg-background px-2 py-1 text-xs"
          >
            {HOSTS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.label} ({h.mac}) {vlanMode ? `· VLAN${h.vlan}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Til:</span>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value as HostId)}
            className="rounded border border-border bg-background px-2 py-1 text-xs"
          >
            {HOSTS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.label} ({h.mac}) {vlanMode ? `· VLAN${h.vlan}` : ""}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={startTransmission}
          disabled={phase.kind !== "idle" || from === to}
          className="inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 px-2 py-1 text-xs font-medium hover:bg-brand/20 disabled:opacity-40"
        >
          {phase.kind === "idle" ? <Send className="h-3 w-3" /> : <Play className="h-3 w-3 animate-pulse" />}
          {phase.kind === "idle" ? "Send ramme" : "Sender …"}
        </button>
        <label className="inline-flex items-center gap-1.5 ml-auto">
          <input
            type="checkbox"
            checked={vlanMode}
            onChange={(e) => {
              setVlanMode(e.target.checked);
              setTable([]);
              setPhase({ kind: "idle" });
              setLogs([
                {
                  msg: e.target.checked
                    ? "VLAN-modus PÅ: A,B på VLAN10 · C,D på VLAN20"
                    : "VLAN-modus AV — én flat broadcast-domene",
                  kind: "info",
                },
              ]);
            }}
            className="rounded border-border"
          />
          <span className="text-muted-foreground">VLAN-modus (A,B=10 · C,D=20)</span>
        </label>
        <button
          onClick={resetAll}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
        >
          <RotateCcw className="h-3 w-3" /> Nullstill
        </button>
      </div>

      {/* Hovedvisualisering */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px]">
        <svg viewBox="0 0 800 420" className="w-full h-auto bg-muted/5">
          {/* Switch boks */}
          <rect
            x={SW_X - SW_W / 2}
            y={SW_Y - SW_H / 2}
            width={SW_W}
            height={SW_H}
            rx={8}
            className="fill-card stroke-brand"
            strokeWidth={2}
          />
          <text x={SW_X} y={SW_Y - 30} textAnchor="middle" className="fill-foreground text-[14px] font-bold">
            SWITCH
          </text>
          <text x={SW_X} y={SW_Y - 14} textAnchor="middle" className="fill-muted-foreground text-[10px]">
            self-learning bridge
          </text>
          {vlanMode && (
            <>
              <line
                x1={SW_X - SW_W / 2 + 8}
                y1={SW_Y}
                x2={SW_X + SW_W / 2 - 8}
                y2={SW_Y}
                strokeDasharray="3 3"
                className="stroke-muted-foreground/50"
              />
              <text
                x={SW_X}
                y={SW_Y - 2}
                textAnchor="middle"
                className="fill-muted-foreground text-[9px]"
              >
                VLAN10 isolert fra VLAN20
              </text>
            </>
          )}

          {/* Porter */}
          {PORTS.map((p) => {
            const host = HOSTS.find((h) => h.port === p.id)!;
            const isFlooded =
              (phase.kind === "lookup" || phase.kind === "egress") &&
              (phase as { floodPorts: number[] }).floodPorts.includes(p.id);
            const isIngress = (phase.kind !== "idle") && p.id === fromHost.port;
            return (
              <g key={p.id}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={6}
                  className={
                    isIngress
                      ? "fill-amber-500 stroke-amber-600"
                      : isFlooded
                        ? "fill-brand stroke-brand"
                        : "fill-muted stroke-muted-foreground"
                  }
                  strokeWidth={1.5}
                />
                <text
                  x={p.x + (p.side === "L" ? -10 : 10)}
                  y={p.y + 4}
                  textAnchor={p.side === "L" ? "end" : "start"}
                  className="fill-muted-foreground text-[10px] font-mono"
                >
                  P{p.id}
                </text>
                {/* Kabel-line fra port til host */}
                <line
                  x1={p.x}
                  y1={p.y}
                  x2={host.x}
                  y2={host.y}
                  className="stroke-muted-foreground/40"
                  strokeDasharray="3 3"
                />
              </g>
            );
          })}

          {/* Hosts */}
          {HOSTS.map((h) => {
            const isFrom = h.id === from;
            const isTo = h.id === to;
            const vlanColor = vlanMode ? (h.vlan === 10 ? "stroke-purple-500" : "stroke-amber-500") : "stroke-border";
            return (
              <g key={h.id}>
                <rect
                  x={h.x - 36}
                  y={h.y - 20}
                  width={72}
                  height={40}
                  rx={6}
                  className={`fill-card ${vlanColor}`}
                  strokeWidth={isFrom || isTo ? 2.5 : 1.5}
                />
                <text
                  x={h.x}
                  y={h.y - 4}
                  textAnchor="middle"
                  className="fill-foreground text-[14px] font-bold"
                >
                  {h.label}
                </text>
                <text x={h.x} y={h.y + 10} textAnchor="middle" className="fill-muted-foreground text-[9px] font-mono">
                  {h.mac}
                </text>
                {vlanMode && (
                  <text
                    x={h.x}
                    y={h.y - 26}
                    textAnchor="middle"
                    className={`text-[9px] font-mono ${
                      h.vlan === 10 ? "fill-purple-500" : "fill-amber-500"
                    }`}
                  >
                    VLAN{h.vlan}
                  </text>
                )}
              </g>
            );
          })}

          {/* Frame-animasjon */}
          {phase.kind === "ingress" && (
            <FrameOnWire
              x1={fromHost.x}
              y1={fromHost.y}
              x2={PORTS.find((p) => p.id === fromHost.port)!.x}
              y2={PORTS.find((p) => p.id === fromHost.port)!.y}
              progress={frameProgress}
              label={`ramme: src=${fromHost.mac} dst=${toHost.mac}`}
              color="brand"
            />
          )}
          {phase.kind === "egress" &&
            phase.floodPorts.map((portId) => {
              const port = PORTS.find((p) => p.id === portId)!;
              const targetHost = HOSTS.find((h) => h.port === portId)!;
              const isDropped = phase.vlanDrop;
              return (
                <FrameOnWire
                  key={portId}
                  x1={port.x}
                  y1={port.y}
                  x2={targetHost.x}
                  y2={targetHost.y}
                  progress={frameProgress}
                  label={isDropped ? "DROP (VLAN)" : "delivered"}
                  color={isDropped ? "destructive" : phase.floodPorts.length > 1 ? "amber-500" : "success"}
                />
              );
            })}

          {/* Status-strip */}
          <rect
            x={20}
            y={400}
            width={760}
            height={16}
            className="fill-muted"
            opacity={0.4}
          />
          <text x={400} y={412} textAnchor="middle" className="fill-foreground text-[11px] font-semibold">
            {phaseLabel(phase)}
          </text>
        </svg>

        {/* MAC-tabell + logg */}
        <div className="border-l border-border bg-muted/10 flex flex-col">
          <div className="px-3 py-2 border-b border-border">
            <div className="text-xs font-semibold text-foreground mb-1.5">MAC-tabell</div>
            {table.length === 0 ? (
              <div className="text-[11px] text-muted-foreground italic">tom — switch har ikke lært noe ennå</div>
            ) : (
              <table className="w-full text-[11px] font-mono">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left font-normal pb-1">MAC</th>
                    <th className="text-left font-normal pb-1">Port</th>
                    {vlanMode && <th className="text-left font-normal pb-1">VLAN</th>}
                  </tr>
                </thead>
                <tbody>
                  {table.map((e) => (
                    <tr key={e.mac} className="border-t border-border/50">
                      <td className="py-0.5 text-foreground">{e.mac}</td>
                      <td className="py-0.5 text-foreground">P{e.port}</td>
                      {vlanMode && <td className="py-0.5 text-muted-foreground">{e.vlan}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="px-3 py-2 flex-1">
            <div className="text-xs font-semibold text-foreground mb-1.5">Logg</div>
            <div className="text-[11px] font-mono space-y-0.5 max-h-44 overflow-y-auto">
              {logs.length === 0 && (
                <div className="text-muted-foreground italic">Trykk «Send ramme» for å begynne.</div>
              )}
              {logs.map((l, i) => (
                <div
                  key={i}
                  className={
                    l.kind === "ok"
                      ? "text-success"
                      : l.kind === "warn"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-muted-foreground"
                  }
                >
                  {l.msg}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-2 border-t border-border bg-muted/20 text-[11px] text-muted-foreground flex items-center gap-2">
        <Wifi className="h-3 w-3" />
        <span>
          Prøv først å sende A → B uten å lære B først (flood). Send så B → A — nå vet switchen begge.
          Slå på VLAN-modus og prøv A → C (mismatch).
        </span>
      </div>
    </div>
  );
}

function phaseLabel(p: Phase): string {
  switch (p.kind) {
    case "idle":
      return "Klar — velg sender og mottaker, trykk Send.";
    case "ingress":
      return "1) Ramma kommer inn på switchen via avsenderens port";
    case "learn":
      return "2) Switch LÆRER: src-MAC ↔ port skrives til tabellen";
    case "lookup":
      return "3) Switch SLÅR OPP dst-MAC i tabellen";
    case "egress":
      return p.vlanDrop
        ? "4) DROP — VLAN-isolert"
        : p.floodPorts.length > 1
          ? "4) FLOOD: send på alle andre porter (samme VLAN)"
          : "4) UNICAST: send direkte ut riktig port";
  }
}

function FrameOnWire({
  x1,
  y1,
  x2,
  y2,
  progress,
  label,
  color,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress: number;
  label: string;
  color: string;
}) {
  const x = x1 + (x2 - x1) * progress;
  const y = y1 + (y2 - y1) * progress;
  const fillClass =
    color === "brand"
      ? "fill-brand"
      : color === "success"
        ? "fill-success"
        : color === "destructive"
          ? "fill-destructive"
          : "fill-amber-500";
  const strokeClass =
    color === "brand"
      ? "stroke-brand"
      : color === "success"
        ? "stroke-success"
        : color === "destructive"
          ? "stroke-destructive"
          : "stroke-amber-500";
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} className={strokeClass} strokeWidth={2} opacity={0.5} />
      <rect
        x={x - 28}
        y={y - 9}
        width={56}
        height={18}
        rx={3}
        className={`${fillClass} ${strokeClass}`}
        fillOpacity={0.9}
      />
      <text x={x} y={y + 4} textAnchor="middle" className="fill-background text-[9px] font-bold">
        {label.length > 10 ? label.slice(0, 9) + "…" : label}
      </text>
    </g>
  );
}
