import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  FolderOpen,
  ExternalLink,
} from "lucide-react";
import { SectionPager, type SectionNavItem } from "./SectionPager";

type Tab = "intro" | "4.1" | "4.2" | "4.3" | "4.4" | "4.5" | "4.6" | "4.7" | "4.8";


const SECTIONS_4: SectionNavItem[] = [
  { id: "intro", label: "Start her" },
  { id: "4.1", label: "4.1 Overview" },
  { id: "4.2", label: "4.2 Inni en ruter" },
  { id: "4.3", label: "4.3 IPv4" },
  { id: "4.4", label: "4.4 Subnetting & CIDR" },
  { id: "4.5", label: "4.5 NAT" },
  { id: "4.6", label: "4.6 SDN" },
  { id: "4.7", label: "4.7 IPv6" },
  { id: "4.8", label: "4.8 Oppgaver" },
];
const NEXT_CHAPTER_4 = { slug: "kurose-kap-5", title: "Nettverkslaget — control-plane" };

export function KuroseKap4Page() {
  const [tab, setTab] = useState<Tab>("intro");
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-4 max-w-6xl">
        <header className="mb-3"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <a href="/stack/dte-2507" className="inline-flex items-center gap-1 hover:text-foreground"><FolderOpen className="h-3 w-3" /> DTE-2507</a>
            <span>·</span>
            <a
              href="/stack/kurose-kurs"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <FolderOpen className="h-3 w-3" /> Kurose-kurset
            </a>
            <span>·</span>
            <span>Kapittel 4 av 9</span>
          </div><h1 className="text-2xl font-bold tracking-tight">Kap. 4 — Nettverkslaget: data-plane</h1></header>

        <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border">
          <TabBtn active={tab === "intro"} onClick={() => setTab("intro")}>
            Start her
          </TabBtn>
          <TabBtn active={tab === "4.1"} onClick={() => setTab("4.1")}>
            4.1 Overview
          </TabBtn>
          <TabBtn active={tab === "4.2"} onClick={() => setTab("4.2")}>
            4.2 Inni en ruter
          </TabBtn>
          <TabBtn active={tab === "4.3"} onClick={() => setTab("4.3")}>
            4.3 IPv4
          </TabBtn>
          <TabBtn active={tab === "4.4"} onClick={() => setTab("4.4")}>
            4.4 Subnetting &amp; CIDR
          </TabBtn>
          <TabBtn active={tab === "4.5"} onClick={() => setTab("4.5")}>
            4.5 NAT
          </TabBtn>
          <TabBtn active={tab === "4.6"} onClick={() => setTab("4.6")}>
            4.6 SDN
          </TabBtn>
          <TabBtn active={tab === "4.7"} onClick={() => setTab("4.7")}>
            4.7 IPv6
          </TabBtn>
          <TabBtn active={tab === "4.8"} onClick={() => setTab("4.8")}>
            4.8 Oppgaver
          </TabBtn>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "4.1" && <Section41 />}
        {tab === "4.2" && <Section42 />}
        {tab === "4.3" && <Section43 />}
        {tab === "4.4" && <Section44 />}
        {tab === "4.5" && <Section45 />}
        {tab === "4.6" && <Section46 />}
        {tab === "4.7" && <Section47 />}
        {tab === "4.8" && <Section48 />}

        <SectionPager tabs={SECTIONS_4} current={tab} onPick={(id) => setTab(id as Tab)} nextChapter={NEXT_CHAPTER_4} />
      </main>
    </div>
  );
}

function TabBtn({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
        active
          ? "border-brand text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Intro({ onPick }: { onPick: (t: Tab) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 text-sm">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2 flex items-center gap-2">
          <BookOpen className="h-4 w-4" /> Læringsmål
        </h2>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
          <li>
            Skille mellom data-plane (per-pakke forwarding) og control-plane (rute-beregning), og
            forstå hvorfor den arkitektoniske skillet er sentral i moderne nettverk.
          </li>
          <li>
            Tegne arkitekturen i en moderne ruter: input-porter, switching-fabric, output-porter og
            hvor det kan oppstå kø-blokkering.
          </li>
          <li>
            Lese et IPv4-header bit for bit; forklare hva hvert felt gjør og hvordan fragmentering
            håndteres når en pakke møter en lenke med mindre MTU.
          </li>
          <li>
            Regne på subnetting med CIDR — finne nettverks-adresse, broadcast, antall hosts, og dele
            et prefix i flere subnett.
          </li>
          <li>
            Forklare hva NAT (Network Address Translation) gjør, hvorfor det ble utbredt, og hvilke
            kompromisser det gir for ende-til-ende-arkitekturen til internett.
          </li>
          <li>
            Forstå SDN-modellen: match-action, OpenFlow-tabeller, og hvorfor å skille control-plane
            fra data-plane endrer hva et nettverk kan gjøre.
          </li>
          <li>
            Vite hvordan IPv6 skiller seg fra IPv4 i header-format og prinsipper, og hvilke
            mekanismer som brukes i overgangsperioden (dual-stack, tunnelering).
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Kapittelets struktur</h2>
        <ol className="list-decimal pl-5 text-muted-foreground space-y-1">
          <li>Overview — data-plane vs control-plane, forwarding vs routing</li>
          <li>Inni en ruter — input, switching-fabric, output, blokkering</li>
          <li>IPv4 — header, fragmentering, MTU</li>
          <li>Subnetting og CIDR — slash-notasjon i praksis</li>
          <li>NAT og middleboxes — pragmatikk og arkitektonisk pris</li>
          <li>SDN og generalisert forwarding — match-action</li>
          <li>IPv6 — header, transisjon</li>
          <li>Oppgaver</li>
        </ol>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => onPick("4.1")}>
            Start på 4.1 →
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 4.1 — Overview
// ============================================================
function Section41() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="4.1" title="Overview — data-plane vs control-plane" />

      <p className="text-muted-foreground">
        Nettverkslaget gjør én ting: flytter datagrammer fra én host til en annen, gjennom en lang
        rekke rutere. For å klare det må to typer arbeid utføres. Det første skjer hundrevis av
        millioner av ganger i sekundet på hver ruter — å slå opp i en tabell og putte pakken på
        riktig ut-lenke. Det andre skjer i bakgrunnen — å bygge selve tabellen ved å snakke med
        andre rutere. Disse to fasene har egne navn og egen plass i moderne ruter-design.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
        items={[
          {
            term: "Data-plane (forwarding)",
            body: "Den per-pakke avgjørelsen: «her kommer en pakke til 192.168.5.7, slå opp i tabellen, send ut på port 3.» Skjer i hardware på moderne rutere, i nanosekunder. Det er denne fasen som dette kapittelet handler om.",
          },
          {
            term: "Control-plane (routing)",
            body: "Bakgrunns-arbeidet med å beregne hva forwarding-tabellen skal inneholde. Krever at ruterne snakker sammen og blir enige om hvor i nettet ulike prefix ligger. Vi tar dette i kap. 5.",
          },
          {
            term: "Forwarding-tabell",
            body: "Lookup-struktur som mapper destinasjon (et IP-prefix) til en ut-port. Hver pakke matches mot tabellen; den lengste matchende prefiks-raden vinner — derav «longest prefix match».",
          },
          {
            term: "Tradisjonell ruter",
            body: "I gamle rutere kjørte både data-plane og control-plane sammen på en proprietær CPU inne i ruteren. Hver leverandør hadde sitt eget operativsystem (Cisco IOS, Juniper Junos, ...). Vanskelig å endre adferd uten leverandørens tillatelse.",
          },
          {
            term: "SDN-tilnærming",
            body: "Software-Defined Networking trekker control-plane ut av selve ruteren og opp i en sentral kontroller. Ruterne blir «dumme» — de gjør bare det data-planet ber dem om. Kontrolleren kan endre adferden på hele nettet med en programmatisk API.",
          },
          {
            term: "Longest-prefix-match",
            body: "Når flere rader i tabellen matcher samme destinasjon, velges den med flest matchende bits. Eksempel: 192.168.0.0/16 og 192.168.5.0/24 matcher begge 192.168.5.7 — /24 er mer spesifikk og vinner.",
          },
        ]}
      />
        <Illustration caption="Kontroll-plane bygger tabellen, data-plane bruker den per pakke. Tradisjonelt skjer begge inne i ruteren; SDN flytter control-plane ut.">
        <DataControlPlaneSvg />
      </Illustration>
      </div>

      <Example title="Eksempel: hvor mange beslutninger?">
        <p>
          En core-ruter med en 100 Gbps lenke og 600-byte snittpakker må gjøre rundt 20 millioner
          forwarding-beslutninger per sekund — én per pakke. Det er åpenbart umulig å la en generell
          CPU gjøre dette: hver beslutning må ta ~50 nanosekunder. Derfor gjøres lookup i dedikert
          hardware (TCAM — ternary content-addressable memory).
        </p>
        <p className="mt-2">
          Control-plane derimot kjører på en helt vanlig CPU og oppdaterer tabellen ~hvert minutt
          eller når topologien endres. To svært ulike krav til ytelse — derfor den arkitektoniske
          splittelsen.
        </p>
      </Example>

      <RelatedSlugs slugs={["dte2507-inni-ruter", "dte2507-paket-dekoding"]} />
    </article>
  );
}

