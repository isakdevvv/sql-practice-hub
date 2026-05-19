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

type Tab = "intro" | "5.1" | "5.2" | "5.3" | "5.4" | "5.5" | "5.6" | "5.7" | "5.8";


const SECTIONS_5: SectionNavItem[] = [
  { id: "intro", label: "Start her" },
  { id: "5.1", label: "5.1 Overview" },
  { id: "5.2", label: "5.2 Algoritmer" },
  { id: "5.3", label: "5.3 OSPF" },
  { id: "5.4", label: "5.4 BGP" },
  { id: "5.5", label: "5.5 SDN" },
  { id: "5.6", label: "5.6 ICMP" },
  { id: "5.7", label: "5.7 DHCP" },
  { id: "5.8", label: "5.8 Oppgaver" },
];
const NEXT_CHAPTER_5 = { slug: "kurose-kap-6", title: "Link-laget og LAN" };

export function KuroseKap5Page() {
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
            <span>Kapittel 5 av 9</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kap. 5 — Nettverkslaget: control-plane
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Hvordan rutere blir enige om hvor pakker skal — fra distribuerte algoritmer som Dijkstra
            og Bellman-Ford, til protokollene OSPF og BGP, til den sentraliserte SDN-modellen.
          </p>
        </header>

        <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border">
          <TabBtn active={tab === "intro"} onClick={() => setTab("intro")}>
            Start her
          </TabBtn>
          <TabBtn active={tab === "5.1"} onClick={() => setTab("5.1")}>
            5.1 Overview
          </TabBtn>
          <TabBtn active={tab === "5.2"} onClick={() => setTab("5.2")}>
            5.2 Algoritmer
          </TabBtn>
          <TabBtn active={tab === "5.3"} onClick={() => setTab("5.3")}>
            5.3 OSPF
          </TabBtn>
          <TabBtn active={tab === "5.4"} onClick={() => setTab("5.4")}>
            5.4 BGP
          </TabBtn>
          <TabBtn active={tab === "5.5"} onClick={() => setTab("5.5")}>
            5.5 SDN
          </TabBtn>
          <TabBtn active={tab === "5.6"} onClick={() => setTab("5.6")}>
            5.6 ICMP
          </TabBtn>
          <TabBtn active={tab === "5.7"} onClick={() => setTab("5.7")}>
            5.7 DHCP
          </TabBtn>
          <TabBtn active={tab === "5.8"} onClick={() => setTab("5.8")}>
            5.8 Oppgaver
          </TabBtn>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "5.1" && <Section51 />}
        {tab === "5.2" && <Section52 />}
        {tab === "5.3" && <Section53 />}
        {tab === "5.4" && <Section54 />}
        {tab === "5.5" && <Section55 />}
        {tab === "5.6" && <Section56 />}
        {tab === "5.7" && <Section57 />}
        {tab === "5.8" && <Section58 />}

        <SectionPager tabs={SECTIONS_5} current={tab} onPick={(id) => setTab(id as Tab)} nextChapter={NEXT_CHAPTER_5} />

        <ChapterPager
          prev={{ slug: "kurose-kap-4", title: "Nettverkslaget — data-plane" }}
          next={{ slug: "kurose-kap-6", title: "Link-laget og LAN" }}
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
            Skille data-plane (per-pakke videresending) fra control-plane (å beregne tabellene), og
            forstå hvorfor de logisk separeres.
          </li>
          <li>
            Kjøre Dijkstras algoritme manuelt på en liten graf, og forklare hvorfor link-state
            konvergerer raskt.
          </li>
          <li>
            Forklare Bellman-Ford distance-vector, count-to-infinity-problemet, og hvordan poisoned
            reverse og split horizon prøver å dempe det.
          </li>
          <li>
            Vite hva OSPF gjør innenfor et autonomt system: LSA-flooding, areas, hierarkisk ruting.
          </li>
          <li>
            Forklare hvorfor BGP er policy-basert (ikke shortest-path), og kjenne attributtene
            LOCAL_PREF, AS_PATH, MED og NEXT_HOP.
          </li>
          <li>
            Beskrive SDN-arkitekturen — separasjon av controller og switch — og hvorfor den vant i
            moderne datasentre.
          </li>
          <li>Forklare hva ICMP er, og hvordan ping og traceroute utnytter den.</li>
          <li>
            Beskrive DHCP DORA-utvekslingen som lar en host få IP-adresse uten manuell
            konfigurasjon.
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Kapittelets struktur</h2>
        <ol className="list-decimal pl-5 text-muted-foreground space-y-1">
          <li>Overview — sentralisert vs distribuert control-plane</li>
          <li>Routing-algoritmer — link-state og distance-vector</li>
          <li>Intra-AS ruting — OSPF</li>
          <li>Inter-AS ruting — BGP</li>
          <li>SDN control-plane — OpenFlow</li>
          <li>ICMP — feilmeldinger og diagnostikk</li>
          <li>DHCP — dynamisk adresse-tildeling</li>
          <li>Oppgaver — sjekk forståelsen din</li>
        </ol>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => onPick("5.1")}>
            Start på 5.1 →
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 5.1 — Overview
// ============================================================
function Section51() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="5.1" title="Control-plane: sentralisert vs distribuert" />

      <p className="text-muted-foreground">
        Forrige kapittel handlet om data-plane: hvordan en enkelt ruter ser på en pakke og slenger
        den ut på riktig lenke. Men hvor kommer forwarding-tabellen fra? Det er control-plane sin
        jobb. Det finnes to fundamentalt ulike måter å løse den på.
      </p>

      <Defs
        items={[
          {
            term: "Data-plane",
            body: "Per-pakke logikken inni hver ruter — slå opp destinasjon, modifiser TTL, send på rett ut-port. Skjer på nanosekund-nivå i dedikert hardware (ASIC).",
          },
          {
            term: "Control-plane",
            body: "Logikken som bygger og oppdaterer forwarding-tabellene. Skjer på millisekund-til-sekund-nivå, vanligvis i software. Tar input (topologi, kostnader, policy) og produserer en tabell som data-plane kan bruke.",
          },
          {
            term: "Distribuert control-plane",
            body: "Hver ruter kjører en routing-algoritme lokalt og snakker bare med naboer. Beslutninger bygges opp gjennom melding-utveksling — ingen sentral autoritet. OSPF og BGP er distribuerte. Historisk modell — robust mot at én node faller.",
          },
          {
            term: "Sentralisert (SDN) control-plane",
            body: "En logisk sentral controller har global oversikt over topologien og beregner forwarding-tabeller for alle switcher. Pusher tabellene ned via en standard API (typisk OpenFlow). Switcher er enkle — bare data-plane.",
          },
          {
            term: "Routing vs forwarding",
            body: "Forwarding er den raske per-pakke-handlingen. Routing er den tregere prosessen som finner stier gjennom nettet og bygger forwarding-tabellen. Et fly bruker forwarding (sjekk billett, send til gate); flyselskapet planlegger ruter — det er routing.",
          },
          {
            term: "Konvergens",
            body: "Tiden det tar fra topologien endres (lenke nede, ny ruter på) til alle rutere har oppdaterte, konsistente forwarding-tabeller. Under konvergens kan pakker bli droppet eller gå i sirkler. Kort konvergens-tid er en hovedutfordring.",
          },
        ]}
      />

      <Illustration caption="Distribuert control-plane: hver ruter regner selv. SDN control-plane: én controller regner for alle.">
        <ControlPlaneCompareSvg />
      </Illustration>

      <Example title="Eksempel: lenke faller — distribuert vs SDN">
        <p>Lenken mellom R3 og R4 ryker.</p>
        <ul className="list-disc pl-5 mt-1">
          <li>
            <strong>Distribuert (OSPF):</strong> R3 og R4 oppdager tap via hello-timeout (typisk ~40
            s default, kan trimmes ned til ~1 s). Begge flooder en LSA (link-state advertisement)
            til hele AS. Hver ruter kjører Dijkstra på nytt. Konvergens-tid: sekunder, kanskje
            10-tals sekunder hvis AS-et er stort.
          </li>
          <li>
            <strong>SDN:</strong> R3 sender event til controlleren med en gang. Controlleren har
            full topologi, regner ny forwarding-tabell, pusher ned til alle switcher.
            Konvergens-tid: titalls millisekunder.
          </li>
        </ul>
        <p className="mt-2">
          SDN er raskere fordi koordineringen er sentralisert — men hvis controlleren dør, er hele
          nettet rammet. Distribuert er tregere men har ingen single point of failure.
        </p>
      </Example>

      <RelatedSlugs slugs={["dte2507-ruting"]} />
    </article>
  );
}

