import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  ExternalLink,
} from "lucide-react";
import { SectionPager, type SectionNavItem } from "./SectionPager";
import { Section41Live } from "./Section41Live";
import { Section42Live } from "./Section42Live";
import { Section43Live } from "./Section43Live";
import { Section44Live } from "./Section44Live";
import { Section45Live } from "./Section45Live";
import { VisualDefs } from "./VisualDefs";
import { LectureNote, LectureBeat } from "./LectureNote";
import {
  ForwardingIcon,
  RoutingIcon,
  FibTableIcon,
  RibTableIcon,
  LpmIcon,
  FabricCrossbarIcon,
  InputPortIcon,
  OutputPortIcon,
  FabricMemoryIcon,
  FabricBusIcon,
  HolBlockingIcon,
  OutputLossIcon,
  RoutingProcessorIcon,
  Ipv4HeaderIcon,
  TtlIcon,
  MtuIcon,
  FragmentationIcon,
  PathMtuIcon,
  Ipv6HeaderIcon,
  Ipv6VsIpv4Icon,
  AddressRulerIcon,
  DualStackIcon,
  SdnIcon,
  OpenFlowIcon,
  MatchActionIcon,
  FlowIcon,
  ActionsIcon,
  PipelineIcon,
  NorthboundIcon,
  SouthboundIcon,
  NatIcon,
  NatTraversalIcon,
  NatTypesIcon,
  StatefulFirewallIcon,
  AclIcon,
  LoadBalancerIcon,
  DpiIcon,
  ProxyIcon,
} from "./visualDefIcons.kap4";

type Tab = "intro" | "4.1" | "4.2" | "4.3" | "4.4" | "4.5" | "4.6" | "4.7";

const SECTIONS_4: SectionNavItem[] = [
  { id: "intro", label: "Start her" },
  { id: "4.1", label: "4.1 Forwarding og routing" },
  { id: "4.2", label: "4.2 Inni en ruter" },
  { id: "4.3", label: "4.3 IP" },
  { id: "4.4", label: "4.4 Generalisert forwarding" },
  { id: "4.5", label: "4.5 Middlebokser" },
  { id: "4.6", label: "4.6 Oppgaver" },
  { id: "4.7", label: "4.7 Eksamen-fokus" },
];
const NEXT_CHAPTER_4 = { slug: "kurose-kap-5", title: "Nettverkslaget — control-plane" };

