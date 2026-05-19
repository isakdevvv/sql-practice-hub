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
import { Section11Live } from "./Section11Live";

type Tab = "intro" | "1.1" | "1.2" | "1.3" | "1.4" | "1.5" | "1.6";


const SECTIONS_1: SectionNavItem[] = [
  { id: "intro", label: "Start her" },
  { id: "1.1", label: "1.1 Hva er internett?" },
  { id: "1.2", label: "1.2 Edge & core" },
  { id: "1.3", label: "1.3 Pakker vs kretser" },
  { id: "1.4", label: "1.4 Forsinkelse" },
  { id: "1.5", label: "1.5 Lagene" },
  { id: "1.6", label: "1.6 Oppgaver" },
];
const NEXT_CHAPTER_1 = { slug: "kurose-kap-2", title: "Applikasjonslaget" };

export function KuroseKap1Page() {
  const [tab, setTab] = useState<Tab>("intro");
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-4 max-w-6xl">
        <header className="mb-3"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <a href="/stack/dte-2507" className="inline-flex items-center gap-1 hover:text-foreground"><FolderOpen className="h-3 w-3" /> DTE-2507</a>
            <span>·</span>
            <a
              href="/stack/kurose-kurs"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <FolderOpen className="h-3 w-3" /> Kurose-kurset
            </a>
            <span>·</span>
            <span>Kapittel 1 av 9</span>
          </div><h1 className="text-2xl font-bold tracking-tight">
            Kap. 1 — Internett og nettverks-grunnleggende
          </h1></header>

        <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border">
          <TabBtn active={tab === "intro"} onClick={() => setTab("intro")}>
            Start her
          </TabBtn>
          <TabBtn active={tab === "1.1"} onClick={() => setTab("1.1")}>
            1.1 Hva er internett?
          </TabBtn>
          <TabBtn active={tab === "1.2"} onClick={() => setTab("1.2")}>
            1.2 Edge &amp; core
          </TabBtn>
          <TabBtn active={tab === "1.3"} onClick={() => setTab("1.3")}>
            1.3 Pakker vs kretser
          </TabBtn>
          <TabBtn active={tab === "1.4"} onClick={() => setTab("1.4")}>
            1.4 Forsinkelse
          </TabBtn>
          <TabBtn active={tab === "1.5"} onClick={() => setTab("1.5")}>
            1.5 Lagene
          </TabBtn>
          <TabBtn active={tab === "1.6"} onClick={() => setTab("1.6")}>
            1.6 Oppgaver
          </TabBtn>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "1.1" && <Section11 />}
        {tab === "1.2" && <Section12 />}
        {tab === "1.3" && <Section13 />}
        {tab === "1.4" && <Section14 />}
        {tab === "1.5" && <Section15 />}
        {tab === "1.6" && <Section16 />}

        <SectionPager tabs={SECTIONS_1} current={tab} onPick={(id) => setTab(id as Tab)} nextChapter={NEXT_CHAPTER_1} />
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
    <div className="grid gap-3 sm:grid-cols-2 text-sm">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2 flex items-center gap-2">
          <BookOpen className="h-4 w-4" /> Læringsmål
        </h2>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
          <li>
            Forklare hva internett er på to nivåer: hardware (sammenkoblede maskiner) og tjeneste
            (en plattform for distribuerte apper).
          </li>
          <li>Skille nettverks-edge fra core; vite hva en aksess-nettverk og hva en ruter gjør.</li>
          <li>
            Sammenligne pakke-svitsjing og krets-svitsjing — fordeler, ulemper, og hvorfor
            pakke-svitsjing vant.
          </li>
          <li>
            Regne ut hvor lang tid en pakke bruker fra A til B, brutt ned i prosessering, kø,
            transmisjon og propagasjon.
          </li>
          <li>Forklare hvorfor vi tenker i lag, og hvorfor TCP/IP-modellen vant over OSI.</li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Kapittelets struktur</h2>
        <ol className="list-decimal pl-5 text-muted-foreground space-y-1">
          <li>Hva er internett? — to perspektiver</li>
          <li>Edge og core — hvor du er, og hva som ligger mellom</li>
          <li>Pakke-svitsjing vs krets-svitsjing</li>
          <li>Forsinkelse, throughput og pakketap</li>
          <li>Lag-modellen — hvorfor og hvordan</li>
          <li>Oppgaver — sjekk forståelsen din</li>
        </ol>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => onPick("1.1")}>
            Start på 1.1 →
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 1.1 — Hva er internett?
// ============================================================
function Section11() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="1.1" title="Hva er internett?" />

      <p className="text-muted-foreground">
        Internett er to ting samtidig. Det er en fysisk infrastruktur — milliarder av maskiner
        koblet sammen med kabler, fiber og radio. Og det er en tjeneste — en plattform som
        distribuerte applikasjoner (nettleseren din, e-post-klienten din, Spotify) kan bruke uten å
        vite om kablene.
      </p>

      <Section11Live />

      <Defs
        items={[
          {
            term: "Host (også: end-system)",
            body: "En maskin som kjører applikasjoner — laptop, mobil, server, smartklokke, IoT-sensor. Hosts er der applikasjonene faktisk lever.",
          },
          {
            term: "Lenke",
            body: "Det fysiske mediumet mellom to noder: kobberparkabel, fiber, radio, satellitt. Hver lenke har en throughput-rate i bits per sekund.",
          },
          {
            term: "Ruter",
            body: "Spesialisert maskin som tar imot pakker på én lenke, ser på destinasjons-adressen, og videresender på riktig ut-lenke. Internett består av millioner av rutere som hjelper pakker finne fram.",
          },
          {
            term: "Protokoll",
            body: "Avtalen om hvordan to maskiner skal snakke sammen. Format på meldinger + rekkefølge + hvilken handling som tas ved hver melding. TCP, HTTP, DNS og hundrevis andre er protokoller.",
          },
          {
            term: "ISP (Internet Service Provider)",
            body: "Selskap som driver et nettverk av rutere og selger tilkobling. Hjemme-ISP-en (Telenor, Altibox) kobler deg til et større tier-2 eller tier-1 ISP, som igjen kobler seg til andre ISP-er. Internett er ISP-er av ISP-er.",
          },
          {
            term: "IETF og RFC",
            body: "Internet Engineering Task Force er den åpne organisasjonen som standardiserer internett-protokoller. Hver protokoll er beskrevet i en RFC (Request for Comments) — nummererte standard-dokumenter.",
          },
        ]}
      />

      <RelatedSlugs slugs={["osi-tcpip", "dte2507-day-in-the-life", "dte2507-dns-dyp"]} />
    </article>
  );
}