// ============================================================
// 4.2 — Inni en ruter
// ============================================================
function Section42() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="4.2" title="Inni en ruter" />

      <p className="text-muted-foreground">
        En ruter er ikke en svart boks. Den har en intern arkitektur som er overraskende lik en
        liten datamaskin med spesialisert IO. La oss åpne lokket og se hva som er der.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
        items={[
          {
            term: "Input-port",
            body: "Mottar bits fra en innkommende lenke, fjerner linklags-headeren, og kjører lookup i forwarding-tabellen for å bestemme hvilken output-port pakken skal til. Hver input-port har sin egen kopi av tabellen for å unngå at de blir flaskehals på hverandre.",
          },
          {
            term: "Switching-fabric",
            body: "Det interne «bakplanet» som flytter pakker fra input-porter til output-porter. Tre vanlige arkitekturer: via minne (CPU kopierer), via buss (én pakke om gangen), eller via crossbar (kan flytte mange pakker parallelt).",
          },
          {
            term: "Output-port",
            body: "Mottar pakker fra fabric-en, plasserer dem i en kø, og sender dem ut på lenken med riktig linklags-header. Det er her kø-forsinkelse fra kap. 1 oppstår.",
          },
          {
            term: "HOL-blokkering (head-of-line)",
            body: "Når en kø foran input-porten er FIFO, og pakken først i køen venter på en opptatt output-port, så blokkerer den alle pakker bak — selv om disse er på vei til en annen, ledig, output-port. Løses med virtual output queues (én kø per output per input).",
          },
          {
            term: "Pakketap",
            body: "Skjer på output-køene når en lenke er overbelastet. Pakker som ikke får plass kastes (drop tail) eller velges aktivt ut (RED — random early detection) før køen renner over.",
          },
          {
            term: "Switching-rate",
            body: "Hvor raskt fabric-en kan flytte pakker fra input til output. Hvis den er saktere enn summen av input-rater, oppstår kø allerede inne i ruteren. Moderne core-rutere har fabric flere ganger raskere enn samlet input.",
          },
          {
            term: "Packet scheduling",
            body: "På output-porten kan vi velge hvilken pakke som sendes neste. FIFO er enkleste; men round-robin, weighted fair queueing (WFQ), priority queueing brukes for å gi noen flows bedre service.",
          },
        ]}
      />
        <Illustration caption="Pakkenes vei gjennom en ruter: input-port leser header, switching-fabric flytter til riktig output-port, output-kø sender ut.">
        <RouterArchitectureSvg />
      </Illustration>
      </div>

      <Example title="Eksempel: HOL-blokkering kostes en ruter mye">
        <p>
          En ruter har 4 input-porter og 4 output-porter. Anta at hver input mottar pakker som med
          like sannsynlighet skal til hver av de 4 outputene.
        </p>
        <p className="mt-2">
          Med FIFO-input-kø: hvis to inputer har en pakke fremst i køen som vil til samme output, må
          én av dem vente. Mens den venter, sitter pakkene bak også fast — selv om deres
          output-porter står tomme. Studier viser at maksimal gjennomstrømming med FIFO-input synker
          mot 58 % av kapasiteten ved tilfeldig last.
        </p>
        <p className="mt-2">
          Med virtual output queues (VOQ): hver input har 4 køer, én per output. Vi kan velge neste
          pakke fra ulike VOQ-er parallelt og oppnå ~100 % utnyttelse. Derfor bruker alle moderne
          high-end rutere VOQ.
        </p>
      </Example>

      <RelatedSlugs slugs={["dte2507-inni-ruter", "dte2507-packet-scheduling"]} />
    </article>
  );
}

// ============================================================
// 4.3 — IPv4
// ============================================================
function Section43() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="4.3" title="IPv4-protokollen" />

      <p className="text-muted-foreground">
        IP er nettverkslagets bærende protokoll. Den definerer hvordan et datagram ser ut, hvilke
        felt headeren har, og hvordan rutere oppfører seg når et datagram må passere en lenke som er
        for smal til pakke-størrelsen.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
        items={[
          {
            term: "Datagram",
            body: "En IP-pakke. Består av et 20-bytes header (eller mer hvis options brukes) og en payload — som typisk er et TCP- eller UDP-segment.",
          },
          {
            term: "Version",
            body: "4 bits som angir IP-versjon. For IPv4 er feltet 0100 (=4). Hvis du møter 0110 (=6) er det IPv6 og resten av headeren tolkes annerledes.",
          },
          {
            term: "TTL (Time To Live)",
            body: "8 bits som dekrementeres med 1 hver gang pakken passerer en ruter. Når den når 0 forkastes pakken og en ICMP-feilmelding sendes til kilden. Forhindrer at pakker går i evige løkker hvis routing-tabellen er feil.",
          },
          {
            term: "Protocol",
            body: "8 bits som forteller hvilken protokoll payload tilhører: 6 = TCP, 17 = UDP, 1 = ICMP, 41 = IPv6-i-IPv4, osv. Slik vet mottakerens kjerne hvilken handler den skal kalle.",
          },
          {
            term: "Total length",
            body: "16 bits — total lengde av datagrammet (header + payload) i bytes. Maks 65 535, men i praksis begrenset av MTU-en på lenkene pakken må gjennom.",
          },
          {
            term: "MTU (Maximum Transmission Unit)",
            body: "Største ramme-størrelse en lenke kan bære. Ethernet: 1500 bytes. WiFi: ofte 2304. PPPoE: 1492. En IP-pakke som er større enn MTU må fragmenteres før den kan sendes på den lenken.",
          },
          {
            term: "Fragmentering",
            body: "Hvis en pakke ankommer en ruter der ut-lenken har for liten MTU, deler ruteren pakken i fragmenter. Hvert fragment får sin egen IP-header med samme Identification, satt MF (More Fragments)-flag, og en Fragment offset som sier hvor i original-pakken dette fragmentet hører hjemme. Reassembly skjer på mottakeren — aldri underveis.",
          },
        ]}
      />
        <Illustration caption="IPv4-headeren ord for ord (32 bits per rad). Identification, flags og fragment-offset brukes når en pakke må deles opp på vei.">
        <Ipv4HeaderSvg />
      </Illustration>
      </div>

      <Example title="Eksempel: fragmentering av en 4000-byte pakke gjennom MTU 1500">
        <p>
          Vi har et 4000-byte datagram (20 bytes header + 3980 bytes payload) som må videresendes
          over en lenke med MTU 1500.
        </p>
        <p className="mt-2">
          Fragment-data-størrelse må være delelig på 8 (kravet for offset-feltet, som telles i
          8-byte enheter). Største lovlige fragment-payload er 1480 bytes (1500 − 20 header). Vi
          velger 1480.
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>Fragment 1: payload-bytes 0–1479 — offset = 0, MF=1, lengde = 1500</li>
          <li>Fragment 2: payload-bytes 1480–2959 — offset = 185, MF=1, lengde = 1500</li>
          <li>Fragment 3: payload-bytes 2960–3979 — offset = 370, MF=0, lengde = 1040</li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Offset 185 fordi 1480 / 8 = 185. Offset 370 fordi 2960 / 8 = 370. Alle tre fragmentene har
          samme Identification, så mottakeren kan sette dem sammen igjen. Hvis ett fragment tapes,
          må hele pakken retransmitteres — derfor er fragmentering noe vi prøver å unngå (Path MTU
          Discovery hjelper TCP å unngå det).
        </p>
      </Example>

      <RelatedSlugs slugs={["dte2507-paket-dekoding", "dte2507-crc-kalkulator"]} />
    </article>
  );
}

