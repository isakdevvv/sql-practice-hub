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

type Tab = "intro" | "6.1" | "6.2" | "6.3" | "6.4" | "6.5" | "6.6" | "6.7" | "6.8";

const SECTIONS_6: SectionNavItem[] = [
  { id: "intro", label: "Start her" },
  { id: "6.1", label: "6.1 Tjenester" },
  { id: "6.2", label: "6.2 Feiloppdaging" },
  { id: "6.3", label: "6.3 Multiple access" },
  { id: "6.4", label: "6.4 Switched LAN" },
  { id: "6.5", label: "6.5 Ethernet" },
  { id: "6.6", label: "6.6 VLAN" },
  { id: "6.7", label: "6.7 Datasenter" },
  { id: "6.8", label: "6.8 Oppgaver" },
];
const NEXT_CHAPTER_6 = { slug: "kurose-kap-7", title: "Trådløst og mobilt" };

export function KuroseKap6Page() {
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
              Kap. 6 — Link-laget og LAN
            </h1>
          </div>
          <nav className="ml-auto flex flex-wrap gap-0.5">
            <TabBtn active={tab === "intro"} onClick={() => setTab("intro")}>
              Start
            </TabBtn>
            <TabBtn active={tab === "6.1"} onClick={() => setTab("6.1")} title="Tjenester">
              6.1
            </TabBtn>
            <TabBtn active={tab === "6.2"} onClick={() => setTab("6.2")} title="Feiloppdaging">
              6.2
            </TabBtn>
            <TabBtn active={tab === "6.3"} onClick={() => setTab("6.3")} title="Multiple access">
              6.3
            </TabBtn>
            <TabBtn active={tab === "6.4"} onClick={() => setTab("6.4")} title="Switched LAN">
              6.4
            </TabBtn>
            <TabBtn active={tab === "6.5"} onClick={() => setTab("6.5")} title="Ethernet">
              6.5
            </TabBtn>
            <TabBtn active={tab === "6.6"} onClick={() => setTab("6.6")} title="VLAN">
              6.6
            </TabBtn>
            <TabBtn active={tab === "6.7"} onClick={() => setTab("6.7")} title="Datasenter">
              6.7
            </TabBtn>
            <TabBtn active={tab === "6.8"} onClick={() => setTab("6.8")} title="Oppgaver">
              Oppg.
            </TabBtn>
          </nav>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "6.1" && <Section61 />}
        {tab === "6.2" && <Section62 />}
        {tab === "6.3" && <Section63 />}
        {tab === "6.4" && <Section64 />}
        {tab === "6.5" && <Section65 />}
        {tab === "6.6" && <Section66 />}
        {tab === "6.7" && <Section67 />}
        {tab === "6.8" && <Section68 />}

        <SectionPager
          tabs={SECTIONS_6}
          current={tab}
          onPick={(id) => setTab(id as Tab)}
          nextChapter={NEXT_CHAPTER_6}
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
            Forklare hva en ramme er, hva MAC-adresser brukes til, og hvorfor de er forskjellig fra
            IP-adresser.
          </li>
          <li>
            Regne paritets-bit, 2D-paritet, internet checksum og CRC for en gitt bit-sekvens — og
            vite hvilken som tåler hvilke feil.
          </li>
          <li>
            Sammenligne ALOHA-varianter og CSMA/CD: når slipper du å sende, og hva er teoretisk max
            throughput?
          </li>
          <li>
            Følge en ramme gjennom en switch som lærer seg selv — hvordan MAC-tabellen bygges opp og
            hvorfor flooding skjer ved oppstart.
          </li>
          <li>
            Forklare hvordan ARP knytter IP til MAC, og hva forskjellen er mellom MAC-broadcast og
            IP-broadcast.
          </li>
          <li>
            Beskrive hvorfor en VLAN-tag (802.1Q) gjør at én fysisk switch kan oppføre seg som mange
            separate broadcast-domener.
          </li>
          <li>
            Skissere en fat-tree / leaf-spine topologi og forklare hvorfor moderne datasentre velger
            den framfor klassisk tre-hierarki.
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Kapittelets struktur</h2>
        <ol className="list-decimal pl-5 text-muted-foreground space-y-1">
          <li>Tjenester levert av link-laget — rammer, MAC, half/full duplex</li>
          <li>Feiloppdaging — paritet, 2D-paritet, checksum, CRC</li>
          <li>Multiple access — ALOHA, CSMA/CD, taking-turns</li>
          <li>Switched LAN — ARP og switch self-learning</li>
          <li>Ethernet — ramme-format og hierarki av switcher</li>
          <li>VLAN — én fysisk switch, mange logiske nett</li>
          <li>Datasenter-nettverk — fat-tree og leaf-spine</li>
          <li>Oppgaver — sjekk forståelsen din</li>
        </ol>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => onPick("6.1")}>
            Start på 6.1 →
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 6.1 — Tjenester levert av link-laget
// ============================================================
function Section61() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="6.1" title="Hva gjør link-laget egentlig?" />

      <p className="text-muted-foreground">
        Link-laget er det laveste laget vi behandler i detalj. Det tar et IP-datagram fra
        nettverkslaget, pakker det inn i en <em>ramme</em>, og flytter rammen over én fysisk lenke
        til neste node. Det er bittelitt mer komplisert enn det høres ut, fordi link-laget også må
        håndtere bit-feil, kollisjoner på delte medier, og det å vite hvem den faktisk snakker med.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            {
              term: "Ramme (frame)",
              body: "Link-lagets enhet. Består av et header, payload (typisk et IP-datagram) og noen ganger en trailer med feil-sjekk. Ulike teknologier (Ethernet, WiFi, PPP) har ulike ramme-format, men ideen er den samme.",
            },
            {
              term: "Node",
              body: "Samlebetegnelse for alle enheter som snakker link-lag: hosts, rutere, switcher, aksess-punkter. En lenke kobler typisk to noder (eller flere noder hvis det er et delt medium).",
            },
            {
              term: "MAC-adresse",
              body: "48-bit identifikator som er knyttet til hvert nettverkskort. Skrives som seks heksadesimale par, f.eks. 04:1B:6F:A2:90:0C. De første 24 bitene identifiserer leverandøren (OUI); de neste 24 er en serienummer. Hver MAC-adresse er ment å være globalt unik.",
            },
            {
              term: "Framing",
              body: "Prosessen med å avgjøre hvor en ramme starter og hvor den slutter på det fysiske mediumet. Ethernet bruker en preamble-sekvens før hver ramme; WiFi bruker andre teknikker. Uten framing er en bit-strøm bare uleselig støy.",
            },
            {
              term: "Half-duplex vs full-duplex",
              body: "På en half-duplex lenke kan bare én node sende av gangen — som en walkie-talkie. På full-duplex sender begge sider samtidig over hver sine ledere. Moderne Ethernet med switch er full-duplex; klassisk Ethernet over koaks var half-duplex.",
            },
            {
              term: "MTU (Maximum Transmission Unit)",
              body: "Største ramme link-laget kan håndtere. Ethernet har 1500 bytes payload som standard. Hvis et IP-datagram er større, må det fragmenteres — derav PMTU-discovery i IP.",
            },
            {
              term: "Pålitelig levering (link-nivå)",
              body: "Noen link-lag (WiFi, gamle modem-protokoller) tilbyr garanti om at hver ramme leveres uten feil. Ethernet over kabel gjør det IKKE — feilete rammer kastes bare, og det er TCP sin jobb høyere oppe å oppdage tapet.",
            },
            {
              term: "Flytstyring (link-nivå)",
              body: "Ethernet kan sende en PAUSE-ramme (IEEE 802.3x) når mottakerens buffer fylles opp — sender stopper i N kvante (1 kvant = 512 bit-tider). Brukes i lossless fabric for FCoE og RoCE. Skiller seg fra TCPs ende-til-ende flytstyring som virker over hele stien, ikke per lenke.",
            },
            {
              term: "OUI (Organizationally Unique Identifier)",
              body: "De første 3 bytene (24 bit) i en MAC-adresse identifiserer NIC-produsenten. F.eks. 00:1B:21 = Intel, B8:27:EB = Raspberry Pi Foundation. Du kan slå opp en MAC mot IEEEs OUI-register for å se hvem som lagde kortet — nyttig i nettverks-feilsøking.",
            },
            {
              term: "I/G- og U/L-bit",
              body: "I første byte av MAC-adressen er bit 0 «individuell/gruppe» (1 = multicast) og bit 1 «universell/lokal» (1 = lokalt administrert, ikke globalt unik). Lokalt administrerte MAC-er brukes f.eks. når en hypervisor lager virtuelle NIC-er for VM-er.",
            },
            {
              term: "Lenke-type: point-to-point vs broadcast-medium",
              body: "Point-to-point: nøyaktig to noder per lenke (f.eks. SONET, dial-up, PPP over fiber). Broadcast-medium: tre eller flere noder deler ett medium (gammel koaks-Ethernet, WiFi-celle, satellitt-uplink). Multiple-access-protokoller (6.3) løser problemet bare for det andre tilfellet.",
            },
            {
              term: "Adapter-modell",
              body: "Avsender-NIC pakker datagrammet i en ramme, beregner CRC, plasserer på medium. Mottaker-NIC leser bits, verifiserer CRC, sjekker om MAC matcher (eller om kortet er i promiscuous mode), og leverer payload til OS. Hele transaksjonen er én tur for NIC-en — derfor er link-laget tradisjonelt et hardware-tema.",
            },
            {
              term: "Promiscuous mode",
              body: "Når NIC-en konfigureres til å akseptere alle rammer på mediet — også de som ikke er adressert til den. Brukes av sniffere som Wireshark og tcpdump. På en switch ser du da bare det som faktisk når din port; for å se hele LAN trenger du en SPAN-port eller en hub.",
            },
          ]}
        />
        <Illustration caption="Link-laget tar et IP-datagram og pakker det inn med MAC-header + trailer før det går ut på fysisk medium.">
          <FrameSvg />
        </Illustration>
      </div>

      <Example title="Eksempel: hvor er link-laget implementert?">
        <p>
          Det meste av link-laget er hardware — det sitter i nettverkskortet (NIC) på maskinen, ikke
          i operativsystemet. Når en pakke kommer inn, sjekker NIC-en MAC-adressen i hardware,
          beregner CRC i hardware, og fjerner rammen før den sender datagrammet videre til kjernen.
        </p>
        <p className="mt-2">
          Konsekvensen: hvis NIC-en oppdager bit-feil, kastes rammen STILLE før operativsystemet ser
          den. Du kan ikke logge det fra software. Det er derfor du må se på selve switchen (eller
          bruke <code>ethtool -S</code>) for å oppdage en kabel som har dårlig krymp.
        </p>
      </Example>

      <Example title="Eksempel: les en MAC-adresse — hvilket kort er det?">
        <p>
          Vi ser MAC-en <code>B8:27:EB:4A:12:99</code> på en port i bedriftens switch. Vi ønsker å
          vite hvilken type maskin det er.
        </p>
        <ol className="list-decimal pl-5 mt-1 space-y-1">
          <li>
            OUI = de første 3 bytene = <code>B8:27:EB</code>.
          </li>
          <li>
            Slå opp i IEEEs database (eller bare i Wireshark) → <em>Raspberry Pi Foundation</em>.
          </li>
          <li>
            Sjekk I/G-bit i første byte: 0xB8 = 1011 1000. Bit 0 (laveste) = 0 → unicast. Bit 1 = 0
            → globalt unik (fabrikkbrent, ikke lokal).
          </li>
          <li>
            Konklusjon: porten har en fysisk Raspberry Pi koblet til, ikke en VM. Ofte nok til å
            spore opp «hva pokker er det der?» uten å trekke i en kabel.
          </li>
        </ol>
      </Example>

      <Hvorfor title="Hvorfor har vi BÅDE IP- og MAC-adresser?">
        <p>
          Det føles redundant: IP-en sier «hvor i nettet», MAC-en sier «hvilket kort». Hvorfor ikke
          bare ha én? Svaret er at de løser ulike problemer på ulike tidsskalaer.
        </p>
        <p>
          <strong>MAC er knyttet til hardware.</strong> En NIC har sin MAC fra fabrikken; du kan
          flytte kortet til et nytt rom uten å endre noe. Det gjør plug-and-play mulig — switchen
          lærer adressen automatisk når kortet plugges inn.
        </p>
        <p>
          <strong>IP er knyttet til topologi.</strong> Når kortet plugges inn et nytt sted i nettet,
          får det en ny IP fra det subnettet det havner i. Rutingsystemet ville aldri skalert hvis
          rutere skulle huske hver enkelt MAC i hele internett — det fungerer fordi IP-adressene er
          hierarkiske og kan oppsummeres med prefiks (CIDR).
        </p>
        <p>
          Konsekvensen er at IP-pakken er konstant gjennom hele reisen, mens MAC-rammen rundt byttes
          ut på hvert hopp. Vi får både plug-and-play OG skalerbar ruting.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-day-in-the-life", "dte2507-switch-self-learning"]} />
    </article>
  );
}

