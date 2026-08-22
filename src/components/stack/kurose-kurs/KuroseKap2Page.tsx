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
import { Section21Live } from "./Section21Live";
import { Section22Live } from "./Section22Live";
import { Section23Live } from "./Section23Live";
import { Section24Live } from "./Section24Live";
import { Section25Live } from "./Section25Live";
import { Section26Live } from "./Section26Live";
import { VisualDefs } from "./VisualDefs";
import { LectureNote, LectureBeat } from "./LectureNote";
import {
  ClientServerArchIcon,
  P2PArchIcon,
  HybridArchIcon,
  SocketPlugIcon,
  AddrPortIcon,
  TransportMenuIcon,
  ProtocolDocIcon,
  PortNumberIcon,
  ThroughputJitterIcon,
  RttLoopIcon,
  StateMemoryIcon,
  PushPullIcon,
  BdpPipeIcon,
  ReqResIcon,
  PersistentChainIcon,
  HolBlockIcon,
  Http2Icon,
  Http3QuicIcon,
  CookieIcon,
  HttpMethodIcon,
  StatusBadgeIcon,
  ConditionalGetIcon,
  ProxyCacheIcon,
  CorsIcon,
  HttpsLockIcon,
  HierarchyTreeIcon,
  RootServerIcon,
  IterRecurIcon,
  TtlClockIcon,
  DnsRecordIcon,
  GlueIcon,
  StubResolverIcon,
  ReverseArrowIcon,
  AuthoritativeIcon,
  NegativeCacheIcon,
  SignedShieldIcon,
  Edns0Icon,
  SmtpServerIcon,
  ImapMailboxIcon,
  MimeAttachmentIcon,
  SwarmIcon,
  ExchangeIcon,
  DhtRingIcon,
  HandshakeLinesIcon,
  EnvelopeHeaderIcon,
  SpfDmarcIcon,
  ChunkPieceIcon,
  RarestFirstIcon,
  TrackerListIcon,
  ChokingIcon,
  BitrateLadderIcon,
  ManifestIcon,
  CdnGlobeIcon,
  CdnWhyIcon,
  DnsMapIcon,
  CacheLayerIcon,
  BufferBarIcon,
  OriginShieldIcon,
  CacheWarmIcon,
  LiveBroadcastIcon,
  CodecChipIcon,
  AnycastIcon,
  TcpServerCallIcon,
  TcpClientCallIcon,
  UdpPacketIcon,
  StreamRiverIcon,
  BlockingIcon,
  PartialBufferIcon,
  PortReuseIcon,
  NagleIcon,
  EpollPanelIcon,
  MtuRulerIcon,
  RawIpIcon,
} from "./visualDefIcons.kap2";

type Tab = "intro" | "2.1" | "2.2" | "2.3" | "2.4" | "2.5" | "2.6" | "2.7" | "2.8";

const SECTIONS_2: SectionNavItem[] = [
  { id: "intro", label: "Start her" },
  { id: "2.1", label: "2.1 Prinsipper" },
  { id: "2.2", label: "2.2 Web & HTTP" },
  { id: "2.3", label: "2.3 DNS" },
  { id: "2.4", label: "2.4 E-post & P2P" },
  { id: "2.5", label: "2.5 Video & CDN" },
  { id: "2.6", label: "2.6 Sockets" },
  { id: "2.7", label: "2.7 Oppgaver" },
  { id: "2.8", label: "2.8 Eksamen-fokus" },
];
const NEXT_CHAPTER_2 = { slug: "kurose-kap-3", title: "Transportlaget" };

export function KuroseKap2Page() {
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
              Kap. 2 — Applikasjonslaget
            </h1>
          </div>
          <nav className="ml-auto flex flex-wrap gap-0.5">
            <TabBtn active={tab === "intro"} onClick={() => setTab("intro")}>
              Start
            </TabBtn>
            <TabBtn active={tab === "2.1"} onClick={() => setTab("2.1")} title="Prinsipper">
              2.1
            </TabBtn>
            <TabBtn active={tab === "2.2"} onClick={() => setTab("2.2")} title="Web & HTTP">
              2.2
            </TabBtn>
            <TabBtn active={tab === "2.3"} onClick={() => setTab("2.3")} title="DNS">
              2.3
            </TabBtn>
            <TabBtn active={tab === "2.4"} onClick={() => setTab("2.4")} title="E-post & P2P">
              2.4
            </TabBtn>
            <TabBtn active={tab === "2.5"} onClick={() => setTab("2.5")} title="Video & CDN">
              2.5
            </TabBtn>
            <TabBtn active={tab === "2.6"} onClick={() => setTab("2.6")} title="Sockets">
              2.6
            </TabBtn>
            <TabBtn active={tab === "2.7"} onClick={() => setTab("2.7")} title="Oppgaver">
              Oppg.
            </TabBtn>
            <TabBtn active={tab === "2.8"} onClick={() => setTab("2.8")} title="Eksamen-fokus">
              Eksamen
            </TabBtn>
          </nav>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "2.1" && <Section21 />}
        {tab === "2.2" && <Section22 />}
        {tab === "2.3" && <Section23 />}
        {tab === "2.4" && <Section24 />}
        {tab === "2.5" && <Section25 />}
        {tab === "2.6" && <Section26 />}
        {tab === "2.7" && <Section27 />}
        {tab === "2.8" && <SectionEksamen />}

        <SectionPager
          tabs={SECTIONS_2}
          current={tab}
          onPick={(id) => setTab(id as Tab)}
          nextChapter={NEXT_CHAPTER_2}
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
            Skille mellom klient-server- og P2P-arkitekturer, og forklare hva transport-laget
            faktisk gir applikasjonen.
          </li>
          <li>
            Forklare hvordan en HTTP-request er bygget opp, forskjellen på HTTP/1.1, HTTP/2 og
            HTTP/3, og hvordan cookies gir en stateless protokoll «hukommelse».
          </li>
          <li>
            Tegne et DNS-oppslag fra rot til autoritativ navne-server, og forklare hva caching og
            TTL betyr i praksis.
          </li>
          <li>
            Skille SMTP fra IMAP, og forstå hvorfor BitTorrent skalerer bedre enn en sentral server.
          </li>
          <li>Forklare hvorfor DASH og CDN-er er det som faktisk får Netflix til å fungere.</li>
          <li>Åpne og bruke en TCP- og en UDP-socket — vite hvilken som passer når.</li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Kapittelets struktur</h2>
        <ol className="list-decimal pl-5 text-muted-foreground space-y-1">
          <li>Prinsipper for nettverks-applikasjoner</li>
          <li>Web og HTTP — request/response, cookies, HTTP/2, HTTP/3</li>
          <li>DNS — hierarki, oppslag og caching</li>
          <li>E-post og P2P — SMTP/IMAP, BitTorrent, DHT</li>
          <li>Video-streaming og CDN-er</li>
          <li>Socket-programmering — TCP og UDP fra app-perspektiv</li>
          <li>Oppgaver — regn på det</li>
        </ol>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => onPick("2.1")}>
            Start på 2.1 →
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 2.1 — Prinsipper for nettverks-applikasjoner
// ============================================================
function Section21() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="2.1" title="Prinsipper for nettverks-applikasjoner" />

      <p className="text-muted-foreground">
        Som applikasjons-utvikler skriver du ikke kode som kjører på rutere — du skriver kode som
        kjører på end-hosts og snakker med kode på andre end-hosts. Det første valget er
        arkitekturen: skal én part «eie» tjenesten (klient-server), eller skal alle deltakerne være
        likeverdige (P2P)? Det andre valget er hvilken transport du skal bygge på.
      </p>

      <Section21Live />

      <LectureNote title="Hvorfor det er lett å skrive en nettverks-app">
        <p>
          Applikasjonslaget er nettets <em>raison d'être</em> — grunnen til at nettet finnes i det
          hele tatt. Det er også et godt sted å begynne å lære, fordi protokollene her er
          menneskelesbare og handler om ting vi bruker daglig.
        </p>
        <p>
          Noe verdt å stoppe ved: nesten alle applikasjonene vi bruker — sosiale medier, weben,
          meldinger, spill, strømming, videomøter, søk — ble utviklet <em>lenge etter</em> at
          arkitekturen og transportlagets abstraksjoner var definert. Bare e-post og fjerninnlogging
          er eldre. At nettet bærer applikasjoner designerne aldri drømte om, er kanskje det
          sterkeste argumentet for at de traff riktig.
        </p>
        <p>
          Og til tross for alt som skjer under panseret fra kilde til destinasjon, er det faktisk
          ganske enkelt å skrive en nettverks-app: all kompleksiteten kan abstraheres bort, og du
          trenger bare å forholde deg til to ting — <strong>hvilke tjenester transportlaget
          tilbyr</strong>, og <strong>hvordan grensesnittet mot dem ser ut</strong>.
        </p>

        <LectureBeat>To måter å strukturere delene på</LectureBeat>
        <p>
          I <strong>klient-server</strong>-paradigmet er serveren en alltid-på vert med permanent
          IP-adresse, slik at klientene vet hvor de skal ta kontakt. Klientene er koblet til av og
          på, har ikke fast IP — og, viktigst:{" "}
          <strong>klienter snakker ikke med hverandre</strong>. De går alltid via serveren.
        </p>
        <p>
          I <strong>peer-to-peer</strong> finnes ingen server. Likeverdige noder snakker direkte
          sammen: de ber om tjeneste fra andre peers og yter tjeneste tilbake — som i fildeling, der
          en peer både henter filer fra og serverer filer til andre. Siden peers kommer og går og
          bytter IP-adresse, blir <em>administrasjonen</em> av dem langt mer krevende enn i
          klient-server.
        </p>

        <LectureBeat>Prosesser, sockets og adressering</LectureBeat>
        <p>
          En nettverks-app er ikke ett program du kompilerer og kjører, men flere programmer som
          hver kjører som en <strong>prosess</strong> — den kjørende utgaven av et program. Snakker
          to prosesser sammen på samme maskin, kaller vi det interprosess-kommunikasjon; er de på
          hver sin maskin, må de bruke <strong>meldinger</strong>, og det er det vi er ute etter.
        </p>
        <p>
          Presis språkbruk fra nå av: prosessen som <em>tar kontakt først</em> er{" "}
          <strong>klienten</strong>, den som blir kontaktet er <strong>serveren</strong>.
          Grensesnittet ned til transportlaget kalles en <strong>socket</strong>, og bildet å ha i
          hodet er en <em>dør</em>: du lager døren, sender meldinger inn i den og tar imot meldinger
          ut av den. Det er alltid <strong>to sockets</strong> involvert — én i hver ende.
        </p>
        <p>
          For at en melding skal finne fram, trengs adresseinformasjon — akkurat som et brev trenger
          gateadresse og poststed, og leilighetsnummer om det er en blokk. En socket har to slike
          opplysninger: vertens <strong>IP-adresse</strong> og et <strong>portnummer</strong>. Noen
          portnumre er knyttet til en bestemt tjeneste — kobler du til port 80 havner du på
          webserveren, port 25 gir deg e-postserveren.
        </p>

        <LectureBeat>Åpne og lukkede protokoller</LectureBeat>
        <p>
          Å definere en applikasjonsprotokoll er å definere hvilke meldingstyper som utveksles, deres{" "}
          <em>syntaks</em> (hvilke felt finnes), deres <em>semantikk</em> (hva betyr feltene), og
          hvilke handlinger som utføres før og etter sending og mottak.{" "}
          <strong>Åpne</strong> protokoller har alt dette offentlig tilgjengelig — internett sine er
          spesifisert i RFC-er. <strong>Proprietære</strong> protokoller eies av et selskap og
          virkemåten er ikke offentlig kjent; Zoom og Skype er eksempler.
        </p>

        <LectureBeat>Hva kan man be transportlaget om?</LectureBeat>
        <p>
          Fire dimensjoner. <strong>Pålitelig dataoverføring</strong> trengs av filoverføring og
          web-transaksjoner — men ikke av alt: lyd og video tåler en del tap.{" "}
          <strong>Timing</strong> betyr noe for telefoni og interaktive spill, som krever lav
          forsinkelse for å fungere. <strong>Throughput</strong> kreves i en bestemt mengde av
          strømmet video, mens <em>elastiske</em> applikasjoner tar til takke med det de får. Og til
          slutt <strong>sikkerhet</strong>, for eksempel kryptering.
        </p>
        <p>
          Internettets transportlag tilbyr bare to varer. <strong>TCP</strong> gir pålitelig
          overføring, flytkontroll (avsenderen overfyller ikke mottakerens buffere), metningskontroll,
          og er forbindelsesorientert — det kreves en håndtrykksrunde før data flyter. Det gir{" "}
          <em>ingen</em> garantier om timing, throughput eller sikkerhet. <strong>UDP</strong> gir
          enda mindre: upålitelig overføring uten flytkontroll, metningskontroll, timing, throughput
          eller sikkerhet.
        </p>
        <p>
          Da er det rimelig å spørre hvorfor UDP finnes. Svaret — og det er en strategi mange
          applikasjonsprotokoller faktisk velger — er at man kan{" "}
          <strong>bygge akkurat de tjenestene man trenger oppå UDP, i applikasjonslaget selv</strong>,
          i stedet for å ta imot hele TCP-pakken med det den koster.
        </p>
        <p>
          Til slutt sikkerhet: socket-abstraksjonen fra 80-tallet hadde ingen sikkerhet i seg — ingen
          kryptering, ingen autentisering av motparten. Ville du ha det, måtte du bygge det selv i
          applikasjonen. I dag finnes <strong>TLS</strong>, et tynt lag som ligger i brukerrommet
          oppå TCP-socketene og gir kryptering, dataintegritet og endepunkt-autentisering.
        </p>
      </LectureNote>


      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            {
              term: "Klient-server",
              icon: <ClientServerArchIcon />,
              body: "Én alltid-på server, mange tilkoblende klienter.",
            },
            {
              term: "P2P (peer-to-peer)",
              icon: <P2PArchIcon />,
              body: "Likeverdige peers; ingen sentral server.",
            },
            {
              term: "Hybrid",
              icon: <HybridArchIcon />,
              body: "Sentral kontrollplan, distribuert dataplan.",
            },
            {
              term: "Socket",
              icon: <SocketPlugIcon />,
              body: "API-døra mellom appen din og transport-laget.",
            },
            {
              term: "Adresse + port",
              icon: <AddrPortIcon />,
              body: "IP velger maskin, port velger prosess.",
            },
            {
              term: "Transport-tjenester",
              icon: <TransportMenuIcon />,
              body: "Pålitelighet, throughput, timing, sikkerhet — fire knapper.",
            },
            {
              term: "App-protokoll",
              icon: <ProtocolDocIcon />,
              body: "Meldingsformat + rekkefølge + semantikk (HTTP, DNS, SMTP).",
            },
            {
              term: "Well-known ports",
              icon: <PortNumberIcon />,
              body: "0–1023 reservert (22 SSH, 80 HTTP, 443 HTTPS, 53 DNS).",
            },
            {
              term: "Throughput / latency / jitter",
              icon: <ThroughputJitterIcon />,
              body: "Mengde per tid / tid per pakke / varians i tid.",
            },
            {
              term: "RTT (round-trip time)",
              icon: <RttLoopIcon />,
              body: "Tid til server og tilbake — gulv for hvert request-svar.",
            },
            {
              term: "Stateful vs stateless",
              icon: <StateMemoryIcon />,
              body: "Husker mellom requests vs glemmer alt.",
            },
            {
              term: "Push vs pull",
              icon: <PushPullIcon />,
              body: "Server dytter til klient vs klient drar fra server.",
            },
            {
              term: "BDP",
              icon: <BdpPipeIcon />,
              body: "Båndbredde × RTT = bits «underveis» samtidig.",
            },
          ]}
        />
        <Illustration caption="To prosesser snakker via sockets — applikasjonen bryr seg ikke om hvordan transport-laget faktisk leverer dataene.">
          <ProcessSocketSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="Klient-server = restaurant med én kokk">
          <p>
            Kokken (serveren) står på kjøkkenet hele kvelden med en kjent adresse. Gjester
            (klienter) går inn, bestiller, får mat, drar igjen. To gjester på nabobordet snakker
            ikke direkte — de roper ikke «kan du sende meg potetstappa di?» til hverandre. Alt går
            via kokken. Hvis kokken blir syk stenger restauranten.
          </p>
        </Metafor>
        <Metafor tittel="P2P = lørdags-dugnad i borettslaget">
          <p>
            Ingen kokk. Alle som dukker opp har med seg noe og tar med seg noe: Per har bærpaier,
            Kari har vafler, Ola tar en porsjon av hver og deler ut kaffe i retur. Jo flere som
            kommer, jo mer mat er det totalt — kapasiteten <em>vokser</em> med deltakerne. Men hvis
            ingen gidder å bake, blir det heller ingenting å spise.
          </p>
        </Metafor>
        <Metafor tittel="Socket = handsettet på en gammeldags telefon">
          <p>
            Programmet ditt løfter handsettet (åpner socket), trykker nummer (port + IP), snakker
            (send) og lytter (recv). Det er ingen direkte kabel mellom dine ører og den andre — det
            er en svart boks i veggen (kernel/transportlaget) som ordner alt det tekniske. Du
            forholder deg bare til handsettet.
          </p>
        </Metafor>
        <Metafor tittel="RTT = ekko-tid i en fjelldal">
          <p>
            Du roper «hei!» mot fjellveggen og hører ekkoet 1 sekund senere. Det er din RTT. Selv om
            du står og skriker hver halve sekund, kommer hvert ekko først etter et helt sekund —
            bortenfra-veggen-og-tilbake har du ikke noe valg. Tromsø–Oslo ekko ≈ 20 ms;
            Tromsø–Sydney ekko ≈ 300 ms. Lysets hastighet er en lov, ikke en bug.
          </p>
        </Metafor>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Illustration caption="Klient-server vs P2P: én sender til alle, vs alle sender til alle.">
          <ArchVsP2PSvg />
        </Illustration>
        <Illustration caption="Transport-laget som meny: hver app krysser av hva den trenger.">
          <TransportMenuSvg />
        </Illustration>
      </div>

      <Example title="Eksempel: hvilken transport passer for hva?">
        <ul className="list-disc pl-5">
          <li>
            <strong>Netflix-streaming:</strong> tåler litt tap, vil ha jevn throughput, gjerne lav
            forsinkelse på start. Bruker faktisk TCP (via HTTPS) — pålitelighet er enklere enn å
            re-implementere det i app, og buffering skjuler jitter.
          </li>
          <li>
            <strong>Spillet ditt med 60 oppdateringer per sekund:</strong> en gammel posisjon er
            ubrukelig, ny posisjon kommer om 16 ms uansett. Vil ha UDP — kasta pakker er bedre enn
            forsinka pakker.
          </li>
          <li>
            <strong>Bank-overføring:</strong> 0 % tap, integritet kritisk, forsinkelse irrelevant.
            TCP + TLS, ikke noe valg.
          </li>
          <li>
            <strong>DNS-oppslag:</strong> én kort spørring, én kort respons. UDP — å sette opp en
            TCP-forbindelse for 80 bytes ville være overkill.
          </li>
        </ul>
      </Example>

      <Example title="Eksempel: BDP-regne på fjernkontor-backupen">
        <p>
          Et fjernkontor i Tromsø backer opp 500 GB hver natt til et datasenter i Frankfurt. Lenken
          er 200 Mbps og RTT er 60 ms. Hva er BDP, og hva betyr det for TCP-vindu-størrelsen?
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>BDP = 200·10⁶ bps × 0.060 s = 1.2·10⁷ bit = 1.5 MB</li>
          <li>For å mette lenken må TCP holde minst 1.5 MB usend-bekreftet</li>
          <li>
            Default Linux-vindu (4–8 MB siden 2010) holder — eldre Windows-versjoner hadde 64 KB og
            ville fått maks 64·10³·8/0.060 ≈ 8.5 Mbps, 4 % av kapasiteten
          </li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Konklusjon: en lenke kan «se» rask ut på speedtest (som bruker mange parallelle
          forbindelser) men kveles for én stor filoverføring hvis vinduet er for lite. Backup-tiden
          ville blitt 13 timer i stedet for ~6 timer.
        </p>
      </Example>

      <Example title="Eksempel: hvorfor Skype-arkitekturen er hybrid">
        <p>
          Skype trenger to ting: (1) finne mottakeren og holde kontaktlisten oppdatert, (2) overføre
          lyd og video når en samtale går.
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>
            Punkt 1 må være pålitelig, alltid tilgjengelig og konsistent på tvers av enheter — det
            gjøres med sentrale klient-server. Det er mye metadata, men hver melding er liten.
          </li>
          <li>
            Punkt 2 er bandbredde-tung men trenger ikke konsistens på tvers — to peers kan snakke
            direkte til hverandre, eventuelt via en relé hvis NAT-en blokkerer direkte forbindelse.
            P2P-medieoverføring skalerer billigere enn å rute alt gjennom Microsoft sine servere.
          </li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Mønsteret går igjen: kontrollplanet er sentralt (lett, men kritisk), dataplanet er
          distribuert (tungt, men toleranse for variasjon).
        </p>
      </Example>

      <Hvorfor title="Hvorfor er sockets API-en så lavnivå, helt etter 50 år?">
        <p>
          Berkeley-sockets ble standardisert i 1983 og er fortsatt nesten uendret. Det virker
          gammeldags — du må huske rekkefølgen socket → bind → listen → accept, manuelt håndtere
          delvise lesninger, velge mellom blokkerende og ikke-blokkerende I/O. Hvorfor har ingen
          erstattet det?
        </p>
        <p>
          Fordi grensesnittet ligger akkurat på riktig nivå: under det er transport-detaljer som
          applikasjoner ikke bør tenke på (segmentering, retransmisjon, vindu-styring), og over det
          er biblioteker som varierer etter bruksområde (HTTP-klienter, RPC-rammeverk,
          message-queues). Hvis OS-API-en hadde vært høyere ville den blitt for spesialisert; lavere
          ville den lekket transport-detaljer. Sockets er stabile fordi de stoppet akkurat der
          stabilitet ble en dyd — du kan bygge nesten alt over dem, og det er ingen versjon-2 å
          migrere til.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-socket-programmering"]} />
    </article>
  );
}

