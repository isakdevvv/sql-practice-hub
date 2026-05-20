import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  FolderOpen,
  ExternalLink,
} from "lucide-react";
import { SectionPager, type SectionNavItem } from "./SectionPager";
import { Section91Live } from "./Section91Live";
import { Section92Live } from "./Section92Live";
import { Section93Live } from "./Section93Live";
import { Section94Live } from "./Section94Live";
import { Section95Live } from "./Section95Live";
import { VisualDefs } from "./VisualDefs";
import {
  VodStreamIcon,
  VoipCallIcon,
  LiveBroadcastIcon,
  IotSensorIcon,
  CloudGamingIcon,
  JitterIcon,
  ProcJitterIcon,
  LossToleranceIcon,
  MosScoreIcon,
  GlassToGlassIcon,
  BestEffortIcon,
  CodecDialIcon,
  MpdManifestIcon,
  SegmentIcon,
  GopFramesIcon,
  BitrateLadderIcon,
  AdaptationSetIcon,
  AbrLoopIcon,
  ThroughputAbrIcon,
  BufferFillIcon,
  AbrAlgoIcon,
  OscillationIcon,
  StallIcon,
  StartupDelayIcon,
  CdnIcon,
  PcmSampleIcon,
  GCodecIcon,
  OpusIcon,
  VideoCodecIcon,
  PlcPatchIcon,
  FecIcon,
  InterleavingIcon,
  PlayoutBufferIcon,
  FixedBufferIcon,
  AdaptiveBufferIcon,
  VadIcon,
  MouthToEarIcon,
  BitFieldIcon,
  PaddingIcon,
  ExtensionIcon,
  CsrcCountIcon,
  MarkerBitIcon,
  PayloadTypeIcon,
  SeqNumIcon,
  TimestampIcon,
  SsrcIcon,
  CsrcListIcon,
  RtcpSrIcon,
  RtcpRrIcon,
  SdesIcon,
  ByeIcon,
  RtcpAppIcon,
  RtspIcon,
  SrtpIcon,
  RsvpIcon,
  SoftStateIcon,
  DiffservIcon,
  DscpIcon,
  ExpeditedIcon,
  AssuredIcon,
  BeDefaultIcon,
  MarkingIcon,
  PolicingIcon,
  ShapingIcon,
  LeakyBucketIcon,
  TokenBucketIcon,
  PriorityQueueIcon,
  WfqIcon,
  RedDropIcon,
  AdmissionIcon,
  SlaIcon,
} from "./visualDefIcons.kap9";

type Tab = "intro" | "9.1" | "9.2" | "9.3" | "9.4" | "9.5" | "9.6" | "9.7";

const SECTIONS_9: SectionNavItem[] = [
  { id: "intro", label: "Start her" },
  { id: "9.1", label: "9.1 Multimedia-apper" },
  { id: "9.2", label: "9.2 DASH" },
  { id: "9.3", label: "9.3 VoIP" },
  { id: "9.4", label: "9.4 RTP/RTSP" },
  { id: "9.5", label: "9.5 QoS" },
  { id: "9.6", label: "9.6 Oppgaver" },
  { id: "9.7", label: "9.7 Eksamen-fokus" },
];
const NEXT_CHAPTER_9 = null;

export function KuroseKap9Page() {
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
              Kap. 9 — Multimedia-nettverk
            </h1>
          </div>
          <nav className="ml-auto flex flex-wrap gap-0.5">
            <TabBtn active={tab === "intro"} onClick={() => setTab("intro")}>
              Start
            </TabBtn>
            <TabBtn active={tab === "9.1"} onClick={() => setTab("9.1")} title="Multimedia-apper">
              9.1
            </TabBtn>
            <TabBtn active={tab === "9.2"} onClick={() => setTab("9.2")} title="DASH">
              9.2
            </TabBtn>
            <TabBtn active={tab === "9.3"} onClick={() => setTab("9.3")} title="VoIP">
              9.3
            </TabBtn>
            <TabBtn active={tab === "9.4"} onClick={() => setTab("9.4")} title="RTP/RTSP">
              9.4
            </TabBtn>
            <TabBtn active={tab === "9.5"} onClick={() => setTab("9.5")} title="QoS">
              9.5
            </TabBtn>
            <TabBtn active={tab === "9.6"} onClick={() => setTab("9.6")} title="Oppgaver">
              Oppg.
            </TabBtn>
            <TabBtn active={tab === "9.7"} onClick={() => setTab("9.7")} title="Eksamen-fokus">
              Eksamen
            </TabBtn>
          </nav>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "9.1" && <Section91 />}
        {tab === "9.2" && <Section92 />}
        {tab === "9.3" && <Section93 />}
        {tab === "9.4" && <Section94 />}
        {tab === "9.5" && <Section95 />}
        {tab === "9.6" && <Section96 />}
        {tab === "9.7" && <SectionEksamen />}

        <SectionPager
          tabs={SECTIONS_9}
          current={tab}
          onPick={(id) => setTab(id as Tab)}
          nextChapter={NEXT_CHAPTER_9}
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
            Skille mellom de tre store multimedia-klassene (lagret video, sann-tids samtale, live
            streaming) og deres krav til delay, jitter og tap.
          </li>
          <li>
            Forklare hvordan DASH bruker HTTP-segmenter og en ABR-algoritme til å tilpasse bitrate
            til nett-forholdene.
          </li>
          <li>
            Beskrive hvordan VoIP håndterer pakketap og jitter via codec-valg, FEC, PLC og
            playout-buffer.
          </li>
          <li>
            Tegne RTP-headeren og forklare hva timestamp, sequence-nummer og SSRC brukes til, samt
            RTCP sin rolle som tilbakemelding.
          </li>
          <li>
            Sammenligne integrert tjenestes-modell (RSVP) med differensiert tjenestes-modell
            (DiffServ) som to ulike strategier for QoS i ruter-nettet.
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Kapittelets struktur</h2>
        <ol className="list-decimal pl-5 text-muted-foreground space-y-1">
          <li>Hva multimedia-trafikk er og hvilke krav den stiller</li>
          <li>Streaming av lagret video — DASH og adaptiv bitrate</li>
          <li>VoIP — codec, PLC og playout-buffer</li>
          <li>RTP/RTSP — transport for sann-tids media</li>
          <li>QoS — å gi visse pakker prioritet i nettet</li>
          <li>Oppgaver — regn på MOS, jitter og ABR</li>
        </ol>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => onPick("9.1")}>
            Start på 9.1 →
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 9.1 — Multimedia-applikasjoner
// ============================================================
function Section91() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="9.1" title="Multimedia-applikasjoner og deres krav" />

      <p className="text-muted-foreground">
        En fil-nedlasting bryr seg bare om at alle bytene kommer fram til slutt — rekkefølge og
        timing kan TCP fikse. Multimedia-applikasjoner er annerledes: en pakke som kommer 200 ms for
        sent er like ubrukelig som en som ikke kommer i det hele tatt. Vi deler typisk multimedia i
        tre klasser, og hver av dem har sitt eget kompromiss mellom delay, jitter og toleranse for
        tap.
      </p>

      <Section91Live />

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            {
              term: "Lagret strømmende video (Netflix, YouTube VOD)",
              icon: <VodStreamIcon />,
              body: "Ferdig på server, tåler stor oppstarts-buffer — TCP er greit.",
            },
            {
              term: "Sann-tids samtale (VoIP, video-møte)",
              icon: <VoipCallIcon />,
              body: "Under 150 ms mund-til-øre; tåler 5–10 % tap med PLC.",
            },
            {
              term: "Live streaming (sport, konsert)",
              icon: <LiveBroadcastIcon />,
              body: "Glass-to-glass 2–10 s for DASH/HLS; WebRTC under 1 s.",
            },
            {
              term: "IoT-sensor / telemetri",
              icon: <IotSensorIcon />,
              body: "Små pakker, jevnt tempo; MQTT/CoAP, 200–500 ms tåles.",
            },
            {
              term: "Sky-spill (cloud gaming)",
              icon: <CloudGamingIcon />,
              body: "Strengeste delay-krav — under 80 ms motion-to-photon.",
            },
            {
              term: "Jitter (network jitter)",
              icon: <JitterIcon />,
              body: "Variasjon i pakke-ankomster fra varierende kø-fyll.",
            },
            {
              term: "Processing jitter",
              icon: <ProcJitterIcon />,
              body: "Variasjon fra endesystem-koding/dekoding, ikke fra nettet.",
            },
            {
              term: "Tap-toleranse",
              icon: <LossToleranceIcon />,
              body: "Hvor mange % pakker som kan tapes uten hørbar forringelse.",
            },
            {
              term: "Mean Opinion Score (MOS)",
              icon: <MosScoreIcon />,
              body: "Subjektiv 1–5-skala; E-modellen estimerer fra delay+tap+jitter.",
            },
            {
              term: "End-to-end vs interaktiv delay",
              icon: <GlassToGlassIcon />,
              body: "Total tid mikrofon-til-høyttaler vs én-veis konversasjons-pause.",
            },
            {
              term: "Glass-to-glass-latens",
              icon: <GlassToGlassIcon />,
              body: "Foton-til-skjerm: koding + transport + buffering kombinert.",
            },
            {
              term: "Best-effort-kjernen",
              icon: <BestEffortIcon />,
              body: "IP gir ingen garantier — appen må håndtere variasjon selv.",
            },
            {
              term: "Codec",
              icon: <CodecDialIcon />,
              body: "Coder-decoder: komprimerer rå media til bits og tilbake.",
            },
          ]}
        />
        <Illustration caption="Krav-rom: hver applikasjons-type plassert etter delay-budsjett og tap-toleranse.">
          <RequirementsSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Illustration caption="Jitter visualisert: senderen avgir jevnt, ankomstene sprer seg.">
          <JitterMetronomeSvg />
        </Illustration>
        <Illustration caption="Ferskvare-spekteret: hvor lenge en pakke er nyttig før den blir søppel.">
          <FreshnessSpectrumSvg />
        </Illustration>
      </div>

      <Illustration caption="Tre multimedia-typer og deres latens-budsjett på logaritmisk akse.">
        <MmTypesTimebudgetSvg />
      </Illustration>

      <Metafor tittel="Live-konsert vs streaming-konsert">
        <p>
          En live-konsert på Tromsø Folkets Hus tåler ingen forsinkelse — kommer bandet 2 sekunder
          etter publikum klappet, blir tilbakeskrivningen pinlig. En streaming-konsert via YouTube
          kan derimot buffre 5 sekunder framover; publikum hjemme merker ikke at de er bakpå, så
          lenge selve filmen flyter. Det er forskjellen mellom VoIP og Netflix i ett bilde.
        </p>
      </Metafor>

      <Metafor tittel="Jitter — metronomen som hopper">
        <p>
          Tenk en metronom som skal slå 50 takter per sekund. Hvis den noen ganger slår 18 ms senere
          og andre ganger 24 ms tidligere, har den fortsatt riktig gjennomsnitt — men du klarer ikke
          holde rytmen til den. Jitter er akkurat det: gjennomsnittlig delay er kanskje fin, men
          avstanden mellom tikkene gjør at lyden blir hakkete og «tonedøv». Playout-bufferet er
          øre-proppen som jevner det ut.
        </p>
      </Metafor>

      <Metafor tittel="Ferskvare-pakker">
        <p>
          Pakker i multimedia er som havtorsk fra Senja: noen timer gamle er den fortsatt verdt mye,
          en dag gammel og den er nesten verdiløs. En VoIP-pakke som kommer 200 ms etter sin
          spille-tid er ikke «litt forsinket» — den er søppel. Det er hele grunnen til at vi velger
          UDP framfor TCP: bedre å droppe den dårlige fisken med en gang enn å vente på leveransen.
        </p>
      </Metafor>

      <Example title="Eksempel: hvorfor TCP er greit for Netflix, men ikke for samtale">
        <p>
          Anta at en TCP-pakke går tapt midt i overføringen. TCP merker det via uteblitt ACK eller
          tre dupliserte ACK-er, vente en RTO-periode (gjerne 200 ms), og retransmittere.
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>
            <strong>Netflix:</strong> spilleren har allerede bufret 30 sekunder framover. 200 ms
            pause i nedlasting merkes ikke — bufferet tærer litt, men playbacken fortsetter
            uforstyrret.
          </li>
          <li>
            <strong>Samtale:</strong> det er ingen 30-sekunders buffer (det ville være ubrukelig å
            snakke med). Pakken som kommer 200 ms for sent er for sent — vi har allerede spilt av
            stillhet på den plassen. Bedre å droppe og maskere tapet enn å vente.
          </li>
        </ul>
        <p className="mt-1 text-muted-foreground">
          Konklusjonen: streaming kan bruke TCP fordi forsinkelsen blir absorbert i bufferet;
          sann-tids samtale må bruke UDP og håndtere tap selv.
        </p>
        <TimelineNetflixVsCallSvg />
      </Example>

      <Example title="Eksempel: MOS-beregning for tre ulike forbindelser">
        <p>
          Bruk den forenklede E-modellen MOS ≈ 4.5 − 0.025·(delay_ms/10) − 0.5·loss% −
          0.02·jitter_ms (samme som i 9.6) for tre realistiske VoIP-strømmer fra Tromsø-kontoret:
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>
            Fiber til Oslo: delay 28 ms, tap 0.2 %, jitter 3 ms → 4.5 − 0.07 − 0.1 − 0.06 ≈ 4.27
            (bra)
          </li>
          <li>
            5G-mobil i Storgata: delay 65 ms, tap 1.5 %, jitter 22 ms → 4.5 − 0.16 − 0.75 − 0.44 ≈
            3.15 (akseptabel)
          </li>
          <li>
            VPN gjennom Stockholm: delay 110 ms, tap 3 %, jitter 35 ms → 4.5 − 0.27 − 1.5 − 0.7 ≈
            2.03 (dårlig)
          </li>
        </ul>
        <p className="mt-1">
          Tap-leddet vokser raskest — én eneste prosent tap kostet samme MOS-poeng som å øke delay
          med 200 ms. Det er forklaringen på hvorfor VoIP-arkitektur prioriterer codec med god PLC
          og innebygd FEC framfor å jakte på det aller laveste delayet.
        </p>
      </Example>

      <Hvorfor title="Hvorfor multimedia bruker UDP + RTP — ikke TCP — selv om det betyr at vi må håndtere tap selv">
        <p>
          TCP gjør én ting godt: leverer alle bytene i orden. For en file-overføring eller en
          DASH-segment-nedlasting er det perfekt. For en samtale er det katastrofalt. Hvis pakke 47
          forsvinner, holder TCP tilbake pakke 48, 49 og 50 i mottakerens mottaks-buffer mens den
          retransmitterer 47. Applikasjonen får ikke se 48 før 47 er på plass. Det skaper en
          «kø-forkjelling» (head-of-line blocking) som kan vare flere hundre millisekunder — lenger
          enn hele delay-budsjettet på 150 ms.
        </p>
        <p>
          UDP slipper hver pakke fram med en gang den ankommer. Applikasjonen ser pakke 48 og 49 på
          tida, oppdager at 47 mangler, og enten skjuler hullet med PLC eller rekonstruerer fra
          FEC-data. Vi bytter «alt eller ingenting» mot «det meste, akkurat i tide».
        </p>
        <p>
          RTP legges over UDP fordi UDP alene mangler sekvensnummer, tidsstempel og kilde-ID. RTP
          gir akkurat det laget, uten å innføre noen pålitelighet — og det er hele poenget. Se 9.4.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-voip-rtp"]} />
    </article>
  );
}

// ============================================================
// 9.2 — DASH
// ============================================================
function Section92() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="9.2" title="Streaming av lagret video — DASH" />

      <p className="text-muted-foreground">
        DASH (Dynamic Adaptive Streaming over HTTP) er måten YouTube, Netflix og de fleste andre
        store strømmetjenester sender video på i dag. Trikset: hugg videoen opp i korte segmenter
        (typisk 2–10 sekunder), kode hvert segment i flere bitrate-varianter, og la klienten selv
        velge hvilken variant den vil ha for hvert nye segment.
      </p>

      <Section92Live />

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            {
              term: "MPD (Media Presentation Description)",
              icon: <MpdManifestIcon />,
              body: "XML-«meny» som lister varianter, lengder og URL-mønster.",
            },
            {
              term: "Segment",
              icon: <SegmentIcon />,
              body: "Selvstendig bit video (2–10 s) som kan dekodes alene.",
            },
            {
              term: "GOP (Group of Pictures)",
              icon: <GopFramesIcon />,
              body: "I-ramme + P/B-rammer; segment må starte på I-ramme.",
            },
            {
              term: "Bitrate-varianter (representations)",
              icon: <BitrateLadderIcon />,
              body: "Samme video, N ulike kvalitetsnivåer som separate filer.",
            },
            {
              term: "Adaptation set",
              icon: <AdaptationSetIcon />,
              body: "MPD-grupper relaterte varianter (alle video, alle lydspor).",
            },
            {
              term: "ABR-algoritme (Adaptive Bitrate)",
              icon: <AbrLoopIcon />,
              body: "Klient-logikken som plukker bitrate per segment.",
            },
            {
              term: "Throughput-basert ABR",
              icon: <ThroughputAbrIcon />,
              body: "Måler forrige nedlasting; velger neste under estimatet.",
            },
            {
              term: "Buffer-basert ABR",
              icon: <BufferFillIcon />,
              body: "Stort buffer → hev bitrate; lite buffer → senk.",
            },
            {
              term: "BOLA",
              icon: <AbrAlgoIcon />,
              body: "Hybrid-ABR med Lyapunov-funksjon; standard i dash.js.",
            },
            {
              term: "MPC ABR (Model Predictive Control)",
              icon: <AbrAlgoIcon />,
              body: "Simulerer N segmenter framover; velger beste bane.",
            },
            {
              term: "Bitrate-oscillation",
              icon: <OscillationIcon />,
              body: "Hyppige kvalitets-bytter; dempes med EWMA eller hysterese.",
            },
            {
              term: "Stall / re-buffering",
              icon: <StallIcon />,
              body: "Buffer tomt; playback stopper. Verste brukeropplevelse.",
            },
            {
              term: "Startup delay",
              icon: <StartupDelayIcon />,
              body: "Fra play-trykk til første ramme — typisk 1–3 s.",
            },
            {
              term: "CDN (Content Delivery Network)",
              icon: <CdnIcon />,
              body: "Cache-servere nær brukeren; gjør DASH skalerbart.",
            },
          ]}
        />
        <Illustration caption="DASH-arkitekturen: server lagrer hvert segment i flere bitrater; klienten plukker per segment.">
          <DashSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Illustration caption="Stigen: hver segment-tids-luke har 4 trinn (bitrater) — ABR plukker ett trinn per luke.">
          <BitrateLadderSvg />
        </Illustration>
        <Illustration caption="Termostat-løkka: ABR måler, velger, henter, måler — på nytt for hvert segment.">
          <AbrLoopSvg />
        </Illustration>
      </div>

      <Illustration caption="Bitrate-ladder + buffer-state med lav-/høyvannmerke (NRK-eksempel).">
        <BitrateLadderBufferSvg />
      </Illustration>

      <Metafor tittel="Flytur-WiFi: filmen som krymper">
        <p>
          Du ser en film på flytur fra Tromsø til Oslo. Når flyet flyr over fjellet faller
          satellitt- forbindelsen fra 10 Mbps til 0.5 Mbps. Skjermen blir ikke svart — filmen bytter
          automatisk fra 1080p til 360p så avspillingen kan fortsette. Når flyet lander og
          kabin-WiFi-en er borte, plukker tjenesten opp 4G og kvaliteten klatrer tilbake. Det er
          DASH i naturen: bedre å se en uskarp film enn å vente.
        </p>
      </Metafor>

      <Metafor tittel="ABR som termostat">
        <p>
          En termostat i hytta måler temperaturen, sammenligner med settpunktet, og skrur opp eller
          ned ovnen. ABR gjør akkurat det samme — bare med bitrate. Den måler hvor mye båndbredde
          forrige segment fikk, sammenligner med bufferet, og velger neste bitrate. EWMA-glattingen
          er termostatens hysterese: vi vil ikke at den slår av og på 50 ganger i sekundet bare
          fordi en kald luftstrøm passerte.
        </p>
      </Metafor>

      <Metafor tittel="Bok med kapitler i flere språk">
        <p>
          MPD-en er som forsiden av en kursbok der innholdsfortegnelsen viser at kapittel 5 finnes
          på norsk, engelsk og fransk. Leseren (klienten) plukker språk per kapittel, og siden hvert
          kapittel er selvstendig (I-ramme!) kan du blande språk underveis uten å miste tråden. Det
          er sånn Netflix lar deg bytte fra norsk til engelsk lyd midt i en serie uten å laste
          filmen på nytt.
        </p>
      </Metafor>

      <Example title="Eksempel: en ABR-runde">
        <p>
          Klienten har lastet ned segment 5 i 1 Mbps-varianten. Bufferet inneholder 12 sekunder.
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>
            <strong>Måling:</strong> segmentet (4 sekunder · 1 Mbps = 4 Mb) tok 1.8 sekunder å laste
            → effektiv throughput ≈ 2.2 Mbps.
          </li>
          <li>
            <strong>Throughput-basert valg:</strong> trekk 25 % margin → 1.65 Mbps. Plukker nærmeste
            variant under: 1 Mbps. Konservativt valg.
          </li>
          <li>
            <strong>Buffer-basert vurdering:</strong> bufferet er på 12 s av maks 30 s. Komfortabel
            sone — kan tåle litt risiko. Hever til 2.5 Mbps for segment 6.
          </li>
          <li>
            <strong>Hybrid (eks. BOLA, MPC):</strong> kombinerer signalene matematisk. Velger
            kanskje 2.5 Mbps, men dropper umiddelbart til 1 Mbps hvis bufferet faller under 6
            sekunder etterpå.
          </li>
        </ul>
        <TimelineDashSegmentSvg />
      </Example>

      <Example title="Eksempel: ABR-switch under et togtunnel-scenario">
        <p>
          En passasjer på Bergensbanen ser en serie i 1080p (5 Mbps) over 4G. Toget kjører inn i
          Finsetunnelen og signalet faller fra 8 Mbps til 0.6 Mbps over 4 segmenter. Spilleren
          starter med 18 s buffer og henter 4 s-segmenter.
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>Segm. 22 (8 Mbps måle-throughput): velger 5 Mbps. Buffer = 18 s etter.</li>
          <li>
            Segm. 23 (3 Mbps måle-throughput, EWMA 6 Mbps): velger fortsatt 5 Mbps. Buffer = 16 s.
          </li>
          <li>Segm. 24 (0.8 Mbps, EWMA 3.4 Mbps): velger 2.5 Mbps. Buffer = 11 s.</li>
          <li>Segm. 25 (0.6 Mbps, EWMA 1.6 Mbps): velger 1 Mbps. Buffer = 8 s.</li>
          <li>
            Segm. 26 (0.6 Mbps fortsatt): velger 0.4 Mbps. Buffer = 7 s — har tatt unna risikoen.
          </li>
        </ul>
        <p className="mt-1">
          EWMA-glattingen (eksponentielt glidende gjennomsnitt) er det som hindrer panikk-bytte ned
          på segment 23. Buffer-fyllgraden er sikkerhets-rekkverket som avgjør at vi tør å holde 5
          Mbps på 23, men ikke på 24. Når toget kommer ut av tunnelen og throughput-en hopper
          tilbake til 8 Mbps, klatrer algoritmen oppover ett trinn av gangen — ikke i ett byks — for
          å unngå oscillation.
        </p>
      </Example>

      <Hvorfor title="Hvorfor DASH vant over de gamle RTP-baserte streaming-protokollene">
        <p>
          På 2000-tallet brukte streaming RTSP/RTP over UDP, med en dedikert server som strømmet ut
          pakker etter et planlagt skjema. Det fungerte, men hadde tre store problemer: (1)
          bedrift-brannmurer blokkerte gjerne UDP og RTP-porter, (2) hver server klarte bare noen
          tusen samtidige strømmer fordi den måtte holde per-klient-tilstand, og (3) det var ingen
          god måte å være «adaptiv» på — bitraten var bestemt av serveren.
        </p>
        <p>
          DASH snudde det hele: bruk vanlig HTTP over TCP (åpent i alle brannmurer), legg segmentene
          som statiske filer på en CDN (skalerer trivielt til millioner), og la klienten gjøre
          adapsjonen (kunne bytte bitrate fra segment til segment uten å si fra). HTTP-cache
          fungerer på vanlige web-cacher, og klienten kan hoppe i tidslinja ved å bare hente et
          annet segment. Operatørene fikk plutselig samme infrastruktur til både stillbilder, JS-er
          og video.
        </p>
        <p>
          Trade-offet er høyere glass-to-glass-delay (segmenter må først produseres, så lastes ned),
          som er grunnen til at WebRTC fortsatt vinner for sann-tids konferering — der RTP/UDP lever
          videre.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-voip-rtp"]} />
    </article>
  );
}

