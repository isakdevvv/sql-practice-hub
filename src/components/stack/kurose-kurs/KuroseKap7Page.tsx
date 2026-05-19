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
              Kap. 7 — Trådløst og mobilt
            </h1>
          </div>
          <nav className="ml-auto flex flex-wrap gap-0.5">
            <TabBtn active={tab === "intro"} onClick={() => setTab("intro")}>
              Start
            </TabBtn>
            <TabBtn
              active={tab === "7.1"}
              onClick={() => setTab("7.1")}
              title="Radio-karakteristikker"
            >
              7.1
            </TabBtn>
            <TabBtn active={tab === "7.2"} onClick={() => setTab("7.2")} title="WiFi 802.11">
              7.2
            </TabBtn>
            <TabBtn active={tab === "7.3"} onClick={() => setTab("7.3")} title="Cellular">
              7.3
            </TabBtn>
            <TabBtn active={tab === "7.4"} onClick={() => setTab("7.4")} title="Mobilitet">
              7.4
            </TabBtn>
            <TabBtn active={tab === "7.5"} onClick={() => setTab("7.5")} title="Håndover">
              7.5
            </TabBtn>
            <TabBtn active={tab === "7.6"} onClick={() => setTab("7.6")} title="TCP & wireless">
              7.6
            </TabBtn>
            <TabBtn active={tab === "7.7"} onClick={() => setTab("7.7")} title="Oppgaver">
              Oppg.
            </TabBtn>
          </nav>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "7.1" && <Section71 />}
        {tab === "7.2" && <Section72 />}
        {tab === "7.3" && <Section73 />}
        {tab === "7.4" && <Section74 />}
        {tab === "7.5" && <Section75 />}
        {tab === "7.6" && <Section76 />}
        {tab === "7.7" && <Section77 />}

        <SectionPager
          tabs={SECTIONS_7}
          current={tab}
          onPick={(id) => setTab(id as Tab)}
          nextChapter={NEXT_CHAPTER_7}
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

      <div className="grid gap-3 lg:grid-cols-2">
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
            {
              term: "Shadow fading (skyggetap)",
              body: "Sakte svekning av snitt-signalet når noe stort kommer mellom sender og mottaker — typisk en betongvegg, et lastebil-tilhenger som parkerer, eller en kropp som beveger seg gjennom strålen. Ulik fra multipath fordi det varer i sekund-skalaen, ikke i millisekund-skalaen.",
            },
            {
              term: "Co-channel-interferens",
              body: "To stationer eller AP-er bruker samme kanal (samme frekvens-bånd). De hører hverandre som støy, og må enten dele lufta via CSMA eller akseptere lavere SNR. Tre naboleiligheter med rutere alle på kanal 1 i 2.4 GHz er det klassiske eksempelet.",
            },
            {
              term: "Adjacent-channel-interferens",
              body: "Spillover av energi fra en sender på kanal X inn i en mottaker som lytter på kanal X±1. I 2.4 GHz overlapper hver 20-MHz-kanal med 4–5 nabokanaler — derfor er kun 1, 6 og 11 reelt non-overlappende der.",
            },
            {
              term: "Free-space path loss-formelen",
              body: "Modellen FSPL (dB) = 20·log₁₀(d) + 20·log₁₀(f) + 32.45 brukt for fritt rom. d i km, f i MHz. For et 2.4 GHz-signal over 100 m gir det ca. 80 dB tap — derav typiske AP-rekkevidder rundt 20–30 m innendørs der vegger legger til ekstra demping.",
            },
            {
              term: "Modulasjon",
              body: "Hvordan bits avbildes på en radio-bølge. Enkleste form (BPSK) sender 1 bit per symbol ved å snu fasen 180°; QPSK sender 2 bit per symbol; 16-QAM 4 bit; 256-QAM 8 bit. Høyere QAM krever bedre SNR fordi mottakeren må skille flere symbol-tilstander uten å forveksle dem.",
            },
            {
              term: "Antenne-gain",
              body: "Hvor mye en antenne fokuserer energien i én retning sammenlignet med en isotropisk (allretnings) referanse, målt i dBi. En vanlig laptop-antenne har 0–2 dBi; en retnings-antenne på en mast kan ha 15 dBi. Høyere gain betyr lengre rekkevidde i den retningen — på bekostning av dekning i andre retninger.",
            },
          ]}
        />
        <Illustration caption="Hidden terminal: A og C hører begge AP, men ikke hverandre. AP får krasjete signaler.">
          <HiddenTerminalSvg />
        </Illustration>
      </div>

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

      <Example title="Eksempel: trace av en hidden terminal-kollisjon">
        <p>
          Tre nodes i et åpent landskaps-kontor: A ved nordvinduet, C ved sørvinduet, AP midt
          mellom. Avstand A↔AP = 20 m, AP↔C = 20 m, A↔C = 40 m gjennom en seksjons-vegg som demper
          med 25 dB. A og C måler hver for seg lufta som ledig.
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>
            kl. 0: A sjekker carrier — ingen aktivitet — starter sending av en 1200-byte frame med
            54 Mbps-modulasjon. Sending tar ca. 178 μs.
          </li>
          <li>
            kl. 80 μs: C sjekker carrier — A sin radiobølge når C med −95 dBm (under C sin
            detektor-terskel på −82 dBm) — C tror lufta er ledig.
          </li>
          <li>kl. 80 μs: C starter sending av sin egen frame.</li>
          <li>
            kl. 80–178 μs: AP mottar to overlappende signaler. SINR (signal-til-støy-pluss-
            interferens) faller under den nødvendige terskelen for 54 Mbps-modulasjon.
          </li>
          <li>
            kl. 178 μs: A er ferdig med sending, lytter etter ACK. Ingen ACK kommer fordi AP sin
            CRC-sjekk feiler.
          </li>
          <li>
            kl. 178 + SIFS + ACK-timeout ≈ 254 μs: A registrerer manglende ACK, dobler CW,
            planlegger retransmit. Samme skjer hos C.
          </li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          A og C var begge perfekt høflige etter CSMA/CA-reglene — de tapte fordi protokollen ikke
          kan se det den ikke kan høre. Det er hvorfor RTS/CTS finnes som opt-in-mekanisme: CTS-en
          kommer fra AP som begge når, og pålegger en NAV-stillhet selv de skjulte stasjonene må
          respektere.
        </p>
      </Example>

      <Hvorfor title="Hvorfor er CSMA/CA nødvendig i radio, når Ethernet klarer seg med CSMA/CD?">
        <p>
          Ethernet sin CSMA/CD bygger på én fysisk forutsetning: en sender kan høre andre signaler
          på lenken mens den selv sender. På kobber er det enkelt — alle nodes er galvanisk koblet
          til samme buss, og en kollisjon vises som forhøyet spenning over normal
          enkelt-sender-amplitude.
        </p>
        <p>
          I radio er det fysisk umulig. Senderens egen utgangs-effekt på antennen er typisk +15 dBm;
          en innkommende fjern-frame ankommer på rundt −70 dBm. Forskjellen er 85 dB, eller en
          faktor på ca. 300 millioner i effekt. Ingen mottaker-elektronikk kan plukke ut det svake
          signalet under det sterke selvinterferens-bråket på samme frekvens samtidig.
        </p>
        <p>
          Derfor må radio-protokoller unngå kollisjoner i stedet for å detektere dem. CSMA/CA sin
          obligatoriske DIFS-pause pluss tilfeldig backoff-vinduet sprer sendings-tidspunktene slik
          at to klare-til-å-sende stationer sjelden treffer samme slot. RTS/CTS løser
          tilleggsproblemet at to stationer kanskje ikke kan høre hverandre i det hele tatt.
        </p>
      </Hvorfor>

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

      <div className="grid gap-3 lg:grid-cols-2">
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
            {
              term: "Autentisering (separat fra assosiasjon)",
              body: "Steget før assosiasjon der stationen og AP-en (eller en RADIUS-server bak) verifiserer hverandres identitet. I åpne nett er det en formalitet; i WPA2/WPA3 utveksles nøkler her via en firevegs-handshake. En klient kan være autentisert hos flere AP-er samtidig — det letter raskt roaming.",
            },
            {
              term: "NAV (Network Allocation Vector)",
              body: "En virtuell carrier-sense som hver station holder lokalt: en nedteller som settes basert på Duration-feltet i hver mottatt ramme. Så lenge NAV > 0 oppfører stationen seg som om lufta er opptatt selv om den fysisk ikke hører noe. Det er mekanismen som lar RTS/CTS reservere mediet for skjulte naboer.",
            },
            {
              term: "Slot-tid",
              body: "Den grunnleggende tidskvantet i CSMA/CA backoff-telling, vanligvis 9 μs i 802.11n/ac/ax. Velges så det er kortere enn forskjellen i propageringsforsinkelse mellom to stationer pluss deteksjons-tid for radio — så ingen to stationer kommer i situasjonen der den ene begynner å sende «mellom» den andres carrier-sense og dens egen.",
            },
            {
              term: "802.11-standard-familien (a/b/g/n/ac/ax)",
              body: "a (1999, 5 GHz, opp til 54 Mbps), b (1999, 2.4 GHz, 11 Mbps), g (2003, 2.4 GHz, 54 Mbps), n (2009, MIMO, opp til 600 Mbps), ac (2014, 5 GHz, MU-MIMO, gigabit-rater), ax/WiFi 6 (2019, OFDMA, bedre tetthet), be/WiFi 7 (2024, 320 MHz-kanaler, multi-link). Hver ny standard er bakoverkompatibel via fallback-modus.",
            },
            {
              term: "Eksponentiell backoff (CW-vokst)",
              body: "Etter hver mislykket sending dobles maks-backoff fra CWmin (typisk 15) opp mot CWmax (typisk 1023). Etter en vellykket sending resettes vinduet til CWmin. Mønsteret 15, 31, 63, 127, 255, 511, 1023 sikrer at to klienter som krasjet ikke gjentar samme tidspunkt-valg.",
            },
            {
              term: "MU-MIMO (Multi-User MIMO)",
              body: "AP-en sender til flere klienter samtidig på samme frekvens ved å bruke flere antenner med matematisk beamforming. Hver klient mottar bare sin egen del fordi de fysiske bølge-mønstrene er ortogonale i deres respektive lokasjoner. Introdusert i 802.11ac, gjør luft-tids-deling vesentlig mer effektiv.",
            },
          ]}
        />
        <Illustration caption="CSMA/CA-sekvens: lytt → DIFS → backoff → send → SIFS → ACK.">
          <CsmaCaSvg />
        </Illustration>
      </div>

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

      <Example title="Eksempel: når RTS/CTS faktisk lønner seg">
        <p>
          Vi sammenligner total luft-tid for én vellykket data-leveranse på 1500 byte ved 24 Mbps,
          uten og med RTS/CTS, i et scenario med hidden terminals der kollisjons-sannsynligheten
          uten RTS/CTS er 30 %.
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>Data-frame-tid: 1500 byte · 8 / 24 Mbps ≈ 500 μs</li>
          <li>SIFS = 16 μs, ACK ≈ 30 μs, DIFS = 34 μs</li>
          <li>
            <strong>Uten RTS/CTS, 70 % suksess:</strong> kostnad per suksess = (DIFS + backoff +
            DATA + SIFS + ACK) / 0.7 ≈ (34 + 100 + 500 + 16 + 30) / 0.7 ≈ 970 μs/leveranse
          </li>
          <li>RTS ≈ 20 μs, CTS ≈ 20 μs, antar 95 % suksess fordi NAV beskytter mot skjulte</li>
          <li>
            <strong>Med RTS/CTS, 95 % suksess:</strong> kostnad = (DIFS + backoff + RTS + SIFS + CTS
            + SIFS + DATA + SIFS + ACK) / 0.95 ≈ (34 + 100 + 20 + 16 + 20 + 16 + 500 + 16 + 30) /
            0.95 ≈ 793 μs/leveranse
          </li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          For store frames og høy kollisjons-rate sparer RTS/CTS netto luft-tid. For små frames (300
          byte) ville RTS/CTS-overhead vært større enn besparelsen, så standard-terskelen er satt
          høyt nok (typisk 2347 byte) til at den i praksis er av — og brukeren slår den på
          eksplisitt når hidden-terminal-problemet er målt.
        </p>
      </Example>

      <Hvorfor title="Hvorfor har 2.4 GHz-båndet bare 3 non-overlappende kanaler?">
        <p>
          2.4 GHz-båndet i Norge går fra 2.400 til 2.4835 GHz — bredde på ca. 83.5 MHz. Hver WiFi-
          kanal er offisielt 20 MHz bred (eller 40 MHz i n/ac), og kanal-senterene ligger 5 MHz fra
          hverandre. Det betyr at kanal 1 og kanal 2 deler 15 av sine 20 MHz — de er nesten totalt
          overlappende.
        </p>
        <p>
          For at to nett ikke skal forstyrre hverandre må kanal-senterene være minst 20 MHz fra
          hverandre. Med 5 MHz spacing krever det at man hopper 4 kanaler om gangen: 1, 6, 11. Tre
          ikke-overlappende kanaler er alt 2.4 GHz tillater. Tett bebyggelse med mange WiFi-nett
          fyller alle tre opp, og naboene tvinges til å konkurrere via CSMA/CA — derav den velkjente
          «WiFi-rusht-time» midt i kvelden.
        </p>
        <p>
          5 GHz-båndet er ca. 500 MHz bredt med 20-MHz kanaler og lite overlapp, så det gir 25+
          non-overlappende kanaler avhengig av regelverk. Det er den grunnleggende grunnen til at 5
          GHz føles raskere selv om radio-modulasjonen er den samme — du slipper å dele lufta med
          naboene.
        </p>
      </Hvorfor>

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

      <div className="grid gap-3 lg:grid-cols-2">
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
            {
              term: "BTS / NodeB / eNodeB / gNodeB",
              body: "Generasjons-navnene på basestasjons-radioen: BTS i 2G/GSM, NodeB i 3G/UMTS, eNodeB i 4G/LTE, gNodeB i 5G NR. Hvert navn signaliserer mer intelligens flyttet ut i radio-noden — eNodeB tok over scheduling fra kjernen som RNC gjorde i 3G, og gNodeB støtter også funksjoner som tidligere lå i kjernen.",
            },
            {
              term: "HSS / UDM (abonnent-database)",
              body: "Home Subscriber Server i 4G og Unified Data Management i 5G — den sentrale databasen som lagrer hvem som har lov til å bruke nettet, hvilke tjenester de er abonnert på, og hvilke krypto-nøkler som matcher deres SIM-kort. Autentiserings-anker for hele nettet.",
            },
            {
              term: "MME / AMF (mobility manager)",
              body: "Mobility Management Entity i 4G og Access and Mobility Function i 5G — kontroll-plane-funksjonen som holder oversikt over hvilken celle hver telefon er i, koordinerer paging når en innkommende samtale skal ringes ut, og styrer håndover-prosesser. Snakker aldri med data-pakker direkte, kun signalering.",
            },
            {
              term: "S-GW / P-GW / UPF (data-plane-gateway)",
              body: "I 4G/LTE: Serving Gateway nær brukeren og Packet Data Network Gateway ut mot internett. I 5G slått sammen til User Plane Function (UPF) for lavere forsinkelse. Alle bruker-data-pakker passerer en av disse — det er endepunktet for GTP-tunnelen og IP-adressens egentlige hjem.",
            },
            {
              term: "OFDMA-subbærere",
              body: "I LTE deles 20 MHz båndet i 1200 subbærere à 15 kHz. Hver bruker tildeles et rektangel i tid·frekvens-rutenettet (en «resource block») hver millisekund. Det er dette som lar mange brukere dele samme celle samtidig uten å vente på CSMA.",
            },
            {
              term: "SIM/eSIM",
              body: "Et tamper-resistant kort (Subscriber Identity Module) som lagrer en hemmelig nøkkel K_i og et identifikator IMSI. Brukes til å gjøre challenge-response autentisering mot HSS uten å eksponere K_i. eSIM er samme funksjonalitet i en chip loddet på hovedkortet, oppdaterbar over internett.",
            },
          ]}
        />
        <Illustration caption="Sekskant-mønsteret med fargede frekvens-grupper og kjernens kobling ut på internett.">
          <CellularTopologySvg />
        </Illustration>
      </div>

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

      <Example title="Eksempel: full tidslinje for en celle-håndover på et tog">
        <p>
          Du sitter på toget gjennom Lofoten med en aktiv Spotify-streaming i 4G. Toget passerer fra
          dekning av eNodeB-«Svolvær» til eNodeB-«Kabelvåg». Her er hva som skjer sett fra telefonen
          og kjernen:
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>
            t = 0 ms: telefonen måler RSRP fra Svolvær = −95 dBm, Kabelvåg = −105 dBm. Ingen
            håndover trigger.
          </li>
          <li>
            t = 4000 ms: toget kjører videre. RSRP Svolvær = −105 dBm, Kabelvåg = −98 dBm. Kabelvåg
            er nå sterkere med en margin på 7 dB.
          </li>
          <li>
            t = 4000 ms: telefonen sender en Measurement Report til Svolvær eNodeB over RRC-
            kontroll-kanalen.
          </li>
          <li>
            t = 4040 ms: Svolvær bestemmer håndover, sender en HANDOVER REQUEST over X2-
            grensesnittet direkte til Kabelvåg eNodeB.
          </li>
          <li>
            t = 4060 ms: Kabelvåg reserverer ressurser, svarer HANDOVER REQUEST ACK med en
            forhåndsallokert RNTI (Radio Network Temporary Identifier).
          </li>
          <li>
            t = 4080 ms: Svolvær sender RRC Connection Reconfiguration til telefonen — «bytt til
            Kabelvåg på frekvens X, RNTI Y, nå».
          </li>
          <li>
            t = 4090–4180 ms: telefonen retunes radio, sender Preamble til Kabelvåg, mottar Timing
            Advance, og kompletterer Random Access Procedure.
          </li>
          <li>
            t = 4180 ms: telefonen sender RRC Connection Reconfiguration Complete til Kabelvåg.
            Håndover ferdig.
          </li>
          <li>
            t = 4180 ms: Kabelvåg sender PATH SWITCH REQUEST til MME, som oppdaterer S-GW slik at
            GTP-tunnelen for Spotify-strømmen nå termineres hos Kabelvåg i stedet for Svolvær.
          </li>
          <li>
            t = 4200 ms: bufferede Spotify-pakker som var on-the-fly mot Svolvær blir forwarded over
            X2 til Kabelvåg og leveres til telefonen.
          </li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Hele opplevelsen for deg er at musikken kanskje gjorde en knapt hørbar pause på 100 ms.
          Spotify-app-en visste aldri at noe skjedde fordi din telefon-IP (utdelt av P-GW) ikke
          endret seg ett hakk.
        </p>
      </Example>

      <Hvorfor title="Hvorfor er mobilnettet bygget rundt celler i stedet for én stor radio?">
        <p>
          En enkelt kraftig sender kunne i prinsippet dekke en hel by, men den ville sløse spektrum
          massivt. All trafikk i området måtte deles på samme frekvens-bånd via en eller annen
          multi-access-mekanisme. Antall samtidige brukere ville være begrenset av hvor mange
          ortogonale «slots» (tid, frekvens, kode) du kan dele båndet i.
        </p>
        <p>
          Celler løser dette gjennom <em>frequency reuse</em>: samme frekvens-bånd kan brukes mange
          ganger over et område så lenge cellene som bruker det er fysisk langt nok unna hverandre
          til at signalene har dempet seg under interferens-terskelen før de når neste bruker.
          Effektivt skalerer kapasiteten med antall celler, ikke med spektrum- bredden.
        </p>
        <p>
          Sekundære fordeler: lavere sender-effekt per enhet (lengre batterilevetid og mindre
          stråling), kortere avstand mellom telefon og basestasjon (bedre SNR, høyere data- rate),
          og naturlig redundans (en enkelt-celle-feil tar ned et lite område, ikke hele byen).
          Trade-off er kompleksiteten — håndover, mobility management og hyppigere
          basestasjons-utbygging.
        </p>
      </Hvorfor>

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

      <div className="grid gap-3 lg:grid-cols-2">
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
            {
              term: "Korrespondent (CN, correspondent node)",
              body: "Den andre enden i kommunikasjonen — typisk en server på fast internett som mobil-hosten snakker med. CN trenger ikke vite om mobilitet i det hele tatt; den sender pakker til mobil-hostens permanente hjem-IP og forventer svar fra samme IP.",
            },
            {
              term: "Registrering med HA",
              body: "Når mobil-hosten kommer til et nytt foreign network, sender den (eventuelt via FA) en Registration Request til sin Home Agent med ny COA. HA oppdaterer en intern binding-tabell (hjem-IP → COA) og svarer med Registration Reply. Først etter dette kan trafikk leveres til den nye lokasjonen.",
            },
            {
              term: "Co-located care-of-address",
              body: "En alternativ form der mobil-hosten selv tar en COA fra DHCP på foreign network, uten å bruke en separat FA. Da pakker HA inn pakker og sender dem direkte til hosten på dens COA. Vanlig i IPv6 Mobile IP der DHCPv6 + Neighbor Discovery gjør FA-rollen overflødig.",
            },
            {
              term: "Reverse tunneling",
              body: "I motsatt retning sender mobil-hosten utgående pakker først tilbake til HA via en tunnel før de slippes ut på internett med hjem-IP som kilde. Uten dette ville mange ISP-er ha droppet pakker med ukjent kilde-IP (ingress filtering, RFC 2827). Påvirker ytelse ved at all trafikk gjør en omvei.",
            },
            {
              term: "Soft-state-binding",
              body: "HA og FA holder COA-bindingen som mykt-state: den utløper hvis ikke fornyet med jevne mellomrom. Den mobile hosten sender Registration Requests typisk hvert minutt. Hvis hosten plutselig dør eller mister kontakt, ryddes bindingen automatisk uten manuell intervensjon.",
            },
            {
              term: "Encapsulation-overhead",
              body: "Hver pakke i en Mobile IP-tunnel får en ekstra 20-byte IPv4-header (eller 40-byte IPv6). Det er typisk 1–2 % overhead på 1500-byte payload, men kan utløse fragmentering om kjede-MTU er 1500 og ytre payload også er 1500. Path MTU Discovery må fungere ende-til-ende for å unngå sortier.",
            },
          ]}
        />
        <Illustration caption="Pakkens omvei via home agent og inn-pakking til foreign network.">
          <MobileIpSvg />
        </Illustration>
      </div>

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

      <Example title="Eksempel: triangle routing kostnad mellom Tromsø og Bodø">
        <p>
          Si du er på reise i Bodø men din «hjem-IP» tilhører et nettverk i Tromsø. En kollega på
          samme hotell i Bodø prøver å sende deg en stor fil via et P2P-program over Mobile IP uten
          route optimization.
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>Hver pakke fra kollega → din hjem-IP → Home Agent i Tromsø (1100 km opp)</li>
          <li>
            HA i Tromsø pakker inn og sender via tunnel til Foreign Agent i Bodø (1100 km ned)
          </li>
          <li>FA pakker ut, leverer til deg over WiFi-en (10 m bort på rommet)</li>
        </ul>
        <p className="mt-2">
          Hver pakke gjør 2200 km omvei i stedet for de få meterne. Latency dobles fra ~5 ms til ~20
          ms RTT bare av geografi-omveien. Throughput halveres fordi sending er begrenset av BDP-en
          på den lange tunnelen, ikke den korte WiFi-en.
        </p>
        <p className="mt-2 text-muted-foreground">
          Med route optimization registrerer korrespondenten din COA via en sikker bindings-
          oppdatering, og pakker går direkte korrespondent → COA. Trade-off: korrespondent-stacken
          må implementere Mobile IP-utvidelsene, og det krever sikkerhets-relasjon med HA for å
          forhindre at en angriper omdirigerer trafikk ved å hevde en falsk COA.
        </p>
      </Example>

      <Hvorfor title="Hvorfor kan ikke IP-adresser bare være «portable» som mobil-nummer?">
        <p>
          Telefonnummer er en flat global identifikator som har null geografisk informasjon — et
          slå-opp-system (HLR) finner ut hvor du er hver gang noen ringer deg. Det fungerer fordi
          stemme-trafikk tåler 0.5–1 sekunds oppslag før samtalen begynner, og fordi det er relativt
          få samtaler per sekund globalt.
        </p>
        <p>
          IP-adresser er derimot designet for å være hierarkiske og rutbare: prefikset
          213.224.0.0/16 forteller hver ruter på internett at den skal sende videre mot Norge. Hvis
          enhver IP- adresse kunne være hvor som helst, måtte hver ruter slå opp hver pakke i en
          global tabell med milliarder av entries — fysisk umulig å gjøre på linje-rate.
        </p>
        <p>
          Mobile IP er kompromissløsningen: IP forblir hierarkisk-rutbar, men ett ankerpunkt (Home
          Agent eller mobilnettets gateway) holder en intern indirection-tabell for mobile hosts.
          Internet-skala-tabellen forblir liten; mobiliteten håndteres lokalt. Det er samme prinsipp
          som en sentralbordet på et hotell: bestillingen kommer til sentralbordet, sentralbordet
          vet hvilket rom du er på.
        </p>
      </Hvorfor>

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

      <div className="grid gap-3 lg:grid-cols-2">
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
            {
              term: "RSRP og RSRQ",
              body: "Reference Signal Received Power måler ren styrke (typisk −70 til −120 dBm); Reference Signal Received Quality måler styrke relativt til interferens (typisk −5 til −20 dB). En celle med høy RSRP men dårlig RSRQ er sterk men full — håndover dit hjelper ikke. Telefonen tar begge inn i beslutningen.",
            },
            {
              term: "Time-to-Trigger (TTT)",
              body: "Hvor lenge en målt nabocelle må holde seg over terskel før håndover faktisk utløses, typisk 40–640 ms. Forhindrer ping-pong-håndover på grensen mellom to celler der signalstyrken svinger frem og tilbake. For lav TTT = mange unødvendige håndover; for høy = klienter holder seg på en dårligere celle lenger enn nødvendig.",
            },
            {
              term: "Mobile-controlled vs network-controlled handover",
              body: "Mobile-controlled (klassisk WiFi): klienten alene bestemmer når og hvor den skal bytte. Network-controlled (LTE/5G): nettverket bestemmer basert på klientens målerapporter. Network-assisted (3G): klienten foreslår, nettet godkjenner. Mer kontroll hos nettet = bedre samkjøring og ressurs-balansering på tvers av celler.",
            },
            {
              term: "X2/Xn-grensesnitt",
              body: "Direkte tunneler mellom nabo-basestasjoner (eNodeB i 4G, gNodeB i 5G) som bærer både kontroll-meldinger (HANDOVER REQUEST) og bufferede bruker-data under håndover. Reduserer behov for å gå om kjernen, og kutter dermed håndover-latency med flere tiitalls millisekund.",
            },
            {
              term: "Conditional handover (CHO)",
              body: "5G-funksjon: nettet forbereder håndover til flere kandidat-celler på forhånd, og telefonen utløser bytte selv når en terskel passes — uten nytt signal-til-nettet-trinn. Reduserer typisk håndover-gap fra 50 ms til under 10 ms. Spesielt viktig for høy-hastighets-toggjennomgang.",
            },
            {
              term: "Ping-pong-effekten",
              body: "En klient som beveger seg langs grensen mellom to celler kan veksle mellom dem mange ganger på få sekunder hvis signalmålinger fluktuerer på grunn av multipath-fading. Skadelig fordi hver håndover bruker både radio- og kjerne-ressurser. Demping via TTT og histeresis (terskel-margin) er essensielt.",
            },
            {
              term: "802.11r Fast BSS Transition",
              body: "WiFi-utvidelse der to AP-er i samme nett deler PMK-R0/PMK-R1 nøkler på forhånd, slik at en roamende klient kan re-assosiere uten å gjennomføre hele 4-veis WPA2-handshake-en (som tar 100–200 ms). Med 802.11r blir AP-bytte ofte under 30 ms — nok til at VoIP overlever.",
            },
          ]}
        />
        <Illustration caption="Tidslinje for soft vs hard håndover — overlapp eller gap mellom gammel og ny.">
          <HandoverSvg />
        </Illustration>
      </div>

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

      <Example title="Eksempel: ping-pong-effekt med ulik histeresis-innstilling">
        <p>
          En bruker går langs en korridor mellom to AP-er, AP-Nord og AP-Sør, der signalet svinger
          ±3 dB på grunn av multipath. Vi sammenligner roaming-oppførsel under to konfigurasjoner.
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>Snitt-signal AP-Nord: faller fra −60 til −78 dBm over 30 sekunder</li>
          <li>Snitt-signal AP-Sør: stiger fra −78 til −60 dBm over samme tid</li>
          <li>Multipath-støy: ±3 dB tilfeldig variasjon på 200 ms tidsskala</li>
        </ul>
        <p className="mt-2">
          <strong>Konfig A — ingen histeresis, TTT = 100 ms:</strong> klienten bytter så snart
          AP-Sør viser sterkere et øyeblikk. På grunn av ±3 dB-variasjonen krysser «sterkere»-
          tilstanden frem og tilbake mange ganger nær midt-punktet. Resultat: 8 håndover på 10
          sekunder — i hver gjør klienten en full 4-veis-handshake hvis ikke 802.11r er på, totalt
          ca. 1.5 sekunder ekstra latency, ofte med pakke-tap.
        </p>
        <p className="mt-2">
          <strong>Konfig B — 6 dB histeresis, TTT = 640 ms:</strong> AP-Sør må være målt minst 6 dB
          over AP-Nord i minst 640 ms før bytte. Multipath-variasjonen klarer ikke utløse det alene.
          Resultat: nøyaktig 1 håndover når klienten har gått tydelig inn i AP-Sør sitt område.
          Sømløst for video-samtaler.
        </p>
        <p className="mt-2 text-muted-foreground">
          Trade-off: med konfig B kan klienten henge på AP-Nord noen sekunder etter den burde ha
          byttet, og oppleve litt lavere data-rate i mellomtiden. For VoIP og video er stabilitet
          viktigere enn marginal data-rate; for filnedlastning kan det være motsatt.
        </p>
      </Example>

      <Hvorfor title="Hvorfor er soft handover praktisk talt forsvunnet fra 4G og 5G?">
        <p>
          Soft handover (kobling til to basestasjoner samtidig) krever at begge stasjoner sender på
          eksakt samme frekvens og at telefonen kombinerer signalene koherent. Det fungerer i 3G
          (UMTS) fordi den bruker CDMA der ulike celler kan sende på samme frekvens samtidig — de
          kodes med ortogonale sekvenser som mottakeren skiller matematisk.
        </p>
        <p>
          LTE og 5G bruker OFDMA i stedet for CDMA. Hver celle har sin egen frekvens-tildeling og
          unikt subbærer-mønster. To celler på samme frekvens ville interferere med hverandre i
          stedet for å kombineres konstruktivt. Soft handover er fysisk inkompatibel med OFDMA-
          arkitekturen.
        </p>
        <p>
          I stedet har 4G/5G blitt veldig gode på <em>fast</em> hard handover. X2/Xn-grensesnittet
          mellom basestasjoner lar dem koordinere så tett at gapet kommer ned mot 20 ms — kortere
          enn en VoIP-pakkes inter-arrival-tid. Conditional handover i 5G kutter gapet enda mer.
          Trade-off-en med å miste soft-modus aksepteres fordi OFDMA gir så mye høyere spektral
          effektivitet (bits per Hz per second) at nett-totalen vinner.
        </p>
      </Hvorfor>

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

      <div className="grid gap-3 lg:grid-cols-2">
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
            {
              term: "Bufferbloat på radio-link",
              body: "Radio-laget buffrer pakker for å hente ut alle de retransmisjons-mulighetene den kan før den gir opp. Med 100+ ms av kø-tid blir RTT målt av TCP urealistisk høy, og TCP øker congestion window mer enn den burde. Resultat: enda mer kø, enda høyere RTT — selv om båndbredden er ledig.",
            },
            {
              term: "Snoop-protokoll",
              body: "En tidlig løsning på radio-tap der en mellom-ruter (typisk basestasjonen) cacher TCP-segmenter og lokalt retransmitterer hvis ACK ikke kommer fra mottakeren, samt skjuler duplikate ACK-er fra senderen. Slik unngås at avsender utløser congestion-respons. Ikke utbredt i dag fordi det krever klartekst-TCP — mislykkes med IPsec/TLS.",
            },
            {
              term: "Split-TCP arkitektur",
              body: "Forbindelsen deles eksplisitt i to: én TCP-sesjon mellom mobil host og PEP, en annen mellom PEP og endelig server. PEP-en bruker spesielle innstillinger på radio-siden (større initial window, mer aggressiv ACK-clocking) og standard på kabel-siden. Bryter ende-til-ende-prinsippet, derav kontroversielt — men effektivt der det fungerer.",
            },
            {
              term: "Explicit loss notification (ELN)",
              body: "Foreslått utvidelse av TCP der nettverket eksplisitt signaliserer «pakke tapt grunnet radio-feil, ikke congestion». Avsenderen retransmitterer uten å redusere senderaten. Aldri standardisert fordi det krever endring i alle berørte rutere. Filosofisk slekt til ECN (Explicit Congestion Notification).",
            },
            {
              term: "Selective ACK (SACK)",
              body: "TCP-utvidelse der mottaker rapporterer eksakt hvilke segmenter som er mottatt, ikke bare høyeste fortløpende. Lar senderen retransmittere kun det som faktisk mangler. Spesielt nyttig over radio-link der enkelt-pakker-tap fra støy ellers ville utløse ineffektiv full re-sending av et helt vindu.",
            },
            {
              term: "Slow start på en mobil link",
              body: "Når en TCP-forbindelse starter, dobler avsender congestion-vinduet hver RTT inntil tap detekteres. På en høy-BDP radio-link kan denne fasen ta sekunder, og hvis et tap skjer underveis (lett over radio), kan slow-start avbrytes prematurt. Resultat: forbindelsen får aldri lov å utnytte full kapasitet før den avsluttes.",
            },
          ]}
        />
        <Illustration caption="Kabelmessig: tap = congestion. Radio: tap kan komme fra støy, fading, eller handover — TCP vet ikke forskjellen.">
          <TcpWirelessSvg />
        </Illustration>
      </div>

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

      <Example title="Eksempel: håndover-pause som utløser spurious timeout">
        <p>
          Du er på toget mellom Hamar og Lillehammer i en SSH-sesjon. Toget passerer en celle-
          grense. Vi tracer en spurious timeout i detalj.
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>
            Estimat før hendelse: SRTT (smoothed RTT) = 60 ms, RTTVAR = 10 ms, RTO = SRTT + 4·RTTVAR
            = 100 ms
          </li>
          <li>t = 0 ms: avsender sender SEQ=10000, 1460 byte</li>
          <li>t = 1 ms: håndover-prosedyre starter på radio-laget</li>
          <li>t = 1–160 ms: telefonen er i en kort radio-blackout mens den retunes til ny celle</li>
          <li>
            t = 100 ms: TCP RTO utløpt hos avsender — antar pakken er tapt, retransmitterer
            SEQ=10000, halverer cwnd, går inn i slow-start
          </li>
          <li>
            t = 160 ms: håndover ferdig, original pakke kommer fram (var bufferet i ny basestasjon)
          </li>
          <li>t = 220 ms: avsender mottar ACK for original pakken</li>
          <li>t = 280 ms: avsender mottar duplikat-ACK for retransmitten (ignoreres)</li>
        </ul>
        <p className="mt-2">
          Resultatet: cwnd er halvert til ingen nytte, og slow-start må klatre opp igjen. På en
          forbindelse med 50 ms RTT tar det 8–10 RTT-er å nå opprinnelig nivå — en halv sekund tapt
          throughput. Brukeren føler det som at toget «får dårlig dekning» selv om radio-en allerede
          er reetablert.
        </p>
        <p className="mt-2 text-muted-foreground">
          Linux har en mekanisme kalt F-RTO (Forward RTO recovery) som detekterer spurious timeouts
          ved at den neste ACK ikke er duplikat — og deretter angrer kondisjonelt på
          rate-reduksjonen. Hjelper, men løser ikke grunnproblemet: TCP og radio-laget snakker ikke
          samme språk.
        </p>
      </Example>

      <Hvorfor title="Hvorfor sliter klassisk TCP fundamentalt med trådløse lenker?">
        <p>
          TCP sin congestion control bygger på antagelsen at pakketap er sjeldne og at når de skjer
          er det fordi en buffer et sted ble full. Den ble formulert på 1980-tallet av Van Jacobson
          da nett var koppertråd-baserte og bit-feilrate var rundt 10⁻¹². I den verdenen stemmer
          antakelsen: 99.99 % av tap er congestion.
        </p>
        <p>
          Radio-link bryter antakelsen på flere måter samtidig. Bit-feil fra støy og fading kan gi
          pakke-tap som er fysisk-laget-fenomener, ikke kø-overløp. Håndover-pauser ser ut som tap
          selv om pakken venter i kø hos den nye basestasjonen. Link-layer retransmits gir variabel
          forsinkelse som forvirrer RTT-estimatet. RTT mellom konsekutive pakker kan svinge med en
          faktor på 5 over hundrevis av ms.
        </p>
        <p>
          Konsekvensen er en systematisk under-utnyttelse: TCP halverer senderaten ved nesten hvert
          «tap» og bruker mye tid på å klatre opp igjen via slow-start eller AIMD-økning. På en
          lenke med 100 Mbps nominell kapasitet og 0.5 % radio-tap kan effektiv throughput synke til
          30 Mbps. BBR sin RTT/båndbredde-basert modell adresserer dette, men ble standardisert ti
          år etter at trådløst ble dominant — derav den lange perioden mobil-nett bare «føltes
          treigt» selv med god dekning.
        </p>
      </Hvorfor>

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

      <Exercise
        question="En 802.11n-station måler SNR = 25 dB ved AP-en. Standard-modulasjons-tabellen sier at 64-QAM krever minst 22 dB SNR for 5/6 koderate, mens 256-QAM krever 28 dB. Hvilken modulasjon bør stationen velge, og hva betyr det for praktisk data-rate på en 20 MHz kanal?"
        hint="Tenk på marginalt over terskel vs robust drift, og hvor mange bit per symbol modulasjonen koder."
        answer={
          <>
            <p>
              Stationen ligger 3 dB over 64-QAM-terskelen og 3 dB under 256-QAM-terskelen. Velger
              64-QAM med 5/6 koderate — det er den høyeste modulasjonen den kan kjøre stabilt med en
              respekterbar margin mot fluktuasjoner.
            </p>
            <p className="mt-2">
              64-QAM koder 6 bit per symbol. På en 20 MHz 802.11n-kanal med 1 spatial stream og
              normal guard interval er symbolraten ca. 13.5 Msymbol/s. Med 5/6 koderate (av 6
              kodebits beholdes 5 informasjonsbits): 13.5 · 6 · (5/6) = 67.5 Mbps brutto. Etter
              MAC-overhead (DIFS, SIFS, ACK, headers) lander praktisk throughput rundt 40–50 Mbps.
            </p>
            <p className="mt-2 text-muted-foreground">
              Hvis stationen forsøkte 256-QAM med kun 25 dB SNR ville bit-feilraten bli for høy —
              link-layer ARQ ville retransmittere kontinuerlig, og effektiv throughput ville ende
              lavere enn med sikkert 64-QAM. Den adaptive modulasjons-velgeren prøver jevnlig opp og
              ned for å finne sweet spot.
            </p>
          </>
        }
      />

      <Exercise
        question="Du har 4G med målte verdier: nominell rate 100 Mbps, RTT 60 ms, pakke-tap fra radio 0.3 %. Beregn (a) bandwidth-delay-product, (b) hvilken TCP-vindu-størrelse som trengs for å fylle røret, og (c) hvorfor klassisk TCP CUBIC ikke vil oppnå nominell rate uansett vindu-størrelse."
        hint="BDP-formelen og Mathis-formelen for TCP throughput under tap."
        answer={
          <>
            <p>
              <strong>(a) BDP:</strong> 100 Mbps · 60 ms = 100·10⁶ · 0.060 = 6·10⁶ bit = 750 KB.
              Standard TCP-vindu på 65 535 byte er en faktor 12 for lite.
            </p>
            <p className="mt-2">
              <strong>(b) Nødvendig vindu:</strong> 750 KB. Krever TCP window scaling-opsjonen (RFC
              1323) som er på som default i Linux/Windows. Også krever buffer-størrelse i sender- og
              mottaker-stacken på minst 750 KB; standard er ofte 4 MB, nok.
            </p>
            <p className="mt-2">
              <strong>(c) Mathis-formelen:</strong> for TCP Reno/CUBIC under stabil tap-rate p er
              max-throughput ca. MSS / (RTT · √p · 1.22). Med MSS=1460 byte, RTT=0.060 s, p=0.003:
              max ≈ 1460·8 / (0.060 · √0.003 · 1.22) = 11680 / 0.00401 ≈ 2.9 Mbps.
            </p>
            <p className="mt-2 text-muted-foreground">
              Selv med uendelig vindu vil CUBIC-respons på 0.3 % tap holde throughput rundt 3 Mbps —
              under 3 % av nominell. BBR ser bort fra tap som signal og kan oppnå 80–90 % av
              nominell på samme link. Det er hvorfor Mathis-formelen er en så streng dom over
              klassisk TCP i radio-kontekst.
            </p>
          </>
        }
      />

      <Exercise
        question="En 4G-telefon flytter seg fra Tromsø sentrum til Bodø sentrum (1100 km bilfart). Beskriv hva som skjer med telefonens IP-adresse, antall håndover-hendelser underveis (anslag), og hvorfor en SSH-sesjon ikke nødvendigvis overlever turen selv om mobilkjernen prøver."
        hint="Telefonens IP eies av P-GW. Hva skjer ved tracking area updates og hvor lenge varer en radio bearer?"
        answer={
          <>
            <p>
              Telefonens IP forblir uendret hele turen — den eies av P-GW (eller UPF) som er
              sentralt plassert, mens GTP-tunnelene endrer endepunkt for hver basestasjons- bytte.
              Det er det elegante designet bak LTE-mobilitet.
            </p>
            <p className="mt-2">
              Antall håndover: 1100 km / typisk 1 km mellom celler i forsiktig dekning ≈ 1100
              celle-bytter. Med moderne CHO går de fleste gjennom på 20–50 ms hver. Total «tap»- tid
              i radio-laget: 30–60 sekunder spredt over hele turen.
            </p>
            <p className="mt-2">Hvorfor SSH likevel kan dø:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>
                Lange dekningshull (tunneler, fjell-skygger) kan vare flere minutter — TCP gir opp
                etter typisk 5–15 minutter med ingen ACK.
              </li>
              <li>
                Tracking Area Update — når du krysser fra én MME-soner til en annen, gjør telefonen
                en TAU. Hvis denne feiler eller signaleringen tar over 100 sekunder, kan radio
                bearer rives ned og IP-en endre seg.
              </li>
              <li>
                SSH har KeepAlive default på 0 (av) i mange klienter. Hvis serveren rebooter
                NAT-state, vil pakker etter dette dø stille.
              </li>
            </ul>
            <p className="mt-2 text-muted-foreground">
              Workaround: bruk mosh eller en SSH-tunnel over WireGuard. WireGuard har handover-
              vennlig roaming (klienten oppdager IP-endring og oppdaterer endpoint automatisk), og
              mosh bruker UDP med egen sekvensering og overlever korte avbrudd som SSH-over-TCP ikke
              gjør.
            </p>
          </>
        }
      />

      <Exercise
        question="Du måler en WiFi-celle og finner at airtime brukt på data er 40 %, airtime brukt på MAC-overhead (DIFS + SIFS + ACK + headers) er 35 %, og airtime brukt på faktiske kollisjoner er 25 %. Foreslå tre konkrete endringer som ville flytte balansen mot mer data."
        hint="Tenk på frame-størrelse, RTS/CTS-terskel, og hvor mange klienter konkurrerer samtidig."
        answer={
          <>
            <p>
              <strong>1. Frame-aggregation (A-MPDU):</strong> 802.11n+ samler flere små frames i én
              transmisjon med felles DIFS, backoff, og ACK. Hvis snittstørrelsen idag er 500 byte og
              vi aggregerer 4 frames, øker data-andel fra 40 % til ~65 % uten å redusere
              MAC-pålitelighet. Krever bare reconfiguration i AP og klient.
            </p>
            <p className="mt-2">
              <strong>
                2. Slå på RTS/CTS for store frames hvis hidden terminals skapte kollisjonene:
              </strong>{" "}
              25 % airtime på kollisjoner er svært høyt. Hvis dette skyldes skjulte stasjoner (sjekk
              med Wireshark om kollisjons-frequensen er korrelert med spesifikke par av stationer),
              kutter RTS/CTS de fleste. Slå på med terskel på 500–1000 byte.
            </p>
            <p className="mt-2">
              <strong>3. Bytt til 5 GHz eller del klientene mellom 2 AP-er:</strong> 25 %
              kollisjoner antyder enten skjult-terminal eller for mange aktive stationer per AP.
              Hvis SNR tillater det, dytt halvparten av klientene til 5 GHz-radio som er en separat
              luft-tid-pool. Effektivt en gratis kapasitet-dobling.
            </p>
            <p className="mt-2 text-muted-foreground">
              Hvis problemet er airtime fairness — én treg klient dominerer luft-tiden — er en
              fjerde mulighet å konfigurere AP-en til å begrense maks-MCS-tid per klient («airtime
              fairness»-funksjon i Cisco/Aruba/Ubiquiti).
            </p>
          </>
        }
      />

      <Exercise
        question="En multipath-fading-detalj: hvorfor kan flytting av en laptop 10 cm endre signal-styrken fra full til null, men flytting 10 m i samme retning ikke nødvendigvis?"
        hint="Bølge-lengde på 2.4 GHz og hva som konstruktivt vs destruktivt addering betyr."
        answer={
          <>
            <p>
              Bølge-lengde for 2.4 GHz radio er λ = c/f = 3·10⁸ / 2.4·10⁹ ≈ 12.5 cm. To bølge-kopier
              som ankommer mottakeren med en sti-lengde-forskjell på halve bølge-lengden (≈ 6.25 cm)
              er i motfase og kansellerer hverandre destruktivt. Forskjell på en hel bølge-lengde
              gir konstruktiv addering — dobbelt så sterkt signal.
            </p>
            <p className="mt-2">
              Hvis du flytter laptopen 10 cm i en retning som endrer sti-lengde-differansen mellom
              direkte bølge og en sterk refleksjon med omtrent 6 cm, går du fra konstruktiv til
              destruktiv addering — et fading-hull. Plutselig 20 dB tap.
            </p>
            <p className="mt-2">
              Men 10 m flytting endrer i prinsippet ikke bare denne ene refleksjonen — det endrer
              hele settet av refleksjoner samtidig, og du befinner deg i et nytt multipath-mønster
              med andre konstruktive/destruktive lommer. Snitt-signal-styrken er omtrent den samme
              (path loss endrer seg lite på 10 m sammenlignet med opprinnelig avstand på 20 m), bare
              med ulik lokal struktur.
            </p>
            <p className="mt-2 text-muted-foreground">
              Det er den fysiske grunnen til at «walk-around-test» ofte fungerer bedre enn
              «sitt-fast-test»: en bruker i bevegelse glir ut av et fading-hull før det blir
              merkbart. En stillesittende laptop kan bli fast i et hull og oppleve dårlig dekning
              til den flyttes.
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
    <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-violet-700 dark:text-violet-400 font-semibold mb-1">
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