export function KuroseKap4Page() {
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
              Kap. 4 — Nettverkslaget: data-plane
            </h1>
          </div>
          <nav className="ml-auto flex flex-wrap gap-0.5">
            <TabBtn active={tab === "intro"} onClick={() => setTab("intro")}>
              Start
            </TabBtn>
            <TabBtn active={tab === "4.1"} onClick={() => setTab("4.1")} title="Forwarding og routing">
              4.1
            </TabBtn>
            <TabBtn active={tab === "4.2"} onClick={() => setTab("4.2")} title="Inni en ruter">
              4.2
            </TabBtn>
            <TabBtn active={tab === "4.3"} onClick={() => setTab("4.3")} title="IP">
              4.3
            </TabBtn>
            <TabBtn active={tab === "4.4"} onClick={() => setTab("4.4")} title="Generalisert forwarding">
              4.4
            </TabBtn>
            <TabBtn active={tab === "4.5"} onClick={() => setTab("4.5")} title="Middlebokser">
              4.5
            </TabBtn>
            <TabBtn active={tab === "4.6"} onClick={() => setTab("4.6")} title="Oppgaver">
              Oppg.
            </TabBtn>
            <TabBtn active={tab === "4.7"} onClick={() => setTab("4.7")} title="Eksamen-fokus">
              Eksamen
            </TabBtn>
          </nav>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "4.1" && <Section41 />}
        {tab === "4.2" && <Section42 />}
        {tab === "4.3" && <Section43 />}
        {tab === "4.4" && <Section44 />}
        {tab === "4.5" && <Section45 />}
        {tab === "4.6" && <Section46 />}
        {tab === "4.7" && <SectionEksamen />}

        <SectionPager
          tabs={SECTIONS_4}
          current={tab}
          onPick={(id) => setTab(id as Tab)}
          nextChapter={NEXT_CHAPTER_4}
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
            Skille mellom <em>data-plane</em> (per-pakke forwarding) og <em>control-plane</em>{" "}
            (rute-beregning), og forstå hvorfor skillet er sentralt i moderne rutere.
          </li>
          <li>
            Tegne arkitekturen i en moderne ruter: input-porter, switching-fabric, output-porter,
            og hvor kø-blokkering oppstår.
          </li>
          <li>
            Forklare hvordan en pakke flyter gjennom ruteren: lookup i forwarding-tabellen med
            longest prefix match, valg av output-port, switching.
          </li>
          <li>
            Lese IPv4-header bit for bit; forklare fragmentering når en pakke møter en lenke med
            mindre MTU; kjenne IPv6 og hva som er nytt.
          </li>
          <li>
            Forstå generalisert forwarding (SDN, OpenFlow, match-action) og hvorfor å skille
            control-plane fra data-plane endrer hva et nettverk kan gjøre.
          </li>
          <li>
            Beskrive middlebokser — NAT, brannmurer, load-balancere — og hva slags
            kompromisser de gir.
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Kapittelets struktur</h2>
        <ol className="list-decimal pl-5 text-muted-foreground space-y-1">
          <li>Forwarding og routing — ruter-arkitektur (interaktiv visualisering)</li>
          <li>Hva er inne i en ruter — input/output, fabric-typer</li>
          <li>IP — IPv4 header, fragmentering, IPv6</li>
          <li>Generalisert forwarding — SDN, OpenFlow, match-action</li>
          <li>Middlebokser — NAT, brannmur, load-balancer</li>
          <li>Oppgaver</li>
          <li>Eksamen-fokus</li>
        </ol>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => onPick("4.1")}>
            Start på 4.1 →
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 4.1 — Forwarding og routing (interaktiv ruter-arkitektur)
// ============================================================
function Section41() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="4.1" title="Forwarding og routing — ruter-arkitektur" />

      <p className="text-muted-foreground">
        En ruter har én jobb: ta en pakke som ankommer, og sende den ut på riktig lenke. Men «riktig
        lenke» avgjøres to forskjellige steder. <strong>Forwarding</strong> er den raske,
        per-pakke-beslutningen som skjer i selve maskinvaren — flere millioner ganger i sekundet.{" "}
        <strong>Routing</strong> er den tregere, sjeldnere prosessen som beregner og oppdaterer
        tabellen forwardingen leser. Skillet mellom de to er det viktigste arkitektoniske grepet
        i nettverkslaget.
      </p>

      <Section41Live />

      <LectureNote title="Lokalt vs. globalt — og hvorfor best effort vant">
        <p>
          Nettverkslaget er limet som holder internettet sammen, og det som gjør det spesielt er at
          det er implementert i <strong>hver eneste</strong> internett-tilkoblede enhet — milliarder
          av verter og rutere. Det er også derfor det er så stort at det ikke får plass i ett
          kapittel: vi deler i <strong>dataplanet</strong> (det hver enkelt ruter gjør lokalt) og{" "}
          <strong>kontrollplanet</strong> (den nettverksvide logikken).
        </p>
        <p>
          Skillet lokalt/globalt er nøkkelen til hele kapittelet.{" "}
          <strong>Forwarding</strong> er den lokale handlingen: flytt pakken fra en inngangsport til
          riktig utgangsport. Det skjer på nanosekund-skala og er implementert i maskinvare.{" "}
          <strong>Routing</strong> er den nettverksvide aktiviteten: bestem hvilken sti pakker skal ta
          fra kilde til destinasjon. Det skjer på sekund-skala og er implementert i programvare.
        </p>
        <p>
          Analogien er en biltur: forwarding er å komme seg gjennom <em>ett</em> kryss eller én
          rundkjøring. Routing er å planlegge og gjennomføre hele turen fra by til by, gjennom mange
          kryss.
        </p>

        <LectureBeat>Hvor kommer forwarding-tabellen fra?</LectureBeat>
        <p>
          Ruteren matcher bits i pakkens header mot en oppføring i en lokal forwarding-tabell som sier
          hvilken utgangslenke pakken skal på. Det virkelige spørsmålet er hvordan den tabellen
          fylles. Helt i starten ble tabellene <em>skrevet inn for hånd</em> av en nettverksansvarlig.
          Med hundrevis av millioner rutere er det ikke lenger en mulighet.
        </p>
        <p>
          Derfor to tilnærminger, og det er de vi skal studere.{" "}
          <strong>Tradisjonelt</strong> kjører en distribuert rutingalgoritme i hver eneste ruter, og
          bitene snakker sammen for å regne ut tabellene. Med{" "}
          <strong>software-defined networking</strong> ligger en fysisk adskilt fjernkontroller — som
          regel i et datasenter — som regner ut tabellene og <em>dytter dem ut</em> til ruterne.
          Ruteren gjør fortsatt den samme lokale forwardingen; forskjellen er hvor tabellen ble
          laget.
        </p>

        <LectureBeat>Tjenestemodellen — og en påstand verdt å tygge på</LectureBeat>
        <p>
          Hva <em>kunne</em> nettverkslaget lovet? Garantert levering. Garantert levering med
          forsinkelsestak, for eksempel under 40 ms. Garantert rekkefølge. Garantert minimum
          båndbredde per strøm.
        </p>
        <p>
          Internettets svar er <strong>best effort</strong>: sendte pakker er ikke engang garantert
          å komme fram, langt mindre innen en frist eller med en båndbreddegaranti. Man kan nesten
          kalle det en eufemisme for ingen tjeneste i det hele tatt — et nett som leverte null pakker
          ville teknisk sett oppfylt definisjonen.
        </p>
        <p>
          På 1990-tallet ble langt mer sofistikerte tjenestemodeller foreslått, standardisert i
          RFC-er og til og med bygget inn i rutere. De brukes knapt. Hvorfor vant den minimale
          modellen? Fire grunner er verdt å huske:
        </p>
        <p>
          <strong>Enkelheten</strong> gjorde det trivielt å koble til en ny vert eller et nytt nett,
          og overkommelig å drifte et IP-nett — noe som slett ikke gjaldt de konkurrerende
          nettteknologiene på samme tid. <strong>Nok kapasitet</strong> ble etter hvert mulig å kjøpe,
          så sanntidstjenester fungerer godt nok mesteparten av tiden. Den enorme mengden{" "}
          <strong>distribuert applikasjonsinfrastruktur</strong> (CDN-er og lignende) kompenserer for
          det nettet ikke lover — og oppsto trolig <em>nettopp fordi</em> tjenestemodellen var så
          mager. Og til slutt kan <strong>TCPs metningskontroll</strong> trekke seg tilbake når det
          butter.
        </p>
        <p>
          Poenget er verdt å ta med seg som ingeniør: vi henger oss ofte så opp i mekanismene at vi
          mister de store spørsmålene av syne — og valget av tjenestemodell var trolig en av de
          viktigste beslutningene i hele det opprinnelige internett-designet.
        </p>
      </LectureNote>


      <VisualDefs
        items={[
          {
            term: "Forwarding (data-plane)",
            icon: <ForwardingIcon />,
            body: (
              <>
                Per-pakke-beslutningen: ankommer en pakke, slå opp i forwarding-tabellen, send ut
                på rett port. Skjer i linjehastighet (nanosekunder) i ruterens hardware.
              </>
            ),
          },
          {
            term: "Routing (control-plane)",
            icon: <RoutingIcon />,
            body: (
              <>
                Beregner <em>hva</em> som skal stå i forwarding-tabellen. Bytter info med
                naboer (OSPF, BGP) og kjører algoritmer som Dijkstra. Tar sekunder eller minutter
                ved endring.
              </>
            ),
          },
          {
            term: "Forwarding-tabell (FIB — Forwarding Information Base)",
            icon: <FibTableIcon />,
            body: (
              <>
                Mapping fra IP-prefix til output-port. Eksempel: <code>10.1.2.0/24 → P4</code>.
                Hver input-port har sin egen kopi for å unngå flaskehals.
              </>
            ),
          },
          {
            term: "Routing-tabell (RIB — Routing Information Base)",
            icon: <RibTableIcon />,
            body: (
              <>
                Routing-prosessorens kompletteste bilde av topologien. RIB er CPU-data; FIB
                er den kompakte projeksjonen ned i hardware.
              </>
            ),
          },
          {
            term: "Longest Prefix Match (LPM)",
            icon: <LpmIcon />,
            body: (
              <>
                Når flere prefikser i tabellen matcher samme destinasjons-IP, velges det
                <em> lengste</em> — det mest spesifikke. <code>10.1.2.55</code> matcher både{" "}
                <code>10.0.0.0/8</code> og <code>10.1.2.0/24</code>, men /24 vinner.
              </>
            ),
          },
          {
            term: "Switching-fabric",
            icon: <FabricCrossbarIcon />,
            body: (
              <>
                Mekanismen inne i ruteren som flytter pakker fra input-port til output-port.
                Tre hovedtyper: minne (CPU kopierer), buss (delt, én pakke om gangen), crossbar
                (parallelle stier — moderne høyhastighets-rutere).
              </>
            ),
          },
        ]}
      />

      <Metafor tittel="Postsorterings-sentral">
        <p>
          Et brev kommer inn på en av mange luker (input-port). En operatør leser
          mottakerens postnummer (LPM-oppslag), legger brevet på et transportbånd som krysser
          hallen (switching-fabric), og det havner i en kasse for riktig utgangsdør
          (output-kø). Bilene kjører ut etter ruteplan (output-port → ut-lenke).
        </p>
        <p className="mt-2">
          Samtidig sitter postsjefen på kontoret og oppdaterer kart over nye veier som er
          åpne eller stengte (control-plane: OSPF). Hun trykker det inn i operatørenes
          oppslagsark (FIB) — uten å stoppe sorteringen.
        </p>
      </Metafor>

      <Hvorfor title="Hvorfor skille data-plane fra control-plane?">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Ytelse:</strong> data-planet må jobbe i nanosekunder per pakke. Det
            klarer det bare fordi det leser en ferdig-tygget tabell.
          </li>
          <li>
            <strong>Stabilitet:</strong> en lenke som faller ut starter et stort
            beregningsarbeid (Dijkstra). Det får ikke lov til å hindre at de millionene
            pakker som allerede er underveis blir levert.
          </li>
          <li>
            <strong>Fleksibilitet:</strong> man kan bytte routing-protokoll (RIP → OSPF →
            BGP) uten å røre hardware. Og man kan flytte hele control-planet ut av
            ruteren — det er SDN (kap. 4.4).
          </li>
        </ul>
      </Hvorfor>

      <Fallgruve tittel="Forveksling: ‘forwarding’ vs ‘routing’">
        I dagligtale brukes ordene om hverandre. På eksamen må du skille: en pakke{" "}
        <em>forwardes</em>; en sti <em>routes</em>. Forwarding er hva ruteren gjør med
        akkurat denne pakken; routing er hva ruteren <em>vet</em> om nettverket totalt.
      </Fallgruve>
    </article>
  );
}

