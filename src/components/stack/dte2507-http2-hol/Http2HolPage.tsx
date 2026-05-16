import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex, TexBlock } from "@/components/Tex";
import { HolTimeline } from "./HolTimeline";
import { Http2Visualizer } from "./Http2Visualizer";
import { RelatedVisualizers } from "@/components/stack/RelatedVisualizers";

const STEPS = [
  { title: "Side-ved-side-simulator", anchor: "sim-top" },
  { title: "Problemet med HTTP/1.0", anchor: "non-persistent" },
  { title: "Persistente tilkoblinger", anchor: "persistent" },
  { title: "Pipelining og HOL-blokkering", anchor: "hol" },
  { title: "Hvorfor 6 parallelle ikke er nok", anchor: "parallel" },
  { title: "HTTP/2 — frames og interleaving", anchor: "http2" },
  { title: "Frame-for-frame timeline", anchor: "sim" },
  { title: "Eksamen-quick-ref", anchor: "ref" },
];

export function Http2HolPage() {
  return (
    <StackPageShell title="HTTP/1.1 vs HTTP/2 — HOL-blokkering" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Kurose &amp; Ross 2.2.6
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            HTTP/1.1 vs HTTP/2 — hvorfor ikke bare 6 parallelle?
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            En moderne nettside er aldri ett objekt — det er en HTML-fil pluss 10-100 små
            ressurser (CSS, JS, fonter, bilder). HTTP/1.0 åpnet en ny TCP-tilkobling per
            objekt: <strong>2 RTT per objekt</strong>. HTTP/1.1 holdt forbindelsen åpen og
            kunne pipelin-e forespørsler. Likevel led den av <strong>Head-of-Line-blokkering</strong>:
            en stor fil først kunne stoppe alle små bak seg. HTTP/2 løste det med
            <em>frames</em> som kan interleaves over én TCP-tilkobling.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#sim" className="text-brand hover:underline">timeline-simulatoren</a>{" "}
              under viser hvordan 11 objekter laster under 1.0, 1.1, 1.1+pipelining og 2.0
              med samme RTT og linje-rate.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-http2-hol" steps={STEPS} />

        <section id="sim-top" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Side-ved-side-simulator</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Velg modus og se hvordan samme sett ressurser leveres under HTTP/1.0,
            HTTP/1.1 med pipelining, 6 parallelle TCP-er, HTTP/2 med multipleksing,
            og HTTP/2 når en TCP-pakke mistes. Skyv ressurs-slideren for å se hva
            som skjer når sida vokser. Time-distanse-diagrammet er tegnet i samme
            skala på tvers av modusene — sammenlign totaltidene visuelt.
          </p>
          <Http2Visualizer />
        </section>

        <section id="non-persistent" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. HTTP/1.0 — non-persistent: 2 RTT per objekt</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            HTTP/1.0 åpnet en <strong>ny TCP-tilkobling per forespørsel</strong>. For hvert
            objekt: TCP-handshake (1 RTT), så GET + respons (1 RTT). Tilkoblingen lukkes,
            neste objekt starter på nytt. For en side med HTML + 10 små objekter:
          </p>
          <TexBlock>
            {`T_{\\text{1.0}} \\approx (1 + N) \\cdot 2 \\cdot \\text{RTT} = 11 \\cdot 2 \\cdot \\text{RTT} = 22\\,\\text{RTT}`}
          </TexBlock>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Ved RTT = 100 ms blir det 2.2 sekunder før første pikselen er på skjermen,
            og det er <em>før</em> selve overføringstida av bytene. Hvert objekt betaler
            handshake-prisen om igjen.
          </p>
        </section>

        <section id="persistent" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. HTTP/1.1 persistente tilkoblinger</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            HTTP/1.1 (1997) holder TCP-tilkoblingen åpen etter første respons. Klienten
            sender neste GET på den samme forbindelsen — én handshake-pris totalt, og
            slow start-vinduet rekker å vokse. Uten pipelining er det fortsatt
            <em> 1 RTT per objekt</em> (GET → respons sekvensielt):
          </p>
          <TexBlock>
            {`T_{\\text{1.1 serial}} \\approx 1\\,\\text{RTT}_{\\text{handshake}} + N \\cdot \\text{RTT}_{\\text{request}}`}
          </TexBlock>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            For 11 objekter: 1 + 11 ≈ 12 RTT. Halvparten av tida sammenlignet med 1.0,
            men fortsatt sekvensielt.
          </p>
        </section>

        <section id="hol" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Pipelining og HOL-blokkering</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            HTTP/1.1 tillot <strong>pipelining</strong>: klienten sender GET 1, GET 2,
            GET 3, … <em>uten</em> å vente på respons. Server svarer i samme rekkefølge.
            I beste fall: alle forespørslene ankommer i én RTT, alle responsene strømmer
            tilbake i én RTT. <Tex>{`T \\approx 1\\,\\text{RTT}`}</Tex> for hele sida.
          </p>
          <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 text-sm">
            <strong className="text-rose-700 dark:text-rose-400">Men: Head-of-Line-blokkering.</strong>{" "}
            HTTP/1.1 krever at responsene kommer i <em>samme rekkefølge som forespørslene</em>.
            Hvis første objekt er en 2 MB video-fil, må de 8 små CSS-filene bak vente til hele
            videoen er sendt ferdig — selv om de ville være ferdig på et brøkdel av tida.
          </div>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Eksempel: én stor fil (50 frames) først, deretter 8 små filer (2 frames hver).
            På 1.1-pipelining må de små vente i kø: ferdig først etter 50 + 16 = 66 frames.
            I praksis var pipelining så bug-utsatt at de fleste nettlesere
            <strong> skrudde det av</strong>.
          </p>
        </section>

        <section id="parallel" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Hvorfor 6 parallelle tilkoblinger ikke er nok</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Nettleserne kompenserte med å åpne <strong>opptil 6 parallelle</strong> TCP-tilkoblinger
            mot samme domene. Tre problemer:
          </p>
          <ul className="text-sm space-y-1.5 list-disc pl-5 mb-3">
            <li>
              <strong>Hver tilkobling har sin egen slow start.</strong> 6 strømmer som
              starter med cwnd=10 hver er ikke det samme som én strøm med cwnd=60 —
              det tar flere RTTs å varme dem opp.
            </li>
            <li>
              <strong>«Cheating» på fairness.</strong> Som Kurose &amp; Ross sier:{" "}
              <em>«By opening multiple parallel TCP connections to transport a single Web
              page, the browsers can 'cheat' and grab a larger portion of the link
              bandwidth»</em> (s. 114). Ingen ren AIMD-fairness.
            </li>
            <li>
              <strong>HOL gjentas per tilkobling.</strong> Hvis det store objektet ligger
              på TCP-strøm 1, og resten venter på rad 1 (per <code className="font-mono text-[11px]">{`<link>`}</code>-rekkefølge),
              blokkerer det fortsatt.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Resultatet: forskjellige domener (<em>domain sharding</em>) ble brukt som
            triks for å få 6 nye TCP-tilkoblinger per domene. Stygg løsning på et
            protokollproblem.
          </p>
        </section>

        <section id="http2" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. HTTP/2 — frames og interleaving</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            HTTP/2 (2015, basert på Googles SPDY) endrer hele transport-modellen:
          </p>
          <ul className="text-sm space-y-1.5 list-disc pl-5 mb-3">
            <li>
              <strong>Én TCP-tilkobling</strong> per domene. All slow start, all
              congestion control gjelder ett vindu — som faktisk er <em>fair</em>.
            </li>
            <li>
              <strong>Frames + streams.</strong> Hvert HTTP-meldingsobjekt deles i frames
              (typisk &lt;= 16 KB). Hver frame er taggat med en <code className="font-mono text-[11px]">stream ID</code>.
              Server kan blande frames fra mange svar — interleaving over én TCP-strøm.
            </li>
            <li>
              <strong>Prioritetsvekter 1-256.</strong> Klienten kan signalisere at CSS er
              viktigere enn et bilde under fold. Server scheduler frames etter
              vektet round-robin.
            </li>
            <li>
              <strong>Header-komprimering (HPACK)</strong> og <em>server push</em> kommer
              på toppen, men det er framing + interleaving som dreper HOL.
            </li>
          </ul>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">
            <strong className="text-emerald-700 dark:text-emerald-400">HOL er borte på HTTP-laget.</strong>{" "}
            Den stor video-filen sender én frame, så kan server sende én CSS-frame, så en
            til, så tilbake til videoen. CSS-filene blir ferdig på sin egne tid uten å
            vente på videoen.
          </div>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            <strong>Caveat:</strong> HOL kan fortsatt skje på <em>TCP-laget</em> — hvis én
            TCP-pakke mistes, blokkeres alle frames bak den (uansett stream ID) til
            retransmit kommer. Det er motivasjonen for HTTP/3 over QUIC (UDP-basert).
          </p>
        </section>

        <section id="sim" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Interaktiv timeline</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Velg protokollvariant og se hvor lang tid 1 stor + 8 små objekter tar å laste.
            Hver vertikal kolonne er ett &laquo;frame-slot&raquo; (én tidsenhet); fargen
            viser hvilket objekt som overføres da.
          </p>
          <HolTimeline />
        </section>

        <section id="ref" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">7. Eksamen-quick-ref</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Variant</th>
                  <th className="text-left font-semibold px-4 py-2">Tid for N objekter</th>
                  <th className="text-left font-semibold px-4 py-2">HOL-blokkering?</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">1.0 non-persistent</td>
                  <td className="px-4 py-3">(1+N) · 2 RTT</td>
                  <td className="px-4 py-3">N/A — én forespørsel av gangen</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">1.1 persistent</td>
                  <td className="px-4 py-3">1 + N RTT (serielt)</td>
                  <td className="px-4 py-3">Ja, men kun én forespørsel ute</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">1.1 + pipelining</td>
                  <td className="px-4 py-3">≈ 1 RTT, men kø-rekkefølge</td>
                  <td className="px-4 py-3">Ja — stor først blokkerer små</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">2.0 (frames)</td>
                  <td className="px-4 py-3">≈ 1 RTT, interleaved</td>
                  <td className="px-4 py-3">Nei på HTTP-lag; ja på TCP-lag</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">3.0 (QUIC/UDP)</td>
                  <td className="px-4 py-3">Som 2.0 + 0-RTT mulig</td>
                  <td className="px-4 py-3">Nei — uavhengig streams</td>
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
              <Link to="/stack/$slug" params={{ slug: "http-anatomi" }} className="text-brand hover:underline">HTTP-anatomi</Link>
              {" "}— header-felt, metoder, statuskoder.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-web-caching-matte" }} className="text-brand hover:underline">Web-caching matematikk</Link>
              {" "}— neste tema i Ch 2.
            </li>
          </ul>
        </div>
        <RelatedVisualizers slug="http2" />
      </article>
    </StackPageShell>
  );
}