// ============================================================
// 6.2 — Feiloppdaging
// ============================================================
function Section62() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="6.2" title="Feiloppdaging — fra paritet til CRC" />

      <p className="text-muted-foreground">
        Ingen fysisk lenke er perfekt. Spenninger flippes, kosmisk stråling treffer minne, en kabel
        ligger nær en sveiseapparat. Link-laget legger ekstra bits i hver ramme slik at mottakeren
        kan oppdage at noe har gått galt — og noen ganger reparere det. Vi går fra det enkleste til
        det som faktisk brukes i Ethernet.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            {
              term: "Paritets-bit",
              body: "Én ekstra bit per gruppe data, satt slik at totalt antall 1-ere blir partall (even parity) eller oddetall. Oppdager alle 1-bit-feil. Mister evnen til å oppdage 2-bit-feil. Brukes lite i moderne nett, men er pedagogisk grunnlag.",
            },
            {
              term: "2D-paritet (todimensjonal)",
              body: "Legg databitene i et rektangel og legg paritets-bit både per rad og per kolonne (pluss en for hjørnet). Du kan da ikke bare OPPDAGE en 1-bit-feil, men FINNE den (krysset mellom feil rad og feil kolonne) og reparere den. Enkel forward error correction.",
            },
            {
              term: "Internet checksum",
              body: "Summer alle 16-bit ord i pakken med ones-complement-aritmetikk, ta komplementet, send det med. Mottakeren summerer alt inkludert checksum — får null hvis intakt. Svakere enn CRC (oppdager ikke alle 2-bit-feil) men billig å regne i software. Brukes i TCP/UDP/IP, men ikke link-laget.",
            },
            {
              term: "CRC (Cyclic Redundancy Check)",
              body: "Behandler bit-sekvensen som koeffisienter i et polynom og tar resten ved divisjon med et generator-polynom G. Resten er CRC-verdien, sendes med rammen. Hardware-vennlig — implementeres med shift-registre. Ethernet bruker CRC-32 med et 33-bit G. Oppdager alle 1, 2 og 3-bit-feil, alle burst-feil opp til 32 bit, og 99.99999998 % av alt annet.",
            },
            {
              term: "Generator-polynom",
              body: "Det faste polynomet G som begge sider er enige om på forhånd. For CRC-r velger man G slik at det har grad r og oppdager flest mulig feilmønstre. CRC-32 sin G er standardisert i Ethernet og ZIP.",
            },
            {
              term: "Burst-feil",
              body: "Når flere bit-feil opptrer i en sammenhengende sekvens (typisk fordi en støy-puls varer noen mikrosekunder). CRC er spesielt god mot dette: en CRC med r bits oppdager garantert alle burst-feil av lengde ≤ r.",
            },
            {
              term: "Even vs odd parity",
              body: "Begge typer paritet gjør samme jobb (oppdager 1-bit-feil). Even (partall) setter paritets-biten slik at totalt antall 1-ere blir et partall. Odd setter den slik at totalen blir oddetall. Sender og mottaker må være enige om hvilken konvensjon som brukes — ellers «oppdager» mottakeren feil i hver eneste ramme.",
            },
            {
              term: "GF(2)-aritmetikk",
              body: "CRC opererer i Galois-feltet GF(2): bits er enten 0 eller 1, addisjon og subtraksjon er BEGGE XOR, multiplikasjon er AND. Det er derfor long-division i CRC er så uvant — det er ingen «lån» eller «mente» som i vanlig divisjon, bare XOR.",
            },
            {
              term: "CRC-32 (IEEE 802.3)",
              body: "Den standardiserte Ethernet-CRC-en. Generator-polynom: 0x04C11DB7 (33 bit total: x^32 + x^26 + x^23 + x^22 + x^16 + x^12 + x^11 + x^10 + x^8 + x^7 + x^5 + x^4 + x^2 + x + 1). Brukt også i ZIP, PNG, Bzip2. Implementeres typisk med en 256-entry lookup-tabell i software, eller med 32 XOR-gates og shift-registre i hardware.",
            },
            {
              term: "Forward Error Correction (FEC) vs Backward Error Correction",
              body: "FEC = mottakeren skal kunne REPARERE feilen uten å spørre på nytt (f.eks. Hamming-koder, Reed-Solomon). BEC = mottakeren oppdager feilen og ber sender om å sende på nytt (f.eks. CRC i Ethernet + TCP-retransmisjon). FEC koster mer båndbredde i ren tilstand; BEC koster mer i feil-tilstand.",
            },
            {
              term: "Hamming-avstand",
              body: "Antall bit-posisjoner to bit-strenger skiller seg på. En kode som har minimum Hamming-avstand d kan oppdage opp til d-1 bit-feil og rette opp til ⌊(d-1)/2⌋. Paritet har Hamming-avstand 2 (oppdager 1, kan ikke rette). 2D-paritet har avstand 4 (kan rette én feil).",
            },
            {
              term: "Hamming(7,4)-kode",
              body: "Kjent FEC-kode: 4 databits + 3 paritetsbits = 7 bit. Hver paritets-bit dekker en bestemt overlappende del av databitene. Mottakeren kan ikke bare oppdage, men også finne presis hvilken bit som er feil. Brukes i ECC-RAM og noen radiosystemer.",
            },
            {
              term: "Adler-32",
              body: "Alternativ til CRC-32, brukt i zlib. Raskere å regne i software (rene addisjoner), men oppdager færre feil — særlig på korte meldinger. Velges når du allerede har sjekksum høyere opp og bare vil ha rask sanity-check på lenken.",
            },
          ]}
        />
        <Illustration caption="CRC: del databitene + tilhørende r nuller på G; resten er CRC-verdien som henges på.">
          <CrcSvg />
        </Illustration>
      </div>

      <Example title="Eksempel: CRC-3 på bit-strengen 1011">
        <p>
          La data D = 1011 (4 bits) og generator G = 1101 (4 bits, grad 3). Vi henger på r=3 nuller
          på D for å få D·2³ = 1011000.
        </p>
        <p className="mt-2">Long-division i GF(2) (XOR i stedet for subtraksjon):</p>
        <pre className="text-[11px] font-mono bg-muted/30 p-2 rounded mt-1 overflow-x-auto">
          {`     1011000  ÷  1101
     1101
     ----
      1100
      1101
      ----
        1000
        1101
        ----
         101   ← rest, dette er CRC`}
        </pre>
        <p className="mt-2">
          Vi sender 1011 <strong>101</strong> (data + CRC). Mottakeren divider hele strengen på 1101
          og forventer rest = 0. Hvis ikke, har en bit flippet.
        </p>
      </Example>

      <Example title="Eksempel: 2D-paritet finner og retter én bit-feil">
        <p>
          Vi har 12 databits arrangert i et 3×4-rektangel. Even paritet legges på hver rad og hver
          kolonne:
        </p>
        <pre className="text-[11px] font-mono bg-muted/30 p-2 rounded mt-1 overflow-x-auto">
          {`             c1 c2 c3 c4 | p_rad
        r1:   1  0  1  0  |  0
        r2:   0  1  1  0  |  0
        r3:   1  1  0  1  |  1
        -----------------+------
        p_kol:0  0  0  1  |  1  ← hjørne`}
        </pre>
        <p className="mt-2">
          Anta at bit (r2, c3) flipper underveis fra 1 til 0. Mottakeren beregner paritet og finner:
          rad 2 har nå paritet 1 (ikke 0 som vi sendte), og kolonne 3 har nå paritet 1 (ikke 0). En
          rad og en kolonne klager — krysset deres er den feile biten. Mottakeren flipper den
          tilbake. <strong>Ingen retransmisjon trengtes.</strong>
        </p>
        <p className="mt-2">
          Hvis to bits flipper, klager 2 rader og 2 kolonner — mottakeren ser at noe er galt, men
          kan ikke bestemme hvilken av de 4 krysspunktene som er ekte. 2D-paritet oppdager altså
          alle 2-bit-feil, men retter bare 1-bit-feil.
        </p>
      </Example>

      <Example title="Eksempel: paritet vs CRC på samme bit-feil-mønster">
        <p>
          Vi sender 8 bits: <code>1100 1010</code>. Vi sammenligner hva henholdsvis even paritet og
          CRC-3 (med G=1011) oppdager.
        </p>
        <p className="mt-2">
          <strong>Even paritet:</strong>
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>
            Antall 1-ere = 4 (partall) → paritets-bit = 0. Sender <code>1100 1010 0</code>.
          </li>
          <li>
            Feilmønster A: bit 3 flipper → <code>1110 1010 0</code>. Mottaker teller 5 ettall +
            paritets-bit 0 = 5 ettall totalt → oddetall → FEIL OPPDAGET.
          </li>
          <li>
            Feilmønster B: bit 3 OG bit 5 flipper → <code>1110 0010 0</code>. Mottaker teller 4
            ettall + 0 = 4 → partall → FEIL IKKE OPPDAGET.
          </li>
        </ul>
        <p className="mt-2">
          <strong>CRC-3 med G=1011:</strong>
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>
            D = 11001010, D·2³ = 11001010000. Long-division: rest = 011. Sender{" "}
            <code>11001010 011</code>.
          </li>
          <li>
            Feilmønster B (bit 3 + bit 5 flippet): mottaker mottar <code>11100010 011</code>. Når
            mottaker deler hele strengen på 1011, blir resten ≠ 0 → FEIL OPPDAGET.
          </li>
        </ul>
        <p className="mt-2">
          CRC fanger 2-bit-feilen som paritet glipper. Det er nettopp dette CRC ble designet for.
        </p>
      </Example>

      <Hvorfor title="Hvorfor er CRC bedre enn paritet, og hvorfor velges den i Ethernet?">
        <p>
          Paritet er enkel og billig (én XOR), men har en åpenbar svakhet: alle feil med partall
          antall flippede bits er usynlige. På en støyende koppertråd, der støy ofte rammer i burst
          (flere mikrosekunder med spennings-spikes som flipper en rekke bits ved siden av
          hverandre), er det nettopp 2-, 4- og 6-bits feil som forekommer.
        </p>
        <p>
          <strong>CRC matematisk matchet til burst-feil.</strong> En CRC med r bits oppdager
          garantert ALLE burst-feil av lengde ≤ r og 1 − 2^(−r) av alle andre. CRC-32 fanger derfor
          alle burst opp til 32 bit og 99.99999998 % av alt annet — i praksis perfekt deteksjon.
        </p>
        <p>
          <strong>Implementasjon i hardware er enkel.</strong> En CRC kan beregnes med ett shift-
          register og noen XOR-gates som tar én bit per klokke. Det betyr at en 100 Gbps NIC kan
          regne CRC i sann tid uten å være flaskehalsen — paritet ville vært like rask, men ville
          glipp så mange feil at TCP-retransmisjon ble dominerende.
        </p>
        <p>
          <strong>Bonus: deterministiske egenskaper.</strong> Vi vet matematisk nøyaktig hvilke
          feilmønstre CRC-32 oppdager (alle 1-, 2- og 3-bit feil, alle bursts ≤ 32). Det gjør CRC
          analyserbar — i motsetning til hash-funksjoner der vi bare har sannsynlighets-utsagn.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-crc-kalkulator"]} />
    </article>
  );
}