// ============================================================
// 1.2 — Edge & core
// ============================================================
function Section12() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="1.2" title="Nettverks-edge og nettverks-core" />

      <p className="text-muted-foreground">
        Vi deler internett mentalt i to. <em>Edge</em> er der end-hostene sitter — laptopen din,
        mobilen, servere i et datasenter. <em>Core</em> er det mellomliggende nettverket av rutere
        som flytter pakker fra et edge-punkt til et annet.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
        items={[
          {
            term: "Aksess-nettverk",
            body: "Nettverket som kobler edge-hosten din til den nærmeste ruteren. Hjemme: DSL, fiber-til-hjem, kabel-modem, eller 5G. Bedrift: Ethernet eller WiFi. Aksess-nettverket er typisk det tregeste leddet i en ende-til-ende-rute.",
          },
          {
            term: "Last-mile",
            body: "Folkelig uttrykk for aksess-nettverket: «den siste kilometeren» fra ISP-en til hjemmet ditt. Historisk dyrt fordi det krever fysiske kabler til hver kunde.",
          },
          {
            term: "Core router",
            body: "Ruter som sitter i en ISP-backbone, ikke direkte koblet til hosts. Optimalisert for veldig høy throughput — kan flytte terabits per sekund.",
          },
          {
            term: "Peering vs transit",
            body: "To måter ISP-er kobler seg sammen: i peering bytter to ISP-er trafikk gratis (gjensidig fordel); i transit betaler en mindre ISP en større for å bære trafikk videre.",
          },
        ]}
      />
        <Illustration caption="Edge (rutere innenfor stiplede linjer) håndterer dine pakker; core (rutere mellom) flytter dem.">
        <EdgeCoreSvg />
      </Illustration>
      </div>

      <RelatedSlugs slugs={["dte2507-inni-ruter", "dte2507-subnetting"]} />
    </article>
  );
}

