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

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            { term: "Klient-server", body: "Én alltid-på server, mange tilkoblende klienter." },
            { term: "P2P (peer-to-peer)", body: "Likeverdige peers; ingen sentral server." },
            { term: "Hybrid", body: "Sentral kontrollplan, distribuert dataplan." },
            { term: "Socket", body: "API-døra mellom appen din og transport-laget." },
            { term: "Adresse + port", body: "IP velger maskin, port velger prosess." },
            {
              term: "Transport-tjenester",
              body: "Pålitelighet, throughput, timing, sikkerhet — fire knapper.",
            },
            {
              term: "App-protokoll",
              body: "Meldingsformat + rekkefølge + semantikk (HTTP, DNS, SMTP).",
            },
            {
              term: "Well-known ports",
              body: "0–1023 reservert (22 SSH, 80 HTTP, 443 HTTPS, 53 DNS).",
            },
            {
              term: "Throughput / latency / jitter",
              body: "Mengde per tid / tid per pakke / varians i tid.",
            },
            {
              term: "RTT (round-trip time)",
              body: "Tid til server og tilbake — gulv for hvert request-svar.",
            },
            { term: "Stateful vs stateless", body: "Husker mellom requests vs glemmer alt." },
            { term: "Push vs pull", body: "Server dytter til klient vs klient drar fra server." },
            { term: "BDP", body: "Båndbredde × RTT = bits «underveis» samtidig." },
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

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            {
              term: "Request / response",
              body: "Startlinje + headers + body; svar har statuslinje.",
            },
            { term: "Stateless", body: "Server glemmer alt mellom requests — bevisst valg." },
            {
              term: "Persistent forbindelse",
              body: "Holder TCP åpen for flere requests (keep-alive).",
            },
            {
              term: "Pipelining / HOL-blocking",
              body: "Send flere på rad; sakte svar blokkerer raske.",
            },
            { term: "HTTP/2", body: "Binær, mange streams over én TCP-forbindelse." },
            {
              term: "HTTP/3 (QUIC)",
              body: "Streams uavhengige også på transportlaget; UDP-basert.",
            },
            { term: "Cookies", body: "Server-satt tekst som klienten gir tilbake hver request." },
            {
              term: "Metoder",
              body: "GET hent, POST opprett, PUT erstatt, PATCH endre, DELETE slett.",
            },
            { term: "Statuskoder", body: "2xx ok, 3xx redirect, 4xx du-feil, 5xx jeg-feil." },
            { term: "Conditional GET", body: "If-None-Match → server svarer 304 (uendret)." },
            {
              term: "Proxy / web-cache",
              body: "Bedrifts-mellom-server som cacher for sine brukere.",
            },
            { term: "CORS", body: "Headers som lar fremmed domene lese svaret i nettleseren." },
            {
              term: "HTTPS / TLS",
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

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            { term: "Hierarkisk navnerom", body: "Leses høyre→venstre; ansvar deles per nivå." },
            { term: "Root-servere", body: "13 logiske, hundrevis fysisk via anycast — toppen." },
            {
              term: "Iterativt vs rekursivt",
              body: "Klient→resolver rekursivt; resolver→auth iterativt.",
            },
            {
              term: "Caching + TTL",
              body: "Lokal lagring i N sekunder — det som gjør DNS skalerbar.",
            },
            {
              term: "Record-typer",
              body: "A=IPv4, AAAA=IPv6, CNAME=alias, MX=mail, NS=navneserver, TXT=fri tekst.",
            },
            {
              term: "Glue records",
              body: "Følger med delegering så du unngår sirkulær avhengighet.",
            },
            { term: "Stub-resolver", body: "OS-biblioteket som bare spør lokal resolver." },
            { term: "Reverse DNS (PTR)", body: "IP → navn, via in-addr.arpa-sonen." },
            { term: "Autoritativ svar", body: "Fra sonens egen server (AA-flagg) vs cache." },
            {
              term: "Negativ caching",
              body: "NXDOMAIN huskes også — derfor henger feil-svar igjen.",
            },
            { term: "DoH / DoT", body: "Krypterer DNS-spørringen mellom stub og resolver." },
            {
              term: "DNSSEC",
              body: "Signaturer i hierarki-kjede — root signerer TLD signerer ...",
            },
            { term: "EDNS0", body: "Utvider UDP-svar fra 512 til 4096 bytes." },
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

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            { term: "SMTP", body: "Server→server-protokoll for å levere mail (port 25/587)." },
            { term: "IMAP / POP3", body: "Klient henter sin egen postkasse fra serveren." },
            { term: "MIME", body: "Pakker vedlegg/bilder/HTML inn i ASCII (Base64)." },
            { term: "BitTorrent", body: "P2P-fildeling: fil i biter, alle deler med alle." },
            { term: "Tit-for-tat", body: "Send mest til dem som sender mest til deg." },
            { term: "DHT (Kademlia)", body: "Distribuert peer-katalog uten sentral tracker." },
            {
              term: "SMTP-handshake",
              body: "Klartekst-linjer: HELO, MAIL FROM, RCPT TO, DATA, ..",
            },
            {
              term: "Envelope vs header",
              body: "Konvolutt (ruting) vs brev-innhold (From:-feltet).",
            },
            {
              term: "SPF / DKIM / DMARC",
              body: "DNS-baserte signaturer som avslører forfalskning.",
            },
            {
              term: "Biter og blocks",
              body: "Bit = 256 kB med SHA-hash; blokk = 16 kB som sendes.",
            },
            { term: "Rarest-first", body: "Last ned det færrest har — sprer risiko." },
            {
              term: "Tracker vs DHT",
              body: "Sentral peer-liste vs distribuert via magnet-lenker.",
            },
            {
              term: "Choking",
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

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            { term: "DASH", body: "Flere bitrate-versjoner; klient velger kvalitet per segment." },
            { term: "Manifest", body: "Liste over hvilke bitrater og segmenter som finnes." },
            { term: "CDN", body: "Kant-servere nær brukeren — innhold kopieres ut." },
            {
              term: "Hvorfor CDN funker",
              body: "Kortere RTT, mindre origin-trafikk, raskere TCP-vekst.",
            },
            {
              term: "DNS-mapping",
              body: "CDN-DNS svarer med nærmeste edge basert på resolver-IP.",
            },
            { term: "Cache-hierarki", body: "Edge → regional → origin; 99 %+ stoppes på edge." },
            { term: "Segment-lengde", body: "2 s = raskt bytte, 10 s = mindre overhead." },
            { term: "Buffer-fyll", body: "Stor buffer = trygt; lav buffer = panikk-bytte ned." },
            {
              term: "Origin shield",
              body: "Ekstra cache-lag — beskytter origin mot thundering herd.",
            },
            { term: "Cache-warming", body: "Pre-populer edge før storserie-slipp." },
            {
              term: "Live-distribusjon",
              body: "Encode → ingest → regional → edge i nær sann-tid.",
            },
            { term: "Codec-valg", body: "H.264 universell, H.265/AV1 sparer båndbredde." },
            { term: "Anycast", body: "Samme IP fra mange steder; BGP velger nærmeste automatisk." },
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

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            {
              term: "Socket",
              body: "OS-handle for en endpoint: (proto, lokal IP+port, ekstern IP+port).",
            },
            { term: "TCP server-kall", body: "socket → bind → listen → accept-loop." },
            { term: "TCP klient-kall", body: "socket → connect → send/recv → close." },
            { term: "UDP-socket", body: "socket → bind → sendto / recvfrom; ingen forbindelse." },
            {
              term: "Stream vs datagram",
              body: "TCP = bytestrøm uten grenser, UDP = atomiske pakker.",
            },
            {
              term: "Blocking vs non-blocking",
              body: "Vent passivt vs spør «er det noe?» og fortsett.",
            },
            {
              term: "send() returnerer mindre",
              body: "Kernel-buffer full → du må loope resten selv.",
            },
            { term: "SO_REUSEADDR", body: "Ta porten selv om forrige forbindelse er i TIME_WAIT." },
            { term: "Nagle / TCP_NODELAY", body: "Samler små send-er; skru av for chat/spill." },
            { term: "epoll / kqueue", body: "Vent på 10 000 sockets fra én tråd, O(1)." },
            { term: "MTU", body: "Største pakke uten fragmentering (Ethernet 1500 byte)." },
            { term: "Raw socket", body: "Sende egne IP-pakker; brukes av ping, traceroute." },
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