// ============================================================
// 4.2 — Hva er inni en ruter
// ============================================================
function Section42() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="4.2" title="Hva er inni en ruter" />

      <p className="text-muted-foreground">
        En ruter har fire byggesteiner: input-porter, switching-fabric, output-porter, og en
        routing-prosessor som styrer control-planet. Forwarding går horisontalt gjennom de
        tre første. Routing-prosessoren sitter på siden og oppdaterer forwarding-tabellen i
        hver input-port.
      </p>

      <Section42Live />

      <LectureNote title="Inne i ruteren: portene, veven og det lengste prefikset">
        <p>
          En ruter har fire deler: <strong>inngangsporter</strong>,{" "}
          <strong>utgangsporter</strong>, en <strong>svitsjevev</strong> og en{" "}
          <strong>ruteprosessor</strong>. Antall porter spenner fra en håndfull i en hjemmeruter til
          mange hundre i en ryggradsruter, hver på mange Gb/s. Skillet mellom dataplan og
          kontrollplan er fysisk synlig her: portene og veven går i maskinvare i høy hastighet,
          ruteprosessoren kjører programvare på langt roligere tidsskala.
        </p>
        <p>
          Går du inn i en inngangsport fra venstre, møter du først{" "}
          <strong>linjeterminering</strong> (fysisk lag: ta imot bits fra kobber, fiber eller
          radio), så <strong>lenkelaget</strong> (sett bitene sammen til rammer), og så
          nettverkslaget. Og den kritiske funksjonen der er{" "}
          <strong>oppslag og videresending</strong>: hvilken utgangsport skal denne pakken til? Det
          er <em>match + action</em> i sin enkleste form.
        </p>

        <LectureBeat>Longest prefix match</LectureBeat>
        <p>
          Det finnes nesten fire milliarder mulige måladresser. Vi vil åpenbart ikke ha én
          tabelloppføring per adresse, så oppføringene dekker <em>områder</em>. Men adresseområder
          blir stygge så snart en liten del av et område skal et annet sted — skal vi da splitte
          området i biter?
        </p>
        <p>
          Nei. Man bruker <strong>prefikser</strong> i stedet, og regelen er:{" "}
          <em>alle</em> bitene i prefikset må stemme med adressens venstre bits, og blant alle
          prefikser som matcher, velger man <strong>det lengste</strong>. Det kalles også{" "}
          <em>mest spesifikke match</em>, siden det er det som matcher flest av adressens
          venstrebits. En adresse kan altså matche to oppføringer der den ene har 21 bits og den
          andre 24 — og da vinner 24-bits-oppføringen. Adresseområder og prefikser er egentlig samme
          sak, men prefikser er langt greiere å regne med.
        </p>
        <p>
          I praksis gjøres oppslaget i maskinvare, ofte i{" "}
          <strong>TCAM</strong>-minne, der du presenterer adressen og får treffet tilbake på{" "}
          <em>én klokkesyklus uansett tabellstørrelse</em>.
        </p>

        <LectureBeat>Svitsjeveven — hjertet</LectureBeat>
        <p>
          Vevens viktigste egenskap er <strong>svitsjeraten</strong>. Har du n innganger med rate R
          og veven klarer n·R, kan alt som kommer inn svitsjes videre uten nevneverdig venting — det
          kalles en <strong>ikke-blokkerende</strong> vev. Slike er dyrere, så ikke alle rutere har
          dem; blokkerer veven, må pakker vente i kø på <em>inngangssiden</em>.
        </p>
        <p>
          Tre måter å bygge veven på. <strong>Via minne</strong> — de aller første ruterne var i
          praksis vanlige datamaskiner der CPU-en kopierte pakken fra inngangsport til minne og fra
          minne til utgangsport; nettverksportene var bare enda en I/O-enhet.{" "}
          <strong>Via buss</strong> — hopp over minnet, la inngangsporten skrive rett inn i
          utgangsportens buffer, så pakken bare krysser bussen én gang; da er bussens båndbredde
          taket. <strong>Via sammenkoblingsnett</strong> — den mest brukte i dag, og den mest
          interessante.
        </p>
        <p>
          Sammenkoblingsnett i rutere deler mye med de som i tiår har koblet prosessorer sammen i
          flerprosessormaskiner. En krysskobling forbinder n innganger og n utganger gjennom n²
          koblingspunkter; mer typisk brukes <strong>flertrinns svitsjenett</strong> bygget av mange
          små svitsjelementer, både i serie (flere trinn) og parallelt (innen et trinn). Fordi slike
          vever har <em>parallelle stier</em>, er det vanlig å dele ett datagram opp i mindre biter
          av fast lengde, sende dem parallelt, og sette datagrammet sammen igjen på utgangssiden. Og
          parallelliteten kan skaleres videre ved å kjøre flere hele svitsjeplan side om side — slik
          når man hundrevis av terabit svitsjekapasitet i én ruter.
        </p>
        <p>
          En kø-effekt som er unik for inngangssiden er{" "}
          <strong>head-of-line blocking</strong>: vil pakker fra flere inngangsporter til{" "}
          <em>samme</em> utgangsport, må alle unntatt én vente — og en ventende pakke fremst i køen
          blokkerer pakkene bak seg, selv om de skulle til en helt ledig utgangsport.
        </p>
      </LectureNote>

      <LectureNote title="Buffer og køordninger — og nettnøytralitet">
        <p>
          På utgangssiden ser du hvorfor buffere i det hele tatt finnes: bits kan ankomme i rate n·R
          fra veven, men kan bare tømmes ut på lenken i rate R. Overstiger ankomstraten
          avgangsraten, fylles bufferet — og siden buffere er endelige, må pakker til slutt{" "}
          <strong>kastes</strong>. Det er her metningstap oppstår.
        </p>
        <p>
          Det er fristende å skylde på veven som leverer for fort. Men det er feil diagnose. Den
          egentlige årsaken er at det er <strong>for mange avsendere ute i kanten som sender for
          mye, for fort</strong>, og at stiene deres krysser hverandre akkurat her.
        </p>

        <LectureBeat>Hvor mye buffer er riktig?</LectureBeat>
        <p>
          Femti år etter er dette fortsatt ikke avklart. Den klassiske tommelfingerregelen sier{" "}
          <strong>typisk RTT × lenkekapasitet</strong>. Nyere teoretisk arbeid, som antar at
          avsenderne er uavhengige av hverandre, foreslår å dele det på <strong>√n</strong> der n er
          antall strømmer over lenken — altså <em>langt</em> mindre.
        </p>
        <p>
          For mye buffer har nemlig en bakside: store buffere betyr{" "}
          <strong>store forsinkelser</strong>. Det er dårlig for spillere og for videomøter der
          titalls millisekunder betyr noe — men verre: lang RTT betyr at TCP-avsendere{" "}
          <em>oppdager og reagerer på metning senere</em>, så reguleringen blir treg og sløv. Vi vil
          ha nok buffer til å absorbere kortvarige svingninger og holde lenken opptatt, men ikke mer.
          Buffer er som salt i matlagingen: riktig mengde gjør retten bedre, for mye ødelegger den.
        </p>
        <p className="rounded-lg border border-amber-500/30 bg-background/60 px-3 py-2">
          Hvorfor er noe så tilsynelatende enkelt som en utgangskø så subtilt? Fordi det er nettopp{" "}
          <em>her</em> at oppførselen til potensielt tusenvis av aktive avsendere over hele verden
          konvergerer, når strømmene deres alle skal gjennom den samme lenken. Globalt samspill,
          synlig på ett enkelt sted dypt inne i nettet.
        </p>

        <LectureBeat>Fire køordninger</LectureBeat>
        <p>
          <strong>FIFO</strong> — sendes i den rekkefølgen de kom. Det vi mennesker gjør mest.{" "}
          <strong>Prioritetskø</strong> — pakker klassifiseres ved ankomst, og den høyeste
          ikke-tomme klassen betjenes først (innen klassen: FIFO). Du kjenner det fra flyselskapenes
          bonusklasser, gjerne fra feil side av skranken.{" "}
          <strong>Round robin</strong> — ingen streng prioritet, men bytt på: én fra klasse 1, én fra
          klasse 2, én fra klasse 3, og videre rundt.
        </p>
        <p>
          <strong>Weighted fair queuing (WFQ)</strong> er den generaliserte varianten som faktisk er
          utbredt i rutere. Den går rundt som round robin, men hver klasse i har en{" "}
          <strong>vekt w<sub>i</sub></strong>, og i ethvert intervall der klassen har pakker å
          sende, er den garantert andelen w<sub>i</sub> av kapasiteten — altså en garantert minimum
          båndbredde w<sub>i</sub>·R. Det er slik man gir båndbreddegarantier per trafikklasse.
        </p>
        <p>
          Ved full buffer må man også velge <em>hva</em> som skal kastes:{" "}
          <strong>tail drop</strong> (dropp den nyankomne) eller å kaste en allerede køet pakke med
          lavere prioritet for å gi plass — for eksempel å ofre sluttbrukertrafikk framfor
          nettverksadministrasjonstrafikk. Alternativt kan pakken <em>merkes</em> med en
          metningsindikasjon i stedet for å kastes; det er nettopp her ECN-bitene i IP-headeren
          settes.
        </p>

        <LectureBeat>Og så det politiske</LectureBeat>
        <p>
          Hvem bestemmer hva som havner i hvilken prioritetsklasse? Det gjør{" "}
          <strong>nettverksoperatøren</strong>. Klassifiseringen kan skje på trafikktype (portnumre
          avslører hva datagrammet bærer), eller på kilde- og måladresse. Og da er vi framme ved
          spørsmålet: skal et selskap kunne <em>betale</em> for at pakkene deres får bedre
          behandling? Mekanismene finnes — vi har akkurat sett dem.
        </p>
        <p>
          Det er dette <strong>nettnøytralitet</strong> handler om: lovene og reglene for hvordan en
          ISP får lov til å bruke disse mekanismene. Det berører ytringsfrihet (kan en ISP nekte å
          frakte bestemte typer nyheter eller meninger?), innovasjon og konkurranse (må små og store
          behandles likt?). USAs regulering fra 2015 satte tre klare grenser, og de er lærerike
          uansett jurisdiksjon:
        </p>
        <p>
          <strong>Ingen blokkering</strong> av lovlig innhold, applikasjoner, tjenester eller
          uskadelige enheter — med forbehold om <em>rimelig nettverksdrift</em>. Det forbeholdet er
          reelt: skal nettet reddes når det er nedkjørt, må driftstrafikk fram. Hva som er «rimelig»
          er selvsagt åpent for tolkning. En kjent sak gjaldt en ISP som blokkerte kundenes bruk av
          en IP-telefonitjeneste som konkurrerte med ISP-ens egen telefoni.
        </p>
        <p>
          <strong>Ingen struping</strong> — ikke forringe lovlig trafikk basert på innhold,
          applikasjon eller tjeneste. En sak her gjaldt en ISP som forstyrret fildelingstrafikk ved
          selv å lage og sende TCP reset-pakker til klientene, slik at applikasjonens forbindelser
          ble revet ned nedenfra.
        </p>
        <p>
          <strong>Ingen betalt prioritering</strong> — én strømmetjeneste skal ikke kunne betale for
          at pakkene sine får bedre behandling enn en annens. Argumentet er at etablerte aktører med
          dype lommer ellers reiser en høy terskel for nye konkurrenter. Motargumentet er at
          inntektene ville gjort ISP-markedet mer attraktivt og utløst mer investering i
          infrastruktur.
        </p>
        <p>
          Og under det hele ligger et definisjonsspørsmål med hundre år gamle røtter: er en ISP en{" "}
          <em>telekomtilbyder</em> (strengt regulert) eller en <em>informasjonstjenestetilbyder</em>{" "}
          (langt mindre regulert)? Reguleringen er skrevet om flere ganger siden 2015, og situasjonen
          er fortsatt i bevegelse. Det er tankevekkende: vi har hatt teknisk mulighet til
          prioritering siden internettet ble offentlig for tretti år siden, men de sosiale, politiske
          og økonomiske reglene rundt oppfinnelsen er ennå ikke ferdig skrevet.
        </p>
      </LectureNote>


      <VisualDefs
        items={[
          {
            term: "Input-port",
            icon: <InputPortIcon />,
            body: (
              <>
                Tre lag av jobb: fysisk mottak (decoder bits fra mediet), lenke-lag
                (Ethernet-rammer → IP-pakker), og <em>match-action</em>: slå opp i FIB,
                stemple ut output-port, og slipp inn på fabric. Hver input-port har sin egen
                kopi av FIB — å sentralisere ville vært flaskehals.
              </>
            ),
          },
          {
            term: "Output-port",
            icon: <OutputPortIcon />,
            body: (
              <>
                Speilbilde av input. Tar pakker fra fabric, legger dem i en kø, kjører
                scheduler (FIFO, prioritert, round-robin, WFQ), gjør lenke-lag-utgang og
                fysisk-lag-utgang. Output-køen er hovedstedet pakker tapes ved kongesjon.
              </>
            ),
          },
          {
            term: "Switching fabric — minne",
            icon: <FabricMemoryIcon />,
            body: (
              <>
                Eldste modell. CPU kopierer pakken fra input-buffer til output-buffer over en
                delt minnebuss. Hastighet begrenset av minnebåndbredde — ofte for tregt for
                moderne rutere.
              </>
            ),
          },
          {
            term: "Switching fabric — buss",
            icon: <FabricBusIcon />,
            body: (
              <>
                En felles intern buss alle porter henger på. Bedre enn minne (ingen CPU), men
                bare én pakke kan krysse om gangen. Total ruter-throughput begrenset av
                buss-hastigheten.
              </>
            ),
          },
          {
            term: "Switching fabric — crossbar (interconnect)",
            icon: <FabricCrossbarIcon />,
            body: (
              <>
                Et 2D-koblingsnett der hver input-port har en uavhengig sti til hver
                output-port. Flere pakker kan krysse samtidig så lenge de skal til ulike
                output-porter. Brukes i moderne høyhastighets-rutere.
              </>
            ),
          },
          {
            term: "Head-of-line (HOL) blocking",
            icon: <HolBlockingIcon />,
            body: (
              <>
                Når input-kø er FIFO og pakken først i køen ikke får komme over fabric (fordi
                output-porten er opptatt), blokkeres alle pakkene bak — selv de som skulle
                til ledige output-porter. Løsning: Virtual Output Queues (VOQ), én kø per
                output i hver input.
              </>
            ),
          },
          {
            term: "Output-kø-pakketap",
            icon: <OutputLossIcon />,
            body: (
              <>
                Hvis fabric leverer pakker til en output-port raskere enn lenken kan sende
                dem ut, vokser køen. Når bufferen er full, mistes pakker. Dette er
                hoved-kilden til pakketap i internett.
              </>
            ),
          },
          {
            term: "Routing-prosessor",
            icon: <RoutingProcessorIcon />,
            body: (
              <>
                CPU-en som kjører routing-protokoller (OSPF, BGP), holder RIB, og oppdaterer
                FIB-en i hver input-port. Også ansvarlig for management (SNMP, NETCONF) og
                ICMP-respons.
              </>
            ),
          },
        ]}
      />

      <Hvorfor title="Hvorfor er input/output skilt fra fabric?">
        Skillet lar samme fabric brukes med ulike portkort. En 10-Gbit fiber-port og en
        1-Gbit Ethernet-port kobles til samme crossbar — fabric-en bryr seg ikke om hva som
        skjer på utsiden. Det gjør rutere modulære: man bytter linjekort uten å bytte
        backplane.
      </Hvorfor>

      <Fallgruve tittel="Pakketap skjer mest i output, ikke input">
        Det er fristende å tro at pakker tapes når mange pakker ankommer samtidig. I praksis
        tapes de oftest i output-køen, fordi fabric kan levere fra alle inputs samtidig til
        samme output. Kongesjon konsentreres der.
      </Fallgruve>
    </article>
  );
}

