import { Link } from "@tanstack/react-router";
import {Lightbulb, ScanSearch, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hva er Wireshark", anchor: "intro" },
  { title: "Anatomien til en pakke", anchor: "anatomi" },
  { title: "Filter-syntaks (display filters)", anchor: "filtre" },
  { title: "HTTP-GET-flyt — frame for frame", anchor: "http" },
  { title: "DNS-spørring", anchor: "dns" },
  { title: "TLS-handshake i Wireshark", anchor: "tls" },
  { title: "ARP-spoofing og MITM", anchor: "arp" },
  { title: "Wireshark vs tcpdump", anchor: "tcpdump" },
  { title: "Pcap-quiz — øv selv", anchor: "quiz" },
];

type Row = {
  no: string;
  time: string;
  src: string;
  dst: string;
  proto: string;
  info: string;
};

const HTTP_FLOW: Row[] = [
  { no: "1", time: "0.000", src: "10.0.0.5", dst: "93.184.216.34", proto: "TCP",  info: "49152 → 80 [SYN] Seq=0 Win=64240" },
  { no: "2", time: "0.024", src: "93.184.216.34", dst: "10.0.0.5", proto: "TCP",  info: "80 → 49152 [SYN, ACK] Seq=0 Ack=1 Win=65535" },
  { no: "3", time: "0.024", src: "10.0.0.5", dst: "93.184.216.34", proto: "TCP",  info: "49152 → 80 [ACK] Seq=1 Ack=1 Win=64240" },
  { no: "4", time: "0.025", src: "10.0.0.5", dst: "93.184.216.34", proto: "HTTP", info: "GET /index.html HTTP/1.1 Host: example.com" },
  { no: "5", time: "0.052", src: "93.184.216.34", dst: "10.0.0.5", proto: "TCP",  info: "80 → 49152 [ACK] Seq=1 Ack=78 Win=65535" },
  { no: "6", time: "0.080", src: "93.184.216.34", dst: "10.0.0.5", proto: "HTTP", info: "HTTP/1.1 200 OK (text/html, 1256 bytes)" },
  { no: "7", time: "0.081", src: "10.0.0.5", dst: "93.184.216.34", proto: "TCP",  info: "49152 → 80 [ACK] Seq=78 Ack=1257 Win=64240" },
  { no: "8", time: "0.110", src: "10.0.0.5", dst: "93.184.216.34", proto: "TCP",  info: "49152 → 80 [FIN, ACK] Seq=78 Ack=1257" },
  { no: "9", time: "0.135", src: "93.184.216.34", dst: "10.0.0.5", proto: "TCP",  info: "80 → 49152 [FIN, ACK] Seq=1257 Ack=79" },
  { no: "10", time: "0.136", src: "10.0.0.5", dst: "93.184.216.34", proto: "TCP", info: "49152 → 80 [ACK] Seq=79 Ack=1258" },
];

const DNS_FLOW: Row[] = [
  { no: "1", time: "0.000", src: "10.0.0.5", dst: "8.8.8.8",  proto: "DNS", info: "Standard query 0x9ab1 A example.com" },
  { no: "2", time: "0.018", src: "8.8.8.8",  dst: "10.0.0.5", proto: "DNS", info: "Standard query response 0x9ab1 A 93.184.216.34" },
];

const TLS_FLOW: Row[] = [
  { no: "1", time: "0.000", src: "10.0.0.5", dst: "93.184.216.34", proto: "TCP", info: "49210 → 443 [SYN]" },
  { no: "2", time: "0.024", src: "93.184.216.34", dst: "10.0.0.5", proto: "TCP", info: "443 → 49210 [SYN, ACK]" },
  { no: "3", time: "0.024", src: "10.0.0.5", dst: "93.184.216.34", proto: "TCP", info: "49210 → 443 [ACK]" },
  { no: "4", time: "0.025", src: "10.0.0.5", dst: "93.184.216.34", proto: "TLSv1.3", info: "Client Hello (SNI=example.com)" },
  { no: "5", time: "0.052", src: "93.184.216.34", dst: "10.0.0.5", proto: "TLSv1.3", info: "Server Hello, Change Cipher Spec, Encrypted Extensions, Certificate, Finished" },
  { no: "6", time: "0.054", src: "10.0.0.5", dst: "93.184.216.34", proto: "TLSv1.3", info: "Change Cipher Spec, Finished" },
  { no: "7", time: "0.054", src: "10.0.0.5", dst: "93.184.216.34", proto: "TLSv1.3", info: "Application Data (GET ...)" },
  { no: "8", time: "0.085", src: "93.184.216.34", dst: "10.0.0.5", proto: "TLSv1.3", info: "Application Data (HTTP/1.1 200 OK ...)" },
];

