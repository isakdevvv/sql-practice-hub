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
import { Section51Live } from "./Section51Live";
import { Section52Live } from "./Section52Live";
import { Section53Live } from "./Section53Live";
import { Section54Live } from "./Section54Live";
import { Section55Live } from "./Section55Live";

type Tab = "intro" | "5.1" | "5.2" | "5.3" | "5.4" | "5.5" | "oppg" | "eksamen";

const SECTIONS_5: SectionNavItem[] = [
  { id: "intro", label: "Start her" },
  { id: "5.1", label: "5.1 Routing-algoritmer" },
  { id: "5.2", label: "5.2 OSPF" },
  { id: "5.3", label: "5.3 BGP" },
  { id: "5.4", label: "5.4 SDN" },
  { id: "5.5", label: "5.5 ICMP & SNMP" },
  { id: "oppg", label: "Oppgaver" },
  { id: "eksamen", label: "Eksamen-fokus" },
];
const NEXT_CHAPTER_5 = { slug: "kurose-kap-6", title: "Link-laget og LAN" };

export function KuroseKap5Page() {
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
              Kap. 5 — Nettverkslaget: control-plane
            </h1>
          </div>
          <nav className="ml-auto flex flex-wrap gap-0.5">
            <TabBtn active={tab === "intro"} onClick={() => setTab("intro")}>
              Start
            </TabBtn>
            <TabBtn
              active={tab === "5.1"}
              onClick={() => setTab("5.1")}
              title="Routing-algoritmer (DV vs LS)"
            >
              5.1
            </TabBtn>
            <TabBtn active={tab === "5.2"} onClick={() => setTab("5.2")} title="Intra-AS: OSPF">
              5.2
            </TabBtn>
            <TabBtn active={tab === "5.3"} onClick={() => setTab("5.3")} title="Inter-AS: BGP">
              5.3
            </TabBtn>
            <TabBtn active={tab === "5.4"} onClick={() => setTab("5.4")} title="SDN / OpenFlow">
              5.4
            </TabBtn>
            <TabBtn
              active={tab === "5.5"}
              onClick={() => setTab("5.5")}
              title="ICMP og nettverks-administrasjon (SNMP)"
            >
              5.5
            </TabBtn>
            <TabBtn active={tab === "oppg"} onClick={() => setTab("oppg")} title="Oppgaver">
              Oppg.
            </TabBtn>
            <TabBtn active={tab === "eksamen"} onClick={() => setTab("eksamen")} title="Eksamen-fokus">
              Eksamen
            </TabBtn>
          </nav>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "5.1" && <Section51 />}
        {tab === "5.2" && <Section53 />}
        {tab === "5.3" && <Section54 />}
        {tab === "5.4" && <Section55 />}
        {tab === "5.5" && <Section5IcmpSnmp />}
        {tab === "oppg" && <Section58 />}
        {tab === "eksamen" && <SectionEksamen />}

        <SectionPager
          tabs={SECTIONS_5}
          current={tab}
          onPick={(id) => setTab(id as Tab)}
          nextChapter={NEXT_CHAPTER_5}
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
    <div className="space-y-4 text-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-base font-semibold mb-2 flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Læringsmål
          </h2>
          <ul className="list-disc pl-5 text-muted-foreground space-y-1">
            <li>
              Skille data-plane (per-pakke videresending) fra control-plane (å beregne tabellene),
              og forstå hvorfor de logisk separeres.
            </li>
            <li>
              Kjøre Dijkstras algoritme manuelt på en liten graf, og forklare hvorfor link-state
              konvergerer raskt.
            </li>
            <li>
              Forklare Bellman-Ford distance-vector, count-to-infinity-problemet, og hvordan
              poisoned reverse og split horizon prøver å dempe det.
            </li>
            <li>
              Vite hva OSPF gjør innenfor et autonomt system: LSA-flooding, areas, hierarkisk
              ruting.
            </li>
            <li>
              Forklare hvorfor BGP er policy-basert (ikke shortest-path), og kjenne attributtene
              LOCAL_PREF, AS_PATH, MED og NEXT_HOP.
            </li>
            <li>
              Beskrive SDN-arkitekturen — separasjon av controller og switch — og hvorfor den vant
              i moderne datasentre.
            </li>
            <li>Forklare hva ICMP er, og hvordan ping og traceroute utnytter den.</li>
            <li>
              Vite hva SNMP er og hvorfor det er den dominerende administrasjons-protokollen for
              IP-utstyr.
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-base font-semibold mb-2">Kapittelets struktur</h2>
          <ol className="list-decimal pl-5 text-muted-foreground space-y-1">
            <li>5.1 Routing-algoritmer — link-state vs distance-vector (interaktivt)</li>
            <li>5.2 Intra-AS ruting — OSPF</li>
            <li>5.3 Inter-AS ruting — BGP</li>
            <li>5.4 SDN control-plane — OpenFlow</li>
            <li>5.5 ICMP og nettverks-administrasjon (SNMP)</li>
            <li>Oppgaver — sjekk forståelsen din</li>
            <li>Eksamen-fokus — kjernestoff samlet</li>
          </ol>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => onPick("5.1")}>
              Start på 5.1 →
            </Button>
          </div>
        </div>
      </div>

      <ControlPlaneOverview />
    </div>
  );
}

// ============================================================
// Bakgrunn — control-plane overview (vises på Start her-tab)
// ============================================================
function ControlPlaneOverview() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="bakgrunn" title="Control-plane: sentralisert vs distribuert" />

      <p className="text-muted-foreground">
        Forrige kapittel handlet om data-plane: hvordan en enkelt ruter ser på en pakke og slenger
        den ut på riktig lenke. Men hvor kommer forwarding-tabellen fra? Det er control-plane sin
        jobb. Det finnes to fundamentalt ulike måter å løse den på.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            { term: "Data-plane", body: "Per-pakke videresending i ASIC — nanosekunder." },
            { term: "Control-plane", body: "Bygger forwarding-tabellen — millisekunder, CPU." },
            {
              term: "Distribuert control-plane",
              body: "Hver ruter regner selv, snakker med naboer.",
            },
            {
              term: "Sentralisert (SDN)",
              body: "Én controller pusher tabeller til alle switcher.",
            },
            {
              term: "Routing vs forwarding",
              body: "Forwarding = per-pakke. Routing = beregne stiene.",
            },
            { term: "Forwarding-tabell", body: "Prefiks → ut-port, slått opp i TCAM." },
            { term: "RIB vs FIB", body: "RIB = alle ruter (CPU). FIB = beste (ASIC)." },
            { term: "Konvergens", body: "Tiden til alle rutere er enige igjen." },
            { term: "Routing-loop", body: "R1 og R2 sender til hverandre i ring." },
            { term: "Black hole", body: "Ruter annonserer prefiks men forkaster pakkene." },
            { term: "Topologi-database", body: "Ruterens interne kart over nettet." },
            { term: "Soft-state", body: "Info forvitrer hvis ikke fornyet — selvhelbreder." },
          ]}
        />
        <Illustration caption="Distribuert control-plane: hver ruter regner selv. SDN control-plane: én controller regner for alle.">
          <ControlPlaneCompareSvg />
        </Illustration>
      </div>

      <Metafor tittel="Bystyret eller vakter på hvert kryss">
        <p>Forestill deg en by med 500 lyskryss. To måter å koordinere trafikken på:</p>
        <ul className="list-disc pl-5">
          <li>
            <strong>Sentralisert (SDN):</strong> Bystyret sitter i rådhuset med live-kamerafeed fra
            alle kryss. De bestemmer alle lys-fasene fra ett sted, sender ned beslutningene over
            radio. Optimalt — men hvis rådhuset brenner, står alle kryss stille.
          </li>
          <li>
            <strong>Distribuert (OSPF):</strong> Hvert kryss har sin egen trafikkvakt som bare roper
            til de fire nabokryssene. Etter litt rop frem og tilbake blir alle enige om grønnbølger.
            Ingen sjef, men sløst med koordineringstid.
          </li>
        </ul>
        <p>Datasentre vil ha bystyre (kontroll). Internettet må ha vakter (overlevelse).</p>
      </Metafor>

      <div className="grid gap-3 lg:grid-cols-2">
        <Illustration caption="To hastighets-domener: data-plane i ASIC (ns), control-plane i CPU (ms).">
          <DataVsControlSpeedSvg />
        </Illustration>
        <Metafor tittel="Et fly og en flyrute">
          <p>
            <strong>Forwarding</strong> er det kabinpersonalet gjør per passasjer: «vis billett,
            sett deg i 14B». Det er per-pakke, raskt, mekanisk.
          </p>
          <p>
            <strong>Routing</strong> er det flyselskapets planavdeling gjør: bygger flyplaner mellom
            byer basert på etterspørsel, drivstoffpriser og åpne ruter. Langsom analyse som
            produserer et fast «kart» kabinen følger.
          </p>
          <p>
            Når en ny flyplass åpner (ny ruter i nettet), endres planene først — så kommer
            mannskapet på plass og begynner å sende passasjerer dit. Det er konvergens.
          </p>
        </Metafor>
      </div>

      <Metafor tittel="RIB og FIB: hagen og kjøkkenet">
        <p>
          En kokk har en stor hage med dusinvis av urter (<strong>RIB</strong> — alt kjent). På
          kjøkkenbenken har hun kun krydderne hun trenger akkurat nå (<strong>FIB</strong> — det
          beste, klart for raskt oppslag). Når basilikum visner i krydderhylla, springer hun ned i
          hagen og henter en ny krukke. Det er hva «konvergens» mellom RIB og FIB betyr — den raske
          hyllen får ny entry når kjernen krever det.
        </p>
      </Metafor>

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

      <Example title="Eksempel: RIB vs FIB i en kant-ruter">
        <p>
          En liten ISP-ruter ved kanten av AS 2118 har lært om prefikset 91.198.174.0/23 (Wikipedia)
          fra to oppstrøms-naboer:
        </p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>Via NORDU-link: BGP-rute, AS_PATH lengde 4, lokal-pref 100</li>
          <li>Via Telia-link: BGP-rute, AS_PATH lengde 3, lokal-pref 100</li>
        </ul>
        <p className="mt-2">
          <strong>RIB:</strong> begge rader, sortert etter foretrukken. <strong>FIB:</strong> kun
          Telia-raden komprimert til en TCAM-entry «91.198.174.0/23 → port 4». Pakker som kommer i
          linjekortet matches mot FIB på &lt; 100 ns. Hvis Telia-lenken ryker, kopieres backup-raden
          fra RIB ned i FIB; «konvergens» her er hvor lang tid det tar fra detection til ny FIB.
        </p>
      </Example>

      <Hvorfor title="Hvorfor separere control-plane fra data-plane?">
        <p>
          Hastigheten i de to lagene skiller seg med en faktor 10⁶. Data-plane må beslutte hva en
          pakke skal gjøre på &lt; 1 µs (mikrosekund) for å holde linjehastighet — det krever
          dedikert silisium uten lokk-vendinger eller minne-allokering. Control-plane må reagere på
          topologi-endringer, holde naboer i live, og kjøre algoritmer som Dijkstra som tar
          millisekunder. Hvis disse to oppgavene ble blandet i samme kodebane, ville pakketransport
          stoppet hver gang ruteren regnet en ny rute.
        </p>
        <p>
          Separasjonen lar deg også bytte ut control-plane uten å røre hardware. SDN-revolusjonen
          gjorde dette eksplisitt — control-plane flyttes hele veien ut til en ekstern server, så
          switcher blir billige og standardiserte mens innovasjonen skjer i software.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-ruting"]} />
    </article>
  );
}

// ============================================================
// 5.1 — Routing-algoritmer (med levende DV vs LS-interaktiv)
// ============================================================
function Section51() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="5.1" title="Routing-algoritmer — DV vs LS (link-state vs distance-vector)" />
      <p className="text-muted-foreground">
        Den interaktive simulatoren under viser samme topologi i to moduser. Bytt mellom dem og se
        hvordan link-state og distance-vector bygger forwarding-tabellene på helt ulike måter — og
        hvorfor distance-vector er sårbar for count-to-infinity.
      </p>
      <Section51Live />
      <RoutingAlgsContent />
    </article>
  );
}