// ============================================================
// 9.3 — VoIP
// ============================================================
function Section93() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="9.3" title="VoIP — Voice over IP" />

      <p className="text-muted-foreground">
        VoIP betyr at samtaler kjøres som UDP-pakker over internett i stedet for over telefonnettet.
        Hver pakke representerer en liten lyd-bit (typisk 20 ms), og kjeden mikrofon → koder → UDP →
        nett → buffer → dekoder → høyttaler må holde total delay under ca. 150 ms for å føles
        naturlig.
      </p>

      <Section93Live />

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            {
              term: "Codec",
              icon: <CodecDialIcon />,
              body: "Coder-decoder: kompresjon ↔ rekonstruksjon av lyd/video.",
            },
            {
              term: "PCM (Pulse-Code Modulation)",
              icon: <PcmSampleIcon />,
              body: "Rå digital lyd: sample + kvantiser. Ingen kompresjon.",
            },
            {
              term: "G.711 (PCMU / PCMA)",
              icon: <GCodecIcon />,
              body: "Klassisk telefon-codec, 64 kbps; sårbar for tap.",
            },
            {
              term: "G.729",
              icon: <GCodecIcon />,
              body: "8 kbps CELP-tale-codec; smal båndbredde, ikke musikk.",
            },
            {
              term: "Opus",
              icon: <OpusIcon />,
              body: "Moderne åpen codec; 6–510 kbps, robust mot tap via FEC.",
            },
            {
              term: "H.264 / AVC",
              icon: <VideoCodecIcon />,
              body: "HD-video-codec; 1080p på 4–8 Mbps, universell støtte.",
            },
            {
              term: "H.265 / HEVC",
              icon: <VideoCodecIcon />,
              body: "Etterfølger; ~50 % bedre kompresjon, dyrere lisens.",
            },
            {
              term: "VP9",
              icon: <VideoCodecIcon />,
              body: "Googles åpne HEVC-konkurrent; brukt på YouTube 4K.",
            },
            {
              term: "AV1",
              icon: <VideoCodecIcon />,
              body: "Ny åpen codec; 20–30 % bedre enn HEVC, voksende utbredelse.",
            },
            {
              term: "PLC (Packet Loss Concealment)",
              icon: <PlcPatchIcon />,
              body: "Generer manglende lyd ved å gjenta/interpolere naboer.",
            },
            {
              term: "FEC (Forward Error Correction)",
              icon: <FecIcon />,
              body: "Pakk inn ekstra-data så tap kan rekonstrueres umiddelbart.",
            },
            {
              term: "Interleaving",
              icon: <InterleavingIcon />,
              body: "Sprer tap som mange små feil i stedet for ett stort hull.",
            },
            {
              term: "Fixed playout-buffer",
              icon: <FixedBufferIcon />,
              body: "Fast forsinkelse hele samtalen; enkelt, ofte suboptimalt.",
            },
            {
              term: "Adaptive playout-buffer",
              icon: <AdaptiveBufferIcon />,
              body: "Buffer ≈ middel + k·σ_jitter; vokser/krymper løpende.",
            },
            {
              term: "Playout-buffer (jitter-buffer)",
              icon: <PlayoutBufferIcon />,
              body: "Mottakerkø som jevner ut ankomst-jitter til fast takt.",
            },
            {
              term: "Silence suppression / VAD",
              icon: <VadIcon />,
              body: "Stopper sending under stillhet; sparer båndbredde.",
            },
            {
              term: "Mund-til-øre-delay (mouth-to-ear)",
              icon: <MouthToEarIcon />,
              body: "Total en-veis delay; mål: under 150 ms.",
            },
          ]}
        />
        <Illustration caption="Playout-buffer-tidslinje: pakker ankommer med jitter; bufferet jevner ut og leverer på fast takt.">
          <PlayoutBufferSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Illustration caption="PLC i praksis: senderen mister pakke 3, mottakeren limer inn en kopi av pakke 2.">
          <PlcRepairSvg />
        </Illustration>
        <Illustration caption="Codec-kompromiss: båndbredde mot kvalitet mot tap-toleranse.">
          <CodecTradeoffSvg />
        </Illustration>
      </div>

      <Illustration caption="Jitter-buffer + PLC: nettverk-ankomster glattes ut til jevn playout, tap fylles med PLC.">
        <JitterBufferPlcSvg />
      </Illustration>

      <Metafor tittel="Vannkanne som fylles før du skjenker">
        <p>
          Playout-bufferet er som en vannkanne under en utett kran. Kranen drypper ujevnt (jitter),
          men så lenge du fyller kanna først kan du skjenke i glasset i jevn strøm. Hvis kanna er
          for liten, renner den tom mellom drypp og glasset står tørrt (pakker kastes). Hvis den er
          for stor, må du vente lenge før første skjenking (mye delay). Adaptive buffere er kanner
          som vokser når kranen krangler og krymper når den er rolig.
        </p>
      </Metafor>

      <Metafor tittel="PLC — øre-hjernen vår er overraskende lett å lure">
        <p>
          Hvis du mister 20 ms av lyden i en samtale — omtrent én konsonant — kan dekoderen bare
          gjenta forrige 20 ms. Øret ditt merker det ikke fordi vokaler endrer seg sakte. Det er som
          å miste ett enkelt frame i en film: viser samme bilde to ganger i strekk og hjernen fyller
          inn. Mister du tre pakker på rad (60 ms) hører du imidlertid en metallisk «zip» — derfor
          er FEC og interleaving viktig på dårlige forbindelser.
        </p>
      </Metafor>

      <Metafor tittel="Opus vs G.711: skihopper i bakvind">
        <p>
          G.711 er en alpinløper som krever perfekt løype: ingen humper (tap), eller han faller.
          Opus er en utfor-løper med fjæring og parachute (PLC + FEC) — han tåler ujevn løype og
          kommer i mål selv om vinden snur. Det er derfor moderne VoIP velger Opus i nesten alle
          tilfeller: ikke fordi den lyder bedre i perfekt nett, men fordi den holder seg på beina
          når nettet rister.
        </p>
      </Metafor>

      <Example title="Eksempel: 60 ms playout-buffer i praksis">
        <p>
          En VoIP-samtale sender 50 pakker per sekund (20 ms talespurter). Avsender starter pakke 1
          ved t = 0, pakke 2 ved t = 20 ms, og så videre. Nettet legger til delay rundt 50 ms, pluss
          jitter opp til ±30 ms.
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>Pakke 1 ankommer t = 50 ms. Buffer i 60 ms → spilles av t = 110 ms.</li>
          <li>Pakke 2 ankommer t = 60 ms (10 ms tidlig). Spilles av t = 130 ms.</li>
          <li>Pakke 3 ankommer t = 105 ms (15 ms sent). Spilles av t = 150 ms — rakk det.</li>
          <li>
            Pakke 4 ankommer t = 175 ms (35 ms sent). Skulle spilles av t = 170. Forsinket → kastes,
            PLC-genererer.
          </li>
        </ul>
        <p className="mt-1 text-muted-foreground">
          Bufferet konverterer variabel ankomst-tid til fast avspilling-takt. Større buffer → flere
          pakker rekker fram, men mer total delay. Bytter mellom toleranse for tap og toleranse for
          delay.
        </p>
        <TimelineVoipPlayoutSvg />
      </Example>

      <Example title="Eksempel: dimensjonering av adaptiv jitter-buffer">
        <p>
          En adaptiv buffer holder den N-te persentilen av målt pakke-delay. Du har målt følgende
          ankomst-forsinkelser (i ms) for de siste 20 pakkene:
        </p>
        <p className="font-mono text-[12px]">
          42, 46, 51, 49, 44, 52, 78, 47, 50, 53, 48, 95, 49, 51, 46, 50, 110, 52, 48, 51
        </p>
        <p className="mt-1">
          Middel-delay ≈ 55.6 ms. Standardavvik (σ) ≈ 17.5 ms (dominert av outlierne 78, 95, 110).
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>
            <strong>Fast buffer på 50 ms:</strong> ville kastet pakke-7 (78 ms − 42 = 36 ms
            forsinket målt mot første pakke = OK), men pakke-12 (95 ms) og pakke-17 (110 ms) ville
            kommet for sent → 10 % tap.
          </li>
          <li>
            <strong>Adaptiv buffer = middel + 3σ ≈ 56 + 53 = 109 ms:</strong> dekker 99.7 % av
            pakker ved normalfordeling. Mund-til-øre-delay vokser fra ~110 ms til ~165 ms — over
            grensa for «behagelig», men fortsatt brukbart.
          </li>
          <li>
            <strong>Adaptiv buffer = middel + 2σ ≈ 91 ms:</strong> kompromiss. Ville fortsatt mistet
            pakke-17 (110 ms), men holdt delay rundt 150 ms.
          </li>
        </ul>
        <p className="mt-1">
          Algoritmen oppdaterer typisk σ med EWMA hver pakke og justerer buffer-størrelsen smidig
          (ikke i hopp) for å unngå hørbare tempo-endringer i avspilling.
        </p>
      </Example>

      <Hvorfor title="Hvorfor playout-bufferet er der hele kvalitets-spillet utkjempes">
        <p>
          Du kan tenke deg VoIP-mottakeren som en bil som kjører på en uforutsigbar vei. Hvert
          jitter-tilfelle er en humpe. Du har to verktøy: enten kjøre langsomt og glatt over alle
          humpene (stort buffer = mye delay), eller kjøre raskt og bryte gjennom de største humpene
          (lite buffer = pakker går tapt). Du kan ikke ha begge.
        </p>
        <p>
          Codec-valget endrer ikke det grunnleggende dilemmaet, men forskjøv balansen. G.711 har
          ingen tap-toleranse, så du må kjøre langsomt (stort buffer) for å unngå hørbare hull. Opus
          tåler 10 % tap via PLC og innebygd FEC, så du kan kjøre raskere — bufferet på 40 ms holder
          istedenfor 100 ms, og samtalen føles mer naturlig.
        </p>
        <p>
          Det er derfor Opus erstatter G.711 i alle nye systemer: ikke fordi den lyder bedre i et
          perfekt nett, men fordi den lar deg holde mund-til-øre-delay lavt selv under realistiske
          nett-forhold.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-voip-rtp"]} />
    </article>
  );
}

// ============================================================
// 9.4 — RTP/RTSP
// ============================================================
function Section94() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="9.4" title="RTP og RTCP — pakke-format for sann-tids media" />

      <p className="text-muted-foreground">
        Når vi sender lyd eller video over UDP får vi ingen sekvens-nummer, ingen tids-info, ingen
        måte å identifisere kilden hvis flere strømmer blandes. RTP (Real-time Transport Protocol,
        RFC 3550) er et tynt lag mellom applikasjonen og UDP som legger til akkurat de feltene. RTCP
        er parløpet — kontroll- og statistikk-pakker som rapporterer kvalitet underveis. SIP står
        for selve økt-oppsettet: hvordan finner Alice og Bob hverandre i utgangspunktet?
      </p>

      <Section94Live />

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            {
              term: "V — Version (2 bit)",
              icon: <BitFieldIcon />,
              body: "Versjonen, alltid 2 i dagens RTP.",
            },
            {
              term: "P — Padding (1 bit)",
              icon: <PaddingIcon />,
              body: "Hvis 1: padding-bytes på slutten, antall i siste byte.",
            },
            {
              term: "X — Extension (1 bit)",
              icon: <ExtensionIcon />,
              body: "Hvis 1: utvidelses-header etter de 12 obligatoriske bytene.",
            },
            {
              term: "CC — CSRC Count (4 bit)",
              icon: <CsrcCountIcon />,
              body: "Antall CSRC-er som følger; 0 utenom mixer-bruk.",
            },
            {
              term: "M — Marker (1 bit)",
              icon: <MarkerBitIcon />,
              body: "Codec-flagg: «her starter ramme/talespurt».",
            },
            {
              term: "PT — Payload Type (7 bit)",
              icon: <PayloadTypeIcon />,
              body: "Hvilken codec; 0=G.711µ, 8=G.711A, 96–127=dynamisk.",
            },
            {
              term: "SEQ — Sequence number (16 bit)",
              icon: <SeqNumIcon />,
              body: "Inkrementeres per pakke; oppdager tap og rekkefølge.",
            },
            {
              term: "TS — Timestamp (32 bit)",
              icon: <TimestampIcon />,
              body: "Codec-tid for når innholdet ble laget; styrer avspilling.",
            },
            {
              term: "SSRC — Synchronization Source (32 bit)",
              icon: <SsrcIcon />,
              body: "Unik kilde-ID; skiller strømmer på samme port.",
            },
            {
              term: "CSRC — Contributing Source list",
              icon: <CsrcListIcon />,
              body: "Mixer-bidrags-IDer; tom for direkte ende-til-ende.",
            },
            {
              term: "RTCP Sender Report (SR)",
              icon: <RtcpSrIcon />,
              body: "NTP-tid + RTP-ts; lar mottaker synke lyd og video.",
            },
            {
              term: "RTCP Receiver Report (RR)",
              icon: <RtcpRrIcon />,
              body: "Mottakerens målte jitter/tap/seq tilbake til sender.",
            },
            {
              term: "RTCP SDES (Source Description)",
              icon: <SdesIcon />,
              body: "CNAME + tekstlig kilde-info; obligatorisk for CNAME.",
            },
            {
              term: "RTCP BYE",
              icon: <ByeIcon />,
              body: "«Jeg forlater økten» — fjern SSRC umiddelbart.",
            },
            {
              term: "RTCP APP",
              icon: <RtcpAppIcon />,
              body: "Applikasjons-spesifikk escape hatch for utvidelser.",
            },
            {
              term: "RTSP (Real-Time Streaming Protocol)",
              icon: <RtspIcon />,
              body: "Fjernkontroll: SETUP/PLAY/PAUSE/TEARDOWN over TCP.",
            },
            {
              term: "SRTP (Secure RTP)",
              icon: <SrtpIcon />,
              body: "AES-kryptert payload + HMAC-autentisering; brukt i WebRTC.",
            },
          ]}
        />
        <Illustration caption="RTP-headerens 12 første bytes — felter mottakeren trenger for å synkronisere og oppdage tap.">
          <RtpHeaderSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Illustration caption="Audio og video bærer hver sin RTP-klokke; RTCP SR limer dem til samme NTP-tid.">
          <RtcpSyncSvg />
        </Illustration>
        <Illustration caption="Audio-mixer: tre talere mikses; CSRC-lista forteller hvem som bidro.">
          <MixerSsrcSvg />
        </Illustration>
      </div>

      <Illustration caption="RTP-felt forklart i klartekst — hva hvert felt brukes til.">
        <RtpFieldsVizSvg />
      </Illustration>

      <Metafor tittel="Filmrull med tidsstempel">
        <p>
          RTP-timestamp er som tidskoden trykt på hver rute av en gammel filmrull. Selv om noen
          ruter faller på gulvet under projeksjon, vet vi nøyaktig hvor i filmen vi er — projektøren
          plasserer dem på riktig sekund. UDP-pakker som kommer i feil rekkefølge er filmruter som
          er kommet dryssende ut av esken; SEQ + TS lar mottakeren legge dem i riktig rekkefølge
          igjen.
        </p>
      </Metafor>

      <Metafor tittel="SSRC — musiker-ID i symfoniorkester">
        <p>
          I et Zoom-møte med tre deltakere kan alle stemmene komme på samme UDP-port. SSRC er som en
          arm-binding hver musiker har på seg i orkesteret — fiolinist nummer 1, bratsj nummer 2,
          cello nummer 3. Dirigenten (mottakeren) ser armen og vet hvilket noteark stemmen skal
          mates inn i. Hvis to nye musikere vassom velger samme arm-binding, må en av dem bytte
          («SSRC collision»).
        </p>
      </Metafor>

      <Metafor tittel="RTCP — bilfører-bilder fra speedometeret">
        <p>
          RTP-pakker er som bilen som kjører, men RTCP er sjåføren som hvert femte sekund titter på
          speedometeret, GPS-en og motor-temperaturen og melder tilbake til verkstedet. Verkstedet
          kan da si «du ligger 2 km/t under fartsgrense» eller «motoren går varm — slipp gassen».
          Tilbake-meldingen er sjelden nok til ikke å forstyrre kjøringen, men hyppig nok til å
          gripe inn før det blir krise.
        </p>
      </Metafor>

      <Example title="Eksempel: tre pakker fra samme VoIP-strøm">
        <p>En klient sender pakker hver 20 ms (160 samples ved 8 kHz). Vi observerer:</p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>Pakke A: seq = 4711, ts = 8000, ssrc = 0xA1B2C3D4, pt = 0 (G.711)</li>
          <li>Pakke B: seq = 4712, ts = 8160, ssrc = 0xA1B2C3D4, pt = 0</li>
          <li>Pakke C: seq = 4714, ts = 8480, ssrc = 0xA1B2C3D4, pt = 0</li>
        </ul>
        <p className="mt-1">
          Mottakeren ser at seq 4713 mangler (timestamp ville vært 8320) — pakketap nummer én. Den
          kan enten PLC-generere 20 ms lyd der eller (hvis det er FEC i Opus) rekonstruere fra pakke
          C. RTCP RR-en som sendes hvert femte sekund vil rapportere tap-tellingen tilbake til
          sender, som da eventuelt skrur opp FEC-graden.
        </p>
        <TimelineRtpTrainSvg />
      </Example>

      <Example title="Eksempel: lyd-video-synkronisering via RTCP SR">
        <p>
          En foredragsholder sender video (SSRC 0x11111111, 90 kHz timestamp-clock) og lyd (SSRC
          0x22222222, 48 kHz Opus-clock) som to separate RTP-strømmer. Mottakeren må synke dem til
          samme lokale klokke. Hver SR-pakke gir ett par (NTP-tid, RTP-timestamp):
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>Video SR: NTP = 14:23:08.500, RTP-ts = 432_900_000</li>
          <li>Audio SR: NTP = 14:23:08.500, RTP-ts = 5_184_000</li>
        </ul>
        <p className="mt-1">
          Mottakeren leser en video-pakke med ts = 432_991_800. Diff fra video-SR: 91_800 enheter
          /90_000 Hz = 1.020 sekunder etter SR ⇒ NTP 14:23:09.520. Den finner audio-pakka med samme
          NTP ved å regne: 1.020 s · 48_000 Hz = 48_960 enheter → audio-ts ≈ 5_184_000 + 48_960 =
          5_232_960. Den audio-pakka spilles av samtidig som video-rammen. Uten SR-pakkene ville lyd
          og bilde flytte i forhold til hverandre fordi de to RTP-klokkene har forskjellige
          opprinnelses-tider.
        </p>
      </Example>

      <Hvorfor title="Hvorfor RTP-headeren legger inn akkurat disse feltene og ingenting mer">
        <p>
          Designet er minimalistisk med vilje. Hvert felt har en presis jobb mottakeren ikke kan
          gjøre uten: SEQ for å detektere tap og re-ordne, TS for å plassere i avspilling-tida, SSRC
          for å skille flere strømmer på samme port, M for «hendelse skjedde nå», PT for å vite
          dekoder. Pålitelig levering, retransmisjon, flow-control — alt det TCP gjør — er bevisst
          utelatt. Det ville ha sabotert sann-tids-egenskapen.
        </p>
        <p>
          Tilbakemeldingen er heller ikke en del av selve RTP-pakka; den ligger i RTCP-pakker som
          går sjelden (5 % av båndbredden). Det er fordi rapportering om hver pakke ville skapt en
          ACK-storm tilbake mot senderen. Med RR hvert 5. sekund får senderen god nok statistikk til
          å justere FEC eller bitrate uten å overlaste tilbakeveien.
        </p>
        <p>
          Tre-pakke-paret (RTP + RTCP-SR + RTCP-RR) er nok til å bygge en hel sann-tids-pipeline
          oppå UDP. Mer kompleksitet kunne forenkle visse ting, men ville stjålet enten båndbredde,
          delay eller fleksibilitet — derfor stoppet RFC 3550 her.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-voip-rtp"]} />
    </article>
  );
}

// ============================================================
// 9.5 — QoS
// ============================================================
function Section95() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="9.5" title="QoS — å gi visse pakker prioritet i nettet" />

      <p className="text-muted-foreground">
        Hittil har vi behandlet kjernen som «best-effort»: alle pakker er likeverdige, ruteren
        forwarder så raskt den kan, ingen får hjelp av nettverket. Det fungerer bra de fleste
        steder, men når lenker blir trange ønsker vi at en VoIP-pakke skal gå foran en stor
        nedlasting. QoS-mekanismer gir oss det.
      </p>

      <Section95Live />

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            {
              term: "Best-effort",
              icon: <BestEffortIcon />,
              body: "Én FIFO-kø per lenke; alle pakker likeverdige.",
            },
            {
              term: "IntServ / RSVP",
              icon: <RsvpIcon />,
              body: "Per-strøm reservasjon; harde garantier, skalerer dårlig.",
            },
            {
              term: "RSVP soft-state",
              icon: <SoftStateIcon />,
              body: "Reservasjon dør hvis ikke refreshet hvert 30. sekund.",
            },
            {
              term: "DiffServ",
              icon: <DiffservIcon />,
              body: "Per-klasse prioritering via DSCP-merke; skalerer godt.",
            },
            {
              term: "DSCP (Differentiated Services Code Point)",
              icon: <DscpIcon />,
              body: "6 bits i IP-header; velger Per-Hop Behavior.",
            },
            {
              term: "EF (Expedited Forwarding, DSCP 46)",
              icon: <ExpeditedIcon />,
              body: "Tids-kritisk klasse; priority-kø, lavt delay/tap.",
            },
            {
              term: "AF (Assured Forwarding)",
              icon: <AssuredIcon />,
              body: "4 klasser × 3 drop-nivåer; minimums-båndbredde garantert.",
            },
            {
              term: "BE (Best Effort, DSCP 0)",
              icon: <BeDefaultIcon />,
              body: "Default; får det som er igjen etter EF/AF.",
            },
            {
              term: "Marking",
              icon: <MarkingIcon />,
              body: "Sett DSCP ved nett-inngangen; indre rutere stoler på den.",
            },
            {
              term: "Policing",
              icon: <PolicingIcon />,
              body: "Drop/re-mark overskudd ved nett-grensa; ofte token-bucket.",
            },
            {
              term: "Shaping",
              icon: <ShapingIcon />,
              body: "Hold overskudd i kø og slipp ut jevnt; bytter tap mot delay.",
            },
            {
              term: "Leaky bucket",
              icon: <LeakyBucketIcon />,
              body: "Konstant utgangs-rate; ingen burst slipper gjennom.",
            },
            {
              term: "Token bucket",
              icon: <TokenBucketIcon />,
              body: "Burst opp til bøtte b; langtids-snitt = rate r.",
            },
            {
              term: "Priority queueing (PQ)",
              icon: <PriorityQueueIcon />,
              body: "Høy-prioritet alltid først; kan sulte lav-prioritet.",
            },
            {
              term: "WFQ (Weighted Fair Queueing)",
              icon: <WfqIcon />,
              body: "Hver kø sin vekt; ingen kø blir helt sulta ut.",
            },
            {
              term: "RED (Random Early Detection)",
              icon: <RedDropIcon />,
              body: "Drop tilfeldig pakke før full kø; bremser TCP tidlig.",
            },
            {
              term: "Admission control",
              icon: <AdmissionIcon />,
              body: "Si nei til ny strøm når nettet er fullt.",
            },
            {
              term: "SLA (Service Level Agreement)",
              icon: <SlaIcon />,
              body: "ISP-kontrakt: maks delay/tap per klasse.",
            },
          ]}
        />
        <Illustration caption="DiffServ i en ruter: pakker klassifiseres på DSCP, går i hver sin kø, scheduler velger.">
          <DiffservSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Illustration caption="Token-bucket-fysikk: tokens drypper inn med rate r; pakker forbruker n tokens hver.">
          <TokenBucketSvg />
        </Illustration>
        <Illustration caption="DSCP-merking ved nett-edge: pakken stemples med klasse-merke som indre rutere stoler på.">
          <DscpMarkSvg />
        </Illustration>
      </div>

      <Illustration caption="Token vs leaky bucket — to formgivere side-ved-side.">
        <TokenLeakySideBySideSvg />
      </Illustration>

      <Metafor tittel="Flyplassens hurtig-spor">
        <p>
          DiffServ er Tromsø lufthavns business-spor. Alle reisende går gjennom samme sikkerhets-
          kontroll, men business-class har egen kø som tømmes først. Selve flyturen og bagasjen er
          felles; bare prioriteten på rampene er forskjellig. EF-merket (DSCP 46) er
          business-billetten, BE er turist-klasse. Hvis alle plutselig hadde business-billett ville
          hurtig-sporet stå stille — derfor begrenser flyplassen (og DiffServ) hvor mange som får
          merket.
        </p>
      </Metafor>

      <Metafor tittel="Buffet-billetter — token bucket">
        <p>
          Tenk Wok Buffet i sentrum: hver gjest får én billett per minutt, men maks 30 billetter
          oppspart i lomma. Det betyr at en sulten gjest kan komme inn etter en halvtime, betale 30
          billetter på en gang og forsyne seg storstilt — men over timen ligger forbruket på akkurat
          60 billetter. Token bucket fungerer identisk: rate r er billett-utdelingen, bøtte b er
          lomme-størrelsen, og hver pakke er en tallerken som koster n billetter å fylle.
        </p>
      </Metafor>

      <Metafor tittel="Leaky bucket — hagevannings-slangen med fast trykk">
        <p>
          Leaky bucket er en hageslange som bare gir 1 liter i minuttet uansett om du skrur kranen
          full eller halvveis: vann (pakker) som kommer for fort renner over kanten og forsvinner.
          Token bucket er det samme — pluss en vanntank som kan bli full mellom skylletilfellene.
          Leaky bucket passer for VoIP (jevnt drypp er det vi vil ha); token bucket passer for fil-
          overføring (TCP vil burste opp så snart kranen åpnes).
        </p>
      </Metafor>

      <Example title="Eksempel: hjemmenett under tung opplasting">
        <p>
          Du har en VoIP-samtale samtidig som familien laster opp et stort foto-album. Begge deler
          en 50 Mbps fiber. Uten QoS havner alle pakker i samme utgangskø; foto-pakkene fyller køen
          og VoIP-pakkene venter 80–150 ms i kø før de slipper ut.
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>
            <strong>Med DSCP-merking + priority queueing</strong> i hjemmeruteren: VoIP-pakker
            merkes EF og settes i en egen kø som alltid tømmes først. Foto-opplastingen får bare
            sende når VoIP-køen er tom, men siden VoIP bruker maks 100 kbps merkes ikke
            foto-overføringen — den tar bare litt lengre tid.
          </li>
          <li>
            <strong>Med shaping på opplink</strong> begrenser ruteren foto-opplastingen til 45 Mbps.
            Det forhindrer at ISP-ens utgang-kø svulmer opp (buffer-bloat) og holder
            ende-til-ende-delay på VoIP konsekvent lav.
          </li>
        </ul>
      </Example>

      <Example title="Eksempel: token-bucket-policer regner gjennom en burst">
        <p>
          En bedrift har en SLA på 10 Mbps gjennomsnitt med burst-toleranse 1 MB. ISP-en
          implementerer dette som en token-bucket med rate r = 10 Mbps = 1.25 MB/s og
          bøtte-størrelse b = 1 MB. Bøtta starter full.
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>
            t = 0.0 s, bøtte = 1.0 MB. Pakke A på 200 KB ankommer. Tilstrekkelig — sendes. Bøtte =
            0.8 MB.
          </li>
          <li>
            t = 0.1 s, bøtte = 0.8 + 0.125 = 0.925 MB. Pakke B på 600 KB. Sendes. Bøtte = 0.325 MB.
          </li>
          <li>
            t = 0.2 s, bøtte = 0.325 + 0.125 = 0.45 MB. Pakke C på 500 KB. For lite — droppes (eller
            re-markes til BE).
          </li>
          <li>
            t = 0.5 s, bøtte = 0.45 + 0.375 = 0.825 MB. Pakke D på 400 KB. Sendes. Bøtte = 0.425 MB.
          </li>
        </ul>
        <p className="mt-1">
          Inn-raten over 0.5 sekunder var (200 + 600 + 500 + 400) / 0.5 = 3.4 MB/s = 27 Mbps.
          Policeren slapp gjennom 200 + 600 + 400 = 1.2 MB = 9.6 Mbps i samme periode — akkurat
          under SLA-en på 10 Mbps. Burst-en på 1.0 MB tillot at A og B gikk gjennom i ett (selv om B
          alene var større enn rate-en kunne dekke i 0.1 s), men da var bøtta tom og C måtte
          droppes.
        </p>
        <TimelineTokenBucketSvg />
      </Example>

      <Hvorfor title="Hvorfor DiffServ utkonkurrerte IntServ — selv om IntServ teknisk gir hardere garantier">
        <p>
          IntServ via RSVP er teoretisk overlegen: hver flow får eksklusiv båndbredde-reservasjon,
          ingen overraskelser. Problemet er at en stor ruter i et ISP-kjernen håndterer
          hundretusenvis av flows samtidig. Den må holde tilstand per flow — RSVP-melding inn,
          sjekke hva det er, oppdatere reservasjonen, periodisk refresh — og det skalerer kvadratisk
          dårlig. CPU-en blir flaskehalsen lenge før lenken gjør det.
        </p>
        <p>
          DiffServ snur logikken: hver pakke har sin egen klasse-merke (DSCP), og ruteren trenger
          bare å vite om en håndfull klasser (typisk 4–8). Ingen per-flow-tilstand. Ingen
          signalisering mellom ruterne. Marking gjøres ved nett-inngangen, og resten av nettet
          stoler på merkingen. Skalerer fordi alle ruterne er stateless med hensyn til flows.
        </p>
        <p>
          Trade-offet: ingen harde garantier per flow. Hvis tusen VoIP-strømmer alle får DSCP=EF
          samtidig og fyller EF-køen, kollapser EF-løftet. DiffServ må derfor kombineres med
          policing ved kanten (begrense hvor mye EF som slipper inn) og med kapasitets-planlegging
          (overdimensjonere lenker så EF aldri går over 30 % av kapasiteten). Det er pragmatikk
          framfor matematisk garanti, og det er sånn de fleste real-world ISP-er kjører i dag.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-voip-rtp"]} />
    </article>
  );
}