// ============================================================
// 6.3 — Multiple access
// ============================================================
function Section63() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="6.3" title="Multiple access — hvem får snakke nå?" />

      <p className="text-muted-foreground">
        Hvis flere noder deler ett medium (én radio-kanal, en gammel koaks-buss), oppstår
        spørsmålet: hva skjer hvis to noder sender samtidig? Signalene blander seg og begge rammer
        ødelegges — en kollisjon. Multiple-access protokoller er reglene som styrer hvem som får
        sende når.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            {
              term: "Channel partitioning",
              body: "Del kanalen i biter og gi hver node en bit: TDM (tidsluker), FDM (frekvensbånd) eller CDM (kode). Garantert kollisjonsfritt, men ineffektivt når bare én node faktisk vil sende — den får fortsatt bare sin lille bit av kanalen.",
            },
            {
              term: "Ren (pure) ALOHA",
              body: "Send når du vil. Hvis to noder sender og rammene overlapper i tid, er begge ødelagt — vent en tilfeldig stund og prøv igjen. Maksimal throughput er bare ca. 18 % av kanalens kapasitet (1/2e). Enkelt, men dårlig.",
            },
            {
              term: "Slot ALOHA",
              body: "Tiden deles i diskrete slots på lengde lik én ramme. Noder må starte å sende ved start av en slot. Dette halverer kollisjons-vinduet, så maks throughput dobles til ca. 37 % (1/e). Krever klokke-synkronisering mellom alle noder.",
            },
            {
              term: "CSMA — Carrier Sense Multiple Access",
              body: "Lytt før du sender. Hvis du hører at noen andre allerede sender, vent. Reduserer (men eliminerer ikke) kollisjoner — du kan fortsatt rote hvis to noder begynner å snakke samtidig fordi de begge så at kanalen var ledig.",
            },
            {
              term: "CSMA/CD — med kollisjons-deteksjon",
              body: "Klassisk Ethernet over koaks. Mens du sender, lytter du etter at du hører din egen ramme komme fram uforstyrret. Hvis du ikke gjør det, har det skjedd en kollisjon — du avbryter umiddelbart, sender en jam-signal, og venter en tilfeldig backoff. Sparer kanal-tid sammenlignet med å fortsette å sende en ødelagt ramme.",
            },
            {
              term: "Exponential backoff",
              body: "Etter n-te kollisjon: velg ventetid uniformt fra {0, 1, ..., 2^n - 1} slots. Dobler vinduet hver gang det går galt, så det selvjusterer til belastningen. Brukes i CSMA/CD og i WiFi (CSMA/CA).",
            },
            {
              term: "Taking-turns: polling",
              body: "En master-node spør hver slave i tur: «har du noe å sende?» Effektivt under høy last, ingen kollisjoner. Sårbar for at masteren går ned. Brukes f.eks. i Bluetooth.",
            },
            {
              term: "Taking-turns: token-ring",
              body: "En liten kontroll-ramme («token») sirkulerer mellom nodene. Bare noden som holder tokenet får sende. Etter ferdig sending sendes tokenet videre. Brukt i gamle IBM-nett (Token Ring) og FDDI. Tapt token = hele nettet stopper opp.",
            },
            {
              term: "Propagation-time (t_prop)",
              body: "Tiden et signal bruker fra én ende av lenken til den andre. På 500 m koaks med utbredelses-hastighet ≈ 2/3 · c blir t_prop ≈ 2,5 μs. CSMA/CD trenger at en ramme er stor nok til at avsender sender i minst 2·t_prop slik at en kollisjon oppdages før hun er ferdig — derav 64-byte minimum-ramme på 10 Mbps Ethernet.",
            },
            {
              term: "Jam-signal",
              body: "En 48-bit støy-sekvens en CSMA/CD-node sender ut etter at hun har oppdaget en kollisjon. Hensikten: forsikre seg om at alle andre noder også registrerer kollisjonen, ikke bare svinger forbi. Etter jam-en starter exponential backoff.",
            },
            {
              term: "Binary Exponential Backoff (BEB)",
              body: "Den konkrete formelen i CSMA/CD: etter n-te kollisjon, velg K uniformt fra {0, 1, ..., 2^min(n,10) − 1} og vent K·512 bit-tider. Maks 16 forsøk — etter det gir noden opp og melder feil til operativsystemet. Cap på n=10 forhindrer at vinduet blir absurd stort.",
            },
            {
              term: "Hidden terminal-problem",
              body: "I trådløse nett kan to noder A og C høre samme aksess-punkt B, men IKKE hverandre. Da feiler carrier sense: A ser at kanalen er ledig (hører ikke C), C ser også at den er ledig — begge sender, B får kollisjon. CSMA/CA i WiFi løser dette med RTS/CTS-håndtrykk.",
            },
            {
              term: "CSMA/CA — Collision Avoidance",
              body: "WiFi-varianten: i stedet for å oppdage en kollisjon (umulig på radio, sender drukner mottak), prøver vi å UNNGÅ den. Mekanismer: random backoff FØR sending (ikke bare etter), RTS/CTS-frames for å reservere mediet, og ACK-rammer per pakke. Mer overhead enn CD, men nødvendig på halv-duplex radio.",
            },
            {
              term: "Capture effect",
              body: "Når to noder kolliderer på radio og den ene har vesentlig sterkere signal, kan mottakeren faktisk klare å demodulere den sterke — den «vinner» kollisjonen mens den svake druknes ut. Skjer ikke i kabel-Ethernet, men forklarer hvorfor WiFi i praksis ofte er bedre enn ren CA-teori tilsier.",
            },
            {
              term: "Slotted offered load (G)",
              body: "Antall ramme-forsøk (nye + retransmisjoner) per ramme-tid. G = 1 betyr at det i snitt kommer ett forsøk per slot. Throughput-funksjonen S(G) = G·e^(-G) har topp ved G=1, der S = 1/e ≈ 0.368. For G > 1 går throughput NED — for mange retransmisjoner spiser opp kanalen (collision collapse).",
            },
          ]}
        />
        <Illustration caption="Pure ALOHA-kollisjon: ramme A overlapper med starten av B. Begge må retransmitteres.">
          <AlohaSvg />
        </Illustration>
      </div>

      <Example title="Eksempel: hvorfor er slot ALOHA 2× bedre enn pure ALOHA?">
        <p>
          I pure ALOHA: en ramme på t sekunder kolliderer med alle rammer som starter i intervallet
          [-t, +t] — totalt et vindu på <strong>2t</strong>. Sannsynligheten for ingen kollisjon ved
          Poisson-trafikk med rate λ er e^(-2λt).
        </p>
        <p className="mt-2">
          I slot ALOHA: rammer kan bare starte ved start av en slot, så vinduet er bare den slottet
          du selv brukte — <strong>t</strong>. Sannsynligheten er e^(-λt).
        </p>
        <p className="mt-2">
          Maks throughput er G·e^(-G) for pure, og G·e^(-G/1) for slot der G er offered load. Toppen
          ligger på 1/(2e) ≈ 0.184 (pure) vs 1/e ≈ 0.368 (slot). Dobbelt så bra — bare ved å
          synkronisere klokkene.
        </p>
      </Example>

      <Example title="Eksempel: CSMA/CD-trace med flere kollisjoner">
        <p>
          To noder A og B vil sende samtidig på 10 Mbps Ethernet (slot-tid = 51,2 μs). Vi følger
          forsøkene deres steg for steg.
        </p>
        <ol className="list-decimal pl-5 mt-1 space-y-1">
          <li>
            <strong>Forsøk 1:</strong> begge ser ledig kanal, begge starter samtidig. KOLLISJON.
            Hver sender 48-bit jam-signal og går til backoff. n=1 → velg K fra {`{0,1}`}. A trekker
            1, B trekker 0.
          </li>
          <li>
            <strong>Backoff:</strong> B venter 0·51,2 μs og sender umiddelbart; A venter 1·51,2 μs.
            B kommer på lufta først.
          </li>
          <li>
            <strong>Forsøk 2 (A):</strong> A lytter, hører B, venter til kanalen er ledig (carrier
            sense). Når B er ferdig, venter A inter-frame gap (9,6 μs) og sender.
          </li>
          <li>
            <strong>Tredje node C dukker opp og kolliderer med A.</strong> n=2 for A → velg K fra
            {`{0,1,2,3}`}. A trekker 3. C trekker også 3. Ny kollisjon på forsøk 3 → n=3, velg K fra
            {`{0..7}`}. Statistisk synkende kollisjons-sannsynlighet idet vinduet vokser.
          </li>
        </ol>
        <p className="mt-2">
          Etter 16 mislykkede forsøk gir noden opp og rapporterer feil oppover. I praksis skjer
          dette aldri på et fungerende nett — det er en sikkerhetsventil mot dødløkker.
        </p>
      </Example>

      <Example title="Eksempel: ALOHA vs slot ALOHA — konkrete tall">
        <p>
          Anta 100 sensorer ute i felt som hver sender en kort melding med rate 0,005 ramme per
          sekund. Vi setter ramme-tid t = 200 ms. Total offered load: G = 100 · 0,005 · 0,2 = 0,1
          forsøk per ramme-tid.
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>Pure ALOHA: S = G·e^(-2G) = 0,1·e^(-0,2) ≈ 0,082 (82 % suksess)</li>
          <li>Slot ALOHA: S = G·e^(-G) = 0,1·e^(-0,1) ≈ 0,091 (91 % suksess)</li>
        </ul>
        <p className="mt-2">
          Forskjellen er liten ved lav last, men vokser raskt. Ved G = 1: pure ALOHA gir 13,5 %,
          slot ALOHA gir 36,8 %. Det er hvor lasten er høy (sjeldne men store hendelser, alle
          sensorer våkner samtidig) at synkronisering virkelig betaler seg. For en
          LoRaWAN-installasjon der batterier teller, må man velge: betaler synkronisering seg i
          strømforbruk?
        </p>
      </Example>

      <Hvorfor title="Hvorfor finnes CSMA/CD nesten ikke i moderne nett?">
        <p>
          På 80- og 90-tallet var Ethernet et delt medium: alle maskiner hang på den samme koaks-
          kabelen, og kollisjons-deteksjon var kjernen i hvordan det fungerte. I dag er det helt
          borte. Hvorfor?
        </p>
        <p>
          <strong>Switcher erstattet hubs.</strong> En switch isolerer hver port til sitt eget
          kollisjons-domene. Hvis kun én maskin er koblet til en port, kan det ikke skje en
          kollisjon fysisk — det er bare avsender og mottaker på lenken. CSMA/CD blir overflødig.
        </p>
        <p>
          <strong>Full-duplex.</strong> Moderne Ethernet over twisted pair eller fiber bruker
          separate ledere for hver retning. Begge sider kan sende og motta samtidig. Carrier sense
          gir ingen mening når du alltid kan sende.
        </p>
        <p>
          <strong>Standardene har strippet det ut.</strong> 10G-Ethernet og raskere finnes IKKE i
          half-duplex-versjoner — kollisjons-protokollen er fjernet fra spesifikasjonen. Lenken må
          være punkt-til-punkt og full-duplex.
        </p>
        <p>
          CSMA/CD lever fortsatt der mediumet faktisk er delt — gamle radioer, satellitt-uplinks. Og
          ideen om backoff overlever i CSMA/CA i WiFi. Men på en moderne Ethernet-port: dødt.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-aloha-kasino"]} />
    </article>
  );
}

// ============================================================
// 6.4 — Switched LAN
// ============================================================
function Section64() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="6.4" title="Switched LAN — ARP og self-learning" />

      <p className="text-muted-foreground">
        Et moderne lokalnett er ikke et delt medium lenger. Hver host kobles til én port på en
        switch, og switchen sender hver ramme bare til riktig port. To ting må fungere: (1) hvordan
        finne MAC-adressen til en host gitt dens IP, og (2) hvordan vet switchen hvilken port en
        gitt MAC-adresse sitter på?
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            {
              term: "ARP (Address Resolution Protocol)",
              body: "Spørringen «hvem har IP 10.0.0.42?» Sendes som en broadcast på link-laget. Den som har den IP-en svarer med sin MAC. Svaret caches lokalt en stund (typisk 20 minutter) for å unngå å spørre om og om igjen.",
            },
            {
              term: "ARP-cache",
              body: "Tabell på hver host som mapper IP → MAC. Du ser den lokalt med 'ip neigh' (Linux) eller 'arp -a' (mac/Windows). Tomme oppføringer = neste pakke til den IP-en utløser et nytt ARP-spørsmål.",
            },
            {
              term: "MAC-broadcast",
              body: "Ramme med destinasjons-MAC FF:FF:FF:FF:FF:FF — alle på samme link-lag-domene mottar den. ARP-spørringer bruker denne. Begrenset til ett LAN/VLAN; en ruter sender ikke broadcast videre.",
            },
            {
              term: "IP-broadcast",
              body: "Et IP-datagram med destinasjon 255.255.255.255 (lokal broadcast) eller subnet-broadcast (f.eks. 10.0.0.255). Pakkes inn i en MAC-broadcast for å bli levert til alle på subnettet. Brukes lite på moderne nett — multicast er bedre.",
            },
            {
              term: "Switch forwarding-tabell",
              body: "Tabell i switchen som mapper MAC-adresse → port. Hver oppføring har også en tidsstempel slik at gamle entries kan utløpe (typisk 5–15 min). Tabellen er det som gjør at en switch leverer rammen bare til riktig port.",
            },
            {
              term: "Self-learning",
              body: "Switchen begynner med tom tabell. Når en ramme kommer inn på port p med kilde-MAC X, skriver switchen ned (X, p). Når en ramme skal til en MAC switchen IKKE kjenner, sender den flooding — kopierer rammen ut alle porter unntatt den den kom inn på. Etter litt trafikk lærer switchen seg topologien selv.",
            },
            {
              term: "Plug-and-play",
              body: "Konsekvensen av self-learning: en switch trenger ingen konfigurasjon. Plugg den i, koble på maskiner, og den fungerer. En del av grunnen til at Ethernet vant over alternativer som krevde manuell konfigurasjon.",
            },
            {
              term: "Gratuitous ARP",
              body: "En ARP-melding der avsender spør etter sin EGEN IP (eller broadcaster «jeg er 10.0.0.5 på MAC XX»). Brukes når en host får ny IP (DHCP-lease) for å rydde gamle ARP-cache-entries på andre hoster, og for å oppdage IP-konflikter (to maskiner som tror de eier samme IP).",
            },
            {
              term: "ARP-spoofing / ARP-poisoning",
              body: "Et angrep der en ondsinnet node svarer på ARP-spørringer med sin egen MAC i stedet for den ekte mottakerens. Andre hoster cacher (offer-IP → angriper-MAC) og sender all trafikk gjennom angriperen. Sikkerhets-switcher har Dynamic ARP Inspection (DAI) for å blokkere falske ARP-svar.",
            },
            {
              term: "Flooding",
              body: "Når switchen mottar en ramme med ukjent destinasjons-MAC (ikke i tabellen), kopierer den rammen ut på ALLE porter unntatt den den kom inn på. Også broadcast-rammer (dst = FF:FF:FF:FF:FF:FF) flødes. Etter at destinasjonen svarer, lærer switchen porten og slutter å flood.",
            },
            {
              term: "MAC-table aging",
              body: "Hver entry i switchens forwarding-tabell har en timer (typisk 300 sekunder). Hvis switchen ikke ser noen rammer fra MAC X på et tidsrom, fjernes entry-en. Neste pakke til X utløser ny flooding. Hindrer at gamle entries hoper seg opp etter at maskiner frakobles.",
            },
            {
              term: "Spanning Tree Protocol (STP / 802.1D)",
              body: "Hvis switcher er koblet i en loop (med vilje eller ved en feil), vil broadcast-rammer sirkulere uendelig — en broadcast-storm som lammer hele LAN. STP løser dette ved at switcher snakker sammen via BPDU-rammer, velger en root-switch, og slår av portene som ikke er på korteste sti til root. Resultat: et logisk tre uten loops, selv om fysisk topologi har sløyfer.",
            },
            {
              term: "BPDU (Bridge Protocol Data Unit)",
              body: "Kontroll-rammer STP bruker for å snakke sammen. Inneholder switchens ID, root-switchens ID, og kostnad til root. Sendes hvert annet sekund. Når topologien endres (kabel går ned), velger STP nye stier — konvergerer på ~30 sekunder klassisk, ~1 sekund med Rapid STP.",
            },
            {
              term: "VRRP / HSRP",
              body: "Standby-protokoller for ruteren i et LAN. To rutere er konfigurert med samme virtuelle MAC og IP; én er aktiv, en er backup. Hvis aktive ruteren dør, tar backupen over uten at hostene merker det — de ARP-er fortsatt mot den samme virtuelle MAC-en.",
            },
          ]}
        />
        <Illustration caption="Switch self-learning: ramme fra MAC X på port 1 lærer switchen at X sitter på port 1.">
          <SwitchLearningSvg />
        </Illustration>
      </div>

      <Example title="Eksempel: ARP-spørring fra mobilen din">
        <p>
          Mobilen din (IP 10.0.0.5, MAC AA:01) skal sende til skriveren (IP 10.0.0.10). Mobilens
          ARP-cache er tom for 10.0.0.10. Da skjer dette:
        </p>
        <ol className="list-decimal pl-5 mt-1 space-y-1">
          <li>
            Mobilen lager en ARP-request: «hvem har 10.0.0.10? si til AA:01». Den sendes som en
            MAC-broadcast (FF:FF:FF:FF:FF:FF).
          </li>
          <li>
            Alle på samme link-domene mottar den. Bare skriveren ser at det er hennes IP og lager et
            ARP-reply: «10.0.0.10 er på BB:02». Sendt unicast tilbake til AA:01.
          </li>
          <li>
            Mobilen får svaret, lagrer (10.0.0.10 → BB:02) i ARP-cachen i 20 minutter, og kan nå
            sende selve datapakken.
          </li>
        </ol>
      </Example>

      <Example title="Eksempel: trace switch-tabell etter 5 rammer">
        <p>
          Switch S har 4 porter og en tom forwarding-tabell. Følgende rammer ankommer i rekkefølge:
        </p>
        <ol className="list-decimal pl-5 mt-1 space-y-1">
          <li>Ramme fra X til Y på port 1.</li>
          <li>Ramme fra Y til X på port 2.</li>
          <li>Ramme fra Z til X på port 3.</li>
          <li>Ramme fra X til Z på port 1.</li>
          <li>Broadcast fra W på port 4.</li>
        </ol>
        <p className="mt-2">
          <strong>Tabell etter hver ramme:</strong>
        </p>
        <pre className="text-[11px] font-mono bg-muted/30 p-2 rounded mt-1 overflow-x-auto">
          {`Etter 1: {X→1}                        flood (Y ukjent)
Etter 2: {X→1, Y→2}                    unicast ut port 1 (X kjent)
Etter 3: {X→1, Y→2, Z→3}                unicast ut port 1 (X kjent)
Etter 4: {X→1, Y→2, Z→3}                unicast ut port 3 (Z kjent)
Etter 5: {X→1, Y→2, Z→3, W→4}           flood (broadcast)`}
        </pre>
        <p className="mt-2">
          Bare ramme 1 og ramme 5 forårsaker flooding. Etter den første tur-retur-runden mellom et
          par maskiner er switchen i full unicast-mode for det paret.
        </p>
      </Example>

      <Example title="Eksempel: broadcast-storm uten Spanning Tree">
        <p>
          Vi har tre switcher S1, S2, S3 koblet i en trekant (loop). Host H på S1 sender en
          broadcast-ramme:
        </p>
        <ol className="list-decimal pl-5 mt-1 space-y-1">
          <li>S1 flooder ut til S2 og S3.</li>
          <li>S2 flooder mottatte broadcast ut til S3 (og hostene sine). S3 mottar.</li>
          <li>S3 flooder også broadcast videre til S2. S2 mottar (igjen!).</li>
          <li>S2 og S3 fortsetter å skubbe rammen rundt i ringen — uendelig.</li>
        </ol>
        <p className="mt-2">
          I løpet av millisekunder fyller en eneste broadcast-ramme hele LAN-et med duplikater.
          Switchenes CPU-er går i 100 %, ingenting kommer fram. Dette er en broadcast-storm —
          klassisk failure-mode før STP. STP løser det ved å slå AV én port i ringen slik at
          topologien blir et tre.
        </p>
      </Example>

      <Hvorfor title="Hvorfor erstattet switcher hubs?">
        <p>
          Hub-en var enkel: en passiv enhet som sendte hver bit den så på inn-porten ut alle andre
          porter. Alle portene var ett kollisjons-domene — hvis to maskiner sendte samtidig, fikk
          alle se kollisjonen og CSMA/CD-protokollen tråtte i kraft. Hvorfor forsvant den?
        </p>
        <p>
          <strong>Skalering.</strong> På en hub med 24 porter måtte alle 24 maskiner dele samme 10
          Mbps. Med 6-7 aktive maskiner ble kollisjons-andelen så høy at hver enkelt fikk under 1
          Mbps reelt. En switch isolerer hver port — hver maskin får full hastighet uavhengig av
          naboen.
        </p>
        <p>
          <strong>Sikkerhet.</strong> På en hub kan en hvilken som helst maskin se ALL trafikk (sett
          NIC i promiscuous mode → tcpdump). På en switch ser hver maskin bare det som er adressert
          til den (pluss broadcast). Det er ikke en kryptografisk garanti, men det hever terskelen
          betraktelig.
        </p>
        <p>
          <strong>Full-duplex.</strong> En hub er fundamentalt half-duplex (alle deler ett medium).
          En switch lar hver port være full-duplex — 100 Mbps inn OG 100 Mbps ut samtidig. 2x
          throughput uten endring i kabel.
        </p>
        <p>
          <strong>Pris.</strong> På 2000-tallet ble switch-silisium nesten gratis. Et grunnleggende
          unmanaged 8-port-switch koster mindre enn en hub gjorde i 1995. Ingen grunn til ikke å
          oppgradere.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-arp-detektiv", "dte2507-switch-self-learning"]} />
    </article>
  );
}

