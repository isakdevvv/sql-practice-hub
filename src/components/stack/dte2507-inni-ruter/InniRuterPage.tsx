import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex, TexBlock } from "@/components/Tex";
import { SwitchFabricViz } from "./SwitchFabricViz";
import { HolBlockingSim } from "./HolBlockingSim";

const STEPS = [
  { title: "Pakkeruter på 30 sekunder", anchor: "oversikt" },
  { title: "Input port — fra link til buffer", anchor: "input" },
  { title: "Switch fabric — tre teknologier", anchor: "fabric" },
  { title: "Output port — kø og scheduler", anchor: "output" },
  { title: "Head-of-Line blocking", anchor: "hol" },
  { title: "Simulator: HOL on/off", anchor: "sim" },
  { title: "Bufferbloat — for mye salt", anchor: "bufferbloat" },
  { title: "Eksamen-quick-ref", anchor: "ref" },
];

export function InniRuterPage() {
  return (
    <StackPageShell title="Inni en ruter" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Kurose &amp; Ross 4.2
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Inni en ruter — input port, switch fabric og output port
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            En ruter er ikke én svart boks. Den er tre stadier: <strong>input port</strong>{" "}
            (linklag + IP-lookup), <strong>switch fabric</strong> (selve flyttingen
            internt) og <strong>output port</strong> (kø + scheduler ut på linja). Hver
            av disse har sin egen flaskehals, og enkelte designvalg — særlig hvor du
            plasserer køen — gir oppførsel som virker overraskende.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#sim" className="text-brand hover:underline">HOL-simulatoren</a>{" "}
              under viser tre input-køer mot en crossbar. Skru Head-of-Line-blocking av
              og på og se hva som skjer med gjennomstrømningen.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-inni-ruter" steps={STEPS} />

        <section id="oversikt" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Pakkeruter på 30 sekunder</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            En router gjør én ting: <em>flytter</em> pakker fra inn-lenker til
            ut-lenker. Ingen TCP, ingen sockets — bare lag-3-videresending. Selve
            videresendingen skjer i forwarding plane (data plane), separat fra control
            plane (rutingsprotokoller som OSPF, BGP).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              De fire generiske blokkene
            </div>
            <ol className="text-sm space-y-1.5 list-decimal pl-5">
              <li><strong>Input ports</strong> — fysisk lag, linklag, IP-lookup, kø-inn til fabric.</li>
              <li><strong>Switching fabric</strong> — koblet input til ønsket output.</li>
              <li><strong>Output ports</strong> — kø-ut, scheduler, linklag-frame, fysisk lag.</li>
              <li><strong>Routing processor</strong> — kjører ruting-protokollene, bygger forwarding-tabellen.</li>
            </ol>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            Data plane er <strong>per-pakke</strong>, helst i ASIC/hardware, mikrosekund-skala.
            Control plane er <strong>per-millisekunder/sekunder</strong>, i CPU/software.
          </p>
        </section>

        <section id="input" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Input port — fra link til buffer</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            På input-porten skjer tre ting per pakke:
          </p>
          <ol className="text-sm space-y-1.5 list-decimal pl-5">
            <li><strong>Physical &amp; link layer:</strong> bits inn, frame ut. Ethernet-MAC sjekkes.</li>
            <li><strong>Decentralized switching / forwarding lookup:</strong> Slå opp destinasjons-IP i forwarding-tabellen — lokal kopi i hver linjekort gjør at lookup er en mikrosekund-operasjon. Bruker <em>longest prefix match</em> (ofte med en TCAM-brikke).</li>
            <li><strong>Match-action:</strong> Bestem output-port, ev. dekrement TTL, oppdater header-felter, klassifiser for QoS.</li>
          </ol>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">Hvorfor lokal forwarding-tabell?</strong>{" "}
            Hvis hver lookup måtte gå via CPU/routing-prosessor ville ruteren bli en
            flaskehals på sin egen CPU. Lokal kopi pr. linjekort betyr at flere innport
            kan slå opp i parallell, og fabric-en blir flaskehalsen — som er en mye
            penere flaskehals å skalere.
          </div>
        </section>

        <section id="fabric" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Switch fabric — tre teknologier</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Når input-porten har bestemt ut-porten, må pakken faktisk fraktes
            internt. Tre klassiske teknologier:
          </p>
          <SwitchFabricViz />
          <div className="mt-4 grid sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Via memory
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tradisjonell: pakken DMA-es inn i RAM, CPU kopierer til riktig output-buffer, DMA ut.
                Begrenses av minnebåndbredden — alt går gjennom bussen <em>to</em>{" "}
                ganger. Throughput &lt;<Tex>{`B/2`}</Tex>.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Via bus
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Felles delt buss mellom alle linjekortene. Input-kort skriver pakken
                pluss intern label på bussen; riktig output-kort plukker den opp.
                Enkel, men én pakke om gangen — busskapasiteten er taket.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Via crossbar (interconnection network)
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <Tex>{`N \\times N`}</Tex>-matrise med kryssbrytere. Flere pakker
                samtidig så lenge de ikke vil ut på samme port. Ikke-blokkerende — det
                er <em>denne</em> som gjelder i moderne høyhastighets-rutere.
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            Crossbar koster <Tex>{`O(N^2)`}</Tex> kryssbrytere; Clos-nettverk og
            multi-stage-fabric bryter dette ned til <Tex>{`O(N\\log N)`}</Tex> for
            store rutere (Juniper, Cisco CRS).
          </p>
        </section>

        <section id="output" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Output port — kø og scheduler</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Når fabric-en leverer raskere enn ut-lenka kan sende (typisk når flere
            input-porter sender til samme ut-port), bygges det kø. Output-porten har:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li><strong>Buffer</strong> — RAM som holder pakker som venter.</li>
            <li><strong>Scheduler</strong> — velger hvilken pakke som sendes neste (FIFO, prioritet, WFQ, ...). Se{" "}
              <Link to="/stack/$slug" params={{ slug: "dte2507-packet-scheduling" }} className="text-brand hover:underline">packet scheduling-kurset</Link>.</li>
            <li><strong>AQM</strong> (Active Queue Management) — RED/CoDel som dropper/markerer tidlig.</li>
          </ul>
          <div className="mt-3 rounded-lg border border-border bg-card p-4 text-sm">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Hvor stor skal buffer-en være?
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Tommelfingerregel (RFC, Villamizar/Song 1994):{" "}
              <Tex>{`B = \\text{RTT} \\times C`}</Tex>. For en ruter med <Tex>{`C = 10\\text{ Gbps}`}</Tex>{" "}
              og typisk RTT 250 ms blir det ~312 MB. Senere forskning (Appenzeller et al.
              2004) viste at <Tex>{`B = \\text{RTT} \\times C / \\sqrt{N}`}</Tex> holder
              for mange flows N — gigabit-rutere trenger ikke gigabyte-kø.
            </p>
          </div>
        </section>

        <section id="hol" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Head-of-Line blocking</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Hvis køen er <em>på input-siden</em> (input queueing) oppstår et ondsinnet
            fenomen: pakke fremst i input-køen vil til en opptatt output-port. Pakkene
            bak — som vil til en <em>ledig</em> output-port — er <strong>blokkert
            uansett</strong>. Hodet er sperret, halen får ikke skifte fil.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Karol, Hluchyj &amp; Morgan (1987) — det klassiske resultatet
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Med uniform tilfeldig destinasjon og enkel FIFO-input-kø vokser køen
              ubegrenset når lasten overstiger
            </p>
            <TexBlock>{`\\rho^{*} = 2 - \\sqrt{2} \\approx 0.586`}</TexBlock>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Med andre ord: input-køet kollapser ved ~<strong>58%</strong> belastning,
              selv om hver utport teoretisk har kapasitet 100%. Den «manglende» 42% er
              tap til HOL-blocking.
            </p>
          </div>
          <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm">
            <strong className="text-brand">Løsningen: Virtual Output Queues (VOQ).</strong>{" "}
            Hver input-port holder <Tex>{`N`}</Tex> separate køer — én pr. output-port.
            HOL-blocking elimineres helt; med god scheduler (iSLIP, maximal matching)
            når man 100% throughput. Alle moderne core-rutere bruker VOQ.
          </div>
        </section>

        <section id="sim" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Simulator: HOL on/off på crossbar</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Tre input-køer (rød, grønn, blå) med tilfeldige destinasjoner inn på en
            3×3-crossbar. Toggle Head-of-Line-blocking av (= VOQ) og se hvordan
            throughput endrer seg.
          </p>
          <HolBlockingSim />
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <strong>2 øvelses-scenarier:</strong>
            <ol className="mt-2 space-y-1 list-decimal pl-5 text-muted-foreground">
              <li>
                <strong>HOL på.</strong> Kjør 100+ tick. Hvilken throughput-prosent
                stabiliserer seg på? (Skal ligge i området 55–65% — Karol-grensen.)
              </li>
              <li>
                <strong>HOL av (VOQ).</strong> Reset, slå av HOL, kjør 100+ tick.
                Throughput skal nå nær 100% (skiltet av at output-portene er travle
                nesten hvert tick).
              </li>
            </ol>
          </div>
        </section>

        <section id="bufferbloat" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Bufferbloat — for mye salt</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Hjemme-rutere ble billigere → produsenter la til mer RAM «just in case»
            → buffere på 100+ MB. Konsekvens: loss-basert TCP ser ingen tap, fortsetter
            å øke cwnd. Køen holder seg full. Latency på en lenk som er nominelt 20 ms
            kryper opp i 200–2000 ms — selv uten konkurrerende trafikk.
          </p>
          <div className="rounded-xl border border-brand/30 bg-brand/5 p-5 text-sm leading-relaxed">
            <div className="font-semibold text-brand mb-2">Bokens metafor (s. 323)</div>
            <blockquote className="italic border-l-2 border-brand pl-3">
              «Buffering is a bit like salt — just the right amount of salt makes food
              better, but too much makes it inedible!»
            </blockquote>
          </div>
          <div className="mt-3 rounded-xl border border-border bg-card p-5 text-sm">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Forsvar mot bufferbloat
            </div>
            <ul className="space-y-1 list-disc pl-5">
              <li><strong>AQM:</strong> RED (Random Early Detection), CoDel (Controlled Delay), PIE.</li>
              <li><strong>ECN:</strong> Eksplisitt congestion-bit i IP-header i stedet for å droppe.</li>
              <li><strong>FQ-CoDel:</strong> per-flow fair queueing + CoDel — default i OpenWRT, Linux.</li>
              <li><strong>Smaller buffer:</strong> dimensjoner etter Appenzeller-formelen, ikke worst-case-RTT.</li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            Test din egen ruter: <code className="font-mono text-[11px]">dslreports.com/speedtest</code>{" "}
            eller <code className="font-mono text-[11px]">waveform.com/tools/bufferbloat</code> — de
            kjører ping under last og gir deg en bufferbloat-karakter.
          </p>
        </section>

        <section id="ref" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">8. Eksamen-quick-ref</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Begrep</th>
                  <th className="text-left font-semibold px-4 py-2">Hva</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Forwarding</td>
                  <td className="px-4 py-3">Per-pakke valg av ut-port (data plane, mikrosekund).</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Routing</td>
                  <td className="px-4 py-3">Bygger forwarding-tabellen (control plane, sek/min).</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Via memory</td>
                  <td className="px-4 py-3">Pakke kopieres gjennom RAM. Throughput &lt; B/2.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Via bus</td>
                  <td className="px-4 py-3">Delt buss, én pakke om gangen.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Crossbar</td>
                  <td className="px-4 py-3">N×N-matrise. Ikke-blokkerende hvis output-portene er ulike.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">HOL blocking</td>
                  <td className="px-4 py-3">Input-FIFO: fremste pakke blokkerer bakkøen.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Karol-grense</td>
                  <td className="px-4 py-3"><Tex>{`2 - \\sqrt{2} \\approx 0.586`}</Tex> = maks last før HOL-kø vokser.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">VOQ</td>
                  <td className="px-4 py-3">N køer pr. input — én pr. utport. Fjerner HOL.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Bufferbloat</td>
                  <td className="px-4 py-3">For store buffere → vedvarende kø → høy latency.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">AQM</td>
                  <td className="px-4 py-3">RED/CoDel/PIE: drop/marker før kø er full.</td>
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
              <Link to="/stack/$slug" params={{ slug: "dte2507-packet-scheduling" }} className="text-brand hover:underline">Packet scheduling</Link>
              {" "}— hvordan output-køen velger neste pakke (FIFO/Pri/RR/WFQ).</li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-congestion-control" }} className="text-brand hover:underline">TCP congestion control</Link>
              {" "}— hvordan endepunkter reagerer på køer som vokser.
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}
