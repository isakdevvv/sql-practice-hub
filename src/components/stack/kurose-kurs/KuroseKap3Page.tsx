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

type Tab = "intro" | "3.1" | "3.2" | "3.3" | "3.4" | "3.5" | "3.6" | "3.7";

export function KuroseKap3Page() {
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
            <span>Kapittel 3 av 9</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Kap. 3 — Transportlaget</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Transportlaget tar applikasjonens meldinger og forvandler dem til segmenter som kan
            sendes pålitelig (eller upålitelig) mellom prosesser. Vi bygger forståelsen fra bunnen
            av: porter, RDT-protokoller, TCP-mekanikken, og hvordan internett unngår å kollapse
            under egen last.
          </p>
        </header>

        <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border">
          <TabBtn active={tab === "intro"} onClick={() => setTab("intro")}>
            Start her
          </TabBtn>
          <TabBtn active={tab === "3.1"} onClick={() => setTab("3.1")}>
            3.1 Transport-tjenester
          </TabBtn>
          <TabBtn active={tab === "3.2"} onClick={() => setTab("3.2")}>
            3.2 Mux/demux
          </TabBtn>
          <TabBtn active={tab === "3.3"} onClick={() => setTab("3.3")}>
            3.3 UDP
          </TabBtn>
          <TabBtn active={tab === "3.4"} onClick={() => setTab("3.4")}>
            3.4 Pålitelig transport
          </TabBtn>
          <TabBtn active={tab === "3.5"} onClick={() => setTab("3.5")}>
            3.5 TCP
          </TabBtn>
          <TabBtn active={tab === "3.6"} onClick={() => setTab("3.6")}>
            3.6 Congestion control
          </TabBtn>
          <TabBtn active={tab === "3.7"} onClick={() => setTab("3.7")}>
            3.7 Oppgaver
          </TabBtn>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "3.1" && <Section31 />}
        {tab === "3.2" && <Section32 />}
        {tab === "3.3" && <Section33 />}
        {tab === "3.4" && <Section34 />}
        {tab === "3.5" && <Section35 />}
        {tab === "3.6" && <Section36 />}
        {tab === "3.7" && <Section37 />}

        <ChapterPager
          prev={{ slug: "kurose-kap-2", title: "Applikasjonslaget" }}
          next={{ slug: "kurose-kap-4", title: "Nettverkslaget — data-plane" }}
        />
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

      <Defs
        items={[
          {
            term: "Segment",
            body: "Transport-lagets dataenhet. Inneholder en transport-header (TCP eller UDP) pluss applikasjonsdata. Når segmentet pakkes inn i et IP-datagram, kalles det fortsatt et segment fra transportlaget sitt synspunkt.",
          },
          {
            term: "Ende-til-ende vs hopp-for-hopp",
            body: "Transportlaget jobber ende-til-ende: bare avsender og mottaker har transport-stack-er. Rutere på veien ignorerer transport-headeren og forholder seg kun til IP-laget (hopp-for-hopp). Det betyr at endring i transport-protokoll bare krever endring hos endepunktene.",
          },
          {
            term: "Logisk forbindelse",
            body: "Selv om IP er forbindelsesløst, kan transportlaget gi inntrykk av en stabil kanal mellom to prosesser. TCP åpner en logisk forbindelse med 3-veis handshake og lukker den med FIN; UDP gjør ingen slik etablering.",
          },
          {
            term: "Best effort",
            body: "IP lover ingenting: pakker kan tapes, dupliseres, omsorteres eller forsinkes vilkårlig. Alt utover bare-leveranse må gjenoppfinnes av transportlaget hvis applikasjonen trenger det.",
          },
          {
            term: "Transport-tjenester (tilbudt meny)",
            body: "Pålitelig dataoverføring, ordning, flow control, congestion control, sikkerhet (via TLS over TCP). UDP tilbyr ingen av disse utover en sjekksum; TCP tilbyr alle med unntak av kryptering.",
          },
          {
            term: "Socket",
            body: "OS-grensesnittet mellom applikasjonen og transport-stack-en. En socket identifiseres av (protokoll, lokal IP, lokal port, fjern-IP, fjern-port). Applikasjonen skriver til socket-en, transportlaget tar over.",
          },
          {
            term: "API-forskjell TCP vs UDP",
            body: "TCP-sockets er stream-orientert: du skriver bytes, mottakeren leser bytes — grenser mellom send()-kall bevares ikke. UDP-sockets er melding-orientert: hvert sendto() blir nøyaktig én pakke som mottakeren får i ett recvfrom().",
          },
        ]}
      />

      <Illustration caption="Transportlaget snakker prosess-til-prosess via IP, som flytter pakker host-til-host gjennom rutere som ikke ser inn i transport-headeren.">
        <TransportE2ESvg />
      </Illustration>

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

      <RelatedSlugs slugs={["transportlag", "tcp-sockets", "dte2507-rdt-progresjon"]} />
    </article>
  );
}