// ============================================================
// 1.3 — Packet vs circuit switching
// ============================================================
function Section13() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="1.3" title="Pakke-svitsjing vs krets-svitsjing" />

      <p className="text-muted-foreground">
        Det er to fundamentalt forskjellige måter å sende data gjennom et delt nettverk.
        Telefonnettet brukte krets-svitsjing fra slutten av 1800-tallet; internett valgte
        pakke-svitsjing. Forskjellen forklarer mye av hvorfor internett ble billig og fleksibelt.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
        items={[
          {
            term: "Krets-svitsjing",
            body: "Før samtalen begynner reserveres en dedikert sti gjennom nettet med fast båndbredde. Sti-en holdes opp så lenge samtalen varer, uansett om dere snakker eller er stille. Forutsigbar — du har alltid din båndbredde — men sløsing av kapasitet hvis du ikke bruker den.",
          },
          {
            term: "Pakke-svitsjing",
            body: "Data deles i små pakker. Hver pakke får en destinasjons-adresse og kjøres uavhengig gjennom nettet — eventuelt over ulike ruter. Ingen reservasjon på forhånd. Effektivt fordi inaktiv tid for én kunde brukes til pakker fra andre, men forsinkelse kan variere.",
          },
          {
            term: "Statistisk multipleksing",
            body: "Trikset som gjør pakke-svitsjing effektivt: når mange brukere deler en lenke og hver bare bruker den litt om gangen, kan du sende mer total trafikk enn summen av deres maks-rater (fordi ikke alle er aktive samtidig).",
          },
          {
            term: "Store-and-forward",
            body: "Hver ruter mottar hele pakken før den begynner å videresende. Tar tid lik pakke-størrelse / lenke-rate. Konsekvensen er at en pakke som hopper gjennom N lenker bruker minst N × (pakke / rate) bare på å bli «relayed».",
          },
          {
            term: "Køing og pakketap",
            body: "Hvis flere pakker ankommer en ruter samtidig og alle vil ut samme lenke, må noen vente i en kø. Hvis køen fylles helt opp, kastes nye pakker — det er pakketap. Pålitelige protokoller (TCP) merker pakketap og retransmitterer.",
          },
        ]}
      />
        <Illustration caption="Krets-svitsjing reserverer båndbredde langs hele stien; pakke-svitsjing slipper pakker inn på delte lenker.">
        <CircuitVsPacketSvg />
      </Illustration>
      </div>

      <Example title="Eksempel: pakke vs krets med 35 brukere">
        <p>
          En lenke har kapasitet 1 Mbps. En aktiv bruker trenger 100 kbps. Brukere er aktive ca. 10
          % av tiden tilfeldig fordelt.
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>
            <strong>Krets-svitsjing:</strong> hver bruker reserverer 100 kbps når de starter en
            sesjon. Lenken har plass til 1 Mbps / 100 kbps =<strong> 10 samtidige brukere</strong>.
            Bruker 11 må vente — selv om de andre 10 ikke faktisk sender data akkurat nå.
          </li>
          <li>
            <strong>Pakke-svitsjing:</strong> 35 brukere kan dele lenken. Sannsynlighet for at &gt;
            10 er aktive samtidig (binomial med p=0.1, n=35) er ~0.4 % — så &gt; 99 % av tiden er
            det god plass. Vi tre-dobler kapasiteten uten å miste merkbar opplevelse.
          </li>
        </ul>
      </Example>

      <RelatedSlugs slugs={["dte2507-bottleneck-throughput", "dte2507-delay-modell"]} />
    </article>
  );
}

