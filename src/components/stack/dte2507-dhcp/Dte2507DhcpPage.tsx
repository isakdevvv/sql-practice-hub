import { Link } from "@tanstack/react-router";
import { Lightbulb, Radio, Server, Quote } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { DhcpDoraFlow } from "./DhcpDoraFlow";
import { DhcpDrill } from "./DhcpDrill";

const STEPS = [
  { title: "Problemet — null kunnskap", anchor: "problem" },
  { title: "DORA-flyten (simulator)", anchor: "dora" },
  { title: "Lease-konseptet", anchor: "lease" },
  { title: "Hvorfor broadcast?", anchor: "broadcast" },
  { title: "Drill: hvorfor-spørsmål", anchor: "drill" },
  { title: "Eksamen-quick-ref", anchor: "ref" },
];

export function Dte2507DhcpPage() {
  return (
    <StackPageShell title="DHCP DORA" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Kurose &amp; Ross 4.3.3 (s. 376–380)
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            DHCP — Discover, Offer, Request, Ack
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            En vert som nettopp er plugget inn vet ingenting. Den har en{" "}
            <strong>MAC-adresse</strong> brent inn fra fabrikken, men ingen IP,
            ingen gateway, ingen DNS-server. Hele bootstrap-problemet løses av
            fire pakker som kalles <strong>DORA</strong>: Discover, Offer,
            Request, Ack. Alle fire er broadcasts på linklaget — og det er
            ingen tilfeldighet.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#dora" className="text-brand hover:underline">
                Start tilkoblings-simulatoren
              </a>{" "}
              for å se en helt fersk klient gå fra <span className="font-mono">0.0.0.0</span>{" "}
              til en gyldig lease på fire pakker.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-dhcp" steps={STEPS} />

        {/* 1. Problem */}
        <section id="problem" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            1. Problemet — null kunnskap, men trenger en plass å bo
          </h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Tenk på det fra klientens ståsted. Du har akkurat slått på maskinen
            og koblet til et trådløst nett du aldri har sett før. Hva vet du?
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold mb-2">
                  Det du HAR
                </div>
                <ul className="space-y-1 list-disc pl-5">
                  <li>
                    En <strong>MAC-adresse</strong> på nettkortet (brent inn,
                    bytes 1-6 av Ethernet-rammen).
                  </li>
                  <li>
                    Mulighet til å sende og motta Ethernet-rammer på linken.
                  </li>
                  <li>Kunnskap om DHCP-protokollens regler i OS-stacken.</li>
                </ul>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-red-600 dark:text-red-400 font-semibold mb-2">
                  Det du IKKE har
                </div>
                <ul className="space-y-1 list-disc pl-5">
                  <li>
                    Ingen <strong>IP-adresse</strong> (kan ikke source noen
                    L3-pakke).
                  </li>
                  <li>
                    Ingen <strong>subnettmaske</strong> (vet ikke hvem som er
                    «på samme nett»).
                  </li>
                  <li>
                    Ingen <strong>default gateway</strong> (vet ikke hvor
                    trafikk ut skal sendes).
                  </li>
                  <li>
                    Ingen <strong>DNS-server</strong> (kan ikke slå opp navn).
                  </li>
                  <li>
                    <strong>Ingen anelse</strong> om at en DHCP-server finnes
                    på linken — eller hvilken IP den har.
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Hele utgangspunktet former protokollen: alt klienten kan gjøre er å{" "}
            <strong>rope ut i mørket</strong> via L2-broadcast. Først NÅR
            klienten har fått en gyldig IP fra DHCP, kan den begynne å bruke
            vanlige unicast L3-protokoller.
          </p>
          <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm flex items-start gap-3">
            <Quote className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div>
              <p className="italic leading-relaxed">
                «DHCP allows a host to obtain (be allocated) an IP address
                automatically. […] Because of DHCP's ability to automate the
                network-related aspects of connecting a host into a network,
                it is often referred to as a plug-and-play or zeroconf
                (zero-configuration) protocol.»
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Kurose &amp; Ross, 8. utg., s. 376
              </p>
            </div>
          </div>
        </section>

        {/* 2. DORA-flyt (interaktiv) */}
        <section id="dora" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            2. DORA-flyten — 4 pakker
          </h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Trykk <strong>Start tilkobling</strong>. Hver fane viser én av de
            fire pakkene med eksakte src/dst-adresser og en forklaring av
            HVORFOR den ser ut som den gjør. Lease-tabellen til høyre viser
            serverens interne tilstand.
          </p>
          <DhcpDoraFlow />
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">
              Merk:
            </strong>{" "}
            Begrepet «Offer» og «Ack» i RFC 2131 sendes teknisk sett som
            broadcast (255.255.255.255). De KAN sendes som unicast hvis
            klienten setter en spesifikk flag (broadcast-bit = 0) og serveren
            klarer å sende på MAC-nivå uten en gyldig ARP-oppføring. I praksis
            er broadcast den vanlige stien — det er det bokens
            referansediagram (fig. 4.24) bruker.
          </div>
        </section>

        {/* 3. Lease */}
        <section id="lease" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Lease-konseptet</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            DHCP gir IKKE klienten en IP for evig. Den gir en{" "}
            <strong>lease</strong> — et leieforhold med utløpsdato.
            Lease-tiden er valgt av serveradministratoren: typisk 24 timer på
            hjemmenett, 8 timer på kontor, 1 time eller mindre på trådløse
            gjestenett.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">
                    Timer
                  </th>
                  <th className="text-left font-semibold px-4 py-2">
                    Når den slår til
                  </th>
                  <th className="text-left font-semibold px-4 py-2">
                    Hva klienten gjør
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">T1</td>
                  <td className="px-4 py-3">50 % av lease (12t av 24t).</td>
                  <td className="px-4 py-3">
                    Sender DHCPREQUEST <strong>unicast</strong> til den
                    opprinnelige serveren for å fornye. Server-ID-en er kjent
                    fra ACK.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">T2</td>
                  <td className="px-4 py-3">87,5 % av lease (21t av 24t).</td>
                  <td className="px-4 py-3">
                    Hvis fornyelse ikke lyktes: klienten faller tilbake til{" "}
                    <strong>broadcast</strong> REQUEST — «hvilken som helst
                    server, vær så snill ta over».
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">100 %</td>
                  <td className="px-4 py-3">Lease utløper.</td>
                  <td className="px-4 py-3">
                    Klient mister IP-en og må starte hele DORA-prosessen på
                    nytt fra Discover.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            På serversiden er lease-tabellen sannheten om hvilke IP-er som er
            i bruk. Når en lease utløper og ikke fornyes, går IP-en tilbake i
            poolen og kan tildeles en annen klient.
          </p>
        </section>

        {/* 4. Hvorfor broadcast */}
        <section id="broadcast" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            4. Hvorfor MÅ alle 4 pakker være broadcast?
          </h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Dette er kjernen i hvorfor DHCP ser ut som det gjør. Hver av de
            fire pakkene har sin egen grunn:
          </p>
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-card p-4 flex items-start gap-3">
              <Radio className="h-4 w-4 text-brand mt-0.5 shrink-0" />
              <div className="text-sm">
                <div className="font-semibold">
                  Discover — fordi klienten har null kunnskap
                </div>
                <p className="mt-1 text-muted-foreground leading-relaxed">
                  Ingen IP, ingen server-IP, ingen viten om at en server
                  eksisterer. Eneste mulighet er å rope ut til alle på linken
                  via <span className="font-mono">255.255.255.255</span> +{" "}
                  <span className="font-mono">FF:FF:FF:FF:FF:FF</span>.
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 flex items-start gap-3">
              <Server className="h-4 w-4 text-brand mt-0.5 shrink-0" />
              <div className="text-sm">
                <div className="font-semibold">
                  Offer — fordi klienten fortsatt ikke har IP
                </div>
                <p className="mt-1 text-muted-foreground leading-relaxed">
                  Serveren har en IP, og kjenner klientens MAC fra
                  Discover-rammen. Men klienten har enda ingen IP å motta L3-
                  trafikk på. Serveren broadcaster Offer slik at klienten kan
                  fange den på sin MAC + matche transaction-id (xid).
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 flex items-start gap-3">
              <Radio className="h-4 w-4 text-brand mt-0.5 shrink-0" />
              <div className="text-sm">
                <div className="font-semibold">
                  Request — for å koordinere mellom flere servere
                </div>
                <p className="mt-1 text-muted-foreground leading-relaxed">
                  På et nett med to DHCP-servere får klienten to OFFER.
                  Request inneholder feltet «server-identifier». Begge
                  serverne ser broadcasten: den valgte serveren går videre med
                  ACK, taperserverne <strong>frigjør</strong> sine reserverte
                  IP-er.
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 flex items-start gap-3">
              <Server className="h-4 w-4 text-brand mt-0.5 shrink-0" />
              <div className="text-sm">
                <div className="font-semibold">
                  Ack — bekreftelse før klienten har konfigurert stacken
                </div>
                <p className="mt-1 text-muted-foreground leading-relaxed">
                  Selv etter Request har ikke OS-stacken aktivert IP-en enda
                  (klienten venter bekreftelsen). Broadcast holder samme
                  «alle-kan-høre»-modus til konfigurasjonen er ferdig.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Drill */}
        <section id="drill" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Drill — hvorfor-spørsmål</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Fire spørsmål som tester at du forstår motivasjonen bak DORA.
            Tenk gjennom hver før du klikker.
          </p>
          <DhcpDrill />
        </section>

        {/* 6. Quick-ref */}
        <section id="ref" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">6. Eksamen-quick-ref</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2">Pakke</th>
                  <th className="text-left font-semibold px-3 py-2 font-mono">
                    src IP
                  </th>
                  <th className="text-left font-semibold px-3 py-2 font-mono">
                    dst IP
                  </th>
                  <th className="text-left font-semibold px-3 py-2 font-mono">
                    UDP
                  </th>
                  <th className="text-left font-semibold px-3 py-2">Hvem</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-semibold">DISCOVER</td>
                  <td className="px-3 py-2 font-mono">0.0.0.0</td>
                  <td className="px-3 py-2 font-mono">255.255.255.255</td>
                  <td className="px-3 py-2 font-mono">68 → 67</td>
                  <td className="px-3 py-2">Klient → alle</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-semibold">OFFER</td>
                  <td className="px-3 py-2 font-mono">server-ip</td>
                  <td className="px-3 py-2 font-mono">255.255.255.255</td>
                  <td className="px-3 py-2 font-mono">67 → 68</td>
                  <td className="px-3 py-2">Server → klient (bcast)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-semibold">REQUEST</td>
                  <td className="px-3 py-2 font-mono">0.0.0.0</td>
                  <td className="px-3 py-2 font-mono">255.255.255.255</td>
                  <td className="px-3 py-2 font-mono">68 → 67</td>
                  <td className="px-3 py-2">Klient → alle (bcast)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-semibold">ACK</td>
                  <td className="px-3 py-2 font-mono">server-ip</td>
                  <td className="px-3 py-2 font-mono">255.255.255.255</td>
                  <td className="px-3 py-2 font-mono">67 → 68</td>
                  <td className="px-3 py-2">Server → klient (bcast)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-5 overflow-x-auto rounded-lg border border-border">
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
                    Hvor mange pakker i DORA?
                  </td>
                  <td className="px-4 py-2">
                    4 — Discover, Offer, Request, Ack.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">
                    Hvorfor Discover broadcast?
                  </td>
                  <td className="px-4 py-2">
                    Klienten har ingen IP og kjenner ikke serveren.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">
                    Hvorfor Request broadcast?
                  </td>
                  <td className="px-4 py-2">
                    Slik at TAPENDE servere frigjør IP-en de tilbød.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">UDP-porter</td>
                  <td className="px-4 py-2">
                    Server lytter på 67. Klient lytter på 68.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">T1 / T2</td>
                  <td className="px-4 py-2">
                    50 % renewal (unicast). 87,5 % rebinding (broadcast).
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">
                    Krysser DHCP routere?
                  </td>
                  <td className="px-4 py-2">
                    Nei direkte (broadcast). En DHCP-relay-agent kan re-pakke
                    og videresende som unicast på tvers av subnett.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">
                    Forutsetninger
                  </td>
                  <td className="px-4 py-2">
                    Atom 8 (MAC) og atom 13 (IPv4-adressen) — du må kjenne
                    begge før DHCP gir mening.
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
                params={{ slug: "dte2507-arp-detektiv" }}
                className="text-brand hover:underline"
              >
                ARP-detektiv
              </Link>{" "}
              — broen mellom IP og MAC. Klikker fint mot DHCP.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2507-day-in-the-life" }}
                className="text-brand hover:underline"
              >
                A Day in the Life
              </Link>{" "}
              — DHCP er steg 1–4 av 24 i Kurose-crescendoen.
            </li>
            <li>
              <Link to="/cards" className="text-brand hover:underline">
                Repetisjonskort
              </Link>{" "}
              under emnet «DTE-2507».
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}
