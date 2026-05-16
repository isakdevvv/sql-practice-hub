import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex, TexBlock } from "@/components/Tex";
import { CountToInfinitySim } from "./CountToInfinitySim";

const STEPS = [
  { title: "Distance-vector — kort repetisjon", anchor: "dv" },
  { title: "Bokens 3-node-eksempel", anchor: "graf" },
  { title: "Good news travels fast", anchor: "good" },
  { title: "Bad news travels slowly", anchor: "bad" },
  { title: "Simulator", anchor: "sim" },
  { title: "Poisoned reverse", anchor: "poison" },
  { title: "Når poisoned reverse svikter", anchor: "pr-svikt" },
  { title: "Eksamen-quick-ref", anchor: "ref" },
];

export function CountToInfinityPage() {
  return (
    <StackPageShell title="Count-to-infinity" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Kurose &amp; Ross 5.2.2 (s. 393-394)
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Count-to-infinity — bad news travels slowly
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Distance-vector-protokoller (RIP, EIGRP-ish) konvergerer som regel raskt når en
            lenke blir <em>billigere</em>. Men når en lenke blir mer <em>kostbar</em> — eller
            faller helt ut — kan rykter mellom naboene danne en falsk «billig» rute via
            hverandre, og verdiene teller sakte oppover i en routing loop til kostnaden
            endelig overstiger den ekte direktelenken. Det er <strong>count-to-infinity</strong>.
            Boken beskriver det som et «svart hull» — pakker bouncer fram og tilbake mellom
            de to nodene som tror den andre har en bedre vei.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#sim" className="text-brand hover:underline">3-node-simulatoren</a>{" "}
              under: dra slideren fra 4 til 60 og se de 44 iterasjonene rulle. Slå på
              poisoned reverse for å se hva som endrer seg.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-count-to-infinity" steps={STEPS} />

        <section id="dv" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Distance-vector — kort repetisjon</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Hver node holder en vektor <Tex>{`D_x(y)`}</Tex> — estimert minste kostnad fra x
            til alle destinasjoner y. Bellman-Fords likning sier:
          </p>
          <TexBlock>
            {`D_x(y) = \\min_{v \\in \\text{nabo}(x)} \\{ c(x,v) + D_v(y) \\}`}
          </TexBlock>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Hver gang en node sin vektor endres, sender den nye vektoren til sine naboer.
            Naboene rekjorer formelen ovenfor med oppdaterte rykter. Algoritmen er asynkron,
            distribuert og iterativ — den lover å konvergere så lenge ingen rykter er falske.
            Problemet er at endrede kostnader skaper rykter som <em>baserer seg</em> på den
            gamle sannheten en stund.
          </p>
        </section>

        <section id="graf" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Bokens 3-node-eksempel</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Tre rutere x, y, z på en linje. Startkostnader:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5 mb-3">
            <li><Tex>{`c(y,x) = 4`}</Tex></li>
            <li><Tex>{`c(y,z) = 1`}</Tex></li>
            <li><Tex>{`c(x,z)`}</Tex> finnes ikke direkte.</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed">
            I steady state vet y at korteste sti til x er direkte: <Tex>{`D_y(x) = 4`}</Tex>.
            z vet at korteste sti til x går via y: <Tex>{`D_z(x) = 5`}</Tex>. Begge naboene
            har annonsert disse verdiene til hverandre. Alt er stabilt.
          </p>
        </section>

        <section id="good" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Good news travels fast</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Anta nå at <Tex>{`c(y,x)`}</Tex> plutselig synker fra 4 til 1. y oppdager
            endringen, beregner: <Tex>{`\\min(1, 1 + D_z(x)) = \\min(1, 6) = 1`}</Tex>.
            y annonserer Dy = 1 til z. z oppdaterer: <Tex>{`D_z(x) = 1 + 1 = 2`}</Tex>. Ferdig.
            To meldinger, og hele nettet vet sannheten.
          </p>
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs">
            <strong className="text-emerald-700 dark:text-emerald-400">Slogan:</strong>{" "}
            Gode nyheter spres raskt — fordi den nye verdien er <em>lavere</em> enn alle
            eksisterende rykter, og <Tex>{`\\min`}</Tex> finner den umiddelbart.
          </div>
        </section>

        <section id="bad" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Bad news travels slowly</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Nå snur vi det rundt: <Tex>{`c(y,x)`}</Tex> går fra 4 til 60 (lenken degraderer).
            Hva skjer?
          </p>
          <ol className="text-sm space-y-1.5 list-decimal pl-5 mb-3">
            <li>
              y oppdager endringen, men <strong>vet ikke at z går via y</strong> for å nå x.
              y ser fortsatt z sitt gamle rykte: <Tex>{`D_z(x) = 5`}</Tex>.
            </li>
            <li>
              y regner: <Tex>{`\\min(60, 1+5) = 6`}</Tex>. y velger «via z» — fordi z lyver
              (ufrivillig) om å ha en kortere rute.
            </li>
            <li>
              y annonserer Dy = 6 til z. z regner: <Tex>{`D_z(x) = 1+6 = 7`}</Tex>.
            </li>
            <li>
              z annonserer Dz = 7 til y. y regner: <Tex>{`\\min(60, 1+7) = 8`}</Tex>. Osv.
            </li>
            <li>
              Verdiene teller sakte oppover: 6, 7, 8, 9, … helt til Dy = 60 og y endelig
              innser at direktelenken er minst like god. <strong>44 iterasjoner.</strong>
            </li>
          </ol>
          <blockquote className="border-l-4 border-brand pl-4 italic text-sm text-muted-foreground my-3">
            «A routing loop is like a black hole — a packet destined for x arriving at y or z
            as of t1 will bounce back and forth between these two nodes forever.»
            <div className="not-italic text-[11px] mt-1">— Kurose &amp; Ross, s. 393</div>
          </blockquote>
        </section>

        <section id="sim" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Simulator</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Dra slideren fra 4 til 60. Trykk Spill for å se hele loopen rulle, eller Neste
            for ett steg av gangen. Slå på poisoned reverse for å se hvordan z lyver til y.
          </p>
          <CountToInfinitySim />
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <strong>3 øvelses-scenarier:</strong>
            <ol className="mt-2 space-y-1 list-decimal pl-5 text-muted-foreground">
              <li>
                <strong>Bad news klassisk.</strong> Reset, c(y,x) = 60, poisoned reverse av.
                Tell hvor mange iterasjoner det tar før y innser at 60 er bedre enn 1 + Dz.
              </li>
              <li>
                <strong>Good news.</strong> c(y,x) = 1 (lavere enn 4). Hvor mange iterasjoner?
                (Svar: alt er over på 2-3 steg.)
              </li>
              <li>
                <strong>Poisoned reverse på.</strong> c(y,x) = 60, slå på pr.
                Hva sier z til y når slideren flytter? (Svar: z annonserer ∞ — fordi z går
                via y for å nå x. y må derfor velge direktelenken med en gang.)
              </li>
            </ol>
          </div>
        </section>

        <section id="poison" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Poisoned reverse — løsningen som ofte virker</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Trikset er enkelt og litt fælt: hvis z ruter til x via y, da skal z lyve til y
            om at <Tex>{`D_z(x) = \\infty`}</Tex>. Dette «forgifter» den omvendte retningen
            slik at y aldri kan tro at z har en bedre rute.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Når <Tex>{`c(y,x)`}</Tex> hopper til 60, ser y dermed kun ett alternativ:
            direktelenken. y velger Dy = 60 umiddelbart. z får ryktet og oppdaterer
            Dz = 61. To meldinger, ferdig. Ingen loop.
          </p>
          <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-4 text-xs">
            <strong className="text-brand">Hvor er den i RIP?</strong> Poisoned reverse er
            del av RIP-spesifikasjonen (RFC 2453, §3.4.3) — kalles også «split horizon with
            poisoned reverse». «Plain split horizon» er en mildere variant: ikke annonser
            ryktet tilbake til den naboen du lærte det fra. Plain split horizon hjelper i
            2-node-tilfeller, men er svakere enn poisoned reverse i grafer med løkker.
          </div>
        </section>

        <section id="pr-svikt" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Når poisoned reverse svikter</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Poisoned reverse fungerer perfekt i 2-node-tilfellet. Men hvis det finnes minst
            <em> tre </em>noder i en sirkel, kan løgnen «smitte» videre gjennom kjeden av
            naboer og bringe loopen tilbake. Boken nevner dette eksplisitt i §5.2.2.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tenk deg fire noder w-x-y-z i en sirkel. Hvis lenken w-x faller:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5 my-3">
            <li>w er ikke direkte nabo med y eller z, så poisoned reverse mellom paret w-x
              hjelper bare i den ene retningen.</li>
            <li>y kan fortsette å annonsere en «billig» rute til x basert på et sykluskall
              gjennom z, og kjeden kan telle oppover som før — bare med flere mellomledd.</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Resultatet: RIP setter <strong>infinity = 16</strong> som en pragmatisk grense.
            Når kostnaden teller forbi 16, gir alle opp og marker ruten som «unreachable».
            Det begrenser konvergenstiden men kapper også maksimal nettverksdiameter til 15
            hops — derfor brukes RIP nesten aldri i moderne nett.
          </p>
        </section>

        <section id="ref" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">8. Eksamen-quick-ref</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Begrep</th>
                  <th className="text-left font-semibold px-4 py-2">Hva</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Count-to-infinity</td>
                  <td className="px-4 py-3">
                    DV-loop der naboer teller kostnaden sakte oppover etter en pris-økning.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Routing loop</td>
                  <td className="px-4 py-3">
                    To eller flere noder ruter pakker til hverandre i sirkel — «svart hull».
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Split horizon</td>
                  <td className="px-4 py-3">
                    Ikke annonser et rykte tilbake til naboen du lærte det fra.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Poisoned reverse</td>
                  <td className="px-4 py-3">
                    Annonser <Tex>{`\\infty`}</Tex> tilbake til den naboen du går via.
                    Fikser 2-node-tilfeller, ikke alltid lengre sykluser.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">RIP infinity = 16</td>
                  <td className="px-4 py-3">
                    Pragmatisk grense: når kostnad ≥ 16, marker som unreachable.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Relatert</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-ruting" }} className="text-brand hover:underline">DTE-2507 — ruting</Link>{" "}
              — Dijkstra og Bellman-Ford steg for steg.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-bgp-stige" }} className="text-brand hover:underline">BGP-rutevelger-stige</Link>{" "}
              — hvordan BGP velger blant konkurrerende ruter.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte-2507" }} className="text-brand hover:underline">DTE-2507-hub</Link>{" "}
              — alle nettverks-mini-kursene.
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}