// ============================================================
// 9.6 — Oppgaver
// ============================================================
function Section96() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="9.6" title="Oppgaver" />
      <p className="text-muted-foreground">
        Test forståelsen din. Prøv først selv — bruk hint hvis du står fast — og se svar til slutt.
      </p>

      <Exercise
        question="Bruk en forenklet E-modell der MOS ≈ 4.5 − 0.025·delay_ms/10 − 0.5·loss% − 0.02·jitter_ms. Beregn MOS for en VoIP-samtale med 50 ms delay, 5 % tap og 20 ms jitter."
        hint="Sett inn tallene én og én og trekk fra 4.5."
        answer={
          <>
            <p className="font-mono text-[12px]">
              MOS ≈ 4.5 − 0.025·(50/10) − 0.5·5 − 0.02·20
              <br />
              ≈ 4.5 − 0.125 − 2.5 − 0.4
              <br />≈ 1.475
            </p>
            <p className="mt-1">
              Resultatet havner mellom «dårlig» (2) og «ubrukelig» (1). Tap-leddet (5 %) dominerer —
              det er derfor en god codec med PLC/FEC, ikke kortere delay, er prioritet nummer én når
              nettet taper pakker.
            </p>
          </>
        }
      />

      <Exercise
        question="En DASH-klient har 5 tilgjengelige bitrater: 0.4, 1.0, 2.5, 5.0 og 8.0 Mbps. Beskriv en throughput-basert ABR-algoritme som velger neste segment, med konkret terskel-logikk."
        hint="Algoritmen trenger en throughput-måling, en margin-faktor og en valg-regel."
        answer={
          <>
            <p>
              <strong>Måling:</strong> for hvert nedlastet segment regn ut effektiv throughput T =
              (segment-bytes·8) / nedlastings-tid_sek. Bruk eksponentielt glidende gjennomsnitt
              T_avg = 0.7·T_avg + 0.3·T for å demp støy.
            </p>
            <p>
              <strong>Margin:</strong> sett mål-bitrate B_mål = 0.8·T_avg for å ha 20 % støtbuffer.
            </p>
            <p>
              <strong>Valg:</strong> plukk den høyeste tilgjengelige bitraten ≤ B_mål.
              Eksempel-tabell:
            </p>
            <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
              <li>T_avg = 0.6 Mbps → B_mål = 0.48 → velg 0.4 Mbps</li>
              <li>T_avg = 2.0 Mbps → B_mål = 1.6 → velg 1.0 Mbps</li>
              <li>T_avg = 4.0 Mbps → B_mål = 3.2 → velg 2.5 Mbps</li>
              <li>T_avg = 12 Mbps → B_mål = 9.6 → velg 8.0 Mbps</li>
            </ul>
            <p className="mt-1">
              Legg på en demp-regel: hvis bufferet er under 5 sekunder, ikke hev mer enn ett trinn
              om gangen. Det forhindrer aggressiv oscillering når nettet stabiliserer seg.
            </p>
          </>
        }
      />

      <Exercise
        question="Forklar hvorfor RTP bruker UDP og ikke TCP, og hvilken jobb RTCP har ved siden av RTP."
        hint="Tenk på hva TCP gjør automatisk, og hvorvidt det er en god ide for en sann-tids strøm."
        answer={
          <>
            <p>
              <strong>Hvorfor UDP:</strong> TCP gir pålitelig levering ved å holde tilbake pakker
              som kommer ut av rekkefølge og retransmittere tapte pakker. Begge deler er gift for
              sann-tids media. Hvis pakke N forsvinner og TCP venter på retransmisjon, blir pakke
              N+1 og N+2 stående i mottakerens TCP-buffer i mellomtiden — selv om applikasjonen
              heller ville sett pakke N+1 nå og glemt pakke N. UDP slipper hver pakke fram så snart
              den ankommer, og lar applikasjonen håndtere tap selv via PLC eller FEC.
            </p>
            <p>
              <strong>Hva RTCP gjør:</strong> RTP-pakkene har ingen tilbakekanal — senderen vet ikke
              hvordan mottakeren har det. RTCP er en parallell strøm med rapporter (typisk 5 % av
              båndbredden): Sender Reports gir mottakeren synkroniserings-info, Receiver Reports
              forteller senderen om målt tap, jitter og høyeste sekvensnummer. Senderen bruker
              tilbakemeldingen til å justere bitrate, øke FEC-grad eller bytte til en mer robust
              codec hvis kvaliteten faller.
            </p>
            <p className="mt-1">
              Dypdykk på{" "}
              <a href="/stack/dte2507-voip-rtp" className="text-brand hover:underline">
                VoIP &amp; RTP-siden
              </a>
              .
            </p>
          </>
        }
      />

      <Exercise
        question="En ruter har to utgangskøer på samme 100 Mbps lenke: en EF-kø (priority queueing, alltid først) og en BE-kø (best effort). EF-trafikken er konstant 30 Mbps, BE-trafikken er 90 Mbps. Hva blir effektiv throughput og typisk kø-delay for hver klasse?"
        hint="EF får alltid forkjørs-rett. Hvor mye blir igjen til BE?"
        answer={
          <>
            <p className="font-mono text-[12px]">
              EF effektiv = 30 Mbps (under lenke-kapasitet, ingen kø → delay ≈ 0)
              <br />
              BE effektiv = 100 − 30 = 70 Mbps (men 90 Mbps ankommer)
              <br />
              BE overbelastet → kø vokser → eventuelt pakketap
            </p>
            <p className="mt-1">
              EF-pakker opplever forsinkelse kun fra transmisjons-tiden på lenken og fra
              «head-of-line» blokkering hvis en BE-pakke akkurat har begynt å sendes når EF-pakka
              ankommer. Praktisk delay: noen titalls mikrosekunder. BE-trafikken må enten droppes
              ved policing inn til ruteren eller stå i en stadig voksende kø — det er ingen
              mirakel-løsning, prioritering omfordeler bare ressursen.
            </p>
          </>
        }
      />

      <Exercise
        question="En VoIP-strøm sender Opus-pakker hver 20 ms ved 32 kbps. Hvor mange bytes payload har hver RTP-pakke, og hvor mange bytes blir total IP-pakke (anta IPv4 + UDP + RTP fast header, ingen utvidelser)?"
        hint="32 kbps · 20 ms = ... bits payload. RTP-header er 12 bytes, UDP er 8 bytes, IPv4 er 20 bytes."
        answer={
          <>
            <p className="font-mono text-[12px]">
              Payload: 32_000 bits/s · 0.020 s = 640 bits = 80 bytes
              <br />
              RTP-header: 12 bytes
              <br />
              UDP-header: 8 bytes
              <br />
              IPv4-header: 20 bytes
              <br />
              Total IP-pakke = 80 + 12 + 8 + 20 = 120 bytes
            </p>
            <p className="mt-1">
              Header-overhead = 40/120 ≈ 33 %. På smale lenker (f.eks. en 2G-modem) kan dette være
              dyrt — derfor finnes header-komprimering (RoHC, RFC 5795) som komprimerer
              RTP/UDP/IP-headeren til 1–3 bytes mellom to noder.
            </p>
            <p>
              Total sende-rate over IP blir 120 bytes · 50 pakker/s · 8 = 48 kbps — 50 % mer enn de
              rene 32 kbps Opus produserer.
            </p>
          </>
        }
      />

      <Exercise
        question="En DiffServ-ruter har en 1 Gbps utgangslenke og bruker priority queueing for EF og WFQ (vekter 3:1) for AF og BE. EF har konstant 100 Mbps, AF tilbyr 800 Mbps, BE tilbyr 600 Mbps. Hva blir effektiv throughput og worst-case kø-delay for hver klasse hvis det er 50 KB buffer per kø?"
        hint="EF tas først. Resten fordeles WFQ-mellom AF og BE etter vekt. Worst-case delay = buffer / sendings-rate."
        answer={
          <>
            <p className="font-mono text-[12px]">
              EF effektiv = 100 Mbps (under kapasitet, ingen kø)
              <br />
              Igjen til AF+BE: 1000 − 100 = 900 Mbps
              <br />
              AF får 3/4 · 900 = 675 Mbps (tilbyr 800 → 675 Mbps faktisk, drop 125 Mbps via
              RED/tail)
              <br />
              BE får 1/4 · 900 = 225 Mbps (tilbyr 600 → 225 Mbps faktisk, drop 375 Mbps)
            </p>
            <p className="mt-1">
              <strong>Worst-case kø-delay</strong> per klasse = full buffer / utgangs-rate:
            </p>
            <ul className="list-disc pl-5 font-mono text-[12px]">
              <li>
                EF: ≈ 0 (køen er aldri full). Praktisk delay = transmisjons-tid for én pakke ≈ 12 µs
                for 1500 B på 1 Gbps.
              </li>
              <li>AF: 50 000 B · 8 / 675 Mbps ≈ 593 µs</li>
              <li>BE: 50 000 B · 8 / 225 Mbps ≈ 1.78 ms</li>
            </ul>
            <p className="mt-1">
              EF får ≈ 50× lavere delay enn BE — det er hele poenget med DiffServ. AF blir
              mellomting. Tap fordeles på AF og BE i takt med hvor mye de overstiger sin andel.
            </p>
          </>
        }
      />

      <Exercise
        question="Forklar forskjellen på leaky bucket og token bucket som policing-modeller, og hvilken som passer best for VoIP og hvilken for en burst-tolerant filoverføring."
        hint="Leaky bucket har konstant utgangs-rate; token bucket tillater burst opp til bøtte-størrelsen."
        answer={
          <>
            <p>
              <strong>Leaky bucket:</strong> tenk bøtte med fast utløp. Pakker (vann) renner ut med
              konstant rate r uansett hva som kommer inn. Burst inn → kø bygger seg opp → eventuelt
              overflow og drop. Resultat: utgang er strengt jevn, ingen burst slipper gjennom.
            </p>
            <p>
              <strong>Token bucket:</strong> tokens samles med rate r i en bøtte med kapasitet b. En
              pakke sendes hvis den finner nok tokens. Når bøtta er full og en burst kommer, kan vi
              sende b bytes ekstra raskt — så lenge bøtta tømmes, går vi tilbake til rate r.
            </p>
            <p className="mt-1">
              <strong>VoIP:</strong> sender pakker veldig jevnt (50 pakker/s à 80 bytes). Trenger
              ingen burst-toleranse. Leaky bucket passer perfekt — og en burst ville uansett vært et
              tegn på feil. Vi vil heller ha streng håndheving.
            </p>
            <p>
              <strong>Burst-tolerant filoverføring:</strong> TCP bursts opp til sender-vinduet med
              en gang det er ledig — det er sånn TCP når full throughput raskt. Leaky bucket ville
              drept de naturlige burstene. Token bucket lar dem slippe gjennom så lenge
              gjennomsnittet over tid holder seg innenfor avtalen.
            </p>
          </>
        }
      />

      <Exercise
        question="En klient ønsker å se en DASH-strøm med segment-lengde 4 s. Bitrater tilgjengelig: 0.5, 1, 2, 4, 8 Mbps. ABR-algoritmen krever minimum 6 s buffer for å hoppe oppover, og maksimum 24 s buffer. Hvor lang tid tar startup, og hvor mange segmenter laster den ned før første ramme vises?"
        hint="Klienten må først hente MPD (~50 ms), så laste ned ett segment for å fylle nok buffer. Anta nett 5 Mbps."
        answer={
          <>
            <p>
              <strong>Steg 1 — MPD-henting:</strong> én HTTP GET, kanskje 50 ms total (inkl. DNS,
              TLS, parsing).
            </p>
            <p>
              <strong>Steg 2 — første segment:</strong> ABR-en velger konservativt, f.eks. 1 Mbps
              for å være sikker. Segment-størrelse = 4 s · 1 Mbps = 4 Mb = 500 KB. Nedlastings-tid
              på 5 Mbps lenke: 500 · 8 / 5000 = 0.8 s.
            </p>
            <p>
              <strong>Steg 3 — start avspilling:</strong> mange ABR-er starter så snart første
              segment er ferdig (buffer = 4 s &gt; minimum). Men mer konservative venter til 2
              segmenter er nede (8 s buffer) før de starter.
            </p>
            <p className="mt-1 font-mono text-[12px]">
              Aggressiv startup: 50 ms + 800 ms ≈ 0.85 s, 1 segment.
              <br />
              Konservativ startup: 50 ms + 2 · 800 ms ≈ 1.65 s, 2 segmenter.
            </p>
            <p className="mt-1">
              Trade-off: aggressiv startup viser bilde raskere, men risikerer re-buffering hvis
              nettet svinger. Streaming-tjenester velger gjerne 2-segment-startup for å redusere
              klage-rate, selv om det føles tregere.
            </p>
          </>
        }
      />

      <Exercise
        question="En videostrøm bruker H.264 med GOP-lengde 60 rammer (2 s ved 30 fps) der I-rammen er 80 KB, P-rammer 8 KB i snitt, B-rammer 3 KB. Hva blir gjennomsnittlig bitrate, og hvilken konsekvens har det at en I-ramme er ~10× større enn en P-ramme for jitter-bufferet?"
        hint="GOP-mønster: I, så blanding av P og B. Anta f.eks. 1 I, 19 P, 40 B per GOP."
        answer={
          <>
            <p className="font-mono text-[12px]">
              GOP-bytes = 1·80 KB + 19·8 KB + 40·3 KB = 80 + 152 + 120 = 352 KB
              <br />
              GOP-varighet = 2 s
              <br />
              Bitrate = 352 KB · 8 / 2 s = 1408 kbps ≈ 1.4 Mbps
            </p>
            <p className="mt-1">
              <strong>Konsekvens for jitter-buffer:</strong> sendingen er ujevn — I-ramme krever 80
              KB sendt på 33 ms-vinduet (≈ 19 Mbps momentan-rate!), mens P og B går unna på under 1
              Mbps. På en 5 Mbps-lenke vil I-rammen ta 130 ms å sende, langt mer enn de 33 ms vi har
              før neste ramme skal vises.
            </p>
            <p>
              Bufferet må derfor være dimensjonert til å holde minst én I-rammes verdi av rammer
              ekstra (typisk 1–2 sekunder buffer for video, mye mer enn for tale). Senderen kan også
              fordele I-rammen over flere ms via «smooth streaming»-rate-shaping, slik at
              momentan-spiken blir mindre.
            </p>
          </>
        }
      />

      <Exercise
        question="En adaptiv playout-buffer starter på 40 ms. Gjennom 100 pakker måles jitter (standardavvik for ankomst-tid) til 18 ms. Hvor bør bufferet justeres til, og hva er kompromisset?"
        hint="En vanlig regel er at buffer ≈ middel-delay + 4·jitter dekker ~99.99 % av normalfordelt jitter."
        answer={
          <>
            <p className="font-mono text-[12px]">Mål-buffer ≈ 4·σ_jitter = 4·18 = 72 ms</p>
            <p className="mt-1">
              Bufferet bør økes fra 40 ms til ca. 72 ms. Det betyr at praktisk talt ingen pakker vil
              komme «for sent» og kastes — men hele ende-til-ende-delayet stiger med 32 ms. Hvis
              tidligere total mund-til-øre-delay var 130 ms, blir den nå 162 ms — fortsatt under 200
              ms-grensa, men begynner å merkes som litt treghet i samtalen.
            </p>
            <p>
              Konklusjon: store buffere kjøper tap-toleranse på bekostning av interaktivitet.
              Adaptive buffere prøver å holde seg så små som mulig akkurat nå, og vokse bare når
              jitter krever det.
            </p>
          </>
        }
      />
    </article>
  );
}

// ============================================================
// Seksjon 9.7 — Eksamen-fokus
// ============================================================

