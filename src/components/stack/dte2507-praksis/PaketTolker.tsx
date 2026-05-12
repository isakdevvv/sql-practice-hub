import { useMemo, useState } from "react";
import { StackPageShell } from "@/components/stack/StackPageShell";

interface Annotation {
  start: number;
  len: number;
  layer: "eth" | "ip" | "tcp" | "udp" | "arp" | "icmp" | "dns";
  field: string;
  decode: (b: number[]) => string;
}

interface ScenarioPacket {
  id: string;
  title: string;
  scenario: string;
  hex: string;
  anns: Annotation[];
  observations: string[];
}

function hexBytes(s: string): number[] {
  return s
    .replace(/[^0-9a-fA-F]/g, "")
    .match(/.{1,2}/g)!
    .map((h) => parseInt(h, 16));
}
function ip(b: number[]) {
  return b.join(".");
}
function mac(b: number[]) {
  return b.map((x) => x.toString(16).padStart(2, "0")).join(":");
}
function u16(b: number[]) {
  return (b[0] << 8) | b[1];
}

// 5 packets covering different protocols
const PACKETS: ScenarioPacket[] = [
  {
    id: "p1-tcp-syn",
    title: "Pakke 1 — TCP SYN (initiering)",
    scenario: "Klienten klikker på en https://-lenke. Første pakke i 3-way handshake.",
    hex:
      "00 1a 2b 3c 4d 5e aa bb cc dd ee ff 08 00 " +
      "45 00 00 3c 1c 46 40 00 40 06 b1 e6 0a 00 00 02 5d b8 d8 22 " +
      "c0 a8 01 bb fa ce b0 0c 00 00 00 00 a0 02 fa f0 1a 2b 00 00",
    anns: [
      { start: 0, len: 6, layer: "eth", field: "Dest MAC", decode: mac },
      { start: 6, len: 6, layer: "eth", field: "Source MAC", decode: mac },
      { start: 12, len: 2, layer: "eth", field: "EtherType", decode: () => "0x0800 (IPv4)" },
      { start: 23, len: 1, layer: "ip", field: "Protocol", decode: (b) => `${b[0]} (TCP)` },
      { start: 26, len: 4, layer: "ip", field: "Source IP", decode: ip },
      { start: 30, len: 4, layer: "ip", field: "Dest IP", decode: ip },
      { start: 34, len: 2, layer: "tcp", field: "Source port", decode: (b) => `${u16(b)}` },
      { start: 36, len: 2, layer: "tcp", field: "Dest port", decode: (b) => `${u16(b)} (HTTPS)` },
      { start: 47, len: 1, layer: "tcp", field: "Flags", decode: (b) => `0x${b[0].toString(16).padStart(2, "0")} → ${b[0] & 0x02 ? "SYN" : ""}${b[0] & 0x10 ? "+ACK" : ""}` },
    ],
    observations: [
      "Bare SYN-flagget er satt — ingen ACK. Det betyr klienten initierer.",
      "Dest port 443 → HTTPS.",
      "ACK-feltet er 0 (klienten har ikke noe å bekrefte ennå).",
    ],
  },
  {
    id: "p2-tcp-synack",
    title: "Pakke 2 — TCP SYN+ACK (server svarer)",
    scenario: "Serveren godtar tilkoblingen og svarer med SYN+ACK.",
    hex:
      "aa bb cc dd ee ff 00 1a 2b 3c 4d 5e 08 00 " +
      "45 00 00 3c 00 00 40 00 40 06 ce 2c 5d b8 d8 22 0a 00 00 02 " +
      "01 bb c0 a8 12 34 56 78 fa ce b0 0d a0 12 71 20 ab cd 00 00",
    anns: [
      { start: 0, len: 6, layer: "eth", field: "Dest MAC", decode: mac },
      { start: 6, len: 6, layer: "eth", field: "Source MAC", decode: mac },
      { start: 26, len: 4, layer: "ip", field: "Source IP", decode: ip },
      { start: 30, len: 4, layer: "ip", field: "Dest IP", decode: ip },
      { start: 34, len: 2, layer: "tcp", field: "Source port", decode: (b) => `${u16(b)} (HTTPS)` },
      { start: 36, len: 2, layer: "tcp", field: "Dest port", decode: (b) => `${u16(b)}` },
      { start: 47, len: 1, layer: "tcp", field: "Flags", decode: (b) => `0x${b[0].toString(16).padStart(2, "0")} → SYN+ACK` },
    ],
    observations: [
      "Source/Dest MAC er BYTTET OM fra pakke 1 — det er servers svar.",
      "Source/Dest IP er også byttet om.",
      "Flagg = 0x12 = SYN + ACK. Begge flagg er satt samtidig — typisk for andre steg i 3-way handshake.",
    ],
  },
  {
    id: "p3-udp-dns",
    title: "Pakke 3 — UDP DNS-spørring",
    scenario: "Klienten gjør en DNS-lookup mot Google DNS.",
    hex:
      "00 1a 2b 3c 4d 5e aa bb cc dd ee ff 08 00 " +
      "45 00 00 28 ab cd 00 00 40 11 b8 32 0a 00 00 05 08 08 08 08 " +
      "d4 31 00 35 00 14 27 c6",
    anns: [
      { start: 23, len: 1, layer: "ip", field: "Protocol", decode: (b) => `${b[0]} (UDP)` },
      { start: 26, len: 4, layer: "ip", field: "Source IP", decode: ip },
      { start: 30, len: 4, layer: "ip", field: "Dest IP", decode: ip },
      { start: 34, len: 2, layer: "udp", field: "Source port", decode: (b) => `${u16(b)}` },
      { start: 36, len: 2, layer: "udp", field: "Dest port", decode: (b) => `${u16(b)} (DNS)` },
      { start: 38, len: 2, layer: "udp", field: "UDP length", decode: (b) => `${u16(b)} bytes` },
    ],
    observations: [
      "Protocol = 17 → UDP. UDP-header er bare 8 bytes (vs TCPs 20+).",
      "Dest port 53 → DNS.",
      "Source port er høyt random (54321) — operativsystemet velger en ephemeral port.",
    ],
  },
  {
    id: "p4-arp",
    title: "Pakke 4 — ARP request",
    scenario: "Klienten kjenner ikke MAC-adressen til gateway-IP-en og spør på broadcast.",
    hex:
      "ff ff ff ff ff ff aa bb cc dd ee ff 08 06 " +
      "00 01 08 00 06 04 00 01 aa bb cc dd ee ff 0a 00 00 02 00 00 00 00 00 00 0a 00 00 01",
    anns: [
      { start: 0, len: 6, layer: "eth", field: "Dest MAC", decode: (b) => `${mac(b)} (broadcast)` },
      { start: 6, len: 6, layer: "eth", field: "Source MAC", decode: mac },
      { start: 12, len: 2, layer: "eth", field: "EtherType", decode: () => "0x0806 (ARP)" },
      { start: 20, len: 2, layer: "arp", field: "Operation", decode: (b) => `${u16(b)} (1 = request)` },
      { start: 22, len: 6, layer: "arp", field: "Sender HW addr", decode: mac },
      { start: 28, len: 4, layer: "arp", field: "Sender IP", decode: ip },
      { start: 38, len: 4, layer: "arp", field: "Target IP (vi spør om)", decode: ip },
    ],
    observations: [
      "Dest MAC = ff:ff:ff:ff:ff:ff → broadcast (alle på samme nett).",
      "EtherType 0x0806 = ARP. (0x0800 ville vært IPv4.)",
      "ARP er bare på samme lokale nettverk (lag 2). Går ikke gjennom rutere.",
    ],
  },
  {
    id: "p5-icmp",
    title: "Pakke 5 — ICMP Echo Request (ping)",
    scenario: "Klienten pinger 8.8.8.8.",
    hex:
      "00 1a 2b 3c 4d 5e aa bb cc dd ee ff 08 00 " +
      "45 00 00 54 12 34 40 00 40 01 e5 7d 0a 00 00 02 08 08 08 08 " +
      "08 00 4d 5a 12 34 00 01",
    anns: [
      { start: 23, len: 1, layer: "ip", field: "Protocol", decode: (b) => `${b[0]} (ICMP)` },
      { start: 26, len: 4, layer: "ip", field: "Source IP", decode: ip },
      { start: 30, len: 4, layer: "ip", field: "Dest IP", decode: ip },
      { start: 34, len: 1, layer: "icmp", field: "Type", decode: (b) => `${b[0]} (8 = Echo Request)` },
      { start: 35, len: 1, layer: "icmp", field: "Code", decode: (b) => `${b[0]}` },
      { start: 38, len: 2, layer: "icmp", field: "Identifier", decode: (b) => `0x${b.map((x) => x.toString(16).padStart(2, "0")).join("")}` },
      { start: 40, len: 2, layer: "icmp", field: "Seq number", decode: (b) => `${u16(b)}` },
    ],
    observations: [
      "Protocol = 1 → ICMP. ICMP brukes for kontrollmeldinger, ikke vanlig data.",
      "ICMP Type 8 = Echo Request. Type 0 = Echo Reply (svaret).",
      "ICMP har ikke porter — kjernedrevet, ikke bundet til en applikasjon.",
    ],
  },
];

