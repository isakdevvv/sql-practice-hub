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
import { VisualDefs } from "./VisualDefs";
import { BomstasjonViz } from "./BomstasjonViz";
import { AnslagPanel } from "@/components/lab/AnslagPanel";
import type { Anslag } from "@/lib/lab/anslag";
import { LectureNote, LectureBeat } from "./LectureNote";
import {
  HostIcon,
  ClientServerIcon,
  LinkCableIcon,
  PacketIcon,
  RouterIcon,
  SwitchIcon,
  ProtocolIcon,
  ApiSocketIcon,
  IspCloudIcon,
  IxpCrossroadIcon,
  TierPyramidIcon,
  RfcDocIcon,
  DistributedAppIcon,
  AccessHouseIcon,
  LastMileRulerIcon,
  FiberIcon,
  DslPhoneIcon,
  HfcCoaxIcon,
  WifiIcon,
  CoreRouterIcon,
  BackboneIcon,
  DataCenterIcon,
  PeeringIcon,
  TransitIcon,
  MultiHomingIcon,
  PopIcon,
  CircuitSwitchIcon,
  PacketSwitchIcon,
  FdmIcon,
  TdmIcon,
  StatMuxDiceIcon,
  StoreForwardIcon,
  CutThroughIcon,
  QueueIcon,
  BufferIcon,
  HandshakeIcon,
  VirtualCircuitIcon,
  BurstIcon,
  QosLaneIcon,
  ProcDelayIcon,
  QueueDelayIcon,
  TransDelayIcon,
  PropDelayIcon,
  SumSigmaIcon,
  TrafficIntensityIcon,
  ThroughputPipeIcon,
  BdpIcon,
  LossIcon,
  RttLoopIcon,
  JitterIcon,
  GoodputIcon,
  TracerouteIcon,
  AppLayerIcon,
  TransportLayerIcon,
  NetworkLayerIcon,
  LinkLayerIcon,
  PhysicalLayerIcon,
  EncapsulationIcon,
  HeaderPayloadIcon,
  PduIcon,
  ServiceModelIcon,
  HoriVertArrowsIcon,
  OsiSevenLayerIcon,
  SessionPresIcon,
  DemuxIcon,
  EndToEndIcon,
} from "./visualDefIcons";

type Tab = "intro" | "1.1" | "1.2" | "1.3" | "1.4" | "1.5" | "1.6" | "1.7" | "1.8";

