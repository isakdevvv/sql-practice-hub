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
import { AnslagPanel } from "@/components/lab/AnslagPanel";
import { CubicAimdViz } from "./CubicAimdViz";
import type { Anslag } from "@/lib/lab/anslag";
import { SectionPager, type SectionNavItem } from "./SectionPager";
import { Section31Live } from "./Section31Live";
import { Section32Live } from "./Section32Live";
import { Section33Live } from "./Section33Live";
import { Section34Live } from "./Section34Live";
import { Section35Live } from "./Section35Live";
import { VisualDefs } from "./VisualDefs";
import { Forberedelse } from "./Forberedelse";
import { FORBEREDELSE_3 } from "./forberedelseData";
import { LectureNote, LectureBeat } from "./LectureNote";
import {
  SegmentIcon,
  EndToEndIcon,
  LogicalLinkIcon,
  BestEffortIcon,
  ServiceMenuIcon,
  SocketIcon,
  ApiVsIcon,
  ReliabilityIcon,
  LatencyThroughputIcon,
  TlsIcon,
  ConnectionOrientedIcon,
  HolBlockingIcon,
  FullDuplexIcon,
  PortNumberIcon,
  MuxIcon,
  DemuxIcon,
  TwoTupleIcon,
  FourTupleIcon,
  ListenSocketIcon,
  EphemeralPortIcon,
  WellKnownPortIcon,
  RegisteredPortIcon,
  DynamicPortIcon,
  NatIcon,
  BindConnectIcon,
  PortExhaustionIcon,
  RstIcon,
  ConnectionlessIcon,
  UdpHeaderIcon,
  ChecksumIcon,
  MessageBoundaryIcon,
  UdpVsTcpIcon,
  QuicIcon,
  PseudoHeaderIcon,
  MaxPacketIcon,
  OptionalChecksumIcon,
  PortUnreachableIcon,
  UseCasesIcon,
  VoipIcon,
  DccpIcon,
  Rdt1Icon,
  Rdt2Icon,
  Rdt21Icon,
  Rdt22Icon,
  Rdt3Icon,
  StopAndWaitIcon,
  PipeliningIcon,
  GoBackNIcon,
  SelectiveRepeatIcon,
  SeqSpaceIcon,
  UtilizationIcon,
  BdpIcon,
  DuplicateDetectIcon,
  NakDupAckIcon,
  TimerIcon,
  SegmentationIcon,
  SeqNumIcon,
  CumAckIcon,
  FastRetransmitIcon,
  RttEstimateIcon,
  FlowControlIcon,
  HandshakeIcon,
  TcpStatesIcon,
  TcpFlagsIcon,
  IsnIcon,
  TimeWaitIcon,
  MssIcon,
  KarnAlgIcon,
  NagleIcon,
  DelayedAckIcon,
  TcpOptionsIcon,
  HalfCloseIcon,
  CongestionCollapseIcon,
  CwndIcon,
  AimdIcon,
  SlowStartIcon,
  TcpRenoIcon,
  TcpCubicIcon,
  BbrIcon,
  FairnessIcon,
  SsthreshIcon,
  TimeoutVsDupAckIcon,
  EcnIcon,
  AimdThroughputIcon,
  TcpTahoeIcon,
  BufferbloatIcon,
  SelfClockingIcon,
  SenderWindowIcon,
  ConvergenceIcon,
} from "./visualDefIcons.kap3";

type Tab = "intro" | "3.1" | "3.2" | "3.3" | "3.4" | "3.5" | "3.6" | "3.7" | "3.8";

const SECTIONS_3: SectionNavItem[] = [
  { id: "intro", label: "Start her" },
  { id: "3.1", label: "3.1 Transport-tjenester" },
  { id: "3.2", label: "3.2 Mux/demux" },
  { id: "3.3", label: "3.3 UDP" },
  { id: "3.4", label: "3.4 Pålitelig transport" },
  { id: "3.5", label: "3.5 TCP" },
  { id: "3.6", label: "3.6 Congestion control" },
  { id: "3.7", label: "3.7 Oppgaver" },
  { id: "3.8", label: "Eksamen-fokus" },
];
const NEXT_CHAPTER_3 = { slug: "kurose-kap-4", title: "Nettverkslaget — data-plane" };

export function KuroseKap3Page() {
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
              Kap. 3 — Transportlaget
            </h1>
          </div>
          <nav className="ml-auto flex flex-wrap gap-0.5">
            <TabBtn active={tab === "intro"} onClick={() => setTab("intro")}>
              Start
            </TabBtn>
            <TabBtn
              active={tab === "3.1"}
              onClick={() => setTab("3.1")}
              title="Transport-tjenester"
            >
              3.1
            </TabBtn>
            <TabBtn active={tab === "3.2"} onClick={() => setTab("3.2")} title="Mux/demux">
              3.2
            </TabBtn>
            <TabBtn active={tab === "3.3"} onClick={() => setTab("3.3")} title="UDP">
              3.3
            </TabBtn>
            <TabBtn
              active={tab === "3.4"}
              onClick={() => setTab("3.4")}
              title="Pålitelig transport"
            >
              3.4
            </TabBtn>
            <TabBtn active={tab === "3.5"} onClick={() => setTab("3.5")} title="TCP">
              3.5
            </TabBtn>
            <TabBtn active={tab === "3.6"} onClick={() => setTab("3.6")} title="Congestion control">
              3.6
            </TabBtn>
            <TabBtn active={tab === "3.7"} onClick={() => setTab("3.7")} title="Oppgaver">
              Oppg.
            </TabBtn>
            <TabBtn
              active={tab === "3.8"}
              onClick={() => setTab("3.8")}
              title="Eksamen-fokus: cheat sheet, sammenligning, fallgruver, anker"
            >
              Eksamen
            </TabBtn>
          </nav>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "3.1" && <Section31 />}
        {tab === "3.2" && <Section32 />}
        {tab === "3.3" && <Section33 />}
        {tab === "3.4" && <Section34 />}
        {tab === "3.5" && <Section35 />}
        {tab === "3.6" && <Section36 />}
        {tab === "3.7" && <Section37 />}
        {tab === "3.8" && <SectionEksamen />}

        <SectionPager
          tabs={SECTIONS_3}
          current={tab}
          onPick={(id) => setTab(id as Tab)}
          nextChapter={NEXT_CHAPTER_3}
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
            Forklare hva transportlaget egentlig leverer over nettverkslagets ustabile «best
            effort»-tjeneste, og hva som er igjen for applikasjonen.
          </li>
          <li>
            Beskrive multipleksing og demultipleksing: hvordan en eneste IP-stack betjener mange
            samtidige sockets ved hjelp av portnumre.
          </li>
          <li>
            Argumentere for når UDP er det riktige valget og når TCP er det — og vite hva man mister
            i begge retninger.
          </li>
          <li>
            Bygge en pålitelig transport-protokoll inkrementelt: fra et perfekt rør (RDT 1.0) opp
            til håndtering av bit-feil, duplikater og tap (RDT 3.0).
          </li>
          <li>
            Forklare TCP-mekanikken: segmentering, kumulative ACK-er, retransmisjon med
            RTT-estimering (EWMA), flow control via mottakervindu.
          </li>
          <li>
            Forklare hvorfor congestion control finnes og kontrastere AIMD (Reno), Cubic og
            BBR-tilnærmingen.
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Kapittelets struktur</h2>
        <ol className="list-decimal pl-5 text-muted-foreground space-y-1">
          <li>Innledning og transport-tjenester — hva laget egentlig gir deg</li>
          <li>Multipleksing og demultipleksing — portnumre og sockets</li>
          <li>UDP — det minimalistiske transportlaget</li>
          <li>Pålitelig data-transport — RDT 1.0 til 3.0</li>
          <li>TCP — segmentering, ACK-er, RTT, flow control</li>
          <li>Congestion control — AIMD, Reno, Cubic, BBR</li>
          <li>Oppgaver — sjekk forståelsen din</li>
        </ol>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => onPick("3.1")}>
            Start på 3.1 →
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 3.1 — Innledning og transport-tjenester
// ============================================================
const ANSLAG_31: Anslag[] = [
  {
    id: "k3-hva-legger-transport-til",
    tema: "Transport vs. nettverk",
    sporsmal: (
      <>
        IP får allerede et datagram fram til riktig <em>maskin</em>. Hva er det transportlaget legger til
        som er helt uunnværlig?
      </>
    ),
    valg: [
      "Pålitelighet — uten TCP kommer ingenting fram",
      "Å finne fram til riktig prosess på maskinen, via portnumre",
      "Kryptering av innholdet",
      "Å velge ruten gjennom nettet",
    ],
    riktig: 1,
    fasit: (
      <>
        Kjernen er <strong>prosess-til-prosess</strong>. Maskinen din kjører hundrevis av apper på én
        IP-adresse; uten portnumre vet ingen hvem datagrammet skal til. Pålitelighet er noe TCP{" "}
        <em>i tillegg</em> tilbyr — UDP dropper det og er fortsatt et fullverdig transportlag.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Vi lærer TCP først, og setter likhetstegn mellom transport og pålitelighet. Men den minste
        felles nevneren for <em>alle</em> transportprotokoller er multipleksing — ikke garantier.
      </>
    ),
  },
  {
    id: "k3-logisk-kommunikasjon",
    tema: "Logisk kommunikasjon",
    sporsmal: (
      <>
        Vi sier at transportlaget gir «logisk kommunikasjon» mellom prosesser. Hva betyr «logisk» her?
      </>
    ),
    valg: [
      "At forbindelsen er kryptert",
      "At det ser ut som prosessene er direkte koblet, selv om det ligger et helt nett imellom",
      "At forbindelsen følger en fast, forhåndsberegnet rute",
      "At kommunikasjonen er feilfri",
    ],
    riktig: 1,
    fasit: (
      <>
        «Logisk» betyr <strong>som om</strong>. Fra applikasjonens side ser det ut som en direkte kobling
        til motparten — all ruting, kø og hopp mellom rutere er skjult. Transportlaget kjører bare på
        endesystemene; nettet imellom vet ingenting om det.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Ordet «logisk» leses som «kryptert» eller «virtuell krets». Det det egentlig peker på er en
        <em> illusjon</em> — og hele poenget med lagdeling er å lage nyttige illusjoner.
      </>
    ),
  },
];

function Section31() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="3.1" title="Innledning og transport-tjenester" />

      <p className="text-muted-foreground">
        Transportlaget sitter mellom applikasjonen din og nettverkslaget. Nettverkslaget (IP)
        leverer datagrammer fra én host til en annen — best effort, ingen garantier. Transportlaget
        bygger oppå dette, og forvandler «host-til-host»-leveranse til
        «prosess-til-prosess»-leveranse, med eventuelle ekstra-tjenester som påvirker hvor mange
        piler en utvikler trenger å skyte i applikasjonskoden sin.
      </p>

      <Section31Live />

      <AnslagPanel
        avsloring="knapp"
        tittel="Anslå først — hva laget er til for"
        intro={<>To spørsmål om hva transportlaget egentlig bidrar med.</>}
        anslag={ANSLAG_31}
      />

      <LectureNote title="Logisk kommunikasjon — og huset med tolv unger">
        <p>
          Det første begrepet å få på plass er <strong>logisk kommunikasjon</strong>. Sett fra
          transportlaget er de to sidene — avsender og mottaker — koblet sammen med det som like
          gjerne kunne vært en direkte lenke. I virkeligheten kan de sitte på hver sin side av
          kloden, med mange nett, rutere og lenker imellom. Vi abstraherer bort alt som ligger
          mellom dem, og ser bare på <em>egenskapene til kanalen</em> som forbinder dem: den kan
          miste meldinger, stokke om på dem, og vrenge bits. Så spør vi: hvilke tjenester kan vi
          bygge oppå akkurat den kanalen?
        </p>

        <LectureBeat>Analogien som gjør nett- og transportlaget klart</LectureBeat>
        <p>
          Tenk deg to hus med tolv unger i hvert. <strong>Husene er verter</strong>,{" "}
          <strong>ungene er prosesser</strong>, og applikasjonsmeldingene er{" "}
          <strong>brev i konvolutter</strong> som sendes mellom husene. Postverkets jobb er å få
          brevet fra det ene huset til det andre — det er <strong>nettverkslaget</strong>. Men når
          brevet kommer inn døra, må noen sortere det ut til rett unge. Det er{" "}
          <strong>transportlaget</strong>.
        </p>
        <p>
          Det er hele forskjellen i én setning: nettverkslaget leverer{" "}
          <strong>hus til hus</strong>, transportlaget leverer <strong>unge til unge</strong>.
        </p>

        <LectureBeat>Hva som faktisk skjer på hver side</LectureBeat>
        <p>
          Hos avsenderen: en prosess lager en melding og slipper den ned i socketen. Transportlaget
          tar imot, bestemmer hva som skal stå i header-feltene, lager segmentet, og gir det
          nedover til nettverkslaget — som får jobben med å frakte datagrammet vert til vert.
        </p>
        <p>
          Hos mottakeren: et segment kommer opp fra nettverkslaget, header-feltene sjekkes (er det
          korrupt?), applikasjonsmeldingen hentes ut, og den{" "}
          <strong>demultiplekses</strong> opp til riktig socket.
        </p>

        <LectureBeat>Det som ikke finnes — og hvorfor det er interessant</LectureBeat>
        <p>
          TCP gir pålitelig, ordnet levering med metnings- og flytkontroll, og krever forbindelse
          med tilstand i begge ender. UDP er nøkternt og uten seremonier: upålitelig, kan komme ut
          av rekkefølge.
        </p>
        <p>
          Men stopp litt ved det som <em>ikke</em> tilbys. Det finnes{" "}
          <strong>ingen garanti for tiden</strong> fra en melding sendes inn i en socket til den
          kommer ut i den andre enden — noe som ville vært svært verdifullt for f.eks. taleanrop. Og
          det finnes <strong>ingen båndbreddegaranti</strong> — noe strømmet video gjerne skulle
          hatt. Ingen av delene tilbys av internettets transportprotokoller. Spørsmålet om{" "}
          <em>hvorfor</em> er et av de mest lærerike i faget: hva er egentlig det minimum av
          tjenester man trenger for at kommunikasjon skal fungere godt nok?
        </p>
      </LectureNote>


      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            { term: "Segment", icon: <SegmentIcon />, body: "Transportlagets pakke (header + data)." },
            {
              term: "Ende-til-ende vs hopp-for-hopp",
              icon: <EndToEndIcon />,
              body: "Bare endepunktene har transport; rutere bare IP.",
            },
            {
              term: "Logisk forbindelse",
              icon: <LogicalLinkIcon />,
              body: "Inntrykk av stabil kanal over forbindelsesløst IP.",
            },
            { term: "Best effort", icon: <BestEffortIcon />, body: "IP lover ingenting — alt annet må vi bygge selv." },
            {
              term: "Transport-tjenester",
              icon: <ServiceMenuIcon />,
              body: "Pålitelighet, ordning, flow, congestion, sikkerhet.",
            },
            { term: "Socket", icon: <SocketIcon />, body: "Døra mellom app og transport-stacken." },
            {
              term: "API-forskjell TCP vs UDP",
              icon: <ApiVsIcon />,
              body: "TCP = bytestrøm; UDP = pakke-grenser bevares.",
            },
            { term: "Pålitelighet", icon: <ReliabilityIcon />, body: "Hver byte kommer fram, i orden — eller feilbeskjed." },
            { term: "Latens vs gjennomstrømning", icon: <LatencyThroughputIcon />, body: "To akser å velge protokoll etter." },
            { term: "TLS", icon: <TlsIcon />, body: "Krypterings-lag mellom app og TCP." },
            {
              term: "Tilkoblingsorientert vs forbindelsesløs",
              icon: <ConnectionOrientedIcon />,
              body: "TCP setter opp delt tilstand; UDP gjør det ikke.",
            },
            { term: "Head-of-line blocking", icon: <HolBlockingIcon />, body: "Én tapt byte stopper alt etter." },
            { term: "Full-duplex", icon: <FullDuplexIcon />, body: "Begge sider sender samtidig på samme forbindelse." },
          ]}
        />
        <Illustration caption="Transportlaget snakker prosess-til-prosess via IP. Rutere ser bare nettverkslaget.">
          <TransportE2ESvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="Transport-laget er UPS sin sporings-tjeneste">
          <p>
            IP er som en haug med vilkårlige lastebiler og fly: pakken din kan ta hvilken som helst
            rute, kan bli mistet, eller leveres i feil rekkefølge. Du har ingen anelse om reisen.
          </p>
          <p>
            Transport-laget er sporings- og leveringsbekreftelses-tjenesten oppå dette. UPS lover
            deg ikke at akkurat den lastebilen er rask — men de lover at pakken kommer fram, i
            riktig kasse, og at du får varsel hvis noe ryker. TCP er UPS Premium med signaturkrav.
            UDP er «slipp i postkassen og kryss fingrene».
          </p>
        </Metafor>

        <Metafor tittel="Best effort er som å slippe brev fra et fly">
          <p>
            Tenk deg at IP er et fly som slipper brev ut av lasterommet over byen din. Noen blader
            lander i hagen, noen blåser bort, noen blir gjennomvåte, og to lander samtidig i feil
            rekkefølge. Det er ingenting flyet kan gjøre — det leverer best mulig.
          </p>
          <p>
            Hvis du trenger garantert leveranse, må du sette opp et eget system på bakken som
            plukker opp brevene, sorterer dem, og ber piloten kaste på nytt det som mangler. Det
            systemet er transport-laget.
          </p>
        </Metafor>
      </div>

      <Metafor tittel="Head-of-line blocking = køen på Vinmonopolet">
        <p>
          Du har 5 ting i kurven, men kassedama scanner dem i rekkefølge. Hvis det første produktet
          har en defekt strekkode og ekspeditøren må ringe en kollega, må de fire andre kundene bak
          deg vente — selv om deres varer er helt fine.
        </p>
        <p>
          TCP er Vinmonopol-køen. Hvis byte 1000 mangler, må byte 2000-9999 vente i bufferen til
          1000 retransmitteres. QUIC er som å ha flere parallelle kasser: tap i én kø blokkerer ikke
          de andre.
        </p>
      </Metafor>

      <Illustration caption="UPS-metaforen: app-laget gir pakken til transport, som garanterer leveranse over et upålitelig IP-nett.">
        <UpsMetaforSvg />
      </Illustration>

      <Hvorfor title="Hvorfor introdusere et eget transport-lag i det hele tatt?">
        <p>
          IP gir oss host-til-host-levering. Det er for grovkornet for en moderne maskin: en bærbar
          kan kjøre 50 nettverks-prosesser samtidig, og alle deler den ene IP-adressen. Hvis vi
          hadde stoppet på IP, måtte hver applikasjon multipleksing-løse selv — og resultatet hadde
          vært 50 ulike, inkompatible måter å håndtere portnumre på.
        </p>
        <p>
          I tillegg trenger mange applikasjoner samme grunnpakke: pålitelighet, ordning, flow
          control. Hvis hver app gjenoppfinner dette, blir det 50 buggy halv-implementasjoner.
          Transport-laget abstraherer det vekk — du velger «full pakke» (TCP) eller «ingenting»
          (UDP), og slipper å skrive RDT-logikken selv.
        </p>
        <p>
          Et godt prinsipp er: laget gir et felles språk som er nyttig nok til at mange apper kan
          dele det, men ikke så meningsfullt at det stenger ute apper som vil ha noe annet. UDP er
          fluktveien for de som ikke vil ha det TCP gir.
        </p>
      </Hvorfor>

      <Example title="Eksempel: hva må applikasjonen håndtere selv?">
        <p>
          En spill-server sender sanntidsoppdateringer til 200 klienter, 30 ganger i sekundet. Du
          velger UDP fordi du foretrekker at en tapt pakke bare blir borte fremfor at TCP stopper
          opp og retransmitterer en frame som likevel er foreldet.
        </p>
        <p className="mt-2">Det betyr at applikasjonen din selv må:</p>
        <ul className="list-disc pl-5 mt-1">
          <li>Nummerere pakker (UDP gir ingen sekvensnumre).</li>
          <li>Detektere tap og bestemme om noe skal sendes på nytt eller bare hoppes over.</li>
          <li>
            Gjøre congestion control hvis du ikke vil at serveren skal drepe sin egen
            oppstrøms-lenke.
          </li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Hvis du derimot lager en filoverføring, vil du ikke skrive denne logikken selv. Bruk TCP.
          Transport-tjeneste-menyen handler om å velge det laveste laget som dekker dine behov.
        </p>
      </Example>

      <Example title="Eksempel: kalkulér transport-overhead på en 60-byte sensor-melding">
        <p>
          En IoT-sensor sender en 60-byte måling (temperatur, luftfuktighet, tidsstempel) til en
          gateway hvert sekund. Vi sammenligner overhead-en for TCP og UDP:
        </p>
        <p className="mt-2 font-mono text-[12px]">
          UDP: IP (20) + UDP (8) + data (60) = 88 bytes total. Overhead = 28 / 88 = 31.8 %
          <br />
          TCP: IP (20) + TCP (20) + data (60) = 100 bytes per data-segm.
          <br />
          + handshake: SYN (40) + SYN-ACK (40) + ACK (40) = 120 bytes
          <br />
          + lukking: FIN-ACK-runder (~120 bytes)
          <br />
          For ÉN måling med ny forbindelse: 100 + 240 = 340 bytes. Overhead = 280 / 340 = 82 %
        </p>
        <p className="mt-2 text-muted-foreground">
          For en sensor som sender én melding per sekund og lukker forbindelsen, blir TCP en ekstrem
          skattelegging. Selv om vi holder forbindelsen åpen, betaler vi 40 bytes per måling i
          header mot UDPs 28. Multipliser med tusenvis av sensorer over et LoRa-nett, og forskjellen
          blir betalingsplikt vs ikke. Det er en av grunnene til at IoT-protokoller som CoAP kjører
          over UDP.
        </p>
      </Example>

      <RelatedSlugs slugs={["transportlag", "tcp-sockets", "dte2507-rdt-progresjon"]} />
    </article>
  );
}

// ============================================================
// 3.2 — Multipleksing og demultipleksing
// ============================================================
const ANSLAG_32: Anslag[] = [
  {
    id: "k3-udp-demux",
    tema: "UDP-demultipleksing",
    sporsmal: (
      <>
        To datagram kommer inn til samme maskin med <strong>samme mål-port</strong>, men fra{" "}
        <strong>ulike avsendere</strong>. De skal til en <strong>UDP</strong>-socket. Havner de i samme
        socket?
      </>
    ),
    valg: [
      "Ja — UDP ser bare på mål-IP og mål-port",
      "Nei — ulik avsender gir ulik socket",
      "Bare hvis avsenderne er i samme nett",
      "Nei — UDP forkaster det andre datagrammet",
    ],
    riktig: 0,
    fasit: (
      <>
        <strong>Ja.</strong> En UDP-socket identifiseres av <em>to</em> ting: mål-IP og mål-port. Hvem som
        sendte spiller ingen rolle for hvor det havner — appen må selv se på avsenderadressen hvis den
        bryr seg.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Man overfører TCP-modellen til UDP. Men UDP har ingen forbindelse å skille partene med — derfor
        holder to felter, ikke fire.
      </>
    ),
  },
  {
    id: "k3-tcp-demux",
    tema: "TCP-demultipleksing",
    sporsmal: <>Hvor mange felter skal til for å bestemme hvilken <strong>TCP</strong>-socket et segment hører til?</>,
    valg: ["To: mål-IP og mål-port", "Tre", "Fire: kilde-IP, kilde-port, mål-IP og mål-port", "Ett: portnummeret"],
    riktig: 2,
    fasit: (
      <>
        <strong>Firertuppelen.</strong> Det er derfor en webserver kan ha tusenvis av samtidige
        forbindelser på port 443 uten å blande dem: hver klient bidrar med sin egen kilde-IP og
        kilde-port.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        «Én port = én tjeneste = én socket» er en rimelig forenkling helt til du spør hvordan serveren
        håndterer to brukere samtidig. Da må noe skille dem, og det er avsendersiden.
      </>
    ),
  },
];