function RoutingAlgsContent() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="5.1 (utdypning)" title="Link-state og distance-vector — definisjoner og eksempler" />

      <p className="text-muted-foreground">
        Distribuert routing bygger på to klassiske algoritmer fra grafteorien. Link-state er
        Dijkstra med global oversikt; distance-vector er Bellman-Ford med kun nabo-info. De har
        ulike svakheter — særlig distance-vector sin count-to-infinity.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            { term: "Link-state (LS)", body: "Flood lenke-kost til alle, kjør Dijkstra lokalt." },
            { term: "Dijkstras algoritme", body: "Utvid mengden N med nærmeste ubesøkte node." },
            { term: "Visited-sett N", body: "Noder med endelig kjent korteste avstand." },
            { term: "Dist-tabell D(y), p(y)", body: "Tentativ avstand + forgjenger på beste sti." },
            { term: "Relax-steg", body: "Sjekk om ny node gir kortere vei til naboer." },
            {
              term: "Distance-vector (DV)",
              body: "Hold avstand per destinasjon, send til naboer.",
            },
            { term: "Bellman-Ford-likning", body: "d_x(y) = min over naboer av c(x,v)+d_v(y)." },
            {
              term: "Bellman-Ford-iterasjon",
              body: "Motta nabos vektor, oppdater, send hvis endret.",
            },
            {
              term: "Asynkron oppdatering",
              body: "Hver ruter sender på egen takt — ingen klokke.",
            },
            {
              term: "Count-to-infinity",
              body: "DV-rutere bytter stadig økende, falske avstander.",
            },
            { term: "Split horizon", body: "Ikke annonser rute tilbake til den du lærte fra." },
            { term: "Poisoned reverse", body: "Si aktivt «kost = ∞» tilbake — stopper sløyfen." },
            { term: "RIPs ∞ = 16", body: "Begrenser sløyfer, men maks 15 hopp." },
            {
              term: "Kompleksitet",
              body: "LS: O((N+E) log N). DV: lite minne, dårlig konvergens.",
            },
          ]}
        />
        <Illustration caption="Dijkstra på en 5-node graf: i hvert steg legges noden med lavest tentativ avstand inn i shortest-path-treet.">
          <DijkstraSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="Dijkstra = Google Maps som tegner sirkler">
          <p>
            Når du søker korteste vei i Google Maps, utvider algoritmen ringer fra startpunktet.
            Først alle veikryss innen 100 m. Så 200 m. Så 300 m. I hver runde plukkes den nærmeste,
            så permanent merkes den som «ferdig».
          </p>
          <p>
            Dijkstra er nøyaktig denne strategien. Mengden N er ringen som er «ferdig forsket». Når
            den når målet, vet du den absolutt korteste veien — fordi alt nærmere allerede er
            sjekket. Forutsetning: ingen «negative» veier (negative kostnader vil ødelegge
            logikken).
          </p>
        </Metafor>
        <Metafor tittel="Bellman-Ford = rykte-spredning på en arbeidsplass">
          <p>
            På et stort kontor vet ingen sjefer hva hele bedriften gjør. Hver ansatt vet bare hva de
            fem kollegene på samme team gjør. Ved kaffemaskinen utveksles tabeller: «Tor sa at
            Marketing avdelingen er 3 timer unna». Hvis Marit nettopp har snakket med Marketing
            direkte (1 time), oppdaterer Tor sin egen tabell og forteller det videre.
          </p>
          <p>
            Det er sjarmen og pinen ved DV: ingen ser nettet, alle tror på naboer. Når infoen er
            utdatert, snakker folk fortsatt frittalende basert på det de hørte i går — og rykter om
            korteste vei kan ta lang tid på å dø ut.
          </p>
        </Metafor>
      </div>

      <Metafor tittel="Count-to-infinity = barn i baksetet">
        <p>
          Tre barn (A, B, C) sitter i baksetet på langtur. A spør «Når er vi fremme?». B sier «1
          time». C sier «1 time». Plutselig stopper bilen — A er ute av syne. B tror nå at C
          fortsatt kan se A, og spør C: «Hvor langt er det til A?». C svarer «det jeg hørte fra B i
          fjor — 2 timer». B sier nå «3 timer». C: «4 timer». De teller helt opp til 16 (RIPs
          uendelig) før de skjønner at A ikke kommer.
        </p>
        <p>
          Poisoned reverse er læreren som kjefter: «Når du ikke vet noe, si <em>vet ikke</em> — ikke
          gjett basert på det du hørte fra naboen!»
        </p>
      </Metafor>

      <Illustration caption="Bellman-Ford steg-for-steg: tabellene utveksles, oppdateres ved hver iterasjon.">
        <BellmanFordSvg />
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

      <Example title="Eksempel: Dijkstra-traversering, steg for steg">
        <p>
          5 noder S, P, Q, R, T med kostnader S—P=2, S—Q=7, P—Q=3, P—R=4, Q—R=1, Q—T=5, R—T=2. Kjør
          Dijkstra fra S.
        </p>
        <p className="font-mono text-[12px] mt-2">
          Init: D(S)=0, D(P)=D(Q)=D(R)=D(T)=∞; N={"{}"}; p(*) udef
          <br />
          --- Iter 1 — velg S (D=0) → N={"{S}"}. Relax naboer: D(P)=2,p=S; D(Q)=7,p=S.
          <br />
          --- Iter 2 — velg P (D=2, lavest utenfor N) → N={"{S,P}"}. Naboer av P utenfor N: Q (2+3=5
          &lt; 7 → D(Q)=5,p=P), R (2+4=6 → D(R)=6,p=P).
          <br />
          --- Iter 3 — velg Q (D=5) → N={"{S,P,Q}"}. Naboer: R (5+1=6, like — behold), T (5+5=10 →
          D(T)=10,p=Q).
          <br />
          --- Iter 4 — velg R (D=6) → N={"{S,P,Q,R}"}. Naboer: T (6+2=8 &lt; 10 → D(T)=8,p=R).
          <br />
          --- Iter 5 — velg T (D=8) → N={"{S,P,Q,R,T}"}. Ferdig.
          <br />
          <br />
          SPT (shortest-path tree) fra S: S→P (2), S→P→Q (5), S→P→R (6), S→P→R→T (8).
        </p>
        <p className="mt-2">
          Legg merke til at D(Q) ble redusert i iter 2 — det er typisk for Dijkstra. Når en node
          legges til N, kan en kortere vei oppdages som går via den nye noden i stedet for en
          direkte kant fra kilden.
        </p>
      </Example>

      <Hvorfor title="Hvorfor er link-state foretrukket over distance-vector i moderne nett?">
        <p>
          DV-protokollen RIP dominerte tidlig på 80-tallet fordi den var enkel å implementere — hver
          ruter trengte bare nabo-tabellen, ikke et komplett topologi-bilde. Men tre svakheter ble
          uakseptable etter hvert som internett vokste: (1) langsom konvergens og count-to-infinity,
          som kunne gi minutter med svart hull etter en lenke-feil; (2) maks-distansen på 15 hopp
          begrenset størrelse; (3) hver ruter måtte stole på naboers info uten kryssjekk.
        </p>
        <p>
          Link-state bytter mer bandbredde ved oppstart (full flood av alle LSA-er) mot dramatisk
          raskere reconvergence (alle har samme bilde, kjører lokalt). I OSPF konvergerer et helt AS
          på sekunder etter en lenke-feil. Det er en aksept-test verd å huske: hvis du blir spurt
          «hvorfor RIP ikke brukes i dagens nett», svaret er count-to-infinity og 15-hopp-grensen.
        </p>
      </Hvorfor>

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
      <Header num="5.2" title="Intra-AS ruting — OSPF" />

      <p className="text-muted-foreground">
        Den interaktive simulatoren under viser OSPF-areas og LSA-flooding. Bla gjennom stegene
        for å se hvordan en Router-LSA (type 1) flommer kun innenfor sitt eget area, mens en
        Summary-LSA (type 3) krysser area-grenser via ABR-er.
      </p>
      <Section52Live />

      <p className="text-muted-foreground">
        Internett deles inn i autonome systemer (AS). Innenfor ett AS — typisk et selskap, et
        universitet, eller en ISP — kjøres en intra-AS protokoll. Den vanligste er OSPF (Open
        Shortest Path First), en link-state-protokoll basert på Dijkstra.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            { term: "Autonomt system (AS)", body: "Rutere under én adm. enhet — eget ASN." },
            { term: "OSPF", body: "Link-state inne i et AS, Dijkstra-basert." },
            { term: "LSA", body: "«Mine naboer og kost»-melding flooded til alle." },
            { term: "Type 1 (Router-LSA)", body: "Egne lenker beskrevet innen et area." },
            { term: "Type 2 (Network-LSA)", body: "DR forteller om felles ethernet-segment." },
            { term: "Type 3 (Summary)", body: "ABR annonserer prefiks mellom areas." },
            { term: "Type 4 og 5", body: "ASBR + eksterne ruter (typisk fra BGP)." },
            { term: "Flooding", body: "Send LSA på alle porter, sekv.nr stopper løkke." },
            { term: "LSDB", body: "Ruterens lokale topologi-kart fra alle LSA-er." },
            { term: "Areas", body: "Del AS opp — flooding stoppes ved ABR." },
            { term: "Area 0 (backbone)", body: "Sentral area alle andre må koble til." },
            { term: "Stub area", body: "Aksepterer ikke eksterne LSA — bruker default-rute." },
            { term: "NSSA", body: "Stub som likevel kan ha egen ekstern peering." },
            { term: "Hello (10s/40s)", body: "Nabo-deteksjon: hello hvert 10s, død etter 40s." },
            { term: "ECMP + auth", body: "Load-balance over like kost-stier, signerte pakker." },
          ]}
        />
        <Illustration caption="Et AS delt i tre OSPF-areas. Area 0 (backbone) binder area 1 og area 2 via ABR-er.">
          <OspfAreasSvg />
        </Illustration>
      </div>

      <Metafor tittel="Hver ruter får et komplett kommunekart">
        <p>
          Tenk OSPF-rutere som ordførere i en kommune som planlegger asfaltering. Hver ordfører
          sender et brev til alle andre: «Mine veier er R12 til R13 (1 km) og R12 til R7 (3 km)».
          Når alle brev har kommet inn, har hver kommune nøyaktig samme detaljerte kart over hele
          fylket — alle veier, alle lengder.
        </p>
        <p>
          Så setter hver ordfører seg ned med kartet og finner korteste vei til hver kommune. Alle
          får samme svar fordi de jobber med samme kart. Det er Dijkstra på en flooded LSDB.
        </p>
      </Metafor>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="Areas = fylker innen et land">
          <p>
            Et lite OSPF-AS kan kjøres som ett enkelt fylke. Men når kommunen vokser til 1000
            rutere, ville hvert kommunestyre dø under brevbunken. Areas løser det: del landet i
            fylker. Innenfor fylke 0 (backbone) sirkulerer detaljerte brev. På grensen sitter en ABR
            (fylkesmann) som oppsummerer: «Fylke 1 har prefiks 10.0.0.0/8 og koster 12 å nå».
          </p>
          <p>
            Det er pakke-økonomi: ingen filial-ruter må vite hvilke 200 lenker som finnes i Bodø
            backbone, bare at de finnes og hvor mye det «koster» å nå dem.
          </p>
        </Metafor>
        <Illustration caption="LSA-typer flommer kun innenfor sin sone: Type-1/2 i area, Type-3 mellom, Type-5 fra ASBR.">
          <LsaFlowSvg />
        </Illustration>
      </div>

      <Metafor tittel="Hello-protokollen = morgensjekk på akuttmottaket">
        <p>
          På akuttmottaket roper hver sykepleier «Her!» hvert 10. sekund slik at sjefen vet hvem som
          er i drift. Etter 3 manglende rop antas vedkommende å være borte (kanskje besvimt) — alarm
          går, vaktplanene oppdateres umiddelbart. OSPF gjør akkurat det samme: hello hvert 10.
          sekund, og etter 40 s erklæres lenken død. Da flommer en LSA-oppdatering gjennom området,
          og alle rutere regner ny vei rundt den.
        </p>
      </Metafor>

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

      <Example title="Eksempel: tre areas i et bedrifts-AS">
        <p>
          Et fiktivt nordnorsk-konsern AS 64512 har tre kontorer: hovedkontoret i Bodø, en filial i
          Mo i Rana, og en datasenter-cage i Tromsø. Routing er delt slik:
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>
            <strong>Area 0 (Bodø-backbone)</strong>: 4 core-rutere R-bo-1..R-bo-4 som binder
            filialene sammen. Full LSDB med alle LSA-typer.
          </li>
          <li>
            <strong>Area 1 (Mo i Rana, stub)</strong>: 3 rutere. Mottar bare Type-1, Type-2 og
            Type-3-LSA-er fra Area 0. Eksterne ruter (Type-5) blokkeres — i stedet får de en
            default-rute «0.0.0.0/0 → ABR-en R-bo-2».
          </li>
          <li>
            <strong>Area 2 (Tromsø, NSSA)</strong>: 5 rutere, inkludert en lokal BGP-peering med en
            forskningspartner. Genererer Type-7-LSA-er for de eksterne forsknings-prefiksene; ABR
            R-bo-3 oversetter dem til Type-5 før de slippes inn i backbone.
          </li>
        </ul>
        <p className="mt-2">
          Resultatet: Mo-Rana-ruterne har en LSDB på ~10 LSA-er (egne pluss Type-3 summary-er fra
          backbone). Hvis hele konsernet var én area, ville LSDB-en vært på 12+ ruter-LSA-er pluss
          alle BGP-eksterne. Areas gjør at små filial-rutere ikke trenger å regne Dijkstra på hele
          konsernets topologi.
        </p>
      </Example>

      <Hvorfor title="Hvorfor flooder OSPF informasjon — og hvorfor deles AS i areas?">
        <p>
          Flooding er ikke elegant — i prinsippet sender hver ruter samme info ut på alle porter, og
          informasjonen ekko-er seg ut til den når alle. Men det er den enkleste måten å garantere
          at alle rutere ender opp med identisk LSDB uten en sentral koordinator. Sekvens-numre og
          aldring (LSA-Age-feltet teller sekunder, max 3600) sørger for at gamle versjoner ikke kan
          komme tilbake fra hvile-tilstand i en del av nettet.
        </p>
        <p>
          Areas løser et helt annet problem: Dijkstras tids- og minne-kompleksitet vokser med antall
          noder. I et AS med 1000 rutere ville hver ruter måtte holde 1000 LSA-er i minnet og kjøre
          Dijkstra på en 1000-node-graf hver gang noe endret seg. Areas avskjermer informasjonen —
          Dijkstra kjøres bare innenfor egen area, og inter-area-info komprimeres til
          summary-LSA-er. Det reduserer både CPU og minne, og lokaliserer flooding sånn at en
          lenke-feil i Area 1 ikke trigger reconvergence i Area 2.
        </p>
      </Hvorfor>

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
      <Header num="5.3" title="Inter-AS ruting — BGP" />

      <p className="text-muted-foreground">
        Den interaktive simulatoren under viser BGP-policy i praksis. Toggle mellom «shortest
        AS-path» og «preferred provider» — se hvordan AS1 sin valgte rute endrer seg selv om begge
        alternativene er like korte. Internett rutes etter penger, ikke optimum.
      </p>
      <Section53Live />

      <p className="text-muted-foreground">
        BGP (Border Gateway Protocol) er protokollen som limer internettet sammen. Den lar AS-er
        annonsere «jeg kan nå dette prefikset» til hverandre, og lar hver AS bruke egne policyer for
        å velge mellom flere mulige stier. BGP er ikke shortest-path — det er policy-basert.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            { term: "BGP-4", body: "Inter-AS over TCP/179, inkrementelle oppdateringer." },
            { term: "eBGP vs iBGP", body: "Mellom AS vs internt innen eget AS." },
            { term: "Prefiks-annonsering", body: "«Send trafikk til 1.2.3.0/24 til meg»." },
            { term: "Withdrawal", body: "«Glem ruten — jeg når ikke lenger prefiks»." },
            { term: "AS_PATH", body: "Lista over AS-er ruten har passert." },
            { term: "AS_PATH-prepending", body: "Repeter eget ASN — gjør stien mindre attraktiv." },
            { term: "ORIGIN", body: "Hvor ble ruten lært: IGP/EGP/Incomplete." },
            { term: "LOCAL_PREF", body: "Lokal prioritet — sterkeste tie-breaker." },
            { term: "MED", body: "Hint til nabo om hvilken inngang å foretrekke." },
            { term: "NEXT_HOP", body: "IP til siste eBGP-talker langs ruten." },
            { term: "Rute-seleksjons-rekken", body: "LP → AS_PATH → ORIGIN → MED → eBGP → IGP." },
            { term: "Kunde-policy", body: "Annonser til alle, høyest LOCAL_PREF." },
            { term: "Peer-policy", body: "Annonser bare til kunder — ikke gratis transit." },
            { term: "Provider-policy", body: "Du betaler — bruk kun når nødvendig." },
            { term: "Gao-Rexford", body: "Kunde > peer > provider; garanterer konvergens." },
          ]}
        />
        <Illustration caption="To AS-er som peerer, hvert med flere kunder. AS_PATH bygges opp ved hver eBGP-grense.">
          <BgpTopologySvg />
        </Illustration>
      </div>

      <Metafor tittel="BGP = diplomati mellom 75 000 land">
        <p>
          Forestill deg ikke ett land, men 75 000 selvstendige nasjoner som hver har egne
          tollavtaler. Når et brev skal fra Norge til Japan, velger Norge ikke nødvendigvis den
          fysisk korteste ruten. De velger den <em>billigste politisk</em>: kanskje gjennom et
          naboland Norge har gratis-avtale med, framfor en kortere rute gjennom et dyrt
          transittland.
        </p>
        <p>
          Det er hvorfor BGP ikke er «shortest path». LOCAL_PREF er Utenriksdepartementets
          rangeringsark: «kunde-naboer (de som betaler oss) går alltid først, så peering-naboer
          (gratis), så transit (vi betaler dem)». Topologien er åpen for alle — men hvert land
          velger sin egen sti basert på handelsavtaler.
        </p>
      </Metafor>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="AS_PATH-prepending = «vis at vi er trege»">
          <p>
            En ISP med to oppstrøms-providers vil at innkommende trafikk skal komme via den raskere
            lenken. De kan ikke be naboene direkte — men de kan late som om den andre lenken er
            lengre. På den «trege» lenken pre-pender de eget ASN tre ganger: AS100 AS100 AS100 AS5.
            Naboene ser to stier med ulik AS_PATH-lengde og foretrekker den korte.
          </p>
          <p>
            Som å si i en restaurant: «Vi har desserter, men de tar veldig lang tid». Du er ikke
            stengt — du er bare gjort lite attraktiv.
          </p>
        </Metafor>
        <Metafor tittel="Gao-Rexford = trafikkregler som hindrer kaos">
          <p>
            Hvis alle AS-er satte LOCAL_PREF tilfeldig, kunne BGP havne i evige svingninger: AS A
            velger sti gjennom B, B endrer policy, A endrer, B endrer... aldri konvergens.
          </p>
          <p>
            Gao-Rexford-reglene (kunde &gt; peer &gt; provider, og «annonser ikke peer/provider til
            andre peers/providers») er som universelle trafikkregler. Når alle følger dem, er BGP
            matematisk garantert å konvergere. De er ikke skrevet i RFC — men de er kommersiell sunn
            fornuft som ble normen.
          </p>
        </Metafor>
      </div>

      <Illustration caption="Rute-seleksjons-rekken som beslutningstre — stopper ved første som skiller stiene.">
        <BgpDecisionTreeSvg />
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

      <Example title="Eksempel: en ISPs LOCAL_PREF-politikk satt med Gao-Rexford">
        <p>Tenk deg den fiktive regionale ISP-en NordNett (AS 60001). De har:</p>
        <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
          <li>3 kunder (AS 60010-60012)</li>
          <li>2 settlement-free peers (AS 70001, AS 70002)</li>
          <li>2 oppstrøms-providers (AS 80001, AS 80002)</li>
        </ul>
        <p className="mt-2">
          NordNett konfigurerer LOCAL_PREF som følger ved import: kunde-ruter får 200, peer-ruter
          får 150, provider-ruter får 100. Det betyr: hvis prefikset 1.2.3.0/24 kan nås både via en
          kunde og via en peer, vinner kunden uansett AS_PATH-lengde. Hvorfor? Fordi NordNett tjener
          penger per gigabyte trafikk som går mot kunder (de er betalere), mens trafikk via peer
          eller provider enten er gratis eller koster NordNett selv. Lokal pref er
          forretnings-policy uttrykt som tall.
        </p>
        <p className="mt-2">
          Eksport-policyen følger Gao-Rexford: kunde-ruter eksporteres til alle 7 naboer; peer- og
          provider-ruter eksporteres bare til de 3 kundene. Det hindrer at NordNett blir gratis
          transit mellom sine peers eller mellom sine providers.
        </p>
      </Example>

      <Hvorfor title="Hvorfor er BGP policy-basert i stedet for shortest-path?">
        <p>
          Internett er ikke ett selskap — det er ~75 000 kommersielle aktører som har inngått
          forretningsavtaler med hverandre. Hver av disse avtalene koster eller tjener penger. En
          shortest-path-protokoll ville behandlet en peer-lenke og en betalt provider-lenke som
          likeverdige hvis hopp-tallet var det samme. Det ville være katastrofalt for en ISP — den
          ville sende trafikk gjennom dyre transit-lenker når en gratis peer-lenke var tilgjengelig.
        </p>
        <p>
          Derfor separeres policy fra topologi i BGP: alle stier annonseres åpent (sannhet om
          topologi), men hver AS bruker LOCAL_PREF og AS_PATH-prepending til å håndheve
          forretningsavtaler. Det er hvorfor man av og til ser tilsynelatende «irrasjonelle» ruter
          på internett — pakker som tar omveier — fordi en mellomliggende AS valgte en lengre, men
          billigere sti. Gao-Rexford-reglene er minimums-betingelsen for at dette ikke kollapser i
          oscilleringer.
        </p>
      </Hvorfor>

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
      <Header num="5.4" title="SDN control-plane — OpenFlow og logisk sentralisering" />

      <p className="text-muted-foreground">
        Den interaktive simulatoren under viser hvordan SDN-controlleren reagerer på en
        lenke-feil ved å re-beregne forwarding og pushe nye flow-regler til switchene innen
        ms. Toggle til «distribuert» modus for å se hvor mye treigere klassisk OSPF/BGP
        konvergerer.
      </p>
      <Section54Live />

      <p className="text-muted-foreground">
        Software-Defined Networking flytter control-plane ut av hver switch og inn i en logisk
        sentral controller. Switchen reduseres til en programmerbar match-action-tabell. Modellen
        vant i datasentre fordi den passer perfekt med hvordan store cloud-aktører tenker —
        infrastruktur som software.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            { term: "SDN", body: "Control-plane flyttes til ekstern, programmerbar controller." },
            { term: "SDN-arkitektur", body: "Tre lag: infrastruktur, controller, applikasjoner." },
            { term: "OpenFlow", body: "Sør-bound API: controller installerer flow-entries." },
            { term: "Flow-entry", body: "Match-felter → action (forward/drop/modify)." },
            { term: "Match-felter", body: "12-40 headers: IP, MAC, port, VLAN m.fl." },
            { term: "Action-set", body: "Forward, drop, set-field, group, push/pop label." },
            { term: "Match-action", body: "Generalisert forwarding på vilkårlige headers." },
            {
              term: "Proactive vs reactive",
              body: "Push i forkant, eller PACKET_IN ved ukjent flow.",
            },
            {
              term: "Logisk sentralisering",
              body: "Én abstraksjon — kjører som Raft-cluster bak.",
            },
            { term: "Nord/sør-bound API", body: "App ↔ controller ↔ switch — bytte uten endring." },
            { term: "Network OS", body: "ONOS, OpenDaylight, NSX — apps mot abstraksjon." },
            { term: "SDN vant datasentre", body: "Én eier, homogen utstyr, raske konfig-skift." },
          ]}
        />
        <Illustration caption="OpenFlow-melding fra controller til switch installerer en ny flow-entry. Pakker som matcher får valgt action.">
          <OpenFlowSvg />
        </Illustration>
      </div>

      <Metafor tittel="Flytrafikk-kontrolltårnet">
        <p>
          I 1950-tallets luftfart fløy hvert fly «autopilot per fly» — kapteinen så vinduet, radioen
          og kartet, og bestemte selv. Det fungerte med 10 fly. Med 1000 ble det
          kollisjons-katastrofe.
        </p>
        <p>
          Løsningen var <em>kontrolltårnet</em>: én sentral som ser alle radar-skjermer samtidig,
          har global oversikt, og dirigerer hvert fly. Flyene gjør bare det tårnet sier.
        </p>
        <p>
          SDN er kontrolltårnet for datasentre. Tradisjonelle OSPF-rutere er «autopilot per fly».
          Når du har 10 000 servere som skal kommunisere optimalt, vil du ha sentralisert oversikt
          som kan reservere båndbredde, holde tenants adskilt og optimalisere globalt.
        </p>
      </Metafor>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="Match-action = sorterings-bånd på Posten">
          <p>
            På et postsenter går alle pakkene over et bånd. Et kamera leser opplysninger på hver
            pakke: postnummer, prioritet, vekt. Basert på reglene («pakker til 0xxx Oslo går til
            bånd 3, prioritert til bånd 1») dyttes pakken på riktig sidebånd.
          </p>
          <p>
            En OpenFlow-switch er nøyaktig dette: les headere (postnummer, vekt), match mot
            tabell-regler, gjør action (sidebånd). Sjefen kan endre reglene på dagen — det skjer som
            FLOW_MOD fra controlleren.
          </p>
        </Metafor>
        <Illustration caption="Proactive vs reactive: pre-installert vs PACKET_IN-trigget flow-entry.">
          <ProactiveVsReactiveSvg />
        </Illustration>
      </div>

      <Metafor tittel="Hvorfor ikke SDN på hele internett?">
        <p>
          Tenk om hele Europa skulle ha ett felles trafikkkontrolltårn for all bil-trafikk. Ville
          fungere hvis det fantes ett land som eide alle veier, alle biler, alle førerne. Men Europa
          er 27 land med ulike trafikkregler, ulike språk og konkurrerende interesser. Ingen ville
          gi opp suvereniteten til Brussel.
        </p>
        <p>
          Internettet er sånn. 75 000 selvstendige AS-er. SDN passer der ett selskap eier alt
          (Google, AWS, Meta). På internett-skala forblir BGP — distribuert diplomati — eneste
          alternativ.
        </p>
      </Metafor>

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

      <Example title="Eksempel: VM-migrasjon i et tenant-segment">
        <p>
          Et datasenter kjører en tenant «Finans» på VLAN 137. En VM «db-primary» flyttes live fra
          rack A til rack D mens den fortsatt har åpne klient-tilkoblinger.
        </p>
        <ol className="list-decimal pl-5 mt-1">
          <li>
            Hypervisor i rack D varsler SDN-controlleren før migrasjons-pause: «db-primary kommer
            til min toR-switch på port 23 om 200 ms».
          </li>
          <li>
            Controlleren regner deltaet: alle flow-entries i rack-A-toR med dst=db-primaryMAC
            fjernes, nye entries pushes til rack-D-toR og spine-switcher som rutet trafikk dit før.
          </li>
          <li>
            Hypervisor flytter VM-en. Etter ~10 ms TCP-stillstand er nye entries plassert, og
            klient-trafikk strømmer mot rack D uten at klientene noensinne ser et tap.
          </li>
        </ol>
        <p className="mt-2">
          I et tradisjonelt nett ville dette krevd at hver ruter selv lærte at MAC-en hadde flyttet
          seg (via ARP, MAC-aging) — sekunder med blackhole. SDN flytter koordineringen til
          controlleren som kan time det perfekt med hypervisoren.
        </p>
      </Example>

      <Hvorfor title="Hvorfor sentralisere kontroll i SDN?">
        <p>
          Distribuert ruting har én fundamental begrensning: hver ruter ser bare en lokal del av
          bildet. Det er kraftig for robusthet — ingen single point of failure — men det betyr at
          globale optimaliseringer er umulige. Du kan ikke be 100 rutere om å sammen reservere
          båndbredde til en spesifikk video-flow gjennom nettet uten en koordinator. Du kan ikke
          enkelt si «alle Finans-tenant pakker skal isoleres fra Marketing-tenant» når policyen er
          definert per tenant, ikke per ruter.
        </p>
        <p>
          Sentralisert SDN gir global oversikt gratis: controlleren ser hele topologien, all flow-
          statistikk, alle tenant-konfigurasjoner. Den kan kjøre globale algoritmer (ECMP med
          load-bevissthet, segment routing, micro-segmentation-firewall) som krever
          tverr-rutere-koordinering. Pris-en er at SDN passer best for én eier (datasenter, en
          enkelt ISP-backbone) — det er hvorfor internett-core forblir BGP-distribuert.
        </p>
      </Hvorfor>

      <RelatedSlugs slugs={["dte2507-ruting"]} />
    </article>
  );
}

// ============================================================
// 5.5 — ICMP og nettverks-administrasjon (SNMP)
// ============================================================
function Section5IcmpSnmp() {
  return (
    <div className="space-y-6">
      <article className="space-y-4 text-sm">
        <Header num="5.5" title="ICMP og SNMP — diagnostikk og overvåking" />
        <p className="text-muted-foreground">
          Den interaktive simulatoren under har to deler. (a) ICMP-modus viser hvordan
          <span className="font-mono"> traceroute</span> sender pakker med økende TTL og bruker
          ICMP «Time Exceeded»-svar til å avsløre hvert hop. (b) SNMP-modus viser polling med
          GET/Response og asynkrone TRAP-meldinger fra agent til manager.
        </p>
        <Section55Live />
      </article>
      <Section56 />
      <SectionSnmp />
    </div>
  );
}