const SECTIONS_1: SectionNavItem[] = [
  { id: "intro", label: "Start her" },
  { id: "1.1", label: "1.1 Hva er internett?" },
  { id: "1.2", label: "1.2 Edge & core" },
  { id: "1.3", label: "1.3 Pakker vs kretser" },
  { id: "1.4", label: "1.4 Forsinkelse" },
  { id: "1.5", label: "1.5 Lagene" },
  { id: "1.6", label: "1.6 Sikkerhet, historie & styring" },
  { id: "1.7", label: "1.7 Oppgaver" },
  { id: "1.8", label: "1.8 Eksamen-fokus" },
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
            <TabBtn
              active={tab === "1.6"}
              onClick={() => setTab("1.6")}
              title="Sikkerhet, historie & styring"
            >
              1.6
            </TabBtn>
            <TabBtn active={tab === "1.7"} onClick={() => setTab("1.7")} title="Oppgaver">
              Oppg.
            </TabBtn>
            <TabBtn active={tab === "1.8"} onClick={() => setTab("1.8")} title="Eksamen-fokus">
              Eksamen
            </TabBtn>
          </nav>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "1.1" && <Section11 />}
        {tab === "1.2" && <Section12 />}
        {tab === "1.3" && <Section13 />}
        {tab === "1.4" && <Section14 />}
        {tab === "1.5" && <Section15 />}
        {tab === "1.6" && <Section16Kontekst />}
        {tab === "1.7" && <Section16 />}
        {tab === "1.8" && <SectionEksamen />}

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
          <li>Sikkerhet, historie og styring — konteksten rundt teknikken</li>
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

      <div className="rounded-xl border border-brand/30 bg-brand/5 p-4">
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-brand">
          Internett er ikke det samme som weben
        </div>
        <p className="text-sm leading-relaxed text-foreground">
          De to ordene brukes om hverandre i dagligtale, men de er ikke samme lag.{" "}
          <strong>Internett</strong> er nettet selv: maskinene, lenkene og protokollene som får en
          pakke fram fra A til B. <strong>World Wide Web</strong> (WWW) er én av mange{" "}
          <em>tjenester</em> som kjører oppå det — sider knyttet sammen med lenker, hentet med
          HTTP over TCP.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Prøven på at de er forskjellige: e-post, DNS, videosamtaler, spill og{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">ssh</code> bruker
          internett uten å røre weben i det hele tatt. Weben kom dessuten to tiår etter nettet —
          ARPANET sendte sin første pakke i 1969, mens Tim Berners-Lee foreslo weben i 1989. Sier
          noen «internett er nede» når en nettside ikke laster, er det som regel weben eller DNS
          som svikter, ikke nettet.
        </p>
      </div>

      <Section11Live />

      <LectureNote title="To måter å svare på «hva er internett?»">
        <p>
          Spørsmålet har to helt legitime svar, og forelesningen tar begge. Det{" "}
          <strong>første er nuts-and-bolts-svaret</strong>: fortell meg hvilke deler tingen består
          av. Da starter man ytterst, der brukerne er, og jobber seg innover.
        </p>
        <p>
          Ytterst sitter milliarder av <strong>hosts</strong> (end-systemer) — maskiner som kjører
          nettverks-apper. Ikke bare PC-er, mobiler og servere: også spillkonsoller, kameraer,
          høyttalere, biler, sparkesykler, kjøleskap, treningsklokker og VR-briller. Poenget med
          den lange lista er at «alt som er digitalt har en verdi av å være koblet til», og at
          ting som før var rent analoge (en bysykkel, en strømmåler) får helt nye bruksområder når
          de får et digitalt fotavtrykk.
        </p>
        <p>
          Innenfor dem finner vi maskinene som gjør nettet til et <em>nett</em>:{" "}
          <strong>pakkesvitsjer</strong>, som videresender pakker mellom hverandre og ut til
          hostene. De kommer i to varianter — rutere og svitsjer — og de er koblet sammen av{" "}
          <strong>lenker</strong>. Alt dette er igjen samlet i nettverk som hver eies og driftes av
          én aktør: campusnettet på et universitet er et annet nettverk enn ryggradsnettet som
          kobler campus til omverdenen. Det er nettopp derfor uttrykket «internett er et{" "}
          <strong>nettverk av nettverk</strong>» gir mening.
        </p>
        <p>
          Det <strong>andre svaret er tjeneste-svaret</strong>: internett er en plattform
          applikasjoner kan bygges på. Plattformen tilbyr ett grensesnitt — send informasjon
          herfra til dit — og all den voldsomme kompleksiteten (at du snakker til fjernkontrollen
          og en film begynner å spille) ligger i applikasjonene i endepunktene, ikke i
          leveransetjenesten under. Dette kurset handler mest om leveransen; applikasjons-siden
          tar vi i kapittel 2.
        </p>

        <LectureBeat>Protokoller: start med de menneskelige</LectureBeat>
        <p>
          Den enkleste veien inn i «hva er en protokoll?» er å se at mennesker kjører protokoller
          hele tiden. Klokke-protokollen: du sier «unnskyld, vet du hva klokka er?», den andre ser
          på klokka og svarer. Én forespørsel, ett svar. Spørsmåls-protokollen i et klasserom:
          foreleseren spør «noen spørsmål?», studenten enten stirrer ned i notatene eller rekker
          opp hånda, foreleseren gir ordet, spørsmålet kommer, svaret kommer.
        </p>
        <p>
          Fellesnevneren er: <strong>bestemte meldinger sendes</strong>, og{" "}
          <strong>bestemte handlinger utføres når de mottas</strong>. Nettverksprotokoller er
          nøyaktig det samme, bare at det er maskiner, apper, rutere og lenker som utveksler
          meldingene. Legg merke til at klokke-protokollen har to faser — en kontaktfase («vil du
          snakke med meg?») og en forespørsel/svar-fase — helt som HTTP, der TCP-forbindelsen
          settes opp først og request/response kommer etterpå.
        </p>
        <p className="rounded-lg border border-amber-500/30 bg-background/60 px-3 py-2">
          <strong>Definisjonen som blir stående:</strong> en protokoll definerer{" "}
          <em>formatet på</em> og <em>rekkefølgen av</em> meldinger som sendes og mottas mellom
          nettverks-enheter, samt <em>hvilke handlinger</em> som utføres når en melding sendes
          eller mottas.
        </p>
        <p>
          Og siden protokoller er avtaler, må noen skrive dem ned. For internett er det{" "}
          <strong>IETF</strong> (Internet Engineering Task Force) som standardiserer, og
          standardene heter <strong>RFC</strong>-er (Request For Comments).
        </p>
      </LectureNote>


      <VisualDefs
        items={[
          {
            term: "Host (end-system)",
            icon: <HostIcon />,
            body: "Maskin som kjører apper — laptop, mobil, server, IoT.",
          },
          {
            term: "Klient og server",
            icon: <ClientServerIcon />,
            body: "Klient spør; server svarer. Samme maskin kan være begge.",
          },
          {
            term: "Lenke",
            icon: <LinkCableIcon />,
            body: "Det fysiske mediet: kobber, fiber, radio eller satellitt.",
          },
          {
            term: "Pakke (datagram/segment/ramme)",
            icon: <PacketIcon />,
            body: "Selvstendig data-enhet med adresse, lik konvolutt i posten.",
          },
          {
            term: "Ruter",
            icon: <RouterIcon />,
            body: "Maskin som leser destinasjon og sender pakker videre på rett lenke.",
          },
          {
            term: "Svitsj (link-svitsj)",
            icon: <SwitchIcon />,
            body: "Jobber kun på lokalnettet via MAC; ruter kobler nett sammen via IP.",
          },
          {
            term: "Protokoll",
            icon: <ProtocolIcon />,
            body: "Avtale om format og rekkefølge i samtalen mellom to maskiner.",
          },
          {
            term: "API (sockets)",
            icon: <ApiSocketIcon />,
            body: "Grensesnittet appen bruker for å gi data til nettet — typisk sockets.",
          },
          {
            term: "ISP",
            icon: <IspCloudIcon />,
            body: "Internet Service Provider — selskap som driver et nettverk og selger tilkobling (f.eks. Telenor).",
          },
          {
            term: "IXP",
            icon: <IxpCrossroadIcon />,
            body: "Internet Exchange Point — møteplass der ISP-er bytter trafikk direkte. Norge har NIX i Oslo.",
          },
          {
            term: "Tier 1, 2, 3",
            icon: <TierPyramidIcon />,
            body: "Rangering av ISP-er: globale (1), regionale (2), lokale aksess (3).",
          },
          {
            term: "IETF og RFC",
            icon: <RfcDocIcon />,
            body: "IETF lager protokoller; hver standard er et nummerert RFC-dokument.",
          },
          {
            term: "Distribuert app",
            icon: <DistributedAppIcon />,
            body: "Program som kjører delt på flere hosts og snakker over nettet.",
          },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Illustration caption="Ruter = boks som leser destinasjon i headeren og sender pakken videre på rett ut-lenke.">
          <RouterIconSvg />
        </Illustration>
        <Illustration caption="Protokoll = avtalt rekkefølge: begge sider må kunne stegene.">
          <ProtocolHandshakeSvg />
        </Illustration>
      </div>

      <Illustration caption="ISP-hierarki: tier-1-backbone på toppen, regionale ISP-er midt, aksess-nett nederst.">
        <IspHierarchySvg />
      </Illustration>

      <Metafor tittel="Internett som lag av norske veier">
        <p>
          Tenk på ISP-hierarkiet som det norske vegvesen-systemet. Sykkelveien hjem til deg er
          aksess-nettet. Den kommunale veien er hjemme-ISP-en din (Altibox lokalt). Riksveien er
          tier-2 (Telenor i Norden). Europavei E6 er tier-1-backbonen — den krysser landegrenser og
          binder kontinentet sammen.
        </p>
        <p>
          Ingen kjører fra inngangsdøren rett ut på E6. Du må alltid gjennom flere veiklasser i
          rekkefølge — og når trafikken flyter dårlig på én klasse, sprer det seg oppover og nedover
          i hele systemet.
        </p>
      </Metafor>

      <Metafor tittel="ISP-er som flyselskaps-allianser">
        <p>
          Når du flyr SAS fra Tromsø til Tokyo, sitter du sjelden i et SAS-fly hele veien. SAS har
          en partner-avtale med ANA: SAS tar deg til København, ANA tar deg videre. Ingen sentral
          myndighet har bestemt dette — det er kommersielle avtaler mellom uavhengige selskaper.
        </p>
        <p>
          Slik fungerer pakker på internett også. Pakken din byttes mellom ISP-er via
          peering-avtaler (gjensidig bytte) eller transit-avtaler (én betaler den andre). NIX i Oslo
          er som Gardermoen: et samlings-sted der mange aktører møtes for å utveksle passasjerer
          effektivt.
        </p>
      </Metafor>

      <Metafor tittel="Protokoll som dansetrinn">
        <p>
          En protokoll er som koreografien til en tango. Begge dansere må kunne den samme sekvensen
          — hvilket trinn kommer etter hvilket, og hva som er respons på hva. Hvis den ene plutselig
          danser samba, kollapser hele samtalen.
        </p>
        <p>
          Når nettleseren din «danser» med vg.no, har de avtalt på forhånd: først DNS-spørring, så
          TCP-håndtrykk, så TLS, så HTTP-GET. Bytter du ut én del må alle partene ha trent på den
          nye versjonen — som hvorfor IPv6 og HTTP/3 tar tiår å rulle ut.
        </p>
      </Metafor>

      <Illustration caption="Én Macbook-host kan samtidig være klient, server og peer mot ulike tjenester.">
        <HostRolesSvg />
      </Illustration>

      <Example title="Eksempel: forespørselen din til vg.no i tall">
        <p>
          Du skriver «vg.no» i nettleseren på Tromsø Universitet. Det som skjer er et stafett av
          protokoller:
        </p>
        <VgRequestTimelineSvg />
        <p className="mt-2 text-muted-foreground">
          Fem ulike protokoller måtte enes om format og rekkefølge for at du skulle se forsiden.
          Hver av dem er bare en avtale skrevet ned i en RFC. HTML-en henter siden 60+ andre filer
          (bilder, CSS, JS) — alle stegene gjentas for hver.
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

      <LectureNote title="Aksessnett: still alltid to spørsmål">
        <p>
          Aksessnettet er lenken som kobler end-systemet ditt (eller hele hjemmenettet ditt) til{" "}
          <strong>første-hop-ruteren</strong> på veien mot destinasjonen. Det finnes i tre
          familier: <strong>hjemme-aksess</strong>, <strong>institusjons-aksess</strong> (bedrift,
          skole, kommune) og <strong>mobil aksess</strong> (mobiloperatør eller WiFi).
        </p>
        <p>
          Uansett hvilken du ser på, still de samme to spørsmålene:{" "}
          <strong>hvor mange bits i sekundet</strong> kan sendes over den — og{" "}
          <strong>i hvilken grad må du dele</strong> den kapasiteten med andre? Det andre
          spørsmålet er det folk glemmer, og det er ofte det som avgjør hvordan nettet føles.
        </p>

        <LectureBeat>Kabel-TV-nett (HFC) — delt medium</LectureBeat>
        <p>
          Én fysisk koaks-kabel går forbi mange hus og opp til en <em>head end</em>. Signalene til
          og fra husene ligger på <strong>ulike frekvenser</strong> på den samme kabelen, akkurat
          som FM-radio der stasjonene sender på hver sin frekvens og du stiller inn på den du vil
          ha. Det heter <strong>frekvensdeling</strong> (FDM). Men det er begrenset hvor mange
          frekvenser som finnes, så du deler gjerne én frekvens med naboene: sitter naboen og
          fyrer løs med trafikk, spiser det av din kapasitet.
        </p>
        <p>
          Kabel-aksess er <strong>asymmetrisk</strong> — designet for å levere raskere{" "}
          <em>ned</em> enn <em>opp</em>, fordi vi konsumerer mer data enn vi produserer. Typisk
          40 Mb/s–1,2 Gb/s ned og 30–100 Mb/s opp, og modemet ditt begrenser deg uansett til det
          abonnementet du betaler for. Standarden heter DOCSIS og kommer igjen i kapittel 6.
        </p>

        <LectureBeat>DSL — dedikert, men avstandsfølsom</LectureBeat>
        <p>
          DSL bruker den samme kobber-parkabelen (<em>twisted pair</em> — to kobbertråder tvinnet
          rundt hverandre) som telefonen brukte, og går <strong>direkte til en sentral</strong>.
          Der deler du ikke kapasitet med naboene. Også asymmetrisk: typisk 24–52 Mb/s ned og
          3,5–16 Mb/s opp — men tallene henger tett sammen med{" "}
          <strong>avstanden til sentralen</strong>. Bor du lenger unna enn omtrent fem kilometer,
          får du rett og slett ikke DSL i det hele tatt.
        </p>

        <LectureBeat>Hjemmenettet og de andre</LectureBeat>
        <p>
          I hjemmet kommer kabel- eller DSL-lenken inn i et <strong>modem</strong>{" "}
          (modulator/demodulator), som henger sammen med en ruter som igjen har både kablede og
          trådløse lenker ut til enhetene. I praksis er modem, ruter, svitsj og WiFi-aksesspunkt
          samme boks. Kabelen er som regel Ethernet på 100 Mb/s til 1 Gb/s; WiFi ligger på titalls
          til hundretalls Mb/s.
        </p>
        <p>
          Et <strong>bedriftsnett</strong> er langt på vei et hjemmenett på steroider — samme
          blanding av Ethernet og WiFi, men med mange svitsjer og rutere fordi antallet enheter er
          så mye større. <strong>Datasenternett</strong> er en helt egen sjanger: enorme antall
          servere koblet til hverandre og til nettet på hundrevis av Gb/s.
        </p>
        <p>
          Trådløst deles i to klasser. <strong>WiFi / trådløst LAN</strong> (IEEE 802.11, ikke
          IETF) rekker 10–100 meter og gir 11–450+ Mb/s. <strong>Mobilnett</strong> (4G/5G) rekker
          titalls kilometer fra basestasjonen og gir fra noen få til titalls Mb/s per bruker. Både
          WiFi og mobilnett har en fast enhet — aksesspunkt eller basestasjon — som endeenhetene
          snakker med.
        </p>

        <LectureBeat>Hva «en pakke» faktisk er — og L/R</LectureBeat>
        <p>
          Når en host skal sende en stor fil, deler den den opp i mindre biter. Til hver bit legger
          den på en <strong>header</strong> med ekstra informasjon; protokollen bestemmer hva som
          skal stå der. Data pluss header er <strong>pakken</strong>, og den har en lengde{" "}
          <strong>L</strong> bits — en typisk verdi er 1500 byte.
        </p>
        <p>
          Lenken har en <strong>transmisjonsrate R</strong> målt i bits per sekund (også kalt
          kapasitet eller båndbredde, litt upresist). Da er tiden det tar å få pakken ut på lenken
          rett og slett{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">L / R</code>. Den lille
          brøken kommer tilbake igjen og igjen i resten av kurset.
        </p>

        <LectureBeat>Fysisk medium — kort versjon</LectureBeat>
        <p>
          Media deles i <strong>guided</strong> (signalet føres i noe fysisk: kobber, koaks, fiber)
          og <strong>unguided</strong> (signalet forplanter seg fritt: radio). Parkabel gir
          hundrevis av Mb/s til Gb/s, men er følsom for elektromagnetisk støy. Koaks brukes til
          kabel-aksess og gir hundrevis av Mb/s. Fiber sender lyspulser, gir hundrevis av Gb/s og
          oppover med svært lav feilrate — nesten ideelt, bortsett fra at sender- og
          mottakerkomponentene koster mer enn kobber.
        </p>
        <p>
          Trådløst er et notorisk vanskelig miljø. Signalet <strong>svekkes med avstand</strong>,{" "}
          <strong>reflekteres</strong> av gjenstander, <strong>blokkeres</strong> av vegger (eller
          går rett gjennom, avhengig av frekvens), og forstyrres av motorer, mikrobølgeovner og
          alt annet som stråler i samme bånd. I tillegg er trådløst per definisjon{" "}
          <strong>kringkasting</strong>: alle nær senderen kan i prinsippet motta — derav både
          avlyttings- og interferensproblemet.
        </p>
        <p>
          Til slutt en som overrasker: en geostasjonær <strong>satellitt</strong> gir omtrent samme
          rate som terrestrisk mikrobølge (titalls Mb/s), men har en{" "}
          <strong>propagasjonsforsinkelse på cirka 270 ms</strong> hver vei. Det er ikke
          kapasiteten som ødelegger for interaktiv bruk der — det er lysets hastighet.
        </p>
      </LectureNote>


      <VisualDefs
        items={[
          {
            term: "Aksess-nettverk",
            icon: <AccessHouseIcon />,
            body: "Nettet som kobler hosten din til nærmeste ruter; ofte det tregeste leddet.",
          },
          {
            term: "Last-mile",
            icon: <LastMileRulerIcon />,
            body: "«Siste kilometer» — fra ISP-en og inn i hjemmet ditt.",
          },
          {
            term: "FTTH (fiber)",
            icon: <FiberIcon />,
            body: "Fiber To The Home — fiber helt inn i boligen. Symmetrisk og rask (1–10 Gbps).",
          },
          {
            term: "DSL (kobber)",
            icon: <DslPhoneIcon />,
            body: "Digital Subscriber Line — bredbånd over telefon-kobberen. Treigere jo lenger fra sentralen.",
          },
          {
            term: "HFC (koaks)",
            icon: <HfcCoaxIcon />,
            body: "Hybrid Fiber-Coax — fiber til lokal node, koaks-kabel inn i huset; delt mellom naboer.",
          },
          {
            term: "Trådløst (WiFi, 4G/5G)",
            icon: <WifiIcon />,
            body: "Radio-baserte aksess-nett. Deler spektrum mellom mange brukere.",
          },
          {
            term: "Core router",
            icon: <CoreRouterIcon />,
            body: "Backbone-ruter optimalisert for terabits per sekund.",
          },
          {
            term: "Backbone",
            icon: <BackboneIcon />,
            body: "Langdistanse-fibre mellom store byer eller landsdeler.",
          },
          {
            term: "Datasenter",
            icon: <DataCenterIcon />,
            body: "Tusenvis av servere samlet med eget høy-hastighets internt nett.",
          },
          {
            term: "Peering",
            icon: <PeeringIcon />,
            body: "To ISP-er bytter trafikk gratis fordi det gagner begge.",
          },
          {
            term: "Transit",
            icon: <TransitIcon />,
            body: "ISP A betaler ISP B for å bære trafikken videre til resten av nettet.",
          },
          {
            term: "Multi-homing",
            icon: <MultiHomingIcon />,
            body: "Kunde kobler seg til flere ISP-er samtidig for redundans.",
          },
          {
            term: "POP",
            icon: <PopIcon />,
            body: "Point of Presence — fysisk samlingssted der en ISP har sitt utstyr og peerer.",
          },
        ]}
      />

      <Illustration caption="Edge er der end-hostene sitter; core er det indre ruter-nettet.">
        <EdgeCoreSvg />
      </Illustration>

      <Metafor tittel="Edge og core som by og motorvei">
        <p>
          Edge er der folk faktisk bor og jobber — leiligheter, kontorer, butikker. Core er
          motorveiene mellom byene: ingen bor langs dem, men alle bruker dem for å komme et sted.
          Aksess-nettverket er fortauene og bykjernen som binder huset ditt til motorvei-rampen.
        </p>
        <p>
          Når du «laster en nettside», kjører pakkene først ut av nabolaget (aksess), så inn på
          motorveien (core), så ut av motorveien i en annen by (annet aksess-nett) og fram til en
          server-bygning der. Flaskehalsen er nesten alltid i bytrafikken, ikke på motorveien.
        </p>
      </Metafor>

      <Metafor tittel="Datasenter som varehus-distribusjon">
        <p>
          Et moderne datasenter er ikke som en kontorbygning med servere — det er som et Amazon
          fulfillment-senter. Hundretusen identiske «varer» (servere) på reoler i lange ganger,
          tråkkmaskiner (gigabit-svitsjer) overalt, og roboter (orkestratorer) som flytter
          arbeidsmengder dit det er kapasitet.
        </p>
        <p>
          Når du åpner Gmail, henvender du deg ikke til «en server» — du sender en pakke til en
          tilfeldig av tusen identiske maskiner som tilfeldigvis hadde plass i øyeblikket. Edge-en
          du møter er en gigant-bygning, ikke en enkelt-maskin.
        </p>
      </Metafor>

      <Metafor tittel="Peering og transit som båt-fellesskap">
        <p>
          Forestill deg to fiskemottak på samme kai. De inngår peering: «jeg leverer din torsk til
          mine kunder, du leverer min hyse til dine — vi sparer begge å sende egen bil». Ingen
          betaler den andre, fordi det er gjensidig nytte.
        </p>
        <p>
          Transit er det motsatte: en liten frosken-fiskeprodusent i Hammerfest har ikke biler nok
          til å nå Oslo, så de betaler et større speditør-selskap for å frakte varene videre. ISP-er
          gjør akkurat dette med pakker — peer der det er gjensidig vinn-vinn, kjøp transit der det
          ikke er.
        </p>
      </Metafor>

      <Illustration caption="Aksess-teknologiene rangert etter typisk kapasitet og forsinkelse.">
        <AksessKartSvg />
      </Illustration>

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

      <VisualDefs
        items={[
          {
            term: "Krets-svitsjing",
            icon: <CircuitSwitchIcon />,
            body: "Reserverer en dedikert sti før samtalen, holder den hele tiden.",
          },
          {
            term: "Pakke-svitsjing",
            icon: <PacketSwitchIcon />,
            body: "Data deles i pakker som rutes uavhengig uten forhånds-reservasjon.",
          },
          {
            term: "FDM",
            icon: <FdmIcon />,
            body: "Frequency-Division Multiplexing — deler båndbredden i frekvens-bånd som FM-radio-kanaler.",
          },
          {
            term: "TDM",
            icon: <TdmIcon />,
            body: "Time-Division Multiplexing — deler lenken i tids-slots, ett per krets.",
          },
          {
            term: "Statistisk muxing",
            icon: <StatMuxDiceIcon />,
            body: "Mange brukere deler én lenke fordi få er aktive samtidig.",
          },
          {
            term: "Store-and-forward",
            icon: <StoreForwardIcon />,
            body: "Ruter mottar hele pakken før den begynner å videresende.",
          },
          {
            term: "Cut-through",
            icon: <CutThroughIcon />,
            body: "Videresender før hele pakken er mottatt — sparer forsinkelse.",
          },
          {
            term: "Køing og tap",
            icon: <QueueIcon />,
            body: "Pakker venter når lenken er opptatt; full kø droppes.",
          },
          {
            term: "Buffer",
            icon: <BufferIcon />,
            body: "Minne i ruteren der ventende pakker står på rad.",
          },
          {
            term: "Connection-oriented",
            icon: <HandshakeIcon />,
            body: "Med eller uten oppsett før første pakke sendes (vs connectionless).",
          },
          {
            term: "Virtual circuit",
            icon: <VirtualCircuitIcon />,
            body: "Pakke-nett som etterligner krets ved å sette opp logisk sti først.",
          },
          {
            term: "Burst-trafikk",
            icon: <BurstIcon />,
            body: "Data i støt med lange stillheter — typisk for nettlesing og e-post.",
          },
          {
            term: "QoS",
            icon: <QosLaneIcon />,
            body: "Quality of Service — mekanismer som gir prioritet til viktige pakker (VoIP, video).",
          },
        ]}
      />

      <Illustration caption="Krets-svitsjing reserverer en hel sti; pakke-svitsjing blander pakker fra mange kilder.">
        <CircuitVsPacketSvg />
      </Illustration>

      <Illustration caption="Side-ved-side: øverst krets med reservert sti (alle andre blokkert), nederst pakker fra mange brukere som deler.">
        <CircuitVsPacketComparisonSvg />
      </Illustration>

      <Metafor tittel="Telefon-sentralen vs postvesenet">
        <p>
          Krets-svitsjing er som å ringe en venn fra en gammeldags telefon-sentral. Operatøren
          plugger en fysisk ledning fra deg til mottakeren. Ledningen er din alene til samtalen
          slutter — selv om dere bare er stille mesteparten av tiden, kan ingen andre bruke den.
        </p>
        <p>
          Pakke-svitsjing er postvesenet. Du skriver et brev, putter på adressen, og legger det i
          postkassen. Posten vet ikke om eller når du skal sende neste brev, og brevet ditt deler
          postbil med tusenvis av andre folks brev. Effektivt — men hvor lang tid det tar er ikke
          helt forutsigbart.
        </p>
      </Metafor>

      <Metafor tittel="Statistisk multipleksing som restaurant-bord">
        <p>
          En restaurant med 50 bord kan i teorien servere 50 grupper samtidig — men i praksis bruker
          hver gruppe halve tiden på meny-lesing, ventetid, drikke. Hvis restauranten satte av 50
          bord per kveld og forlangte at gjestene satt der hele tiden (krets-modell), ville mange
          bord stå tomme i mesteparten av kvelden.
        </p>
        <p>
          I stedet aksepterer restauranten 120 reservasjoner i samme tidsrom, fordi de vet at
          gjennomsnitts-belegget på bordene er ~40 %. Det går nesten alltid bra. Når det av og til
          ikke gjør det, må noen vente i baren — det er kø-forsinkelse i pakke-nettet.
        </p>
      </Metafor>

      <Metafor tittel="Store-and-forward som flyplass-omlastning">
        <p>
          Hvis du flyr Tromsø → Oslo → Frankfurt, kan ikke flyet til Frankfurt ta av før hele flyet
          fra Tromsø er landet og passasjerene er omlastet. Tids-tapet per byttetur er omtrent
          konstant — like mange minutter uansett hvor lang neste etappe er.
        </p>
        <p>
          Ruteren gjør samme: den må motta hele pakken før den kan sende den ut på neste lenke. Tre
          hopp = tre transmisjons-runder. Men hvis du deler én stor «pakke» i flere små
          (pipelining), kan andre pakke være på flyet til Frankfurt mens første ennå er på vei.
          Derfor er små pakker raskere over mange hopp.
        </p>
      </Metafor>

      <Illustration caption="Sammenligning: krets vs pakke på fire dimensjoner.">
        <KretsVsPakkeTabellSvg />
      </Illustration>

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
        <StoreForwardTimelineSvg />
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
const ANSLAG_14: Anslag[] = [
  {
    id: "k1-bom-total",
    tema: "Transmisjon vs. propagasjon",
    sporsmal: (
      <>
        En kolonne på <strong>10 biler</strong> skal gjennom bom 1 og fram til bom 2. Bommen bruker{" "}
        <strong>12 sekunder per bil</strong>. Det er <strong>100 km</strong> mellom bommene, og bilene
        kjører <strong>100 km/t</strong>. Hvor lang tid går det før hele kolonnen står ved bom 2?
      </>
    ),
    valg: ["2 minutter", "60 minutter", "62 minutter", "10 timer"],
    riktig: 2,
    fasit: (
      <>
        120 sekunder på å ekspedere kolonnen gjennom bommen, pluss én time på veien for den siste bilen
        = <strong>62 minutter</strong>. De to leddene legges sammen — de skjer ikke samtidig for den{" "}
        <em>siste</em> bilen, som må vente på tur før den i det hele tatt får begynne å kjøre.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Fordi «det tar en time å kjøre 100 km» er så dominerende at ekspederingen føles som avrunding.
        I nettverk er forholdet ofte motsatt: på en treg lenke kan transmisjonstiden være det store
        leddet, og propagasjonen forsvinne i støy. Poenget er at du må regne på begge — ikke gjette
        hvilken som dominerer.
      </>
    ),
  },
  {
    id: "k1-bom-uavhengig",
    tema: "Hva henger sammen med hva",
    sporsmal: (
      <>
        Du oppgraderer bomstasjonen så den bruker <strong>6 sekunder per bil</strong> i stedet for 12.
        Hva skjer med <strong>propagasjonstiden</strong>?
      </>
    ),
    valg: [
      "Den halveres også",
      "Den er uendret",
      "Den dobles, siden bilene kommer tettere",
      "Kommer an på hvor mange biler det er",
    ],
    riktig: 1,
    fasit: (
      <>
        Uendret. Propagasjonstiden er <strong>avstand delt på fart</strong> — den vet ingenting om hvor
        fort bitene ble lagt ut på lenken. I nettverkstermer: å øke R endrer L/R, aldri d/s.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        «Raskere linje = alt går raskere» er en rimelig hverdagsmodell, og den er riktig for
        transmisjonsdelen. Men lyshastigheten over Atlanterhavet bryr seg ikke om at du kjøpte
        gigabit. Det er derfor en fiberlenke til Australia fortsatt har elendig ping.
      </>
    ),
  },
  {
    id: "k1-trafikkintensitet",
    tema: "Køforsinkelse",
    sporsmal: (
      <>
        Trafikkintensiteten <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">L·a/R</code>{" "}
        kryper fra 0,8 mot 0,98. Hva skjer med den gjennomsnittlige køforsinkelsen?
      </>
    ),
    valg: [
      "Den vokser omtrent 20 %, som belastningen",
      "Den vokser eksplosivt — kurven går mot uendelig",
      "Den er uendret helt til intensiteten passerer 1",
      "Den synker, fordi lenken utnyttes bedre",
    ],
    riktig: 1,
    fasit: (
      <>
        Køforsinkelsen vokser <strong>ikke lineært</strong>. Nær 1 stiger kurven nesten loddrett — det
        er derfor en lenke på 97 % belastning oppfører seg dramatisk verre enn én på 80 %, ikke litt
        verre.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Vi behandler «utnyttelse» som en lineær skala fordi prosenter ser lineære ut. Du kjenner
        egentlig fenomenet fra veien: forskjellen på en motorvei som er 80 % og 98 % full er ikke 18
        prosentpoeng saktere — det er flytende trafikk mot full stopp.
      </>
    ),
  },
];

function Section14() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="1.4" title="Forsinkelse, throughput og pakketap" />

      <p className="text-muted-foreground">
        Det er fire kilder til forsinkelse når en pakke beveger seg fra én ruter til neste. Når du
        forstår hver av dem, kan du peke på hvilken som dominerer i et gitt scenario.
      </p>

      <Section14Live />

      <AnslagPanel
        avsloring="knapp"
        tittel="Anslå først — så kjører du bomstasjonene"
        intro={
          <>
            Simulatoren under lar deg kjøre en bilkolonne gjennom to bomstasjoner, og bytte til
            nettverks-merkelapper når du vil se hva analogien tilsvarer. Ta stilling først.
          </>
        }
        anslag={ANSLAG_14}
      />

      <BomstasjonViz />

      <LectureNote title="Bomstasjons-analogien: transmisjon er ikke propagasjon">
        <p>
          Erfaringen fra forelesningen er at akkurat disse to blandes oftere enn noe annet i
          kapittelet, så det er verdt en analogi. Tenk deg en kolonne biler:{" "}
          <strong>bilene er bits</strong>, <strong>kolonnen er pakken</strong>, og{" "}
          <strong>å ekspedere én bil gjennom bomstasjonen er å transmittere én bit</strong>. Bilen
          kjører deretter — propagerer — videre til neste bomstasjon.
        </p>
        <p>
          Sett tall på det: bomstasjonen bruker 12 sekunder per bil, kolonnen er 10 biler, bilene
          kjører 100 km/t, og bomstasjonene står 100 km fra hverandre. Spørsmålet er hvor lang tid
          det tar før hele kolonnen står oppstilt foran <em>neste</em> bomstasjon.
        </p>
        <p>
          <strong>Transmisjon:</strong> 12 s × 10 biler = 120 sekunder, altså 2 minutter for å få
          hele kolonnen ut på veien. <strong>Propagasjon:</strong> siste bil skal 100 km i 100
          km/t = 1 time. Totalt <strong>62 minutter</strong> — og legg merke til hvor voldsomt
          skjevfordelt de to bidragene er. Poenget analogien får fram: transmisjonstiden avhenger
          av <em>hvor bred porten er</em> (R) og hvor mye du skal gjennom (L). Propagasjonstiden
          avhenger av <em>hvor langt det er</em>, og av ingenting annet.
        </p>
        <p>
          Derfor merker du propagasjon i praksis selv om bits beveger seg nær lysets hastighet:
          cirka 270 ms opp til en geostasjonær satellitt, og rundt 30 ms over Atlanteren mellom
          USAs østkyst og Europa.
        </p>

        <LectureBeat>Trafikkintensitet: hvorfor køen eksploderer</LectureBeat>
        <p>
          La <strong>a</strong> være gjennomsnittlig ankomstrate for pakker og <strong>L</strong>{" "}
          pakkelengden, slik at <strong>L·a</strong> er ankomstraten målt i bits. Del det på
          lenkens transmisjonsrate <strong>R</strong>, og du får{" "}
          <strong>trafikkintensiteten L·a/R</strong> — forholdet mellom hvor mye arbeid som kommer
          inn og systemets evne til å gjøre det arbeidet.
        </p>
        <p>
          Er L·a/R liten, er det sjelden kø. Er den <em>større enn 1</em>, kommer det inn mer
          arbeid enn systemet klarer, og køen vokser uten grense — forsinkelsen går mot uendelig.
          Det interessante er formen på kurven i mellom: når intensiteten nærmer seg 1, stiger
          forsinkelsen ikke jevnt, den skyter i været. Du kjenner fenomenet fra veitrafikk — en vei
          som er 95 % full oppfører seg helt annerledes enn en som er 70 % full.
        </p>

        <LectureBeat>traceroute: mål det selv i det levende internettet</LectureBeat>
        <p>
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">traceroute</code> sender
          tre pakker til første-hop-ruteren, måler rundturstiden for hver, viser de tre målingene —
          og gjentar så for andre hop, tredje hop, og videre til destinasjonen er nådd.
        </p>
        <p>
          I en kjøring fra et universitet i Massachusetts mot en vert i Frankrike ser man mønsteret
          tydelig: 1–2 ms til de første ruterne inne på campus, 22 ms til en ruter i Washington DC
          — og så over 100 ms til neste ruter, som ligger i Frankrike. Hoppet fra 22 til 105 ms er
          rett og slett Atlanterhavet.
        </p>
        <p>
          To ting som forvirrer når du kjører det selv. Målt RTT kan <em>synke</em> selv om pakken
          går lenger — fordi køforsinkelsen lenger oppe i stien varierer over tid. Og du får noen
          ganger <strong>stjerner</strong> i stedet for tall: det er rutere som nekter å svare på
          traceroute-pakker, så ingen måling kan gjøres.
        </p>

        <LectureBeat>Throughput: tenk væske i rør</LectureBeat>
        <p>
          Throughput er raten i bits per sekund fra sender til mottaker, og må alltid defineres over
          et tidsintervall — øyeblikkelig, eller gjennomsnittlig over lang tid. Bildet som gjør det
          intuitivt er væske gjennom rør: senderen presser væske inn, og hver lenke på veien er et
          rør med en gitt kapasitet. Noen rør er tykke, noen er tynne.
        </p>
        <p>
          Sender du gjennom et tynt rør R<sub>s</sub> etterfulgt av et tykt R<sub>c</sub>,
          begrenses du av R<sub>s</sub>. Snu på det, og du begrenses av R<sub>c</sub>. Generelt:{" "}
          <strong>throughput settes av det tynneste røret</strong> — <em>flaskehals-lenken</em>.
        </p>
        <p>
          Så det virkelig lærerike tilfellet: 10 servere som hver sender til hver sin klient, der
          alle ti flytene deler én felles lenke med kapasitet R i midten. Deles den rettferdig, får
          hver flyt R/10 der. Hver økt går altså gjennom tre rør — R<sub>s</sub>, R/10 og R
          <sub>c</sub> — og throughput per forbindelse blir{" "}
          <strong>minimum av de tre</strong>.
        </p>
        <p>
          Og poenget som er verdt å ta med seg videre: i praksis er R<sub>s</sub> eller R
          <sub>c</sub> som regel mindre enn R/n. <strong>Flaskehalsene sitter i ytterkantene av
          nettet</strong>, ikke i kjernen.
        </p>
      </LectureNote>


      <VisualDefs
        items={[
          {
            term: "d_proc (prosessering)",
            icon: <ProcDelayIcon />,
            body: "Tiden ruteren bruker på å lese header og finne ut-lenke.",
          },
          {
            term: "d_kø (kø)",
            icon: <QueueDelayIcon />,
            body: "Hvor lenge pakken venter i kø før den slipper ut på lenken.",
          },
          {
            term: "d_trans (transmisjon)",
            icon: <TransDelayIcon />,
            body: "Tid å klemme ut bitene: L / R (pakke-størrelse delt på lenke-rate).",
          },
          {
            term: "d_prop (propagasjon)",
            icon: <PropDelayIcon />,
            body: "Tid for én bit å reise fra ene enden til den andre — avstand / lyshastighet.",
          },
          {
            term: "Total nodal",
            icon: <SumSigmaIcon />,
            body: "Summen: d_proc + d_kø + d_trans + d_prop per hopp.",
          },
          {
            term: "Trafikk-intensitet ρ",
            icon: <TrafficIntensityIcon />,
            body: "ρ = La / R — hvor full lenken er i snitt. ρ → 1 sprenger køen.",
          },
          {
            term: "Throughput",
            icon: <ThroughputPipeIcon />,
            body: "Bits per sekund som faktisk strømmer; begrenset av tregeste lenke.",
          },
          {
            term: "Throughput vs båndbredde",
            icon: <ThroughputPipeIcon />,
            body: "Båndbredde = teoretisk maks; throughput = faktisk oppnådd rate.",
          },
          {
            term: "BDP",
            icon: <BdpIcon />,
            body: "Bandwidth-delay product — throughput × RTT, antall bits «i transitt» på lenken.",
          },
          {
            term: "Pakketap-rate",
            icon: <LossIcon />,
            body: "Andel sendte pakker som ikke kommer fram, ofte fra full kø.",
          },
          {
            term: "RTT",
            icon: <RttLoopIcon />,
            body: "Round-Trip Time — tid fram + tid tilbake; det ping måler.",
          },
          {
            term: "Jitter",
            icon: <JitterIcon />,
            body: "Variasjon i forsinkelse mellom pakker. Ødelegger sann-tid lyd/video.",
          },
          {
            term: "Goodput",
            icon: <GoodputIcon />,
            body: "Faktisk nyttig app-rate, eksklusive headere og retransmisjoner.",
          },
          {
            term: "Traceroute / ping",
            icon: <TracerouteIcon />,
            body: "Verktøy som måler RTT og kartlegger ruten hopp for hopp.",
          },
        ]}
      />

      <Illustration caption="Fire forsinkelses-kilder i én ruter: prosessering, kø, transmisjon, propagasjon.">
        <DelaySvg />
      </Illustration>

      <Illustration caption="Relativ størrelse på de fire bidragene Bergen→NY: propagasjon dominerer over Atlanteren.">
        <FourDelaysBarsSvg />
      </Illustration>

      <Metafor tittel="Fire forsinkelser i kassakøen på Rema 1000">
        <p>
          Tenk på pakken din som en handlekurv på vei gjennom Rema. Du opplever fire ventetider som
          er nøyaktig analoge til de fire forsinkelses-typene:
        </p>
        <p>
          <strong>d_proc</strong> = kassadama leser strekkoder og tar betaling. Rask.
          <strong> d_kø</strong> = du står bak fire andre kunder før det er din tur. Varierer mest.{" "}
          <strong>d_trans</strong> = du må fysisk pakke alle varene i pose — tar tid proporsjonal
          med hvor mange varer du har. <strong>d_prop</strong> = du går fra kassen til bilen på
          parkeringen. Avstanden er konstant og ikke noe du kan forhandle om.
        </p>
        <p>
          Akkurat som med pakker: hvis køen er kort, dominerer transport-tiden til bilen
          (propagasjon). Hvis butikken er overfylt, dominerer kø-tiden.
        </p>
      </Metafor>

      <Metafor tittel="Throughput som vann gjennom rør i serie">
        <p>
          Du har tre rør i serie: 10 cm, 2 cm, 8 cm i diameter. Hvor mye vann kan du presse gjennom
          hele systemet per sekund? Svaret er bestemt av det smaleste røret — 2 cm-røret. Å bytte 10
          cm-røret til 20 cm hjelper ingenting.
        </p>
        <p>
          End-to-end throughput på nettet er presis det samme. En 1 Gbps server-lenke som går
          gjennom en 100 Mbps WiFi-hjemmeruter ender på 100 Mbps. Flaskehalsen er oftest
          aksess-nettet ditt — derfor sender Spotify forhåndspakkede lavoppløselige versjoner til
          mobil først.
        </p>
      </Metafor>

      <Metafor tittel="BDP som bil-stafett over et land">
        <p>
          Tenk på data-strømmen din som biler som kjører Trondheim–Oslo og tilbake. RTT er
          rundetiden — la oss si 8 timer fram-og-tilbake. Throughput er hvor mange biler du kan
          slippe inn på veien per time (la oss si 100).
        </p>
        <p>
          For å holde veien full, må du ha minst 100 × 8 = 800 biler «underveis» til enhver tid. Det
          er BDP. TCP-vinduet er garasjen din — hvis den bare rommer 200 biler, må du vente på at
          noen kommer hjem før du kan slippe ut nye, og veien står halvtom mesteparten av tiden.
          Derfor er BDP avgjørende for tilkoblinger med høy RTT (satellitt).
        </p>
      </Metafor>

      <Illustration caption="Kø-forsinkelse vokser eksponentielt mot uendelig når trafikk-intensitet ρ nærmer seg 1.">
        <QueueDelayCurveSvg />
      </Illustration>

      <Example title="Eksempel: end-to-end-forsinkelse Bergen → New York">
        <p>
          En pakke på 1500 bytes (=12 000 bits) skal fra Bergen til New York. Stien går:
          hjemme-ruter → 100 Mbps lokal-lenke (10 km) → 1 Gbps backbone-lenke (5500 km undersjøisk
          fiber) → kunde-ruter.
        </p>
        <WorldMapBergenNYSvg />
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

      <LectureNote title="Flyreisen: hvor lag-tenkningen kommer fra">
        <p>
          Problemet lag-modellen løser er egentlig et <em>pedagogisk</em> og{" "}
          <em>ingeniørmessig</em> problem på én gang: hvordan diskuterer, designer og lærer man et
          system med milliarder av samvirkende deler? Analogien forelesningen bruker er flyreiser —
          også et system med fly, rullebaner, tårn, bagasje, bagasjebånd, billettluker, sikkerhet,
          reisende og gate-verter.
        </p>
        <p>
          Første forsøk er å liste stegene: kjøp billett, sjekk inn, sjekk bagasje, gjennom
          sikkerhetskontrollen, til gaten, ombordstigning, taxi, take-off, ruting i lufta, landing —
          og så alle stegene i motsatt rekkefølge på destinasjonen. Nyttig, men ikke abstrakt nok.
        </p>
        <p>
          Det virkelige grepet er å <strong>tenke horisontalt</strong>. Det finnes en funksjon på
          avreisesiden og en tilhørende funksjon på ankomstsiden som{" "}
          <strong>sammen realiserer én tjeneste</strong>: innsjekking + bagasjeutlevering leverer
          «bagasjen din fra A til B». Take-off + landing leverer «flyet fra A til B». Og for å
          klare det, støtter hvert lag seg på tjenestene fra laget under.
        </p>

        <LectureBeat>Hvorfor det lønner seg</LectureBeat>
        <p>
          To gevinster. Den <strong>eksplisitte strukturen</strong> gir oss en referansemodell — vi
          kan peke på delene og på hvordan de forholder seg til hverandre. Og{" "}
          <strong>modulariseringen</strong> gjør at en endring kan lokaliseres: bytter du ut{" "}
          <em>hvordan</em> en tjeneste realiseres, men lar grensesnittet stå, merker ingen andre
          lag det. Endrer flyplassen hvordan gate-vertene jobber, påvirker ikke det billettsalget,
          bagasjehåndteringen eller take-off.
        </p>

        <LectureBeat>De fem lagene — og hva som faktisk er forskjellen</LectureBeat>
        <p>
          Applikasjonslaget styrer meldingene mellom de distribuerte delene av applikasjonen.
          Transportlaget frakter applikasjonsmeldinger <strong>fra prosess til prosess</strong> —
          og kan velge å gi pålitelighet (TCP) oppå et nettlag som kan miste pakker, eller la være.
          Nettverkslaget frakter data <strong>fra host til host</strong>, i internettet med en
          tjenestemodell som heter <strong>best effort</strong>: vi gjør vårt beste, men lover
          ingenting. Lenkelaget flytter data mellom to naboenheter på samme lenke, og fysisk lag
          får bitene ut på lenken.
        </p>
        <p className="rounded-lg border border-amber-500/30 bg-background/60 px-3 py-2">
          Legg merke til den subtile, men viktige forskjellen: nettverkslaget leverer{" "}
          <strong>host til host</strong>, transportlaget leverer <strong>prosess til prosess</strong>.
          Det er nettopp derfor transportlaget trenger portnumre.
        </p>

        <LectureBeat>Innkapsling og de fire navnene</LectureBeat>
        <p>
          På hvert lag har dataenheten — <em>protocol data unit</em> — sitt eget navn. På
          applikasjonslaget utveksles <strong>meldinger</strong>. Transportlaget tar meldingen, legger
          på egen informasjon, og lager et <strong>segment</strong>. Hva slags informasjon? Noe som
          identifiserer hvilken prosess meldingen skal til (det kan kjøre mange der), og — for en
          protokoll som TCP — alt som trengs for å realisere pålitelig overføring.
        </p>
        <p>
          Nettverkslaget kapsler inn segmentet med sin egen header og lager et{" "}
          <strong>datagram</strong>; i internettets IP-protokoll er det her avsender- og
          mottaker-IP-adressen ligger. Lenkelaget kapsler inn datagrammet og lager en{" "}
          <strong>ramme</strong>. Denne operasjonen — ta en dataenhet ovenfra, legg på egen
          informasjon, lag en ny dataenhet — er <strong>innkapsling</strong>, og den skjer overalt i
          nettet.
        </p>
        <p>
          Bildet å ha i hodet er data som faller <em>ned</em> gjennom stakken hos avsenderen mens
          headere legges på lag for lag, går over lenken, og klatrer <em>opp</em> gjennom stakken
          hos mottakeren mens headerne leses, handles på og fjernes én etter én.
        </p>
        <p>
          Én ting til, som er lett å overse i animasjonen: <strong>svitsjer og rutere inne i nettet
          implementerer bare de nederste lagene</strong>. Jobben deres er å videresende rammer og
          datagram — de har ingen grunn til å røre transportlagets segment eller applikasjonens
          melding inni.
        </p>
      </LectureNote>


      <VisualDefs
        items={[
          {
            term: "Applikasjonslaget",
            icon: <AppLayerIcon />,
            body: "HTTP, SMTP, DNS — her lever meldingene applikasjoner forstår.",
          },
          {
            term: "Transportlaget",
            icon: <TransportLayerIcon />,
            body: "TCP/UDP. Deler i segmenter, bruker portnumre, gir (kanskje) pålitelighet.",
          },
          {
            term: "Nettverkslaget",
            icon: <NetworkLayerIcon />,
            body: "IP. Leverer datagrammer host-til-host via mange rutere.",
          },
          {
            term: "Linklaget",
            icon: <LinkLayerIcon />,
            body: "Ethernet/WiFi. Flytter pakker fra én node til neste over én lenke.",
          },
          {
            term: "Fysisk lag",
            icon: <PhysicalLayerIcon />,
            body: "Selve representasjonen av bits: spenning, lys, radiobølger.",
          },
          {
            term: "Innkapsling",
            icon: <EncapsulationIcon />,
            body: "Hvert lag legger sitt eget header foran meldingen på vei ned.",
          },
          {
            term: "Header vs payload",
            icon: <HeaderPayloadIcon />,
            body: "Header er metadata; payload er selve dataene fra laget over.",
          },
          {
            term: "PDU",
            icon: <PduIcon />,
            body: "Protocol Data Unit — navn på pakken per lag: melding, segment, datagram, ramme.",
          },
          {
            term: "Service model",
            icon: <ServiceModelIcon />,
            body: "Tjenesten et lag tilbyr laget over: pålitelig, ordnet, best-effort osv.",
          },
          {
            term: "Horisontal / vertikal",
            icon: <HoriVertArrowsIcon />,
            body: "Lag snakker med naboen over/under lokalt og med samme lag på den andre hosten via header.",
          },
          {
            term: "OSI (7 lag)",
            icon: <OsiSevenLayerIcon />,
            body: "Akademisk standard med 7 lag; vant aldri i praksis.",
          },
          {
            term: "Session / presentation",
            icon: <SessionPresIcon />,
            body: "OSI-lag som TCP/IP slo sammen med applikasjonslaget.",
          },
          {
            term: "Demultipleksing",
            icon: <DemuxIcon />,
            body: "Riktig protokoll/app får pakken via type-felt og portnumre.",
          },
          {
            term: "End-to-end",
            icon: <EndToEndIcon />,
            body: "Legg smarthet på endene, ikke i rutere. Holder kjernen enkel.",
          },
        ]}
      />

      <Illustration caption="Innkapsling: hvert lag legger til sin header på vei nedover stakken.">
        <EncapsulationSvg />
      </Illustration>

      <div className="grid gap-3 lg:grid-cols-2">
        <Illustration caption="Stakken som bygning — appen i toppetasjen, fiberen i kjelleren.">
          <StackFlagBuildingSvg />
        </Illustration>
        <Illustration caption="Innkapsling som matrjosjka: 30 B app-data ender som 88 B på lenken — 66 % overhead.">
          <MatryoshkaEncapsulationSvg />
        </Illustration>
      </div>

      <Metafor tittel="Lag-modellen som norsk postvesen">
        <p>
          Tenk på lagene som hvert sitt rolle-byrå i postsystemet. Du skriver et brev
          (applikasjonslag). Du brettetit, putter i konvolutt og skriver mottakeren (transportlag).
          Du skriver postnummer (nettverkslag). Du leverer det til lokalt posthus (linklag), som
          sorterer og legger på postbil (fysisk lag).
        </p>
        <p>
          Hver person i kjeden bryr seg bare om sitt lag. Brevbæreren leser ikke brevet.
          Sorteringssentralen leser ikke konvolutt-innholdet, bare postnummeret. Hver lag har sin
          egen «adresse-type» — og hver lag legger til sin egen merking før den gir det videre til
          neste.
        </p>
      </Metafor>

      <Metafor tittel="Innkapsling som matrjosjka-dukker">
        <p>
          En matrjosjka — den russiske trefiguren der du åpner én dukke og finner en mindre inni.
          Pakken din på nettet er nøyaktig sånn. Innerst ligger «hei»-meldingen din. Rundt den
          ligger TCP-headeren. Rundt det ligger IP-headeren. Ytterst ligger Ethernet-rammen.
        </p>
        <p>
          Mottakeren skreller av lag for lag. Linklaget åpner Ethernet-skallet og gir innholdet
          videre til IP. IP åpner sitt skall og gir resten til TCP. TCP åpner sitt og gir den minste
          dukken — selve meldingen — til appen. Ingen lag røper for de andre hva som ligger inni.
        </p>
      </Metafor>

      <Metafor tittel="End-to-end-prinsippet som ekte-brev-bekreftelse">
        <p>
          Hvis du sender et viktig brev, hvem skal kvittere for at det er mottatt? PostNord kunne i
          prinsippet kvittert i hvert sorterings-anlegg pakken passerer. Men det er dyrt, sårbart
          for feil, og hva hjelper det egentlig — den eneste kvitteringen som betyr noe er at
          mottakeren har holdt brevet i hånda.
        </p>
        <p>
          Internett bruker samme logikk: TCP-bekreftelser går fra ende-host til ende-host, ikke
          mellom rutere. Det holder kjernen av nettet billig og rask, og lar pålitelighet være et
          frittstående valg per applikasjon. Det er hvorfor du kan oppgradere TCP (Cubic → BBR) uten
          å røre én ruter i verden.
        </p>
      </Metafor>

      <Illustration caption="De fem lagene som vertikal stripe med eksempler per lag.">
        <FemLagSvg />
      </Illustration>

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
function Section16Kontekst() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="1.6" title="Sikkerhet, historie og styring" />

      <p className="text-muted-foreground">
        Kapittel 1 avsluttes med tre temaer som ikke er protokoll-teknikk, men som forklarer{" "}
        <em>hvorfor</em> teknikken ser ut som den gjør: hvilke angrep nettet er utsatt for, hvordan
        det ble til, og hvem som egentlig bestemmer over det. Alle tre kommer tilbake senere —
        sikkerhet får sitt eget kapittel — men konteksten er verdt å ha på plass tidlig.
      </p>

      <LectureNote title="Nettverk under angrep" defaultOpen>
        <p>
          Startpunktet er en innrømmelse: den opprinnelige internett-arkitekturen ble ikke designet
          med sikkerhet for øyet. Designvisjonen var «en gruppe gjensidig tillitsfulle brukere
          koblet til et transparent nett». Designerne var ikke naive — sikkerhet var bare ikke et
          bevisst kritisk designkriterium gitt bruken man så for seg. Konsekvensen er at vi den dag
          i dag delvis spiller catch-up.
        </p>
        <p>
          Tre spørsmål å ha med seg gjennom hele kurset: hvordan <em>kan</em> en angriper
          kompromittere et nett, hvordan forsvarer vi oss, og — mest ambisiøst — kan vi designe
          arkitekturer som er immune fra starten? Det siste kalles <strong>security by design</strong>,
          samme idé som når en bygning planlegges for sikkerhet fra tegnebrettet, og er et aktivt
          forskningsfelt.
        </p>

        <LectureBeat>Hva en angriper kan gjøre</LectureBeat>
        <p>
          <strong>Avlytting.</strong> Anta at den som vil, kan få kopier av pakker som suser forbi
          på et delt medium — en trådløs kanal er det åpenbare eksempelet. Verktøyene finnes og er
          helt vanlige; <strong>Wireshark</strong> er den mest brukte, og du kommer til å bruke den
          selv for å se protokoller i aksjon.
        </p>
        <p>
          <strong>Forfalskning (spoofing).</strong> Anta også at en angriper kan sprøyte inn pakker
          med hvilket som helst innhold — for eksempel en pakke til A med falsk avsenderadresse som
          får den til å se ut som den kom fra B. Analogien er en phishing-e-post som utgir seg for å
          være banken din: du tror ikke på den, og et nettverksutstyr eller et program har like lite
          grunn til å tro på det en pakke <em>påstår</em> bare fordi pakken dukket opp.
        </p>
        <p>
          <strong>Tjenestenekt.</strong> Legg på så mye arbeid at en enhet knekker sammen: bombarder
          en HTTP-server med falske forespørsler, eller en ruter med pakker som krever
          spesialbehandling. Slikt gjøres gjerne ved først å bryte seg inn i mange verter rundt om i
          nettet og så la dem angripe koordinert — et <strong>DDoS</strong>-angrep.
        </p>

        <LectureBeat>Hva vi kan gjøre med det</LectureBeat>
        <p>
          Mot forfalskning: <strong>autentisering</strong> — bevis hvem du er før du får tjenesten.
          Et passord er den enkleste formen; SIM-kortet i mobilen din er en maskinvare-identitet.
          Mot avlytting: <strong>kryptering</strong> av innholdet. Mot manipulering underveis:{" "}
          <strong>digitale signaturer</strong>, som lar mottakeren vite både hvem dataene kom fra og
          at de ikke er endret på veien. Mot uautorisert bruk av ressurser:{" "}
          <strong>aksesskontroll</strong> — hvem får gjøre hva. Og til slutt{" "}
          <strong>brannmurer</strong>, spesialisert utstyr som står både i ytterkant og i kjernen og
          kan programmeres til å slippe bare bestemte brukere eller trafikktyper inn og ut.
        </p>
      </LectureNote>

      <LectureNote title="Historien i fem epoker">
        <p>
          Noen av prinsippene i dette faget er ferske. Andre hviler på forskning gjort for 60 år
          siden — 30 år før internettet i det hele tatt fantes. Og noen nettverksideer er eldre
          enn som så: telefonnettet er over hundre år gammelt og måtte løse svitsjing og ruting,
          og semafor-nettverk relesendte ende-til-ende-krypterte meldinger lenge før det igjen.
        </p>

        <LectureBeat>1961–72: pakkesvitsjing blir til</LectureBeat>
        <p>
          Telefonnettet dominerte, og det er <em>kretssvitsjet</em> — fornuftig nok, siden tale
          genereres med konstant rate. Men etter hvert som datamaskiner, særlig tidsdelte maskiner,
          ble viktige, ble spørsmålet: hvordan knytter vi maskiner sammen slik at geografisk spredte
          brukere kan dele dem? Den trafikken er <strong>burstete</strong> — aktivitet, så stillhet,
          så aktivitet.
        </p>
        <p>
          Den første artikkelen om pakkesvitsjing kom fra <strong>Leonard Kleinrock</strong>, som
          brukte køteori til å vise hvor effektivt pakkesvitsjing håndterer nettopp burstete trafikk.
          Rundt 1964 undersøkte <strong>Paul Baran</strong> pakkesvitsjing for militære nett, og ved
          National Physical Laboratory i England jobbet en tredje gruppe med de samme ideene — alle
          tre uvitende om hverandre. I 1967 la ARPA fram planen for <strong>ARPANET</strong>, verdens
          første pakkesvitsjede datanett og den direkte forfaren til internettet. I 1972 var den
          første vert-til-vert-protokollen (NCP) ferdig, <strong>Ray Tomlinson</strong> skrev det
          første e-postprogrammet, og nettet hadde vokst til 15 noder.
        </p>

        <LectureBeat>1972–80: mange nett, og ideen om å koble dem sammen</LectureBeat>
        <p>
          Flere frittstående pakkesvitsjede nett dukket opp: ALOHAnet mellom universitetene på
          Hawaii, et pakkesatellitt-nett og et pakkeradio-nett (forfaren til dagens mobile
          datanett), og franske Cyclades. Med fasit i hånd ser man at tiden var moden for en
          altomfattende arkitektur som kunne binde nett sammen.
        </p>
        <p>
          <strong>Vint Cerf</strong> og <strong>Bob Kahn</strong> publiserte i 1974 prinsippene for
          det de kalte <em>internetting</em> — å bygge et nettverk av nettverk. Fire punkter, og de
          definerer arkitekturen vi har i dag: <strong>minimalisme og autonomi</strong> (nett skal
          kunne kobles sammen uten interne endringer), <strong>best effort</strong> som
          tjenestemodell (pakker kan gå tapt eller bli forsinket), <strong>tilstandsløs ruting</strong>,
          og en gjennomgående <strong>desentralisert</strong> tilnærming til kontroll. I 1976 fant{" "}
          <strong>Bob Metcalfe</strong> opp Ethernet i doktoravhandlingen sin. Ved tiårsskiftet hadde
          ARPANET 200 noder.
        </p>

        <LectureBeat>1980-tallet: standardisering</LectureBeat>
        <p>
          Bitene som fortsatt bærer nettet falt på plass. TCP og IP ble standardisert tidlig på
          80-tallet. <strong>SMTP</strong> kom i 1982 og er fortsatt den definerende
          e-postprotokollen. <strong>DNS</strong> kom i 1983 for å oversette mellom lesbare navn og
          IP-adresser. Sent på tiåret kom de viktige utvidelsene til TCP for{" "}
          <strong>vertsbasert metningskontroll</strong> — at en avsender senker sendraten når den
          merker tap eller forsinkelse. Parallelt vokste universitetsnett fram: BITNET, CSNET, og fra
          1986 <strong>NSFNET</strong>, som endte som ryggrad for regionale nett. Ved tiårets slutt:
          rundt 100 000 verter.
        </p>

        <LectureBeat>1990-tallet: kommersialisering og weben</LectureBeat>
        <p>
          ARPANET ble lagt ned i 1991. NSFNET opphevet forbudet mot kommersiell bruk — fram til da
          var reklame rett og slett ikke tillatt på nettet — og ble selv lagt ned i 1995, mens
          kommersielle ISP-er overtok ryggradstrafikken. Og hovedbegivenheten:{" "}
          <strong>Tim Berners-Lee</strong> fant opp weben ved CERN, med HTML, HTTP, en webserver og
          en nettleser som de fire byggeklossene, bygget på hypertekst-ideer fra 1940-tallet. Fra
          1989 til 1999 gikk antall verter fra 100 000 til 50 millioner, og ryggradshastighetene fra
          noen få Mb/s til Gb/s.
        </p>

        <LectureBeat>2000 til i dag</LectureBeat>
        <p>
          Aggressiv utrulling av bredbånd i hjemmene, <strong>software-defined networking</strong>{" "}
          definert i 2008 (kapittel 5), stadig mer allestedsnærværende høyhastighets trådløst — først
          WiFi, så 4G og 5G. Innholdsleverandørene bygde sine <em>egne</em> globale ryggradsnett for
          å komme nær sluttbrukerne og omgå tier-1-nettene. Bedrifter flyttet tjenestene sine til
          skyen. Og smarttelefonen: <strong>siden 2017 er det flere mobile enn faste enheter koblet
          til internett</strong>.
        </p>
      </LectureNote>

      <LectureNote title="Hvem bruker internettet — og hvem styrer det?">
        <p>
          Av rundt 7,89 milliarder mennesker på planeten hadde nær 5 milliarder — cirka 62 % —
          internett-tilgang i 2022. I år 2000 var tallet 360 millioner, altså femtengangen på 22 år.
          Samtidig: <strong>tre milliarder mennesker er fortsatt ikke koblet til</strong>, og
          dekningen varierer kraftig — fra opp mot 100 % i Nord-Europa til langt lavere i deler av
          Afrika og Sørøst-Asia.
        </p>
        <p>
          Ja/nei-statistikk er grovkornet. De interessante spørsmålene ligger under:{" "}
          <strong>rimelighet</strong> (målet om 1 GB data for under 2 % av månedsinntekten nås bare
          av rundt halvparten av landene som måles), <strong>kjønnsgap</strong> i tilgang, og{" "}
          <em>meningsfull</em> tilgang — å faktisk kunne bruke nettet daglig, på en egnet enhet, med
          nok data og rask nok forbindelse. Der det digitale skillet i USA mellom by og bygd har
          krympet fra over 20 til rundt 6 prosentpoeng på ti år, har skillet mellom etniske grupper
          knapt beveget seg.
        </p>

        <LectureBeat>Styring i tre lag</LectureBeat>
        <p>
          Spørsmålet «hvem styrer internettet?» har ikke ett svar — det er hundretalls millioner av
          nett med hver sin lokale autonomi. Dette kalles en{" "}
          <strong>multi-stakeholder-situasjon</strong>: mange aktører med interesser som ofte er
          direkte motstridende. Dave Clark og kollegene hans døpte dragkampen mellom dem{" "}
          <em>the tussle</em>, og argumenterte for at nettopp den dragkampen er avgjørende for at
          nettet skal utvikle seg. Bryt spørsmålet ned i tre lag, så blir det håndterbart:{" "}
          <strong>teknisk infrastruktur</strong>, <strong>navn og numre</strong>, og{" "}
          <strong>innhold</strong>.
        </p>
        <p>
          <strong>Hvorfor standarder i det hele tatt?</strong> Tenk på strømuttak: i ett land
          fungerer enheten din overalt, men det finnes 15 ulike verdensstandarder, og derfor
          fungerer den <em>ikke</em> når du reiser. Eller jernbane: i 1860-årenes USA var det 20
          ulike sporvidder i drift, som betød at ett tog ikke kunne kjøre fra den ene enden av landet
          til den andre. Etter at selskapene satte seg ned sammen, var det innen 1886 én standard
          sporvidde — og de mange separate banene kunne fungere som ett sammenhengende nett.
          Analogien til et nettverk av nettverk skriver seg selv: tenk om en internett-pakke ikke
          kunne komme fra den ene enden av nettet til den andre.
        </p>
        <p>
          <strong>Lag 1 — teknikken.</strong> <strong>IETF</strong> beskriver seg selv som et stort,
          åpent, internasjonalt fellesskap av nettverksdesignere, operatører, leverandører og
          forskere; møtene er åpne, og standardene er de over 9000{" "}
          <strong>RFC</strong>-ene. <strong>3GPP</strong> — egentlig en allianse av sju
          standardorganer — setter standardene for 3G, 4G og 5G. <strong>IEEE</strong> står bak
          Ethernet-familien (802.3) og WiFi-familien (802.11). Og{" "}
          <strong>ITU</strong> er det eldste av dem alle, FN-særorgan siden 1949.
        </p>
        <p>
          <strong>Lag 2 — navn og numre.</strong> Her rår <strong>ICANN</strong>, en ideell
          multi-stakeholder-organisasjon fra 1998, opprettet for å internasjonalisere navngiving og
          adressering som tidligere lå under amerikanske myndigheter. At et universitets navn skal
          tilhøre universitetet er ukontroversielt — men skal et navn som ender på{" "}
          <em>.patagonia</em> tilhøre klesprodusenten eller regionen i Sør-Amerika? ICANN har
          regler for slike konflikter og en egen tvisteløsningsordning for misbruk. Og navn er
          verdifulle: domenet <em>voice.com</em> ble solgt for 30 millioner dollar i 2019. ICANN
          forvalter også IP-adresser og oversettelsen fra navn til adresse — som gjøres av DNS, som
          vi går løs på i neste kapittel.
        </p>
        <p>
          <strong>Lag 3 — innhold.</strong> Her er det økonomi, politikk og samfunn mer enn teknikk.{" "}
          <strong>Internet Governance Forum</strong>, sammenkalt av FNs generalsekretær, er ikke et
          besluttende organ, men et forum som skal informere og inspirere dem som{" "}
          <em>tar</em> beslutninger. Plattformene selv avgjør i praksis mye av hva du møter; i USA
          gir Section 230 nettplattformer et rettslig vern mot å bli behandlet som utgiver av det
          tredjeparter publiserer hos dem. Og til slutt myndighetene, som setter lover innenfor sine
          grenser.
        </p>
        <p>
          Det tekniske virkemiddelet er verdt å merke seg, for vi har allerede møtt boksen:{" "}
          <strong>brannmuren</strong>. En vanlig ruter har videresendingsregler; en brannmur kan i
          tillegg ha <em>blokkeringsregler</em> — «ikke videresend pakker med denne
          mål-IP-adressen», slik at ingen bak brannmuren når innholdet på den adressen. Mer
          inngripende varianter gjør <strong>deep packet inspection</strong>: de ser inn i selve
          pakken og bestemmer ut fra innholdet, for eksempel «ikke videresend pakker som inneholder
          denne frasen».
        </p>
      </LectureNote>
    </article>
  );
}

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

// ============================================================
// 1.7 — Eksamen-fokus
// ============================================================
function SectionEksamen() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="1.7" title="Eksamen-fokus" />

      <p className="text-muted-foreground">
        Komprimert studie-pakke for siste runde før eksamen. Bla deg ned: cheat sheet, en
        side-mot-side-tabell over de to svitsje-typene, et beslutningstre for
        transport-protokoll-valg, vanlige eksamen-fallgruver, og helt nederst en
        åtte-til-tolv-punkts liste du kan pugge i pausen rett før du går inn.
      </p>

      <Cheat tittel="Cheat sheet — det viktigste på én skjerm">
        <div className="space-y-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-cyan-700 dark:text-cyan-400 font-semibold mb-2">
              Nøkkelformler (visuelt)
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <FormulaCardTransSvg />
              <FormulaCardPropSvg />
              <FormulaCardBottleneckSvg />
              <FormulaCardIntensitySvg />
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-cyan-700 dark:text-cyan-400 font-semibold mb-2">
              Tall-å-huske
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <NumberCardLightFiberSvg />
              <NumberCardMTUSvg />
              <NumberCardGeoSatSvg />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 mt-2 text-[11px] text-muted-foreground">
              <div className="rounded border border-border bg-card p-2">
                <strong className="text-foreground">Bergen → New York:</strong> 5 700 km ⇒ d_prop ≈
                28 ms enveis, 56 ms RTT-min.
              </div>
              <div className="rounded border border-border bg-card p-2">
                <strong className="text-foreground">1 Gbit/s, 1500-byte pakke:</strong> d_trans = 12
                µs — utrolig kort.
              </div>
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-cyan-700 dark:text-cyan-400 font-semibold mb-2">
              Huskeregler
            </div>
            <ul className="space-y-1.5 text-[12px]">
              <li>
                <strong>BFE</strong> — «<u>B</u>ygges av lag, <u>F</u>orsinkelser i fire bidrag,{" "}
                <u>E</u>ndringer skjer via RFC».
              </li>
              <li>
                <strong>«Krets reserverer, pakke konkurrerer»</strong> — fanger forskjellen i fem
                ord.
              </li>
              <li>
                <strong>«Tap når kø er full»</strong> — pakke-svitsjing har ingen reservasjon, så
                fulle buffere dropper pakker. Tap er en konsekvens, ikke en feil.
              </li>
            </ul>
          </div>
        </div>
      </Cheat>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Sammenligning — krets-svitsjing vs pakke-svitsjing
        </h3>
        <div className="rounded bg-muted/20 p-3 mb-3">
          <CircuitVsPacketComparisonSvg />
        </div>
        <div className="grid gap-2 md:grid-cols-2 text-[12px]">
          <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 space-y-1.5">
            <div className="text-[10px] uppercase tracking-wider text-blue-700 dark:text-blue-400 font-semibold">
              Krets-svitsjing
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-400">+</span> Båndbredde reservert hele
              veien
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-400">+</span> Konstant forsinkelse,
              ingen kø under samtalen
            </div>
            <div>
              <span className="text-amber-700 dark:text-amber-400">−</span> Stille perioder sløses
              bort
            </div>
            <div>
              <span className="text-amber-700 dark:text-amber-400">−</span> Bryter helt ved
              enkeltfeil
            </div>
            <div className="text-muted-foreground pt-1 border-t border-blue-500/20">
              Brukes i fasttelefon, ISDN, dedikerte finans-linjer.
            </div>
          </div>
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-1.5">
            <div className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold">
              Pakke-svitsjing
            </div>
            <div>
              <span className="text-emerald-700 dark:text-emerald-400">+</span> Statistisk mux — høy
              kapasitets-utnyttelse
            </div>
            <div>
              <span className="text-emerald-700 dark:text-emerald-400">+</span> Robust: ruter rundt
              brutte lenker
            </div>
            <div>
              <span className="text-amber-700 dark:text-amber-400">−</span> Variabel forsinkelse
              (jitter)
            </div>
            <div>
              <span className="text-amber-700 dark:text-amber-400">−</span> Buffer-overflow drops;
              endene må re-sende
            </div>
            <div className="text-muted-foreground pt-1 border-t border-emerald-500/20">
              Hele internett, mobil, Zoom, Netflix — alt du faktisk bruker.
            </div>
          </div>
        </div>
      </div>

      <Illustration caption="Beslutningstre — gitt en ny app, hvilken transport-tjeneste passer best?">
        <BeslutningstreSvg />
      </Illustration>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Vanlige fallgruver på eksamen
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Fallgruve tittel="d_prop og d_trans er ikke det samme">
            <WarnIconPropVsTrans />
            <p>
              <code className="text-[11px]">d_trans</code> handler om hvor lang tid det tar å{" "}
              <em>dytte alle bitene ut</em> på lenken (avhenger av pakkelengde og lenke-rate).{" "}
              <code className="text-[11px]">d_prop</code> handler om hvor lang tid det tar for
              første bit å <em>rekke fram</em> til den andre enden (avhenger av avstand og
              signal-hastighet). På korte lenker med store pakker dominerer transmisjon; på lange
              lenker med små pakker dominerer propagasjon. Eksamen elsker å gi deg tall der den ene
              er ti ganger den andre.
            </p>
          </Fallgruve>

          <Fallgruve tittel="Throughput er ikke summen av lenkene">
            <WarnIconBottleneck />
            <p>
              Throughput end-to-end er <em>minimum</em> av lenke-ratene langs ruten, ikke summen og
              ikke gjennomsnittet. Hvis du har 1 Gbit/s hjemme, 10 Gbit/s i ISP-en og 100 Mbit/s på
              serveren, er taket 100 Mbit/s. Å legge til mer kapasitet et annet sted endrer{" "}
              <em>ingenting</em> før du fikser flaskehalsen.
            </p>
          </Fallgruve>

          <Fallgruve tittel="Lag-modellen krever ikke ekstra rutere">
            <WarnIconNoLayerRouter />
            <p>
              Studenter tror noen ganger at det må finnes en «transport-lag-ruter» eller et
              «applikasjons-lag-mellomledd». Det stemmer ikke. Lag er{" "}
              <em>en abstraksjon i programvaren</em> på samme maskin — pakken går gjennom alle fem
              lagene oppover i mottakeren og nedover i avsenderen, men rutere underveis ser bare ned
              til lag 3 (nettverk).
            </p>
          </Fallgruve>

          <Fallgruve tittel="Pakke-tap er normalt — ikke en feil">
            <WarnIconLossNormal />
            <p>
              Når en eksamen-oppgave forteller om «pakke-tap på 0,5 %», ikke skriv at «nettet er
              ødelagt». Tap er den normale signal-mekanismen for at en kø er full. TCP bruker det
              som signal for å bremse seg selv ned. Helt fri-for-tap krever krets-svitsjing, og det
              er nesten ingen som har det lenger.
            </p>
          </Fallgruve>

          <Fallgruve tittel="ISP-tier er en topologi, ikke en pris-klasse">
            <WarnIconTierTopology />
            <p>
              «Tier-1» betyr at en ISP når <em>hele</em> internett uten å betale noen andre for
              transit — det er et nettverks-topologisk faktum. Det sier <strong>ingenting</strong>{" "}
              om hvor mye sluttbrukeren betaler eller hvor rask aksess-linjen din er. Telenor Privat
              er en tier-3-aksess-ISP selv om Telenor-konsernet driver tier-1-backbone andre steder.
            </p>
          </Fallgruve>

          <Fallgruve tittel="Statistisk multipleksing er ikke det samme som TDM">
            <WarnIconTDMvsStat />
            <p>
              <em>Tids-multipleksing</em> (TDM, brukt i krets-svitsjing) gir hver bruker en fast,
              tilbakevendende tids-luke om hen har data å sende eller ikke.{" "}
              <em>Statistisk multipleksing</em> (pakke-svitsjing) lar en aktiv bruker bruke hele
              lenken når andre er stille. Hvis eksamen-oppgaven spør «hva tilsvarer
              tids-multipleksing?», er svaret <strong>krets-svitsjing</strong>, ikke
              pakke-svitsjing.
            </p>
          </Fallgruve>
        </div>
      </div>

      <Anker>
        <div className="text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold mb-2">
          5-minutter-anker — det aller mest grunnleggende
        </div>
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          <AnkerIconCard n={1} title="ISP-er av ISP-er">
            <IconISPs />
          </AnkerIconCard>
          <AnkerIconCard n={2} title="To perspektiver: HW + tjeneste">
            <IconTwoPerspectives />
          </AnkerIconCard>
          <AnkerIconCard n={3} title="Edge vs core">
            <IconEdgeCore />
          </AnkerIconCard>
          <AnkerIconCard n={4} title="Pakke-svitsjing vant">
            <IconPacketWon />
          </AnkerIconCard>
          <AnkerIconCard n={5} title="Fire forsinkelses-bidrag">
            <IconFourDelays />
          </AnkerIconCard>
          <AnkerIconCard n={6} title="Throughput = min(R)">
            <IconBottleneck />
          </AnkerIconCard>
          <AnkerIconCard n={7} title="Tap når kø er full">
            <IconLossFullQueue />
          </AnkerIconCard>
          <AnkerIconCard n={8} title="Fem lag, oppe → ned">
            <IconFiveLayers />
          </AnkerIconCard>
          <AnkerIconCard n={9} title="Modularitet: bytt ett lag">
            <IconModularity />
          </AnkerIconCard>
          <AnkerIconCard n={10} title="Innkapsling per lag">
            <IconEncapsulation />
          </AnkerIconCard>
          <AnkerIconCard n={11} title="Rutere ser bare L3">
            <IconRouterL3 />
          </AnkerIconCard>
          <AnkerIconCard n={12} title="Protokoll = avtalt format">
            <IconProtocol />
          </AnkerIconCard>
        </div>
      </Anker>

      <RelatedSlugs slugs={["osi-tcpip", "dte2507-day-in-the-life"]} />
    </article>
  );
}

