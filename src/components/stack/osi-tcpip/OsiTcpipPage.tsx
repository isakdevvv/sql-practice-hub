import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { OsiStackFlow } from "./OsiStackFlow";
import { LayerVisualizer } from "./LayerVisualizer";
import { RelatedVisualizers } from "@/components/stack/RelatedVisualizers";

const STEPS = [
  { title: "Interaktiv visualisering", anchor: "visualisering" },
  { title: "OSI vs TCP/IP — to modeller", anchor: "modeller" },
  { title: "Encapsulation — pakka inn lag-for-lag", anchor: "encapsulation" },
  { title: "Lag 5: Applikasjon", anchor: "applikasjon" },
  { title: "Lag 4: Transport", anchor: "transport" },
  { title: "Lag 3: Nettverk (IP)", anchor: "nettverk" },
  { title: "Lag 2: Lenke (Ethernet/WiFi)", anchor: "lenke" },
  { title: "Lag 1: Fysisk", anchor: "fysisk" },
  { title: "Hvor bor protokollene? (cheatsheet)", anchor: "hvor" },
];

export function OsiTcpipPage() {
  return (
    <StackPageShell title="OSI- og TCP/IP-modellen" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Stakken
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            OSI- og TCP/IP-modellen — lagdelt kommunikasjon
          </h1>
          <p className="mt-3 text-muted-foreground">
            Hver gang nettleseren din henter en side går request-en gjennom fem lag, ett
            etter ett. Hvert lag har ett enkelt ansvar og snakker bare med laget over og
            under seg. Lær lagene og du forstår nesten alt om nettverk.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              har match og quiz under emnet «OSI/TCP-IP» — plasser protokoller på rett
              lag, sortér encapsulation-stegene.
            </div>
          </div>
        </div>

        <CourseOutline courseId="osi-tcpip" steps={STEPS} />

        <section id="visualisering" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            Interaktiv visualisering — bygg, send og strip pakka
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Fire moduser: <em>innkapsling</em> (legg på header lag-for-lag på vei
            ned), <em>avkapsling</em> (strip på vei opp), <em>OSI vs TCP/IP</em>{" "}
            (klikk et lag for protokoller og PDU), og <em>to-vert-reise</em> (se
            hvilke headere ruteren rewrittet på hvert hopp).
          </p>
          <LayerVisualizer />
        </section>

        <section id="modeller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. OSI vs TCP/IP — to modeller, samme idé</h2>
          <p className="text-sm text-muted-foreground mb-4">
            OSI er den teoretiske 7-lagsmodellen fra 1984. TCP/IP er den
            praktiske 5-lagsmodellen som Internett faktisk bruker. Vi
            holder oss til TCP/IP — det er det Kurose & Ross bruker, og det er det
            studenter blir testet i.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2">OSI (7 lag)</th>
                  <th className="text-left font-semibold px-4 py-2">TCP/IP (5 lag)</th>
                  <th className="text-left font-semibold px-4 py-2">Eksempel</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">7. Application</td>
                  <td className="px-4 py-3 font-mono text-brand" rowSpan={3}>5. Application</td>
                  <td className="px-4 py-3 text-muted-foreground">HTTP, SMTP</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">6. Presentation</td>
                  <td className="px-4 py-3 text-muted-foreground">TLS, JSON-serialisering</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">5. Session</td>
                  <td className="px-4 py-3 text-muted-foreground">Cookies, login-state</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">4. Transport</td>
                  <td className="px-4 py-3 font-mono text-brand">4. Transport</td>
                  <td className="px-4 py-3 text-muted-foreground">TCP, UDP</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">3. Network</td>
                  <td className="px-4 py-3 font-mono text-brand">3. Network</td>
                  <td className="px-4 py-3 text-muted-foreground">IP, ICMP</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">2. Data Link</td>
                  <td className="px-4 py-3 font-mono text-brand">2. Link</td>
                  <td className="px-4 py-3 text-muted-foreground">Ethernet, WiFi</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">1. Physical</td>
                  <td className="px-4 py-3 font-mono text-brand">1. Physical</td>
                  <td className="px-4 py-3 text-muted-foreground">Kabel, fiber, radio</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Husk-mnemonic for OSI (topp-til-bunn): <em>«All People Seem To Need Data
            Processing»</em> — Application, Presentation, Session, Transport, Network,
            Data link, Physical.
          </p>
        </section>

        <section id="encapsulation" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Encapsulation — pakka inn lag-for-lag</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Når du sender en HTTP-request, pakker hvert lag på sin egen header (og noen
            ganger trailer). Du kan tenke på det som å legge brev i konvolutter inne i
            konvolutter.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Send-rekkefølge (ned-gjennom på sender):

  +─────────────────────────────────────────────────────+
  │ HTTP-request: GET /side HTTP/1.1                     │   ← Lag 5 (Application)
  +─────────────────────────────────────────────────────+
                       ↓
  +─[ TCP-header: srcPort=54321, dstPort=80 ]────────────+
  │ HTTP-request: GET /side HTTP/1.1                     │   ← Lag 4 (Transport segment)
  +─────────────────────────────────────────────────────+
                       ↓
  +─[ IP-header: src=10.0.0.5, dst=93.184.216.34 ]───────+
  │ TCP-header + HTTP-request                            │   ← Lag 3 (Network packet)
  +─────────────────────────────────────────────────────+
                       ↓
  +─[ Ethernet-header: srcMAC=aa:bb..., dstMAC=cc:dd... ]+
  │ IP-pakke + TCP + HTTP                                │   ← Lag 2 (Link frame)
  +─────────────────────────────────────────────────────+
                       ↓
                  bits over kabel  ← Lag 1 (Physical)`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Mottakeren reverserer: stripper Ethernet-headeren først (lag 2), så
            IP-headeren (lag 3), så TCP (lag 4), så leverer HTTP-bodyen til
            applikasjonen.
          </p>
          <div className="mt-6">
            <OsiStackFlow />
          </div>
        </section>

        <section id="applikasjon" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Lag 5: Applikasjon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Det laget der brukeren faktisk gjør noe. Alle protokollene du møter når du
            programmerer bor her.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Protokoll</th>
                  <th className="text-left font-semibold px-4 py-2 w-20">Port</th>
                  <th className="text-left font-semibold px-4 py-2">Hva den gjør</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">HTTP</td>
                  <td className="px-4 py-3 font-mono">80</td>
                  <td className="px-4 py-3 text-muted-foreground">Hent/send nettsider — klartekst</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">HTTPS</td>
                  <td className="px-4 py-3 font-mono">443</td>
                  <td className="px-4 py-3 text-muted-foreground">HTTP + TLS-kryptert</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">DNS</td>
                  <td className="px-4 py-3 font-mono">53</td>
                  <td className="px-4 py-3 text-muted-foreground">Domenenavn → IP-adresse</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">SMTP</td>
                  <td className="px-4 py-3 font-mono">25/587</td>
                  <td className="px-4 py-3 text-muted-foreground">Send e-post</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">IMAP</td>
                  <td className="px-4 py-3 font-mono">143/993</td>
                  <td className="px-4 py-3 text-muted-foreground">Hent e-post (server-basert)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">SSH</td>
                  <td className="px-4 py-3 font-mono">22</td>
                  <td className="px-4 py-3 text-muted-foreground">Kryptert remote shell</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">FTP</td>
                  <td className="px-4 py-3 font-mono">21</td>
                  <td className="px-4 py-3 text-muted-foreground">Filoverføring — klartekst, utdatert</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">DHCP</td>
                  <td className="px-4 py-3 font-mono">67/68</td>
                  <td className="px-4 py-3 text-muted-foreground">Tildele IP automatisk</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Port-tall under 1024 er «well-known». Når du starter en HTTP-server på Linux
            må du være root for å binde port 80 — derfor brukes 8080/8000 i utvikling.
          </p>
        </section>

        <section id="transport" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Lag 4: Transport</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Ansvar: <strong>ende-til-ende mellom prosesser</strong>. Identifisert av
            port-nummer. To hovedaktører:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">TCP</div>
              <ul className="space-y-1 text-sm text-foreground list-disc pl-5">
                <li><strong>Tilkoblet</strong> — 3-veis håndtrykk først</li>
                <li><strong>Pålitelig</strong> — bekrefter mottak, retransmitterer tapt</li>
                <li><strong>Rekkefølge-bevarende</strong></li>
                <li><strong>Flow control</strong> — sender ikke raskere enn mottaker takler</li>
                <li><strong>Congestion control</strong> — sakker ned ved overbelastning</li>
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">Brukes for: HTTP, SMTP, SSH, FTP — alt som krever korrekt levering.</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">UDP</div>
              <ul className="space-y-1 text-sm text-foreground list-disc pl-5">
                <li><strong>Forbindelsesløs</strong> — bare send</li>
                <li><strong>Upålitelig</strong> — pakker kan forsvinne uten varsel</li>
                <li><strong>Rekkefølge ikke garantert</strong></li>
                <li><strong>Ingen flow/congestion control</strong></li>
                <li><strong>Lav overhead</strong> — kun 8 byte header</li>
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">Brukes for: DNS, video-streaming, spill, VoIP — der lav latency er viktigere enn 100% levering.</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Detaljer på{" "}
            <Link to="/stack/$slug" params={{ slug: "transportlag" }} className="text-brand hover:underline">
              Transportlag-siden
            </Link>{" "}— inkludert 3-veis håndtrykk, sliding window og congestion control.
          </p>
        </section>

        <section id="nettverk" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Lag 3: Nettverk (IP)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Ansvar: <strong>rute pakker mellom nettverk</strong>. IP er
            forbindelsesløst og best-effort — det er TCP som legger på pålitelighet.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">IPv4-adresse</div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`93.184.216.34 / 24
└──────────┘ └────┘  └─┘
network-del   host    prefix-lengde

Subnet-maske /24 = 255.255.255.0
→ 256 adresser i dette nettet (rekken 93.184.216.0-255)
→ network: 93.184.216.0, broadcast: 93.184.216.255`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Spesielle adresser</div>
            <ul className="space-y-1 text-sm text-foreground">
              <li><code>127.0.0.1</code> — loopback (deg selv)</li>
              <li><code>192.168.0.0/16</code>, <code>10.0.0.0/8</code>, <code>172.16.0.0/12</code> — private (RFC 1918)</li>
              <li><code>0.0.0.0</code> — «alle grensesnitt» eller «ukjent kilde»</li>
              <li><code>255.255.255.255</code> — limited broadcast (samme nett)</li>
            </ul>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Andre lag-3-protokoller</div>
            <ul className="space-y-1 text-sm text-foreground">
              <li><strong>ICMP</strong> — feilmeldinger og ping</li>
              <li><strong>ARP</strong> — IP → MAC (lever på grensen lag 2/3)</li>
              <li><strong>OSPF, BGP</strong> — ruting-protokoller mellom rutere</li>
            </ul>
          </div>
        </section>

        <section id="lenke" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Lag 2: Lenke (Ethernet/WiFi)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Ansvar: <strong>én hopp på samme nettverk</strong>. Identifisert av
            MAC-adresse (48-bit, brent inn i nettverkskortet).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Ethernet-frame:
+─────────+──────────+───────+──────────────+─────+
│ dst MAC │ src MAC  │ type  │ payload      │ FCS │
│ 6 byte  │ 6 byte   │ 2 b   │ 46-1500 byte │ 4 b │
+─────────+──────────+───────+──────────────+─────+

MAC-adresse: aa:bb:cc:dd:ee:ff
  - første 24 bit: produsent-OUI (Apple, Dell, ...)
  - siste 24 bit: serie-nummer fra produsenten`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>ARP-prosessen:</strong> for å sende til en IP i samme nett må du
            først vite MAC-en. ARP-request («hvem har 192.168.1.5?») går som broadcast,
            mottaker svarer med sin MAC.
          </p>
        </section>

        <section id="fysisk" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Lag 1: Fysisk</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Ansvar: <strong>bits over fysisk medium</strong>. Spenning på kobber,
            lyspulser i fiber, radiobølger i lufta. Hardware-spesifikasjon mer enn
            programmering.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <ul className="space-y-1 text-sm text-foreground list-disc pl-5">
              <li><strong>Kobber (TP):</strong> Ethernet-kabler, RJ-45, opp til 10 Gbit/s</li>
              <li><strong>Fiber:</strong> SM/MM-fiber, lyspuls — flere Tbit/s, lange avstander</li>
              <li><strong>Radio:</strong> WiFi (2.4/5 GHz), 4G/5G, Bluetooth</li>
            </ul>
          </div>
        </section>

        <section id="hvor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. «Hvor bor protokollen?» — cheatsheet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Lær denne tabellen utenat — eksamen tester den nesten alltid.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2">Protokoll</th>
                  <th className="text-left font-semibold px-4 py-2">Lag</th>
                  <th className="text-left font-semibold px-4 py-2">Notat</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">HTTP, HTTPS</td><td className="px-4 py-3">5</td><td className="px-4 py-3 text-muted-foreground">Web</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">SMTP, IMAP, POP3</td><td className="px-4 py-3">5</td><td className="px-4 py-3 text-muted-foreground">E-post</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">DNS</td><td className="px-4 py-3">5</td><td className="px-4 py-3 text-muted-foreground">Navnoppslag (over UDP)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">SSH, FTP</td><td className="px-4 py-3">5</td><td className="px-4 py-3 text-muted-foreground">Remote/filer</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">TLS</td><td className="px-4 py-3">5/6</td><td className="px-4 py-3 text-muted-foreground">Mellom app og transport — formelt mellom 4 og 7</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">TCP, UDP</td><td className="px-4 py-3">4</td><td className="px-4 py-3 text-muted-foreground">Transport</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">IP (v4/v6)</td><td className="px-4 py-3">3</td><td className="px-4 py-3 text-muted-foreground">Ruting</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">ICMP</td><td className="px-4 py-3">3</td><td className="px-4 py-3 text-muted-foreground">Ping, traceroute</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">OSPF, BGP</td><td className="px-4 py-3">3</td><td className="px-4 py-3 text-muted-foreground">Ruting-protokoller</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">ARP</td><td className="px-4 py-3">2/3</td><td className="px-4 py-3 text-muted-foreground">IP→MAC, bro mellom lag</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">Ethernet, WiFi</td><td className="px-4 py-3">2</td><td className="px-4 py-3 text-muted-foreground">Lokal-nett</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : plasser protokoller på rett lag, sortér encapsulation-stegene.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "transportlag" }} className="text-brand hover:underline">
                Transportlag
              </Link>
              : TCP/UDP-dypdykk.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
        <RelatedVisualizers slug="osi-lag" />
      </div>
    </StackPageShell>
  );
}
