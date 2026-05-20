import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  ExternalLink,
} from "lucide-react";
import { SectionPager, type SectionNavItem } from "./SectionPager";
import { Section41Live } from "./Section41Live";
import { Section42Live } from "./Section42Live";
import { Section43Live } from "./Section43Live";
import { Section44Live } from "./Section44Live";
import { Section45Live } from "./Section45Live";
import { VisualDefs } from "./VisualDefs";
import {
  ForwardingIcon,
  RoutingIcon,
  FibTableIcon,
  RibTableIcon,
  LpmIcon,
  FabricCrossbarIcon,
  InputPortIcon,
  OutputPortIcon,
  FabricMemoryIcon,
  FabricBusIcon,
  HolBlockingIcon,
  OutputLossIcon,
  RoutingProcessorIcon,
  Ipv4HeaderIcon,
  TtlIcon,
  MtuIcon,
  FragmentationIcon,
  PathMtuIcon,
  Ipv6HeaderIcon,
  Ipv6VsIpv4Icon,
  AddressRulerIcon,
  DualStackIcon,
  SdnIcon,
  OpenFlowIcon,
  MatchActionIcon,
  FlowIcon,
  ActionsIcon,
  PipelineIcon,
  NorthboundIcon,
  SouthboundIcon,
  NatIcon,
  NatTraversalIcon,
  NatTypesIcon,
  StatefulFirewallIcon,
  AclIcon,
  LoadBalancerIcon,
  DpiIcon,
  ProxyIcon,
} from "./visualDefIcons.kap4";

type Tab = "intro" | "4.1" | "4.2" | "4.3" | "4.4" | "4.5" | "4.6" | "4.7";