// ============================================================
// 1.4 — Forsinkelse
// ============================================================
function Section14() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="1.4" title="Forsinkelse, throughput og pakketap" />

      <p className="text-muted-foreground">
        Det er fire kilder til forsinkelse når en pakke beveger seg fra én ruter til neste. Når du
        forstår hver av dem, kan du peke på hvilken som dominerer i et gitt scenario.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
        items={[
          {
            term: "Prosesserings-forsinkelse (d_proc)",
            body: "Tiden ruteren bruker på å lese pakke-headeren, sjekke for bit-feil, slå opp destinasjon i forwarding-tabellen, og bestemme ut-lenke. Typisk noen mikrosekunder i moderne rutere — neglisjerbar i de fleste regnestykker.",
          },
          {
            term: "Kø-forsinkelse (d_kø)",
            body: "Hvor lenge pakken sitter i kø før den slipper inn på ut-lenken. Avhenger av hvor full køen er. Når trafikken nærmer seg full lenke-kapasitet, eksploderer kø-forsinkelse — det er derfor nett som er > 80 % belastet føles trege.",
          },
          {
            term: "Transmisjons-forsinkelse (d_trans)",
            body: "Tiden det tar å «klemme ut» alle bitene på lenken. Lik pakke-størrelse L delt på lenke-rate R: d_trans = L / R. For en 1500-byte pakke på en 1 Gbps lenke: 1500·8 / 10⁹ ≈ 12 μs.",
          },
          {
            term: "Propagasjons-forsinkelse (d_prop)",
            body: "Hvor lenge det tar for én bit å reise fra ene enden av lenken til den andre. Lik avstand delt på utbredelse-hastighet (~2/3 av lyshastigheten i kobber/fiber). Bergen til Oslo (~400 km): ~2 ms. New York til Tokyo: ~80 ms.",
          },
          {
            term: "Total nodal forsinkelse",
            body: "d_proc + d_kø + d_trans + d_prop. Hopper pakken gjennom N lenker er total forsinkelse summen av alle nodale forsinkelser pluss propagasjon på de N lenkene.",
          },
          {
            term: "Throughput",
            body: "Antall bits per sekund som faktisk strømmer gjennom. End-to-end throughput er begrenset av den tregeste lenken på stien — flaskehalsen. Akkurat som vann gjennom et rør.",
          },
        ]}
      />
        <Illustration caption="De fire kildene til forsinkelse på vei gjennom én ruter.">
        <DelaySvg />
      </Illustration>
      </div>

      <Example title="Eksempel: end-to-end-forsinkelse Bergen → New York">
        <p>
          En pakke på 1500 bytes (=12 000 bits) skal fra Bergen til New York. Stien går:
          hjemme-ruter → 100 Mbps lokal-lenke (10 km) → 1 Gbps backbone-lenke (5500 km undersjøisk
          fiber) → kunde-ruter.
        </p>
        <p className="mt-2">Med tomme køer og 1 ms prosessering per hopp:</p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>d_trans lokal: 12000 / 10⁸ = 120 μs</li>
          <li>d_prop lokal: 10·10³ / (2·10⁸) = 50 μs</li>
          <li>d_trans backbone: 12000 / 10⁹ = 12 μs</li>
          <li>d_prop backbone: 5500·10³ / (2·10⁸) = 27.5 ms</li>
          <li>d_proc total: 3 hopp · 1 ms = 3 ms</li>
          <li>
            <strong>Sum ≈ 30.7 ms</strong>
          </li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Propagasjon dominerer totalt. Du kan ikke unngå lyshastigheten. Det er derfor CDN-er
          (innholds-distribusjon) lønner seg — de plasserer en kopi av VG nærmere deg så pakkene
          ikke trenger reise over Atlanteren.
        </p>
      </Example>

      <RelatedSlugs slugs={["dte2507-delay-modell", "dte2507-bottleneck-throughput"]} />
    </article>
  );
}

// ============================================================
// 1.5 — Lagene
// ============================================================
function Section15() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="1.5" title="Lag-modellen — hvorfor og hvordan" />

      <p className="text-muted-foreground">
        Kompleksiteten i internett er enorm. Lag-modellen er trikset for å håndtere den: vi tegner
        en horisontal abstraksjon mellom funksjons-grupper, og lar hvert lag bare snakke med laget
        rett over og rett under.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
        items={[
          {
            term: "Applikasjonslaget",
            body: "HTTP, SMTP, DNS, sockets. Her ligger logikken som genererer meldinger applikasjoner forstår.",
          },
          {
            term: "Transportlaget",
            body: "TCP eller UDP. Tar applikasjonens meldinger og deler i segmenter, gir dem sekvens-numre, og sørger eventuelt for pålitelig levering. Bruker portnumre for å skille mellom samtidige forbindelser på samme host.",
          },
          {
            term: "Nettverkslaget",
            body: "IP. Pakker segmenter inn i datagrammer med IP-adresser, og leverer datagrammer fra én host til en annen via mange rutere.",
          },
          {
            term: "Linklaget",
            body: "Ethernet, WiFi. Flytter datagrammer fra én node til neste over én lenke. MAC-adresser, bit-stuffing, feiloppdaging.",
          },
          {
            term: "Fysisk lag",
            body: "Hvordan bits faktisk representeres på mediumet — spenning, lys-pulser, radiofrekvenser.",
          },
          {
            term: "Innkapsling",
            body: "Hver lag legger sitt eget header foran (og noen ganger trailer bak) meldingen før den sendes ned til neste lag. Mottakeren skreller av lag for lag oppover. Det er innkapsling som gjør at lagene kan være uavhengige av hverandre.",
          },
          {
            term: "Hvorfor 5 lag og ikke 7 (OSI)?",
            body: "OSI-modellen fra 1980-tallet hadde 7 lag (la til session og presentation som egne lag). I praksis ble disse to slått sammen med applikasjonslaget. Internett kjører fortsatt på 5-lags TCP/IP-modellen.",
          },
        ]}
      />
        <Illustration caption="Pakkens reise gjennom 5 lag: hver legger sitt eget header.">
        <EncapsulationSvg />
      </Illustration>
      </div>

      <RelatedSlugs slugs={["osi-tcpip", "transportlag", "tcp-sockets"]} />
    </article>
  );
}