// ============================================================
// 3.2 — Multipleksing og demultipleksing
// ============================================================
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

      <Defs
        items={[
          {
            term: "Portnummer",
            body: "16-bits identifikator (0–65535) som hver socket binder seg til. Sammen med IP-adressen og protokoll-typen gir den en unik adresse for en endepunkt-prosess. Welbekjente porter: 80 (HTTP), 443 (HTTPS), 22 (SSH), 53 (DNS), 25 (SMTP).",
          },
          {
            term: "Multipleksing (mux)",
            body: "Avsender-siden: transportlaget samler data fra flere kilde-sockets, legger på riktig header med kilde- og dest-port, og sender alle segmentene ned til IP-laget. Mange strømmer går inn — én IP-stack går ut.",
          },
          {
            term: "Demultipleksing (demux)",
            body: "Mottaker-siden: IP-laget leverer datagrammer oppover, og transportlaget leser headerens portfelt for å bestemme hvilken socket pakken hører til. Én strøm går inn — den fordeles ut på riktige sockets.",
          },
          {
            term: "UDP-demux: 2-tuppel",
            body: "UDP-sockets identifiseres bare av (dest-IP, dest-port). To pakker fra forskjellige kilder med samme destinasjon havner på samme socket. Server-prosessen må lese kilde-feltet selv for å vite hvem som sendte.",
          },
          {
            term: "TCP-demux: 4-tuppel",
            body: "TCP-sockets identifiseres av (kilde-IP, kilde-port, dest-IP, dest-port). En web-server som lytter på port 443 kan derfor ha hundretusenvis av samtidige TCP-forbindelser på samme port — hver klient har en unik kilde-tuppel.",
          },
          {
            term: "Lytte-socket vs forbindelse-socket",
            body: "Web-serveren har én lytte-socket bundet til port 443. Når en ny klient åpner forbindelse, oppretter OS-en en ny socket bundet til 4-tuppelen for akkurat den forbindelsen. Lytte-socketen forblir tilgjengelig for nye klienter.",
          },
          {
            term: "Ephemeral port",
            body: "Klient-siden binder seg ikke til en kjent port; OS-en gir den en tilfeldig høy port (typisk 49152–65535). Når forbindelsen lukkes, frigjøres den. Det er denne tilfeldigheten som gjør at to faner kan koble seg til samme server uten kollisjon.",
          },
        ]}
      />

      <Illustration caption="TCP-demux med 4-tuppel: én lytte-port, men hver aktiv forbindelse får sin egen socket basert på kilde-tuppelen.">
        <MuxDemuxSvg />
      </Illustration>

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

      <RelatedSlugs slugs={["transportlag", "tcp-sockets"]} />
    </article>
  );
}