function Section32() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="3.2" title="Multipleksing og demultipleksing" />

      <p className="text-muted-foreground">
        En enkelt maskin kan kjøre hundrevis av samtidige nettverks-applikasjoner — nettleseren med
        20 faner, Spotify, et Slack-klient, en ssh-sesjon. Alle deler den samme IP-adressen. Hvordan
        finner ankommende pakker veien til riktig prosess? Svaret er portnumre, og mekanismen kalles
        demultipleksing.
      </p>

      <Section31Live />

      <AnslagPanel
        avsloring="knapp"
        tittel="Anslå først — hvem havner hvor"
        intro={<>To datagram, to protokoller, og spørsmålet om hva som skiller sockets.</>}
        anslag={ANSLAG_32}
      />

      <LectureNote title="Demultipleksing: flyplassen, og de to reglene">
        <p>
          Tenk på det slik: datagram kommer inn til en vert, og nyttelastene skal til ulike
          applikasjoner eller protokoller på den verten. Å styre hver nyttelast til rett mottaker er{" "}
          <strong>demultipleksing</strong>. Motsatt vei: mange applikasjoner sender ned gjennom hver
          sin socket, og transportlaget trakter alt sammen ned i IP — det er{" "}
          <strong>multipleksing</strong>. Og merk deg: dette skjer i <em>alle</em> lag i stakken, vi
          ser bare på transportlaget her.
        </p>
        <p>
          Analogien er flyplassen. Du kommer inn og blir umiddelbart delt: business hit, økonomi
          dit. Ved sikkerhetskontrollen deles du igjen. Ved gaten er det egen kø for prioritetsklasse
          og flere for resten. Å bli sortert og styrt til en bestemt tjenesteklasse — det er
          demultipleksing i et nøtteskall.
        </p>
        <p>
          Verktøyene er fire verdier: datagrammets <strong>kilde-IP</strong> og{" "}
          <strong>mål-IP</strong>, og segmentets <strong>kildeport</strong> og{" "}
          <strong>målport</strong>. Og her skiller de to protokollene lag.
        </p>

        <LectureBeat>UDP: kun målporten</LectureBeat>
        <p>
          En UDP-socket identifiseres av vertens lokale portnummer. Når et segment kommer inn, ser
          verten på <strong>målportnummeret alene</strong> og leverer til socketen som har den
          porten. Konsekvensen er verdt å tenke gjennom:{" "}
          <strong>to datagram fra helt forskjellige kilder — ulik kilde-IP og ulik kildeport — havner
          i samme socket</strong>, så lenge målporten er den samme. Det er ikke en feil, det er
          definisjonen.
        </p>

        <LectureBeat>TCP: hele firertuppelen</LectureBeat>
        <p>
          TCP er forbindelsesorientert, og en TCP-socket identifiseres av{" "}
          <strong>alle fire</strong>: kilde-IP, kildeport, mål-IP og målport. Mottakeren bruker alle
          fire til å velge socket. Derfor kan en server ha mange samtidige TCP-sockets, én per
          tilkoblet klientprosess.
        </p>
        <p className="rounded-lg border border-amber-500/30 bg-background/60 px-3 py-2">
          Og her får du svaret på gåten fra socket-programmeringen: tre datagram kan komme inn til
          en webserver alle med <strong>målport 80</strong> — det er ikke tilfeldig, det{" "}
          <em>skal</em> være slik. Med UDP hadde de havnet i samme socket. Med TCP skiller
          firertuppelen dem, fordi kilde-IP og/eller kildeport er ulike, og de demultiplekses korrekt
          til hver sin dedikerte socket. Det er derfor den nye socketen kan ha samme portnummer som
          velkomst-socketen.
        </p>
      </LectureNote>

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            { term: "Portnummer", icon: <PortNumberIcon />, body: "16-bits ID per socket. Velkjente: 80, 443, 53, 22." },
            { term: "Multipleksing (mux)", icon: <MuxIcon />, body: "Mange sockets inn → én IP-strøm ut." },
            { term: "Demultipleksing (demux)", icon: <DemuxIcon />, body: "Én IP-strøm inn → riktig socket via port." },
            {
              term: "UDP-demux: 2-tuppel",
              icon: <TwoTupleIcon />,
              body: "Kun (dest-IP, dest-port). Server leser kilde selv.",
            },
            { term: "TCP-demux: 4-tuppel", icon: <FourTupleIcon />, body: "(kilde-IP, kilde-port, dest-IP, dest-port)." },
            {
              term: "Lytte-socket vs forbindelse-socket",
              icon: <ListenSocketIcon />,
              body: "Lytter venter; forbindelse er per 4-tuppel.",
            },
            { term: "Ephemeral port", icon: <EphemeralPortIcon />, body: "Tilfeldig høy port klienten får av OS." },
            { term: "Velkjente porter (0-1023)", icon: <WellKnownPortIcon />, body: "IANA-reservert, root-only på Unix." },
            {
              term: "Registrerte porter (1024-49151)",
              icon: <RegisteredPortIcon />,
              body: "IANA-listet, ikke OS-beskyttet (MySQL, Redis…).",
            },
            {
              term: "Dynamiske porter (49152-65535)",
              icon: <DynamicPortIcon />,
              body: "Til ephemeral-bruk; TIME_WAIT etter lukking.",
            },
            {
              term: "NAT port-forwarding",
              icon: <NatIcon />,
              body: "Hjemme-ruter mapper privat:port ↔ offentlig:port.",
            },
            {
              term: "bind() og connect()",
              icon: <BindConnectIcon />,
              body: "bind = ta lokal port; connect = sett dest + handshake.",
            },
            { term: "Port-uttømming", icon: <PortExhaustionIcon />, body: "Slipper opp ephemeral → EADDRNOTAVAIL." },
            { term: "Demux-mismatch og RST", icon: <RstIcon />, body: "Ingen socket matcher → RST tilbake." },
          ]}
        />
        <Illustration caption="TCP-demux med 4-tuppel: én lytte-port, hver aktiv forbindelse får egen socket.">
          <MuxDemuxSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="Lågårdsskolens postsystem">
          <p>
            En postmann (postmannen = IP-laget) kommer til hovedinngangen og leverer hele dagens
            postbunke på resepsjonen. På bunken står bare «Lågårdsskolen, 4000 Stavanger».
            Resepsjonisten (transport-laget) plukker så ett og ett brev, leser klasse-rom-nummeret
            på konvolutten, og legger brevet i riktig posthylle.
          </p>
          <p>
            Klasserommet er prosessen. Romnummeret er portnummeret. Hovedadressen er IP-adressen.
            Demultipleksing = resepsjonistens sortering. Uten det havner alt på samme bord, og
            historielæreren må sile gjennom matte-prøver for å finne sine fagsvar.
          </p>
        </Metafor>

        <Metafor tittel="4-tuppel = Tinder-match, 2-tuppel = anonym DM-boks">
          <p>
            TCP er som Tinder-match: det matcher én bestemt klient med én bestemt server-instans.
            Identiteten består av begge parters fulle adresse — derfor 4-tuppel. To forskjellige
            klienter mot samme server-port får hver sin private samtale.
          </p>
          <p>
            UDP er som en anonym DM-boks: alle som vet rom-nummeret kan slenge en lapp inn. Server
            må selv kikke på «hvem kommer dette fra»-feltet på lappen. Bare 2-tuppel: (dest-IP,
            dest-port).
          </p>
        </Metafor>
      </div>

      <Metafor tittel="Ephemeral porter = engangs-mobilnumre">
        <p>
          Når du ringer pizzeria-en bruker du ditt eget telefonnummer. Pizzeria-en vet alltid hvor
          den skal ringe tilbake. Men hvis du har 3 faner åpne mot <code>nrk.no</code> samtidig, kan
          ikke alle bruke nummer «1». Hver fane må ha sitt eget engangs-mobilnummer (51001, 51002,
          51003) som OS-et leverer ut.
        </p>
        <p>
          TIME_WAIT er karantenetiden før nummeret kan brukes igjen — for å unngå at gamle samtaler
          forveksles med nye når noen ringer tilbake til samme nummer.
        </p>
      </Metafor>

      <Illustration caption="Portnumre som rom-nummer i et postsystem: én adresse (IP), mange rom (porter).">
        <PortRomNummerSvg />
      </Illustration>

      <Hvorfor title="Hvorfor 4-tuppel for TCP, men 2-tuppel for UDP?">
        <p>
          TCP er forbindelsesorientert: det skal samle en logisk strøm fra én bestemt klient, ikke
          fra hvilken som helst klient som tilfeldigvis sender til samme port. Hvis to klienter
          sender til samme server-port og demux brukte bare 2-tuppel, ville TCP blande
          sekvensnumrene deres. Resultat: kaos. 4-tuppelen gir hver forbindelse sitt eget
          identitets-rom.
        </p>
        <p>
          UDP, derimot, vet ingenting om «forbindelser». Hver pakke er uavhengig. Det er
          applikasjonens jobb å vite hvem som sendte hva — derfor leverer recvfrom() også
          avsender-adressen ved siden av dataen. Med 2-tuppel kan én server-socket motta fra mange
          klienter uten ekstra OS-bokføring. Det er enklere og raskere, men også grunnen til at en
          UDP-server må håndtere multi-klient-logikk i applikasjonskoden.
        </p>
      </Hvorfor>

      <Example title="Eksempel: tre faner mot samme server">
        <p>
          Du har tre faner åpne mot <code>nrk.no</code> (IP 1.2.3.4, port 443). Maskinen din har IP
          10.0.0.50. Hver fane åpner en TCP-forbindelse. OS-en tildeler ephemeral porter, for
          eksempel 51001, 51002, 51003.
        </p>
        <p className="mt-2 font-mono text-[12px]">
          Socket-1: (10.0.0.50, 51001, 1.2.3.4, 443)
          <br />
          Socket-2: (10.0.0.50, 51002, 1.2.3.4, 443)
          <br />
          Socket-3: (10.0.0.50, 51003, 1.2.3.4, 443)
        </p>
        <p className="mt-2 text-muted-foreground">
          Når server-svar kommer tilbake til IP 10.0.0.50 port 51002, vet TCP-stack-en eksakt
          hvilken fane-socket den skal leveres til. Hvis vi hadde brukt UDP med bare 2-tuppel
          (10.0.0.50, 443), måtte vi hatt tre ulike klient-porter — som er nettopp hva
          ephemeral-porter gjør.
        </p>
      </Example>

      <Example title="Eksempel: regn ut hvor mange samtidige forbindelser én klient kan ha mot én server">
        <p>
          En lasttest fra én klient-IP mot én server-IP/-port spør: hvor mange parallelle
          TCP-forbindelser kan vi etablere før vi tomgang?
        </p>
        <p className="mt-2 font-mono text-[12px]">
          4-tuppel = (klient-IP, klient-port, server-IP, server-port)
          <br />
          Klient-IP, server-IP, server-port: ALLE faste.
          <br />
          Bare klient-port varierer → ephemeral-pool er flaskehalsen.
          <br />
          <br />
          Linux-default: net.ipv4.ip_local_port_range = 32768-60999
          <br />
          → 60999 - 32768 = 28231 mulige porter
          <br />
          <br />
          Hvis hver forbindelse holdes åpen, klarer vi ca. 28 000 samtidig.
          <br />
          Hvis hver forbindelse lukkes og en ny åpnes per sekund, og TIME_WAIT er 60 s:
          <br />
          → opp til 60·N porter er «opptatt» til enhver tid for rate N forb/s
          <br />→ maks bærekraftig rate ≈ 28231 / 60 ≈ 470 forb/s
        </p>
        <p className="mt-2 text-muted-foreground">
          Når du leser om «netstat viser tusenvis av TIME_WAIT», er det dette: kjernen holder
          tuppelen reservert for å beskytte mot gamle pakker. Web-benchmarks som ber om 50 000 req/s
          fra én klient mot én server treffer denne barrieren først — løsning er å skalere klient-
          IP-er (eller bruke connection-pooling).
        </p>
      </Example>

      <RelatedSlugs slugs={["transportlag", "tcp-sockets"]} />
    </article>
  );
}

// ============================================================
// 3.3 — UDP
// ============================================================
const ANSLAG_33: Anslag[] = [
  {
    id: "k3-udp-sjekksum",
    tema: "Sjekksum",
    sporsmal: <>Har UDP feildeteksjon?</>,
    valg: [
      "Nei — UDP har ingen form for feilsjekk",
      "Ja, en sjekksum som avdekker bitfeil, men den retter ingenting",
      "Ja, og den retter bitfeil automatisk",
      "Bare når den brukes sammen med TCP",
    ],
    riktig: 1,
    fasit: (
      <>
        UDP har en <strong>sjekksum</strong>. Den <em>oppdager</em> at noe er endret underveis, men kan
        ikke rette det — segmentet forkastes bare. Å «ikke love pålitelighet» er altså ikke det samme som
        å «ikke sjekke noe».
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Vi setter UDP i bås som «protokollen uten noe som helst». Men den har akkurat det minimum som
        trengs for å slippe å levere åpenbart ødelagte data videre.
      </>
    ),
  },
  {
    id: "k3-dns-udp",
    tema: "Hvorfor DNS bruker UDP",
    sporsmal: <>Hvorfor kjører DNS-oppslag typisk over UDP og ikke TCP?</>,
    valg: [
      "Fordi DNS-svar er for store for TCP",
      "Fordi et oppslag er én liten spørring og ett lite svar — håndtrykket ville kostet mer enn selve utvekslingen",
      "Fordi TCP ikke støtter port 53",
      "Fordi UDP er kryptert",
    ],
    riktig: 1,
    fasit: (
      <>
        Et oppslag er én forespørsel og ett svar. Med TCP ville du brukt en hel rundtur bare på å sette
        opp forbindelsen — og så en til på selve spørsmålet. Går svaret tapt, er det billigere å spørre
        på nytt enn å ha betalt for et håndtrykk.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Fordi «viktig data bør bruke TCP» er en god tommelfingerregel. Men når meldingen er mindre enn
        oppsettskostnaden, snur regnestykket.
      </>
    ),
  },
];

function Section33() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="3.3" title="UDP — User Datagram Protocol" />

      <p className="text-muted-foreground">
        UDP er det minimalistiske transportlaget. Det legger ekstremt lite oppå IP — i praksis bare
        portnumre og en lengde-/sjekksum-felt. Det er ingen forbindelses-etablering, ingen
        retransmisjon, ingen ordning, ingen flow control, ingen congestion control. Det høres ut som
        en svakhet, men for visse applikasjoner er det nøyaktig det man trenger.
      </p>

      <Section32Live />

      <AnslagPanel
        avsloring="knapp"
        tittel="Anslå først — UDP"
        intro={<>To spørsmål om hva UDP faktisk har, og når det er riktig valg.</>}
        anslag={ANSLAG_33}
      />

      <LectureNote title="UDP: hvorfor det minimale finnes">
        <p>
          UDP kan være så enkel nettopp fordi tjenesten den lover er så beskjeden:{" "}
          <em>best effort</em>. Den sender segmenter og håper de kommer fram. De kan gå tapt, de kan
          komme i feil rekkefølge — og da er det ikke så mye igjen å gjøre. Ingen håndtrykk trengs,
          ingen delt tilstand mellom sender og mottaker (derfor{" "}
          <strong>forbindelsesløs</strong>), og hvert segment håndteres helt uavhengig av alle andre.
        </p>
        <p>
          Så hvorfor finnes den? Fire gode grunner.{" "}
          <strong>Ingen oppsettsforsinkelse</strong> — en UDP-avsender sender bare, uten å vente på
          en håndtrykksrunde. <strong>Ingen forbindelsestilstand</strong> å holde styr på.{" "}
          <strong>Liten header</strong>, altså lite overhead. Og kanskje viktigst:{" "}
          <strong>ingen metningskontroll</strong> — en UDP-avsender kan fyre løs så fort den vil, og
          fortsetter å fungere selv når nettet er overbelastet, noe TCP har det verre med.
        </p>
        <p>
          Nettopp de egenskapene gjør den nyttig for bestemte ting. Strømmet multimedia tåler litt
          tap, men er ratefølsom og vil ikke bremses hardt. DNS og SNMP <em>må</em> fungere når nettet
          er i dårlig forfatning. Og trenger du pålitelighet, kan du bygge den selv i
          applikasjonslaget — som er nøyaktig det HTTP/3 gjør.
        </p>

        <LectureBeat>Segmentet: fire felt, og hvorfor hvert av dem er der</LectureBeat>
        <p>
          <strong>Kildeport</strong> og <strong>målport</strong> til multipleksing og
          demultipleksing. <strong>Lengde</strong>, fordi nyttelasten har variabel størrelse og
          mottakeren må vite hvor segmentet slutter. Og <strong>sjekksum</strong>. Det er alt.
        </p>

        <LectureBeat>Internett-sjekksummen — følg med, den kommer igjen</LectureBeat>
        <p>
          Ideen er enkel. Tenk at jeg sender deg to tall <em>og</em> summen av dem. Du legger sammen
          de to tallene du mottok og sammenligner med summen du mottok. Sender jeg 5, 6 og 11, men du
          mottar 4, 6 og 11, blir din sum 10 mot mottatt sjekksum 11 — og du vet at noe er galt.
        </p>
        <p>
          UDP gjør nøyaktig dette: avsenderen behandler segmentets innhold — inkludert
          header-feltene og IP-adressene — som en rekke 16-bits heltall, legger dem sammen, tar
          én-komplementet og legger resultatet i sjekksumfeltet. Mottakeren regner det samme og
          sammenligner. Ulikt betyr feil.
        </p>
        <p className="rounded-lg border border-amber-500/30 bg-background/60 px-3 py-2">
          Men her er poenget som er verdt å ta med seg:{" "}
          <strong>lik sjekksum betyr ikke at alt er i orden.</strong> To bit-feil kan oppveie
          hverandre — vipp to bits i det ene tallet og to i det andre på riktig måte, og summen blir
          identisk. Feilen går uoppdaget gjennom. Internett-sjekksummen er en form for beskyttelse,
          ikke en garanti. Sterkere metoder for både å oppdage og rette feil møter vi i lenkelaget og
          i sikkerhet.
        </p>
      </LectureNote>

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            { term: "Forbindelsesløs", icon: <ConnectionlessIcon />, body: "Ingen handshake. Spar 1 RTT." },
            {
              term: "UDP-header (8 bytes)",
              icon: <UdpHeaderIcon />,
              body: "Kilde-port, dest-port, lengde, sjekksum. Slutt.",
            },
            { term: "Sjekksum", icon: <ChecksumIcon />, body: "16-bits one's-complement; detekterer, korrigerer ikke." },
            { term: "Melding-grenser bevares", icon: <MessageBoundaryIcon />, body: "Hvert sendto() = én pakke." },
            {
              term: "Når UDP slår TCP",
              icon: <UdpVsTcpIcon />,
              body: "Sanntid, korte spørringer, multicast, custom-pålitelighet.",
            },
            {
              term: "QUIC-paradokset",
              icon: <QuicIcon />,
              body: "HTTP/3 over UDP — bygger TCP-erstatning i userspace.",
            },
            {
              term: "Pseudo-header for sjekksum",
              icon: <PseudoHeaderIcon />,
              body: "IP-adresser tas med i sjekksum-beregning.",
            },
            {
              term: "Maksimal UDP-pakke",
              icon: <MaxPacketIcon />,
              body: "65507 bytes; men IP fragmenterer over MTU (~1500).",
            },
            { term: "Frivillig sjekksum (IPv4)", icon: <OptionalChecksumIcon />, body: "Kan settes til 0; obligatorisk på IPv6." },
            { term: "Demux ved port", icon: <PortUnreachableIcon />, body: "Ingen lytter → ICMP «port unreachable»." },
            { term: "Bruk-tilfeller", icon: <UseCasesIcon />, body: "DNS, DHCP, NTP, QUIC, VoIP, spill, multicast." },
            { term: "VoIP-valg", icon: <VoipIcon />, body: "20 ms tale-pakker; tap = liten knirk, TCP ville frosset." },
            { term: "DCCP", icon: <DccpIcon />, body: "UDP + congestion control. Sjelden brukt." },
          ]}
        />
        <Illustration caption="UDP-header: 8 bytes, fire 2-byte-felter. TCP-headeren er minst 20.">
          <UdpHeaderSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="UDP = postkort, TCP = rekommandert brev">
          <p>
            <strong>UDP er et postkort:</strong> du skriver adressen, slenger det i postkassen, og
            håper det kommer fram. Ingen kvittering. Ingen forsegling. Postmannen kan lese alt. Hvis
            det blir borte, så blir det borte. Til gjengjeld er det billig, lett, og du slipper å gå
            innom postkontoret for å sette opp en avtale.
          </p>
          <p>
            <strong>TCP er rekommandert brev med kvittering:</strong> du må gå innom postkontoret
            (handshake), du får sporings-nummer, kvittering på leveranse, og hvis brevet ikke kommer
            fram blir det sendt på nytt. Pålitelig, men trege og omstendelig.
          </p>
        </Metafor>

        <Metafor tittel="QUIC = postkort med eget sporings-system limt på">
          <p>
            QUIC (HTTP/3) er som å sende et postkort, men limt på et eget DIY sporings-system: du
            nummererer postkortene selv, sender dem på nytt hvis de blir borte, og noterer
            leveringen i din egen loggbok. Hvorfor ikke bare bruke rekommandert?
          </p>
          <p>
            Fordi postkontorene (NAT-bokser, brannmurer) godtar postkort ukritisk, men rekommanderte
            forsendelser krever spesielle skjemaer. Postkortet er fluktveien — du får
            TCP-pålitelighet uten å være låst til kjernens TCP-stack.
          </p>
        </Metafor>
      </div>

      <Metafor tittel="DNS over UDP = SMS-spørsmål til kompisen">
        <p>
          Du sender SMS: «Hva er adressen til Burger King på Nedre Holmegate?». Kompisen svarer:
          «Verftsgata 14». Total tid: 2 sekunder. Du kunne ringt og hatt en høflig samtale med
          oppstarts-fraser og avslutnings-fraser («Hei Pål, hvordan går det? Du, kjapt spørsmål…
          jaja, ha det bra»), men det ville tatt 30 sekunder for samme svar.
        </p>
        <p>
          DNS-oppslag er sekund-kritisk for hver eneste nettside-lasting. UDP gir deg 1 RTT total.
          TCP ville krevd 2 RTT (handshake + spørring). Når svaret uansett er kort, og du kan bare
          prøve igjen hvis SMS-en blir borte, er det åpenbart valg.
        </p>
      </Metafor>

      <Illustration caption="Postkort vs rekommandert: UDP og TCP visualisert som postvesen-metafor.">
        <PostkortVsRekSvg />
      </Illustration>

      <Hvorfor title="Hvorfor finnes UDP når TCP gir mye mer?">
        <p>
          Det enkleste svaret: TCP gir for mye. For en spill-pakke som mister relevans etter 50 ms,
          er TCPs retransmisjon ikke bare unyttig, den er skadelig — den blokkerer nyere pakker som
          ennå er nyttige. For DNS er handshake-tiden større enn selve oppslaget. For multicast er
          TCP umulig (TCP er punkt-til-punkt; det finnes ikke noe meningsfullt «vindu» for tusen
          mottakere).
        </p>
        <p>
          Et dypere svar er at transportlaget skulle gi en meny, ikke et diktat.
          Internet-arkitektene ville unngå at alle apper måtte bygges på TCPs antagelser. Ved å
          holde UDP minimalistisk, gjør de det mulig å bygge nye transportprotokoller oppå UDP
          (QUIC, DCCP-i-userspace, custom-rate-styring) uten å vente på at kjernen oppgraderes. UDP
          er escape hatch-en.
        </p>
        <p>
          Det er også grunnen til at midt-bokser (NAT, brannmurer) støtter UDP, men ofte blokkerer
          rare nye protokoller. UDP er kjent territorium og slipper gjennom; alt nytt må derfor
          forkles som UDP for å overleve i den ekte verden. QUIC er det perfekte eksempelet.
        </p>
      </Hvorfor>

      <Example title="Eksempel: hvorfor DNS bruker UDP">
        <p>
          Et DNS-oppslag er typisk &lt; 512 bytes inn og &lt; 512 bytes ut. Med TCP måtte du brukt 1
          RTT på handshake, 1 RTT på spørringen, totalt 2 RTT. Med UDP er det 1 RTT — du sender
          spørringen i første pakke, får svar i andre.
        </p>
        <p className="mt-2">
          Hvis pakken mistes, kan klienten timeout-e og prøve igjen — eller spørre en annen DNS-
          server. Logikken er ikke kompleks, og overhead-en av å bygge inn en hel TCP-stack ville
          dvergvokse selve oppslaget. For en webside med 30 ressurser fra 10 ulike domener er det 10
          DNS-oppslag — å spare 1 RTT på hvert blir merkbart.
        </p>
      </Example>

      <Example title="Eksempel: beregn UDP-sjekksum trinn for trinn">
        <p>
          Anta en UDP-pakke med tre 16-bits ord: 0x4500, 0x0028, 0x9C5A. Vi beregner sjekksummen
          slik UDP gjør (one&apos;s-complement).
        </p>
        <p className="mt-2 font-mono text-[12px]">
          Steg 1: Summer ordene som 16-bits tall, propager overflow.
          <br />
          0x4500 + 0x0028 = 0x4528
          <br />
          0x4528 + 0x9C5A = 0xE182 (ingen overflow her, 0xE182 &lt; 0x10000)
          <br />
          <br />
          Steg 2: One&apos;s-complement (flip alle bits).
          <br />
          0xE182 = 1110 0001 1000 0010
          <br />
          ~0xE182 = 0001 1110 0111 1101 = 0x1E7D
          <br />
          <br />
          Sjekksum-felt i UDP-header = 0x1E7D
          <br />
          <br />
          Mottakers verifisering: summer ALLE ord inkl. sjekksum.
          <br />
          0x4500 + 0x0028 + 0x9C5A + 0x1E7D = 0xFFFF (alle 1-ere)
          <br />→ pakke OK. Hvis ikke alle bits er 1 etter sum, drop pakken.
        </p>
        <p className="mt-2 text-muted-foreground">
          One&apos;s-complement har en fin matematisk egenskap: hvis pakken ankommer uskadd og du
          legger sjekksumfeltet til summen, får du alltid alle 1-ere (0xFFFF). Avviket fra dette er
          beviset på korrupsjon. Algoritmen er dårligere enn CRC-32 (Ethernet bruker det), men
          fryktelig billig — én add per ord. Det er bevisst valg av enkelhet over robusthet.
        </p>
      </Example>

      <RelatedSlugs slugs={["transportlag", "dte2507-voip-rtp"]} />
    </article>
  );
}

// ============================================================
// 3.4 — Pålitelig data-transport
// ============================================================
const ANSLAG_34: Anslag[] = [
  {
    id: "k3-hvorfor-seknr",
    tema: "Sekvensnumre",
    sporsmal: (
      <>
        Avsenderen sender en pakke, mottakeren kvitterer — men <strong>kvitteringen</strong> går tapt.
        Avsenderen sender pakken på nytt. Hvilket problem oppstår, og hva løser det?
      </>
    ),
    valg: [
      "Ingen problem — mottakeren merker ikke noe",
      "Mottakeren får en duplikat den ikke kan skille fra ny data. Sekvensnumre løser det",
      "Pakken går i evig løkke. Timeout løser det",
      "Forbindelsen brytes. Håndtrykk løser det",
    ],
    riktig: 1,
    fasit: (
      <>
        Uten sekvensnummer ser retransmisjonen ut som <em>ny</em> data, og mottakeren leverer den samme
        byten to ganger opp til appen. <strong>Sekvensnummeret</strong> gjør duplikaten gjenkjennelig —
        og det er nettopp derfor det ble innført i RDT-progresjonen.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Man tenker på tap som «noe forsvant», og glemmer at et tapt <em>kvitteringsbrev</em> gir
        dobbeltsending i stedet. Feilen flytter seg fra manglende data til for mye data.
      </>
    ),
  },
  {
    id: "k3-gbn-sr",
    tema: "GBN mot SR",
    sporsmal: (
      <>
        Fem pakker er sendt. Nummer 2 går tapt, de andre kommer fram. Hva sender avsenderen på nytt med{" "}
        <strong>Go-Back-N</strong>?
      </>
    ),
    valg: ["Bare pakke 2", "Pakke 2, 3, 4 og 5", "Alle fem på nytt", "Ingenting — GBN venter på timeout for hver"],
    riktig: 1,
    fasit: (
      <>
        GBN sender <strong>alt fra og med den tapte</strong> på nytt — også de tre som faktisk kom fram.
        Selective Repeat sender bare pakke 2, men må til gjengjeld bufre de andre hos mottakeren og holde
        styr på hver enkelt. Enkelhet mot båndbredde.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Å sende om igjen data som kom fram virker åpenbart dumt. Poenget er at GBN slipper å bufre og
        bokføre noe som helst hos mottakeren — den betaler med båndbredde for å slippe kompleksitet.
      </>
    ),
  },
];

