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

type Tab = "intro" | "7.1" | "7.2" | "7.3" | "7.4" | "7.5" | "7.6" | "7.7";


const SECTIONS_7: SectionNavItem[] = [
  { id: "intro", label: "Start her" },
  { id: "7.1", label: "7.1 Radio-karakteristikker" },
  { id: "7.2", label: "7.2 WiFi 802.11" },
  { id: "7.3", label: "7.3 Cellular" },
  { id: "7.4", label: "7.4 Mobilitet" },
  { id: "7.5", label: "7.5 Håndover" },
  { id: "7.6", label: "7.6 TCP & wireless" },
  { id: "7.7", label: "7.7 Oppgaver" },
];
const NEXT_CHAPTER_7 = { slug: "kurose-kap-8", title: "Sikkerhet i nettverk" };

export function KuroseKap7Page() {
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
            <span>Kapittel 7 av 9</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Kap. 7 — Trådløst og mobilt</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Når lenken er luft i stedet for kobber, endrer reglene seg. Vi ser på hvorfor radio er
            uberegnelig, hvordan WiFi unngår kollisjoner uten å høre dem, og hvordan en mobil host
            holder TCP-forbindelsen i live mens den hopper mellom basestasjoner.
          </p>
        </header>

        <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border">
          <TabBtn active={tab === "intro"} onClick={() => setTab("intro")}>
            Start her
          </TabBtn>
          <TabBtn active={tab === "7.1"} onClick={() => setTab("7.1")}>
            7.1 Radio-karakteristikker
          </TabBtn>
          <TabBtn active={tab === "7.2"} onClick={() => setTab("7.2")}>
            7.2 WiFi 802.11
          </TabBtn>
          <TabBtn active={tab === "7.3"} onClick={() => setTab("7.3")}>
            7.3 Cellular
          </TabBtn>
          <TabBtn active={tab === "7.4"} onClick={() => setTab("7.4")}>
            7.4 Mobilitet
          </TabBtn>
          <TabBtn active={tab === "7.5"} onClick={() => setTab("7.5")}>
            7.5 Håndover
          </TabBtn>
          <TabBtn active={tab === "7.6"} onClick={() => setTab("7.6")}>
            7.6 TCP &amp; wireless
          </TabBtn>
          <TabBtn active={tab === "7.7"} onClick={() => setTab("7.7")}>
            7.7 Oppgaver
          </TabBtn>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "7.1" && <Section71 />}
        {tab === "7.2" && <Section72 />}
        {tab === "7.3" && <Section73 />}
        {tab === "7.4" && <Section74 />}
        {tab === "7.5" && <Section75 />}
        {tab === "7.6" && <Section76 />}
        {tab === "7.7" && <Section77 />}

        <SectionPager tabs={SECTIONS_7} current={tab} onPick={(id) => setTab(id as Tab)} nextChapter={NEXT_CHAPTER_7} />

        <ChapterPager
          prev={{ slug: "kurose-kap-6", title: "Link-laget og LAN" }}
          next={{ slug: "kurose-kap-8", title: "Sikkerhet i nettverk" }}
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
            Forklare hvorfor en radio-lenke oppfører seg fundamentalt annerledes enn en kobber-lenke
            — svekning over avstand, multipath-fading, ekstern interferens, og hidden terminal.
          </li>
          <li>
            Beskrive hvordan 802.11 (WiFi) bruker CSMA/CA med backoff, DIFS/SIFS-tider, og valgfri
            RTS/CTS for å unngå kollisjoner som ingen kan høre.
          </li>
          <li>
            Forstå celle-arkitekturen i mobilnett og hvordan generasjonene fra GSM via LTE til 5G
            har skiftet fra krets-svitsjet stemme til all-IP pakke-svitsjet kjerne.
          </li>
          <li>
            Forklare problemet med å adressere en bevegelig host og hvordan home agent + foreign
            agent (Mobile IP) eller tunneling i mobilkjernen løser det.
          </li>
          <li>
            Skille hard fra soft håndover, og vite hva som må synkroniseres for at en aktiv
            TCP-strøm skal overleve en AP-bytte i WiFi eller en celle-bytte i 5G.
          </li>
          <li>
            Diagnostisere hvorfor TCP straffer trådløse strekninger urettferdig: pakketap fra
            radio-feil tolkes som congestion og utløser unødvendig rate-halvering.
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Kapittelets struktur</h2>
        <ol className="list-decimal pl-5 text-muted-foreground space-y-1">
          <li>Hva som gjør radio vanskelig — fysikk og hidden terminal</li>
          <li>WiFi 802.11 — frame-strukturen og CSMA/CA-dansen</li>
          <li>Cellular — celler, basestasjoner, og generasjons-historien</li>
          <li>Mobilitet — hvordan adressere en host som flytter seg</li>
          <li>Håndover — hard vs soft, og hva som må overføres</li>
          <li>TCP i en støyete verden — hvorfor wireless gjør vondt</li>
          <li>Oppgaver — sjekk forståelsen din</li>
        </ol>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => onPick("7.1")}>
            Start på 7.1 →
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 7.1 — Trådløse karakteristikker
// ============================================================
function Section71() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="7.1" title="Trådløse karakteristikker" />

      <p className="text-muted-foreground">
        Radio er ikke bare «kabel uten kobber». Signalet blir svakere med avstand, det reflekteres
        av vegger og kommer fram til mottakeren i flere kopier som forstyrrer hverandre, og en nabos
        mikrobølgeovn kan utslette dataframen din. Verst av alt: to sendere som ikke kan høre
        hverandre kan likevel kollidere hos en mottaker mellom dem. Alle protokoll-valgene i WiFi og
        mobilnett er svar på en eller flere av disse problemene.
      </p>

      <Defs
        items={[
          {
            term: "Path loss (avstands-svekning)",
            body: "Signal-styrken faller som inversen av avstanden kvadrert i fritt rom, og enda raskere innendørs der vegger absorberer. Dobler du avstanden, mister du minst 6 dB. Det er derfor en AP i et stort kontor må kompromisse mellom rekkevidde og data-rate.",
          },
          {
            term: "Multipath-fading",
            body: "Signalet tar flere veier — direkte, via veggen, via taket — og kommer fram med ulike forsinkelser. Når kopiene addereres kan de forsterke (konstruktivt) eller utslette (destruktivt) hverandre. Flytter du laptopen 10 cm kan signalet hoppe fra 5 streker til 1.",
          },
          {
            term: "SNR (signal-to-noise ratio)",
            body: "Forholdet mellom ønsket signal-styrke og bakgrunns-støy, målt i dB. Modulasjons-skjemaet i WiFi (BPSK, QPSK, ulike QAM) velges adaptivt etter SNR: høy SNR → mange bits per symbol → høy data-rate; lav SNR → robust modulasjon med færre bits.",
          },
          {
            term: "Ekstern interferens",
            body: "2.4 GHz-båndet deles med Bluetooth, mikrobølgeovner, trådløse telefoner og babymonitorer. 5 GHz er mindre overfylt. Interferens-kilder utenfor protokollen kan ikke høres av CSMA — de bare ødelegger pakker uten forvarsel.",
          },
          {
            term: "Hidden terminal-problemet",
            body: "Station A og station C kan begge høre access-pointet AP, men ikke hverandre (fordi en vegg eller for stor avstand står imellom). Begge tror lufta er ledig, begge sender samtidig, og pakkene kolliderer ved AP. Klassisk CSMA/CD hjelper ikke — sendere kan ikke detektere kollisjonen i sitt eget radio-felt.",
          },
          {
            term: "Exposed terminal-problemet",
            body: "Speilbildet: B hører at en nabo A sender, og holder igjen sin egen sending selv om B sin tiltenkte mottaker D er utenfor A sin rekkevidde og ikke ville blitt forstyrret. Konservativ CSMA gir tapt kapasitet.",
          },
          {
            term: "Half-duplex radio",
            body: "Et standard WiFi-grensesnitt kan ikke sende og lytte samtidig på samme frekvens — radioens egen sender ville druknet en mye svakere innkommende signal. Derfor kan du ikke detektere kollisjoner under sending slik Ethernet gjør.",
          },
        ]}
      />

      <Illustration caption="Hidden terminal: A og C hører begge AP, men ikke hverandre. AP får krasjete signaler.">
        <HiddenTerminalSvg />
      </Illustration>

      <Example title="Eksempel: hvorfor 5 streker plutselig blir 1 strek">
        <p>
          Du sitter ved kjøkkenbordet med full WiFi-styrke. Du flytter laptopen 15 cm til høyre for
          å bedre lyset, og plutselig faller forbindelsen til 1 strek og videoen begynner å buffre.
        </p>
        <p className="mt-2">
          Det er multipath-fading. På den nye posisjonen ankommer den direkte radio-bølgen og en
          refleksjon fra et metallisk kjøkkenskap i nesten motfase. De to bølgene utslettet
          hverandre delvis. Radioen din senker modulasjons-rate fra 256-QAM ned til BPSK for å
          fortsatt få noe gjennom — derav den lave throughputen, ikke faktisk tap av forbindelse.
        </p>
        <p className="mt-2 text-muted-foreground">
          Dette er hvorfor moderne WiFi-rutere bruker MIMO (flere antenner): hver antenne ser en
          litt ulik kombinasjon av reflekser, og mottakeren kombinerer dem matematisk for å unngå
          fading-hull.
        </p>
      </Example>

      <RelatedSlugs slugs={["dte2507-wifi-csma-ca"]} />
    </article>
  );
}

