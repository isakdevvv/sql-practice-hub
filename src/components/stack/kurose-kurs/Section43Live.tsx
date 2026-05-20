import { useMemo, useState } from "react";
import { Layers, Scissors, ArrowRight } from "lucide-react";

// Section43Live — to integrerte verktøy:
//   1) Header-utforsker: bygg IPv4-header bit for bit, eller bytt til IPv6 og se
//      hvilke felt som er fjernet/lagt til. Klikk et felt for å se hva det gjør.
//   2) Fragmenterings-animasjon: still inn MTU og pakke-størrelse, og se hvordan
//      IPv4 deler pakken; visualisering av Identification, Fragment Offset,
//      More Fragments-flag og fragment-størrelser.

// ============================================================
// Header-utforsker — IPv4 vs IPv6
// ============================================================
type HeaderField = {
  name: string;
  bits: number; // bredde i bits
  color: string; // tailwind bg-klasse
  short: string; // kort visning i ruta
  example?: string;
  beskrivelse: string;
  ipv4Only?: boolean;
  ipv6Only?: boolean;
};

const IPV4_FIELDS: HeaderField[] = [
  { name: "Version", bits: 4, color: "bg-blue-500/20 border-blue-400", short: "4", example: "0100", beskrivelse: "Hvilken IP-versjon — 4 for IPv4. Første nybble en ruter sjekker." },
  { name: "IHL", bits: 4, color: "bg-blue-500/20 border-blue-400", short: "5", example: "0101 = 5 × 32-bit = 20 bytes", beskrivelse: "Internet Header Length: lengden av selve headeren i 32-bit-ord. 5 = 20 bytes (uten Options).", ipv4Only: true },
  { name: "TOS / DSCP", bits: 8, color: "bg-cyan-500/20 border-cyan-400", short: "0x00", beskrivelse: "Type of Service / Differentiated Services Code Point. Klasse for QoS-prioritering." },
  { name: "Total Length", bits: 16, color: "bg-cyan-500/20 border-cyan-400", short: "120", example: "header + data, max 65535", beskrivelse: "Total pakke-lengde i bytes (header + data). Max 65535." },
  { name: "Identification", bits: 16, color: "bg-amber-500/20 border-amber-400", short: "0x4231", beskrivelse: "Unik ID per pakke fra denne avsenderen. Alle fragmenter av samme pakke deler denne.", ipv4Only: true },
  { name: "Flags", bits: 3, color: "bg-amber-500/20 border-amber-400", short: "DF=1 MF=0", example: "[reserved, DF, MF]", beskrivelse: "3 flagg: reservert (0), DF=Don't Fragment, MF=More Fragments (1 = enda flere fragmenter kommer).", ipv4Only: true },
  { name: "Fragment Offset", bits: 13, color: "bg-amber-500/20 border-amber-400", short: "0", example: "i 8-byte-enheter", beskrivelse: "Posisjon av dette fragmentet i den opprinnelige pakken, i 8-byte-enheter. Reassembly på mottaker.", ipv4Only: true },
  { name: "TTL", bits: 8, color: "bg-red-500/20 border-red-400", short: "64", example: "Linux: 64, Windows: 128", beskrivelse: "Time To Live. Dekrementeres av hver ruter. Når TTL=0 dropper ruteren pakken og sender ICMP Time Exceeded." },
  { name: "Protocol", bits: 8, color: "bg-purple-500/20 border-purple-400", short: "6 (TCP)", example: "TCP=6, UDP=17, ICMP=1", beskrivelse: "Hvilken protokoll er innholdet? IPv6 kaller dette Next Header og kobler til extension headers.", ipv4Only: true },
  { name: "Header Checksum", bits: 16, color: "bg-red-500/20 border-red-400", short: "0xa1b2", beskrivelse: "Checksum kun over headeren. Må regnes ut på nytt av hver ruter (fordi TTL endres) — dyrt!", ipv4Only: true },
  { name: "Source IP", bits: 32, color: "bg-emerald-500/20 border-emerald-400", short: "10.0.0.5", beskrivelse: "Avsenderens IPv4-adresse, 32 bit." },
  { name: "Destination IP", bits: 32, color: "bg-emerald-500/20 border-emerald-400", short: "8.8.8.8", beskrivelse: "Mottakerens IPv4-adresse, 32 bit." },
];

