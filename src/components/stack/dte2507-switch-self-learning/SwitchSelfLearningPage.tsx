import { Link } from "@tanstack/react-router";
import { Lightbulb, Quote } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { SwitchSim } from "./SwitchSim";

const STEPS = [
  { title: "Hva er en switch?", anchor: "switch" },
  { title: "Resepsjonist-metaforen", anchor: "metafor" },
  { title: "Self-learning-algoritmen", anchor: "algo" },
  { title: "Tre forwarding-tilfeller", anchor: "tre-tilfeller" },
  { title: "Aging-timeren", anchor: "aging" },
  { title: "Simulator", anchor: "sim" },
  { title: "Switch vs. hub vs. router", anchor: "vs" },
  { title: "Eksamen-quick-ref", anchor: "ref" },
];

export function SwitchSelfLearningPage() {
  return (
    <StackPageShell title="Switchen husker hvem du så snakke" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Kurose &amp; Ross 6.4.3 (s. 491–494)
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Switchen husker hvem du så snakke
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            En Ethernet-switch fra fabrikken er totalt blank — den vet ingenting om hvem
            som henger på hvilken port. Likevel klarer den, etter et par sekunder med
            trafikk, å sende riktig ramme til riktig port hver gang. Trikset er enkelt:
            den ser på <strong>source-MAC</strong> i hver ramme som ankommer, og lærer
            dermed hvem som er på hvilken port — uten å sende noen melding selv.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Quote className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="italic leading-relaxed">
                «Switches are self-learning — built automatically, dynamically, and
                autonomously, without any intervention from a network administrator.»
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Kurose &amp; Ross, 8. utg., s. 493
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#sim" className="text-brand hover:underline">
                switch-simulatoren
              </a>{" "}
              under viser fire hosts, en switch-tabell som fylles fra source-MAC, og
              aging-timeren som sletter gamle oppføringer.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-switch-self-learning" steps={STEPS} />

        <section id="switch" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva er en switch?</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            En link-lags-switch er en pakkesvitsj som opererer på <strong>MAC-adresser</strong>{" "}
            (lag 2). Til forskjell fra en hub som blindt regenererer hvert bit på alle
            porter, sender en switch bare frames ut på <em>relevante</em> porter.
            Resultatet: ingen kollisjoner, og hver port kan kjøre full duplex på full
            linjerate samtidig.
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>Switchen er <strong>transparent</strong> — hostene vet ikke at den er der.</li>
            <li>Switchen lagrer ingen «konfigurasjon» av MAC-er; den lærer dem fra trafikken.</li>
            <li>Switchen kjører <strong>store-and-forward</strong> (eller cut-through) per ramme.</li>
          </ul>
        </section>

        <section id="metafor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Resepsjonist-metaforen</h2>
          <div className="rounded-xl border border-border bg-card p-5 text-sm leading-relaxed">
            <p>
              Forestill deg en stor kontorbygning med én resepsjonist og mange etasjer.
              Folk kommer ned i lobbyen og leverer brev som skal til <em>«Eva i avdeling
              22»</em>. Resepsjonisten kjenner ingen i starten — så hun gjør én smart ting:
            </p>
            <p className="mt-3">
              Hver gang noen <em>kommer fra</em> en heis, noterer hun: <em>«ah, Per kom fra
              etasje 5».</em> Når hun senere skal levere et brev til Per, vet hun nøyaktig
              hvilken heis hun skal sende det med. Hvis hun ikke vet — sender hun
              kopier opp i alle heisene (broadcast).
            </p>
            <p className="mt-3 text-muted-foreground">
              Det er hele algoritmen. Switchen lærer{" "}
              <strong>uten å spørre noen om noe</strong>, bare ved å lese avsender-feltet
              på hver ramme som passerer.
            </p>
          </div>
        </section>

        <section id="algo" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Self-learning-algoritmen i pseudokode</h2>
          <div className="rounded-lg border border-border bg-background overflow-hidden">
            <pre className="p-4 text-[12px] leading-relaxed font-mono overflow-x-auto">{`når ramme f ankommer på port p:
    # 1. LÆR fra source-MAC
    tabell[f.src_mac] = (port=p, time=nå)

    # 2. SLÅ OPP destinasjons-MAC
    if f.dst_mac ikke i tabell:
        # ukjent destinasjon → broadcast
        kringkast f på alle porter unntatt p

    elif tabell[f.dst_mac].port == p:
        # destinasjonen er allerede på denne porten
        # (samme link — drop, slipper å sende tilbake)
        slipp f

    else:
        # vi vet eksakt hvilken port
        send f ut på tabell[f.dst_mac].port

    # 3. ALDRING (kjører periodisk)
    fjern entries med time + AGING_TIME < nå
`}</pre>
          </div>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Tre regler — det er det hele. Ingen kontrollprotokoll, ingen central
            administrasjon. Bare passiv observasjon av source-felter og en aging-timer.
          </p>
        </section>

        <section id="tre-tilfeller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Tre forwarding-tilfeller</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Tilfelle</th>
                  <th className="text-left font-semibold px-4 py-2">Tilstand</th>
                  <th className="text-left font-semibold px-4 py-2">Handling</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-amber-600">(a) Ukjent</td>
                  <td className="px-4 py-3">Dest-MAC finnes ikke i tabellen.</td>
                  <td className="px-4 py-3"><strong>Broadcast</strong> — send på alle porter unntatt innkommende.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-blue-600">(b) Samme port</td>
                  <td className="px-4 py-3">Dest-MAC er kjent, men på samme port som rammen kom fra.</td>
                  <td className="px-4 py-3"><strong>Drop (filter)</strong> — hostene er allerede på samme link og hørte rammen.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-emerald-600">(c) Annen port</td>
                  <td className="px-4 py-3">Dest-MAC er kjent, og på en annen port.</td>
                  <td className="px-4 py-3"><strong>Forward</strong> — kun den ene porten.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="aging" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Aging-timeren</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Hver oppføring i tabellen har en alder. Standard aging-tid i Cisco-switcher
            er <strong>300 sekunder</strong> (5 min). Hvis en MAC ikke har «vist seg» på
            5 minutter, antar switchen at den er borte — kanskje hosten er flyttet eller
            slått av — og fjerner oppføringen.
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>
              <strong>Hver gang</strong> en ramme ankommer fra en MAC, refreshes alderen.
            </li>
            <li>
              Hvis hosten flyttes til en annen port, vil den første rammen fra ny port{" "}
              <em>overskrive</em> oppføringen — switchen oppdager flytten gratis.
            </li>
            <li>
              Hvis hosten bare er stille, vil oppføringen til slutt utløpe og neste
              ramme TIL den hosten blir broadcastet (mens den lærer på nytt).
            </li>
          </ul>
        </section>

        <section id="sim" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Simulator</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Fire hosts: A på port 1, B på port 2, C og D begge på port 3 (som om en
            mini-switch henger der). Send rammer mellom dem og se hvordan tabellen
            fylles, hvordan filter-regelen slår inn når C→D, og hvordan aging fjerner
            oppføringer.
          </p>
          <SwitchSim />
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <strong>3 øvelses-scenarier:</strong>
            <ol className="mt-2 space-y-1 list-decimal pl-5 text-muted-foreground">
              <li>
                <strong>Helt tom tabell.</strong> Send A → B. Hva skjer? (Switchen lærer A
                på port 1; B er ukjent → broadcast på port 2 og 3. Etter at B svarer, vet
                den begge.)
              </li>
              <li>
                <strong>Filter-regelen.</strong> Send først noe slik at både C og D er
                kjent på port 3, så send C → D. Switchen filtrerer — frame dropper på
                switchen, men C og D ser hverandre uansett fordi de er på samme link.
              </li>
              <li>
                <strong>Aging.</strong> Send et par rammer, deretter trykk «Hopp 5 slots»
                uten å sende noe. Se hvordan oppføringer utløper. Neste ramme blir igjen
                broadcast.
              </li>
            </ol>
          </div>
        </section>

        <section id="vs" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Switch vs. hub vs. router</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-28">Enhet</th>
                  <th className="text-left font-semibold px-4 py-2">Lag</th>
                  <th className="text-left font-semibold px-4 py-2">Hva ser den på</th>
                  <th className="text-left font-semibold px-4 py-2">Kollisjonsdomene</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Hub</td>
                  <td className="px-4 py-2">1 (fysisk)</td>
                  <td className="px-4 py-2">Bit-strømmen direkte</td>
                  <td className="px-4 py-2">Felles — alle porter</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Switch</td>
                  <td className="px-4 py-2">2 (linklag)</td>
                  <td className="px-4 py-2">MAC-header</td>
                  <td className="px-4 py-2">Per port</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Router</td>
                  <td className="px-4 py-2">3 (nettverkslag)</td>
                  <td className="px-4 py-2">IP-header</td>
                  <td className="px-4 py-2">Per interface (også per broadcast-domene)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            En switch er altså en «smartere» hub — den isolerer trafikk per port og
            har ingen kollisjoner. En router er enda mer: den splitter også broadcast-
            domener og oversetter mellom subnett.
          </p>
        </section>

        <section id="ref" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">8. Eksamen-quick-ref</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Spørsmål</th>
                  <th className="text-left font-semibold px-4 py-2">Svar</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Hva lærer switchen av?</td>
                  <td className="px-4 py-2">Source-MAC + port på hver innkommende ramme.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Ukjent dest-MAC ⇒</td>
                  <td className="px-4 py-2">Broadcast på alle porter unntatt innkommende.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Kjent dest-MAC, samme port ⇒</td>
                  <td className="px-4 py-2">Filter (drop) — slipper å sende tilbake.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Kjent dest-MAC, annen port ⇒</td>
                  <td className="px-4 py-2">Forward kun på den porten.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Aging-timeout (Cisco-default)</td>
                  <td className="px-4 py-2">300 sekunder.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Krever konfigurasjon?</td>
                  <td className="px-4 py-2">Nei — plug-and-play. Selvlærende.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Hvorfor STP?</td>
                  <td className="px-4 py-2">Forhindrer broadcast-storm når flere switcher danner sykel.</td>
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
              <Link to="/stack/$slug" params={{ slug: "dte2507-arp-detektiv" }} className="text-brand hover:underline">ARP-detektiv</Link>
              {" "}— forrige tema; MAC-adresser og adresseoppslag.
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