// ============================================================
// 7.2 — WiFi 802.11
// ============================================================
function Section72() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="7.2" title="WiFi 802.11 — CSMA/CA og frame-strukturen" />

      <p className="text-muted-foreground">
        Siden radioer er half-duplex og kollisjoner ikke kan detekteres mens man sender, snur WiFi
        problemet på hodet: i stedet for «detect» bruker vi <em>avoidance</em>. Hver station venter
        til lufta er stille, deretter venter litt til (en tilfeldig backoff), og sender bare hvis
        ingen andre kom dem i forkjøpet. Mottakeren bekrefter med ACK; uteblitt ACK betyr at framen
        gikk tapt og må sendes på nytt.
      </p>

      <Defs
        items={[
          {
            term: "CSMA/CA (Carrier Sense Multiple Access with Collision Avoidance)",
            body: "WiFi sin grunnleggende tilgangs-protokoll. Lytt først; hvis ledig, vent en DIFS-periode og deretter en tilfeldig antall slot-tider (backoff). Send. Vent på ACK. Hvis ingen ACK kommer, doble maks-backoff og forsøk igjen.",
          },
          {
            term: "DIFS (DCF Interframe Space)",
            body: "Den lengste obligatoriske stille-perioden — ca. 34 μs i 802.11n — som hver ny sending må vente etter at lufta ble ledig. Lengre enn SIFS for å gi prioritet til pågående transaksjoner.",
          },
          {
            term: "SIFS (Short Interframe Space)",
            body: "Den korteste stille-perioden, ca. 16 μs, som brukes mellom relaterte rammer (data-ACK, RTS-CTS-DATA-ACK). Kort fordi vi ikke vil at noen andre skal sno seg inn mellom dem.",
          },
          {
            term: "Backoff-vindu (CW)",
            body: "Etter DIFS velger station et tilfeldig heltall mellom 0 og CW, og venter dette antall slot-tider. Telle-ned pauser hvis lufta blir opptatt; gjenoppta etter ny DIFS. Vinneren av loddtrekningen sender; taperne fortsetter neste runde med samme telling.",
          },
          {
            term: "RTS/CTS (Request-To-Send / Clear-To-Send)",
            body: "Valgfri mekanisme mot hidden terminal: sender ber AP om plass med en liten RTS-frame; AP svarer med CTS som alle innen rekkevidde av AP hører. CTS reserverer mediet (via NAV — Network Allocation Vector) i en kjent tidsperiode, så også skjulte stationer holder seg unna.",
          },
          {
            term: "Beacon-frame",
            body: "AP-en kringkaster en beacon hver ~100 ms med nettverksnavn (SSID), kapasiteter, og en synkroniserings-tidsstempel. Beacon-en er hvordan klienter finner og holder kontakten med nettet, og hvordan power-save fungerer (klienten kan sove mellom beacons).",
          },
          {
            term: "Assosiasjon",
            body: "Før en station kan sende data må den (1) finne en AP via passiv scan av beacons eller aktiv probe, (2) autentisere, og (3) assosiere — formelt si fra hvilket nett man tilhører. Først etter assosiasjon mottar AP-en data-frames fra stationen.",
          },
        ]}
      />

      <Illustration caption="CSMA/CA-sekvens: lytt → DIFS → backoff → send → SIFS → ACK.">
        <CsmaCaSvg />
      </Illustration>

      <Example title="Eksempel: to stationer kjemper om lufta">
        <p>
          Station X og Y vil begge sende. Lufta blir ledig kl. 0. Begge venter DIFS (34 μs). X
          trekker tilfeldig backoff = 5 slots, Y trekker 9 slots. Slot-tid er 9 μs.
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>kl. 34 μs: DIFS ferdig, telle-ned starter</li>
          <li>kl. 34 + 5·9 = 79 μs: X når 0 først og sender frame</li>
          <li>Y fryser telle-ned med rest 4 slots</li>
          <li>X sin frame + SIFS + ACK ferdig; ledig igjen</li>
          <li>kl. ny start + DIFS: Y fortsetter med 4 slots, sender uten å trekke på nytt</li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Hvis begge hadde trukket backoff = 5, ville de sendt samtidig. Det er en faktisk kollisjon
          — AP-en hører bare støy, ingen ACK kommer tilbake, og begge dobler sitt CW-vindu og prøver
          på nytt. Eksponentiell backoff sikrer at situasjonen ikke gjentar seg uendelig.
        </p>
      </Example>

      <RelatedSlugs slugs={["dte2507-wifi-csma-ca"]} />
    </article>
  );
}

