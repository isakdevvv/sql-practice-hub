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
import { M1Sinus } from "./kap7/M1Sinus";
import { SpektrumViz } from "./kap7/SpektrumViz";
import { CellulaViz } from "./kap7/CellulaViz";
import { MobilitetsTracer } from "./kap7/MobilitetsTracer";
import { HandoverTidslinje } from "./kap7/HandoverTidslinje";
import { TCPRadioLab } from "./kap7/TCPRadioLab";
import { VisualDefs } from "./VisualDefs";
import { Forberedelse } from "./Forberedelse";
import { FORBEREDELSE_7 } from "./forberedelseData";
import {
  // 7.1
  PathLossIcon,
  MultipathIcon,
  SnrIcon,
  InterferenceIcon,
  HiddenTerminalIcon,
  ExposedTerminalIcon,
  HalfDuplexIcon,
  ShadowFadingIcon,
  CoChannelIcon,
  AdjacentChannelIcon,
  FsplIcon,
  ModulationIcon,
  AntennaGainIcon,
  // 7.2
  CsmaCaIcon,
  DifsIcon,
  SifsIcon,
  BackoffIcon,
  RtsCtsIcon,
  BeaconIcon,
  AssociationIcon,
  AuthIcon,
  NavTimerIcon,
  SlotTimeIcon,
  Wifi80211Icon,
  ExpBackoffIcon,
  MuMimoIcon,
  // 7.3
  CelleIcon,
  BaseStationIcon,
  CoreNetIcon,
  Gsm2GIcon,
  Lte4GIcon,
  FiveGIcon,
  FreqReuseIcon,
  NodeBIcon,
  HssIcon,
  MmeIcon,
  GatewayIcon,
  OfdmaIcon,
  SimCardIcon,
  // 7.4
  HomeNetIcon,
  HomeAgentIcon,
  ForeignAgentIcon,
  CoaIcon,
  TunnelingIcon,
  TriangleRoutingIcon,
  GtpTunnelIcon,
  CorrespondentIcon,
  RegistrationIcon,
  ColocatedCoaIcon,
  ReverseTunnelIcon,
  SoftStateIcon,
  EncapOverheadIcon,
  // 7.5
  HardHandoverIcon,
  SoftHandoverIcon,
  MeasureReportIcon,
  FreqSwitchIcon,
  WifiRoamingIcon,
  ContextTransferIcon,
  RsrpIcon,
  TttIcon,
  ControlMobileNetIcon,
  X2InterfaceIcon,
  ChoIcon,
  PingPongIcon,
  FastRoamIcon,
  // 7.6
  BitErrorIcon,
  LinkArqIcon,
  SpuriousTimeoutIcon,
  PepIcon,
  CubicBbrIcon,
  JitterMobIcon,
  BufferbloatIcon,
  SnoopIcon,
  SplitTcpIcon,
  ElnIcon,
  SackIcon,
  SlowStartIcon,
} from "./visualDefIcons.kap7";

type Tab = "intro" | "7.1" | "7.2" | "7.3" | "7.4" | "7.5" | "7.6" | "7.7" | "7.8";

const SECTIONS_7: SectionNavItem[] = [
  { id: "intro", label: "Start her" },
  { id: "7.1", label: "7.1 Radio-karakteristikker" },
  { id: "7.2", label: "7.2 WiFi 802.11" },
  { id: "7.3", label: "7.3 Cellular" },
  { id: "7.4", label: "7.4 Mobilitet" },
  { id: "7.5", label: "7.5 Håndover" },
  { id: "7.6", label: "7.6 TCP & wireless" },
  { id: "7.7", label: "7.7 Oppgaver" },
  { id: "7.8", label: "7.8 Eksamen-fokus" },
];
const NEXT_CHAPTER_7 = { slug: "kurose-kap-8", title: "Sikkerhet i nettverk" };

export function KuroseKap7Page() {
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
              Kap. 7 — Trådløst og mobilt
            </h1>
          </div>
          <nav className="ml-auto flex flex-wrap gap-0.5">
            <TabBtn active={tab === "intro"} onClick={() => setTab("intro")}>
              Start
            </TabBtn>
            <TabBtn
              active={tab === "7.1"}
              onClick={() => setTab("7.1")}
              title="Radio-karakteristikker"
            >
              7.1
            </TabBtn>
            <TabBtn active={tab === "7.2"} onClick={() => setTab("7.2")} title="WiFi 802.11">
              7.2
            </TabBtn>
            <TabBtn active={tab === "7.3"} onClick={() => setTab("7.3")} title="Cellular">
              7.3
            </TabBtn>
            <TabBtn active={tab === "7.4"} onClick={() => setTab("7.4")} title="Mobilitet">
              7.4
            </TabBtn>
            <TabBtn active={tab === "7.5"} onClick={() => setTab("7.5")} title="Håndover">
              7.5
            </TabBtn>
            <TabBtn active={tab === "7.6"} onClick={() => setTab("7.6")} title="TCP & wireless">
              7.6
            </TabBtn>
            <TabBtn active={tab === "7.7"} onClick={() => setTab("7.7")} title="Oppgaver">
              Oppg.
            </TabBtn>
            <TabBtn active={tab === "7.8"} onClick={() => setTab("7.8")} title="Eksamen-fokus">
              Eksamen
            </TabBtn>
          </nav>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "7.1" && <Section71 />}
        {tab === "7.2" && <Section72 />}
        {tab === "7.3" && <Section73 />}
        {tab === "7.4" && <Section74 />}
        {tab === "7.5" && <Section75 />}
        {tab === "7.6" && <Section76 />}
        {tab === "7.7" && <Section77 />}
        {tab === "7.8" && <SectionEksamen />}

        <SectionPager
          tabs={SECTIONS_7}
          current={tab}
          onPick={(id) => setTab(id as Tab)}
          nextChapter={NEXT_CHAPTER_7}
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
            Forklare hvorfor en radio-lenke oppfører seg fundamentalt annerledes enn en kobber-lenke
            — svekning over avstand, multipath-fading, ekstern interferens, og hidden terminal.
          </li>
          <li>
            Beskrive hvordan 802.11 (WiFi) bruker CSMA/CA med backoff, DIFS/SIFS-tider, og valgfri
            RTS/CTS for å unngå kollisjoner som ingen kan høre.
          </li>
          <li>
            Forstå celle-arkitekturen i mobilnett og hvordan generasjonene fra GSM via LTE til 5G
            har skiftet fra krets-svitsjet stemme til all-IP pakke-svitsjet kjerne.
          </li>
          <li>
            Forklare problemet med å adressere en bevegelig host og hvordan home agent + foreign
            agent (Mobile IP) eller tunneling i mobilkjernen løser det.
          </li>
          <li>
            Skille hard fra soft håndover, og vite hva som må synkroniseres for at en aktiv
            TCP-strøm skal overleve en AP-bytte i WiFi eller en celle-bytte i 5G.
          </li>
          <li>
            Diagnostisere hvorfor TCP straffer trådløse strekninger urettferdig: pakketap fra
            radio-feil tolkes som congestion og utløser unødvendig rate-halvering.
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Kapittelets struktur</h2>
        <ol className="list-decimal pl-5 text-muted-foreground space-y-1">
          <li>Hva som gjør radio vanskelig — fysikk og hidden terminal</li>
          <li>WiFi 802.11 — frame-strukturen og CSMA/CA-dansen</li>
          <li>Cellular — celler, basestasjoner, og generasjons-historien</li>
          <li>Mobilitet — hvordan adressere en host som flytter seg</li>
          <li>Håndover — hard vs soft, og hva som må overføres</li>
          <li>TCP i en støyete verden — hvorfor wireless gjør vondt</li>
          <li>Oppgaver — sjekk forståelsen din</li>
        </ol>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => onPick("7.1")}>
            Start på 7.1 →
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 7.1 — Trådløse karakteristikker
// ============================================================
function Section71() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="7.1" title="Trådløse karakteristikker" />

      <p className="text-muted-foreground">
        Radio er ikke bare «kabel uten kobber». Signalet blir svakere med avstand, det reflekteres
        av vegger og kommer fram til mottakeren i flere kopier som forstyrrer hverandre, og en nabos
        mikrobølgeovn kan utslette dataframen din. Verst av alt: to sendere som ikke kan høre
        hverandre kan likevel kollidere hos en mottaker mellom dem. Alle protokoll-valgene i WiFi og
        mobilnett er svar på en eller flere av disse problemene.
      </p>

      <M1Sinus />

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            { term: "Path loss", icon: <PathLossIcon />, body: "Signal faller med avstanden² — dobbel avstand = −6 dB." },
            {
              term: "Multipath-fading",
              icon: <MultipathIcon />,
              body: "Flere refleksjons-veier kanselleres i destruktiv addering.",
            },
            {
              term: "SNR (signal-to-noise ratio)",
              icon: <SnrIcon />,
              body: "Signal vs støy i dB — styrer valgt modulasjon.",
            },
            {
              term: "Ekstern interferens",
              icon: <InterferenceIcon />,
              body: "Bluetooth, mikrobølgeovn, babymonitor — utenfor CSMA.",
            },
            {
              term: "Hidden terminal",
              icon: <HiddenTerminalIcon />,
              body: "To sendere hører ikke hverandre, kolliderer hos mottaker.",
            },
            {
              term: "Exposed terminal",
              icon: <ExposedTerminalIcon />,
              body: "Speilbildet — konservativ CSMA gir tapt kapasitet.",
            },
            {
              term: "Half-duplex radio",
              icon: <HalfDuplexIcon />,
              body: "Kan ikke lytte mens den sender — egen utgang drukner.",
            },
            { term: "Shadow fading", icon: <ShadowFadingIcon />, body: "Treg svekning fra mur, kropp eller lastebil." },
            {
              term: "Co-channel-interferens",
              icon: <CoChannelIcon />,
              body: "Naboer på samme kanal hører hverandre som støy.",
            },
            {
              term: "Adjacent-channel",
              icon: <AdjacentChannelIcon />,
              body: "Spillover til kanal X±1 — derav 1/6/11-regelen i 2.4 GHz.",
            },
            {
              term: "Free-space path loss",
              icon: <FsplIcon />,
              body: "FSPL = 20·log d + 20·log f + 32.45 (fritt rom).",
            },
            {
              term: "Modulasjon",
              icon: <ModulationIcon />,
              body: "Bits per radio-symbol: BPSK=1, QPSK=2, 16-QAM=4, 256-QAM=8.",
            },
            {
              term: "Antenne-gain",
              icon: <AntennaGainIcon />,
              body: "Fokus-grad i dBi — laptop ~2 dBi, mast-antenne ~15 dBi.",
            },
          ]}
        />
        <div className="space-y-3">
          <Illustration caption="Hidden terminal: A og C hører begge AP, men ikke hverandre. AP får krasjete signaler.">
            <HiddenTerminalSvg />
          </Illustration>
          <Illustration caption="Signal-amplitude faller med avstanden, med multipath-hull oppå — det er fading.">
            <DefSignalFadingSvg />
          </Illustration>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="Path loss — som å rope over en fotballbane">
          <p>
            Stå på midtbanen og rop. En kompis 5 m unna hører tydelig. En 50 m unna hører knapt
            navnet sitt. En 100 m unna hører bare en svak mumlebar lyd. Lufta «spiser» lyden jo
            lenger den må reise. Akkurat slik blir radiosignalet stadig svakere — dobler du
            avstanden, mister du minst 6 dB. Det er derfor en WiFi-ruter midt i kontoret må gå ned
            på modulasjonsrate (færre bits per radio-symbol) for å nå klienter ved langveggen.
          </p>
        </Metafor>
        <Metafor tittel="Multipath — som ekko i en gymsal">
          <p>
            Rop «HEI» i en stor gymsal. Du hører ditt eget «hei» direkte, og deretter ekkoer fra
            kortveggene som kommer 50–100 ms senere. Ekkoene gjør stemmen din uleselig. På radio er
            det det samme: direkte bølge + refleksjoner fra vegg/tak ankommer mottakeren med ulik
            forsinkelse. Hvis to kopier er i motfase — toppene møter dalene — kansellerer de
            hverandre, og signalet kollapser. Flytt laptopen 10 cm, og ekkoenes innbyrdes faser
            endres helt. Plutselig 5 streker.
          </p>
        </Metafor>
      </div>

      <Metafor tittel="Hidden terminal — T-kryss med blindsoner">
        <p>
          Du står i ett av to T-kryss på en bygate. Kompisen din står i det andre — begge skjult bak
          murhjørner som ikke ser hverandre. Begge ser at hovedveien er klar, og begge tråkker ut
          samtidig. KRASJ. Det er hidden terminal i et nøtteskall: to WiFi-stationer som ikke kan
          høre hverandre velger samtidig å sende fordi de hver for seg «sjekket lufta». Begge
          framene smelter sammen til støy hos AP-en. RTS/CTS er som å sette opp et felles trafikklys
          (CTS-en) som begge T-kryssene kan se selv om de ikke ser hverandre.
        </p>
      </Metafor>

      <div className="grid gap-3 lg:grid-cols-2">
        <Illustration caption="Path loss-kurve: signalstyrke vs avstand på log-skala — fritt rom + innendørs med vegger.">
          <PathLossCurveSvg />
        </Illustration>
        <Illustration caption="Multipath: direkte + refleksjon-kopi gir konstruktiv (additiv) eller destruktiv (kansellerende) addering.">
          <MultipathFadingSvg />
        </Illustration>
      </div>

      <Example title="Eksempel: hvorfor 5 streker plutselig blir 1 strek">
        <p>
          Du sitter ved kjøkkenbordet med full WiFi-styrke. Du flytter laptopen 15 cm til høyre for
          å bedre lyset, og plutselig faller forbindelsen til 1 strek og videoen begynner å buffre.
        </p>
        <p className="mt-2">
          Det er multipath-fading. På den nye posisjonen ankommer den direkte radio-bølgen og en
          refleksjon fra et metallisk kjøkkenskap i nesten motfase. De to bølgene utslettet
          hverandre delvis. Radioen din senker modulasjons-rate fra 256-QAM ned til BPSK for å
          fortsatt få noe gjennom — derav den lave throughputen, ikke faktisk tap av forbindelse.
        </p>
        <p className="mt-2 text-muted-foreground">
          Dette er hvorfor moderne WiFi-rutere bruker MIMO (flere antenner): hver antenne ser en
          litt ulik kombinasjon av reflekser, og mottakeren kombinerer dem matematisk for å unngå
          fading-hull.
        </p>
      </Example>

      <Example title="Eksempel: trace av en hidden terminal-kollisjon">
        <p>
          Tre nodes i et åpent landskaps-kontor: A ved nordvinduet, C ved sørvinduet, AP midt
          mellom. Avstand A↔AP = 20 m, AP↔C = 20 m, A↔C = 40 m gjennom en seksjons-vegg som demper
          med 25 dB. A og C måler hver for seg lufta som ledig.
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>
            kl. 0: A sjekker carrier — ingen aktivitet — starter sending av en 1200-byte frame med
            54 Mbps-modulasjon. Sending tar ca. 178 μs.
          </li>
          <li>
            kl. 80 μs: C sjekker carrier — A sin radiobølge når C med −95 dBm (under C sin
            detektor-terskel på −82 dBm) — C tror lufta er ledig.
          </li>
          <li>kl. 80 μs: C starter sending av sin egen frame.</li>
          <li>
            kl. 80–178 μs: AP mottar to overlappende signaler. SINR (signal-til-støy-pluss-
            interferens) faller under den nødvendige terskelen for 54 Mbps-modulasjon.
          </li>
          <li>
            kl. 178 μs: A er ferdig med sending, lytter etter ACK. Ingen ACK kommer fordi AP sin
            CRC-sjekk feiler.
          </li>
          <li>
            kl. 178 + SIFS + ACK-timeout ≈ 254 μs: A registrerer manglende ACK, dobler CW,
            planlegger retransmit. Samme skjer hos C.
          </li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          A og C var begge perfekt høflige etter CSMA/CA-reglene — de tapte fordi protokollen ikke
          kan se det den ikke kan høre. Det er hvorfor RTS/CTS finnes som opt-in-mekanisme: CTS-en
          kommer fra AP som begge når, og pålegger en NAV-stillhet selv de skjulte stasjonene må
          respektere.
        </p>
      </Example>

      <Hvorfor title="Hvorfor er CSMA/CA nødvendig i radio, når Ethernet klarer seg med CSMA/CD?">
        <p>
          Ethernet sin CSMA/CD bygger på én fysisk forutsetning: en sender kan høre andre signaler
          på lenken mens den selv sender. På kobber er det enkelt — alle nodes er galvanisk koblet
          til samme buss, og en kollisjon vises som forhøyet spenning over normal
          enkelt-sender-amplitude.
        </p>
        <p>
          I radio er det fysisk umulig. Senderens egen utgangs-effekt på antennen er typisk +15 dBm;
          en innkommende fjern-frame ankommer på rundt −70 dBm. Forskjellen er 85 dB, eller en
          faktor på ca. 300 millioner i effekt. Ingen mottaker-elektronikk kan plukke ut det svake
          signalet under det sterke selvinterferens-bråket på samme frekvens samtidig.
        </p>
        <p>
          Derfor må radio-protokoller unngå kollisjoner i stedet for å detektere dem. CSMA/CA sin
          obligatoriske DIFS-pause pluss tilfeldig backoff-vinduet sprer sendings-tidspunktene slik
          at to klare-til-å-sende stationer sjelden treffer samme slot. RTS/CTS løser
          tilleggsproblemet at to stationer kanskje ikke kan høre hverandre i det hele tatt.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-wifi-csma-ca"]} />
    </article>
  );
}