// ============================================================
// 4.4 — Subnetting og CIDR
// ============================================================
function Section44() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="4.4" title="Subnetting og CIDR" />

      <p className="text-muted-foreground">
        IP-adresser deles ikke ut én og én. De deles ut i blokker, og hver organisasjon må selv dele
        sin blokk i mindre delblokker — subnett — som passer den interne nettverks-strukturen.
        Slash-notasjonen (CIDR) er språket vi bruker for å snakke om disse blokkene.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
        items={[
          {
            term: "IP-adresse (32 bits)",
            body: "Skrives som fire desimal-tall mellom 0 og 255 skilt av punktum: 192.168.1.42. Hvert tall representerer 8 bits — totalt 32 bits.",
          },
          {
            term: "CIDR-notasjon (Classless Inter-Domain Routing)",
            body: "Skriver et nettverk som adresse/lengde, der lengden er antall bits i prefiks-delen. 192.168.1.0/24 betyr «de første 24 bitsene er nettverks-delen, de siste 8 er host-delen». /24 = 256 adresser i blokken.",
          },
          {
            term: "Subnett-maske",
            body: "Eldre måte å uttrykke det samme på: en 32-bits maske der prefiks-bitene er 1 og host-bitene er 0. /24 = 255.255.255.0. /20 = 255.255.240.0. Konseptuelt identisk med CIDR.",
          },
          {
            term: "Nettverks-adresse",
            body: "Første adresse i blokken — den med alle host-bits=0. For 192.168.5.0/24: nettverks-adresse er 192.168.5.0. Brukes som identifikator for blokken, kan ikke tildeles en host.",
          },
          {
            term: "Broadcast-adresse",
            body: "Siste adresse i blokken — alle host-bits=1. For 192.168.5.0/24: broadcast er 192.168.5.255. En pakke sendt hit leveres til alle hosts i subnettet. Kan heller ikke tildeles en host.",
          },
          {
            term: "Antall brukbare hosts",
            body: "I et /n-subnett er det 2^(32-n) totalt-adresser, hvorav 2 reserveres (nettverk + broadcast). Et /24 har dermed 254 brukbare host-adresser. Et /30 har 4-2=2 (typisk for point-to-point-lenker mellom rutere).",
          },
          {
            term: "Subnetting",
            body: "Å dele et eksisterende prefiks i flere mindre prefiks. Hvis du har /22 og vil ha 4 like store underblokker, øker du prefiks-lengden med 2 bits til /24. De 2 nye bitsene gir 2² = 4 unike subnett.",
          },
        ]}
      />
        <Illustration caption="Et /22 prefiks delt i fire /24-subnett. De to nye bitene gir fire kombinasjoner: 00, 01, 10, 11.">
        <SubnettingSvg />
      </Illustration>
      </div>

      <Example title="Eksempel: del 10.50.0.0/22 i fire like subnett">
        <p>
          Vi har blokken 10.50.0.0/22 og ønsker fire like store subnett (ett per etasje i et bygg).
        </p>
        <p className="mt-2">
          /22 betyr 22 nettverks-bits og 10 host-bits — totalt 2¹⁰ = 1024 adresser i hele blokken.
          Hvis vi øker prefiks-lengden til /24, får hvert subnett 2⁸ = 256 adresser, og vi får 4
          subnett (fordi 2^(24-22) = 4).
        </p>
        <p className="mt-2 font-mono text-[12px]">Original blokk: 10.50.0.0 – 10.50.3.255</p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>Subnett 1: 10.50.0.0/24 — host-range 10.50.0.1 – 10.50.0.254</li>
          <li>Subnett 2: 10.50.1.0/24 — host-range 10.50.1.1 – 10.50.1.254</li>
          <li>Subnett 3: 10.50.2.0/24 — host-range 10.50.2.1 – 10.50.2.254</li>
          <li>Subnett 4: 10.50.3.0/24 — host-range 10.50.3.1 – 10.50.3.254</li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Hver etasje får 254 brukbare host-adresser. Ruteren mellom etasjene har ett ben i hvert
          subnett. Pakker innen samme etasje krysser ikke ruteren; pakker mellom etasjer gjør.
        </p>
      </Example>

      <RelatedSlugs slugs={["dte2507-subnetting", "dte2507-arp-detektiv"]} />
    </article>
  );
}

// ============================================================
// 4.5 — NAT
// ============================================================
function Section45() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="4.5" title="NAT og middleboxes" />

      <p className="text-muted-foreground">
        Da det ble klart at IPv4 sine 4 milliarder adresser ikke ville rekke, fant industrien en
        snarvei: bruk private adresser inne i hjemme-/bedriftsnett, og la én offentlig adresse dekke
        alle utgående forbindelser. Det er NAT. Det fungerer overraskende godt — men koster oss noen
        prinsipper.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
        items={[
          {
            term: "NAT (Network Address Translation)",
            body: "Mekanisme der en ruter på kanten av et privat nett bytter ut kilde-adresse (og kilde-port) på utgående pakker, og reverserer byttet for innkommende svar. Resultatet: et helt nett kan dele én offentlig IP-adresse.",
          },
          {
            term: "Private adresseområder (RFC 1918)",
            body: "Tre blokker reservert til intern bruk: 10.0.0.0/8, 172.16.0.0/12, og 192.168.0.0/16. Rutere på internett dropper pakker med disse som kilde/destinasjon — de finnes bare innenfor ett organisasjons-nett.",
          },
          {
            term: "NAT-translation-tabell",
            body: "Datastruktur i NAT-ruteren som lagrer mappingen: «pakke fra 192.168.1.34:51000 ble omskrevet til 84.55.12.7:62001». Når et svar kommer inn til 84.55.12.7:62001 vet ruteren hvem den skal sendes til internt.",
          },
          {
            term: "PAT (Port Address Translation)",
            body: "Den utvidede formen av NAT som de fleste hjemme-rutere bruker: vi bytter både IP og port. Slik kan flere interne hosts dele samme offentlige IP, så lenge hver får en unik port-mapping.",
          },
          {
            term: "Middlebox",
            body: "Sekkebegrep for nettverks-bokser som gjør mer enn ren forwarding: NAT-er, brannmurer, load-balancere, DPI-bokser. De er pragmatisk uunngåelige i moderne nett, men bryter «end-to-end-prinsippet».",
          },
          {
            term: "End-to-end-prinsippet",
            body: "Den arkitektoniske idéen at intelligens skal ligge i endene (hostene) og at nettverket kun skal flytte bits. NAT bryter dette fordi en mellom-boks aktivt rør adresser og porter — applikasjons-utviklere må forholde seg til det.",
          },
          {
            term: "NAT-traversal",
            body: "Teknikker for å la to hosts bak ulike NAT-er snakke direkte med hverandre (peer-to-peer). Sentralt verktøy: en utenforliggende server (STUN) som hjelper hver klient finne ut hvilken offentlig adresse/port deres NAT eksponerer. Hvis dette feiler brukes en relé-server (TURN).",
          },
        ]}
      />
        <Illustration caption="NAT-ruteren skriver om kilde-IP og kilde-port på vei ut, og reverserer på vei inn. Resultatet er at de tre interne hostene deler én offentlig adresse.">
        <NatTranslationSvg />
      </Illustration>
      </div>

      <Example title="Eksempel: en mappings-rad i NAT-tabellen">
        <p>
          Hjemme-nettet ditt har den offentlige adressen 84.55.12.7. Tre enheter bak NAT-en åpner
          hver en HTTPS-forbindelse til VG (185.41.40.10:443) samtidig.
        </p>
        <p className="mt-2 font-mono text-[12px]">NAT-tabellen ser slik ut:</p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>192.168.1.10:51200 ↔ 84.55.12.7:62001 ↔ 185.41.40.10:443</li>
          <li>192.168.1.20:51200 ↔ 84.55.12.7:62002 ↔ 185.41.40.10:443</li>
          <li>192.168.1.30:48100 ↔ 84.55.12.7:62003 ↔ 185.41.40.10:443</li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Legg merke til at to interne hosts brukte samme port (51200). NAT-en valgte ulike eksterne
          porter (62001 og 62002) for å skille dem fra hverandre. Når VG svarer til 84.55.12.7:62002
          vet ruteren at det skal til 192.168.1.20:51200 og endrer adresse + port på vei inn.
        </p>
        <p className="mt-2 text-muted-foreground">
          Hva som er <em>vanskelig</em>: hva om VG vil starte en ny forbindelse <em>til</em>{" "}
          192.168.1.20? Det går ikke — den adressen finnes ikke utenfor hjemme-nettet, og NAT-en har
          ingen rad som forklarer hvor en ny innkommende forbindelse skal. Derfor må alle
          forbindelser initieres innenfra (eller du må eksplisitt sette opp port-forwarding).
        </p>
      </Example>

      <RelatedSlugs slugs={["dte2507-nat", "dte2507-paket-dekoding"]} />
    </article>
  );
}