// ============================================================
// 7.3 — Cellular
// ============================================================
function Section73() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="7.3" title="Cellular — celler, basestasjoner, og generasjoner" />

      <p className="text-muted-foreground">
        Mobilnett er bygget rundt en helt annen arkitektur enn WiFi. Geografien deles i celler
        (typisk 100 m – flere km i radius); hver celle har én basestasjon som koordinerer all
        radio-trafikk; en sentral kjerne ruter samtaler og data ut på resten av nettet. Generasjon
        for generasjon har kjernen blitt mer og mer lik vanlig internett, mens radio-grensesnittet
        har blitt smartere.
      </p>

      <Defs
        items={[
          {
            term: "Celle",
            body: "Et geografisk område dekket av én basestasjon. Naboceller bruker ulike frekvenser slik at de ikke forstyrrer hverandre. Frekvenser kan gjenbrukes i celler som ligger langt fra hverandre — det kalles frequency reuse, og er hele grunnen til at mobilnett skalerer.",
          },
          {
            term: "Basestasjon",
            body: "Antennen med tilhørende radio-utstyr på toppen av en mast eller et bygg. Het BTS i 2G, NodeB i 3G, eNodeB i 4G/LTE, og gNodeB i 5G. Snakker både med mobil-enhetene over radio og med kjernen over fiber.",
          },
          {
            term: "Kjernenettet",
            body: "Den faste delen av mobilnettet — switcher, rutere, databaser med abonnement-info, gateways til internett. Het MSC i GSM, hadde tillegget GPRS for pakke-data i 2.5G, og er nå et flatt IP-nett (EPC i 4G, 5GC i 5G).",
          },
          {
            term: "GSM (2G)",
            body: "Krets-svitsjet for tale, opprinnelig ingen data. TDMA + FDMA: hver bruker fikk en frekvens og et tidsslot. Lagt til GPRS rundt 2000 for å smugle pakke-data inn over samme radio — det var den første egentlig mobile internett-tilgangen.",
          },
          {
            term: "LTE (4G)",
            body: "Helt pakke-svitsjet. Bruker OFDMA på radio — frekvensbåndet deles i tusenvis av smale subbærere som tildeles dynamisk per bruker. Tale går over IP via VoLTE. Kjernen (EPC) er ren IP-ruting med spesielle gateways (S-GW, P-GW) for å håndtere mobilitet.",
          },
          {
            term: "5G",
            body: "Tre hovedforbedringer: høyere kapasitet (millimeter-bånd, 24–100 GHz, med massive MIMO), lavere forsinkelse (under 10 ms ende-til-ende), og network slicing (samme fysiske nett presentert som flere logisk separate nett med ulike egenskaper for IoT, biler, video etc.). Kjernen (5GC) er service-orientert og bygget på containere.",
          },
          {
            term: "Frequency reuse",
            body: "Mønsteret som lar de samme frekvensene brukes om igjen i ikke-nabo-celler. Et reuse-tall N = 7 betyr at hver frekvens-gruppe gjentas hver 7. celle. Lavere N = mer kapasitet, men mer risiko for interferens fra fjern-celler.",
          },
        ]}
      />

      <Illustration caption="Sekskant-mønsteret med fargede frekvens-grupper og kjernens kobling ut på internett.">
        <CellularTopologySvg />
      </Illustration>

      <Example title="Eksempel: en SMS i 2G vs en TikTok-video i 5G">
        <p>
          En SMS i GSM (1995): du komponerer 160 tegn, telefonen sender dem som en
          signalerings-melding over kontroll-kanalen (ikke engang en datakanal) til basestasjonen,
          MSC ruter til mottakerens hjem-MSC, og leveres når mottaker-telefonen er i dekning. Hele
          konseptet er krets-svitsjet styring, ikke pakker.
        </p>
        <p className="mt-2">
          En TikTok-video i 5G: telefonen får tildelt en bunt med OFDMA-subbærere i én millisekund,
          gNodeB encoder pakker over fiber til UPF-en (User Plane Function) som er en helt vanlig
          IP-ruter, derfra ut på internett til TikTok sitt CDN. Hele veien er det IP-pakker, og den
          eneste forskjellen fra fast fiber er at radio-leddet bruker en mer komplisert forhandling
          av modulasjons-rate hvert millisekund.
        </p>
      </Example>

      <RelatedSlugs slugs={["dte2507-wifi-csma-ca"]} />
    </article>
  );
}

// ============================================================
// 7.4 — Mobilitet
// ============================================================
function Section74() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="7.4" title="Mobilitet — adressere en host som flytter seg" />

      <p className="text-muted-foreground">
        IP-adresser ble designet rundt antakelsen at en host står stille på ett subnet. Når den
        flytter seg til et nytt nett, får den en ny adresse — og åpne forbindelser (som bruker
        gammelt IP) brytes. For å løse dette må noen et sted vite både hvor hosten «hører hjemme» og
        hvor den er akkurat nå, og videresende pakker fra det første til det andre. Det er det
        Mobile IP og mobil-kjernens GTP-tunneling gjør.
      </p>

      <Defs
        items={[
          {
            term: "Home network",
            body: "Det nettet hvor mobil-hostens permanente IP-adresse hører hjemme. Andre maskiner sender pakker til denne adressen som om hosten alltid er der.",
          },
          {
            term: "Home agent (HA)",
            body: "En ruter på hjemnettet som vet hvor mobil-hosten er akkurat nå. Når pakker kommer til hjem-adressen mens hosten er borte, fanger HA dem opp og videresender til den nåværende lokasjonen.",
          },
          {
            term: "Foreign network og foreign agent (FA)",
            body: "Nettet hosten er på akkurat nå, og en lokal ruter som hjelper med å registrere hosten og motta videresendte pakker. Den mobile hosten får en midlertidig care-of-adresse på dette nettet.",
          },
          {
            term: "Care-of-address (COA)",
            body: "Den midlertidige adressen mobil-hosten har akkurat nå. Den fungerer bare lokalt; eksterne korrespondenter vet ingenting om den. Når hosten flytter til et nytt foreign network, får den ny COA og må melde fra til HA.",
          },
          {
            term: "Tunneling",
            body: "HA pakker hver innkommende pakke (med hjem-adresse som destinasjon) inn i en ny ytre IP-pakke med COA som destinasjon, og sender den til foreign network. FA pakker ut og leverer den indre pakken til hosten. Hosten ser fortsatt sitt eget hjem-IP som destinasjon — derfor brytes ikke TCP-forbindelser.",
          },
          {
            term: "Triangle routing",
            body: "Bivirkningen av indirect routing: alle pakker til hosten må først innom HA, selv om korrespondenten er rett ved siden av foreign network. Direkte ruting (route optimization) lar korrespondenten cache COA og sende rett dit — på bekostning av at korrespondent-stacken må forstå Mobile IP.",
          },
          {
            term: "GTP i mobilkjernen",
            body: "Mobilnett gjør i praksis det samme prinsipielt, men med GTP-tunneler (GPRS Tunneling Protocol) mellom basestasjon og gateway. Når telefonen flytter seg mellom celler, oppdateres tunnel-endepunktet uten at telefonens IP endrer seg.",
          },
        ]}
      />

      <Illustration caption="Pakkens omvei via home agent og inn-pakking til foreign network.">
        <MobileIpSvg />
      </Illustration>

      <Example title="Eksempel: video-samtale mens du tar bussen">
        <p>
          Du sitter på bussen i en Teams-samtale. Telefonen har IP <code>10.42.0.15</code> i Telia
          sin pool. Mens bussen kjører, hopper du mellom 4 celler.
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>
            Telia sin gateway (P-GW i LTE) eier <code>10.42.0.15</code> globalt — alt sendt til
            denne adressen havner hos gateway.
          </li>
          <li>
            For hver celle-bytte oppdateres en intern tunnel mellom gateway og den nye eNodeB-en
            (basestasjonen). Tunnel-endepunktet endres; ditt IP står stille.
          </li>
          <li>
            Teams-serveren har ingen anelse om at du flyttet deg — den ser konstant samme IP og
            samme TCP-forbindelse.
          </li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Hele mobilitets-jobben er gjemt nede i mobilkjernen. Applikasjons-laget får aldri vite at
          den fysiske radio-veien byttet.
        </p>
      </Example>

      <RelatedSlugs slugs={["dte2507-wifi-csma-ca"]} />
    </article>
  );
}