// ============================================================
// 2.2 — Web og HTTP
// ============================================================
function Section22() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="2.2" title="Web og HTTP" />

      <p className="text-muted-foreground">
        Web-en er det første mange tenker på når man sier «internett». HTTP er protokollen som
        binder den sammen: en stateless request/response-protokoll der klienten alltid starter.
        Versjoner: HTTP/1.0 fra 1996, HTTP/1.1 (fortsatt utbredt), HTTP/2 (2015, binær og
        multiplekset), HTTP/3 (2022, kjører på QUIC over UDP).
      </p>

      <Section22Live />

      <LectureNote title="Stateless, og de to forbindelsestypene">
        <p>
          En webside består av en <strong>base-HTML-fil</strong> pluss et sett refererte objekter —
          bilder, stilark, skript, lyd — og objektene kan godt ligge på helt andre servere. Hvert
          av dem har sin egen URL: et vertsnavn pluss en sti på den verten.
        </p>
        <p>
          HTTP kjører på klient/tjener-modellen og bruker TCP under seg. Én transaksjon er: klient
          åpner TCP-forbindelse til serveren (port 80), en eller flere HTTP-meldinger utveksles,
          forbindelsen lukkes. Både Firefox på en PC og Safari på en mobil snakker samme protokoll
          med den samme webserveren.
        </p>
        <p>
          HTTP er <strong>stateless</strong>: serveren husker ingenting om forespørselen etterpå.
          Én forespørsel, ett svar, ferdig. Grunnen er <em>enkelhet</em>. Protokoller som holder
          tilstand må håndtere det vonde tilfellet — «vi var i steg 3 av 5 og så krasjet det, nå må
          jeg rulle tilbake og rydde opp i inkonsistent tilstand». Det slipper HTTP helt.
        </p>

        <LectureBeat>Ikke-persistent vs. persistent</LectureBeat>
        <p>
          Merk først at HTTP-forbindelsen mellom nettleser og server er noe annet enn{" "}
          <strong>TCP</strong>-forbindelsen under. Med{" "}
          <strong>ikke-persistent HTTP</strong> åpnes en TCP-forbindelse, høyst ett objekt sendes,
          og forbindelsen lukkes. Skal du ha ti bilder, må du gjennom det ti ganger.
        </p>
        <p>
          Definer <strong>RTT</strong> (round-trip time) som tiden en bitte liten pakke bruker fra
          klient til server og tilbake. Da blir responstiden per objekt:{" "}
          <strong>én RTT for å sette opp TCP-forbindelsen</strong>,{" "}
          <strong>én RTT til for forespørselen og de første bytene av svaret</strong>, pluss tiden
          serveren bruker på å sende selve fila ut på lenken. Altså{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">2·RTT + filtid</code>.
        </p>
        <p>
          <strong>Persistent HTTP</strong> (HTTP/1.1) lar forbindelsen stå åpen etter svaret. Nye
          forespørsler sendes over den samme åpne forbindelsen med én gang nettleseren støter på et
          referert objekt — ingen ny oppsettsrunde. Det halverer responstiden til{" "}
          <strong>én RTT</strong> per objekt, og det er slik nesten alle webservere kjører i dag.
        </p>

        <LectureBeat>Meldingene, i praksis</LectureBeat>
        <p>
          En <strong>request</strong> starter med én forespørselslinje: metode, URL, HTTP-versjon.
          Så følger header-linjer med tilleggsinfo — hvilken vert forespørselen gjelder, hvilken
          nettleser som spør, hvilke innholdstyper og språk som foretrekkes, om forbindelsen skal
          holdes åpen — og meldingen avsluttes med en tom linje. Noen metoder har i tillegg en{" "}
          <strong>body</strong> med data som ikke passer i headerne.
        </p>
        <p>
          Fire metoder å kjenne: <strong>GET</strong> henter et objekt, <strong>POST</strong>{" "}
          laster opp skjemadata, <strong>PUT</strong> legger opp et nytt objekt på en gitt URL (og
          kan erstatte et eksisterende), og <strong>HEAD</strong> ber om nøyaktig det svaret et GET
          ville gitt, bare uten kroppen — nyttig for å finne ut hvor stort et objekt er uten å
          laste det ned.
        </p>
        <p>
          Et <strong>response</strong> starter med en statuslinje: versjon, statuskode og en kort
          frase — <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">200 OK</code>{" "}
          når alt gikk bra,{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">404 Not Found</code> når
          objektet ikke finnes. Så header-linjer (dato, servertype, når dokumentet sist ble endret,
          hvor langt det er, hvilken type det er) og til slutt selve objektet.
        </p>
        <p>
          Det fine er at alt dette er <strong>lesbart for mennesker</strong>. Spesifikasjonen er
          85 sider og du må kunne hver detalj hvis du skal <em>implementere</em> en klient eller
          server — men som nettverksstudent holder det å kjenne strukturen og kunne slå opp resten
          i RFC-en.
        </p>
      </LectureNote>

      <LectureNote title="Cookies — hvordan en stateless protokoll likevel husker deg">
        <p>
          Selv om HTTP er tilstandsløst, kan en webserver holde tilstand om en bruker — mer presist
          om en <em>nettleser</em> — mellom transaksjoner. Mekanismen har{" "}
          <strong>fire deler</strong>: en cookie-header-linje i svaret, en cookie-header-linje i
          neste forespørsel, en cookie-fil hos klienten, og en database bak serveren.
        </p>
        <p>
          Gangen er enkel. Klienten spør første gang uten cookie. Serveren lager en cookie — i
          bunn og grunn bare et tall — lagrer den sammen med transaksjonen i databasen sin, og
          sender den med i svaret. Neste gang klienten spør, sender den tallet med, og nå kan
          serveren gjøre noe <em>cookie-spesifikt</em>: så du på én vare forrige gang og en annen
          nå, kan svaret inneholde et tilbud på begge samlet. Kommer du tilbake en uke senere med
          det samme tallet, kan serveren fortsatt si «du så på disse — skal du ikke ha dem?»
        </p>
        <p>
          Derfor brukes cookies til å huske at du er innlogget, hva som ligger i handlekurven, og
          til anbefalinger basert på tidligere oppførsel. Legg merke til at klienten samtidig har
          cookies fra alle andre nettsteder den har besøkt.
        </p>
        <p>
          Det er også her personvernet kommer inn. Cookies lar nettsteder lære mye om deg, og{" "}
          <strong>tredjeparts-cookies</strong> lar flere nettsteder gjenkjenne{" "}
          <em>den samme identiteten</em> på tvers. Under <strong>GDPR</strong> kan cookies som
          ikke er strengt nødvendige for at nettstedet skal fungere først aktiveres etter at du har
          gitt eksplisitt samtykke — det er derfor du må ta stilling til en cookie-boks før du får
          bruke halve internett.
        </p>
      </LectureNote>

      <LectureNote title="Web-cache og betinget GET — regnestykket">
        <p>
          En institusjon setter opp en <strong>web-cache</strong> og nettleserne peker på den. Alle
          forespørsler går til cachen først: har den objektet, svarer den selv og{" "}
          <strong>origin-serveren er ikke engang involvert</strong>; har den det ikke, henter den
          objektet fra origin-serveren, lagrer det, og leverer videre. Cachen er altså{" "}
          <em>server</em> mot klienten og <em>klient</em> mot origin-serveren. Origin-serveren kan
          styre hvor lenge — eller om — objektet får caches, via{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">Cache-Control</code>.
        </p>
        <p>
          Regn på det. Institusjonsnettet har en aksesslenke på{" "}
          <strong>1,544 Mb/s</strong> ut mot internett, RTT fra institusjonsruteren til
          origin-serverne er <strong>2 s</strong>, gjennomsnittlig objektstørrelse{" "}
          <strong>100 kbit</strong>, og nettleserne gjør <strong>15 forespørsler i sekundet</strong>.
          Da strømmer det inn 15 × 100 kbit = <strong>1,50 Mb/s</strong> over en lenke som tåler
          1,544. Utnyttelsesgraden blir <strong>0,97</strong> — og på en lenke som er 97 % full blir
          køforsinkelsen katastrofal, i minutt-klassen. LAN-et internt ligger på 0,0015 og bidrar
          med mikrosekunder. <strong>Aksesslenken er flaskehalsen.</strong>
        </p>
        <p>
          <strong>Alternativ 1: kjøp raskere lenke.</strong> 154 Mb/s gir utnyttelse 0,0097 og
          køene forsvinner. Problemet er prislappen — det er en fast månedlig kostnad.
        </p>
        <p>
          <strong>Alternativ 2: sett opp cachen.</strong> Si at 40 % av forespørslene treffer i
          cachen. De 40 % besvares lokalt på millisekunder. De resterende 60 % må ut, så trafikken
          på aksesslenken blir 0,6 × 1,5 Mb/s = <strong>0,9 Mb/s</strong>, og utnyttelsen faller til{" "}
          <strong>0,58</strong> — der er køforsinkelsen minimal. Snitt-responstiden blir omtrent
          0,6 × 2,01 s + 0,4 × (noen få ms) ≈ <strong>1,2 sekunder</strong>. Du har altså halvert
          lastetiden <em>og</em> spart lenke-oppgraderingen — samtidig som origin-serveren
          avlastes. Tre gevinster på én investering.
        </p>

        <LectureBeat>Betinget GET</LectureBeat>
        <p>
          Den andre cache-formen sitter i din egen maskin og nettleser: har klienten allerede en
          fersk kopi, er det ingen grunn til å sende objektet på nytt. Men hvordan vet klienten at
          kopien er fersk? Den sender med feltet{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">If-Modified-Since</code>{" "}
          med datoen kopien ble hentet. Serveren svarer da på én av to måter:{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">304 Not Modified</code>{" "}
          uten kropp hvis kopien fortsatt gjelder, eller vanlig{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">200 OK</code> med en
          nyere versjon hvis objektet er endret. Begge cache-formene gir både bedre opplevd ytelse
          og lavere ressursbruk i nettet.
        </p>
      </LectureNote>

      <LectureNote title="HTTP/2: rammer og head-of-line blocking">
        <p>
          Hovedmålet med HTTP/2 var å kutte forsinkelsen når en side består av mange objekter.
          Metoder, statuskoder og de fleste header-feltene er stort sett uendret fra 1.1. Det som
          er nytt: klienten kan <strong>angi prioritet</strong> på objektene så rekkefølgen ikke
          må være først-til-mølla, serveren kan <strong>pushe</strong> objekter klienten trolig vil
          be om snart — og, viktigst, store objekter kan deles i{" "}
          <strong>rammer</strong> (frames) som kan planlegges mot hverandre.
        </p>
        <p>
          Poenget med rammene er å unngå <strong>head-of-line blocking</strong>. Tenk at klienten
          ber om én stor videofil og deretter tre små objekter. I HTTP/1.1 leveres de i tur og
          orden: den store først, og de tre små må vente. Det er kassa på butikken — du står med ett
          brød bak noen med full handlevogn, og alle taper på at vogna må ekspederes ferdig først.
        </p>
        <p>
          HTTP/2 deler den store fila i rammer og fletter rammene fra de ulike objektene inn i
          hverandre. Resultatet: de tre små objektene kommer raskt fram, den store blir bare
          marginalt forsinket, og gjennomsnittlig objektforsinkelse går klart ned.
        </p>
        <p>
          Det som gjenstår å fikse — effekten av <strong>pakketap</strong> og manglende sikkerhet i
          bunnen av TCP-forbindelsen — er nettopp det <strong>HTTP/3</strong> tar tak i, ved å
          kjøre på QUIC over UDP. Detaljene der gir mest mening når vi har vært gjennom
          transportlaget i kapittel 3.
        </p>
      </LectureNote>


      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            {
              term: "Request / response",
              icon: <ReqResIcon />,
              body: "Startlinje + headers + body; svar har statuslinje.",
            },
            {
              term: "Stateless",
              icon: <StateMemoryIcon />,
              body: "Server glemmer alt mellom requests — bevisst valg.",
            },
            {
              term: "Persistent forbindelse",
              icon: <PersistentChainIcon />,
              body: "Holder TCP åpen for flere requests (keep-alive).",
            },
            {
              term: "Pipelining / HOL-blocking",
              icon: <HolBlockIcon />,
              body: "Send flere på rad; sakte svar blokkerer raske.",
            },
            {
              term: "HTTP/2",
              icon: <Http2Icon />,
              body: "Binær, mange streams over én TCP-forbindelse.",
            },
            {
              term: "HTTP/3 (QUIC)",
              icon: <Http3QuicIcon />,
              body: "Streams uavhengige også på transportlaget; UDP-basert.",
            },
            {
              term: "Cookies",
              icon: <CookieIcon />,
              body: "Server-satt tekst som klienten gir tilbake hver request.",
            },
            {
              term: "Metoder",
              icon: <HttpMethodIcon />,
              body: "GET hent, POST opprett, PUT erstatt, PATCH endre, DELETE slett.",
            },
            {
              term: "Statuskoder",
              icon: <StatusBadgeIcon />,
              body: "2xx ok, 3xx redirect, 4xx du-feil, 5xx jeg-feil.",
            },
            {
              term: "Conditional GET",
              icon: <ConditionalGetIcon />,
              body: "If-None-Match → server svarer 304 (uendret).",
            },
            {
              term: "Proxy / web-cache",
              icon: <ProxyCacheIcon />,
              body: "Bedrifts-mellom-server som cacher for sine brukere.",
            },
            {
              term: "CORS",
              icon: <CorsIcon />,
              body: "Headers som lar fremmed domene lese svaret i nettleseren.",
            },
            {
              term: "HTTPS / TLS",
              icon: <HttpsLockIcon />,
              body: "HTTP over TLS over TCP — autentisering, kryptering, integritet.",
            },
          ]}
        />
        <Illustration caption="Forskjellen mellom seriell HTTP/1.1 og multiplekset HTTP/2 når en side har flere ressurser.">
          <HttpVersionsSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="HTTP-request = bestillings-skjema på pappkartong">
          <p>
            Du krysser av: <em>metode</em> (hent / send / slett), <em>vare-nummer</em> (URL),
            <em> notater</em> (headers — «pakk inn i jpeg», «jeg snakker norsk»), og eventuelt en
            <em> handlekurv-liste</em> (body). Kokken bak disken returnerer et identisk
            kvitterings-skjema: <em>kode</em> (200 OK, 404 finnes ikke), <em>notater</em> tilbake,
            og selve <em>varen</em>. Hver bestilling er sin egen lapp — ingen «du vet jo hva jeg
            pleier».
          </p>
        </Metafor>
        <Metafor tittel="Stateless server = legevakts-fastlegen som glemmer alt">
          <p>
            Du går til legevakta. Legen har <em>aldri</em> sett deg før — du må fortelle alt på
            nytt: navn, sykdom, allergier. Hver visitt er en blank tavle. Ulempen er at du må gjenta
            deg selv. Fordelen er at det <em>spiller ingen rolle hvilken lege du får</em> — de er
            alle like uvitende, så ekspedering kan parallelliseres uansvarlig. Cookies er sedler du
            har med deg som forteller legen hvem du er.
          </p>
        </Metafor>
        <Metafor tittel="HTTP/1.1 vs HTTP/2 = enkel betjent vs flere kasser samtidig">
          <p>
            HTTP/1.1 seriell: én kasse, en lang kø. Bestillingen din venter til alle foran er
            ferdig. HTTP/1.1 «6 parallelle TCP» = seks separate kø-betjenter på samme butikk —
            forbedring, men hver kø er fortsatt seriell og må sette opp seg selv først. HTTP/2 =
            <em>
              {" "}
              én kasse-disk som tar mange bestillinger om gangen og leverer dem etter hvert som de
              er ferdig
            </em>
            , ikke nødvendigvis i samme rekkefølge.
          </p>
        </Metafor>
        <Metafor tittel="TLS-handshake = veksle hemmelig kode før samtalen">
          <p>
            Før du og kompisen din begynner å hviske hemmeligheter på bussen, sender du ham en
            kodebok i en konvolutt. Han åpner den, lager seg en kopi, og fra det øyeblikket snakker
            dere via koden. Ingen som lytter kan forstå. TLS gjør det samme i 1 RTT (TLS 1.3):
            klient og server bytter offentlige nøkler og utleder en delt sesjon-nøkkel, og{" "}
            <em>alt</em> deretter krypteres med den.
          </p>
        </Metafor>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Illustration caption="Statuskode-familier: første siffer forteller hvem som har skylda.">
          <StatusCodeFamiliesSvg />
        </Illustration>
        <Illustration caption="Cookie-flyt: server setter, klient lagrer, klient sender tilbake hver gang.">
          <CookieFlowSvg />
        </Illustration>
      </div>

      <Illustration caption="Side-ved-side: hvordan 3 ressurser fra finn.no hentes i hver HTTP-versjon. HTTP/3 sparer en hel TLS-runde.">
        <HttpVersionFlowSideBySideSvg />
      </Illustration>

      <Illustration caption="Conditional GET-flyt mot vg.no: 80 kB body første gang, 150 bytes 304 ved gjenbesøk.">
        <HttpCachingTimelineSvg />
      </Illustration>

      <Example title="Eksempel: hvor mange RTT-er bruker en side med 6 ressurser?">
        <p>
          En side består av 1 HTML + 6 bilder. RTT mellom klient og server er 80 ms. Vi ignorerer
          transmisjons-tid og prosessering.
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>
            HTTP/1.0 (ny forb. per request): 7 requests × 2 RTT (TCP-handshake + request) = 1120 ms
          </li>
          <li>HTTP/1.1 persistent, seriell: 1 RTT TCP + 7 RTT requests = 640 ms</li>
          <li>HTTP/1.1 + 6 parallelle TCP: 1 RTT + 2 RTT (HTML, så bilder parallelt) = 240 ms</li>
          <li>HTTP/2 (1 forb., multiplekset): 1 RTT TCP + 1 RTT TLS + 2 RTT app = 320 ms</li>
          <li>HTTP/3 (QUIC 0-RTT for kjent server): 0 RTT setup + 2 RTT app = 160 ms</li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          De faktiske tallene varierer (TLS er ofte 1-RTT eller 0-RTT med session resumption), men
          mønsteret holder: hver versjon kutter en eller flere RTT-er fra kritisk sti.
        </p>
      </Example>

      <Example title="Eksempel: conditional GET sparer båndbredde">
        <p>
          En nettleser har en cached versjon av <code>/static/style.css</code> fra i går, med ETag{" "}
          <code>"a1b2c3"</code> og størrelse 80 kB. Brukeren laster siden på nytt.
        </p>
        <pre className="text-[12px] font-mono whitespace-pre-wrap bg-background border border-border rounded p-2">{`GET /static/style.css HTTP/1.1
Host: butikken.no
If-None-Match: "a1b2c3"

→ HTTP/1.1 304 Not Modified
  ETag: "a1b2c3"
  Cache-Control: max-age=86400`}</pre>
        <p className="mt-2">
          Serveren svarte med 304 og tom body — totalt ~150 bytes på lufta i stedet for 80 kB. Hvis
          stylesheet-en hadde endret seg ville serveren returnert 200 + ny ETag + ny body.
        </p>
        <p className="mt-2 text-muted-foreground">
          For en side med 30 ressurser der 28 er uendret blir innsparingen massiv — derfor er ETags
          en av de billigste optimaliseringene en backend kan implementere.
        </p>
      </Example>

      <Example title="Eksempel: hvorfor en CORS-preflight skjer">
        <p>
          Frontend på <code>app.eksempel.no</code> kaller API-et på <code>api.eksempel.no</code>:
        </p>
        <pre className="text-[12px] font-mono whitespace-pre-wrap bg-background border border-border rounded p-2">{`// JS i nettleseren:
fetch("https://api.eksempel.no/ordre/42", {
  method: "DELETE",
  headers: { "Authorization": "Bearer ey..." }
})`}</pre>
        <p className="mt-2">
          Nettleseren ser at metoden er DELETE og at det er en custom header (Authorization). Derfor
          sender den først:
        </p>
        <pre className="text-[12px] font-mono whitespace-pre-wrap bg-background border border-border rounded p-2">{`OPTIONS /ordre/42 HTTP/1.1
Origin: https://app.eksempel.no
Access-Control-Request-Method: DELETE
Access-Control-Request-Headers: authorization

→ 204 No Content
  Access-Control-Allow-Origin: https://app.eksempel.no
  Access-Control-Allow-Methods: GET, POST, DELETE
  Access-Control-Allow-Headers: authorization
  Access-Control-Max-Age: 600`}</pre>
        <p className="mt-2 text-muted-foreground">
          Først etter dette OK sender nettleseren selve DELETE. Max-Age forteller den at den kan
          skippe preflight de neste 600 sekundene for samme kombinasjon.
        </p>
      </Example>

      <Hvorfor title="Hvorfor multiplekser HTTP/2 i stedet for å bare åpne mange TCP-er?">
        <p>
          HTTP/1.1 «løste» pipelining-problemet med 6 parallelle TCP-forbindelser per origin. Det
          virker enkelt — hvorfor gikk man bort fra det?
        </p>
        <p>
          Tre grunner. <strong>(1) TCP-handshake er dyr</strong>: 1 RTT × 6 forbindelser = 480 ms
          før noe data flyter på 80 ms RTT.{" "}
          <strong>(2) TCP slow-start gjør hver forbindelse langsom på starten</strong>; med 6
          separate vinduer starter du 6 ganger på 14 kB i stedet for å akkumulere ett raskt voksende
          vindu. <strong>(3) Hver forbindelse konkurrerer med de andre om båndbredde</strong> — TCP
          er rettferdig per forbindelse, så det å åpne flere stjeler fra andre brukere. HTTP/2
          multiplekser over én forbindelse: én handshake, ett windowstilstand som rask vokser, og en
          flow-control som ser hele transferen.
        </p>
        <p>
          Den ene gjenværende svakheten — TCP head-of-line-blocking under én forbindelse — er
          akkurat det QUIC og HTTP/3 ble bygget for å fjerne.
        </p>
      </Hvorfor>

      <RelatedSlugs
        slugs={[
          "http-anatomi",
          "http-statuskoder",
          "dte2507-http2-hol",
          "dte2507-web-caching-matte",
        ]}
      />
    </article>
  );
}

// ============================================================
// 2.3 — DNS
// ============================================================
function Section23() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="2.3" title="DNS — internettets adressebok" />

      <p className="text-muted-foreground">
        Mennesker skriver <code>uit.no</code>; rutere ruter på <code>129.242.16.214</code>.
        Oversettelsen er DNS-en jobb. Det høres ut som en enkel oppslags-tjeneste, men er i praksis
        et hierarkisk, distribuert, sterkt caching-avhengig system uten ett sentralt punkt — og det
        kjører trofast for hver eneste request du gjør.
      </p>

      <Section23Live />

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            {
              term: "Hierarkisk navnerom",
              icon: <HierarchyTreeIcon />,
              body: "Leses høyre→venstre; ansvar deles per nivå.",
            },
            {
              term: "Root-servere",
              icon: <RootServerIcon />,
              body: "13 logiske, hundrevis fysisk via anycast — toppen.",
            },
            {
              term: "Iterativt vs rekursivt",
              icon: <IterRecurIcon />,
              body: "Klient→resolver rekursivt; resolver→auth iterativt.",
            },
            {
              term: "Caching + TTL",
              icon: <TtlClockIcon />,
              body: "Lokal lagring i N sekunder — det som gjør DNS skalerbar.",
            },
            {
              term: "Record-typer",
              icon: <DnsRecordIcon />,
              body: "A=IPv4, AAAA=IPv6, CNAME=alias, MX=mail, NS=navneserver, TXT=fri tekst.",
            },
            {
              term: "Glue records",
              icon: <GlueIcon />,
              body: "Følger med delegering så du unngår sirkulær avhengighet.",
            },
            {
              term: "Stub-resolver",
              icon: <StubResolverIcon />,
              body: "OS-biblioteket som bare spør lokal resolver.",
            },
            {
              term: "Reverse DNS (PTR)",
              icon: <ReverseArrowIcon />,
              body: "IP → navn, via in-addr.arpa-sonen.",
            },
            {
              term: "Autoritativ svar",
              icon: <AuthoritativeIcon />,
              body: "Fra sonens egen server (AA-flagg) vs cache.",
            },
            {
              term: "Negativ caching",
              icon: <NegativeCacheIcon />,
              body: "NXDOMAIN huskes også — derfor henger feil-svar igjen.",
            },
            {
              term: "DoH / DoT",
              icon: <HttpsLockIcon />,
              body: "Krypterer DNS-spørringen mellom stub og resolver.",
            },
            {
              term: "DNSSEC",
              icon: <SignedShieldIcon />,
              body: "Signaturer i hierarki-kjede — root signerer TLD signerer ...",
            },
            {
              term: "EDNS0",
              icon: <Edns0Icon />,
              body: "Utvider UDP-svar fra 512 til 4096 bytes.",
            },
          ]}
        />
        <Illustration caption="Iterativt DNS-oppslag for www.uit.no fra en lokal resolver — fire trinn, deretter cached.">
          <DnsLookupSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="DNS-hierarki = kommune-administrasjon for å finne folk">
          <p>
            Du leter etter en spesifikk svømmehallsvakt i Tromsø. Du går først til{" "}
            <em>statens adressekontor</em> (root) — de sier «kommunale tjenester håndteres av
            kommunens administrasjon». Du går til <em>kommune-administrasjonen</em> (.no TLD) — de
            sier «idrettsanlegg ligger under kultursjefen». Du går til <em>kultursjefen</em>
            (uit.no auth) — som peker deg til personen som faktisk vet:
            <em> svømmehall-leder</em>. Ingen ett kontor vet alt. Hvert kontor vet bare hva neste
            steg er.
          </p>
        </Metafor>
        <Metafor tittel="DNS-cache + TTL = «meste-pris-tilbud» klistret på kjøleskapet">
          <p>
            Du ringte Pizza-Olsen for nummeret deres. Du klistrer det på kjøleskapet med en lapp:
            «gyldig 1 mnd». Neste gang du vil bestille pizza ringer du <em>fra lappen</em> uten å
            ringe nummeropplysningen igjen. Etter en måned river du den ned og slår opp på nytt —
            kanskje Pizza-Olsen har byttet nummer. TTL er hvor lenge lappen henger. Kort TTL =
            ferskere data, mer arbeid. Lang TTL = mindre arbeid, men «kunden hører ikke at vi
            flyttet på 3 dager».
          </p>
        </Metafor>
        <Metafor tittel="CNAME = videresend-pil på en gammel butikk">
          <p>
            «Lille Bakeri flyttet — finn oss på Storgata 12 fra og med i dag.» Skiltet henger på den
            gamle adressen, men du må fortsatt gå til Storgata 12 for å kjøpe brød. En CNAME er
            akkurat dette: spør du etter <code>www.eksempel.no</code> og det er en CNAME til
            <code>edge.cdn.com</code>, må du slå opp <em>det</em> navnet for å få faktisk IP. Ett
            ekstra hopp, men gir fleksibilitet.
          </p>
        </Metafor>
        <Metafor tittel="MX-prioritet = bryllups-gjestelisten med back-up-flyplasser">
          <p>
            Når et fly er kansellert sjekker bagasje-systemet en prioriterings-liste: 1) Oslo, 2)
            Bergen, 3) Trondheim, 4) Tromsø. Sender prøver lavest tall først, går videre hvis den
            ikke svarer. MX-records virker likt:{" "}
            <em>10 primary, 20 backup1, 20 backup2, 50 fjern-by</em>. Likt tall = last-balanseres.
            Hele oppsettet uten å endre noe annet enn DNS.
          </p>
        </Metafor>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Illustration caption="Hvordan DNS-cache filtrerer trafikk vekk fra autoritativ server (TTL = 1 t, jevn trafikk).">
          <DnsCacheFilterSvg />
        </Illustration>
        <Illustration caption="Vanlige record-typer: hva returneres for ulike spørsmål om samme domene.">
          <DnsRecordTypesSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Illustration caption="Resolver-cache som tre: TLDer i midten, sub-domener under, varierende TTL nedover.">
          <DnsCacheTreeSvg />
        </Illustration>
        <Illustration caption="Steg-for-steg-tidslinje for et oppslag av finn.no — fra cache-miss til ferdig svar på 75 ms.">
          <DnsLookupTimelineSvg />
        </Illustration>
      </div>

      <Example title="Eksempel: TTL-trade-off for en stor tjeneste">
        <p>
          En stor norsk avis har 5 millioner DNS-oppslag per dag mot navnet www.avisa.no. De
          vurderer to TTL-er:
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>
            <strong>TTL = 3600 s (1 time):</strong> Hver resolver i landet trenger maks ett oppslag
            per time. Hvis Norge har ~1000 lokale resolvere (telco-er, store ISP-er, bedrifter) blir
            det ~24 000 oppslag til autoritativ server per dag. Lett trafikk.
          </li>
          <li>
            <strong>TTL = 30 s:</strong> Samme cache-flow gir nå 2.88 millioner oppslag/dag mot
            autoritativ server — 120× økning. Mye dyrere infrastruktur.
          </li>
        </ul>
        <p className="mt-2">
          Hvorfor i det hele tatt vurdere lav TTL? Failover. Hvis primary-serveren går ned vil du
          bytte til backup-IP raskt — men cached gamle svar holder klienter på den døde IP-en til
          TTL-en utløper. Lavere TTL = raskere recovery, høyere kostnad. Realistisk balansepunkt for
          store tjenester er ofte 60–300 sekunder.
        </p>
      </Example>

      <Example title="Eksempel: hva en typisk dig-utskrift forteller">
        <p>
          Du kjører <code>dig +trace shop.eksempel.no</code> for å se hele kjeden:
        </p>
        <pre className="text-[12px] font-mono whitespace-pre-wrap bg-background border border-border rounded p-2">{`.                  518400 IN  NS  a.root-servers.net.
                   ... (12 til)

no.                172800 IN  NS  i.nic.no.
                   ... (flere)

eksempel.no.       86400  IN  NS  ns1.eksempel.no.
eksempel.no.       86400  IN  NS  ns2.eksempel.no.

shop.eksempel.no.  300    IN  A   203.0.113.42
;; SERVER: 203.0.113.10#53 (ns1.eksempel.no)`}</pre>
        <p className="mt-2">
          Linjene viser delegerings-kjeden: root → .no → eksempel.no → endelig A-record. TTL-ene er
          518400 s (6 dager) for root-NS, 86400 s (1 dag) for selve eksempel.no sin delegering, og
          300 s (5 min) for den endelige IP-en. Lav TTL nederst gir rask failover; høye TTL-er
          øverst er trygt fordi delegering nesten aldri endres.
        </p>
      </Example>

      <Example title="Eksempel: hvordan MX-record-prioritet styrer e-post">
        <p>
          For domenet <code>eksempel.no</code> finner mail-sender disse MX-recordene:
        </p>
        <pre className="text-[12px] font-mono whitespace-pre-wrap bg-background border border-border rounded p-2">{`eksempel.no.  3600  IN  MX  10 primary.mail.eksempel.no.
eksempel.no.  3600  IN  MX  20 backup1.mail.eksempel.no.
eksempel.no.  3600  IN  MX  20 backup2.mail.eksempel.no.
eksempel.no.  3600  IN  MX  50 last-resort.fjern-by.no.`}</pre>
        <p className="mt-2">
          Tallet er <em>preferanse</em>, lavere først. Sender prøver primary først. Hvis den ikke
          svarer, lastbalanseres det mellom backup1 og backup2 (samme preferanse). Hvis ingen av dem
          virker prøves last-resort. Slik bygger man inn redundans i e-post-leveringen uten å endre
          noe annet enn DNS.
        </p>
      </Example>

      <Hvorfor title="Hvorfor er DNS-en hierarkisk i stedet for én stor lookup-tabell?">
        <p>
          Internett har milliarder av navn. Hva om man hadde én sentral DNS-server med en gigantisk
          hash-map? Da ville fire ting gått galt:
        </p>
        <ul className="list-disc pl-5">
          <li>
            <strong>Skalering:</strong> milliarder av spørringer per sekund treffer ett punkt. Selv
            med massiv parallellisering blir det en flaskehals og et single point of failure.
          </li>
          <li>
            <strong>Administrasjon:</strong> hvem oppdaterer? UiT vil legge til ny.uit.no uten å
            spørre noen sentral myndighet. Hierarkiet delegerer ansvar — .no driftes av Norid,
            uit.no av UiT selv.
          </li>
          <li>
            <strong>Politisk uavhengighet:</strong> ingen ett land eller selskap har vetorett over
            hele systemet. Et lands TLD kan ha egne regler uten å påvirke andre.
          </li>
          <li>
            <strong>Caching:</strong> hierarkiet matcher hvordan svar deles. Et svar for
            shop.eksempel.no caches uavhengig av andre svar fra .no — det ville vært uhåndterbart
            med en flat struktur.
          </li>
        </ul>
        <p>
          Designet er fra 1983 og har skalert fra noen tusen til milliarder av navn uten store
          endringer i grunnstrukturen. Det er den slags arkitektur du bare kan komme på når du
          tegner med blyant i fred.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-dns-dyp"]} />
    </article>
  );
}