const IPV6_FIELDS: HeaderField[] = [
  { name: "Version", bits: 4, color: "bg-blue-500/20 border-blue-400", short: "6", example: "0110", beskrivelse: "IP-versjon = 6." },
  { name: "Traffic Class", bits: 8, color: "bg-cyan-500/20 border-cyan-400", short: "0x00", beskrivelse: "Tilsvarer TOS/DSCP i IPv4. Klasse for QoS." },
  { name: "Flow Label", bits: 20, color: "bg-cyan-500/20 border-cyan-400", short: "0x12345", beskrivelse: "Identifiserer en strøm (flow) som krever spesiell ruter-behandling. Nytt i IPv6.", ipv6Only: true },
  { name: "Payload Length", bits: 16, color: "bg-cyan-500/20 border-cyan-400", short: "100", beskrivelse: "Lengde av data etter headeren (IKKE inkl. headeren — annerledes enn IPv4 Total Length)." },
  { name: "Next Header", bits: 8, color: "bg-purple-500/20 border-purple-400", short: "6 (TCP)", example: "Erstatter Protocol", beskrivelse: "Hva som følger etter denne headeren. Kan være en extension header, eller en payload-protokoll (TCP=6, UDP=17)." },
  { name: "Hop Limit", bits: 8, color: "bg-red-500/20 border-red-400", short: "64", beskrivelse: "Som TTL i IPv4. Dekrementeres av hver ruter, 0 = drop." },
  { name: "Source Address", bits: 128, color: "bg-emerald-500/20 border-emerald-400", short: "2001:db8::1", beskrivelse: "Avsender — 128 bit (16 bytes), skrives som 8 hex-grupper med ::-sammentrekning." },
  { name: "Destination Address", bits: 128, color: "bg-emerald-500/20 border-emerald-400", short: "2001:db8::2", beskrivelse: "Mottaker — 128 bit. Hovedgrunnen til IPv6: enormt adresserom." },
];