// ============================================================
// 5.2 — Routing-algoritmer
// ============================================================
function Section52() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="5.2" title="Routing-algoritmer — link-state og distance-vector" />

      <p className="text-muted-foreground">
        Distribuert routing bygger på to klassiske algoritmer fra grafteorien. Link-state er
        Dijkstra med global oversikt; distance-vector er Bellman-Ford med kun nabo-info. De har
        ulike svakheter — særlig distance-vector sin count-to-infinity.
      </p>

      <Defs
        items={[
          {
            term: "Link-state (LS)",
            body: "Hver ruter måler kostnaden til sine direkte naboer og flooder denne info til hele AS. Etter en stund har alle rutere identisk kart over nettet, og kjører Dijkstra lokalt. Konvergerer raskt og deterministisk. Brukes av OSPF og IS-IS.",
          },
          {
            term: "Dijkstras algoritme",
            body: "Klassisk shortest-path: hold en mengde N med noder med kjent korteste avstand. Start med kilde-noden, avstand 0. I hvert steg: ta noden med lavest tentativ avstand utenfor N, legg den til N, og oppdater naboenes tentative avstander. Stopp når alle noder er i N.",
          },
          {
            term: "Distance-vector (DV)",
            body: "Hver ruter holder en tabell: «for hver destinasjon, min beste estimerte avstand og hvilken nabo den går via». Sender tabellen til naboer. Når en nabo sender info som forbedrer egen tabell, oppdaterer du og sender videre. Brukes av RIP (legacy).",
          },
          {
            term: "Bellman-Ford-likningen",
            body: "Kjernen i DV: d_x(y) = min over alle naboer v av {c(x,v) + d_v(y)}. «Min kost fra x til y er det minste av (kost til nabo) + (nabos kost til y), valgt over alle naboer».",
          },
          {
            term: "Count-to-infinity",
            body: "DV sin akilleshæl: når en lenke ryker, kan rutere fortsette å bytte stadig økende avstander basert på utdaterte naboer som peker tilbake på deg. Skalerer dårlig — kan ta titalls iterasjoner før alle innser at destinasjon er uoppnåelig.",
          },
          {
            term: "Split horizon + poisoned reverse",
            body: "DV-hacks for å bremse count-to-infinity. Split horizon: ikke annonser en rute til den naboen du selv lærte ruten fra. Poisoned reverse: annonser tilbake at avstanden er ∞. Hjelper for 2-rutere-loops, men ikke for større.",
          },
          {
            term: "Konvergens-egenskaper",
            body: "LS: ~O(N² log N) regnetid, konvergerer raskt, alle ser samme topologi. DV: lokal info, lite minne, men dårlig konvergens og potensielle loops. Det er hovedgrunnen til at moderne intra-AS-protokoller bruker LS.",
          },
        ]}
      />

      <Illustration caption="Dijkstra på en 5-node graf: i hvert steg legges noden med lavest tentativ avstand inn i shortest-path-treet.">
        <DijkstraSvg />
      </Illustration>

      <Example title="Eksempel: count-to-infinity i en 3-ruter-loop">
        <p>
          A — B — C med lenker av kost 1. C ser destinasjon X gjennom B med kost 2 (X — A — B — C).
          Lenken A—B ryker.
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>B oppdager at A er borte. Men C annonserer fortsatt «X koster 2 via meg».</li>
          <li>B tror: jeg kan nå X gjennom C, kost = 1 + 2 = 3. Oppdaterer.</li>
          <li>
            C ser nå at B sin avstand til X er 3. Min vei (gjennom B) blir 1 + 3 = 4. Oppdaterer.
          </li>
          <li>
            B sier 5, C sier 6, ... og slik fortsetter de til kostnaden treffer en grense som tolkes
            som ∞ (typisk 16 i RIP).
          </li>
        </ul>
        <p className="mt-2">
          Hadde det bare vært to rutere, ville poisoned reverse stoppet dette umiddelbart. Med tre
          eller flere blir det vanskeligere — derav navnet «count-to-infinity».
        </p>
      </Example>

      <RelatedSlugs
        slugs={["dte2507-ruting", "dte2507-ospf-dijkstra", "dte2507-count-to-infinity"]}
      />
    </article>
  );
}

// ============================================================
// 5.3 — OSPF
// ============================================================
function Section53() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="5.3" title="Intra-AS ruting — OSPF" />

      <p className="text-muted-foreground">
        Internett deles inn i autonome systemer (AS). Innenfor ett AS — typisk et selskap, et
        universitet, eller en ISP — kjøres en intra-AS protokoll. Den vanligste er OSPF (Open
        Shortest Path First), en link-state-protokoll basert på Dijkstra.
      </p>

      <Defs
        items={[
          {
            term: "Autonomt system (AS)",
            body: "En samling rutere under én administrativ enhet med en sammenhengende routing-policy. Hver AS har et unikt 32-bits AS-nummer (ASN). Internett er ~75 000 AS-er som kommuniserer via BGP.",
          },
          {
            term: "OSPF",
            body: "RFC 2328. Hver ruter måler kostnad til naboer (typisk omvendt proporsjonal med båndbredde), flooder denne info som LSA-er, bygger lokalt topologi-databasen, og kjører Dijkstra for å fylle forwarding-tabellen.",
          },
          {
            term: "LSA (Link-State Advertisement)",
            body: "Meldingen OSPF-rutere sender til hverandre med info om sine egne lenker: «jeg er R3, mine naboer er R2 (kost 5), R4 (kost 1), R7 (kost 3)». Flooded til alle rutere i samme area.",
          },
          {
            term: "Flooding",
            body: "Hvordan LSA-er distribueres: når en ruter mottar en ny LSA, sender den ut på alle andre porter. Sekvens-numre i LSA-en hindrer evig sirkulering. Resultatet er at hver ruter eventuelt har samme topologi-database.",
          },
          {
            term: "Areas",
            body: "OSPF deler et stort AS i mindre areas for skalering. LSA-flooding er begrenset til samme area. Area 0 (backbone) binder de andre sammen. Ruting innenfor area er via Dijkstra; mellom areas via area border routers (ABR).",
          },
          {
            term: "Hello-protokollen",
            body: "Naboer sender hello-pakker hvert 10. sekund (default). Hvis tre på rad mangler (dead-interval, 40 s), antas naboen død og lenken merkes nede. Trigger ny LSA og full reconvergence.",
          },
          {
            term: "Funksjoner utover Dijkstra",
            body: "OSPF har autentisering av nabopakker (mot spoofing), støtter ECMP (equal-cost multipath — load-balance over flere stier av samme kost), og IPv6-variant (OSPFv3).",
          },
        ]}
      />

      <Illustration caption="Et AS delt i tre OSPF-areas. Area 0 (backbone) binder area 1 og area 2 via ABR-er.">
        <OspfAreasSvg />
      </Illustration>

      <Example title="Eksempel: konvergens i et lite OSPF-AS">
        <p>Et universitets-AS har 8 rutere. Lenken mellom R4 og R5 ryker kl. 12:00:00.</p>
        <ol className="list-decimal pl-5 mt-1">
          <li>12:00:00 — kabel ryker. R4 og R5 venter på neste hello fra hverandre.</li>
          <li>12:00:10 — første hello uteblir. Ikke død ennå.</li>
          <li>12:00:40 — dead-interval utløpt. R4 og R5 ser hverandre som nede.</li>
          <li>12:00:40 — begge sender oppdatert LSA: «min nabo-lenke til X er borte».</li>
          <li>12:00:40.1 — flooded gjennom hele AS-et på ~100 ms.</li>
          <li>
            12:00:40.2 — hver ruter kjører Dijkstra på nytt topologi-databasen, ny forwarding-tabell
            installert.
          </li>
        </ol>
        <p className="mt-2">
          Mesteparten av forsinkelsen (40 s) er hello-deteksjon. Mange operatører setter
          hello-intervallet til 1 s og dead-intervallet til 3 s for raskere konvergens, på
          bekostning av litt mer kontroll-trafikk.
        </p>
      </Example>

      <RelatedSlugs slugs={["dte2507-ospf-dijkstra"]} />
    </article>
  );
}

