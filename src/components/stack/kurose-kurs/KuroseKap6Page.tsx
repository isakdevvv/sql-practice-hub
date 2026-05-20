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
import { Section61Live } from "./Section61Live";
import { Section62Live } from "./Section62Live";
import { Section63Live } from "./Section63Live";
import { Section64Live } from "./Section64Live";
import { Section65Live } from "./Section65Live";
import { Section66Live } from "./Section66Live";
import { VisualDefs } from "./VisualDefs";
import {
  FrameIcon,
  EthernetFrameIcon,
  PreambleIcon,
  SfdIcon,
  InterFrameGapIcon,
  PayloadIcon,
  JumboFrameIcon,
  EtherTypeIcon,
  FcsIcon,
  MacIcon,
  DstSrcMacIcon,
  OuiIcon,
  IgUlBitIcon,
  BroadcastMacIcon,
  ParityIcon,
  Parity2DIcon,
  ChecksumIcon,
  CrcIcon,
  GeneratorPolyIcon,
  BurstErrorIcon,
  Gf2Icon,
  HammingIcon,
  FecBecIcon,
  NodeIcon,
  FramingIcon,
  DuplexIcon,
  MtuIcon,
  ReliableLinkIcon,
  PauseIcon,
  PointToPointIcon,
  BroadcastMediumIcon,
  NicIcon,
  PromiscuousIcon,
  ChannelPartitionIcon,
  AlohaIcon,
  SlotAlohaIcon,
  CsmaIcon,
  CsmaCdIcon,
  BackoffIcon,
  PollingIcon,
  TokenRingIcon,
  PropagationIcon,
  JamIcon,
  HiddenTerminalIcon,
  CsmaCaIcon,
  CaptureEffectIcon,
  OfferedLoadIcon,
  ArpIcon,
  ArpCacheIcon,
  IpBroadcastIcon,
  SwitchTableIcon,
  SelfLearningIcon,
  PlugPlayIcon,
  GratuitousArpIcon,
  ArpSpoofIcon,
  FloodingIcon,
  TableAgingIcon,
  SpanningTreeIcon,
  BpduIcon,
  VrrpIcon,
  HubIcon,
  SwitchBoxIcon,
  SwitchHierarchyIcon,
  AutoNegotiationIcon,
  PoeIcon,
  CamIcon,
  ManchesterIcon,
  VlanIcon,
  VlanTagIcon,
  TrunkLinkIcon,
  NativeVlanIcon,
  InterVlanRoutingIcon,
  FirewallVlanIcon,
  VlanHoppingIcon,
  PrivateVlanIcon,
  VoiceVlanIcon,
  VtpIcon,
  QinqIcon,
  TorSwitchIcon,
  ThreeTierIcon,
  FatTreeIcon,
  LeafSpineIcon,
  EcmpIcon,
  BisectionIcon,
  OversubscriptionIcon,
  EastWestIcon,
  ClosIcon,
  DcbIcon,
  RdmaIcon,
  BgpIcon,
  VxlanIcon,
  MplsLabelIcon,
  LsrIcon,
  LspIcon,
  PushSwapPopIcon,
  FecIcon,
  LdpIcon,
  MplsVpnIcon,
  L3VpnIcon,
  VplsIcon,
  TrafficEngIcon,
  SegmentRoutingIcon,
  ExpBitIcon,
  MplsTtlIcon,
} from "./visualDefIcons.kap6";

type Tab = "intro" | "6.1" | "6.2" | "6.3" | "6.4" | "6.5" | "6.6" | "oppgaver" | "eksamen";

const SECTIONS_6: SectionNavItem[] = [
  { id: "intro", label: "Start her" },
  { id: "6.1", label: "6.1 Intro til linklaget" },
  { id: "6.2", label: "6.2 Error detection" },
  { id: "6.3", label: "6.3 Multiple access" },
  { id: "6.4", label: "6.4 Switched LAN" },
  { id: "6.5", label: "6.5 Datasenter-nett" },
  { id: "6.6", label: "6.6 MPLS" },
  { id: "oppgaver", label: "Oppgaver" },
  { id: "eksamen", label: "Eksamen-fokus" },
];
const NEXT_CHAPTER_6 = { slug: "kurose-kap-7", title: "Trådløst og mobilt" };

export function KuroseKap6Page() {
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
              Kap. 6 — Link-laget og LAN
            </h1>
          </div>
          <nav className="ml-auto flex flex-wrap gap-0.5">
            <TabBtn active={tab === "intro"} onClick={() => setTab("intro")}>
              Start
            </TabBtn>
            <TabBtn active={tab === "6.1"} onClick={() => setTab("6.1")} title="Intro til linklaget">
              6.1
            </TabBtn>
            <TabBtn active={tab === "6.2"} onClick={() => setTab("6.2")} title="Error detection">
              6.2
            </TabBtn>
            <TabBtn active={tab === "6.3"} onClick={() => setTab("6.3")} title="Multiple access">
              6.3
            </TabBtn>
            <TabBtn
              active={tab === "6.4"}
              onClick={() => setTab("6.4")}
              title="Switched LAN: Ethernet, switches, VLAN"
            >
              6.4
            </TabBtn>
            <TabBtn active={tab === "6.5"} onClick={() => setTab("6.5")} title="Datasenter-nett">
              6.5
            </TabBtn>
            <TabBtn active={tab === "6.6"} onClick={() => setTab("6.6")} title="MPLS">
              6.6
            </TabBtn>
            <TabBtn active={tab === "oppgaver"} onClick={() => setTab("oppgaver")} title="Oppgaver">
              Oppg.
            </TabBtn>
            <TabBtn active={tab === "eksamen"} onClick={() => setTab("eksamen")} title="Eksamen-fokus">
              Eksamen
            </TabBtn>
          </nav>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "6.1" && <Section61 />}
        {tab === "6.2" && <Section62 />}
        {tab === "6.3" && <Section63 />}
        {tab === "6.4" && <Section64 />}
        {tab === "6.5" && <Section65 />}
        {tab === "6.6" && <Section66 />}
        {tab === "oppgaver" && <SectionOppgaver />}
        {tab === "eksamen" && <SectionEksamen />}

        <SectionPager
          tabs={SECTIONS_6}
          current={tab}
          onPick={(id) => setTab(id as Tab)}
          nextChapter={NEXT_CHAPTER_6}
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
            Forklare hva en ramme er, hva MAC-adresser brukes til, og hvorfor de er forskjellig fra
            IP-adresser.
          </li>
          <li>
            Regne paritets-bit, 2D-paritet, internet checksum og CRC for en gitt bit-sekvens — og
            vite hvilken som tåler hvilke feil.
          </li>
          <li>
            Sammenligne ALOHA-varianter og CSMA/CD: når slipper du å sende, og hva er teoretisk max
            throughput?
          </li>
          <li>
            Følge en ramme gjennom en switch som lærer seg selv — hvordan MAC-tabellen bygges opp og
            hvorfor flooding skjer ved oppstart.
          </li>
          <li>
            Forklare hvordan ARP knytter IP til MAC, og hva forskjellen er mellom MAC-broadcast og
            IP-broadcast.
          </li>
          <li>
            Beskrive hvorfor en VLAN-tag (802.1Q) gjør at én fysisk switch kan oppføre seg som mange
            separate broadcast-domener.
          </li>
          <li>
            Skissere en fat-tree / leaf-spine topologi og forklare hvorfor moderne datasentre velger
            den framfor klassisk tre-hierarki.
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Kapittelets struktur</h2>
        <ol className="list-decimal pl-5 text-muted-foreground space-y-1">
          <li>Tjenester levert av link-laget — rammer, MAC, half/full duplex</li>
          <li>Feiloppdaging — paritet, 2D-paritet, checksum, CRC</li>
          <li>Multiple access — ALOHA, CSMA/CD, taking-turns</li>
          <li>Switched LAN — ARP og switch self-learning</li>
          <li>Ethernet — ramme-format og hierarki av switcher</li>
          <li>VLAN — én fysisk switch, mange logiske nett</li>
          <li>Datasenter-nettverk — fat-tree og leaf-spine</li>
          <li>Oppgaver — sjekk forståelsen din</li>
        </ol>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => onPick("6.1")}>
            Start på 6.1 →
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 6.1 — Tjenester levert av link-laget
// ============================================================
function Section61() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="6.1" title="Intro til datalink-laget — hvordan en ramme bygges" />

      <p className="text-muted-foreground">
        Link-laget er det laveste laget vi behandler i detalj. Det tar et IP-datagram fra
        nettverkslaget, pakker det inn i en <em>ramme</em>, og flytter rammen over én fysisk lenke
        til neste node. Det er bittelitt mer komplisert enn det høres ut, fordi link-laget også må
        håndtere bit-feil, kollisjoner på delte medier, og det å vite hvem den faktisk snakker med.
      </p>

      <Section61Live />

      <p className="text-muted-foreground">
        Steg-walkthroughen over viser hvordan NIC-en bygger en Ethernet-ramme felt for felt på
        avsender-side, sender bitstrømmen over linja, og hvordan mottakerens NIC dekoder rammen,
        sjekker FCS og leverer payload videre opp i stakken. Det er nøyaktig det samme mønsteret du
        ser i Wireshark når du fanger trafikken på ditt eget grensesnitt.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            { term: "Ramme (frame)", icon: <FrameIcon />, body: "Pakke på link-laget — header + payload + trailer." },
            { term: "Node", icon: <NodeIcon />, body: "Maskin som snakker link-lag — host, ruter, switch." },
            { term: "MAC-adresse", icon: <MacIcon />, body: "48-bit fabrikkbrent ID per nettverkskort." },
            { term: "Framing", icon: <FramingIcon />, body: "Avgjøre hvor en ramme starter og slutter på kabelen." },
            { term: "Half- vs full-duplex", icon: <DuplexIcon />, body: "Én vei av gangen, vs begge veier samtidig." },
            { term: "MTU", icon: <MtuIcon />, body: "Maks payload per ramme (Ethernet: 1500 bytes)." },
            {
              term: "Pålitelig link-levering",
              icon: <ReliableLinkIcon />,
              body: "Link-laget garanterer feilfri ramme — Ethernet gjør IKKE det.",
            },
            {
              term: "Flytstyring (PAUSE)",
              icon: <PauseIcon />,
              body: "Mottaker ber sender stoppe — kun per-lenke, ikke ende-til-ende.",
            },
            { term: "OUI", icon: <OuiIcon />, body: "Første 3 bytes av MAC = produsent (Intel, Apple, …)." },
            { term: "I/G- og U/L-bit", icon: <IgUlBitIcon />, body: "Markerer multicast og lokalt-administrert MAC." },
            {
              term: "Point-to-point vs broadcast-medium",
              icon: <PointToPointIcon />,
              body: "To noder vs flere som deler én kanal.",
            },
            { term: "Adapter-modell", icon: <NicIcon />, body: "NIC pakker/leser ramme i hardware før OS ser den." },
            { term: "Promiscuous mode", icon: <PromiscuousIcon />, body: "NIC aksepterer ALLE rammer — brukes av Wireshark." },
          ]}
        />
        <div className="space-y-3">
          <Illustration caption="Lag-stacken med link nederst — IP-laget gir et datagram ned, link pakker det inn.">
            <LagStackSvg />
          </Illustration>
          <Illustration caption="Link-laget tar et IP-datagram og pakker det inn med MAC-header + trailer før det går ut på fysisk medium.">
            <FrameSvg />
          </Illustration>
          <Illustration caption="MAC-adresse: OUI (produsent-prefix) + serienummer. Først bytes I/G og U/L-bit setter type.">
            <MacAdresseSvg />
          </Illustration>
        </div>
      </div>

      <Metafor tittel="Link-laget = å snakke med naboen over hekken">
        <p>
          IP-laget er som å sende et brev fra Tromsø til Tokyo — adressen forteller hvor i verden,
          ruta velges underveis. Link-laget er det helt motsatte: kort distanse, direkte
          kommunikasjon. Du snakker bare med den fysiske naboen din — den ene noden i andre enden av
          kabelen eller radio-kanalen.
        </p>
        <p>
          Derfor byttes MAC-rammen ut på hvert eneste hopp gjennom internett, mens IP-konvolutten
          forblir uendret. Hver ruter er en ny «nabo» som leverer brevet videre.
        </p>
      </Metafor>

      <Metafor tittel="MAC-adresse = fødselsnummeret til nettverkskortet">
        <p>
          MAC-adressen er brent inn i NIC-en på fabrikken og blir aldri endret. Som et norsk
          fødselsnummer: globalt unikt, fast for alltid, og forteller noe om opprinnelsen (OUI =
          første 6 sifre = «produsent-fødselsår»).
        </p>
        <p>
          IP-adressen derimot er som postadressen din — den endres når du flytter. Hver gang
          laptopen din kobler seg til et nytt kafé-WiFi, får den ny IP, men MAC-en er den samme.
        </p>
      </Metafor>

      <Example title="Eksempel: hvor er link-laget implementert?">
        <p>
          Det meste av link-laget er hardware — det sitter i nettverkskortet (NIC) på maskinen, ikke
          i operativsystemet. Når en pakke kommer inn, sjekker NIC-en MAC-adressen i hardware,
          beregner CRC i hardware, og fjerner rammen før den sender datagrammet videre til kjernen.
        </p>
        <p className="mt-2">
          Konsekvensen: hvis NIC-en oppdager bit-feil, kastes rammen STILLE før operativsystemet ser
          den. Du kan ikke logge det fra software. Det er derfor du må se på selve switchen (eller
          bruke <code>ethtool -S</code>) for å oppdage en kabel som har dårlig krymp.
        </p>
      </Example>

      <Example title="Eksempel: les en MAC-adresse — hvilket kort er det?">
        <p>
          Vi ser MAC-en <code>B8:27:EB:4A:12:99</code> på en port i bedriftens switch. Vi ønsker å
          vite hvilken type maskin det er.
        </p>
        <ol className="list-decimal pl-5 mt-1 space-y-1">
          <li>
            OUI = de første 3 bytene = <code>B8:27:EB</code>.
          </li>
          <li>
            Slå opp i IEEEs database (eller bare i Wireshark) → <em>Raspberry Pi Foundation</em>.
          </li>
          <li>
            Sjekk I/G-bit i første byte: 0xB8 = 1011 1000. Bit 0 (laveste) = 0 → unicast. Bit 1 = 0
            → globalt unik (fabrikkbrent, ikke lokal).
          </li>
          <li>
            Konklusjon: porten har en fysisk Raspberry Pi koblet til, ikke en VM. Ofte nok til å
            spore opp «hva pokker er det der?» uten å trekke i en kabel.
          </li>
        </ol>
      </Example>

      <Hvorfor title="Hvorfor har vi BÅDE IP- og MAC-adresser?">
        <p>
          Det føles redundant: IP-en sier «hvor i nettet», MAC-en sier «hvilket kort». Hvorfor ikke
          bare ha én? Svaret er at de løser ulike problemer på ulike tidsskalaer.
        </p>
        <p>
          <strong>MAC er knyttet til hardware.</strong> En NIC har sin MAC fra fabrikken; du kan
          flytte kortet til et nytt rom uten å endre noe. Det gjør plug-and-play mulig — switchen
          lærer adressen automatisk når kortet plugges inn.
        </p>
        <p>
          <strong>IP er knyttet til topologi.</strong> Når kortet plugges inn et nytt sted i nettet,
          får det en ny IP fra det subnettet det havner i. Rutingsystemet ville aldri skalert hvis
          rutere skulle huske hver enkelt MAC i hele internett — det fungerer fordi IP-adressene er
          hierarkiske og kan oppsummeres med prefiks (CIDR).
        </p>
        <p>
          Konsekvensen er at IP-pakken er konstant gjennom hele reisen, mens MAC-rammen rundt byttes
          ut på hvert hopp. Vi får både plug-and-play OG skalerbar ruting.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-day-in-the-life", "dte2507-switch-self-learning"]} />
    </article>
  );
}

// ============================================================
// 6.2 — Feiloppdaging
// ============================================================
function Section62() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="6.2" title="Feiloppdaging — fra paritet til CRC" />

      <p className="text-muted-foreground">
        Ingen fysisk lenke er perfekt. Spenninger flippes, kosmisk stråling treffer minne, en kabel
        ligger nær en sveiseapparat. Link-laget legger ekstra bits i hver ramme slik at mottakeren
        kan oppdage at noe har gått galt — og noen ganger reparere det. Vi går fra det enkleste til
        det som faktisk brukes i Ethernet.
      </p>

      <Section62Live />

      <p className="text-muted-foreground">
        I widgeten over kjører de tre algoritmene parallelt på samme data. Klikk på en bit i en av
        rammene for å flippe den — se hvilke algoritmer som oppdager feilen og hvilke som ikke gjør
        det. Prøv også «burst-feil» med tre samtidige flips: paritet bommer ofte (hvis antallet
        flips er partall), checksum bommer ved symmetriske endringer, men CRC fanger nesten alt.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            { term: "Paritets-bit", icon: <ParityIcon />, body: "Én bit som gjør antall 1-ere partall/oddetall." },
            { term: "2D-paritet", icon: <Parity2DIcon />, body: "Paritet både per rad og kolonne — kan rette 1 feil." },
            {
              term: "Internet checksum",
              icon: <ChecksumIcon />,
              body: "Sum av 16-bit ord — billig software-sjekk i TCP/IP.",
            },
            { term: "CRC", icon: <CrcIcon />, body: "Rest ved polynom-divisjon — fanger nesten alle feil." },
            { term: "Generator-polynom G", icon: <GeneratorPolyIcon />, body: "Felles polynom sender og mottaker deler på." },
            { term: "Burst-feil", icon: <BurstErrorIcon />, body: "Flere feil i rekke — CRC fanger alle ≤ r bits." },
            { term: "Even vs odd parity", icon: <ParityIcon />, body: "Partall vs oddetall ettere — samme styrke." },
            { term: "GF(2)-aritmetikk", icon: <Gf2Icon />, body: "Addisjon og subtraksjon er XOR — ingen mente." },
            { term: "CRC-32 (Ethernet)", icon: <CrcIcon />, body: "33-bit standard-G — fanger 99,999999 %." },
            { term: "FEC vs BEC", icon: <FecBecIcon />, body: "Rett feilen selv vs spør om retransmisjon." },
            { term: "Hamming-avstand", icon: <HammingIcon />, body: "Antall bits som skiller to ord — bestemmer kraft." },
            { term: "Hamming(7,4)", icon: <HammingIcon />, body: "4 data + 3 paritet = kan rette én bit-feil." },
            { term: "Adler-32", icon: <ChecksumIcon />, body: "Lett checksum brukt i zlib — svakere enn CRC." },
          ]}
        />
        <div className="space-y-3">
          <Illustration caption="CRC: del databitene + tilhørende r nuller på G; resten er CRC-verdien som henges på.">
            <CrcSvg />
          </Illustration>
          <Illustration caption="Paritet-grid: feilen ligger der rad-paritet og kolonne-paritet begge slår ut.">
            <ParitetGridMiniSvg />
          </Illustration>
          <Illustration caption="2D-paritet: krysset mellom feil rad og feil kolonne avslører hvilken bit som flippet.">
            <Paritet2DSvg />
          </Illustration>
        </div>
      </div>

      <Metafor tittel="Paritet = telle mynter i bunken">
        <p>
          Du legger en stabel med mynter. Du teller dem og noterer at det skal være et partall.
          Senere kommer kompisen og teller — han får oddetall. Da vet han at minst én mynt mangler
          (eller er lagt til). Men hvis to mynter forsvant, ser tellingen riktig ut igjen — paritet
          er blind for partalls-feil.
        </p>
        <p>
          Det er nettopp dette CRC løser: i stedet for å bare telle, gjør den en polynom-divisjon
          som «vet» nøyaktig hvor i bitstrengen feilen ligger — nok til å avsløre nesten alle mulige
          feilmønstre.
        </p>
      </Metafor>

      <Metafor tittel="CRC = kontrollsifferet i et norsk fødselsnummer">
        <p>
          Personnummeret ditt er 11 sifre. De to siste er ikke tilfeldige — de er{" "}
          <em>matematisk beregnet</em> fra de første 9 etter en bestemt formel (modulo 11). Hvis du
          taster feil ved utfylling, vil kontroll-sifrene ikke stemme, og systemet oppdager feilen
          umiddelbart.
        </p>
        <p>
          CRC-32 i en Ethernet-ramme er det samme prinsippet, bare med 32 «kontrollsifre» og mange
          milliarder ganger sterkere — derfor garanterer den å fange ALLE burst-feil opp til 32 bit
          lange.
        </p>
      </Metafor>

      <Metafor tittel="2D-paritet = bingo-brett med kontroll">
        <p>
          Tegn et 5×5-rutenett med 1-ere og 0-ere. Tell hver rad og hver kolonne, skriv ned
          paritetene som ekstra felter i kanten. Hvis EN bit flipper, klager rad-paritet
          <em> og</em> kolonne-paritet samtidig — krysset mellom dem peker rett på den dårlige ruta.
        </p>
        <p>
          Dette er forward error correction i sin enkleste form: du kan reparere feilen UTEN å
          spørre senderen om retransmisjon. Brukt i ECC-RAM på alle moderne servere.
        </p>
      </Metafor>

      <Example title="Eksempel: CRC-3 på bit-strengen 1011">
        <p>
          La data D = 1011 (4 bits) og generator G = 1101 (4 bits, grad 3). Vi henger på r=3 nuller
          på D for å få D·2³ = 1011000.
        </p>
        <p className="mt-2">Long-division i GF(2) (XOR i stedet for subtraksjon):</p>
        <pre className="text-[11px] font-mono bg-muted/30 p-2 rounded mt-1 overflow-x-auto">
          {`     1011000  ÷  1101
     1101
     ----
      1100
      1101
      ----
        1000
        1101
        ----
         101   ← rest, dette er CRC`}
        </pre>
        <p className="mt-2">
          Vi sender 1011 <strong>101</strong> (data + CRC). Mottakeren divider hele strengen på 1101
          og forventer rest = 0. Hvis ikke, har en bit flippet.
        </p>
      </Example>

      <Example title="Eksempel: 2D-paritet finner og retter én bit-feil">
        <p>
          Vi har 12 databits arrangert i et 3×4-rektangel. Even paritet legges på hver rad og hver
          kolonne:
        </p>
        <pre className="text-[11px] font-mono bg-muted/30 p-2 rounded mt-1 overflow-x-auto">
          {`             c1 c2 c3 c4 | p_rad
        r1:   1  0  1  0  |  0
        r2:   0  1  1  0  |  0
        r3:   1  1  0  1  |  1
        -----------------+------
        p_kol:0  0  0  1  |  1  ← hjørne`}
        </pre>
        <p className="mt-2">
          Anta at bit (r2, c3) flipper underveis fra 1 til 0. Mottakeren beregner paritet og finner:
          rad 2 har nå paritet 1 (ikke 0 som vi sendte), og kolonne 3 har nå paritet 1 (ikke 0). En
          rad og en kolonne klager — krysset deres er den feile biten. Mottakeren flipper den
          tilbake. <strong>Ingen retransmisjon trengtes.</strong>
        </p>
        <p className="mt-2">
          Hvis to bits flipper, klager 2 rader og 2 kolonner — mottakeren ser at noe er galt, men
          kan ikke bestemme hvilken av de 4 krysspunktene som er ekte. 2D-paritet oppdager altså
          alle 2-bit-feil, men retter bare 1-bit-feil.
        </p>
      </Example>

      <Example title="Eksempel: paritet vs CRC på samme bit-feil-mønster">
        <p>
          Vi sender 8 bits: <code>1100 1010</code>. Vi sammenligner hva henholdsvis even paritet og
          CRC-3 (med G=1011) oppdager.
        </p>
        <p className="mt-2">
          <strong>Even paritet:</strong>
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>
            Antall 1-ere = 4 (partall) → paritets-bit = 0. Sender <code>1100 1010 0</code>.
          </li>
          <li>
            Feilmønster A: bit 3 flipper → <code>1110 1010 0</code>. Mottaker teller 5 ettall +
            paritets-bit 0 = 5 ettall totalt → oddetall → FEIL OPPDAGET.
          </li>
          <li>
            Feilmønster B: bit 3 OG bit 5 flipper → <code>1110 0010 0</code>. Mottaker teller 4
            ettall + 0 = 4 → partall → FEIL IKKE OPPDAGET.
          </li>
        </ul>
        <p className="mt-2">
          <strong>CRC-3 med G=1011:</strong>
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>
            D = 11001010, D·2³ = 11001010000. Long-division: rest = 011. Sender{" "}
            <code>11001010 011</code>.
          </li>
          <li>
            Feilmønster B (bit 3 + bit 5 flippet): mottaker mottar <code>11100010 011</code>. Når
            mottaker deler hele strengen på 1011, blir resten ≠ 0 → FEIL OPPDAGET.
          </li>
        </ul>
        <p className="mt-2">
          CRC fanger 2-bit-feilen som paritet glipper. Det er nettopp dette CRC ble designet for.
        </p>
      </Example>

      <Hvorfor title="Hvorfor er CRC bedre enn paritet, og hvorfor velges den i Ethernet?">
        <p>
          Paritet er enkel og billig (én XOR), men har en åpenbar svakhet: alle feil med partall
          antall flippede bits er usynlige. På en støyende koppertråd, der støy ofte rammer i burst
          (flere mikrosekunder med spennings-spikes som flipper en rekke bits ved siden av
          hverandre), er det nettopp 2-, 4- og 6-bits feil som forekommer.
        </p>
        <p>
          <strong>CRC matematisk matchet til burst-feil.</strong> En CRC med r bits oppdager
          garantert ALLE burst-feil av lengde ≤ r og 1 − 2^(−r) av alle andre. CRC-32 fanger derfor
          alle burst opp til 32 bit og 99.99999998 % av alt annet — i praksis perfekt deteksjon.
        </p>
        <p>
          <strong>Implementasjon i hardware er enkel.</strong> En CRC kan beregnes med ett shift-
          register og noen XOR-gates som tar én bit per klokke. Det betyr at en 100 Gbps NIC kan
          regne CRC i sann tid uten å være flaskehalsen — paritet ville vært like rask, men ville
          glipp så mange feil at TCP-retransmisjon ble dominerende.
        </p>
        <p>
          <strong>Bonus: deterministiske egenskaper.</strong> Vi vet matematisk nøyaktig hvilke
          feilmønstre CRC-32 oppdager (alle 1-, 2- og 3-bit feil, alle bursts ≤ 32). Det gjør CRC
          analyserbar — i motsetning til hash-funksjoner der vi bare har sannsynlighets-utsagn.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-crc-kalkulator"]} />
    </article>
  );
}