// ============================================================
// 2.4 — E-post og P2P
// ============================================================
function Section24() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="2.4" title="E-post og P2P-systemer" />

      <p className="text-muted-foreground">
        To eldre, men fortsatt høyst aktuelle, klasser av apper. E-post viser hvordan man bygger en
        asynkron, store-and-forward-tjeneste på toppen av TCP. P2P-systemer som BitTorrent viser
        hvordan man skalerer ved å la deltakerne dele arbeidet.
      </p>

      <Section24Live />

      <LectureNote title="SMTP: push-protokollen, og hva den lærer oss">
        <p>
          E-post har vært i drift siden 1972 og er ikke den mest spennende applikasjonen i
          kapittelet — men den er et rent og enkelt eksempel på klient-server-modellen, og
          forskjellene fra HTTP er lærerike i seg selv.
        </p>
        <p>
          Tre komponenter. <strong>Brukeragenten</strong> — e-postklienten din — brukes til å skrive,
          redigere og lese. <strong>E-postserveren</strong> holder to ting per bruker: en{" "}
          <em>postkasse</em> med innkommende og tidligere mottatte meldinger, og en{" "}
          <em>utgående kø</em> med meldinger som venter på å sendes til mottakerens server. Og{" "}
          <strong>SMTP</strong> er protokollen som dytter meldinger fra brukeragent til server, og
          fra server til server.
        </p>

        <LectureBeat>Fra Alice til Bob, steg for steg</LectureBeat>
        <p>
          Alice skriver meldingen i klienten sin og trykker send. Klienten kontakter{" "}
          <em>Alices egen</em> e-postserver og overfører meldingen dit med SMTP. Alices server åpner
          så en TCP-forbindelse til <em>Bobs</em> server, og sender — nå i rollen som klient —
          meldingen over. Bobs server legger den i Bobs postkasse. Og på et helt annet tidspunkt,
          asynkront, åpner Bob klienten sin og leser meldingen fra sin server.
        </p>
        <p>
          Legg merke til at meldingen går <strong>direkte fra avsendende til mottakende server</strong>
          — ingen mellomledd. SMTP kjører på TCP, og standard serverport er{" "}
          <strong>25</strong>, slik at klienten alltid vet hvor den skal ta kontakt.
        </p>

        <LectureBeat>Dialogen, som er til å lese</LectureBeat>
        <p>
          Etter at TCP-forbindelsen står, er det tre faser. Først et <strong>håndtrykk</strong> på
          tre meldinger: mottakerserveren melder seg med kode <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">220</code> og
          vertsnavnet sitt, klienten hilser med sitt eget vertsnavn, og serveren hilser tilbake med
          kode <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">250</code>. Så{" "}
          <strong>overføringen</strong>: hvem meldingen er fra, hvem den skal til, kommandoen{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">DATA</code> som varsler
          at selve meldingen kommer, meldingen — og en linje som inneholder{" "}
          <strong>bare et punktum</strong> som avslutning. Til slutt sier klienten fra at den er
          ferdig, serveren svarer{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">221</code>, og
          forbindelsen lukkes.
        </p>

        <LectureBeat>SMTP mot HTTP</LectureBeat>
        <p>
          Den viktigste forskjellen: HTTP er en <strong>pull</strong>-protokoll — klienten drar data
          ut av serveren. SMTP er en <strong>push</strong>-protokoll — klienten dytter en melding inn
          til serveren. Ellers er slektskapet tydelig: begge er ASCII-kodet og lesbare, begge bruker
          statuskoder med en kort forklarende frase (ikke de samme kodene, men samme idé), og HTTP
          hentet faktisk noe av inspirasjonen sin fra SMTP.
        </p>
        <p>
          To forskjeller til. SMTP kan pakke <strong>flere objekter inn i én melding</strong>, mens
          HTTP håndterer ett objekt per forespørsel. Og SMTP bruker{" "}
          <strong>persistente forbindelser</strong>, slik at flere e-poster kan gå over samme
          forbindelse.
        </p>
        <p>
          Én ting som forvirrer nesten alle: <em>meldingsformatet</em> og{" "}
          <em>SMTP-kommandoene</em> er to forskjellige ting. Selve e-postmeldingen har sin egen
          header med From- og Subject-linjer, deretter en blank linje og så kroppen — og de linjene
          er noe helt annet enn SMTP-kommandoene som sier hvem meldingen er fra og til. Formatet er
          definert i sin egen RFC, omtrent slik HTML definerer hvordan et webdokument ser ut.
        </p>
        <p>
          Alt over handler om å <em>dytte</em> meldingen fram til destinasjonsserveren. Å{" "}
          <em>hente</em> den derfra er en annen jobb, med sin egen protokoll:{" "}
          <strong>IMAP</strong> er den mest utbredte. Og man kan naturligvis også hente e-post over{" "}
          <strong>HTTP</strong> fra en webserver som er satt opp for det — det er webmail.
        </p>
      </LectureNote>


      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            {
              term: "SMTP",
              icon: <SmtpServerIcon />,
              body: "Server→server-protokoll for å levere mail (port 25/587).",
            },
            {
              term: "IMAP / POP3",
              icon: <ImapMailboxIcon />,
              body: "Klient henter sin egen postkasse fra serveren.",
            },
            {
              term: "MIME",
              icon: <MimeAttachmentIcon />,
              body: "Pakker vedlegg/bilder/HTML inn i ASCII (Base64).",
            },
            {
              term: "BitTorrent",
              icon: <SwarmIcon />,
              body: "P2P-fildeling: fil i biter, alle deler med alle.",
            },
            {
              term: "Tit-for-tat",
              icon: <ExchangeIcon />,
              body: "Send mest til dem som sender mest til deg.",
            },
            {
              term: "DHT (Kademlia)",
              icon: <DhtRingIcon />,
              body: "Distribuert peer-katalog uten sentral tracker.",
            },
            {
              term: "SMTP-handshake",
              icon: <HandshakeLinesIcon />,
              body: "Klartekst-linjer: HELO, MAIL FROM, RCPT TO, DATA, ..",
            },
            {
              term: "Envelope vs header",
              icon: <EnvelopeHeaderIcon />,
              body: "Konvolutt (ruting) vs brev-innhold (From:-feltet).",
            },
            {
              term: "SPF / DKIM / DMARC",
              icon: <SpfDmarcIcon />,
              body: "DNS-baserte signaturer som avslører forfalskning.",
            },
            {
              term: "Biter og blocks",
              icon: <ChunkPieceIcon />,
              body: "Bit = 256 kB med SHA-hash; blokk = 16 kB som sendes.",
            },
            {
              term: "Rarest-first",
              icon: <RarestFirstIcon />,
              body: "Last ned det færrest har — sprer risiko.",
            },
            {
              term: "Tracker vs DHT",
              icon: <TrackerListIcon />,
              body: "Sentral peer-liste vs distribuert via magnet-lenker.",
            },
            {
              term: "Choking",
              icon: <ChokingIcon />,
              body: "Stopper å sende til dem som ikke gir tilbake; unchoker periodisk.",
            },
          ]}
        />
        <Illustration caption="BitTorrent-swarm: ingen sentral server, alle utveksler biter med alle.">
          <BitTorrentSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="SMTP = postkontor-stafett, IMAP = postkasse-besøk">
          <p>
            Du legger et brev i din lokale postkasse (din SMTP-server). Et postbud frakter det til
            mottakerens postkontor (SMTP server→server). Det <em>ligger</em> der til mottakeren selv
            kommer innom for å hente — dét er IMAP. Postbudet ringer ikke på døra hennes;
            postkontoret er åpent og hun bestemmer når hun vil komme. Derfor må postkontoret være
            alltid-på; hennes laptop trenger ikke være det.
          </p>
        </Metafor>
        <Metafor tittel="BitTorrent = potluck-middag der maten skal vokse">
          <p>
            10 personer møtes til middag. Bare én har laget mat. Hvis han skulle dele med 9, må han
            mate hver i tur — det tar 9 porsjoner-tid. <em>Trikset</em>: så snart en gjest har fått
            en bit, kan <em>hun</em> dele den biten videre til de andre mens kokken serverer noe
            annet. Etter første runde har alle litt av alt; etter andre runde har alle alt.
            Totalkapasiteten skalerer med antall gjester, ikke synker med dem.
          </p>
        </Metafor>
        <Metafor tittel="Tit-for-tat = byttehandel på loppemarkedet">
          <p>
            Du står med en gammel platespiller. Naboen din har et messing-stativ du vil ha. Du
            bytter. <em>Hver</em> peer i swarmen gjør dette kontinuerlig: «du sendte meg en bit jeg
            trengte, så jeg sender deg en jeg har». Hvis du bare står og stirrer uten å bytte
            (snylte), nedprioriteres du. Hvert 30. sekund prøver alle en
            <em> tilfeldig fremmed</em> for å gi nykommere sjansen — det er optimistic unchoke.
          </p>
        </Metafor>
        <Metafor tittel="Rarest-first = redde de utrydningstruede dyrene først">
          <p>
            Bibliotekaren har 100 bøker, hver med 100 eksemplar — bortsett fra ett som finnes i kun
            ett eksemplar. Hvis bibliotekaren tar permisjon i morgen, hvilket eksemplar bør
            <em> du</em> låne først? Det sjeldne. Hvis du venter til neste uke kan det være
            forsvunnet. Rarest-first sikrer at swarmen aldri mister en bit fordi den ene seederen
            logget av.
          </p>
        </Metafor>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Illustration caption="Mail-flyt: avsender → SMTP submission → mottakerens SMTP → IMAP-postkasse → klient.">
          <MailFlowSvg />
        </Illustration>
        <Illustration caption="Tit-for-tat over tid: peer som ikke deler nedprioriteres, choked etter 30 s.">
          <TitForTatSvg />
        </Illustration>
      </div>

      <Illustration caption="Klient-server (nrk.no, Oslo) vs P2P-swarm (BitTorrent) — to konkrete norske topologier ved siden av hverandre.">
        <ArchComparisonVisualSvg />
      </Illustration>

      <Illustration caption="Swarm-snapshot: hvilke biter har hver peer, og hvilken bør P4 hente først (rarest-first)?">
        <P2PSwarmSnapshotSvg />
      </Illustration>

      <Example title="Eksempel: server vs P2P for å distribuere en 10 GB fil til 1000 brukere">
        <p>Server har 100 Mbps opplastings-kapasitet. Hver bruker har 50 Mbps ned og 5 Mbps opp.</p>
        <ul className="list-disc pl-5 mt-1">
          <li>
            <strong>Klient-server:</strong> Serveren må sende 10 GB × 1000 = 10 TB. Ved 100 Mbps =
            12.5 MB/s tar det 10·10¹² / 12.5·10⁶ = 800 000 sekunder ≈ 9.3 dager. Brukerens
            ned-kapasitet er irrelevant — flaskehalsen er server-opplasting.
          </li>
          <li>
            <strong>BitTorrent:</strong> Total opplastings-kapasitet i swarmen er server (100) +
            1000 × 5 = 5100 Mbps. Vi må fortsatt levere 10 TB totalt, men nå har vi 5100 Mbps å
            spille på: 10·10¹³ / 5100·10⁶ ≈ 15 700 sekunder ≈ 4.4 timer. 50× raskere, og det
            skalerer videre når flere brukere kommer.
          </li>
        </ul>
      </Example>

      <Example title="Eksempel: en SMTP-samtale linje for linje">
        <p>
          Mail-server smtp.send.no leverer en melding til mail.mottak.no. Klienten linjer er hvit,
          serverens er grå.
        </p>
        <pre className="text-[12px] font-mono whitespace-pre-wrap bg-background border border-border rounded p-2">{`S: 220 mail.mottak.no ESMTP klar
C: EHLO smtp.send.no
S: 250-mail.mottak.no
S: 250-STARTTLS
S: 250 SIZE 52428800
C: STARTTLS
S: 220 Klar for TLS-handshake
... (TLS-handshake) ...
C: MAIL FROM:<ola@send.no>
S: 250 OK
C: RCPT TO:<kari@mottak.no>
S: 250 OK
C: DATA
S: 354 Send melding, avslutt med "."
C: From: Ola <ola@send.no>
C: To: Kari <kari@mottak.no>
C: Subject: Hei
C:
C: Hei Kari, hvordan går det?
C: .
S: 250 OK id=4D2af1
C: QUIT
S: 221 Ha det`}</pre>
        <p className="mt-2 text-muted-foreground">
          Merk: avsender-adressen i MAIL FROM (envelope) trenger ikke matche From:-headeren i DATA.
          Det er denne diskrepansen SPF og DKIM hjelper med å oppdage.
        </p>
      </Example>

      <Example title="Eksempel: rarest-first i en liten swarm">
        <p>En film deles i 100 biter. Det er 10 peers i swarmen. Bit-distribusjon nå:</p>
        <ul className="list-disc pl-5 mt-1">
          <li>Bit 1–80: alle 10 peers har dem (vanlige)</li>
          <li>Bit 81–95: 3 peers har dem (middels sjeldne)</li>
          <li>Bit 96–99: 1 peer har dem (sjeldne)</li>
          <li>Bit 100: bare seederen (kritisk)</li>
        </ul>
        <p className="mt-2">
          Din klient kjenner ingen biter ennå. Rarest-first sier: ikke ta bit 1. Ta bit 100 først,
          så 96–99, så 81–95, så de vanlige til slutt. Hvis seederen forsvinner mens du har bit 100,
          har swarmen fortsatt en kopi (din) — uten rarest-first ville bit 100 kanskje gått tapt
          fordi alle prøvde å hamstre bit 1 først.
        </p>
        <p className="mt-2 text-muted-foreground">
          Effekten er at biters tilgjengelighet jevner seg ut over tid — robusthet uten sentral
          koordinering.
        </p>
      </Example>

      <Hvorfor title="Hvorfor skiller man henting (IMAP) og sending (SMTP)?">
        <p>Det virker naturlig å ha én mail-protokoll: «send og motta». Hvorfor to?</p>
        <p>
          Fordi de løser forskjellige problemer med forskjellige tilgjengelighets-krav. Mottakerens
          server <em>må</em> kjøre alltid for at andre sine SMTP-servere skal kunne levere til den
          når som helst. Avsenderens klient (mobilen din, laptopen) er som regel av eller frakoblet
          — den kan ikke ta imot push fra andre, og mister mail hvis det er den eneste adressen som
          var DNS-registrert.
        </p>
        <p>
          Løsningen er en mailbox-server som alltid kjører (mottar via SMTP), pluss en
          klient-protokoll (IMAP/POP3) som klienten bruker for å hente når <em>den</em> velger. SMTP
          er servere-snakker-til-servere; IMAP er klient-snakker-til-sin-egen-server. Begge deler
          trengs fordi internett består av blandinger av alltid-på-servere og av-og-til-på-klienter.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={[]} />
    </article>
  );
}

// ============================================================
// 2.5 — Video-streaming og CDN
// ============================================================
function Section25() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="2.5" title="Video-streaming og CDN-er" />

      <p className="text-muted-foreground">
        Mer enn halvparten av all internett-trafikk i 2026 er video. Hvordan får Netflix, YouTube og
        NRK til å levere HD-strøm til titalls millioner samtidig, fra servere ofte tusenvis av
        kilometer unna? Svaret er to teknikker: adaptiv bitrate (DASH) og innholds-distribusjon
        (CDN).
      </p>

      <Section25Live />

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            {
              term: "DASH",
              icon: <BitrateLadderIcon />,
              body: "Flere bitrate-versjoner; klient velger kvalitet per segment.",
            },
            {
              term: "Manifest",
              icon: <ManifestIcon />,
              body: "Liste over hvilke bitrater og segmenter som finnes.",
            },
            {
              term: "CDN",
              icon: <CdnGlobeIcon />,
              body: "Kant-servere nær brukeren — innhold kopieres ut.",
            },
            {
              term: "Hvorfor CDN funker",
              icon: <CdnWhyIcon />,
              body: "Kortere RTT, mindre origin-trafikk, raskere TCP-vekst.",
            },
            {
              term: "DNS-mapping",
              icon: <DnsMapIcon />,
              body: "CDN-DNS svarer med nærmeste edge basert på resolver-IP.",
            },
            {
              term: "Cache-hierarki",
              icon: <CacheLayerIcon />,
              body: "Edge → regional → origin; 99 %+ stoppes på edge.",
            },
            {
              term: "Segment-lengde",
              icon: <TtlClockIcon />,
              body: "2 s = raskt bytte, 10 s = mindre overhead.",
            },
            {
              term: "Buffer-fyll",
              icon: <BufferBarIcon />,
              body: "Stor buffer = trygt; lav buffer = panikk-bytte ned.",
            },
            {
              term: "Origin shield",
              icon: <OriginShieldIcon />,
              body: "Ekstra cache-lag — beskytter origin mot thundering herd.",
            },
            {
              term: "Cache-warming",
              icon: <CacheWarmIcon />,
              body: "Pre-populer edge før storserie-slipp.",
            },
            {
              term: "Live-distribusjon",
              icon: <LiveBroadcastIcon />,
              body: "Encode → ingest → regional → edge i nær sann-tid.",
            },
            {
              term: "Codec-valg",
              icon: <CodecChipIcon />,
              body: "H.264 universell, H.265/AV1 sparer båndbredde.",
            },
            {
              term: "Anycast",
              icon: <AnycastIcon />,
              body: "Samme IP fra mange steder; BGP velger nærmeste automatisk.",
            },
          ]}
        />
        <Illustration caption="CDN-arkitektur: bruker går til lokal edge, edge spør regional, regional eventuelt origin.">
          <CdnSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="CDN = Spotify har lokal-lager i hver by">
          <p>
            Tenk om all musikk i verden bare lå på én stor harddisk i San Francisco. Hver gang du
            trykker «spill» måtte signalet over Atlanteren, gjennom 30 rutere, og tilbake. Det ville
            knirke. CDN-er løser det ved å plassere <em>en miniatyr-disk i hver større by</em>:
            Tromsø-disken har det Tromsø-folk hører på, Oslo-disken har det Oslo-folk hører på. Når
            du trykker «spill» går spørringen 50 km, ikke 8000.
          </p>
        </Metafor>
        <Metafor tittel="DASH = vegg-monteringen som tilpasser tunge bilder underveis">
          <p>
            Du henger 30 bilder på rekke. Hvis veggen knirker av vekt, slipper du de tunge rammene
            og bruker letteversjoner — bildet er der, bare i lavere kvalitet. Når veggen føles solid
            igjen, henger du tilbake de tunge. Slik gjør DASH-klienten: hvert segment kan være 240p
            eller 1080p eller 4K. Den velger basert på <em>hvor solid bufferen føles</em>, ikke
            etter en forhåndsbestemt plan.
          </p>
        </Metafor>
        <Metafor tittel="Cache-warming = bygge isbarrieren før vinteren kommer">
          <p>
            Når kraftselskapet vet det blir snøstorm i morgen, kjører de generatorene varme i kveld.
            Når Netflix vet at <em>siste episode av populærserien</em> slippes kl. 09:00 i morgen,
            sender de filen ut til alle edge-servere klokken 03:00 om natten. Hvis de ikke gjorde
            det, ville alle de første 100 000 seerne treffe en cache-miss samtidig — hver eneste
            edge ville rope etter origin på én gang, og origin ville bli knust av en «thundering
            herd».
          </p>
        </Metafor>
        <Metafor tittel="Anycast = nødnummeret 113 finner nærmeste sykehus automatisk">
          <p>
            Du ringer 113 fra Tromsø. Du blir ikke koblet til <em>landets eneste 113-sentral</em>—
            du blir koblet til Tromsøs lokalsentral. Ringer du fra Oslo, går samtalen til Oslos.
            Samme nummer, mange svarende. BGP anycast funker likt: Cloudflare annonserer IP 1.1.1.1
            fra hundrevis av byer; rutingen sender deg automatisk til den nærmeste, uten DNS-magi.
          </p>
        </Metafor>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Illustration caption="DASH-bitrate-bytting: klienten bytter trinn basert på buffer-fyll og målt throughput.">
          <DashBitrateSvg />
        </Illustration>
        <Illustration caption="Cache-warming vs «thundering herd»: pre-pushe innhold før etterspørselen starter.">
          <CacheWarmingSvg />
        </Illustration>
      </div>

      <Illustration caption="CDN-edge-noder i norske byer: origin i Dublin, edges i Tromsø/Bodø/Trondheim/Bergen/Stavanger/Kristiansand/Oslo serverer lokale brukere.">
        <CdnNorgeKartSvg />
      </Illustration>

      <Example title="Eksempel: DASH-klient som tilpasser seg en flaskehals">
        <p>
          En klient ser en film delt i 4-sekunders segmenter. Tilgjengelige kvaliteter: 720p (3
          Mbps), 480p (1.5 Mbps), 360p (0.8 Mbps). Buffer-størrelse er 20 sekunder.
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>
            t = 0–60 s: WiFi gir 8 Mbps. Klienten velger 720p. Hvert 4-sekund-segment er ~1.5 MB,
            laster ned på ~1.5 s. Buffer fylles raskt.
          </li>
          <li>
            t = 60 s: brukeren går inn i kjelleren, throughput faller til 1 Mbps. Klienten har 20 s
            i buffer. Et 720p-segment (1.5 MB) ville nå ta 12 s å laste ned — det rekker, men knapt.
          </li>
          <li>
            t = 64 s: klienten merker at buffer-en synker og bytter til 480p. Et segment (0.75 MB)
            laster på 6 s — buffer-en stabiliserer seg.
          </li>
          <li>
            t = 90 s: kjelleren slutter, throughput hopper tilbake til 6 Mbps. Klienten venter et
            par segmenter på å være sikker, så hopper tilbake til 720p.
          </li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Alt dette skjer uten brukerinteraksjon. ABR-algoritmen (Adaptive Bit Rate) er hjertet i
          enhver moderne videoplayer.
        </p>
      </Example>

      <Example title="Eksempel: hvor mye sparer en CDN på en lansering?">
        <p>
          En storserie-finale på 8 GB skal sees av 500 000 nordmenn samtidig kl. 21:00. Origin
          ligger i Dublin. Vi sammenligner uten og med CDN.
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>
            <strong>Uten CDN:</strong> 500 000 × 8 GB = 4 PB trafikk gjennom trans-EU-lenkene fra
            Dublin. Også 500 000 samtidige TLS-handshakes mot ett datasenter. Praktisk umulig.
          </li>
          <li>
            <strong>Med CDN, edge i Tromsø/Oslo/Bergen/Trondheim:</strong> innholdet pre-warmet kl.
            02:00, så origin må levere ~8 GB × 4 edges = 32 GB samme natt. Kl. 21:00 går alle
            forespørsler til lokal edge — trafikken er fortsatt 4 PB lokalt, men aldri over
            trans-EU. Trafikken som passerer dyre lenker er redusert med faktor 125 000×.
          </li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Det er denne størrelses-ordens-forskjellen som gjør at en storserie kan slippes globalt
          uten å bryte internett.
        </p>
      </Example>

      <Example title="Eksempel: DNS-omdirigering velger edge">
        <p>En bruker i Tromsø skriver inn video.eksempel.no:</p>
        <pre className="text-[12px] font-mono whitespace-pre-wrap bg-background border border-border rounded p-2">{`video.eksempel.no.  CNAME  video.eksempel.cdn-leverandor.net.

cdn-leverandor sin autoritative DNS ser at spørringen
kommer fra resolver med IP 158.39.0.10 (UiT i Tromsø) og svarer:

video.eksempel.cdn-leverandor.net.  60  IN  A  10.20.30.40
                                                ↑
                                    IP-en til Tromsø-edge`}</pre>
        <p className="mt-2">
          Samme spørring fra en Oslo-resolver ville fått en annen IP. Lav TTL (60 s) sørger for at
          om edge-en blir nedlastet i kveld, kan klienter byttes til Trondheim raskt. CNAME-en gjør
          at kunden kan bytte CDN-leverandør uten å endre noe i selve eksempel.no sin DNS.
        </p>
      </Example>

      <Hvorfor title="Hvorfor er DASH bygget på HTTP i stedet for en spesial-protokoll?">
        <p>
          De første streaming-protokollene (RTSP, RTMP) brukte ofte UDP eller egne TCP-baserte
          protokoller. De var teknisk elegante — men i praksis tapte de mot DASH/HLS, som «bare» er
          en serie GET-er. Hvorfor?
        </p>
        <p>
          Fordi HTTP-økosystemet allerede hadde løst alt det vanskelige:{" "}
          <strong>caching (CDN-er)</strong> som fjerner det meste av trafikken fra origin;{" "}
          <strong>brannmurer slipper port 443</strong> uten konfigurasjon på hvert nettverk;{" "}
          <strong>HTTPS</strong>
          gir kryptering gratis; <strong>HTTP/2-multipleksing</strong> reduserer overhead. En
          spesial-protokoll måtte bygd alt dette fra null og krevet at hvert nettverk i verden åpnet
          en ny port.
        </p>
        <p>
          Konklusjonen er en gjentakende lærdom: når en lavnivå-løsning er teknisk overlegen men en
          høyere-nivå-løsning piggybacker på en stor, allerede-deployert infrastruktur, vinner
          piggyback-en. WebRTC vs SIP, gRPC vs egne RPC-protokoller, og DASH vs RTSP er alle
          eksempler.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={[]} />
    </article>
  );
}

