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
        <div className="mb-3 flex items-center flex-wrap gap-x-3 gap-y-1 border-b border-border pb-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
            <a
              href="/stack/dte-2507"
              className="inline-flex items-center gap-1 hover:text-foreground shrink-0"
            >
              <FolderOpen className="h-3 w-3" /> DTE-2507
            </a>
            <span>·</span>
            <a href="/stack/kurose-kurs" className="hover:text-foreground shrink-0">
              Kurose-kurset
            </a>
            <span>·</span>
            <h1 className="text-sm font-bold tracking-tight text-foreground truncate">
              Kap. 4 — Nettverkslaget: data-plane
            </h1>
          </div>
          <nav className="ml-auto flex flex-wrap gap-0.5">
            <TabBtn active={tab === "intro"} onClick={() => setTab("intro")}>
              Start
            </TabBtn>
            <TabBtn active={tab === "4.1"} onClick={() => setTab("4.1")} title="Overview">
              4.1
            </TabBtn>
            <TabBtn active={tab === "4.2"} onClick={() => setTab("4.2")} title="Inni en ruter">
              4.2
            </TabBtn>
            <TabBtn active={tab === "4.3"} onClick={() => setTab("4.3")} title="IPv4">
              4.3
            </TabBtn>
            <TabBtn active={tab === "4.4"} onClick={() => setTab("4.4")} title="Subnetting & CIDR">
              4.4
            </TabBtn>
            <TabBtn active={tab === "4.5"} onClick={() => setTab("4.5")} title="NAT">
              4.5
            </TabBtn>
            <TabBtn active={tab === "4.6"} onClick={() => setTab("4.6")} title="SDN">
              4.6
            </TabBtn>
            <TabBtn active={tab === "4.7"} onClick={() => setTab("4.7")} title="IPv6">
              4.7
            </TabBtn>
            <TabBtn active={tab === "4.8"} onClick={() => setTab("4.8")} title="Oppgaver">
              Oppg.
            </TabBtn>
          </nav>
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

        <SectionPager
          tabs={SECTIONS_4}
          current={tab}
          onPick={(id) => setTab(id as Tab)}
          nextChapter={NEXT_CHAPTER_4}
        />
      </main>
    </div>
  );
}