// ============================================================
// 4.3 — Internet Protocol (IPv4 + IPv6)
// ============================================================
function Section43() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="4.3" title="Internet Protocol — IPv4 og IPv6" />

      <p className="text-muted-foreground">
        IP-protokollen er det universelle språket nettverkslaget bruker. Den definerer
        pakke-formatet (header) og en best-effort leveringstjeneste — ingen garantier, ingen
        ordens-bevaring. Alt over (TCP) og under (lenke-lag) snakker IP, og det er det som
        gjør internett internett.
      </p>

      <Section43Live />

      <LectureNote title="IPv4: hvor adressen kommer fra, og hvorfor det henger sammen med ruting">
        <p>
          Først en avgrensning: IP-protokollen handler <em>ikke</em> om rutingalgoritmer eller
          SDN-kontrollere — det er kontrollplan. IP handler om tre ting:{" "}
          <strong>datagramformatet</strong>, <strong>hvordan adresser er bygget opp og tolkes</strong>,
          og <strong>konvensjoner for pakkehåndtering</strong>.
        </p>
        <p>
          Et par header-felt er verdt å stoppe ved.{" "}
          <strong>Headerlengden</strong> trengs fordi IPv4 kan bære et variabelt antall opsjoner, så
          mottakeren må få vite hvor nyttelasten begynner (uten opsjoner: 20 byte).{" "}
          <strong>Datagramlengden</strong> er 16 bits, så teoretisk maks er 64 kB — men i praksis
          holder man seg rundt 1500 byte, slik at datagrammet passer pent inni en maksimal
          Ethernet-ramme. <strong>TTL</strong> telles ned ett hakk per ruter og sikrer at pakker ikke
          sirkler i evig tid ved rutingsløyfer. Og <strong>header-sjekksummen</strong> må regnes ut
          på nytt i <em>hver</em> ruter, fordi TTL-en nettopp endret seg — det er tidkrevende, og er
          trolig grunnen til at feltet ble fjernet helt i IPv6.
        </p>

        <LectureBeat>En adresse identifiserer et grensesnitt</LectureBeat>
        <p>
          Det mest oversette punktet i hele adresseringen: en IP-adresse identifiserer{" "}
          <strong>ikke en maskin</strong>, den identifiserer et <strong>grensesnitt</strong>. Rutere
          har nesten alltid flere; en laptop har gjerne både kablet Ethernet og trådløst, hver med sin
          egen adresse.
        </p>
        <p>
          Et <strong>subnett</strong> er den delen av nettet der grensesnitt når hverandre{" "}
          <em>uten</em> å gå gjennom en ruter. Og det knytter seg direkte til adressen: en IP-adresse
          har en <strong>subnett-del</strong> og en <strong>vert-del</strong>, og grensesnitt på samme
          subnett må ha samme subnett-del. Vil du finne subnettene i en tegning, er trikset å{" "}
          <em>klippe hvert grensesnitt løs</em> fra verten eller ruteren sin — det som blir igjen som
          isolerte øyer, er subnettene. <strong>CIDR</strong>-notasjonen{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">a.b.c.d/x</code> sier at x
          er antall bits i subnett-delen.
        </p>

        <LectureBeat>Hvordan en vert får adresse: DHCP</LectureBeat>
        <p>
          Før i tiden skrev en systemansvarlig adressen manuelt inn i en fil på maskinen. Med
          milliarder av verter, over halvparten mobile, som kobler seg til og fra igjen og igjen, er
          det utenkelig. Derfor <strong>DHCP</strong> — plug and play.
        </p>
        <p>
          Fire meldinger. <strong>Discover</strong>: den nyankomne klienten kringkaster «finnes det
          en DHCP-server her ute?» — merk at dette er <em>tjeneste-oppdagelse</em>; kilde-IP er 0
          fordi klienten ikke har noen ennå, og målet er kringkastingsadressen. DHCP kjører over UDP,
          klienten på port 68, serveren lytter på port 67. <strong>Offer</strong>: en (eller flere)
          server svarer med en adresse klienten kan bruke og hvor lenge den gjelder.{" "}
          <strong>Request</strong>: klienten ber formelt om adressen — den kan også være en adresse
          den allerede har og bare vil fornye. <strong>Ack</strong>: serveren bekrefter.{" "}
          <strong>Transaksjons-ID-feltet</strong> er det som knytter svar til spørsmål.
        </p>
        <p>
          Og en vert trenger mer enn adressen for å fungere: den må vite{" "}
          <strong>IP-adressen til første-hop-ruteren</strong> (alt utgående skal dit), gjerne en{" "}
          <strong>DNS-server</strong>, og <strong>nettmasken</strong>. Alt dette kan følge med i
          DHCP-meldingene, og gjør det som regel.
        </p>

        <LectureBeat>Hvordan et nett får et adresseområde — og aggregering</LectureBeat>
        <p>
          Et kundenett får som regel et område ut av ISP-ens eget område. Har ISP-en en /20, kan den
          dele den i åtte /23-er og gi én til hver kunde. Og her kommer det virkelig fine:
          ISP-en trenger bare å <strong>annonsere ett eneste prefiks</strong> — sin /20 — ut til
          resten av verden. Det holder for at hele internettet skal kunne rute til alle adressene
          bak den. Dette kalles <strong>adresseaggregering</strong>.
        </p>
        <p className="rounded-lg border border-amber-500/30 bg-background/60 px-3 py-2">
          Så det virkelig lærerike tilfellet. En kunde bytter ISP, men vil{" "}
          <em>beholde adresseområdet sitt</em>. Den gamle ISP-en annonserer fortsatt sin /20, som
          fortsatt inneholder kundens adresser. Den nye ISP-en annonserer i tillegg kundens{" "}
          <strong>/23</strong>. Hvordan går det bra? Fordi /23 er et{" "}
          <strong>lengre prefiks</strong> enn /20 — og ruterne bruker longest prefix match. Pakkene
          til kunden går til den nye ISP-en. Der klikker adressetildeling,
          forwarding-tabelloppslag og BGP-annonsering sammen til én mekanisme.
        </p>
        <p>
          Og helt øverst: adresserommet eies og fordeles av <strong>ICANN</strong>, som deler ut til
          fem regionale registre, som deler videre til ISP-ene. I 2011 delte ICANN ut sin{" "}
          <em>siste</em> ledige blokk med 32-bits adresserom.
        </p>
        <p>
          Hvorfor ble det bare 32 bits? Regnestykket fra 1970-tallet er nesten rørende i sin
          beskjedenhet: dette skulle bli et forsvarsprosjekt som måtte virke overalt, kanskje to nett
          per land, kanskje 128 land (fordi det er en toerpotens) — 256 nett, altså 8 bits. Og
          maskiner per nett? Dette var digre klimaanleggskjølte tidsdelte maskiner; sett 16 millioner,
          altså 24 bits. Til sammen 32 bits og 4,3 milliarder endepunkter — flere enn det fantes
          mennesker på jorda. Mer enn nok for et eksperiment.
        </p>
      </LectureNote>

      <LectureNote title="NAT og IPv6 — og tunnelering">
        <p>
          <strong>NAT</strong> er enkelt i idé: alle enheter i et lokalnett får adresser fra et av de
          reserverte <em>private</em> adresseområdene, og all trafikk <em>ut</em> av nettet bruker
          én og samme offentlige adresse. NAT-ruteren gjør tre ting: den bytter ut kilde-IP og
          kildeport på hvert utgående datagram, den <strong>husker oversettelsen</strong> i en
          NAT-tabell, og den gjør den omvendte utbyttingen på hvert innkommende datagram ved å slå
          opp måladresse og målport i tabellen.
        </p>
        <p>
          Det viktige er at NAT er <strong>usynlig for begge sider</strong>. Fjernverten ser bare et
          datagram med en adresse og en port, og svarer dit, som vanlig. Fordelene er reelle: du
          sparer adresser, du kan endre adressene inne i nettet uten å varsle noen, du kan bytte ISP
          uten å omadressere, og enhetene innenfor er ikke direkte synlige utenfra.
        </p>
        <p>
          NAT var i starten <em>kontroversielt</em> — her har vi en nettlagsenhet som roter med
          portnumre, som strengt tatt er endesystemenes sak. En purist ville sagt: vil du løse
          adressemangelen, gjør det med IPv6, det var jo derfor IPv6 ble laget. Og det skaper reelle
          problemer, som når en ekstern vert vil ta kontakt <em>inn</em> gjennom en NAT-boks — kjent
          som NAT-traversering, og det er ærlig talt et ganske stygt hack. Men operatørene har stemt
          med føttene: NAT er utbredt og blir værende.
        </p>

        <LectureBeat>IPv6 — mer enn bare flere bits</LectureBeat>
        <p>
          Adresserommet var hovedmotivasjonen, men ikke den eneste. IP-headere må behandles på
          nanosekunder — noe som ikke var sant i 1981, men har vært det lenge. IPv6 gjør
          videresendingen raskere ved å fjerne det som gjorde IPv4-behandlingen tung:{" "}
          <strong>ingen sjekksum</strong> (slipper omregning i hver ruter),{" "}
          <strong>ingen fragmentering og reassemblering</strong> underveis (det gjøres i endepunktene),
          og <strong>ingen opsjonsfelt</strong> i selve headeren — så headeren får{" "}
          <strong>fast lengde</strong>.
        </p>
        <p>
          I tillegg: fram til 90-tallet var datagrammet <em>den</em> abstraksjonen. Siden har
          begrepet <strong>strøm</strong> — en forbindelse mellom endepunkter — blitt stadig
          viktigere, og ønsket om å gi tjenester per strøm framfor per datagram med det. IPv6 løfter
          dette til førsteklasses borger med et <strong>flow label</strong>-felt. Merk nyansen: IPv6
          sier <em>ingenting</em> om hva en strøm er eller hvordan feltet skal brukes. Det er politikk,
          og overlatt til operatøren. IPv6 gir mekanisme, ikke policy.
        </p>

        <LectureBeat>Tunnelering: et datagram inni et datagram</LectureBeat>
        <p>
          Hvordan går man fra et IPv4-nett til et IPv6-nett? En «flaggdag» der alle i verden skrur av
          det ene og på det andre samtidig er utenkelig. De to må{" "}
          <strong>sameksistere</strong> mens utstyr byttes ut gradvis — litt som å skifte motor på et
          fly som er i lufta.
        </p>
        <p>
          Teknikken heter <strong>tunnelering</strong>, og nøkkelen er å tenke tilbake på innkapsling
          fra kapittel 1. To IPv6-rutere koblet med Ethernet legger IPv6-datagrammet som{" "}
          <em>nyttelast</em> i en Ethernet-ramme. Helt uproblematisk. Er de i stedet koblet sammen{" "}
          <em>gjennom et IPv4-nett</em>, gjør de nøyaktig det samme — de legger IPv6-datagrammet som
          nyttelast i et <strong>IPv4-datagram</strong> adressert til hverandre.
        </p>
        <p>
          Følg adressene, det er der forståelsen sitter. Det ytre IPv4-datagrammet har{" "}
          <em>tunnelendepunktene</em> som kilde og mål. Inni ligger det opprinnelige
          IPv6-datagrammet med den <em>egentlige</em> avsenderen og mottakeren. Inne i IPv4-nettet er
          dette bare enda et helt vanlig IPv4-datagram. Når det når tunnelens ende, ser ruteren at den
          selv er mottakeren, pakker opp, finner et IPv6-datagram, slår opp den <em>ytre</em>{" "}
          IPv6-destinasjonen og sender videre.
        </p>
        <p>
          Sett slik fungerer IPv4-nettet nesten som en lenkelagsteknologi som direkte forbinder to
          IPv6-rutere. Tunnelering er et generelt begrep som dukker opp igjen — blant annet i
          mobilnett for å støtte mobilitet — så det er verdt å bruke litt tid på.
        </p>
        <p>
          Og statusen? Rundt 25 år etter standardiseringen kommer omtrent 30 % av trafikken til de
          store tjenestene over IPv6. Det er framgang, men IPv4 dominerer fortsatt. NAT tok mye av
          presset bort. Kontrasten er tankevekkende: på samme 25 år fikk vi weben, sosiale medier,
          strømming, spill og videomøter. Det sier alt om hvor lett det er å innovere{" "}
          <em>i kanten</em>, og hvor tungt det er å bytte ut rørene i midten.
        </p>
      </LectureNote>


      <VisualDefs
        items={[
          {
            term: "IPv4-header (20–60 bytes)",
            icon: <Ipv4HeaderIcon />,
            body: (
              <>
                Felter du må kjenne: <code>Version</code> (4), <code>IHL</code> (header-lengde i
                32-bit-ord), <code>TOS/DSCP</code> (tjenesteklasse), <code>Total Length</code>{" "}
                (header + data), <code>Identification</code>, <code>Flags</code>,{" "}
                <code>Fragment Offset</code> (for fragmentering), <code>TTL</code> (dekrementeres
                av hver ruter, dropper ved 0), <code>Protocol</code> (TCP=6, UDP=17, ICMP=1),{" "}
                <code>Header Checksum</code>, <code>Source IP</code>, <code>Destination IP</code>,
                og eventuelle <code>Options</code>.
              </>
            ),
          },
          {
            term: "TTL (Time To Live)",
            icon: <TtlIcon />,
            body: (
              <>
                Hver ruter på stien dekrementerer TTL med 1. Når TTL = 0 dropper ruteren pakken
                og sender ICMP «Time Exceeded» tilbake til avsenderen. Det er denne mekanismen{" "}
                <code>traceroute</code> utnytter: send pakker med TTL=1, 2, 3, … og se hvem som
                klager.
              </>
            ),
          },
          {
            term: "MTU (Maximum Transmission Unit)",
            icon: <MtuIcon />,
            body: (
              <>
                Største pakke en lenke kan transportere uten splitting. Ethernet: 1500 bytes;
                noen WAN-lenker: 576 bytes; gigabit med jumbo: opp til 9000 bytes.
              </>
            ),
          },
          {
            term: "Fragmentering (IPv4)",
            icon: <FragmentationIcon />,
            body: (
              <>
                Hvis en pakke er større enn neste lenkes MTU, deler ruteren den i fragmenter.
                Hvert fragment får samme <code>Identification</code>, ny{" "}
                <code>Fragment Offset</code>, og <code>More Fragments</code>-flag satt på alle
                unntatt det siste. Reassembly skjer kun hos mottaker — aldri på mellom-rutere.
              </>
            ),
          },
          {
            term: "Path MTU Discovery",
            icon: <PathMtuIcon />,
            body: (
              <>
                Sender setter <code>Don&apos;t Fragment</code>-flag og lar rutere som ikke kan
                videresende returnere ICMP «Fragmentation Needed» med deres MTU. Sender lærer
                seg minste MTU på stien og sender pakker som passer.
              </>
            ),
          },
          {
            term: "IPv6-header (fast 40 bytes)",
            icon: <Ipv6HeaderIcon />,
            body: (
              <>
                Mye enklere enn IPv4: <code>Version</code> (6), <code>Traffic Class</code>,{" "}
                <code>Flow Label</code>, <code>Payload Length</code>, <code>Next Header</code>{" "}
                (erstatter Protocol; støtter extension headers), <code>Hop Limit</code> (samme
                som TTL), 128-bit <code>Source</code> og <code>Destination</code>. Ingen
                checksum (lenke-lag og TCP/UDP håndterer det).
              </>
            ),
          },
          {
            term: "IPv6 vs IPv4 — hva er borte",
            icon: <Ipv6VsIpv4Icon />,
            body: (
              <>
                IPv6 fjerner header-checksum (raskere forwarding), fjerner fragmentering på
                mellom-rutere (kun ende-til-ende — ruteren returnerer ICMPv6 «Packet Too Big»),
                og fjerner Options-feltet (extension headers i stedet).
              </>
            ),
          },
          {
            term: "Adressering: 32 bits → 128 bits",
            icon: <AddressRulerIcon />,
            body: (
              <>
                IPv4: ~4,3 milliarder unike adresser. IPv6: 2^128 ≈ 3,4×10^38. Skrives som åtte
                grupper av fire hex-sifre, separert med kolon:{" "}
                <code>2001:0db8:85a3::8a2e:0370:7334</code>. Dobbel kolon = sammentrekning av
                fortløpende nuller.
              </>
            ),
          },
          {
            term: "Overgang: dual-stack og tunnelering",
            icon: <DualStackIcon />,
            body: (
              <>
                <em>Dual-stack:</em> hosts og rutere kjører både IPv4 og IPv6 samtidig.{" "}
                <em>Tunnelering:</em> IPv6-pakker pakkes inn i IPv4-pakker for å krysse
                IPv4-øyer (6in4, 6to4, Teredo).
              </>
            ),
          },
        ]}
      />

      <Hvorfor title="Hvorfor 128 bits, ikke bare 64?">
        Med 64 bits ville vi fortsatt fått adresse-knapphet i et hierarkisk system. 128 bits
        lar oss kaste bort de første 64 til ren ruting (prefix) og bruke de siste 64 til
        host-ID — fortsatt med rom for å gi alle apparater på jorda mange tusen adresser hver.
      </Hvorfor>

      <Fallgruve tittel="Mellom-rutere fragmenterer IKKE i IPv6">
        Dette er en eksamen-yndling. I IPv4 kan en ruter fragmentere. I IPv6 må senderen
        gjøre Path MTU Discovery; en ruter som ikke kan videresende sender ICMPv6 «Packet Too
        Big» og dropper. Hensikten er å spare ruter-CPU.
      </Fallgruve>
    </article>
  );
}