function SectionEksamen() {
  return (
    <article className="space-y-6">
      <Header num="9.7" title="Eksamen-fokus: cheat sheet, fallgruver og 5-minutter-anker" />

      <p className="text-[13px] text-muted-foreground">
        Denne seksjonen samler det du faktisk trenger å huske utenat på eksamensdagen for kap. 9.
        Bruk den til siste-minutten-repetisjon: et kompakt cheat sheet, en sammenligning av DASH og
        RTP, et beslutningstre over hvilken multimedia-tilnærming du velger, en liste over klassiske
        fallgruver, og et 5-minutter-anker med kjernepunktene.
      </p>

      {/* Visuelt cheat sheet — 8 SVG-er som dekker nøkkelfaktaene */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-4">
        <div className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold">
          Visuelt cheat sheet
        </div>
        <div className="font-semibold text-foreground">8 grafiske kjernekonsepter for kap. 9</div>
        <div className="grid gap-3 lg:grid-cols-2">
          <Illustration caption="Multimedia-typer plassert i (latens-budsjett, tap-toleranse)-rom.">
            <MultimediaToleranseSvg />
          </Illustration>
          <Illustration caption="Latens vs jitter — to nettverk med samme snitt-delay, ulik variasjon.">
            <DelayVsJitterSvg />
          </Illustration>
          <Illustration caption="MOS-stigen: subjektiv 1-5-skala med ansikter.">
            <MosLadderSvg />
          </Illustration>
          <Illustration caption="DASH-arkitektur: origin → CDN → klient (NRK TV).">
            <DashArchitectureSvg />
          </Illustration>
          <Illustration caption="RTP-header som byte-layout (3 ord á 32 bit).">
            <RtpHeaderBytesSvg />
          </Illustration>
          <Illustration caption="RTCP-pakke-typer som tabell.">
            <RtcpTypesSvg />
          </Illustration>
          <Illustration caption="DiffServ vs IntServ — to QoS-filosofier.">
            <DiffServVsIntServSvg />
          </Illustration>
          <Illustration caption="Token bucket — burst opp til b, snitt-rate r.">
            <TokenBucketCheatSvg />
          </Illustration>
        </div>
      </div>

      {/* a) Cheat sheet */}
      <Cheat
        tittel="Cheat sheet — kap. 9 nøkkelfakta"
        rader={[
          {
            spor: "Multimedia-typer",
            kort: "Lagret video · live streaming · samtidsinteraktiv (VoIP/video-konf)",
            note: "Latens-krav skiller dem: lagret tåler sekunder, live tåler ~10 s, interaktiv krever < 150-400 ms.",
          },
          {
            spor: "Jitter ≠ delay",
            kort: "Delay = absolutt tid mellom send og motta. Jitter = variasjon i delay mellom pakker.",
            note: "Konstant 200 ms delay = 0 jitter. Vekslende 100/300 ms = stor jitter selv om snittet er 200 ms.",
          },
          {
            spor: "MOS-skalaen (Mean Opinion Score)",
            kort: "5 utmerket · 4 god · 3 rimelig · 2 dårlig · 1 uakseptabel",
            note: "Subjektiv kvalitet fra lyttetester. Toll-kvalitet ≈ 4.0. Under 3.5 oppleves som dårlig samtale.",
          },
          {
            spor: "DASH-arkitektur",
            kort: "Manifest (MPD-fil i XML) lister segmenter og bitrater. Klient kjører ABR (adaptive bitrate) over HTTPS.",
            note: "Segmenter er som regel 2-10 s. ABR velger neste segments bitrate basert på målt throughput og buffer-fylling.",
          },
          {
            spor: "RTP-header (minimum 12 bytes)",
            kort: "V (2 bit) · P · X · CC (4 bit) · M · PT (7 bit) · SEQ (16 bit) · TS (32 bit) · SSRC (32 bit)",
            note: "PT = payload-type (codec). SEQ teller pakker (deteksjon av tap/omstokking). TS = sampling-tidsstempel (rekonstruere playout). SSRC identifiserer kilden.",
          },
          {
            spor: "RTCP-pakke-typer",
            kort: "SR (sender report) · RR (receiver report) · SDES (kilde-beskrivelse) · BYE · APP (app-spesifikk)",
            note: "RTCP går på odde port-nummer ved siden av RTP. Brukes til synk (lyd+video), tap-statistikk og deltakerliste.",
          },
          {
            spor: "QoS-modeller",
            kort: "DiffServ: DSCP-bits i IP-header velger per-hop behavior (PHB) per pakke. IntServ: RSVP reserverer ressurser per flow.",
            note: "DiffServ skalerer (klassebasert, ingen flow-state i kjernen). IntServ gir harde garantier men holder per-flow-state — derfor sjelden brukt i kjernen i dag.",
          },
          {
            spor: "Token-bøtte (trafikk-shaping)",
            kort: "Bøtte med kapasitet b tokens, fylles med rate r tokens/s. Pakke krever 1 token for å sendes.",
            note: "Tillater short-term burst opp til b og long-term rate ≤ r. Forskjellig fra leaky bucket som tvinger jevn ut-rate.",
          },
        ]}
      />

      {/* b) Sammenligning-tabell DASH vs RTP-streaming */}
      <Illustration caption="DASH vs RTP — to streaming-stiler visuelt side-ved-side.">
        <DashVsRtpVisualSvg />
      </Illustration>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-[10px] uppercase tracking-wider text-brand font-semibold mb-2">
          Sammenligning
        </div>
        <h3 className="text-base font-semibold mb-3">DASH vs RTP-streaming</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-3 font-semibold text-muted-foreground">Aspekt</th>
                <th className="text-left py-2 pr-3 font-semibold text-foreground">
                  DASH (HTTP-streaming)
                </th>
                <th className="text-left py-2 font-semibold text-foreground">RTP-streaming</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-2 pr-3 font-semibold">Transport</td>
                <td className="py-2 pr-3 text-muted-foreground">
                  TCP via HTTPS — pålitelig, går gjennom NAT og brannmurer som hvilken som helst
                  websession.
                </td>
                <td className="py-2 text-muted-foreground">
                  UDP. Ingen retransmissions; tapte pakker blir borte. Slipper hode-blokkering, men
                  kan slite mot brannmurer.
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-semibold">Adaptiv bitrate (ABR)</td>
                <td className="py-2 pr-3 text-muted-foreground">
                  Klient-styrt: leser MPD, velger neste segments bitrate fra «laddern» basert på
                  målt throughput og buffer-nivå.
                </td>
                <td className="py-2 text-muted-foreground">
                  Server- eller hybrid-styrt. RTP selv har ingen ABR-mekanisme; må implementeres
                  over RTCP-feedback eller separat protokoll.
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-semibold">Sesjons-kontroll</td>
                <td className="py-2 pr-3 text-muted-foreground">
                  Ingen — hver segment-forespørsel er en uavhengig HTTP GET. State holdes hos
                  klienten.
                </td>
                <td className="py-2 text-muted-foreground">
                  RTSP håndterer play/pause/seek (separat kanal). RTP bærer mediet. RTCP gir
                  rapportering.
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-semibold">Fordeler</td>
                <td className="py-2 pr-3 text-muted-foreground">
                  Cacher i CDN-er som vanlig HTTP. Tåler vekslende båndbredde. Krever ingen
                  spesial-infrastruktur hos ISP-en.
                </td>
                <td className="py-2 text-muted-foreground">
                  Lavere end-to-end-latens (ingen TCP-retransmit-pauser). Egner seg for live og
                  samtidsinteraktive sesjoner.
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-semibold">Ulemper</td>
                <td className="py-2 pr-3 text-muted-foreground">
                  Høyere latens (typisk 10-30 s for live) pga. buffer + segment-størrelse. ABR kan
                  oscillere hvis throughput-målinger er ustabile.
                </td>
                <td className="py-2 text-muted-foreground">
                  Pakketap gir hørbare/synlige artefakter. NAT/brannmur-traversal er vanskelig.
                  Mindre CDN-vennlig.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* c) Beslutningstre */}
      <Illustration caption="Beslutningstre — velg riktig multimedia-tilnærming basert på interaktivitet og publikum.">
        <BeslutningstreSvg />
      </Illustration>

      {/* d) Fallgruver */}
      <div className="space-y-3">
        <div className="text-[10px] uppercase tracking-wider text-rose-700 dark:text-rose-400 font-semibold">
          Klassiske fallgruver
        </div>
        <Fallgruve tittel="Forveksle latens med jitter">
          <p>
            På eksamen ser man ofte spørsmål av typen «jitter er 30 ms» — som ikke betyr at delayet
            er 30 ms, men at <em>variasjonen</em> i delay er 30 ms. Et nett kan ha 5 ms delay og 20
            ms jitter (verre for VoIP enn 200 ms konstant delay), eller 300 ms delay og 1 ms jitter
            (greit for video, men ubrukelig for samtidsinteraktiv lyd).
          </p>
          <PitfallLatencyJitterSvg />
        </Fallgruve>
        <Fallgruve tittel="Tro RTP gir pålitelig levering">
          <p>
            RTP kjører over UDP. Det er <strong>ingen</strong> retransmit, ingen leveringsgaranti,
            ingen connection-state. Det RTP gir deg er: sekvensnummer (du <em>oppdager</em> tap),
            tidsstempel (du kan rekonstruere playout-tid), og payload-type (du vet hvilken codec).
            Pålitelighet — hvis du vil ha det — må du bygge selv via FEC, interleaving eller
            RTCP-feedback-loops.
          </p>
          <PitfallRtpMythSvg />
        </Fallgruve>
        <Fallgruve tittel="Tror DASH justerer kvalitet basert på link-rate">
          <p>
            DASH-klienten kjenner ikke link-raten din. Den måler{" "}
            <strong>end-to-end throughput</strong> for hver segment-nedlasting (segment-bytes delt
            på nedlastingstid) og bruker det estimatet til neste segment-valg. Det er derfor en
            full-fart 1 Gbit/s fiber kan oppleve dårlig DASH-kvalitet hvis serveren eller en
            mellom-hop er flaskehalsen.
          </p>
          <PitfallDashThroughputSvg />
        </Fallgruve>
        <Fallgruve tittel="Anta at QoS-merking respekteres hele veien">
          <p>
            DSCP-bits du setter i headeren gjelder i din egen ISP-domene (hvis du har en SLA). Ved
            domene-overgang strippes eller remappes ofte DSCP-bittene — internett som helhet er
            best-effort. QoS er et kontrakts-spørsmål, ikke en protokoll-garanti.
          </p>
          <PitfallQosMarkingSvg />
        </Fallgruve>
        <Fallgruve tittel="Blande token bucket og leaky bucket">
          <p>Begge regulerer trafikk, men oppfører seg forskjellig:</p>
          <ul className="list-disc pl-5 mt-1 space-y-0.5">
            <li>
              <strong>Token bucket</strong> tillater burst opp til bøttestørrelse b og long-term
              rate ≤ r. Du kan sende b pakker raskt etter en stille periode.
            </li>
            <li>
              <strong>Leaky bucket</strong> tvinger jevn ut-rate uansett. Burst-pakker står i kø; de
              slippes ut én og én med konstant rate.
            </li>
          </ul>
          <p className="mt-1">
            Token bucket er greiere for VBR-video (variable bitrate); leaky bucket er strengere og
            bedre der nedstrøms-enheter forventer konstant rate.
          </p>
          <PitfallTokenVsLeakySvg />
        </Fallgruve>
        <Fallgruve tittel="Forveksle SR og RR i RTCP">
          <p>
            <strong>Sender Report (SR)</strong> sendes av en deltaker som aktivt sender RTP-pakker —
            den inkluderer både sender-info (NTP/RTP-tidsstempel for synk) og mottaker-rapport.{" "}
            <strong>Receiver Report (RR)</strong> sendes av deltakere som kun mottar — kun
            mottaker-statistikk. Hvis du svarer «en mottaker sender SR» er det galt.
          </p>
        </Fallgruve>
        <Fallgruve tittel="Tror playout-buffer fjerner all jitter">
          <p>
            Et statisk buffer på b ms eliminerer all jitter mindre enn b ms — men koster b ms ekstra
            forsinkelse. Hvis nettets jitter overstiger b, kommer pakker «for sent» og kastes,
            akkurat som tap. Adaptive buffere prøver å justere b dynamisk, men har alltid en
            innebygd avveining mellom tap og delay.
          </p>
        </Fallgruve>
        <Fallgruve tittel="Glemme at multicast krever støtte i nettet">
          <p>
            En-til-mange-live (f.eks. IPTV) bruker IP-multicast for effektivitet, men rutere må
            kjøre IGMP/PIM. På åpent internett finnes dette praktisk talt ikke — så «multicast» blir
            som regel application-layer-multicast (CDN-fan-out, RTMP-relay) i praksis.
          </p>
        </Fallgruve>
      </div>

      {/* e) 5-minutter-anker */}
      <Illustration caption="15 visuelle anker-kort — én rask repetisjon av kjernepunktene.">
        <AnkerKortSvg />
      </Illustration>

      <Anker
        tittel="5-minutter-anker — kjernepunkter du må ha"
        punkter={[
          "Tre kategorier multimedia: lagret (DASH), live (DASH/RTMP/multicast), samtidsinteraktiv (VoIP/WebRTC). Kategorien velges av latens-toleranse.",
          "Mund-til-øre-grense for interaktiv lyd: ~150 ms (god), ~400 ms (akseptabel), over det blir samtalen tregt.",
          "Jitter er variasjon i delay, ikke delay selv. Måles ofte som standardavvik for inter-arrival-tider.",
          "MOS er en subjektiv 1-5-skala. Toll-kvalitet ≈ 4.0. Codecs evalueres med MOS, ikke kun bitrate.",
          "DASH = klient-styrt HTTP-streaming over TCP. MPD-manifest + segmenter + ABR-laddervalg basert på målt throughput og buffer-nivå.",
          "RTP-header har 12 byte minimum: V/P/X/CC/M/PT (1. ord), SEQ (sekvensnummer), TS (tidsstempel), SSRC (kilde-id).",
          "RTP gir IKKE pålitelighet — det gjør UDP heller ikke. Tap håndteres via FEC, interleaving eller PLC (packet loss concealment).",
          "RTCP-pakke-typer: SR (aktiv sender), RR (kun mottaker), SDES, BYE, APP. Brukes til synk og statistikk.",
          "DiffServ: stateless klassebasert (DSCP-merking i IP-header gir PHB). IntServ: stateful per-flow (RSVP) — gir garantier, men skalerer dårlig.",
          "Token bucket regulerer burst og long-term rate; leaky bucket tvinger konstant ut-rate. Ulik bruk.",
          "Playout-buffer trader delay mot tap. Statisk = enkelt men dårlig adaptert. Adaptivt ≈ middel-delay + k·σ_jitter.",
          "Adaptiv playout justerer typisk mellom talespurts (under pausene). Innenfor en spurt er bufferet konstant for å unngå tone-forvrengning.",
          "WebRTC bruker SRTP (sikker RTP) + ICE/STUN/TURN for NAT-traversal og DTLS for nøkkelutveksling. Mål: under 200 ms ende-til-ende.",
          "ABR-algoritmer faller i tre familier: throughput-baserte, buffer-baserte (BOLA), og hybrid (MPC). Avveining mellom kvalitet og rebuffering.",
          "QoS-marking gjelder bare innen din ISP-domene med SLA. Ved domene-grense strippes eller remappes DSCP — internett som helhet er best-effort.",
        ]}
      />
    </article>
  );
}

// ============================================================
// Helpers for 9.7
// ============================================================

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

function Cheat({
  tittel,
  rader,
}: {
  tittel: string;
  rader: { spor: string; kort: React.ReactNode; note?: React.ReactNode }[];
}) {
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
        Cheat sheet
      </div>
      <div className="font-semibold text-foreground mb-3">{tittel}</div>
      <dl className="space-y-3 text-[12.5px]">
        {rader.map((r) => (
          <div key={r.spor} className="border-l-2 border-emerald-500/40 pl-3">
            <dt className="font-semibold text-foreground">{r.spor}</dt>
            <dd className="text-foreground/90 mt-0.5">{r.kort}</dd>
            {r.note && (
              <dd className="text-muted-foreground text-[11.5px] mt-1 italic">{r.note}</dd>
            )}
          </div>
        ))}
      </dl>
    </div>
  );
}

function Anker({ tittel, punkter }: { tittel: string; punkter: string[] }) {
  return (
    <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-indigo-700 dark:text-indigo-400 font-semibold mb-1">
        5-minutter-anker
      </div>
      <div className="font-semibold text-foreground mb-2">{tittel}</div>
      <ol className="list-decimal pl-5 space-y-1.5 text-[12.5px] text-foreground/90">
        {punkter.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ol>
    </div>
  );
}

function BeslutningstreSvg() {
  return (
    <svg viewBox="0 0 760 480" className="w-full h-auto">
      {/* Rotnode */}
      <rect
        x={290}
        y={20}
        width={180}
        height={48}
        rx={8}
        className="fill-card stroke-foreground/40"
        strokeWidth={1.2}
      />
      <text
        x={380}
        y={42}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Hvilken multimedia-
      </text>
      <text
        x={380}
        y={58}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        tilnærming?
      </text>

      {/* Spørsmål-1: interaktiv? */}
      <line x1={380} y1={68} x2={380} y2={100} className="stroke-foreground/40" strokeWidth={1.2} />
      <rect
        x={290}
        y={100}
        width={180}
        height={44}
        rx={8}
        className="fill-muted/40 stroke-foreground/40"
        strokeWidth={1.2}
      />
      <text x={380} y={120} textAnchor="middle" className="fill-foreground text-[11.5px]">
        Krever samtidsinteraksjon
      </text>
      <text x={380} y={134} textAnchor="middle" className="fill-foreground text-[11.5px]">
        (&lt; 400 ms)?
      </text>

      {/* Forgrening: ja (venstre) — interaktiv */}
      <line
        x1={380}
        y1={144}
        x2={170}
        y2={180}
        className="stroke-foreground/40"
        strokeWidth={1.2}
      />
      <text
        x={250}
        y={168}
        className="fill-emerald-600 dark:fill-emerald-400 text-[11px] font-semibold"
      >
        ja
      </text>
      <rect
        x={70}
        y={180}
        width={200}
        height={44}
        rx={8}
        className="fill-muted/40 stroke-foreground/40"
        strokeWidth={1.2}
      />
      <text x={170} y={200} textAnchor="middle" className="fill-foreground text-[11.5px]">
        Trenger ultra-lav latens
      </text>
      <text x={170} y={214} textAnchor="middle" className="fill-foreground text-[11.5px]">
        (&lt; 200 ms, P2P)?
      </text>

      <line x1={120} y1={224} x2={80} y2={260} className="stroke-foreground/40" strokeWidth={1.2} />
      <text x={70} y={246} className="fill-emerald-600 dark:fill-emerald-400 text-[10.5px]">
        ja
      </text>
      <rect
        x={20}
        y={260}
        width={130}
        height={56}
        rx={8}
        className="fill-emerald-500/15 stroke-emerald-500/50"
        strokeWidth={1.2}
      />
      <text
        x={85}
        y={280}
        textAnchor="middle"
        className="fill-foreground text-[11.5px] font-semibold"
      >
        WebRTC
      </text>
      <text x={85} y={295} textAnchor="middle" className="fill-muted-foreground text-[10.5px]">
        SRTP + ICE + DTLS
      </text>
      <text x={85} y={308} textAnchor="middle" className="fill-muted-foreground text-[10.5px]">
        P2P-mesh / SFU
      </text>

      <line
        x1={220}
        y1={224}
        x2={260}
        y2={260}
        className="stroke-foreground/40"
        strokeWidth={1.2}
      />
      <text x={252} y={246} className="fill-rose-600 dark:fill-rose-400 text-[10.5px]">
        nei
      </text>
      <rect
        x={190}
        y={260}
        width={140}
        height={56}
        rx={8}
        className="fill-emerald-500/15 stroke-emerald-500/50"
        strokeWidth={1.2}
      />
      <text
        x={260}
        y={280}
        textAnchor="middle"
        className="fill-foreground text-[11.5px] font-semibold"
      >
        VoIP / SIP
      </text>
      <text x={260} y={295} textAnchor="middle" className="fill-muted-foreground text-[10.5px]">
        UDP + RTP/RTCP
      </text>
      <text x={260} y={308} textAnchor="middle" className="fill-muted-foreground text-[10.5px]">
        adaptiv playout
      </text>

      {/* Forgrening: nei (høyre) — ikke-interaktiv */}
      <line
        x1={380}
        y1={144}
        x2={590}
        y2={180}
        className="stroke-foreground/40"
        strokeWidth={1.2}
      />
      <text x={500} y={168} className="fill-rose-600 dark:fill-rose-400 text-[11px] font-semibold">
        nei
      </text>
      <rect
        x={490}
        y={180}
        width={200}
        height={44}
        rx={8}
        className="fill-muted/40 stroke-foreground/40"
        strokeWidth={1.2}
      />
      <text x={590} y={200} textAnchor="middle" className="fill-foreground text-[11.5px]">
        Live (alle ser samme stream
      </text>
      <text x={590} y={214} textAnchor="middle" className="fill-foreground text-[11.5px]">
        nesten samtidig)?
      </text>

      <line
        x1={540}
        y1={224}
        x2={500}
        y2={260}
        className="stroke-foreground/40"
        strokeWidth={1.2}
      />
      <text x={490} y={246} className="fill-emerald-600 dark:fill-emerald-400 text-[10.5px]">
        ja
      </text>
      <rect
        x={430}
        y={260}
        width={140}
        height={56}
        rx={8}
        className="fill-emerald-500/15 stroke-emerald-500/50"
        strokeWidth={1.2}
      />
      <text
        x={500}
        y={280}
        textAnchor="middle"
        className="fill-foreground text-[11.5px] font-semibold"
      >
        Multicast / RTMP
      </text>
      <text x={500} y={295} textAnchor="middle" className="fill-muted-foreground text-[10.5px]">
        IGMP/PIM i lukket nett
      </text>
      <text x={500} y={308} textAnchor="middle" className="fill-muted-foreground text-[10.5px]">
        ellers CDN-fan-out
      </text>

      <line
        x1={640}
        y1={224}
        x2={680}
        y2={260}
        className="stroke-foreground/40"
        strokeWidth={1.2}
      />
      <text x={672} y={246} className="fill-rose-600 dark:fill-rose-400 text-[10.5px]">
        nei
      </text>
      <rect
        x={610}
        y={260}
        width={140}
        height={56}
        rx={8}
        className="fill-emerald-500/15 stroke-emerald-500/50"
        strokeWidth={1.2}
      />
      <text
        x={680}
        y={280}
        textAnchor="middle"
        className="fill-foreground text-[11.5px] font-semibold"
      >
        DASH / HLS
      </text>
      <text x={680} y={295} textAnchor="middle" className="fill-muted-foreground text-[10.5px]">
        HTTPS + segmenter
      </text>
      <text x={680} y={308} textAnchor="middle" className="fill-muted-foreground text-[10.5px]">
        ABR i klienten
      </text>

      {/* Nederste hint-rad */}
      <line
        x1={40}
        y1={350}
        x2={720}
        y2={350}
        className="stroke-foreground/20"
        strokeDasharray="3 3"
      />
      <text
        x={380}
        y={372}
        textAnchor="middle"
        className="fill-muted-foreground text-[10.5px] italic"
      >
        Latens-budsjett øker fra venstre mot høyre — desto strengere krav, desto mer skreddersydd
        protokoll.
      </text>

      <rect
        x={40}
        y={390}
        width={200}
        height={70}
        rx={8}
        className="fill-card stroke-foreground/30"
        strokeWidth={1}
      />
      <text
        x={140}
        y={410}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Interaktiv (P2P/grupper)
      </text>
      <text x={140} y={426} textAnchor="middle" className="fill-muted-foreground text-[10.5px]">
        Latens-budsjett: &lt; 200-400 ms
      </text>
      <text x={140} y={442} textAnchor="middle" className="fill-muted-foreground text-[10.5px]">
        Pakketap: PLC/FEC
      </text>
      <text x={140} y={456} textAnchor="middle" className="fill-muted-foreground text-[10.5px]">
        Adaptiv playout-buffer
      </text>

      <rect
        x={280}
        y={390}
        width={200}
        height={70}
        rx={8}
        className="fill-card stroke-foreground/30"
        strokeWidth={1}
      />
      <text
        x={380}
        y={410}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Live broadcast
      </text>
      <text x={380} y={426} textAnchor="middle" className="fill-muted-foreground text-[10.5px]">
        Latens-budsjett: 2-30 s
      </text>
      <text x={380} y={442} textAnchor="middle" className="fill-muted-foreground text-[10.5px]">
        Skalering: multicast / CDN
      </text>
      <text x={380} y={456} textAnchor="middle" className="fill-muted-foreground text-[10.5px]">
        Ofte HTTPS-segmenter
      </text>

      <rect
        x={520}
        y={390}
        width={200}
        height={70}
        rx={8}
        className="fill-card stroke-foreground/30"
        strokeWidth={1}
      />
      <text
        x={620}
        y={410}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Lagret (on-demand)
      </text>
      <text x={620} y={426} textAnchor="middle" className="fill-muted-foreground text-[10.5px]">
        Latens-budsjett: sekunder
      </text>
      <text x={620} y={442} textAnchor="middle" className="fill-muted-foreground text-[10.5px]">
        ABR + stor klient-buffer
      </text>
      <text x={620} y={456} textAnchor="middle" className="fill-muted-foreground text-[10.5px]">
        CDN-cache er normalt
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
    <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-sky-700 dark:text-sky-400 font-semibold mb-1">
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
        Metafor
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

function RequirementsSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      {/* Aksene */}
      <line x1={60} y1={200} x2={460} y2={200} className="stroke-foreground/60" strokeWidth={1.5} />
      <line x1={60} y1={200} x2={60} y2={30} className="stroke-foreground/60" strokeWidth={1.5} />
      <text x={250} y={228} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        Tap-toleranse →
      </text>
      <text
        x={20}
        y={120}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px]"
        transform="rotate(-90 20 120)"
      >
        Delay-budsjett →
      </text>
      {/* Lavt delay-budsjett (VoIP) */}
      <ellipse
        cx={350}
        cy={160}
        rx={70}
        ry={28}
        className="fill-destructive/15 stroke-destructive"
        strokeWidth={1.5}
      />
      <text
        x={350}
        y={158}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        VoIP / video-møte
      </text>
      <text x={350} y={172} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        &lt; 150 ms · tåler 5–10 % tap
      </text>
      {/* Live streaming */}
      <ellipse
        cx={250}
        cy={100}
        rx={70}
        ry={28}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text
        x={250}
        y={98}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Live streaming
      </text>
      <text x={250} y={112} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        2–10 s · tåler 1–2 % tap
      </text>
      {/* Lagret video */}
      <ellipse
        cx={130}
        cy={60}
        rx={70}
        ry={28}
        className="fill-success/15 stroke-success"
        strokeWidth={1.5}
      />
      <text
        x={130}
        y={58}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Netflix / VOD
      </text>
      <text x={130} y={72} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        sek av buffer · 0 tap (TCP)
      </text>
    </svg>
  );
}

function DashSvg() {
  return (
    <svg viewBox="0 0 500 260" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        DASH — segmenter i flere bitrater på HTTP-server
      </text>
      {/* Server-boks */}
      <rect
        x={30}
        y={40}
        width={200}
        height={170}
        rx={8}
        className="fill-card stroke-brand"
        strokeWidth={1.5}
      />
      <text
        x={130}
        y={58}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        HTTP-server
      </text>
      {/* MPD */}
      <rect
        x={50}
        y={72}
        width={160}
        height={20}
        rx={3}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={130} y={86} textAnchor="middle" className="fill-foreground text-[9px]">
        MPD (manifest.xml)
      </text>
      {/* Bitrates */}
      {[
        { y: 100, label: "8 Mbps (4K)", color: "fill-success/30 stroke-success" },
        { y: 122, label: "2.5 Mbps (720p)", color: "fill-brand/30 stroke-brand" },
        { y: 144, label: "1 Mbps (480p)", color: "fill-amber-500/30 stroke-amber-500" },
        { y: 166, label: "0.4 Mbps (240p)", color: "fill-destructive/30 stroke-destructive" },
      ].map((row, i) => (
        <g key={i}>
          <text x={48} y={row.y + 13} className="fill-muted-foreground text-[8px]">
            {row.label}
          </text>
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <rect
              key={k}
              x={120 + k * 16}
              y={row.y + 4}
              width={14}
              height={14}
              rx={2}
              className={row.color}
              strokeWidth={1}
            />
          ))}
        </g>
      ))}
      <text x={130} y={195} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        seg-1 seg-2 seg-3 seg-4 seg-5 seg-6
      </text>

      {/* Klient */}
      <rect
        x={320}
        y={70}
        width={150}
        height={140}
        rx={8}
        className="fill-card stroke-success"
        strokeWidth={1.5}
      />
      <text
        x={395}
        y={88}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Klient
      </text>
      <text x={395} y={103} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        ABR-algoritme
      </text>
      {/* Buffer */}
      <rect
        x={335}
        y={115}
        width={120}
        height={20}
        rx={3}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1}
      />
      <text x={395} y={129} textAnchor="middle" className="fill-foreground text-[9px]">
        Buffer (12 s)
      </text>
      <rect
        x={335}
        y={145}
        width={120}
        height={20}
        rx={3}
        className="fill-muted/40 stroke-border"
        strokeWidth={1}
      />
      <text x={395} y={159} textAnchor="middle" className="fill-foreground text-[9px]">
        Throughput-måler
      </text>
      <rect
        x={335}
        y={175}
        width={120}
        height={20}
        rx={3}
        className="fill-muted/40 stroke-border"
        strokeWidth={1}
      />
      <text x={395} y={189} textAnchor="middle" className="fill-foreground text-[9px]">
        Dekoder
      </text>

      {/* Pil med valg */}
      <line
        x1={230}
        y1={140}
        x2={320}
        y2={140}
        className="stroke-brand"
        strokeWidth={2}
        markerEnd="url(#dashArrow)"
      />
      <defs>
        <marker
          id="dashArrow"
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-brand" />
        </marker>
      </defs>
      <text x={275} y={134} textAnchor="middle" className="fill-brand text-[9px] font-semibold">
        GET seg-5 @ 2.5Mbps
      </text>
      <text x={275} y={150} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        HTTP-request
      </text>

      <text x={250} y={235} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Klienten plukker bitrate per segment basert på buffer-fyllgrad og målt throughput
      </text>
    </svg>
  );
}

function PlayoutBufferSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Playout-buffer — jevner ut jitter
      </text>
      {/* Senders linje */}
      <text x={20} y={45} className="fill-muted-foreground text-[10px]">
        Avsendt:
      </text>
      <line
        x1={70}
        y1={50}
        x2={460}
        y2={50}
        className="stroke-muted-foreground/40"
        strokeWidth={1}
      />
      {[1, 2, 3, 4, 5, 6].map((i) => {
        const x = 80 + (i - 1) * 65;
        return (
          <g key={`s${i}`}>
            <rect x={x} y={42} width={16} height={16} rx={2} className="fill-brand" />
            <text x={x + 8} y={75} textAnchor="middle" className="fill-muted-foreground text-[8px]">
              t={(i - 1) * 20}
            </text>
          </g>
        );
      })}
      {/* Mottatt med jitter */}
      <text x={20} y={115} className="fill-muted-foreground text-[10px]">
        Mottatt:
      </text>
      <line
        x1={70}
        y1={120}
        x2={460}
        y2={120}
        className="stroke-muted-foreground/40"
        strokeWidth={1}
      />
      {[
        { i: 1, off: 0 },
        { i: 2, off: -8 },
        { i: 3, off: 12 },
        { i: 4, off: 28 },
        { i: 5, off: -5 },
        { i: 6, off: 18 },
      ].map((p) => {
        const x = 80 + (p.i - 1) * 65 + p.off;
        return (
          <g key={`r${p.i}`}>
            <rect x={x} y={112} width={16} height={16} rx={2} className="fill-amber-500" />
            <text
              x={x + 8}
              y={145}
              textAnchor="middle"
              className="fill-muted-foreground text-[8px]"
            >
              {p.off >= 0 ? "+" : ""}
              {p.off}
            </text>
          </g>
        );
      })}
      {/* Buffer */}
      <rect
        x={70}
        y={155}
        width={390}
        height={26}
        rx={4}
        className="fill-success/10 stroke-success/60"
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      <text x={265} y={172} textAnchor="middle" className="fill-success text-[10px] font-semibold">
        Buffer (60 ms forsinkelse)
      </text>
      {/* Spilt av */}
      <text x={20} y={205} className="fill-muted-foreground text-[10px]">
        Spilt:
      </text>
      <line
        x1={70}
        y1={210}
        x2={460}
        y2={210}
        className="stroke-muted-foreground/40"
        strokeWidth={1}
      />
      {[1, 2, 3, 4, 5, 6].map((i) => {
        const x = 80 + (i - 1) * 65;
        return (
          <rect
            key={`p${i}`}
            x={x}
            y={202}
            width={16}
            height={16}
            rx={2}
            className="fill-success"
          />
        );
      })}
      <text x={250} y={235} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Ankomster sprer seg, men avspilling skjer på fast takt
      </text>
    </svg>
  );
}

