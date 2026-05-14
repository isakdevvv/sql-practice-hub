import { useEffect, useMemo, useState } from "react";
import { Play, Pause, RotateCcw, ChevronRight, Server, Laptop } from "lucide-react";

type Direction = "client-to-server" | "server-to-client";

type DoraStep = {
  id: "discover" | "offer" | "request" | "ack";
  letter: "D" | "O" | "R" | "A";
  title: string;
  fullName: string;
  direction: Direction;
  isBroadcast: boolean;
  srcIp: string;
  dstIp: string;
  srcMac: string;
  dstMac: string;
  udpPorts: string; // "68 → 67" osv.
  payloadSummary: string;
  why: string;
};

const STEPS: DoraStep[] = [
  {
    id: "discover",
    letter: "D",
    title: "Discover",
    fullName: "DHCPDISCOVER",
    direction: "client-to-server",
    isBroadcast: true,
    srcIp: "0.0.0.0",
    dstIp: "255.255.255.255",
    srcMac: "AA:AA:AA:AA:AA:AA",
    dstMac: "FF:FF:FF:FF:FF:FF",
    udpPorts: "68 → 67",
    payloadSummary: "yiaddr=0.0.0.0, xid=0x3903F326, chaddr=AA:AA:…",
    why:
      "Klienten har ingen IP enda. Den vet heller ikke om en DHCP-server finnes på linken eller hva slags IP-spenn som er gyldig. Eneste mulighet er en L2-broadcast som alle på lokalnettet ser.",
  },
  {
    id: "offer",
    letter: "O",
    title: "Offer",
    fullName: "DHCPOFFER",
    direction: "server-to-client",
    isBroadcast: true,
    srcIp: "192.168.1.1",
    dstIp: "255.255.255.255",
    srcMac: "SS:SS:SS:SS:SS:SS",
    dstMac: "FF:FF:FF:FF:FF:FF",
    udpPorts: "67 → 68",
    payloadSummary:
      "yiaddr=192.168.1.42, lease=86400s, gateway=192.168.1.1, dns=1.1.1.1",
    why:
      "Serveren tilbyr en spesifikk IP, lease-tid og nettverks-parametre. Svaret går også som broadcast: klienten har fortsatt ikke en IP, så serveren kan ikke unicaste til den på vanlig L3-vis. Klienten kjenner igjen sitt eget transaction-id (xid).",
  },
  {
    id: "request",
    letter: "R",
    title: "Request",
    fullName: "DHCPREQUEST",
    direction: "client-to-server",
    isBroadcast: true,
    srcIp: "0.0.0.0",
    dstIp: "255.255.255.255",
    srcMac: "AA:AA:AA:AA:AA:AA",
    dstMac: "FF:FF:FF:FF:FF:FF",
    udpPorts: "68 → 67",
    payloadSummary:
      "requested-ip=192.168.1.42, server-id=192.168.1.1, xid=0x3903F326",
    why:
      "Klienten formelt aksepterer tilbudet. Sendes som broadcast så ANDRE DHCP-servere på linken også ser at klienten har valgt en konkret server — deres egne tilbud kan da trekkes tilbake og IP-en frigjøres. Inneholder server-id slik at hver server vet om de er valgt eller ikke.",
  },
  {
    id: "ack",
    letter: "A",
    title: "Ack",
    fullName: "DHCPACK",
    direction: "server-to-client",
    isBroadcast: true,
    srcIp: "192.168.1.1",
    dstIp: "255.255.255.255",
    srcMac: "SS:SS:SS:SS:SS:SS",
    dstMac: "FF:FF:FF:FF:FF:FF",
    udpPorts: "67 → 68",
    payloadSummary: "yiaddr=192.168.1.42, lease=86400s, T1=43200s, T2=75600s",
    why:
      "Endelig bekreftelse — klienten kan nå konfigurere stacken med IP-en og begynne å sende vanlig trafikk. Lease-tid og fornyings-timere T1 (50 %) og T2 (87,5 %) starter nå.",
  },
];

type Lease = {
  ip: string;
  mac: string;
  hostname: string;
  state: "OFFERED" | "BOUND";
  remaining: string;
};

