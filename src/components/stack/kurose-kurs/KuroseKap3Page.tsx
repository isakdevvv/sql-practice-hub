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

type Tab = "intro" | "3.1" | "3.2" | "3.3" | "3.4" | "3.5" | "3.6" | "3.7";

const SECTIONS_3: SectionNavItem[] = [
  { id: "intro", label: "Start her" },
  { id: "3.1", label: "3.1 Transport-tjenester" },
  { id: "3.2", label: "3.2 Mux/demux" },
  { id: "3.3", label: "3.3 UDP" },
  { id: "3.4", label: "3.4 Pålitelig transport" },
  { id: "3.5", label: "3.5 TCP" },
  { id: "3.6", label: "3.6 Congestion control" },
  { id: "3.7", label: "3.7 Oppgaver" },
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

      <div className="grid gap-3 lg:grid-cols-2">
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
            {
              term: "Pålitelighet (reliability)",
              body: "Garanti om at hver byte som ble sendt, kommer fram i samme rekkefølge — eller at applikasjonen får beskjed om feil. TCP gir dette; UDP gir det ikke. Pålitelighet koster minst én ekstra runde (ACK) per tapt enhet, så det er ikke gratis.",
            },
            {
              term: "Latens-følsomhet vs gjennomstrømning",
              body: "To akser å velge protokoll etter. Latens-følsomme apper (spill, telefoni) bryr seg om hvor lenge én bit bruker fra send til mottak. Gjennomstrømnings-følsomme apper (filoverføring, video on-demand) bryr seg om bytes per sekund. TCP optimaliserer det andre, UDP åpner for at du selv kan optimere det første.",
            },
            {
              term: "Sikkerhets-tjeneste (TLS)",
              body: "Transportlaget gir av seg selv ingen konfidensialitet. TLS legger seg som et lag mellom applikasjonen og TCP og gir kryptering, integritet og autentisering. QUIC pakker TLS inn i selve transportprotokollen, slik at handshake og kryptering går i samme runde.",
            },
            {
              term: "Tilkoblingsorientert vs forbindelsesløs",
              body: "Tilkoblingsorientert (TCP): begge ender setter opp en delt tilstand før data — hvilke sekvensnumre, vinduer, bufre. Forbindelsesløs (UDP): hver pakke står på egne ben, ingen tilstand på endene. Ruterne i midten er alltid forbindelsesløse.",
            },
            {
              term: "Head-of-line blocking",
              body: "Når en strøm sendes i orden, må alt vente på den tregeste delen. Hvis byte 1000 mangler, kan ikke byte 2000-9999 leveres til applikasjonen før 1000 ankommer. TCP har dette over hele strømmen; QUIC har det per stream, ikke per forbindelse.",
            },
            {
              term: "Full-duplex",
              body: "TCP er full-duplex: begge sider kan sende samtidig på samme forbindelse. Hver retning har sitt eget par av sekvens- og ACK-numre. UDP er trivielt full-duplex siden hver pakke er uavhengig.",
            },
          ]}
        />
        <Illustration caption="Transportlaget snakker prosess-til-prosess via IP, som flytter pakker host-til-host gjennom rutere som ikke ser inn i transport-headeren.">
          <TransportE2ESvg />
        </Illustration>
      </div>

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

      <div className="grid gap-3 lg:grid-cols-2">
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
            {
              term: "Velkjente porter (0-1023)",
              body: "Reservert av IANA (Internet Assigned Numbers Authority) for standard-tjenester: 22 SSH, 25 SMTP, 53 DNS, 80 HTTP, 110 POP3, 143 IMAP, 443 HTTPS, 993 IMAPS. På Unix-systemer krever binding til disse porter root-rettigheter — en sikkerhetsforanstaltning som hindrer en ondsinnet brukerprosess i å utgi seg for å være en systemtjeneste.",
            },
            {
              term: "Registrerte porter (1024-49151)",
              body: "Reservert hos IANA for bestemte applikasjoner, men ikke beskyttet av OS-et. Eksempler: 3306 MySQL, 5432 PostgreSQL, 6379 Redis, 27017 MongoDB. En vanlig brukerprosess kan binde her, men du bør ikke kollidere med kjente apper.",
            },
            {
              term: "Dynamiske/private porter (49152-65535)",
              body: "Ingen registrering, brukes for ephemeral-allokering. Når socket-en lukkes, går porten gjennom TIME_WAIT (typisk 60-120 s) før den kan brukes igjen — for å unngå at gamle pakker landet på en helt ny forbindelse med samme tuppel.",
            },
            {
              term: "Port-forwarding (NAT)",
              body: "På en hjemme-ruter har alle klienter samme offentlige IP-adresse. Ruteren modifiserer kilde-port (og IP) på vei ut, lagrer mappingen, og reverserer den på vei tilbake. Demux skjer da i to nivåer: ruteren bruker sin port-tabell, klienten bruker sin lokale 4-tuppel.",
            },
            {
              term: "Socket-API: bind() og connect()",
              body: "bind() knytter en socket til en lokal (IP, port). Serveren gjør dette eksplisitt med en kjent port. Klienten skipper det vanligvis og lar OS-en velge ephemeral. connect() setter destinasjons-IP og -port; for TCP utløser den også 3-veis handshake. Etter connect() er 4-tuppelen full og demux fungerer.",
            },
            {
              term: "Port-uttømming",
              body: "Hvis en klient lager mange forbindelser per sekund (web-skraper, lasttest), kan ephemeral-rommet (~16k porter) bli tomt før gamle forbindelser har forlatt TIME_WAIT. Resultat: connect() feiler med EADDRNOTAVAIL. Løsning: redusere TIME_WAIT, eller bruke flere kilde-IP-er.",
            },
            {
              term: "Demux-mismatch og RST",
              body: "Hvis en TCP-pakke kommer med en 4-tuppel som ikke matcher noen aktiv socket, svarer kjernen vanligvis med RST. Det er hvordan «port closed»-meldinger oppstår — i motsetning til UDP, hvor en lukket port produserer ICMP «port unreachable».",
            },
          ]}
        />
        <Illustration caption="TCP-demux med 4-tuppel: én lytte-port, men hver aktiv forbindelse får sin egen socket basert på kilde-tuppelen.">
          <MuxDemuxSvg />
        </Illustration>
      </div>

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

      <div className="grid gap-3 lg:grid-cols-2">
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
            {
              term: "Pseudo-header for sjekksum",
              body: "UDP-sjekksummen dekker også en pseudo-header som inneholder kilde-IP, dest-IP, protokoll (17) og UDP-lengde. Pseudo-headeren overføres ikke; den brukes bare ved beregning. Hensikten: oppdage tilfeller der pakken havnet hos feil mottaker pga. korrupt IP-header. Det er litt et lag-brudd (transport leser nettverk-felter), men nyttig.",
            },
            {
              term: "Maksimal UDP-pakkestørrelse",
              body: "UDP-lengde-feltet er 16 bits → maks 65535 bytes, minus 8 (UDP-header) minus 20 (IP-header) = 65507 bytes nyttelast. I praksis fragmenteres alt over MTU (typisk 1500 bytes på Ethernet) i IP-laget, og tap av én fragment ødelegger hele datagrammet. De fleste UDP-baserte protokoller holder seg under ~512-1400 bytes.",
            },
            {
              term: "Ingen sjekksum (frivillig på IPv4)",
              body: "På IPv4 er UDP-sjekksumfeltet teknisk valgfritt: sender kan sette det til 0 for å hoppe over. Lite brukt i dag (sjekksumberegning er nesten gratis). På IPv6 er sjekksum obligatorisk fordi IP-laget der ikke selv har sjekksum.",
            },
            {
              term: "Demultipleksering ved port",
              body: "Som forklart i 3.2: UDP demuxer på (dest-IP, dest-port). Hvis ingen socket lytter, returnerer kjernen ICMP «port unreachable». Det er hvordan traceroute oppdager mellomstasjoner: send UDP til en port ingen lytter på, regn ut ruten via ICMP-svar.",
            },
            {
              term: "Bruk-tilfeller for UDP",
              body: "DNS (oppslag), DHCP (IP-tildeling), NTP (tids-synk), SNMP (overvåkning), QUIC/HTTP3, mediabærere i SIP/RTP, online-spill, real-time telemetri, multicast og broadcast (kun UDP støtter dette siden TCP er punkt-til-punkt).",
            },
            {
              term: "VoIP-typisk valg",
              body: "VoIP (telefon over IP) sender 20 ms talepakker. Hver pakke er ~40 bytes data + 12 bytes RTP + 8 bytes UDP + 20 bytes IP = ~80 bytes. Tap av én pakke = 20 ms knirk. TCP ville stoppet hele samtalen mens den retransmitterte — uakseptabelt. UDP + applikasjons-jitter-buffer = den riktige løsningen.",
            },
            {
              term: "DCCP — Datagram Congestion Control Protocol",
              body: "Sjelden brukt, men finnes: gir UDP-lignende beskjedlevering, men med congestion control innebygd. Tanken er å redde nettet fra UDP-flommer uten å tvinge applikasjonen til å selv implementere AIMD. I praksis bruker de fleste apper bare UDP og passer congestion selv eller hopper over det.",
            },
          ]}
        />
        <Illustration caption="UDP-header: 8 bytes, fire 2-byte-felter. Sammenlign med TCP-headerens 20+ bytes.">
          <UdpHeaderSvg />
        </Illustration>
      </div>

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

      <div className="grid gap-3 lg:grid-cols-2">
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
            {
              term: "Go-Back-N (GBN)",
              body: "Avsender holder et vindu på N ubekreftede pakker. Mottaker ACK-er bare den siste sammenhengende mottatte (kumulativ ACK), kaster alle ute-av-orden-pakker. Ved tap eller timeout: avsender retransmitterer alt fra første ubekreftede og fremover. Enkel mottaker (ingen buffer for ute-av-orden), men sløsing av båndbredde ved tap midt i et stort vindu.",
            },
            {
              term: "Selective Repeat (SR)",
              body: "Egen timer per pakke i vinduet, og mottakeren buffer-er ute-av-orden pakker for å levere dem senere i orden. ACK-er er per pakke. Ved tap retransmitterer avsender BARE den tapte. Bedre båndbredde-utnyttelse enn GBN, men kompleks mottaker (må holde og rebuilde buffer). Krever også sekvensnummer-rom ≥ 2N.",
            },
            {
              term: "Vindu-størrelse og sekvensnummer-rom",
              body: "For GBN: rom ≥ N+1. For SR: rom ≥ 2N — ellers kan mottakeren ikke skille en retransmisjon av den eldste fra en helt ny pakke som har samme sekvensnummer (mod-aritmetikk). TCPs 32-bits sekvensnummer-rom = 4 GiB, mer enn nok for praksis.",
            },
            {
              term: "Utnyttelse U for stop-and-wait",
              body: "U = (L/R) / (RTT + L/R), der L = pakkestørrelse i bits, R = lenke-rate, RTT = round-trip-time. Eksempel: L = 8000 bits, R = 1 Gbps, RTT = 30 ms. Sendetid L/R = 8 μs. U = 8 μs / 30 008 μs ≈ 0.027 %. Stop-and-wait er praktisk talt ubrukelig på fete lenker.",
            },
            {
              term: "Båndbredde-forsinkelse-produkt (BDP)",
              body: "BDP = R · RTT. Hvor mye data «får plass» i røret som flyr mellom partene. På en 1 Gbps lenke med 30 ms RTT er BDP = 1e9 · 0.030 = 30 Mbit ≈ 3.75 MB. For å fylle røret må avsenderen ha minst så mange ubekreftede bytes — derfor må vindusstørrelsen i TCP økes med høyhastighets-lenker (window scaling).",
            },
            {
              term: "Duplikat-deteksjon",
              body: "Alle robuste RDT-varianter må takle duplikater. Sekvensnumre løser det: hvis mottaker ser samme sekvensnr som den nettopp leverte, behandler den det som duplikat — sender ACK på nytt, men leverer ikke til applikasjonen. Idempotens på leveransen er prinsippet.",
            },
            {
              term: "Negativ ACK (NAK) vs duplikat-ACK",
              body: "Tidlig RDT brukte eksplisitt NAK for å si «pakke korrupt». Senere versjoner droppet NAK helt: et duplikat-ACK gir samme informasjon (mottakeren venter fortsatt på samme pakke). TCP bruker dette: tre dupliserte ACK-er fungerer som «pakken etter den ACK-en er åpenbart tapt — retransmitter NÅ».",
            },
            {
              term: "Timeout vs RTT-estimat",
              body: "Hvor lang skal en timeout være? For kort = falske retransmisjoner (spam). For lang = lang ventetid ved ekte tap. Løsning: estimere RTT dynamisk og sette timeout = RTT + sikkerhetsmargin. TCP bruker EWMA pluss variansestimat. RDT 3.0 antar at vi har et fornuftig timeout-tall som inngangsdata.",
            },
          ]}
        />
        <Illustration caption="RDT-progresjonen: hver versjon legger til håndtering av ett nytt feil-scenario.">
          <RdtProgressionSvg />
        </Illustration>
      </div>

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
function Section35() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="3.5" title="TCP — Transmission Control Protocol" />

      <p className="text-muted-foreground">
        TCP er en industriell implementasjon av prinsippene fra RDT, pluss pipelining, flow control
        og congestion control (siste tema for seg). Det er stream-orientert (bytes, ikke meldinger),
        bruker kumulative ACK-er, og estimerer RTT dynamisk for å sette fornuftige timeout-verdier.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
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
            {
              term: "TCP-tilstander (state machine)",
              body: "Hver TCP-forbindelse går gjennom en endelig automat. Hovedtilstander: CLOSED (ingen forbindelse), LISTEN (server venter), SYN_SENT (klient har sendt SYN), SYN_RCVD (server har fått SYN, sendt SYN-ACK), ESTABLISHED (data flyter), FIN_WAIT_1/2, CLOSE_WAIT, LAST_ACK, TIME_WAIT (vent på sene pakker), CLOSED igjen. Du kan se den med `netstat -an`.",
            },
            {
              term: "TCP-flags i headeren (6 kontroll-bits)",
              body: "SYN = «synchronize», starter forbindelse. ACK = «dette feltet er en gyldig kvittering». FIN = «jeg er ferdig med å sende, lukker min retning». RST = «reset, kast forbindelsen umiddelbart». PSH = «push», be mottakeren levere til app uten å vente. URG = «urgent», markerer noen bytes som hastedata (lite brukt). Flagene kan kombineres: typisk SYN+ACK, FIN+ACK.",
            },
            {
              term: "Initial Sequence Number (ISN)",
              body: "Når en TCP-side begynner en forbindelse, velger den en tilfeldig 32-bits ISN. Hvorfor tilfeldig? Sikkerhet — hvis ISN var forutsigbar, kunne en angriper forfalske TCP-pakker som passet inn i sekvensrommet. RFC 6528 anbefaler en kryptografisk basert generator.",
            },
            {
              term: "TIME_WAIT-tilstanden",
              body: "Etter at en side har sendt siste ACK i lukkings-sekvensen, må den vente 2·MSL (Maximum Segment Lifetime) før socket-en frigjøres helt. Hensikt: forsikre at forsinkede duplikat-pakker fra denne forbindelsen dør ut før en ny forbindelse kan gjenbruke samme 4-tuppel. Typisk 60-120 s på Linux.",
            },
            {
              term: "MSS — Maximum Segment Size",
              body: "Maks bytes nyttelast per TCP-segment (eksklusiv header). Vanligvis MTU − IP-header − TCP-header = 1500 − 20 − 20 = 1460 bytes på Ethernet. Forhandles i SYN-pakkene via en TCP-opsjon. Hvis avsender velger MSS for høyt, fragmenteres IP-pakkene videre nedstrøms — uønsket.",
            },
            {
              term: "Karn&apos;s algoritme",
              body: "Når et segment retransmitteres, vet vi ikke om en ankommen ACK svarte på originalen eller retransmisjonen. Karn sier: ikke bruk en RTT-måling fra en pakke som ble retransmittert. I tillegg: ved hver timeout, doble TimeoutInterval («eksponentiell backoff»). Innfører kvalitet i RTT-estimatet og hindrer at en kort timeout permanent forblir kort.",
            },
            {
              term: "Nagle&apos;s algoritme",
              body: "Hindrer at TCP sender mange små segmenter (såkalt «silly window»). Regelen: hvis det er ubekreftede bytes utestående OG dataen vi har er mindre enn MSS, vent på flere bytes eller på ACK. Resultat: bedre båndbredde-utnyttelse, men ekstra latens for interaktive apper. Slå av med TCP_NODELAY for spill/ssh.",
            },
            {
              term: "Delayed ACK",
              body: "Mottaker venter typisk opptil 200 ms før den sender ACK, i håp om å piggyback-e på et data-segment som likevel skulle gå motsatt vei. Sparer mange små rene-ACK-pakker. Kombinert med Nagle på avsendersiden gir det ofte uventet latens for små forespørsel/svar-mønstre.",
            },
            {
              term: "TCP-opsjoner",
              body: "TCP-headeren kan utvides med opsjoner. De viktigste: MSS (avtalt segment-størrelse), Window Scale (multiplikator for rwnd så vi får større effektive vindu enn 65 535 bytes), SACK Permitted og SACK (selektiv kvittering), Timestamps (eksakt RTT-måling og PAWS-beskyttelse).",
            },
            {
              term: "RST (reset)",
              body: "TCP-flagget som dreper en forbindelse umiddelbart. Sendes når: pakke ankommer en lukket port, et halvåpent forsøk («ghost connection») oppdages etter restart, eller applikasjonen kaller `close()` mens data fortsatt er ulest. RST-er er en feilkilde i lasttester når noden går tom for ressurser.",
            },
            {
              term: "Halv-lukking (half-close)",
              body: "TCP er full-duplex, og kan lukkes asymmetrisk. Side A sender FIN: «jeg er ferdig med å sende», men kan fortsatt motta. Side B kan fortsette å sende. Brukes i protokoller som «klient sender forespørsel, lukker sin halv, mottar svar, lukker helt». shutdown(SHUT_WR) i sockets-API.",
            },
          ]}
        />
        <Illustration caption="TCP-segment-header: 20 bytes minimum. Sekvensnr og ACK-felt er hjertet i påliteligheten.">
          <TcpHeaderSvg />
        </Illustration>
      </div>

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

      <div className="grid gap-3 lg:grid-cols-2">
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
            {
              term: "ssthresh — Slow Start Threshold",
              body: "Grenseverdien som skiller slow start (eksponentiell vekst) fra congestion avoidance (additiv vekst). Initialt veldig høyt. Når pakketap inntreffer, settes ssthresh = cwnd/2 og cwnd kuttes (til 1 ved timeout, til ssthresh ved tre dupliserte ACK-er). På den måten husker TCP «sist gang ble nettet trangt rundt cwnd/2-nivået».",
            },
            {
              term: "Congestion-events: timeout vs 3 dup-ACK",
              body: "TCP skiller to typer tap. Timeout: ingen ACK på lang stund — anta nettet er virkelig kvalt. Reaksjon: cwnd → 1 MSS, gå inn i slow start. Tre dupliserte ACK-er: vi får fortsatt ACK-er, så nettet flyter, bare én pakke mangler. Reaksjon: cwnd halveres, fortsetter i congestion avoidance (TCP Reno «fast recovery»).",
            },
            {
              term: "ECN — Explicit Congestion Notification",
              body: "I stedet for å vente på pakketap som signal, kan rutere markere bits i IP-headeren når køen begynner å fylles. Mottakeren ekko-er ECN-flagget i ACK-en. Avsenderen halverer cwnd som om det var et tap, men uten å miste pakker. Krever støtte hos rutere, sender og mottaker. Stadig mer utbredt.",
            },
            {
              term: "Throughput-formel for AIMD",
              body: "For en TCP-strøm med tapsrate p, MSS = MSS-størrelse, RTT = round-trip-time, gir AIMD-modellen omtrent throughput ≈ (1.22 · MSS) / (RTT · √p). Innebærer at en strøm med høy RTT eller dårlig lenke (høy p) er sterkt underlegen en med lav RTT eller lite tap — selv om de er teknisk «like rettferdige». Kalles «RTT-urettferdighet».",
            },
            {
              term: "TCP Tahoe (eldre)",
              body: "Forløperen til Reno. Ved tap (uansett signal): cwnd → 1 MSS, ssthresh → cwnd/2, slow start på nytt. Veldig konservativ — kaster bort potensielt mange RTT-er på å gå tilbake til 1. Reno introduserte «fast recovery» for tilfellet der vi fikk dup-ACK-er (nettet flyter fortsatt, ikke trenger full retur til 1).",
            },
            {
              term: "Bufferbloat",
              body: "Rutere med store bufre forsinker pakker i stedet for å droppe dem. TCP venter på pakketap som signal, men når det signalet endelig kommer, har køen vært full lenge — alle pakker har fått høy latens. ECN og BBR adresserer dette: ECN sender signal tidligere, BBR sender ikke pakker som likevel havner i kø.",
            },
            {
              term: "Self-clocking (TCP-klokken)",
              body: "TCP justerer sendetakt etter ACK-ankomster. Hver ACK «frigjør» en eller flere nye bytes til å sendes (når cwnd er fullt). Hvis nettet er trangt, kommer ACK-er sakte, og sendetakten reduseres automatisk uten eksplisitt regulering. Det er en av grunnene til at TCP er så robust uten sentral koordinator.",
            },
            {
              term: "Sender-vinduet: min(cwnd, rwnd)",
              body: "Mengden ubekreftede bytes TCP kan ha utestående er begrenset til det minste av cwnd (begrensning fra nettverket) og rwnd (begrensning fra mottakers buffer). Hvis cwnd er flaskehalsen → congestion-bound. Hvis rwnd er det → receiver-bound. Du kan diagnostisere med en pakkesnif: hvor lavt blir vinduet, og hva drev det dit?",
            },
            {
              term: "AIMD-konvergens (matematisk)",
              body: "Tenk på to strømmer A og B som koordinater i et plan. Additiv vekst: (A+k, B+k) — bevegelse langs 45-graders linje, bevarer A−B. Multiplikativ reduksjon: (A/2, B/2) — bevegelse mot origo langs strålen fra origo, halverer både A og B (men også A−B). Differansen reduseres bare ved tap, aldri ved vekst → konvergerer mot A = B.",
            },
          ]}
        />
        <Illustration caption="AIMD-sagtann: lineær økning av cwnd til pakketap utløser halvering, så starter syklusen på nytt.">
          <AimdSawtoothSvg />
        </Illustration>
      </div>

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
