import { Link } from "@tanstack/react-router";
import {Lightbulb, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { VisualDefs } from "@/components/stack/kurose-kurs/VisualDefs";
import {
  FirewallDropIcon,
  FirewallRejectIcon,
  FirewallAcceptIcon,
  HostFirewallIcon,
  NetworkFirewallIcon,
  AccessPortIcon,
  TrunkPortIcon,
} from "@/components/stack/sikkerhet/securityIcons";
import { NetworkTopology } from "@/components/stack/dte2507-praksis/NetworkTopology";

const STEPS = [
  { title: "Brannmur — hva og hvorfor", anchor: "intro" },
  { title: "Stateless vs stateful vs applikasjon", anchor: "typer" },
  { title: "iptables / nftables — eksempler", anchor: "iptables" },
  { title: "Brannmur-topologier (DMZ, screened subnet)", anchor: "topologier" },
  { title: "ACL-design for en webserver", anchor: "acl" },
  { title: "VLAN — segmentering", anchor: "vlan" },
  { title: "Tagged vs untagged, 802.1Q", anchor: "tagging" },
  { title: "Strategier — defense in depth, least privilege", anchor: "strategier" },
];

export function BrannmurVlanPage() {
  return (
    <StackPageShell title="Brannmur og VLAN" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Infrastruktur-sikkerhet
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Brannmur, VLAN og segmentering
          </h1>
          <p className="mt-3 text-muted-foreground">
            Web-sikkerhet handler om input-validering. Infrastruktur-sikkerhet
            handler om <em>hva som er n&aring;bart</em> i utgangspunktet. En riktig
            konfigurert brannmur og VLAN-segmentering reduserer angreps-flaten
            f&oslash;r noen kode er skrevet.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «Brannmur / VLAN» — quiz om iptables-regler, match topologi til
              scenarie, sort&eacute;r ACL-regler.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2507-brannmur-vlan" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Brannmur — hva og hvorfor</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En brannmur (firewall) er en politi-funksjon mellom to nett: hver
            pakke som passerer m&aring; matche en regel som <strong>tillater</strong>{" "}
            den, ellers blir den droppet eller avvist. Default-policy er
            n&oslash;kkelen — i 99 % av tilfellene skal det v&aelig;re{" "}
            <code>DENY</code> (whitelist), ikke <code>ALLOW</code> (blacklist).
          </p>
          <VisualDefs
            title="Tre brannmur-actions"
            items={[
              {
                term: "DROP",
                icon: <FirewallDropIcon />,
                body: "Pakken kastes uten svar. Avsenderen ser timeout — vanskelig å portskanne.",
              },
              {
                term: "REJECT",
                icon: <FirewallRejectIcon />,
                body: "Pakken kastes med ICMP-svar («Destination Unreachable»). Høflig, men bekrefter at vi finnes.",
              },
              {
                term: "ACCEPT",
                icon: <FirewallAcceptIcon />,
                body: "Pakken slippes gjennom. Tilstands-tabell oppdateres på stateful brannmurer.",
              },
            ]}
          />
        </section>

        <section id="typer" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Stateless vs stateful vs applikasjon</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left px-3 py-2 w-32">Type</th>
                  <th className="text-left px-3 py-2">Hva den ser p&aring;</th>
                  <th className="text-left px-3 py-2">Eksempel-bruk</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-semibold">Stateless (packet filter)</td>
                  <td className="px-3 py-2 text-muted-foreground">Hver pakke isolert — IP, port, flagg.</td>
                  <td className="px-3 py-2 text-muted-foreground">Tidlige ACL-er, ruter-niv&aring;.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-semibold">Stateful</td>
                  <td className="px-3 py-2 text-muted-foreground">Holder en connection-tabell. Returtrafikk pa eksisterende tilkobling slipper gjennom automatisk.</td>
                  <td className="px-3 py-2 text-muted-foreground">Standard for moderne brannmurer (iptables, pfSense).</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-semibold">Applikasjons-niv&aring;</td>
                  <td className="px-3 py-2 text-muted-foreground">Forst&aring;r HTTP, SQL, etc. og kan blokkere pa innhold.</td>
                  <td className="px-3 py-2 text-muted-foreground">WAF (Cloudflare, ModSecurity), proxy.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            En stateful brannmur trenger BARE &eacute;n regel for &laquo;tillat web-trafikk
            ut&raquo; — den hus ker tilkoblingen og slipper svaret inn igjen.
            En stateless m&aring; ha b&aring;de en regel for utgaaende og en for inngaaende.
          </p>
        </section>

        <section id="iptables" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. iptables / nftables — eksempler</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Linux-brannmuren har tre standard-tabeller. <code>filter</code> er
            standard og det vi bruker mest. INPUT-kjeden er pakker som SKAL
            til denne maskinen; OUTPUT er fra denne maskinen; FORWARD er pakker
            som rutes gjennom.
          </p>
          <pre className="rounded-xl border border-border bg-card p-5 font-mono text-xs overflow-x-auto whitespace-pre">{`# === Klassisk webserver — bare port 22 og 443 inn ===

# 1. Default: drop alt
sudo iptables -P INPUT DROP
sudo iptables -P FORWARD DROP
sudo iptables -P OUTPUT ACCEPT  # vi stoler pa egen utgaaende trafikk

# 2. Tillat etablerte tilkoblinger (stateful — kjernen i moderne FW)
sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# 3. Tillat lo (loopback)
sudo iptables -A INPUT -i lo -j ACCEPT

# 4. Tillat SSH fra mgmt-nettet 10.0.10.0/24
sudo iptables -A INPUT -p tcp -s 10.0.10.0/24 --dport 22 -j ACCEPT

# 5. Tillat HTTPS fra alle
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# 6. Logg + drop resten (siste fanger alt fordi default-policy er DROP)
sudo iptables -A INPUT -j LOG --log-prefix "FW-DROP: "
sudo iptables -A INPUT -j DROP`}</pre>
          <p className="mt-3 text-sm text-muted-foreground">
            <strong>Les ovenfra og ned.</strong> Forste regel som matcher
            avgj&oslash;r. Derfor er rekkefolgen viktig: spesifikke regler f&oslash;r
            generelle.
          </p>
        </section>

        <section id="topologier" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Brannmur-topologier</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`=== Single-firewall DMZ (klassisk 3-leg) ===

    Internett
       |
   +---FW---+
   |   |    |
   |   v    |
   |   DMZ  |     <-- webserver, mailserver — eksponerte tjenester
   |   |    |
   |   v    |
   |  LAN   |     <-- klient-maskiner, intern DB
   +--------+

FW har tre interface: WAN, DMZ, LAN.
- WAN → DMZ:  bare 80/443 til web, 25 til mail
- WAN → LAN:  ALT droppet (LAN-er ikke n&aring;bar fra internett)
- DMZ → LAN:  bare 3306 fra web-tjener til DB-tjener
- LAN → DMZ:  fritt (admins skal kunne logge inn)


=== Screened subnet (to brannmurer) ===

   Internett -- FW1 -- DMZ -- FW2 -- LAN

To brannmurer i serie. Hvis FW1 kompromitteres, m&aring; angriperen ogsa
bryte FW2 for &aring; komme til LAN. Brukes for high-stakes-milj&oslash;er.`}</pre>
          </div>
          <div className="mt-4">
            <VisualDefs
              title="To plasseringer"
              items={[
                {
                  term: "Host-based brannmur",
                  icon: <HostFirewallIcon />,
                  body: "På selve maskinen — iptables, Windows Defender Firewall. Beskytter mot trusler INNE på nettet (lateral movement).",
                },
                {
                  term: "Network-based brannmur",
                  icon: <NetworkFirewallIcon />,
                  body: "På perimeter-en. Cisco ASA, FortiGate, pfSense. Beskytter MANGE maskiner på én gang.",
                },
              ]}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Best practice: <strong>begge deler</strong>. Network-brannmuren
            blokkerer det aapenbare; host-brannmuren stopper at en
            kompromittert webserver port-skanner sine naboer.
          </p>
          <div className="mt-6">
            <NetworkTopology />
          </div>
        </section>

        <section id="acl" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. ACL-design for en webserver</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Klassisk eksamens-oppgave: «Sett opp ACL-regler for en webserver som
            har en MySQL-database bak seg». L&oslash;sning:
          </p>
          <div className="overflow-x-auto rounded-lg border border-border text-sm">
            <table className="w-full">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left px-3 py-2"># </th>
                  <th className="text-left px-3 py-2">Fra</th>
                  <th className="text-left px-3 py-2">Til</th>
                  <th className="text-left px-3 py-2">Port</th>
                  <th className="text-left px-3 py-2">Action</th>
                  <th className="text-left px-3 py-2">Hvorfor</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                <tr className="border-t border-border"><td className="px-3 py-2">1</td><td className="px-3 py-2">any</td><td className="px-3 py-2">web</td><td className="px-3 py-2">443</td><td className="px-3 py-2 text-success">ALLOW</td><td className="px-3 py-2 font-sans text-muted-foreground">HTTPS for alle</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2">2</td><td className="px-3 py-2">any</td><td className="px-3 py-2">web</td><td className="px-3 py-2">80</td><td className="px-3 py-2 text-success">ALLOW</td><td className="px-3 py-2 font-sans text-muted-foreground">HTTP → 301 redirect til 443</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2">3</td><td className="px-3 py-2">mgmt-net</td><td className="px-3 py-2">web</td><td className="px-3 py-2">22</td><td className="px-3 py-2 text-success">ALLOW</td><td className="px-3 py-2 font-sans text-muted-foreground">SSH bare fra admin-nettet</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2">4</td><td className="px-3 py-2">web</td><td className="px-3 py-2">db</td><td className="px-3 py-2">3306</td><td className="px-3 py-2 text-success">ALLOW</td><td className="px-3 py-2 font-sans text-muted-foreground">App-server til DB</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2">5</td><td className="px-3 py-2">any</td><td className="px-3 py-2">db</td><td className="px-3 py-2">any</td><td className="px-3 py-2 text-destructive">DENY</td><td className="px-3 py-2 font-sans text-muted-foreground">DB ALDRI direkte fra internett</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2">6</td><td className="px-3 py-2">any</td><td className="px-3 py-2">any</td><td className="px-3 py-2">any</td><td className="px-3 py-2 text-destructive">DENY</td><td className="px-3 py-2 font-sans text-muted-foreground">Default drop</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Husk: en stateful brannmur trenger ikke eksplisitt regel for
            return-trafikk (svar fra web til klient gar greit). En stateless
            ma ha det.
          </p>
        </section>

        <section id="vlan" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. VLAN — segmentering</h2>
          <p className="text-sm text-muted-foreground mb-4">
            VLAN (Virtual LAN) lar deg dele én fysisk switch i flere logiske
            nett. Trafikk i ulike VLAN-er kan ikke n&aring; hverandre uten &aring; ga
            gjennom en ruter (eller layer-3-switch) — og DA gjennom brannmur.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Én fysisk switch, fire VLAN:

   VLAN 10 (kontor)    Port 1-10
   VLAN 20 (gjest)     Port 11-15
   VLAN 30 (servere)   Port 16-20
   VLAN 99 (mgmt)      Port 21-24

Trafikk mellom VLAN-er ma rutes via L3 — der ligger brannmuren.

Hvorfor:
  - Reduserer broadcast-domener (ARP, DHCP-stoy)
  - Begrenser lateral movement etter et brudd
  - Lar deg ha ulike sikkerhets-policys per gruppe
  - Sk iller gjester fra ansatte uten egen fysisk infrastruktur`}</pre>
          </div>
        </section>

        <section id="tagging" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Tagged vs untagged, 802.1Q</h2>
          <p className="text-sm text-muted-foreground mb-4">
            IEEE 802.1Q legger en 4-byte tag i Ethernet-frame som forteller
            hvilket VLAN den tilh&oslash;rer. To moduser pa en switch-port:
          </p>
          <VisualDefs
            title="To switch-port-moduser"
            items={[
              {
                term: "Untagged (access port)",
                icon: <AccessPortIcon />,
                body: "Klient-PC-en ser ingen tag. Switchen legger på VLAN-tag på vei inn, fjerner på vei ut. Vanlig for sluttbrukere.",
              },
              {
                term: "Tagged (trunk port)",
                icon: <TrunkPortIcon />,
                body: "Beholder taggen i framen. Brukes mellom switcher og til hypervisor-noder som server flere VLAN samtidig.",
              },
            ]}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Klassisk feilkonfig:</strong> «VLAN hopping» — angriper sender
            en double-tagged frame som passerer en feil-konfigurert trunk. Forsvar:
            sett en eksplisitt native VLAN som <em>ikke brukes</em> til noe, og
            slaa av DTP-auto-negotiation.
          </p>
        </section>

        <section id="strategier" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Strategier — defense in depth, least privilege</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold mb-1">Defense in depth</h3>
              <p className="text-muted-foreground">
                Aldri ETT lag forsvar. Network-FW + host-FW + WAF + app-validering +
                least-privilege brukere. Bryter en — tre andre staar.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold mb-1">Least privilege</h3>
              <p className="text-muted-foreground">
                Gi hver komponent BARE rettighetene den trenger. Webserveren
                kjorer ikke som root; DB-brukeren heter ikke admin; brannmur-default
                er DENY.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold mb-1">Zero trust</h3>
              <p className="text-muted-foreground">
                «Trust no one, verify everything». Selv inne pa LAN-et: krever
                autentisering, gjerne mTLS, mellom mikrotjenester. Erstatter «en
                tjukk perimeter, mykt innvendig»-mod ellen.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold mb-1">Segmentering</h3>
              <p className="text-muted-foreground">
                Del nett inn i soner med eksplisitt tillit. Et brudd i ett VLAN
                skal ikke gi tilgang til alle de andre. M&aring;l pa VLAN-segmentering:
                hvor mange hopp + brannmur-regler maa angriperen sno seg gjennom?
              </p>
            </div>
          </div>
        </section>

        <div className="rounded-xl border border-border bg-card p-5 text-sm mt-10">
          <h2 className="font-semibold mb-2">Eksamen-favoritter</h2>
          <ul className="list-disc pl-5 text-muted-foreground space-y-1">
            <li>«Forklar forskjellen mellom stateless og stateful brannmur» — connection-tabell.</li>
            <li>«Tegn topologi for en webapp med DB» — DMZ + intern subnet, FW mellom.</li>
            <li>«Skriv iptables-regler» — kjenn DROP/ACCEPT, ESTABLISHED-pattern.</li>
            <li>«Hva er forskjellen pa access port og trunk port?» — untagged vs tagged.</li>
            <li>«Hvorfor VLAN?» — segmentering, broadcast-domener, lateral movement.</li>
          </ul>
        </div>
              <div className="mt-6">
          <Link
            to="/stack/$slug"
            params={{ slug: "dte-2507" }}
            className="text-brand hover:underline inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tilbake til DTE-2507-hub
          </Link>
        </div>
</div>
    </StackPageShell>
  );
}