function PcapTable({ rows, highlight }: { rows: Row[]; highlight?: string[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-xs font-mono">
        <thead className="bg-muted/40 text-muted-foreground">
          <tr>
            <th className="text-left px-3 py-2 w-10">No.</th>
            <th className="text-left px-3 py-2 w-16">Time</th>
            <th className="text-left px-3 py-2 w-32">Source</th>
            <th className="text-left px-3 py-2 w-32">Destination</th>
            <th className="text-left px-3 py-2 w-20">Protocol</th>
            <th className="text-left px-3 py-2">Info</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const hl = highlight?.includes(r.no);
            return (
              <tr key={r.no} className={`border-t border-border ${hl ? "bg-brand/10" : ""}`}>
                <td className="px-3 py-1.5">{r.no}</td>
                <td className="px-3 py-1.5">{r.time}</td>
                <td className="px-3 py-1.5">{r.src}</td>
                <td className="px-3 py-1.5">{r.dst}</td>
                <td className="px-3 py-1.5 text-brand">{r.proto}</td>
                <td className="px-3 py-1.5">{r.info}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function WiresharkAnalysePage() {
  return (
    <StackPageShell title="Wireshark / pcap-analyse" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Praksis
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Wireshark og pcap-analyse — å lese trafikk
          </h1>
          <p className="mt-3 text-muted-foreground">
            Pensum lister Wireshark som obligatorisk verktoy. Eksamensoppgavene
            spor ikke bare hva en SYN er — de viser deg en pcap-utskrift og
            spor «hvilket lag, hvilken protokoll, hva returnerer serveren?».
            Her trener vi nettopp den oversettelsen.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/dte2507/pcap" className="text-brand hover:underline">/dte2507/pcap</Link>{" "}
              har 15+ pcap-scenarier med multiple-choice. Same tabell-format som
              eksamens-oppgaver bruker.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2507-wireshark-analyse" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva er Wireshark</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Wireshark er en <strong>pakke-sniffer</strong>: den setter
            nettverkskortet i promiscuous mode (eller henter trafikk fra et
            SPAN-port), dekoder bytes pa lag 2-7 og viser dem som leselige
            felter. En <strong>.pcap</strong>-fil er rad-data fra en sniffing-okt
            — du kan apne den senere uten a vere palogget pa nettet.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 text-sm">
            <h3 className="font-semibold mb-2">Tre vinduer du moter alltid</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Packet list (oppe):</strong> en
                rad per ramme — No, Time, Source, Destination, Protocol, Info.
                Dette er det vi viser som tabeller i denne leksjonen.
              </li>
              <li>
                <strong className="text-foreground">Packet details (midt):</strong> trel-visning
                av samme ramme dekodet per lag: Frame → Ethernet → IP → TCP → HTTP.
              </li>
              <li>
                <strong className="text-foreground">Packet bytes (nederst):</strong> raw
                hex + ASCII. Klikker du pa et felt i details, lyser de tilsvarende
                bytene opp her.
              </li>
            </ul>
          </div>
        </section>

        <section id="anatomi" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Anatomien til en pakke</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En HTTP-request over kabel ser slik ut i full encapsulation. Hvert lag
            har en header som det neste laget er payload til.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`[ Ethernet header        | IP header     | TCP header    | HTTP payload         ]
  src MAC, dst MAC          src IP, dst IP  src port, dst   GET /index.html HTTP/1.1
  EtherType=0x0800 (IPv4)   TTL, proto=6    seq, ack, flags Host: example.com
                                                            User-Agent: ...

Lag 2 (link)              Lag 3 (network)  Lag 4 (transport) Lag 7 (application)`}</pre>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Naar Wireshark dekoder, viser den hvert lag som en egen seksjon i
            Packet Details. Det er der du <em>ser</em> at HTTP er payload til TCP,
            som er payload til IP, som er payload til Ethernet.
          </p>
        </section>

        <section id="filtre" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Filter-syntaks (display filters)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Wireshark har <strong>capture filter</strong> (BPF, bestemmer hva som
            sniffes) og <strong>display filter</strong> (det du skriver i bar-en
            for a skjule rader i en allerede capturet sesjon). Eksamen tester
            sistnevnte — den ser slik ut:
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left px-3 py-2 w-1/2">Filter</th>
                  <th className="text-left px-3 py-2">Matcher</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">tcp.port == 80</td><td className="px-3 py-2 text-muted-foreground">All HTTP-trafikk (port 80 enten src eller dst)</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">tcp.port == 443</td><td className="px-3 py-2 text-muted-foreground">All HTTPS/TLS-trafikk</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">ip.addr == 10.0.0.1</td><td className="px-3 py-2 text-muted-foreground">All trafikk til eller fra 10.0.0.1</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">ip.src == 10.0.0.5</td><td className="px-3 py-2 text-muted-foreground">Bare trafikk SENDT fra 10.0.0.5</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">http.request</td><td className="px-3 py-2 text-muted-foreground">Bare rammer som inneholder en HTTP-request-linje</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">http.response.code == 200</td><td className="px-3 py-2 text-muted-foreground">Bare HTTP-svar med status 200</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">tls.handshake</td><td className="px-3 py-2 text-muted-foreground">TLS-haandtrykk-meldinger (ClientHello, etc.)</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">dns</td><td className="px-3 py-2 text-muted-foreground">Alle DNS-rammer (sporringer + svar)</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">tcp.flags.syn == 1 &amp;&amp; tcp.flags.ack == 0</td><td className="px-3 py-2 text-muted-foreground">Ren SYN — forste pakke i et 3-way handshake (port-skann)</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">arp</td><td className="px-3 py-2 text-muted-foreground">Alle ARP-rammer</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">not arp and not dns</td><td className="px-3 py-2 text-muted-foreground">Filtrer bort stoy</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Tips: skriv filter, trykk Enter. Hvis bar-en er gronn, parser den greit;
            roed = syntaksfeil; gul = gyldig men kan vere uhensiktsmessig (f.eks.
            <code> ip.addr != 10.0.0.1 </code>matcher alt som har et annet adresse-felt — bruk{" "}
            <code>!(ip.addr == 10.0.0.1)</code> i stedet).
          </p>
        </section>

        <section id="http" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. HTTP-GET-flyt — frame for frame</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Her er hva som faktisk skjer naar nettleseren henter
            <code> http://example.com/index.html</code>. Forst TCP 3-way handshake,
            sa HTTP, sa graceful close. Eksamen-favoritt: identifiser ramme-numrene
            for hvert steg.
          </p>
          <PcapTable rows={HTTP_FLOW} highlight={["1", "2", "3", "4", "6"]} />
          <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">3-way handshake</div>
              <p className="text-muted-foreground">Ramme 1-3: SYN, SYN-ACK, ACK. TCP-tilkoblingen er etablert.</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">Request → response</div>
              <p className="text-muted-foreground">Ramme 4 er GET, ramme 6 er 200 OK. Bytt ut 6 med 404 og du har et eksamens-sporsmal.</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">ACK i mellom</div>
              <p className="text-muted-foreground">Ramme 5 og 7 er pure ACK-er — TCP kvitterer pa data, ingen HTTP-payload.</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">FIN-shutdown</div>
              <p className="text-muted-foreground">Ramme 8-10: FIN, FIN-ACK, ACK. Tilkoblingen lukkes graceful (i motsetning til RST = brutalt).</p>
            </div>
          </div>
        </section>

        <section id="dns" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. DNS-sporring</h2>
          <p className="text-sm text-muted-foreground mb-4">
            DNS gar nesten alltid over UDP port 53 — en sporring, ett svar, ingen
            handshake. Det er derfor DNS er saa raskt.
          </p>
          <PcapTable rows={DNS_FLOW} />
          <p className="mt-3 text-xs text-muted-foreground">
            Transaction ID (0x9ab1) lar klienten matche svar mot sporring. Hvis
            du ser et svar med en ID du aldri sendte, kan det vere et DNS-spoofing-forsok.
          </p>
        </section>

        <section id="tls" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. TLS-handshake i Wireshark</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Sammenlign denne sekvensen med TLS-leksjonen din. Praktisk poeng: SNI
            (Server Name Indication) ligger i klartekst i Client Hello — derfor
            kan en sniffer se HVILKET domene du gar til selv om payload er
            kryptert. ESNI/ECH er forsok pa a skjule det.
          </p>
          <PcapTable rows={TLS_FLOW} />
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <h3 className="font-semibold mb-2">Hvilke rammer er sjekk-bare i eksamen?</h3>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Ramme 4: Client Hello — server-navn synlig.</li>
              <li>Ramme 5: TLS 1.3 sender hele server-siden inkl. sertifikat i én kryptert pakke (etter ServerHello-headeren).</li>
              <li>Ramme 7-8: Application Data — selve HTTP-en er kryptert. Wireshark viser bare lengde.</li>
            </ul>
          </div>
        </section>

        <section id="arp" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. ARP-spoofing og MITM</h2>
          <p className="text-sm text-muted-foreground mb-4">
            ARP er protokollen som mapper IP-adresser til MAC-adresser pa et lokalt
            nett. Den har ingen autentisering — sender du et ARP-reply, blir det
            trodd. Klassisk MITM:
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Normalt:
  Offer:  "Hvem har 10.0.0.1?"  (broadcast ARP request)
  Router: "Det er meg pa AA:BB:CC:DD:EE:01" (ARP reply)

Angrep (Mallory):
  Mallory →broadcast→ "10.0.0.1 er meg pa MA:LL:OR:Y0:00:01"
  Offer skriver til ARP-cache: 10.0.0.1 → MA:LL:OR:Y0:00:01
  Trafikk som skulle til router gar na via Mallory.

I Wireshark ser du:
  - to ARP-replies med samme IP men forskjellig MAC
  - eller en gratuitous ARP fra en ny MAC like for trafikken plutselig endrer rute`}</pre>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Forsvar: <strong>statiske ARP-entries</strong> for kritiske hoster,{" "}
            <strong>Dynamic ARP Inspection (DAI)</strong> pa switchen, og{" "}
            <strong>TLS</strong> som beskytter <em>innholdet</em> selv om noen
            sitter i midten.
          </p>
        </section>

        <section id="tcpdump" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Wireshark vs tcpdump</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-5 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <ScanSearch className="h-4 w-4 text-brand" />
                <h3 className="font-semibold">Wireshark</h3>
              </div>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>GUI, dekoder hundre protokoller med navngitte felter</li>
                <li>Display filter-spraket (<code>http.request</code>, …)</li>
                <li>Følg en stream — vis hele HTTP-konversasjonen samlet</li>
                <li>Krever GUI — ikke alltid mulig pa server</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <ScanSearch className="h-4 w-4 text-brand" />
                <h3 className="font-semibold">tcpdump</h3>
              </div>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>CLI, perfekt pa headless servere</li>
                <li>BPF capture filter (<code>port 80 and host 10.0.0.1</code>)</li>
                <li>Lagrer .pcap som du senere apner i Wireshark</li>
                <li>Vanskeligere a lese application-lag uten ekstra flagg</li>
              </ul>
            </div>
          </div>
          <pre className="mt-4 rounded-lg border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`# Vanlig tcpdump-rutine:
sudo tcpdump -i eth0 -w capture.pcap port 443
# stopp med Ctrl+C, ta filen over pa egen maskin
scp server:capture.pcap .
wireshark capture.pcap`}</pre>
        </section>

        <section id="quiz" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">9. Pcap-quiz — øv selv</h2>
          <p className="text-sm text-muted-foreground mb-4">
            15 scenarier med multiple-choice. Same tabell-format som du moter pa
            eksamen — frame, time, src, dst, protocol, info. Klikk deg gjennom,
            les forklaringen pa hver.
          </p>
          <Link
            to="/dte2507/pcap"
            className="inline-flex items-center gap-2 rounded-lg border border-brand/40 bg-brand/10 px-4 py-2 text-sm font-medium text-brand hover:bg-brand/15 transition-colors"
          >
            Apne pcap-quiz →
          </Link>
        </section>

        <div className="rounded-xl border border-border bg-card p-5 text-sm mt-10">
          <h2 className="font-semibold mb-2">Hva nesten alltid sporres i eksamen</h2>
          <ul className="list-disc pl-5 text-muted-foreground space-y-1">
            <li>«Hvilket lag bor protokollen pa?» — kjenn pa TCP/UDP/IP/HTTP/ARP/DNS.</li>
            <li>«Hvilken status-kode returnerer serveren?» — les Info-feltet.</li>
            <li>«Hva er ramme-nummer for siste pakke i 3-way handshake?» — kjenn rekkefolgen SYN, SYN-ACK, ACK.</li>
            <li>«Hvilket display-filter viser bare HTTP-svar?» — <code>http.response</code>.</li>
            <li>«Hva i Client Hello er ikke kryptert?» — SNI (servernavnet).</li>
          </ul>
        </div>
              <div className="mt-6">
          <Link
            to="/stack/$slug"
            params={{ slug: "dte-2507" }}
            className="text-brand hover:underline inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tilbake til DTE-2507-hub
          </Link>
        </div>
</div>
    </StackPageShell>
  );
}