// ============================================================
// 4.4 — Generalisert forwarding (SDN, OpenFlow, match-action)
// ============================================================
function Section44() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="4.4" title="Generalisert forwarding — SDN, OpenFlow, match-action" />

      <p className="text-muted-foreground">
        Tradisjonelt har en ruter sett pakken på destinasjons-IP-en og slått opp i en
        prefix-tabell. Generalisert forwarding generaliserer dette: «matche på hva som helst i
        pakke-headerne, og gjør hva som helst med pakken». Det åpner døren for SDN.
      </p>

      <Section44Live />

      <VisualDefs
        items={[
          {
            term: "SDN (Software-Defined Networking)",
            icon: <SdnIcon />,
            body: (
              <>
                Arkitektur som flytter control-planet ut av ruterne og inn i en sentral
                kontroller (programvare). Ruterne (nå mer som dumme switcher) blir kun
                data-plane: «her er reglene, følg dem». Kontrolleren kjenner hele topologien
                og kan programmere ruterne fritt.
              </>
            ),
          },
          {
            term: "OpenFlow",
            icon: <OpenFlowIcon />,
            body: (
              <>
                Det første store SDN-protokollen. Standardiserer hva en kontroller sier til en
                switch: «her er en flow table». OpenFlow versjon 1.0 hadde 12 match-felt
                (MAC, IP, TCP-port, VLAN, …); senere versjoner utvidet det.
              </>
            ),
          },
          {
            term: "Match-Action-tabell",
            icon: <MatchActionIcon />,
            body: (
              <>
                Den generaliserte forwarding-strukturen. Hver regel har et{" "}
                <strong>match</strong>-mønster (hvilke felt og verdier som må stemme), en{" "}
                <strong>action</strong> (forward til port, drop, modifiser felt, send til
                kontroller), og en <strong>prioritet</strong> (ved flere treff vinner høyest).
              </>
            ),
          },
          {
            term: "Flow",
            icon: <FlowIcon />,
            body: (
              <>
                En sekvens av pakker som matcher samme regel. En flow defineres ikke av
                pakkene selv, men av regelens match-mønster — kan være «alle TCP-pakker fra
                10.0.0.5 til port 80» eller «alt fra VLAN 7».
              </>
            ),
          },
          {
            term: "Actions",
            icon: <ActionsIcon />,
            body: (
              <>
                Typiske handlinger: <code>forward(port)</code>, <code>drop</code>,{" "}
                <code>flood</code>, <code>send-to-controller</code>,{" "}
                <code>rewrite(field)</code> (f.eks. endre destinasjons-IP — det er det NAT
                gjør!), <code>push/pop tag</code> (VLAN, MPLS).
              </>
            ),
          },
          {
            term: "Pipeline (flere tabeller)",
            icon: <PipelineIcon />,
            body: (
              <>
                Moderne OpenFlow har flere tabeller i serie: pakken matches mot tabell 0,
                handlingen kan inkludere «gå til tabell 2», osv. Lar deg dekomponere logikk:
                én tabell for ACL, én for routing, én for VLAN-merking.
              </>
            ),
          },
          {
            term: "Northbound API",
            icon: <NorthboundIcon />,
            body: (
              <>
                Grensesnittet mellom SDN-kontrolleren og apper som programmerer den. Lar
                nettverks-policies skrives som programmer: «alle ansatte i HR har tilgang til
                fil-server X, ingen andre». Apper trenger ikke kjenne switch-detaljer.
              </>
            ),
          },
          {
            term: "Southbound API",
            icon: <SouthboundIcon />,
            body: (
              <>
                Grensesnittet mellom kontroller og switcher. OpenFlow er den mest kjente, men
                også NETCONF, P4Runtime, OF-CONFIG.
              </>
            ),
          },
        ]}
      />

      <Metafor tittel="Fra dumme telefoner til smarttelefoner">
        Gamle rutere er som dumme-telefoner: hver enhet har all funksjonalitet innebygd, og
        for å endre noe må du bytte hardware. SDN er som smarttelefoner: en sentral app-butikk
        (kontrolleren) skyver ned program (flow-tabeller). Selve enheten gjør bare det den
        får beskjed om.
      </Metafor>

      <Hvorfor title="Hvorfor matter SDN?">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Datasentre:</strong> Google, Facebook, Microsoft kjører egen SDN på sine
            datasenter-fabric for å rute trafikk optimalt mellom millioner av servere.
          </li>
          <li>
            <strong>Sikkerhetspolicies:</strong> en sentral policy kan håndheves konsistent
            på hver switch — uten å stole på at hver lokal admin oppdaterer ACL-er manuelt.
          </li>
          <li>
            <strong>Innovasjon:</strong> nye nettverks-features krever ikke nye standarder
            eller ny hardware — bare ny kontroller-software.
          </li>
        </ul>
      </Hvorfor>

      <Fallgruve tittel="‘SDN’ betyr ikke automatisk OpenFlow">
        OpenFlow er én konkret realisering. Mange «SDN»-deployments bruker P4, eBPF, eller
        proprietære APIer. Det viktige er prinsippet: control- og data-plane skilles, og
        control-planet sentraliseres logisk.
      </Fallgruve>
    </article>
  );
}