function RtpHeaderSvg() {
  // RTP header 12 bytes = 4 bytes per rad, 3 rader
  return (
    <svg viewBox="0 0 500 250" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        RTP-header (12 bytes obligatorisk)
      </text>
      {/* Bit-skala */}
      {[0, 8, 16, 24, 31].map((b) => (
        <text
          key={b}
          x={50 + (b / 31) * 400}
          y={36}
          textAnchor="middle"
          className="fill-muted-foreground text-[8px]"
        >
          {b}
        </text>
      ))}
      <line
        x1={50}
        y1={40}
        x2={450}
        y2={40}
        className="stroke-muted-foreground/40"
        strokeWidth={0.5}
      />

      {/* Rad 1: V|P|X|CC|M|PT|seq */}
      <g>
        <rect
          x={50}
          y={48}
          width={26}
          height={36}
          className="fill-brand/30 stroke-brand"
          strokeWidth={1}
        />
        <text x={63} y={62} textAnchor="middle" className="fill-foreground text-[8px]">
          V
        </text>
        <text x={63} y={75} textAnchor="middle" className="fill-muted-foreground text-[7px]">
          2b
        </text>

        <rect
          x={76}
          y={48}
          width={13}
          height={36}
          className="fill-brand/20 stroke-brand"
          strokeWidth={1}
        />
        <text x={82} y={62} textAnchor="middle" className="fill-foreground text-[8px]">
          P
        </text>

        <rect
          x={89}
          y={48}
          width={13}
          height={36}
          className="fill-brand/20 stroke-brand"
          strokeWidth={1}
        />
        <text x={95} y={62} textAnchor="middle" className="fill-foreground text-[8px]">
          X
        </text>

        <rect
          x={102}
          y={48}
          width={50}
          height={36}
          className="fill-brand/20 stroke-brand"
          strokeWidth={1}
        />
        <text x={127} y={62} textAnchor="middle" className="fill-foreground text-[8px]">
          CC
        </text>
        <text x={127} y={75} textAnchor="middle" className="fill-muted-foreground text-[7px]">
          4b
        </text>

        <rect
          x={152}
          y={48}
          width={13}
          height={36}
          className="fill-amber-500/30 stroke-amber-500"
          strokeWidth={1}
        />
        <text x={158} y={62} textAnchor="middle" className="fill-foreground text-[8px]">
          M
        </text>

        <rect
          x={165}
          y={48}
          width={85}
          height={36}
          className="fill-amber-500/30 stroke-amber-500"
          strokeWidth={1}
        />
        <text
          x={207}
          y={62}
          textAnchor="middle"
          className="fill-foreground text-[9px] font-semibold"
        >
          Payload Type
        </text>
        <text x={207} y={75} textAnchor="middle" className="fill-muted-foreground text-[7px]">
          7b
        </text>

        <rect
          x={250}
          y={48}
          width={200}
          height={36}
          className="fill-success/30 stroke-success"
          strokeWidth={1}
        />
        <text
          x={350}
          y={62}
          textAnchor="middle"
          className="fill-foreground text-[9px] font-semibold"
        >
          Sequence Number
        </text>
        <text x={350} y={75} textAnchor="middle" className="fill-muted-foreground text-[7px]">
          16 bits
        </text>
      </g>

      {/* Rad 2: Timestamp */}
      <rect
        x={50}
        y={92}
        width={400}
        height={36}
        className="fill-destructive/25 stroke-destructive"
        strokeWidth={1}
      />
      <text
        x={250}
        y={108}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Timestamp
      </text>
      <text x={250} y={120} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        32 bits — codec-spesifikk tids-enhet
      </text>

      {/* Rad 3: SSRC */}
      <rect
        x={50}
        y={136}
        width={400}
        height={36}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1}
      />
      <text
        x={250}
        y={152}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        SSRC (Synchronization Source)
      </text>
      <text x={250} y={164} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        32 bits — unik kilde-ID
      </text>

      {/* Payload */}
      <rect
        x={50}
        y={184}
        width={400}
        height={36}
        rx={3}
        className="fill-muted/50 stroke-muted-foreground/50"
        strokeWidth={1}
        strokeDasharray="3 2"
      />
      <text x={250} y={200} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        Payload (codec-data: G.711, Opus, H.264, ...)
      </text>
      <text x={250} y={213} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        variabel lengde
      </text>

      <text x={250} y={240} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Seq + Timestamp + SSRC er det mottakeren trenger for å bygge en koherent strøm
      </text>
    </svg>
  );
}

function DiffservSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        DiffServ-ruter — klassifiser, kø per klasse, scheduler velger
      </text>
      {/* Inn-pakker */}
      {[
        { y: 50, c: "fill-destructive", label: "EF" },
        { y: 80, c: "fill-amber-500", label: "AF" },
        { y: 110, c: "fill-amber-500", label: "AF" },
        { y: 140, c: "fill-success", label: "BE" },
        { y: 170, c: "fill-success", label: "BE" },
      ].map((p, i) => (
        <g key={i}>
          <rect x={20} y={p.y} width={28} height={18} rx={2} className={p.c} />
          <text
            x={34}
            y={p.y + 13}
            textAnchor="middle"
            className="fill-background text-[8px] font-bold"
          >
            {p.label}
          </text>
        </g>
      ))}

      {/* Klassifiserer */}
      <rect
        x={65}
        y={70}
        width={70}
        height={100}
        rx={5}
        className="fill-card stroke-brand"
        strokeWidth={1.5}
      />
      <text
        x={100}
        y={115}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-semibold"
      >
        Classifier
      </text>
      <text x={100} y={130} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        (les DSCP)
      </text>

      {/* Køer */}
      {[
        {
          y: 50,
          label: "EF-kø (priority)",
          border: "stroke-destructive",
          fill: "fill-destructive/10",
        },
        {
          y: 100,
          label: "AF-kø (WFQ vekt 0.5)",
          border: "stroke-amber-500",
          fill: "fill-amber-500/10",
        },
        {
          y: 150,
          label: "BE-kø (WFQ vekt 0.2)",
          border: "stroke-success",
          fill: "fill-success/10",
        },
      ].map((q, i) => (
        <g key={i}>
          <rect
            x={155}
            y={q.y}
            width={170}
            height={32}
            rx={4}
            className={`${q.fill} ${q.border}`}
            strokeWidth={1.5}
          />
          <text
            x={240}
            y={q.y + 14}
            textAnchor="middle"
            className="fill-foreground text-[9px] font-semibold"
          >
            {q.label}
          </text>
          {/* Pakker i køen */}
          {Array.from({ length: i === 0 ? 1 : i === 1 ? 3 : 5 }).map((_, k) => (
            <rect
              key={k}
              x={165 + k * 10}
              y={q.y + 18}
              width={8}
              height={10}
              className={`${q.fill.replace("/10", "")}`}
            />
          ))}
        </g>
      ))}

      {/* Scheduler */}
      <rect
        x={345}
        y={70}
        width={70}
        height={100}
        rx={5}
        className="fill-card stroke-brand"
        strokeWidth={1.5}
      />
      <text
        x={380}
        y={115}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-semibold"
      >
        Scheduler
      </text>
      <text x={380} y={130} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        (priority+WFQ)
      </text>

      {/* Ut */}
      <line
        x1={415}
        y1={120}
        x2={470}
        y2={120}
        className="stroke-foreground/60"
        strokeWidth={2}
        markerEnd="url(#dsArrow)"
      />
      <defs>
        <marker
          id="dsArrow"
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
      <text x={445} y={110} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        ut-lenke
      </text>

      <text x={250} y={210} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        EF tømmes alltid først; AF og BE deler resten etter WFQ-vekt
      </text>
    </svg>
  );
}

// ------------ 9.1: Jitter-metronom ------------
function JitterMetronomeSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Metronomen som hopper — gjennomsnitt riktig, takt feil
      </text>
      <text x={20} y={50} className="fill-muted-foreground text-[10px]">
        Sendt:
      </text>
      <line
        x1={60}
        y1={55}
        x2={460}
        y2={55}
        className="stroke-muted-foreground/40"
        strokeWidth={1}
      />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const x = 70 + i * 50;
        return (
          <g key={`s${i}`}>
            <line x1={x} y1={45} x2={x} y2={65} className="stroke-brand" strokeWidth={2} />
            <text x={x} y={82} textAnchor="middle" className="fill-muted-foreground text-[8px]">
              {i * 20}
            </text>
          </g>
        );
      })}
      <text x={20} y={120} className="fill-muted-foreground text-[10px]">
        Ankomst:
      </text>
      <line
        x1={60}
        y1={125}
        x2={460}
        y2={125}
        className="stroke-muted-foreground/40"
        strokeWidth={1}
      />
      {[
        { i: 0, off: 0 },
        { i: 1, off: -12 },
        { i: 2, off: 8 },
        { i: 3, off: 22 },
        { i: 4, off: -4 },
        { i: 5, off: 16 },
        { i: 6, off: -8 },
        { i: 7, off: 14 },
      ].map((p) => {
        const x = 70 + p.i * 50 + p.off;
        return (
          <g key={`a${p.i}`}>
            <line x1={x} y1={115} x2={x} y2={135} className="stroke-amber-500" strokeWidth={2} />
            <text x={x} y={152} textAnchor="middle" className="fill-muted-foreground text-[7px]">
              {p.off > 0 ? "+" : ""}
              {p.off}
            </text>
          </g>
        );
      })}
      <text
        x={250}
        y={185}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Selv om snittet ligger på 20 ms, vingler det ±22 ms
      </text>
      <text x={250} y={205} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Øret hører jitteret som hakking eller metallisk «zip»
      </text>
      <text
        x={250}
        y={222}
        textAnchor="middle"
        className="fill-purple-700 dark:fill-purple-400 text-[9px]"
      >
        Playout-buffer = ørepropp som skjuler hoppingen
      </text>
    </svg>
  );
}

// ------------ 9.1: Ferskvare-spekter ------------
function FreshnessSpectrumSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Ferskvare-spekteret — hvor lenge er en pakke verdt?
      </text>
      {/* Akse */}
      <line x1={40} y1={180} x2={470} y2={180} className="stroke-foreground/60" strokeWidth={1.5} />
      {[
        { x: 60, label: "0 ms", t: "Akkurat sendt" },
        { x: 160, label: "80 ms", t: "Cloud-gaming-grense" },
        { x: 260, label: "150 ms", t: "VoIP-grense" },
        { x: 360, label: "2 s", t: "Live-stream-grense" },
        { x: 450, label: "10 s+", t: "VOD-grense" },
      ].map((m) => (
        <g key={m.x}>
          <line
            x1={m.x}
            y1={175}
            x2={m.x}
            y2={185}
            className="stroke-foreground/60"
            strokeWidth={1}
          />
          <text
            x={m.x}
            y={198}
            textAnchor="middle"
            className="fill-foreground text-[8px] font-semibold"
          >
            {m.label}
          </text>
          <text x={m.x} y={212} textAnchor="middle" className="fill-muted-foreground text-[7px]">
            {m.t}
          </text>
        </g>
      ))}
      {/* Verdikurve */}
      <path
        d="M 60 50 L 160 60 L 260 90 L 360 140 L 450 165 L 470 175"
        className="fill-none stroke-success"
        strokeWidth={2}
      />
      {/* Fersk-sone */}
      <rect x={60} y={45} width={120} height={130} className="fill-success/10" />
      <text x={120} y={70} textAnchor="middle" className="fill-success text-[10px] font-semibold">
        Fersk
      </text>
      <text x={120} y={84} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        spises rått
      </text>
      {/* Brukbar */}
      <rect x={180} y={45} width={180} height={130} className="fill-amber-500/10" />
      <text
        x={270}
        y={70}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[10px] font-semibold"
      >
        Brukbar
      </text>
      <text x={270} y={84} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        må prosesseres
      </text>
      {/* Søppel */}
      <rect x={360} y={45} width={110} height={130} className="fill-destructive/10" />
      <text
        x={415}
        y={70}
        textAnchor="middle"
        className="fill-destructive text-[10px] font-semibold"
      >
        Søppel
      </text>
      <text x={415} y={84} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        drop / PLC
      </text>
      <text x={250} y={232} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Multimedia-applikasjoner velger UDP for å droppe råtten fisk umiddelbart
      </text>
    </svg>
  );
}

// ------------ 9.2: Bitrate-stige ------------
function BitrateLadderSvg() {
  const segWidth = 50;
  const bitrates = [
    { y: 50, label: "8 Mbps", c: "fill-success/30 stroke-success" },
    { y: 90, label: "2.5 Mbps", c: "fill-brand/30 stroke-brand" },
    { y: 130, label: "1 Mbps", c: "fill-amber-500/30 stroke-amber-500" },
    { y: 170, label: "0.4 Mbps", c: "fill-destructive/30 stroke-destructive" },
  ];
  // Per segment, hvilken bitrate ble valgt (index i bitrates)
  const choices = [0, 0, 1, 1, 2, 3, 2, 1];
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Bitrate-stigen — ABR plukker ett trinn per segment-luke
      </text>
      {bitrates.map((b) => (
        <g key={b.y}>
          <text x={48} y={b.y + 22} textAnchor="end" className="fill-muted-foreground text-[9px]">
            {b.label}
          </text>
          {choices.map((_, i) => (
            <rect
              key={i}
              x={60 + i * segWidth}
              y={b.y}
              width={segWidth - 4}
              height={30}
              rx={3}
              className={b.c}
              strokeWidth={1}
            />
          ))}
        </g>
      ))}
      {/* Markere valgt sti */}
      {choices.map((c, i) => {
        const x = 60 + i * segWidth + (segWidth - 4) / 2;
        const y = bitrates[c].y + 15;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={6}
            className="fill-purple-500 stroke-purple-700"
            strokeWidth={1.5}
          />
        );
      })}
      {/* Linje gjennom valgene */}
      <polyline
        points={choices
          .map((c, i) => `${60 + i * segWidth + (segWidth - 4) / 2},${bitrates[c].y + 15}`)
          .join(" ")}
        className="fill-none stroke-purple-500"
        strokeWidth={2}
      />
      <text x={250} y={215} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        Segm-1 Segm-2 Segm-3 Segm-4 Segm-5 Segm-6 Segm-7 Segm-8
      </text>
      <text x={250} y={232} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Lilla sti viser ABR-valg når båndbredden synker og hever seg igjen
      </text>
    </svg>
  );
}

// ------------ 9.2: ABR-løkka ------------
function AbrLoopSvg() {
  return (
    <svg viewBox="0 0 500 260" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        ABR-termostaten — løkka som kjøres per segment
      </text>
      {/* 4 noder i en sirkel */}
      {[
        { x: 250, y: 60, label: "Mål throughput", sub: "T = bytes/tid" },
        { x: 420, y: 140, label: "Velg bitrate", sub: "B ≤ T · 0.8" },
        { x: 250, y: 220, label: "Hent segment", sub: "GET via HTTP" },
        { x: 80, y: 140, label: "Oppdater buffer", sub: "+4 s" },
      ].map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={42} className="fill-card stroke-brand" strokeWidth={1.5} />
          <text
            x={n.x}
            y={n.y - 2}
            textAnchor="middle"
            className="fill-foreground text-[9px] font-semibold"
          >
            {n.label}
          </text>
          <text
            x={n.x}
            y={n.y + 12}
            textAnchor="middle"
            className="fill-muted-foreground text-[8px]"
          >
            {n.sub}
          </text>
        </g>
      ))}
      {/* Piler */}
      <defs>
        <marker
          id="abrArrow"
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={5}
          markerHeight={5}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-brand" />
        </marker>
      </defs>
      <path
        d="M 290 75 Q 380 80 388 110"
        className="fill-none stroke-brand"
        strokeWidth={1.5}
        markerEnd="url(#abrArrow)"
      />
      <path
        d="M 410 175 Q 380 220 290 215"
        className="fill-none stroke-brand"
        strokeWidth={1.5}
        markerEnd="url(#abrArrow)"
      />
      <path
        d="M 210 215 Q 120 220 92 175"
        className="fill-none stroke-brand"
        strokeWidth={1.5}
        markerEnd="url(#abrArrow)"
      />
      <path
        d="M 112 110 Q 120 80 210 75"
        className="fill-none stroke-brand"
        strokeWidth={1.5}
        markerEnd="url(#abrArrow)"
      />
      {/* Termostat-analogi i midten */}
      <text
        x={250}
        y={140}
        textAnchor="middle"
        className="fill-purple-700 dark:fill-purple-400 text-[10px] font-semibold"
      >
        Som termostat
      </text>
      <text x={250} y={156} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        mål · juster · vent · gjenta
      </text>
    </svg>
  );
}

// ------------ 9.3: PLC-reparasjon ------------
function PlcRepairSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        PLC: lim inn forrige pakke når en mangler
      </text>
      <text x={20} y={55} className="fill-muted-foreground text-[10px]">
        Sendt:
      </text>
      {[1, 2, 3, 4, 5, 6].map((i) => {
        const x = 70 + (i - 1) * 65;
        return (
          <g key={`s${i}`}>
            <rect
              x={x}
              y={45}
              width={55}
              height={28}
              rx={3}
              className="fill-brand/30 stroke-brand"
              strokeWidth={1}
            />
            <text x={x + 27} y={63} textAnchor="middle" className="fill-foreground text-[9px]">
              pkt {i}
            </text>
          </g>
        );
      })}
      <text x={20} y={115} className="fill-muted-foreground text-[10px]">
        Mottatt:
      </text>
      {[1, 2, 4, 5, 6].map((i) => {
        const x = 70 + (i - 1) * 65;
        return (
          <g key={`r${i}`}>
            <rect
              x={x}
              y={105}
              width={55}
              height={28}
              rx={3}
              className="fill-success/30 stroke-success"
              strokeWidth={1}
            />
            <text x={x + 27} y={123} textAnchor="middle" className="fill-foreground text-[9px]">
              pkt {i}
            </text>
          </g>
        );
      })}
      {/* Manglende pakke 3 */}
      <rect
        x={70 + 2 * 65}
        y={105}
        width={55}
        height={28}
        rx={3}
        className="fill-destructive/10 stroke-destructive"
        strokeWidth={1}
        strokeDasharray="3 2"
      />
      <text
        x={70 + 2 * 65 + 27}
        y={123}
        textAnchor="middle"
        className="fill-destructive text-[9px]"
      >
        tapt
      </text>

      <text x={20} y={185} className="fill-muted-foreground text-[10px]">
        Spilt:
      </text>
      {[1, 2, 3, 4, 5, 6].map((i) => {
        const x = 70 + (i - 1) * 65;
        const isPlc = i === 3;
        return (
          <g key={`p${i}`}>
            <rect
              x={x}
              y={175}
              width={55}
              height={28}
              rx={3}
              className={
                isPlc ? "fill-purple-500/30 stroke-purple-500" : "fill-success/30 stroke-success"
              }
              strokeWidth={1}
              strokeDasharray={isPlc ? "3 2" : undefined}
            />
            <text x={x + 27} y={193} textAnchor="middle" className="fill-foreground text-[9px]">
              {isPlc ? "kopi 2" : `pkt ${i}`}
            </text>
          </g>
        );
      })}
      <text x={250} y={228} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Øret merker ikke 20 ms gjentakelse — bedre enn 20 ms stillhet
      </text>
    </svg>
  );
}

// ------------ 9.3: Codec-kompromiss ------------
function CodecTradeoffSvg() {
  return (
    <svg viewBox="0 0 500 260" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Codec-kompromiss — kvalitet vs båndbredde vs tap-toleranse
      </text>
      {/* Akser */}
      <line x1={60} y1={220} x2={460} y2={220} className="stroke-foreground/60" strokeWidth={1.5} />
      <line x1={60} y1={220} x2={60} y2={50} className="stroke-foreground/60" strokeWidth={1.5} />
      <text x={250} y={245} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        Båndbredde →
      </text>
      <text
        x={22}
        y={135}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px]"
        transform="rotate(-90 22 135)"
      >
        Kvalitet →
      </text>

      {/* Codecs som bobler — radius = tap-toleranse */}
      {[
        {
          x: 380,
          y: 200,
          r: 8,
          name: "G.711",
          c: "fill-destructive/30 stroke-destructive",
          note: "64 kbps · 0% PLC",
        },
        {
          x: 100,
          y: 180,
          r: 6,
          name: "G.729",
          c: "fill-amber-500/30 stroke-amber-500",
          note: "8 kbps · 2%",
        },
        {
          x: 200,
          y: 100,
          r: 18,
          name: "Opus",
          c: "fill-success/30 stroke-success",
          note: "32 kbps · 10% FEC",
        },
        {
          x: 320,
          y: 140,
          r: 12,
          name: "AAC-LC",
          c: "fill-brand/30 stroke-brand",
          note: "128 kbps · 5%",
        },
        {
          x: 250,
          y: 70,
          r: 22,
          name: "Opus hi-q",
          c: "fill-success/40 stroke-success",
          note: "128 kbps · 10%",
        },
      ].map((p) => (
        <g key={p.name}>
          <circle cx={p.x} cy={p.y} r={p.r} className={p.c} strokeWidth={1.5} />
          <text
            x={p.x}
            y={p.y - p.r - 4}
            textAnchor="middle"
            className="fill-foreground text-[10px] font-semibold"
          >
            {p.name}
          </text>
          <text
            x={p.x}
            y={p.y + p.r + 12}
            textAnchor="middle"
            className="fill-muted-foreground text-[8px]"
          >
            {p.note}
          </text>
        </g>
      ))}
      <text x={460} y={230} textAnchor="end" className="fill-muted-foreground text-[8px] italic">
        sirkel-radius = tap-toleranse
      </text>
    </svg>
  );
}

// ------------ 9.4: RTCP-synk ------------
function RtcpSyncSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        RTCP SR — limer video-klokka og lyd-klokka til samme NTP-tid
      </text>
      {/* Video-strøm */}
      <line x1={70} y1={70} x2={430} y2={70} className="stroke-brand" strokeWidth={1.5} />
      <text x={20} y={75} className="fill-brand text-[10px] font-semibold">
        Video
      </text>
      {[80, 140, 200, 260, 320, 380].map((x, i) => (
        <g key={`v${i}`}>
          <rect x={x - 8} y={62} width={16} height={16} rx={2} className="fill-brand" />
          <text x={x} y={92} textAnchor="middle" className="fill-muted-foreground text-[7px]">
            ts={90000 * i}
          </text>
        </g>
      ))}
      {/* Audio-strøm */}
      <line x1={70} y1={140} x2={430} y2={140} className="stroke-success" strokeWidth={1.5} />
      <text x={20} y={145} className="fill-success text-[10px] font-semibold">
        Audio
      </text>
      {[80, 140, 200, 260, 320, 380].map((x, i) => (
        <g key={`a${i}`}>
          <rect x={x - 8} y={132} width={16} height={16} rx={2} className="fill-success" />
          <text x={x} y={162} textAnchor="middle" className="fill-muted-foreground text-[7px]">
            ts={48000 * i}
          </text>
        </g>
      ))}
      {/* SR-merker */}
      <line
        x1={80}
        y1={50}
        x2={80}
        y2={160}
        className="stroke-purple-500"
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      <text
        x={80}
        y={45}
        textAnchor="middle"
        className="fill-purple-700 dark:fill-purple-400 text-[9px] font-semibold"
      >
        SR @ NTP T₀
      </text>
      <line
        x1={260}
        y1={50}
        x2={260}
        y2={160}
        className="stroke-purple-500"
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      <text
        x={260}
        y={45}
        textAnchor="middle"
        className="fill-purple-700 dark:fill-purple-400 text-[9px] font-semibold"
      >
        SR @ NTP T₀+2s
      </text>
      <text
        x={250}
        y={195}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Video 90 kHz og audio 48 kHz har egne klokker
      </text>
      <text x={250} y={215} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        SR-pakka kobler hver klokke til samme NTP-tidspunkt
      </text>
      <text x={250} y={230} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        Uten SR ville lyd og bilde drifte fra hverandre
      </text>
    </svg>
  );
}

// ------------ 9.4: Mixer + SSRC ------------
function MixerSsrcSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Audio-mixer: tre SSRC inn, én SSRC ut, CSRC-liste forklarer
      </text>
      {/* Tre kilder */}
      {[
        { y: 50, name: "Alice", ssrc: "0xA1A1" },
        { y: 110, name: "Bob", ssrc: "0xB2B2" },
        { y: 170, name: "Cecilia", ssrc: "0xC3C3" },
      ].map((src, i) => (
        <g key={i}>
          <rect
            x={30}
            y={src.y - 18}
            width={90}
            height={36}
            rx={4}
            className="fill-card stroke-brand"
            strokeWidth={1.5}
          />
          <text
            x={75}
            y={src.y - 4}
            textAnchor="middle"
            className="fill-foreground text-[10px] font-semibold"
          >
            {src.name}
          </text>
          <text
            x={75}
            y={src.y + 10}
            textAnchor="middle"
            className="fill-muted-foreground text-[8px] font-mono"
          >
            SSRC {src.ssrc}
          </text>
          {/* Pil mot mixer */}
          <line
            x1={120}
            y1={src.y}
            x2={210}
            y2={120}
            className="stroke-foreground/40"
            strokeWidth={1.5}
          />
        </g>
      ))}
      {/* Mixer */}
      <rect
        x={210}
        y={90}
        width={100}
        height={60}
        rx={6}
        className="fill-purple-500/10 stroke-purple-500"
        strokeWidth={1.5}
      />
      <text
        x={260}
        y={115}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Audio Mixer
      </text>
      <text x={260} y={130} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        SSRC 0xMIX1
      </text>
      <text
        x={260}
        y={143}
        textAnchor="middle"
        className="fill-purple-700 dark:fill-purple-400 text-[8px]"
      >
        CC=3
      </text>
      {/* Pil ut */}
      <line
        x1={310}
        y1={120}
        x2={380}
        y2={120}
        className="stroke-brand"
        strokeWidth={2}
        markerEnd="url(#mixArrow)"
      />
      <defs>
        <marker
          id="mixArrow"
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-brand" />
        </marker>
      </defs>
      {/* Mottaker */}
      <rect
        x={380}
        y={90}
        width={100}
        height={60}
        rx={6}
        className="fill-card stroke-success"
        strokeWidth={1.5}
      />
      <text
        x={430}
        y={115}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Mottaker
      </text>
      <text
        x={430}
        y={130}
        textAnchor="middle"
        className="fill-muted-foreground text-[7px] font-mono"
      >
        ser SSRC=MIX1
      </text>
      <text
        x={430}
        y={142}
        textAnchor="middle"
        className="fill-muted-foreground text-[7px] font-mono"
      >
        CSRC=A,B,C
      </text>
      <text x={250} y={215} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Mottakeren ser én strøm, men CSRC-lista forteller at tre talere bidro
      </text>
    </svg>
  );
}