const SECTIONS_4: SectionNavItem[] = [
  { id: "intro", label: "Start her" },
  { id: "4.1", label: "4.1 Forwarding og routing" },
  { id: "4.2", label: "4.2 Inni en ruter" },
  { id: "4.3", label: "4.3 IP" },
  { id: "4.4", label: "4.4 Generalisert forwarding" },
  { id: "4.5", label: "4.5 Middlebokser" },
  { id: "4.6", label: "4.6 Oppgaver" },
  { id: "4.7", label: "4.7 Eksamen-fokus" },
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
            <TabBtn active={tab === "4.1"} onClick={() => setTab("4.1")} title="Forwarding og routing">
              4.1
            </TabBtn>
            <TabBtn active={tab === "4.2"} onClick={() => setTab("4.2")} title="Inni en ruter">
              4.2
            </TabBtn>
            <TabBtn active={tab === "4.3"} onClick={() => setTab("4.3")} title="IP">
              4.3
            </TabBtn>
            <TabBtn active={tab === "4.4"} onClick={() => setTab("4.4")} title="Generalisert forwarding">
              4.4
            </TabBtn>
            <TabBtn active={tab === "4.5"} onClick={() => setTab("4.5")} title="Middlebokser">
              4.5
            </TabBtn>
            <TabBtn active={tab === "4.6"} onClick={() => setTab("4.6")} title="Oppgaver">
              Oppg.
            </TabBtn>
            <TabBtn active={tab === "4.7"} onClick={() => setTab("4.7")} title="Eksamen-fokus">
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
        {tab === "4.7" && <SectionEksamen />}

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
            Skille mellom <em>data-plane</em> (per-pakke forwarding) og <em>control-plane</em>{" "}
            (rute-beregning), og forstå hvorfor skillet er sentralt i moderne rutere.
          </li>
          <li>
            Tegne arkitekturen i en moderne ruter: input-porter, switching-fabric, output-porter,
            og hvor kø-blokkering oppstår.
          </li>
          <li>
            Forklare hvordan en pakke flyter gjennom ruteren: lookup i forwarding-tabellen med
            longest prefix match, valg av output-port, switching.
          </li>
          <li>
            Lese IPv4-header bit for bit; forklare fragmentering når en pakke møter en lenke med
            mindre MTU; kjenne IPv6 og hva som er nytt.
          </li>
          <li>
            Forstå generalisert forwarding (SDN, OpenFlow, match-action) og hvorfor å skille
            control-plane fra data-plane endrer hva et nettverk kan gjøre.
          </li>
          <li>
            Beskrive middlebokser — NAT, brannmurer, load-balancere — og hva slags
            kompromisser de gir.
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Kapittelets struktur</h2>
        <ol className="list-decimal pl-5 text-muted-foreground space-y-1">
          <li>Forwarding og routing — ruter-arkitektur (interaktiv visualisering)</li>
          <li>Hva er inne i en ruter — input/output, fabric-typer</li>
          <li>IP — IPv4 header, fragmentering, IPv6</li>
          <li>Generalisert forwarding — SDN, OpenFlow, match-action</li>
          <li>Middlebokser — NAT, brannmur, load-balancer</li>
          <li>Oppgaver</li>
          <li>Eksamen-fokus</li>
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
// 4.1 — Forwarding og routing (interaktiv ruter-arkitektur)
// ============================================================
function Section41() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="4.1" title="Forwarding og routing — ruter-arkitektur" />

      <p className="text-muted-foreground">
        En ruter har én jobb: ta en pakke som ankommer, og sende den ut på riktig lenke. Men «riktig
        lenke» avgjøres to forskjellige steder. <strong>Forwarding</strong> er den raske,
        per-pakke-beslutningen som skjer i selve maskinvaren — flere millioner ganger i sekundet.{" "}
        <strong>Routing</strong> er den tregere, sjeldnere prosessen som beregner og oppdaterer
        tabellen forwardingen leser. Skillet mellom de to er det viktigste arkitektoniske grepet
        i nettverkslaget.
      </p>

      <Section41Live />

      <VisualDefs
        items={[
          {
            term: "Forwarding (data-plane)",
            icon: <ForwardingIcon />,
            body: (
              <>
                Per-pakke-beslutningen: ankommer en pakke, slå opp i forwarding-tabellen, send ut
                på rett port. Skjer i linjehastighet (nanosekunder) i ruterens hardware.
              </>
            ),
          },
          {
            term: "Routing (control-plane)",
            icon: <RoutingIcon />,
            body: (
              <>
                Beregner <em>hva</em> som skal stå i forwarding-tabellen. Bytter info med
                naboer (OSPF, BGP) og kjører algoritmer som Dijkstra. Tar sekunder eller minutter
                ved endring.
              </>
            ),
          },
          {
            term: "Forwarding-tabell (FIB — Forwarding Information Base)",
            icon: <FibTableIcon />,
            body: (
              <>
                Mapping fra IP-prefix til output-port. Eksempel: <code>10.1.2.0/24 → P4</code>.
                Hver input-port har sin egen kopi for å unngå flaskehals.
              </>
            ),
          },
          {
            term: "Routing-tabell (RIB — Routing Information Base)",
            icon: <RibTableIcon />,
            body: (
              <>
                Routing-prosessorens kompletteste bilde av topologien. RIB er CPU-data; FIB
                er den kompakte projeksjonen ned i hardware.
              </>
            ),
          },
          {
            term: "Longest Prefix Match (LPM)",
            icon: <LpmIcon />,
            body: (
              <>
                Når flere prefikser i tabellen matcher samme destinasjons-IP, velges det
                <em> lengste</em> — det mest spesifikke. <code>10.1.2.55</code> matcher både{" "}
                <code>10.0.0.0/8</code> og <code>10.1.2.0/24</code>, men /24 vinner.
              </>
            ),
          },
          {
            term: "Switching-fabric",
            icon: <FabricCrossbarIcon />,
            body: (
              <>
                Mekanismen inne i ruteren som flytter pakker fra input-port til output-port.
                Tre hovedtyper: minne (CPU kopierer), buss (delt, én pakke om gangen), crossbar
                (parallelle stier — moderne høyhastighets-rutere).
              </>
            ),
          },
        ]}
      />

      <Metafor tittel="Postsorterings-sentral">
        <p>
          Et brev kommer inn på en av mange luker (input-port). En operatør leser
          mottakerens postnummer (LPM-oppslag), legger brevet på et transportbånd som krysser
          hallen (switching-fabric), og det havner i en kasse for riktig utgangsdør
          (output-kø). Bilene kjører ut etter ruteplan (output-port → ut-lenke).
        </p>
        <p className="mt-2">
          Samtidig sitter postsjefen på kontoret og oppdaterer kart over nye veier som er
          åpne eller stengte (control-plane: OSPF). Hun trykker det inn i operatørenes
          oppslagsark (FIB) — uten å stoppe sorteringen.
        </p>
      </Metafor>

      <Hvorfor title="Hvorfor skille data-plane fra control-plane?">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Ytelse:</strong> data-planet må jobbe i nanosekunder per pakke. Det
            klarer det bare fordi det leser en ferdig-tygget tabell.
          </li>
          <li>
            <strong>Stabilitet:</strong> en lenke som faller ut starter et stort
            beregningsarbeid (Dijkstra). Det får ikke lov til å hindre at de millionene
            pakker som allerede er underveis blir levert.
          </li>
          <li>
            <strong>Fleksibilitet:</strong> man kan bytte routing-protokoll (RIP → OSPF →
            BGP) uten å røre hardware. Og man kan flytte hele control-planet ut av
            ruteren — det er SDN (kap. 4.4).
          </li>
        </ul>
      </Hvorfor>

      <Fallgruve tittel="Forveksling: ‘forwarding’ vs ‘routing’">
        I dagligtale brukes ordene om hverandre. På eksamen må du skille: en pakke{" "}
        <em>forwardes</em>; en sti <em>routes</em>. Forwarding er hva ruteren gjør med
        akkurat denne pakken; routing er hva ruteren <em>vet</em> om nettverket totalt.
      </Fallgruve>
    </article>
  );
}