// ============================================================
// 1.6 — Oppgaver
// ============================================================
function Section16() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="1.6" title="Oppgaver" />
      <p className="text-muted-foreground">
        Sjekk forståelsen din med disse oppgavene. Klikk «Vis svar» for å se vår løsning etter du
        har prøvd selv.
      </p>

      <Exercise
        question="Hva er den dominerende forsinkelsen mellom Oslo og San Francisco (~8800 km) for en 1500-byte pakke på en 10 Gbps lenke uten kø?"
        hint="Regn ut hver av d_trans, d_prop og prosessering. Hvilken er størst?"
        answer={
          <>
            <p className="font-mono text-[12px]">
              d_trans = 12000 / 10¹⁰ = 1.2 μs
              <br />
              d_prop = 8800·10³ / (2·10⁸) = 44 ms
              <br />
              Prosessering: noen mikrosekunder
            </p>
            <p className="mt-1">
              Propagasjon dominerer fullstendig (44 ms vs 1.2 μs). Lange avstander er
              propagasjons-begrenset; raskere lenker hjelper bare med kø-forsinkelse på lokale
              strekninger.
            </p>
          </>
        }
      />

      <Exercise
        question="Hvor mange pakker per sekund må en ruter prosessere hvis den har en 100 Gbps ut-lenke og snittpakke-størrelsen er 600 bytes?"
        hint="Pakker per sekund = lenke-rate / (8 × pakke-størrelse)"
        answer={
          <p className="font-mono text-[12px]">
            100·10⁹ / (8 · 600) = 20.8 millioner pakker per sekund. Dette er hvorfor moderne
            core-rutere bruker dedikert hardware (ASIC) for forwarding — software på en CPU rekker
            ikke.
          </p>
        }
      />

      <Exercise
        question="Hvorfor er pakke-svitsjing dårlig egnet for sann-tid lyd (VoIP) sammenlignet med krets-svitsjing?"
        hint="Hva er det vi får i pakke-svitsjing som ikke finnes i krets?"
        answer={
          <p>
            I pakke-svitsjing kan kø-forsinkelse variere fra pakke til pakke (jitter). For VoIP,
            hvor hver pakke representerer 20 ms lyd, kan jitter ødelegge avspillingen.
            Krets-svitsjing gir konstant forsinkelse fordi båndbredden er reservert. Moderne VoIP
            bruker playout-buffer + RTP-timestamps for å kompensere. Se{" "}
            <a href="/stack/dte2507-voip-rtp" className="text-brand hover:underline">
              VoIP & RTP-siden
            </a>{" "}
            for detaljer.
          </p>
        }
      />

      <Exercise
        question="En applikasjon sender 100 MB over en strekning med 10 Mbps throughput og 50 ms RTT. Anta at TCP når full throughput umiddelbart. Hvor lang tid tar overføringen?"
        hint="Først throughput-tid (data / rate), så legg til halv RTT for siste pakke å komme fram."
        answer={
          <>
            <p className="font-mono text-[12px]">
              Data = 100·10⁶ bytes · 8 = 8·10⁸ bits
              <br />
              Tid = 8·10⁸ / 10⁷ = 80 sekunder
              <br />+ halv RTT for siste pakke = 80.025 s
            </p>
            <p className="mt-1">
              Throughput dominerer. Hvis strekningen var én sekund lang RTT ville først pakken brukt
              et halvt sekund, men de øvrige 80 s med data hadde fortsatt brukt 80 s.
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


// ============================================================
// SVG-illustrasjoner — alle original-tegnet
// ============================================================

function IspHierarchySvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      {/* Tier 1 backbone */}
      <ellipse
        cx={250}
        cy={40}
        rx={180}
        ry={20}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1.5}
      />
      <text
        x={250}
        y={45}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Tier-1 backbone (global)
      </text>
      {/* Tier 2 regional */}
      {[120, 250, 380].map((x, i) => (
        <g key={i}>
          <line
            x1={x}
            y1={60}
            x2={x}
            y2={95}
            className="stroke-muted-foreground/40"
            strokeWidth={1}
          />
          <ellipse
            cx={x}
            cy={110}
            rx={60}
            ry={15}
            className="fill-success/15 stroke-success/60"
            strokeWidth={1.5}
          />
          <text x={x} y={114} textAnchor="middle" className="fill-foreground text-[10px]">
            Regional ISP
          </text>
        </g>
      ))}
      {/* Aksess */}
      {[60, 130, 200, 280, 360, 440].map((x, i) => (
        <g key={i}>
          <line
            x1={x}
            y1={140}
            x2={x}
            y2={165}
            className="stroke-muted-foreground/40"
            strokeWidth={1}
          />
          <rect
            x={x - 22}
            y={165}
            width={44}
            height={20}
            rx={3}
            className="fill-card stroke-border"
            strokeWidth={1}
          />
          <text x={x} y={178} textAnchor="middle" className="fill-foreground text-[9px]">
            Aksess
          </text>
          {/* Hosts */}
          <circle cx={x} cy={200} r={5} className="fill-amber-500" />
          <text x={x} y={213} textAnchor="middle" className="fill-muted-foreground text-[8px]">
            host
          </text>
        </g>
      ))}
    </svg>
  );
}

function EdgeCoreSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      {/* Core */}
      <rect
        x={130}
        y={70}
        width={240}
        height={80}
        rx={10}
        className="fill-brand/10 stroke-brand/40"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      <text
        x={250}
        y={62}
        textAnchor="middle"
        className="fill-brand text-[10px] uppercase tracking-wider font-semibold"
      >
        core (rutere)
      </text>
      {[170, 220, 280, 330].map((x, i) => (
        <circle key={i} cx={x} cy={110} r={14} className="fill-card stroke-brand" strokeWidth={2} />
      ))}
      {[
        [170, 110, 220, 110],
        [220, 110, 280, 110],
        [280, 110, 330, 110],
        [170, 110, 280, 110],
        [220, 110, 330, 110],
      ].map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          className="stroke-brand/50"
          strokeWidth={1.5}
        />
      ))}
      {/* Edge */}
      <rect
        x={10}
        y={20}
        width={100}
        height={180}
        rx={10}
        className="fill-amber-500/5 stroke-amber-500/40"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      <text
        x={60}
        y={14}
        textAnchor="middle"
        className="fill-amber-600 dark:fill-amber-400 text-[10px] uppercase tracking-wider font-semibold"
      >
        edge
      </text>
      <circle cx={60} cy={50} r={10} className="fill-amber-500" />
      <text x={60} y={73} textAnchor="middle" className="fill-foreground text-[9px]">
        laptop
      </text>
      <circle cx={60} cy={110} r={10} className="fill-amber-500" />
      <text x={60} y={133} textAnchor="middle" className="fill-foreground text-[9px]">
        mobil
      </text>
      <circle cx={60} cy={170} r={10} className="fill-amber-500" />
      <text x={60} y={193} textAnchor="middle" className="fill-foreground text-[9px]">
        PC
      </text>
      <line
        x1={110}
        y1={50}
        x2={170}
        y2={110}
        className="stroke-muted-foreground/40"
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <line
        x1={110}
        y1={110}
        x2={170}
        y2={110}
        className="stroke-muted-foreground/40"
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <line
        x1={110}
        y1={170}
        x2={170}
        y2={110}
        className="stroke-muted-foreground/40"
        strokeWidth={1}
        strokeDasharray="2 2"
      />

      <rect
        x={390}
        y={20}
        width={100}
        height={180}
        rx={10}
        className="fill-success/5 stroke-success/40"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      <text
        x={440}
        y={14}
        textAnchor="middle"
        className="fill-success text-[10px] uppercase tracking-wider font-semibold"
      >
        edge
      </text>
      <circle cx={440} cy={50} r={10} className="fill-success" />
      <text x={440} y={73} textAnchor="middle" className="fill-foreground text-[9px]">
        web-srv
      </text>
      <circle cx={440} cy={110} r={10} className="fill-success" />
      <text x={440} y={133} textAnchor="middle" className="fill-foreground text-[9px]">
        DB-srv
      </text>
      <circle cx={440} cy={170} r={10} className="fill-success" />
      <text x={440} y={193} textAnchor="middle" className="fill-foreground text-[9px]">
        CDN
      </text>
      <line
        x1={330}
        y1={110}
        x2={390}
        y2={50}
        className="stroke-muted-foreground/40"
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <line
        x1={330}
        y1={110}
        x2={390}
        y2={110}
        className="stroke-muted-foreground/40"
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <line
        x1={330}
        y1={110}
        x2={390}
        y2={170}
        className="stroke-muted-foreground/40"
        strokeWidth={1}
        strokeDasharray="2 2"
      />
    </svg>
  );
}

function CircuitVsPacketSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      {/* Krets — reservert sti */}
      <text x={20} y={20} className="fill-brand text-[11px] uppercase tracking-wider font-semibold">
        Krets-svitsjing
      </text>
      <text x={20} y={35} className="fill-muted-foreground text-[10px]">
        A og B reserverer en sti — andre kan ikke bruke den
      </text>
      {[
        [40, 60],
        [140, 60],
        [240, 60],
        [340, 60],
        [440, 60],
      ].map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={10}
          className={i >= 0 && i < 5 ? "fill-brand/30 stroke-brand" : "fill-card stroke-border"}
          strokeWidth={2}
        />
      ))}
      {[
        [40, 140],
        [140, 140],
        [240, 140],
        [340, 140],
        [440, 140],
      ].map(([x, y], i) => (
        <circle
          key={`p${i}`}
          cx={x}
          cy={y}
          r={10}
          className="fill-card stroke-border"
          strokeWidth={2}
        />
      ))}
      <line x1={40} y1={60} x2={140} y2={60} className="stroke-brand" strokeWidth={3} />
      <line x1={140} y1={60} x2={240} y2={60} className="stroke-brand" strokeWidth={3} />
      <line x1={240} y1={60} x2={340} y2={60} className="stroke-brand" strokeWidth={3} />
      <line x1={340} y1={60} x2={440} y2={60} className="stroke-brand" strokeWidth={3} />
      <text x={40} y={50} textAnchor="middle" className="fill-foreground text-[10px]">
        A
      </text>
      <text x={440} y={50} textAnchor="middle" className="fill-foreground text-[10px]">
        B
      </text>

      {/* Pakke — delt lenker */}
      <text
        x={20}
        y={110}
        className="fill-success text-[11px] uppercase tracking-wider font-semibold"
      >
        Pakke-svitsjing
      </text>
      <text x={20} y={125} className="fill-muted-foreground text-[10px]">
        Pakker fra mange brukere deler de samme lenkene
      </text>
      <line
        x1={40}
        y1={140}
        x2={140}
        y2={140}
        className="stroke-muted-foreground/60"
        strokeWidth={2}
      />
      <line
        x1={140}
        y1={140}
        x2={240}
        y2={140}
        className="stroke-muted-foreground/60"
        strokeWidth={2}
      />
      <line
        x1={240}
        y1={140}
        x2={340}
        y2={140}
        className="stroke-muted-foreground/60"
        strokeWidth={2}
      />
      <line
        x1={340}
        y1={140}
        x2={440}
        y2={140}
        className="stroke-muted-foreground/60"
        strokeWidth={2}
      />
      <text x={40} y={130} textAnchor="middle" className="fill-foreground text-[10px]">
        A
      </text>
      <text x={440} y={130} textAnchor="middle" className="fill-foreground text-[10px]">
        B
      </text>
      {/* Små pakker */}
      <rect x={60} y={135} width={10} height={8} className="fill-brand" />
      <rect x={75} y={135} width={10} height={8} className="fill-amber-500" />
      <rect x={160} y={135} width={10} height={8} className="fill-success" />
      <rect x={180} y={135} width={10} height={8} className="fill-brand" />
      <rect x={260} y={135} width={10} height={8} className="fill-amber-500" />
      <rect x={280} y={135} width={10} height={8} className="fill-brand" />
      <rect x={360} y={135} width={10} height={8} className="fill-success" />
      <rect x={380} y={135} width={10} height={8} className="fill-amber-500" />
      <text x={250} y={195} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        Pakker fra ulike kilder blandes — fargene viser opphav
      </text>
    </svg>
  );
}

