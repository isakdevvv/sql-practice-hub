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

type Tab = "intro" | "4.1" | "4.2" | "4.3" | "4.4" | "4.5" | "4.6" | "4.7" | "4.8" | "4.9";

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
  { id: "4.9", label: "4.9 Eksamen-fokus" },
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
            <TabBtn active={tab === "4.9"} onClick={() => setTab("4.9")} title="Eksamen-fokus">
              Eksamen
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
        {tab === "4.9" && <SectionEksamen />}

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
              body: "Per-pakke oppslag i tabell, send på riktig ut-port.",
            },
            {
              term: "Control-plane (routing)",
              body: "Bygger selve tabellen ved å snakke med naboer.",
            },
            {
              term: "Forwarding-tabell",
              body: "Mapper IP-prefiks til ut-port. Lengste match vinner.",
            },
            {
              term: "Tradisjonell ruter",
              body: "Begge planene på samme proprietær CPU i ruteren.",
            },
            {
              term: "SDN-tilnærming",
              body: "Control-plane løftet ut til sentral kontroller.",
            },
            {
              term: "Longest-prefix-match (LPM)",
              body: "Mest spesifikke prefiks vinner ved flere treff.",
            },
            {
              term: "TCAM",
              body: "Spesial-RAM som sjekker hele tabellen parallelt.",
            },
            {
              term: "Best-effort-service",
              body: "Nettverket prøver — garanterer ingenting.",
            },
            {
              term: "Forwarding vs ruting",
              body: "Lokal per pakke (ns) vs global koordinering (s).",
            },
            {
              term: "Per-pakke vs per-flow-tilstand",
              body: "Hver pakke behandles isolert — tilstandsløst og skalerbart.",
            },
            {
              term: "Match-action-paradigmet",
              body: "Regel = betingelse + handling. Generalisering av LPM.",
            },
            {
              term: "Linje-rate",
              body: "Ruteren holder samme hastighet som lenken leverer.",
            },
          ]}
        />
        <Illustration caption="Kontroll-plane bygger tabellen, data-plane bruker den per pakke. Tradisjonelt skjer begge inne i ruteren; SDN flytter control-plane ut.">
          <DataControlPlaneSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="Trafikklys vs biler">
          <p>
            Trafikklysene (control-plane) bestemmer mønsteret — hvilke veier som er åpne når. De
            byttes ikke mange ganger i sekundet; de programmeres etter trafikk-mønster.
          </p>
          <p>
            Bilene (data-plane) er det som faktisk kjører gjennom krysset. Tusenvis i timen, hver
            følger lyset uten å «forhandle». Hvis du fjerner trafikklysene blir det kaos i bilenes
            lag — men selve det å kjøre er en separat funksjon.
          </p>
        </Metafor>
        <Metafor tittel="Postsorter-anlegg med adresseliste">
          <p>
            Forwarding-tabellen er postsorter-anleggets oppslagsliste: «postnummer 9000–9099 → bånd
            3, mot Tromsø». Brevet leses, slås opp, og dyttes på riktig bånd. Selve listen
            oppdateres sjelden — av noen andre, i administrasjonen.
          </p>
        </Metafor>
      </div>

      <Illustration caption="Longest-prefix-match: en pakke til 129.242.18.55 matcher fire rader; den lengste vinner.">
        <LpmSvg />
      </Illustration>

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
              body: "Leser bits, slår opp tabell, finner ut-port.",
            },
            {
              term: "Switching-fabric",
              body: "Internt «bakplan» som flytter pakker mellom porter.",
            },
            {
              term: "Output-port",
              body: "Køer pakken og sender ut på lenken.",
            },
            {
              term: "HOL-blokkering",
              body: "Pakke fremst i FIFO sperrer alle bak seg.",
            },
            {
              term: "Pakketap",
              body: "Output-kø renner over — pakker droppes.",
            },
            {
              term: "Switching-rate",
              body: "Fabricens kapasitet å flytte pakker per sekund.",
            },
            {
              term: "Packet scheduling",
              body: "Hvem får sende neste på output-lenken.",
            },
            {
              term: "Shared-memory switch",
              body: "CPU kopierer pakker via delt minne.",
            },
            {
              term: "Shared-bus switch",
              body: "Én buss, én pakke om gangen.",
            },
            {
              term: "Crossbar switch",
              body: "N inputs × N outputs samtidig i parallell.",
            },
            {
              term: "VOQ (Virtual Output Queue)",
              body: "Én kø per output per input — eliminerer HOL.",
            },
            {
              term: "RED (Random Early Detection)",
              body: "Dropp tilfeldig før køen er full.",
            },
            {
              term: "ECN",
              body: "Marker pakken i stedet for å droppe.",
            },
            {
              term: "WFQ",
              body: "Vektet rettferdig kø — flows får andel etter vekt.",
            },
          ]}
        />
        <Illustration caption="Pakkenes vei gjennom en ruter: input-port leser header, switching-fabric flytter til riktig output-port, output-kø sender ut.">
          <RouterArchitectureSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="Postsorter-anlegg på Alnabru">
          <p>
            Brev kommer inn på løpebånd (input-port). Hvert brev avleses, postnummeret slås opp i en
            tabell, og brevet dyttes over på rett ut-bånd (switching-fabric flytter til riktig
            output-port).
          </p>
          <p>
            Ut-båndet samler brev i en sekk (output-kø) før sjåføren plukker dem opp. Hvis sekken
            blir full før sjåføren kommer, må noen brev kastes i kassen «retur» — det er pakketap.
          </p>
        </Metafor>
        <Metafor tittel="Boarding-køen som blokkerer alle">
          <p>
            HOL-blokkering: én flykø i Tromsø lufthavn. Personen fremst leter etter passet sitt og
            holder opp 30 sekunder. Bak henne står 50 personer som har klart pass og kunne sjekket
            inn på 2 sekunder hver — men de venter likevel.
          </p>
          <p>
            Løsningen (VOQ) er å åpne flere køer parallelt — én per destinasjon. Hver kø stopper
            bare seg selv, ikke de andre.
          </p>
        </Metafor>
      </div>

      <Illustration caption="HOL-blokkering: FIFO-kø sperrer pakker bak seg (venstre). VOQ åpner parallelle køer (høyre).">
        <HolVoqSvg />
      </Illustration>

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
              body: "Én IP-pakke: 20-bytes header + payload.",
            },
            {
              term: "Version",
              body: "4 bits — 4 for IPv4, 6 for IPv6.",
            },
            {
              term: "TTL (Time To Live)",
              body: "Telles ned per ruter. 0 = dropp.",
            },
            {
              term: "Protocol",
              body: "Hva payload er: 6=TCP, 17=UDP, 1=ICMP.",
            },
            {
              term: "Total length",
              body: "Header + payload i bytes. Maks 65 535.",
            },
            {
              term: "MTU",
              body: "Største ramme lenken bærer (Ethernet: 1500).",
            },
            {
              term: "Fragmentering",
              body: "For stor pakke deles; mottakeren setter sammen.",
            },
            {
              term: "Header Length (IHL)",
              body: "Header-lengde i 32-bits-ord (5 = 20 bytes).",
            },
            {
              term: "DSCP",
              body: "Prioritets-merke for QoS (f.eks. VoIP).",
            },
            {
              term: "ECN-bits",
              body: "Ruteren markerer kø-trøbbel i stedet for å droppe.",
            },
            {
              term: "Identification",
              body: "Lim som holder fragmenter sammen.",
            },
            {
              term: "Flags (DF, MF)",
              body: "DF = ikke fragmenter. MF = flere fragmenter kommer.",
            },
            {
              term: "Fragment Offset",
              body: "Hvor i original-pakken fragmentet starter (i 8-byte).",
            },
            {
              term: "Header checksum",
              body: "Sjekk-sum over headeren. Re-beregnes per ruter.",
            },
            {
              term: "Options",
              body: "Sjeldent felt — slår av hardware fast-path.",
            },
            {
              term: "Path MTU Discovery (PMTUD)",
              body: "Sender finner laveste MTU langs path før store sendes.",
            },
          ]}
        />
        <Illustration caption="IPv4-headeren ord for ord (32 bits per rad). Identification, flags og fragment-offset brukes når en pakke må deles opp på vei.">
          <Ipv4HeaderSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="Postadressen: gate.husnummer">
          <p>
            En IP-adresse er som en postadresse: nettverks-delen er gate-navnet, host-delen er
            husnummeret. <code className="font-mono text-[12px]">129.242.18.55</code> = «Storgata
            (129.242.18) hus 55».
          </p>
          <p>
            Postbudet (ruteren) trenger bare lese gata først for å sortere brevet riktig — selve
            husnummeret håndteres lokalt på rett gate.
          </p>
        </Metafor>
        <Metafor tittel="Pasienten må deles på trange dører">
          <p>
            Fragmentering er som å frakte en sofa gjennom en smal dør: ut-lenken har MTU 1500, men
            pakken er 4000 bytes. Du må kappe sofaen i delene 1500+1500+1040, merke hver del med
            samme «møbel-ID» (Identification) og rekkefølge (Fragment offset).
          </p>
          <p>
            Mottakeren limer den sammen igjen. Mister du én del, må hele sofaen sendes på nytt —
            derfor unngår vi det.
          </p>
        </Metafor>
        <Metafor tittel="TTL er som et flaskepost-stempel">
          <p>
            Hver ruter stempler «-1» på en TTL-billett. Når billetten viser 0, blir pakken kastet —
            akkurat som en flaske som har gått for lenge i sirkulasjon. Hindrer evige sløyfer hvis
            kartet er feil.
          </p>
        </Metafor>
      </div>

      <Illustration caption="Fragmentering: en 4000-byte pakke deles i tre fragmenter for å passere en lenke med MTU 1500.">
        <FragmenteringSvg />
      </Illustration>

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
              body: "Fire desimal-tall á 8 bits: 192.168.1.42.",
            },
            {
              term: "CIDR-notasjon",
              body: "adresse/lengde — /24 = 24 nettverks-bits.",
            },
            {
              term: "Subnett-maske",
              body: "/24 = 255.255.255.0. Samme som CIDR i annen form.",
            },
            {
              term: "Nettverks-adresse",
              body: "Første adresse i blokken (alle host-bits = 0).",
            },
            {
              term: "Broadcast-adresse",
              body: "Siste adresse (alle host-bits = 1).",
            },
            {
              term: "Antall brukbare hosts",
              body: "2^(32-n) − 2 (minus nettverk og broadcast).",
            },
            {
              term: "Subnetting",
              body: "Del prefiks i mindre — øk lengden med k bits gir 2^k subnett.",
            },
            {
              term: "Classless ruting",
              body: "CIDR erstattet rigid A/B/C-klasser. Fri prefiks-lengde.",
            },
            {
              term: "Rute-aggregering",
              body: "Slå sammen nabo-prefiks til ett kortere.",
            },
            {
              term: "VLSM",
              body: "Variable lengder innen samme organisasjon.",
            },
            {
              term: "Loopback (127.0.0.0/8)",
              body: "Lokal-host — sirkulerer aldri ut på nettet.",
            },
            {
              term: "Link-local (169.254.0.0/16)",
              body: "Auto-adresse hvis DHCP feiler.",
            },
            {
              term: "DHCP",
              body: "Host ber om IP-adresse fra subnettets pool.",
            },
            {
              term: "Default gateway",
              body: "Ruteren hosten sender ut-pakker til.",
            },
          ]}
        />
        <Illustration caption="Et /22 prefiks delt i fire /24-subnett. De to nye bitene gir fire kombinasjoner: 00, 01, 10, 11.">
          <SubnettingSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="Tomtedeling i Tromsø">
          <p>
            Du eier ei stor tomt på 1024 m² (en /22-blokk). Du vil dele i fire mindre tomter á 256
            m² (fire /24). Du tegner to streker — én nord-sør, én øst-vest — og får fire deler.
          </p>
          <p>
            «Strekene» tilsvarer å låne to nye bits fra host-delen. Hvert nytt bit-mønster (00, 01,
            10, 11) blir adressen til én tomt. Hver tomt får sitt eget gate-nummer-område.
          </p>
        </Metafor>
        <Metafor tittel="Slå sammen postnummer (aggregering)">
          <p>
            En lokal post-distributør i Tromsø leverer til 9000, 9001, 9002, 9003. I stedet for å
            annonsere fire postnummer mot resten av Posten, sier hun «alt som starter med 900» (=
            /22-aggregering).
          </p>
          <p>
            Ruting-tabellen i resten av landet får én rad i stedet for fire. Internett kan ikke
            eksistert uten denne kompresjonen — 900 000 rader i stedet for milliarder.
          </p>
        </Metafor>
      </div>

      <Illustration caption="CIDR-aggregering: fire /24-prefiks med felles 22 bits slås sammen til én /22-rad i naboens ruting-tabell.">
        <CidrAggregeringSvg />
      </Illustration>

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
              term: "NAT",
              body: "Bytte kilde-IP/port ut, reversér på vei inn.",
            },
            {
              term: "Private adresser (RFC 1918)",
              body: "10/8, 172.16/12, 192.168/16 — kun internt.",
            },
            {
              term: "NAT-translation-tabell",
              body: "Mapper (intern:port ↔ ekstern:port ↔ destinasjon).",
            },
            {
              term: "PAT (Port Address Translation)",
              body: "Bytte både IP og port — det folk kaller «NAT» til daglig.",
            },
            {
              term: "Middlebox",
              body: "Nett-boks som gjør mer enn ren forwarding.",
            },
            {
              term: "End-to-end-prinsippet",
              body: "Intelligens i endene, nettet flytter bare bits.",
            },
            {
              term: "NAT-traversal",
              body: "Slå hull gjennom NAT for P2P (STUN/TURN).",
            },
            {
              term: "Basic NAT (1:1)",
              body: "Bare IP byttes — én ekstern per intern.",
            },
            {
              term: "NAPT",
              body: "Presist navn for IP+port-bytte (RFC 3022).",
            },
            {
              term: "Port-forwarding",
              body: "Statisk inn-regel for å nå en intern server.",
            },
            {
              term: "UPnP / NAT-PMP",
              body: "App ber NAT om å åpne hull automatisk.",
            },
            {
              term: "Full-cone vs symmetric NAT",
              body: "Full-cone: fast ekstern port. Symmetric: ny per mål.",
            },
            {
              term: "Hairpinning",
              body: "To interne snakker via NAT-ens offentlige IP.",
            },
            {
              term: "Carrier-Grade NAT (CGN)",
              body: "NAT på toppen av NAT — to+ lag oversettelse.",
            },
          ]}
        />
        <Illustration caption="NAT-ruteren skriver om kilde-IP og kilde-port på vei ut, og reverserer på vei inn. Resultatet er at de tre interne hostene deler én offentlig adresse.">
          <NatTranslationSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="Hotellet med én gate-adresse">
          <p>
            Hotellet «Rica Tromsø» har én gate-adresse: Storgata 44. Gjestene har rom-numre internt
            (101, 102, 103) — men disse rom-numrene finnes ikke i postsystemet. Alt utgående post
            stemples med hotellets adresse pluss «konvolutt-ID» (porten).
          </p>
          <p>
            Når et svar kommer inn til Storgata 44 med konvolutt-ID 62002, ser resepsjonen
            (NAT-ruteren) i sin egen lille bok: «62002 → rom 102». Brevet videresendes internt.
          </p>
          <p>
            Hva som ikke fungerer: noen utenfra kan ikke skrive «til rom 102, Rica Tromsø» — fordi
            postsystemet kjenner ikke rom-numre. Det må alltid være rommet som starter
            korrespondansen først.
          </p>
        </Metafor>
        <Metafor tittel="Slå hull gjennom døra">
          <p>
            STUN/hole-punching er som å åpne en dør innenfra: når Alice i hjemmenett A og Bob i
            hjemmenett B begge sender en pakke mot hverandre samtidig, lager hver NAT en åpning for
            den andre.
          </p>
          <p>
            En STUN-server (på offentlig internett) sier til hver av dem: «Du framstår som
            X.Y.Z.W:port for meg». Begge bruker dette til å peke mot hverandre. Den første utgående
            pakken «slår hull» — neste innkommende fra rett peer slipper inn.
          </p>
        </Metafor>
      </div>

      <Illustration caption="Hole-punching gjennom to NAT-er: STUN-server forteller hver klient sin egen offentlige adresse; klientene sender mot hverandre samtidig.">
        <HolePunchingSvg />
      </Illustration>

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
        <div className="mt-2 rounded bg-background/60 p-2">
          <NatTimelineSvg />
        </div>
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
              body: "Regel = betingelse (alle felt) + handling.",
            },
            {
              term: "OpenFlow",
              body: "Standard protokoll kontroller ↔ ruter.",
            },
            {
              term: "Flow-tabell",
              body: "Lagrer match-action-regler på ruteren.",
            },
            {
              term: "Kontroller",
              body: "Sentralt hjerne — har helhetsbildet, pusher regler.",
            },
            {
              term: "Northbound API",
              body: "Apper → kontroller. Policy som software.",
            },
            {
              term: "Southbound API",
              body: "Kontroller → ruter, typisk OpenFlow.",
            },
            {
              term: "Match-felter i OpenFlow",
              body: "40+ felt: porter, MAC, VLAN, IP, TCP/UDP, ICMP.",
            },
            {
              term: "Action-typer",
              body: "Forward, drop, modify, group, meter, send-til-kontroller.",
            },
            {
              term: "Pipeline (multi-table)",
              body: "Pakken går gjennom flere tabeller i serie.",
            },
            {
              term: "Reaktiv vs proaktiv",
              body: "Spør kontroller ved miss vs preinstaller alt.",
            },
            {
              term: "OpenFlow priority",
              body: "Eksplisitt tall avgjør hvem som vinner ved flere treff.",
            },
            {
              term: "Idle/hard-timeout",
              body: "Slett rad ved inaktivitet eller etter fast tid.",
            },
            {
              term: "Programmable data plane (P4)",
              body: "Selve pakkeformatet programmeres — ikke bare reglene.",
            },
          ]}
        />
        <Illustration caption="SDN-arkitekturen: kontrolleren har et helhetsbilde og skyver flow-regler til alle rutere via OpenFlow. Applikasjoner snakker med kontrolleren via en northbound API.">
          <SdnArchitectureSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="Vegtrafikksentralen i Mosjøen">
          <p>
            Tradisjonelt: hver kommune programmerer sine egne trafikklys. Resultat: lysmønstre er
            ikke-koordinert; det er ingen som ser hele bilde-bildet.
          </p>
          <p>
            SDN: én leder i Vegtrafikksentralen ser hele E6 i sanntid. Hun bestemmer alle lysene fra
            Trondheim til Bodø samtidig — kan rute trafikk rundt en ulykke, prioritere ambulanse,
            grønn bølge til pendlere.
          </p>
        </Metafor>
        <Metafor tittel="Husnøkler bestemt av sentral-systemet">
          <p>
            Match-action er som et kort-lås-system på et hotell. Kortleseren leser bare:
            «kortnummer-mønster X» (match), og åpner riktig dør (action). Hotelldirektøren
            (kontrolleren) bestemmer hvilke kort skal åpne hva — og kan endre det fra én skjerm,
            uten å bytte låsene.
          </p>
        </Metafor>
        <Metafor tittel="Apotek-resepter i flere stadier">
          <p>
            En OpenFlow-pipeline er som et apotek der pasienten passerer flere disker: først
            ID-sjekk (tabell 0), så resept-validering (tabell 1), så utlevering (tabell 2). Hver
            disk har sin spesial-funksjon og videresender pasienten med et stempel («metadata»).
          </p>
        </Metafor>
      </div>

      <Illustration caption="OpenFlow match-action: pakken matches mot tabell-rader; raden med høyest priority bestemmer handlingen.">
        <MatchActionSvg />
      </Illustration>

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
              body: "Åtte hex-grupper á 4 tegn; nuller komprimeres med ::.",
            },
            {
              term: "Fast header (40 bytes)",
              body: "Alltid samme størrelse — enklere for hardware.",
            },
            {
              term: "Ingen fragmentering på rutere",
              body: "Kun sender klipper. ICMPv6 Packet Too Big.",
            },
            {
              term: "Ingen header checksum",
              body: "Spares re-beregning per hop.",
            },
            {
              term: "Flow label",
              body: "20-bits «samtale-ID» for QoS uten payload-parsing.",
            },
            {
              term: "Dual-stack",
              body: "Host kjører IPv4 og IPv6 parallelt.",
            },
            {
              term: "Tunnelering",
              body: "IPv6 pakket inn i IPv4 gjennom v4-strekning.",
            },
            {
              term: "Extension headers",
              body: "Valgfrie tillegg etter hoved-headeren.",
            },
            {
              term: "Hop Limit",
              body: "IPv6 sin TTL. Ærligere navn.",
            },
            {
              term: "Next Header",
              body: "Hva følger etter — extension eller transport.",
            },
            {
              term: "Traffic Class",
              body: "IPv6 sin DSCP+ECN.",
            },
            {
              term: "Unicast / Multicast / Anycast",
              body: "Én / gruppe / nærmeste. Ingen broadcast i IPv6.",
            },
            {
              term: "Global unicast (2000::/3)",
              body: "Det offentlige adresse-rommet i IPv6.",
            },
            {
              term: "Unique Local (fc00::/7)",
              body: "IPv6 sin RFC 1918 — privat, rutes ikke globalt.",
            },
            {
              term: "SLAAC",
              body: "Host genererer sin IP-adresse uten DHCP.",
            },
            {
              term: "NDP",
              body: "IPv6 erstatning for ARP — finn naboer via ICMPv6.",
            },
          ]}
        />
        <Illustration caption="IPv4-header (variabel størrelse, mange felter) versus IPv6-header (fast 40 bytes, færre men bredere felt).">
          <Ipv6HeaderSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="Telefonnummeret som ble for kort">
          <p>
            På 1970-tallet hadde Norge fem-sifrede telefonnummer. Det dekket «alt vi noensinne
            kommer til å trenge». Så kom mobiler, datalinjer, faks, ISDN — og nummerne tok slutt.
            Telenor måtte utvide til åtte sifre.
          </p>
          <p>
            IPv4: 32 bits = 4.3 mrd «nummer». Tok slutt rundt 2011. IPv6: 128 bits = 3.4·10³⁸. Mer
            enn nok til hvert sandkorn på jorden. Det er samme historien om numre som ble for korte.
          </p>
        </Metafor>
        <Metafor tittel="Maleren slipper å finne kruka selv (SLAAC)">
          <p>
            Med IPv4 + DHCP: hver gang du flytter inn i et nytt hus, må du ringe oppvaskhjelpa
            (DHCP-serveren) som tildeler husnummer. Uten serveren — ingen adresse.
          </p>
          <p>
            Med IPv6 SLAAC: huset har en stor adresse-blokk på veggen (Router Advertisement). Du
            finner et tilfeldig ledig nummer selv, sjekker at ingen har det, og tar det i bruk.
            Ingen tildelings-server nødvendig.
          </p>
        </Metafor>
        <Metafor tittel="Brevet pakket i en større konvolutt (tunnelering)">
          <p>
            Du vil sende et IPv6-brev fra Tromsø til Oslo, men strekket gjennom Bodø går bare gammel
            IPv4-post. Løsning: legg IPv6-brevet inne i en IPv4-konvolutt mellom de to IPv6-øyene.
            Bodø-post håndterer ytterkonvolutten; Oslo åpner ytterkonvolutten og leverer indre brev.
          </p>
        </Metafor>
      </div>

      <Illustration caption="SLAAC i tre steg: ruter annonserer prefiks, host genererer interface-ID, sjekker duplikat, tar adressen i bruk.">
        <SlaacSvg />
      </Illustration>

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
// Section 4.9 — Eksamen-fokus
// ============================================================