// ============================================================
// 3.3 — UDP
// ============================================================
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

      <Defs
        items={[
          {
            term: "Forbindelsesløs",
            body: "Ingen handshake før data sendes. Første pakke er allerede en datapakke. Sparer 1 RTT ved oppstart — verdifullt for korte forespørsler som DNS, hvor handshake-tiden ville dominere.",
          },
          {
            term: "UDP-header (8 bytes, 4 felter)",
            body: "Kilde-port (2 bytes), dest-port (2 bytes), lengde (2 bytes — totalt segment inkl. header), sjekksum (2 bytes). Det er alt. TCP-headeren er minst 20 bytes og typisk større.",
          },
          {
            term: "Sjekksum",
            body: "Enkelt 16-bits one's-complement-sum over header + data + en pseudo-header som inkluderer IP-adressene. Detekterer bit-feil med høy sannsynlighet, men UDP kan ikke korrigere — det dropper bare den feilaktige pakken og overlater resten til applikasjonen.",
          },
          {
            term: "Melding-grenser bevares",
            body: "Hver sendto() blir nøyaktig én UDP-pakke. Hvis du sender 100 bytes og deretter 200 bytes, vil mottakeren få ett recvfrom() som returnerer 100, og deretter ett som returnerer 200. TCP ville fritt kunne slått dem sammen eller delt dem opp.",
          },
          {
            term: "Når UDP slår TCP",
            body: "Når 1) leveransen må være rask og en tapt enhet er foreldet før retransmisjon hjelper (sanntids-tale/spill), 2) forespørselen er kort og handshake-overhead er stor (DNS, NTP), 3) du selv vil styre påliteligheten (QUIC bygger sin egen pålitelighet over UDP), 4) du sender til mange mottakere samtidig (multicast).",
          },
          {
            term: "QUIC-paradokset",
            body: "Moderne HTTP/3 kjører over UDP, ikke TCP. Hvorfor? Fordi de bygde en helt ny pålitelighets- og congestion-control-protokoll på applikasjonsnivå (i userspace), og UDP var den raskeste veien gjennom OS-kjernen og NAT-bokser. Bevis på at transportlaget kan re-implementeres når det trengs.",
          },
        ]}
      />

      <Illustration caption="UDP-header: 8 bytes, fire 2-byte-felter. Sammenlign med TCP-headerens 20+ bytes.">
        <UdpHeaderSvg />
      </Illustration>

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

      <RelatedSlugs slugs={["transportlag", "dte2507-voip-rtp"]} />
    </article>
  );
}

// ============================================================
// 3.4 — Pålitelig data-transport
// ============================================================
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

      <Defs
        items={[
          {
            term: "RDT 1.0 — perfekt kanal",
            body: "Antakelse: ingen bit-feil, ingen tap, ingen omsortering. Avsender bare sender; mottaker bare mottar. Trivielt. Tjener som start-punkt.",
          },
          {
            term: "RDT 2.0 — bit-feil, ingen tap",
            body: "Vi legger til en sjekksum og to nye meldinger fra mottakeren: ACK (alt godt, send neste) og NAK (jeg fikk en korrupt pakke, send på nytt). Avsenderen stopper og venter på svar. Problem: hva hvis selve ACK-en blir korrupt?",
          },
          {
            term: "RDT 2.1 — sekvensnummer",
            body: "Når avsenderen ikke kan stole på ACK-en, må vi vite om mottakeren har sett pakken før. Vi legger til 1-bits sekvensnummer (0 eller 1). Hvis avsenderen får tvetydig svar, sender den samme sekvensnummer på nytt; mottakeren ser at det er duplikat og sender ACK igjen uten å levere oppover.",
          },
          {
            term: "RDT 2.2 — bare ACK, ingen NAK",
            body: "Forenklingstrinn: mottakeren sender ACK(0) eller ACK(1) for å indikere hvilken pakke som ble korrekt mottatt. Et duplikat ACK fungerer som NAK — avsender skjønner at neste pakke ikke kom fram.",
          },
          {
            term: "RDT 3.0 — pakketap",
            body: "Den virkelige verdenen: pakker kan forsvinne helt. Hvis avsenderen sitter og venter på en ACK som aldri kommer, henger den for alltid. Løsning: timeout. Avsenderen starter en timer; hvis ingen ACK før timeout, retransmitter. Hvis ACK var bare forsinket, oppdager mottakeren duplikat via sekvensnummer.",
          },
          {
            term: "Stop-and-wait",
            body: "Alle RDT-versjoner bruker dette: send én pakke, vent på ACK, send neste. Korrekt, men forferdelig throughput-utnyttelse over lenker med stor båndbredde-forsinkelse-produkt. En 1 Gbps lenke med 50 ms RTT som sender 1500-byte pakker stop-and-wait når under 1 % av kapasiteten.",
          },
          {
            term: "Pipelining",
            body: "Løsningen på stop-and-wait: ha flere pakker «in flight» samtidig. Avsenderen sender N pakker før den må vente på første ACK. To klassiske skjemaer: Go-Back-N (én timer for hele vinduet, retransmitter alt fra første ubekreftede ved tap) og Selective Repeat (egen timer og ACK per pakke). TCP er en hybrid.",
          },
        ]}
      />

      <Illustration caption="RDT-progresjonen: hver versjon legger til håndtering av ett nytt feil-scenario.">
        <RdtProgressionSvg />
      </Illustration>

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

      <RelatedSlugs slugs={["dte2507-rdt-progresjon", "transportlag"]} />
    </article>
  );
}