// ------------ 9.5: Token-bucket ------------
function TokenBucketSvg() {
  return (
    <svg viewBox="0 0 500 260" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Token bucket — drypp inn med rate r, brukes av pakker
      </text>
      {/* Kran som drypper tokens */}
      <rect
        x={40}
        y={40}
        width={50}
        height={20}
        rx={3}
        className="fill-muted/40 stroke-border"
        strokeWidth={1}
      />
      <text x={65} y={54} textAnchor="middle" className="fill-foreground text-[8px]">
        Token-kran
      </text>
      <text x={65} y={75} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        rate r
      </text>
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={65} cy={85 + i * 15} r={4} className="fill-amber-500" />
      ))}
      {/* Bøtta */}
      <path
        d="M 130 80 L 230 80 L 220 200 L 140 200 Z"
        className="fill-amber-500/10 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={180} y={75} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        Bøtte kapasitet b
      </text>
      {/* Tokens i bøtta */}
      {[
        { x: 155, y: 180 },
        { x: 175, y: 180 },
        { x: 195, y: 180 },
        { x: 210, y: 180 },
        { x: 165, y: 165 },
        { x: 185, y: 165 },
        { x: 200, y: 165 },
        { x: 175, y: 150 },
        { x: 190, y: 150 },
      ].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={5} className="fill-amber-500" />
      ))}
      {/* Pakker som ankommer */}
      <text x={310} y={75} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        Pakker inn:
      </text>
      {[
        { y: 90, ok: true, n: 3 },
        { y: 125, ok: true, n: 5 },
        { y: 160, ok: false, n: 8 },
        { y: 195, ok: true, n: 2 },
      ].map((p, i) => (
        <g key={i}>
          <rect
            x={290}
            y={p.y}
            width={40}
            height={22}
            rx={3}
            className={
              p.ok ? "fill-success/30 stroke-success" : "fill-destructive/30 stroke-destructive"
            }
            strokeWidth={1}
          />
          <text x={310} y={p.y + 14} textAnchor="middle" className="fill-foreground text-[9px]">
            {p.n} B
          </text>
          {/* Pil ut */}
          {p.ok ? (
            <>
              <line
                x1={335}
                y1={p.y + 11}
                x2={400}
                y2={p.y + 11}
                className="stroke-success"
                strokeWidth={1.5}
              />
              <text x={440} y={p.y + 14} textAnchor="middle" className="fill-success text-[9px]">
                sendes
              </text>
            </>
          ) : (
            <>
              <line
                x1={335}
                y1={p.y + 11}
                x2={400}
                y2={p.y + 11}
                className="stroke-destructive"
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
              <text
                x={440}
                y={p.y + 14}
                textAnchor="middle"
                className="fill-destructive text-[9px]"
              >
                droppes
              </text>
            </>
          )}
        </g>
      ))}
      <text x={250} y={235} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Pakke 3 ankommer med tomt bøtte → for stor burst, kastes
      </text>
    </svg>
  );
}

// ------------ 9.5: DSCP-merking ved edge ------------
function DscpMarkSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        DSCP-merking ved nett-edge — indre rutere stoler på stempelet
      </text>
      {/* Avsendere */}
      {[
        { y: 50, app: "VoIP-app", color: "fill-destructive", dscp: "EF (46)" },
        { y: 100, app: "ERP/SAP", color: "fill-amber-500", dscp: "AF21 (18)" },
        { y: 150, app: "Web-surf", color: "fill-success", dscp: "BE (0)" },
      ].map((a, i) => (
        <g key={i}>
          <rect
            x={30}
            y={a.y - 15}
            width={70}
            height={30}
            rx={4}
            className="fill-card stroke-border"
            strokeWidth={1}
          />
          <text
            x={65}
            y={a.y + 3}
            textAnchor="middle"
            className="fill-foreground text-[9px] font-semibold"
          >
            {a.app}
          </text>
          {/* Umerket pakke */}
          <rect
            x={110}
            y={a.y - 8}
            width={28}
            height={16}
            rx={2}
            className="fill-muted/40 stroke-border"
            strokeWidth={1}
          />
          <text
            x={124}
            y={a.y + 3}
            textAnchor="middle"
            className="fill-muted-foreground text-[7px]"
          >
            ?
          </text>
          {/* Pil til edge */}
          <line
            x1={140}
            y1={a.y}
            x2={195}
            y2={120}
            className="stroke-foreground/40"
            strokeWidth={1}
          />
        </g>
      ))}
      {/* Edge-ruter (marking) */}
      <rect
        x={195}
        y={90}
        width={90}
        height={60}
        rx={6}
        className="fill-purple-500/10 stroke-purple-500"
        strokeWidth={1.5}
      />
      <text
        x={240}
        y={115}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Edge-ruter
      </text>
      <text x={240} y={130} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        Marking
      </text>
      <text
        x={240}
        y={143}
        textAnchor="middle"
        className="fill-purple-700 dark:fill-purple-400 text-[8px]"
      >
        DSCP-stempel
      </text>
      {/* Pakker ut, fargede */}
      {[
        { y: 50, color: "fill-destructive", dscp: "EF" },
        { y: 100, color: "fill-amber-500", dscp: "AF21" },
        { y: 150, color: "fill-success", dscp: "BE" },
      ].map((p, i) => (
        <g key={i}>
          <line
            x1={285}
            y1={120}
            x2={335}
            y2={p.y}
            className="stroke-foreground/40"
            strokeWidth={1}
          />
          <rect
            x={335}
            y={p.y - 9}
            width={42}
            height={18}
            rx={2}
            className={`${p.color} stroke-foreground/30`}
            strokeWidth={1}
          />
          <text
            x={356}
            y={p.y + 3}
            textAnchor="middle"
            className="fill-background text-[8px] font-bold"
          >
            {p.dscp}
          </text>
        </g>
      ))}
      {/* Indre kjerne-ruter */}
      <rect
        x={400}
        y={70}
        width={70}
        height={100}
        rx={6}
        className="fill-card stroke-brand"
        strokeWidth={1.5}
      />
      <text
        x={435}
        y={115}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Kjerne
      </text>
      <text x={435} y={130} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        stateless
      </text>
      <text x={435} y={143} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        leser DSCP
      </text>
      <text x={250} y={210} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Edge gjør jobben én gang; alle indre rutere kan jobbe per-pakke uten state
      </text>
      <text x={250} y={228} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        Det er hva som lar DiffServ skalere til hele internett
      </text>
    </svg>
  );
}

// ============================================================
// Nye SVG-er for 9.7 (cheat sheet, sammenligning, anker, fallgruver)
// og defs-blokker for 9.1-9.5
// ============================================================

// 1) Tidstoleranse-graf: x = latens-budsjett, y = tap-toleranse, viser app-typer
function MultimediaToleranseSvg() {
  const apps = [
    { name: "Cloud gaming", x: 60, y: 0.2, color: "fill-rose-500" },
    { name: "WebRTC", x: 180, y: 1.0, color: "fill-orange-500" },
    { name: "VoIP / SIP", x: 280, y: 3.5, color: "fill-amber-500" },
    { name: "Live (DASH)", x: 480, y: 0.5, color: "fill-sky-500" },
    { name: "NRK VOD", x: 640, y: 0.1, color: "fill-emerald-500" },
    { name: "MQTT/IoT", x: 380, y: 5.0, color: "fill-violet-500" },
  ];
  // map latency ms -> x in chart 80..720; tap% -> y in chart 240..40
  const xMap = (ms: number) => 80 + (ms / 800) * 640;
  const yMap = (loss: number) => 240 - (loss / 6) * 200;
  return (
    <svg viewBox="0 0 760 300" className="w-full h-auto">
      <text
        x={380}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Tidstoleranse-kart for multimedia-apper
      </text>
      {/* axes */}
      <line x1={80} y1={240} x2={720} y2={240} className="stroke-foreground/50" strokeWidth={1.2} />
      <line x1={80} y1={40} x2={80} y2={240} className="stroke-foreground/50" strokeWidth={1.2} />
      {/* x-ticks */}
      {[0, 200, 400, 600, 800].map((ms) => (
        <g key={ms}>
          <line x1={xMap(ms)} y1={240} x2={xMap(ms)} y2={244} className="stroke-foreground/50" />
          <text
            x={xMap(ms)}
            y={256}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px]"
          >
            {ms}
          </text>
        </g>
      ))}
      <text x={400} y={280} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        Latens-budsjett (ms ende-til-ende)
      </text>
      {/* y-ticks */}
      {[0, 2, 4, 6].map((p) => (
        <g key={p}>
          <line x1={76} y1={yMap(p)} x2={80} y2={yMap(p)} className="stroke-foreground/50" />
          <text
            x={72}
            y={yMap(p) + 3}
            textAnchor="end"
            className="fill-muted-foreground text-[9px]"
          >
            {p}%
          </text>
        </g>
      ))}
      <text
        x={20}
        y={140}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px]"
        transform="rotate(-90 20 140)"
      >
        Tap-toleranse (% pakker)
      </text>
      {/* regions */}
      <rect x={80} y={40} width={170} height={200} className="fill-rose-500/10" />
      <text
        x={165}
        y={56}
        textAnchor="middle"
        className="fill-rose-700 dark:fill-rose-400 text-[10px] italic"
      >
        interaktiv
      </text>
      <rect x={250} y={40} width={230} height={200} className="fill-amber-500/10" />
      <text
        x={365}
        y={56}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[10px] italic"
      >
        live broadcast
      </text>
      <rect x={480} y={40} width={240} height={200} className="fill-emerald-500/10" />
      <text
        x={600}
        y={56}
        textAnchor="middle"
        className="fill-emerald-700 dark:fill-emerald-400 text-[10px] italic"
      >
        lagret (on-demand)
      </text>
      {/* points */}
      {apps.map((a) => (
        <g key={a.name}>
          <circle
            cx={xMap(a.x)}
            cy={yMap(a.y)}
            r={7}
            className={`${a.color} stroke-background`}
            strokeWidth={1.5}
          />
          <text
            x={xMap(a.x) + 10}
            y={yMap(a.y) + 4}
            className="fill-foreground text-[10px] font-semibold"
          >
            {a.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

// 2) Delay vs jitter — to kurver
function DelayVsJitterSvg() {
  // 30 pakker; en med konstant 100ms delay, en med jittery delay rundt 100
  const pkts = Array.from({ length: 30 }, (_, i) => i);
  const flat = pkts.map((i) => ({ x: 60 + i * 21, y: 130 }));
  const jit = pkts.map((i) => {
    const v = [
      0, 25, -15, 40, -30, 10, 35, -25, 20, -10, 45, -20, 5, 30, -35, 15, 50, -10, 25, -40, 10, 35,
      -20, 5, 40, -30, 15, -25, 30, -10,
    ][i];
    return { x: 60 + i * 21, y: 130 - v };
  });
  const flatPath = "M " + flat.map((p) => `${p.x},${p.y}`).join(" L ");
  const jitPath = "M " + jit.map((p) => `${p.x},${p.y}`).join(" L ");
  return (
    <svg viewBox="0 0 760 280" className="w-full h-auto">
      <text
        x={380}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Latens vs jitter — to forskjellige nettverk
      </text>
      <line x1={50} y1={220} x2={720} y2={220} className="stroke-foreground/50" />
      <line x1={50} y1={40} x2={50} y2={220} className="stroke-foreground/50" />
      <text x={385} y={250} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        Pakke-sekvensnr
      </text>
      <text
        x={20}
        y={130}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px]"
        transform="rotate(-90 20 130)"
      >
        Delay (ms)
      </text>
      {/* baseline */}
      <line
        x1={50}
        y1={130}
        x2={720}
        y2={130}
        className="stroke-foreground/20"
        strokeDasharray="2 3"
      />
      <text x={725} y={134} className="fill-muted-foreground text-[8px]">
        100ms
      </text>
      {/* flat curve */}
      <path d={flatPath} className="stroke-emerald-500 fill-none" strokeWidth={1.8} />
      {flat.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.5} className="fill-emerald-500" />
      ))}
      {/* jittery curve */}
      <path d={jitPath} className="stroke-rose-500 fill-none" strokeWidth={1.8} />
      {jit.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.5} className="fill-rose-500" />
      ))}
      {/* legend */}
      <rect x={500} y={45} width={210} height={50} rx={4} className="fill-card stroke-border" />
      <circle cx={515} cy={60} r={5} className="fill-emerald-500" />
      <text x={525} y={64} className="fill-foreground text-[10px]">
        Konstant 100ms — null jitter
      </text>
      <circle cx={515} cy={82} r={5} className="fill-rose-500" />
      <text x={525} y={86} className="fill-foreground text-[10px]">
        Snitt 100ms — stor jitter (±40ms)
      </text>
      <text x={385} y={272} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Begge har samme gjennomsnitts-delay; bare den røde gir hakkete VoIP
      </text>
    </svg>
  );
}

// 3) MOS-skala som visuell stige med ansikter
function MosLadderSvg() {
  const rows = [
    {
      score: 5,
      label: "Utmerket",
      desc: "Som å sitte i samme rom",
      color: "fill-emerald-500",
      face: ":D",
    },
    {
      score: 4,
      label: "God (toll-kvalitet)",
      desc: "Knapt merkbar forringelse",
      color: "fill-lime-500",
      face: ":)",
    },
    {
      score: 3,
      label: "Rimelig",
      desc: "Litt forstyrrende — men brukbar",
      color: "fill-amber-500",
      face: ":|",
    },
    {
      score: 2,
      label: "Dårlig",
      desc: "Krever konsentrasjon å forstå",
      color: "fill-orange-500",
      face: ":(",
    },
    {
      score: 1,
      label: "Uakseptabel",
      desc: "Kommunikasjon bryter sammen",
      color: "fill-rose-500",
      face: "D:",
    },
  ];
  return (
    <svg viewBox="0 0 700 280" className="w-full h-auto">
      <text
        x={350}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Mean Opinion Score — subjektiv kvalitets-stige
      </text>
      {rows.map((r, i) => {
        const y = 40 + i * 45;
        const w = 80 + (5 - i) * 90;
        return (
          <g key={r.score}>
            <rect x={120} y={y} width={w} height={36} rx={4} className={`${r.color} opacity-70`} />
            <circle
              cx={140}
              cy={y + 18}
              r={14}
              className="fill-card stroke-foreground/30"
              strokeWidth={1.2}
            />
            <text
              x={140}
              y={y + 22}
              textAnchor="middle"
              className="fill-foreground text-[11px] font-bold"
            >
              {r.face}
            </text>
            <text
              x={70}
              y={y + 23}
              textAnchor="middle"
              className="fill-foreground text-[14px] font-bold"
            >
              {r.score}
            </text>
            <text x={170} y={y + 16} className="fill-background text-[11px] font-semibold">
              {r.label}
            </text>
            <text x={170} y={y + 30} className="fill-background text-[9px]">
              {r.desc}
            </text>
          </g>
        );
      })}
      <text x={350} y={262} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        E-modellen: MOS ≈ 4.5 − 0.025·(delay/10) − 0.5·loss% − 0.02·jitter
      </text>
    </svg>
  );
}

// 4) DASH-arkitektur: server / CDN / klient
function DashArchitectureSvg() {
  return (
    <svg viewBox="0 0 760 320" className="w-full h-auto">
      <text
        x={380}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        DASH-arkitektur — NRK TV som eksempel
      </text>
      {/* Origin server */}
      <rect
        x={30}
        y={60}
        width={130}
        height={90}
        rx={6}
        className="fill-card stroke-foreground/50"
        strokeWidth={1.4}
      />
      <text x={95} y={82} textAnchor="middle" className="fill-foreground text-[11px] font-semibold">
        NRK Origin
      </text>
      <text x={95} y={98} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        MPD-manifest
      </text>
      <text x={95} y={112} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        256k / 512k / 1M /
      </text>
      <text x={95} y={124} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        2M / 4M / 8M-segmenter
      </text>
      <text x={95} y={142} textAnchor="middle" className="fill-brand text-[9px] italic">
        2-10 s lange
      </text>

      {/* CDN nodes */}
      <rect
        x={280}
        y={40}
        width={120}
        height={50}
        rx={6}
        className="fill-sky-500/15 stroke-sky-500/60"
        strokeWidth={1.4}
      />
      <text
        x={340}
        y={60}
        textAnchor="middle"
        className="fill-foreground text-[10.5px] font-semibold"
      >
        CDN Oslo
      </text>
      <text x={340} y={76} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        cache nær brukere
      </text>

      <rect
        x={280}
        y={115}
        width={120}
        height={50}
        rx={6}
        className="fill-sky-500/15 stroke-sky-500/60"
        strokeWidth={1.4}
      />
      <text
        x={340}
        y={135}
        textAnchor="middle"
        className="fill-foreground text-[10.5px] font-semibold"
      >
        CDN Tromsø
      </text>
      <text x={340} y={151} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        cache nær brukere
      </text>

      <rect
        x={280}
        y={190}
        width={120}
        height={50}
        rx={6}
        className="fill-sky-500/15 stroke-sky-500/60"
        strokeWidth={1.4}
      />
      <text
        x={340}
        y={210}
        textAnchor="middle"
        className="fill-foreground text-[10.5px] font-semibold"
      >
        CDN Bergen
      </text>
      <text x={340} y={226} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        cache nær brukere
      </text>

      {/* Clients */}
      <rect
        x={520}
        y={50}
        width={140}
        height={60}
        rx={6}
        className="fill-emerald-500/15 stroke-emerald-500/60"
        strokeWidth={1.4}
      />
      <text
        x={590}
        y={70}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Klient: TV-app
      </text>
      <text x={590} y={84} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        ABR + buffer 30 s
      </text>
      <text x={590} y={98} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        velger bitrate selv
      </text>

      <rect
        x={520}
        y={130}
        width={140}
        height={60}
        rx={6}
        className="fill-emerald-500/15 stroke-emerald-500/60"
        strokeWidth={1.4}
      />
      <text
        x={590}
        y={150}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Klient: mobil
      </text>
      <text x={590} y={164} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        faller til 512k på 4G
      </text>

      <rect
        x={520}
        y={210}
        width={140}
        height={60}
        rx={6}
        className="fill-emerald-500/15 stroke-emerald-500/60"
        strokeWidth={1.4}
      />
      <text
        x={590}
        y={230}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Klient: laptop
      </text>
      <text x={590} y={244} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        fiber: stabil 4M
      </text>

      {/* Arrows */}
      <line
        x1={160}
        y1={105}
        x2={278}
        y2={65}
        className="stroke-foreground/40"
        strokeWidth={1.4}
        markerEnd="url(#arr1)"
      />
      <line
        x1={160}
        y1={105}
        x2={278}
        y2={140}
        className="stroke-foreground/40"
        strokeWidth={1.4}
        markerEnd="url(#arr1)"
      />
      <line
        x1={160}
        y1={105}
        x2={278}
        y2={215}
        className="stroke-foreground/40"
        strokeWidth={1.4}
        markerEnd="url(#arr1)"
      />

      <line
        x1={400}
        y1={65}
        x2={520}
        y2={80}
        className="stroke-foreground/40"
        strokeWidth={1.4}
        markerEnd="url(#arr1)"
      />
      <line
        x1={400}
        y1={140}
        x2={520}
        y2={160}
        className="stroke-foreground/40"
        strokeWidth={1.4}
        markerEnd="url(#arr1)"
      />
      <line
        x1={400}
        y1={215}
        x2={520}
        y2={240}
        className="stroke-foreground/40"
        strokeWidth={1.4}
        markerEnd="url(#arr1)"
      />

      <defs>
        <marker id="arr1" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <polygon points="0 0, 8 4, 0 8" className="fill-foreground/50" />
        </marker>
      </defs>

      <text x={220} y={285} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        push segmenter
      </text>
      <text x={460} y={285} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        HTTPS GET — klient velger
      </text>
      <text
        x={380}
        y={305}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] italic"
      >
        Klienten styrer — serveren har ingen state om hvem som ser hva
      </text>
    </svg>
  );
}

// 5) RTP-header som byte-layout
function RtpHeaderBytesSvg() {
  // 12 byte header = 3 rows av 4 bytes (32 bit per row)
  return (
    <svg viewBox="0 0 760 280" className="w-full h-auto">
      <text
        x={380}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        RTP-header — 12 bytes (3 ord á 32 bit)
      </text>
      {/* bit markers */}
      <text x={70} y={50} className="fill-muted-foreground text-[8px]">
        0
      </text>
      <text x={235} y={50} className="fill-muted-foreground text-[8px]">
        8
      </text>
      <text x={400} y={50} className="fill-muted-foreground text-[8px]">
        16
      </text>
      <text x={565} y={50} className="fill-muted-foreground text-[8px]">
        24
      </text>
      <text x={720} y={50} className="fill-muted-foreground text-[8px]">
        31
      </text>

      {/* Row 1 */}
      <rect
        x={70}
        y={60}
        width={42}
        height={36}
        className="fill-rose-500/30 stroke-foreground/50"
      />
      <text x={91} y={82} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        V
      </text>
      <text x={91} y={92} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        2b
      </text>

      <rect
        x={112}
        y={60}
        width={22}
        height={36}
        className="fill-rose-500/20 stroke-foreground/50"
      />
      <text
        x={123}
        y={82}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        P
      </text>
      <text x={123} y={92} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        1
      </text>

      <rect
        x={134}
        y={60}
        width={22}
        height={36}
        className="fill-rose-500/20 stroke-foreground/50"
      />
      <text
        x={145}
        y={82}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        X
      </text>
      <text x={145} y={92} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        1
      </text>

      <rect
        x={156}
        y={60}
        width={80}
        height={36}
        className="fill-rose-500/30 stroke-foreground/50"
      />
      <text
        x={196}
        y={82}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        CC
      </text>
      <text x={196} y={92} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        4 bit
      </text>

      <rect
        x={236}
        y={60}
        width={22}
        height={36}
        className="fill-amber-500/30 stroke-foreground/50"
      />
      <text
        x={247}
        y={82}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        M
      </text>
      <text x={247} y={92} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        1
      </text>

      <rect
        x={258}
        y={60}
        width={142}
        height={36}
        className="fill-amber-500/30 stroke-foreground/50"
      />
      <text
        x={329}
        y={82}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        PT (payload type)
      </text>
      <text x={329} y={92} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        7 bit — codec-id
      </text>

      <rect
        x={400}
        y={60}
        width={336}
        height={36}
        className="fill-sky-500/30 stroke-foreground/50"
      />
      <text
        x={568}
        y={82}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Sequence Number
      </text>
      <text x={568} y={92} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        16 bit — øker per pakke, oppdager tap
      </text>

      {/* Row 2 — Timestamp */}
      <rect
        x={70}
        y={106}
        width={666}
        height={36}
        className="fill-emerald-500/30 stroke-foreground/50"
      />
      <text
        x={403}
        y={128}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Timestamp
      </text>
      <text x={403} y={138} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        32 bit — sampling-tidsstempel for playout-rekonstruksjon
      </text>

      {/* Row 3 — SSRC */}
      <rect
        x={70}
        y={152}
        width={666}
        height={36}
        className="fill-violet-500/30 stroke-foreground/50"
      />
      <text
        x={403}
        y={174}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        SSRC (Synchronization Source identifier)
      </text>
      <text x={403} y={184} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        32 bit — kilde-id, tilfeldig valgt per sender
      </text>

      {/* Optional CSRC */}
      <rect
        x={70}
        y={200}
        width={666}
        height={26}
        className="fill-card stroke-foreground/40"
        strokeDasharray="3 3"
      />
      <text
        x={403}
        y={218}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] italic"
      >
        CSRC[0..CC-1] — bare hvis CC &gt; 0 (mixer-tilfellet)
      </text>

      <text x={380} y={258} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Husk: V=2 (versjon), SEQ teller pakker, TS teller samples — ikke pakker
      </text>
    </svg>
  );
}

