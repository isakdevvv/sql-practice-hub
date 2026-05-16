import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { PacketClassifierLab } from "./PacketClassifierLab";

const STEPS = [
  { title: "Hva er en brannmur?", anchor: "what" },
  { title: "Stateless: ACL på pakker", anchor: "stateless" },
  { title: "ACK=1-hullet", anchor: "ack-hole" },
  { title: "Stateful: connection table", anchor: "stateful" },
  { title: "3-veis-handshake bygger state", anchor: "handshake" },
  { title: "Klassifiser pakketabellen", anchor: "lab" },
  { title: "Eksamen-quick-ref", anchor: "ref" },
];

export function StatefulFirewallPage() {
  return (
    <StackPageShell title="Stateful vs stateless brannmur" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Kurose &amp; Ross 8.9 (s. 667-674)
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Stateful vs stateless brannmur — hvorfor ACK=1-regelen er et hull
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            En brannmur (firewall) tar én avgjørelse per pakke: tillat eller blokker. Den
            store skillet ligger i <em>hva</em> den ser på. En <strong>stateless</strong>{" "}
            brannmur ser bare på den ene pakken — header-feltene. En{" "}
            <strong>stateful</strong> brannmur husker hvilke forbindelser som er etablert
            og slipper kun gjennom pakker som passer inn i dem. Forskjellen er ikke
            akademisk: stateless har et hull som har vært utnyttet i tiår.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#lab" className="text-brand hover:underline">pakke-klassifiserings-laben</a>{" "}
              gir deg 6 pakker. Marker hver først statelessly, så statefully — og se
              hvilke som glipper i den ene men ikke den andre.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-stateful-firewall" steps={STEPS} />

        <section id="what" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva er en brannmur?</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            En brannmur er en filtrerings-funksjon på en pakke-strøm. Den sitter typisk
            på grensen mellom et internt nett og internett, eller mellom to soner med
            ulik tillit. Kurose-Ross deler i tre typer:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>
              <strong>Traditional packet filter</strong> — ser på IP/TCP/UDP-header.
              Stateless.
            </li>
            <li>
              <strong>Stateful packet filter</strong> — holder tabell over åpne TCP-forbindelser.
            </li>
            <li>
              <strong>Application gateway</strong> — proxy som forstår innholdet (HTTP,
              SMTP). Mest restriktiv, mest kostbar.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Vi fokuserer på de to første. Application-nivå (WAF, etc.) er en separat
            disiplin.
          </p>
        </section>

        <section id="stateless" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Stateless — ACL på enkeltpakker</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            En stateless brannmur evaluerer hver pakke uavhengig mot en{" "}
            <strong>Access Control List (ACL)</strong>: en ordnet liste med regler. Hver
            regel matcher på src-IP, dst-IP, src-port, dst-port, protokoll, flagg. Første
            regel som matcher vinner.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 text-sm">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Typisk stateless ACL for et hjemmenett
            </div>
            <pre className="font-mono text-[11px] leading-relaxed overflow-x-auto">
{`# Innenfra: tillat alt utgående
allow  src=10.0.1.0/24  dst=any  proto=tcp,udp,icmp

# Utenfra: tillat returtrafikk (eksisterende TCP-forbindelser?)
allow  src=any  dst=10.0.1.0/24  proto=tcp  flags=ACK=1

# Tillat DNS-svar (UDP 53 svarer)
allow  src=any:53  dst=10.0.1.0/24  proto=udp

# Default: blokker alt annet
deny   all`}
            </pre>
          </div>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Andre regel er den interessante: «tillat innkommende TCP-pakker med ACK=1»
            er antagelsen om at <em>hvis flagg-feltet har ACK satt, er pakken del av en
            etablert forbindelse</em>. Antagelsen er bare delvis sann.
          </p>
        </section>

        <section id="ack-hole" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. ACK=1-hullet</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            En angriper utenfor kan sende pakker med <strong>ACK=1 satt</strong> selv om
            ingen forbindelse er etablert. Pakkene er <em>malformed</em> fra TCP-perspektiv
            — målmaskinen vil typisk svare med RST — men brannmuren slipper dem inn på
            grunn av ACK=1-regelen. Hva oppnår angriperen?
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>
              <strong>Port-scan via ACK-pakker:</strong> noen stacks svarer ulikt på
              ACK-pakker mot åpne vs lukkede porter — kartlegger interne tjenester.
            </li>
            <li>
              <strong>OS-fingerprinting:</strong> RST-respons-tider og TTL-verdier
              avslører OS-versjon.
            </li>
            <li>
              <strong>NIDS-evasion:</strong> noen IDS-er ignorerer «ren» ACK-trafikk
              fordi den ser ut som etablert — så ACK-baserte angrep glipper.
            </li>
          </ul>
          <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 text-sm">
            <strong className="text-rose-700 dark:text-rose-400">Bokens poeng:</strong>{" "}
            stateless brannmur kan ikke skille «svar på vår SYN» fra «vilkårlig ACK fra
            nett». Begge har ACK=1. Stateful løser det ved å huske den faktiske
            handshake-sekvensen.
          </div>
        </section>

        <section id="stateful" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Stateful — connection table</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            En stateful brannmur fører en tabell over alle aktive TCP-forbindelser
            («connection table»). Hver rad er en 5-tuppel:
          </p>
          <pre className="rounded-xl border border-border bg-card p-4 text-xs font-mono leading-relaxed">
{`(src-IP, src-port, dst-IP, dst-port, protokoll)  →  state, last-seen

10.0.1.5:51200  ↔  93.184.216.34:80   TCP  ESTABLISHED  2026-05-14 13:42:01
10.0.1.5:51201  ↔  142.250.74.46:443  TCP  ESTABLISHED  2026-05-14 13:41:58
10.0.1.9:53455  ↔  8.8.8.8:53         UDP  ACTIVE       2026-05-14 13:42:09`}
          </pre>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Reglen blir nå: <em>tillat en innkommende pakke kun hvis (dst, dst-port,
            src, src-port) matcher en rad i tabellen.</em> En ACK-pakke som ikke matcher
            blir blokkert — uansett om ACK-flagget er satt. Hullet er stengt.
          </p>
        </section>

        <section id="handshake" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. 3-veis-handshake bygger state</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Tabellen vokser ved at brannmuren observerer handshake-sekvenser:
          </p>
          <pre className="rounded-xl border border-border bg-card p-4 text-xs font-mono leading-relaxed">
{`klient → server:  SYN              brannmur: legg til (SYN_SENT, ny rad)
klient ← server:  SYN, ACK          brannmur: oppdater til (SYN_RECV)
klient → server:  ACK               brannmur: oppdater til (ESTABLISHED)
... datapakker flyter begge veier ...
klient → server:  FIN              brannmur: TIME_WAIT
klient ← server:  FIN, ACK         brannmur: fjern rad etter timeout`}
          </pre>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            UDP er statelös i selve protokollen, men brannmuren etablerer en
            pseudo-forbindelse ved første utgående UDP-pakke (typisk 30 s timeout). Det
            er det som lar svar på DNS-spørringer komme tilbake gjennom en stateful
            brannmur uten egen regel for hver enkelt forespørsel.
          </p>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">Implikasjon:</strong>{" "}
            stateful brannmur er <em>connection-oriented</em> selv for connectionless UDP.
            Linux netfilter (`iptables -m state`) og BSD pf gjør akkurat dette siden 2000.
          </div>
        </section>

        <section id="lab" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Klassifiser pakketabellen</h2>
          <p className="text-sm text-muted-foreground mb-3">
            6 pakker, basert på Kurose-Ross Table 8.6/8.8. Klassifiser hver først som
            stateless brannmur ville gjort, så som stateful — og se hvilke ACK-pakker
            som glipper.
          </p>
          <PacketClassifierLab />
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <strong>Diagnostikk:</strong>
            <ul className="mt-2 space-y-1 list-disc pl-5 text-muted-foreground">
              <li>
                Pakke #3 og #6 er <em>begge</em> ACK-pakker fra utsiden uten matchende
                handshake. Stateless slipper dem inn (ACK=1-regel). Stateful blokker
                begge — det er hele forskjellen.
              </li>
              <li>
                Pakke #5 (SYN fra utsiden mot port 23) blokkeres av begge — stateless
                har eksplisitt regel mot innkommende SYN, stateful har ingen rad å matche.
              </li>
              <li>
                Pakke #1, #2, #4 er normal trafikk for en åpen forbindelse — begge tillater.
              </li>
            </ul>
          </div>
        </section>

        <section id="ref" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">7. Eksamen-quick-ref</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Aspekt</th>
                  <th className="text-left font-semibold px-4 py-2">Stateless</th>
                  <th className="text-left font-semibold px-4 py-2">Stateful</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Hva ser den på?</td>
                  <td className="px-4 py-3">Header-felt i denne ene pakken</td>
                  <td className="px-4 py-3">Header + match mot connection table</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Minne</td>
                  <td className="px-4 py-3">Konstant, ACL i kjernen</td>
                  <td className="px-4 py-3">Vokser med antall aktive forbindelser</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">ACK=1-hullet</td>
                  <td className="px-4 py-3">Sårbar</td>
                  <td className="px-4 py-3">Stengt</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Returtrafikk</td>
                  <td className="px-4 py-3">Krever eksplisitt regel per tjeneste</td>
                  <td className="px-4 py-3">Automatisk via connection table</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Eksempler</td>
                  <td className="px-4 py-3">Cisco extended ACL, gammel ipchains</td>
                  <td className="px-4 py-3">Linux netfilter, BSD pf, Windows Defender</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Videre lesning</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-brannmur-vlan" }} className="text-brand hover:underline">
                Brannmur og VLAN
              </Link>{" "}
              — det praktiske: ACL-regler, VLAN-segmentering, plassering.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-ids-snort" }} className="text-brand hover:underline">
                IDS: signature vs anomaly + DMZ
              </Link>{" "}
              — neste forsvarslag når brannmuren ikke er nok.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "transportlag" }} className="text-brand hover:underline">
                Transportlag — TCP og UDP
              </Link>{" "}
              — for å forstå handshake og flagg som brannmuren ser på.
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}