// ============================================================
// 4.6 — SDN
// ============================================================
function Section46() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="4.6" title="SDN og generalisert forwarding" />

      <p className="text-muted-foreground">
        Tradisjonelle rutere er svarte bokser med integrert control- og data-plane. SDN
        (Software-Defined Networking) river den modellen i to: data-planet på ruterne reduseres til
        en programmerbar match-action-tabell, og control-planet flyttes opp i en sentralisert
        kontroller som kan styre hele nettverket fra ett sted.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
        items={[
          {
            term: "Match-action",
            body: "Generalisert forwarding-modell: hver rad i forwarding-tabellen er en betingelse (match — over hvilke som helst felt i pakken: IP-adresse, port, MAC, VLAN, ...) og en handling (action — videresend på port X, dropp, send til kontroller, omskrive et felt).",
          },
          {
            term: "OpenFlow",
            body: "Standardisert protokoll mellom SDN-kontrolleren og ruterne. Definerer hvordan kontrolleren skyver match-action-regler ned til ruterne. Versjon 1.0 hadde én tabell; senere versjoner har pipeline med flere tabeller for fleksibilitet.",
          },
          {
            term: "Flow-tabell",
            body: "Datastrukturen som lagrer match-action-reglene på ruteren. Ligner mye på en utvidet forwarding-tabell, men matcher ikke bare på destinasjon — kan matche på alle pakke-felt.",
          },
          {
            term: "Kontroller",
            body: "Sentralisert programmerbar enhet som har en samlet view av hele nettet. Tar inn topologi og policy, beregner ruter, og pusher flow-tabell-oppdateringer til alle rutere. ONOS, OpenDaylight og Ryu er kjente kontroller-implementasjoner.",
          },
          {
            term: "Northbound API",
            body: "Grensesnittet kontrolleren tilbyr applikasjoner — der nettverks-policy formuleres («last-balanser trafikk til disse serverne», «isoler tenant A fra tenant B»). Nettverks-policy blir vanlig software.",
          },
          {
            term: "Southbound API",
            body: "Grensesnittet kontrolleren bruker for å snakke med ruterne — typisk OpenFlow. Standardisert slik at kontroller og ruter kan komme fra ulike leverandører.",
          },
          {
            term: "Hvorfor SDN endrer alt",
            body: "Fordi nett-adferd blir noe man kan endre programmatisk uten å vente på en firmware-oppdatering fra leverandøren. Datacentre kan rive opp og bygge nye topologier, sette opp service-chains, og A/B-teste routing-strategier på samme måte som man deployer ny applikasjons-kode.",
          },
        ]}
      />
        <Illustration caption="SDN-arkitekturen: kontrolleren har et helhetsbilde og skyver flow-regler til alle rutere via OpenFlow. Applikasjoner snakker med kontrolleren via en northbound API.">
        <SdnArchitectureSvg />
      </Illustration>
      </div>

      <Example title="Eksempel: en flow-tabell rad">
        <p>En enkel match-action-rad kan se slik ut:</p>
        <div className="mt-2 rounded border border-border p-2 font-mono text-[11px]">
          <div>
            <strong>Match:</strong> dst_ip = 10.0.0.0/24 AND tcp_dst_port = 80
          </div>
          <div>
            <strong>Action:</strong> rewrite dst_ip → 10.0.0.42, forward to port 5
          </div>
          <div>
            <strong>Priority:</strong> 100
          </div>
          <div>
            <strong>Counters:</strong> 14 327 packets, 21.4 MB
          </div>
        </div>
        <p className="mt-2 text-muted-foreground">
          Denne raden implementerer en mini-load-balancer: alle HTTP-pakker som skal til 10.0.0.0/24
          omdirigeres til den konkrete serveren 10.0.0.42. Hvis vi senere vil bytte server,
          oppdaterer kontrolleren raden — uten å touch resten av nettet. I gamle dager ville dette
          krevd en dedikert load-balancer-boks.
        </p>
      </Example>

      <RelatedSlugs slugs={["dte2507-inni-ruter", "dte2507-packet-scheduling"]} />
    </article>
  );
}

// ============================================================
// 4.7 — IPv6
// ============================================================
function Section47() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="4.7" title="IPv6" />

      <p className="text-muted-foreground">
        IPv4 har 32 bits adresser — 4.3 milliarder. Dette tok slutt rundt 2011. IPv6, designet på
        90-tallet, har 128 bits adresser — 3.4·10³⁸. Mer enn nok atomer til å gi hver sandkorn på
        jorda en egen adresse. Men IPv6 er mer enn bare lengre adresser — det rydder også opp i en
        del designvalg som har vist seg dårlige med erfaring.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
        items={[
          {
            term: "128-bits adresser",
            body: "Skrives som åtte grupper á 4 heksadesimale tegn skilt med kolon: 2001:0db8:85a3:0000:0000:8a2e:0370:7334. Sammenhengende nuller kan komprimeres med dobbel-kolon: 2001:db8:85a3::8a2e:370:7334.",
          },
          {
            term: "Fast header-størrelse (40 bytes)",
            body: "Mot IPv4 sin variable header er IPv6-headeren alltid 40 bytes. Det gjør hardware-prosessering raskere — ingen behov for å beregne header-lengde først. Options håndteres via «extension headers» som er payload, ikke header.",
          },
          {
            term: "Ingen fragmentering på rutere",
            body: "IPv6 forbyr rutere å fragmentere underveis. Hvis en pakke er for stor, sendes en ICMPv6-feilmelding til kilden, som så reduserer pakkestørrelsen (Path MTU Discovery). Dette flytter kostnad fra core til edge — riktig sted.",
          },
          {
            term: "Ingen header checksum",
            body: "IPv4 har en checksum over headeren som må re-beregnes på hver ruter (fordi TTL endrer seg). IPv6 dropper denne — link-laget og transport-laget tar feildeteksjon.",
          },
          {
            term: "Flow label",
            body: "Nytt 20-bits felt i IPv6-headeren der avsender kan merke pakker som tilhører samme «flow» (en samtale). Rutere kan da gi alle pakker i samme flow lik behandling uten å parse hele headeren.",
          },
          {
            term: "Dual-stack",
            body: "Overgangs-strategi der hostene kjører IPv4 og IPv6 i parallell. Hvis begge endepunkter har IPv6, brukes IPv6; ellers faller man tilbake til IPv4. De fleste moderne OS gjør dette automatisk.",
          },
          {
            term: "Tunnelering",
            body: "Strategi for å sende IPv6 over IPv4-strekninger. IPv6-pakken pakkes inn i en IPv4-pakke (protocol-nummer 41) gjennom en IPv4-bare seksjon, og pakkes ut på den andre siden. Slik kan IPv6-øyer kommunisere på tvers av et hav av IPv4.",
          },
        ]}
      />
        <Illustration caption="IPv4-header (variabel størrelse, mange felter) versus IPv6-header (fast 40 bytes, færre men bredere felt).">
        <Ipv6HeaderSvg />
      </Illustration>
      </div>

      <Example title="Eksempel: en IPv6-adresse parset">
        <p className="font-mono text-[12px]">2001:0db8:0000:0042:0000:8a2e:0370:7334</p>
        <p className="mt-2">
          De første 48 bits (2001:0db8:0000) er typisk allokert til ISP-en. De neste 16 bits (0042)
          er ofte ditt subnett-ID hos den ISP-en. De siste 64 bits (0000:8a2e:0370:7334) er
          interface-identifikatoren — kan settes manuelt, slumpe seg fram (SLAAC), eller genereres
          fra MAC-adressen.
        </p>
        <p className="mt-2">Komprimert form (én sekvens av kun-nuller erstattes med ::):</p>
        <p className="font-mono text-[12px]">2001:db8:0:42:0:8a2e:370:7334</p>
        <p className="mt-2 text-muted-foreground">
          Merk: dobbel-kolon kan brukes bare én gang per adresse — ellers er det tvetydig hvor mange
          nuller hver står for. Adressen ovenfor har to nuller-sekvenser; vi måtte velge én av dem å
          komprimere.
        </p>
      </Example>

      <RelatedSlugs slugs={["dte2507-subnetting", "dte2507-paket-dekoding"]} />
    </article>
  );
}