// ============================================================
// 7.5 — Håndover
// ============================================================
function Section75() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="7.5" title="Håndover — soft, hard, og hva som må overføres" />

      <p className="text-muted-foreground">
        En håndover er overgangen fra én basestasjon (eller AP) til en annen mens du fortsatt har en
        aktiv samtale eller forbindelse. Den må skje raskt nok til at applikasjonen ikke merker det,
        og bruker en koordinert sekvens av målinger, beslutninger og signalerings-meldinger.
      </p>

      <Defs
        items={[
          {
            term: "Hard handover (break-before-make)",
            body: "Klienten kobler først fra gammel basestasjon, så til ny. Mellom de to er det et lite vindu uten kontakt. Brukt i GSM, LTE, og WiFi. Kort men ikke null nedetid — 50–200 ms typisk i LTE.",
          },
          {
            term: "Soft handover (make-before-break)",
            body: "Klienten er koblet til både gammel og ny basestasjon samtidig en kort periode, og bytter når den nye er stabil. Brukt i 3G UMTS (CDMA-basert, hvor begge stationer kan dele samme frekvens). Lavere nedetid men mer kompleksitet i kjernen.",
          },
          {
            term: "Måle-rapporter",
            body: "Telefonen måler kontinuerlig signalstyrken (RSRP) og kvaliteten (RSRQ) til både egen og nabocell-basestasjoner, og rapporterer til nettet. Når en nabo passerer en terskel og holder seg over i en TTT (time-to-trigger), bestemmer nettet håndover.",
          },
          {
            term: "Frekvens-bytte",
            body: "Når ny basestasjon er på en annen frekvens enn den gamle, må telefonen retunes radio-en — det krever et målevindu (measurement gap) der eksisterende strøm pauses i noen ms. Ofte rotårsaken til en hørbar «klikk» i samtaler.",
          },
          {
            term: "AP-bytte i WiFi (roaming)",
            body: "WiFi har ingen sentral koordinator. Klienten bestemmer selv når den vil bytte: probe-r naboer, sammenligner signal, sender disassociation til gammel AP, og association til ny. Hvis nettet ikke støtter fast roaming (802.11r) må også full WPA-handshake gjøres på nytt — kan ta 1–2 sekunder.",
          },
          {
            term: "Kontekst-overføring",
            body: "Sikkerhets-nøkler, paged data, QoS-bærere — alle disse må flyttes fra gammel til ny basestasjon. I LTE/5G skjer dette via X2/Xn-grensesnitt direkte mellom basestasjonene; i WiFi 802.11r kalles det Fast BSS Transition.",
          },
        ]}
      />

      <Illustration caption="Tidslinje for soft vs hard håndover — overlapp eller gap mellom gammel og ny.">
        <HandoverSvg />
      </Illustration>

      <Example title="Eksempel: hva 200 ms gap betyr for en samtale">
        <p>
          En LTE hard handover varer typisk 50–150 ms. En VoIP-samtale sender pakker hver 20 ms; med
          en 150 ms-pause går omtrent 7–8 pakker tapt eller forsinket nok til å bli kastet av
          jitter-bufferen.
        </p>
        <p className="mt-2">
          Resultatet er et lite hopp i lyden — du hører kanskje en stavelse forsvinne, men samtalen
          brytes ikke. TCP-forbindelser holder fordi mobilkjernen flytter tunnel-endepunkt mens
          telefon-IP står stille; bufferede pakker leveres bare litt sent.
        </p>
        <p className="mt-2 text-muted-foreground">
          5G med kondisjonell handover (CHO) reduserer typisk gap til under 20 ms — så lite at de
          fleste samtaler høres helt sømløse selv på toget gjennom mange celler.
        </p>
      </Example>

      <RelatedSlugs slugs={["dte2507-wifi-csma-ca"]} />
    </article>
  );
}