// ============================================================
// 6.5 — Ethernet
// ============================================================
function Section65() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="6.5" title="Ethernet — link-lagets seierherre" />

      <p className="text-muted-foreground">
        Ethernet ble oppfunnet på Xerox PARC i 1973, standardisert i 1980, og har overlevd alle sine
        konkurrenter (Token Ring, FDDI, ATM-til-skrivebordet). Selve ramme-formatet er nesten
        uendret siden 1980; det er bare den fysiske layeren under som har gått fra 10 Mbps over
        koaks til 400 Gbps over fiber.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            {
              term: "Preamble",
              body: "7 bytes med vekslende 1 og 0, etterfulgt av 1 byte med 10101011. Lar mottakerens klokke synkronisere seg med sender-klokken før den faktiske rammen starter. Ikke regnet som en del av rammen i offisiell forstand.",
            },
            {
              term: "Destinasjons- og kilde-MAC",
              body: "6 bytes hver. Destinasjons-MAC kan være unicast (én mottaker), multicast (en gruppe) eller broadcast (alle).",
            },
            {
              term: "EtherType / lengde-felt",
              body: "2 bytes. Hvis verdien er ≥ 1536 (0x0600), tolkes det som EtherType — hvilken protokoll er over: 0x0800 = IPv4, 0x86DD = IPv6, 0x0806 = ARP. Hvis < 1500, er det rammens lengde (gammel IEEE 802.3-variant). Smart for bakover-kompatibilitet.",
            },
            {
              term: "Payload",
              body: "46 til 1500 bytes. Minimum 46 fordi CSMA/CD krever at en ramme er stor nok til at sender kan detektere en kollisjon før hun er ferdig — i en 10 Mbps koaks-buss på maks 500 m er det 64 bytes (med header).",
            },
            {
              term: "CRC (FCS — Frame Check Sequence)",
              body: "4 bytes CRC-32 over destinasjons-MAC, kilde-MAC, type, payload. Beregnes og sjekkes i hardware på NIC-en. Rammer med dårlig CRC kastes uten varsel.",
            },
            {
              term: "Hub",
              body: "Historisk: en passiv enhet som forsterket signalet og sendte enhver bit som kom inn ut alle andre porter. Hele hubben var ett kollisjons-domene — CSMA/CD måtte være på. Forsvant på 2000-tallet til fordel for switch.",
            },
            {
              term: "Switch",
              body: "Aktiv enhet som mottar hele rammer, sjekker CRC, slår opp destinasjons-MAC i forwarding-tabellen, og sender bare ut på riktig port. Hver port er sitt eget kollisjons-domene; full duplex; ingen behov for CSMA/CD i moderne switch-nett.",
            },
            {
              term: "Switch-hierarki",
              body: "Større nett bygges av flere switcher koblet sammen. Aksess-switcher som hostene plugges i, distribusjons-switcher som samler aksess-switcher, og en core-switch i toppen. Forwarding-tabeller læres på tvers; Spanning Tree Protocol forhindrer at en loop i topologien forårsaker uendelig flooding.",
            },
            {
              term: "SFD (Start-of-Frame Delimiter)",
              body: "Den siste byten av preamble: 10101011 (0xAB). De seks første 1010-parene gir mottakeren tid til å lage seg fast i klokken; den ekstra 11-en signaliserer at den faktiske rammen starter med neste byte. Skiller seg fra resten av preamble nettopp for at det skal være entydig.",
            },
            {
              term: "Inter-Frame Gap (IFG)",
              body: "Minst 96 bit-tider stillhet mellom to rammer på samme medium. På 10 Mbps = 9,6 μs; på 100 Mbps = 0,96 μs; på 10 Gbps = 9,6 ns. Gir mottakeren tid til å re-synkronisere klokken og prosessere forrige ramme før den neste kommer.",
            },
            {
              term: "Jumbo frames",
              body: "Ethernet-rammer større enn standard 1500 bytes payload — typisk 9000 bytes. Brukes i datasentre der host og switch begge støtter det. Reduserer overhead: 9000-byte payload vs 26 byte header = 0,3 % overhead vs 1,7 % for vanlig MTU. Krever at HELE stien (alle switcher) er konfigurert likt — én switch som ikke kan jumbo dropper rammen.",
            },
            {
              term: "Auto-negotiation",
              body: "Når en kabel plugges inn, sender begge sider av lenken en sekvens av puls-koder (FLP — Fast Link Pulses) som forteller hva de støtter (hastighet, half/full duplex). Begge velger det høyeste begge støtter. Hvis auto-negotiering feiler (sjelden, ofte pga. ulik konfigurasjon), faller man tilbake til 10 Mbps half-duplex.",
            },
            {
              term: "PoE (Power over Ethernet)",
              body: "Standardiserte måter å sende strøm sammen med data på samme Ethernet-kabel. PoE (802.3af) gir 15 W per port, PoE+ (802.3at) 30 W, PoE++ (802.3bt) opp til 90 W. Brukes til WiFi-AP-er, IP-telefoner, sikkerhetskameraer — null ekstra strømkabel.",
            },
            {
              term: "MAC-tabellen som CAM",
              body: "Switchens forwarding-tabell implementeres typisk som en CAM (Content-Addressable Memory) — et hardware-minne der oppslag på MAC-adresse skjer parallelt over alle entries i én klokkesyklus. Det er hvordan en switch klarer å route en pakke på under en mikrosekund, selv med titusenvis av entries.",
            },
            {
              term: "Manchester-koding",
              body: "Det fysiske kodings-skjemaet i klassisk 10 Mbps Ethernet: hver bit kodes som en overgang i midten av sin tids-luke (1 = lav-til-høy, 0 = høy-til-lav). Sikrer mange overganger så mottakerens klokke holder seg synkronisert. 100 Mbps Ethernet bruker 4B/5B-koding pluss MLT-3 i stedet; 1 Gbps bruker 8B/10B.",
            },
          ]}
        />
        <Illustration caption="Ethernet-ramme: preamble · dst · src · type · payload · CRC. Alle felt har faste posisjoner.">
          <EthernetFrameSvg />
        </Illustration>
      </div>

      <Example title="Eksempel: hva inneholder et 1500-byte Ethernet-ramme egentlig?">
        <ul className="list-disc pl-5">
          <li>8 bytes preamble (synkronisering)</li>
          <li>6 bytes destinasjons-MAC</li>
          <li>6 bytes kilde-MAC</li>
          <li>2 bytes EtherType (typisk 0x0800)</li>
          <li>1500 bytes payload (et IP-datagram)</li>
          <li>4 bytes CRC-32</li>
        </ul>
        <p className="mt-2">
          Totalt 1526 bytes på kabelen for å levere 1500 bytes nyttig last. Overhead = 26/1526 ≈ 1.7
          %. Pluss 12 bytes inter-frame gap mellom hver ramme. Ethernet er overraskende effektivt.
        </p>
      </Example>

      <Example title="Eksempel: minimum-ramme på 10 Mbps vs 1 Gbps Ethernet">
        <p>
          Minimum-rammen på 64 bytes ble valgt slik at en avsender på 10 Mbps over 500 m koaks
          alltid ville rekke å oppdage en kollisjon før hun var ferdig. Beregningen:
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>Round-trip-tid over 500 m: 2 · 2,5 μs ≈ 5 μs</li>
          <li>+ repeater-forsinkelse i begge ender ≈ 51,2 μs total slot-tid</li>
          <li>51,2 μs · 10 Mbps = 512 bit = 64 bytes</li>
        </ul>
        <p className="mt-2">
          På 1 Gbps blir 64 bytes overført på 0,5 μs — alt for kort til kollisjons-deteksjon over
          rimelige avstander. Løsning: «carrier extension», der korte rammer padses opp til 512
          bytes med spesielle pad-symboler. I praksis brukes 1 Gbps nesten alltid full-duplex
          (switched), så hele problemet er irrelevant. Det er en historisk artefakt som vi fortsatt
          bærer med oss i standarden.
        </p>
      </Example>

      <Example title="Eksempel: spore en Ethernet-ramme med Wireshark">
        <p>Vi tar Wireshark-output for en HTTP-pakke. Ethernet-laget viser:</p>
        <pre className="text-[11px] font-mono bg-muted/30 p-2 rounded mt-1 overflow-x-auto">
          {`Frame 42: 74 bytes on wire
Ethernet II, Src: Apple_4a:12:99 (a4:83:e7:4a:12:99)
              Dst: Cisco_1b:c0:de (3c:08:f6:1b:c0:de)
    Type: IPv4 (0x0800)
    [stream index: 14]
Internet Protocol Version 4, Src: 10.0.0.42, Dst: 142.250.74.46`}
        </pre>
        <p className="mt-2">
          Bemerk: <strong>destinasjons-MAC = ruterens MAC</strong> (Cisco), ikke server-en på
          142.250.74.46. På link-laget snakker du alltid bare med den NESTE noden — ruteren bytter
          ut MAC-headeren før den sender pakken videre på neste lenke. Wireshark viser <em>ikke</em>
          preamble eller CRC fordi NIC-en strippet de før OS-en så pakken.
        </p>
      </Example>

      <Hvorfor title="Hvorfor overlevde Ethernet, mens Token Ring og ATM forsvant?">
        <p>
          På 80- og 90-tallet var det flere alternativer til Ethernet, mange teknisk bedre på papir:
          Token Ring hadde determinisme, FDDI hadde fiber og høyere hastighet, ATM hadde QoS for
          stemme og video. Likevel vant Ethernet alle markeder. Hvorfor?
        </p>
        <p>
          <strong>Enkelhet og pris.</strong> En Ethernet-NIC var billigere å produsere enn en Token
          Ring-NIC fra start. Ingen aktiv master, ingen token-håndtering, ingen kompleks
          tilkoblings-protokoll. Volum-fordelen ble selvforsterkende: høyere volum → lavere pris →
          mer adopsjon → mer volum.
        </p>
        <p>
          <strong>Backward compatibility i ramme-formatet.</strong> Ethernet-rammen fra 1980 ser
          essensielt lik ut i 2026. Hvert hastighets-hopp (10 → 100 → 1G → 10G → 40G → 100G → 400G)
          har beholdt samme MAC-format og samme MTU. En 2026-applikasjon kan snakke med en 1995-
          server uten oversetting.
        </p>
        <p>
          <strong>Switcher løste kollisjons-problemet.</strong> Den klassiske kritikken mot Ethernet
          var «ikke-deterministisk pga. kollisjoner». Når switcher gjorde at det aldri mer ble
          kollisjoner, falt den kritikken bort. Token Rings determinisme-fordel var plutselig
          irrelevant.
        </p>
        <p>
          <strong>IP elsker Ethernet.</strong> ATM forsøkte å være det universelle laget under IP,
          men cell-formatet (53 bytes) passet dårlig for IP-datagrammer (typisk 500-1500). Ethernet
          har akkurat samme MTU som IPv4 typisk vil ha — null friksjon.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-day-in-the-life", "dte2507-switch-self-learning"]} />
    </article>
  );
}

