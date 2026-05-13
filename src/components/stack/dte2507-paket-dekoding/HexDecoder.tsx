import { useMemo, useState } from "react";

interface Field {
  start: number;
  len: number;
  name: string;
  layer: "eth" | "ip" | "tcp" | "udp" | "app";
  /** Function that produces human-readable interpretation from the slice. */
  decode: (bytes: number[]) => string;
}

interface Packet {
  id: string;
  label: string;
  hex: string;
  fields: Field[];
  summary: string;
}

function ipFmt(b: number[]) {
  return b.map((x) => x).join(".");
}
function macFmt(b: number[]) {
  return b.map((x) => x.toString(16).padStart(2, "0")).join(":");
}
function asNumU16(b: number[]) {
  return (b[0] << 8) | b[1];
}

// One realistic IPv4+TCP packet, headers only.
// Eth(14) + IPv4(20) + TCP(20) = 54 bytes
const PACKET_TCP: Packet = {
  id: "tcp-syn",
  label: "Ethernet + IPv4 + TCP (SYN)",
  summary:
    "Klient initierer TCP-tilkobling mot 93.184.216.34:443. Bare SYN-flagget er satt. SEQ er tilfeldig start-nummer.",
  hex:
    // Eth: dst MAC (00:1a:2b:3c:4d:5e), src MAC (aa:bb:cc:dd:ee:ff), type 0800 (IPv4)
    "00 1a 2b 3c 4d 5e aa bb cc dd ee ff 08 00 " +
    // IPv4: ver/IHL=45, TOS 00, total 003c, id 1c46, flags+offset 4000, TTL 40, proto 06 (TCP), checksum b1e6, src 0a000002, dst 5db8d822
    "45 00 00 3c 1c 46 40 00 40 06 b1 e6 0a 00 00 02 5d b8 d8 22 " +
    // TCP: src 0050 (80? no, let's use a high port 0xc0a8=49320), dst 01bb (443), seq, ack=0, hdr 50 02, win, csum, urg, options
    "c0 a8 01 bb fa ce b0 0c 00 00 00 00 a0 02 fa f0 1a 2b 00 00",
  fields: [
    { start: 0, len: 6, name: "Dest MAC", layer: "eth", decode: (b) => macFmt(b) },
    { start: 6, len: 6, name: "Source MAC", layer: "eth", decode: (b) => macFmt(b) },
    { start: 12, len: 2, name: "EtherType", layer: "eth", decode: (b) => `0x${b.map((x) => x.toString(16).padStart(2, "0")).join("")} (IPv4)` },
    { start: 14, len: 1, name: "Version/IHL", layer: "ip", decode: (b) => `Version ${b[0] >> 4}, IHL ${b[0] & 0xf} (${(b[0] & 0xf) * 4} bytes)` },
    { start: 15, len: 1, name: "TOS / DSCP", layer: "ip", decode: (b) => `0x${b[0].toString(16).padStart(2, "0")}` },
    { start: 16, len: 2, name: "Total length", layer: "ip", decode: (b) => `${asNumU16(b)} bytes` },
    { start: 18, len: 2, name: "Identification", layer: "ip", decode: (b) => `0x${b.map((x) => x.toString(16).padStart(2, "0")).join("")}` },
    { start: 20, len: 2, name: "Flags + Fragment offset", layer: "ip", decode: (b) => {
      const flags = b[0] >> 5;
      return `Flags 0b${flags.toString(2).padStart(3, "0")} (DF=${(flags >> 1) & 1}, MF=${flags & 1}), offset ${((b[0] & 0x1f) << 8) | b[1]}`;
    } },
    { start: 22, len: 1, name: "TTL", layer: "ip", decode: (b) => `${b[0]} hops gjenstår` },
    { start: 23, len: 1, name: "Protocol", layer: "ip", decode: (b) => `${b[0]} (${b[0] === 6 ? "TCP" : b[0] === 17 ? "UDP" : b[0] === 1 ? "ICMP" : "?"})` },
    { start: 24, len: 2, name: "Header checksum", layer: "ip", decode: (b) => `0x${b.map((x) => x.toString(16).padStart(2, "0")).join("")}` },
    { start: 26, len: 4, name: "Source IP", layer: "ip", decode: (b) => ipFmt(b) },
    { start: 30, len: 4, name: "Dest IP", layer: "ip", decode: (b) => ipFmt(b) },
    { start: 34, len: 2, name: "Source port", layer: "tcp", decode: (b) => `${asNumU16(b)}` },
    { start: 36, len: 2, name: "Dest port", layer: "tcp", decode: (b) => `${asNumU16(b)} (${asNumU16(b) === 443 ? "HTTPS" : asNumU16(b) === 80 ? "HTTP" : asNumU16(b) === 22 ? "SSH" : "?"})` },
    { start: 38, len: 4, name: "Sequence number", layer: "tcp", decode: (b) => `${(b[0] << 24 >>> 0) + (b[1] << 16) + (b[2] << 8) + b[3]}` },
    { start: 42, len: 4, name: "Ack number", layer: "tcp", decode: (b) => `${(b[0] << 24 >>> 0) + (b[1] << 16) + (b[2] << 8) + b[3]}` },
    { start: 46, len: 1, name: "Data offset + reserved", layer: "tcp", decode: (b) => `Header ${(b[0] >> 4) * 4} bytes` },
    { start: 47, len: 1, name: "Flags", layer: "tcp", decode: (b) => {
      const f = b[0];
      const set = [
        f & 0x01 ? "FIN" : null,
        f & 0x02 ? "SYN" : null,
        f & 0x04 ? "RST" : null,
        f & 0x08 ? "PSH" : null,
        f & 0x10 ? "ACK" : null,
        f & 0x20 ? "URG" : null,
      ].filter(Boolean).join("+");
      return `0b${f.toString(2).padStart(8, "0")} → ${set || "(none)"}`;
    } },
    { start: 48, len: 2, name: "Window size", layer: "tcp", decode: (b) => `${asNumU16(b)} bytes` },
    { start: 50, len: 2, name: "Checksum", layer: "tcp", decode: (b) => `0x${b.map((x) => x.toString(16).padStart(2, "0")).join("")}` },
    { start: 52, len: 2, name: "Urgent pointer", layer: "tcp", decode: (b) => `${asNumU16(b)}` },
  ],
};