// ============================================================
// 2.6 — Socket-programmering
// ============================================================
function Section26() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="2.6" title="Socket-programmering — bygg en app selv" />

      <p className="text-muted-foreground">
        Alt vi har snakket om over er protokoller andre har bygd. Når du skriver din egen
        nettverks-app åpner du en socket: et fil-deskriptor-lignende grensesnitt som lar deg sende
        og motta bytes over nettverket. Det er to typer som dekker ~99 % av all app-trafikk: TCP og
        UDP.
      </p>

      <Section26Live />

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            {
              term: "Socket",
              icon: <SocketPlugIcon />,
              body: "OS-handle for en endpoint: (proto, lokal IP+port, ekstern IP+port).",
            },
            {
              term: "TCP server-kall",
              icon: <TcpServerCallIcon />,
              body: "socket → bind → listen → accept-loop.",
            },
            {
              term: "TCP klient-kall",
              icon: <TcpClientCallIcon />,
              body: "socket → connect → send/recv → close.",
            },
            {
              term: "UDP-socket",
              icon: <UdpPacketIcon />,
              body: "socket → bind → sendto / recvfrom; ingen forbindelse.",
            },
            {
              term: "Stream vs datagram",
              icon: <StreamRiverIcon />,
              body: "TCP = bytestrøm uten grenser, UDP = atomiske pakker.",
            },
            {
              term: "Blocking vs non-blocking",
              icon: <BlockingIcon />,
              body: "Vent passivt vs spør «er det noe?» og fortsett.",
            },
            {
              term: "send() returnerer mindre",
              icon: <PartialBufferIcon />,
              body: "Kernel-buffer full → du må loope resten selv.",
            },
            {
              term: "SO_REUSEADDR",
              icon: <PortReuseIcon />,
              body: "Ta porten selv om forrige forbindelse er i TIME_WAIT.",
            },
            {
              term: "Nagle / TCP_NODELAY",
              icon: <NagleIcon />,
              body: "Samler små send-er; skru av for chat/spill.",
            },
            {
              term: "epoll / kqueue",
              icon: <EpollPanelIcon />,
              body: "Vent på 10 000 sockets fra én tråd, O(1).",
            },
            {
              term: "MTU",
              icon: <MtuRulerIcon />,
              body: "Største pakke uten fragmentering (Ethernet 1500 byte).",
            },
            {
              term: "Raw socket",
              icon: <RawIpIcon />,
              body: "Sende egne IP-pakker; brukes av ping, traceroute.",
            },
          ]}
        />
        <Illustration caption="TCP-server-loop: accept() lager en ny socket per klient, det opprinnelige fortsetter å lytte.">
          <SocketLoopSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="Socket = telefonen din">
          <p>
            <strong>socket()</strong> = du går ut og kjøper et apparat.
            <strong> bind()</strong> = du registrerer et fast telefonnummer på det.
            <strong> listen()</strong> = du slår på «ta-imot-anrop». <strong>accept()</strong> = du
            svarer når noen ringer, og får en <em>dedikert linje</em> til akkurat den samtalen. Den
            opprinnelige telefonen ringer videre — andre kan ringe inn samtidig. På klient-siden er
            det enklere: <strong>connect()</strong> = du slår nummeret hennes.
          </p>
        </Metafor>
        <Metafor tittel="TCP-stream vs UDP-datagram = elv vs brevpost">
          <p>
            TCP er som en kontinuerlig elv: du kan helle inn vann (bytes) i mange omganger, men
            mottakeren ser bare ett vann-flom. Du må selv legge inn flaske-korker (lengde-prefiks
            eller skille-tegn) hvis du vil at de skal kunne hente ut akkurat din portion. UDP er som
            å sende brev: hvert brev er et separat hele — det kommer fram intakt, eller ikke i det
            hele tatt. Du kan aldri «få et halvt brev».
          </p>
        </Metafor>
        <Metafor tittel="send()-loop = mate brev gjennom et fullt slissehull">
          <p>
            Du har en stabel med 1000 ark og en postkasse-slisse. Du dytter alle ned — men slissen
            er trang og bare 600 går gjennom før den er proppfull. Du må vente til postbudet tømmer
            kassen, og dytte de resterende 400 senere. <code>send()</code>
            -funksjonen returnerer hvor mange ark som faktisk gikk gjennom; <em>du må selv</em>
            sende resten i flere kall (eller bruke <code>sendall()</code> som looper for deg).
          </p>
        </Metafor>
        <Metafor tittel="epoll = én resepsjonist med 10 000 ringeklokker">
          <p>
            Tråd-per-klient er som å ha 10 000 ansatte som hver sitter ved sin egen ringeklokke og
            kjeder seg 99 % av tiden. epoll/kqueue gir deg <em>én</em>
            resepsjonist med et stort kontrollpanel: når en ringeklokke gnistrer, lyser et lite lys,
            og resepsjonisten går bort til <em>den</em> klokken. Når det er stille er det stille for
            alle. Dette er C10k-løsningen — fundamentet i Nginx og Node.js.
          </p>
        </Metafor>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Illustration caption="TCP-tilstandsmaskin sett fra app-siden: hvilke kall fører til hvilke tilstander.">
          <SocketStateSvg />
        </Illustration>
        <Illustration caption="Tråd-per-klient vs epoll/asyncio: hvor minne og CPU går når du skalerer til 10 k.">
          <ThreadVsEpollSvg />
        </Illustration>
      </div>

      <Illustration caption="Socket-flytdiagram: server- og klient-side ved siden av hverandre — kallene som tar deg fra én tilstand til neste.">
        <SocketStateFlowSvg />
      </Illustration>

      <Example title="Eksempel: et ørlite ekko-server-skjelett i Python (TCP)">
        <pre className="text-[12px] font-mono whitespace-pre-wrap bg-background border border-border rounded p-2">{`import socket

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind(("0.0.0.0", 9000))
s.listen(8)
print("Lytter på port 9000 …")

while True:
    conn, addr = s.accept()         # blokkerer til en klient kommer
    print(f"Klient {addr} koblet på")
    while True:
        data = conn.recv(4096)
        if not data:
            break                   # klient lukket
        conn.sendall(data)          # ekko tilbake
    conn.close()`}</pre>
        <p className="mt-2 text-muted-foreground">
          Dette er serielt — én klient om gangen. For å håndtere flere samtidige klienter ville du
          enten startet en tråd per accept(), eller (mye bedre) brukt asyncio. En UDP-server ville
          erstattet accept-løkken med en evig recvfrom/sendto-løkke fordi det ikke er noen
          forbindelses-state å spore.
        </p>
      </Example>

      <Example title="Eksempel: en UDP-klokke-tjeneste i 12 linjer">
        <p>
          En liten server som svarer hvilken som helst klient med klokkeslettet ved hver
          forespørsel. UDP er perfekt: én pakke inn, én pakke ut, ingen state.
        </p>
        <pre className="text-[12px] font-mono whitespace-pre-wrap bg-background border border-border rounded p-2">{`import socket, time

s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.bind(("0.0.0.0", 7777))
print("Klokke-tjeneste lytter på UDP 7777")

while True:
    data, addr = s.recvfrom(64)
    if data.startswith(b"TID?"):
        svar = time.strftime("%H:%M:%S").encode()
        s.sendto(svar, addr)`}</pre>
        <p className="mt-2">
          En klient kjører <code>echo 'TID?' | nc -u -w1 host 7777</code> og får for eksempel
          <code>14:23:07</code> tilbake. Ingen handshake, ingen koblings-state, ingen avhengighet av
          at klienten lukker fint. Serveren kan kjøre i årevis uten å holde noe i minnet utover den
          ene socketen.
        </p>
      </Example>

      <Example title="Eksempel: hvorfor send() returnerer mindre enn buffer-størrelsen">
        <p>En klient prøver å sende 1 MB i ett kall:</p>
        <pre className="text-[12px] font-mono whitespace-pre-wrap bg-background border border-border rounded p-2">{`buf = b"x" * 1_000_000
sent = s.send(buf)    # → 65536 ?!`}</pre>
        <p className="mt-2">
          send() leverer ikke til mottakeren — den legger i kernelens utgangs-buffer. Hvis bufferen
          har 64 kB ledig, returnerer kallet 64 kB; appen må sende resten i flere kall etter hvert
          som mottakeren ACK-er og bufferen tømmes. Riktig mønster:
        </p>
        <pre className="text-[12px] font-mono whitespace-pre-wrap bg-background border border-border rounded p-2">{`sent_total = 0
while sent_total < len(buf):
    n = s.send(buf[sent_total:])
    if n == 0:
        raise ConnectionError("forbindelsen lukket")
    sent_total += n
# eller bare bruk s.sendall(buf) som looper for deg`}</pre>
        <p className="mt-2 text-muted-foreground">
          recv() har det motsatte problemet: den kan returnere mindre enn forespurt selv om mer data
          er på vei. Du må selv loope til du har det du venter — typisk med en lengde-prefiks-header
          eller en avgrenser-byte.
        </p>
      </Example>

      <Hvorfor title="Hvorfor er TCP en bytestrøm og ikke et meldings-grensesnitt?">
        <p>
          UDP gir deg meldinger: ett sendto = ett recvfrom. TCP smelter sammen alt du sender til én
          lang sekvens av bytes — to send(100) på serversiden kan dukke opp som ett recv(200) hos
          klienten. Hvorfor designet de det slik?
        </p>
        <p>
          Fordi TCP ble bygget i en tid der pålitelig levering av en strøm (filer, terminaler) var
          det viktige bruksområdet — og det er <em>mye</em> billigere å transportere en bytestrøm
          enn å bevare meldings-grenser. TCP samler bytes i segmenter på størrelse med MTU og sender
          dem ut etter optimaliserte algoritmer (Nagle, Cork). Hvis det måtte bevare hvert enkelt
          send() som et atomisk «meldings-pakke», ville mange små send-kall blitt mange små
          ineffektive pakker.
        </p>
        <p>
          Konsekvensen er at applikasjoner over TCP <strong>må</strong> definere egen rammingsregel
          — for eksempel «4-byte lengde-prefiks, så meldingen», eller «meldingen slutter ved \n».
          HTTP gjør det ved å lese linjer til en tom linje, så Content-Length bytes. Det er ekstra
          arbeid for appen, men gevinsten er at TCP-laget aldri må bekymre seg for hva en «melding»
          er — og det er en del av hvorfor TCP er så stabilt og allestedsnærværende.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-socket-programmering"]} />
    </article>
  );
}

// ============================================================
// 2.7 — Oppgaver
// ============================================================
function Section27() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="2.7" title="Oppgaver" />
      <p className="text-muted-foreground">
        Regne-oppgaver og scenario-oppgaver. Prøv å løse hver oppgave på papir før du klikker «Vis
        svar».
      </p>

      <Exercise
        question="En webside består av 1 HTML + 20 ressurser (alle på samme server). RTT er 50 ms. TCP-handshake er 1 RTT, TLS-handshake er 1 RTT, og hver request/response tar 1 RTT (vi neglisjerer transmisjons-tid). Hvor mange ms bruker (a) HTTP/1.1 med én seriell forbindelse, (b) HTTP/1.1 med 6 parallelle forbindelser, og (c) HTTP/2 over én forbindelse?"
        hint="Tell hver sekvensiell RTT. For (b) går de 20 ressursene i 6-parallelle bolker — hvor mange runder kreves?"
        answer={
          <>
            <p className="font-mono text-[12px]">
              (a) TCP + TLS + 21 requests = 2 RTT + 21 RTT = 23 RTT × 50 = 1150 ms
              <br />
              (b) 1 TCP + 1 TLS for HTML + 1 RTT HTML + (parallelt: 1 TCP + 1 TLS for hver bolk).
              <br />
              20 ressurser / 6 parallell ≈ ⌈20/6⌉ = 4 «runder». Forenklet: 2 (HTML setup) + 1 (HTML)
              + 2 (parallell setup) + 4 (request-runder) = 9 RTT = 450 ms
              <br />
              (c) 1 TCP + 1 TLS + 1 RTT HTML + 1 RTT alle 20 ressurser parallelt = 4 RTT = 200 ms
            </p>
            <p className="mt-1">
              HTTP/2 vinner stort på mange små ressurser fordi alt går i én forbindelse uten
              head-of-line-blocking på app-laget.
            </p>
          </>
        }
      />

      <Exercise
        question="En tjeneste har en autoritativ DNS-server som ser 200 spørringer/sekund med TTL = 300 s. Ledelsen vil sette TTL til 10 s for raskere failover. Hvor mange spørringer/sekund må den autoritative serveren klare etterpå, hvis vi antar at antallet unike resolvere som spør forblir det samme?"
        hint="TTL avgjør hvor ofte hver cache bommer. Lavere TTL = oftere bom = flere kall til autoritativ."
        answer={
          <>
            <p className="font-mono text-[12px]">
              Spørrings-frekvensen til autoritativ skalerer omtrent omvendt med TTL.
              <br />
              Faktor: 300 / 10 = 30
              <br />
              Ny rate: 200 × 30 = 6000 spørringer/s
            </p>
            <p className="mt-1">
              Trenger 30× kapasitet — typisk grunn til at folk lander på 60 s i stedet. Bonus: noen
              klienter (eldre stub-resolvere) ignorerer TTL-er under et minimum, så effekten kan bli
              mindre i praksis. Men du må dimensjonere for worst case.
            </p>
          </>
        }
      />

      <Exercise
        question="Du laster ned en 4 GB Linux-ISO. Via en sentral server med 200 Mbps opplastings-kapasitet (men du er alene som laster ned), tar det X minutter. Via BitTorrent med 50 andre seedere som har 10 Mbps opp hver og du har 100 Mbps ned, tar det Y minutter. Hva er X og Y, og hvilken vinner?"
        hint="Server-tilfellet: din ned-kapasitet eller serverens opp-kapasitet, det minste vinner. BitTorrent: din ned-kapasitet eller summen av seedernes opp-kapasitet, det minste vinner."
        answer={
          <>
            <p className="font-mono text-[12px]">
              Fil = 4 GB = 32 Gbit = 32 000 Mbit
              <br />
              Server: min(200, 100) = 100 Mbps. Tid = 32000/100 = 320 s ≈ 5.3 min
              <br />
              BitTorrent: sum opp = 50 × 10 = 500 Mbps; min(500, 100) = 100 Mbps. Tid = 320 s ≈ 5.3
              min
            </p>
            <p className="mt-1">
              Likt! Begge er begrenset av <em>din</em> ned-kapasitet på 100 Mbps. BitTorrent vinner
              først når serveren ville være flaskehalsen (mange samtidige nedlastere) — for én
              alene-nedlaster er det sjelden noen forskjell.
            </p>
          </>
        }
      />

      <Exercise
        question="En CDN-edge cache har 10 TB lagring. Innholdsbiblioteket er 500 TB totalt, men 95 % av forespørslene går til de 5 % mest populære filene (et typisk Zipf-aktig mønster). Forklar hvorfor edge-en likevel kan oppnå over 90 % cache-hit-rate, og estimer hvor stor andel av biblioteket en 10 TB cache faktisk holder."
        hint="10 TB av 500 TB er 2 %. Hvis 95 % av trafikken går til 5 %, hva ligger 2 % på?"
        answer={
          <>
            <p>
              10 TB / 500 TB = 2 % av biblioteket. Men disse 2 % er ikke tilfeldig valgt — LRU/LFU
              eller en aktiv ABR-politikk fyller cachen med det mest populære. Hvis 95 % av
              trafikken går til 5 % av filene, ligger antageligvis 80–90 % av trafikken på de 2 %
              mest populære som faktisk er i cachen.
            </p>
            <p className="mt-1 font-mono text-[12px]">Cache-hit-rate ≈ 80–90 % er realistisk</p>
            <p className="mt-1">
              Det er denne ekstreme skjevheten i populariteten som gjør CDN-er økonomisk
              meningsfulle — du trenger ikke kopiere hele biblioteket til kanten, bare hodet av
              halen.
            </p>
          </>
        }
      />

      <Exercise
        question="En UDP-basert spillklient sender en posisjons-oppdatering hvert 16. ms (60 Hz) på 80 bytes. En TCP-basert variant ville sende samme data men med 32 bytes ekstra TCP+TLS-overhead per pakke pluss retransmisjon ved tap. Hvis pakketap-raten er 2 %, hvor mye båndbredde sparer UDP per spiller, og hvorfor ville TCP-versjonen faktisk fungere dårligere selv om den fjerner tap?"
        hint="Båndbredde først: hvor mange bytes/sekund med og uten overhead? Spill-aspektet: hva er problemet med en re-sendt posisjon som er 50 ms gammel?"
        answer={
          <>
            <p className="font-mono text-[12px]">
              UDP: 60 × 80 = 4 800 B/s = 38.4 kbps
              <br />
              TCP: 60 × (80+32) = 6 720 B/s = 53.8 kbps, pluss ~2 % retransmisjon ≈ 55 kbps
              <br />
              Besparelse: ~16 kbps per spiller, eller ~30 %
            </p>
            <p className="mt-1">
              Men det viktigere problemet er head-of-line: i TCP venter spillet på den tapte pakken
              før etterfølgende oppdateringer leveres til app-laget. Spilleren får et hakk på 50–100
              ms hver gang det skjer. I UDP-versjonen er den tapte pakken irrelevant — neste
              posisjons-oppdatering kommer om 16 ms uansett, og den er ferskere data enn det som ble
              tapt. Derfor bruker FPS- og racing-spill UDP nesten universelt.
            </p>
          </>
        }
      />

      <Exercise
        question="Du har et lokalt nettverk på 100 datamaskiner som alle slår opp DNS-navn fra én lokal resolver. Hver maskin slår opp gjennomsnittlig 50 unike navn per dag, med 80 % overlapp mellom maskinene (Google, GitHub, Slack, etc.). Hvor mange autoritative DNS-spørringer går det fra resolveren per dag — (a) uten cache, (b) med cache der hver A-record har TTL 1 time og navnene slås opp jevnt over døgnet?"
        hint="(a) Sum alle oppslag uten dedup. (b) Cache betyr at hver unik navn maks slås opp 24 ganger per døgn — én gang per time."
        answer={
          <>
            <p className="font-mono text-[12px]">
              Totale oppslag per dag: 100 × 50 = 5000.
              <br />
              Unike navn: 50 × (1 − 0.80 × (1 − 1/100)) ≈ 50 × (1 − 0.79) ≈ 10.5
              <br />
              Forenklet: 80 % overlapp betyr ~10 unike navn totalt per maskin sett over alle.
              <br />
              <br />
              (a) Uten cache: 5000 spørringer/dag direkte til autoritativ.
              <br />
              (b) Med cache: hver unik navn (~100 stk totalt i klyngen) maks 24 oppslag/dag = 2400.
              <br />
              <br />
              Reduksjon: 5000 / 2400 ≈ 2× — men hvis vi tar overlapp riktig (anta 200 unike navn på
              tvers): 200 × 24 = 4800. Marginal vinning ved 1-times TTL og lite overlapp.
            </p>
            <p className="mt-1">
              Lærdom: cache hjelper mest når TTL × oppslags-frekvens er stor. For sjeldne navn med
              kort TTL gjør cache lite forskjell — det er popularitets-fordelingen som avgjør.
            </p>
          </>
        }
      />

      <Exercise
        question="En HTTPS-tjeneste bruker TLS 1.3 med session resumption. Nye klienter bruker 1 RTT på TCP-handshake + 1 RTT på TLS = 2 RTT før første request. Gjentakende klienter bruker 0-RTT med tidlig data — request kan sendes i selve første pakke. Med 80 ms RTT og 60 % gjentakende klienter, hva er gjennomsnittlig setup-tid (før første byte ut) per session?"
        hint="Vekt 0-RTT-bruken med 0.60 og 2-RTT-bruken med 0.40."
        answer={
          <>
            <p className="font-mono text-[12px]">
              Nye: 2 × 80 ms = 160 ms
              <br />
              Gjentakende (0-RTT): 0 RTT setup (request går i samme pakke) — men responsen kommer
              etter 1 RTT uansett. Effektiv setup før request avleveres serveren = 0 ms.
              <br />
              <br />
              Vektet: 0.40 × 160 + 0.60 × 0 = 64 ms
            </p>
            <p className="mt-1">
              0-RTT er kontroversiell fordi den åpner for replay-angrep (en angriper kan re-sende
              den fanget 0-RTT-pakken og få samme effekt utført to ganger). Derfor tillates det bare
              for idempotente requests (GET, HEAD). Praktiske CDN-er bruker det for statiske
              ressurser; banker bruker det ikke.
            </p>
          </>
        }
      />

      <Exercise
        question="Forklar forskjellen mellom et HTTP-proxy (gammeldags web-cache i en bedrift) og et CDN, og skisser ett konkret scenario der proxy faktisk er bedre."
        hint="Proxy ligger nær brukeren og er ofte eid av brukerens organisasjon. CDN ligger nær brukeren men er eid av innholds-leverandøren. Hvem velger hva som caches?"
        answer={
          <>
            <p>
              Proxy: bedrifts-server som klientene bruker som mellom-ledd. Cacher det{" "}
              <em>bedriftens brukere</em> ber om — uavhengig av hvem som leverer innholdet. Kan
              filtrere og logge alt. CDN: leverandørens egne edge-servere som cacher leverandørens
              innhold uavhengig av hvem som henter det.
            </p>
            <p className="mt-1">
              Scenario der proxy vinner: en stor bedrift med 5000 ansatte som alle laster ned samme
              Linux-distro ISO. Distro-en kommer fra et nettsted uten CDN-tilstedeværelse i Norge.
              Proxy-en cacher ISO-en lokalt — 4999 nedlastinger går ikke ut av bedriftens LAN. Et
              CDN ville ikke hjulpet hvis leverandøren ikke betalte for plass i Norge.
            </p>
            <p className="mt-1 text-muted-foreground">
              I praksis er proxy-arkitekturer på vei ut fordi HTTPS gjør det vanskelig å cache uten
              MITM-sertifikater. CDN-er har vunnet for de fleste bruksområder.
            </p>
          </>
        }
      />

      <Exercise
        question="En BitTorrent-swarm har 1 seeder (har hele filen) og 9 nye peers (har ingenting). Filen er 10 GB delt i 1000 biter. Seederen har 100 Mbps opp, hver peer har 50 Mbps opp og 100 Mbps ned. Anta optimal koordinering. Hva er teoretisk minste tid for at alle 10 har hele filen? Sammenlign med klient-server der bare seederen leverer."
        hint="Klient-server: seederen må sende 10 GB × 9 = 90 GB ved 100 Mbps. BitTorrent: total opp-kapasitet er seederen + alle peers, men hver peer kan bare laste opp det den allerede har lastet ned."
        answer={
          <>
            <p className="font-mono text-[12px]">
              Fil = 10 GB = 80 Gbit = 80 000 Mbit.
              <br />
              <br />
              Klient-server (kun seeder leverer):
              <br />
              Total leveranse = 80 000 × 9 = 720 000 Mbit
              <br />
              Ved 100 Mbps opp = 7 200 s = 2 timer
              <br />
              <br />
              BitTorrent øvre grense (fra seeder alene):
              <br />
              Selv om seederen bare sender ut 80 000 Mbit én gang (1 kopi i swarmen), så replikeres
              videre av peers. Minste tid er filstørrelse / min(min_kapasitet, sum/N).
              <br />
              T ≥ 80 000 / 100 = 800 s (begrenset av hver peer sin nedlasting på 100 Mbps).
              <br />
              T ≥ 9 × 80 000 / (100 + 9 × 50) = 720 000 / 550 = 1309 s — fra opp-kapasitet
              <br />
              <br />
              Maks av disse: 1309 s ≈ 22 min
            </p>
            <p className="mt-1">
              5.5× raskere enn klient-server. I praksis litt tregere fordi peers ikke kan laste opp
              før de har lastet noe ned (oppstarts-fase), men formelen viser asymptoten.
            </p>
          </>
        }
      />

      <Exercise
        question="Du skriver en chat-app der serveren må håndtere 10 000 samtidige klient-forbindelser. Du vurderer tre arkitekturer: (a) tråd-per-klient, (b) prosess-per-klient, (c) én tråd med epoll/asyncio. Hver tråd bruker ~8 MB stack, hver prosess ~10 MB minne pluss kernel-overhead. Forklar hvilken som skalerer og hvorfor."
        hint="Regne minne først for (a) og (b). For (c), tenk på hvor mye kernel og app trenger per socket uten dedikert tråd."
        answer={
          <>
            <p className="font-mono text-[12px]">
              (a) Tråd-per-klient: 10 000 × 8 MB = 80 GB RAM. Også 10 000 trådbyttene under last —
              kontekst-switch-overhead dreper CPU. Ikke realistisk.
              <br />
              (b) Prosess-per-klient: 10 000 × 10 MB = 100 GB. I tillegg IPC for å koordinere.
              Verre.
              <br />
              (c) epoll/asyncio: én tråd, ~1–2 kB kernel state per socket (~20 MB totalt), pluss
              applikasjonens egne data-strukturer. 10 000 sockets på 100–200 MB RAM. Skala.
            </p>
            <p className="mt-1">
              Dette er kjent som C10k-problemet (Dan Kegel, 1999). Løsningen var event-drevne
              servere: Nginx, Node.js, Tornado, Twisted, asyncio i Python, tokio i Rust. Alle bygger
              på samme idé: ikke én tråd per klient — én tråd som vinker mellom mange sockets ved
              hjelp av en kernel-mekanisme som forteller hvilke som har noe nytt.
            </p>
          </>
        }
      />
    </article>
  );
}

// ============================================================
// Felles helpers
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
    <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-cyan-700 dark:text-cyan-400 font-semibold mb-1">
        Hvorfor er det sånn?
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
  if (slugs.length === 0) return null;
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