// ============================================================
// 6.6 — VLAN
// ============================================================
function Section66() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="6.6" title="VLAN — én switch, mange logiske nett" />

      <p className="text-muted-foreground">
        En klassisk switch deler verden i ett stort broadcast-domene per fysisk switch (egentlig per
        koblet maskinkube). Det skalerer dårlig — en stor bedrift vil ikke at HR-avdelingen og
        gjeste-WiFi-en skal være på samme nett. VLAN løser dette ved å la én fysisk switch oppføre
        seg som flere logiske switcher samtidig.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            {
              term: "VLAN (Virtual LAN)",
              body: "En logisk gruppe av switch-porter som oppfører seg som et eget broadcast-domene. To porter på samme VLAN snakker fritt sammen; porter på ulike VLAN trenger en ruter mellom seg, akkurat som om de var fysisk adskilte switcher.",
            },
            {
              term: "Port-basert VLAN",
              body: "Den vanligste typen: hver switch-port konfigureres til å høre til ett (eller flere) VLAN. Konfigurert manuelt eller via DHCP-snooping. Enkel og forutsigbar.",
            },
            {
              term: "802.1Q tagging",
              body: "Når en ramme krysser mellom to switcher via en delt lenke (trunk), legges en 4-byte tag inn rett etter kilde-MAC. Tag-en inneholder VLAN-ID (12 bits — opp til 4094 VLANer), prioritet og en TPID som identifiserer at dette er en tagget ramme.",
            },
            {
              term: "Trunk-link",
              body: "Lenke mellom to switcher som bærer rammer fra flere VLANer samtidig. Rammene tagges på vei ut og fjernes tagg på vei inn der hostene bor. En typisk nedlink fra distribusjons- til aksess-switch er en trunk; en lenke til en bruker-PC er en access-link uten tagging.",
            },
            {
              term: "Native VLAN",
              body: "Det ene VLAN-et som SKAL ha tagg fjernet (utagget) over en trunk. Ofte VLAN 1 by default. Hvis begge sider av en trunk er enige om native, kan en ramme uten tagg fortsatt rutes korrekt.",
            },
            {
              term: "Inter-VLAN routing",
              body: "Pakkene på VLAN 10 må gjennom en ruter (eller layer-3 switch) for å komme til VLAN 20. Rutere har ett ben i hvert VLAN, eller en «router on a stick»-konfigurasjon der én fysisk lenke bærer alle VLANer som trunk og ruteren bruker virtuelle sub-interfaces.",
            },
            {
              term: "Brannmur per VLAN",
              body: "Praktisk gevinst: HR-avdelingens VLAN kan beskyttes av en regel som blokkerer all trafikk fra gjeste-VLAN. Siden trafikken må gjennom en ruter for å krysse VLAN-grensen, er det et naturlig sted å sette filteret.",
            },
            {
              term: "VLAN-hopping (sikkerhetsproblem)",
              body: "Angrep der en host på VLAN 20 prøver å snakke som om hun var på VLAN 10. To varianter: switch-spoofing (host later som hun er en switch og forhandler en trunk), og double-tagging (host sender ramme med to 802.1Q-tagger; ytterste fjernes av access-port, indre tolkes som ekte VLAN av neste switch). Forhindres ved å aldri bruke native VLAN for hosts og aldri gjøre VLAN 1 til native.",
            },
            {
              term: "Private VLAN (PVLAN)",
              body: "Forfining av VLAN-konseptet for sikkerhet: én primary VLAN inneholder community-porter og isolated porter. Isolated porter kan KUN snakke med ruteren — ikke engang andre porter i samme VLAN. Brukes i hoteller der hver gjest skal ha internett, men ikke kunne snakke med naboværelset.",
            },
            {
              term: "Voice VLAN",
              body: "En IP-telefon kobles inn i samme port som en PC. Switchen identifiserer telefonen via CDP/LLDP og putter den i et eget voice-VLAN med QoS-prioritet, mens PC-en havner i data-VLAN. Telefonen videresender PC-ens trafikk inn på riktig VLAN-tag via en intern mini-switch. Én kabel, to logiske nett.",
            },
            {
              term: "VTP (VLAN Trunking Protocol)",
              body: "Ciscos protokoll for å distribuere VLAN-konfigurasjon mellom switcher i samme domene. Endre VLAN-liste på én switch — VTP propagerer endringen automatisk. Berømt for å forårsake katastrofer når en gammel switch med høyere revision-number plugges inn og overskriver hele domenets VLAN-database.",
            },
            {
              term: "QinQ (802.1ad / Provider Bridges)",
              body: "Når en ISP vil tilby «en VLAN-trunk» som tjeneste til en kunde, men kunden allerede har 802.1Q-tags i sine egne rammer: ISP-en legger på sin EGEN ytre tag (S-tag) over kundens C-tag. Dobbelt-tagging gjør at ISP-en kan ha mange kunder uten å kollidere med deres VLAN-IDer.",
            },
            {
              term: "MAC-basert VLAN",
              body: "Alternativ til port-basert: en switch holder en tabell {MAC → VLAN-ID} og putter rammer i riktig VLAN basert på kilde-MAC. Maskinen får samme VLAN selv om den flytter mellom porter. Vanlig i WiFi-controller-konfigurasjoner.",
            },
          ]}
        />
        <Illustration caption="Én fysisk switch deles i to VLANer. Trunk-lenken bærer tagget trafikk fra begge.">
          <VlanSvg />
        </Illustration>
      </div>

      <Example title="Eksempel: 802.1Q-tag detaljert">
        <p>
          Tag-en er 4 bytes (32 bit) og legges mellom kilde-MAC og EtherType i den opprinnelige
          rammen:
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>TPID (16 bit) = 0x8100 — sier «dette er en VLAN-tag»</li>
          <li>Prioritet (3 bit) — for QoS, verdi 0–7</li>
          <li>DEI (1 bit) — drop-eligible indicator</li>
          <li>VLAN-ID (12 bit) — 0–4095 (0 og 4095 reservert)</li>
        </ul>
        <p className="mt-2">
          For HR-VLAN 10: tag-en blir 0x8100 0x000A. Switchen ser den, kjenner igjen at rammen hører
          til VLAN 10, og videresender bare til andre porter som er medlem av VLAN 10. Andre porter
          ser aldri rammen.
        </p>
      </Example>

      <Example title="Eksempel: router-on-a-stick for inter-VLAN routing">
        <p>
          En liten bedrift har én ruter og én switch. Switchen er konfigurert med tre VLANer (10,
          20, 30). Ruteren har bare ett fysisk Ethernet-interface ledig. Hvordan får ruteren tilgang
          til alle tre VLANer?
        </p>
        <ol className="list-decimal pl-5 mt-1 space-y-1">
          <li>
            Switch-porten mot ruteren konfigureres som en TRUNK som transporterer VLAN 10, 20 og 30
            (tagget).
          </li>
          <li>
            Ruterens ene fysiske port deles inn i tre virtuelle sub-interfaces:
            <code className="ml-1">eth0.10</code>, <code>eth0.20</code>, <code>eth0.30</code>.
          </li>
          <li>
            Hver sub-interface får sin egen IP (f.eks. 10.0.10.1/24, 10.0.20.1/24, 10.0.30.1/24) og
            blir default gateway for sitt VLAN.
          </li>
          <li>
            Når en pakke skal fra VLAN 10 til VLAN 20: host sender til sub-interface 10, ruteren
            slår opp i routing-tabellen, sender via sub-interface 20. Switchen får rammen tagget med
            VLAN 20 og leverer den til riktig host.
          </li>
        </ol>
        <p className="mt-2">
          Trafikken mellom VLAN 10 og 20 går altså opp til ruteren og tilbake igjen via samme
          fysiske lenke — derav navnet «router on a stick». Modent design var det 90-talls; i dag
          har du som regel en layer-3-switch som gjør ruting og switching i samme boks (uten
          utveiingen).
        </p>
      </Example>

      <Example title="Eksempel: VLAN-hopping via double-tagging">
        <p>
          Angriperen sitter på VLAN 20 (data-nett) og vil snakke med servere på VLAN 10 (HR), uten å
          gå via ruteren der brannmuren sitter.
        </p>
        <ol className="list-decimal pl-5 mt-1 space-y-1">
          <li>
            Angriperen lager en ramme med TO 802.1Q-tags: ytre = 20 (native VLAN), indre = 10.
          </li>
          <li>
            Switch S1 mottar rammen på access-porten. Den fjerner det ytre tagget (siden 20 er
            native) — men ser ikke at det fortsatt er et indre tagg.
          </li>
          <li>
            S1 sender rammen videre på trunk til S2. Trunk-rammen har nå BARE indre tagget (VLAN
            10).
          </li>
          <li>
            S2 mottar trunk-rammen, ser VLAN-ID 10, og leverer den til en HR-port. Brannmur ble
            aldri konsultert.
          </li>
        </ol>
        <p className="mt-2">
          Forsvar: aldri bruk VLAN 20 (eller noe VLAN med hosts) som native på en trunk. La native
          VLAN være et tomt VLAN som ingen host kjenner til. Da feiler trikset på steg 2 — switchen
          oppdager at det er en uventet VLAN-tag og kaster rammen.
        </p>
      </Example>

      <Hvorfor title="Hvorfor ble VLAN nødvendig?">
        <p>
          På 90-tallet hadde en bedrift typisk én fysisk switch per fysisk avdeling. HR i tredje
          etasje hadde sin egen switch, IT i kjelleren sin egen, gjester ble plugget i en hub i
          resepsjonen. Hver switch var ett broadcast-domene; det fungerte fordi bygningen var
          underdelt fysisk.
        </p>
        <p>
          <strong>Ombyggings-problemet.</strong> Når HR flytter til andre etasje, må man dra nye
          kabler eller flytte en switch. Et nytt prosjektteam med folk fra flere avdelinger? Enten
          fysisk segregering (dyrt) eller dele broadcast-domene med tilfeldige andre (sikkerhets-
          risiko).
        </p>
        <p>
          <strong>Skalering av broadcast.</strong> Hver maskin sender ARP, DHCP, mDNS osv. som
          broadcasts. Et stort flatt LAN med 5000 maskiner ble overfylt av broadcasts — for hver
          ramme måtte hver maskin se på den, kjenne at den ikke var for henne, og kaste den. Mange
          små broadcast-domener (ett per VLAN) løser dette.
        </p>
        <p>
          <strong>Sikkerhet og compliance.</strong> Regulatorisk krav (PCI-DSS, GDPR for spesielle
          data) krever at visse systemer er logisk isolert. VLAN gir denne isolasjonen uten å måtte
          investere i fysisk segregert infrastruktur. Brannmuren mellom VLAN ankommer naturlig på
          ruteren.
        </p>
        <p>
          <strong>WiFi.</strong> Gjeste-WiFi og bedrifts-WiFi sender begge over samme aksess-punkt
          fysisk, men putter rammene i ulike VLAN. Hver SSID mapper til sin VLAN-ID; brannmuren
          mellom ankommer på neste hopp.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-brannmur-vlan"]} />
    </article>
  );
}