// ============================================================
// 3.5 — TCP
// ============================================================
function Section35() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="3.5" title="TCP — Transmission Control Protocol" />

      <p className="text-muted-foreground">
        TCP er en industriell implementasjon av prinsippene fra RDT, pluss pipelining, flow control
        og congestion control (siste tema for seg). Det er stream-orientert (bytes, ikke meldinger),
        bruker kumulative ACK-er, og estimerer RTT dynamisk for å sette fornuftige timeout-verdier.
      </p>

      <Defs
        items={[
          {
            term: "Segmentering",
            body: "TCP bryter applikasjonens bytestrøm i segmenter som passer innenfor MSS (Maximum Segment Size, typisk 1460 bytes på Ethernet). Mottakeren har en bytenummert «buffer» og setter sammen igjen, slik at applikasjonen leser sammenhengende bytes.",
          },
          {
            term: "Sekvensnummer (32 bits)",
            body: "I motsetning til RDT er TCPs sekvensnummer en byte-offset, ikke en pakke-teller. Hvis et segment har sekvensnr 1000 og inneholder 500 bytes, har neste segment sekvensnr 1500. Det gjør delvis overlapp og delvis retransmisjon mulig.",
          },
          {
            term: "Kumulativ ACK",
            body: "Mottakeren sender ACK(N) for å si «jeg har mottatt alle bytes opp til, men ikke inkludert, N — gi meg N». Hvis pakker 1, 3, 4 kommer (2 mangler), sender mottakeren ACK = sekvensnr for pakke 2. Når 2 endelig ankommer, hopper ACK forbi alt som er bufret.",
          },
          {
            term: "Tre dupliserte ACK-er (fast retransmit)",
            body: "Hvis avsenderen får tre identiske ACK-er på rad, antar den at pakken etter den ACK-en er tapt — uten å vente på timeout. Mye raskere reaksjon. Innebygget i alle moderne TCP-implementasjoner.",
          },
          {
            term: "RTT-estimat med EWMA",
            body: "TCP måler RTT for hver ACK den får. For å unngå at en enkelt utlier setter timeout for høyt eller lavt, brukes et glidende eksponentielt vektet snitt: EstimatedRTT = (1-α)·EstimatedRTT + α·SampleRTT, typisk med α = 0.125. Variansen estimeres på lignende måte og brukes til å sette TimeoutInterval = EstimatedRTT + 4·DevRTT.",
          },
          {
            term: "Flow control",
            body: "Mottakeren har en buffer. Hvis applikasjonen leser sakte, kan buffer-en fylles. TCP unngår overflow ved at mottakeren rapporterer ledig plass i et felt kalt rwnd (receiver window) i hver ACK. Avsenderen sørger for at antall unACK-ede bytes ≤ rwnd.",
          },
          {
            term: "3-veis handshake (SYN, SYN-ACK, ACK)",
            body: "Før data kan sendes, må begge sider bli enige om initielle sekvensnumre. Klienten sender SYN med sin ISN; serveren svarer SYN+ACK med sin ISN; klienten ACK-er. Først nå er forbindelsen «established».",
          },
        ]}
      />

      <Illustration caption="TCP-segment-header: 20 bytes minimum. Sekvensnr og ACK-felt er hjertet i påliteligheten.">
        <TcpHeaderSvg />
      </Illustration>

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

      <RelatedSlugs slugs={["tcp-sockets", "transportlag", "dte2507-rdt-progresjon"]} />
    </article>
  );
}