// ============================================================
// 5.4 — BGP
// ============================================================
function Section54() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="5.4" title="Inter-AS ruting — BGP" />

      <p className="text-muted-foreground">
        BGP (Border Gateway Protocol) er protokollen som limer internettet sammen. Den lar AS-er
        annonsere «jeg kan nå dette prefikset» til hverandre, og lar hver AS bruke egne policyer for
        å velge mellom flere mulige stier. BGP er ikke shortest-path — det er policy-basert.
      </p>

      <Defs
        items={[
          {
            term: "eBGP vs iBGP",
            body: "eBGP (external) snakkes mellom rutere i ulike AS-er — annonserer prefiks på tvers av AS-grenser. iBGP (internal) snakkes mellom rutere innenfor samme AS — distribuerer eksternt lærte rute-info inn til alle border-rutere.",
          },
          {
            term: "Prefiks-annonsering",
            body: "Et AS forteller naboene sine: «trafikk til IP-prefikset 129.242.0.0/16 skal til meg». Naboer videresender annonseringen, ofte med sitt eget AS lagt til AS_PATH. Slik propagerer info om hvem som eier hva.",
          },
          {
            term: "AS_PATH",
            body: "Lista over AS-er en annonsering har passert. Brukes både som loop-prevent (et AS vil aldri akseptere en annonsering der eget AS allerede står) og som tie-breaker i ruteseleksjon (kortere er bedre).",
          },
          {
            term: "LOCAL_PREF",
            body: "Det første og sterkeste tie-breaker-attributtet. Lokalt valgt — kun gyldig innenfor eget AS. Lar en ISP foretrekke en kunde-rute over en peer-rute, selv om peer-stien er kortere. Høyere LOCAL_PREF vinner.",
          },
          {
            term: "MED (Multi-Exit Discriminator)",
            body: "Et hint en AS gir naboene sine: «hvis du har flere lenker til meg, foretrekk lenken med lavere MED». Brukes når to AS-er har flere peerings og vil styre hvor trafikk slipper ut. Lavere er bedre.",
          },
          {
            term: "NEXT_HOP",
            body: "IP-adressen til den siste eBGP-talker langs ruten. Inni eget AS bruker rutere iBGP til å fortelle hverandre om NEXT_HOP og IGP-en (OSPF) for å finne vei dit.",
          },
          {
            term: "Rute-seleksjons-algoritmen",
            body: "BGP-rangerings-rekken: (1) høyeste LOCAL_PREF, (2) korteste AS_PATH, (3) laveste origin-type, (4) laveste MED, (5) prefer eBGP over iBGP, (6) lavest IGP-kost til NEXT_HOP, (7) tie-breaker på router-ID. Strengt prioritert.",
          },
        ]}
      />

      <Illustration caption="To AS-er som peerer, hvert med flere kunder. AS_PATH bygges opp ved hver eBGP-grense.">
        <BgpTopologySvg />
      </Illustration>

      <Example title="Eksempel: AS3 velger mellom 3 stier til 8.8.8.0/24">
        <p>AS3 har lært tre forskjellige stier til prefikset 8.8.8.0/24:</p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>Sti A via AS1: LOCAL_PREF=100, AS_PATH=[1, 5, 8], MED=20</li>
          <li>Sti B via AS2: LOCAL_PREF=200, AS_PATH=[2, 8], MED=50</li>
          <li>Sti C via AS4: LOCAL_PREF=200, AS_PATH=[4, 8], MED=10</li>
        </ul>
        <ol className="list-decimal pl-5 mt-2">
          <li>
            <strong>LOCAL_PREF</strong>: A=100, B og C=200. A elimineres. (B og C er kunder eller
            foretrukne peers.)
          </li>
          <li>
            <strong>AS_PATH-lengde</strong>: B og C har begge lengde 2. Uavgjort.
          </li>
          <li>
            <strong>MED</strong>: B=50, C=10. C vinner.
          </li>
        </ol>
        <p className="mt-2">
          Merk: shortest-path ville valgt B eller C uten å bry seg om LOCAL_PREF. BGP velger basert
          på policy først — det er hvordan AS-er håndhever forretnings-relasjoner i ruting.
        </p>
      </Example>

      <RelatedSlugs slugs={["dte2507-bgp-stige"]} />
    </article>
  );
}

// ============================================================
// 5.5 — SDN
// ============================================================
function Section55() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="5.5" title="SDN control-plane — OpenFlow og logisk sentralisering" />

      <p className="text-muted-foreground">
        Software-Defined Networking flytter control-plane ut av hver switch og inn i en logisk
        sentral controller. Switchen reduseres til en programmerbar match-action-tabell. Modellen
        vant i datasentre fordi den passer perfekt med hvordan store cloud-aktører tenker —
        infrastruktur som software.
      </p>

      <Defs
        items={[
          {
            term: "SDN-arkitektur",
            body: "Tre lag: (1) infrastruktur-laget (dumme switcher med flow-tabeller); (2) controller-laget (kjører som software-cluster, holder global topologi); (3) applikasjons-laget (load-balancing, firewall, traffic-engineering — egne programmer mot controlleren).",
          },
          {
            term: "OpenFlow",
            body: "Den første og mest kjente sør-bound API-en (controller ↔ switch). Definerer melding-formater for å installere flow-entries, lese statistikker, og motta pakke-events. Andre alternativer i dag: P4, gNMI, NETCONF.",
          },
          {
            term: "Flow-entry",
            body: "Én rad i flow-tabellen: match-felter (IP-src, IP-dst, port osv) + action (forward port X, drop, send-til-controller, modify). Switchen sjekker hver pakke mot tabellen og utfører første matchende action.",
          },
          {
            term: "Match-action-paradigmet",
            body: "Generalisert forwarding: ikke bare IP-prefiks, men hva som helst i headerne. En flow-entry kan matche på TCP-port + VLAN + MAC samtidig. Gir mye mer fleksibilitet enn klassisk IP-forwarding.",
          },
          {
            term: "Logisk vs fysisk sentralisering",
            body: "Controlleren er logisk sentral (én abstraksjon) men kjører ofte som distribuert cluster bak kulissene, av oppetid- og skaleringsgrunner. Bruker konsensus-protokoller som Raft eller Zookeeper for å holde state synkronisert.",
          },
          {
            term: "Nord-bound vs sør-bound API",
            body: "Nord-bound: controller → applikasjon (typisk REST). Sør-bound: controller → switch (OpenFlow, P4). Skillet lar deg bytte ut switch-leverandør uten å endre apps.",
          },
          {
            term: "Hvorfor SDN vant i datasentre",
            body: "Datasentre eier alt utstyret, har homogene policy-behov, og verdsetter rask reconfiguration (VM-flytting, multi-tenancy, micro-segmentation). I et globalt internett med 75 000 AS-er ville én sentral controller vært umulig — derfor bruker fortsatt internet-core BGP.",
          },
        ]}
      />

      <Illustration caption="OpenFlow-melding fra controller til switch installerer en ny flow-entry. Pakker som matcher får valgt action.">
        <OpenFlowSvg />
      </Illustration>

      <Example title="Eksempel: load balancer som SDN-app">
        <p>
          Et datasenter har 5 webservere bak én virtuell IP (10.0.0.100). Trafikken skal fordeles
          round-robin.
        </p>
        <ol className="list-decimal pl-5 mt-1">
          <li>Klient sender SYN til 10.0.0.100:443.</li>
          <li>
            Pakken treffer en SDN-switch. Ingen flow-entry matcher → switch sender PACKET_IN til
            controlleren.
          </li>
          <li>
            Controlleren kjører load-balancer-appen. Velger neste server (f.eks. 10.1.2.34), og
            installerer to flow-entries i switchen: én for klient → server (rewrite dst-IP), én for
            server → klient (rewrite src-IP).
          </li>
          <li>
            Resten av forbindelsen treffer flow-entries direkte i hardware — full throughput, ingen
            kommunikasjon med controller.
          </li>
        </ol>
        <p className="mt-2">
          Sammenlign med tradisjonell ruter: load-balancing måtte gjøres i en egen dedikert
          appliance. SDN gjør switchen selv til en programmerbar plattform.
        </p>
      </Example>

      <RelatedSlugs slugs={["dte2507-ruting"]} />
    </article>
  );
}