// ============================================================
// 4.8 — Oppgaver
// ============================================================
function Section48() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="4.8" title="Oppgaver" />
      <p className="text-muted-foreground">
        Fem oppgaver som tester kapittelets sentrale begrep. Prøv selv før du klikker «Vis svar».
      </p>

      <Exercise
        question="Et selskap har fått tildelt CIDR-blokken 10.0.0.0/22. Hvor mange host-adresser er det totalt? Del blokken i fire like store subnett — angi nettverks-adresse og host-range for hvert."
        hint="/22 betyr 22 nettverks-bits og 10 host-bits. For å få fire subnett må prefiks-lengden økes med 2 bits."
        answer={
          <>
            <p className="font-mono text-[12px]">
              Totalt: 2¹⁰ = 1024 adresser, minus 2 reserverte = 1022 brukbare hosts i hele blokken.
              <br />
              Etter splitt til /24: hvert subnett har 2⁸ = 256 totalt, 254 brukbare.
            </p>
            <ul className="list-disc pl-5 mt-2 font-mono text-[12px]">
              <li>10.0.0.0/24 — hosts 10.0.0.1 – 10.0.0.254 (broadcast 10.0.0.255)</li>
              <li>10.0.1.0/24 — hosts 10.0.1.1 – 10.0.1.254 (broadcast 10.0.1.255)</li>
              <li>10.0.2.0/24 — hosts 10.0.2.1 – 10.0.2.254 (broadcast 10.0.2.255)</li>
              <li>10.0.3.0/24 — hosts 10.0.3.1 – 10.0.3.254 (broadcast 10.0.3.255)</li>
            </ul>
            <p className="mt-2">
              Det neste /22 ville begynt på 10.0.4.0 — så blokken vår dekker eksakt
              10.0.0.0–10.0.3.255.
            </p>
          </>
        }
      />

      <Exercise
        question="En pakke på 4000 bytes (inkludert 20-byte IP-header) skal videresendes over en lenke med MTU 1500. Hvor mange fragmenter blir det, og hva er Fragment offset i hvert?"
        hint="Hvert fragment kan ha maks 1500-20=1480 bytes payload. Offset telles i 8-byte enheter."
        answer={
          <>
            <p className="font-mono text-[12px]">
              Payload total: 4000 − 20 = 3980 bytes
              <br />
              Per fragment-payload (delelig på 8, maks 1480): 1480
              <br />
              ⌈3980 / 1480⌉ = 3 fragmenter
            </p>
            <ul className="list-disc pl-5 mt-2 font-mono text-[12px]">
              <li>Fragment 1: payload-bytes 0–1479, offset = 0/8 = 0, MF=1, lengde 1500</li>
              <li>Fragment 2: payload-bytes 1480–2959, offset = 1480/8 = 185, MF=1, lengde 1500</li>
              <li>Fragment 3: payload-bytes 2960–3979, offset = 2960/8 = 370, MF=0, lengde 1040</li>
            </ul>
            <p className="mt-2">
              MF (More Fragments) er 1 på alle bortsett fra det siste. Alle fragmenter deler samme
              Identification slik at mottakeren kan sette dem sammen.
            </p>
          </>
        }
      />

      <Exercise
        question="Forklar NAT-traversal: hvordan kan to klienter, hver bak sin egen NAT, opprette en peer-to-peer-forbindelse direkte? Skisser hvordan STUN og TURN passer inn."
        hint="Begge klienter må først finne ut hvilken offentlig adresse/port deres NAT eksponerer dem på, og deretter «slå hull» i NAT-en."
        answer={
          <>
            <p>
              Begge klienter A og B kontakter en STUN-server (på en kjent offentlig IP). STUN svarer
              med «du framstår som 84.55.12.7:62001» — så hver klient vet sin egen offentlige
              (NAT-fremstilte) adresse.
            </p>
            <p className="mt-2">
              A og B utveksler hverandres offentlige adresse via en signaleringskanal (typisk en
              utenforliggende server begge har en utgående forbindelse til, f.eks. en chat-server).
              Begge sender deretter pakker mot hverandres offentlige adresse <em>samtidig</em>. Den
              første utgående pakken fra A skaper en NAT-mapping i A sin NAT for B sin adresse, og
              motsatt. Når pakken fra B treffer A sin NAT, finnes mappingen — pakken slipper inn.
              Hullet er slått.
            </p>
            <p className="mt-2">
              Hvis NAT-en er av typen «symmetric» (bruker ulik ekstern port for hver destinasjon),
              virker ikke STUN-trikset. Da må trafikken relayes gjennom en TURN-server — en
              mellomledd som mottar fra A og sender til B. TURN koster båndbredde hos en tredjepart,
              så STUN prøves alltid først.
            </p>
            <p className="mt-2 text-muted-foreground">
              Dette er prinsippet bak WebRTC, og hvorfor videosamtaler ofte fungerer P2P selv om
              begge er bak hjemmenett.
            </p>
          </>
        }
      />

      <Exercise
        question="En ruter har en flow-tabell-rad: match (dst_ip=10.0.5.0/24, tcp_dst_port=443), action (forward port 7), priority=200. En annen rad: match (dst_ip=10.0.0.0/16), action (forward port 3), priority=100. Hvilken brukes for en pakke til 10.0.5.42:443? Hva med 10.0.7.10:80?"
        hint="Når flere rader matcher, brukes den med høyest prioritet."
        answer={
          <>
            <p>
              <strong>10.0.5.42:443:</strong> begge radene matcher (5.42 er innenfor både 5.0/24 og
              0.0/16, og port=443 matcher første rad). Første rad har prioritet 200 vs 100 — den
              brukes. Pakken sendes ut på port 7.
            </p>
            <p className="mt-2">
              <strong>10.0.7.10:80:</strong> første rad krever 5.0/24 (matcher ikke 7.10) —
              diskvalifisert. Andre rad matcher 0.0/16. Den brukes; pakken sendes ut på port 3.
            </p>
            <p className="mt-2 text-muted-foreground">
              I OpenFlow er prioritet og «longest prefix match» ikke det samme. Prioritet er et
              eksplisitt tall som programmereren setter på regelen — ikke en automatisk konsekvens
              av prefiks-lengde. Det gir fleksibilitet (du kan la et bredere prefiks vinne over et
              smalere når det er ønsket), men krever omtanke ved programmering.
            </p>
          </>
        }
      />

      <Exercise
        question="Hvorfor er IPv6 sin beslutning om å forby rutere å fragmentere underveis en god designvalg? Hva er konsekvensen for kilde-hosten?"
        hint="Tenk på hvor mange ganger en pakke fragmenteres, og hvor mange ganger den reassembles. Hvor i nettet ligger CPU-budsjettet?"
        answer={
          <>
            <p>
              Fragmentering på rutere er kostbart fordi rutere allerede er CPU-knappe enheter som
              prosesserer milliarder av pakker per sekund. Å la dem måtte klippe opp pakker i farten
              — og holde state for fragmenter — er en stygg flaskehals. Reassembly skjer uansett
              bare på mottakeren (aldri underveis), så fragmenteringen tjener bare mellom-lenkene.
            </p>
            <p className="mt-2">
              IPv6 flytter dette arbeidet til kilde-hosten: hvis en pakke er for stor, får kilden en
              ICMPv6 «Packet Too Big»-melding og kan selv velge mindre størrelse. Dette er Path MTU
              Discovery. Resultatet er at rutere har ett krav mindre, og at all fragmentering skjer
              på en CPU som ikke betaler for det per pakke uansett.
            </p>
            <p className="mt-2 text-muted-foreground">
              Prisen: kilden må implementere PMTUD korrekt. Hvis ICMPv6-meldinger blokkeres av en
              brannmur (dessverre vanlig), oppstår «black hole»-feilsituasjoner der pakker bare
              forsvinner. Dette er et reelt problem i praksis.
            </p>
          </>
        }
      />
    </article>
  );
}

// ============================================================
// Felles
// ============================================================

function Header({ num, title }: { num: string; title: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-brand font-semibold">
        Seksjon {num}
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );
}