// ============================================================
// 7.2 — WiFi 802.11
// ============================================================
function Section72() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="7.2" title="WiFi 802.11 — CSMA/CA og frame-strukturen" />

      <p className="text-muted-foreground">
        Siden radioer er half-duplex og kollisjoner ikke kan detekteres mens man sender, snur WiFi
        problemet på hodet: i stedet for «detect» bruker vi <em>avoidance</em>. Hver station venter
        til lufta er stille, deretter venter litt til (en tilfeldig backoff), og sender bare hvis
        ingen andre kom dem i forkjøpet. Mottakeren bekrefter med ACK; uteblitt ACK betyr at framen
        gikk tapt og må sendes på nytt.
      </p>

      <SpektrumViz />

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            { term: "CSMA/CA", icon: <CsmaCaIcon />, body: "Lytt, vent DIFS, tilfeldig backoff, send, vent ACK." },
            { term: "DIFS", icon: <DifsIcon />, body: "Obligatorisk stille-pause ~34 μs etter ledig luft." },
            { term: "SIFS", icon: <SifsIcon />, body: "Kort pause ~16 μs mellom data og ACK." },
            { term: "Backoff-vindu (CW)", icon: <BackoffIcon />, body: "Tilfeldig telle-ned i slot-tider før sending." },
            { term: "RTS/CTS", icon: <RtsCtsIcon />, body: "Liten reservasjon mot hidden terminal — alle hører CTS." },
            { term: "Beacon-frame", icon: <BeaconIcon />, body: "AP kringkaster SSID hver ~100 ms." },
            { term: "Assosiasjon", icon: <AssociationIcon />, body: "Probe → autentiser → assosiere før første data-frame." },
            { term: "Autentisering", icon: <AuthIcon />, body: "Nøkkel-handshake (WPA2/WPA3) før assosiasjon." },
            { term: "NAV", icon: <NavTimerIcon />, body: "Virtuell timer som tvinger stillhet selv uten å høre signal." },
            { term: "Slot-tid", icon: <SlotTimeIcon />, body: "Grunntakten i backoff-telling, ~9 μs i 802.11n+." },
            { term: "802.11 a/b/g/n/ac/ax", icon: <Wifi80211Icon />, body: "Hver generasjon: ny modulasjon + MIMO/OFDMA." },
            { term: "Eksponentiell backoff", icon: <ExpBackoffIcon />, body: "CW dobles etter hver kollisjon: 15→31→63→…" },
            { term: "MU-MIMO", icon: <MuMimoIcon />, body: "AP sender til flere klienter parallelt via beamforming." },
          ]}
        />
        <Illustration caption="CSMA/CA-sekvens: lytt → DIFS → backoff → send → SIFS → ACK.">
          <CsmaCaSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="CSMA/CA + RTS/CTS — hånd-i-været-systemet i klasserommet">
          <p>
            Tenk deg en klasseromsdebatt med 25 elever. Hvis alle bare snakker når de føler for det,
            blir det kaos. I stedet venter de til det er stille (DIFS — den obligatoriske pausen),
            så strekker de hånda i været. Læreren (AP-en) peker på én — det er CTS-en. Alle andre
            hører at akkurat denne eleven har ordet, og blir tause helt til hun er ferdig. Selv
            elever lengst bak som ikke kan høre at hun snakker, vet at de skal være stille fordi
            læreren ga klar beskjed. Det er nøyaktig hvordan RTS/CTS løser hidden
            terminal-problemet.
          </p>
        </Metafor>
        <Metafor tittel="Backoff — kron-og-mynt for de som rakk opp hånda samtidig">
          <p>
            To elever (X og Y) rekker opp hånda i samme øyeblikk. Læreren kan ikke se hvem som var
            først. I stedet trekker X et tilfeldig tall fra 0 til 15, og Y trekker sitt eget. X får
            5, Y får 9 — X teller raskere ned og får ordet først. Hvis de er ekstra uheldige og
            trekker samme tall, kolliderer de i å snakke samtidig. Da dobles trekke-spennet til 0–31
            (eksponentiell backoff), og sannsynligheten for å treffe samme tall halveres. Det er
            nøyaktig CSMA/CA-loddtrekningen som forhindrer at to WiFi-klienter rir hverandre i
            stykker.
          </p>
        </Metafor>
      </div>

      <Metafor tittel="RTS/CTS — som å reservere bord på restauranten">
        <p>
          Du sender en SMS til hovmesteren: «Vi er 4 personer, kan vi få et bord 19:00?» (RTS).
          Hovmesteren svarer høyt til hele restauranten: «Bord 7 er booket av 4 personer 19:00»
          (CTS). Selv gjester ute i baren som ikke hørte din SMS, vet at de ikke skal sette seg ved
          bord 7. Når dere kommer, slipper dere å kjempe om plassen — NAV-en har holdt det tomt for
          dere.
        </p>
      </Metafor>

      <Illustration caption="To stationer X og Y kjemper om lufta. X trekker 5, Y trekker 9. X vinner; Y fryser med 4 igjen.">
        <BackoffRaceSvg />
      </Illustration>

      <Example title="Eksempel: to stationer kjemper om lufta">
        <p>
          Station X og Y vil begge sende. Lufta blir ledig kl. 0. Begge venter DIFS (34 μs). X
          trekker tilfeldig backoff = 5 slots, Y trekker 9 slots. Slot-tid er 9 μs.
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>kl. 34 μs: DIFS ferdig, telle-ned starter</li>
          <li>kl. 34 + 5·9 = 79 μs: X når 0 først og sender frame</li>
          <li>Y fryser telle-ned med rest 4 slots</li>
          <li>X sin frame + SIFS + ACK ferdig; ledig igjen</li>
          <li>kl. ny start + DIFS: Y fortsetter med 4 slots, sender uten å trekke på nytt</li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Hvis begge hadde trukket backoff = 5, ville de sendt samtidig. Det er en faktisk kollisjon
          — AP-en hører bare støy, ingen ACK kommer tilbake, og begge dobler sitt CW-vindu og prøver
          på nytt. Eksponentiell backoff sikrer at situasjonen ikke gjentar seg uendelig.
        </p>
      </Example>

      <Example title="Eksempel: når RTS/CTS faktisk lønner seg">
        <p>
          Vi sammenligner total luft-tid for én vellykket data-leveranse på 1500 byte ved 24 Mbps,
          uten og med RTS/CTS, i et scenario med hidden terminals der kollisjons-sannsynligheten
          uten RTS/CTS er 30 %.
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>Data-frame-tid: 1500 byte · 8 / 24 Mbps ≈ 500 μs</li>
          <li>SIFS = 16 μs, ACK ≈ 30 μs, DIFS = 34 μs</li>
          <li>
            <strong>Uten RTS/CTS, 70 % suksess:</strong> kostnad per suksess = (DIFS + backoff +
            DATA + SIFS + ACK) / 0.7 ≈ (34 + 100 + 500 + 16 + 30) / 0.7 ≈ 970 μs/leveranse
          </li>
          <li>RTS ≈ 20 μs, CTS ≈ 20 μs, antar 95 % suksess fordi NAV beskytter mot skjulte</li>
          <li>
            <strong>Med RTS/CTS, 95 % suksess:</strong> kostnad = (DIFS + backoff + RTS + SIFS + CTS
            + SIFS + DATA + SIFS + ACK) / 0.95 ≈ (34 + 100 + 20 + 16 + 20 + 16 + 500 + 16 + 30) /
            0.95 ≈ 793 μs/leveranse
          </li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          For store frames og høy kollisjons-rate sparer RTS/CTS netto luft-tid. For små frames (300
          byte) ville RTS/CTS-overhead vært større enn besparelsen, så standard-terskelen er satt
          høyt nok (typisk 2347 byte) til at den i praksis er av — og brukeren slår den på
          eksplisitt når hidden-terminal-problemet er målt.
        </p>
      </Example>

      <Hvorfor title="Hvorfor har 2.4 GHz-båndet bare 3 non-overlappende kanaler?">
        <p>
          2.4 GHz-båndet i Norge går fra 2.400 til 2.4835 GHz — bredde på ca. 83.5 MHz. Hver WiFi-
          kanal er offisielt 20 MHz bred (eller 40 MHz i n/ac), og kanal-senterene ligger 5 MHz fra
          hverandre. Det betyr at kanal 1 og kanal 2 deler 15 av sine 20 MHz — de er nesten totalt
          overlappende.
        </p>
        <p>
          For at to nett ikke skal forstyrre hverandre må kanal-senterene være minst 20 MHz fra
          hverandre. Med 5 MHz spacing krever det at man hopper 4 kanaler om gangen: 1, 6, 11. Tre
          ikke-overlappende kanaler er alt 2.4 GHz tillater. Tett bebyggelse med mange WiFi-nett
          fyller alle tre opp, og naboene tvinges til å konkurrere via CSMA/CA — derav den velkjente
          «WiFi-rusht-time» midt i kvelden.
        </p>
        <p>
          5 GHz-båndet er ca. 500 MHz bredt med 20-MHz kanaler og lite overlapp, så det gir 25+
          non-overlappende kanaler avhengig av regelverk. Det er den grunnleggende grunnen til at 5
          GHz føles raskere selv om radio-modulasjonen er den samme — du slipper å dele lufta med
          naboene.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-wifi-csma-ca"]} />
    </article>
  );
}

// ============================================================
// 7.3 — Cellular
// ============================================================
function Section73() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="7.3" title="Cellular — celler, basestasjoner, og generasjoner" />

      <p className="text-muted-foreground">
        Mobilnett er bygget rundt en helt annen arkitektur enn WiFi. Geografien deles i celler
        (typisk 100 m – flere km i radius); hver celle har én basestasjon som koordinerer all
        radio-trafikk; en sentral kjerne ruter samtaler og data ut på resten av nettet. Generasjon
        for generasjon har kjernen blitt mer og mer lik vanlig internett, mens radio-grensesnittet
        har blitt smartere.
      </p>

      <CellulaViz />

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            { term: "Celle", icon: <CelleIcon />, body: "Geografisk område dekket av én basestasjon." },
            { term: "Basestasjon", icon: <BaseStationIcon />, body: "BTS/NodeB/eNodeB/gNodeB — radio + fiber-kobling." },
            {
              term: "Kjernenettet",
              icon: <CoreNetIcon />,
              body: "Faste switcher, gateways og databaser bak basestasjonene.",
            },
            { term: "GSM (2G)", icon: <Gsm2GIcon />, body: "Krets-svitsjet tale + GPRS-pakker som tilleggsmodul." },
            { term: "LTE (4G)", icon: <Lte4GIcon />, body: "All-IP, OFDMA på radio, VoLTE for tale." },
            { term: "5G", icon: <FiveGIcon />, body: "Mer kapasitet (mmWave), <10 ms forsinkelse, network slicing." },
            { term: "Frequency reuse", icon: <FreqReuseIcon />, body: "Samme frekvenser gjenbrukt i ikke-nabo-celler." },
            { term: "BTS/NodeB/eNodeB/gNodeB", icon: <NodeBIcon />, body: "Generasjons-navn på basestasjons-radioen." },
            { term: "HSS / UDM", icon: <HssIcon />, body: "Sentral abonnent-database med krypto-nøkler." },
            { term: "MME / AMF", icon: <MmeIcon />, body: "Mobility manager — holder rede på hvilken celle du er i." },
            { term: "S-GW / P-GW / UPF", icon: <GatewayIcon />, body: "Data-plane-gateway — eier IP-adressen din." },
            { term: "OFDMA-subbærere", icon: <OfdmaIcon />, body: "20 MHz delt i 1200 smale bærere à 15 kHz." },
            { term: "SIM/eSIM", icon: <SimCardIcon />, body: "Tamper-resistent nøkkel-kort for autentisering." },
          ]}
        />
        <Illustration caption="Sekskant-mønsteret med fargede frekvens-grupper og kjernens kobling ut på internett.">
          <CellularTopologySvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="Celler — som en honningkake-mosaikk over kartet">
          <p>
            Tenk deg at du brer et honningkake-mønster av sekskanter ut over hele Nord-Norge. Hver
            sekskant er en celle med sin egen basestasjon på toppen av masten i midten. Du kan se
            for deg de tre fargene som tre ulike frekvens-grupper (f1, f2, f3): naboer maler aldri
            samme farge slik at de ikke forstyrrer hverandre, men celler langt unna kan bruke samme
            farge fritt. Det er hele trikset som gjør at hele Norge får mobildekning uten å sprenge
            spektrum-budsjettet.
          </p>
        </Metafor>
        <Metafor tittel="Frequency reuse — som å rope navn på skolegården">
          <p>
            «Per!» roper en mor i ene enden av skolegården. En annen «Per!» fra den andre enden
            forveksles ikke fordi avstanden mellom dem er så stor at hver Per bare hører sin egen
            mor. Men hvis to mødre står 5 m fra hverandre og begge roper Per, blir det forvirring —
            samme frekvens (samme «navn-lyd»), kort avstand, garantert kollisjon. Mobilnett gjør
            akkurat dette med radio: samme kanal kan brukes om igjen — bare ikke i nabo-cellen.
          </p>
        </Metafor>
      </div>

      <Metafor tittel="Generasjons-skiftet 2G → 5G — fra rør-svitsj til pakke-fabrikk">
        <p>
          GSM (2G) var som et fast telefonbord der hver samtale fikk sin egen ledning trukket fra
          ende til ende. Stille pauser kostet like mye som ord — krets-svitsjet. LTE og 5G ligner
          mer på en postsentral: pakker reiser i sky, kjernen er en moderne ruter-fabrikk, og tale
          er bare en applikasjon (VoLTE/VoNR) blant alle andre IP-pakker. Hver generasjon har
          skjøvet intelligensen lenger ut til basestasjonen og gjort kjernen flatere.
        </p>
      </Metafor>

      <Illustration caption="Generasjons-tidslinjen 2G→5G med radio-teknologi, data-rate-størrelser, og kjerne-arkitektur side om side.">
        <CellGenTimelineSvg />
      </Illustration>

      <Example title="Eksempel: en SMS i 2G vs en TikTok-video i 5G">
        <p>
          En SMS i GSM (1995): du komponerer 160 tegn, telefonen sender dem som en
          signalerings-melding over kontroll-kanalen (ikke engang en datakanal) til basestasjonen,
          MSC ruter til mottakerens hjem-MSC, og leveres når mottaker-telefonen er i dekning. Hele
          konseptet er krets-svitsjet styring, ikke pakker.
        </p>
        <p className="mt-2">
          En TikTok-video i 5G: telefonen får tildelt en bunt med OFDMA-subbærere i én millisekund,
          gNodeB encoder pakker over fiber til UPF-en (User Plane Function) som er en helt vanlig
          IP-ruter, derfra ut på internett til TikTok sitt CDN. Hele veien er det IP-pakker, og den
          eneste forskjellen fra fast fiber er at radio-leddet bruker en mer komplisert forhandling
          av modulasjons-rate hvert millisekund.
        </p>
      </Example>

      <Example title="Eksempel: full tidslinje for en celle-håndover på et tog">
        <p>
          Du sitter på toget gjennom Lofoten med en aktiv Spotify-streaming i 4G. Toget passerer fra
          dekning av eNodeB-«Svolvær» til eNodeB-«Kabelvåg». Her er hva som skjer sett fra telefonen
          og kjernen:
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>
            t = 0 ms: telefonen måler RSRP fra Svolvær = −95 dBm, Kabelvåg = −105 dBm. Ingen
            håndover trigger.
          </li>
          <li>
            t = 4000 ms: toget kjører videre. RSRP Svolvær = −105 dBm, Kabelvåg = −98 dBm. Kabelvåg
            er nå sterkere med en margin på 7 dB.
          </li>
          <li>
            t = 4000 ms: telefonen sender en Measurement Report til Svolvær eNodeB over RRC-
            kontroll-kanalen.
          </li>
          <li>
            t = 4040 ms: Svolvær bestemmer håndover, sender en HANDOVER REQUEST over X2-
            grensesnittet direkte til Kabelvåg eNodeB.
          </li>
          <li>
            t = 4060 ms: Kabelvåg reserverer ressurser, svarer HANDOVER REQUEST ACK med en
            forhåndsallokert RNTI (Radio Network Temporary Identifier).
          </li>
          <li>
            t = 4080 ms: Svolvær sender RRC Connection Reconfiguration til telefonen — «bytt til
            Kabelvåg på frekvens X, RNTI Y, nå».
          </li>
          <li>
            t = 4090–4180 ms: telefonen retunes radio, sender Preamble til Kabelvåg, mottar Timing
            Advance, og kompletterer Random Access Procedure.
          </li>
          <li>
            t = 4180 ms: telefonen sender RRC Connection Reconfiguration Complete til Kabelvåg.
            Håndover ferdig.
          </li>
          <li>
            t = 4180 ms: Kabelvåg sender PATH SWITCH REQUEST til MME, som oppdaterer S-GW slik at
            GTP-tunnelen for Spotify-strømmen nå termineres hos Kabelvåg i stedet for Svolvær.
          </li>
          <li>
            t = 4200 ms: bufferede Spotify-pakker som var on-the-fly mot Svolvær blir forwarded over
            X2 til Kabelvåg og leveres til telefonen.
          </li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Hele opplevelsen for deg er at musikken kanskje gjorde en knapt hørbar pause på 100 ms.
          Spotify-app-en visste aldri at noe skjedde fordi din telefon-IP (utdelt av P-GW) ikke
          endret seg ett hakk.
        </p>
      </Example>

      <Hvorfor title="Hvorfor er mobilnettet bygget rundt celler i stedet for én stor radio?">
        <p>
          En enkelt kraftig sender kunne i prinsippet dekke en hel by, men den ville sløse spektrum
          massivt. All trafikk i området måtte deles på samme frekvens-bånd via en eller annen
          multi-access-mekanisme. Antall samtidige brukere ville være begrenset av hvor mange
          ortogonale «slots» (tid, frekvens, kode) du kan dele båndet i.
        </p>
        <p>
          Celler løser dette gjennom <em>frequency reuse</em>: samme frekvens-bånd kan brukes mange
          ganger over et område så lenge cellene som bruker det er fysisk langt nok unna hverandre
          til at signalene har dempet seg under interferens-terskelen før de når neste bruker.
          Effektivt skalerer kapasiteten med antall celler, ikke med spektrum- bredden.
        </p>
        <p>
          Sekundære fordeler: lavere sender-effekt per enhet (lengre batterilevetid og mindre
          stråling), kortere avstand mellom telefon og basestasjon (bedre SNR, høyere data- rate),
          og naturlig redundans (en enkelt-celle-feil tar ned et lite område, ikke hele byen).
          Trade-off er kompleksiteten — håndover, mobility management og hyppigere
          basestasjons-utbygging.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-wifi-csma-ca"]} />
    </article>
  );
}

// ============================================================
// 7.4 — Mobilitet
// ============================================================
function Section74() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="7.4" title="Mobilitet — adressere en host som flytter seg" />

      <p className="text-muted-foreground">
        IP-adresser ble designet rundt antakelsen at en host står stille på ett subnet. Når den
        flytter seg til et nytt nett, får den en ny adresse — og åpne forbindelser (som bruker
        gammelt IP) brytes. For å løse dette må noen et sted vite både hvor hosten «hører hjemme» og
        hvor den er akkurat nå, og videresende pakker fra det første til det andre. Det er det
        Mobile IP og mobil-kjernens GTP-tunneling gjør.
      </p>

      <MobilitetsTracer />

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            { term: "Home network", icon: <HomeNetIcon />, body: "Der den permanente IP-adressen hører hjemme." },
            {
              term: "Home agent (HA)",
              icon: <HomeAgentIcon />,
              body: "Ruter som videresender pakker til hosten der den er nå.",
            },
            {
              term: "Foreign network / FA",
              icon: <ForeignAgentIcon />,
              body: "Nettet hosten besøker; lokal ruter mottar tunnel.",
            },
            { term: "Care-of-address (COA)", icon: <CoaIcon />, body: "Midlertidig adresse på besøks-nettet." },
            { term: "Tunneling", icon: <TunnelingIcon />, body: "Pakk innpakket i ny ytre IP med COA som destinasjon." },
            {
              term: "Triangle routing",
              icon: <TriangleRoutingIcon />,
              body: "Trafikk-omvei via HA — løses av route optimization.",
            },
            { term: "GTP-tunnel", icon: <GtpTunnelIcon />, body: "Mobilkjernens versjon — tunnel mellom eNB og gateway." },
            { term: "Korrespondent (CN)", icon: <CorrespondentIcon />, body: "Server som snakker med mobil-hosten." },
            { term: "Registrering med HA", icon: <RegistrationIcon />, body: "Si fra om ny COA hver gang du flytter deg." },
            { term: "Co-located COA", icon: <ColocatedCoaIcon />, body: "Hosten tar selv DHCP-adresse, dropper FA." },
            {
              term: "Reverse tunneling",
              icon: <ReverseTunnelIcon />,
              body: "Utgående trafikk via HA for å passere ingress-filter.",
            },
            { term: "Soft-state", icon: <SoftStateIcon />, body: "Bindinger utløper hvis ikke fornyet jevnlig." },
            {
              term: "Encapsulation-overhead",
              icon: <EncapOverheadIcon />,
              body: "20–40 byte ekstra IP-header per tunnelert pakke.",
            },
          ]}
        />
        <Illustration caption="Pakkens omvei via home agent og inn-pakking til foreign network.">
          <MobileIpSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="Mobile IP — som å bytte adresse, men ha posten videresendt">
          <p>
            Du flytter fra Oslo til Tromsø, men har ikke fortalt vennene dine om den nye adressen
            ennå. På Posten setter du opp en automatisk videreforsendelse: post stilet til
            Oslo-adressen din blir lagt i en stor brun konvolutt (tunnel) merket med Tromsø-adressen
            og fløyet nordover. Avsenderen i Bergen merker ingenting — for henne er din «adresse»
            fortsatt Oslo. Det er nøyaktig home agent og care-of-address: din permanente IP er
            Oslo-adressen, COA er Tromsø-adressen, og tunnelen er den brune konvolutten.
          </p>
        </Metafor>
        <Metafor tittel="Triangle routing — kompis ringer fra naborommet via Australia">
          <p>
            Forestill deg at du sitter på et hotell i Bodø. Vennen din ligger i sengen ved siden av
            deg på samme rom. Han ringer mobilen din. Anropet går først til Telenor sin sentral i
            Tromsø (Home Agent), pakkes inn der, sendes 1100 km tilbake til Bodø, og ringer på
            telefonen din 30 cm unna. Det er triangel-ruting i konsentrert form: pakker reiser to
            ganger Norge frem og tilbake selv om sender og mottaker er nakke til nakke. Route
            optimization lar vennen registrere COA-en din og sende direkte.
          </p>
        </Metafor>
      </div>

      <Metafor tittel="Care-of-address — som et hotellrom-nummer">
        <p>
          Din permanente IP er hjemmeadressen din. COA er rom 312 på Radisson Blu Tromsø. Hver gang
          du sjekker inn på et nytt hotell får du et nytt rom-nummer, og du må fortelle
          husholdersken (HA) hvilket rom-nummer du har nå så fysisk post (pakker) kan leveres dit.
          Når du sjekker ut, blir COA fritt brukt av neste gjest. Soft-state betyr at husholdersken
          automatisk glemmer rom-nummeret ditt hvis du ikke konfirmerer det jevnlig — slik unngår de
          å levere post til et tomt rom evig.
        </p>
      </Metafor>

      <Illustration caption="Mobilkjernens GTP-tunnel — telefonens IP står stille mens tunnel-endepunktet (eNB) flytter seg mellom celler.">
        <GtpTunnelMobilitySvg />
      </Illustration>

      <Example title="Eksempel: video-samtale mens du tar bussen">
        <p>
          Du sitter på bussen i en Teams-samtale. Telefonen har IP <code>10.42.0.15</code> i Telia
          sin pool. Mens bussen kjører, hopper du mellom 4 celler.
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>
            Telia sin gateway (P-GW i LTE) eier <code>10.42.0.15</code> globalt — alt sendt til
            denne adressen havner hos gateway.
          </li>
          <li>
            For hver celle-bytte oppdateres en intern tunnel mellom gateway og den nye eNodeB-en
            (basestasjonen). Tunnel-endepunktet endres; ditt IP står stille.
          </li>
          <li>
            Teams-serveren har ingen anelse om at du flyttet deg — den ser konstant samme IP og
            samme TCP-forbindelse.
          </li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Hele mobilitets-jobben er gjemt nede i mobilkjernen. Applikasjons-laget får aldri vite at
          den fysiske radio-veien byttet.
        </p>
      </Example>

      <Example title="Eksempel: triangle routing kostnad mellom Tromsø og Bodø">
        <p>
          Si du er på reise i Bodø men din «hjem-IP» tilhører et nettverk i Tromsø. En kollega på
          samme hotell i Bodø prøver å sende deg en stor fil via et P2P-program over Mobile IP uten
          route optimization.
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>Hver pakke fra kollega → din hjem-IP → Home Agent i Tromsø (1100 km opp)</li>
          <li>
            HA i Tromsø pakker inn og sender via tunnel til Foreign Agent i Bodø (1100 km ned)
          </li>
          <li>FA pakker ut, leverer til deg over WiFi-en (10 m bort på rommet)</li>
        </ul>
        <p className="mt-2">
          Hver pakke gjør 2200 km omvei i stedet for de få meterne. Latency dobles fra ~5 ms til ~20
          ms RTT bare av geografi-omveien. Throughput halveres fordi sending er begrenset av BDP-en
          på den lange tunnelen, ikke den korte WiFi-en.
        </p>
        <p className="mt-2 text-muted-foreground">
          Med route optimization registrerer korrespondenten din COA via en sikker bindings-
          oppdatering, og pakker går direkte korrespondent → COA. Trade-off: korrespondent-stacken
          må implementere Mobile IP-utvidelsene, og det krever sikkerhets-relasjon med HA for å
          forhindre at en angriper omdirigerer trafikk ved å hevde en falsk COA.
        </p>
      </Example>

      <Hvorfor title="Hvorfor kan ikke IP-adresser bare være «portable» som mobil-nummer?">
        <p>
          Telefonnummer er en flat global identifikator som har null geografisk informasjon — et
          slå-opp-system (HLR) finner ut hvor du er hver gang noen ringer deg. Det fungerer fordi
          stemme-trafikk tåler 0.5–1 sekunds oppslag før samtalen begynner, og fordi det er relativt
          få samtaler per sekund globalt.
        </p>
        <p>
          IP-adresser er derimot designet for å være hierarkiske og rutbare: prefikset
          213.224.0.0/16 forteller hver ruter på internett at den skal sende videre mot Norge. Hvis
          enhver IP- adresse kunne være hvor som helst, måtte hver ruter slå opp hver pakke i en
          global tabell med milliarder av entries — fysisk umulig å gjøre på linje-rate.
        </p>
        <p>
          Mobile IP er kompromissløsningen: IP forblir hierarkisk-rutbar, men ett ankerpunkt (Home
          Agent eller mobilnettets gateway) holder en intern indirection-tabell for mobile hosts.
          Internet-skala-tabellen forblir liten; mobiliteten håndteres lokalt. Det er samme prinsipp
          som en sentralbordet på et hotell: bestillingen kommer til sentralbordet, sentralbordet
          vet hvilket rom du er på.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-wifi-csma-ca"]} />
    </article>
  );
}