// ============================================================
// 5.6 — ICMP
// ============================================================
function Section56() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="5.6" title="ICMP — feilmeldinger og diagnostikk" />

      <p className="text-muted-foreground">
        ICMP (Internet Control Message Protocol) er IP sin egen feilmeldings-protokoll. Den lar
        rutere si fra om problemer («destinasjon ikke nåbar», «TTL utløpt») og er motoren bak ping
        og traceroute.
      </p>

      <Defs
        items={[
          {
            term: "ICMP-meldinger",
            body: "Klassifiseres med type og kode. Hver melding er pakket i et IP-datagram (protocol-number 1). Ikke en transportlag-protokoll, men en host-til-host kontrollkanal som lever oppå IP.",
          },
          {
            term: "Echo Request / Echo Reply (type 8 / 0)",
            body: "Ping bruker disse: Echo Request sendes til en destinasjon; den svarer med Echo Reply. Måler RTT og verifiserer reachability. Inneholder identifier og sekvens-nummer for å matche par.",
          },
          {
            term: "Destination Unreachable (type 3)",
            body: "Ruter sender denne tilbake til kilden hvis den ikke kan levere pakken. Koden forteller hvorfor: kode 0 (network unreachable), 1 (host), 3 (port), 4 (fragmentation needed, DF set), osv.",
          },
          {
            term: "Time Exceeded (type 11)",
            body: "Ruter dekrementerer TTL i hver IP-pakke. Når TTL når 0, kastes pakken og en ICMP Time Exceeded sendes tilbake. Hjelper å unngå evige loops. Trick brukt av traceroute.",
          },
          {
            term: "Redirect (type 5)",
            body: "Ruter sier til en host: «du sender til feil first-hop — bruk denne andre i stedet». Sjelden brukt i moderne nett (deaktivert pga sikkerhet — kan brukes til man-in-the-middle).",
          },
          {
            term: "Ping-mekanikken",
            body: "Send Echo Request, vent på Echo Reply, mål tiden. Sekvens-nummer i hver request lar deg telle pakketap. Default 56 byte payload + 8 byte ICMP-header.",
          },
          {
            term: "Traceroute-mekanikken",
            body: "Send UDP-pakker (eller ICMP Echo) til destinasjon med stigende TTL: 1, 2, 3, ... Ruter på hopp N kaster TTL=N-pakken og sender Time Exceeded tilbake. Kildens stack registrerer hver responder. Slik kartlegges stien hopp for hopp.",
          },
        ]}
      />

      <Illustration caption="Traceroute: pakker med TTL 1, 2, 3 trigger Time Exceeded fra hver ruter underveis.">
        <TracerouteSvg />
      </Illustration>

      <Example title="Eksempel: traceroute til uit.no fra hjemmenettet">
        <p className="font-mono text-[12px]">
          $ traceroute uit.no
          <br />
          1 homeruter.local (192.168.1.1) 1.2 ms
          <br />
          2 isp-gw-1 (10.20.1.1) 4.5 ms
          <br />
          3 isp-core-bgn (185.45.x.x) 6.1 ms
          <br />
          4 uninett-osl (158.39.x.x) 9.4 ms
          <br />
          5 uninett-tos (158.39.y.y) 18.2 ms
          <br />
          6 uit-edge (129.242.x.x) 19.1 ms
          <br />7 uit.no (129.242.20.6) 19.3 ms
        </p>
        <p className="mt-2">
          Hver linje er en ruter som svarte med ICMP Time Exceeded. Hoppene 4–5 viser
          forskningsnettet UNINETT. Forsinkelses-sprang mellom 3 og 4 (~3 ms til ~10 ms) viser
          fysisk geografisk avstand som vokser.
        </p>
      </Example>

      <RelatedSlugs slugs={["dte2507-ruting"]} />
    </article>
  );
}

// ============================================================
// 5.7 — DHCP
// ============================================================
function Section57() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="5.7" title="DHCP — dynamisk IP-tildeling" />

      <p className="text-muted-foreground">
        Når mobilen din kobler seg til WiFi-en, har den ennå ingen IP-adresse. DHCP (Dynamic Host
        Configuration Protocol) er hvordan den får tildelt en — uten manuell konfigurasjon. Hele
        utvekslingen kalles DORA: Discover, Offer, Request, Acknowledge.
      </p>

      <Defs
        items={[
          {
            term: "DHCP-server",
            body: "Tjener som administrerer en pool av IP-adresser og leier dem ut til klienter. På et hjemme-nett kjører DHCP-serveren typisk inni hjemmeruteren; på bedriftsnett er den ofte en egen maskin.",
          },
          {
            term: "DHCP Discover (type 1)",
            body: "Klient broadcaster en pakke på link-laget: «er det noen DHCP-server her?». Bruker source 0.0.0.0 og destination 255.255.255.255 (broadcast). Inneholder klientens MAC-adresse.",
          },
          {
            term: "DHCP Offer (type 2)",
            body: "Server svarer med et tilbud: «du kan få adresse 192.168.1.42 i 24 timer. Default gateway er 192.168.1.1. DNS er 8.8.8.8». Også broadcastet siden klienten ennå ikke har IP.",
          },
          {
            term: "DHCP Request (type 3)",
            body: "Klient velger ett av tilbudene (kan være flere servere) og broadcaster et formelt request. Inneholder den ønskede IP-en og server-ID. Andre servere som ga tilbud trekker dem tilbake.",
          },
          {
            term: "DHCP Ack (type 5)",
            body: "Valgt server bekrefter: «ja, du eier 192.168.1.42 inntil videre». Etter dette kan klienten begynne å bruke adressen, sende ARP-spørringer, snakke med default gateway osv.",
          },
          {
            term: "Lease og fornyelse",
            body: "Tildelingen er midlertidig (typisk 24 timer på hjemmenett, kortere på offentlig WiFi). Klienten fornyer halvveis i lease-perioden — sender Request direkte til server (unicast) uten ny Discover.",
          },
          {
            term: "DHCP utover IP-en",
            body: "Server kan levere mange flere parametere: subnet-mask, default gateway, DNS-servere, NTP-server-adresser, domain-suffix, og praktisk talt et hvilket som helst konfigurasjons-felt definert i DHCP-opsjonene.",
          },
        ]}
      />

      <Illustration caption="DORA: fire broadcasts mellom klient og server gir klienten en IP-adresse på under et sekund.">
        <DhcpDoraSvg />
      </Illustration>

      <Example title="Eksempel: kafé-WiFi DHCP-leie">
        <p>Du åpner mobilen på en kafé:</p>
        <ol className="list-decimal pl-5 mt-1">
          <li>
            <strong>00:00.000</strong> — mobilen kobler til SSID. Sender DHCPDISCOVER på broadcast.
          </li>
          <li>
            <strong>00:00.050</strong> — kafé-ruteren svarer med DHCPOFFER: IP 10.0.0.187, mask /24,
            gateway 10.0.0.1, DNS 1.1.1.1, lease 3600 s.
          </li>
          <li>
            <strong>00:00.080</strong> — mobilen sender DHCPREQUEST.
          </li>
          <li>
            <strong>00:00.100</strong> — server sender DHCPACK. Mobilen har nå nett-tilgang.
          </li>
          <li>
            <strong>00:30:00</strong> — halvveis i lease (1800 s). Mobil sender Renewal-Request
            unicast direkte til serveren. Ack tilbake — leien forlenges en time til.
          </li>
        </ol>
        <p className="mt-2">
          Hele oppsettet tar typisk 100–200 ms, og du merker det aldri. Hvis serveren ikke svarer,
          prøver mobilen en lite antall ganger før den tar i bruk en link-local-adresse
          (169.254.x.x) som faller-back, eller bare gir opp.
        </p>
      </Example>

      <RelatedSlugs slugs={["dte2507-dhcp"]} />
    </article>
  );
}