function Section34() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="3.4" title="Pålitelig data-transport (RDT)" />

      <p className="text-muted-foreground">
        Hvordan bygger man pålitelig dataoverføring oppå en upålitelig kanal? Vi bygger det
        inkrementelt med RDT-protokollene (Reliable Data Transfer). Hver versjon legger til
        håndtering av ett nytt problem, og avslutter med RDT 3.0 — en protokoll som faktisk virker
        over en kanal som taper, korrumperer og forsinker.
      </p>

      <Section33Live />

      <AnslagPanel
        avsloring="knapp"
        tittel="Anslå først — pålitelighet fra bunnen"
        intro={<>To spørsmål som RDT-progresjonen under er bygget for å svare på.</>}
        anslag={ANSLAG_34}
      />

      <LectureNote title="Pålitelig overføring: bygg protokollen steg for steg">
        <p>
          Dette er en av de virkelig fundamentale utfordringene i hele faget: hvordan kan to parter
          kommunisere <em>pålitelig</em> over en kanal som selv er upålitelig — som mister, vrenger og
          stokker om meldinger? Metoden er å starte med en perfekt kanal, og så innføre én realistisk
          antakelse om gangen og se hvilken mekanisme som må til for å bøte på den.
        </p>
        <p>
          Merk oppsettet: tjenesten vi tilbyr applikasjonene er <strong>enveis</strong> — data fra
          avsender til mottaker. Men <em>inne i</em> protokollen må meldinger gå{" "}
          <strong>begge veier</strong>, fordi mottakersiden må kunne svare avsendersiden.
        </p>
        <p className="rounded-lg border border-amber-500/30 bg-background/60 px-3 py-2">
          Det viktigste tankeskiftet: det er lett for <em>oss</em> å se begge sider samtidig og si «der
          gikk pakken tapt, altså må denne parten gjøre sånn». Men avsenderen ser ikke det. Den vet
          ingenting om hva som skjedde med det den sendte — med mindre mottakeren{" "}
          <strong>signaliserer tilbake</strong>. Tenk deg et forheng mellom dem: alt den ene vet om den
          andre, er lært gjennom meldinger.
        </p>

        <LectureBeat>Tilstandsmaskiner, og hvorfor ikke bare skrive tekst</LectureBeat>
        <p>
          Skal vi spesifisere en protokoll, duger ikke prosa — den kan mistolkes og den blir lett
          ufullstendig («å ja, det tilfellet glemte jeg»). Derfor{" "}
          <strong>endelige tilstandsmaskiner</strong>: tilstander, <em>hendelser</em> som utløser
          overganger mellom dem, og <em>handlinger</em> som utføres. En lysbryter er det minimale
          eksempelet: to tilstander, to hendelser, og en handling (lyset tennes).
        </p>

        <LectureBeat>Steg for steg</LectureBeat>
        <p>
          <strong>Perfekt kanal.</strong> Latterlig enkelt: avsenderen pakker og sender, mottakeren
          leser og leverer opp. Én tilstand hver.
        </p>
        <p>
          <strong>Bits kan vippe.</strong> Nå trengs mekanismer — og her hjelper det å tenke på hvordan{" "}
          <em>mennesker</em> gjør det når noe blir uforståelig i en samtale. Vi bekrefter («ja, jeg
          hørte»), vi avkrefter («nei, det fikk jeg ikke med meg»), og vi ber om at det gjentas. Det
          gir <strong>ACK</strong>, <strong>NAK</strong> og <strong>retransmisjon</strong> — pluss{" "}
          <strong>sjekksum</strong> for i det hele tatt å oppdage feilen. Avsenderen sender og venter
          på svar før den går videre: <strong>stopp-og-vent</strong>.
        </p>
        <p>
          <strong>Men så den fatale feilen.</strong> Hva om <em>kvitteringen</em> blir ødelagt? Nå
          vet ikke avsenderen om mottakeren fikk pakken riktig eller ikke. Retransmitterer den, kan
          mottakeren få <em>to kopier</em> og tro at den andre er nye data. Lar den være, risikerer
          den at pakken aldri kom fram.
        </p>
        <p>
          Løsningen er å retransmittere <em>uansett</em>, og gi hver pakke et{" "}
          <strong>sekvensnummer</strong> så mottakeren kan kjenne igjen duplikater og kaste dem — det
          vil si, ikke levere dem opp til applikasjonen, som slett ikke vil ha to eksemplarer av det
          samme. For en stopp-og-vent-protokoll holder det med{" "}
          <strong>ett bit</strong> sekvensnummer, siden det bare finnes én pakke i lufta av gangen.
        </p>
        <p>
          Dermed har vi fire mekanismer, og de er nøyaktig de samme som TCP bruker i praksis:{" "}
          <strong>feildeteksjonsbits</strong> (sjekksum), <strong>kvitteringer</strong>,{" "}
          <strong>retransmisjon</strong> ved oppdaget feil, og{" "}
          <strong>sekvensnumre</strong> for å avsløre retransmisjoner. Det er for øvrig mulig å klare
          seg helt uten NAK og bare bruke ACK — ingen ny mekanisme, bare de samme brukt litt
          annerledes. Det er den varianten TCP har valgt.
        </p>
        <p>
          Ett tilfelle står fortsatt igjen: hva om pakker faktisk går <em>tapt</em> i kanalen? Da
          trengs en mekanisme til — en tidtaker.
        </p>
      </LectureNote>

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            { term: "RDT 1.0", icon: <Rdt1Icon />, body: "Perfekt kanal — bare send og motta." },
            { term: "RDT 2.0", icon: <Rdt2Icon />, body: "Bit-feil → + sjekksum, ACK/NAK." },
            { term: "RDT 2.1", icon: <Rdt21Icon />, body: "Korrupt ACK → + 1-bits sekvensnr." },
            { term: "RDT 2.2", icon: <Rdt22Icon />, body: "Forenkling: duplikat-ACK erstatter NAK." },
            { term: "RDT 3.0", icon: <Rdt3Icon />, body: "Pakketap → + timeout + retransmisjon." },
            { term: "Stop-and-wait", icon: <StopAndWaitIcon />, body: "Send én, vent ACK. Trygt, men tregt." },
            { term: "Pipelining", icon: <PipeliningIcon />, body: "Flere pakker «in flight» samtidig." },
            { term: "Go-Back-N (GBN)", icon: <GoBackNIcon />, body: "Tap → retransmitter alt fra første ubekreftet." },
            { term: "Selective Repeat (SR)", icon: <SelectiveRepeatIcon />, body: "Tap → retransmitter bare den tapte." },
            { term: "Sekvensnr-rom", icon: <SeqSpaceIcon />, body: "GBN: ≥ N+1. SR: ≥ 2N." },
            { term: "Utnyttelse U", icon: <UtilizationIcon />, body: "U = (L/R)/(RTT + L/R). Lav på fete lenker." },
            { term: "BDP", icon: <BdpIcon />, body: "Båndbredde × RTT = bytes som «får plass» i røret." },
            { term: "Duplikat-deteksjon", icon: <DuplicateDetectIcon />, body: "Sekvensnr → idempotent leveranse." },
            { term: "NAK vs duplikat-ACK", icon: <NakDupAckIcon />, body: "Duplikat-ACK gir samme info som NAK." },
            { term: "Timeout vs RTT-estimat", icon: <TimerIcon />, body: "For kort = spam; for lang = treg." },
          ]}
        />
        <Illustration caption="RDT-progresjonen: hver versjon legger til håndtering av ett nytt feil-scenario.">
          <RdtProgressionSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="RDT 3.0 = huskeliste over telefon">
          <p>
            Du ringer bestemoren din og dikterer en handleliste: «Melk. Brød. Egg. Smør.» Etter hver
            ting gjentar hun tilbake: «Melk» — du sier «ok». Det er ACK.
          </p>
          <p>
            Hvis hun ikke hørte deg (bit-feil), spør hun «hva sa du?» — det er NAK, og du gjentar.
            Hvis du nettopp har sagt «melk» og hun gjentar «melk», men du så åpner munnen for å si
            «brød» og hun samtidig sier «melk» igjen — er det andre «melk» en gjentakelse eller en
            ny vare? Du nummererer: «Vare 1: melk. Vare 2: brød.» Det er sekvensnummeret.
          </p>
          <p>
            Hvis linjen klikker bort midt i et ord (pakketap), og du sitter og venter — har du
            telefon-vakthold på? Du bestemmer: «hvis hun ikke svarer på 5 sekunder, gjenta det jeg
            sa.» Det er timeout. Hvis hun faktisk hørte «melk» men du tror linjen brakk, og du
            gjentar «melk», ser hun at det er vare 1 og setter ikke melk på listen to ganger.
          </p>
        </Metafor>

        <Metafor tittel="GBN vs SR = bagasje-bånd vs pakke-utlevering">
          <p>
            <strong>Go-Back-N er bagasje-båndet på flyplassen:</strong> alle kofferter må komme i
            samme rekkefølge som de ble pakket inn. Hvis koffert #4 mangler, kaster bakker-en alle
            koffertene som kommer etter, og forlanger at flyselskapet sender hele bunken på nytt fra
            #4 og framover. Veldig enkel mottaker (ingen buffer), veldig sløsete.
          </p>
          <p>
            <strong>Selective Repeat er post-pakke-utlevering:</strong> hver pakke har eget
            sporings- nummer. Hvis pakke #4 forsvinner, oppbevarer mottakeren #5, #6, #7 i lageret
            og venter bare på at #4 skal sendes på nytt. Smartere, men krever buffer-plass og
            bok-holderi.
          </p>
        </Metafor>
      </div>

      <Metafor tittel="Stop-and-wait på fiber = supersonisk fly med 1 koffert">
        <p>
          Tenk på et supersonisk fly som flyr Oslo–Tromsø på 30 ms. Det har plass til 1000
          kofferter, men du sender bare én koffert per tur, og venter på at flyet returnerer tomt
          før du sender neste. Utnyttelse: 0.1 %.
        </p>
        <p>
          Pipelining = pakk flyet fullt før hver avgang. Båndbredde-forsinkelse-produktet er hvor
          mange kofferter som passer i flyet under én tur. På fiber-lenker er det enormt — vinduet
          må være tilsvarende stort, ellers «flyr du tomt».
        </p>
      </Metafor>

      <Illustration caption="Stop-and-wait vs pipelining: forskjellen mellom tom og full fly-lass per tur.">
        <StopAndWaitVsPipelineSvg />
      </Illustration>

      <Hvorfor title="Hvorfor bygge RDT inkrementelt i stedet for å hoppe rett til full TCP?">
        <p>
          Pedagogisk poeng: hver versjon (1.0 → 2.0 → 2.1 → 2.2 → 3.0) introduserer ett nytt problem
          og én ny mekanisme. Det gjør at du kan svare «hvorfor sekvensnummer?» og «hvorfor
          timeout?» med et konkret eksempel — ikke bare «fordi TCP gjør det». Det er mye lettere å
          feilsøke en ekte TCP-stack hvis du har tankesporet fra 2.1 (sekvensnr trengs fordi ACK kan
          korrumperes) fortsatt i hodet.
        </p>
        <p>
          Praktisk poeng: minst tre virkelige protokoller ligner mye på en av RDT-versjonene. Stop-
          and-wait brukes fortsatt i enkelte sensor-protokoller (LoRaWAN). Go-Back-N er praktisk
          talt 1990-tallets TCP. Selective Repeat ligner det moderne SACK-utvidelser gir. Å forstå
          mekanismene én og én gjør at du kan plassere enhver virkelig protokoll på spektrumet.
        </p>
        <p>
          Generelt prinsipp: hvis en mekanisme legger til kompleksitet, skal du være i stand til å
          peke på det konkrete problemet den løser. RDT-progresjonen er en demonstrasjon av denne
          øvelsen.
        </p>
      </Hvorfor>

      <Example title="Eksempel: ACK for pakke-5 går tapt i RDT 3.0">
        <p>
          Avsender sender pakke 5 med sekvensnummer 1 (vi alternerer 0/1). Mottakeren får den
          korrekt, leverer til applikasjonen, og sender ACK(1). ACK-en blir borte på veien tilbake.
        </p>
        <p className="mt-2">Sekvens av hendelser:</p>
        <ol className="list-decimal pl-5 mt-1">
          <li>Avsenderens timer går ut → retransmitter pakke 5 (fortsatt sekvensnr 1).</li>
          <li>Mottakeren får pakken igjen, ser at sekvensnr 1 = forrige, så det er duplikat.</li>
          <li>Mottakeren leverer IKKE til applikasjonen, men sender ny ACK(1).</li>
          <li>Avsenderen får ACK(1), forstår at pakke 5 ble levert, flipper til sekvensnr 0.</li>
          <li>Avsender sender pakke 6 med sekvensnr 0. Alt går videre.</li>
        </ol>
        <p className="mt-2 text-muted-foreground">
          Det avgjørende er at mottakeren ikke kan vite om dette er første eller andre forsøk på
          pakke 5 — bare at den har sekvensnr 1 og ble nettopp levert. Derfor: ACK den uten å
          gjenlevere. Idempotens er prinsippet som redder oss.
        </p>
      </Example>

      <Example title="Eksempel: GBN vs SR ved tap av pakke 4 i et vindu på 6">
        <p>
          Avsender har sendt pakker 1-6 «in flight». Pakke 4 forsvinner. Pakke 5 og 6 ankommer
          mottakeren før vi oppdager tapet.
        </p>
        <p className="mt-2 font-mono text-[12px]">
          Go-Back-N (kumulativ ACK):
          <br />
          1 OK → ACK 2 (mottaker venter på 2 neste)
          <br />
          2 OK → ACK 3
          <br />
          3 OK → ACK 4
          <br />
          4 tapt
          <br />
          5 mottatt → ACK 4 (kaster 5, kumulativ ACK står stille)
          <br />
          6 mottatt → ACK 4 (kaster 6)
          <br />
          Timeout for 4 → retransmitter 4, 5, 6 (tre pakker, to var unødvendige)
          <br />
          <br />
          Selective Repeat:
          <br />
          1, 2, 3 OK → ACK 1, ACK 2, ACK 3
          <br />
          4 tapt
          <br />
          5 OK → ACK 5 (mottaker buffer-er 5)
          <br />
          6 OK → ACK 6 (mottaker buffer-er 6)
          <br />
          Timeout for 4 → retransmitter BARE 4
          <br />4 ankommer → mottaker leverer 4, 5, 6 i orden til app
        </p>
        <p className="mt-2 text-muted-foreground">
          GBN sløst tre pakker for én tapt. SR sløst null. Prisen: SRs mottaker må ha buffer for
          ute-av-orden pakker, og hver pakke trenger egen timer hos avsenderen. TCPs SACK-utvidelse
          (Selective Acknowledgement) tar SR-ideen og pakker den inn som tilleggsinformasjon i
          kumulative ACK-er — det beste av begge verdener.
        </p>
      </Example>

      <RelatedSlugs slugs={["dte2507-rdt-progresjon", "transportlag"]} />
    </article>
  );
}

// ============================================================
// 3.5 — TCP
// ============================================================

/**
 * Gjett-før-avsløring foran TCP-simulatoren i 3.5.
 *
 * Verifisert mot buildFastRetransmitScenario() i Section34Live: segment 0–5
 * sendes, segment 1 mistes, ACK-ene for 2/3/4/5 får alle ackNum = 1 (dup), og
 * ACK-en etter fast retransmit av segment 1 har ackNum = 6.
 */
const ANSLAG_35: Anslag[] = [
  {
    id: "hva-ackes",
    tema: "Kumulativ ACK",
    sporsmal: (
      <>
        Segment 1 er borte. Segment 2, 3 og 4 kommer fram til mottakeren, pent og i rekkefølge. Hva
        sender mottakeren tilbake for hver av dem?
      </>
    ),
    valg: [
      "ACK 2, så ACK 3, så ACK 4 — den kvitterer det den fikk",
      "ACK 1 alle tre ganger",
      "Ingenting — den venter på at 1 skal komme",
      "En NAK som ber om segment 1 på nytt",
    ],
    riktig: 1,
    fasit: (
      <>
        <strong>ACK 1, tre ganger på rad.</strong> En ACK i TCP betyr «alt <em>før</em> dette
        nummeret har jeg fått» — ikke «dette segmentet fikk jeg». Siden 1 mangler, er det høyeste
        sammenhengende mottatte fortsatt 0, og svaret blir ACK 1 uansett hvor mange segmenter som
        kommer etterpå. Det er disse gjentakelsene som kalles <em>duplikat-ACK</em>, og
        dup-ACK-telleren i simulatoren teller nettopp dem.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Ordet «acknowledgement» får oss til å lese den som en kvittering for <em>den pakka som kom</em>.
        TCP-ACK-en er i stedet en tilstandsmelding om bytestrømmen: «her er jeg kommet til».
        Konsekvensen er at mottakeren ikke har noen måte å si «jeg mangler bare nummer 1» — den kan
        bare gjenta hvor den står. Hele fast retransmit-mekanismen finnes fordi avsenderen må{" "}
        <em>gjette</em> fra gjentakelsene hva som mangler. (Selective ACK, SACK, er en senere
        utvidelse som løser akkurat dette.)
      </>
    ),
  },
  {
    id: "etter-retx",
    tema: "Hva ACK-en hopper til",
    sporsmal: (
      <>
        Avsenderen får tre duplikat-ACK-er, gjør fast retransmit av segment 1, og det kommer fram.
        Mottakeren har fra før segment 2, 3, 4 og 5 liggende i bufferet. Hvilket ACK-nummer sender
        den nå?
      </>
    ),
    valg: [
      "ACK 2 — den kvitterer for segmentet som nettopp kom",
      "ACK 6",
      "Fem separate ACK-er, én per segment den nå kan levere",
    ],
    riktig: 1,
    fasit: (
      <>
        <strong>ACK 6, i ett hopp.</strong> Idet hullet tettes, blir alt fra 0 til og med 5
        sammenhengende, og den kumulative ACK-en hopper helt til toppen av det mottakeren allerede
        satt på. Én ACK kvitterer for fem segmenter.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Vi tenker at segmentene 2–5 «allerede er behandlet» og at det som skjer nå bare gjelder
        segment 1. Men de fire lå i mottakerens buffer <em>ukvitterte</em> — de kunne ikke kvitteres,
        fordi ACK-en ikke kan hoppe over et hull. Dette er også hvorfor et enkelt tap er så billig
        for TCP når det først oppdages: det koster én retransmisjon, ikke fem.
      </>
    ),
  },
  {
    id: "hvorfor-tre",
    tema: "Hvorfor akkurat tre",
    sporsmal: (
      <>
        Avsenderen venter på <strong>tre</strong> duplikat-ACK-er før den retransmitterer. Hvorfor
        ikke reagere allerede på den første?
      </>
    ),
    valg: [
      "For å gi det tapte segmentet tid til å komme fram likevel",
      "Fordi én-to duplikater like gjerne kan bety omstokking, ikke tap",
      "Tre er et vilkårlig tall valgt i standarden",
    ],
    riktig: 1,
    fasit: (
      <>
        <strong>Fordi pakker kan komme i feil rekkefølge.</strong> Tar to segmenter ulik vei gjennom
        nettet, kan de ankomme byttet om — det gir én eller to duplikat-ACK-er selv om ingenting er
        tapt. Retransmitterte du på første duplikat, ville du fylle nettet med unødige kopier hver
        gang noe ble litt omstokket. Tre er et empirisk kompromiss: nok til at omstokking er
        usannsynlig, lite nok til at du slipper å vente på RTO-en (Retransmission Timeout), som er
        mange ganger lengre.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        «Gi det tid» høres fornuftig ut, men er feil mekanisme — det er nettopp <em>timeouten</em>
        som gir tid, og fast retransmit finnes for å slippe å vente på den. Terskelen på tre handler
        ikke om tid i det hele tatt, men om å skille to årsaker som ser like ut fra avsenderens side:
        tapt pakke og omstokket pakke.
      </>
    ),
  },
];

function Section35() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="3.5" title="TCP — Transmission Control Protocol" />

      <p className="text-muted-foreground">
        TCP er en industriell implementasjon av prinsippene fra RDT, pluss pipelining, flow control
        og congestion control (siste tema for seg). Det er stream-orientert (bytes, ikke meldinger),
        bruker kumulative ACK-er, og estimerer RTT dynamisk for å sette fornuftige timeout-verdier.
      </p>

      <AnslagPanel
        avsloring="knapp"
        tittel="Anslå først — så kjører du TCP-simulatoren"
        intro={
          <>
            Fane 3 i simulatoren under («Fast retransmit») kjører dette scenariet: avsenderen sender
            segment 0, 1, 2, 3, 4 og 5 rett etter hverandre, og{" "}
            <strong>segment 1 går tapt på lenken</strong>. De andre kommer fram. Merk at simulatoren nummererer hele segmenter for lesbarhet —
            ekte TCP teller byte-offset, ikke pakker.
          </>
        }
        anslag={ANSLAG_35}
      />

      <Section34Live />

      <LectureNote title="TCP: prinsippene satt i praksis">
        <p>
          Det fine her er at det ikke kommer noe nytt: TCP bruker nøyaktig de mekanismene vi bygget
          opp i 3.4 — sjekksum, kvitteringer, sekvensnumre, timeout og retransmisjon — pluss
          pipelining. Men det er tre særegenheter å ha klart for seg.
        </p>
        <p>
          TCP er <strong>punkt-til-punkt</strong> mellom én avsender og én mottaker, det er{" "}
          <strong>full duplex</strong> (data kan flyte begge veier), og — viktigst —
          semantikken er en <strong>ordnet bytestrøm</strong>, ikke meldinger. Kontrast med UDP, som
          er meldingsorientert. Det er derfor{" "}
          <strong>sekvensnummeret er byte-nummeret til den første byten i nyttelasten</strong>, ikke
          et pakkenummer, og <strong>ack-nummeret er nummeret på den neste byten mottakeren
          venter</strong> — som samtidig kvitterer kumulativt for alt før den.
        </p>
        <p>
          Et lite kuriosum verdt å vite: hva en TCP-mottaker skal gjøre med segmenter som kommer{" "}
          <em>ut av rekkefølge</em>, sier spesifikasjonen ingenting om. Det er opp til den som
          implementerer.
        </p>

        <LectureBeat>Hvor lenge skal timeren stå?</LectureBeat>
        <p>
          For kort, og du får <strong>prematur timeout</strong> — du retransmitterer segmenter som
          ikke var tapt i det hele tatt. For lang, og TCP reagerer altfor tregt på faktiske tap.
          Verdien må åpenbart henge sammen med rundturstiden, men målte RTT-verdier spriker mye fra
          måling til måling.
        </p>
        <p>
          Derfor glattes de: TCP holder en{" "}
          <strong>eksponentielt vektet glidende gjennomsnitt</strong> av RTT, der hver ny måling
          teller med en vekt (typisk 0,125) og den gamle estimatet med resten. Timeout settes så til
          estimert RTT <em>pluss en sikkerhetsmargin</em> — og marginen er fire ganger et mål på hvor
          mye RTT-en varierer. Logikken er grei: svinger målingene mye, trenger du større margin.
        </p>

        <LectureBeat>Kvitteringene i praksis</LectureBeat>
        <p>
          Mottakeren gjør ikke alltid det enkleste. Kommer et segment i riktig rekkefølge og alt
          tidligere er kvittert, venter mange implementasjoner{" "}
          <strong>opptil et halvt sekund</strong> på om det kommer ett til — og sender så{" "}
          <em>én</em> kumulativ kvittering for begge. Det halverer ack-trafikken.
        </p>
        <p>
          Kommer det derimot et segment med <em>høyere</em> sekvensnummer enn ventet, er det oppdaget
          et hull, og mottakeren sender en <strong>duplikat-ACK</strong> som gjentar hvilken byte den
          fortsatt venter på. Fylles hullet senere, sendes en kumulativ ACK for alt som nå er på
          plass.
        </p>

        <LectureBeat>Fast retransmit — slutt å vente</LectureBeat>
        <p>
          Se for deg fem segmenter sendt, der det andre går tapt. Mottakeren kvitterer det første.
          Så kommer segment tre, fire og fem — og for hvert av dem sender mottakeren{" "}
          <em>samme</em> kvittering på nytt, fordi hullet fortsatt er der.
        </p>
        <p>
          Avsenderen ser altså den opprinnelige kvitteringen pluss{" "}
          <strong>tre duplikat-ACK-er</strong>. Det er et sterkt signal: senere segmenter{" "}
          <em>kom fram</em>, men noe mangler foran dem. Da er det liten grunn til å sitte og vente på
          at timeren skal løpe ut. <strong>Fast retransmit</strong> sier: ved tre duplikat-ACK-er,
          send det eldste ukvitterte segmentet på nytt med én gang. Det lar TCP komme seg etter et tap
          langt raskere.
        </p>
      </LectureNote>

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            { term: "Segmentering", icon: <SegmentationIcon />, body: "Del bytestrøm i MSS-store biter (~1460 B)." },
            { term: "Sekvensnummer (32 bits)", icon: <SeqNumIcon />, body: "Byte-offset, ikke pakke-teller." },
            { term: "Kumulativ ACK", icon: <CumAckIcon />, body: "ACK(N) = «alt før N har jeg»." },
            {
              term: "Tre dup-ACK = fast retransmit",
              icon: <FastRetransmitIcon />,
              body: "Retransmitter uten å vente på timeout.",
            },
            { term: "RTT-estimat (EWMA)", icon: <RttEstimateIcon />, body: "α·ny + (1-α)·gamle; α = 0.125." },
            { term: "Flow control", icon: <FlowControlIcon />, body: "rwnd = ledig plass i mottakers buffer." },
            {
              term: "3-veis handshake",
              icon: <HandshakeIcon />,
              body: "SYN → SYN-ACK → ACK. Begge sider får ISN bekreftet.",
            },
            {
              term: "TCP-tilstander",
              icon: <TcpStatesIcon />,
              body: "CLOSED → LISTEN → SYN_SENT → … → ESTABLISHED → … → TIME_WAIT.",
            },
            { term: "TCP-flags", icon: <TcpFlagsIcon />, body: "SYN, ACK, FIN, RST, PSH, URG." },
            {
              term: "Initial Sequence Number (ISN)",
              icon: <IsnIcon />,
              body: "Tilfeldig for sikkerhet (anti-spoofing).",
            },
            { term: "TIME_WAIT", icon: <TimeWaitIcon />, body: "Vent 2·MSL før 4-tuppel kan gjenbrukes." },
            { term: "MSS", icon: <MssIcon />, body: "Maks nyttelast = MTU − IP − TCP = 1460 B." },
            { term: "Karn's algoritme", icon: <KarnAlgIcon />, body: "Ikke bruk retransmittert pakke til RTT-måling." },
            { term: "Nagle's algoritme", icon: <NagleIcon />, body: "Saml små segmenter — TCP_NODELAY slår av." },
            { term: "Delayed ACK", icon: <DelayedAckIcon />, body: "Mottaker venter ~200 ms for piggyback." },
            { term: "TCP-opsjoner", icon: <TcpOptionsIcon />, body: "MSS, Window Scale, SACK, Timestamps." },
            { term: "RST (reset)", icon: <RstIcon />, body: "Drep forbindelsen umiddelbart." },
            { term: "Half-close", icon: <HalfCloseIcon />, body: "FIN i én retning, lytt i den andre." },
          ]}
        />
        <Illustration caption="TCP-header (20 bytes min): sekvensnr og ACK-felt er hjertet i påliteligheten.">
          <TcpHeaderSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="3-veis handshake = møte-avtale på tinder">
          <p>
            <strong>Klient (SYN):</strong> «Hei, jeg vil møtes onsdag kl. 19 på Bøker &amp; Børst,
            mitt valg-nummer er 47281.»
          </p>
          <p>
            <strong>Server (SYN-ACK):</strong> «Ja, jeg så meldingen om 47281 — møte avtalt. Mitt
            eget valg-nummer er 88934.»
          </p>
          <p>
            <strong>Klient (ACK):</strong> «Mottatt 88934 — vi sees onsdag.»
          </p>
          <p>
            Hvorfor tre meldinger? Begge må vite at den ANDRE har bekreftet avtalen. Hvis bare to
            meldinger, kan en gammel SMS fra forrige uke som omsider kommer fram, lure serveren til
            å tro at klienten fortsatt er interessert. Den tredje meldingen lukker dialogen.
          </p>
        </Metafor>

        <Metafor tittel="TCP-vindu = bestillinger ute hos pizzeriaen">
          <p>
            Du ringer pizzeria-en og bestiller flere pizzaer i serie. Du kunne lagt på etter hver
            bestilling og ringt opp igjen — det er stop-and-wait, treigt. I stedet bestiller du
            flere samtidig. Hvor mange du tør ha «ute» før du venter på en bekreftelse på den
            første, er ditt sender-vindu (cwnd).
          </p>
          <p>
            Pizzeria-en sier også: «vi har plass til maks 8 pizzaer i ovnen samtidig» — det er
            mottakerens vindu (rwnd). Du holder antall ubekreftede bestillinger ≤ min(cwnd, rwnd).
          </p>
        </Metafor>
      </div>

      <Metafor tittel="EWMA RTT-estimat = vegg-termometer for nervøse forelder">
        <p>
          Du måler ditt barns kropps-temperatur hver morgen. Én dag viser den 38.5 — er barnet sykt
          eller fikk termometeret feil verdi? Hvis du panikkutløser legebesøk på hver enkelt måling,
          får du falske alarmer. Hvis du venter for lenge med å reagere, mister du tidlig diagnose.
        </p>
        <p>
          EWMA er kompromisset: nytt estimat = 87.5 % gammelt gjennomsnitt + 12.5 % dagens måling.
          En utlier på 38.5 drar bare estimatet opp ~0.05 grader. Men hvis temperaturen virkelig er
          forhøyet over flere dager, vil estimatet stige jevnt. TCP-timeout settes basert på estimat
          + 4 × varians — robust mot utliers, men reaktiv mot ekte endringer.
        </p>
      </Metafor>

      <Illustration caption="TCP 3-veis handshake visualisert som dialog mellom to parter — hver melding bekrefter forrige.">
        <ThreeWayHandshakeSvg />
      </Illustration>

      <Hvorfor title="Hvorfor 3-veis handshake — hvorfor ikke 2-veis?">
        <p>
          Et 2-veis handshake (klient: «la oss snakke», server: «OK, klar») ser ut til å rekke. Men
          tenk på en gammel pakke som dukker opp etter lang forsinkelse. Klienten sendte SYN for
          flere minutter siden, ga opp, og glemte det. Pakken når serveren nå. Serveren svarer
          «OK!», klienten kjenner ikke igjen forbindelsen, men servernen har allokert ressurser. Vi
          har en halv-åpen forbindelse.
        </p>
        <p>
          3-veis handshake tvinger klienten til å bekrefte serverens svar med en eksplisitt ACK før
          forbindelsen regnes som «established». Hvis klienten ikke ACK-er, forblir serveren i
          SYN_RCVD og timeout-er ut. Det forhindrer halv-åpne forbindelser fra forsinkede,
          forvillede SYN-er.
        </p>
        <p>
          I tillegg lar 3-veis håndtrykket begge sider utveksle initielle sekvensnumre OG bekrefte
          dem. To pakker rekker ikke å gjøre begge ting symmetrisk: klient lærer serverens ISN av
          SYN-ACK, men serveren trenger en pakke til (klientens ACK) for å bekrefte at klienten har
          mottatt SYN-ACK-en.
        </p>
        <p>
          Karn&apos;s algoritme har en tilsvarende historie: man kunne tro at det er trygt å måle
          RTT fra alle ACK-er. Men en retransmitert pakkes ACK er flertydig — du vet ikke om den
          besvarte original eller retransmisjon. Hvis det er retransmisjon men du tror det er
          original, undervurderer du RTT, setter timeout for kort, retransmitterer enda raskere
          neste gang, og havner i en loop. Karn løser det med to enkle regler.
        </p>
      </Hvorfor>

      <Example title="Eksempel: RTT-estimat med EWMA over tre målinger">
        <p>
          Vi har α = 0.125, og starter med EstimatedRTT = 200 ms (initialgjetning). Tre nye målinger
          kommer inn: 200, 220, 250 ms.
        </p>
        <p className="mt-2 font-mono text-[12px]">
          Etter måling 1 (200 ms):
          <br />
          E = 0.875·200 + 0.125·200 = 200.0 ms
          <br />
          <br />
          Etter måling 2 (220 ms):
          <br />
          E = 0.875·200 + 0.125·220 = 175.0 + 27.5 = 202.5 ms
          <br />
          <br />
          Etter måling 3 (250 ms):
          <br />E = 0.875·202.5 + 0.125·250 = 177.19 + 31.25 = 208.4 ms
        </p>
        <p className="mt-2 text-muted-foreground">
          Estimatet reagerer rolig — én utlier på 250 ms drar bare opp ca. 6 ms. Det er en bevisst
          design: vil heller utløse litt for sen retransmisjon enn å fyre falske timeout-er. Hvis vi
          hadde brukt α = 0.5 ville estimatet vippet voldsomt ved hver måling.
        </p>
      </Example>

      <Example title="Eksempel: trace TCP-tilstandene for en HTTP-forespørsel">
        <p>
          En klient åpner forbindelse til en server, sender en GET-request, leser svaret, lukker. Vi
          følger klient-sidens TCP-tilstand:
        </p>
        <p className="mt-2 font-mono text-[12px]">
          1. socket() opprettes → CLOSED
          <br />
          2. connect() kalles, klient sender SYN → SYN_SENT
          <br />
          3. Klient mottar SYN+ACK, sender ACK → ESTABLISHED
          <br />
          4. Klient sender GET, leser HTTP-svar (forblir ESTABLISHED)
          <br />
          5. close() kalles, klient sender FIN → FIN_WAIT_1
          <br />
          6. Server ACK-er FIN → FIN_WAIT_2
          <br />
          7. Server sender egen FIN, klient ACK-er → TIME_WAIT
          <br />
          8. Vent 2·MSL (~60-120 s) → CLOSED
        </p>
        <p className="mt-2">På server-siden samtidig:</p>
        <p className="mt-2 font-mono text-[12px]">
          listen() → LISTEN
          <br />
          Får SYN, sender SYN-ACK → SYN_RCVD
          <br />
          Får ACK → ESTABLISHED
          <br />
          Får klient-FIN → CLOSE_WAIT
          <br />
          Server-app kaller close(), sender FIN → LAST_ACK
          <br />
          Får siste ACK fra klient → CLOSED
        </p>
        <p className="mt-2 text-muted-foreground">
          TIME_WAIT er asymmetrisk: bare den siden som sendte FIN sist, går gjennom den. Det
          forklarer hvorfor en travel HTTP-klient samler tusenvis av TIME_WAIT, mens server-siden
          ikke gjør det (server lukker først der servern initierer lukking, ellers klient). Du kan
          se dette i sanntid med `ss -t state time-wait | wc -l`.
        </p>
      </Example>

      <RelatedSlugs slugs={["tcp-sockets", "transportlag", "dte2507-rdt-progresjon"]} />
    </article>
  );
}