// ============================================================
// 7.5 — Håndover
// ============================================================
function Section75() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="7.5" title="Håndover — soft, hard, og hva som må overføres" />

      <p className="text-muted-foreground">
        En håndover er overgangen fra én basestasjon (eller AP) til en annen mens du fortsatt har en
        aktiv samtale eller forbindelse. Den må skje raskt nok til at applikasjonen ikke merker det,
        og bruker en koordinert sekvens av målinger, beslutninger og signalerings-meldinger.
      </p>

      <HandoverTidslinje />

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            { term: "Hard handover", icon: <HardHandoverIcon />, body: "Break-before-make — kort gap, 50–200 ms i LTE." },
            { term: "Soft handover", icon: <SoftHandoverIcon />, body: "Make-before-break — kun mulig i 3G CDMA." },
            { term: "Måle-rapporter", icon: <MeasureReportIcon />, body: "Telefonen rapporterer RSRP/RSRQ til nettet jevnlig." },
            { term: "Frekvens-bytte", icon: <FreqSwitchIcon />, body: "Retune radio når ny celle er på annen frekvens." },
            {
              term: "WiFi roaming",
              icon: <WifiRoamingIcon />,
              body: "Klienten alene bestemmer — disassociate + re-associate.",
            },
            { term: "Kontekst-overføring", icon: <ContextTransferIcon />, body: "Nøkler + buffere flyttes via X2/Xn." },
            { term: "RSRP / RSRQ", icon: <RsrpIcon />, body: "Styrke (dBm) og kvalitet (dB) — begge brukes." },
            {
              term: "Time-to-Trigger (TTT)",
              icon: <TttIcon />,
              body: "Hvor lenge terskel må holdes før bytte utløses.",
            },
            {
              term: "Mobile- vs network-controlled",
              icon: <ControlMobileNetIcon />,
              body: "WiFi: klient bestemmer; LTE/5G: nettet bestemmer.",
            },
            { term: "X2/Xn-grensesnitt", icon: <X2InterfaceIcon />, body: "Direkte tunnel mellom nabo-basestasjoner." },
            {
              term: "Conditional handover (CHO)",
              icon: <ChoIcon />,
              body: "5G: forhåndsforberedt bytte — gap <10 ms.",
            },
            { term: "Ping-pong-effekt", icon: <PingPongIcon />, body: "Veksler mellom to celler ved grenseflimmer." },
            { term: "802.11r FT", icon: <FastRoamIcon />, body: "Forhåndsdelt PMK gir <30 ms WiFi-roam." },
          ]}
        />
        <Illustration caption="Tidslinje for soft vs hard håndover — overlapp eller gap mellom gammel og ny.">
          <HandoverSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="Soft handover — vannballett-bytte i bassenget">
          <p>
            Tenk på et synkronsvømmer-skift: før den gamle svømmeren slipper håndtaket på flåten,
            har den nye allerede tatt godt tak. Bevegelsen er sømløs — publikum ser aldri at noen
            faktisk byttes ut. Soft handover (3G CDMA) fungerer slik: telefonen er fysisk koblet til
            både gammel og ny basestasjon samtidig en kort overlapps-stund. Først når den nye er
            sikkert «festet», slippes den gamle.
          </p>
        </Metafor>
        <Metafor tittel="Hard handover — stafett-pinnen i 100 meter sprint">
          <p>
            I LTE/5G er det heller stafett-pinne: pinnen er i lufta en kort stund mens den ene
            slipper og den andre griper. Det er et lite vindu — 50–150 ms — der ingen har pinnen.
            Hvis byttet er trent (X2/Xn-koordinering på forhånd), faller den ikke i bakken.
            Conditional handover (CHO) i 5G er som å gjøre vekslingen blindt etter et ferdig avtalt
            signal — pinnen flyr over på under 10 ms.
          </p>
        </Metafor>
      </div>

      <Metafor tittel="Ping-pong — pendling mellom to kontorer på samme korridor">
        <p>
          Du står midt i korridoren og hører to kontorer fra begge sider. Stemmevolumet svinger litt
          frem og tilbake hvert minutt. Hvis du bestemmer deg for å gå inn på «det høyeste-stemte»
          kontoret hvert tiende sekund, ender du opp med å løpe frem og tilbake mellom dem hele
          dagen. Histeresis (krev en klar margin før du bytter) og Time-to-Trigger (krev at margen
          vedvarer en stund) er det som forhindrer at en mobil-klient gjør samme tabben på grensen
          mellom to celler.
        </p>
      </Metafor>

      <Illustration caption="RSRP-måling over tid: histeresis-margin + TTT forhindrer ping-pong når signalet flimrer.">
        <HandoverHysteresisSvg />
      </Illustration>

      <Example title="Eksempel: hva 200 ms gap betyr for en samtale">
        <p>
          En LTE hard handover varer typisk 50–150 ms. En VoIP-samtale sender pakker hver 20 ms; med
          en 150 ms-pause går omtrent 7–8 pakker tapt eller forsinket nok til å bli kastet av
          jitter-bufferen.
        </p>
        <p className="mt-2">
          Resultatet er et lite hopp i lyden — du hører kanskje en stavelse forsvinne, men samtalen
          brytes ikke. TCP-forbindelser holder fordi mobilkjernen flytter tunnel-endepunkt mens
          telefon-IP står stille; bufferede pakker leveres bare litt sent.
        </p>
        <p className="mt-2 text-muted-foreground">
          5G med kondisjonell handover (CHO) reduserer typisk gap til under 20 ms — så lite at de
          fleste samtaler høres helt sømløse selv på toget gjennom mange celler.
        </p>
      </Example>

      <Example title="Eksempel: ping-pong-effekt med ulik histeresis-innstilling">
        <p>
          En bruker går langs en korridor mellom to AP-er, AP-Nord og AP-Sør, der signalet svinger
          ±3 dB på grunn av multipath. Vi sammenligner roaming-oppførsel under to konfigurasjoner.
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>Snitt-signal AP-Nord: faller fra −60 til −78 dBm over 30 sekunder</li>
          <li>Snitt-signal AP-Sør: stiger fra −78 til −60 dBm over samme tid</li>
          <li>Multipath-støy: ±3 dB tilfeldig variasjon på 200 ms tidsskala</li>
        </ul>
        <p className="mt-2">
          <strong>Konfig A — ingen histeresis, TTT = 100 ms:</strong> klienten bytter så snart
          AP-Sør viser sterkere et øyeblikk. På grunn av ±3 dB-variasjonen krysser «sterkere»-
          tilstanden frem og tilbake mange ganger nær midt-punktet. Resultat: 8 håndover på 10
          sekunder — i hver gjør klienten en full 4-veis-handshake hvis ikke 802.11r er på, totalt
          ca. 1.5 sekunder ekstra latency, ofte med pakke-tap.
        </p>
        <p className="mt-2">
          <strong>Konfig B — 6 dB histeresis, TTT = 640 ms:</strong> AP-Sør må være målt minst 6 dB
          over AP-Nord i minst 640 ms før bytte. Multipath-variasjonen klarer ikke utløse det alene.
          Resultat: nøyaktig 1 håndover når klienten har gått tydelig inn i AP-Sør sitt område.
          Sømløst for video-samtaler.
        </p>
        <p className="mt-2 text-muted-foreground">
          Trade-off: med konfig B kan klienten henge på AP-Nord noen sekunder etter den burde ha
          byttet, og oppleve litt lavere data-rate i mellomtiden. For VoIP og video er stabilitet
          viktigere enn marginal data-rate; for filnedlastning kan det være motsatt.
        </p>
      </Example>

      <Hvorfor title="Hvorfor er soft handover praktisk talt forsvunnet fra 4G og 5G?">
        <p>
          Soft handover (kobling til to basestasjoner samtidig) krever at begge stasjoner sender på
          eksakt samme frekvens og at telefonen kombinerer signalene koherent. Det fungerer i 3G
          (UMTS) fordi den bruker CDMA der ulike celler kan sende på samme frekvens samtidig — de
          kodes med ortogonale sekvenser som mottakeren skiller matematisk.
        </p>
        <p>
          LTE og 5G bruker OFDMA i stedet for CDMA. Hver celle har sin egen frekvens-tildeling og
          unikt subbærer-mønster. To celler på samme frekvens ville interferere med hverandre i
          stedet for å kombineres konstruktivt. Soft handover er fysisk inkompatibel med OFDMA-
          arkitekturen.
        </p>
        <p>
          I stedet har 4G/5G blitt veldig gode på <em>fast</em> hard handover. X2/Xn-grensesnittet
          mellom basestasjoner lar dem koordinere så tett at gapet kommer ned mot 20 ms — kortere
          enn en VoIP-pakkes inter-arrival-tid. Conditional handover i 5G kutter gapet enda mer.
          Trade-off-en med å miste soft-modus aksepteres fordi OFDMA gir så mye høyere spektral
          effektivitet (bits per Hz per second) at nett-totalen vinner.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-wifi-csma-ca"]} />
    </article>
  );
}

// ============================================================
// 7.6 — TCP og wireless
// ============================================================
function Section76() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="7.6" title="Mobil impakt på applikasjoner — TCP i en støyete verden" />

      <p className="text-muted-foreground">
        TCP ble designet på 1980-tallet for kabelbaserte nett der pakketap nesten alltid skyldes
        kø-overløp, dvs. congestion. Reaksjonen er å halvere senderaten. Når den samme algoritmen
        kjører over WiFi eller mobil, blir den fooled: tap fra radio-feil blir tolket som
        congestion, og TCP straffer en lenke som faktisk er ledig. Resultat — kronisk
        under-utnyttelse av trådløse lenker.
      </p>

      <TCPRadioLab />

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            {
              term: "Bit-feil vs pakketap",
              icon: <BitErrorIcon />,
              body: "Radio: BER 10⁻⁵; kobber 10⁻¹² — TCP merker forskjellen.",
            },
            { term: "Link-layer ARQ", icon: <LinkArqIcon />, body: "WiFi/LTE retransmitterer lokalt; gir variabel RTT." },
            {
              term: "Spurious timeouts",
              icon: <SpuriousTimeoutIcon />,
              body: "Handover-pause utløser TCP-retransmit som ikke trengs.",
            },
            {
              term: "PEP (Performance Enhancing Proxy)",
              icon: <PepIcon />,
              body: "Splitter TCP — kvitterer fra mellom-rute.",
            },
            { term: "CUBIC vs BBR", icon: <CubicBbrIcon />, body: "CUBIC reagerer på tap; BBR måler BW+RTT direkte." },
            { term: "Mobilitets-jitter", icon: <JitterMobIcon />, body: "RTT-variasjoner forvirrer RTO-estimatet." },
            {
              term: "Bufferbloat",
              icon: <BufferbloatIcon />,
              body: "Stor radio-kø → kunstig høy RTT → TCP overdriver vindu.",
            },
            { term: "Snoop-protokoll", icon: <SnoopIcon />, body: "Basestasjon cacher segmenter, skjuler radio-tap." },
            { term: "Split-TCP", icon: <SplitTcpIcon />, body: "Eksplisitt to TCP-sesjoner — bryter ende-til-ende." },
            {
              term: "Explicit loss notification",
              icon: <ElnIcon />,
              body: "«Tap = radio-feil, ikke congestion» — aldri standardisert.",
            },
            {
              term: "Selective ACK (SACK)",
              icon: <SackIcon />,
              body: "Mottaker rapporterer eksakte hull i mottatt strøm.",
            },
            { term: "Slow start på mobil", icon: <SlowStartIcon />, body: "Lang oppvarmingsfase til full BDP er fylt." },
          ]}
        />
        <Illustration caption="Kabelmessig: tap = congestion. Radio: tap kan komme fra støy, fading, eller handover — TCP vet ikke forskjellen.">
          <TcpWirelessSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="TCP + wireless — leiebil-sjåføren som tror enhver dump er trafikkork">
          <p>
            Forestill deg en leiebil-sjåfør som bare har kjørt på motorvei. Når han nå kjører på
            grusvei og bilen rister, antar han at det er trafikk-kork foran og kjører tregere og
            tregere. Egentlig er det bare grusvei — han kunne kjørt fort. Det er TCP CUBIC over
            WiFi: hvert pakke-tap fra radio-støy tolkes som «kø-overløp» og avsender halverer
            senderaten. BBR er den nye sjåføren som måler hvor fort bilen faktisk kommer fram, og
            ignorerer ristingen.
          </p>
        </Metafor>
        <Metafor tittel="Spurious timeout under handover — postbudet som ringer i feil dør">
          <p>
            Postbudet (TCP-avsender) leverer en pakke til hytta di. Han venter på kvittering. Du er
            midt i et bytte fra ene rommet til det andre (handover) og ringeklokka er frakoblet et
            halvt minutt. Postbudet antar at pakka må være borte og leverer en ny (retransmit),
            samtidig som han bestemmer seg for å gå roligere fremover (halver cwnd). Litt senere
            kommer kvitteringen din for den første pakka — for sent. Nå har han to leveranser og en
            unødvendig redusert leveringsfart.
          </p>
        </Metafor>
      </div>

      <Metafor tittel="Bufferbloat — som en uendelig lang post-kø">
        <p>
          Radio-laget vil ikke at noen pakke skal gå tapt, så det stabler dem opp i en gigantisk kø
          og prøver om igjen og om igjen. Resultat: pakken bruker 500 ms før den slipper ut. TCP ser
          den lange RTT-en og tenker «det er masse plass — jeg kan sende mer» og fyrer inn enda
          flere pakker. Køen vokser. RTT vokser. Det er bufferbloat: prinsippet om at intet kan bli
          «litt fullt» — det blir helt fullt, og hele rør-kapasiteten ender opp som venterom
          istedenfor transport.
        </p>
      </Metafor>

      <Illustration caption="Mathis-formelen: TCP throughput faller med 1/√p. Radio-tap-rate på 0.3 % kapper teoretisk hastighet til ~3 Mbps uavhengig av link-kapasitet.">
        <MathisCurveSvg />
      </Illustration>

      <Example title="Eksempel: hvorfor 4G-laptopen din ikke når nominell hastighet">
        <p>En 4G-lenke annonserer 100 Mbps. Du tester med iperf og får 23 Mbps. Hvorfor?</p>
        <ul className="list-disc pl-5 mt-1">
          <li>
            BDP (bandwidth-delay-product): 100 Mbps · 60 ms RTT = 750 KB. Standard TCP-vindu på 65
            KB klarer ikke fylle røret. Trenger window scaling og store buffere.
          </li>
          <li>
            Sporadisk pakketap fra fading — kanskje 0.5 % — utløser regelmessige rate-halveringer i
            klassisk TCP CUBIC. Du tilbringer mye tid i recovery i stedet for full sending.
          </li>
          <li>
            Link-layer ARQ skjuler de fleste feil, men gjør RTT-variansen høy, så RTO settes
            konservativt → langsom recovery når tap faktisk skjer.
          </li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Bytt til en server som kjører BBR (Google og YouTube gjør det) og se throughput hoppe til
          nær nominell. Dette er hvorfor TCP-versjons-valg ikke er en akademisk detalj — det
          påvirker hvor mye av den dyre radio-kapasiteten du faktisk får brukt.
        </p>
      </Example>

      <Example title="Eksempel: håndover-pause som utløser spurious timeout">
        <p>
          Du er på toget mellom Hamar og Lillehammer i en SSH-sesjon. Toget passerer en celle-
          grense. Vi tracer en spurious timeout i detalj.
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>
            Estimat før hendelse: SRTT (smoothed RTT) = 60 ms, RTTVAR = 10 ms, RTO = SRTT + 4·RTTVAR
            = 100 ms
          </li>
          <li>t = 0 ms: avsender sender SEQ=10000, 1460 byte</li>
          <li>t = 1 ms: håndover-prosedyre starter på radio-laget</li>
          <li>t = 1–160 ms: telefonen er i en kort radio-blackout mens den retunes til ny celle</li>
          <li>
            t = 100 ms: TCP RTO utløpt hos avsender — antar pakken er tapt, retransmitterer
            SEQ=10000, halverer cwnd, går inn i slow-start
          </li>
          <li>
            t = 160 ms: håndover ferdig, original pakke kommer fram (var bufferet i ny basestasjon)
          </li>
          <li>t = 220 ms: avsender mottar ACK for original pakken</li>
          <li>t = 280 ms: avsender mottar duplikat-ACK for retransmitten (ignoreres)</li>
        </ul>
        <p className="mt-2">
          Resultatet: cwnd er halvert til ingen nytte, og slow-start må klatre opp igjen. På en
          forbindelse med 50 ms RTT tar det 8–10 RTT-er å nå opprinnelig nivå — en halv sekund tapt
          throughput. Brukeren føler det som at toget «får dårlig dekning» selv om radio-en allerede
          er reetablert.
        </p>
        <p className="mt-2 text-muted-foreground">
          Linux har en mekanisme kalt F-RTO (Forward RTO recovery) som detekterer spurious timeouts
          ved at den neste ACK ikke er duplikat — og deretter angrer kondisjonelt på
          rate-reduksjonen. Hjelper, men løser ikke grunnproblemet: TCP og radio-laget snakker ikke
          samme språk.
        </p>
        <div className="mt-3 rounded bg-background/60 p-2">
          <ExampleSpuriousTimeoutSvg />
        </div>
      </Example>

      <Hvorfor title="Hvorfor sliter klassisk TCP fundamentalt med trådløse lenker?">
        <p>
          TCP sin congestion control bygger på antagelsen at pakketap er sjeldne og at når de skjer
          er det fordi en buffer et sted ble full. Den ble formulert på 1980-tallet av Van Jacobson
          da nett var koppertråd-baserte og bit-feilrate var rundt 10⁻¹². I den verdenen stemmer
          antakelsen: 99.99 % av tap er congestion.
        </p>
        <p>
          Radio-link bryter antakelsen på flere måter samtidig. Bit-feil fra støy og fading kan gi
          pakke-tap som er fysisk-laget-fenomener, ikke kø-overløp. Håndover-pauser ser ut som tap
          selv om pakken venter i kø hos den nye basestasjonen. Link-layer retransmits gir variabel
          forsinkelse som forvirrer RTT-estimatet. RTT mellom konsekutive pakker kan svinge med en
          faktor på 5 over hundrevis av ms.
        </p>
        <p>
          Konsekvensen er en systematisk under-utnyttelse: TCP halverer senderaten ved nesten hvert
          «tap» og bruker mye tid på å klatre opp igjen via slow-start eller AIMD-økning. På en
          lenke med 100 Mbps nominell kapasitet og 0.5 % radio-tap kan effektiv throughput synke til
          30 Mbps. BBR sin RTT/båndbredde-basert modell adresserer dette, men ble standardisert ti
          år etter at trådløst ble dominant — derav den lange perioden mobil-nett bare «føltes
          treigt» selv med god dekning.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-wifi-csma-ca"]} />
    </article>
  );
}

