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

type Tab = "intro" | "9.1" | "9.2" | "9.3" | "9.4" | "9.5" | "9.6";

const SECTIONS_9: SectionNavItem[] = [
  { id: "intro", label: "Start her" },
  { id: "9.1", label: "9.1 Multimedia-apper" },
  { id: "9.2", label: "9.2 DASH" },
  { id: "9.3", label: "9.3 VoIP" },
  { id: "9.4", label: "9.4 RTP/RTSP" },
  { id: "9.5", label: "9.5 QoS" },
  { id: "9.6", label: "9.6 Oppgaver" },
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
          </nav>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "9.1" && <Section91 />}
        {tab === "9.2" && <Section92 />}
        {tab === "9.3" && <Section93 />}
        {tab === "9.4" && <Section94 />}
        {tab === "9.5" && <Section95 />}
        {tab === "9.6" && <Section96 />}

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

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            {
              term: "Lagret strømmende video (eks. Netflix, YouTube VOD)",
              body: "Innholdet ligger ferdig på en server og strømmes ut etterhvert som klienten trenger neste segment. Tåler høy oppstarts-delay (3–5 sekunder buffer er greit), men selve playbacken må flyte. Kan løses elegant med HTTP over TCP fordi vi har tid til retransmisjoner.",
            },
            {
              term: "Sann-tids samtale (VoIP, video-møte)",
              body: "To eller flere parter snakker live. Total ende-til-ende-delay må holdes under ca. 150 ms for naturlig opplevelse; over 400 ms blir samtalen vanskelig. Tåler litt tap (5–10 % med god PLC = Packet Loss Concealment) bedre enn ekstra delay.",
            },
            {
              term: "Live streaming (sport, konsert, live nyheter)",
              body: "Mellomting: én sender, mange mottakere, men hendelsen skjer akkurat nå. Glass-to-glass delay 2–10 sekunder er vanlig for HLS/DASH-basert sending; lav-latens-protokoller (LL-HLS = Low-Latency HTTP Live Streaming, WebRTC = Web Real-Time Communication) kan komme under 1 sekund.",
            },
            {
              term: "IoT-sensor- og telemetri-strømmer",
              body: "En egen multimedia-klasse i Kurose 8. utg.: små pakker med målinger (temperatur, GPS, akselerometer) som kommer i jevnt tempo. Tåler vanligvis 200–500 ms delay og bruker MQTT/CoAP over UDP. Skiller seg fra tale ved svært lav båndbredde, men ligner i at hver pakke er ferskvare.",
            },
            {
              term: "Sky-spill (cloud gaming)",
              body: "Spillet kjøres i sky-en og videostrømmen sendes til klienten mens input-tastetrykk går motsatt vei. Strengeste delay-krav av alle (under 80 ms motion-to-photon for kompetitive titler). Kombinerer interaktivitet fra VoIP med båndbredde fra live-video — vanskeligste klassen.",
            },
            {
              term: "Jitter (network jitter)",
              body: "Variasjon i pakke-ankomster forårsaket av varierende kø-fyll i ruterne underveis. Hvis hver pakke representerer 20 ms lyd og to nabopakker kommer henholdsvis 5 ms og 45 ms etter forrige, så har vi 40 ms network jitter. Måles ofte som differensen mellom forventet og faktisk ankomst (RFC 3550-formelen).",
            },
            {
              term: "Processing jitter (endesystem-jitter)",
              body: "Variasjon som oppstår fordi senderen eller mottakeren bruker ulik tid på å enkode/dekode hver ramme — for eksempel når en GPU prioriterer andre oppgaver. Mindre enn network jitter på et godt utstyrt system, men kan dominere på en travel mobiltelefon eller laptop.",
            },
            {
              term: "Tap-toleranse",
              body: "Hvor mange prosent pakker som kan forsvinne uten merkbar kvalitetsforringelse. For Opus-kodet tale med PLC: opp mot 10 % kan skjules akseptabelt. For ukomprimert video: i praksis null. For DASH-segmenter: 0 % siden TCP retransmitterer alt.",
            },
            {
              term: "Mean Opinion Score (MOS)",
              body: "Subjektiv kvalitetsskala 1–5 brukt for lyd/video. 5 = perfekt, 4 = bra, 3 = akseptabel, 2 = dårlig, 1 = ubrukelig. ITU-T sin E-modell (E for «E-model») kan beregne en estimert MOS fra delay, tap og jitter uten å spørre faktiske brukere.",
            },
            {
              term: "End-to-end delay vs interaktiv delay",
              body: "End-to-end er tiden fra mikrofon til høyttaler på andre siden — summen av koding, transport, buffer og dekoding. Interaktiv delay er den ene-veis-tiden som påvirker hvor lett det er å ha en samtale — den merkes som å «snakke i munnen på hverandre» eller pinlige pauser.",
            },
            {
              term: "Glass-to-glass-latens",
              body: "Bransje-uttrykk for live-video: tid fra et lys-foton treffer kameraets linse til samme bilde vises på mottakerens skjerm. Dekker også kompresjon og buffering — typisk 2–10 s for ren HLS/DASH, 1–3 s for LL-HLS, og 200–600 ms for WebRTC-konfererings-pipeline.",
            },
            {
              term: "Best-effort-kjernen",
              body: "Antagelsen som ligger under hele multimedia-kapittelet: IP-nettet gir ingen garantier — alle pakker behandles likt, ingen forutsigbar delay. Multimedia-applikasjoner må derfor håndtere variasjon selv (buffer, FEC, ABR) eller be om ekstra hjelp via QoS-mekanismer (seksjon 9.5).",
            },
            {
              term: "Codec",
              body: "Forkortelse for «coder-decoder»: algoritmen som komprimerer rå lyd/video-data til en bit-strøm og rekonstruerer det på andre siden. Hvilken codec som velges avgjør båndbredde, kvalitet, kompresjons-delay og toleranse for tap. Behandles inngående i 9.3.",
            },
          ]}
        />
        <Illustration caption="Krav-rom: hver applikasjons-type plassert etter delay-budsjett og tap-toleranse.">
          <RequirementsSvg />
        </Illustration>
      </div>

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

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            {
              term: "MPD (Media Presentation Description)",
              body: "XML-fil klienten henter først. Den lister alle tilgjengelige bitrate-varianter, segment-lengde, hvor segmentene ligger (URL-mønster), og hvilke språk-spor som finnes. Tilsvarer en «meny» klienten velger fra. Tilsvarende fil i HLS-verdenen heter `playlist.m3u8`.",
            },
            {
              term: "Segment",
              body: "Et selvstendig stykke video som kan dekodes uten å vite om naboene. Hver variant produserer én segment-fil per tidsvindu — for eksempel video_720p_005.m4s, video_720p_006.m4s, og så videre. Segment-lengde er en designparameter: kortere = raskere reaksjon, lengre = bedre kompresjons-effektivitet.",
            },
            {
              term: "GOP (Group of Pictures)",
              body: "Den minste enheten med en I-ramme (intra-koded, selvstendig) etterfulgt av P- og B-rammer som refererer til den. Et DASH-segment må starte på en I-ramme — derfor er typisk segment-lengde et helt antall GOP-er (ofte 2 s = 2 GOP á 1 s).",
            },
            {
              term: "Bitrate-varianter (representations)",
              body: "Den samme videoen kodet på N ulike kvalitetsnivåer, for eksempel 240p/400 kbps, 480p/1 Mbps, 720p/2.5 Mbps, 1080p/5 Mbps, 2160p/15 Mbps. Lagres som separate filer på serveren. ABR-algoritmen plukker fra denne listen for hvert segment.",
            },
            {
              term: "Adaptation set",
              body: "MPD-en grupperer relaterte varianter — for eksempel «alle video-varianter» i én adaptation set og «alle norske lydspor» i en annen. Klienten velger én variant per set. Det er sånn en bruker kan bytte språk midt i filmen uten å bytte video-stream.",
            },
            {
              term: "ABR-algoritme (Adaptive Bitrate)",
              body: "Klient-logikken som velger neste bitrate. Tre hovedsignaler den kan bruke: estimert nett-throughput, hvor full bufferet er, og en blanding av begge. Mål: høyest mulig bitrate uten å tømme bufferet og forårsake re-buffering.",
            },
            {
              term: "Throughput-basert ABR",
              body: "Klienten måler hvor lang tid forrige segment tok å laste ned, regner ut effektiv båndbredde, og velger neste segment med litt margin under det. Reagerer raskt, men kan vingle (bitrate-oscillation) hvis nettet er ustabilt.",
            },
            {
              term: "Buffer-basert ABR",
              body: "Klienten ser på hvor mange sekunder video som ligger ferdig i bufferet. Mye buffer → vi har råd til høyere bitrate; lite buffer → ned med bitraten for å unngå å tømme. Stabilere enn ren throughput-måling. BBA-0 fra Stanford er kanonisk referanse-algoritme.",
            },
            {
              term: "BOLA",
              body: "Buffer Occupancy based Lyapunov Algorithm — populær hybrid-ABR som matematisk balanserer høy bitrate mot lav re-buffering. Bruker en Lyapunov-funksjon (verktøy fra kontroll-teori) til å garantere stabilitet. Standard i dash.js.",
            },
            {
              term: "MPC (Model Predictive Control) ABR",
              body: "Mer avansert hybrid: predikerer fremtidig båndbredde fra de siste N segmentene, kjører simulering av flere bitrate-valg framover, og velger den banen som maksimerer score-funksjonen (høy bitrate − re-buffer-straff − for hyppige bytter). Brukt i Pensieve-forskningen.",
            },
            {
              term: "Bitrate-oscillation",
              body: "Når ABR-algoritmen vingler raskt opp og ned mellom bitrater fordi den reagerer for sterkt på kortsiktige throughput-svingninger. Synlig som hyppige kvalitetsbytter. Demp ved EWMA-glatting eller hysterese (krav om at endring må overstige terskel).",
            },
            {
              term: "Stall / re-buffering",
              body: "Når bufferet tømmes og playbacken må stoppe og vente på neste segment. Den verste opplevelsen for brukeren — målet for ABR er null re-buffering, selv på bekostning av lavere bitrate. Måles som «stall ratio» = stalled-sekunder / total spilletid.",
            },
            {
              term: "Startup delay",
              body: "Tida fra brukeren trykker «play» til første ramme vises. Klienten må først hente MPD-en, deretter første segment, deretter fylle nok buffer til at avspilling er trygg. Typisk 1–3 sekunder. ABR-er som starter på laveste bitrate gir kortere startup men dårligere kvalitet de første sekundene.",
            },
            {
              term: "CDN (Content Delivery Network)",
              body: "Distribuert nettverk av cache-servere plassert nær brukerne. DASH-segmenter ligger ofte på en CDN-edge nær Tromsø istedenfor i Netflix sin sentrale data-senter, så throughput-en blir høyere og delay lavere. CDN-en gjør DASH skalerbart til millioner samtidige seere.",
            },
          ]}
        />
        <Illustration caption="DASH-arkitekturen: server lagrer hvert segment i flere bitrater; klienten plukker per segment.">
          <DashSvg />
        </Illustration>
      </div>

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

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            {
              term: "Codec",
              body: "Algoritme som komprimerer lyd til en strøm av bits. Velges som kompromiss mellom kvalitet, båndbredde, kompresjons-delay og hvor godt den tåler tap. Forkortelse for «coder-decoder».",
            },
            {
              term: "PCM (Pulse-Code Modulation)",
              body: "Den enkleste digitaliseringen: sample lyd-bølgen med jevne mellomrom, kvantiser hvert sample til en heltallsverdi. Ingen komprimering — bare rå digital lyd. Studio-kvalitet CD-er bruker 44.1 kHz · 16 bit · 2 kanaler = 1.4 Mbps PCM. Utgangs-punkt for alle andre codec-er.",
            },
            {
              term: "G.711 (PCMU / PCMA)",
              body: "Den klassiske telefon-codecen fra 1972. Sampler 8 kHz, bruker 8 bits per sample med µ-law (USA) eller A-law (Europa) ulinjær kvantisering → 64 kbps. Ingen komprimering, lav kompleksitet, alle systemer støtter den. Sliter med pakketap fordi det ikke er noen indre redundans å lene seg på.",
            },
            {
              term: "G.729",
              body: "Lavbåndbredde-codec (1996) som komprimerer tale til 8 kbps ved hjelp av CELP-modellering (Code-Excited Linear Prediction). Lyder akseptabel for tale, men dårlig for musikk. Tradisjonelt brukt på VoIP-lenker med dyr/smal båndbredde. Patent-belastet inntil 2017.",
            },
            {
              term: "Opus",
              body: "Moderne åpen codec (RFC 6716, 2012). Variabel bitrate 6–510 kbps, sampler opp til 48 kHz, tåler 5–10 % pakketap pent takket være innebygd FEC. Brukt i Discord, WhatsApp, Zoom og WebRTC som standard for tale. Slår både G.711 (kvalitet) og G.729 (komprimering).",
            },
            {
              term: "H.264 / AVC",
              body: "Video-codec (2003) som dominerte HD-æra-en. Komprimerer 1080p til 4–8 Mbps. Maskinvare-dekoding i alle telefoner og laptops — derfor fortsatt mest brukt for kompatibilitet. Patent-pool gjør lisensiering komplisert.",
            },
            {
              term: "H.265 / HEVC",
              body: "Etterfølgeren (2013): omtrent 50 % bedre kompresjon enn H.264 ved samme kvalitet. 4K-video på 8–15 Mbps. Maskinvare-støtte i nyere enheter. Lisens-modellen er dyrere enn H.264 — derfor ikke universelt utbredt.",
            },
            {
              term: "VP9",
              body: "Googles åpne svar på H.265 (2013). Brukt på YouTube for 4K og HDR-strømmer. Lignende kompresjons-effektivitet som HEVC, royalty-fri. Maskinvare-dekoding finnes i Android og Chromecast, men ikke alle Apple-enheter.",
            },
            {
              term: "AV1",
              body: "Den nyeste åpne video-codecen (2018), utviklet av Alliance for Open Media (Google, Netflix, Amazon m.fl.). 20–30 % bedre enn HEVC/VP9. Programmvare-koding er fortsatt tregt, men nyere GPU-er har maskinvare-AV1 og bruken vokser raskt på Netflix og YouTube.",
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
              term: "Interleaving",
              body: "Alternativ til FEC: senderen flytter samples rundt før de pakkes, så et tap av én pakke sprer seg som mange små feil over flere lyd-rammer (lettere å maskere) i stedet for ett stort hull. Koster delay (mottakeren må vente til hele blokken er ankommet før den de-interleaver).",
            },
            {
              term: "Fixed playout-buffer",
              body: "Variant av playout-buffer der forsinkelsen settes til en fast verdi (f.eks. 60 ms) gjennom hele samtalen. Enkel å implementere, men suboptimal: enten for stor (kaster bort delay-budsjett) eller for liten (kaster for mange pakker).",
            },
            {
              term: "Adaptive playout-buffer",
              body: "Bufferet endrer størrelse løpende basert på målt jitter. Vanlig regel: buffer ≈ middel-delay + k·σ_jitter (k = 3–4). Krymper når nettet er stabilt, vokser når det ustabiliseres. Brukt i alle moderne VoIP-stacker.",
            },
            {
              term: "Playout-buffer (jitter-buffer)",
              body: "Liten kø på mottakersiden som forsinker avspilling med f.eks. 50 ms slik at pakker som kommer litt sent fortsatt rekker fram før de skal spilles. Konverterer variabel ankomst-tid til fast avspilling-takt.",
            },
            {
              term: "Silence suppression / VAD",
              body: "Voice Activity Detection oppdager når den som snakker er stille og slutter å sende pakker i den perioden (typisk 60 % av samtaletida). Sparer båndbredde og batteri. Mottakeren genererer komfort-støy så det ikke høres ut som linjen er død.",
            },
            {
              term: "Mund-til-øre-delay (mouth-to-ear)",
              body: "Det totale en-veis-delayet brukerne faktisk merker. Summen av: mikrofon-kapring (5 ms), encoder (10–25 ms), pakke-aggregering (20 ms), nett-transport (variabelt), jitter-buffer (30–60 ms), decoder (5 ms), høyttaler (5 ms). Mål: under 150 ms.",
            },
          ]}
        />
        <Illustration caption="Playout-buffer-tidslinje: pakker ankommer med jitter; bufferet jevner ut og leverer på fast takt.">
          <PlayoutBufferSvg />
        </Illustration>
      </div>

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
        er parløpet — kontroll- og statistikk-pakker som rapporterer kvalitet underveis.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            {
              term: "V — Version (2 bit)",
              body: "Versjonsfeltet, alltid 2 i dagens RTP. Bare to bits brukt fordi det forventes sjelden å endre seg. Mottakeren bruker dette til å avvise pakker fra eldre protokoll-revisjoner.",
            },
            {
              term: "P — Padding (1 bit)",
              body: "Hvis satt til 1, har pakka padding-bytes på slutten som ikke er del av payloaden. Den aller siste byten forteller hvor mange padding-bytes som ligger der. Brukes for kryptering der blokk-størrelsen må være et helt antall bytes.",
            },
            {
              term: "X — Extension (1 bit)",
              body: "Hvis 1, kommer det en utvidelses-header rett etter den faste 12-byte headeren. Egendefinerte felt-typer kan ligge der — brukt blant annet i WebRTC for å sende absolutt-sender-tid og lyd-nivå.",
            },
            {
              term: "CC — CSRC Count (4 bit)",
              body: "Antall CSRC-identifikatorer som følger headeren. 0 normalt; større når en mixer kombinerer flere kilder til én strøm (audio-mix i et konferansesystem).",
            },
            {
              term: "M — Marker (1 bit)",
              body: "Codec-spesifikk hendelses-flag. For tale: settes på første pakke etter en stillhets-periode. For video: settes på siste pakke i en ramme. Mottakeren bruker den til å vite at det er trygt å starte avspilling eller signalisere ramme-ferdig.",
            },
            {
              term: "PT — Payload Type (7 bit)",
              body: "Forteller hvilken codec som er brukt — for eksempel 0 = G.711 µ-law, 8 = G.711 A-law, 14 = MPA, 96–127 = dynamisk tildelt for nyere codecs som Opus eller H.264. Mottakeren bruker dette til å vite hvilken dekoder den skal mate pakka inn i.",
            },
            {
              term: "SEQ — Sequence number (16 bit)",
              body: "Inkrementeres med 1 for hver pakke avsenderen sender. Lar mottakeren oppdage pakketap og levere pakker i riktig rekkefølge selv om UDP omkalfatrer dem. Starter på en tilfeldig verdi for å gjøre angrep vanskeligere.",
            },
            {
              term: "TS — Timestamp (32 bit)",
              body: "Tidspunkt for når innholdet i pakka ble laget — målt i codec-spesifikke enheter (for 8 kHz lyd: én enhet per sample, så ts øker med 160 mellom 20-ms pakker). To pakker med samme timestamp kommer fra samme øyeblikk. Bufferet bruker timestamp til å beregne når en pakke skal spilles av.",
            },
            {
              term: "SSRC — Synchronization Source (32 bit)",
              body: "Tilfeldig identifikator for kilden. I et møte hvor tre deltakere snakker har hver sin SSRC, så mottakeren kan skille strømmene fra hverandre selv om de kommer på samme port. Hvis to senderne ved uflaks velger samme SSRC, omformer en av dem identifikatoren («SSRC collision»).",
            },
            {
              term: "CSRC — Contributing Source list (0–15 × 32 bit)",
              body: "Liste over SSRC-ene til kilder som er mikset inn i denne pakka. Tom (CC=0) for direkte ende-til-ende-strøm. En audio-mixer i en bro kan kombinere tre talere; CSRC-lista forteller mottakeren hvem som bidro.",
            },
            {
              term: "RTCP Sender Report (SR)",
              body: "Pakker avsenderen sender med jevne mellomrom som inneholder absolutt-tid (NTP-format), hvor mange pakker den har sendt, og hvor mange bytes. Lar mottakeren synkronisere lyd og video som kom over separate RTP-strømmer (matche en NTP-tid mot en RTP-timestamp).",
            },
            {
              term: "RTCP Receiver Report (RR)",
              body: "Pakker mottakeren sender tilbake med målt jitter (RFC 3550-formelen), akkumulert pakketap, høyeste sekvensnummer mottatt, og «inter-arrival jitter» som en glidende statistikk. Lar senderen tilpasse seg — for eksempel redusere bitraten hvis tapet stiger.",
            },
            {
              term: "RTCP SDES (Source Description)",
              body: "Periodisk pakke med tekstlig informasjon om kilden: CNAME (kanonisk navn, brukt til å gjenkjenne samme avsender på tvers av SSRC-collisions), brukernavn, e-post, lokasjon, telefon, verktøy. CNAME er obligatorisk; resten er valgfritt.",
            },
            {
              term: "RTCP BYE",
              body: "Pakke en deltaker sender før den forlater økten. Lister hvilke SSRC-er som forsvinner og eventuelt en grunn-streng. Lar de andre umiddelbart fjerne disse fra synlige deltaker-lister i stedet for å vente på timeout.",
            },
            {
              term: "RTCP APP",
              body: "Applikasjons-spesifikk RTCP-utvidelse. Definert som «escape hatch» for forskning og leverandør-spesifikke meldinger uten å forurense standard-feltene. Sjelden brukt i offentlige protokoller.",
            },
            {
              term: "RTSP (Real-Time Streaming Protocol)",
              body: "Kontroll-protokollen ved siden av RTP. Tilbyr SETUP/PLAY/PAUSE/TEARDOWN-kommandoer over TCP. Brukes mest til mediabokser og overvåkningskameraer; moderne web-streaming (DASH/HLS) bruker ikke RTSP. Tenk «fjernkontroll» for en media-strøm.",
            },
            {
              term: "SRTP (Secure RTP)",
              body: "Kryptert variant (RFC 3711) der payloaden krypteres med AES-CTR og hele pakka autentiseres med HMAC-SHA1. Brukt i WebRTC og i moderne SIP-telefoni. Header forblir i klartekst sånn at mellomliggende ruterklasse-mekanismer fortsatt kan se SSRC og sequence.",
            },
          ]}
        />
        <Illustration caption="RTP-headerens 12 første bytes — felter mottakeren trenger for å synkronisere og oppdage tap.">
          <RtpHeaderSvg />
        </Illustration>
      </div>

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

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            {
              term: "Best-effort",
              body: "Standard-nettet: ruterne har én utgangskø per lenke, alle pakker behandles FIFO (First-In-First-Out), ingen garantier. Enkelt, billig, men gir ingen forutsigbar oppførsel under last. Internett er grunnleggende best-effort i kjernen.",
            },
            {
              term: "Integrated Services (IntServ) / RSVP",
              body: "Per-strøm-reservasjon: en applikasjon ber via RSVP (Resource Reservation Protocol) om at hver ruter langs stien reserverer båndbredde og buffer-plass for den ene strømmen. Gir harde garantier, men skalerer dårlig fordi hver ruter må holde tilstand for tusenvis av strømmer.",
            },
            {
              term: "RSVP soft-state",
              body: "RSVP-reservasjoner forsvinner automatisk hvis ikke avsenderen sender en refresh-melding hvert 30. sekund. Designet sånn fordi ruterne ofte mister tilstand (reboot, link-flap) — soft state betyr at det er trygt selv om en ruter glemmer; den vil bli minnet på neste refresh, eller reservasjonen renner ut.",
            },
            {
              term: "Differentiated Services (DiffServ)",
              body: "Per-klasse-prioritering i stedet for per-strøm. Pakker merkes med en DSCP-verdi (6 bits i IP-headeren) som forteller hvilken klasse de tilhører. Ruterne har egne køer per klasse. Skalerer langt bedre enn IntServ fordi ruterne bare må vite om noen få klasser, ikke om tusenvis av flows.",
            },
            {
              term: "DSCP (Differentiated Services Code Point)",
              body: "De 6 mest signifikante bitene av ToS-feltet i IPv4-headeren (eller Traffic Class i IPv6). Definerer hvilken PHB (Per-Hop Behavior) ruteren skal anvende. Standardiserte verdier: 0 = default, 46 (101110₂) = EF, 10/12/14 = AF11/AF12/AF13, og så videre.",
            },
            {
              term: "EF (Expedited Forwarding, DSCP 46)",
              body: "Klassen for tids-kritisk trafikk: VoIP, video-konferering. Ruterne lover lav delay og lavt tap. Behandles oftest i en priority-kø som tømmes før andre. Skal være begrenset til en liten andel av total trafikk for å unngå å sulte ut resten.",
            },
            {
              term: "AF (Assured Forwarding, DSCP 10–38)",
              body: "Fire klasser (AF1x–AF4x) med tre drop-prioriteter (x = 1/2/3) hver. Tanken er: garanter et minimum av båndbredde for klassen, men hvis køen blir full, drop først pakker med høyere drop-prioritet. Brukt for «business-data» som SAP, ERP, viktige nedlastinger.",
            },
            {
              term: "BE (Best Effort, DSCP 0)",
              body: "Default-klassen som umerkede pakker faller i. Får det som er igjen etter EF og AF. Inkluderer web-surfing, e-post, software-oppdateringer. Forventes å være tålmodig.",
            },
            {
              term: "Marking",
              body: "Operasjonen der en pakke får sin DSCP-verdi satt. Skjer typisk på første ruter inn i et administrativt domene («network edge»), enten basert på avsender-IP, applikasjons-port, eller DPI (Deep Packet Inspection). Etterpå stoler indre ruterne på markeringen.",
            },
            {
              term: "Policing",
              body: "Sjekk ved nett-inngangen: kommer det inn flere pakker per sekund enn avtalen tillater, blir overskuddet enten droppet eller nedklassifisert (re-marked til lavere prioritet). Token-bucket er den vanlige implementasjonen. Jobben er å beskytte indre ruterne mot kunder som overstiger sin avtale.",
            },
            {
              term: "Shaping",
              body: "Den snillere versjonen av policing: i stedet for å droppe overskudd, holdes pakkene i en kø og slippes ut jevnt over tid. Bytter pakketap mot litt delay. Vanlig på utgående side i hjemmerutere for å unngå buffer-bloat.",
            },
            {
              term: "Leaky bucket",
              body: "Konseptuell modell: pakker (vann) renner inn i en bøtte med fast utløp-rate. Hvis bøtta blir full, søler det over og pakker droppes. Effekten er at utgående rate er konstant — ingen burst kan slippe gjennom. Streng, men forutsigbar.",
            },
            {
              term: "Token bucket",
              body: "Smartere modell: ruteren samler «tokens» med fast rate r (én token per byte tillatt) i en bøtte med kapasitet b. En pakke av størrelse n sendes hvis den finner n tokens — ellers droppes/forsinkes den. Tillater burst opptil b når bøtta er full, men holder gjennomsnitt på r over tid.",
            },
            {
              term: "Priority queueing (PQ)",
              body: "Ruterens utgang har flere køer i prioritet-rekkefølge. Høy-prioritet-kø tømmes alltid først; lav-prioritet får bare slippe ut når høyere er tom. Kan sulte ut lav-prioritet hvis høy-prioritet er evig full — derfor begrenses EF til en liten andel.",
            },
            {
              term: "WFQ (Weighted Fair Queueing)",
              body: "Hver kø får en vekt; scheduleren sørger for at hver kø får sin proporsjonale andel av lenken (vekt-i / Σ-vekt). Ingen kø kan bli sulta ut helt. Mer rettferdig enn priority queueing, men noe høyere worst-case delay for de viktigste pakkene.",
            },
            {
              term: "RED (Random Early Detection)",
              body: "Aktiv kø-management: når køen begynner å fylle seg (mellom min og max-terskel), drop en tilfeldig pakke før hele køen er full. TCP merker tapet og bremser ned, og forhindrer kø-overflow + global synkronisering (alle TCP-strømmer kollapser samtidig).",
            },
            {
              term: "Admission control",
              body: "Mekanismen som sier nei når nettet er fullt. RSVP eller en SIP-proxy kan blokkere en ny VoIP-samtale hvis det ikke er ledig reservert kapasitet — bedre å nekte forbindelsen helt enn å akseptere en samtale som blir ubrukelig. Vanlig i forretnings-VoIP-systemer.",
            },
            {
              term: "SLA (Service Level Agreement)",
              body: "Kontraktlig avtale mellom ISP og kunde om hva nettet skal levere: maks delay, maks tap, garantert båndbredde per klasse. DiffServ-merking er den tekniske mekanismen for å håndheve SLA-en. Brudd kan utløse økonomisk kompensasjon.",
            },
          ]}
        />
        <Illustration caption="DiffServ i en ruter: pakker klassifiseres på DSCP, går i hver sin kø, scheduler velger.">
          <DiffservSvg />
        </Illustration>
      </div>

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