// ============================================================
// 6.7 — Datasenter-nettverk
// ============================================================
function Section67() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="6.7" title="Datasenter-nettverk — fat-tree og leaf-spine" />

      <p className="text-muted-foreground">
        Et moderne datasenter har titusenvis av servere som snakker konstant sammen — distribuerte
        databaser, MapReduce-jobber, mikrotjenester. Det klassiske tre-hierarkiet (aksess →
        distribusjon → core) skalerer dårlig fordi alt skal opp og ned gjennom et trangt nakke-ledd.
        Moderne datasentre bruker bredere topologier som gir mange parallelle stier.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            {
              term: "Top-of-Rack (ToR) switch",
              body: "Switchen som sitter på toppen av hvert rack og kobler alle ~40 serverne i racket. Vanligvis 48 server-porter pluss 4–8 uplinks. Aksess-laget i et datasenter.",
            },
            {
              term: "Klassisk tre-topologi",
              body: "ToR-switcher kobler til distribusjons-switcher som kobler til en kjerne-switch. Enkelt mentalt, men flaskehals: hvis to servere i samme rack snakker med to servere i et annet rack må trafikken gjennom kjerne-switchen som har begrenset båndbredde.",
            },
            {
              term: "Fat-tree",
              body: "En tre-topologi der lenkene blir tykkere jo høyere opp du går — antall lenker fra et nivå til neste opprettholder full bisection bandwidth. Foreslått av Charles Leiserson på 80-tallet, brukt i superdatamaskiner, gjenoppdaget for datasentre på 2000-tallet.",
            },
            {
              term: "Leaf-spine",
              body: "En to-lags variant: leaf-switcher (samme rolle som ToR) kobler hver til ALLE spine-switcher. Alle leaf-til-leaf har nøyaktig samme hopp-tall: leaf → spine → leaf = 2 hopp. Lett å skalere: vil du ha mer båndbredde, legg til en spine. Vil du ha flere servere, legg til en leaf.",
            },
            {
              term: "ECMP — Equal-Cost Multi-Path",
              body: "Når det finnes flere like raske stier mellom A og B (i fat-tree/leaf-spine vrimler det av sånt), kan ruteren hash-fordele flows mellom stiene. Hver flow holder seg på én sti (for å unngå out-of-order), men ulike flows velges ut på ulike stier — utnytter all kapasitet.",
            },
            {
              term: "Bisection bandwidth",
              body: "Hvis du deler nettverket i to halvdeler med like mange noder hver, hvor mye trafikk får du gjennom snittet? Et bredt fat-tree har bisection bandwidth lik N · (per-server-rate) — dvs. alle kan snakke med en motpart samtidig på full rate. Et klassisk tre har mye mindre.",
            },
            {
              term: "Oversubscription",
              body: "Forholdet mellom samlet ned-båndbredde (mot servere) og opp-båndbredde (mot core). 1:1 = full bisection, ingen flaskehals. 4:1 = aksess-laget kan generere 4× mer trafikk enn uplinks bærer — bra nok hvis trafikken stort sett er lokal. Datasentre med massiv øst-vest-trafikk vil ha 1:1.",
            },
            {
              term: "3-tier vs 2-tier topologi",
              body: "Klassisk 3-tier: aksess (ToR) → distribusjons-switcher (aggregeringslag) → core. Hver pakke som krysser racker går 3 hopp opp og 3 hopp ned = 6 hopp totalt. 2-tier (leaf-spine): leaf-switcher kobler direkte til spine-switcher. Hver kryss-rack-pakke går 2 hopp. Færre hopp = lavere latency og enklere kabling, og er nå standarden.",
            },
            {
              term: "Øst-vest- vs nord-sør-trafikk",
              body: "Nord-sør = trafikk mellom datasenteret og omverdenen (brukere på internett). Øst-vest = trafikk mellom servere INNE i datasenteret (mikrotjenester, distribuerte databaser, RPC, MapReduce). I moderne sky-arkitekturer er øst-vest 5-10× mer enn nord-sør — derfor må fabric-en være bygget for tett intern kommunikasjon.",
            },
            {
              term: "Clos-nettverk",
              body: "Den matematiske familien fat-tree og leaf-spine tilhører — først foreslått av Charles Clos i 1953 for telefon-svitsjing. Et k-stage Clos-nett består av flere lag like-størrelse-switcher koblet i en spesifikk mønster som garanterer ikke-blokkerende ruting hvis bisection er bredt nok.",
            },
            {
              term: "DCB (Data Center Bridging)",
              body: "Settet av Ethernet-utvidelser som gjør Ethernet egnet for storage-trafikk: PFC (priority flow control = pause per prioritets-kø), ETS (båndbredde-garanti per klasse), QCN (congestion notification). Lar storage-protokoller som FCoE og RoCE kjøre over standard Ethernet i stedet for dedikert Fibre Channel.",
            },
            {
              term: "RoCE / RDMA",
              body: "RDMA = Remote Direct Memory Access: en NIC kan lese og skrive i en annen maskins RAM uten å gå via CPU. RoCE = RDMA over Converged Ethernet bruker DCB for å gi den lossless garantien RDMA trenger. Brukes for HPC, GPU-til-GPU-overføring, og raske distribuerte databaser. Latency ned mot ~1 μs.",
            },
            {
              term: "BGP i datasenter",
              body: "Moderne fat-tree-datasentre kjører BGP — protokollen som styrer hele internettet — også internt. Hver leaf og hver spine er et eget «autonomt system». Det gir samme verktøy for intern og ekstern ruting, og BGPs ECMP-støtte fordeler trafikk over alle parallelle stier. Forenkler operativt verktøy-stakken.",
            },
            {
              term: "VXLAN / overlay-nettverk",
              body: "Når mange tenants (kunder) deler samme fysiske datasenter, vil hver ha sitt eget «virtuelle nettverk» som spenner over flere racker. VXLAN pakker Ethernet-rammer inn i UDP og legger en 24-bit VNI («VLAN-ID for skyen») i header — opp til 16 millioner virtuelle nett mot 802.1Qs 4094.",
            },
          ]}
        />
        <Illustration caption="Leaf-spine: hver leaf kobles til hver spine. To leaf-switcher kommuniserer alltid via én spine, ECMP fordeler last.">
          <LeafSpineSvg />
        </Illustration>
      </div>

      <Example title="Eksempel: bisection i en 4-leaf, 4-spine topologi">
        <p>
          Anta 4 leaf-switcher, hver med 48 server-porter à 10 Gbps og 4 uplink-porter à 40 Gbps
          (totalt 160 Gbps oppover). Hver leaf kobles til hver av 4 spine-switcher med én 40 Gbps
          lenke.
        </p>
        <p className="mt-2">
          Per-leaf ned-kapasitet: 48 × 10 = 480 Gbps. Opp-kapasitet: 160 Gbps. Oversubscription ≈
          3:1. Hvis alle servere på en leaf vil snakke samtidig med servere på andre leaf-switcher,
          får hver server bare ~3.3 Gbps reelt — fortsatt fint, men ikke linje-rate.
        </p>
        <p className="mt-2">
          For 1:1 må vi enten ha 12 uplinks per leaf (uvanlig høyt), eller bytte 10 Gbps
          server-portene til 2.5 Gbps. Avveiingen mellom kost og «alle kan snakke» er kjernen i
          datasenter-design.
        </p>
      </Example>

      <Example title="Eksempel: ECMP-hashing fordeler trafikk over 4 spine-switcher">
        <p>
          Leaf L1 har 4 like uplinks, én til hver av S1, S2, S3, S4. En server R1 i L1 åpner tre
          parallelle TCP-flows mot R8 (under leaf L4):
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>Flow A: (R1:54000, R8:443)</li>
          <li>Flow B: (R1:54001, R8:443)</li>
          <li>Flow C: (R1:54002, R8:443)</li>
        </ul>
        <p className="mt-2">
          L1 hash-er 5-tuplen (src-IP, dst-IP, src-port, dst-port, protokoll) og tar resten modulo
          4. Anta hash(A) % 4 = 0, hash(B) % 4 = 2, hash(C) % 4 = 2. Da:
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>Flow A går via S1.</li>
          <li>Flow B går via S3.</li>
          <li>Flow C går også via S3 (hash-kollisjon).</li>
        </ul>
        <p className="mt-2">
          Hver flow holder seg KONSISTENT på sin sti — pakkene i en TCP-flow tar samme rute, så det
          ankommer ikke i feil rekkefølge (out-of-order). Men ECMP-hashing er ikke perfekt: når to
          tunge flows kolliderer i samme spine (som B og C her), kan den ene spine-en bli flaskehals
          mens en annen er ledig. Moderne implementasjoner bruker «flowlet switching» som re-hasher
          midt i en flow når den ser et naturlig brudd.
        </p>
      </Example>

      <Example title="Eksempel: fat-tree med k=4 — hvor mange servere og switcher?">
        <p>Standard fat-tree-formel: en k-ary fat-tree har:</p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>(k/2)² core-switcher</li>
          <li>k pods, hver med k/2 aggregerings-switcher og k/2 edge-switcher</li>
          <li>Hver edge-switch har k/2 servere</li>
          <li>Totalt: k³/4 servere</li>
        </ul>
        <p className="mt-2">
          For k=4: 4 core-switcher, 4 pods × (2 agg + 2 edge) = 16 switcher i pod-ene, og 4 · 4 / 4
          · 4 = <strong>16 servere</strong>. Liten skala, men full bisection.
        </p>
        <p className="mt-2">
          For k=48 (typisk høyport-switch): 576 core, 48·48 = 2304 pod-switcher, og 48³/4 =
          <strong> 27 648 servere</strong>. Det skalerer godt: dobler du k, åttedobler du
          server-kapasitet. Det er hvorfor Facebooks og Googles datasentre er bygget på dette
          mønsteret.
        </p>
      </Example>

      <Hvorfor title="Hvorfor erstattet leaf-spine den klassiske 3-tier-topologien?">
        <p>
          Klassisk 3-tier (aksess → distribusjons → core) dominerte enterprise-nett gjennom 90- og
          2000-tallet. Det fungerte fint mens trafikken stort sett var nord-sør: brukere snakket med
          servere via internett. I 2010 begynte ting å skifte.
        </p>
        <p>
          <strong>Øst-vest-eksplosjon.</strong> Mikrotjenester, distribuerte databaser (Cassandra,
          Spanner), MapReduce, GPU-trening — alt dette krever at servere i datasenteret snakker
          intenst med HVERANDRE, ikke med utsiden. 3-tier-design med en trang nakke-core ble
          flaskehals.
        </p>
        <p>
          <strong>Determinisme i latency.</strong> I 3-tier kan en pakke gå alt fra 2 hopp (samme
          rack) til 6 hopp (kryss-aggregat) — uforutsigbart for applikasjons-utviklere. I leaf-spine
          er det ALLTID 2 hopp mellom to vilkårlige servere. Forutsigbar latency er essensielt for
          distribuerte databaser.
        </p>
        <p>
          <strong>Skalering av bisection.</strong> I 3-tier må core-switcher være enorme — én enkelt
          monster-boks. I leaf-spine bytter du komplekse core-switcher mot mange enkle spine-
          switcher som hver bare gjør ECMP. Skalering = legg til en spine. Mye lettere å vokse i
          inkrementer.
        </p>
        <p>
          <strong>Kostnads-effektivitet via volum-silikon.</strong> Industri-standardiserte merchant
          silicon-brikker (Broadcom Tomahawk, Trident osv.) gjør at en 32-port 400G-switch koster en
          brøkdel av hva en proprietær chassis-switch gjorde. Leaf-spine er bygget av mange like
          slike — null spesial-hardware.
        </p>
        <p>
          <strong>Operasjonell enkelhet.</strong> Hver switch i leaf-spine er identisk konfigurert
          (bortsett fra IP-er). Failure-domene = én switch. Bytting av en død leaf eller spine er en
          15-minutters jobb, ikke et kontroll-plane-mareritt.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-day-in-the-life", "dte2507-switch-self-learning"]} />
    </article>
  );
}