function SectionSnmp() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="5.5 (forts.)" title="SNMP — nettverks-administrasjon" />

      <p className="text-muted-foreground">
        ICMP rapporterer feil for én pakke. Men hvis du eier 500 rutere og 10 000 switcher, trenger
        du noe annet: en måte å hente status-statistikker (CPU-last, pakker droppet, lenke-tilstand)
        og motta varsler proaktivt. Det er SNMP — Simple Network Management Protocol.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            { term: "SNMP", body: "Manager-agent-protokoll over UDP 161 / 162 (trap)." },
            { term: "Manager / NMS", body: "Sentral server som spør og samler — Nagios, Zabbix, Cacti." },
            { term: "Agent", body: "Liten daemon i ruteren som svarer på SNMP-spørsmål." },
            { term: "MIB", body: "Management Information Base — hierarki av variabler." },
            { term: "OID", body: "Object Identifier — punktum-separert sti i MIB, f.eks. 1.3.6.1.2.1.1.3.0." },
            { term: "GET / GETNEXT", body: "Manager spør om verdien til en OID, eller neste i treet." },
            { term: "SET", body: "Manager skriver en verdi — sjelden brukt, sikkerhets-følsomt." },
            { term: "TRAP / INFORM", body: "Agent pusher en hendelse til manager uoppfordret." },
            { term: "Walk", body: "GETNEXT-sløyfe som dumper hele subtreet — vanlig diagnose-verktøy." },
            { term: "v1 / v2c / v3", body: "v1+v2c bruker community-string i klartekst; v3 har auth/encryption." },
            { term: "Community-string", body: "«public» / «private» — som passord, ofte feil-konfigurert." },
            { term: "ASN.1 / BER", body: "Hvordan SNMP-meldinger serialiseres på tråden." },
          ]}
        />
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Typisk SNMP-flyt
          </h3>
          <ol className="list-decimal pl-5 space-y-1.5 text-[13px] text-muted-foreground">
            <li>
              <strong>Polling:</strong> NMS-en (manager) sender GET-requests hvert 60. sekund til
              hver ruter — «hva er nåværende bytes-inn på port 3?». Agenten svarer.
            </li>
            <li>
              <strong>Graf:</strong> NMS-en plotter tidsserien — operatøren ser CPU-bruk, lenke-
              utilisering, droppede pakker i sanntid.
            </li>
            <li>
              <strong>Trap:</strong> Hvis noe alvorlig skjer (lenke ned, autentisering feilet,
              tunnel ned), sender ruteren en TRAP uten å vente på spørsmål. NMS-en kan trigge
              alarm — SMS, e-post, PagerDuty.
            </li>
            <li>
              <strong>SET (sjelden):</strong> Operatør kan skrive verdier (slå av port). De fleste
              shop-er deaktiverer SET fordi det er for farlig — heller bruker NETCONF/RESTCONF
              eller manuelle SSH-økter for konfig.
            </li>
          </ol>
        </div>
      </div>

      <Metafor tittel="SNMP = inspektør med klikkbrett">
        <p>
          Tenk SNMP-manageren som en inspektør som hver morgen går rundt på fabrikken og spør hver
          maskin: «Hvor mange enheter har du produsert? Hva er temperaturen? Var det noen feil?»
          Maskinen (agenten) har en standard liste av tall klar (MIB) og leverer svaret. Inspektøren
          skriver det inn i regnearket sitt og plotter trender.
        </p>
        <p>
          Trap-en er motsatt: hvis det begynner å brenne i maskinen, ringer den selv til inspektøren
          uten å vente på morgenrunden. Det er hvordan operatørsenteret får «Lenke ned!»-varsel
          umiddelbart, ikke etter neste polling-runde.
        </p>
      </Metafor>

      <Metafor tittel="MIB = bibliotekets Dewey-system">
        <p>
          Hvert «variabel-tall» i en ruter (sysName, ifInOctets, ipForwarding) har en lang adresse
          som ser ut som <code className="font-mono">1.3.6.1.2.1.2.2.1.10.3</code>. Det er en sti
          ned i et felles standardisert hierarki, akkurat som Dewey-systemet i et bibliotek:
          1.3.6.1.2.1 = «standard internet MIB», 2 = «interfaces», 2.1 = «interface table», 10 =
          «ifInOctets», 3 = «port 3».
        </p>
        <p>
          Det er hvorfor du kan kjøre <code className="font-mono">snmpwalk</code> mot en Cisco og en
          Juniper og få sammenlignbare data — begge implementerer MIB-2 (RFC 1213) på samme sted i
          treet.
        </p>
      </Metafor>

      <Example title="Eksempel: snmpget mot en switch">
        <p className="font-mono text-[12px]">
          $ snmpget -v2c -c public sw-stack-01 SNMPv2-MIB::sysUpTime.0
          <br />
          SNMPv2-MIB::sysUpTime.0 = Timeticks: (4827300) 13:24:33.00
          <br />
          <br />
          $ snmpwalk -v2c -c public sw-stack-01 IF-MIB::ifInOctets
          <br />
          IF-MIB::ifInOctets.1 = Counter32: 2890123456
          <br />
          IF-MIB::ifInOctets.2 = Counter32: 1023487654
          <br />
          IF-MIB::ifInOctets.3 = Counter32: 78654321
        </p>
        <p className="mt-2">
          Operatøren kjører dette én gang for å lære at switchen har vært oppe i 13 timer 24 min, og
          så lar NMS-en polle ifInOctets hvert minutt og regne ut (verdi-nå − verdi-forrige) ÷ 60 s =
          bytes/s. Det blir grafene du ser på Grafana eller LibreNMS.
        </p>
      </Example>

      <Hvorfor title="Hvorfor er SNMP fortsatt overalt, til tross for at det er en 30-årig protokoll?">
        <p>
          SNMP er ikke vakker — UDP-basert, klartekst-community-strings i v1/v2c, MIB-strukturen er
          OpenLISP. Men det er overalt. Hver eneste IP-enhet (rutere, switcher, UPS-er, printere,
          IP-kameraer) har en SNMP-agent. Det er den eneste protokollen alle leverandører støtter på
          tvers av leverandører, modeller og firmware-versjoner.
        </p>
        <p>
          Etterfølgerne (NETCONF, RESTCONF, gNMI, OpenConfig) er bedre konstruerte — strukturerte
          YANG-modeller, transaksjoner, streaming-telemetri — men de er fortsatt ikke universelt
          implementerte. Så i 2025 er bildet at moderne datasentre bytter til streaming-telemetri,
          mens enterprise-nettverk fortsatt henger på SNMP for de fleste poll-bruksområder. Trap-en
          fra en 15 år gammel switch er fortsatt det første en operatør ser på vakta.
        </p>
      </Hvorfor>

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

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            { term: "ICMP", body: "Feilmelding-kanal oppå IP — ikke transport." },
            { term: "Type + kode", body: "Hovedtype + sub-type, ca 30 kombinasjoner." },
            { term: "Echo Req/Reply (8/0)", body: "Pings byggesteiner — måler RTT." },
            { term: "Dest Unreachable (3)", body: "«Kan ikke levere» med kode-detalj." },
            { term: "Type 3, kode 4", body: "Pakke for stor, fragmentering nektet." },
            {
              term: "Time Exceeded (11)",
              body: "TTL nådde 0 — pakke kastet. Brukes av traceroute.",
            },
            { term: "Source Quench (4)", body: "Deprekert — TCP styrer congestion nå." },
            { term: "Redirect (5)", body: "«Bruk en annen first-hop» — ofte deaktivert." },
            { term: "Router Solicit/Adv (9/10)", body: "Host finner rutere; sentralt i IPv6." },
            { term: "Ping", body: "Echo Request → Reply, tell sekvensnummer." },
            { term: "Traceroute", body: "Stigende TTL → hver ruter svarer Time Exceeded." },
            { term: "Rate-limiting", body: "ICMP genereres i CPU — begrenset, derfor «*»." },
            { term: "ICMP-sikkerhet", body: "Kan spoofes; mange firewalls filtrerer." },
          ]}
        />
        <Illustration caption="Traceroute: pakker med TTL 1, 2, 3 trigger Time Exceeded fra hver ruter underveis.">
          <TracerouteSvg />
        </Illustration>
      </div>

      <Metafor tittel="Taxi som ringer hjem med dårlige nyheter">
        <p>
          IP er som en taxisentral som bare videresender adresser uten å bry seg om noe annet. Hvis
          taxien havner i en blindgate eller bruker for lang tid, sier IP ingenting. Men taxien selv
          (ruteren) har en separat mobiltelefon (ICMP) som hun bruker for å ringe hjem og si:
          «Adressen finnes ikke», «Du sa jeg skulle dit, men det er steng vei», «Det var en pakke
          til deg som var for stor for hovedgaten».
        </p>
        <p>
          Det er hele poenget med ICMP: separat diagnose-kanal som rutere bruker for å si fra om
          ting underveis. Uten den ville nettet vært en svart boks der ting bare forsvinner.
        </p>
      </Metafor>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="Traceroute = etterforsker med 4 brev">
          <p>
            En etterforsker vil kartlegge hvilke hender et brev passerer mellom Bodø og Tromsø. Hun
            sender 5 brev til Tromsø, men hvert brev har en lapp:
          </p>
          <ul className="list-disc pl-5">
            <li>Brev 1: «Åpne kun ved 1. station»</li>
            <li>Brev 2: «Åpne kun ved 2. station»</li>
            <li>... osv.</li>
          </ul>
          <p>
            Hver postsorterer som åpner et brev finner en instruks: «Returner avsender og si hvor du
            er». Slik kartlegges hele kjeden uten å vite den på forhånd. Det er nøyaktig traceroute:
            hver TTL er en lapp, hver Time Exceeded-melding er en returkupp.
          </p>
        </Metafor>
        <Illustration caption="Ping vs traceroute: én rundtur vs. en kjede av rundturer.">
          <PingVsTracerouteSvg />
        </Illustration>
      </div>

      <Metafor tittel="PMTUD black hole = pakken er for stor, men ingen sier ifra">
        <p>
          Forestill deg at en stor pakke skal gjennom en lav undergang. Sjåføren får ICMP-melding
          «Du er for høy, bytt til lav-MTU»: han kjører rundt, mindre pakker. Fungerer.
        </p>
        <p>
          Men hvis et byråkrat-firewall sier «Vi tar ikke imot meldinger om for-store-pakker»
          (filtrerer ICMP Type 3 Code 4), så får aldri sjåføren beskjed. Han prøver igjen, og igjen,
          og igjen. Pakkene forsvinner. Forbindelsen henger. Det er PMTUD-black-hole — én av de mest
          forrædersk-feilende konfig-feilene i nettverk.
        </p>
      </Metafor>

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

      <Example title="Eksempel: PMTUD-feil i en VPN-tunnel">
        <p>En bruker klager: «små nettsider laster, men store filer henger». Sysadmin tracer:</p>
        <ol className="list-decimal pl-5 mt-1">
          <li>
            Brukerens link-MTU er 1500, men trafikken går gjennom en VPN som legger til 60 byte
            header. Den effektive MTU blir 1440 på en pakke kapslet i tunnelen.
          </li>
          <li>
            Klienten sender TCP-segmenter på 1500 byte med DF-flagget satt. Ved tunnel-inngangen kan
            ikke ruteren fragmentere; den må droppe pakken og sende ICMP Type 3 Kode 4
            (fragmentation needed, next-hop MTU = 1440) tilbake.
          </li>
          <li>
            Men firewall midt-på filtrerer all ICMP utgående. Senderen ser bare et pakketap, ikke
            grunnen. TCP retransmitterer samme størrelse → samme drop. Resultat: forbindelsen
            henger.
          </li>
        </ol>
        <p className="mt-2">
          Diagnose: <code className="font-mono">ping -s 1480 -M do destinasjon</code> faller ut,
          mens <code className="font-mono">-s 1410</code> går gjennom. Løsning: enten åpne ICMP
          Type-3-Kode-4 i firewall, eller manuelt sette MSS-clamping på VPN-gateway-en. Det er en
          PMTUD-black-hole, og helt avhengig av at ICMP fungerer for å være automatisk
          diagnostiserbar.
        </p>
      </Example>

      <Hvorfor title="Hvorfor er ICMP en separat protokoll og ikke en del av IP eller TCP?">
        <p>
          IP er bevisst designet som «best-effort»: pakken blir levert hvis den kan, ellers tapt
          stille. Hvis IP selv skulle bære feilmeldinger, måtte hver pakke ha plass til en evt.
          retur-melding — sløsing for de 99% av pakker som leveres uten problemer. ICMP holder IP-en
          smal og raskt og legger feilrapportering på et eget logisk lag.
        </p>
        <p>
          Hvorfor ikke TCP da? Fordi feilene som rapporteres (TTL utløpt, host unreachable, MTU for
          stor) er typisk forårsaket av rutere i nettet, ikke endepunktene. TCP eksisterer bare
          mellom sender og mottaker; rutere kan ikke snakke TCP til kilden. ICMP er en
          «out-of-band»-kanal hvor mellomliggende rutere kan rapportere problemer tilbake til kilden
          — det er den arkitektoniske grunnen til at den finnes som egen protokoll.
        </p>
      </Hvorfor>

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

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            { term: "DHCP", body: "Dynamisk IP-tildeling over UDP 67/68." },
            { term: "DHCP-server", body: "Eier pool, leier IP-er til klienter." },
            { term: "DORA", body: "Discover, Offer, Request, Ack — 4-stegs dans." },
            { term: "Discover (1)", body: "Klient broadcaster «finnes server her?»." },
            { term: "Offer (2)", body: "Server tilbyr IP + gateway + DNS + lease." },
            { term: "Request (3)", body: "Klient velger tilbud, broadcaster bekreftelse." },
            { term: "Ack (5)", body: "Server bekrefter — klient kan bruke IP-en." },
            { term: "Hvorfor broadcast", body: "Klient har ingen IP enda — kan ikke unicaste." },
            { term: "Lease-tid", body: "Typisk 1-24 timer; må fornyes før utløp." },
            { term: "T1 og T2", body: "50% renewal unicast, 87.5% rebind broadcast." },
            { term: "Relay Agent", body: "Ruter videresender Discover til sentral server." },
            { term: "DHCP-opsjoner", body: "Subnet, gateway, DNS, NTP, domain — alt mulig." },
            { term: "DECLINE/RELEASE", body: "IP er i bruk / frigi adresse tidlig." },
            { term: "Link-local 169.254", body: "Auto-fallback når DHCP feiler helt." },
          ]}
        />
        <Illustration caption="DORA: fire broadcasts mellom klient og server gir klienten en IP-adresse på under et sekund.">
          <DhcpDoraSvg />
        </Illustration>
      </div>

      <Metafor tittel="Hotell-innsjekk med tidsbegrenset romnøkkel">
        <p>
          Du kommer til et hotell uten å vite romnummer. I resepsjonen utveksler dere fire
          setninger:
        </p>
        <ol className="list-decimal pl-5">
          <li>«Hei, har dere rom?» (Discover — du roper inn til lobbyen)</li>
          <li>«Ja, rom 412 er ledig, ditt i 24 timer» (Offer — resepsjonisten foreslår)</li>
          <li>«Ja takk, jeg tar 412» (Request — du bekrefter formelt)</li>
          <li>«Avtalt, her er nøkkelen» (Ack — du får tilgang)</li>
        </ol>
        <p>
          Du sjekker også ut igjen når oppholdet er ferdig (RELEASE), og dersom du blir lengre må du
          forlenge ved halv-tid (T1 renewal). Hele DHCP er rett og slett hotell-protokollen for
          IP-adresser.
        </p>
      </Metafor>

      <div className="grid gap-3 lg:grid-cols-2">
        <Metafor tittel="Hvorfor 4 steg og ikke 2?">
          <p>
            Tenk om hotellet har flere resepsjonister som hører deg samtidig. Hvis du sa «gi meg et
            rom», kunne to resepsjonister gi deg ulike rom samtidig — og begge rommene blir
            blokkert. Resepsjonisten som ikke ble valgt, må også få vite det så hun kan gi rommet
            videre til neste gjest.
          </p>
          <p>
            Det er DORA-poenget: Discover &amp; Offer er åpning. Request &amp; Ack er den
            eksplisitte «jeg velger denne, dere andre kan trekke deres tilbud»-fasen. Det er hvorfor
            4 steg er nødvendig når det kan være flere DHCP-servere på samme nett.
          </p>
        </Metafor>
        <Illustration caption="Lease-tidslinje: T1=50% (renewal), T2=87.5% (rebind), 100% expire (ny DORA).">
          <DhcpLeaseTimelineSvg />
        </Illustration>
      </div>

      <Metafor tittel="Relay-agent = hotell-portier mellom mange filialer">
        <p>
          Et stort konsern har 200 kontorbygg, men én sentral nøkkel-administrator i hovedkontoret.
          Når en ansatt går inn i bygg 47 og ber om romnøkkel, ringer portieren i bygg 47 til
          hovedkontoret: «Vi har en gjest her, hun er i bygg 47, gi henne en nøkkel fra pool nr 47».
          Hovedkontoret vet ikke selv hvilket bygg gjesten er i før portieren forteller det.
        </p>
        <p>
          giaddr-feltet i DHCP-pakken er hvordan relay-agenten forteller serveren: «Klienten er på
          subnet 10.0.47.0/24 — gi en adresse fra den poolen».
        </p>
      </Metafor>

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

      <Example title="Eksempel: DHCP-relay over flere subnett i en universitets-campus">
        <p>
          Et universitet har 200 subnett i ett bygg — én per laboratorie og auditorium. De vil ikke
          drifte 200 DHCP-servere, så de plasserer én sentral DHCP-server (10.0.0.5) og bruker
          relay-agents.
        </p>
        <ol className="list-decimal pl-5 mt-1">
          <li>
            En laptop på lab 12 (subnet 10.0.12.0/24) starter opp. Sender DHCPDISCOVER broadcast.
          </li>
          <li>
            ruteren for lab 12 (10.0.12.1) er konfigurert som DHCP-relay. Den fanger broadcast,
            setter giaddr=10.0.12.1, og unicaster pakken til 10.0.0.5.
          </li>
          <li>
            DHCP-serveren ser giaddr=10.0.12.1 og vet at klienten er på subnet 10.0.12.0/24. Den
            velger en ledig adresse fra den pool-en (f.eks. 10.0.12.87), pluss riktig gateway
            (10.0.12.1) og lab-spesifikke DNS.
          </li>
          <li>
            Server sender DHCPOFFER unicast tilbake til relay-en, som broadcaster den på lab 12 sitt
            subnet. Resten av dansen følger samme mønster.
          </li>
        </ol>
        <p className="mt-2">
          giaddr-feltet er nøkkelen: uten det ville serveren bare sett at meldingen kom fra
          relay-rutuens IP og ikke visst hvilket subnet klienten faktisk satt på.
        </p>
      </Example>

      <Hvorfor title="Hvorfor er DHCP det første som skjer når en host kobler til?">
        <p>
          IP-adressen er forutsetningen for nesten alt annet i nettet. ARP, DNS, default gateway,
          TCP-forbindelser — alt krever at host-en har en gyldig IP. DHCP er designet for å være
          self-bootstrappende: klienten kan starte uten å vite noe om nettet hun er på, sende
          broadcast som ikke krever en adresse, og lære alt hun trenger fra ett enkelt utveksling.
        </p>
        <p>
          Hvorfor en hel 4-stegs DORA og ikke 2 (forespørsel, svar)? Fordi det kan være flere
          DHCP-servere på samme link — typisk for redundans. Discover-broadcast lar alle si fra at
          de er der; klienten velger ett tilbud i Request-steget, og de andre serverene kan tilbake-
          ringe sine tilbud. Uten dette ville to servere kunne gi samme klient to ulike adresser i
          samtidig, eller reservere adresser for klienter som aldri kommer tilbake.
        </p>
      </Hvorfor>

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

      <Exercise
        question={
          <>
            <p>
              Et lite AS består av 6 OSPF-rutere i to areas: Area 0 har R-a, R-b, R-c; Area 1 har
              R-d, R-e, R-f. R-c er ABR (Area Border Router) mellom dem. En lenke i Area 1 (R-d til
              R-e) ryker. Beskriv presist hvilke LSA-er som genereres og flooder hvor, og hvorfor
              R-a (i Area 0) ikke trenger å regne Dijkstra på nytt på Area 1-topologien.
            </p>
          </>
        }
        hint="Husk: Type 1 (Router-LSA) er area-lokal. Type 3 (Summary) annonseres av ABR-er mellom areas. Hva endrer seg hvis bare en intra-area lenke ryker, men ingen prefiks blir uoppnåelig?"
        answer={
          <>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                R-d og R-e detekterer at hello-pakkene fra hverandre uteblir (etter dead-interval).
                Begge oppdaterer sin Router-LSA (Type 1): «min lenke til R-e er borte» fra R-d, og
                speil-vendt fra R-e.
              </li>
              <li>
                Type-1-LSA-er flooder kun innenfor Area 1. R-f, R-c (ABR) mottar dem. R-c oppdaterer
                sin Area-1-LSDB.
              </li>
              <li>
                R-c, R-d, R-f kjører Dijkstra på nytt på Area-1-topologien. Forutsatt at det
                fortsatt finnes en sti R-d → R-f → R-e (eller lignende), endres bare interne
                forwarding-tabeller i Area 1.
              </li>
              <li>
                Området bak ABR-en (Area 0) er upåvirket: ingen prefikser ble uoppnåelig, så R-c
                trenger ikke generere en ny Type-3 Summary-LSA. R-a og R-b ser ingen endring.
              </li>
              <li>
                Hvis det derimot ikke fantes alternativ sti, ville R-c sendt en oppdatert Type-3 som
                withdrew det prefikset; bare da måtte R-a regne om sin del.
              </li>
            </ol>
            <p className="mt-2">
              Poenget: areas avskjermer flooding. Lokale endringer i Area 1 forplanter seg ikke til
              Area 0 med mindre de endrer hvilke prefikser som er nåbare.
            </p>
          </>
        }
      />

      <Exercise
        question={
          <>
            <p>BGP path-selection: AS 6 mottar fire stier til prefikset 203.0.113.0/24.</p>
            <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
              <li>P1 via AS7 (peer): LOCAL_PREF=150, AS_PATH=[7, 11], ORIGIN=IGP, MED=10</li>
              <li>P2 via AS8 (kunde): LOCAL_PREF=200, AS_PATH=[8, 9, 11], ORIGIN=IGP, MED=50</li>
              <li>
                P3 via AS9 (kunde): LOCAL_PREF=200, AS_PATH=[9, 11], ORIGIN=Incomplete, MED=20
              </li>
              <li>P4 via AS7 (peer): LOCAL_PREF=150, AS_PATH=[7, 12, 11], ORIGIN=IGP, MED=5</li>
            </ul>
            <p className="mt-1">Hvilken vinner og hvorfor? Begrunn med rute-seleksjons-rekken.</p>
          </>
        }
        hint="Steg 1: LOCAL_PREF. Steg 2: AS_PATH-lengde. Steg 3: ORIGIN (lavere = bedre; IGP=0 &lt; EGP=1 &lt; Incomplete=2). Steg 4: MED."
        answer={
          <>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                <strong>LOCAL_PREF:</strong> P1=150, P2=200, P3=200, P4=150 → P1 og P4 elimineres.
              </li>
              <li>
                <strong>AS_PATH-lengde:</strong> P2=3, P3=2 → P2 elimineres.
              </li>
              <li>
                <strong>Resultat: P3 vinner</strong> (via AS9). Vi trengte ikke å se på ORIGIN, MED
                eller IGP-kost.
              </li>
            </ol>
            <p className="mt-2">
              Merk: ORIGIN-trinnet ville trolig disqualifisert P3 (Incomplete) over P2 (IGP) HVIS de
              hadde nådd så langt. Men AS_PATH-trinnet brytes først, og P3 vant der. Det er hvorfor
              ordensn (LOCAL_PREF → AS_PATH → ORIGIN → MED) er nøye spesifisert: tidligere trinn
              vinner uansett hva senere trinn ville sagt.
            </p>
          </>
        }
      />

      <Exercise
        question="En SDN-controller administrerer en switch med en flow-tabell. Tabellen har: (1) prio=100, match=dst-IP=10.0.0.5, action=output port 3; (2) prio=50, match=dst-IP=10.0.0.0/24, action=output port 4; (3) prio=10, match=*, action=send-to-controller. En pakke kommer med dst-IP=10.0.0.5, src-IP=10.0.0.99. Hvilken action utføres? Hva skjer hvis pakken har dst-IP=10.0.0.50? Hva hvis dst-IP=8.8.8.8?"
        hint="Match-action: alle entries med matchende felter vurderes, høyeste prioritet vinner. Default («catch-all») entry har lavest prio."
        answer={
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              <strong>10.0.0.5</strong>: Entry 1 (prio=100) og entry 2 (prio=50) matcher begge. 100
              &gt; 50, så <strong>output port 3</strong> utføres.
            </li>
            <li>
              <strong>10.0.0.50</strong>: Entry 1 matcher ikke (annen IP), entry 2 matcher (samme
              /24). Action: <strong>output port 4</strong>.
            </li>
            <li>
              <strong>8.8.8.8</strong>: Verken entry 1 eller 2 matcher. Entry 3 (catch-all) matcher.
              Action: <strong>send-til-controller</strong>. Controlleren mottar PACKET_IN-melding,
              avgjør hva som skal gjøres, og installerer typisk en ny flow-entry så framtidige
              pakker ikke trenger controller-rundtur.
            </li>
          </ol>
        }
      />

      <Exercise
        question={
          <>
            <p>En klient kobler seg til et nytt nett. Wireshark fanger 4 pakker:</p>
            <ul className="list-disc pl-5 mt-1 font-mono text-[12px]">
              <li>t=0.000 src=0.0.0.0:68 dst=255.255.255.255:67, UDP, BOOTP-Request, opt 53=1</li>
              <li>
                t=0.020 src=10.50.0.1:67 dst=255.255.255.255:68, UDP, BOOTP-Reply, opt 53=2,
                yiaddr=10.50.0.142
              </li>
              <li>
                t=0.025 src=0.0.0.0:68 dst=255.255.255.255:67, UDP, BOOTP-Request, opt 53=3,
                requested-IP=10.50.0.142
              </li>
              <li>
                t=0.045 src=10.50.0.1:67 dst=255.255.255.255:68, UDP, BOOTP-Reply, opt 53=5,
                yiaddr=10.50.0.142
              </li>
            </ul>
            <p className="mt-1">
              Hva betyr opsjon 53 for hver pakke? Hvilken IP fikk klienten, og hvorfor sendes alle
              fire pakker som broadcast? Hva blir T1- og T2-tidspunktet hvis lease=3600 s?
            </p>
          </>
        }
        hint="Opsjon 53 er DHCP-message-type. 1=Discover, 2=Offer, 3=Request, 5=Ack. yiaddr = 'your IP address'."
        answer={
          <>
            <p>
              Opsjon 53 verdier mapper til DORA: 1=DISCOVER, 2=OFFER, 3=REQUEST, 5=ACK. Klienten
              fikk IP-en <strong>10.50.0.142</strong> (yiaddr-feltet).
            </p>
            <p className="mt-2">
              Alle fire pakker er broadcast fordi klienten ikke har en gyldig unicast-IP før ACK er
              mottatt. Tradisjonelt er også svarene broadcastet for å sikre at klienten mottar dem
              uten å trenge ARP-oppslag på en ennå ikke-konfigurerte adresse — men noen klienter ber
              om unicast-svar via BROADCAST-flagget i klient-MAC-feltet.
            </p>
            <p className="mt-2">
              Med lease=3600 s: <strong>T1 = 50% = 1800 s</strong> (klient sender Request unicast
              direkte til serveren for renewal). <strong>T2 = 87.5% = 3150 s</strong> (hvis ingen
              ack ennå, broadcast Request til hvilken som helst server). Etter 3600 s uten ack
              kastes adressen og full DORA starter på nytt.
            </p>
          </>
        }
      />

      <Exercise
        question="Sammenlign konvergens-tid for tre topologi-endringer: (a) en lenke ryker i et OSPF-AS med default-timere, (b) en lenke ryker i en SDN-controller som har en BFD-sesjon med 100 ms detection, (c) en hel AS blir uoppnåelig pga BGP-withdrawal som propagerer ut. Hvilken er raskest, og hvilken kan ta MINUTTER?"
        hint="OSPF: hello/dead = 10s/40s default. BFD: 100 ms / 300 ms detection. BGP: avhengig av MRAI-timer (Minimum Route Advertisement Interval, typisk 30 s) og hop-count gjennom internett."
        answer={
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              <strong>(b) SDN med BFD</strong>: ~100-500 ms. BFD (Bidirectional Forwarding
              Detection) detekterer tap raskt, controlleren har global topologi og kan regne ny FIB
              umiddelbart og push ut til alle switcher i én OpenFlow-runde. Klart raskest.
            </li>
            <li>
              <strong>(a) OSPF</strong>: ~10-40 s med default-timere (dead-interval = 40 s). Hvis
              operatøren har tunet til 1s/3s, kan det komme ned til ~3-5 s. Dijkstra-kjøringen
              etterpå er sub-sekund.
            </li>
            <li>
              <strong>(c) BGP-withdrawal globalt</strong>: kan ta <strong>2-30 minutter</strong>.
              Hver AS sitter med MRAI-timer (typisk 30 s) før den sender oppdatert prefiks-info
              videre. Med en hop-count på 5-10 AS-er globalt, summerer det seg. Path exploration —
              hvor AS-er prøver alternative stier før de gir opp — kan utvide dette ytterligere.
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

function Hvorfor({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-sky-700 dark:text-sky-400 font-semibold mb-1">
        Hvorfor?
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
        🔮 Metafor
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

function DataVsControlSpeedSvg() {
  return (
    <svg viewBox="0 0 500 230" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        To hastighets-domener i én ruter
      </text>

      {/* Data-plane row */}
      <rect
        x={30}
        y={40}
        width={440}
        height={60}
        rx={6}
        className="fill-success/10 stroke-success"
        strokeWidth={2}
      />
      <text x={50} y={62} className="fill-success text-[11px] font-semibold">
        Data-plane (ASIC)
      </text>
      <text x={50} y={80} className="fill-muted-foreground text-[9px]">
        slå opp prefiks, dekr. TTL, send ut-port
      </text>
      <text x={50} y={94} className="fill-muted-foreground text-[9px] font-mono">
        ~5 ns / pakke • Tbps throughput
      </text>

      {/* speed gauge */}
      <text x={400} y={68} className="fill-success text-[20px] font-bold font-mono">
        ns
      </text>
      <text x={400} y={85} className="fill-muted-foreground text-[8px]">
        nanosekund
      </text>

      {/* Gap arrow */}
      <text
        x={250}
        y={120}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] italic"
      >
        skille 10⁶
      </text>

      {/* Control-plane row */}
      <rect
        x={30}
        y={130}
        width={440}
        height={60}
        rx={6}
        className="fill-brand/10 stroke-brand"
        strokeWidth={2}
      />
      <text x={50} y={152} className="fill-brand text-[11px] font-semibold">
        Control-plane (CPU)
      </text>
      <text x={50} y={170} className="fill-muted-foreground text-[9px]">
        naborelasjoner, Dijkstra, oppdater FIB
      </text>
      <text x={50} y={184} className="fill-muted-foreground text-[9px] font-mono">
        ~10 ms / hendelse • få oppdateringer/sek
      </text>

      <text x={400} y={158} className="fill-brand text-[20px] font-bold font-mono">
        ms
      </text>
      <text x={400} y={175} className="fill-muted-foreground text-[8px]">
        millisekund
      </text>

      <text x={250} y={215} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Separasjonen lar hastighet og fleksibilitet leve i fred ved siden av hverandre.
      </text>
    </svg>
  );
}

function BellmanFordSvg() {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Bellman-Ford: hver ruter har en tabell, sender til naboer
      </text>

      {[
        { x: 90, y: 90, label: "A", t: ["A:0", "B:1", "C:2"] },
        { x: 250, y: 90, label: "B", t: ["A:1", "B:0", "C:1"] },
        { x: 410, y: 90, label: "C", t: ["A:2", "B:1", "C:0"] },
      ].map((n) => (
        <g key={n.label}>
          <circle cx={n.x} cy={n.y} r={22} className="fill-card stroke-brand" strokeWidth={2} />
          <text
            x={n.x}
            y={n.y + 4}
            textAnchor="middle"
            className="fill-foreground text-[14px] font-bold"
          >
            {n.label}
          </text>
          {/* Table */}
          <rect
            x={n.x - 35}
            y={n.y + 30}
            width={70}
            height={56}
            className="fill-card stroke-foreground/30"
            strokeWidth={1}
          />
          {n.t.map((row, i) => (
            <text
              key={i}
              x={n.x}
              y={n.y + 46 + i * 14}
              textAnchor="middle"
              className="fill-foreground text-[9px] font-mono"
            >
              {row}
            </text>
          ))}
        </g>
      ))}

      {/* Links */}
      <line x1={112} y1={90} x2={228} y2={90} className="stroke-foreground/40" strokeWidth={2} />
      <text x={170} y={84} textAnchor="middle" className="fill-foreground text-[9px] font-mono">
        1
      </text>
      <line x1={272} y1={90} x2={388} y2={90} className="stroke-foreground/40" strokeWidth={2} />
      <text x={330} y={84} textAnchor="middle" className="fill-foreground text-[9px] font-mono">
        1
      </text>

      {/* Exchange arrows */}
      <text
        x={170}
        y={205}
        textAnchor="middle"
        className="fill-purple-700 dark:fill-purple-400 text-[9px]"
      >
        A sender DV → B
      </text>
      <text
        x={330}
        y={205}
        textAnchor="middle"
        className="fill-purple-700 dark:fill-purple-400 text-[9px]"
      >
        B sender DV → C
      </text>
      <text x={250} y={225} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Hver ruter holder bare nabo-info; full sannhet bygges asynkront.
      </text>
    </svg>
  );
}

function LsaFlowSvg() {
  return (
    <svg viewBox="0 0 500 250" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        LSA-typer og hvor de flommer
      </text>

      {/* Area 1 */}
      <rect
        x={20}
        y={40}
        width={140}
        height={170}
        rx={6}
        className="fill-success/10 stroke-success"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      <text x={90} y={56} textAnchor="middle" className="fill-success text-[10px] font-semibold">
        Area 1
      </text>
      <text x={90} y={75} textAnchor="middle" className="fill-foreground text-[8px] font-mono">
        Type 1, 2 (interne)
      </text>
      <circle cx={50} cy={110} r={9} className="fill-card stroke-success" strokeWidth={1.5} />
      <circle cx={130} cy={110} r={9} className="fill-card stroke-success" strokeWidth={1.5} />
      <circle cx={90} cy={150} r={9} className="fill-card stroke-success" strokeWidth={1.5} />
      <line x1={50} y1={110} x2={130} y2={110} className="stroke-success/40" strokeWidth={1} />
      <line x1={50} y1={110} x2={90} y2={150} className="stroke-success/40" strokeWidth={1} />

      {/* ABR 1 */}
      <circle
        cx={180}
        cy={125}
        r={11}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={2}
      />
      <text
        x={180}
        y={108}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[8px] font-semibold"
      >
        ABR
      </text>

      {/* Area 0 */}
      <rect
        x={200}
        y={40}
        width={140}
        height={170}
        rx={6}
        className="fill-brand/10 stroke-brand"
        strokeWidth={2}
        strokeDasharray="4 3"
      />
      <text x={270} y={56} textAnchor="middle" className="fill-brand text-[10px] font-semibold">
        Area 0 (backbone)
      </text>
      <text x={270} y={75} textAnchor="middle" className="fill-foreground text-[8px] font-mono">
        + Type 3 (Summary)
      </text>
      <circle cx={230} cy={120} r={9} className="fill-card stroke-brand" strokeWidth={1.5} />
      <circle cx={270} cy={140} r={9} className="fill-card stroke-brand" strokeWidth={1.5} />
      <circle cx={310} cy={120} r={9} className="fill-card stroke-brand" strokeWidth={1.5} />
      <line x1={230} y1={120} x2={310} y2={120} className="stroke-brand/40" strokeWidth={1} />
      <line x1={230} y1={120} x2={270} y2={140} className="stroke-brand/40" strokeWidth={1} />

      {/* ABR 2 */}
      <circle
        cx={360}
        cy={125}
        r={11}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={2}
      />
      <text
        x={360}
        y={108}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[8px] font-semibold"
      >
        ABR
      </text>

      {/* Area 2 */}
      <rect
        x={380}
        y={40}
        width={100}
        height={170}
        rx={6}
        className="fill-success/10 stroke-success"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      <text x={430} y={56} textAnchor="middle" className="fill-success text-[10px] font-semibold">
        Area 2
      </text>
      <text x={430} y={75} textAnchor="middle" className="fill-foreground text-[8px] font-mono">
        Type 1, 2
      </text>
      <circle cx={410} cy={110} r={9} className="fill-card stroke-success" strokeWidth={1.5} />
      <circle cx={450} cy={150} r={9} className="fill-card stroke-success" strokeWidth={1.5} />
      <line x1={410} y1={110} x2={450} y2={150} className="stroke-success/40" strokeWidth={1} />

      {/* Flooding labels */}
      <text x={90} y={188} textAnchor="middle" className="fill-success text-[8px] italic">
        flooding stoppes
      </text>
      <text x={270} y={188} textAnchor="middle" className="fill-brand text-[8px] italic">
        backbone-flooding
      </text>
      <text x={430} y={188} textAnchor="middle" className="fill-success text-[8px] italic">
        flooding stoppes
      </text>

      <text x={250} y={232} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Type-3 Summary er ABR-ens komprimerte oversatt-melding mellom areas.
      </text>
    </svg>
  );
}

function BgpDecisionTreeSvg() {
  return (
    <svg viewBox="0 0 500 280" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        BGP rute-seleksjon — først som skiller, vinner
      </text>

      {/* Decision boxes */}
      {[
        { y: 40, label: "1. Høyeste LOCAL_PREF?", note: "policy-styrt" },
        { y: 80, label: "2. Korteste AS_PATH?", note: "kortere lik bedre" },
        { y: 120, label: "3. Laveste ORIGIN?", note: "IGP < EGP < ?" },
        { y: 160, label: "4. Laveste MED?", note: "nabos hint" },
        { y: 200, label: "5. eBGP over iBGP?", note: "foretrekk eksternt" },
        { y: 240, label: "6. Laveste IGP-kost til NEXT_HOP", note: "hot-potato" },
      ].map((b, i) => (
        <g key={i}>
          <rect
            x={70}
            y={b.y}
            width={250}
            height={28}
            rx={4}
            className="fill-card stroke-brand"
            strokeWidth={1.5}
          />
          <text
            x={195}
            y={b.y + 18}
            textAnchor="middle"
            className="fill-foreground text-[10px] font-semibold"
          >
            {b.label}
          </text>
          <text x={345} y={b.y + 18} className="fill-muted-foreground text-[8px] italic">
            {b.note}
          </text>
          {i < 5 && (
            <line
              x1={195}
              y1={b.y + 28}
              x2={195}
              y2={b.y + 40}
              className="stroke-foreground/40"
              strokeWidth={1.5}
              markerEnd="url(#arrbgp)"
            />
          )}
        </g>
      ))}

      <defs>
        <marker
          id="arrbgp"
          viewBox="0 0 10 10"
          refX={9}
          refY={5}
          markerWidth={5}
          markerHeight={5}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-foreground/50" />
        </marker>
      </defs>

      {/* Exit arrows */}
      <text x={30} y={56} className="fill-success text-[9px] font-semibold">
        vinner →
      </text>
      <text x={30} y={96} className="fill-success text-[9px] font-semibold">
        vinner →
      </text>
      <text x={30} y={216} className="fill-success text-[9px] font-semibold">
        vinner →
      </text>
    </svg>
  );
}

function ProactiveVsReactiveSvg() {
  return (
    <svg viewBox="0 0 500 230" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Proactive vs Reactive flow-installasjon
      </text>

      {/* Proactive (top) */}
      <text x={50} y={42} className="fill-brand text-[10px] font-semibold">
        Proactive
      </text>
      <rect
        x={50}
        y={50}
        width={70}
        height={30}
        rx={4}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={85} y={69} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        Controller
      </text>
      <line
        x1={120}
        y1={65}
        x2={170}
        y2={65}
        className="stroke-amber-500"
        strokeWidth={1.5}
        markerEnd="url(#arrpr)"
      />
      <text
        x={145}
        y={60}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[8px] font-mono"
      >
        FLOW_MOD (i forkant)
      </text>
      <rect
        x={175}
        y={50}
        width={70}
        height={30}
        rx={4}
        className="fill-card stroke-success"
        strokeWidth={1.5}
      />
      <text x={210} y={69} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        Switch
      </text>
      <text x={250} y={69} className="fill-muted-foreground text-[9px]">
        → alle entries klare
      </text>
      <text x={400} y={75} className="fill-success text-[8px]">
        lav 1.-pakke-latens
      </text>

      {/* Reactive (bottom) */}
      <text x={50} y={132} className="fill-brand text-[10px] font-semibold">
        Reactive
      </text>
      <rect
        x={175}
        y={140}
        width={70}
        height={30}
        rx={4}
        className="fill-card stroke-success"
        strokeWidth={1.5}
      />
      <text
        x={210}
        y={159}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-semibold"
      >
        Switch
      </text>
      <line
        x1={175}
        y1={155}
        x2={125}
        y2={155}
        className="stroke-brand"
        strokeWidth={1.5}
        markerEnd="url(#arrpr)"
      />
      <text x={150} y={150} textAnchor="middle" className="fill-brand text-[8px] font-mono">
        PACKET_IN
      </text>
      <rect
        x={50}
        y={140}
        width={70}
        height={30}
        rx={4}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={85} y={159} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        Controller
      </text>
      <line
        x1={120}
        y1={180}
        x2={170}
        y2={180}
        className="stroke-amber-500"
        strokeWidth={1.5}
        markerEnd="url(#arrpr)"
      />
      <text
        x={145}
        y={195}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[8px] font-mono"
      >
        FLOW_MOD (just-in-time)
      </text>
      <text x={400} y={165} className="fill-amber-700 dark:fill-amber-400 text-[8px]">
        lavere minne
      </text>

      <defs>
        <marker
          id="arrpr"
          viewBox="0 0 10 10"
          refX={9}
          refY={5}
          markerWidth={5}
          markerHeight={5}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-current" />
        </marker>
      </defs>

      <text x={250} y={220} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Proactive = «alt forhåndsbestilt». Reactive = «installer entry når pakken kommer».
      </text>
    </svg>
  );
}

function PingVsTracerouteSvg() {
  return (
    <svg viewBox="0 0 500 250" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Ping vs Traceroute
      </text>

      {/* PING */}
      <text x={30} y={42} className="fill-brand text-[10px] font-semibold">
        Ping
      </text>
      <rect
        x={30}
        y={50}
        width={50}
        height={26}
        rx={4}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={55} y={67} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        Klient
      </text>
      <rect
        x={420}
        y={50}
        width={50}
        height={26}
        rx={4}
        className="fill-success/30 stroke-success"
        strokeWidth={1.5}
      />
      <text x={445} y={67} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        Mål
      </text>
      <line
        x1={82}
        y1={60}
        x2={418}
        y2={60}
        className="stroke-brand"
        strokeWidth={1.5}
        markerEnd="url(#arrpt)"
      />
      <text x={250} y={56} textAnchor="middle" className="fill-brand text-[8px] font-mono">
        Echo Request
      </text>
      <line
        x1={418}
        y1={70}
        x2={82}
        y2={70}
        className="stroke-success"
        strokeWidth={1.5}
        markerEnd="url(#arrpt)"
      />
      <text x={250} y={88} textAnchor="middle" className="fill-success text-[8px] font-mono">
        Echo Reply
      </text>

      {/* TRACEROUTE */}
      <text x={30} y={120} className="fill-brand text-[10px] font-semibold">
        Traceroute
      </text>
      <rect
        x={30}
        y={130}
        width={50}
        height={26}
        rx={4}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={55} y={147} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        Klient
      </text>

      {/* Hops */}
      {[180, 270, 360].map((x, i) => (
        <g key={i}>
          <circle
            cx={x}
            cy={143}
            r={11}
            className="fill-card stroke-foreground/40"
            strokeWidth={1.5}
          />
          <text x={x} y={147} textAnchor="middle" className="fill-foreground text-[8px]">
            R{i + 1}
          </text>
        </g>
      ))}

      <rect
        x={420}
        y={130}
        width={50}
        height={26}
        rx={4}
        className="fill-success/30 stroke-success"
        strokeWidth={1.5}
      />
      <text
        x={445}
        y={147}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-semibold"
      >
        Mål
      </text>

      {/* TTL arrows */}
      <path
        d="M 82 138 Q 130 122 169 138"
        className="stroke-brand fill-none"
        strokeWidth={1.2}
        markerEnd="url(#arrpt)"
      />
      <text x={125} y={118} textAnchor="middle" className="fill-brand text-[8px] font-mono">
        TTL=1
      </text>

      <path
        d="M 82 148 Q 175 110 258 138"
        className="stroke-brand fill-none"
        strokeWidth={1.2}
        markerEnd="url(#arrpt)"
      />
      <text x={210} y={108} textAnchor="middle" className="fill-brand text-[8px] font-mono">
        TTL=2
      </text>

      <path
        d="M 82 155 Q 220 100 348 138"
        className="stroke-brand fill-none"
        strokeWidth={1.2}
        markerEnd="url(#arrpt)"
      />
      <text x={290} y={100} textAnchor="middle" className="fill-brand text-[8px] font-mono">
        TTL=3
      </text>

      <text
        x={170}
        y={180}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[8px]"
      >
        R1: Time Exceeded
      </text>
      <text
        x={260}
        y={195}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[8px]"
      >
        R2: Time Exceeded
      </text>
      <text
        x={350}
        y={210}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[8px]"
      >
        R3: Time Exceeded
      </text>

      <defs>
        <marker
          id="arrpt"
          viewBox="0 0 10 10"
          refX={9}
          refY={5}
          markerWidth={5}
          markerHeight={5}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-current" />
        </marker>
      </defs>

      <text x={250} y={238} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Ping: én rundtur. Traceroute: én rundtur per hopp.
      </text>
    </svg>
  );
}

function DhcpLeaseTimelineSvg() {
  return (
    <svg viewBox="0 0 500 230" className="w-full h-auto">
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        DHCP-lease tidslinje (1 time = lease)
      </text>

      {/* Timeline */}
      <line x1={50} y1={120} x2={450} y2={120} className="stroke-foreground/50" strokeWidth={2} />

      {/* Tick marks: 0, T1=50%, T2=87.5%, 100% */}
      {[
        { x: 50, t: "0", label: "ACK", color: "success" },
        { x: 250, t: "50%", label: "T1 — Renewal", color: "brand" },
        { x: 400, t: "87.5%", label: "T2 — Rebinding", color: "amber-500" },
        { x: 450, t: "100%", label: "Lease utløp", color: "destructive" },
      ].map((m, i) => (
        <g key={i}>
          <line
            x1={m.x}
            y1={115}
            x2={m.x}
            y2={125}
            className={`stroke-${m.color}`}
            strokeWidth={2}
          />
          <text
            x={m.x}
            y={108}
            textAnchor="middle"
            className={`fill-${m.color} text-[9px] font-semibold`}
          >
            {m.t}
          </text>
          <text x={m.x} y={140} textAnchor="middle" className="fill-foreground text-[8px]">
            {m.label}
          </text>
        </g>
      ))}

      {/* Annotations */}
      <text x={150} y={170} textAnchor="middle" className="fill-success text-[9px] italic">
        bruker nettet fritt
      </text>
      <text x={325} y={170} textAnchor="middle" className="fill-brand text-[9px] italic">
        prøv unicast til server
      </text>
      <text
        x={425}
        y={185}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[9px] italic"
      >
        broadcast til alle
      </text>

      <text x={250} y={215} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Hvis ingen svarer før 100%: dropp adressen, kjør full DORA på nytt.
      </text>
    </svg>
  );
}

// ============================================================
// 5.9 — Eksamen-fokus
// ============================================================
function SectionEksamen() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="5.9" title="Eksamen-fokus — siste sjekk før prøven" />

      <p className="text-muted-foreground">
        Denne delen er destillert til det du faktisk blir spurt om: pseudokode du må kunne
        reprodusere på papir, beslutninger du må kunne forsvare med riktig kriterium, og
        misforståelser sensor leter etter. Bruk den siste timen før eksamen her — ikke i kapittel
        5.1.
      </p>

      {/* ---------- a) Cheat sheet ---------- */}
      <Cheat tittel="Cheat sheet — kap. 5">
        <div className="grid gap-3 lg:grid-cols-2">
          <div>
            <h4 className="font-semibold text-foreground mb-1">Dijkstra (link-state)</h4>
            <pre className="rounded bg-muted/40 p-2 text-[11px] font-mono leading-snug whitespace-pre overflow-x-auto">{`Init:
  N' = {u}                       // u = denne ruteren
  for hver node v:
    D(v) = c(u,v) hvis nabo, ellers ∞
    p(v) = u hvis nabo, ellers udef.

while N' ≠ alle noder:
  velg w ∉ N' med minst D(w)
  legg w til N'
  for hver nabo v av w som ikke er i N':
    if D(w) + c(w,v) < D(v):
      D(v) = D(w) + c(w,v)        // relax
      p(v) = w                    // forgjenger
`}</pre>
            <p className="text-[12px] text-muted-foreground mt-1">
              Når løkka er ferdig: D(v) er korteste avstand u→v, p(v) gir baklengs sti.
              Kompleksitet: O(n²) naivt, O(n log n) med min-heap.
            </p>
            <div className="mt-2 rounded bg-muted/20 p-2">
              <DijkstraPseudocodeFlowSvg />
              <p className="text-[10px] text-muted-foreground mt-1 italic text-center">
                Dijkstra som flowchart — init, velg-min, relax, gjenta.
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-1">Bellman-Ford (distance-vector)</h4>
            <pre className="rounded bg-muted/40 p-2 text-[11px] font-mono leading-snug whitespace-pre overflow-x-auto">{`Hver node x holder D_x(y) for alle y.

Initielt:
  D_x(x) = 0
  D_x(y) = c(x,y) hvis nabo, ellers ∞

Når nabo v sender sin vektor D_v(*):
  for hver destinasjon y:
    D_x(y) = min over alle naboer v av
             ( c(x,v) + D_v(y) )

Hvis D_x(*) endret seg: send ny vektor til naboer.
Stabil tilstand: ingen endringer på en runde.
`}</pre>
            <p className="text-[12px] text-muted-foreground mt-1">
              Ligningen «D_x(y) = min_v ( c(x,v) + D_v(y) )» er Bellman-Ford-essensen — alltid det
              minste av (kost til naboen) + (det naboen selv klarer).
            </p>
            <div className="mt-2 rounded bg-muted/20 p-2">
              <BellmanFordUpdateSvg />
              <p className="text-[10px] text-muted-foreground mt-1 italic text-center">
                Hvordan D_x(y) oppdateres når nabo sender ny vektor.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <h4 className="font-semibold text-foreground mb-1">Count-to-infinity-problemet</h4>
          <p className="text-[12px]">
            Når en lenke i DV ryker, kan to naboer fortsette å «tro» de når destinasjonen via
            hverandre. Hver runde øker hop-tellingen med 1 før de innser det. Demping:
          </p>
          <ul className="list-disc pl-5 text-[12px] mt-1 space-y-0.5">
            <li>
              <strong>Split horizon:</strong> ikke annonser en rute tilbake til naboen du lærte den
              fra.
            </li>
            <li>
              <strong>Poisoned reverse:</strong> annonser med kost ∞ tilbake til kilden — eksplisitt
              «ikke gå via meg».
            </li>
            <li>
              <strong>Hop-count-tak:</strong> RIP setter ∞ = 16, så telling termineres på et hardt
              tall.
            </li>
          </ul>
          <div className="mt-2 rounded bg-muted/20 p-2">
            <CountToInfinityTimelineSvg />
            <p className="text-[10px] text-muted-foreground mt-1 italic text-center">
              Tidslinje: B og C bytter stadig økende falske avstander til X — én iterasjon per
              kolonne.
            </p>
          </div>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div>
            <h4 className="font-semibold text-foreground mb-1">OSPF — innen-AS link-state</h4>
            <ul className="list-disc pl-5 text-[12px] space-y-0.5">
              <li>
                <strong>Hello-pakker:</strong> sendes typisk hvert 10 s, dead-interval ~40 s;
                identifiserer nabo og holder adjacency i live.
              </li>
              <li>
                <strong>Areas:</strong> AS deles i områder rundt en sentral backbone (area 0).
                LSA-flooding holdes innenfor området — det skalerer.
              </li>
              <li>
                <strong>LSA-typer du må gjenkjenne:</strong>
                <ul className="list-disc pl-5 mt-0.5">
                  <li>Type 1 — Router LSA (en ruters egne lenker innen area)</li>
                  <li>Type 2 — Network LSA (multi-access-segment, sendt av designated router)</li>
                  <li>
                    Type 3 — Summary LSA (prefiks fra et annet area, sendt av area border router)
                  </li>
                  <li>Type 4 — ASBR Summary (lokasjon av en AS-grenseruter)</li>
                  <li>Type 5 — External LSA (ruter lært utenfra AS, f.eks. fra BGP)</li>
                </ul>
              </li>
              <li>Konvergens: sekunder; alle ASBR/ABR ser samme topologi-database.</li>
            </ul>
            <div className="mt-2 rounded bg-muted/20 p-2">
              <OspfAreasColoredSvg />
              <p className="text-[10px] text-muted-foreground mt-1 italic text-center">
                Areas som fargede regioner — backbone (område 0) i midten, ABR-er på grensene.
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-1">
              BGP path-selection (i rekkefølge)
            </h4>
            <ol className="list-decimal pl-5 text-[12px] space-y-0.5">
              <li>
                <strong>LOCAL_PREF</strong> — høyest vinner. Settes av deg innenfor AS-et; uttrykker
                policy («foretrekk Telia framfor NORDU»).
              </li>
              <li>
                <strong>AS_PATH-lengde</strong> — kortest vinner. Først her dukker «hop-count» opp.
              </li>
              <li>
                <strong>ORIGIN</strong> — IGP &lt; EGP &lt; INCOMPLETE; foretrekk det som ble lært
                via egen IGP.
              </li>
              <li>
                <strong>MED (Multi-Exit Discriminator)</strong> — laveste vinner; gir naboen lov til
                å hint om hvilken inngang de selv foretrekker.
              </li>
              <li>
                <strong>eBGP &gt; iBGP</strong> — ekstern peering vinner over intern, fordi den
                ligger nærmere kanten.
              </li>
              <li>
                <strong>NEXT_HOP IGP-kost</strong> — den nærmeste BGP next-hop ifølge IGP (OSPF)
                vinner — «hot potato»-routing.
              </li>
              <li>
                <strong>Tie-breaker</strong> — lavest router-ID / eldste sesjon. Deterministisk,
                ikke meningsfullt.
              </li>
            </ol>
            <p className="text-[12px] mt-1 italic">
              Husk: BGP er <strong>policy</strong>-basert, ikke shortest-path. Steg 1 (LOCAL_PREF)
              kan overstyre alt annet, og det er der pengene tjenes.
            </p>
            <div className="mt-2 rounded bg-muted/20 p-2">
              <BgpPathSelectionStepsSvg />
              <p className="text-[10px] text-muted-foreground mt-1 italic text-center">
                Beslutningstre — første kriterium som skiller stiene vinner.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <h4 className="font-semibold text-foreground mb-1">DHCP DORA</h4>
          <ol className="list-decimal pl-5 text-[12px] space-y-0.5">
            <li>
              <strong>D — Discover:</strong> klient broadcast «hvem kan gi meg en adresse?» (src
              0.0.0.0, dst 255.255.255.255, UDP 67).
            </li>
            <li>
              <strong>O — Offer:</strong> en eller flere servere svarer med foreslått adresse,
              lease-tid, gateway, DNS.
            </li>
            <li>
              <strong>R — Request:</strong> klient broadcaster valget («jeg tar 10.0.0.42 fra server
              X») — andre servere ser at de ble forbigått.
            </li>
            <li>
              <strong>A — Ack:</strong> valgt server bekrefter; klienten kan nå bruke adressen til
              lease utløper.
            </li>
          </ol>
          <p className="text-[12px] mt-1">
            Hvorfor broadcast på Request: alle servere må vite om beslutningen så de slipper å holde
            adressen reservert. Renewal etter halv lease-tid skjer unicast direkte til serveren.
          </p>
          <div className="mt-2 rounded bg-muted/20 p-2">
            <DhcpDora4MessageFlowSvg />
            <p className="text-[10px] text-muted-foreground mt-1 italic text-center">
              DORA: 4 meldinger mellom klient og server — under 200 ms i kafé-WiFi.
            </p>
          </div>
        </div>
      </Cheat>

      {/* ---------- b) Sammenligning OSPF vs BGP ---------- */}
      <Illustration caption="OSPF (innen-AS) mot BGP (mellom-AS): samme jobb i navnet, totalt ulike egenskaper.">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1 pr-3 font-semibold">Egenskap</th>
                <th className="text-left py-1 pr-3 font-semibold text-brand">OSPF</th>
                <th className="text-left py-1 font-semibold text-amber-700 dark:text-amber-400">
                  BGP
                </th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-1 pr-3 font-medium text-foreground">Skala</td>
                <td className="py-1 pr-3">
                  Ett AS — typisk titusenvis av prefiks, hundrevis av rutere
                </td>
                <td className="py-1">Hele internett — millioner av prefiks, ~75 000 AS</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1 pr-3 font-medium text-foreground">Algoritme</td>
                <td className="py-1 pr-3">Link-state, Dijkstra over hele topologien</td>
                <td className="py-1">Path-vector — full AS-sti per rute, ingen graf-søk</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1 pr-3 font-medium text-foreground">Hvor brukes det</td>
                <td className="py-1 pr-3">Innenfor et autonomt system (intra-AS / IGP)</td>
                <td className="py-1">Mellom autonome systemer (inter-AS / EGP)</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1 pr-3 font-medium text-foreground">Valg-kriterier</td>
                <td className="py-1 pr-3">Summen av lenke-vekter — administratorens metric</td>
                <td className="py-1">LOCAL_PREF → AS_PATH → ORIGIN → MED → eBGP/iBGP → IGP-kost</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1 pr-3 font-medium text-foreground">Policy-uttrykk</td>
                <td className="py-1 pr-3">Begrenset til vekt-justering per lenke</td>
                <td className="py-1">Rik — import/export-filtre, community, LOCAL_PREF</td>
              </tr>
              <tr>
                <td className="py-1 pr-3 font-medium text-foreground">Konvergens</td>
                <td className="py-1 pr-3">
                  Sekunder til ti-talls sekunder (LSA-flooding + ny Dijkstra)
                </td>
                <td className="py-1">Minutter — globale endringer rippler gjennom verden</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Illustration>

      <Illustration caption="Side-ved-side topologi: OSPF dekker en flat AS-topologi med vekter på lenkene; BGP ser kun AS-grafen og prater policy mellom dem.">
        <OspfVsBgpTopologyCompareSvg />
      </Illustration>

      {/* ---------- c) Beslutningstre ---------- */}
      <Illustration caption="Beslutningstre: hvilken routing-protokoll passer for ditt use-case?">
        <ProtocolDecisionTreeSvg />
      </Illustration>

      {/* ---------- d) Vanlige fallgruver ---------- */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold flex items-center gap-2">
          Vanlige fallgruver — hva sensor leter etter
        </h3>

        <Fallgruve tittel="Forveksle distance-vector med link-state">
          DV-noder kjenner kun avstand til hver destinasjon og hvilken nabo som er neste hopp — de
          har <em>ingen</em> intern topologi-tegning. LS-noder flooder hele lenke-databasen og
          kjører Dijkstra selv. Hvis du skriver «OSPF sender sin distance-vektor til naboer», har du
          blandet det.
          <div className="mt-2 rounded bg-background p-2">
            <DvVsLsAlgoSvg />
            <p className="text-[10px] text-muted-foreground mt-1 italic text-center">
              DV: kun «hvor langt + via hvem». LS: hele lenke-databasen + lokal Dijkstra.
            </p>
          </div>
        </Fallgruve>

        <Fallgruve tittel="Tro at BGP velger korteste sti">
          AS_PATH er bare steg 2 i beslutningskjeden, og selv da måles det i AS-hopp (ikke
          geografisk distanse, ikke båndbredde, ikke ms forsinkelse). Det avgjørende steget er
          LOCAL_PREF, satt manuelt for å reflektere kommersielle avtaler — «vi foretrekker å sende
          via kunden vi tjener penger på» kan trumfe en kortere sti gjennom transit-leverandøren.
          <div className="mt-2 rounded bg-background p-2">
            <BgpPolicyOverlaySvg />
            <p className="text-[10px] text-muted-foreground mt-1 italic text-center">
              Korteste AS_PATH = 2 hopp, men kunde-policy (LOCAL_PREF=200) overstyrer og velger
              3-hopp-stien.
            </p>
          </div>
        </Fallgruve>

        <Fallgruve tittel="Glemme at OSPF area-grenser bruker Type 3 LSA">
          Innen et area flommer Type 1/2 fritt. På tvers av areas må prefiks oppsummeres av en area
          border router (ABR) og re-injiseres som Type 3 Summary LSA. Hvis du sier «alle OSPF-rutere
          ser samme database overalt», stemmer det bare innen ett area — backbone og leaf-areas har
          ulik intern detalj.
          <div className="mt-2 rounded bg-background p-2">
            <Type3LsaBetweenAreasSvg />
            <p className="text-[10px] text-muted-foreground mt-1 italic text-center">
              Type 1/2 stoppes ved ABR; Type 3 «10.20.0.0/16, kost=42» krysser grensen.
            </p>
          </div>
        </Fallgruve>

        <Fallgruve tittel="Tro at ICMP står for «Internet Control Protocol»">
          Det er <strong>Internet Control Message Protocol</strong>. Det er ikke en control-plane-
          protokoll i Kuroses forstand — det bygger ikke ruter, det rapporterer feil og brukes til
          diagnostikk (ping, traceroute, «Destination Unreachable», «Time Exceeded»). Tabben ligger
          i kap. 5 fordi den lever ved siden av IP, ikke fordi den hjelper med ruting.
          <div className="mt-2 rounded bg-background p-2">
            <IcmpNameConfusionSvg />
            <p className="text-[10px] text-muted-foreground mt-1 italic text-center">
              ICMP = «message» — diagnose-kanal, ikke ruting. Kontroll i navnet, ikke i jobben.
            </p>
          </div>
        </Fallgruve>

        <Fallgruve tittel="Si at DHCP bruker TCP">
          DHCP kjører UDP — porter 67 (server) og 68 (klient). Det måtte være forbindelses-løst
          fordi klienten <em>ikke har en IP-adresse ennå</em>; TCPs treveis-håndtrykk forutsetter
          adresser fra start.
        </Fallgruve>

        <Fallgruve tittel="Blande SDN-controlleren med en ruter">
          SDN-controlleren videresender ingen pakker. Den sitter på en server med komplett
          topologi-view og pusher forwarding-tabeller (OpenFlow flow-mods) ned til simple switcher.
          Hvis controlleren ramler, fortsetter eksisterende flows å virke — men nye flows har ingen
          beslutning bak seg.
        </Fallgruve>

        <Fallgruve tittel="Tro at split horizon løser count-to-infinity helt">
          Split horizon hindrer kun den simpleste varianten (to noder som speiler hverandre i ring).
          Med tre eller flere noder kan tellingen fortsatt eskalere via en omvei. Hop-count-tak
          (RIP: 16) er det som garantert stopper sløyfen.
        </Fallgruve>

        <Fallgruve tittel="Forveksle eBGP og iBGP-rolle">
          eBGP er sesjonen <em>mellom</em> to AS — ekte ruting-eksport på tvers av grenser. iBGP er
          sesjonen <em>internt</em> i et AS for å distribuere de eksternt lærte rutene videre til
          alle BGP-talende rutere innenfor. Reglene for hva som re-annonseres er ulike: iBGP
          re-annonserer ikke til andre iBGP-naboer (det er derfor man trenger full mesh eller route
          reflectors).
        </Fallgruve>
      </div>

      {/* ---------- e) 5-minutter-anker ---------- */}
      <Anker tittel="5-minutter-anker — les disse rett før du går inn">
        <div className="rounded bg-background/60 p-2 mb-3">
          <FiveMinAnker15CardsSvg />
          <p className="text-[10px] text-muted-foreground mt-1 italic text-center">
            15 visuelle anker-kort — én idé per kort, samme rekkefølge som lista nedenfor.
          </p>
        </div>
        <ol className="list-decimal pl-5 text-[13px] space-y-1.5">
          <li>
            <strong>Control-plane bygger tabellen, data-plane bruker den.</strong> Hastighetene
            skiller seg med faktor ~10⁶ — derfor lever de på ulike chiper.
          </li>
          <li>
            <strong>Link-state = global topologi + Dijkstra lokalt.</strong> Distance-vector = kun
            nabo-info + Bellman-Ford-iterasjoner. Førstnevnte konvergerer raskere, sistnevnte er
            enklere å implementere.
          </li>
          <li>
            <strong>Dijkstras kjerne er relax-steget:</strong> for hver nabo v av nylig-besøkt w,
            sjekk om D(w) + c(w,v) er mindre enn nåværende D(v); hvis ja, oppdater.
          </li>
          <li>
            <strong>Bellman-Ford-essens: D_x(y) = min_v ( c(x,v) + D_v(y) ).</strong> Alltid det
            minste over alle naboer av (kost til naboen) + (det naboen selv klarer).
          </li>
          <li>
            <strong>Count-to-infinity</strong> oppstår når dårlige nyheter «sirkulerer». Demping:
            split horizon, poisoned reverse, hop-count-tak.
          </li>
          <li>
            <strong>OSPF</strong> brukes innen ett AS, deler det i areas rundt en backbone (area 0),
            flooder LSA, kjører Dijkstra. Hello hvert ~10 s, dead-interval ~40 s.
          </li>
          <li>
            <strong>
              LSA Type 1/2 lokalt, Type 3 mellom areas (ABR), Type 4/5 om eksterne ruter.
            </strong>
          </li>
          <li>
            <strong>BGP</strong> brukes mellom AS, er path-vector, og velger etter policy. Steg 1 i
            beslutningen er LOCAL_PREF — der ligger pengene.
          </li>
          <li>
            <strong>Hele BGP-rekkefølgen:</strong> LOCAL_PREF → AS_PATH → ORIGIN → MED → eBGP &gt;
            iBGP → NEXT_HOP IGP-kost → tie-breaker (router-ID).
          </li>
          <li>
            <strong>Hot-potato routing</strong> = «kast pakken ut av AS-et så raskt som mulig» —
            tilsvarer steg 6 i BGP, der nærmeste NEXT_HOP ifølge IGP vinner.
          </li>
          <li>
            <strong>SDN-control-plane</strong> sentraliserer beslutningen: én controller pusher
            flow-tabeller (OpenFlow) til alle switcher. Konvergens i titalls millisekunder, ingen
            distribuert konsensus.
          </li>
          <li>
            <strong>ICMP</strong> rapporterer feil (Destination Unreachable, Time Exceeded). Ping
            bruker Echo Request/Reply. Traceroute setter TTL = 1, 2, 3 … og samler «Time Exceeded»
            fra hver hop.
          </li>
          <li>
            <strong>DHCP DORA</strong> over UDP 67/68: Discover (broadcast) → Offer → Request
            (broadcast) → Ack. Renewal halvveis i lease, unicast direkte til server.
          </li>
          <li>
            <strong>
              Distribuert (OSPF/BGP) overlever uten sjef; sentralisert (SDN) konvergerer raskere men
              taper alt om controlleren faller.
            </strong>
          </li>
          <li>
            <strong>Skille forwarding fra routing</strong> i ordvalget ditt — det er en klassisk
            tap-poeng på eksamen om du sier «ruteren forwarder med Dijkstra».
          </li>
        </ol>
      </Anker>

      <RelatedSlugs slugs={["dte2507-ruting"]} />
    </article>
  );
}