function TabBtn({
  children,
  active,
  onClick,
  title,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-brand/15 text-brand"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
              term: "Longest-prefix-match (LPM)",
              body: "Når flere rader i tabellen matcher samme destinasjon, velges den med flest matchende bits. Eksempel: 192.168.0.0/16 og 192.168.5.0/24 matcher begge 192.168.5.7 — /24 er mer spesifikk og vinner.",
            },
            {
              term: "TCAM (Ternary Content-Addressable Memory)",
              body: "Spesial-RAM der hver celle kan lagre 0, 1 eller «don't care». Hele tabellen sjekkes parallelt på ett klokketakt — perfekt for LPM-oppslag. Dyr og strømkrevende, men eneste praktiske måte å gjøre tens-av-millioner lookups per sekund i en ruter.",
            },
            {
              term: "Best-effort-service",
              body: "Internett-modellens grunnløfte: nettverket prøver å levere pakker, men garanterer ingenting (ikke rekkefølge, ingen leveranse, ingen tid). Pålitelighet bygges av endepunkt-protokoller som TCP. Alternative modeller med kvalitetsgarantier (IntServ, ATM) har aldri fått fotfeste.",
            },
            {
              term: "Forwarding vs ruting",
              body: "Forwarding = lokal handling per pakke på én ruter (tar mikrosekunder). Ruting = global koordinering mellom alle rutere for å beregne hvilke paths som finnes (tar sekunder til minutter). To svært ulike tidsskalaer.",
            },
            {
              term: "Per-pakke vs per-flow-tilstand",
              body: "Internett-rutere holder ikke tilstand om enkelt-samtaler (per-flow) — de behandler hver pakke isolert mot tabellen. Det er denne tilstandsløsheten som gjør rutere skalerbare. Kontrast: telefon-svitsjer holdt tilstand per samtale; det skalerer ikke til milliarder av samtidige forbindelser.",
            },
            {
              term: "Match-action-paradigmet",
              body: "Generalisering av LPM: en regel består av en betingelse (match) og en handling (action). Tradisjonell forwarding er ett spesialtilfelle (match: destinasjons-prefiks, action: send på port). SDN åpner for vilkårlige felter i match og vilkårlige operasjoner som action.",
            },
            {
              term: "Linje-rate (line rate)",
              body: "Når en ruter klarer å prosessere pakker like raskt som lenken kan levere dem — uten å sakke ned eller miste pakker når det ikke er overbelastet. Krav for kjerne-rutere. Et 100 Gbps interface må kunne prosessere ~15 millioner små pakker per sekund.",
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

      <Example title="Eksempel: longest-prefix-match i praksis">
        <p>En liten forwarding-tabell på en kjerne-ruter i Tromsø:</p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>0.0.0.0/0 → port 1 (default route, ut mot Oslo)</li>
          <li>129.242.0.0/16 → port 2 (UiT-nett)</li>
          <li>129.242.16.0/20 → port 3 (Institutt for informatikk)</li>
          <li>129.242.18.0/24 → port 4 (laboratorie-segment)</li>
        </ul>
        <p className="mt-2">
          En pakke til 129.242.18.55 matcher alle fire rader. LPM velger /24-raden (24 bits matcher)
          og sender på port 4. En pakke til 129.242.20.12 matcher /16 og /20 (men ikke /24), så /20
          vinner med 20 bits. En pakke til 8.8.8.8 matcher kun /0 og går ut default-route mot Oslo.
        </p>
        <p className="mt-2 text-muted-foreground">
          /0 («alt») er fall-back-raden — dekker alt som ikke har en mer spesifikk regel. Uten den
          ville pakker til ukjente destinasjoner blitt droppet.
        </p>
      </Example>

      <Hvorfor title="Hvorfor skille data-plane og control-plane arkitektonisk?">
        <p>
          De to fasene har radikalt forskjellige krav. Data-plane må gjøre én avgjørelse per
          nanosekund og kan ikke vente på noe — krever ren hardware (TCAM, ASIC). Control-plane må
          kjøre kompliserte distribuerte algoritmer (Dijkstra, Bellman-Ford, BGP-policy-evaluering)
          som tar millisekunder til sekunder, og krever en programmerbar CPU med mye minne.
        </p>
        <p>
          Hvis du skulle bygd én sammensatt prosessor som klarte begge ville den enten vært for sen
          for forwarding eller for begrenset for control-logikken. Ved å splitte får du to enkle
          stykker som hver er optimert. SDN tar dette ett skritt videre: control-plane flyttes helt
          ut av selve rutere og opp i en kontroller, slik at man kan oppdatere routing-logikk uten å
          bytte hardware.
        </p>
      </Hvorfor>

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
            {
              term: "Shared-memory switch",
              body: "Den enkleste fabric-arkitekturen: en CPU leser pakken inn i en delt minneblokk, ser på destinasjon, og kopierer pakken ut til riktig output-buffer. Lett å bygge, men begrenset av minne-bussens båndbredde. Brukes i lavpris-svitsjer og hjemmeprodukter.",
            },
            {
              term: "Shared-bus switch",
              body: "Alle input- og output-porter henger på én felles intern buss. Én pakke om gangen krysser bussen. Enkel, men bussen er flaskehalsen — hele bussens kapasitet må deles på alle innkommende strømmer.",
            },
            {
              term: "Crossbar switch",
              body: "Et 2D-koblings-rutenett med N inputs og N outputs. Hver input kan kobles til hvilken som helst output samtidig, så lenge ingen to inputs vil til samme output. Tillater N pakker å bevege seg parallelt — den raskeste fabric-typen og standarden i moderne høyytelses-rutere.",
            },
            {
              term: "VOQ (Virtual Output Queue)",
              body: "Hver input-port holder N separate køer — én for hver output-port. Når fabricen er klar tar den fra den VOQ-en som passer; pakker som skal til opptatte outputer venter i sin egen kø uten å blokkere andre. Eliminerer HOL-blokkering helt.",
            },
            {
              term: "RED (Random Early Detection)",
              body: "Aktiv kø-styring: ruteren begynner å droppe pakker tilfeldig før køen er helt full. Sender oppdager tapet og senker farten (TCP-overbelastningskontroll), så køen aldri renner over. Bedre enn å vente til drop-tail og miste mange pakker på en gang.",
            },
            {
              term: "ECN (Explicit Congestion Notification)",
              body: "I stedet for å droppe pakker, markerer ruteren et bit i IP-headeren («CE» — congestion experienced). Mottakeren ekkoer signalet tilbake til sender via TCP. Mottakeren reduserer sendeflyten uten at en pakke faktisk gikk tapt — sparer retransmisjons-arbeid.",
            },
            {
              term: "WFQ (Weighted Fair Queueing)",
              body: "Hver flow får en vekt; planleggeren sender pakker slik at flows får båndbredde proporsjonal med vektene. En premium-flow med vekt 4 mot tre standard-flows á vekt 1 får 4/7 av lenken. Grunnlaget for kvalitets-tjenester.",
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

      <Example title="Eksempel: kø-vekst på en overbelastet output">
        <p>
          En ruter har én utgående 1 Gbps-lenke. To inngående 1 Gbps-strømmer er begge på vei ut på
          denne ene lenken samtidig. Innkommende kombinert rate: 2 Gbps. Utgående kapasitet: 1 Gbps.
        </p>
        <p className="mt-2">
          Hver sekund vokser kø-bufferet med (2 − 1) Gbit = 125 MB. Et output-buffer på 64 MB renner
          over på ca 0.5 sekund. Etter det begynner pakker å droppes.
        </p>
        <p className="mt-2 text-muted-foreground">
          Med RED begynner ruteren å droppe noen pakker allerede ved ~50 % bufferfylling. TCP-sender
          reagerer og senker hastighet før katastrofen — bufferet holder seg stabilt. Uten RED
          venter ruteren til 100 % og dropper deretter mange pakker samtidig (drop-tail) → TCP-flows
          kollapser synkront og lenken får underbruk.
        </p>
      </Example>

      <Hvorfor title="Hvorfor brukes crossbar-fabric i moderne kjerne-rutere?">
        <p>
          Et 100 Gbps interface trenger en intern «motorvei» som kan flytte pakker fra hvilken som
          helst input til hvilken som helst output i linje-rate. Shared-memory og shared-bus
          skalerer ikke: deres totale interne kapasitet er bundet av ett tråd-element. Med 32 porter
          á 100 Gbps ville en buss måtte ha 3.2 Tbps kapasitet — fysisk uoverkommelig på ett
          substrat.
        </p>
        <p>
          Crossbar er en grid av krysspunkter. Når ingen kollisjon, kan alle N inputs sende til alle
          N outputs parallelt. Med VOQ + smart skedulering (algoritmer som iSLIP) oppnår man nær 100
          % utnyttelse. Det er denne kombinasjonen — crossbar + VOQ + smart skedulering — som ligger
          til grunn for at moderne kjerne-rutere kan flytte terabits per sekund.
        </p>
      </Hvorfor>

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
            {
              term: "Header Length (IHL)",
              body: "4 bits som angir IP-header-lengden i 32-bits-ord. Vanlig verdi er 5 (= 20 bytes header uten options). Maks 15 (= 60 bytes). IHL er nødvendig fordi IPv4-headeren har valgfri «options»-feltet med variabel lengde.",
            },
            {
              term: "DSCP (Differentiated Services Code Point)",
              body: "6 bits i ToS-feltet brukt for å markere prioritets-/service-klasse. Operatører kan sette rutere til å gi pakker med høy DSCP foretrukket behandling — for eksempel kan VoIP-pakker merkes EF (Expedited Forwarding) for å unngå kø-jitter.",
            },
            {
              term: "ECN-bits",
              body: "2 bits ved siden av DSCP brukt til Explicit Congestion Notification. En ruter som opplever kø-vekst kan sette CE (Congestion Experienced)-koden i stedet for å droppe pakken. Mottakeren ekkoer signalet via TCP-headeren.",
            },
            {
              term: "Identification",
              body: "16 bits unik per pakke fra samme kilde-IP. Brukes som «lim» når en pakke fragmenteres: alle fragmenter av samme original-pakke deler samme Identification, slik at mottakeren vet hvilke fragmenter som hører sammen.",
            },
            {
              term: "Flags (DF, MF)",
              body: "DF (Don't Fragment) sier «hvis pakken ikke passer, dropp den heller enn å fragmentere». MF (More Fragments) er 1 på alle fragmenter unntatt det siste — slik vet mottakeren når den har fått hele pakken. Tredje bit er reservert til 0.",
            },
            {
              term: "Fragment Offset",
              body: "13 bits som angir hvor i original-pakkens payload dette fragmentet starter — målt i enheter av 8 bytes (derav 8-byte-justeringskravet). Med 13 bits og enhet 8 dekker det opp til 65 528 bytes — like under maks pakkestørrelse.",
            },
            {
              term: "Header checksum",
              body: "16-bits sjekk-sum kun over IP-headeren. Re-beregnes på hver ruter fordi TTL endrer seg. Beskytter ikke payload (det er TCP/UDP-checksumens jobb). Eksisterer ikke i IPv6.",
            },
            {
              term: "Options",
              body: "Sjelden brukt utvidelsesfelt i IPv4-headeren — record route, source route, timestamp osv. Krever software-prosessering på rutere og slår derfor av hardware-fast path. Praksis: unngås, og slippes helt i IPv6.",
            },
            {
              term: "Path MTU Discovery (PMTUD)",
              body: "Mekanisme der sender finner laveste MTU langs path før den sender store pakker. Setter DF=1 og prøver stor pakke; en ruter som ikke kan fragmentere returnerer ICMP «Fragmentation Needed» med MTU-verdien. Sender reduserer og prøver igjen.",
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

      <Example title="Eksempel: TTL teller ned gjennom Norden">
        <p>
          En klient i Hammerfest sender en pakke med TTL=64 mot en server i Berlin. Hver ruter på
          vei dekrementerer TTL med 1.
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>Hop 0 (Hammerfest, kilde): TTL=64</li>
          <li>Hop 1 (Tromsø): TTL=63</li>
          <li>Hop 5 (Trondheim): TTL=59</li>
          <li>Hop 9 (Oslo): TTL=55</li>
          <li>Hop 14 (København): TTL=50</li>
          <li>Hop 19 (Berlin, server): TTL=45</li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Hvis topologien hadde en løkke (feilkonfigurert ruting), ville TTL nådd 0 etter 64 hop og
          pakken blitt forkastet. Ruteren som dekrementerer til 0 sender en ICMP «Time Exceeded»
          tilbake — dette er nøyaktig hva <code>traceroute</code> utnytter: send pakker med TTL=1,
          2, 3, ... og samle ICMP-svarene for å kartlegge hver hop.
        </p>
      </Example>

      <Example title="Eksempel: DSCP-merking av VoIP-trafikk">
        <p>
          En IP-telefon merker hver utgående pakke med DSCP=EF (Expedited Forwarding, kodepunkt 46).
          Andre apper på samme nettverk bruker default DSCP=0.
        </p>
        <p className="mt-2">
          En ruter konfigurert for DiffServ har to output-køer: én rask-kø som tømmes først, og én
          standard-kø. Når begge har pakker, sendes EF-pakkene først. Resultatet er at VoIP-jitter
          holder seg under 30 ms selv når annen trafikk metter lenken — uten DSCP ville
          stemmekvaliteten kollapset så snart noen begynte å laste ned.
        </p>
      </Example>

      <Hvorfor title="Hvorfor er 32-bit IPv4 ikke nok?">
        <p>
          Med 32 bits er det 2³² ≈ 4.3 milliarder unike adresser. Designet på 1970-tallet virket det
          som «mer enn jorden noensinne vil trenge». Men: hver maskin trenger sin egen adresse, og
          mange organisasjoner får tildelt langt mer enn de bruker (såkalt fragmentering av
          adresse-rommet). Den effektive utnyttelsen ligger på 10-20 %. Sammen med smarttelefoner,
          IoT-enheter og virtuelle maskiner betyr det at IPv4 ble oppbrukt rundt 2011 (IANA fordelte
          siste /8 til regionale registre i februar det året).
        </p>
        <p>
          NAT har holdt IPv4 i live ved å gi mange enheter samme offentlige adresse, men det bryter
          end-to-end-prinsippet og lager problemer for P2P-applikasjoner. IPv6 sine 128 bits løser
          dette permanent — adresse-rommet er astronomisk og blir aldri oppbrukt under realistiske
          scenarier.
        </p>
      </Hvorfor>

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
            {
              term: "Klasseløs (classless) ruting",
              body: "Klassisk IP-adresse-rom delte adresser i klasser A (/8), B (/16), C (/24) med fast prefiks-lengde. Det var rigid og forrente raskt. CIDR (RFC 1519, 1993) lar prefiks-lengden være hvilket som helst tall fra 0-32 — fleksibelt og adresse-bevarende.",
            },
            {
              term: "Rute-aggregering (supernetting)",
              body: "Motsatt av subnetting: flere små nabo-prefiks samles til ett kortere. ISP-en din kan annonsere én /20 i stedet for sytten /24-er — globalt ruting-tabell krymper. Hovedgrunnen til at internett-kjerne-rutere bare har ~900 000 rader, ikke milliarder.",
            },
            {
              term: "VLSM (Variable Length Subnet Masking)",
              body: "Innenfor samme organisasjon kan ulike subnett ha ulik prefiks-lengde. Et stort kontor får /23, et lite får /27, en point-to-point-lenke får /30. Maksimal utnyttelse av adresse-budsjettet.",
            },
            {
              term: "Loopback-adresse",
              body: "127.0.0.0/8 er reservert til lokal-host. 127.0.0.1 er den vanligste — en pakke til den adressen sirkulerer aldri ut på nettverket, men leveres internt i kjernen. Brukes for testing og lokal IPC.",
            },
            {
              term: "Link-local (169.254.0.0/16)",
              body: "Adresse-blokk en host kan ta i bruk hvis DHCP feiler. Pakkene rutes ikke utenfor det lokale segmentet — derav «link-local». Når du ser en 169.254.x.y-adresse på en maskin betyr det vanligvis at DHCP har feilet.",
            },
            {
              term: "DHCP (Dynamic Host Configuration Protocol)",
              body: "Protokoll som lar en host be om en IP-adresse fra subnettet ved oppstart. Serveren tildeler en ledig adresse fra en pool, sammen med default gateway, DNS-server og leasing-tid. Helt sentralt i moderne nett — ingen konfigurerer IP-adresser manuelt lenger.",
            },
            {
              term: "Default gateway",
              body: "IP-adressen til ruteren som hosten sender pakker til når destinasjonen ligger utenfor lokalt subnett. Hver host har én default gateway konfigurert; for en typisk hjemme-ruter er det noe som 192.168.1.1.",
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

      <Example title="Eksempel: CIDR-aggregering på en regional ISP">
        <p>En internett-leverandør i Nord-Norge har fått tildelt seks /24-blokker fra RIPE:</p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>193.156.40.0/24</li>
          <li>193.156.41.0/24</li>
          <li>193.156.42.0/24</li>
          <li>193.156.43.0/24</li>
          <li>193.156.44.0/24</li>
          <li>193.156.45.0/24</li>
        </ul>
        <p className="mt-2">
          De fire første (40-43) har samme første 22 bits — 193.156.40.0/22 dekker dem alle. De to
          siste (44-45) deler 23 bits — 193.156.44.0/23 dekker dem.
        </p>
        <p className="mt-2 font-mono text-[12px]">
          Annonsert til BGP-naboer: 193.156.40.0/22 + 193.156.44.0/23 (2 rader)
          <br />i stedet for 6 rader.
        </p>
        <p className="mt-2 text-muted-foreground">
          Hadde ISP-en fått en sjuende blokk 193.156.46.0/24 kunne de annonsert 193.156.40.0/21 og
          dekket alle seks med én rad. Dette er hvorfor RIR-er tildeler nabo-blokker når mulig.
        </p>
      </Example>

      <Example title="Eksempel: VLSM på en bedriftsnetwork">
        <p>Vi har fått tildelt 172.20.0.0/22 og må allokere subnett for:</p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>Hovedkontor: trenger 400 hosts → /23 (510 hosts)</li>
          <li>Avdeling A: 100 hosts → /25 (126 hosts)</li>
          <li>Avdeling B: 50 hosts → /26 (62 hosts)</li>
          <li>WAN-lenke 1: 2 hosts → /30 (2 hosts)</li>
          <li>WAN-lenke 2: 2 hosts → /30 (2 hosts)</li>
        </ul>
        <p className="mt-2 font-mono text-[12px]">
          172.20.0.0/23 (hovedkontor, 0.0 – 1.255)
          <br />
          172.20.2.0/25 (Avd. A, 2.0 – 2.127)
          <br />
          172.20.2.128/26 (Avd. B, 2.128 – 2.191)
          <br />
          172.20.2.192/30 (WAN 1, 2.192 – 2.195)
          <br />
          172.20.2.196/30 (WAN 2, 2.196 – 2.199)
          <br />
          ... resten ledig
        </p>
      </Example>

      <Hvorfor title="Hvorfor reddet CIDR internett fra adresse-utmattelse på 90-tallet?">
        <p>
          Det gamle klasse-systemet (A=/8, B=/16, C=/24) hadde tre fatale problemer. /8 ga 16
          millioner adresser — alt for mye for én organisasjon. /24 ga 254 adresser — alt for lite
          for et middels stort selskap. /16 ble den eneste praktiske mellom-størrelsen, så alle ba
          om /16 — som forrente den blokken på et tiår.
        </p>
        <p>
          CIDR sa: gi organisasjonen akkurat det den trenger, med vilkårlig prefiks-lengde. Et
          selskap som trenger 1000 hosts får /22 (1022 brukbare). En liten startup får /28 (14
          hosts). Adresse- tildelingen ble plutselig 10x mer effektiv. I tillegg lot aggregering
          ISP-er annonsere én rute i stedet for hundrer, så ruting-tabellene sluttet å vokse
          eksplosivt.
        </p>
        <p>
          Uten CIDR ville IPv4 vært fullstendig oppbrukt rundt 1995-1996. CIDR + NAT kjøpte oss 25
          år ekstra — nok til at IPv6 kunne mode seg.
        </p>
      </Hvorfor>

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
            {
              term: "Basic NAT (1:1 NAT)",
              body: "Den enkle formen: ett internt-til-ekstern-adresse-bytte uten port-modifikasjon. Krever like mange offentlige adresser som interne. Brukt sjelden i dag — kun for å skjule intern topologi eller migrere mellom adresse-rom.",
            },
            {
              term: "NAPT (Network Address Port Translation)",
              body: "Det presise navnet på det folk vanligvis kaller «NAT» — bytte av både IP og port slik at mange interne hosts kan dele én offentlig IP. RFC 3022 definerer dette skarpt: «NAT» = bare adresse-bytte, «NAPT» = adresse + port. I praksis brukes ordene om hverandre.",
            },
            {
              term: "Port-forwarding",
              body: "Statisk regel i NAT-ruteren: «pakker som ankommer 84.55.12.7:8080 fra utsiden skal sendes til 192.168.1.50:80». Lar en intern server være nåbar utenfra på en valgt port. Konfigureres manuelt i ruterens admin-grensesnitt.",
            },
            {
              term: "UPnP / NAT-PMP",
              body: "Protokoller som lar en applikasjon på en intern host be NAT-en automatisk om port-forwarding (i stedet for manuell konfigurasjon). En spillkonsoll eller en BitTorrent-klient bruker UPnP for å åpne hull i NAT-en uten brukerinngrep. Sikkerhetsbekymring — kan utnyttes.",
            },
            {
              term: "Full-cone vs symmetric NAT",
              body: "Full-cone: én intern host:port mappes til én ekstern port; alle utenfor kan nå den. Symmetric: ny ekstern port for hver destinasjon. Full-cone er enkel å traversere med STUN; symmetric krever TURN-relé.",
            },
            {
              term: "Hairpinning",
              body: "Når to interne hosts på samme NAT prøver å snakke til hverandre via NAT-ens offentlige IP. NAT må reflektere pakken tilbake inn («hårnål-sving»). Eldre NAT-er klarte ikke dette — moderne gjør det.",
            },
            {
              term: "Carrier-Grade NAT (CGN, NAT444)",
              body: "Når kundens ruter er bak ISP-ens NAT, som er bak en til. Tre lag adresse-oversettelse. Vanlig i mobil-nett og i regioner med adresse-knapphet (Asia, Afrika). Bryter P2P og gjør traceroute-debugging vanskelig.",
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

      <Example title="Eksempel: NAT-pakke-trace, fra laptop til server og tilbake">
        <p>
          Laptop (192.168.1.34) på hjemme-nett åpner en TCP-forbindelse til en webserver
          (203.0.113.45:443). Hjemme-ruterens offentlige adresse er 84.55.12.7.
        </p>
        <p className="mt-2 font-mono text-[12px]">
          <strong>Steg 1 — utgående TCP SYN, før NAT:</strong>
          <br />
          src=192.168.1.34:51400 dst=203.0.113.45:443
        </p>
        <p className="mt-2 font-mono text-[12px]">
          <strong>Steg 2 — NAT oppretter mapping og skriver om:</strong>
          <br />
          src=84.55.12.7:62100 dst=203.0.113.45:443
          <br />
          (mapping lagret: 192.168.1.34:51400 ↔ 84.55.12.7:62100 ↔ 203.0.113.45:443)
        </p>
        <p className="mt-2 font-mono text-[12px]">
          <strong>Steg 3 — server svarer med SYN-ACK:</strong>
          <br />
          src=203.0.113.45:443 dst=84.55.12.7:62100
        </p>
        <p className="mt-2 font-mono text-[12px]">
          <strong>Steg 4 — NAT slår opp i tabellen, skriver om dst:</strong>
          <br />
          src=203.0.113.45:443 dst=192.168.1.34:51400
        </p>
        <p className="mt-2 text-muted-foreground">
          Hver pakke i flyten oversettes på samme måte. Mappingen holdes så lenge TCP-forbindelsen
          eksisterer (og litt etterpå — typisk noen minutter for «timeout»). Servern ser bare
          84.55.12.7:62100 — den vet ingenting om at det egentlig er en laptop bak en ruter.
        </p>
      </Example>

      <Hvorfor title="Hvorfor vant NAT — selv om alle nettverks-folk mislikte det?">
        <p>
          NAT bryter end-to-end-prinsippet, gjør P2P vanskelig, krever ekstra logikk i applikasjoner
          (STUN, ICE, TURN), og kompliserer feilsøking. Likevel ble det universelt deployet på 2000-
          tallet. Grunnen er ren økonomi: en hjemme-ruter med NAT lar hele familien dele én
          IP-adresse som ISP-en allerede gir. Alternativet — IPv6 overalt — krevde at hver eneste
          applikasjon, ruter, brannmur og server fikk dual-stack-støtte først. Det tar tiår.
        </p>
        <p>
          NAT ble en «lokal optimalisering» som hver bruker kunne installere uavhengig av alle
          andre. IPv6 krevde global koordinering. Resultatet: NAT spredte seg viralt, IPv6 sneglet
          seg fremover. I praksis betyr det at vi i 2026 fortsatt har NAT-er overalt — selv om IPv6
          nå dekker rundt 45 % av Google-trafikken.
        </p>
      </Hvorfor>

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
              term: "Match-felter i OpenFlow",
              body: "OpenFlow 1.3 definerer 40+ match-felter — inn-port, MAC src/dst, EtherType, VLAN-ID, MPLS-label, IP src/dst, IP-proto, TCP/UDP-porter, ICMP-type, IPv6-felter, m.fl. Hver flow-rad kan matche på en kombinasjon. Dramatisk mer fleksibelt enn rene IP-baserte forwarding-tabeller.",
            },
            {
              term: "Action-typer",
              body: "Mulige handlinger inkluderer: forward til port X, drop, send-to-controller (for ukjente pakker), modify-field (skriv om header), group (replikere til flere porter), meter (rate-limiting). Action-listen utføres i rekkefølge på matchende pakker.",
            },
            {
              term: "Pipeline (multi-table forwarding)",
              body: "Fra OpenFlow 1.1: en pakke passerer flere flow-tabeller etter hverandre. Tabell 0 kan gjøre L2-lookup, tabell 1 L3, tabell 2 ACL, osv. Modulærer regel-settet og lar samme matchefelter brukes på ulike måter i ulike stadier.",
            },
            {
              term: "Reaktiv vs proaktiv installasjon",
              body: "Reaktiv: når en pakke ikke matcher noen rad, sendes den til kontrolleren som beslutter en regel og pusher den. Proaktiv: kontrolleren installerer alle nødvendige regler på forhånd. Datacenter-fabrikker er typisk proaktive (forutsigbar adferd); kampus-nett er ofte reaktive.",
            },
            {
              term: "OpenFlow priority",
              body: "Hver flow-rad har et numerisk prioritets-tall. Når flere rader matcher samme pakke, vinner høyest prioritet. I motsetning til IPv4-tabellens automatiske LPM er dette eksplisitt — du må sette prioritet manuelt for å få ønsket rekkefølge.",
            },
            {
              term: "Idle-timeout / hard-timeout",
              body: "Hver flow-rad kan ha en idle-timeout (slett hvis ingen pakke matcher i N sekunder) og en hard-timeout (slett etter N sekunder uavhengig). Holder tabellene rene og frigjør TCAM-plass.",
            },
            {
              term: "Programmable data plane (P4)",
              body: "OpenFlow forutsetter et fast sett match-felter. P4 går videre: la pakkeformatet selv være programmerbart. Du skriver et P4-program som definerer headere og parsere, og kompilatoren bygger en spesialtilpasset svitsj-pipeline. Brukes av Tofino-svitsjer og Google sitt produksjonsnettverk.",
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

      <Example title="Eksempel: OpenFlow-pipeline for en multi-tenant datacenter">
        <p>
          En SDN-svitsj i et datasenter prosesserer pakker gjennom tre tabeller etter hverandre:
        </p>
        <div className="mt-2 rounded border border-border p-2 font-mono text-[11px]">
          <strong>Tabell 0 — Tenant-klassifisering:</strong>
          <br />
          match: in_port=1-8 → action: set_metadata=tenant_A, goto_table=1
          <br />
          match: in_port=9-16 → action: set_metadata=tenant_B, goto_table=1
        </div>
        <div className="mt-2 rounded border border-border p-2 font-mono text-[11px]">
          <strong>Tabell 1 — ACL (sikkerhets-policy):</strong>
          <br />
          match: metadata=tenant_A, dst_ip=10.20.0.0/16 → action: drop (isolasjon)
          <br />
          match: alle andre → action: goto_table=2
        </div>
        <div className="mt-2 rounded border border-border p-2 font-mono text-[11px]">
          <strong>Tabell 2 — Forwarding:</strong>
          <br />
          match: dst_ip=10.0.0.0/16 → action: output port 24 (spine-svitsj A)
          <br />
          match: dst_ip=10.1.0.0/16 → action: output port 25 (spine-svitsj B)
        </div>
        <p className="mt-2 text-muted-foreground">
          Pakken passerer tre faser før den sendes ut. Hver tabell har én jobb — klassifisering,
          ACL, forwarding. Hvis vi vil legge til en ny tenant trenger vi bare endre tabell 0; resten
          er uberørt. Modularitet på tvers av nettverket.
        </p>
      </Example>

      <Hvorfor title="Hvorfor vant SDN i datasentre — men ikke (ennå) i ISP-nett?">
        <p>
          Datasentre har én eier som styrer alt — Google, Microsoft, Amazon. De kan rive ut all
          eksisterende ruter-hardware og erstatte med kommodity-svitsjer styrt av sin egen
          kontroller. Gevinsten er enorm: A/B-teste nye load-balancing-strategier, programmatisk
          isolere kunder, rute trafikk basert på applikasjons-nivå kriterier. Google sin B4 SDN-WAN
          ble dokumentert å øke link-utnyttelse fra ~40 % til ~95 %.
        </p>
        <p>
          ISP-nett, derimot, må samarbeide med tusenvis av andre ISP-er via BGP, kjøre i tiår uten å
          kunne stoppe trafikk, og forholde seg til regulering. Å bytte ut hardware-rutere som
          koster millioner per stykk og kjøre alt gjennom en ny kontroller er for risikabelt. Derfor
          fortsetter ISP-er med tradisjonell distribuert ruting (med litt SDN i kantene).
        </p>
        <p>
          Lærdom: SDN vant der én organisasjon hadde full kontroll og målbar gevinst. Det er en
          arkitektonisk lærdom — radikale endringer skjer først i lukkete økosystemer, dryppene ut i
          de åpne over tid.
        </p>
      </Hvorfor>

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
            {
              term: "Extension headers",
              body: "IPv6 sin måte å håndtere valgfri funksjonalitet. Etter den faste 40-byte-headeren kan det komme 0 eller flere extension headers — Hop-by-Hop, Routing, Fragment, Destination Options, AH, ESP. Hver lenkes til neste via Next Header-feltet. Bevarer den faste hovedhederen samtidig som funksjonalitet er utvidbar.",
            },
            {
              term: "Hop Limit",
              body: "IPv6 sin versjon av TTL — 8 bits som dekrementeres på hver ruter. Pakke forkastes hvis den når 0 og ICMPv6 «Time Exceeded» sendes. Funksjonelt likt IPv4 TTL, men navnet er ærligere — det måler hop, ikke tid.",
            },
            {
              term: "Next Header",
              body: "8 bits som identifiserer hva som følger etter denne headeren — enten en extension header eller en transport-protokoll (6 for TCP, 17 for UDP, 58 for ICMPv6). Ekvivalent med IPv4 Protocol-feltet.",
            },
            {
              term: "Traffic Class",
              body: "8 bits som tilsvarer IPv4 DSCP+ECN. Brukes for QoS-merking på samme måte — operatører kan gi pakker med høy Traffic Class foretrukket behandling.",
            },
            {
              term: "Unicast vs Multicast vs Anycast",
              body: "IPv6 har tre adresse-typer. Unicast = én adresse, én mottaker. Multicast = leveres til alle medlemmer av en gruppe (ff00::/8). Anycast = leveres til nærmeste av flere mottakere som deler samme adresse — brukes for f.eks. CDN-er og DNS-rotservere. IPv6 droppet broadcast.",
            },
            {
              term: "Global unicast (2000::/3)",
              body: "IPv6 sitt offentlige adresse-rom — alt som starter med binærprefiks 001. Allokeres av RIR-er på vanlig måte. Det er 2¹²⁵ adresser her — mer enn IPv4 sitt totale rom millioner av ganger over.",
            },
            {
              term: "Unique Local Address (fc00::/7)",
              body: "IPv6 sin versjon av RFC 1918 (private adresser). Brukes innenfor en organisasjon, rutes ikke globalt. Sjeldnere brukt enn man tror — IPv6 sin overflod gjør at de fleste bare bruker globale adresser internt også.",
            },
            {
              term: "SLAAC (Stateless Address Auto-Configuration)",
              body: "IPv6 sin mekanisme der en host kan generere sin egen IP-adresse uten DHCP. Hosten kombinerer prefikset annonsert av en ruter (Router Advertisement) med en interface-ID basert på MAC-adressen sin eller en tilfeldig verdi. Ingen sentral server nødvendig.",
            },
            {
              term: "NDP (Neighbor Discovery Protocol)",
              body: "IPv6-erstatning for ARP. Bruker ICMPv6-meldinger til å finne link-layer-adresser, oppdage rutere, og detektere duplikat-adresser. Mer kraftfull enn ARP — håndterer også ruter-annonsering og parameter-discovery.",
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

      <Example title="Eksempel: SLAAC i praksis">
        <p>En laptop kobler seg på et IPv6-nett. Den har MAC-adresse 70:88:6b:8c:a4:55.</p>
        <ol className="list-decimal pl-5 mt-1 text-[12px] space-y-1">
          <li>
            Laptopen sender en Router Solicitation (RS) til <code>ff02::2</code> (alle rutere på
            link).
          </li>
          <li>
            Ruteren svarer med Router Advertisement (RA) som inkluderer prefikset
            <code> 2001:db8:cafe::/64</code> og default-gateway-info.
          </li>
          <li>
            Laptopen genererer sitt eget interface-ID. Med moderne «privacy extensions» (RFC 4941)
            velges en tilfeldig 64-bits verdi — f.eks. <code>a1c2:b3d4:e5f6:0789</code>.
          </li>
          <li>
            Full adresse: <code className="font-mono">2001:db8:cafe::a1c2:b3d4:e5f6:789</code>.
          </li>
          <li>
            Laptopen sender en Neighbor Solicitation til sin egen adresse for å sjekke at ingen
            andre bruker den (Duplicate Address Detection). Hvis ingen svarer i løpet av et sekund
            tar laptopen adressen i bruk.
          </li>
        </ol>
        <p className="mt-2 text-muted-foreground">
          Ingen DHCP-server var involvert. Nytt nett, ny adresse, ferdig konfigurert. Det er denne
          stateless-mekanismen som gjør at IPv6-nettverk i prinsippet er enklere å sette opp enn
          IPv4-nettverk.
        </p>
      </Example>

      <Example title="Eksempel: dual-stack-host som velger versjon">
        <p>
          En klient ber DNS om <code>www.eksempel.no</code>. DNS returnerer to records:
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>A: 203.0.113.45 (IPv4)</li>
          <li>AAAA: 2001:db8:1234::45 (IPv6)</li>
        </ul>
        <p className="mt-2">
          Klienten bruker «Happy Eyeballs»-algoritmen (RFC 8305): start en IPv6-tilkobling først,
          men hvis den ikke svarer innen 300 ms, start en IPv4-tilkobling parallelt. Den første som
          svarer med en TCP SYN-ACK vinner; den andre kanselleres.
        </p>
        <p className="mt-2 text-muted-foreground">
          Resultatet er at brukeren ikke merker noe om IPv6 svikter — fallback skjer på under en
          halv sekund. Dette har vært nøkkelen til å gjøre IPv6-deployering smertefri for
          sluttbrukere.
        </p>
      </Example>

      <Hvorfor title="Hvorfor er IPv6-transisjonen så treg?">
        <p>
          IPv6 ble standardisert i 1998, men i 2026 er bare ~45 % av globaltrafikk IPv6. To grunner:
          (1) NAT fungerer godt nok for det meste av IPv4-knappheten, så det finnes ikke et akutt
          press på sluttbrukerne. (2) IPv6 er ikke bakoverkompatibel med IPv4 — en IPv6-only host
          kan ikke snakke med en IPv4-only server uten en oversetter (NAT64). I praksis må alle
          parter ha dual-stack i hele transisjonsperioden, og det betyr dobbelt arbeid for alle.
        </p>
        <p>
          Mobil-operatører har gått foran (T-Mobile US, Reliance Jio er IPv6-only internt og bruker
          NAT64 for IPv4-rester). Store innholds-aktører (Google, Facebook, Netflix) har dual-stack.
          Men long-tail av små servere, eldre routere, og bedriftsnett henger igjen. Transisjonen
          forventes ferdig en gang mellom 2030 og 2040 — 30+ år etter standardiseringen.
        </p>
      </Hvorfor>

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
        Ti substantielle oppgaver som tester kapittelets sentrale begrep. Prøv selv før du klikker
        «Vis svar».
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

      <Exercise
        question="En ruter mottar tre /24-prefiks som ligger ved siden av hverandre: 198.51.96.0/24, 198.51.97.0/24, 198.51.98.0/24, og 198.51.99.0/24. Kan disse aggregeres til ett kortere prefiks? Hvis ja, hvilket? Hva ville skjedd hvis 198.51.97.0/24 manglet?"
        hint="Aggregering krever at alle adresser i det kortere prefikset er dekket av eksisterende blokker. Sjekk de fellesbitene i binær."
        answer={
          <>
            <p>
              Skriv siste oktet til hver i binær: 96 = 01100000, 97 = 01100001, 98 = 01100010, 99 =
              01100011. De første 6 bitene (011000) er felles for alle fire. Dermed deler alle fire
              30 bits prefiks → 198.51.96.0/22.
            </p>
            <p className="mt-2 font-mono text-[12px]">
              Aggregert annonsering: 198.51.96.0/22 dekker 198.51.96.0 – 198.51.99.255.
            </p>
            <p className="mt-2">
              Hvis 198.51.97.0/24 manglet, kunne vi ikke annonsert /22 — det ville inkludert et
              prefiks vi ikke eier, og våre naboer ville begynt å sende oss trafikk for 97.x som vi
              ikke kunne håndtere. Da måtte vi annonsere tre separate /24, eller mer kreativt:
              198.51.96.0/24 + 198.51.98.0/23 (de to siste deler 23 bits).
            </p>
            <p className="mt-2 text-muted-foreground">
              Lærdom: aggregering krever sammenhengende blokker som er tildelt deg, og som ligger på
              riktig binær-grense. Derfor tildeler RIR-er alltid sammenhengende blokker når mulig.
            </p>
          </>
        }
      />

      <Exercise
        question="Hva er forskjellen mellom Basic NAT, NAPT (PAT), og Carrier-Grade NAT (CGN)? For hver, hvor mange interne klienter kan dele én offentlig IPv4-adresse?"
        hint="Tenk på hva som varieres — bare IP, eller IP+port? Og hvor mange lag NAT som stables."
        answer={
          <>
            <p>
              <strong>Basic NAT (1:1):</strong> bare IP-adressen byttes. Krever én offentlig adresse
              per intern klient — i praksis ingen besparelse i adresser, kun skjuler intern
              topologi. 0 ekstra klienter per offentlig IP.
            </p>
            <p className="mt-2">
              <strong>NAPT (PAT) — det folk vanligvis kaller «NAT»:</strong> både IP og port byttes.
              Med 65 536 mulige TCP-porter (− reserverte under 1024) kan i teorien ~60 000 samtidige
              forbindelser fra interne klienter dele én offentlig IP. I praksis 5 000 – 10 000
              klienter siden hver klient har flere samtidige forbindelser.
            </p>
            <p className="mt-2">
              <strong>CGN (NAT444):</strong> ISP-en gir kunden en privat adresse (typisk fra
              100.64.0.0/10, «shared address space»), så kunden NAT-er igjen til sitt private nett.
              To lag NAT. Kan dele én offentlig adresse på 100+ kunder, men ødelegger P2P,
              port-forwarding og pålitelig geo-lokalisering.
            </p>
          </>
        }
      />

      <Exercise
        question="En OpenFlow-svitsj har en flow-tabell med tre rader (priority først i parentes): (100, dst_ip=10.0.0.0/8, action=output port 1), (200, dst_ip=10.0.0.0/16, tcp_dst=80, action=output port 2), (300, dst_ip=10.0.0.50, action=drop). Hva skjer med pakker til: (a) 10.0.0.50:443, (b) 10.0.5.10:80, (c) 10.0.1.20:22, (d) 11.0.0.1:80?"
        hint="Match alle rader som passer, deretter velg høyest priority. Ingen match = send-to-controller (eller drop hvis ingen default)."
        answer={
          <>
            <p>
              <strong>(a) 10.0.0.50:443:</strong> matches av rad 100 (10.0.0.0/8 ja) og rad 300
              (eksakt 10.0.0.50 ja). Rad 200 krever tcp_dst=80 — nei. Høyest priority blant
              matchende er 300. Pakken droppes.
            </p>
            <p className="mt-2">
              <strong>(b) 10.0.5.10:80:</strong> matches av rad 100 (10.0.0.0/8 ja) og rad 200
              (10.0.0.0/16 ja, tcp_dst=80 ja). Rad 300 krever eksakt 10.0.0.50 — nei. Høyest
              priority er 200. Pakken sendes ut på port 2.
            </p>
            <p className="mt-2">
              <strong>(c) 10.0.1.20:22:</strong> bare rad 100 matcher (rad 200 krever port 80, rad
              300 krever eksakt adresse). Pakken sendes ut på port 1.
            </p>
            <p className="mt-2">
              <strong>(d) 11.0.0.1:80:</strong> ingen rader matcher (11.x er ikke 10.0.0.0/8). Hvis
              det ikke finnes en default-regel, sendes pakken til kontrolleren (PacketIn) som
              beslutter hva som skal gjøres.
            </p>
          </>
        }
      />

      <Exercise
        question="En 100 Gbps-lenke har 1500-byte (=12 000 bit) gjennomsnittlige pakker. Beregn maks pakke-rate per sekund. Anta en TCAM med 100 ns lookup-tid — er den rask nok til linje-rate på én port? Hva med 32 porter i en kjerne-ruter?"
        hint="Pakke-rate = link-rate / pakke-størrelse. Lookup-budsjett = 1 sekund / pakke-rate."
        answer={
          <>
            <p className="font-mono text-[12px]">
              Pakke-rate = 100·10⁹ bit/s ÷ 12·10³ bit/pakke ≈ 8.33·10⁶ pakker/s ≈ 8.3 Mpps
              <br />
              Tid per pakke = 1 / 8.3·10⁶ ≈ 120 ns/pakke
              <br />
              TCAM tar 100 ns → akkurat innenfor budsjettet.
            </p>
            <p className="mt-2">
              For 32 porter parallelt: total pakke-rate = 32 · 8.3 = 266 Mpps. Hvis hver lookup tar
              100 ns på en delt TCAM, kan vi gjøre 10 Mpps. 26x for sakte.
            </p>
            <p className="mt-2 text-muted-foreground">
              Løsning: parallellise. Hver linjekort har sin egen TCAM med en kopi av
              forwarding-tabellen, så lookup skjer i 32 separate enheter samtidig. Dette er hvorfor
              high-end-rutere har distribuerte forwarding-tabeller — sentralisert TCAM blir
              flaskehals.
            </p>
            <p className="mt-2">
              Verre scenario: hvis pakkene er små (64 bytes minimum), blir rate 195 Mpps per 100
              Gbps lenke. Det er dette «small-packet performance» betyr — kjerne-rutere må klare
              det.
            </p>
          </>
        }
      />

      <Exercise
        question="En IPv6-host på et /64-subnett bruker SLAAC med privacy extensions. Forklar hvorfor en angriper på internett ikke kan fortelle hvilken fysisk maskin som genererte en bestemt IPv6-adresse — selv om de første 64 bits (prefiks) er kjente."
        hint="Hva er interface-ID-delen, og hvordan velges den med privacy extensions?"
        answer={
          <>
            <p>
              IPv6-adressen er 128 bits. De første 64 bits er typisk prefikset annonsert av ruteren
              — for eksempel <code>2001:db8:cafe:0::/64</code>. De siste 64 bits er interface-ID-en
              som hosten velger selv.
            </p>
            <p className="mt-2">
              Uten privacy extensions (eldre EUI-64-mekanisme) ble interface-ID-en utledet fra MAC-
              adressen — dermed kunne angripere både identifisere hostens hardware (de første 24
              bits av MAC er produsent-ID) og spore samme host på tvers av nettverk (interface-ID
              forblir det samme).
            </p>
            <p className="mt-2">
              Med privacy extensions (RFC 4941, RFC 8981) genererer hosten en tilfeldig 64-bits
              interface-ID — og roterer den hver dag eller hver gang den kobler seg på et nytt
              nettverk. Søkerommet er 2⁶⁴ ≈ 1.8·10¹⁹ — umulig å gjette eller skanne. Angriperen ser
              en ny adresse hver dag uten kobling til hardware.
            </p>
          </>
        }
      />

      <Exercise
        question="En ruter har inputs A, B, C som alle vil sende til output X. FIFO-input-køer brukes (ingen VOQ). Pakke-størrelse 1500 bytes, output-lenke 10 Gbps. Hver input mottar 4 Gbps fra A,B,C respektivt. Beregn hvor lenge en pakke fremst i A sin kø må vente før den får senesdt, anta at A, B, C bytter rundt rettferdig (round-robin)."
        hint="Output X kan håndtere 10 Gbps. Innkommende rate mot X er 12 Gbps. Hver pakke fremst i kø må vente sin tur."
        answer={
          <>
            <p className="font-mono text-[12px]">
              Tid å sende én pakke på 10 Gbps:
              <br />
              t_send = 1500 · 8 / 10·10⁹ = 12 000 / 10⁹·10 = 1.2 μs per pakke
            </p>
            <p className="mt-2">
              Med round-robin må A vente sin tur av tre. Hvis B og C har pakker først, må A vente på
              2 pakker × 1.2 μs = 2.4 μs før egen pakke får senesdt.
            </p>
            <p className="mt-2">
              Men: innkommende rate mot X (12 Gbps) overstiger utgående (10 Gbps). Differansen 2
              Gbps betyr at output-køen vokser med 2·10⁹ bit/s ÷ 1500·8 ≈ 167 000 pakker/sekund.
              Etter ett sekund av denne lasten har køen ~167k pakker — venting per pakke nær køens
              slutt = 167 000 × 1.2 μs ≈ 200 ms.
            </p>
            <p className="mt-2 text-muted-foreground">
              Konklusjon: når innkommende rate &gt; utgående, må noen pakker droppes (eller
              mottakeren vil oppleve massiv kø-forsinkelse). HOL-blokkering er sekundær til det
              fundamentale problemet at lenken er overbooked.
            </p>
          </>
        }
      />

      <Exercise
        question="Forklar hvordan et NAT-bypass-angrep kan fungere: en angriper på internett vil starte en TCP-forbindelse til en intern host bak NAT. Hva må stemme for at det skal lykkes? Hvilke forsvar finnes?"
        hint="NAT skaper en mapping kun for utgående forbindelser. For at innkommende SYN skal passere må det finnes en eksisterende mapping ELLER en eksplisitt regel."
        answer={
          <>
            <p>
              For at en innkommende SYN-pakke fra angriperen skal passere NAT-en må NAT-en ha en
              mapping for (kilde-IP=angriperen, dest-IP=offerets NAT-IP, dest-port=X) som peker mot
              den interne hosten. Tre måter dette kan oppstå:
            </p>
            <ol className="list-decimal pl-5 mt-2 text-[12px] space-y-1">
              <li>
                <strong>Port-forwarding-regel:</strong> brukeren har konfigurert en statisk regel
                manuelt (eller via UPnP). Angriper må kjenne porten og kan da bare nå akkurat den
                tjenesten.
              </li>
              <li>
                <strong>STUN/hole-punching:</strong> hvis intern host har «slått hull» tidligere ved
                å kontakte en STUN-server, finnes en mapping. Angriper må gjette riktig ekstern port
                — hard på symmetric NAT, lettere på full-cone.
              </li>
              <li>
                <strong>Hijacking av eksisterende forbindelse:</strong> angriper må gjette
                sekvensnumre og kapre en pågående TCP-forbindelse (vanskelig, men ikke umulig).
              </li>
            </ol>
            <p className="mt-2">
              <strong>Forsvar:</strong> bruk symmetric NAT (vanskeligere å gjette ekstern port for
              vilkårlige angripere), deaktiver UPnP på hjemme-ruteren, ikke konfigurer
              port-forwarding du ikke trenger, oppdater TCP-stack regelmessig (sekvens-nummer-
              prediksjon er forhindret av moderne stack).
            </p>
            <p className="mt-2 text-muted-foreground">
              Lærdom: NAT gir <em>noe</em> «sikkerhet ved tilfeldighet» fordi standard er at
              innkommende SYN dropps. Men det er ikke en brannmur — alltid kombiner med eksplisitt
              filterering.
            </p>
          </>
        }
      />

      <Exercise
        question="Sammenlign IPv4-header og IPv6-header felt for felt. Hvilke IPv4-felter er fjernet i IPv6? Hvilke er omdøpt eller utvidet? Hvorfor disse valgene?"
        hint="IPv4-header er variabel (20-60 bytes), IPv6 er fast 40 bytes. Sammenlign størrelse og tilstedeværelse av felter."
        answer={
          <>
            <p className="font-semibold">Fjernede felter i IPv6:</p>
            <ul className="list-disc pl-5 mt-1 text-[12px] space-y-1">
              <li>
                <strong>IHL (Internet Header Length):</strong> ikke nødvendig, da IPv6-header er
                fast 40 bytes.
              </li>
              <li>
                <strong>Identification, Flags, Fragment Offset:</strong> rutere fragmenterer ikke
                lenger; fragmentering håndteres via en valgfri extension header når sender velger
                det.
              </li>
              <li>
                <strong>Header Checksum:</strong> beskyttelse overlates til link-laget (Ethernet
                CRC) og transport-laget (TCP/UDP-checksum). Sparer re-beregning på hver ruter.
              </li>
              <li>
                <strong>Options:</strong> erstattes av extension headers, som er logisk separate.
              </li>
            </ul>
            <p className="mt-2 font-semibold">Omdøpte eller utvidede felter:</p>
            <ul className="list-disc pl-5 mt-1 text-[12px] space-y-1">
              <li>Source/Destination Address: 32 → 128 bits.</li>
              <li>TTL → Hop Limit (samme funksjon, ærligere navn).</li>
              <li>Protocol → Next Header (kan peke til extension header eller transport).</li>
              <li>Type of Service (ToS) → Traffic Class (samme funksjon, DSCP+ECN).</li>
            </ul>
            <p className="mt-2 font-semibold">Nye felter:</p>
            <ul className="list-disc pl-5 mt-1 text-[12px] space-y-1">
              <li>
                <strong>Flow Label (20 bits):</strong> avsender markerer pakker i samme «samtale»,
                rutere kan QoS-håndtere uten å parse payload-portene.
              </li>
            </ul>
            <p className="mt-2 text-muted-foreground">
              Designprinsipp: behold bare det som trengs på fast path i ruteren. Alt sjeldent
              flyttes til extension headers eller endepunktene. Resultat: enklere, raskere hardware-
              prosessering — verdt det selv om header-en er litt større (40 vs 20 bytes).
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

function Hvorfor({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-purple-700 dark:text-purple-400 font-semibold mb-1">
        Hvorfor?
      </div>
      <div className="font-semibold text-foreground mb-1">{title}</div>
      <div className="text-muted-foreground text-[13px] space-y-2">{children}</div>
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