function DelaySvg() {
  return (
    <svg viewBox="0 0 500 200" className="w-full h-auto">
      <text
        x={250}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        En pakke gjennom én ruter — fire forsinkelses-kilder
      </text>
      {/* Ruter-boks */}
      <rect
        x={170}
        y={50}
        width={160}
        height={100}
        rx={6}
        className="fill-card stroke-brand"
        strokeWidth={2}
      />
      <text
        x={250}
        y={70}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Ruter
      </text>
      {/* Trinn */}
      <rect
        x={180}
        y={85}
        width={30}
        height={30}
        rx={2}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={195} y={102} textAnchor="middle" className="fill-foreground text-[7px]">
        proc
      </text>
      <text x={195} y={130} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        d_proc
      </text>

      <rect
        x={220}
        y={85}
        width={50}
        height={30}
        rx={2}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={245} y={102} textAnchor="middle" className="fill-foreground text-[8px]">
        kø
      </text>
      <text x={245} y={130} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        d_kø
      </text>

      <rect
        x={280}
        y={85}
        width={40}
        height={30}
        rx={2}
        className="fill-success/30 stroke-success"
        strokeWidth={1.5}
      />
      <text x={300} y={102} textAnchor="middle" className="fill-foreground text-[7px]">
        trans
      </text>
      <text x={300} y={130} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        d_trans
      </text>

      {/* Lenker */}
      <line x1={60} y1={100} x2={170} y2={100} className="stroke-foreground/60" strokeWidth={2} />
      <text x={115} y={92} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        inn-lenke
      </text>
      <line x1={330} y1={100} x2={460} y2={100} className="stroke-foreground/60" strokeWidth={2} />
      <text x={395} y={92} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        ut-lenke
      </text>
      <text x={395} y={120} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        d_prop
      </text>

      <rect x={40} y={92} width={20} height={16} rx={2} className="fill-amber-500" />
      <text x={50} y={130} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        pakke
      </text>

      <text x={250} y={170} textAnchor="middle" className="fill-foreground text-[11px] font-mono">
        total = d_proc + d_kø + d_trans + d_prop
      </text>
    </svg>
  );
}

function EncapsulationSvg() {
  const layers = [
    { name: "App", color: "fill-brand", payload: "HTTP-melding" },
    { name: "Transport", color: "fill-success", payload: "TCP-header + " },
    { name: "Nettverk", color: "fill-amber-500", payload: "IP-header + " },
    { name: "Link", color: "fill-destructive", payload: "Eth-header + " },
  ];
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      {layers.map((l, i) => {
        const y = 20 + i * 50;
        const headerWidth = i * 25;
        const totalWidth = 100 + i * 50;
        return (
          <g key={l.name}>
            <text x={20} y={y + 28} className="fill-foreground text-[10px] font-semibold">
              {l.name}
            </text>
            {Array.from({ length: i + 1 }, (_, k) => (
              <rect
                key={k}
                x={130 + k * 25}
                y={y + 10}
                width={25}
                height={30}
                className={k < i ? "fill-muted stroke-border" : ""}
                strokeWidth={1}
              />
            ))}
            <rect
              x={130 + (i + 1) * 25}
              y={y + 10}
              width={150}
              height={30}
              className={`${l.color}/30 stroke-current`}
              strokeWidth={1}
            />
            <text
              x={130 + (i + 1) * 25 + 75}
              y={y + 28}
              textAnchor="middle"
              className="fill-foreground text-[9px]"
            >
              data
            </text>
            {i > 0 && (
              <text
                x={130 + (i - 1) * 25 + 12}
                y={y + 28}
                textAnchor="middle"
                className="fill-muted-foreground text-[8px]"
              >
                H{i}
              </text>
            )}
            {i > 1 && (
              <text
                x={130 + (i - 2) * 25 + 12}
                y={y + 28}
                textAnchor="middle"
                className="fill-muted-foreground text-[8px]"
              >
                H{i - 1}
              </text>
            )}
            {i > 2 && (
              <text
                x={130 + (i - 3) * 25 + 12}
                y={y + 28}
                textAnchor="middle"
                className="fill-muted-foreground text-[8px]"
              >
                H{i - 2}
              </text>
            )}
          </g>
        );
      })}
      <text
        x={250}
        y={230}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] italic"
      >
        Hver lag legger til sitt eget header (H1, H2, ...) før pakken sendes ned
      </text>
    </svg>
  );
}