// ============================================================
// 3.6 — Congestion control
// ============================================================
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

      <Defs
        items={[
          {
            term: "Congestion collapse",
            body: "Når lenkene fylles opp, øker kø-forsinkelsen, timeouts utløses, alle retransmitterer aggressivt, lastes øker enda mer, mer tap, flere retransmisjoner — en positiv feedback-løkke som gjør nettet ubrukelig selv om kapasiteten er der.",
          },
          {
            term: "Congestion window (cwnd)",
            body: "TCPs interne begrensning på hvor mange bytes som kan være «in flight». Avsendervinduet er min(rwnd, cwnd). Endrer seg dynamisk basert på opplevd nettverks-tilstand. Pakketap = signal om at nettet er fullt.",
          },
          {
            term: "AIMD — Additive Increase, Multiplicative Decrease",
            body: "Grunn-prinsippet i klassisk TCP: ved hver vellykket RTT, øk cwnd med 1 MSS (additivt). Ved tap, halver cwnd (multiplikativt). Det gir den karakteristiske sagtann-profilen og — viktigst — konvergerer mot en rettferdig deling av flaskehalsen mellom konkurrerende strømmer.",
          },
          {
            term: "Slow start",
            body: "Ved start av forbindelsen vet vi ikke nettets kapasitet. cwnd starter på 1 MSS og dobles hver RTT (eksponentielt). Når cwnd når en terskel (ssthresh) eller pakketap inntreffer, gå over til AIMD. Tross navnet vokser den raskt.",
          },
          {
            term: "TCP Reno",
            body: "Klassisk TCP-variant fra 1990. Bruker slow start, AIMD, og «fast recovery» — i stedet for å falle helt tilbake til 1 MSS ved tap, halver vi cwnd og fortsetter additivt. Var dominerende i tiår, men sliter på lenker med høyt båndbredde-forsinkelse-produkt.",
          },
          {
            term: "TCP Cubic",
            body: "Standard i Linux siden 2008 (og dermed på flesteparten av servere). Bruker en kubisk funksjon av tid-siden-tap til å bestemme cwnd. Vokser aggressivt etter et tap, men flater ut nær det forrige maks-punktet. Mye bedre throughput på lange, høybåndbredde-lenker enn Reno.",
          },
          {
            term: "BBR — Bottleneck Bandwidth and RTT",
            body: "Google, 2016. Bryter med tap-som-signal. Måler i stedet aktivt nettets båndbredde og minimum-RTT, og sender med en rate som matcher flaskehalsen uten å fylle køer. Resultat: høyere throughput og lavere latens samtidig, særlig på mobilnett og lange interkontinentale lenker.",
          },
          {
            term: "Rettferdighet",
            body: "AIMD har en pen egenskap: hvis to TCP-strømmer deler én flaskehals, konvergerer cwnd-ene deres mot like store verdier. Bevis ved «AIMD-diagrammet»: hver runde flytter punktet i 45-graders linje (begge øker likt), tap flytter mot origo (begge halveres). Linjen mot rettferdig deling er en attraktor.",
          },
        ]}
      />

      <Illustration caption="AIMD-sagtann: lineær økning av cwnd til pakketap utløser halvering, så starter syklusen på nytt.">
        <AimdSawtoothSvg />
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

function ChapterPager({
  prev,
  next,
}: {
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}) {
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
        <a
          href="/stack/kurose-kurs"
          className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-brand/60"
        >
          <FolderOpen className="h-4 w-4 text-muted-foreground group-hover:text-brand" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Kurs-oversikt
            </div>
            <div className="text-sm font-semibold">Tilbake til Kurose-kurset</div>
          </div>
        </a>
      )}
      {next && (
        <a
          href={`/stack/${next.slug}`}
          className="group flex items-center gap-3 rounded-xl border border-brand/40 bg-brand/5 p-4 hover:border-brand sm:flex-row-reverse sm:text-right"
        >
          <ArrowRight className="h-4 w-4 text-brand group-hover:translate-x-0.5 transition-transform" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-brand/80">Neste kap.</div>
            <div className="text-sm font-semibold">{next.title}</div>
          </div>
        </a>
      )}
    </nav>
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