function ProcessSocketSvg() {
  return (
    <svg viewBox="0 0 500 200" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Prosess ↔ socket ↔ transport ↔ socket ↔ prosess
      </text>
      {/* Venstre host */}
      <rect
        x={20}
        y={40}
        width={150}
        height={140}
        rx={6}
        className="fill-card stroke-brand"
        strokeWidth={1.5}
      />
      <text x={95} y={56} textAnchor="middle" className="fill-brand text-[10px] font-semibold">
        host A
      </text>
      <rect
        x={40}
        y={70}
        width={110}
        height={36}
        rx={4}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1}
      />
      <text x={95} y={92} textAnchor="middle" className="fill-foreground text-[11px]">
        Klient-prosess
      </text>
      <rect
        x={55}
        y={120}
        width={80}
        height={26}
        rx={3}
        className="fill-success/20 stroke-success"
        strokeWidth={1}
      />
      <text x={95} y={137} textAnchor="middle" className="fill-foreground text-[10px]">
        socket
      </text>
      <text x={95} y={165} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        TCP/UDP
      </text>

      {/* Høyre host */}
      <rect
        x={330}
        y={40}
        width={150}
        height={140}
        rx={6}
        className="fill-card stroke-brand"
        strokeWidth={1.5}
      />
      <text x={405} y={56} textAnchor="middle" className="fill-brand text-[10px] font-semibold">
        host B
      </text>
      <rect
        x={350}
        y={70}
        width={110}
        height={36}
        rx={4}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1}
      />
      <text x={405} y={92} textAnchor="middle" className="fill-foreground text-[11px]">
        Server-prosess
      </text>
      <rect
        x={365}
        y={120}
        width={80}
        height={26}
        rx={3}
        className="fill-success/20 stroke-success"
        strokeWidth={1}
      />
      <text x={405} y={137} textAnchor="middle" className="fill-foreground text-[10px]">
        socket
      </text>
      <text x={405} y={165} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        TCP/UDP
      </text>

      {/* Mellom */}
      <line
        x1={135}
        y1={133}
        x2={365}
        y2={133}
        className="stroke-brand"
        strokeWidth={2}
        strokeDasharray="4 3"
      />
      <text x={250} y={127} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        nettverk
      </text>
      <polygon points="200,128 215,133 200,138" className="fill-brand" />
      <polygon points="300,128 285,133 300,138" className="fill-brand" />
    </svg>
  );
}

function HttpVersionsSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text x={20} y={18} className="fill-brand text-[11px] uppercase tracking-wider font-semibold">
        HTTP/1.1 seriell
      </text>
      <line x1={30} y1={40} x2={30} y2={100} className="stroke-foreground/60" strokeWidth={1.5} />
      <text x={20} y={45} textAnchor="end" className="fill-muted-foreground text-[9px]">
        klient
      </text>
      {[
        [30, 50, 240, 60, "GET html"],
        [240, 65, 30, 75, "200 html"],
        [30, 80, 240, 90, "GET img1"],
      ].map(([x1, y1, x2, y2, label], i) => (
        <g key={i}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-brand" strokeWidth={1.5} />
          <polygon
            points={`${x2},${y2} ${(x2 as number) - ((x2 as number) > (x1 as number) ? 6 : -6)},${(y2 as number) - 3} ${(x2 as number) - ((x2 as number) > (x1 as number) ? 6 : -6)},${(y2 as number) + 3}`}
            className="fill-brand"
          />
          <text
            x={((x1 as number) + (x2 as number)) / 2}
            y={((y1 as number) + (y2 as number)) / 2 - 2}
            textAnchor="middle"
            className="fill-muted-foreground text-[8px]"
          >
            {label}
          </text>
        </g>
      ))}
      <line x1={240} y1={40} x2={240} y2={100} className="stroke-foreground/60" strokeWidth={1.5} />
      <text x={250} y={45} className="fill-muted-foreground text-[9px]">
        server
      </text>
      <text x={20} y={115} className="fill-muted-foreground text-[9px] italic">
        … bilde 2, 3, … én etter én
      </text>

      <text
        x={20}
        y={140}
        className="fill-success text-[11px] uppercase tracking-wider font-semibold"
      >
        HTTP/2 multiplekset
      </text>
      <line x1={30} y1={155} x2={30} y2={210} className="stroke-foreground/60" strokeWidth={1.5} />
      <text x={20} y={160} textAnchor="end" className="fill-muted-foreground text-[9px]">
        klient
      </text>
      <line
        x1={240}
        y1={155}
        x2={240}
        y2={210}
        className="stroke-foreground/60"
        strokeWidth={1.5}
      />
      <text x={250} y={160} className="fill-muted-foreground text-[9px]">
        server
      </text>
      {[
        [165, "stream 1: html"],
        [175, "stream 2: img1"],
        [185, "stream 3: img2"],
        [195, "stream 4: img3"],
      ].map(([y, label], i) => (
        <g key={i}>
          <line
            x1={30}
            y1={y as number}
            x2={240}
            y2={y as number}
            className="stroke-success"
            strokeWidth={1}
          />
          <text
            x={135}
            y={(y as number) - 1}
            textAnchor="middle"
            className="fill-muted-foreground text-[8px]"
          >
            {label}
          </text>
        </g>
      ))}
      <text x={260} y={195} className="fill-muted-foreground text-[9px] italic">
        alle parallelt over én forbindelse
      </text>
    </svg>
  );
}

function DnsLookupSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        DNS-oppslag for www.uit.no — iterativt fra lokal resolver
      </text>
      {/* Klient */}
      <rect
        x={20}
        y={90}
        width={70}
        height={36}
        rx={4}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={55} y={112} textAnchor="middle" className="fill-foreground text-[10px]">
        klient
      </text>
      {/* Local resolver */}
      <rect
        x={120}
        y={90}
        width={90}
        height={36}
        rx={4}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={165} y={108} textAnchor="middle" className="fill-foreground text-[10px]">
        lokal
      </text>
      <text x={165} y={120} textAnchor="middle" className="fill-foreground text-[10px]">
        resolver
      </text>
      {/* Root */}
      <ellipse
        cx={300}
        cy={45}
        rx={50}
        ry={18}
        className="fill-success/15 stroke-success"
        strokeWidth={1.5}
      />
      <text x={300} y={49} textAnchor="middle" className="fill-foreground text-[10px]">
        root
      </text>
      {/* TLD */}
      <ellipse
        cx={420}
        cy={45}
        rx={50}
        ry={18}
        className="fill-success/15 stroke-success"
        strokeWidth={1.5}
      />
      <text x={420} y={49} textAnchor="middle" className="fill-foreground text-[10px]">
        .no TLD
      </text>
      {/* Auth */}
      <ellipse
        cx={420}
        cy={170}
        rx={60}
        ry={18}
        className="fill-success/15 stroke-success"
        strokeWidth={1.5}
      />
      <text x={420} y={174} textAnchor="middle" className="fill-foreground text-[10px]">
        ns1.uit.no
      </text>

      {/* Pile-pile */}
      <line x1={90} y1={108} x2={120} y2={108} className="stroke-foreground/60" strokeWidth={1.5} />
      <polygon points="120,108 114,105 114,111" className="fill-foreground/60" />
      <text x={105} y={102} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        1
      </text>

      <line x1={210} y1={100} x2={260} y2={55} className="stroke-foreground/60" strokeWidth={1.5} />
      <polygon points="260,55 254,57 257,62" className="fill-foreground/60" />
      <text x={230} y={70} className="fill-muted-foreground text-[8px]">
        2: hvem er .no?
      </text>

      <line
        x1={350}
        y1={55}
        x2={370}
        y2={50}
        className="stroke-foreground/60"
        strokeWidth={1.5}
        strokeDasharray="2 2"
      />
      <text x={360} y={36} className="fill-muted-foreground text-[8px]">
        3: spør .no
      </text>

      <line x1={420} y1={63} x2={420} y2={150} className="stroke-foreground/60" strokeWidth={1.5} />
      <polygon points="420,150 417,144 423,144" className="fill-foreground/60" />
      <text x={428} y={108} className="fill-muted-foreground text-[8px]">
        4: spør uit
      </text>

      <line
        x1={360}
        y1={170}
        x2={215}
        y2={120}
        className="stroke-success"
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      <polygon points="215,120 222,118 220,124" className="fill-success" />
      <text x={285} y={155} className="fill-success text-[8px]">
        5: A 129.242.16.214
      </text>

      <line
        x1={120}
        y1={120}
        x2={90}
        y2={120}
        className="stroke-success"
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      <polygon points="90,120 96,117 96,123" className="fill-success" />
      <text x={105} y={134} textAnchor="middle" className="fill-success text-[8px]">
        6
      </text>
    </svg>
  );
}

function BitTorrentSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        BitTorrent-swarm — alle deler biter med alle
      </text>
      {/* Peers i en sirkel */}
      {[
        [250, 50],
        [380, 90],
        [420, 180],
        [310, 200],
        [180, 200],
        [80, 180],
        [120, 90],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle
            cx={x}
            cy={y}
            r={16}
            className={
              i === 0 ? "fill-amber-500/30 stroke-amber-500" : "fill-brand/20 stroke-brand"
            }
            strokeWidth={2}
          />
          <text
            x={x}
            y={(y as number) + 3}
            textAnchor="middle"
            className="fill-foreground text-[9px] font-semibold"
          >
            P{i + 1}
          </text>
        </g>
      ))}
      {/* Linjer mellom alle (mesh) */}
      {(() => {
        const peers: [number, number][] = [
          [250, 50],
          [380, 90],
          [420, 180],
          [310, 200],
          [180, 200],
          [80, 180],
          [120, 90],
        ];
        const lines: React.ReactElement[] = [];
        for (let i = 0; i < peers.length; i++) {
          for (let j = i + 1; j < peers.length; j++) {
            lines.push(
              <line
                key={`${i}-${j}`}
                x1={peers[i][0]}
                y1={peers[i][1]}
                x2={peers[j][0]}
                y2={peers[j][1]}
                className="stroke-muted-foreground/30"
                strokeWidth={0.6}
              />,
            );
          }
        }
        return lines;
      })()}
      <text x={250} y={213} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        ingen sentral server — gul peer er nyest, sender og mottar samtidig
      </text>
    </svg>
  );
}

function CdnSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        CDN-cache-hierarki — origin et sted langt unna, edge nær deg
      </text>
      {/* Origin */}
      <rect
        x={210}
        y={40}
        width={80}
        height={30}
        rx={4}
        className="fill-success/20 stroke-success"
        strokeWidth={2}
      />
      <text
        x={250}
        y={59}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        origin
      </text>
      {/* Regional caches */}
      {[120, 250, 380].map((x, i) => (
        <g key={i}>
          <line
            x1={250}
            y1={70}
            x2={x}
            y2={105}
            className="stroke-muted-foreground/40"
            strokeWidth={1}
          />
          <rect
            x={x - 35}
            y={105}
            width={70}
            height={28}
            rx={4}
            className="fill-brand/15 stroke-brand/70"
            strokeWidth={1.5}
          />
          <text x={x} y={123} textAnchor="middle" className="fill-foreground text-[9px]">
            regional
          </text>
        </g>
      ))}
      {/* Edge */}
      {[40, 95, 175, 230, 290, 350, 410, 460].map((x, i) => {
        const parent = i < 3 ? 120 : i < 6 ? 250 : 380;
        return (
          <g key={i}>
            <line
              x1={parent}
              y1={133}
              x2={x}
              y2={160}
              className="stroke-muted-foreground/40"
              strokeWidth={1}
            />
            <rect
              x={x - 20}
              y={160}
              width={40}
              height={22}
              rx={3}
              className="fill-amber-500/15 stroke-amber-500/70"
              strokeWidth={1}
            />
            <text x={x} y={175} textAnchor="middle" className="fill-foreground text-[8px]">
              edge
            </text>
            <circle cx={x} cy={200} r={4} className="fill-amber-500" />
          </g>
        );
      })}
      <text x={250} y={215} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        bruker (gul prikk) henter fra nærmeste edge — 99 % cache-hit der
      </text>
    </svg>
  );
}

function SocketLoopSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        TCP-server: én lytte-socket, mange forbindelses-sockets
      </text>
      {/* Lytte-socket */}
      <rect
        x={30}
        y={50}
        width={120}
        height={50}
        rx={6}
        className="fill-brand/20 stroke-brand"
        strokeWidth={2}
      />
      <text x={90} y={70} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        lytte-socket
      </text>
      <text x={90} y={84} textAnchor="middle" className="fill-foreground text-[9px]">
        port 9000
      </text>
      <text x={90} y={96} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        accept()-loop
      </text>

      {/* accept-pile til 3 conn-sockets */}
      {[
        { y: 30, label: "klient 1" },
        { y: 110, label: "klient 2" },
        { y: 180, label: "klient 3" },
      ].map((c, i) => (
        <g key={i}>
          <line
            x1={150}
            y1={75}
            x2={290}
            y2={c.y + 15}
            className="stroke-brand/60"
            strokeWidth={1.5}
          />
          <polygon
            points={`290,${c.y + 15} 282,${c.y + 12} 282,${c.y + 18}`}
            className="fill-brand/60"
          />
          <rect
            x={290}
            y={c.y}
            width={120}
            height={30}
            rx={4}
            className="fill-success/20 stroke-success"
            strokeWidth={1.5}
          />
          <text x={350} y={c.y + 13} textAnchor="middle" className="fill-foreground text-[9px]">
            conn-socket
          </text>
          <text
            x={350}
            y={c.y + 24}
            textAnchor="middle"
            className="fill-muted-foreground text-[8px]"
          >
            {c.label}
          </text>
          <circle
            cx={460}
            cy={c.y + 15}
            r={9}
            className="fill-amber-500/40 stroke-amber-500"
            strokeWidth={1.5}
          />
          <text x={460} y={c.y + 18} textAnchor="middle" className="fill-foreground text-[7px]">
            cli
          </text>
          <line
            x1={410}
            y1={c.y + 15}
            x2={451}
            y2={c.y + 15}
            className="stroke-success"
            strokeWidth={1}
          />
        </g>
      ))}
    </svg>
  );
}

// ============================================================
// Nye SVG-er — metafor- og konsept-visualiseringer (2.1–2.6)
// ============================================================

function ArchVsP2PSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={120}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Klient-server
      </text>
      <rect
        x={95}
        y={95}
        width={50}
        height={30}
        rx={4}
        className="fill-success/30 stroke-success"
        strokeWidth={1.5}
      />
      <text x={120} y={114} textAnchor="middle" className="fill-foreground text-[9px]">
        server
      </text>
      {[
        [40, 40],
        [200, 40],
        [40, 170],
        [200, 170],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={11} className="fill-brand/30 stroke-brand" strokeWidth={1.2} />
          <text x={cx} y={cy + 3} textAnchor="middle" className="fill-foreground text-[8px]">
            K{i + 1}
          </text>
          <line x1={cx} y1={cy} x2={120} y2={110} className="stroke-brand/50" strokeWidth={1} />
        </g>
      ))}
      <text x={120} y={205} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        klienter snakker aldri direkte
      </text>

      <line
        x1={260}
        y1={30}
        x2={260}
        y2={205}
        className="stroke-border"
        strokeWidth={1}
        strokeDasharray="3 3"
      />

      <text
        x={380}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        P2P
      </text>
      {[
        [330, 50],
        [430, 50],
        [310, 130],
        [450, 130],
        [380, 190],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle
            cx={cx}
            cy={cy}
            r={12}
            className="fill-purple-500/30 stroke-purple-500"
            strokeWidth={1.2}
          />
          <text x={cx} y={cy + 3} textAnchor="middle" className="fill-foreground text-[8px]">
            P{i + 1}
          </text>
        </g>
      ))}
      {(() => {
        const peers: [number, number][] = [
          [330, 50],
          [430, 50],
          [310, 130],
          [450, 130],
          [380, 190],
        ];
        const lines: React.ReactElement[] = [];
        for (let i = 0; i < peers.length; i++)
          for (let j = i + 1; j < peers.length; j++) {
            lines.push(
              <line
                key={`${i}-${j}`}
                x1={peers[i][0]}
                y1={peers[i][1]}
                x2={peers[j][0]}
                y2={peers[j][1]}
                className="stroke-purple-500/40"
                strokeWidth={0.7}
              />,
            );
          }
        return lines;
      })()}
      <text x={380} y={205} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        alle med alle — ingen sentral
      </text>
    </svg>
  );
}

function TransportMenuSvg() {
  const rows = [
    { app: "Bank-overføring", pal: true, thr: "lav", tim: "egal", sec: true },
    { app: "Netflix-streaming", pal: true, thr: "høy", tim: "moderat", sec: true },
    { app: "FPS-spill (60 Hz)", pal: false, thr: "lav", tim: "kritisk", sec: false },
    { app: "DNS-oppslag", pal: false, thr: "lav", tim: "moderat", sec: false },
    { app: "Filoverføring", pal: true, thr: "høy", tim: "egal", sec: true },
  ];
  return (
    <svg viewBox="0 0 500 230" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Hvilken transport-tjeneste trenger appen?
      </text>
      {["App", "Pålitelig", "Throughput", "Timing", "Krypto"].map((h, i) => (
        <text
          key={h}
          x={20 + i * 95}
          y={38}
          className="fill-brand text-[9px] font-semibold uppercase tracking-wider"
        >
          {h}
        </text>
      ))}
      <line x1={15} y1={42} x2={485} y2={42} className="stroke-border" strokeWidth={1} />
      {rows.map((r, i) => {
        const y = 60 + i * 30;
        return (
          <g key={r.app}>
            <text x={20} y={y} className="fill-foreground text-[10px]">
              {r.app}
            </text>
            <text
              x={115}
              y={y}
              className={r.pal ? "fill-success text-[10px]" : "fill-muted-foreground text-[10px]"}
            >
              {r.pal ? "✓" : "—"}
            </text>
            <text x={210} y={y} className="fill-foreground text-[10px]">
              {r.thr}
            </text>
            <text x={305} y={y} className="fill-foreground text-[10px]">
              {r.tim}
            </text>
            <text
              x={400}
              y={y}
              className={r.sec ? "fill-success text-[10px]" : "fill-muted-foreground text-[10px]"}
            >
              {r.sec ? "✓" : "—"}
            </text>
            <text
              x={460}
              y={y}
              className="fill-purple-700 dark:fill-purple-400 text-[9px] font-mono"
            >
              {r.app.startsWith("FPS") || r.app.startsWith("DNS") ? "UDP" : "TCP"}
            </text>
          </g>
        );
      })}
      <text x={250} y={220} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        Velg transport som matcher rad-en — TCP for pålitelig+krypto, UDP når timing trumfer alt
      </text>
    </svg>
  );
}

function StatusCodeFamiliesSvg() {
  const fams = [
    {
      code: "2xx",
      boxCls: "fill-success/15 stroke-success",
      textCls: "fill-success",
      title: "OK",
      ex: "200, 201, 204",
    },
    {
      code: "3xx",
      boxCls: "fill-amber-500/15 stroke-amber-500",
      textCls: "fill-amber-700 dark:fill-amber-400",
      title: "Redirect",
      ex: "301, 304, 307",
    },
    {
      code: "4xx",
      boxCls: "fill-purple-500/15 stroke-purple-500",
      textCls: "fill-purple-700 dark:fill-purple-400",
      title: "Du-feil",
      ex: "400, 401, 404, 429",
    },
    {
      code: "5xx",
      boxCls: "fill-destructive/15 stroke-destructive",
      textCls: "fill-destructive",
      title: "Jeg-feil",
      ex: "500, 502, 503",
    },
  ];
  return (
    <svg viewBox="0 0 500 200" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Statuskode-familier — første siffer forteller alt
      </text>
      {fams.map((f, i) => {
        const x = 20 + i * 120;
        return (
          <g key={f.code}>
            <rect
              x={x}
              y={40}
              width={100}
              height={130}
              rx={6}
              className={f.boxCls}
              strokeWidth={1.5}
            />
            <text
              x={x + 50}
              y={68}
              textAnchor="middle"
              className={`${f.textCls} text-[18px] font-bold font-mono`}
            >
              {f.code}
            </text>
            <text
              x={x + 50}
              y={95}
              textAnchor="middle"
              className="fill-foreground text-[11px] font-semibold"
            >
              {f.title}
            </text>
            <text
              x={x + 50}
              y={130}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px] font-mono"
            >
              {f.ex}
            </text>
          </g>
        );
      })}
      <text x={250} y={192} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Husk: 4xx = «du gjorde noe galt», 5xx = «jeg gjorde noe galt»
      </text>
    </svg>
  );
}

function CookieFlowSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Cookie-flyt: tre besøk på samme nettside
      </text>
      <line x1={70} y1={40} x2={70} y2={205} className="stroke-foreground/40" strokeWidth={1.5} />
      <line x1={430} y1={40} x2={430} y2={205} className="stroke-foreground/40" strokeWidth={1.5} />
      <text x={70} y={35} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        nettleser
      </text>
      <text x={430} y={35} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        server
      </text>

      {/* 1. login */}
      <line x1={70} y1={55} x2={430} y2={65} className="stroke-brand" strokeWidth={1.5} />
      <polygon points="430,65 422,61 422,68" className="fill-brand" />
      <text x={250} y={52} textAnchor="middle" className="fill-foreground text-[9px]">
        POST /login (brukernavn + passord)
      </text>

      <line x1={430} y1={85} x2={70} y2={95} className="stroke-success" strokeWidth={1.5} />
      <polygon points="70,95 78,91 78,98" className="fill-success" />
      <text x={250} y={82} textAnchor="middle" className="fill-success text-[9px]">
        Set-Cookie: sid=ABC123
      </text>

      {/* 2. besøk-side */}
      <line x1={70} y1={115} x2={430} y2={125} className="stroke-brand" strokeWidth={1.5} />
      <polygon points="430,125 422,121 422,128" className="fill-brand" />
      <text x={250} y={112} textAnchor="middle" className="fill-foreground text-[9px]">
        GET /min-side (Cookie: sid=ABC123)
      </text>

      <line x1={430} y1={145} x2={70} y2={155} className="stroke-success" strokeWidth={1.5} />
      <polygon points="70,155 78,151 78,158" className="fill-success" />
      <text x={250} y={142} textAnchor="middle" className="fill-success text-[9px]">
        200 OK «Hei Kari» (server slo opp ABC123 → Kari)
      </text>

      {/* 3. uten cookie */}
      <line
        x1={70}
        y1={175}
        x2={430}
        y2={185}
        className="stroke-amber-500"
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      <text
        x={250}
        y={172}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[9px] italic"
      >
        (uten cookie) GET /min-side
      </text>
      <text
        x={250}
        y={200}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[9px] italic"
      >
        → 401 «hvem er du?»
      </text>
    </svg>
  );
}

function DnsCacheFilterSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Cache filtrerer 99 % av trafikken — TTL = 1 t, mange like spørringer
      </text>
      {/* Tre kolonner */}
      <text x={70} y={45} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        klient-spørringer
      </text>
      <text
        x={250}
        y={45}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        lokal resolver (cache)
      </text>
      <text
        x={430}
        y={45}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        autoritativ
      </text>

      {/* Mange piler inn */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <g key={i}>
          <line
            x1={20}
            y1={70 + i * 12}
            x2={130}
            y2={120}
            className="stroke-brand/50"
            strokeWidth={0.8}
          />
          <polygon points="130,120 124,117 124,123" className="fill-brand/50" />
        </g>
      ))}
      <rect
        x={130}
        y={100}
        width={240}
        height={50}
        rx={6}
        className="fill-brand/15 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={250} y={120} textAnchor="middle" className="fill-foreground text-[10px]">
        cache
      </text>
      <text x={250} y={138} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        www.x.no → 1.2.3.4 (TTL: 47 min igjen)
      </text>

      {/* Én pil ut */}
      <line x1={370} y1={125} x2={420} y2={125} className="stroke-success" strokeWidth={2} />
      <polygon points="420,125 412,121 412,128" className="fill-success" />
      <text x={395} y={117} textAnchor="middle" className="fill-success text-[9px]">
        1×/time
      </text>

      <text x={70} y={200} textAnchor="middle" className="fill-foreground text-[10px] font-mono">
        10 × n spørringer
      </text>
      <text x={430} y={200} textAnchor="middle" className="fill-success text-[10px] font-mono">
        1 spørring
      </text>
      <text x={250} y={210} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        TTL = 1 t betyr at autoritativ ser maks 1 oppslag per time per resolver, uansett
        klient-volum
      </text>
    </svg>
  );
}

function DnsRecordTypesSvg() {
  const rows = [
    { q: "A    eksempel.no", a: "203.0.113.7" },
    { q: "AAAA eksempel.no", a: "2001:db8::7" },
    { q: "MX   eksempel.no", a: "10 mail.eksempel.no" },
    { q: "NS   eksempel.no", a: "ns1.eksempel.no" },
    { q: "TXT  eksempel.no", a: "v=spf1 -all" },
    { q: "CNAME shop.eksempel.no", a: "edge.cdn.com" },
  ];
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Record-typer — samme domene, ulike spørsmål
      </text>
      <text x={20} y={40} className="fill-brand text-[9px] uppercase tracking-wider font-semibold">
        spørsmål
      </text>
      <text
        x={270}
        y={40}
        className="fill-success text-[9px] uppercase tracking-wider font-semibold"
      >
        svar
      </text>
      <line x1={15} y1={45} x2={485} y2={45} className="stroke-border" />
      {rows.map((r, i) => {
        const y = 65 + i * 25;
        return (
          <g key={r.q}>
            <text x={20} y={y} className="fill-foreground text-[10px] font-mono">
              {r.q}
            </text>
            <text x={258} y={y} className="fill-muted-foreground text-[10px]">
              →
            </text>
            <text x={275} y={y} className="fill-success text-[10px] font-mono">
              {r.a}
            </text>
          </g>
        );
      })}
      <text x={250} y={215} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        Samme navn, helt forskjellige verdier — record-type bestemmer hva som returneres
      </text>
    </svg>
  );
}

function MailFlowSvg() {
  return (
    <svg viewBox="0 0 500 200" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        E-post-flyt: 4 hopp fra Ola til Kari
      </text>
      {[
        { x: 30, y: 90, label: "Ola sin\nmail-klient", cls: "fill-brand/20 stroke-brand" },
        { x: 145, y: 90, label: "send.no\nSMTP-server", cls: "fill-success/20 stroke-success" },
        { x: 270, y: 90, label: "mottak.no\nSMTP-server", cls: "fill-success/20 stroke-success" },
        { x: 395, y: 90, label: "Kari sin\nmail-klient", cls: "fill-brand/20 stroke-brand" },
      ].map((n, i) => (
        <g key={i}>
          <rect x={n.x} y={n.y} width={80} height={50} rx={5} className={n.cls} strokeWidth={1.5} />
          {n.label.split("\n").map((l, j) => (
            <text
              key={j}
              x={n.x + 40}
              y={n.y + 22 + j * 12}
              textAnchor="middle"
              className="fill-foreground text-[9px]"
            >
              {l}
            </text>
          ))}
        </g>
      ))}
      {[
        {
          x1: 110,
          x2: 145,
          label: "SMTP submission (587)",
          lineCls: "stroke-brand",
          fillCls: "fill-brand",
        },
        {
          x1: 225,
          x2: 270,
          label: "SMTP (25)",
          lineCls: "stroke-success",
          fillCls: "fill-success",
        },
        {
          x1: 350,
          x2: 395,
          label: "IMAP (993)",
          lineCls: "stroke-purple-500",
          fillCls: "fill-purple-500",
        },
      ].map((arr, i) => (
        <g key={i}>
          <line x1={arr.x1} y1={115} x2={arr.x2} y2={115} className={arr.lineCls} strokeWidth={2} />
          <polygon
            points={`${arr.x2},115 ${arr.x2 - 6},112 ${arr.x2 - 6},118`}
            className={arr.fillCls}
          />
          <text
            x={(arr.x1 + arr.x2) / 2}
            y={108}
            textAnchor="middle"
            className="fill-muted-foreground text-[8px]"
          >
            {arr.label}
          </text>
        </g>
      ))}
      <text x={250} y={175} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        SMTP er push (server-til-server). IMAP er pull (klient henter når hun vil).
      </text>
    </svg>
  );
}

function TitForTatSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Tit-for-tat over 4 runder: deler du, blir du belønnet
      </text>
      {/* Header */}
      <text x={20} y={45} className="fill-brand text-[9px] uppercase tracking-wider font-semibold">
        Peer
      </text>
      {["t=0", "t=10", "t=20", "t=30"].map((t, i) => (
        <text
          key={t}
          x={120 + i * 90}
          y={45}
          textAnchor="middle"
          className="fill-brand text-[9px] uppercase tracking-wider font-semibold"
        >
          {t}
        </text>
      ))}
      <line x1={15} y1={50} x2={485} y2={50} className="stroke-border" />
      {[
        { name: "Per (deler 5 b/s)", states: ["unchoke", "unchoke", "unchoke", "unchoke"] },
        { name: "Kari (deler 3 b/s)", states: ["unchoke", "unchoke", "unchoke", "unchoke"] },
        { name: "Ola (deler 0 b/s)", states: ["unchoke", "choked", "choked", "choked"] },
        { name: "Liv (nykommer)", states: ["—", "—", "opt.unchoke", "unchoke"] },
      ].map((row, i) => {
        const y = 75 + i * 28;
        return (
          <g key={row.name}>
            <text x={20} y={y} className="fill-foreground text-[10px]">
              {row.name}
            </text>
            {row.states.map((s, j) => {
              const fill =
                s === "unchoke"
                  ? "fill-success"
                  : s === "choked"
                    ? "fill-destructive"
                    : s.startsWith("opt")
                      ? "fill-purple-500"
                      : "fill-muted-foreground";
              return (
                <text
                  key={j}
                  x={120 + j * 90}
                  y={y}
                  textAnchor="middle"
                  className={`${fill} text-[9px] font-mono`}
                >
                  {s}
                </text>
              );
            })}
          </g>
        );
      })}
      <text x={250} y={205} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Ola snylter, blir choked. Liv prøves «optimistic» runde 3 og oppfører seg fint — promotert.
      </text>
    </svg>
  );
}

function DashBitrateSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        DASH-klient: throughput stuper, klient bytter kvalitet ned, så opp igjen
      </text>
      {/* Akser */}
      <line x1={50} y1={180} x2={470} y2={180} className="stroke-foreground/60" strokeWidth={1} />
      <line x1={50} y1={40} x2={50} y2={180} className="stroke-foreground/60" strokeWidth={1} />
      <text x={20} y={45} className="fill-muted-foreground text-[8px]">
        Mbps
      </text>
      <text x={465} y={195} className="fill-muted-foreground text-[8px]">
        tid →
      </text>

      {/* Throughput-linje */}
      <polyline
        points="50,60 180,60 200,150 280,150 300,75 470,75"
        className="fill-none stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={120} y={55} className="fill-amber-700 dark:fill-amber-400 text-[8px]">
        målt throughput
      </text>

      {/* Valgt bitrate */}
      <polyline
        points="50,80 180,80 195,160 280,160 300,95 470,95"
        className="fill-none stroke-brand"
        strokeWidth={2}
        strokeDasharray="4 2"
      />
      <text x={120} y={75} className="fill-brand text-[8px]">
        valgt bitrate
      </text>

      {/* Annotasjoner */}
      <text x={115} y={130} className="fill-foreground text-[9px]">
        720p
      </text>
      <text x={235} y={175} className="fill-foreground text-[9px]">
        480p
      </text>
      <text x={235} y={140} className="fill-muted-foreground text-[8px]">
        (panikk-bytte)
      </text>
      <text x={385} y={120} className="fill-foreground text-[9px]">
        720p igjen
      </text>

      <line
        x1={195}
        y1={40}
        x2={195}
        y2={180}
        className="stroke-foreground/30"
        strokeDasharray="2 2"
      />
      <line
        x1={300}
        y1={40}
        x2={300}
        y2={180}
        className="stroke-foreground/30"
        strokeDasharray="2 2"
      />
      <text x={195} y={210} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        bryter ned
      </text>
      <text x={300} y={210} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        bryter opp
      </text>
    </svg>
  );
}

function CacheWarmingSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Cache-warming vs thundering herd ved storserie-slipp
      </text>
      {/* Uten warming */}
      <text
        x={20}
        y={40}
        className="fill-destructive text-[10px] uppercase tracking-wider font-semibold"
      >
        Uten pre-warming
      </text>
      <rect
        x={20}
        y={50}
        width={60}
        height={30}
        rx={4}
        className="fill-success/20 stroke-success"
        strokeWidth={1.5}
      />
      <text x={50} y={70} textAnchor="middle" className="fill-foreground text-[9px]">
        origin
      </text>
      {[120, 170, 220, 270, 320, 370, 420].map((x, i) => (
        <g key={i}>
          <line x1={80} y1={65} x2={x} y2={95} className="stroke-destructive" strokeWidth={1.5} />
          <polygon points={`${x},95 ${x - 4},91 ${x + 4},91`} className="fill-destructive" />
          <rect
            x={x - 10}
            y={95}
            width={20}
            height={14}
            rx={2}
            className="fill-amber-500/30 stroke-amber-500"
            strokeWidth={1}
          />
        </g>
      ))}
      <text x={270} y={125} textAnchor="middle" className="fill-destructive text-[9px] italic">
        alle edges spør samtidig kl. 09:00 → origin knust
      </text>

      <line x1={15} y1={140} x2={485} y2={140} className="stroke-border" strokeDasharray="3 3" />

      {/* Med warming */}
      <text
        x={20}
        y={160}
        className="fill-success text-[10px] uppercase tracking-wider font-semibold"
      >
        Med pre-warming (kl. 03:00)
      </text>
      <rect
        x={20}
        y={170}
        width={60}
        height={20}
        rx={4}
        className="fill-success/20 stroke-success"
        strokeWidth={1.5}
      />
      <text x={50} y={184} textAnchor="middle" className="fill-foreground text-[9px]">
        origin
      </text>
      {[120, 170, 220, 270, 320, 370, 420].map((x, i) => (
        <g key={i}>
          <line
            x1={80}
            y1={180}
            x2={x}
            y2={200}
            className="stroke-success/60"
            strokeWidth={1}
            strokeDasharray="2 2"
          />
          <rect
            x={x - 10}
            y={200}
            width={20}
            height={14}
            rx={2}
            className="fill-success/40 stroke-success"
            strokeWidth={1}
          />
        </g>
      ))}
    </svg>
  );
}

function SocketStateSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        TCP-server-tilstander (fra app-siden)
      </text>
      {[
        { x: 60, y: 60, label: "CLOSED", note: "socket()" },
        { x: 180, y: 60, label: "BOUND", note: "bind()" },
        { x: 300, y: 60, label: "LISTEN", note: "listen()" },
        { x: 420, y: 60, label: "ESTABLISHED", note: "accept()" },
        { x: 300, y: 170, label: "TIME_WAIT", note: "close()" },
      ].map((s, i) => (
        <g key={i}>
          <ellipse
            cx={s.x}
            cy={s.y}
            rx={50}
            ry={20}
            className={
              i === 4 ? "fill-amber-500/20 stroke-amber-500" : "fill-brand/20 stroke-brand"
            }
            strokeWidth={1.5}
          />
          <text
            x={s.x}
            y={s.y + 3}
            textAnchor="middle"
            className="fill-foreground text-[10px] font-mono"
          >
            {s.label}
          </text>
          <text
            x={s.x}
            y={s.y + 35}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px] italic"
          >
            {s.note}
          </text>
        </g>
      ))}
      {[
        [110, 180],
        [230, 300],
        [350, 420],
      ].map(([from, to], i) => (
        <g key={i}>
          <line
            x1={from}
            y1={60}
            x2={to}
            y2={60}
            className="stroke-foreground/60"
            strokeWidth={1.2}
          />
          <polygon points={`${to},60 ${to - 5},57 ${to - 5},63`} className="fill-foreground/60" />
        </g>
      ))}
      <line x1={420} y1={80} x2={350} y2={170} className="stroke-foreground/60" strokeWidth={1.2} />
      <polygon points="350,170 357,167 354,173" className="fill-foreground/60" />
      <text x={195} y={185} className="fill-muted-foreground text-[8px] italic">
        TIME_WAIT henger i 60–120 s → SO_REUSEADDR ved restart
      </text>
    </svg>
  );
}

function ThreadVsEpollSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Skalering til 10 000 klienter: tråd-per-klient vs epoll
      </text>
      {/* Tråd-per-klient */}
      <text
        x={120}
        y={40}
        textAnchor="middle"
        className="fill-destructive text-[10px] uppercase tracking-wider font-semibold"
      >
        tråd-per-klient
      </text>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        return (
          <g key={i}>
            <rect
              x={30 + col * 45}
              y={55 + row * 30}
              width={40}
              height={22}
              rx={3}
              className="fill-destructive/15 stroke-destructive"
              strokeWidth={1}
            />
            <text
              x={50 + col * 45}
              y={70 + row * 30}
              textAnchor="middle"
              className="fill-foreground text-[8px]"
            >
              T{i + 1}
            </text>
          </g>
        );
      })}
      <text x={120} y={140} textAnchor="middle" className="fill-foreground text-[9px]">
        … × 10 000 tråder
      </text>
      <text x={120} y={158} textAnchor="middle" className="fill-destructive text-[10px] font-mono">
        80 GB RAM
      </text>
      <text x={120} y={175} textAnchor="middle" className="fill-destructive text-[9px]">
        context-switch dreper CPU
      </text>

      <line x1={245} y1={30} x2={245} y2={205} className="stroke-border" strokeDasharray="3 3" />

      {/* epoll */}
      <text
        x={380}
        y={40}
        textAnchor="middle"
        className="fill-success text-[10px] uppercase tracking-wider font-semibold"
      >
        epoll / asyncio
      </text>
      <rect
        x={350}
        y={55}
        width={60}
        height={30}
        rx={4}
        className="fill-success/20 stroke-success"
        strokeWidth={1.5}
      />
      <text x={380} y={73} textAnchor="middle" className="fill-foreground text-[10px]">
        1 tråd
      </text>
      <text x={380} y={100} textAnchor="middle" className="fill-foreground text-[9px]">
        kernel sier:
      </text>
      <text x={380} y={114} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        «sock-23 har data»
      </text>
      <text x={380} y={130} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        «sock-99 har data»
      </text>
      <text x={380} y={158} textAnchor="middle" className="fill-success text-[10px] font-mono">
        ~150 MB RAM
      </text>
      <text x={380} y={175} textAnchor="middle" className="fill-success text-[9px]">
        samme tråd jobber raskt
      </text>
    </svg>
  );
}

// ============================================================
// Section 2.8 — Eksamen-fokus
// ============================================================

function SectionEksamen() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="2.8" title="Eksamen-fokus" />
      <p className="text-muted-foreground">
        Kompakt repetisjon for sluttspurten. Cheat sheet med tall og tabeller du må kunne i søvne,
        sammenligning av HTTP-versjonene, et beslutningstre for hvilken app-protokoll som passer til
        hvilket scenario, vanlige fallgruver som folk roter med på eksamen, og et 5-minutter-anker
        du kan resitere før du går inn i salen.
      </p>

      {/* Visuelle cheat-sheets */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Illustration caption="HTTP/1.1, HTTP/2 og HTTP/3 som pakke-strøm-timeline — hver versjon kutter en RTT eller eliminerer HoL.">
          <HttpVersionTimelineSvg />
        </Illustration>
        <Illustration caption="DNS-record-typene som visuelle kort — A, AAAA, CNAME, MX, TXT, NS, SOA, PTR.">
          <DnsRecordCardsSvg />
        </Illustration>
      </div>

      <Illustration caption="Port-numre som ikon-grid — SSH, SMTP, DNS, HTTP, IMAP, HTTPS, og alle de andre du må kunne utenat.">
        <PortNumbersGridSvg />
      </Illustration>

      {/* a) Cheat sheet */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Cheat tittel="HTTP-statuskoder — familier">
          <ul className="space-y-1">
            <li>
              <span className="font-mono text-foreground">1xx</span> — informasjon (sjelden brukt;
              100 Continue når man laster opp store filer)
            </li>
            <li>
              <span className="font-mono text-foreground">2xx</span> — suksess (200 OK, 201 Created,
              204 No Content)
            </li>
            <li>
              <span className="font-mono text-foreground">3xx</span> — videresending (301 permanent,
              302 midlertidig, 304 Not Modified ⇒ cache er fortsatt gyldig)
            </li>
            <li>
              <span className="font-mono text-foreground">4xx</span> — klientfeil (400 Bad Request,
              401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests)
            </li>
            <li>
              <span className="font-mono text-foreground">5xx</span> — serverfeil (500 Internal, 502
              Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout)
            </li>
          </ul>
        </Cheat>

        <Cheat tittel="HTTP-versjonene i én tabell">
          <ul className="space-y-1">
            <li>
              <span className="font-mono text-foreground">1.0</span> — én request per
              TCP-forbindelse, ingen keep-alive som default.
            </li>
            <li>
              <span className="font-mono text-foreground">1.1</span> — persistent connections,
              pipelining (sjelden brukt i praksis), head-of-line-blocking ved tap.
            </li>
            <li>
              <span className="font-mono text-foreground">2</span> — binær framing, multipleksing
              over én TCP, HPACK-headerkompresjon, server push (deprecated). Fortsatt HoL-blocking
              på TCP-laget.
            </li>
            <li>
              <span className="font-mono text-foreground">3</span> — kjører over QUIC (UDP),
              uavhengige strømmer fjerner TCP-HoL, raskere handshake (0-RTT etter første gang),
              innebygd TLS 1.3.
            </li>
          </ul>
        </Cheat>

        <Cheat tittel="DNS-record-typer">
          <ul className="space-y-1">
            <li>
              <span className="font-mono text-foreground">A</span> — IPv4-adresse for et navn.
            </li>
            <li>
              <span className="font-mono text-foreground">AAAA</span> — IPv6-adresse for et navn.
            </li>
            <li>
              <span className="font-mono text-foreground">CNAME</span> — alias som peker til et
              annet navn (ikke direkte til IP). Brukes ofte til CDN-er.
            </li>
            <li>
              <span className="font-mono text-foreground">MX</span> — Mail eXchanger; hvilken server
              tar imot e-post for domenet, med prioritet.
            </li>
            <li>
              <span className="font-mono text-foreground">TXT</span> — fritekst; SPF, DKIM,
              eierskaps-verifisering.
            </li>
            <li>
              <span className="font-mono text-foreground">NS</span> — Name Server; hvilke
              DNS-servere er autoritative for sonen.
            </li>
            <li>
              <span className="font-mono text-foreground">SOA</span> — Start Of Authority; meta om
              sonen (serial, refresh, expire, min TTL).
            </li>
          </ul>
        </Cheat>

        <Cheat tittel="Portnumre du må kunne utenat">
          <ul className="space-y-1">
            <li>
              <span className="font-mono text-foreground">21</span> — FTP (kontroll-kanal)
            </li>
            <li>
              <span className="font-mono text-foreground">22</span> — SSH
            </li>
            <li>
              <span className="font-mono text-foreground">25</span> — SMTP (server-til-server)
            </li>
            <li>
              <span className="font-mono text-foreground">53</span> — DNS (UDP for små svar, TCP for
              store / zone transfer)
            </li>
            <li>
              <span className="font-mono text-foreground">80</span> — HTTP
            </li>
            <li>
              <span className="font-mono text-foreground">110</span> — POP3
            </li>
            <li>
              <span className="font-mono text-foreground">143</span> — IMAP
            </li>
            <li>
              <span className="font-mono text-foreground">443</span> — HTTPS (og QUIC/HTTP/3)
            </li>
            <li>
              <span className="font-mono text-foreground">587</span> — SMTP submission (klient →
              mail-server, med STARTTLS)
            </li>
            <li>
              <span className="font-mono text-foreground">993</span> — IMAPS,{" "}
              <span className="font-mono text-foreground">995</span> — POP3S
            </li>
          </ul>
        </Cheat>
      </div>

      <Cheat tittel="DNS TTL — trade-off-regel">
        <p>
          TTL (Time To Live) avgjør hvor lenge en resolver kan cache et svar. Det er en rett-frem
          avveining:
        </p>
        <ul className="mt-2 space-y-1">
          <li>
            <span className="font-semibold text-foreground">Lav TTL</span> (sekunder–minutter) ⇒
            rask failover når du flytter et navn, men resolverne ringer hjem hyppig ⇒ høyere last og
            tregere oppslag for sluttbrukere.
          </li>
          <li>
            <span className="font-semibold text-foreground">Høy TTL</span> (timer–dager) ⇒ raske
            oppslag i stor cache-hit-andel, men endringer i recorden tar lang tid før alle ser den.
            Senk TTL FØR du planlegger endring, ikke etter.
          </li>
          <li>
            Tommelfingerregel: <span className="font-semibold text-foreground">300 s</span> for
            tjenester som flytter ofte (load balancer-pek),{" "}
            <span className="font-semibold text-foreground">3600 s+</span> for stabile
            A/AAAA-poster.
          </li>
        </ul>
      </Cheat>

      {/* b) Sammenligning HTTP/1.1 vs HTTP/2 vs HTTP/3 */}
      <Illustration caption="Sammenligning: tre HTTP-generasjoner på fem dimensjoner. HTTP/3 fjerner TCP-HoL ved å bytte transport.">
        <HttpVersionMatrixSvg />
      </Illustration>

      {/* c) Beslutningstre */}
      <Illustration caption="Beslutningstre: gå fra venstre mot høyre — krav først, så protokoll. Sju use-case-blader.">
        <ProtocolDecisionTreeSvg />
      </Illustration>

      {/* d) Fallgruver */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Fallgruve tittel="«DNS er ett oppslag»" illustration={<FallgruvIconSvg kind="dns" />}>
          <p>
            Klassisk feilforestilling. Et førstegangs-oppslag av <code>www.foo.no</code> går typisk
            via <span className="font-semibold text-foreground">lokal resolver</span> →{" "}
            <span className="font-semibold text-foreground">root-server</span> ({"."}) →{" "}
            <span className="font-semibold text-foreground">TLD-server</span> ({".no"}) →{" "}
            <span className="font-semibold text-foreground">autoritativ server</span> for{" "}
            <code>foo.no</code>. Det er fire UDP-tur-retur. Påfølgende oppslag treffer cache inntil
            TTL utløper.
          </p>
        </Fallgruve>

        <Fallgruve
          tittel="«HTTP er stateful fordi vi har innlogging»"
          illustration={<FallgruvIconSvg kind="stateful" />}
        >
          <p>
            HTTP-protokollen er <span className="font-semibold text-foreground">stateless</span> —
            serveren husker ingenting mellom requests. Innlogging-følelsen kommer fra cookies eller
            tokens som klienten sender på nytt for hver request. Serveren bygger applikasjons-state
            med en sesjons-tabell indeksert på cookie-verdien; protokollen i seg selv har ingen
            anelse.
          </p>
        </Fallgruve>

        <Fallgruve
          tittel="Browser-cache vs proxy-cache vs CDN"
          illustration={<FallgruvIconSvg kind="cache" />}
        >
          <p>
            Tre forskjellige ting.{" "}
            <span className="font-semibold text-foreground">Browser-cache</span> ligger på din
            maskin (private). <span className="font-semibold text-foreground">Proxy-cache</span> er
            en delt cache i nettverket (f.eks. på universitetet) — bare ressurser merket{" "}
            <code>Cache-Control: public</code> får ligge der.{" "}
            <span className="font-semibold text-foreground">CDN</span> er en distribuert proxy-cache
            som tilbyder-en (Netflix, NRK) selv betaler for; brukeren får svar fra et edge-punkt
            geografisk nært.
          </p>
        </Fallgruve>

        <Fallgruve
          tittel="«HTTPS er en egen protokoll»"
          illustration={<FallgruvIconSvg kind="https" />}
        >
          <p>
            Nei. HTTPS = HTTP <em>over</em> TLS over TCP. Forskjellen fra HTTP er at applikasjons-
            byteene krypteres av TLS-laget før de når TCP. Status-koder, headere, metoder — alt ser
            likt ut. HTTP/2 og HTTP/3 forutsetter i praksis kryptert transport, men det er en valgt
            konvensjon, ikke et formelt protokoll-krav.
          </p>
        </Fallgruve>

        <Fallgruve
          tittel="«SMTP brukes til å hente e-post»"
          illustration={<FallgruvIconSvg kind="smtp" />}
        >
          <p>
            <span className="font-semibold text-foreground">SMTP</span> sender e-post (klient →
            server og server → server). <span className="font-semibold text-foreground">IMAP</span>{" "}
            og <span className="font-semibold text-foreground">POP3</span> henter e-post. IMAP
            holder meldinger på serveren og synker på tvers av enheter; POP3 laster ned og sletter
            normalt fra serveren.
          </p>
        </Fallgruve>

        <Fallgruve tittel="«P2P er alltid raskere»" illustration={<FallgruvIconSvg kind="p2p" />}>
          <p>
            Det er det ikke. P2P (Peer-to-Peer; klient-noder deler data direkte) skalerer godt for
            <em> populært</em> innhold med mange seedere, men for ferskt eller sjeldent innhold kan
            klient-server være raskere fordi den ene serveren har full kapasitet hele tiden.
            BitTorrent har dessuten <em>tit-for-tat</em>-mekanisme som kan straffe nye noder med
            lite å bidra.
          </p>
        </Fallgruve>
      </div>

      {/* e) 5-minutter-anker — visuelt grid */}
      <Illustration caption="5-minutter-anker som 15 ikon-kort — rask visuell rep før du går inn i salen.">
        <FiveMinAnchorGridSvg />
      </Illustration>

      <Anker tittel="5-minutter-anker — kjør disse i hodet før eksamen">
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            App-protokoller bestemmer hvilke meldinger som sendes, i hvilken rekkefølge og hva de
            betyr — transportlaget under tar seg av leveransen.
          </li>
          <li>
            HTTP er request/response, tekstbasert (frem til HTTP/2 som er binær), stateless. State
            lagres på klient (cookies) eller server (sesjonstabell + cookie-nøkkel).
          </li>
          <li>
            HTTP/1.1 → 2 → 3 fjerner head-of-line-blocking i to steg: HTTP/2 på applikasjons- laget
            (multipleksing), HTTP/3 ved å bytte til QUIC over UDP.
          </li>
          <li>
            En non-persistent HTTP-side med N objekter tar minst{" "}
            <span className="font-mono text-foreground">2N · RTT</span> (én TCP + én request per
            objekt). Persistent + pipelined faller mot{" "}
            <span className="font-mono text-foreground">(N+2) · RTT</span>.
          </li>
          <li>
            DNS er hierarkisk og rekursivt cachet. Rekkefølgen: lokal resolver → root → TLD →
            autoritativ. TTL styrer hvor lenge svar gjenbrukes.
          </li>
          <li>
            DNS-record-typene A/AAAA/CNAME/MX/TXT/NS/SOA løser hver sin oppgave — IP-oppslag, alias,
            e-post-rute, fritekst (SPF/DKIM), delegering, sonemeta.
          </li>
          <li>
            E-post: SMTP sender (port 25 server-server, 587 klient-server). IMAP (143/993) holder
            mail på serveren; POP3 (110/995) laster ned.
          </li>
          <li>
            P2P-skaleringen: server-tid = max(F/u_s, NF/(u_s + Σu_i)) — fildelernes opplastings-
            kapasitet teller med, så total tid faller når flere noder hjelper til.
          </li>
          <li>
            Video over HTTPS bruker DASH (Dynamic Adaptive Streaming over HTTP) — manifest +
            segmenter i flere bitrater, klienten velger bitraten basert på målt båndbredde.
          </li>
          <li>
            CDN (Content Delivery Network) plasserer kopier av innhold nær brukeren — DNS gjør
            jobben med å rute klienten til nærmeste edge.
          </li>
          <li>
            Sockets er API-et programmet bruker for å åpne en transport-kanal. TCP-socket = stream +
            connection (connect/accept). UDP-socket = datagram, ingen handshake.
          </li>
          <li>
            En socket adresseres av (IP, port) — eller for TCP av 4-tuppelet (lokal IP, lokal port,
            ekstern IP, ekstern port). Det er tuppelet som bestemmer hvilken socket en pakke
            tilhører.
          </li>
          <li>
            Klient-server skalerer ved horisontal duplisering + lastbalansering; P2P skalerer ved at
            hver ny node også bidrar med kapasitet.
          </li>
          <li>
            For sanntid (lyd/video samtale) brukes UDP-basert protokoller (WebRTC over DTLS+SRTP) —
            TCPs retransmisjon er for treg, vi vil heller miste et frame enn å vente.
          </li>
          <li>
            Husk forskjellen: portnummer (16 bit) identifiserer prosessen på en host; IP-adresse
            identifiserer host-en på nettverket. Sammen utgjør de en socket-adresse.
          </li>
        </ol>
      </Anker>

      <RelatedSlugs slugs={["kurose-kap-1", "kurose-kap-3", "dte-2507"]} />
    </article>
  );
}

// ============================================================
// Eksamen-spesifikke helpers
// ============================================================

function Fallgruve({
  tittel,
  children,
  illustration,
}: {
  tittel: string;
  children: React.ReactNode;
  illustration?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-rose-700 dark:text-rose-400 font-semibold mb-1">
        Fallgruve
      </div>
      <div className="font-semibold text-foreground mb-1">{tittel}</div>
      {illustration && (
        <div className="my-2 rounded bg-background/40 p-2 border border-rose-500/20">
          {illustration}
        </div>
      )}
      <div className="text-muted-foreground text-[13px] space-y-2">{children}</div>
    </div>
  );
}

function Cheat({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
        Cheat sheet
      </div>
      <div className="font-semibold text-foreground mb-2">{tittel}</div>
      <div className="text-muted-foreground text-[13px] space-y-1">{children}</div>
    </div>
  );
}

function Anker({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-indigo-700 dark:text-indigo-400 font-semibold mb-1">
        5-minutter-anker
      </div>
      <div className="font-semibold text-foreground mb-2">{tittel}</div>
      <div className="text-muted-foreground text-[13px]">{children}</div>
    </div>
  );
}

// ============================================================
// Eksamen-SVG-er
// ============================================================

function HttpVersionMatrixSvg() {
  const rows = [
    {
      dim: "Multipleksing",
      v11: "Nei (én request av gangen)",
      v2: "Ja (binær framing)",
      v3: "Ja (uavhengige QUIC-strømmer)",
    },
    { dim: "Header-kompresjon", v11: "Ingen", v2: "HPACK", v3: "QPACK" },
    { dim: "Transport", v11: "TCP", v2: "TCP", v3: "QUIC (UDP)" },
    { dim: "Encryption", v11: "TLS valgfritt", v2: "TLS de facto", v3: "TLS 1.3 innebygd" },
    { dim: "Head-of-line-block.", v11: "Ja (appl. + TCP)", v2: "Ja (TCP)", v3: "Nei" },
  ];
  const colX = [10, 160, 290, 420];
  const colW = [140, 130, 130, 140];
  return (
    <svg viewBox="0 0 560 220" className="w-full h-auto">
      <rect x={0} y={0} width={colX[0] + colW[0]} height={28} className="fill-muted/40" />
      <rect x={colX[1]} y={0} width={colW[1]} height={28} className="fill-brand/10" />
      <rect x={colX[2]} y={0} width={colW[2]} height={28} className="fill-brand/15" />
      <rect x={colX[3]} y={0} width={colW[3]} height={28} className="fill-brand/20" />
      <text x={colX[0] + 8} y={18} className="fill-foreground text-[11px] font-semibold">
        Dimensjon
      </text>
      <text
        x={colX[1] + colW[1] / 2}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        HTTP/1.1
      </text>
      <text
        x={colX[2] + colW[2] / 2}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        HTTP/2
      </text>
      <text
        x={colX[3] + colW[3] / 2}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        HTTP/3
      </text>
      {rows.map((r, i) => {
        const y = 28 + i * 36;
        return (
          <g key={r.dim}>
            <rect
              x={0}
              y={y}
              width={560}
              height={36}
              className={i % 2 === 0 ? "fill-card" : "fill-muted/10"}
            />
            <line x1={0} y1={y} x2={560} y2={y} className="stroke-border" strokeWidth={0.5} />
            <text x={colX[0] + 8} y={y + 22} className="fill-foreground text-[10px] font-semibold">
              {r.dim}
            </text>
            <text x={colX[1] + 6} y={y + 22} className="fill-muted-foreground text-[10px]">
              {r.v11}
            </text>
            <text x={colX[2] + 6} y={y + 22} className="fill-muted-foreground text-[10px]">
              {r.v2}
            </text>
            <text x={colX[3] + 6} y={y + 22} className="fill-success text-[10px]">
              {r.v3}
            </text>
          </g>
        );
      })}
      <line
        x1={0}
        y1={28 + rows.length * 36}
        x2={560}
        y2={28 + rows.length * 36}
        className="stroke-border"
        strokeWidth={0.5}
      />
    </svg>
  );
}

function ProtocolDecisionTreeSvg() {
  // Decision tree: root question -> intermediate -> leaf protocols
  return (
    <svg viewBox="0 0 720 360" className="w-full h-auto">
      {/* Root */}
      <rect
        x={20}
        y={150}
        width={140}
        height={48}
        rx={6}
        className="fill-brand/15 stroke-brand"
        strokeWidth={1}
      />
      <text
        x={90}
        y={170}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Hva slags use-case?
      </text>
      <text x={90} y={186} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        start her
      </text>

      {/* Level 1 — 4 categories */}
      {[
        { y: 20, label: "Hente dokument", desc: "tekst / bilder / fil" },
        { y: 100, label: "Sanntids-kommunikasjon", desc: "lav latency, OK å miste pakker" },
        { y: 180, label: "Strømme media", desc: "video on demand, lyd" },
        { y: 260, label: "Sende / hente meldinger", desc: "e-post, chat, fildeling" },
      ].map((cat, i) => (
        <g key={cat.label}>
          <line
            x1={160}
            y1={174}
            x2={210}
            y2={cat.y + 24}
            className="stroke-muted-foreground"
            strokeWidth={1}
          />
          <rect
            x={210}
            y={cat.y}
            width={170}
            height={48}
            rx={6}
            className="fill-card stroke-border"
            strokeWidth={1}
          />
          <text
            x={295}
            y={cat.y + 20}
            textAnchor="middle"
            className="fill-foreground text-[10px] font-semibold"
          >
            {cat.label}
          </text>
          <text
            x={295}
            y={cat.y + 35}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px]"
          >
            {cat.desc}
          </text>
        </g>
      ))}

      {/* Leaves (protocols) */}
      {[
        // For each category, list one or more leaves with y position
        { from: 24, y: 5, label: "HTTP / HTTPS", note: "GET, statisk + dynamisk" },
        { from: 24, y: 40, label: "BitTorrent", note: "stor fil, mange seedere" },
        { from: 104, y: 80, label: "WebRTC / SRTP", note: "video-samtale, P2P over UDP" },
        { from: 104, y: 115, label: "SIP + RTP", note: "VoIP-signalering" },
        { from: 184, y: 165, label: "HTTPS + DASH", note: "tilpasset bitrate, segmenter" },
        { from: 184, y: 200, label: "HLS over HTTPS", note: "Apple-stack, segmenter" },
        { from: 264, y: 245, label: "SMTP + IMAP", note: "e-post send + hent" },
        { from: 264, y: 280, label: "XMPP / Matrix", note: "chat" },
        { from: 264, y: 315, label: "FTP / SFTP", note: "fil-overføring" },
      ].map((leaf) => (
        <g key={leaf.label + leaf.y}>
          <line
            x1={380}
            y1={leaf.from}
            x2={490}
            y2={leaf.y + 18}
            className="stroke-muted-foreground"
            strokeWidth={1}
          />
          <rect
            x={490}
            y={leaf.y}
            width={210}
            height={36}
            rx={6}
            className="fill-success/10 stroke-success/60"
            strokeWidth={1}
          />
          <text
            x={595}
            y={leaf.y + 15}
            textAnchor="middle"
            className="fill-foreground text-[10px] font-semibold"
          >
            {leaf.label}
          </text>
          <text
            x={595}
            y={leaf.y + 28}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px]"
          >
            {leaf.note}
          </text>
        </g>
      ))}

      {/* Legend */}
      <text x={20} y={345} className="fill-muted-foreground text-[9px] italic">
        Beslutningstre — krav (midt-kolonne) avgjør protokoll (høyre). Tekst-meldinger og fildeling
        kan velge mellom flere; sanntid utelukker TCP-retransmit.
      </text>
    </svg>
  );
}