// ============================================================
// Helpers for Eksamen-fokus-tabben
// ============================================================
function Fallgruve({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-destructive font-semibold mb-1">
        Fallgruve
      </div>
      <div className="font-semibold text-foreground mb-1">{tittel}</div>
      <div className="text-muted-foreground text-[13px] space-y-2">{children}</div>
    </div>
  );
}

function Cheat({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
        Cheat sheet
      </div>
      <div className="font-semibold text-foreground mb-2">{tittel}</div>
      <div className="text-muted-foreground text-[13px] space-y-2">{children}</div>
    </div>
  );
}

function Anker({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-indigo-700 dark:text-indigo-400 font-semibold mb-1">
        5-minutter-anker
      </div>
      <div className="font-semibold text-foreground mb-2">{tittel}</div>
      <div className="text-muted-foreground text-[13px] space-y-2">{children}</div>
    </div>
  );
}

function ProtocolDecisionTreeSvg() {
  return (
    <svg
      viewBox="0 0 720 440"
      className="w-full h-auto"
      role="img"
      aria-label="Beslutningstre for routing-protokoll"
    >
      {/* Root */}
      <rect
        x={280}
        y={10}
        width={160}
        height={42}
        rx={6}
        className="fill-card stroke-foreground"
        strokeWidth={1.5}
      />
      <text
        x={360}
        y={28}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Hvor skal rutingen skje?
      </text>
      <text x={360} y={42} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        (start her)
      </text>

      {/* Level 1 split: intra vs inter vs datasenter */}
      <line x1={360} y1={52} x2={140} y2={100} className="stroke-foreground" strokeWidth={1.2} />
      <line x1={360} y1={52} x2={360} y2={100} className="stroke-foreground" strokeWidth={1.2} />
      <line x1={360} y1={52} x2={580} y2={100} className="stroke-foreground" strokeWidth={1.2} />

      <text x={230} y={78} textAnchor="middle" className="fill-muted-foreground text-[10px] italic">
        innen ett AS
      </text>
      <text x={360} y={78} textAnchor="middle" className="fill-muted-foreground text-[10px] italic">
        mellom AS
      </text>
      <text x={485} y={78} textAnchor="middle" className="fill-muted-foreground text-[10px] italic">
        datasenter / fabric
      </text>

      {/* Intra-AS box */}
      <rect
        x={70}
        y={100}
        width={140}
        height={42}
        rx={6}
        className="fill-card stroke-foreground"
        strokeWidth={1.2}
      />
      <text
        x={140}
        y={118}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Innen-AS
      </text>
      <text x={140} y={132} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        hvor stort er nettet?
      </text>

      {/* Inter-AS leaf: BGP */}
      <rect
        x={290}
        y={100}
        width={140}
        height={56}
        rx={6}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text
        x={360}
        y={120}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-300 text-[12px] font-bold"
      >
        BGP
      </text>
      <text x={360} y={136} textAnchor="middle" className="fill-foreground text-[10px]">
        path-vector, policy-basert
      </text>
      <text x={360} y={150} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        eBGP mellom AS-kanter
      </text>

      {/* Datasenter box */}
      <rect
        x={510}
        y={100}
        width={140}
        height={42}
        rx={6}
        className="fill-card stroke-foreground"
        strokeWidth={1.2}
      />
      <text
        x={580}
        y={118}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Datasenter
      </text>
      <text x={580} y={132} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        eier du hele nettet?
      </text>

      {/* Intra-AS sub-split: small vs large */}
      <line x1={140} y1={142} x2={70} y2={200} className="stroke-foreground" strokeWidth={1.2} />
      <line x1={140} y1={142} x2={210} y2={200} className="stroke-foreground" strokeWidth={1.2} />
      <text x={95} y={170} textAnchor="middle" className="fill-muted-foreground text-[10px] italic">
        lite / enkelt
      </text>
      <text
        x={185}
        y={170}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] italic"
      >
        stort / hierarkisk
      </text>

      {/* RIP leaf */}
      <rect
        x={10}
        y={200}
        width={120}
        height={56}
        rx={6}
        className="fill-emerald-500/20 stroke-emerald-500"
        strokeWidth={1.5}
      />
      <text
        x={70}
        y={220}
        textAnchor="middle"
        className="fill-emerald-700 dark:fill-emerald-300 text-[12px] font-bold"
      >
        RIP
      </text>
      <text x={70} y={236} textAnchor="middle" className="fill-foreground text-[10px]">
        distance-vector
      </text>
      <text x={70} y={250} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        hop-count ≤ 15
      </text>

      {/* OSPF / IS-IS leaf */}
      <rect
        x={150}
        y={200}
        width={140}
        height={56}
        rx={6}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={220} y={220} textAnchor="middle" className="fill-brand text-[12px] font-bold">
        OSPF / IS-IS
      </text>
      <text x={220} y={236} textAnchor="middle" className="fill-foreground text-[10px]">
        link-state, areas
      </text>
      <text x={220} y={250} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        skala &amp; konvergens
      </text>

      {/* Datasenter sub-split */}
      <line x1={580} y1={142} x2={510} y2={200} className="stroke-foreground" strokeWidth={1.2} />
      <line x1={580} y1={142} x2={650} y2={200} className="stroke-foreground" strokeWidth={1.2} />
      <text
        x={535}
        y={170}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] italic"
      >
        ja, sentralisert
      </text>
      <text
        x={625}
        y={170}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] italic"
      >
        tradisjonell
      </text>

      {/* SDN / ECMP leaf */}
      <rect
        x={450}
        y={200}
        width={140}
        height={56}
        rx={6}
        className="fill-purple-500/20 stroke-purple-500"
        strokeWidth={1.5}
      />
      <text
        x={520}
        y={220}
        textAnchor="middle"
        className="fill-purple-700 dark:fill-purple-300 text-[12px] font-bold"
      >
        SDN + ECMP
      </text>
      <text x={520} y={236} textAnchor="middle" className="fill-foreground text-[10px]">
        OpenFlow / leaf-spine
      </text>
      <text x={520} y={250} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        controller pusher flows
      </text>

      {/* OSPF-fabric leaf */}
      <rect
        x={600}
        y={200}
        width={110}
        height={56}
        rx={6}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={655} y={220} textAnchor="middle" className="fill-brand text-[12px] font-bold">
        OSPF-fabric
      </text>
      <text x={655} y={236} textAnchor="middle" className="fill-foreground text-[10px]">
        distribuert IGP
      </text>
      <text x={655} y={250} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        som klassisk WAN
      </text>

      {/* BGP sub-split: full-table vs default */}
      <line x1={360} y1={156} x2={290} y2={310} className="stroke-foreground" strokeWidth={1.2} />
      <line x1={360} y1={156} x2={430} y2={310} className="stroke-foreground" strokeWidth={1.2} />
      <text
        x={290}
        y={240}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] italic"
      >
        multi-homed
      </text>
      <text
        x={430}
        y={240}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] italic"
      >
        single transit
      </text>

      {/* eBGP full-table */}
      <rect
        x={220}
        y={310}
        width={140}
        height={56}
        rx={6}
        className="fill-amber-500/15 stroke-amber-500"
        strokeWidth={1.2}
      />
      <text
        x={290}
        y={330}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-300 text-[11px] font-bold"
      >
        eBGP full table
      </text>
      <text x={290} y={346} textAnchor="middle" className="fill-foreground text-[10px]">
        policy + LOCAL_PREF
      </text>
      <text x={290} y={360} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        ~1M ruter i RIB
      </text>

      {/* eBGP default-route */}
      <rect
        x={360}
        y={310}
        width={140}
        height={56}
        rx={6}
        className="fill-amber-500/15 stroke-amber-500"
        strokeWidth={1.2}
      />
      <text
        x={430}
        y={330}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-300 text-[11px] font-bold"
      >
        eBGP default-only
      </text>
      <text x={430} y={346} textAnchor="middle" className="fill-foreground text-[10px]">
        én oppstrøms-pek
      </text>
      <text x={430} y={360} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        minimalt minne
      </text>

      {/* Legend */}
      <text x={20} y={400} className="fill-muted-foreground text-[10px] italic">
        Boksene viser typiske valg — ikke fasit. I praksis kjører store nett OSPF + iBGP + eBGP
        samtidig.
      </text>
      <text x={20} y={418} className="fill-muted-foreground text-[10px] italic">
        Grønn = distance-vector · blå = link-state · oransje = path-vector · lilla = sentralisert.
      </text>
    </svg>
  );
}

