import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex, TexBlock } from "@/components/Tex";
import { DelaySim } from "./DelaySim";
import { DelayVisualizer } from "./DelayVisualizer";
import { CaravanAnalogy } from "./CaravanAnalogy";
import { TrafficIntensitySim } from "./TrafficIntensitySim";

const STEPS = [
  { title: "Delay-visualisering (to rutere)", anchor: "vis" },
  { title: "Hvorfor 4 forsinkelser?", anchor: "hvorfor" },
  { title: "d_proc — prosessering", anchor: "proc" },
  { title: "d_queue — venting i kø", anchor: "queue" },
  { title: "d_trans — å presse bitene ut", anchor: "trans" },
  { title: "d_prop — signalet over kabelen", anchor: "prop" },
  { title: "d_trans vs d_prop — forskjellen", anchor: "trans-vs-prop" },
  { title: "Kurose-Ross sin karavananalogi", anchor: "karavan" },
  { title: "Nodal-delay-bygger (interaktiv)", anchor: "sim" },
  { title: "Trafikkintensitet ρ = La/R", anchor: "rho" },
  { title: "End-to-end forsinkelse", anchor: "e2e" },
  { title: "Eksamen-quick-ref", anchor: "ref" },
];

export function DelayModellPage() {
  return (
    <StackPageShell title="De fire forsinkelsene" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Kurose &amp; Ross 1.4 (s. 35-42)
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            De fire forsinkelsene — proc, queue, trans, prop
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            En pakke som passerer en ruter, blir holdt opp av fire ting, ikke ett. Først leser
            ruteren headeren og bestemmer hvor pakken skal (<Tex>{`d_{\\text{proc}}`}</Tex>). Så
            må den vente på sin tur i en kø (<Tex>{`d_{\\text{queue}}`}</Tex>). Når det er dens
            tur, presses bitene ut på kabelen, én av gangen ved hastighet R
            (<Tex>{`d_{\\text{trans}}`}</Tex>). Til slutt må signalet faktisk reise over kabelen
            til neste ruter (<Tex>{`d_{\\text{prop}}`}</Tex>). Summen er nodal-forsinkelsen:
          </p>
          <TexBlock>
            {`d_{\\text{nodal}} = d_{\\text{proc}} + d_{\\text{queue}} + d_{\\text{trans}} + d_{\\text{prop}}`}
          </TexBlock>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Hele dette kurset er bygget rundt å lære deg å se hvilken av de fire som dominerer i
            en gitt situasjon — det forklarer hvorfor et LAN føles momentant, hvorfor en
            satellitt-telefon har lag, og hvorfor Zoom hakker når kontorbroren laster ned
            torrenter.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#sim" className="text-brand hover:underline">delay-byggeren</a>{" "}
              lar deg variere L, R, d, s, og d_proc og se hvilken komponent som dominerer
              for LAN, fiber over Atlanteren og geostasjonær satellitt.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-delay-modell" steps={STEPS} />

        <section id="vis" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Interaktiv delay-visualisering</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Før vi går gjennom de fire forsinkelsene én for én — her er hele bildet i ett:
            en pakke som reiser fra sender gjennom to rutere (R1 og R2) til mottaker. Hver
            av de tre lenkene har sin egen båndbredde, avstand og kø. Skru på sliderne og se
            hvilken komponent som dominerer per hop. Trykk «Spill av» for å la pakken faktisk
            bevege seg gjennom topologien.
          </p>
          <DelayVisualizer />
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            Bytt mellom presetene <em>Slim link</em>, <em>Lang strekk</em>, <em>Trafikkpropp</em>{" "}
            og <em>Datasenter</em> for å kjenne igjen de fire klassiske regimene. Resten av
            siden forklarer hvert ledd matematisk.
          </p>
        </section>

        <section id="hvorfor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor fire forsinkelser?</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            «Lag» («latency») er ett ord, men minst fire fysiske prosesser. Når du gjør
            <code className="mx-1 text-[12px] bg-muted px-1 rounded">ping kontoret.no</code>
            og ser <em>72 ms</em>, er det summen av fire ting per ruter, ganget med antall hops
            (tur-retur). Du kan ikke gjøre noe særlig med tre av dem — men du kan{" "}
            <em>velge hvilken som dominerer</em> ved å velge teknologi og topologi.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 text-sm">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              De fire ledd i én ruters delay
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left font-semibold px-2 py-1.5">Ledd</th>
                  <th className="text-left font-semibold px-2 py-1.5">Hva skjer</th>
                  <th className="text-left font-semibold px-2 py-1.5">Typisk størrelse</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-2 py-2 font-mono text-brand">d_proc</td>
                  <td className="px-2 py-2">Lese header, slå opp i routing-tabell, integritetssjekk</td>
                  <td className="px-2 py-2">µs (mikrosekunder)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-2 py-2 font-mono text-brand">d_queue</td>
                  <td className="px-2 py-2">Vente på sin tur i utgangskøen til linken</td>
                  <td className="px-2 py-2">0 – ∞ (varierer mest!)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-2 py-2 font-mono text-brand">d_trans</td>
                  <td className="px-2 py-2">Trykke bitene ut på kabelen ved rate R</td>
                  <td className="px-2 py-2">L / R</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-2 py-2 font-mono text-brand">d_prop</td>
                  <td className="px-2 py-2">Signalet brer seg fra én ende til en annen</td>
                  <td className="px-2 py-2">d / s</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="proc" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. <Tex>{`d_{\\text{proc}}`}</Tex> — prosesseringsforsinkelse</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Pakken kommer inn på input-porten. Ruteren må:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground">
            <li>Lese IP-headeren.</li>
            <li>Slå opp destinasjons-adressen i routing-tabellen for å finne utgangslink.</li>
            <li>Sjekke bit-integritet (sjekksum, evt. TTL-dekrementering).</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            På moderne høyt-spesialiserte rutere (ASIC-basert) er dette typisk noen titalls
            mikrosekunder. På softwarerutere kan det bli millisekunder. Det er sjelden den
            dominerende komponenten, men den er <em>aldri</em> null.
          </p>
        </section>

        <section id="queue" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. <Tex>{`d_{\\text{queue}}`}</Tex> — venting i kø</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Etter prosessering legges pakken i utgangskøen til den riktige linken. Hvor lenge
            den må vente avhenger av hvor mange pakker som ligger der allerede. Dette er den
            mest <strong>varierende</strong> komponenten av alle fire — den kan være null,
            millisekunder, eller (ved overbelastning) flere sekunder.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Køstørrelsen styres av forholdet mellom ankomstrate og utgående linkrate —{" "}
            <em>trafikkintensitet</em> <Tex>{`\\rho = La / R`}</Tex> (se seksjon 9 under). Når{" "}
            <Tex>{`\\rho \\to 1`}</Tex>, eksploderer køen.
          </p>
        </section>

        <section id="trans" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. <Tex>{`d_{\\text{trans}}`}</Tex> — transmisjon (å presse bitene ut)</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Når det er pakkens tur, må alle dens <Tex>{`L`}</Tex> bits presses ut på linken med rate{" "}
            <Tex>{`R`}</Tex>. Det tar:
          </p>
          <TexBlock>{`d_{\\text{trans}} = \\frac{L}{R}`}</TexBlock>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Eksempel: en 1500-byte (= 12000 bits) pakke over en 100 Mbps link tar{" "}
            <Tex>{`12000 / 10^8 = 120\\,\\mu s`}</Tex>. Over en 10 Gbps link: 1.2 µs. Den
            avhenger <em>bare</em> av pakkestørrelsen og link-raten — ikke av avstand.
          </p>
        </section>

        <section id="prop" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. <Tex>{`d_{\\text{prop}}`}</Tex> — propagasjon (signalet over kabelen)</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Når den første biten er trykket ut, må den fysisk reise over kabelen til neste
            ruter. Hastigheten i en fiber/kobber er ca. <Tex>{`2 \\times 10^8`}</Tex> m/s (rundt 2/3 av lyshastighet);
            i vakuum og radio nær <Tex>{`3 \\times 10^8`}</Tex> m/s.
          </p>
          <TexBlock>{`d_{\\text{prop}} = \\frac{d}{s}`}</TexBlock>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Avhenger <em>bare</em> av fysisk avstand og medium — ikke av link-rate eller
            pakkestørrelse. <strong>Geostasjonære satellitter</strong> er på 36 000 km høyde —
            propagasjon én vei er <Tex>{`36 \\times 10^6 / (3 \\times 10^8) = 120\\,\\text{ms}`}</Tex>.
            Tur-retur over satellitt blir &gt; 480 ms. Du kan ikke ringe over geo-sat uten å
            føle det.
          </p>
        </section>

        <section id="trans-vs-prop" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. <Tex>{`d_{\\text{trans}}`}</Tex> vs <Tex>{`d_{\\text{prop}}`}</Tex> — den vanligste forvekslingen</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Studenter blander disse to <em>hele tiden</em>. Begge har dimensjon &laquo;tid&raquo;,
            begge handler om &laquo;å sende en pakke&raquo;. Men de måler to forskjellige ting:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                d_trans = L / R
              </div>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li>«Hvor lenge er senderen <em>opptatt</em> med å trykke bitene ut?»</li>
                <li>Skaler med <strong>pakkestørrelse</strong>, ikke avstand.</li>
                <li>Skaler omvendt med <strong>link-rate</strong>.</li>
                <li>Inga betydning hvor langt unna mottakeren er.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                d_prop = d / s
              </div>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li>«Hvor lenge tar det fra et bit forlater senderen til det <em>kommer fram</em>?»</li>
                <li>Skaler med <strong>avstand</strong>, ikke pakkestørrelse.</li>
                <li>Avhenger av <strong>medium</strong> (s).</li>
                <li>Ingen betydning hvor stor pakken er — selv én bit må reise.</li>
              </ul>
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">Tankesnaring:</strong> Det går
            an for d_prop &gt; d_trans (lang strekning, lite pakke) eller motsatt (kort
            strekning, stor pakke). De er <em>uavhengige</em>. Boka understreker dette i
            figur 1.18, s. 38.
          </div>
        </section>

        <section id="karavan" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Kurose-Ross sin karavananalogi (s. 37-38)</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Boka bruker en helt presis analogi for å gjøre forskjellen tydelig:
          </p>
          <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm leading-relaxed mb-3">
            <em>
              «Consider a caravan of 10 cars that is travelling on a highway. The highway has
              two tollbooths 100 km apart. Each tollbooth serves a car at the rate of one car
              every 12 seconds. The caravan travels at a uniform speed of 100 km/hour between
              tollbooths.»
            </em>
            <div className="text-[11px] text-muted-foreground mt-1">Kurose &amp; Ross, s. 37</div>
          </div>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Oversetting til nettverk:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground mb-3">
            <li><strong>10 biler</strong> = en pakke på 10 bit (eller karavanen = pakken; bilene = bits)</li>
            <li><strong>Bomstasjon</strong> = ruter</li>
            <li><strong>Service-tid 12 s/bil</strong> = transmisjonsforsinkelse <Tex>{`L/R`}</Tex></li>
            <li><strong>Kjøring 100 km</strong> = propagasjon <Tex>{`d/s`}</Tex></li>
            <li><strong>100 km/t</strong> = signal-hastighet <Tex>{`s`}</Tex> i mediet</li>
          </ul>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Resultatene gjentas i boka:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground mb-3">
            <li><strong>Trans-delay per bom:</strong> 10 biler &times; 12 s = 120 s. Hele karavanen er &laquo;servet&raquo; etter 2 minutter.</li>
            <li><strong>Prop-delay:</strong> 100 km / 100 km/t = 1 time = 3600 s. Det er <em>uavhengig</em> av karavanens størrelse.</li>
            <li>
              <strong>Spørsmål boka stiller:</strong> kan karavanens første bil ankomme bom 2 før
              den siste bilen er ute av bom 1? <strong>Ja</strong> — 1 time vs 2 minutter.
            </li>
          </ul>
          <CaravanAnalogy />
          <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm">
            <strong className="text-brand">Bokens poeng:</strong> trans-delay og prop-delay
            beskriver to fysisk uavhengige fenomener. Du kan ikke &laquo;legge til hverandre&raquo; eller
            bytte mellom dem ved å justere én knapp.
          </div>
        </section>

        <section id="sim" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Nodal-delay-bygger</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Velg en preset eller juster slidere — sammensetningen viser hvilken komponent som
            dominerer for hvert scenario.
          </p>
          <DelaySim />
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <strong>3 øvelses-scenarier:</strong>
            <ol className="mt-2 space-y-1 list-decimal pl-5 text-muted-foreground">
              <li>
                <strong>LAN, kort kabel.</strong> Velg «LAN (Gigabit, kort kabel)». Hvilken
                komponent dominerer? (Svar: d_trans og d_proc dominerer; d_prop er &lt; 1 µs.)
              </li>
              <li>
                <strong>Geostasjonær satellitt.</strong> Velg «Geostasjonær satellitt». Hvilken
                komponent dominerer? (Svar: d_prop = 240 ms helt knuser de andre — det er
                fysikk, ikke teknologi.)
              </li>
              <li>
                <strong>Kjempepakke på treig link.</strong> Behold avstand på 100 m, men sett R = 1 Mbps og
                L = 12000 bits. Hvilken? (Svar: d_trans = 12 ms dominerer over d_prop = 0.5 µs.)
              </li>
            </ol>
          </div>
        </section>

        <section id="rho" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">9. Trafikkintensitet ρ = La/R</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Hvor stor blir kø-forsinkelsen (<Tex>{`d_{\\text{queue}}`}</Tex>) i praksis?
            Det avhenger av en enkel størrelse:
          </p>
          <TexBlock>{`\\rho = \\frac{L \\cdot a}{R}`}</TexBlock>
          <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground mt-2">
            <li><Tex>{`L`}</Tex> = gjennomsnittlig pakkestørrelse (bits)</li>
            <li><Tex>{`a`}</Tex> = ankomstrate (pakker/sekund)</li>
            <li><Tex>{`R`}</Tex> = utgående link-rate (bits/sekund)</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            <Tex>{`\\rho`}</Tex> er andelen av linkens kapasitet som etterspørres.
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground mt-2">
            <li><Tex>{`\\rho \\ll 1`}</Tex>: lite trafikk, sjelden kø, <Tex>{`d_{\\text{queue}} \\approx 0`}</Tex></li>
            <li><Tex>{`\\rho \\to 1`}</Tex>: køen vokser uten øvre grense (matematisk uendelig)</li>
            <li><Tex>{`\\rho > 1`}</Tex>: kapasiteten er overbelastet permanent — pakker droppes</li>
          </ul>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm leading-relaxed">
            <strong className="text-amber-700 dark:text-amber-400">Bokens Golden rule (s. 39):</strong>{" "}
            <em>«Design your system so that the traffic intensity is no greater than 1.»</em>
            {" "}Eller mer presist: hold <Tex>{`\\rho`}</Tex> komfortabelt under 1 — for eksempel 0.7-0.8.
          </div>
          <div className="mt-4">
            <TrafficIntensitySim />
          </div>
        </section>

        <section id="e2e" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">10. End-to-end forsinkelse</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            En pakke fra sender til mottaker går gjennom flere hopps (<Tex>{`N`}</Tex> linker,{" "}
            <Tex>{`N - 1`}</Tex> rutere). End-to-end-forsinkelsen er summen av nodal-forsinkelser:
          </p>
          <TexBlock>
            {`d_{\\text{end-to-end}} = N \\cdot (d_{\\text{proc}} + d_{\\text{trans}} + d_{\\text{prop}}) + \\sum d_{\\text{queue}}`}
          </TexBlock>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Boka bruker <code className="bg-muted px-1 rounded text-[12px]">traceroute</code> som
            verktøy: den måler tur-retur til hver ruter underveis. Du ser at noen hopps lag er
            stabile (proc + trans + prop), andre &laquo;flickerer&raquo; (queue). En enkel hjemme-traceroute
            til <code className="bg-muted px-1 rounded text-[12px]">8.8.8.8</code> avslører hvor
            flaskehalsen sitter — vanligvis på første eller andre hopp (din egen WiFi/DSL).
          </p>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Når du har forstått <strong>d_nodal</strong> er det neste naturlige spørsmål: hvor
            stor er den maksimale bit-raten du kan få gjennom hele kjeden? Det er{" "}
            <em>throughput</em>, og det handler om{" "}
            <Link to="/stack/$slug" params={{ slug: "dte2507-bottleneck-throughput" }} className="text-brand hover:underline">
              flaskehalsen
            </Link>{" "}
            — neste kurs.
          </p>
        </section>

        <section id="ref" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">11. Eksamen-quick-ref</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Symbol</th>
                  <th className="text-left font-semibold px-4 py-2">Formel</th>
                  <th className="text-left font-semibold px-4 py-2">Avhenger av</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">d_proc</td>
                  <td className="px-4 py-3">~konstant per ruter (µs)</td>
                  <td className="px-4 py-3">Ruterens prosesseringskraft</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">d_queue</td>
                  <td className="px-4 py-3">f(ρ), eksplosivt når ρ→1</td>
                  <td className="px-4 py-3">Trafikkmengde &amp; varians</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">d_trans</td>
                  <td className="px-4 py-3">L / R</td>
                  <td className="px-4 py-3">Pakkestørrelse + link-rate</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">d_prop</td>
                  <td className="px-4 py-3">d / s</td>
                  <td className="px-4 py-3">Avstand + medium</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">ρ</td>
                  <td className="px-4 py-3">La / R</td>
                  <td className="px-4 py-3">Hold &lt; 1 (helst &lt; 0.8)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2507-bottleneck-throughput" }}
                className="text-brand hover:underline"
              >
                Flaskehals &amp; throughput
              </Link>{" "}
              — hvor flyter den maksimale bit-raten gjennom kjeden? Speedtest forklart.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte-2507" }} className="text-brand hover:underline">
                DTE-2507-hub
              </Link>{" "}
              — alle nettverks-mini-kursene.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-congestion-control" }} className="text-brand hover:underline">
                TCP Congestion Control
              </Link>{" "}
              — hvordan TCP holder ρ under 1 i praksis.
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}