// ============================================================
// 4.2 — Hva er inni en ruter
// ============================================================
function Section42() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="4.2" title="Hva er inni en ruter" />

      <p className="text-muted-foreground">
        En ruter har fire byggesteiner: input-porter, switching-fabric, output-porter, og en
        routing-prosessor som styrer control-planet. Forwarding går horisontalt gjennom de
        tre første. Routing-prosessoren sitter på siden og oppdaterer forwarding-tabellen i
        hver input-port.
      </p>

      <Section42Live />

      <VisualDefs
        items={[
          {
            term: "Input-port",
            icon: <InputPortIcon />,
            body: (
              <>
                Tre lag av jobb: fysisk mottak (decoder bits fra mediet), lenke-lag
                (Ethernet-rammer → IP-pakker), og <em>match-action</em>: slå opp i FIB,
                stemple ut output-port, og slipp inn på fabric. Hver input-port har sin egen
                kopi av FIB — å sentralisere ville vært flaskehals.
              </>
            ),
          },
          {
            term: "Output-port",
            icon: <OutputPortIcon />,
            body: (
              <>
                Speilbilde av input. Tar pakker fra fabric, legger dem i en kø, kjører
                scheduler (FIFO, prioritert, round-robin, WFQ), gjør lenke-lag-utgang og
                fysisk-lag-utgang. Output-køen er hovedstedet pakker tapes ved kongesjon.
              </>
            ),
          },
          {
            term: "Switching fabric — minne",
            icon: <FabricMemoryIcon />,
            body: (
              <>
                Eldste modell. CPU kopierer pakken fra input-buffer til output-buffer over en
                delt minnebuss. Hastighet begrenset av minnebåndbredde — ofte for tregt for
                moderne rutere.
              </>
            ),
          },
          {
            term: "Switching fabric — buss",
            icon: <FabricBusIcon />,
            body: (
              <>
                En felles intern buss alle porter henger på. Bedre enn minne (ingen CPU), men
                bare én pakke kan krysse om gangen. Total ruter-throughput begrenset av
                buss-hastigheten.
              </>
            ),
          },
          {
            term: "Switching fabric — crossbar (interconnect)",
            icon: <FabricCrossbarIcon />,
            body: (
              <>
                Et 2D-koblingsnett der hver input-port har en uavhengig sti til hver
                output-port. Flere pakker kan krysse samtidig så lenge de skal til ulike
                output-porter. Brukes i moderne høyhastighets-rutere.
              </>
            ),
          },
          {
            term: "Head-of-line (HOL) blocking",
            icon: <HolBlockingIcon />,
            body: (
              <>
                Når input-kø er FIFO og pakken først i køen ikke får komme over fabric (fordi
                output-porten er opptatt), blokkeres alle pakkene bak — selv de som skulle
                til ledige output-porter. Løsning: Virtual Output Queues (VOQ), én kø per
                output i hver input.
              </>
            ),
          },
          {
            term: "Output-kø-pakketap",
            icon: <OutputLossIcon />,
            body: (
              <>
                Hvis fabric leverer pakker til en output-port raskere enn lenken kan sende
                dem ut, vokser køen. Når bufferen er full, mistes pakker. Dette er
                hoved-kilden til pakketap i internett.
              </>
            ),
          },
          {
            term: "Routing-prosessor",
            icon: <RoutingProcessorIcon />,
            body: (
              <>
                CPU-en som kjører routing-protokoller (OSPF, BGP), holder RIB, og oppdaterer
                FIB-en i hver input-port. Også ansvarlig for management (SNMP, NETCONF) og
                ICMP-respons.
              </>
            ),
          },
        ]}
      />

      <Hvorfor title="Hvorfor er input/output skilt fra fabric?">
        Skillet lar samme fabric brukes med ulike portkort. En 10-Gbit fiber-port og en
        1-Gbit Ethernet-port kobles til samme crossbar — fabric-en bryr seg ikke om hva som
        skjer på utsiden. Det gjør rutere modulære: man bytter linjekort uten å bytte
        backplane.
      </Hvorfor>

      <Fallgruve tittel="Pakketap skjer mest i output, ikke input">
        Det er fristende å tro at pakker tapes når mange pakker ankommer samtidig. I praksis
        tapes de oftest i output-køen, fordi fabric kan levere fra alle inputs samtidig til
        samme output. Kongesjon konsentreres der.
      </Fallgruve>
    </article>
  );
}