// ============================================================
// 7.7 — Oppgaver
// ============================================================
function Section77() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="7.7" title="Oppgaver" />
      <p className="text-muted-foreground">
        Sjekk forståelsen din med disse oppgavene. Klikk «Vis svar» for å se vår løsning etter du
        har prøvd selv.
      </p>

      <Forberedelse
        intro="Trådløst-oppgavene krever at du regner på fysikk og radio, ikke bare protokoller. Her er de fire framgangsmåtene."
        metoder={FORBEREDELSE_7}
      />

      <Exercise
        question="Forklar hvorfor CSMA/CD (slik Ethernet bruker) ikke duger i radio, og hvordan CSMA/CA løser det med backoff."
        hint="Tenk på hvor mye en radios egen sender hører av sitt eget signal vs et fjernt signal."
        answer={
          <>
            <p>
              CSMA/CD krever at senderen kan høre kollisjonen mens den sender — altså at den
              samtidig lytter etter andres signal på samme frekvens. På radio er det fysisk umulig
              fordi din egen sender genererer et signal som er millionvis av ganger sterkere enn det
              innkommende du skulle prøvd å detektere. Radio-grensesnittet er half-duplex.
            </p>
            <p className="mt-2">
              CSMA/CA snur problemet: i stedet for å detektere kollisjoner, prøver vi å unngå dem.
              Hver station venter en obligatorisk DIFS-periode etter at lufta blir ledig, og
              deretter et tilfeldig antall slot-tider (backoff-vinduet CW). Hvis to stationer
              trekker ulike tall, vinner den med lavest tall og taperne pauser sin telling. Hvis de
              tilfeldigvis trekker samme tall, kolliderer de — men da merker de mangel på ACK og
              dobler CW (eksponentiell backoff), så neste forsøk har 2× lavere sannsynlighet for ny
              kollisjon.
            </p>
          </>
        }
      />

      <Exercise
        question="Hidden terminal-scenario: A og C kan begge høre AP, men ikke hverandre. Trace kollisjons-historikken med og uten RTS/CTS."
        hint="Hvem hører hva, og når tror noen at lufta er ledig?"
        answer={
          <>
            <p>
              <strong>Uten RTS/CTS:</strong> A vil sende. A sjekker — ingen signaler — sender. C vil
              også sende. C sjekker — A er utenfor C sin rekkevidde, så lufta virker ledig hos C —
              sender. Begge framene ankommer AP samtidig og kolliderer. AP sender ingen ACK. A og C
              får timeout, dobler CW, prøver på nytt — og samme scenarioet kan gjenta seg fordi
              backoff-vinduet ikke hjelper når problemet er manglende «carrier sense».
            </p>
            <p className="mt-2">
              <strong>Med RTS/CTS:</strong> A sender en liten RTS-frame til AP. AP svarer med CTS
              som inneholder en NAV-verdi (varighet av den planlagte transaksjonen). Både A og C
              hører CTS-en — selv om C ikke hørte A sin RTS. C oppdaterer sin NAV-timer og holder
              seg stille i hele perioden. A sender frame, får ACK, ferdig. C kan deretter prøve
              selv.
            </p>
            <p className="mt-2 text-muted-foreground">
              RTS/CTS koster overhead — det er derfor det typisk slås av for små pakker og bare
              brukes når frame-størrelsen er over en konfigurert RTS-terskel.
            </p>
          </>
        }
      />

      <Exercise
        question="En mobil flytter mellom 3 AP-er på 10 minutter. Hva må skje for at TCP-forbindelser overlever?"
        hint="Hva har TCP forbindelses-identifikator bestående av, og hva ville endre seg ved en naiv AP-bytte?"
        answer={
          <>
            <p>
              TCP identifiserer en forbindelse med 4-tupelet (src-IP, src-port, dst-IP, dst-port).
              Hvis IP-adressen endres ved AP-bytte, ser server-siden det som en helt ny ukjent
              forbindelse og resetter den. For å overleve må IP holdes konstant.
            </p>
            <p className="mt-2">For at TCP skal overleve må følgende være på plass:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>
                Alle tre AP-ene må være på samme IP-subnet (samme bedriftsnett / samme SSID med
                DHCP-pool delt), så klienten beholder samme IP.
              </li>
              <li>
                Alternativt: en wireless-controller som tunneler all trafikk fra hver AP til en
                sentral concentrator (Mobile-IP-aktig løsning).
              </li>
              <li>
                Hver håndover-pause må være kort nok til at TCP sin RTO ikke utløses. Med
                802.11r/Fast BSS Transition kommer typisk pause under 50 ms — TCP merker bare en
                kortvarig RTT-økning, ingen retransmit nødvendig.
              </li>
              <li>
                Eventuelle bufferede pakker hos gammel AP må enten droppes (TCP retransmitterer)
                eller forwarded til ny AP (krever kontekst-overføring).
              </li>
            </ul>
            <p className="mt-2 text-muted-foreground">
              Hjemmenett uten enterprise-controller har ofte ulike subnet per AP (mesh-noder med
              egen DHCP), og da brytes TCP. Det er hovedgrunnen til at video-samtaler i hjemmet kan
              henge når du går fra stuen til soverommet med to ulike Eero-noder uten riktig
              konfigurasjon.
            </p>
          </>
        }
      />

      <Exercise
        question="Hvorfor halverer klassisk TCP CUBIC senderaten unødvendig ofte over trådløst, og hva gjør BBR annerledes?"
        hint="Hva er den utløsende hendelsen i CUBIC, og hvilket signal bruker BBR i stedet?"
        answer={
          <>
            <p>
              CUBIC bruker pakketap som primært congestion-signal. Når tre duplikate ACK-er kommer
              eller en timeout slår inn, antar CUBIC at en kø et sted ble full og halverer
              senderaten. Over trådløst er pakketap ofte fra radio-feil (multipath-fading, kortvarig
              interferens) — ikke congestion. CUBIC straffer da en lenke som faktisk har ledig
              kapasitet.
            </p>
            <p className="mt-2">
              BBR ignorerer tap som primært signal og modellerer i stedet to størrelser
              kontinuerlig: maks throughput observert og minimum RTT observert. Produktet er
              bandwidth-delay-product (BDP) — den optimale mengden data som skal være «in flight».
              BBR holder seg på den verdien uansett hva tap-statistikken sier. Resultat: én
              tilfeldig tapt pakke fra støy reduserer ikke senderaten, men en faktisk overfylt kø
              (som øker RTT) gjør det.
            </p>
            <p className="mt-2 text-muted-foreground">
              Trade-off: BBR kan være urettferdig mot CUBIC-strømmer i samme kø (BBR holder ut tap,
              CUBIC viker). Det er en pågående diskusjon om hvilken algoritme som bør være default i
              Linux-kjernen — i dag er det fortsatt CUBIC, men Google og Facebook kjører BBR i sine
              egne servere.
            </p>
          </>
        }
      />

      <Exercise
        question="Anta du har 30 brukere i et åpent landskap som alle bruker WiFi samtidig. Hver bruker streamer 5 Mbps video. AP-en har 200 Mbps nominell kapasitet. Hvorfor blir det likevel rykk og buffring?"
        hint="Tenk på MAC-overhead, ACK-er, backoff, og hvordan AP-en deler tid mellom mange klienter."
        answer={
          <>
            <p>
              Naivt regnestykke: 30 · 5 Mbps = 150 Mbps &lt; 200 Mbps, så det burde gå. Men WiFi sin
              faktiske utnyttelse av kapasiteten er typisk 40–60 % av nominell på grunn av:
            </p>
            <ul className="list-disc pl-5 mt-1">
              <li>
                DIFS + tilfeldig backoff før hver sending — flere klienter, lengre snitt-vente.
              </li>
              <li>SIFS + ACK etter hver data-frame; for korte frames er overhead-andelen høy.</li>
              <li>
                Hver klient sender på sin egen modulasjons-rate. Klienter langt fra AP-en sender på
                lav rate (kanskje 12 Mbps), og dominerer luft-tiden mens de sender — det kalles
                <em>airtime fairness-problemet</em>.
              </li>
              <li>
                Faktiske kollisjoner mellom klienter som tilfeldigvis trekker samme backoff.
                Eksponentiell backoff senker throughput mer for hver mislykkede.
              </li>
              <li>Half-duplex: AP-en kan ikke sende ned til klient X mens klient Y sender opp.</li>
            </ul>
            <p className="mt-2">
              Effektiv kapasitet i et reelt scenario er kanskje 80–100 Mbps. Med 150 Mbps
              etterspørsel går køen i AP-en full, pakker droppes, og videoene må buffre. Løsninger:
              flere AP-er (mindre brukere per AP), MU-MIMO (AP sender til flere klienter samtidig),
              eller 5 GHz / 6 GHz bånd med mer kanalkapasitet.
            </p>
          </>
        }
      />

      <Exercise
        question="En 802.11n-station måler SNR = 25 dB ved AP-en. Standard-modulasjons-tabellen sier at 64-QAM krever minst 22 dB SNR for 5/6 koderate, mens 256-QAM krever 28 dB. Hvilken modulasjon bør stationen velge, og hva betyr det for praktisk data-rate på en 20 MHz kanal?"
        hint="Tenk på marginalt over terskel vs robust drift, og hvor mange bit per symbol modulasjonen koder."
        answer={
          <>
            <p>
              Stationen ligger 3 dB over 64-QAM-terskelen og 3 dB under 256-QAM-terskelen. Velger
              64-QAM med 5/6 koderate — det er den høyeste modulasjonen den kan kjøre stabilt med en
              respekterbar margin mot fluktuasjoner.
            </p>
            <p className="mt-2">
              64-QAM koder 6 bit per symbol. På en 20 MHz 802.11n-kanal med 1 spatial stream og
              normal guard interval er symbolraten ca. 13.5 Msymbol/s. Med 5/6 koderate (av 6
              kodebits beholdes 5 informasjonsbits): 13.5 · 6 · (5/6) = 67.5 Mbps brutto. Etter
              MAC-overhead (DIFS, SIFS, ACK, headers) lander praktisk throughput rundt 40–50 Mbps.
            </p>
            <p className="mt-2 text-muted-foreground">
              Hvis stationen forsøkte 256-QAM med kun 25 dB SNR ville bit-feilraten bli for høy —
              link-layer ARQ ville retransmittere kontinuerlig, og effektiv throughput ville ende
              lavere enn med sikkert 64-QAM. Den adaptive modulasjons-velgeren prøver jevnlig opp og
              ned for å finne sweet spot.
            </p>
          </>
        }
      />

      <Exercise
        question="Du har 4G med målte verdier: nominell rate 100 Mbps, RTT 60 ms, pakke-tap fra radio 0.3 %. Beregn (a) bandwidth-delay-product, (b) hvilken TCP-vindu-størrelse som trengs for å fylle røret, og (c) hvorfor klassisk TCP CUBIC ikke vil oppnå nominell rate uansett vindu-størrelse."
        hint="BDP-formelen og Mathis-formelen for TCP throughput under tap."
        answer={
          <>
            <p>
              <strong>(a) BDP:</strong> 100 Mbps · 60 ms = 100·10⁶ · 0.060 = 6·10⁶ bit = 750 KB.
              Standard TCP-vindu på 65 535 byte er en faktor 12 for lite.
            </p>
            <p className="mt-2">
              <strong>(b) Nødvendig vindu:</strong> 750 KB. Krever TCP window scaling-opsjonen (RFC
              1323) som er på som default i Linux/Windows. Også krever buffer-størrelse i sender- og
              mottaker-stacken på minst 750 KB; standard er ofte 4 MB, nok.
            </p>
            <p className="mt-2">
              <strong>(c) Mathis-formelen:</strong> for TCP Reno/CUBIC under stabil tap-rate p er
              max-throughput ca. MSS / (RTT · √p · 1.22). Med MSS=1460 byte, RTT=0.060 s, p=0.003:
              max ≈ 1460·8 / (0.060 · √0.003 · 1.22) = 11680 / 0.00401 ≈ 2.9 Mbps.
            </p>
            <p className="mt-2 text-muted-foreground">
              Selv med uendelig vindu vil CUBIC-respons på 0.3 % tap holde throughput rundt 3 Mbps —
              under 3 % av nominell. BBR ser bort fra tap som signal og kan oppnå 80–90 % av
              nominell på samme link. Det er hvorfor Mathis-formelen er en så streng dom over
              klassisk TCP i radio-kontekst.
            </p>
          </>
        }
      />

      <Exercise
        question="En 4G-telefon flytter seg fra Tromsø sentrum til Bodø sentrum (1100 km bilfart). Beskriv hva som skjer med telefonens IP-adresse, antall håndover-hendelser underveis (anslag), og hvorfor en SSH-sesjon ikke nødvendigvis overlever turen selv om mobilkjernen prøver."
        hint="Telefonens IP eies av P-GW. Hva skjer ved tracking area updates og hvor lenge varer en radio bearer?"
        answer={
          <>
            <p>
              Telefonens IP forblir uendret hele turen — den eies av P-GW (eller UPF) som er
              sentralt plassert, mens GTP-tunnelene endrer endepunkt for hver basestasjons- bytte.
              Det er det elegante designet bak LTE-mobilitet.
            </p>
            <p className="mt-2">
              Antall håndover: 1100 km / typisk 1 km mellom celler i forsiktig dekning ≈ 1100
              celle-bytter. Med moderne CHO går de fleste gjennom på 20–50 ms hver. Total «tap»- tid
              i radio-laget: 30–60 sekunder spredt over hele turen.
            </p>
            <p className="mt-2">Hvorfor SSH likevel kan dø:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>
                Lange dekningshull (tunneler, fjell-skygger) kan vare flere minutter — TCP gir opp
                etter typisk 5–15 minutter med ingen ACK.
              </li>
              <li>
                Tracking Area Update — når du krysser fra én MME-soner til en annen, gjør telefonen
                en TAU. Hvis denne feiler eller signaleringen tar over 100 sekunder, kan radio
                bearer rives ned og IP-en endre seg.
              </li>
              <li>
                SSH har KeepAlive default på 0 (av) i mange klienter. Hvis serveren rebooter
                NAT-state, vil pakker etter dette dø stille.
              </li>
            </ul>
            <p className="mt-2 text-muted-foreground">
              Workaround: bruk mosh eller en SSH-tunnel over WireGuard. WireGuard har handover-
              vennlig roaming (klienten oppdager IP-endring og oppdaterer endpoint automatisk), og
              mosh bruker UDP med egen sekvensering og overlever korte avbrudd som SSH-over-TCP ikke
              gjør.
            </p>
          </>
        }
      />

      <Exercise
        question="Du måler en WiFi-celle og finner at airtime brukt på data er 40 %, airtime brukt på MAC-overhead (DIFS + SIFS + ACK + headers) er 35 %, og airtime brukt på faktiske kollisjoner er 25 %. Foreslå tre konkrete endringer som ville flytte balansen mot mer data."
        hint="Tenk på frame-størrelse, RTS/CTS-terskel, og hvor mange klienter konkurrerer samtidig."
        answer={
          <>
            <p>
              <strong>1. Frame-aggregation (A-MPDU):</strong> 802.11n+ samler flere små frames i én
              transmisjon med felles DIFS, backoff, og ACK. Hvis snittstørrelsen idag er 500 byte og
              vi aggregerer 4 frames, øker data-andel fra 40 % til ~65 % uten å redusere
              MAC-pålitelighet. Krever bare reconfiguration i AP og klient.
            </p>
            <p className="mt-2">
              <strong>
                2. Slå på RTS/CTS for store frames hvis hidden terminals skapte kollisjonene:
              </strong>{" "}
              25 % airtime på kollisjoner er svært høyt. Hvis dette skyldes skjulte stasjoner (sjekk
              med Wireshark om kollisjons-frequensen er korrelert med spesifikke par av stationer),
              kutter RTS/CTS de fleste. Slå på med terskel på 500–1000 byte.
            </p>
            <p className="mt-2">
              <strong>3. Bytt til 5 GHz eller del klientene mellom 2 AP-er:</strong> 25 %
              kollisjoner antyder enten skjult-terminal eller for mange aktive stationer per AP.
              Hvis SNR tillater det, dytt halvparten av klientene til 5 GHz-radio som er en separat
              luft-tid-pool. Effektivt en gratis kapasitet-dobling.
            </p>
            <p className="mt-2 text-muted-foreground">
              Hvis problemet er airtime fairness — én treg klient dominerer luft-tiden — er en
              fjerde mulighet å konfigurere AP-en til å begrense maks-MCS-tid per klient («airtime
              fairness»-funksjon i Cisco/Aruba/Ubiquiti).
            </p>
          </>
        }
      />

      <Exercise
        question="En multipath-fading-detalj: hvorfor kan flytting av en laptop 10 cm endre signal-styrken fra full til null, men flytting 10 m i samme retning ikke nødvendigvis?"
        hint="Bølge-lengde på 2.4 GHz og hva som konstruktivt vs destruktivt addering betyr."
        answer={
          <>
            <p>
              Bølge-lengde for 2.4 GHz radio er λ = c/f = 3·10⁸ / 2.4·10⁹ ≈ 12.5 cm. To bølge-kopier
              som ankommer mottakeren med en sti-lengde-forskjell på halve bølge-lengden (≈ 6.25 cm)
              er i motfase og kansellerer hverandre destruktivt. Forskjell på en hel bølge-lengde
              gir konstruktiv addering — dobbelt så sterkt signal.
            </p>
            <p className="mt-2">
              Hvis du flytter laptopen 10 cm i en retning som endrer sti-lengde-differansen mellom
              direkte bølge og en sterk refleksjon med omtrent 6 cm, går du fra konstruktiv til
              destruktiv addering — et fading-hull. Plutselig 20 dB tap.
            </p>
            <p className="mt-2">
              Men 10 m flytting endrer i prinsippet ikke bare denne ene refleksjonen — det endrer
              hele settet av refleksjoner samtidig, og du befinner deg i et nytt multipath-mønster
              med andre konstruktive/destruktive lommer. Snitt-signal-styrken er omtrent den samme
              (path loss endrer seg lite på 10 m sammenlignet med opprinnelig avstand på 20 m), bare
              med ulik lokal struktur.
            </p>
            <p className="mt-2 text-muted-foreground">
              Det er den fysiske grunnen til at «walk-around-test» ofte fungerer bedre enn
              «sitt-fast-test»: en bruker i bevegelse glir ut av et fading-hull før det blir
              merkbart. En stillesittende laptop kan bli fast i et hull og oppleve dårlig dekning
              til den flyttes.
            </p>
          </>
        }
      />
    </article>
  );
}