// ============================================================
// 3.6 — Congestion control
// ============================================================
const ANSLAG_36: Anslag[] = [
  {
    id: "k3-cubic-snitt",
    tema: "AIMD mot CUBIC",
    sporsmal: (
      <>
        AIMD og CUBIC deler samme lenke og samme kapasitetstak, og begge halverer-ish ved tap.
        Forskjellen er bare <em>formen</em> på oppramingen. Hvem får høyest gjennomsnittlig vindu?
      </>
    ),
    valg: [
      "Like høyt — de treffer jo samme tak",
      "AIMD, fordi den øker jevnt og aldri bommer",
      "CUBIC, fordi den ligger lenger nær taket",
      "Kommer an på RTT-en, ikke på formen",
    ],
    riktig: 2,
    fasit: (
      <>
        Gjennomstrømming er <strong>arealet under kurven</strong>, ikke topp-punktet. CUBIC spurter opp
        mot forrige tapspunkt og blir liggende der, mens AIMD bruker like lang tid på hvert eneste
        segment hele veien opp. Samme tak, mye mer areal.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Fordi vi leser grafen som «hvor høyt kommer den?» når spørsmålet er «hvor lenge er den høyt
        oppe?». Toppunktet er identisk — det er tiden tilbrakt nær toppen som skiller dem.
      </>
    ),
  },
  {
    id: "k3-tap-signal",
    tema: "To slags tapssignal",
    sporsmal: <>Hva skiller reaksjonen på tre duplikat-ACK-er fra reaksjonen på en timeout?</>,
    valg: [
      "Ingenting — begge halverer cwnd",
      "Duplikat-ACK-er halverer cwnd; timeout setter den til ett segment",
      "Timeout halverer cwnd; duplikat-ACK-er setter den til ett segment",
      "Duplikat-ACK-er ignoreres av congestion control",
    ],
    riktig: 1,
    fasit: (
      <>
        Tre duplikat-ACK-er betyr at <em>senere</em> segmenter faktisk kom fram — nettet virker, det
        mangler bare ett. Da holder det å halvere. En timeout gir ingen slik trøst: det kan ha skjedd
        hva som helst, og TCP går helt ned til <strong>ett segment</strong>.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        «Tap er tap» er en naturlig forenkling. Men de to signalene bærer ulik mengde informasjon, og
        TCP utnytter nettopp den forskjellen — det er derfor sagtannen ser ulik ut i de to tilfellene.
      </>
    ),
  },
  {
    id: "k3-bbr-maaling",
    tema: "Forsinkelsesbasert",
    sporsmal: (
      <>
        En forsinkelsesbasert algoritme som BBR oppdager trengsel <em>uten</em> at en eneste pakke går
        tapt. Hva er det den sammenligner?
      </>
    ),
    valg: [
      "Antall ACK-er mot antall sendte segmenter",
      "Målt RTT mot den minste RTT-en den noen gang har sett",
      "cwnd mot mottakerens annonserte vindu",
      "Sjekksummen i hvert segment",
    ],
    riktig: 1,
    fasit: (
      <>
        RTT<sub>min</sub> er banen <em>uten kø</em>. Vokser den målte RTT-en over den, står det pakker
        og venter i en buffer et sted — og det skjer lenge før bufferen renner over og noe faktisk går
        tapt.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Fordi hele kapittelet har lært deg at tap ER signalet. Poenget med den forsinkelsesbaserte
        familien er at tap er et <em>sent</em> signal: da har du allerede fylt køen du prøvde å unngå.
      </>
    ),
  },
];

function Section36() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="3.6" title="Congestion control" />

      <p className="text-muted-foreground">
        Flow control handler om at avsenderen ikke skal drukne mottakeren. Congestion control
        handler om at avsenderen ikke skal drukne nettverket mellom dem. Det er separate problemer
        med separate løsninger. Uten congestion control kollapser et hardt belastet internett — det
        var faktisk hva som skjedde i 1986 før Van Jacobson kom med løsningen.
      </p>

      <Section35Live />

      <AnslagPanel
        avsloring="knapp"
        tittel="Anslå først — så sammenligner du kurvene"
        intro={
          <>
            Grafen under kjører AIMD og CUBIC mot samme kapasitetstak, og regner ut snitt-vinduet for
            begge. Ta stilling før du ser tallene.
          </>
        }
        anslag={ANSLAG_36}
      />

      <CubicAimdViz />

      <LectureNote title="Congestion control: sagtannen, og de tre familiene">
        <p>
          Det som gjør denne delen elegant er at det knapt kommer noe nytt maskineri. TCP bruker
          signalene den allerede har — kvitteringer og tap — til å svare på et helt annet spørsmål
          enn før: ikke «kom dataene fram?», men «tåler nettet at jeg sender fortere?»
        </p>
        <p>
          Bakteppet er <strong>congestion collapse</strong> fra forrige seksjon: den ikke-intuitive
          oppførselen der samlet gjennomstrømming <em>faller</em> når avsenderne presser på hardere.
          Det var ikke teori — det begynte å skje i nettet på 1980-tallet, før TCP hadde noen
          congestion control i det hele tatt. I 1988 publiserte Van Jacobson artikkelen som la
          grunnlaget for alt vi ser på her. Legg merke til hvor bemerkelsesverdig det er: den samme
          grunnmekanismen har stått i over 30 år, mens trafikkmengden i nettet har vokst med en
          faktor på over en milliard.
        </p>

        <LectureBeat>AIMD — og barnet som spør om mer</LectureBeat>
        <p>
          TCP tar en <strong>ende-til-ende</strong>-tilnærming: ingen ruter forteller avsenderen at
          det er trengsel — avsenderen <em>slutter</em> seg til det fra tap. Regelen er så enkel som
          den kan bli: går det bra, send litt fortere; kommer det tap, senk farten kraftig.
        </p>
        <p>
          Konkret er det <strong>additiv økning, multiplikativ reduksjon</strong> (AIMD): opp med{" "}
          <em>ett segment per RTT</em> når det går bra, og <em>halver</em> raten ved tap. Plotter du
          sendraten over tid, får du den karakteristiske <strong>sagtannen</strong>.
        </p>
        <p>
          Måten å forstå den på: avsenderen leter kontinuerlig etter den høyeste raten den kommer
          unna med uten tap. Den vet ikke hvor grensa går, så den må føle seg fram — presse litt til,
          litt til, litt til, helt til det smeller, og så trekke seg kraftig tilbake og begynne å
          føle seg fram på nytt. Det er nøyaktig samme forhandling som når et barn ber om «litt til,
          litt til» inntil en voksen setter foten ned — barnet gir seg med det samme, men begynner å
          prøve seg igjen etter en stund, for grensa kan jo ha flyttet seg.
        </p>
        <p className="rounded-lg border border-amber-500/30 bg-background/60 px-3 py-2">
          <strong>Detalj som er lett å bomme på:</strong> halveringen gjelder når tap oppdages ved{" "}
          <strong>tre duplikat-ACK-er</strong>. Ved <strong>timeout</strong> er signalet mye mer
          alvorlig — da settes vinduet helt ned til <strong>ett segment</strong>.
        </p>
        <p>
          Hvorfor <em>additiv</em> økning og ikke multiplikativ? Fordi rask økning gir ustabilitet.
          Og dette er ikke bare magefølelse: det er senere vist formelt at AIMD fungerer som en{" "}
          <strong>distribuert, asynkron optimeringsalgoritme</strong> — hver avsender setter sin egen
          rate ut fra sine egne tapssignaler, uten å vite om de andre, og likevel konvergerer
          systemet til fornuftige rater med gode stabilitetsegenskaper. Det er en ganske
          bemerkelsesverdig egenskap for en regel som er så enkel å skrive ned.
        </p>

        <LectureBeat>cwnd og slow start</LectureBeat>
        <p>
          Mekanisk styres dette av <strong>congestion-vinduet</strong> (cwnd) — et vindu over
          sekvensnummer-rommet, ved siden av det du allerede kjenner fra go-back-N og selective
          repeat. Sammenhengen med farten er direkte: har du cwnd bytes ute samtidig og de kvitteres
          i løpet av en rundtur, leverer TCP omtrent{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">cwnd / RTT</code> bytes per
          sekund.
        </p>
        <p>
          Men AIMD beskriver bare en <em>etablert</em> forbindelse. Hvordan kommer en fersk
          forbindelse i gang? Med <strong>slow start</strong>: den begynner på ett MSS per RTT og{" "}
          <strong>dobler</strong> hver RTT. La ikke navnet lure deg — dette er eksponentiell vekst,
          altså det motsatte av langsomt. «Slow» viser til at den <em>starter</em> lavt, ikke til
          takten.
        </p>
        <p>
          Overgangen mellom de to fasene styres av <strong>ssthresh</strong>: ved et tap settes den
          til halvparten av cwnd-verdien der tapet skjedde, og det er der TCP bytter fra dobling til
          den forsiktige +1-per-RTT-oppførselen.
        </p>

        <LectureBeat>CUBIC — smartere vei tilbake</LectureBeat>
        <p>
          Mange endringer er foreslått gjennom tre tiår, men én har fått virkelig utbredelse:{" "}
          <strong>TCP CUBIC</strong>. Den gjør alt likt bortsett fra <em>hvordan</em> vinduet vokser.
        </p>
        <p>
          Innsikten: kall <strong>W<sub>max</sub></strong> raten der du sist opplevde tap. Trengselen
          på lenken har neppe endret seg dramatisk siden i sted — så hvorfor krype lineært tilbake
          dit? CUBIC øker <em>raskt</em> så lenge den er langt under W<sub>max</sub>, og{" "}
          <em>forsiktig</em> når den nærmer seg. Formelt vokser vinduet som{" "}
          <strong>kuben</strong> av avstanden i tid til punktet der den skal treffe W<sub>max</sub> —
          derav navnet.
        </p>
        <p>
          Resultatet er høyere gjennomsnittlig gjennomstrømming enn ren AIMD. CUBIC er i dag
          standardalgoritmen i Linux' TCP-implementasjon, og en måling av de 5000 mest brukte
          webserverne fant at nærmere halvparten kjørte en variant av den.
        </p>

        <LectureBeat>Forsinkelsesbasert: hold røret akkurat fullt</LectureBeat>
        <p>
          Her er en innvending mot hele den tapsbaserte familien. Tapet skjer på{" "}
          <strong>flaskehals-lenken</strong> — de andre ruterne på veien er ikke problemet. Og når
          flaskehalsen først er travel nok til at den nesten alltid sender, hjelper det{" "}
          <em>ingenting</em> at avsenderne øker farten: ruteren kan uansett bare levere R bits per
          sekund ut. Alt du oppnår er å fylle køene til de renner over.
        </p>
        <p>
          Målet burde altså være å holde røret <strong>akkurat fullt — men ikke fullere</strong>:
          ruteren skal aldri gå tom for arbeid, men heller ikke bygge kø. Det er ideen bak{" "}
          <strong>forsinkelsesbasert</strong> congestion control, og den bruker RTT-målingene TCP
          allerede gjør.
        </p>
        <p>
          Avsenderen kjenner sin <strong>målte</strong> gjennomstrømming (bytes sendt siste runde delt
          på målt RTT) og sin <strong>ustuvede</strong> gjennomstrømming (cwnd delt på{" "}
          <strong>RTT<sub>min</sub></strong>, den minste RTT-en den noen gang har sett — altså banen
          uten kø). Ligger de to tett, er det ingen kø å snakke om, og avsenderen kan øke cwnd. Har
          den målte falt under, betyr det at RTT har vokst — det står pakker og venter i en kø et
          sted — og avsenderen bør senke cwnd. Merk at dette skjer{" "}
          <em>uten at et eneste pakketap trengs</em>. Google bruker en slik variant, <strong>BBR</strong>{" "}
          (bottleneck bandwidth and RTT), både internt mellom datasentrene sine og på web- og
          YouTube-serverne.
        </p>

        <LectureBeat>ECN: la nettverket si fra</LectureBeat>
        <p>
          Den tredje familien er <strong>nettverksassistert</strong>. Med{" "}
          <strong>explicit congestion notification</strong> setter en overbelastet ruter et bit i
          IP-headeren i stedet for å kaste pakken. Mottakeren ser markeringen og varsler avsenderen
          ved å sette et ECE-bit i kvitteringen tilbake. Avsenderen reagerer så som om det hadde vært
          et tap — halverer vinduet — men <em>uten</em> at noe faktisk gikk tapt.
        </p>
        <p>
          En pussighet verdt å merke seg: <strong>hva som teller som «overbelastet» står ikke i noen
          RFC</strong>. Selve mekanismen (bitene i IP- og TCP-headeren) er standardisert, men
          politikken for når de settes er opp til den som drifter nettet.
        </p>

        <LectureBeat>Rettferdighet — og fraværet av et internett-politi</LectureBeat>
        <p>
          Et rimelig krav: deler K TCP-forbindelser en flaskehals med rate R, bør hver få omtrent{" "}
          <strong>R/K</strong>. Gjør AIMD det?
        </p>
        <p>
          Se det for to strømmer i et diagram der aksene er de to strømmenes gjennomstrømming.
          Rettferdig deling er 45-graderslinja. Start hvor som helst under kapasitetsgrensa: begge
          øker med ett MSS per RTT, altså like mye, så tilstanden beveger seg{" "}
          <em>parallelt med 45-graderslinja</em> til kapasiteten sprekker og det blir tap. Da halverer
          begge — og halvering trekker punktet <em>mot origo langs en linje gjennom origo</em>, som
          flytter det nærmere 45-graderslinja. Gjenta: opp parallelt, inn mot midten, opp parallelt,
          inn mot midten. Uansett hvor skjevt du starter, konvergerer det mot lik deling. Det er
          verdt å bruke et minutt på å overbevise seg selv om at dette gjelder for et vilkårlig
          startpunkt.
        </p>
        <p>
          Men rettferdigheten hviler på frivillighet. TCP pakker sammen pålitelighet, flow control og
          congestion control. Vil du, kan du bygge en app på UDP med pålitelighet og flow control
          men <em>uten</em> congestion control — den vil ikke senke farten ved tap, og kan dermed
          sulte ut TCP-forbindelsene den deler flaskehalsen med. Det finnes{" "}
          <strong>ingen instans som håndhever</strong> rettferdig deling. At vi likevel ikke ser
          utbredt juks skyldes nok mest at den som trenger pålitelighet uansett bare bygger på TCP.
        </p>
        <p>
          Og en gråsone du allerede har møtt: webservere som åpner <strong>flere parallelle
          forbindelser</strong> mellom samme klient og server får en større andel av flaskehalsen enn
          én forbindelse ville gitt. Er det rettferdig? Det får du avgjøre selv — men det finnes
          altså heller ikke her noen å ringe.
        </p>
      </LectureNote>

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            {
              term: "Congestion collapse",
              icon: <CongestionCollapseIcon />,
              body: "Tap → flere retransmisjoner → mer tap. Død-spiral.",
            },
            {
              term: "Congestion window (cwnd)",
              icon: <CwndIcon />,
              body: "Maks bytes «in flight» fra nettverkets side.",
            },
            { term: "AIMD", icon: <AimdIcon />, body: "+1 per RTT (vekst); /2 per tap (reduksjon)." },
            { term: "Slow start", icon: <SlowStartIcon />, body: "cwnd dobles per RTT inntil ssthresh eller tap." },
            { term: "TCP Reno", icon: <TcpRenoIcon />, body: "Slow start + AIMD + fast recovery." },
            { term: "TCP Cubic", icon: <TcpCubicIcon />, body: "Linux-standard. Kubisk vekst etter tap." },
            { term: "BBR", icon: <BbrIcon />, body: "Mål båndbredde og RTT direkte, ikke tap." },
            { term: "Rettferdighet", icon: <FairnessIcon />, body: "AIMD konvergerer mot lik deling av flaskehalsen." },
            { term: "ssthresh", icon: <SsthreshIcon />, body: "Grense mellom slow start og AIMD." },
            { term: "Timeout vs 3 dup-ACK", icon: <TimeoutVsDupAckIcon />, body: "Timeout → cwnd=1. 3 dup → halver." },
            { term: "ECN", icon: <EcnIcon />, body: "Rutere markerer overbelastning før tap." },
            { term: "AIMD-throughput", icon: <AimdThroughputIcon />, body: "≈ 1.22·MSS / (RTT·√p)." },
            { term: "TCP Tahoe", icon: <TcpTahoeIcon />, body: "Forløper: alltid tilbake til 1 MSS ved tap." },
            { term: "Bufferbloat", icon: <BufferbloatIcon />, body: "Store ruter-bufre = treghet, ikke tap." },
            { term: "Self-clocking", icon: <SelfClockingIcon />, body: "ACK-takten regulerer sende-takten automatisk." },
            { term: "Sender-vindu", icon: <SenderWindowIcon />, body: "min(cwnd, rwnd) — nett eller mottaker." },
            { term: "AIMD-konvergens", icon: <ConvergenceIcon />, body: "Halvering bringer forholdet nærmere 1:1." },
          ]}
        />
        <Illustration caption="AIMD-sagtann: lineær vekst, halvering ved tap. Klassisk TCP-rytme.">
          <AimdSawtoothSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="Congestion control = biltrafikk på E18">
          <p>
            E18 har én flaskehals — Sjølyst-krysset. Hver morgen prøver hver bilist å presse seg
            gjennom så fort hen kan (slow start: alle kjører i 90 km/t). Når køen begynner å bygge
            seg opp, vil noen biler nødt til å stå stille (pakketap). Da blir alle litt mer
            forsiktige.
          </p>
          <p>
            AIMD = «når trafikken flyter, øk farten gradvis (én bil per minutt har lov til å fylle
            på). Når noen står stille, halver alle farten umiddelbart.» Etter mange runder finner
            alle en jevn fart som flaskehalsen tåler — uten sentral trafikk-styring. Hver bilist
            justerer kun ut fra hva hen selv opplever.
          </p>
        </Metafor>

        <Metafor tittel="Slow start = test av varmt badekar">
          <p>
            Når du fyller badekaret skrur du ikke kranen full kraft umiddelbart. Du begynner
            forsiktig (cwnd = 1), kjenner: «ah, ikke for varmt». Da skrur du opp dobbelt (cwnd = 2).
            Fortsatt OK? Dobbelt igjen (cwnd = 4). Du dobler så lenge alt går bra.
          </p>
          <p>
            Når du merker at varmtvannet plutselig brenner (pakketap), stopper du opp, husker «sist
            gang ble det for varmt rundt 32» (ssthresh), og fra nå skrur du opp én klikk om gangen
            (AIMD). Aldri mer aggressivt enn det.
          </p>
        </Metafor>
      </div>

      <Metafor tittel="BBR = se på vannivået, ikke vent på flommen">
        <p>
          Klassisk TCP (Reno/Cubic) er som å fylle bøtte til den renner over for å vite at den er
          full. Du får pålitelig signal — men du har nettopp søl all over kjøkkengulvet.
        </p>
        <p>
          BBR er som å se på vann-stranden direkte: jeg måler hvor fort vannet renner i fra kranen
          (båndbredde) og hvor høyt det stiger (RTT). Når stigningen begynner å øke uten at
          gjennomstrømmen øker, vet jeg at det fylles opp i kø. Da stopper jeg uten å vente på at
          den faktisk overflommer. Resultat: høyere throughput OG lavere latens samtidig.
        </p>
      </Metafor>

      <Metafor tittel="Bufferbloat = elastisk kø foran kassen">
        <p>
          Tenk deg at REMA 1000 har en kø-løype som strekker seg som strikk når flere kommer. I
          stedet for at folk snur når de ser den er full (signal: lang kø = nettet er fullt), tøyer
          den seg, og alle står lenger og lenger. Til slutt er det 40 personer i strikkøen, hver
          venter 25 minutter, men ingen får signal om å gå et annet sted.
        </p>
        <p>
          Det er nettopp hva store ruter-buffere gjør med TCP: tapet kommer ikke, så TCP fortsetter
          å pumpe pakker inn, mens latensen eksploderer. ECN og BBR redder oss: ECN setter opp et
          gult skilt («kø er full snart!»), BBR ser direkte at strikken har tøyet seg.
        </p>
      </Metafor>

      <Illustration caption="TCP-trafikken som E18-køen: AIMD lar alle parter finne en jevn fart uten sentralstyring.">
        <TrafikkE18Svg />
      </Illustration>

      <Example title="Eksempel: AIMD-konvergens mot rettferdighet">
        <p>
          To TCP-strømmer deler en 100 Mbps flaskehals. Strøm A startet først og «eier» 80 Mbps;
          strøm B startet nettopp og er på 10 Mbps. Total = 90 Mbps, godt under kapasitet.
        </p>
        <p className="mt-2">
          Begge øker additivt. Når summen overstiger 100 Mbps, kommer pakketap. Begge halverer: A
          går fra ~80 til ~40, B går fra ~30 til ~15. Total = 55 Mbps. Begge øker igjen, nå med like
          absolutt-økning per RTT. Ved neste tap er gapet mellom dem mindre. Etter mange sykler
          konvergerer de mot ~50 Mbps hver.
        </p>
        <p className="mt-2 text-muted-foreground">
          Det er grunnen til at AIMD er valgt fremfor f.eks. MIMD (multiplikativ økning også) — MIMD
          beholder ulikheter i stedet for å redusere dem. Rettferdighet er ikke en bivirkning, det
          er en designkonsekvens.
        </p>
      </Example>

      <Hvorfor title="Hvorfor akkurat AIMD — hvorfor ikke MIAD eller AIAD?">
        <p>
          Tenk på de fire kombinasjonene: AIAD (additiv opp, additiv ned), AIMD (vår), MIAD
          (multiplikativ opp, additiv ned), MIMD (begge multiplikative). Vi vil ha to ting:
          stabilitet (ikke svinge vilt rundt kapasitet) og rettferdighet (ulike strømmer skal
          konvergere mot like deler).
        </p>
        <p>
          Stabilitet: ved kapasitets-grensen må reduksjonen være stor nok til å skape pusterom.
          Additiv reduksjon (−k) er for liten — du sitter konstant på grensen og taper pakker hele
          tiden. Multiplikativ reduksjon (·0.5) gir et tydelig steg unna. Derfor MD.
        </p>
        <p>
          Rettferdighet: Geometrisk argument (samme som i hvorfor-konvergens-defen). Additiv vekst
          bevarer differansen mellom to strømmer. Multiplikativ reduksjon bevarer FORHOLDET, ikke
          differansen — forholdet er nærmere 1 etter en halvering enn før, så differansen krymper.
          Derfor AI for veksten, MD for reduksjonen.
        </p>
        <p>
          MIMD ville krympet forhold ved vekst også, men da har vi det motsatte problemet: en strøm
          med stort vindu vokser med mer absolutt bytes per RTT enn en med lite. Ulikheten vokser.
          AIAD ville gitt for sakte konvergens og dårlig stabilitet. AIMD er det unike punktet som
          gir både kontrollert rebound og rettferdig deling.
        </p>
      </Hvorfor>

      <Example title="Eksempel: slow start fra cwnd=1 til tap ved cwnd=32">
        <p>
          En ny TCP-forbindelse starter med cwnd = 1 MSS. ssthresh er initielt veldig høy, så vi er
          i slow start. RTT = 100 ms. Hva blir cwnd-historikken til vi opplever pakketap ved cwnd =
          32?
        </p>
        <p className="mt-2 font-mono text-[12px]">
          RTT 0: cwnd = 1 (send 1 segm, få 1 ACK)
          <br />
          RTT 1: cwnd = 2 (1 ACK utløser 1 nytt segm, men slow start dobler reglen → +1 per ACK)
          <br />
          RTT 2: cwnd = 4
          <br />
          RTT 3: cwnd = 8
          <br />
          RTT 4: cwnd = 16
          <br />
          RTT 5: cwnd = 32 ← tre dup-ACK opplevd
          <br />
          <br />
          Reaksjon: ssthresh = cwnd / 2 = 16
          <br />
          cwnd = 16 (fast recovery, ikke ned til 1 fordi det var dup-ACK ikke timeout)
          <br />
          → bytter til congestion avoidance (additiv vekst)
          <br />
          <br />
          RTT 6: cwnd = 17
          <br />
          RTT 7: cwnd = 18
          <br />
          RTT 8: cwnd = 19 ...
        </p>
        <p className="mt-2 text-muted-foreground">
          Etter ~5 RTT (500 ms) gikk vi fra 1 MSS til 32 MSS — eksponentielt. Det er grunnen til at
          slow start ikke faktisk er sakte: en webside med 100 ms RTT går fra null til 32·1460 ≈ 47
          KB/RTT på et halvt sekund. Etter tap er det additiv vekst, som er langsommere — ett
          segment per RTT — og det er der TCP virkelig prøver å være forsiktig.
        </p>
      </Example>

      <RelatedSlugs slugs={["dte2507-congestion-control", "transportlag"]} />
    </article>
  );
}