// ============================================================
// 4.3 — Internet Protocol (IPv4 + IPv6)
// ============================================================
function Section43() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="4.3" title="Internet Protocol — IPv4 og IPv6" />

      <p className="text-muted-foreground">
        IP-protokollen er det universelle språket nettverkslaget bruker. Den definerer
        pakke-formatet (header) og en best-effort leveringstjeneste — ingen garantier, ingen
        ordens-bevaring. Alt over (TCP) og under (lenke-lag) snakker IP, og det er det som
        gjør internett internett.
      </p>

      <Section43Live />

      <VisualDefs
        items={[
          {
            term: "IPv4-header (20–60 bytes)",
            icon: <Ipv4HeaderIcon />,
            body: (
              <>
                Felter du må kjenne: <code>Version</code> (4), <code>IHL</code> (header-lengde i
                32-bit-ord), <code>TOS/DSCP</code> (tjenesteklasse), <code>Total Length</code>{" "}
                (header + data), <code>Identification</code>, <code>Flags</code>,{" "}
                <code>Fragment Offset</code> (for fragmentering), <code>TTL</code> (dekrementeres
                av hver ruter, dropper ved 0), <code>Protocol</code> (TCP=6, UDP=17, ICMP=1),{" "}
                <code>Header Checksum</code>, <code>Source IP</code>, <code>Destination IP</code>,
                og eventuelle <code>Options</code>.
              </>
            ),
          },
          {
            term: "TTL (Time To Live)",
            icon: <TtlIcon />,
            body: (
              <>
                Hver ruter på stien dekrementerer TTL med 1. Når TTL = 0 dropper ruteren pakken
                og sender ICMP «Time Exceeded» tilbake til avsenderen. Det er denne mekanismen{" "}
                <code>traceroute</code> utnytter: send pakker med TTL=1, 2, 3, … og se hvem som
                klager.
              </>
            ),
          },
          {
            term: "MTU (Maximum Transmission Unit)",
            icon: <MtuIcon />,
            body: (
              <>
                Største pakke en lenke kan transportere uten splitting. Ethernet: 1500 bytes;
                noen WAN-lenker: 576 bytes; gigabit med jumbo: opp til 9000 bytes.
              </>
            ),
          },
          {
            term: "Fragmentering (IPv4)",
            icon: <FragmentationIcon />,
            body: (
              <>
                Hvis en pakke er større enn neste lenkes MTU, deler ruteren den i fragmenter.
                Hvert fragment får samme <code>Identification</code>, ny{" "}
                <code>Fragment Offset</code>, og <code>More Fragments</code>-flag satt på alle
                unntatt det siste. Reassembly skjer kun hos mottaker — aldri på mellom-rutere.
              </>
            ),
          },
          {
            term: "Path MTU Discovery",
            icon: <PathMtuIcon />,
            body: (
              <>
                Sender setter <code>Don&apos;t Fragment</code>-flag og lar rutere som ikke kan
                videresende returnere ICMP «Fragmentation Needed» med deres MTU. Sender lærer
                seg minste MTU på stien og sender pakker som passer.
              </>
            ),
          },
          {
            term: "IPv6-header (fast 40 bytes)",
            icon: <Ipv6HeaderIcon />,
            body: (
              <>
                Mye enklere enn IPv4: <code>Version</code> (6), <code>Traffic Class</code>,{" "}
                <code>Flow Label</code>, <code>Payload Length</code>, <code>Next Header</code>{" "}
                (erstatter Protocol; støtter extension headers), <code>Hop Limit</code> (samme
                som TTL), 128-bit <code>Source</code> og <code>Destination</code>. Ingen
                checksum (lenke-lag og TCP/UDP håndterer det).
              </>
            ),
          },
          {
            term: "IPv6 vs IPv4 — hva er borte",
            icon: <Ipv6VsIpv4Icon />,
            body: (
              <>
                IPv6 fjerner header-checksum (raskere forwarding), fjerner fragmentering på
                mellom-rutere (kun ende-til-ende — ruteren returnerer ICMPv6 «Packet Too Big»),
                og fjerner Options-feltet (extension headers i stedet).
              </>
            ),
          },
          {
            term: "Adressering: 32 bits → 128 bits",
            icon: <AddressRulerIcon />,
            body: (
              <>
                IPv4: ~4,3 milliarder unike adresser. IPv6: 2^128 ≈ 3,4×10^38. Skrives som åtte
                grupper av fire hex-sifre, separert med kolon:{" "}
                <code>2001:0db8:85a3::8a2e:0370:7334</code>. Dobbel kolon = sammentrekning av
                fortløpende nuller.
              </>
            ),
          },
          {
            term: "Overgang: dual-stack og tunnelering",
            icon: <DualStackIcon />,
            body: (
              <>
                <em>Dual-stack:</em> hosts og rutere kjører både IPv4 og IPv6 samtidig.{" "}
                <em>Tunnelering:</em> IPv6-pakker pakkes inn i IPv4-pakker for å krysse
                IPv4-øyer (6in4, 6to4, Teredo).
              </>
            ),
          },
        ]}
      />

      <Hvorfor title="Hvorfor 128 bits, ikke bare 64?">
        Med 64 bits ville vi fortsatt fått adresse-knapphet i et hierarkisk system. 128 bits
        lar oss kaste bort de første 64 til ren ruting (prefix) og bruke de siste 64 til
        host-ID — fortsatt med rom for å gi alle apparater på jorda mange tusen adresser hver.
      </Hvorfor>

      <Fallgruve tittel="Mellom-rutere fragmenterer IKKE i IPv6">
        Dette er en eksamen-yndling. I IPv4 kan en ruter fragmentere. I IPv6 må senderen
        gjøre Path MTU Discovery; en ruter som ikke kan videresende sender ICMPv6 «Packet Too
        Big» og dropper. Hensikten er å spare ruter-CPU.
      </Fallgruve>
    </article>
  );
}