// ============================================================
// 6.3 — Multiple access
// ============================================================
function Section63() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="6.3" title="Multiple access — hvem får snakke nå?" />

      <p className="text-muted-foreground">
        Hvis flere noder deler ett medium (én radio-kanal, en gammel koaks-buss), oppstår
        spørsmålet: hva skjer hvis to noder sender samtidig? Signalene blander seg og begge rammer
        ødelegges — en kollisjon. Multiple-access protokoller er reglene som styrer hvem som får
        sende når.
      </p>

      <Section63Live />

      <p className="text-muted-foreground">
        Simulasjonen viser klassisk Ethernet-bus CSMA/CD: alle tre hostene lytter («carrier sense»),
        ser stille kanal omtrent samtidig, og begynner å sende. Signalene propagerer utover og når
        de overlapper — kollisjon. Hver host detekterer det, sender et kort JAM, og velger en
        eksponentiell-backoff-verdi. Etter to-tre kollisjoner finner hostene en rytme der bare én
        sender om gangen.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            {
              term: "Channel partitioning",
              icon: <ChannelPartitionIcon />,
              body: "Del kanalen — TDM, FDM, CDM. Garantert konfliktfritt.",
            },
            { term: "Pure ALOHA", icon: <AlohaIcon />, body: "Send når du vil. Maks 18 % throughput." },
            { term: "Slot ALOHA", icon: <SlotAlohaIcon />, body: "Send kun ved slot-start. Maks 37 %." },
            { term: "CSMA", icon: <CsmaIcon />, body: "Lytt før du sender." },
            { term: "CSMA/CD", icon: <CsmaCdIcon />, body: "Hør din egen sending — kollisjon? Avbryt og prøv igjen." },
            { term: "Exponential backoff", icon: <BackoffIcon />, body: "Vent {0..2ⁿ−1} slots etter n-te kollisjon." },
            {
              term: "Polling",
              icon: <PollingIcon />,
              body: "Master spør slaver i tur — ingen kollisjon, dårlig redundans.",
            },
            { term: "Token-ring", icon: <TokenRingIcon />, body: "Token sirkulerer — den som har det får sende." },
            {
              term: "Propagation-time t_prop",
              icon: <PropagationIcon />,
              body: "Signal-tid ende-til-ende — bestemmer min-ramme.",
            },
            { term: "Jam-signal", icon: <JamIcon />, body: "48 bit støy etter kollisjon — varsler alle." },
            {
              term: "Binary Exponential Backoff",
              icon: <BackoffIcon />,
              body: "Vent K·512 bit-tider, gi opp etter 16 forsøk.",
            },
            { term: "Hidden terminal", icon: <HiddenTerminalIcon />, body: "A og C hører B men ikke hverandre — radio-fall." },
            { term: "CSMA/CA (WiFi)", icon: <CsmaCaIcon />, body: "Unngå heller enn oppdage — backoff FØR sending." },
            { term: "Capture effect", icon: <CaptureEffectIcon />, body: "Sterkere signal vinner kollisjon på radio." },
            { term: "Offered load G", icon: <OfferedLoadIcon />, body: "Forsøk per ramme-tid — topp ved G=1 (slot ALOHA)." },
          ]}
        />
        <div className="space-y-3">
          <Illustration caption="Tre protokoller side-ved-side: pure ALOHA, slot ALOHA og CSMA/CD med ulik throughput-tak.">
            <TreProtokollerSvg />
          </Illustration>
          <Illustration caption="Pure ALOHA-kollisjon: ramme A overlapper med starten av B. Begge må retransmitteres.">
            <AlohaSvg />
          </Illustration>
          <Illustration caption="Throughput S(G) for pure (rød) vs slot ALOHA (blå). Slot ligger dobbelt så høyt — toppen ved G=1.">
            <ThroughputSvg />
          </Illustration>
        </div>
      </div>

      <Metafor tittel="ALOHA = folk som hopper inn i en samtale i en bråkete bar">
        <p>
          Tenk deg en bar i Tromsø sentrum på en lørdagskveld. Alle prater, ingen koordinerer. Når
          du vil si noe, bare sier du det — men hvis sidemannen begynner samtidig, blir begge
          stemmer drukna. Du venter litt og prøver igjen.
        </p>
        <p>
          Slot ALOHA er litt mer høflig: alle venter til neste tone fra DJ-en før de begynner. Da
          kollisjons-vinduet halveres — to dobler maksimal «utveksling» fra 18 % til 37 %. Bare det
          å være enig om <em>når</em> man får lov å snakke, mer enn dobler kapasiteten.
        </p>
      </Metafor>

      <Metafor tittel="CSMA/CD = telefon-konferanse på 90-tallet">
        <p>
          «Hør først — så snakk». Du lytter etter om noen andre allerede snakker, før du selv
          begynner. Men hvis to personer begynner samtidig (begge hørte stillhet), kolliderer
          stemmene: «...halloHei?? Du må gjenta!» Begge stopper umiddelbart og venter en tilfeldig
          tid før de prøver igjen.
        </p>
        <p>
          Det er nettopp dette gamle Ethernet over koaks gjorde. I dag (med switcher) er
          kollisjons-deteksjon overflødig — som om hvert par på konferansen fikk sin egen dedikerte
          telefon-linje.
        </p>
      </Metafor>

      <Metafor tittel="Exponential backoff = restaurant-køen som blir tålmodig">
        <p>
          Du ringer en populær restaurant i Tromsø klokken 18:00 — opptatt. Du venter 1 minutt og
          ringer igjen — opptatt. Du tenker «jeg venter 2 minutter». Fortsatt opptatt — «4
          minutter». Hver gang dobler du ventetiden. Til slutt er du den eneste som ringer akkurat
          da, og du får bordet.
        </p>
        <p>
          Det samme gjør et Ethernet-kort: hver kollisjon dobler det tilfeldige ventetid-vinduet.
          Selvjusterende: ved lav belastning prøver alle nesten umiddelbart, ved høy belastning
          sprer de seg automatisk ut i tid.
        </p>
      </Metafor>

      <Example title="Eksempel: hvorfor er slot ALOHA 2× bedre enn pure ALOHA?">
        <p>
          I pure ALOHA: en ramme på t sekunder kolliderer med alle rammer som starter i intervallet
          [-t, +t] — totalt et vindu på <strong>2t</strong>. Sannsynligheten for ingen kollisjon ved
          Poisson-trafikk med rate λ er e^(-2λt).
        </p>
        <p className="mt-2">
          I slot ALOHA: rammer kan bare starte ved start av en slot, så vinduet er bare den slottet
          du selv brukte — <strong>t</strong>. Sannsynligheten er e^(-λt).
        </p>
        <p className="mt-2">
          Maks throughput er G·e^(-G) for pure, og G·e^(-G/1) for slot der G er offered load. Toppen
          ligger på 1/(2e) ≈ 0.184 (pure) vs 1/e ≈ 0.368 (slot). Dobbelt så bra — bare ved å
          synkronisere klokkene.
        </p>
      </Example>

      <Example title="Eksempel: CSMA/CD-trace med flere kollisjoner">
        <p>
          To noder A og B vil sende samtidig på 10 Mbps Ethernet (slot-tid = 51,2 μs). Vi følger
          forsøkene deres steg for steg.
        </p>
        <ol className="list-decimal pl-5 mt-1 space-y-1">
          <li>
            <strong>Forsøk 1:</strong> begge ser ledig kanal, begge starter samtidig. KOLLISJON.
            Hver sender 48-bit jam-signal og går til backoff. n=1 → velg K fra {`{0,1}`}. A trekker
            1, B trekker 0.
          </li>
          <li>
            <strong>Backoff:</strong> B venter 0·51,2 μs og sender umiddelbart; A venter 1·51,2 μs.
            B kommer på lufta først.
          </li>
          <li>
            <strong>Forsøk 2 (A):</strong> A lytter, hører B, venter til kanalen er ledig (carrier
            sense). Når B er ferdig, venter A inter-frame gap (9,6 μs) og sender.
          </li>
          <li>
            <strong>Tredje node C dukker opp og kolliderer med A.</strong> n=2 for A → velg K fra
            {`{0,1,2,3}`}. A trekker 3. C trekker også 3. Ny kollisjon på forsøk 3 → n=3, velg K fra
            {`{0..7}`}. Statistisk synkende kollisjons-sannsynlighet idet vinduet vokser.
          </li>
        </ol>
        <p className="mt-2">
          Etter 16 mislykkede forsøk gir noden opp og rapporterer feil oppover. I praksis skjer
          dette aldri på et fungerende nett — det er en sikkerhetsventil mot dødløkker.
        </p>
      </Example>

      <Example title="Eksempel: ALOHA vs slot ALOHA — konkrete tall">
        <p>
          Anta 100 sensorer ute i felt som hver sender en kort melding med rate 0,005 ramme per
          sekund. Vi setter ramme-tid t = 200 ms. Total offered load: G = 100 · 0,005 · 0,2 = 0,1
          forsøk per ramme-tid.
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>Pure ALOHA: S = G·e^(-2G) = 0,1·e^(-0,2) ≈ 0,082 (82 % suksess)</li>
          <li>Slot ALOHA: S = G·e^(-G) = 0,1·e^(-0,1) ≈ 0,091 (91 % suksess)</li>
        </ul>
        <p className="mt-2">
          Forskjellen er liten ved lav last, men vokser raskt. Ved G = 1: pure ALOHA gir 13,5 %,
          slot ALOHA gir 36,8 %. Det er hvor lasten er høy (sjeldne men store hendelser, alle
          sensorer våkner samtidig) at synkronisering virkelig betaler seg. For en
          LoRaWAN-installasjon der batterier teller, må man velge: betaler synkronisering seg i
          strømforbruk?
        </p>
      </Example>

      <Hvorfor title="Hvorfor finnes CSMA/CD nesten ikke i moderne nett?">
        <p>
          På 80- og 90-tallet var Ethernet et delt medium: alle maskiner hang på den samme koaks-
          kabelen, og kollisjons-deteksjon var kjernen i hvordan det fungerte. I dag er det helt
          borte. Hvorfor?
        </p>
        <p>
          <strong>Switcher erstattet hubs.</strong> En switch isolerer hver port til sitt eget
          kollisjons-domene. Hvis kun én maskin er koblet til en port, kan det ikke skje en
          kollisjon fysisk — det er bare avsender og mottaker på lenken. CSMA/CD blir overflødig.
        </p>
        <p>
          <strong>Full-duplex.</strong> Moderne Ethernet over twisted pair eller fiber bruker
          separate ledere for hver retning. Begge sider kan sende og motta samtidig. Carrier sense
          gir ingen mening når du alltid kan sende.
        </p>
        <p>
          <strong>Standardene har strippet det ut.</strong> 10G-Ethernet og raskere finnes IKKE i
          half-duplex-versjoner — kollisjons-protokollen er fjernet fra spesifikasjonen. Lenken må
          være punkt-til-punkt og full-duplex.
        </p>
        <p>
          CSMA/CD lever fortsatt der mediumet faktisk er delt — gamle radioer, satellitt-uplinks. Og
          ideen om backoff overlever i CSMA/CA i WiFi. Men på en moderne Ethernet-port: dødt.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-aloha-kasino"]} />
    </article>
  );
}

// ============================================================
// 6.4 — Switched LAN (kombinerer ARP/self-learning + Ethernet + VLAN)
// ============================================================
function Section64() {
  return (
    <article className="space-y-6 text-sm">
      <Section64ArpSelfLearning />
      <Section64Ethernet />
      <Section64Vlan />
    </article>
  );
}

function Section64ArpSelfLearning() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="6.4" title="Switched LAN — Ethernet, switches, MAC-læring og VLAN" />

      <p className="text-muted-foreground">
        Et moderne lokalnett er ikke et delt medium lenger. Hver host kobles til én port på en
        switch, og switchen sender hver ramme bare til riktig port. Vi går gjennom tre sammenkoblede
        tema: (1) ARP og hvordan switchen lærer hvor en MAC sitter, (2) selve Ethernet-rammen og
        switch-hierarkiet, og (3) hvordan VLAN gjør én fysisk switch til mange logiske nett.
      </p>

      <Section64Live />

      <p className="text-muted-foreground">
        Send først A→B uten å lære B først. Switchen kjenner ikke B's MAC — den FLOODer rammen til
        alle andre porter. Send så B→A: nå lærer switchen B også, og fremtidige A↔B-rammer går
        unicast. Slå på VLAN-modus og send A→C: switchen vet A og C er på ulike VLAN, og rammen blir
        droppet ved VLAN-grensen.
      </p>

      <h3 className="text-base font-semibold mt-2">ARP og switch self-learning</h3>

      <p className="text-muted-foreground">
        Et moderne lokalnett er ikke et delt medium lenger. Hver host kobles til én port på en
        switch, og switchen sender hver ramme bare til riktig port. To ting må fungere: (1) hvordan
        finne MAC-adressen til en host gitt dens IP, og (2) hvordan vet switchen hvilken port en
        gitt MAC-adresse sitter på?
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            { term: "ARP", icon: <ArpIcon />, body: "«Hvem har IP X?» — broadcast som mapper IP til MAC." },
            { term: "ARP-cache", icon: <ArpCacheIcon />, body: "Tabell IP→MAC, lever ~20 min lokalt." },
            { term: "MAC-broadcast", icon: <BroadcastMacIcon />, body: "FF:FF:FF:FF:FF:FF — alle på samme link mottar." },
            { term: "IP-broadcast", icon: <IpBroadcastIcon />, body: "Til alle på subnett — pakkes i MAC-broadcast." },
            {
              term: "Switch forwarding-tabell",
              icon: <SwitchTableIcon />,
              body: "MAC→port — kjernen i hvordan switchen ruter.",
            },
            {
              term: "Self-learning",
              icon: <SelfLearningIcon />,
              body: "Switch lærer (kilde-MAC, port) når en ramme kommer inn.",
            },
            { term: "Plug-and-play", icon: <PlugPlayIcon />, body: "Switch fungerer uten konfigurasjon." },
            { term: "Gratuitous ARP", icon: <GratuitousArpIcon />, body: "Annonser «jeg er X på MAC Y» — sjekker IP-konflikt." },
            { term: "ARP-spoofing", icon: <ArpSpoofIcon />, body: "Angriper svarer falskt — alt går via ham." },
            {
              term: "Flooding",
              icon: <FloodingIcon />,
              body: "Ukjent destinasjon → send ut alle porter unntatt inn-porten.",
            },
            { term: "MAC-table aging", icon: <TableAgingIcon />, body: "Entry slettes etter ~5 min stillhet." },
            { term: "Spanning Tree Protocol", icon: <SpanningTreeIcon />, body: "Slår av redundante linker — fjerner loops." },
            { term: "BPDU", icon: <BpduIcon />, body: "Kontroll-ramme STP-switcher snakker sammen med." },
            { term: "VRRP / HSRP", icon: <VrrpIcon />, body: "To rutere deler virtuell IP+MAC for failover." },
          ]}
        />
        <div className="space-y-3">
          <Illustration caption="Switch self-learning: ramme fra MAC X på port 1 lærer switchen at X sitter på port 1.">
            <SwitchLearningSvg />
          </Illustration>
          <Illustration caption="ARP-oppslag-flyt: broadcast-request på lag 2, unicast-reply tilbake. Resultatet caches.">
            <ArpFlytSvg />
          </Illustration>
          <Illustration caption="ARP-håndtrykk: PC broadcaster «hvem har 10.0.0.10?» — skriveren svarer med sin MAC unicast.">
            <ArpSvg />
          </Illustration>
        </div>
      </div>

      <Metafor tittel="ARP = «du har nummeret, jeg trenger adressen»">
        <p>
          Du har fått telefonnummeret til en kollega i Tromsø, men du vil møte henne i Storgata og
          trenger å vite hvilken bygning hun jobber i. Du ringer resepsjonen («lobbyen») og spør:
          «Hei, hvem har nummeret 12 34 56 78?» Hun som har det nummeret svarer: «Det er meg — jeg
          sitter i 3. etasje, kontor 304.» Nå har du adressen.
        </p>
        <p>
          ARP gjør nøyaktig dette: IP-adressen er telefonnummeret (logisk identifikator),
          MAC-adressen er den fysiske adressen i bygget. Du må vite den fysiske MAC-en for å faktisk
          levere rammen på kabelen.
        </p>
      </Metafor>

      <Metafor tittel="Switch = bartenderen som husker alt">
        <p>
          God bartender i Tromsø: du bestiller en pils, og senere når du kommer tilbake, husker han
          ikke bare hva du drakk, men hvor i lokalet du sitter. Han trenger ikke spørre rundt — han
          bare sender pilsen rett til ditt bord.
        </p>
        <p>
          Switchen lærer på samme måte. Første gang du sender en ramme, registrerer switchen «host A
          sitter på port 1». Neste gang noen vil snakke med A, går rammen RETT til port 1 — ingen
          flooding, ingen forstyrrelse av andre porter. Self-learning er plug-and-play-magien.
        </p>
      </Metafor>

      <Metafor tittel="Spanning Tree = enveiskjøring i rundkjøringen">
        <p>
          Forestill deg en rundkjøring der bilene kan kjøre begge veier. Hver bil som kommer inn
          blir sendt rundt og rundt, multipliserer seg, og fyller hele rundkjøringen på sekunder —
          en kaos-storm. Løsningen: skilt som kun tillater ETT kjørefelt rundt. Du mister litt
          fleksibilitet, men trafikken flyter.
        </p>
        <p>
          STP gjør dette automatisk: alle switcher sammen velger en «root», beregner korteste sti,
          og slår av lenkene som ville lage loops. Resultat: et tre uten sløyfer, selv om fysisk
          kabling har redundans.
        </p>
      </Metafor>

      <Example title="Eksempel: ARP-spørring fra mobilen din">
        <p>
          Mobilen din (IP 10.0.0.5, MAC AA:01) skal sende til skriveren (IP 10.0.0.10). Mobilens
          ARP-cache er tom for 10.0.0.10. Da skjer dette:
        </p>
        <ol className="list-decimal pl-5 mt-1 space-y-1">
          <li>
            Mobilen lager en ARP-request: «hvem har 10.0.0.10? si til AA:01». Den sendes som en
            MAC-broadcast (FF:FF:FF:FF:FF:FF).
          </li>
          <li>
            Alle på samme link-domene mottar den. Bare skriveren ser at det er hennes IP og lager et
            ARP-reply: «10.0.0.10 er på BB:02». Sendt unicast tilbake til AA:01.
          </li>
          <li>
            Mobilen får svaret, lagrer (10.0.0.10 → BB:02) i ARP-cachen i 20 minutter, og kan nå
            sende selve datapakken.
          </li>
        </ol>
      </Example>

      <Example title="Eksempel: trace switch-tabell etter 5 rammer">
        <p>
          Switch S har 4 porter og en tom forwarding-tabell. Følgende rammer ankommer i rekkefølge:
        </p>
        <ol className="list-decimal pl-5 mt-1 space-y-1">
          <li>Ramme fra X til Y på port 1.</li>
          <li>Ramme fra Y til X på port 2.</li>
          <li>Ramme fra Z til X på port 3.</li>
          <li>Ramme fra X til Z på port 1.</li>
          <li>Broadcast fra W på port 4.</li>
        </ol>
        <p className="mt-2">
          <strong>Tabell etter hver ramme:</strong>
        </p>
        <pre className="text-[11px] font-mono bg-muted/30 p-2 rounded mt-1 overflow-x-auto">
          {`Etter 1: {X→1}                        flood (Y ukjent)
Etter 2: {X→1, Y→2}                    unicast ut port 1 (X kjent)
Etter 3: {X→1, Y→2, Z→3}                unicast ut port 1 (X kjent)
Etter 4: {X→1, Y→2, Z→3}                unicast ut port 3 (Z kjent)
Etter 5: {X→1, Y→2, Z→3, W→4}           flood (broadcast)`}
        </pre>
        <p className="mt-2">
          Bare ramme 1 og ramme 5 forårsaker flooding. Etter den første tur-retur-runden mellom et
          par maskiner er switchen i full unicast-mode for det paret.
        </p>
      </Example>

      <Example title="Eksempel: broadcast-storm uten Spanning Tree">
        <p>
          Vi har tre switcher S1, S2, S3 koblet i en trekant (loop). Host H på S1 sender en
          broadcast-ramme:
        </p>
        <ol className="list-decimal pl-5 mt-1 space-y-1">
          <li>S1 flooder ut til S2 og S3.</li>
          <li>S2 flooder mottatte broadcast ut til S3 (og hostene sine). S3 mottar.</li>
          <li>S3 flooder også broadcast videre til S2. S2 mottar (igjen!).</li>
          <li>S2 og S3 fortsetter å skubbe rammen rundt i ringen — uendelig.</li>
        </ol>
        <p className="mt-2">
          I løpet av millisekunder fyller en eneste broadcast-ramme hele LAN-et med duplikater.
          Switchenes CPU-er går i 100 %, ingenting kommer fram. Dette er en broadcast-storm —
          klassisk failure-mode før STP. STP løser det ved å slå AV én port i ringen slik at
          topologien blir et tre.
        </p>
      </Example>

      <Hvorfor title="Hvorfor erstattet switcher hubs?">
        <p>
          Hub-en var enkel: en passiv enhet som sendte hver bit den så på inn-porten ut alle andre
          porter. Alle portene var ett kollisjons-domene — hvis to maskiner sendte samtidig, fikk
          alle se kollisjonen og CSMA/CD-protokollen tråtte i kraft. Hvorfor forsvant den?
        </p>
        <p>
          <strong>Skalering.</strong> På en hub med 24 porter måtte alle 24 maskiner dele samme 10
          Mbps. Med 6-7 aktive maskiner ble kollisjons-andelen så høy at hver enkelt fikk under 1
          Mbps reelt. En switch isolerer hver port — hver maskin får full hastighet uavhengig av
          naboen.
        </p>
        <p>
          <strong>Sikkerhet.</strong> På en hub kan en hvilken som helst maskin se ALL trafikk (sett
          NIC i promiscuous mode → tcpdump). På en switch ser hver maskin bare det som er adressert
          til den (pluss broadcast). Det er ikke en kryptografisk garanti, men det hever terskelen
          betraktelig.
        </p>
        <p>
          <strong>Full-duplex.</strong> En hub er fundamentalt half-duplex (alle deler ett medium).
          En switch lar hver port være full-duplex — 100 Mbps inn OG 100 Mbps ut samtidig. 2x
          throughput uten endring i kabel.
        </p>
        <p>
          <strong>Pris.</strong> På 2000-tallet ble switch-silisium nesten gratis. Et grunnleggende
          unmanaged 8-port-switch koster mindre enn en hub gjorde i 1995. Ingen grunn til ikke å
          oppgradere.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-arp-detektiv", "dte2507-switch-self-learning"]} />
    </article>
  );
}

// ============================================================
// 6.4 (forts.) — Ethernet
// ============================================================
function Section64Ethernet() {
  return (
    <article className="space-y-4 text-sm border-t border-border pt-6">
      <h3 className="text-base font-semibold">Ethernet og switch-hierarki</h3>

      <p className="text-muted-foreground">
        Ethernet ble oppfunnet på Xerox PARC i 1973, standardisert i 1980, og har overlevd alle sine
        konkurrenter (Token Ring, FDDI, ATM-til-skrivebordet). Selve ramme-formatet er nesten
        uendret siden 1980; det er bare den fysiske layeren under som har gått fra 10 Mbps over
        koaks til 400 Gbps over fiber.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            { term: "Preamble", icon: <PreambleIcon />, body: "8 bytes synkronisering — kalibrerer mottaker-klokken." },
            { term: "Dst/src-MAC", icon: <DstSrcMacIcon />, body: "6 bytes hver — unicast, multicast eller broadcast." },
            { term: "EtherType", icon: <EtherTypeIcon />, body: "2 bytes — sier hvilken protokoll er inni (IPv4, ARP, …)." },
            { term: "Payload", icon: <PayloadIcon />, body: "46–1500 bytes — typisk et IP-datagram." },
            { term: "CRC (FCS)", icon: <FcsIcon />, body: "4 bytes CRC-32 — sjekkes i hardware på NIC." },
            { term: "Hub", icon: <HubIcon />, body: "Passiv flerporter — ett kollisjons-domene. Død i dag." },
            { term: "Switch", icon: <SwitchBoxIcon />, body: "Aktiv enhet, hver port = eget kollisjons-domene." },
            { term: "Switch-hierarki", icon: <SwitchHierarchyIcon />, body: "Aksess → distribusjons → core i klassisk LAN." },
            { term: "SFD", icon: <SfdIcon />, body: "Siste byte av preamble — markerer rammens start." },
            { term: "Inter-Frame Gap", icon: <InterFrameGapIcon />, body: "96 bit-tider stillhet mellom rammer." },
            { term: "Jumbo frames", icon: <JumboFrameIcon />, body: "9000-byte payload — brukes i datasenter." },
            { term: "Auto-negotiation", icon: <AutoNegotiationIcon />, body: "Begge sider forhandler hastighet og duplex." },
            { term: "PoE", icon: <PoeIcon />, body: "Strøm via Ethernet — 15–90 W per port." },
            { term: "CAM", icon: <CamIcon />, body: "Hardware-minne med parallell-oppslag på MAC." },
            { term: "Manchester-koding", icon: <ManchesterIcon />, body: "Overgang midt-i bit — holder klokken synk." },
          ]}
        />
        <div className="space-y-3">
          <Illustration caption="Byte-eksakt Ethernet-ramme: alle felter med bredde, EtherType-koder, og hva FCS dekker.">
            <EthernetByteLayoutSvg />
          </Illustration>
          <Illustration caption="Ethernet-ramme: preamble · dst · src · type · payload · CRC. Alle felt har faste posisjoner.">
            <EthernetFrameSvg />
          </Illustration>
          <Illustration caption="Switch-hierarki: aksess (ToR) under, distribusjons i midten, core på toppen — 3-tier klassisk.">
            <SwitchHierarkiSvg />
          </Illustration>
        </div>
      </div>

      <Metafor tittel="Ethernet-ramme = ferdig-frankert pakke fra Posten">
        <p>
          En Posten-pakke har alltid samme oppbygging: avsender-adresse øverst venstre,
          mottaker-adresse midt på, strekkode for sortering, vekt-felt, og innholdet inni.
          Sortér-maskinene på Lørenskog kan lese ALLE pakker i hardware fordi feltene er på eksakt
          samme posisjon hver gang.
        </p>
        <p>
          Ethernet-rammen er bygd opp likt: dst-MAC først, kilde-MAC, type, payload, CRC til slutt.
          NIC-en på 100 Gbps-serveren rekker å parse rammen og rute den videre på en mikrosekund —
          utelukkende fordi formatet er fast.
        </p>
      </Metafor>

      <Metafor tittel="Preamble = «test, test, mikrofon-sjekk»">
        <p>
          Før en konsert i Tromsø starter, sier teknikeren «test test, en to tre» i mikrofonen. Det
          er ikke selve sangen — det er for å la lydanlegget kalibrere nivå og synk før showet
          starter. Etterpå kommer den ekte musikken.
        </p>
        <p>
          Ethernet-preamble (8 bytes med 10101010-mønster) er nøyaktig dette: mottakerens klokke får
          tid til å låse seg på riktig frekvens før den faktiske rammen starter. Uten preamble ville
          første byte vært tapt.
        </p>
      </Metafor>

      <Metafor tittel="Hub vs switch = høyttaler vs hodetelefon">
        <p>
          En hub er en høyttaler på torvet: én snakker — alle hører. Hvis to vil si noe samtidig,
          blir det rot for alle (kollisjon). Du må følge tur-takings-regler.
        </p>
        <p>
          En switch er som å gi alle hver sin hodetelefon koblet til en sentral mixer. Mixeren ruter
          lyden bare til riktig hodetelefon. To kan snakke samtidig uten å forstyrre hverandre — det
          finnes ingen «kollisjon» fordi alle har sin egen lyd-kanal.
        </p>
      </Metafor>

      <Example title="Eksempel: hva inneholder et 1500-byte Ethernet-ramme egentlig?">
        <ul className="list-disc pl-5">
          <li>8 bytes preamble (synkronisering)</li>
          <li>6 bytes destinasjons-MAC</li>
          <li>6 bytes kilde-MAC</li>
          <li>2 bytes EtherType (typisk 0x0800)</li>
          <li>1500 bytes payload (et IP-datagram)</li>
          <li>4 bytes CRC-32</li>
        </ul>
        <p className="mt-2">
          Totalt 1526 bytes på kabelen for å levere 1500 bytes nyttig last. Overhead = 26/1526 ≈ 1.7
          %. Pluss 12 bytes inter-frame gap mellom hver ramme. Ethernet er overraskende effektivt.
        </p>
      </Example>

      <Example title="Eksempel: minimum-ramme på 10 Mbps vs 1 Gbps Ethernet">
        <p>
          Minimum-rammen på 64 bytes ble valgt slik at en avsender på 10 Mbps over 500 m koaks
          alltid ville rekke å oppdage en kollisjon før hun var ferdig. Beregningen:
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>Round-trip-tid over 500 m: 2 · 2,5 μs ≈ 5 μs</li>
          <li>+ repeater-forsinkelse i begge ender ≈ 51,2 μs total slot-tid</li>
          <li>51,2 μs · 10 Mbps = 512 bit = 64 bytes</li>
        </ul>
        <p className="mt-2">
          På 1 Gbps blir 64 bytes overført på 0,5 μs — alt for kort til kollisjons-deteksjon over
          rimelige avstander. Løsning: «carrier extension», der korte rammer padses opp til 512
          bytes med spesielle pad-symboler. I praksis brukes 1 Gbps nesten alltid full-duplex
          (switched), så hele problemet er irrelevant. Det er en historisk artefakt som vi fortsatt
          bærer med oss i standarden.
        </p>
      </Example>

      <Example title="Eksempel: spore en Ethernet-ramme med Wireshark">
        <p>Vi tar Wireshark-output for en HTTP-pakke. Ethernet-laget viser:</p>
        <pre className="text-[11px] font-mono bg-muted/30 p-2 rounded mt-1 overflow-x-auto">
          {`Frame 42: 74 bytes on wire
Ethernet II, Src: Apple_4a:12:99 (a4:83:e7:4a:12:99)
              Dst: Cisco_1b:c0:de (3c:08:f6:1b:c0:de)
    Type: IPv4 (0x0800)
    [stream index: 14]
Internet Protocol Version 4, Src: 10.0.0.42, Dst: 142.250.74.46`}
        </pre>
        <p className="mt-2">
          Bemerk: <strong>destinasjons-MAC = ruterens MAC</strong> (Cisco), ikke server-en på
          142.250.74.46. På link-laget snakker du alltid bare med den NESTE noden — ruteren bytter
          ut MAC-headeren før den sender pakken videre på neste lenke. Wireshark viser <em>ikke</em>
          preamble eller CRC fordi NIC-en strippet de før OS-en så pakken.
        </p>
      </Example>

      <Hvorfor title="Hvorfor overlevde Ethernet, mens Token Ring og ATM forsvant?">
        <p>
          På 80- og 90-tallet var det flere alternativer til Ethernet, mange teknisk bedre på papir:
          Token Ring hadde determinisme, FDDI hadde fiber og høyere hastighet, ATM hadde QoS for
          stemme og video. Likevel vant Ethernet alle markeder. Hvorfor?
        </p>
        <p>
          <strong>Enkelhet og pris.</strong> En Ethernet-NIC var billigere å produsere enn en Token
          Ring-NIC fra start. Ingen aktiv master, ingen token-håndtering, ingen kompleks
          tilkoblings-protokoll. Volum-fordelen ble selvforsterkende: høyere volum → lavere pris →
          mer adopsjon → mer volum.
        </p>
        <p>
          <strong>Backward compatibility i ramme-formatet.</strong> Ethernet-rammen fra 1980 ser
          essensielt lik ut i 2026. Hvert hastighets-hopp (10 → 100 → 1G → 10G → 40G → 100G → 400G)
          har beholdt samme MAC-format og samme MTU. En 2026-applikasjon kan snakke med en 1995-
          server uten oversetting.
        </p>
        <p>
          <strong>Switcher løste kollisjons-problemet.</strong> Den klassiske kritikken mot Ethernet
          var «ikke-deterministisk pga. kollisjoner». Når switcher gjorde at det aldri mer ble
          kollisjoner, falt den kritikken bort. Token Rings determinisme-fordel var plutselig
          irrelevant.
        </p>
        <p>
          <strong>IP elsker Ethernet.</strong> ATM forsøkte å være det universelle laget under IP,
          men cell-formatet (53 bytes) passet dårlig for IP-datagrammer (typisk 500-1500). Ethernet
          har akkurat samme MTU som IPv4 typisk vil ha — null friksjon.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-day-in-the-life", "dte2507-switch-self-learning"]} />
    </article>
  );
}