const LAYER_COLOR: Record<Annotation["layer"], string> = {
  eth: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  ip: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
  tcp: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  udp: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
  arp: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
  icmp: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  dns: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
};

function PacketView({ pkt }: { pkt: ScenarioPacket }) {
  const bytes = useMemo(() => hexBytes(pkt.hex), [pkt]);
  const [hover, setHover] = useState<number | null>(null);

  function annAt(byteIdx: number): Annotation | null {
    for (const a of pkt.anns) {
      if (byteIdx >= a.start && byteIdx < a.start + a.len) return a;
    }
    return null;
  }

  const active = hover != null ? annAt(hover) : null;
  const activeBytes = active ? bytes.slice(active.start, active.start + active.len) : null;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground mb-3">{pkt.scenario}</p>
        <div className="font-mono text-xs flex flex-wrap gap-y-1">
          {bytes.map((b, i) => {
            const a = annAt(i);
            const cls = a ? LAYER_COLOR[a.layer] : "bg-muted text-muted-foreground border-border";
            return (
              <button
                key={i}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                className={`mx-[1px] px-1 border ${cls}`}
              >
                {b.toString(16).padStart(2, "0")}
              </button>
            );
          })}
        </div>
      </div>

      {active && activeBytes ? (
        <div className="rounded-xl border border-brand/40 bg-brand/5 p-3 text-sm">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${LAYER_COLOR[active.layer]}`}>
              {active.layer.toUpperCase()}
            </span>
            <span className="font-semibold">{active.field}</span>
          </div>
          <div className="mt-1 font-mono text-xs">
            <span className="text-muted-foreground">bytes:</span>{" "}
            <span className="text-brand">{activeBytes.map((b) => b.toString(16).padStart(2, "0")).join(" ")}</span>
          </div>
          <div className="mt-1 font-mono text-xs">
            <span className="text-muted-foreground">tolkning:</span>{" "}
            <span className="text-brand">{active.decode(activeBytes)}</span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Hold musen over en byte for å se feltforklaring.</p>
      )}

      <div className="rounded-xl border border-border bg-card p-4">
        <h4 className="font-semibold text-sm mb-2">Observasjoner</h4>
        <ul className="text-xs space-y-1 list-disc pl-5 text-muted-foreground">
          {pkt.observations.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function PaketTolker() {
  const [active, setActive] = useState(PACKETS[0].id);
  const current = PACKETS.find((p) => p.id === active)!;

  return (
    <StackPageShell title="Paket-tolker" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-6">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Praksis
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Paket-tolker</h1>
          <p className="mt-3 text-muted-foreground">
            Fem virkelighetsnære pakker fra et nettverks-trace. Klikk gjennom dem og hold musen over
            bytes for å øve på å lese headere i hex.
          </p>
        </header>

        <nav className="flex flex-wrap gap-2 mb-5">
          {PACKETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
              className={`text-xs px-2.5 py-1 rounded-md border ${
                active === p.id ? "bg-brand text-brand-foreground border-brand" : "border-border hover:border-brand/40"
              }`}
            >
              {p.title.split("—")[0].trim()}
            </button>
          ))}
        </nav>

        <h2 className="text-xl font-semibold mb-3">{current.title}</h2>
        <PacketView pkt={current} />
      </article>
    </StackPageShell>
  );
}