// ============================================================
// 7.8 — Eksamen-fokus
// ============================================================
function SectionEksamen() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="7.8" title="Eksamen-fokus" />

      <p className="text-muted-foreground">
        Komprimert oppslagsverk for kap. 7. Bruk dette etter at du har vært gjennom seksjonene
        7.1–7.6 og prøvd oppgavene i 7.7. Her samler vi formlene, tabellene, beslutningstrærne, de
        typiske fallgruvene og 5-minutter-ankeret du går gjennom rett før eksamen.
      </p>

      {/* a) CHEAT SHEET */}
      <Cheat
        tittel="Cheat sheet — kap. 7"
        items={[
          {
            label: "Path loss",
            body: (
              <>
                <p>
                  Signalstyrken faller med avstanden² i fritt rom — i dB blir det ca. −6 dB per
                  dobling av avstand. Innendørs (vegger, møbler) ligger eksponenten ofte mellom 3 og
                  5, så tapet er enda raskere. FSPL ≈ 20·log d + 20·log f + 32.45 i dB.
                </p>
                <div className="mt-2 rounded bg-background/60 p-2">
                  <CheatPathLossMiniSvg />
                </div>
              </>
            ),
          },
          {
            label: "CSMA/CA-timing",
            body: (
              <>
                <p>
                  Stasjonen venter DIFS (≈ 50 μs) etter at lufta ble stille, deretter teller den ned
                  en tilfeldig backoff-teller i slots. Mottakeren venter bare SIFS (≈ 10 μs) før den
                  sender ACK — slik at ACK alltid vinner over en ny DIFS-sender. Rekkefølge: DIFS →
                  backoff → DATA → SIFS → ACK.
                </p>
                <div className="mt-2 rounded bg-background/60 p-2">
                  <CheatCsmaCaTimingSvg />
                </div>
              </>
            ),
          },
          {
            label: "RTS/CTS",
            body: (
              <>
                <p>
                  Liten Request-To-Send fra sender + Clear-To-Send fra AP reserverer lufta før selve
                  DATA-rammen. CTS-en høres av alle som er innenfor AP-en, også de som ikke hører
                  senderen — derfor løser den hidden terminal. Brukes typisk bare for DATA over en
                  størrelse-grense (RTS-threshold), siden RTS+CTS er overhead.
                </p>
                <div className="mt-2 rounded bg-background/60 p-2">
                  <CheatRtsCtsSequenceSvg />
                </div>
              </>
            ),
          },
          {
            label: "802.11-versjoner",
            body: (
              <>
                <p>
                  a (5 GHz, OFDM, opp til 54 Mbps) · b (2.4 GHz, DSSS, 11 Mbps) · g (2.4 GHz, OFDM,
                  54 Mbps) · n (2.4/5 GHz, MIMO, opp til 600 Mbps) · ac (5 GHz, wider channels +
                  MU-MIMO, 1+ Gbps) · ax = WiFi 6 (OFDMA + spatial reuse, lavere ventetid i tette
                  miljø).
                </p>
                <div className="mt-2 rounded bg-background/60 p-2">
                  <Cheat80211TableSvg />
                </div>
              </>
            ),
          },
          {
            label: "Cellular-generasjoner",
            body: (
              <>
                <p>
                  2G: GSM (TDMA-stemme) / IS-95 (CDMA). 3G: UMTS / HSPA — pakkedata oppå
                  krets-svitsjet. 4G: LTE — OFDM nedlink, SC-FDMA opplink, all-IP kjerne (EPC). 5G:
                  NR — mm-bølger + sub-6 GHz, massiv MIMO, network slicing, kjerne 5GC.
                </p>
                <div className="mt-2 rounded bg-background/60 p-2">
                  <CellGenTimelineSvg />
                </div>
              </>
            ),
          },
          {
            label: "Mobile IP",
            body: (
              <>
                <p>
                  Home agent (HA) i hjemmenettet fanger pakker til den permanente hjemme-adressen.
                  Foreign agent (FA) i besøksnettet annonserer en care-of address (CoA). HA
                  tunnellerer pakker til CoA — som er triangle routing fordi svaret kan gå direkte
                  tilbake fra hosten til avsender uten å passere HA.
                </p>
                <div className="mt-2 rounded bg-background/60 p-2">
                  <CheatMobileIpTriangleSvg />
                </div>
              </>
            ),
          },
        ]}
      />

      {/* b) SAMMENLIGNING — CSMA/CD vs CSMA/CA */}
      <Illustration caption="CSMA/CD (kabel-buss, deteksjon) vs CSMA/CA (radio, unngåelse) — side-ved-side.">
        <CsmaCdVsCaSvg />
      </Illustration>
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          CSMA/CD (Ethernet) vs CSMA/CA (WiFi)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1.5 pr-3 font-semibold text-foreground">Dimensjon</th>
                <th className="text-left py-1.5 pr-3 font-semibold text-foreground">
                  CSMA/CD — kabel
                </th>
                <th className="text-left py-1.5 font-semibold text-foreground">CSMA/CA — radio</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 font-medium text-foreground">Kollisjons-deteksjon</td>
                <td className="py-1.5 pr-3">
                  Ja — senderen lytter mens den sender og oppdager spennings-feil på kabelen.
                </td>
                <td className="py-1.5">
                  Nei — radioen er half-duplex og drukner i sin egen utgang, kan ikke høre om noen
                  andre roper samtidig.
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 font-medium text-foreground">Strategi for unngåelse</td>
                <td className="py-1.5 pr-3">
                  Detect-and-abort: så snart kollisjonen oppdages, stopp og send jam-signal.
                </td>
                <td className="py-1.5">
                  Avoid-up-front: vent DIFS + tilfeldig backoff før hver overføring slik at to som
                  hører «klart» ikke starter samtidig.
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 font-medium text-foreground">Miljø</td>
                <td className="py-1.5 pr-3">
                  Delt elektrisk buss / hub — alle hører alle og signalet er forutsigbart.
                </td>
                <td className="py-1.5">
                  Delt radio-kanal med skygger, fading og hidden terminals — «alle hører alle»
                  gjelder ikke.
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 font-medium text-foreground">Kontroll-rammer</td>
                <td className="py-1.5 pr-3">
                  Ingen — preamble + payload + FCS er alt som trengs i en kollisjons-fri verden.
                </td>
                <td className="py-1.5">
                  Mange: Beacon, RTS, CTS, ACK, plus management-rammer for association og
                  authentication.
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 font-medium text-foreground">Bruk av ACK</td>
                <td className="py-1.5 pr-3">
                  Ingen lag-2-ACK — vellykket sending antas så lenge ingen kollisjon ble oppdaget.
                </td>
                <td className="py-1.5">
                  Hver enkelt unicast-DATA krever positiv ACK fra mottaker, ellers retransmisjon med
                  voksende backoff.
                </td>
              </tr>
              <tr>
                <td className="py-1.5 pr-3 font-medium text-foreground">Kollisjons-håndtering</td>
                <td className="py-1.5 pr-3">
                  Binær eksponentiell backoff etter abort: ny tilfeldig venting i 0..2^k slots.
                </td>
                <td className="py-1.5">
                  Manglende ACK = «antatt kollisjon»: doble CW-vinduet, trekk ny tilfeldig backoff
                  og forsøk på nytt.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* c) BESLUTNINGSTRE */}
      <Illustration caption="Beslutningstre for diagnose av trådløse problemer — start på toppen, følg svar-greinen.">
        <DiagnoseTreeSvg />
      </Illustration>

      {/* d) FALLGRUVER */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Fallgruve tittel="CSMA/CD funker IKKE i radio">
          <p>
            Mange skriver på eksamen at WiFi bruker CSMA/CD. Det er feil. Radioen er half-duplex —
            mens den sender, overdøver dens egen utgang alt annet på samme frekvens. Den kan ikke
            oppdage en kollisjon i fart, bare lese fraværet av en ACK i ettertid. Derfor er det
            CSMA/CA («collision avoidance»), ikke /CD («collision detection»).
          </p>
          <div className="mt-2 rounded bg-background/60 p-2">
            <FallgruveCsmaCdRadioSvg />
          </div>
        </Fallgruve>

        <Fallgruve tittel="TCP tolker radio-tap som congestion">
          <p>
            Når en pakke faller bort i lufta på grunn av fading eller interferens, ser TCP-senderen
            bare manglende ACK. Den antar at en kø et sted i kjernen er full og halverer cwnd. På en
            ren wireless-strekning er det helt feil reaksjon — det er ikke trengsel, bare støy.
            Resultatet er undermåls throughput på ellers ledige radio-kanaler.
          </p>
          <div className="mt-2 rounded bg-background/60 p-2">
            <FallgruveTcpInterpretSvg />
          </div>
        </Fallgruve>

        <Fallgruve tittel="WiFi-celler MÅ overlappe">
          <p>
            En vanlig misforståelse er at AP-er skal plasseres med skarpe celle-grenser. Tvert imot
            — de må overlappe nok til at en klient ser begge før den mister den første. Uten
            overlapp har du ingen «mellomperiode» der klienten kan associere til den nye AP-en, og
            håndover blir et brutalt drop-and-reconnect.
          </p>
          <div className="mt-2 rounded bg-background/60 p-2">
            <FallgruveWifiOverlapSvg />
          </div>
        </Fallgruve>

        <Fallgruve tittel="Hidden terminal kan ikke høres av senderne selv">
          <p>
            Klassisk fallgruve: «hvis A ikke hører C, så vet A jo bare ikke at den eksisterer».
            Riktig — og det er hele poenget. Begge tror lufta er klar, sender samtidig, og AP-en
            mellom dem får krasjete signaler. RTS/CTS via AP-en gjør at begge får et felles
            «opptatt-signal» de KAN høre.
          </p>
          <div className="mt-2 rounded bg-background/60 p-2">
            <HiddenTerminalSvg />
          </div>
        </Fallgruve>

        <Fallgruve tittel="Mobile IP triangle routing er ikke alltid en feil">
          <p>
            Det er fristende å se triangle routing — pakke inn må svinge innom HA, svar går rett ut
            — som ineffektivt og defekt. Men det betyr at hosten ikke trenger å fortelle hver
            samtaler om sin nye care-of address, og den slipper også å reforhandle TCP-tilkoblinger.
            Optimaliseringer som «route optimization» finnes, men de bryter den fine
            adresse-skjulingen.
          </p>
        </Fallgruve>

        <Fallgruve tittel="Soft handover er ikke en gratis upgrade">
          <p>
            Soft handover (klienten snakker med to celler samtidig en kort stund) gir sømløs
            overgang, men koster radio-ressurser i to celler samtidig og kompliserer
            nett-planlegging. Hard handover (først bryt, så koble til ny) er enklere og brukt i
            WiFi/GSM, og er ofte godt nok når avbruddet er kortere enn TCP-tidsavbruddet.
          </p>
        </Fallgruve>

        <Fallgruve tittel="dBm og dB er ikke det samme">
          <p>
            dBm er en absolutt effekt-måling referert til 1 mW: −80 dBm betyr 10⁻⁸ mW. dB alene er
            et forhold (gain eller tap). Eksamen blander dem ofte: «antennen har 15 dB» er
            ufullstendig, det skal være enten 15 dBi (gain) eller 15 dB demping. Pass på enheten.
          </p>
        </Fallgruve>

        <Fallgruve tittel="«Mer båndbredde» er ikke alltid løsningen">
          <p>
            En klient som sliter med høy ping og pakkesvinn vil ofte hjelpes mer av å bytte til en
            mindre overfylt kanal enn å oppgradere til et raskere standard. WiFi 6 hjelper lite hvis
            40 naboer deler de samme 2.4 GHz-kanalene. Spektrum-rensligheten betyr ofte mer enn rå
            link-rate.
          </p>
        </Fallgruve>
      </div>

      {/* e) 5-MINUTTER-ANKER */}
      <Illustration caption="15 visuelle kort — det totale anker-bildet før eksamen. Bla med øyet før du leser teksten.">
        <AnkerVisualGridSvg />
      </Illustration>
      <Anker
        tittel="5-minutter-anker — kjernepunkter for kap. 7"
        punkter={[
          "Radio er fundamentalt forskjellig fra kabel — half-duplex, multipath-fading, ekstern interferens og hidden terminals tvinger fram nye protokoll-mønstre.",
          "Path loss følger ca. avstand² i fritt rom (−6 dB per dobling); innendørs er eksponenten ofte 3–5 på grunn av vegger og møbler.",
          "CSMA/CA-rekkefølgen er: lytt → DIFS → backoff → DATA → SIFS → ACK. SIFS er kortere enn DIFS slik at ACK alltid vinner over et nytt forsøk.",
          "Manglende ACK i WiFi tolkes som kollisjon, og contention window dobles — binær eksponentiell backoff men på avoid-siden, ikke detect-siden.",
          "RTS/CTS løser hidden terminal ved at AP-ens CTS er hørbar for alle innenfor AP-en, også de senderne ikke hører hverandre.",
          "802.11-versjoner skiller seg på frekvensbånd, modulasjon (DSSS → OFDM → OFDMA), MIMO-spatial-streams og kanal-bredde — derav den voksende link-raten.",
          "Cellular-utviklingen går fra krets-svitsjet stemme (2G) gjennom pakkedata-overlegg (3G) til all-IP kjerne (4G LTE) og service-baserte arkitekturer + mm-bølger (5G).",
          "I LTE og 5G erstatter en pakke-svitsjet kjerne (EPC/5GC) den gamle krets-kjernen, og stemmeoverføring går som VoIP (VoLTE) over IMS.",
          "Mobile IP gir hosten en permanent hjemme-adresse + en flyttbar care-of address; HA tunnellerer trafikk inn, hosten svarer ofte direkte (triangle routing).",
          "Hard handover = «break-before-make», typisk i WiFi og GSM. Soft handover = «make-before-break», typisk i CDMA-baserte 3G-nettverk.",
          "For at en aktiv TCP-strøm skal overleve en handover må IP-adressen være stabil for de øvre lagene — derav tunnellerings-trikset i Mobile IP og GTP-tunnelene i mobilkjernen.",
          "TCP straffer radio: tap som skyldes støy ikke trengsel utløser like fullt cwnd-halvering, og en lang RTT på mobil gjør gjenoppbyggingen treig.",
          "Link-laget kan skjule radio-tap fra TCP ved aggressiv lokal retransmisjon (ARQ over WiFi/cellular), men det øker jitter og ventetid.",
          "Diagnose-rekkefølge ved trådløse problemer: signalstyrke → interferens → association/auth → ruting → øvre lag. Ikke hopp til toppen før bunnen er ryddet.",
          "Spektrum er en delt ressurs som er underlagt regulering: 2.4 GHz og 5 GHz er ulisensiert, mens cellulær bruker lisensierte bånd som operatøren har eksklusiv rett til.",
        ]}
      />

      <RelatedSlugs slugs={["kurose-kap-8"]} />
    </article>
  );
}

// ============================================================
// Eksamen-helpers
// ============================================================
function Cheat({
  tittel,
  items,
}: {
  tittel: string;
  items: { label: string; body: React.ReactNode }[];
}) {
  return (
    <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-sky-700 dark:text-sky-400 font-semibold mb-1">
        Cheat sheet
      </div>
      <div className="font-semibold text-foreground mb-2">{tittel}</div>
      <dl className="space-y-2 text-[13px]">
        {items.map((it) => (
          <div key={it.label} className="grid grid-cols-[minmax(7rem,9rem)_1fr] gap-3">
            <dt className="font-semibold text-foreground">{it.label}</dt>
            <dd className="text-muted-foreground">{it.body}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Fallgruve({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-rose-700 dark:text-rose-400 font-semibold mb-1">
        Fallgruve
      </div>
      <div className="font-semibold text-foreground mb-1">{tittel}</div>
      <div className="text-muted-foreground text-[13px] space-y-2">{children}</div>
    </div>
  );
}

function Anker({ tittel, punkter }: { tittel: string; punkter: string[] }) {
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
        5-minutter-anker
      </div>
      <div className="font-semibold text-foreground mb-2">{tittel}</div>
      <ol className="list-decimal pl-5 text-muted-foreground text-[13px] space-y-1">
        {punkter.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ol>
    </div>
  );
}

function DiagnoseTreeSvg() {
  return (
    <svg viewBox="0 0 720 460" className="w-full h-auto" role="img" aria-label="Diagnose-tre">
      {/* Rot */}
      <g>
        <rect
          x="280"
          y="10"
          width="160"
          height="38"
          rx="6"
          className="fill-brand/15 stroke-brand"
        />
        <text
          x="360"
          y="34"
          textAnchor="middle"
          className="fill-foreground text-[12px] font-semibold"
        >
          Trådløst problem?
        </text>
      </g>

      {/* Tre hovedgreiner */}
      {/* gren 1: lav throughput */}
      <line
        x1="360"
        y1="48"
        x2="120"
        y2="90"
        className="stroke-muted-foreground"
        strokeWidth="1.5"
      />
      <text x="220" y="72" className="fill-muted-foreground text-[10px]" textAnchor="middle">
        Lav throughput
      </text>
      <rect x="40" y="90" width="170" height="38" rx="6" className="fill-card stroke-border" />
      <text x="125" y="114" textAnchor="middle" className="fill-foreground text-[11px]">
        Båndbredde eller interferens?
      </text>

      <line
        x1="80"
        y1="128"
        x2="50"
        y2="170"
        className="stroke-muted-foreground"
        strokeWidth="1.5"
      />
      <line
        x1="170"
        y1="128"
        x2="200"
        y2="170"
        className="stroke-muted-foreground"
        strokeWidth="1.5"
      />
      <text x="45" y="150" className="fill-muted-foreground text-[9px]" textAnchor="middle">
        Interferens
      </text>
      <text x="205" y="150" className="fill-muted-foreground text-[9px]" textAnchor="middle">
        Båndbredde
      </text>

      <rect x="0" y="172" width="120" height="48" rx="6" className="fill-card stroke-border" />
      <text x="60" y="190" textAnchor="middle" className="fill-foreground text-[10px]">
        Bytt kanal /
      </text>
      <text x="60" y="204" textAnchor="middle" className="fill-foreground text-[10px]">
        skru på RTS/CTS /
      </text>
      <text x="60" y="216" textAnchor="middle" className="fill-foreground text-[10px]">
        flytt AP
      </text>

      <rect x="140" y="172" width="130" height="48" rx="6" className="fill-card stroke-border" />
      <text x="205" y="190" textAnchor="middle" className="fill-foreground text-[10px]">
        Skift til 5 GHz /
      </text>
      <text x="205" y="204" textAnchor="middle" className="fill-foreground text-[10px]">
        bredere kanal /
      </text>
      <text x="205" y="216" textAnchor="middle" className="fill-foreground text-[10px]">
        nyere standard
      </text>

      {/* gren 2: ingen tilkobling */}
      <line
        x1="360"
        y1="48"
        x2="360"
        y2="90"
        className="stroke-muted-foreground"
        strokeWidth="1.5"
      />
      <text x="380" y="72" className="fill-muted-foreground text-[10px]" textAnchor="start">
        Ingen tilkobling
      </text>
      <rect x="275" y="90" width="170" height="38" rx="6" className="fill-card stroke-border" />
      <text x="360" y="114" textAnchor="middle" className="fill-foreground text-[11px]">
        Association eller auth?
      </text>

      <line
        x1="320"
        y1="128"
        x2="290"
        y2="170"
        className="stroke-muted-foreground"
        strokeWidth="1.5"
      />
      <line
        x1="400"
        y1="128"
        x2="430"
        y2="170"
        className="stroke-muted-foreground"
        strokeWidth="1.5"
      />
      <text x="280" y="150" className="fill-muted-foreground text-[9px]" textAnchor="middle">
        Association
      </text>
      <text x="445" y="150" className="fill-muted-foreground text-[9px]" textAnchor="middle">
        Auth
      </text>

      <rect x="230" y="172" width="120" height="48" rx="6" className="fill-card stroke-border" />
      <text x="290" y="190" textAnchor="middle" className="fill-foreground text-[10px]">
        Sjekk SSID /
      </text>
      <text x="290" y="204" textAnchor="middle" className="fill-foreground text-[10px]">
        AP-rekkevidde /
      </text>
      <text x="290" y="216" textAnchor="middle" className="fill-foreground text-[10px]">
        beacon-frames
      </text>

      <rect x="370" y="172" width="130" height="48" rx="6" className="fill-card stroke-border" />
      <text x="435" y="190" textAnchor="middle" className="fill-foreground text-[10px]">
        Passord /
      </text>
      <text x="435" y="204" textAnchor="middle" className="fill-foreground text-[10px]">
        WPA2/3-suite /
      </text>
      <text x="435" y="216" textAnchor="middle" className="fill-foreground text-[10px]">
        RADIUS-server
      </text>

      {/* gren 3: mobilitet */}
      <line
        x1="360"
        y1="48"
        x2="600"
        y2="90"
        className="stroke-muted-foreground"
        strokeWidth="1.5"
      />
      <text x="500" y="72" className="fill-muted-foreground text-[10px]" textAnchor="middle">
        Mobil flytter seg
      </text>
      <rect x="510" y="90" width="170" height="38" rx="6" className="fill-card stroke-border" />
      <text x="595" y="114" textAnchor="middle" className="fill-foreground text-[11px]">
        Handover-problem?
      </text>

      <line
        x1="555"
        y1="128"
        x2="525"
        y2="170"
        className="stroke-muted-foreground"
        strokeWidth="1.5"
      />
      <line
        x1="635"
        y1="128"
        x2="665"
        y2="170"
        className="stroke-muted-foreground"
        strokeWidth="1.5"
      />
      <text x="515" y="150" className="fill-muted-foreground text-[9px]" textAnchor="middle">
        Hard
      </text>
      <text x="675" y="150" className="fill-muted-foreground text-[9px]" textAnchor="middle">
        Soft
      </text>

      <rect x="465" y="172" width="120" height="48" rx="6" className="fill-card stroke-border" />
      <text x="525" y="190" textAnchor="middle" className="fill-foreground text-[10px]">
        Re-associer /
      </text>
      <text x="525" y="204" textAnchor="middle" className="fill-foreground text-[10px]">
        DHCP-renew /
      </text>
      <text x="525" y="216" textAnchor="middle" className="fill-foreground text-[10px]">
        TCP retry
      </text>

      <rect x="605" y="172" width="115" height="48" rx="6" className="fill-card stroke-border" />
      <text x="662" y="190" textAnchor="middle" className="fill-foreground text-[10px]">
        Macro-diversity /
      </text>
      <text x="662" y="204" textAnchor="middle" className="fill-foreground text-[10px]">
        kombiner ramme
      </text>
      <text x="662" y="216" textAnchor="middle" className="fill-foreground text-[10px]">
        fra to celler
      </text>

      {/* Felles bunnsteg */}
      <line
        x1="360"
        y1="240"
        x2="360"
        y2="290"
        className="stroke-muted-foreground"
        strokeDasharray="4 3"
      />
      <text x="360" y="262" textAnchor="middle" className="fill-muted-foreground text-[10px]">
        Hvis fortsatt problem
      </text>
      <rect
        x="220"
        y="290"
        width="280"
        height="40"
        rx="6"
        className="fill-amber-500/10 stroke-amber-500/40"
      />
      <text
        x="360"
        y="316"
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Sjekk øvre lag: TCP CWND, DNS, MTU
      </text>

      <line
        x1="360"
        y1="330"
        x2="360"
        y2="370"
        className="stroke-muted-foreground"
        strokeDasharray="4 3"
      />
      <rect
        x="220"
        y="370"
        width="280"
        height="40"
        rx="6"
        className="fill-rose-500/10 stroke-rose-500/40"
      />
      <text
        x="360"
        y="396"
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Mål med tcpdump / iperf, ikke gjett
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
    <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-violet-700 dark:text-violet-400 font-semibold mb-1">
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

function HiddenTerminalSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      {/* Rekkevidde-sirkler */}
      <circle
        cx={120}
        cy={110}
        r={90}
        className="fill-brand/5 stroke-brand/40"
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      <circle
        cx={380}
        cy={110}
        r={90}
        className="fill-success/5 stroke-success/40"
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      {/* A */}
      <circle cx={120} cy={110} r={14} className="fill-brand stroke-foreground" strokeWidth={1.5} />
      <text x={120} y={114} textAnchor="middle" className="fill-background text-[11px] font-bold">
        A
      </text>
      <text x={120} y={138} textAnchor="middle" className="fill-foreground text-[9px]">
        rekkevidde
      </text>
      {/* C */}
      <circle
        cx={380}
        cy={110}
        r={14}
        className="fill-success stroke-foreground"
        strokeWidth={1.5}
      />
      <text x={380} y={114} textAnchor="middle" className="fill-background text-[11px] font-bold">
        C
      </text>
      <text x={380} y={138} textAnchor="middle" className="fill-foreground text-[9px]">
        rekkevidde
      </text>
      {/* AP */}
      <rect
        x={235}
        y={95}
        width={30}
        height={30}
        rx={4}
        className="fill-amber-500 stroke-foreground"
        strokeWidth={1.5}
      />
      <text x={250} y={114} textAnchor="middle" className="fill-background text-[10px] font-bold">
        AP
      </text>
      {/* Kollisjon-pil */}
      <line
        x1={134}
        y1={110}
        x2={235}
        y2={110}
        className="stroke-brand"
        strokeWidth={2}
        markerEnd="url(#arrow-brand)"
      />
      <line
        x1={366}
        y1={110}
        x2={265}
        y2={110}
        className="stroke-success"
        strokeWidth={2}
        markerEnd="url(#arrow-success)"
      />
      <defs>
        <marker
          id="arrow-brand"
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-brand" />
        </marker>
        <marker
          id="arrow-success"
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-success" />
        </marker>
      </defs>
      {/* Eksplosjon */}
      <text x={250} y={80} textAnchor="middle" className="fill-destructive text-[14px] font-bold">
        💥
      </text>
      <text x={250} y={70} textAnchor="middle" className="fill-destructive text-[9px]">
        kollisjon
      </text>
      {/* A↔C ikke synlig */}
      <line
        x1={134}
        y1={170}
        x2={366}
        y2={170}
        className="stroke-muted-foreground/40"
        strokeWidth={1}
        strokeDasharray="2 4"
      />
      <text x={250} y={188} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        A og C kan ikke høre hverandre
      </text>
    </svg>
  );
}

function CsmaCaSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        CSMA/CA — én sender-station, suksessfull frame
      </text>
      {/* Tidsakse */}
      <line x1={20} y1={120} x2={480} y2={120} className="stroke-foreground/60" strokeWidth={1.5} />
      <text x={485} y={124} className="fill-muted-foreground text-[9px]">
        tid
      </text>

      {/* Stille / busy */}
      <rect x={20} y={100} width={50} height={40} className="fill-muted/40 stroke-border" />
      <text x={45} y={124} textAnchor="middle" className="fill-foreground text-[9px]">
        opptatt
      </text>

      {/* DIFS */}
      <rect
        x={70}
        y={100}
        width={45}
        height={40}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={92} y={124} textAnchor="middle" className="fill-foreground text-[9px]">
        DIFS
      </text>
      <text x={92} y={90} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        34 μs
      </text>

      {/* Backoff slots */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect
            x={115 + i * 14}
            y={100}
            width={14}
            height={40}
            className="fill-brand/20 stroke-brand"
            strokeWidth={1}
          />
          <text
            x={115 + i * 14 + 7}
            y={124}
            textAnchor="middle"
            className="fill-foreground text-[7px]"
          >
            {i}
          </text>
        </g>
      ))}
      <text x={150} y={90} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        backoff (5 slots)
      </text>

      {/* Data frame */}
      <rect
        x={185}
        y={100}
        width={140}
        height={40}
        className="fill-success/30 stroke-success"
        strokeWidth={1.5}
      />
      <text x={255} y={124} textAnchor="middle" className="fill-foreground text-[10px]">
        DATA-frame
      </text>

      {/* SIFS */}
      <rect
        x={325}
        y={100}
        width={20}
        height={40}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={335} y={124} textAnchor="middle" className="fill-foreground text-[8px]">
        SIFS
      </text>
      <text x={335} y={90} textAnchor="middle" className="fill-muted-foreground text-[7px]">
        16 μs
      </text>

      {/* ACK */}
      <rect
        x={345}
        y={100}
        width={50}
        height={40}
        className="fill-brand/40 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={370} y={124} textAnchor="middle" className="fill-foreground text-[10px]">
        ACK
      </text>

      {/* Etter */}
      <rect x={395} y={100} width={85} height={40} className="fill-muted/40 stroke-border" />
      <text x={437} y={124} textAnchor="middle" className="fill-foreground text-[9px]">
        nytt forsøk-vindu
      </text>

      <text
        x={250}
        y={180}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] italic"
      >
        Lytt → DIFS → backoff → DATA → SIFS → ACK
      </text>
      <text x={250} y={200} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        Uteblitt ACK = retransmit + doblet backoff-vindu
      </text>
    </svg>
  );
}