// ============================================================
// 5.8 — Oppgaver
// ============================================================
function Section58() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="5.8" title="Oppgaver" />
      <p className="text-muted-foreground">
        Sjekk forståelsen din. Hvert problem her er bygget for å være øvelses-versjonen av et
        eksamens-spørsmål — prøv selv før du åpner svaret.
      </p>

      <Exercise
        question={
          <>
            <p>Gitt grafen: noder A, B, C, D, E. Lenkene har følgende kostnader:</p>
            <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
              <li>A—B: 2, A—C: 5, A—D: 1</li>
              <li>B—C: 3, B—E: 4</li>
              <li>C—E: 2, C—D: 3</li>
              <li>D—E: 6</li>
            </ul>
            <p className="mt-1">
              Kjør Dijkstra fra A. Lag tabell med (avstand, forgjenger) for hver node etter hvert
              steg, og oppgi shortest-path-treet til slutt.
            </p>
          </>
        }
        hint="Start med d(A)=0, alle andre ∞. I hvert steg: velg den noden utenfor N med lavest tentativ, legg den til N, oppdater naboer."
        answer={
          <>
            <p className="font-mono text-[12px]">
              Init: A=0, B=∞, C=∞, D=∞, E=∞. N={"{}"}
              <br />
              Steg 1 (legg A): N={"{A}"}. Naboer: B=2(A), C=5(A), D=1(A).
              <br />
              Steg 2 (legg D, min=1): N={"{A,D}"}. Oppdater C via D: 1+3=4. C=4(D).
              <br />
              Steg 3 (legg B, min=2): N={"{A,D,B}"}. C via B: 2+3=5, ikke bedre. E via B: 2+4=6.
              E=6(B).
              <br />
              Steg 4 (legg C, min=4): N={"{A,D,B,C}"}. E via C: 4+2=6, like — behold E=6(B) (eller
              C, valgfritt).
              <br />
              Steg 5 (legg E, min=6): ferdig.
            </p>
            <p className="mt-1">
              <strong>SPT-kanter fra A:</strong> A—D (1), A—B (2), D—C (4), B—E (6). Total kost: 13.
            </p>
          </>
        }
      />

      <Exercise
        question="Distance-vector: A — B — C med lenker av kost 1 mellom hver. Alle er i steady state. Lenken B—C ryker. Vis tabellene til A og B i hver iterasjon, og forklar hvor lang tid count-to-infinity vil ta hvis bare split horizon (ikke poisoned reverse) er aktiv. Hva endrer poisoned reverse?"
        hint="Steady state: A's tabell sier (B:1, C:2 via B). B's tabell sier (A:1, C:1). Etter B—C ryker, hvem tror fortsatt C er nåbar?"
        answer={
          <>
            <p>
              <strong>Steady state:</strong> A.tabell = {"{B:1, C:2 via B}"}; B.tabell ={" "}
              {"{A:1, C:1}"}.
            </p>
            <p className="mt-1">
              B—C ryker. B oppdager direkte og setter C=∞. Med <em>split horizon</em>: B annonserer
              ikke C til A (siden B lærte C fra ingen — det er sin egen lenke). Men i steady state
              har A allerede annonsert «C:2 via B» tilbake. Det skal ikke skje med ren split horizon
              mot A. La oss anta motsatt scenario: A — B — C der A lærte C gjennom B.
            </p>
            <p className="mt-1">
              <strong>Med kun split horizon:</strong> A annonserer ikke «C:2» tilbake til B (siden A
              lærte det fra B). Når B-C ryker, vet B umiddelbart at C=∞, og A vil eventuelt timeoute
              sin C-rute. Ingen count-to-infinity i dette 2-ruter-tilfellet.
            </p>
            <p className="mt-1">
              <strong>Med poisoned reverse:</strong> A annonserer aktivt «C:∞» til B, så B vet
              umiddelbart at A ikke har noen alternativ vei. Begge konvergerer på første iterasjon —
              typisk 30 s standard DV-intervall.
            </p>
            <p className="mt-1">
              I et større loop (A—B—C—D) hjelper hverken split horizon eller poisoned reverse fullt
              — du kan fortsatt få count-to-infinity gjennom en 3-cycle. Det er derfor moderne nett
              bruker link-state.
            </p>
          </>
        }
      />

      <Exercise
        question={
          <>
            <p>BGP: AS5 mottar 3 stier til prefikset 198.51.100.0/24. Hvilken velger den?</p>
            <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
              <li>
                Sti 1 (via AS2): LOCAL_PREF=150, AS_PATH=[2, 8, 12], MED=20, NEXT_HOP IGP-kost=5
              </li>
              <li>
                Sti 2 (via AS3): LOCAL_PREF=200, AS_PATH=[3, 9, 12], MED=15, NEXT_HOP IGP-kost=8
              </li>
              <li>Sti 3 (via AS4): LOCAL_PREF=200, AS_PATH=[4, 12], MED=30, NEXT_HOP IGP-kost=3</li>
            </ul>
          </>
        }
        hint="Gå gjennom BGP-rekken én etter én: LOCAL_PREF → AS_PATH-lengde → origin → MED → eBGP-vs-iBGP → IGP-kost."
        answer={
          <>
            <ol className="list-decimal pl-5">
              <li>
                <strong>LOCAL_PREF:</strong> Sti 1 har 150, Sti 2 og 3 har 200. Sti 1 elimineres.
              </li>
              <li>
                <strong>AS_PATH-lengde:</strong> Sti 2 har lengde 3, Sti 3 har lengde 2. Sti 3
                vinner.
              </li>
            </ol>
            <p className="mt-2">
              <strong>Svar: Sti 3 (via AS4).</strong>
            </p>
            <p className="mt-1">
              Vi trengte aldri å sjekke MED eller IGP-kost. AS_PATH-lengden var nok. Merk at MED-en
              på Sti 3 (30) er den dårligste — men det spiller ingen rolle siden AS_PATH-trinnet
              brytes før MED-trinnet. Det er hvorfor MED ofte ikke har den effekten naive
              nett-operatører tror.
            </p>
          </>
        }
      />

      <Exercise
        question="SDN: forklar hvorfor en logisk sentralisert controller er praktisk i et datasenter, men ikke gjennomførbart for hele det globale internett. Nevn minst 3 grunner."
        hint="Tenk skala, eierskap, policy-konflikter, latens, tillit."
        answer={
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Eierskap.</strong> Et datasenter eies av én aktør (Google, AWS). Internett
              eies av ~75 000 ulike AS-er med konkurrerende interesser — ingen av dem ville gi opp
              ruting-autonomi til en sentral part.
            </li>
            <li>
              <strong>Policy-konflikter.</strong> AS-er har forretningsavtaler (peering, transit,
              kunde-relasjoner) som styrer ruting-beslutninger. En global controller ville måtte
              kjenne og respektere alle disse — politisk umulig.
            </li>
            <li>
              <strong>Skala og latens.</strong> En global controller måtte håndtere milliarder av
              flows. Latens fra noen rutere på en annen kontinent til controlleren ville være
              titalls millisekunder — for sakte for hardware-forwarding-beslutninger.
            </li>
            <li>
              <strong>Tillit og sikkerhet.</strong> Sentral controller = sentral angreps-overflate.
              Å kompromittere internett-ruting ville være katastrofalt. Distribuert BGP gir
              isolasjon — ett AS som blir kompromittert påvirker bare egen domene.
            </li>
            <li>
              <strong>Heterogenitet.</strong> Datasenter-utstyr er homogent (samme switch-modell,
              samme firmware). Internett består av tiår-gammelt utstyr fra hundrevis av leverandører
              som aldri ville talt OpenFlow alle sammen.
            </li>
          </ul>
        }
      />

      <Exercise
        question="DHCP og ICMP: en bruker rapporterer at «WiFi er på, men ingen nettsider laster». Beskriv hvordan du diagnostiserer fra terminalen ved å bruke ipconfig/ifconfig, ping og traceroute. Hva forteller hvert verktøy deg om hvor problemet sitter?"
        hint="Sjekk først om DHCP virket (har du IP?). Så sjekk om du når default gateway. Så DNS. Så ekstern host."
        answer={
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              <strong>Sjekk IP-adresse:</strong> <code className="font-mono">ipconfig</code> /{" "}
              <code className="font-mono">ifconfig</code>. Hvis du har 169.254.x.x → DHCP feilet
              (link-local fallback). Hvis du har 0.0.0.0 → ingen tilkobling. Hvis du har en vanlig
              IP (f.eks. 192.168.1.42) → DHCP virket.
            </li>
            <li>
              <strong>Ping default gateway:</strong>{" "}
              <code className="font-mono">ping 192.168.1.1</code>. Hvis det feiler → lokalt nett
              eller WiFi-radio-problem (kanskje du er på feil SSID). Hvis det virker → lokal link er
              OK.
            </li>
            <li>
              <strong>Ping ekstern IP:</strong> <code className="font-mono">ping 8.8.8.8</code>.
              Hvis det feiler → ISP-problem eller default route mangler. Hvis det virker → IP-laget
              er OK helt ut.
            </li>
            <li>
              <strong>Ping ekstern host ved navn:</strong>{" "}
              <code className="font-mono">ping google.com</code>. Hvis IP virket men navn ikke →
              DNS-problem (DHCP ga deg en død DNS-server, eller DNS-serveren er nede).
            </li>
            <li>
              <strong>Traceroute:</strong> <code className="font-mono">traceroute google.com</code>.
              Hvis det stopper ved hopp 2 (ISP-grensen) → ISP har trøbbel. Hvis det går videre og
              dør senere → den fjerne enden er nede eller filtrerer ICMP.
            </li>
          </ol>
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

function ControlPlaneCompareSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      {/* Left: distribuert */}
      <text
        x={110}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Distribuert (OSPF/BGP)
      </text>
      {[
        [60, 60],
        [160, 60],
        [60, 140],
        [160, 140],
      ].map(([x, y], i) => (
        <g key={`d${i}`}>
          <circle cx={x} cy={y} r={18} className="fill-card stroke-brand" strokeWidth={2} />
          <text
            x={x}
            y={y + 4}
            textAnchor="middle"
            className="fill-foreground text-[9px] font-semibold"
          >
            R{i + 1}
          </text>
          <rect
            x={x - 14}
            y={y + 22}
            width={28}
            height={8}
            className="fill-brand/30 stroke-brand"
            strokeWidth={0.5}
          />
          <text x={x} y={y + 28.5} textAnchor="middle" className="fill-foreground text-[5px]">
            algo
          </text>
        </g>
      ))}
      <line x1={60} y1={60} x2={160} y2={60} className="stroke-foreground/40" strokeWidth={1.5} />
      <line x1={60} y1={140} x2={160} y2={140} className="stroke-foreground/40" strokeWidth={1.5} />
      <line x1={60} y1={60} x2={60} y2={140} className="stroke-foreground/40" strokeWidth={1.5} />
      <line x1={160} y1={60} x2={160} y2={140} className="stroke-foreground/40" strokeWidth={1.5} />
      <line
        x1={60}
        y1={60}
        x2={160}
        y2={140}
        className="stroke-foreground/40"
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      <text x={110} y={195} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        Hver ruter regner selv. Snakker bare med naboer.
      </text>
      <text x={110} y={208} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        Ingen sentral autoritet.
      </text>

      {/* Right: SDN */}
      <text
        x={380}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Sentralisert (SDN)
      </text>
      <rect
        x={340}
        y={32}
        width={80}
        height={26}
        rx={4}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={2}
      />
      <text
        x={380}
        y={48}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Controller
      </text>
      {[
        [330, 110],
        [430, 110],
        [330, 170],
        [430, 170],
      ].map(([x, y], i) => (
        <g key={`s${i}`}>
          <circle cx={x} cy={y} r={14} className="fill-card stroke-success" strokeWidth={2} />
          <text x={x} y={y + 4} textAnchor="middle" className="fill-foreground text-[8px]">
            sw{i + 1}
          </text>
          <line
            x1={380}
            y1={58}
            x2={x}
            y2={y - 14}
            className="stroke-amber-500/60"
            strokeWidth={1}
            strokeDasharray="2 2"
          />
        </g>
      ))}
      <line
        x1={330}
        y1={110}
        x2={430}
        y2={110}
        className="stroke-foreground/40"
        strokeWidth={1.5}
      />
      <line
        x1={330}
        y1={170}
        x2={430}
        y2={170}
        className="stroke-foreground/40"
        strokeWidth={1.5}
      />
      <line
        x1={330}
        y1={110}
        x2={330}
        y2={170}
        className="stroke-foreground/40"
        strokeWidth={1.5}
      />
      <line
        x1={430}
        y1={110}
        x2={430}
        y2={170}
        className="stroke-foreground/40"
        strokeWidth={1.5}
      />
      <text x={380} y={208} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        Switcher er dumme. Controller har global oversikt.
      </text>
    </svg>
  );
}