// ============================================================
// Nye SVG-er (tillegg) — eksamen-cheat, mini-illustrasjoner per seksjon
// ============================================================

function HttpVersionTimelineSvg() {
  // Tre rader: pakke-strømmer for HTTP/1.1, HTTP/2, HTTP/3 mot vg.no
  const rows = [
    {
      label: "HTTP/1.1",
      cls: "fill-amber-500/25 stroke-amber-500",
      packets: [
        { x: 60, w: 14, lbl: "SYN" },
        { x: 78, w: 14, lbl: "ACK" },
        { x: 100, w: 28, lbl: "GET /" },
        { x: 138, w: 50, lbl: "HTML" },
        { x: 195, w: 28, lbl: "GET css" },
        { x: 230, w: 40, lbl: "CSS" },
        { x: 280, w: 28, lbl: "GET js" },
        { x: 315, w: 50, lbl: "JS" },
      ],
      note: "seriell — hver request venter på forrige",
    },
    {
      label: "HTTP/2",
      cls: "fill-brand/25 stroke-brand",
      packets: [
        { x: 60, w: 14, lbl: "SYN" },
        { x: 78, w: 14, lbl: "TLS" },
        { x: 100, w: 24, lbl: "GET×3" },
        { x: 132, w: 60, lbl: "HTML | CSS | JS multiplekset" },
      ],
      note: "én forbindelse, mange streams parallelt",
    },
    {
      label: "HTTP/3",
      cls: "fill-success/25 stroke-success",
      packets: [
        { x: 60, w: 30, lbl: "QUIC+TLS+GET×3" },
        { x: 100, w: 70, lbl: "HTML | CSS | JS uavhengige" },
      ],
      note: "0-1 RTT setup, ingen TCP-HoL",
    },
  ];
  return (
    <svg viewBox="0 0 460 200" className="w-full h-auto">
      <text
        x={230}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        vg.no — pakke-strøm per HTTP-versjon (samme side)
      </text>
      {rows.map((r, i) => {
        const y = 40 + i * 50;
        return (
          <g key={r.label}>
            <text x={10} y={y + 4} className="fill-foreground text-[10px] font-semibold">
              {r.label}
            </text>
            <line
              x1={50}
              y1={y}
              x2={440}
              y2={y}
              className="stroke-border"
              strokeWidth={0.8}
              strokeDasharray="2 3"
            />
            {r.packets.map((p, j) => (
              <g key={j}>
                <rect
                  x={p.x}
                  y={y - 8}
                  width={p.w}
                  height={16}
                  rx={2}
                  className={r.cls}
                  strokeWidth={1}
                />
                <text
                  x={p.x + p.w / 2}
                  y={y + 3}
                  textAnchor="middle"
                  className="fill-foreground text-[7px] font-mono"
                >
                  {p.lbl}
                </text>
              </g>
            ))}
            <text x={50} y={y + 23} className="fill-muted-foreground text-[8px] italic">
              {r.note}
            </text>
          </g>
        );
      })}
      <line x1={50} y1={195} x2={440} y2={195} className="stroke-foreground/40" strokeWidth={1} />
      <polygon points="440,195 432,191 432,199" className="fill-foreground/40" />
      <text x={245} y={188} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        tid →
      </text>
    </svg>
  );
}

function DnsRecordCardsSvg() {
  const cards = [
    {
      type: "A",
      color: "fill-brand/20 stroke-brand",
      text: "fill-brand",
      ex: "finn.no → 213.236.x.x",
    },
    { type: "AAAA", color: "fill-brand/15 stroke-brand", text: "fill-brand", ex: "IPv6-adresse" },
    {
      type: "CNAME",
      color: "fill-purple-500/15 stroke-purple-500",
      text: "fill-purple-700 dark:fill-purple-400",
      ex: "shop → cdn.com",
    },
    {
      type: "MX",
      color: "fill-success/15 stroke-success",
      text: "fill-success",
      ex: "10 mail.uit.no",
    },
    {
      type: "TXT",
      color: "fill-amber-500/15 stroke-amber-500",
      text: "fill-amber-700 dark:fill-amber-400",
      ex: "v=spf1 ...",
    },
    {
      type: "NS",
      color: "fill-cyan-500/15 stroke-cyan-500",
      text: "fill-cyan-700 dark:fill-cyan-400",
      ex: "ns1.norid.no",
    },
    {
      type: "SOA",
      color: "fill-rose-500/15 stroke-rose-500",
      text: "fill-rose-700 dark:fill-rose-400",
      ex: "sone-meta",
    },
    {
      type: "PTR",
      color: "fill-indigo-500/15 stroke-indigo-500",
      text: "fill-indigo-700 dark:fill-indigo-400",
      ex: "IP → navn",
    },
  ];
  return (
    <svg viewBox="0 0 480 220" className="w-full h-auto">
      <text
        x={240}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        DNS-record-typer som visuelle kort
      </text>
      {cards.map((c, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = 20 + col * 115;
        const y = 30 + row * 92;
        return (
          <g key={c.type}>
            <rect
              x={x}
              y={y}
              width={100}
              height={78}
              rx={6}
              className={c.color}
              strokeWidth={1.5}
            />
            <text
              x={x + 50}
              y={y + 28}
              textAnchor="middle"
              className={`${c.text} text-[18px] font-bold font-mono`}
            >
              {c.type}
            </text>
            <line
              x1={x + 12}
              y1={y + 38}
              x2={x + 88}
              y2={y + 38}
              className="stroke-border"
              strokeWidth={0.6}
            />
            <text x={x + 50} y={y + 56} textAnchor="middle" className="fill-foreground text-[9px]">
              eksempel:
            </text>
            <text
              x={x + 50}
              y={y + 70}
              textAnchor="middle"
              className="fill-muted-foreground text-[8px] font-mono"
            >
              {c.ex}
            </text>
          </g>
        );
      })}
      <text x={240} y={216} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        samme navn kan ha flere record-typer — hver svarer på sitt eget spørsmål
      </text>
    </svg>
  );
}

function PortNumbersGridSvg() {
  const ports = [
    { p: "22", name: "SSH", icon: "lock", color: "fill-success/20 stroke-success" },
    { p: "25", name: "SMTP", icon: "mail", color: "fill-brand/20 stroke-brand" },
    { p: "53", name: "DNS", icon: "compass", color: "fill-purple-500/20 stroke-purple-500" },
    { p: "80", name: "HTTP", icon: "globe", color: "fill-amber-500/20 stroke-amber-500" },
    { p: "110", name: "POP3", icon: "inbox", color: "fill-cyan-500/20 stroke-cyan-500" },
    { p: "143", name: "IMAP", icon: "inbox", color: "fill-cyan-500/20 stroke-cyan-500" },
    { p: "443", name: "HTTPS", icon: "shield", color: "fill-success/20 stroke-success" },
    { p: "587", name: "SMTP-sub", icon: "mail", color: "fill-brand/20 stroke-brand" },
    { p: "993", name: "IMAPS", icon: "shield", color: "fill-success/20 stroke-success" },
    { p: "995", name: "POP3S", icon: "shield", color: "fill-success/20 stroke-success" },
  ];
  function renderIcon(icon: string, cx: number, cy: number) {
    switch (icon) {
      case "lock":
        return (
          <g key={`${cx}-${cy}`}>
            <rect x={cx - 5} y={cy - 2} width={10} height={8} rx={1} className="fill-foreground" />
            <path
              d={`M${cx - 3} ${cy - 2} v-3 a3 3 0 0 1 6 0 v3`}
              className="fill-none stroke-foreground"
              strokeWidth={1.2}
            />
          </g>
        );
      case "mail":
        return (
          <g>
            <rect
              x={cx - 7}
              y={cy - 4}
              width={14}
              height={10}
              rx={1}
              className="fill-none stroke-foreground"
              strokeWidth={1.2}
            />
            <path
              d={`M${cx - 7} ${cy - 4} L${cx} ${cy + 2} L${cx + 7} ${cy - 4}`}
              className="fill-none stroke-foreground"
              strokeWidth={1.2}
            />
          </g>
        );
      case "compass":
        return (
          <g>
            <circle
              cx={cx}
              cy={cy + 1}
              r={6}
              className="fill-none stroke-foreground"
              strokeWidth={1.2}
            />
            <path
              d={`M${cx - 3} ${cy + 4} L${cx} ${cy - 2} L${cx + 3} ${cy + 4} Z`}
              className="fill-foreground"
            />
          </g>
        );
      case "globe":
        return (
          <g>
            <circle
              cx={cx}
              cy={cy + 1}
              r={6}
              className="fill-none stroke-foreground"
              strokeWidth={1.2}
            />
            <line
              x1={cx - 6}
              y1={cy + 1}
              x2={cx + 6}
              y2={cy + 1}
              className="stroke-foreground"
              strokeWidth={1}
            />
            <ellipse
              cx={cx}
              cy={cy + 1}
              rx={3}
              ry={6}
              className="fill-none stroke-foreground"
              strokeWidth={1}
            />
          </g>
        );
      case "inbox":
        return (
          <g>
            <path
              d={`M${cx - 7} ${cy} L${cx - 7} ${cy + 6} L${cx + 7} ${cy + 6} L${cx + 7} ${cy}`}
              className="fill-none stroke-foreground"
              strokeWidth={1.2}
            />
            <path
              d={`M${cx - 7} ${cy} L${cx - 4} ${cy - 4} L${cx + 4} ${cy - 4} L${cx + 7} ${cy}`}
              className="fill-none stroke-foreground"
              strokeWidth={1.2}
            />
          </g>
        );
      case "shield":
        return (
          <g>
            <path
              d={`M${cx} ${cy - 5} L${cx + 6} ${cy - 2} L${cx + 6} ${cy + 3} Q${cx + 6} ${cy + 6} ${cx} ${cy + 7} Q${cx - 6} ${cy + 6} ${cx - 6} ${cy + 3} L${cx - 6} ${cy - 2} Z`}
              className="fill-none stroke-foreground"
              strokeWidth={1.2}
            />
          </g>
        );
    }
    return null;
  }
  return (
    <svg viewBox="0 0 500 200" className="w-full h-auto">
      <text
        x={250}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Port-numre du må kunne — ikon-grid
      </text>
      {ports.map((p, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const x = 20 + col * 95;
        const y = 30 + row * 80;
        return (
          <g key={p.p}>
            <rect x={x} y={y} width={80} height={66} rx={6} className={p.color} strokeWidth={1.5} />
            <g transform={`translate(${x + 40} ${y + 22})`}>{renderIcon(p.icon, 0, 0)}</g>
            <text
              x={x + 40}
              y={y + 50}
              textAnchor="middle"
              className="fill-foreground text-[12px] font-bold font-mono"
            >
              {p.p}
            </text>
            <text
              x={x + 40}
              y={y + 61}
              textAnchor="middle"
              className="fill-muted-foreground text-[8px]"
            >
              {p.name}
            </text>
          </g>
        );
      })}
      <text x={250} y={195} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        ports 0–1023 er well-known — reservert for kjente tjenester
      </text>
    </svg>
  );
}

function FiveMinAnchorGridSvg() {
  const items = [
    { lbl: "App-protokoll = meldingsformat + rekkefølge", icon: "msg" },
    { lbl: "HTTP request/response, stateless", icon: "req" },
    { lbl: "HTTP/1.1→2→3: fjerner HoL i 2 steg", icon: "steps" },
    { lbl: "Non-persistent: 2N·RTT", icon: "calc" },
    { lbl: "DNS: lokal → root → TLD → auth", icon: "tree" },
    { lbl: "Record: A/AAAA/CNAME/MX/TXT/NS/SOA", icon: "tag" },
    { lbl: "SMTP send 25/587, IMAP 143/993", icon: "mail" },
    { lbl: "P2P: T = max(F/u_s, NF/Σu_i)", icon: "p2p" },
    { lbl: "DASH = manifest + segmenter + ABR", icon: "video" },
    { lbl: "CDN: edge nær bruker via DNS", icon: "cdn" },
    { lbl: "Socket = IP+port; TCP=stream, UDP=datagram", icon: "socket" },
    { lbl: "4-tuppel = (lokalIP, lokalport, eksternIP, eksternport)", icon: "tuple" },
    { lbl: "Klient-server skalerer vha duplisering", icon: "scale" },
    { lbl: "Sanntid (WebRTC) = UDP+SRTP, ikke TCP", icon: "fast" },
    { lbl: "Port = prosess; IP = host", icon: "addr" },
  ];
  return (
    <svg viewBox="0 0 600 380" className="w-full h-auto">
      <text
        x={300}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        5-minutter-anker — 15 ikon-kort
      </text>
      {items.map((it, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 20 + col * 195;
        const y = 30 + row * 68;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={180}
              height={56}
              rx={6}
              className="fill-indigo-500/10 stroke-indigo-500/60"
              strokeWidth={1.2}
            />
            <circle
              cx={x + 22}
              cy={y + 28}
              r={14}
              className="fill-indigo-500/25 stroke-indigo-500"
              strokeWidth={1.2}
            />
            <text
              x={x + 22}
              y={y + 32}
              textAnchor="middle"
              className="fill-indigo-700 dark:fill-indigo-300 text-[10px] font-bold font-mono"
            >
              {i + 1}
            </text>
            <text x={x + 44} y={y + 24} className="fill-foreground text-[8.5px] font-semibold">
              {it.lbl.length > 28 ? it.lbl.slice(0, 26) + "…" : it.lbl}
            </text>
            <text x={x + 44} y={y + 38} className="fill-muted-foreground text-[8px]">
              {it.lbl.length > 28 ? it.lbl.slice(26) : ""}
            </text>
            <text x={x + 44} y={y + 48} className="fill-muted-foreground text-[7.5px] italic">
              [{it.icon}]
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function FallgruvIconSvg({
  kind,
}: {
  kind: "dns" | "stateful" | "cache" | "https" | "smtp" | "p2p";
}) {
  // Liten 80×60 illustrasjon per fallgruve
  const common = "w-full h-auto";
  switch (kind) {
    case "dns":
      return (
        <svg viewBox="0 0 120 60" className={common}>
          <text
            x={6}
            y={10}
            className="fill-rose-700 dark:fill-rose-400 text-[7px] uppercase font-semibold"
          >
            ikke ett oppslag — fire hopp
          </text>
          {[
            { x: 10, l: "klient" },
            { x: 38, l: "resolver" },
            { x: 66, l: "root" },
            { x: 92, l: "TLD" },
            { x: 114, l: "auth" },
          ].map((n, i) => (
            <g key={i}>
              <circle
                cx={n.x}
                cy={32}
                r={4}
                className="fill-rose-500/30 stroke-rose-500"
                strokeWidth={1}
              />
              <text x={n.x} y={50} textAnchor="middle" className="fill-muted-foreground text-[5px]">
                {n.l}
              </text>
              {i < 4 && (
                <line
                  x1={n.x + 4}
                  y1={32}
                  x2={[38, 66, 92, 114][i] - 4}
                  y2={32}
                  className="stroke-rose-500"
                  strokeWidth={0.7}
                />
              )}
            </g>
          ))}
        </svg>
      );
    case "stateful":
      return (
        <svg viewBox="0 0 120 60" className={common}>
          <text
            x={6}
            y={10}
            className="fill-rose-700 dark:fill-rose-400 text-[7px] uppercase font-semibold"
          >
            server husker ingenting
          </text>
          <rect
            x={10}
            y={20}
            width={26}
            height={28}
            rx={3}
            className="fill-rose-500/15 stroke-rose-500"
            strokeWidth={1}
          />
          <text x={23} y={32} textAnchor="middle" className="fill-foreground text-[6px]">
            klient
          </text>
          <text x={23} y={42} textAnchor="middle" className="fill-foreground text-[5px] font-mono">
            🍪 sid
          </text>
          <line x1={36} y1={34} x2={84} y2={34} className="stroke-rose-500" strokeWidth={1} />
          <rect
            x={84}
            y={20}
            width={26}
            height={28}
            rx={3}
            className="fill-muted/30 stroke-border"
            strokeWidth={1}
          />
          <text x={97} y={36} textAnchor="middle" className="fill-foreground text-[6px]">
            server
          </text>
          <text
            x={97}
            y={44}
            textAnchor="middle"
            className="fill-muted-foreground text-[5px] italic"
          >
            (blank)
          </text>
        </svg>
      );
    case "cache":
      return (
        <svg viewBox="0 0 120 60" className={common}>
          <text
            x={6}
            y={10}
            className="fill-rose-700 dark:fill-rose-400 text-[7px] uppercase font-semibold"
          >
            3 forskjellige cacher
          </text>
          {[
            { x: 14, l: "browser", c: "fill-amber-500/30 stroke-amber-500" },
            { x: 56, l: "proxy", c: "fill-purple-500/30 stroke-purple-500" },
            { x: 98, l: "CDN", c: "fill-success/30 stroke-success" },
          ].map((b, i) => (
            <g key={i}>
              <rect
                x={b.x - 14}
                y={22}
                width={28}
                height={20}
                rx={3}
                className={b.c}
                strokeWidth={1}
              />
              <text x={b.x} y={34} textAnchor="middle" className="fill-foreground text-[6px]">
                {b.l}
              </text>
              <text x={b.x} y={52} textAnchor="middle" className="fill-muted-foreground text-[5px]">
                {["privat", "delt", "leverandør"][i]}
              </text>
            </g>
          ))}
        </svg>
      );
    case "https":
      return (
        <svg viewBox="0 0 120 60" className={common}>
          <text
            x={6}
            y={10}
            className="fill-rose-700 dark:fill-rose-400 text-[7px] uppercase font-semibold"
          >
            HTTPS = HTTP / TLS / TCP
          </text>
          {[
            { y: 16, l: "HTTP (samme meldinger)", c: "fill-brand/25 stroke-brand" },
            { y: 28, l: "TLS (krypterer)", c: "fill-purple-500/25 stroke-purple-500" },
            { y: 40, l: "TCP", c: "fill-success/25 stroke-success" },
          ].map((b, i) => (
            <g key={i}>
              <rect x={12} y={b.y} width={96} height={10} rx={2} className={b.c} strokeWidth={1} />
              <text x={60} y={b.y + 7} textAnchor="middle" className="fill-foreground text-[6px]">
                {b.l}
              </text>
            </g>
          ))}
        </svg>
      );
    case "smtp":
      return (
        <svg viewBox="0 0 120 60" className={common}>
          <text
            x={6}
            y={10}
            className="fill-rose-700 dark:fill-rose-400 text-[7px] uppercase font-semibold"
          >
            SMTP sender, IMAP henter
          </text>
          <rect
            x={10}
            y={20}
            width={22}
            height={20}
            rx={2}
            className="fill-rose-500/20 stroke-rose-500"
            strokeWidth={1}
          />
          <text x={21} y={32} textAnchor="middle" className="fill-foreground text-[6px]">
            Ola
          </text>
          <rect
            x={50}
            y={20}
            width={22}
            height={20}
            rx={2}
            className="fill-success/20 stroke-success"
            strokeWidth={1}
          />
          <text x={61} y={32} textAnchor="middle" className="fill-foreground text-[6px]">
            server
          </text>
          <rect
            x={90}
            y={20}
            width={22}
            height={20}
            rx={2}
            className="fill-brand/20 stroke-brand"
            strokeWidth={1}
          />
          <text x={101} y={32} textAnchor="middle" className="fill-foreground text-[6px]">
            Kari
          </text>
          <line x1={32} y1={30} x2={50} y2={30} className="stroke-success" strokeWidth={1} />
          <text x={41} y={49} textAnchor="middle" className="fill-success text-[5px]">
            SMTP →
          </text>
          <line x1={90} y1={30} x2={72} y2={30} className="stroke-brand" strokeWidth={1} />
          <text x={81} y={49} textAnchor="middle" className="fill-brand text-[5px]">
            ← IMAP
          </text>
        </svg>
      );
    case "p2p":
      return (
        <svg viewBox="0 0 120 60" className={common}>
          <text
            x={6}
            y={10}
            className="fill-rose-700 dark:fill-rose-400 text-[7px] uppercase font-semibold"
          >
            P2P er ikke alltid raskest
          </text>
          {[
            { x: 25, y: 32, r: 5, c: "fill-success/30 stroke-success", l: "server" },
            { x: 70, y: 24, r: 3, c: "fill-rose-500/30 stroke-rose-500", l: "p" },
            { x: 85, y: 32, r: 3, c: "fill-rose-500/30 stroke-rose-500", l: "p" },
            { x: 95, y: 44, r: 3, c: "fill-rose-500/30 stroke-rose-500", l: "p" },
            { x: 70, y: 44, r: 3, c: "fill-rose-500/30 stroke-rose-500", l: "p" },
          ].map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={p.r} className={p.c} strokeWidth={1} />
          ))}
          <text x={25} y={48} textAnchor="middle" className="fill-foreground text-[5px]">
            full kapasitet
          </text>
          <text
            x={82}
            y={56}
            textAnchor="middle"
            className="fill-muted-foreground text-[5px] italic"
          >
            fersk fil = lite swarm
          </text>
        </svg>
      );
  }
}

function ArchComparisonVisualSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={250}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Klient-server vs P2P — to konkrete nettverks-tegninger
      </text>
      {/* Venstre side: klient-server med nrk.no som server */}
      <text
        x={120}
        y={36}
        textAnchor="middle"
        className="fill-success text-[10px] uppercase tracking-wider font-semibold"
      >
        Klient-server (nrk.no)
      </text>
      <rect
        x={90}
        y={45}
        width={60}
        height={32}
        rx={4}
        className="fill-success/25 stroke-success"
        strokeWidth={1.5}
      />
      <text x={120} y={61} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        nrk-server
      </text>
      <text x={120} y={72} textAnchor="middle" className="fill-muted-foreground text-[7px]">
        Oslo
      </text>
      {[
        { x: 40, y: 130, l: "Tromsø" },
        { x: 95, y: 165, l: "Bergen" },
        { x: 145, y: 165, l: "Stavanger" },
        { x: 200, y: 130, l: "Trondheim" },
        { x: 40, y: 195, l: "Bodø" },
        { x: 200, y: 195, l: "Kr.sand" },
      ].map((k, i) => (
        <g key={i}>
          <circle cx={k.x} cy={k.y} r={8} className="fill-brand/30 stroke-brand" strokeWidth={1} />
          <text x={k.x} y={k.y + 2} textAnchor="middle" className="fill-foreground text-[7px]">
            K{i + 1}
          </text>
          <text
            x={k.x}
            y={k.y + 17}
            textAnchor="middle"
            className="fill-muted-foreground text-[6px]"
          >
            {k.l}
          </text>
          <line
            x1={k.x}
            y1={k.y - 6}
            x2={120}
            y2={75}
            className="stroke-success/50"
            strokeWidth={0.7}
          />
        </g>
      ))}
      <text x={120} y={215} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        all trafikk gjennom Oslo
      </text>

      {/* Skille */}
      <line x1={250} y1={30} x2={250} y2={215} className="stroke-border" strokeDasharray="3 3" />

      {/* Høyre side: P2P-swarm */}
      <text
        x={380}
        y={36}
        textAnchor="middle"
        className="fill-purple-700 dark:fill-purple-400 text-[10px] uppercase tracking-wider font-semibold"
      >
        P2P (BitTorrent linux.iso)
      </text>
      {[
        { x: 300, y: 70, l: "Tromsø" },
        { x: 380, y: 60, l: "Trondheim" },
        { x: 460, y: 70, l: "Oslo" },
        { x: 320, y: 130, l: "Bergen" },
        { x: 440, y: 130, l: "Stavanger" },
        { x: 340, y: 180, l: "Bodø" },
        { x: 420, y: 180, l: "Kr.sand" },
      ].map((p, i) => (
        <g key={i}>
          <circle
            cx={p.x}
            cy={p.y}
            r={9}
            className="fill-purple-500/30 stroke-purple-500"
            strokeWidth={1}
          />
          <text x={p.x} y={p.y + 3} textAnchor="middle" className="fill-foreground text-[7px]">
            P{i + 1}
          </text>
          <text
            x={p.x}
            y={p.y + 19}
            textAnchor="middle"
            className="fill-muted-foreground text-[6px]"
          >
            {p.l}
          </text>
        </g>
      ))}
      {(() => {
        const peers: [number, number][] = [
          [300, 70],
          [380, 60],
          [460, 70],
          [320, 130],
          [440, 130],
          [340, 180],
          [420, 180],
        ];
        const lines: React.ReactElement[] = [];
        for (let i = 0; i < peers.length; i++) {
          for (let j = i + 1; j < peers.length; j++) {
            lines.push(
              <line
                key={`${i}-${j}`}
                x1={peers[i][0]}
                y1={peers[i][1]}
                x2={peers[j][0]}
                y2={peers[j][1]}
                className="stroke-purple-500/30"
                strokeWidth={0.5}
              />,
            );
          }
        }
        return lines;
      })()}
      <text x={380} y={215} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        alle deler direkte med alle
      </text>
    </svg>
  );
}

function DnsCacheTreeSvg() {
  // Tre-struktur som viser hva en lokal resolver typisk har cached
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={250}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Lokal resolver-cache som tre (UiT-resolver mandag morgen)
      </text>
      {/* Root */}
      <rect
        x={210}
        y={30}
        width={80}
        height={26}
        rx={4}
        className="fill-success/20 stroke-success"
        strokeWidth={1.5}
      />
      <text x={250} y={47} textAnchor="middle" className="fill-foreground text-[10px] font-mono">
        . (root)
      </text>
      <text x={295} y={48} className="fill-muted-foreground text-[8px]">
        TTL: 5d
      </text>
      {/* TLDs */}
      {[
        { x: 90, l: ".no", ttl: "23h" },
        { x: 250, l: ".com", ttl: "12h" },
        { x: 410, l: ".org", ttl: "8h" },
      ].map((t, i) => (
        <g key={i}>
          <line
            x1={250}
            y1={56}
            x2={t.x}
            y2={75}
            className="stroke-foreground/40"
            strokeWidth={1}
          />
          <rect
            x={t.x - 35}
            y={75}
            width={70}
            height={22}
            rx={4}
            className="fill-brand/15 stroke-brand"
            strokeWidth={1}
          />
          <text x={t.x} y={89} textAnchor="middle" className="fill-foreground text-[9px] font-mono">
            {t.l}
          </text>
          <text x={t.x + 40} y={90} className="fill-muted-foreground text-[7px]">
            {t.ttl}
          </text>
        </g>
      ))}
      {/* Sub-domains */}
      {[
        { px: 90, x: 40, l: "uit.no", ttl: "45m" },
        { px: 90, x: 130, l: "vg.no", ttl: "20m" },
        { px: 250, x: 200, l: "github.com", ttl: "55m" },
        { px: 250, x: 290, l: "google.com", ttl: "3m" },
        { px: 410, x: 380, l: "wikipedia.org", ttl: "40m" },
        { px: 410, x: 470, l: "norid.org", ttl: "1h" },
      ].map((s, i) => (
        <g key={i}>
          <line
            x1={s.px}
            y1={97}
            x2={s.x}
            y2={115}
            className="stroke-foreground/40"
            strokeWidth={1}
          />
          <rect
            x={s.x - 35}
            y={115}
            width={70}
            height={22}
            rx={3}
            className="fill-amber-500/15 stroke-amber-500"
            strokeWidth={1}
          />
          <text
            x={s.x}
            y={128}
            textAnchor="middle"
            className="fill-foreground text-[8px] font-mono"
          >
            {s.l}
          </text>
          <text x={s.x} y={147} textAnchor="middle" className="fill-muted-foreground text-[7px]">
            TTL: {s.ttl}
          </text>
        </g>
      ))}
      {/* Leaves: A-records */}
      {[
        { px: 40, x: 30, l: "www" },
        { px: 40, x: 70, l: "mail" },
        { px: 200, x: 175, l: "api" },
        { px: 290, x: 290, l: "(utgått)", expired: true },
      ].map((leaf, i) => (
        <g key={i}>
          <line
            x1={leaf.px}
            y1={137}
            x2={leaf.x}
            y2={165}
            className="stroke-foreground/30"
            strokeWidth={0.7}
          />
          <circle
            cx={leaf.x}
            cy={172}
            r={9}
            className={
              leaf.expired ? "fill-rose-500/20 stroke-rose-500" : "fill-success/20 stroke-success"
            }
            strokeWidth={1}
          />
          <text x={leaf.x} y={175} textAnchor="middle" className="fill-foreground text-[7px]">
            {leaf.l}
          </text>
        </g>
      ))}
      <text x={250} y={210} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        grønt = gyldig A-record, rødt = utgått (må refreshes). Jo dypere, jo kortere TTL typisk.
      </text>
    </svg>
  );
}