// 6) RTCP-pakke-typer som tabell-SVG
function RtcpTypesSvg() {
  const rows = [
    {
      code: 200,
      name: "SR",
      full: "Sender Report",
      who: "Aktiv sender",
      info: "NTP/RTP-tidsstempel + rcv-stats",
      color: "fill-emerald-500/20",
    },
    {
      code: 201,
      name: "RR",
      full: "Receiver Report",
      who: "Bare mottaker",
      info: "Tap-rate, jitter, last-SR-delay",
      color: "fill-sky-500/20",
    },
    {
      code: 202,
      name: "SDES",
      full: "Source Description",
      who: "Alle",
      info: "CNAME, NAME, EMAIL — identitet",
      color: "fill-amber-500/20",
    },
    {
      code: 203,
      name: "BYE",
      full: "Goodbye",
      who: "Forlater sesjon",
      info: "Eksplisitt avslutning",
      color: "fill-rose-500/20",
    },
    {
      code: 204,
      name: "APP",
      full: "Application-defined",
      who: "Hvem som helst",
      info: "App-spesifikk ekstra-info",
      color: "fill-violet-500/20",
    },
  ];
  return (
    <svg viewBox="0 0 760 280" className="w-full h-auto">
      <text
        x={380}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        RTCP-pakke-typer (PT = 200-204)
      </text>
      {/* header */}
      <rect x={30} y={36} width={700} height={28} className="fill-muted/40 stroke-foreground/30" />
      <text x={70} y={54} className="fill-foreground text-[10px] font-semibold">
        PT
      </text>
      <text x={130} y={54} className="fill-foreground text-[10px] font-semibold">
        Navn
      </text>
      <text x={230} y={54} className="fill-foreground text-[10px] font-semibold">
        Full betegnelse
      </text>
      <text x={420} y={54} className="fill-foreground text-[10px] font-semibold">
        Hvem sender
      </text>
      <text x={560} y={54} className="fill-foreground text-[10px] font-semibold">
        Innhold
      </text>
      {rows.map((r, i) => {
        const y = 64 + i * 36;
        return (
          <g key={r.code}>
            <rect
              x={30}
              y={y}
              width={700}
              height={36}
              className={`${r.color} stroke-foreground/30`}
            />
            <text x={70} y={y + 22} className="fill-foreground text-[11px] font-mono font-bold">
              {r.code}
            </text>
            <text x={130} y={y + 22} className="fill-foreground text-[11px] font-bold">
              {r.name}
            </text>
            <text x={230} y={y + 22} className="fill-foreground text-[10px]">
              {r.full}
            </text>
            <text x={420} y={y + 22} className="fill-muted-foreground text-[10px]">
              {r.who}
            </text>
            <text x={560} y={y + 22} className="fill-muted-foreground text-[10px]">
              {r.info}
            </text>
          </g>
        );
      })}
      <text x={380} y={264} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        RTCP-trafikk skal være ≤ 5 % av sesjonsbåndbredden — fordelt likt mellom sendere og
        mottakere
      </text>
    </svg>
  );
}

// 7) DiffServ vs IntServ side-ved-side
function DiffServVsIntServSvg() {
  return (
    <svg viewBox="0 0 760 300" className="w-full h-auto">
      <text
        x={380}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        DiffServ vs IntServ — to QoS-filosofier
      </text>
      {/* DiffServ panel */}
      <rect
        x={30}
        y={40}
        width={340}
        height={240}
        rx={8}
        className="fill-sky-500/10 stroke-sky-500/60"
        strokeWidth={1.4}
      />
      <text
        x={200}
        y={62}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        DiffServ
      </text>
      <text x={200} y={78} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        stateless, klassebasert
      </text>

      {/* Edge router classifies */}
      <rect x={50} y={100} width={70} height={40} rx={4} className="fill-card stroke-sky-500/70" />
      <text
        x={85}
        y={120}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Edge
      </text>
      <text x={85} y={132} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        setter DSCP
      </text>

      <line
        x1={120}
        y1={120}
        x2={170}
        y2={120}
        className="stroke-foreground/50"
        strokeWidth={1.4}
        markerEnd="url(#a-arr2)"
      />
      <rect x={170} y={100} width={70} height={40} rx={4} className="fill-card stroke-sky-500/70" />
      <text
        x={205}
        y={120}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Kjerne
      </text>
      <text x={205} y={132} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        leser DSCP
      </text>

      <line
        x1={240}
        y1={120}
        x2={290}
        y2={120}
        className="stroke-foreground/50"
        strokeWidth={1.4}
        markerEnd="url(#a-arr2)"
      />
      <rect x={290} y={100} width={70} height={40} rx={4} className="fill-card stroke-sky-500/70" />
      <text
        x={325}
        y={120}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Kjerne
      </text>
      <text x={325} y={132} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        leser DSCP
      </text>

      <text
        x={200}
        y={170}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        PHB per pakke
      </text>
      <text x={200} y={188} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        EF / AF / BE
      </text>
      <text
        x={200}
        y={210}
        textAnchor="middle"
        className="fill-emerald-700 dark:fill-emerald-400 text-[9.5px] font-semibold"
      >
        + skalerer
      </text>
      <text
        x={200}
        y={224}
        textAnchor="middle"
        className="fill-emerald-700 dark:fill-emerald-400 text-[9.5px]"
      >
        ingen state i kjernen
      </text>
      <text
        x={200}
        y={244}
        textAnchor="middle"
        className="fill-rose-700 dark:fill-rose-400 text-[9.5px] font-semibold"
      >
        − myke garantier
      </text>
      <text
        x={200}
        y={258}
        textAnchor="middle"
        className="fill-rose-700 dark:fill-rose-400 text-[9.5px]"
      >
        klasse, ikke flow
      </text>

      {/* IntServ panel */}
      <rect
        x={390}
        y={40}
        width={340}
        height={240}
        rx={8}
        className="fill-violet-500/10 stroke-violet-500/60"
        strokeWidth={1.4}
      />
      <text
        x={560}
        y={62}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        IntServ
      </text>
      <text x={560} y={78} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        stateful, per-flow (RSVP)
      </text>

      <rect
        x={410}
        y={100}
        width={70}
        height={40}
        rx={4}
        className="fill-card stroke-violet-500/70"
      />
      <text
        x={445}
        y={120}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        R1
      </text>
      <text x={445} y={132} textAnchor="middle" className="fill-muted-foreground text-[7.5px]">
        flow-state
      </text>

      <line
        x1={480}
        y1={120}
        x2={530}
        y2={120}
        className="stroke-violet-500/70"
        strokeWidth={1.4}
        strokeDasharray="2 2"
      />
      <rect
        x={530}
        y={100}
        width={70}
        height={40}
        rx={4}
        className="fill-card stroke-violet-500/70"
      />
      <text
        x={565}
        y={120}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        R2
      </text>
      <text x={565} y={132} textAnchor="middle" className="fill-muted-foreground text-[7.5px]">
        flow-state
      </text>

      <line
        x1={600}
        y1={120}
        x2={650}
        y2={120}
        className="stroke-violet-500/70"
        strokeWidth={1.4}
        strokeDasharray="2 2"
      />
      <rect
        x={650}
        y={100}
        width={70}
        height={40}
        rx={4}
        className="fill-card stroke-violet-500/70"
      />
      <text
        x={685}
        y={120}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        R3
      </text>
      <text x={685} y={132} textAnchor="middle" className="fill-muted-foreground text-[7.5px]">
        flow-state
      </text>

      <text
        x={560}
        y={170}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        RSVP-reservasjon per flow
      </text>
      <text x={560} y={188} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        båndbredde + buffer reserveres
      </text>
      <text
        x={560}
        y={210}
        textAnchor="middle"
        className="fill-emerald-700 dark:fill-emerald-400 text-[9.5px] font-semibold"
      >
        + harde garantier
      </text>
      <text
        x={560}
        y={224}
        textAnchor="middle"
        className="fill-emerald-700 dark:fill-emerald-400 text-[9.5px]"
      >
        deterministisk delay-tak
      </text>
      <text
        x={560}
        y={244}
        textAnchor="middle"
        className="fill-rose-700 dark:fill-rose-400 text-[9.5px] font-semibold"
      >
        − skalerer dårlig
      </text>
      <text
        x={560}
        y={258}
        textAnchor="middle"
        className="fill-rose-700 dark:fill-rose-400 text-[9.5px]"
      >
        state per flow i hver ruter
      </text>

      <defs>
        <marker id="a-arr2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <polygon points="0 0, 8 4, 0 8" className="fill-foreground/60" />
        </marker>
      </defs>
    </svg>
  );
}

// 8) Token-bucket som bøtte med tokens
function TokenBucketCheatSvg() {
  return (
    <svg viewBox="0 0 760 260" className="w-full h-auto">
      <text
        x={380}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Token bucket — burst opp til b, snitt-rate r
      </text>
      {/* tap drips tokens */}
      <text x={140} y={50} textAnchor="middle" className="fill-foreground text-[10px]">
        tokens kommer @ r/s
      </text>
      {[60, 80, 100].map((y) => (
        <circle key={y} cx={140} cy={y} r={4} className="fill-amber-500" />
      ))}
      {/* bucket */}
      <path
        d="M 80 110 L 80 220 Q 80 230 90 230 L 190 230 Q 200 230 200 220 L 200 110 Z"
        className="fill-amber-500/15 stroke-amber-500/70"
        strokeWidth={1.4}
      />
      <text
        x={140}
        y={130}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Bøtte (kapasitet b)
      </text>
      {/* tokens piled */}
      {[180, 195, 210, 218].map((y, i) => {
        const cols = i === 3 ? [105, 120, 135, 150, 165, 180] : [110, 130, 150, 170];
        return cols.map((x) => (
          <circle key={`${y}-${x}`} cx={x} cy={y} r={4} className="fill-amber-500" />
        ));
      })}
      <text x={140} y={250} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        akkumulerer når trafikk er lav
      </text>

      {/* packets needing tokens */}
      <text x={420} y={50} textAnchor="middle" className="fill-foreground text-[10px]">
        pakker krever 1 token hver
      </text>
      <line
        x1={240}
        y1={170}
        x2={580}
        y2={170}
        className="stroke-foreground/40"
        strokeWidth={1.2}
      />
      {["P5", "P4", "P3", "P2", "P1"].map((p, i) => (
        <g key={p}>
          <rect
            x={300 + i * 50}
            y={158}
            width={42}
            height={24}
            rx={3}
            className="fill-sky-500/30 stroke-sky-500/70"
          />
          <text
            x={321 + i * 50}
            y={174}
            textAnchor="middle"
            className="fill-foreground text-[10px] font-semibold"
          >
            {p}
          </text>
        </g>
      ))}
      <text x={420} y={210} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        5 pakker venter — alle kan sendes hvis bøtta har ≥ 5 tokens
      </text>

      {/* out arrow */}
      <line
        x1={580}
        y1={170}
        x2={720}
        y2={170}
        className="stroke-emerald-500"
        strokeWidth={1.8}
        markerEnd="url(#b-arr)"
      />
      <text
        x={650}
        y={160}
        textAnchor="middle"
        className="fill-emerald-700 dark:fill-emerald-400 text-[10px]"
      >
        utgang (raskt)
      </text>

      <defs>
        <marker id="b-arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <polygon points="0 0, 8 4, 0 8" className="fill-emerald-500" />
        </marker>
      </defs>
      <text x={380} y={232} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Kontrast: leaky bucket slipper alltid ut én og én med konstant rate — ingen burst tillatt
      </text>
    </svg>
  );
}

// 9) DASH vs RTP visuell sammenligning
function DashVsRtpVisualSvg() {
  return (
    <svg viewBox="0 0 760 320" className="w-full h-auto">
      <text
        x={380}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        DASH vs RTP — to streaming-stiler side-ved-side
      </text>
      {/* DASH */}
      <rect
        x={30}
        y={40}
        width={340}
        height={260}
        rx={8}
        className="fill-sky-500/10 stroke-sky-500/60"
        strokeWidth={1.4}
      />
      <text
        x={200}
        y={62}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        DASH — HTTPS-segmenter
      </text>
      <text x={60} y={88} className="fill-muted-foreground text-[10px]">
        Klient
      </text>
      <text x={310} y={88} className="fill-muted-foreground text-[10px]">
        Server
      </text>
      {[100, 140, 180, 220, 260].map((y, i) => (
        <g key={y}>
          <line
            x1={100}
            y1={y}
            x2={330}
            y2={y}
            className="stroke-sky-500/40"
            strokeDasharray="2 2"
          />
          <text x={75} y={y + 4} className="fill-foreground text-[9px]">
            GET seg{i + 1}
          </text>
          <line
            x1={100}
            y1={y}
            x2={325}
            y2={y}
            className="stroke-sky-500/70"
            strokeWidth={1.2}
            markerEnd="url(#c-arrR)"
          />
          <line
            x1={325}
            y1={y + 6}
            x2={105}
            y2={y + 6}
            className="stroke-emerald-500/70"
            strokeWidth={1.2}
            markerEnd="url(#c-arrL)"
          />
          <text x={340} y={y + 10} className="fill-emerald-700 dark:fill-emerald-400 text-[8px]">
            200
          </text>
        </g>
      ))}
      <text x={200} y={290} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        TCP + pull · stateless server · CDN-vennlig
      </text>

      {/* RTP */}
      <rect
        x={390}
        y={40}
        width={340}
        height={260}
        rx={8}
        className="fill-rose-500/10 stroke-rose-500/60"
        strokeWidth={1.4}
      />
      <text
        x={560}
        y={62}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        RTP — UDP-strøm
      </text>
      <text x={420} y={88} className="fill-muted-foreground text-[10px]">
        Mottaker
      </text>
      <text x={670} y={88} className="fill-muted-foreground text-[10px]">
        Sender
      </text>
      {/* RTSP SETUP */}
      <line
        x1={460}
        y1={100}
        x2={690}
        y2={100}
        className="stroke-rose-500/70"
        strokeWidth={1.2}
        markerEnd="url(#c-arrR)"
      />
      <text x={435} y={104} className="fill-foreground text-[9px]">
        SETUP
      </text>
      <line
        x1={690}
        y1={114}
        x2={465}
        y2={114}
        className="stroke-emerald-500/70"
        strokeWidth={1.2}
        markerEnd="url(#c-arrL)"
      />
      <text x={695} y={118} className="fill-emerald-700 dark:fill-emerald-400 text-[8px]">
        OK
      </text>
      <line
        x1={460}
        y1={128}
        x2={690}
        y2={128}
        className="stroke-rose-500/70"
        strokeWidth={1.2}
        markerEnd="url(#c-arrR)"
      />
      <text x={435} y={132} className="fill-foreground text-[9px]">
        PLAY
      </text>
      {/* continuous RTP pakker */}
      {[150, 170, 190, 210, 230, 250, 270].map((y, i) => (
        <g key={y}>
          <line
            x1={690}
            y1={y}
            x2={465}
            y2={y}
            className="stroke-rose-500"
            strokeWidth={1.5}
            markerEnd="url(#c-arrL)"
          />
          {i === 3 && (
            <g>
              <line x1={690} y1={y} x2={565} y2={y} className="stroke-rose-500" strokeWidth={1.5} />
              <text x={550} y={y + 4} className="fill-rose-700 dark:fill-rose-400 text-[8px]">
                X
              </text>
            </g>
          )}
        </g>
      ))}
      <text x={560} y={290} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        UDP + push · tap droppes · lavere latens
      </text>

      <defs>
        <marker id="c-arrR" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <polygon points="0 0, 8 4, 0 8" className="fill-foreground/60" />
        </marker>
        <marker id="c-arrL" markerWidth="8" markerHeight="8" refX="2" refY="4" orient="auto">
          <polygon points="8 0, 0 4, 8 8" className="fill-foreground/60" />
        </marker>
      </defs>
    </svg>
  );
}

// 10) 5-min anker visualisert som 15 kort i grid
function AnkerKortSvg() {
  const kort = [
    { n: 1, t: "3 typer", b: "lagret / live / interaktiv" },
    { n: 2, t: "150ms", b: "mund-til-øre-grense" },
    { n: 3, t: "Jitter", b: "variasjon, ikke delay" },
    { n: 4, t: "MOS 4.0", b: "toll-kvalitet" },
    { n: 5, t: "DASH", b: "TCP · pull · ABR" },
    { n: 6, t: "RTP 12B", b: "V/P/X/CC/M/PT/SEQ/TS/SSRC" },
    { n: 7, t: "UDP", b: "RTP gir ikke pålitelighet" },
    { n: 8, t: "RTCP", b: "SR · RR · SDES · BYE · APP" },
    { n: 9, t: "DiffServ", b: "DSCP, stateless" },
    { n: 10, t: "IntServ", b: "RSVP, per-flow state" },
    { n: 11, t: "Token b.", b: "burst b, rate r" },
    { n: 12, t: "Playout", b: "delay vs tap trade-off" },
    { n: 13, t: "WebRTC", b: "SRTP + ICE + DTLS" },
    { n: 14, t: "ABR", b: "throughput · buffer · hybrid" },
    { n: 15, t: "Best-eff.", b: "QoS kun innen ditt domene" },
  ];
  const colors = [
    "fill-emerald-500/20",
    "fill-sky-500/20",
    "fill-amber-500/20",
    "fill-rose-500/20",
    "fill-violet-500/20",
  ];
  return (
    <svg viewBox="0 0 760 380" className="w-full h-auto">
      <text
        x={380}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        15 anker-kort — én visuell repetisjon
      </text>
      {kort.map((k, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const x = 30 + col * 145;
        const y = 40 + row * 105;
        return (
          <g key={k.n}>
            <rect
              x={x}
              y={y}
              width={135}
              height={92}
              rx={6}
              className={`${colors[i % colors.length]} stroke-foreground/40`}
              strokeWidth={1.2}
            />
            <circle
              cx={x + 18}
              cy={y + 18}
              r={11}
              className="fill-card stroke-foreground/50"
              strokeWidth={1.1}
            />
            <text
              x={x + 18}
              y={y + 22}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-bold"
            >
              {k.n}
            </text>
            <text x={x + 36} y={y + 22} className="fill-foreground text-[11px] font-bold">
              {k.t}
            </text>
            <text
              x={x + 68}
              y={y + 55}
              textAnchor="middle"
              className="fill-muted-foreground text-[9.5px]"
            >
              <tspan x={x + 68} dy={0}>
                {k.b}
              </tspan>
            </text>
          </g>
        );
      })}
      <text x={380} y={370} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Gå gjennom kortene i rekkefølge — ett kort = ca. 20 s
      </text>
    </svg>
  );
}

// 11) Fallgruve: latens vs jitter — to kurver
function PitfallLatencyJitterSvg() {
  // Reuse style: line plot
  const pts1 = Array.from({ length: 25 }, (_, i) => ({ x: 40 + i * 16, y: 70 + i * 1.2 }));
  const pts2 = Array.from({ length: 25 }, (_, i) => {
    const noise = [
      0, 15, -10, 22, -18, 8, 24, -16, 14, -8, 26, -14, 4, 20, -22, 12, 28, -8, 18, -24, 8, 22, -14,
      6, 20,
    ][i];
    return { x: 40 + i * 16, y: 130 + noise };
  });
  const path1 = "M " + pts1.map((p) => `${p.x},${p.y}`).join(" L ");
  const path2 = "M " + pts2.map((p) => `${p.x},${p.y}`).join(" L ");
  return (
    <svg viewBox="0 0 760 220" className="w-full h-auto">
      <text
        x={380}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Fallgruve: latens (slow, jevn) ≠ jitter (rask snitt, hakkete)
      </text>
      <line x1={40} y1={190} x2={460} y2={190} className="stroke-foreground/40" />
      <line x1={40} y1={40} x2={40} y2={190} className="stroke-foreground/40" />
      <path d={path1} className="stroke-emerald-500 fill-none" strokeWidth={1.8} />
      <path d={path2} className="stroke-rose-500 fill-none" strokeWidth={1.8} />
      <text x={250} y={205} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        Pakke nr
      </text>
      <rect x={480} y={50} width={250} height={130} rx={6} className="fill-card stroke-border" />
      <circle cx={494} cy={70} r={5} className="fill-emerald-500" />
      <text x={504} y={74} className="fill-foreground text-[10px] font-semibold">
        Høy latens, lav jitter
      </text>
      <text x={504} y={88} className="fill-muted-foreground text-[9px]">
        300ms snitt, ±2ms
      </text>
      <text x={504} y={102} className="fill-muted-foreground text-[9px]">
        → video går fint, VoIP treigt
      </text>
      <circle cx={494} cy={124} r={5} className="fill-rose-500" />
      <text x={504} y={128} className="fill-foreground text-[10px] font-semibold">
        Lav latens, høy jitter
      </text>
      <text x={504} y={142} className="fill-muted-foreground text-[9px]">
        30ms snitt, ±25ms
      </text>
      <text x={504} y={156} className="fill-muted-foreground text-[9px]">
        → VoIP hakkete uten buffer
      </text>
      <text x={604} y={175} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        Eksamens-felle: blande de to
      </text>
    </svg>
  );
}

// 12) RTP-pålitelighet-myte
function PitfallRtpMythSvg() {
  return (
    <svg viewBox="0 0 760 220" className="w-full h-auto">
      <text
        x={380}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Fallgruve: «RTP er pålitelig» — nei, RTP kjører over UDP
      </text>
      {/* Sender */}
      <rect
        x={30}
        y={70}
        width={100}
        height={50}
        rx={6}
        className="fill-card stroke-foreground/40"
      />
      <text x={80} y={92} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        Sender
      </text>
      <text x={80} y={107} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        RTP/UDP
      </text>

      {/* Mottaker */}
      <rect
        x={630}
        y={70}
        width={100}
        height={50}
        rx={6}
        className="fill-card stroke-foreground/40"
      />
      <text
        x={680}
        y={92}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Mottaker
      </text>
      <text x={680} y={107} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        PLC/FEC
      </text>

      {/* packets */}
      {[1, 2, 3, 4, 5, 6].map((n, i) => {
        const x = 160 + i * 75;
        const dropped = n === 4;
        return (
          <g key={n}>
            <rect
              x={x}
              y={82}
              width={42}
              height={28}
              rx={3}
              className={
                dropped
                  ? "fill-rose-500/20 stroke-rose-500/70"
                  : "fill-emerald-500/20 stroke-emerald-500/70"
              }
              strokeDasharray={dropped ? "3 2" : undefined}
              strokeWidth={1.3}
            />
            <text
              x={x + 21}
              y={100}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-semibold"
            >
              SEQ {n}
            </text>
            {dropped && (
              <>
                <line
                  x1={x}
                  y1={82}
                  x2={x + 42}
                  y2={110}
                  className="stroke-rose-500"
                  strokeWidth={1.6}
                />
                <line
                  x1={x + 42}
                  y1={82}
                  x2={x}
                  y2={110}
                  className="stroke-rose-500"
                  strokeWidth={1.6}
                />
                <text
                  x={x + 21}
                  y={138}
                  textAnchor="middle"
                  className="fill-rose-700 dark:fill-rose-400 text-[9px]"
                >
                  tapt
                </text>
                <text
                  x={x + 21}
                  y={150}
                  textAnchor="middle"
                  className="fill-rose-700 dark:fill-rose-400 text-[9px]"
                >
                  ingen retransmit
                </text>
              </>
            )}
          </g>
        );
      })}
      <text x={380} y={180} textAnchor="middle" className="fill-foreground text-[10px]">
        Mottaker oppdager hullet via SEQ-nr — men må selv skjule det med PLC eller FEC
      </text>
      <text x={380} y={200} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Det RTP gir: deteksjon. Det RTP ikke gir: gjenoppretting.
      </text>
    </svg>
  );
}

// 13) DASH ABR-throughput-basert
function PitfallDashThroughputSvg() {
  return (
    <svg viewBox="0 0 760 230" className="w-full h-auto">
      <text
        x={380}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Fallgruve: DASH justerer ikke etter linkrate — etter målt throughput
      </text>
      {/* Klient */}
      <rect
        x={30}
        y={70}
        width={100}
        height={50}
        rx={6}
        className="fill-card stroke-foreground/40"
      />
      <text x={80} y={92} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        Klient
      </text>
      <text x={80} y={107} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        1 Gbit/s fiber
      </text>

      <line x1={130} y1={95} x2={250} y2={95} className="stroke-emerald-500" strokeWidth={2.5} />
      <text
        x={190}
        y={85}
        textAnchor="middle"
        className="fill-emerald-700 dark:fill-emerald-400 text-[9px]"
      >
        1 Gbit/s
      </text>

      {/* Mellom-hop bottleneck */}
      <rect
        x={250}
        y={70}
        width={120}
        height={50}
        rx={6}
        className="fill-amber-500/15 stroke-amber-500/60"
      />
      <text
        x={310}
        y={92}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        ISP-overgang
      </text>
      <text
        x={310}
        y={107}
        textAnchor="middle"
        className="fill-rose-700 dark:fill-rose-400 text-[9px]"
      >
        flaskehals 6 Mbit/s
      </text>

      <line
        x1={370}
        y1={95}
        x2={490}
        y2={95}
        className="stroke-rose-500"
        strokeWidth={1.5}
        strokeDasharray="3 2"
      />
      <text
        x={430}
        y={85}
        textAnchor="middle"
        className="fill-rose-700 dark:fill-rose-400 text-[9px]"
      >
        6 Mbit/s
      </text>

      {/* CDN */}
      <rect
        x={490}
        y={70}
        width={100}
        height={50}
        rx={6}
        className="fill-card stroke-foreground/40"
      />
      <text
        x={540}
        y={92}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        CDN
      </text>
      <text x={540} y={107} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        10 Gbit/s
      </text>

      <line x1={590} y1={95} x2={680} y2={95} className="stroke-emerald-500" strokeWidth={2.5} />

      {/* Origin */}
      <rect
        x={680}
        y={70}
        width={60}
        height={50}
        rx={6}
        className="fill-card stroke-foreground/40"
      />
      <text
        x={710}
        y={92}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Origin
      </text>

      <text
        x={380}
        y={160}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Resultat: DASH velger 4 Mbit/s — ikke 100 Mbit/s
      </text>
      <text x={380} y={180} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        Klienten måler segment-bytes / nedlastingstid = end-to-end-throughput
      </text>
      <text x={380} y={200} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Linken kan være 1 Gbit/s og kvaliteten kan likevel bli dårlig — flaskehalsen styrer
      </text>
    </svg>
  );
}