// IPv4+UDP (DNS lookup) - simpler
const PACKET_UDP: Packet = {
  id: "udp-dns",
  label: "Ethernet + IPv4 + UDP (DNS-query)",
  summary: "DNS-spørring fra 10.0.0.5:54321 til 8.8.8.8:53.",
  hex:
    "00 1a 2b 3c 4d 5e aa bb cc dd ee ff 08 00 " +
    "45 00 00 28 ab cd 00 00 40 11 b8 32 0a 00 00 05 08 08 08 08 " +
    "d4 31 00 35 00 14 27 c6",
  fields: [
    { start: 0, len: 6, name: "Dest MAC", layer: "eth", decode: (b) => macFmt(b) },
    { start: 6, len: 6, name: "Source MAC", layer: "eth", decode: (b) => macFmt(b) },
    { start: 12, len: 2, name: "EtherType", layer: "eth", decode: () => "IPv4" },
    { start: 14, len: 1, name: "Version/IHL", layer: "ip", decode: (b) => `Version ${b[0] >> 4}, IHL ${b[0] & 0xf}` },
    { start: 22, len: 1, name: "TTL", layer: "ip", decode: (b) => `${b[0]} hops` },
    { start: 23, len: 1, name: "Protocol", layer: "ip", decode: (b) => `${b[0]} (UDP)` },
    { start: 26, len: 4, name: "Source IP", layer: "ip", decode: (b) => ipFmt(b) },
    { start: 30, len: 4, name: "Dest IP", layer: "ip", decode: (b) => ipFmt(b) },
    { start: 34, len: 2, name: "Source port", layer: "udp", decode: (b) => `${asNumU16(b)}` },
    { start: 36, len: 2, name: "Dest port", layer: "udp", decode: (b) => `${asNumU16(b)} (DNS)` },
    { start: 38, len: 2, name: "UDP length", layer: "udp", decode: (b) => `${asNumU16(b)} bytes` },
    { start: 40, len: 2, name: "UDP checksum", layer: "udp", decode: (b) => `0x${b.map((x) => x.toString(16).padStart(2, "0")).join("")}` },
  ],
};