function DijkstraSvg() {
  return (
    <svg viewBox="0 0 500 260" className="w-full h-auto">
      <text
        x={250}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Dijkstra fra A — shortest-path-treet (tykke kanter)
      </text>
      {/* Edges (all) */}
      <line x1={80} y1={130} x2={220} y2={70} className="stroke-success" strokeWidth={3} />
      <text x={140} y={92} className="fill-foreground text-[9px] font-mono">
        2
      </text>
      <line x1={80} y1={130} x2={220} y2={200} className="stroke-success" strokeWidth={3} />
      <text x={140} y={180} className="fill-foreground text-[9px] font-mono">
        1
      </text>
      <line
        x1={80}
        y1={130}
        x2={360}
        y2={130}
        className="stroke-muted-foreground/40"
        strokeWidth={1.5}
      />
      <text x={210} y={125} className="fill-muted-foreground text-[9px] font-mono">
        5
      </text>
      <line
        x1={220}
        y1={70}
        x2={360}
        y2={130}
        className="stroke-muted-foreground/40"
        strokeWidth={1.5}
      />
      <text x={295} y={94} className="fill-muted-foreground text-[9px] font-mono">
        3
      </text>
      <line x1={220} y1={70} x2={420} y2={200} className="stroke-success" strokeWidth={3} />
      <text x={335} y={130} className="fill-foreground text-[9px] font-mono">
        4
      </text>
      <line
        x1={360}
        y1={130}
        x2={420}
        y2={200}
        className="stroke-muted-foreground/40"
        strokeWidth={1.5}
      />
      <text x={395} y={170} className="fill-muted-foreground text-[9px] font-mono">
        2
      </text>
      <line x1={220} y1={200} x2={360} y2={130} className="stroke-success" strokeWidth={3} />
      <text x={290} y={170} className="fill-foreground text-[9px] font-mono">
        3
      </text>
      <line
        x1={220}
        y1={200}
        x2={420}
        y2={200}
        className="stroke-muted-foreground/40"
        strokeWidth={1.5}
      />
      <text x={310} y={213} className="fill-muted-foreground text-[9px] font-mono">
        6
      </text>

      {/* Nodes */}
      {[
        { x: 80, y: 130, label: "A", dist: "0" },
        { x: 220, y: 70, label: "B", dist: "2" },
        { x: 360, y: 130, label: "C", dist: "4" },
        { x: 220, y: 200, label: "D", dist: "1" },
        { x: 420, y: 200, label: "E", dist: "6" },
      ].map((n) => (
        <g key={n.label}>
          <circle cx={n.x} cy={n.y} r={18} className="fill-card stroke-brand" strokeWidth={2} />
          <text
            x={n.x}
            y={n.y + 4}
            textAnchor="middle"
            className="fill-foreground text-[12px] font-semibold"
          >
            {n.label}
          </text>
          <text
            x={n.x}
            y={n.y - 24}
            textAnchor="middle"
            className="fill-brand text-[9px] font-mono"
          >
            d={n.dist}
          </text>
        </g>
      ))}
      <text x={250} y={245} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Tykke grønne kanter er shortest-path-treet. Tall ved siden av node er korteste avstand fra
        A.
      </text>
    </svg>
  );
}

