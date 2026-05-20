import * as React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { VisualDefs } from "@/components/stack/kurose-kurs/VisualDefs";
import {
  ArpSpoofIcon,
  DnsSpoofIcon,
  SynFloodIcon,
  DdosIcon,
  PortScanIcon,
  WifiSniffIcon,
} from "@/components/stack/sikkerhet/securityIcons";

const STEPS = [
  { title: "Forsvarsdyp — flere lag", anchor: "forsvarsdyp" },
  { title: "Brannmur — stateful vs stateless", anchor: "brannmur" },
  { title: "NAT og hvordan det også beskytter", anchor: "nat" },
  { title: "IDS vs IPS", anchor: "ids" },
  { title: "Vanlige angrep", anchor: "angrep" },
  { title: "Web-server-sikkerhet", anchor: "webserver" },
  { title: "Wireshark + tcpdump — verktøy", anchor: "verktoy" },
];

type Angrep = {
  navn: string;
  hvordan: string;
  forsvar: string;
  icon: React.ReactNode;
};

const ANGREP: Angrep[] = [
  {
    navn: "ARP spoofing / MITM",
    hvordan: "Angriperen sender falske ARP-svar så trafikken går gjennom hans maskin før den når riktig destinasjon.",
    forsvar: "Static ARP, dynamic ARP inspection på switch, TLS som beskytter selv om trafikken sniffes.",
    icon: <ArpSpoofIcon />,
  },
  {
    navn: "DNS-spoofing",
    hvordan: "Falske DNS-svar sendes til klienten så «nettbank.no» peker på angriperens IP.",
    forsvar: "DNSSEC (signerte DNS-svar), DoH/DoT (DNS over HTTPS/TLS), HSTS i nettleseren.",
    icon: <DnsSpoofIcon />,
  },
  {
    navn: "TCP SYN flood",
    hvordan: "Angriperen sender millioner av SYN uten å fullføre håndtrykket — servervaler ligger i half-open.",
    forsvar: "SYN cookies, rate limiting, brannmur som dropper.",
    icon: <SynFloodIcon />,
  },
  {
    navn: "DDoS",
    hvordan: "Mange maskiner (botnet) sender trafikk samtidig for å overbelaste serveren.",
    forsvar: "CDN/anti-DDoS-tjenester (Cloudflare), rate limiting, kapasitets-overdimensjonering.",
    icon: <DdosIcon />,
  },
  {
    navn: "Port scanning",
    hvordan: "Angriperen prober alle porter på en maskin for å finne åpne tjenester.",
    forsvar: "Brannmur som dropper (ikke rejecter) ukjent trafikk, port knocking, fail2ban.",
    icon: <PortScanIcon />,
  },
  {
    navn: "Sniffing på open WiFi",
    hvordan: "Annen klient på samme nett kan lese all uknyttert trafikk.",
    forsvar: "Alltid HTTPS, VPN på utrygge nett, WPA3 på AP-en.",
    icon: <WifiSniffIcon />,
  },
];

