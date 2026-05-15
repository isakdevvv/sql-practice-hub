import { Link } from "@tanstack/react-router";
import { Lightbulb, Quote } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { ArpQuiz } from "./ArpQuiz";
import { ArpVisualizer } from "./ArpVisualizer";

const STEPS = [
  { title: "Interaktiv ARP-visualisering", anchor: "visualisering" },
  { title: "Postadresse vs. personnummer", anchor: "metafor" },
  { title: "MAC-adresser i detalj", anchor: "mac" },
  { title: "ARP-protokollen", anchor: "arp" },
  { title: "ARP-cachen", anchor: "cache" },
  { title: "Quiz: hvilken MAC?", anchor: "quiz" },
  { title: "Cross-subnett: gateway-trikset", anchor: "cross" },
  { title: "Gratuitous ARP og ARP-spoofing", anchor: "spoof" },
  { title: "Eksamen-quick-ref", anchor: "ref" },
];

export function ArpDetektivPage() {
  return (
    <StackPageShell title="ARP-detektiv" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Kurose &amp; Ross 6.4.1 (s. 478–484)
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            ARP-detektiv — postadresse vs. personnummer
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            ARP er broen mellom IP og Ethernet — uten den ville pakker aldri funnet fram til
            riktig nettverkskort. Bokens metafor er treffende: <strong>IP-adresser er som
            postadresser</strong> (hierarkiske, flyttbare, gir mening på avstand), mens{" "}
            <strong>MAC-adresser er som personnummer</strong> (flate, permanente, knyttet til
            personen — eller kortet — uavhengig av hvor du bor).
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#quiz" className="text-brand hover:underline">
                ARP-quizen
              </a>{" "}
              gir tre scenarier — same-subnett, cross-subnett (Kurose fig. 6.19) og selve
              ARP-broadcasten — der du må velge riktig destinasjons-MAC.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-arp-detektiv" steps={STEPS} />

        <section id="visualisering" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">0. Interaktiv ARP-visualisering</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Fire hoster (A, B, C, D) på samme subnett, koblet via en switch. Velg et
            scenario og se hvordan ARP-spørringer kringkastes, hvordan svar er unicast,
            og hva som skjer når en angriper løyver. Spill av automatisk eller stepp
            gjennom ett hopp om gangen — og følg med på cachene som oppdaterer seg.
          </p>
          <ArpVisualizer />
        </section>

        <section id="metafor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Postadresse vs. personnummer</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                  IP-adresse — postadressen
                </div>
                <ul className="space-y-1 list-disc pl-5">
                  <li><strong>Hierarkisk</strong> — landsdel/by/gate/husnummer.</li>
                  <li><strong>Flyttbar</strong> — bytt subnett, bytt IP.</li>
                  <li><strong>Logisk</strong> — gir routing globalt.</li>
                  <li><strong>Lengde</strong>: 32 bit (IPv4), 128 (IPv6).</li>
                </ul>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                  MAC-adresse — personnummeret
                </div>
                <ul className="space-y-1 list-disc pl-5">
                  <li><strong>Flat</strong> — ingen struktur som røper plassering.</li>
                  <li><strong>Permanent</strong> — brent inn i NIC fra fabrikk.</li>
                  <li><strong>Lokal</strong> — meningsfull bare innenfor ÉN link.</li>
                  <li><strong>Lengde</strong>: 48 bit (6 bytes), f.eks. <span className="font-mono">00:1A:2B:3C:4D:5E</span>.</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm flex items-start gap-3">
            <Quote className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div>
              <p className="italic leading-relaxed">
                «An ARP query is equivalent to a person shouting out in a crowded room:
                ‘What is the social security number of the person whose postal address is
                Cubicle 13?’»
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Kurose &amp; Ross, 8. utg., s. 482
              </p>
            </div>
          </div>
        </section>

        <section id="mac" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. MAC-adresser i detalj</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            En MAC-adresse er 6 bytes / 48 bit, vanligvis skrevet som seks
            tohex-grupper. Første tre bytes er <em>OUI</em> (Organizationally Unique
            Identifier) — produsenten av nettkortet. IEEE administrerer registeret.
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>
              <span className="font-mono">00:1A:2B:3C:4D:5E</span> — første tre bytes
              identifiserer produsenten (her bare et eksempel).
            </li>
            <li>
              <span className="font-mono">FF:FF:FF:FF:FF:FF</span> —{" "}
              <strong>broadcast</strong>: «alle på linken», brukes av ARP-spørringer.
            </li>
            <li>
              Bit 0 av første byte er <em>multicast</em>-flagg; bit 1 er{" "}
              <em>locally administered</em>. Moderne OS roterer ofte den bit-en for
              privacy (random MAC).
            </li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Når en ramme ankommer en NIC, sjekker kortet om destinasjons-MAC er
            <em> egen MAC</em> eller <em>broadcast</em>. Hvis ikke — droppes rammen før
            CPUen forstyrres. Det er hardware-filter.
          </p>
        </section>

        <section id="arp" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. ARP-protokollen — i fire trinn</h2>
          <ol className="text-sm space-y-1.5 list-decimal pl-5">
            <li>
              Host A skal sende til IP X på samme subnett. A sjekker sin{" "}
              <strong>ARP-cache</strong>: har jeg X.mac? Hvis ja → skip til 4.
            </li>
            <li>
              Hvis ikke: A bygger en <strong>ARP-forespørsel</strong> «Hvem har IP X?
              Send svar til min MAC». Kringkastes med dest-MAC ={" "}
              <span className="font-mono">FF:FF:FF:FF:FF:FF</span>.
            </li>
            <li>
              Alle på subnettet ser den. Bare hosten med IP X svarer (unicast tilbake til
              A) med sin egen MAC: <strong>ARP-svar</strong>.
            </li>
            <li>
              A lagrer X.ip → X.mac i ARP-cachen og bygger nå Ethernet-rammen med{" "}
              X.mac som destinasjon.
            </li>
          </ol>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">Viktig:</strong>{" "}
            ARP-meldinger krysser <em>aldri</em> en router. ARP er per-link. Det betyr at
            for cross-subnett-trafikk må A i stedet ARP-e <strong>gateway-routerens</strong>{" "}
            IP — ikke destinasjonens.
          </div>
        </section>

        <section id="cache" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. ARP-cachen</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Hver host har en ARP-tabell: IP → MAC, med en{" "}
            <strong>aging-timer</strong> (typisk 20 minutter). Etter timeren utløper,
            slettes oppføringen. Neste gang den IP-en trengs, ny ARP-spørring.
          </p>
          <div className="rounded-lg border border-border bg-background overflow-hidden">
            <div className="bg-muted/30 px-3 py-2 text-xs font-mono text-muted-foreground">
              $ arp -a
            </div>
            <pre className="p-3 text-[12px] leading-relaxed font-mono overflow-x-auto">{`? (192.168.1.1)  at d8:c4:97:11:22:33 [ether] on eth0      <- gateway
? (192.168.1.20) at bb:bb:bb:bb:bb:bb [ether] on eth0      <- nabohost
? (192.168.1.30) at <incomplete> on eth0                   <- ingen svar
`}</pre>
          </div>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            <code className="font-mono text-[11px]">arp -a</code> (Linux/macOS) eller{" "}
            <code className="font-mono text-[11px]">arp -a</code> (Windows) viser cachen.{" "}
            <code className="font-mono text-[11px]">ip neigh</code> er moderne Linux-versjon.
          </p>
        </section>

        <section id="quiz" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Quiz — hvilken MAC?</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Tre scenarier. For hver: hvilken destinasjons-MAC ligger i Ethernet-rammen?
            Tenk gjennom det FØR du klikker.
          </p>
          <ArpQuiz />
        </section>

        <section id="cross" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Cross-subnett — gateway-trikset</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Dette er kjernen i Kurose fig. 6.19. Når Host A på Subnet 1 sender til Host C
            på Subnet 2, ser pakkens hoder slik ut på de to linkene:
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Hop</th>
                  <th className="text-left font-semibold px-4 py-2">Src/Dst IP</th>
                  <th className="text-left font-semibold px-4 py-2">Src/Dst MAC</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">A → router (Subnet 1)</td>
                  <td className="px-4 py-3 font-mono text-[12px]">A.ip → C.ip</td>
                  <td className="px-4 py-3 font-mono text-[12px]">A.mac → R1.mac</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">router → C (Subnet 2)</td>
                  <td className="px-4 py-3 font-mono text-[12px]">A.ip → C.ip</td>
                  <td className="px-4 py-3 font-mono text-[12px]">R2.mac → C.mac</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            <strong>IP-headeren endres ikke</strong> — A.ip og C.ip er fast hele veien.{" "}
            <strong>MAC-headeren skiftes per hop</strong> — det er linklags-jobb. Routeren
            ARP-er C på sitt Subnet 2-interface, putter på ny MAC-header, sender videre.
          </p>
        </section>

        <section id="spoof" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Gratuitous ARP og ARP-spoofing</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            <strong>Gratuitous ARP</strong> er en ARP-melding du sender om{" "}
            <em>din egen IP</em> — uten at noen spurte. Brukes for to legitime grunner:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>
              <strong>IP-konflikt-deteksjon</strong> ved oppstart: «Hvem har 192.168.1.10?»
              Hvis noen svarer, har du krasjet med en eksisterende vert.
            </li>
            <li>
              <strong>Cache-oppdatering</strong>: når en host bytter NIC eller failover
              skjer, fortelle alle naboer at IP X nå har ny MAC.
            </li>
          </ul>
          <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm">
            <strong className="text-red-600 dark:text-red-400">Mørk side: ARP-spoofing.</strong>{" "}
            Siden ARP er uten autentisering, kan en angriper sende falske svar:{" "}
            «192.168.1.1 har MAC AA:AA:AA:AA:AA:AA» — egentlig sin egen MAC. All trafikk
            til gateway-en pekes nå mot angriperen, som kan sniffe eller modifisere
            (man-in-the-middle). Forsvar: dynamic ARP inspection på switch, statiske ARP-
            entries på kritiske noder.
          </div>
        </section>

        <section id="ref" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">8. Eksamen-quick-ref</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Spørsmål</th>
                  <th className="text-left font-semibold px-4 py-2">Svar</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">MAC-lengde</td>
                  <td className="px-4 py-2">48 bit / 6 bytes.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Broadcast-MAC</td>
                  <td className="px-4 py-2 font-mono">FF:FF:FF:FF:FF:FF</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">ARP-spørring sendes til</td>
                  <td className="px-4 py-2">Broadcast-MAC, alle på subnettet.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">ARP-svar sendes til</td>
                  <td className="px-4 py-2">Unicast — direkte tilbake til spørreren.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Krysser ARP routere?</td>
                  <td className="px-4 py-2">Nei. ARP er per-link.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Cross-subnett: dest-MAC?</td>
                  <td className="px-4 py-2">Gateway-routerens MAC, ikke destinasjonens.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Endres IP-headeren per hop?</td>
                  <td className="px-4 py-2">Nei (vanligvis). MAC-headeren skiftes hver hop.</td>
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
              <Link to="/stack/$slug" params={{ slug: "dte2507-switch-self-learning" }} className="text-brand hover:underline">Switchen husker hvem du så snakke</Link>
              {" "}— neste tema fra linklaget.
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
