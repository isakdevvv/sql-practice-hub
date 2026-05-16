import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { EksterneRessurser } from "@/components/stack/EksterneRessurser";
import { Tex, TexBlock } from "@/components/Tex";
import {
  FsmRdt10,
  FsmRdt20,
  FsmRdt21Sender,
  FsmRdt30Sender,
} from "./RdtFsm";
import { RelatedVisualizers } from "@/components/stack/RelatedVisualizers";
import { UtilizationCalc } from "./UtilizationCalc";
import { lazy, Suspense } from "react";
import { VisualizerSkeleton } from "@/components/visualizer-shell";

const RdtVisualizer = lazy(() =>
  import("./RdtVisualizer").then((m) => ({ default: m.RdtVisualizer })),
);

const STEPS = [
  { title: "Hvorfor en progresjon?", anchor: "hvorfor" },
  { title: "Interaktiv pakke-tidslinje", anchor: "visualizer" },
  { title: "rdt1.0 — perfekt kanal", anchor: "rdt10" },
  { title: "rdt2.0 — bit-feil (ACK/NAK)", anchor: "rdt20" },
  { title: "rdt2.1 — korrupt ACK (seq# 0/1)", anchor: "rdt21" },
  { title: "rdt2.2 — NAK-fri", anchor: "rdt22" },
  { title: "rdt3.0 — pakketap (timer)", anchor: "rdt30" },
  { title: "Stop-and-wait sin svakhet", anchor: "utilization" },
  { title: "Veien videre — pipelining", anchor: "pipeline" },
  { title: "Oppsummering", anchor: "ref" },
];

