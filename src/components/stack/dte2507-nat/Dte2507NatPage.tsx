import { Link } from "@tanstack/react-router";
import { Lightbulb, AlertTriangle } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { NatTableDemo } from "./NatTableDemo";
import { NatDrill } from "./NatDrill";
import { NatVisualizer } from "./NatVisualizer";

const STEPS = [
  { title: "Pakke-translasjon — visualisering", anchor: "visualizer" },
  { title: "Problemet: to interne hosts, én server", anchor: "problem" },
  { title: "Privatadresser (RFC 1918) — hvorfor finnes de?", anchor: "rfc1918" },
  { title: "NAT-tabellen — interaktiv demo", anchor: "demo" },
  { title: "Regelen, formulert", anchor: "regel" },
  { title: "Hva NAT koster — end-to-end og IPsec", anchor: "kostnad" },
  { title: "Drill — tilstandsskifte", anchor: "drill" },
  { title: "Eksamen-quick-ref", anchor: "ref" },
];

export function Dte2507NatPage() {
  return (
    <StackPageShell title="NAT — én offentlig IP, mange private" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Kurose &amp; Ross 4.3.4 — Network Address Translation
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            NAT — én offentlig IP, mange private
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            En NAT-ruter er en boks som omskriver kilde-IP og kilde-port på vei
            ut, og inverterer omskrivingen på vei inn. Det gir et helt
            privatnett plass bak én offentlig IPv4-adresse — løsningen som
            holdt IPv4 i live lenge nok til at hele Internett kunne vokse uten
            å gå tom for adresser.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#demo" className="text-brand hover:underline">
                NAT-tabell-demoen
              </a>{" "}
              lar deg sende pakker fra to interne hosts som begge åpner samme
              server — se hvordan ruteren tildeler unike eksterne porter og
              bygger tabellen mens du klikker.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-nat" steps={STEPS} />

        {/* 0. Visualisering */}
        <section id="visualizer" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            Pakke-translasjon — visualisering
          </h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            To interne hosts (H1, H2) bak NAT-ruteren, to eksterne servere (S1,
            S2) på Internett. Bytt mellom fire scenarier og se hvordan pakke-
            headerne omskrives, hvordan NAT-tabellen vokser, og hva som skjer
            når noen utenfra prøver å nå inn.
          </p>
          <NatVisualizer />
        </section>

        {/* 1. Problemet */}
        <section id="problem" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            1. Problemet — to interne hosts, én server
          </h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Tenk deg et hjemmenett med to maskiner:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5 mb-3">
            <li>
              <span className="font-mono">10.0.0.5</span> — laptopen din
            </li>
            <li>
              <span className="font-mono">10.0.0.6</span> — mobilen din
            </li>
          </ul>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Begge åpner en TCP-forbindelse til{" "}
            <span className="font-mono">1.2.3.4:80</span> (samme webserver) på
            omtrent samme tid. Begge plukker tilfeldigvis kilde-port{" "}
            <span className="font-mono">3345</span>. Hva skjer?
          </p>
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm flex gap-3">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
            <div>
              <strong className="text-red-700 dark:text-red-400">
                Uten NAT:
              </strong>{" "}
              Privatadressene <span className="font-mono">10.0.0.x</span> er
              ikke rutbare på det offentlige Internett. ISP-ens første ruter
              kaster pakken. Selv om vi later som de var rutbare, ville
              svar-pakkene fra serveren være helt identiske
              (samme dst-IP og dst-port) — ruteren har ingen måte å vite
              hvilken intern host som var den opprinnelige avsenderen.
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            NAT løser <em>begge</em> problemene samtidig: den gir interne
            hoster en rutbar identitet utad, OG den holder orden på hvem som
            er hvem.
          </p>
        </section>

        {/* 2. Privatadresser */}
        <section id="rfc1918" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            2. Privatadresser (RFC 1918) — hvorfor finnes de?
          </h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            IETF reserverte tre adresseblokker som <em>aldri</em> rutes på det
            offentlige Internett. Du kan bruke dem fritt i ditt eget privatnett
            uten å spørre noen — fordi de ikke kolliderer med noen annens
            offentlige bruk.
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2">Blokk</th>
                  <th className="text-left font-semibold px-4 py-2">CIDR</th>
                  <th className="text-left font-semibold px-4 py-2">Bruk</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono">10.0.0.0/8</td>
                  <td className="px-4 py-2 font-mono text-[12px]">
                    10.0.0.0 – 10.255.255.255
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    Store bedrifter / datasentre — ~16 M adresser
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono">172.16.0.0/12</td>
                  <td className="px-4 py-2 font-mono text-[12px]">
                    172.16.0.0 – 172.31.255.255
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    Mellomstore nett — ~1 M adresser
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono">192.168.0.0/16</td>
                  <td className="px-4 py-2 font-mono text-[12px]">
                    192.168.0.0 – 192.168.255.255
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    Hjemme-rutere / SMB — ~65k adresser
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Forutsetningen for at dette virker er at{" "}
            <strong>noen i kjeden gjør NAT</strong>. Hjemmeruteren din har én
            offentlig IP fra ISP-en (f.eks.{" "}
            <span className="font-mono">138.40.50.60</span>) og snakker
            privatadresser på LAN-siden. Ruterens jobb er å oversette.
          </p>
        </section>

        {/* 3. Interaktiv demo */}
        <section id="demo" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            3. NAT-tabellen — interaktiv demo
          </h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Klikk <em>Send ut</em> for Host A og deretter Host B. Se NAT-
            tabellen vokse, og hvordan begge får hver sin{" "}
            <strong>unike eksterne port</strong> (50001 og 50002). Klikk så{" "}
            <em>Svar inn</em> for hver — svar-pakken har dst-IP =
            ruterens WAN-IP, men ulike dst-porter. Tabell-oppslaget gir entydig
            tilbakeleveing.
          </p>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Bytt til <em>Uten NAT</em>-modus for å se hva som skjer hvis
            privatadressene slippes rett ut på Internett.
          </p>
          <NatTableDemo />
        </section>

        {/* 4. Regelen */}
        <section id="regel" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Regelen, formulert</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Den varianten du har sett — der både IP og port omskrives — kalles{" "}
            <strong>NAPT</strong> (Network Address Port Translation), eller
            <strong> PAT</strong> (Port Address Translation), eller bare{" "}
            <strong>"source-NAT"</strong> i daglig tale. Mønsteret er:
          </p>
          <div className="rounded-lg border border-border bg-card p-4 text-sm">
            <div className="space-y-2">
              <div>
                <strong className="text-brand">Utgående pakke</strong>{" "}
                (LAN → WAN):
                <pre className="font-mono text-[12px] bg-muted/30 rounded px-2 py-1 mt-1 overflow-x-auto">
                  src=(privIP:privPort) → src=(pubIP:newPort){"\n"}
                  + lagre mapping (privIP, privPort) ↔ newPort
                </pre>
              </div>
              <div>
                <strong className="text-brand">Innkommende pakke</strong>{" "}
                (WAN → LAN):
                <pre className="font-mono text-[12px] bg-muted/30 rounded px-2 py-1 mt-1 overflow-x-auto">
                  dst=(pubIP:newPort) → dst=(privIP:privPort){"\n"}
                  via tabell-oppslag på newPort
                </pre>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Mappingen er <strong>tilstand</strong> som ruteren må holde i
            minnet for hver aktive forbindelse. Hvert mapping har en timer som
            fjerner den når forbindelsen har vært stille for lenge — typisk
            få minutter for UDP, lengre for TCP (eller frem til FIN ses).
          </p>
        </section>

        {/* 5. Kostnader */}
        <section id="kostnad" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            5. Hva NAT koster — end-to-end og IPsec
          </h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            NAT er pragmatisk genialt, men har kostnader som ofte ikke
            diskuteres:
          </p>
          <div className="space-y-3 text-sm">
            <div className="rounded-md border border-border bg-card p-3">
              <strong>End-to-end-prinsippet brytes.</strong> Internett ble
              designet slik at hvilken som helst vert kan kontakte hvilken som
              helst annen. Bak NAT kan en ekstern vert{" "}
              <em>ikke</em> initiere kontakt til en intern host — det finnes
              ingen mapping ennå. Resultat: P2P-protokoller (gamle SIP,
              BitTorrent, WebRTC) trenger eksplisitt hull-stikking (STUN/TURN)
              eller manuell port-forwarding.
            </div>
            <div className="rounded-md border border-border bg-card p-3">
              <strong>IPsec AH bryter sammen.</strong> Authentication Header
              signerer hele pakken inklusive IP-headerfeltene. Når NAT
              omskriver src-IP, blir signaturen ugyldig. Praktisk løsning i dag:
              IPsec kjøres inni UDP (NAT-Traversal, NAT-T) slik at den ytre
              UDP-headeren kan tukles med uten å berøre den signerte
              indre pakken.
            </div>
            <div className="rounded-md border border-border bg-card p-3">
              <strong>Lagdeling brytes.</strong> En lag-3-boks (ruter) leser og
              skriver lag-4-felt (TCP/UDP-porter). Dette gjør NAT-en{" "}
              <em>protokollavhengig</em> — ICMP og nye transportprotokoller
              krever spesielle ALG-er (Application-Level Gateways) for å virke.
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            IPv6 ble designet bl.a. for å fjerne behovet for NAT: nok adresser
            til at hver enhet kan ha en globalt rutbar IP, og end-to-end-
            forbindelse blir mulig igjen. I praksis kjører mange IPv6-nett
            likevel med stateful firewall som har NAT-aktige eiendommer av
            sikkerhetsgrunner.
          </p>
        </section>

        {/* 6. Drill */}
        <section id="drill" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            6. Drill — tilstandsskifte
          </h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Fire spørsmål. Klikk et svar for å se forklaringen. Tenk gjennom
            det FØR du klikker.
          </p>
          <NatDrill />
        </section>

        {/* 7. Quick ref */}
        <section id="ref" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">7. Eksamen-quick-ref</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-56">
                    Spørsmål
                  </th>
                  <th className="text-left font-semibold px-4 py-2">Svar</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">
                    Hva omskriver NAT (NAPT)?
                  </td>
                  <td className="px-4 py-2">
                    Source-IP og source-port på vei ut; destination-IP og
                    destination-port på vei inn.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">
                    Hvor lagres mappingen?
                  </td>
                  <td className="px-4 py-2">
                    I NAT-tabellen på ruteren. Tilstand med aging-timer.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">
                    Hvorfor må også porten omskrives?
                  </td>
                  <td className="px-4 py-2">
                    Fordi flere interne hoster kan tilfeldigvis bruke samme
                    src-port mot samme server. Unik ekstern port = entydig
                    tilbakelevering.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">RFC 1918</td>
                  <td className="px-4 py-2 font-mono text-[12px]">
                    10.0.0.0/8 · 172.16.0.0/12 · 192.168.0.0/16
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">
                    Bryter IPsec AH?
                  </td>
                  <td className="px-4 py-2">
                    Ja — AH-HMAC dekker IP-headeren, NAT muterer den.
                    Workaround: NAT-T (IPsec inni UDP).
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">
                    End-to-end-tap
                  </td>
                  <td className="px-4 py-2">
                    Eksterne kan ikke initiere mot interne uten port-forwarding
                    eller hull-stikking.
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
              <Link
                to="/stack/$slug"
                params={{ slug: "dte-2507" }}
                className="text-brand hover:underline"
              >
                DTE-2507-hub
              </Link>{" "}
              — alle nettverks-mini-kursene.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2507-subnetting" }}
                className="text-brand hover:underline"
              >
                Subnetting / CIDR
              </Link>{" "}
              — forutsetning som forklarer hvorfor privatadressene er
              hierarkiske.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2507-inni-ruter" }}
                className="text-brand hover:underline"
              >
                Inni ruteren — IP-forwarding
              </Link>{" "}
              — forutsetning som forklarer hva en ruter faktisk gjør pakke-for-
              pakke.
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}