// ============================================================
// 3.7 — Oppgaver
// ============================================================
function Section37() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="3.7" title="Oppgaver" />
      <p className="text-muted-foreground">
        Sjekk forståelsen din. Klikk «Vis svar» for å se vår løsning etter du har prøvd selv.
      </p>

      <Forberedelse
        intro="Transportlaget er kapittelet med mest formelbruk. Disse fem framgangsmåtene dekker oppgavene under — les dem som oppskrifter, ikke som fasit."
        metoder={FORBEREDELSE_3}
      />

      <Exercise
        question="En TCP-avsender bruker et vindu på 10 MSS, MSS = 1460 bytes, RTT = 100 ms, over en 100 Mbps lenke. Hva er oppnådd throughput? Er vinduet bredt nok til å utnytte lenken?"
        hint="Throughput med stop-and-wait-lignende vindu = vindu i bytes / RTT. Sammenlign med lenke-kapasiteten i bytes per sekund."
        answer={
          <>
            <p className="font-mono text-[12px]">
              Vindu = 10 · 1460 = 14 600 bytes = 116 800 bits
              <br />
              Throughput = 116 800 bits / 0.1 s = 1.168 Mbps
              <br />
              Lenke-kapasitet = 100 Mbps
              <br />
              Utnyttelse = 1.168 / 100 ≈ 1.2 %
            </p>
            <p className="mt-1">
              Vinduet er fryktelig for smalt. Bandwidth-delay-product er 100 Mbps · 0.1 s = 10 Mbit
              = 1.25 MB. For å fylle lenken trenger vi cwnd ≥ ca. 856 MSS. Klassisk illustrasjon av
              hvorfor TCP-vinduskaleringen (window scaling option) ble lagt til, og hvorfor en
              moderne stack bruker mye større buffere.
            </p>
          </>
        }
      />

      <Exercise
        question="Beregn TCPs RTT-estimat etter tre målinger på 200, 220, 250 ms, gitt α = 0.125 og start-estimat E₀ = 200 ms. Hva blir DevRTT etter målingene hvis β = 0.25 og DevRTT₀ = 0?"
        hint="EstimatedRTT_n = (1-α)·E_{n-1} + α·SampleRTT_n. DevRTT_n = (1-β)·DevRTT_{n-1} + β·|SampleRTT_n − EstimatedRTT_{n-1}|."
        answer={
          <>
            <p className="font-mono text-[12px]">
              E1 = 0.875·200 + 0.125·200 = 200.0
              <br />
              D1 = 0.75·0 + 0.25·|200 − 200| = 0
              <br />
              <br />
              E2 = 0.875·200 + 0.125·220 = 202.5
              <br />
              D2 = 0.75·0 + 0.25·|220 − 200| = 5.0
              <br />
              <br />
              E3 = 0.875·202.5 + 0.125·250 = 208.44
              <br />
              D3 = 0.75·5 + 0.25·|250 − 202.5| = 3.75 + 11.875 = 15.63
              <br />
              <br />
              Timeout = E3 + 4·D3 = 208.44 + 62.5 = 270.9 ms
            </p>
            <p className="mt-1">
              Når variansen vokser, vokser timeout-en mer enn snittet alene tilsier. Dette er
              hensikten — vi tåler større utliers før vi feilaktig retransmitterer.
            </p>
          </>
        }
      />

      <Exercise
        question="Avsender og mottaker bruker RDT 3.0 (stop-and-wait med 1-bits sekvensnummer og timeout). Beskriv steg-for-steg hva som skjer hvis ACK for pakke 5 (sekvensnr = 1) går tapt. Hva er den verste konsekvensen av en dårlig valgt timeout?"
        hint="Tenk på hva avsenderen vet og ikke vet etter at timeren går ut. Hva tror mottakeren skjer?"
        answer={
          <>
            <ol className="list-decimal pl-5">
              <li>Avsender sender pakke 5 (seqnr=1), starter timer.</li>
              <li>Mottaker mottar korrekt, leverer til applikasjon, sender ACK(1).</li>
              <li>ACK(1) tapes underveis.</li>
              <li>Avsenders timer går ut → retransmitter pakke 5 (samme seqnr=1).</li>
              <li>
                Mottaker ser seqnr=1 = forrige, behandler som duplikat: leverer IKKE, men sender
                ACK(1) på nytt.
              </li>
              <li>
                Andre ACK(1) kommer fram. Avsender flipper til seqnr=0 og fortsetter med pakke 6.
              </li>
            </ol>
            <p className="mt-1">
              Hvis timeout er for kort, retransmitterer vi i blinde — sløsing av båndbredde, og vi
              kan generere så mange duplikater at mottakerens ACK-er konstant er for «gamle». Hvis
              timeout er for lang, henger applikasjonen unødvendig ved hvert tap. RDT 3.0 fungerer
              uansett, men effektivitet kollapser i begge ekstremer. Derfor estimerer ekte TCP RTT
              dynamisk.
            </p>
          </>
        }
      />

      <Exercise
        question="To TCP-strømmer (A og B) starter samtidig på en 40 Mbps flaskehals. Begge bruker AIMD. Skissér hvordan cwnd utvikler seg over fem AIMD-sykluser, og forklar hvorfor strømmene konvergerer mot 20 Mbps hver."
        hint="Ved hver runde med vellykkede ACK-er øker begge cwnd additivt med samme rate. Ved tap halveres begges cwnd. Hva skjer med forholdet mellom dem?"
        answer={
          <>
            <p>
              Anta A starter med cwnd som tilsvarer 30 Mbps og B med 5 Mbps. Sum = 35 Mbps, ingen
              tap.
            </p>
            <ol className="list-decimal pl-5 mt-1">
              <li>Begge øker med +k Mbps per RTT. Etter en stund er A = 32, B = 7, sum = 39.</li>
              <li>A = 33, B = 8, sum = 41 → tap. Begge halveres: A = 16.5, B = 4.</li>
              <li>Øker igjen: A = 24, B = 11.5, sum = 35.5.</li>
              <li>A = 25.5, B = 13, sum = 38.5.</li>
              <li>A = 26, B = 13.5, sum = 39.5 → tap. A = 13, B = 6.75. Sum = 19.75.</li>
              <li>Etter mange sykluser: A ≈ B ≈ 20 Mbps.</li>
            </ol>
            <p className="mt-1">
              Beviset: ved additiv økning beveger (cwnd_A, cwnd_B)-punktet seg parallelt med
              45-graders-linjen mot origo. Ved halvering hopper det mot origo langs strålen
              cwnd_B/cwnd_A = konst, som er nærmere 1:1 enn før. Diagonalen «like store» er en
              attraktor.
            </p>
          </>
        }
      />

      <Exercise
        question="Forklar hvorfor en applikasjon som streamer levende video kanskje velger UDP i stedet for TCP, og hvilke konsekvenser dette har for applikasjons-koden. Hva endrer seg når vi går over til QUIC (HTTP/3)?"
        hint="Tenk på hva som er verre: en tapt frame, eller hele streamen pauser mens TCP retransmitterer en gammel pakke?"
        answer={
          <>
            <p>
              Live-video har strenge latency-krav: en frame som er 200 ms gammel er ofte verdiløs.
              TCP garanterer in-order levering, så hvis ett segment mistes, blokkeres alt nyere
              segment i mottakerens buffer til retransmisjonen kommer fram — såkalt «head-of-line
              blocking». UDP slipper denne blokken; tapt frame skoper bare et lite glipp i bildet.
            </p>
            <p className="mt-2">Konsekvensen er at applikasjonen selv må:</p>
            <ul className="list-disc pl-5">
              <li>Detektere og fylle inn tapte frames (extrapolere, eller bare hoppe over).</li>
              <li>Implementere sin egen rate-styring (ellers fyller du opp lenken).</li>
              <li>Bruke playout-buffer for å jevne ut jitter.</li>
            </ul>
            <p className="mt-2">
              QUIC (HTTP/3) er interessant fordi den løser head-of-line blocking på en annen måte:
              den kjører over UDP, men implementerer pålitelighet per «stream» internt. Tap i én
              stream blokkerer ikke en annen. Vi får TCP-lignende garantier per logisk strøm, uten å
              betale prisen for streng global ordning.
            </p>
          </>
        }
      />

      <Exercise
        question="En klient åpner en ny TCP-forbindelse til en server. Forklar steg-for-steg hvilke TCP-tilstander hver side går gjennom fra socket() opprettes til ESTABLISHED, med hvilke pakker som sendes og i hvilken retning. Hvorfor må klienten ACK-e SYN-ACK-en?"
        hint="Lag en tabell: kolonne 1 = pakke, kolonne 2 = klient-tilstand, kolonne 3 = server-tilstand. Spor SYN, SYN+ACK, ACK."
        answer={
          <>
            <p className="font-mono text-[12px]">
              Start: Klient = CLOSED, Server = LISTEN
              <br />
              1. Klient sender SYN (seq=x)
              <br />
              {"   "}→ Klient = SYN_SENT, Server = LISTEN
              <br />
              2. Server mottar SYN, sender SYN+ACK (seq=y, ack=x+1)
              <br />
              {"   "}→ Klient = SYN_SENT, Server = SYN_RCVD
              <br />
              3. Klient mottar SYN+ACK, sender ACK (seq=x+1, ack=y+1)
              <br />
              {"   "}→ Klient = ESTABLISHED, Server = SYN_RCVD
              <br />
              4. Server mottar ACK
              <br />
              {"   "}→ Klient = ESTABLISHED, Server = ESTABLISHED
            </p>
            <p className="mt-2">
              Klientens ACK er nødvendig fordi serveren ellers ikke vet om SYN-ACK-en kom fram. Uten
              den siste ACK-en kan en sen, vandrende SYN fra en forlatt forbindelse oppstå senere og
              lure serveren til å allokere en halv-åpen forbindelse for noe klienten ikke vet om.
              ACK-en lukker den dialogen og bekrefter at klienten ennå er interessert.
            </p>
          </>
        }
      />

      <Exercise
        question="TCP-mottakeren melder rwnd = 8 KB i sin ACK. Avsenderens cwnd er 12 KB. MSS = 1 KB, og det er for øyeblikket 5 KB ubekreftede bytes utestående. Hvor mye nytt data kan avsenderen sende NÅ? Hva er flaskehalsen?"
        hint="Effektiv senderkapasitet = min(cwnd, rwnd). Hvor mye av det er fri kapasitet?"
        answer={
          <>
            <p className="font-mono text-[12px]">
              Sender-vindu = min(cwnd, rwnd) = min(12, 8) = 8 KB
              <br />
              Allerede ubekreftet: 5 KB
              <br />
              Ledig: 8 − 5 = 3 KB
              <br />
              Maks nytt data NÅ: 3 KB = 3 MSS
            </p>
            <p className="mt-2">
              Flaskehalsen er rwnd (mottakers buffer), ikke cwnd. Denne forbindelsen er receiver-
              bound: nettverket kunne bære mer (cwnd = 12), men mottakeren har bare plass til 8.
              Diagnose: enten leser applikasjonen sakte, eller socket-bufferet er konfigurert for
              lite. Hvis avsenderen så at rwnd = cwnd hele tiden, ville det vært bevis for at
              nettverket var begrensende.
            </p>
          </>
        }
      />

      <Exercise
        question="En TCP-forbindelse er i slow start med cwnd = 4 MSS, ssthresh = 16 MSS. Tre dupliserte ACK-er ankommer for samme sekvensnummer. Beskriv hva som skjer med cwnd og ssthresh, og hvor lang tid det tar før cwnd igjen når 16 MSS hvis RTT = 50 ms og ingen flere tap inntreffer."
        hint="3 dup-ACK = fast retransmit + fast recovery. ssthresh halveres til ny cwnd/2; cwnd settes til den nye ssthresh. Etter det er vi i congestion avoidance (additiv vekst: +1 MSS per RTT)."
        answer={
          <>
            <p className="font-mono text-[12px]">
              Før dup-ACK: cwnd = 4, ssthresh = 16
              <br />
              <br />
              Ved 3 dup-ACK (TCP Reno fast recovery):
              <br />
              ssthresh = cwnd / 2 = 2
              <br />
              cwnd = ssthresh = 2 (ikke ned til 1, siden det ikke var timeout)
              <br />
              <br />
              Nå er cwnd ≥ ssthresh → congestion avoidance.
              <br />
              Additiv vekst: cwnd += 1 MSS per RTT.
              <br />
              <br />
              Fra 2 til 16 trenger 14 økninger → 14 RTT = 14 · 50 ms = 700 ms.
            </p>
            <p className="mt-2">
              Hvis det hadde vært timeout i stedet for 3 dup-ACK, ville cwnd gått helt ned til 1 MSS
              og vi ville startet med slow start (eksponentiell vekst). Det ville tatt ~log₂(2) +
              (16 − 2) = ~15 RTT å gjenoppta cwnd = 16, men på ulik måte — slow start opp til
              ssthresh = 2, så additivt. I begge tilfeller er ssthresh husket fra forrige tap som
              «her ble nettet trangt sist».
            </p>
          </>
        }
      />

      <Exercise
        question="To TCP-strømmer X og Y deler en flaskehals. X har RTT = 20 ms, Y har RTT = 200 ms. Begge bruker AIMD. Selv om de er «like rettferdige» i protokoll-forstand, vil de IKKE få like throughput. Forklar med AIMD-throughput-formelen hvorfor, og finn forholdet mellom dem hvis begge har samme tapsrate p og samme MSS."
        hint="Throughput ≈ 1.22·MSS / (RTT · √p). Forholdet faller ut uavhengig av MSS og p."
        answer={
          <>
            <p className="font-mono text-[12px]">
              Throughput_X ≈ 1.22·MSS / (RTT_X · √p)
              <br />
              Throughput_Y ≈ 1.22·MSS / (RTT_Y · √p)
              <br />
              <br />
              Throughput_X / Throughput_Y = RTT_Y / RTT_X = 200 / 20 = 10
              <br />
              <br />X får 10 ganger så høy throughput som Y.
            </p>
            <p className="mt-2">
              Dette er RTT-urettferdighet. Mekanismen er at AIMD øker cwnd med 1 MSS per RTT. X får
              10 økninger i samme tid som Y får 1. Selv om begge halveres ved tap, vokser X raskere
              mellom tap. På internett betyr det at TCP-strømmer som krysser kontinenter alltid
              taper mot strømmer som er lokale. Det er en av motivasjonene bak BBR, som ikke er
              sårbar for denne skjevheten — den måler båndbredde direkte i stedet for å avhenge av
              RTT-basert AIMD.
            </p>
          </>
        }
      />

      <Exercise
        question="En applikasjon sender mange små meldinger over TCP — typisk 5 bytes per send()-kall, mange ganger per sekund. Hva er problemet (gi navn på algoritmen som forsøker å fikse det), hvilken bivirkning gir den, og hvordan slår du av algoritmen i sockets-API hvis du trenger lav latens?"
        hint="Tenk på header-overhead i forhold til nyttelast. Den klassiske algoritmen er navngitt etter en forsker. Bivirkningen er ~200 ms ekstra latens kombinert med en annen mekanisme på mottaker."
        answer={
          <>
            <p>
              Problemet er såkalt «silly window» / sløsing: hver 5-byte-melding sender en
              40-byte-pakke (20 IP + 20 TCP). 8/45 ≈ 89 % overhead. Nagle&apos;s algoritme prøver å
              fikse dette ved å vente med små segmenter til enten det finnes ubekreftede bytes ute,
              eller dataen blir minst én MSS.
            </p>
            <p className="mt-2">
              Bivirkning: i kombinasjon med Delayed ACK på mottakeren får du «Nagle-delay» — en
              500-byte-melding ventes på i opptil 200 ms før mottakeren ACK-er, og avsenderen venter
              på den ACK-en før den sender neste lille fragment. Resultat: en spillklient merker
              plutselig 200 ms ekstra latens uten åpenbar grunn.
            </p>
            <p className="mt-2 font-mono text-[12px]">
              Slå av i Linux/macOS:
              <br />
              int flag = 1;
              <br />
              setsockopt(sockfd, IPPROTO_TCP, TCP_NODELAY, &amp;flag, sizeof(flag));
            </p>
            <p className="mt-2">
              For SSH, online-spill, real-time-meldinger: TCP_NODELAY er standard-konfigurasjon. For
              bulk-overføring der hver byte er like viktig som ingen latens: la Nagle stå på, den
              hjelper.
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
        Hvorfor egentlig?
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

function TransportE2ESvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Transport: prosess-til-prosess gjennom IP
      </text>
      {/* Host A */}
      <rect
        x={20}
        y={40}
        width={120}
        height={170}
        rx={8}
        className="fill-amber-500/5 stroke-amber-500/60"
        strokeWidth={1.5}
      />
      <text x={80} y={56} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        Host A
      </text>
      <rect
        x={30}
        y={64}
        width={100}
        height={24}
        rx={3}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1}
      />
      <text x={80} y={80} textAnchor="middle" className="fill-foreground text-[9px]">
        App
      </text>
      <rect
        x={30}
        y={94}
        width={100}
        height={24}
        rx={3}
        className="fill-success/30 stroke-success"
        strokeWidth={1}
      />
      <text x={80} y={110} textAnchor="middle" className="fill-foreground text-[9px]">
        Transport
      </text>
      <rect
        x={30}
        y={124}
        width={100}
        height={24}
        rx={3}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={80} y={140} textAnchor="middle" className="fill-foreground text-[9px]">
        Nettverk (IP)
      </text>
      <rect
        x={30}
        y={154}
        width={100}
        height={24}
        rx={3}
        className="fill-destructive/30 stroke-destructive"
        strokeWidth={1}
      />
      <text x={80} y={170} textAnchor="middle" className="fill-foreground text-[9px]">
        Link
      </text>
      <rect
        x={30}
        y={184}
        width={100}
        height={18}
        rx={3}
        className="fill-muted stroke-border"
        strokeWidth={1}
      />
      <text x={80} y={196} textAnchor="middle" className="fill-foreground text-[8px]">
        Fysisk
      </text>

      {/* Ruter */}
      <rect
        x={180}
        y={120}
        width={60}
        height={60}
        rx={6}
        className="fill-card stroke-brand"
        strokeWidth={2}
      />
      <text x={210} y={140} textAnchor="middle" className="fill-foreground text-[9px]">
        Ruter
      </text>
      <text x={210} y={155} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        (bare lag 1-3)
      </text>
      <text x={210} y={170} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        IP only
      </text>

      <rect
        x={260}
        y={120}
        width={60}
        height={60}
        rx={6}
        className="fill-card stroke-brand"
        strokeWidth={2}
      />
      <text x={290} y={140} textAnchor="middle" className="fill-foreground text-[9px]">
        Ruter
      </text>
      <text x={290} y={155} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        (bare lag 1-3)
      </text>
      <text x={290} y={170} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        IP only
      </text>

      {/* Host B */}
      <rect
        x={360}
        y={40}
        width={120}
        height={170}
        rx={8}
        className="fill-success/5 stroke-success/60"
        strokeWidth={1.5}
      />
      <text
        x={420}
        y={56}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Host B
      </text>
      <rect
        x={370}
        y={64}
        width={100}
        height={24}
        rx={3}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1}
      />
      <text x={420} y={80} textAnchor="middle" className="fill-foreground text-[9px]">
        App
      </text>
      <rect
        x={370}
        y={94}
        width={100}
        height={24}
        rx={3}
        className="fill-success/30 stroke-success"
        strokeWidth={1}
      />
      <text x={420} y={110} textAnchor="middle" className="fill-foreground text-[9px]">
        Transport
      </text>
      <rect
        x={370}
        y={124}
        width={100}
        height={24}
        rx={3}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={420} y={140} textAnchor="middle" className="fill-foreground text-[9px]">
        Nettverk (IP)
      </text>
      <rect
        x={370}
        y={154}
        width={100}
        height={24}
        rx={3}
        className="fill-destructive/30 stroke-destructive"
        strokeWidth={1}
      />
      <text x={420} y={170} textAnchor="middle" className="fill-foreground text-[9px]">
        Link
      </text>
      <rect
        x={370}
        y={184}
        width={100}
        height={18}
        rx={3}
        className="fill-muted stroke-border"
        strokeWidth={1}
      />
      <text x={420} y={196} textAnchor="middle" className="fill-foreground text-[8px]">
        Fysisk
      </text>

      {/* E2E dashed line */}
      <path
        d="M 80 76 C 80 30, 420 30, 420 76"
        className="fill-none stroke-success"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      <text x={250} y={32} textAnchor="middle" className="fill-success text-[9px] font-semibold">
        ende-til-ende
      </text>

      {/* Hop link */}
      <line
        x1={130}
        y1={196}
        x2={180}
        y2={150}
        className="stroke-muted-foreground/60"
        strokeWidth={1.5}
      />
      <line
        x1={240}
        y1={150}
        x2={260}
        y2={150}
        className="stroke-muted-foreground/60"
        strokeWidth={1.5}
      />
      <line
        x1={320}
        y1={150}
        x2={370}
        y2={196}
        className="stroke-muted-foreground/60"
        strokeWidth={1.5}
      />
      <text x={250} y={222} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        rutere ser bare IP-header — transport-headeren passerer urørt
      </text>
    </svg>
  );
}

function MuxDemuxSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Demux: én port, mange forbindelser (TCP)
      </text>

      {/* Server box */}
      <rect
        x={300}
        y={35}
        width={180}
        height={190}
        rx={8}
        className="fill-success/5 stroke-success/60"
        strokeWidth={1.5}
      />
      <text
        x={390}
        y={52}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Server (IP 1.2.3.4)
      </text>

      {/* Lytte-socket */}
      <rect
        x={310}
        y={60}
        width={160}
        height={28}
        rx={4}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={390} y={78} textAnchor="middle" className="fill-foreground text-[9px]">
        Lytte-socket :443
      </text>

      {/* Tre forbindelse-sockets */}
      <rect
        x={310}
        y={100}
        width={160}
        height={26}
        rx={4}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={390} y={117} textAnchor="middle" className="fill-foreground text-[8px]">
        (1.2.3.4, 443, 10.0.0.1, 51001)
      </text>

      <rect
        x={310}
        y={132}
        width={160}
        height={26}
        rx={4}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={390} y={149} textAnchor="middle" className="fill-foreground text-[8px]">
        (1.2.3.4, 443, 10.0.0.1, 51002)
      </text>

      <rect
        x={310}
        y={164}
        width={160}
        height={26}
        rx={4}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={390} y={181} textAnchor="middle" className="fill-foreground text-[8px]">
        (1.2.3.4, 443, 10.0.0.7, 49333)
      </text>

      <text x={390} y={210} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        TCP demux på 4-tuppel
      </text>

      {/* Klienter */}
      <circle cx={40} cy={80} r={14} className="fill-amber-500" />
      <text x={40} y={110} textAnchor="middle" className="fill-foreground text-[9px]">
        10.0.0.1
      </text>
      <text x={40} y={122} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        :51001
      </text>

      <circle cx={40} cy={150} r={14} className="fill-amber-500" />
      <text x={40} y={180} textAnchor="middle" className="fill-foreground text-[9px]">
        10.0.0.1
      </text>
      <text x={40} y={192} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        :51002
      </text>

      <circle cx={40} cy={210} r={14} className="fill-amber-500" />
      <text x={40} y={232} textAnchor="middle" className="fill-foreground text-[9px]">
        10.0.0.7 :49333
      </text>

      {/* Piler */}
      <line
        x1={56}
        y1={80}
        x2={310}
        y2={113}
        className="stroke-brand/70"
        strokeWidth={1.5}
        markerEnd="url(#arrow1)"
      />
      <line
        x1={56}
        y1={150}
        x2={310}
        y2={145}
        className="stroke-brand/70"
        strokeWidth={1.5}
        markerEnd="url(#arrow1)"
      />
      <line
        x1={56}
        y1={210}
        x2={310}
        y2={177}
        className="stroke-brand/70"
        strokeWidth={1.5}
        markerEnd="url(#arrow1)"
      />

      <defs>
        <marker
          id="arrow1"
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-brand/70" />
        </marker>
      </defs>
    </svg>
  );
}

function UdpHeaderSvg() {
  return (
    <svg viewBox="0 0 500 200" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        UDP-segment: 8 bytes header + applikasjons-data
      </text>
      <text x={250} y={36} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        ← 32 bits (4 bytes) →
      </text>

      {/* Header row 1 */}
      <rect
        x={60}
        y={50}
        width={190}
        height={36}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={155} y={73} textAnchor="middle" className="fill-foreground text-[10px]">
        Kilde-port (16 bits)
      </text>
      <rect
        x={250}
        y={50}
        width={190}
        height={36}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={345} y={73} textAnchor="middle" className="fill-foreground text-[10px]">
        Dest-port (16 bits)
      </text>

      {/* Header row 2 */}
      <rect
        x={60}
        y={86}
        width={190}
        height={36}
        className="fill-success/20 stroke-success"
        strokeWidth={1.5}
      />
      <text x={155} y={109} textAnchor="middle" className="fill-foreground text-[10px]">
        Lengde (16 bits)
      </text>
      <rect
        x={250}
        y={86}
        width={190}
        height={36}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={345} y={109} textAnchor="middle" className="fill-foreground text-[10px]">
        Sjekksum (16 bits)
      </text>

      {/* Data */}
      <rect
        x={60}
        y={122}
        width={380}
        height={50}
        className="fill-muted stroke-border"
        strokeWidth={1.5}
      />
      <text
        x={250}
        y={150}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Applikasjons-data (variabel lengde)
      </text>

      <text x={250} y={190} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Ingen sekvensnummer, ingen ACK-felt, ingen flag-bits — UDP gjør nesten ingenting
      </text>
    </svg>
  );
}

function RdtProgressionSvg() {
  return (
    <svg viewBox="0 0 500 260" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        RDT-progresjonen: hva blir lagt til hver iterasjon
      </text>

      {[
        {
          y: 40,
          name: "RDT 1.0",
          desc: "Perfekt kanal",
          color: "fill-muted stroke-border",
          adds: "Bare send og motta — ingen feilbehandling",
        },
        {
          y: 80,
          name: "RDT 2.0",
          desc: "Bit-feil",
          color: "fill-amber-500/20 stroke-amber-500",
          adds: "+ sjekksum, + ACK/NAK",
        },
        {
          y: 120,
          name: "RDT 2.1",
          desc: "Korrupt ACK",
          color: "fill-brand/20 stroke-brand",
          adds: "+ 1-bits sekvensnr (mottaker detekterer duplikat)",
        },
        {
          y: 160,
          name: "RDT 2.2",
          desc: "Forenkling",
          color: "fill-success/20 stroke-success",
          adds: "+ ACK(N) erstatter NAK (duplikat-ACK = NAK)",
        },
        {
          y: 200,
          name: "RDT 3.0",
          desc: "Pakketap",
          color: "fill-destructive/20 stroke-destructive",
          adds: "+ timeout + retransmisjon (avsender oppdager tap)",
        },
      ].map((row, i) => (
        <g key={i}>
          <rect
            x={30}
            y={row.y}
            width={120}
            height={32}
            rx={4}
            className={row.color}
            strokeWidth={1.5}
          />
          <text
            x={90}
            y={row.y + 16}
            textAnchor="middle"
            className="fill-foreground text-[10px] font-semibold"
          >
            {row.name}
          </text>
          <text
            x={90}
            y={row.y + 27}
            textAnchor="middle"
            className="fill-muted-foreground text-[8px]"
          >
            {row.desc}
          </text>
          <text x={165} y={row.y + 21} className="fill-muted-foreground text-[10px]">
            {row.adds}
          </text>
        </g>
      ))}

      <text x={250} y={245} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Hvert lag bygger oppå det forrige — ingenting forsvinner, bare tillegges
      </text>
    </svg>
  );
}

function TcpHeaderSvg() {
  return (
    <svg viewBox="0 0 500 270" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        TCP-segment-header (20 bytes minimum)
      </text>
      <text x={250} y={32} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        ← 32 bits →
      </text>

      {/* Row 1 */}
      <rect
        x={60}
        y={42}
        width={190}
        height={28}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1.2}
      />
      <text x={155} y={60} textAnchor="middle" className="fill-foreground text-[9px]">
        Kilde-port
      </text>
      <rect
        x={250}
        y={42}
        width={190}
        height={28}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1.2}
      />
      <text x={345} y={60} textAnchor="middle" className="fill-foreground text-[9px]">
        Dest-port
      </text>

      {/* Row 2 */}
      <rect
        x={60}
        y={70}
        width={380}
        height={28}
        className="fill-success/25 stroke-success"
        strokeWidth={1.2}
      />
      <text
        x={250}
        y={88}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Sekvensnummer (32 bits) — byte-offset
      </text>

      {/* Row 3 */}
      <rect
        x={60}
        y={98}
        width={380}
        height={28}
        className="fill-success/25 stroke-success"
        strokeWidth={1.2}
      />
      <text
        x={250}
        y={116}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        ACK-nummer (32 bits) — neste forventede byte
      </text>

      {/* Row 4 */}
      <rect
        x={60}
        y={126}
        width={50}
        height={28}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={1.2}
      />
      <text x={85} y={144} textAnchor="middle" className="fill-foreground text-[8px]">
        HLen
      </text>
      <rect
        x={110}
        y={126}
        width={70}
        height={28}
        className="fill-muted stroke-border"
        strokeWidth={1.2}
      />
      <text x={145} y={144} textAnchor="middle" className="fill-foreground text-[8px]">
        flags
      </text>
      <rect
        x={180}
        y={126}
        width={70}
        height={28}
        className="fill-destructive/20 stroke-destructive"
        strokeWidth={1.2}
      />
      <text x={215} y={144} textAnchor="middle" className="fill-foreground text-[8px]">
        rwnd
      </text>
      <rect
        x={250}
        y={126}
        width={95}
        height={28}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={1.2}
      />
      <text x={297} y={144} textAnchor="middle" className="fill-foreground text-[8px]">
        Sjekksum
      </text>
      <rect
        x={345}
        y={126}
        width={95}
        height={28}
        className="fill-muted stroke-border"
        strokeWidth={1.2}
      />
      <text x={392} y={144} textAnchor="middle" className="fill-foreground text-[8px]">
        Urgent ptr
      </text>

      {/* Options */}
      <rect
        x={60}
        y={154}
        width={380}
        height={20}
        className="fill-muted/50 stroke-border"
        strokeWidth={1.2}
        strokeDasharray="3 2"
      />
      <text x={250} y={168} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Options (variabel) — window scale, SACK-permitted, timestamps
      </text>

      {/* Payload */}
      <rect
        x={60}
        y={174}
        width={380}
        height={50}
        className="fill-muted stroke-border"
        strokeWidth={1.5}
      />
      <text
        x={250}
        y={203}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Applikasjons-data (bytes — del av strøm)
      </text>

      <text x={250} y={248} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        Flag-bits: URG · ACK · PSH · RST · SYN · FIN — kontrollerer state-maskinen
      </text>
      <text x={250} y={262} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        rwnd er flow control-vinduet mottakeren rapporterer
      </text>
    </svg>
  );
}