// ============================================================
// 4.4 — Generalisert forwarding (SDN, OpenFlow, match-action)
// ============================================================
function Section44() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="4.4" title="Generalisert forwarding — SDN, OpenFlow, match-action" />

      <p className="text-muted-foreground">
        Tradisjonelt har en ruter sett pakken på destinasjons-IP-en og slått opp i en
        prefix-tabell. Generalisert forwarding generaliserer dette: «matche på hva som helst i
        pakke-headerne, og gjør hva som helst med pakken». Det åpner døren for SDN.
      </p>

      <Section44Live />

      <VisualDefs
        items={[
          {
            term: "SDN (Software-Defined Networking)",
            icon: <SdnIcon />,
            body: (
              <>
                Arkitektur som flytter control-planet ut av ruterne og inn i en sentral
                kontroller (programvare). Ruterne (nå mer som dumme switcher) blir kun
                data-plane: «her er reglene, følg dem». Kontrolleren kjenner hele topologien
                og kan programmere ruterne fritt.
              </>
            ),
          },
          {
            term: "OpenFlow",
            icon: <OpenFlowIcon />,
            body: (
              <>
                Det første store SDN-protokollen. Standardiserer hva en kontroller sier til en
                switch: «her er en flow table». OpenFlow versjon 1.0 hadde 12 match-felt
                (MAC, IP, TCP-port, VLAN, …); senere versjoner utvidet det.
              </>
            ),
          },
          {
            term: "Match-Action-tabell",
            icon: <MatchActionIcon />,
            body: (
              <>
                Den generaliserte forwarding-strukturen. Hver regel har et{" "}
                <strong>match</strong>-mønster (hvilke felt og verdier som må stemme), en{" "}
                <strong>action</strong> (forward til port, drop, modifiser felt, send til
                kontroller), og en <strong>prioritet</strong> (ved flere treff vinner høyest).
              </>
            ),
          },
          {
            term: "Flow",
            icon: <FlowIcon />,
            body: (
              <>
                En sekvens av pakker som matcher samme regel. En flow defineres ikke av
                pakkene selv, men av regelens match-mønster — kan være «alle TCP-pakker fra
                10.0.0.5 til port 80» eller «alt fra VLAN 7».
              </>
            ),
          },
          {
            term: "Actions",
            icon: <ActionsIcon />,
            body: (
              <>
                Typiske handlinger: <code>forward(port)</code>, <code>drop</code>,{" "}
                <code>flood</code>, <code>send-to-controller</code>,{" "}
                <code>rewrite(field)</code> (f.eks. endre destinasjons-IP — det er det NAT
                gjør!), <code>push/pop tag</code> (VLAN, MPLS).
              </>
            ),
          },
          {
            term: "Pipeline (flere tabeller)",
            icon: <PipelineIcon />,
            body: (
              <>
                Moderne OpenFlow har flere tabeller i serie: pakken matches mot tabell 0,
                handlingen kan inkludere «gå til tabell 2», osv. Lar deg dekomponere logikk:
                én tabell for ACL, én for routing, én for VLAN-merking.
              </>
            ),
          },
          {
            term: "Northbound API",
            icon: <NorthboundIcon />,
            body: (
              <>
                Grensesnittet mellom SDN-kontrolleren og apper som programmerer den. Lar
                nettverks-policies skrives som programmer: «alle ansatte i HR har tilgang til
                fil-server X, ingen andre». Apper trenger ikke kjenne switch-detaljer.
              </>
            ),
          },
          {
            term: "Southbound API",
            icon: <SouthboundIcon />,
            body: (
              <>
                Grensesnittet mellom kontroller og switcher. OpenFlow er den mest kjente, men
                også NETCONF, P4Runtime, OF-CONFIG.
              </>
            ),
          },
        ]}
      />

      <Metafor tittel="Fra dumme telefoner til smarttelefoner">
        Gamle rutere er som dumme-telefoner: hver enhet har all funksjonalitet innebygd, og
        for å endre noe må du bytte hardware. SDN er som smarttelefoner: en sentral app-butikk
        (kontrolleren) skyver ned program (flow-tabeller). Selve enheten gjør bare det den
        får beskjed om.
      </Metafor>

      <Hvorfor title="Hvorfor matter SDN?">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Datasentre:</strong> Google, Facebook, Microsoft kjører egen SDN på sine
            datasenter-fabric for å rute trafikk optimalt mellom millioner av servere.
          </li>
          <li>
            <strong>Sikkerhetspolicies:</strong> en sentral policy kan håndheves konsistent
            på hver switch — uten å stole på at hver lokal admin oppdaterer ACL-er manuelt.
          </li>
          <li>
            <strong>Innovasjon:</strong> nye nettverks-features krever ikke nye standarder
            eller ny hardware — bare ny kontroller-software.
          </li>
        </ul>
      </Hvorfor>

      <Fallgruve tittel="‘SDN’ betyr ikke automatisk OpenFlow">
        OpenFlow er én konkret realisering. Mange «SDN»-deployments bruker P4, eBPF, eller
        proprietære APIer. Det viktige er prinsippet: control- og data-plane skilles, og
        control-planet sentraliseres logisk.
      </Fallgruve>
    </article>
  );
}

