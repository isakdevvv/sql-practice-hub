import { StackPageShell } from "@/components/stack/StackPageShell";
import { HexDecoder } from "./HexDecoder";

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
        </header>

        <section className="mb-10">
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

        <section className="mb-10">
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

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Interaktiv hex-dump</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Hold musen over en byte for å se hvilket felt den tilhører, og dens dekodete betydning.
          </p>
          <HexDecoder />
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">4. TCP-flagg cheatsheet</h2>
          <div className="overflow-hidden rounded-lg border border-border">
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
      </article>
    </StackPageShell>
  );
}
