import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { BgpLadderSim } from "./BgpLadderSim";

const STEPS = [
  { title: "Hvorfor BGP er annerledes", anchor: "hvorfor" },
  { title: "Attributtene i BGP-annonsen", anchor: "attr" },
  { title: "Rutevelger-stigen — fire trinn", anchor: "stige" },
  { title: "LOCAL_PREF — operatørens policy", anchor: "lp" },
  { title: "AS_PATH-lengde — korteste vei", anchor: "ap" },
  { title: "Hot potato — kvitt deg med pakken", anchor: "hp" },
  { title: "BGP-ID-tiebreak", anchor: "id" },
  { title: "Simulator", anchor: "sim" },
  { title: "Eksamen-quick-ref", anchor: "ref" },
];

export function BgpLadderPage() {
  return (
    <StackPageShell title="BGP-rutevelger-stige" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Kurose &amp; Ross 5.4.3 (s. 402-407)
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            BGP-rutevelger-stige — hvordan en BGP-router velger blant flere ruter
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Når en BGP-router lærer flere konkurrerende ruter til samme prefix fra ulike
            naboer, må den velge én. Algoritmen er en streng prioritert filterstige: hvert
            trinn eliminerer ruter til kun én er igjen. LOCAL_PREF kommer først (operatørens
            policy), så AS_PATH-lengde (korteste vei i AS-topologien), så hot potato
            (kortest intern vei til exit), og til slutt BGP-ID som tiebreak. Logikken er
            deterministisk — ingen ML, ingen vekter.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#sim" className="text-brand hover:underline">stige-simulatoren</a>{" "}
              under lar deg klikke gjennom hvert trinn med fire konkurrerende ruter. Skru på
              LOCAL_PREF-slideren og se hvordan operatørens policy snur valget.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-bgp-stige" steps={STEPS} />

        <section id="hvorfor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor BGP er annerledes</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Intra-AS-protokoller (OSPF, IS-IS) optimaliserer for korteste sti basert på
            målbare lenkemetrikker. Det er teknisk — det handler om delay og throughput.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            BGP er <strong>policy-drevet</strong>. En AS velger hvilke ruter den vil bruke
            (og hvilke den vil annonsere videre) basert på forretningsavtaler: hvilke transit-
            leverandører den betaler, hvilke peering-avtaler den har, hvilke kunder den må
            prioritere. To AS-er som er teknisk like nære kan ha helt forskjellig pris-
            struktur — og BGP må kunne uttrykke det.
          </p>
        </section>

        <section id="attr" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Attributtene i en BGP-annonse</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            En BGP UPDATE-melding annonserer et prefix sammen med en bunke attributter.
            De viktigste:
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Attributt</th>
                  <th className="text-left font-semibold px-4 py-2">Hva</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">NEXT_HOP</td>
                  <td className="px-4 py-3">
                    IP-adressen til ruteren som skal motta pakken. Brukes til intra-AS-oppslag.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">AS_PATH</td>
                  <td className="px-4 py-3">
                    Sekvens av AS-numre pakken vil gå gjennom. Hver AS pre-pender sitt eget
                    nummer når den annonserer videre — gir loop-deteksjon og er en proxy for
                    «avstand».
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">LOCAL_PREF</td>
                  <td className="px-4 py-3">
                    Operatørens preferanse. Settes lokalt ved import, høyere er bedre.
                    Brukes til å uttrykke «vi foretrekker denne uplinken fordi den er billigere».
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">MED</td>
                  <td className="px-4 py-3">
                    Multi-Exit Discriminator. Hint til naboen om hvilken av flere
                    sammenkoblinger som foretrekkes. Lavere er bedre.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">ORIGIN</td>
                  <td className="px-4 py-3">
                    Hvor ruta kommer fra: IGP (lokal), EGP (eldre), eller INCOMPLETE.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="stige" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Rutevelger-stigen — fire trinn</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Når flere ruter til samme prefix finnes, anvendes følgende filtre i streng
            rekkefølge. Hvert trinn beholder bare ruten(e) med best verdi for det
            attributtet. Hvis ett trinn etterlater én rute, er vinneren funnet. Hvis flere
            er igjen, går vi videre.
          </p>
          <ol className="text-sm space-y-2 list-decimal pl-5 mb-3">
            <li><strong>LOCAL_PREF</strong> — høyest vinner. Policy-styrt.</li>
            <li><strong>AS_PATH-lengde</strong> — kortest vinner. Få AS-er er bra.</li>
            <li><strong>Hot potato (IGP-kost)</strong> — laveste intra-AS-kost til exit vinner.</li>
            <li><strong>BGP router-ID</strong> — laveste ID vinner. Deterministisk tiebreak.</li>
          </ol>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
            <strong className="text-amber-700 dark:text-amber-400">Cisco-virkeligheten:</strong>{" "}
            Reelle implementasjoner har flere mellomliggende trinn (vekting, ORIGIN, MED,
            eBGP vs iBGP, alder, neighbor-IP). Boken og denne siden viser bokens
            kjernepedagogiske firstige. I praksis lever det 8-13 trinn i Cisco-dokumentasjonen.
          </div>
        </section>

        <section id="lp" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. LOCAL_PREF — operatørens policy</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            LOCAL_PREF er ikke noe BGP-naboer kan forhandle om — det settes lokalt av AS-et
            ved import. En operatør kan si: «alle ruter fra min betalte transit-leverandør
            får LOCAL_PREF = 80, alle ruter fra mine peering-partnere får 100, alle ruter
            fra mine kunder får 150.»
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Konsekvensen: trafikk foretrekker alltid kunder over peers over transit. Dette
            er BGP-trafikkstyringens dypeste lov — «valley-free routing». LOCAL_PREF
            implementerer den.
          </p>
        </section>

        <section id="ap" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. AS_PATH-lengde — korteste vei</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Hvis LOCAL_PREF gir uavgjort, bryter AS_PATH-lengden uavgjorten. Tankegangen:
            færre AS-er på veien betyr færre policy-grenser, færre potensielle ustabiliteter,
            og <em>vanligvis</em> kortere RTT.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Trickserien: en AS som vil ha mindre innkommende trafikk kan «prepende» sitt eget
            AS-nummer flere ganger i annonsen (AS_PATH = [10, 10, 10, 300, 5]) for å se
            kunstig lengre ut for andre AS-ers BGP-velgere. Standard triks i ISP-verden.
          </p>
        </section>

        <section id="hp" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Hot potato — kvitt deg med pakken</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Hvis flere ruter har lik LOCAL_PREF og lik AS_PATH-lengde, men forskjellige
            exit-rutere i ditt eget AS, velg den exit-ruteren som er nærmest deg
            <em> internt</em> (lavest IGP-kost). Resten av reisen er noen andre sitt problem.
          </p>
          <blockquote className="border-l-4 border-brand pl-4 italic text-sm text-muted-foreground my-3">
            «In 'hot potato routing,' a packet is analogous to a hot potato that is burning
            in your hands.»
            <div className="not-italic text-[11px] mt-1">— Kurose &amp; Ross, s. 404</div>
          </blockquote>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Det er ikke alltid den billigste end-to-end-ruten, og det er ikke alltid den
            ruten som er best for brukerne. Det er den billigste for <em>deg</em> som AS.
            Cold potato — det motsatte — krever koordinasjon med naboen og brukes typisk
            mellom store CDN-er og deres ISP-er for å gi bedre brukeropplevelse.
          </p>
        </section>

        <section id="id" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. BGP-ID-tiebreak</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Hvis to ruter overlever alle tre filtre over, brytes uavgjort på en ren teknisk
            måte: velg ruten fra naboen med lavest BGP router-ID (en 32-bit ID, typisk en
            IP-adresse). Det er ikke nødvendigvis et godt valg, men det er deterministisk —
            samme inndata gir samme utdata uansett hvor du står i AS-et.
          </p>
        </section>

        <section id="sim" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Simulator</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Fire konkurrerende ruter til samme prefix. Klikk «Neste filter» for å anvende
            ett trinn av gangen. Eliminerte ruter gråes ut. Skru på LOCAL_PREF-slideren for
            å se hvordan operatørens policy snur valget — spesielt når flere ruter har samme
            LOCAL_PREF i utgangspunktet.
          </p>
          <BgpLadderSim />
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <strong>3 øvelses-scenarier:</strong>
            <ol className="mt-2 space-y-1 list-decimal pl-5 text-muted-foreground">
              <li>
                <strong>Standardvalg.</strong> Slider på 100, klikk gjennom filtrene. Hvilken
                rute vinner, og på hvilket trinn ble hver av de andre eliminert? (Svar: R3
                elimineres på LOCAL_PREF; R1 og R4 elimineres på AS_PATH-lengde; R2 står da
                alene igjen og vinner — hot potato og BGP-ID blir aldri evaluert.)
              </li>
              <li>
                <strong>Operatøren snur policy.</strong> Sett LOCAL_PREF for AS200 til 150.
                Hvilken rute vinner nå? (R1 — fordi LOCAL_PREF avgjør før noen av de andre
                filtrene rekker å si noe.)
              </li>
              <li>
                <strong>NORDUnet-favoritt.</strong> Sett slideren til 50. Hvorfor vinner ikke
                R3 selv om den har lavest IGP-kost? (R3 har LOCAL_PREF = 80 — fortsatt under
                de andre på 100, så hot potato blir aldri evaluert for R3.)
              </li>
            </ol>
          </div>
        </section>

        <section id="ref" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">9. Eksamen-quick-ref</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-20">Trinn</th>
                  <th className="text-left font-semibold px-4 py-2 w-40">Attributt</th>
                  <th className="text-left font-semibold px-4 py-2">Regel</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">1</td>
                  <td className="px-4 py-3 font-mono text-brand">LOCAL_PREF</td>
                  <td className="px-4 py-3">Høyest vinner. Policy.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">2</td>
                  <td className="px-4 py-3 font-mono text-brand">AS_PATH-lengde</td>
                  <td className="px-4 py-3">Kortest vinner.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">3</td>
                  <td className="px-4 py-3 font-mono text-brand">IGP-kost (hot potato)</td>
                  <td className="px-4 py-3">Lavest vinner. «Kvitt deg med pakken.»</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">4</td>
                  <td className="px-4 py-3 font-mono text-brand">BGP-ID</td>
                  <td className="px-4 py-3">Lavest vinner. Tiebreak.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-3 text-xs">
            <strong className="text-brand">Huskeregel:</strong> «Policy først, korteste vei
            videre, varm potet ut av huset, ID til slutt.»
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Relatert</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-count-to-infinity" }} className="text-brand hover:underline">Count-to-infinity</Link>{" "}
              — distance-vector-loopen som ikke konvergerer raskt.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-ruting" }} className="text-brand hover:underline">DTE-2507 — ruting</Link>{" "}
              — Dijkstra og Bellman-Ford for intra-AS.
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