// ============================================================
// 4.5 — Middlebokser
// ============================================================
function Section45() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="4.5" title="Middlebokser — NAT, brannmurer, load-balancere" />

      <p className="text-muted-foreground">
        En <em>middlebox</em> er enhver enhet på pakkens sti som gjør noe annet enn ren
        forwarding. De bryter mot end-to-end-prinsippet («tjenester hører hjemme i endepunktene,
        ikke i nettverket»), men er overalt likevel — fordi de løser reelle problemer som
        ikke endepunktene kunne løse alene.
      </p>

      <Section45Live />

      <LectureNote title="Middlebokser og timeglasset som la på seg">
        <p>
          En <strong>middleboks</strong> er, litt fritt etter definisjonen i RFC 3234, enhver
          mellomliggende boks som utfører funksjoner utover en IP-ruters vanlige standardfunksjoner,
          plassert på datastien mellom avsender- og mottakervert. To ting er flagget der:
          «vanlige standardfunksjoner» betyr i praksis destinasjonsbasert videresending, og «på
          datastien» betyr at dette er en dataplan-funksjon <em>inne i nettet</em>, ikke i en
          endevert.
        </p>
        <p>
          Vi har allerede sett NAT og brannmurer bygget på match+action. Legg til{" "}
          <strong>lastbalansere</strong> — som fordeler forespørsler over speilkopier av en server, og
          som kalles lag-7-svitsjer fordi de faktisk leser applikasjonslagets headere —{" "}
          <strong>webcacher</strong> (der det også er lagring og prosessering inne i bildet), og i
          videste forstand <strong>innholdsdistribusjonsnett</strong>.
        </p>
        <p>
          Utviklingen er verdt å merke seg: for ti år siden kjøpte man middlebokser som proprietær,
          lukket maskinvare, akkurat som man kjøpte rutere. Nå går det mot{" "}
          <strong>white box</strong>-maskinvare som eieren selv kan spesialisere via et API — og
          funksjonaliteten ligger i programvaren oppå. Programvaren spiser verden, også her.
          Bevegelsen har fått navnet <strong>NFV</strong>, network functions virtualization: samme
          idé som SDN — skille kontroll fra data, generisk maskinvare spesialisert av programvare —
          men utvidet til tjenester i nettet som trenger både beregning og lagring, ikke bare
          videresending.
        </p>

        <LectureBeat>Timeglasset</LectureBeat>
        <p>
          Tegn protokollstakken som et <strong>timeglass</strong> i stedet for et rektangel, så ser
          du poenget: mange protokoller i fysisk, lenke-, transport- og applikasjonslaget — men{" "}
          <strong>én eneste nettverkslagsprotokoll</strong>. IP er det ene som absolutt må finnes i
          hver eneste av milliardene av tilkoblede enheter.
        </p>
        <p>
          Den tynne midjen skjuler at nett med helt ulike lenketeknologier — Ethernet, WiFi, mobil,
          optikk — alle er del av det samme internettet. IP skjuler heterogeniteten nedover, og
          tilbyr oppover et enkelt underlag som applikasjonstjenester kan bygges på.
        </p>
        <p>
          Timeglasset er nå rundt 40 år gammelt, altså middelaldrende i menneskeår — og som kjent har
          slanke midjer en tendens til å gå seg litt ut i den alderen. Det er nettopp det som skjer:
          NAT-bokser, brannmurer, cacher, lastbalanserere og NFV gjør ting langt hinsides enkel
          destinasjonsbasert videresending.
        </p>

        <LectureBeat>Hva var egentlig arkitekturprinsippene?</LectureBeat>
        <p>
          RFC 1958 er ærlig på dette: mange i internett-miljøet ville hevdet at det ikke{" "}
          <em>finnes</em> en arkitektur, bare en tradisjon som ikke ble skrevet ned de første 25
          årene. Men i grove trekk mente miljøet at målet er{" "}
          <strong>tilkobling</strong>, verktøyet er <strong>IP-protokollen</strong>, og
          intelligensen ligger <strong>ende-til-ende</strong> heller enn skjult i nettet.
        </p>
        <p>
          Det siste punktet er <strong>ende-til-ende-prinsippet</strong>. Det svarer på spørsmålet om
          <em>hvor</em> funksjonalitet som pålitelig overføring og metningskontroll bør ligge. Det{" "}
          <em>kunne</em> ligget hopp for hopp i hver ruter — og i spesialtilfeller gjør det det. Men
          det finnes feilscenarier som bare kan håndteres i endepunktene, og argumentet er: når en
          funksjon uansett bare kan implementeres fullstendig og korrekt med kunnskap som finnes hos
          applikasjonen i endepunktene, hører den hjemme <em>der</em> — ikke inne i nettet.
        </p>
        <p>
          Sammenlign med telefonnettet. Det hadde dumme endepunkter — dreieskiver, ikke datamaskiner
          — og derfor <em>måtte</em> all intelligens ligge i de programmerbare sentralene inne i
          nettet. Da internettet kom, var både endepunktene og svitsjene programmerbare
          datamaskiner, og valget falt på å legge intelligensen i kanten. Det gikk an fordi
          endeenhetene var smarte.
        </p>
        <p>
          Men bildet har endret seg igjen. Med middlebokser og SDN er det nå programvare-intelligens
          oppå enkle white box-er <em>inne</em> i nettet, og med datasentre og CDN-er er det koblet
          på svært tunge, sofistikerte «endepunkter» på steder midt inne i nettet. Hjernen sitter
          ikke lenger bare i kanten.
        </p>
      </LectureNote>


      <VisualDefs
        items={[
          {
            term: "NAT (Network Address Translation)",
            icon: <NatIcon />,
            body: (
              <>
                Lar mange private IP-adresser (typisk 10.0.0.0/8 eller 192.168.0.0/16) dele én
                offentlig IP utad. NAT-boksen oversetter pakker i begge retninger ved å holde
                en oversettelsestabell over <code>(privat-IP, privat-port) ↔ (offentlig-IP,
                offentlig-port)</code>.
              </>
            ),
          },
          {
            term: "NAT-traversal — hva som ikke fungerer",
            icon: <NatTraversalIcon />,
            body: (
              <>
                Pakker som ankommer NAT-boksen utenfra uten en eksisterende oversetting blir
                droppet. Det betyr P2P, VoIP, og innkommende tilkoblinger er vanskelig. STUN,
                TURN, ICE og hole punching er teknikker for å komme rundt det.
              </>
            ),
          },
          {
            term: "NAT-typer",
            icon: <NatTypesIcon />,
            body: (
              <>
                <em>Full cone:</em> én ekstern endepunkt kan kontakte intern host via mappingen.
                <em> Restricted cone:</em> kun ekstern host som intern host har snakket med.
                <em> Symmetric NAT:</em> mappingen avhenger av ekstern destinasjon — vanskeligst
                å traversere.
              </>
            ),
          },
          {
            term: "Stateful brannmur",
            icon: <StatefulFirewallIcon />,
            body: (
              <>
                Holder oversikt over åpne tilkoblinger og slipper kun gjennom pakker som
                tilhører en sesjon som er initiert innenfra (eller eksplisitt åpnet). En SYN
                fra utsiden uten match → drop. Forskjellig fra stateless pakkefilter som kun
                ser på en pakke om gangen.
              </>
            ),
          },
          {
            term: "ACL (Access Control List)",
            icon: <AclIcon />,
            body: (
              <>
                Liste av regler som matcher på pakke-felt og enten tillater eller blokkerer.
                Brukes både i brannmurer og i mange ruter-konfigurasjoner.
              </>
            ),
          },
          {
            term: "Load-balancer",
            icon: <LoadBalancerIcon />,
            body: (
              <>
                Mottar trafikk på én virtuell IP, distribuerer den på mange back-end-servere.
                L4-LB jobber på TCP-nivå (kjenner kun (IP, port)). L7-LB jobber på HTTP-nivå
                (kan rute basert på URL, cookies, headers).
              </>
            ),
          },
          {
            term: "DPI (Deep Packet Inspection)",
            icon: <DpiIcon />,
            body: (
              <>
                Middleboks som leser pakke-innholdet, ikke bare headerne. Brukes til
                klassifisering, deteksjon, sensur. Brytes ned hvis trafikken er ende-til-ende
                kryptert (HTTPS, QUIC).
              </>
            ),
          },
          {
            term: "Application-gateway / proxy",
            icon: <ProxyIcon />,
            body: (
              <>
                Bryter tilkoblingen i to: klient ↔ proxy, og proxy ↔ server. Brukes for
                caching (web), filtrering, eller protokoll-konvertering.
              </>
            ),
          },
        ]}
      />

      <Hvorfor title="Hvorfor lever middleboxes på tross av end-to-end-prinsippet?">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Adresse-knapphet:</strong> NAT lar oss leve med IPv4 mye lenger enn vi
            burde. Vi har gått fra «slå opp IPv6» til «den dagen alle bytter NAT-en sin».
          </li>
          <li>
            <strong>Sikkerhet:</strong> en sentral brannmur er enklere å administrere enn å
            stole på at hver host har riktig konfigurasjon.
          </li>
          <li>
            <strong>Ytelse og skala:</strong> en load-balancer foran tusen servere er den
            eneste måten å håndtere milliarder av forespørsler.
          </li>
        </ul>
      </Hvorfor>

      <Fallgruve tittel="NAT ‘er ikke en brannmur’">
        NAT blokkerer innkommende tilkoblinger som side-effekt, men det er ikke design-målet.
        Et NAT-konfigurert nett kan fortsatt bli kompromittert via outbound-initierte
        tilkoblinger (drive-by-downloads, exfiltrering). Bruk eksplisitt brannmur for
        sikkerhet, ikke NAT.
      </Fallgruve>
    </article>
  );
}