function OspfAreasSvg() {
  return (
    <svg viewBox="0 0 500 250" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        OSPF-areas innenfor ett AS
      </text>
      {/* Area 0 backbone */}
      <ellipse
        cx={250}
        cy={125}
        rx={80}
        ry={40}
        className="fill-brand/15 stroke-brand"
        strokeWidth={2}
        strokeDasharray="4 3"
      />
      <text x={250} y={108} textAnchor="middle" className="fill-brand text-[10px] font-semibold">
        Area 0 (backbone)
      </text>
      {[
        [220, 130],
        [250, 145],
        [280, 130],
      ].map(([x, y], i) => (
        <g key={`b${i}`}>
          <circle cx={x} cy={y} r={9} className="fill-card stroke-brand" strokeWidth={1.5} />
          <text x={x} y={y + 3} textAnchor="middle" className="fill-foreground text-[7px]">
            R
          </text>
        </g>
      ))}

      {/* Area 1 left */}
      <ellipse
        cx={90}
        cy={125}
        rx={65}
        ry={55}
        className="fill-success/10 stroke-success/60"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      <text x={90} y={70} textAnchor="middle" className="fill-success text-[10px] font-semibold">
        Area 1
      </text>
      {[
        [60, 110],
        [110, 95],
        [70, 150],
        [120, 155],
      ].map(([x, y], i) => (
        <g key={`a1${i}`}>
          <circle cx={x} cy={y} r={8} className="fill-card stroke-success" strokeWidth={1.5} />
        </g>
      ))}
      {/* ABR */}
      <circle
        cx={155}
        cy={130}
        r={10}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={2}
      />
      <text
        x={155}
        y={114}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[8px] font-semibold"
      >
        ABR
      </text>
      <line x1={120} y1={155} x2={155} y2={130} className="stroke-success/40" strokeWidth={1} />
      <line x1={155} y1={130} x2={220} y2={130} className="stroke-brand/40" strokeWidth={1} />

      {/* Area 2 right */}
      <ellipse
        cx={410}
        cy={125}
        rx={65}
        ry={55}
        className="fill-success/10 stroke-success/60"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      <text x={410} y={70} textAnchor="middle" className="fill-success text-[10px] font-semibold">
        Area 2
      </text>
      {[
        [380, 110],
        [430, 100],
        [395, 155],
        [440, 145],
      ].map(([x, y], i) => (
        <g key={`a2${i}`}>
          <circle cx={x} cy={y} r={8} className="fill-card stroke-success" strokeWidth={1.5} />
        </g>
      ))}
      <circle
        cx={345}
        cy={130}
        r={10}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={2}
      />
      <text
        x={345}
        y={114}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[8px] font-semibold"
      >
        ABR
      </text>
      <line x1={345} y1={130} x2={380} y2={110} className="stroke-success/40" strokeWidth={1} />
      <line x1={345} y1={130} x2={280} y2={130} className="stroke-brand/40" strokeWidth={1} />

      <text x={250} y={215} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        LSA-flooding stoppes ved ABR. Area 0 binder de andre sammen.
      </text>
    </svg>
  );
}

function BgpTopologySvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        BGP-topologi: AS-er som peerer og annonserer prefikser
      </text>
      {/* AS1 */}
      <ellipse
        cx={100}
        cy={70}
        rx={55}
        ry={28}
        className="fill-brand/15 stroke-brand"
        strokeWidth={2}
      />
      <text
        x={100}
        y={73}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        AS1
      </text>
      {/* AS2 */}
      <ellipse
        cx={250}
        cy={70}
        rx={55}
        ry={28}
        className="fill-success/15 stroke-success"
        strokeWidth={2}
      />
      <text
        x={250}
        y={73}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        AS2
      </text>
      {/* AS3 */}
      <ellipse
        cx={400}
        cy={70}
        rx={55}
        ry={28}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={2}
      />
      <text
        x={400}
        y={73}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        AS3
      </text>
      {/* AS4 (kunde) */}
      <ellipse
        cx={175}
        cy={170}
        rx={55}
        ry={28}
        className="fill-card stroke-foreground/40"
        strokeWidth={2}
      />
      <text
        x={175}
        y={173}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        AS4 (oss)
      </text>
      {/* AS5 (mål) */}
      <ellipse
        cx={400}
        cy={170}
        rx={55}
        ry={28}
        className="fill-destructive/15 stroke-destructive"
        strokeWidth={2}
      />
      <text
        x={400}
        y={166}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        AS5
      </text>
      <text
        x={400}
        y={180}
        textAnchor="middle"
        className="fill-muted-foreground text-[8px] font-mono"
      >
        198.51.100.0/24
      </text>

      {/* Peerings */}
      <line x1={155} y1={70} x2={195} y2={70} className="stroke-foreground/60" strokeWidth={2} />
      <line x1={305} y1={70} x2={345} y2={70} className="stroke-foreground/60" strokeWidth={2} />
      <line x1={175} y1={142} x2={120} y2={92} className="stroke-foreground/60" strokeWidth={2} />
      <line x1={400} y1={142} x2={400} y2={98} className="stroke-foreground/60" strokeWidth={2} />
      <line x1={230} y1={170} x2={345} y2={170} className="stroke-foreground/60" strokeWidth={2} />

      {/* Annotations: AS_PATH builds */}
      <text x={350} y={120} className="fill-amber-700 dark:fill-amber-400 text-[8px] font-mono">
        AS_PATH=[5]
      </text>
      <text x={310} y={60} className="fill-muted-foreground text-[8px] font-mono">
        +[3,5]
      </text>
      <text x={160} y={60} className="fill-muted-foreground text-[8px] font-mono">
        +[2,3,5]
      </text>
      <text x={295} y={165} className="fill-muted-foreground text-[8px] font-mono">
        sti direkte: AS_PATH=[5]
      </text>

      <text x={250} y={225} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        AS4 lærer to stier til 198.51.100.0/24: kort via AS5 direkte, eller lang via AS1.
      </text>
    </svg>
  );
}

function OpenFlowSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        OpenFlow: controller installerer flow-entry i switch
      </text>
      {/* Controller box */}
      <rect
        x={180}
        y={32}
        width={140}
        height={40}
        rx={6}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={2}
      />
      <text
        x={250}
        y={50}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        SDN Controller
      </text>
      <text x={250} y={64} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        global topologi-state
      </text>

      {/* Arrow down */}
      <line
        x1={250}
        y1={75}
        x2={250}
        y2={115}
        className="stroke-amber-500"
        strokeWidth={2}
        markerEnd="url(#arrowof)"
      />
      <defs>
        <marker
          id="arrowof"
          viewBox="0 0 10 10"
          refX={9}
          refY={5}
          markerWidth={5}
          markerHeight={5}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-amber-500" />
        </marker>
      </defs>
      <text x={260} y={95} className="fill-amber-700 dark:fill-amber-400 text-[9px] font-mono">
        FLOW_MOD
      </text>

      {/* Switch box */}
      <rect
        x={120}
        y={120}
        width={260}
        height={90}
        rx={6}
        className="fill-card stroke-success"
        strokeWidth={2}
      />
      <text
        x={250}
        y={138}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Switch — flow-tabell
      </text>
      {/* Table header */}
      <line
        x1={130}
        y1={144}
        x2={370}
        y2={144}
        className="stroke-foreground/30"
        strokeWidth={0.5}
      />
      <text x={150} y={156} className="fill-muted-foreground text-[8px] font-mono">
        match
      </text>
      <text x={270} y={156} className="fill-muted-foreground text-[8px] font-mono">
        action
      </text>
      <text x={335} y={156} className="fill-muted-foreground text-[8px] font-mono">
        counter
      </text>
      <line
        x1={130}
        y1={160}
        x2={370}
        y2={160}
        className="stroke-foreground/30"
        strokeWidth={0.5}
      />

      {/* Row 1 */}
      <text x={135} y={173} className="fill-foreground text-[8px] font-mono">
        dst=10.0.0.1
      </text>
      <text x={270} y={173} className="fill-success text-[8px] font-mono">
        out:port3
      </text>
      <text x={335} y={173} className="fill-foreground text-[8px] font-mono">
        1.2M
      </text>

      {/* Row 2 */}
      <text x={135} y={188} className="fill-foreground text-[8px] font-mono">
        tcp:443
      </text>
      <text x={270} y={188} className="fill-success text-[8px] font-mono">
        out:port5
      </text>
      <text x={335} y={188} className="fill-foreground text-[8px] font-mono">
        8.4M
      </text>

      {/* Row 3 - new */}
      <text x={135} y={203} className="fill-brand text-[8px] font-mono">
        src=10.0.0.7
      </text>
      <text x={270} y={203} className="fill-brand text-[8px] font-mono">
        drop
      </text>
      <text x={335} y={203} className="fill-foreground text-[8px] font-mono">
        0 (ny)
      </text>

      <text x={250} y={230} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Match-action per rad. Første match vinner. Controller kan installere/fjerne entries på
        flygende fot.
      </text>
    </svg>
  );
}

function TracerouteSvg() {
  return (
    <svg viewBox="0 0 500 230" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Traceroute: pakker med stigende TTL avslører hver ruter
      </text>
      {/* Source */}
      <rect
        x={20}
        y={90}
        width={60}
        height={30}
        rx={4}
        className="fill-brand/30 stroke-brand"
        strokeWidth={2}
      />
      <text
        x={50}
        y={110}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Klient
      </text>

      {/* Routers */}
      {[140, 230, 320, 410].map((x, i) => (
        <g key={i}>
          <circle
            cx={x}
            cy={105}
            r={16}
            className="fill-card stroke-foreground/60"
            strokeWidth={2}
          />
          <text
            x={x}
            y={108}
            textAnchor="middle"
            className="fill-foreground text-[9px] font-semibold"
          >
            R{i + 1}
          </text>
        </g>
      ))}

      {/* Destination */}
      <rect
        x={460}
        y={90}
        width={30}
        height={30}
        rx={4}
        className="fill-success/30 stroke-success"
        strokeWidth={2}
      />
      <text
        x={475}
        y={110}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-semibold"
      >
        Mål
      </text>

      {/* Links */}
      <line x1={80} y1={105} x2={124} y2={105} className="stroke-foreground/40" strokeWidth={1.5} />
      <line
        x1={156}
        y1={105}
        x2={214}
        y2={105}
        className="stroke-foreground/40"
        strokeWidth={1.5}
      />
      <line
        x1={246}
        y1={105}
        x2={304}
        y2={105}
        className="stroke-foreground/40"
        strokeWidth={1.5}
      />
      <line
        x1={336}
        y1={105}
        x2={394}
        y2={105}
        className="stroke-foreground/40"
        strokeWidth={1.5}
      />
      <line
        x1={426}
        y1={105}
        x2={460}
        y2={105}
        className="stroke-foreground/40"
        strokeWidth={1.5}
      />

      {/* Annotations: TTL labels above each link */}
      <text x={102} y={75} textAnchor="middle" className="fill-brand text-[8px] font-mono">
        TTL=1
      </text>
      <text
        x={102}
        y={150}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[8px]"
      >
        R1 sender ICMP
      </text>
      <text
        x={102}
        y={161}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[8px]"
      >
        Time Exceeded
      </text>

      <text x={185} y={75} textAnchor="middle" className="fill-brand text-[8px] font-mono">
        TTL=2
      </text>
      <text
        x={185}
        y={150}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[8px]"
      >
        R2 sender ICMP
      </text>

      <text x={275} y={75} textAnchor="middle" className="fill-brand text-[8px] font-mono">
        TTL=3
      </text>
      <text
        x={275}
        y={150}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[8px]"
      >
        R3 sender ICMP
      </text>

      <text x={365} y={75} textAnchor="middle" className="fill-brand text-[8px] font-mono">
        TTL=4
      </text>
      <text
        x={365}
        y={150}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[8px]"
      >
        R4 sender ICMP
      </text>

      <text x={250} y={205} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Hver pakke når én hopp lengre før den dør. Klient ser hvem som svarte og bygger sti-listen.
      </text>
    </svg>
  );
}

function DhcpDoraSvg() {
  return (
    <svg viewBox="0 0 500 260" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        DHCP DORA — fire meldinger til en IP-adresse
      </text>
      {/* Client and server columns */}
      <rect
        x={50}
        y={32}
        width={80}
        height={26}
        rx={4}
        className="fill-brand/30 stroke-brand"
        strokeWidth={2}
      />
      <text x={90} y={49} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        Klient
      </text>
      <text x={90} y={62} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        (ingen IP)
      </text>

      <rect
        x={370}
        y={32}
        width={80}
        height={26}
        rx={4}
        className="fill-success/30 stroke-success"
        strokeWidth={2}
      />
      <text
        x={410}
        y={49}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        DHCP-server
      </text>

      <line
        x1={90}
        y1={65}
        x2={90}
        y2={245}
        className="stroke-foreground/30"
        strokeWidth={1}
        strokeDasharray="2 3"
      />
      <line
        x1={410}
        y1={65}
        x2={410}
        y2={245}
        className="stroke-foreground/30"
        strokeWidth={1}
        strokeDasharray="2 3"
      />

      {/* Arrows */}
      {/* Discover */}
      <line
        x1={95}
        y1={90}
        x2={405}
        y2={90}
        className="stroke-brand"
        strokeWidth={1.5}
        markerEnd="url(#arrdh)"
      />
      <text x={250} y={84} textAnchor="middle" className="fill-brand text-[9px] font-mono">
        DISCOVER (broadcast)
      </text>

      {/* Offer */}
      <line
        x1={405}
        y1={125}
        x2={95}
        y2={125}
        className="stroke-success"
        strokeWidth={1.5}
        markerEnd="url(#arrdh)"
      />
      <text x={250} y={119} textAnchor="middle" className="fill-success text-[9px] font-mono">
        OFFER (IP=10.0.0.42)
      </text>

      {/* Request */}
      <line
        x1={95}
        y1={160}
        x2={405}
        y2={160}
        className="stroke-brand"
        strokeWidth={1.5}
        markerEnd="url(#arrdh)"
      />
      <text x={250} y={154} textAnchor="middle" className="fill-brand text-[9px] font-mono">
        REQUEST (jeg vil ha 10.0.0.42)
      </text>

      {/* Ack */}
      <line
        x1={405}
        y1={195}
        x2={95}
        y2={195}
        className="stroke-success"
        strokeWidth={1.5}
        markerEnd="url(#arrdh)"
      />
      <text x={250} y={189} textAnchor="middle" className="fill-success text-[9px] font-mono">
        ACK (bekreftet, lease 24t)
      </text>

      <defs>
        <marker
          id="arrdh"
          viewBox="0 0 10 10"
          refX={9}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-current" />
        </marker>
      </defs>

      <text x={250} y={230} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Hele utvekslingen tar typisk 100–200 ms. Etter ACK kan klienten begynne å bruke nettet.
      </text>
    </svg>
  );
}