// ============================================================
// Nye SVG-er for Eksamen-fokus-tabben (5.9)
// ============================================================

function DijkstraPseudocodeFlowSvg() {
  // Flowchart: 4 boxes connected vertically + loop-back arrow
  return (
    <svg
      viewBox="0 0 360 320"
      className="w-full h-auto"
      role="img"
      aria-label="Dijkstra som flowchart"
    >
      {/* Step 1: Init */}
      <rect
        x={100}
        y={10}
        width={160}
        height={42}
        rx={4}
        className="fill-brand/15 stroke-brand"
        strokeWidth={1.5}
      />
      <text
        x={180}
        y={28}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        1. Init
      </text>
      <text x={180} y={44} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        N&apos;={"{u}"}, D(v)=c(u,v) eller ∞
      </text>

      {/* Arrow */}
      <line x1={180} y1={52} x2={180} y2={75} className="stroke-foreground" strokeWidth={1.2} />
      <polygon points="176,72 184,72 180,80" className="fill-foreground" />

      {/* Step 2: Decision diamond — alle besøkt? */}
      <polygon
        points="180,80 270,115 180,150 90,115"
        className="fill-amber-500/15 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text
        x={180}
        y={111}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Alle noder
      </text>
      <text x={180} y={124} textAnchor="middle" className="fill-foreground text-[10px]">
        i N&apos;?
      </text>

      {/* Yes branch right -> ferdig */}
      <line x1={270} y1={115} x2={310} y2={115} className="stroke-foreground" strokeWidth={1.2} />
      <polygon points="307,111 315,115 307,119" className="fill-foreground" />
      <text x={290} y={108} textAnchor="middle" className="fill-success text-[9px] font-semibold">
        ja
      </text>
      <rect
        x={300}
        y={100}
        width={56}
        height={30}
        rx={4}
        className="fill-success/15 stroke-success"
        strokeWidth={1.2}
      />
      <text x={328} y={119} textAnchor="middle" className="fill-success text-[10px] font-semibold">
        Ferdig
      </text>

      {/* No branch down */}
      <line x1={180} y1={150} x2={180} y2={170} className="stroke-foreground" strokeWidth={1.2} />
      <polygon points="176,167 184,167 180,175" className="fill-foreground" />
      <text x={193} y={163} className="fill-muted-foreground text-[9px]">
        nei
      </text>

      {/* Step 3: Velg w */}
      <rect
        x={80}
        y={175}
        width={200}
        height={38}
        rx={4}
        className="fill-brand/15 stroke-brand"
        strokeWidth={1.5}
      />
      <text
        x={180}
        y={193}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        3. Velg w utenfor N&apos; med min D(w)
      </text>
      <text x={180} y={207} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        legg w til N&apos;
      </text>

      {/* Arrow */}
      <line x1={180} y1={213} x2={180} y2={232} className="stroke-foreground" strokeWidth={1.2} />
      <polygon points="176,229 184,229 180,237" className="fill-foreground" />

      {/* Step 4: Relax */}
      <rect
        x={60}
        y={237}
        width={240}
        height={42}
        rx={4}
        className="fill-purple-500/15 stroke-purple-500"
        strokeWidth={1.5}
      />
      <text
        x={180}
        y={255}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        4. Relax: for hver nabo v av w
      </text>
      <text x={180} y={271} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        if D(w)+c(w,v) &lt; D(v): D(v)=D(w)+c(w,v); p(v)=w
      </text>

      {/* Loop back arrow up to decision */}
      <path
        d="M 60,258 Q 25,258 25,115 Q 25,90 90,115"
        className="fill-none stroke-foreground"
        strokeWidth={1.2}
      />
      <polygon points="86,111 92,115 86,119" className="fill-foreground" />
      <text x={32} y={188} className="fill-muted-foreground text-[9px] italic">
        gjenta
      </text>

      <text
        x={180}
        y={302}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] italic"
      >
        Init → mens noder gjenstår → velg-min → relax → loop
      </text>
    </svg>
  );
}