function CellularTopologySvg() {
  // Hexagon helper
  const hex = (cx: number, cy: number, r: number) => {
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i + Math.PI / 6;
      pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
    }
    return pts.join(" ");
  };
  const cells = [
    { cx: 90, cy: 70, f: 1 },
    { cx: 145, cy: 105, f: 2 },
    { cx: 90, cy: 140, f: 3 },
    { cx: 200, cy: 70, f: 2 },
    { cx: 255, cy: 105, f: 1 },
    { cx: 200, cy: 140, f: 1 },
    { cx: 310, cy: 70, f: 3 },
    { cx: 255, cy: 175, f: 2 },
    { cx: 145, cy: 175, f: 1 },
  ];
  const colors = ["fill-brand/15", "fill-success/15", "fill-amber-500/15"];
  const strokes = ["stroke-brand/60", "stroke-success/60", "stroke-amber-500/60"];
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      {cells.map((c, i) => (
        <g key={i}>
          <polygon
            points={hex(c.cx, c.cy, 35)}
            className={`${colors[c.f - 1]} ${strokes[c.f - 1]}`}
            strokeWidth={1.5}
          />
          {/* Basestasjon i sentrum */}
          <circle cx={c.cx} cy={c.cy} r={3} className="fill-foreground" />
          <text x={c.cx} y={c.cy + 16} textAnchor="middle" className="fill-foreground text-[8px]">
            f{c.f}
          </text>
        </g>
      ))}
      {/* Mast */}
      <text x={90} y={210} className="fill-muted-foreground text-[9px]">
        f1, f2, f3 = ulike frekvens-grupper
      </text>
      {/* Kjerne */}
      <rect
        x={370}
        y={60}
        width={110}
        height={80}
        rx={8}
        className="fill-card stroke-brand"
        strokeWidth={1.5}
      />
      <text
        x={425}
        y={85}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Kjerne
      </text>
      <text x={425} y={100} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        EPC / 5GC
      </text>
      <text x={425} y={115} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        IP-ruting
      </text>
      <text x={425} y={130} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        autentisering
      </text>
      {/* Linker fra celler til kjerne */}
      <line
        x1={310}
        y1={70}
        x2={370}
        y2={100}
        className="stroke-muted-foreground/50"
        strokeWidth={1}
      />
      <line
        x1={255}
        y1={175}
        x2={370}
        y2={120}
        className="stroke-muted-foreground/50"
        strokeWidth={1}
      />
      {/* Internett */}
      <ellipse
        cx={425}
        cy={185}
        rx={45}
        ry={20}
        className="fill-success/15 stroke-success/60"
        strokeWidth={1.5}
      />
      <text x={425} y={189} textAnchor="middle" className="fill-foreground text-[10px]">
        Internett
      </text>
      <line x1={425} y1={140} x2={425} y2={165} className="stroke-muted-foreground/50" />
    </svg>
  );
}

function MobileIpSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Mobile IP — pakke fra korrespondent til mobil host
      </text>
      {/* Korrespondent */}
      <circle
        cx={50}
        cy={80}
        r={18}
        className="fill-amber-500 stroke-foreground"
        strokeWidth={1.5}
      />
      <text x={50} y={84} textAnchor="middle" className="fill-background text-[9px] font-bold">
        CN
      </text>
      <text x={50} y={110} textAnchor="middle" className="fill-foreground text-[9px]">
        korrespondent
      </text>
      {/* Home network */}
      <ellipse
        cx={210}
        cy={80}
        rx={55}
        ry={30}
        className="fill-brand/10 stroke-brand/60"
        strokeWidth={1.5}
      />
      <text
        x={210}
        y={50}
        textAnchor="middle"
        className="fill-brand text-[9px] uppercase tracking-wider"
      >
        home network
      </text>
      <rect
        x={195}
        y={70}
        width={30}
        height={20}
        rx={3}
        className="fill-card stroke-brand"
        strokeWidth={1.5}
      />
      <text x={210} y={84} textAnchor="middle" className="fill-foreground text-[10px]">
        HA
      </text>
      {/* Foreign network */}
      <ellipse
        cx={400}
        cy={170}
        rx={60}
        ry={35}
        className="fill-success/10 stroke-success/60"
        strokeWidth={1.5}
      />
      <text
        x={400}
        y={130}
        textAnchor="middle"
        className="fill-success text-[9px] uppercase tracking-wider"
      >
        foreign network
      </text>
      <rect
        x={355}
        y={160}
        width={30}
        height={20}
        rx={3}
        className="fill-card stroke-success"
        strokeWidth={1.5}
      />
      <text x={370} y={174} textAnchor="middle" className="fill-foreground text-[10px]">
        FA
      </text>
      <circle
        cx={430}
        cy={185}
        r={12}
        className="fill-success stroke-foreground"
        strokeWidth={1.5}
      />
      <text x={430} y={189} textAnchor="middle" className="fill-background text-[9px] font-bold">
        MN
      </text>
      <text x={430} y={208} textAnchor="middle" className="fill-foreground text-[8px]">
        mobil
      </text>
      {/* Pil 1: CN → HA */}
      <path
        d="M 70 80 Q 130 60 195 80"
        className="fill-none stroke-amber-500"
        strokeWidth={2}
        markerEnd="url(#arr1)"
      />
      <text
        x={130}
        y={50}
        textAnchor="middle"
        className="fill-amber-600 dark:fill-amber-400 text-[9px]"
      >
        ① pakke til hjem-IP
      </text>
      {/* Pil 2: HA → FA (tunnel) */}
      <path
        d="M 225 90 Q 320 110 365 165"
        className="fill-none stroke-brand"
        strokeWidth={2}
        markerEnd="url(#arr2)"
        strokeDasharray="4 3"
      />
      <text x={310} y={130} textAnchor="middle" className="fill-brand text-[9px]">
        ② tunnel (innpakket)
      </text>
      {/* Pil 3: FA → MN */}
      <path
        d="M 385 175 Q 400 180 418 184"
        className="fill-none stroke-success"
        strokeWidth={2}
        markerEnd="url(#arr3)"
      />
      <text x={395} y={210} textAnchor="middle" className="fill-success text-[9px]">
        ③ levert
      </text>
      <defs>
        <marker
          id="arr1"
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-amber-500" />
        </marker>
        <marker
          id="arr2"
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-brand" />
        </marker>
        <marker
          id="arr3"
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-success" />
        </marker>
      </defs>
    </svg>
  );
}

function HandoverSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Hard vs soft handover — tidslinje
      </text>
      {/* HARD */}
      <text x={20} y={50} className="fill-foreground text-[10px] font-semibold">
        Hard (break-before-make)
      </text>
      <rect
        x={20}
        y={60}
        width={180}
        height={25}
        className="fill-brand/40 stroke-brand"
        strokeWidth={1}
      />
      <text x={110} y={77} textAnchor="middle" className="fill-foreground text-[10px]">
        gammel BS
      </text>
      <rect
        x={200}
        y={60}
        width={30}
        height={25}
        className="fill-destructive/30 stroke-destructive"
        strokeWidth={1}
      />
      <text x={215} y={77} textAnchor="middle" className="fill-foreground text-[9px]">
        gap
      </text>
      <rect
        x={230}
        y={60}
        width={250}
        height={25}
        className="fill-success/40 stroke-success"
        strokeWidth={1}
      />
      <text x={355} y={77} textAnchor="middle" className="fill-foreground text-[10px]">
        ny BS
      </text>
      <text x={215} y={102} textAnchor="middle" className="fill-destructive text-[9px]">
        50–150 ms pakke-tap
      </text>

      {/* SOFT */}
      <text x={20} y={135} className="fill-foreground text-[10px] font-semibold">
        Soft (make-before-break)
      </text>
      <rect
        x={20}
        y={145}
        width={210}
        height={25}
        className="fill-brand/40 stroke-brand"
        strokeWidth={1}
      />
      <text x={125} y={162} textAnchor="middle" className="fill-foreground text-[10px]">
        gammel BS
      </text>
      <rect
        x={170}
        y={172}
        width={120}
        height={25}
        className="fill-amber-500/40 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={230} y={189} textAnchor="middle" className="fill-foreground text-[9px]">
        overlapp (begge aktive)
      </text>
      <rect
        x={230}
        y={145}
        width={250}
        height={25}
        className="fill-success/40 stroke-success"
        strokeWidth={1}
      />
      <text x={355} y={162} textAnchor="middle" className="fill-foreground text-[10px]">
        ny BS
      </text>
    </svg>
  );
}

function TcpWirelessSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Hvor pakker går tapt — og hvordan TCP tolker det
      </text>
      {/* Sender */}
      <rect
        x={30}
        y={100}
        width={60}
        height={40}
        rx={4}
        className="fill-card stroke-brand"
        strokeWidth={1.5}
      />
      <text x={60} y={124} textAnchor="middle" className="fill-foreground text-[10px]">
        sender
      </text>
      {/* Kabel-strekning */}
      <line x1={90} y1={120} x2={200} y2={120} className="stroke-foreground/70" strokeWidth={3} />
      <text x={145} y={110} textAnchor="middle" className="fill-foreground text-[9px]">
        kabel
      </text>
      <text x={145} y={140} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        tap = congestion
      </text>
      {/* Ruter */}
      <rect
        x={200}
        y={100}
        width={50}
        height={40}
        rx={4}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={225} y={124} textAnchor="middle" className="fill-foreground text-[10px]">
        kø
      </text>
      {/* Radio-strekning */}
      <path
        d="M 250 120 Q 280 105 310 120 Q 340 135 370 120"
        className="fill-none stroke-success"
        strokeWidth={3}
      />
      <text x={310} y={105} textAnchor="middle" className="fill-foreground text-[9px]">
        radio
      </text>
      <text x={310} y={143} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        tap = støy / fading / handover
      </text>
      {/* Mottaker */}
      <rect
        x={370}
        y={100}
        width={60}
        height={40}
        rx={4}
        className="fill-card stroke-success"
        strokeWidth={1.5}
      />
      <text x={400} y={124} textAnchor="middle" className="fill-foreground text-[10px]">
        mottaker
      </text>
      {/* Conclusion */}
      <rect
        x={50}
        y={180}
        width={400}
        height={45}
        rx={6}
        className="fill-destructive/10 stroke-destructive/40"
        strokeWidth={1.5}
      />
      <text
        x={250}
        y={200}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        TCP ser bare «pakke tapt» — kan ikke skille årsakene
      </text>
      <text x={250} y={216} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        → halverer senderaten selv om radio-laget ikke er overbelastet
      </text>
    </svg>
  );
}

// ---------- Nye SVG-er for metafor-utvidelsen ----------

function PathLossCurveSvg() {
  // Log-skala-aktig kurve: dB-tap vs avstand
  const points: string[] = [];
  const innendørs: string[] = [];
  for (let d = 1; d <= 100; d++) {
    const x = 30 + (d / 100) * 430;
    // Fritt rom: 20·log10(d) — start ved 40 dB referanse på 1 m
    const dbFree = 40 + 20 * Math.log10(d);
    const yFree = 40 + (dbFree - 40) * 1.8;
    points.push(`${x},${yFree}`);
    // Innendørs: legg til ~5 dB ekstra per dobling
    const dbIndoor = 40 + 35 * Math.log10(d);
    const yIndoor = 40 + (dbIndoor - 40) * 1.8;
    innendørs.push(`${x},${yIndoor}`);
  }
  return (
    <svg viewBox="0 0 500 230" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Signal-svekning vs avstand (logaritmisk)
      </text>
      {/* Akser */}
      <line x1={30} y1={200} x2={470} y2={200} className="stroke-foreground/70" />
      <line x1={30} y1={40} x2={30} y2={200} className="stroke-foreground/70" />
      <text x={250} y={220} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        avstand (m, log-skala)
      </text>
      <text
        x={10}
        y={120}
        className="fill-muted-foreground text-[9px]"
        transform="rotate(-90 10 120)"
      >
        tap (dB)
      </text>
      {/* Kurver */}
      <polyline points={points.join(" ")} className="fill-none stroke-brand" strokeWidth={2} />
      <polyline
        points={innendørs.join(" ")}
        className="fill-none stroke-destructive"
        strokeWidth={2}
        strokeDasharray="4 3"
      />
      {/* Legend */}
      <line x1={320} y1={50} x2={345} y2={50} className="stroke-brand" strokeWidth={2} />
      <text x={350} y={54} className="fill-foreground text-[9px]">
        fritt rom (20·log d)
      </text>
      <line
        x1={320}
        y1={68}
        x2={345}
        y2={68}
        className="stroke-destructive"
        strokeWidth={2}
        strokeDasharray="4 3"
      />
      <text x={350} y={72} className="fill-foreground text-[9px]">
        innendørs (vegger)
      </text>
      {/* Annotering: dobler avstand */}
      <text x={250} y={170} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        hver dobling av avstand = minst 6 dB tap
      </text>
    </svg>
  );
}

function MultipathFadingSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Multipath: direkte + refleksjon → konstruktiv eller destruktiv
      </text>
      {/* Sender */}
      <circle cx={60} cy={120} r={12} className="fill-brand stroke-foreground" strokeWidth={1.5} />
      <text x={60} y={124} textAnchor="middle" className="fill-background text-[9px] font-bold">
        TX
      </text>
      {/* Vegg som reflekterer */}
      <line x1={250} y1={40} x2={250} y2={75} className="stroke-foreground/60" strokeWidth={3} />
      <text x={250} y={32} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        vegg
      </text>
      {/* Mottaker konstruktiv */}
      <circle
        cx={440}
        cy={80}
        r={12}
        className="fill-success stroke-foreground"
        strokeWidth={1.5}
      />
      <text x={440} y={84} textAnchor="middle" className="fill-background text-[9px] font-bold">
        +
      </text>
      <text x={440} y={108} textAnchor="middle" className="fill-success text-[9px]">
        konstruktiv
      </text>
      <text x={440} y={120} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        toppene møter toppene
      </text>
      {/* Mottaker destruktiv */}
      <circle
        cx={440}
        cy={180}
        r={12}
        className="fill-destructive stroke-foreground"
        strokeWidth={1.5}
      />
      <text x={440} y={184} textAnchor="middle" className="fill-background text-[9px] font-bold">
        −
      </text>
      <text x={440} y={208} textAnchor="middle" className="fill-destructive text-[9px]">
        destruktiv
      </text>
      <text x={440} y={220} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        toppene møter dalene
      </text>

      {/* Direkte-vei + reflektert-vei til konstruktiv-mottaker */}
      <line x1={72} y1={120} x2={428} y2={80} className="stroke-brand" strokeWidth={1.5} />
      <text x={250} y={100} textAnchor="middle" className="fill-brand text-[8px]">
        direkte
      </text>
      <path
        d="M 72 120 L 250 70 L 428 80"
        className="fill-none stroke-brand/70"
        strokeWidth={1.2}
        strokeDasharray="3 3"
      />
      <text x={170} y={92} textAnchor="middle" className="fill-brand text-[8px]">
        reflektert
      </text>

      {/* Direkte-vei + reflektert-vei til destruktiv-mottaker (avstand-forskjell = λ/2) */}
      <line x1={72} y1={120} x2={428} y2={180} className="stroke-destructive" strokeWidth={1.5} />
      <path
        d="M 72 120 L 250 78 L 428 180"
        className="fill-none stroke-destructive/70"
        strokeWidth={1.2}
        strokeDasharray="3 3"
      />

      {/* Mini-bølge-forklaring */}
      <text x={250} y={180} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        flytt mottaker 6 cm — sti-differansen endres med λ/2 — fra ledig til hull
      </text>
    </svg>
  );
}