// ============================================================
// 6.8 — Oppgaver
// ============================================================
function Section68() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="6.8" title="Oppgaver" />
      <p className="text-muted-foreground">
        Ti oppgaver som tester at du faktisk kan regne og resonere — ikke bare gjenkjenne ordene.
        Klikk «Vis svar» etter du har prøvd selv.
      </p>

      <Exercise
        question="Beregn CRC-3 for databitene D = 11010 med generator G = 1001."
        hint="Heng på r = 3 nuller bak D, og gjør long-division med XOR i stedet for subtraksjon."
        answer={
          <>
            <p>D·2³ = 11010000. Vi divider på 1001 med XOR-aritmetikk:</p>
            <pre className="text-[11px] font-mono bg-muted/30 p-2 rounded mt-1 overflow-x-auto">
              {`     11010000  ÷  1001
     1001
     ----
      1000
      1001
      ----
         10000
          1001
          ----
            10`}
            </pre>
            <p className="mt-1">
              Rest = 010, så CRC-3 = <strong>010</strong>. Rammen som sendes er
              <code className="ml-1">11010 010</code>. Mottakeren divider hele strengen på 1001 og
              forventer rest = 0.
            </p>
          </>
        }
      />

      <Exercise
        question="Pure ALOHA har maks throughput 1/(2e) ≈ 18 %. Vis utregningen, og forklar hvorfor slot ALOHA blir nøyaktig 2× bedre."
        hint="Sårbart vindu for kollisjon — hvor langt er det i hver variant? Bruk Poisson-trafikk."
        answer={
          <>
            <p>
              Med Poisson-ankomst med rate G rammer per ramme-tid t, er sannsynligheten for at ingen
              andre rammer ankommer i et vindu av lengde x lik e^(-Gx/t).
            </p>
            <p className="mt-2">
              <strong>Pure ALOHA:</strong> en ramme du sender kolliderer hvis noen andre starter i
              intervallet [-t, +t] — totalt vindu 2t. Throughput S = G · e^(-2G). Maksimer: dS/dG =
              0 gir G = 0.5, og S_max = 0.5·e^(-1) = 1/(2e) ≈ 0.184.
            </p>
            <p className="mt-2">
              <strong>Slot ALOHA:</strong> bare rammer som starter i samme slot kolliderer. Vinduet
              er t. S = G · e^(-G), maks ved G = 1, S_max = 1/e ≈ 0.368.
            </p>
            <p className="mt-2">
              Forholdet er nøyaktig 2×. Synkronisering av klokker halverer kollisjons-vinduet, og
              max throughput dobles. Det er en gratis-vinning — bare i kompleksitet (felles klokke).
            </p>
          </>
        }
      />

      <Exercise
        question="Switch S har en tom forwarding-tabell. I rask rekkefølge ankommer: (1) ramme fra MAC A på port 1, til B; (2) ramme fra MAC B på port 3, til A; (3) ramme fra MAC C på port 2, til A. Tegn tabellen etter hver ramme og forklar hva switchen gjør med hver."
        hint="Self-learning: hver innkommende ramme oppdaterer kilde-MAC → port. Hvis destinasjon ukjent: flood."
        answer={
          <>
            <p>
              <strong>Etter ramme 1 (A→B på port 1):</strong> tabell = {`{A: 1}`}. Destinasjon B er
              ukjent → switchen <em>flooder</em> rammen ut alle porter unntatt port 1.
            </p>
            <p className="mt-2">
              <strong>Etter ramme 2 (B→A på port 3):</strong> tabell = {`{A: 1, B: 3}`}. Destinasjon
              A er nå kjent (på port 1) → switchen sender unicast bare ut port 1.
            </p>
            <p className="mt-2">
              <strong>Etter ramme 3 (C→A på port 2):</strong> tabell = {`{A: 1, B: 3, C: 2}`}.
              Destinasjon A kjent → unicast ut port 1.
            </p>
            <p className="mt-2">
              Observasjonen: kun den FØRSTE rammen i hver retning resulterer i flooding. Etter to
              meldinger frem og tilbake har switchen lært begge kantene av samtalen.
            </p>
          </>
        }
      />

      <Exercise
        question="En bedrift har to VLANer: 10 (HR) og 20 (gjeste-WiFi). En PC på VLAN 10 (IP 10.0.10.5) sender en pakke til en server på VLAN 20 (IP 10.0.20.8). Beskriv hva som skjer steg for steg, og hvor 802.1Q-taggen legges på og fjernes."
        hint="VLAN-grense = ruter. Trunk-lenker er tagged; access-lenker er ikke."
        answer={
          <>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                PC-en ser at destinasjons-IP (10.0.20.8) er på et annet subnett, så pakken sendes
                til default gateway (la oss si 10.0.10.1).
              </li>
              <li>
                PC-en lager en Ethernet-ramme uten VLAN-tag (access-link) med destinasjons-MAC =
                ruterens MAC på VLAN 10.
              </li>
              <li>
                Switchen mottar rammen på en port konfigurert som VLAN 10 access. Hvis ruteren er på
                en annen switch må rammen krysse en trunk — DA legger switchen på 802.1Q-tag med
                VLAN-ID 10. Annen switch tar tagg av før den leverer til ruteren.
              </li>
              <li>
                Ruteren tar imot IP-pakken, slår opp 10.0.20.8 i sin tabell, finner ut det er VLAN
                20. Den lager en ny Ethernet-ramme (NY destinasjons-MAC = serverens MAC, ny
                kilde-MAC = ruterens MAC på VLAN 20).
              </li>
              <li>
                Rammen sendes ut på VLAN 20-interfacet. Hvis det går via en trunk, tagges den med
                VLAN-ID 20. Til slutt fjernes taggen og rammen leveres til server-porten.
              </li>
            </ol>
            <p className="mt-2">
              Hele veien er IP-pakken den samme (samme kilde-IP, samme destinasjons-IP) — det er
              bare Ethernet-rammene rundt som byttes ut to ganger.
            </p>
          </>
        }
      />

      <Exercise
        question="Et leaf-spine datasenter har 8 leaf-switcher og 4 spine-switcher. Hver leaf har 32 server-porter à 25 Gbps og 4 uplink-porter à 100 Gbps. Beregn oversubscription-forholdet og bisection bandwidth."
        hint="Per-leaf: total server-kapasitet vs total uplink-kapasitet. Bisection: del nettverket i to og summer kapasiteten i snittet."
        answer={
          <>
            <p>
              <strong>Per-leaf:</strong>
            </p>
            <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
              <li>Ned (mot servere): 32 × 25 = 800 Gbps</li>
              <li>Opp (mot spine): 4 × 100 = 400 Gbps</li>
              <li>Oversubscription = 800/400 = 2:1</li>
            </ul>
            <p className="mt-2">
              <strong>Bisection:</strong> del de 8 leafene i to halvdeler (4 + 4). Trafikk mellom
              halvdelene må over spine-laget. Hver leaf har 400 Gbps oppover, og halvparten av disse
              lenkene krysser snittet i snitt (forutsatt jevn ECMP).
            </p>
            <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
              <li>4 leaf på hver side × 400 Gbps = 1600 Gbps uplink per side</li>
              <li>I snittet: 4 spine-switcher × 8 nedover-lenker × 100 Gbps = 3200 Gbps total</li>
              <li>Halvparten av spine-lenkene krysser snittet ⇒ bisection ≈ 1600 Gbps</li>
            </ul>
            <p className="mt-2">
              Med 8 × 32 = 256 servere totalt, deler 128 servere per side 1600 Gbps = 12.5 Gbps per
              server i worst-case øst-vest-trafikk. Halvparten av deres 25 Gbps server-port —
              direkte konsekvens av 2:1 oversubscription.
            </p>
          </>
        }
      />

      <Exercise
        question={
          <>
            Verifiser at en mottaker oppdager en burst-feil på 3 bits med CRC-3 (G = 1011). Du
            sender D = 10110 med CRC. Anta at bitene i posisjon 3, 4 og 5 (med 0-indeksering fra
            venstre, i hele kabel-strengen) flippes underveis. Vis at mottakeren oppdager feilen.
          </>
        }
        hint="Beregn CRC for D, lag det som sendes, flipp de tre bitene, og deriver hele mottatte string med 1011."
        answer={
          <>
            <p>D = 10110, r = 3. D·2³ = 10110000. Long-division med 1011 i GF(2):</p>
            <pre className="text-[11px] font-mono bg-muted/30 p-2 rounded mt-1 overflow-x-auto">
              {`     10110000  ÷  1011
     1011
     ----
      0000
       000
       ----
       0000000
        ...
         1000
         1011
         ----
           110   ← CRC = 110`}
            </pre>
            <p className="mt-2">
              Sendt: <code>10110 110</code> = <code>10110110</code> (8 bits).
            </p>
            <p className="mt-2">
              Flipp bit 3, 4, 5 (de tre i midten): <code>10001110</code>. Mottaker divider på 1011:
            </p>
            <pre className="text-[11px] font-mono bg-muted/30 p-2 rounded mt-1 overflow-x-auto">
              {`     10001110  ÷  1011
     1011
     ----
      0111
       ...
       (rest ≠ 0)`}
            </pre>
            <p className="mt-2">
              Resten er forskjellig fra 0 → feil oppdaget. Garantert: CRC med r=3 oppdager ALLE
              burst-feil av lengde ≤ 3.
            </p>
          </>
        }
      />

      <Exercise
        question="En 10 Mbps Ethernet-hub med 500 m maks-kabel: hvorfor må minimum-rammen være på minst 64 bytes? Vis utregningen, og forklar hva som ville skjedd hvis vi tillot 32-byte rammer."
        hint="Round-trip-tid. Tenk på en kollisjon mellom A og B i hver sin ende av kabelen."
        answer={
          <>
            <p>
              Signalet bruker ca. 2/3 av lyshastigheten i koaks: v ≈ 2·10⁸ m/s. Single-trip på 500 m
              = 500 / 2·10⁸ = 2,5 μs. Round-trip = 5 μs. Pluss repeater-forsinkelser →
              kollisjons-vindu ≈ 51,2 μs.
            </p>
            <p className="mt-2">
              For at avsender skal kunne oppdage en kollisjon FØR hun er ferdig, må senden vare
              minst 51,2 μs. På 10 Mbps blir det 51,2 · 10⁻⁶ · 10·10⁶ = 512 bits = 64 bytes.
            </p>
            <p className="mt-2">
              <strong>Hvis 32-byte rammer var tillatt:</strong> avsender A sender 32 bytes = 25,6
              μs. Hun blir ferdig FØR hun ser at B i den andre enden også begynte å sende. Hun tror
              rammen kom fram, og går videre. Men B oppdager kollisjonen og gjør retransmisjon.
              Mottakeren har en korrupt ramme og venter på retransmisjon som A ikke gjør.
              Resultatet: tapet av pakker som software-stacken må håndtere — TCP retransmisjon med
              full timeout, ikke link-nivå-replay. Mye langsommere, mye mer trafikk-bortkasting.
            </p>
          </>
        }
      />

      <Exercise
        question="Du ser i Wireshark at en ARP-pakke har source-MAC AA:BB:CC:11:22:33 og en gratuitous ARP der target IP = source IP = 10.0.0.50. To minutter senere ser du en annen host som sender gratuitous ARP for SAMME IP, men fra MAC DE:AD:BE:EF:CA:FE. Hva skjer, og hva er konsekvensen?"
        hint="To maskiner tror de er 10.0.0.50. Hva gjør de andre hostene som mottar disse gratuitous ARPs?"
        answer={
          <>
            <p>
              Vi har en <strong>IP-konflikt</strong>: to maskiner har konfigurert seg med samme IP
              (10.0.0.50). Begge sender gratuitous ARP for å annonsere sin (IP, MAC)-binding.
            </p>
            <p className="mt-2">
              Andre hosters ARP-cache: når første ramme ankommer, cacher de (10.0.0.50 →
              AA:BB:CC:11:22:33). Når andre ramme ankommer, oppdaterer de cachen til (10.0.0.50 →
              DE:AD:BE:EF:CA:FE) — standard ARP-oppførsel er «siste vinner».
            </p>
            <p className="mt-2">
              <strong>Konsekvens:</strong> all trafikk til 10.0.0.50 sendes plutselig til DE:AD:...
              i stedet for AA:BB:.... Maskinen på AA:BB:... mottar ingen trafikk. Når den selv
              sender en gratuitous ARP igjen (typisk hvert annet minutt), bytter rutingen tilbake.
              Brukerne opplever sporadisk «internett virker, så virker det ikke».
            </p>
            <p className="mt-2">
              Moderne operativsystemer oppdager konflikten ved at de mottar et ARP-svar for sin egen
              IP fra en annen MAC og logger en advarsel. Linux NetworkManager popper opp: «Address
              conflict detected». Det er gratuitous ARPs jobb.
            </p>
          </>
        }
      />

      <Exercise
        question="To switcher S1 og S2 er koblet med to parallelle kabler (begge i samme VLAN, samme aksess-status). Du ønsker å bruke begge kablene for ekstra båndbredde, men nettet stopper å fungere så snart begge plugges inn. Forklar hvorfor, og foreslå to ulike løsninger."
        hint="Tenk broadcast-storm uten STP. Hva slags Ethernet-funksjon kunne kombinert kablene som én logisk lenke?"
        answer={
          <>
            <p>
              <strong>Hva skjer:</strong> de to kablene danner en loop mellom S1 og S2. En
              broadcast-ramme fra en host på S1 floodes ut begge lenkene. S2 mottar to kopier og
              flooder hver av dem tilbake ut den andre lenken. Kopiene multipliseres uten ende — en
              broadcast-storm fyller all båndbredde og lammer LAN-et på sekunder.
            </p>
            <p className="mt-2">
              <strong>Løsning 1: Spanning Tree Protocol (STP).</strong> Slå på STP (sannsynligvis
              allerede på som default). STP velger en root-switch, beregner korteste sti til root
              for hver port, og slår AV den ene av de to lenkene. Den slåtte lenken er en backup —
              hvis den aktive ryker, åpner STP backup-en innen 30-60 sekunder (eller 1 sekund med
              Rapid STP). Du får redundans, men ikke ekstra båndbredde.
            </p>
            <p className="mt-2">
              <strong>Løsning 2: LAG / EtherChannel / 802.3ad.</strong>
              Konfigurer begge kablene som ÉN logisk lenke (Link Aggregation Group).
              LACP-protokollen håndhilser på hver side; switcher behandler de to fysiske portene som
              én bundle. STP ser bare én logisk lenke, så ingen loop. Trafikk hash-fordeles over
              begge fysiske kablene → DOBBEL båndbredde og redundans samtidig.
            </p>
          </>
        }
      />

      <Exercise
        question="En leaf-spine fabric har 16 leaf-switcher og 8 spine-switcher. Hver leaf har 48 server-porter à 10 Gbps og bruker resten av portene som 100 Gbps uplinks (én til hver spine). Beregn (a) ned-kapasitet per leaf, (b) opp-kapasitet per leaf, (c) oversubscription-ratio, (d) total bisection bandwidth."
        hint="Du må regne ut hvor mange uplinks per leaf det er først (én per spine = 8). Bisection: del leafene i to grupper, summer kapasiteten over snittet."
        answer={
          <>
            <p>
              <strong>(a) Ned-kapasitet per leaf:</strong> 48 porter × 10 Gbps ={" "}
              <strong>480 Gbps</strong>.
            </p>
            <p className="mt-2">
              <strong>(b) Opp-kapasitet per leaf:</strong> 8 spines, så 8 uplinks à 100 Gbps =
              <strong> 800 Gbps</strong>.
            </p>
            <p className="mt-2">
              <strong>(c) Oversubscription:</strong> 480/800 = 0,6:1, eller mer brukbart: opp-
              kapasiteten er 1,67× ned-kapasiteten. Vi har FAKTISK over-provisjonert oppover. I
              praksis betyr det at hver server kan kjøre i full 10 Gbps mot HVILKEN som helst annen
              server i fabric-en, uten kongestion. <strong>Bedre enn 1:1</strong>, sannsynligvis
              valgt fordi hver leaf har spare-uplinks for redundans.
            </p>
            <p className="mt-2">
              <strong>(d) Bisection:</strong> del 16 leafene i to grupper à 8. Snittet går mellom
              leafene og spinene. Hver leaf bidrar med 800 Gbps oppover; halvparten av disse
              flow-ene krysser snittet i snitt (ECMP fordeler). Per side: 8 leaf × 800 Gbps · 0,5 =
              3200 Gbps. Total bisection ≈ <strong>3,2 Tbps</strong>.
            </p>
            <p className="mt-2">
              Med 16 · 48 = 768 servere totalt, deler 384 per side 3200 Gbps = 8,33 Gbps per server.
              Nesten full 10 Gbps. En sky-leverandør med øst-vest-tunge workloads ville være
              fornøyd.
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
        Hvorfor
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

function FrameSvg() {
  return (
    <svg viewBox="0 0 500 180" className="w-full h-auto">
      <text
        x={250}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Ramme = MAC-header + IP-datagram + trailer
      </text>
      {/* Datagrammet inni */}
      <rect
        x={150}
        y={70}
        width={200}
        height={40}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={250} y={94} textAnchor="middle" className="fill-foreground text-[11px]">
        IP-datagram (payload)
      </text>
      {/* MAC-header */}
      <rect
        x={70}
        y={70}
        width={80}
        height={40}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={110} y={88} textAnchor="middle" className="fill-foreground text-[9px]">
        MAC-header
      </text>
      <text x={110} y={102} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        dst·src·type
      </text>
      {/* Trailer */}
      <rect
        x={350}
        y={70}
        width={60}
        height={40}
        className="fill-success/30 stroke-success"
        strokeWidth={1.5}
      />
      <text x={380} y={88} textAnchor="middle" className="fill-foreground text-[9px]">
        Trailer
      </text>
      <text x={380} y={102} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        CRC
      </text>
      {/* Bit-strøm */}
      <line
        x1={70}
        y1={130}
        x2={410}
        y2={130}
        className="stroke-muted-foreground/60"
        strokeWidth={1.5}
      />
      <text x={240} y={150} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        ...sendt som en bit-strøm over fysisk medium...
      </text>
      <text x={240} y={165} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Mottakeren ser preamble, leser MAC, sjekker CRC, og overlater IP-en til nettverkslaget
      </text>
    </svg>
  );
}

function CrcSvg() {
  return (
    <svg viewBox="0 0 500 200" className="w-full h-auto">
      <text
        x={250}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        CRC: rest av (D · 2^r) ved divisjon med G
      </text>
      {/* D (data) */}
      <rect
        x={40}
        y={50}
        width={140}
        height={30}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={110} y={70} textAnchor="middle" className="fill-foreground text-[11px] font-mono">
        D (data, k bit)
      </text>
      {/* + 2^r */}
      <rect
        x={180}
        y={50}
        width={70}
        height={30}
        className="fill-muted stroke-border"
        strokeWidth={1.5}
      />
      <text x={215} y={70} textAnchor="middle" className="fill-foreground text-[11px] font-mono">
        00...0 (r)
      </text>
      <text x={262} y={70} className="fill-foreground text-[14px] font-mono">
        ÷
      </text>
      {/* G */}
      <rect
        x={280}
        y={50}
        width={90}
        height={30}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={325} y={70} textAnchor="middle" className="fill-foreground text-[11px] font-mono">
        G (r+1 bit)
      </text>
      {/* = */}
      <text x={385} y={70} className="fill-foreground text-[14px] font-mono">
        →
      </text>
      {/* rest */}
      <rect
        x={400}
        y={50}
        width={70}
        height={30}
        className="fill-success/30 stroke-success"
        strokeWidth={1.5}
      />
      <text x={435} y={70} textAnchor="middle" className="fill-foreground text-[11px] font-mono">
        rest = CRC
      </text>

      {/* Sendt ramme */}
      <text
        x={250}
        y={115}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Det som faktisk sendes:
      </text>
      <rect
        x={120}
        y={130}
        width={160}
        height={30}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={200} y={150} textAnchor="middle" className="fill-foreground text-[11px] font-mono">
        D (k bit)
      </text>
      <rect
        x={280}
        y={130}
        width={100}
        height={30}
        className="fill-success/30 stroke-success"
        strokeWidth={1.5}
      />
      <text x={330} y={150} textAnchor="middle" className="fill-foreground text-[11px] font-mono">
        CRC (r bit)
      </text>

      <text
        x={250}
        y={185}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] italic"
      >
        Mottakeren divider hele strengen på G — hvis rest ≠ 0, har en bit flippet underveis
      </text>
    </svg>
  );
}