function AimdSawtoothSvg() {
  // Build a sawtooth path
  const points: [number, number][] = [];
  let x = 30;
  let cwnd = 10;
  const baseY = 200;
  const yScale = 3;
  while (x < 470) {
    // additive increase
    const targetX = x + 80;
    const targetCwnd = cwnd + 50;
    points.push([x, baseY - cwnd * yScale]);
    points.push([targetX, baseY - targetCwnd * yScale]);
    x = targetX;
    cwnd = targetCwnd;
    // multiplicative decrease
    cwnd = cwnd / 2;
    points.push([x, baseY - cwnd * yScale]);
  }
  const path = points
    .map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`))
    .join(" ");

  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        AIMD — Additive Increase, Multiplicative Decrease
      </text>

      {/* Axes */}
      <line
        x1={30}
        y1={210}
        x2={470}
        y2={210}
        className="stroke-muted-foreground"
        strokeWidth={1}
      />
      <line x1={30} y1={40} x2={30} y2={210} className="stroke-muted-foreground" strokeWidth={1} />
      <text x={250} y={228} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        tid →
      </text>
      <text
        x={14}
        y={120}
        textAnchor="middle"
        className="fill-muted-foreground text-[9px]"
        transform="rotate(-90 14 120)"
      >
        cwnd (MSS)
      </text>

      {/* Sawtooth */}
      <path d={path} className="fill-none stroke-brand" strokeWidth={2} />

      {/* Loss markers */}
      {[110, 190, 270, 350, 430].map((mx) => (
        <g key={mx}>
          <line
            x1={mx}
            y1={40}
            x2={mx}
            y2={210}
            className="stroke-destructive/40"
            strokeWidth={1}
            strokeDasharray="3 2"
          />
          <circle cx={mx} cy={50} r={4} className="fill-destructive" />
        </g>
      ))}

      <text x={110} y={36} textAnchor="middle" className="fill-destructive text-[9px]">
        tap
      </text>

      <text x={250} y={238} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Lineær vekst per RTT (+1 MSS) — halvering ved tap — gjentas
      </text>
    </svg>
  );
}

// ============================================================
// Nye metafor-SVG-er for kap. 3
// ============================================================

function UpsMetaforSvg() {
  return (
    <svg viewBox="0 0 500 230" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        UPS-metaforen: App → Transport → IP → Transport → App
      </text>

      {/* App A (sender) */}
      <rect
        x={20}
        y={40}
        width={90}
        height={50}
        rx={6}
        className="fill-brand/15 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={65} y={60} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        App A
      </text>
      <text x={65} y={75} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        «send pakke»
      </text>

      {/* Transport sender */}
      <rect
        x={20}
        y={100}
        width={90}
        height={50}
        rx={6}
        className="fill-purple-500/15 stroke-purple-500"
        strokeWidth={1.5}
      />
      <text
        x={65}
        y={120}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        UPS-sjåfør
      </text>
      <text x={65} y={135} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        (transport)
      </text>

      {/* IP cloud */}
      <ellipse
        cx={250}
        cy={125}
        rx={80}
        ry={50}
        className="fill-amber-500/10 stroke-amber-500"
        strokeWidth={1.5}
        strokeDasharray="3 2"
      />
      <text
        x={250}
        y={115}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        IP-«lastebiler»
      </text>
      <text x={250} y={130} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        best effort, ukjent rute
      </text>
      <text x={250} y={145} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        noen pakker mistes
      </text>

      {/* Transport receiver */}
      <rect
        x={390}
        y={100}
        width={90}
        height={50}
        rx={6}
        className="fill-purple-500/15 stroke-purple-500"
        strokeWidth={1.5}
      />
      <text
        x={435}
        y={120}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        UPS-sjåfør
      </text>
      <text x={435} y={135} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        (transport)
      </text>

      {/* App B */}
      <rect
        x={390}
        y={40}
        width={90}
        height={50}
        rx={6}
        className="fill-success/15 stroke-success"
        strokeWidth={1.5}
      />
      <text
        x={435}
        y={60}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        App B
      </text>
      <text x={435} y={75} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        «pakke mottatt»
      </text>

      {/* Arrows */}
      <line
        x1={65}
        y1={90}
        x2={65}
        y2={100}
        className="stroke-foreground/60"
        strokeWidth={1.5}
        markerEnd="url(#arrowUps)"
      />
      <line
        x1={110}
        y1={125}
        x2={170}
        y2={125}
        className="stroke-foreground/60"
        strokeWidth={1.5}
        markerEnd="url(#arrowUps)"
      />
      <line
        x1={330}
        y1={125}
        x2={390}
        y2={125}
        className="stroke-foreground/60"
        strokeWidth={1.5}
        markerEnd="url(#arrowUps)"
      />
      <line
        x1={435}
        y1={100}
        x2={435}
        y2={90}
        className="stroke-foreground/60"
        strokeWidth={1.5}
        markerEnd="url(#arrowUps)"
      />

      {/* Reliability label */}
      <text
        x={250}
        y={190}
        textAnchor="middle"
        className="fill-purple-700 dark:fill-purple-400 text-[10px] font-semibold"
      >
        UPS-laget garanterer levering, sporing, kvittering
      </text>
      <text x={250} y={205} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        IP-laget ser bare adressen og kjører «best effort»
      </text>

      <defs>
        <marker
          id="arrowUps"
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-foreground/60" />
        </marker>
      </defs>
    </svg>
  );
}

function PortRomNummerSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Postsystem-metaforen: én bygning, mange rom
      </text>

      {/* Bygning */}
      <rect
        x={120}
        y={40}
        width={300}
        height={170}
        rx={6}
        className="fill-card stroke-border"
        strokeWidth={1.5}
      />
      <text
        x={270}
        y={58}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Lågårdsskolen (IP 10.0.0.50)
      </text>

      {/* Rom 80 */}
      <rect
        x={140}
        y={70}
        width={80}
        height={40}
        rx={4}
        className="fill-brand/15 stroke-brand"
        strokeWidth={1}
      />
      <text
        x={180}
        y={88}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Rom :80
      </text>
      <text x={180} y={102} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        HTTP-server
      </text>

      {/* Rom 443 */}
      <rect
        x={230}
        y={70}
        width={80}
        height={40}
        rx={4}
        className="fill-success/15 stroke-success"
        strokeWidth={1}
      />
      <text
        x={270}
        y={88}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Rom :443
      </text>
      <text x={270} y={102} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        HTTPS
      </text>

      {/* Rom 22 */}
      <rect
        x={320}
        y={70}
        width={80}
        height={40}
        rx={4}
        className="fill-amber-500/15 stroke-amber-500"
        strokeWidth={1}
      />
      <text
        x={360}
        y={88}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Rom :22
      </text>
      <text x={360} y={102} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        SSH
      </text>

      {/* Rom 5432 */}
      <rect
        x={140}
        y={120}
        width={80}
        height={40}
        rx={4}
        className="fill-purple-500/15 stroke-purple-500"
        strokeWidth={1}
      />
      <text
        x={180}
        y={138}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Rom :5432
      </text>
      <text x={180} y={152} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        PostgreSQL
      </text>

      {/* Rom 51001 */}
      <rect
        x={230}
        y={120}
        width={80}
        height={40}
        rx={4}
        className="fill-destructive/15 stroke-destructive"
        strokeWidth={1}
      />
      <text
        x={270}
        y={138}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Rom :51001
      </text>
      <text x={270} y={152} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        ephemeral
      </text>

      {/* Rom 51002 */}
      <rect
        x={320}
        y={120}
        width={80}
        height={40}
        rx={4}
        className="fill-destructive/15 stroke-destructive"
        strokeWidth={1}
      />
      <text
        x={360}
        y={138}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Rom :51002
      </text>
      <text x={360} y={152} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        ephemeral
      </text>

      {/* Resepsjonist */}
      <circle cx={270} cy={185} r={14} className="fill-purple-500" />
      <text x={270} y={189} textAnchor="middle" className="fill-white text-[9px] font-semibold">
        R
      </text>
      <text x={310} y={189} className="fill-muted-foreground text-[9px]">
        ← Resepsjonist (transportlaget)
      </text>

      {/* Postmann */}
      <circle cx={40} cy={125} r={14} className="fill-amber-500" />
      <text x={40} y={129} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        P
      </text>
      <text x={40} y={150} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        Postmann
      </text>
      <text x={40} y={162} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        (IP-laget)
      </text>

      <line
        x1={56}
        y1={125}
        x2={115}
        y2={125}
        className="stroke-foreground/60"
        strokeWidth={1.5}
        markerEnd="url(#arrowPort)"
      />
      <text x={85} y={120} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        postbunke
      </text>

      <text x={250} y={228} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Resepsjonisten leser «rom-nummer» (port) og leverer i riktig posthylle
      </text>

      <defs>
        <marker
          id="arrowPort"
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-foreground/60" />
        </marker>
      </defs>
    </svg>
  );
}

function PostkortVsRekSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        UDP = postkort · TCP = rekommandert brev med kvittering
      </text>

      {/* UDP side - postkort */}
      <rect
        x={30}
        y={40}
        width={200}
        height={170}
        rx={6}
        className="fill-amber-500/5 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text
        x={130}
        y={58}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        UDP — postkort
      </text>

      {/* Postkort */}
      <rect
        x={60}
        y={75}
        width={140}
        height={80}
        rx={3}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={1.2}
      />
      <line x1={130} y1={75} x2={130} y2={155} className="stroke-amber-500/50" strokeWidth={1} />
      <text x={75} y={92} className="fill-foreground text-[8px]">
        Hilsen fra
      </text>
      <text x={75} y={104} className="fill-foreground text-[8px]">
        Stavanger!
      </text>
      <text x={75} y={130} className="fill-muted-foreground text-[7px]">
        (åpen,
      </text>
      <text x={75} y={140} className="fill-muted-foreground text-[7px]">
        alle kan lese)
      </text>
      <text x={140} y={92} className="fill-foreground text-[7px]">
        Til:
      </text>
      <text x={140} y={104} className="fill-foreground text-[7px]">
        Bestemor
      </text>
      <text x={140} y={116} className="fill-foreground text-[7px]">
        Tromsø
      </text>

      <text x={130} y={175} textAnchor="middle" className="fill-foreground text-[9px]">
        8 bytes header
      </text>
      <text x={130} y={188} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        ingen kvittering · ingen avtale
      </text>
      <text x={130} y={200} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        slipp i postkassen · ferdig
      </text>

      {/* TCP side - rekommandert */}
      <rect
        x={270}
        y={40}
        width={200}
        height={170}
        rx={6}
        className="fill-success/5 stroke-success"
        strokeWidth={1.5}
      />
      <text
        x={370}
        y={58}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        TCP — rekommandert
      </text>

      {/* Konvolutt med segl */}
      <rect
        x={300}
        y={75}
        width={140}
        height={80}
        rx={3}
        className="fill-success/15 stroke-success"
        strokeWidth={1.2}
      />
      <path
        d="M 300 75 L 370 115 L 440 75"
        className="fill-none stroke-success/60"
        strokeWidth={1}
      />
      <circle
        cx={370}
        cy={115}
        r={6}
        className="fill-destructive/30 stroke-destructive"
        strokeWidth={1}
      />
      <text x={370} y={117} textAnchor="middle" className="fill-destructive text-[6px] font-bold">
        SEGL
      </text>
      <text x={310} y={138} className="fill-foreground text-[7px]">
        Spor: 47281
      </text>
      <text x={310} y={148} className="fill-foreground text-[7px]">
        Krav: signatur
      </text>

      <text x={370} y={175} textAnchor="middle" className="fill-foreground text-[9px]">
        20+ bytes header
      </text>
      <text x={370} y={188} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        handshake først · kvittering
      </text>
      <text x={370} y={200} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        re-send hvis tapt · i orden
      </text>

      <text x={250} y={230} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Velg postkort når du sender mange korte hilsener — rekommandert når hver byte må fram
      </text>
    </svg>
  );
}

function StopAndWaitVsPipelineSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Stop-and-wait vs pipelining — flyet med tom vs full last
      </text>

      {/* Stop-and-wait */}
      <text
        x={250}
        y={40}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Stop-and-wait: én koffert per tur
      </text>

      {/* Sender 1 */}
      <circle cx={60} cy={70} r={10} className="fill-brand stroke-brand" />
      <text x={60} y={90} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        avs.
      </text>

      {/* Plane outline tom */}
      <rect
        x={100}
        y={55}
        width={300}
        height={30}
        rx={15}
        className="fill-amber-500/10 stroke-amber-500"
        strokeWidth={1.2}
      />
      <rect
        x={110}
        y={62}
        width={16}
        height={16}
        rx={2}
        className="fill-success/40 stroke-success"
        strokeWidth={1}
      />
      <text x={250} y={75} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        ← 1 koffert · 999 plasser tomme · returnerer tomt →
      </text>

      <circle cx={440} cy={70} r={10} className="fill-success stroke-success" />
      <text x={440} y={90} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        mott.
      </text>

      {/* Pipelining */}
      <text
        x={250}
        y={130}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Pipelining: full last per tur
      </text>

      <circle cx={60} cy={160} r={10} className="fill-brand stroke-brand" />
      <text x={60} y={180} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        avs.
      </text>

      <rect
        x={100}
        y={145}
        width={300}
        height={30}
        rx={15}
        className="fill-amber-500/10 stroke-amber-500"
        strokeWidth={1.2}
      />
      {Array.from({ length: 15 }).map((_, i) => (
        <rect
          key={i}
          x={108 + i * 18}
          y={152}
          width={16}
          height={16}
          rx={2}
          className="fill-success/60 stroke-success"
          strokeWidth={1}
        />
      ))}
      <text x={250} y={165} textAnchor="middle" className="fill-white text-[8px] font-semibold" />

      <circle cx={440} cy={160} r={10} className="fill-success stroke-success" />
      <text x={440} y={180} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        mott.
      </text>

      <text x={250} y={205} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        BDP = båndbredde × RTT = hvor mange kofferter som «får plass» i flyet under én tur
      </text>
      <text x={250} y={222} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Vindusstørrelsen må matche BDP for å fylle lenken
      </text>
    </svg>
  );
}

function ThreeWayHandshakeSvg() {
  return (
    <svg viewBox="0 0 500 260" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        3-veis handshake som tinder-dialog
      </text>

      {/* Klient */}
      <rect
        x={30}
        y={40}
        width={120}
        height={40}
        rx={6}
        className="fill-brand/15 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={90} y={64} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        Klient
      </text>

      {/* Server */}
      <rect
        x={350}
        y={40}
        width={120}
        height={40}
        rx={6}
        className="fill-success/15 stroke-success"
        strokeWidth={1.5}
      />
      <text
        x={410}
        y={64}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Server
      </text>

      {/* Timelines */}
      <line
        x1={90}
        y1={80}
        x2={90}
        y2={240}
        className="stroke-foreground/30"
        strokeWidth={1}
        strokeDasharray="3 2"
      />
      <line
        x1={410}
        y1={80}
        x2={410}
        y2={240}
        className="stroke-foreground/30"
        strokeWidth={1}
        strokeDasharray="3 2"
      />

      {/* SYN */}
      <line
        x1={90}
        y1={105}
        x2={410}
        y2={130}
        className="stroke-brand"
        strokeWidth={1.8}
        markerEnd="url(#arrow3w)"
      />
      <rect
        x={170}
        y={95}
        width={160}
        height={28}
        rx={4}
        className="fill-brand/15 stroke-brand"
        strokeWidth={1}
      />
      <text
        x={250}
        y={107}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-semibold"
      >
        1. SYN, seq=x
      </text>
      <text x={250} y={119} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        «møte onsdag? mitt nr: x»
      </text>

      {/* SYN-ACK */}
      <line
        x1={410}
        y1={155}
        x2={90}
        y2={180}
        className="stroke-success"
        strokeWidth={1.8}
        markerEnd="url(#arrow3w)"
      />
      <rect
        x={170}
        y={145}
        width={160}
        height={28}
        rx={4}
        className="fill-success/15 stroke-success"
        strokeWidth={1}
      />
      <text
        x={250}
        y={157}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-semibold"
      >
        2. SYN+ACK, seq=y, ack=x+1
      </text>
      <text x={250} y={169} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        «ja, mottok x. mitt nr: y»
      </text>

      {/* ACK */}
      <line
        x1={90}
        y1={205}
        x2={410}
        y2={230}
        className="stroke-brand"
        strokeWidth={1.8}
        markerEnd="url(#arrow3w)"
      />
      <rect
        x={170}
        y={195}
        width={160}
        height={28}
        rx={4}
        className="fill-brand/15 stroke-brand"
        strokeWidth={1}
      />
      <text
        x={250}
        y={207}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-semibold"
      >
        3. ACK, ack=y+1
      </text>
      <text x={250} y={219} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        «mottok y — vi sees onsdag»
      </text>

      <defs>
        <marker
          id="arrow3w"
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-foreground/60" />
        </marker>
      </defs>

      <text x={250} y={253} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Etter steg 3 vet BÅDE klient og server at den andre har bekreftet — forbindelsen er
        ESTABLISHED
      </text>
    </svg>
  );
}

function TrafikkE18Svg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        TCP-trafikk som E18-køen: AIMD finner jevn fart
      </text>

      {/* Road */}
      <rect
        x={30}
        y={80}
        width={440}
        height={70}
        rx={4}
        className="fill-muted/50 stroke-border"
        strokeWidth={1.2}
      />
      <line
        x1={30}
        y1={115}
        x2={470}
        y2={115}
        className="stroke-amber-500"
        strokeWidth={1}
        strokeDasharray="8 8"
      />

      {/* Cars - før flaskehals (lite trafikk, høy fart) */}
      <rect
        x={50}
        y={90}
        width={28}
        height={14}
        rx={2}
        className="fill-brand stroke-brand"
        strokeWidth={1}
      />
      <rect
        x={100}
        y={90}
        width={28}
        height={14}
        rx={2}
        className="fill-success stroke-success"
        strokeWidth={1}
      />
      <rect
        x={150}
        y={90}
        width={28}
        height={14}
        rx={2}
        className="fill-amber-500 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={120} y={75} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        jevn flyt: «slow start»
      </text>

      <rect
        x={70}
        y={123}
        width={28}
        height={14}
        rx={2}
        className="fill-purple-500 stroke-purple-500"
        strokeWidth={1}
      />
      <rect
        x={130}
        y={123}
        width={28}
        height={14}
        rx={2}
        className="fill-destructive stroke-destructive"
        strokeWidth={1}
      />

      {/* Bottleneck */}
      <path
        d="M 220 80 L 250 115 L 220 150"
        className="fill-destructive/20 stroke-destructive"
        strokeWidth={1.5}
      />
      <path
        d="M 320 80 L 290 115 L 320 150"
        className="fill-destructive/20 stroke-destructive"
        strokeWidth={1.5}
      />
      <text
        x={270}
        y={70}
        textAnchor="middle"
        className="fill-destructive text-[10px] font-semibold"
      >
        Sjølyst-krysset
      </text>

      {/* Cars i kø */}
      <rect
        x={260}
        y={90}
        width={22}
        height={14}
        rx={2}
        className="fill-brand stroke-brand"
        strokeWidth={1}
      />
      <rect
        x={262}
        y={123}
        width={22}
        height={14}
        rx={2}
        className="fill-amber-500 stroke-amber-500"
        strokeWidth={1}
      />

      {/* After bottleneck */}
      <rect
        x={340}
        y={90}
        width={28}
        height={14}
        rx={2}
        className="fill-success stroke-success"
        strokeWidth={1}
      />
      <rect
        x={400}
        y={90}
        width={28}
        height={14}
        rx={2}
        className="fill-purple-500 stroke-purple-500"
        strokeWidth={1}
      />
      <rect
        x={360}
        y={123}
        width={28}
        height={14}
        rx={2}
        className="fill-destructive stroke-destructive"
        strokeWidth={1}
      />

      {/* AIMD labels */}
      <text
        x={130}
        y={175}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-semibold"
      >
        +1 per RTT (additiv økning)
      </text>
      <text x={130} y={188} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        hver bil kjører litt fortere når det flyter
      </text>

      <text
        x={400}
        y={175}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-semibold"
      >
        ÷2 ved tap (mult. reduksjon)
      </text>
      <text x={400} y={188} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        står stille i krysset → alle senker farten
      </text>

      <text x={250} y={215} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Ingen sentral trafikk-styring — hver TCP-strøm justerer kun ut fra eget tap-signal
      </text>
      <text
        x={250}
        y={230}
        textAnchor="middle"
        className="fill-purple-700 dark:fill-purple-400 text-[9px] font-semibold"
      >
        Etter mange runder konvergerer alle mot lik fart over flaskehalsen
      </text>
    </svg>
  );
}

// ============================================================
// 3.8 — Eksamen-fokus
// ============================================================
function SectionEksamen() {
  return (
    <article className="space-y-5 text-sm">
      <Header num="3.8" title="Eksamen-fokus — kompakt repetisjon" />

      <p className="text-muted-foreground">
        Denne delen er bygget for å hentes fram dagen før eksamen og pugges raskt. Her er ikke målet
        å forstå fra bunnen av — det har de seks foregående seksjonene allerede dekket. Her er målet
        å holde alt sammen, skille likner som ofte forveksles, og ha klare verktøy for å velge
        protokoll og lese feil-signaler under press.
      </p>

      {/* (a) Cheat sheet */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold">a) Cheat sheet for kap. 3</h3>
        <div className="grid gap-3 lg:grid-cols-2">
          <Cheat tittel="RTT-estimering (TCP timeout)">
            <Formel>EstimatedRTT = (1 − α) · EstimatedRTT + α · SampleRTT</Formel>
            <Formel>DevRTT = (1 − β) · DevRTT + β · |SampleRTT − EstimatedRTT|</Formel>
            <Formel>TimeoutInterval = EstimatedRTT + 4 · DevRTT</Formel>
            <EwmaMiniSvg />
            <p>
              Standard-verdier: α = 0,125 og β = 0,25. EstimatedRTT er et glidende snitt; DevRTT er
              glidende snitt over avviket — altså «hvor mye varierer RTT?». 4·DevRTT-margenen gir
              slingringsmonn slik at en tilfeldig forsinket ACK ikke trigger unødig retransmisjon.
            </p>
          </Cheat>

          <Cheat tittel="TCP-tilstands-spor (vanlig sti)">
            <p className="font-semibold">Klient (aktiv åpning):</p>
            <Formel>
              CLOSED → SYN_SENT → ESTABLISHED → FIN_WAIT_1 → FIN_WAIT_2 → TIME_WAIT → CLOSED
            </Formel>
            <p className="font-semibold">Server (passiv åpning):</p>
            <Formel>
              CLOSED → LISTEN → SYN_RCVD → ESTABLISHED → CLOSE_WAIT → LAST_ACK → CLOSED
            </Formel>
            <TcpStateMachineSvg />
            <p>
              TIME_WAIT varer i 2·MSL (Maximum Segment Lifetime) for å fange ekko-segmenter og
              bekrefte at siste ACK kom fram. Det er derfor du ikke kan starte ny tjener på samme
              port med en gang etter at den er stengt.
            </p>
          </Cheat>

          <Cheat tittel="TCP-flagg (6 bits i header)">
            <TcpFlagsRowSvg />
            <ul className="space-y-1 list-disc list-inside">
              <li>
                <b>SYN</b> — synkroniser sekvens-nummer (åpning).
              </li>
              <li>
                <b>ACK</b> — bekrefter mottatte byte; ACK-feltet er meningsfullt.
              </li>
              <li>
                <b>FIN</b> — sender har ingen mer data å sende (avslutning).
              </li>
              <li>
                <b>RST</b> — reset; abort uten å forhandle (port stengt, illegal tilstand).
              </li>
              <li>
                <b>PSH</b> — push opp til appen umiddelbart (ikke vent i mottak-buffer).
              </li>
              <li>
                <b>URG</b> — urgent pointer-feltet er gyldig (sjeldent brukt i praksis).
              </li>
            </ul>
          </Cheat>

          <Cheat tittel="AIMD — Additive Increase, Multiplicative Decrease">
            <AimdMiniSawtoothSvg />
            <ul className="space-y-1 list-disc list-inside">
              <li>
                <b>+1 MSS per RTT</b> mens alt går bra (additiv økning).
              </li>
              <li>
                <b>÷2</b> ved tap (multiplikativ reduksjon — halver cwnd).
              </li>
              <li>Tegner et karakteristisk sag-tann-mønster i cwnd over tid.</li>
              <li>Rasjonalet: konvergerer til rettferdig fordeling, sterk respons på trengsel.</li>
            </ul>
          </Cheat>

          <Cheat tittel="Slow start vs. congestion avoidance">
            <SlowStartVsCaSvg />
            <ul className="space-y-1 list-disc list-inside">
              <li>
                <b>cwnd &lt; ssthresh</b> → slow start: cwnd dobles per RTT (eksponentiell).
              </li>
              <li>
                <b>cwnd ≥ ssthresh</b> → congestion avoidance: cwnd + 1 MSS per RTT (lineær).
              </li>
              <li>Ved timeout: ssthresh = cwnd/2, cwnd = 1, tilbake til slow start.</li>
              <li>
                Ved 3 dup-ACK (fast retransmit): ssthresh = cwnd/2, cwnd = ssthresh, fortsett i
                congestion avoidance (TCP Reno).
              </li>
            </ul>
          </Cheat>

          <Cheat tittel="UDP-header — 4 felter, 8 byte totalt">
            <UdpFourBoxesSvg />
            <ul className="space-y-1 list-disc list-inside">
              <li>
                <b>Source port</b> (16 bit) — kan settes til 0 hvis ingen retur ønskes.
              </li>
              <li>
                <b>Destination port</b> (16 bit) — hvilken prosess på mottaker.
              </li>
              <li>
                <b>Length</b> (16 bit) — header + data i byte (min 8).
              </li>
              <li>
                <b>Checksum</b> (16 bit) — over header + data + IP-pseudoheader; valgfri på IPv4,
                obligatorisk på IPv6.
              </li>
            </ul>
            <p className="italic">
              Sammenlign med TCP sin 20-byte minimum-header (og opptil 60 med options).
            </p>
          </Cheat>
        </div>
      </section>

      {/* (b) Sammenligning */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold">b) TCP vs UDP — direkte sammenligning</h3>
        <Illustration caption="Pakke-format side-ved-side: TCP-headeren er minst 20 byte (med felter for sekvens, ACK, window, flagg); UDP-headeren er fast 8 byte med kun fire 16-bits-felter.">
          <TcpUdpPackagesSvg />
        </Illustration>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-[13px]">
            <thead className="bg-muted/40">
              <tr className="text-left">
                <th className="px-3 py-2 font-semibold">Egenskap</th>
                <th className="px-3 py-2 font-semibold text-sky-700 dark:text-sky-400">TCP</th>
                <th className="px-3 py-2 font-semibold text-amber-700 dark:text-amber-400">UDP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <SammenlignRad
                trekk="Pålitelighet"
                tcp="Garantert leveranse via ACK + retransmisjon"
                udp="Ingen garanti — pakker kan forsvinne ubemerket"
              />
              <SammenlignRad
                trekk="Ordring av data"
                tcp="Sekvens-numre rekonstruerer rekkefølge"
                udp="Pakker leveres i den rekkefølgen de kommer (eller ikke)"
              />
              <SammenlignRad
                trekk="Header-størrelse"
                tcp="20–60 byte (vanlig 20)"
                udp="8 byte (fast)"
              />
              <SammenlignRad
                trekk="ACK + timeout"
                tcp="Hvert byte bekreftes; timer per ubekreftet segment"
                udp="Ingen ACK, ingen timer — fire and forget"
              />
              <SammenlignRad
                trekk="Flow control"
                tcp="rwnd i header — mottaker bremser sender"
                udp="Ingen — sender kan oversvømme mottaker"
              />
              <SammenlignRad
                trekk="Congestion control"
                tcp="cwnd, AIMD, slow start, fast retransmit"
                udp="Ingen — app må selv håndtere trengsel"
              />
              <SammenlignRad
                trekk="Forbindelse"
                tcp="3-veis handshake + 4-veis tear-down"
                udp="Forbindelsesløs — første pakke er også den siste"
              />
              <SammenlignRad
                trekk="Bytestrøm vs datagram"
                tcp="Bytestrøm — grensene mellom send() forsvinner"
                udp="Bevarer pakke-grenser fra hvert sendto()"
              />
              <SammenlignRad
                trekk="Bruks-tilfeller"
                tcp="Web (HTTP/1.1/2), e-post, SSH, filoverføring, DB"
                udp="DNS-spørringer, NTP, sann-tid video/audio, QUIC-laget under HTTP/3, spill"
              />
            </tbody>
          </table>
        </div>
      </section>

      {/* (c) Beslutningstre */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold">
          c) Beslutningstre: «Hvilken transport-protokoll skal jeg velge?»
        </h3>
        <Illustration caption="Følg piler fra topp-noden. Hvert spørsmål er ja/nei. Bladene viser den vanligste anbefalingen — men en app kan ofte bygge påliteligheten den trenger oppå UDP hvis ytelse er kritisk.">
          <BeslutningstreSvg />
        </Illustration>
      </section>

      {/* (d) Fallgruver */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold">d) Vanlige fallgruver på eksamen</h3>
        <div className="grid gap-3 lg:grid-cols-2">
          <Fallgruve tittel="Forveksle dup-ACK med timeout">
            <DupAckVsTimeoutSvg />
            Begge er tap-signaler, men de fører til ulik respons. <b>Tre dup-ACK</b> trigger fast
            retransmit + fast recovery: ssthresh = cwnd/2 og cwnd = ssthresh (TCP Reno). En ren{" "}
            <b>timeout</b> tolker TCP som mye verre — full reset: ssthresh = cwnd/2, cwnd = 1 MSS,
            tilbake til slow start. Logikken: dup-ACK betyr at noe kom fram (kanalen virker),
            timeout betyr at ingen ACK kommer i det hele tatt.
          </Fallgruve>

          <Fallgruve tittel="Tro at TCP justerer rwnd ved trengsel">
            TCP justerer <b>cwnd</b> (congestion window) ved tap. <b>rwnd</b> (receive window) er
            mottakerens egen melding om hvor mye buffer-plass hen har igjen, og endres bare når
            mottaker leser data ut av buffer. Sender bruker <code>min(cwnd, rwnd)</code> som faktisk
            send-vindu. Forvirring her gir feil svar på «hvem styrer ratejusteringen?».
          </Fallgruve>

          <Fallgruve tittel="Tro at handshake er 2-veis">
            <HandshakeMiniSvg />
            TCP-oppsett er <b>3-veis</b>: SYN → SYN+ACK → ACK. To-veis ville vært sårbart for gamle,
            forsinkede SYN-segmenter som dukker opp og åpner en spøkelses-forbindelse. Det tredje
            ACK-et lar serveren være sikker på at klienten faktisk er der og «mente» det. Tear-down
            er deretter <b>4-veis</b> (FIN, ACK, FIN, ACK) fordi hver retning lukkes uavhengig.
          </Fallgruve>

          <Fallgruve tittel="Glemme +1 i sekvens-numre for SYN og FIN">
            SYN og FIN «teller som én byte» i sekvens-rommet selv om de ikke bærer data. Hvis klient
            sender SYN med seq=x, så bekrefter server med ack=x+1. Når server senere sender FIN med
            seq=y, bekrefter klient ack=y+1. Misser man dette, blir alle sekvens-regnestykker på
            eksamen forskjøvet med 1.
          </Fallgruve>

          <Fallgruve tittel="Tro at UDP-checksum gir pålitelighet">
            UDP-checksum sjekker bare om data er <i>korrupt</i> — den retransmitterer ingenting. En
            korrupt pakke blir kastet stille. Mottaker-app vet ikke at noe forsvant. Pålitelig
            leveranse krever ACK + timer + sekvens-numre, ikke bare en checksum.
          </Fallgruve>

          <Fallgruve tittel="Forveksle Go-Back-N med Selective Repeat">
            <b>Go-Back-N</b>: kumulative ACK; ved tap retransmitteres alt fra og med tapt segment.
            Mottaker er enkel (godtar bare neste-i-rekka, kaster resten). <b>Selective Repeat</b>:
            individuelle ACK; sender retransmitterer kun det som faktisk mangler. Mottaker buffrer
            ut-av-rekka segmenter. TCP er en blanding: kumulativ ACK (som GBN), men fast retransmit
            ved 3 dup-ACK gjør at bare ett segment sendes på nytt (som SR).
          </Fallgruve>

          <Fallgruve tittel="Glemme at TCP er full-duplex">
            En TCP-forbindelse har <b>to uavhengige byte-strømmer</b> — én i hver retning. De har
            hvert sitt sekvens-nummer-rom, hver sin flow-window, og kan lukkes uavhengig (derfor FIN
            i hver retning ved tear-down). Det er hyppig feil å tegne én pil på diagram.
          </Fallgruve>

          <Fallgruve tittel="Tro at Nagle og forsinket ACK alltid hjelper">
            Begge er optimeringer for mange små segmenter, men sammen kan de gi 200 ms ekstra latens
            på interaktive protokoller (telnet, RPC). Nagle holder igjen til den har en full MSS
            eller en ACK; forsinket ACK venter for å piggybacke. Resultat: deadlock-aktig
            ventespill. Derfor sett <code>TCP_NODELAY</code> for latens-følsomme apper.
          </Fallgruve>

          <Fallgruve tittel="Tro at port-nummer identifiserer prosess globalt">
            Port alene er ikke nok. <b>Demux</b> på UDP bruker (dst-IP, dst-port). På TCP brukes
            <b> 4-tuppelen</b> (src-IP, src-port, dst-IP, dst-port) — derfor kan to ulike klienter
            koble seg til samme server-port samtidig og ende i to forskjellige sockets på serveren.
            Port alene er som «leilighet nr. 4» uten husnummer.
          </Fallgruve>

          <Fallgruve tittel="Blande sammen MSS, MTU og window-størrelse">
            <b>MTU</b> (Maximum Transmission Unit) er link-lagets pakke-tak, typisk 1500 byte for
            Ethernet. <b>MSS</b> (Maximum Segment Size) er TCP-data per segment — typisk MTU − 40 =
            1460 byte (trekk fra IP + TCP-header). <b>Window</b> er antall byte sender kan ha
            ubekreftet på en gang, helt urelatert til segment-størrelse.
          </Fallgruve>
        </div>
      </section>

      {/* (e) 5-minutter-anker */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold">e) 5-minutter-anker</h3>
        <p className="text-muted-foreground">
          Hvis du har fem minutter igjen før eksamen og bare kan repetere én ting fra kap. 3, les
          denne lista. Den er ment som siste sjekk — alt under bør være selvinnlysende.
        </p>
        <AnkerGrid />
        <Anker>
          <AnkerPunkt n={1}>
            <b>Transportlaget</b> gir prosess-til-prosess på toppen av IP sin host-til-host. Bare
            endepunktene har transport, rutere bare IP.
          </AnkerPunkt>
          <AnkerPunkt n={2}>
            <b>Mux</b> = legge til (src-port, dst-port) på sender. <b>Demux</b> = velge socket på
            mottaker. TCP demuxer på 4-tuppel; UDP demuxer på 2-tuppel (dst-IP, dst-port).
          </AnkerPunkt>
          <AnkerPunkt n={3}>
            <b>UDP</b> = 8-byte header (src-port, dst-port, length, checksum). Forbindelsesløs.
            Pakke-grenser bevares. Ingen ACK, ingen retransmisjon, ingen flow/congestion control.
          </AnkerPunkt>
          <AnkerPunkt n={4}>
            <b>TCP</b> = bytestrøm, pålitelig, ordnet, full-duplex. 20-byte minimum header. Setup
            via 3-veis handshake, tear-down via 4-veis (FIN i hver retning).
          </AnkerPunkt>
          <AnkerPunkt n={5}>
            <b>Pålitelig leveranse</b> krever: ACK, sekvens-numre, timer, retransmisjon. Velg én
            blant Stop-and-Wait, Go-Back-N (kumulativ ACK), Selective Repeat (individuell ACK).
          </AnkerPunkt>
          <AnkerPunkt n={6}>
            <b>TCP-timer</b>: TimeoutInterval = EstimatedRTT + 4·DevRTT, glidende snitt med α =
            0,125 og β = 0,25.
          </AnkerPunkt>
          <AnkerPunkt n={7}>
            <b>Fast retransmit</b>: 3 duplikat-ACK på samme byte → retransmitter umiddelbart, ikke
            vent på timer.
          </AnkerPunkt>
          <AnkerPunkt n={8}>
            <b>Flow control</b> (rwnd) beskytter mottaker mot oversvømmelse.{" "}
            <b>Congestion control</b> (cwnd) beskytter nettverket. Faktisk send-vindu = min(cwnd,
            rwnd).
          </AnkerPunkt>
          <AnkerPunkt n={9}>
            <b>AIMD</b>: +1 MSS per RTT i godvær, ÷2 ved tap. Gir sag-tann i cwnd og konvergerer mot
            rettferdig fordeling.
          </AnkerPunkt>
          <AnkerPunkt n={10}>
            <b>Slow start</b>: cwnd dobles per RTT mens cwnd &lt; ssthresh. Ved cwnd ≥ ssthresh slår
            man over til lineær økning (congestion avoidance).
          </AnkerPunkt>
          <AnkerPunkt n={11}>
            <b>Timeout</b> = nullstill til slow start (cwnd = 1). <b>3 dup-ACK</b> = milder respons
            (fast recovery, cwnd halveres men holder seg i congestion avoidance) — TCP
            Reno-oppførsel.
          </AnkerPunkt>
          <AnkerPunkt n={12}>
            <b>Velg UDP</b> når: sann-tids-krav, multicast, små engangs-spørringer (DNS), eller
            applikasjonen vil bygge egen pålitelighet (QUIC).
          </AnkerPunkt>
          <AnkerPunkt n={13}>
            <b>Velg TCP</b> når: tap er uakseptabelt, ordring er kritisk, og forsinkelse er
            akseptabel — alt fra HTTP til SSH til filoverføring.
          </AnkerPunkt>
        </Anker>
      </section>
    </article>
  );
}

// --- Eksamen-helpers ---

function Cheat({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
        Cheat
      </div>
      <div className="font-semibold text-foreground mb-2">{tittel}</div>
      <div className="text-muted-foreground text-[13px] space-y-2">{children}</div>
    </div>
  );
}

function Formel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded bg-muted/40 px-2 py-1.5 font-mono text-[12px] text-foreground">
      {children}
    </div>
  );
}

function SammenlignRad({ trekk, tcp, udp }: { trekk: string; tcp: string; udp: string }) {
  return (
    <tr>
      <td className="px-3 py-2 font-semibold text-foreground align-top">{trekk}</td>
      <td className="px-3 py-2 text-muted-foreground align-top">{tcp}</td>
      <td className="px-3 py-2 text-muted-foreground align-top">{udp}</td>
    </tr>
  );
}

function Fallgruve({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-destructive font-semibold mb-1">
        ⚠ Fallgruve
      </div>
      <div className="font-semibold text-foreground mb-1">{tittel}</div>
      <div className="text-muted-foreground text-[13px] space-y-2">{children}</div>
    </div>
  );
}

function Anker({ children }: { children: React.ReactNode }) {
  return (
    <ol className="rounded-xl border border-brand/30 bg-brand/5 p-4 space-y-2 text-[13px]">
      {children}
    </ol>
  );
}

function AnkerPunkt({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="inline-flex shrink-0 h-5 w-5 items-center justify-center rounded-full bg-brand/20 text-brand text-[10px] font-bold">
        {n}
      </span>
      <span className="text-muted-foreground">{children}</span>
    </li>
  );
}

function BeslutningstreSvg() {
  // Decision tree: choose transport protocol.
  // Layout: root at top, branches downward.
  return (
    <svg viewBox="0 0 600 440" className="w-full h-auto">
      {/* Root */}
      <TreNode x={300} y={28} label="Velg transport-protokoll" tone="root" />

      {/* Level 1: real-time? */}
      <TreLinje x1={300} y1={48} x2={300} y2={78} />
      <TreNode x={300} y={92} label="Real-time / lav latens?" tone="q" />

      {/* Yes (left) → multicast? */}
      <TreGren x1={300} y1={112} x2={140} y2={158} label="Ja" />
      <TreNode x={140} y={172} label="Multicast eller broadcast?" tone="q" />

      {/* multicast yes → UDP */}
      <TreGren x1={140} y1={192} x2={60} y2={238} label="Ja" />
      <TreNode x={60} y={252} label="UDP" tone="udp" />
      <TreNote x={60} y={278} text="kun UDP støtter dette" />

      {/* multicast no → can app tolerate loss? */}
      <TreGren x1={140} y1={192} x2={220} y2={238} label="Nei" />
      <TreNode x={220} y={252} label="Tåler app små tap?" tone="q" />

      {/* tolerate loss yes → UDP */}
      <TreGren x1={220} y1={272} x2={150} y2={318} label="Ja" />
      <TreNode x={150} y={332} label="UDP" tone="udp" />
      <TreNote x={150} y={358} text="DNS, NTP, RTP, spill" />

      {/* tolerate loss no → QUIC/custom */}
      <TreGren x1={220} y1={272} x2={300} y2={318} label="Nei" />
      <TreNode x={300} y={332} label="UDP + egen pålitelighet" tone="udp" />
      <TreNote x={300} y={358} text="QUIC, app-lag retransmit" />

      {/* No (right) → reliability needed? */}
      <TreGren x1={300} y1={112} x2={460} y2={158} label="Nei" />
      <TreNode x={460} y={172} label="Trenger pålitelig + ordnet?" tone="q" />

      {/* reliability yes → TCP */}
      <TreGren x1={460} y1={192} x2={460} y2={238} label="Ja" />
      <TreNode x={460} y={252} label="TCP" tone="tcp" />
      <TreNote x={460} y={278} text="HTTP, SSH, e-post, DB" />

      {/* reliability no → tiny single message? */}
      <TreGren x1={460} y1={192} x2={550} y2={238} label="Nei" />
      <TreNode x={550} y={252} label="UDP" tone="udp" />
      <TreNote x={550} y={278} text="liten engangs-spørring" />

      {/* Legend */}
      <g transform="translate(20, 405)">
        <rect width={12} height={12} rx={3} className="fill-sky-500/80" />
        <text x={18} y={10} className="fill-muted-foreground text-[10px]">
          TCP-blad
        </text>
        <rect x={88} width={12} height={12} rx={3} className="fill-amber-500/80" />
        <text x={106} y={10} className="fill-muted-foreground text-[10px]">
          UDP-blad
        </text>
        <rect x={176} width={12} height={12} rx={3} className="fill-muted" />
        <text x={194} y={10} className="fill-muted-foreground text-[10px]">
          spørsmål
        </text>
      </g>
    </svg>
  );
}

function TreNode({
  x,
  y,
  label,
  tone,
}: {
  x: number;
  y: number;
  label: string;
  tone: "root" | "q" | "tcp" | "udp";
}) {
  const w = Math.max(110, label.length * 6.6);
  const fill =
    tone === "tcp"
      ? "fill-sky-500/80"
      : tone === "udp"
        ? "fill-amber-500/80"
        : tone === "root"
          ? "fill-brand/80"
          : "fill-card";
  const stroke =
    tone === "tcp"
      ? "stroke-sky-600"
      : tone === "udp"
        ? "stroke-amber-600"
        : tone === "root"
          ? "stroke-brand"
          : "stroke-border";
  const textCls = tone === "q" ? "fill-foreground" : "fill-white dark:fill-white";
  return (
    <g>
      <rect
        x={x - w / 2}
        y={y - 11}
        width={w}
        height={22}
        rx={6}
        className={`${fill} ${stroke}`}
        strokeWidth={1.2}
      />
      <text x={x} y={y + 4} textAnchor="middle" className={`${textCls} text-[10px] font-semibold`}>
        {label}
      </text>
    </g>
  );
}

function TreLinje({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-border" strokeWidth={1.2} />;
}

function TreGren({
  x1,
  y1,
  x2,
  y2,
  label,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
}) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-border" strokeWidth={1.2} />
      <rect
        x={mx - 11}
        y={my - 7}
        width={22}
        height={13}
        rx={3}
        className="fill-background stroke-border"
        strokeWidth={0.8}
      />
      <text x={mx} y={my + 3} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        {label}
      </text>
    </g>
  );
}

function TreNote({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text x={x} y={y} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
      {text}
    </text>
  );
}

// ============================================================
// Nye Eksamen-tab SVG-er (mini-illustrasjoner i cheat-blokker,
// pakke-format-sammenligning, fallgruve-mini, anker-grid)
// ============================================================

// EWMA-kurve for RTT-estimering. Viser SampleRTT (støyete) vs EstimatedRTT (glattet).
function EwmaMiniSvg() {
  // Sample-data: SampleRTT i ms (med spikes) og glidet EstimatedRTT med α=0.125.
  const samples = [180, 210, 195, 240, 205, 270, 220, 210, 195, 230, 215, 200, 260, 210, 205];
  const alpha = 0.125;
  let est = samples[0];
  const ests = samples.map((s, i) => {
    if (i === 0) return s;
    est = (1 - alpha) * est + alpha * s;
    return est;
  });
  const W = 360;
  const H = 110;
  const padX = 28;
  const padY = 14;
  const xMin = padX;
  const xMax = W - 8;
  const yMin = padY;
  const yMax = H - 20;
  const vMin = 150;
  const vMax = 290;
  const xs = samples.map((_, i) => xMin + ((xMax - xMin) * i) / (samples.length - 1));
  const yOf = (v: number) => yMax - ((v - vMin) / (vMax - vMin)) * (yMax - yMin);
  const sampPath = samples.map((s, i) => `${i === 0 ? "M" : "L"}${xs[i]} ${yOf(s)}`).join(" ");
  const estPath = ests.map((s, i) => `${i === 0 ? "M" : "L"}${xs[i]} ${yOf(s)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* axes */}
      <line x1={xMin} y1={yMax} x2={xMax} y2={yMax} className="stroke-border" strokeWidth={0.8} />
      <line x1={xMin} y1={yMin} x2={xMin} y2={yMax} className="stroke-border" strokeWidth={0.8} />
      {/* y-ticks */}
      {[180, 230, 280].map((v) => (
        <g key={v}>
          <line
            x1={xMin - 3}
            y1={yOf(v)}
            x2={xMin}
            y2={yOf(v)}
            className="stroke-border"
            strokeWidth={0.7}
          />
          <text
            x={xMin - 5}
            y={yOf(v) + 3}
            textAnchor="end"
            className="fill-muted-foreground text-[8px]"
          >
            {v}
          </text>
        </g>
      ))}
      {/* sample dots + line */}
      <path
        d={sampPath}
        className="fill-none stroke-amber-500/70"
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      {samples.map((s, i) => (
        <circle key={i} cx={xs[i]} cy={yOf(s)} r={1.8} className="fill-amber-500" />
      ))}
      {/* est line */}
      <path d={estPath} className="fill-none stroke-sky-500" strokeWidth={1.8} />
      {/* labels */}
      <text
        x={xMax - 6}
        y={yMax + 14}
        textAnchor="end"
        className="fill-muted-foreground text-[8px]"
      >
        tid (sample-nr)
      </text>
      <text x={xMin - 22} y={yMin + 4} className="fill-muted-foreground text-[8px]">
        RTT (ms)
      </text>
      {/* legend */}
      <g transform={`translate(${xMin + 4}, ${yMin + 2})`}>
        <line
          x1={0}
          y1={4}
          x2={14}
          y2={4}
          className="stroke-amber-500/70"
          strokeWidth={1}
          strokeDasharray="2 2"
        />
        <text x={18} y={7} className="fill-muted-foreground text-[8px]">
          SampleRTT
        </text>
        <line x1={88} y1={4} x2={102} y2={4} className="stroke-sky-500" strokeWidth={1.8} />
        <text x={106} y={7} className="fill-muted-foreground text-[8px]">
          EstimatedRTT (α=0,125)
        </text>
      </g>
    </svg>
  );
}

