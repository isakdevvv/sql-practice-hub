import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronDown, ChevronRight, FolderOpen, ExternalLink } from "lucide-react";
import { SectionPager, type SectionNavItem } from "./SectionPager";
import { Section11Live } from "./Section11Live";
import { Section12Live } from "./Section12Live";
import { Section13Live } from "./Section13Live";
import { Section14Live } from "./Section14Live";
import { Section15Live } from "./Section15Live";

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
              Kap. 1 — Internett og nettverks-grunnleggende
            </h1>
          </div>
          <nav className="ml-auto flex flex-wrap gap-0.5">
            <TabBtn active={tab === "intro"} onClick={() => setTab("intro")}>
              Start
            </TabBtn>
            <TabBtn active={tab === "1.1"} onClick={() => setTab("1.1")} title="Hva er internett?">
              1.1
            </TabBtn>
            <TabBtn active={tab === "1.2"} onClick={() => setTab("1.2")} title="Edge & core">
              1.2
            </TabBtn>
            <TabBtn active={tab === "1.3"} onClick={() => setTab("1.3")} title="Pakker vs kretser">
              1.3
            </TabBtn>
            <TabBtn active={tab === "1.4"} onClick={() => setTab("1.4")} title="Forsinkelse">
              1.4
            </TabBtn>
            <TabBtn active={tab === "1.5"} onClick={() => setTab("1.5")} title="Lagene">
              1.5
            </TabBtn>
            <TabBtn active={tab === "1.6"} onClick={() => setTab("1.6")} title="Oppgaver">
              Oppg.
            </TabBtn>
          </nav>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "1.1" && <Section11 />}
        {tab === "1.2" && <Section12 />}
        {tab === "1.3" && <Section13 />}
        {tab === "1.4" && <Section14 />}
        {tab === "1.5" && <Section15 />}
        {tab === "1.6" && <Section16 />}

        <SectionPager
          tabs={SECTIONS_1}
          current={tab}
          onPick={(id) => setTab(id as Tab)}
          nextChapter={NEXT_CHAPTER_1}
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
            body: "En maskin som kjører applikasjoner — laptop, mobil, server, smartklokke, IoT-sensor. Hosts er der applikasjonene faktisk lever. Bok-en bruker også «sluttsystem» som synonym — viktig å kjenne igjen begge.",
          },
          {
            term: "Klient og server",
            body: "To roller en host kan ha: klient initierer kommunikasjon (nettleseren din), server venter på forespørsler og svarer (web-tjeneren til nrk.no). Samme maskin kan være begge deler samtidig — en laptop som streamer film er klient mot Netflix, men kan også være server for en lokal fildeling.",
          },
          {
            term: "Lenke",
            body: "Det fysiske mediumet mellom to noder: kobberparkabel, fiber, radio, satellitt. Hver lenke har en throughput-rate i bits per sekund.",
          },
          {
            term: "Pakke (også: datagram, segment, ramme)",
            body: "En selvstendig enhet data som sendes gjennom nettet. På applikasjonsnivå heter det «melding», i transportlaget «segment», i nettverkslaget «datagram», og i linklaget «ramme». Samme objekt — bare ulikt navn alt etter hvilket lag som ser på det.",
          },
          {
            term: "Ruter",
            body: "Spesialisert maskin som tar imot pakker på én lenke, ser på destinasjons-adressen, og videresender på riktig ut-lenke. Internett består av millioner av rutere som hjelper pakker finne fram.",
          },
          {
            term: "Svitsj (link-svitsj)",
            body: "Forveksles ofte med ruter. En svitsj jobber kun på linklaget (lag 2) og videresender ut fra MAC-adresser innenfor ett lokalnett. En ruter jobber på nettverkslaget (lag 3) og kobler ulike nettverk sammen. Hjemme-routeren din er egentlig begge deler i én boks.",
          },
          {
            term: "Protokoll",
            body: "Avtalen om hvordan to maskiner skal snakke sammen. Format på meldinger + rekkefølge + hvilken handling som tas ved hver melding. TCP, HTTP, DNS og hundrevis andre er protokoller.",
          },
          {
            term: "API (Application Programming Interface)",
            body: "Det programmerings-grensesnittet en applikasjon bruker for å snakke med nettverket — typisk socket-API-et. Tenk på det som «hullet» applikasjonen putter data inn i; resten av nettverks-stakken tar over derfra.",
          },
          {
            term: "ISP (Internet Service Provider)",
            body: "Selskap som driver et nettverk av rutere og selger tilkobling. Hjemme-ISP-en (Telenor, Altibox) kobler deg til et større tier-2 eller tier-1 ISP, som igjen kobler seg til andre ISP-er. Internett er ISP-er av ISP-er.",
          },
          {
            term: "IXP (Internet Exchange Point)",
            body: "Fysisk lokasjon der mange ISP-er møtes for å bytte trafikk direkte uten å gå via en tier-1. Oslo har f.eks. NIX. IXP-er reduserer kostnader og forsinkelse — trafikk mellom to norske ISP-er trenger ikke ta omveien via Stockholm eller London.",
          },
          {
            term: "Tier-1, tier-2, tier-3",
            body: "Uformell rangering av ISP-er. Tier-1 (CenturyLink, NTT, Telia Carrier) er globale og bytter trafikk gratis seg imellom. Tier-2 er regionale (Telenor i Norden), kjøper transit fra tier-1. Tier-3 er lokale tilkoblings-ISP-er. Hierarkiet er flatere i dag enn for 20 år siden.",
          },
          {
            term: "IETF og RFC",
            body: "Internet Engineering Task Force er den åpne organisasjonen som standardiserer internett-protokoller. Hver protokoll er beskrevet i en RFC (Request for Comments) — nummererte standard-dokumenter. F.eks. er HTTP/1.1 RFC 7230 og IPv6 RFC 8200.",
          },
          {
            term: "Distribuert applikasjon",
            body: "Et program som kjører delt på to eller flere hosts og kommuniserer over nettet — som Spotify (klient + tjener), Slack (mange klienter + sky-tjener), eller BitTorrent (peer-to-peer). Selve internett er en plattform; det er de distribuerte appene som gir det verdi.",
          },
        ]}
      />

      <Example title="Eksempel: forespørselen din til vg.no i tall">
        <p>
          Du skriver «vg.no» i nettleseren på Tromsø Universitet. Det som skjer er et stafett av
          protokoller:
        </p>
        <ol className="list-decimal pl-5 mt-1 space-y-0.5 text-[12px]">
          <li>
            DNS-protokollen oversetter <code>vg.no</code> til IP-adressen 195.88.55.16.
          </li>
          <li>Nettleseren åpner en TCP-tilkobling til den IP-en på port 443.</li>
          <li>TLS-protokollen forhandler en kryptert kanal.</li>
          <li>HTTP-protokollen sender en GET-forespørsel og mottar HTML-svaret.</li>
          <li>
            HTML-en refererer 60+ andre filer (bilder, CSS, JavaScript) — punkt 1-4 gjentas for
            hver.
          </li>
        </ol>
        <p className="mt-2 text-muted-foreground">
          Fem ulike protokoller måtte enes om format og rekkefølge for at du skulle se forsiden.
          Hver av dem er bare en avtale skrevet ned i en RFC.
        </p>
      </Example>

      <Example title="Eksempel: én host, mange roller">
        <p>En vanlig Macbook i et hjem i Bodø kan samtidig være:</p>
        <ul className="list-disc pl-5 mt-1 text-[12px]">
          <li>
            <strong>Klient</strong> mot Spotify (mottar lyd-strømmen).
          </li>
          <li>
            <strong>Klient</strong> mot iCloud (synkroniserer Notes).
          </li>
          <li>
            <strong>Server</strong> for Apple Continuity (lar iPhonen pare seg).
          </li>
          <li>
            <strong>Peer</strong> i WireGuard-VPN-en (både sender og mottar tunnel-pakker).
          </li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Klient/server er roller per tilkobling, ikke per maskin. En moderne host bytter mellom dem
          dusinvis av ganger i sekundet.
        </p>
      </Example>

      <Hvorfor>
        <p>
          Hvorfor er internett bygget som en samling private ISP-er som må samarbeide, i stedet for
          som et statlig «PostNord for bits»? Designet er en arv fra 1980-tallet. Forløperen ARPANET
          var et amerikansk forskningsnett med én operatør (DARPA), men da det skulle skaleres ut
          globalt på 90-tallet var det politisk umulig å gi ett selskap eller én stat kontroll over
          den nye infrastrukturen.
        </p>
        <p>
          Løsningen ble en føderert struktur: tusenvis av selvstendige ISP-er som kobler seg sammen
          via standarder ingen sentral myndighet eier (RFC-ene fra IETF). Konsekvensen er at
          internett er overraskende motstandsdyktig mot enkeltfeil — ingen sentral kan slå det av —
          men også at ytelse mellom to brukere avhenger av kommersielle avtaler mellom ISP-er som du
          ikke ser. Et alternativ som ble seriøst diskutert var X.25-modellen fra telekom-bransjen
          (sentralisert, statlig), men den tapte fordi den var dyrere å skalere og tregere å endre.
        </p>
      </Hvorfor>

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

      <Section12Live />

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
            term: "FTTH (Fiber To The Home)",
            body: "Aksess-teknologi der fiberoptikken går helt inn i boligen. Gir symmetrisk høy throughput (1-10 Gbps i dag) og lav forsinkelse. Norge er blant verdens mest fiberdekkede land — Altibox og Telenor leverer i hovedsak FTTH til nye områder.",
          },
          {
            term: "DSL (Digital Subscriber Line)",
            body: "Eldre aksess-teknologi som bruker det vanlige telefon-kobberparet til bredbånd. Maks-rater faller raskt med avstand fra sentralen (typisk 10-100 Mbps). Asymmetrisk: nedlasting er raskere enn opplasting (derav «ADSL»).",
          },
          {
            term: "HFC (Hybrid Fiber-Coax)",
            body: "Kabel-TV-nettets svar på bredbånd. Fiber til en lokal node, koaks (TV-kabel) inn i hjemmet. Et delt medium — alle kunder på samme koaks-segment konkurrerer om båndbredde, derav «kvelds-nedgang» når alle ser Netflix.",
          },
          {
            term: "Trådløse aksessnett (WiFi, 4G/5G)",
            body: "WiFi (IEEE 802.11) er kortrekkende — typisk 10-50 meter innendørs. Mobilnett (4G LTE, 5G NR) dekker kilometer-rekkevidde fra hver basestasjon. Begge deler radiospekter mellom mange brukere og taper i forhold til fiber på både kapasitet og forsinkelses-stabilitet.",
          },
          {
            term: "Core router",
            body: "Ruter som sitter i en ISP-backbone, ikke direkte koblet til hosts. Optimalisert for veldig høy throughput — kan flytte terabits per sekund.",
          },
          {
            term: "Backbone",
            body: "Langdistanse-rygg-raden i et ISP-nettverk: linker mellom store byer eller landsdeler. Som regel fiber-baserte 100 Gbps eller 400 Gbps lenker mellom POP-er (Points of Presence) i ulike byer.",
          },
          {
            term: "Datasenter",
            body: "Konsentrert samling tusenvis til hundretusener servere med eget høy-hastighets internt nett. Edge-en av nettet du snakker med når du bruker Gmail eller Netflix er nesten alltid et datasenter, ikke en server som står et tilfeldig sted.",
          },
          {
            term: "Peering",
            body: "Avtale der to ISP-er bytter trafikk seg imellom uten å betale hverandre — fordi det er gjensidig fordel (begge slipper å betale en tredjepart). Settlement-free peering skjer typisk mellom ISP-er på samme nivå.",
          },
          {
            term: "Transit",
            body: "Avtale der ISP A betaler ISP B for å bære A-s trafikk videre til resten av internett. En liten norsk lokal-ISP kjøper transit av Telenor; Telenor kjøper transit av en tier-1 som CenturyLink.",
          },
          {
            term: "Multi-homing",
            body: "Strategi der en kunde (typisk en bedrift eller mellomstor ISP) kobler seg til flere oppstrøms-ISP-er samtidig — for redundans og lavere kostnader. Krever at kunden har et eget AS-nummer og kjører BGP.",
          },
          {
            term: "POP (Point of Presence)",
            body: "Fysisk lokasjon der en ISP har utstyr som kobler kunder, peering-partnere eller backbone-lenker sammen. Norge har f.eks. store POP-er i Oslo, Stavanger, Bergen og Tromsø.",
          },
        ]}
      />

      <Example title="Eksempel: hvorfor opplastning hjemme er tregere enn nedlastning">
        <p>
          Du har «100 Mbps fiber» hjemme, men når du laster opp en stor video til YouTube går det
          bare i 20 Mbps. Hvorfor?
        </p>
        <p className="mt-2">
          Mange aksess-nettverk er asymmetriske med vilje. ISP-ens forutsetning er at typisk
          husholdning konsumerer mye mer enn de produserer (streaming + nettlesing). Spektrumet i en
          HFC-koaks eller bæreren i en ADSL-linje deles asymmetrisk for å maksimere total
          downstream-kapasitet. FTTH-fiber er teknisk symmetrisk, men ISP-en kan likevel selge
          asymmetriske produkter for å segmentere markedet og presse bedrifter til dyrere
          symmetriske abonnement.
        </p>
      </Example>

      <Example title="Eksempel: edge vs core i en typisk forespørsel">
        <p>
          Du ser en TikTok-video. Telefonen din (edge) snakker med en CDN-node i Oslo (også edge,
          fra nettets perspektiv) gjennom seks rutere (core). Den fysiske ruten er:
        </p>
        <ol className="list-decimal pl-5 mt-1 text-[12px]">
          <li>Telefon → WiFi-router (aksess-nett)</li>
          <li>WiFi-router → ISP-ens lokale CMTS/OLT (last mile)</li>
          <li>CMTS/OLT → ISP-ens regional-POP (core, internt i ISP)</li>
          <li>Regional-POP → NIX i Oslo (IXP, peering)</li>
          <li>NIX → TikToks CDN-node hostet hos en lokal cloud-leverandør</li>
        </ol>
        <p className="mt-2 text-muted-foreground">
          Bare punkt 1-2 er edge-relatert sett fra telefonens side. Resten er core, og pakkene
          krysser flere selskaps-grenser med ulike kommersielle avtaler.
        </p>
      </Example>

      <Hvorfor>
        <p>
          Hvorfor finnes det ikke ett globalt aksess-standard, slik at vi kan ha «universal
          plug-and-play» internett uansett land? Svaret er at aksess-laget er der internett møter
          fysisk verden, og den verdenen er svært varierende. I tett befolkede byer kan man forsvare
          fiber per husstand; på spredt-bygd norsk landsbygd må man bruke radio fordi fibergrøfter
          ville koste millioner per husstand.
        </p>
        <p>
          Resultatet er at IETF har bevisst latt aksess-laget være «teknologi-uavhengig». IP-laget
          krever bare at det finnes <em>noe</em> som kan flytte bits mellom to noder; om det er
          fiber, radio, satellitt eller kobber er likegyldig. Denne separasjonen lar nye
          aksess-teknologier rulles ut (5G, Starlink) uten å endre noe i resten av nettet — en
          modularitet vi ofte tar for gitt, men som var nybrottsarbeid på 70-tallet da
          telekom-bransjen var vant til vertikalt integrerte løsninger.
        </p>
      </Hvorfor>

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

      <Section13Live />

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
            term: "FDM (Frequency-Division Multiplexing)",
            body: "Krets-svitsjings-variant der den fysiske båndbredden deles i frekvens-bånd, ett per krets. FM-radio er det klassiske eksempelet: hver kanal får sitt eget bånd. Brukt i tradisjonelt telefoni-stamnett.",
          },
          {
            term: "TDM (Time-Division Multiplexing)",
            body: "Krets-svitsjings-variant der lenken deles i tids-slots. Hver krets får hvert N-te slot uansett om den har data å sende. Klassisk i T1/E1-linjer i telefonnettet. Effektivt forutsigbar, men bortkastet kapasitet ved stille perioder.",
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
            term: "Cut-through-svitsjing",
            body: "Alternativ til store-and-forward der svitsjen begynner å videresende så snart header-en (med destinasjon) er lest, før hele pakken er ankommet. Sparer forsinkelse men kan videresende skadde pakker. Brukes i høy-ytelses datasenter-svitsjer.",
          },
          {
            term: "Køing og pakketap",
            body: "Hvis flere pakker ankommer en ruter samtidig og alle vil ut samme lenke, må noen vente i en kø. Hvis køen fylles helt opp, kastes nye pakker — det er pakketap. Pålitelige protokoller (TCP) merker pakketap og retransmitterer.",
          },
          {
            term: "Buffer (kø-buffer)",
            body: "Det fysiske minnet i ruteren der ventende pakker lagres. Hvor stor bufferen skal være er et åpent forsknings-spørsmål: for liten gir mye pakketap, for stor gir «bufferbloat» — kunstig høy forsinkelse fordi pakker venter lenge i en oppblåst kø.",
          },
          {
            term: "Connection-oriented vs connectionless",
            body: "Krets-svitsjing er connection-oriented (oppsett før sending). Pakke-svitsjing er som regel connectionless på nettverkslaget (IP) — hver pakke står for seg selv. Transportlaget (TCP) kan likevel gi et «connection-oriented» inntrykk over connectionless IP.",
          },
          {
            term: "Virtual circuit",
            body: "Hybrid: pakke-svitsjet nett som etterligner krets-svitsjing ved å sette opp en logisk sti på forhånd. Pakker følger samme rute og får sekvens-nummer, men ressurser kan deles. ATM-nettet og MPLS bruker dette mønsteret. Internett selv bruker det ikke.",
          },
          {
            term: "Burst-trafikk",
            body: "Karakteristikken som gjør pakke-svitsjing lønnsom: data kommer i støt med lange stillheter mellom. Nettlesing, e-post og filoverføring er burst-trafikk. Sann-tid lyd (uten komprimering) er motsatt — jevn lav-rate strøm, der krets-svitsjing skinner.",
          },
          {
            term: "QoS (Quality of Service)",
            body: "Mekanismer i pakke-nett som forsøker å gi visse pakke-typer (f.eks. VoIP) prioritet i køer. Ren pakke-svitsjing gir best-effort; QoS forsøker å nærme seg krets-svitsjingens forutsigbarhet uten å reservere helt.",
          },
        ]}
      />

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

      <Example title="Eksempel: store-and-forward over tre hopp">
        <p>
          En pakke på 5 000 bits skal fra A til D via to mellom-rutere B og C. Hver lenke er 1 Mbps.
          Anta null propagasjon og null prosessering.
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>A → B: 5000 / 10⁶ = 5 ms (hele pakken må inn på B)</li>
          <li>B → C: 5 ms (hele pakken må inn på C)</li>
          <li>C → D: 5 ms (hele pakken må inn på D)</li>
          <li>Total: 15 ms = N × L / R med N=3, L=5000 bit, R=1 Mbps</li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Hvis vi i stedet delte 5 000-bits-meldingen i fem pakker à 1 000 bit, kunne vi
          «pipeline-e»: mens pakke 2 sendes A→B, kan pakke 1 sendes B→C. Resultatet er at
          total-tiden faller til ~7 ms — et generelt argument for å bruke mange små pakker.
        </p>
      </Example>

      <Hvorfor>
        <p>
          Hvorfor vant pakke-svitsjing? På 60-tallet var krets-svitsjing kjent og elsket — hele
          telefon-industrien var bygget rundt det. Forskere som Paul Baran (RAND, 1964) og Donald
          Davies (UK, 1966) foreslo uavhengig pakke-svitsjing fordi de var opptatt av et helt annet
          problem enn telefoni: krigsmotstandsdyktighet og data-kommunikasjon.
        </p>
        <p>
          Datatrafikk er fundamentalt burst (lange stillheter, korte byrer), så å reservere
          ressurser var sløsing. Og en pakke-nett kan rute rundt brutte lenker pakke for pakke, mens
          en krets dør hvis ett ledd ryker. Da ARPANET ble bygget i 1969 og prøvde pakke-svitsjing i
          praksis, viste det seg overlegent for forskningssamarbeid mellom universiteter. Da
          internett vokste forbi forskningsmiljøet, hadde kostnads-fordelen ved statistisk
          multipleksing alt blitt så stor at krets-svitsjing aldri kom tilbake — selv om noen
          seriøse forsøk (ATM på 90-tallet) prøvde å bringe det inn baktråds.
        </p>
      </Hvorfor>

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

      <Section14Live />

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
            term: "Trafikk-intensitet (ρ = La / R)",
            body: "Hvor full lenken er i snitt: gjennomsnittlig ankomst-rate L·a delt på utgangs-rate R, der L er pakke-størrelse, a er pakker per sekund. ρ < 1 er sunt; ρ → 1 gir eksponentielt voksende kø-forsinkelse; ρ > 1 betyr at køen vokser uten øvre grense — katastrofalt.",
          },
          {
            term: "Throughput",
            body: "Antall bits per sekund som faktisk strømmer gjennom. End-to-end throughput er begrenset av den tregeste lenken på stien — flaskehalsen. Akkurat som vann gjennom et rør.",
          },
          {
            term: "Throughput vs båndbredde",
            body: "Båndbredde er teoretisk maks (lenke-kapasitet R). Throughput er faktisk oppnådd rate, alltid ≤ båndbredden. På en 1 Gbps lenke kan TCP-throughput være 800 Mbps på grunn av protokoll-overhead og congestion-control.",
          },
          {
            term: "Bandwidth-delay product (BDP)",
            body: "Produktet av throughput og RTT (Round-Trip Time). Gir antall bits «i transitt» på en lenke. Eksempel: 100 Mbps lenke med 50 ms RTT har BDP = 100·10⁶ × 0.05 = 5 Mbit ≈ 625 KB. TCP-vinduet må være minst BDP for å mette lenken.",
          },
          {
            term: "Pakketap-rate (loss rate)",
            body: "Andel av sendte pakker som ikke kommer fram, typisk fordi de ble droppet i en full kø. 0.1 % er typisk på sunne nett; > 1 % gir merkbar TCP-degradering.",
          },
          {
            term: "RTT (Round-Trip Time)",
            body: "Tiden fra en pakke sendes til kvittering kommer tilbake — en gangs fram + en gangs tilbake. Ping måler RTT. Brukes i nesten alle ytelses-formler (TCP-vindu, timeout, retransmit).",
          },
          {
            term: "Jitter",
            body: "Variasjonen i forsinkelse mellom pakker. Gjennomsnittlig forsinkelse kan være lav (50 ms) men hvis det svinger mellom 30 og 200 ms er det høy jitter. Sann-tid lyd/video tåler dårlig jitter — derav playout-buffer på mottakersiden.",
          },
          {
            term: "Goodput",
            body: "Faktisk nyttig datarate på applikasjonsnivå, eksklusive headere og retransmisjoner. Hvis du laster opp en 10 MB-fil og det tar 10 s, er goodput 8 Mbps — men throughput på lenken var kanskje 9 Mbps fordi protokoll-overhead spiste 1 Mbps.",
          },
          {
            term: "Traceroute / ping",
            body: "Verktøy som måler nettverks-ytelse. Ping sender ICMP echo og rapporterer RTT. Traceroute sender pakker med TTL=1, 2, 3... og noterer hvilken ruter som svarer — kart over hvert hopp og forsinkelse.",
          },
        ]}
      />

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

      <Example title="Eksempel: kø-forsinkelse når trafikk-intensiteten øker">
        <p>
          En 100 Mbps lenke får trafikk-byrer. Vi måler gjennomsnittlig kø-forsinkelse for ulike
          belastningsnivåer ρ (omtrentlige tall fra M/M/1-kø-modellen):
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>ρ = 0.5 → d_kø ≈ 0.12 ms</li>
          <li>ρ = 0.8 → d_kø ≈ 0.48 ms</li>
          <li>ρ = 0.9 → d_kø ≈ 1.08 ms</li>
          <li>ρ = 0.95 → d_kø ≈ 2.28 ms</li>
          <li>ρ = 0.99 → d_kø ≈ 11.9 ms</li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Hopp fra 90 % til 99 % belastning øker kø-forsinkelsen ti-gange. Det er hvorfor
          nettverks-ingeniører holder backbone-lenker under 50-70 % belastning som tommelfingerregel
          — siste 30 % er reserve mot kø-eksplosjon.
        </p>
      </Example>

      <Example title="Eksempel: throughput begrenset av flaskehalsen">
        <p>
          En applikasjon sender data fra server S til klient K. Stien har tre lenker: S → 1 Gbps →
          R1 → 100 Mbps → R2 → 500 Mbps → K.
        </p>
        <p className="mt-2">
          End-to-end throughput = min(1000, 100, 500) Mbps = <strong>100 Mbps</strong>. Den 100
          Mbps-lenken mellom R1 og R2 er flaskehalsen — å oppgradere den raskeste lenken til 10 Gbps
          gir null forbedring. Du må fikse flaskehalsen.
        </p>
        <p className="mt-1 text-muted-foreground">
          I praksis er flaskehalsen ofte aksess-nettet hjemme hos brukeren, så internett-tjenester
          dimensjoneres med dette i tankene.
        </p>
      </Example>

      <Hvorfor>
        <p>
          Hvorfor brytes forsinkelsen i nettopp fire komponenter? Hvorfor ikke tre eller seks? Den
          firdelte modellen (d_proc + d_kø + d_trans + d_prop) er en pedagogisk konvensjon, men den
          er valgt fordi hver komponent har ulik <em>natur</em>:
        </p>
        <ul className="list-disc pl-5 text-[12px] mt-1">
          <li>
            <strong>d_proc</strong> avhenger av rutere-hardware → kan forbedres med raskere chips.
          </li>
          <li>
            <strong>d_kø</strong> avhenger av trafikk-belastning → kan forbedres med
            kapasitets-utvidelse.
          </li>
          <li>
            <strong>d_trans</strong> avhenger av lenke-rate → kan forbedres med raskere
            fiber/elektronikk.
          </li>
          <li>
            <strong>d_prop</strong> avhenger av avstand og lysets hastighet → <em>kan ikke</em>{" "}
            forbedres uten å flytte serveren.
          </li>
        </ul>
        <p className="mt-2">
          Modellen gjør at en ingeniør med en målt forsinkelse på 200 ms kan diagnostisere
          flaskehalsen riktig. Den ble formalisert i Leonard Kleinrocks doktoravhandling om køteori
          for nett (MIT 1962) — samme arbeid som la teorien bak ARPANET. Alternative modeller
          (f.eks. én samlet «service time») mister diagnose-styrken; de gjør formelen enklere men
          gjør verden uleselig.
        </p>
      </Hvorfor>

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

      <Section15Live />

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
            term: "Innkapsling (encapsulation)",
            body: "Hver lag legger sitt eget header foran (og noen ganger trailer bak) meldingen før den sendes ned til neste lag. Mottakeren skreller av lag for lag oppover. Det er innkapsling som gjør at lagene kan være uavhengige av hverandre.",
          },
          {
            term: "Header vs payload",
            body: "Hver pakke består av header (metadata: avsender, mottaker, sekvens, sum-sjekk) og payload (selve dataene). Når et lag innkapsler en pakke fra laget over, blir hele forrige pakke (header + payload) til ny payload, og nytt header legges foran.",
          },
          {
            term: "PDU (Protocol Data Unit)",
            body: "Generisk navn på en pakke på et gitt lag. Applikasjonslagets PDU heter «melding», transportlagets «segment», nettverkslagets «datagram» (eller «pakke»), linklagets «ramme», fysisk lags «bit».",
          },
          {
            term: "Service model",
            body: "Tjenesten et lag tilbyr laget over. Transportlagets service-model kan være «pålitelig levering, riktig rekkefølge, byte-strøm» (TCP) eller «best-effort melding-levering» (UDP). Nettverkslaget tilbyr bare best-effort.",
          },
          {
            term: "Horisontal vs vertikal kommunikasjon",
            body: "Vertikalt: ett lag snakker med laget over og under (lokalt på hver host). Horisontalt (logisk): samme lag på to ulike hosts «snakker» med hverandre via header-felter — selv om pakkene fysisk reiser ned-på-tråden-opp.",
          },
          {
            term: "OSI-modellen (7 lag)",
            body: "Standardisering fra ISO på 80-tallet med 7 lag (legger session og presentation mellom transport og applikasjon). Et akademisk forsøk på å standardisere alt — fungerte best som pedagogisk referanseramme. Internett bruker TCP/IP-modellen i praksis.",
          },
          {
            term: "Session-lag og presentation-lag",
            body: "OSI-spesifikke lag som internett ikke har som egne lag. Session: opprettholdelse av en logisk samtale (cookies, login). Presentation: koding/avkoding (JSON, MIME, kryptering). I TCP/IP er disse en del av applikasjonslaget.",
          },
          {
            term: "Demultipleksing",
            body: "Når en pakke ankommer en host, må riktig protokoll/applikasjon få den. Linklaget bruker «type»-feltet (IPv4? IPv6? ARP?). Transportlaget bruker portnumre (HTTP? SSH?). Applikasjonen leser data via socket-en.",
          },
          {
            term: "End-to-end-prinsippet",
            body: "Designprinsipp: legg funksjonalitet så høyt i stakken som mulig — typisk på endene, ikke i nettet. Pålitelighet ligger i TCP (på hosts), ikke i rutere. Argumentet: nettet trenger ikke gjøre noe et lag over kan gjøre, og enkle rutere skalerer.",
          },
        ]}
      />

      <Example title="Eksempel: innkapsling på vei ned, dekapsling på vei opp">
        <p>
          Du sender meldingen «hei» via en chat-app fra Tromsø til Oslo. Applikasjonslaget bygger en
          JSON-melding (~30 bytes). På vei ned stakken legger hver lag på sitt header:
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>App-data: 30 B (selve meldingen)</li>
          <li>+ TCP-header (20 B) = 50 B (transportlag-segment)</li>
          <li>+ IP-header (20 B) = 70 B (nettverkslag-datagram)</li>
          <li>+ Eth-header (14 B) + trailer (4 B) = 88 B (linklag-ramme)</li>
        </ul>
        <p className="mt-2">
          88 bytes fysisk sendt over WiFi for å levere 30 bytes nyttig data — 66 % overhead. På
          mottaker-siden i Oslo skreller hver lag av sitt header på vei opp, og chat-appen får
          tilbake «hei». Hver lag er uvitende om hva som ligger over og under — kun grensesnittene
          mellom dem er definert.
        </p>
      </Example>

      <Example title="Eksempel: hvorfor TCP ikke ligger i rutere">
        <p>
          Anta et alternativt internett der hver ruter måtte forstå TCP og kvittere på pakker.
          Konsekvenser:
        </p>
        <ul className="list-disc pl-5 mt-1 text-[12px]">
          <li>En core-ruter må holde state for hver av millioner samtidige TCP-tilkoblinger.</li>
          <li>State-tap (en ruter restartes) bryter alle tilkoblinger som gikk gjennom den.</li>
          <li>
            Endring i TCP (f.eks. nytt congestion-control) krever oppgradering av alle rutere
            globalt.
          </li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Internetts valg om å la pålitelighet ligge på endene (hosts) er end-to-end-prinsippet i
          praksis. Det er hvorfor TCP-utviklingen (Cubic, BBR) kan gjøres bare av Linux-kjernen og
          Googles servere, uten å røre én ruter i verden.
        </p>
      </Example>

      <Hvorfor>
        <p>
          Hvorfor i det hele tatt et lag-mønster? Hvorfor ikke én monolittisk protokoll-stak som
          gjør alt fra HTTP til radio-signaler? Svaret er at modularitet er den eneste måten å
          skalere et system med så mange aktører som internett.
        </p>
        <p>
          Lag-modellen lar 100 ulike applikasjonsprotokoller dele samme TCP-implementasjon, og lar
          TCP kjøre over IPv4, IPv6, eller hva som måtte komme i fremtiden. Det lar Ethernet
          erstattes med WiFi uten å endre IP, og lar Ethernet selv bytte fra 10 Mbps koaks (1980)
          til 100 Gbps fiber (2020) uten at noen oppe i stakken merker noe. Hadde alt vært tett
          koblet, ville hver innovasjon krevd omstart av hele økosystemet.
        </p>
        <p>
          Hvorfor 5 lag og ikke 7? OSI-modellen forsøkte å standardisere session og presentation som
          egne lag på 80-tallet, men i praksis viste det seg at applikasjoner ville håndtere disse
          selv (eller bruke biblioteker som SSL/TLS) — det var ikke nødvendig å gi dem plass i
          stakken. TCP/IP-modellens 5 lag (eller 4, hvis du slår sammen fysisk og link) vant ved å
          være enklere og raskere å implementere. Et klassisk eksempel på at den enkle standarden
          vinner over den «riktige».
        </p>
      </Hvorfor>

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

      <Exercise
        question="En lenke har kapasitet 1 Gbps. Trafikk-intensiteten ρ er 0.85. Pakke-størrelsen er 1000 bytes. Anta M/M/1-kø der gjennomsnittlig kø-forsinkelse er (L/R) · ρ / (1−ρ). Hva er gjennomsnittlig kø-forsinkelse, og hva skjer hvis ρ øker til 0.95?"
        hint="Regn først L/R for én pakke. Sett deretter inn ρ = 0.85, så ρ = 0.95."
        answer={
          <>
            <p className="font-mono text-[12px]">
              L/R = 8000 bit / 10⁹ bps = 8 μs
              <br />
              ρ=0.85 → d_kø = 8 μs · 0.85 / 0.15 ≈ 45 μs
              <br />
              ρ=0.95 → d_kø = 8 μs · 0.95 / 0.05 = 152 μs
            </p>
            <p className="mt-1">
              Kø-forsinkelse mer enn tre-doblet seg ved å øke belastningen 10 prosentpoeng. Det er
              hvorfor backbone-lenker dimensjoneres med god margin — siste 15 % kapasitet er
              «brann-reserve», ikke noe man planlegger å bruke.
            </p>
          </>
        }
      />

      <Exercise
        question="En bedrift har valget mellom (A) en 100 Mbps fiber-tilknytning fra én ISP, eller (B) to 50 Mbps fiber-tilknytninger fra to ulike ISP-er med multi-homing. Sammenlikne på kapasitet, redundans og kostnad. I hvilke situasjoner velger du (B)?"
        hint="Tenk på hva som skjer hvis én ISP får et utfall."
        answer={
          <>
            <p>
              <strong>(A)</strong> gir 100 Mbps total, billigere, enklere konfigurasjon. Men hvis
              den ene ISP-en har utfall, er bedriften offline.
            </p>
            <p className="mt-1">
              <strong>(B)</strong> gir bare 100 Mbps i sum-kapasitet (eller mindre, avhengig av
              ECMP/BGP-policy), koster dobbelt så mye, og krever at bedriften har eget AS-nummer og
              kjører BGP. Til gjengjeld overlever bedriften om én ISP ryker.
            </p>
            <p className="mt-1">
              (B) velges når oppetid er kritisk: nettbutikker, sykehus, finans-tjenester, eller
              SaaS-leverandører hvor 1 % nedetid betyr millioner i tapt omsetning. For et vanlig
              kontor er (A) mer enn nok.
            </p>
          </>
        }
      />

      <Exercise
        question="En tjeneste streamer video i 5 Mbps. Du har valg mellom UDP (uten retransmit, godtar pakketap) og TCP (pålitelig, men retransmitterer ved tap). Anta at pakketap er 2 % på lenken og RTT er 100 ms. Hvilken protokoll er sannsynligvis best, og hvorfor?"
        hint="Tenk på hva en retransmitt koster i forsinkelse, og hva et lite pakketap koster i video-kvalitet."
        answer={
          <>
            <p>
              <strong>UDP</strong> er sannsynligvis bedre. Argument: en retransmittert pakke
              ankommer minst én RTT for sent (≥ 100 ms), og videoen er da allerede spilt videre.
              Pakken kastes uansett. Med 2 % tap mister man 2 % av rammer/lyd-frames, som moderne
              codecs (H.264, Opus) håndterer ved interpolering eller forward-error-correction.
            </p>
            <p className="mt-1">
              TCP ville derimot blokkere strømmen i 100+ ms ved hvert tap (head-of-line-blokkering),
              føre til at buffer tømmes og avspilling stopper. Det er hvorfor sann-tid video (Zoom,
              FaceTime) bruker UDP/RTP, mens lagret video (YouTube) der pre-buffring er mulig kan
              bruke TCP/HTTP.
            </p>
          </>
        }
      />

      <Exercise
        question="Sammenlikne nedlasting av en 5 GB Linux-ISO via (A) HTTP fra én sentral server, eller (B) BitTorrent fra mange peers. Anta serveren har 100 Mbps opplastning og 200 personer laster ned samtidig. Hver peer har 50 Mbps nedlasting og 10 Mbps opplastning."
        hint="For (A): hvordan deles serverens opplastnings-kapasitet? For (B): hvordan utnyttes peer-enes opplastning?"
        answer={
          <>
            <p>
              <strong>(A) HTTP:</strong> 100 Mbps / 200 = 0.5 Mbps per nedlaster. 5 GB = 40 Gbit /
              0.5 Mbps = 80 000 sekunder ≈ 22 timer. Serveren er flaskehalsen.
            </p>
            <p className="mt-1">
              <strong>(B) BitTorrent:</strong> hver peer bidrar med 10 Mbps opplastning. Total
              opplastnings-kapasitet i sverm = 100 (server) + 200·10 = 2100 Mbps fordelt på 200
              nedlastere = 10.5 Mbps per nedlaster (begrenset opp av peers nedlastnings-kapasitet,
              men her er det ingen begrensning). Tid: 40 Gbit / 10.5 Mbps ≈ 3 800 s ≈ 1 time.
            </p>
            <p className="mt-1">
              BitTorrent skalerer fordi nedlastere blir kilder. Det er hvorfor store
              programvare-distribusjoner (Linux-ISO-er, Blizzard-spill) bruker P2P-deler for
              lansering: kapasiteten øker med antall brukere i stedet for å avta.
            </p>
          </>
        }
      />

      <Exercise
        question="En satellitt-lenke i geostasjonær bane (36 000 km opp) bærer en TCP-tilkobling med 10 Mbps båndbredde. Beregn RTT (kun propagasjon) og bandwidth-delay-product. Hva betyr BDP for TCP-vinduet?"
        hint="Lyset bruker 36 000 km / (3·10⁸ m/s) hver vei. RTT er fram + tilbake."
        answer={
          <>
            <p className="font-mono text-[12px]">
              Enveis-propagasjon: 36·10⁶ / (3·10⁸) = 120 ms
              <br />
              RTT = 2 · 120 ms = 240 ms
              <br />
              BDP = 10 Mbps · 0.24 s = 2.4 Mbit = 300 KB
            </p>
            <p className="mt-1">
              For å mette lenken må TCP-vinduet være minst 300 KB. Standard TCP-vindu er 64 KB (uten
              window-scaling) — uten utvidelse ville lenken bare brukes til 64/300 = 21 % av
              kapasiteten. Det er hvorfor window-scaling (RFC 1323) finnes. Geostasjonær satellitt
              er ekstrem; Starlink (LEO, 550 km) reduserer RTT til ~20 ms og er mye TCP-vennligere.
            </p>
          </>
        }
      />

      <Exercise
        question="En ruter har en utgangskø som rommer 50 pakker. Pakker ankommer Poisson-fordelt med rate 1000 pkt/s og lenken kan sende 1200 pkt/s. Stiger eller faller køen i snitt? Hva er ρ?"
        hint="ρ = ankomst-rate / service-rate. Køen vokser kun hvis ρ > 1."
        answer={
          <>
            <p className="font-mono text-[12px]">
              ρ = 1000 / 1200 ≈ 0.83
              <br />ρ &lt; 1 → køen er stabil i det lange løp
            </p>
            <p className="mt-1">
              Selv om ρ &lt; 1, kan køen i korte perioder fylles helt opp (50 pakker) og forårsake
              pakketap — Poisson-byrer kan slå opp midlertidig over service-raten. Sannsynligheten
              for tap krever en full M/M/1/K-analyse. Tommelfingerregel: ρ ≥ 0.8 betyr du må regne
              med periodiske tap selv om lenken «teknisk» har kapasitet.
            </p>
          </>
        }
      />

      <Exercise
        question="Forklar i tre setninger hvorfor IPv6 ble nødvendig, og hvorfor utrullingen tar tiår tross at IPv4-adressene formelt gikk tom i 2011."
        hint="Tenk på adresse-rom, NAT, bakoverkompatibilitet og inter-domene-koordinering."
        answer={
          <>
            <p>
              IPv4-adresserommet (~4.3 milliarder adresser) ble for lite for hver mobiltelefon,
              IoT-enhet og server i verden. IPv6 utvider til 2¹²⁸ adresser — i praksis ubegrenset.
            </p>
            <p className="mt-1">
              Men utrulling er treg fordi IPv4 og IPv6 ikke er bakover-kompatible: en IPv6-host kan
              ikke snakke direkte med en IPv4-host. NAT (Network Address Translation) lar mange
              hosts dele én IPv4-adresse, så akutt mangel ble dempet og insentivet til IPv6 svekket.
            </p>
            <p className="mt-1">
              Resultatet er en parallell-eksistens som har vart i 25+ år: nettverk må kjøre begge
              protokollene (dual-stack), noe som er dyrt og komplekst. Pr. 2025 går ca. 45 % av
              global trafikk over IPv6, mest drevet av mobil-operatører som ikke har nok IPv4 til
              kunder.
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

function Hvorfor({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-cyan-700 dark:text-cyan-400 font-semibold mb-1">
        Hvorfor er det slik?
      </div>
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