function BackoffRaceSvg() {
  return (
    <svg viewBox="0 0 500 230" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Two-station backoff-løp: X trekker 5, Y trekker 9
      </text>
      {/* Felles tidsakse */}
      <line x1={20} y1={205} x2={480} y2={205} className="stroke-foreground/60" />
      <text x={485} y={209} className="fill-muted-foreground text-[9px]">
        tid
      </text>

      {/* X-rad */}
      <text x={15} y={70} className="fill-foreground text-[10px] font-semibold">
        X
      </text>
      <rect x={30} y={55} width={40} height={25} className="fill-amber-500/30 stroke-amber-500" />
      <text x={50} y={71} textAnchor="middle" className="fill-foreground text-[9px]">
        DIFS
      </text>
      {/* 5 slots for X */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={`x${i}`}>
          <rect
            x={70 + i * 16}
            y={55}
            width={16}
            height={25}
            className="fill-brand/30 stroke-brand"
          />
          <text
            x={70 + i * 16 + 8}
            y={71}
            textAnchor="middle"
            className="fill-foreground text-[8px]"
          >
            {4 - i}
          </text>
        </g>
      ))}
      <rect
        x={150}
        y={55}
        width={130}
        height={25}
        className="fill-success/40 stroke-success"
        strokeWidth={1.5}
      />
      <text x={215} y={71} textAnchor="middle" className="fill-foreground text-[10px]">
        DATA + ACK
      </text>

      {/* Y-rad */}
      <text x={15} y={130} className="fill-foreground text-[10px] font-semibold">
        Y
      </text>
      <rect x={30} y={115} width={40} height={25} className="fill-amber-500/30 stroke-amber-500" />
      <text x={50} y={131} textAnchor="middle" className="fill-foreground text-[9px]">
        DIFS
      </text>
      {/* Y teller 5 først, så fryses */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={`y${i}`}>
          <rect
            x={70 + i * 16}
            y={115}
            width={16}
            height={25}
            className="fill-brand/30 stroke-brand"
          />
          <text
            x={70 + i * 16 + 8}
            y={131}
            textAnchor="middle"
            className="fill-foreground text-[8px]"
          >
            {8 - i}
          </text>
        </g>
      ))}
      {/* Y fryses */}
      <rect
        x={150}
        y={115}
        width={130}
        height={25}
        className="fill-muted/30 stroke-foreground/40"
        strokeDasharray="3 3"
      />
      <text x={215} y={131} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Y fryser med 4 igjen
      </text>
      {/* Y fortsetter etter X */}
      {[0, 1, 2, 3].map((i) => (
        <g key={`y2${i}`}>
          <rect
            x={290 + i * 16}
            y={115}
            width={16}
            height={25}
            className="fill-brand/30 stroke-brand"
          />
          <text
            x={290 + i * 16 + 8}
            y={131}
            textAnchor="middle"
            className="fill-foreground text-[8px]"
          >
            {3 - i}
          </text>
        </g>
      ))}
      <rect
        x={354}
        y={115}
        width={120}
        height={25}
        className="fill-success/40 stroke-success"
        strokeWidth={1.5}
      />
      <text x={414} y={131} textAnchor="middle" className="fill-foreground text-[10px]">
        Y sender
      </text>

      <text x={250} y={175} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        X vant loddtrekningen; Y fullfører telte-resten etter X uten ny trekning
      </text>
    </svg>
  );
}

function CellGenTimelineSvg() {
  const gens = [
    {
      x: 50,
      label: "2G",
      year: "1991",
      tech: "TDMA + FDMA",
      core: "MSC (krets)",
      rate: "9.6 kbps",
      color: "fill-muted-foreground/30 stroke-muted-foreground",
    },
    {
      x: 150,
      label: "3G",
      year: "2001",
      tech: "CDMA / WCDMA",
      core: "GGSN (pakke)",
      rate: "2 Mbps",
      color: "fill-amber-500/30 stroke-amber-500",
    },
    {
      x: 250,
      label: "4G/LTE",
      year: "2010",
      tech: "OFDMA + MIMO",
      core: "EPC (IP)",
      rate: "100 Mbps",
      color: "fill-brand/30 stroke-brand",
    },
    {
      x: 350,
      label: "5G",
      year: "2019",
      tech: "OFDMA + mMIMO + mmWave",
      core: "5GC (skytjeneste)",
      rate: "1+ Gbps",
      color: "fill-success/30 stroke-success",
    },
  ];
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Generasjons-tidslinje: 2G → 5G
      </text>
      <line x1={30} y1={75} x2={470} y2={75} className="stroke-foreground/60" strokeWidth={2} />
      {gens.map((g, i) => (
        <g key={i}>
          <circle cx={g.x + 30} cy={75} r={14} className={g.color} strokeWidth={1.5} />
          <text
            x={g.x + 30}
            y={79}
            textAnchor="middle"
            className="fill-foreground text-[10px] font-bold"
          >
            {g.label}
          </text>
          <text
            x={g.x + 30}
            y={45}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px]"
          >
            {g.year}
          </text>
          <text x={g.x + 30} y={110} textAnchor="middle" className="fill-foreground text-[9px]">
            {g.tech}
          </text>
          <text
            x={g.x + 30}
            y={125}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px]"
          >
            {g.core}
          </text>
          <text
            x={g.x + 30}
            y={140}
            textAnchor="middle"
            className="fill-success text-[9px] font-semibold"
          >
            ≤ {g.rate}
          </text>
        </g>
      ))}
      <text x={250} y={185} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Kjernen blir flatere og mer IP-aktig for hver generasjon — tale flytter inn i pakkene
      </text>
      <text x={250} y={205} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        2G: ren stemme · 3G: data-tilbehør · 4G: all-IP · 5G: skyfunksjoner i kjernen
      </text>
    </svg>
  );
}

function GtpTunnelMobilitySvg() {
  return (
    <svg viewBox="0 0 500 230" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        GTP-tunnel: telefonens IP står stille, tunnel-endepunkt flytter seg
      </text>
      {/* Internett */}
      <ellipse
        cx={60}
        cy={120}
        rx={40}
        ry={20}
        className="fill-success/15 stroke-success/60"
        strokeWidth={1.5}
      />
      <text x={60} y={124} textAnchor="middle" className="fill-foreground text-[10px]">
        Internett
      </text>
      {/* Gateway (P-GW / UPF) */}
      <rect
        x={130}
        y={100}
        width={70}
        height={40}
        rx={4}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1.5}
      />
      <text
        x={165}
        y={118}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        P-GW / UPF
      </text>
      <text x={165} y={132} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        eier IP 10.42.0.15
      </text>
      {/* Gammel eNB */}
      <rect
        x={250}
        y={45}
        width={60}
        height={30}
        rx={4}
        className="fill-muted-foreground/30 stroke-muted-foreground"
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      <text x={280} y={64} textAnchor="middle" className="fill-foreground text-[9px]">
        eNB-A (gammel)
      </text>
      {/* Ny eNB */}
      <rect
        x={250}
        y={155}
        width={60}
        height={30}
        rx={4}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={280} y={174} textAnchor="middle" className="fill-foreground text-[9px]">
        eNB-B (ny)
      </text>
      {/* Telefon */}
      <circle
        cx={420}
        cy={170}
        r={14}
        className="fill-success stroke-foreground"
        strokeWidth={1.5}
      />
      <text x={420} y={174} textAnchor="middle" className="fill-background text-[9px] font-bold">
        📱
      </text>
      <text x={420} y={196} textAnchor="middle" className="fill-foreground text-[9px]">
        IP=10.42.0.15
      </text>
      <text x={420} y={208} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        konstant!
      </text>
      {/* Gammel tunnel */}
      <path
        d="M 200 110 Q 230 80 250 60"
        className="fill-none stroke-muted-foreground/40"
        strokeWidth={2}
        strokeDasharray="4 3"
      />
      <text x={220} y={88} className="fill-muted-foreground text-[8px]">
        gammel tunnel
      </text>
      {/* Ny tunnel */}
      <path
        d="M 200 130 Q 230 160 250 170"
        className="fill-none stroke-amber-500"
        strokeWidth={2}
      />
      <text x={220} y={158} className="fill-amber-700 dark:fill-amber-400 text-[8px]">
        ny tunnel
      </text>
      {/* Radio til telefon */}
      <path d="M 310 170 Q 360 165 405 168" className="fill-none stroke-success" strokeWidth={2} />
      <text x={355} y={158} textAnchor="middle" className="fill-success text-[8px]">
        radio
      </text>
      <line x1={100} y1={120} x2={130} y2={120} className="stroke-foreground/70" strokeWidth={2} />
    </svg>
  );
}

function HandoverHysteresisSvg() {
  // To kurver — RSRP-celle-A faller, RSRP-celle-B stiger; vis flimmer og histeresis-bytte
  const a: string[] = [];
  const b: string[] = [];
  const n = 80;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const aBase = -60 - t * 18; // -60 → -78
    const bBase = -78 + t * 18;
    const noise = Math.sin(i * 0.9) * 3;
    a.push(`${30 + t * 440},${100 + (aBase + 90) * -2 + 60 + noise * 2}`);
    b.push(`${30 + t * 440},${100 + (bBase + 90) * -2 + 60 - noise * 2}`);
  }
  return (
    <svg viewBox="0 0 500 230" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Ping-pong-demping: histeresis + Time-to-Trigger
      </text>
      <line x1={30} y1={195} x2={470} y2={195} className="stroke-foreground/60" />
      <line x1={30} y1={40} x2={30} y2={195} className="stroke-foreground/60" />
      <text x={250} y={215} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        tid
      </text>
      <text
        x={10}
        y={120}
        className="fill-muted-foreground text-[9px]"
        transform="rotate(-90 10 120)"
      >
        RSRP (dBm)
      </text>
      <polyline points={a.join(" ")} className="fill-none stroke-brand" strokeWidth={1.8} />
      <polyline points={b.join(" ")} className="fill-none stroke-success" strokeWidth={1.8} />
      {/* Bytte-punkt */}
      <line
        x1={300}
        y1={45}
        x2={300}
        y2={195}
        className="stroke-amber-500"
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      <text
        x={300}
        y={42}
        textAnchor="middle"
        className="fill-amber-600 dark:fill-amber-400 text-[9px]"
      >
        håndover (med 6 dB margin + 640 ms TTT)
      </text>
      {/* Legend */}
      <line x1={350} y1={170} x2={375} y2={170} className="stroke-brand" strokeWidth={2} />
      <text x={380} y={174} className="fill-foreground text-[9px]">
        celle A (faller)
      </text>
      <line x1={350} y1={185} x2={375} y2={185} className="stroke-success" strokeWidth={2} />
      <text x={380} y={189} className="fill-foreground text-[9px]">
        celle B (stiger)
      </text>
    </svg>
  );
}

function MathisCurveSvg() {
  // throughput = MSS / (RTT · sqrt(p) · 1.22)
  // y-skala: 0 til ca 10 Mbps
  const points: string[] = [];
  for (let i = 1; i <= 100; i++) {
    const p = (i / 10000) * 5; // tap-rate fra 0.0005 til 0.05
    const tput = (1460 * 8) / (0.06 * Math.sqrt(p) * 1.22) / 1e6; // Mbps
    const x = 30 + (i / 100) * 430;
    const y = 200 - Math.min(tput * 10, 160);
    points.push(`${x},${y}`);
  }
  return (
    <svg viewBox="0 0 500 230" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Mathis-formel: TCP-throughput ∝ 1/√p (radio = lav p, men ikke null)
      </text>
      <line x1={30} y1={200} x2={470} y2={200} className="stroke-foreground/70" />
      <line x1={30} y1={40} x2={30} y2={200} className="stroke-foreground/70" />
      <polyline points={points.join(" ")} className="fill-none stroke-brand" strokeWidth={2} />
      <text x={250} y={220} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        tap-rate p (0.05 % → 5 %)
      </text>
      <text
        x={10}
        y={120}
        className="fill-muted-foreground text-[9px]"
        transform="rotate(-90 10 120)"
      >
        throughput (Mbps)
      </text>
      {/* Annoterings-punkt: 0.3 % radio-tap → ~3 Mbps */}
      <circle cx={56} cy={170} r={4} className="fill-destructive" />
      <text x={70} y={168} className="fill-destructive text-[9px] font-semibold">
        0.3 % radio-tap → ~3 Mbps
      </text>
      <text x={70} y={180} className="fill-muted-foreground text-[8px]">
        (selv med uendelig vindu)
      </text>
      <text x={250} y={65} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        CUBIC/Reno er bundet av denne kurven — BBR omgår den
      </text>
    </svg>
  );
}

// ============================================================
// Nye SVG-er (kap. 7 — visuell tetting av cheat / fallgruver / examples / anker)
// ============================================================

function CheatPathLossMiniSvg() {
  // Mini decay-curve: free-space exp 2 vs indoor exp 4
  const free: string[] = [];
  const indoor: string[] = [];
  for (let i = 1; i <= 50; i++) {
    const d = i / 5; // 0.2 .. 10 m
    const fsLoss = 20 * Math.log10(d) + 40; // ref +40 dB offset for plot
    const inLoss = 40 * Math.log10(d) + 40;
    const x = 20 + i * 4.4;
    free.push(`${x},${130 - (80 - fsLoss) * 1.2}`);
    indoor.push(`${x},${130 - (80 - inLoss) * 1.2}`);
  }
  return (
    <svg viewBox="0 0 260 150" className="w-full h-auto" role="img" aria-label="Path loss mini">
      <text
        x={130}
        y={12}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Path loss vs avstand
      </text>
      <line x1={20} y1={130} x2={240} y2={130} className="stroke-foreground/60" />
      <line x1={20} y1={30} x2={20} y2={130} className="stroke-foreground/60" />
      <polyline points={free.join(" ")} className="fill-none stroke-brand" strokeWidth={1.6} />
      <polyline
        points={indoor.join(" ")}
        className="fill-none stroke-rose-500"
        strokeWidth={1.6}
        strokeDasharray="3 2"
      />
      <text x={130} y={146} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        avstand (log)
      </text>
      <text x={8} y={80} className="fill-muted-foreground text-[8px]" transform="rotate(-90 8 80)">
        tap (dB)
      </text>
      <line x1={170} y1={40} x2={185} y2={40} className="stroke-brand" strokeWidth={2} />
      <text x={190} y={43} className="fill-foreground text-[8px]">
        fritt rom (n=2)
      </text>
      <line
        x1={170}
        y1={52}
        x2={185}
        y2={52}
        className="stroke-rose-500"
        strokeWidth={2}
        strokeDasharray="3 2"
      />
      <text x={190} y={55} className="fill-foreground text-[8px]">
        innendørs (n=4)
      </text>
      <text x={130} y={28} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        −6 dB per dobling i fritt rom
      </text>
    </svg>
  );
}

function CheatCsmaCaTimingSvg() {
  return (
    <svg viewBox="0 0 280 110" className="w-full h-auto" role="img" aria-label="CSMA/CA timing">
      <text
        x={140}
        y={12}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        CSMA/CA-timing: DIFS · backoff · DATA · SIFS · ACK
      </text>
      <line x1={10} y1={80} x2={270} y2={80} className="stroke-foreground/60" />
      {/* DIFS */}
      <rect
        x={10}
        y={50}
        width={30}
        height={30}
        className="fill-muted-foreground/30 stroke-muted-foreground"
      />
      <text x={25} y={68} textAnchor="middle" className="fill-foreground text-[8px]">
        DIFS
      </text>
      <text x={25} y={95} textAnchor="middle" className="fill-muted-foreground text-[7px]">
        34 μs
      </text>
      {/* Backoff slots */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect
            x={40 + i * 10}
            y={50}
            width={9}
            height={30}
            className="fill-amber-500/20 stroke-amber-500"
          />
        </g>
      ))}
      <text
        x={65}
        y={45}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[8px]"
      >
        backoff (rand · 9 μs)
      </text>
      {/* DATA */}
      <rect x={90} y={50} width={90} height={30} className="fill-brand/30 stroke-brand" />
      <text x={135} y={68} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        DATA-frame
      </text>
      {/* SIFS */}
      <rect
        x={180}
        y={50}
        width={14}
        height={30}
        className="fill-muted-foreground/30 stroke-muted-foreground"
      />
      <text x={187} y={68} textAnchor="middle" className="fill-foreground text-[7px]">
        SIFS
      </text>
      <text x={187} y={95} textAnchor="middle" className="fill-muted-foreground text-[7px]">
        16 μs
      </text>
      {/* ACK */}
      <rect x={194} y={50} width={36} height={30} className="fill-success/30 stroke-success" />
      <text x={212} y={68} textAnchor="middle" className="fill-foreground text-[8px] font-semibold">
        ACK
      </text>
      <text x={140} y={105} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        SIFS &lt; DIFS — derfor vinner ACK alltid over ny sender
      </text>
    </svg>
  );
}

function CheatRtsCtsSequenceSvg() {
  return (
    <svg viewBox="0 0 280 150" className="w-full h-auto" role="img" aria-label="RTS/CTS sequence">
      <text
        x={140}
        y={12}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        RTS/CTS-sekvens
      </text>
      {/* Lifelines */}
      <text x={30} y={28} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        Sender A
      </text>
      <text x={140} y={28} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        AP
      </text>
      <text x={250} y={28} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        Skjult B
      </text>
      <line
        x1={30}
        y1={32}
        x2={30}
        y2={140}
        className="stroke-foreground/40"
        strokeDasharray="2 2"
      />
      <line
        x1={140}
        y1={32}
        x2={140}
        y2={140}
        className="stroke-foreground/40"
        strokeDasharray="2 2"
      />
      <line
        x1={250}
        y1={32}
        x2={250}
        y2={140}
        className="stroke-foreground/40"
        strokeDasharray="2 2"
      />
      {/* RTS A → AP */}
      <line
        x1={30}
        y1={45}
        x2={140}
        y2={50}
        className="stroke-brand"
        strokeWidth={1.5}
        markerEnd="url(#arr7)"
      />
      <text x={85} y={43} textAnchor="middle" className="fill-brand text-[8px]">
        RTS
      </text>
      {/* CTS AP → alle */}
      <line
        x1={140}
        y1={70}
        x2={30}
        y2={75}
        className="stroke-amber-500"
        strokeWidth={1.5}
        markerEnd="url(#arr7)"
      />
      <line
        x1={140}
        y1={70}
        x2={250}
        y2={75}
        className="stroke-amber-500"
        strokeWidth={1.5}
        markerEnd="url(#arr7)"
      />
      <text
        x={85}
        y={68}
        textAnchor="middle"
        className="fill-amber-600 dark:fill-amber-400 text-[8px]"
      >
        CTS
      </text>
      <text
        x={195}
        y={68}
        textAnchor="middle"
        className="fill-amber-600 dark:fill-amber-400 text-[8px]"
      >
        CTS (B hører!)
      </text>
      {/* B setter NAV */}
      <rect x={235} y={80} width={30} height={20} className="fill-rose-500/15 stroke-rose-500/50" />
      <text
        x={250}
        y={94}
        textAnchor="middle"
        className="fill-rose-700 dark:fill-rose-400 text-[7px]"
      >
        NAV-stille
      </text>
      {/* DATA */}
      <line
        x1={30}
        y1={110}
        x2={140}
        y2={115}
        className="stroke-brand"
        strokeWidth={2}
        markerEnd="url(#arr7)"
      />
      <text x={85} y={108} textAnchor="middle" className="fill-brand text-[8px] font-semibold">
        DATA
      </text>
      {/* ACK */}
      <line
        x1={140}
        y1={130}
        x2={30}
        y2={135}
        className="stroke-success"
        strokeWidth={1.5}
        markerEnd="url(#arr7)"
      />
      <text x={85} y={128} textAnchor="middle" className="fill-success text-[8px]">
        ACK
      </text>
      <defs>
        <marker
          id="arr7"
          viewBox="0 0 8 8"
          refX={7}
          refY={4}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 z" className="fill-foreground" />
        </marker>
      </defs>
    </svg>
  );
}

function Cheat80211TableSvg() {
  const rows = [
    { ver: "a", band: "5 GHz", mod: "OFDM", rate: "54 Mbps", color: "fill-muted-foreground/20" },
    { ver: "b", band: "2.4 GHz", mod: "DSSS", rate: "11 Mbps", color: "fill-muted-foreground/20" },
    { ver: "g", band: "2.4 GHz", mod: "OFDM", rate: "54 Mbps", color: "fill-muted-foreground/20" },
    { ver: "n", band: "2.4 + 5", mod: "MIMO", rate: "600 Mbps", color: "fill-amber-500/20" },
    { ver: "ac", band: "5 GHz", mod: "MU-MIMO", rate: "≥ 1 Gbps", color: "fill-brand/20" },
    {
      ver: "ax (WiFi 6)",
      band: "2.4 + 5 + 6",
      mod: "OFDMA",
      rate: "9.6 Gbps",
      color: "fill-success/20",
    },
  ];
  return (
    <svg viewBox="0 0 320 200" className="w-full h-auto" role="img" aria-label="802.11 versjoner">
      <text
        x={160}
        y={12}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        802.11-versjoner
      </text>
      {/* Header */}
      <rect x={10} y={22} width={300} height={20} className="fill-card stroke-border" />
      <text x={40} y={36} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        ver
      </text>
      <text x={110} y={36} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        bånd
      </text>
      <text x={190} y={36} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        modulasjon
      </text>
      <text x={270} y={36} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        topprate
      </text>
      {rows.map((r, i) => (
        <g key={r.ver}>
          <rect
            x={10}
            y={42 + i * 24}
            width={300}
            height={24}
            className={`${r.color} stroke-border`}
          />
          <text
            x={40}
            y={58 + i * 24}
            textAnchor="middle"
            className="fill-foreground text-[9px] font-mono"
          >
            {r.ver}
          </text>
          <text x={110} y={58 + i * 24} textAnchor="middle" className="fill-foreground text-[9px]">
            {r.band}
          </text>
          <text x={190} y={58 + i * 24} textAnchor="middle" className="fill-foreground text-[9px]">
            {r.mod}
          </text>
          <text
            x={270}
            y={58 + i * 24}
            textAnchor="middle"
            className="fill-foreground text-[9px] font-semibold"
          >
            {r.rate}
          </text>
        </g>
      ))}
      <text x={160} y={196} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        Hver generasjon: bredere kanaler + smartere modulasjon
      </text>
    </svg>
  );
}

