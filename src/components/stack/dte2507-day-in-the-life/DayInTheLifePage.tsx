import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { EksterneRessurser } from "@/components/stack/EksterneRessurser";
import { DayWalker } from "./DayWalker";

const STEPS = [
  { title: "Hvorfor dette eksempelet er bokens crescendo", anchor: "hvorfor" },
  { title: "Nettverks-oppsettet (skole + Comcast + Google)", anchor: "setup" },
  { title: "24-stegs walkthrough", anchor: "walker" },
  { title: "Hva vi har integrert", anchor: "integrert" },
  { title: "Hva boka utelater", anchor: "utelater" },
  { title: "Eksamen-quick-ref", anchor: "ref" },
];

export function DayInTheLifePage() {
  return (
    <StackPageShell title="A Day in the Life of a Web Page Request" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Kurose &amp; Ross 6.7 — bokens crescendo
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            En dag i livet til en web-request — fra ARP-skrik til google.com
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Bob plugger laptopen i skolens Ethernet, åpner en nettleser og skriver
            <code className="font-mono mx-1 text-brand">www.google.com</code>. Det neste
            som skjer er <strong>24 distinkte steg</strong> fordelt over fire faser — og
            alle protokoller vi har lært (DHCP, ARP, DNS, OSPF, BGP, TCP, HTTP) spiller en
            rolle. Boka kaller det «a day in the life» og vier hele Section 6.7 til det.
            Det er Kurose-Ross sin{" "}
            <strong>crescendo</strong>: alle kapitlene 1–6 møtes i én historie.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span> Bruk{" "}
              <a href="#walker" className="text-brand hover:underline">walkthroughen under</a> —
              spill av med play, eller hopp mellom faser. Hvert steg viser pakken på alle
              protokoll-lag, hvem som er aktive, og hvor pakken flyter.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-day-in-the-life" steps={STEPS} />

        <section id="hvorfor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor er dette bokens crescendo?</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Hvert kapittel i Kurose-Ross introduserer én protokoll eller ett lag isolert. Det er
            nødvendig for å lære, men det skjuler hvor mye samspill som faktisk skjer i hverdagens
            web-request. Section 6.7 reverserer dette: én konkret hendelse spilles ut, og man ser at
            <strong> 17 steg går unna før noen HTTP-byte sendes</strong>. Det er en kraftig
            pedagogisk omvendning.
          </p>
          <ul className="text-sm space-y-1.5 list-disc pl-5 mb-3">
            <li>Forklarer hvorfor en «tom» webside likevel kan ta sekunder å laste på et nytt nett.</li>
            <li>Demonstrerer at link-laget, nettverkslaget og applikasjons-laget snakker sammen — ikke i isolasjon.</li>
            <li>Synliggjør hvor mange broadcast-er som flyr i bakgrunnen (DHCP og ARP).</li>
            <li>Gjør caching forståelig: andre gang Bob åpner siden hopper han direkte til steg 18.</li>
          </ul>
          <blockquote className="border-l-4 border-brand pl-4 italic text-sm text-muted-foreground">
            «Finally, after a lot of work, Bob's laptop is now ready to contact the
            www.google.com server!» — Kurose &amp; Ross, s. 516, steg 17 av 24.
          </blockquote>
        </section>

        <section id="setup" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Nettverks-oppsettet</h2>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-3">
              Aktørene
            </div>
            <ul className="text-sm space-y-2">
              <li>
                <span className="font-mono text-brand">Bobs laptop</span> · MAC{" "}
                <code className="text-xs font-mono">00:16:D3:23:68:8A</code> — får IP{" "}
                <code className="text-xs font-mono">68.85.2.101</code> etter DHCP.
              </li>
              <li>
                <span className="font-mono text-brand">Skole-switch</span> — link-laget, ingen IP. Lærer
                MAC-portmapping fra source-MAC i framer (self-learning, Ch 6.4.3).
              </li>
              <li>
                <span className="font-mono text-brand">Skolens gateway</span> · MAC{" "}
                <code className="text-xs font-mono">00:22:6B:45:1F:1B</code> · IP{" "}
                <code className="text-xs font-mono">68.85.2.1</code> — kjører DHCP-serveren og er
                første hopp ut.
              </li>
              <li>
                <span className="font-mono text-brand">Comcasts nettverk</span> · CIDR-blokk{" "}
                <code className="text-xs font-mono">68.80.0.0/13</code> — ruter intern via OSPF/IS-IS.
              </li>
              <li>
                <span className="font-mono text-brand">comcast.net DNS</span> · IP{" "}
                <code className="text-xs font-mono">68.87.71.226</code> — løser opp{" "}
                <code>www.google.com</code> til <code>64.233.169.105</code>.
              </li>
              <li>
                <span className="font-mono text-brand">Googles nettverk</span> · CIDR{" "}
                <code className="text-xs font-mono">64.233.160.0/19</code> — egen AS, snakker BGP med
                Comcast.
              </li>
              <li>
                <span className="font-mono text-brand">www.google.com</span> · IP{" "}
                <code className="text-xs font-mono">64.233.169.105</code> — HTTP-server på port 80.
              </li>
            </ul>
          </div>
        </section>

        <section id="walker" className="mb-10 scroll-mt-20">
          <h2 className="text-xl font-semibold mb-3">3. 24-stegs walkthrough</h2>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Klikk fase-chip-ene for å hoppe mellom de fire fasene, bruk piltastene for ett steg av
            gangen, eller spill av hele animasjonen.
          </p>
          <DayWalker />
        </section>

        <section id="integrert" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Hva vi har integrert i én historie</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Protokoll</th>
                  <th className="text-left font-semibold px-4 py-2">Hvor i de 24 stegene</th>
                  <th className="text-left font-semibold px-4 py-2 w-32">K&amp;R kapittel</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-brand">DHCP</td>
                  <td className="px-4 py-2.5">Steg 1–7 (skaffer IP, gateway, DNS, maske)</td>
                  <td className="px-4 py-2.5">4.3.3</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-brand">UDP</td>
                  <td className="px-4 py-2.5">DHCP (1, 5) og DNS (8, 16) — connectionless</td>
                  <td className="px-4 py-2.5">3.3</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-brand">IP / CIDR</td>
                  <td className="px-4 py-2.5">Hele historien — alle hopp har IP-headere</td>
                  <td className="px-4 py-2.5">4.3</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-brand">Ethernet</td>
                  <td className="px-4 py-2.5">Hvert hopp på link-laget</td>
                  <td className="px-4 py-2.5">6.4.2</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-brand">Switch self-learning</td>
                  <td className="px-4 py-2.5">Steg 3–6 (lærer Bobs port fra source-MAC)</td>
                  <td className="px-4 py-2.5">6.4.3</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-brand">ARP</td>
                  <td className="px-4 py-2.5">Steg 9–12 (laptopen finner gateway-MAC)</td>
                  <td className="px-4 py-2.5">6.4.1</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-brand">DNS</td>
                  <td className="px-4 py-2.5">Steg 8, 13–17 (oppslag av google.com)</td>
                  <td className="px-4 py-2.5">2.4</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-brand">OSPF / IS-IS</td>
                  <td className="px-4 py-2.5">Steg 14–15, 19, 21, 24 (intra-AS-ruting)</td>
                  <td className="px-4 py-2.5">5.3</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-brand">BGP</td>
                  <td className="px-4 py-2.5">Inter-AS mellom Comcast og Google</td>
                  <td className="px-4 py-2.5">5.4</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-brand">TCP 3-veis</td>
                  <td className="px-4 py-2.5">Steg 18, 20, 21 (SYN / SYN+ACK / ACK)</td>
                  <td className="px-4 py-2.5">3.5.6</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-brand">HTTP</td>
                  <td className="px-4 py-2.5">Steg 22–24 (GET → 200 OK → render)</td>
                  <td className="px-4 py-2.5">2.2</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="utelater" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Hva boka bevisst utelater</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Selv 24 steg er en forenkling. Boka nevner følgende som blir hoppet over for å holde
            historien lesbar — men som ville være med i et ekte hjemmenett:
          </p>
          <ul className="text-sm space-y-1.5 list-disc pl-5">
            <li>
              <strong>NAT</strong> på skolens gateway-router — private adresser ut, offentlige inn.
            </li>
            <li>
              <strong>WiFi-autentisering</strong> hvis Bob hadde brukt skolens trådløse nett (WPA2/WPA3).
            </li>
            <li>
              <strong>TLS</strong> — i 2024 er det <code>https://</code> som default, så det burde være
              en TLS-handshake mellom steg 21 og 22 (Kurose-Ross 8.6).
            </li>
            <li>
              <strong>HTTP/2 multiplexing</strong> for de 50–200 underressursene siden trigger.
            </li>
            <li>
              <strong>CDN-omdirigering</strong> — i praksis returnerer Googles DNS et CNAME til
              nærmeste edge-node, ikke origin-IP.
            </li>
            <li>
              <strong>QUIC/HTTP/3</strong> — Google bruker det i dag, som flytter mye av TCP og TLS
              inn i UDP.
            </li>
          </ul>
        </section>

        <section id="ref" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Eksamen-quick-ref</h2>
          <div className="rounded-xl border border-brand/40 bg-brand/5 p-5">
            <ul className="text-sm space-y-2">
              <li>
                <strong>Hvor mange steg før HTTP-byte 1 sendes?</strong> 17 steg —{" "}
                <em>«Finally, after a lot of work»</em>.
              </li>
              <li>
                <strong>Hvilke broadcast-pakker er involvert?</strong> DHCP DISCOVER (steg 1–4) og
                ARP request (steg 10). Begge med dst-MAC FF:FF:FF:FF:FF:FF.
              </li>
              <li>
                <strong>Hvorfor må ARP kjøres FØR DNS kan sendes?</strong> Fordi DNS-query rammen
                må ha gateway-routerens MAC som destinasjon på link-laget. Bob har bare IP-en til
                gateway fra DHCP, ikke MAC-en.
              </li>
              <li>
                <strong>Hvilken protokoll bestemmer veien mellom Comcast og Google?</strong> BGP
                (inter-domain). Innenfor hver AS brukes intra-domain (OSPF/IS-IS).
              </li>
              <li>
                <strong>Forskjellen på link-destinasjon og IP-destinasjon i steg 13?</strong>{" "}
                Link-dest = gateways MAC (nabohopp), IP-dest = DNS-serverens IP (endelig mottaker).
              </li>
              <li>
                <strong>Hva endres på hver hop?</strong> Link-laget (ny frame med nye MAC-er), TTL
                dekrementeres, IP-checksum oppdateres. IP-adressene (src/dst) er uendret.
              </li>
            </ul>
          </div>
        </section>

        <EksterneRessurser
          resources={[
            {
              type: "bok",
              tittel: "Computer Networking: Top-Down Approach",
              forfatter: "Kurose & Ross — Ch 6.7",
              href: "/stack/programmeringsboker#kurose-ross",
              why: "Hele Section 6.7 er der disse 24 stegene kommer fra. Bibelen.",
            },
            {
              type: "bok",
              tittel: "High Performance Browser Networking",
              forfatter: "Grigorik — gratis",
              href: "/stack/programmeringsboker#grigorik-hpbn",
              why: "Når du har skjønt protokoll-flyten her, gir Grigorik web-perf-perspektivet på toppen.",
            },
            {
              type: "mooc",
              tittel: "Stanford CS144: Day in the Life of an Application",
              forfatter: "Lecture 1.1",
              href: "/stack/mooc-bibliotek#stanford-cs144",
              why: "CS144 åpner med samme idé. Implementer din egen TCP-stakk for å virkelig forstå.",
            },
          ]}
        />
      </article>
    </StackPageShell>
  );
}