// ============================================================
// Beslutningstre — SVG for eksamen-tab
// ============================================================
function BeslutningstreSvg() {
  return (
    <svg
      viewBox="0 0 720 380"
      className="w-full h-auto"
      role="img"
      aria-label="Beslutningstre for valg av transport-tjeneste"
    >
      <defs>
        <marker
          id="bt-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="currentColor" className="text-muted-foreground" />
        </marker>
      </defs>

      {/* Rot */}
      <g>
        <rect
          x="270"
          y="14"
          width="180"
          height="44"
          rx="8"
          className="fill-card stroke-brand"
          strokeWidth="1.5"
        />
        <text
          x="360"
          y="34"
          textAnchor="middle"
          className="fill-foreground"
          fontSize="12"
          fontWeight="600"
        >
          Ny app — hvilken
        </text>
        <text
          x="360"
          y="50"
          textAnchor="middle"
          className="fill-foreground"
          fontSize="12"
          fontWeight="600"
        >
          transport-tjeneste?
        </text>
      </g>

      {/* Spørsmål 1: sann-tid? */}
      <line
        x1="360"
        y1="58"
        x2="360"
        y2="84"
        className="stroke-muted-foreground"
        strokeWidth="1.5"
        markerEnd="url(#bt-arrow)"
      />
      <g>
        <rect
          x="260"
          y="84"
          width="200"
          height="36"
          rx="6"
          className="fill-muted/30 stroke-border"
          strokeWidth="1"
        />
        <text x="360" y="107" textAnchor="middle" className="fill-foreground" fontSize="11">
          Tåler appen små tap, men ikke forsinkelse?
        </text>
      </g>

      {/* Ja → UDP (venstre) */}
      <path
        d="M 290 120 Q 180 145 130 175"
        className="stroke-muted-foreground fill-none"
        strokeWidth="1.5"
        markerEnd="url(#bt-arrow)"
      />
      <text x="200" y="138" className="fill-muted-foreground" fontSize="10" fontStyle="italic">
        Ja (sann-tid)
      </text>
      <g>
        <rect
          x="60"
          y="178"
          width="140"
          height="44"
          rx="8"
          className="fill-amber-500/10 stroke-amber-500/50"
          strokeWidth="1.5"
        />
        <text
          x="130"
          y="200"
          textAnchor="middle"
          className="fill-foreground"
          fontSize="12"
          fontWeight="600"
        >
          UDP
        </text>
        <text x="130" y="214" textAnchor="middle" className="fill-muted-foreground" fontSize="10">
          tale, video, spill
        </text>
      </g>

      {/* Nei → spørsmål 2 (høyre/midt) */}
      <path
        d="M 430 120 Q 540 145 580 175"
        className="stroke-muted-foreground fill-none"
        strokeWidth="1.5"
        markerEnd="url(#bt-arrow)"
      />
      <text x="500" y="138" className="fill-muted-foreground" fontSize="10" fontStyle="italic">
        Nei
      </text>
      <g>
        <rect
          x="490"
          y="178"
          width="200"
          height="36"
          rx="6"
          className="fill-muted/30 stroke-border"
          strokeWidth="1"
        />
        <text x="590" y="201" textAnchor="middle" className="fill-foreground" fontSize="11">
          Trengs garantert pålitelig
        </text>
        <text x="590" y="213" textAnchor="middle" className="fill-foreground" fontSize="11">
          levering, i rekkefølge?
        </text>
      </g>

      {/* Ja → TCP */}
      <line
        x1="540"
        y1="214"
        x2="430"
        y2="252"
        className="stroke-muted-foreground"
        strokeWidth="1.5"
        markerEnd="url(#bt-arrow)"
      />
      <text x="455" y="240" className="fill-muted-foreground" fontSize="10" fontStyle="italic">
        Ja
      </text>
      <g>
        <rect
          x="330"
          y="254"
          width="140"
          height="44"
          rx="8"
          className="fill-emerald-500/10 stroke-emerald-500/50"
          strokeWidth="1.5"
        />
        <text
          x="400"
          y="276"
          textAnchor="middle"
          className="fill-foreground"
          fontSize="12"
          fontWeight="600"
        >
          TCP
        </text>
        <text x="400" y="290" textAnchor="middle" className="fill-muted-foreground" fontSize="10">
          web, e-post, fil-overføring
        </text>
      </g>

      {/* Nei → spørsmål 3 */}
      <line
        x1="640"
        y1="214"
        x2="640"
        y2="252"
        className="stroke-muted-foreground"
        strokeWidth="1.5"
        markerEnd="url(#bt-arrow)"
      />
      <text x="650" y="240" className="fill-muted-foreground" fontSize="10" fontStyle="italic">
        Nei
      </text>
      <g>
        <rect
          x="540"
          y="254"
          width="200"
          height="36"
          rx="6"
          className="fill-muted/30 stroke-border"
          strokeWidth="1"
        />
        <text x="640" y="277" textAnchor="middle" className="fill-foreground" fontSize="11">
          Skal én sender nå
        </text>
        <text x="640" y="289" textAnchor="middle" className="fill-foreground" fontSize="11">
          mange mottakere samtidig?
        </text>
      </g>

      {/* Ja → multicast/broadcast */}
      <line
        x1="600"
        y1="290"
        x2="540"
        y2="320"
        className="stroke-muted-foreground"
        strokeWidth="1.5"
        markerEnd="url(#bt-arrow)"
      />
      <text x="545" y="312" className="fill-muted-foreground" fontSize="10" fontStyle="italic">
        Ja, lokalt
      </text>
      <g>
        <rect
          x="430"
          y="322"
          width="160"
          height="44"
          rx="8"
          className="fill-purple-500/10 stroke-purple-500/50"
          strokeWidth="1.5"
        />
        <text
          x="510"
          y="344"
          textAnchor="middle"
          className="fill-foreground"
          fontSize="12"
          fontWeight="600"
        >
          Broadcast / multicast
        </text>
        <text x="510" y="358" textAnchor="middle" className="fill-muted-foreground" fontSize="10">
          LAN-discovery, IPTV
        </text>
      </g>

      {/* Nei → moderne stack (QUIC) */}
      <line
        x1="680"
        y1="290"
        x2="680"
        y2="320"
        className="stroke-muted-foreground"
        strokeWidth="1.5"
        markerEnd="url(#bt-arrow)"
      />
      <text x="688" y="312" className="fill-muted-foreground" fontSize="10" fontStyle="italic">
        Nei
      </text>
      <g>
        <rect
          x="600"
          y="322"
          width="120"
          height="44"
          rx="8"
          className="fill-cyan-500/10 stroke-cyan-500/50"
          strokeWidth="1.5"
        />
        <text
          x="660"
          y="344"
          textAnchor="middle"
          className="fill-foreground"
          fontSize="12"
          fontWeight="600"
        >
          QUIC
        </text>
        <text x="660" y="358" textAnchor="middle" className="fill-muted-foreground" fontSize="10">
          moderne web/HTTP/3
        </text>
      </g>
    </svg>
  );
}

