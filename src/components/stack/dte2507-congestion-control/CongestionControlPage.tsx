import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex, TexBlock } from "@/components/Tex";
import { CongestionWindowSim } from "./CongestionWindowSim";

const STEPS = [
  { title: "Hvorfor congestion control?", anchor: "hvorfor" },
  { title: "Flow control vs congestion control", anchor: "flow-vs-cong" },
  { title: "Slow start", anchor: "slow-start" },
  { title: "AIMD og congestion avoidance", anchor: "aimd" },
  { title: "Tahoe vs Reno", anchor: "tahoe-reno" },
  { title: "TCP Cubic (Linux default)", anchor: "cubic" },
  { title: "TCP BBR — modell-basert", anchor: "bbr" },
  { title: "Simulator", anchor: "sim" },
  { title: "Bufferbloat", anchor: "bufferbloat" },
  { title: "Eksamen-quick-ref", anchor: "ref" },
];

export function CongestionControlPage() {
  return (
    <StackPageShell title="TCP Congestion Control" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Kurose &amp; Ross 3.5–3.7
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            TCP Congestion Control — hvordan TCP unngår å drukne nettet
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Flow control beskytter <strong>mottakeren</strong> mot å bli overfylt. Congestion
            control beskytter <strong>nettverket</strong>. Uten det ville hver TCP-strøm bare
            sende alt den hadde, ruterne ville fylle køene sine, droppe pakker, retransmits
            ville lage enda mer trafikk — congestive collapse. Slow start, AIMD, fast
            retransmit/recovery og kubikk-vekst er TCP-versjonene av «hold deg på din kant av
            veien».
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#sim" className="text-brand hover:underline">congestion-window-simulatoren</a>{" "}
              under viser cwnd over tid for Tahoe, Reno og Cubic — trigger pakketap og
              sammenlign.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-congestion-control" steps={STEPS} />

        <section id="hvorfor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor congestion control?</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            En ruter har en utgående link med en viss kapasitet <Tex>{`C`}</Tex> (bits/sek)
            og en endelig kø. Hvis summen av ankommende rater overstiger <Tex>{`C`}</Tex>,
            fylles køen — først øker forsinkelsen (latency), så begynner pakker å droppes
            (tail drop). Det er <strong>congestion</strong> — overbelastning i selve nettet.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Kurose &amp; Ross sine tre scenarier
            </div>
            <ul className="text-sm space-y-1.5 list-disc pl-5">
              <li><strong>Scenario 1:</strong> to sendere, én ruter, uendelig buffer — gjennomstrømning kappes på <Tex>{`C/2`}</Tex>, delay går mot uendelig.</li>
              <li><strong>Scenario 2:</strong> endelig buffer — retransmits gjør at «goodput» (faktiske, nye bytes) faller når lasten øker.</li>
              <li><strong>Scenario 3:</strong> multi-hop — en pakke som droppes på siste hopp har «kastet bort» alt arbeid på tidligere hopps. <em>Congestive collapse.</em></li>
            </ul>
          </div>
        </section>

        <section id="flow-vs-cong" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Flow control vs congestion control</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Aspekt</th>
                  <th className="text-left font-semibold px-4 py-2">Flow control</th>
                  <th className="text-left font-semibold px-4 py-2">Congestion control</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Beskytter</td>
                  <td className="px-4 py-3">Mottakeren (RAM/buffer fullt)</td>
                  <td className="px-4 py-3">Nettverket (ruter-kø fullt)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Signal</td>
                  <td className="px-4 py-3">rwnd (Receive Window i ACK)</td>
                  <td className="px-4 py-3">Pakketap, dup-ACKs, RTT</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Hvor</td>
                  <td className="px-4 py-3">Eksplisitt i TCP-headeren</td>
                  <td className="px-4 py-3">Implisitt — TCP utleder selv</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Effektiv send</td>
                  <td className="px-4 py-3 font-mono" colSpan={2}>min(rwnd, cwnd)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            Senderen sender <em>aldri</em> mer outstanding data enn <Tex>{`\\min(\\text{rwnd}, \\text{cwnd})`}</Tex>.
            cwnd er TCP-stackens interne tilstand — den vises ikke i pakke-headeren, men styrer
            takten.
          </p>
        </section>

        <section id="slow-start" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Slow start — eksponentiell oppvarming</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Når en ny TCP-tilkobling åpnes, vet ikke senderen noe om nettverkets kapasitet.
            Den starter med <Tex>{`\\text{cwnd} = 1\\,\\text{MSS}`}</Tex> (typisk ~10 MSS i
            moderne Linux med <em>initial window</em>) og dobler hver RTT:
          </p>
          <TexBlock>
            {`\\text{cwnd}_{\\text{ny}} = \\text{cwnd}_{\\text{gammel}} + \\text{MSS} \\cdot \\text{antall ACKs i forrige RTT}`}
          </TexBlock>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Eksponentiell vekst i praksis: <Tex>{`1 \\to 2 \\to 4 \\to 8 \\to 16 \\to \\dots`}</Tex>.
            Dette fortsetter til cwnd når <strong>ssthresh</strong> (slow-start threshold) —
            da bytter TCP til congestion avoidance.
          </p>
          <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm">
            <strong className="text-brand">Navnet «slow start» er misvisende:</strong> det
            STARTER langsomt (1 MSS) men vokser eksponentielt. Det er motsatsen til den gamle
            varianten der hele rwnd ble brukt umiddelbart.
          </div>
        </section>

        <section id="aimd" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. AIMD — Additive Increase, Multiplicative Decrease</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            I congestion avoidance vokser cwnd lineært: <em>+1 MSS per RTT</em>. Når et tap
            oppdages, halveres den. Dette gir det berømte sagtann-mønsteret:
          </p>
          <TexBlock>
            {`\\text{Additive increase: }\\quad \\text{cwnd} \\mathrel{+}= \\frac{\\text{MSS}^2}{\\text{cwnd}} \\quad \\text{(per ACK)}`}
          </TexBlock>
          <TexBlock>
            {`\\text{Multiplicative decrease: }\\quad \\text{cwnd} \\leftarrow \\text{cwnd}/2`}
          </TexBlock>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            AIMD konvergerer mot rettferdig deling: to TCP-strømmer på samme flaskehals vil
            over tid få lik andel av kapasiteten. Det er <em>matematisk</em> rettferdig — det
            fins formelle bevis i Kurose 3.7.1.
          </p>
        </section>

        <section id="tahoe-reno" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Tahoe vs Reno — to klassiske varianter</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Når oppdager TCP egentlig pakketap? Det er to mekanismer:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5 mb-3">
            <li><strong>Timeout</strong> (RTO utløper) — alvorlig signal, mest sannsynlig stor stopp.</li>
            <li><strong>3 dup-ACKs</strong> — mottakeren har sett pakker etter den tapte. Antagelig isolert tap.</li>
          </ul>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Tahoe (1988)
              </div>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li>Ved <em>hvilket som helst</em> tap: cwnd → 1, ssthresh → cwnd/2.</li>
                <li>Restart med slow start.</li>
                <li>Konservativ; gjør for stor nedjustering.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Reno / NewReno (1990)
              </div>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li>Ved 3 dup-ACKs: cwnd → ssthresh (halvering), <strong>fast recovery</strong>.</li>
                <li>Ved timeout: cwnd → 1 som Tahoe.</li>
                <li>Fast retransmit: send tapt segment uten å vente på RTO.</li>
                <li>Bedre throughput enn Tahoe på vanlige tap.</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="cubic" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. TCP Cubic — Linux-default siden 2006</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Reno er for konservativ på moderne høy-BDP-nett (Bandwidth-Delay Product — store
            lenker × høy RTT). Cubic erstatter den lineære additive increase med en kubikk-funksjon:
          </p>
          <TexBlock>
            {`W(t) = C \\cdot (t - K)^3 + W_{\\max}, \\quad K = \\sqrt[3]{\\frac{W_{\\max} \\cdot \\beta}{C}}`}
          </TexBlock>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            <Tex>{`W_{\\max}`}</Tex> er cwnd akkurat før forrige tap; <Tex>{`\\beta = 0.7`}</Tex>
            (multiplicative decrease, mindre aggressiv enn 0.5); <Tex>{`C = 0.4`}</Tex> er en
            skalering. Effekten:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5 mt-2">
            <li>Konkav vekst når cwnd nærmer seg <Tex>{`W_{\\max}`}</Tex> — sonderer forsiktig.</li>
            <li>Konveks vekst når cwnd er langt over <Tex>{`W_{\\max}`}</Tex> — sondering opp.</li>
            <li><strong>RTT-uavhengig</strong>: cwnd vokser basert på tid siden tap, ikke antall RTTs. Det gjør Cubic «fair» mellom strømmer med ulike RTTs (Reno er <em>unfair</em>: kort-RTT-strøm dominerer).</li>
          </ul>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">Husk:</strong> Cubic er
            <em> default i Linux</em> (siden kernel 2.6.19, 2006). Windows brukte Reno og
            CTCP, har bevegd seg mot Cubic / BBR. macOS bruker Cubic. Sjekk på Linux:{" "}
            <code className="font-mono text-[11px]">sysctl net.ipv4.tcp_congestion_control</code>.
          </div>
        </section>

        <section id="bbr" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. BBR — modell-basert (Google, 2016)</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Tahoe, Reno og Cubic er <em>loss-baserte</em>: de bruker pakketap som signal. BBR
            (Bottleneck Bandwidth and Round-trip propagation time) går en annen vei — den
            estimerer:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li><strong>BtlBw</strong> — maksimal observert leveringsrate.</li>
            <li><strong>RTprop</strong> — minimum observert RTT (ren propagation delay).</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            BBR sender med raten <Tex>{`\\text{BtlBw}`}</Tex> og holder kun
            <Tex>{` \\text{BtlBw} \\times \\text{RTprop}`}</Tex> (BDP) outstanding — akkurat
            nok til å fylle pipa uten å fylle ruter-køen. Det unngår bufferbloat <em>uten</em>
            å vente på tap. Brukes på YouTube og Google-tjenester; vanlig i Linux når flagget
            settes.
          </p>
        </section>

        <section id="sim" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Simulator: cwnd over tid</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Velg algoritme, trigger pakketap, og se hvordan cwnd reagerer. Sammenligningen
            nederst kjører alle tre algoritmer parallelt med samme tapsforløp.
          </p>
          <CongestionWindowSim />
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <strong>3 øvelses-scenarier:</strong>
            <ol className="mt-2 space-y-1 list-decimal pl-5 text-muted-foreground">
              <li>
                <strong>Reno uten tap.</strong> Reset, velg Reno, ikke trigger tap. Hvilken
                fase dominerer? (Svar: slow start dominerer til cwnd treffer ssthresh=32,
                deretter additive +1 per RTT.)
              </li>
              <li>
                <strong>Tahoe vs Reno etter tap.</strong> Reset, trigger ett tap, sammenlign
                graf nederst. Hvilken algoritme henter seg raskest inn? (Reno — den hopper til
                ssthresh; Tahoe må slow-starte fra 1.)
              </li>
              <li>
                <strong>Cubic-konkav-konveks.</strong> Trigger to tap nær hverandre på Cubic.
                Legg merke til hvordan kurven flater ut nær gammel <Tex>{`W_{\\max}`}</Tex> og
                eksploderer over.
              </li>
            </ol>
          </div>
        </section>

        <section id="bufferbloat" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">9. Bufferbloat — for store køer er for mye</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Hjemme-rutere ble billigere ⇒ produsenter la til mer RAM ⇒ pakke-køer ble enorme
            (sekunder med data). Resultat: loss-basert TCP slutter aldri å øke cwnd fordi det
            ikke ser tap. Køen vokser, latency går fra 20 ms til 2000 ms. Du merker det som:
            «Netflix går, men Zoom hakker.»
          </p>
          <div className="rounded-xl border border-border bg-card p-5 text-sm">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Forsvar mot bufferbloat
            </div>
            <ul className="space-y-1 list-disc pl-5">
              <li><strong>AQM</strong> (Active Queue Management) — drop/marker tidlig: RED, CoDel, PIE.</li>
              <li><strong>ECN</strong> (Explicit Congestion Notification) — ruter setter bit i IP-header i stedet for å droppe.</li>
              <li><strong>BBR</strong> — som over, holder seg unna kø-fylling.</li>
              <li><strong>FQ-CoDel</strong> — per-flow fair queueing på OpenWRT/Linux-rutere.</li>
            </ul>
          </div>
        </section>

        <section id="ref" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">10. Eksamen-quick-ref</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Algoritme</th>
                  <th className="text-left font-semibold px-4 py-2">Ved 3 dup-ACK</th>
                  <th className="text-left font-semibold px-4 py-2">Ved timeout</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Tahoe</td>
                  <td className="px-4 py-3">cwnd → 1, ssthresh → cwnd/2</td>
                  <td className="px-4 py-3">cwnd → 1, ssthresh → cwnd/2</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Reno</td>
                  <td className="px-4 py-3">cwnd → ssthresh = cwnd/2 (fast recovery)</td>
                  <td className="px-4 py-3">cwnd → 1</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Cubic</td>
                  <td className="px-4 py-3">cwnd × 0.7, vokser kubisk fra det</td>
                  <td className="px-4 py-3">cwnd → 1, slow start</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">BBR</td>
                  <td className="px-4 py-3" colSpan={2}>
                    Ikke loss-basert — bruker BtlBw × RTprop som målstørrelse, ignorerer enkelttap.
                  </td>
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
              {" "}— grunnlaget for handshake, ACK, flow control.
            </li>
            <li>
              <Link to="/cards" className="text-brand hover:underline">Repetisjonskort</Link>{" "}
              under emnet «DTE-2507».
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}