function DnsLookupTimelineSvg() {
  // Example-timeline: oppslag av finn.no
  const steps = [
    { t: 0, lbl: "0 ms", desc: "klient → resolver", color: "fill-brand stroke-brand" },
    {
      t: 1,
      lbl: "5 ms",
      desc: "resolver: cache-miss → root",
      color: "fill-amber-500 stroke-amber-500",
    },
    { t: 2, lbl: "25 ms", desc: "root → .no NS", color: "fill-amber-500 stroke-amber-500" },
    { t: 3, lbl: "45 ms", desc: ".no → finn.no NS", color: "fill-amber-500 stroke-amber-500" },
    {
      t: 4,
      lbl: "70 ms",
      desc: "finn.no NS → A 213.236.x.x",
      color: "fill-success stroke-success",
    },
    {
      t: 5,
      lbl: "75 ms",
      desc: "resolver → klient (cached)",
      color: "fill-success stroke-success",
    },
  ];
  return (
    <svg viewBox="0 0 500 180" className="w-full h-auto">
      <text
        x={250}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        DNS-oppslag for finn.no — første gang (75 ms total)
      </text>
      <line x1={30} y1={100} x2={470} y2={100} className="stroke-foreground/40" strokeWidth={1.5} />
      <polygon points="470,100 462,96 462,104" className="fill-foreground/40" />
      {steps.map((s, i) => {
        const x = 50 + i * 78;
        return (
          <g key={i}>
            <circle cx={x} cy={100} r={6} className={s.color} strokeWidth={1.5} />
            <text
              x={x}
              y={104}
              textAnchor="middle"
              className="fill-foreground text-[7px] font-bold"
            >
              {i + 1}
            </text>
            <text
              x={x}
              y={84}
              textAnchor="middle"
              className="fill-foreground text-[8px] font-mono font-semibold"
            >
              {s.lbl}
            </text>
            <text
              x={x}
              y={i % 2 === 0 ? 125 : 145}
              textAnchor="middle"
              className="fill-muted-foreground text-[7.5px]"
            >
              {s.desc.split(" → ")[0]}
            </text>
            <text
              x={x}
              y={i % 2 === 0 ? 137 : 157}
              textAnchor="middle"
              className="fill-muted-foreground text-[7.5px]"
            >
              {s.desc.includes(" → ") ? "→ " + s.desc.split(" → ")[1] : ""}
            </text>
          </g>
        );
      })}
      <text x={250} y={172} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        Neste oppslag av finn.no innen TTL: ~1 ms (resolver-cache treff)
      </text>
    </svg>
  );
}

function HttpCachingTimelineSvg() {
  return (
    <svg viewBox="0 0 500 200" className="w-full h-auto">
      <text
        x={250}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        GET /style.css mot vg.no — første besøk vs gjenbesøk
      </text>
      {/* Første besøk */}
      <text x={20} y={36} className="fill-brand text-[10px] uppercase tracking-wider font-semibold">
        første besøk
      </text>
      <line x1={70} y1={50} x2={70} y2={90} className="stroke-foreground/40" strokeWidth={1} />
      <line x1={430} y1={50} x2={430} y2={90} className="stroke-foreground/40" strokeWidth={1} />
      <text x={70} y={47} textAnchor="middle" className="fill-foreground text-[8px]">
        nettleser
      </text>
      <text x={430} y={47} textAnchor="middle" className="fill-foreground text-[8px]">
        vg.no
      </text>
      <line x1={70} y1={60} x2={430} y2={70} className="stroke-brand" strokeWidth={1.2} />
      <polygon points="430,70 422,66 422,74" className="fill-brand" />
      <text x={250} y={57} textAnchor="middle" className="fill-foreground text-[8px]">
        GET /style.css
      </text>
      <line x1={430} y1={80} x2={70} y2={88} className="stroke-success" strokeWidth={1.2} />
      <polygon points="70,88 78,84 78,92" className="fill-success" />
      <text x={250} y={77} textAnchor="middle" className="fill-success text-[8px]">
        200 OK + ETag "x7q" + 80 kB body
      </text>

      {/* Linje */}
      <line x1={15} y1={102} x2={485} y2={102} className="stroke-border" strokeDasharray="3 3" />

      {/* Gjenbesøk */}
      <text
        x={20}
        y={120}
        className="fill-success text-[10px] uppercase tracking-wider font-semibold"
      >
        gjenbesøk (cache hit / 304)
      </text>
      <line x1={70} y1={134} x2={70} y2={185} className="stroke-foreground/40" strokeWidth={1} />
      <line x1={430} y1={134} x2={430} y2={185} className="stroke-foreground/40" strokeWidth={1} />
      <line x1={70} y1={144} x2={430} y2={154} className="stroke-brand" strokeWidth={1.2} />
      <polygon points="430,154 422,150 422,158" className="fill-brand" />
      <text x={250} y={141} textAnchor="middle" className="fill-foreground text-[8px]">
        GET /style.css + If-None-Match: "x7q"
      </text>
      <line x1={430} y1={166} x2={70} y2={172} className="stroke-success" strokeWidth={1.2} />
      <polygon points="70,172 78,168 78,176" className="fill-success" />
      <text x={250} y={163} textAnchor="middle" className="fill-success text-[8px]">
        304 Not Modified (~150 byte, ingen body)
      </text>
      <text x={250} y={192} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        Conditional GET → server-svaret krymper fra 80 kB til 150 byte
      </text>
    </svg>
  );
}

function CdnNorgeKartSvg() {
  return (
    <svg viewBox="0 0 360 320" className="w-full h-auto">
      <text
        x={180}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        CDN-edge-noder i Norge (forenklet kart)
      </text>
      {/* Forenklet Norge-omriss */}
      <path
        d="M 180 30 Q 200 50 195 70 Q 210 90 205 110 Q 220 130 210 155 Q 230 175 220 200 Q 240 220 225 245 Q 200 270 175 290 Q 160 305 145 295 Q 130 280 135 260 Q 120 240 130 220 Q 110 200 120 180 Q 100 165 115 145 Q 100 125 115 105 Q 105 85 125 70 Q 115 50 140 35 Q 160 25 180 30 Z"
        className="fill-card stroke-border"
        strokeWidth={1.2}
      />
      {/* Origin (utenfor Norge) */}
      <rect
        x={290}
        y={150}
        width={60}
        height={28}
        rx={4}
        className="fill-success/20 stroke-success"
        strokeWidth={1.5}
      />
      <text
        x={320}
        y={167}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-semibold"
      >
        origin
      </text>
      <text x={320} y={177} textAnchor="middle" className="fill-muted-foreground text-[7px]">
        Dublin
      </text>
      {/* Edge-noder i norske byer */}
      {[
        { x: 165, y: 62, l: "Tromsø", users: 4 },
        { x: 155, y: 110, l: "Bodø", users: 2 },
        { x: 160, y: 155, l: "Trondheim", users: 5 },
        { x: 150, y: 205, l: "Bergen", users: 6 },
        { x: 175, y: 245, l: "Stavanger", users: 4 },
        { x: 195, y: 235, l: "Kristiansand", users: 3 },
        { x: 200, y: 220, l: "Oslo", users: 8 },
      ].map((c, i) => (
        <g key={i}>
          {/* Linje fra origin */}
          <line
            x1={290}
            y1={164}
            x2={c.x}
            y2={c.y}
            className="stroke-muted-foreground/30"
            strokeWidth={0.6}
            strokeDasharray="2 2"
          />
          {/* Edge */}
          <rect
            x={c.x - 14}
            y={c.y - 6}
            width={28}
            height={14}
            rx={2}
            className="fill-amber-500/25 stroke-amber-500"
            strokeWidth={1}
          />
          <text
            x={c.x}
            y={c.y + 4}
            textAnchor="middle"
            className="fill-foreground text-[7px] font-bold"
          >
            edge
          </text>
          <text x={c.x} y={c.y + 18} textAnchor="middle" className="fill-foreground text-[7px]">
            {c.l}
          </text>
          {/* Brukere */}
          {Array.from({ length: c.users }).map((_, j) => {
            const angle = (j / c.users) * Math.PI * 2;
            const ux = c.x + Math.cos(angle) * 16;
            const uy = c.y + 6 + Math.sin(angle) * 10;
            return <circle key={j} cx={ux} cy={uy} r={1.5} className="fill-brand" />;
          })}
        </g>
      ))}
      <text x={180} y={310} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        Hver edge serverer lokale brukere; origin holdes utenom for varme objekter
      </text>
    </svg>
  );
}

function SocketStateFlowSvg() {
  // Mer detaljert flow-chart enn SocketStateSvg
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Socket-tilstander som flytdiagram — server- og klient-side
      </text>
      {/* Server side */}
      <text
        x={100}
        y={36}
        textAnchor="middle"
        className="fill-brand text-[9px] uppercase tracking-wider font-semibold"
      >
        Server
      </text>
      {[
        { y: 50, lbl: "socket()", state: "CLOSED" },
        { y: 80, lbl: "bind()", state: "BOUND" },
        { y: 110, lbl: "listen()", state: "LISTEN" },
        { y: 140, lbl: "accept()", state: "ESTABLISHED" },
        { y: 170, lbl: "recv/send", state: "..." },
        { y: 200, lbl: "close()", state: "TIME_WAIT" },
      ].map((s, i) => (
        <g key={i}>
          <rect
            x={30}
            y={s.y}
            width={140}
            height={22}
            rx={3}
            className={
              i === 5 ? "fill-amber-500/20 stroke-amber-500" : "fill-brand/15 stroke-brand"
            }
            strokeWidth={1}
          />
          <text x={50} y={s.y + 14} className="fill-foreground text-[9px] font-mono">
            {s.lbl}
          </text>
          <text
            x={160}
            y={s.y + 14}
            textAnchor="end"
            className="fill-muted-foreground text-[8px] italic"
          >
            {s.state}
          </text>
          {i < 5 && (
            <g>
              <line
                x1={100}
                y1={s.y + 22}
                x2={100}
                y2={s.y + 30}
                className="stroke-brand"
                strokeWidth={1}
              />
              <polygon
                points={`100,${s.y + 30} 96,${s.y + 26} 104,${s.y + 26}`}
                className="fill-brand"
              />
            </g>
          )}
        </g>
      ))}

      {/* Skille */}
      <line x1={250} y1={30} x2={250} y2={230} className="stroke-border" strokeDasharray="3 3" />

      {/* Klient side */}
      <text
        x={400}
        y={36}
        textAnchor="middle"
        className="fill-success text-[9px] uppercase tracking-wider font-semibold"
      >
        Klient
      </text>
      {[
        { y: 50, lbl: "socket()", state: "CLOSED" },
        { y: 95, lbl: "connect()", state: "SYN_SENT → ESTABLISHED" },
        { y: 140, lbl: "send/recv", state: "..." },
        { y: 200, lbl: "close()", state: "FIN_WAIT" },
      ].map((s, i) => (
        <g key={i}>
          <rect
            x={330}
            y={s.y}
            width={140}
            height={22}
            rx={3}
            className={
              i === 3 ? "fill-amber-500/20 stroke-amber-500" : "fill-success/15 stroke-success"
            }
            strokeWidth={1}
          />
          <text x={350} y={s.y + 14} className="fill-foreground text-[9px] font-mono">
            {s.lbl}
          </text>
          <text
            x={460}
            y={s.y + 14}
            textAnchor="end"
            className="fill-muted-foreground text-[8px] italic"
          >
            {s.state}
          </text>
          {i < 3 && (
            <line
              x1={400}
              y1={s.y + 22}
              x2={400}
              y2={s.y + 45}
              className="stroke-success"
              strokeWidth={1}
            />
          )}
        </g>
      ))}
      <text x={250} y={232} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        Server holder lytte-socketen alive; hver accept gir en ny conn-socket
      </text>
    </svg>
  );
}

function P2PSwarmSnapshotSvg() {
  return (
    <svg viewBox="0 0 500 200" className="w-full h-auto">
      <text
        x={250}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Swarm-snapshot: hvilke biter har hver peer? (8 biter, 6 peers)
      </text>
      <text x={20} y={36} className="fill-brand text-[9px] uppercase tracking-wider font-semibold">
        Peer
      </text>
      {Array.from({ length: 8 }).map((_, i) => (
        <text
          key={i}
          x={120 + i * 35}
          y={36}
          textAnchor="middle"
          className="fill-brand text-[8px] font-mono"
        >
          bit {i + 1}
        </text>
      ))}
      <line x1={15} y1={42} x2={485} y2={42} className="stroke-border" />
      {[
        { name: "Seeder", bits: [1, 1, 1, 1, 1, 1, 1, 1], cls: "fill-success/30" },
        { name: "P1", bits: [1, 1, 1, 0, 0, 0, 0, 0], cls: "fill-brand/30" },
        { name: "P2", bits: [1, 0, 1, 1, 1, 0, 0, 0], cls: "fill-brand/30" },
        { name: "P3", bits: [0, 1, 1, 1, 0, 1, 0, 0], cls: "fill-brand/30" },
        { name: "P4 (ny)", bits: [0, 0, 0, 0, 0, 0, 0, 0], cls: "fill-amber-500/30" },
        { name: "P5", bits: [1, 1, 0, 0, 1, 1, 1, 0], cls: "fill-brand/30" },
      ].map((row, i) => {
        const y = 60 + i * 22;
        return (
          <g key={row.name}>
            <text x={20} y={y + 4} className="fill-foreground text-[9px]">
              {row.name}
            </text>
            {row.bits.map((b, j) => (
              <g key={j}>
                <rect
                  x={120 + j * 35 - 12}
                  y={y - 8}
                  width={24}
                  height={14}
                  rx={2}
                  className={b ? `${row.cls} stroke-foreground/30` : "fill-muted/30 stroke-border"}
                  strokeWidth={0.8}
                />
                <text
                  x={120 + j * 35}
                  y={y + 2}
                  textAnchor="middle"
                  className={
                    b ? "fill-foreground text-[8px] font-bold" : "fill-muted-foreground text-[8px]"
                  }
                >
                  {b ? "✓" : "·"}
                </text>
              </g>
            ))}
          </g>
        );
      })}
      <text x={250} y={195} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        Bit 8 finnes bare hos Seeder — P4 bør bruke rarest-first og hente den FØRST
      </text>
    </svg>
  );
}

function HttpVersionFlowSideBySideSvg() {
  // Tre side-ved-side request/response-flyt for 1.1/2/3
  const cols = [
    {
      x: 30,
      title: "HTTP/1.1",
      color: "stroke-amber-500",
      fill: "fill-amber-500",
      events: [
        { y: 50, lbl: "TCP SYN", side: "→" },
        { y: 65, lbl: "SYN-ACK", side: "←" },
        { y: 80, lbl: "TLS hello", side: "→" },
        { y: 95, lbl: "TLS done", side: "←" },
        { y: 115, lbl: "GET 1", side: "→" },
        { y: 130, lbl: "200", side: "←" },
        { y: 150, lbl: "GET 2", side: "→" },
        { y: 165, lbl: "200", side: "←" },
        { y: 185, lbl: "GET 3", side: "→" },
        { y: 200, lbl: "200", side: "←" },
      ],
      note: "seriell — RTT × N",
    },
    {
      x: 180,
      title: "HTTP/2",
      color: "stroke-brand",
      fill: "fill-brand",
      events: [
        { y: 50, lbl: "TCP SYN", side: "→" },
        { y: 65, lbl: "SYN-ACK", side: "←" },
        { y: 80, lbl: "TLS hello", side: "→" },
        { y: 95, lbl: "TLS done", side: "←" },
        { y: 115, lbl: "GET 1+2+3", side: "→" },
        { y: 145, lbl: "stream 1", side: "←" },
        { y: 160, lbl: "stream 2", side: "←" },
        { y: 175, lbl: "stream 3", side: "←" },
      ],
      note: "multipleksing — 1 RTT app",
    },
    {
      x: 340,
      title: "HTTP/3 (QUIC)",
      color: "stroke-success",
      fill: "fill-success",
      events: [
        { y: 50, lbl: "QUIC init", side: "→" },
        { y: 70, lbl: "QUIC+TLS", side: "←" },
        { y: 90, lbl: "GET 1+2+3", side: "→" },
        { y: 120, lbl: "stream 1", side: "←" },
        { y: 135, lbl: "stream 2", side: "←" },
        { y: 150, lbl: "stream 3", side: "←" },
      ],
      note: "0-1 RTT, ingen HoL",
    },
  ];
  return (
    <svg viewBox="0 0 500 230" className="w-full h-auto">
      <text
        x={250}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        3 ressurser fra finn.no — request/response-flyt per HTTP-versjon
      </text>
      {cols.map((c) => (
        <g key={c.title}>
          <text
            x={c.x + 60}
            y={32}
            textAnchor="middle"
            className={`${c.fill} text-[10px] uppercase tracking-wider font-semibold`}
          >
            {c.title}
          </text>
          <line
            x1={c.x + 10}
            y1={40}
            x2={c.x + 10}
            y2={210}
            className="stroke-foreground/40"
            strokeWidth={1}
          />
          <line
            x1={c.x + 110}
            y1={40}
            x2={c.x + 110}
            y2={210}
            className="stroke-foreground/40"
            strokeWidth={1}
          />
          <text
            x={c.x + 10}
            y={45}
            textAnchor="middle"
            className="fill-muted-foreground text-[7px]"
          >
            klient
          </text>
          <text
            x={c.x + 110}
            y={45}
            textAnchor="middle"
            className="fill-muted-foreground text-[7px]"
          >
            server
          </text>
          {c.events.map((e, j) => {
            const fwd = e.side === "→";
            const x1 = fwd ? c.x + 10 : c.x + 110;
            const x2 = fwd ? c.x + 110 : c.x + 10;
            return (
              <g key={j}>
                <line x1={x1} y1={e.y} x2={x2} y2={e.y} className={c.color} strokeWidth={1} />
                <polygon
                  points={`${x2},${e.y} ${x2 + (fwd ? -4 : 4)},${e.y - 2} ${x2 + (fwd ? -4 : 4)},${e.y + 2}`}
                  className={c.fill}
                />
                <text
                  x={c.x + 60}
                  y={e.y - 2}
                  textAnchor="middle"
                  className="fill-foreground text-[6.5px] font-mono"
                >
                  {e.lbl}
                </text>
              </g>
            );
          })}
          <text
            x={c.x + 60}
            y={222}
            textAnchor="middle"
            className="fill-muted-foreground text-[7px] italic"
          >
            {c.note}
          </text>
        </g>
      ))}
    </svg>
  );
}