// ============================================================
// 6.4 (forts.) — VLAN
// ============================================================
function Section64Vlan() {
  return (
    <article className="space-y-4 text-sm border-t border-border pt-6">
      <h3 className="text-base font-semibold">VLAN — én switch, mange logiske nett</h3>

      <p className="text-muted-foreground">
        En klassisk switch deler verden i ett stort broadcast-domene per fysisk switch (egentlig per
        koblet maskinkube). Det skalerer dårlig — en stor bedrift vil ikke at HR-avdelingen og
        gjeste-WiFi-en skal være på samme nett. VLAN løser dette ved å la én fysisk switch oppføre
        seg som flere logiske switcher samtidig.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            { term: "VLAN", icon: <VlanIcon />, body: "Logisk gruppe porter — eget broadcast-domene." },
            { term: "Port-basert VLAN", icon: <VlanIcon />, body: "Hver port hører til ett bestemt VLAN." },
            { term: "802.1Q tagging", icon: <VlanTagIcon />, body: "4-byte tag etter kilde-MAC — 12-bit VLAN-ID." },
            { term: "Trunk-link", icon: <TrunkLinkIcon />, body: "Switch-switch-lenke som bærer flere VLAN tagget." },
            { term: "Native VLAN", icon: <NativeVlanIcon />, body: "VLAN uten tagg over trunk — ofte VLAN 1." },
            { term: "Inter-VLAN routing", icon: <InterVlanRoutingIcon />, body: "Krysning av VLAN-grense går via ruter." },
            { term: "Brannmur per VLAN", icon: <FirewallVlanIcon />, body: "Ruter blir naturlig filter mellom VLAN." },
            { term: "VLAN-hopping", icon: <VlanHoppingIcon />, body: "Angrep: bruk dobbel-tag for å nå annet VLAN." },
            { term: "Private VLAN", icon: <PrivateVlanIcon />, body: "Isolerte porter — selv ikke nabo ser deg." },
            { term: "Voice VLAN", icon: <VoiceVlanIcon />, body: "IP-telefon i eget VLAN med QoS — én kabel." },
            { term: "VTP", icon: <VtpIcon />, body: "Cisco-protokoll for å sync VLAN-liste mellom switcher." },
            { term: "QinQ", icon: <QinqIcon />, body: "Dobbel 802.1Q — ISP-tag over kunde-tag." },
            { term: "MAC-basert VLAN", icon: <MacIcon />, body: "VLAN avgjort av kilde-MAC, ikke port." },
          ]}
        />
        <div className="space-y-3">
          <Illustration caption="Trunk-port bærer tags mellom switcher, access-porter stripper tag før host ser rammen.">
            <VlanTrunkSvg />
          </Illustration>
          <Illustration caption="Én fysisk switch deles i to VLANer. Trunk-lenken bærer tagget trafikk fra begge.">
            <VlanSvg />
          </Illustration>
          <Illustration caption="802.1Q-tag: 4 bytes lagt mellom kilde-MAC og EtherType — TPID, prioritet, DEI, VLAN-ID.">
            <VlanTagSvg />
          </Illustration>
        </div>
      </div>

      <Metafor tittel="VLAN = ulike etasjer i samme kontorbygg">
        <p>
          Tenk deg Forskningsparken i Tromsø: ett fysisk bygg, men ulike etasjer for ulike firmaer.
          HR-avdelingen i 3. etasje, IT i 4., gjeste-resepsjon i 1. Hver etasje har sin egen
          kortleser, sin egen kjøkkenkrok, og du kan ikke gå rett fra HR til gjeste-området uten å
          gå via heisen (felles infrastruktur).
        </p>
        <p>
          VLAN setter en virtuell vegg mellom porter på samme fysiske switch. Trafikk fra HR-VLAN
          når ikke gjeste-VLAN — det fungerer som om de var to separate switcher. Eneste vei mellom:
          gå via heisen (= ruter med brannmur).
        </p>
      </Metafor>

      <Metafor tittel="802.1Q-tag = farget bånd rundt brevet">
        <p>
          Tenk deg postsystemet på en stor arbeidsplass: hver pakke har et farget bånd rundt seg som
          forteller hvilken avdeling den hører til. Når pakken passerer felleskorridoren, ser
          sortereren båndet og leverer den til riktig avdelings-hylle. Når den når ditt skrivebord,
          fjernes båndet — du ser bare den originale pakken.
        </p>
        <p>
          VLAN-tag-en (802.1Q) virker likt: den legges på når rammen krysser en trunk-lenke mellom
          switcher, og fjernes når rammen kommer ut til en host-port. Hosten ser aldri tag-en — den
          er kun til intern bruk i switch-fabric.
        </p>
      </Metafor>

      <Metafor tittel="VLAN-hopping = å smugle deg inn med to ID-kort">
        <p>
          Du har ID-kort for 4. etasje, men vil til 3. Du teiper ID for 3. etasje under ID for 4.
          Vakta i 1. ser bare ytre kortet (4. etasje), slipper deg gjennom slusen, fjerner ditt
          4.-kort. Du går videre med 3.-kortet eksponert — den neste vakta i heisen gjenkjenner det
          og lar deg gå inn der.
        </p>
        <p>
          Dobbel-tagging i VLAN-hopping fungerer slik: angriperen legger to 802.1Q-tags i rammen.
          Første switch stripper ytre tag, neste switch ser indre tag og leverer rammen i feil VLAN.
          Forsvar: aldri la host-VLAN være «native» på trunk.
        </p>
      </Metafor>

      <Example title="Eksempel: 802.1Q-tag detaljert">
        <p>
          Tag-en er 4 bytes (32 bit) og legges mellom kilde-MAC og EtherType i den opprinnelige
          rammen:
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>TPID (16 bit) = 0x8100 — sier «dette er en VLAN-tag»</li>
          <li>Prioritet (3 bit) — for QoS, verdi 0–7</li>
          <li>DEI (1 bit) — drop-eligible indicator</li>
          <li>VLAN-ID (12 bit) — 0–4095 (0 og 4095 reservert)</li>
        </ul>
        <p className="mt-2">
          For HR-VLAN 10: tag-en blir 0x8100 0x000A. Switchen ser den, kjenner igjen at rammen hører
          til VLAN 10, og videresender bare til andre porter som er medlem av VLAN 10. Andre porter
          ser aldri rammen.
        </p>
      </Example>

      <Example title="Eksempel: router-on-a-stick for inter-VLAN routing">
        <p>
          En liten bedrift har én ruter og én switch. Switchen er konfigurert med tre VLANer (10,
          20, 30). Ruteren har bare ett fysisk Ethernet-interface ledig. Hvordan får ruteren tilgang
          til alle tre VLANer?
        </p>
        <ol className="list-decimal pl-5 mt-1 space-y-1">
          <li>
            Switch-porten mot ruteren konfigureres som en TRUNK som transporterer VLAN 10, 20 og 30
            (tagget).
          </li>
          <li>
            Ruterens ene fysiske port deles inn i tre virtuelle sub-interfaces:
            <code className="ml-1">eth0.10</code>, <code>eth0.20</code>, <code>eth0.30</code>.
          </li>
          <li>
            Hver sub-interface får sin egen IP (f.eks. 10.0.10.1/24, 10.0.20.1/24, 10.0.30.1/24) og
            blir default gateway for sitt VLAN.
          </li>
          <li>
            Når en pakke skal fra VLAN 10 til VLAN 20: host sender til sub-interface 10, ruteren
            slår opp i routing-tabellen, sender via sub-interface 20. Switchen får rammen tagget med
            VLAN 20 og leverer den til riktig host.
          </li>
        </ol>
        <p className="mt-2">
          Trafikken mellom VLAN 10 og 20 går altså opp til ruteren og tilbake igjen via samme
          fysiske lenke — derav navnet «router on a stick». Modent design var det 90-talls; i dag
          har du som regel en layer-3-switch som gjør ruting og switching i samme boks (uten
          utveiingen).
        </p>
      </Example>

      <Example title="Eksempel: VLAN-hopping via double-tagging">
        <p>
          Angriperen sitter på VLAN 20 (data-nett) og vil snakke med servere på VLAN 10 (HR), uten å
          gå via ruteren der brannmuren sitter.
        </p>
        <ol className="list-decimal pl-5 mt-1 space-y-1">
          <li>
            Angriperen lager en ramme med TO 802.1Q-tags: ytre = 20 (native VLAN), indre = 10.
          </li>
          <li>
            Switch S1 mottar rammen på access-porten. Den fjerner det ytre tagget (siden 20 er
            native) — men ser ikke at det fortsatt er et indre tagg.
          </li>
          <li>
            S1 sender rammen videre på trunk til S2. Trunk-rammen har nå BARE indre tagget (VLAN
            10).
          </li>
          <li>
            S2 mottar trunk-rammen, ser VLAN-ID 10, og leverer den til en HR-port. Brannmur ble
            aldri konsultert.
          </li>
        </ol>
        <p className="mt-2">
          Forsvar: aldri bruk VLAN 20 (eller noe VLAN med hosts) som native på en trunk. La native
          VLAN være et tomt VLAN som ingen host kjenner til. Da feiler trikset på steg 2 — switchen
          oppdager at det er en uventet VLAN-tag og kaster rammen.
        </p>
      </Example>

      <Hvorfor title="Hvorfor ble VLAN nødvendig?">
        <p>
          På 90-tallet hadde en bedrift typisk én fysisk switch per fysisk avdeling. HR i tredje
          etasje hadde sin egen switch, IT i kjelleren sin egen, gjester ble plugget i en hub i
          resepsjonen. Hver switch var ett broadcast-domene; det fungerte fordi bygningen var
          underdelt fysisk.
        </p>
        <p>
          <strong>Ombyggings-problemet.</strong> Når HR flytter til andre etasje, må man dra nye
          kabler eller flytte en switch. Et nytt prosjektteam med folk fra flere avdelinger? Enten
          fysisk segregering (dyrt) eller dele broadcast-domene med tilfeldige andre (sikkerhets-
          risiko).
        </p>
        <p>
          <strong>Skalering av broadcast.</strong> Hver maskin sender ARP, DHCP, mDNS osv. som
          broadcasts. Et stort flatt LAN med 5000 maskiner ble overfylt av broadcasts — for hver
          ramme måtte hver maskin se på den, kjenne at den ikke var for henne, og kaste den. Mange
          små broadcast-domener (ett per VLAN) løser dette.
        </p>
        <p>
          <strong>Sikkerhet og compliance.</strong> Regulatorisk krav (PCI-DSS, GDPR for spesielle
          data) krever at visse systemer er logisk isolert. VLAN gir denne isolasjonen uten å måtte
          investere i fysisk segregert infrastruktur. Brannmuren mellom VLAN ankommer naturlig på
          ruteren.
        </p>
        <p>
          <strong>WiFi.</strong> Gjeste-WiFi og bedrifts-WiFi sender begge over samme aksess-punkt
          fysisk, men putter rammene i ulike VLAN. Hver SSID mapper til sin VLAN-ID; brannmuren
          mellom ankommer på neste hopp.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-brannmur-vlan"]} />
    </article>
  );
}

// ============================================================
// 6.5 — Linker mellom datasentre (rack-topologier)
// ============================================================
function Section65() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="6.5" title="Linker mellom datasentre — fat-tree og leaf-spine" />

      <p className="text-muted-foreground">
        Et moderne datasenter har titusenvis av servere som snakker konstant sammen — distribuerte
        databaser, MapReduce-jobber, mikrotjenester. Det klassiske tre-hierarkiet (aksess →
        distribusjon → core) skalerer dårlig fordi alt skal opp og ned gjennom et trangt nakke-ledd.
        Moderne datasentre bruker bredere topologier som gir mange parallelle stier.
      </p>

      <Section65Live />

      <p className="text-muted-foreground">
        Topologien over er en 2-tier leaf-spine: 4 leaf-switcher med 2 hosts hver, og 4 spine-switcher
        på toppen. Hver leaf har en lenke til hver spine — så det finnes alltid 4 like-lange stier
        mellom to vilkårlige hosts (med mindre de er på samme leaf). ECMP hash-fordeler flows over
        disse 4 stiene. Legg til flere flows og se hvordan lasten fordeler seg; endre hash-salt for å
        omfordele.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            { term: "ToR-switch", icon: <TorSwitchIcon />, body: "Switch på toppen av server-rack — aksess-laget." },
            {
              term: "Klassisk tre-topologi",
              icon: <ThreeTierIcon />,
              body: "Aksess → distribusjon → core. Trang flaskehals.",
            },
            { term: "Fat-tree", icon: <FatTreeIcon />, body: "Tre der lenkene blir tykkere mot toppen — full bisection." },
            { term: "Leaf-spine", icon: <LeafSpineIcon />, body: "To lag: hver leaf kobles til hver spine. 2 hopp alltid." },
            { term: "ECMP", icon: <EcmpIcon />, body: "Hash-fordel flows over flere like-kost-stier." },
            { term: "Bisection bandwidth", icon: <BisectionIcon />, body: "Kapasitet over et snitt som deler nettet i to." },
            { term: "Oversubscription", icon: <OversubscriptionIcon />, body: "Ned-kapasitet / opp-kapasitet — 1:1 ideelt." },
            { term: "3-tier vs 2-tier", icon: <ThreeTierIcon />, body: "6 hopp vs 2 hopp på tvers av racker." },
            {
              term: "Øst-vest vs nord-sør",
              icon: <EastWestIcon />,
              body: "Server-til-server vs til internett — 10× mer øst-vest.",
            },
            { term: "Clos-nettverk", icon: <ClosIcon />, body: "Matematisk familie fat-tree/leaf-spine hører til." },
            { term: "DCB", icon: <DcbIcon />, body: "Ethernet-utvidelser for lossless storage-trafikk." },
            { term: "RoCE / RDMA", icon: <RdmaIcon />, body: "NIC leser/skriver RAM direkte — ~1 μs latency." },
            { term: "BGP i datasenter", icon: <BgpIcon />, body: "Internettets ruting-protokoll brukt internt." },
            { term: "VXLAN", icon: <VxlanIcon />, body: "Overlay-nett — 24-bit VNI gir 16M virtuelle nett." },
          ]}
        />
        <div className="space-y-3">
          <Illustration caption="Tre datasenter-topologier side-ved-side: 3-tier, leaf-spine, fat-tree i samme skala.">
            <DcTopologierSvg />
          </Illustration>
          <Illustration caption="Leaf-spine: hver leaf kobles til hver spine. To leaf-switcher kommuniserer alltid via én spine, ECMP fordeler last.">
            <LeafSpineSvg />
          </Illustration>
          <Illustration caption="3-tier vs leaf-spine: klassisk tre tvinger alle pakker opp 3 hopp; leaf-spine flater til 2 hopp og åpner mange parallelle stier.">
            <FatTreeVsLeafSpineSvg />
          </Illustration>
        </div>
      </div>

      <Metafor tittel="Fat-tree = Oslo Lufthavn">
        <p>
          Tenk deg Oslo Lufthavn: mange porter på bakken (gates der flyene står — som server-rackene
          i et datasenter), men koblet sammen via store transit-terminaler (spine-switcher) som
          flyttbart kan håndtere stor trafikk-flyt på tvers. Du kan gå fra hvilken som helst gate
          til hvilken som helst annen via terminalen, og det er flere parallelle veier rundt.
        </p>
        <p>
          En klassisk tre-topologi er som en flyplass med ÉN trang hovedhall — alle som vil krysse
          må presse seg gjennom den. Fat-tree/leaf-spine åpner mange parallelle korridorer, og ECMP
          er som å fordele reisende på ulike heiser så ingen blir flaskehals.
        </p>
      </Metafor>

      <Metafor tittel="Leaf-spine = T-banen i Oslo med mange linjer som krysser sentrum">
        <p>
          For å komme fra Tøyen (leaf 1) til Majorstuen (leaf 2) tar du ALLTID nøyaktig to stopp via
          en sentrums-stasjon (en spine). Du har valget mellom Stortinget, Nationaltheatret eller
          Jernbanetorget som transit — like raskt uansett. Hvis én linje er overfylt, velg en annen.
        </p>
        <p>
          Det er nøyaktig leaf-spine: alltid 2 hopp mellom to leaf-er, og ECMP fordeler flows jevnt
          over alle spiner. Forutsigbar latency er gull verdt for distribuerte databaser.
        </p>
      </Metafor>

      <Metafor tittel="Oversubscription = hotell-buffeen om morgenen">
        <p>
          Hotellet i Bodø har 200 rom (servere) og en buffé med kapasitet for 50 personer (uplink).
          Det er 4:1 oversubscription. Det funker FORDI ikke alle gjester går til buffeen samtidig —
          de fleste sover, andre er ute. Men hvis det er en konferanse og alle møter klokken 07:30,
          blir det kø.
        </p>
        <p>
          Datasentre med tung øst-vest trafikk (alle servere snakker med alle servere samtidig — som
          ved en MapReduce shuffle) krever 1:1, ellers blir uplinks flaskehals. Web- arbeidsmengder
          med lite intern-snakk klarer seg fint med 4:1 eller 8:1.
        </p>
      </Metafor>

      <Example title="Eksempel: bisection i en 4-leaf, 4-spine topologi">
        <p>
          Anta 4 leaf-switcher, hver med 48 server-porter à 10 Gbps og 4 uplink-porter à 40 Gbps
          (totalt 160 Gbps oppover). Hver leaf kobles til hver av 4 spine-switcher med én 40 Gbps
          lenke.
        </p>
        <p className="mt-2">
          Per-leaf ned-kapasitet: 48 × 10 = 480 Gbps. Opp-kapasitet: 160 Gbps. Oversubscription ≈
          3:1. Hvis alle servere på en leaf vil snakke samtidig med servere på andre leaf-switcher,
          får hver server bare ~3.3 Gbps reelt — fortsatt fint, men ikke linje-rate.
        </p>
        <p className="mt-2">
          For 1:1 må vi enten ha 12 uplinks per leaf (uvanlig høyt), eller bytte 10 Gbps
          server-portene til 2.5 Gbps. Avveiingen mellom kost og «alle kan snakke» er kjernen i
          datasenter-design.
        </p>
      </Example>

      <Example title="Eksempel: ECMP-hashing fordeler trafikk over 4 spine-switcher">
        <p>
          Leaf L1 har 4 like uplinks, én til hver av S1, S2, S3, S4. En server R1 i L1 åpner tre
          parallelle TCP-flows mot R8 (under leaf L4):
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>Flow A: (R1:54000, R8:443)</li>
          <li>Flow B: (R1:54001, R8:443)</li>
          <li>Flow C: (R1:54002, R8:443)</li>
        </ul>
        <p className="mt-2">
          L1 hash-er 5-tuplen (src-IP, dst-IP, src-port, dst-port, protokoll) og tar resten modulo
          4. Anta hash(A) % 4 = 0, hash(B) % 4 = 2, hash(C) % 4 = 2. Da:
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>Flow A går via S1.</li>
          <li>Flow B går via S3.</li>
          <li>Flow C går også via S3 (hash-kollisjon).</li>
        </ul>
        <p className="mt-2">
          Hver flow holder seg KONSISTENT på sin sti — pakkene i en TCP-flow tar samme rute, så det
          ankommer ikke i feil rekkefølge (out-of-order). Men ECMP-hashing er ikke perfekt: når to
          tunge flows kolliderer i samme spine (som B og C her), kan den ene spine-en bli flaskehals
          mens en annen er ledig. Moderne implementasjoner bruker «flowlet switching» som re-hasher
          midt i en flow når den ser et naturlig brudd.
        </p>
      </Example>

      <Example title="Eksempel: fat-tree med k=4 — hvor mange servere og switcher?">
        <p>Standard fat-tree-formel: en k-ary fat-tree har:</p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>(k/2)² core-switcher</li>
          <li>k pods, hver med k/2 aggregerings-switcher og k/2 edge-switcher</li>
          <li>Hver edge-switch har k/2 servere</li>
          <li>Totalt: k³/4 servere</li>
        </ul>
        <p className="mt-2">
          For k=4: 4 core-switcher, 4 pods × (2 agg + 2 edge) = 16 switcher i pod-ene, og 4 · 4 / 4
          · 4 = <strong>16 servere</strong>. Liten skala, men full bisection.
        </p>
        <p className="mt-2">
          For k=48 (typisk høyport-switch): 576 core, 48·48 = 2304 pod-switcher, og 48³/4 =
          <strong> 27 648 servere</strong>. Det skalerer godt: dobler du k, åttedobler du
          server-kapasitet. Det er hvorfor Facebooks og Googles datasentre er bygget på dette
          mønsteret.
        </p>
      </Example>

      <Hvorfor title="Hvorfor erstattet leaf-spine den klassiske 3-tier-topologien?">
        <p>
          Klassisk 3-tier (aksess → distribusjons → core) dominerte enterprise-nett gjennom 90- og
          2000-tallet. Det fungerte fint mens trafikken stort sett var nord-sør: brukere snakket med
          servere via internett. I 2010 begynte ting å skifte.
        </p>
        <p>
          <strong>Øst-vest-eksplosjon.</strong> Mikrotjenester, distribuerte databaser (Cassandra,
          Spanner), MapReduce, GPU-trening — alt dette krever at servere i datasenteret snakker
          intenst med HVERANDRE, ikke med utsiden. 3-tier-design med en trang nakke-core ble
          flaskehals.
        </p>
        <p>
          <strong>Determinisme i latency.</strong> I 3-tier kan en pakke gå alt fra 2 hopp (samme
          rack) til 6 hopp (kryss-aggregat) — uforutsigbart for applikasjons-utviklere. I leaf-spine
          er det ALLTID 2 hopp mellom to vilkårlige servere. Forutsigbar latency er essensielt for
          distribuerte databaser.
        </p>
        <p>
          <strong>Skalering av bisection.</strong> I 3-tier må core-switcher være enorme — én enkelt
          monster-boks. I leaf-spine bytter du komplekse core-switcher mot mange enkle spine-
          switcher som hver bare gjør ECMP. Skalering = legg til en spine. Mye lettere å vokse i
          inkrementer.
        </p>
        <p>
          <strong>Kostnads-effektivitet via volum-silikon.</strong> Industri-standardiserte merchant
          silicon-brikker (Broadcom Tomahawk, Trident osv.) gjør at en 32-port 400G-switch koster en
          brøkdel av hva en proprietær chassis-switch gjorde. Leaf-spine er bygget av mange like
          slike — null spesial-hardware.
        </p>
        <p>
          <strong>Operasjonell enkelhet.</strong> Hver switch i leaf-spine er identisk konfigurert
          (bortsett fra IP-er). Failure-domene = én switch. Bytting av en død leaf eller spine er en
          15-minutters jobb, ikke et kontroll-plane-mareritt.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-day-in-the-life", "dte2507-switch-self-learning"]} />
    </article>
  );
}

// ============================================================
// 6.6 — MPLS og virtuelle nett
// ============================================================
function Section66() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="6.6" title="MPLS og virtuelle nett" />

      <p className="text-muted-foreground">
        MPLS (Multiprotocol Label Switching) er en teknikk for å rute pakker basert på en kort{" "}
        <em>label</em> i stedet for å gjøre fullt IP-oppslag på hver ruter. Tenk på det som et
        «lag 2.5» som ligger mellom linklaget og IP-laget: når en pakke kommer inn i et MPLS-nett,
        legges en label på; alle rutere underveis (LSR — Label Switching Routers) ser bare på
        labelen og bytter den ut for neste hopp. Det er switching-hastighet på ruter-funksjonalitet,
        og det er grunnlaget for de fleste store ISP-er og bedrifts-VPN-er.
      </p>

      <Section66Live />

      <p className="text-muted-foreground">
        Følg pakka fra kunde A site 1, gjennom MPLS-domenet (ingress LER → 2 LSR-er → egress LER),
        ut til kunde A site 2. Underveis byttes transport-labelen hopp-for-hopp (swap), og ingen LSR
        ser noensinne på selve IP-headeren. Toggle L3VPN-modus for å se hvordan en ekstra
        VPN-label holder kunde A og kunde B adskilt — selv om begge bruker samme private
        IP-rom 10.0.0.5.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            { term: "MPLS-label", icon: <MplsLabelIcon />, body: "20-bit ID — slås opp i en tabell på hver ruter." },
            { term: "LSR", icon: <LsrIcon />, body: "Label Switching Router — bytter ut label per hopp." },
            { term: "LSP", icon: <LspIcon />, body: "Label Switched Path — forhåndsdefinert sti gjennom nettet." },
            { term: "Push / swap / pop", icon: <PushSwapPopIcon />, body: "Operasjoner på label-stacken (legg på / bytt / fjern)." },
            { term: "FEC", icon: <FecIcon />, body: "Forwarding Equivalence Class — pakker som behandles likt." },
            { term: "LDP", icon: <LdpIcon />, body: "Label Distribution Protocol — sprer labels mellom rutere." },
            { term: "MPLS-VPN", icon: <MplsVpnIcon />, body: "Kunde-nett tunnel via outer label = «ditt» trafikk." },
            { term: "L3VPN", icon: <L3VpnIcon />, body: "Ruter-nivå-VPN: hver kunde sin VRF + label-stack." },
            { term: "L2VPN / VPLS", icon: <VplsIcon />, body: "Ethernet-strekk over MPLS-kjerne." },
            { term: "TE (Traffic Engineering)", icon: <TrafficEngIcon />, body: "Pin LSP-er over ønskede stier — unngå hotspot." },
            { term: "Segment Routing", icon: <SegmentRoutingIcon />, body: "MPLS-arvtaker — sti i pakke-headeren, ingen LDP." },
            { term: "EXP-bit / TC", icon: <ExpBitIcon />, body: "3 QoS-bit i label — som DSCP i IP." },
            { term: "TTL i MPLS", icon: <MplsTtlIcon />, body: "Egen TTL i labelen — kopieres ofte fra IP-TTL." },
          ]}
        />
        <div className="space-y-3">
          <Illustration caption="MPLS-label legges på ved kanten av nettet (ingress LSR), byttes ut hopp-for-hopp, fjernes ved utgang (egress).">
            <MplsLabelSvg />
          </Illustration>
          <Illustration caption="L3VPN: hver kunde får sin egen VRF og «outer label» som identifiserer kundenettet — to kunder kan ha overlappende 10.0.0.0/8 uten konflikt.">
            <MplsVpnSvg />
          </Illustration>
        </div>
      </div>

      <Metafor tittel="MPLS-label = strekkode på pakken">
        <p>
          Når Posten skanner en pakke i Oslo, leser de strekkoden — ikke selve adressen. Strekkoden
          er kort og rask å lese; mengden informasjon den koder er forhåndsbestemt («denne pakken
          hører til kunde X, prioritet Y, destinasjon Z»). På hvert nytt sorteringsanlegg byttes
          strekkoden ut for den neste leddet i kjeden.
        </p>
        <p>
          MPLS gjør nøyaktig dette: ved kanten av nettet ser en LSR på IP-headeren én gang og
          tildeler en label. Alle rutere innover i nettet ser kun på labelen — det er et rask
          oppslag på 20 bit i en flat tabell, ikke en lengste-prefiks-søk i en BGP-tabell med en
          million IP-prefikser.
        </p>
      </Metafor>

      <Metafor tittel="Label-stack = russisk dukke">
        <p>
          MPLS støtter <strong>flere</strong> labels stablet utenpå hverandre. Ytre label kan
          identifisere veien gjennom ISP-en, indre label kan identifisere kunde-VPN-et. Når
          pakken når egress, popes ytterste label og indre tar over. Det er som å pakke en
          russisk dukke — én skall av gangen.
        </p>
        <p>
          Det er nettopp denne mekanismen som gjør MPLS-VPN mulig: ISP-en ser bare på ytterste
          label («denne pakken skal til kunde Acme»). Den vet ikke noe om Acmes interne IP-er, og
          to ulike kunder kan trygt bruke overlappende 10.0.0.0/8-adresser uten at trafikken
          blandes.
        </p>
      </Metafor>

      <Example title="Eksempel: en pakke gjennom en 4-hopp LSP">
        <p>
          En kundepakke kommer inn på ingress-LSR R1. R1 ser at den hører til FEC «til R5 via TE-sti
          A», legger på label = 100, og sender til R2. R2 har lært via LDP at label 100 fra R1
          mapper til label 200 mot R3 — den swapper. R3 swapper 200 til 300 mot R4. R4 er
          «penultimate hop» og popper labelen (PHP). R5 mottar ren IP-pakke, gjør én vanlig
          IP-oppslag og leverer til kunden.
        </p>
        <pre className="text-[11px] font-mono bg-muted/30 p-2 rounded mt-1 overflow-x-auto">
          {`R1 → push 100 → R2 → swap 100→200 → R3 → swap 200→300 → R4 → pop → R5 → IP-lookup`}
        </pre>
        <p className="mt-2">
          Bare R1 og R5 trengte å se på IP-headeren. Alt der imellom var label-swapping — billig og
          rask.
        </p>
      </Example>

      <Example title="Eksempel: L3VPN med to kunder">
        <p>
          ISP-en har to bedriftskunder, Acme og Beta. Begge bruker 10.0.0.0/8 internt. ISP-en
          konfigurerer to VRF-er (Virtual Routing and Forwarding) på sine PE-rutere (Provider Edge):
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>VRF Acme: «outer label» 500 brukes for trafikk til Acme-nettet.</li>
          <li>VRF Beta: «outer label» 600 brukes for trafikk til Beta-nettet.</li>
        </ul>
        <p className="mt-2">
          En pakke fra Acme-kontor i Oslo til Acme-kontor i Tromsø får label-stack {"[500, X]"}. ISP-
          ene i kjernen ser bare på label 500, ruter pakken til riktig egress-PE, popper 500, og
          leverer videre til Acme-Tromsø. Beta-trafikk har label 600 og holdes helt adskilt — selv
          med samme IP-prefikser.
        </p>
      </Example>

      <Hvorfor title="Hvorfor brukes MPLS når IP-ruting fungerer?">
        <p>
          IP-ruting fungerer fint i internett-kjernen i dag — så hvorfor finnes MPLS fortsatt?
        </p>
        <p>
          <strong>Traffic engineering.</strong> Ren IP-ruting velger korteste sti (BGP/OSPF
          metrikker). Hvis du vil tvinge en kunde-tunnel over en spesifikk fiber-rute (for SLA eller
          for å unngå overfylte segmenter), trenger du noe annet enn IGP. MPLS-TE lar deg «pinne»
          en LSP over en valgt sti.
        </p>
        <p>
          <strong>VPN-isolasjon.</strong> Ren IP-routing kan ikke holde to kunde-nett med
          overlappende RFC1918-adresser separate. MPLS-VPN er den dominerende løsningen for
          bedrifts-VPN-er hos ISP-er som Telenor og Telia.
        </p>
        <p>
          <strong>Multiprotokoll-arven.</strong> MPLS ble designet for å bære både IP og andre
          protokoller (frame relay, ATM, Ethernet) i ett underlying-nett. Selv om de fleste i dag
          bare bærer IP, finnes Ethernet-over-MPLS (VPLS, EVPN) i mange operatør-nettverk.
        </p>
        <p>
          <strong>Performance på gammel hardware.</strong> Historisk var label-swap mye raskere
          enn longest-prefix-match. Moderne ASIC-er gjør IP-lookup på samme hastighet, men
          installert base av MPLS er enorm — så det blir værende.
        </p>
        <p className="mt-2">
          <em>Trend:</em> Segment Routing (SRv6, SR-MPLS) er på vei inn som arvtaker. Sti-en pakkes
          inn i selve headeren, og man slipper LDP-vedlikehold i nettet. Konseptuelt fortsatt
          «label switching», men med ren state-i-pakken-design.
        </p>
      </Hvorfor>
    </article>
  );
}

