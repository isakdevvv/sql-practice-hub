import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Mermaid } from "@/components/Mermaid";
import { DnsLookupSim } from "./DnsLookupSim";

const STEPS = [
  { title: "DNS-hierarkiet", anchor: "hierarki" },
  { title: "Iterative vs recursive", anchor: "modes" },
  { title: "Resource Records (RR)", anchor: "rr" },
  { title: "Caching og TTL", anchor: "cache" },
  { title: "Lookup-simulator", anchor: "sim" },
  { title: "Cache-poisoning", anchor: "poison" },
  { title: "DNSSEC", anchor: "dnssec" },
  { title: "DoH og DoT", anchor: "doh-dot" },
  { title: "Eksamen-quick-ref", anchor: "ref" },
];

const HIERARKI_MMD = `graph TD
  R[". (root)<br/>13 root-NS, anycast"] --> NO[".no TLD-NS<br/>Norid"]
  R --> COM[".com TLD-NS<br/>Verisign"]
  R --> ORG[".org TLD-NS"]
  NO --> UIT["uit.no<br/>autoritativ NS"]
  NO --> KAHOOT["kahoot.no<br/>autoritativ NS"]
  COM --> GOOGLE["google.com<br/>autoritativ NS"]
  UIT --> WWWUIT["www.uit.no<br/>A record: 129.242.20.1"]
  UIT --> MAILUIT["mail.uit.no<br/>MX record"]
  KAHOOT --> WWWKA["www.kahoot.no<br/>A record"]
  GOOGLE --> WWWGOOG["www.google.com<br/>A + AAAA"]`;

