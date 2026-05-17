import { Link } from "@tanstack/react-router";
import { ArrowLeft, Lightbulb, ShieldCheck, Shield } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { PacketFlowSimulator } from "./PacketFlowSimulator";
import { StatefulConnectionTable } from "./StatefulConnectionTable";
import { NatTranslator } from "./NatTranslator";
import { DmzTopology } from "./DmzTopology";

const STEPS = [
  { title: "Hva brannmuren faktisk gjør", anchor: "intro" },
  { title: "Pakkeflyt — regel-evaluering", anchor: "packet" },
  { title: "Stateful conntrack", anchor: "stateful" },
  { title: "NAT-oversettelse", anchor: "nat" },
  { title: "DMZ-topologi", anchor: "dmz" },
  { title: "Eksamen-typiske spørsmål", anchor: "exam" },
];

export function BrannmurPakkeflytPage() {
  return (
    <StackPageShell title="Brannmur — pakkeflyt og regelmatching" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Brannmur (Kurose 8.9)
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Brannmur — pakkeflyt og regelmatching
          </h1>
          <p className="mt-3 text-muted-foreground">
            En brannmur er en lang if-setning på pakker. Den ser hver pakke,
            sammenligner mot et ordnet sett regler, og slipper inn eller kaster
            ut. Stateful brannmur husker hvilke forbindelser som er etablert;
            stateless ser kun nåværende pakke. NAT skriver om src/dst på vei
            gjennom. DMZ deler nettet i soner.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Pedagogisk kjerne:</span> 8 flashcards
              under <code>topic: Brannmur</code> dekker dette i tekst — her får
              du fire interaktive verktøy som lar deg <em>endre</em> oppsettet og
              se resultatet. Bryt-modus i Stateful-tabellen viser nøyaktig
              hvorfor stateless er sårbar for forfalsket ACK.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2507-brannmur-pakkeflyt" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva brannmuren faktisk gjør</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Hver pakke som passerer gjennom et grensesnitt blir testet mot
              regellisten i rekkefølge. <strong>Første regel som matcher
              vinner</strong> — videre regler ignoreres. Hvis ingen regel
              matcher gjelder <em>default-policy</em>.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                <strong className="text-foreground">ALLOW</strong> — slipp
                pakken gjennom. Forward til mål.
              </li>
              <li>
                <strong className="text-foreground">DROP</strong> — slett
                stille. Avsender får timeout. Best mot port-skann.
              </li>
              <li>
                <strong className="text-foreground">REJECT</strong> — slett +
                send ICMP «Destination Unreachable». Høflig, men avslører at
                vi finnes.
              </li>
              <li>
                <strong className="text-foreground">Default-policy</strong> =
                hva som skjer hvis ingen regel matchet. Sikker konfig er{" "}
                <code>DROP</code>.
              </li>
            </ul>
            <p className="text-xs text-muted-foreground">
              Stateless brannmur sjekker hver pakke isolert (IP, port, flagg).
              Stateful holder en connection-tabell (conntrack) og kan slippe
              gjennom retur-trafikk uten å ha en eksplisitt regel for det.
              Moderne brannmurer (iptables, pfSense, AWS Security Groups) er
              stateful.
            </p>
          </div>
        </section>

        <section id="packet" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Pakkeflyt — regel-evaluering</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Velg en pakke, kjør den gjennom regelkjeden, og se hvilken regel
            som matcher først. Trykk <em>Rediger regler</em> for å bytte
            rekkefølge — den klassiske feilen er at en bred ALLOW-regel kommer
            <em> over</em> en spissere DENY-regel og overstyrer den.
          </p>
          <PacketFlowSimulator />
        </section>

        <section id="stateful" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Stateful conntrack — NEW → ESTABLISHED → CLOSED</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Stateful firewall bygger en tabell over aktive forbindelser. Hver
            handshake-pakke endrer state. Bytt mellom <em>STATEFUL</em> og{" "}
            <em>STATELESS</em> for å se hvordan en forfalsket ACK-pakke fra
            internet behandles ulikt: stateful sjekker at tuppelen finnes i
            tabellen, stateless ser bare på flagg-bits.
          </p>
          <StatefulConnectionTable />
        </section>

        <section id="nat" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. NAT — src/dst-oversettelse</h2>
          <p className="text-sm text-muted-foreground mb-4">
            NAT (Network Address Translation) bytter ut src-IP og src-port på
            pakker som forlater nettet. Mappingen lagres i conntrack-tabellen
            slik at svar-trafikk kan rutes tilbake til riktig intern host. Se
            hva som skjer ved port-kollisjon (PAT) og hairpin-NAT — vanlige
            kilder til <em>«det fungerer ikke»</em>.
          </p>
          <NatTranslator />
        </section>

        <section id="dmz" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. DMZ-topologi — plasser tjenestene</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Demilitarized Zone er sonen mellom internett og indre LAN.
            Eksponerte tjenester bor i DMZ; sensitive systemer bor i LAN. Dra
            de fem tjenestene til riktig sone og valider — feil plassering
            forklares konkret.
          </p>
          <DmzTopology />
        </section>

        <section id="exam" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Eksamen-typiske spørsmål</h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">«Forskjell på stateless og stateful?»</strong>{" "}
              Stateless sjekker hver pakke isolert. Stateful holder
              connection-tabell og slipper automatisk retur-trafikk på
              eksisterende forbindelse uten å trenge eksplisitt regel for
              den retning.
            </li>
            <li>
              <strong className="text-foreground">«Hvorfor er stateless sårbar for ACK-flood?»</strong>{" "}
              En pakke med ACK=1 «ser ut som» del av en pågående forbindelse.
              Stateless slipper den inn fordi regelen «ALLOW inn med ACK=1»
              matcher uten at handshake noensinne har skjedd.
            </li>
            <li>
              <strong className="text-foreground">«DROP vs REJECT?»</strong>{" "}
              DROP: stille kast — avsender får timeout, mindre informasjon
              tilbake. REJECT: kast + ICMP «Unreachable». DROP på
              internet-siden, REJECT internt for raskere feilmeldinger.
            </li>
            <li>
              <strong className="text-foreground">«Hvorfor default-DROP?»</strong>{" "}
              Whitelist-tankegang: bare det vi eksplisitt har lov til, slipper
              gjennom. Default-ACCEPT betyr at ALT vi glemte å filtrere er
              åpent.
            </li>
            <li>
              <strong className="text-foreground">«Hva er DMZ og hvorfor?»</strong>{" "}
              Sone mellom internett og indre LAN. Eksponerte tjenester (web,
              mail) bor i DMZ. Brannmur slipper bare gitte porter inn til DMZ,
              og strengt begrenset trafikk fra DMZ inn til LAN. Et brudd på
              webserveren gir ikke direkte tilgang til DB.
            </li>
            <li>
              <strong className="text-foreground">«Hva er PAT og hvorfor trengs det?»</strong>{" "}
              Port Address Translation. Hvis to interne hoster bruker samme
              src-port mot samme mål, må NAT-en gi minst én av dem en ny
              ekstern src-port — ellers kan svar ikke rutes entydig tilbake.
            </li>
            <li>
              <strong className="text-foreground">«Hva er hairpin-NAT?»</strong>{" "}
              Når en intern host slår opp firmaets eget domene og får den
              offentlige IP-en tilbake, må NAT dobbel-oversette pakken (src og
              dst) for å snu trafikken tilbake til DMZ uten å gå ut på
              internet.
            </li>
            <li>
              <strong className="text-foreground">«Defense in depth?»</strong>{" "}
              Aldri stol på ett forsvars-lag. CDN/anti-DDoS + WAF + LB +
              stateful FW + applikasjons-validering + host-FW + least-privilege
              bruker. Bryter ett — flere står.
            </li>
          </ul>
        </section>

        <div className="rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand" />
            Neste steg
          </h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-stateful-firewall" }} className="text-brand hover:underline">
                Stateful firewall (Kurose Table 8.6/8.8)
              </Link>{" "}
              — bok-tabellens klassifisering pakke-for-pakke.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-nat" }} className="text-brand hover:underline">
                NAT-grunnlag
              </Link>{" "}
              — Kurose 4.3.4, dypere på NAT-tabellen.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-brannmur-vlan" }} className="text-brand hover:underline">
                Brannmur + VLAN
              </Link>{" "}
              — segmentering på L2 og hvordan VLAN samspiller med brannmur.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-ids-snort" }} className="text-brand hover:underline">
                IDS/IPS (Snort)
              </Link>{" "}
              — deteksjon vs prevensjon på samme pakkestrøm.
            </li>
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
        <div className="mt-2 text-[11px] text-muted-foreground inline-flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Disse fire verktøyene dekker visuelt 8 flashcards under{" "}
          <code className="text-[11px]">topic: &quot;Brannmur&quot;</code>.
        </div>
      </div>
    </StackPageShell>
  );
}