// 14) QoS-marking-respekt
function PitfallQosMarkingSvg() {
  return (
    <svg viewBox="0 0 760 230" className="w-full h-auto">
      <text
        x={380}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Fallgruve: DSCP-marking gjelder kun innen ditt eget ISP-domene
      </text>
      {/* tre domener */}
      <rect
        x={30}
        y={80}
        width={210}
        height={70}
        rx={6}
        className="fill-sky-500/15 stroke-sky-500/60"
      />
      <text
        x={135}
        y={102}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        ISP Tromsø
      </text>
      <text x={135} y={118} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        DSCP=EF respekteres
      </text>
      <text
        x={135}
        y={134}
        textAnchor="middle"
        className="fill-emerald-700 dark:fill-emerald-400 text-[9px]"
      >
        SLA med kunde
      </text>

      <rect
        x={275}
        y={80}
        width={210}
        height={70}
        rx={6}
        className="fill-amber-500/15 stroke-amber-500/60"
      />
      <text
        x={380}
        y={102}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Transit-AS
      </text>
      <text x={380} y={118} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        DSCP ofte strippet
      </text>
      <text
        x={380}
        y={134}
        textAnchor="middle"
        className="fill-rose-700 dark:fill-rose-400 text-[9px]"
      >
        best-effort
      </text>

      <rect
        x={520}
        y={80}
        width={210}
        height={70}
        rx={6}
        className="fill-sky-500/15 stroke-sky-500/60"
      />
      <text
        x={625}
        y={102}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        ISP Oslo
      </text>
      <text x={625} y={118} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        DSCP remappes
      </text>
      <text
        x={625}
        y={134}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[9px]"
      >
        egen klassifisering
      </text>

      {/* pakke + tegn */}
      <rect
        x={50}
        y={50}
        width={50}
        height={22}
        rx={3}
        className="fill-emerald-500/40 stroke-foreground/50"
      />
      <text x={75} y={66} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        EF
      </text>

      <rect
        x={300}
        y={50}
        width={50}
        height={22}
        rx={3}
        className="fill-amber-500/40 stroke-foreground/50"
        strokeDasharray="3 2"
      />
      <text x={325} y={66} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        ??
      </text>

      <rect
        x={555}
        y={50}
        width={50}
        height={22}
        rx={3}
        className="fill-amber-500/40 stroke-foreground/50"
      />
      <text x={580} y={66} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        AF
      </text>

      <line
        x1={100}
        y1={61}
        x2={300}
        y2={61}
        className="stroke-foreground/40"
        markerEnd="url(#d-arr)"
      />
      <line
        x1={350}
        y1={61}
        x2={555}
        y2={61}
        className="stroke-foreground/40"
        markerEnd="url(#d-arr)"
      />

      <defs>
        <marker id="d-arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <polygon points="0 0, 8 4, 0 8" className="fill-foreground/50" />
        </marker>
      </defs>

      <text x={380} y={185} textAnchor="middle" className="fill-foreground text-[10.5px]">
        QoS er et kontrakts-spørsmål mellom AS-er — ikke en protokoll-garanti
      </text>
      <text x={380} y={205} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Internett som helhet er best-effort; QoS finnes kun der noen har kjøpt det
      </text>
    </svg>
  );
}

// 15) Token vs leaky bucket
function PitfallTokenVsLeakySvg() {
  return (
    <svg viewBox="0 0 760 280" className="w-full h-auto">
      <text
        x={380}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Fallgruve: token bucket vs leaky bucket
      </text>
      {/* TOKEN */}
      <rect
        x={30}
        y={40}
        width={340}
        height={220}
        rx={8}
        className="fill-amber-500/8 stroke-amber-500/60"
        strokeWidth={1.4}
      />
      <text
        x={200}
        y={62}
        textAnchor="middle"
        className="fill-foreground text-[11.5px] font-semibold"
      >
        Token bucket — tillater burst
      </text>
      <path
        d="M 90 100 L 90 200 Q 90 210 100 210 L 180 210 Q 190 210 190 200 L 190 100 Z"
        className="fill-amber-500/15 stroke-amber-500/70"
      />
      {[160, 175, 190, 200].map((y, i) => {
        const xs = i === 3 ? [105, 120, 135, 150, 165, 175] : [105, 125, 145, 165];
        return xs.map((x, j) => (
          <circle key={`${y}-${j}`} cx={x} cy={y} r={3.5} className="fill-amber-500" />
        ));
      })}
      <text x={140} y={235} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        akkumulerer tokens
      </text>
      {/* burst out */}
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect
            key={i}
            x={220 + i * 25}
            y={150}
            width={20}
            height={18}
            rx={2}
            className="fill-sky-500/30 stroke-sky-500/70"
          />
        ))}
        <text
          x={280}
          y={138}
          textAnchor="middle"
          className="fill-emerald-700 dark:fill-emerald-400 text-[9px]"
        >
          5 pakker burst
        </text>
      </g>
      <text x={200} y={250} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        long-term ≤ r, kortsiktig burst ≤ b
      </text>

      {/* LEAKY */}
      <rect
        x={390}
        y={40}
        width={340}
        height={220}
        rx={8}
        className="fill-sky-500/8 stroke-sky-500/60"
        strokeWidth={1.4}
      />
      <text
        x={560}
        y={62}
        textAnchor="middle"
        className="fill-foreground text-[11.5px] font-semibold"
      >
        Leaky bucket — konstant ut-rate
      </text>
      <path
        d="M 450 100 L 450 200 Q 450 210 460 210 L 540 210 Q 550 210 550 200 L 550 100 Z"
        className="fill-sky-500/15 stroke-sky-500/70"
      />
      {/* queue inside */}
      {[110, 130, 150, 170].map((y, i) => (
        <rect
          key={y}
          x={462}
          y={y}
          width={76}
          height={16}
          rx={2}
          className="fill-sky-500/30 stroke-sky-500/70"
        />
      ))}
      {/* hole at bottom dripping */}
      <line x1={500} y1={210} x2={500} y2={228} className="stroke-sky-500" strokeWidth={1.5} />
      <circle cx={500} cy={232} r={3} className="fill-sky-500" />
      <circle cx={500} cy={245} r={3} className="fill-sky-500 opacity-60" />
      <circle cx={500} cy={258} r={3} className="fill-sky-500 opacity-30" />
      {/* one packet out at a time */}
      <rect
        x={600}
        y={195}
        width={20}
        height={18}
        rx={2}
        className="fill-sky-500/30 stroke-sky-500/70"
      />
      <text x={650} y={208} className="fill-emerald-700 dark:fill-emerald-400 text-[9px]">
        1 av gangen
      </text>

      <text x={560} y={250} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        tvinger jevn ut-rate uansett input
      </text>
    </svg>
  );
}

// === Defs-blokk-SVG-er for 9.1-9.5 ===

// 9.1 — 3 typer multimedia med tidskrav
function MmTypesTimebudgetSvg() {
  const rows = [
    {
      name: "Lagret video (NRK VOD)",
      budget: 5000,
      color: "fill-emerald-500",
      desc: "tåler stor buffer",
    },
    {
      name: "Live broadcast (NRK Sport)",
      budget: 10000,
      color: "fill-sky-500",
      desc: "glass-til-glass 2-10 s",
    },
    {
      name: "Samtidsinteraktiv (VoIP)",
      budget: 150,
      color: "fill-rose-500",
      desc: "mund-til-øre < 150 ms",
    },
  ];
  return (
    <svg viewBox="0 0 700 200" className="w-full h-auto">
      <text
        x={350}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Tre multimedia-typer og deres latens-budsjett
      </text>
      {/* log-ish scale */}
      <line x1={200} y1={50} x2={650} y2={50} className="stroke-foreground/40" />
      {[100, 1000, 10000].map((ms, i) => {
        const x = 200 + (Math.log10(ms / 100) / Math.log10(100)) * 450;
        return (
          <g key={ms}>
            <line x1={x} y1={48} x2={x} y2={52} className="stroke-foreground/50" />
            <text x={x} y={42} textAnchor="middle" className="fill-muted-foreground text-[9px]">
              {ms < 1000 ? `${ms}ms` : `${ms / 1000}s`}
            </text>
          </g>
        );
      })}
      {rows.map((r, i) => {
        const y = 70 + i * 42;
        const x = 200 + (Math.log10(r.budget / 100) / Math.log10(100)) * 450;
        return (
          <g key={r.name}>
            <text x={20} y={y + 14} className="fill-foreground text-[10px] font-semibold">
              {r.name}
            </text>
            <line
              x1={200}
              y1={y + 10}
              x2={x}
              y2={y + 10}
              className={`${r.color.replace("fill", "stroke")}`}
              strokeWidth={10}
              opacity={0.4}
            />
            <circle cx={x} cy={y + 10} r={6} className={r.color} />
            <text x={x + 12} y={y + 14} className="fill-muted-foreground text-[9px] italic">
              {r.desc}
            </text>
          </g>
        );
      })}
      <text x={350} y={195} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Logaritmisk skala — interaktiv har 30-100x mindre budsjett enn live
      </text>
    </svg>
  );
}

// 9.2 — bitrate-ladder + buffer-state
function BitrateLadderBufferSvg() {
  const ladder = [
    { res: "240p", br: 256, y: 200 },
    { res: "360p", br: 512, y: 170 },
    { res: "480p", br: 1000, y: 140 },
    { res: "720p", br: 2500, y: 110 },
    { res: "1080p", br: 5000, y: 80 },
    { res: "4K", br: 16000, y: 50 },
  ];
  return (
    <svg viewBox="0 0 760 260" className="w-full h-auto">
      <text
        x={380}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Bitrate-ladder + buffer-state (NRK TV)
      </text>
      {/* ladder vertical */}
      <line x1={140} y1={40} x2={140} y2={220} className="stroke-foreground/40" />
      {ladder.map((l) => (
        <g key={l.res}>
          <line x1={130} y1={l.y} x2={150} y2={l.y} className="stroke-foreground/40" />
          <rect
            x={155}
            y={l.y - 10}
            width={80}
            height={20}
            rx={3}
            className="fill-sky-500/20 stroke-sky-500/60"
          />
          <text
            x={195}
            y={l.y + 4}
            textAnchor="middle"
            className="fill-foreground text-[10px] font-semibold"
          >
            {l.res} · {l.br} kbps
          </text>
        </g>
      ))}
      <text x={140} y={240} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        Klient velger
      </text>

      {/* buffer state */}
      <rect x={320} y={60} width={400} height={140} rx={6} className="fill-card stroke-border" />
      <text
        x={520}
        y={80}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Buffer-state
      </text>
      <line x1={340} y1={170} x2={700} y2={170} className="stroke-foreground/30" />
      <text x={355} y={185} className="fill-muted-foreground text-[8.5px]">
        0s
      </text>
      <text x={690} y={185} className="fill-muted-foreground text-[8.5px]">
        60s
      </text>
      {/* buffer level curve */}
      <path
        d="M 340 165 Q 380 140, 420 115 T 520 95 T 620 130 T 700 110"
        className="stroke-emerald-500 fill-none"
        strokeWidth={2}
      />
      <line
        x1={340}
        y1={150}
        x2={700}
        y2={150}
        className="stroke-amber-500/60"
        strokeDasharray="3 3"
      />
      <text x={705} y={154} className="fill-amber-700 dark:fill-amber-400 text-[9px]">
        lav-vannmerke
      </text>
      <line
        x1={340}
        y1={100}
        x2={700}
        y2={100}
        className="stroke-rose-500/60"
        strokeDasharray="3 3"
      />
      <text x={705} y={104} className="fill-rose-700 dark:fill-rose-400 text-[9px]">
        høy-vannmerke
      </text>
      <text x={520} y={195} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        ABR: lavt buffer → velg lavere bitrate; høyt buffer → kan øke
      </text>
    </svg>
  );
}

// 9.3 — jitter-buffer + PLC
function JitterBufferPlcSvg() {
  return (
    <svg viewBox="0 0 760 260" className="w-full h-auto">
      <text
        x={380}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Jitter-buffer + Packet Loss Concealment (PLC) i VoIP
      </text>
      {/* network arrivals */}
      <text x={40} y={60} className="fill-foreground text-[10px] font-semibold">
        Nettverk ankomster
      </text>
      {[60, 130, 200, 290, 360, 470, 540, 620].map((x, i) => {
        const lost = i === 3;
        return (
          <g key={i}>
            <rect
              x={x}
              y={68}
              width={32}
              height={20}
              rx={2}
              className={
                lost ? "fill-rose-500/30 stroke-rose-500/70" : "fill-sky-500/30 stroke-sky-500/70"
              }
            />
            <text
              x={x + 16}
              y={83}
              textAnchor="middle"
              className="fill-foreground text-[9px] font-semibold"
            >
              {i + 1}
            </text>
            {lost && (
              <text
                x={x + 16}
                y={102}
                textAnchor="middle"
                className="fill-rose-700 dark:fill-rose-400 text-[8px]"
              >
                tapt
              </text>
            )}
          </g>
        );
      })}
      {/* buffer */}
      <rect
        x={40}
        y={130}
        width={680}
        height={50}
        rx={6}
        className="fill-amber-500/10 stroke-amber-500/60"
        strokeWidth={1.2}
      />
      <text x={50} y={148} className="fill-foreground text-[10px] font-semibold">
        Jitter-buffer (200 ms)
      </text>
      <text x={50} y={162} className="fill-muted-foreground text-[9px]">
        jevner ut ankomstvariasjon
      </text>
      <text x={50} y={174} className="fill-muted-foreground text-[9px]">
        PLC fyller hull med interpolert lyd
      </text>
      {/* playout — jevne */}
      <text x={40} y={205} className="fill-foreground text-[10px] font-semibold">
        Playout (jevn rate)
      </text>
      {[1, 2, 3, "PLC", 5, 6, 7, 8].map((v, i) => {
        const isPlc = v === "PLC";
        return (
          <g key={i}>
            <rect
              x={60 + i * 80}
              y={210}
              width={50}
              height={22}
              rx={2}
              className={
                isPlc
                  ? "fill-violet-500/30 stroke-violet-500/70"
                  : "fill-emerald-500/30 stroke-emerald-500/70"
              }
            />
            <text
              x={85 + i * 80}
              y={226}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-semibold"
            >
              {v}
            </text>
          </g>
        );
      })}
      <text x={380} y={254} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        PLC dekker tap 4 ved å gjenta/interpolere fra nabopakker — bedre enn stillhet
      </text>
    </svg>
  );
}

// 9.4 — RTP-header-felt-visualisering (kompakt)
function RtpFieldsVizSvg() {
  return (
    <svg viewBox="0 0 760 220" className="w-full h-auto">
      <text
        x={380}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        RTP-felt — hva hver del betyr i praksis
      </text>
      {/* Stack: hver felt med ikon */}
      {[
        { name: "V", desc: "RTP-versjon (alltid 2)", color: "fill-rose-500/30" },
        {
          name: "PT",
          desc: "Payload Type — hvilken codec (96 = Opus, osv)",
          color: "fill-amber-500/30",
        },
        {
          name: "SEQ",
          desc: "Sekvensnummer — oppdager tap og omstokking",
          color: "fill-sky-500/30",
        },
        {
          name: "TS",
          desc: "Timestamp — sampling-tid for rekonstruert playout",
          color: "fill-emerald-500/30",
        },
        {
          name: "SSRC",
          desc: "Synchronization Source — unik kilde-id",
          color: "fill-violet-500/30",
        },
      ].map((f, i) => {
        const y = 40 + i * 32;
        return (
          <g key={f.name}>
            <rect
              x={40}
              y={y}
              width={80}
              height={24}
              rx={3}
              className={`${f.color} stroke-foreground/50`}
            />
            <text
              x={80}
              y={y + 16}
              textAnchor="middle"
              className="fill-foreground text-[11px] font-bold"
            >
              {f.name}
            </text>
            <text x={140} y={y + 16} className="fill-foreground text-[10px]">
              {f.desc}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// 9.5 — token-bucket + leaky-bucket side-ved-side
function TokenLeakySideBySideSvg() {
  return (
    <svg viewBox="0 0 760 240" className="w-full h-auto">
      <text
        x={380}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Token vs leaky bucket — to formgivere
      </text>
      {/* Token */}
      <text
        x={170}
        y={48}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Token bucket
      </text>
      <path
        d="M 100 60 L 100 180 Q 100 190 110 190 L 230 190 Q 240 190 240 180 L 240 60 Z"
        className="fill-amber-500/15 stroke-amber-500/70"
      />
      {[160, 175, 185].map((y, i) => {
        const xs = i === 2 ? [115, 130, 145, 160, 175, 195, 215] : [120, 145, 170, 200];
        return xs.map((x) => (
          <circle key={`t-${y}-${x}`} cx={x} cy={y} r={3.2} className="fill-amber-500" />
        ));
      })}
      <text x={170} y={210} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        tokens akkumulerer
      </text>
      {/* pakker raskt ut */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={260 + i * 18}
          y={110}
          width={15}
          height={14}
          rx={2}
          className="fill-sky-500/30 stroke-sky-500/70"
        />
      ))}
      <text
        x={293}
        y={100}
        textAnchor="middle"
        className="fill-emerald-700 dark:fill-emerald-400 text-[9px]"
      >
        burst tillatt
      </text>

      {/* Leaky */}
      <text
        x={560}
        y={48}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Leaky bucket
      </text>
      <path
        d="M 490 60 L 490 180 Q 490 190 500 190 L 620 190 Q 630 190 630 180 L 630 60 Z"
        className="fill-sky-500/15 stroke-sky-500/70"
      />
      {/* packets queued inside */}
      {[80, 100, 120, 140, 160].map((y, i) => (
        <rect
          key={y}
          x={500}
          y={y}
          width={120}
          height={14}
          rx={2}
          className="fill-sky-500/30 stroke-sky-500/70"
        />
      ))}
      {/* drip */}
      <circle cx={560} cy={205} r={3} className="fill-sky-500" />
      <circle cx={560} cy={220} r={3} className="fill-sky-500 opacity-60" />
      <text x={680} y={208} className="fill-emerald-700 dark:fill-emerald-400 text-[9px]">
        én og én ut
      </text>
      <text x={560} y={235} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        konstant ut-rate
      </text>
    </svg>
  );
}

// === Examples timeline-SVG-er ===

// Timeline 9.1: Netflix TCP-retransmit vs samtale tap
function TimelineNetflixVsCallSvg() {
  return (
    <svg viewBox="0 0 760 220" className="w-full h-auto">
      <text
        x={380}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Tidslinje: TCP-pause (200 ms RTO) — Netflix vs samtale
      </text>
      {/* Netflix row */}
      <text x={20} y={68} className="fill-foreground text-[10px] font-semibold">
        Netflix
      </text>
      <line x1={80} y1={70} x2={720} y2={70} className="stroke-emerald-500" strokeWidth={3} />
      <rect
        x={300}
        y={62}
        width={60}
        height={16}
        className="fill-amber-500/30 stroke-amber-500/70"
      />
      <text x={330} y={74} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        TCP RTX
      </text>
      <text x={400} y={90} className="fill-muted-foreground text-[9px] italic">
        buffer absorberer pausen — seeren ser ingenting
      </text>

      {/* Samtale row */}
      <text x={20} y={148} className="fill-foreground text-[10px] font-semibold">
        Samtale
      </text>
      <line x1={80} y1={150} x2={720} y2={150} className="stroke-emerald-500" strokeWidth={3} />
      <rect
        x={300}
        y={142}
        width={60}
        height={16}
        className="fill-rose-500/30 stroke-rose-500/70"
      />
      <text
        x={330}
        y={154}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-semibold"
      >
        200 ms!
      </text>
      <text x={400} y={170} className="fill-rose-700 dark:fill-rose-400 text-[9px] italic">
        stillhet i lyden — samtalen brekker
      </text>

      <text x={380} y={205} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Samme TCP-mekanisme; ulik konsekvens fordi bufferet er ulikt
      </text>
    </svg>
  );
}

// Timeline 9.2: DASH segment fetch
function TimelineDashSegmentSvg() {
  return (
    <svg viewBox="0 0 760 220" className="w-full h-auto">
      <text
        x={380}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Tidslinje: DASH ABR — én sesjon på NRK
      </text>
      <line x1={60} y1={170} x2={720} y2={170} className="stroke-foreground/40" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line
          key={i}
          x1={60 + i * 80}
          y1={166}
          x2={60 + i * 80}
          y2={174}
          className="stroke-foreground/40"
        />
      ))}
      <text x={60} y={195} className="fill-muted-foreground text-[9px]">
        t=0
      </text>
      <text x={700} y={195} className="fill-muted-foreground text-[9px]">
        t=56s
      </text>
      {/* Segments with quality coding */}
      {[
        { br: 512, h: 30 },
        { br: 1000, h: 50 },
        { br: 2500, h: 80 },
        { br: 2500, h: 80 },
        { br: 5000, h: 110 },
        { br: 5000, h: 110 },
        { br: 2500, h: 80 },
        { br: 1000, h: 50 },
      ].map((s, i) => (
        <g key={i}>
          <rect
            x={60 + i * 80}
            y={170 - s.h}
            width={75}
            height={s.h}
            className="fill-sky-500/30 stroke-sky-500/70"
          />
          <text
            x={97 + i * 80}
            y={165 - s.h + 14}
            textAnchor="middle"
            className="fill-foreground text-[9px] font-semibold"
          >
            {s.br}k
          </text>
        </g>
      ))}
      <text x={380} y={50} textAnchor="middle" className="fill-foreground text-[10px]">
        Klienten justerer opp/ned per segment basert på throughput og buffer
      </text>
    </svg>
  );
}

// Timeline 9.3: VoIP playout med jitter-buffer
function TimelineVoipPlayoutSvg() {
  // arrivals (jittery) on top, playout (smooth) on bottom
  const arrivals = [50, 55, 62, 110, 115, 125, 170, 195, 230, 280, 305];
  const playout = arrivals.map((a, i) => 50 + i * 25);
  return (
    <svg viewBox="0 0 760 220" className="w-full h-auto">
      <text
        x={380}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Tidslinje: jittery ankomster vs glatt playout (VoIP)
      </text>
      <text x={20} y={75} className="fill-foreground text-[10px] font-semibold">
        Ankomst
      </text>
      <line x1={80} y1={75} x2={720} y2={75} className="stroke-foreground/30" />
      {arrivals.map((a, i) => (
        <g key={i}>
          <line
            x1={80 + a * 2}
            y1={65}
            x2={80 + a * 2}
            y2={85}
            className="stroke-rose-500"
            strokeWidth={2}
          />
          <text
            x={80 + a * 2}
            y={60}
            textAnchor="middle"
            className="fill-rose-700 dark:fill-rose-400 text-[8px]"
          >
            {i + 1}
          </text>
        </g>
      ))}
      <text x={20} y={155} className="fill-foreground text-[10px] font-semibold">
        Playout
      </text>
      <line x1={80} y1={155} x2={720} y2={155} className="stroke-foreground/30" />
      {playout.map((p, i) => (
        <g key={i}>
          <line
            x1={80 + p * 2}
            y1={145}
            x2={80 + p * 2}
            y2={165}
            className="stroke-emerald-500"
            strokeWidth={2}
          />
          <text
            x={80 + p * 2}
            y={180}
            textAnchor="middle"
            className="fill-emerald-700 dark:fill-emerald-400 text-[8px]"
          >
            {i + 1}
          </text>
        </g>
      ))}
      <text x={380} y={205} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Bufferet venter til t = ankomst_1 + delay-budsjett, så slipper én pakke hver 20 ms
      </text>
    </svg>
  );
}

// Timeline 9.4: RTP pakketog
function TimelineRtpTrainSvg() {
  return (
    <svg viewBox="0 0 760 200" className="w-full h-auto">
      <text
        x={380}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Tidslinje: RTP-strøm med SEQ og TS økende
      </text>
      <line x1={40} y1={120} x2={720} y2={120} className="stroke-foreground/40" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const x = 70 + i * 80;
        return (
          <g key={i}>
            <rect
              x={x}
              y={70}
              width={60}
              height={50}
              rx={3}
              className="fill-violet-500/20 stroke-violet-500/70"
            />
            <text
              x={x + 30}
              y={88}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-bold"
            >
              RTP {i + 1}
            </text>
            <text
              x={x + 30}
              y={102}
              textAnchor="middle"
              className="fill-muted-foreground text-[8px]"
            >
              SEQ {1001 + i}
            </text>
            <text
              x={x + 30}
              y={115}
              textAnchor="middle"
              className="fill-muted-foreground text-[8px]"
            >
              TS {8000 + i * 160}
            </text>
          </g>
        );
      })}
      <text x={380} y={155} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        SEQ øker med 1, TS øker med samples per pakke (160 for 20 ms @ 8 kHz)
      </text>
      <text x={380} y={175} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Et hull i SEQ avslører tap; TS lar mottakeren rekonstruere playout-tid
      </text>
    </svg>
  );
}

// Timeline 9.5: token-bucket over tid med pakke-ankomster
function TimelineTokenBucketSvg() {
  // 10 time slots; tokens-grafen og pakke-slipps
  const slots = Array.from({ length: 10 }, (_, i) => i);
  const tokens = [2, 3, 4, 5, 1, 2, 3, 4, 5, 3];
  const arrivals = [0, 0, 0, 4, 0, 0, 0, 0, 0, 2]; // burst at t=3 og t=9
  return (
    <svg viewBox="0 0 760 240" className="w-full h-auto">
      <text
        x={380}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Tidslinje: token-bucket — akkumulasjon, burst, ut-strøm
      </text>
      <line x1={60} y1={180} x2={720} y2={180} className="stroke-foreground/40" />
      {slots.map((i) => {
        const x = 80 + i * 65;
        const hT = tokens[i] * 14;
        const hA = arrivals[i] * 14;
        return (
          <g key={i}>
            <rect
              x={x}
              y={180 - hT}
              width={26}
              height={hT}
              className="fill-amber-500/40 stroke-amber-500/70"
            />
            <rect
              x={x + 30}
              y={180 - hA}
              width={26}
              height={hA}
              className="fill-sky-500/40 stroke-sky-500/70"
            />
            <text
              x={x + 28}
              y={200}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              t{i}
            </text>
          </g>
        );
      })}
      <rect x={620} y={40} width={130} height={50} rx={4} className="fill-card stroke-border" />
      <rect
        x={628}
        y={50}
        width={14}
        height={14}
        className="fill-amber-500/40 stroke-amber-500/70"
      />
      <text x={650} y={62} className="fill-foreground text-[9px]">
        tokens i bøtta
      </text>
      <rect x={628} y={68} width={14} height={14} className="fill-sky-500/40 stroke-sky-500/70" />
      <text x={650} y={80} className="fill-foreground text-[9px]">
        pakker sendt
      </text>
      <text x={380} y={225} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Ved t=3: 4 pakker burst — tillatt fordi bøtta hadde 5 tokens; bøtta tømmes
      </text>
    </svg>
  );
}