function BellmanFordUpdateSvg() {
  // Show how D_x(y) is updated when neighbor v sends vector
  return (
    <svg
      viewBox="0 0 380 220"
      className="w-full h-auto"
      role="img"
      aria-label="Bellman-Ford-oppdatering"
    >
      {/* Title */}
      <text
        x={190}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        D_x(y) = min_v ( c(x,v) + D_v(y) )
      </text>

      {/* Node x */}
      <circle cx={50} cy={110} r={22} className="fill-brand/20 stroke-brand" strokeWidth={2} />
      <text x={50} y={107} textAnchor="middle" className="fill-foreground text-[11px] font-bold">
        x
      </text>
      <text x={50} y={120} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        oss
      </text>

      {/* Three neighbors */}
      {[
        { x: 200, y: 50, name: "v1", c: 2, dv: 5 },
        { x: 220, y: 110, name: "v2", c: 4, dv: 1 },
        { x: 200, y: 170, name: "v3", c: 1, dv: 9 },
      ].map((n, i) => (
        <g key={i}>
          <circle
            cx={n.x}
            cy={n.y}
            r={18}
            className="fill-card stroke-foreground/60"
            strokeWidth={1.5}
          />
          <text
            x={n.x}
            y={n.y + 3}
            textAnchor="middle"
            className="fill-foreground text-[10px] font-bold"
          >
            {n.name}
          </text>
          {/* link from x to v */}
          <line
            x1={70}
            y1={110}
            x2={n.x - 16}
            y2={n.y}
            className="stroke-foreground/60"
            strokeWidth={1.2}
          />
          {/* cost label */}
          <text
            x={(70 + n.x - 16) / 2}
            y={(110 + n.y) / 2 - 4}
            textAnchor="middle"
            className="fill-amber-700 dark:fill-amber-300 text-[9px] font-mono font-semibold"
          >
            c={n.c}
          </text>
          {/* D_v(y) box from neighbor */}
          <rect
            x={n.x + 24}
            y={n.y - 12}
            width={64}
            height={22}
            rx={3}
            className="fill-muted/40 stroke-foreground/40"
            strokeWidth={1}
          />
          <text
            x={n.x + 56}
            y={n.y + 3}
            textAnchor="middle"
            className="fill-foreground text-[9px] font-mono"
          >
            D_{n.name}(y)={n.dv}
          </text>
          {/* candidate */}
          <text
            x={n.x + 56}
            y={n.y + 22}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px] font-mono"
          >
            → {n.c}+{n.dv}={n.c + n.dv}
          </text>
        </g>
      ))}

      {/* Result */}
      <rect
        x={295}
        y={95}
        width={80}
        height={32}
        rx={4}
        className="fill-success/20 stroke-success"
        strokeWidth={2}
      />
      <text
        x={335}
        y={108}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        D_x(y) = 5
      </text>
      <text x={335} y={122} textAnchor="middle" className="fill-success text-[9px] font-mono">
        min(7, 5, 10)
      </text>
      <line x1={290} y1={110} x2={296} y2={110} className="stroke-success" strokeWidth={1.5} />
      <polygon points="293,107 300,110 293,113" className="fill-success" />

      <text
        x={190}
        y={205}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] italic"
      >
        Velg minste (c+D_v(y)) over alle naboer → ny D_x(y).
      </text>
    </svg>
  );
}