function SectionEksamen() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="4.9" title="Eksamen-fokus" />
      <p className="text-muted-foreground">
        Kompakt repetisjon for hele kap. 4. Bruk dette etter at du har jobbet deg gjennom 4.1–4.7 og
        prøvd oppgavene i 4.8 — det er ikke en snarvei, men en kondensering.
      </p>

      {/* a) Cheat sheet */}
      <Cheat tittel="Cheat sheet — data-plane på én side">
        <div className="space-y-3">
          <div>
            <div className="font-semibold text-foreground mb-1">
              IPv4-header — feltene som dukker opp på eksamen
            </div>
            <div className="rounded bg-background/60 p-2 mb-2">
              <Ipv4HeaderGridSvg />
            </div>
            <ul className="list-disc pl-5 space-y-0.5">
              <li>
                <span className="font-mono">TTL</span> (8 bits): dekrementeres av hver ruter. Når
                den blir 0 droppes pakken og ICMP «Time Exceeded» returneres. Stopper looper.
              </li>
              <li>
                <span className="font-mono">Protocol</span> (8 bits): hvilket transport-protokoll
                payload tilhører. 6 = TCP, 17 = UDP, 1 = ICMP.
              </li>
              <li>
                <span className="font-mono">Header Checksum</span> (16 bits): bare over header-en,
                ikke payload. Må regnes på nytt av hver ruter fordi TTL endrer seg.
              </li>
              <li>
                <span className="font-mono">Source IP / Destination IP</span> (32 bits hver):
                endepunkts-adresser. Forwarding-beslutningen bruker dest. ip mot LPM-tabellen.
              </li>
              <li>
                <span className="font-mono">Identification / Flags / Fragment Offset</span>:
                fragmentering, brukes hvis pakken er større enn link-MTU.
              </li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-foreground mb-1">
              CIDR-tabell — host-tellinger å pugge
            </div>
            <table className="w-full text-[12px] font-mono border border-border">
              <thead className="bg-muted/30">
                <tr>
                  <th className="border border-border px-2 py-1 text-left">Prefiks</th>
                  <th className="border border-border px-2 py-1 text-left">Host-bits</th>
                  <th className="border border-border px-2 py-1 text-left">Totalt</th>
                  <th className="border border-border px-2 py-1 text-left">Brukbare hosts</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border px-2 py-1">/8</td>
                  <td className="border border-border px-2 py-1">24</td>
                  <td className="border border-border px-2 py-1">16 777 216</td>
                  <td className="border border-border px-2 py-1">≈ 16,7 M</td>
                </tr>
                <tr>
                  <td className="border border-border px-2 py-1">/16</td>
                  <td className="border border-border px-2 py-1">16</td>
                  <td className="border border-border px-2 py-1">65 536</td>
                  <td className="border border-border px-2 py-1">65 534</td>
                </tr>
                <tr>
                  <td className="border border-border px-2 py-1">/24</td>
                  <td className="border border-border px-2 py-1">8</td>
                  <td className="border border-border px-2 py-1">256</td>
                  <td className="border border-border px-2 py-1">254</td>
                </tr>
                <tr>
                  <td className="border border-border px-2 py-1">/27</td>
                  <td className="border border-border px-2 py-1">5</td>
                  <td className="border border-border px-2 py-1">32</td>
                  <td className="border border-border px-2 py-1">30</td>
                </tr>
                <tr>
                  <td className="border border-border px-2 py-1">/30</td>
                  <td className="border border-border px-2 py-1">2</td>
                  <td className="border border-border px-2 py-1">4</td>
                  <td className="border border-border px-2 py-1">2</td>
                </tr>
              </tbody>
            </table>
            <div className="text-[11px] text-muted-foreground mt-1">
              Brukbare hosts = 2^(host-bits) − 2 (nettverks-adressen + broadcast er reservert). For
              /31 og /30 brukes spesialregler på punkt-til-punkt-lenker.
            </div>
          </div>

          <div>
            <div className="font-semibold text-foreground mb-1">CIDR — binær-trikset</div>
            <div className="rounded bg-background/60 p-2 mb-2">
              <CidrBitBarSvg />
            </div>
            <ul className="list-disc pl-5 space-y-0.5">
              <li>
                Prefiks-bitene (venstre del) er <em>felles</em> for alle adressene i blokken.
                Host-bitene (høyre del) <em>varierer</em>.
              </li>
              <li>
                Eksempel: <span className="font-mono">192.168.4.0/22</span>. /22 betyr de 22 første
                bits er låst. I tredje oktet <span className="font-mono">00000100</span> er de
                første 6 bits prefiks (=000001), de to siste bits + hele fjerde oktet er host — dvs.
                blokken dekker .4.0 til .7.255.
              </li>
              <li>
                <strong>Snarvei:</strong> blokkstørrelsen i siste fri oktet er 2^(8 −
                bits-i-den-oktetten). For /22 har tredje oktet 6 prefiks-bits → 2 host-bits →
                blokk-størrelse 4.
              </li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-foreground mb-1">
              NAT-typer — fra streng til løs filtrering
            </div>
            <div className="rounded bg-background/60 p-2 mb-2">
              <NatTypesSvg />
            </div>
            <ul className="list-disc pl-5 space-y-0.5">
              <li>
                <strong>Full-cone:</strong> én intern (IP:port) → fast ekstern (IP:port). Hvem som
                helst på utsiden kan sende inn til den eksterne (IP:port).
              </li>
              <li>
                <strong>Restricted-cone:</strong> som over, men ekstern part må først ha mottatt en
                pakke fra den interne IP-en før den får svare.
              </li>
              <li>
                <strong>Port-restricted-cone:</strong> stramt versjonen — ekstern part må ha mottatt
                pakke fra eksakt samme (IP:port) på innsiden.
              </li>
              <li>
                <strong>Symmetric:</strong> nyt eksternt (IP:port) tildelt per destinasjon. Verst
                for hole-punching og P2P — to forskjellige tjenester ser to forskjellige
                kilde-portene.
              </li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-foreground mb-1">SDN — kjernen i én setning</div>
            <div className="rounded bg-background/60 p-2 mb-2">
              <SdnPipelineSvg />
            </div>
            <ul className="list-disc pl-5 space-y-0.5">
              <li>
                Switchen er en <em>match-action-pipeline</em>: flow-tabellen sjekker header-felt
                (match), og hvis treff utfører action (forward, drop, modify, send-til-controller).
              </li>
              <li>
                <strong>OpenFlow</strong> er protokollen mellom switch og controller. Controlleren
                installerer flow-entries proaktivt eller reaktivt («packet-in» når ingen entry
                matchet).
              </li>
              <li>
                Det er <em>logisk sentralisert</em>, ikke fysisk — controlleren kan være klynge med
                høy-tilgjengelighet.
              </li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-foreground mb-1">IPv6 — tellingen</div>
            <div className="rounded bg-background/60 p-2 mb-2">
              <Ipv6AddressLayoutSvg />
            </div>
            <ul className="list-disc pl-5 space-y-0.5">
              <li>
                128 bits totalt = 8 grupper × 16 bits = 8 grupper × 4 hex-tegn. Adressen skrives{" "}
                <span className="font-mono">xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx</span>.
              </li>
              <li>
                Forkortelser: lederose nuller i hver gruppe kan droppes, og ett sammenhengende løp
                av null-grupper kan kollapses til <span className="font-mono">::</span> (men bare
                ett slikt løp per adresse — ellers blir det tvetydig).
              </li>
              <li>
                Header er <em>40 bytes fast</em> (mot IPv4 sin variable 20+ bytes). Extension
                headers ligger etter, hopper man over på fast path.
              </li>
            </ul>
          </div>
        </div>
      </Cheat>

      {/* b) Sammenligning IPv4 vs IPv6 */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-[10px] uppercase tracking-wider text-brand font-semibold mb-2">
          Sammenligning
        </div>
        <div className="font-semibold text-foreground mb-2">
          IPv4 vs IPv6 — hva skiller dem reelt
        </div>
        <div className="rounded bg-background/60 p-2 mb-3">
          <Ipv4VsIpv6Svg />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] border border-border">
            <thead className="bg-muted/30">
              <tr>
                <th className="border border-border px-2 py-1 text-left">Aspekt</th>
                <th className="border border-border px-2 py-1 text-left">IPv4</th>
                <th className="border border-border px-2 py-1 text-left">IPv6</th>
              </tr>
            </thead>
            <tbody className="text-foreground">
              <tr>
                <td className="border border-border px-2 py-1 font-semibold">Adresse-størrelse</td>
                <td className="border border-border px-2 py-1">32 bits ≈ 4,3 milliarder unike</td>
                <td className="border border-border px-2 py-1">
                  128 bits ≈ 3,4 × 10³⁸ unike — praktisk uendelig
                </td>
              </tr>
              <tr>
                <td className="border border-border px-2 py-1 font-semibold">
                  Header-størrelse og felt
                </td>
                <td className="border border-border px-2 py-1">
                  20–60 bytes, variabelt (Options-felt), 13 felt
                </td>
                <td className="border border-border px-2 py-1">
                  40 bytes fast, 8 felt + extension headers utenfor fast-path
                </td>
              </tr>
              <tr>
                <td className="border border-border px-2 py-1 font-semibold">Fragmentering</td>
                <td className="border border-border px-2 py-1">
                  Både endepunkt og rutere kan fragmentere (Identification, Flags, Offset)
                </td>
                <td className="border border-border px-2 py-1">
                  Kun endepunkt fragmenterer; rutere dropper for store pakker og sender ICMPv6
                  «Packet Too Big»
                </td>
              </tr>
              <tr>
                <td className="border border-border px-2 py-1 font-semibold">Behov for NAT</td>
                <td className="border border-border px-2 py-1">
                  Nesten universell pga. adresseknapphet — én offentlig IP deler ofte mange hosts
                </td>
                <td className="border border-border px-2 py-1">
                  Ikke nødvendig i prinsippet; hver enhet kan ha global adresse
                </td>
              </tr>
              <tr>
                <td className="border border-border px-2 py-1 font-semibold">Sikkerhet</td>
                <td className="border border-border px-2 py-1">
                  IPsec er valgfritt tillegg; mange enheter har det ikke konfigurert
                </td>
                <td className="border border-border px-2 py-1">
                  IPsec-rammeverk del av spec-en, men i praksis fortsatt valgfritt å bruke
                </td>
              </tr>
              <tr>
                <td className="border border-border px-2 py-1 font-semibold">Deployment-status</td>
                <td className="border border-border px-2 py-1">
                  Dominerende i eldre nett, dypt rotfestet i applikasjoner og config
                </td>
                <td className="border border-border px-2 py-1">
                  Vokser jevnt (≈ 40–45 % i flere store ISP-er i 2025), dual-stack er normalen i
                  overgangsperioden
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* c) Beslutningstre — hvor i ruteren skjer dette? */}
      <Illustration caption="Beslutningstre: hvilken del av ruteren håndterer dette? Spør deg selv: skjer det per-pakke (data-plane) eller per-event (control-plane)?">
        <RuterBeslutningstreSvg />
      </Illustration>

      {/* d) Vanlige fallgruver */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-[10px] uppercase tracking-wider text-rose-700 dark:text-rose-400 font-semibold mb-2">
          Vanlige fallgruver
        </div>
        <div className="space-y-3">
          <Fallgruve tittel="«NAT er en brannmur»">
            NAT er pragmatisk adresse-deling, ikke sikkerhet. At innkommende pakker uten tilstand i
            tabellen droppes er en bivirkning, ikke et sikkerhetsdesign. En ekte brannmur har
            policy, logging og bevisst stateful inspection. Bruker du NAT som FW har du ingen policy
            — bare standardoppførselen til en mapping-tabell.
            <div className="mt-2 rounded bg-background/60 p-2">
              <NatVsFwSvg />
            </div>
          </Fallgruve>
          <Fallgruve tittel="Subnetting og supernetting forveksles">
            Subnetting = dele en blokk i mindre deler (lengre prefiks: /16 → /18, /18, /18, /18).
            Supernetting / CIDR-aggregering = slå sammen flere små blokker til én (kortere prefiks:
            fire /24 → ett /22). Eksamensspørsmål bruker ofte «aggregering» for det siste — pass på
            retningen.
            <div className="mt-2 rounded bg-background/60 p-2">
              <SubnetSupernetSvg />
            </div>
          </Fallgruve>
          <Fallgruve tittel="«IP-fragmentering skjer i transport-laget»">
            Nei — IP-fragmentering er rent et nettverkslag-fenomen og skjer på pakke-nivå. TCP gjør
            sin egen segmentering (basert på MSS) for å unngå å havne i IP-fragmentering, men det er
            to ulike mekanismer. UDP fragmenteres på IP-nivå hvis datagrammet er for stort.
            <div className="mt-2 rounded bg-background/60 p-2">
              <LayerPyramidSvg />
            </div>
          </Fallgruve>
          <Fallgruve tittel="«Lengste prefiks» = lengste streng">
            Longest Prefix Match (LPM) sammenligner antall match-bits, ikke antall sifre i
            tekstrepresentasjonen. <span className="font-mono">10.0.0.0/24</span> har lengre prefiks
            enn <span className="font-mono">10.0.0.0/16</span>, ikke kortere.
            <div className="mt-2 rounded bg-background/60 p-2">
              <LpmBinarySvg />
            </div>
          </Fallgruve>
          <Fallgruve tittel="Glemmer å trekke fra 2 i host-tellingen">
            En /24 har 256 adresser totalt, men kun 254 brukbare host-adresser — .0 er
            nettverksadressen og .255 er broadcast. Eksamensoppgaver er nådeløse på denne
            differansen.
          </Fallgruve>
          <Fallgruve tittel="«SDN-controlleren tar hver pakke»">
            Bare miss-pakker (uten match i flow-tabellen) sendes til controller. Hovedstrømmen
            følger pre-installerte flow-entries og kjører i hardware-fart på switchen. Controlleren
            er for policy, ikke for per-pakke-prosessering.
          </Fallgruve>
          <Fallgruve tittel="«TTL teller millisekunder»">
            TTL er navn-historisk — feltet teller hop, ikke tid. Hver ruter som videresender pakken
            dekrementerer TTL med 1; når den treffer 0 droppes pakken. Initialverdier er typisk 64,
            128 eller 255.
          </Fallgruve>
          <Fallgruve tittel="Antar at NAT bevarer port-numre">
            Mange NAT-implementasjoner bytter port for å unngå kollisjon (to interne hosts som begge
            bruker kilde-port 5000). En tjeneste som hardkoder port på utsiden vil derfor ikke
            fungere — det er det STUN, TURN og hole-punching er til for.
          </Fallgruve>
          <Fallgruve tittel="«IPv6 adresser er bare lengre IPv4»">
            IPv6 endrer flere ting enn lengden: ingen header-checksum, ingen ruter-fragmentering,
            ingen broadcast (multicast erstatter), SLAAC for autokonfigurasjon, extension headers i
            stedet for Options. Mange protokoller (ARP → NDP, DHCP → DHCPv6) byttes også ut.
          </Fallgruve>
        </div>
      </div>

      {/* e) 5-minutter-anker */}
      <Anker tittel="5-minutter-anker — 12 kjernepunkter">
        <div className="rounded bg-background/60 p-2 mb-3">
          <AnkerCardsSvg />
        </div>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>
            <strong>Data-plane = per-pakke i hardware</strong> (forward, drop). Control-plane =
            per-event i software (oppdater tabellen).
          </li>
          <li>
            <strong>Ruter-arkitektur:</strong> input-port → switching fabric → output-port. Hver del
            kan være flaskehals.
          </li>
          <li>
            <strong>Input-port gjør Longest Prefix Match</strong> mot forwarding-tabellen og avgjør
            utgang.
          </li>
          <li>
            <strong>Output-port gjør køing og scheduling</strong> (FIFO, prioritet, fair queueing,
            WRED).
          </li>
          <li>
            <strong>IPv4-header er 20 bytes</strong> minimum, med TTL og Header Checksum som endrer
            seg per hop.
          </li>
          <li>
            <strong>CIDR-prefiks låser de venstre N bitene;</strong> resten er host-bits. Brukbare
            hosts = 2^(host-bits) − 2.
          </li>
          <li>
            <strong>Subnetting deler en blokk;</strong> aggregering slår sammen flere — eksamen
            tester begge retninger.
          </li>
          <li>
            <strong>NAT erstatter (IP:port) på vei ut</strong> og slår opp i mapping-tabellen på vei
            inn. Pakker uten mapping droppes (default).
          </li>
          <li>
            <strong>NAT bryter ende-til-ende-prinsippet</strong> og lager problemer for P2P, IPsec
            og protokoller med IP-adresser i payload (FTP, SIP).
          </li>
          <li>
            <strong>SDN flytter logikken til controller via OpenFlow;</strong> switchen forblir en
            dum, men rask, match-action-motor.
          </li>
          <li>
            <strong>IPv6 = 128 bits</strong> i 8 hex-grupper, fast 40-byte-header, ingen
            ruter-fragmentering, ingen broadcast.
          </li>
          <li>
            <strong>Dual-stack</strong> er hovedstrategien i overgangen: enheter snakker både IPv4
            og IPv6, og velger per destinasjon.
          </li>
        </ol>
      </Anker>
    </article>
  );
}