// ============================================================
// 7.6 — TCP og wireless
// ============================================================
function Section76() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="7.6" title="Mobil impakt på applikasjoner — TCP i en støyete verden" />

      <p className="text-muted-foreground">
        TCP ble designet på 1980-tallet for kabelbaserte nett der pakketap nesten alltid skyldes
        kø-overløp, dvs. congestion. Reaksjonen er å halvere senderaten. Når den samme algoritmen
        kjører over WiFi eller mobil, blir den fooled: tap fra radio-feil blir tolket som
        congestion, og TCP straffer en lenke som faktisk er ledig. Resultat — kronisk
        under-utnyttelse av trådløse lenker.
      </p>

      <Defs
        items={[
          {
            term: "Bit-feil vs pakketap",
            body: "På kobber er bit-feil-rate (BER) typisk 10⁻¹² — neglisjerbar. På radio kan BER være 10⁻⁵ til 10⁻³ avhengig av SNR. Selv med feilretting i link-laget havner restfeil opp i pakker som forkastes ved CRC-sjekk — og TCP ser tap.",
          },
          {
            term: "Link-layer ARQ",
            body: "WiFi og LTE retransmitterer feilede frames lokalt i radio-link-laget før TCP merker noe. ACK ned i link-laget, ikke ende-til-ende. Skjuler de fleste radio-feil, men introduserer variabel forsinkelse — som forvirrer TCP sin RTT-måling.",
          },
          {
            term: "Spurious timeouts",
            body: "Når radio-laget bruker uvanlig lang tid (f.eks. under en handover-pause på 150 ms), kan TCP sin retransmission timer slå inn selv om pakker ikke er tapt. TCP retransmitterer unødvendig og halverer senderaten. Eksempel på hvordan to lag som ikke vet om hverandre kan jobbe mot hverandre.",
          },
          {
            term: "Performance Enhancing Proxy (PEP)",
            body: "En mellommann som splitter TCP-forbindelsen i to: én del over trådløst, en over kabel. PEP-en kvitterer raskere på kabel-siden så avsenderen kan skyve mer; tar ansvar for radio-feil på den andre. Vanlig i satellitt-nett og enkelte mobilnett — men bryter ende-til-ende-prinsippet.",
          },
          {
            term: "TCP CUBIC og BBR i radio-kontekst",
            body: "Moderne congestion-algoritmer prøver å skille tap fra congestion fra tap fra støy. BBR (Google) modellerer flaskehals-båndbredde og minimum RTT direkte i stedet for å reagere på tap — fungerer markant bedre over trådløst enn klassisk Reno/CUBIC.",
          },
          {
            term: "Mobilitets-jitter",
            body: "Selv uten tap kan RTT variere drastisk mellom konsekutive pakker når radio-laget retransmitterer eller en handover skjer. TCP sin RTO-estimering (smoothed RTT + variansestimat) får et sjokk og må re-tune seg, ofte med konservative valg som senker throughput.",
          },
        ]}
      />

      <Illustration caption="Kabelmessig: tap = congestion. Radio: tap kan komme fra støy, fading, eller handover — TCP vet ikke forskjellen.">
        <TcpWirelessSvg />
      </Illustration>

      <Example title="Eksempel: hvorfor 4G-laptopen din ikke når nominell hastighet">
        <p>En 4G-lenke annonserer 100 Mbps. Du tester med iperf og får 23 Mbps. Hvorfor?</p>
        <ul className="list-disc pl-5 mt-1">
          <li>
            BDP (bandwidth-delay-product): 100 Mbps · 60 ms RTT = 750 KB. Standard TCP-vindu på 65
            KB klarer ikke fylle røret. Trenger window scaling og store buffere.
          </li>
          <li>
            Sporadisk pakketap fra fading — kanskje 0.5 % — utløser regelmessige rate-halveringer i
            klassisk TCP CUBIC. Du tilbringer mye tid i recovery i stedet for full sending.
          </li>
          <li>
            Link-layer ARQ skjuler de fleste feil, men gjør RTT-variansen høy, så RTO settes
            konservativt → langsom recovery når tap faktisk skjer.
          </li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Bytt til en server som kjører BBR (Google og YouTube gjør det) og se throughput hoppe til
          nær nominell. Dette er hvorfor TCP-versjons-valg ikke er en akademisk detalj — det
          påvirker hvor mye av den dyre radio-kapasiteten du faktisk får brukt.
        </p>
      </Example>

      <RelatedSlugs slugs={["dte2507-wifi-csma-ca"]} />
    </article>
  );
}