// ============================================================
// 4.5 — Middlebokser
// ============================================================
function Section45() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="4.5" title="Middlebokser — NAT, brannmurer, load-balancere" />

      <p className="text-muted-foreground">
        En <em>middlebox</em> er enhver enhet på pakkens sti som gjør noe annet enn ren
        forwarding. De bryter mot end-to-end-prinsippet («tjenester hører hjemme i endepunktene,
        ikke i nettverket»), men er overalt likevel — fordi de løser reelle problemer som
        ikke endepunktene kunne løse alene.
      </p>

      <Section45Live />

      <VisualDefs
        items={[
          {
            term: "NAT (Network Address Translation)",
            icon: <NatIcon />,
            body: (
              <>
                Lar mange private IP-adresser (typisk 10.0.0.0/8 eller 192.168.0.0/16) dele én
                offentlig IP utad. NAT-boksen oversetter pakker i begge retninger ved å holde
                en oversettelsestabell over <code>(privat-IP, privat-port) ↔ (offentlig-IP,
                offentlig-port)</code>.
              </>
            ),
          },
          {
            term: "NAT-traversal — hva som ikke fungerer",
            icon: <NatTraversalIcon />,
            body: (
              <>
                Pakker som ankommer NAT-boksen utenfra uten en eksisterende oversetting blir
                droppet. Det betyr P2P, VoIP, og innkommende tilkoblinger er vanskelig. STUN,
                TURN, ICE og hole punching er teknikker for å komme rundt det.
              </>
            ),
          },
          {
            term: "NAT-typer",
            icon: <NatTypesIcon />,
            body: (
              <>
                <em>Full cone:</em> én ekstern endepunkt kan kontakte intern host via mappingen.
                <em> Restricted cone:</em> kun ekstern host som intern host har snakket med.
                <em> Symmetric NAT:</em> mappingen avhenger av ekstern destinasjon — vanskeligst
                å traversere.
              </>
            ),
          },
          {
            term: "Stateful brannmur",
            icon: <StatefulFirewallIcon />,
            body: (
              <>
                Holder oversikt over åpne tilkoblinger og slipper kun gjennom pakker som
                tilhører en sesjon som er initiert innenfra (eller eksplisitt åpnet). En SYN
                fra utsiden uten match → drop. Forskjellig fra stateless pakkefilter som kun
                ser på en pakke om gangen.
              </>
            ),
          },
          {
            term: "ACL (Access Control List)",
            icon: <AclIcon />,
            body: (
              <>
                Liste av regler som matcher på pakke-felt og enten tillater eller blokkerer.
                Brukes både i brannmurer og i mange ruter-konfigurasjoner.
              </>
            ),
          },
          {
            term: "Load-balancer",
            icon: <LoadBalancerIcon />,
            body: (
              <>
                Mottar trafikk på én virtuell IP, distribuerer den på mange back-end-servere.
                L4-LB jobber på TCP-nivå (kjenner kun (IP, port)). L7-LB jobber på HTTP-nivå
                (kan rute basert på URL, cookies, headers).
              </>
            ),
          },
          {
            term: "DPI (Deep Packet Inspection)",
            icon: <DpiIcon />,
            body: (
              <>
                Middleboks som leser pakke-innholdet, ikke bare headerne. Brukes til
                klassifisering, deteksjon, sensur. Brytes ned hvis trafikken er ende-til-ende
                kryptert (HTTPS, QUIC).
              </>
            ),
          },
          {
            term: "Application-gateway / proxy",
            icon: <ProxyIcon />,
            body: (
              <>
                Bryter tilkoblingen i to: klient ↔ proxy, og proxy ↔ server. Brukes for
                caching (web), filtrering, eller protokoll-konvertering.
              </>
            ),
          },
        ]}
      />

      <Hvorfor title="Hvorfor lever middleboxes på tross av end-to-end-prinsippet?">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Adresse-knapphet:</strong> NAT lar oss leve med IPv4 mye lenger enn vi
            burde. Vi har gått fra «slå opp IPv6» til «den dagen alle bytter NAT-en sin».
          </li>
          <li>
            <strong>Sikkerhet:</strong> en sentral brannmur er enklere å administrere enn å
            stole på at hver host har riktig konfigurasjon.
          </li>
          <li>
            <strong>Ytelse og skala:</strong> en load-balancer foran tusen servere er den
            eneste måten å håndtere milliarder av forespørsler.
          </li>
        </ul>
      </Hvorfor>

      <Fallgruve tittel="NAT ‘er ikke en brannmur’">
        NAT blokkerer innkommende tilkoblinger som side-effekt, men det er ikke design-målet.
        Et NAT-konfigurert nett kan fortsatt bli kompromittert via outbound-initierte
        tilkoblinger (drive-by-downloads, exfiltrering). Bruk eksplisitt brannmur for
        sikkerhet, ikke NAT.
      </Fallgruve>
    </article>
  );
}

