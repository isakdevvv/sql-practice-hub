import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex, TexBlock } from "@/components/Tex";
import { BottleneckSim } from "./BottleneckSim";

const STEPS = [
  { title: "Latency vs throughput", anchor: "lat-vs-thp" },
  { title: "To lenker i serie", anchor: "to-lenker" },
  { title: "N lenker — generalisering", anchor: "n-lenker" },
  { title: "Hvor er flaskehalsen i 2024?", anchor: "hvor" },
  { title: "Interaktiv simulator", anchor: "sim" },
  { title: "Hvorfor speedtest gir det den gir", anchor: "speedtest" },
  { title: "Eksempel: filoverføring", anchor: "filoverforing" },
  { title: "Multiple flows på samme link", anchor: "multiflow" },
  { title: "Eksamen-quick-ref", anchor: "ref" },
];

export function BottleneckThroughputPage() {
  return (
    <StackPageShell title="Flaskehals & throughput" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Kurose &amp; Ross 1.4.4 (s. 43-46)
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Hvor flyter flaskehalsen?
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            <em>Throughput</em> er den raten bits faktisk strømmer fra sender til mottaker. Den
            er <strong>ikke</strong> det samme som båndbredden på en enkelt link, og ikke det
            samme som det reverserte av RTT. Den er kappet av den <em>tregeste</em> lenken i
            kjeden:
          </p>
          <TexBlock>{`R_{\\text{end-to-end}} \\le \\min\\{R_1, R_2, \\ldots, R_N\\}`}</TexBlock>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Den lenken som slår inn med &laquo;min&raquo; kalles <strong>flaskehalsen</strong> (bottleneck
            link). I 2024 er det nesten alltid din egen access-link — fiber-bredbåndet, mobilen,
            kontoret-WiFi-en. Speedtest er en direkte måling av denne flaskehalsen.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#sim" className="text-brand hover:underline">flaskehals-simulatoren</a>{" "}
              lar deg variere R_server, R_core og R_client og se hvilken lenke som setter taket.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-bottleneck-throughput" steps={STEPS} />

        <section id="lat-vs-thp" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Latency vs throughput — to ulike spørsmål</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Studenter blander disse også. Boka holder dem strengt fra hverandre:
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Aspekt</th>
                  <th className="text-left font-semibold px-4 py-2">Latency (delay)</th>
                  <th className="text-left font-semibold px-4 py-2">Throughput</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Spørsmål</td>
                  <td className="px-4 py-3">«Hvor lenge tar én pakke?»</td>
                  <td className="px-4 py-3">«Hvor mange bits per sekund kan jeg sende?»</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Enhet</td>
                  <td className="px-4 py-3">sekunder (ms, µs)</td>
                  <td className="px-4 py-3">bits/sekund (Mbps, Gbps)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Kappes av</td>
                  <td className="px-4 py-3">Sum av alle delays + RTTs</td>
                  <td className="px-4 py-3">Min av alle linkrater</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Forbedres av</td>
                  <td className="px-4 py-3">Kortere fysisk avstand, raskere prosessering</td>
                  <td className="px-4 py-3">Oppgradere flaskehals-lenken</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            Du kan ha lav latency og lav throughput (smal mobillinje med kort avstand), eller
            høy latency og høy throughput (geo-sat med mye båndbredde). De er uavhengige.
          </p>
        </section>

        <section id="to-lenker" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. To lenker i serie — bokens grunneksempel</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Boka starter med to linker (s. 43-44, fig 1.20). Server &rarr; ruter med rate{" "}
            <Tex>{`R_s`}</Tex>; ruter &rarr; klient med rate <Tex>{`R_c`}</Tex>.
            En fil med <Tex>{`F`}</Tex> bits skal overføres.
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground">
            <li>
              Hvis <Tex>{`R_s < R_c`}</Tex>: bits flyter fra server, gjennom ruteren, og videre
              til klienten i takt <Tex>{`R_s`}</Tex>. Mellomruteren tømmes like raskt som den
              fylles. <strong>Server-linken er flaskehalsen.</strong>
            </li>
            <li>
              Hvis <Tex>{`R_c < R_s`}</Tex>: ruteren fylles raskere enn den tømmes; ruterens
              kø vokser. Etter en stund er den i steady state der bits forlater ruteren med
              rate <Tex>{`R_c`}</Tex>. <strong>Klient-linken er flaskehalsen.</strong>
            </li>
          </ul>
          <TexBlock>{`R_{\\text{e2e}} = \\min(R_s, R_c)`}</TexBlock>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Tid å overføre filen blir omtrent <Tex>{`F / \\min(R_s, R_c)`}</Tex>, pluss en liten
            startup-tid (transient før ruterens kø er fylt og strømmen stabilisert).
          </p>
        </section>

        <section id="n-lenker" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. <Tex>{`N`}</Tex> lenker — generalisering</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Argumentet skalerer trivielt: med <Tex>{`N`}</Tex> linker i serie, hver med rate{" "}
            <Tex>{`R_i`}</Tex>:
          </p>
          <TexBlock>{`R_{\\text{e2e}} = \\min_{i = 1, \\ldots, N} R_i`}</TexBlock>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Bare én lenke setter taket. Alle andre har «slack» — de er ikke fullt utnyttet,
            og å oppgradere dem hjelper ikke. Dette er det som gjør &laquo;flaskehals&raquo; til en så
            nyttig metafor: en flaske med tynnest hals slipper ut væske like sakte uansett hvor
            stor selve flasken er.
          </p>
        </section>

        <section id="hvor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Hvor er flaskehalsen i 2024?</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Bokens hovedpoeng (s. 45) er empirisk:
          </p>
          <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm leading-relaxed mb-3">
            <em>
              «The constraining factor for throughput in today's Internet is typically the
              access network.»
            </em>
            <div className="text-[11px] text-muted-foreground mt-1">Kurose &amp; Ross, s. 45</div>
          </div>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Hvorfor? Ren bedrifts-økonomi:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground mb-3">
            <li>
              <strong>Backbone</strong> (Tier-1 ISPs, content delivery networks): operatørene
              installerer 100 Gbps og 400 Gbps fiber. Marginalkostnaden av ekstra båndbredde
              er lav, og det er kostnadseffektivt å ha kraftig overdimensjonering for å unngå
              kongesterte hopps.
            </li>
            <li>
              <strong>Datasenter</strong> (Google, Netflix, AWS): typisk 10-100 Gbps server-NIC,
              ofte multipliser ved load balancing. Sjelden bottleneck for én bruker.
            </li>
            <li>
              <strong>Access-linken</strong> (din ADSL/fiber, mobilforbindelse, hjemme-WiFi):
              dette er der ISP-ene må multipleksere mange brukere på begrenset infrastruktur,
              og der individuell kapasitet er kjøpt etter abonnement. Få brukere har 10 Gbps
              hjem; mange har 50-1000 Mbps.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Det betyr at hvis Netflix føles tregt: oppgradering av Netflix sin server hjelper
            ingenting — flaskehalsen er hos deg. Det forklarer hvorfor speedtest.net måler det
            den måler (se neste seksjon).
          </p>
        </section>

        <section id="sim" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Interaktiv simulator</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Velg preset eller juster slidere. Den røde lenken er flaskehalsen — endring der
            forandrer end-to-end-raten umiddelbart. Endring i de andre lenkene gir ingen effekt.
          </p>
          <BottleneckSim />
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <strong>3 øvelses-scenarier:</strong>
            <ol className="mt-2 space-y-1 list-decimal pl-5 text-muted-foreground">
              <li>
                <strong>Hjemme-fiber 2024:</strong> Velg presetet. Hvilken lenke er flaskehalsen?
                (Svar: R_client, fiber-bredbåndet ditt med 100 Mbps. Server og backbone er flere
                titalls Gbps.)
              </li>
              <li>
                <strong>Oppgrader server:</strong> sett R_server til 100 Gbps. Endrer end-to-end
                throughput seg? (Nei. R_client = 100 Mbps er fortsatt minst.)
              </li>
              <li>
                <strong>Oppgrader access:</strong> nå sett R_client til 1 Gbps. End-to-end
                throughput hopper til 1 Gbps. Det er den eneste oppgraderingen som hjelper.
              </li>
            </ol>
          </div>
        </section>

        <section id="speedtest" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Hvorfor speedtest gir det den gir</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Speedtest.net (eller fast.com fra Netflix) virker slik: din nettleser åpner et stort
            antall parallelle TCP-tilkoblinger til en speedtest-server, ber om en stor blob med
            data, og måler hvor raskt det kommer inn over X sekunder. Hvorfor parallelle
            forbindelser? For å mette flaskehalsen — én TCP-strøm kan bli kongesjon-styrt ned,
            men 8-32 strømmer parallelt fyller pipa.
          </p>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Resultatet er et estimat av <strong>min(R_i)</strong> langs hele banen. Stort sett
            er det det samme som din <strong>R_client</strong>, fordi det er den minste lenken
            i 99 % av tilfellene. Hvis speedtest gir 120 Mbps og du har et 100 Mbps abonnement —
            sannsynligvis fungerer ISP-en din litt over spec, og measurement-overhead spiser
            opp resten.
          </p>
          <div className="rounded-lg border border-border bg-card p-5 text-sm">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Hva speedtest IKKE måler
            </div>
            <ul className="space-y-1 list-disc pl-5">
              <li>
                Den måler ikke <em>en spesifikk applikasjons throughput</em> — det avhenger av
                serverens kapasitet og kongestion underveis. Speedtest velger en server nær deg,
                ofte hos ISP-en.
              </li>
              <li>
                Den måler ikke <em>WiFi-roten ditt</em> direkte — det er R_client som måles, men
                R_client består av flere ledd (klient-WiFi, AP, modem, ISP-link). Dårlig WiFi
                kan gi lav speedtest selv om abonnementet er greit.
              </li>
              <li>
                Den måler ikke <em>throughput til en spesifikk fjern destinasjon</em> — bare til
                den nærmeste speedtest-serveren. International throughput kan være helt
                annerledes.
              </li>
            </ul>
          </div>
        </section>

        <section id="filoverforing" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Eksempel: filoverføring</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Boka regner et klassisk eksempel: en fil <Tex>{`F = 32 \\cdot 10^6`}</Tex> bits (= 4 MB)
            skal sendes over to lenker med <Tex>{`R_s = 2 \\cdot 10^6`}</Tex> bps (2 Mbps) og
            <Tex>{` R_c = 1 \\cdot 10^6`}</Tex> bps (1 Mbps).
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground mb-3">
            <li><Tex>{`R_{\\text{e2e}} = \\min(2, 1) = 1`}</Tex> Mbps</li>
            <li>Tid <Tex>{` \\approx 32 \\cdot 10^6 / 10^6 = 32`}</Tex> sekunder</li>
            <li>Server-linken er <em>halvparten</em> ledig hele tiden — uutnyttet kapasitet</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Hvis vi skulle gjøre filoverføringen raskere, må vi enten oppgradere klient-linken
            eller bruke parallelle TCP-strømmer som henter ulike deler fra forskjellige servere
            (slik BitTorrent og moderne CDNs gjør).
          </p>
        </section>

        <section id="multiflow" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Multiple flows på samme link</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Hva skjer hvis flere brukere/strømmer deler samme flaskehals? Boka diskuterer dette
            kort på s. 45-46. Hvis <Tex>{`K`}</Tex> TCP-strømmer alle vil ha så mye som mulig av
            en delt flaskehals med rate <Tex>{`R`}</Tex>, vil hver strøm i steady state få
            omtrent <Tex>{`R/K`}</Tex> — TCPs AIMD konvergerer mot rettferdig deling
            (se{" "}
            <Link to="/stack/$slug" params={{ slug: "dte2507-congestion-control" }} className="text-brand hover:underline">
              congestion control
            </Link>
            ).
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Det er derfor Netflix hakker når lillebror laster torrent over samme WiFi: din
            access-link er flaskehalsen, og den må deles. Det er ikke at &laquo;internett er tregt
            i dag&raquo; — det er at to TCP-strømmer aktivt konkurrerer.
          </p>
        </section>

        <section id="ref" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">9. Eksamen-quick-ref</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Konsept</th>
                  <th className="text-left font-semibold px-4 py-2">Formel / fakta</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">End-to-end throughput</td>
                  <td className="px-4 py-3"><Tex>{`R_{\\text{e2e}} = \\min_i R_i`}</Tex></td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Bottleneck</td>
                  <td className="px-4 py-3">Den lenken som realiserer min</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Filoverføring</td>
                  <td className="px-4 py-3"><Tex>{`T \\approx F / R_{\\text{e2e}}`}</Tex></td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">2024 Internett</td>
                  <td className="px-4 py-3">Access-linken er nesten alltid bottleneck</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">K delte strømmer</td>
                  <td className="px-4 py-3">Hver får ~<Tex>{`R / K`}</Tex> i steady state (TCP fairness)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Speedtest</td>
                  <td className="px-4 py-3">Måler <em>R_e2e</em> til speedtest-server, ofte ≈ R_client</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Tilbake til oversikten</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-delay-modell" }} className="text-brand hover:underline">
                De fire forsinkelsene
              </Link>{" "}
              — d_proc, d_queue, d_trans, d_prop. Forrige kurs.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-congestion-control" }} className="text-brand hover:underline">
                TCP Congestion Control
              </Link>{" "}
              — hvordan TCP balanserer flere strømmer på én flaskehals.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte-2507" }} className="text-brand hover:underline">
                DTE-2507-hub
              </Link>{" "}
              — alle nettverks-mini-kursene.
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}