// ============================================================
// 7.7 — Oppgaver
// ============================================================
function Section77() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="7.7" title="Oppgaver" />
      <p className="text-muted-foreground">
        Sjekk forståelsen din med disse oppgavene. Klikk «Vis svar» for å se vår løsning etter du
        har prøvd selv.
      </p>

      <Exercise
        question="Forklar hvorfor CSMA/CD (slik Ethernet bruker) ikke duger i radio, og hvordan CSMA/CA løser det med backoff."
        hint="Tenk på hvor mye en radios egen sender hører av sitt eget signal vs et fjernt signal."
        answer={
          <>
            <p>
              CSMA/CD krever at senderen kan høre kollisjonen mens den sender — altså at den
              samtidig lytter etter andres signal på samme frekvens. På radio er det fysisk umulig
              fordi din egen sender genererer et signal som er millionvis av ganger sterkere enn det
              innkommende du skulle prøvd å detektere. Radio-grensesnittet er half-duplex.
            </p>
            <p className="mt-2">
              CSMA/CA snur problemet: i stedet for å detektere kollisjoner, prøver vi å unngå dem.
              Hver station venter en obligatorisk DIFS-periode etter at lufta blir ledig, og
              deretter et tilfeldig antall slot-tider (backoff-vinduet CW). Hvis to stationer
              trekker ulike tall, vinner den med lavest tall og taperne pauser sin telling. Hvis de
              tilfeldigvis trekker samme tall, kolliderer de — men da merker de mangel på ACK og
              dobler CW (eksponentiell backoff), så neste forsøk har 2× lavere sannsynlighet for ny
              kollisjon.
            </p>
          </>
        }
      />

      <Exercise
        question="Hidden terminal-scenario: A og C kan begge høre AP, men ikke hverandre. Trace kollisjons-historikken med og uten RTS/CTS."
        hint="Hvem hører hva, og når tror noen at lufta er ledig?"
        answer={
          <>
            <p>
              <strong>Uten RTS/CTS:</strong> A vil sende. A sjekker — ingen signaler — sender. C vil
              også sende. C sjekker — A er utenfor C sin rekkevidde, så lufta virker ledig hos C —
              sender. Begge framene ankommer AP samtidig og kolliderer. AP sender ingen ACK. A og C
              får timeout, dobler CW, prøver på nytt — og samme scenarioet kan gjenta seg fordi
              backoff-vinduet ikke hjelper når problemet er manglende «carrier sense».
            </p>
            <p className="mt-2">
              <strong>Med RTS/CTS:</strong> A sender en liten RTS-frame til AP. AP svarer med CTS
              som inneholder en NAV-verdi (varighet av den planlagte transaksjonen). Både A og C
              hører CTS-en — selv om C ikke hørte A sin RTS. C oppdaterer sin NAV-timer og holder
              seg stille i hele perioden. A sender frame, får ACK, ferdig. C kan deretter prøve
              selv.
            </p>
            <p className="mt-2 text-muted-foreground">
              RTS/CTS koster overhead — det er derfor det typisk slås av for små pakker og bare
              brukes når frame-størrelsen er over en konfigurert RTS-terskel.
            </p>
          </>
        }
      />

      <Exercise
        question="En mobil flytter mellom 3 AP-er på 10 minutter. Hva må skje for at TCP-forbindelser overlever?"
        hint="Hva har TCP forbindelses-identifikator bestående av, og hva ville endre seg ved en naiv AP-bytte?"
        answer={
          <>
            <p>
              TCP identifiserer en forbindelse med 4-tupelet (src-IP, src-port, dst-IP, dst-port).
              Hvis IP-adressen endres ved AP-bytte, ser server-siden det som en helt ny ukjent
              forbindelse og resetter den. For å overleve må IP holdes konstant.
            </p>
            <p className="mt-2">For at TCP skal overleve må følgende være på plass:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>
                Alle tre AP-ene må være på samme IP-subnet (samme bedriftsnett / samme SSID med
                DHCP-pool delt), så klienten beholder samme IP.
              </li>
              <li>
                Alternativt: en wireless-controller som tunneler all trafikk fra hver AP til en
                sentral concentrator (Mobile-IP-aktig løsning).
              </li>
              <li>
                Hver håndover-pause må være kort nok til at TCP sin RTO ikke utløses. Med
                802.11r/Fast BSS Transition kommer typisk pause under 50 ms — TCP merker bare en
                kortvarig RTT-økning, ingen retransmit nødvendig.
              </li>
              <li>
                Eventuelle bufferede pakker hos gammel AP må enten droppes (TCP retransmitterer)
                eller forwarded til ny AP (krever kontekst-overføring).
              </li>
            </ul>
            <p className="mt-2 text-muted-foreground">
              Hjemmenett uten enterprise-controller har ofte ulike subnet per AP (mesh-noder med
              egen DHCP), og da brytes TCP. Det er hovedgrunnen til at video-samtaler i hjemmet kan
              henge når du går fra stuen til soverommet med to ulike Eero-noder uten riktig
              konfigurasjon.
            </p>
          </>
        }
      />

      <Exercise
        question="Hvorfor halverer klassisk TCP CUBIC senderaten unødvendig ofte over trådløst, og hva gjør BBR annerledes?"
        hint="Hva er den utløsende hendelsen i CUBIC, og hvilket signal bruker BBR i stedet?"
        answer={
          <>
            <p>
              CUBIC bruker pakketap som primært congestion-signal. Når tre duplikate ACK-er kommer
              eller en timeout slår inn, antar CUBIC at en kø et sted ble full og halverer
              senderaten. Over trådløst er pakketap ofte fra radio-feil (multipath-fading, kortvarig
              interferens) — ikke congestion. CUBIC straffer da en lenke som faktisk har ledig
              kapasitet.
            </p>
            <p className="mt-2">
              BBR ignorerer tap som primært signal og modellerer i stedet to størrelser
              kontinuerlig: maks throughput observert og minimum RTT observert. Produktet er
              bandwidth-delay-product (BDP) — den optimale mengden data som skal være «in flight».
              BBR holder seg på den verdien uansett hva tap-statistikken sier. Resultat: én
              tilfeldig tapt pakke fra støy reduserer ikke senderaten, men en faktisk overfylt kø
              (som øker RTT) gjør det.
            </p>
            <p className="mt-2 text-muted-foreground">
              Trade-off: BBR kan være urettferdig mot CUBIC-strømmer i samme kø (BBR holder ut tap,
              CUBIC viker). Det er en pågående diskusjon om hvilken algoritme som bør være default i
              Linux-kjernen — i dag er det fortsatt CUBIC, men Google og Facebook kjører BBR i sine
              egne servere.
            </p>
          </>
        }
      />

      <Exercise
        question="Anta du har 30 brukere i et åpent landskap som alle bruker WiFi samtidig. Hver bruker streamer 5 Mbps video. AP-en har 200 Mbps nominell kapasitet. Hvorfor blir det likevel rykk og buffring?"
        hint="Tenk på MAC-overhead, ACK-er, backoff, og hvordan AP-en deler tid mellom mange klienter."
        answer={
          <>
            <p>
              Naivt regnestykke: 30 · 5 Mbps = 150 Mbps &lt; 200 Mbps, så det burde gå. Men WiFi sin
              faktiske utnyttelse av kapasiteten er typisk 40–60 % av nominell på grunn av:
            </p>
            <ul className="list-disc pl-5 mt-1">
              <li>
                DIFS + tilfeldig backoff før hver sending — flere klienter, lengre snitt-vente.
              </li>
              <li>SIFS + ACK etter hver data-frame; for korte frames er overhead-andelen høy.</li>
              <li>
                Hver klient sender på sin egen modulasjons-rate. Klienter langt fra AP-en sender på
                lav rate (kanskje 12 Mbps), og dominerer luft-tiden mens de sender — det kalles
                <em>airtime fairness-problemet</em>.
              </li>
              <li>
                Faktiske kollisjoner mellom klienter som tilfeldigvis trekker samme backoff.
                Eksponentiell backoff senker throughput mer for hver mislykkede.
              </li>
              <li>Half-duplex: AP-en kan ikke sende ned til klient X mens klient Y sender opp.</li>
            </ul>
            <p className="mt-2">
              Effektiv kapasitet i et reelt scenario er kanskje 80–100 Mbps. Med 150 Mbps
              etterspørsel går køen i AP-en full, pakker droppes, og videoene må buffre. Løsninger:
              flere AP-er (mindre brukere per AP), MU-MIMO (AP sender til flere klienter samtidig),
              eller 5 GHz / 6 GHz bånd med mer kanalkapasitet.
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

function HiddenTerminalSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      {/* Rekkevidde-sirkler */}
      <circle
        cx={120}
        cy={110}
        r={90}
        className="fill-brand/5 stroke-brand/40"
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      <circle
        cx={380}
        cy={110}
        r={90}
        className="fill-success/5 stroke-success/40"
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      {/* A */}
      <circle cx={120} cy={110} r={14} className="fill-brand stroke-foreground" strokeWidth={1.5} />
      <text x={120} y={114} textAnchor="middle" className="fill-background text-[11px] font-bold">
        A
      </text>
      <text x={120} y={138} textAnchor="middle" className="fill-foreground text-[9px]">
        rekkevidde
      </text>
      {/* C */}
      <circle
        cx={380}
        cy={110}
        r={14}
        className="fill-success stroke-foreground"
        strokeWidth={1.5}
      />
      <text x={380} y={114} textAnchor="middle" className="fill-background text-[11px] font-bold">
        C
      </text>
      <text x={380} y={138} textAnchor="middle" className="fill-foreground text-[9px]">
        rekkevidde
      </text>
      {/* AP */}
      <rect
        x={235}
        y={95}
        width={30}
        height={30}
        rx={4}
        className="fill-amber-500 stroke-foreground"
        strokeWidth={1.5}
      />
      <text x={250} y={114} textAnchor="middle" className="fill-background text-[10px] font-bold">
        AP
      </text>
      {/* Kollisjon-pil */}
      <line
        x1={134}
        y1={110}
        x2={235}
        y2={110}
        className="stroke-brand"
        strokeWidth={2}
        markerEnd="url(#arrow-brand)"
      />
      <line
        x1={366}
        y1={110}
        x2={265}
        y2={110}
        className="stroke-success"
        strokeWidth={2}
        markerEnd="url(#arrow-success)"
      />
      <defs>
        <marker
          id="arrow-brand"
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-brand" />
        </marker>
        <marker
          id="arrow-success"
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-success" />
        </marker>
      </defs>
      {/* Eksplosjon */}
      <text x={250} y={80} textAnchor="middle" className="fill-destructive text-[14px] font-bold">
        💥
      </text>
      <text x={250} y={70} textAnchor="middle" className="fill-destructive text-[9px]">
        kollisjon
      </text>
      {/* A↔C ikke synlig */}
      <line
        x1={134}
        y1={170}
        x2={366}
        y2={170}
        className="stroke-muted-foreground/40"
        strokeWidth={1}
        strokeDasharray="2 4"
      />
      <text x={250} y={188} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        A og C kan ikke høre hverandre
      </text>
    </svg>
  );
}

function CsmaCaSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        CSMA/CA — én sender-station, suksessfull frame
      </text>
      {/* Tidsakse */}
      <line x1={20} y1={120} x2={480} y2={120} className="stroke-foreground/60" strokeWidth={1.5} />
      <text x={485} y={124} className="fill-muted-foreground text-[9px]">
        tid
      </text>

      {/* Stille / busy */}
      <rect x={20} y={100} width={50} height={40} className="fill-muted/40 stroke-border" />
      <text x={45} y={124} textAnchor="middle" className="fill-foreground text-[9px]">
        opptatt
      </text>

      {/* DIFS */}
      <rect
        x={70}
        y={100}
        width={45}
        height={40}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={92} y={124} textAnchor="middle" className="fill-foreground text-[9px]">
        DIFS
      </text>
      <text x={92} y={90} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        34 μs
      </text>

      {/* Backoff slots */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect
            x={115 + i * 14}
            y={100}
            width={14}
            height={40}
            className="fill-brand/20 stroke-brand"
            strokeWidth={1}
          />
          <text
            x={115 + i * 14 + 7}
            y={124}
            textAnchor="middle"
            className="fill-foreground text-[7px]"
          >
            {i}
          </text>
        </g>
      ))}
      <text x={150} y={90} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        backoff (5 slots)
      </text>

      {/* Data frame */}
      <rect
        x={185}
        y={100}
        width={140}
        height={40}
        className="fill-success/30 stroke-success"
        strokeWidth={1.5}
      />
      <text x={255} y={124} textAnchor="middle" className="fill-foreground text-[10px]">
        DATA-frame
      </text>

      {/* SIFS */}
      <rect
        x={325}
        y={100}
        width={20}
        height={40}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={335} y={124} textAnchor="middle" className="fill-foreground text-[8px]">
        SIFS
      </text>
      <text x={335} y={90} textAnchor="middle" className="fill-muted-foreground text-[7px]">
        16 μs
      </text>

      {/* ACK */}
      <rect
        x={345}
        y={100}
        width={50}
        height={40}
        className="fill-brand/40 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={370} y={124} textAnchor="middle" className="fill-foreground text-[10px]">
        ACK
      </text>

      {/* Etter */}
      <rect x={395} y={100} width={85} height={40} className="fill-muted/40 stroke-border" />
      <text x={437} y={124} textAnchor="middle" className="fill-foreground text-[9px]">
        nytt forsøk-vindu
      </text>

      <text
        x={250}
        y={180}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] italic"
      >
        Lytt → DIFS → backoff → DATA → SIFS → ACK
      </text>
      <text x={250} y={200} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        Uteblitt ACK = retransmit + doblet backoff-vindu
      </text>
    </svg>
  );
}

function CellularTopologySvg() {
  // Hexagon helper
  const hex = (cx: number, cy: number, r: number) => {
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i + Math.PI / 6;
      pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
    }
    return pts.join(" ");
  };
  const cells = [
    { cx: 90, cy: 70, f: 1 },
    { cx: 145, cy: 105, f: 2 },
    { cx: 90, cy: 140, f: 3 },
    { cx: 200, cy: 70, f: 2 },
    { cx: 255, cy: 105, f: 1 },
    { cx: 200, cy: 140, f: 1 },
    { cx: 310, cy: 70, f: 3 },
    { cx: 255, cy: 175, f: 2 },
    { cx: 145, cy: 175, f: 1 },
  ];
  const colors = ["fill-brand/15", "fill-success/15", "fill-amber-500/15"];
  const strokes = ["stroke-brand/60", "stroke-success/60", "stroke-amber-500/60"];
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      {cells.map((c, i) => (
        <g key={i}>
          <polygon
            points={hex(c.cx, c.cy, 35)}
            className={`${colors[c.f - 1]} ${strokes[c.f - 1]}`}
            strokeWidth={1.5}
          />
          {/* Basestasjon i sentrum */}
          <circle cx={c.cx} cy={c.cy} r={3} className="fill-foreground" />
          <text x={c.cx} y={c.cy + 16} textAnchor="middle" className="fill-foreground text-[8px]">
            f{c.f}
          </text>
        </g>
      ))}
      {/* Mast */}
      <text x={90} y={210} className="fill-muted-foreground text-[9px]">
        f1, f2, f3 = ulike frekvens-grupper
      </text>
      {/* Kjerne */}
      <rect
        x={370}
        y={60}
        width={110}
        height={80}
        rx={8}
        className="fill-card stroke-brand"
        strokeWidth={1.5}
      />
      <text
        x={425}
        y={85}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Kjerne
      </text>
      <text x={425} y={100} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        EPC / 5GC
      </text>
      <text x={425} y={115} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        IP-ruting
      </text>
      <text x={425} y={130} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        autentisering
      </text>
      {/* Linker fra celler til kjerne */}
      <line
        x1={310}
        y1={70}
        x2={370}
        y2={100}
        className="stroke-muted-foreground/50"
        strokeWidth={1}
      />
      <line
        x1={255}
        y1={175}
        x2={370}
        y2={120}
        className="stroke-muted-foreground/50"
        strokeWidth={1}
      />
      {/* Internett */}
      <ellipse
        cx={425}
        cy={185}
        rx={45}
        ry={20}
        className="fill-success/15 stroke-success/60"
        strokeWidth={1.5}
      />
      <text x={425} y={189} textAnchor="middle" className="fill-foreground text-[10px]">
        Internett
      </text>
      <line x1={425} y1={140} x2={425} y2={165} className="stroke-muted-foreground/50" />
    </svg>
  );
}

function MobileIpSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Mobile IP — pakke fra korrespondent til mobil host
      </text>
      {/* Korrespondent */}
      <circle
        cx={50}
        cy={80}
        r={18}
        className="fill-amber-500 stroke-foreground"
        strokeWidth={1.5}
      />
      <text x={50} y={84} textAnchor="middle" className="fill-background text-[9px] font-bold">
        CN
      </text>
      <text x={50} y={110} textAnchor="middle" className="fill-foreground text-[9px]">
        korrespondent
      </text>
      {/* Home network */}
      <ellipse
        cx={210}
        cy={80}
        rx={55}
        ry={30}
        className="fill-brand/10 stroke-brand/60"
        strokeWidth={1.5}
      />
      <text
        x={210}
        y={50}
        textAnchor="middle"
        className="fill-brand text-[9px] uppercase tracking-wider"
      >
        home network
      </text>
      <rect
        x={195}
        y={70}
        width={30}
        height={20}
        rx={3}
        className="fill-card stroke-brand"
        strokeWidth={1.5}
      />
      <text x={210} y={84} textAnchor="middle" className="fill-foreground text-[10px]">
        HA
      </text>
      {/* Foreign network */}
      <ellipse
        cx={400}
        cy={170}
        rx={60}
        ry={35}
        className="fill-success/10 stroke-success/60"
        strokeWidth={1.5}
      />
      <text
        x={400}
        y={130}
        textAnchor="middle"
        className="fill-success text-[9px] uppercase tracking-wider"
      >
        foreign network
      </text>
      <rect
        x={355}
        y={160}
        width={30}
        height={20}
        rx={3}
        className="fill-card stroke-success"
        strokeWidth={1.5}
      />
      <text x={370} y={174} textAnchor="middle" className="fill-foreground text-[10px]">
        FA
      </text>
      <circle
        cx={430}
        cy={185}
        r={12}
        className="fill-success stroke-foreground"
        strokeWidth={1.5}
      />
      <text x={430} y={189} textAnchor="middle" className="fill-background text-[9px] font-bold">
        MN
      </text>
      <text x={430} y={208} textAnchor="middle" className="fill-foreground text-[8px]">
        mobil
      </text>
      {/* Pil 1: CN → HA */}
      <path
        d="M 70 80 Q 130 60 195 80"
        className="fill-none stroke-amber-500"
        strokeWidth={2}
        markerEnd="url(#arr1)"
      />
      <text
        x={130}
        y={50}
        textAnchor="middle"
        className="fill-amber-600 dark:fill-amber-400 text-[9px]"
      >
        ① pakke til hjem-IP
      </text>
      {/* Pil 2: HA → FA (tunnel) */}
      <path
        d="M 225 90 Q 320 110 365 165"
        className="fill-none stroke-brand"
        strokeWidth={2}
        markerEnd="url(#arr2)"
        strokeDasharray="4 3"
      />
      <text x={310} y={130} textAnchor="middle" className="fill-brand text-[9px]">
        ② tunnel (innpakket)
      </text>
      {/* Pil 3: FA → MN */}
      <path
        d="M 385 175 Q 400 180 418 184"
        className="fill-none stroke-success"
        strokeWidth={2}
        markerEnd="url(#arr3)"
      />
      <text x={395} y={210} textAnchor="middle" className="fill-success text-[9px]">
        ③ levert
      </text>
      <defs>
        <marker
          id="arr1"
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-amber-500" />
        </marker>
        <marker
          id="arr2"
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-brand" />
        </marker>
        <marker
          id="arr3"
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-success" />
        </marker>
      </defs>
    </svg>
  );
}

function HandoverSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Hard vs soft handover — tidslinje
      </text>
      {/* HARD */}
      <text x={20} y={50} className="fill-foreground text-[10px] font-semibold">
        Hard (break-before-make)
      </text>
      <rect
        x={20}
        y={60}
        width={180}
        height={25}
        className="fill-brand/40 stroke-brand"
        strokeWidth={1}
      />
      <text x={110} y={77} textAnchor="middle" className="fill-foreground text-[10px]">
        gammel BS
      </text>
      <rect
        x={200}
        y={60}
        width={30}
        height={25}
        className="fill-destructive/30 stroke-destructive"
        strokeWidth={1}
      />
      <text x={215} y={77} textAnchor="middle" className="fill-foreground text-[9px]">
        gap
      </text>
      <rect
        x={230}
        y={60}
        width={250}
        height={25}
        className="fill-success/40 stroke-success"
        strokeWidth={1}
      />
      <text x={355} y={77} textAnchor="middle" className="fill-foreground text-[10px]">
        ny BS
      </text>
      <text x={215} y={102} textAnchor="middle" className="fill-destructive text-[9px]">
        50–150 ms pakke-tap
      </text>

      {/* SOFT */}
      <text x={20} y={135} className="fill-foreground text-[10px] font-semibold">
        Soft (make-before-break)
      </text>
      <rect
        x={20}
        y={145}
        width={210}
        height={25}
        className="fill-brand/40 stroke-brand"
        strokeWidth={1}
      />
      <text x={125} y={162} textAnchor="middle" className="fill-foreground text-[10px]">
        gammel BS
      </text>
      <rect
        x={170}
        y={172}
        width={120}
        height={25}
        className="fill-amber-500/40 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={230} y={189} textAnchor="middle" className="fill-foreground text-[9px]">
        overlapp (begge aktive)
      </text>
      <rect
        x={230}
        y={145}
        width={250}
        height={25}
        className="fill-success/40 stroke-success"
        strokeWidth={1}
      />
      <text x={355} y={162} textAnchor="middle" className="fill-foreground text-[10px]">
        ny BS
      </text>
    </svg>
  );
}

function TcpWirelessSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Hvor pakker går tapt — og hvordan TCP tolker det
      </text>
      {/* Sender */}
      <rect
        x={30}
        y={100}
        width={60}
        height={40}
        rx={4}
        className="fill-card stroke-brand"
        strokeWidth={1.5}
      />
      <text x={60} y={124} textAnchor="middle" className="fill-foreground text-[10px]">
        sender
      </text>
      {/* Kabel-strekning */}
      <line x1={90} y1={120} x2={200} y2={120} className="stroke-foreground/70" strokeWidth={3} />
      <text x={145} y={110} textAnchor="middle" className="fill-foreground text-[9px]">
        kabel
      </text>
      <text x={145} y={140} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        tap = congestion
      </text>
      {/* Ruter */}
      <rect
        x={200}
        y={100}
        width={50}
        height={40}
        rx={4}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={225} y={124} textAnchor="middle" className="fill-foreground text-[10px]">
        kø
      </text>
      {/* Radio-strekning */}
      <path
        d="M 250 120 Q 280 105 310 120 Q 340 135 370 120"
        className="fill-none stroke-success"
        strokeWidth={3}
      />
      <text x={310} y={105} textAnchor="middle" className="fill-foreground text-[9px]">
        radio
      </text>
      <text x={310} y={143} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        tap = støy / fading / handover
      </text>
      {/* Mottaker */}
      <rect
        x={370}
        y={100}
        width={60}
        height={40}
        rx={4}
        className="fill-card stroke-success"
        strokeWidth={1.5}
      />
      <text x={400} y={124} textAnchor="middle" className="fill-foreground text-[10px]">
        mottaker
      </text>
      {/* Conclusion */}
      <rect
        x={50}
        y={180}
        width={400}
        height={45}
        rx={6}
        className="fill-destructive/10 stroke-destructive/40"
        strokeWidth={1.5}
      />
      <text
        x={250}
        y={200}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        TCP ser bare «pakke tapt» — kan ikke skille årsakene
      </text>
      <text x={250} y={216} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        → halverer senderaten selv om radio-laget ikke er overbelastet
      </text>
    </svg>
  );
}