// Helpers for eksamen-tab
function Cheat({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
        Cheat sheet
      </div>
      <div className="font-semibold text-foreground mb-2">{tittel}</div>
      <div className="text-[13px] text-foreground space-y-2">{children}</div>
    </div>
  );
}

function Fallgruve({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3">
      <div className="font-semibold text-rose-700 dark:text-rose-400 text-[13px] mb-1">
        ⚠ {tittel}
      </div>
      <div className="text-[12.5px] text-muted-foreground">{children}</div>
    </div>
  );
}

function Anker({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-sky-700 dark:text-sky-400 font-semibold mb-1">
        5-minutter-anker
      </div>
      <div className="font-semibold text-foreground mb-2">{tittel}</div>
      <div className="text-[13px] text-foreground">{children}</div>
    </div>
  );
}

// Beslutningstre SVG: hvor i ruteren skjer dette?
function RuterBeslutningstreSvg() {
  // Layout: root at top center, three children for plane choice, then leaves for stages.
  return (
    <svg viewBox="0 0 760 420" className="w-full h-auto">
      {/* Root */}
      <rect
        x={300}
        y={10}
        width={160}
        height={42}
        rx={6}
        className="fill-brand/10 stroke-brand"
        strokeWidth={1.5}
      />
      <text
        x={380}
        y={28}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Hvor i ruteren?
      </text>
      <text x={380} y={42} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        Per-pakke eller per-event?
      </text>

      {/* Branches */}
      <line x1={380} y1={52} x2={130} y2={90} className="stroke-border" strokeWidth={1.5} />
      <line x1={380} y1={52} x2={380} y2={90} className="stroke-border" strokeWidth={1.5} />
      <line x1={380} y1={52} x2={630} y2={90} className="stroke-border" strokeWidth={1.5} />

      <text x={235} y={75} className="fill-muted-foreground text-[10px]" textAnchor="middle">
        per-pakke, mottatt
      </text>
      <text x={380} y={75} className="fill-muted-foreground text-[10px]" textAnchor="middle">
        per-pakke, sendt
      </text>
      <text x={510} y={75} className="fill-muted-foreground text-[10px]" textAnchor="middle">
        per-event
      </text>

      {/* Level 2 nodes: Input port, Output port, Control plane */}
      <rect
        x={50}
        y={90}
        width={160}
        height={40}
        rx={6}
        className="fill-card stroke-border"
        strokeWidth={1.5}
      />
      <text
        x={130}
        y={108}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Input-port
      </text>
      <text x={130} y={122} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        Data-plane
      </text>

      <rect
        x={300}
        y={90}
        width={160}
        height={40}
        rx={6}
        className="fill-card stroke-border"
        strokeWidth={1.5}
      />
      <text
        x={380}
        y={108}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Switching fabric → Output-port
      </text>
      <text x={380} y={122} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        Data-plane
      </text>

      <rect
        x={550}
        y={90}
        width={160}
        height={40}
        rx={6}
        className="fill-card stroke-border"
        strokeWidth={1.5}
      />
      <text
        x={630}
        y={108}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Kontrollplan
      </text>
      <text x={630} y={122} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        CPU / SDN-controller
      </text>

      {/* Leaves under Input-port */}
      <line x1={130} y1={130} x2={70} y2={170} className="stroke-border" strokeWidth={1.2} />
      <line x1={130} y1={130} x2={195} y2={170} className="stroke-border" strokeWidth={1.2} />
      <rect
        x={10}
        y={170}
        width={120}
        height={50}
        rx={5}
        className="fill-emerald-500/10 stroke-emerald-500"
        strokeWidth={1.2}
      />
      <text
        x={70}
        y={188}
        textAnchor="middle"
        className="fill-foreground text-[10.5px] font-semibold"
      >
        LPM-oppslag
      </text>
      <text x={70} y={203} textAnchor="middle" className="fill-muted-foreground text-[9.5px]">
        Velg utgangsport
      </text>
      <text x={70} y={214} textAnchor="middle" className="fill-muted-foreground text-[9.5px]">
        basert på dest. IP
      </text>

      <rect
        x={140}
        y={170}
        width={130}
        height={50}
        rx={5}
        className="fill-emerald-500/10 stroke-emerald-500"
        strokeWidth={1.2}
      />
      <text
        x={205}
        y={188}
        textAnchor="middle"
        className="fill-foreground text-[10.5px] font-semibold"
      >
        TTL-dekrement
      </text>
      <text x={205} y={203} textAnchor="middle" className="fill-muted-foreground text-[9.5px]">
        + ny header-checksum
      </text>
      <text x={205} y={214} textAnchor="middle" className="fill-muted-foreground text-[9.5px]">
        før forwarding
      </text>

      {/* Leaves under Switching/Output */}
      <line x1={380} y1={130} x2={320} y2={170} className="stroke-border" strokeWidth={1.2} />
      <line x1={380} y1={130} x2={445} y2={170} className="stroke-border" strokeWidth={1.2} />
      <rect
        x={260}
        y={170}
        width={120}
        height={50}
        rx={5}
        className="fill-emerald-500/10 stroke-emerald-500"
        strokeWidth={1.2}
      />
      <text
        x={320}
        y={188}
        textAnchor="middle"
        className="fill-foreground text-[10.5px] font-semibold"
      >
        Køing
      </text>
      <text x={320} y={203} textAnchor="middle" className="fill-muted-foreground text-[9.5px]">
        FIFO / prioritet /
      </text>
      <text x={320} y={214} textAnchor="middle" className="fill-muted-foreground text-[9.5px]">
        drop-policy (WRED)
      </text>

      <rect
        x={390}
        y={170}
        width={120}
        height={50}
        rx={5}
        className="fill-emerald-500/10 stroke-emerald-500"
        strokeWidth={1.2}
      />
      <text
        x={450}
        y={188}
        textAnchor="middle"
        className="fill-foreground text-[10.5px] font-semibold"
      >
        Scheduling
      </text>
      <text x={450} y={203} textAnchor="middle" className="fill-muted-foreground text-[9.5px]">
        round-robin /
      </text>
      <text x={450} y={214} textAnchor="middle" className="fill-muted-foreground text-[9.5px]">
        weighted fair queueing
      </text>

      {/* Leaves under Kontrollplan */}
      <line x1={630} y1={130} x2={570} y2={170} className="stroke-border" strokeWidth={1.2} />
      <line x1={630} y1={130} x2={695} y2={170} className="stroke-border" strokeWidth={1.2} />
      <rect
        x={510}
        y={170}
        width={120}
        height={50}
        rx={5}
        className="fill-sky-500/10 stroke-sky-500"
        strokeWidth={1.2}
      />
      <text
        x={570}
        y={188}
        textAnchor="middle"
        className="fill-foreground text-[10.5px] font-semibold"
      >
        Tabell-oppdatering
      </text>
      <text x={570} y={203} textAnchor="middle" className="fill-muted-foreground text-[9.5px]">
        RIP, OSPF, BGP
      </text>
      <text x={570} y={214} textAnchor="middle" className="fill-muted-foreground text-[9.5px]">
        eller OpenFlow-install
      </text>

      <rect
        x={640}
        y={170}
        width={110}
        height={50}
        rx={5}
        className="fill-sky-500/10 stroke-sky-500"
        strokeWidth={1.2}
      />
      <text
        x={695}
        y={188}
        textAnchor="middle"
        className="fill-foreground text-[10.5px] font-semibold"
      >
        ICMP-respons
      </text>
      <text x={695} y={203} textAnchor="middle" className="fill-muted-foreground text-[9.5px]">
        Time Exceeded,
      </text>
      <text x={695} y={214} textAnchor="middle" className="fill-muted-foreground text-[9.5px]">
        Dest Unreachable
      </text>

      {/* Bottom: examples row */}
      <rect
        x={10}
        y={250}
        width={740}
        height={150}
        rx={8}
        className="fill-muted/10 stroke-border"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <text x={20} y={270} className="fill-foreground text-[11px] font-semibold">
        Eksempler — hvor havner spørsmålet?
      </text>

      <text x={20} y={290} className="fill-muted-foreground text-[10.5px]">
        «Pakken har dest. 10.4.2.7 — hvilken port skal den ut på?» →
      </text>
      <text
        x={20}
        y={304}
        className="fill-emerald-700 dark:fill-emerald-400 text-[10.5px] font-semibold"
      >
        Input-port (LPM).
      </text>

      <text x={20} y={324} className="fill-muted-foreground text-[10.5px]">
        «Lenken er full — hvilken pakke droppes?» →
      </text>
      <text
        x={20}
        y={338}
        className="fill-emerald-700 dark:fill-emerald-400 text-[10.5px] font-semibold"
      >
        Output-port (kø + drop-policy).
      </text>

      <text x={400} y={290} className="fill-muted-foreground text-[10.5px]">
        «En ny BGP-rute kom inn fra naboruteren» →
      </text>
      <text x={400} y={304} className="fill-sky-700 dark:fill-sky-400 text-[10.5px] font-semibold">
        Kontrollplan (oppdater forwarding).
      </text>

      <text x={400} y={324} className="fill-muted-foreground text-[10.5px]">
        «TTL ble 0 — hva skjer?» →
      </text>
      <text
        x={400}
        y={338}
        className="fill-emerald-700 dark:fill-emerald-400 text-[10.5px] font-semibold"
      >
        Input-port dropper + kontrollplan
      </text>
      <text x={400} y={352} className="fill-sky-700 dark:fill-sky-400 text-[10.5px] font-semibold">
        sender ICMP Time Exceeded.
      </text>

      <text x={20} y={378} className="fill-muted-foreground text-[10px] italic">
        Tommelfingerregel: trenger beslutningen oppslag i forwarding-tabellen og må gjøres i
        hardware-fart → data-plane. Endrer den tabellen, eller er den per-event/sjelden →
        kontrollplan.
      </text>
    </svg>
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

function Metafor({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-purple-700 dark:text-purple-400 font-semibold mb-1">
        🔮 Metafor
      </div>
      <div className="font-semibold text-foreground mb-1">{tittel}</div>
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

// ============================================================
// Nye visuelle SVG-er (metafor-tilkoblede)
// ============================================================

function LpmSvg() {
  const rows = [
    { prefix: "0.0.0.0/0", port: "1", bits: 0, win: false },
    { prefix: "129.242.0.0/16", port: "2", bits: 16, win: false },
    { prefix: "129.242.16.0/20", port: "3", bits: 20, win: false },
    { prefix: "129.242.18.0/24", port: "4", bits: 24, win: true },
  ];
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Longest-prefix-match for 129.242.18.55
      </text>
      <text x={250} y={28} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        fire rader matcher — den med lengst prefiks vinner
      </text>

      {rows.map((r, i) => {
        const y = 50 + i * 40;
        const barW = (r.bits / 32) * 280;
        return (
          <g key={i}>
            <rect
              x={20}
              y={y}
              width={460}
              height={32}
              rx={4}
              className={r.win ? "fill-success/15 stroke-success" : "fill-muted/30 stroke-border"}
              strokeWidth={r.win ? 2 : 1}
            />
            <text x={32} y={y + 20} className="fill-foreground text-[10px] font-mono font-semibold">
              {r.prefix}
            </text>
            <rect
              x={170}
              y={y + 10}
              width={barW}
              height={12}
              className={r.win ? "fill-success" : "fill-brand/40"}
            />
            <text x={170 + barW + 6} y={y + 20} className="fill-muted-foreground text-[9px]">
              {r.bits} bits
            </text>
            <text
              x={460}
              y={y + 20}
              textAnchor="end"
              className="fill-foreground text-[9px] font-mono"
            >
              port {r.port}
            </text>
            {r.win && (
              <text
                x={420}
                y={y + 20}
                textAnchor="end"
                className="fill-success text-[9px] font-semibold"
              >
                ✓ vinner
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function HolVoqSvg() {
  return (
    <svg viewBox="0 0 500 260" className="w-full h-auto">
      <text
        x={120}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        FIFO-input (HOL-blokkering)
      </text>
      <text
        x={380}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        VOQ (én kø per output)
      </text>

      {/* Left: FIFO */}
      <rect
        x={20}
        y={30}
        width={200}
        height={40}
        rx={4}
        className="fill-amber-500/10 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={120} y={54} textAnchor="middle" className="fill-foreground text-[9px]">
        Input A — én FIFO-kø
      </text>
      {/* Packets - colors indicate destination */}
      <rect x={30} y={78} width={30} height={20} className="fill-destructive" />
      <text x={45} y={92} textAnchor="middle" className="fill-white text-[9px] font-bold">
        →B
      </text>
      <rect x={62} y={78} width={30} height={20} className="fill-success" />
      <text x={77} y={92} textAnchor="middle" className="fill-white text-[9px] font-bold">
        →C
      </text>
      <rect x={94} y={78} width={30} height={20} className="fill-success" />
      <text x={109} y={92} textAnchor="middle" className="fill-white text-[9px] font-bold">
        →C
      </text>
      <rect x={126} y={78} width={30} height={20} className="fill-brand" />
      <text x={141} y={92} textAnchor="middle" className="fill-white text-[9px] font-bold">
        →A
      </text>

      <text x={120} y={120} textAnchor="middle" className="fill-destructive text-[9px] italic">
        Output B opptatt → ALT venter
      </text>
      <text x={120} y={134} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        selv om C og A er ledige
      </text>

      {/* Right: VOQ */}
      <rect
        x={260}
        y={30}
        width={220}
        height={40}
        rx={4}
        className="fill-success/10 stroke-success"
        strokeWidth={1.5}
      />
      <text x={370} y={54} textAnchor="middle" className="fill-foreground text-[9px]">
        Input A — tre køer
      </text>

      {/* VOQ A→A */}
      <text x={260} y={92} className="fill-muted-foreground text-[8px]">
        →A:
      </text>
      <rect x={282} y={80} width={28} height={18} className="fill-brand" />
      <text x={296} y={93} textAnchor="middle" className="fill-white text-[8px] font-bold">
        A
      </text>

      {/* VOQ A→B */}
      <text x={260} y={122} className="fill-muted-foreground text-[8px]">
        →B:
      </text>
      <rect x={282} y={110} width={28} height={18} className="fill-destructive" />
      <text x={296} y={123} textAnchor="middle" className="fill-white text-[8px] font-bold">
        B
      </text>

      {/* VOQ A→C */}
      <text x={260} y={152} className="fill-muted-foreground text-[8px]">
        →C:
      </text>
      <rect x={282} y={140} width={28} height={18} className="fill-success" />
      <text x={296} y={153} textAnchor="middle" className="fill-white text-[8px] font-bold">
        C
      </text>
      <rect x={313} y={140} width={28} height={18} className="fill-success" />
      <text x={327} y={153} textAnchor="middle" className="fill-white text-[8px] font-bold">
        C
      </text>

      <text x={370} y={185} textAnchor="middle" className="fill-success text-[9px] italic">
        Hver kø går uavhengig
      </text>
      <text x={370} y={199} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        ingen blokkerer hverandre
      </text>

      {/* Bottom comparison */}
      <text x={120} y={230} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        Maks gjennomstrømming ~58 %
      </text>
      <text x={380} y={230} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        Maks gjennomstrømming ~100 %
      </text>
    </svg>
  );
}

function FragmenteringSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={250}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        4000-byte pakke → MTU 1500 lenke
      </text>

      {/* Original packet */}
      <rect
        x={40}
        y={30}
        width={420}
        height={32}
        rx={4}
        className="fill-brand/15 stroke-brand"
        strokeWidth={1.5}
      />
      <rect x={40} y={30} width={30} height={32} className="fill-brand/40 stroke-brand" />
      <text x={55} y={50} textAnchor="middle" className="fill-foreground text-[8px]">
        hdr
      </text>
      <text x={250} y={50} textAnchor="middle" className="fill-foreground text-[10px] font-mono">
        Payload 3980 bytes (ID = 4711)
      </text>
      <text x={250} y={75} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        Total = 4000 bytes — for stor for MTU 1500
      </text>

      {/* Arrow */}
      <line
        x1={250}
        y1={80}
        x2={250}
        y2={100}
        className="stroke-foreground/60"
        strokeWidth={1.5}
        markerEnd="url(#arrFrag)"
      />
      <text x={260} y={94} className="fill-muted-foreground text-[8px]">
        klippes
      </text>

      {/* Fragments */}
      {[
        { x: 30, w: 145, offset: "0", mf: "MF=1", size: "1500", payload: "0-1479" },
        { x: 180, w: 145, offset: "185", mf: "MF=1", size: "1500", payload: "1480-2959" },
        { x: 330, w: 100, offset: "370", mf: "MF=0", size: "1040", payload: "2960-3979" },
      ].map((f, i) => (
        <g key={i}>
          <rect
            x={f.x}
            y={110}
            width={f.w}
            height={36}
            rx={4}
            className="fill-amber-500/15 stroke-amber-500"
            strokeWidth={1.5}
          />
          <rect x={f.x} y={110} width={20} height={36} className="fill-amber-500/40" />
          <text x={f.x + 10} y={130} textAnchor="middle" className="fill-foreground text-[7px]">
            hdr
          </text>
          <text
            x={f.x + (f.w + 20) / 2 + 10}
            y={124}
            textAnchor="middle"
            className="fill-foreground text-[9px] font-mono"
          >
            Frag {i + 1}
          </text>
          <text
            x={f.x + (f.w + 20) / 2 + 10}
            y={138}
            textAnchor="middle"
            className="fill-muted-foreground text-[7px] font-mono"
          >
            {f.size} B
          </text>
          <text
            x={f.x + f.w / 2}
            y={162}
            textAnchor="middle"
            className="fill-muted-foreground text-[7px] font-mono"
          >
            offset={f.offset}
          </text>
          <text
            x={f.x + f.w / 2}
            y={174}
            textAnchor="middle"
            className="fill-muted-foreground text-[7px] font-mono"
          >
            {f.mf}, ID=4711
          </text>
        </g>
      ))}

      <text x={250} y={200} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Alle fragmenter har samme ID — mottakeren limer sammen
      </text>

      <defs>
        <marker
          id="arrFrag"
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

function CidrAggregeringSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Fire /24-rader → én /22-rad i naboens ruting-tabell
      </text>

      {/* Internal /24 */}
      {[
        { x: 30, label: "198.51.96.0/24" },
        { x: 145, label: "198.51.97.0/24" },
        { x: 260, label: "198.51.98.0/24" },
        { x: 375, label: "198.51.99.0/24" },
      ].map((s, i) => (
        <g key={i}>
          <rect
            x={s.x}
            y={36}
            width={100}
            height={32}
            rx={4}
            className="fill-amber-500/15 stroke-amber-500"
            strokeWidth={1.2}
          />
          <text
            x={s.x + 50}
            y={56}
            textAnchor="middle"
            className="fill-foreground text-[9px] font-mono"
          >
            {s.label}
          </text>
        </g>
      ))}

      {/* Arrows down */}
      {[80, 195, 310, 425].map((x, i) => (
        <line
          key={i}
          x1={x}
          y1={70}
          x2={250}
          y2={110}
          className="stroke-muted-foreground/60"
          strokeWidth={1}
          strokeDasharray="2 2"
        />
      ))}

      {/* Aggregated /22 */}
      <rect
        x={120}
        y={115}
        width={260}
        height={42}
        rx={6}
        className="fill-success/20 stroke-success"
        strokeWidth={2}
      />
      <text
        x={250}
        y={135}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-mono font-semibold"
      >
        198.51.96.0/22
      </text>
      <text x={250} y={150} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        dekker .96 – .99 — én rad
      </text>

      {/* Bit illustration */}
      <text x={30} y={180} className="fill-muted-foreground text-[8px] font-semibold">
        Binær fellesnevner i siste oktett:
      </text>
      <text x={30} y={196} className="fill-foreground text-[9px] font-mono">
        96 = 01100<tspan className="fill-success font-bold">000</tspan> 97 = 01100
        <tspan className="fill-success font-bold">001</tspan>
      </text>
      <text x={30} y={210} className="fill-foreground text-[9px] font-mono">
        98 = 01100<tspan className="fill-success font-bold">010</tspan> 99 = 01100
        <tspan className="fill-success font-bold">011</tspan>
      </text>
      <text x={30} y={228} className="fill-muted-foreground text-[8px] italic">
        Felles: 22 bits (011000) — derav /22.
      </text>
    </svg>
  );
}

function HolePunchingSvg() {
  return (
    <svg viewBox="0 0 500 260" className="w-full h-auto">
      <text
        x={250}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Hole-punching: to klienter bak NAT snakker direkte
      </text>

      {/* STUN server top */}
      <rect
        x={210}
        y={28}
        width={80}
        height={32}
        rx={6}
        className="fill-brand/15 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={250} y={42} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        STUN
      </text>
      <text x={250} y={54} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        offentlig
      </text>

      {/* Alice */}
      <rect
        x={20}
        y={140}
        width={120}
        height={50}
        rx={6}
        className="fill-amber-500/10 stroke-amber-500"
        strokeWidth={1.5}
        strokeDasharray="3 2"
      />
      <text x={80} y={158} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        NAT A
      </text>
      <text x={80} y={172} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        Alice: 10.0.1.5
      </text>
      <text
        x={80}
        y={184}
        textAnchor="middle"
        className="fill-muted-foreground text-[8px] font-mono"
      >
        ekstern 84.55.12.7:62001
      </text>

      {/* Bob */}
      <rect
        x={360}
        y={140}
        width={120}
        height={50}
        rx={6}
        className="fill-success/10 stroke-success"
        strokeWidth={1.5}
        strokeDasharray="3 2"
      />
      <text
        x={420}
        y={158}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-semibold"
      >
        NAT B
      </text>
      <text x={420} y={172} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        Bob: 10.0.2.7
      </text>
      <text
        x={420}
        y={184}
        textAnchor="middle"
        className="fill-muted-foreground text-[8px] font-mono"
      >
        ekstern 91.12.4.20:55300
      </text>

      {/* Step 1 lines to STUN */}
      <line
        x1={80}
        y1={140}
        x2={230}
        y2={60}
        className="stroke-brand/60"
        strokeWidth={1.2}
        strokeDasharray="3 3"
      />
      <text x={140} y={100} className="fill-brand text-[8px] font-semibold">
        1. spør STUN
      </text>

      <line
        x1={420}
        y1={140}
        x2={270}
        y2={60}
        className="stroke-brand/60"
        strokeWidth={1.2}
        strokeDasharray="3 3"
      />
      <text x={330} y={100} className="fill-brand text-[8px] font-semibold">
        1. spør STUN
      </text>

      {/* Step 2: direct connection */}
      <line
        x1={140}
        y1={210}
        x2={360}
        y2={210}
        className="stroke-success"
        strokeWidth={2.5}
        markerEnd="url(#arrHP)"
        markerStart="url(#arrHPstart)"
      />
      <text x={250} y={205} textAnchor="middle" className="fill-success text-[9px] font-semibold">
        2. SAMTIDIG utgående
      </text>
      <text x={250} y={228} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        Hver NAT lager hull for den andre — pakkene møtes
      </text>
      <text x={250} y={248} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        Direkte P2P uten å gå via en server
      </text>

      <defs>
        <marker
          id="arrHP"
          viewBox="0 0 10 10"
          refX={9}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 z" className="fill-success" />
        </marker>
        <marker
          id="arrHPstart"
          viewBox="0 0 10 10"
          refX={1}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M10 0 L0 5 L10 10 z" className="fill-success" />
        </marker>
      </defs>
    </svg>
  );
}

function MatchActionSvg() {
  return (
    <svg viewBox="0 0 500 260" className="w-full h-auto">
      <text
        x={250}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        OpenFlow match-action: priority avgjør hvilken regel vinner
      </text>

      {/* Incoming packet */}
      <rect
        x={20}
        y={30}
        width={140}
        height={40}
        rx={4}
        className="fill-amber-500/15 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={90} y={47} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        Innkommende pakke
      </text>
      <text
        x={90}
        y={61}
        textAnchor="middle"
        className="fill-muted-foreground text-[8px] font-mono"
      >
        dst=10.0.5.42:443
      </text>

      <line
        x1={160}
        y1={50}
        x2={195}
        y2={50}
        className="stroke-foreground"
        strokeWidth={2}
        markerEnd="url(#arrMA)"
      />

      {/* Rule table */}
      <rect
        x={200}
        y={30}
        width={290}
        height={170}
        rx={6}
        className="fill-card stroke-brand"
        strokeWidth={1.5}
      />
      <text
        x={345}
        y={48}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Flow-tabell
      </text>

      {[
        {
          y: 60,
          match: "dst=10.0.5.0/24, port=443",
          act: "out: port 7",
          prio: 200,
          win: true,
        },
        {
          y: 95,
          match: "dst=10.0.0.0/16",
          act: "out: port 3",
          prio: 100,
          win: false,
          partial: true,
        },
        {
          y: 130,
          match: "dst=10.0.0.50",
          act: "drop",
          prio: 300,
          win: false,
          no: true,
        },
      ].map((r, i) => (
        <g key={i}>
          <rect
            x={210}
            y={r.y}
            width={270}
            height={28}
            rx={3}
            className={
              r.win
                ? "fill-success/15 stroke-success"
                : r.partial
                  ? "fill-amber-500/10 stroke-amber-500/50"
                  : "fill-muted/30 stroke-border"
            }
            strokeWidth={r.win ? 2 : 1}
          />
          <text x={218} y={r.y + 12} className="fill-foreground text-[8px] font-mono">
            match: {r.match}
          </text>
          <text x={218} y={r.y + 23} className="fill-muted-foreground text-[8px] font-mono">
            {r.act} · prio={r.prio}
          </text>
          {r.win && (
            <text
              x={470}
              y={r.y + 18}
              textAnchor="end"
              className="fill-success text-[9px] font-semibold"
            >
              ✓
            </text>
          )}
          {r.partial && (
            <text x={470} y={r.y + 18} textAnchor="end" className="fill-amber-600 text-[8px]">
              også matchet
            </text>
          )}
          {r.no && (
            <text
              x={470}
              y={r.y + 18}
              textAnchor="end"
              className="fill-muted-foreground text-[8px]"
            >
              ingen match
            </text>
          )}
        </g>
      ))}

      <text x={345} y={185} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        Begge gjør match; høyest priority vinner → forward port 7
      </text>

      {/* Action arrow */}
      <line
        x1={345}
        y1={200}
        x2={345}
        y2={222}
        className="stroke-success"
        strokeWidth={2}
        markerEnd="url(#arrMA)"
      />
      <rect
        x={280}
        y={222}
        width={130}
        height={30}
        rx={4}
        className="fill-success/20 stroke-success"
        strokeWidth={1.5}
      />
      <text
        x={345}
        y={242}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-mono font-semibold"
      >
        Send på port 7
      </text>

      <defs>
        <marker
          id="arrMA"
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

function SlaacSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        SLAAC: host konfigurerer egen IPv6-adresse uten DHCP
      </text>

      {/* Step 1: RA */}
      <rect
        x={20}
        y={30}
        width={140}
        height={60}
        rx={6}
        className="fill-brand/15 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={90} y={48} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        1. Ruter Advertisement
      </text>
      <text x={90} y={62} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        ruter sender prefiks
      </text>
      <text x={90} y={78} textAnchor="middle" className="fill-foreground text-[8px] font-mono">
        2001:db8:cafe::/64
      </text>

      {/* Step 2: generate */}
      <rect
        x={180}
        y={30}
        width={140}
        height={60}
        rx={6}
        className="fill-amber-500/15 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={250} y={48} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        2. Host genererer ID
      </text>
      <text x={250} y={62} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        tilfeldig 64-bit
      </text>
      <text x={250} y={78} textAnchor="middle" className="fill-foreground text-[8px] font-mono">
        a1c2:b3d4:e5f6:789
      </text>

      {/* Step 3: DAD */}
      <rect
        x={340}
        y={30}
        width={140}
        height={60}
        rx={6}
        className="fill-success/15 stroke-success"
        strokeWidth={1.5}
      />
      <text x={410} y={48} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        3. Sjekk + bruk
      </text>
      <text x={410} y={62} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        Duplicate Address Detection
      </text>
      <text x={410} y={78} textAnchor="middle" className="fill-success text-[8px] font-semibold">
        ledig — tar den i bruk
      </text>

      {/* Arrows */}
      <line
        x1={160}
        y1={60}
        x2={180}
        y2={60}
        className="stroke-foreground"
        strokeWidth={1.5}
        markerEnd="url(#arrSL)"
      />
      <line
        x1={320}
        y1={60}
        x2={340}
        y2={60}
        className="stroke-foreground"
        strokeWidth={1.5}
        markerEnd="url(#arrSL)"
      />

      {/* Final address */}
      <rect
        x={60}
        y={130}
        width={380}
        height={50}
        rx={6}
        className="fill-card stroke-foreground"
        strokeWidth={1.5}
      />
      <text
        x={250}
        y={150}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Resulterende adresse
      </text>
      <text x={250} y={170} textAnchor="middle" className="fill-foreground text-[10px] font-mono">
        <tspan className="fill-brand">2001:db8:cafe::</tspan>
        <tspan className="fill-amber-600 dark:fill-amber-400">a1c2:b3d4:e5f6:789</tspan>
      </text>

      <text x={140} y={200} textAnchor="middle" className="fill-brand text-[8px]">
        prefiks (fra ruter)
      </text>
      <text
        x={360}
        y={200}
        textAnchor="middle"
        className="fill-amber-600 dark:fill-amber-400 text-[8px]"
      >
        interface-ID (selv-valgt)
      </text>

      <text x={250} y={225} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Ingen DHCP-server var involvert
      </text>

      <defs>
        <marker
          id="arrSL"
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

// ============================================================
// NYE SVG-er — kap 4 visualiseringer
// ============================================================

// 32-bit grid med IPv4-feltene plassert som faktisk bredde
function Ipv4HeaderGridSvg() {
  // 32 kolonner. Hver rad er 32 bits.
  const W = 640;
  const colW = (W - 40) / 32;
  const rowH = 34;
  const x0 = 20;
  const y0 = 30;
  // rows: [{ fields: [{start,len,label,sub?}] }]
  const rows = [
    [
      { s: 0, l: 4, label: "Ver", c: "fill-sky-500/15 stroke-sky-500" },
      { s: 4, l: 4, label: "IHL", c: "fill-sky-500/15 stroke-sky-500" },
      { s: 8, l: 8, label: "DSCP/ECN", c: "fill-emerald-500/15 stroke-emerald-500" },
      { s: 16, l: 16, label: "Total Length", c: "fill-amber-500/15 stroke-amber-500" },
    ],
    [
      { s: 0, l: 16, label: "Identification", c: "fill-rose-500/15 stroke-rose-500" },
      { s: 16, l: 3, label: "Flg", c: "fill-rose-500/15 stroke-rose-500" },
      { s: 19, l: 13, label: "Fragment Offset", c: "fill-rose-500/15 stroke-rose-500" },
    ],
    [
      { s: 0, l: 8, label: "TTL", c: "fill-purple-500/15 stroke-purple-500" },
      { s: 8, l: 8, label: "Protocol", c: "fill-purple-500/15 stroke-purple-500" },
      { s: 16, l: 16, label: "Header Checksum", c: "fill-purple-500/15 stroke-purple-500" },
    ],
    [{ s: 0, l: 32, label: "Source IP (32 bits)", c: "fill-brand/15 stroke-brand" }],
    [{ s: 0, l: 32, label: "Destination IP (32 bits)", c: "fill-brand/15 stroke-brand" }],
    [
      {
        s: 0,
        l: 32,
        label: "Options + Padding (sjelden, slår av fast-path)",
        c: "fill-muted/20 stroke-border",
      },
    ],
  ];

  return (
    <svg viewBox={`0 0 ${W} ${y0 + rows.length * rowH + 50}`} className="w-full h-auto">
      {/* bit-skala på topp */}
      {Array.from({ length: 33 }, (_, i) => i)
        .filter((i) => i % 4 === 0)
        .map((i) => (
          <g key={i}>
            <line
              x1={x0 + i * colW}
              y1={y0 - 8}
              x2={x0 + i * colW}
              y2={y0}
              className="stroke-muted-foreground"
              strokeWidth={0.6}
            />
            <text
              x={x0 + i * colW}
              y={y0 - 12}
              textAnchor="middle"
              className="fill-muted-foreground text-[8.5px]"
            >
              {i}
            </text>
          </g>
        ))}
      <text x={x0} y={14} className="fill-foreground text-[11px] font-semibold">
        IPv4 header — 32 bits per rad
      </text>

      {rows.map((row, ri) =>
        row.map((f, fi) => (
          <g key={`${ri}-${fi}`}>
            <rect
              x={x0 + f.s * colW}
              y={y0 + ri * rowH}
              width={f.l * colW}
              height={rowH - 2}
              className={f.c}
              strokeWidth={1.2}
              rx={2}
            />
            <text
              x={x0 + f.s * colW + (f.l * colW) / 2}
              y={y0 + ri * rowH + rowH / 2 + 4}
              textAnchor="middle"
              className="fill-foreground text-[10.5px] font-medium"
            >
              {f.label}
            </text>
          </g>
        )),
      )}

      <text x={x0} y={y0 + rows.length * rowH + 24} className="fill-muted-foreground text-[10px]">
        Hver rute er proporsjonal til antall bits — TTL = 8 av 32 = en kvart rad.
      </text>
      <text x={x0} y={y0 + rows.length * rowH + 38} className="fill-muted-foreground text-[10px]">
        Source + Dest IP står tilsammen for 8 av 20 bytes (40 %) av headeren.
      </text>
    </svg>
  );
}

// CIDR som visuell bit-bar
function CidrBitBarSvg() {
  const W = 640;
  const x0 = 20;
  const barW = W - 100;
  const rowH = 36;
  const rows = [
    { p: "/8", net: 8, label: "10.0.0.0/8 — RFC 1918 stor blokk", hosts: "16,7 M" },
    { p: "/16", net: 16, label: "172.20.0.0/16 — kampusnett", hosts: "65 534" },
    { p: "/22", net: 22, label: "10.50.0.0/22 — UiT-bygg", hosts: "1 022" },
    { p: "/24", net: 24, label: "192.168.7.0/24 — etasje", hosts: "254" },
    { p: "/27", net: 27, label: "10.0.0.0/27 — labbgruppe", hosts: "30" },
    { p: "/30", net: 30, label: "172.16.99.0/30 — punkt-til-punkt", hosts: "2" },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${30 + rows.length * rowH + 30}`} className="w-full h-auto">
      <text x={x0} y={16} className="fill-foreground text-[11px] font-semibold">
        CIDR — prefiks-bits (mørk) vs host-bits (lys)
      </text>
      <text x={x0 + 380} y={16} className="fill-muted-foreground text-[10px]">
        ← felles · varierer →
      </text>

      {rows.map((r, i) => {
        const y = 30 + i * rowH;
        const netW = (barW * r.net) / 32;
        const hostW = barW - netW;
        return (
          <g key={r.p}>
            <text x={x0} y={y + 18} className="fill-foreground text-[11px] font-mono font-semibold">
              {r.p}
            </text>
            {/* network bits */}
            <rect
              x={x0 + 40}
              y={y + 4}
              width={netW}
              height={20}
              className="fill-brand/70 stroke-brand"
              strokeWidth={0.8}
            />
            {/* host bits */}
            <rect
              x={x0 + 40 + netW}
              y={y + 4}
              width={hostW}
              height={20}
              className="fill-amber-500/30 stroke-amber-500"
              strokeWidth={0.8}
            />
            {/* hosts label */}
            <text
              x={x0 + 40 + netW + hostW / 2}
              y={y + 18}
              textAnchor="middle"
              className="fill-foreground text-[9.5px]"
            >
              {r.hosts} brukbare
            </text>
            {/* description */}
            <text x={x0 + 40} y={y + 33} className="fill-muted-foreground text-[9.5px]">
              {r.label}
            </text>
          </g>
        );
      })}

      <text x={x0} y={30 + rows.length * rowH + 18} className="fill-muted-foreground text-[10px]">
        Felles regel: brukbare hosts = 2^(32 − prefiks) − 2 (trekk fra nett + broadcast).
      </text>
    </svg>
  );
}

// Fire NAT-typer som 4 boks-illustrasjoner med flow-diagrammer
function NatTypesSvg() {
  // Hver type er en 2x2 grid. Hver celle: 220x150
  const cellW = 220;
  const cellH = 165;
  const W = cellW * 2 + 30;
  const H = cellH * 2 + 40;

  function Cell({
    x,
    y,
    title,
    sub,
    color,
    children,
  }: {
    x: number;
    y: number;
    title: string;
    sub: string;
    color: string;
    children?: React.ReactNode;
  }) {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={cellW}
          height={cellH}
          rx={6}
          className={`${color} stroke-border`}
          strokeWidth={1}
        />
        <text x={x + 10} y={y + 16} className="fill-foreground text-[11px] font-semibold">
          {title}
        </text>
        <text x={x + 10} y={y + 30} className="fill-muted-foreground text-[9.5px]">
          {sub}
        </text>
        {children}
      </g>
    );
  }

  // Generic intern-box og extern-pil. (intern)→[NAT]→(ekstern)
  function FlowMini({
    cx,
    cy,
    extPort,
    extColor,
    note,
  }: {
    cx: number;
    cy: number;
    extPort: string;
    extColor: string;
    note: string;
  }) {
    return (
      <g>
        {/* intern */}
        <rect
          x={cx - 95}
          y={cy - 10}
          width={48}
          height={20}
          rx={3}
          className="fill-sky-500/20 stroke-sky-500"
          strokeWidth={0.8}
        />
        <text
          x={cx - 71}
          y={cy + 4}
          textAnchor="middle"
          className="fill-foreground text-[9px] font-mono"
        >
          A:5000
        </text>
        {/* NAT */}
        <rect
          x={cx - 35}
          y={cy - 12}
          width={36}
          height={24}
          rx={3}
          className="fill-purple-500/20 stroke-purple-500"
          strokeWidth={0.8}
        />
        <text
          x={cx - 17}
          y={cy + 3}
          textAnchor="middle"
          className="fill-foreground text-[9px] font-semibold"
        >
          NAT
        </text>
        {/* ekstern */}
        <rect
          x={cx + 15}
          y={cy - 10}
          width={70}
          height={20}
          rx={3}
          className={`${extColor} stroke-current`}
          strokeWidth={0.8}
        />
        <text
          x={cx + 50}
          y={cy + 4}
          textAnchor="middle"
          className="fill-foreground text-[9px] font-mono"
        >
          {extPort}
        </text>
        {/* arrows */}
        <line
          x1={cx - 47}
          y1={cy}
          x2={cx - 36}
          y2={cy}
          className="stroke-foreground"
          strokeWidth={0.8}
          markerEnd="url(#natArr)"
        />
        <line
          x1={cx + 1}
          y1={cy}
          x2={cx + 14}
          y2={cy}
          className="stroke-foreground"
          strokeWidth={0.8}
          markerEnd="url(#natArr)"
        />
        <text x={cx - 50} y={cy + 30} className="fill-muted-foreground text-[8.5px]">
          {note}
        </text>
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <marker
          id="natArr"
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 z" className="fill-foreground" />
        </marker>
      </defs>

      <text x={15} y={16} className="fill-foreground text-[11.5px] font-semibold">
        Fire NAT-typer — fra slappest til strengest
      </text>

      {/* Full-cone */}
      <Cell
        x={15}
        y={28}
        title="Full-cone"
        sub="Én intern → fast ekstern. Hvem som helst på utsiden kan svare."
        color="fill-emerald-500/5"
      >
        <FlowMini
          cx={130}
          cy={90}
          extPort="84.X:62001"
          extColor="fill-emerald-500/20 text-emerald-700"
          note="alle utsider OK"
        />
        <text x={25} y={148} className="fill-muted-foreground text-[8.5px]">
          P2P enkel — én utgående pakke åpner en dør for alle.
        </text>
      </Cell>

      {/* Restricted-cone */}
      <Cell
        x={15 + cellW + 15}
        y={28}
        title="Restricted-cone"
        sub="Ekstern må først ha mottatt pakke fra interne IP."
        color="fill-sky-500/5"
      >
        <FlowMini
          cx={130 + cellW + 15}
          cy={90}
          extPort="84.X:62001"
          extColor="fill-sky-500/20 text-sky-700"
          note="kun kjente IP"
        />
        <text x={25 + cellW + 15} y={148} className="fill-muted-foreground text-[8.5px]">
          Port er fri, men kun fra IP du har snakket med.
        </text>
      </Cell>

      {/* Port-restricted-cone */}
      <Cell
        x={15}
        y={28 + cellH + 10}
        title="Port-restricted"
        sub="IP + port må matche tidligere utgående."
        color="fill-amber-500/5"
      >
        <FlowMini
          cx={130}
          cy={28 + cellH + 10 + 62}
          extPort="84.X:62001"
          extColor="fill-amber-500/20 text-amber-700"
          note="kun (IP, port) kjent"
        />
        <text x={25} y={28 + cellH + 10 + 120} className="fill-muted-foreground text-[8.5px]">
          Strengere; krever STUN for å åpne hull mot ny part.
        </text>
      </Cell>

      {/* Symmetric */}
      <Cell
        x={15 + cellW + 15}
        y={28 + cellH + 10}
        title="Symmetric"
        sub="Ny ekstern port per destinasjon."
        color="fill-rose-500/5"
      >
        {/* draw two flows */}
        <g>
          {/* intern */}
          <rect
            x={15 + cellW + 15 + 25}
            y={28 + cellH + 10 + 50}
            width={45}
            height={18}
            rx={3}
            className="fill-sky-500/20 stroke-sky-500"
            strokeWidth={0.8}
          />
          <text
            x={15 + cellW + 15 + 47}
            y={28 + cellH + 10 + 63}
            textAnchor="middle"
            className="fill-foreground text-[8.5px] font-mono"
          >
            A:5000
          </text>
          {/* NAT */}
          <rect
            x={15 + cellW + 15 + 85}
            y={28 + cellH + 10 + 45}
            width={32}
            height={28}
            rx={3}
            className="fill-purple-500/20 stroke-purple-500"
            strokeWidth={0.8}
          />
          <text
            x={15 + cellW + 15 + 101}
            y={28 + cellH + 10 + 62}
            textAnchor="middle"
            className="fill-foreground text-[8.5px] font-semibold"
          >
            NAT
          </text>
          {/* two externals */}
          <rect
            x={15 + cellW + 15 + 130}
            y={28 + cellH + 10 + 35}
            width={75}
            height={18}
            rx={3}
            className="fill-rose-500/20 stroke-rose-500"
            strokeWidth={0.8}
          />
          <text
            x={15 + cellW + 15 + 167}
            y={28 + cellH + 10 + 48}
            textAnchor="middle"
            className="fill-foreground text-[8.5px] font-mono"
          >
            →VG: :62001
          </text>
          <rect
            x={15 + cellW + 15 + 130}
            y={28 + cellH + 10 + 60}
            width={75}
            height={18}
            rx={3}
            className="fill-rose-500/20 stroke-rose-500"
            strokeWidth={0.8}
          />
          <text
            x={15 + cellW + 15 + 167}
            y={28 + cellH + 10 + 73}
            textAnchor="middle"
            className="fill-foreground text-[8.5px] font-mono"
          >
            →NRK: :62072
          </text>
          <line
            x1={15 + cellW + 15 + 70}
            y1={28 + cellH + 10 + 59}
            x2={15 + cellW + 15 + 84}
            y2={28 + cellH + 10 + 59}
            className="stroke-foreground"
            strokeWidth={0.7}
            markerEnd="url(#natArr)"
          />
          <line
            x1={15 + cellW + 15 + 117}
            y1={28 + cellH + 10 + 55}
            x2={15 + cellW + 15 + 130}
            y2={28 + cellH + 10 + 44}
            className="stroke-foreground"
            strokeWidth={0.7}
            markerEnd="url(#natArr)"
          />
          <line
            x1={15 + cellW + 15 + 117}
            y1={28 + cellH + 10 + 63}
            x2={15 + cellW + 15 + 130}
            y2={28 + cellH + 10 + 69}
            className="stroke-foreground"
            strokeWidth={0.7}
            markerEnd="url(#natArr)"
          />
        </g>
        <text
          x={25 + cellW + 15}
          y={28 + cellH + 10 + 110}
          className="fill-muted-foreground text-[8.5px]"
        >
          Verst for hole-punching — to ulike eksterne ser to porter.
        </text>
        <text
          x={25 + cellW + 15}
          y={28 + cellH + 10 + 122}
          className="fill-muted-foreground text-[8.5px]"
        >
          P2P krever TURN (relay) som siste utvei.
        </text>
      </Cell>
    </svg>
  );
}

// SDN match-action pipeline
function SdnPipelineSvg() {
  const W = 720;
  const tableW = 180;
  const tableH = 110;
  const gap = 30;
  const y0 = 50;
  return (
    <svg viewBox={`0 0 ${W} 240`} className="w-full h-auto">
      <text x={15} y={18} className="fill-foreground text-[11.5px] font-semibold">
        OpenFlow multi-table pipeline — pakken passerer flere tabeller i serie
      </text>

      {/* Pakke inn */}
      <rect
        x={10}
        y={y0 + 20}
        width={60}
        height={70}
        rx={4}
        className="fill-sky-500/20 stroke-sky-500"
        strokeWidth={1}
      />
      <text
        x={40}
        y={y0 + 50}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Pakke
      </text>
      <text x={40} y={y0 + 65} textAnchor="middle" className="fill-muted-foreground text-[8.5px]">
        bits inn
      </text>

      {/* Tabeller */}
      {[
        {
          title: "Tabell 0",
          sub: "Klassifisering",
          rows: ["match: in_port=1-8", "→ meta=tenant_A", "match: in_port=9-16", "→ meta=tenant_B"],
          c: "fill-emerald-500/10 stroke-emerald-500",
        },
        {
          title: "Tabell 1",
          sub: "ACL / policy",
          rows: ["match: meta=A,", "dst=10.20/16 → drop", "match: * → goto 2", "priority styrer"],
          c: "fill-amber-500/10 stroke-amber-500",
        },
        {
          title: "Tabell 2",
          sub: "Forwarding",
          rows: ["match: dst=10.0/16", "→ out port 24", "match: dst=10.1/16", "→ out port 25"],
          c: "fill-purple-500/10 stroke-purple-500",
        },
      ].map((t, i) => {
        const x = 90 + i * (tableW + gap);
        return (
          <g key={t.title}>
            <rect
              x={x}
              y={y0}
              width={tableW}
              height={tableH}
              rx={5}
              className={t.c}
              strokeWidth={1}
            />
            <text x={x + 8} y={y0 + 14} className="fill-foreground text-[10.5px] font-semibold">
              {t.title}
            </text>
            <text x={x + 8} y={y0 + 26} className="fill-muted-foreground text-[9px]">
              {t.sub}
            </text>
            {t.rows.map((r, ri) => (
              <text
                key={ri}
                x={x + 8}
                y={y0 + 42 + ri * 14}
                className="fill-foreground text-[8.5px] font-mono"
              >
                {r}
              </text>
            ))}
            {/* arrow to next */}
            {i < 2 && (
              <line
                x1={x + tableW}
                y1={y0 + tableH / 2}
                x2={x + tableW + gap - 2}
                y2={y0 + tableH / 2}
                className="stroke-foreground"
                strokeWidth={1.2}
                markerEnd="url(#sdnArr)"
              />
            )}
          </g>
        );
      })}

      {/* Out */}
      <line
        x1={90 + 3 * (tableW + gap) - gap}
        y1={y0 + tableH / 2}
        x2={W - 70}
        y2={y0 + tableH / 2}
        className="stroke-foreground"
        strokeWidth={1.2}
        markerEnd="url(#sdnArr)"
      />
      <rect
        x={W - 65}
        y={y0 + 20}
        width={55}
        height={70}
        rx={4}
        className="fill-brand/15 stroke-brand"
        strokeWidth={1}
      />
      <text
        x={W - 37}
        y={y0 + 50}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Ut-port
      </text>
      <text
        x={W - 37}
        y={y0 + 65}
        textAnchor="middle"
        className="fill-muted-foreground text-[8.5px]"
      >
        link 24 / 25
      </text>

      {/* Priority bar */}
      <text x={15} y={y0 + tableH + 35} className="fill-muted-foreground text-[10px] font-semibold">
        Priority — høyere vinner ved flere match:
      </text>
      {[
        { p: 100, color: "fill-rose-500/40", label: "drop tenant_A → admin (specific)" },
        { p: 50, color: "fill-amber-500/40", label: "forward 10.0.0.42 (mid)" },
        { p: 1, color: "fill-emerald-500/30", label: "default catch-all" },
      ].map((row, i) => {
        const y = y0 + tableH + 45 + i * 18;
        return (
          <g key={i}>
            <rect
              x={250}
              y={y - 10}
              width={(row.p / 100) * 250}
              height={14}
              className={row.color}
              rx={2}
            />
            <text
              x={205}
              y={y + 1}
              textAnchor="end"
              className="fill-foreground text-[9px] font-mono"
            >
              prio {row.p}
            </text>
            <text x={260} y={y + 1} className="fill-foreground text-[9px]">
              {row.label}
            </text>
          </g>
        );
      })}

      <defs>
        <marker
          id="sdnArr"
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

// IPv4 vs IPv6 side-ved-side header
function Ipv4VsIpv6Svg() {
  const W = 720;
  const colW = 320;
  const x4 = 30;
  const x6 = x4 + colW + 40;
  const cellH = 22;
  const startY = 40;

  type Cell = { lbl: string; w: number };
  type Row = { items: Cell[] };
  // IPv4 layout — sum of "widths" should reflect 32-bit rad. (simplified)
  const v4: Row[] = [
    {
      items: [
        { lbl: "Ver", w: 0.125 },
        { lbl: "IHL", w: 0.125 },
        { lbl: "DSCP", w: 0.25 },
        { lbl: "Total Length", w: 0.5 },
      ],
    },
    {
      items: [
        { lbl: "Identification", w: 0.5 },
        { lbl: "Flg", w: 0.094 },
        { lbl: "Frag Offset", w: 0.406 },
      ],
    },
    {
      items: [
        { lbl: "TTL", w: 0.25 },
        { lbl: "Proto", w: 0.25 },
        { lbl: "Header Checksum", w: 0.5 },
      ],
    },
    { items: [{ lbl: "Source IP", w: 1 }] },
    { items: [{ lbl: "Destination IP", w: 1 }] },
    { items: [{ lbl: "Options (variabel)", w: 1 }] },
  ];

  // IPv6 layout
  const v6: Row[] = [
    {
      items: [
        { lbl: "Ver", w: 0.125 },
        { lbl: "Traffic Class", w: 0.25 },
        { lbl: "Flow Label", w: 0.625 },
      ],
    },
    {
      items: [
        { lbl: "Payload Length", w: 0.5 },
        { lbl: "Next Hdr", w: 0.25 },
        { lbl: "Hop Limit", w: 0.25 },
      ],
    },
    { items: [{ lbl: "Source Addr (1/4)", w: 1 }] },
    { items: [{ lbl: "Source Addr (4/4)", w: 1 }] },
    { items: [{ lbl: "Dest Addr (1/4)", w: 1 }] },
    { items: [{ lbl: "Dest Addr (4/4)", w: 1 }] },
  ];

  function renderHeader(rows: Row[], x: number, label: string, accent: string) {
    return (
      <g>
        <text x={x} y={20} className="fill-foreground text-[11.5px] font-semibold">
          {label}
        </text>
        {rows.map((r, ri) => {
          let acc = 0;
          return (
            <g key={ri}>
              {r.items.map((cell, ii) => {
                const cw = colW * cell.w;
                const cx = x + acc;
                acc += cw;
                return (
                  <g key={`${ri}-${ii}`}>
                    <rect
                      x={cx}
                      y={startY + ri * cellH}
                      width={cw - 1}
                      height={cellH - 2}
                      rx={2}
                      className={accent}
                      strokeWidth={0.8}
                    />
                    <text
                      x={cx + cw / 2}
                      y={startY + ri * cellH + cellH / 2 + 3}
                      textAnchor="middle"
                      className="fill-foreground text-[9px]"
                    >
                      {cell.lbl}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${startY + 6 * cellH + 100}`} className="w-full h-auto">
      {renderHeader(
        v4,
        x4,
        "IPv4 — 20 byte min, variabel m/Options",
        "fill-sky-500/15 stroke-sky-500",
      )}
      {renderHeader(v6, x6, "IPv6 — 40 byte fast", "fill-emerald-500/15 stroke-emerald-500")}

      {/* hilight de fjernede feltene */}
      <line
        x1={x4 + colW + 5}
        y1={startY + 14}
        x2={x6 - 5}
        y2={startY + 14}
        className="stroke-rose-500"
        strokeDasharray="2 2"
        strokeWidth={0.8}
      />

      <text
        x={x4}
        y={startY + 6 * cellH + 18}
        className="fill-foreground text-[10px] font-semibold"
      >
        Hva forsvant i IPv6:
      </text>
      <text x={x4} y={startY + 6 * cellH + 32} className="fill-muted-foreground text-[9.5px]">
        • Header checksum (lag-2 og lag-4 dekker det)
      </text>
      <text x={x4} y={startY + 6 * cellH + 44} className="fill-muted-foreground text-[9.5px]">
        • Identification / Flags / Fragment Offset (kun sender klipper)
      </text>
      <text x={x4} y={startY + 6 * cellH + 56} className="fill-muted-foreground text-[9.5px]">
        • IHL (lengde er fast — alltid 40 byte)
      </text>
      <text x={x4} y={startY + 6 * cellH + 68} className="fill-muted-foreground text-[9.5px]">
        • Options (flyttet til Extension Headers utenfor fast-path)
      </text>

      <text
        x={x6}
        y={startY + 6 * cellH + 18}
        className="fill-foreground text-[10px] font-semibold"
      >
        Hva er nytt:
      </text>
      <text x={x6} y={startY + 6 * cellH + 32} className="fill-muted-foreground text-[9.5px]">
        • Flow Label — QoS uten payload-parsing
      </text>
      <text x={x6} y={startY + 6 * cellH + 44} className="fill-muted-foreground text-[9.5px]">
        • Adresser 4× lengre (16 byte hver)
      </text>
      <text x={x6} y={startY + 6 * cellH + 56} className="fill-muted-foreground text-[9.5px]">
        • Next Header — lenket liste av extensions
      </text>
      <text x={x6} y={startY + 6 * cellH + 68} className="fill-muted-foreground text-[9.5px]">
        • Hop Limit (ærlig navn på TTL)
      </text>
    </svg>
  );
}

// IPv6 128-bit visuell layout med 8 grupper
function Ipv6AddressLayoutSvg() {
  const W = 720;
  const groupW = 78;
  const x0 = 20;
  const y0 = 50;

  // Eksempel: 2001:0db8:cafe:0042:0000:0000:0000:7334 (UiT-fiktivt)
  const groups = ["2001", "0db8", "cafe", "0042", "0000", "0000", "0000", "7334"];
  const colors = [
    "fill-brand/25 stroke-brand",
    "fill-brand/25 stroke-brand",
    "fill-brand/25 stroke-brand",
    "fill-sky-500/25 stroke-sky-500",
    "fill-amber-500/25 stroke-amber-500",
    "fill-amber-500/25 stroke-amber-500",
    "fill-amber-500/25 stroke-amber-500",
    "fill-amber-500/25 stroke-amber-500",
  ];

  return (
    <svg viewBox={`0 0 ${W} 220`} className="w-full h-auto">
      <text x={x0} y={18} className="fill-foreground text-[11.5px] font-semibold">
        IPv6 — 128 bits = 8 grupper × 16 bits (4 hex-tegn per gruppe)
      </text>
      <text x={x0} y={32} className="fill-muted-foreground text-[10px]">
        Eksempel: en UiT-host i 2001:db8:cafe:42::7334
      </text>

      {groups.map((g, i) => (
        <g key={i}>
          <rect
            x={x0 + i * (groupW + 4)}
            y={y0}
            width={groupW}
            height={42}
            rx={4}
            className={colors[i]}
            strokeWidth={1}
          />
          <text
            x={x0 + i * (groupW + 4) + groupW / 2}
            y={y0 + 27}
            textAnchor="middle"
            className="fill-foreground text-[14px] font-mono font-semibold"
          >
            {g}
          </text>
          <text
            x={x0 + i * (groupW + 4) + groupW / 2}
            y={y0 + 56}
            textAnchor="middle"
            className="fill-muted-foreground text-[8.5px]"
          >
            16 bits
          </text>
        </g>
      ))}

      {/* bracket: prefix vs subnet vs interface ID */}
      <line
        x1={x0}
        y1={y0 + 72}
        x2={x0 + 3 * (groupW + 4) - 4}
        y2={y0 + 72}
        className="stroke-brand"
        strokeWidth={2}
      />
      <text
        x={x0 + (3 * (groupW + 4)) / 2}
        y={y0 + 86}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Globalt prefiks (48 bits)
      </text>
      <text
        x={x0 + (3 * (groupW + 4)) / 2}
        y={y0 + 98}
        textAnchor="middle"
        className="fill-muted-foreground text-[9px]"
      >
        ISP/RIR tildeler
      </text>

      <line
        x1={x0 + 3 * (groupW + 4)}
        y1={y0 + 72}
        x2={x0 + 4 * (groupW + 4) - 4}
        y2={y0 + 72}
        className="stroke-sky-500"
        strokeWidth={2}
      />
      <text
        x={x0 + 3 * (groupW + 4) + groupW / 2}
        y={y0 + 86}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Subnett (16)
      </text>
      <text
        x={x0 + 3 * (groupW + 4) + groupW / 2}
        y={y0 + 98}
        textAnchor="middle"
        className="fill-muted-foreground text-[9px]"
      >
        organisasjon
      </text>

      <line
        x1={x0 + 4 * (groupW + 4)}
        y1={y0 + 72}
        x2={x0 + 8 * (groupW + 4) - 4}
        y2={y0 + 72}
        className="stroke-amber-500"
        strokeWidth={2}
      />
      <text
        x={x0 + 6 * (groupW + 4)}
        y={y0 + 86}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Interface-ID (64 bits)
      </text>
      <text
        x={x0 + 6 * (groupW + 4)}
        y={y0 + 98}
        textAnchor="middle"
        className="fill-muted-foreground text-[9px]"
      >
        SLAAC / MAC-basert / tilfeldig
      </text>

      {/* Komprimering */}
      <text x={x0} y={190} className="fill-foreground text-[10px] font-semibold">
        Komprimering:
      </text>
      <text x={x0 + 90} y={190} className="fill-muted-foreground text-[10px] font-mono">
        2001:0db8:cafe:0042:0000:0000:0000:7334
      </text>
      <text x={x0} y={205} className="fill-muted-foreground text-[10px]">
        → drop ledende nuller, kollapse løp av :0000: til ::
      </text>
      <text x={x0 + 320} y={205} className="fill-brand text-[10px] font-mono font-semibold">
        2001:db8:cafe:42::7334
      </text>
    </svg>
  );
}

// 12 anker-kort
function AnkerCardsSvg() {
  const W = 720;
  const cardW = 170;
  const cardH = 78;
  const cols = 4;
  const gap = 10;
  const x0 = 10;
  const y0 = 10;

  const cards = [
    { n: 1, t: "Data-plane", b: "per-pakke i HW", c: "fill-emerald-500/15 stroke-emerald-500" },
    {
      n: 2,
      t: "Ruter-arkitektur",
      b: "input→fabric→output",
      c: "fill-emerald-500/15 stroke-emerald-500",
    },
    { n: 3, t: "LPM på input", b: "lengste prefiks vinner", c: "fill-sky-500/15 stroke-sky-500" },
    { n: 4, t: "Output gjør køing", b: "FIFO/prio/WFQ/WRED", c: "fill-sky-500/15 stroke-sky-500" },
    {
      n: 5,
      t: "IPv4-header 20 B",
      b: "TTL & checksum/hop",
      c: "fill-amber-500/15 stroke-amber-500",
    },
    { n: 6, t: "CIDR-bits", b: "hosts = 2^h − 2", c: "fill-amber-500/15 stroke-amber-500" },
    {
      n: 7,
      t: "Subnet vs aggregér",
      b: "/16→/18·4 vs /24·4→/22",
      c: "fill-purple-500/15 stroke-purple-500",
    },
    {
      n: 8,
      t: "NAT(IP:port) bytte",
      b: "tabell — drop uten match",
      c: "fill-purple-500/15 stroke-purple-500",
    },
    {
      n: 9,
      t: "NAT bryter E2E",
      b: "P2P, IPsec, SIP sliter",
      c: "fill-rose-500/15 stroke-rose-500",
    },
    {
      n: 10,
      t: "SDN match-action",
      b: "OpenFlow, controller",
      c: "fill-rose-500/15 stroke-rose-500",
    },
    {
      n: 11,
      t: "IPv6 = 128 bits",
      b: "fast 40 B, ingen broadcast",
      c: "fill-brand/15 stroke-brand",
    },
    { n: 12, t: "Dual-stack", b: "Happy Eyeballs velger", c: "fill-brand/15 stroke-brand" },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${y0 + 3 * (cardH + gap) + 10}`} className="w-full h-auto">
      {cards.map((c, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = x0 + col * (cardW + gap);
        const y = y0 + row * (cardH + gap);
        return (
          <g key={c.n}>
            <rect
              x={x}
              y={y}
              width={cardW}
              height={cardH}
              rx={6}
              className={c.c}
              strokeWidth={1.2}
            />
            <circle
              cx={x + 16}
              cy={y + 16}
              r={11}
              className="fill-background stroke-foreground"
              strokeWidth={0.8}
            />
            <text
              x={x + 16}
              y={y + 20}
              textAnchor="middle"
              className="fill-foreground text-[11px] font-semibold"
            >
              {c.n}
            </text>
            <text x={x + 34} y={y + 22} className="fill-foreground text-[11px] font-semibold">
              {c.t}
            </text>
            <text x={x + 12} y={y + 50} className="fill-muted-foreground text-[10px]">
              {c.b}
            </text>
            <text x={x + 12} y={y + 65} className="fill-muted-foreground text-[8.5px] italic">
              {ankerSubtle(c.n)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
function ankerSubtle(n: number): string {
  return [
    "forward/drop på ns",
    "hver del kan flaskehalse",
    "ikke lengste streng",
    "RED markerer før drop",
    "checksum re-beregnes",
    "prefiks låser venstre N",
    "begge testes på eksamen",
    "default-drop ved miss",
    "STUN/TURN trengs",
    "miss → packet_in",
    "fast header = fast-path",
    "300 ms → fallback IPv4",
  ][n - 1];
}

// Fallgruve: NAT vs FW
function NatVsFwSvg() {
  return (
    <svg viewBox="0 0 640 200" className="w-full h-auto">
      <text x={20} y={18} className="fill-foreground text-[11px] font-semibold">
        «NAT er ikke en brannmur»
      </text>

      {/* venstre: vakt uten regelbok = NAT */}
      <rect
        x={20}
        y={30}
        width={290}
        height={150}
        rx={6}
        className="fill-rose-500/5 stroke-rose-500"
        strokeWidth={1}
      />
      <text x={30} y={48} className="fill-foreground text-[10.5px] font-semibold">
        NAT alene — vakt uten regelbok
      </text>
      {/* vakt */}
      <circle
        cx={70}
        cy={100}
        r={20}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={70} y={104} textAnchor="middle" className="fill-foreground text-[10px]">
        vakt
      </text>
      {/* mapping table */}
      <rect
        x={110}
        y={80}
        width={170}
        height={40}
        rx={3}
        className="fill-card stroke-border"
        strokeWidth={0.8}
      />
      <text x={120} y={94} className="fill-foreground text-[9px] font-mono">
        51200 ↔ 62001 ↔ VG:443
      </text>
      <text x={120} y={108} className="fill-foreground text-[9px] font-mono">
        48100 ↔ 62003 ↔ VG:443
      </text>
      <text x={120} y={118} className="fill-muted-foreground text-[8px]">
        kun bivirkning: ingen rad = drop
      </text>
      <text x={30} y={148} className="fill-muted-foreground text-[9px]">
        Slipper inn alt som matcher tabellen.
      </text>
      <text x={30} y={162} className="fill-muted-foreground text-[9px]">
        Ingen policy, ingen logg, ingen inspeksjon.
      </text>

      {/* høyre: ekte firewall */}
      <rect
        x={330}
        y={30}
        width={290}
        height={150}
        rx={6}
        className="fill-emerald-500/5 stroke-emerald-500"
        strokeWidth={1}
      />
      <text x={340} y={48} className="fill-foreground text-[10.5px] font-semibold">
        Stateful FW — vakt + regelbok
      </text>
      <circle
        cx={380}
        cy={100}
        r={20}
        className="fill-emerald-500/30 stroke-emerald-500"
        strokeWidth={1}
      />
      <text x={380} y={104} textAnchor="middle" className="fill-foreground text-[10px]">
        vakt
      </text>
      {/* shield/wall */}
      <rect
        x={355}
        y={80}
        width={50}
        height={45}
        className="fill-none stroke-emerald-500"
        strokeWidth={2}
        strokeDasharray="3 2"
        rx={4}
      />
      {/* regelbok */}
      <rect
        x={420}
        y={70}
        width={180}
        height={70}
        rx={3}
        className="fill-card stroke-border"
        strokeWidth={0.8}
      />
      <text x={430} y={84} className="fill-foreground text-[9px] font-semibold">
        Policy:
      </text>
      <text x={430} y={97} className="fill-foreground text-[9px] font-mono">
        allow tcp 443 from any
      </text>
      <text x={430} y={109} className="fill-foreground text-[9px] font-mono">
        deny tcp 22 except VPN
      </text>
      <text x={430} y={121} className="fill-foreground text-[9px] font-mono">
        log denials → SIEM
      </text>
      <text x={430} y={133} className="fill-foreground text-[9px] font-mono">
        IDS inspect L7
      </text>
      <text x={340} y={162} className="fill-muted-foreground text-[9px]">
        Eksplisitt policy, logging, L7-inspeksjon.
      </text>
    </svg>
  );
}

// Fallgruve: subnetting vs supernetting visualisering
function SubnetSupernetSvg() {
  return (
    <svg viewBox="0 0 640 220" className="w-full h-auto">
      <text x={20} y={18} className="fill-foreground text-[11px] font-semibold">
        Subnetting ≠ Supernetting (CIDR-aggregering)
      </text>

      {/* Subnetting: stor → mange små */}
      <text x={20} y={42} className="fill-foreground text-[10px] font-semibold">
        Subnetting — lengre prefiks
      </text>
      <rect
        x={20}
        y={50}
        width={280}
        height={28}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1}
        rx={3}
      />
      <text x={160} y={68} textAnchor="middle" className="fill-foreground text-[10px] font-mono">
        10.0.0.0/22 (1024 adresser)
      </text>
      {/* arrow ned */}
      <line
        x1={160}
        y1={82}
        x2={160}
        y2={100}
        className="stroke-foreground"
        strokeWidth={1}
        markerEnd="url(#ssArr)"
      />
      {/* fire /24 */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x={20 + i * 70}
            y={105}
            width={66}
            height={28}
            className="fill-sky-500/30 stroke-sky-500"
            strokeWidth={1}
            rx={3}
          />
          <text
            x={20 + i * 70 + 33}
            y={123}
            textAnchor="middle"
            className="fill-foreground text-[9px] font-mono"
          >
            10.0.{i}.0/24
          </text>
        </g>
      ))}
      <text x={20} y={150} className="fill-muted-foreground text-[9px]">
        Pluss-2 bits prefiks → ×4 mindre subnett.
      </text>

      {/* Supernetting: mange små → én stor */}
      <text x={340} y={42} className="fill-foreground text-[10px] font-semibold">
        Supernetting — kortere prefiks
      </text>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x={340 + i * 70}
            y={50}
            width={66}
            height={28}
            className="fill-sky-500/30 stroke-sky-500"
            strokeWidth={1}
            rx={3}
          />
          <text
            x={340 + i * 70 + 33}
            y={68}
            textAnchor="middle"
            className="fill-foreground text-[9px] font-mono"
          >
            193.156.{40 + i}.0/24
          </text>
        </g>
      ))}
      <line
        x1={480}
        y1={82}
        x2={480}
        y2={100}
        className="stroke-foreground"
        strokeWidth={1}
        markerEnd="url(#ssArr)"
      />
      <rect
        x={340}
        y={105}
        width={280}
        height={28}
        className="fill-emerald-500/30 stroke-emerald-500"
        strokeWidth={1}
        rx={3}
      />
      <text x={480} y={123} textAnchor="middle" className="fill-foreground text-[10px] font-mono">
        193.156.40.0/22 (1 BGP-rad)
      </text>
      <text x={340} y={150} className="fill-muted-foreground text-[9px]">
        Minus-2 bits prefiks → 1 rad i nabo-ruteren.
      </text>

      {/* Memo */}
      <rect
        x={20}
        y={170}
        width={600}
        height={42}
        rx={5}
        className="fill-amber-500/10 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={30} y={185} className="fill-foreground text-[10px] font-semibold">
        Huskeregel:
      </text>
      <text x={30} y={200} className="fill-foreground text-[10px]">
        Lengre prefiks = mer spesifikk = SUBNETTING. Kortere prefiks = bredere =
        SUPERNETTING/aggregering.
      </text>

      <defs>
        <marker
          id="ssArr"
          viewBox="0 0 10 10"
          refX={8}
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

// Fallgruve: lag-pyramide for fragmentering
function LayerPyramidSvg() {
  return (
    <svg viewBox="0 0 640 220" className="w-full h-auto">
      <text x={20} y={18} className="fill-foreground text-[11px] font-semibold">
        Hvor i stakken skjer fragmentering?
      </text>

      {/* Pyramide / stack */}
      {[
        {
          y: 35,
          w: 100,
          label: "Applikasjon",
          note: "(ingen fragmentering her)",
          c: "fill-muted/20 stroke-border",
        },
        {
          y: 65,
          w: 140,
          label: "Transport (TCP/UDP)",
          note: "TCP segmenterer (MSS)",
          c: "fill-amber-500/15 stroke-amber-500",
        },
        {
          y: 95,
          w: 180,
          label: "Nettverk (IP)",
          note: "✓ IP-fragmentering skjer HER",
          c: "fill-emerald-500/30 stroke-emerald-500",
        },
        {
          y: 125,
          w: 220,
          label: "Link (Ethernet/WiFi)",
          note: "MTU setter grensen",
          c: "fill-sky-500/15 stroke-sky-500",
        },
        { y: 155, w: 260, label: "Fysisk", note: "bits", c: "fill-muted/20 stroke-border" },
      ].map((l, i) => (
        <g key={i}>
          <rect
            x={320 - l.w / 2}
            y={l.y}
            width={l.w}
            height={26}
            rx={4}
            className={l.c}
            strokeWidth={1.2}
          />
          <text
            x={320}
            y={l.y + 17}
            textAnchor="middle"
            className="fill-foreground text-[10px] font-semibold"
          >
            {l.label}
          </text>
          <text
            x={l.label === "Nettverk (IP)" ? 470 : l.w / 2 + 320 + 10}
            y={l.y + 17}
            className="fill-muted-foreground text-[9.5px] italic"
          >
            {l.note}
          </text>
        </g>
      ))}

      {/* Riktig svar */}
      <line
        x1={130}
        y1={108}
        x2={210}
        y2={108}
        className="stroke-emerald-500"
        strokeWidth={1.5}
        markerEnd="url(#lpArr)"
      />
      <text
        x={30}
        y={105}
        className="fill-emerald-700 dark:fill-emerald-400 text-[10px] font-semibold"
      >
        IP-fragmentering = lag 3
      </text>
      <text x={30} y={117} className="fill-muted-foreground text-[9.5px]">
        per-pakke i hver ruter (sjeldnere i IPv6).
      </text>

      {/* Vanlig misforståelse */}
      <line
        x1={510}
        y1={78}
        x2={460}
        y2={78}
        className="stroke-rose-500"
        strokeWidth={1.5}
        markerEnd="url(#lpArr)"
      />
      <text x={520} y={75} className="fill-rose-700 dark:fill-rose-400 text-[10px] font-semibold">
        Vanlig feil:
      </text>
      <text x={520} y={87} className="fill-muted-foreground text-[9.5px]">
        «TCP-segmentering»
      </text>
      <text x={520} y={99} className="fill-muted-foreground text-[9.5px]">
        ≠ IP-fragmentering.
      </text>

      <text x={20} y={205} className="fill-muted-foreground text-[9px] italic">
        TCP unngår fragmentering ved å velge MSS ≤ MTU − header; UDP-pakker fragmenteres på IP-nivå.
      </text>

      <defs>
        <marker
          id="lpArr"
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

// Fallgruve: LPM binær-prefiks-match
function LpmBinarySvg() {
  // Pakke: 10.4.130.7 — vis binær 10.4.130 første tre oktetter
  // Rad 1: 10.0.0.0/8     (8 bits match)
  // Rad 2: 10.4.0.0/16    (16 bits match)
  // Rad 3: 10.4.128.0/17  (17 bits match — vinner)
  // Rad 4: 10.0.0.0/24 (ikke match)
  return (
    <svg viewBox="0 0 720 220" className="w-full h-auto">
      <text x={20} y={18} className="fill-foreground text-[11px] font-semibold">
        Longest-Prefix-Match — sammenligner BITS, ikke sifre
      </text>

      {/* Pakke */}
      <text x={20} y={45} className="fill-foreground text-[10px] font-semibold">
        Pakke til 10.4.130.7:
      </text>
      <text x={170} y={45} className="fill-foreground text-[10px] font-mono">
        00001010
      </text>
      <text x={235} y={45} className="fill-foreground text-[10px] font-mono">
        .00000100
      </text>
      <text x={310} y={45} className="fill-foreground text-[10px] font-mono">
        .10000010
      </text>
      <text x={385} y={45} className="fill-foreground text-[10px] font-mono">
        .00000111
      </text>

      {/* Rader */}
      {[
        {
          route: "10.0.0.0/8",
          match: 8,
          win: false,
          bits: "00001010 . xxxxxxxx . xxxxxxxx . xxxxxxxx",
        },
        {
          route: "10.4.0.0/16",
          match: 16,
          win: false,
          bits: "00001010 . 00000100 . xxxxxxxx . xxxxxxxx",
        },
        {
          route: "10.4.128.0/17",
          match: 17,
          win: true,
          bits: "00001010 . 00000100 . 1xxxxxxx . xxxxxxxx",
        },
        {
          route: "10.0.0.0/24",
          match: 0,
          win: false,
          bits: "(ingen match — prefiks krever 10.0.0.x)",
        },
      ].map((r, i) => {
        const y = 70 + i * 30;
        return (
          <g key={i}>
            <rect
              x={20}
              y={y - 14}
              width={680}
              height={24}
              rx={3}
              className={
                r.win ? "fill-emerald-500/20 stroke-emerald-500" : "fill-card stroke-border"
              }
              strokeWidth={1}
            />
            <text x={28} y={y + 2} className="fill-foreground text-[10px] font-mono font-semibold">
              {r.route}
            </text>
            <text x={170} y={y + 2} className="fill-muted-foreground text-[9.5px] font-mono">
              {r.bits}
            </text>
            <text
              x={685}
              y={y + 2}
              textAnchor="end"
              className={
                r.win
                  ? "fill-emerald-700 dark:fill-emerald-400 text-[10px] font-semibold"
                  : "fill-muted-foreground text-[9.5px]"
              }
            >
              {r.match > 0 ? `${r.match} bits` : "—"}
              {r.win ? " ✓ vinner" : ""}
            </text>
          </g>
        );
      })}

      <text x={20} y={195} className="fill-muted-foreground text-[10px] italic">
        /17 vinner over /16 og /8 — 17 match-bits er flest. «Lengste streng i tekst» er ikke
        kriteriet.
      </text>
      <text x={20} y={208} className="fill-muted-foreground text-[9.5px]">
        10.0.0.0/24 ser kortere ut, men har faktisk LENGRE prefiks (24) — den matcher bare ikke
        pakken.
      </text>
    </svg>
  );
}

// Timeline for worked example: NAT pakke-trace
function NatTimelineSvg() {
  // Horizontal swimlane: Laptop · NAT · Server
  const W = 720;
  const laneH = 38;
  return (
    <svg viewBox={`0 0 ${W} 230`} className="w-full h-auto">
      <text x={20} y={16} className="fill-foreground text-[11px] font-semibold">
        Timeline — NAT pakke-trace fra laptop til server og tilbake
      </text>

      {/* Lanes */}
      {["Laptop 192.168.1.34", "NAT-ruter 84.55.12.7", "Server 203.0.113.45"].map((l, i) => {
        const y = 35 + i * laneH;
        return (
          <g key={i}>
            <rect
              x={20}
              y={y}
              width={150}
              height={laneH - 4}
              rx={3}
              className="fill-card stroke-border"
              strokeWidth={1}
            />
            <text
              x={95}
              y={y + laneH / 2 + 2}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-semibold"
            >
              {l}
            </text>
            <line
              x1={170}
              y1={y + laneH / 2}
              x2={W - 20}
              y2={y + laneH / 2}
              className="stroke-border"
              strokeWidth={0.6}
              strokeDasharray="2 2"
            />
          </g>
        );
      })}

      {/* Steg 1: Laptop → NAT, ut-pakke før omskriving */}
      <line
        x1={180}
        y1={50}
        x2={350}
        y2={73}
        className="stroke-sky-500"
        strokeWidth={1.4}
        markerEnd="url(#tlArr)"
      />
      <text x={185} y={50} className="fill-sky-700 dark:fill-sky-400 text-[9px] font-mono">
        ① src=192.168.1.34:51400 dst=203.0.113.45:443
      </text>

      {/* Steg 2: NAT skriver om, → server */}
      <line
        x1={400}
        y1={91}
        x2={620}
        y2={111}
        className="stroke-emerald-500"
        strokeWidth={1.4}
        markerEnd="url(#tlArr)"
      />
      <text x={405} y={88} className="fill-emerald-700 dark:fill-emerald-400 text-[9px] font-mono">
        ② src=84.55.12.7:62100 dst=203.0.113.45:443
      </text>
      <text x={405} y={100} className="fill-muted-foreground text-[8.5px]">
        (mapping lagret: .34:51400 ↔ .7:62100)
      </text>

      {/* Steg 3: server → NAT (SYN-ACK) */}
      <line
        x1={620}
        y1={130}
        x2={400}
        y2={107}
        className="stroke-amber-500"
        strokeWidth={1.4}
        markerEnd="url(#tlArr)"
      />
      <text x={460} y={135} className="fill-amber-700 dark:fill-amber-400 text-[9px] font-mono">
        ③ src=203.0.113.45:443 dst=84.55.12.7:62100
      </text>

      {/* Steg 4: NAT → laptop, reversert */}
      <line
        x1={350}
        y1={110}
        x2={180}
        y2={55}
        className="stroke-rose-500"
        strokeWidth={1.4}
        markerEnd="url(#tlArr)"
      />
      <text x={185} y={150} className="fill-rose-700 dark:fill-rose-400 text-[9px] font-mono">
        ④ src=203.0.113.45:443 dst=192.168.1.34:51400
      </text>

      {/* Notes */}
      <rect
        x={20}
        y={170}
        width={W - 40}
        height={50}
        rx={4}
        className="fill-muted/15 stroke-border"
        strokeWidth={0.8}
      />
      <text x={30} y={188} className="fill-foreground text-[10px] font-semibold">
        Hver pakke i flyten oversettes på samme måte:
      </text>
      <text x={30} y={202} className="fill-muted-foreground text-[9.5px]">
        Ut: src endres (laptop-IP → NAT-IP). Inn: dst endres (NAT-IP → laptop-IP). Port på inn-veien
        reverseres fra tabellen.
      </text>
      <text x={30} y={214} className="fill-muted-foreground text-[9.5px]">
        Mappingen holdes så lenge TCP-forbindelsen lever + noen minutter timeout.
      </text>

      <defs>
        <marker
          id="tlArr"
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