// ============================================================
// Hjelpe-komponenter for eksamen-tab
// ============================================================
function Cheat({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-cyan-700 dark:text-cyan-400 font-semibold mb-1">
        Cheat sheet
      </div>
      <div className="font-semibold text-foreground mb-3">{tittel}</div>
      <div className="text-muted-foreground text-[13px]">{children}</div>
    </div>
  );
}

function Fallgruve({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-orange-500/40 bg-orange-500/5 p-3">
      <div className="text-[11px] font-semibold text-orange-700 dark:text-orange-400 mb-1 flex items-center gap-1">
        <span aria-hidden="true">⚠</span>
        <span>Pass på! {tittel}</span>
      </div>
      <div className="text-muted-foreground text-[12px] space-y-1.5">{children}</div>
    </div>
  );
}

function Anker({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold mb-1 flex items-center gap-1">
        <span aria-hidden="true">⚓</span>
        <span>Pugge-anker</span>
      </div>
      <div className="text-muted-foreground text-[13px]">{children}</div>
    </div>
  );
}

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

function Metafor({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-purple-700 dark:text-purple-400 font-semibold mb-1">
        Metafor
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

function HostRolesSvg() {
  return (
    <svg viewBox="0 0 400 200" className="w-full h-auto">
      <rect
        x={150}
        y={70}
        width={100}
        height={60}
        rx={6}
        className="fill-card stroke-foreground/60"
        strokeWidth={2}
      />
      <text
        x={200}
        y={95}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Én Macbook
      </text>
      <text x={200} y={112} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        i Bodø
      </text>
      {/* Spotify - klient */}
      <line x1={150} y1={85} x2={50} y2={30} className="stroke-brand" strokeWidth={1.5} />
      <rect
        x={5}
        y={15}
        width={90}
        height={28}
        rx={4}
        className="fill-brand/15 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={50} y={29} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        klient
      </text>
      <text x={50} y={40} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        → Spotify
      </text>
      {/* iCloud - klient */}
      <line x1={150} y1={100} x2={50} y2={100} className="stroke-brand" strokeWidth={1.5} />
      <rect
        x={5}
        y={86}
        width={90}
        height={28}
        rx={4}
        className="fill-brand/15 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={50} y={100} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        klient
      </text>
      <text x={50} y={111} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        → iCloud
      </text>
      {/* Server iPhone */}
      <line x1={250} y1={85} x2={350} y2={30} className="stroke-success" strokeWidth={1.5} />
      <rect
        x={305}
        y={15}
        width={90}
        height={28}
        rx={4}
        className="fill-success/15 stroke-success"
        strokeWidth={1.5}
      />
      <text x={350} y={29} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        server
      </text>
      <text x={350} y={40} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        ← iPhone
      </text>
      {/* Peer Wireguard */}
      <line x1={250} y1={115} x2={350} y2={170} className="stroke-amber-500" strokeWidth={1.5} />
      <rect
        x={305}
        y={155}
        width={90}
        height={28}
        rx={4}
        className="fill-amber-500/15 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text
        x={350}
        y={169}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-semibold"
      >
        peer
      </text>
      <text x={350} y={180} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        ↔ WireGuard
      </text>
      {/* AirDrop server-side */}
      <line x1={150} y1={115} x2={50} y2={170} className="stroke-success" strokeWidth={1.5} />
      <rect
        x={5}
        y={155}
        width={90}
        height={28}
        rx={4}
        className="fill-success/15 stroke-success"
        strokeWidth={1.5}
      />
      <text x={50} y={169} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        server
      </text>
      <text x={50} y={180} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        AirDrop-mottak
      </text>
    </svg>
  );
}

function AksessKartSvg() {
  const rader = [
    {
      teknologi: "FTTH (fiber hjem)",
      kapasitet: 95,
      forsink: 5,
      fill: "fill-success/40",
      stroke: "stroke-success",
    },
    {
      teknologi: "5G mobil",
      kapasitet: 70,
      forsink: 25,
      fill: "fill-brand/40",
      stroke: "stroke-brand",
    },
    {
      teknologi: "HFC (kabel-TV)",
      kapasitet: 55,
      forsink: 15,
      fill: "fill-amber-500/40",
      stroke: "stroke-amber-500",
    },
    {
      teknologi: "WiFi 6",
      kapasitet: 60,
      forsink: 10,
      fill: "fill-brand/40",
      stroke: "stroke-brand",
    },
    {
      teknologi: "ADSL",
      kapasitet: 20,
      forsink: 30,
      fill: "fill-destructive/40",
      stroke: "stroke-destructive",
    },
    {
      teknologi: "4G LTE",
      kapasitet: 40,
      forsink: 45,
      fill: "fill-amber-500/40",
      stroke: "stroke-amber-500",
    },
    {
      teknologi: "Starlink LEO",
      kapasitet: 50,
      forsink: 40,
      fill: "fill-brand/40",
      stroke: "stroke-brand",
    },
  ];
  return (
    <svg viewBox="0 0 500 240" className="w-full h-auto">
      <text x={20} y={15} className="fill-foreground text-[10px] font-semibold">
        Aksess-teknologi
      </text>
      <text x={250} y={15} className="fill-foreground text-[10px] font-semibold">
        Typisk kapasitet →
      </text>
      <text x={420} y={15} className="fill-foreground text-[10px] font-semibold">
        Forsinkelse
      </text>
      {rader.map((r) => {
        const y = 35 + rader.indexOf(r) * 28;
        return (
          <g key={r.teknologi}>
            <text x={20} y={y + 12} className="fill-foreground text-[10px]">
              {r.teknologi}
            </text>
            <rect
              x={150}
              y={y + 2}
              width={r.kapasitet * 2}
              height={16}
              className={`${r.fill} ${r.stroke}`}
              strokeWidth={1}
            />
            <text x={155 + r.kapasitet * 2} y={y + 13} className="fill-muted-foreground text-[9px]">
              {r.kapasitet}%
            </text>
            <rect
              x={420}
              y={y + 2}
              width={r.forsink}
              height={16}
              className="fill-destructive/30 stroke-destructive"
              strokeWidth={1}
            />
          </g>
        );
      })}
      <text x={250} y={230} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Norske aksess-teknologier rangert. FTTH dominerer både kapasitet og lav forsinkelse.
      </text>
    </svg>
  );
}

function KretsVsPakkeTabellSvg() {
  const rader = [
    { dim: "Båndbredde-garanti", krets: "Ja, dedikert", pakke: "Nei, deles" },
    { dim: "Kapasitets-utnyttelse", krets: "Lav (sløsing)", pakke: "Høy (mux)" },
    { dim: "Forsinkelse", krets: "Konstant", pakke: "Variabel (jitter)" },
    { dim: "Robust ved feil", krets: "Bryter samtalen", pakke: "Ruter rundt" },
  ];
  return (
    <svg viewBox="0 0 500 200" className="w-full h-auto">
      <rect
        x={15}
        y={15}
        width={150}
        height={25}
        rx={3}
        className="fill-card stroke-border"
        strokeWidth={1}
      />
      <text x={90} y={32} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        Dimensjon
      </text>
      <rect
        x={170}
        y={15}
        width={155}
        height={25}
        rx={3}
        className="fill-brand/15 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={247} y={32} textAnchor="middle" className="fill-brand text-[10px] font-semibold">
        Krets-svitsjing
      </text>
      <rect
        x={330}
        y={15}
        width={155}
        height={25}
        rx={3}
        className="fill-success/15 stroke-success"
        strokeWidth={1.5}
      />
      <text x={407} y={32} textAnchor="middle" className="fill-success text-[10px] font-semibold">
        Pakke-svitsjing
      </text>
      {rader.map((r, i) => {
        const y = 50 + i * 32;
        return (
          <g key={r.dim}>
            <rect
              x={15}
              y={y}
              width={150}
              height={28}
              rx={3}
              className="fill-muted/20 stroke-border"
              strokeWidth={1}
            />
            <text x={90} y={y + 18} textAnchor="middle" className="fill-foreground text-[10px]">
              {r.dim}
            </text>
            <rect
              x={170}
              y={y}
              width={155}
              height={28}
              rx={3}
              className="fill-brand/5 stroke-brand/40"
              strokeWidth={1}
            />
            <text
              x={247}
              y={y + 18}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {r.krets}
            </text>
            <rect
              x={330}
              y={y}
              width={155}
              height={28}
              rx={3}
              className="fill-success/5 stroke-success/40"
              strokeWidth={1}
            />
            <text
              x={407}
              y={y + 18}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {r.pakke}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function QueueDelayCurveSvg() {
  // M/M/1 d_kø ∝ ρ/(1-ρ). Trekk pseudo-kurven.
  const points: string[] = [];
  for (let i = 0; i <= 95; i += 3) {
    const rho = i / 100;
    const d = rho / (1 - rho);
    const x = 30 + rho * 420;
    const y = 180 - Math.min(d * 8, 150);
    points.push(`${x},${y}`);
  }
  return (
    <svg viewBox="0 0 500 220" className="w-full h-auto">
      <text
        x={250}
        y={15}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Gjennomsnittlig kø-forsinkelse vs trafikk-intensitet ρ
      </text>
      {/* Akser */}
      <line x1={30} y1={30} x2={30} y2={180} className="stroke-foreground/60" strokeWidth={1.5} />
      <line x1={30} y1={180} x2={470} y2={180} className="stroke-foreground/60" strokeWidth={1.5} />
      {/* Aksetekst */}
      <text
        x={5}
        y={100}
        className="fill-muted-foreground text-[9px]"
        transform="rotate(-90 5 100)"
      >
        d_kø
      </text>
      <text x={250} y={205} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        ρ (trafikk-intensitet)
      </text>
      {/* Skala */}
      {[0, 0.25, 0.5, 0.75, 0.9, 0.99].map((rho) => (
        <g key={rho}>
          <line
            x1={30 + rho * 420}
            y1={180}
            x2={30 + rho * 420}
            y2={185}
            className="stroke-foreground/60"
            strokeWidth={1}
          />
          <text
            x={30 + rho * 420}
            y={196}
            textAnchor="middle"
            className="fill-muted-foreground text-[8px]"
          >
            {rho}
          </text>
        </g>
      ))}
      {/* Kurven */}
      <polyline points={points.join(" ")} fill="none" className="stroke-brand" strokeWidth={2} />
      {/* Sone-markeringer */}
      <rect x={30} y={30} width={336} height={150} className="fill-success/5" />
      <rect x={366} y={30} width={62} height={150} className="fill-amber-500/10" />
      <rect x={428} y={30} width={42} height={150} className="fill-destructive/10" />
      <text x={198} y={50} textAnchor="middle" className="fill-success text-[9px] font-semibold">
        Sunt nett (ρ &lt; 0.8)
      </text>
      <text
        x={397}
        y={50}
        textAnchor="middle"
        className="fill-amber-600 dark:fill-amber-400 text-[8px]"
      >
        Press
      </text>
      <text x={449} y={50} textAnchor="middle" className="fill-destructive text-[8px]">
        Sprenger
      </text>
    </svg>
  );
}

// ============================================================
// NYE SVG-illustrasjoner (lagt til for tekst-redusering)
// ============================================================

// 1.1 — Mini-ikon for ruter (en boks med inn/ut-piler)
function RouterIconSvg() {
  return (
    <svg
      viewBox="0 0 240 120"
      className="w-full h-auto"
      role="img"
      aria-label="Ruter med inn- og ut-piler"
    >
      <rect
        x={80}
        y={35}
        width={80}
        height={50}
        rx={8}
        className="fill-brand/15 stroke-brand"
        strokeWidth={2}
      />
      <text
        x={120}
        y={58}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Ruter
      </text>
      <text x={120} y={72} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        leser IP-header
      </text>
      {/* Inn-piler */}
      <line
        x1={10}
        y1={45}
        x2={75}
        y2={50}
        className="stroke-amber-500"
        strokeWidth={2}
        markerEnd="url(#ri-arr)"
      />
      <line
        x1={10}
        y1={75}
        x2={75}
        y2={70}
        className="stroke-amber-500"
        strokeWidth={2}
        markerEnd="url(#ri-arr)"
      />
      {/* Ut-piler */}
      <line
        x1={165}
        y1={50}
        x2={230}
        y2={40}
        className="stroke-success"
        strokeWidth={2}
        markerEnd="url(#ri-arr)"
      />
      <line
        x1={165}
        y1={70}
        x2={230}
        y2={80}
        className="stroke-success"
        strokeWidth={2}
        markerEnd="url(#ri-arr)"
      />
      <defs>
        <marker
          id="ri-arr"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" className="fill-foreground" />
        </marker>
      </defs>
      <text x={42} y={32} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        inn
      </text>
      <text x={198} y={32} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        ut
      </text>
    </svg>
  );
}

// 1.1 — Protokoll-håndtrykk (mini)
function ProtocolHandshakeSvg() {
  const steps: { y: number; txt: string; dir: "r" | "l"; cls: string }[] = [
    { y: 60, txt: "1. SYN", dir: "r", cls: "stroke-brand" },
    { y: 80, txt: "2. SYN-ACK", dir: "l", cls: "stroke-success" },
    { y: 100, txt: "3. ACK", dir: "r", cls: "stroke-brand" },
    { y: 120, txt: "4. HTTP GET /", dir: "r", cls: "stroke-amber-500" },
    { y: 140, txt: "5. HTTP 200 OK", dir: "l", cls: "stroke-success" },
  ];
  return (
    <svg
      viewBox="0 0 400 160"
      className="w-full h-auto"
      role="img"
      aria-label="Protokoll som dansetrinn — to maskiner i avtalt rekkefølge"
    >
      <rect
        x={20}
        y={20}
        width={70}
        height={32}
        rx={4}
        className="fill-brand/15 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={55} y={40} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        Klient
      </text>
      <rect
        x={310}
        y={20}
        width={70}
        height={32}
        rx={4}
        className="fill-success/15 stroke-success"
        strokeWidth={1.5}
      />
      <text
        x={345}
        y={40}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Server
      </text>
      {steps.map((s, i) => (
        <g key={i}>
          {s.dir === "r" ? (
            <line
              x1={92}
              y1={s.y}
              x2={308}
              y2={s.y}
              className={s.cls}
              strokeWidth={1.5}
              markerEnd="url(#ph-arr)"
            />
          ) : (
            <line
              x1={308}
              y1={s.y}
              x2={92}
              y2={s.y}
              className={s.cls}
              strokeWidth={1.5}
              markerEnd="url(#ph-arr)"
            />
          )}
          <text
            x={200}
            y={s.y - 3}
            textAnchor="middle"
            className="fill-foreground text-[9px] font-mono"
          >
            {s.txt}
          </text>
        </g>
      ))}
      <defs>
        <marker
          id="ph-arr"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" className="fill-foreground" />
        </marker>
      </defs>
    </svg>
  );
}

// 1.1 — Example timeline: forespørselen til vg.no
function VgRequestTimelineSvg() {
  const steps = [
    { x: 50, label: "DNS", note: "vg.no → 195.88.55.16", cls: "fill-brand/20 stroke-brand" },
    { x: 145, label: "TCP", note: "3-veis håndtrykk", cls: "fill-success/20 stroke-success" },
    { x: 240, label: "TLS", note: "kryptert kanal", cls: "fill-amber-500/20 stroke-amber-500" },
    { x: 335, label: "HTTP", note: "GET / → HTML", cls: "fill-destructive/20 stroke-destructive" },
    {
      x: 430,
      label: "60+ filer",
      note: "bilder, CSS, JS",
      cls: "fill-purple-500/20 stroke-purple-500",
    },
  ];
  return (
    <svg
      viewBox="0 0 500 140"
      className="w-full h-auto"
      role="img"
      aria-label="Stafett av protokoller når du henter vg.no"
    >
      <line
        x1={30}
        y1={70}
        x2={470}
        y2={70}
        className="stroke-muted-foreground/50"
        strokeWidth={1.5}
      />
      {steps.map((s, i) => (
        <g key={i}>
          <circle cx={s.x} cy={70} r={20} className={s.cls} strokeWidth={1.5} />
          <text
            x={s.x}
            y={73}
            textAnchor="middle"
            className="fill-foreground text-[10px] font-semibold"
          >
            {s.label}
          </text>
          <text x={s.x} y={104} textAnchor="middle" className="fill-muted-foreground text-[8px]">
            {s.note}
          </text>
          {i < steps.length - 1 && (
            <text
              x={s.x + 47.5}
              y={66}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              →
            </text>
          )}
        </g>
      ))}
      <text
        x={250}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Fem protokoller for én forsides-visning
      </text>
      <text x={250} y={130} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Tid fra «trykk Enter» til siden er ferdig lastet — typisk 1–3 sek
      </text>
    </svg>
  );
}

// 1.2 — Verdenskart med Bergen-NY linje
function WorldMapBergenNYSvg() {
  return (
    <svg
      viewBox="0 0 500 220"
      className="w-full h-auto"
      role="img"
      aria-label="Bergen til New York over Atlanteren"
    >
      {/* Stilisert Atlanterhav */}
      <rect x={0} y={0} width={500} height={220} className="fill-brand/5" />
      {/* Europa-omriss */}
      <path
        d="M 290 70 Q 320 60 350 80 Q 360 110 340 140 Q 310 150 290 130 Z"
        className="fill-success/20 stroke-success/50"
        strokeWidth={1.5}
      />
      <text x={320} y={108} textAnchor="middle" className="fill-foreground text-[9px]">
        Europa
      </text>
      {/* Nord-Amerika-omriss */}
      <path
        d="M 80 60 Q 130 50 170 75 Q 190 110 160 145 Q 110 155 80 130 Z"
        className="fill-amber-500/20 stroke-amber-500/50"
        strokeWidth={1.5}
      />
      <text x={130} y={108} textAnchor="middle" className="fill-foreground text-[9px]">
        USA
      </text>
      {/* Bergen */}
      <circle cx={300} cy={85} r={4} className="fill-brand" />
      <text x={300} y={76} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        Bergen
      </text>
      {/* NY */}
      <circle cx={150} cy={120} r={4} className="fill-destructive" />
      <text
        x={150}
        y={136}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-semibold"
      >
        New York
      </text>
      {/* Sjøkabel-bue */}
      <path
        d="M 300 85 Q 225 30 150 120"
        className="fill-none stroke-brand stroke-2"
        strokeDasharray="5 3"
      />
      <text x={225} y={48} textAnchor="middle" className="fill-brand text-[9px] font-semibold">
        5 700 km undersjøisk fiber
      </text>
      <text
        x={250}
        y={195}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-mono font-semibold"
      >
        d_prop = 5 700 km / (2·10⁸ m/s) ≈ 28 ms
      </text>
      <text x={250} y={210} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Minste rund-tid mellom Bergen og NY er 56 ms — lyset selv tar tiden
      </text>
    </svg>
  );
}

// 1.3 — Krets vs Pakke side-ved-side visualisering
function CircuitVsPacketComparisonSvg() {
  return (
    <svg
      viewBox="0 0 720 360"
      className="w-full h-auto"
      role="img"
      aria-label="Krets-svitsjing vs pakke-svitsjing side ved side"
    >
      {/* Krets — øvre panel */}
      <rect
        x={10}
        y={10}
        width={700}
        height={160}
        rx={8}
        className="fill-brand/5 stroke-brand/40"
        strokeWidth={1.5}
      />
      <text x={20} y={28} className="fill-brand text-[11px] uppercase tracking-wider font-semibold">
        Krets-svitsjing — én reservert sti
      </text>
      <text x={20} y={42} className="fill-muted-foreground text-[9px]">
        Båndbredden er din alene til samtalen slutter — andre brukere må vente
      </text>
      {/* Telefon A */}
      <rect
        x={30}
        y={70}
        width={50}
        height={60}
        rx={4}
        className="fill-card stroke-brand"
        strokeWidth={1.5}
      />
      <text x={55} y={94} textAnchor="middle" className="fill-foreground text-[9px]">
        📞
      </text>
      <text x={55} y={112} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        A
      </text>
      {/* Telefon B */}
      <rect
        x={640}
        y={70}
        width={50}
        height={60}
        rx={4}
        className="fill-card stroke-brand"
        strokeWidth={1.5}
      />
      <text x={665} y={94} textAnchor="middle" className="fill-foreground text-[9px]">
        📞
      </text>
      <text
        x={665}
        y={112}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-semibold"
      >
        B
      </text>
      {/* Tre rutere */}
      {[200, 360, 520].map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={100} r={18} className="fill-brand/30 stroke-brand" strokeWidth={2} />
          <text x={x} y={104} textAnchor="middle" className="fill-foreground text-[9px]">
            R{i + 1}
          </text>
        </g>
      ))}
      {/* Reservert sti — tykk lysende linje */}
      <line x1={80} y1={100} x2={182} y2={100} className="stroke-brand" strokeWidth={5} />
      <line x1={218} y1={100} x2={342} y2={100} className="stroke-brand" strokeWidth={5} />
      <line x1={378} y1={100} x2={502} y2={100} className="stroke-brand" strokeWidth={5} />
      <line x1={538} y1={100} x2={640} y2={100} className="stroke-brand" strokeWidth={5} />
      {/* Blokkerte brukere */}
      <text x={360} y={150} textAnchor="middle" className="fill-destructive text-[9px] italic">
        ✗ Andre brukere blokkert — lenken er reservert
      </text>

      {/* Pakke — nedre panel */}
      <rect
        x={10}
        y={185}
        width={700}
        height={165}
        rx={8}
        className="fill-success/5 stroke-success/40"
        strokeWidth={1.5}
      />
      <text
        x={20}
        y={203}
        className="fill-success text-[11px] uppercase tracking-wider font-semibold"
      >
        Pakke-svitsjing — pakker fra mange kilder blandes
      </text>
      <text x={20} y={217} className="fill-muted-foreground text-[9px]">
        Ingen reservasjon — lenken deles statistisk, full kapasitet til den som har data nå
      </text>
      {/* Endene */}
      <rect
        x={30}
        y={245}
        width={50}
        height={60}
        rx={4}
        className="fill-card stroke-success"
        strokeWidth={1.5}
      />
      <text x={55} y={269} textAnchor="middle" className="fill-foreground text-[9px]">
        💻
      </text>
      <text x={55} y={287} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
        A
      </text>
      <rect
        x={640}
        y={245}
        width={50}
        height={60}
        rx={4}
        className="fill-card stroke-success"
        strokeWidth={1.5}
      />
      <text x={665} y={269} textAnchor="middle" className="fill-foreground text-[9px]">
        💻
      </text>
      <text
        x={665}
        y={287}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-semibold"
      >
        B
      </text>
      {/* Tre rutere */}
      {[200, 360, 520].map((x, i) => (
        <g key={i}>
          <circle
            cx={x}
            cy={275}
            r={18}
            className="fill-success/30 stroke-success"
            strokeWidth={2}
          />
          <text x={x} y={279} textAnchor="middle" className="fill-foreground text-[9px]">
            R{i + 1}
          </text>
        </g>
      ))}
      {/* Lenker (grå) */}
      <line
        x1={80}
        y1={275}
        x2={182}
        y2={275}
        className="stroke-muted-foreground/40"
        strokeWidth={2}
      />
      <line
        x1={218}
        y1={275}
        x2={342}
        y2={275}
        className="stroke-muted-foreground/40"
        strokeWidth={2}
      />
      <line
        x1={378}
        y1={275}
        x2={502}
        y2={275}
        className="stroke-muted-foreground/40"
        strokeWidth={2}
      />
      <line
        x1={538}
        y1={275}
        x2={640}
        y2={275}
        className="stroke-muted-foreground/40"
        strokeWidth={2}
      />
      {/* Pakker fra mange brukere */}
      {[
        { x: 100, cls: "fill-brand" },
        { x: 120, cls: "fill-amber-500" },
        { x: 140, cls: "fill-purple-500" },
        { x: 240, cls: "fill-success" },
        { x: 260, cls: "fill-brand" },
        { x: 280, cls: "fill-amber-500" },
        { x: 400, cls: "fill-purple-500" },
        { x: 420, cls: "fill-brand" },
        { x: 440, cls: "fill-amber-500" },
        { x: 560, cls: "fill-success" },
        { x: 580, cls: "fill-purple-500" },
        { x: 600, cls: "fill-brand" },
      ].map((p, i) => (
        <rect key={i} x={p.x} y={269} width={12} height={12} rx={1} className={p.cls} />
      ))}
      <text x={360} y={325} textAnchor="middle" className="fill-success text-[9px] italic">
        ✓ Ulike farger = ulike avsendere som deler samme lenker
      </text>
    </svg>
  );
}

// 1.3 — Store-and-forward timeline (Example 2)
function StoreForwardTimelineSvg() {
  return (
    <svg
      viewBox="0 0 500 200"
      className="w-full h-auto"
      role="img"
      aria-label="Store-and-forward over tre hopp"
    >
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        5 000-bits pakke over 3 hopp à 1 Mbps — total 15 ms
      </text>
      {/* Y-akse: hopp */}
      {["A→B", "B→C", "C→D"].map((label, i) => (
        <g key={i}>
          <text
            x={35}
            y={70 + i * 35}
            textAnchor="end"
            className="fill-muted-foreground text-[10px] font-mono"
          >
            {label}
          </text>
          {/* Tom track */}
          <rect
            x={50}
            y={58 + i * 35}
            width={420}
            height={18}
            rx={2}
            className="fill-muted/20 stroke-border"
            strokeWidth={0.8}
          />
          {/* Aktiv tid */}
          <rect
            x={50 + i * 140}
            y={58 + i * 35}
            width={140}
            height={18}
            rx={2}
            className={
              i === 0
                ? "fill-brand/40 stroke-brand"
                : i === 1
                  ? "fill-success/40 stroke-success"
                  : "fill-amber-500/40 stroke-amber-500"
            }
            strokeWidth={1}
          />
          <text
            x={120 + i * 140}
            y={71 + i * 35}
            textAnchor="middle"
            className="fill-foreground text-[9px] font-mono"
          >
            5 ms
          </text>
        </g>
      ))}
      {/* X-akse */}
      <line x1={50} y1={170} x2={470} y2={170} className="stroke-foreground/60" strokeWidth={1.2} />
      {[0, 5, 10, 15].map((t) => (
        <g key={t}>
          <line
            x1={50 + (t / 15) * 420}
            y1={170}
            x2={50 + (t / 15) * 420}
            y2={175}
            className="stroke-foreground/60"
            strokeWidth={1}
          />
          <text
            x={50 + (t / 15) * 420}
            y={186}
            textAnchor="middle"
            className="fill-muted-foreground text-[8px] font-mono"
          >
            {t} ms
          </text>
        </g>
      ))}
      <text x={250} y={196} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Hver ruter må motta hele pakken før den begynner å videresende
      </text>
    </svg>
  );
}

// 1.4 — Fire forsinkelses-stolper (proc, kø, trans, prop)
function FourDelaysBarsSvg() {
  const bars = [
    { label: "d_proc", value: 5, cls: "fill-amber-500/40 stroke-amber-500", desc: "ruter-CPU" },
    { label: "d_kø", value: 35, cls: "fill-brand/40 stroke-brand", desc: "ventetid" },
    { label: "d_trans", value: 15, cls: "fill-success/40 stroke-success", desc: "dytte bits ut" },
    {
      label: "d_prop",
      value: 60,
      cls: "fill-destructive/40 stroke-destructive",
      desc: "lys i fiber",
    },
  ];
  const maxV = 60;
  return (
    <svg
      viewBox="0 0 500 220"
      className="w-full h-auto"
      role="img"
      aria-label="Fire forsinkelses-bidrag som stolper"
    >
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Fire kilder til forsinkelse — relativ størrelse Bergen→NY
      </text>
      {bars.map((b, i) => {
        const x = 60 + i * 105;
        const h = (b.value / maxV) * 130;
        const y = 170 - h;
        return (
          <g key={b.label}>
            <rect x={x} y={y} width={70} height={h} rx={3} className={b.cls} strokeWidth={1.5} />
            <text
              x={x + 35}
              y={y - 6}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-mono font-semibold"
            >
              {b.value} ms*
            </text>
            <text
              x={x + 35}
              y={188}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-mono"
            >
              {b.label}
            </text>
            <text
              x={x + 35}
              y={202}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {b.desc}
            </text>
          </g>
        );
      })}
      <line x1={50} y1={170} x2={470} y2={170} className="stroke-foreground/60" strokeWidth={1.2} />
      <text x={250} y={216} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        *Illustrative tall — propagasjon dominerer på lange strekninger
      </text>
    </svg>
  );
}

// 1.5 — TCP/IP-stack som flagg-bygning (vertikal)
function StackFlagBuildingSvg() {
  const layers = [
    {
      name: "5. Applikasjon",
      note: "HTTP, DNS, SMTP — appens språk",
      fill: "fill-brand/25",
      stroke: "stroke-brand",
    },
    {
      name: "4. Transport",
      note: "TCP/UDP — portnumre, pålitelighet",
      fill: "fill-success/25",
      stroke: "stroke-success",
    },
    {
      name: "3. Nettverk",
      note: "IP — host-til-host via mange rutere",
      fill: "fill-amber-500/25",
      stroke: "stroke-amber-500",
    },
    {
      name: "2. Link",
      note: "Ethernet/WiFi — én hopp om gangen",
      fill: "fill-destructive/25",
      stroke: "stroke-destructive",
    },
    {
      name: "1. Fysisk",
      note: "Bits som lys, spenning, radio",
      fill: "fill-muted/40",
      stroke: "stroke-foreground/60",
    },
  ];
  return (
    <svg
      viewBox="0 0 500 290"
      className="w-full h-auto"
      role="img"
      aria-label="TCP/IP-stack som vertikalt bygg"
    >
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Stakken som bygning — appen bor i toppetasjen, fiberen i kjelleren
      </text>
      {/* Mast */}
      <line x1={250} y1={25} x2={250} y2={45} className="stroke-foreground/60" strokeWidth={2} />
      <circle cx={250} cy={25} r={4} className="fill-brand" />
      {layers.map((l, i) => {
        const y = 50 + i * 45;
        return (
          <g key={l.name}>
            <rect
              x={80}
              y={y}
              width={340}
              height={38}
              rx={4}
              className={`${l.fill} ${l.stroke}`}
              strokeWidth={1.5}
            />
            <text x={100} y={y + 16} className="fill-foreground text-[11px] font-semibold">
              {l.name}
            </text>
            <text x={100} y={y + 31} className="fill-muted-foreground text-[9px]">
              {l.note}
            </text>
            {/* Sidekant for å gi flagg-følelsen */}
            <polygon
              points={`80,${y} 70,${y + 19} 80,${y + 38}`}
              className={`${l.fill} ${l.stroke}`}
              strokeWidth={1.5}
            />
          </g>
        );
      })}
      <text x={250} y={282} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Hvert lag bruker tjenester fra laget under og tilbyr tjenester til laget over
      </text>
    </svg>
  );
}

// 1.5 — Innkapsling-matrjosjka
function MatryoshkaEncapsulationSvg() {
  return (
    <svg
      viewBox="0 0 500 200"
      className="w-full h-auto"
      role="img"
      aria-label="Innkapsling som russiske dukker"
    >
      <text
        x={250}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Innkapsling: hver lag pakker innholdet inn i sitt eget skall
      </text>
      {/* Ytre Eth */}
      <rect
        x={30}
        y={45}
        width={440}
        height={130}
        rx={8}
        className="fill-destructive/15 stroke-destructive"
        strokeWidth={1.5}
      />
      <text x={50} y={62} className="fill-destructive text-[10px] font-semibold">
        Eth-ramme
      </text>
      <text x={50} y={170} className="fill-muted-foreground text-[8px]">
        + 14 B header + 4 B trailer
      </text>
      {/* IP */}
      <rect
        x={70}
        y={75}
        width={360}
        height={85}
        rx={6}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={90} y={92} className="fill-amber-700 dark:fill-amber-400 text-[10px] font-semibold">
        IP-datagram
      </text>
      <text x={90} y={155} className="fill-muted-foreground text-[8px]">
        + 20 B header
      </text>
      {/* TCP */}
      <rect
        x={110}
        y={102}
        width={280}
        height={50}
        rx={5}
        className="fill-success/25 stroke-success"
        strokeWidth={1.5}
      />
      <text x={130} y={119} className="fill-success text-[10px] font-semibold">
        TCP-segment
      </text>
      <text x={130} y={147} className="fill-muted-foreground text-[8px]">
        + 20 B header
      </text>
      {/* App */}
      <rect
        x={150}
        y={125}
        width={200}
        height={20}
        rx={3}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1.5}
      />
      <text
        x={250}
        y={139}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        «hei» (30 B app-data)
      </text>
      <text x={250} y={192} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        30 B nyttig data → 88 B på lenken: 66 % er overhead
      </text>
    </svg>
  );
}

// Eksamen — Cheat-sheet visuelle kort (formel-bilder)
function FormulaCardTransSvg() {
  return (
    <svg
      viewBox="0 0 240 130"
      className="w-full h-auto"
      role="img"
      aria-label="Transmisjon-formel som diagram"
    >
      <rect
        x={2}
        y={2}
        width={236}
        height={126}
        rx={6}
        className="fill-success/5 stroke-success/40"
        strokeWidth={1}
      />
      <text
        x={120}
        y={20}
        textAnchor="middle"
        className="fill-success text-[10px] font-semibold uppercase tracking-wider"
      >
        d_trans
      </text>
      {/* Pakke som strekker seg ut */}
      <rect
        x={30}
        y={45}
        width={180}
        height={20}
        rx={3}
        className="fill-success/30 stroke-success"
        strokeWidth={1.2}
      />
      <text x={120} y={59} textAnchor="middle" className="fill-foreground text-[9px] font-mono">
        L bits
      </text>
      {/* Pil ned */}
      <line
        x1={120}
        y1={70}
        x2={120}
        y2={85}
        className="stroke-foreground/60"
        strokeWidth={1}
        markerEnd="url(#fct-arr)"
      />
      <text
        x={120}
        y={100}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-mono font-semibold"
      >
        L / R
      </text>
      <text x={120} y={115} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        bits delt på bit/s
      </text>
      <defs>
        <marker
          id="fct-arr"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" className="fill-foreground" />
        </marker>
      </defs>
    </svg>
  );
}

function FormulaCardPropSvg() {
  return (
    <svg
      viewBox="0 0 240 130"
      className="w-full h-auto"
      role="img"
      aria-label="Propagasjon-formel som diagram"
    >
      <rect
        x={2}
        y={2}
        width={236}
        height={126}
        rx={6}
        className="fill-destructive/5 stroke-destructive/40"
        strokeWidth={1}
      />
      <text
        x={120}
        y={20}
        textAnchor="middle"
        className="fill-destructive text-[10px] font-semibold uppercase tracking-wider"
      >
        d_prop
      </text>
      {/* Lang lenke */}
      <line x1={20} y1={55} x2={220} y2={55} className="stroke-foreground/60" strokeWidth={2} />
      <circle cx={20} cy={55} r={4} className="fill-brand" />
      <circle cx={220} cy={55} r={4} className="fill-success" />
      <text x={120} y={48} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        avstand d
      </text>
      {/* Bit som beveger seg */}
      <rect x={90} y={50} width={10} height={10} className="fill-amber-500" />
      <text
        x={120}
        y={86}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-mono font-semibold"
      >
        d / v
      </text>
      <text x={120} y={100} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        v ≈ 2·10⁸ m/s i fiber
      </text>
      <text x={120} y={118} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        Settes ikke ned med raskere ruter
      </text>
    </svg>
  );
}

function FormulaCardBottleneckSvg() {
  return (
    <svg
      viewBox="0 0 240 130"
      className="w-full h-auto"
      role="img"
      aria-label="Throughput-flaskehals som rør"
    >
      <rect
        x={2}
        y={2}
        width={236}
        height={126}
        rx={6}
        className="fill-brand/5 stroke-brand/40"
        strokeWidth={1}
      />
      <text
        x={120}
        y={20}
        textAnchor="middle"
        className="fill-brand text-[10px] font-semibold uppercase tracking-wider"
      >
        Throughput
      </text>
      {/* Tre rør, midten smalt */}
      <rect
        x={20}
        y={45}
        width={60}
        height={40}
        rx={4}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1.2}
      />
      <text x={50} y={68} textAnchor="middle" className="fill-foreground text-[8px] font-mono">
        1 Gbps
      </text>
      <rect
        x={90}
        y={58}
        width={60}
        height={15}
        rx={3}
        className="fill-destructive/40 stroke-destructive"
        strokeWidth={1.2}
      />
      <text x={120} y={68} textAnchor="middle" className="fill-foreground text-[7px] font-mono">
        100 Mbps
      </text>
      <rect
        x={160}
        y={50}
        width={60}
        height={30}
        rx={4}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1.2}
      />
      <text x={190} y={68} textAnchor="middle" className="fill-foreground text-[8px] font-mono">
        500 Mbps
      </text>
      <text
        x={120}
        y={100}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-mono font-semibold"
      >
        min(R₁, R₂, …)
      </text>
      <text x={120} y={118} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        smaleste rør setter taket
      </text>
    </svg>
  );
}

function FormulaCardIntensitySvg() {
  return (
    <svg
      viewBox="0 0 240 130"
      className="w-full h-auto"
      role="img"
      aria-label="Trafikk-intensitet ρ"
    >
      <rect
        x={2}
        y={2}
        width={236}
        height={126}
        rx={6}
        className="fill-amber-500/5 stroke-amber-500/40"
        strokeWidth={1}
      />
      <text
        x={120}
        y={20}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[10px] font-semibold uppercase tracking-wider"
      >
        Trafikk-intensitet ρ
      </text>
      {/* Beger som fylles */}
      <rect
        x={70}
        y={35}
        width={100}
        height={60}
        rx={3}
        className="fill-none stroke-foreground/60"
        strokeWidth={1.5}
      />
      <rect x={72} y={70} width={96} height={23} className="fill-amber-500/40" />
      <text x={120} y={86} textAnchor="middle" className="fill-foreground text-[9px] font-mono">
        ρ = 0.5
      </text>
      <text
        x={120}
        y={110}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-mono font-semibold"
      >
        L · a / R
      </text>
      <text x={120} y={122} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        ρ → 1: køen sprenger
      </text>
    </svg>
  );
}

// Cheat — tall-å-huske visuelle kort
function NumberCardLightFiberSvg() {
  return (
    <svg
      viewBox="0 0 240 100"
      className="w-full h-auto"
      role="img"
      aria-label="Lyshastighet i fiber"
    >
      <rect
        x={2}
        y={2}
        width={236}
        height={96}
        rx={6}
        className="fill-card stroke-border"
        strokeWidth={1}
      />
      <text
        x={120}
        y={20}
        textAnchor="middle"
        className="fill-muted-foreground text-[8px] uppercase tracking-wider"
      >
        Lys i fiber
      </text>
      <line x1={20} y1={50} x2={220} y2={50} className="stroke-foreground/60" strokeWidth={1.5} />
      <rect x={100} y={45} width={14} height={10} className="fill-amber-500" />
      <text
        x={120}
        y={75}
        textAnchor="middle"
        className="fill-foreground text-[14px] font-mono font-bold"
      >
        2·10⁸ m/s
      </text>
      <text x={120} y={90} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        = ⅔ av c
      </text>
    </svg>
  );
}

function NumberCardMTUSvg() {
  return (
    <svg viewBox="0 0 240 100" className="w-full h-auto" role="img" aria-label="MTU på Ethernet">
      <rect
        x={2}
        y={2}
        width={236}
        height={96}
        rx={6}
        className="fill-card stroke-border"
        strokeWidth={1}
      />
      <text
        x={120}
        y={20}
        textAnchor="middle"
        className="fill-muted-foreground text-[8px] uppercase tracking-wider"
      >
        MTU på Ethernet
      </text>
      <rect
        x={40}
        y={35}
        width={160}
        height={20}
        rx={2}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1.2}
      />
      <text x={120} y={49} textAnchor="middle" className="fill-foreground text-[8px] font-mono">
        1 ramme
      </text>
      <text
        x={120}
        y={75}
        textAnchor="middle"
        className="fill-foreground text-[14px] font-mono font-bold"
      >
        1 500 byte
      </text>
      <text x={120} y={89} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        = 12 000 bit, største urøvet
      </text>
    </svg>
  );
}

function NumberCardGeoSatSvg() {
  return (
    <svg
      viewBox="0 0 240 100"
      className="w-full h-auto"
      role="img"
      aria-label="Geostasjonær satellitt-forsinkelse"
    >
      <rect
        x={2}
        y={2}
        width={236}
        height={96}
        rx={6}
        className="fill-card stroke-border"
        strokeWidth={1}
      />
      <text
        x={120}
        y={16}
        textAnchor="middle"
        className="fill-muted-foreground text-[8px] uppercase tracking-wider"
      >
        Geo-satellitt enveis
      </text>
      <circle
        cx={120}
        cy={75}
        r={15}
        className="fill-success/30 stroke-success"
        strokeWidth={1.2}
      />
      <text x={120} y={79} textAnchor="middle" className="fill-foreground text-[7px]">
        Jord
      </text>
      <circle cx={120} cy={30} r={4} className="fill-amber-500" />
      <line
        x1={120}
        y1={60}
        x2={120}
        y2={34}
        className="stroke-foreground/60"
        strokeDasharray="2 2"
        strokeWidth={1}
      />
      <text x={155} y={47} className="fill-foreground text-[12px] font-mono font-bold">
        ≈ 120 ms
      </text>
      <text x={155} y={59} className="fill-muted-foreground text-[7px]">
        36 000 km opp
      </text>
    </svg>
  );
}

// 5-minutter-anker — 12 ikon-kort i grid (SVG-rad rendres som React-grid)
function AnkerIconCard({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-2 flex flex-col items-center text-center">
      <div className="text-[9px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold">
        #{n}
      </div>
      <div className="my-1 w-full">{children}</div>
      <div className="text-[10px] font-semibold text-foreground leading-tight">{title}</div>
    </div>
  );
}

function IconISPs() {
  return (
    <svg viewBox="0 0 80 50" className="w-full h-auto" role="img" aria-label="ISP-er av ISP-er">
      <circle cx={40} cy={12} r={6} className="fill-brand/30 stroke-brand" strokeWidth={1.2} />
      <circle cx={20} cy={30} r={5} className="fill-success/30 stroke-success" strokeWidth={1.2} />
      <circle cx={60} cy={30} r={5} className="fill-success/30 stroke-success" strokeWidth={1.2} />
      <circle
        cx={10}
        cy={42}
        r={3}
        className="fill-amber-500/40 stroke-amber-500"
        strokeWidth={1}
      />
      <circle
        cx={30}
        cy={42}
        r={3}
        className="fill-amber-500/40 stroke-amber-500"
        strokeWidth={1}
      />
      <circle
        cx={50}
        cy={42}
        r={3}
        className="fill-amber-500/40 stroke-amber-500"
        strokeWidth={1}
      />
      <circle
        cx={70}
        cy={42}
        r={3}
        className="fill-amber-500/40 stroke-amber-500"
        strokeWidth={1}
      />
      <line x1={40} y1={18} x2={20} y2={25} className="stroke-foreground/40" strokeWidth={0.8} />
      <line x1={40} y1={18} x2={60} y2={25} className="stroke-foreground/40" strokeWidth={0.8} />
    </svg>
  );
}

function IconTwoPerspectives() {
  return (
    <svg viewBox="0 0 80 50" className="w-full h-auto" role="img" aria-label="To perspektiver">
      <rect
        x={6}
        y={10}
        width={28}
        height={30}
        rx={3}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={1.2}
      />
      <text x={20} y={29} textAnchor="middle" className="fill-foreground text-[8px]">
        HW
      </text>
      <rect
        x={46}
        y={10}
        width={28}
        height={30}
        rx={3}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1.2}
      />
      <text x={60} y={29} textAnchor="middle" className="fill-foreground text-[8px]">
        app
      </text>
    </svg>
  );
}

function IconEdgeCore() {
  return (
    <svg viewBox="0 0 80 50" className="w-full h-auto" role="img" aria-label="Edge vs core">
      <circle
        cx={12}
        cy={25}
        r={5}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1.2}
      />
      <circle
        cx={68}
        cy={25}
        r={5}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1.2}
      />
      <circle cx={32} cy={25} r={4} className="fill-brand/30 stroke-brand" strokeWidth={1.2} />
      <circle cx={48} cy={25} r={4} className="fill-brand/30 stroke-brand" strokeWidth={1.2} />
      <line x1={17} y1={25} x2={28} y2={25} className="stroke-foreground/50" strokeWidth={1} />
      <line x1={36} y1={25} x2={44} y2={25} className="stroke-foreground/50" strokeWidth={1} />
      <line x1={52} y1={25} x2={63} y2={25} className="stroke-foreground/50" strokeWidth={1} />
    </svg>
  );
}