// ============================================================
// 4.6 — Oppgaver (placeholder)
// ============================================================
function Section46() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="4.6" title="Oppgaver" />
      <p className="text-muted-foreground">
        Oppgave-banken for kapittel 4 er under bygging. Inntil den er klar, øv på de
        eksisterende interaktive sidene under — de dekker de viktigste konseptene.
      </p>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <h3 className="text-sm font-semibold mb-2">Foreløpig: gå via de interaktive sidene</h3>
        <p className="text-muted-foreground text-xs mb-2">
          Bruk disse mens vi skriver fullstendige oppgaver:
        </p>
        <RelatedSlugs
          slugs={[
            "dte2507-inni-ruter",
            "dte2507-subnetting",
            "dte2507-nat",
            "dte2507-paket-dekoding",
            "dte2507-packet-scheduling",
          ]}
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold mb-2">Tema-forslag (kommer)</h3>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1 text-xs">
          <li>Longest Prefix Match — gitt en tabell og en destinasjons-IP, finn output-porten</li>
          <li>Fragmentering — gitt MTU og pakke-størrelse, regn ut hvor mange fragmenter</li>
          <li>Switching-fabric-throughput — analyse av HOL-blocking i input-køet ruter</li>
          <li>NAT-tabell — fylle ut oversettings-rader gitt pakke-sekvens</li>
          <li>OpenFlow-tabell — skrive flow-regler for en gitt policy</li>
        </ul>
      </div>
    </article>
  );
}