// ============================================================
// Oppgaver
// ============================================================
function SectionOppgaver() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="Oppgaver" title="Sjekk forståelsen" />
      <p className="text-muted-foreground">
        Ti oppgaver som tester at du faktisk kan regne og resonere — ikke bare gjenkjenne ordene.
        Klikk «Vis svar» etter du har prøvd selv.
      </p>

      <Exercise
        question="Beregn CRC-3 for databitene D = 11010 med generator G = 1001."
        hint="Heng på r = 3 nuller bak D, og gjør long-division med XOR i stedet for subtraksjon."
        answer={
          <>
            <p>D·2³ = 11010000. Vi divider på 1001 med XOR-aritmetikk:</p>
            <pre className="text-[11px] font-mono bg-muted/30 p-2 rounded mt-1 overflow-x-auto">
              {`     11010000  ÷  1001
     1001
     ----
      1000
      1001
      ----
         10000
          1001
          ----
            10`}
            </pre>
            <p className="mt-1">
              Rest = 010, så CRC-3 = <strong>010</strong>. Rammen som sendes er
              <code className="ml-1">11010 010</code>. Mottakeren divider hele strengen på 1001 og
              forventer rest = 0.
            </p>
          </>
        }
      />

      <Exercise
        question="Pure ALOHA har maks throughput 1/(2e) ≈ 18 %. Vis utregningen, og forklar hvorfor slot ALOHA blir nøyaktig 2× bedre."
        hint="Sårbart vindu for kollisjon — hvor langt er det i hver variant? Bruk Poisson-trafikk."
        answer={
          <>
            <p>
              Med Poisson-ankomst med rate G rammer per ramme-tid t, er sannsynligheten for at ingen
              andre rammer ankommer i et vindu av lengde x lik e^(-Gx/t).
            </p>
            <p className="mt-2">
              <strong>Pure ALOHA:</strong> en ramme du sender kolliderer hvis noen andre starter i
              intervallet [-t, +t] — totalt vindu 2t. Throughput S = G · e^(-2G). Maksimer: dS/dG =
              0 gir G = 0.5, og S_max = 0.5·e^(-1) = 1/(2e) ≈ 0.184.
            </p>
            <p className="mt-2">
              <strong>Slot ALOHA:</strong> bare rammer som starter i samme slot kolliderer. Vinduet
              er t. S = G · e^(-G), maks ved G = 1, S_max = 1/e ≈ 0.368.
            </p>
            <p className="mt-2">
              Forholdet er nøyaktig 2×. Synkronisering av klokker halverer kollisjons-vinduet, og
              max throughput dobles. Det er en gratis-vinning — bare i kompleksitet (felles klokke).
            </p>
          </>
        }
      />

      <Exercise
        question="Switch S har en tom forwarding-tabell. I rask rekkefølge ankommer: (1) ramme fra MAC A på port 1, til B; (2) ramme fra MAC B på port 3, til A; (3) ramme fra MAC C på port 2, til A. Tegn tabellen etter hver ramme og forklar hva switchen gjør med hver."
        hint="Self-learning: hver innkommende ramme oppdaterer kilde-MAC → port. Hvis destinasjon ukjent: flood."
        answer={
          <>
            <p>
              <strong>Etter ramme 1 (A→B på port 1):</strong> tabell = {`{A: 1}`}. Destinasjon B er
              ukjent → switchen <em>flooder</em> rammen ut alle porter unntatt port 1.
            </p>
            <p className="mt-2">
              <strong>Etter ramme 2 (B→A på port 3):</strong> tabell = {`{A: 1, B: 3}`}. Destinasjon
              A er nå kjent (på port 1) → switchen sender unicast bare ut port 1.
            </p>
            <p className="mt-2">
              <strong>Etter ramme 3 (C→A på port 2):</strong> tabell = {`{A: 1, B: 3, C: 2}`}.
              Destinasjon A kjent → unicast ut port 1.
            </p>
            <p className="mt-2">
              Observasjonen: kun den FØRSTE rammen i hver retning resulterer i flooding. Etter to
              meldinger frem og tilbake har switchen lært begge kantene av samtalen.
            </p>
          </>
        }
      />

      <Exercise
        question="En bedrift har to VLANer: 10 (HR) og 20 (gjeste-WiFi). En PC på VLAN 10 (IP 10.0.10.5) sender en pakke til en server på VLAN 20 (IP 10.0.20.8). Beskriv hva som skjer steg for steg, og hvor 802.1Q-taggen legges på og fjernes."
        hint="VLAN-grense = ruter. Trunk-lenker er tagged; access-lenker er ikke."
        answer={
          <>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                PC-en ser at destinasjons-IP (10.0.20.8) er på et annet subnett, så pakken sendes
                til default gateway (la oss si 10.0.10.1).
              </li>
              <li>
                PC-en lager en Ethernet-ramme uten VLAN-tag (access-link) med destinasjons-MAC =
                ruterens MAC på VLAN 10.
              </li>
              <li>
                Switchen mottar rammen på en port konfigurert som VLAN 10 access. Hvis ruteren er på
                en annen switch må rammen krysse en trunk — DA legger switchen på 802.1Q-tag med
                VLAN-ID 10. Annen switch tar tagg av før den leverer til ruteren.
              </li>
              <li>
                Ruteren tar imot IP-pakken, slår opp 10.0.20.8 i sin tabell, finner ut det er VLAN
                20. Den lager en ny Ethernet-ramme (NY destinasjons-MAC = serverens MAC, ny
                kilde-MAC = ruterens MAC på VLAN 20).
              </li>
              <li>
                Rammen sendes ut på VLAN 20-interfacet. Hvis det går via en trunk, tagges den med
                VLAN-ID 20. Til slutt fjernes taggen og rammen leveres til server-porten.
              </li>
            </ol>
            <p className="mt-2">
              Hele veien er IP-pakken den samme (samme kilde-IP, samme destinasjons-IP) — det er
              bare Ethernet-rammene rundt som byttes ut to ganger.
            </p>
          </>
        }
      />

      <Exercise
        question="Et leaf-spine datasenter har 8 leaf-switcher og 4 spine-switcher. Hver leaf har 32 server-porter à 25 Gbps og 4 uplink-porter à 100 Gbps. Beregn oversubscription-forholdet og bisection bandwidth."
        hint="Per-leaf: total server-kapasitet vs total uplink-kapasitet. Bisection: del nettverket i to og summer kapasiteten i snittet."
        answer={
          <>
            <p>
              <strong>Per-leaf:</strong>
            </p>
            <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
              <li>Ned (mot servere): 32 × 25 = 800 Gbps</li>
              <li>Opp (mot spine): 4 × 100 = 400 Gbps</li>
              <li>Oversubscription = 800/400 = 2:1</li>
            </ul>
            <p className="mt-2">
              <strong>Bisection:</strong> del de 8 leafene i to halvdeler (4 + 4). Trafikk mellom
              halvdelene må over spine-laget. Hver leaf har 400 Gbps oppover, og halvparten av disse
              lenkene krysser snittet i snitt (forutsatt jevn ECMP).
            </p>
            <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
              <li>4 leaf på hver side × 400 Gbps = 1600 Gbps uplink per side</li>
              <li>I snittet: 4 spine-switcher × 8 nedover-lenker × 100 Gbps = 3200 Gbps total</li>
              <li>Halvparten av spine-lenkene krysser snittet ⇒ bisection ≈ 1600 Gbps</li>
            </ul>
            <p className="mt-2">
              Med 8 × 32 = 256 servere totalt, deler 128 servere per side 1600 Gbps = 12.5 Gbps per
              server i worst-case øst-vest-trafikk. Halvparten av deres 25 Gbps server-port —
              direkte konsekvens av 2:1 oversubscription.
            </p>
          </>
        }
      />

      <Exercise
        question={
          <>
            Verifiser at en mottaker oppdager en burst-feil på 3 bits med CRC-3 (G = 1011). Du
            sender D = 10110 med CRC. Anta at bitene i posisjon 3, 4 og 5 (med 0-indeksering fra
            venstre, i hele kabel-strengen) flippes underveis. Vis at mottakeren oppdager feilen.
          </>
        }
        hint="Beregn CRC for D, lag det som sendes, flipp de tre bitene, og deriver hele mottatte string med 1011."
        answer={
          <>
            <p>D = 10110, r = 3. D·2³ = 10110000. Long-division med 1011 i GF(2):</p>
            <pre className="text-[11px] font-mono bg-muted/30 p-2 rounded mt-1 overflow-x-auto">
              {`     10110000  ÷  1011
     1011
     ----
      0000
       000
       ----
       0000000
        ...
         1000
         1011
         ----
           110   ← CRC = 110`}
            </pre>
            <p className="mt-2">
              Sendt: <code>10110 110</code> = <code>10110110</code> (8 bits).
            </p>
            <p className="mt-2">
              Flipp bit 3, 4, 5 (de tre i midten): <code>10001110</code>. Mottaker divider på 1011:
            </p>
            <pre className="text-[11px] font-mono bg-muted/30 p-2 rounded mt-1 overflow-x-auto">
              {`     10001110  ÷  1011
     1011
     ----
      0111
       ...
       (rest ≠ 0)`}
            </pre>
            <p className="mt-2">
              Resten er forskjellig fra 0 → feil oppdaget. Garantert: CRC med r=3 oppdager ALLE
              burst-feil av lengde ≤ 3.
            </p>
          </>
        }
      />

      <Exercise
        question="En 10 Mbps Ethernet-hub med 500 m maks-kabel: hvorfor må minimum-rammen være på minst 64 bytes? Vis utregningen, og forklar hva som ville skjedd hvis vi tillot 32-byte rammer."
        hint="Round-trip-tid. Tenk på en kollisjon mellom A og B i hver sin ende av kabelen."
        answer={
          <>
            <p>
              Signalet bruker ca. 2/3 av lyshastigheten i koaks: v ≈ 2·10⁸ m/s. Single-trip på 500 m
              = 500 / 2·10⁸ = 2,5 μs. Round-trip = 5 μs. Pluss repeater-forsinkelser →
              kollisjons-vindu ≈ 51,2 μs.
            </p>
            <p className="mt-2">
              For at avsender skal kunne oppdage en kollisjon FØR hun er ferdig, må senden vare
              minst 51,2 μs. På 10 Mbps blir det 51,2 · 10⁻⁶ · 10·10⁶ = 512 bits = 64 bytes.
            </p>
            <p className="mt-2">
              <strong>Hvis 32-byte rammer var tillatt:</strong> avsender A sender 32 bytes = 25,6
              μs. Hun blir ferdig FØR hun ser at B i den andre enden også begynte å sende. Hun tror
              rammen kom fram, og går videre. Men B oppdager kollisjonen og gjør retransmisjon.
              Mottakeren har en korrupt ramme og venter på retransmisjon som A ikke gjør.
              Resultatet: tapet av pakker som software-stacken må håndtere — TCP retransmisjon med
              full timeout, ikke link-nivå-replay. Mye langsommere, mye mer trafikk-bortkasting.
            </p>
          </>
        }
      />

      <Exercise
        question="Du ser i Wireshark at en ARP-pakke har source-MAC AA:BB:CC:11:22:33 og en gratuitous ARP der target IP = source IP = 10.0.0.50. To minutter senere ser du en annen host som sender gratuitous ARP for SAMME IP, men fra MAC DE:AD:BE:EF:CA:FE. Hva skjer, og hva er konsekvensen?"
        hint="To maskiner tror de er 10.0.0.50. Hva gjør de andre hostene som mottar disse gratuitous ARPs?"
        answer={
          <>
            <p>
              Vi har en <strong>IP-konflikt</strong>: to maskiner har konfigurert seg med samme IP
              (10.0.0.50). Begge sender gratuitous ARP for å annonsere sin (IP, MAC)-binding.
            </p>
            <p className="mt-2">
              Andre hosters ARP-cache: når første ramme ankommer, cacher de (10.0.0.50 →
              AA:BB:CC:11:22:33). Når andre ramme ankommer, oppdaterer de cachen til (10.0.0.50 →
              DE:AD:BE:EF:CA:FE) — standard ARP-oppførsel er «siste vinner».
            </p>
            <p className="mt-2">
              <strong>Konsekvens:</strong> all trafikk til 10.0.0.50 sendes plutselig til DE:AD:...
              i stedet for AA:BB:.... Maskinen på AA:BB:... mottar ingen trafikk. Når den selv
              sender en gratuitous ARP igjen (typisk hvert annet minutt), bytter rutingen tilbake.
              Brukerne opplever sporadisk «internett virker, så virker det ikke».
            </p>
            <p className="mt-2">
              Moderne operativsystemer oppdager konflikten ved at de mottar et ARP-svar for sin egen
              IP fra en annen MAC og logger en advarsel. Linux NetworkManager popper opp: «Address
              conflict detected». Det er gratuitous ARPs jobb.
            </p>
          </>
        }
      />

      <Exercise
        question="To switcher S1 og S2 er koblet med to parallelle kabler (begge i samme VLAN, samme aksess-status). Du ønsker å bruke begge kablene for ekstra båndbredde, men nettet stopper å fungere så snart begge plugges inn. Forklar hvorfor, og foreslå to ulike løsninger."
        hint="Tenk broadcast-storm uten STP. Hva slags Ethernet-funksjon kunne kombinert kablene som én logisk lenke?"
        answer={
          <>
            <p>
              <strong>Hva skjer:</strong> de to kablene danner en loop mellom S1 og S2. En
              broadcast-ramme fra en host på S1 floodes ut begge lenkene. S2 mottar to kopier og
              flooder hver av dem tilbake ut den andre lenken. Kopiene multipliseres uten ende — en
              broadcast-storm fyller all båndbredde og lammer LAN-et på sekunder.
            </p>
            <p className="mt-2">
              <strong>Løsning 1: Spanning Tree Protocol (STP).</strong> Slå på STP (sannsynligvis
              allerede på som default). STP velger en root-switch, beregner korteste sti til root
              for hver port, og slår AV den ene av de to lenkene. Den slåtte lenken er en backup —
              hvis den aktive ryker, åpner STP backup-en innen 30-60 sekunder (eller 1 sekund med
              Rapid STP). Du får redundans, men ikke ekstra båndbredde.
            </p>
            <p className="mt-2">
              <strong>Løsning 2: LAG / EtherChannel / 802.3ad.</strong>
              Konfigurer begge kablene som ÉN logisk lenke (Link Aggregation Group).
              LACP-protokollen håndhilser på hver side; switcher behandler de to fysiske portene som
              én bundle. STP ser bare én logisk lenke, så ingen loop. Trafikk hash-fordeles over
              begge fysiske kablene → DOBBEL båndbredde og redundans samtidig.
            </p>
          </>
        }
      />

      <Exercise
        question="En leaf-spine fabric har 16 leaf-switcher og 8 spine-switcher. Hver leaf har 48 server-porter à 10 Gbps og bruker resten av portene som 100 Gbps uplinks (én til hver spine). Beregn (a) ned-kapasitet per leaf, (b) opp-kapasitet per leaf, (c) oversubscription-ratio, (d) total bisection bandwidth."
        hint="Du må regne ut hvor mange uplinks per leaf det er først (én per spine = 8). Bisection: del leafene i to grupper, summer kapasiteten over snittet."
        answer={
          <>
            <p>
              <strong>(a) Ned-kapasitet per leaf:</strong> 48 porter × 10 Gbps ={" "}
              <strong>480 Gbps</strong>.
            </p>
            <p className="mt-2">
              <strong>(b) Opp-kapasitet per leaf:</strong> 8 spines, så 8 uplinks à 100 Gbps =
              <strong> 800 Gbps</strong>.
            </p>
            <p className="mt-2">
              <strong>(c) Oversubscription:</strong> 480/800 = 0,6:1, eller mer brukbart: opp-
              kapasiteten er 1,67× ned-kapasiteten. Vi har FAKTISK over-provisjonert oppover. I
              praksis betyr det at hver server kan kjøre i full 10 Gbps mot HVILKEN som helst annen
              server i fabric-en, uten kongestion. <strong>Bedre enn 1:1</strong>, sannsynligvis
              valgt fordi hver leaf har spare-uplinks for redundans.
            </p>
            <p className="mt-2">
              <strong>(d) Bisection:</strong> del 16 leafene i to grupper à 8. Snittet går mellom
              leafene og spinene. Hver leaf bidrar med 800 Gbps oppover; halvparten av disse
              flow-ene krysser snittet i snitt (ECMP fordeler). Per side: 8 leaf × 800 Gbps · 0,5 =
              3200 Gbps. Total bisection ≈ <strong>3,2 Tbps</strong>.
            </p>
            <p className="mt-2">
              Med 16 · 48 = 768 servere totalt, deler 384 per side 3200 Gbps = 8,33 Gbps per server.
              Nesten full 10 Gbps. En sky-leverandør med øst-vest-tunge workloads ville være
              fornøyd.
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

function Hvorfor({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-sky-700 dark:text-sky-400 font-semibold mb-1">
        Hvorfor
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

function MplsLabelSvg() {
  // Pakke gjennom ingress→LSR→LSR→egress med label-operasjoner.
  const nodes = [
    { x: 60, label: "Ingress\nLSR (PE1)", op: "push 100", color: "fill-brand" },
    { x: 180, label: "LSR (P1)", op: "swap 100→200", color: "fill-amber-500" },
    { x: 300, label: "LSR (P2)", op: "swap 200→300", color: "fill-amber-500" },
    { x: 420, label: "Penult.\nLSR (P3)", op: "pop label", color: "fill-amber-500" },
    { x: 540, label: "Egress\nLSR (PE2)", op: "IP lookup", color: "fill-brand" },
  ];
  return (
    <svg viewBox="0 0 600 220" className="w-full h-auto">
      <text x={300} y={20} textAnchor="middle" className="fill-foreground text-[12px] font-semibold">
        MPLS LSP — én pakke gjennom 5 rutere
      </text>
      {/* Linja som binder nodene */}
      <line x1={70} y1={90} x2={550} y2={90} className="stroke-muted-foreground/40" strokeWidth={1.5} />
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={90} r={22} className={`${n.color} stroke-foreground/40`} strokeWidth={1.2} fillOpacity={0.85} />
          <text x={n.x} y={86} textAnchor="middle" className="fill-background text-[8px] font-semibold">
            {n.label.split("\n")[0]}
          </text>
          <text x={n.x} y={96} textAnchor="middle" className="fill-background text-[8px]">
            {n.label.split("\n")[1] ?? ""}
          </text>
          <text x={n.x} y={130} textAnchor="middle" className="fill-foreground text-[9px] font-mono">
            {n.op}
          </text>
        </g>
      ))}
      {/* Pakke-label langs veien */}
      {[
        { x: 120, label: "[100|IP|data]" },
        { x: 240, label: "[200|IP|data]" },
        { x: 360, label: "[300|IP|data]" },
        { x: 480, label: "[IP|data]" },
      ].map((p, i) => (
        <g key={i}>
          <rect x={p.x - 40} y={155} width={80} height={20} rx={3} className="fill-card stroke-border" strokeWidth={1} />
          <text x={p.x} y={169} textAnchor="middle" className="fill-foreground text-[9px] font-mono">
            {p.label}
          </text>
        </g>
      ))}
      <text x={300} y={200} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Bare ingress (PE1) og egress (PE2) ser på IP — alt der imellom er label-swap.
      </text>
    </svg>
  );
}

function MplsVpnSvg() {
  // To kunder, samme IP-prefiks, isolert av outer-label.
  return (
    <svg viewBox="0 0 600 260" className="w-full h-auto">
      <text x={300} y={20} textAnchor="middle" className="fill-foreground text-[12px] font-semibold">
        L3VPN: to kunder med samme 10.0.0.0/8 — separert av outer label
      </text>

      {/* Acme venstre */}
      <rect x={20} y={50} width={110} height={50} rx={6} className="fill-brand/15 stroke-brand" strokeWidth={1.5} />
      <text x={75} y={70} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        Acme Oslo
      </text>
      <text x={75} y={86} textAnchor="middle" className="fill-muted-foreground text-[9px] font-mono">
        10.0.0.0/8
      </text>

      <rect x={20} y={170} width={110} height={50} rx={6} className="fill-purple-500/15 stroke-purple-500" strokeWidth={1.5} />
      <text x={75} y={190} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        Beta Oslo
      </text>
      <text x={75} y={206} textAnchor="middle" className="fill-muted-foreground text-[9px] font-mono">
        10.0.0.0/8
      </text>

      {/* PE1 */}
      <rect x={170} y={110} width={70} height={50} rx={6} className="fill-card stroke-border" strokeWidth={1.5} />
      <text x={205} y={130} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        PE1
      </text>
      <text x={205} y={146} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        VRF/labels
      </text>

      {/* Kjerne */}
      <rect x={280} y={110} width={70} height={50} rx={6} className="fill-amber-500/15 stroke-amber-500" strokeWidth={1.5} />
      <text x={315} y={130} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        MPLS core
      </text>
      <text x={315} y={146} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        label swap
      </text>

      {/* PE2 */}
      <rect x={390} y={110} width={70} height={50} rx={6} className="fill-card stroke-border" strokeWidth={1.5} />
      <text x={425} y={130} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        PE2
      </text>
      <text x={425} y={146} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        VRF/labels
      </text>

      {/* Acme høyre */}
      <rect x={490} y={50} width={110} height={50} rx={6} className="fill-brand/15 stroke-brand" strokeWidth={1.5} />
      <text x={545} y={70} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        Acme Tromsø
      </text>
      <text x={545} y={86} textAnchor="middle" className="fill-muted-foreground text-[9px] font-mono">
        10.0.0.0/8
      </text>

      <rect x={490} y={170} width={110} height={50} rx={6} className="fill-purple-500/15 stroke-purple-500" strokeWidth={1.5} />
      <text x={545} y={190} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        Beta Tromsø
      </text>
      <text x={545} y={206} textAnchor="middle" className="fill-muted-foreground text-[9px] font-mono">
        10.0.0.0/8
      </text>

      {/* Linjer — Acme via outer label 500 */}
      <path d="M 130 75 Q 200 110 205 110" className="stroke-brand fill-none" strokeWidth={1.8} />
      <path d="M 240 135 H 280" className="stroke-brand fill-none" strokeWidth={1.8} />
      <path d="M 350 135 H 390" className="stroke-brand fill-none" strokeWidth={1.8} />
      <path d="M 460 130 Q 480 110 490 75" className="stroke-brand fill-none" strokeWidth={1.8} />
      <text x={315} y={104} textAnchor="middle" className="fill-brand text-[9px] font-mono font-semibold">
        outer label = 500 (Acme)
      </text>

      {/* Linjer — Beta via outer label 600 */}
      <path d="M 130 195 Q 200 160 205 160" className="stroke-purple-500 fill-none" strokeWidth={1.8} />
      <path d="M 240 145 H 280" className="stroke-purple-500 fill-none" strokeWidth={1.8} strokeDasharray="2 2" />
      <path d="M 350 145 H 390" className="stroke-purple-500 fill-none" strokeWidth={1.8} strokeDasharray="2 2" />
      <path d="M 460 160 Q 480 160 490 195" className="stroke-purple-500 fill-none" strokeWidth={1.8} />
      <text x={315} y={172} textAnchor="middle" className="fill-purple-500 text-[9px] font-mono font-semibold">
        outer label = 600 (Beta)
      </text>

      <text x={300} y={240} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Samme IP-prefiks, men forskjellig label-stack — kundene møtes aldri.
      </text>
    </svg>
  );
}

function FrameSvg() {
  return (
    <svg viewBox="0 0 500 180" className="w-full h-auto">
      <text
        x={250}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Ramme = MAC-header + IP-datagram + trailer
      </text>
      {/* Datagrammet inni */}
      <rect
        x={150}
        y={70}
        width={200}
        height={40}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={250} y={94} textAnchor="middle" className="fill-foreground text-[11px]">
        IP-datagram (payload)
      </text>
      {/* MAC-header */}
      <rect
        x={70}
        y={70}
        width={80}
        height={40}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={110} y={88} textAnchor="middle" className="fill-foreground text-[9px]">
        MAC-header
      </text>
      <text x={110} y={102} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        dst·src·type
      </text>
      {/* Trailer */}
      <rect
        x={350}
        y={70}
        width={60}
        height={40}
        className="fill-success/30 stroke-success"
        strokeWidth={1.5}
      />
      <text x={380} y={88} textAnchor="middle" className="fill-foreground text-[9px]">
        Trailer
      </text>
      <text x={380} y={102} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        CRC
      </text>
      {/* Bit-strøm */}
      <line
        x1={70}
        y1={130}
        x2={410}
        y2={130}
        className="stroke-muted-foreground/60"
        strokeWidth={1.5}
      />
      <text x={240} y={150} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        ...sendt som en bit-strøm over fysisk medium...
      </text>
      <text x={240} y={165} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Mottakeren ser preamble, leser MAC, sjekker CRC, og overlater IP-en til nettverkslaget
      </text>
    </svg>
  );
}

function CrcSvg() {
  return (
    <svg viewBox="0 0 500 200" className="w-full h-auto">
      <text
        x={250}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        CRC: rest av (D · 2^r) ved divisjon med G
      </text>
      {/* D (data) */}
      <rect
        x={40}
        y={50}
        width={140}
        height={30}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={110} y={70} textAnchor="middle" className="fill-foreground text-[11px] font-mono">
        D (data, k bit)
      </text>
      {/* + 2^r */}
      <rect
        x={180}
        y={50}
        width={70}
        height={30}
        className="fill-muted stroke-border"
        strokeWidth={1.5}
      />
      <text x={215} y={70} textAnchor="middle" className="fill-foreground text-[11px] font-mono">
        00...0 (r)
      </text>
      <text x={262} y={70} className="fill-foreground text-[14px] font-mono">
        ÷
      </text>
      {/* G */}
      <rect
        x={280}
        y={50}
        width={90}
        height={30}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={325} y={70} textAnchor="middle" className="fill-foreground text-[11px] font-mono">
        G (r+1 bit)
      </text>
      {/* = */}
      <text x={385} y={70} className="fill-foreground text-[14px] font-mono">
        →
      </text>
      {/* rest */}
      <rect
        x={400}
        y={50}
        width={70}
        height={30}
        className="fill-success/30 stroke-success"
        strokeWidth={1.5}
      />
      <text x={435} y={70} textAnchor="middle" className="fill-foreground text-[11px] font-mono">
        rest = CRC
      </text>

      {/* Sendt ramme */}
      <text
        x={250}
        y={115}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Det som faktisk sendes:
      </text>
      <rect
        x={120}
        y={130}
        width={160}
        height={30}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={200} y={150} textAnchor="middle" className="fill-foreground text-[11px] font-mono">
        D (k bit)
      </text>
      <rect
        x={280}
        y={130}
        width={100}
        height={30}
        className="fill-success/30 stroke-success"
        strokeWidth={1.5}
      />
      <text x={330} y={150} textAnchor="middle" className="fill-foreground text-[11px] font-mono">
        CRC (r bit)
      </text>

      <text
        x={250}
        y={185}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] italic"
      >
        Mottakeren divider hele strengen på G — hvis rest ≠ 0, har en bit flippet underveis
      </text>
    </svg>
  );
}