function HeaderExplorer() {
  const [version, setVersion] = useState<"v4" | "v6">("v4");
  const [selected, setSelected] = useState<string | null>("TTL");
  const fields = version === "v4" ? IPV4_FIELDS : IPV6_FIELDS;
  const selectedField = fields.find((f) => f.name === selected);
  const totalBits = fields.reduce((sum, f) => sum + f.bits, 0);
  const totalBytes = totalBits / 8;

  // Build rows: hver rad er 32 bits, felt fyller én eller flere celler.
  // For visning normaliserer vi bits så 32 = 100%.
  const rows: HeaderField[][] = [];
  {
    let cur: HeaderField[] = [];
    let curBits = 0;
    for (const f of fields) {
      let remaining = f.bits;
      while (remaining > 0) {
        const space = 32 - curBits;
        if (remaining <= space) {
          cur.push({ ...f, bits: remaining });
          curBits += remaining;
          remaining = 0;
        } else {
          cur.push({ ...f, bits: space });
          curBits += space;
          remaining -= space;
        }
        if (curBits >= 32) {
          rows.push(cur);
          cur = [];
          curBits = 0;
        }
      }
    }
    if (cur.length > 0) rows.push(cur);
  }

  // Hvilke IPv4-felt mangler i IPv6? (for å vise diff)
  const removedInV6 = IPV4_FIELDS.filter((f) => f.ipv4Only).map((f) => f.name);
  const addedInV6 = IPV6_FIELDS.filter((f) => f.ipv6Only).map((f) => f.name);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <Layers className="h-3.5 w-3.5 text-blue-500" />
        <span className="font-medium text-foreground">
          Header-utforsker — IPv4 og IPv6 bit for bit
        </span>
        <div className="ml-auto inline-flex rounded border border-border overflow-hidden">
          <button
            onClick={() => setVersion("v4")}
            className={`px-2 py-0.5 text-xs ${version === "v4" ? "bg-brand/15 text-brand font-semibold" : "text-muted-foreground hover:bg-muted"}`}
          >
            IPv4
          </button>
          <button
            onClick={() => setVersion("v6")}
            className={`px-2 py-0.5 text-xs ${version === "v6" ? "bg-brand/15 text-brand font-semibold" : "text-muted-foreground hover:bg-muted"}`}
          >
            IPv6
          </button>
        </div>
      </div>

      <div className="p-3">
        <div className="text-[10px] font-mono text-muted-foreground mb-1 flex justify-between">
          <span>0</span>
          <span>8</span>
          <span>16</span>
          <span>24</span>
          <span>32</span>
        </div>
        <div className="grid gap-1">
          {rows.map((row, ri) => (
            <div key={ri} className="flex gap-px h-10">
              {row.map((cell, ci) => {
                const isSelected = cell.name === selected;
                return (
                  <button
                    key={`${ri}-${ci}-${cell.name}`}
                    onClick={() => setSelected(cell.name)}
                    style={{ flexBasis: `${(cell.bits / 32) * 100}%` }}
                    className={`relative border-2 rounded ${cell.color} ${
                      isSelected ? "ring-2 ring-offset-1 ring-brand" : ""
                    } px-1 py-0.5 text-left overflow-hidden hover:brightness-110 transition`}
                  >
                    <div className="text-[9px] font-medium text-foreground leading-tight truncate">
                      {cell.name}
                    </div>
                    <div className="text-[9px] font-mono text-muted-foreground leading-tight truncate">
                      {cell.short} <span className="opacity-50">({cell.bits}b)</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-2 text-[10px] text-muted-foreground font-mono">
          Total header-størrelse: <strong className="text-foreground">{totalBytes} bytes</strong> ({totalBits} bits)
          {version === "v4" && " — kan øke til 60 bytes med Options"}
          {version === "v6" && " — fast 40 bytes, alltid"}
        </div>

        {/* Feltdetalj */}
        {selectedField && (
          <div className="mt-3 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold">{selectedField.name}</span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {selectedField.bits} bit
              </span>
              {selectedField.ipv4Only && (
                <span className="text-[9px] uppercase font-bold text-amber-700 dark:text-amber-300">
                  kun IPv4
                </span>
              )}
              {selectedField.ipv6Only && (
                <span className="text-[9px] uppercase font-bold text-purple-700 dark:text-purple-300">
                  kun IPv6
                </span>
              )}
            </div>
            {selectedField.example && (
              <div className="text-[10px] font-mono text-muted-foreground mb-1">
                Eks: {selectedField.example}
              </div>
            )}
            <div className="text-xs text-muted-foreground">{selectedField.beskrivelse}</div>
          </div>
        )}

        {/* Diff-panel */}
        <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs">
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400 mb-1">
              Fjernet i IPv6
            </div>
            <ul className="space-y-0.5 text-muted-foreground">
              {removedInV6.map((n) => (
                <li key={n}>
                  • {n}{" "}
                  {n === "Header Checksum" && (
                    <span className="text-[10px] opacity-70">— sparer CPU per hop</span>
                  )}
                  {n === "Identification" && (
                    <span className="text-[10px] opacity-70">— fragmentering kun ende-til-ende</span>
                  )}
                  {n === "IHL" && (
                    <span className="text-[10px] opacity-70">— fast 40-byte header</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
              Lagt til / endret i IPv6
            </div>
            <ul className="space-y-0.5 text-muted-foreground">
              {addedInV6.map((n) => (
                <li key={n}>
                  • {n}{" "}
                  {n === "Flow Label" && (
                    <span className="text-[10px] opacity-70">— for QoS / hash-distribusjon</span>
                  )}
                </li>
              ))}
              <li>
                • <strong>128-bit adresser</strong>{" "}
                <span className="text-[10px] opacity-70">— 2^128 ≈ 3.4 × 10^38</span>
              </li>
              <li>
                • <strong>Extension headers</strong>{" "}
                <span className="text-[10px] opacity-70">— erstatter Options-feltet</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Fragmenterings-simulator
// ============================================================

type Fragment = {
  id: string;
  origId: number;
  offset: number; // i 8-byte-enheter
  size: number; // bytes (data only, ikke header)
  moreFragments: boolean;
  byteStart: number;
  byteEnd: number;
};

function computeFragments(totalDataBytes: number, mtu: number, origId = 0x4231): Fragment[] {
  // IPv4-header er 20 bytes (uten Options). Hver fragment må ha sin egen header.
  // Maks data per fragment = mtu - 20, og må være multiple av 8 (pga 8-byte-offset)
  // bortsett fra siste fragment.
  const headerSize = 20;
  const maxDataPerFrag = Math.floor((mtu - headerSize) / 8) * 8;
  if (maxDataPerFrag <= 0) return [];

  const fragments: Fragment[] = [];
  let remaining = totalDataBytes;
  let bytePos = 0;
  let i = 0;
  while (remaining > 0) {
    const size = Math.min(maxDataPerFrag, remaining);
    const isLast = remaining - size === 0;
    fragments.push({
      id: `f${i}`,
      origId,
      offset: bytePos / 8,
      size,
      moreFragments: !isLast,
      byteStart: bytePos,
      byteEnd: bytePos + size,
    });
    bytePos += size;
    remaining -= size;
    i++;
  }
  return fragments;
}

function FragmentationDemo() {
  const [originalSize, setOriginalSize] = useState(4000); // data bytes
  const [mtu1, setMtu1] = useState(1500);
  const [mtu2, setMtu2] = useState(620);

  const stage0 = useMemo(() => computeFragments(originalSize, 9999), [originalSize]); // ingen frag, før første hop
  const stage1 = useMemo(() => computeFragments(originalSize, mtu1), [originalSize, mtu1]);
  // Etter andre hop: re-fragmenter hvert eksisterende fragment hvis det er for stort.
  // I virkeligheten skjer dette per-fragment, men hver beholder samme Identification.
  const stage2 = useMemo(() => {
    if (mtu2 >= mtu1) return stage1;
    const out: Fragment[] = [];
    for (const f of stage1) {
      const subFrags = computeFragments(f.size, mtu2, f.origId);
      // Juster offset til å være global (forskyves med f.byteStart/8)
      const baseOffset = f.byteStart / 8;
      for (let i = 0; i < subFrags.length; i++) {
        const sf = subFrags[i];
        out.push({
          ...sf,
          id: `${f.id}-${sf.id}`,
          offset: baseOffset + sf.offset,
          byteStart: f.byteStart + sf.byteStart,
          byteEnd: f.byteStart + sf.byteEnd,
          // MF: hvis dette ikke er siste sub-fragment, eller hvis original f hadde MF=1
          moreFragments: !(i === subFrags.length - 1 && !f.moreFragments),
        });
      }
    }
    return out;
  }, [stage1, mtu2, mtu1]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <Scissors className="h-3.5 w-3.5 text-amber-500" />
        <span className="font-medium text-foreground">
          IPv4-fragmentering — sett MTU på hver lenke
        </span>
      </div>

      <div className="p-3 space-y-3">
        {/* Kontroller */}
        <div className="grid gap-3 sm:grid-cols-3 text-xs">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
              Original data-størrelse
            </label>
            <input
              type="range"
              min={500}
              max={8000}
              step={100}
              value={originalSize}
              onChange={(e) => setOriginalSize(Number(e.target.value))}
              className="w-full"
            />
            <div className="font-mono text-foreground">{originalSize} bytes</div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
              MTU på lenke 1 (Ethernet)
            </label>
            <input
              type="range"
              min={300}
              max={1500}
              step={20}
              value={mtu1}
              onChange={(e) => setMtu1(Number(e.target.value))}
              className="w-full"
            />
            <div className="font-mono text-foreground">{mtu1} bytes</div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
              MTU på lenke 2 (smal WAN)
            </label>
            <input
              type="range"
              min={300}
              max={1500}
              step={20}
              value={mtu2}
              onChange={(e) => setMtu2(Number(e.target.value))}
              className="w-full"
            />
            <div className="font-mono text-foreground">{mtu2} bytes</div>
          </div>
        </div>

        {/* Hops-rør med fragmenter */}
        <div className="space-y-2">
          <FragmentStage
            label="Avsender (før første hop)"
            mtuLabel={undefined}
            fragments={stage0}
            originalSize={originalSize}
          />
          <Hop label={`Ruter R1 — utgående MTU = ${mtu1}`} stage={1} />
          <FragmentStage
            label="Etter R1"
            mtuLabel={`MTU=${mtu1}`}
            fragments={stage1}
            originalSize={originalSize}
            warn={stage1.length > stage0.length}
          />
          <Hop label={`Ruter R2 — utgående MTU = ${mtu2}`} stage={2} />
          <FragmentStage
            label="Etter R2 (mottaker reassembler)"
            mtuLabel={`MTU=${mtu2}`}
            fragments={stage2}
            originalSize={originalSize}
            warn={stage2.length > stage1.length}
          />
        </div>

        {/* Forklaring */}
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 text-xs text-muted-foreground">
          <div className="font-semibold text-foreground mb-1">Hva ser du?</div>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Alle fragmenter beholder samme <code>Identification</code> ({"0x4231"}) — det er hvordan
              mottakeren vet at de hører sammen.
            </li>
            <li>
              <code>Fragment Offset</code> oppgis i 8-byte-enheter. Det er derfor alle fragmenter
              må være multiple av 8 (unntatt siste).
            </li>
            <li>
              Alle fragmenter unntatt det siste har <code>MF=1</code> (More Fragments). Det er sånn
              mottakeren vet at den ikke har alt enda.
            </li>
            <li>
              I IPv6 skjer dette aldri på mellom-rutere — kun avsenderen kan fragmentere, og bare
              etter Path MTU Discovery. Ellers returneres ICMPv6 «Packet Too Big».
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Hop({ label }: { label: string; stage: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-2 py-0.5">
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

function FragmentStage({
  label,
  mtuLabel,
  fragments,
  originalSize,
  warn,
}: {
  label: string;
  mtuLabel?: string;
  fragments: Fragment[];
  originalSize: number;
  warn?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border ${
        warn ? "border-amber-500/50 bg-amber-500/5" : "border-border bg-muted/10"
      } p-2`}
    >
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="text-[10px] font-mono text-muted-foreground">
          {fragments.length} fragment{fragments.length === 1 ? "" : "er"}
          {mtuLabel && <> · {mtuLabel}</>}
        </div>
      </div>
      <div className="flex gap-px overflow-x-auto pb-1">
        {fragments.map((f) => {
          const widthPct = (f.size / originalSize) * 100;
          return (
            <div
              key={f.id}
              style={{ minWidth: `${Math.max(widthPct, 5)}%` }}
              className="rounded border border-blue-400 bg-blue-500/15 px-1 py-0.5 text-[9px] font-mono"
              title={`offset=${f.offset}, size=${f.size}, MF=${f.moreFragments ? 1 : 0}`}
            >
              <div className="text-foreground font-bold">{f.size}B</div>
              <div className="text-muted-foreground">off={f.offset}</div>
              <div className={f.moreFragments ? "text-amber-700 dark:text-amber-300" : "text-emerald-700 dark:text-emerald-300"}>
                MF={f.moreFragments ? 1 : 0}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Eksport
// ============================================================
export function Section43Live() {
  return (
    <div className="space-y-3">
      <HeaderExplorer />
      <FragmentationDemo />
    </div>
  );
}