function IconPacketWon() {
  return (
    <svg viewBox="0 0 80 50" className="w-full h-auto" role="img" aria-label="Pakke-svitsjing vant">
      <rect x={10} y={20} width={10} height={10} className="fill-brand" />
      <rect x={24} y={20} width={10} height={10} className="fill-amber-500" />
      <rect x={38} y={20} width={10} height={10} className="fill-success" />
      <rect x={52} y={20} width={10} height={10} className="fill-purple-500" />
      <text x={40} y={45} textAnchor="middle" className="fill-success text-[8px] font-bold">
        ✓ vant
      </text>
    </svg>
  );
}

function IconFourDelays() {
  return (
    <svg
      viewBox="0 0 80 50"
      className="w-full h-auto"
      role="img"
      aria-label="Fire forsinkelses-bidrag"
    >
      <rect
        x={8}
        y={30}
        width={12}
        height={12}
        className="fill-amber-500/50 stroke-amber-500"
        strokeWidth={0.8}
      />
      <rect
        x={24}
        y={20}
        width={12}
        height={22}
        className="fill-brand/50 stroke-brand"
        strokeWidth={0.8}
      />
      <rect
        x={40}
        y={26}
        width={12}
        height={16}
        className="fill-success/50 stroke-success"
        strokeWidth={0.8}
      />
      <rect
        x={56}
        y={10}
        width={12}
        height={32}
        className="fill-destructive/50 stroke-destructive"
        strokeWidth={0.8}
      />
    </svg>
  );
}