export function DhcpDoraFlow() {
  const [step, setStep] = useState(0); // -1 = ikke startet, 0..3 = steg, 4 = ferdig
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Auto-play
  useEffect(() => {
    if (!playing || !started) return;
    if (step >= STEPS.length) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => {
      setStep((s) => Math.min(s + 1, STEPS.length));
    }, 2200);
    return () => clearTimeout(t);
  }, [playing, started, step]);

  function start() {
    setStarted(true);
    setStep(0);
    setPlaying(true);
  }

  function reset() {
    setStarted(false);
    setStep(0);
    setPlaying(false);
  }

  function next() {
    setStep((s) => Math.min(s + 1, STEPS.length));
    setPlaying(false);
  }

  const current = step >= 0 && step < STEPS.length ? STEPS[step] : null;

  // Lease-tabell — vokser etter hvert som vi når Offer og Ack
  const leases = useMemo<Lease[]>(() => {
    if (!started) return [];
    const list: Lease[] = [
      {
        ip: "192.168.1.20",
        mac: "11:22:33:44:55:66",
        hostname: "alice-laptop",
        state: "BOUND",
        remaining: "12t 14m",
      },
      {
        ip: "192.168.1.21",
        mac: "AA:BB:CC:DD:EE:01",
        hostname: "iphone-bob",
        state: "BOUND",
        remaining: "8t 02m",
      },
    ];
    if (step >= 1) {
      list.push({
        ip: "192.168.1.42",
        mac: "AA:AA:AA:AA:AA:AA",
        hostname: "(ny klient)",
        state: step >= 3 ? "BOUND" : "OFFERED",
        remaining: step >= 3 ? "24t 00m" : "reservert",
      });
    }
    return list;
  }, [started, step]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header / kontroller */}
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          DORA-simulator
        </div>
        <div className="flex gap-1.5">
          {!started ? (
            <button
              type="button"
              onClick={start}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md bg-brand text-brand-foreground hover:opacity-90"
            >
              <Play className="h-3 w-3" /> Start tilkobling
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium rounded-md border border-border bg-card hover:border-brand/40"
              >
                {playing ? (
                  <>
                    <Pause className="h-3 w-3" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3" /> Spill
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={next}
                disabled={step >= STEPS.length}
                className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium rounded-md border border-border bg-card hover:border-brand/40 disabled:opacity-40 disabled:cursor-default"
              >
                Neste <ChevronRight className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium rounded-md border border-border bg-card hover:border-brand/40"
              >
                <RotateCcw className="h-3 w-3" /> Nullstill
              </button>
            </>
          )}
        </div>
      </div>

      {/* Steg-pills */}
      <div className="border-b border-border bg-muted/10 px-4 py-2 flex gap-1.5 flex-wrap">
        {STEPS.map((s, i) => {
          const isActive = started && step === i;
          const isPast = started && step > i;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => started && setStep(i)}
              disabled={!started}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors disabled:cursor-default disabled:opacity-50 ${
                isActive
                  ? "bg-brand text-brand-foreground"
                  : isPast
                    ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                    : "border border-border bg-card text-foreground"
              }`}
            >
              <span className="font-mono mr-1">{s.letter}</span>
              {s.title}
            </button>
          );
        })}
      </div>

      {/* Scene + lease */}
      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-0">
        {/* Topologi-scene */}
        <div className="p-4 border-b lg:border-b-0 lg:border-r border-border">
          <div className="relative rounded-lg border border-border bg-background overflow-hidden">
            {/* Nodes */}
            <div className="flex items-stretch min-h-[200px]">
              {/* Klient */}
              <div className="flex-1 flex flex-col items-center justify-center p-4 gap-2 border-r border-border bg-muted/20">
                <Laptop
                  className={`h-8 w-8 ${
                    started ? "text-brand" : "text-muted-foreground"
                  }`}
                />
                <div className="text-xs font-semibold">Ny klient</div>
                <div className="text-[11px] font-mono text-muted-foreground">
                  MAC AA:AA:…
                </div>
                <div
                  className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                    step >= 3
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                  }`}
                >
                  IP: {step >= 3 ? "192.168.1.42" : "0.0.0.0"}
                </div>
              </div>

              {/* Link / animasjon */}
              <div className="flex-[2] relative flex items-center justify-center px-3">
                <div className="absolute inset-x-3 top-1/2 h-px bg-border" />
                {current && (
                  <div
                    key={`${current.id}-anim`}
                    className={`relative z-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-[11px] font-mono shadow-sm ${
                      current.direction === "client-to-server"
                        ? "border-brand/50 bg-brand/10 text-brand"
                        : "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    } ${
                      current.direction === "client-to-server"
                        ? "dhcp-anim-right"
                        : "dhcp-anim-left"
                    }`}
                    style={{
                      animation: `${
                        current.direction === "client-to-server"
                          ? "dhcpMoveRight"
                          : "dhcpMoveLeft"
                      } 1.8s ease-in-out`,
                    }}
                  >
                    <span className="font-semibold">{current.fullName}</span>
                    {current.isBroadcast && (
                      <span className="text-[10px] px-1 py-0 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40">
                        BCAST
                      </span>
                    )}
                  </div>
                )}
                {!current && started && step >= STEPS.length && (
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    Tilkobling fullført — klient er BOUND.
                  </div>
                )}
                {!started && (
                  <div className="text-[11px] text-muted-foreground italic">
                    Trykk «Start tilkobling»
                  </div>
                )}
              </div>

              {/* Server */}
              <div className="flex-1 flex flex-col items-center justify-center p-4 gap-2 border-l border-border bg-muted/20">
                <Server className="h-8 w-8 text-emerald-700 dark:text-emerald-400" />
                <div className="text-xs font-semibold">DHCP-server</div>
                <div className="text-[11px] font-mono text-muted-foreground">
                  192.168.1.1
                </div>
                <div className="text-[11px] font-mono text-muted-foreground">
                  port 67
                </div>
              </div>
            </div>

            {/* Steg-detalj */}
            {current && (
              <div className="border-t border-border p-3 text-xs space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">
                    Steg {step + 1}/4 — {current.fullName}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    UDP {current.udpPorts}
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-x-3 gap-y-1 font-mono text-[11px]">
                  <div>
                    <span className="text-muted-foreground">src IP </span>
                    {current.srcIp}
                  </div>
                  <div>
                    <span className="text-muted-foreground">dst IP </span>
                    {current.dstIp}
                  </div>
                  <div>
                    <span className="text-muted-foreground">src MAC </span>
                    {current.srcMac}
                  </div>
                  <div>
                    <span className="text-muted-foreground">dst MAC </span>
                    {current.dstMac}
                  </div>
                </div>
                <div className="font-mono text-[11px] text-muted-foreground">
                  payload: {current.payloadSummary}
                </div>
                <div className="text-[12px] text-foreground leading-relaxed pt-1 border-t border-border/60">
                  <span className="font-semibold">Hvorfor:</span> {current.why}
                </div>
              </div>
            )}
          </div>

          {/* Inline keyframes — Tailwind har ikke disse globalt */}
          <style>{`
            @keyframes dhcpMoveRight {
              0% { transform: translateX(-80px); opacity: 0; }
              20% { opacity: 1; }
              100% { transform: translateX(80px); opacity: 1; }
            }
            @keyframes dhcpMoveLeft {
              0% { transform: translateX(80px); opacity: 0; }
              20% { opacity: 1; }
              100% { transform: translateX(-80px); opacity: 1; }
            }
          `}</style>
        </div>

        {/* Lease-tabell */}
        <div className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Server-lease-tabell
          </div>
          {leases.length === 0 ? (
            <div className="text-[12px] text-muted-foreground italic rounded-md border border-dashed border-border p-3">
              Tabellen vises etter at simuleringen starter.
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-hidden">
              <table className="w-full text-[11px]">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left font-semibold px-2 py-1.5 font-mono">
                      IP
                    </th>
                    <th className="text-left font-semibold px-2 py-1.5 font-mono">
                      MAC
                    </th>
                    <th className="text-left font-semibold px-2 py-1.5">
                      Hostnavn
                    </th>
                    <th className="text-left font-semibold px-2 py-1.5">
                      Tilstand
                    </th>
                    <th className="text-left font-semibold px-2 py-1.5">
                      Igjen
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leases.map((l) => {
                    const isNew = l.mac === "AA:AA:AA:AA:AA:AA";
                    return (
                      <tr
                        key={l.ip}
                        className={`border-t border-border ${
                          isNew
                            ? l.state === "BOUND"
                              ? "bg-emerald-500/10"
                              : "bg-amber-500/10"
                            : ""
                        }`}
                      >
                        <td className="px-2 py-1.5 font-mono">{l.ip}</td>
                        <td className="px-2 py-1.5 font-mono">{l.mac}</td>
                        <td className="px-2 py-1.5">{l.hostname}</td>
                        <td className="px-2 py-1.5">
                          <span
                            className={`px-1 py-0.5 rounded font-mono text-[10px] ${
                              l.state === "BOUND"
                                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                                : "bg-amber-500/20 text-amber-800 dark:text-amber-300"
                            }`}
                          >
                            {l.state}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 font-mono">{l.remaining}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-3 text-[12px] text-muted-foreground leading-relaxed">
            Etter <span className="font-mono">Offer</span> reserverer serveren
            IP-en (status <span className="font-mono">OFFERED</span>). Etter{" "}
            <span className="font-mono">Ack</span> blir den{" "}
            <span className="font-mono">BOUND</span> for hele lease-perioden —
            typisk 24 timer på et hjemmenett, 8 timer på et bedriftsnett.
          </p>
        </div>
      </div>
    </div>
  );
}