function Defs({ items }: { items: { term: string; body: React.ReactNode }[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Definisjoner</h3>
      <dl className="space-y-3 text-[13px]">
        {items.map((it) => (
          <div key={it.term}>
            <dt className="font-semibold text-foreground">{it.term}</dt>
            <dd className="text-muted-foreground mt-0.5">{it.body}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Illustration({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <figure className="rounded-xl border border-border bg-card p-4">
      <div className="rounded bg-muted/20 p-3">{children}</div>
      <figcaption className="text-xs text-muted-foreground mt-2 text-center italic">
        {caption}
      </figcaption>
    </figure>
  );
}

function Example({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold mb-1">
        Eksempel
      </div>
      <div className="font-semibold text-foreground mb-1">{title}</div>
      <div className="text-muted-foreground text-[13px] space-y-2">{children}</div>
    </div>
  );
}

function Exercise({
  question,
  hint,
  answer,
}: {
  question: React.ReactNode;
  hint?: React.ReactNode;
  answer?: React.ReactNode;
}) {
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  return (
    <div className="rounded-xl border border-brand/30 bg-brand/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-brand font-semibold mb-1">
        Oppgave
      </div>
      <div className="text-[13px]">{question}</div>
      <div className="mt-2 flex gap-2 flex-wrap">
        {hint && (
          <button
            onClick={() => setShowHint((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            {showHint ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            Hint
          </button>
        )}
        {answer && (
          <button
            onClick={() => setShowAnswer((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            {showAnswer ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            {showAnswer ? "Skjul svar" : "Vis svar"}
          </button>
        )}
      </div>
      {showHint && hint && (
        <div className="mt-2 rounded border border-border bg-background p-2 text-[12px] text-muted-foreground">
          {hint}
        </div>
      )}
      {showAnswer && answer && (
        <div className="mt-2 rounded border border-success/30 bg-success/5 p-2 text-[12px]">
          {answer}
        </div>
      )}
    </div>
  );
}

function RelatedSlugs({ slugs }: { slugs: string[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        Interaktive utdypninger
      </div>
      <ul className="space-y-1 text-xs">
        {slugs.map((s) => (
          <li key={s}>
            <a
              href={`/stack/${s}`}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-brand"
            >
              <ExternalLink className="h-3 w-3" /> /stack/{s}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}


// ============================================================
// SVG-illustrasjoner — alle original-tegnet
// ============================================================

function DataControlPlaneSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      {/* Control plane top */}
      <rect
        x={40}
        y={20}
        width={420}
        height={60}
        rx={8}
        className="fill-brand/10 stroke-brand"
        strokeWidth={1.5}
        strokeDasharray="5 3"
      />
      <text
        x={250}
        y={38}
        textAnchor="middle"
        className="fill-brand text-[10px] uppercase tracking-wider font-semibold"
      >
        Control-plane
      </text>
      <text x={250} y={56} textAnchor="middle" className="fill-foreground text-[10px]">
        Beregner forwarding-tabellen
      </text>
      <text x={250} y={70} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        (snakker med naboer, kjører routing-algoritmer)
      </text>

      {/* Arrow down */}
      <line
        x1={250}
        y1={85}
        x2={250}
        y2={110}
        className="stroke-muted-foreground"
        strokeWidth={1.5}
        markerEnd="url(#arrowSmall)"
      />
      <text x={260} y={100} className="fill-muted-foreground text-[9px]">
        pusher tabell
      </text>

      {/* Data plane bottom */}
      <rect
        x={40}
        y={120}
        width={420}
        height={100}
        rx={8}
        className="fill-success/10 stroke-success"
        strokeWidth={1.5}
      />
      <text
        x={250}
        y={138}
        textAnchor="middle"
        className="fill-success text-[10px] uppercase tracking-wider font-semibold"
      >
        Data-plane
      </text>
      <text x={250} y={154} textAnchor="middle" className="fill-foreground text-[10px]">
        Forwarder hver pakke per tabell-oppslag
      </text>

      {/* Packets flowing */}
      <rect x={60} y={175} width={20} height={14} className="fill-amber-500" />
      <rect x={90} y={175} width={20} height={14} className="fill-brand" />
      <rect x={120} y={175} width={20} height={14} className="fill-success" />
      <line
        x1={150}
        y1={182}
        x2={440}
        y2={182}
        className="stroke-foreground/40"
        strokeWidth={1.5}
        markerEnd="url(#arrowSmall)"
      />
      <text x={290} y={205} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        millioner pakker per sekund — hardware lookup
      </text>

      <defs>
        <marker
          id="arrowSmall"
          viewBox="0 0 10 10"
          refX={9}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 z" className="fill-foreground" />
        </marker>
      </defs>
    </svg>
  );
}

function RouterArchitectureSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Ruter-arkitektur: input → switching-fabric → output
      </text>

      {/* Input ports */}
      {[40, 90, 140].map((y, i) => (
        <g key={`in${i}`}>
          <rect
            x={20}
            y={y}
            width={80}
            height={35}
            rx={4}
            className="fill-amber-500/20 stroke-amber-500"
            strokeWidth={1.5}
          />
          <text x={60} y={y + 16} textAnchor="middle" className="fill-foreground text-[9px]">
            input {i + 1}
          </text>
          <text x={60} y={y + 28} textAnchor="middle" className="fill-muted-foreground text-[8px]">
            lookup
          </text>
          <line
            x1={0}
            y1={y + 17}
            x2={20}
            y2={y + 17}
            className="stroke-foreground/60"
            strokeWidth={2}
          />
        </g>
      ))}

      {/* Fabric */}
      <rect
        x={140}
        y={50}
        width={140}
        height={130}
        rx={8}
        className="fill-brand/15 stroke-brand"
        strokeWidth={2}
      />
      <text
        x={210}
        y={70}
        textAnchor="middle"
        className="fill-brand text-[10px] font-semibold uppercase"
      >
        switching-fabric
      </text>
      <text x={210} y={90} textAnchor="middle" className="fill-foreground text-[9px]">
        crossbar
      </text>
      {/* Crossbar lines */}
      {[100, 120, 140, 160].map((y) => (
        <line
          key={`hl${y}`}
          x1={155}
          y1={y}
          x2={265}
          y2={y}
          className="stroke-brand/40"
          strokeWidth={0.7}
        />
      ))}
      {[170, 190, 210, 230, 250].map((x) => (
        <line
          key={`vl${x}`}
          x1={x}
          y1={95}
          x2={x}
          y2={170}
          className="stroke-brand/40"
          strokeWidth={0.7}
        />
      ))}

      {/* Connection lines input→fabric */}
      {[57, 107, 157].map((y) => (
        <line
          key={`l${y}`}
          x1={100}
          y1={y}
          x2={140}
          y2={115}
          className="stroke-muted-foreground/60"
          strokeWidth={1}
        />
      ))}

      {/* Output ports */}
      {[40, 90, 140].map((y, i) => (
        <g key={`out${i}`}>
          <rect
            x={320}
            y={y}
            width={80}
            height={35}
            rx={4}
            className="fill-success/20 stroke-success"
            strokeWidth={1.5}
          />
          <text x={360} y={y + 16} textAnchor="middle" className="fill-foreground text-[9px]">
            output {i + 1}
          </text>
          {/* Queue boxes */}
          <rect x={328} y={y + 22} width={5} height={8} className="fill-foreground/40" />
          <rect x={335} y={y + 22} width={5} height={8} className="fill-foreground/40" />
          <rect x={342} y={y + 22} width={5} height={8} className="fill-foreground/40" />
          <text x={385} y={y + 30} textAnchor="middle" className="fill-muted-foreground text-[8px]">
            kø
          </text>
          <line
            x1={400}
            y1={y + 17}
            x2={425}
            y2={y + 17}
            className="stroke-foreground/60"
            strokeWidth={2}
            markerEnd="url(#arrR)"
          />
        </g>
      ))}

      {/* Connection lines fabric→output */}
      {[57, 107, 157].map((y) => (
        <line
          key={`r${y}`}
          x1={280}
          y1={115}
          x2={320}
          y2={y}
          className="stroke-muted-foreground/60"
          strokeWidth={1}
        />
      ))}

      <text x={250} y={210} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        pakker matches inn på input → fabric flytter → output sender
      </text>
      <text x={250} y={225} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        kø-blokkering kan oppstå inne i fabric eller på output-køene
      </text>

      <defs>
        <marker
          id="arrR"
          viewBox="0 0 10 10"
          refX={9}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 z" className="fill-foreground" />
        </marker>
      </defs>
    </svg>
  );
}

function Ipv4HeaderSvg() {
  return (
    <svg viewBox="0 0 500 280" className="w-full h-auto">
      <text
        x={250}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        IPv4-header (20 bytes = 5 ord á 32 bits)
      </text>
      <text x={250} y={28} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        bit 0 ──────────────── 32
      </text>

      {/* Row 1 */}
      <g>
        <rect
          x={40}
          y={36}
          width={40}
          height={28}
          className="fill-brand/20 stroke-brand"
          strokeWidth={1}
        />
        <text x={60} y={54} textAnchor="middle" className="fill-foreground text-[8px]">
          Ver
        </text>
        <rect
          x={80}
          y={36}
          width={40}
          height={28}
          className="fill-brand/20 stroke-brand"
          strokeWidth={1}
        />
        <text x={100} y={54} textAnchor="middle" className="fill-foreground text-[8px]">
          IHL
        </text>
        <rect
          x={120}
          y={36}
          width={80}
          height={28}
          className="fill-brand/20 stroke-brand"
          strokeWidth={1}
        />
        <text x={160} y={54} textAnchor="middle" className="fill-foreground text-[8px]">
          TOS/DSCP
        </text>
        <rect
          x={200}
          y={36}
          width={160}
          height={28}
          className="fill-brand/20 stroke-brand"
          strokeWidth={1}
        />
        <text x={280} y={54} textAnchor="middle" className="fill-foreground text-[8px]">
          Total length
        </text>
      </g>

      {/* Row 2 */}
      <g>
        <rect
          x={40}
          y={68}
          width={160}
          height={28}
          className="fill-amber-500/20 stroke-amber-500"
          strokeWidth={1}
        />
        <text x={120} y={86} textAnchor="middle" className="fill-foreground text-[8px]">
          Identification
        </text>
        <rect
          x={200}
          y={68}
          width={40}
          height={28}
          className="fill-amber-500/20 stroke-amber-500"
          strokeWidth={1}
        />
        <text x={220} y={86} textAnchor="middle" className="fill-foreground text-[8px]">
          Flags
        </text>
        <rect
          x={240}
          y={68}
          width={120}
          height={28}
          className="fill-amber-500/20 stroke-amber-500"
          strokeWidth={1}
        />
        <text x={300} y={86} textAnchor="middle" className="fill-foreground text-[8px]">
          Fragment offset
        </text>
      </g>

      {/* Row 3 */}
      <g>
        <rect
          x={40}
          y={100}
          width={80}
          height={28}
          className="fill-success/20 stroke-success"
          strokeWidth={1}
        />
        <text x={80} y={118} textAnchor="middle" className="fill-foreground text-[8px]">
          TTL
        </text>
        <rect
          x={120}
          y={100}
          width={80}
          height={28}
          className="fill-success/20 stroke-success"
          strokeWidth={1}
        />
        <text x={160} y={118} textAnchor="middle" className="fill-foreground text-[8px]">
          Protocol
        </text>
        <rect
          x={200}
          y={100}
          width={160}
          height={28}
          className="fill-success/20 stroke-success"
          strokeWidth={1}
        />
        <text x={280} y={118} textAnchor="middle" className="fill-foreground text-[8px]">
          Header checksum
        </text>
      </g>

      {/* Row 4 */}
      <rect
        x={40}
        y={132}
        width={320}
        height={28}
        className="fill-destructive/20 stroke-destructive"
        strokeWidth={1}
      />
      <text x={200} y={150} textAnchor="middle" className="fill-foreground text-[9px]">
        Source IP address (32 bits)
      </text>

      {/* Row 5 */}
      <rect
        x={40}
        y={164}
        width={320}
        height={28}
        className="fill-destructive/20 stroke-destructive"
        strokeWidth={1}
      />
      <text x={200} y={182} textAnchor="middle" className="fill-foreground text-[9px]">
        Destination IP address (32 bits)
      </text>

      {/* Options */}
      <rect
        x={40}
        y={196}
        width={320}
        height={28}
        className="fill-muted stroke-border"
        strokeWidth={1}
        strokeDasharray="3 2"
      />
      <text x={200} y={214} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        Options (variabel — sjelden brukt)
      </text>

      {/* Payload */}
      <rect
        x={40}
        y={228}
        width={320}
        height={28}
        className="fill-card stroke-foreground"
        strokeWidth={1.5}
      />
      <text
        x={200}
        y={246}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Payload (TCP/UDP-segment)
      </text>

      <text x={250} y={272} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Identification, Flags og Fragment offset brukes ved fragmentering
      </text>
    </svg>
  );
}

function SubnettingSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        /22 delt i fire /24-subnett
      </text>

      {/* Original /22 bar */}
      <rect
        x={40}
        y={32}
        width={420}
        height={36}
        className="fill-brand/15 stroke-brand"
        strokeWidth={1.5}
      />
      <text
        x={250}
        y={52}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        10.50.0.0/22 — 1024 adresser
      </text>
      <text x={250} y={64} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        22 prefiks-bits · 10 host-bits
      </text>

      {/* Arrow */}
      <line
        x1={250}
        y1={75}
        x2={250}
        y2={92}
        className="stroke-foreground/60"
        strokeWidth={1.5}
        markerEnd="url(#arrS)"
      />
      <text x={260} y={87} className="fill-muted-foreground text-[8px]">
        øk prefiks til /24
      </text>

      {/* Four /24 subnets */}
      {[
        { x: 40, label: "10.50.0.0/24", bits: "00", color: "fill-amber-500/20 stroke-amber-500" },
        { x: 145, label: "10.50.1.0/24", bits: "01", color: "fill-success/20 stroke-success" },
        { x: 250, label: "10.50.2.0/24", bits: "10", color: "fill-brand/20 stroke-brand" },
        {
          x: 355,
          label: "10.50.3.0/24",
          bits: "11",
          color: "fill-destructive/20 stroke-destructive",
        },
      ].map((s, i) => (
        <g key={i}>
          <rect x={s.x} y={100} width={105} height={50} className={s.color} strokeWidth={1.5} />
          <text
            x={s.x + 52}
            y={120}
            textAnchor="middle"
            className="fill-foreground text-[9px] font-mono font-semibold"
          >
            {s.label}
          </text>
          <text
            x={s.x + 52}
            y={134}
            textAnchor="middle"
            className="fill-muted-foreground text-[8px]"
          >
            nye bits: {s.bits}
          </text>
          <text
            x={s.x + 52}
            y={146}
            textAnchor="middle"
            className="fill-muted-foreground text-[8px]"
          >
            254 hosts
          </text>
        </g>
      ))}

      {/* Bit visualization */}
      <text x={40} y={175} className="fill-muted-foreground text-[8px] font-semibold">
        Bit-mønster (siste oktett av nettverks-del):
      </text>
      <text x={40} y={195} className="fill-foreground text-[9px] font-mono">
        000000<tspan className="fill-brand font-bold">00</tspan> 00000000 → 10.50.0.0/24
      </text>
      <text x={40} y={208} className="fill-foreground text-[9px] font-mono">
        000000<tspan className="fill-brand font-bold">01</tspan> 00000000 → 10.50.1.0/24
      </text>
      <text x={40} y={221} className="fill-foreground text-[9px] font-mono">
        000000<tspan className="fill-brand font-bold">10</tspan> 00000000 → 10.50.2.0/24
      </text>
      <text x={40} y={234} className="fill-foreground text-[9px] font-mono">
        000000<tspan className="fill-brand font-bold">11</tspan> 00000000 → 10.50.3.0/24
      </text>

      <defs>
        <marker
          id="arrS"
          viewBox="0 0 10 10"
          refX={9}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 z" className="fill-foreground" />
        </marker>
      </defs>
    </svg>
  );
}

function NatTranslationSvg() {
  return (
    <svg viewBox="0 0 500 280" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        NAT: tre private hosts deler én offentlig adresse
      </text>

      {/* Private network */}
      <rect
        x={20}
        y={30}
        width={180}
        height={220}
        rx={8}
        className="fill-amber-500/5 stroke-amber-500/40"
        strokeDasharray="4 3"
        strokeWidth={1.5}
      />
      <text
        x={110}
        y={48}
        textAnchor="middle"
        className="fill-amber-600 dark:fill-amber-400 text-[9px] uppercase tracking-wider font-semibold"
      >
        Privat nett 192.168.1.0/24
      </text>

      {/* Internal hosts */}
      {[
        { y: 70, ip: "192.168.1.10", port: ":51200" },
        { y: 130, ip: "192.168.1.20", port: ":51200" },
        { y: 190, ip: "192.168.1.30", port: ":48100" },
      ].map((h, i) => (
        <g key={i}>
          <rect
            x={40}
            y={h.y}
            width={140}
            height={40}
            rx={4}
            className="fill-card stroke-amber-500"
            strokeWidth={1.5}
          />
          <text
            x={110}
            y={h.y + 17}
            textAnchor="middle"
            className="fill-foreground text-[9px] font-mono"
          >
            {h.ip}
          </text>
          <text
            x={110}
            y={h.y + 30}
            textAnchor="middle"
            className="fill-muted-foreground text-[8px] font-mono"
          >
            src-port {h.port}
          </text>
        </g>
      ))}

      {/* NAT router */}
      <rect
        x={220}
        y={100}
        width={80}
        height={80}
        rx={6}
        className="fill-brand/15 stroke-brand"
        strokeWidth={2}
      />
      <text
        x={260}
        y={130}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        NAT
      </text>
      <text x={260} y={145} textAnchor="middle" className="fill-foreground text-[8px]">
        ruter
      </text>
      <text
        x={260}
        y={160}
        textAnchor="middle"
        className="fill-muted-foreground text-[7px] font-mono"
      >
        84.55.12.7
      </text>

      {/* Lines from hosts to NAT */}
      {[90, 150, 210].map((y, i) => (
        <line
          key={i}
          x1={180}
          y1={y}
          x2={220}
          y2={140}
          className="stroke-amber-500/60"
          strokeWidth={1.2}
        />
      ))}

      {/* Public network */}
      <rect
        x={320}
        y={30}
        width={170}
        height={220}
        rx={8}
        className="fill-success/5 stroke-success/40"
        strokeDasharray="4 3"
        strokeWidth={1.5}
      />
      <text
        x={405}
        y={48}
        textAnchor="middle"
        className="fill-success text-[9px] uppercase tracking-wider font-semibold"
      >
        Offentlig internett
      </text>

      <line x1={300} y1={140} x2={320} y2={140} className="stroke-foreground/60" strokeWidth={2} />

      {/* External server */}
      <rect
        x={340}
        y={120}
        width={130}
        height={40}
        rx={4}
        className="fill-card stroke-success"
        strokeWidth={1.5}
      />
      <text x={405} y={138} textAnchor="middle" className="fill-foreground text-[9px] font-mono">
        185.41.40.10
      </text>
      <text
        x={405}
        y={150}
        textAnchor="middle"
        className="fill-muted-foreground text-[8px] font-mono"
      >
        VG :443
      </text>

      {/* NAT table */}
      <text x={50} y={263} className="fill-foreground text-[9px] font-semibold">
        NAT-tabell:
      </text>
      <text x={50} y={275} className="fill-muted-foreground text-[7px] font-mono">
        192.168.1.10:51200 ↔ 84.55.12.7:62001 ↔ 185.41.40.10:443
      </text>
    </svg>
  );
}

function SdnArchitectureSvg() {
  return (
    <svg viewBox="0 0 500 280" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        SDN: sentralisert kontroller styrer alle rutere
      </text>

      {/* Applications */}
      <rect
        x={120}
        y={28}
        width={260}
        height={36}
        rx={6}
        className="fill-brand/15 stroke-brand"
        strokeWidth={1.5}
      />
      <text
        x={250}
        y={45}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Nettverks-applikasjoner
      </text>
      <text x={250} y={58} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        routing · load balancer · firewall · tenant isolation
      </text>

      {/* Northbound */}
      <line
        x1={250}
        y1={64}
        x2={250}
        y2={88}
        className="stroke-muted-foreground"
        strokeWidth={1.2}
        strokeDasharray="2 2"
      />
      <text x={310} y={80} className="fill-muted-foreground text-[8px]">
        northbound API
      </text>

      {/* Controller */}
      <rect
        x={80}
        y={88}
        width={340}
        height={48}
        rx={6}
        className="fill-success/15 stroke-success"
        strokeWidth={2}
      />
      <text
        x={250}
        y={108}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        SDN-kontroller
      </text>
      <text x={250} y={122} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        helhetsbilde · beregner flow-regler · pusher til rutere
      </text>

      {/* Southbound */}
      <line
        x1={250}
        y1={136}
        x2={250}
        y2={158}
        className="stroke-muted-foreground"
        strokeWidth={1.2}
        strokeDasharray="2 2"
      />
      <text x={310} y={152} className="fill-muted-foreground text-[8px]">
        OpenFlow (southbound)
      </text>

      {/* Routers */}
      {[120, 240, 360].map((x, i) => (
        <g key={i}>
          <rect
            x={x - 35}
            y={170}
            width={70}
            height={50}
            rx={4}
            className="fill-card stroke-foreground"
            strokeWidth={1.5}
          />
          <text
            x={x}
            y={188}
            textAnchor="middle"
            className="fill-foreground text-[9px] font-semibold"
          >
            Ruter {i + 1}
          </text>
          <text x={x} y={202} textAnchor="middle" className="fill-muted-foreground text-[7px]">
            flow-tabell
          </text>
          <text x={x} y={213} textAnchor="middle" className="fill-muted-foreground text-[7px]">
            (match-action)
          </text>
          {/* Line from controller */}
          <line x1={250} y1={158} x2={x} y2={170} className="stroke-success/60" strokeWidth={1.2} />
        </g>
      ))}

      {/* Inter-router links */}
      <line
        x1={155}
        y1={195}
        x2={205}
        y2={195}
        className="stroke-foreground/40"
        strokeWidth={1.5}
      />
      <line
        x1={275}
        y1={195}
        x2={325}
        y2={195}
        className="stroke-foreground/40"
        strokeWidth={1.5}
      />

      {/* Hosts */}
      {[80, 200, 320, 440].map((x, i) => (
        <g key={`h${i}`}>
          <circle cx={x} cy={250} r={8} className="fill-amber-500" />
          <text x={x} y={272} textAnchor="middle" className="fill-muted-foreground text-[8px]">
            host
          </text>
        </g>
      ))}
      <line
        x1={80}
        y1={242}
        x2={105}
        y2={220}
        className="stroke-muted-foreground/40"
        strokeWidth={1}
      />
      <line
        x1={200}
        y1={242}
        x2={225}
        y2={220}
        className="stroke-muted-foreground/40"
        strokeWidth={1}
      />
      <line
        x1={320}
        y1={242}
        x2={345}
        y2={220}
        className="stroke-muted-foreground/40"
        strokeWidth={1}
      />
      <line
        x1={440}
        y1={242}
        x2={385}
        y2={220}
        className="stroke-muted-foreground/40"
        strokeWidth={1}
      />
    </svg>
  );
}

function Ipv6HeaderSvg() {
  return (
    <svg viewBox="0 0 500 260" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        IPv6-header — fast 40 bytes, færre felt
      </text>

      {/* Row 1 */}
      <rect
        x={40}
        y={28}
        width={50}
        height={28}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1}
      />
      <text x={65} y={46} textAnchor="middle" className="fill-foreground text-[8px]">
        Ver
      </text>
      <rect
        x={90}
        y={28}
        width={70}
        height={28}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1}
      />
      <text x={125} y={46} textAnchor="middle" className="fill-foreground text-[8px]">
        Traffic class
      </text>
      <rect
        x={160}
        y={28}
        width={200}
        height={28}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1}
      />
      <text x={260} y={46} textAnchor="middle" className="fill-foreground text-[8px]">
        Flow label (20 bits)
      </text>

      {/* Row 2 */}
      <rect
        x={40}
        y={60}
        width={120}
        height={28}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={100} y={78} textAnchor="middle" className="fill-foreground text-[8px]">
        Payload length
      </text>
      <rect
        x={160}
        y={60}
        width={100}
        height={28}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={210} y={78} textAnchor="middle" className="fill-foreground text-[8px]">
        Next header
      </text>
      <rect
        x={260}
        y={60}
        width={100}
        height={28}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={310} y={78} textAnchor="middle" className="fill-foreground text-[8px]">
        Hop limit
      </text>

      {/* Source IP (4 rows) */}
      <rect
        x={40}
        y={92}
        width={320}
        height={50}
        className="fill-success/20 stroke-success"
        strokeWidth={1}
      />
      <text
        x={200}
        y={120}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Source address (128 bits)
      </text>

      {/* Dest IP */}
      <rect
        x={40}
        y={146}
        width={320}
        height={50}
        className="fill-destructive/20 stroke-destructive"
        strokeWidth={1}
      />
      <text
        x={200}
        y={174}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Destination address (128 bits)
      </text>

      {/* Compare */}
      <text x={400} y={50} className="fill-muted-foreground text-[9px] font-semibold">
        IPv4 hadde:
      </text>
      <text x={400} y={64} className="fill-muted-foreground text-[8px]">
        + Fragment-felt
      </text>
      <text x={400} y={76} className="fill-muted-foreground text-[8px]">
        + Header checksum
      </text>
      <text x={400} y={88} className="fill-muted-foreground text-[8px]">
        + Options (variabel)
      </text>
      <text x={400} y={100} className="fill-muted-foreground text-[8px]">
        + IHL-felt
      </text>

      <text x={400} y={130} className="fill-success text-[9px] font-semibold">
        IPv6 dropper alle disse.
      </text>
      <text x={400} y={144} className="fill-muted-foreground text-[8px]">
        Resultat: enklere
      </text>
      <text x={400} y={156} className="fill-muted-foreground text-[8px]">
        å prosessere i hardware.
      </text>

      <text x={250} y={220} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        128-bits adresser = 3.4 × 10³⁸ unike adresser
      </text>
      <text x={250} y={236} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        Eksempel: 2001:db8:85a3::8a2e:370:7334
      </text>
    </svg>
  );
}