function IconBottleneck() {
  return (
    <svg
      viewBox="0 0 80 50"
      className="w-full h-auto"
      role="img"
      aria-label="Throughput-flaskehals"
    >
      <rect
        x={5}
        y={15}
        width={20}
        height={20}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1}
      />
      <rect
        x={30}
        y={22}
        width={20}
        height={6}
        className="fill-destructive/40 stroke-destructive"
        strokeWidth={1}
      />
      <rect
        x={55}
        y={17}
        width={20}
        height={16}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1}
      />
    </svg>
  );
}

function IconLossFullQueue() {
  return (
    <svg
      viewBox="0 0 80 50"
      className="w-full h-auto"
      role="img"
      aria-label="Pakke-tap når kø er full"
    >
      <rect
        x={10}
        y={15}
        width={50}
        height={20}
        rx={2}
        className="fill-card stroke-border"
        strokeWidth={1}
      />
      <rect x={12} y={17} width={8} height={16} className="fill-brand" />
      <rect x={22} y={17} width={8} height={16} className="fill-amber-500" />
      <rect x={32} y={17} width={8} height={16} className="fill-success" />
      <rect x={42} y={17} width={8} height={16} className="fill-purple-500" />
      <rect x={52} y={17} width={8} height={16} className="fill-destructive" />
      <text x={70} y={29} className="fill-destructive text-[12px]">
        ✗
      </text>
    </svg>
  );
}