function AlohaSvg() {
  return (
    <svg viewBox="0 0 500 200" className="w-full h-auto">
      <text
        x={250}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Pure ALOHA: kollisjons-vindu er 2t
      </text>
      {/* Tidsakse */}
      <line x1={40} y1={140} x2={460} y2={140} className="stroke-foreground/60" strokeWidth={1.5} />
      <polygon points="460,140 455,137 455,143" className="fill-foreground/60" />
      <text x={465} y={144} className="fill-muted-foreground text-[10px]">
        tid
      </text>

      {/* Ramme A (node 1) */}
      <rect
        x={140}
        y={60}
        width={120}
        height={30}
        className="fill-brand/40 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={200} y={78} textAnchor="middle" className="fill-foreground text-[10px]">
        ramme A (node 1)
      </text>
      <line
        x1={140}
        y1={90}
        x2={140}
        y2={140}
        className="stroke-brand/40"
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <line
        x1={260}
        y1={90}
        x2={260}
        y2={140}
        className="stroke-brand/40"
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <text x={200} y={155} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        t
      </text>

      {/* Ramme B starter mens A går — kollisjon */}
      <rect
        x={220}
        y={100}
        width={120}
        height={30}
        className="fill-destructive/40 stroke-destructive"
        strokeWidth={1.5}
      />
      <text x={280} y={118} textAnchor="middle" className="fill-foreground text-[10px]">
        ramme B (node 2)
      </text>

      {/* Overlap-område */}
      <rect x={220} y={60} width={40} height={70} className="fill-destructive/20" />
      <text
        x={240}
        y={50}
        textAnchor="middle"
        className="fill-destructive text-[10px] font-semibold"
      >
        KOLLISJON
      </text>

      {/* Sårbart vindu */}
      <line x1={20} y1={170} x2={340} y2={170} className="stroke-amber-500" strokeWidth={2} />
      <text
        x={180}
        y={185}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[10px]"
      >
        Sårbart vindu = 2t (B kan starte hvor som helst her og treffe A)
      </text>
    </svg>
  );
}

function SwitchLearningSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={250}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Switch self-learning
      </text>
      {/* Switch */}
      <rect
        x={180}
        y={70}
        width={140}
        height={70}
        rx={6}
        className="fill-card stroke-brand"
        strokeWidth={2}
      />
      <text
        x={250}
        y={92}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Switch
      </text>
      {/* Tabell */}
      <text
        x={250}
        y={108}
        textAnchor="middle"
        className="fill-muted-foreground text-[8px] font-mono"
      >
        MAC | port
      </text>
      <text x={250} y={120} textAnchor="middle" className="fill-foreground text-[9px] font-mono">
        A → 1
      </text>
      <text x={250} y={132} textAnchor="middle" className="fill-foreground text-[9px] font-mono">
        B → 3
      </text>

      {/* Porter og hosts */}
      {/* Port 1 */}
      <line
        x1={180}
        y1={105}
        x2={100}
        y2={105}
        className="stroke-foreground/60"
        strokeWidth={1.5}
      />
      <text x={140} y={98} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        port 1
      </text>
      <circle
        cx={80}
        cy={105}
        r={14}
        className="fill-amber-500/40 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={80} y={108} textAnchor="middle" className="fill-foreground text-[9px]">
        A
      </text>

      {/* Port 2 */}
      <line
        x1={250}
        y1={140}
        x2={250}
        y2={185}
        className="stroke-foreground/60"
        strokeWidth={1.5}
      />
      <text x={258} y={160} className="fill-muted-foreground text-[9px]">
        port 2
      </text>
      <circle
        cx={250}
        cy={200}
        r={14}
        className="fill-success/40 stroke-success"
        strokeWidth={1.5}
      />
      <text x={250} y={203} textAnchor="middle" className="fill-foreground text-[9px]">
        C
      </text>

      {/* Port 3 */}
      <line
        x1={320}
        y1={105}
        x2={400}
        y2={105}
        className="stroke-foreground/60"
        strokeWidth={1.5}
      />
      <text x={360} y={98} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        port 3
      </text>
      <circle cx={420} cy={105} r={14} className="fill-brand/40 stroke-brand" strokeWidth={1.5} />
      <text x={420} y={108} textAnchor="middle" className="fill-foreground text-[9px]">
        B
      </text>

      {/* Læring-pil */}
      <text
        x={80}
        y={140}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[9px] italic"
      >
        A sender → switch lærer
      </text>
      <text
        x={80}
        y={152}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[9px] italic"
      >
        «A sitter på port 1»
      </text>

      <text x={250} y={20} className="fill-transparent">
        .
      </text>
    </svg>
  );
}

function EthernetFrameSvg() {
  const fields = [
    { name: "Preamble", w: 60, sub: "8 B" },
    { name: "Dst MAC", w: 60, sub: "6 B" },
    { name: "Src MAC", w: 60, sub: "6 B" },
    { name: "Type", w: 40, sub: "2 B" },
    { name: "Payload", w: 160, sub: "46–1500 B" },
    { name: "CRC", w: 50, sub: "4 B" },
  ];
  const colors = [
    "fill-muted stroke-border",
    "fill-amber-500/30 stroke-amber-500",
    "fill-amber-500/30 stroke-amber-500",
    "fill-brand/30 stroke-brand",
    "fill-brand/15 stroke-brand/60",
    "fill-success/30 stroke-success",
  ];
  let x = 20;
  return (
    <svg viewBox="0 0 500 160" className="w-full h-auto">
      <text
        x={250}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Ethernet-ramme (IEEE 802.3)
      </text>
      {fields.map((f, i) => {
        const rect = (
          <g key={f.name}>
            <rect x={x} y={50} width={f.w} height={50} className={colors[i]} strokeWidth={1.5} />
            <text
              x={x + f.w / 2}
              y={72}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-semibold"
            >
              {f.name}
            </text>
            <text
              x={x + f.w / 2}
              y={88}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {f.sub}
            </text>
          </g>
        );
        x += f.w;
        return rect;
      })}
      <text
        x={250}
        y={130}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] italic"
      >
        Faste byte-posisjoner — derfor kan NIC-en parse rammen i hardware
      </text>
    </svg>
  );
}

function VlanSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Én fysisk switch, to logiske VLANer
      </text>
      {/* Switch */}
      <rect
        x={100}
        y={70}
        width={300}
        height={70}
        rx={6}
        className="fill-card stroke-brand"
        strokeWidth={2}
      />
      <text
        x={250}
        y={92}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Switch
      </text>
      {/* VLAN 10-region (venstre halvdel) */}
      <rect
        x={110}
        y={100}
        width={130}
        height={35}
        rx={3}
        className="fill-amber-500/20 stroke-amber-500/60"
        strokeWidth={1.2}
        strokeDasharray="3 2"
      />
      <text
        x={175}
        y={122}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[10px] font-semibold"
      >
        VLAN 10 (HR)
      </text>
      {/* VLAN 20-region (høyre halvdel) */}
      <rect
        x={260}
        y={100}
        width={130}
        height={35}
        rx={3}
        className="fill-success/20 stroke-success/60"
        strokeWidth={1.2}
        strokeDasharray="3 2"
      />
      <text x={325} y={122} textAnchor="middle" className="fill-success text-[10px] font-semibold">
        VLAN 20 (gjest)
      </text>

      {/* Hosts VLAN 10 */}
      <line
        x1={140}
        y1={135}
        x2={140}
        y2={175}
        className="stroke-foreground/60"
        strokeWidth={1.5}
      />
      <circle
        cx={140}
        cy={195}
        r={14}
        className="fill-amber-500/40 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={140} y={199} textAnchor="middle" className="fill-foreground text-[9px]">
        PC-HR
      </text>

      <line
        x1={210}
        y1={135}
        x2={210}
        y2={175}
        className="stroke-foreground/60"
        strokeWidth={1.5}
      />
      <circle
        cx={210}
        cy={195}
        r={14}
        className="fill-amber-500/40 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={210} y={199} textAnchor="middle" className="fill-foreground text-[9px]">
        PC-HR
      </text>

      {/* Hosts VLAN 20 */}
      <line
        x1={290}
        y1={135}
        x2={290}
        y2={175}
        className="stroke-foreground/60"
        strokeWidth={1.5}
      />
      <circle
        cx={290}
        cy={195}
        r={14}
        className="fill-success/40 stroke-success"
        strokeWidth={1.5}
      />
      <text x={290} y={199} textAnchor="middle" className="fill-foreground text-[9px]">
        gjest
      </text>

      <line
        x1={360}
        y1={135}
        x2={360}
        y2={175}
        className="stroke-foreground/60"
        strokeWidth={1.5}
      />
      <circle
        cx={360}
        cy={195}
        r={14}
        className="fill-success/40 stroke-success"
        strokeWidth={1.5}
      />
      <text x={360} y={199} textAnchor="middle" className="fill-foreground text-[9px]">
        gjest
      </text>

      {/* Trunk-link til naboswitch */}
      <line
        x1={400}
        y1={105}
        x2={470}
        y2={105}
        className="stroke-brand"
        strokeWidth={3}
        strokeDasharray="4 2"
      />
      <text x={435} y={98} textAnchor="middle" className="fill-brand text-[9px] font-semibold">
        trunk
      </text>
      <text x={435} y={120} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        802.1Q-tagget
      </text>

      <text
        x={250}
        y={225}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] italic"
      >
        PC-HR og gjest kan ikke broadcaste til hverandre — switchen oppfører seg som to maskiner
      </text>
    </svg>
  );
}

function LeafSpineSvg() {
  const spines = [{ x: 110 }, { x: 220 }, { x: 330 }, { x: 440 }];
  const leaves = [{ x: 110 }, { x: 220 }, { x: 330 }, { x: 440 }];
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Leaf-spine: hver leaf kobles til hver spine
      </text>

      {/* Spines */}
      <text x={20} y={55} className="fill-brand text-[10px] uppercase tracking-wider font-semibold">
        Spine
      </text>
      {spines.map((s, i) => (
        <g key={`sp${i}`}>
          <rect
            x={s.x - 25}
            y={50}
            width={50}
            height={26}
            rx={4}
            className="fill-brand/20 stroke-brand"
            strokeWidth={1.5}
          />
          <text x={s.x} y={67} textAnchor="middle" className="fill-foreground text-[10px]">
            S{i + 1}
          </text>
        </g>
      ))}

      {/* Leaves */}
      <text
        x={20}
        y={155}
        className="fill-success text-[10px] uppercase tracking-wider font-semibold"
      >
        Leaf
      </text>
      {leaves.map((l, i) => (
        <g key={`lf${i}`}>
          <rect
            x={l.x - 25}
            y={150}
            width={50}
            height={26}
            rx={4}
            className="fill-success/20 stroke-success"
            strokeWidth={1.5}
          />
          <text x={l.x} y={167} textAnchor="middle" className="fill-foreground text-[10px]">
            L{i + 1}
          </text>
        </g>
      ))}

      {/* Mesh: hver leaf til hver spine */}
      {leaves.flatMap((l, li) =>
        spines.map((s, si) => (
          <line
            key={`m${li}-${si}`}
            x1={l.x}
            y1={150}
            x2={s.x}
            y2={76}
            className="stroke-muted-foreground/40"
            strokeWidth={0.8}
          />
        )),
      )}

      {/* Servere under hver leaf */}
      {leaves.map((l, i) => (
        <g key={`srv${i}`}>
          <line
            x1={l.x - 15}
            y1={176}
            x2={l.x - 15}
            y2={200}
            className="stroke-foreground/40"
            strokeWidth={1}
          />
          <line
            x1={l.x}
            y1={176}
            x2={l.x}
            y2={200}
            className="stroke-foreground/40"
            strokeWidth={1}
          />
          <line
            x1={l.x + 15}
            y1={176}
            x2={l.x + 15}
            y2={200}
            className="stroke-foreground/40"
            strokeWidth={1}
          />
          <rect
            x={l.x - 22}
            y={200}
            width={44}
            height={14}
            className="fill-card stroke-border"
            strokeWidth={1}
          />
          <text x={l.x} y={210} textAnchor="middle" className="fill-muted-foreground text-[8px]">
            servere
          </text>
        </g>
      ))}

      <text
        x={250}
        y={232}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] italic"
      >
        L1 → L4: alltid 2 hopp via en spine. ECMP fordeler flows på tvers av S1–S4.
      </text>
    </svg>
  );
}

function MacAdresseSvg() {
  return (
    <svg viewBox="0 0 500 180" className="w-full h-auto">
      <text
        x={250}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        MAC-adresse: 48 bit = OUI + serienummer
      </text>
      {/* OUI */}
      <rect
        x={60}
        y={50}
        width={170}
        height={40}
        className="fill-brand/25 stroke-brand"
        strokeWidth={1.5}
      />
      <text
        x={145}
        y={70}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-mono font-semibold"
      >
        04:1B:6F
      </text>
      <text x={145} y={84} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        OUI (produsent, 24 bit)
      </text>
      {/* Serie */}
      <rect
        x={230}
        y={50}
        width={210}
        height={40}
        className="fill-success/25 stroke-success"
        strokeWidth={1.5}
      />
      <text
        x={335}
        y={70}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-mono font-semibold"
      >
        A2:90:0C
      </text>
      <text x={335} y={84} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        Serienummer (24 bit)
      </text>
      {/* Første byte zoom */}
      <text
        x={250}
        y={115}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Første byte: 0x04 = 0000 0100
      </text>
      <g>
        <rect
          x={120}
          y={125}
          width={40}
          height={28}
          className="fill-amber-500/30 stroke-amber-500"
          strokeWidth={1}
        />
        <text x={140} y={143} textAnchor="middle" className="fill-foreground text-[10px] font-mono">
          0
        </text>
        <text x={140} y={166} textAnchor="middle" className="fill-muted-foreground text-[8px]">
          I/G=0 unicast
        </text>
      </g>
      <g>
        <rect
          x={170}
          y={125}
          width={40}
          height={28}
          className="fill-amber-500/30 stroke-amber-500"
          strokeWidth={1}
        />
        <text x={190} y={143} textAnchor="middle" className="fill-foreground text-[10px] font-mono">
          0
        </text>
        <text x={190} y={166} textAnchor="middle" className="fill-muted-foreground text-[8px]">
          U/L=0 globalt
        </text>
      </g>
      <g>
        <rect
          x={220}
          y={125}
          width={160}
          height={28}
          className="fill-muted stroke-border"
          strokeWidth={1}
        />
        <text x={300} y={143} textAnchor="middle" className="fill-foreground text-[10px] font-mono">
          000100
        </text>
        <text x={300} y={166} textAnchor="middle" className="fill-muted-foreground text-[8px]">
          resten av OUI
        </text>
      </g>
    </svg>
  );
}

function Paritet2DSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={250}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        2D-paritet: krysset peker på feilen
      </text>
      {/* 3x4 grid + parity row/col */}
      {(() => {
        const bits = [
          [1, 0, 1, 0],
          [0, 1, 0, 0], // flipped: original 0,1,1,0
          [1, 1, 0, 1],
        ];
        const pRow = [0, 0, 1];
        const pCol = [0, 0, 0, 1];
        const cellW = 50,
          cellH = 30,
          startX = 100,
          startY = 50;
        const elements: React.ReactNode[] = [];
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 4; c++) {
            const isFlipped = r === 1 && c === 2;
            elements.push(
              <g key={`b${r}-${c}`}>
                <rect
                  x={startX + c * cellW}
                  y={startY + r * cellH}
                  width={cellW}
                  height={cellH}
                  className={
                    isFlipped ? "fill-destructive/40 stroke-destructive" : "fill-card stroke-border"
                  }
                  strokeWidth={1.5}
                />
                <text
                  x={startX + c * cellW + cellW / 2}
                  y={startY + r * cellH + cellH / 2 + 4}
                  textAnchor="middle"
                  className="fill-foreground text-[12px] font-mono"
                >
                  {bits[r][c]}
                </text>
              </g>,
            );
          }
          // row parity
          const parityWrong = r === 1;
          elements.push(
            <g key={`pr${r}`}>
              <rect
                x={startX + 4 * cellW + 8}
                y={startY + r * cellH}
                width={cellW}
                height={cellH}
                className={
                  parityWrong
                    ? "fill-amber-500/30 stroke-amber-500"
                    : "fill-success/20 stroke-success/60"
                }
                strokeWidth={1.5}
              />
              <text
                x={startX + 4 * cellW + 8 + cellW / 2}
                y={startY + r * cellH + cellH / 2 + 4}
                textAnchor="middle"
                className="fill-foreground text-[12px] font-mono"
              >
                {pRow[r]}
              </text>
            </g>,
          );
        }
        // col parity row
        for (let c = 0; c < 4; c++) {
          const parityWrong = c === 2;
          elements.push(
            <g key={`pc${c}`}>
              <rect
                x={startX + c * cellW}
                y={startY + 3 * cellH + 8}
                width={cellW}
                height={cellH}
                className={
                  parityWrong
                    ? "fill-amber-500/30 stroke-amber-500"
                    : "fill-success/20 stroke-success/60"
                }
                strokeWidth={1.5}
              />
              <text
                x={startX + c * cellW + cellW / 2}
                y={startY + 3 * cellH + 8 + cellH / 2 + 4}
                textAnchor="middle"
                className="fill-foreground text-[12px] font-mono"
              >
                {pCol[c]}
              </text>
            </g>,
          );
        }
        return elements;
      })()}
      <text x={50} y={95} className="fill-muted-foreground text-[9px]">
        rad 2 →
      </text>
      <text x={235} y={195} className="fill-muted-foreground text-[9px]">
        ↑ kol 3
      </text>
      <text
        x={250}
        y={210}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] italic"
      >
        Rad 2 og kolonne 3 klager — krysset er den feile biten
      </text>
    </svg>
  );
}

function ThroughputSvg() {
  // S(G) for pure and slot ALOHA
  const W = 460,
    H = 160,
    leftPad = 50,
    bottomPad = 30;
  const Gmax = 3;
  const Smax = 0.4;
  const toX = (g: number) => leftPad + (g / Gmax) * (W - leftPad - 20);
  const toY = (s: number) => H - bottomPad - (s / Smax) * (H - bottomPad - 30);
  const pure: string[] = [];
  const slot: string[] = [];
  for (let i = 0; i <= 100; i++) {
    const g = (i / 100) * Gmax;
    pure.push(`${toX(g)},${toY(g * Math.exp(-2 * g))}`);
    slot.push(`${toX(g)},${toY(g * Math.exp(-g))}`);
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <text
        x={W / 2}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Throughput S vs offered load G
      </text>
      {/* axes */}
      <line
        x1={leftPad}
        y1={H - bottomPad}
        x2={W - 20}
        y2={H - bottomPad}
        className="stroke-foreground/60"
        strokeWidth={1}
      />
      <line
        x1={leftPad}
        y1={H - bottomPad}
        x2={leftPad}
        y2={20}
        className="stroke-foreground/60"
        strokeWidth={1}
      />
      <text x={W - 25} y={H - bottomPad + 18} className="fill-muted-foreground text-[10px]">
        G
      </text>
      <text x={leftPad - 35} y={28} className="fill-muted-foreground text-[10px]">
        S
      </text>
      {/* ticks */}
      <text
        x={leftPad}
        y={H - bottomPad + 14}
        className="fill-muted-foreground text-[9px]"
        textAnchor="middle"
      >
        0
      </text>
      <text
        x={toX(1)}
        y={H - bottomPad + 14}
        className="fill-muted-foreground text-[9px]"
        textAnchor="middle"
      >
        1
      </text>
      <text
        x={toX(2)}
        y={H - bottomPad + 14}
        className="fill-muted-foreground text-[9px]"
        textAnchor="middle"
      >
        2
      </text>
      <text
        x={toX(3)}
        y={H - bottomPad + 14}
        className="fill-muted-foreground text-[9px]"
        textAnchor="middle"
      >
        3
      </text>
      <text
        x={leftPad - 8}
        y={toY(1 / Math.E) + 3}
        className="fill-muted-foreground text-[9px]"
        textAnchor="end"
      >
        0.37
      </text>
      <text
        x={leftPad - 8}
        y={toY(1 / (2 * Math.E)) + 3}
        className="fill-muted-foreground text-[9px]"
        textAnchor="end"
      >
        0.18
      </text>
      {/* curves */}
      <polyline
        points={pure.join(" ")}
        fill="none"
        className="stroke-destructive"
        strokeWidth={1.8}
      />
      <polyline points={slot.join(" ")} fill="none" className="stroke-brand" strokeWidth={1.8} />
      {/* legend */}
      <rect
        x={W - 130}
        y={30}
        width={120}
        height={36}
        className="fill-card stroke-border"
        strokeWidth={1}
        rx={3}
      />
      <line x1={W - 122} y1={42} x2={W - 102} y2={42} className="stroke-brand" strokeWidth={2} />
      <text x={W - 98} y={45} className="fill-foreground text-[10px]">
        slot (1/e)
      </text>
      <line
        x1={W - 122}
        y1={56}
        x2={W - 102}
        y2={56}
        className="stroke-destructive"
        strokeWidth={2}
      />
      <text x={W - 98} y={59} className="fill-foreground text-[10px]">
        pure (1/2e)
      </text>
    </svg>
  );
}

function ArpSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={250}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        ARP-håndtrykk
      </text>
      {/* PC */}
      <rect
        x={30}
        y={60}
        width={100}
        height={50}
        rx={4}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={80} y={80} textAnchor="middle" className="fill-foreground text-[11px] font-semibold">
        Mobilen
      </text>
      <text
        x={80}
        y={94}
        textAnchor="middle"
        className="fill-muted-foreground text-[9px] font-mono"
      >
        10.0.0.5
      </text>
      <text
        x={80}
        y={105}
        textAnchor="middle"
        className="fill-muted-foreground text-[9px] font-mono"
      >
        AA:01
      </text>
      {/* Printer */}
      <rect
        x={370}
        y={60}
        width={100}
        height={50}
        rx={4}
        className="fill-success/20 stroke-success"
        strokeWidth={1.5}
      />
      <text
        x={420}
        y={80}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Skriveren
      </text>
      <text
        x={420}
        y={94}
        textAnchor="middle"
        className="fill-muted-foreground text-[9px] font-mono"
      >
        10.0.0.10
      </text>
      <text
        x={420}
        y={105}
        textAnchor="middle"
        className="fill-muted-foreground text-[9px] font-mono"
      >
        BB:02
      </text>
      {/* Andre noder */}
      <circle cx={200} cy={150} r={10} className="fill-muted stroke-border" strokeWidth={1} />
      <text x={200} y={168} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        host
      </text>
      <circle cx={250} cy={150} r={10} className="fill-muted stroke-border" strokeWidth={1} />
      <text x={250} y={168} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        host
      </text>
      <circle cx={300} cy={150} r={10} className="fill-muted stroke-border" strokeWidth={1} />
      <text x={300} y={168} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        host
      </text>
      {/* Request: broadcast */}
      <line
        x1={130}
        y1={75}
        x2={370}
        y2={75}
        className="stroke-amber-500"
        strokeWidth={1.8}
        markerEnd="url(#arr-arp)"
      />
      <text
        x={250}
        y={68}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[10px] font-semibold"
      >
        1. «Hvem har 10.0.0.10?» (broadcast)
      </text>
      {/* Reply: unicast */}
      <line
        x1={370}
        y1={100}
        x2={130}
        y2={100}
        className="stroke-success"
        strokeWidth={1.8}
        markerEnd="url(#arr-arp)"
      />
      <text x={250} y={195} textAnchor="middle" className="fill-success text-[10px] font-semibold">
        2. «Det er meg, MAC=BB:02» (unicast)
      </text>
      <defs>
        <marker
          id="arr-arp"
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-foreground/70" />
        </marker>
      </defs>
    </svg>
  );
}

function SwitchHierarkiSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Klassisk switch-hierarki (3-tier)
      </text>
      {/* Core */}
      <rect
        x={210}
        y={35}
        width={80}
        height={26}
        rx={4}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1.5}
      />
      <text
        x={250}
        y={52}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Core
      </text>
      {/* Distrib */}
      <rect
        x={100}
        y={95}
        width={70}
        height={24}
        rx={4}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={135} y={111} textAnchor="middle" className="fill-foreground text-[10px]">
        Dist 1
      </text>
      <rect
        x={330}
        y={95}
        width={70}
        height={24}
        rx={4}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={365} y={111} textAnchor="middle" className="fill-foreground text-[10px]">
        Dist 2
      </text>
      {/* Acc */}
      <rect
        x={40}
        y={150}
        width={60}
        height={22}
        rx={4}
        className="fill-success/30 stroke-success"
        strokeWidth={1.2}
      />
      <text x={70} y={165} textAnchor="middle" className="fill-foreground text-[9px]">
        Acc A
      </text>
      <rect
        x={110}
        y={150}
        width={60}
        height={22}
        rx={4}
        className="fill-success/30 stroke-success"
        strokeWidth={1.2}
      />
      <text x={140} y={165} textAnchor="middle" className="fill-foreground text-[9px]">
        Acc B
      </text>
      <rect
        x={330}
        y={150}
        width={60}
        height={22}
        rx={4}
        className="fill-success/30 stroke-success"
        strokeWidth={1.2}
      />
      <text x={360} y={165} textAnchor="middle" className="fill-foreground text-[9px]">
        Acc C
      </text>
      <rect
        x={400}
        y={150}
        width={60}
        height={22}
        rx={4}
        className="fill-success/30 stroke-success"
        strokeWidth={1.2}
      />
      <text x={430} y={165} textAnchor="middle" className="fill-foreground text-[9px]">
        Acc D
      </text>
      {/* Links */}
      <line x1={230} y1={61} x2={135} y2={95} className="stroke-foreground/60" strokeWidth={1.2} />
      <line x1={270} y1={61} x2={365} y2={95} className="stroke-foreground/60" strokeWidth={1.2} />
      <line x1={120} y1={119} x2={70} y2={150} className="stroke-foreground/60" strokeWidth={1.2} />
      <line
        x1={150}
        y1={119}
        x2={140}
        y2={150}
        className="stroke-foreground/60"
        strokeWidth={1.2}
      />
      <line
        x1={350}
        y1={119}
        x2={360}
        y2={150}
        className="stroke-foreground/60"
        strokeWidth={1.2}
      />
      <line
        x1={380}
        y1={119}
        x2={430}
        y2={150}
        className="stroke-foreground/60"
        strokeWidth={1.2}
      />
      {/* PC */}
      {[55, 125, 345, 415].map((x, i) => (
        <g key={i}>
          <line x1={x} y1={172} x2={x} y2={195} className="stroke-foreground/40" strokeWidth={1} />
          <circle cx={x} cy={203} r={6} className="fill-card stroke-border" strokeWidth={1} />
        </g>
      ))}
      <text x={250} y={215} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Aksess (hostene) → distribusjons (aggregering) → core (toppen)
      </text>
    </svg>
  );
}

function VlanTagSvg() {
  return (
    <svg viewBox="0 0 500 200" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        802.1Q-tag: 4 bytes mellom kilde-MAC og EtherType
      </text>
      {/* Ramme uten tag */}
      <text x={20} y={50} className="fill-muted-foreground text-[10px]">
        Uten tag:
      </text>
      <rect
        x={80}
        y={40}
        width={70}
        height={24}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={115} y={56} textAnchor="middle" className="fill-foreground text-[9px]">
        dst MAC
      </text>
      <rect
        x={150}
        y={40}
        width={70}
        height={24}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={185} y={56} textAnchor="middle" className="fill-foreground text-[9px]">
        src MAC
      </text>
      <rect
        x={220}
        y={40}
        width={50}
        height={24}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1}
      />
      <text x={245} y={56} textAnchor="middle" className="fill-foreground text-[9px]">
        Type
      </text>
      <rect
        x={270}
        y={40}
        width={180}
        height={24}
        className="fill-brand/15 stroke-brand/60"
        strokeWidth={1}
      />
      <text x={360} y={56} textAnchor="middle" className="fill-foreground text-[9px]">
        payload
      </text>

      {/* Ramme med tag */}
      <text x={20} y={120} className="fill-muted-foreground text-[10px]">
        Med tag:
      </text>
      <rect
        x={80}
        y={110}
        width={50}
        height={24}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={105} y={126} textAnchor="middle" className="fill-foreground text-[9px]">
        dst MAC
      </text>
      <rect
        x={130}
        y={110}
        width={50}
        height={24}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={155} y={126} textAnchor="middle" className="fill-foreground text-[9px]">
        src MAC
      </text>
      <rect
        x={180}
        y={110}
        width={80}
        height={24}
        className="fill-purple-500/30 stroke-purple-500"
        strokeWidth={1.5}
      />
      <text
        x={220}
        y={126}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-semibold"
      >
        VLAN-tag
      </text>
      <rect
        x={260}
        y={110}
        width={40}
        height={24}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1}
      />
      <text x={280} y={126} textAnchor="middle" className="fill-foreground text-[9px]">
        Type
      </text>
      <rect
        x={300}
        y={110}
        width={150}
        height={24}
        className="fill-brand/15 stroke-brand/60"
        strokeWidth={1}
      />
      <text x={375} y={126} textAnchor="middle" className="fill-foreground text-[9px]">
        payload
      </text>

      {/* Tag zoom */}
      <line
        x1={180}
        y1={134}
        x2={140}
        y2={155}
        className="stroke-purple-500/60"
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <line
        x1={260}
        y1={134}
        x2={400}
        y2={155}
        className="stroke-purple-500/60"
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <rect
        x={140}
        y={155}
        width={70}
        height={28}
        className="fill-purple-500/30 stroke-purple-500"
        strokeWidth={1}
      />
      <text x={175} y={170} textAnchor="middle" className="fill-foreground text-[9px] font-mono">
        TPID
      </text>
      <text x={175} y={180} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        0x8100
      </text>
      <rect
        x={210}
        y={155}
        width={50}
        height={28}
        className="fill-purple-500/30 stroke-purple-500"
        strokeWidth={1}
      />
      <text x={235} y={170} textAnchor="middle" className="fill-foreground text-[9px] font-mono">
        PCP
      </text>
      <text x={235} y={180} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        3 bit
      </text>
      <rect
        x={260}
        y={155}
        width={40}
        height={28}
        className="fill-purple-500/30 stroke-purple-500"
        strokeWidth={1}
      />
      <text x={280} y={170} textAnchor="middle" className="fill-foreground text-[9px] font-mono">
        DEI
      </text>
      <text x={280} y={180} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        1 bit
      </text>
      <rect
        x={300}
        y={155}
        width={100}
        height={28}
        className="fill-purple-500/30 stroke-purple-500"
        strokeWidth={1}
      />
      <text
        x={350}
        y={170}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-mono font-semibold"
      >
        VLAN-ID
      </text>
      <text x={350} y={180} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        12 bit (0–4095)
      </text>
    </svg>
  );
}

function FatTreeVsLeafSpineSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        3-tier (klassisk) vs leaf-spine
      </text>
      {/* Left: 3-tier */}
      <text
        x={110}
        y={40}
        textAnchor="middle"
        className="fill-destructive text-[10px] uppercase tracking-wider font-semibold"
      >
        3-tier
      </text>
      <rect
        x={90}
        y={50}
        width={40}
        height={18}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1}
      />
      <text x={110} y={62} textAnchor="middle" className="fill-foreground text-[8px]">
        core
      </text>
      <rect
        x={60}
        y={95}
        width={40}
        height={18}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1}
      />
      <rect
        x={120}
        y={95}
        width={40}
        height={18}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={80} y={107} textAnchor="middle" className="fill-foreground text-[8px]">
        agg
      </text>
      <text x={140} y={107} textAnchor="middle" className="fill-foreground text-[8px]">
        agg
      </text>
      <rect
        x={40}
        y={140}
        width={30}
        height={18}
        className="fill-success/30 stroke-success"
        strokeWidth={1}
      />
      <rect
        x={75}
        y={140}
        width={30}
        height={18}
        className="fill-success/30 stroke-success"
        strokeWidth={1}
      />
      <rect
        x={110}
        y={140}
        width={30}
        height={18}
        className="fill-success/30 stroke-success"
        strokeWidth={1}
      />
      <rect
        x={145}
        y={140}
        width={30}
        height={18}
        className="fill-success/30 stroke-success"
        strokeWidth={1}
      />
      {/* core-agg */}
      <line x1={110} y1={68} x2={80} y2={95} className="stroke-foreground/50" strokeWidth={1} />
      <line x1={110} y1={68} x2={140} y2={95} className="stroke-foreground/50" strokeWidth={1} />
      {/* agg-acc */}
      <line x1={80} y1={113} x2={55} y2={140} className="stroke-foreground/50" strokeWidth={1} />
      <line x1={80} y1={113} x2={90} y2={140} className="stroke-foreground/50" strokeWidth={1} />
      <line x1={140} y1={113} x2={125} y2={140} className="stroke-foreground/50" strokeWidth={1} />
      <line x1={140} y1={113} x2={160} y2={140} className="stroke-foreground/50" strokeWidth={1} />
      <text
        x={110}
        y={180}
        textAnchor="middle"
        className="fill-destructive text-[9px] font-semibold"
      >
        Acc → Acc: 6 hopp
      </text>
      <text x={110} y={196} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        Trang core-flaskehals
      </text>

      {/* Right: leaf-spine */}
      <text
        x={370}
        y={40}
        textAnchor="middle"
        className="fill-success text-[10px] uppercase tracking-wider font-semibold"
      >
        Leaf-spine
      </text>
      <rect
        x={290}
        y={60}
        width={40}
        height={18}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1}
      />
      <rect
        x={340}
        y={60}
        width={40}
        height={18}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1}
      />
      <rect
        x={390}
        y={60}
        width={40}
        height={18}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1}
      />
      <text x={310} y={72} textAnchor="middle" className="fill-foreground text-[8px]">
        spine
      </text>
      <text x={360} y={72} textAnchor="middle" className="fill-foreground text-[8px]">
        spine
      </text>
      <text x={410} y={72} textAnchor="middle" className="fill-foreground text-[8px]">
        spine
      </text>
      <rect
        x={280}
        y={130}
        width={40}
        height={18}
        className="fill-success/30 stroke-success"
        strokeWidth={1}
      />
      <rect
        x={340}
        y={130}
        width={40}
        height={18}
        className="fill-success/30 stroke-success"
        strokeWidth={1}
      />
      <rect
        x={400}
        y={130}
        width={40}
        height={18}
        className="fill-success/30 stroke-success"
        strokeWidth={1}
      />
      <text x={300} y={142} textAnchor="middle" className="fill-foreground text-[8px]">
        leaf
      </text>
      <text x={360} y={142} textAnchor="middle" className="fill-foreground text-[8px]">
        leaf
      </text>
      <text x={420} y={142} textAnchor="middle" className="fill-foreground text-[8px]">
        leaf
      </text>
      {/* Mesh */}
      {[300, 360, 420].map((lx) =>
        [310, 360, 410].map((sx, i) => (
          <line
            key={`${lx}-${sx}-${i}`}
            x1={lx}
            y1={130}
            x2={sx}
            y2={78}
            className="stroke-foreground/40"
            strokeWidth={0.7}
          />
        )),
      )}
      <text x={360} y={180} textAnchor="middle" className="fill-success text-[9px] font-semibold">
        Leaf → Leaf: 2 hopp
      </text>
      <text x={360} y={196} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        Mange parallelle stier (ECMP)
      </text>
    </svg>
  );
}

// ============================================================
// NYE SVG-er — original-tegnet for tekst-tunge områder
// ============================================================

// 6.1 — Lag-stack med link nederst
function LagStackSvg() {
  return (
    <svg
      viewBox="0 0 360 220"
      className="w-full h-auto"
      role="img"
      aria-label="OSI-stack med link nederst"
    >
      <text
        x={180}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Hvor sitter link-laget i stacken?
      </text>
      {[
        { y: 30, label: "Applikasjon", sub: "HTTP, SMTP", color: "fill-muted stroke-border" },
        { y: 60, label: "Transport", sub: "TCP, UDP", color: "fill-muted stroke-border" },
        { y: 90, label: "Nettverk", sub: "IP, ICMP", color: "fill-muted stroke-border" },
        {
          y: 120,
          label: "Link",
          sub: "Ethernet, WiFi  ← her!",
          color: "fill-brand/25 stroke-brand",
        },
        { y: 150, label: "Fysisk", sub: "kobber, fiber, radio", color: "fill-muted stroke-border" },
      ].map((row) => (
        <g key={row.y}>
          <rect x={40} y={row.y} width={280} height={26} className={row.color} strokeWidth={1.2} />
          <text x={60} y={row.y + 17} className="fill-foreground text-[11px] font-semibold">
            {row.label}
          </text>
          <text x={200} y={row.y + 17} className="fill-muted-foreground text-[10px]">
            {row.sub}
          </text>
        </g>
      ))}
      <text
        x={180}
        y={195}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] italic"
      >
        Link-laget tar IP-datagram fra nettverkslaget og flytter det ÉTT hopp.
      </text>
    </svg>
  );
}

// 6.2 — Paritet-grid (mini)
function ParitetGridMiniSvg() {
  return (
    <svg viewBox="0 0 340 200" className="w-full h-auto" role="img" aria-label="Paritet-grid">
      <text
        x={170}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        2D-paritet: feilen ligger i krysset rad×kolonne
      </text>
      {/* 4×4 grid + parity row + col */}
      {[
        [1, 0, 1, 1, 1],
        [0, 1, 0, 1, 0],
        [1, 1, 1, 0, 1],
        [0, 0, 1, 1, 0],
      ].map((row, ri) =>
        row.map((v, ci) => {
          const flipped = ri === 1 && ci === 2;
          return (
            <g key={`${ri}-${ci}`}>
              <rect
                x={50 + ci * 36}
                y={28 + ri * 28}
                width={32}
                height={24}
                className={
                  flipped
                    ? "fill-destructive/40 stroke-destructive"
                    : ci === 4 || ri === 3
                      ? "fill-amber-500/25 stroke-amber-500"
                      : "fill-card stroke-border"
                }
                strokeWidth={1}
              />
              <text
                x={66 + ci * 36}
                y={45 + ri * 28}
                textAnchor="middle"
                className="fill-foreground text-[11px] font-mono"
              >
                {v}
              </text>
            </g>
          );
        }),
      )}
      {/* col-parity row */}
      {[0, 0, 1, 1, 0].map((v, ci) => (
        <g key={`cp-${ci}`}>
          <rect
            x={50 + ci * 36}
            y={140}
            width={32}
            height={24}
            className={
              ci === 2
                ? "fill-destructive/30 stroke-destructive"
                : "fill-amber-500/25 stroke-amber-500"
            }
            strokeWidth={1}
          />
          <text
            x={66 + ci * 36}
            y={157}
            textAnchor="middle"
            className="fill-foreground text-[11px] font-mono"
          >
            {v}
          </text>
        </g>
      ))}
      {/* arrow markers — rad 2 (ri=1) klager, kol 3 (ci=2) klager */}
      <text x={36} y={73} textAnchor="end" className="fill-destructive text-[10px]">
        klager →
      </text>
      <text x={66 + 2 * 36} y={184} textAnchor="middle" className="fill-destructive text-[10px]">
        ↑ klager
      </text>
      <text x={170} y={196} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Krysset = bit som flippet — flipp tilbake uten retransmisjon.
      </text>
    </svg>
  );
}

// 6.3 — Tre multiple-access-protokoller side-ved-side
function TreProtokollerSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto" role="img" aria-label="Tre protokoller">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Pure ALOHA · Slot ALOHA · CSMA/CD — samme medium, ulik strategi
      </text>
      {[
        {
          x: 20,
          tittel: "Pure ALOHA",
          undertittel: "send når du vil",
          maks: "18 %",
          farge: "destructive",
        },
        {
          x: 180,
          tittel: "Slot ALOHA",
          undertittel: "send på slot-start",
          maks: "37 %",
          farge: "amber-500",
        },
        {
          x: 340,
          tittel: "CSMA/CD",
          undertittel: "lytt før send",
          maks: "80–90 %",
          farge: "success",
        },
      ].map((col) => (
        <g key={col.tittel}>
          <rect
            x={col.x}
            y={30}
            width={140}
            height={170}
            rx={6}
            className={`fill-${col.farge}/5 stroke-${col.farge}`}
            strokeWidth={1.2}
          />
          <text
            x={col.x + 70}
            y={50}
            textAnchor="middle"
            className="fill-foreground text-[11px] font-semibold"
          >
            {col.tittel}
          </text>
          <text
            x={col.x + 70}
            y={66}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px]"
          >
            {col.undertittel}
          </text>
        </g>
      ))}
      {/* Pure ALOHA timelines */}
      <line x1={30} y1={130} x2={150} y2={130} className="stroke-foreground/60" />
      <rect
        x={50}
        y={80}
        width={40}
        height={14}
        className="fill-brand/40 stroke-brand"
        strokeWidth={1}
      />
      <rect
        x={75}
        y={100}
        width={40}
        height={14}
        className="fill-destructive/40 stroke-destructive"
        strokeWidth={1}
      />
      <text x={90} y={154} textAnchor="middle" className="fill-destructive text-[9px]">
        kollisjon
      </text>
      <text x={90} y={170} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        ingen lytting
      </text>
      <text
        x={90}
        y={188}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        maks 18 %
      </text>

      {/* Slot ALOHA timelines (slot-grenser) */}
      <line x1={190} y1={130} x2={310} y2={130} className="stroke-foreground/60" />
      {[200, 230, 260, 290].map((sx) => (
        <line
          key={sx}
          x1={sx}
          y1={75}
          x2={sx}
          y2={130}
          className="stroke-muted-foreground/40"
          strokeDasharray="2 2"
        />
      ))}
      <rect
        x={200}
        y={80}
        width={30}
        height={14}
        className="fill-brand/40 stroke-brand"
        strokeWidth={1}
      />
      <rect
        x={260}
        y={100}
        width={30}
        height={14}
        className="fill-amber-500/40 stroke-amber-500"
        strokeWidth={1}
      />
      <text
        x={250}
        y={154}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[9px]"
      >
        slot-grid
      </text>
      <text x={250} y={170} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        klokke-synk
      </text>
      <text
        x={250}
        y={188}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        maks 37 %
      </text>

      {/* CSMA/CD: lytt, send, kort kollisjon, jam, backoff */}
      <line x1={350} y1={130} x2={470} y2={130} className="stroke-foreground/60" />
      <text x={360} y={95} className="fill-muted-foreground text-[8px]">
        lytt
      </text>
      <rect
        x={380}
        y={80}
        width={50}
        height={14}
        className="fill-success/40 stroke-success"
        strokeWidth={1}
      />
      <rect
        x={425}
        y={100}
        width={10}
        height={14}
        className="fill-destructive/40 stroke-destructive"
        strokeWidth={1}
      />
      <text x={440} y={112} className="fill-destructive text-[8px]">
        jam
      </text>
      <text x={410} y={154} textAnchor="middle" className="fill-success text-[9px]">
        oppdager
      </text>
      <text x={410} y={170} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        binær backoff
      </text>
      <text
        x={410}
        y={188}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        maks 80–90 %
      </text>
    </svg>
  );
}

// 6.4 — ARP-oppslag-flyt (steg-for-steg)
function ArpFlytSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto" role="img" aria-label="ARP-flyt">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        ARP: «hvem har IP X? si til min MAC»
      </text>
      {/* Step 1: PC */}
      <rect
        x={20}
        y={70}
        width={100}
        height={50}
        rx={6}
        className="fill-brand/15 stroke-brand"
        strokeWidth={1.2}
      />
      <text x={70} y={88} textAnchor="middle" className="fill-foreground text-[11px] font-semibold">
        PC
      </text>
      <text x={70} y={102} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        IP 10.0.0.5
      </text>
      <text x={70} y={114} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        MAC AA:01
      </text>
      {/* Switch in middle (cloud) */}
      <ellipse
        cx={250}
        cy={95}
        rx={70}
        ry={32}
        className="fill-muted stroke-border"
        strokeWidth={1.2}
      />
      <text
        x={250}
        y={92}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        LAN
      </text>
      <text x={250} y={108} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        delt broadcast-domene
      </text>
      {/* Skriver right */}
      <rect
        x={380}
        y={70}
        width={100}
        height={50}
        rx={6}
        className="fill-success/15 stroke-success"
        strokeWidth={1.2}
      />
      <text
        x={430}
        y={88}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Skriver
      </text>
      <text x={430} y={102} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        IP 10.0.0.10
      </text>
      <text x={430} y={114} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        MAC BB:02
      </text>
      {/* Arrow 1: broadcast request */}
      <line
        x1={120}
        y1={88}
        x2={180}
        y2={88}
        className="stroke-amber-500"
        strokeWidth={1.8}
        markerEnd="url(#kap6-arrow-arp)"
      />
      <line
        x1={320}
        y1={88}
        x2={380}
        y2={88}
        className="stroke-amber-500"
        strokeWidth={1.8}
        markerEnd="url(#kap6-arrow-arp)"
      />
      <text
        x={250}
        y={56}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[10px] font-semibold"
      >
        1. ARP-request (broadcast FF:FF:…)
      </text>
      <text x={250} y={70} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        «hvem har 10.0.0.10? si til AA:01»
      </text>
      {/* Arrow 2: unicast reply */}
      <line
        x1={380}
        y1={138}
        x2={320}
        y2={138}
        className="stroke-success"
        strokeWidth={1.8}
        markerEnd="url(#kap6-arrow-arp)"
      />
      <line
        x1={180}
        y1={138}
        x2={120}
        y2={138}
        className="stroke-success"
        strokeWidth={1.8}
        markerEnd="url(#kap6-arrow-arp)"
      />
      <text x={250} y={156} textAnchor="middle" className="fill-success text-[10px] font-semibold">
        2. ARP-reply (unicast til AA:01)
      </text>
      <text x={250} y={170} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        «10.0.0.10 er på BB:02»
      </text>
      <text x={250} y={196} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        PC cacher (10.0.0.10 → BB:02) i ~20 min — slipper å spørre igjen.
      </text>
      <defs>
        <marker
          id="kap6-arrow-arp"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,0 L10,5 L0,10 z" className="fill-amber-500" />
        </marker>
      </defs>
    </svg>
  );
}

// 6.5 — Ethernet ramme byte-layout (presis)
function EthernetByteLayoutSvg() {
  return (
    <svg
      viewBox="0 0 540 200"
      className="w-full h-auto"
      role="img"
      aria-label="Ethernet byte-layout"
    >
      <text
        x={270}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Ethernet II-ramme — byte for byte (64–1518 bytes på kabelen)
      </text>
      {[
        { x: 10, w: 60, label: "Preamble", bytes: "8 B", color: "fill-muted stroke-border" },
        { x: 72, w: 60, label: "Dest-MAC", bytes: "6 B", color: "fill-brand/20 stroke-brand" },
        { x: 134, w: 60, label: "Src-MAC", bytes: "6 B", color: "fill-brand/20 stroke-brand" },
        { x: 196, w: 40, label: "Type", bytes: "2 B", color: "fill-amber-500/25 stroke-amber-500" },
        {
          x: 238,
          w: 220,
          label: "Payload (IP-datagram)",
          bytes: "46–1500 B",
          color: "fill-success/20 stroke-success",
        },
        { x: 460, w: 50, label: "FCS", bytes: "4 B", color: "fill-rose-500/20 stroke-rose-500" },
      ].map((f) => (
        <g key={f.label}>
          <rect x={f.x} y={50} width={f.w} height={50} className={f.color} strokeWidth={1.3} />
          <text
            x={f.x + f.w / 2}
            y={70}
            textAnchor="middle"
            className="fill-foreground text-[9.5px] font-semibold"
          >
            {f.label}
          </text>
          <text
            x={f.x + f.w / 2}
            y={86}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px] font-mono"
          >
            {f.bytes}
          </text>
        </g>
      ))}
      {/* CRC dekker */}
      <line x1={72} y1={115} x2={458} y2={115} className="stroke-rose-500" strokeWidth={1.5} />
      <line x1={72} y1={112} x2={72} y2={118} className="stroke-rose-500" strokeWidth={1.5} />
      <line x1={458} y1={112} x2={458} y2={118} className="stroke-rose-500" strokeWidth={1.5} />
      <text
        x={265}
        y={130}
        textAnchor="middle"
        className="fill-rose-600 dark:fill-rose-400 text-[9px]"
      >
        FCS (CRC-32) dekker dest-MAC → payload, ikke preamble
      </text>
      {/* MTU-merke */}
      <text x={345} y={148} textAnchor="middle" className="fill-success text-[9px] font-semibold">
        MTU = 1500 bytes (maks payload)
      </text>
      <text x={345} y={162} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        Min payload = 46 B (slik kollisjon kan rekkes oppdaget før send er ferdig)
      </text>
      <text x={270} y={186} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Type ≥ 0x0600 = EtherType (0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6); ellers lengde.
      </text>
    </svg>
  );
}

// 6.6 — VLAN trunk + access-porter
function VlanTrunkSvg() {
  return (
    <svg
      viewBox="0 0 520 220"
      className="w-full h-auto"
      role="img"
      aria-label="VLAN trunk og access"
    >
      <text
        x={260}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Access-porter strippe tag, trunk-porter bærer tags
      </text>
      {/* Switch A */}
      <rect
        x={70}
        y={70}
        width={120}
        height={50}
        rx={6}
        className="fill-card stroke-foreground/40"
        strokeWidth={1.3}
      />
      <text
        x={130}
        y={88}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Switch A
      </text>
      <text x={130} y={102} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        VLAN 10 (HR), VLAN 20 (gjest)
      </text>
      {/* Switch B */}
      <rect
        x={330}
        y={70}
        width={120}
        height={50}
        rx={6}
        className="fill-card stroke-foreground/40"
        strokeWidth={1.3}
      />
      <text
        x={390}
        y={88}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Switch B
      </text>
      <text x={390} y={102} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        VLAN 10 (HR), VLAN 20 (gjest)
      </text>
      {/* Trunk link */}
      <line x1={190} y1={95} x2={330} y2={95} className="stroke-amber-500" strokeWidth={2.5} />
      <text
        x={260}
        y={88}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[10px] font-semibold"
      >
        TRUNK
      </text>
      <text x={260} y={110} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        tagged VLAN 10 + 20
      </text>

      {/* Access-porter på A */}
      <g>
        <line x1={100} y1={120} x2={80} y2={160} className="stroke-brand" strokeWidth={1.5} />
        <line x1={130} y1={120} x2={130} y2={160} className="stroke-rose-500" strokeWidth={1.5} />
        <rect
          x={60}
          y={162}
          width={40}
          height={28}
          rx={3}
          className="fill-brand/20 stroke-brand"
          strokeWidth={1}
        />
        <text x={80} y={180} textAnchor="middle" className="fill-foreground text-[10px]">
          HR-PC
        </text>
        <rect
          x={110}
          y={162}
          width={40}
          height={28}
          rx={3}
          className="fill-rose-500/20 stroke-rose-500"
          strokeWidth={1}
        />
        <text x={130} y={180} textAnchor="middle" className="fill-foreground text-[10px]">
          Gjest
        </text>
        <text x={80} y={205} textAnchor="middle" className="fill-brand text-[9px]">
          access VLAN 10
        </text>
        <text x={130} y={205} textAnchor="middle" className="fill-rose-500 text-[9px]">
          access VLAN 20
        </text>
      </g>
      {/* Access-porter på B */}
      <g>
        <line x1={360} y1={120} x2={350} y2={160} className="stroke-brand" strokeWidth={1.5} />
        <line x1={420} y1={120} x2={430} y2={160} className="stroke-rose-500" strokeWidth={1.5} />
        <rect
          x={330}
          y={162}
          width={40}
          height={28}
          rx={3}
          className="fill-brand/20 stroke-brand"
          strokeWidth={1}
        />
        <text x={350} y={180} textAnchor="middle" className="fill-foreground text-[10px]">
          HR-PC
        </text>
        <rect
          x={410}
          y={162}
          width={40}
          height={28}
          rx={3}
          className="fill-rose-500/20 stroke-rose-500"
          strokeWidth={1}
        />
        <text x={430} y={180} textAnchor="middle" className="fill-foreground text-[10px]">
          Gjest
        </text>
        <text x={350} y={205} textAnchor="middle" className="fill-brand text-[9px]">
          access VLAN 10
        </text>
        <text x={430} y={205} textAnchor="middle" className="fill-rose-500 text-[9px]">
          access VLAN 20
        </text>
      </g>
      {/* Tag-bobler over trunk */}
      <rect
        x={210}
        y={50}
        width={40}
        height={14}
        rx={2}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1}
      />
      <text x={230} y={61} textAnchor="middle" className="fill-foreground text-[8px] font-mono">
        VID=10
      </text>
      <rect
        x={270}
        y={50}
        width={40}
        height={14}
        rx={2}
        className="fill-rose-500/30 stroke-rose-500"
        strokeWidth={1}
      />
      <text x={290} y={61} textAnchor="middle" className="fill-foreground text-[8px] font-mono">
        VID=20
      </text>
    </svg>
  );
}

// 6.7 — Fat-tree / leaf-spine / 3-tier kompakt i én SVG
function DcTopologierSvg() {
  return (
    <svg
      viewBox="0 0 540 230"
      className="w-full h-auto"
      role="img"
      aria-label="Datasenter-topologier"
    >
      <text
        x={270}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Tre datasenter-topologier i samme skala
      </text>
      {/* 3-tier */}
      <text
        x={90}
        y={36}
        textAnchor="middle"
        className="fill-destructive text-[10px] font-semibold uppercase"
      >
        3-tier
      </text>
      <rect
        x={75}
        y={45}
        width={30}
        height={14}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1}
      />
      <text x={90} y={56} textAnchor="middle" className="fill-foreground text-[8px]">
        core
      </text>
      {[60, 110].map((x) => (
        <rect
          key={x}
          x={x}
          y={88}
          width={20}
          height={12}
          className="fill-amber-500/30 stroke-amber-500"
          strokeWidth={1}
        />
      ))}
      <text x={90} y={110} textAnchor="middle" className="fill-foreground text-[8px]">
        agg agg
      </text>
      {[45, 80, 110, 140].map((x) => (
        <rect
          key={x}
          x={x}
          y={125}
          width={16}
          height={12}
          className="fill-success/30 stroke-success"
          strokeWidth={1}
        />
      ))}
      <line x1={90} y1={59} x2={70} y2={88} className="stroke-foreground/40" />
      <line x1={90} y1={59} x2={120} y2={88} className="stroke-foreground/40" />
      <line x1={70} y1={100} x2={53} y2={125} className="stroke-foreground/40" />
      <line x1={70} y1={100} x2={88} y2={125} className="stroke-foreground/40" />
      <line x1={120} y1={100} x2={118} y2={125} className="stroke-foreground/40" />
      <line x1={120} y1={100} x2={148} y2={125} className="stroke-foreground/40" />
      <text
        x={90}
        y={160}
        textAnchor="middle"
        className="fill-destructive text-[9px] font-semibold"
      >
        opp 3 hopp
      </text>
      <text x={90} y={174} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        trang nakke
      </text>

      {/* Leaf-spine */}
      <text
        x={270}
        y={36}
        textAnchor="middle"
        className="fill-amber-600 dark:fill-amber-400 text-[10px] font-semibold uppercase"
      >
        Leaf-spine
      </text>
      {[230, 270, 310].map((x) => (
        <rect
          key={x}
          x={x}
          y={50}
          width={20}
          height={14}
          className="fill-brand/30 stroke-brand"
          strokeWidth={1}
        />
      ))}
      <text x={270} y={73} textAnchor="middle" className="fill-foreground text-[8px]">
        3 spine
      </text>
      {[220, 260, 300].map((x) => (
        <rect
          key={x}
          x={x}
          y={120}
          width={20}
          height={14}
          className="fill-success/30 stroke-success"
          strokeWidth={1}
        />
      ))}
      <text x={270} y={148} textAnchor="middle" className="fill-foreground text-[8px]">
        3 leaf
      </text>
      {[230, 270, 310].map((sx) =>
        [230, 270, 310].map((lx) => (
          <line
            key={`${sx}-${lx}`}
            x1={sx + 10}
            y1={64}
            x2={lx + 0}
            y2={120}
            className="stroke-foreground/35"
            strokeWidth={0.7}
          />
        )),
      )}
      <text x={270} y={170} textAnchor="middle" className="fill-success text-[9px] font-semibold">
        2 hopp, full mesh
      </text>
      <text x={270} y={184} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        ECMP fordeler
      </text>

      {/* Fat-tree (k=4 forenklet) */}
      <text
        x={450}
        y={36}
        textAnchor="middle"
        className="fill-success text-[10px] font-semibold uppercase"
      >
        Fat-tree (k=4)
      </text>
      {[395, 420, 445, 470, 495].map((x, i) => (
        <rect
          key={i}
          x={x}
          y={45}
          width={16}
          height={10}
          className="fill-brand/30 stroke-brand"
          strokeWidth={0.8}
        />
      ))}
      <text x={445} y={68} textAnchor="middle" className="fill-foreground text-[8px]">
        core
      </text>
      {[395, 425, 460, 490].map((x, i) => (
        <rect
          key={i}
          x={x}
          y={88}
          width={16}
          height={10}
          className="fill-amber-500/30 stroke-amber-500"
          strokeWidth={0.8}
        />
      ))}
      <text x={445} y={108} textAnchor="middle" className="fill-foreground text-[8px]">
        agg
      </text>
      {[395, 425, 460, 490].map((x, i) => (
        <rect
          key={i}
          x={x}
          y={125}
          width={16}
          height={10}
          className="fill-success/30 stroke-success"
          strokeWidth={0.8}
        />
      ))}
      <text x={445} y={148} textAnchor="middle" className="fill-foreground text-[8px]">
        edge
      </text>
      {/* mesh (sparse) */}
      {[395, 425, 460, 490].map((ax) =>
        [395, 420, 445, 470, 495].map((cx, i) => (
          <line
            key={`${ax}-${i}`}
            x1={ax + 8}
            y1={88}
            x2={cx + 8}
            y2={55}
            className="stroke-foreground/30"
            strokeWidth={0.5}
          />
        )),
      )}
      {[395, 425, 460, 490].map((x) => (
        <line
          key={x}
          x1={x + 8}
          y1={98}
          x2={x + 8}
          y2={125}
          className="stroke-foreground/40"
          strokeWidth={0.7}
        />
      ))}
      <text x={445} y={170} textAnchor="middle" className="fill-success text-[9px] font-semibold">
        full bisection
      </text>
      <text x={445} y={184} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        k³/4 servere
      </text>

      <text x={270} y={216} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Klassisk 3-tier tvinger trafikk gjennom core. Leaf-spine og fat-tree gir mange parallelle
        stier.
      </text>
    </svg>
  );
}

// 6.9 cheat — Ethernet byte (kompakt)
function EthernetCheatSvg() {
  return (
    <svg
      viewBox="0 0 520 110"
      className="w-full h-auto"
      role="img"
      aria-label="Ethernet cheat byte"
    >
      {[
        { x: 10, w: 56, label: "Preamble", b: "8" },
        { x: 70, w: 70, label: "Dest-MAC", b: "6" },
        { x: 144, w: 70, label: "Src-MAC", b: "6" },
        { x: 218, w: 36, label: "Type", b: "2" },
        { x: 258, w: 200, label: "Payload", b: "46–1500" },
        { x: 462, w: 48, label: "FCS", b: "4" },
      ].map((f, i) => (
        <g key={i}>
          <rect
            x={f.x}
            y={20}
            width={f.w}
            height={42}
            className={
              [
                "fill-muted stroke-border",
                "fill-brand/20 stroke-brand",
                "fill-brand/20 stroke-brand",
                "fill-amber-500/25 stroke-amber-500",
                "fill-success/20 stroke-success",
                "fill-rose-500/20 stroke-rose-500",
              ][i]
            }
            strokeWidth={1.2}
          />
          <text
            x={f.x + f.w / 2}
            y={37}
            textAnchor="middle"
            className="fill-foreground text-[9.5px] font-semibold"
          >
            {f.label}
          </text>
          <text
            x={f.x + f.w / 2}
            y={52}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px] font-mono"
          >
            {f.b} B
          </text>
        </g>
      ))}
      <text
        x={260}
        y={80}
        textAnchor="middle"
        className="fill-rose-600 dark:fill-rose-400 text-[9px]"
      >
        FCS (CRC-32) dekker dest-MAC → payload
      </text>
      <text x={260} y={96} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Type ≥ 0x0600 = EtherType (0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6)
      </text>
    </svg>
  );
}

