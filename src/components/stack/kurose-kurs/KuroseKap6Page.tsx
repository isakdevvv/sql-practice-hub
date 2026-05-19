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

type Tab = "intro" | "6.1" | "6.2" | "6.3" | "6.4" | "6.5" | "6.6" | "6.7" | "6.8";

export function KuroseKap6Page() {
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
            <span>Kapittel 6 av 9</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Kap. 6 — Link-laget og LAN</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Vi har gått fra applikasjonen ned til IP. Nå går vi det siste hakket: hvordan en pakke
            faktisk reiser over én lenke — fra rammer, MAC-adresser og feiloppdaging til hvordan en
            switch finner riktig port.
          </p>
        </header>

        <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border">
          <TabBtn active={tab === "intro"} onClick={() => setTab("intro")}>
            Start her
          </TabBtn>
          <TabBtn active={tab === "6.1"} onClick={() => setTab("6.1")}>
            6.1 Tjenester
          </TabBtn>
          <TabBtn active={tab === "6.2"} onClick={() => setTab("6.2")}>
            6.2 Feiloppdaging
          </TabBtn>
          <TabBtn active={tab === "6.3"} onClick={() => setTab("6.3")}>
            6.3 Multiple access
          </TabBtn>
          <TabBtn active={tab === "6.4"} onClick={() => setTab("6.4")}>
            6.4 Switched LAN
          </TabBtn>
          <TabBtn active={tab === "6.5"} onClick={() => setTab("6.5")}>
            6.5 Ethernet
          </TabBtn>
          <TabBtn active={tab === "6.6"} onClick={() => setTab("6.6")}>
            6.6 VLAN
          </TabBtn>
          <TabBtn active={tab === "6.7"} onClick={() => setTab("6.7")}>
            6.7 Datasenter
          </TabBtn>
          <TabBtn active={tab === "6.8"} onClick={() => setTab("6.8")}>
            6.8 Oppgaver
          </TabBtn>
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

        <ChapterPager
          prev={{ slug: "kurose-kap-5", title: "Nettverkslaget — control-plane" }}
          next={{ slug: "kurose-kap-7", title: "Trådløst og mobilt" }}
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
        ]}
      />

      <Illustration caption="Link-laget tar et IP-datagram og pakker det inn med MAC-header + trailer før det går ut på fysisk medium.">
        <FrameSvg />
      </Illustration>

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
        ]}
      />

      <Illustration caption="CRC: del databitene + tilhørende r nuller på G; resten er CRC-verdien som henges på.">
        <CrcSvg />
      </Illustration>

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
        ]}
      />

      <Illustration caption="Pure ALOHA-kollisjon: ramme A overlapper med starten av B. Begge må retransmitteres.">
        <AlohaSvg />
      </Illustration>

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
        ]}
      />

      <Illustration caption="Switch self-learning: ramme fra MAC X på port 1 lærer switchen at X sitter på port 1.">
        <SwitchLearningSvg />
      </Illustration>

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
        ]}
      />

      <Illustration caption="Ethernet-ramme: preamble · dst · src · type · payload · CRC. Alle felt har faste posisjoner.">
        <EthernetFrameSvg />
      </Illustration>

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
        ]}
      />

      <Illustration caption="Én fysisk switch deles i to VLANer. Trunk-lenken bærer tagget trafikk fra begge.">
        <VlanSvg />
      </Illustration>

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
        ]}
      />

      <Illustration caption="Leaf-spine: hver leaf kobles til hver spine. To leaf-switcher kommuniserer alltid via én spine, ECMP fordeler last.">
        <LeafSpineSvg />
      </Illustration>

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
        Fem oppgaver som tester at du faktisk kan regne og resonere — ikke bare gjenkjenne ordene.
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