function IconFiveLayers() {
  return (
    <svg viewBox="0 0 80 50" className="w-full h-auto" role="img" aria-label="Fem lag">
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={15}
          y={6 + i * 8}
          width={50}
          height={6}
          className={
            [
              "fill-brand/30 stroke-brand",
              "fill-success/30 stroke-success",
              "fill-amber-500/30 stroke-amber-500",
              "fill-destructive/30 stroke-destructive",
              "fill-muted/40 stroke-foreground/50",
            ][i]
          }
          strokeWidth={0.8}
        />
      ))}
    </svg>
  );
}

function IconModularity() {
  return (
    <svg viewBox="0 0 80 50" className="w-full h-auto" role="img" aria-label="Modularitet">
      <rect
        x={10}
        y={10}
        width={20}
        height={10}
        className="fill-brand/30 stroke-brand"
        strokeWidth={0.8}
      />
      <rect
        x={10}
        y={22}
        width={20}
        height={10}
        className="fill-success/30 stroke-success"
        strokeWidth={0.8}
      />
      <rect
        x={10}
        y={34}
        width={20}
        height={10}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={0.8}
      />
      <line
        x1={32}
        y1={25}
        x2={48}
        y2={25}
        className="stroke-foreground/50"
        strokeWidth={1}
        markerEnd="url(#im-arr)"
      />
      <rect
        x={50}
        y={10}
        width={20}
        height={10}
        className="fill-brand/30 stroke-brand"
        strokeWidth={0.8}
      />
      <rect
        x={50}
        y={22}
        width={20}
        height={10}
        className="fill-success/30 stroke-success"
        strokeWidth={0.8}
      />
      <rect
        x={50}
        y={34}
        width={20}
        height={10}
        className="fill-purple-500/30 stroke-purple-500"
        strokeWidth={0.8}
      />
      <defs>
        <marker
          id="im-arr"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" className="fill-foreground" />
        </marker>
      </defs>
    </svg>
  );
}