// 6.9 cheat — CRC som divisjon
function CrcDivisjonSvg() {
  return (
    <svg viewBox="0 0 500 170" className="w-full h-auto" role="img" aria-label="CRC divisjon">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        CRC = rest når D · 2ʳ deles på G (mod 2)
      </text>
      {/* divisjon-mock */}
      <text x={50} y={50} className="fill-foreground text-[12px] font-mono">
        D · 2ʳ
      </text>
      <line x1={120} y1={42} x2={120} y2={58} className="stroke-foreground" strokeWidth={1.2} />
      <text x={140} y={50} className="fill-foreground text-[12px] font-mono">
        G
      </text>
      <text x={170} y={50} className="fill-foreground text-[12px] font-mono">
        →
      </text>
      <text x={200} y={50} className="fill-foreground text-[12px] font-mono font-semibold">
        kvotient + REST (r bit)
      </text>
      {/* Eksempel */}
      <text x={50} y={84} className="fill-muted-foreground text-[10px] font-mono">
        D = 101110, r = 3, G = 1001 →
      </text>
      <text x={250} y={84} className="fill-foreground text-[10px] font-mono">
        D·2³ = 101110000
      </text>
      <text x={50} y={102} className="fill-muted-foreground text-[10px] font-mono">
        101110000 ÷ 1001 (XOR) →
      </text>
      <rect
        x={250}
        y={90}
        width={50}
        height={16}
        className="fill-success/30 stroke-success"
        strokeWidth={1}
      />
      <text x={275} y={102} textAnchor="middle" className="fill-foreground text-[10px] font-mono">
        rest = 011
      </text>
      {/* Sendt */}
      <text x={50} y={130} className="fill-foreground text-[10px] font-mono">
        Sender: 101110
      </text>
      <text x={130} y={130} className="fill-success text-[10px] font-mono font-semibold">
        011
      </text>
      <text x={150} y={130} className="fill-muted-foreground text-[10px]">
        (data fulgt av CRC)
      </text>
      <text x={250} y={155} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Mottaker deler hele strengen på G; rest = 0 ⇒ feilfri. Ellers droppes rammen.
      </text>
    </svg>
  );
}

// 6.9 cheat — ALOHA throughput-kurve
function AlohaKurveSvg() {
  // S_pure(G) = G * e^(-2G); S_slot(G) = G * e^(-G)
  // sample 30 points G in [0, 3]
  const pts = (slot: boolean) => {
    const arr: string[] = [];
    for (let i = 0; i <= 30; i++) {
      const G = (i / 30) * 3;
      const S = slot ? G * Math.exp(-G) : G * Math.exp(-2 * G);
      const x = 50 + (G / 3) * 380;
      const y = 170 - S * 350;
      arr.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return arr.join(" ");
  };
  return (
    <svg
      viewBox="0 0 460 200"
      className="w-full h-auto"
      role="img"
      aria-label="ALOHA throughput-kurve"
    >
      <text
        x={230}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Throughput S(G): pure ALOHA vs slotted ALOHA
      </text>
      {/* akser */}
      <line x1={50} y1={170} x2={440} y2={170} className="stroke-foreground/60" />
      <line x1={50} y1={30} x2={50} y2={170} className="stroke-foreground/60" />
      <text x={245} y={188} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        offered load G
      </text>
      <text x={40} y={100} textAnchor="end" className="fill-muted-foreground text-[10px]">
        S(G)
      </text>
      {/* topp-merker */}
      <line
        x1={50 + (1 / 3) * 380}
        y1={30}
        x2={50 + (1 / 3) * 380}
        y2={170}
        className="stroke-muted-foreground/30"
        strokeDasharray="2 2"
      />
      <text
        x={50 + (1 / 3) * 380}
        y={186}
        textAnchor="middle"
        className="fill-muted-foreground text-[9px]"
      >
        G=1
      </text>
      {/* 37 % linje */}
      <line
        x1={50}
        y1={170 - 0.368 * 350}
        x2={440}
        y2={170 - 0.368 * 350}
        className="stroke-amber-500/40"
        strokeDasharray="3 3"
      />
      <text
        x={444}
        y={170 - 0.368 * 350 + 4}
        className="fill-amber-700 dark:fill-amber-400 text-[9px]"
      >
        1/e ≈ 37 %
      </text>
      {/* 18 % linje */}
      <line
        x1={50}
        y1={170 - 0.184 * 350}
        x2={440}
        y2={170 - 0.184 * 350}
        className="stroke-rose-500/40"
        strokeDasharray="3 3"
      />
      <text
        x={444}
        y={170 - 0.184 * 350 + 4}
        className="fill-rose-600 dark:fill-rose-400 text-[9px]"
      >
        1/(2e) ≈ 18 %
      </text>
      {/* kurver */}
      <polyline points={pts(true)} className="fill-none stroke-amber-500" strokeWidth={1.8} />
      <polyline points={pts(false)} className="fill-none stroke-rose-500" strokeWidth={1.8} />
      {/* legend */}
      <rect x={60} y={36} width={10} height={3} className="fill-amber-500" />
      <text x={75} y={40} className="fill-foreground text-[9px]">
        slotted (S = G·e⁻ᴳ)
      </text>
      <rect x={60} y={50} width={10} height={3} className="fill-rose-500" />
      <text x={75} y={54} className="fill-foreground text-[9px]">
        pure (S = G·e⁻²ᴳ)
      </text>
    </svg>
  );
}

// 6.9 cheat — CSMA/CD timeline
function CsmaCdTimelineSvg() {
  return (
    <svg viewBox="0 0 540 180" className="w-full h-auto" role="img" aria-label="CSMA/CD timeline">
      <text
        x={270}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        CSMA/CD: lytt → send → kollisjon → jam → backoff → prøv igjen
      </text>
      <line x1={20} y1={100} x2={520} y2={100} className="stroke-foreground/60" />
      <polygon points="520,100 514,96 514,104" className="fill-foreground/60" />
      <text x={525} y={104} className="fill-muted-foreground text-[10px]">
        t
      </text>
      {/* 1. lytt */}
      <rect
        x={30}
        y={70}
        width={60}
        height={26}
        rx={3}
        className="fill-muted stroke-border"
        strokeWidth={1}
      />
      <text x={60} y={86} textAnchor="middle" className="fill-foreground text-[9px]">
        1. lytt
      </text>
      {/* 2. send */}
      <rect
        x={95}
        y={70}
        width={120}
        height={26}
        rx={3}
        className="fill-success/30 stroke-success"
        strokeWidth={1}
      />
      <text x={155} y={86} textAnchor="middle" className="fill-foreground text-[9px]">
        2. sender ramme
      </text>
      {/* annens ramme overlap */}
      <rect
        x={170}
        y={50}
        width={70}
        height={20}
        rx={3}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1}
      />
      <text x={205} y={64} textAnchor="middle" className="fill-foreground text-[9px]">
        nabos sending
      </text>
      {/* 3. kollisjon */}
      <rect
        x={195}
        y={70}
        width={20}
        height={26}
        className="fill-destructive/40 stroke-destructive"
        strokeWidth={1}
      />
      <text
        x={205}
        y={120}
        textAnchor="middle"
        className="fill-destructive text-[9px] font-semibold"
      >
        3. kollisjon!
      </text>
      {/* 4. jam */}
      <rect
        x={218}
        y={70}
        width={28}
        height={26}
        className="fill-amber-500/40 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={232} y={86} textAnchor="middle" className="fill-foreground text-[8px]">
        4. jam
      </text>
      {/* 5. backoff (tom periode) */}
      <line
        x1={250}
        y1={83}
        x2={370}
        y2={83}
        className="stroke-muted-foreground/60"
        strokeDasharray="4 3"
      />
      <text x={310} y={75} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        5. backoff K·512 bt
      </text>
      <text x={310} y={120} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        K ∈ {`{0..2^min(n,10)−1}`}
      </text>
      {/* 6. prøv igjen */}
      <rect
        x={375}
        y={70}
        width={110}
        height={26}
        rx={3}
        className="fill-success/30 stroke-success"
        strokeWidth={1}
      />
      <text x={430} y={86} textAnchor="middle" className="fill-foreground text-[9px]">
        6. prøv på nytt
      </text>
      <text x={270} y={148} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Etter 16 mislykkede forsøk: gi opp, rapporter feil oppover.
      </text>
      <text x={270} y={164} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        IFG (96 bt) mellom rammer; min-ramme 64 B sikrer at kollisjon rekker å oppdages.
      </text>
    </svg>
  );
}

// 6.9 cheat — VLAN-tag 4-byte detalj
function VlanTagCheatSvg() {
  return (
    <svg viewBox="0 0 520 130" className="w-full h-auto" role="img" aria-label="VLAN-tag detalj">
      <text
        x={260}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        802.1Q-tag: 4 bytes (32 bit) settes inn etter src-MAC
      </text>
      {/* TPID 16 bit */}
      <rect
        x={20}
        y={30}
        width={200}
        height={50}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1.3}
      />
      <text
        x={120}
        y={50}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        TPID
      </text>
      <text x={120} y={65} textAnchor="middle" className="fill-foreground text-[10px] font-mono">
        16 bit
      </text>
      <text
        x={120}
        y={78}
        textAnchor="middle"
        className="fill-muted-foreground text-[9px] font-mono"
      >
        0x8100
      </text>
      {/* PCP 3 bit */}
      <rect
        x={222}
        y={30}
        width={70}
        height={50}
        className="fill-amber-500/25 stroke-amber-500"
        strokeWidth={1.3}
      />
      <text
        x={257}
        y={50}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        PCP
      </text>
      <text x={257} y={65} textAnchor="middle" className="fill-foreground text-[10px] font-mono">
        3 bit
      </text>
      <text x={257} y={78} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        prio 0–7
      </text>
      {/* DEI 1 bit */}
      <rect
        x={294}
        y={30}
        width={40}
        height={50}
        className="fill-rose-500/25 stroke-rose-500"
        strokeWidth={1.3}
      />
      <text
        x={314}
        y={50}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        DEI
      </text>
      <text x={314} y={65} textAnchor="middle" className="fill-foreground text-[10px] font-mono">
        1 bit
      </text>
      {/* VID 12 bit */}
      <rect
        x={336}
        y={30}
        width={170}
        height={50}
        className="fill-success/25 stroke-success"
        strokeWidth={1.3}
      />
      <text
        x={421}
        y={50}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        VID — VLAN-ID
      </text>
      <text x={421} y={65} textAnchor="middle" className="fill-foreground text-[10px] font-mono">
        12 bit
      </text>
      <text x={421} y={78} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        0–4095 (4094 brukbare)
      </text>
      <text x={260} y={104} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        TPID 0x8100 forteller switchen «her kommer en VLAN-tag». PCP gir QoS-prioritet, DEI markerer
        drop-first.
      </text>
    </svg>
  );
}

// 6.9 cheat — switch self-learning MAC-tabell oppdatering
function SwitchMacOppdateringSvg() {
  return (
    <svg
      viewBox="0 0 540 220"
      className="w-full h-auto"
      role="img"
      aria-label="MAC-tabell oppdatering"
    >
      <text
        x={270}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Self-learning: src-MAC + inn-port → tabell, dst-MAC → port-oppslag
      </text>
      {/* Switch i midten */}
      <rect
        x={210}
        y={50}
        width={120}
        height={70}
        rx={6}
        className="fill-card stroke-foreground/40"
        strokeWidth={1.3}
      />
      <text
        x={270}
        y={70}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Switch
      </text>
      <text x={270} y={85} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        port 1, 2, 3, 4
      </text>
      <text x={270} y={105} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        tabell oppdateres
      </text>
      {/* Rammen kommer inn */}
      <rect
        x={50}
        y={70}
        width={130}
        height={28}
        rx={3}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1.2}
      />
      <text x={115} y={86} textAnchor="middle" className="fill-foreground text-[10px] font-mono">
        src=X | dst=Y
      </text>
      <line
        x1={180}
        y1={84}
        x2={210}
        y2={84}
        className="stroke-brand"
        strokeWidth={1.5}
        markerEnd="url(#kap6-arrow-tbl)"
      />
      <text x={195} y={66} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        port 1
      </text>
      {/* Etter rammen — tabellen */}
      <text
        x={400}
        y={42}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold uppercase tracking-wider"
      >
        MAC-tabell etter rammen
      </text>
      <rect
        x={350}
        y={50}
        width={170}
        height={26}
        className="fill-muted stroke-border"
        strokeWidth={1}
      />
      <text x={365} y={68} className="fill-foreground text-[9.5px] font-mono font-semibold">
        MAC
      </text>
      <text x={430} y={68} className="fill-foreground text-[9.5px] font-mono font-semibold">
        port
      </text>
      <text x={485} y={68} className="fill-foreground text-[9.5px] font-mono font-semibold">
        alder
      </text>
      <rect
        x={350}
        y={76}
        width={170}
        height={22}
        className="fill-success/15 stroke-success"
        strokeWidth={1}
      />
      <text x={365} y={91} className="fill-foreground text-[10px] font-mono">
        X
      </text>
      <text x={430} y={91} className="fill-foreground text-[10px] font-mono">
        1
      </text>
      <text x={485} y={91} className="fill-foreground text-[10px] font-mono">
        0 s
      </text>
      <text x={520} y={91} className="fill-success text-[10px] font-semibold">
        ← ny
      </text>
      <rect
        x={350}
        y={98}
        width={170}
        height={22}
        className="fill-card stroke-border"
        strokeWidth={1}
      />
      <text x={365} y={113} className="fill-muted-foreground text-[10px] font-mono">
        (Y mangler)
      </text>
      <text x={430} y={113} className="fill-muted-foreground text-[10px] font-mono">
        ?
      </text>
      <text x={485} y={113} className="fill-muted-foreground text-[10px]">
        flood
      </text>
      {/* Forwarding-resultat */}
      <text
        x={270}
        y={150}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Resultat: lær X→1, flood Y ut alle porter unntatt port 1
      </text>
      {[330, 390, 450].map((x, i) => (
        <g key={i}>
          <line x1={x} y1={120} x2={x} y2={172} className="stroke-foreground/40" />
          <rect
            x={x - 12}
            y={172}
            width={24}
            height={20}
            className="fill-amber-500/20 stroke-amber-500"
            strokeWidth={1}
          />
          <text x={x} y={186} textAnchor="middle" className="fill-foreground text-[9px]">
            p{i + 2}
          </text>
        </g>
      ))}
      <text x={270} y={210} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Timeout typisk 300 sek — eldre entries slettes hvis MAC-en blir taus.
      </text>
      <defs>
        <marker
          id="kap6-arrow-tbl"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,0 L10,5 L0,10 z" className="fill-brand" />
        </marker>
      </defs>
    </svg>
  );
}

// 6.9 — Tre protokoller side-ved-side tidslinjer
function TreSporTidslinjeSvg() {
  return (
    <svg
      viewBox="0 0 540 230"
      className="w-full h-auto"
      role="img"
      aria-label="Tre protokoll-tidslinjer"
    >
      <text
        x={270}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        ALOHA · CSMA/CD · CSMA/CA på samme tidsakse
      </text>
      {/* tre rader */}
      {[
        { y: 40, navn: "ALOHA", ekstra: "ingen lytting" },
        { y: 105, navn: "CSMA/CD", ekstra: "lytt + oppdag" },
        { y: 170, navn: "CSMA/CA", ekstra: "lytt + unngå" },
      ].map((row) => (
        <g key={row.navn}>
          <text x={10} y={row.y + 18} className="fill-foreground text-[10px] font-semibold">
            {row.navn}
          </text>
          <text x={10} y={row.y + 32} className="fill-muted-foreground text-[9px]">
            {row.ekstra}
          </text>
          <line x1={80} y1={row.y + 28} x2={520} y2={row.y + 28} className="stroke-foreground/50" />
        </g>
      ))}
      {/* ALOHA — A og B ramme overlapper, ingen lytt */}
      <rect
        x={120}
        y={42}
        width={70}
        height={18}
        className="fill-brand/40 stroke-brand"
        strokeWidth={1}
      />
      <rect
        x={170}
        y={62}
        width={70}
        height={18}
        className="fill-rose-500/40 stroke-rose-500"
        strokeWidth={1}
      />
      <text x={205} y={92} textAnchor="middle" className="fill-destructive text-[9px]">
        kollisjon — ingen vet før ACK uteblir
      </text>

      {/* CSMA/CD — A lytter, sender; B sender, kollisjon, jam, backoff */}
      <rect
        x={90}
        y={108}
        width={20}
        height={18}
        className="fill-muted stroke-border"
        strokeWidth={1}
      />
      <text x={100} y={123} textAnchor="middle" className="fill-foreground text-[8px]">
        lytt
      </text>
      <rect
        x={112}
        y={108}
        width={80}
        height={18}
        className="fill-success/40 stroke-success"
        strokeWidth={1}
      />
      <rect
        x={175}
        y={108}
        width={18}
        height={18}
        className="fill-destructive/40 stroke-destructive"
        strokeWidth={1}
      />
      <rect
        x={195}
        y={108}
        width={22}
        height={18}
        className="fill-amber-500/40 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={206} y={123} textAnchor="middle" className="fill-foreground text-[8px]">
        jam
      </text>
      <line
        x1={220}
        y1={117}
        x2={310}
        y2={117}
        className="stroke-muted-foreground/60"
        strokeDasharray="3 2"
      />
      <text x={265} y={111} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        backoff
      </text>
      <rect
        x={315}
        y={108}
        width={80}
        height={18}
        className="fill-success/40 stroke-success"
        strokeWidth={1}
      />
      <text x={355} y={122} textAnchor="middle" className="fill-foreground text-[8px]">
        retransmit
      </text>
      <text x={270} y={148} textAnchor="middle" className="fill-success text-[9px]">
        oppdager kollisjon underveis, sender jam, prøver igjen
      </text>

      {/* CSMA/CA — DIFS, backoff, sender, SIFS, ACK */}
      <rect
        x={90}
        y={173}
        width={20}
        height={18}
        className="fill-muted stroke-border"
        strokeWidth={1}
      />
      <text x={100} y={188} textAnchor="middle" className="fill-foreground text-[8px]">
        DIFS
      </text>
      <line
        x1={112}
        y1={182}
        x2={170}
        y2={182}
        className="stroke-muted-foreground/60"
        strokeDasharray="3 2"
      />
      <text x={141} y={177} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        random-backoff
      </text>
      <rect
        x={172}
        y={173}
        width={100}
        height={18}
        className="fill-success/40 stroke-success"
        strokeWidth={1}
      />
      <text x={222} y={187} textAnchor="middle" className="fill-foreground text-[8px]">
        data
      </text>
      <rect
        x={274}
        y={173}
        width={20}
        height={18}
        className="fill-muted stroke-border"
        strokeWidth={1}
      />
      <text x={284} y={188} textAnchor="middle" className="fill-foreground text-[8px]">
        SIFS
      </text>
      <rect
        x={296}
        y={173}
        width={40}
        height={18}
        className="fill-brand/40 stroke-brand"
        strokeWidth={1}
      />
      <text x={316} y={187} textAnchor="middle" className="fill-foreground text-[8px]">
        ACK
      </text>
      <text x={336} y={213} textAnchor="start" className="fill-muted-foreground text-[9px] italic">
        Radio kan ikke detektere kollisjon — bruker ACK + RTS/CTS som proxy.
      </text>
    </svg>
  );
}

