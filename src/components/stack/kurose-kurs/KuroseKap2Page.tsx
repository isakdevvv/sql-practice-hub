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

type Tab = "intro" | "2.1" | "2.2" | "2.3" | "2.4" | "2.5" | "2.6" | "2.7";


const SECTIONS_2: SectionNavItem[] = [
  { id: "intro", label: "Start her" },
  { id: "2.1", label: "2.1 Prinsipper" },
  { id: "2.2", label: "2.2 Web & HTTP" },
  { id: "2.3", label: "2.3 DNS" },
  { id: "2.4", label: "2.4 E-post & P2P" },
  { id: "2.5", label: "2.5 Video & CDN" },
  { id: "2.6", label: "2.6 Sockets" },
  { id: "2.7", label: "2.7 Oppgaver" },
];
const NEXT_CHAPTER_2 = { slug: "kurose-kap-3", title: "Transportlaget" };

export function KuroseKap2Page() {
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
            <span>Kapittel 2 av 9</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Kap. 2 — Applikasjonslaget</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Vi går opp i toppen av stakken: hva ser applikasjons-utvikleren? Vi ser på de mest
            brukte protokollene (HTTP, DNS, SMTP), hvordan video-streaming og CDN-er fungerer, og
            hvordan du selv åpner en socket fra kode.
          </p>
        </header>

        <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border">
          <TabBtn active={tab === "intro"} onClick={() => setTab("intro")}>
            Start her
          </TabBtn>
          <TabBtn active={tab === "2.1"} onClick={() => setTab("2.1")}>
            2.1 Prinsipper
          </TabBtn>
          <TabBtn active={tab === "2.2"} onClick={() => setTab("2.2")}>
            2.2 Web &amp; HTTP
          </TabBtn>
          <TabBtn active={tab === "2.3"} onClick={() => setTab("2.3")}>
            2.3 DNS
          </TabBtn>
          <TabBtn active={tab === "2.4"} onClick={() => setTab("2.4")}>
            2.4 E-post &amp; P2P
          </TabBtn>
          <TabBtn active={tab === "2.5"} onClick={() => setTab("2.5")}>
            2.5 Video &amp; CDN
          </TabBtn>
          <TabBtn active={tab === "2.6"} onClick={() => setTab("2.6")}>
            2.6 Sockets
          </TabBtn>
          <TabBtn active={tab === "2.7"} onClick={() => setTab("2.7")}>
            2.7 Oppgaver
          </TabBtn>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "2.1" && <Section21 />}
        {tab === "2.2" && <Section22 />}
        {tab === "2.3" && <Section23 />}
        {tab === "2.4" && <Section24 />}
        {tab === "2.5" && <Section25 />}
        {tab === "2.6" && <Section26 />}
        {tab === "2.7" && <Section27 />}

        <SectionPager tabs={SECTIONS_2} current={tab} onPick={(id) => setTab(id as Tab)} nextChapter={NEXT_CHAPTER_2} />
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

      <Defs
        items={[
          {
            term: "Klient-server-arkitektur",
            body: "En server-prosess kjører hele tiden på en kjent IP og venter på henvendelser. Klient-prosesser kobler seg på når de trenger noe og kobler fra etterpå. Klientene snakker aldri direkte sammen — all kommunikasjon går via serveren. Web-banken din, Gmail-grensesnittet og de fleste tradisjonelle apper er bygd slik.",
          },
          {
            term: "P2P-arkitektur (peer-to-peer)",
            body: "Det er ingen alltid-på server. I stedet kontakter intermitterende end-hosts (peers) hverandre direkte. Skalerer godt fordi hver ny peer både bruker og gir ressurser. BitTorrent og en del distribuerte filsystemer er P2P. Ulempen er at det er vanskeligere å sikre og administrere.",
          },
          {
            term: "Hybrid-arkitektur",
            body: "Mange ekte systemer blander de to. Skype hadde sentrale login-servere men P2P-medieoverføring. Spotify har sentrale metadata-servere men deler musikk-bits delvis peer-til-peer i visse versjoner. Diskaden lærer du: arkitekturen er et spektrum, ikke et binært valg.",
          },
          {
            term: "Prosess og socket",
            body: "Programmer kommuniserer ikke direkte med hverandre — prosessene gjør det. Hver prosess sender og mottar gjennom et socket-grensesnitt: en API-dør mellom applikasjonen og transport-laget. Sockets er den eneste måten din kode rører nettverket på.",
          },
          {
            term: "Adresse + port = navngiving",
            body: "For å sende noe til en prosess på en annen maskin trenger du to ting: hvilken maskin (IP-adresse), og hvilken prosess på den maskinen (portnummer). En web-server lytter typisk på port 80 (HTTP) eller 443 (HTTPS). DNS lytter på 53. SSH på 22.",
          },
          {
            term: "Tjenester transport-laget tilbyr",
            body: "Applikasjoner velger transport-protokoll basert på fire egenskaper: pålitelig levering (kommer alle bytes fram?), throughput-garantier (minimum bps?), timing (lav forsinkelse?), og sikkerhet (kryptering?). TCP gir pålitelighet og flow-control men ingen timing-garantier; UDP gir nesten ingenting men er rask og lett. TLS legger på sikkerhet over TCP.",
          },
          {
            term: "Applikasjonslag-protokoll",
            body: "Definerer hvilke meldinger som finnes (request, response, error), hvordan de er formatert (tekst-linjer som i HTTP, eller binært som i HTTP/2), rekkefølgen de skal komme i, og hva som er semantikken. HTTP, DNS, SMTP og IMAP er alle eksempler.",
          },
        ]}
      />

      <Illustration caption="To prosesser snakker via sockets — applikasjonen bryr seg ikke om hvordan transport-laget faktisk leverer dataene.">
        <ProcessSocketSvg />
      </Illustration>

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

      <Defs
        items={[
          {
            term: "HTTP request / response",
            body: "En request består av en startlinje (metode + URL + versjon), headers (Host, User-Agent, Accept, ...) og en eventuell body. Responsen har statuslinje (versjon + kode + frase), headers (Content-Type, Content-Length, ...) og body. Tekstbasert i HTTP/1.x, binært i HTTP/2 og /3.",
          },
          {
            term: "Stateless",
            body: "Hver request behandles uavhengig — serveren glemmer alt mellom dem. Det er enkelt og skalerbart, men du trenger andre mekanismer (cookies, session-tokens) for å huske hvem brukeren er. Stateless er en bevisst designvalg, ikke en mangel.",
          },
          {
            term: "Persistent forbindelse",
            body: "I HTTP/1.0 åpnet du en ny TCP-forbindelse per request. Tre TCP-handshakes for tre bilder. HTTP/1.1 holder forbindelsen åpen som standard (Connection: keep-alive) så flere requests kan dele samme forbindelse — sparer mange RTT-er.",
          },
          {
            term: "Pipelining og head-of-line-blocking",
            body: "Pipelining lar klienten sende flere requests på rad uten å vente på svar. Problemet i HTTP/1.1: svarene må komme i samme rekkefølge — hvis bilde 1 er stort, blokkerer det bilde 2 og 3 selv om de er ferdig på serveren. HTTP/2 løser dette med multipleksing.",
          },
          {
            term: "HTTP/2",
            body: "Binær protokoll med streams: mange uavhengige request/response-par over én TCP-forbindelse, sendt om hverandre i små rammer (frames). Header-komprimering med HPACK reduserer overhead på gjentatte requests. Server push tillater serveren å sende ressurser før klienten ber om dem — i praksis lite brukt.",
          },
          {
            term: "HTTP/3 og QUIC",
            body: "HTTP/3 kjører på QUIC istedenfor TCP. QUIC er bygget på UDP og inkluderer kryptering, multipleksing og connection-migrasjon. Hovedfordelen: HTTP/2 har fortsatt TCP-nivå head-of-line-blocking (en mistet pakke holder igjen alle streams), mens QUIC har uavhengige streams også på transport-laget.",
          },
          {
            term: "Cookies",
            body: "Liten tekst-strengen serveren sender i Set-Cookie-header. Nettleseren returnerer den i Cookie-header på alle videre requests til samme domene. Dette er hvordan «innlogget»-tilstanden overlever stateless HTTP. Tredjeparts-cookies (cookies satt av annet domene enn det du besøker) brukes til kryss-side sporing og er nå begrenset i de fleste nettlesere.",
          },
        ]}
      />

      <Illustration caption="Forskjellen mellom seriell HTTP/1.1 og multiplekset HTTP/2 når en side har flere ressurser.">
        <HttpVersionsSvg />
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

      <Defs
        items={[
          {
            term: "Hierarkisk navnerom",
            body: "Domener leses fra høyre mot venstre: i www.fakultet.uit.no er .no top-level (TLD), uit er second-level, fakultet er subdomene, www er host. Ansvaret deles: TLD-servere vet hvem som vet om .no, .no-serverne vet hvem som vet om uit.no, uit sin server vet om alt under uit.no.",
          },
          {
            term: "Root-servere",
            body: "13 logiske root-servere (a.root-servers.net til m.root-servers.net), implementert som hundrevis av fysiske maskiner spredd over hele verden via anycast. De vet hvilke TLD-servere som er autoritative for hver TLD. Toppen av hele systemet.",
          },
          {
            term: "Iterativt vs rekursivt oppslag",
            body: "I et rekursivt oppslag spør klienten sin lokale DNS-server, som så gjør alt arbeidet (kontakter root, TLD, autoritativ) og leverer endelig svar tilbake. I et iterativt oppslag svarer hver mellom-server med «jeg vet ikke, men spør denne neste», og klienten følger pekerne selv. I praksis: klient → lokal resolver er rekursivt, resolver → root/TLD/auth er iterativt.",
          },
          {
            term: "Caching og TTL",
            body: "Hver record har en TTL (time-to-live) i sekunder som forteller hvor lenge svaret kan caches. En typisk A-record har TTL 300–3600 sekunder. Lokal DNS-resolver cacher svar slik at neste oppslag av samme navn er gratis. Det er denne caching-en som gjør DNS skalerbar — root-serverne ser ikke spørringer for hver eneste googling.",
          },
          {
            term: "Record-typer",
            body: "A: IPv4-adresse for et navn. AAAA: IPv6-adresse. CNAME: alias som peker til et annet navn. MX: hvilken mail-server som tar imot e-post for domenet. NS: hvilken navneserver er autoritativ for domenet. TXT: vilkårlig tekst (brukes til SPF, DKIM, domene-verifisering).",
          },
          {
            term: "Glue records og delegering",
            body: "Når .no-serveren sier «spør ns1.uit.no for uit.no», hvordan kommer du dit hvis du ikke vet IP-en til ns1.uit.no? Svaret er glue records: .no-svaret inkluderer ns1.uit.no sin IP-adresse direkte, så du slipper en sirkulær avhengighet.",
          },
        ]}
      />

      <Illustration caption="Iterativt DNS-oppslag for www.uit.no fra en lokal resolver — fire trinn, deretter cached.">
        <DnsLookupSvg />
      </Illustration>

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

      <Defs
        items={[
          {
            term: "SMTP",
            body: "Simple Mail Transfer Protocol. Den klassiske server-til-server-protokollen for å levere e-post videre. Når du sender en mail går den fra din mail-klient til din mail-server (ofte via SMTP submission, port 587), og videre til mottakerens mail-server (SMTP, port 25). Push-orientert: avsenderens server kontakter mottakerens.",
          },
          {
            term: "IMAP og POP3",
            body: "Mottakerens klient bruker IMAP (Internet Message Access Protocol, port 143/993) eller eldre POP3 for å lese sin egen postkasse fra serveren. IMAP holder meldinger på serveren og lar deg organisere dem i mapper på tvers av enheter; POP3 laster ned og sletter (typisk). Pull-orientert: klienten henter når den vil.",
          },
          {
            term: "MIME",
            body: "E-post var opprinnelig ren ASCII. MIME (Multipurpose Internet Mail Extensions) er utvidelsen som lar deg sende vedlegg, bilder, HTML-formatert tekst og ikke-engelske tegn. Base64-koding pakker binær-data inn i ASCII-tegn som SMTP kan håndtere.",
          },
          {
            term: "BitTorrent",
            body: "P2P-fildelings-protokoll. En fil deles i biter (vanligvis 256 KB hver). En tracker (eller DHT) lar peers finne hverandre. Hver peer laster ned biter den mangler og laster opp biter den har, samtidig. Resultat: jo flere som vil ha filen, jo raskere går det.",
          },
          {
            term: "Tit-for-tat",
            body: "BitTorrent-incentiv-mekanismen mot snyltere: hver peer prioriterer å sende biter til de peers som sender mest tilbake til dem. Hvis du bare laster ned uten å laste opp, blir du nedprioritert (choked). Optimistisk unchoking sender litt til tilfeldige peers så nye deltakere får sjansen til å starte.",
          },
          {
            term: "DHT (Distributed Hash Table)",
            body: "Distribuert nøkkel/verdi-lookup uten sentral server. Hver peer er ansvarlig for en del av et stort nøkkel-rom (typisk 160 bit SHA-1). For å finne hvem som har en gitt fil, hopper du gjennom log(N) andre peers etter en deterministisk algoritme (Kademlia for BitTorrent). Brukes når trackeren er nede eller ikke ønskes.",
          },
        ]}
      />

      <Illustration caption="BitTorrent-swarm: ingen sentral server, alle utveksler biter med alle.">
        <BitTorrentSvg />
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

      <Defs
        items={[
          {
            term: "DASH (Dynamic Adaptive Streaming over HTTP)",
            body: "Videoen lagres på serveren i flere versjoner med ulik bitrate (typisk 5–10 trinn, fra 240p til 4K). Hver versjon deles i korte segmenter (2–10 s). Klienten ber om ett segment om gangen og velger kvalitet basert på målt throughput og buffer-fyll. Når nettet treger, dropper klienten til lavere kvalitet uten å avbryte avspilling.",
          },
          {
            term: "Manifest-fil",
            body: "Klientens første request henter et manifest (typisk en MPD- eller HLS-playlist) som lister alle tilgjengelige bitrater og hvor hvert segment er. Etter det er resten bare en serie HTTP-GETs på segment-URL-er — derfor «over HTTP», som passer perfekt inn i eksisterende CDN-er.",
          },
          {
            term: "CDN (Content Delivery Network)",
            body: "Tredjeparts-nettverk (Akamai, Cloudflare, Fastly) eller egne (Netflix Open Connect) av servere plassert nær brukerne — i ISP-en sitt nettverk, i sentrale exchange-punkter, i regionale datasentre. Innholdet kopieres ut til kant-servere så brukeren henter fra naboens server, ikke fra Mountain View.",
          },
          {
            term: "Hvorfor CDN funker",
            body: "Tre grunner. (1) Lavere propagasjons-forsinkelse fordi serveren er nærmere. (2) Lavere belastning på origin og på trans-kontinentale lenker. (3) Bedre opplevd throughput fordi det er færre rutere og kortere ende-til-ende-tid for TCP å åpne windowet.",
          },
          {
            term: "CDN-redirect / DNS-mapping",
            body: "Hvordan vet nettleseren din hvilken kant-server å gå til? Vanligvis via DNS: domenet (f.eks. video.nrk.no) er en CNAME til CDN-ens domene, og CDN-ens autoritative DNS svarer med IP-en til den geografisk nærmeste eller minst belastede serveren basert på hvor LDNS-spørringen kom fra.",
          },
          {
            term: "Cache-hierarki",
            body: "Edge-servere (helt ute hos ISP-en) cacher det mest sett innholdet. Hvis edge ikke har det, går den til en regional cache; hvis den heller ikke har det, til origin. Slik holder vi 99 %+ cache-hit på kanten selv om innholdsbiblioteket er kjempestort.",
          },
        ]}
      />

      <Illustration caption="CDN-arkitektur: bruker går til lokal edge, edge spør regional, regional eventuelt origin.">
        <CdnSvg />
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

      <Defs
        items={[
          {
            term: "Socket",
            body: "OS-abstraksjon for en endpoint i en nettverks-samtale. Identifisert av (protokoll, lokal IP, lokal port, ekstern IP, ekstern port). Operativ-systemet leverer en handle (file descriptor) som applikasjonen leser/skriver til.",
          },
          {
            term: "TCP-socket — server-side",
            body: "Server kaller socket() for å opprette, bind() for å feste på en port (f.eks. 8080), listen() for å gå i lyttemodus, og accept() i en loop. accept() blokkerer til en klient kobler seg på, og returnerer en ny socket dedikert til den klienten. Den nye socket-en brukes til send()/recv() med klienten; den opprinnelige fortsetter å ta imot nye.",
          },
          {
            term: "TCP-socket — klient-side",
            body: "Klienten kaller socket(), så connect(server_ip, server_port). Etter at TCP-handshakeen er ferdig kan klienten send()/recv(). Klienten trenger ikke bind() — OS-en velger en ledig kilde-port automatisk.",
          },
          {
            term: "UDP-socket",
            body: "Enklere: socket(), bind() (om du vil ha en spesifikk port), sendto(data, dest_addr) og recvfrom(). Ingen handshake, ingen connection-state. Hver sendto er uavhengig — du kan sende til ulike mottakere fra samme socket. Du må selv håndtere tap, omrokering og duplikater hvis det er viktig.",
          },
          {
            term: "Stream vs datagram",
            body: "TCP er en bytestrøm: bytes kommer fram i samme rekkefølge de ble sendt, men ikke nødvendigvis i samme «pakker». 1000 bytes sendt i to send()-kall kan komme som 1 recv() på 1000, eller to recv() på 500, eller hva som helst. UDP er datagram: hver sendto() blir én recvfrom() på samme størrelse — eller forsvinner helt.",
          },
          {
            term: "Blocking vs non-blocking",
            body: "Standard er at recv() blokkerer til data kommer. For en server som håndterer 1000 klienter er det upraktisk å ha 1000 tråder som sitter og venter. Non-blocking sockets + select()/poll()/epoll/kqueue (eller asyncio i Python, async i Rust) lar én tråd vente på mange sockets samtidig.",
          },
        ]}
      />

      <Illustration caption="TCP-server-loop: accept() lager en ny socket per klient, det opprinnelige fortsetter å lytte.">
        <SocketLoopSvg />
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