// ============================================================
// 4.6 — Oppgaver (placeholder)
// ============================================================
function Section46() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="4.6" title="Oppgaver" />
      <p className="text-muted-foreground">
        Oppgave-banken for kapittel 4 er under bygging. Inntil den er klar, øv på de
        eksisterende interaktive sidene under — de dekker de viktigste konseptene.
      </p>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <h3 className="text-sm font-semibold mb-2">Foreløpig: gå via de interaktive sidene</h3>
        <p className="text-muted-foreground text-xs mb-2">
          Bruk disse mens vi skriver fullstendige oppgaver:
        </p>
        <RelatedSlugs
          slugs={[
            "dte2507-inni-ruter",
            "dte2507-subnetting",
            "dte2507-nat",
            "dte2507-paket-dekoding",
            "dte2507-packet-scheduling",
          ]}
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold mb-2">Tema-forslag (kommer)</h3>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1 text-xs">
          <li>Longest Prefix Match — gitt en tabell og en destinasjons-IP, finn output-porten</li>
          <li>Fragmentering — gitt MTU og pakke-størrelse, regn ut hvor mange fragmenter</li>
          <li>Switching-fabric-throughput — analyse av HOL-blocking i input-køet ruter</li>
          <li>NAT-tabell — fylle ut oversettings-rader gitt pakke-sekvens</li>
          <li>OpenFlow-tabell — skrive flow-regler for en gitt policy</li>
        </ul>
      </div>
    </article>
  );
}