// Forenklet TCP-tilstandsmaskin (klient + server-sti).
function TcpStateMachineSvg() {
  const W = 360;
  const H = 200;
  // States as (x, y, label)
  const node = (x: number, y: number, label: string, tone: "neutral" | "active" | "wait") => {
    const fill =
      tone === "active"
        ? "fill-sky-500/20 stroke-sky-500"
        : tone === "wait"
          ? "fill-amber-500/20 stroke-amber-500"
          : "fill-muted/40 stroke-border";
    const tw = Math.max(58, label.length * 5.8);
    return (
      <g key={`${x},${y},${label}`}>
        <rect
          x={x - tw / 2}
          y={y - 9}
          width={tw}
          height={18}
          rx={4}
          className={fill}
          strokeWidth={1}
        />
        <text
          x={x}
          y={y + 3}
          textAnchor="middle"
          className="fill-foreground text-[8.5px] font-semibold"
        >
          {label}
        </text>
      </g>
    );
  };
  const arrow = (x1: number, y1: number, x2: number, y2: number, label?: string) => {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2 - 3;
    return (
      <g key={`a-${x1}-${y1}-${x2}-${y2}`}>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          className="stroke-border"
          strokeWidth={1}
          markerEnd="url(#tcparrow)"
        />
        {label && (
          <text x={mx} y={my} textAnchor="middle" className="fill-muted-foreground text-[7.5px]">
            {label}
          </text>
        )}
      </g>
    );
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <marker
          id="tcparrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,0 L10,5 L0,10 z" className="fill-border" />
        </marker>
      </defs>
      {/* Klient-rad */}
      <text x={6} y={14} className="fill-sky-700 dark:fill-sky-400 text-[9px] font-semibold">
        Klient
      </text>
      {node(50, 30, "CLOSED", "neutral")}
      {arrow(78, 30, 112, 30, "SYN")}
      {node(140, 30, "SYN_SENT", "active")}
      {arrow(175, 30, 210, 30, "SYN+ACK / ACK")}
      {node(245, 30, "ESTABL.", "active")}
      {arrow(280, 30, 315, 30, "FIN")}
      {node(338, 30, "FIN_W1", "wait")}
      {arrow(338, 42, 245, 72, "ACK")}
      {node(245, 80, "FIN_W2", "wait")}
      {arrow(220, 80, 150, 80, "FIN / ACK")}
      {node(110, 80, "TIME_WAIT", "wait")}
      {arrow(82, 80, 60, 80, "2·MSL")}
      {node(40, 80, "CLOSED", "neutral")}
      {/* Server-rad */}
      <line
        x1={6}
        y1={108}
        x2={W - 6}
        y2={108}
        className="stroke-border"
        strokeWidth={0.5}
        strokeDasharray="2 2"
      />
      <text
        x={6}
        y={124}
        className="fill-emerald-700 dark:fill-emerald-400 text-[9px] font-semibold"
      >
        Server
      </text>
      {node(50, 140, "CLOSED", "neutral")}
      {arrow(78, 140, 100, 140, "listen()")}
      {node(130, 140, "LISTEN", "neutral")}
      {arrow(160, 140, 195, 140, "SYN / SYN+ACK")}
      {node(225, 140, "SYN_RCVD", "active")}
      {arrow(258, 140, 285, 140, "ACK")}
      {node(315, 140, "ESTABL.", "active")}
      {arrow(315, 152, 225, 180, "FIN / ACK")}
      {node(225, 188, "CLOSE_W", "wait")}
      {arrow(195, 188, 140, 188, "close()/FIN")}
      {node(110, 188, "LAST_ACK", "wait")}
      {arrow(82, 188, 60, 188, "ACK")}
      {node(40, 188, "CLOSED", "neutral")}
    </svg>
  );
}

