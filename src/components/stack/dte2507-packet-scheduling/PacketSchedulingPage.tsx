import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex, TexBlock } from "@/components/Tex";
import { SchedulerComparison } from "./SchedulerComparison";
import { WfqWeightSim } from "./WfqWeightSim";
import { DepartureDragExercise } from "./DepartureDragExercise";

const STEPS = [
  { title: "Hva er packet scheduling?", anchor: "intro" },
  { title: "FIFO — first in, first out", anchor: "fifo" },
  { title: "Priority queueing", anchor: "priority" },
  { title: "Round Robin", anchor: "rr" },
  { title: "Weighted Fair Queueing (WFQ)", anchor: "wfq" },
  { title: "Side-ved-side-sammenligning", anchor: "sammenligning" },
  { title: "WFQ-vekter — interaktiv", anchor: "wfq-sim" },
  { title: "Drag-oppgave: plot departures", anchor: "drag" },
  { title: "Net neutrality-debatten", anchor: "netneutrality" },
  { title: "Eksamen-quick-ref", anchor: "ref" },
];

export function PacketSchedulingPage() {
  return (
    <StackPageShell title="Packet scheduling" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Kurose &amp; Ross 4.2.5
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Packet scheduling — FIFO, Priority, Round Robin og WFQ
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Når en output-kø har flere pakker som venter, må noe bestemme{" "}
            <em>rekkefølgen</em> de sendes i. Det er <strong>scheduler-en</strong>. Valg
            av disiplin styrer både gjennomsnittlig delay, jitter og hvor «rettferdig»
            båndbredden deles mellom strømmer. Dette er også den tekniske kjernen i
            net neutrality-debatten.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#sammenligning" className="text-brand hover:underline">sammenligningssimulatoren</a>{" "}
              under kjører alle fire disiplinene parallelt på samme input-strøm. Drag-oppgaven{" "}
              <a href="#drag" className="text-brand hover:underline">«plot departures»</a>{" "}
              tester at du klarer å regne ut riktig rekkefølge selv.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-packet-scheduling" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva er packet scheduling?</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            En output-link med kapasitet <Tex>{`R`}</Tex> bits/sek kan sende
            <em> én</em> pakke om gangen. Hvis det står flere pakker i køen, må
            scheduleren velge. Valget styrer:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li><strong>Per-pakke delay:</strong> hvor lenge ventet en gitt pakke?</li>
            <li><strong>Båndbreddedeling:</strong> hvor stor andel av <Tex>{`R`}</Tex> får hver flow?</li>
            <li><strong>Jitter:</strong> variasjon i delay (kritisk for VoIP/video).</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Vi ser på fire klassiske disipliner. Senere kombineres de ofte (f.eks.
            HTB, CBQ, FQ-CoDel), men disse fire er språket alle hierarkier bygger på.
          </p>
        </section>

        <section id="fifo" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. FIFO — first in, first out</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            «Den som kom først blir betjent først.» Også kalt FCFS (First-Come,
            First-Served). Standard på all enkel utstyr.
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>Enkel: én kø, én scheduler-regel.</li>
            <li>Ingen <em>isolation</em>: en grådig flow kan fylle hele køen og kvele alt annet.</li>
            <li>Drop-policy ved full kø: tail-drop, head-drop eller AQM (RED/CoDel).</li>
          </ul>
        </section>

        <section id="priority" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Priority queueing</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Pakker klassifiseres i klasser (basert på DSCP/ToS, kilde-IP, port osv.).
            Hver klasse har sin egen kø. Scheduler tjener alltid <em>høyeste
            ikke-tomme klasse</em>.
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li><strong>Pre-emptiv:</strong> avbryt pågående lav-prioritet om høyere ankommer (sjelden brukt).</li>
            <li><strong>Non-pre-emptiv:</strong> fullfør gjeldende pakke, men deretter alltid høyeste.</li>
            <li><strong>Risiko: starvation.</strong> Hvis høy-prioritet aldri tørker ut, får lav-prioritet aldri sende.</li>
          </ul>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">Bruk:</strong> VoIP og videosamtale i en EF-klasse (Expedited Forwarding) over best-effort. Cisco IOS «strict-priority queue» er ren prioritet.
          </div>
        </section>

        <section id="rr" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Round Robin</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Hver klasse har sin kø. Scheduler går rundt og sender én pakke fra hver
            ikke-tomme klasse i tur. Ingen klasse svelter. Hvis pakker er ulik
            størrelse, blir båndbredden ulikt fordelt — derfor:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li><strong>Deficit Round Robin (DRR):</strong> hver klasse får et «kvantum» bytes pr. runde og akkumulerer ubrukt deficit. Approximerer fair queueing rimelig.</li>
            <li><strong>Work-conserving:</strong> linja står aldri tom hvis det fins ventende pakker (i motsetning til strikte time-slots).</li>
          </ul>
        </section>

        <section id="wfq" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Weighted Fair Queueing (WFQ)</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            WFQ er en generalisering av Round Robin der hver klasse <Tex>{`i`}</Tex>{" "}
            har en vekt <Tex>{`w_i`}</Tex>. Klassen får en garantert andel av
            link-kapasiteten:
          </p>
          <TexBlock>
            {`R_i = R \\cdot \\frac{w_i}{\\sum_j w_j}`}
          </TexBlock>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Eksempel: tre klasser, vekter <Tex>{`(3, 2, 1)`}</Tex>, total <Tex>{`R = 6\\text{ Mbps}`}</Tex>.
            Klasse 1 får <Tex>{`6 \\cdot 3/6 = 3\\text{ Mbps}`}</Tex>, klasse 2 får 2, klasse 3 får 1.
            <strong> Work-conserving:</strong> hvis klasse 2 ikke har pakker, fordeles
            ledig kapasitet proporsjonalt mellom de andre.
          </p>
          <div className="mt-3 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              WFQ vs RR
            </div>
            <ul className="text-sm space-y-1 list-disc pl-5">
              <li>RR er WFQ med alle vekter lik 1.</li>
              <li>WFQ håndterer ulike pakkestørrelser via «virtual finish time» — pakker sendes i rekkefølgen de hadde blitt ferdige under perfekt fluid-modell (GPS — Generalized Processor Sharing).</li>
              <li>Implementeres ofte med approximerte varianter: WF²Q, SCFQ, DRR-vektet.</li>
            </ul>
          </div>
        </section>

        <section id="sammenligning" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Side-ved-side: samme input, fire disipliner</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Fem pakker ankommer over tid med ulike klasser. Se hvordan hver
            scheduler-disiplin bestemmer departure-rekkefølgen:
          </p>
          <SchedulerComparison />
        </section>

        <section id="wfq-sim" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. WFQ-vekter — interaktiv</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Skru på vektene <Tex>{`w_1`}</Tex> og <Tex>{`w_2`}</Tex> for to klasser
            som hver er backlog-bundet (har alltid pakker å sende). Output blir vist
            som rekken pakker som faktisk forlater linja.
          </p>
          <WfqWeightSim />
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            Default: <Tex>{`w_1 = 3, w_2 = 1`}</Tex> ⇒ for hver fire pakker som
            sendes vil tre være fra klasse 1 og én fra klasse 2.
          </p>
        </section>

        <section id="drag" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Drag-oppgave: plot departures</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Fem pakker ankommer på de oppgitte tidspunktene. Hver pakke tar 1 tids­enhet
            å sende ut. Dra pakke-numrene til riktig departure-tidspunkt under hver
            scheduler-disiplin.
          </p>
          <DepartureDragExercise />
        </section>

        <section id="netneutrality" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">9. Net neutrality-debatten</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Scheduler-disipliner er ikke «bare teknikk» — de er instrumentene i
            net neutrality-diskusjonen. ISP-en kan teknisk:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li><strong>Blokkere</strong> trafikk fra en konkurrent (f.eks. drop alle pakker fra Netflix).</li>
            <li><strong>Throttle</strong> ved å gi en flow lav vekt i WFQ eller låg klasse i prioritet.</li>
            <li><strong>Paid prioritization:</strong> ta betalt for at trafikk havner i høyere klasse — <em>fast lanes</em>.</li>
          </ul>
          <div className="mt-3 rounded-xl border border-brand/30 bg-brand/5 p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              FCC «Open Internet Order» (USA, 2015) — tre bright-line rules
            </div>
            <ol className="text-sm space-y-1.5 list-decimal pl-5">
              <li><strong>No Blocking:</strong> ISP kan ikke blokkere lovlig innhold/applikasjoner.</li>
              <li><strong>No Throttling:</strong> ingen bevisst nedgrading av lovlig trafikk.</li>
              <li><strong>No Paid Prioritization:</strong> ingen «betal for fast-lane»-ordninger.</li>
            </ol>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            EU har TSM-forordningen (Open Internet Regulation 2015/2120) som er
            tilsvarende. USA reverserte sine regler i 2017, gjeninnførte deler i
            2024 — fortsatt i bevegelse. Norske ISP-er er bundet av Nkoms regulering
            i tråd med EU.
          </p>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">Nyanse:</strong>{" "}
            Net neutrality forbyr <em>ikke</em> all QoS. CoS-merking for VoIP/video
            innen samme operatør er typisk OK; det forbudte er <em>diskriminering
            mellom kilder/applikasjoner</em>. «Specialized services» (IPTV) er ofte
            unntatt.
          </div>
        </section>

        <section id="ref" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">10. Eksamen-quick-ref</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Disiplin</th>
                  <th className="text-left font-semibold px-4 py-2">Regel</th>
                  <th className="text-left font-semibold px-4 py-2">Risiko</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">FIFO</td>
                  <td className="px-4 py-3">Eldste pakke først.</td>
                  <td className="px-4 py-3">Ingen isolation; en grådig flow ødelegger alt.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Priority</td>
                  <td className="px-4 py-3">Tjen høyeste ikke-tomme klasse.</td>
                  <td className="px-4 py-3">Starvation av lav klasse.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Round Robin</td>
                  <td className="px-4 py-3">Én pakke fra hver klasse i tur.</td>
                  <td className="px-4 py-3">Urettferdig ved ulik pakkestørrelse (uten DRR).</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">WFQ</td>
                  <td className="px-4 py-3"><Tex>{`R_i = R \\cdot w_i / \\sum w_j`}</Tex></td>
                  <td className="px-4 py-3">Mer kompleks å implementere; «virtual time»-bokføring.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Tilbake til oversikten</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-inni-ruter" }} className="text-brand hover:underline">Inni en ruter</Link>
              {" "}— hvor scheduleren bor (output-port).
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-congestion-control" }} className="text-brand hover:underline">TCP congestion control</Link>
              {" "}— hvordan endepunktene tilpasser seg når køen vokser.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte-2507" }} className="text-brand hover:underline">DTE-2507-hub</Link>
              {" "}— alle nettverks-mini-kursene.
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}