function CheatMobileIpTriangleSvg() {
  return (
    <svg viewBox="0 0 280 170" className="w-full h-auto" role="img" aria-label="Mobile IP triangle">
      <text
        x={140}
        y={12}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Triangle routing
      </text>
      {/* Korrespondent */}
      <rect x={10} y={70} width={56} height={30} className="fill-brand/20 stroke-brand" />
      <text x={38} y={88} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        Avsender
      </text>
      <text x={38} y={108} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        i Bergen
      </text>
      {/* Home Agent */}
      <rect x={112} y={25} width={56} height={30} className="fill-amber-500/30 stroke-amber-500" />
      <text x={140} y={43} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        Home Agent
      </text>
      <text x={140} y={20} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        Tromsø (hjemme)
      </text>
      {/* Mobile */}
      <rect x={214} y={70} width={56} height={30} className="fill-success/20 stroke-success" />
      <text x={242} y={88} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        Mobil-host
      </text>
      <text x={242} y={108} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        i Bodø (COA)
      </text>
      {/* Pakke 1: avsender → HA */}
      <line
        x1={66}
        y1={80}
        x2={112}
        y2={50}
        className="stroke-brand"
        strokeWidth={1.6}
        markerEnd="url(#arr8)"
      />
      <text x={75} y={62} className="fill-brand text-[8px]">
        1. til hjem-IP
      </text>
      {/* Pakke 2: HA → mobil (tunnel) */}
      <line
        x1={168}
        y1={50}
        x2={214}
        y2={80}
        className="stroke-amber-500"
        strokeWidth={1.6}
        strokeDasharray="3 2"
        markerEnd="url(#arr8)"
      />
      <text x={195} y={62} className="fill-amber-700 dark:fill-amber-400 text-[8px]">
        2. tunnel
      </text>
      {/* Svar direkte: mobil → avsender */}
      <line
        x1={214}
        y1={95}
        x2={66}
        y2={95}
        className="stroke-success"
        strokeWidth={1.6}
        markerEnd="url(#arr8)"
      />
      <text x={140} y={108} textAnchor="middle" className="fill-success text-[8px]">
        3. svar direkte (triangle)
      </text>
      <text x={140} y={150} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        Pakke inn: avsender → HA → mobil. Svar ut: mobil → avsender.
      </text>
      <text x={140} y={162} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        Sparer halv lengde — men HA er fortsatt et omveis-anker.
      </text>
      <defs>
        <marker
          id="arr8"
          viewBox="0 0 8 8"
          refX={7}
          refY={4}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 z" className="fill-foreground" />
        </marker>
      </defs>
    </svg>
  );
}

function CsmaCdVsCaSvg() {
  return (
    <svg viewBox="0 0 560 220" className="w-full h-auto" role="img" aria-label="CSMA/CD vs CSMA/CA">
      <text
        x={280}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        CSMA/CD (kabel) vs CSMA/CA (radio) — side-ved-side
      </text>
      {/* Venstre boks: CD */}
      <rect
        x={10}
        y={25}
        width={260}
        height={185}
        rx={6}
        className="fill-brand/5 stroke-brand/40"
      />
      <text
        x={140}
        y={42}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        CSMA/CD — Ethernet-buss
      </text>
      {/* Buss */}
      <line x1={30} y1={90} x2={250} y2={90} className="stroke-foreground/80" strokeWidth={2} />
      <circle cx={70} cy={90} r={6} className="fill-brand stroke-foreground" />
      <text x={70} y={108} textAnchor="middle" className="fill-foreground text-[9px]">
        A
      </text>
      <circle cx={140} cy={90} r={6} className="fill-brand stroke-foreground" />
      <text x={140} y={108} textAnchor="middle" className="fill-foreground text-[9px]">
        B
      </text>
      <circle cx={210} cy={90} r={6} className="fill-brand stroke-foreground" />
      <text x={210} y={108} textAnchor="middle" className="fill-foreground text-[9px]">
        C
      </text>
      {/* Kollisjon vises */}
      <path
        d="M 70 90 L 210 90"
        className="stroke-rose-500"
        strokeWidth={3}
        strokeDasharray="4 2"
      />
      <text
        x={140}
        y={78}
        textAnchor="middle"
        className="fill-rose-600 dark:fill-rose-400 text-[8px] font-semibold"
      >
        kollisjon = spennings-spike
      </text>
      <text x={140} y={130} textAnchor="middle" className="fill-foreground text-[9px]">
        Senderen LYTTER mens den sender
      </text>
      <text x={140} y={144} textAnchor="middle" className="fill-foreground text-[9px]">
        → detekterer kollisjon, aborterer
      </text>
      <text x={140} y={162} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        Strategi: <tspan className="fill-brand font-semibold">detect-and-abort</tspan>
      </text>
      <text x={140} y={176} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        Ingen lag-2 ACK trengs
      </text>
      <text x={140} y={195} textAnchor="middle" className="fill-success text-[8px] font-semibold">
        ✓ alle hører alle, signal forutsigbart
      </text>

      {/* Høyre boks: CA */}
      <rect
        x={290}
        y={25}
        width={260}
        height={185}
        rx={6}
        className="fill-amber-500/5 stroke-amber-500/40"
      />
      <text
        x={420}
        y={42}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        CSMA/CA — WiFi-radio
      </text>
      {/* AP i midten */}
      <rect x={400} y={80} width={40} height={20} className="fill-amber-500/30 stroke-amber-500" />
      <text x={420} y={94} textAnchor="middle" className="fill-foreground text-[8px] font-semibold">
        AP
      </text>
      {/* Klienter */}
      <circle cx={320} cy={90} r={6} className="fill-amber-500/40 stroke-foreground" />
      <text x={320} y={108} textAnchor="middle" className="fill-foreground text-[9px]">
        A
      </text>
      <circle cx={520} cy={90} r={6} className="fill-amber-500/40 stroke-foreground" />
      <text x={520} y={108} textAnchor="middle" className="fill-foreground text-[9px]">
        C
      </text>
      {/* Rekkevidde-stiplet */}
      <circle
        cx={320}
        cy={90}
        r={45}
        className="fill-none stroke-amber-500/40"
        strokeDasharray="2 2"
      />
      <circle
        cx={520}
        cy={90}
        r={45}
        className="fill-none stroke-amber-500/40"
        strokeDasharray="2 2"
      />
      <text
        x={420}
        y={70}
        textAnchor="middle"
        className="fill-rose-600 dark:fill-rose-400 text-[8px]"
      >
        A og C hører ikke hverandre!
      </text>
      <text x={420} y={130} textAnchor="middle" className="fill-foreground text-[9px]">
        Half-duplex: kan IKKE lytte
      </text>
      <text x={420} y={144} textAnchor="middle" className="fill-foreground text-[9px]">
        mens den sender → ingen detect
      </text>
      <text x={420} y={162} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        Strategi:{" "}
        <tspan className="fill-amber-700 dark:fill-amber-400 font-semibold">
          avoid-up-front (backoff)
        </tspan>
      </text>
      <text x={420} y={176} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        Hver DATA krever positiv ACK
      </text>
      <text
        x={420}
        y={195}
        textAnchor="middle"
        className="fill-rose-600 dark:fill-rose-400 text-[8px] font-semibold"
      >
        ✗ hidden terminals, fading, støy
      </text>
    </svg>
  );
}

function AnkerVisualGridSvg() {
  // 15 mini-kort, 5 kolonner × 3 rader
  const cards: { ic: string; t: string; sub: string }[] = [
    { ic: "📡", t: "Radio ≠ kabel", sub: "half-duplex, fading" },
    { ic: "📉", t: "Path loss", sub: "−6 dB / dobling" },
    { ic: "⏱", t: "CSMA/CA", sub: "DIFS → backoff → DATA → SIFS → ACK" },
    { ic: "🔁", t: "Mistet ACK", sub: "CW dobles, prøv igjen" },
    { ic: "🛡", t: "RTS/CTS", sub: "AP løser hidden terminal" },
    { ic: "📶", t: "802.11-evo", sub: "DSSS→OFDM→OFDMA + MIMO" },
    { ic: "📞", t: "Cellular 2G→5G", sub: "krets→pakke→all-IP" },
    { ic: "🏗", t: "LTE/5G-kjerne", sub: "EPC/5GC, pakke-svitsjet" },
    { ic: "🏠", t: "Mobile IP", sub: "hjem-IP + COA + tunnel" },
    { ic: "🤝", t: "Hard vs soft", sub: "break-vs-make-before-break" },
    { ic: "🔗", t: "Stabil IP", sub: "tunnel-endepunkt flytter" },
    { ic: "⚠", t: "TCP straffer radio", sub: "tap ≠ alltid congestion" },
    { ic: "🛡", t: "Lokal ARQ", sub: "skjuler tap, øker jitter" },
    { ic: "🔍", t: "Diagnose", sub: "signal → interferens → auth → øvre" },
    { ic: "📜", t: "Spektrum", sub: "2.4/5 GHz ulisensiert · cell lisensiert" },
  ];
  return (
    <svg viewBox="0 0 560 240" className="w-full h-auto" role="img" aria-label="15-punkts anker">
      <text
        x={280}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        15-punkts visuelt anker — kap. 7
      </text>
      {cards.map((c, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const x = 10 + col * 110;
        const y = 24 + row * 70;
        return (
          <g key={i}>
            <rect x={x} y={y} width={105} height={62} rx={6} className="fill-card stroke-border" />
            <text x={x + 12} y={y + 22} className="fill-foreground text-[14px]">
              {c.ic}
            </text>
            <text x={x + 30} y={y + 22} className="fill-foreground text-[9px] font-semibold">
              {c.t}
            </text>
            <foreignObject x={x + 6} y={y + 28} width={95} height={32}>
              <div
                style={{
                  fontSize: "8px",
                  lineHeight: "1.15",
                  color: "var(--muted-foreground, #888)",
                }}
              >
                {c.sub}
              </div>
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
}

function FallgruveCsmaCdRadioSvg() {
  return (
    <svg
      viewBox="0 0 320 140"
      className="w-full h-auto"
      role="img"
      aria-label="CSMA/CD virker ikke i radio"
    >
      <text
        x={160}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        CSMA/CD i radio — fysisk umulig
      </text>
      {/* Radio med stor utgang */}
      <circle cx={80} cy={75} r={20} className="fill-rose-500/30 stroke-rose-500" />
      <text x={80} y={79} textAnchor="middle" className="fill-foreground text-[10px] font-bold">
        TX
      </text>
      <text x={80} y={106} textAnchor="middle" className="fill-foreground text-[9px]">
        +15 dBm
      </text>
      <text x={80} y={118} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        egen sender
      </text>
      {/* Fjern signal */}
      <circle cx={240} cy={75} r={6} className="fill-brand/40 stroke-brand" />
      <text x={240} y={106} textAnchor="middle" className="fill-foreground text-[9px]">
        −70 dBm
      </text>
      <text x={240} y={118} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        fjern frame
      </text>
      {/* Forskjell-merking */}
      <path
        d="M 100 75 L 230 75"
        className="stroke-foreground/40"
        strokeWidth={1}
        strokeDasharray="3 2"
      />
      <text
        x={165}
        y={68}
        textAnchor="middle"
        className="fill-rose-600 dark:fill-rose-400 text-[9px] font-bold"
      >
        85 dB forskjell (≈ 300 mill×)
      </text>
      {/* Stor X over hele */}
      <line x1={40} y1={30} x2={280} y2={130} className="stroke-rose-500" strokeWidth={4} />
      <line x1={40} y1={130} x2={280} y2={30} className="stroke-rose-500" strokeWidth={4} />
      <text
        x={160}
        y={134}
        textAnchor="middle"
        className="fill-rose-600 dark:fill-rose-400 text-[8px] italic"
      >
        Egen utgang drukner alt — radio MÅ være CSMA/CA
      </text>
    </svg>
  );
}

function FallgruveTcpInterpretSvg() {
  return (
    <svg
      viewBox="0 0 420 180"
      className="w-full h-auto"
      role="img"
      aria-label="TCP tolkning av tap"
    >
      <text
        x={210}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Pakketap: TCP-senderens to verdener
      </text>
      {/* Venstre: kabel */}
      <rect
        x={10}
        y={25}
        width={190}
        height={140}
        rx={6}
        className="fill-brand/5 stroke-brand/40"
      />
      <text x={105} y={42} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        Kabel: tap = full kø
      </text>
      {/* Kø-stack */}
      <rect x={45} y={55} width={20} height={12} className="fill-brand/30 stroke-brand" />
      <rect x={45} y={68} width={20} height={12} className="fill-brand/30 stroke-brand" />
      <rect x={45} y={81} width={20} height={12} className="fill-brand/30 stroke-brand" />
      <rect x={45} y={94} width={20} height={12} className="fill-brand/30 stroke-brand" />
      <text x={75} y={86} className="fill-foreground text-[8px]">
        full ruterkø
      </text>
      <text x={105} y={132} textAnchor="middle" className="fill-foreground text-[8px]">
        ↓ TCP halverer cwnd
      </text>
      <text x={105} y={148} textAnchor="middle" className="fill-success text-[8px] font-semibold">
        ✓ riktig: skap luft i køen
      </text>
      <text x={105} y={160} textAnchor="middle" className="fill-muted-foreground text-[7px] italic">
        BER 10⁻¹², radio-feil neglisjerbart
      </text>

      {/* Høyre: radio */}
      <rect
        x={215}
        y={25}
        width={195}
        height={140}
        rx={6}
        className="fill-rose-500/5 stroke-rose-500/40"
      />
      <text x={312} y={42} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        Radio: tap = støy/fading/handover
      </text>
      {/* Bølge med kantete */}
      <path
        d="M 240 80 Q 250 60 260 80 T 280 80 T 300 80 T 320 80 T 340 80 T 360 80 T 380 80"
        className="fill-none stroke-rose-500"
        strokeWidth={1.5}
      />
      <text
        x={312}
        y={102}
        textAnchor="middle"
        className="fill-rose-600 dark:fill-rose-400 text-[8px]"
      >
        BER 10⁻⁵, fading-hull
      </text>
      <text x={312} y={132} textAnchor="middle" className="fill-foreground text-[8px]">
        ↓ TCP halverer cwnd LIKE FULLT
      </text>
      <text
        x={312}
        y={148}
        textAnchor="middle"
        className="fill-rose-600 dark:fill-rose-400 text-[8px] font-semibold"
      >
        ✗ feil: lenken er ledig!
      </text>
      <text x={312} y={160} textAnchor="middle" className="fill-muted-foreground text-[7px] italic">
        Resultat: kronisk under-utnyttelse
      </text>
    </svg>
  );
}

function FallgruveWifiOverlapSvg() {
  return (
    <svg
      viewBox="0 0 460 180"
      className="w-full h-auto"
      role="img"
      aria-label="WiFi-celler må overlappe"
    >
      <text
        x={230}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        WiFi-celler MÅ overlappe — ellers brutalt drop
      </text>
      {/* Galt: ingen overlapp */}
      <text
        x={110}
        y={32}
        textAnchor="middle"
        className="fill-rose-600 dark:fill-rose-400 text-[9px] font-semibold"
      >
        ✗ Galt: skarpe grenser
      </text>
      <circle cx={60} cy={80} r={30} className="fill-amber-500/15 stroke-amber-500" />
      <text x={60} y={84} textAnchor="middle" className="fill-foreground text-[9px]">
        AP1
      </text>
      <circle cx={160} cy={80} r={30} className="fill-amber-500/15 stroke-amber-500" />
      <text x={160} y={84} textAnchor="middle" className="fill-foreground text-[9px]">
        AP2
      </text>
      {/* Død sone */}
      <rect
        x={92}
        y={70}
        width={36}
        height={20}
        className="fill-rose-500/30 stroke-rose-500"
        strokeDasharray="2 2"
      />
      <text
        x={110}
        y={84}
        textAnchor="middle"
        className="fill-rose-700 dark:fill-rose-400 text-[7px] font-bold"
      >
        død
      </text>
      {/* Klient i død sone */}
      <text x={110} y={130} textAnchor="middle" className="fill-foreground text-[14px]">
        📱
      </text>
      <text
        x={110}
        y={148}
        textAnchor="middle"
        className="fill-rose-600 dark:fill-rose-400 text-[7px]"
      >
        ingen AP → re-assoc fra null
      </text>
      <text x={110} y={160} textAnchor="middle" className="fill-muted-foreground text-[7px]">
        DHCP + auth = 2–5 sek
      </text>

      {/* Riktig: overlapp */}
      <text x={340} y={32} textAnchor="middle" className="fill-success text-[9px] font-semibold">
        ✓ Riktig: 15–20 % overlapp
      </text>
      <circle cx={300} cy={80} r={36} className="fill-success/15 stroke-success" />
      <text x={300} y={84} textAnchor="middle" className="fill-foreground text-[9px]">
        AP1
      </text>
      <circle cx={380} cy={80} r={36} className="fill-success/15 stroke-success" />
      <text x={380} y={84} textAnchor="middle" className="fill-foreground text-[9px]">
        AP2
      </text>
      {/* Overlapp-sone */}
      <ellipse cx={340} cy={80} rx={20} ry={28} className="fill-success/30 stroke-success" />
      <text x={340} y={84} textAnchor="middle" className="fill-success text-[7px] font-bold">
        begge
      </text>
      <text x={340} y={130} textAnchor="middle" className="fill-foreground text-[14px]">
        📱
      </text>
      <text x={340} y={148} textAnchor="middle" className="fill-success text-[7px]">
        ser begge — sømløs roam
      </text>
      <text x={340} y={160} textAnchor="middle" className="fill-muted-foreground text-[7px]">
        802.11r: &lt; 30 ms
      </text>
    </svg>
  );
}

function ExampleSpuriousTimeoutSvg() {
  // Tidslinje 0..280 ms — viser handover-blackout, RTO, retransmit, dup-ACK
  const ev = [
    { t: 0, lab: "SEQ=10000 sendt", color: "fill-brand" },
    { t: 1, lab: "handover starter", color: "fill-amber-500" },
    { t: 100, lab: "RTO! cwnd /2, retransmit", color: "fill-rose-500" },
    { t: 160, lab: "handover ferdig", color: "fill-amber-500" },
    { t: 220, lab: "ACK (original)", color: "fill-success" },
    { t: 280, lab: "dup-ACK (ignorert)", color: "fill-muted-foreground" },
  ];
  return (
    <svg viewBox="0 0 560 200" className="w-full h-auto" role="img" aria-label="Spurious timeout">
      <text
        x={280}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Spurious timeout under handover — tidslinje (ms)
      </text>
      {/* Axis */}
      <line x1={30} y1={120} x2={530} y2={120} className="stroke-foreground/70" strokeWidth={1.5} />
      {[0, 50, 100, 150, 200, 250, 280].map((m) => (
        <g key={m}>
          <line
            x1={30 + (m / 280) * 500}
            y1={117}
            x2={30 + (m / 280) * 500}
            y2={124}
            className="stroke-foreground/60"
          />
          <text
            x={30 + (m / 280) * 500}
            y={138}
            textAnchor="middle"
            className="fill-muted-foreground text-[8px]"
          >
            {m}
          </text>
        </g>
      ))}
      {/* Blackout-band */}
      <rect
        x={30 + (1 / 280) * 500}
        y={70}
        width={((160 - 1) / 280) * 500}
        height={40}
        className="fill-amber-500/15 stroke-amber-500/40"
      />
      <text
        x={30 + (80 / 280) * 500}
        y={66}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[8px]"
      >
        radio-blackout (1–160 ms)
      </text>
      {/* RTO-grense */}
      <line
        x1={30 + (100 / 280) * 500}
        y1={50}
        x2={30 + (100 / 280) * 500}
        y2={120}
        className="stroke-rose-500"
        strokeDasharray="3 2"
      />
      <text
        x={30 + (100 / 280) * 500}
        y={47}
        textAnchor="middle"
        className="fill-rose-600 dark:fill-rose-400 text-[8px]"
      >
        RTO = 100 ms
      </text>
      {/* Events */}
      {ev.map((e, i) => {
        const x = 30 + (e.t / 280) * 500;
        const yLab = 155 + (i % 2) * 18;
        return (
          <g key={i}>
            <circle cx={x} cy={120} r={4} className={`${e.color}`} />
            <line
              x1={x}
              y1={124}
              x2={x}
              y2={yLab - 6}
              className="stroke-foreground/40"
              strokeDasharray="1 2"
            />
            <text x={x} y={yLab} textAnchor="middle" className="fill-foreground text-[8px]">
              {e.lab}
            </text>
          </g>
        );
      })}
      <text x={280} y={195} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        cwnd ble halvert helt unødvendig — F-RTO i Linux angrer kondisjonelt
      </text>
    </svg>
  );
}

function DefSignalFadingSvg() {
  // Lite kort med signal som dør gradvis + fading-hull
  const pts: string[] = [];
  for (let i = 0; i < 60; i++) {
    const t = i / 59;
    const env = Math.exp(-t * 1.4);
    const fade = 1 - Math.abs(Math.sin(i * 0.55)) * 0.5;
    const y = 70 - env * fade * 50;
    pts.push(`${10 + t * 220},${y}`);
  }
  return (
    <svg viewBox="0 0 240 90" className="w-full h-auto" role="img" aria-label="Fading-envelope">
      <text x={120} y={12} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        Signal-amplitude vs avstand + fading
      </text>
      <line x1={10} y1={75} x2={230} y2={75} className="stroke-foreground/50" />
      <polyline points={pts.join(" ")} className="fill-none stroke-brand" strokeWidth={1.5} />
      <text x={120} y={86} textAnchor="middle" className="fill-muted-foreground text-[7px] italic">
        envelope = path loss · multipath-fade-hull
      </text>
    </svg>
  );
}