function CountToInfinityTimelineSvg() {
  // Timeline of rounds for B and C updating their distance to X
  const rounds = [
    { b: "1", c: "2", note: "stabilt" },
    { b: "∞→3", c: "2", note: "B oppdager tap, ser C=2 → 1+2=3" },
    { b: "3", c: "4", note: "C: «B sier 3» → 1+3=4" },
    { b: "5", c: "4", note: "B: «C sier 4» → 1+4=5" },
    { b: "5", c: "6", note: "C: 1+5=6" },
    { b: "...", c: "...", note: "klatrer mot 16" },
    { b: "15", c: "16", note: "RIPs ∞ = 16: stopp" },
  ];
  return (
    <svg
      viewBox="0 0 540 240"
      className="w-full h-auto"
      role="img"
      aria-label="Count-to-infinity som tidslinje"
    >
      {/* Header */}
      <text
        x={270}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        A — B — C, lenken A—B ryker. C lærte X gjennom A via B.
      </text>

      {/* Timeline axis */}
      <line x1={40} y1={200} x2={520} y2={200} className="stroke-foreground/40" strokeWidth={1.5} />
      <polygon points="516,197 524,200 516,203" className="fill-foreground/40" />
      <text x={520} y={218} textAnchor="end" className="fill-muted-foreground text-[9px]">
        tid →
      </text>

      {/* Row labels */}
      <text x={32} y={70} textAnchor="end" className="fill-brand text-[10px] font-semibold">
        D_B(X)
      </text>
      <text x={32} y={130} textAnchor="end" className="fill-purple-500 text-[10px] font-semibold">
        D_C(X)
      </text>

      {rounds.map((r, i) => {
        const x = 60 + i * 68;
        return (
          <g key={i}>
            {/* Round marker */}
            <line
              x1={x}
              y1={195}
              x2={x}
              y2={205}
              className="stroke-foreground/60"
              strokeWidth={1}
            />
            <text x={x} y={216} textAnchor="middle" className="fill-muted-foreground text-[8px]">
              t={i}
            </text>

            {/* B value */}
            <rect
              x={x - 22}
              y={55}
              width={44}
              height={22}
              rx={3}
              className="fill-brand/15 stroke-brand"
              strokeWidth={1}
            />
            <text
              x={x}
              y={70}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-mono font-semibold"
            >
              {r.b}
            </text>

            {/* C value */}
            <rect
              x={x - 22}
              y={115}
              width={44}
              height={22}
              rx={3}
              className="fill-purple-500/15 stroke-purple-500"
              strokeWidth={1}
            />
            <text
              x={x}
              y={130}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-mono font-semibold"
            >
              {r.c}
            </text>

            {/* arrow from prev C to current B and prev B to current C */}
            {i > 0 && (
              <line
                x1={x - 68 + 22}
                y1={i % 2 === 1 ? 126 : 66}
                x2={x - 22}
                y2={i % 2 === 1 ? 66 : 126}
                className="stroke-amber-500/60"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
            )}

            {/* Note */}
            <text x={x} y={170} textAnchor="middle" className="fill-muted-foreground text-[8px]">
              <tspan x={x} dy="0">
                {r.note.split(",")[0]}
              </tspan>
              {r.note.includes(",") && (
                <tspan x={x} dy="10">
                  {r.note.split(",")[1]?.trim()}
                </tspan>
              )}
            </text>
          </g>
        );
      })}

      <text x={270} y={234} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Stiplede piler = «jeg tror på det naboen sa forrige runde». Det er pinen.
      </text>
    </svg>
  );
}

function OspfAreasColoredSvg() {
  // 3 areas as colored regions
  return (
    <svg
      viewBox="0 0 460 240"
      className="w-full h-auto"
      role="img"
      aria-label="OSPF-areas som fargede regioner"
    >
      {/* Backbone area 0 */}
      <ellipse
        cx={230}
        cy={120}
        rx={90}
        ry={55}
        className="fill-amber-500/15 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text
        x={230}
        y={75}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-300 text-[10px] font-bold"
      >
        Area 0 (backbone)
      </text>

      {/* Backbone routers */}
      {[
        { x: 200, y: 110, name: "R-bb-1" },
        { x: 260, y: 110, name: "R-bb-2" },
        { x: 230, y: 145, name: "R-bb-3" },
      ].map((r, i) => (
        <g key={i}>
          <circle
            cx={r.x}
            cy={r.y}
            r={10}
            className="fill-card stroke-amber-600"
            strokeWidth={1.5}
          />
          <text
            x={r.x}
            y={r.y + 3}
            textAnchor="middle"
            className="fill-foreground text-[7px] font-semibold"
          >
            bb{i + 1}
          </text>
        </g>
      ))}
      <line x1={200} y1={110} x2={260} y2={110} className="stroke-amber-500/60" strokeWidth={1.2} />
      <line x1={200} y1={110} x2={230} y2={145} className="stroke-amber-500/60" strokeWidth={1.2} />
      <line x1={260} y1={110} x2={230} y2={145} className="stroke-amber-500/60" strokeWidth={1.2} />

      {/* Area 1 — left */}
      <ellipse
        cx={80}
        cy={110}
        rx={56}
        ry={45}
        className="fill-brand/15 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={80} y={70} textAnchor="middle" className="fill-brand text-[10px] font-bold">
        Area 1 (Mo i Rana)
      </text>
      {[
        { x: 60, y: 110 },
        { x: 100, y: 105 },
        { x: 80, y: 135 },
      ].map((r, i) => (
        <g key={i}>
          <circle cx={r.x} cy={r.y} r={9} className="fill-card stroke-brand" strokeWidth={1.5} />
          <text x={r.x} y={r.y + 3} textAnchor="middle" className="fill-foreground text-[7px]">
            r{i + 1}
          </text>
        </g>
      ))}

      {/* ABR between area 0 and area 1 */}
      <circle
        cx={140}
        cy={110}
        r={11}
        className="fill-emerald-500/40 stroke-emerald-600"
        strokeWidth={2}
      />
      <text x={140} y={113} textAnchor="middle" className="fill-foreground text-[7px] font-bold">
        ABR
      </text>
      <line
        x1={100}
        y1={105}
        x2={140}
        y2={110}
        className="stroke-foreground/40"
        strokeWidth={1.2}
      />
      <line
        x1={140}
        y1={110}
        x2={200}
        y2={110}
        className="stroke-foreground/40"
        strokeWidth={1.2}
      />

      {/* Area 2 — right */}
      <ellipse
        cx={380}
        cy={130}
        rx={56}
        ry={48}
        className="fill-purple-500/15 stroke-purple-500"
        strokeWidth={1.5}
      />
      <text
        x={380}
        y={85}
        textAnchor="middle"
        className="fill-purple-700 dark:fill-purple-300 text-[10px] font-bold"
      >
        Area 2 (Tromsø)
      </text>
      {[
        { x: 360, y: 130 },
        { x: 400, y: 115 },
        { x: 395, y: 155 },
      ].map((r, i) => (
        <g key={i}>
          <circle
            cx={r.x}
            cy={r.y}
            r={9}
            className="fill-card stroke-purple-500"
            strokeWidth={1.5}
          />
          <text x={r.x} y={r.y + 3} textAnchor="middle" className="fill-foreground text-[7px]">
            r{i + 4}
          </text>
        </g>
      ))}

      {/* ABR between area 0 and area 2 */}
      <circle
        cx={320}
        cy={120}
        r={11}
        className="fill-emerald-500/40 stroke-emerald-600"
        strokeWidth={2}
      />
      <text x={320} y={123} textAnchor="middle" className="fill-foreground text-[7px] font-bold">
        ABR
      </text>
      <line
        x1={260}
        y1={110}
        x2={320}
        y2={120}
        className="stroke-foreground/40"
        strokeWidth={1.2}
      />
      <line
        x1={320}
        y1={120}
        x2={360}
        y2={130}
        className="stroke-foreground/40"
        strokeWidth={1.2}
      />

      {/* Legend */}
      <rect
        x={20}
        y={195}
        width={12}
        height={10}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1}
      />
      <text x={38} y={204} className="fill-muted-foreground text-[9px]">
        leaf area
      </text>
      <rect
        x={120}
        y={195}
        width={12}
        height={10}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={138} y={204} className="fill-muted-foreground text-[9px]">
        Area 0
      </text>
      <circle
        cx={210}
        cy={200}
        r={5}
        className="fill-emerald-500/40 stroke-emerald-600"
        strokeWidth={1}
      />
      <text x={222} y={204} className="fill-muted-foreground text-[9px]">
        ABR (oversetter LSA-er)
      </text>

      <text x={230} y={228} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Type 1/2 flommer kun i hver region. Type 3 (Summary) krysser via ABR.
      </text>
    </svg>
  );
}

function BgpPathSelectionStepsSvg() {
  // Decision tree, step by step
  const steps = [
    { label: "LOCAL_PREF", crit: "høyest vinner", color: "amber" },
    { label: "AS_PATH-lengde", crit: "kortest vinner", color: "brand" },
    { label: "ORIGIN", crit: "IGP < EGP < ?", color: "purple" },
    { label: "MED", crit: "lavest vinner", color: "emerald" },
    { label: "eBGP > iBGP", crit: "ekstern vinner", color: "rose" },
    { label: "IGP-kost", crit: "hot-potato", color: "sky" },
  ];
  return (
    <svg
      viewBox="0 0 540 260"
      className="w-full h-auto"
      role="img"
      aria-label="BGP path-selection som steg-for-steg beslutningstre"
    >
      <text
        x={270}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Første kriterium som skiller stiene = vinner
      </text>

      {/* Pipeline of boxes */}
      {steps.map((s, i) => {
        const x = 20 + i * 86;
        const colorMap: Record<string, string> = {
          amber: "fill-amber-500/15 stroke-amber-500",
          brand: "fill-brand/15 stroke-brand",
          purple: "fill-purple-500/15 stroke-purple-500",
          emerald: "fill-emerald-500/15 stroke-emerald-500",
          rose: "fill-rose-500/15 stroke-rose-500",
          sky: "fill-sky-500/15 stroke-sky-500",
        };
        return (
          <g key={i}>
            <rect
              x={x}
              y={40}
              width={80}
              height={56}
              rx={4}
              className={colorMap[s.color]}
              strokeWidth={1.5}
            />
            <text
              x={x + 40}
              y={56}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              steg {i + 1}
            </text>
            <text
              x={x + 40}
              y={72}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-bold"
            >
              {s.label}
            </text>
            <text
              x={x + 40}
              y={88}
              textAnchor="middle"
              className="fill-muted-foreground text-[8px]"
            >
              {s.crit}
            </text>

            {/* "skiller?" decision below each */}
            <line
              x1={x + 40}
              y1={96}
              x2={x + 40}
              y2={112}
              className="stroke-foreground/60"
              strokeWidth={1}
            />
            <polygon
              points={`${x + 36},109 ${x + 44},109 ${x + 40},115`}
              className="fill-foreground/60"
            />

            {/* "ja → velg" + "nei → neste" */}
            <text
              x={x + 18}
              y={130}
              textAnchor="middle"
              className="fill-success text-[8px] font-semibold"
            >
              ja
            </text>
            <text x={x + 18} y={140} textAnchor="middle" className="fill-success text-[7px]">
              ↓ velg
            </text>
            <text
              x={x + 62}
              y={130}
              textAnchor="middle"
              className="fill-muted-foreground text-[8px]"
            >
              nei
            </text>
            <text
              x={x + 62}
              y={140}
              textAnchor="middle"
              className="fill-muted-foreground text-[7px]"
            >
              → neste
            </text>

            {/* arrow to next */}
            {i < steps.length - 1 && (
              <>
                <line
                  x1={x + 80}
                  y1={68}
                  x2={x + 86}
                  y2={68}
                  className="stroke-foreground/60"
                  strokeWidth={1.2}
                />
                <polygon
                  points={`${x + 84},65 ${x + 90},68 ${x + 84},71`}
                  className="fill-foreground/60"
                />
              </>
            )}

            {/* result line down */}
            <line
              x1={x + 18}
              y1={140}
              x2={x + 18}
              y2={185}
              className="stroke-success/60"
              strokeWidth={1}
              strokeDasharray="2 2"
            />
            <rect
              x={x + 4}
              y={185}
              width={28}
              height={18}
              rx={3}
              className="fill-success/20 stroke-success"
              strokeWidth={1}
            />
            <text
              x={x + 18}
              y={197}
              textAnchor="middle"
              className="fill-success text-[8px] font-semibold"
            >
              VINN
            </text>
          </g>
        );
      })}

      <text
        x={270}
        y={230}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] italic"
      >
        Når et steg skiller stiene, stopper algoritmen. Resten av kriteriene ses aldri på.
      </text>
      <text x={270} y={246} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Det er hvorfor LOCAL_PREF (forretningspolicy) overstyrer AS_PATH (avstand).
      </text>
    </svg>
  );
}

function DhcpDora4MessageFlowSvg() {
  // 4 message swimlane
  return (
    <svg
      viewBox="0 0 480 280"
      className="w-full h-auto"
      role="img"
      aria-label="DHCP DORA — 4 meldinger mellom klient og server"
    >
      {/* Lifelines */}
      <text x={80} y={18} textAnchor="middle" className="fill-foreground text-[11px] font-bold">
        Klient
      </text>
      <text x={80} y={32} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        ennå ingen IP
      </text>
      <text x={400} y={18} textAnchor="middle" className="fill-foreground text-[11px] font-bold">
        DHCP-server
      </text>
      <text x={400} y={32} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        pool: 10.0.0.128/25
      </text>

      <line
        x1={80}
        y1={38}
        x2={80}
        y2={260}
        className="stroke-foreground/40"
        strokeWidth={1.5}
        strokeDasharray="2 3"
      />
      <line
        x1={400}
        y1={38}
        x2={400}
        y2={260}
        className="stroke-foreground/40"
        strokeWidth={1.5}
        strokeDasharray="2 3"
      />

      {/* Message 1: DISCOVER */}
      <line x1={82} y1={70} x2={398} y2={70} className="stroke-brand" strokeWidth={2} />
      <polygon points="394,67 402,70 394,73" className="fill-brand" />
      <rect
        x={150}
        y={50}
        width={180}
        height={16}
        rx={3}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1}
      />
      <text x={240} y={62} textAnchor="middle" className="fill-foreground text-[10px] font-bold">
        1. DISCOVER (broadcast)
      </text>
      <text x={240} y={82} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        src=0.0.0.0:68 → dst=255.255.255.255:67
      </text>

      {/* Message 2: OFFER */}
      <line x1={398} y1={120} x2={82} y2={120} className="stroke-amber-500" strokeWidth={2} />
      <polygon points="86,117 78,120 86,123" className="fill-amber-500" />
      <rect
        x={150}
        y={100}
        width={180}
        height={16}
        rx={3}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={240} y={112} textAnchor="middle" className="fill-foreground text-[10px] font-bold">
        2. OFFER
      </text>
      <text x={240} y={132} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        yiaddr=10.0.0.187, gw=10.0.0.1, lease=3600s
      </text>

      {/* Message 3: REQUEST */}
      <line x1={82} y1={170} x2={398} y2={170} className="stroke-purple-500" strokeWidth={2} />
      <polygon points="394,167 402,170 394,173" className="fill-purple-500" />
      <rect
        x={150}
        y={150}
        width={180}
        height={16}
        rx={3}
        className="fill-purple-500/20 stroke-purple-500"
        strokeWidth={1}
      />
      <text x={240} y={162} textAnchor="middle" className="fill-foreground text-[10px] font-bold">
        3. REQUEST (broadcast)
      </text>
      <text x={240} y={182} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        «jeg tar 10.0.0.187 fra server X»
      </text>

      {/* Message 4: ACK */}
      <line x1={398} y1={220} x2={82} y2={220} className="stroke-success" strokeWidth={2} />
      <polygon points="86,217 78,220 86,223" className="fill-success" />
      <rect
        x={150}
        y={200}
        width={180}
        height={16}
        rx={3}
        className="fill-success/20 stroke-success"
        strokeWidth={1}
      />
      <text x={240} y={212} textAnchor="middle" className="fill-foreground text-[10px] font-bold">
        4. ACK
      </text>
      <text x={240} y={232} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        bekreftet — du kan bruke IP-en nå
      </text>

      {/* Time axis */}
      <text x={20} y={70} className="fill-muted-foreground text-[8px] font-mono">
        t=0 ms
      </text>
      <text x={20} y={120} className="fill-muted-foreground text-[8px] font-mono">
        t=20
      </text>
      <text x={20} y={170} className="fill-muted-foreground text-[8px] font-mono">
        t=50
      </text>
      <text x={20} y={220} className="fill-muted-foreground text-[8px] font-mono">
        t=80
      </text>

      <text x={240} y={258} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Hele dansen ~100 ms — fire broadcasts gir mobilen din nett-tilgang før du rekker å blunke.
      </text>
    </svg>
  );
}

function OspfVsBgpTopologyCompareSvg() {
  return (
    <svg
      viewBox="0 0 720 280"
      className="w-full h-auto"
      role="img"
      aria-label="OSPF vs BGP — to topologi-bilder side ved side"
    >
      {/* OSPF side */}
      <text x={180} y={18} textAnchor="middle" className="fill-brand text-[12px] font-bold">
        OSPF — innen ett AS
      </text>
      <text x={180} y={32} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        flat graf med vekter på lenkene
      </text>

      {/* Box for AS */}
      <rect
        x={30}
        y={45}
        width={300}
        height={180}
        rx={8}
        className="fill-brand/5 stroke-brand"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      <text x={45} y={62} className="fill-brand text-[9px] font-semibold">
        AS 64512
      </text>

      {/* OSPF routers in a small mesh */}
      {[
        { x: 90, y: 100, name: "R1" },
        { x: 200, y: 90, name: "R2" },
        { x: 280, y: 130, name: "R3" },
        { x: 230, y: 190, name: "R4" },
        { x: 110, y: 180, name: "R5" },
      ].map((r) => (
        <g key={r.name}>
          <circle cx={r.x} cy={r.y} r={14} className="fill-card stroke-brand" strokeWidth={1.8} />
          <text
            x={r.x}
            y={r.y + 4}
            textAnchor="middle"
            className="fill-foreground text-[10px] font-bold"
          >
            {r.name}
          </text>
        </g>
      ))}
      {/* OSPF edges with weights */}
      {[
        { x1: 90, y1: 100, x2: 200, y2: 90, w: 2 },
        { x1: 200, y1: 90, x2: 280, y2: 130, w: 1 },
        { x1: 280, y1: 130, x2: 230, y2: 190, w: 4 },
        { x1: 230, y1: 190, x2: 110, y2: 180, w: 3 },
        { x1: 110, y1: 180, x2: 90, y2: 100, w: 5 },
        { x1: 200, y1: 90, x2: 230, y2: 190, w: 6 },
      ].map((e, i) => (
        <g key={i}>
          <line
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            className="stroke-foreground/40"
            strokeWidth={1.2}
          />
          <text
            x={(e.x1 + e.x2) / 2}
            y={(e.y1 + e.y2) / 2 - 4}
            textAnchor="middle"
            className="fill-amber-700 dark:fill-amber-300 text-[9px] font-mono font-bold"
          >
            {e.w}
          </text>
        </g>
      ))}

      <text x={180} y={252} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Dijkstra over hele grafen → SPT per ruter
      </text>
      <text x={180} y={266} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Sum av vekter er kostnaden
      </text>

      {/* BGP side */}
      <text
        x={540}
        y={18}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-300 text-[12px] font-bold"
      >
        BGP — mellom AS-er
      </text>
      <text x={540} y={32} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        AS-graf med policy-relasjoner
      </text>

      {/* AS clouds */}
      {[
        { x: 460, y: 90, name: "AS-1", color: "amber" },
        { x: 620, y: 90, name: "AS-2", color: "amber" },
        { x: 540, y: 165, name: "AS-3", color: "amber" },
        { x: 420, y: 200, name: "AS-4", color: "amber" },
        { x: 660, y: 200, name: "AS-5", color: "amber" },
      ].map((c) => (
        <g key={c.name}>
          <ellipse
            cx={c.x}
            cy={c.y}
            rx={28}
            ry={20}
            className="fill-amber-500/15 stroke-amber-500"
            strokeWidth={1.5}
          />
          <text
            x={c.x}
            y={c.y + 4}
            textAnchor="middle"
            className="fill-foreground text-[10px] font-bold"
          >
            {c.name}
          </text>
        </g>
      ))}

      {/* BGP edges labeled with relations */}
      <line x1={488} y1={90} x2={592} y2={90} className="stroke-foreground/50" strokeWidth={1.5} />
      <text
        x={540}
        y={84}
        textAnchor="middle"
        className="fill-purple-700 dark:fill-purple-300 text-[8px] font-semibold"
      >
        peer
      </text>

      <line
        x1={460}
        y1={110}
        x2={540}
        y2={150}
        className="stroke-foreground/50"
        strokeWidth={1.5}
      />
      <text
        x={490}
        y={134}
        textAnchor="middle"
        className="fill-emerald-700 dark:fill-emerald-300 text-[8px] font-semibold"
      >
        provider
      </text>

      <line
        x1={620}
        y1={110}
        x2={540}
        y2={150}
        className="stroke-foreground/50"
        strokeWidth={1.5}
      />
      <text
        x={590}
        y={134}
        textAnchor="middle"
        className="fill-emerald-700 dark:fill-emerald-300 text-[8px] font-semibold"
      >
        provider
      </text>

      <line
        x1={540}
        y1={180}
        x2={448}
        y2={200}
        className="stroke-foreground/50"
        strokeWidth={1.5}
      />
      <text
        x={486}
        y={196}
        textAnchor="middle"
        className="fill-rose-700 dark:fill-rose-300 text-[8px] font-semibold"
      >
        kunde
      </text>

      <line
        x1={540}
        y1={180}
        x2={632}
        y2={200}
        className="stroke-foreground/50"
        strokeWidth={1.5}
      />
      <text
        x={594}
        y={196}
        textAnchor="middle"
        className="fill-rose-700 dark:fill-rose-300 text-[8px] font-semibold"
      >
        kunde
      </text>

      <text x={540} y={252} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Path-vector → AS_PATH liste, ikke graf-søk
      </text>
      <text x={540} y={266} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        LOCAL_PREF speiler kommersielle relasjoner
      </text>
    </svg>
  );
}