// ============================================================
// 4.7 — Eksamen-fokus (placeholder)
// ============================================================
function SectionEksamen() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="4.7" title="Eksamen-fokus" />

      <p className="text-muted-foreground">
        Eksamens-mappet sammendrag av kapittel 4 er under skriving. Det vil komme et kompakt
        kort med definisjoner, formler, tegninger og typiske spørsmål fra DTE-2507-eksamen.
      </p>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold mb-2">Foreløpig: hva eksamen pleier å spørre om</h3>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1 text-xs">
          <li>
            <strong>Forklare</strong> forskjellen mellom forwarding og routing — med eksempel
            på hva som skjer ved en lenke som faller ut.
          </li>
          <li>
            <strong>Tegne</strong> ruter-arkitekturen: input-port, switching-fabric,
            output-port, routing-prosessor. Hvor oppstår pakketap?
          </li>
          <li>
            <strong>Lese</strong> et IPv4-header: peke ut TTL, Total Length, Protocol,
            Source/Destination. Hvilket felt brukes til fragmentering?
          </li>
          <li>
            <strong>Regne</strong> longest prefix match: gitt tabell + IP, finn output-port.
          </li>
          <li>
            <strong>Beskrive</strong> hva NAT gjør, hvilke kompromisser det gir, og hvorfor
            P2P er vanskelig over NAT.
          </li>
          <li>
            <strong>Sammenligne</strong> IPv4 og IPv6: hva ble fjernet, hva ble lagt til,
            hvorfor.
          </li>
          <li>
            <strong>Forklare</strong> SDN-prinsippet og hva en match-action-tabell er.
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold mb-2">Beslektede interaktive sider</h3>
        <RelatedSlugs
          slugs={[
            "dte2507-inni-ruter",
            "dte2507-subnetting",
            "dte2507-nat",
            "dte2507-paket-dekoding",
            "dte2507-arp-detektiv",
            "dte2507-packet-scheduling",
          ]}
        />
      </div>
    </article>
  );
}

// ============================================================
// Felles UI-hjelpere
// ============================================================

function Header({ num, title }: { num: string; title: string }) {
  return (
    <div className="border-b border-border pb-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        Seksjon {num}
      </div>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}

function Defs({ items }: { items: { term: string; body: React.ReactNode }[] }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-foreground bg-muted/40 hover:bg-muted/60"
      >
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        Definisjoner og begreper
      </button>
      {open && (
        <dl className="divide-y divide-border">
          {items.map((it, i) => (
            <div key={i} className="px-4 py-2.5">
              <dt className="text-sm font-semibold text-foreground">{it.term}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{it.body}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function Metafor({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
      <h3 className="text-sm font-semibold mb-1.5 text-purple-700 dark:text-purple-300">
        Metafor — {tittel}
      </h3>
      <div className="text-sm text-muted-foreground space-y-2">{children}</div>
    </div>
  );
}

function Hvorfor({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
      <h3 className="text-sm font-semibold mb-1.5 text-blue-700 dark:text-blue-300">
        {title}
      </h3>
      <div className="text-sm text-muted-foreground space-y-1">{children}</div>
    </div>
  );
}

function Fallgruve({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
      <h3 className="text-sm font-semibold mb-1.5 text-destructive">
        Fallgruve — {tittel}
      </h3>
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

function RelatedSlugs({ slugs }: { slugs: string[] }) {
  return (
    <ul className="space-y-1 text-sm">
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
  );
}
