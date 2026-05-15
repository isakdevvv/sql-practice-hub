import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { TcpSlidingWindow } from "./TcpSlidingWindow";
import { TcpStateMachine } from "./TcpStateMachine";
import { TcpVisualizer } from "./TcpVisualizer";

const STEPS = [
  { title: "TCP-visualisator — alle moduser", anchor: "tcp-visualizer" },
  { title: "Ansvarsområdet til transport", anchor: "ansvar" },
  { title: "Multipleksing — portnummer", anchor: "porter" },
  { title: "UDP — enkel og rask", anchor: "udp" },
  { title: "TCP — 3-veis håndtrykk", anchor: "handshake" },
  { title: "Pålitelig levering — ACK + retransmisjon", anchor: "ack" },
  { title: "Sliding window", anchor: "window" },
  { title: "Sliding window — interaktiv", anchor: "window-int" },
  { title: "Flow control vs congestion control", anchor: "control" },
  { title: "Lukking — 4-veis avskjed", anchor: "close" },
  { title: "TCP-tilstandsmaskin — interaktiv", anchor: "state-machine" },
];

export function TransportlagPage() {
  return (
    <StackPageShell title="Transportlag — TCP og UDP" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Lag 4
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Transportlag — TCP og UDP i dybden
          </h1>
          <p className="mt-3 text-muted-foreground">
            Transport gjør én ting: levere data fra én prosess til en annen, ende til
            ende. To valg: TCP (pålitelig, tilkoblet) eller UDP (enkel, ingen
            garantier). Hva som faktisk skjer under TCP er bygd opp av tre mekanismer —
            håndtrykk, retransmisjon, og window-håndtering.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «Transportlag» — sortér håndtrykk-steg, quiz om TCP vs UDP, fyll inn
              segment-headere.
            </div>
          </div>
        </div>

        <CourseOutline courseId="transportlag" steps={STEPS} />

        <section id="tcp-visualizer" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">
            TCP-visualisator — fire moduser på rad
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Én komponent, fire perspektiver: spill av <strong>3-veis handshake</strong>{" "}
            med ekte seq/ack-numre, kjør hele <strong>livssyklusen</strong> fra open
            til 4-veis close, klikk deg gjennom den <strong>interaktive
            tilstandsmaskinen</strong>, eller dra <strong>sliding window</strong>{" "}
            forover med cwnd og rwnd. Bytt modus med knappene øverst.
          </p>
          <TcpVisualizer />
        </section>

        <section id="ansvar" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Ansvarsområdet til transport</h2>
          <p className="text-sm text-muted-foreground mb-4">
            IP-laget under leverer pakker mellom <em>maskiner</em>. Transport-laget
            leverer mellom <em>prosesser</em> på maskinene. Forskjellen er hvilken
            applikasjon som skal ha bytene.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`            Maskin A                        Maskin B
       +─────────────+                  +─────────────+
       │  Chrome     │                  │ Firefox     │
       │  port 54321 │                  │ port 54322  │
       │             │  ────TCP────────► │             │
       │  iTerm SSH  │                  │ Spotify     │
       │  port 54323 │                  │ port 54324  │
       +─────────────+                  +─────────────+
              │                                │
              └──────── samme IP-pakker ───────┘
        Transport ruter til riktig prosess via portnummer`}</pre>
          </div>
        </section>

        <section id="porter" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Multipleksing — portnummer</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Portnummer er 16-bit (0–65535). En tilkobling er en <strong>4-tuple</strong>:
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5 text-sm">
            <code className="font-mono">(srcIP, srcPort, dstIP, dstPort)</code>
            <p className="mt-2 text-foreground">
              Hver unike kombinasjon er sin egen forbindelse. Det er derfor du kan ha
              mange faner åpne mot samme nettside — hver fane bruker forskjellig srcPort.
            </p>
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2">Range</th>
                  <th className="text-left font-semibold px-4 py-2">Type</th>
                  <th className="text-left font-semibold px-4 py-2">Bruk</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">0–1023</td><td className="px-4 py-3">Well-known</td><td className="px-4 py-3 text-muted-foreground">HTTP (80), HTTPS (443), SSH (22), DNS (53). Krever root.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">1024–49151</td><td className="px-4 py-3">Registrerte</td><td className="px-4 py-3 text-muted-foreground">PostgreSQL (5432), Redis (6379), HTTP-dev (8080)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">49152–65535</td><td className="px-4 py-3">Ephemeral</td><td className="px-4 py-3 text-muted-foreground">OS deler ut til klient-tilkoblinger</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="udp" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. UDP — enkel og rask</h2>
          <p className="text-sm text-muted-foreground mb-4">
            UDP-headeren er bare 8 byte. Den gjør én ting: levere data til riktig port.
            Ingen garantier på rekkefølge, levering, eller duplikater.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`UDP-header (8 byte):
+──────────────+──────────────+
│ srcPort (2)  │ dstPort (2)  │
+──────────────+──────────────+
│ length (2)   │ checksum (2) │
+──────────────+──────────────+
│ data ...                    │
+─────────────────────────────+`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Brukes der lav latency er viktigere enn pålitelighet: DNS (én spørring, ett svar),
            VoIP, video-streaming (heller dropp en frame enn å pause), spill, DHCP, NTP.
            Hvis du faktisk trenger pålitelighet over UDP — bygg det selv eller bruk QUIC.
          </p>
        </section>

        <section id="handshake" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. TCP — 3-veis håndtrykk</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Før TCP kan sende data må klient og server etablere en forbindelse. Det
            skjer i tre steg, hvert med SYN- eller ACK-flagg.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Klient                                            Server
  │                                                  │
  │ ─── 1. SYN, seq=x ──────────────────────────────► │
  │                                                  │
  │ ◄── 2. SYN+ACK, seq=y, ack=x+1 ───────────────── │
  │                                                  │
  │ ─── 3. ACK, ack=y+1 ────────────────────────────► │
  │                                                  │
  │           Forbindelsen er nå åpen                 │
  │                                                  │
  │ ─── DATA: GET /side HTTP/1.1 ──────────────────► │
  │                                                  │`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Hvorfor tre meldinger?</strong> Begge sidene må vite at den andre
            har mottatt SYN-en sin. SYN-ACK fra serveren bekrefter klienten sin SYN OG
            sender serverens egen SYN. Tredje ACK bekrefter at klienten mottok server-SYN.
            Da har begge bekreftet at de hører den andre.
          </p>
        </section>

        <section id="ack" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Pålitelig levering — ACK + retransmisjon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            For hver byte TCP sender, venter den på en bekreftelse (ACK). Får den ikke
            ACK innen en timeout, sender den på nytt.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Avsender                                  Mottaker
  │                                          │
  │ ─── seq=100, data (100 bytes) ──────────► │
  │ ─── seq=200, data (100 bytes) ──────────► │   ← går tapt!
  │ ─── seq=300, data (100 bytes) ──────────► │
  │                                          │
  │ ◄── ACK=200 ───────────────────────────── │   ← bekrefter alt før seq=200
  │ ◄── ACK=200 (igjen — duplikat ACK) ───── │   ← signalerer hull
  │ ◄── ACK=200 (igjen) ───────────────────── │
  │                                          │
  │ ─── seq=200, retransmit ────────────────► │   ← fast retransmit ved 3 dupl. ACK
  │                                          │
  │ ◄── ACK=400 ───────────────────────────── │   ← nå er alt mottatt`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Algoritmen heter <strong>cumulative ACK</strong> — ACK=N betyr «jeg har
            mottatt alt før byte N, send meg fra og med N». Tre duplikate ACK-er trigger
            Fast Retransmit uten å vente på timeout.
          </p>
        </section>

        <section id="window" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Sliding window</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hvis TCP måtte vente på ACK etter hvert eneste byte ville det vært
            forferdelig sakte. Sliding window lar avsender ha mange byte «in flight» før
            den må vente.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Avsenderens buffer:

  [ ackede ] [ sendt, ikke acket ] [ kan sendes ] [ for langt fram ]
              └──── window ────────┘

Når ACK kommer for nye byte, glir vinduet til høyre.
window-size annonseres av mottakeren i hver ACK.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Vinduet er typisk 64 KB eller mer på moderne nett (med window-scaling enda
            større). Det er det som lar TCP fylle en gigabit-link med en enkelt
            forbindelse.
          </p>
        </section>

        <section id="window-int" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6b. Sliding window — interaktiv</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Drag på vindusslideren og send segmenter manuelt. Du ser i sanntid hvor
            mange bytes som er &quot;in flight&quot;, og hvordan vinduet glir forover
            når ACKs kommer. Tap en pakke og se hvordan sender må retransmittere.
          </p>
          <TcpSlidingWindow />
        </section>

        <section id="control" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Flow control vs congestion control</h2>
          <p className="text-sm text-muted-foreground mb-4">
            To forskjellige problemer, to forskjellige mekanismer:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Flow control
              </div>
              <p className="text-sm text-foreground mb-2">
                <strong>Mottakeren</strong> kan ikke ta unna data raskt nok.
              </p>
              <p className="text-sm text-muted-foreground">
                Mekanisme: mottaker annonserer <code>rwnd</code> (receive window) i hver
                ACK. Avsender ser «du har bare 10 KB ledig» og venter.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Congestion control
              </div>
              <p className="text-sm text-foreground mb-2">
                <strong>Nettverket mellom</strong> er overbelastet — pakker droppes.
              </p>
              <p className="text-sm text-muted-foreground">
                Mekanisme: avsender holder <code>cwnd</code> (congestion window).
                Vokser eksponentielt ved start (slow start), halveres ved pakketap.
                Algoritmer: TCP Reno, CUBIC, BBR.
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Faktisk sending begrenses av <code>min(rwnd, cwnd)</code>. Begge må gi
            grønt lys.
          </p>
        </section>

        <section id="close" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Lukking — 4-veis avskjed</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En TCP-forbindelse er dupleks (begge veier). Hver side må lukke sin retning
            for seg — derav fire meldinger.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Klient                                            Server
  │                                                  │
  │ ─── 1. FIN ─────────────────────────────────────► │   ← klient ferdig å sende
  │ ◄── 2. ACK ───────────────────────────────────── │
  │                                                  │
  │       (server kan fortsatt sende data)            │
  │                                                  │
  │ ◄── 3. FIN ───────────────────────────────────── │   ← server ferdig å sende
  │ ─── 4. ACK ─────────────────────────────────────► │
  │                                                  │
  │       TIME_WAIT (2*MSL ≈ 60s) før full lukking    │`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>TIME_WAIT</strong> hindrer at gamle pakker fra denne forbindelsen
            blandes med en ny forbindelse på samme port-par. Server-prosesser bør bruke{" "}
            <code>SO_REUSEADDR</code> for å restarte uten å vente.
          </p>
        </section>

        <section id="state-machine" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            9. TCP-tilstandsmaskin — full oversikt
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Alt over (handshake, dataoverføring, close) er egentlig én og samme
            tilstandsmaskin med 11 tilstander. Klikk på event-knappene, eller
            kjør et komplett scenario, og se hvordan klient og server beveger
            seg i parallell. Halvåpne tilstander som <code>CLOSE-WAIT</code> og{" "}
            <code>FIN-WAIT-2</code> er der det meste av eksamen-spørsmål går.
          </p>
          <TcpStateMachine />
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : sortér håndtrykk-steg, fyll inn ACK-numre, quiz om flow vs congestion.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "kryptografi" }} className="text-brand hover:underline">
                Kryptografi
              </Link>
              : hva som beskytter trafikken som TCP transporterer.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
