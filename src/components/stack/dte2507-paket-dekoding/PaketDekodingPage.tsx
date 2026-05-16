import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { HexDecoder } from "./HexDecoder";

const STEPS = [
  { title: "Encapsulation", anchor: "encapsulation" },
  { title: "Ethernet + IPv4 header", anchor: "headere" },
  { title: "IPv4 byte-for-byte tabell", anchor: "ipv4-tabell" },
  { title: "IPv4 vs IPv6", anchor: "ipv4-ipv6" },
  { title: "Hex-dump (interaktiv)", anchor: "hex" },
  { title: "Hva endrer rutere?", anchor: "ruter" },
  { title: "TCP-flagg cheatsheet", anchor: "flagg" },
];

export function PaketDekodingPage() {
  return (
    <StackPageShell title="Paket-dekoding" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Wireshark-tankegang
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Paket-dekoding — fra hex til mening
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Når trafikk fanges med Wireshark eller tcpdump ser man rå-bytes. Hver header har et
            fast format med definerte byte-felter. Her er en interaktiv hex-dump: hold musen over
            en byte for å se hva den representerer.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#hex" className="text-brand hover:underline">hex-decoderen lenger ned</a>{" "}
              + drag-oppgaver under{" "}
              <Link to="/drag" className="text-brand hover:underline">«Wireshark / pcap-analyse»</Link>.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-paket-dekoding" steps={STEPS} />

        <section id="encapsulation" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Encapsulation — hva pakker hva?</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`┌─────────────────────────────────────────────────────────────────┐
│ Ethernet header (14 bytes)                                      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ IPv4 header (20 bytes)                                      │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ TCP eller UDP header (20 eller 8 bytes)                 │ │ │
│ │ │ ┌─────────────────────────────────────────────────────┐ │ │ │
│ │ │ │ Application data (HTTP, DNS-query, ...)             │ │ │ │
│ │ │ └─────────────────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                                  + Ethernet FCS (4 bytes på enden)`}</pre>
          </div>
        </section>

        <section id="headere" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Headere du må kunne</h2>
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold text-sm mb-2">Ethernet (14 bytes)</h3>
              <ul className="text-xs space-y-0.5 list-disc pl-5 text-muted-foreground">
                <li>Dest MAC (6 bytes), Source MAC (6 bytes), EtherType (2 bytes).</li>
                <li>EtherType 0x0800 = IPv4, 0x86DD = IPv6, 0x0806 = ARP.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold text-sm mb-2">IPv4 (20 bytes uten options)</h3>
              <ul className="text-xs space-y-0.5 list-disc pl-5 text-muted-foreground">
                <li><strong>Byte 0:</strong> Version (4 bits) + IHL (4 bits). 0x45 = IPv4, header 20 bytes.</li>
                <li><strong>Bytes 2–3:</strong> Total length (header + data).</li>
                <li><strong>Byte 8:</strong> TTL — decrementeres med 1 i hver ruter. 0 → drop.</li>
                <li><strong>Byte 9:</strong> Protocol. 6 = TCP, 17 = UDP, 1 = ICMP.</li>
                <li><strong>Bytes 12–15:</strong> Source IP. <strong>Bytes 16–19:</strong> Dest IP.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold text-sm mb-2">TCP (20 bytes uten options)</h3>
              <ul className="text-xs space-y-0.5 list-disc pl-5 text-muted-foreground">
                <li><strong>Bytes 0–1:</strong> Source port. <strong>Bytes 2–3:</strong> Dest port (80=HTTP, 443=HTTPS).</li>
                <li><strong>Bytes 4–7:</strong> SEQ. <strong>Bytes 8–11:</strong> ACK.</li>
                <li><strong>Byte 13:</strong> Flags. SYN=0x02, ACK=0x10, FIN=0x01, RST=0x04.</li>
                <li><strong>Bytes 14–15:</strong> Window size.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold text-sm mb-2">UDP (8 bytes — alltid)</h3>
              <ul className="text-xs space-y-0.5 list-disc pl-5 text-muted-foreground">
                <li>Src port, dst port, length, checksum — det er det.</li>
                <li>Ingen SEQ/ACK/flags. Connectionless.</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="ipv4-tabell" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. IPv4-header byte-for-byte</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Eksempel-pakke: <code className="font-mono">45 00 00 3c 1c 46 40 00 40 06 b1 e6 c0 a8 01 64 c0 a8 01 01</code>.
            Hver byte mapper til et felt:
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-16">Offset</th>
                  <th className="text-left font-semibold px-3 py-2 w-32">Felt</th>
                  <th className="text-left font-semibold px-3 py-2 w-28">Verdi (hex)</th>
                  <th className="text-left font-semibold px-3 py-2">Betydning</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono">0</td><td className="px-3 py-2 font-mono">Version+IHL</td><td className="px-3 py-2 font-mono">45</td><td className="px-3 py-2 text-muted-foreground">IPv4, 5 * 32-bit ord = 20 bytes header</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono">1</td><td className="px-3 py-2 font-mono">DSCP/ECN</td><td className="px-3 py-2 font-mono">00</td><td className="px-3 py-2 text-muted-foreground">Best-effort, ingen QoS-tagging</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono">2–3</td><td className="px-3 py-2 font-mono">Total length</td><td className="px-3 py-2 font-mono">00 3c</td><td className="px-3 py-2 text-muted-foreground">60 bytes total (header + data)</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono">4–5</td><td className="px-3 py-2 font-mono">Identification</td><td className="px-3 py-2 font-mono">1c 46</td><td className="px-3 py-2 text-muted-foreground">Brukes ved fragmentering — samme ID = samme pakke</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono">6–7</td><td className="px-3 py-2 font-mono">Flags+FragOff</td><td className="px-3 py-2 font-mono">40 00</td><td className="px-3 py-2 text-muted-foreground">DF=1 (don&apos;t fragment), offset=0</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono">8</td><td className="px-3 py-2 font-mono">TTL</td><td className="px-3 py-2 font-mono">40</td><td className="px-3 py-2 text-muted-foreground">64 hops igjen — minker med 1 per ruter</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono">9</td><td className="px-3 py-2 font-mono">Protocol</td><td className="px-3 py-2 font-mono">06</td><td className="px-3 py-2 text-muted-foreground">6 = TCP (17 = UDP, 1 = ICMP)</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono">10–11</td><td className="px-3 py-2 font-mono">Header checksum</td><td className="px-3 py-2 font-mono">b1 e6</td><td className="px-3 py-2 text-muted-foreground">Ones&apos; complement-sum av headeren</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono">12–15</td><td className="px-3 py-2 font-mono">Source IP</td><td className="px-3 py-2 font-mono">c0 a8 01 64</td><td className="px-3 py-2 text-muted-foreground">192.168.1.100</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono">16–19</td><td className="px-3 py-2 font-mono">Dest IP</td><td className="px-3 py-2 font-mono">c0 a8 01 01</td><td className="px-3 py-2 text-muted-foreground">192.168.1.1</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm">
            <strong className="text-brand">Tips:</strong> trikset for å lese IP fra hex er at
            hver byte (00–FF, 0–255) blir ett tall i dotted-quad. <code className="font-mono">c0 a8</code>{" "}
            = 192.168. Lær 0xc0=192 og 0x0a=10 utenat — det dekker det meste av Wireshark.
          </div>
        </section>

        <section id="ipv4-ipv6" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. IPv4 vs IPv6-header</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                IPv4 — 20 bytes (uten options)
              </div>
              <pre className="font-mono text-[10px] whitespace-pre leading-tight">{` 0       8       16              31
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|Ver|IHL|  DSCP   |   Total len   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|    ID     |Flag |  FragOffset   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
| TTL |Proto|   Header checksum   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|         Source IP (32)          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|         Dest IP (32)            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+`}</pre>
              <ul className="mt-3 text-xs space-y-0.5 list-disc pl-5 text-muted-foreground">
                <li>32-bit adresser (~4 mrd)</li>
                <li>Checksum i hver header</li>
                <li>Fragmentering i ruter eller host</li>
                <li>NAT obligatorisk i praksis</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                IPv6 — 40 bytes (fast)
              </div>
              <pre className="font-mono text-[10px] whitespace-pre leading-tight">{` 0       8       16              31
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|Ver| TC  |     Flow label        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
| Payload len | NextHdr | Hop lim |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|       Source addr (128)         |
|         (fire 32-bit linjer)    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|        Dest addr (128)          |
|         (fire 32-bit linjer)    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+`}</pre>
              <ul className="mt-3 text-xs space-y-0.5 list-disc pl-5 text-muted-foreground">
                <li>128-bit adresser (~3.4 × 10³⁸)</li>
                <li>INGEN checksum (UDP/TCP gjør det)</li>
                <li>Fragmentering KUN i host (extension header)</li>
                <li>Ingen NAT — alt globalt rutbart</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="hex" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Interaktiv hex-dump</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Hold musen over en byte for å se hvilket felt den tilhører, og dens dekodete betydning.
          </p>
          <HexDecoder />
        </section>

        <section id="ruter" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Hva endrer en ruter?</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Pakken reiser gjennom mange rutere på vei til mål. De fleste feltene er
            UENDRET — men noen MÅ endres på hver hop:
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Felt</th>
                  <th className="text-left font-semibold px-4 py-2 w-28">Endres?</th>
                  <th className="text-left font-semibold px-4 py-2">Hvorfor</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">TTL</td><td className="px-4 py-3 text-destructive">JA, −1</td><td className="px-4 py-3 text-muted-foreground">Hindrer evige loops. TTL=0 → drop + ICMP «time exceeded» til avsender.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Header checksum</td><td className="px-4 py-3 text-destructive">JA</td><td className="px-4 py-3 text-muted-foreground">Må regnes på nytt fordi TTL ble endret. (IPv6 har droppet dette.)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">MAC-adresser</td><td className="px-4 py-3 text-destructive">JA</td><td className="px-4 py-3 text-muted-foreground">Source = ruter, Dest = neste hop. Ny på hver L2-segment.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Source IP</td><td className="px-4 py-3 text-success">Nei*</td><td className="px-4 py-3 text-muted-foreground">Uendret — bortsett fra NAT (da skifter rute-NAT-en src til sin egen public IP).</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Dest IP</td><td className="px-4 py-3 text-success">Nei</td><td className="px-4 py-3 text-muted-foreground">Uendret hele veien — ellers vet ingen hvor pakken skal.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">TCP/UDP payload</td><td className="px-4 py-3 text-success">Nei</td><td className="px-4 py-3 text-muted-foreground">Rutere skal IKKE røre nyttelasten (de facto regel).</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">Eksamen-felle:</strong>{" "}
            «hva er source-IP i pakken på destinasjonen?» Hvis det er NAT i veien: ruterens
            public IP. Hvis ikke: opphavets IP. Spørsmål om checksum er klassisk: «hvorfor
            må ruteren regne den på nytt?» Fordi TTL ble dekrementert.
          </div>
        </section>

        <section id="flagg" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">7. TCP-flagg cheatsheet</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-20">Flagg</th>
                  <th className="text-left font-semibold px-4 py-2 w-20">Bit</th>
                  <th className="text-left font-semibold px-4 py-2">Bruk</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">SYN</td><td className="px-4 py-3 font-mono">0x02</td><td className="px-4 py-3 text-muted-foreground">Initiate tilkobling — synkroniser SEQ-nummer. Første pakke i 3-way handshake.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">ACK</td><td className="px-4 py-3 font-mono">0x10</td><td className="px-4 py-3 text-muted-foreground">Bekreft mottak. Etter handshake er ACK satt på alle pakker.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">FIN</td><td className="px-4 py-3 font-mono">0x01</td><td className="px-4 py-3 text-muted-foreground">Pent avslutning. Avsender sier «jeg har ikke mer å sende».</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">RST</td><td className="px-4 py-3 font-mono">0x04</td><td className="px-4 py-3 text-muted-foreground">Brå avslutning. Sendes når noe er feil (port lukket, sekvens-feil).</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">PSH</td><td className="px-4 py-3 font-mono">0x08</td><td className="px-4 py-3 text-muted-foreground">Push — be mottakeren levere data til applikasjonen umiddelbart.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">URG</td><td className="px-4 py-3 font-mono">0x20</td><td className="px-4 py-3 text-muted-foreground">Urgent data — sjelden brukt i praksis.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Tilbake til oversikten</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte-2507" }} className="text-brand hover:underline">DTE-2507-hub</Link>
              {" "}— alle nettverks-mini-kursene.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-wireshark-analyse" }} className="text-brand hover:underline">Wireshark-analyse</Link>
              {" "}— mer praktisk dekoding av ekte pcap-filer.
            </li>
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>{" "}
              under «Wireshark / pcap-analyse».
            </li>
            <li>
              <Link to="/cards" className="text-brand hover:underline">Repetisjonskort</Link>{" "}
              i kategorien <em>sikkerhet</em>.
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}