function DvVsLsAlgoSvg() {
  return (
    <svg
      viewBox="0 0 600 240"
      className="w-full h-auto"
      role="img"
      aria-label="DV vs LS — to algoritmer i animasjon"
    >
      {/* DV side */}
      <text
        x={150}
        y={18}
        textAnchor="middle"
        className="fill-purple-700 dark:fill-purple-300 text-[11px] font-bold"
      >
        Distance-Vector (RIP, Bellman-Ford)
      </text>

      {/* Node with table */}
      <circle
        cx={80}
        cy={90}
        r={22}
        className="fill-purple-500/15 stroke-purple-500"
        strokeWidth={2}
      />
      <text x={80} y={94} textAnchor="middle" className="fill-foreground text-[11px] font-bold">
        B
      </text>
      <rect
        x={120}
        y={60}
        width={130}
        height={70}
        rx={4}
        className="fill-card stroke-purple-500"
        strokeWidth={1.2}
      />
      <text x={185} y={74} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        B&apos;s distance-vektor
      </text>
      <line x1={120} y1={80} x2={250} y2={80} className="stroke-purple-500/30" strokeWidth={1} />
      <text x={130} y={94} className="fill-muted-foreground text-[8px] font-mono">
        A: 1 via A
      </text>
      <text x={130} y={106} className="fill-muted-foreground text-[8px] font-mono">
        C: 1 via C
      </text>
      <text x={130} y={118} className="fill-muted-foreground text-[8px] font-mono">
        X: 3 via C
      </text>

      {/* Arrow showing exchange with neighbor */}
      <line x1={250} y1={95} x2={290} y2={95} className="stroke-amber-500" strokeWidth={2} />
      <polygon points="286,92 294,95 286,98" className="fill-amber-500" />
      <text
        x={270}
        y={88}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-300 text-[8px] font-semibold"
      >
        send vektor
      </text>
      <text
        x={270}
        y={108}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-300 text-[8px]"
      >
        til naboer
      </text>

      <text
        x={150}
        y={170}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-semibold"
      >
        Vet IKKE topologi.
      </text>
      <text
        x={150}
        y={184}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-semibold"
      >
        Vet kun (dest, dist, neste-hopp).
      </text>
      <text x={150} y={206} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Tror på nabos vektorer.
      </text>
      <text x={150} y={220} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        → count-to-infinity mulig.
      </text>

      {/* Divider */}
      <line
        x1={310}
        y1={30}
        x2={310}
        y2={230}
        className="stroke-foreground/30"
        strokeWidth={1}
        strokeDasharray="3 3"
      />

      {/* LS side */}
      <text x={450} y={18} textAnchor="middle" className="fill-brand text-[11px] font-bold">
        Link-State (OSPF, Dijkstra)
      </text>

      <circle cx={380} cy={90} r={22} className="fill-brand/15 stroke-brand" strokeWidth={2} />
      <text x={380} y={94} textAnchor="middle" className="fill-foreground text-[11px] font-bold">
        B
      </text>
      <rect
        x={420}
        y={50}
        width={160}
        height={90}
        rx={4}
        className="fill-card stroke-brand"
        strokeWidth={1.2}
      />
      <text x={500} y={62} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        B&apos;s LSDB (komplett kart)
      </text>
      <line x1={420} y1={68} x2={580} y2={68} className="stroke-brand/30" strokeWidth={1} />
      <text x={430} y={82} className="fill-muted-foreground text-[8px] font-mono">
        A—B: 1
      </text>
      <text x={430} y={94} className="fill-muted-foreground text-[8px] font-mono">
        B—C: 1
      </text>
      <text x={430} y={106} className="fill-muted-foreground text-[8px] font-mono">
        C—X: 2
      </text>
      <text x={430} y={118} className="fill-muted-foreground text-[8px] font-mono">
        A—D: 4, D—X: 1
      </text>
      <text x={430} y={132} className="fill-foreground text-[8px] font-mono font-bold">
        → Dijkstra lokalt
      </text>

      {/* Arrow showing flooding */}
      <text
        x={380}
        y={144}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-300 text-[8px] font-semibold"
      >
        flood LSA
      </text>
      <text
        x={380}
        y={158}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-300 text-[8px]"
      >
        til ALLE
      </text>

      <text
        x={450}
        y={184}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-semibold"
      >
        Har KOMPLETT topologi.
      </text>
      <text x={450} y={206} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Ingen «tror på naboen» — alle ser samme kart.
      </text>
      <text x={450} y={220} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Ingen count-to-infinity.
      </text>
    </svg>
  );
}

function BgpPolicyOverlaySvg() {
  return (
    <svg
      viewBox="0 0 500 240"
      className="w-full h-auto"
      role="img"
      aria-label="BGP shortest-path-myte med policy-overlay"
    >
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        To stier til samme prefiks — hvilken velger AS3?
      </text>

      {/* Source AS3 */}
      <circle cx={60} cy={120} r={22} className="fill-brand/20 stroke-brand" strokeWidth={2} />
      <text x={60} y={117} textAnchor="middle" className="fill-foreground text-[11px] font-bold">
        AS3
      </text>
      <text x={60} y={130} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        oss
      </text>

      {/* Destination AS-D */}
      <circle cx={440} cy={120} r={22} className="fill-success/20 stroke-success" strokeWidth={2} />
      <text x={440} y={117} textAnchor="middle" className="fill-foreground text-[11px] font-bold">
        AS-D
      </text>
      <text x={440} y={130} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        10.0.0.0/8
      </text>

      {/* Path A: short — peer (LOCAL_PREF=100) */}
      <circle
        cx={250}
        cy={60}
        r={18}
        className="fill-purple-500/20 stroke-purple-500"
        strokeWidth={1.8}
      />
      <text x={250} y={64} textAnchor="middle" className="fill-foreground text-[10px] font-bold">
        AS-P
      </text>
      <line x1={82} y1={115} x2={232} y2={66} className="stroke-foreground/50" strokeWidth={1.5} />
      <line x1={268} y1={66} x2={418} y2={115} className="stroke-foreground/50" strokeWidth={1.5} />
      <rect
        x={170}
        y={20}
        width={160}
        height={26}
        rx={3}
        className="fill-purple-500/15 stroke-purple-500"
        strokeWidth={1}
      />
      <text x={250} y={32} textAnchor="middle" className="fill-foreground text-[10px] font-bold">
        Sti A: 2 AS-hopp
      </text>
      <text
        x={250}
        y={42}
        textAnchor="middle"
        className="fill-purple-700 dark:fill-purple-300 text-[9px] font-mono"
      >
        peer · LOCAL_PREF=100
      </text>

      {/* Path B: long — customer (LOCAL_PREF=200) */}
      <circle
        cx={180}
        cy={185}
        r={18}
        className="fill-rose-500/20 stroke-rose-500"
        strokeWidth={1.8}
      />
      <text x={180} y={189} textAnchor="middle" className="fill-foreground text-[10px] font-bold">
        AS-C1
      </text>
      <circle
        cx={320}
        cy={185}
        r={18}
        className="fill-rose-500/20 stroke-rose-500"
        strokeWidth={1.8}
      />
      <text x={320} y={189} textAnchor="middle" className="fill-foreground text-[10px] font-bold">
        AS-C2
      </text>
      <line x1={80} y1={135} x2={163} y2={180} className="stroke-rose-500" strokeWidth={2.5} />
      <line x1={198} y1={185} x2={302} y2={185} className="stroke-rose-500" strokeWidth={2.5} />
      <line x1={337} y1={180} x2={420} y2={135} className="stroke-rose-500" strokeWidth={2.5} />
      <rect
        x={150}
        y={210}
        width={200}
        height={26}
        rx={3}
        className="fill-rose-500/15 stroke-rose-500"
        strokeWidth={1}
      />
      <text x={250} y={222} textAnchor="middle" className="fill-foreground text-[10px] font-bold">
        Sti B: 3 AS-hopp (lengre!)
      </text>
      <text
        x={250}
        y={232}
        textAnchor="middle"
        className="fill-rose-700 dark:fill-rose-300 text-[9px] font-mono"
      >
        kunde · LOCAL_PREF=200 ← VINNER
      </text>

      {/* Big arrow showing winner */}
      <text x={250} y={125} textAnchor="middle" className="fill-success text-[11px] font-semibold">
        Vinner: B (LOCAL_PREF skiller før AS_PATH)
      </text>
      <text x={250} y={155} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Korteste sti taper når policy sier «kunde først».
      </text>
    </svg>
  );
}

function Type3LsaBetweenAreasSvg() {
  return (
    <svg
      viewBox="0 0 540 220"
      className="w-full h-auto"
      role="img"
      aria-label="Type 3 LSA mellom areas"
    >
      <text
        x={270}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Hvilke LSA-typer krysser area-grensen?
      </text>

      {/* Area 1 box */}
      <rect
        x={20}
        y={40}
        width={200}
        height={140}
        rx={8}
        className="fill-brand/10 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={120} y={56} textAnchor="middle" className="fill-brand text-[10px] font-bold">
        Area 1
      </text>

      {/* Inside Area 1: type 1/2 LSAs */}
      <rect
        x={40}
        y={70}
        width={70}
        height={20}
        rx={3}
        className="fill-emerald-500/20 stroke-emerald-500"
        strokeWidth={1}
      />
      <text x={75} y={84} textAnchor="middle" className="fill-foreground text-[9px] font-mono">
        Type 1
      </text>
      <rect
        x={130}
        y={70}
        width={70}
        height={20}
        rx={3}
        className="fill-emerald-500/20 stroke-emerald-500"
        strokeWidth={1}
      />
      <text x={165} y={84} textAnchor="middle" className="fill-foreground text-[9px] font-mono">
        Type 2
      </text>
      <text x={120} y={108} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        Router-LSA + Network-LSA
      </text>
      <text x={120} y={122} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        flommer kun innen Area 1
      </text>

      {/* Routers in Area 1 */}
      <circle cx={60} cy={150} r={9} className="fill-card stroke-brand" strokeWidth={1.2} />
      <text x={60} y={153} textAnchor="middle" className="fill-foreground text-[8px]">
        r1
      </text>
      <circle cx={120} cy={155} r={9} className="fill-card stroke-brand" strokeWidth={1.2} />
      <text x={120} y={158} textAnchor="middle" className="fill-foreground text-[8px]">
        r2
      </text>

      {/* ABR on boundary */}
      <circle
        cx={220}
        cy={120}
        r={16}
        className="fill-amber-500/30 stroke-amber-600"
        strokeWidth={2.5}
      />
      <text x={220} y={117} textAnchor="middle" className="fill-foreground text-[8px] font-bold">
        ABR
      </text>
      <text x={220} y={128} textAnchor="middle" className="fill-foreground text-[7px]">
        gateway
      </text>

      {/* X marker on Type 1/2 trying to cross */}
      <line x1={200} y1={80} x2={216} y2={108} className="stroke-destructive" strokeWidth={1.5} />
      <text x={196} y={102} className="fill-destructive text-[14px] font-bold">
        ✗
      </text>
      <text x={170} y={102} className="fill-destructive text-[8px] font-semibold">
        stoppes
      </text>

      {/* Type 3 LSA crossing — green arrow */}
      <rect
        x={250}
        y={108}
        width={100}
        height={24}
        rx={4}
        className="fill-purple-500/25 stroke-purple-500"
        strokeWidth={2}
      />
      <text
        x={300}
        y={124}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-mono font-bold"
      >
        Type 3
      </text>
      <line x1={236} y1={120} x2={248} y2={120} className="stroke-purple-500" strokeWidth={2} />
      <line x1={350} y1={120} x2={372} y2={120} className="stroke-purple-500" strokeWidth={2} />
      <polygon points="370,117 378,120 370,123" className="fill-purple-500" />
      <text
        x={300}
        y={148}
        textAnchor="middle"
        className="fill-purple-700 dark:fill-purple-300 text-[8px]"
      >
        Summary: «10.20.0.0/16, kost=42»
      </text>
      <text x={300} y={162} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        ABR oppsummerer prefiks fra Area 1
      </text>

      {/* Area 0 */}
      <rect
        x={380}
        y={40}
        width={140}
        height={140}
        rx={8}
        className="fill-amber-500/10 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text
        x={450}
        y={56}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-300 text-[10px] font-bold"
      >
        Area 0 (backbone)
      </text>
      <circle cx={420} cy={150} r={9} className="fill-card stroke-amber-500" strokeWidth={1.2} />
      <text x={420} y={153} textAnchor="middle" className="fill-foreground text-[8px]">
        bb1
      </text>
      <circle cx={480} cy={155} r={9} className="fill-card stroke-amber-500" strokeWidth={1.2} />
      <text x={480} y={158} textAnchor="middle" className="fill-foreground text-[8px]">
        bb2
      </text>
      <text x={450} y={195} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        Ser bare prefiks + kost, ikke intern topologi i Area 1
      </text>

      <text x={270} y={216} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Hver area har sin egen LSDB. Type 3 er kontrakten mellom dem.
      </text>
    </svg>
  );
}

function IcmpNameConfusionSvg() {
  return (
    <svg
      viewBox="0 0 540 220"
      className="w-full h-auto"
      role="img"
      aria-label="ICMP — navneforveksling, full forklaring"
    >
      <text
        x={270}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Hva betyr egentlig hver bokstav i ICMP?
      </text>

      {/* Letters with explanations */}
      {[
        {
          x: 80,
          letter: "I",
          full: "Internet",
          note: "kjøres over IP",
          wrong: false,
        },
        {
          x: 200,
          letter: "C",
          full: "Control",
          note: "diagnose, ikke ruting!",
          wrong: false,
        },
        {
          x: 320,
          letter: "M",
          full: "Message",
          note: "← det viktige!",
          wrong: false,
        },
        {
          x: 440,
          letter: "P",
          full: "Protocol",
          note: "egen IP-protokoll-nr 1",
          wrong: false,
        },
      ].map((l, i) => (
        <g key={i}>
          <rect
            x={l.x - 36}
            y={40}
            width={72}
            height={62}
            rx={6}
            className="fill-card stroke-brand"
            strokeWidth={2}
          />
          <text x={l.x} y={70} textAnchor="middle" className="fill-brand text-[22px] font-bold">
            {l.letter}
          </text>
          <text
            x={l.x}
            y={92}
            textAnchor="middle"
            className="fill-foreground text-[9px] font-semibold"
          >
            {l.full}
          </text>
          <text x={l.x} y={118} textAnchor="middle" className="fill-muted-foreground text-[9px]">
            {l.note}
          </text>
        </g>
      ))}

      {/* Highlight on "M" */}
      <rect
        x={284}
        y={36}
        width={72}
        height={70}
        rx={6}
        className="fill-none stroke-amber-500"
        strokeWidth={2.5}
        strokeDasharray="4 2"
      />
      <text
        x={320}
        y={32}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-300 text-[9px] font-bold"
      >
        fokus
      </text>

      {/* Wrong vs right interpretation */}
      <rect
        x={40}
        y={150}
        width={220}
        height={50}
        rx={4}
        className="fill-destructive/10 stroke-destructive"
        strokeWidth={1.2}
      />
      <text x={50} y={166} className="fill-destructive text-[10px] font-bold">
        ✗ FEIL: «Internet Control Protocol»
      </text>
      <text x={50} y={180} className="fill-muted-foreground text-[9px]">
        → da ville det vært en control-plane som
      </text>
      <text x={50} y={192} className="fill-muted-foreground text-[9px]">
        bygger ruter (som OSPF). Det gjør ICMP IKKE.
      </text>

      <rect
        x={280}
        y={150}
        width={220}
        height={50}
        rx={4}
        className="fill-success/10 stroke-success"
        strokeWidth={1.2}
      />
      <text x={290} y={166} className="fill-success text-[10px] font-bold">
        ✓ RIKTIG: «Internet Control Message Protocol»
      </text>
      <text x={290} y={180} className="fill-muted-foreground text-[9px]">
        → kontroll-MELDINGER (ping, traceroute,
      </text>
      <text x={290} y={192} className="fill-muted-foreground text-[9px]">
        «Destination Unreachable», «TTL Exceeded»).
      </text>
    </svg>
  );
}

function FiveMinAnker15CardsSvg() {
  const cards = [
    { title: "Control vs data", body: "tabell vs per-pakke" },
    { title: "LS vs DV", body: "Dijkstra vs B-Ford" },
    { title: "Relax-steg", body: "D(w)+c<D(v)" },
    { title: "BF-ligning", body: "min_v(c+D_v)" },
    { title: "Count-to-∞", body: "split / poison / cap" },
    { title: "OSPF intra-AS", body: "areas, hello 10s" },
    { title: "LSA-typer", body: "1/2 lokal, 3 ABR" },
    { title: "BGP inter-AS", body: "policy-basert" },
    { title: "BGP-rekken", body: "LP→AS→OR→MED" },
    { title: "Hot-potato", body: "nærmeste NEXT_HOP" },
    { title: "SDN-controller", body: "OpenFlow flow-mod" },
    { title: "ICMP", body: "ping / traceroute" },
    { title: "DHCP DORA", body: "UDP 67/68, broadcast" },
    { title: "SPOF-tradeoff", body: "distribuert overlever" },
    { title: "Ordvalg", body: "rute ≠ forward" },
  ];
  return (
    <svg
      viewBox="0 0 720 220"
      className="w-full h-auto"
      role="img"
      aria-label="15 visuelle anker-kort"
    >
      {cards.map((c, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const x = 10 + col * 142;
        const y = 10 + row * 68;
        const colors = [
          "fill-brand/15 stroke-brand",
          "fill-amber-500/15 stroke-amber-500",
          "fill-purple-500/15 stroke-purple-500",
          "fill-emerald-500/15 stroke-emerald-500",
          "fill-rose-500/15 stroke-rose-500",
          "fill-sky-500/15 stroke-sky-500",
        ];
        const color = colors[i % colors.length];
        return (
          <g key={i}>
            <rect x={x} y={y} width={130} height={60} rx={6} className={color} strokeWidth={1.5} />
            <circle
              cx={x + 14}
              cy={y + 14}
              r={9}
              className="fill-card stroke-foreground"
              strokeWidth={1}
            />
            <text
              x={x + 14}
              y={y + 18}
              textAnchor="middle"
              className="fill-foreground text-[9px] font-bold"
            >
              {i + 1}
            </text>
            <text x={x + 30} y={y + 20} className="fill-foreground text-[10px] font-bold">
              {c.title}
            </text>
            <foreignObject x={x + 8} y={y + 28} width={118} height={28}>
              <div
                style={{
                  fontSize: 9,
                  lineHeight: 1.2,
                  color: "var(--muted-foreground, #888)",
                  textAlign: "center",
                  fontFamily: "monospace",
                }}
              >
                {c.body}
              </div>
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
}