// 6.9 — 15 visuelle 5-min-anker-kort
function AnkerKortSvg() {
  const items: { title: string; sub: string; color: string }[] = [
    { title: "1 hopp", sub: "link = nabo", color: "brand" },
    { title: "8·6·6·2·payload·4", sub: "Ethernet-bytes", color: "brand" },
    { title: "MAC ≠ IP", sub: "flat vs hierarki", color: "amber-500" },
    { title: "CRC oppdager", sub: "retter ikke", color: "rose-500" },
    { title: "18 % vs 37 %", sub: "pure vs slot", color: "amber-500" },
    { title: "lytt·send·jam·backoff", sub: "CSMA/CD", color: "success" },
    { title: "ACK + RTS/CTS", sub: "CSMA/CA", color: "success" },
    { title: "(MAC, port)", sub: "switch lærer", color: "brand" },
    { title: "switch ≠ ruter", sub: "L2 vs L3", color: "amber-500" },
    { title: "4 B 802.1Q", sub: "TPID|PCP|DEI|VID", color: "brand" },
    { title: "trunk tagger", sub: "access stripper", color: "amber-500" },
    { title: "IP → MAC", sub: "ARP-retning", color: "rose-500" },
    { title: "min 46 B", sub: "kollisjons-deteksjon", color: "amber-500" },
    { title: "leaf-spine 2 hopp", sub: "ECMP", color: "success" },
    { title: "ALOHA<CSMA/CD<CA", sub: "huk én tabell", color: "brand" },
  ];
  return (
    <svg viewBox="0 0 540 320" className="w-full h-auto" role="img" aria-label="Anker-kort">
      <text
        x={270}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        15 visuelle anker — én ramme per nøkkel-fakta
      </text>
      {items.map((it, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const x = 15 + col * 105;
        const y = 30 + row * 90;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={95}
              height={78}
              rx={6}
              className={`fill-${it.color}/10 stroke-${it.color}`}
              strokeWidth={1.2}
            />
            <text
              x={x + 47.5}
              y={y + 14}
              textAnchor="middle"
              className={`fill-${it.color} text-[9px] uppercase tracking-wider font-semibold`}
            >
              #{i + 1}
            </text>
            <text
              x={x + 47.5}
              y={y + 36}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-semibold"
            >
              {it.title}
            </text>
            <text
              x={x + 47.5}
              y={y + 56}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {it.sub}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Fallgruve-illustrasjoner
function MacVsIpVisualSvg() {
  return (
    <svg viewBox="0 0 500 150" className="w-full h-auto" role="img" aria-label="MAC vs IP">
      {/* MAC — fabrikk, lokal */}
      <rect
        x={20}
        y={30}
        width={220}
        height={90}
        rx={6}
        className="fill-amber-500/10 stroke-amber-500"
        strokeWidth={1.2}
      />
      <text
        x={130}
        y={52}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[11px] font-semibold uppercase"
      >
        MAC = lokal, flat
      </text>
      <text x={130} y={72} textAnchor="middle" className="fill-foreground text-[10px] font-mono">
        AA:BB:CC:DD:EE:FF
      </text>
      <text x={130} y={90} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        brent inn på NIC ved produksjon
      </text>
      <text x={130} y={104} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        synlig kun innenfor ett broadcast-domene
      </text>
      <text x={130} y={138} textAnchor="middle" className="fill-foreground text-[9px] italic">
        ≈ fødselsnummer
      </text>
      {/* IP — hierarkisk, global */}
      <rect
        x={260}
        y={30}
        width={220}
        height={90}
        rx={6}
        className="fill-brand/10 stroke-brand"
        strokeWidth={1.2}
      />
      <text
        x={370}
        y={52}
        textAnchor="middle"
        className="fill-brand text-[11px] font-semibold uppercase"
      >
        IP = global, hierarkisk
      </text>
      <text x={370} y={72} textAnchor="middle" className="fill-foreground text-[10px] font-mono">
        10.0.0.5 / 24
      </text>
      <text x={370} y={90} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        endres når host flytter subnett
      </text>
      <text x={370} y={104} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        ruterbar — prefiks gir vei
      </text>
      <text x={370} y={138} textAnchor="middle" className="fill-foreground text-[9px] italic">
        ≈ postadresse
      </text>
    </svg>
  );
}

function SwitchVsRuterVisualSvg() {
  return (
    <svg viewBox="0 0 500 160" className="w-full h-auto" role="img" aria-label="Switch vs ruter">
      {/* Switch — L2 */}
      <rect
        x={20}
        y={20}
        width={220}
        height={120}
        rx={6}
        className="fill-brand/10 stroke-brand"
        strokeWidth={1.3}
      />
      <text
        x={130}
        y={40}
        textAnchor="middle"
        className="fill-brand text-[10px] uppercase font-semibold tracking-wider"
      >
        Switch — Lag 2
      </text>
      <text x={130} y={58} textAnchor="middle" className="fill-foreground text-[10px]">
        slår opp på MAC
      </text>
      <text x={130} y={74} textAnchor="middle" className="fill-foreground text-[10px]">
        broadcast slipper gjennom
      </text>
      <text x={130} y={90} textAnchor="middle" className="fill-foreground text-[10px]">
        plug-and-play (self-learn)
      </text>
      <text x={130} y={106} textAnchor="middle" className="fill-foreground text-[10px]">
        VLAN = lag-2-isolasjon
      </text>
      <text x={130} y={128} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        ser aldri IP-headeren
      </text>
      {/* Ruter — L3 */}
      <rect
        x={260}
        y={20}
        width={220}
        height={120}
        rx={6}
        className="fill-success/10 stroke-success"
        strokeWidth={1.3}
      />
      <text
        x={370}
        y={40}
        textAnchor="middle"
        className="fill-success text-[10px] uppercase font-semibold tracking-wider"
      >
        Ruter — Lag 3
      </text>
      <text x={370} y={58} textAnchor="middle" className="fill-foreground text-[10px]">
        slår opp på IP-prefiks
      </text>
      <text x={370} y={74} textAnchor="middle" className="fill-foreground text-[10px]">
        broadcast STOPPES
      </text>
      <text x={370} y={90} textAnchor="middle" className="fill-foreground text-[10px]">
        bytter MAC-header per hopp
      </text>
      <text x={370} y={106} textAnchor="middle" className="fill-foreground text-[10px]">
        separerer subnett
      </text>
      <text x={370} y={128} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        leverer broadcast-domener
      </text>
    </svg>
  );
}

function VlanIsolasjonVisualSvg() {
  return (
    <svg viewBox="0 0 500 170" className="w-full h-auto" role="img" aria-label="VLAN isolasjon">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        VLAN isolerer broadcast — IKKE sikkerhet uten ACL
      </text>
      {/* 2 VLAN i samme switch */}
      <rect
        x={40}
        y={50}
        width={420}
        height={80}
        rx={6}
        className="fill-card stroke-foreground/40"
        strokeWidth={1.3}
      />
      <text
        x={250}
        y={68}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Switch (samme fysisk boks)
      </text>
      <rect
        x={60}
        y={78}
        width={180}
        height={40}
        rx={4}
        className="fill-brand/15 stroke-brand"
        strokeWidth={1}
      />
      <text
        x={150}
        y={94}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        VLAN 10 — HR
      </text>
      <text x={150} y={108} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        broadcast forblir her
      </text>
      <rect
        x={260}
        y={78}
        width={180}
        height={40}
        rx={4}
        className="fill-rose-500/15 stroke-rose-500"
        strokeWidth={1}
      />
      <text
        x={350}
        y={94}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        VLAN 20 — Gjest
      </text>
      <text x={350} y={108} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        broadcast forblir her
      </text>
      {/* Mellom-vei: ruter med brannmur */}
      <line
        x1={240}
        y1={98}
        x2={260}
        y2={98}
        className="stroke-foreground/30"
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <text
        x={250}
        y={148}
        textAnchor="middle"
        className="fill-rose-700 dark:fill-rose-400 text-[10px] font-semibold"
      >
        Trafikk mellom VLAN går via ruter (L3) — krever ACL/brannmur for sikkerhet
      </text>
      <text x={250} y={162} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        VLAN ≠ kryptografisk separasjon. Misconf'd ruter = full bypass.
      </text>
    </svg>
  );
}

function ArpRetningSvg() {
  return (
    <svg viewBox="0 0 500 130" className="w-full h-auto" role="img" aria-label="ARP-retning">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        ARP er IP → MAC, ikke MAC → IP
      </text>
      {/* Riktig retning */}
      <rect
        x={20}
        y={40}
        width={110}
        height={50}
        rx={6}
        className="fill-brand/15 stroke-brand"
        strokeWidth={1.2}
      />
      <text x={75} y={58} textAnchor="middle" className="fill-foreground text-[10px] font-mono">
        IP 10.0.0.10
      </text>
      <text x={75} y={76} textAnchor="middle" className="fill-foreground text-[9px]">
        (jeg har dette)
      </text>
      <line
        x1={140}
        y1={65}
        x2={220}
        y2={65}
        className="stroke-success"
        strokeWidth={2}
        markerEnd="url(#kap6-arrow-arp-dir)"
      />
      <text x={180} y={58} textAnchor="middle" className="fill-success text-[10px] font-semibold">
        ARP
      </text>
      <text x={180} y={80} textAnchor="middle" className="fill-success text-[9px]">
        finn MAC til denne IP
      </text>
      <rect
        x={230}
        y={40}
        width={110}
        height={50}
        rx={6}
        className="fill-success/15 stroke-success"
        strokeWidth={1.2}
      />
      <text x={285} y={58} textAnchor="middle" className="fill-foreground text-[10px] font-mono">
        MAC BB:02
      </text>
      <text x={285} y={76} textAnchor="middle" className="fill-foreground text-[9px]">
        (svar)
      </text>
      {/* Feil retning */}
      <line
        x1={360}
        y1={65}
        x2={460}
        y2={65}
        className="stroke-destructive"
        strokeWidth={2}
        strokeDasharray="4 3"
        markerEnd="url(#kap6-arrow-arp-dir-x)"
      />
      <text
        x={410}
        y={58}
        textAnchor="middle"
        className="fill-destructive text-[10px] font-semibold"
      >
        IKKE ARP
      </text>
      <text x={410} y={80} textAnchor="middle" className="fill-destructive text-[9px]">
        (motsatt = RARP, deprecated)
      </text>
      <text x={250} y={114} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Du kjenner IP-en — trenger MAC for å bygge link-lag-headeren. Ikke omvendt.
      </text>
      <defs>
        <marker
          id="kap6-arrow-arp-dir"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,0 L10,5 L0,10 z" className="fill-success" />
        </marker>
        <marker
          id="kap6-arrow-arp-dir-x"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,0 L10,5 L0,10 z" className="fill-destructive" />
        </marker>
      </defs>
    </svg>
  );
}

// ============================================================
// 6.9 — Eksamen-fokus
// ============================================================
function SectionEksamen() {
  return (
    <article className="space-y-5 text-sm">
      <Header num="Eksamen" title="Eksamen-fokus — komprimert oppsummering av kap. 6" />

      <p className="text-muted-foreground">
        Denne delen er ikke ny lærdom — det er den siste passet over stoffet før du går inn til
        eksamen. Cheat-sheetet samler tall og formler du må kunne i søvne, sammenligning-tabellen
        gir deg språket for å skille like protokoller, beslutningstreet hjelper deg å begrunne
        valgene, fallgruvene fanger feil sensor ser igjen og igjen, og 5-minutter-ankeret er det
        siste du leser før du går inn i salen.
      </p>

      {/* ---------- a) Cheat sheet ---------- */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <span className="inline-block w-1.5 h-5 bg-brand rounded" /> a) Cheat sheet
        </h3>

        <Cheat
          tittel="Ethernet-ramme (IEEE 802.3, totalt 64–1518 bytes uten VLAN)"
          body={
            <div className="space-y-2">
              <EthernetCheatSvg />
              <div className="font-mono text-[11px] overflow-x-auto whitespace-nowrap rounded bg-muted/30 p-2">
                | Preamble 8B | Dest-MAC 6B | Src-MAC 6B | Type/Len 2B | Payload 46–1500B | FCS 4B |
              </div>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>
                  <b>Preamble</b> (8 bytes): 7 × <code>0xAA</code> + 1 × <code>0xAB</code> (SFD) —
                  klokke-synk, regnes ikke i ramme-lengden.
                </li>
                <li>
                  <b>Dest- og src-MAC</b> (6+6 bytes): 48-bit fysisk adresse, første 3 bytes er OUI
                  (organisasjons-prefix).
                </li>
                <li>
                  <b>Type/Length</b> (2 bytes): &gt; 0x0600 = EtherType (0x0800 = IPv4, 0x0806 =
                  ARP, 0x86DD = IPv6), ellers lengde.
                </li>
                <li>
                  <b>Payload</b>: minimum 46 bytes (pad ved behov) for å garantere
                  kollisjons-deteksjon, maks 1500 bytes (MTU).
                </li>
                <li>
                  <b>FCS</b> (4 bytes): CRC-32 over alt mellom dest-MAC og payload. Feil FCS → ramme
                  droppes lydløst, ingen retransmisjon på link-laget.
                </li>
              </ul>
            </div>
          }
        />

        <Cheat
          tittel="CRC — Cyclic Redundancy Check"
          body={
            <>
              <CrcDivisjonSvg />
              <ul className="list-disc pl-5 space-y-0.5">
                <li>
                  Sender og mottaker er enige om et <b>generator-polynom</b> G(x) med r+1 bits.
                  Ethernet bruker CRC-32: G(x) = x³² + x²⁶ + … + 1.
                </li>
                <li>
                  Sender legger til r null-bits bak data D, regner D·2ʳ mod G, og bruker resten R
                  som FCS. Sendt = D fulgt av R.
                </li>
                <li>
                  Mottaker deler (D·2ʳ + R) på G — hvis rest = 0, antas rammen feilfri. Ellers
                  droppes den.
                </li>
                <li>
                  Fanger 100 % av enkelt-bit-feil, alle dobbel-bit-feil hvis G har minst tre 1-bit,
                  og alle burst-feil ≤ r bits.
                </li>
                <li>
                  Eksempel-regnestykke: D = 101110, G = 1001, r = 3 → D·2³ = 101110000, regner
                  modulo G med XOR-divisjon → R = 011 → sendt = 101110<u>011</u>.
                </li>
              </ul>
            </>
          }
        />

        <Cheat
          tittel="ALOHA — teoretisk max throughput"
          body={
            <>
              <AlohaKurveSvg />
              <ul className="list-disc pl-5 space-y-0.5">
                <li>
                  <b>Pure (uslottet) ALOHA</b>: send når du har data, uten å lytte. Rammen ødelegges
                  hvis noen sender i et 2T-vindu rundt. Max effektivitet ={" "}
                  <code>1/(2e) ≈ 0,184 = 18 %</code>.
                </li>
                <li>
                  <b>Slotted ALOHA</b>: alle sender bare på tidsluke-grenser. Sårbart vindu halveres
                  fra 2T til T. Max effektivitet = <code>1/e ≈ 0,368 = 37 %</code>.
                </li>
                <li>
                  Slot ALOHA er <em>dobbelt</em> så effektiv som pure ALOHA — den eneste forskjellen
                  er at klokken er synkronisert.
                </li>
                <li>
                  Optimal last per slot er G = 1: én ramme i snitt per slot. P(suksess) = G·e⁻ᴳ
                  maksimeres her.
                </li>
              </ul>
            </>
          }
        />

        <Cheat
          tittel="CSMA/CD — Carrier Sense Multiple Access with Collision Detection"
          body={
            <>
              <CsmaCdTimelineSvg />
              <ol className="list-decimal pl-5 space-y-0.5">
                <li>
                  <b>Lytt</b> (carrier sense): hvis mediet er ledig, gå til 2. Hvis opptatt, vent
                  til ledig + IFG (inter-frame gap, 96 bit-tider).
                </li>
                <li>
                  <b>Send</b> hele rammen mens du fortsetter å lytte.
                </li>
                <li>
                  <b>Kollisjons-deteksjon</b>: oppdager du annens signal samtidig som ditt eget?
                  Avbryt umiddelbart.
                </li>
                <li>
                  <b>Jam</b>: send 48-bit jam-signal slik at alle andre også oppdager kollisjonen.
                </li>
                <li>
                  <b>Binary exponential backoff</b>: efter k-te kollisjon, velg tilfeldig K ∈ {"{"}
                  0, 1, …, 2^min(k,10)-1{"}"}, vent K·512 bit-tider, og prøv igjen fra steg 1.
                </li>
                <li>Etter 16 mislykkede forsøk: gi opp, rapport feil oppover.</li>
              </ol>
            </>
          }
        />

        <Cheat
          tittel="VLAN-tag — IEEE 802.1Q (4 bytes settes inn etter src-MAC)"
          body={
            <div className="space-y-2">
              <VlanTagCheatSvg />
              <div className="font-mono text-[11px] overflow-x-auto whitespace-nowrap rounded bg-muted/30 p-2">
                | TPID 16b (0x8100) | PCP 3b | DEI 1b | VID 12b |
              </div>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>
                  <b>TPID</b> (Tag Protocol Identifier): fast 0x8100 — forteller switchen «her
                  kommer en VLAN-tag».
                </li>
                <li>
                  <b>PCP</b> (Priority Code Point, 3 bits): 0–7 prioritetsklasser (QoS, 802.1p).
                </li>
                <li>
                  <b>DEI</b> (Drop Eligible Indicator, 1 bit): 1 = «kast meg først ved
                  overbelastning».
                </li>
                <li>
                  <b>VID</b> (VLAN ID, 12 bits): 0–4095, men 0 og 4095 reservert → 4094 brukbare
                  VLAN-er. Default er 1.
                </li>
                <li>
                  Trunk-lenker bærer tags, access-porter stripper dem. Native VLAN sendes uten tag.
                </li>
              </ul>
            </div>
          }
        />

        <Cheat
          tittel="Switch self-learning og MAC-tabell"
          body={
            <>
              <SwitchMacOppdateringSvg />
              <ul className="list-disc pl-5 space-y-0.5">
                <li>
                  Switchen vedlikeholder en tabell: <code>(MAC-adresse, port, timestamp)</code>.
                </li>
                <li>
                  <b>Lær</b>: når en ramme kommer inn på port p med src-MAC = X, legg inn (X, p,
                  tid). Hvis X allerede finnes, oppdater port og tid.
                </li>
                <li>
                  <b>Videresend</b>: slå opp dest-MAC. Treff → send kun ut den porten. Bom → flood
                  til alle porter unntatt inn-porten.
                </li>
                <li>
                  <b>Timeout</b>: typisk 300 sek (5 min). Eldre entries slettes — derfor må MAC-er
                  relæres etter inaktivitet.
                </li>
                <li>
                  Switchen er <em>plug-and-play</em>: ingen konfigurasjon trengs for å bygge
                  tabellen.
                </li>
              </ul>
            </>
          }
        />
      </section>

      {/* ---------- b) Sammenligning-tabell ---------- */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <span className="inline-block w-1.5 h-5 bg-brand rounded" /> b)
          Multiple-access-protokoller side om side
        </h3>

        <div className="rounded-xl border border-border bg-card p-3">
          <TreSporTidslinjeSvg />
          <p className="text-xs text-muted-foreground mt-2 text-center italic">
            Tre tidslinje-spor: hvor protokollene reagerer ulikt på samme samtidige-send-situasjon.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-[12px]">
            <thead className="bg-muted/30 text-muted-foreground">
              <tr>
                <th className="text-left p-2 font-semibold">Egenskap</th>
                <th className="text-left p-2 font-semibold">ALOHA (pure/slot)</th>
                <th className="text-left p-2 font-semibold">CSMA/CD</th>
                <th className="text-left p-2 font-semibold">CSMA/CA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="p-2 font-medium">Lytte før send?</td>
                <td className="p-2">Nei — send når du vil</td>
                <td className="p-2">Ja — vent på ledig medium</td>
                <td className="p-2">Ja — vent + DIFS-mellomrom</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Kollisjons-deteksjon?</td>
                <td className="p-2">Nei — sender hele rammen alltid</td>
                <td className="p-2">Ja — abort + jam ved samtid-signal</td>
                <td className="p-2">Nei — radio kan ikke høre seg selv</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Kollisjons-unngåelse?</td>
                <td className="p-2">Tilfeldig backoff etter ACK-bom</td>
                <td className="p-2">Binary exponential backoff</td>
                <td className="p-2">Random backoff + ACK + ev. RTS/CTS</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Maks throughput (teoretisk)</td>
                <td className="p-2">18 % pure, 37 % slotted</td>
                <td className="p-2">~80–90 % ved lav last</td>
                <td className="p-2">~50–70 % (mye overhead)</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Hovedmiljø</td>
                <td className="p-2">Satellitt, lav-last radio</td>
                <td className="p-2">Kablet Ethernet (legacy hub-LAN)</td>
                <td className="p-2">Trådløs (Wi-Fi)</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Eksempel-standard</td>
                <td className="p-2">ALOHAnet (1971), GSM RACH</td>
                <td className="p-2">10/100BASE-T med hub</td>
                <td className="p-2">IEEE 802.11 (Wi-Fi)</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Hidden-terminal-problem?</td>
                <td className="p-2">Ikke relevant (ingen lytting)</td>
                <td className="p-2">Nei — alle hører hverandre</td>
                <td className="p-2">Ja — løses med RTS/CTS</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Behov for synkronisering?</td>
                <td className="p-2">Pure: nei. Slot: ja (felles klokke)</td>
                <td className="p-2">Nei</td>
                <td className="p-2">Nei (per-ramme ACK)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- c) Beslutningstre ---------- */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <span className="inline-block w-1.5 h-5 bg-brand rounded" /> c) «Hvilken
          multiple-access-protokoll passer?»
        </h3>
        <div className="rounded-xl border border-border bg-card p-4">
          <BeslutningstreSvg />
          <p className="text-xs text-muted-foreground mt-3 italic">
            Treet er en grov tommel-finger-regel — virkeligheten har gråsoner. På eksamen forklar
            <em>hvilken</em> egenskap som gjør at en protokoll passer eller ikke (lytting,
            deteksjon, hidden terminals, last).
          </p>
        </div>
      </section>

      {/* ---------- d) Vanlige fallgruver ---------- */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <span className="inline-block w-1.5 h-5 bg-brand rounded" /> d) Vanlige fallgruver
          sensorer ser igjen
        </h3>

        <div className="rounded-xl border border-border bg-card p-3">
          <MacVsIpVisualSvg />
          <p className="text-[11px] text-muted-foreground mt-1 text-center italic">
            MAC = lokal/flat (fødselsnummer) · IP = global/hierarkisk (postadresse).
          </p>
        </div>
        <Fallgruve
          feil="«MAC-adressen forteller hvor i nettet en maskin er»"
          riktig="MAC er en lokal, flat identifikator brent inn på nettverkskortet. Den endrer seg når kortet flyttes, men ikke når maskinen flytter mellom subnett. IP-adressen er den hierarkiske, ruterbare adressen som sier hvor maskinen er logisk plassert."
        />
        <div className="rounded-xl border border-border bg-card p-3">
          <SwitchVsRuterVisualSvg />
          <p className="text-[11px] text-muted-foreground mt-1 text-center italic">
            Switch = lag 2 (MAC, broadcast slipper) · ruter = lag 3 (IP, broadcast stoppes).
          </p>
        </div>
        <Fallgruve
          feil="«Switch og ruter gjør egentlig det samme»"
          riktig="Nei. Switch jobber på lag 2 (link), slår opp på MAC-adresse, lager broadcast-domener. Ruter jobber på lag 3 (nettverk), slår opp på IP-prefiks, separerer broadcast-domener og ruter mellom subnett. En switch ser aldri på IP-headeren."
        />
        <div className="rounded-xl border border-border bg-card p-3">
          <VlanIsolasjonVisualSvg />
          <p className="text-[11px] text-muted-foreground mt-1 text-center italic">
            VLAN isolerer broadcast — ikke sikkerhetsmessig segregert uten ACL/brannmur.
          </p>
        </div>
        <Fallgruve
          feil="«VLAN gir full isolering mellom nett»"
          riktig="VLAN isolerer broadcast-domener på lag 2 — ARP-storms, broadcast-pakker og MAC-flooding krysser ikke VLAN-grenser. Men trafikk mellom VLAN-er rutes på lag 3, så VLAN gir IKKE sikkerhetsmessig nett-segregering uten en brannvegg/ACL i mellom."
        />
        <div className="rounded-xl border border-border bg-card p-3">
          <ArpRetningSvg />
          <p className="text-[11px] text-muted-foreground mt-1 text-center italic">
            ARP er IP→MAC. Motsatt retning er RARP (deprecated).
          </p>
        </div>
        <Fallgruve
          feil="«ARP brukes til å slå opp IP-adressen til en host»"
          riktig="Motsatt. ARP-request går ut når du allerede kjenner IP-en, men trenger MAC-en for å bygge link-laget. ARP er IP→MAC, ikke MAC→IP (det heter RARP og er deprecated; moderne erstatning er DHCP)."
        />
        <Fallgruve
          feil="«CRC retter feil»"
          riktig="CRC oppdager feil — den retter dem ikke. Ved CRC-feil dropper Ethernet rammen lydløst og lar høyere lag (TCP) merke pakketapet og retransmittere. Feilrettende koder (Hamming, Reed-Solomon) er en annen sak og brukes mer i fysisk lag og lagring."
        />
        <Fallgruve
          feil="«Pure ALOHA og slotted ALOHA er omtrent like effektive»"
          riktig="Slot ALOHA er nøyaktig dobbelt så effektiv (37 % vs 18 %), fordi det sårbare vinduet halveres når alle sender på slot-grenser. På eksamen — kan du gjengi 1/e og 1/(2e)?"
        />
        <Fallgruve
          feil="«CSMA/CD og CSMA/CA er bare to navn på samme ting»"
          riktig="CD = Collision Detection (oppdage at det skjedde — kabel-Ethernet). CA = Collision Avoidance (prøve å unngå at det skjer — Wi-Fi). Radio-sender kan ikke høre seg selv mens den sender, derfor kan ikke Wi-Fi gjøre CD og må heller bruke ACK-er og RTS/CTS."
        />
        <Fallgruve
          feil="«En switch må konfigureres for å lære hvilke MAC-er som finnes hvor»"
          riktig="Nei — self-learning skjer automatisk fra src-MAC i innkommende rammer. Den eneste «konfigurasjonen» en standard L2-switch trenger er strøm. VLAN-trunking, STP og portsikkerhet krever oppsett, men ikke selve MAC-læringen."
        />
        <Fallgruve
          feil="«Minimum payload på 46 bytes er for å hindre at korte rammer kastes»"
          riktig="Det er for å sikre at en kollisjon kan detekteres før senderen er ferdig. Med kortere rammer på et 2500m-segment (klassisk 10BASE5) ville senderen kunne lukke sendingen FØR signalet rakk fram og kollisjonen ble synlig, og dermed gå glipp av deteksjonen."
        />
        <Fallgruve
          feil="«FCS dekker hele rammen inkludert preamble»"
          riktig="FCS dekker dest-MAC, src-MAC, type/length og payload — men IKKE preamble eller SFD (de er for klokke-synk og defineres ikke som en del av rammen). Dermed er FCS over typisk 60–1514 bytes, ikke 64–1518."
        />
      </section>

      {/* ---------- e) 5-minutter-anker ---------- */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <span className="inline-block w-1.5 h-5 bg-brand rounded" /> e) 5-minutter-anker — det
          siste du leser
        </h3>

        <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
          <AnkerKortSvg />
          <p className="text-[11px] text-muted-foreground mt-2 text-center italic">
            15 visuelle kort — én pr punkt under. La øyet feste seg på dem før eksamen.
          </p>
        </div>

        <Anker
          punkter={[
            "Link-laget tar et IP-datagram, pakker det i en ramme, sender det ÉN hopp, og dropper det stille hvis FCS slår ut.",
            "Ethernet-ramme: 8B preamble | 6B dest-MAC | 6B src-MAC | 2B type/len | 46-1500B payload | 4B FCS.",
            "MAC er 48 bits, flat, lokal, brent inn. IP er hierarkisk, ruterbar, global. ARP knytter IP→MAC innenfor ett subnett.",
            "CRC oppdager feil (ikke retter): rest av D·2ʳ mod G(x), Ethernet bruker CRC-32. Burst-feil ≤ r alltid fanget.",
            "Pure ALOHA: 1/(2e) ≈ 18%. Slotted ALOHA: 1/e ≈ 37%. Forskjellen er klokke-synk og halvert sårbart vindu.",
            "CSMA/CD = lytt, send, oppdag kollisjon, jam, binary exponential backoff (K ∈ 0…2^min(k,10)-1).",
            "CSMA/CA er Wi-Fi — radio kan ikke høre seg selv, så bruker ACK, DIFS/SIFS og RTS/CTS i stedet for kollisjons-deteksjon.",
            "Switch er self-learning på lag 2: (MAC, port) lagres fra src-MAC, treff videresender én port, bom flooder alle.",
            "Switch ≠ ruter. Switch slipper broadcast gjennom VLAN-domenet sitt. Ruter blokkerer broadcasts og separerer subnett.",
            "802.1Q VLAN-tag: 4 bytes (TPID 0x8100 | PCP 3b | DEI 1b | VID 12b) — gir 4094 brukbare VLAN-er.",
            "Trunk-port bærer flere VLAN-er taggete, access-port bærer ett VLAN utaggete. Native VLAN går utaggete på trunk.",
            "ARP er IP→MAC, broadcast-request, unicast-reply, caches i 1-20 min. Bom på ARP = ingen pakke sendes på lag 2.",
            "Min payload 46B er for kollisjons-deteksjon (sender må fortsatt sende når kollisjonen er synlig), ikke for ramme-fil-størrelse.",
            "Datasenter: fat-tree / leaf-spine, ECMP, mange parallelle stier — øst-vest-trafikk dominerer, klassisk tre var ikke nok.",
            "Hvis du må velge én tabell å huske: ALOHA vs CSMA/CD vs CSMA/CA på (lytte, deteksjon, miljø, max-throughput).",
          ]}
        />
      </section>
    </article>
  );
}

// ---- Hjelpe-komponenter for eksamen-fokus ----

function Cheat({ tittel, body }: { tittel: string; body: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
        Cheat sheet
      </div>
      <div className="font-semibold text-foreground mb-2">{tittel}</div>
      <div className="text-muted-foreground text-[13px] space-y-1">{body}</div>
    </div>
  );
}

function Fallgruve({ feil, riktig }: { feil: string; riktig: string }) {
  return (
    <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-rose-700 dark:text-rose-400 font-semibold mb-1">
        Fallgruve
      </div>
      <div className="text-[13px]">
        <div className="text-foreground mb-1">
          <span className="font-semibold text-rose-700 dark:text-rose-400">Misforståelse:</span>{" "}
          {feil}
        </div>
        <div className="text-muted-foreground">
          <span className="font-semibold text-foreground">Riktig:</span> {riktig}
        </div>
      </div>
    </div>
  );
}

function Anker({ punkter }: { punkter: string[] }) {
  return (
    <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-sky-700 dark:text-sky-400 font-semibold mb-2">
        5-minutter-anker
      </div>
      <ol className="list-decimal pl-5 space-y-1 text-[13px] text-muted-foreground marker:text-sky-600 dark:marker:text-sky-400">
        {punkter.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ol>
    </div>
  );
}

function BeslutningstreSvg() {
  return (
    <svg viewBox="0 0 720 440" className="w-full h-auto" role="img" aria-label="Beslutningstre">
      <defs>
        <marker
          id="kap6-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" className="fill-muted-foreground" />
        </marker>
      </defs>

      {/* Node 1: rot */}
      <g>
        <rect
          x="270"
          y="10"
          width="180"
          height="46"
          rx="8"
          className="fill-card stroke-brand"
          strokeWidth="1.5"
        />
        <text
          x="360"
          y="30"
          textAnchor="middle"
          className="fill-foreground text-[11px] font-semibold"
        >
          Er topologien delt
        </text>
        <text x="360" y="46" textAnchor="middle" className="fill-foreground text-[11px]">
          medium eller punkt-til-punkt?
        </text>
      </g>

      {/* Branch til "delt medium" og "p2p" */}
      <line
        x1="320"
        y1="56"
        x2="170"
        y2="90"
        className="stroke-muted-foreground"
        strokeWidth="1"
        markerEnd="url(#kap6-arrow)"
      />
      <line
        x1="400"
        y1="56"
        x2="560"
        y2="90"
        className="stroke-muted-foreground"
        strokeWidth="1"
        markerEnd="url(#kap6-arrow)"
      />
      <text x="220" y="76" className="fill-muted-foreground text-[10px]">
        delt
      </text>
      <text x="490" y="76" className="fill-muted-foreground text-[10px]">
        p2p
      </text>

      {/* Node 2a: delt medium → klokke-synk? */}
      <g>
        <rect
          x="60"
          y="92"
          width="220"
          height="46"
          rx="8"
          className="fill-card stroke-muted-foreground"
          strokeWidth="1"
        />
        <text
          x="170"
          y="112"
          textAnchor="middle"
          className="fill-foreground text-[11px] font-semibold"
        >
          Er det streng oppgjøretid /
        </text>
        <text x="170" y="128" textAnchor="middle" className="fill-foreground text-[11px]">
          deterministisk slot-tildeling?
        </text>
      </g>

      {/* Node 2b: p2p → enkel link */}
      <g>
        <rect
          x="460"
          y="92"
          width="220"
          height="46"
          rx="8"
          className="fill-emerald-500/10 stroke-emerald-500"
          strokeWidth="1.2"
        />
        <text
          x="570"
          y="112"
          textAnchor="middle"
          className="fill-foreground text-[11px] font-semibold"
        >
          Trenger ikke MAC-protokoll
        </text>
        <text x="570" y="128" textAnchor="middle" className="fill-muted-foreground text-[11px]">
          (PPP, dedikert fiber)
        </text>
      </g>

      {/* Node 2a split: ja → TDMA, nei → carrier sense? */}
      <line
        x1="120"
        y1="138"
        x2="80"
        y2="172"
        className="stroke-muted-foreground"
        strokeWidth="1"
        markerEnd="url(#kap6-arrow)"
      />
      <line
        x1="220"
        y1="138"
        x2="280"
        y2="172"
        className="stroke-muted-foreground"
        strokeWidth="1"
        markerEnd="url(#kap6-arrow)"
      />
      <text x="80" y="158" className="fill-muted-foreground text-[10px]">
        ja
      </text>
      <text x="252" y="158" className="fill-muted-foreground text-[10px]">
        nei
      </text>

      {/* Node 3a: TDMA */}
      <g>
        <rect
          x="10"
          y="174"
          width="170"
          height="46"
          rx="8"
          className="fill-emerald-500/10 stroke-emerald-500"
          strokeWidth="1.2"
        />
        <text
          x="95"
          y="194"
          textAnchor="middle"
          className="fill-foreground text-[11px] font-semibold"
        >
          TDMA / Token-passing
        </text>
        <text x="95" y="210" textAnchor="middle" className="fill-muted-foreground text-[11px]">
          (sanntid, kollisjonsfri)
        </text>
      </g>

      {/* Node 3b: kan du lytte før send? */}
      <g>
        <rect
          x="200"
          y="174"
          width="240"
          height="46"
          rx="8"
          className="fill-card stroke-muted-foreground"
          strokeWidth="1"
        />
        <text
          x="320"
          y="194"
          textAnchor="middle"
          className="fill-foreground text-[11px] font-semibold"
        >
          Kan alle høre alle andre
        </text>
        <text x="320" y="210" textAnchor="middle" className="fill-foreground text-[11px]">
          før de begynner å sende?
        </text>
      </g>

      {/* Node 3b split: ja → kabel? nei → ALOHA-stil */}
      <line
        x1="280"
        y1="220"
        x2="220"
        y2="252"
        className="stroke-muted-foreground"
        strokeWidth="1"
        markerEnd="url(#kap6-arrow)"
      />
      <line
        x1="360"
        y1="220"
        x2="440"
        y2="252"
        className="stroke-muted-foreground"
        strokeWidth="1"
        markerEnd="url(#kap6-arrow)"
      />
      <text x="220" y="240" className="fill-muted-foreground text-[10px]">
        ja
      </text>
      <text x="412" y="240" className="fill-muted-foreground text-[10px]">
        nei (radio / hidden terminals)
      </text>

      {/* Node 4a: CSMA/CD */}
      <g>
        <rect
          x="110"
          y="254"
          width="230"
          height="46"
          rx="8"
          className="fill-card stroke-muted-foreground"
          strokeWidth="1"
        />
        <text
          x="225"
          y="274"
          textAnchor="middle"
          className="fill-foreground text-[11px] font-semibold"
        >
          Kan senderen detektere
        </text>
        <text x="225" y="290" textAnchor="middle" className="fill-foreground text-[11px]">
          kollisjon underveis (kabel)?
        </text>
      </g>

      {/* Node 4b: CSMA/CA */}
      <g>
        <rect
          x="380"
          y="254"
          width="230"
          height="46"
          rx="8"
          className="fill-emerald-500/10 stroke-emerald-500"
          strokeWidth="1.2"
        />
        <text
          x="495"
          y="274"
          textAnchor="middle"
          className="fill-foreground text-[11px] font-semibold"
        >
          CSMA/CA (Wi-Fi)
        </text>
        <text x="495" y="290" textAnchor="middle" className="fill-muted-foreground text-[11px]">
          ACK + ev. RTS/CTS
        </text>
      </g>

      {/* CSMA/CD split */}
      <line
        x1="180"
        y1="300"
        x2="120"
        y2="332"
        className="stroke-muted-foreground"
        strokeWidth="1"
        markerEnd="url(#kap6-arrow)"
      />
      <line
        x1="270"
        y1="300"
        x2="320"
        y2="332"
        className="stroke-muted-foreground"
        strokeWidth="1"
        markerEnd="url(#kap6-arrow)"
      />
      <text x="120" y="320" className="fill-muted-foreground text-[10px]">
        ja
      </text>
      <text x="290" y="320" className="fill-muted-foreground text-[10px]">
        nei
      </text>

      {/* Node 5a: CSMA/CD endeløsning */}
      <g>
        <rect
          x="10"
          y="334"
          width="220"
          height="46"
          rx="8"
          className="fill-emerald-500/10 stroke-emerald-500"
          strokeWidth="1.2"
        />
        <text
          x="120"
          y="354"
          textAnchor="middle"
          className="fill-foreground text-[11px] font-semibold"
        >
          CSMA/CD (kablet Ethernet)
        </text>
        <text x="120" y="370" textAnchor="middle" className="fill-muted-foreground text-[11px]">
          legacy hub-LAN
        </text>
      </g>

      {/* Node 5b: slotted? */}
      <g>
        <rect
          x="240"
          y="334"
          width="220"
          height="46"
          rx="8"
          className="fill-card stroke-muted-foreground"
          strokeWidth="1"
        />
        <text
          x="350"
          y="354"
          textAnchor="middle"
          className="fill-foreground text-[11px] font-semibold"
        >
          Har du synkront klokke-slot?
        </text>
        <text x="350" y="370" textAnchor="middle" className="fill-foreground text-[11px]">
          ja → Slot-ALOHA | nei → Pure
        </text>
      </g>

      {/* CSMA/CA-koblingen fra node 3b nei-arm */}
      <text x="540" y="320" className="fill-emerald-700 dark:fill-emerald-400 text-[10px] italic">
        ↑ valgt allerede
      </text>

      {/* legend */}
      <g>
        <rect
          x="10"
          y="396"
          width="14"
          height="14"
          className="fill-emerald-500/10 stroke-emerald-500"
        />
        <text x="30" y="407" className="fill-muted-foreground text-[10px]">
          endenode = svar
        </text>
        <rect
          x="170"
          y="396"
          width="14"
          height="14"
          className="fill-card stroke-muted-foreground"
        />
        <text x="190" y="407" className="fill-muted-foreground text-[10px]">
          beslutnings-spørsmål
        </text>
      </g>
    </svg>
  );
}