function IconEncapsulation() {
  return (
    <svg viewBox="0 0 80 50" className="w-full h-auto" role="img" aria-label="Innkapsling">
      <rect
        x={5}
        y={10}
        width={70}
        height={30}
        rx={3}
        className="fill-destructive/15 stroke-destructive"
        strokeWidth={0.8}
      />
      <rect
        x={13}
        y={15}
        width={54}
        height={20}
        rx={2}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={0.8}
      />
      <rect
        x={21}
        y={20}
        width={38}
        height={10}
        rx={2}
        className="fill-success/25 stroke-success"
        strokeWidth={0.8}
      />
      <rect x={29} y={23} width={22} height={4} className="fill-brand" />
    </svg>
  );
}

function IconRouterL3() {
  return (
    <svg
      viewBox="0 0 80 50"
      className="w-full h-auto"
      role="img"
      aria-label="Rutere bare opp til lag 3"
    >
      <rect
        x={20}
        y={15}
        width={40}
        height={25}
        rx={3}
        className="fill-brand/15 stroke-brand"
        strokeWidth={1}
      />
      <text x={40} y={28} textAnchor="middle" className="fill-foreground text-[8px]">
        ruter
      </text>
      <text x={40} y={37} textAnchor="middle" className="fill-foreground text-[7px] font-mono">
        L3
      </text>
    </svg>
  );
}

function IconProtocol() {
  return (
    <svg viewBox="0 0 80 50" className="w-full h-auto" role="img" aria-label="Protokoll-avtale">
      <circle cx={18} cy={25} r={8} className="fill-brand/30 stroke-brand" strokeWidth={1} />
      <circle cx={62} cy={25} r={8} className="fill-success/30 stroke-success" strokeWidth={1} />
      <path
        d="M 26 22 L 54 22"
        className="stroke-foreground/60"
        strokeWidth={1.2}
        markerEnd="url(#ip-arr)"
      />
      <path
        d="M 54 30 L 26 30"
        className="stroke-foreground/60"
        strokeWidth={1.2}
        markerEnd="url(#ip-arr)"
      />
      <defs>
        <marker
          id="ip-arr"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" className="fill-foreground" />
        </marker>
      </defs>
    </svg>
  );
}

// Fallgruve-ikoner (små advarsel-ikoner)
function WarnIconPropVsTrans() {
  return (
    <svg viewBox="0 0 120 60" className="w-full h-auto" role="img" aria-label="d_prop vs d_trans">
      {/* d_trans: pakke strekker seg over kabel */}
      <line x1={5} y1={15} x2={55} y2={15} className="stroke-foreground/50" strokeWidth={1} />
      <rect
        x={10}
        y={11}
        width={40}
        height={8}
        className="fill-success/50 stroke-success"
        strokeWidth={0.8}
      />
      <text x={30} y={28} textAnchor="middle" className="fill-foreground text-[7px] font-mono">
        d_trans
      </text>
      {/* d_prop: én bit flyr */}
      <line x1={65} y1={15} x2={115} y2={15} className="stroke-foreground/50" strokeWidth={1} />
      <rect x={88} y={11} width={6} height={8} className="fill-destructive" />
      <text x={90} y={28} textAnchor="middle" className="fill-foreground text-[7px] font-mono">
        d_prop
      </text>
      <text
        x={60}
        y={50}
        textAnchor="middle"
        className="fill-orange-700 dark:fill-orange-400 text-[8px] font-semibold"
      >
        ulike fenomener
      </text>
    </svg>
  );
}

function WarnIconBottleneck() {
  return (
    <svg
      viewBox="0 0 120 60"
      className="w-full h-auto"
      role="img"
      aria-label="Throughput = min, ikke sum"
    >
      <rect
        x={5}
        y={18}
        width={25}
        height={24}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1}
      />
      <text x={17} y={32} textAnchor="middle" className="fill-foreground text-[7px] font-mono">
        1G
      </text>
      <rect
        x={35}
        y={26}
        width={25}
        height={8}
        className="fill-destructive/40 stroke-destructive"
        strokeWidth={1}
      />
      <text x={48} y={32} textAnchor="middle" className="fill-foreground text-[7px] font-mono">
        100M
      </text>
      <rect
        x={65}
        y={20}
        width={25}
        height={20}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1}
      />
      <text x={77} y={32} textAnchor="middle" className="fill-foreground text-[7px] font-mono">
        500M
      </text>
      <text
        x={60}
        y={55}
        textAnchor="middle"
        className="fill-orange-700 dark:fill-orange-400 text-[8px] font-semibold"
      >
        = 100 Mbps
      </text>
    </svg>
  );
}

function WarnIconNoLayerRouter() {
  return (
    <svg
      viewBox="0 0 120 60"
      className="w-full h-auto"
      role="img"
      aria-label="Lag er programvare, ikke ruter"
    >
      <rect
        x={20}
        y={10}
        width={80}
        height={10}
        className="fill-brand/30 stroke-brand"
        strokeWidth={0.8}
      />
      <rect
        x={20}
        y={22}
        width={80}
        height={10}
        className="fill-success/30 stroke-success"
        strokeWidth={0.8}
      />
      <rect
        x={20}
        y={34}
        width={80}
        height={10}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={0.8}
      />
      <text
        x={60}
        y={56}
        textAnchor="middle"
        className="fill-orange-700 dark:fill-orange-400 text-[8px] font-semibold"
      >
        kun i programvare
      </text>
    </svg>
  );
}

function WarnIconLossNormal() {
  return (
    <svg
      viewBox="0 0 120 60"
      className="w-full h-auto"
      role="img"
      aria-label="Pakke-tap er normal mekanisme"
    >
      <rect
        x={10}
        y={15}
        width={60}
        height={20}
        rx={2}
        className="fill-card stroke-border"
        strokeWidth={1}
      />
      <rect x={12} y={17} width={10} height={16} className="fill-brand" />
      <rect x={24} y={17} width={10} height={16} className="fill-amber-500" />
      <rect x={36} y={17} width={10} height={16} className="fill-success" />
      <rect x={48} y={17} width={10} height={16} className="fill-purple-500" />
      <rect x={60} y={17} width={10} height={16} className="fill-destructive" />
      <text x={86} y={28} className="fill-destructive text-[14px]">
        ✗
      </text>
      <text
        x={60}
        y={52}
        textAnchor="middle"
        className="fill-orange-700 dark:fill-orange-400 text-[8px] font-semibold"
      >
        kø-full → drop
      </text>
    </svg>
  );
}

function WarnIconTierTopology() {
  return (
    <svg
      viewBox="0 0 120 60"
      className="w-full h-auto"
      role="img"
      aria-label="Tier er topologi, ikke pris"
    >
      <ellipse
        cx={60}
        cy={15}
        rx={30}
        ry={5}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1}
      />
      <text x={60} y={18} textAnchor="middle" className="fill-foreground text-[6px]">
        tier-1
      </text>
      <ellipse
        cx={35}
        cy={32}
        rx={18}
        ry={4}
        className="fill-success/30 stroke-success"
        strokeWidth={1}
      />
      <ellipse
        cx={85}
        cy={32}
        rx={18}
        ry={4}
        className="fill-success/30 stroke-success"
        strokeWidth={1}
      />
      <text x={35} y={34} textAnchor="middle" className="fill-foreground text-[6px]">
        tier-2
      </text>
      <text x={85} y={34} textAnchor="middle" className="fill-foreground text-[6px]">
        tier-2
      </text>
      <text
        x={60}
        y={55}
        textAnchor="middle"
        className="fill-orange-700 dark:fill-orange-400 text-[8px] font-semibold"
      >
        ≠ pris-klasse
      </text>
    </svg>
  );
}

function WarnIconTDMvsStat() {
  return (
    <svg
      viewBox="0 0 120 60"
      className="w-full h-auto"
      role="img"
      aria-label="TDM vs statistisk mux"
    >
      {/* TDM: faste slots */}
      <rect
        x={5}
        y={10}
        width={50}
        height={18}
        className="fill-card stroke-border"
        strokeWidth={0.8}
      />
      <line x1={17} y1={10} x2={17} y2={28} className="stroke-foreground/50" strokeWidth={0.5} />
      <line x1={29} y1={10} x2={29} y2={28} className="stroke-foreground/50" strokeWidth={0.5} />
      <line x1={41} y1={10} x2={41} y2={28} className="stroke-foreground/50" strokeWidth={0.5} />
      <rect x={6} y={11} width={10} height={16} className="fill-brand" />
      <rect x={30} y={11} width={10} height={16} className="fill-amber-500" />
      <text x={30} y={40} textAnchor="middle" className="fill-foreground text-[7px]">
        TDM
      </text>
      {/* Stat */}
      <rect
        x={65}
        y={10}
        width={50}
        height={18}
        className="fill-card stroke-border"
        strokeWidth={0.8}
      />
      <rect x={66} y={11} width={8} height={16} className="fill-brand" />
      <rect x={74} y={11} width={8} height={16} className="fill-brand" />
      <rect x={82} y={11} width={8} height={16} className="fill-amber-500" />
      <rect x={90} y={11} width={8} height={16} className="fill-success" />
      <rect x={98} y={11} width={8} height={16} className="fill-brand" />
      <rect x={106} y={11} width={8} height={16} className="fill-purple-500" />
      <text x={90} y={40} textAnchor="middle" className="fill-foreground text-[7px]">
        stat
      </text>
      <text
        x={60}
        y={55}
        textAnchor="middle"
        className="fill-orange-700 dark:fill-orange-400 text-[8px] font-semibold"
      >
        ulike strategier
      </text>
    </svg>
  );
}

function FemLagSvg() {
  const lag = [
    {
      navn: "Applikasjon",
      eks: "HTTP, DNS, SMTP",
      pdu: "melding",
      fill: "fill-brand/15",
      stroke: "stroke-brand",
    },
    {
      navn: "Transport",
      eks: "TCP, UDP",
      pdu: "segment",
      fill: "fill-success/15",
      stroke: "stroke-success",
    },
    {
      navn: "Nettverk",
      eks: "IP, ICMP",
      pdu: "datagram",
      fill: "fill-amber-500/15",
      stroke: "stroke-amber-500",
    },
    {
      navn: "Link",
      eks: "Ethernet, WiFi",
      pdu: "ramme",
      fill: "fill-destructive/15",
      stroke: "stroke-destructive",
    },
    {
      navn: "Fysisk",
      eks: "Fiber, kobber, radio",
      pdu: "bit",
      fill: "fill-muted/40",
      stroke: "stroke-foreground/60",
    },
  ];
  return (
    <svg viewBox="0 0 500 280" className="w-full h-auto">
      <text
        x={250}
        y={15}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        TCP/IP-stakken: 5 lag, hvert med sin egen PDU
      </text>
      {lag.map((l, i) => {
        const y = 30 + i * 48;
        return (
          <g key={l.navn}>
            <rect
              x={50}
              y={y}
              width={400}
              height={40}
              rx={4}
              className={`${l.fill} ${l.stroke}`}
              strokeWidth={1.5}
            />
            <text x={70} y={y + 18} className="fill-foreground text-[11px] font-semibold">
              {i + 1}. {l.navn}
            </text>
            <text x={70} y={y + 33} className="fill-muted-foreground text-[9px]">
              Eks: {l.eks}
            </text>
            <text
              x={440}
              y={y + 18}
              textAnchor="end"
              className="fill-muted-foreground text-[9px] italic"
            >
              PDU:
            </text>
            <text
              x={440}
              y={y + 33}
              textAnchor="end"
              className="fill-foreground text-[10px] font-mono"
            >
              {l.pdu}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