// TCP flagg som en horisontal ikon-rad.
function TcpFlagsRowSvg() {
  const flags: { name: string; rolle: string; tone: string }[] = [
    { name: "SYN", rolle: "sync seq", tone: "fill-sky-500/30 stroke-sky-500" },
    { name: "ACK", rolle: "ack-felt gyldig", tone: "fill-emerald-500/30 stroke-emerald-500" },
    { name: "FIN", rolle: "ferdig sende", tone: "fill-amber-500/30 stroke-amber-500" },
    { name: "RST", rolle: "drep nå", tone: "fill-rose-500/30 stroke-rose-500" },
    { name: "PSH", rolle: "push til app", tone: "fill-violet-500/30 stroke-violet-500" },
    { name: "URG", rolle: "urgent ptr", tone: "fill-muted stroke-border" },
  ];
  const W = 360;
  const H = 64;
  const cellW = 56;
  const gap = 4;
  const totalW = flags.length * cellW + (flags.length - 1) * gap;
  const startX = (W - totalW) / 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {flags.map((f, i) => {
        const x = startX + i * (cellW + gap);
        return (
          <g key={f.name}>
            <rect
              x={x}
              y={8}
              width={cellW}
              height={36}
              rx={5}
              className={f.tone}
              strokeWidth={1.2}
            />
            <text
              x={x + cellW / 2}
              y={24}
              textAnchor="middle"
              className="fill-foreground text-[11px] font-bold"
            >
              {f.name}
            </text>
            <text
              x={x + cellW / 2}
              y={36}
              textAnchor="middle"
              className="fill-muted-foreground text-[7.5px]"
            >
              1 bit
            </text>
            <text
              x={x + cellW / 2}
              y={56}
              textAnchor="middle"
              className="fill-muted-foreground text-[8px] italic"
            >
              {f.rolle}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Mini-AIMD sagtann (kompakt versjon for cheat-blokk).
function AimdMiniSawtoothSvg() {
  const W = 360;
  const H = 90;
  const padX = 22;
  const padY = 10;
  const xMax = W - 6;
  const yMax = H - 18;
  // Sagtann: vokser fra cwnd=10, +1 per RTT i 14 RTT, halver, gjenta tre ganger.
  const pts: { x: number; y: number }[] = [];
  const cwndMax = 30;
  const yOf = (c: number) => yMax - (c / cwndMax) * (yMax - padY);
  let t = 0;
  let c = 10;
  const totalRTTs = 60;
  pts.push({ x: padX + ((xMax - padX) * t) / totalRTTs, y: yOf(c) });
  while (t < totalRTTs) {
    if (c >= 24) {
      // tap: halver
      pts.push({ x: padX + ((xMax - padX) * t) / totalRTTs, y: yOf(c) });
      c = Math.floor(c / 2);
      pts.push({ x: padX + ((xMax - padX) * t) / totalRTTs, y: yOf(c) });
    } else {
      c += 1;
      t += 1;
      pts.push({ x: padX + ((xMax - padX) * t) / totalRTTs, y: yOf(c) });
    }
  }
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <line x1={padX} y1={yMax} x2={xMax} y2={yMax} className="stroke-border" strokeWidth={0.8} />
      <line x1={padX} y1={padY} x2={padX} y2={yMax} className="stroke-border" strokeWidth={0.8} />
      <path d={path} className="fill-none stroke-sky-500" strokeWidth={1.6} />
      {/* marker tap-events */}
      {pts.map((p, i) =>
        i > 0 && pts[i - 1].x === p.x && pts[i - 1].y < p.y ? (
          <g key={`loss-${i}`}>
            <circle cx={p.x} cy={pts[i - 1].y} r={2.2} className="fill-rose-500" />
            <text
              x={p.x + 4}
              y={pts[i - 1].y - 2}
              className="fill-rose-500 text-[7px] font-semibold"
            >
              tap → ÷2
            </text>
          </g>
        ) : null,
      )}
      <text
        x={xMax - 4}
        y={yMax + 12}
        textAnchor="end"
        className="fill-muted-foreground text-[8px]"
      >
        tid (RTT)
      </text>
      <text x={padX + 2} y={padY + 6} className="fill-muted-foreground text-[8px]">
        cwnd
      </text>
      <text x={padX + 60} y={padY + 6} className="fill-sky-600 dark:fill-sky-400 text-[8px]">
        +1 MSS / RTT (AI)
      </text>
    </svg>
  );
}

// Slow-start (eksponentiell) vs congestion avoidance (lineær), to-fase graf.
function SlowStartVsCaSvg() {
  const W = 360;
  const H = 110;
  const padX = 26;
  const padY = 10;
  const xMax = W - 6;
  const yMax = H - 18;
  const cwndMax = 40;
  const yOf = (c: number) => yMax - (c / cwndMax) * (yMax - padY);
  const xOf = (t: number) => padX + ((xMax - padX) * t) / 16;
  // SS: t=0..5, cwnd dobles: 1,2,4,8,16,32 → da hit ssthresh=24, går over til CA
  const ssPts: { x: number; y: number }[] = [];
  let c = 1;
  for (let t = 0; t <= 5; t++) {
    ssPts.push({ x: xOf(t), y: yOf(c) });
    c = Math.min(c * 2, 32);
  }
  // After SS exit at (5, 32), assume timeout-loss → ssthresh=16, cwnd=1, slow start, then CA
  const caPts: { x: number; y: number }[] = [];
  // continue: from t=5..10 SS again to ssthresh=16
  let c2 = 1;
  caPts.push({ x: xOf(5), y: yOf(1) });
  let tt = 5;
  while (c2 < 16) {
    c2 = Math.min(c2 * 2, 16);
    tt += 1;
    caPts.push({ x: xOf(tt), y: yOf(c2) });
  }
  // CA: +1 per RTT
  while (tt < 16) {
    tt += 1;
    c2 = Math.min(c2 + 1, 40);
    caPts.push({ x: xOf(tt), y: yOf(c2) });
  }
  const ssPath = ssPts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
  const caPath = caPts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <line x1={padX} y1={yMax} x2={xMax} y2={yMax} className="stroke-border" strokeWidth={0.8} />
      <line x1={padX} y1={padY} x2={padX} y2={yMax} className="stroke-border" strokeWidth={0.8} />
      {/* ssthresh-linje */}
      <line
        x1={padX}
        y1={yOf(16)}
        x2={xMax}
        y2={yOf(16)}
        className="stroke-amber-500"
        strokeWidth={0.8}
        strokeDasharray="3 2"
      />
      <text
        x={xMax - 4}
        y={yOf(16) - 2}
        textAnchor="end"
        className="fill-amber-600 dark:fill-amber-400 text-[8px]"
      >
        ssthresh
      </text>
      {/* SS (eksponentiell) */}
      <path d={ssPath} className="fill-none stroke-violet-500" strokeWidth={1.6} />
      {/* Etter tap: SS igjen og deretter CA */}
      <path d={caPath} className="fill-none stroke-sky-500" strokeWidth={1.6} />
      {/* tap-merkelapp ved t=5 */}
      <circle cx={xOf(5)} cy={yOf(32)} r={2.5} className="fill-rose-500" />
      <text x={xOf(5) + 4} y={yOf(32) - 4} className="fill-rose-500 text-[8px] font-semibold">
        timeout
      </text>
      <text x={padX + 2} y={padY + 6} className="fill-muted-foreground text-[8px]">
        cwnd
      </text>
      <text
        x={xMax - 4}
        y={yMax + 12}
        textAnchor="end"
        className="fill-muted-foreground text-[8px]"
      >
        tid (RTT)
      </text>
      <g transform={`translate(${padX + 6}, ${yMax + 6})`}>
        <line x1={0} y1={4} x2={12} y2={4} className="stroke-violet-500" strokeWidth={1.6} />
        <text x={16} y={7} className="fill-muted-foreground text-[8px]">
          slow start (×2 / RTT)
        </text>
        <line x1={120} y1={4} x2={132} y2={4} className="stroke-sky-500" strokeWidth={1.6} />
        <text x={136} y={7} className="fill-muted-foreground text-[8px]">
          cong. avoidance (+1 / RTT)
        </text>
      </g>
    </svg>
  );
}

// UDP-header som fire bokser med byte-felter.
function UdpFourBoxesSvg() {
  const W = 360;
  const H = 80;
  const fields = [
    { label: "Source port", size: "16 bit", color: "fill-amber-500/20 stroke-amber-500" },
    { label: "Dest port", size: "16 bit", color: "fill-amber-500/20 stroke-amber-500" },
    { label: "Length", size: "16 bit", color: "fill-sky-500/20 stroke-sky-500" },
    { label: "Checksum", size: "16 bit", color: "fill-emerald-500/20 stroke-emerald-500" },
  ];
  const cellW = 80;
  const gap = 4;
  const totalW = fields.length * cellW + (fields.length - 1) * gap;
  const startX = (W - totalW) / 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <text
        x={W / 2}
        y={12}
        textAnchor="middle"
        className="fill-muted-foreground text-[9px] font-semibold uppercase tracking-wider"
      >
        UDP-header (8 byte)
      </text>
      {fields.map((f, i) => {
        const x = startX + i * (cellW + gap);
        return (
          <g key={f.label}>
            <rect
              x={x}
              y={22}
              width={cellW}
              height={36}
              rx={4}
              className={f.color}
              strokeWidth={1.2}
            />
            <text
              x={x + cellW / 2}
              y={40}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-semibold"
            >
              {f.label}
            </text>
            <text
              x={x + cellW / 2}
              y={52}
              textAnchor="middle"
              className="fill-muted-foreground text-[8px]"
            >
              {f.size}
            </text>
          </g>
        );
      })}
      <text
        x={W / 2}
        y={72}
        textAnchor="middle"
        className="fill-muted-foreground text-[8px] italic"
      >
        Hvert felt = 2 byte. Sum = 8 byte (vs TCP sin 20 minimum).
      </text>
    </svg>
  );
}

// TCP vs UDP pakke-format side-ved-side.
function TcpUdpPackagesSvg() {
  return (
    <svg viewBox="0 0 720 200" className="w-full h-auto">
      <text
        x={180}
        y={16}
        textAnchor="middle"
        className="fill-sky-700 dark:fill-sky-400 text-[11px] font-bold uppercase tracking-wider"
      >
        TCP-pakke (min. 20 byte header)
      </text>
      <text
        x={540}
        y={16}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[11px] font-bold uppercase tracking-wider"
      >
        UDP-pakke (8 byte header)
      </text>

      {/* TCP-blokk */}
      <g transform="translate(20, 28)">
        {/* row 1: source/dest port */}
        <rect
          x={0}
          y={0}
          width={150}
          height={20}
          className="fill-sky-500/20 stroke-sky-500"
          strokeWidth={1}
        />
        <text
          x={75}
          y={14}
          textAnchor="middle"
          className="fill-foreground text-[9px] font-semibold"
        >
          Source port (16)
        </text>
        <rect
          x={150}
          y={0}
          width={170}
          height={20}
          className="fill-sky-500/20 stroke-sky-500"
          strokeWidth={1}
        />
        <text
          x={235}
          y={14}
          textAnchor="middle"
          className="fill-foreground text-[9px] font-semibold"
        >
          Dest port (16)
        </text>
        {/* row 2: seq */}
        <rect
          x={0}
          y={20}
          width={320}
          height={20}
          className="fill-sky-500/30 stroke-sky-500"
          strokeWidth={1}
        />
        <text
          x={160}
          y={34}
          textAnchor="middle"
          className="fill-foreground text-[9px] font-semibold"
        >
          Sekvensnummer (32)
        </text>
        {/* row 3: ack */}
        <rect
          x={0}
          y={40}
          width={320}
          height={20}
          className="fill-sky-500/30 stroke-sky-500"
          strokeWidth={1}
        />
        <text
          x={160}
          y={54}
          textAnchor="middle"
          className="fill-foreground text-[9px] font-semibold"
        >
          Ack-nummer (32)
        </text>
        {/* row 4: HL + flags + window */}
        <rect
          x={0}
          y={60}
          width={50}
          height={20}
          className="fill-sky-500/20 stroke-sky-500"
          strokeWidth={1}
        />
        <text x={25} y={74} textAnchor="middle" className="fill-foreground text-[8px]">
          HL/res
        </text>
        <rect
          x={50}
          y={60}
          width={110}
          height={20}
          className="fill-rose-500/20 stroke-rose-500"
          strokeWidth={1}
        />
        <text
          x={105}
          y={74}
          textAnchor="middle"
          className="fill-foreground text-[8px] font-semibold"
        >
          flags (6 bit)
        </text>
        <rect
          x={160}
          y={60}
          width={160}
          height={20}
          className="fill-emerald-500/20 stroke-emerald-500"
          strokeWidth={1}
        />
        <text
          x={240}
          y={74}
          textAnchor="middle"
          className="fill-foreground text-[9px] font-semibold"
        >
          rwnd (16)
        </text>
        {/* row 5: checksum + urg */}
        <rect
          x={0}
          y={80}
          width={160}
          height={20}
          className="fill-sky-500/20 stroke-sky-500"
          strokeWidth={1}
        />
        <text x={80} y={94} textAnchor="middle" className="fill-foreground text-[9px]">
          Checksum (16)
        </text>
        <rect
          x={160}
          y={80}
          width={160}
          height={20}
          className="fill-sky-500/20 stroke-sky-500"
          strokeWidth={1}
        />
        <text x={240} y={94} textAnchor="middle" className="fill-foreground text-[9px]">
          Urgent ptr (16)
        </text>
        {/* options */}
        <rect
          x={0}
          y={100}
          width={320}
          height={16}
          className="fill-muted stroke-border"
          strokeWidth={1}
          strokeDasharray="3 2"
        />
        <text
          x={160}
          y={111}
          textAnchor="middle"
          className="fill-muted-foreground text-[8px] italic"
        >
          Options (0-40 byte, MSS, SACK, timestamps…)
        </text>
        {/* payload */}
        <rect
          x={0}
          y={116}
          width={320}
          height={40}
          className="fill-card stroke-border"
          strokeWidth={1.2}
        />
        <text
          x={160}
          y={140}
          textAnchor="middle"
          className="fill-foreground text-[10px] font-semibold"
        >
          DATA (bytestrøm)
        </text>
        <text
          x={160}
          y={166}
          textAnchor="middle"
          className="fill-muted-foreground text-[8px] italic"
        >
          headerstørrelse ≥ 20 byte
        </text>
      </g>

      {/* UDP-blokk */}
      <g transform="translate(420, 28)">
        <rect
          x={0}
          y={0}
          width={140}
          height={26}
          className="fill-amber-500/20 stroke-amber-500"
          strokeWidth={1}
        />
        <text
          x={70}
          y={17}
          textAnchor="middle"
          className="fill-foreground text-[9px] font-semibold"
        >
          Source port (16)
        </text>
        <rect
          x={140}
          y={0}
          width={140}
          height={26}
          className="fill-amber-500/20 stroke-amber-500"
          strokeWidth={1}
        />
        <text
          x={210}
          y={17}
          textAnchor="middle"
          className="fill-foreground text-[9px] font-semibold"
        >
          Dest port (16)
        </text>
        <rect
          x={0}
          y={26}
          width={140}
          height={26}
          className="fill-amber-500/30 stroke-amber-500"
          strokeWidth={1}
        />
        <text
          x={70}
          y={43}
          textAnchor="middle"
          className="fill-foreground text-[9px] font-semibold"
        >
          Length (16)
        </text>
        <rect
          x={140}
          y={26}
          width={140}
          height={26}
          className="fill-amber-500/30 stroke-amber-500"
          strokeWidth={1}
        />
        <text
          x={210}
          y={43}
          textAnchor="middle"
          className="fill-foreground text-[9px] font-semibold"
        >
          Checksum (16)
        </text>
        {/* payload */}
        <rect
          x={0}
          y={52}
          width={280}
          height={104}
          className="fill-card stroke-border"
          strokeWidth={1.2}
        />
        <text
          x={140}
          y={86}
          textAnchor="middle"
          className="fill-foreground text-[10px] font-semibold"
        >
          DATA (datagram, opp til 65507 byte)
        </text>
        <text
          x={140}
          y={106}
          textAnchor="middle"
          className="fill-muted-foreground text-[8px] italic"
        >
          melding-grenser bevares
        </text>
        <text
          x={140}
          y={146}
          textAnchor="middle"
          className="fill-muted-foreground text-[8px] italic"
        >
          headerstørrelse = 8 byte (fast)
        </text>
      </g>

      {/* footer-sammenligning */}
      <text x={180} y={188} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        seq/ack/flags/window + options → pålitelighet + ratejustering
      </text>
      <text x={540} y={188} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        kun port/length/checksum → minimalt overhead
      </text>
    </svg>
  );
}

// Mini-timeline som viser dup-ACK vs timeout-respons side-ved-side.
function DupAckVsTimeoutSvg() {
  return (
    <svg viewBox="0 0 520 170" className="w-full h-auto">
      {/* venstre: 3 dup-ACK */}
      <g transform="translate(10, 0)">
        <text
          x={120}
          y={14}
          textAnchor="middle"
          className="fill-emerald-700 dark:fill-emerald-400 text-[10px] font-bold uppercase tracking-wider"
        >
          3 dup-ACK → fast recovery
        </text>
        {/* sender/mottaker linjer */}
        <text x={4} y={36} className="fill-muted-foreground text-[8px]">
          Sender
        </text>
        <text x={196} y={36} textAnchor="end" className="fill-muted-foreground text-[8px]">
          Mottaker
        </text>
        <line x1={28} y1={42} x2={28} y2={150} className="stroke-border" strokeWidth={0.8} />
        <line x1={200} y1={42} x2={200} y2={150} className="stroke-border" strokeWidth={0.8} />
        {/* segm 1 → ACK 2 */}
        <line
          x1={28}
          y1={50}
          x2={200}
          y2={56}
          className="stroke-sky-500"
          strokeWidth={1}
          markerEnd="url(#aarr)"
        />
        <text x={114} y={48} textAnchor="middle" className="fill-sky-600 text-[7.5px]">
          seg #1 OK
        </text>
        <line
          x1={200}
          y1={60}
          x2={28}
          y2={66}
          className="stroke-emerald-500"
          strokeWidth={1}
          markerEnd="url(#aarr)"
        />
        <text x={114} y={64} textAnchor="middle" className="fill-emerald-600 text-[7.5px]">
          ACK 2
        </text>
        {/* segm 2 tapt */}
        <line
          x1={28}
          y1={72}
          x2={130}
          y2={80}
          className="stroke-rose-500"
          strokeWidth={1}
          strokeDasharray="2 2"
        />
        <text x={130} y={86} className="fill-rose-500 text-[8px] font-bold">
          ✕ tapt
        </text>
        {/* segm 3,4,5 → 3 dup-ACK */}
        <line
          x1={28}
          y1={92}
          x2={200}
          y2={96}
          className="stroke-sky-500"
          strokeWidth={1}
          markerEnd="url(#aarr)"
        />
        <line
          x1={200}
          y1={100}
          x2={28}
          y2={104}
          className="stroke-amber-500"
          strokeWidth={1}
          markerEnd="url(#aarr)"
        />
        <text x={114} y={104} textAnchor="middle" className="fill-amber-600 text-[7.5px]">
          dup-ACK 2 (×1)
        </text>
        <line
          x1={28}
          y1={110}
          x2={200}
          y2={114}
          className="stroke-sky-500"
          strokeWidth={1}
          markerEnd="url(#aarr)"
        />
        <line
          x1={200}
          y1={118}
          x2={28}
          y2={122}
          className="stroke-amber-500"
          strokeWidth={1}
          markerEnd="url(#aarr)"
        />
        <text x={114} y={122} textAnchor="middle" className="fill-amber-600 text-[7.5px]">
          dup-ACK 2 (×2,×3)
        </text>
        {/* respons */}
        <rect
          x={4}
          y={130}
          width={216}
          height={22}
          className="fill-emerald-500/10 stroke-emerald-500"
          strokeWidth={0.8}
          rx={3}
        />
        <text
          x={112}
          y={144}
          textAnchor="middle"
          className="fill-emerald-700 dark:fill-emerald-400 text-[8.5px] font-semibold"
        >
          ssthresh = cwnd/2, cwnd = ssthresh
        </text>
      </g>

      {/* høyre: timeout */}
      <g transform="translate(290, 0)">
        <text
          x={120}
          y={14}
          textAnchor="middle"
          className="fill-rose-700 dark:fill-rose-400 text-[10px] font-bold uppercase tracking-wider"
        >
          Timeout → slow start
        </text>
        <text x={4} y={36} className="fill-muted-foreground text-[8px]">
          Sender
        </text>
        <text x={196} y={36} textAnchor="end" className="fill-muted-foreground text-[8px]">
          Mottaker
        </text>
        <line x1={28} y1={42} x2={28} y2={150} className="stroke-border" strokeWidth={0.8} />
        <line x1={200} y1={42} x2={200} y2={150} className="stroke-border" strokeWidth={0.8} />
        {/* segm 1 tapt */}
        <line
          x1={28}
          y1={50}
          x2={130}
          y2={56}
          className="stroke-rose-500"
          strokeWidth={1}
          strokeDasharray="2 2"
        />
        <text x={130} y={62} className="fill-rose-500 text-[8px] font-bold">
          ✕ tapt
        </text>
        {/* segm 2 tapt */}
        <line
          x1={28}
          y1={70}
          x2={130}
          y2={76}
          className="stroke-rose-500"
          strokeWidth={1}
          strokeDasharray="2 2"
        />
        <text x={130} y={82} className="fill-rose-500 text-[8px] font-bold">
          ✕ tapt
        </text>
        {/* ingen ACK */}
        <text
          x={114}
          y={104}
          textAnchor="middle"
          className="fill-muted-foreground text-[8px] italic"
        >
          ...stillhet i RTO ms...
        </text>
        {/* timer expires */}
        <rect
          x={4}
          y={114}
          width={216}
          height={14}
          className="fill-rose-500/15 stroke-rose-500"
          strokeWidth={0.8}
          rx={3}
        />
        <text
          x={112}
          y={124}
          textAnchor="middle"
          className="fill-rose-700 dark:fill-rose-400 text-[8.5px] font-semibold"
        >
          ⏱ TIMER LØPER UT
        </text>
        {/* respons */}
        <rect
          x={4}
          y={130}
          width={216}
          height={22}
          className="fill-rose-500/10 stroke-rose-500"
          strokeWidth={0.8}
          rx={3}
        />
        <text
          x={112}
          y={144}
          textAnchor="middle"
          className="fill-rose-700 dark:fill-rose-400 text-[8.5px] font-semibold"
        >
          ssthresh = cwnd/2, cwnd = 1 MSS
        </text>
      </g>

      <defs>
        <marker
          id="aarr"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto"
        >
          <path d="M0,0 L10,5 L0,10 z" className="fill-current" />
        </marker>
      </defs>
    </svg>
  );
}

// Mini-handshake-pile (3-veis + 4-veis tear-down).
function HandshakeMiniSvg() {
  return (
    <svg viewBox="0 0 520 170" className="w-full h-auto">
      {/* venstre: 3-veis setup */}
      <g transform="translate(10, 0)">
        <text
          x={120}
          y={14}
          textAnchor="middle"
          className="fill-sky-700 dark:fill-sky-400 text-[10px] font-bold uppercase tracking-wider"
        >
          3-veis handshake (setup)
        </text>
        <text x={20} y={36} className="fill-muted-foreground text-[8.5px] font-semibold">
          Klient
        </text>
        <text
          x={220}
          y={36}
          textAnchor="end"
          className="fill-muted-foreground text-[8.5px] font-semibold"
        >
          Server
        </text>
        <line x1={36} y1={42} x2={36} y2={158} className="stroke-border" strokeWidth={0.8} />
        <line x1={200} y1={42} x2={200} y2={158} className="stroke-border" strokeWidth={0.8} />
        {/* SYN */}
        <line
          x1={36}
          y1={56}
          x2={200}
          y2={66}
          className="stroke-sky-500"
          strokeWidth={1.4}
          markerEnd="url(#harr)"
        />
        <text
          x={118}
          y={60}
          textAnchor="middle"
          className="fill-sky-700 dark:fill-sky-400 text-[8.5px] font-semibold"
        >
          SYN seq=x
        </text>
        {/* SYN+ACK */}
        <line
          x1={200}
          y1={86}
          x2={36}
          y2={96}
          className="stroke-emerald-500"
          strokeWidth={1.4}
          markerEnd="url(#harr)"
        />
        <text
          x={118}
          y={90}
          textAnchor="middle"
          className="fill-emerald-700 dark:fill-emerald-400 text-[8.5px] font-semibold"
        >
          SYN+ACK seq=y, ack=x+1
        </text>
        {/* ACK */}
        <line
          x1={36}
          y1={116}
          x2={200}
          y2={126}
          className="stroke-sky-500"
          strokeWidth={1.4}
          markerEnd="url(#harr)"
        />
        <text
          x={118}
          y={120}
          textAnchor="middle"
          className="fill-sky-700 dark:fill-sky-400 text-[8.5px] font-semibold"
        >
          ACK ack=y+1
        </text>
        <text
          x={118}
          y={150}
          textAnchor="middle"
          className="fill-muted-foreground text-[8px] italic"
        >
          → ESTABLISHED i begge ender
        </text>
      </g>

      {/* høyre: 4-veis tear-down */}
      <g transform="translate(290, 0)">
        <text
          x={120}
          y={14}
          textAnchor="middle"
          className="fill-rose-700 dark:fill-rose-400 text-[10px] font-bold uppercase tracking-wider"
        >
          4-veis tear-down
        </text>
        <text x={20} y={36} className="fill-muted-foreground text-[8.5px] font-semibold">
          Klient
        </text>
        <text
          x={220}
          y={36}
          textAnchor="end"
          className="fill-muted-foreground text-[8.5px] font-semibold"
        >
          Server
        </text>
        <line x1={36} y1={42} x2={36} y2={158} className="stroke-border" strokeWidth={0.8} />
        <line x1={200} y1={42} x2={200} y2={158} className="stroke-border" strokeWidth={0.8} />
        <line
          x1={36}
          y1={52}
          x2={200}
          y2={62}
          className="stroke-rose-500"
          strokeWidth={1.4}
          markerEnd="url(#harr)"
        />
        <text
          x={118}
          y={56}
          textAnchor="middle"
          className="fill-rose-600 text-[8.5px] font-semibold"
        >
          FIN
        </text>
        <line
          x1={200}
          y1={76}
          x2={36}
          y2={86}
          className="stroke-emerald-500"
          strokeWidth={1.4}
          markerEnd="url(#harr)"
        />
        <text
          x={118}
          y={80}
          textAnchor="middle"
          className="fill-emerald-600 text-[8.5px] font-semibold"
        >
          ACK
        </text>
        <line
          x1={200}
          y1={100}
          x2={36}
          y2={110}
          className="stroke-rose-500"
          strokeWidth={1.4}
          markerEnd="url(#harr)"
        />
        <text
          x={118}
          y={104}
          textAnchor="middle"
          className="fill-rose-600 text-[8.5px] font-semibold"
        >
          FIN
        </text>
        <line
          x1={36}
          y1={124}
          x2={200}
          y2={134}
          className="stroke-emerald-500"
          strokeWidth={1.4}
          markerEnd="url(#harr)"
        />
        <text
          x={118}
          y={128}
          textAnchor="middle"
          className="fill-emerald-600 text-[8.5px] font-semibold"
        >
          ACK
        </text>
        <text
          x={118}
          y={152}
          textAnchor="middle"
          className="fill-muted-foreground text-[8px] italic"
        >
          → hver retning lukkes uavhengig
        </text>
      </g>

      <defs>
        <marker
          id="harr"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,0 L10,5 L0,10 z" className="fill-current" />
        </marker>
      </defs>
    </svg>
  );
}

// 5-minutter-anker som visuell grid med ikon-kort.
function AnkerGrid() {
  const items: {
    n: number;
    label: string;
    sub: string;
    ikon:
      | "transport"
      | "mux"
      | "udp"
      | "tcp"
      | "rdt"
      | "rtt"
      | "fast"
      | "flow"
      | "aimd"
      | "ss"
      | "to"
      | "udpPick"
      | "tcpPick";
  }[] = [
    { n: 1, label: "Transportlaget", sub: "prosess-til-prosess", ikon: "transport" },
    { n: 2, label: "Mux/demux", sub: "2-tup. UDP, 4-tup. TCP", ikon: "mux" },
    { n: 3, label: "UDP-header", sub: "8 byte fast", ikon: "udp" },
    { n: 4, label: "TCP", sub: "bytestrøm, full-duplex", ikon: "tcp" },
    { n: 5, label: "RDT-byggesteiner", sub: "ACK + seq + timer", ikon: "rdt" },
    { n: 6, label: "RTT-timer", sub: "EWMA + 4·DevRTT", ikon: "rtt" },
    { n: 7, label: "Fast retransmit", sub: "3 dup-ACK", ikon: "fast" },
    { n: 8, label: "rwnd vs cwnd", sub: "send = min(...)", ikon: "flow" },
    { n: 9, label: "AIMD", sub: "+1 / ÷2 sagtann", ikon: "aimd" },
    { n: 10, label: "Slow start", sub: "×2 til ssthresh", ikon: "ss" },
    { n: 11, label: "Timeout vs dup-ACK", sub: "harde vs milde tap", ikon: "to" },
    { n: 12, label: "Velg UDP", sub: "DNS, video, multicast", ikon: "udpPick" },
    { n: 13, label: "Velg TCP", sub: "HTTP, SSH, fil-overf.", ikon: "tcpPick" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {items.map((it) => (
        <div
          key={it.n}
          className="rounded-lg border border-brand/30 bg-brand/5 p-2 flex items-center gap-2"
        >
          <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0">
            <AnkerIkon ikon={it.ikon} />
          </svg>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold text-brand">#{it.n}</div>
            <div className="text-[11px] font-semibold text-foreground truncate">{it.label}</div>
            <div className="text-[10px] text-muted-foreground truncate">{it.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnkerIkon({ ikon }: { ikon: string }) {
  switch (ikon) {
    case "transport":
      // tre lag stablet, med pil opp og ned
      return (
        <g>
          <rect
            x={6}
            y={6}
            width={28}
            height={7}
            rx={2}
            className="fill-sky-500/30 stroke-sky-500"
            strokeWidth={0.8}
          />
          <rect
            x={6}
            y={16}
            width={28}
            height={7}
            rx={2}
            className="fill-emerald-500/30 stroke-emerald-500"
            strokeWidth={0.8}
          />
          <rect
            x={6}
            y={26}
            width={28}
            height={7}
            rx={2}
            className="fill-amber-500/30 stroke-amber-500"
            strokeWidth={0.8}
          />
          <text x={20} y={11} textAnchor="middle" className="fill-foreground text-[5px] font-bold">
            APP
          </text>
          <text x={20} y={21} textAnchor="middle" className="fill-foreground text-[5px] font-bold">
            TRP
          </text>
          <text x={20} y={31} textAnchor="middle" className="fill-foreground text-[5px] font-bold">
            IP
          </text>
        </g>
      );
    case "mux":
      // tre piler inn til en boks, en pil ut
      return (
        <g>
          <line x1={4} y1={8} x2={18} y2={20} className="stroke-sky-500" strokeWidth={1} />
          <line x1={4} y1={20} x2={18} y2={20} className="stroke-sky-500" strokeWidth={1} />
          <line x1={4} y1={32} x2={18} y2={20} className="stroke-sky-500" strokeWidth={1} />
          <rect
            x={18}
            y={15}
            width={10}
            height={10}
            rx={2}
            className="fill-brand/40 stroke-brand"
            strokeWidth={0.8}
          />
          <line x1={28} y1={20} x2={36} y2={20} className="stroke-amber-500" strokeWidth={1.2} />
          <polygon points="36,17 36,23 39,20" className="fill-amber-500" />
        </g>
      );
    case "udp":
      return (
        <g>
          <rect
            x={4}
            y={12}
            width={8}
            height={16}
            className="fill-amber-500/30 stroke-amber-500"
            strokeWidth={0.8}
          />
          <rect
            x={13}
            y={12}
            width={8}
            height={16}
            className="fill-amber-500/30 stroke-amber-500"
            strokeWidth={0.8}
          />
          <rect
            x={22}
            y={12}
            width={6}
            height={16}
            className="fill-amber-500/30 stroke-amber-500"
            strokeWidth={0.8}
          />
          <rect
            x={29}
            y={12}
            width={6}
            height={16}
            className="fill-amber-500/30 stroke-amber-500"
            strokeWidth={0.8}
          />
          <text
            x={20}
            y={9}
            textAnchor="middle"
            className="fill-amber-700 dark:fill-amber-400 text-[6px] font-bold"
          >
            UDP 8B
          </text>
        </g>
      );
    case "tcp":
      return (
        <g>
          <path
            d="M5 28 L15 18 L25 24 L35 12"
            className="fill-none stroke-sky-500"
            strokeWidth={1.4}
          />
          <circle cx={5} cy={28} r={1.6} className="fill-sky-500" />
          <circle cx={15} cy={18} r={1.6} className="fill-sky-500" />
          <circle cx={25} cy={24} r={1.6} className="fill-sky-500" />
          <circle cx={35} cy={12} r={1.6} className="fill-sky-500" />
          <text
            x={20}
            y={36}
            textAnchor="middle"
            className="fill-sky-700 dark:fill-sky-400 text-[6px] font-bold"
          >
            stream
          </text>
        </g>
      );
    case "rdt":
      return (
        <g>
          <circle cx={10} cy={20} r={5} className="fill-card stroke-border" strokeWidth={0.8} />
          <text x={10} y={22} textAnchor="middle" className="fill-foreground text-[6px] font-bold">
            S
          </text>
          <circle cx={30} cy={20} r={5} className="fill-card stroke-border" strokeWidth={0.8} />
          <text x={30} y={22} textAnchor="middle" className="fill-foreground text-[6px] font-bold">
            R
          </text>
          <line x1={15} y1={17} x2={25} y2={17} className="stroke-sky-500" strokeWidth={0.8} />
          <polygon points="25,15 25,19 27,17" className="fill-sky-500" />
          <line x1={25} y1={23} x2={15} y2={23} className="stroke-emerald-500" strokeWidth={0.8} />
          <polygon points="15,21 15,25 13,23" className="fill-emerald-500" />
        </g>
      );
    case "rtt":
      return (
        <g>
          <circle cx={20} cy={20} r={12} className="fill-none stroke-border" strokeWidth={1} />
          <line x1={20} y1={20} x2={20} y2={10} className="stroke-sky-500" strokeWidth={1.4} />
          <line x1={20} y1={20} x2={28} y2={24} className="stroke-rose-500" strokeWidth={1.4} />
          <circle cx={20} cy={20} r={1.4} className="fill-foreground" />
        </g>
      );
    case "fast":
      return (
        <g>
          <text x={6} y={18} className="fill-amber-600 text-[7px] font-bold">
            ACK
          </text>
          <text x={6} y={26} className="fill-amber-600 text-[7px] font-bold">
            ACK
          </text>
          <text x={6} y={34} className="fill-amber-600 text-[7px] font-bold">
            ACK
          </text>
          <path
            d="M26 12 L34 24 L29 24 L33 32"
            className="fill-none stroke-rose-500"
            strokeWidth={1.4}
          />
          <polygon points="32,28 36,32 30,34" className="fill-rose-500" />
        </g>
      );
    case "flow":
      return (
        <g>
          <rect
            x={4}
            y={10}
            width={14}
            height={20}
            className="fill-sky-500/30 stroke-sky-500"
            strokeWidth={0.8}
          />
          <text x={11} y={22} textAnchor="middle" className="fill-foreground text-[6px] font-bold">
            cwnd
          </text>
          <text x={20} y={22} textAnchor="middle" className="fill-foreground text-[8px] font-bold">
            ∩
          </text>
          <rect
            x={22}
            y={10}
            width={14}
            height={20}
            className="fill-emerald-500/30 stroke-emerald-500"
            strokeWidth={0.8}
          />
          <text x={29} y={22} textAnchor="middle" className="fill-foreground text-[6px] font-bold">
            rwnd
          </text>
        </g>
      );
    case "aimd":
      return (
        <g>
          <path
            d="M4 30 L10 22 L16 14 L18 28 L24 20 L28 12 L30 26 L36 18"
            className="fill-none stroke-sky-500"
            strokeWidth={1.4}
          />
          <line x1={4} y1={32} x2={36} y2={32} className="stroke-border" strokeWidth={0.6} />
          <line x1={4} y1={32} x2={4} y2={8} className="stroke-border" strokeWidth={0.6} />
        </g>
      );
    case "ss":
      return (
        <g>
          <path
            d="M4 32 L8 30 L12 26 L16 20 L20 12 L24 8"
            className="fill-none stroke-violet-500"
            strokeWidth={1.4}
          />
          <line x1={4} y1={34} x2={36} y2={34} className="stroke-border" strokeWidth={0.6} />
          <line x1={4} y1={34} x2={4} y2={6} className="stroke-border" strokeWidth={0.6} />
          <text x={28} y={20} className="fill-violet-600 text-[6px] font-bold">
            ×2
          </text>
        </g>
      );
    case "to":
      return (
        <g>
          <circle cx={12} cy={20} r={8} className="fill-none stroke-rose-500" strokeWidth={1.2} />
          <line x1={12} y1={14} x2={12} y2={20} className="stroke-rose-500" strokeWidth={1.2} />
          <line x1={12} y1={20} x2={16} y2={22} className="stroke-rose-500" strokeWidth={1.2} />
          <text x={28} y={16} className="fill-rose-600 text-[6px] font-bold">
            RTO
          </text>
          <text x={28} y={24} className="fill-emerald-600 text-[6px] font-bold">
            3dup
          </text>
        </g>
      );
    case "udpPick":
      return (
        <g>
          <rect
            x={4}
            y={8}
            width={32}
            height={24}
            rx={3}
            className="fill-amber-500/20 stroke-amber-500"
            strokeWidth={1}
          />
          <text
            x={20}
            y={18}
            textAnchor="middle"
            className="fill-amber-700 dark:fill-amber-400 text-[7px] font-bold"
          >
            UDP
          </text>
          <text x={20} y={28} textAnchor="middle" className="fill-muted-foreground text-[5.5px]">
            DNS · VoIP
          </text>
        </g>
      );
    case "tcpPick":
      return (
        <g>
          <rect
            x={4}
            y={8}
            width={32}
            height={24}
            rx={3}
            className="fill-sky-500/20 stroke-sky-500"
            strokeWidth={1}
          />
          <text
            x={20}
            y={18}
            textAnchor="middle"
            className="fill-sky-700 dark:fill-sky-400 text-[7px] font-bold"
          >
            TCP
          </text>
          <text x={20} y={28} textAnchor="middle" className="fill-muted-foreground text-[5.5px]">
            HTTP · SSH
          </text>
        </g>
      );
    default:
      return null;
  }
}