function AlohaSvg() {
  return (
    <svg viewBox="0 0 500 200" className="w-full h-auto">
      <text
        x={250}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Pure ALOHA: kollisjons-vindu er 2t
      </text>
      {/* Tidsakse */}
      <line x1={40} y1={140} x2={460} y2={140} className="stroke-foreground/60" strokeWidth={1.5} />
      <polygon points="460,140 455,137 455,143" className="fill-foreground/60" />
      <text x={465} y={144} className="fill-muted-foreground text-[10px]">
        tid
      </text>

      {/* Ramme A (node 1) */}
      <rect
        x={140}
        y={60}
        width={120}
        height={30}
        className="fill-brand/40 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={200} y={78} textAnchor="middle" className="fill-foreground text-[10px]">
        ramme A (node 1)
      </text>
      <line
        x1={140}
        y1={90}
        x2={140}
        y2={140}
        className="stroke-brand/40"
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <line
        x1={260}
        y1={90}
        x2={260}
        y2={140}
        className="stroke-brand/40"
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <text x={200} y={155} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        t
      </text>

      {/* Ramme B starter mens A går — kollisjon */}
      <rect
        x={220}
        y={100}
        width={120}
        height={30}
        className="fill-destructive/40 stroke-destructive"
        strokeWidth={1.5}
      />
      <text x={280} y={118} textAnchor="middle" className="fill-foreground text-[10px]">
        ramme B (node 2)
      </text>

      {/* Overlap-område */}
      <rect x={220} y={60} width={40} height={70} className="fill-destructive/20" />
      <text
        x={240}
        y={50}
        textAnchor="middle"
        className="fill-destructive text-[10px] font-semibold"
      >
        KOLLISJON
      </text>

      {/* Sårbart vindu */}
      <line x1={20} y1={170} x2={340} y2={170} className="stroke-amber-500" strokeWidth={2} />
      <text
        x={180}
        y={185}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[10px]"
      >
        Sårbart vindu = 2t (B kan starte hvor som helst her og treffe A)
      </text>
    </svg>
  );
}

function SwitchLearningSvg() {
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={250}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Switch self-learning
      </text>
      {/* Switch */}
      <rect
        x={180}
        y={70}
        width={140}
        height={70}
        rx={6}
        className="fill-card stroke-brand"
        strokeWidth={2}
      />
      <text
        x={250}
        y={92}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Switch
      </text>
      {/* Tabell */}
      <text
        x={250}
        y={108}
        textAnchor="middle"
        className="fill-muted-foreground text-[8px] font-mono"
      >
        MAC | port
      </text>
      <text x={250} y={120} textAnchor="middle" className="fill-foreground text-[9px] font-mono">
        A → 1
      </text>
      <text x={250} y={132} textAnchor="middle" className="fill-foreground text-[9px] font-mono">
        B → 3
      </text>

      {/* Porter og hosts */}
      {/* Port 1 */}
      <line
        x1={180}
        y1={105}
        x2={100}
        y2={105}
        className="stroke-foreground/60"
        strokeWidth={1.5}
      />
      <text x={140} y={98} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        port 1
      </text>
      <circle
        cx={80}
        cy={105}
        r={14}
        className="fill-amber-500/40 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={80} y={108} textAnchor="middle" className="fill-foreground text-[9px]">
        A
      </text>

      {/* Port 2 */}
      <line
        x1={250}
        y1={140}
        x2={250}
        y2={185}
        className="stroke-foreground/60"
        strokeWidth={1.5}
      />
      <text x={258} y={160} className="fill-muted-foreground text-[9px]">
        port 2
      </text>
      <circle
        cx={250}
        cy={200}
        r={14}
        className="fill-success/40 stroke-success"
        strokeWidth={1.5}
      />
      <text x={250} y={203} textAnchor="middle" className="fill-foreground text-[9px]">
        C
      </text>

      {/* Port 3 */}
      <line
        x1={320}
        y1={105}
        x2={400}
        y2={105}
        className="stroke-foreground/60"
        strokeWidth={1.5}
      />
      <text x={360} y={98} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        port 3
      </text>
      <circle cx={420} cy={105} r={14} className="fill-brand/40 stroke-brand" strokeWidth={1.5} />
      <text x={420} y={108} textAnchor="middle" className="fill-foreground text-[9px]">
        B
      </text>

      {/* Læring-pil */}
      <text
        x={80}
        y={140}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[9px] italic"
      >
        A sender → switch lærer
      </text>
      <text
        x={80}
        y={152}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[9px] italic"
      >
        «A sitter på port 1»
      </text>

      <text x={250} y={20} className="fill-transparent">
        .
      </text>
    </svg>
  );
}

function EthernetFrameSvg() {
  const fields = [
    { name: "Preamble", w: 60, sub: "8 B" },
    { name: "Dst MAC", w: 60, sub: "6 B" },
    { name: "Src MAC", w: 60, sub: "6 B" },
    { name: "Type", w: 40, sub: "2 B" },
    { name: "Payload", w: 160, sub: "46–1500 B" },
    { name: "CRC", w: 50, sub: "4 B" },
  ];
  const colors = [
    "fill-muted stroke-border",
    "fill-amber-500/30 stroke-amber-500",
    "fill-amber-500/30 stroke-amber-500",
    "fill-brand/30 stroke-brand",
    "fill-brand/15 stroke-brand/60",
    "fill-success/30 stroke-success",
  ];
  let x = 20;
  return (
    <svg viewBox="0 0 500 160" className="w-full h-auto">
      <text
        x={250}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Ethernet-ramme (IEEE 802.3)
      </text>
      {fields.map((f, i) => {
        const rect = (
          <g key={f.name}>
            <rect x={x} y={50} width={f.w} height={50} className={colors[i]} strokeWidth={1.5} />
            <text
              x={x + f.w / 2}
              y={72}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-semibold"
            >
              {f.name}
            </text>
            <text
              x={x + f.w / 2}
              y={88}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {f.sub}
            </text>
          </g>
        );
        x += f.w;
        return rect;
      })}
      <text
        x={250}
        y={130}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] italic"
      >
        Faste byte-posisjoner — derfor kan NIC-en parse rammen i hardware
      </text>
    </svg>
  );
}

function VlanSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Én fysisk switch, to logiske VLANer
      </text>
      {/* Switch */}
      <rect
        x={100}
        y={70}
        width={300}
        height={70}
        rx={6}
        className="fill-card stroke-brand"
        strokeWidth={2}
      />
      <text
        x={250}
        y={92}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Switch
      </text>
      {/* VLAN 10-region (venstre halvdel) */}
      <rect
        x={110}
        y={100}
        width={130}
        height={35}
        rx={3}
        className="fill-amber-500/20 stroke-amber-500/60"
        strokeWidth={1.2}
        strokeDasharray="3 2"
      />
      <text
        x={175}
        y={122}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[10px] font-semibold"
      >
        VLAN 10 (HR)
      </text>
      {/* VLAN 20-region (høyre halvdel) */}
      <rect
        x={260}
        y={100}
        width={130}
        height={35}
        rx={3}
        className="fill-success/20 stroke-success/60"
        strokeWidth={1.2}
        strokeDasharray="3 2"
      />
      <text x={325} y={122} textAnchor="middle" className="fill-success text-[10px] font-semibold">
        VLAN 20 (gjest)
      </text>

      {/* Hosts VLAN 10 */}
      <line
        x1={140}
        y1={135}
        x2={140}
        y2={175}
        className="stroke-foreground/60"
        strokeWidth={1.5}
      />
      <circle
        cx={140}
        cy={195}
        r={14}
        className="fill-amber-500/40 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={140} y={199} textAnchor="middle" className="fill-foreground text-[9px]">
        PC-HR
      </text>

      <line
        x1={210}
        y1={135}
        x2={210}
        y2={175}
        className="stroke-foreground/60"
        strokeWidth={1.5}
      />
      <circle
        cx={210}
        cy={195}
        r={14}
        className="fill-amber-500/40 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={210} y={199} textAnchor="middle" className="fill-foreground text-[9px]">
        PC-HR
      </text>

      {/* Hosts VLAN 20 */}
      <line
        x1={290}
        y1={135}
        x2={290}
        y2={175}
        className="stroke-foreground/60"
        strokeWidth={1.5}
      />
      <circle
        cx={290}
        cy={195}
        r={14}
        className="fill-success/40 stroke-success"
        strokeWidth={1.5}
      />
      <text x={290} y={199} textAnchor="middle" className="fill-foreground text-[9px]">
        gjest
      </text>

      <line
        x1={360}
        y1={135}
        x2={360}
        y2={175}
        className="stroke-foreground/60"
        strokeWidth={1.5}
      />
      <circle
        cx={360}
        cy={195}
        r={14}
        className="fill-success/40 stroke-success"
        strokeWidth={1.5}
      />
      <text x={360} y={199} textAnchor="middle" className="fill-foreground text-[9px]">
        gjest
      </text>

      {/* Trunk-link til naboswitch */}
      <line
        x1={400}
        y1={105}
        x2={470}
        y2={105}
        className="stroke-brand"
        strokeWidth={3}
        strokeDasharray="4 2"
      />
      <text x={435} y={98} textAnchor="middle" className="fill-brand text-[9px] font-semibold">
        trunk
      </text>
      <text x={435} y={120} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        802.1Q-tagget
      </text>

      <text
        x={250}
        y={225}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] italic"
      >
        PC-HR og gjest kan ikke broadcaste til hverandre — switchen oppfører seg som to maskiner
      </text>
    </svg>
  );
}

function LeafSpineSvg() {
  const spines = [{ x: 110 }, { x: 220 }, { x: 330 }, { x: 440 }];
  const leaves = [{ x: 110 }, { x: 220 }, { x: 330 }, { x: 440 }];
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Leaf-spine: hver leaf kobles til hver spine
      </text>

      {/* Spines */}
      <text x={20} y={55} className="fill-brand text-[10px] uppercase tracking-wider font-semibold">
        Spine
      </text>
      {spines.map((s, i) => (
        <g key={`sp${i}`}>
          <rect
            x={s.x - 25}
            y={50}
            width={50}
            height={26}
            rx={4}
            className="fill-brand/20 stroke-brand"
            strokeWidth={1.5}
          />
          <text x={s.x} y={67} textAnchor="middle" className="fill-foreground text-[10px]">
            S{i + 1}
          </text>
        </g>
      ))}

      {/* Leaves */}
      <text
        x={20}
        y={155}
        className="fill-success text-[10px] uppercase tracking-wider font-semibold"
      >
        Leaf
      </text>
      {leaves.map((l, i) => (
        <g key={`lf${i}`}>
          <rect
            x={l.x - 25}
            y={150}
            width={50}
            height={26}
            rx={4}
            className="fill-success/20 stroke-success"
            strokeWidth={1.5}
          />
          <text x={l.x} y={167} textAnchor="middle" className="fill-foreground text-[10px]">
            L{i + 1}
          </text>
        </g>
      ))}

      {/* Mesh: hver leaf til hver spine */}
      {leaves.flatMap((l, li) =>
        spines.map((s, si) => (
          <line
            key={`m${li}-${si}`}
            x1={l.x}
            y1={150}
            x2={s.x}
            y2={76}
            className="stroke-muted-foreground/40"
            strokeWidth={0.8}
          />
        )),
      )}

      {/* Servere under hver leaf */}
      {leaves.map((l, i) => (
        <g key={`srv${i}`}>
          <line
            x1={l.x - 15}
            y1={176}
            x2={l.x - 15}
            y2={200}
            className="stroke-foreground/40"
            strokeWidth={1}
          />
          <line
            x1={l.x}
            y1={176}
            x2={l.x}
            y2={200}
            className="stroke-foreground/40"
            strokeWidth={1}
          />
          <line
            x1={l.x + 15}
            y1={176}
            x2={l.x + 15}
            y2={200}
            className="stroke-foreground/40"
            strokeWidth={1}
          />
          <rect
            x={l.x - 22}
            y={200}
            width={44}
            height={14}
            className="fill-card stroke-border"
            strokeWidth={1}
          />
          <text x={l.x} y={210} textAnchor="middle" className="fill-muted-foreground text-[8px]">
            servere
          </text>
        </g>
      ))}

      <text
        x={250}
        y={232}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] italic"
      >
        L1 → L4: alltid 2 hopp via en spine. ECMP fordeler flows på tvers av S1–S4.
      </text>
    </svg>
  );
}