// ============================================================
// 4.7 — Eksamen-fokus (placeholder)
// ============================================================
function SectionEksamen() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="4.7" title="Eksamen-fokus" />

      <p className="text-muted-foreground">
        Eksamens-mappet sammendrag av kapittel 4 er under skriving. Det vil komme et kompakt
        kort med definisjoner, formler, tegninger og typiske spørsmål fra DTE-2507-eksamen.
      </p>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold mb-2">Foreløpig: hva eksamen pleier å spørre om</h3>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1 text-xs">
          <li>
            <strong>Forklare</strong> forskjellen mellom forwarding og routing — med eksempel
            på hva som skjer ved en lenke som faller ut.
          </li>
          <li>
            <strong>Tegne</strong> ruter-arkitekturen: input-port, switching-fabric,
            output-port, routing-prosessor. Hvor oppstår pakketap?
          </li>
          <li>
            <strong>Lese</strong> et IPv4-header: peke ut TTL, Total Length, Protocol,
            Source/Destination. Hvilket felt brukes til fragmentering?
          </li>
          <li>
            <strong>Regne</strong> longest prefix match: gitt tabell + IP, finn output-port.
          </li>
          <li>
            <strong>Beskrive</strong> hva NAT gjør, hvilke kompromisser det gir, og hvorfor
            P2P er vanskelig over NAT.
          </li>
          <li>
            <strong>Sammenligne</strong> IPv4 og IPv6: hva ble fjernet, hva ble lagt til,
            hvorfor.
          </li>
          <li>
            <strong>Forklare</strong> SDN-prinsippet og hva en match-action-tabell er.
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold mb-2">Beslektede interaktive sider</h3>
        <RelatedSlugs
          slugs={[
            "dte2507-inni-ruter",
            "dte2507-subnetting",
            "dte2507-nat",
            "dte2507-paket-dekoding",
            "dte2507-arp-detektiv",
            "dte2507-packet-scheduling",
          ]}
        />
      </div>
    </article>
  );
}

// ============================================================
// Felles UI-hjelpere
// ============================================================

function Header({ num, title }: { num: string; title: string }) {
  return (
    <div className="border-b border-border pb-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        Seksjon {num}
      </div>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}

function Defs({ items }: { items: { term: string; body: React.ReactNode }[] }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-foreground bg-muted/40 hover:bg-muted/60"
      >
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        Definisjoner og begreper
      </button>
      {open && (
        <dl className="divide-y divide-border">
          {items.map((it, i) => (
            <div key={i} className="px-4 py-2.5">
              <dt className="text-sm font-semibold text-foreground">{it.term}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{it.body}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function Metafor({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
      <h3 className="text-sm font-semibold mb-1.5 text-purple-700 dark:text-purple-300">
        Metafor — {tittel}
      </h3>
      <div className="text-sm text-muted-foreground space-y-2">{children}</div>
    </div>
  );
}

function Hvorfor({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
      <h3 className="text-sm font-semibold mb-1.5 text-blue-700 dark:text-blue-300">
        {title}
      </h3>
      <div className="text-sm text-muted-foreground space-y-1">{children}</div>
    </div>
  );
}

function Fallgruve({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
      <h3 className="text-sm font-semibold mb-1.5 text-destructive">
        Fallgruve — {tittel}
      </h3>
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

function RelatedSlugs({ slugs }: { slugs: string[] }) {
  return (
    <ul className="space-y-1 text-sm">
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
  );
}