export function RdtProgresjonPage() {
  return (
    <StackPageShell title="rdt 1.0 → 3.0" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Kurose &amp; Ross 3.4
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            rdt 1.0 → 3.0 — bygge pålitelig dataoverføring ett problem av gangen
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            <em>reliable data transfer protocol</em> (rdt) er Kurose &amp; Ross sin
            pedagogiske oppbygging av <strong>hvordan</strong> TCP fikk lufta under vingene.
            Vi starter med en perfekt kanal og introduserer ett nytt verktøy for hvert nytt
            problem som dukker opp: bit-feil → ACK/NAK + checksum; korrupt ACK → sekvensnummer;
            pakketap → timer. Når du har sett hvorfor hvert verktøy er nødvendig, vil hver
            eneste TCP-merkverdighet gi mening.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Bokens viktigste eksempel.</span> Hvis du forstår
              hvorfor rdt2.1 trenger sekvensnummer og hvorfor rdt3.0 trenger timer, har du
              forstått halve transportlaget. Resten er bare optimaliseringer.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-rdt-progresjon" steps={STEPS} />

        <section id="hvorfor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor en progresjon?</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Den underliggende kanalen (la oss kalle den «under» — IP, ev. en link) er <em>upålitelig</em>:
            bits kan flippes, pakker kan tapes, rekkefølge kan brytes. Transportlaget over
            («rdt») skal levere data til applikasjonen som om kanalen var perfekt. Hvordan?
            Vi bygger det opp i fem versjoner, der hver versjon antar litt mer fra under-kanalen:
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-24">Versjon</th>
                  <th className="text-left font-semibold px-4 py-2">Under-kanalen kan…</th>
                  <th className="text-left font-semibold px-4 py-2">Nytt verktøy</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">rdt1.0</td>
                  <td className="px-4 py-3">ingenting galt</td>
                  <td className="px-4 py-3">—</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">rdt2.0</td>
                  <td className="px-4 py-3">flippe bits</td>
                  <td className="px-4 py-3">checksum + ACK/NAK</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">rdt2.1</td>
                  <td className="px-4 py-3">flippe bits (også i ACK)</td>
                  <td className="px-4 py-3">sekvensnummer 0/1</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">rdt2.2</td>
                  <td className="px-4 py-3">som rdt2.1</td>
                  <td className="px-4 py-3">dropp NAK — bruk duplikat-ACK</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">rdt3.0</td>
                  <td className="px-4 py-3">flippe bits + miste pakker</td>
                  <td className="px-4 py-3">timer</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="visualizer" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            2. Interaktiv pakke-tidslinje
          </h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Velg en rdt-versjon og se hva som skjer mellom sender og mottaker når
            pakker reiser ned-til-høyre og ACK-er opp-til-venstre. Toggle feil-injeksjonene
            for å se hvorfor hver enkelt mekanisme (NAK, sekvensnummer, timer) faktisk er
            nødvendig — ikke bare en festlig akademisk øvelse. Drar du i tidsgliderne kan
            du fryse bildet og lese hva sender og mottaker mener akkurat nå.
          </p>
          <Suspense fallback={<VisualizerSkeleton />}>
            <RdtVisualizer />
          </Suspense>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Tipset er å begynne med <code>rdt 2.0</code> + «korruptér data-pkt #1» (du ser
            NAK-en), deretter <code>rdt 3.0</code> + «mist data-pkt #2» (timeren utløses), og
            til slutt <code>GBN</code> + samme tap — se hvor mye lengre stoppet blir når
            base-pakka ikke kommer fram.
          </p>
        </section>

        <section id="rdt10" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. rdt1.0 — perfekt kanal</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Anta at kanalen aldri korrupterer eller mister pakker. Da har vi ingenting å
            beskytte oss mot. Senderen pakker dataen og ringer <code>udt_send</code>
            («unreliable data transfer» — den underliggende kanalen). Mottakeren tar imot,
            pakker opp, leverer. Begge har én tilstand.
          </p>
          <FsmRdt10 />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Helt nyttig i seg selv? Nei — men det er <em>nullhypotesen</em>. Når vi nå legger
            til ett problem av gangen, ser vi hva som må endres.
          </p>
        </section>

        <section id="rdt20" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. rdt2.0 — bit-feil med ACK/NAK</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Nytt problem: bits i pakken kan flippes underveis. Hvordan vet mottakeren at en
            pakke er korrupt? <strong>Checksum.</strong> Hvordan får senderen vite? Mottakeren
            sier <strong>ACK</strong> (positiv) eller <strong>NAK</strong> (negativ). Ved NAK
            retransmitterer senderen. Dette kalles <em>ARQ</em> (Automatic Repeat reQuest).
          </p>
          <FsmRdt20 />
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">Feil i rdt2.0:</strong>{" "}
            Hva om ACK eller NAK selv blir korrupt? Senderen vet ikke om mottakeren fikk
            pakken eller ikke. Hvis vi alltid retransmitterer, kan mottakeren ende opp med
            <em> duplikat</em> uten å vite det. Vi trenger noe mer.
          </div>
        </section>

        <section id="rdt21" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. rdt2.1 — sekvensnummer 0/1</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Løsning: gi hver pakke et <strong>sekvensnummer</strong>. For stop-and-wait
            trenger vi bare 1 bit — 0 og 1 veksler. Hvis mottakeren får pkt med samme seq# som
            forrige, vet han at det er et duplikat (retransmit) og kaster det, men ACK-er
            uansett. Senderen alternerer 0 → 1 → 0 → 1 ettersom han får riktige ACKs.
            FSM-en for senderen får nå <strong>fire</strong> tilstander:
          </p>
          <FsmRdt21Sender />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Mottakeren er symmetrisk: én tilstand «vent på seq=0», én «vent på seq=1». Hvis
            han venter på 0 men får 1, er det et duplikat — ACK men ikke lever.
          </p>
        </section>

        <section id="rdt22" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. rdt2.2 — kvitt NAK-en</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Observasjon: vi trenger faktisk ikke NAK. I stedet for å si «NAK», kan mottakeren
            sende en <em>duplikat-ACK</em> — en ny ACK for sist <em>korrekt</em> mottatte
            pakke. Hvis senderen sendte pkt(seq=1) og får ACK med seq=0, betyr det at pkt(1)
            ikke er kommet ordentlig fram → retransmitter.
          </p>
          <div className="rounded-lg border border-border bg-card p-4 text-sm">
            <strong>Hvorfor er dette en sjarmør?</strong> Det reduserer protokollens
            «alfabet» — én meldingstype mindre å validere. <strong>Og:</strong> det blir
            byggesteinen til GBN (Go-Back-N): én ACK-type, kumulativ. Eleganseøvelse, men også
            praktisk.
          </div>
        </section>

        <section id="rdt30" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. rdt3.0 — pakketap håndteres av timer</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Nytt problem: pakker kan <em>tapes</em> (forsvinne) — ikke bare korruptes.
            Senderen sitter da og venter på en ACK som aldri kommer. Vi kan ikke vente
            for evig. Løsningen: en <strong>nedtellingstimer</strong>. Når senderen sender,
            starter han timeren. Får han ACK før den utløper, stopper han den. Hvis ikke —
            <strong>TIMEOUT</strong> → retransmitter og start timeren på nytt.
          </p>
          <FsmRdt30Sender />
          <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
            Litt nuance: timeren må være «litt lengre» enn forventet RTT. For kort → unødige
            retransmits (duplikater er trygge takket være seq#). For lang → lav throughput.
            TCP løser dette dynamisk med Jacobson/Karels EWMA — men det er en annen historie.
          </p>
          <div className="rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm">
            <strong className="text-brand">rdt3.0 er en fungerende pålitelig protokoll.</strong>{" "}
            Den håndterer bit-feil, korrupte ACKs, og pakketap. Den er korrekt — men, som vi
            skal se under, helt elendig på ytelse.
          </div>
        </section>

        <section id="utilization" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Stop-and-wait sin svakhet</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Stop-and-wait sender én pakke, venter på ACK, sender neste. Senderens
            <em> utnyttelse</em> er andelen tid han faktisk trasmitterer:
          </p>
          <TexBlock>
            {`U_{\\text{sender}} = \\frac{L/R}{\\text{RTT} + L/R}`}
          </TexBlock>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Kuroses lærebok-eksempel: en 1 Gbps coast-to-coast-link med
            <Tex>{` \\text{RTT} = 30 \\text{ ms}`}</Tex> og 1000-byte pakker. Da blir:
          </p>
          <TexBlock>
            {`U = \\frac{8000/10^9}{0{,}030 + 8000/10^9} = \\frac{8 \\,\\mu s}{30\\,008\\,\\mu s} \\approx 0{,}000266`}
          </TexBlock>
          <div className="my-3 rounded-lg border-l-4 border-brand bg-brand/5 p-4 text-sm italic">
            «Stop-and-wait utnyttelse på 1 Gbps coast-to-coast: 0.000266 — bare 0.027 prosent.»
            <span className="block not-italic text-xs text-muted-foreground mt-1">
              — Kurose &amp; Ross, s. 215
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Senderen klarer altså 270 kbps effektivt på en 1 Gbps-link. Det betyr at <em>99,973 %</em>
            av lenkens kapasitet ligger ubrukt mens vi venter på ACKs som krysser USA.
            Prøv selv:
          </p>
          <UtilizationCalc />
        </section>

        <section id="pipeline" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">9. Løsningen: pipelining (GBN og SR)</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Fiksen er enkel og dyp: ikke vent på ACK før neste pakke. Tillat at flere pakker
            er «in flight». Det krever tre ting:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5 mb-3">
            <li>Større sekvensnummer-rom (ikke bare 0/1 — typisk N bits).</li>
            <li>En <strong>buffer</strong> hos sender (for re-tx) og evt. mottaker (for re-sortering).</li>
            <li>To strategier for hva som retransmitteres ved tap:</li>
          </ul>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Go-Back-N (GBN)
              </div>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li>Kumulativ ACK: «alt opp til seq=k OK».</li>
                <li>Ved tap: retransmitter <em>alle</em> pakker fra base.</li>
                <li>Enkelt, men sløsende.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Selective Repeat (SR)
              </div>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li>Per-pakke-ACK.</li>
                <li>Retransmitter <em>kun</em> de som mangler.</li>
                <li>Mer state hos begge endepunkter; effektivt.</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            TCP er en hybrid — kumulative ACKs som GBN, men selektiv retransmit i praksis
            (via SACK-utvidelse, RFC 2018). Logikken som driver «kumulativ» og «selektiv» er
            en direkte etterkommer av GBN/SR.
          </p>
        </section>

        <section id="ref" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">10. Oppsummering — én tabell</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-24">Versjon</th>
                  <th className="text-left font-semibold px-4 py-2">Problem løst</th>
                  <th className="text-left font-semibold px-4 py-2">Mekanisme</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">rdt1.0</td>
                  <td className="px-4 py-3">(ingen feil)</td>
                  <td className="px-4 py-3">trivielt</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">rdt2.0</td>
                  <td className="px-4 py-3">bit-feil</td>
                  <td className="px-4 py-3">checksum + ACK/NAK + retransmit</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">rdt2.1</td>
                  <td className="px-4 py-3">korrupt ACK/NAK</td>
                  <td className="px-4 py-3">sekvensnummer 0/1</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">rdt2.2</td>
                  <td className="px-4 py-3">(forenkling)</td>
                  <td className="px-4 py-3">duplikat-ACK i stedet for NAK</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">rdt3.0</td>
                  <td className="px-4 py-3">pakketap</td>
                  <td className="px-4 py-3">timer</td>
                </tr>
                <tr className="border-t border-border bg-muted/30">
                  <td className="px-4 py-3 font-mono text-brand">GBN/SR</td>
                  <td className="px-4 py-3">lav utnyttelse</td>
                  <td className="px-4 py-3">pipelining (mange in flight)</td>
                </tr>
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
              <Link to="/stack/$slug" params={{ slug: "transportlag" }} className="text-brand hover:underline">Transportlag — TCP og UDP</Link>
              {" "}— hvordan TCP bygger på rdt3.0+pipelining.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-congestion-control" }} className="text-brand hover:underline">TCP Congestion Control</Link>
              {" "}— neste lag av sofistikering.
            </li>
          </ul>
        </div>

        <EksterneRessurser
          resources={[
            {
              type: "bok",
              tittel: "Computer Networking: A Top-Down Approach",
              forfatter: "Kurose & Ross",
              href: "/stack/programmeringsboker#kurose-ross",
              why: "Ch 3.4 (s. 200-227) er der rdt-progresjonen kommer fra. Bibelen for kurset.",
            },
            {
              type: "mooc",
              tittel: "Stanford CS144: Computer Networking",
              forfatter: "Nick McKeown, Philip Levis",
              href: "/stack/mooc-bibliotek#stanford-cs144",
              why: "Du implementerer DIN egen TCP-stakk i C++. Beste komplementet til pensum.",
            },
            {
              type: "youtube",
              tittel: "Computerphile",
              forfatter: "Mike Pound m.fl.",
              href: "/stack/youtube-kanaler#computerphile",
              why: "Søk etter 'TCP' og 'reliability' — kortere forklaringer av samme prinsipper.",
            },
          ]}
        />
        <RelatedVisualizers slug="rdt-progresjon" />
      </article>
    </StackPageShell>
  );
}
