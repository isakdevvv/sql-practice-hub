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

type Tab = "intro" | "9.1" | "9.2" | "9.3" | "9.4" | "9.5" | "9.6";

export function KuroseKap9Page() {
  const [tab, setTab] = useState<Tab>("intro");
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <a
              href="/stack/kurose-kurs"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <FolderOpen className="h-3 w-3" /> Kurose-kurset
            </a>
            <span>·</span>
            <span>Kapittel 9 av 9</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Kap. 9 — Multimedia-nettverk</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Lyd og video stiller helt andre krav til nettet enn fil-overføringer. Vi ser på hva
            jitter, delay og pakketap betyr for opplevelsen — og hvilke triks (DASH, RTP, QoS) som
            brukes for å takle dem.
          </p>
        </header>

        <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border">
          <TabBtn active={tab === "intro"} onClick={() => setTab("intro")}>
            Start her
          </TabBtn>
          <TabBtn active={tab === "9.1"} onClick={() => setTab("9.1")}>
            9.1 Multimedia-apper
          </TabBtn>
          <TabBtn active={tab === "9.2"} onClick={() => setTab("9.2")}>
            9.2 DASH
          </TabBtn>
          <TabBtn active={tab === "9.3"} onClick={() => setTab("9.3")}>
            9.3 VoIP
          </TabBtn>
          <TabBtn active={tab === "9.4"} onClick={() => setTab("9.4")}>
            9.4 RTP/RTSP
          </TabBtn>
          <TabBtn active={tab === "9.5"} onClick={() => setTab("9.5")}>
            9.5 QoS
          </TabBtn>
          <TabBtn active={tab === "9.6"} onClick={() => setTab("9.6")}>
            9.6 Oppgaver
          </TabBtn>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "9.1" && <Section91 />}
        {tab === "9.2" && <Section92 />}
        {tab === "9.3" && <Section93 />}
        {tab === "9.4" && <Section94 />}
        {tab === "9.5" && <Section95 />}
        {tab === "9.6" && <Section96 />}

        <ChapterPager prev={{ slug: "kurose-kap-8", title: "Sikkerhet i nettverk" }} />
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
    <div className="space-y-4 text-sm">
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

      <Defs
        items={[
          {
            term: "Lagret strømmende video (eks. Netflix, YouTube VOD)",
            body: "Innholdet ligger ferdig på en server og strømmes ut etterhvert som klienten trenger neste segment. Tåler høy oppstarts-delay (3–5 sekunder buffer er greit), men selve playbacken må flyte. Kan løses elegant med HTTP over TCP fordi vi har tid til retransmisjoner.",
          },
          {
            term: "Sann-tids samtale (VoIP, video-møte)",
            body: "To eller flere parter snakker live. Total ende-til-ende-delay må holdes under ca. 150 ms for naturlig opplevelse; over 400 ms blir samtalen vanskelig. Tåler litt tap (5–10 % med god PLC) bedre enn ekstra delay.",
          },
          {
            term: "Live streaming (sport, konsert, live nyheter)",
            body: "Mellomting: én sender, mange mottakere, men hendelsen skjer akkurat nå. Glass-to-glass delay 2–10 sekunder er vanlig for HLS/DASH-basert sending; lav-latens-protokoller (LL-HLS, WebRTC) kan komme under 1 sekund.",
          },
          {
            term: "Jitter",
            body: "Variasjon i pakke-ankomster. Hvis hver pakke representerer 20 ms lyd og to nabopakker kommer henholdsvis 5 ms og 45 ms etter forrige, så har vi 40 ms jitter. Jitter måles ofte som standardavvik eller som differensen mellom forventet og faktisk ankomst (RFC 3550-formelen).",
          },
          {
            term: "Tap-toleranse",
            body: "Hvor mange prosent pakker som kan forsvinne uten merkbar kvalitetsforringelse. For Opus-kodet tale med PLC: opp mot 10 % kan skjules akseptabelt. For ukomprimert video: i praksis null.",
          },
          {
            term: "Mean Opinion Score (MOS)",
            body: "Subjektiv kvalitetsskala 1–5 brukt for lyd/video. 5 = perfekt, 4 = bra, 3 = akseptabel, 2 = dårlig, 1 = ubrukelig. E-modellen kan beregne en estimert MOS fra delay, tap og jitter.",
          },
          {
            term: "End-to-end vs interaktiv delay",
            body: "End-to-end er tiden fra mikrofon til høyttaler på andre siden. Interaktiv delay er det som påvirker hvor lett det er å ha en samtale — den merkes som å «snakke i munnen på hverandre» eller pinlige pauser.",
          },
        ]}
      />

      <Illustration caption="Krav-rom: hver applikasjons-type plassert etter delay-budsjett og tap-toleranse.">
        <RequirementsSvg />
      </Illustration>

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
      </Example>

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

      <Defs
        items={[
          {
            term: "MPD (Media Presentation Description)",
            body: "XML-fil klienten henter først. Den lister alle tilgjengelige bitrate-varianter, segment-lengde, hvor segmentene ligger (URL-mønster), og hvilke språk-spor som finnes. Tilsvarer en «meny» klienten velger fra.",
          },
          {
            term: "Segment",
            body: "Et selvstendig stykke video som kan dekodes uten å vite om naboene. Hver variant produserer én segment-fil per tidsvindu — for eksempel video_720p_005.m4s, video_720p_006.m4s, og så videre.",
          },
          {
            term: "Bitrate-varianter (representations)",
            body: "Den samme videoen kodet på N ulike kvalitetsnivåer, for eksempel 240p/400 kbps, 480p/1 Mbps, 720p/2.5 Mbps, 1080p/5 Mbps, 2160p/15 Mbps. Lagres som separate filer på serveren.",
          },
          {
            term: "ABR-algoritme (Adaptive Bitrate)",
            body: "Klient-logikken som velger neste bitrate. Tre hovedsignaler den kan bruke: estimert nett-throughput, hvor full bufferet er, og en blanding av begge. Mål: høyest mulig bitrate uten å tømme bufferet og forårsake re-buffering.",
          },
          {
            term: "Throughput-basert ABR",
            body: "Klienten måler hvor lang tid forrige segment tok å laste ned, regner ut effektiv bandwidth, og velger neste segment med litt margin under det. Reagerer raskt, men kan vingle (bitrate-oscillation) hvis nettet er ustabilt.",
          },
          {
            term: "Buffer-basert ABR",
            body: "Klienten ser på hvor mange sekunder video som ligger ferdig i bufferet. Mye buffer → vi har råd til høyere bitrate; lite buffer → ned med bitraten for å unngå å tømme. Stabilere enn ren throughput-måling.",
          },
          {
            term: "Re-buffering",
            body: "Når bufferet tømmes og playbacken må stoppe og vente på neste segment. Den verste opplevelsen for brukeren — målet for ABR er null re-buffering, selv på bekostning av lavere bitrate.",
          },
        ]}
      />

      <Illustration caption="DASH-arkitekturen: server lagrer hvert segment i flere bitrater; klienten plukker per segment.">
        <DashSvg />
      </Illustration>

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
      </Example>

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

      <Defs
        items={[
          {
            term: "Codec",
            body: "Algoritme som komprimerer lyd til en strøm av bits. Velges som kompromiss mellom kvalitet og båndbredde — og hvor godt den tåler tap.",
          },
          {
            term: "G.711",
            body: "Den klassiske telefon-codecen fra 1972. Sampler 8 kHz, bruker 8 bits per sample → 64 kbps. Ingen komprimering, lav kompleksitet, alle systemer støtter den. Sliter med pakketap fordi det ikke er noen indre redundans å lene seg på.",
          },
          {
            term: "Opus",
            body: "Moderne åpen codec (RFC 6716). Variabel bitrate 6–510 kbps, sampler opp til 48 kHz, tåler 5–10 % pakketap pent takket være innebygd FEC. Brukt i Discord, WhatsApp, Zoom og WebRTC som standard for tale.",
          },
          {
            term: "Pakke-tap-skjuling (PLC)",
            body: "Når en pakke uteblir genererer dekoderen lyd for det manglende intervallet ved å gjenta forrige eller interpolere fra naboer. Hørbar som et lite klikk eller en metalliserende artefakt, men langt bedre enn stillhet.",
          },
          {
            term: "Forward Error Correction (FEC)",
            body: "Senderen pakker inn redundant informasjon — for eksempel en lav-bitrate kopi av forrige rammen — i hver pakke. Mister mottakeren pakke N, kan den rekonstruere innholdet fra det som lå inne i pakke N+1. Koster båndbredde men sparer delay.",
          },
          {
            term: "Playout-buffer (jitter-buffer)",
            body: "Liten kø på mottakersiden som forsinker avspilling med f.eks. 50 ms slik at pakker som kommer litt sent fortsatt rekker fram før de skal spilles. Adaptive buffere endrer størrelsen sin etter målt jitter.",
          },
          {
            term: "Silence suppression / VAD",
            body: "Voice Activity Detection oppdager når den som snakker er stille og slutter å sende pakker i den perioden. Sparer båndbredde og batteri. Mottakeren genererer komfort-støy så det ikke høres ut som linjen er død.",
          },
        ]}
      />

      <Illustration caption="Playout-buffer-tidslinje: pakker ankommer med jitter; bufferet jevner ut og leverer på fast takt.">
        <PlayoutBufferSvg />
      </Illustration>

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
      </Example>

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
        er parløpet — kontroll- og statistikk-pakker som rapporterer kvalitet underveis.
      </p>

      <Defs
        items={[
          {
            term: "Sequence number (16 bit)",
            body: "Inkrementeres med 1 for hver pakke avsenderen sender. Lar mottakeren oppdage pakketap og levere pakker i riktig rekkefølge selv om UDP omkalfatrer dem.",
          },
          {
            term: "Timestamp (32 bit)",
            body: "Tidspunkt for når innholdet i pakka ble laget — målt i codec-spesifikke enheter (for 8 kHz lyd: én enhet per sample). To pakker med samme timestamp kommer fra samme øyeblikk. Bufferet bruker timestamp til å beregne når en pakke skal spilles av.",
          },
          {
            term: "SSRC (Synchronization Source, 32 bit)",
            body: "Tilfeldig identifikator for kilden. I et møte hvor tre deltakere snakker har hver sin SSRC, så mottakeren kan skille strømmene fra hverandre selv om de kommer på samme port.",
          },
          {
            term: "Payload type (7 bit)",
            body: "Forteller hvilken codec som er brukt — for eksempel 0 = G.711 µ-law, 8 = G.711 A-law, 96–127 = dynamisk tildelt for nyere codecs som Opus eller H.264. Mottakeren bruker dette til å vite hvilken dekoder den skal mate pakka inn i.",
          },
          {
            term: "RTCP Sender Report (SR)",
            body: "Pakker avsenderen sender med jevne mellomrom som inneholder absolutt-tid (NTP-format), hvor mange pakker den har sendt, og hvor mange bytes. Lar mottakeren synkronisere lyd og video som kom over separate RTP-strømmer.",
          },
          {
            term: "RTCP Receiver Report (RR)",
            body: "Pakker mottakeren sender tilbake med målt jitter, akkumulert pakketap, høyeste sekvensnummer mottatt. Lar senderen tilpasse seg — for eksempel å redusere bitraten hvis tapet stiger.",
          },
          {
            term: "RTSP (Real-Time Streaming Protocol)",
            body: "Kontroll-protokollen ved siden av RTP. Tilbyr SETUP/PLAY/PAUSE/TEARDOWN-kommandoer over TCP. Brukes mest til mediabokser og overvåkningskameraer; moderne web-streaming (DASH/HLS) bruker ikke RTSP.",
          },
        ]}
      />

      <Illustration caption="RTP-headerens 12 første bytes — felter mottakeren trenger for å synkronisere og oppdage tap.">
        <RtpHeaderSvg />
      </Illustration>

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
      </Example>

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

      <Defs
        items={[
          {
            term: "Best-effort",
            body: "Standard-nettet: ruterne har én utgangskø per lenke, alle pakker behandles FIFO, ingen garantier. Enkelt, billig, men gir ingen forutsigbar oppførsel under last.",
          },
          {
            term: "Integrated Services (IntServ) / RSVP",
            body: "Per-strøm-reservasjon: en applikasjon ber via RSVP-signalisering om at hver ruter langs stien reserverer båndbredde og buffer-plass for den ene strømmen. Gir harde garantier, men skalerer dårlig fordi hver ruter må holde tilstand for tusenvis av strømmer.",
          },
          {
            term: "Differentiated Services (DiffServ)",
            body: "Per-klasse-prioritering i stedet for per-strøm. Pakker merkes med en DSCP-verdi (6 bits i IP-headeren) som forteller hvilken klasse de tilhører — for eksempel EF (Expedited Forwarding) for VoIP, AF (Assured Forwarding) for businesss-data, BE (Best Effort) for resten. Ruterne har egne køer per klasse og gir EF-køen prioritet.",
          },
          {
            term: "Policing",
            body: "Sjekk ved nett-inngangen: kommer det inn flere pakker per sekund enn avtalen tillater, blir overskuddet enten droppet eller nedklassifisert (remarked til lavere prioritet). Token-bucket er den vanlige implementasjonen.",
          },
          {
            term: "Shaping",
            body: "Den snillere versjonen av policing: i stedet for å droppe overskudd, holdes pakkene i en kø og slippes ut jevnt over tid. Bytter pakketap mot litt delay. Vanlig på utgående side i hjemmerutere for å unngå buffer-bloat.",
          },
          {
            term: "Priority queueing",
            body: "Ruterens utgang har flere køer i prioritet-rekkefølge. Høy-prioritet-kø tømmes alltid først; lav-prioritet får bare slippe ut når høyere er tom. Kan sulte ut lav-prioritet hvis høy-prioritet er evig full — derfor brukes ofte WFQ (Weighted Fair Queueing) i stedet, som garanterer en minste andel til hver kø.",
          },
          {
            term: "Admission control",
            body: "Mekanismen som sier nei når nettet er fullt. RSVP eller en SIP-proxy kan blokkere en ny VoIP-samtale hvis det ikke er ledig reservert kapasitet — bedre å nekte forbindelsen helt enn å akseptere en samtale som blir ubrukelig.",
          },
        ]}
      />

      <Illustration caption="DiffServ i en ruter: pakker klassifiseres på DSCP, går i hver sin kø, scheduler velger.">
        <DiffservSvg />
      </Illustration>

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

function ChapterPager({ prev }: { prev: { slug: string; title: string } | null }) {
  return (
    <nav className="mt-10 grid gap-3 sm:grid-cols-2">
      {prev ? (
        <a
          href={`/stack/${prev.slug}`}
          className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-brand/60"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-brand" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Forrige kap.
            </div>
            <div className="text-sm font-semibold">{prev.title}</div>
          </div>
        </a>
      ) : (
        <span />
      )}
      <a
        href="/stack/kurose-kurs"
        className="group flex items-center gap-3 rounded-xl border border-brand/40 bg-brand/5 p-4 hover:border-brand sm:flex-row-reverse sm:text-right"
      >
        <FolderOpen className="h-4 w-4 text-brand" />
        <div>
          <div className="text-[10px] uppercase tracking-wider text-brand/80">
            Siste kapittel ferdig
          </div>
          <div className="text-sm font-semibold">Tilbake til Kurose-kurset</div>
        </div>
      </a>
    </nav>
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