export function DnsDypPage() {
  return (
    <StackPageShell title="DNS-dyp" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Kurose &amp; Ross 2.4, RFC 1034/1035
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            DNS-dyp — fra navn til IP, og hvorfor det er trygt (eller ikke)
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Å skrive <code className="font-mono text-[12px]">www.uit.no</code> i nettleseren
            er ikke ett nettverkskall — det er en kjede oppslag mot et globalt distribuert
            hierarki. Vi følger pakken fra klient til autoritativ NS, ser hvordan caching
            sparer 95 % av rundene, og hva DNSSEC/DoH/DoT egentlig sikrer.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#sim" className="text-brand hover:underline">DNS-lookup-simulatoren</a>{" "}
              viser sekvensen som Mermaid-diagram + cache-effekt over tid.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-dns-dyp" steps={STEPS} />

        <section id="hierarki" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. DNS-hierarkiet</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            DNS er et tre. Roten er bare «<code>.</code>» (skjult i de fleste verktøy). Under
            ligger Top-Level Domains (TLD): <code>.no</code>, <code>.com</code>,{" "}
            <code>.org</code>, geografiske og generiske. Under hver TLD ligger de registrerte
            domenene — og hvert domene har sin egen <strong>autoritative</strong> name-server.
          </p>
          <div className="rounded-xl border border-border bg-card p-3 overflow-x-auto">
            <Mermaid chart={HIERARKI_MMD} />
          </div>
          <ul className="mt-3 text-sm space-y-1 list-disc pl-5 text-muted-foreground">
            <li><strong>13 root-NS</strong> (A-M), anycastet på hundrevis av servere globalt.</li>
            <li><strong>TLD-NS</strong> driftes av registry — <em>Norid</em> for <code>.no</code>, <em>Verisign</em> for <code>.com</code>.</li>
            <li><strong>Autoritativ NS</strong> for ditt domene — du peker dit i din registrar.</li>
            <li><strong>Resolveren</strong> (rekursiv NS) gjør oppslagene for deg — eks. 1.1.1.1, 8.8.8.8, ISPens egen.</li>
          </ul>
        </section>

        <section id="modes" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Iterative vs recursive</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Recursive query
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Klienten ber resolveren: <em>«gi meg svaret, jeg venter»</em>. Resolveren
                kjører alle ledd selv — klienten ser bare slutt-svaret. Dette er normalen for
                <strong> klient → resolver</strong>.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Iterative query
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Resolveren spør root, får «prøv .no-NS-ene», spør dem, får referral til
                <code>ns.uit.no</code>, spør den, får svar. Hvert ledd er et eget round-trip.
                Dette er normalen for <strong>resolver → autoritative NS-er</strong>.
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">Felle:</strong> Autoritative
            NS-er svarer <em>aldri</em> rekursivt. De vet bare om sin egen sone. Resolveren
            må iterativt hoppe i hierarkiet.
          </div>
        </section>

        <section id="rr" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Resource Record-typer</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-20">Type</th>
                  <th className="text-left font-semibold px-4 py-2 w-44">Returnerer</th>
                  <th className="text-left font-semibold px-4 py-2">Brukes til</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">A</td>
                  <td className="px-4 py-3 font-mono">IPv4-adresse</td>
                  <td className="px-4 py-3 text-muted-foreground">Vanlig navn → IP</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">AAAA</td>
                  <td className="px-4 py-3 font-mono">IPv6-adresse</td>
                  <td className="px-4 py-3 text-muted-foreground">Som A, men for IPv6 («quad-A»)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">CNAME</td>
                  <td className="px-4 py-3 font-mono">Canonical name</td>
                  <td className="px-4 py-3 text-muted-foreground">Alias: <code>www → example.com</code></td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">MX</td>
                  <td className="px-4 py-3 font-mono">Mail eXchanger + prio</td>
                  <td className="px-4 py-3 text-muted-foreground">Hvem skal motta e-post for domenet</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">NS</td>
                  <td className="px-4 py-3 font-mono">Name Server</td>
                  <td className="px-4 py-3 text-muted-foreground">Hvilken NS er autoritativ for domenet</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">TXT</td>
                  <td className="px-4 py-3 font-mono">Tekststreng</td>
                  <td className="px-4 py-3 text-muted-foreground">SPF, DKIM, domain verification</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">PTR</td>
                  <td className="px-4 py-3 font-mono">Domene</td>
                  <td className="px-4 py-3 text-muted-foreground">Reverse DNS: IP → navn (in-addr.arpa)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">SOA</td>
                  <td className="px-4 py-3 font-mono">Start of Authority</td>
                  <td className="px-4 py-3 text-muted-foreground">Sone-metadata: serial, refresh, default-TTL</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            Sjekk RR-er fra terminal: <code className="font-mono text-[11px]">dig www.uit.no A</code>,
            <code className="font-mono text-[11px]"> dig +trace uit.no</code> (følger hele kjeden),
            <code className="font-mono text-[11px]"> dig MX uit.no</code>.
          </p>
        </section>

        <section id="cache" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Caching og TTL</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Hver RR har et <strong>TTL</strong> (Time To Live, sekunder). Når en resolver får
            svar, lagrer den det i RAM til TTL utløper. Det er grunnen til at globale DNS-endringer
            tar tid å «slå inn» — gamle svar lever i cacher rundt om i verden til TTL er ute.
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Typisk TTL</th>
                  <th className="text-left font-semibold px-4 py-2">Når brukes det</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">30–60 sek</td>
                  <td className="px-4 py-3 text-muted-foreground">CDN-er, dynamisk geo-balancing (Akamai, Cloudflare)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">300 sek (5 min)</td>
                  <td className="px-4 py-3 text-muted-foreground">Like før migrering — sett ned i forkant</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">3600 sek (1 t)</td>
                  <td className="px-4 py-3 text-muted-foreground">Vanlig for stabile A-records</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">86400 sek (1 d)</td>
                  <td className="px-4 py-3 text-muted-foreground">NS- og MX-records som sjelden endres</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            Hierarkisk caching: klient (stub-resolver i OS) → ISPens rekursive resolver → root/TLD/auth.
            De fleste resolverne har 90 %+ hit rate på populære domener, så ekte trip til root skjer
            sjelden.
          </p>
        </section>

        <section id="sim" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Lookup-simulator</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Kjør samme domene to ganger — andre gang er cache-hit. Tøm cache for å starte
            forfra. RTT-grafen viser ~120 ms ved miss, ~5 ms ved hit.
          </p>
          <DnsLookupSim />
        </section>

        <section id="poison" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. DNS-cache-poisoning</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Klassisk: DNS-spørringer over UDP, ingen autentisering. En angriper kan
            <em> race</em> et falskt svar til resolveren før det ekte. Hvis svaret aksepteres,
            cacher resolveren det — alle som spør senere får angriperens IP. Kjent som
            <strong> Kaminsky-angrepet</strong> (2008).
          </p>
          <div className="rounded-xl border border-border bg-card p-5 text-sm">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Forsvar (uten DNSSEC)
            </div>
            <ul className="space-y-1 list-disc pl-5">
              <li><strong>Random source port</strong> (var fast tidligere — gjorde gjettingen lett).</li>
              <li><strong>Random transaction ID</strong> (16-bit, må matche).</li>
              <li><strong>0x20 encoding</strong> — bland store/små bokstaver i query, må returneres uendret.</li>
              <li>Disse kombineres til ~2³² entropi — ikke umulig å brute-force på fete linker uten DNSSEC.</li>
            </ul>
          </div>
        </section>

        <section id="dnssec" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. DNSSEC — kryptografisk signerte records</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            DNSSEC legger digitale signaturer på alle records. Hvert sone-nivå signerer sine
            records med sin <strong>ZSK</strong> (Zone Signing Key), og roten-NS signerer en
            <strong> KSK</strong> (Key Signing Key) som du <em>må</em> stole på.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Chain of trust
            </div>
            <pre className="font-mono text-[11px] whitespace-pre overflow-x-auto leading-relaxed">{`Root KSK  (hardcodet i resolveren / trust anchor)
   │ signerer
   ▼
.no DS-record i root (peker til .no's KSK)
   │ verifiserer
   ▼
.no zone har sin egen KSK → ZSK → signerer A-records for uit.no's DS
   │
   ▼
uit.no zone har KSK → ZSK → signerer A www.uit.no = 129.242.20.1

Resolveren validerer hele kjeden bottom-up.
Hvis ett ledd feiler → SERVFAIL (ikke det falske svaret).`}</pre>
          </div>
          <ul className="mt-3 text-sm space-y-1 list-disc pl-5 text-muted-foreground">
            <li><strong>Nye RR-typer:</strong> RRSIG (signatur), DNSKEY (nøkkel), DS (delegation signer), NSEC/NSEC3 (signert «finnes ikke»-svar).</li>
            <li><strong>Beskytter mot:</strong> cache-poisoning, falske svar. Garanterer integritet og autentisitet.</li>
            <li><strong>Beskytter IKKE mot:</strong> konfidensialitet — svaret er fortsatt synlig (cleartext).</li>
            <li><strong>Utbredelse:</strong> .no har 60 %+ signert; .com langt mindre. Resolvere som validerer: ~30 % globalt.</li>
          </ul>
        </section>

        <section id="doh-dot" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. DoH og DoT — krypter selve DNS-trafikken</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Tradisjonell DNS over UDP/53 er <em>cleartext</em>. Din ISP (og hvem som helst på
            samme nett) ser hvilke domener du slår opp. Det fins to løsninger:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                DoT — DNS over TLS
              </div>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li>Port <span className="font-mono">853</span>.</li>
                <li>Direkte TLS-wrapping av DNS-protokollen.</li>
                <li>Enkelt for nettverks-admin å se («det er DNS-trafikk» — men kryptert innhold).</li>
                <li>Standard: RFC 7858 (2016).</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                DoH — DNS over HTTPS
              </div>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li>Port <span className="font-mono">443</span>.</li>
                <li>DNS-meldinger pakket i HTTPS-requests.</li>
                <li>Vanskelig å skille fra vanlig web-trafikk (kontroversielt — blokkerer ikke admin).</li>
                <li>Standard: RFC 8484. Cloudflare 1.1.1.1, Google 8.8.8.8, Quad9 9.9.9.9 støtter alle.</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">DoH ≠ DNSSEC.</strong> DoH
            krypterer <em>kanalen</em> mellom klient og resolver. DNSSEC autentiserer
            <em> svaret</em> over hele kjeden. Bruk dem sammen — de løser ulike problemer.
          </div>
        </section>

        <section id="ref" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">9. Eksamen-quick-ref</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Teknologi</th>
                  <th className="text-left font-semibold px-4 py-2 w-32">Port</th>
                  <th className="text-left font-semibold px-4 py-2">Beskytter mot</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">DNS (klassisk)</td>
                  <td className="px-4 py-3 font-mono">UDP 53 (TCP for &gt;512 B)</td>
                  <td className="px-4 py-3 text-muted-foreground">Ingenting — cleartext, ingen sig</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">DNSSEC</td>
                  <td className="px-4 py-3 font-mono">UDP/TCP 53</td>
                  <td className="px-4 py-3 text-muted-foreground">Cache-poisoning, falske svar</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">DoT</td>
                  <td className="px-4 py-3 font-mono">TCP 853</td>
                  <td className="px-4 py-3 text-muted-foreground">Avlytting på kanalen klient↔resolver</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">DoH</td>
                  <td className="px-4 py-3 font-mono">TCP 443</td>
                  <td className="px-4 py-3 text-muted-foreground">Avlytting + blokk-detect av DNS-trafikk</td>
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
              <Link to="/stack/$slug" params={{ slug: "tls" }} className="text-brand hover:underline">TLS-håndtrykk</Link>
              {" "}— DoT/DoH bygger på TLS.
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