export function NettverkssikkerhetPage() {
  return (
    <StackPageShell title="Nettverkssikkerhet" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Infrastruktur-sikkerhet
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Nettverkssikkerhet — brannmur, IDS, angrep og forsvar
          </h1>
          <p className="mt-3 text-muted-foreground">
            Web-sikkerhet (SQLi, XSS, CSRF) er den ene halvdelen. Den andre er
            INFRASTRUKTUR: hvordan du beskytter nettverket selv, hva du sperrer
            i brannmuren, og hvordan du oppdager angrep i sanntid.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «Nettverkssikkerhet» — quiz om brannmur-regler, match angrep til
              forsvar, sortér IDS-pipeline.
            </div>
          </div>
        </div>

        <CourseOutline courseId="nettverkssikkerhet" steps={STEPS} />

        <section id="forsvarsdyp" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Forsvarsdyp — flere lag</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <strong>Defense in depth</strong> = ingen enkelt forsvarsmekanisme er nok.
            Hvis én bryter, skal flere ligger under. Klassisk skiktet oppsett for en
            web-app:
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Internett
   │
   ▼
+─────────────────────────────+
│ DDoS-mitigation / CDN       │ ← Cloudflare, Akamai
+─────────────────────────────+
   │
   ▼
+─────────────────────────────+
│ WAF (Web Application FW)    │ ← regler mot SQLi/XSS-mønstre
+─────────────────────────────+
   │
   ▼
+─────────────────────────────+
│ Load balancer + TLS         │ ← terminerer HTTPS
+─────────────────────────────+
   │
   ▼
+─────────────────────────────+
│ Brannmur (stateful)         │ ← bare port 443 åpen utenfra
+─────────────────────────────+
   │
   ▼
+─────────────────────────────+
│ Application servers (DMZ)   │ ← validerer input, escaper output
+─────────────────────────────+
   │
   ▼
+─────────────────────────────+
│ Brannmur (intern)           │ ← bare DB-port fra app-servere
+─────────────────────────────+
   │
   ▼
+─────────────────────────────+
│ Database (privat nett)      │ ← ingen direkte internett-tilgang
+─────────────────────────────+`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Prinsippet: hvert lag har én oppgave, hver feilet komponent skal ikke
            kompromittere helheten. Angriper må knekke ALLE lag.
          </p>
        </section>

        <section id="brannmur" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Brannmur — stateful vs stateless</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En brannmur er et filter mellom to nett. Den ser hver pakke og bestemmer:
            slipp gjennom, drop, eller reject.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Stateless (packet filter)
              </div>
              <p className="text-sm text-foreground mb-2">
                Sjekker hver pakke isolert mot regler (IP, port, protokoll).
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-5">
                <li>Raskt, lite minne</li>
                <li>Kan ikke vite om pakken er del av etablert forbindelse</li>
                <li>Må åpne brede port-range for retur-trafikk</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Stateful
              </div>
              <p className="text-sm text-foreground mb-2">
                Holder oversikt over aktive forbindelser. Tillater retur-trafikk
                automatisk.
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-5">
                <li>Standard i moderne brannmurer (iptables, pf, Windows FW)</li>
                <li>Mer minne (tabell over open connections)</li>
                <li>Enklere regler — bare definer hva som startes innenfra</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Eksempel — iptables-regler (stateful)
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Tillat etablerte forbindelser
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Tillat SSH inn fra et spesifikt nett
iptables -A INPUT -p tcp -s 10.0.0.0/24 --dport 22 -j ACCEPT

# Tillat HTTP/HTTPS fra alle
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Default deny — alt annet droppes
iptables -P INPUT DROP`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Default deny</strong> er gull-standarden: blokker alt, åpne kun det
            du trenger. Default allow er en sikkerhetsfeil som venter på å skje.
          </p>
        </section>

        <section id="nat" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. NAT — Network Address Translation</h2>
          <p className="text-sm text-muted-foreground mb-4">
            NAT ble oppfunnet for å spare IPv4-adresser, men det fungerer også som
            <strong> uintendert brannmur</strong> — utenfra kan du ikke nå klienter
            innenfor uten at de først har initiert forbindelse.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Hjemme-nett (privat):              Internett (offentlig):

  Laptop  10.0.0.5:54321 ────► Router 88.10.20.30:54321 ────► server.com:443
                                            ↑
                       NAT-tabell holder:
              10.0.0.5:54321  ↔  88.10.20.30:54321

  Retur fra server går til 88.10.20.30:54321,
  router slår opp i NAT-tabellen og videresender til 10.0.0.5:54321.

  En utenforstående som prøver å koble seg til 88.10.20.30:80:
  → Routeren har ingen entry. Pakken droppes.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Dette er en BIVIRKNING av NAT, ikke en garanti. IPv6 har nok adresser til at
            NAT ikke trengs — da må du være eksplisitt med brannmur-regler i stedet.
          </p>
        </section>

        <section id="ids" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. IDS vs IPS</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hvor brannmuren <em>blokkerer</em> basert på regler, prøver IDS/IPS å
            <em> oppdage angrep</em> basert på mønster.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                IDS — Intrusion Detection
              </div>
              <p className="text-sm text-foreground mb-2">
                <strong>Passiv:</strong> ser på trafikk, varsler ved mistenkelig.
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-5">
                <li>Plasseres på en SPAN-port (kopi av trafikken)</li>
                <li>Ingen risiko for å stoppe legit trafikk</li>
                <li>Suricata, Snort, Zeek</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                IPS — Intrusion Prevention
              </div>
              <p className="text-sm text-foreground mb-2">
                <strong>Aktiv:</strong> samme analyse, men plasseres in-line og DROPER
                mistenkelig trafikk.
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-5">
                <li>Hver pakke må passere — kan introdusere latency</li>
                <li>Risiko for false positives som blokkerer legit trafikk</li>
                <li>Krever finstemte regler</li>
              </ul>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Signature-basert</strong> (matcher mot kjente angrepsmønstre) vs{" "}
            <strong>anomaly-basert</strong> (lærer normal trafikk, varsler ved avvik).
            Moderne systemer kombinerer begge med ML.
          </p>
        </section>

        <section id="angrep" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Vanlige nettverksangrep</h2>
          <VisualDefs
            title="Angreps-katalog"
            items={ANGREP.map((a) => ({
              term: a.navn,
              icon: a.icon,
              body: (
                <>
                  <strong>Hvordan:</strong> {a.hvordan}
                  <br />
                  <strong>Forsvar:</strong> {a.forsvar}
                </>
              ),
            }))}
          />
        </section>

        <section id="webserver" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Web-server-sikkerhet — sjekkliste</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Konkret oppsett du SKAL ha på en eksponert web-server.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <ul className="space-y-1.5 text-sm text-foreground list-disc pl-5">
              <li><strong>Bare HTTPS</strong> — HTTP redirecter til 443, HSTS-header satt</li>
              <li><strong>Moderne TLS</strong> — bare TLS 1.2/1.3, fjern SSLv3, TLS 1.0/1.1</li>
              <li><strong>Strong cipher suites</strong> — fjern RC4, 3DES, NULL, EXPORT</li>
              <li><strong>Security headers</strong> — CSP, X-Frame-Options, X-Content-Type-Options</li>
              <li><strong>Bare nødvendige porter</strong> — brannmur tillater kun 443 (+ 22 fra admin-IP)</li>
              <li><strong>Hold systemet patchet</strong> — auto-oppdateringer eller scheduled patching</li>
              <li><strong>Logging</strong> — alle requests, alle 4xx/5xx, alle auth-forsøk</li>
              <li><strong>Rate limiting</strong> — på login-endepunkter, API-er som koster</li>
              <li><strong>Fail2ban / equivalent</strong> — auto-ban etter X mislykkede login</li>
              <li><strong>Backup + restore-test</strong> — verifisert månedlig</li>
            </ul>
          </div>
        </section>

        <section id="verktoy" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Wireshark + tcpdump — verktøyene</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Wireshark er packet-capture-verktøyet alle nettverks-folk bruker. tcpdump
            er kommandolinje-versjonen.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Vis alle pakker på eth0
tcpdump -i eth0

# Bare HTTP-trafikk
tcpdump -i eth0 port 80

# Bare fra en spesifikk IP
tcpdump -i eth0 host 10.0.0.5

# Skriv til fil for analyse i Wireshark
tcpdump -i eth0 -w fangst.pcap

# Vis innholdet av pakkene som ASCII (-A)
tcpdump -i eth0 -A port 80`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>I labben:</strong> kjør Wireshark mens du laster en HTTP-side, så en
            HTTPS-side. Sammenlign. HTTP viser klartekst — du kan lese hele requesten.
            HTTPS viser bare TLS-håndtrykk + krypterte bytes. DET er hva TLS gir deg.
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : quiz om brannmur-regler, match angrep til forsvar.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "sikkerhet" }} className="text-brand hover:underline">
                Web-sikkerhet
              </Link>
              : SQLi, XSS, CSRF — applikasjonsnivå-angrep som komplement.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