const PACKETS: Packet[] = [PACKET_TCP, PACKET_UDP];

function parseHex(s: string): number[] {
  return s
    .replace(/[^0-9a-fA-F]/g, "")
    .match(/.{1,2}/g)!
    .map((h) => parseInt(h, 16));
}

const LAYER_COLOR: Record<Field["layer"], string> = {
  eth: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  ip: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
  tcp: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  udp: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
  app: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
};

export function HexDecoder() {
  const [idx, setIdx] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [selectedField, setSelectedField] = useState<number | null>(null);
  const pkt = PACKETS[idx];
  const bytes = useMemo(() => parseHex(pkt.hex), [pkt]);

  function fieldAt(byteIdx: number): { field: Field; fi: number } | null {
    for (let i = 0; i < pkt.fields.length; i++) {
      const f = pkt.fields[i];
      if (byteIdx >= f.start && byteIdx < f.start + f.len) return { field: f, fi: i };
    }
    return null;
  }

  const activeFieldIdx = hover !== null ? fieldAt(hover)?.fi ?? null : selectedField;
  const activeField = activeFieldIdx !== null ? pkt.fields[activeFieldIdx] : null;
  const activeBytes = activeField ? bytes.slice(activeField.start, activeField.start + activeField.len) : null;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {PACKETS.map((p, i) => (
          <button
            key={p.id}
            onClick={() => {
              setIdx(i);
              setSelectedField(null);
              setHover(null);
            }}
            className={`text-xs px-2.5 py-1 rounded-md border ${idx === i ? "bg-brand text-brand-foreground border-brand" : "border-border"}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-xs text-muted-foreground mb-2">{pkt.summary}</div>
        <div className="font-mono text-xs leading-relaxed overflow-x-auto">
          <div className="flex flex-wrap gap-y-1">
            {bytes.map((b, i) => {
              const f = fieldAt(i);
              const isActive = activeField && i >= activeField.start && i < activeField.start + activeField.len;
              const cls = f
                ? LAYER_COLOR[f.field.layer]
                : "bg-muted text-muted-foreground border-border";
              return (
                <button
                  key={i}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setSelectedField(f ? f.fi : null)}
                  className={`mx-[1px] px-1 border ${cls} ${isActive ? "ring-2 ring-brand" : ""}`}
                  title={f ? f.field.name : ""}
                >
                  {b.toString(16).padStart(2, "0")}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-3 flex gap-3 text-[10px] flex-wrap">
          <span className={`px-1.5 py-0.5 rounded border ${LAYER_COLOR.eth}`}>Ethernet</span>
          <span className={`px-1.5 py-0.5 rounded border ${LAYER_COLOR.ip}`}>IPv4</span>
          <span className={`px-1.5 py-0.5 rounded border ${LAYER_COLOR.tcp}`}>TCP</span>
          <span className={`px-1.5 py-0.5 rounded border ${LAYER_COLOR.udp}`}>UDP</span>
        </div>
      </div>

      {activeField && activeBytes && (
        <div className="rounded-xl border border-brand/40 bg-brand/5 p-4 text-sm space-y-1.5">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${LAYER_COLOR[activeField.layer]}`}>
              {activeField.layer.toUpperCase()}
            </span>
            <span className="font-semibold">{activeField.name}</span>
            <span className="text-xs text-muted-foreground">
              · byte {activeField.start}–{activeField.start + activeField.len - 1} ({activeField.len} bytes)
            </span>
          </div>
          <div className="font-mono text-xs">
            Råverdi: <span className="text-brand">{activeBytes.map((b) => b.toString(16).padStart(2, "0")).join(" ")}</span>
          </div>
          <div className="font-mono text-xs">
            Tolkning: <span className="text-brand">{activeField.decode(activeBytes)}</span>
          </div>
        </div>
      )}
      {!activeField && (
        <p className="text-xs text-muted-foreground">
          Hold musen over en byte (eller klikk for å låse). Tolkningen vises nedenfor.
        </p>
      )}
    </div>
  );
}
